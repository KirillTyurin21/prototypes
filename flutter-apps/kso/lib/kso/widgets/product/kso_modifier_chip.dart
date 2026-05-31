import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoModifierChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final String? extraPriceLabel;
  final VoidCallback? onTap;

  const KsoModifierChip({
    super.key,
    required this.label,
    this.isSelected = false,
    this.extraPriceLabel,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: KsoAnim.fast,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? KsoColors.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(KsoRadius.s),
          border: Border.all(
            color: isSelected ? KsoColors.accent : KsoColors.border,
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color:
                    isSelected ? Colors.white : KsoColors.textPrimary,
                fontSize: 14,
                fontWeight:
                    isSelected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
            if (extraPriceLabel != null) ...[
              const SizedBox(height: 2),
              Text(
                extraPriceLabel!,
                style: TextStyle(
                  color: isSelected
                      ? Colors.white.withValues(alpha: 0.8)
                      : KsoColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
