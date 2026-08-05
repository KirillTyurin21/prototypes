import { ElementCategory } from '../types';

/**
 * Arrivals — Темы (V2)
 * 4 категории, 8 элементов.
 * Иконки: Resto Icons (frontend-common.iiko.ru/development-kit/icons)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md
 */
export const ARRIVALS_THEME_CATEGORIES: ElementCategory[] = [
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
      { type: 'area', label: 'Область', icon: 'resto-menu:storefront', isPremium: true },
      { type: 'popup' as any, label: 'Всплывающее окно', icon: 'resto-menu:events' },
    ],
  },
  {
    id: 'media',
    label: 'Медиа',
    icon: 'resto-menu:notification',
    collapsed: true,
    elements: [
      { type: 'advertise', label: 'Рекламный блок', icon: 'resto-menu:notification' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'resto-menu:analitics',
    collapsed: true,
    elements: [
      { type: 'counter', label: 'Текущее время', icon: 'resto-menu:events' },
      { type: 'counter-value' as any, label: 'Счетчик', icon: 'resto-menu:analitics' },
    ],
  },
];
