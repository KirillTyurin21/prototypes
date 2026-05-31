import 'product.dart';

class CartItem {
  final String id;
  final Product product;
  int quantity;
  final Map<String, List<String>> selectedModifierIds;
  bool doNotHeat;

  CartItem({
    required this.id,
    required this.product,
    this.quantity = 1,
    required this.selectedModifierIds,
    this.doNotHeat = false,
  });

  int get unitPrice {
    int extra = 0;
    for (final entry in selectedModifierIds.entries) {
      final groupIndex =
          product.modifierGroups.indexWhere((g) => g.id == entry.key);
      if (groupIndex == -1) continue;
      final group = product.modifierGroups[groupIndex];
      for (final modId in entry.value) {
        final modIndex = group.options.indexWhere((m) => m.id == modId);
        if (modIndex == -1) continue;
        extra += group.options[modIndex].extraPrice;
      }
    }
    return product.basePrice + extra;
  }

  int get totalPrice => unitPrice * quantity;

  List<String> get modifierSummary {
    final result = <String>[];
    for (final entry in selectedModifierIds.entries) {
      final groupIndex =
          product.modifierGroups.indexWhere((g) => g.id == entry.key);
      if (groupIndex == -1) continue;
      final group = product.modifierGroups[groupIndex];
      for (final modId in entry.value) {
        final modIndex = group.options.indexWhere((m) => m.id == modId);
        if (modIndex == -1) continue;
        result.add(group.options[modIndex].name);
      }
    }
    return result;
  }
}
