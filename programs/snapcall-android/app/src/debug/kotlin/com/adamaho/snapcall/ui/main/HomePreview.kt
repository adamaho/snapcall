package com.adamaho.snapcall.ui.main

import android.content.res.Configuration
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.adamaho.snapcall.theme.SnapcallTheme

@Preview(
    name = "Home – light",
    uiMode = Configuration.UI_MODE_NIGHT_NO,
    widthDp = 412,
    heightDp = 892,
)
@Preview(
    name = "Home – dark",
    uiMode = Configuration.UI_MODE_NIGHT_YES,
    widthDp = 412,
    heightDp = 892,
)
@Preview(name = "Home – large text", fontScale = 1.5f, widthDp = 320, heightDp = 640)
@Composable
fun HomePreview() {
    SnapcallTheme {
        Surface(modifier = Modifier.fillMaxSize(), color = SnapcallTheme.colors.background) {
            HomeScreen()
        }
    }
}
