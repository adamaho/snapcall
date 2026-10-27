package com.adamaho.snapcall.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

@Immutable
data class SnapcallColors(
    val background: Color,
    val textPrimary: Color,
    val textSecondary: Color,
)

val SnapcallDarkColors =
    SnapcallColors(
        background = Color(0xFF15141D),
        textPrimary = Color(0xFFF1EFF8),
        textSecondary = Color(0xFFBBB8CC),
    )

val SnapcallLightColors =
    SnapcallColors(
        background = Color(0xFFF5F4FD),
        textPrimary = Color(0xFF26233A),
        textSecondary = Color(0xFF5B5870),
    )
