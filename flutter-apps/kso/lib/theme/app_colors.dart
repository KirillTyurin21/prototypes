import 'package:flutter/material.dart';

/// Цветовая палитра приложения КСО-прототипов
class AppColors {
  AppColors._();

  // Основные цвета (Material 3)
  static const Color primary = Color(0xFF1976D2);
  static const Color onPrimary = Colors.white;
  static const Color primaryContainer = Color(0xFFD1E4FF);
  static const Color onPrimaryContainer = Color(0xFF001D36);

  // Вторичные
  static const Color secondary = Color(0xFF535F70);
  static const Color onSecondary = Colors.white;
  static const Color secondaryContainer = Color(0xFFD7E3F7);
  static const Color onSecondaryContainer = Color(0xFF101C2B);

  // Акцент
  static const Color tertiary = Color(0xFFFF6D00);
  static const Color onTertiary = Colors.white;

  // Поверхности
  static const Color surface = Color(0xFFFCFCFF);
  static const Color surfaceVariant = Color(0xFFF0F4FA);
  static const Color onSurface = Color(0xFF1A1C1E);
  static const Color onSurfaceVariant = Color(0xFF43474E);

  // Ошибки
  static const Color error = Color(0xFFBA1A1A);
  static const Color onError = Colors.white;

  // Outline
  static const Color outline = Color(0xFF73777F);
  static const Color outlineVariant = Color(0xFFC3C7CF);

  // Тёмная тема — sidebar (как в Angular-версии)
  static const Color sidebarBg = Color(0xFF263238);
  static const Color sidebarText = Color(0xFFECEFF1);

  // Дополнительные
  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFF57C00);
  static const Color info = Color(0xFF0288D1);
}
