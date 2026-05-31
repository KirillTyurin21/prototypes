import 'modifier.dart';

class Product {
  final String id;
  final String name;
  final String description;
  final int basePrice;
  final String categoryId;
  final List<ModifierGroup> modifierGroups;
  final String? volume;
  final bool canBeHeated;
  final bool isFeatured;
  final String imageAsset;

  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.basePrice,
    required this.categoryId,
    this.modifierGroups = const [],
    this.volume,
    this.canBeHeated = false,
    this.isFeatured = false,
    this.imageAsset = '',
  });
}
