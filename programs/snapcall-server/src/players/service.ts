import {
  InternalServerError,
  type PlayerCredentials,
  Unauthorized,
} from "@snapcall/snapcall-api/players";
import { Context, Crypto, Effect, Layer, Option, Redacted } from "effect";

import * as Repository from "./repository.ts";

/**
 * Anonymous player registration and bearer authentication operations.
 *
 * @category models
 * @since 0.1.0
 */
export interface Interface {
  readonly create: Effect.Effect<PlayerCredentials, InternalServerError>;
  readonly authenticate: (
    token: Redacted.Redacted<string>,
  ) => Effect.Effect<{ readonly id: string }, Unauthorized | InternalServerError>;
}

/**
 * Anonymous player registration and authentication service.
 *
 * @category services
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
  "@snapcall/snapcall-server/Players",
) {}

/**
 * Creates anonymous credentials and authenticates tokens against stored hashes.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const repository = yield* Repository.Service;
    const crypto = yield* Crypto.Crypto;

    const hashToken = (token: string) =>
      crypto
        .digest("SHA-256", new TextEncoder().encode(token))
        .pipe(Effect.map((bytes) => Buffer.from(bytes).toString("hex")));

    const create = Effect.gen(function* () {
      const playerId = yield* crypto.randomUUIDv4();
      const token = Buffer.from(yield* crypto.randomBytes(32)).toString("hex");
      const tokenHash = yield* hashToken(token);
      yield* repository.create(playerId, tokenHash);
      return { playerId, token };
    }).pipe(
      Effect.withSpan("@snapcall/Players.create"),
      Effect.mapError(() => new InternalServerError({ message: "Unable to create player." })),
    );

    const authenticate = Effect.fn("@snapcall/Players.authenticate")(function* (
      token: Redacted.Redacted<string>,
    ) {
      const value = Redacted.value(token);
      if (!/^[a-f0-9]{64}$/.test(value)) return yield* new Unauthorized({});
      const player = yield* hashToken(value).pipe(
        Effect.flatMap(repository.findByTokenHash),
        Effect.mapError(
          () => new InternalServerError({ message: "Unable to authenticate player." }),
        ),
      );
      if (Option.isNone(player)) return yield* new Unauthorized({});
      return player.value;
    });

    return Service.of({ create, authenticate });
  }),
);
