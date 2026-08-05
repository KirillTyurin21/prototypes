import { ElementCategory } from '../types';

/**
 * MenuBoard — Темы (V2)
 * 4 категории, 7 элементов.
 * Иконки: Resto Icons (frontend-common.iiko.ru/development-kit/icons)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md
 */
export const MENUBOARD_THEME_CATEGORIES: ElementCategory[] = [
  {
    id: 'standard',
    label: 'Стандартные',
    icon: 'resto-menu:constructor',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'resto:edit_document' },
      { type: 'image', label: 'Изображение', icon: 'resto-menu:customer-screen' },
      { type: 'rectangle' as any, label: 'Прямоугольник', icon: 'resto-menu:storefront' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'resto-menu:storefront',
    collapsed: true,
    elements: [
      { type: 'area', label: 'Область контролов', icon: 'resto-menu:storefront', isPremium: true },
    ],
  },
  {
    id: 'data',
    label: 'Данные',
    icon: 'resto-menu:menu-prices',
    collapsed: true,
    elements: [
      { type: 'menulist' as any, label: 'Меню-лист', icon: 'resto-menu:menu-prices' },
      { type: 'advertise' as any, label: 'Динамическая область', icon: 'resto-menu:events' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'resto-menu:analitics',
    collapsed: true,
    elements: [
      { type: 'counter' as any, label: 'Текущее время', icon: 'resto-menu:events' },
    ],
  },
];
