import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/responsive.dart';
import '../../dev_panel/dev_panel_service.dart';
import '../../shared/services/order_service.dart';
import 'mock_catalog.dart';
import 'catalog_models.dart';

/// Экран каталога — категории слева, сетка товаров справа.
/// Светлый фон #ECEDEF, настраиваемый header-баннер с закруглёнными краями.
class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final _order = OrderService();
  final _dev = DevPanelService();

  String _activeCategoryId = mockCategories.first.id;
  final ScrollController _gridScrollCtrl = ScrollController();

  List<CatalogProduct> get _filteredProducts =>
      mockProducts.where((p) => p.categoryId == _activeCategoryId).toList();

  /// Группирует товары по groupName, null → «Все»
  List<_ProductGroup> get _groupedProducts {
    final products = _filteredProducts;
    final map = <String, List<CatalogProduct>>{};
    for (final p in products) {
      final key = p.groupName ?? 'Все';
      map.putIfAbsent(key, () => []).add(p);
    }
    return map.entries.map((e) => _ProductGroup(e.key, e.value)).toList();
  }

  @override
  void dispose() {
    _gridScrollCtrl.dispose();
    super.dispose();
  }

  void _addToCart(CatalogProduct product) {
    _order.addItem(product.id, product.title, product.price);
  }

  String _formatPrice(int price) {
    final str = price.toString();
    final buf = StringBuffer();
    for (int i = 0; i < str.length; i++) {
      if (i > 0 && (str.length - i) % 3 == 0) buf.write(' ');
      buf.write(str[i]);
    }
    return '$buf ₸';
  }

  @override
  Widget build(BuildContext context) {
    final locationLabel = _order.locationLabel;

    return ListenableBuilder(
      listenable: _dev,
      builder: (context, _) {
        final bgColor = Color(_dev.get<int>('catalog_bg_color', defaultValue: 0xFFECEDEF));
        final headerImg = _dev.get<String>('catalog_header_image', defaultValue: '');

        return Scaffold(
          backgroundColor: bgColor,
          body: SafeArea(
            child: Column(
              children: [
                // Верхняя панель
                _buildTopBar(locationLabel),

                // Header-баннер (изображение с закруглёнными краями)
                _buildHeaderBanner(headerImg),

                // Основное содержимое: категории + сетка
                Expanded(
                  child: Row(
                    children: [
                      // Левая панель категорий
                      _buildCategorySidebar(),
                      // Сетка товаров
                      Expanded(child: _buildProductArea()),
                    ],
                  ),
                ),

                // Нижняя панель корзины
                _buildBottomBar(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTopBar(String locationLabel) {
    return Container(
      padding: context.scaledSymmetric(16, 12),
      child: Row(
        children: [
          // Кнопка «Назад» (к сплеш-экрану)
          GestureDetector(
            onTap: () => context.go('/splash'),
            child: Icon(
              Icons.arrow_back_ios_new,
              color: AppColors.darkGrey,
              size: context.scaled(20),
            ),
          ),
          SizedBox(width: context.scaled(8)),
          // Лейбл локации
          Container(
            padding: context.scaledSymmetric(12, 6),
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(context.scaledRadius(8)),
            ),
            child: Text(
              locationLabel,
              style: TextStyle(
                color: AppColors.accent,
                fontSize: context.scaledFont(16),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const Spacer(),
          // Заголовок
          Text(
            'Меню',
            style: TextStyle(
              color: AppColors.black,
              fontSize: context.scaledFont(24),
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          // Заглушка для симметрии
          SizedBox(width: context.scaled(28)),
        ],
      ),
    );
  }

  /// Header-баннер — изображение с закруглёнными краями, как в Figma.
  /// Настраивается через панель настроек (ключ catalog_header_image).
  /// Поддерживает: assets/..., data: URL (загрузка с ПК), http(s): URL.
  Widget _buildHeaderBanner(String imagePath) {
    if (imagePath.isEmpty) return _headerPlaceholder();

    Widget imageWidget;

    if (imagePath.startsWith('data:')) {
      // Data URL — загрузка с ПК
      final bytes = _dataUrlToBytes(imagePath);
      if (bytes.isEmpty) return _headerPlaceholder();
      imageWidget = Image.memory(
        bytes,
        height: context.scaled(160),
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _headerPlaceholder(),
      );
    } else if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // Сетевой URL
      imageWidget = Image.network(
        imagePath,
        height: context.scaled(160),
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _headerPlaceholder(),
      );
    } else {
      // Локальный ассет
      imageWidget = Image.asset(
        imagePath,
        height: context.scaled(160),
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _headerPlaceholder(),
      );
    }

    return Padding(
      padding: context.scaledSymmetric(12, 0),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(context.scaledRadius(16)),
        child: imageWidget,
      ),
    );
  }

  Uint8List _dataUrlToBytes(String dataUrl) {
    final commaIndex = dataUrl.indexOf(',');
    if (commaIndex == -1) return Uint8List(0);
    final base64 = dataUrl.substring(commaIndex + 1);
    try {
      return base64Decode(base64);
    } catch (_) {
      return Uint8List(0);
    }
  }

  Widget _headerPlaceholder() {
    return Container(
      height: context.scaled(160),
      width: double.infinity,
      color: AppColors.darkSurfaceVariant,
      child: Center(
        child: Icon(
          Icons.image_outlined,
          size: context.scaled(48),
          color: AppColors.grey.withValues(alpha: 0.4),
        ),
      ),
    );
  }

  Widget _buildCategorySidebar() {
    return Container(
      width: context.scaled(200),
      decoration: const BoxDecoration(
        color: AppColors.lightSurface,
        border: Border(
          right: BorderSide(
            color: AppColors.lightBorder,
            width: 1,
          ),
        ),
      ),
      child: ListView.builder(
        itemCount: mockCategories.length,
        padding: EdgeInsets.only(top: context.scaled(8)),
        itemBuilder: (context, index) {
          final cat = mockCategories[index];
          final isActive = cat.id == _activeCategoryId;
          return _buildCategoryItem(cat, isActive);
        },
      ),
    );
  }

  Widget _buildCategoryItem(CatalogCategory cat, bool isActive) {
    return GestureDetector(
      onTap: () => setState(() => _activeCategoryId = cat.id),
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: context.scaled(12),
          vertical: context.scaled(14),
        ),
        margin: EdgeInsets.symmetric(
          horizontal: context.scaled(8),
          vertical: context.scaled(3),
        ),
        decoration: BoxDecoration(
          color: isActive ? AppColors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(context.scaledRadius(24)),
          border: Border.all(
            color: isActive ? AppColors.lightBorder : Colors.transparent,
            width: 1,
          ),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: AppColors.black.withValues(alpha: 0.06),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            // Цветная иконка категории
            Container(
              width: context.scaled(36),
              height: context.scaled(36),
              decoration: BoxDecoration(
                color: (categoryColors[cat.id] ?? AppColors.grey)
                    .withValues(alpha: isActive ? 1.0 : 0.15),
                borderRadius: BorderRadius.circular(context.scaledRadius(10)),
              ),
              child: Icon(
                iconForCategory(cat.icon),
                size: context.scaled(20),
                color: isActive
                    ? AppColors.white
                    : (categoryColors[cat.id] ?? AppColors.grey),
              ),
            ),
            SizedBox(width: context.scaled(12)),
            Expanded(
              child: Text(
                cat.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: isActive ? AppColors.black : AppColors.darkGrey,
                  fontSize: context.scaledFont(14),
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  height: 1.3,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductArea() {
    final groups = _groupedProducts;

    if (groups.isEmpty) {
      return Center(
        child: Text(
          'Нет товаров',
          style: TextStyle(
            color: AppColors.grey,
            fontSize: context.scaledFont(18),
          ),
        ),
      );
    }

    return CustomScrollView(
      controller: _gridScrollCtrl,
      slivers: [
        for (final group in groups) ...[
          // Заголовок группы
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(
                context.scaled(12),
                context.scaled(16),
                context.scaled(12),
                context.scaled(8),
              ),
              child: Text(
                group.name,
                style: TextStyle(
                  color: AppColors.black,
                  fontSize: context.scaledFont(18),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),

          // Сетка 2 колонки
          SliverPadding(
            padding: context.scaledSymmetric(12, 0),
            sliver: SliverGrid(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: context.scaled(10),
                crossAxisSpacing: context.scaled(10),
                childAspectRatio: 0.72,
              ),
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => _ProductCard(
                  product: group.products[i],
                  onAdd: () => _addToCart(group.products[i]),
                  formatPrice: _formatPrice,
                ),
                childCount: group.products.length,
              ),
            ),
          ),
        ],

        // Отступ снизу
        const SliverToBoxAdapter(child: SizedBox(height: 16)),
      ],
    );
  }

  Widget _buildBottomBar() {
    final count = _order.itemCount;
    final total = _order.totalPrice;
    final hasItems = count > 0;

    return ListenableBuilder(
      listenable: _order,
      builder: (context, _) {
        final c = _order.itemCount;
        final t = _order.totalPrice;
        final h = c > 0;

        return Container(
          padding: context.scaledSymmetric(16, 14),
          decoration: const BoxDecoration(
            color: AppColors.lightSurface,
            border: Border(
              top: BorderSide(color: AppColors.lightBorder, width: 1),
            ),
          ),
          child: Row(
            children: [
              // Иконка корзины с бейджем
              Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.shopping_cart,
                      color: AppColors.black, size: 28),
                  if (h)
                    Positioned(
                      right: -8,
                      top: -6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: const BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '$c',
                          style: const TextStyle(
                            color: AppColors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              SizedBox(width: context.scaled(12)),

              // Сумма
              Text(
                h ? _formatPrice(t) : 'Корзина пуста',
                style: TextStyle(
                  color: h ? AppColors.black : AppColors.darkGrey,
                  fontSize: context.scaledFont(18),
                  fontWeight: FontWeight.w600,
                ),
              ),

              const Spacer(),

              // Кнопка «Заказать»
              SizedBox(
                height: context.scaled(44),
                child: ElevatedButton(
                  onPressed: h ? () {} : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accent,
                    disabledBackgroundColor: AppColors.disabled,
                    foregroundColor: AppColors.white,
                    disabledForegroundColor: AppColors.grey,
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(context.scaledRadius(12)),
                    ),
                    padding: context.scaledSymmetric(24, 0),
                  ),
                  child: Text(
                    'Заказать',
                    style: TextStyle(
                      fontSize: context.scaledFont(18),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// Карточка товара в сетке каталога (точный дизайн как в Figma)
class _ProductCard extends StatelessWidget {
  final CatalogProduct product;
  final VoidCallback onAdd;
  final String Function(int) formatPrice;

  const _ProductCard({
    required this.product,
    required this.onAdd,
    required this.formatPrice,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.lightSurface,
        borderRadius: BorderRadius.circular(context.scaledRadius(12)),
        border: Border.all(
          color: AppColors.lightBorder,
          width: 1,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Фото товара (заполняет ~55% высоты)
          Expanded(
            flex: 11,
            child: _ProductEmoji(emoji: product.emoji, categoryId: product.categoryId),
          ),

          // Информация о товаре (~45% высоты)
          Expanded(
            flex: 9,
            child: Padding(
              padding: EdgeInsets.fromLTRB(
                context.scaled(10),
                context.scaled(10),
                context.scaled(10),
                context.scaled(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Название
                  Text(
                    product.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: AppColors.black,
                      fontSize: context.scaledFont(16),
                      fontWeight: FontWeight.w500,
                      height: 1.25,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Описание (1 строка)
                  if (product.description != null)
                    Text(
                      product.description!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: AppColors.darkGrey,
                        fontSize: context.scaledFont(12),
                        fontWeight: FontWeight.w400,
                        height: 1.3,
                      ),
                    ),

                  const Spacer(),

                  // Цена и кнопка +
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        formatPrice(product.price),
                        style: TextStyle(
                          color: AppColors.accentLight,
                          fontSize: context.scaledFont(16),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      GestureDetector(
                        onTap: onAdd,
                        child: Container(
                          width: context.scaled(32),
                          height: context.scaled(32),
                          decoration: const BoxDecoration(
                            color: AppColors.accent,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.add,
                            color: AppColors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Модель группы товаров
class _ProductGroup {
  final String name;
  final List<CatalogProduct> products;
  const _ProductGroup(this.name, this.products);
}

/// Фото-плейсхолдер для карточки товара (как в Figma)
class _ProductEmoji extends StatelessWidget {
  final String? emoji;
  final String categoryId;

  const _ProductEmoji({this.emoji, required this.categoryId});

  @override
  Widget build(BuildContext context) {
    final color = categoryColors[categoryId] ?? AppColors.grey;

    return Container(
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Фоновый паттерн (едва заметная текстура)
          Positioned(
            right: -8,
            bottom: -8,
            child: Opacity(
              opacity: 0.08,
              child: Icon(
                iconForCategory(_categoryIconName(categoryId)),
                size: context.scaled(64),
                color: color,
              ),
            ),
          ),
          // Центральный emoji
          Center(
            child: Text(
              emoji ?? '🍽️',
              style: TextStyle(fontSize: context.scaled(52)),
            ),
          ),
        ],
      ),
    );
  }

  String _categoryIconName(String catId) {
    return switch (catId) {
      'soups' => 'soup_kitchen',
      'pizza' => 'local_pizza',
      'burgers' => 'lunch_dining',
      'rolls' => 'set_meal',
      'hot' => 'local_fire_department',
      'salads' => 'eco',
      'drinks' => 'local_cafe',
      'desserts' => 'cake',
      _ => 'restaurant',
    };
  }
}
