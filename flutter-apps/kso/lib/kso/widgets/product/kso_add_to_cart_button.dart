import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoAddToCartButton extends StatelessWidget {
  final int price;
  final VoidCallback? onPressed;

  const KsoAddToCartButton({
    super.key,
    required this.price,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.all(KsoSpacing.l),
        child: Material(
          color: KsoColors.accent,
          borderRadius: BorderRadius.circular(KsoRadius.m),
          elevation: 6,
          child: InkWell(
            onTap: onPressed,
            borderRadius: BorderRadius.circular(KsoRadius.m),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Text(
                'В корзину · ${formatPrice(price)}',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
