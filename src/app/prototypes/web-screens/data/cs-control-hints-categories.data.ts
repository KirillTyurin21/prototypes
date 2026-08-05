/**
 * Customer Screen — Контролы, тип Подсказка (V2)
 * 3 категории, 10 элементов.
 * Иконки: Material Icons (frontend-common.iiko.ru/components/resto-icon/dynamic/icon%20list)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md (ред. 05.08.2026)
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
    icon: 'build',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'text_fields' },
      { type: 'image', label: 'Изображение', icon: 'photo' },
      { type: 'rectangle', label: 'Прямоугольник', icon: 'check_box_outline_blank' },
    ],
  },
  {
    id: 'visual-props',
    label: 'Визуальные свойства',
    icon: 'design_services',
    collapsed: true,
    elements: [
      { type: 'hint-text', label: 'Текст подсказки', icon: 'text_fields' },
      { type: 'hint-image', label: 'Изображение подсказки', icon: 'photo' },
      { type: 'hint-name', label: 'Название подсказки', icon: 'inventory' },
      { type: 'hint-dish-name', label: 'Название блюда', icon: 'restaurant' },
    ],
  },
  {
    id: 'prices',
    label: 'Цены',
    icon: 'sell',
    collapsed: true,
    elements: [
      { type: 'discount-name', label: 'Название скидки', icon: 'percent' },
      { type: 'discount-amount', label: 'Размер скидки', icon: 'percent' },
      { type: 'price-without-discount', label: 'Цена без скидки', icon: 'point_of_sale' },
      { type: 'price-with-discount', label: 'Цена со скидкой', icon: 'percent' },
    ],
  },
];
