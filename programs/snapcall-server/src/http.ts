import { api } from "@snapcall/snapcall-api/api";
import { CurrentPlayer } from "@snapcall/snapcall-api/players";
import { withData } from "@snapcall/snapcall-api/response";
import { Effect, Layer } from "effect";
import { HttpMiddleware, HttpRouter } from "effect/http";
import { HttpApiBuilder, HttpApiSwagger } from "effect/http-api";

import * as PlayerAuth from "#src/players/auth.ts";
import * as Players from "#src/players/service.ts";
import * as Rounds from "#src/rounds/service.ts";

const HealthLive = HttpApiBuilder.group(api, "health", (handlers) =>
  handlers.handle("check", () => Effect.succeed(withData({ status: "ok" as const }))),
);

const PlayersLive = HttpApiBuilder.group(api, "players", (handlers) =>
  Effect.gen(function* () {
    const players = yield* Players.Service;
    return handlers.handle("create", () => players.create.pipe(Effect.map(withData)));
  }),
);

const RoundsLive = HttpApiBuilder.group(api, "rounds", (handlers) =>
  Effect.gen(function* () {
    const rounds = yield* Rounds.Service;
    return handlers
      .handle("start", ({ payload }) =>
        Effect.gen(function* () {
          const player = yield* CurrentPlayer;
          return withData(yield* rounds.start(player.id, payload.requestId));
        }),
      )
      .handle("get", ({ params }) =>
        Effect.gen(function* () {
          const player = yield* CurrentPlayer;
          return withData(yield* rounds.get(player.id, params.attemptId));
        }),
      )
      .handle("answer", ({ params, payload }) =>
        Effect.gen(function* () {
          const player = yield* CurrentPlayer;
          return withData(yield* rounds.answer(player.id, params.attemptId, payload));
        }),
      );
  }),
);

/**
 * Provides the API routes, generated OpenAPI document, and Swagger UI.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = HttpApiBuilder.layer(api, { openapiPath: "/openapi.json" }).pipe(
  Layer.provide(HealthLive),
  Layer.provide(PlayersLive),
  Layer.provide(RoundsLive),
  Layer.provide(PlayerAuth.layer),
  Layer.merge(HttpApiSwagger.layer(api, { path: "/docs" })),
  Layer.merge(
    HttpRouter.middleware(HttpMiddleware.cors({ allowedOrigins: () => false }), { global: true }),
  ),
);
