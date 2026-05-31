import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoClearCartDialog extends StatelessWidget {
  const KsoClearCartDialog({super.key});

  static Future<bool?> show(BuildContext context) {
    return showDialog<bool>(
      context: context,
      builder: (_) => const KsoClearCartDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(KsoRadius.xl),
      ),
      child: Padding(
        padding: const EdgeInsets.all(KsoSpacing.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'очистить заказ?',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: KsoColors.primary),
                      padding:
                          const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(KsoRadius.m),
                      ),
                    ),
                    child: const Text(
                      'Нет',
                      style: TextStyle(
                        color: KsoColors.primary,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: FilledButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    style: FilledButton.styleFrom(
                      backgroundColor: KsoColors.error,
                      padding:
                          const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(KsoRadius.m),
                      ),
                    ),
                    child: const Text(
                      'Очистить',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
