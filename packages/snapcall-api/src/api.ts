import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";

import { DataResponse } from "./response.ts";

/**
 * Snapcall server HTTP contract.
 *
 * @category models
 * @since 0.1.0
 */
export const api = HttpApi.make("snapcall-server")
  .annotate(OpenApi.Title, "Snapcall API")
  .annotate(OpenApi.Version, "0.0.0")
  .annotate(OpenApi.Description, "The shared HTTP contract for the Snapcall server.")
  .add(
    HttpApiGroup.make("health")
      .annotate(OpenApi.Description, "Server liveness.")
      .add(
        HttpApiEndpoint.get("check", "/health", {
          success: DataResponse(
            Schema.Struct({
              status: Schema.Literal("ok").annotate({
                description: "The server's liveness status.",
              }),
            }).annotate({
              identifier: "HealthData",
              description: "Whether the server is running.",
              examples: [{ status: "ok" }],
            }),
          ),
        })
          .annotate(OpenApi.Summary, "Check server liveness")
          .annotate(
            OpenApi.Description,
            "Confirms the server is running without querying the database or external services.",
          ),
      ),
  );
