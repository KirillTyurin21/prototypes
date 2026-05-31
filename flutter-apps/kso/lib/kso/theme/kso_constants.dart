import 'package:flutter/material.dart';

class KsoSpacing {
  KsoSpacing._();
  static const double xs = 4;
  static const double s = 8;
  static const double m = 12;
  static const double l = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;
}

class KsoRadius {
  KsoRadius._();
  static const double s = 12;
  static const double m = 16;
  static const double l = 24;
  static const double xl = 32;
}

class KsoAnim {
  KsoAnim._();
  static const Duration fast = Duration(milliseconds: 200);
  static const Duration normal = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 400);
  static const Duration hero = Duration(milliseconds: 500);
  static const Duration staggerDelay = Duration(milliseconds: 60);
  static const Curve defaultCurve = Curves.easeInOutCubic;
  static const Curve sharpCurve = Curves.easeInOutCubicEmphasized;
  static const Curve springCurve = Curves.elasticOut;
}

class KsoShadows {
  KsoShadows._();

  static List<BoxShadow> card = [
    BoxShadow(
      color: const Color(0xFF6B4226).withValues(alpha: 0.06),
      blurRadius: 12,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> cardHover = [
    BoxShadow(
      color: const Color(0xFF6B4226).withValues(alpha: 0.12),
      blurRadius: 20,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> elevated = [
    BoxShadow(
      color: const Color(0xFF6B4226).withValues(alpha: 0.10),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> bottomBar = [
    BoxShadow(
      color: const Color(0xFF6B4226).withValues(alpha: 0.08),
      blurRadius: 16,
      offset: const Offset(0, -4),
    ),
  ];
}

/// Форматирование цены в рублях: "1 200 ₽"
String formatPrice(int price) {
  final formatted = price.toString().replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+$)'),
        (m) => '${m[1]} ',
      );
  return '$formatted ₽';
}
