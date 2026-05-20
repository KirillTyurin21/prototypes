/**
 * Типы прототипа Sparrow (кодовое имя)
 *
 * Источник: materials/Бинши/Beanshe-спецификация.md
 * - Раздел 6.1: Entity Mapping — поля заказа
 * - Раздел 6.2: Машина состояний — 9 статусов
 * - Раздел 9.2: UI — вкладки, кнопки
 */

// ─── Статусы заказа (раздел 6.2) ────────────────────

/**
 * 9 статусов заказа, 5 финальных.
 * Источник: спецификация, раздел 6.2 — Машина состояний заказа
 */
export type SparrowOrderStatus =
  | 'created'             // Получен, ожидает действия баристы
  | 'accepted'            // Принят баристой
  | 'preparing'           // Готовится (CookingStarted в Front)
  | 'ready'               // Готов, ожидает покупателя (CookingCompleted в Front)
  | 'completed'           // Выдан покупателю (финальный)
  | 'cancelled_barista'   // Отменён баристой до принятия (финальный)
  | 'cancelled_customer'  // Отменён покупателем (финальный)
  | 'expired'             // Автоотмена: не принят за 4 мин до выдачи (финальный)
  | 'discarded';          // Не забрали за 15 мин после ready (финальный)

/** Финальные статусы (заказ больше не меняется) */
export const FINAL_STATUSES: SparrowOrderStatus[] = [
  'completed', 'cancelled_barista', 'cancelled_customer', 'expired', 'discarded',
];

/** Статусы для вкладки «Активные» (раздел 9.2) */
export const ACTIVE_STATUSES: SparrowOrderStatus[] = [
  'created', 'accepted', 'preparing', 'ready',
];

/** Статусы для вкладки «Отменённые» */
export const CANCELLED_STATUSES: SparrowOrderStatus[] = [
  'cancelled_barista', 'cancelled_customer', 'expired',
];

/** Статусы для вкладки «Закрытые» */
export const CLOSED_STATUSES: SparrowOrderStatus[] = [
  'completed', 'discarded',
];

/** Метаданные статуса: человеческое название и цвет бейджа */
export const STATUS_META: Record<SparrowOrderStatus, { label: string; color: string }> = {
  created:            { label: 'Новый',       color: '#f59e0b' }, // жёлтый
  accepted:           { label: 'Принят',      color: '#3b82f6' }, // синий
  preparing:          { label: 'Готовится',   color: '#f97316' }, // оранжевый
  ready:              { label: 'Готов',       color: '#22c55e' }, // зелёный
  completed:          { label: 'Завершён',    color: '#6b7280' }, // серый
  cancelled_barista:  { label: 'Отменён',     color: '#ef4444' }, // красный
  cancelled_customer: { label: 'Отменён',     color: '#ef4444' }, // красный
  expired:            { label: 'Просрочен',   color: '#9ca3af' }, // серый
  discarded:          { label: 'Не забрали',  color: '#9ca3af' }, // серый
};

// ─── Продукт ──────────────────────────────────────────

/** Продукт кофейни (меню) */
export interface SparrowProduct {
  id: number;
  name: string;
  price: number;
  sizes: string[];
}

/** Модификатор продукта */
export interface SparrowModification {
  name: string;
}

// ─── Позиция заказа ─────────────────────────────────

/** Позиция заказа (раздел 6.1 — items[]) */
export interface SparrowOrderItem {
  productId: number;
  productName: string;
  size: string;
  modifications: string[];
  quantity: number;
  price: number;
}

// ─── Заказ ──────────────────────────────────────────

/**
 * Заказ в буфере плагина.
 * Источник: спецификация, раздел 6.1 — таблица полей заказа
 */
export interface SparrowOrder {
  /** ID заказа во внешней системе */
  id: number;
  /** Номер заказа для отображения */
  number: string;
  /** Текущий статус */
  status: SparrowOrderStatus;
  /** Имя покупателя */
  customerName: string;
  /** Позиции заказа */
  items: SparrowOrderItem[];
  /** Итоговая сумма (со скидкой) */
  totalPrice: number;
  /** Время выдачи (ISO 8601) */
  pickupTime: string;
  /** Комментарий покупателя */
  comment: string;
  /** Время создания (ISO 8601) */
  createdAt: string;
  /** Время принятия */
  acceptedAt: string | null;
  /** Время завершения */
  completedAt: string | null;
}

// ─── Стоп-лист ──────────────────────────────────────

/** Источник постановки на стоп (раздел 4.6, требование 16) */
export type StopSource = 'manual' | 'auto_sync' | 'backend_push';

/** Элемент стоп-листа */
export interface SparrowStopListItem {
  productId: number;
  productName: string;
  /** На стопе? */
  isStopped: boolean;
  /** Источник стопа (если isStopped=true) */
  stopSource: StopSource | null;
  /** В стоп-листе Front (toggle заблокирован) */
  isStoppedInFront: boolean;
}

// ─── Нотификация ────────────────────────────────────

/** Тип блокирующей нотификации (раздел 9.3) */
export type SparrowNotificationType = 'new_order' | 'not_picked_up';

/** Нотификация в FIFO-очереди */
export interface SparrowNotification {
  type: SparrowNotificationType;
  orderId: number;
  order: SparrowOrder;
}

// ─── Лог событий (панель эмуляции) ──────────────────

export interface SparrowLogEntry {
  time: string;
  method: string;
  endpoint: string;
  status: 'success' | 'error';
  description: string;
}

// ─── Вкладки окна плагина ───────────────────────────

export type SparrowTab = 'active' | 'cancelled' | 'closed';
