package com.adamaho.snapcall.api.generated

import com.adamaho.snapcall.api.generated.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Response
import okhttp3.RequestBody
import com.squareup.moshi.Json

import com.adamaho.snapcall.api.generated.model.InternalServerError
import com.adamaho.snapcall.api.generated.model.PlayersCreate200Response

interface PlayersApi {
    /**
     * POST players
     * Create an anonymous player
     * Creates an anonymous player and returns a bearer token. Retain the token for future round requests.
     * Responses:
     *  - 200: Success
     *  - 500: The server could not complete the request.
     *
     * @return [PlayersCreate200Response]
     */
    @POST("players")
    suspend fun playersCreate(): Response<PlayersCreate200Response>

}
