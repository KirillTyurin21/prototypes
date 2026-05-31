import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoHeroBanner extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;
  final VoidCallback? onAddToCart;

  const KsoHeroBanner({
    super.key,
    required this.product,
    this.onTap,
    this.onAddToCart,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 180,
        margin: const EdgeInsets.all(KsoSpacing.l),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(KsoRadius.l),
          gradient: const LinearGradient(
            colors: [Color(0xFF2C2C2C), Color(0xFF1A1A1A)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          children: [
            // Placeholder photo
            Positioned(
              right: -20,
              top: -20,
              bottom: -20,
              child: AspectRatio(
                aspectRatio: 1,
                child: Container(
                  decoration: const BoxDecoration(
                    color: KsoColors.surfaceVariant,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.local_cafe,
                    size: 60,
                    color: KsoColors.accentLight,
                  ),
                ),
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(KsoSpacing.xl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: KsoColors.accent.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(KsoRadius.s),
                    ),
                    child: const Text(
                      'Горячее предложение',
                      style: TextStyle(
                        color: KsoColors.accentLight,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    formatPrice(product.basePrice),
                    style: const TextStyle(
                      color: KsoColors.accentLight,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: onAddToCart,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: KsoColors.accent,
                        borderRadius: BorderRadius.circular(KsoRadius.s),
                      ),
                      child: const Text(
                        'Добавить',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
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
