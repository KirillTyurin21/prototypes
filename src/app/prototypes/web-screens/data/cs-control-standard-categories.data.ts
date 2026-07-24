/**
 * Customer Screen — Контролы, тип Стандартный (V2)
 * 3 категории, 15 элементов.
 * Источник: DS-Группировка-элементов-спецификация.md, раздел 3.5
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

export const CS_CONTROL_STANDARD_CATEGORIES: PaletteCategory[] = [
  {
    id: 'text-media',
    label: 'Текст и медиа',
    icon: 'type',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'type' },
      { type: 'image', label: 'Изображение', icon: 'image' },
      { type: 'rectangle', label: 'Прямоугольник', icon: 'square' },
    ],
  },
  {
    id: 'product-props',
    label: 'Свойства продукта',
    icon: 'package',
    collapsed: true,
    elements: [
      { type: 'product-name', label: 'Название продукта', icon: 'type' },
      { type: 'product-name-intl', label: 'Название продукта (иностр.)', icon: 'type' },
      { type: 'product-full-name', label: 'Полное название продукта', icon: 'type' },
      { type: 'product-description', label: 'Описание продукта', icon: 'type' },
      { type: 'product-description-intl', label: 'Описание продукта (иностр.)', icon: 'type' },
      { type: 'product-price', label: 'Цена', icon: 'bar-chart-3' },
      { type: 'product-scale', label: 'Масштаб продукта', icon: 'maximize' },
      { type: 'product-unit', label: 'Единица измерения', icon: 'ruler' },
      { type: 'product-allergens', label: 'Аллергены', icon: 'alert-circle' },
      { type: 'product-nutrition', label: 'Пищевая ценность', icon: 'bar-chart-3' },
      { type: 'product-qty', label: 'Количество продукта', icon: 'hash' },
    ],
  },
  {
    id: 'visualization',
    label: 'Визуализация',
    icon: 'eye',
    collapsed: true,
    elements: [
      { type: 'product-image', label: 'Изображение продукта', icon: 'image' },
    ],
  },
];
