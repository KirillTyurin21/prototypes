import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../kso_shell.dart';
import '../models/order.dart';
import '../theme/kso_colors.dart';
import '../theme/kso_constants.dart';
import '../widgets/common/kso_back_button.dart';
import '../widgets/common/kso_bottom_bar.dart';

class OrderSummaryScreen extends StatelessWidget {
  const OrderSummaryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = CartStateProvider.of(context);

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Column(
        children: [
          Expanded(
            child: CustomScrollView(
              slivers: [
                // Safe area + back button
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.only(
                      top: MediaQuery.of(context).padding.top + KsoSpacing.s,
                      left: KsoSpacing.l,
                    ),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: KsoBackButton(
                        onPressed: () =>
                            context.go('/kso/checkout/payment'),
                      ),
                    ),
                  ),
                ),
                // Title
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                        KsoSpacing.l, KsoSpacing.xxl, KsoSpacing.l, 0),
                    child: Text(
                      'ваш заказ',
                      style: Theme.of(context)
                          .textTheme
                          .headlineMedium
                          ?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: KsoColors.textPrimary,
                          ),
                    ),
                  ),
                ),
                // Customer name
                if (cart.customerName != null &&
                    cart.customerName!.isNotEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(
                          KsoSpacing.l, KsoSpacing.m, KsoSpacing.l, 0),
                      child: Row(
                        children: [
                          const Icon(Icons.person,
                              size: 18,
                              color: KsoColors.textSecondary),
                          const SizedBox(width: KsoSpacing.s),
                          Text(
                            cart.customerName!,
                            style: const TextStyle(
                              fontSize: 16,
                              color: KsoColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                // Order type + payment method badges
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                        KsoSpacing.l, KsoSpacing.l, KsoSpacing.l, 0),
                    child: Row(
                      children: [
                        _infoBadge(
                          icon: cart.orderType == OrderType.takeaway
                              ? Icons.takeout_dining
                              : Icons.restaurant,
                          label: cart.orderType == OrderType.takeaway
                              ? 'С собой'
                              : 'На месте',
                        ),
                        const SizedBox(width: KsoSpacing.s),
                        _infoBadge(
                          icon: _paymentIcon(cart.paymentMethod),
                          label: _paymentLabel(cart.paymentMethod),
                        ),
                      ],
                    ),
                  ),
                ),
                // Divider
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                        horizontal: KsoSpacing.l, vertical: KsoSpacing.l),
                    child: Divider(color: KsoColors.border),
                  ),
                ),
                // Cart items compact list
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final item = cart.items[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: KsoSpacing.l,
                          vertical: KsoSpacing.xs,
                        ),
                        child: Row(
                          children: [
                            // Quantity badge
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: KsoColors.primary
                                    .withValues(alpha: 0.1),
                                borderRadius:
                                    BorderRadius.circular(KsoRadius.s),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '${item.quantity}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: KsoColors.primary,
                                ),
                              ),
                            ),
                            const SizedBox(width: KsoSpacing.m),
                            // Name + modifiers
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.product.name,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w500,
                                      color: KsoColors.textPrimary,
                                    ),
                                  ),
                                  if (item.modifierSummary.isNotEmpty)
                                    Text(
                                      item.modifierSummary.join(', '),
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: KsoColors
                                            .textSecondary,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                ],
                              ),
                            ),
                            // Price
                            Text(
                              formatPrice(item.totalPrice),
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: KsoColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    childCount: cart.items.length,
                  ),
                ),
                // Total divider + total
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                        KsoSpacing.l, KsoSpacing.l, KsoSpacing.l, 0),
                    child: Column(
                      children: [
                        const Divider(color: KsoColors.border),
                        const SizedBox(height: KsoSpacing.m),
                        Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Итого',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: KsoColors.textPrimary,
                              ),
                            ),
                            Text(
                              formatPrice(cart.totalPrice),
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: KsoColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: KsoSpacing.xs),
                        Row(
                          children: [
                            const Icon(Icons.schedule,
                                size: 14,
                                color:
                                    KsoColors.textSecondary),
                            const SizedBox(width: 4),
                            Text(
                              '≈ ${cart.estimatedMinutes} мин',
                              style: const TextStyle(
                                fontSize: 13,
                                color:
                                    KsoColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
              ],
            ),
          ),
          // Bottom bar: pay button
          KsoBottomBar(
            child: SizedBox(
              width: double.infinity,
              child: GestureDetector(
                onTap: () => context.go('/kso/checkout/processing'),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: KsoColors.primary,
                    borderRadius: BorderRadius.circular(KsoRadius.m),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    'Оплатить ${formatPrice(cart.totalPrice)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoBadge({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: KsoSpacing.m, vertical: KsoSpacing.s),
      decoration: BoxDecoration(
        color: KsoColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(KsoRadius.m),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: KsoColors.primary),
          const SizedBox(width: KsoSpacing.s),
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: KsoColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  IconData _paymentIcon(PaymentMethod? method) {
    switch (method) {
      case PaymentMethod.card:
        return Icons.credit_card;
      case PaymentMethod.cash:
        return Icons.payments;
      case PaymentMethod.sbp:
        return Icons.qr_code;
      case null:
        return Icons.payment;
    }
  }

  String _paymentLabel(PaymentMethod? method) {
    switch (method) {
      case PaymentMethod.card:
        return 'Картой';
      case PaymentMethod.cash:
        return 'Наличные';
      case PaymentMethod.sbp:
        return 'СБП';
      case null:
        return 'Оплата';
    }
  }
}
