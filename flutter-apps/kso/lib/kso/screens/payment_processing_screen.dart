import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/kso_colors.dart';
import '../theme/kso_constants.dart';

class PaymentProcessingScreen extends StatefulWidget {
  const PaymentProcessingScreen({super.key});

  @override
  State<PaymentProcessingScreen> createState() =>
      _PaymentProcessingScreenState();
}

class _PaymentProcessingScreenState extends State<PaymentProcessingScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulseController;
  Timer? _navigateTimer;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    // Auto-navigate to success after ~4 seconds
    _navigateTimer = Timer(const Duration(seconds: 4), () {
      if (mounted) {
        context.go('/kso/checkout/success');
      }
    });
  }

  @override
  void dispose() {
    _navigateTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(KsoSpacing.xxl),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Terminal illustration
                _buildTerminalIllustration(),
                const SizedBox(height: 48),
                // Pulsing NFC icon
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    final scale = 1.0 + _pulseController.value * 0.15;
                    final opacity = 0.5 + _pulseController.value * 0.5;
                    return Transform.scale(
                      scale: scale,
                      child: Opacity(
                        opacity: opacity,
                        child: child,
                      ),
                    );
                  },
                  child: const Icon(
                    Icons.contactless,
                    size: 56,
                    color: KsoColors.primary,
                  ),
                ),
                const SizedBox(height: KsoSpacing.xxl),
                // Status text
                const Text(
                  'подключение к терминалу',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: KsoColors.textPrimary,
                  ),
                ),
                const SizedBox(height: KsoSpacing.s),
                const Text(
                  'приложите карту',
                  style: TextStyle(
                    fontSize: 16,
                    color: KsoColors.textSecondary,
                  ),
                ),
                const SizedBox(height: KsoSpacing.xxl),
                // Loading indicator
                const SizedBox(
                  width: 32,
                  height: 32,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    color: KsoColors.primary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Stylized POS terminal illustration using Flutter drawing.
  Widget _buildTerminalIllustration() {
    return Container(
      width: 140,
      height: 200,
      decoration: BoxDecoration(
        color: const Color(0xFF2C2C2C),
        borderRadius: BorderRadius.circular(KsoRadius.l),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          const SizedBox(height: 16),
          // Screen
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFF4A6FA5),
              borderRadius: BorderRadius.circular(KsoRadius.s),
            ),
            child: const Center(
              child: Icon(Icons.contactless, size: 32, color: Colors.white70),
            ),
          ),
          const Spacer(),
          // Keypad row (colored buttons)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _terminalButton(KsoColors.error, 12),
                _terminalButton(KsoColors.accentLight, 12),
                _terminalButton(KsoColors.success, 12),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _terminalButton(Color color, double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}
