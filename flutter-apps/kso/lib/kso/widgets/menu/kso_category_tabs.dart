import 'package:flutter/material.dart';
import '../../models/category.dart';
import '../../theme/kso_colors.dart';
import '../../theme/kso_constants.dart';

class KsoCategoryTabs extends StatelessWidget {
  final List<Category> categories;
  final String selectedCategoryId;
  final ValueChanged<String> onCategorySelected;

  const KsoCategoryTabs({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: KsoSpacing.l),
        itemCount: categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: KsoSpacing.s),
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = category.id == selectedCategoryId;
          return GestureDetector(
            onTap: () => onCategorySelected(category.id),
            child: AnimatedContainer(
              duration: KsoAnim.fast,
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected ? KsoColors.accent : Colors.transparent,
                borderRadius: BorderRadius.circular(KsoRadius.s),
                border: isSelected
                    ? null
                    : Border.all(color: KsoColors.border),
              ),
              child: Text(
                category.name,
                style: TextStyle(
                  color: isSelected
                      ? Colors.white
                      : KsoColors.textSecondary,
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
