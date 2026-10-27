package com.adamaho.snapcall.api.generated

import com.adamaho.snapcall.api.generated.infrastructure.CollectionFormats.*
import retrofit2.http.*
import retrofit2.Response
import okhttp3.RequestBody
import com.squareup.moshi.Json

import com.adamaho.snapcall.api.generated.model.HealthCheck200Response

interface HealthApi {
    /**
     * GET health
     * Check server liveness
     * Confirms the server is running without querying the database or external services.
     * Responses:
     *  - 200: Success
     *
     * @return [HealthCheck200Response]
     */
    @GET("health")
    suspend fun healthCheck(): Response<HealthCheck200Response>

}
