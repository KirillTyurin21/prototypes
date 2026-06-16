import 'package:flutter/material.dart';
import 'catalog_models.dart';

/// Мок-данные для каталога КСО.

/// Цвета категорий для иконок
const Map<String, Color> categoryColors = {
  'soups': Color(0xFFFF9800),
  'pizza': Color(0xFFE53935),
  'burgers': Color(0xFF795548),
  'rolls': Color(0xFF43A047),
  'hot': Color(0xFFF4511E),
  'salads': Color(0xFF66BB6A),
  'drinks': Color(0xFF1E88E5),
  'desserts': Color(0xFFEC407A),
};

const List<CatalogCategory> mockCategories = [
  CatalogCategory(id: 'soups', title: 'Супы', icon: 'soup_kitchen'),
  CatalogCategory(id: 'pizza', title: 'Пицца', icon: 'local_pizza'),
  CatalogCategory(id: 'burgers', title: 'Бургеры', icon: 'lunch_dining'),
  CatalogCategory(id: 'rolls', title: 'Роллы', icon: 'set_meal'),
  CatalogCategory(id: 'hot', title: 'Горячее', icon: 'local_fire_department'),
  CatalogCategory(id: 'salads', title: 'Салаты', icon: 'eco'),
  CatalogCategory(id: 'drinks', title: 'Напитки', icon: 'local_cafe'),
  CatalogCategory(id: 'desserts', title: 'Десерты', icon: 'cake'),
];

