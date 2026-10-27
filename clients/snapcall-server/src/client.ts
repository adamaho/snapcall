import { api } from "@snapcall/snapcall-api/api";
import type { Redacted } from "effect";
import { HttpClient, HttpClientRequest } from "effect/http";
import { HttpApiClient } from "effect/http-api";

/**
 * Derives the Snapcall client from its HTTP API contract. Supply an anonymous
 * player's bearer token to access their rounds.
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (baseUrl: string, token?: Redacted.Redacted<string>) =>
  HttpApiClient.make(api, {
    baseUrl,
    transformClient:
      token === undefined ? undefined : HttpClient.mapRequest(HttpClientRequest.bearerToken(token)),
  });
