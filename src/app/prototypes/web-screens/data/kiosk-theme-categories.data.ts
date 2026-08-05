/**
 * Kiosk (Киоск) — Темы (V2)
 * 4 категории, 11 элементов.
 * Иконки: Resto Icons (frontend-common.iiko.ru/development-kit/icons)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md
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
    icon: 'resto-menu:constructor',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'resto:edit_document' },
      { type: 'image', label: 'Изображение', icon: 'resto-menu:customer-screen' },
      { type: 'rectangle', label: 'Прямоугольник', icon: 'resto-menu:storefront' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'resto-menu:storefront',
    collapsed: true,
    elements: [
      { type: 'kiosk-controls-area', label: 'Область контрола', icon: 'resto-menu:storefront' },
      { type: 'kiosk-hints-area', label: 'Область подсказок', icon: 'resto-menu:scheme-edit', isPremium: true },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'resto-menu:notification',
    collapsed: true,
    elements: [
      { type: 'kiosk-advertise', label: 'Рекламный модуль', icon: 'resto-menu:notification' },
    ],
  },
  {
    id: 'qr-codes',
    label: 'QR-коды',
    icon: 'resto-menu:payments',
    collapsed: true,
    elements: [
      { type: 'kiosk-sample-qr', label: 'Пример QR', icon: 'resto-menu:payments' },
      { type: 'kiosk-tips-qr', label: 'QR для чаевых', icon: 'resto-menu:payments' },
      { type: 'kiosk-payment-qr', label: 'QR для оплаты', icon: 'resto-menu:payments' },
      { type: 'kiosk-external-pay-qr', label: 'Pay QR', icon: 'resto-menu:payments' },
      { type: 'kiosk-kaspi-qr', label: 'KASPI QR', icon: 'resto-menu:payments' },
    ],
  },
];
