import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../data/mock_data.dart';
import '../kso_shell.dart';
import '../models/product.dart';
import '../theme/kso_colors.dart';
import '../theme/kso_constants.dart';
import '../widgets/menu/kso_category_tabs.dart';
import '../widgets/menu/kso_hero_banner.dart';
import '../widgets/menu/kso_menu_bottom_bar.dart';
import '../widgets/menu/kso_product_card.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen>
    with SingleTickerProviderStateMixin {
  String _selectedCategoryId = kCategories.first.id;
  late final ScrollController _scrollController;
  late final AnimationController _staggerController;

  List<Product> get _filteredProducts =>
      getProductsByCategory(_selectedCategoryId);

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _staggerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..forward();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _staggerController.dispose();
    super.dispose();
  }

  void _onCategoryChanged(String categoryId) {
    if (categoryId == _selectedCategoryId) return;
    setState(() {
      _selectedCategoryId = categoryId;
    });
    _staggerController.reset();
    _staggerController.forward();
  }

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
    final products = _filteredProducts;
    final featured = featuredProduct;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              // Safe area top
              SliverToBoxAdapter(
                child: SizedBox(
                  height: MediaQuery.of(context).padding.top + KsoSpacing.s,
                ),
              ),
              // Header: title + language badge
              SliverToBoxAdapter(child: _buildHeader()),
              // Hero banner with parallax
              if (featured != null)
                SliverToBoxAdapter(
                  child: _buildParallaxBanner(featured),
                ),
              // Category tabs
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(
                    top: KsoSpacing.l,
                    bottom: KsoSpacing.m,
                  ),
                  child: KsoCategoryTabs(
                    categories: kCategories,
                    selectedCategoryId: _selectedCategoryId,
                    onCategorySelected: _onCategoryChanged,
                  ),
                ),
              ),
              // Product grid with staggered animation
              _buildAnimatedGrid(products),
              // Bottom padding so content is not hidden by bottom bar
              const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
            ],
          ),
          // Bottom bar — reactive to cart changes only
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Builder(
              builder: (innerContext) {
                final cart = CartStateProvider.of(innerContext);
                return KsoMenuBottomBar(
                  itemCount: cart.itemCount,
                  totalPrice: cart.totalPrice,
                  onCartTap: () => context.go('/kso/cart'),
                  onOrderTap: () => context.go('/kso/cart'),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ── Header ──

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: KsoSpacing.l,
        vertical: KsoSpacing.s,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Coffee House',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              border: Border.all(color: KsoColors.border),
              borderRadius: BorderRadius.circular(KsoRadius.s),
            ),
            child: const Text(
              'RU',
              style: TextStyle(
                color: KsoColors.textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Hero banner with parallax ──

  Widget _buildParallaxBanner(Product product) {
    return ListenableBuilder(
      listenable: _scrollController,
      builder: (context, child) {
        final scrollOffset = _scrollController.hasClients
            ? _scrollController.offset.clamp(0.0, 300.0)
            : 0.0;
        return Opacity(
          opacity: (1.0 - scrollOffset / 400).clamp(0.0, 1.0),
          child: Transform.translate(
            offset: Offset(0, scrollOffset * 0.3),
            child: child,
          ),
        );
      },
      child: KsoHeroBanner(
        product: product,
        onTap: () => context.go('/kso/product/${product.id}'),
        onAddToCart: () {
          CartStateProvider.of(context)
              .addItem(product, _defaultModifiers(product));
        },
      ),
    );
  }

  // ── Product grid with staggered fade + slide ──

  Widget _buildAnimatedGrid(List<Product> products) {
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

            // Stagger: 60ms per card, 300ms animation each
            final start = (index * 0.06).clamp(0.0, 0.7);
            final end = (start + 0.3).clamp(0.0, 1.0);

            return AnimatedBuilder(
              animation: _staggerController,
              builder: (context, child) {
                final value = Interval(start, end, curve: Curves.easeOut)
                    .transform(_staggerController.value);
                return Opacity(
                  opacity: value,
                  child: Transform.translate(
                    offset: Offset(0, 20 * (1 - value)),
                    child: child,
                  ),
                );
              },
              child: KsoProductCard(
                product: product,
                onTap: () => context.go('/kso/product/${product.id}'),
                onAddTap: () {
                  CartStateProvider.of(context)
                      .addItem(product, _defaultModifiers(product));
                },
              ),
            );
          },
          childCount: products.length,
        ),
      ),
    );
  }
}
