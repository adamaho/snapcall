import { api } from "@snapcall/snapcall-api/api";
import { withData } from "@snapcall/snapcall-api/response";
import { Effect, Layer } from "effect";
import { HttpMiddleware, HttpRouter } from "effect/http";
import { HttpApiBuilder, HttpApiSwagger } from "effect/http-api";

const HealthLive = HttpApiBuilder.group(api, "health", (handlers) =>
  handlers.handle("check", () => Effect.succeed(withData({ status: "ok" as const }))),
);

/**
 * Provides the API routes, generated OpenAPI document, and Swagger UI.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = HttpApiBuilder.layer(api, { openapiPath: "/openapi.json" }).pipe(
  Layer.provide(HealthLive),
  Layer.merge(HttpApiSwagger.layer(api, { path: "/docs" })),
  Layer.merge(
    HttpRouter.middleware(HttpMiddleware.cors({ allowedOrigins: () => false }), { global: true }),
  ),
);
