import { ElementCategory } from '../types';

/**
 * MenuBoard — Темы (V2)
 * 4 категории, 7 элементов.
 * Иконки: Material Icons (frontend-common.iiko.ru/components/resto-icon/dynamic/icon%20list)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md (ред. 05.08.2026)
 */
export const MENUBOARD_THEME_CATEGORIES: ElementCategory[] = [
  {
    id: 'standard',
    label: 'Стандартные',
    icon: 'build',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'text_fields' },
      { type: 'image', label: 'Изображение', icon: 'photo' },
      { type: 'rectangle' as any, label: 'Прямоугольник', icon: 'check_box_outline_blank' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'grid_view',
    collapsed: true,
    elements: [
      { type: 'area', label: 'Область контролов', icon: 'grid_view', isPremium: true },
    ],
  },
  {
    id: 'data',
    label: 'Данные',
    icon: 'menu_book',
    collapsed: true,
    elements: [
      { type: 'menulist' as any, label: 'Меню-лист', icon: 'menu_book' },
      { type: 'advertise' as any, label: 'Динамическая область', icon: 'schedule' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'analytics',
    collapsed: true,
    elements: [
      { type: 'counter' as any, label: 'Текущее время', icon: 'schedule' },
    ],
  },
];
