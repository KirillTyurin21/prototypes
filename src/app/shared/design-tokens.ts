/**
 * Дизайн-токены Web Design System
 *
 * Источник: materials/Проверка/tokens 1.json
 * Префикс в Tailwind: dt-*
 * Префикс CSS-переменных: --dt-*
 *
 * Все hex-значения взяты из tokens 1.json (color.light).
 * 8-символьные hex (с альфой ff) приведены к 6-символьным.
 */

// =============================================
// ЦВЕТА — Brand
// =============================================

export const DT_BRAND = {
  accent:          '#448AFF',
  accentLight:     '#A8C9FF',
  accentLighter:   '#F0F5FF',
  accentLightest:  '#F5F9FF',
  accentDark:      '#2651B5',
  accentDarker:    '#162A69',

  positive:         '#14B456',
  positiveLight:    '#97E8B9',
  positiveLighter:  '#EBFBF2',
  positiveLightest: '#F3FCF7',
  positiveDark:     '#0F852C',
  positiveDarker:   '#0A571A',

  warning:         '#FFAB40',
  warningLight:    '#FFD9A8',
  warningLighter:  '#FFF9F0',
  warningLightest: '#FFFCF8',
  warningDark:     '#EA7806',
  warningDarker:   '#994000',

  negative:         '#FF5252',
  negativeLight:    '#FFB8B8',
  negativeLighter:  '#FFF2F2',
  negativeLightest: '#FFF8F8',
  negativeDark:     '#DE1A12',
  negativeDarker:   '#7F0F0A',
} as const;

// =============================================
// ЦВЕТА — Surface
// =============================================

export const DT_SURFACE = {
  primary:         '#FFFFFF',
  hover:           '#F5F5F5',
  selected:        '#F5F5F5',
  press:           '#E0E0E0',
  disable:         '#F5F5F5',
  variant:         '#F8F9FC',
  snackTooltip:    '#424242',
  sidebarSelected: '#F0F5FF',
  sidebarActive:   '#A8C9FF',
} as const;

// =============================================
// ЦВЕТА — Text
// =============================================

export const DT_TEXT = {
  primary:     '#333333',
  secondary:   '#616161',
  placeholder: '#D6D6D6',
  disable:     '#9E9E9E',
  inversive:   '#FFFFFF',
  accent:      '#448AFF',
  positive:    '#14B456',
  warning:     '#EA7806',
  negative:    '#FF5252',
} as const;

// =============================================
// ЦВЕТА — Icon
// =============================================

export const DT_ICON = {
  primary:   '#616161',
  inversive: '#FFFFFF',
  disable:   '#9E9E9E',
  accent:    '#448AFF',
  positive:  '#14B456',
  warning:   '#EA7806',
  negative:  '#FF5252',
} as const;

// =============================================
// ЦВЕТА — Stroke / Border
// =============================================

export const DT_STROKE = {
  default:  '#E0E0E0',
  hover:    '#9E9E9E',
  disable:  '#EBEBEB',
  accent:   '#448AFF',
  positive: '#14B456',
  warning:  '#FFAB40',
  negative: '#FF5252',
} as const;

// =============================================
// ЦВЕТА — Table surfaces
// =============================================

export const DT_TABLE = {
  default:   '#FFFFFF',
  hover:     '#F5F5F5',
  selected:  '#EBEBEB',
  head:      '#F0F5FF',
  headGroup: '#E8F0FF',
  zebra:     '#F5F5F5',
  group:     '#EBEBEB',
} as const;

// =============================================
// ЦВЕТА — Neutral palette (base)
// =============================================

export const DT_NEUTRAL = {
  0:   '#FFFFFF',
  10:  '#FAFAFA',
  50:  '#F5F5F5',
  100: '#EBEBEB',
  200: '#E0E0E0',
  300: '#D6D6D6',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#333333',
  950: '#212121',
  990: '#121212',
} as const;

// =============================================
// ТЕНИ (box-shadow)
// Значения вычислены из shadows.default в tokens 1.json
// Каждый уровень = 2 слоя тени
// =============================================

export const DT_SHADOW = {
  none: 'none',
  /** Subtle — минимальная тень */
  sl: '0 2px 2px 0 rgba(33,33,33,0.04), 0 0 4px 0 rgba(33,33,33,0.12)',
  /** Small — лёгкая тень для карточек */
  s:  '0 4px 6px 0 rgba(33,33,33,0.10), 0 0 16px 0 rgba(33,33,33,0.12)',
  /** Medium — средняя тень для dropdown/popover */
  m:  '0 10px 24px 0 rgba(33,33,33,0.12), 0 0 28px 0 rgba(33,33,33,0.12)',
  /** Extra Large — сильная тень для модальных окон */
  xl: '0 12px 16px 0 rgba(33,33,33,0.16), 0 0 32px 0 rgba(33,33,33,0.16)',
} as const;

// =============================================
// ОТСТУПЫ (spacing)
// Базовый размер: 4px (size1x)
// =============================================

export const DT_SPACE = {
  0:     0,
  '05x': 2,
  '1x':  4,
  '15x': 6,
  '2x':  8,
  '25x': 10,
  '3x':  12,
  '35x': 14,
  '4x':  16,
  '5x':  20,
  '6x':  24,
  '7x':  28,
  '8x':  32,
} as const;

// =============================================
// РАДИУСЫ (border-radius)
// =============================================

export const DT_RADIUS = {
  0:        0,
  '05x':    2,
  '1x':     4,
  '15x':    6,
  '2x':     8,
  '3x':     12,
  '4x':     16,
  '6x':     24,
  circular: 9999,
} as const;

// =============================================
// ТИПОГРАФИКА
// =============================================

export const DT_TYPOGRAPHY = {
  fontFamily:        'Roboto',
  fontFamilyVariant: 'Helvetica',

  fontWeight: {
    regular: 400,
    medium:  500,
  },

  fontSize: {
    '2x':  8,
    '25x': 10,
    '3x':  12,
    '35x': 14,
    '4x':  16,
    '45x': 18,
    '5x':  20,
    '6x':  24,
    '85x': 34,
  },

  lineHeight: {
    '25x': 10,
    '3x':  12,
    '4x':  16,
    '5x':  20,
    '6x':  24,
    '7x':  28,
    '8x':  32,
    '10x': 40,
  },

  letterSpacing: {
    none: 0,
    s:    0.5,
    m:    1,
  },
} as const;

// =============================================
// STROKE (border width)
// =============================================

export const DT_STROKE_WIDTH = {
  0:     0,
  '025x': 1,
  '05x':  2,
  '1x':   4,
  pad:    1,
  dash:   1,
} as const;
