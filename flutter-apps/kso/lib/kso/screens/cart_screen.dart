import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/mock_data.dart';
import '../kso_shell.dart';
import '../models/product.dart';
import '../theme/kso_constants.dart';
import '../widgets/cart/kso_cart_bottom_bar.dart';
import '../widgets/cart/kso_cart_header.dart';
import '../widgets/cart/kso_cart_item.dart';
import '../widgets/cart/kso_clear_cart_dialog.dart';
import '../widgets/cart/kso_upsell_section.dart';
import '../widgets/common/kso_back_button.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  late final TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final cart = CartStateProvider.of(context);
    if (cart.customerName != null &&
        _nameController.text != cart.customerName) {
      _nameController.text = cart.customerName!;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _onNameChanged() {
    final name = _nameController.text.trim();
    CartStateProvider.of(context)
        .setCustomerName(name.isEmpty ? null : name);
  }

  Future<void> _onClearTap() async {
    final confirmed = await KsoClearCartDialog.show(context);
    if (confirmed == true && mounted) {
      CartStateProvider.of(context).clear();
      context.go('/kso');
    }
  }

  void _onCheckout() {
    _onNameChanged();
    context.go('/kso/checkout/type');
  }

  /// Default modifiers for quick-add from upsell.
  Map<String, List<String>> _defaultModifiers(Product product) {
    return {
      for (final group in product.modifierGroups)
        group.id: group.defaultOptionId != null
            ? [group.defaultOptionId!]
            : group.isRequired && group.options.isNotEmpty
                ? [group.options.first.id]
                : <String>[],
    };
  }

  @override
  Widget build(BuildContext context) {
    final cart = CartStateProvider.of(context);

    if (cart.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.transparent,
        body: _buildEmptyState(),
      );
    }

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
                        onPressed: () => context.go('/kso'),
                      ),
                    ),
                  ),
                ),
                // Header: name input + QR + trash
                SliverToBoxAdapter(
                  child: KsoCartHeader(
                    nameController: _nameController,
                    onClearTap: _onClearTap,
                  ),
                ),
                // Cart items list
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final item = cart.items[index];
                      return KsoCartItemWidget(
                        item: item,
                        onQuantityChanged: (qty) {
                          cart.updateQuantity(item.id, qty);
                        },
                        onDoNotHeatChanged: item.product.canBeHeated
                            ? (_) => cart.toggleDoNotHeat(item.id)
                            : null,
                      );
                    },
                    childCount: cart.items.length,
                  ),
                ),
                // Upsell section
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.only(top: KsoSpacing.xl),
                    child: KsoUpsellSection(
                      products: upsellProducts,
                      onAddTap: (product) {
                        cart.addItem(product, _defaultModifiers(product));
                      },
                    ),
                  ),
                ),
                // Bottom spacing
                const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
              ],
            ),
          ),
          // Bottom bar: total + estimated time + checkout
          KsoCartBottomBar(
            totalPrice: cart.totalPrice,
            estimatedMinutes: cart.estimatedMinutes,
            onCheckoutTap: _onCheckout,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 80,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: KsoSpacing.l),
          Text(
            'Корзина пуста',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface,
                ),
          ),
          const SizedBox(height: KsoSpacing.s),
          Text(
            'Добавьте что-нибудь из меню',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
          const SizedBox(height: KsoSpacing.xxl),
          FilledButton.icon(
            onPressed: () => context.go('/kso'),
            icon: const Icon(Icons.arrow_back),
            label: const Text('В меню'),
          ),
        ],
      ),
    );
  }
}
