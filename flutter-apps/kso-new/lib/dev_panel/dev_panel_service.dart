import 'package:flutter/material.dart';

/// Сервис панели настроек (dev panel).
/// Хранит настройки в Map, экраны читают через get().
/// В production-режиме всегда возвращает default-значения.
class DevPanelService extends ChangeNotifier {
  final Map<String, dynamic> _settings = {};

  static final DevPanelService _instance = DevPanelService._();
  factory DevPanelService() => _instance;
  DevPanelService._();

  /// Панель открыта?
  bool isOpen = false;

  /// Включена ли панель (в production — false)
  bool enabled = true;

  /// Получить значение настройки
  T get<T>(String key, {required T defaultValue}) {
    if (!enabled) return defaultValue;
    if (!_settings.containsKey(key)) return defaultValue;
    final v = _settings[key];
    if (v is T) return v;
    return defaultValue;
  }

  /// Установить значение настройки
  void set(String key, dynamic value) {
    _settings[key] = value;
    notifyListeners();
  }

  /// Сбросить все настройки
  void resetAll() {
    _settings.clear();
    notifyListeners();
  }

  /// Переключить видимость панели
  void toggle() {
    isOpen = !isOpen;
    notifyListeners();
  }
}
