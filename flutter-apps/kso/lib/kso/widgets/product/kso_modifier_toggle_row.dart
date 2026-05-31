import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoModifierToggleRow extends StatelessWidget {
  final String name;
  final int extraPrice;
  final bool isSelected;
  final VoidCallback? onToggle;

  const KsoModifierToggleRow({
    super.key,
    required this.name,
    required this.extraPrice,
    this.isSelected = false,
    this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onToggle,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: KsoSpacing.s),
        child: Row(
          children: [
            Expanded(
              child: Text(
                name,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurface,
                  fontSize: 16,
                ),
              ),
            ),
            if (extraPrice > 0)
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Text(
                  '+${formatPrice(extraPrice)}',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontSize: 14,
                  ),
                ),
              ),
            AnimatedContainer(
              duration: KsoAnim.fast,
              width: 44,
              height: 26,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(13),
                color: isSelected ? KsoColors.accent : KsoColors.border,
              ),
              child: AnimatedAlign(
                duration: KsoAnim.fast,
                alignment: isSelected
                    ? Alignment.centerRight
                    : Alignment.centerLeft,
                child: Container(
                  width: 22,
                  height: 22,
                  margin: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
