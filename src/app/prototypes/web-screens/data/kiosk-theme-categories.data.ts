/**
 * Kiosk (Киоск) — Темы (V2)
 * 4 категории, 11 элементов.
 * Источник: DS-Группировка-элементов-спецификация.md, раздел 3.11
 */

interface PaletteItem {
  type: string;
  label: string;
  icon: string;
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
    icon: 'layers',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'type' },
      { type: 'image', label: 'Изображение', icon: 'image' },
      { type: 'rectangle', label: 'Прямоугольник', icon: 'square' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'layout-grid',
    collapsed: true,
    elements: [
      { type: 'kiosk-controls-area', label: 'Область контрола', icon: 'layout-grid' },
      { type: 'kiosk-hints-area', label: 'Область подсказок', icon: 'layout-grid' },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'megaphone',
    collapsed: true,
    elements: [
      { type: 'kiosk-advertise', label: 'Рекламный модуль', icon: 'megaphone' },
    ],
  },
  {
    id: 'qr-codes',
    label: 'QR-коды',
    icon: 'qr-code',
    collapsed: true,
    elements: [
      { type: 'kiosk-sample-qr', label: 'Пример QR', icon: 'qr-code' },
      { type: 'kiosk-tips-qr', label: 'QR для чаевых', icon: 'qr-code' },
      { type: 'kiosk-payment-qr', label: 'QR для оплаты', icon: 'qr-code' },
      { type: 'kiosk-yandex-pay-qr', label: 'Yandex.Pay QR', icon: 'qr-code' },
      { type: 'kiosk-kaspi-qr', label: 'KASPI QR', icon: 'qr-code' },
    ],
  },
];
