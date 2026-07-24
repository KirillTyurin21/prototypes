import { ElementCategory } from '../types';

/**
 * Arrivals — Темы (V2)
 * 4 категории, 8 элементов.
 * Источник: DS-Группировка-элементов-спецификация.md, раздел 3.2
 */
export const ARRIVALS_THEME_CATEGORIES: ElementCategory[] = [
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
      { type: 'area', label: 'Область', icon: 'square' },
      { type: 'popup' as any, label: 'Всплывающее окно', icon: 'panel-right-open' },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'megaphone',
    collapsed: true,
    elements: [
      { type: 'advertise', label: 'Рекламный блок', icon: 'megaphone' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'info',
    collapsed: true,
    elements: [
      { type: 'counter', label: 'Текущее время', icon: 'clock' },
      { type: 'counter-value' as any, label: 'Счетчик', icon: 'hash' },
    ],
  },
];
