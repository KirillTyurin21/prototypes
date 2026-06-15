import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/responsive.dart';
import '../../shared/models/splash_config.dart';
import '../../dev_panel/dev_panel_service.dart';

/// Стартовый экран — idle-заставка терминала
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final _dev = DevPanelService();
  Timer? _timer;
  int _currentIndex = 0;

  SplashConfig get _config {
    final items = _parseMediaItems();

    return SplashConfig(
      mediaItems: items,
      imageIntervalSeconds: _dev.get<int>('splash_interval', defaultValue: 5),
      showBuyButton: _dev.get<bool>('splash_show_btn', defaultValue: true),
      buyButtonText: _dev.get<String>('splash_btn_text',
          defaultValue: 'Купить здесь'),
      buyButtonBackgroundColor: _dev.get<int>('splash_btn_bg',
          defaultValue: 0xFFFF6D00),
      buyButtonTextColor: _dev.get<int>('splash_btn_text_color',
          defaultValue: 0xFFFFFFFF),
      hintText: _dev.get<String?>('splash_hint',
          defaultValue: 'Нажмите на экран, чтобы войти в меню'),
      repeatVideo: _dev.get<bool>('splash_repeat_video', defaultValue: false),
    );
  }

  /// Парсинг медиа-элементов из JSON-строки, сохранённой в настройках
  List<MediaItem> _parseMediaItems() {
    final raw = _dev.get<String>('splash_media_json', defaultValue: '[]');
    final result = <MediaItem>[];
    try {
      final itemPattern = RegExp(r'\{[^}]+\}');
      for (final match in itemPattern.allMatches(raw)) {
        final item = match.group(0)!;
        final pathMatch = RegExp(r'"path"\s*:\s*"((?:[^"\\]|\\.)*)"').firstMatch(item);
        final typeMatch = RegExp(r'"type"\s*:\s*"([^"]*)"').firstMatch(item);
        final orderMatch = RegExp(r'"order"\s*:\s*(\d+)').firstMatch(item);
        if (pathMatch != null) {
          result.add(MediaItem(
            assetPath: pathMatch.group(1)!.replaceAll('\\"', '"').replaceAll('\\\\', '\\'),
            type: (typeMatch?.group(1) ?? 'image') == 'video'
                ? MediaType.video
                : MediaType.image,
            order: int.tryParse(orderMatch?.group(1) ?? '0') ?? 0,
          ));
        }
      }
    } catch (_) {}
    return result;
  }

  @override
  void initState() {
    super.initState();
    _dev.addListener(_onSettingsChanged);
    _startSlideshow();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _dev.removeListener(_onSettingsChanged);
    super.dispose();
  }

  void _onSettingsChanged() {
    if (!mounted) return;
    setState(() {});
    _timer?.cancel();
    _currentIndex = 0;
    _startSlideshow();
  }

  void _startSlideshow() {
    final items = _config.mediaItems;
    if (items.isEmpty) return;
    // Находим только изображения для таймера
    final imageItems = items.where((m) => m.type == MediaType.image).toList();
    if (imageItems.isEmpty) return;

    final interval = _config.imageIntervalSeconds;
    if (items.length == 1) return; // Одно изображение — не переключаем

    _timer = Timer.periodic(Duration(seconds: interval), (_) {
      if (!mounted) return;
      setState(() {
        _currentIndex = (_currentIndex + 1) % items.length;
      });
    });
  }

  void _onTap() {
    context.go('/location');
  }

  @override
  Widget build(BuildContext context) {
    final config = _config;
    final mediaItems = config.mediaItems;

    return GestureDetector(
      onTap: _onTap,
      child: Scaffold(
        backgroundColor: AppColors.black,
        body: Stack(
          fit: StackFit.expand,
          children: [
            // Фоновый медиа-контент
            if (mediaItems.isNotEmpty)
              _buildMediaItem(mediaItems[_currentIndex % mediaItems.length])
            else
              Container(color: AppColors.black),

            // Кнопка «Купить здесь»
            if (config.showBuyButton)
              Positioned(
                bottom: context.scaled(160),
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    padding: context.scaledSymmetric(48, 16),
                    decoration: BoxDecoration(
                      color: config.btnBgColor,
                      borderRadius:
                          BorderRadius.circular(context.scaledRadius(16)),
                    ),
                    child: Text(
                      config.buyButtonText,
                      style: TextStyle(
                        color: config.btnTextColor,
                        fontSize: context.scaledFont(32),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),

            // Текст-подсказка
            if (config.hintText != null && config.hintText!.isNotEmpty)
              Positioned(
                bottom: context.scaled(60),
                left: 0,
                right: 0,
                child: Center(
                  child: Text(
                    config.hintText!,
                    style: TextStyle(
                      color: AppColors.white.withValues(alpha: 0.8),
                      fontSize: context.scaledFont(24),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMediaItem(MediaItem item) {
    if (item.type == MediaType.image) {
      // Если путь — data URL, отображаем реальное изображение
      if (item.assetPath.startsWith('data:image/')) {
        final bytes = base64Decode(item.assetPath.split(',').last);
        return AnimatedSwitcher(
          duration: const Duration(milliseconds: 800),
          child: Container(
            key: ValueKey(item.assetPath),
            decoration: BoxDecoration(
              image: DecorationImage(
                image: MemoryImage(bytes),
                fit: BoxFit.cover,
              ),
            ),
          ),
        );
      }
      // Обычный asset-путь — иконка-заглушка
      return AnimatedSwitcher(
        duration: const Duration(milliseconds: 800),
        child: Container(
          key: ValueKey(item.assetPath),
          color: AppColors.darkBackground,
          child: const Center(
            child: Icon(Icons.image, size: 80, color: AppColors.grey),
          ),
        ),
      );
    }
    // Видео — заглушка
    return Container(
      color: AppColors.darkBackground,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.videocam, size: 64, color: AppColors.grey),
            const SizedBox(height: 16),
            Text(
              'Видео: ${item.assetPath.split('/').last}',
              style: const TextStyle(color: AppColors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
