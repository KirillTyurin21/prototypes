import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoChoiceCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final bool isSelected;
  final VoidCallback? onTap;

  const KsoChoiceCard({
    super.key,
    required this.icon,
    required this.label,
    this.subtitle,
    this.isSelected = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: KsoAnim.fast,
        padding: const EdgeInsets.all(KsoSpacing.xxl),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(KsoRadius.l),
          border: Border.all(
            color: isSelected ? KsoColors.primary : KsoColors.lightBorder,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black
                  .withValues(alpha: isSelected ? 0.08 : 0.04),
              blurRadius: isSelected ? 12 : 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 48,
              color: isSelected
                  ? KsoColors.primary
                  : KsoColors.lightOnSurfaceSecondary,
            ),
            const SizedBox(height: KsoSpacing.m),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: isSelected
                    ? KsoColors.primary
                    : KsoColors.lightOnSurface,
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: KsoSpacing.xs),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: KsoColors.lightOnSurfaceSecondary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
