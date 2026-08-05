import { ElementCategory } from '../types';

/**
 * Arrivals — Темы (V2)
 * 4 категории, 8 элементов.
 * Иконки: Material Icons (frontend-common.iiko.ru/components/resto-icon/dynamic/icon%20list)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md (ред. 05.08.2026)
 */
export const ARRIVALS_THEME_CATEGORIES: ElementCategory[] = [
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
      { type: 'area', label: 'Область', icon: 'grid_view', isPremium: true },
      { type: 'popup' as any, label: 'Всплывающее окно', icon: 'open_in_new' },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'campaign',
    collapsed: true,
    elements: [
      { type: 'advertise', label: 'Рекламный блок', icon: 'notifications' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'analytics',
    collapsed: true,
    elements: [
      { type: 'counter', label: 'Текущее время', icon: 'schedule' },
      { type: 'counter-value' as any, label: 'Счетчик', icon: 'analytics' },
    ],
  },
];
