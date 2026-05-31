import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../screens/home_screen.dart';
import '../screens/kso_placeholder_screen.dart';

/// Конфигурация маршрутов приложения
class AppRouter {
  AppRouter._();

  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/kso',
        builder: (context, state) => const KsoPlaceholderScreen(),
      ),
    ],
  );
}
