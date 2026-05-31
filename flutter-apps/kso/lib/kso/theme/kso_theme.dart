import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'kso_colors.dart';

class KsoTheme {
  KsoTheme._();

  static ThemeData dark() {
    final colorScheme = const ColorScheme.dark().copyWith(
      surface: KsoColors.darkBackground,
      surfaceContainer: KsoColors.darkSurface,
      surfaceContainerHigh: KsoColors.darkSurfaceVariant,
      onSurface: KsoColors.darkOnSurface,
      onSurfaceVariant: KsoColors.darkOnSurfaceSecondary,
      primary: KsoColors.accent,
      secondary: KsoColors.accentLight,
      outline: KsoColors.darkBorder,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: KsoColors.darkBackground,
      textTheme: _textTheme(ThemeData.dark().textTheme),
    );
  }

  static ThemeData light() {
    final colorScheme = const ColorScheme.light().copyWith(
      surface: KsoColors.lightBackground,
      surfaceContainer: KsoColors.lightSurface,
      onSurface: KsoColors.lightOnSurface,
      onSurfaceVariant: KsoColors.lightOnSurfaceSecondary,
      primary: KsoColors.primary,
      error: KsoColors.error,
      outline: KsoColors.lightBorder,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: KsoColors.lightBackground,
      textTheme: _textTheme(ThemeData.light().textTheme),
    );
  }

  static TextTheme _textTheme(TextTheme base) {
    return GoogleFonts.robotoTextTheme(base).copyWith(
      displayLarge:
          GoogleFonts.roboto(fontSize: 28, fontWeight: FontWeight.w700),
      headlineLarge:
          GoogleFonts.roboto(fontSize: 24, fontWeight: FontWeight.w700),
      headlineMedium:
          GoogleFonts.roboto(fontSize: 20, fontWeight: FontWeight.w600),
      titleLarge:
          GoogleFonts.roboto(fontSize: 18, fontWeight: FontWeight.w600),
      titleMedium:
          GoogleFonts.roboto(fontSize: 16, fontWeight: FontWeight.w500),
      bodyLarge:
          GoogleFonts.roboto(fontSize: 16, fontWeight: FontWeight.w400),
      bodyMedium:
          GoogleFonts.roboto(fontSize: 14, fontWeight: FontWeight.w400),
      bodySmall:
          GoogleFonts.roboto(fontSize: 12, fontWeight: FontWeight.w400),
      labelLarge:
          GoogleFonts.roboto(fontSize: 14, fontWeight: FontWeight.w600),
      labelMedium:
          GoogleFonts.roboto(fontSize: 12, fontWeight: FontWeight.w500),
    );
  }
}
