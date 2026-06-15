import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/responsive.dart';
import '../../shared/models/splash_config.dart';
import '../../dev_panel/dev_panel_service.dart';

/// Экран выбора локации: «В зале» / «С собой»
class LocationScreen extends StatelessWidget {
  const LocationScreen({super.key});

  LocationSelectionConfig get _config {
    final dev = DevPanelService();
    return LocationSelectionConfig(
      title: dev.get<String>('location_title',
          defaultValue: 'Как хотите получить заказ?'),
      dineInImageAsset: dev.get<String>('location_dinein_img',
          defaultValue: 'assets/media/dinein.png'),
      takeawayImageAsset: dev.get<String>('location_takeaway_img',
          defaultValue: 'assets/media/takeaway.png'),
    );
  }

  void _onSelect(BuildContext context, String type) {
    // Пока заглушка — позже переход на меню
    debugPrint('Выбрано: $type');
    // context.go('/menu'); // будет позже
  }

  @override
  Widget build(BuildContext context) {
    final config = _config;

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      body: SafeArea(
        child: Padding(
          padding: context.scaledSymmetric(48, 0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Заголовок
              Text(
                config.title,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.white,
                  fontSize: context.scaledFont(48),
                  fontWeight: FontWeight.bold,
                  height: 1.2,
                ),
              ),
              SizedBox(height: context.scaled(80)),

              // Кнопка «В зале»
              _LocationButton(
                imageAsset: config.dineInImageAsset,
                label: 'В зале',
                onTap: () => _onSelect(context, 'dinein'),
              ),
              SizedBox(height: context.scaled(32)),

              // Кнопка «С собой»
              _LocationButton(
                imageAsset: config.takeawayImageAsset,
                label: 'С собой',
                onTap: () => _onSelect(context, 'takeaway'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LocationButton extends StatelessWidget {
  final String imageAsset;
  final String label;
  final VoidCallback onTap;

  const _LocationButton({
    required this.imageAsset,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: context.scaledSymmetric(32, 48),
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(context.scaledRadius(24)),
          border: Border.all(
            color: AppColors.darkBorder,
            width: 1,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              imageAsset,
              height: context.scaled(240),
              fit: BoxFit.contain,
              errorBuilder: (_, _, _) => Icon(
                Icons.storefront,
                size: context.scaled(120),
                color: AppColors.accent,
              ),
            ),
            SizedBox(height: context.scaled(24)),
            Text(
              label,
              style: TextStyle(
                color: AppColors.white,
                fontSize: context.scaledFont(36),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
