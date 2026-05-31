import 'package:flutter/material.dart';

class KsoQuantitySelector extends StatelessWidget {
  final int quantity;
  final ValueChanged<int> onChanged;
  final Color? color;
  final double size;

  const KsoQuantitySelector({
    super.key,
    required this.quantity,
    required this.onChanged,
    this.color,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final activeColor = color ?? theme.colorScheme.primary;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildButton(Icons.remove, () => onChanged(quantity - 1), activeColor),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            '$quantity',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        _buildButton(Icons.add, () => onChanged(quantity + 1), activeColor),
      ],
    );
  }

  Widget _buildButton(IconData icon, VoidCallback onTap, Color activeColor) {
    return Material(
      color: activeColor.withValues(alpha: 0.1),
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.all(size * 0.2),
          child: Icon(icon, color: activeColor, size: size * 0.6),
        ),
      ),
    );
  }
}
