import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../kso_shell.dart';
import '../models/order.dart';
import '../theme/kso_colors.dart';
import '../theme/kso_constants.dart';

class PaymentSuccessScreen extends StatefulWidget {
  const PaymentSuccessScreen({super.key});

  @override
  State<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends State<PaymentSuccessScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _scaleController;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _fadeAnimation;
  late final Order _order;
  Timer? _autoRedirectTimer;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      vsync: this,
      duration: KsoAnim.hero,
    );
    _scaleAnimation = CurvedAnimation(
      parent: _scaleController,
      curve: Curves.elasticOut,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _scaleController,
      curve: Curves.easeIn,
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Create order once
    if (!_scaleController.isAnimating && _scaleController.value == 0) {
      final cart = CartStateProvider.of(context);
      _order = cart.createOrder();
      _scaleController.forward();

      // Auto-redirect to menu after 15 seconds
      _autoRedirectTimer = Timer(const Duration(seconds: 15), () {
        if (mounted) _startNewOrder();
      });
    }
  }

  @override
  void dispose() {
    _autoRedirectTimer?.cancel();
    _scaleController.dispose();
    super.dispose();
  }

  void _startNewOrder() {
    CartStateProvider.of(context).clear();
    context.go('/kso');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(KsoSpacing.xxl),
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Animated check icon
                  ScaleTransition(
                    scale: _scaleAnimation,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: KsoColors.success.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_circle,
                        size: 80,
                        color: KsoColors.success,
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  // Thank you text
                  const Text(
                    'Спасибо!',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: KsoColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: KsoSpacing.l),
                  // Order number
                  Text(
                    'Ваш заказ №${_order.orderNumber}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w500,
                      color: KsoColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: KsoSpacing.s),
                  // Estimated time
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.schedule,
                          size: 18,
                          color: KsoColors.textSecondary),
                      const SizedBox(width: KsoSpacing.xs),
                      Text(
                        'Будет готово через ≈ ${_order.estimatedMinutes} мин',
                        style: const TextStyle(
                          fontSize: 16,
                          color: KsoColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  if (_order.customerName != null &&
                      _order.customerName!.isNotEmpty) ...[
                    const SizedBox(height: KsoSpacing.s),
                    Text(
                      'Позовём: ${_order.customerName}',
                      style: const TextStyle(
                        fontSize: 16,
                        color: KsoColors.textSecondary,
                      ),
                    ),
                  ],
                  const SizedBox(height: 60),
                  // New order button
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: _startNewOrder,
                      style: FilledButton.styleFrom(
                        backgroundColor: KsoColors.primary,
                        padding:
                            const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(KsoRadius.m),
                        ),
                      ),
                      child: const Text(
                        'Новый заказ',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
