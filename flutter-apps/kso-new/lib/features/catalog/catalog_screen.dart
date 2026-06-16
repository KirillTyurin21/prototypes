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
                      Expanded(child: _buildProductGrid()),
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
          color: isActive
              ? AppColors.accent.withValues(alpha: 0.12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(context.scaledRadius(10)),
          border: Border.all(
            color: isActive
                ? AppColors.accent.withValues(alpha: 0.4)
                : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Row(
          children: [
            Icon(
              iconForCategory(cat.icon),
              size: context.scaled(24),
              color: isActive ? AppColors.accent : AppColors.grey,
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

  Widget _buildProductGrid() {
    final products = _filteredProducts;

    if (products.isEmpty) {
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

    return GridView.builder(
      controller: _gridScrollCtrl,
      padding: context.scaledPadding(12),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: context.scaled(12),
        crossAxisSpacing: context.scaled(12),
        childAspectRatio: 0.68,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        return _ProductCard(
          product: products[index],
          onAdd: () => _addToCart(products[index]),
          formatPrice: _formatPrice,
        );
      },
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

/// Карточка товара в сетке каталога
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
        boxShadow: const [
          BoxShadow(
            color: Color(0x1A000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Изображение товара
          Expanded(
            flex: 5,
            child: Container(
              color: AppColors.catalogBackground,
              child: Center(
                child: Icon(
                  Icons.restaurant,
                  size: context.scaled(40),
                  color: AppColors.grey.withValues(alpha: 0.4),
                ),
              ),
            ),
          ),

          // Информация о товаре
          Expanded(
            flex: 4,
            child: Padding(
              padding: context.scaledSymmetric(10, 6),
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
                      fontSize: context.scaledFont(14),
                      fontWeight: FontWeight.w600,
                      height: 1.2,
                    ),
                  ),
                  const Spacer(),

                  // Цена и кнопка +
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        formatPrice(product.price),
                        style: TextStyle(
                          color: AppColors.accent,
                          fontSize: context.scaledFont(16),
                          fontWeight: FontWeight.bold,
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
