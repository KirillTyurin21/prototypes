import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';
import '../common/kso_bottom_bar.dart';

class KsoCartBottomBar extends StatelessWidget {
  final int totalPrice;
  final int estimatedMinutes;
  final VoidCallback? onCheckoutTap;

  const KsoCartBottomBar({
    super.key,
    required this.totalPrice,
    required this.estimatedMinutes,
    this.onCheckoutTap,
  });

  @override
  Widget build(BuildContext context) {
    return KsoBottomBar(
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                formatPrice(totalPrice),
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: KsoColors.lightOnSurface,
                ),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.schedule,
                      size: 14,
                      color: KsoColors.lightOnSurfaceSecondary),
                  const SizedBox(width: 4),
                  Text(
                    '$estimatedMinutes мин',
                    style: const TextStyle(
                      fontSize: 13,
                      color: KsoColors.lightOnSurfaceSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const Spacer(),
          GestureDetector(
            onTap: onCheckoutTap,
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 32, vertical: 14),
              decoration: BoxDecoration(
                color: KsoColors.primary,
                borderRadius: BorderRadius.circular(KsoRadius.m),
              ),
              child: const Text(
                'Оформить',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
