import 'package:flutter/material.dart';

/// Типы медиа-контента для стартового экрана
enum MediaType { image, video }

/// Элемент медиа-галереи
class MediaItem {
  final String assetPath;
  final MediaType type;
  final int? order;

  const MediaItem({
    required this.assetPath,
    required this.type,
    this.order,
  });
}

/// Конфигурация стартового экрана (Splash)
class SplashConfig {
  final List<MediaItem> mediaItems;
  final int imageIntervalSeconds;
  final bool showBuyButton;
  final String buyButtonText;
  final int buyButtonBackgroundColor;
  final int buyButtonTextColor;
  final String? hintText;

  const SplashConfig({
    this.mediaItems = const [],
    this.imageIntervalSeconds = 5,
    this.showBuyButton = true,
    this.buyButtonText = 'Купить здесь',
    this.buyButtonBackgroundColor = 0xFFFF6D00,
    this.buyButtonTextColor = 0xFFFFFFFF,
    this.hintText = 'Нажмите на экран, чтобы войти в меню',
  });

  Color get btnBgColor => Color(buyButtonBackgroundColor);
  Color get btnTextColor => Color(buyButtonTextColor);
}

/// Конфигурация экрана выбора локации
class LocationSelectionConfig {
  final String title;
  final String dineInImageAsset;
  final String takeawayImageAsset;

  const LocationSelectionConfig({
    this.title = 'Как хотите получить заказ?',
    this.dineInImageAsset = 'assets/media/dinein.png',
    this.takeawayImageAsset = 'assets/media/takeaway.png',
  });
}
