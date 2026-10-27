# @snapcall/snapcall-server-client

The typed Effect client for the Snapcall server. The complete client is derived
from the shared `@snapcall/snapcall-api` contract by calling `make(baseUrl)`.

```ts
import { make } from "@snapcall/snapcall-server-client/client";
import { Effect } from "effect";
import { FetchHttpClient } from "effect/http";

const checkHealth = Effect.gen(function* () {
  const client = yield* make("http://127.0.0.1:3001");
  const response = yield* client.health.check();
  return response.data;
}).pipe(Effect.provide(FetchHttpClient.layer));
```

Call the effect from the consuming program's runtime. Requests are not automatically retried.

See the [server API reference](../../programs/snapcall-server/README.md) for
server liveness. The server exposes OpenAPI at `/openapi.json`
and Swagger UI at `/docs`.

Successful responses use the shared `{ data: ... }` envelope defined by
`@snapcall/snapcall-api` and re-exported from this package.
