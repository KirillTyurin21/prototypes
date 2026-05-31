import 'package:flutter/material.dart';
import '../../theme/kso_constants.dart';

class KsoModifierGroup extends StatelessWidget {
  final String title;
  final bool isRequired;
  final Widget child;

  const KsoModifierGroup({
    super.key,
    required this.title,
    this.isRequired = false,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: KsoSpacing.l,
        vertical: KsoSpacing.m,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                title,
                style: theme.textTheme.titleLarge?.copyWith(
                  color: theme.colorScheme.onSurface,
                ),
              ),
              if (isRequired) ...[
                const SizedBox(width: 8),
                Text(
                  'Обязательно',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: KsoSpacing.m),
          child,
        ],
      ),
    );
  }
}
