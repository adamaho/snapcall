// Snapcall Broadcast design tokens for Jetpack Compose.
// Reference implementation from the October 27, 2026 design handoff. It has not
// been compiled: merge it into programs/snapcall-android/.../theme/ and add the
// Geist Bold and Instrument Serif font resources it names.
package com.adamaho.snapcall.theme

import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
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

val InstrumentSerif = FontFamily(Font(R.font.instrument_serif_regular, FontWeight.Normal))

val Geist =
    FontFamily(
        Font(R.font.geist_regular, FontWeight.Normal),
        Font(R.font.geist_medium, FontWeight.Medium),
        Font(R.font.geist_semibold, FontWeight.SemiBold),
        Font(R.font.geist_bold, FontWeight.Bold),
    )

private const val TABULAR_NUMBERS = "'tnum' 1"

// Card ranks only. Instrument Serif has one weight: never fake bold or italic on it.
private fun rank(size: Int, lineHeight: Int) =
    TextStyle(
        fontFamily = InstrumentSerif,
        fontWeight = FontWeight.Normal,
        fontSize = size.sp,
        lineHeight = lineHeight.sp,
        letterSpacing = 0.sp,
        fontFeatureSettings = TABULAR_NUMBERS,
    )

private fun sans(weight: FontWeight, size: Int, lineHeight: Int, tracking: Double = 0.0) =
    TextStyle(
        fontFamily = Geist,
        fontWeight = weight,
        fontSize = size.sp,
        lineHeight = lineHeight.sp,
        letterSpacing = tracking.em,
        fontFeatureSettings = TABULAR_NUMBERS,
    )

// Chip and label text is rendered in caps by the components; everything else is sentence case.
@Immutable
data class SnapcallTypography(
    val prompt: TextStyle,
    val score: TextStyle,
    val verdict: TextStyle,
    val handName: TextStyle,
    val answer: TextStyle,
    val button: TextStyle,
    val breadcrumb: TextStyle,
    val chip: TextStyle,
    val label: TextStyle,
    val cardRankBoard: TextStyle,
    val cardRankHole: TextStyle,
    val body: TextStyle,
)

val SnapcallType =
    SnapcallTypography(
        prompt = sans(FontWeight.Bold, 32, 35, -0.02),
        score = sans(FontWeight.Bold, 88, 80, -0.04),
        verdict = sans(FontWeight.Bold, 22, 44),
        handName = sans(FontWeight.SemiBold, 16, 30),
        answer = sans(FontWeight.SemiBold, 18, 24),
        button = sans(FontWeight.SemiBold, 16, 24),
        breadcrumb = sans(FontWeight.Medium, 14, 20),
        chip = sans(FontWeight.SemiBold, 13, 32, 0.06),
        label = sans(FontWeight.SemiBold, 11, 16, 0.14),
        cardRankBoard = rank(30, 28),
        cardRankHole = rank(46, 42),
        body = sans(FontWeight.Normal, 16, 23),
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
