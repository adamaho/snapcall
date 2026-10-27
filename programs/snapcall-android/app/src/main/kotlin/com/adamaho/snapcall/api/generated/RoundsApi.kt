package com.adamaho.snapcall.api.generated

import com.adamaho.snapcall.api.generated.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Response
import okhttp3.RequestBody
import com.squareup.moshi.Json

import com.adamaho.snapcall.api.generated.model.InternalServerError
import com.adamaho.snapcall.api.generated.model.RoundConflict
import com.adamaho.snapcall.api.generated.model.RoundNotFound
import com.adamaho.snapcall.api.generated.model.RoundsAnswer200Response
import com.adamaho.snapcall.api.generated.model.RoundsGet200Response
import com.adamaho.snapcall.api.generated.model.RoundsStart200Response
import com.adamaho.snapcall.api.generated.model.StartAttempt
import com.adamaho.snapcall.api.generated.model.SubmitAnswer
import com.adamaho.snapcall.api.generated.model.Unauthorized

interface RoundsApi {
    /**
     * POST round-attempts/{attemptId}/answers
     * Answer the current puzzle
     * Accepts five distinct cards from the current puzzle and returns immediate feedback with the next puzzle or final result. Any selection tied with the strongest hand is correct. Repeating the same cards in any order returns the original feedback and the latest state without scoring twice. Cards not dealt in the puzzle, a different selection for an answered puzzle, or an out-of-order puzzle returns 409.
     * Responses:
     *  - 200: Success
     *  - 401: A valid anonymous player bearer token is required.
     *  - 404: This player has no attempt with the requested ID.
     *  - 409: The answer conflicts with the current attempt state.
     *  - 500: The server could not complete the request.
     *
     * @param attemptId 
     * @param submitAnswer 
     * @return [RoundsAnswer200Response]
     */
    @POST("round-attempts/{attemptId}/answers")
    suspend fun roundsAnswer(@Path("attemptId") attemptId: java.util.UUID, @Body submitAnswer: SubmitAnswer): Response<RoundsAnswer200Response>

    /**
     * GET round-attempts/{attemptId}
     * Get current round progress or results
     * Returns the current puzzle or completed result for an attempt owned by the authenticated player. Solutions are not included.
     * Responses:
     *  - 200: Success
     *  - 401: A valid anonymous player bearer token is required.
     *  - 404: This player has no attempt with the requested ID.
     *  - 500: The server could not complete the request.
     *
     * @param attemptId 
     * @return [RoundsGet200Response]
     */
    @GET("round-attempts/{attemptId}")
    suspend fun roundsGet(@Path("attemptId") attemptId: java.util.UUID): Response<RoundsGet200Response>

    /**
     * POST rounds/hand-strength/attempts
     * Start or replay the Hand Strength round
     * A new request ID creates five fresh seven-card deals. Repeating the same player&#39;s request ID returns the existing attempt without creating another.
     * Responses:
     *  - 200: Success
     *  - 401: A valid anonymous player bearer token is required.
     *  - 500: The server could not complete the request.
     *
     * @param startAttempt 
     * @return [RoundsStart200Response]
     */
    @POST("rounds/hand-strength/attempts")
    suspend fun roundsStart(@Body startAttempt: StartAttempt): Response<RoundsStart200Response>

}
