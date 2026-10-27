import { InternalServerError } from "@snapcall/snapcall-api/players";
import {
  type AnswerResult,
  type RoundAttempt,
  type RoundConflict,
  type RoundNotFound,
  type SubmitAnswer,
} from "@snapcall/snapcall-api/rounds";
import { Context, Crypto, Effect, Layer } from "effect";

import * as Repository from "./repository.ts";
import * as Rules from "./rules.ts";

const unavailable = (error: { readonly _tag: string }) =>
  Effect.logError("Round operation failed", { errorType: error._tag }).pipe(
    Effect.andThen(
      Effect.fail(
        new InternalServerError({
          message: "Could not load or save this round. Please try again.",
        }),
      ),
    ),
  );

/**
 * Round operations scoped to the authenticated anonymous player.
 *
 * @category models
 * @since 0.1.0
 */
export interface Interface {
  readonly start: (
    playerId: string,
    requestId: string,
  ) => Effect.Effect<RoundAttempt, InternalServerError>;
  readonly get: (
    playerId: string,
    attemptId: string,
  ) => Effect.Effect<RoundAttempt, RoundNotFound | InternalServerError>;
  readonly answer: (
    playerId: string,
    attemptId: string,
    payload: SubmitAnswer,
  ) => Effect.Effect<AnswerResult, RoundNotFound | RoundConflict | InternalServerError>;
}

/**
 * Generates fresh attempts and keeps persistence details out of public failures.
 *
 * @category services
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
  "@snapcall/snapcall-server/Rounds",
) {}

/**
 * Round service backed by the repository and platform cryptography.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const repository = yield* Repository.Service;
    const crypto = yield* Crypto.Crypto;

    const start = Effect.fn("@snapcall/RoundService.start")(function* (
      playerId: string,
      requestId: string,
    ) {
      const attemptId = yield* crypto.randomUUIDv4();
      const puzzles = yield* Rules.generatePuzzles().pipe(
        Effect.provideService(Crypto.Crypto, crypto),
      );
      return yield* repository.start(playerId, requestId, attemptId, puzzles);
    }, Effect.catch(unavailable));

    const get = Effect.fn("@snapcall/RoundService.get")(
      (playerId: string, attemptId: string) => repository.get(playerId, attemptId),
      Effect.catchTag("SnapcallServer.RoundRepository.PersistenceError", unavailable),
    );

    const answer = Effect.fn("@snapcall/RoundService.answer")(
      (playerId: string, attemptId: string, payload: SubmitAnswer) =>
        repository.answer(playerId, attemptId, payload),
      Effect.catchTag("SnapcallServer.RoundRepository.PersistenceError", unavailable),
    );

    return Service.of({ start, get, answer });
  }),
);
