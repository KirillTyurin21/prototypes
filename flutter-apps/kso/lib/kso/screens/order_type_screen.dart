import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../kso_shell.dart';
import '../models/order.dart';
import '../theme/kso_colors.dart';
import '../theme/kso_constants.dart';
import '../widgets/checkout/kso_choice_card.dart';
import '../widgets/common/kso_back_button.dart';

class OrderTypeScreen extends StatelessWidget {
  const OrderTypeScreen({super.key});

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
                onPressed: () => context.go('/kso/cart'),
              ),
              const SizedBox(height: KsoSpacing.xxl),
              // Title
              Text(
                'ваш заказ',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: KsoColors.lightOnSurface,
                    ),
              ),
              const Spacer(),
              // Two choice cards
              KsoChoiceCard(
                icon: Icons.takeout_dining,
                label: 'С собой',
                subtitle: 'заберу с собой',
                isSelected: cart.orderType == OrderType.takeaway,
                onTap: () {
                  cart.setOrderType(OrderType.takeaway);
                  context.go('/kso/checkout/payment');
                },
              ),
              const SizedBox(height: KsoSpacing.l),
              KsoChoiceCard(
                icon: Icons.restaurant,
                label: 'На месте',
                subtitle: 'буду здесь',
                isSelected: cart.orderType == OrderType.dineIn,
                onTap: () {
                  cart.setOrderType(OrderType.dineIn);
                  context.go('/kso/checkout/payment');
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
