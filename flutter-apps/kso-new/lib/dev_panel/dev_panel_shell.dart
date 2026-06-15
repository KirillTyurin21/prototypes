import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dev_panel_service.dart';

/// Контейнер: панель настроек + контент приложения.
/// Панель — overlay слева, не сдвигает контент.
/// Глобальные размеры экрана (Ш×В) применяются — контент центрируется.
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
        // Глобальные размеры из настроек
        final screenW = dev.get<int>('global_screen_width', defaultValue: 506);
        final screenH = dev.get<int>('global_screen_height', defaultValue: 900);
        final useCustom = dev.get<bool>('global_use_custom_size', defaultValue: false);

        return Stack(
          children: [
            // Основной контент — центрирован в custom-размере, либо на весь экран
            if (useCustom)
              Center(
                child: ClipRect(
                  child: SizedBox(
                    width: screenW.toDouble(),
                    height: screenH.toDouble(),
                    child: child,
                  ),
                ),
              )
            else
              child,

            // Панель настроек (overlay слева)
            if (dev.isOpen)
              Positioned(
                top: 0,
                left: 0,
                bottom: 0,
                width: 300,
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
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.orange.withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
        ),
        child: const Icon(Icons.settings, color: Colors.white, size: 22),
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
  final _navKey = GlobalKey<NavigatorState>();

  // --- Контроллеры для текстовых полей (чтобы курсор не прыгал) ---
  final Map<String, TextEditingController> _controllers = {};

  TextEditingController _ctrl(String key, String value) {
    if (!_controllers.containsKey(key)) {
      _controllers[key] = TextEditingController(text: value);
    } else {
      final ctrl = _controllers[key]!;
      if (ctrl.text != value) {
        ctrl.text = value;
      }
    }
    return _controllers[key]!;
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Оборачиваем панель в собственный Navigator,
    // чтобы showDialog, Slider tooltip и прочие overlay-зависимые
    // виджеты работали внутри панели.
    return Material(
      elevation: 8,
      color: const Color(0xFF1A1A2E),
      child: Navigator(
        key: _navKey,
        initialRoute: '/',
        onGenerateRoute: (_) => MaterialPageRoute(
          builder: (_) => Scaffold(
            backgroundColor: Colors.transparent,
            body: Column(
              children: [
                _buildHeader(),
                Expanded(child: _buildContent()),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(color: Color(0xFF16213E)),
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

  // ===================================================================
  //  КОНТЕНТ ПАНЕЛИ
  // ===================================================================

  Widget _buildContent() {
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        // --- Глобальные ---
        _sectionTitle('Глобальные'),
        const SizedBox(height: 8),
        _buildGlobalSettings(),
        const Divider(color: Color(0xFF333366), height: 24),

        // --- Галерея медиа ---
        _sectionTitle('Галерея медиа'),
        const SizedBox(height: 8),
        _buildGallery(),
        const Divider(color: Color(0xFF333366), height: 24),

        // --- Стартовый экран ---
        _sectionTitle('Стартовый экран'),
        const SizedBox(height: 8),
        _slider('splash_interval', 'Интервал смены (сек)', 1, 30, 5),
        _check('splash_show_btn', 'Показать кнопку «Купить здесь»', true),
        _text('splash_btn_text', 'Текст кнопки', 'Купить здесь'),
        _color('splash_btn_bg', 'Цвет фона кнопки', 0xFFFF6D00),
        _color('splash_btn_text_color', 'Цвет текста кнопки', 0xFFFFFFFF),
        _text('splash_hint', 'Текст подсказки', 'Нажмите на экран, чтобы войти в меню'),
        _check('splash_repeat_video', 'Зацикливать видео', false),
        const Divider(color: Color(0xFF333366), height: 24),

        // --- Выбор локации ---
        _sectionTitle('Выбор локации'),
        const SizedBox(height: 8),
        _text('location_title', 'Заголовок', 'Как хотите получить заказ?'),
        _text('location_dinein_img', 'Изображение «В зале»', 'assets/media/dinein.png'),
        _text('location_takeaway_img', 'Изображение «С собой»', 'assets/media/takeaway.png'),
        const SizedBox(height: 16),

        // --- Сброс ---
        Center(
          child: TextButton(
            onPressed: () {
              _dev.resetAll();
              _controllers.clear();
            },
            child: const Text('Сбросить все настройки',
                style: TextStyle(color: Colors.redAccent, fontSize: 13)),
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  // ===================================================================
  //  ГЛОБАЛЬНЫЕ: ширина / высота в px
  // ===================================================================

  Widget _buildGlobalSettings() {
    final useCustom = _dev.get<bool>('global_use_custom_size', defaultValue: false);
    final screenW = _dev.get<int>('global_screen_width', defaultValue: 506);
    final screenH = _dev.get<int>('global_screen_height', defaultValue: 900);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Чекбокс: использовать фиксированный размер
        _check('global_use_custom_size', 'Фиксированный размер экрана', false),
        const SizedBox(height: 8),

        // Поля ввода Ш×В (активны только при включённом чекбоксе)
        Row(
          children: [
            Expanded(
              child: _numberInput(
                key: 'global_screen_width',
                label: 'Ширина (px)',
                value: screenW,
                enabled: useCustom,
                onChanged: (v) => _dev.set('global_screen_width', v),
              ),
            ),
            const SizedBox(width: 8),
            const Text('×', style: TextStyle(color: Colors.white38, fontSize: 16)),
            const SizedBox(width: 8),
            Expanded(
              child: _numberInput(
                key: 'global_screen_height',
                label: 'Высота (px)',
                value: screenH,
                enabled: useCustom,
                onChanged: (v) => _dev.set('global_screen_height', v),
              ),
            ),
          ],
        ),
        if (useCustom)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              'Контент центрируется в окне браузера',
              style: TextStyle(color: Colors.white38, fontSize: 11, fontStyle: FontStyle.italic),
            ),
          ),
      ],
    );
  }

  Widget _numberInput({
    required String key,
    required String label,
    required int value,
    required bool enabled,
    required ValueChanged<int> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
        const SizedBox(height: 2),
        Container(
          height: 34,
          decoration: BoxDecoration(
            color: enabled ? const Color(0xFF2A2A4A) : const Color(0xFF1E1E30),
            borderRadius: BorderRadius.circular(6),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 6),
          child: TextField(
            enabled: enabled,
            style: TextStyle(
              color: enabled ? Colors.white : Colors.white30,
              fontSize: 13,
            ),
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: const InputDecoration(
              border: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.symmetric(vertical: 8),
            ),
            controller: _ctrl(key, value.toString()),
            onChanged: (v) {
              final parsed = int.tryParse(v);
              if (parsed != null && parsed > 0) onChanged(parsed);
            },
          ),
        ),
      ],
    );
  }

  // ===================================================================
  //  ГАЛЕРЕЯ МЕДИА
  // ===================================================================

  Widget _buildGallery() {
    // Загружаем список медиа из настроек как JSON-строку
    final raw = _dev.get<String>('splash_media_json', defaultValue: '[]');
    List<Map<String, dynamic>> items;
    try {
      items = List<Map<String, dynamic>>.from(_parseMediaJson(raw));
    } catch (_) {
      items = [];
    }

    // Дефолтные элементы, если галерея пуста
    if (items.isEmpty) {
      items = [
        {'path': 'assets/media/splash_bg_1.png', 'type': 'image', 'order': 0},
      ];
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Список элементов
        ...items.asMap().entries.map((entry) {
          final idx = entry.key;
          final item = entry.value;
          final path = item['path'] as String? ?? '';
          final type = item['type'] as String? ?? 'image';
          final isVideo = type == 'video';

          return Container(
            margin: const EdgeInsets.only(bottom: 4),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF222244),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              children: [
                Icon(
                  isVideo ? Icons.videocam : Icons.image,
                  color: Colors.white54,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    path.split('/').last,
                    style: const TextStyle(color: Colors.white70, fontSize: 11),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                // Кнопка удаления
                GestureDetector(
                  onTap: () {
                    items.removeAt(idx);
                    _saveMediaItems(items);
                  },
                  child: const Icon(Icons.close, color: Colors.redAccent, size: 16),
                ),
              ],
            ),
          );
        }),

        const SizedBox(height: 8),

        // Строка добавления нового элемента
        _buildAddMediaItem(items),
      ],
    );
  }

  final _newMediaPathCtrl = TextEditingController();
  String _newMediaType = 'image';

  Widget _buildAddMediaItem(List<Map<String, dynamic>> items) {
    return Column(
      children: [
        // Выбор типа
        Row(
          children: [
            _mediaTypeChip('image', 'Изобр.'),
            const SizedBox(width: 6),
            _mediaTypeChip('video', 'Видео'),
          ],
        ),
        const SizedBox(height: 4),
        // Поле пути
        Row(
          children: [
            Expanded(
              child: Container(
                height: 32,
                decoration: BoxDecoration(
                  color: const Color(0xFF2A2A4A),
                  borderRadius: BorderRadius.circular(6),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: TextField(
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  controller: _newMediaPathCtrl,
                  decoration: const InputDecoration(
                    hintText: 'assets/media/...',
                    hintStyle: TextStyle(color: Colors.white24, fontSize: 12),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 8),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 4),
            GestureDetector(
              onTap: () {
                final path = _newMediaPathCtrl.text.trim();
                if (path.isEmpty) return;
                items.add({
                  'path': path,
                  'type': _newMediaType,
                  'order': items.length,
                });
                _saveMediaItems(items);
                _newMediaPathCtrl.clear();
              },
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Icon(Icons.add, color: Colors.white, size: 18),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),

        // Быстрые пресеты
        Wrap(
          spacing: 4,
          runSpacing: 4,
          children: [
            _presetBtn('Фон 1', 'assets/media/splash_bg_1.png', items),
            _presetBtn('Фон 2', 'assets/media/splash_bg_2.png', items),
            _presetBtn('Фон 3', 'assets/media/splash_bg_3.png', items),
            _presetBtn('Видео', 'assets/media/promo.mp4', items, type: 'video'),
          ],
        ),
      ],
    );
  }

  Widget _mediaTypeChip(String type, String label) {
    final selected = _newMediaType == type;
    return GestureDetector(
      onTap: () => setState(() => _newMediaType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: selected ? Colors.orange.withValues(alpha: 0.3) : const Color(0xFF2A2A4A),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: selected ? Colors.orange : Colors.transparent,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.orange : Colors.white54,
            fontSize: 11,
          ),
        ),
      ),
    );
  }

  Widget _presetBtn(String label, String path, List<Map<String, dynamic>> items, {String type = 'image'}) {
    return GestureDetector(
      onTap: () {
        items.add({
          'path': path,
          'type': type,
          'order': items.length,
        });
        _saveMediaItems(items);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        decoration: BoxDecoration(
          color: const Color(0xFF2A2A4A),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: Colors.white10),
        ),
        child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 10)),
      ),
    );
  }

  void _saveMediaItems(List<Map<String, dynamic>> items) {
    _dev.set('splash_media_json', _encodeMediaJson(items));
  }

  List<Map<String, dynamic>> _parseMediaJson(String raw) {
    // Простой парсер без dart:convert для Map
    // Используем регулярки для извлечения полей
    final result = <Map<String, dynamic>>[];
    final itemPattern = RegExp(r'\{[^}]+\}');
    for (final match in itemPattern.allMatches(raw)) {
      final item = match.group(0)!;
      final pathMatch = RegExp(r'"path"\s*:\s*"([^"]*)"').firstMatch(item);
      final typeMatch = RegExp(r'"type"\s*:\s*"([^"]*)"').firstMatch(item);
      final orderMatch = RegExp(r'"order"\s*:\s*(\d+)').firstMatch(item);
      if (pathMatch != null) {
        result.add({
          'path': pathMatch.group(1)!,
          'type': typeMatch?.group(1) ?? 'image',
          'order': int.tryParse(orderMatch?.group(1) ?? '0') ?? 0,
        });
      }
    }
    return result;
  }

  String _encodeMediaJson(List<Map<String, dynamic>> items) {
    final parts = items.map((item) {
      final path = (item['path'] as String?) ?? '';
      final type = (item['type'] as String?) ?? 'image';
      final order = item['order'] ?? 0;
      return '{"path":"$path","type":"$type","order":$order}';
    }).toList();
    return '[${parts.join(',')}]';
  }

  // ===================================================================
  //  СТРОИТЕЛЬНЫЕ БЛОКИ
  // ===================================================================

  Widget _sectionTitle(String title) {
    return Text(title, style: const TextStyle(
      color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold,
    ));
  }

  Widget _check(String key, String label, bool defaultValue) {
    final v = _dev.get<bool>(key, defaultValue: defaultValue);
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
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
              controller: _ctrl(key, v),
              onChanged: (val) => _dev.set(key, val),
            ),
          ),
        ],
      ),
    );
  }

  // ===================================================================
  //  ВЫБОР ЦВЕТА — инлайн (внутри панели, без диалога)
  // ===================================================================

  // Ключ настройки, для которой сейчас открыт пикер (null = закрыт)
  String? _activeColorKey;

  Widget _color(String key, String label, int defaultValue) {
    final v = _dev.get<int>(key, defaultValue: defaultValue);
    final color = Color(v);
    final isExpanded = _activeColorKey == key;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Строка с превью цвета + label
          InkWell(
            onTap: () => setState(() {
              _activeColorKey = isExpanded ? null : key;
            }),
            borderRadius: BorderRadius.circular(6),
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: isExpanded ? const Color(0xFF2A2A4A) : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                children: [
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.white30),
                      boxShadow: [
                        BoxShadow(
                          color: color.withValues(alpha: 0.4),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                        Text(
                          _colorToHex(color),
                          style: const TextStyle(color: Colors.white38, fontSize: 10, fontFamily: 'monospace'),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    isExpanded ? Icons.expand_less : Icons.expand_more,
                    color: Colors.white30,
                    size: 18,
                  ),
                ],
              ),
            ),
          ),

          // Раскрытый пикер
          if (isExpanded) _buildInlineColorPicker(key, v, color),
        ],
      ),
    );
  }

  Widget _buildInlineColorPicker(String key, int colorValue, Color currentColor) {
    final hsv = HSVColor.fromColor(currentColor);
    double hue = hsv.hue;
    double sat = hsv.saturation;
    double bri = hsv.value;

    return StatefulBuilder(
      builder: (ctx, setPickerState) {
        Color displayColor = HSVColor.fromAHSV(1, hue, sat, bri).toColor();

        return Container(
          padding: const EdgeInsets.all(8),
          margin: const EdgeInsets.only(top: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF222244),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Column(
            children: [
              // Предпросмотр
              Container(
                height: 36,
                decoration: BoxDecoration(
                  color: displayColor,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                ),
              ),
              const SizedBox(height: 6),

              // HEX поле
              Row(
                children: [
                  const Text('#', style: TextStyle(color: Colors.white54, fontSize: 12)),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Container(
                      height: 28,
                      decoration: BoxDecoration(
                        color: const Color(0xFF2A2A4A),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: TextField(
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace'),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.symmetric(vertical: 4),
                        ),
                        controller: TextEditingController(
                          text: _colorToHex(currentColor).replaceFirst('#', ''),
                        ),
                        onChanged: (hex) {
                          final cleaned = hex.replaceFirst('#', '').padRight(6, '0');
                          final parsed = int.tryParse('FF$cleaned', radix: 16);
                          if (parsed != null) {
                            final newHsv = HSVColor.fromColor(Color(parsed));
                            hue = newHsv.hue;
                            sat = newHsv.saturation;
                            bri = newHsv.value;
                            setPickerState(() {});
                            _dev.set(key, parsed);
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              // Hue полоса
              _buildHueBar(hue, (newHue) {
                hue = newHue;
                final newColor = HSVColor.fromAHSV(1, hue, sat, bri).toColor();
                setPickerState(() {});
                _dev.set(key, newColor.value);
              }),
              const SizedBox(height: 4),

              // Saturation полоса
              _buildSatBar(sat, hue, (newSat) {
                sat = newSat;
                final newColor = HSVColor.fromAHSV(1, hue, sat, bri).toColor();
                setPickerState(() {});
                _dev.set(key, newColor.value);
              }),
              const SizedBox(height: 4),

              // Brightness полоса
              _buildBriBar(bri, hue, sat, (newBri) {
                bri = newBri;
                final newColor = HSVColor.fromAHSV(1, hue, sat, bri).toColor();
                setPickerState(() {});
                _dev.set(key, newColor.value);
              }),
              const SizedBox(height: 8),

              // Пресеты
              Wrap(
                spacing: 5,
                runSpacing: 5,
                children: _presets.map((p) {
                  final pc = Color(p);
                  final isSel = p == displayColor.value;
                  return GestureDetector(
                    onTap: () {
                      _dev.set(key, p);
                      setState(() => _activeColorKey = null);
                    },
                    child: Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: pc,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: isSel ? Colors.white : Colors.white.withValues(alpha: 0.15),
                          width: isSel ? 2 : 1,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        );
      },
    );
  }

  static const _presets = [
    0xFFFF6D00, 0xFFF44336, 0xFFE91E63, 0xFF9C27B0,
    0xFF673AB7, 0xFF2962FF, 0xFF00BCD4, 0xFF4CAF50,
    0xFFFFEB3B, 0xFFFFB300, 0xFF795548, 0xFF607D8B,
    0xFFBDBDBD, 0xFFFFFFFF, 0xFF000000, 0xFF1A1A2E,
  ];

  static String _colorToHex(Color c) =>
      '#${c.value.toRadixString(16).toUpperCase().padLeft(8, '0').substring(2)}';

  Widget _buildHueBar(double hue, ValueChanged<double> onChanged) {
    return LayoutBuilder(
      builder: (ctx, constraints) {
        final w = constraints.maxWidth;
        return GestureDetector(
          onPanDown: (d) => onChanged((d.localPosition.dx / w * 360).clamp(0, 360)),
          onPanUpdate: (d) => onChanged((d.localPosition.dx / w * 360).clamp(0, 360)),
          child: Container(
            height: 16,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              gradient: const LinearGradient(
                colors: [
                  Color(0xFFFF0000), Color(0xFFFFFF00), Color(0xFF00FF00),
                  Color(0xFF00FFFF), Color(0xFF0000FF), Color(0xFFFF00FF),
                  Color(0xFFFF0000),
                ],
              ),
            ),
            child: Align(
              alignment: Alignment(hue / 180 - 1, 0),
              child: Container(
                width: 4, height: 16,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSatBar(double sat, double hue, ValueChanged<double> onChanged) {
    final hueColor = HSVColor.fromAHSV(1, hue, 1, 1).toColor();
    return LayoutBuilder(
      builder: (ctx, constraints) {
        final w = constraints.maxWidth;
        return GestureDetector(
          onPanDown: (d) => onChanged((d.localPosition.dx / w).clamp(0, 1)),
          onPanUpdate: (d) => onChanged((d.localPosition.dx / w).clamp(0, 1)),
          child: Container(
            height: 16,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              gradient: LinearGradient(
                colors: [Colors.white, hueColor],
              ),
            ),
            child: Align(
              alignment: Alignment(sat * 2 - 1, 0),
              child: Container(
                width: 4, height: 16,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildBriBar(double bri, double hue, double sat, ValueChanged<double> onChanged) {
    final fullColor = HSVColor.fromAHSV(1, hue, sat, 1).toColor();
    return LayoutBuilder(
      builder: (ctx, constraints) {
        final w = constraints.maxWidth;
        return GestureDetector(
          onPanDown: (d) => onChanged((d.localPosition.dx / w).clamp(0, 1)),
          onPanUpdate: (d) => onChanged((d.localPosition.dx / w).clamp(0, 1)),
          child: Container(
            height: 16,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              gradient: LinearGradient(
                colors: [Colors.black, fullColor],
              ),
            ),
            child: Align(
              alignment: Alignment(bri * 2 - 1, 0),
              child: Container(
                width: 4, height: 16,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white, width: 2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showColorPicker(String key, String label, int initialValue) {
    // Больше не используется — пикер инлайн
  }
}
