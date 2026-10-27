# @snapcall/snapcall-api

The shared Snapcall HTTP API contract. This package owns the public schemas and
Effect `HttpApi` value consumed by the server implementation and typed clients.
It depends only on Effect and contains no server infrastructure.

- `/api`: HTTP endpoint contract, starting with `GET /health` for server liveness.
- `/response`: shared successful response envelope, `{ data: payload }`.

The health response is `{ "data": { "status": "ok" } }`. It confirms server
liveness without checking the database or external services.
