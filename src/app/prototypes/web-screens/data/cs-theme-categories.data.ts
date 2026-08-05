/**
 * Customer Screen — Темы (V2)
 * 7 категорий, 31 элемент.
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

export const CS_THEME_CATEGORIES: PaletteCategory[] = [
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
    id: 'receipt-data',
    label: 'Данные чека',
    icon: 'point_of_sale',
    collapsed: true,
    elements: [
      { type: 'receipt-items', label: 'Состав чека', icon: 'list_alt' },
      { type: 'subtotal', label: 'Подытог', icon: 'analytics' },
      { type: 'prepayment', label: 'Предоплата', icon: 'payments' },
      { type: 'discount', label: 'Скидка', icon: 'percent' },
      { type: 'change', label: 'Сдача', icon: 'point_of_sale' },
      { type: 'total', label: 'Сумма', icon: 'point_of_sale' },
      { type: 'loyalty-points', label: 'Баллы клиента', icon: 'loyalty' },
    ],
  },
  {
    id: 'qr-codes',
    label: 'QR-коды',
    icon: 'qr_code',
    collapsed: true,
    elements: [
      { type: 'qr-code', label: 'QR код', icon: 'qr_code' },
      { type: 'qr-code-tips', label: 'QR код чаевых', icon: 'qr_code' },
      { type: 'qr-payment', label: 'Оплата по QR', icon: 'qr_code' },
      { type: 'external-pay-qr', label: 'Pay QR', icon: 'qr_code' },
      { type: 'kaspi-qr', label: 'КАСПИ QR', icon: 'qr_code' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'grid_view',
    collapsed: true,
    elements: [
      { type: 'controls-area', label: 'Область контролов', icon: 'grid_view' },
      { type: 'animation-window', label: 'Окно анимации', icon: 'play_circle' },
      { type: 'hints', label: 'Область подсказок', icon: 'design_services', isPremium: true },
    ],
  },
  {
    id: 'last-added-dish',
    label: 'Последнее добавленное блюдо',
    icon: 'restaurant',
    collapsed: true,
    elements: [
      { type: 'allergens', label: 'Аллергены', icon: 'error' },
      { type: 'unit', label: 'Единица измерения', icon: 'square_foot' },
      { type: 'product-image', label: 'Изображение продукта', icon: 'photo' },
      { type: 'product-name', label: 'Название продукта', icon: 'inventory' },
      { type: 'product-name-intl', label: 'Название продукта (иностр.)', icon: 'inventory' },
      { type: 'product-qty', label: 'Количество продукта', icon: 'analytics' },
      { type: 'product-description', label: 'Описание продукта', icon: 'description' },
      { type: 'product-description-intl', label: 'Описание продукта (иностр.)', icon: 'description' },
      { type: 'nutrition', label: 'Пищевая ценность', icon: 'analytics' },
      { type: 'product-full-name', label: 'Полное название продукта', icon: 'inventory' },
      { type: 'product-scale', label: 'Масштаб продукта', icon: 'settings' },
      { type: 'product-price', label: 'Цена', icon: 'sell' },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'campaign',
    collapsed: true,
    elements: [
      { type: 'advertise', label: 'Рекламный блок', icon: 'notifications' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'analytics',
    collapsed: true,
    elements: [
      { type: 'current-time', label: 'Текущее время', icon: 'schedule' },
    ],
  },
];
