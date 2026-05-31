import '../models/category.dart';
import '../models/modifier.dart';
import '../models/product.dart';

// ── Modifier Groups ──

const kSizeGroup = ModifierGroup(
  id: 'size',
  name: 'Размер',
  type: ModifierType.singleSelect,
  isRequired: true,
  defaultOptionId: 'medium',
  options: [
    Modifier(id: 'small', name: 'Маленький (250 мл)'),
    Modifier(id: 'medium', name: 'Средний (350 мл)', extraPrice: 200),
    Modifier(id: 'large', name: 'Большой (450 мл)', extraPrice: 400),
  ],
);

const kMilkGroup = ModifierGroup(
  id: 'milk',
  name: 'Молоко',
  type: ModifierType.singleSelect,
  defaultOptionId: 'regular',
  options: [
    Modifier(id: 'regular', name: 'Обычное'),
    Modifier(id: 'oat', name: 'Овсяное', extraPrice: 200),
    Modifier(id: 'coconut', name: 'Кокосовое', extraPrice: 250),
    Modifier(id: 'almond', name: 'Миндальное', extraPrice: 200),
  ],
);

const kToppingsGroup = ModifierGroup(
  id: 'toppings',
  name: 'Добавки',
  type: ModifierType.multiSelect,
  options: [
    Modifier(id: 'caramel', name: 'Карамельный сироп', extraPrice: 200),
    Modifier(id: 'vanilla', name: 'Ванильный сироп', extraPrice: 200),
    Modifier(id: 'lavender', name: 'Лавандовый сироп', extraPrice: 250),
    Modifier(id: 'espresso-shot', name: 'Шот эспрессо', extraPrice: 300),
    Modifier(id: 'cream', name: 'Взбитые сливки', extraPrice: 150),
  ],
);

// ── Categories ──

const kCategories = <Category>[
  Category(id: 'coffee', name: 'Кофе', sortOrder: 0),
  Category(id: 'hot', name: 'Горячие напитки', sortOrder: 1),
  Category(id: 'cold', name: 'Холодные напитки', sortOrder: 2),
  Category(id: 'tea', name: 'Чай', sortOrder: 3),
  Category(id: 'desserts', name: 'Десерты', sortOrder: 4),
  Category(id: 'pastry', name: 'Выпечка', sortOrder: 5),
  Category(id: 'breakfast', name: 'Завтраки', sortOrder: 6),
  Category(id: 'smoothie', name: 'Смузи', sortOrder: 7),
];

// ── Products ──

