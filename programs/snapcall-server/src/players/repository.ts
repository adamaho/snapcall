import { PlayerId } from "@snapcall/snapcall-api/players";
import { Context, Effect, Layer, Option, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";

/**
 * Player persistence failed; the cause remains inside the server boundary.
 *
 * @category errors
 * @since 0.1.0
 */
export class PersistenceError extends Schema.TaggedError<
  PersistenceError,
  { readonly brand: unique symbol }
>()("SnapcallServer.PlayerRepository.PersistenceError", {
  operation: Schema.String,
  cause: Schema.Defect(),
}) {}

/**
 * Persistence operations for anonymous players and their token hashes.
 *
 * @category models
 * @since 0.1.0
 */
export interface Interface {
  readonly create: (id: string, tokenHash: string) => Effect.Effect<void, PersistenceError>;
  readonly findByTokenHash: (
    tokenHash: string,
  ) => Effect.Effect<Option.Option<{ readonly id: string }>, PersistenceError>;
}

/**
 * Anonymous player persistence service.
 *
 * @category services
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
  "@snapcall/snapcall-server/PlayerRepository",
) {}

/**
 * Stores anonymous players and resolves hashed bearer credentials in PostgreSQL.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const find = SqlSchema.findOneOption({
      Request: Schema.String,
      Result: Schema.Struct({ id: PlayerId }),
      execute: (hash) => sql`SELECT id FROM players WHERE token_hash = ${hash}`,
    });

    const create = Effect.fn("@snapcall/PlayerRepository.create")(
      (id: string, tokenHash: string) =>
        sql`INSERT INTO players (id, token_hash) VALUES (${id}, ${tokenHash})`.pipe(Effect.asVoid),
      Effect.mapError((cause) => new PersistenceError({ operation: "create", cause })),
    );

    const findByTokenHash = Effect.fn("@snapcall/PlayerRepository.findByTokenHash")(
      find,
      Effect.mapError((cause) => new PersistenceError({ operation: "findByTokenHash", cause })),
    );

    return Service.of({ create, findByTokenHash });
  }),
);
