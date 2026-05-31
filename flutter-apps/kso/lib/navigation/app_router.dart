import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../screens/home_screen.dart';
import '../kso/kso_shell.dart';
import '../kso/screens/cart_screen.dart';
import '../kso/screens/menu_screen.dart';
import '../kso/screens/order_summary_screen.dart';
import '../kso/screens/order_type_screen.dart';
import '../kso/screens/payment_method_screen.dart';
import '../kso/screens/payment_processing_screen.dart';
import '../kso/screens/payment_success_screen.dart';
import '../kso/screens/product_detail_screen.dart';

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
      ShellRoute(
        builder: (context, state, child) => KsoShell(child: child),
        routes: [
          GoRoute(
            path: '/kso',
            pageBuilder: (context, state) => CustomTransitionPage(
              key: state.pageKey,
              child: const MenuScreen(),
              transitionDuration: const Duration(milliseconds: 400),
              reverseTransitionDuration: const Duration(milliseconds: 350),
              transitionsBuilder: _fadeTransition,
            ),
            routes: [
              GoRoute(
                path: 'product/:productId',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: ProductDetailScreen(
                    productId: state.pathParameters['productId']!,
                  ),
                  transitionDuration: const Duration(milliseconds: 400),
                  reverseTransitionDuration: const Duration(milliseconds: 350),
                  transitionsBuilder: _slideUpTransition,
                ),
              ),
              GoRoute(
                path: 'cart',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: const CartScreen(),
                  transitionDuration: const Duration(milliseconds: 400),
                  reverseTransitionDuration: const Duration(milliseconds: 350),
                  transitionsBuilder: _slideUpTransition,
                ),
              ),
              GoRoute(
                path: 'checkout/type',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: const OrderTypeScreen(),
                  transitionDuration: const Duration(milliseconds: 300),
                  reverseTransitionDuration: const Duration(milliseconds: 300),
                  transitionsBuilder: _slideLeftTransition,
                ),
              ),
              GoRoute(
                path: 'checkout/payment',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: const PaymentMethodScreen(),
                  transitionDuration: const Duration(milliseconds: 300),
                  reverseTransitionDuration: const Duration(milliseconds: 300),
                  transitionsBuilder: _slideLeftTransition,
                ),
              ),
              GoRoute(
                path: 'checkout/summary',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: const OrderSummaryScreen(),
                  transitionDuration: const Duration(milliseconds: 300),
                  reverseTransitionDuration: const Duration(milliseconds: 300),
                  transitionsBuilder: _slideLeftTransition,
                ),
              ),
              GoRoute(
                path: 'checkout/processing',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: const PaymentProcessingScreen(),
                  transitionDuration: const Duration(milliseconds: 400),
                  reverseTransitionDuration: const Duration(milliseconds: 400),
                  transitionsBuilder: _fadeTransition,
                ),
              ),
              GoRoute(
                path: 'checkout/success',
                pageBuilder: (context, state) => CustomTransitionPage(
                  key: state.pageKey,
                  child: const PaymentSuccessScreen(),
                  transitionDuration: const Duration(milliseconds: 500),
                  reverseTransitionDuration: const Duration(milliseconds: 400),
                  transitionsBuilder: _scaleFadeTransition,
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );

  // ── Transition builders ──

  /// Fade in/out — для Меню и Процессинга.
  static Widget _fadeTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: Curves.easeInOut,
      ),
      child: child,
    );
  }

  /// Slide up — для Товара и Корзины (вход снизу).
  static Widget _slideUpTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, 1),
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: Curves.easeInOutCubic,
      )),
      child: child,
    );
  }

  /// Slide left — для Checkout-шагов (вход справа).
  static Widget _slideLeftTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(1, 0),
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: Curves.easeInOut,
      )),
      child: child,
    );
  }

  /// Scale + Fade — для экрана Успеха.
  static Widget _scaleFadeTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: Curves.easeIn,
      ),
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.8, end: 1.0).animate(
          CurvedAnimation(
            parent: animation,
            curve: Curves.elasticOut,
          ),
        ),
        child: child,
      ),
    );
  }
}
