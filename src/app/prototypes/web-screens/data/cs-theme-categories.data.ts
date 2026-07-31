/**
 * Customer Screen — Темы (V2)
 * 7 категорий, 31 элемент.
 * Источник: DS-Группировка-элементов-спецификация.md, раздел 3.4
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

export const CS_THEME_CATEGORIES: PaletteCategory[] = [
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
    id: 'receipt-data',
    label: 'Данные чека',
    icon: 'receipt',
    collapsed: true,
    elements: [
      { type: 'receipt-items', label: 'Состав чека', icon: 'receipt' },
      { type: 'subtotal', label: 'Подытог', icon: 'receipt' },
      { type: 'prepayment', label: 'Предоплата', icon: 'receipt' },
      { type: 'discount', label: 'Скидка', icon: 'percent' },
      { type: 'change', label: 'Сдача', icon: 'receipt' },
      { type: 'total', label: 'Сумма', icon: 'receipt' },
      { type: 'loyalty-points', label: 'Баллы клиента', icon: 'star' },
    ],
  },
  {
    id: 'qr-codes',
    label: 'QR-коды',
    icon: 'qr-code',
    collapsed: true,
    elements: [
      { type: 'qr-code', label: 'QR код', icon: 'qr-code' },
      { type: 'qr-code-tips', label: 'QR код чаевых', icon: 'qr-code' },
      { type: 'qr-payment', label: 'Оплата по QR', icon: 'qr-code' },
      { type: 'external-pay-qr', label: 'Pay QR', icon: 'qr-code' },
      { type: 'kaspi-qr', label: 'КАСПИ QR', icon: 'qr-code' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'layout-grid',
    collapsed: true,
    elements: [
      { type: 'controls-area', label: 'Область контролов', icon: 'square' },
      { type: 'animation-window', label: 'Окно анимации', icon: 'panel-right-open' },
      { type: 'hints', label: 'Область подсказок', icon: 'lightbulb', isPremium: true },
    ],
  },
  {
    id: 'last-added-dish',
    label: 'Последнее добавленное блюдо',
    icon: 'utensils',
    collapsed: true,
    elements: [
      { type: 'allergens', label: 'Аллергены', icon: 'alert-circle' },
      { type: 'unit', label: 'Единица измерения', icon: 'ruler' },
      { type: 'product-image', label: 'Изображение продукта', icon: 'image' },
      { type: 'product-name', label: 'Название продукта', icon: 'type' },
      { type: 'product-name-intl', label: 'Название продукта (иностр.)', icon: 'type' },
      { type: 'product-qty', label: 'Количество продукта', icon: 'hash' },
      { type: 'product-description', label: 'Описание продукта', icon: 'type' },
      { type: 'product-description-intl', label: 'Описание продукта (иностр.)', icon: 'type' },
      { type: 'nutrition', label: 'Пищевая ценность', icon: 'bar-chart-3' },
      { type: 'product-full-name', label: 'Полное название продукта', icon: 'type' },
      { type: 'product-scale', label: 'Масштаб продукта', icon: 'maximize' },
      { type: 'product-price', label: 'Цена', icon: 'bar-chart-3' },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'megaphone',
    collapsed: true,
    elements: [
      { type: 'advertise', label: 'Рекламный блок', icon: 'megaphone' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'info',
    collapsed: true,
    elements: [
      { type: 'current-time', label: 'Текущее время', icon: 'clock' },
    ],
  },
];
