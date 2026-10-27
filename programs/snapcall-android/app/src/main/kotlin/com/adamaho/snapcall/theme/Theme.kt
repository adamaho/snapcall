package com.adamaho.snapcall.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

private val LocalSnapcallColors = staticCompositionLocalOf { SnapcallLightColors }

object SnapcallTheme {
    val colors: SnapcallColors
        @Composable get() = LocalSnapcallColors.current

    val type: SnapcallTypography
        get() = SnapcallType
}

@Composable
fun SnapcallTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val colors = if (darkTheme) SnapcallDarkColors else SnapcallLightColors
    CompositionLocalProvider(LocalSnapcallColors provides colors) {
        MaterialTheme(
            colorScheme = if (darkTheme) SnapcallDarkColorScheme else SnapcallLightColorScheme,
            typography = SnapcallMaterialTypography,
            content = content,
        )
    }
}

private val SnapcallLightColorScheme =
    lightColorScheme(
        background = SnapcallLightColors.background,
        onBackground = SnapcallLightColors.textPrimary,
        surface = SnapcallLightColors.background,
        onSurface = SnapcallLightColors.textPrimary,
        onSurfaceVariant = SnapcallLightColors.textSecondary,
        surfaceTint = Color.Transparent,
    )

private val SnapcallDarkColorScheme =
    darkColorScheme(
        background = SnapcallDarkColors.background,
        onBackground = SnapcallDarkColors.textPrimary,
        surface = SnapcallDarkColors.background,
        onSurface = SnapcallDarkColors.textPrimary,
        onSurfaceVariant = SnapcallDarkColors.textSecondary,
        surfaceTint = Color.Transparent,
    )
