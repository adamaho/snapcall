package com.adamaho.snapcall.ui.main

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import com.adamaho.snapcall.R
import com.adamaho.snapcall.theme.SnapcallSpacing
import com.adamaho.snapcall.theme.SnapcallTheme

@Composable
fun HomeScreen(modifier: Modifier = Modifier) {
    val colors = SnapcallTheme.colors
    val type = SnapcallTheme.type
    Box(
        modifier = modifier.fillMaxSize().safeDrawingPadding(),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier =
                Modifier.widthIn(max = SnapcallSpacing.contentMaxWidth)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(SnapcallSpacing.screenMargin),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(SnapcallSpacing.contentGap),
        ) {
            Text(
                text = stringResource(R.string.snapcall_wordmark),
                modifier = Modifier.semantics { heading() },
                style = type.wordmark,
                color = colors.textPrimary,
                textAlign = TextAlign.Center,
            )
            Text(
                text = stringResource(R.string.home_description),
                style = type.body,
                color = colors.textSecondary,
                textAlign = TextAlign.Center,
            )
        }
    }
}
