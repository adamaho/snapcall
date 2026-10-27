# Snapcall

Android-first poker puzzles, built on a pnpm workspace with Effect. The current
foundation includes the shared HTTP API contract, Node.js server, PostgreSQL
setup, migrations, and automated checks.

## Start the server

Use Node.js and pnpm at the versions in `package.json`, plus Docker Compose:

```bash
pnpm install --frozen-lockfile
cp programs/snapcall-server/.env.example programs/snapcall-server/.env
pnpm server:dev
```

This starts Snapcall's local Postgres on port `5435`, initializes the migration
ledger, and starts the server on `127.0.0.1:3001`.

```bash
curl http://127.0.0.1:3001/health
# {"data":{"status":"ok"}}
```

Swagger UI is at `/docs`; the generated contract is at `/openapi.json`.
`/health` reports server liveness, not database readiness.

## Workspace

- `packages/snapcall-api`: shared Effect API contract and response schemas.
- `programs/snapcall-server`: HTTP implementation, runtime, migrations, and tests.
- `infra/local`: isolated local PostgreSQL Compose project.
- `tools/tsconfig`: shared TypeScript configuration.

Run `pnpm check` for formatting, lint, type checks, HTTP unit tests, and OpenAPI
drift checks. Database tests need PostgreSQL and `TEST_DATABASE_URL`; see the
[server contributor guide](programs/snapcall-server/CONTRIBUTING.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) for repository conventions and
[requirements](https://github.com/adamaho/snapcall/issues/1) for the game direction.
