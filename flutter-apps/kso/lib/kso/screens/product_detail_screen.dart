import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/mock_data.dart';
import '../kso_shell.dart';
import '../models/modifier.dart';
import '../models/product.dart';
import '../theme/kso_colors.dart';
import '../theme/kso_constants.dart';
import '../widgets/product/kso_add_to_cart_button.dart';
import '../widgets/product/kso_modifier_chip.dart';
import '../widgets/product/kso_modifier_group.dart';
import '../widgets/product/kso_modifier_toggle_row.dart';
import '../widgets/product/kso_product_image.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late final Product _product;
  late final Map<String, List<String>> _selectedModifiers;

  @override
  void initState() {
    super.initState();
    _product = kProducts.firstWhere((p) => p.id == widget.productId);
    _selectedModifiers = _initModifiers(_product);
  }

  /// Pre-select defaults: default option for singleSelect, first option
  /// for required groups without default, empty for multiSelect.
  Map<String, List<String>> _initModifiers(Product product) {
    final map = <String, List<String>>{};
    for (final group in product.modifierGroups) {
      if (group.defaultOptionId != null) {
        map[group.id] = [group.defaultOptionId!];
      } else if (group.type == ModifierType.singleSelect &&
          group.isRequired &&
          group.options.isNotEmpty) {
        map[group.id] = [group.options.first.id];
      } else {
        map[group.id] = [];
      }
    }
    return map;
  }

  /// Total price = base price + all selected modifier extra prices.
  int get _totalPrice {
    int price = _product.basePrice;
    for (final group in _product.modifierGroups) {
      final selectedIds = _selectedModifiers[group.id] ?? [];
      for (final mod in group.options) {
        if (selectedIds.contains(mod.id)) {
          price += mod.extraPrice;
        }
      }
    }
    return price;
  }

  void _onSingleSelect(String groupId, String modifierId) {
    setState(() {
      _selectedModifiers[groupId] = [modifierId];
    });
  }

  void _onMultiToggle(String groupId, String modifierId) {
    setState(() {
      final list = List<String>.from(_selectedModifiers[groupId] ?? []);
      if (list.contains(modifierId)) {
        list.remove(modifierId);
      } else {
        list.add(modifierId);
      }
      _selectedModifiers[groupId] = list;
    });
  }

  void _addToCart() {
    CartStateProvider.of(context)
        .addItem(_product, Map<String, List<String>>.from(_selectedModifiers));
    context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product image with back button
                  KsoProductImage(
                    imageUrl: _product.imageUrl,
                    heroTag: 'product-${_product.id}',
                    onBackTap: () => context.pop(),
                  ),
                  // Product info: name, volume, description, price
                  _buildProductInfo(),
                  // Modifier groups
                  ..._product.modifierGroups.map(_buildModifierGroup),
                  const SizedBox(height: KsoSpacing.xxl),
                ],
              ),
            ),
          ),
          // Fixed bottom: add to cart button
          KsoAddToCartButton(
            price: _totalPrice,
            onPressed: _addToCart,
          ),
        ],
      ),
    );
  }

  // ── Product info section ──

  Widget _buildProductInfo() {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.all(KsoSpacing.l),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Name
          Text(
            _product.name,
            style: theme.textTheme.headlineLarge?.copyWith(
              color: theme.colorScheme.onSurface,
            ),
          ),
          // Volume (if present)
          if (_product.volume != null) ...[
            const SizedBox(height: KsoSpacing.xs),
            Text(
              _product.volume!,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
          const SizedBox(height: KsoSpacing.s),
          // Description
          Text(
            _product.description,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: KsoSpacing.m),
          // Base price
          Text(
            formatPrice(_product.basePrice),
            style: const TextStyle(
              color: KsoColors.accentLight,
              fontSize: 22,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  // ── Modifier group rendering ──

  Widget _buildModifierGroup(ModifierGroup group) {
    final selectedIds = _selectedModifiers[group.id] ?? [];

    final Widget content;
    if (group.type == ModifierType.singleSelect) {
      content = _buildChipSelector(group, selectedIds);
    } else {
      content = _buildToggleList(group, selectedIds);
    }

    return KsoModifierGroup(
      title: group.name,
      isRequired: group.isRequired,
      child: content,
    );
  }

  /// Single-select: horizontal wrap of chips (e.g. size, milk).
  Widget _buildChipSelector(ModifierGroup group, List<String> selectedIds) {
    return Wrap(
      spacing: KsoSpacing.s,
      runSpacing: KsoSpacing.s,
      children: group.options.map((mod) {
        return KsoModifierChip(
          label: mod.name,
          isSelected: selectedIds.contains(mod.id),
          extraPriceLabel:
              mod.extraPrice > 0 ? '+${formatPrice(mod.extraPrice)}' : null,
          onTap: () => _onSingleSelect(group.id, mod.id),
        );
      }).toList(),
    );
  }

  /// Multi-select: vertical list with toggle rows (e.g. toppings).
  Widget _buildToggleList(ModifierGroup group, List<String> selectedIds) {
    return Column(
      children: group.options.map((mod) {
        return KsoModifierToggleRow(
          name: mod.name,
          extraPrice: mod.extraPrice,
          isSelected: selectedIds.contains(mod.id),
          onToggle: () => _onMultiToggle(group.id, mod.id),
        );
      }).toList(),
    );
  }
}
