# @snapcall/infra-local

PostgreSQL 18 for local Snapcall development and integration tests.

- `pnpm --filter=@snapcall/infra-local run infra:up` starts Postgres and waits for readiness.
- `pnpm --filter=@snapcall/infra-local run infra:down` stops the containers and keeps the data.
- `pnpm --filter=@snapcall/infra-local run infra:logs` follows service logs.
- `pnpm --filter=@snapcall/infra-local run infra:reset` removes the containers and local database data.

The default connection URL is `postgresql://snapcall:snapcall@127.0.0.1:5435/snapcall`.
The port is bound to localhost. Override `SNAPCALL_POSTGRES_PORT` when needed;
use the same port in `DATABASE_URL` and `TEST_DATABASE_URL`. CI uses port 5433
and a separate Compose project through `COMPOSE_PROJECT_NAME`.

The `snapcall-local` project and its named volume are independent of Goho and
the original template's database. Migrations initialize `snapcall_migrations`;
no application tables exist until their domain migrations are added.
