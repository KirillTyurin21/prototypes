import 'package:flutter/material.dart';
import 'dev_panel_service.dart';

/// Контейнер: панель настроек + контент приложения.
/// Оборачивает экран и при открытой панели показывает sidebar слева.
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
        return Row(
          children: [
            // Панель настроек (слева)
            if (dev.isOpen) const _DevPanelWidget(),
            // Контент
            Expanded(child: child),
          ],
        );
      },
    );
  }
}

/// Сама панель настроек
class _DevPanelWidget extends StatefulWidget {
  const _DevPanelWidget();

  @override
  State<_DevPanelWidget> createState() => _DevPanelWidgetState();
}

class _DevPanelWidgetState extends State<_DevPanelWidget> {
  final _dev = DevPanelService();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      color: const Color(0xFF1A1A2E),
      child: Material(
        color: Colors.transparent,
        child: SafeArea(
          child: Column(
            children: [
              // Заголовок
              Container(
                padding: const EdgeInsets.all(12),
                color: const Color(0xFF16213E),
                child: Row(
                  children: [
                    const Icon(Icons.settings, color: Colors.white70, size: 18),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Text(
                        'Настройки',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white70, size: 18),
                      onPressed: () => _dev.toggle(),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
              // Контент настроек
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(12),
                  children: [
                    _buildSection('Стартовый экран', [
                      _buildSlider(
                        'splash_interval',
                        'Интервал смены (сек)',
                        1, 30, 5,
                      ),
                      _buildCheckbox(
                        'splash_show_btn',
                        'Показать кнопку',
                        true,
                      ),
                      _buildTextField(
                        'splash_btn_text',
                        'Текст кнопки',
                        'Купить здесь',
                      ),
                      _buildColorPicker(
                        'splash_btn_bg',
                        'Цвет фона кнопки',
                        0xFFFF6D00,
                      ),
                      _buildColorPicker(
                        'splash_btn_text_color',
                        'Цвет текста кнопки',
                        0xFFFFFFFF,
                      ),
                      _buildTextField(
                        'splash_hint',
                        'Текст подсказки',
                        'Нажмите на экран, чтобы войти в меню',
                      ),
                    ]),
                    const SizedBox(height: 16),
                    _buildSection('Выбор локации', [
                      _buildTextField(
                        'location_title',
                        'Заголовок',
                        'Как хотите получить заказ?',
                      ),
                    ]),
                    const SizedBox(height: 16),
                    // Сброс
                    Center(
                      child: TextButton(
                        onPressed: () => _dev.resetAll(),
                        child: const Text('Сбросить всё',
                            style: TextStyle(color: Colors.redAccent)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    );
  }

  Widget _buildCheckbox(String key, String label, bool defaultValue) {
    final value = _dev.get<bool>(key, defaultValue: defaultValue);
    return Row(
      children: [
        SizedBox(
          width: 20,
          height: 20,
          child: Checkbox(
            value: value,
            onChanged: (v) => _dev.set(key, v ?? defaultValue),
            activeColor: Colors.orange,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(label,
              style: const TextStyle(color: Colors.white70, fontSize: 12)),
        ),
      ],
    );
  }

  Widget _buildSlider(
      String key, String label, double min, double max, double defaultValue) {
    final value = _dev.get<double>(key, defaultValue: defaultValue);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('$label: ${value.toInt()}',
            style: const TextStyle(color: Colors.white70, fontSize: 12)),
        Slider(
          value: value,
          min: min,
          max: max,
          divisions: ((max - min) / 1).toInt(),
          activeColor: Colors.orange,
          label: value.toInt().toString(),
          onChanged: (v) => _dev.set(key, v),
        ),
      ],
    );
  }

  Widget _buildTextField(String key, String label, String defaultValue) {
    final value = _dev.get<String>(key, defaultValue: defaultValue);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(color: Colors.white70, fontSize: 12)),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF2A2A4A),
              borderRadius: BorderRadius.circular(6),
            ),
            child: TextField(
              controller: TextEditingController(text: value)
                ..selection = TextSelection.collapsed(offset: value.length),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 8),
              ),
              onChanged: (v) => _dev.set(key, v),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildColorPicker(String key, String label, int defaultValue) {
    final value = _dev.get<int>(key, defaultValue: defaultValue);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          GestureDetector(
            onTap: () {
              // Циклический перебор предустановленных цветов
              const presetColors = [
                0xFFFF6D00, 0xFF2962FF, 0xFFF44336,
                0xFF4CAF50, 0xFFFFFFFF, 0xFF000000,
                0xFFFFB300,
              ];
              final current = presetColors.indexOf(value);
              final next = (current + 1) % presetColors.length;
              _dev.set(key, presetColors[next]);
            },
            child: Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: Color(value),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: Colors.white30),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(label,
                style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ),
          Text(
            '#${value.toRadixString(16).toUpperCase().padLeft(8, '0').substring(2)}',
            style: const TextStyle(color: Colors.white54, fontSize: 11),
          ),
        ],
      ),
    );
  }
}
