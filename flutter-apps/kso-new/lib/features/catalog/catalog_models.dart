/// Категория каталога
class CatalogCategory {
  final String id;
  final String title;
  final String icon; // Material icon name

  const CatalogCategory({
    required this.id,
    required this.title,
    required this.icon,
  });
}

/// Товар в каталоге
class CatalogProduct {
  final String id;
  final String categoryId;
  final String title;
  final String? description;
  final int price; // в тенге
  final String? imageAsset;

  const CatalogProduct({
    required this.id,
    required this.categoryId,
    required this.title,
    this.description,
    required this.price,
    this.imageAsset,
  });
}
