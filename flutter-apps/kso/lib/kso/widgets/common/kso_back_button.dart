import 'package:flutter/material.dart';

class KsoBackButton extends StatelessWidget {
  final VoidCallback? onPressed;

  const KsoBackButton({super.key, this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.4),
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onPressed ?? () => Navigator.of(context).maybePop(),
        child: const Padding(
          padding: EdgeInsets.all(8),
          child: Icon(Icons.arrow_back, color: Colors.white, size: 24),
        ),
      ),
    );
  }
}
