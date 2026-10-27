import { CurrentPlayer, PlayerAuth } from "@snapcall/snapcall-api/players";
import { Effect, Layer } from "effect";

import * as Players from "./service.ts";

/**
 * Resolves anonymous bearer credentials before running an owned round operation.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
  PlayerAuth,
  Effect.gen(function* () {
    const players = yield* Players.Service;
    return PlayerAuth.of({
      bearer: (httpEffect, { credential }) =>
        players
          .authenticate(credential)
          .pipe(
            Effect.flatMap((player) =>
              httpEffect.pipe(Effect.provideService(CurrentPlayer, player)),
            ),
          ),
    });
  }),
);
