package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
  primary = SekaCoralPrimary,
  onPrimary = Color.Black,
  primaryContainer = SekaSurfaceVariant,
  onPrimaryContainer = SekaCoralPrimary,
  secondary = SekaYellowAccent,
  onSecondary = Color.Black,
  tertiary = SekaCyanAccent,
  onTertiary = Color.Black,
  background = SekaBackground,
  onBackground = SekaTextPrimary,
  surface = SekaSurface,
  onSurface = SekaTextPrimary,
  surfaceVariant = SekaSurfaceVariant,
  onSurfaceVariant = SekaTextSecondary,
  outline = SekaBorder,
  surfaceTint = SekaCoralPrimary
)

@Composable
fun SekaTheme(
  content: @Composable () -> Unit
) {
  MaterialTheme(
    colorScheme = DarkColorScheme,
    typography = Typography,
    content = content
  )
}

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  dynamicColor: Boolean = true,
  content: @Composable () -> Unit
) {
  SekaTheme(content = content)
}
