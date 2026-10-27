import { NodeHttpServer } from "@effect/platform-node";
import { it } from "@effect/vitest";
import * as Client from "@snapcall/snapcall-server-client/client";
import { Effect, Layer } from "effect";
import { HttpClient, HttpRouter } from "effect/http";
import { expect } from "vitest";

import * as Http from "#src/http.ts";
import * as Players from "#src/players/service.ts";
import * as Rounds from "#src/rounds/service.ts";

const TestLive = HttpRouter.serve(Http.layer).pipe(
  Layer.provide([Layer.mock(Players.Service, {}), Layer.mock(Rounds.Service, {})]),
  Layer.provideMerge(NodeHttpServer.layerTest),
);

it.effect("returns liveness through HTTP and the generated client without a database", () =>
  Effect.gen(function* () {
    const response = yield* HttpClient.get("/health");
    expect(response.status).toBe(200);
    expect(yield* response.json).toEqual({ data: { status: "ok" } });
    const client = yield* Client.make("");
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
