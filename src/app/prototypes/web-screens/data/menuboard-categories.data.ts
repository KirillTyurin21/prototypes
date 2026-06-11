import { ElementCategory } from '../types';

/**
 * Категории элементов темы для MenuBoard (Доска меню).
 * Иконки подобраны по библиотеке iiko frontend-common (Material Icons),
 * в прототипе используются Lucide-аналоги.
 */
export const MENUBOARD_THEME_CATEGORIES: ElementCategory[] = [
  {
    id: 'basic',
    label: 'Базовые',
    icon: 'layers',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'type' },
      { type: 'image', label: 'Изображение', icon: 'image' },
    ],
  },
  {
    id: 'containers',
    label: 'Контейнеры',
    icon: 'layout-grid',
    collapsed: true,
    elements: [
      { type: 'area', label: 'Область', icon: 'layout-grid' },
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