const List<CatalogProduct> mockProducts = [
  // Супы
  CatalogProduct(id: 'sp1', categoryId: 'soups', title: 'Борщ', description: 'Классический борщ со сметаной', price: 1400, groupName: 'Классические супы', emoji: '🍲'),
  CatalogProduct(id: 'sp2', categoryId: 'soups', title: 'Куриный суп', description: 'Лапша, курица, овощи, зелень', price: 1200, groupName: 'Классические супы', emoji: '🍜'),
  CatalogProduct(id: 'sp4', categoryId: 'soups', title: 'Солянка', description: 'Мясное ассорти, оливки, лимон', price: 1800, groupName: 'Классические супы', emoji: '🥘'),
  CatalogProduct(id: 'sp5', categoryId: 'soups', title: 'Грибной крем-суп', description: 'Шампиньоны, сливки, гренки', price: 1300, groupName: 'Крем-супы', emoji: '🥣'),
  CatalogProduct(id: 'sp3', categoryId: 'soups', title: 'Том Ям', description: 'Креветки, кокосовое молоко, лемонграсс', price: 2600, groupName: 'Азиатские супы', emoji: '🦐'),

  // Роллы
  CatalogProduct(id: 'r1', categoryId: 'rolls', title: 'Филадельфия', description: 'Лосось, сливочный сыр, огурец', price: 2800, groupName: 'Классические роллы', emoji: '🍣'),
  CatalogProduct(id: 'r2', categoryId: 'rolls', title: 'Калифорния', description: 'Краб, авокадо, огурец, икра', price: 2500, groupName: 'Классические роллы', emoji: '🍱'),
  CatalogProduct(id: 'r4', categoryId: 'rolls', title: 'Сяке Маки', description: 'Лосось, рис, нори', price: 1800, groupName: 'Классические роллы', emoji: '🍣'),
  CatalogProduct(id: 'r3', categoryId: 'rolls', title: 'Дракон', description: 'Угорь, сливочный сыр, соус унаги', price: 3200, groupName: 'Запечённые роллы', emoji: '🐉'),
  CatalogProduct(id: 'r5', categoryId: 'rolls', title: 'Темпура ролл', description: 'Креветка темпура, сливочный сыр', price: 2600, groupName: 'Запечённые роллы', emoji: '🍤'),
  CatalogProduct(id: 'r6', categoryId: 'rolls', title: 'Веган ролл', description: 'Авокадо, огурец, перец, тофу', price: 1600, groupName: 'Вегетарианские роллы', emoji: '🥑'),

  // Пицца
  CatalogProduct(id: 'p1', categoryId: 'pizza', title: 'Маргарита', description: 'Томатный соус, моцарелла, базилик', price: 2000, groupName: 'Классическая пицца', emoji: '🍕'),
  CatalogProduct(id: 'p2', categoryId: 'pizza', title: 'Пепперони', description: 'Пепперони, моцарелла, томатный соус', price: 2400, groupName: 'Классическая пицца', emoji: '🍕'),
  CatalogProduct(id: 'p3', categoryId: 'pizza', title: 'Четыре сыра', description: 'Моцарелла, пармезан, горгонзола, рикотта', price: 2800, groupName: 'Классическая пицца', emoji: '🧀'),
  CatalogProduct(id: 'p5', categoryId: 'pizza', title: 'Мясная', description: 'Бекон, ветчина, пепперони, колбаски', price: 3000, groupName: 'Мясная пицца', emoji: '🥩'),
  CatalogProduct(id: 'p4', categoryId: 'pizza', title: 'Гавайская', description: 'Курица, ананас, моцарелла', price: 2200, groupName: 'Мясная пицца', emoji: '🍍'),

  // Бургеры
  CatalogProduct(id: 'b1', categoryId: 'burgers', title: 'Классический', description: 'Говяжья котлета, сыр, салат, соус', price: 1800, groupName: 'Говяжьи бургеры', emoji: '🍔'),
  CatalogProduct(id: 'b2', categoryId: 'burgers', title: 'Чизбургер', description: 'Двойной сыр, говядина, лук, соус', price: 2000, groupName: 'Говяжьи бургеры', emoji: '🍔'),
  CatalogProduct(id: 'b4', categoryId: 'burgers', title: 'Блэк бургер', description: 'Чёрная булочка, ангус, бекон, сыр', price: 2800, groupName: 'Говяжьи бургеры', emoji: '🍔'),
  CatalogProduct(id: 'b3', categoryId: 'burgers', title: 'Чикен бургер', description: 'Куриное филе, салат, томат, соус', price: 1600, groupName: 'Куриные бургеры', emoji: '🍗'),

  // Горячее
  CatalogProduct(id: 'h1', categoryId: 'hot', title: 'Лагман', description: 'Тянутая лапша, говядина, овощи', price: 2200, groupName: 'Основные блюда', emoji: '🍝'),
  CatalogProduct(id: 'h2', categoryId: 'hot', title: 'Плов', description: 'Рис, баранина, морковь, специи', price: 2400, groupName: 'Основные блюда', emoji: '🍚'),
  CatalogProduct(id: 'h5', categoryId: 'hot', title: 'Бефстроганов', description: 'Говядина, сливочный соус, картофель', price: 2600, groupName: 'Основные блюда', emoji: '🥩'),
  CatalogProduct(id: 'h3', categoryId: 'hot', title: 'Курица терияки', description: 'Куриное филе, соус терияки, рис', price: 2000, groupName: 'Блюда на гриле', emoji: '🍗'),
  CatalogProduct(id: 'h4', categoryId: 'hot', title: 'Стейк из лосося', description: 'Лосось на гриле, овощи, лимон', price: 3800, groupName: 'Блюда на гриле', emoji: '🐟'),

  // Салаты
  CatalogProduct(id: 's1', categoryId: 'salads', title: 'Цезарь', description: 'Курица, салат романо, пармезан, соус', price: 1800, groupName: 'Мясные салаты', emoji: '🥗'),
  CatalogProduct(id: 's4', categoryId: 'salads', title: 'Тёплый с курицей', description: 'Курица, микс салатов, кунжут', price: 2000, groupName: 'Мясные салаты', emoji: '🥗'),
  CatalogProduct(id: 's3', categoryId: 'salads', title: 'Оливье', description: 'Картофель, колбаса, горошек, майонез', price: 1400, groupName: 'Мясные салаты', emoji: '🥔'),
  CatalogProduct(id: 's2', categoryId: 'salads', title: 'Греческий', description: 'Помидоры, огурцы, фета, оливки', price: 1600, groupName: 'Овощные салаты', emoji: '🥗'),

  // Напитки
  CatalogProduct(id: 'd1', categoryId: 'drinks', title: 'Эспрессо', description: 'Классический итальянский кофе', price: 800, groupName: 'Горячие напитки', emoji: '☕'),
  CatalogProduct(id: 'd2', categoryId: 'drinks', title: 'Капучино', description: 'Эспрессо, молоко, пенка', price: 1100, groupName: 'Горячие напитки', emoji: '☕'),
  CatalogProduct(id: 'd3', categoryId: 'drinks', title: 'Латте', description: 'Эспрессо, молоко', price: 1200, groupName: 'Горячие напитки', emoji: '🥛'),
  CatalogProduct(id: 'd4', categoryId: 'drinks', title: 'Чай чёрный', description: 'Цейлонский листовой чай', price: 600, groupName: 'Горячие напитки', emoji: '🫖'),
  CatalogProduct(id: 'd5', categoryId: 'drinks', title: 'Лимонад', description: 'Домашний лимонад с мятой', price: 900, groupName: 'Холодные напитки', emoji: '🍋'),
  CatalogProduct(id: 'd6', categoryId: 'drinks', title: 'Сок апельсиновый', description: 'Свежевыжатый сок', price: 1000, groupName: 'Холодные напитки', emoji: '🍊'),

  // Десерты
  CatalogProduct(id: 't1', categoryId: 'desserts', title: 'Чизкейк', description: 'Классический нью-йоркский чизкейк', price: 1500, groupName: 'Выпечка', emoji: '🍰'),
  CatalogProduct(id: 't3', categoryId: 'desserts', title: 'Шоколадный фондан', description: 'Горячий шоколадный десерт', price: 1600, groupName: 'Выпечка', emoji: '🍫'),
  CatalogProduct(id: 't2', categoryId: 'desserts', title: 'Тирамису', description: 'Маскарпоне, савоярди, кофе', price: 1700, groupName: 'Классические десерты', emoji: '🍰'),
  CatalogProduct(id: 't4', categoryId: 'desserts', title: 'Макаронс', description: 'Набор из 6 шт.', price: 2000, groupName: 'Классические десерты', emoji: '🧁'),
];

/// Иконки категорий по имени
IconData iconForCategory(String iconName) {
  return switch (iconName) {
    'soup_kitchen' => Icons.soup_kitchen,
    'local_pizza' => Icons.local_pizza,
    'lunch_dining' => Icons.lunch_dining,
    'set_meal' => Icons.set_meal,
    'local_fire_department' => Icons.local_fire_department,
    'eco' => Icons.eco,
    'local_cafe' => Icons.local_cafe,
    'cake' => Icons.cake,
    _ => Icons.restaurant,
  };
}
