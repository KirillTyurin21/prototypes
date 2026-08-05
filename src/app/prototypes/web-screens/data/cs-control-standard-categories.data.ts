/**
 * Customer Screen — Контролы, тип Стандартный (V2)
 * 3 категории, 15 элементов.
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

export const CS_CONTROL_STANDARD_CATEGORIES: PaletteCategory[] = [
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
    id: 'product-props',
    label: 'Свойства продукта',
    icon: 'resto:tov',
    collapsed: true,
    elements: [
      { type: 'product-name', label: 'Название продукта', icon: 'resto:tov' },
      { type: 'product-name-intl', label: 'Название продукта (иностр.)', icon: 'resto:tov' },
      { type: 'product-full-name', label: 'Полное название продукта', icon: 'resto:tov' },
      { type: 'product-description', label: 'Описание продукта', icon: 'resto-menu:dictionary' },
      { type: 'product-description-intl', label: 'Описание продукта (иностр.)', icon: 'resto-menu:dictionary' },
      { type: 'product-price', label: 'Цена', icon: 'resto-menu:percent' },
      { type: 'product-scale', label: 'Масштаб продукта', icon: 'resto-menu:settings' },
      { type: 'product-unit', label: 'Единица измерения', icon: 'resto-menu:analitics' },
      { type: 'product-allergens', label: 'Аллергены', icon: 'resto-menu:error' },
      { type: 'product-nutrition', label: 'Пищевая ценность', icon: 'resto-menu:analitics' },
      { type: 'product-qty', label: 'Количество продукта', icon: 'resto-menu:analitics' },
    ],
  },
  {
    id: 'visualization',
    label: 'Визуализация',
    icon: 'resto-menu:customer-screen',
    collapsed: true,
    elements: [
      { type: 'product-image', label: 'Изображение продукта', icon: 'resto-menu:customer-screen' },
    ],
  },
];
