import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'state/cart_state.dart';
import 'theme/kso_theme.dart';

class CartStateProvider extends InheritedNotifier<CartState> {
  const CartStateProvider({
    super.key,
    required CartState cartState,
    required super.child,
  }) : super(notifier: cartState);

  static CartState of(BuildContext context) {
    return context
        .dependOnInheritedWidgetOfExactType<CartStateProvider>()!
        .notifier!;
  }
}

class KsoShell extends StatefulWidget {
  final Widget child;
  const KsoShell({super.key, required this.child});

  @override
  State<KsoShell> createState() => _KsoShellState();
}

class _KsoShellState extends State<KsoShell> {
  final CartState _cartState = CartState();

  @override
  void dispose() {
    _cartState.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = KsoTheme.light();

    return CartStateProvider(
      cartState: _cartState,
      child: Theme(
        data: theme,
        child: ColoredBox(
          color: theme.scaffoldBackgroundColor,
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: widget.child,
            ),
          ),
        ),
      ),
    );
  }
}
