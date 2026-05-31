import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoCartHeader extends StatelessWidget {
  final TextEditingController nameController;
  final VoidCallback? onQrTap;
  final VoidCallback? onClearTap;

  const KsoCartHeader({
    super.key,
    required this.nameController,
    this.onQrTap,
    this.onClearTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(KsoSpacing.l),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(KsoRadius.m),
                border: Border.all(color: KsoColors.lightBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: nameController,
                      decoration: const InputDecoration(
                        hintText: 'позовём тебя по имени',
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding:
                            EdgeInsets.symmetric(vertical: 8),
                      ),
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                  GestureDetector(
                    onTap: onQrTap,
                    child: const Icon(
                      Icons.qr_code,
                      color: KsoColors.lightOnSurfaceSecondary,
                      size: 24,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: KsoSpacing.m),
          GestureDetector(
            onTap: onClearTap,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: KsoColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(KsoRadius.m),
              ),
              child: const Icon(Icons.delete_outline,
                  color: KsoColors.error, size: 24),
            ),
          ),
        ],
      ),
    );
  }
}
