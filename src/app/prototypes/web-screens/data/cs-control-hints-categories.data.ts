/**
 * Customer Screen — Контролы, тип Подсказка (V2)
 * 3 категории, 10 элементов.
 * Источник: DS-Группировка-элементов-спецификация.md, раздел 3.6
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
    icon: 'type',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'type' },
      { type: 'image', label: 'Изображение', icon: 'image' },
      { type: 'rectangle', label: 'Прямоугольник', icon: 'square' },
    ],
  },
  {
    id: 'visual-props',
    label: 'Визуальные свойства',
    icon: 'message-square',
    collapsed: true,
    elements: [
      { type: 'hint-text', label: 'Текст подсказки', icon: 'type' },
      { type: 'hint-image', label: 'Изображение подсказки', icon: 'image' },
      { type: 'hint-name', label: 'Название подсказки', icon: 'message-square' },
      { type: 'hint-dish-name', label: 'Название блюда', icon: 'utensils' },
    ],
  },
  {
    id: 'prices',
    label: 'Цены',
    icon: 'percent',
    collapsed: true,
    elements: [
      { type: 'discount-name', label: 'Название скидки', icon: 'percent' },
      { type: 'discount-amount', label: 'Размер скидки', icon: 'percent' },
      { type: 'price-without-discount', label: 'Цена без скидки', icon: 'bar-chart-3' },
      { type: 'price-with-discount', label: 'Цена со скидкой', icon: 'bar-chart-3' },
    ],
  },
];
