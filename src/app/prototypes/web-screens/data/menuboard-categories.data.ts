import { ElementCategory } from '../types';

/**
 * MenuBoard — Темы (V2)
 * 4 категории, 7 элементов.
 * Источник: DS-Группировка-элементов-спецификация.md, раздел 3.7
 */
export const MENUBOARD_THEME_CATEGORIES: ElementCategory[] = [
  {
    id: 'standard',
    label: 'Стандартные',
    icon: 'layers',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'type' },
      { type: 'image', label: 'Изображение', icon: 'image' },
      { type: 'rectangle' as any, label: 'Прямоугольник', icon: 'square' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'layout-grid',
    collapsed: true,
    elements: [
      { type: 'area', label: 'Область контролов', icon: 'square' },
    ],
  },
  {
    id: 'data',
    label: 'Данные',
    icon: 'list',
    collapsed: true,
    elements: [
      { type: 'menulist' as any, label: 'Меню-лист', icon: 'list' },
      { type: 'advertise' as any, label: 'Динамическая область', icon: 'megaphone' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'info',
    collapsed: true,
    elements: [
      { type: 'counter' as any, label: 'Текущее время', icon: 'clock' },
    ],
  },
];
