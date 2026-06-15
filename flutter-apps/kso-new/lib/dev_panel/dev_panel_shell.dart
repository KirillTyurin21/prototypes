import 'package:flutter/material.dart';
import 'dev_panel_service.dart';

/// Контейнер: панель настроек + контент приложения.
/// Панель — overlay слева, не сдвигает контент.
/// Глобальный масштаб экрана применяется ко всему контенту.
class DevPanelShell extends StatelessWidget {
  final Widget child;
  const DevPanelShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final dev = DevPanelService();

    if (!dev.enabled) return child;

    return ListenableBuilder(
      listenable: dev,
      builder: (context, _) {
        final scalePercent = dev.get<int>('global_screen_scale', defaultValue: 100);
        final scale = scalePercent / 100.0;

        return Stack(
          children: [
            // Контент с глобальным масштабом
            Positioned.fill(
              child: ClipRect(
                child: Transform.scale(
                  scale: scale,
                  alignment: Alignment.center,
                  child: child,
                ),
              ),
            ),
            // Панель настроек (overlay слева)
            if (dev.isOpen)
              Positioned(
                top: 0,
                left: 0,
                bottom: 0,
                width: 290,
                child: _DevPanelWidget(key: const Key('dev_panel')),
              ),
            // Кнопка открытия (только когда панель закрыта)
            if (!dev.isOpen)
              Positioned(
                top: 8,
                left: 8,
                child: _ToggleButton(dev: dev),
              ),
          ],
        );
      },
    );
  }
}

/// Кнопка-триггер для открытия/закрытия панели
class _ToggleButton extends StatelessWidget {
  final DevPanelService dev;
  const _ToggleButton({required this.dev});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => dev.toggle(),
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.35),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.settings, color: Colors.white54, size: 20),
      ),
    );
  }
}

/// Сама панель настроек
class _DevPanelWidget extends StatefulWidget {
  const _DevPanelWidget({super.key});

  @override
  State<_DevPanelWidget> createState() => _DevPanelWidgetState();
}

class _DevPanelWidgetState extends State<_DevPanelWidget> {
  final _dev = DevPanelService();

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 8,
      color: const Color(0xFF1A1A2E),
      child: Column(
        children: [
          // Заголовок
          _buildHeader(),
          // Контент
          Expanded(child: _buildContent()),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF16213E),
      ),
      child: Row(
        children: [
          const Icon(Icons.settings, color: Colors.white70, size: 18),
          const SizedBox(width: 8),
          const Expanded(
            child: Text(
              'Настройки',
              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
            ),
          ),
          GestureDetector(
            onTap: () => _dev.toggle(),
            child: const Icon(Icons.close, color: Colors.white54, size: 20),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        // --- Глобальные ---
        _sectionTitle('Глобальные'),
        const SizedBox(height: 8),
        _slider('global_screen_scale', 'Масштаб экрана (%)', 50, 150, 100),
        const SizedBox(height: 16),

        // --- Стартовый экран ---
        _sectionTitle('Стартовый экран'),
        const SizedBox(height: 8),
        _slider('splash_interval', 'Интервал смены (сек)', 1, 30, 5),
        _check('splash_show_btn', 'Показать кнопку «Купить здесь»', true),
        _text('splash_btn_text', 'Текст кнопки', 'Купить здесь'),
        _color('splash_btn_bg', 'Цвет фона кнопки', 0xFFFF6D00),
        _color('splash_btn_text_color', 'Цвет текста кнопки', 0xFFFFFFFF),
        _text('splash_hint', 'Текст подсказки', 'Нажмите на экран, чтобы войти в меню'),
        const SizedBox(height: 16),

        // --- Выбор локации ---
        _sectionTitle('Выбор локации'),
        const SizedBox(height: 8),
        _text('location_title', 'Заголовок', 'Как хотите получить заказ?'),
        const SizedBox(height: 16),

        // --- Сброс ---
        Center(
          child: TextButton(
            onPressed: () => _dev.resetAll(),
            child: const Text('Сбросить все настройки',
                style: TextStyle(color: Colors.redAccent, fontSize: 13)),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  // ---- Строительные блоки ----

  Widget _sectionTitle(String title) {
    return Text(title, style: const TextStyle(
      color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold,
    ));
  }

  Widget _check(String key, String label, bool defaultValue) {
    final v = _dev.get<bool>(key, defaultValue: defaultValue);
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: InkWell(
        onTap: () => _dev.set(key, !v),
        child: Row(
          children: [
            SizedBox(
              width: 20, height: 20,
              child: Checkbox(
                value: v,
                onChanged: (val) => _dev.set(key, val ?? defaultValue),
                activeColor: Colors.orange,
                checkColor: Colors.white,
                side: const BorderSide(color: Colors.white30, width: 1.5),
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(child: Text(label,
                style: const TextStyle(color: Colors.white70, fontSize: 12))),
          ],
        ),
      ),
    );
  }

  Widget _slider(String key, String label, int min, int max, int defaultValue) {
    final v = _dev.get<int>(key, defaultValue: defaultValue);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$label: $v',
            style: const TextStyle(color: Colors.white70, fontSize: 12)),
        Slider(
          value: v.toDouble(),
          min: min.toDouble(),
          max: max.toDouble(),
          divisions: max - min,
          activeColor: Colors.orange,
          onChanged: (val) => _dev.set(key, val.toInt()),
        ),
      ],
    );
  }

  Widget _text(String key, String label, String defaultValue) {
    final v = _dev.get<String>(key, defaultValue: defaultValue);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
          const SizedBox(height: 4),
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF2A2A4A),
              borderRadius: BorderRadius.circular(6),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: TextField(
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 8),
              ),
              controller: TextEditingController.fromValue(
                TextEditingValue(text: v),
              ),
              onChanged: (val) => _dev.set(key, val),
            ),
          ),
        ],
      ),
    );
  }

  Widget _color(String key, String label, int defaultValue) {
    final v = _dev.get<int>(key, defaultValue: defaultValue);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          GestureDetector(
            onTap: () {
              const presets = [0xFFFF6D00, 0xFF2962FF, 0xFFF44336, 0xFF4CAF50, 0xFFFFFFFF, 0xFF000000, 0xFFFFB300];
              final idx = presets.indexOf(v);
              _dev.set(key, presets[(idx + 1) % presets.length]);
            },
            child: Container(
              width: 26, height: 26,
              decoration: BoxDecoration(
                color: Color(v),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: Colors.white30),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(label,
              style: const TextStyle(color: Colors.white70, fontSize: 12))),
        ],
      ),
    );
  }
}
