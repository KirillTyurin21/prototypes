import { ElementCategory } from '../types';

/**
 * Arrivals — Контролы (V2)
 * 7 категорий, 28 элементов.
 * Используется также для MenuBoard Controls (раздел 3.8).
 * Иконки: Resto Icons (frontend-common.iiko.ru/development-kit/icons)
 * Источник: DS-Группировка-элементов-ИКОНКИ_RESTO.md
 */
export const ARRIVALS_CONTROL_CATEGORIES: ElementCategory[] = [
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
    id: 'order-data',
    label: 'Данные заказа',
    icon: 'resto-menu:external-orders',
    collapsed: true,
    elements: [
      { type: 'order-number', label: 'Номер заказа', icon: 'resto-menu:external-orders' },
      { type: 'table-number', label: 'Номер стола', icon: 'resto:table-chair' },
      { type: 'order-status', label: 'Статус заказа', icon: 'resto:approve' },
      { type: 'order-items', label: 'Состав заказа', icon: 'resto:tov' },
      { type: 'order-items-counter' as any, label: 'Количество блюд в заказе', icon: 'resto-menu:analitics' },
    ],
  },
  {
    id: 'cooking-time',
    label: 'Время приготовления',
    icon: 'resto-menu:smart-kitchen',
    collapsed: true,
    elements: [
      { type: 'cooking-start-time', label: 'Время начала приготовления заказа', icon: 'resto-menu:events' },
      { type: 'cooking-end-time', label: 'Время завершения приготовления заказа', icon: 'resto-menu:events' },
      { type: 'system-cooking-time', label: 'Системное время приготовления заказа', icon: 'resto-menu:events' },
      { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа', icon: 'resto-menu:events' },
      { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания', icon: 'resto-menu:error' },
    ],
  },
  {
    id: 'client',
    label: 'Клиент',
    icon: 'resto-menu:staff',
    collapsed: true,
    elements: [
      { type: 'client-name', label: 'Имя клиента', icon: 'resto-menu:staff' },
      { type: 'client-phone', label: 'Номер телефона клиента', icon: 'resto-menu:call-centre' },
      { type: 'client-comment', label: 'Комментарий от клиента', icon: 'resto:edit_document' },
    ],
  },
  {
    id: 'delivery',
    label: 'Доставка',
    icon: 'resto-menu:delivery-map',
    collapsed: true,
    elements: [
      { type: 'courier-name', label: 'Имя назначенного курьера', icon: 'resto-menu:external-driver' },
      { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа', icon: 'resto-menu:events' },
      { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки', icon: 'resto-menu:events' },
      { type: 'dispatch-time', label: 'Время отправки заказа', icon: 'resto-menu:events' },
      { type: 'travel-time', label: 'Время в пути', icon: 'resto-menu:local-shipping' },
      { type: 'delivery-time', label: 'Время доставки заказа', icon: 'resto-menu:events' },
      { type: 'delivery-status', label: 'Статус доставки', icon: 'resto:approve' },
      { type: 'client-delivery-time', label: 'Время доставки от клиента', icon: 'resto-menu:events' },
    ],
  },
  {
    id: 'cancel',
    label: 'Отмена',
    icon: 'resto:cancel',
    collapsed: true,
    elements: [
      { type: 'cancel-reason', label: 'Причина отмены заказа', icon: 'resto:cancel' },
      { type: 'cancel-comment', label: 'Комментарий к отмене заказа', icon: 'resto:edit_document' },
      { type: 'cancel-time', label: 'Время отмены заказа', icon: 'resto-menu:events' },
    ],
  },
  {
    id: 'info',
    label: 'Информационные',
    icon: 'resto-menu:analitics',
    collapsed: true,
    elements: [
      { type: 'external-data', label: 'Внешние данные', icon: 'resto-menu:entity-import' },
    ],
  },
];
