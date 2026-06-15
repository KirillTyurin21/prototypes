/// Референсные размеры Figma для пропорционального масштабирования.
/// Уточнить после авторизации в Figma.
class FigmaReference {
  FigmaReference._();

  /// Предположительный размер фрейма КСО (планшет, портрет)
  static const double width = 1080;
  static const double height = 1920;

  /// Минимальный размер touch-target по Android-гайдлайну
  static const double minTouchSize = 48.0;
}
