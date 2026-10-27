import { api } from "@snapcall/snapcall-api/api";
import { HttpApiClient } from "effect/http-api";

/**
 * Derives the Snapcall client from its HTTP API contract.
 *
 * @category constructors
 * @since 0.1.0
 */
export const make = (baseUrl: string) => HttpApiClient.make(api, { baseUrl });
