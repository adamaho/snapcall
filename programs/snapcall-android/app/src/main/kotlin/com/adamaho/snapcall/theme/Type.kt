package com.adamaho.snapcall.theme

import androidx.compose.material3.Typography
import androidx.compose.runtime.Immutable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import com.adamaho.snapcall.R

// Static Geist weights keep typography consistent on Android API 24 and newer.
val Geist =
    FontFamily(
        Font(R.font.geist_regular, FontWeight.Normal),
        Font(R.font.geist_medium, FontWeight.Medium),
        Font(R.font.geist_semibold, FontWeight.SemiBold),
    )

private const val PROPORTIONAL_NUMBERS = "'tnum' 0, 'pnum' 1"

@Immutable data class SnapcallTypography(val wordmark: TextStyle, val body: TextStyle)

val SnapcallType =
    SnapcallTypography(
        wordmark =
            TextStyle(
                fontFamily = Geist,
                fontWeight = FontWeight.SemiBold,
                fontSize = 32.sp,
                lineHeight = 36.sp,
                letterSpacing = (-0.035).em,
                fontFeatureSettings = PROPORTIONAL_NUMBERS,
            ),
        body =
            TextStyle(
                fontFamily = Geist,
                fontWeight = FontWeight.Normal,
                fontSize = 15.sp,
                lineHeight = 22.sp,
                letterSpacing = 0.sp,
                fontFeatureSettings = PROPORTIONAL_NUMBERS,
            ),
    )

internal val SnapcallMaterialTypography =
    Typography(
        displayLarge = SnapcallType.wordmark,
        displayMedium = SnapcallType.wordmark,
        displaySmall = SnapcallType.wordmark,
        headlineLarge = SnapcallType.wordmark,
        headlineMedium = SnapcallType.wordmark,
        headlineSmall = SnapcallType.wordmark,
        titleLarge = SnapcallType.wordmark,
        titleMedium = SnapcallType.wordmark,
        titleSmall = SnapcallType.body,
        bodyLarge = SnapcallType.body,
        bodyMedium = SnapcallType.body,
        bodySmall = SnapcallType.body,
        labelLarge = SnapcallType.body,
        labelMedium = SnapcallType.body,
        labelSmall = SnapcallType.body,
    )
