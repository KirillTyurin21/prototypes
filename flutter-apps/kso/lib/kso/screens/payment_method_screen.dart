import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../kso_shell.dart';
import '../models/order.dart';
import '../theme/kso_colors.dart';
import '../theme/kso_constants.dart';
import '../widgets/checkout/kso_choice_card.dart';
import '../widgets/common/kso_back_button.dart';

class PaymentMethodScreen extends StatelessWidget {
  const PaymentMethodScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = CartStateProvider.of(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(KsoSpacing.l),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Back button
              KsoBackButton(
                onPressed: () => context.go('/kso/checkout/type'),
              ),
              const SizedBox(height: KsoSpacing.xxl),
              // Title
              Text(
                'способ оплаты',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: KsoColors.lightOnSurface,
                    ),
              ),
              const Spacer(),
              // Three payment methods
              KsoChoiceCard(
                icon: Icons.credit_card,
                label: 'Картой',
                subtitle: 'бесконтактно',
                isSelected: cart.paymentMethod == PaymentMethod.card,
                onTap: () {
                  cart.setPaymentMethod(PaymentMethod.card);
                  context.go('/kso/checkout/summary');
                },
              ),
              const SizedBox(height: KsoSpacing.m),
              KsoChoiceCard(
                icon: Icons.payments,
                label: 'Наличными',
                isSelected: cart.paymentMethod == PaymentMethod.cash,
                onTap: () {
                  cart.setPaymentMethod(PaymentMethod.cash);
                  context.go('/kso/checkout/summary');
                },
              ),
              const SizedBox(height: KsoSpacing.m),
              KsoChoiceCard(
                icon: Icons.qr_code,
                label: 'Kaspi QR',
                subtitle: 'отсканируйте QR-код',
                isSelected: cart.paymentMethod == PaymentMethod.kaspiQr,
                onTap: () {
                  cart.setPaymentMethod(PaymentMethod.kaspiQr);
                  context.go('/kso/checkout/summary');
                },
              ),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }
}
