/**
 * Customer Screen — Контролы, тип Подсказка (V2)
 * 3 категории, 10 элементов.
 * Иконки: Resto Icons (frontend-common.iiko.ru/development-kit/icons)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md
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

export const CS_CONTROL_HINTS_CATEGORIES: PaletteCategory[] = [
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
    id: 'visual-props',
    label: 'Визуальные свойства',
    icon: 'resto-menu:scheme-edit',
    collapsed: true,
    elements: [
      { type: 'hint-text', label: 'Текст подсказки', icon: 'resto:edit_document' },
      { type: 'hint-image', label: 'Изображение подсказки', icon: 'resto-menu:customer-screen' },
      { type: 'hint-name', label: 'Название подсказки', icon: 'resto:tov' },
      { type: 'hint-dish-name', label: 'Название блюда', icon: 'resto:rice' },
    ],
  },
  {
    id: 'prices',
    label: 'Цены',
    icon: 'resto-menu:percent',
    collapsed: true,
    elements: [
      { type: 'discount-name', label: 'Название скидки', icon: 'resto-menu:percent' },
      { type: 'discount-amount', label: 'Размер скидки', icon: 'resto-menu:percent' },
      { type: 'price-without-discount', label: 'Цена без скидки', icon: 'resto-menu:cash-layouts' },
      { type: 'price-with-discount', label: 'Цена со скидкой', icon: 'resto-menu:percent' },
    ],
  },
];
