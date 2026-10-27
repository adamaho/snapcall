import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api";

import { InternalServerError, PlayerAuth, PlayerCredentials } from "./players.ts";
import { DataResponse } from "./response.ts";
import {
  AnswerResult,
  AttemptId,
  RoundAttempt,
  RoundConflict,
  RoundNotFound,
  StartAttempt,
  SubmitAnswer,
} from "./rounds.ts";

const strictPayload = { onExcessProperty: "error" } as const;

/**
 * Snapcall server HTTP contract.
 *
 * @category models
 * @since 0.1.0
 */
export const api = HttpApi.make("snapcall-server")
  .annotate(OpenApi.Title, "Snapcall API")
  .annotate(OpenApi.Version, "0.0.0")
  .annotate(OpenApi.Description, "Anonymous players and five-puzzle Hand Strength rounds.")
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
    HttpApiGroup.make("players")
      .annotate(OpenApi.Description, "Anonymous installation credentials.")
      .add(
        HttpApiEndpoint.post("create", "/players", {
          success: DataResponse(PlayerCredentials),
          error: InternalServerError,
        })
          .annotate(OpenApi.Summary, "Create an anonymous player")
          .annotate(
            OpenApi.Description,
            "Creates an anonymous player and returns a bearer token. Retain the token for future round requests.",
          ),
      ),
    HttpApiGroup.make("rounds")
      .annotate(
        OpenApi.Description,
        "Five-puzzle Hand Strength attempts: choose the strongest five of seven cards.",
      )
      .add(
        HttpApiEndpoint.post("start", "/rounds/hand-strength/attempts", {
          payload: StartAttempt,
          success: DataResponse(RoundAttempt),
        })
          .annotate(HttpApi.PayloadParseOptions, strictPayload)
          .annotate(OpenApi.Summary, "Start or replay the Hand Strength round")
          .annotate(
            OpenApi.Description,
            "A new request ID creates five fresh seven-card deals. Repeating the same player's request ID returns the existing attempt without creating another.",
          ),
      )
      .add(
        HttpApiEndpoint.get("get", "/round-attempts/:attemptId", {
          params: { attemptId: AttemptId },
          success: DataResponse(RoundAttempt),
          error: RoundNotFound,
        })
          .annotate(OpenApi.Summary, "Get current round progress or results")
          .annotate(
            OpenApi.Description,
            "Returns the current puzzle or completed result for an attempt owned by the authenticated player. Solutions are not included.",
          ),
      )
      .add(
        HttpApiEndpoint.post("answer", "/round-attempts/:attemptId/answers", {
          params: { attemptId: AttemptId },
          payload: SubmitAnswer,
          success: DataResponse(AnswerResult),
          error: [RoundNotFound, RoundConflict],
        })
          .annotate(HttpApi.PayloadParseOptions, strictPayload)
          .annotate(OpenApi.Summary, "Answer the current puzzle")
          .annotate(
            OpenApi.Description,
            "Accepts five distinct cards from the current puzzle and returns immediate feedback with the next puzzle or final result. Any selection tied with the strongest hand is correct. Repeating the same cards in any order returns the original feedback and the latest state without scoring twice. Cards not dealt in the puzzle, a different selection for an answered puzzle, or an out-of-order puzzle returns 409.",
          ),
      )
      .middleware(PlayerAuth),
  );
