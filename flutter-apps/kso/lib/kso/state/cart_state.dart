import 'dart:math';
import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/product.dart';
import '../models/order.dart';

class CartState extends ChangeNotifier {
  final List<CartItem> _items = [];
  String? _customerName;
  OrderType? _orderType;
  PaymentMethod? _paymentMethod;

  List<CartItem> get items => List.unmodifiable(_items);
  String? get customerName => _customerName;
  OrderType? get orderType => _orderType;
  PaymentMethod? get paymentMethod => _paymentMethod;
  bool get isEmpty => _items.isEmpty;
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);
  int get totalPrice => _items.fold(0, (sum, item) => sum + item.totalPrice);
  int get estimatedMinutes => (_items.length * 1.5).ceil().clamp(2, 15);

  void addItem(Product product, Map<String, List<String>> modifierIds) {
    final item = CartItem(
      id: '${product.id}-${DateTime.now().millisecondsSinceEpoch}',
      product: product,
      selectedModifierIds: Map.from(modifierIds),
    );
    _items.add(item);
    notifyListeners();
  }

  void removeItem(String cartItemId) {
    _items.removeWhere((item) => item.id == cartItemId);
    notifyListeners();
  }

  void updateQuantity(String cartItemId, int newQuantity) {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    final index = _items.indexWhere((item) => item.id == cartItemId);
    if (index != -1) {
      _items[index].quantity = newQuantity;
      notifyListeners();
    }
  }

  void toggleDoNotHeat(String cartItemId) {
    final index = _items.indexWhere((item) => item.id == cartItemId);
    if (index != -1) {
      _items[index].doNotHeat = !_items[index].doNotHeat;
      notifyListeners();
    }
  }

  void setCustomerName(String? name) {
    _customerName = name;
    notifyListeners();
  }

  void setOrderType(OrderType type) {
    _orderType = type;
    notifyListeners();
  }

  void setPaymentMethod(PaymentMethod method) {
    _paymentMethod = method;
    notifyListeners();
  }

  void clear() {
    _items.clear();
    _customerName = null;
    _orderType = null;
    _paymentMethod = null;
    notifyListeners();
  }

  Order createOrder() {
    final rng = Random();
    return Order(
      orderNumber: (rng.nextInt(900) + 100).toString(),
      items: List.from(_items),
      type: _orderType ?? OrderType.dineIn,
      paymentMethod: _paymentMethod ?? PaymentMethod.card,
      customerName: _customerName,
      totalPrice: totalPrice,
      estimatedMinutes: estimatedMinutes,
    );
  }
}
