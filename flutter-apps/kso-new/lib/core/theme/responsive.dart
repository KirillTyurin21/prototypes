import 'dart:math';
import 'package:flutter/material.dart';
import 'app_constants.dart';
import '../../dev_panel/dev_panel_service.dart';

/// Расширение для адаптивного масштабирования размеров
extension ResponsiveContext on BuildContext {
  /// Коэффициент масштабирования относительно Figma-референса
  double get scaleFactor {
    final dev = DevPanelService();
    final useCustom = dev.get<bool>('global_use_custom_size', defaultValue: false);

    if (useCustom) {
      // Фиксированный размер экрана: масштаб = min(W_custom/1080, H_custom/1920)
      final screenW = dev.get<int>('global_screen_width', defaultValue: 540).toDouble();
      final screenH = dev.get<int>('global_screen_height', defaultValue: 960).toDouble();
      if (screenW > 0 && screenH > 0) {
        return min(
          screenW / FigmaReference.width,
          screenH / FigmaReference.height,
        );
      }
    }

    // По умолчанию: масштабирование под реальное окно браузера
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
