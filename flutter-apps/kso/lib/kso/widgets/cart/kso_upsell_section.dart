import 'package:flutter/material.dart';
import '../../models/product.dart';
import '../../theme/kso_constants.dart';
import 'kso_upsell_card.dart';

class KsoUpsellSection extends StatelessWidget {
  final List<Product> products;
  final ValueChanged<Product>? onAddTap;

  const KsoUpsellSection({
    super.key,
    required this.products,
    this.onAddTap,
  });

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: KsoSpacing.l),
          child: Text(
            'вместе вкуснее',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface,
                ),
          ),
        ),
        const SizedBox(height: KsoSpacing.m),
        SizedBox(
          height: 150,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding:
                const EdgeInsets.symmetric(horizontal: KsoSpacing.l),
            itemCount: products.length,
            separatorBuilder: (_, _) =>
                const SizedBox(width: KsoSpacing.m),
            itemBuilder: (context, index) {
              final product = products[index];
              return KsoUpsellCard(
                product: product,
                onAddTap: onAddTap != null
                    ? () => onAddTap!(product)
                    : null,
              );
            },
          ),
        ),
      ],
    );
  }
}
