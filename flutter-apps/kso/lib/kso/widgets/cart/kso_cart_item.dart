import 'package:flutter/material.dart';
import '../../models/cart_item.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';
import '../common/kso_quantity_selector.dart';

class KsoCartItemWidget extends StatelessWidget {
  final CartItem item;
  final ValueChanged<int> onQuantityChanged;
  final ValueChanged<bool>? onDoNotHeatChanged;

  const KsoCartItemWidget({
    super.key,
    required this.item,
    required this.onQuantityChanged,
    this.onDoNotHeatChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: KsoSpacing.l,
        vertical: KsoSpacing.xs,
      ),
      padding: const EdgeInsets.all(KsoSpacing.m),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(KsoRadius.m),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Photo placeholder
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: KsoColors.background,
              borderRadius: BorderRadius.circular(KsoRadius.s),
            ),
            child: const Center(
              child: Icon(Icons.local_cafe,
                  size: 32, color: KsoColors.textSecondary),
            ),
          ),
          const SizedBox(width: KsoSpacing.m),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.product.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: KsoColors.textPrimary,
                  ),
                ),
                if (item.modifierSummary.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      item.modifierSummary.join(', '),
                      style: const TextStyle(
                        fontSize: 13,
                        color: KsoColors.textSecondary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                if (item.product.volume != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      item.product.volume!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: KsoColors.textSecondary,
                      ),
                    ),
                  ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      formatPrice(item.totalPrice),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: KsoColors.textPrimary,
                      ),
                    ),
                    KsoQuantitySelector(
                      quantity: item.quantity,
                      onChanged: onQuantityChanged,
                      color: KsoColors.primary,
                    ),
                  ],
                ),
                if (item.product.canBeHeated)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: GestureDetector(
                      onTap: () =>
                          onDoNotHeatChanged?.call(!item.doNotHeat),
                      child: Row(
                        children: [
                          Icon(
                            item.doNotHeat
                                ? Icons.check_box
                                : Icons.check_box_outline_blank,
                            size: 20,
                            color: KsoColors.primary,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Не греть',
                            style: TextStyle(
                              fontSize: 14,
                              color: KsoColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
