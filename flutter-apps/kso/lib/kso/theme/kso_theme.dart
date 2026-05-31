import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'kso_colors.dart';

class KsoTheme {
  KsoTheme._();

  /// Единая светлая премиальная тема
  static ThemeData light() {
    final colorScheme = const ColorScheme.light().copyWith(
      surface: KsoColors.background,
      surfaceContainer: KsoColors.surface,
      surfaceContainerHigh: KsoColors.surfaceVariant,
      onSurface: KsoColors.textPrimary,
      onSurfaceVariant: KsoColors.textSecondary,
      primary: KsoColors.primary,
      primaryContainer: KsoColors.primaryContainer,
      secondary: KsoColors.accent,
      secondaryContainer: KsoColors.accentContainer,
      error: KsoColors.error,
      errorContainer: KsoColors.errorContainer,
      outline: KsoColors.border,
      outlineVariant: KsoColors.divider,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: KsoColors.background,
      textTheme: _textTheme(ThemeData.light().textTheme),
    );
  }

  static TextTheme _textTheme(TextTheme base) {
    return GoogleFonts.interTextTheme(base).copyWith(
      displayLarge:
          GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w700, color: KsoColors.textPrimary),
      headlineLarge:
          GoogleFonts.inter(fontSize: 26, fontWeight: FontWeight.w700, color: KsoColors.textPrimary),
      headlineMedium:
          GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w600, color: KsoColors.textPrimary),
      titleLarge:
          GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: KsoColors.textPrimary),
      titleMedium:
          GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500, color: KsoColors.textPrimary),
      bodyLarge:
          GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w400, color: KsoColors.textPrimary),
      bodyMedium:
          GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w400, color: KsoColors.textSecondary),
      bodySmall:
          GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400, color: KsoColors.textSecondary),
      labelLarge:
          GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: KsoColors.textPrimary),
      labelMedium:
          GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: KsoColors.textSecondary),
    );
  }
}
