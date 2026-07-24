import { ElementCategory } from '../types';

/**
 * Arrivals — Контролы (V2)
 * 7 категорий, 28 элементов.
 * Используется также для MenuBoard Controls (раздел 3.8).
 * Источник: DS-Группировка-элементов-спецификация.md, раздел 3.3
 */
export const ARRIVALS_CONTROL_CATEGORIES: ElementCategory[] = [
  {
    id: 'standard',
    label: 'Стандартные',
    icon: 'type',
    collapsed: false,
    elements: [
      { type: 'text', label: 'Текст', icon: 'type' },
      { type: 'image', label: 'Изображение', icon: 'image' },
      { type: 'rectangle' as any, label: 'Прямоугольник', icon: 'square' },
    ],
  },
  {
    id: 'order-data',
    label: 'Данные заказа',
    icon: 'file-text',
    collapsed: true,
    elements: [
      { type: 'order-number', label: 'Номер заказа', icon: 'hash' },
      { type: 'table-number', label: 'Номер стола', icon: 'hash' },
      { type: 'order-status', label: 'Статус заказа', icon: 'file-text' },
      { type: 'order-items', label: 'Состав заказа', icon: 'list' },
      { type: 'order-items-counter' as any, label: 'Количество блюд в заказе', icon: 'hash' },
    ],
  },
  {
    id: 'cooking-time',
    label: 'Время приготовления',
    icon: 'clock',
    collapsed: true,
    elements: [
      { type: 'cooking-start-time', label: 'Время начала приготовления заказа', icon: 'clock' },
      { type: 'cooking-end-time', label: 'Время завершения приготовления заказа', icon: 'clock' },
      { type: 'system-cooking-time', label: 'Системное время приготовления заказа', icon: 'clock' },
      { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа', icon: 'clock' },
      { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания', icon: 'clock' },
    ],
  },
  {
    id: 'client',
    label: 'Клиент',
    icon: 'user',
    collapsed: true,
    elements: [
      { type: 'client-name', label: 'Имя клиента', icon: 'user' },
      { type: 'client-phone', label: 'Номер телефона клиента', icon: 'phone' },
      { type: 'client-comment', label: 'Комментарий от клиента', icon: 'message-square' },
    ],
  },
  {
    id: 'delivery',
    label: 'Доставка',
    icon: 'truck',
    collapsed: true,
    elements: [
      { type: 'courier-name', label: 'Имя назначенного курьера', icon: 'user' },
      { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа', icon: 'clock' },
      { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки', icon: 'clock' },
      { type: 'dispatch-time', label: 'Время отправки заказа', icon: 'clock' },
      { type: 'travel-time', label: 'Время в пути', icon: 'clock' },
      { type: 'delivery-time', label: 'Время доставки заказа', icon: 'clock' },
      { type: 'delivery-status', label: 'Статус доставки', icon: 'file-text' },
      { type: 'client-delivery-time', label: 'Время доставки от клиента', icon: 'clock' },
    ],
  },
  {
    id: 'cancel',
    label: 'Отмена',
    icon: 'x-circle',
    collapsed: true,
    elements: [
      { type: 'cancel-reason', label: 'Причина отмены заказа', icon: 'file-text' },
      { type: 'cancel-comment', label: 'Комментарий к отмене заказа', icon: 'message-square' },
      { type: 'cancel-time', label: 'Время отмены заказа', icon: 'clock' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'info',
    collapsed: true,
    elements: [
      { type: 'external-data', label: 'Внешние данные', icon: 'info' },
    ],
  },
];
