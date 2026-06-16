import 'package:flutter/foundation.dart';

/// Тип локации, выбранный пользователем
enum OrderLocation { dinein, takeaway }

/// Товар в корзине
class CartItem {
  final String productId;
  final String title;
  final int price;
  int quantity;

  CartItem({
    required this.productId,
    required this.title,
    required this.price,
    this.quantity = 1,
  });

  int get total => price * quantity;
}

/// Сервис хранения состояния заказа: локация + корзина.
/// Доступен через синглтон, оповещает слушателей через ChangeNotifier.
class OrderService extends ChangeNotifier {
  OrderLocation? _location;
  final List<CartItem> _items = [];

  static final OrderService _instance = OrderService._();
  factory OrderService() => _instance;
  OrderService._();

  // --- Локация ---

  OrderLocation? get location => _location;
  bool get hasLocation => _location != null;

  String get locationLabel {
    return switch (_location) {
      OrderLocation.dinein => 'В зале',
      OrderLocation.takeaway => 'С собой',
      null => '',
    };
  }

  void setLocation(OrderLocation loc) {
    _location = loc;
    notifyListeners();
  }

  // --- Корзина ---

  List<CartItem> get items => List.unmodifiable(_items);
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);
  int get totalPrice => _items.fold(0, (sum, item) => sum + item.total);

  void addItem(String productId, String title, int price) {
    final exist = _items.where((i) => i.productId == productId);
    if (exist.isNotEmpty) {
      exist.first.quantity++;
    } else {
      _items.add(CartItem(productId: productId, title: title, price: price));
    }
    notifyListeners();
  }

  void removeItem(String productId) {
    _items.removeWhere((i) => i.productId == productId);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}
