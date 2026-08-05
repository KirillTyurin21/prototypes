/**
 * Kiosk (Киоск) — Темы (V2)
 * 4 категории, 11 элементов.
 * Иконки: Material Icons (frontend-common.iiko.ru/components/resto-icon/dynamic/icon%20list)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md (ред. 05.08.2026)
 */

interface PaletteItem {
  type: string;
  label: string;
  icon: string;
  /** Платный элемент — доступен только при платной лицензии */
  isPremium?: boolean;
}

interface PaletteCategory {
  id: string;
  label: string;
  icon: string;
  collapsed: boolean;
  elements: PaletteItem[];
}

export const KIOSK_THEME_CATEGORIES: PaletteCategory[] = [
  {
    id: 'standard',
    label: 'Стандартные',
    icon: 'build',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'text_fields' },
      { type: 'image', label: 'Изображение', icon: 'photo' },
      { type: 'rectangle', label: 'Прямоугольник', icon: 'check_box_outline_blank' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'grid_view',
    collapsed: true,
    elements: [
      { type: 'kiosk-controls-area', label: 'Область контрола', icon: 'grid_view' },
      { type: 'kiosk-hints-area', label: 'Область подсказок', icon: 'design_services', isPremium: true },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'campaign',
    collapsed: true,
    elements: [
      { type: 'kiosk-advertise', label: 'Рекламный модуль', icon: 'notifications' },
    ],
  },
  {
    id: 'qr-codes',
    label: 'QR-коды',
    icon: 'qr_code',
    collapsed: true,
    elements: [
      { type: 'kiosk-sample-qr', label: 'Пример QR', icon: 'qr_code' },
      { type: 'kiosk-tips-qr', label: 'QR для чаевых', icon: 'qr_code' },
      { type: 'kiosk-payment-qr', label: 'QR для оплаты', icon: 'qr_code' },
      { type: 'kiosk-external-pay-qr', label: 'Pay QR', icon: 'qr_code' },
      { type: 'kiosk-kaspi-qr', label: 'KASPI QR', icon: 'qr_code' },
    ],
  },
];
