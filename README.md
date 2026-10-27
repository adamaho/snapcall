# Snapcall

Android-first poker puzzles, built on a pnpm workspace with Effect. The first game
mode is Hand Strength: each of five puzzles deals two hole cards and a complete
flop, turn, and river, and the player chooses the strongest five of those seven
cards. The server supports anonymous players, this five-puzzle round, immediate
feedback, stars, and whole-round replays. Attempts and best completed scores
persist in PostgreSQL.

The Android app currently shows a welcome screen; it has no Hand Strength game
UI yet. Connecting its generated API client to a game screen is the next step.

## Start the server

Use Node.js and pnpm at the versions in `package.json`, plus Docker Compose:

```bash
pnpm install --frozen-lockfile
cp programs/snapcall-server/.env.example programs/snapcall-server/.env
pnpm server:dev
```

This starts Snapcall's local Postgres on port `5435`, applies the player and round
migrations, and starts the server on `127.0.0.1:3001`.

```bash
curl http://127.0.0.1:3001/health
# {"data":{"status":"ok"}}
```

Swagger UI is at `/docs`; the generated contract is at `/openapi.json`.
`/health` reports server liveness, not database readiness. See the
[server API](programs/snapcall-server/README.md) for anonymous credentials and round endpoints.

## Android app

Open `programs/snapcall-android` in Android Studio and run `developmentDebug`, or:

```bash
cd programs/snapcall-android
./gradlew :app:assembleDevelopmentDebug
```

The welcome screen supports system light/dark themes and needs no server.
See the [Android setup guide](programs/snapcall-android/CONTRIBUTING.md) for
installation, build variants, and client generation.

## Workspace

- `clients/snapcall-server`: typed Effect client used by HTTP tests and consumers.
- `packages/core`: shared PostgreSQL layers and pool integration tests.
- `packages/snapcall-api`: shared Effect API contract and response schemas.
- `programs/snapcall-server`: HTTP implementation, runtime, migrations, and tests.
- `programs/snapcall-android`: native Compose app and generated Kotlin API client.
- `infra/local`: isolated local PostgreSQL Compose project.
- `tools/tsconfig`: shared TypeScript configuration.

Run `pnpm check` for formatting, lint, type checks, unit tests, and OpenAPI
drift checks. CI also builds the server container using `pnpm turbo run build image`.
Database tests need PostgreSQL and `TEST_DATABASE_URL`; see the
[server contributor guide](programs/snapcall-server/CONTRIBUTING.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) for repository conventions and
[requirements](https://github.com/adamaho/snapcall/issues/1) for the game direction.