const kProducts = <Product>[
  // ── Кофе ──
  Product(
    id: 'latte',
    name: 'Латте',
    description: 'Двойной эспрессо с нежной молочной пенкой',
    basePrice: 1200,
    categoryId: 'coffee',
    modifierGroups: [kSizeGroup, kMilkGroup, kToppingsGroup],
    volume: '350 мл',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'cappuccino',
    name: 'Капучино',
    description: 'Эспрессо с плотной молочной пенкой',
    basePrice: 1100,
    categoryId: 'coffee',
    modifierGroups: [kSizeGroup, kMilkGroup, kToppingsGroup],
    volume: '300 мл',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'americano',
    name: 'Американо',
    description: 'Классический эспрессо с горячей водой',
    basePrice: 900,
    categoryId: 'coffee',
    modifierGroups: [kSizeGroup, kToppingsGroup],
    volume: '300 мл',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'raf',
    name: 'Раф',
    description: 'Сливочный кофейный напиток',
    basePrice: 1300,
    categoryId: 'coffee',
    modifierGroups: [kSizeGroup, kMilkGroup, kToppingsGroup],
    volume: '350 мл',
    imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'flat-white',
    name: 'Флэт Уайт',
    description: 'Двойной эспрессо с бархатистым молоком',
    basePrice: 1200,
    categoryId: 'coffee',
    modifierGroups: [kSizeGroup, kMilkGroup],
    volume: '250 мл',
    imageUrl: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?w=400&h=400&fit=crop',
  ),

  // ── Горячие напитки ──
  Product(
    id: 'cocoa',
    name: 'Какао',
    description: 'Горячий какао на молоке с маршмеллоу',
    basePrice: 1000,
    categoryId: 'hot',
    modifierGroups: [kSizeGroup, kMilkGroup],
    volume: '350 мл',
    imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'hot-chocolate',
    name: 'Горячий шоколад',
    description: 'Насыщенный бельгийский шоколад',
    basePrice: 1200,
    categoryId: 'hot',
    modifierGroups: [kSizeGroup],
    volume: '300 мл',
    imageUrl: 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=400&h=400&fit=crop',
  ),

  // ── Холодные напитки ──
  Product(
    id: 'ice-latte',
    name: 'Айс Латте',
    description: 'Охлаждённый латте со льдом',
    basePrice: 1400,
    categoryId: 'cold',
    modifierGroups: [kSizeGroup, kMilkGroup, kToppingsGroup],
    volume: '400 мл',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'ice-americano',
    name: 'Айс Американо',
    description: 'Холодный эспрессо с водой и льдом',
    basePrice: 1100,
    categoryId: 'cold',
    modifierGroups: [kSizeGroup],
    volume: '400 мл',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'mango-lemonade',
    name: 'Лимонад Манго',
    description: 'Освежающий лимонад с пюре манго',
    basePrice: 1300,
    categoryId: 'cold',
    modifierGroups: [kSizeGroup],
    volume: '400 мл',
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop',
  ),

  // ── Чай ──
  Product(
    id: 'green-tea',
    name: 'Зелёный чай',
    description: 'Японский зелёный чай сенча',
    basePrice: 700,
    categoryId: 'tea',
    modifierGroups: [kSizeGroup],
    volume: '400 мл',
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'sea-buckthorn',
    name: 'Облепиховый чай',
    description: 'Ягодный чай с облепихой и мёдом',
    basePrice: 900,
    categoryId: 'tea',
    modifierGroups: [kSizeGroup],
    volume: '400 мл',
    imageUrl: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d14e?w=400&h=400&fit=crop',
  ),

  // ── Десерты ──
  Product(
    id: 'cheesecake',
    name: 'Чизкейк',
    description: 'Классический нью-йоркский чизкейк',
    basePrice: 1800,
    categoryId: 'desserts',
    imageUrl: 'https://images.unsplash.com/photo-1524351199432-d330df15f4a7?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'tiramisu',
    name: 'Тирамису',
    description: 'Итальянский десерт с маскарпоне и кофе',
    basePrice: 2000,
    categoryId: 'desserts',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'napoleon',
    name: 'Наполеон',
    description: 'Слоёный торт с заварным кремом',
    basePrice: 1600,
    categoryId: 'desserts',
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=400&fit=crop',
  ),

  // ── Выпечка ──
  Product(
    id: 'almond-croissant',
    name: 'Круассан с миндалём',
    description: 'Хрустящий круассан с миндальной начинкой',
    basePrice: 1200,
    categoryId: 'pastry',
    canBeHeated: true,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'chocolate-croissant',
    name: 'Круассан с шоколадом',
    description: 'Слоёный круассан с бельгийским шоколадом',
    basePrice: 1100,
    categoryId: 'pastry',
    canBeHeated: true,
    imageUrl: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'cinnabon',
    name: 'Синнабон',
    description: 'Булочка с корицей и кремовой глазурью',
    basePrice: 1400,
    categoryId: 'pastry',
    canBeHeated: true,
    imageUrl: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=400&fit=crop',
  ),

  // ── Завтраки ──
  Product(
    id: 'eggs-benedict',
    name: 'Яйцо Бенедикт',
    description: 'Яйца пашот на тосте с голландским соусом',
    basePrice: 2800,
    categoryId: 'breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1608039829572-9b6d04a0e2b1?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'avocado-toast',
    name: 'Тост с авокадо',
    description: 'Тост с авокадо, яйцом пашот и микрозеленью',
    basePrice: 2400,
    categoryId: 'breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop',
  ),

  // ── Смузи ──
  Product(
    id: 'berry-smoothie',
    name: 'Ягодный смузи',
    description: 'Малина, клубника, голубика и банан',
    basePrice: 1500,
    categoryId: 'smoothie',
    modifierGroups: [kSizeGroup],
    volume: '400 мл',
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
  ),
  Product(
    id: 'tropical-smoothie',
    name: 'Тропический смузи',
    description: 'Манго, маракуйя, ананас и кокосовое молоко',
    basePrice: 1600,
    categoryId: 'smoothie',
    modifierGroups: [kSizeGroup],
    volume: '400 мл',
    imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=400&fit=crop',
  ),
];

/// Продукты по категории
List<Product> getProductsByCategory(String categoryId) {
  return kProducts.where((p) => p.categoryId == categoryId).toList();
}

/// Featured-продукт для Hero-баннера
Product? get featuredProduct {
  final matches = kProducts.where((p) => p.isFeatured);
  return matches.isEmpty ? null : matches.first;
}

/// Upsell-продукты (десерты + выпечка, макс. 4)
List<Product> get upsellProducts {
  return kProducts
      .where((p) => p.categoryId == 'desserts' || p.categoryId == 'pastry')
      .take(4)
      .toList();
}
