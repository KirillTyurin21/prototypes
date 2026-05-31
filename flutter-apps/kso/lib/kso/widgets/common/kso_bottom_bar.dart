import 'package:flutter/material.dart';
import '../../theme/kso_constants.dart';

class KsoBottomBar extends StatelessWidget {
  final Widget child;
  final Color? backgroundColor;
  final double elevation;

  const KsoBottomBar({
    super.key,
    required this.child,
    this.backgroundColor,
    this.elevation = 6,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? theme.colorScheme.surfaceContainer,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(KsoRadius.xl),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: elevation * 2,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(KsoSpacing.xxl),
      child: SafeArea(
        top: false,
        child: child,
      ),
    );
  }
}
