import { Context, Schema } from "effect";
import { HttpApiMiddleware, HttpApiSecurity } from "effect/http-api";

/**
 * Anonymous player identity.
 *
 * @category models
 * @since 0.1.0
 */
export const PlayerId = Schema.String.check(Schema.isUUID()).annotate({
  identifier: "PlayerId",
});

/**
 * Anonymous player identity.
 *
 * @category models
 * @since 0.1.0
 */
export type PlayerId = typeof PlayerId.Type;

/**
 * Credentials returned once when an anonymous player is created.
 *
 * @category models
 * @since 0.1.0
 */
export const PlayerCredentials = Schema.Struct({
  playerId: PlayerId,
  token: Schema.String.annotate({
    description: "Save this bearer token to access this player's rounds on future requests.",
  }),
}).annotate({ identifier: "PlayerCredentials" });

/**
 * Credentials returned once when an anonymous player is created.
 *
 * @category models
 * @since 0.1.0
 */
export interface PlayerCredentials extends Schema.Schema.Type<typeof PlayerCredentials> {}

// Name the encoded error schemas for stable OpenAPI and generated client models.
/**
 * A bearer token is missing or does not identify an anonymous player.
 *
 * @category errors
 * @since 0.1.0
 */
export class Unauthorized extends Schema.Error<Unauthorized, { readonly brand: unique symbol }>(
  "Unauthorized",
)(Schema.TaggedStruct("Unauthorized", {}).annotate({ identifier: "Unauthorized" }), {
  httpApiStatus: 401,
  description: "A valid anonymous player bearer token is required.",
}) {}

/**
 * The server could not complete the operation; infrastructure details remain private.
 *
 * @category errors
 * @since 0.1.0
 */
export class InternalServerError extends Schema.Error<
  InternalServerError,
  { readonly brand: unique symbol }
>("InternalServerError")(
  Schema.TaggedStruct("InternalServerError", { message: Schema.String }).annotate({
    identifier: "InternalServerError",
  }),
  { httpApiStatus: 500, description: "The server could not complete the request." },
) {}

/**
 * Player identity supplied by bearer authentication, never by the request payload.
 *
 * @category services
 * @since 0.1.0
 */
export class CurrentPlayer extends Context.Service<CurrentPlayer, { readonly id: string }>()(
  "@snapcall/CurrentPlayer",
) {}

/**
 * Bearer authentication for player-owned round endpoints.
 *
 * @category services
 * @since 0.1.0
 */
export class PlayerAuth extends HttpApiMiddleware.Service<
  PlayerAuth,
  { provides: CurrentPlayer }
>()("@snapcall/PlayerAuth", {
  security: { bearer: HttpApiSecurity.bearer },
  error: [Unauthorized, InternalServerError],
}) {}
