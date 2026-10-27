# Snapcall server development

## Local setup

From the repository root:

```bash
pnpm install --frozen-lockfile
cp programs/snapcall-server/.env.example programs/snapcall-server/.env
pnpm server:dev
```

The root command starts the Compose database, runs migrations, and starts the
HTTP server in watch mode. Postgres uses localhost port `5435`, separate from
Goho. The server defaults to `127.0.0.1:3001` so both servers can run locally. Change `SNAPCALL_SERVER_HOST` and
`SNAPCALL_SERVER_PORT` in the server `.env` or environment when needed.

`DATABASE_URL` configures the migration command. `SNAPCALL_POSTGRES_PORT` is a
Compose environment variable; when overriding it, update `DATABASE_URL` to the
same port. The example credentials are for local development only.

```bash
curl http://127.0.0.1:3001/health
```

The response is `{"data":{"status":"ok"}}`. Like Goho, this endpoint checks
liveness only; a successful response does not establish database readiness.
The direct package `start` and `dev` commands do not run migrations.

## API contract and HTTP implementation

`packages/snapcall-api/src/api.ts` is authoritative. HTTP handlers live in
`src/http.ts`; `src/main.ts` wires the Node HTTP server and Effect runtime.
Tests derive a typed client from that same contract and use a real ephemeral
HTTP listener through `NodeHttpServer.layerTest`.

After changing the contract:

```bash
pnpm --filter @snapcall/snapcall-server openapi:generate
```

Commit `packages/snapcall-api/openapi.json`. `openapi:check` rejects stale output
without requiring a running server or database. Swagger UI is served at `/docs`.

## Database migrations

```bash
pnpm --filter @snapcall/infra-local infra:up
pnpm --filter @snapcall/snapcall-server db:migrate
```

`src/database/client.ts` owns the SQL pool configuration. The migration command
uses the same explicit `PgMigrator.fromRecord` registry as Goho, in
`src/database/migrations.ts`, with a `snapcall_migrations` ledger.

The registry starts empty because no game persistence model has been agreed.
Running it initializes the ledger; it does not invent player or puzzle tables.
To add the first migration:

1. Create `src/database/migrations/0001-feature-name.ts`, default-exporting an
   Effect that obtains `SqlClient.SqlClient` and executes transactional SQL.
2. Import it in the registry and add `"0001_feature_name": migrationEffect`.
3. Run the command twice to verify that the second run has no pending work.
4. Add an integration assertion for the resulting schema or behavior.

Migrations apply in numeric order. A failed pending batch rolls back; successful
migrations are recorded and are not reapplied. Never edit a migration after it
has run on a shared database. Add a new migration instead. There is no down
migration command. Deployment must explicitly run migrations before startup.

## Verification

```bash
pnpm check
pnpm --filter @snapcall/snapcall-server test:unit
```

Unit tests need no database. Integration tests use real PostgreSQL and create a
unique schema per test, dropping it when the test finishes. They exercise the
production migration registry and test-only migration fixtures, including
idempotence and rollback after a failed batch.

Use an isolated local test database:

```bash
COMPOSE_PROJECT_NAME=snapcall-test SNAPCALL_POSTGRES_PORT=5436 pnpm --filter @snapcall/infra-local infra:up
TEST_DATABASE_URL=postgresql://snapcall:snapcall@127.0.0.1:5436/snapcall pnpm test:integration
COMPOSE_PROJECT_NAME=snapcall-test pnpm --filter @snapcall/infra-local infra:down
```

CI uses the same Compose configuration on port `5433` and removes its own test
volume afterward. Do not point integration tests at a production database.
