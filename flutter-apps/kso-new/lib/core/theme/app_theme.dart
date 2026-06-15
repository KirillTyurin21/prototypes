import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Тема приложения КСО — двойная (светлая + тёмная)
class AppTheme {
  AppTheme._();

  /// Тёмная тема (Меню, Детали товара)
  static ThemeData get dark {
    final cs = ColorScheme.dark(
      surface: AppColors.darkBackground,
      surfaceContainer: AppColors.darkSurface,
      surfaceContainerHigh: AppColors.darkSurfaceVariant,
      onSurface: AppColors.darkOnSurface,
      onSurfaceVariant: AppColors.darkOnSurfaceSecondary,
      primary: AppColors.accent,
      secondary: AppColors.accentLight,
      outline: AppColors.darkBorder,
      error: AppColors.error,
    );

    return _buildTheme(cs, Brightness.dark);
  }

  /// Светлая тема (Корзина, Оплата)
  static ThemeData get light {
    final cs = ColorScheme.light(
      surface: AppColors.lightBackground,
      surfaceContainer: AppColors.lightSurface,
      onSurface: AppColors.lightOnSurface,
      onSurfaceVariant: AppColors.lightOnSurfaceSecondary,
      primary: AppColors.primary,
      error: AppColors.error,
      outline: AppColors.lightBorder,
    );

    return _buildTheme(cs, Brightness.light);
  }

  static ThemeData _buildTheme(ColorScheme cs, Brightness brightness) {
    final textTheme = GoogleFonts.robotoTextTheme().apply(
      bodyColor: cs.onSurface,
      displayColor: cs.onSurface,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: cs,
      textTheme: textTheme,
      scaffoldBackgroundColor: cs.surface,
      appBarTheme: AppBarTheme(
        backgroundColor: cs.surface,
        foregroundColor: cs.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: cs.surfaceContainer,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
    );
  }
}
