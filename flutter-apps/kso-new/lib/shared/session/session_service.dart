import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'session_payload.dart';

// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

const _tokenStorageKey = '__session_token';
const _sessionParam = '_s';

/// Сервис чтения сессионного токена (аналог Angular SessionService).
///
/// Токен передаётся серверным прокси (Cloud Function) в URL как ?_s=TOKEN.
/// Формат токена: base64url(JSON).HMAC-SHA256(payload).
/// HMAC-подпись НЕ проверяется на клиенте — секрет только в Cloud Function.
///
/// Логика инициализации:
/// 1. kDebugMode → мастер-доступ
/// 2. URL ?_s=TOKEN → декодировать, сохранить в localStorage
/// 3. localStorage fallback (для F5 на глубоких маршрутах)
/// 4. Пусто → нет доступа
class SessionService extends ChangeNotifier {
  SessionPayload? _payload;
  bool _initialized = false;

  SessionPayload? get payload => _payload;
  bool get isAuthenticated => _payload != null && !_payload!.isExpired;
  bool get isMaster => _payload?.isMaster ?? false;
  bool get isInitialized => _initialized;

  static final SessionService _instance = SessionService._();
  factory SessionService() => _instance;
  SessionService._();

  /// Инициализировать сессию — вызвать в main() до runApp()
  void init() {
    if (_initialized) return;
    _initialized = true;

    // Dev-режим — полный доступ без токена
    if (kDebugMode) {
      _payload = const SessionPayload(
        type: 'master',
        slugs: ['*'],
        exp: 0,
        gen: 1,
      );
      notifyListeners();
      return;
    }

    // 1. Пробуем из URL (?_s=TOKEN)
    final uri = Uri.tryParse(html.window.location.href);
    if (uri != null) {
      final token = uri.queryParameters[_sessionParam];
      if (token != null && token.isNotEmpty) {
        _parseToken(token);
        // Сохраняем для F5
        _saveToStorage(token);
        // Убираем ?_s= из адресной строки
        _cleanUrl();
        notifyListeners();
        return;
      }
    }

    // 2. Fallback: localStorage (после F5)
    final stored = _loadFromStorage();
    if (stored != null) {
      _parseToken(stored);
      notifyListeners();
      return;
    }

    // 3. Нет доступа
    notifyListeners();
  }

  /// Очистить сессию
  void clearSession() {
    _payload = null;
    try {
      html.window.localStorage.remove(_tokenStorageKey);
    } catch (_) {}
    notifyListeners();
  }

  /// Декодирует payload из токена, проверяет exp
  void _parseToken(String token) {
    final dotIndex = token.lastIndexOf('.');
    if (dotIndex == -1) return;

    try {
      final encoded = token.substring(0, dotIndex);
      // base64url → base64
      final base64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
      // Добавляем паддинг
      final padded = base64.padRight((base64.length + 3) ~/ 4 * 4, '=');
      final json = utf8.decode(base64Decode(padded));
      final map = jsonDecode(json) as Map<String, dynamic>;
      final payload = SessionPayload.fromJson(map);

      if (payload.isExpired) {
        try {
          html.window.localStorage.remove(_tokenStorageKey);
        } catch (_) {}
        return;
      }

      _payload = payload;
    } catch (_) {
      try {
        html.window.localStorage.remove(_tokenStorageKey);
      } catch (_) {}
    }
  }

  void _saveToStorage(String token) {
    try {
      html.window.localStorage[_tokenStorageKey] = token;
    } catch (_) {}
  }

  String? _loadFromStorage() {
    try {
      return html.window.localStorage[_tokenStorageKey];
    } catch (_) {
      return null;
    }
  }

  void _cleanUrl() {
    try {
      final uri = Uri.tryParse(html.window.location.href);
      if (uri == null) return;
      final params = Map<String, String>.from(uri.queryParameters);
      params.remove(_sessionParam);
      final newQuery = params.entries
          .map((e) => '${Uri.encodeQueryComponent(e.key)}=${Uri.encodeQueryComponent(e.value)}')
          .join('&');
      final cleanUrl = '${uri.scheme}://${uri.host}${uri.port != 443 && uri.port != 80 ? ':${uri.port}' : ''}${uri.path}${newQuery.isNotEmpty ? '?$newQuery' : ''}${uri.fragment.isNotEmpty ? '#${uri.fragment}' : ''}';
      html.window.history.replaceState(null, '', cleanUrl);
    } catch (_) {}
  }
}
