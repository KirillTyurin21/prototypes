import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../theme/kso_constants.dart';
import 'kso_product_card.dart';

class KsoProductGrid extends StatelessWidget {
  final List<Product> products;
  final ValueChanged<Product>? onProductTap;
  final ValueChanged<Product>? onAddTap;

  const KsoProductGrid({
    super.key,
    required this.products,
    this.onProductTap,
    this.onAddTap,
  });

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: KsoSpacing.l),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: KsoSpacing.s,
          crossAxisSpacing: KsoSpacing.s,
          childAspectRatio: 0.72,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final product = products[index];
            return KsoProductCard(
              product: product,
              onTap: onProductTap != null
                  ? () => onProductTap!(product)
                  : null,
              onAddTap:
                  onAddTap != null ? () => onAddTap!(product) : null,
            );
          },
          childCount: products.length,
        ),
      ),
    );
  }
}
