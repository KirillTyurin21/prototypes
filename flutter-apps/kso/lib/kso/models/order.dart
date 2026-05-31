import 'cart_item.dart';

enum OrderType {
  takeaway,
  dineIn,
}

enum PaymentMethod {
  card,
  cash,
  kaspiQr,
}

enum OrderStatus {
  created,
  processing,
  success,
}

class Order {
  final String orderNumber;
  final List<CartItem> items;
  final OrderType type;
  final PaymentMethod paymentMethod;
  final String? customerName;
  final int totalPrice;
  final int estimatedMinutes;
  OrderStatus status;

  Order({
    required this.orderNumber,
    required this.items,
    required this.type,
    required this.paymentMethod,
    this.customerName,
    required this.totalPrice,
    required this.estimatedMinutes,
    this.status = OrderStatus.created,
  });
}
