import 'package:flutter/material.dart';

/// Единая светлая премиальная палитра — стиль «Кофейня»
class KsoColors {
  KsoColors._();

  // ── Background & Surface ──
  static const Color background = Color(0xFFFAF8F5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F0EB);
  static const Color surfaceTinted = Color(0xFFF0E8DF);

  // ── Primary (кофейный коричневый) ──
  static const Color primary = Color(0xFF5C3D2E);
  static const Color primaryLight = Color(0xFF8B6B5A);
  static const Color primaryContainer = Color(0xFFEDE0D4);

  // ── Accent (карамельный) ──
  static const Color accent = Color(0xFFD4A574);
  static const Color accentDark = Color(0xFFC08B5C);
  static const Color accentLight = Color(0xFFE8C9A4);
  static const Color accentContainer = Color(0xFFFFF3E6);

  // ── Text ──
  static const Color textPrimary = Color(0xFF2D2016);
  static const Color textSecondary = Color(0xFF8C7B6B);
  static const Color textTertiary = Color(0xFFB5A698);

  // ── Semantic ──
  static const Color success = Color(0xFF5B8A3C);
  static const Color successContainer = Color(0xFFE8F5E0);
  static const Color error = Color(0xFFD64545);
  static const Color errorContainer = Color(0xFFFDE8E8);

  // ── Border & Divider ──
  static const Color border = Color(0xFFEDE5DC);
  static const Color divider = Color(0xFFF0E8E0);

  // ── Overlay ──
  static const Color overlay = Color(0x33000000);
  static const Color shimmer = Color(0xFFF5EDE5);
}
