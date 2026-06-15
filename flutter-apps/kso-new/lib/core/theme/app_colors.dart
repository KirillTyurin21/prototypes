import 'package:flutter/material.dart';

/// Цветовая палитра КСО (из KSO_DESIGN_SYSTEM.md + Ui Kit)
class AppColors {
  AppColors._();

  // Тёмная тема
  static const darkBackground = Color(0xFF121212);
  static const darkSurface = Color(0xFF1E1E1E);
  static const darkSurfaceVariant = Color(0xFF2A2A2A);
  static const darkOnSurface = Color(0xFFFFFFFF);
  static const darkOnSurfaceSecondary = Color(0xFF999999);
  static const darkBorder = Color(0xFF444444);
  static const darkBottomBar = Color(0xFF1A1A1A);

  // Светлая тема
  static const lightBackground = Color(0xFFF5F5F5);
  static const lightSurface = Color(0xFFFFFFFF);
  static const lightOnSurface = Color(0xFF1A1A1A);
  static const lightOnSurfaceSecondary = Color(0xFF666666);
  static const lightBorder = Color(0xFFE0E0E0);

  // Акценты
  static const accent = Color(0xFFFF6D00);
  static const accentLight = Color(0xFFFFB300);
  static const primary = Color(0xFF2962FF);
  static const error = Color(0xFFF44336);
  static const success = Color(0xFF4CAF50);
  static const disabled = Color(0xFFBDBDBD);

  // Общие
  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF000000);
  static const separator = Color(0xFFE0E0E0);
  static const grey = Color(0xFF999999);
  static const darkGrey = Color(0xFF666666);
}
