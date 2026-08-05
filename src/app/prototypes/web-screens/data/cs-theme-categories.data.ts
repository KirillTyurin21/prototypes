/**
 * Customer Screen — Темы (V2)
 * 7 категорий, 31 элемент.
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

export const CS_THEME_CATEGORIES: PaletteCategory[] = [
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
    id: 'receipt-data',
    label: 'Данные чека',
    icon: 'resto-menu:cash-layouts',
    collapsed: true,
    elements: [
      { type: 'receipt-items', label: 'Состав чека', icon: 'resto:tov' },
      { type: 'subtotal', label: 'Подытог', icon: 'resto-menu:analitics' },
      { type: 'prepayment', label: 'Предоплата', icon: 'resto-menu:payments' },
      { type: 'discount', label: 'Скидка', icon: 'resto-menu:percent' },
      { type: 'change', label: 'Сдача', icon: 'resto-menu:cash-layouts' },
      { type: 'total', label: 'Сумма', icon: 'resto-menu:cash-layouts' },
      { type: 'loyalty-points', label: 'Баллы клиента', icon: 'resto-menu:loyalty' },
    ],
  },
  {
    id: 'qr-codes',
    label: 'QR-коды',
    icon: 'resto-menu:payments',
    collapsed: true,
    elements: [
      { type: 'qr-code', label: 'QR код', icon: 'resto-menu:payments' },
      { type: 'qr-code-tips', label: 'QR код чаевых', icon: 'resto-menu:payments' },
      { type: 'qr-payment', label: 'Оплата по QR', icon: 'resto-menu:payments' },
      { type: 'external-pay-qr', label: 'Pay QR', icon: 'resto-menu:payments' },
      { type: 'kaspi-qr', label: 'КАСПИ QR', icon: 'resto-menu:payments' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'resto-menu:storefront',
    collapsed: true,
    elements: [
      { type: 'controls-area', label: 'Область контролов', icon: 'resto-menu:storefront' },
      { type: 'animation-window', label: 'Окно анимации', icon: 'resto-menu:events' },
      { type: 'hints', label: 'Область подсказок', icon: 'resto-menu:scheme-edit', isPremium: true },
    ],
  },
  {
    id: 'last-added-dish',
    label: 'Последнее добавленное блюдо',
    icon: 'resto-menu:menu-prices',
    collapsed: true,
    elements: [
      { type: 'allergens', label: 'Аллергены', icon: 'resto-menu:error' },
      { type: 'unit', label: 'Единица измерения', icon: 'resto-menu:analitics' },
      { type: 'product-image', label: 'Изображение продукта', icon: 'resto-menu:customer-screen' },
      { type: 'product-name', label: 'Название продукта', icon: 'resto:tov' },
      { type: 'product-name-intl', label: 'Название продукта (иностр.)', icon: 'resto:tov' },
      { type: 'product-qty', label: 'Количество продукта', icon: 'resto-menu:analitics' },
      { type: 'product-description', label: 'Описание продукта', icon: 'resto-menu:dictionary' },
      { type: 'product-description-intl', label: 'Описание продукта (иностр.)', icon: 'resto-menu:dictionary' },
      { type: 'nutrition', label: 'Пищевая ценность', icon: 'resto-menu:analitics' },
      { type: 'product-full-name', label: 'Полное название продукта', icon: 'resto:tov' },
      { type: 'product-scale', label: 'Масштаб продукта', icon: 'resto-menu:settings' },
      { type: 'product-price', label: 'Цена', icon: 'resto-menu:percent' },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'resto-menu:notification',
    collapsed: true,
    elements: [
      { type: 'advertise', label: 'Рекламный блок', icon: 'resto-menu:notification' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'resto-menu:analitics',
    collapsed: true,
    elements: [
      { type: 'current-time', label: 'Текущее время', icon: 'resto-menu:events' },
    ],
  },
];
