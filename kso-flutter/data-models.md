# Модели данных КСО

> Заполни по шаблону из `files/kso-flutter-research/UNDERSTANDING_KSO_FLUTTER_NEW.md` (п. 1.2)

## Product

```
Product {
  String id;
  String name;
  String description;
  String? imageUrl;
  int basePrice;          // в копейках
  String categoryId;
  List<ModifierGroup> modifierGroups;
}
```

## Category

```
Category {
  String id;
  String name;
  int sortOrder;
}
```

## ModifierGroup

```
ModifierGroup {
  String id;
  String name;
  bool isRequired;
  List<Modifier> options;
}
```

## Modifier

```
Modifier {
  String id;
  String name;
  int extraPrice;         // в копейках
}
```

## CartItem

```
CartItem {
  String id;
  Product product;
  int quantity;
  Map<String, List<String>> selectedModifierIds;
  bool doNotHeat;
}
```

## Order

```
Order {
  String orderNumber;
  List<CartItem> items;
  OrderType type;            // takeaway / dineIn
  PaymentMethod paymentMethod; // card / cash / sbp
  int totalPrice;
  int estimatedMinutes;
  OrderStatus status;        // created / processing / success
}
```
