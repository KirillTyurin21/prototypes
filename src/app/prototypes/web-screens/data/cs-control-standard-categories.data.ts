/**
 * Customer Screen — Контролы, тип Стандартный (V2)
 * 3 категории, 15 элементов.
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

export const CS_CONTROL_STANDARD_CATEGORIES: PaletteCategory[] = [
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
    id: 'product-props',
    label: 'Свойства продукта',
    icon: 'inventory',
    collapsed: true,
    elements: [
      { type: 'product-name', label: 'Название продукта', icon: 'inventory' },
      { type: 'product-name-intl', label: 'Название продукта (иностр.)', icon: 'inventory' },
      { type: 'product-full-name', label: 'Полное название продукта', icon: 'inventory' },
      { type: 'product-description', label: 'Описание продукта', icon: 'description' },
      { type: 'product-description-intl', label: 'Описание продукта (иностр.)', icon: 'description' },
      { type: 'product-price', label: 'Цена', icon: 'sell' },
      { type: 'product-scale', label: 'Масштаб продукта', icon: 'settings' },
      { type: 'product-unit', label: 'Единица измерения', icon: 'square_foot' },
      { type: 'product-allergens', label: 'Аллергены', icon: 'error' },
      { type: 'product-nutrition', label: 'Пищевая ценность', icon: 'analytics' },
      { type: 'product-qty', label: 'Количество продукта', icon: 'analytics' },
    ],
  },
  {
    id: 'visualization',
    label: 'Визуализация',
    icon: 'visibility',
    collapsed: true,
    elements: [
      { type: 'product-image', label: 'Изображение продукта', icon: 'photo' },
    ],
  },
];
