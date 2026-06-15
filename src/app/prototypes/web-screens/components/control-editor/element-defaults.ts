import { ArrivalsElementType, ArrivalsThemeElement } from '../../types';

export interface OrderMockItem {
  name: string;
  qty: number;
  status: string;
  ready: boolean;
  delivered: boolean;
}

export interface ElementTypeOption {
  type: ArrivalsElementType;
  label: string;
}

export const EMU_ITEM_STATUSES = ['Ожидает', 'Готовится', 'Готово', 'Выдача', 'Подан'];

export const INITIAL_ORDER_MOCK_ITEMS: OrderMockItem[] = [
  { name: 'Шашлык из баранины', qty: 2, status: 'Подан', ready: true, delivered: true },
  { name: 'Салат Цезарь', qty: 1, status: 'Готово', ready: true, delivered: false },
  { name: 'Стейк Рибай', qty: 1, status: 'Готовится', ready: false, delivered: false },
  { name: 'Картофель фри', qty: 2, status: 'Ожидает', ready: false, delivered: false },
  { name: 'Лимонад', qty: 3, status: 'Готово', ready: true, delivered: false },
];

export const EXTRA_DISHES = [
  'Том ям', 'Маргарита', 'Борщ', 'Филе лосося', 'Паста Карбонара',
  'Греческий салат', 'Куриные крылья', 'Тирамису',
];

