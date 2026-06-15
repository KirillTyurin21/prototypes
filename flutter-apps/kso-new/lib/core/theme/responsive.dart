import 'dart:math';
import 'package:flutter/material.dart';
import 'app_constants.dart';

/// Расширение для адаптивного масштабирования размеров
extension ResponsiveContext on BuildContext {
  /// Коэффициент масштабирования относительно Figma-референса
  double get scaleFactor {
    final media = MediaQuery.of(this);
    if (media.size.width <= 0 || media.size.height <= 0) return 1.0;
    return min(
      media.size.width / FigmaReference.width,
      media.size.height / FigmaReference.height,
    );
  }

  /// Масштабировать размер из Figma
  double scaled(double designPx) => designPx * scaleFactor;

  /// Масштабировать шрифт (с ограничением)
  double scaledFont(double designPx) {
    final s = designPx * scaleFactor;
    return s.clamp(designPx * 0.7, designPx * 1.5);
  }

  /// Масштабировать с учётом минимального touch-target
  double scaledTouch(double designPx) =>
      max(designPx * scaleFactor, FigmaReference.minTouchSize);

  /// Масштабированное скругление
  double scaledRadius(double designPx) => designPx * scaleFactor;

  /// Масштабированный EdgeInsets
  EdgeInsets scaledPadding(double all) =>
      EdgeInsets.all(all * scaleFactor);

  EdgeInsets scaledSymmetric(double h, double v) =>
      EdgeInsets.symmetric(
        horizontal: h * scaleFactor,
        vertical: v * scaleFactor,
      );
}
