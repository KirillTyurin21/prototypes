import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoUpsellCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onAddTap;

  const KsoUpsellCard({
    super.key,
    required this.product,
    this.onAddTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(KsoRadius.m),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Photo placeholder
          SizedBox(
            height: 80,
            width: double.infinity,
            child: Container(
              color: KsoColors.background,
              child: const Center(
                child: Icon(Icons.local_cafe,
                    size: 32, color: KsoColors.textSecondary),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(KsoSpacing.s),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w500),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Text(
                        formatPrice(product.basePrice),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    GestureDetector(
                      onTap: onAddTap,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: KsoColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.add,
                            color: Colors.white, size: 14),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