export const ELEMENT_TYPES: ElementTypeOption[] = [
  { type: 'text', label: 'Текст' },
  { type: 'image', label: 'Изображение' },
  { type: 'order-number', label: 'Номер заказа' },
  { type: 'table-number', label: 'Номер стола' },
  { type: 'order-status', label: 'Статус заказа' },
  { type: 'cooking-start-time', label: 'Время начала приготовления заказа' },
  { type: 'cooking-end-time', label: 'Время завершения приготовления заказа' },
  { type: 'system-cooking-time', label: 'Системное время приготовления заказа' },
  { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа' },
  { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания' },
  { type: 'client-name', label: 'Имя клиента' },
  { type: 'client-phone', label: 'Номер телефона клиента' },
  { type: 'courier-name', label: 'Имя назначенного курьера' },
  { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа' },
  { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки' },
  { type: 'dispatch-time', label: 'Время отправки заказа' },
  { type: 'travel-time', label: 'Время в пути' },
  { type: 'delivery-time', label: 'Время доставки заказа' },
  { type: 'delivery-status', label: 'Статус доставки' },
  { type: 'client-comment', label: 'Комментарий от клиента' },
  { type: 'client-delivery-time', label: 'Время доставки, обозначенное клиентом' },
  { type: 'cancel-reason', label: 'Причина отмены заказа' },
  { type: 'cancel-comment', label: 'Комментарий к отмене заказа' },
  { type: 'cancel-time', label: 'Время отмены заказа' },
  { type: 'external-data', label: 'Внешние данные' },
  { type: 'order-items', label: 'A. Состав заказа — Таблица' },
  { type: 'order-items-zones', label: 'B. Состав заказа — Две зоны' },
  { type: 'order-items-progress', label: 'C. Состав заказа — Прогресс' },
  { type: 'order-items-checklist', label: 'D. Состав заказа — Чеклист' },
  { type: 'order-items-cards', label: 'E. Состав заказа — Карточки' },
  { type: 'counter', label: 'Количество блюд в заказе' },
  { type: 'external-order-number', label: 'Внешний номер заказа' },
];

export function getElementTypeLabel(type: string): string {
  return ELEMENT_TYPES.find(et => et.type === type)?.label ?? type;
}

export function createDefaultElement(type: ArrivalsElementType, offset: number): ArrivalsThemeElement {
  const label = getElementTypeLabel(type);
  const el: ArrivalsThemeElement = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    type,
    name: label,
    x: 20 + offset * 20,
    y: 20 + offset * 20,
    width: 120,
    height: 60,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
  };

  if (type === 'text') {
    el.text = 'Type something';
    el.fontFamily = 'Arial';
    el.fontSize = 14;
    el.fontBold = false;
    el.fontItalic = false;
    el.textAlign = 'left';
  }

  if (type === 'order-items') {
    el.width = 400;
    el.height = 200;
    el.orderDisplayMode = 'all';
    el.orderTriggerStatus = '';
    el.orderHideOnComplete = false;
    el.orderHidePendingStatusText = true;
    el.orderHideDeliveredItems = true;
    el.orderGroupReadyFirst = true;
    el.orderShowName = true;
    el.orderShowQty = true;
    el.orderShowStatus = true;
    el.orderNameColWidth = 150;
    el.orderQtyColWidth = 50;
    el.orderStatusColWidth = 80;
    el.orderShowHeader = true;
    el.orderHeaderBg = '#333333';
    el.orderHeaderHeight = 36;
    el.orderShowNameLabel = true;
    el.orderShowQtyLabel = true;
    el.orderShowStatusLabel = true;
    el.orderNameLabel = 'Наименование';
    el.orderQtyLabel = 'Кол-во';
    el.orderStatusLabel = 'Статус';
    el.orderRowHeight = 32;
    el.orderReadyColor = '#e8f5e9';
    el.orderNotReadyColor = '#ffffff';
    el.orderHeaderFontSize = 14;
    el.orderHeaderFontFamily = 'Roboto';
    el.orderHeaderFontColor = '#ffffff';
    el.orderNameFontSize = 14;
    el.orderNameFontFamily = 'Roboto';
    el.orderNameFontColor = '#333333';
    el.orderQtyFontSize = 14;
    el.orderQtyFontFamily = 'Roboto';
    el.orderQtyFontColor = '#333333';
    el.orderStatusFontSize = 14;
    el.orderStatusFontFamily = 'Roboto';
    el.orderStatusFontColor = '#333333';
    el.orderDynamicHeight = true;
  }

  if (type === 'order-items-zones' || type === 'order-items-progress' ||
      type === 'order-items-checklist' || type === 'order-items-cards') {
    el.width = 400;
    el.height = 260;
    el.orderDynamicHeight = true;
  }

  if (type === 'order-items-zones') {
    el.zonesReadyBg = '#e8f5e9';
    el.zonesPendingBg = '#fff3e0';
    el.zonesReadyHeaderText = 'МОЖНО ЗАБРАТЬ';
    el.zonesPendingHeaderText = 'ГОТОВИТСЯ';
    el.zonesShowAllReadyMsg = true;
    el.zonesItemFontSize = 12;
    el.zonesHeaderFontSize = 11;
  }

  if (type === 'order-items-progress') {
    el.progressCircleColor = '#4caf50';
    el.progressTrackColor = '#e0e0e0';
    el.progressShowPercent = true;
    el.progressShowCount = true;
    el.progressCircleSize = 64;
    el.progressItemFontSize = 12;
  }

  if (type === 'order-items-checklist') {
    el.checklistStrikethrough = true;
    el.checklistShowCounter = true;
    el.checklistReadyBg = '#f1f8e9';
    el.checklistDoneText = 'Заказ полностью готов';
    el.checklistItemFontSize = 12;
  }

  if (type === 'counter') {
    el.width = 120;
    el.height = 40;
    el.counterStatuses = ['Готово'];
    el.counterDisplayMode = 'text';
    el.fontFamily = 'Roboto';
    el.fontSize = 14;
    el.fontBold = false;
    el.fontItalic = false;
    el.textAlign = 'center';
  }

  if (type === 'order-items-cards') {
    el.cardsPerRow = 2;
    el.cardsReadyBorderColor = '#4caf50';
    el.cardsReadyBg = '#e8f5e9';
    el.cardsPendingBg = '#fff3e0';
    el.cardsGap = 4;
    el.cardsItemFontSize = 11;
  }

  if (type === 'external-order-number') {
    el.name = 'Внешний номер заказа';
    el.fontFamily = 'Arial';
    el.fontSize = 24;
    el.fontBold = true;
    el.fontItalic = false;
    el.textAlign = 'center';
    el.externalSource = '';
    el.externalPrefix = '';
    el.externalSuffix = '';
    el.externalMaxLength = 0;
    el.externalShowFallback = false;
    el.externalDemoNumber = '';
    el.width = 200;
    el.height = 40;
  }

  return el;
}
