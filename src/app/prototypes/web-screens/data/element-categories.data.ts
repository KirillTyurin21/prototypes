import { ElementCategory } from '../types';

/**
 * Категории элементов темы для Arrivals.
 * Иконки подобраны по библиотеке iiko frontend-common (Material Icons),
 * в прототипе используются Lucide-аналоги.
 *
 * Соответствие iiko Material → Lucide:
 *   category → layers        text_fields → type       photo → image
 *   dashboard → layout-grid   style → paintbrush       check_box_outline_blank → square
 *   campaign → megaphone      info → info              schedule → clock
 *   bar_chart → bar-chart-3
 */
export const ARRIVALS_THEME_CATEGORIES: ElementCategory[] = [
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
    id: 'decorative',
    label: 'Декоративные',
    icon: 'paintbrush',
    collapsed: true,
    elements: [
      { type: 'menulist', label: 'Прямоугольник', icon: 'square' },
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
      { type: 'price', label: 'Счетчик', icon: 'bar-chart-3' },
      { type: 'external-order-number', label: 'Внешний номер заказа', icon: 'hash' },
    ],
  },
];
