import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/responsive.dart';
import '../../shared/models/splash_config.dart';
import '../../shared/services/order_service.dart';
import '../../dev_panel/dev_panel_service.dart';

/// Стартовый экран — idle-заставка терминала.
/// При тапе — поверх фона открывается overlay выбора «В зале» / «С собой».
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  final _dev = DevPanelService();
  Timer? _timer;
  int _currentIndex = 0;

  /// Показывать ли overlay выбора локации
  bool _showLocationOverlay = false;

  /// Контроллер анимации появления overlay
  late final AnimationController _overlayAnimCtrl;
  late final Animation<double> _overlayFade;
  late final Animation<double> _overlayScale;

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

  LocationSelectionConfig get _locationConfig {
    return LocationSelectionConfig(
      title: _dev.get<String>('location_title',
          defaultValue: 'Как хотите получить заказ?'),
      dineInImageAsset: _dev.get<String>('location_dinein_img',
          defaultValue: 'assets/media/dinein.png'),
      takeawayImageAsset: _dev.get<String>('location_takeaway_img',
          defaultValue: 'assets/media/takeaway.png'),
    );
  }

  /// Парсинг медиа-элементов из JSON-строки, сохранённой в настройках
  List<MediaItem> _parseMediaItems() {
    final raw = _dev.get<String>('splash_media_json',
        defaultValue:
            '[{"path":"assets/media/Start_screen.png","type":"image","order":0}]');
    final result = <MediaItem>[];
    try {
      final itemPattern = RegExp(r'\{[^}]+\}');
      for (final match in itemPattern.allMatches(raw)) {
        final item = match.group(0)!;
        final pathMatch =
            RegExp(r'"path"\s*:\s*"((?:[^"\\]|\\.)*)"').firstMatch(item);
        final typeMatch = RegExp(r'"type"\s*:\s*"([^"]*)"').firstMatch(item);
        final orderMatch = RegExp(r'"order"\s*:\s*(\d+)').firstMatch(item);
        if (pathMatch != null) {
          result.add(MediaItem(
            assetPath: pathMatch.group(1)!
                .replaceAll('\\"', '"')
                .replaceAll('\\\\', '\\'),
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

    _overlayAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _overlayFade = CurvedAnimation(
      parent: _overlayAnimCtrl,
      curve: Curves.easeOut,
    );
    _overlayScale = Tween<double>(begin: 0.95, end: 1.0).animate(
      CurvedAnimation(parent: _overlayAnimCtrl, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _overlayAnimCtrl.dispose();
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
    final imageItems = items.where((m) => m.type == MediaType.image).toList();
    if (imageItems.isEmpty) return;

    final interval = _config.imageIntervalSeconds;
    if (items.length == 1) return;

    _timer = Timer.periodic(Duration(seconds: interval), (_) {
      if (!mounted) return;
      setState(() {
        _currentIndex = (_currentIndex + 1) % items.length;
      });
    });
  }

  /// Тап по экрану → показать overlay выбора локации
  void _onTap() {
    if (_showLocationOverlay) return;
    setState(() => _showLocationOverlay = true);
    _overlayAnimCtrl.forward();
  }

  /// Закрыть overlay (возврат к idle-заставке)
  void _closeOverlay() {
    _overlayAnimCtrl.reverse().then((_) {
      if (!mounted) return;
      setState(() => _showLocationOverlay = false);
    });
  }

  /// Выбор локации → сохраняем и переходим в каталог
  void _onSelectLocation(String type) {
    final order = OrderService();
    order.setLocation(
      type == 'dinein' ? OrderLocation.dinein : OrderLocation.takeaway,
    );
    context.go('/catalog');
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
              _buildDefaultBackground(),

            // Кнопка «Купить здесь» (скрывается при открытом overlay)
            if (config.showBuyButton && !_showLocationOverlay)
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

            // Текст-подсказка (скрывается при открытом overlay)
            if (config.hintText != null &&
                config.hintText!.isNotEmpty &&
                !_showLocationOverlay)
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

            // Overlay выбора локации
            if (_showLocationOverlay)
              _buildLocationOverlay(),
          ],
        ),
      ),
    );
  }

  /// Overlay выбора «В зале» / «С собой» поверх фона сплеш-экрана.
  /// Стилизован под скриншоты КСО (materials/Flutter/КСО/Нажата оформить/).
  Widget _buildLocationOverlay() {
    final config = _locationConfig;

    return FadeTransition(
      opacity: _overlayFade,
      child: ScaleTransition(
        scale: _overlayScale,
        child: GestureDetector(
          // Перехватываем тапы, чтобы не провалиться в _onTap родителя
          onTap: () {},
          child: Container(
            color: Colors.black.withValues(alpha: 0.82),
            child: SafeArea(
              child: Padding(
                padding: context.scaledSymmetric(40, 0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Заголовок
                    Text(
                      config.title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.white,
                        fontSize: context.scaledFont(44),
                        fontWeight: FontWeight.bold,
                        height: 1.25,
                      ),
                    ),
                    SizedBox(height: context.scaled(72)),

                    // Кнопки выбора
                    Row(
                      children: [
                        Expanded(
                          child: _LocationChoiceCard(
                            imageAsset: config.dineInImageAsset,
                            label: 'В зале',
                            icon: Icons.restaurant,
                            onTap: () => _onSelectLocation('dinein'),
                          ),
                        ),
                        SizedBox(width: context.scaled(20)),
                        Expanded(
                          child: _LocationChoiceCard(
                            imageAsset: config.takeawayImageAsset,
                            label: 'С собой',
                            icon: Icons.takeout_dining,
                            onTap: () => _onSelectLocation('takeaway'),
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: context.scaled(56)),

                    // Кнопка «Назад» (возврат к idle-заставке)
                    GestureDetector(
                      onTap: _closeOverlay,
                      child: Container(
                        padding: context.scaledSymmetric(28, 10),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: AppColors.white.withValues(alpha: 0.25),
                            width: 1.5,
                          ),
                          borderRadius:
                              BorderRadius.circular(context.scaledRadius(12)),
                        ),
                        child: Text(
                          'Назад',
                          style: TextStyle(
                            color: AppColors.white.withValues(alpha: 0.6),
                            fontSize: context.scaledFont(22),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Фон по умолчанию — предзагруженное изображение из assets/media/Start_screen.png
  Widget _buildDefaultBackground() {
    return Container(
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/media/Start_screen.png'),
          fit: BoxFit.cover,
        ),
      ),
    );
  }

  Widget _buildMediaItem(MediaItem item) {
    if (item.type == MediaType.image) {
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
      return AnimatedSwitcher(
        duration: const Duration(milliseconds: 800),
        child: Container(
          key: ValueKey(item.assetPath),
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(item.assetPath),
              fit: BoxFit.cover,
              onError: (_, __) {},
            ),
          ),
        ),
      );
    }
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

/// Карточка выбора локации: изображение + подпись.
/// Стилизована под Figma-дизайн КСО (скриншоты из materials/Flutter/КСО/Нажата оформить/).
class _LocationChoiceCard extends StatelessWidget {
  final String imageAsset;
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _LocationChoiceCard({
    required this.imageAsset,
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(context.scaledRadius(16)),
          border: Border.all(
            color: AppColors.white.withValues(alpha: 0.1),
            width: 1,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Область с изображением — пропорции как на скриншотах КСО
            AspectRatio(
              aspectRatio: 1.08,
              child: ClipRRect(
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(context.scaledRadius(16)),
                ),
                child: Image.asset(
                  imageAsset,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: AppColors.darkSurfaceVariant,
                    child: Center(
                      child: Icon(
                        icon,
                        size: context.scaled(72),
                        color: AppColors.white.withValues(alpha: 0.5),
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Подпись — под изображением
            Padding(
              padding: context.scaledSymmetric(12, 14),
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.white,
                  fontSize: context.scaledFont(26),
                  fontWeight: FontWeight.w600,
                  height: 1.2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
