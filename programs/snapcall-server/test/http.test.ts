import { NodeHttpServer } from "@effect/platform-node";
import { it } from "@effect/vitest";
import { api } from "@snapcall/snapcall-api/api";
import { Effect, Layer } from "effect";
import { HttpClient, HttpRouter } from "effect/http";
import { HttpApiClient } from "effect/http-api";
import { expect } from "vitest";

import * as Http from "#src/http.ts";

const TestLive = HttpRouter.serve(Http.layer).pipe(Layer.provideMerge(NodeHttpServer.layerTest));

it.effect("serves health through the shared API client without a database", () =>
  Effect.gen(function* () {
    const client = yield* HttpApiClient.make(api);
    expect(yield* client.health.check()).toEqual({ data: { status: "ok" } });
  }).pipe(Effect.provide(TestLive)),
);

it.effect("serves the public OpenAPI contract and interactive docs", () =>
  Effect.gen(function* () {
    const response = yield* HttpClient.get("/openapi.json");
    expect(response.status).toBe(200);
    expect(yield* response.json).toMatchObject({
      info: { title: "Snapcall API", version: "0.0.0" },
      paths: { "/health": { get: { operationId: "health.check" } } },
    });
    const docs = yield* HttpClient.get("/docs");
    expect(docs.status).toBe(200);
    expect(docs.headers["content-type"]).toContain("text/html");
    expect(yield* docs.text).toContain("swagger-ui");
  }).pipe(Effect.provide(TestLive)),
);

it.effect("returns not found for unknown routes", () =>
  Effect.gen(function* () {
    const response = yield* HttpClient.get("/missing");
    expect(response.status).toBe(404);
  }).pipe(Effect.provide(TestLive)),
);
