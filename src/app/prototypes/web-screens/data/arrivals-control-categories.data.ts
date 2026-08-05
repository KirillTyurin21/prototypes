import { ElementCategory } from '../types';

/**
 * Arrivals — Контролы (V2)
 * 7 категорий, 28 элементов.
 * Используется также для MenuBoard Controls (раздел 3.8).
 * Иконки: Material Icons (frontend-common.iiko.ru/components/resto-icon/dynamic/icon%20list)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md (ред. 05.08.2026)
 */
export const ARRIVALS_CONTROL_CATEGORIES: ElementCategory[] = [
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
    id: 'order-data',
    label: 'Данные заказа',
    icon: 'receipt_long',
    collapsed: true,
    elements: [
      { type: 'order-number', label: 'Номер заказа', icon: 'receipt_long' },
      { type: 'table-number', label: 'Номер стола', icon: 'table_bar' },
      { type: 'order-status', label: 'Статус заказа', icon: 'check_circle' },
      { type: 'order-items', label: 'Состав заказа', icon: 'list_alt' },
      { type: 'order-items-counter' as any, label: 'Количество блюд в заказе', icon: 'analytics' },
    ],
  },
  {
    id: 'cooking-time',
    label: 'Время приготовления',
    icon: 'schedule',
    collapsed: true,
    elements: [
      { type: 'cooking-start-time', label: 'Время начала приготовления заказа', icon: 'schedule' },
      { type: 'cooking-end-time', label: 'Время завершения приготовления заказа', icon: 'schedule' },
      { type: 'system-cooking-time', label: 'Системное время приготовления заказа', icon: 'schedule' },
      { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа', icon: 'hourglass_full' },
      { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания', icon: 'error' },
    ],
  },
  {
    id: 'client',
    label: 'Клиент',
    icon: 'person',
    collapsed: true,
    elements: [
      { type: 'client-name', label: 'Имя клиента', icon: 'person' },
      { type: 'client-phone', label: 'Номер телефона клиента', icon: 'call' },
      { type: 'client-comment', label: 'Комментарий от клиента', icon: 'comment' },
    ],
  },
  {
    id: 'delivery',
    label: 'Доставка',
    icon: 'local_shipping',
    collapsed: true,
    elements: [
      { type: 'courier-name', label: 'Имя назначенного курьера', icon: 'external-driver' },
      { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа', icon: 'schedule' },
      { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки', icon: 'schedule' },
      { type: 'dispatch-time', label: 'Время отправки заказа', icon: 'schedule' },
      { type: 'travel-time', label: 'Время в пути', icon: 'local_shipping' },
      { type: 'delivery-time', label: 'Время доставки заказа', icon: 'schedule' },
      { type: 'delivery-status', label: 'Статус доставки', icon: 'check_circle' },
      { type: 'client-delivery-time', label: 'Время доставки от клиента', icon: 'schedule' },
    ],
  },
  {
    id: 'cancel',
    label: 'Отмена',
    icon: 'cancel',
    collapsed: true,
    elements: [
      { type: 'cancel-reason', label: 'Причина отмены заказа', icon: 'cancel' },
      { type: 'cancel-comment', label: 'Комментарий к отмене заказа', icon: 'comment' },
      { type: 'cancel-time', label: 'Время отмены заказа', icon: 'schedule' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'analytics',
    collapsed: true,
    elements: [
      { type: 'external-data', label: 'Внешние данные', icon: 'cloud_download' },
    ],
  },
];
