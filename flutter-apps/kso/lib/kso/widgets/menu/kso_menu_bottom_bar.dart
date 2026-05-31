import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';
import '../common/kso_bottom_bar.dart';

class KsoMenuBottomBar extends StatelessWidget {
  final int itemCount;
  final int totalPrice;
  final VoidCallback? onCartTap;
  final VoidCallback? onOrderTap;

  const KsoMenuBottomBar({
    super.key,
    required this.itemCount,
    required this.totalPrice,
    this.onCartTap,
    this.onOrderTap,
  });

  @override
  Widget build(BuildContext context) {
    if (itemCount == 0) return const SizedBox.shrink();

    return KsoBottomBar(
      backgroundColor: KsoColors.surface,
      child: Row(
        children: [
          // Cart icon with badge
          GestureDetector(
            onTap: onCartTap,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.shopping_cart,
                    color: Colors.white, size: 28),
                Positioned(
                  right: -8,
                  top: -6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: KsoColors.accent,
                      shape: BoxShape.circle,
                    ),
                    constraints:
                        const BoxConstraints(minWidth: 20, minHeight: 20),
                    child: Text(
                      '$itemCount',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // Total
          Text(
            formatPrice(totalPrice),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          // Order button
          GestureDetector(
            onTap: onOrderTap ?? onCartTap,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: KsoColors.accent,
                borderRadius: BorderRadius.circular(KsoRadius.m),
              ),
              child: const Text(
                'Заказать',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
