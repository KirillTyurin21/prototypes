import 'package:flutter/material.dart';

class KsoSpacing {
  KsoSpacing._();
  static const double xs = 4;
  static const double s = 8;
  static const double m = 12;
  static const double l = 16;
  static const double xl = 20;
  static const double xxl = 24;
}

class KsoRadius {
  KsoRadius._();
  static const double s = 8;
  static const double m = 12;
  static const double l = 16;
  static const double xl = 20;
}

class KsoAnim {
  KsoAnim._();
  static const Duration fast = Duration(milliseconds: 200);
  static const Duration normal = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 400);
  static const Duration hero = Duration(milliseconds: 500);
  static const Duration staggerDelay = Duration(milliseconds: 50);
  static const Curve defaultCurve = Curves.easeInOut;
  static const Curve sharpCurve = Curves.easeInOutCubic;
}

/// Форматирование цены в тенге: "1 200 ₸"
String formatPrice(int price) {
  final formatted = price.toString().replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+$)'),
        (m) => '${m[1]} ',
      );
  return '$formatted ₸';
}
