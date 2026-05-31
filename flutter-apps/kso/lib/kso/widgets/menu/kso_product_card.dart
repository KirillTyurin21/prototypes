import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;
  final VoidCallback? onAddTap;

  const KsoProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.onAddTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: KsoColors.darkSurface,
          borderRadius: BorderRadius.circular(KsoRadius.m),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Photo placeholder with Hero animation
            AspectRatio(
              aspectRatio: 1,
              child: Hero(
                tag: 'product-${product.id}',
                child: Container(
                  color: KsoColors.darkSurfaceVariant,
                  child: Center(
                    child: Icon(
                      Icons.local_cafe,
                      size: 48,
                      color: KsoColors.darkOnSurfaceSecondary
                          .withValues(alpha: 0.5),
                    ),
                  ),
                ),
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(KsoSpacing.m),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                      color: KsoColors.darkOnSurface,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        formatPrice(product.basePrice),
                        style: const TextStyle(
                          color: KsoColors.accentLight,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      GestureDetector(
                        onTap: onAddTap,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: KsoColors.accent,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.add,
                              color: Colors.white, size: 18),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
