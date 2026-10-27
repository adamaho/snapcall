// Snapcall Broadcast design tokens for Jetpack Compose.
// Reference implementation from the October 27, 2026 design handoff. It has not
// been compiled: merge it into programs/snapcall-android/.../theme/ and add the
// Barlow and Barlow Condensed font resources it names.
package com.adamaho.snapcall.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import com.adamaho.snapcall.R

// ---------- Color ----------

@Immutable
data class SnapcallColors(
    val background: Color,
    val spotlight: Color,
    val surface: Color,
    val surfaceKey: Color,
    val outline: Color,
    val tableFelt: Color,
    val tableGlow: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val textDim: Color,
    val onLight: Color,
    val card: Color,
    val cardInk: Color,
    val suitRed: Color,
    val right: Color, // right answers and teaching highlights only
    val wrong: Color, // wrong picks and retried hands only
    val scrim: Color,
)

val SnapcallBroadcastColors =
    SnapcallColors(
        background = Color(0xFF141414),
        spotlight = Color(0xFF202020),
        surface = Color(0xFF1E1E1E),
        surfaceKey = Color(0xFF2A2A2A),
        outline = Color(0xFF303030),
        tableFelt = Color(0xFF181818),
        tableGlow = Color(0xFF222222),
        textPrimary = Color(0xFFF2F2F2),
        textSecondary = Color(0xFFB8B8B8),
        textMuted = Color(0xFF9E9E9E),
        textDim = Color(0xFF8C8C8C),
        onLight = Color(0xFF141414),
        card = Color(0xFFFFFFFF),
        cardInk = Color(0xFF141414),
        suitRed = Color(0xFFD7263D),
        right = Color(0xFF4CC3FF),
        wrong = Color(0xFFE5672A),
        scrim = Color(0x80000000),
    )

// ---------- Type ----------

val BarlowCondensed =
    FontFamily(
        Font(R.font.barlow_condensed_semibold, FontWeight.SemiBold),
        Font(R.font.barlow_condensed_bold, FontWeight.Bold),
        Font(R.font.barlow_condensed_extrabold, FontWeight.ExtraBold),
        Font(R.font.barlow_condensed_extrabold_italic, FontWeight.ExtraBold, FontStyle.Italic),
    )

val Barlow =
    FontFamily(
        Font(R.font.barlow_regular, FontWeight.Normal),
        Font(R.font.barlow_medium, FontWeight.Medium),
    )

private const val TABULAR_NUMBERS = "'tnum' 1"

private fun display(size: Int, lineHeight: Int, tracking: Double = 0.0) =
    TextStyle(
        fontFamily = BarlowCondensed,
        fontWeight = FontWeight.ExtraBold,
        fontStyle = FontStyle.Italic,
        fontSize = size.sp,
        lineHeight = lineHeight.sp,
        letterSpacing = tracking.em,
        fontFeatureSettings = TABULAR_NUMBERS,
    )

private fun condensed(weight: FontWeight, size: Int, lineHeight: Int, tracking: Double) =
    TextStyle(
        fontFamily = BarlowCondensed,
        fontWeight = weight,
        fontSize = size.sp,
        lineHeight = lineHeight.sp,
        letterSpacing = tracking.em,
        fontFeatureSettings = TABULAR_NUMBERS,
    )

// Display, label, answer, button and chip text is rendered in caps by the components.
@Immutable
data class SnapcallTypography(
    val prompt: TextStyle,
    val score: TextStyle,
    val verdict: TextStyle,
    val handName: TextStyle,
    val answer: TextStyle,
    val button: TextStyle,
    val chip: TextStyle,
    val label: TextStyle,
    val cardRankBoard: TextStyle,
    val cardRankHole: TextStyle,
    val body: TextStyle,
)

val SnapcallType =
    SnapcallTypography(
        prompt = display(40, 37),
        score = display(96, 82),
        verdict = display(28, 44),
        handName = display(18, 30, 0.04),
        answer = condensed(FontWeight.Bold, 22, 28, 0.04),
        button = condensed(FontWeight.ExtraBold, 20, 24, 0.08),
        chip = condensed(FontWeight.ExtraBold, 15, 32, 0.06),
        label = condensed(FontWeight.Bold, 12, 16, 0.16),
        cardRankBoard = condensed(FontWeight.Bold, 26, 24, 0.0),
        cardRankHole = condensed(FontWeight.Bold, 40, 36, 0.0),
        body =
            TextStyle(
                fontFamily = Barlow,
                fontWeight = FontWeight.Normal,
                fontSize = 16.sp,
                lineHeight = 22.sp,
                letterSpacing = 0.sp,
            ),
    )

// ---------- Shape, spacing and size ----------

object SnapcallSpacing {
    val screenMargin = 20.dp
    val sectionGap = 18.dp
    val buttonCorner = 4.dp
    val boardCardCorner = 5.dp
    val holeCardCorner = 7.dp
    val plateCorner = 4.dp
    val plateGap = 4.dp
    val verdictPlateGap = 6.dp
    val boardCardWidth = 54.dp
    val boardCardHeight = 76.dp
    val boardCardGap = 6.dp
    val holeCardWidth = 80.dp
    val holeCardHeight = 110.dp
    val holeCardGap = 4.dp
    val tableHeight = 190.dp
    val tableBleed = 6.dp
    val boardTop = 54.dp
    val holeTop = 148.dp
    val answerHeight = 60.dp
    val answerGap = 10.dp
    val answerKeyWidth = 34.dp
    val primaryButtonHeight = 56.dp
    val secondaryButtonHeight = 48.dp
    val progressHeight = 4.dp
    val progressGap = 4.dp
    val closeButton = 44.dp
    val highlightOutline = 3.dp
    val highlightOffset = 2.dp
    val pressOffset = 2.dp
}

// ---------- Motion ----------

object SnapcallMotion {
    val easeOut = CubicBezierEasing(0.2f, 0.8f, 0.2f, 1f)
    const val dealMillis = 420
    val dealDelaysMillis = listOf(100, 180, 260, 500, 740) // flop, flop, flop, turn, river
    val holeDealDelaysMillis = listOf(950, 1050)
    const val plateWipeMillis = 350
    const val verdictSlideMillis = 320
    const val cardFadeMillis = 250
    const val fadedCardAlpha = 0.28f
    const val progressPulseMillis = 1600
    const val starPopMillis = 500
    const val starStaggerMillis = 220
}
