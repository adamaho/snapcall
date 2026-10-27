# @snapcall/snapcall-server

Effect HTTP implementation of `@snapcall/snapcall-api`, following Goho's server
layout. Node.js runs the TypeScript entry point directly.

- `GET /health`: `{"data":{"status":"ok"}}`, a database-independent liveness check.
- `GET /openapi.json`: generated from the shared API contract.
- `GET /docs`: Swagger UI.

See [CONTRIBUTING.md](CONTRIBUTING.md) for startup, configuration, migrations,
and unit and database integration tests.
