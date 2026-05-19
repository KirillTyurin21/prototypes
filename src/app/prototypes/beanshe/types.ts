export type OrderStatus =
  | 'created'
  | 'accepted'
  | 'cancelled_barista'
  | 'cancelled_customer'
  | 'expired'
  | 'completed'
  | 'discarded';

export type CancellationReason =
  | 'customer_cancelled'
  | 'barista_cancelled'
  | 'cannot_prepare'
  | 'expired'
  | 'other';

export interface OrderItem {
  product_name: string;
  size?: string;
  quantity: number;
  price: number;
  modifications?: string[];
}

export interface BeansheOrder {
  beanshe_order_id: number;
  status: OrderStatus;
  customer_name: string;
  items: OrderItem[];
  total_price: number;
  discount_amount: number;
  pickup_time: string;
  preparation_time_minutes: number;
  comment: string | null;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  cancellation_reason: CancellationReason | null;
}

export type OrderTab = 'active' | 'cancelled' | 'closed';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Новый',
  accepted: 'Принят',
  cancelled_barista: 'Отменён (бариста)',
  cancelled_customer: 'Отменён (покупатель)',
  expired: 'Истёк',
  completed: 'Выдан',
  discarded: 'Не забрали',
};

export const ORDER_STATUS_BADGE_VARIANT: Record<OrderStatus, string> = {
  created: 'warning',
  accepted: 'info',
  cancelled_barista: 'danger',
  cancelled_customer: 'danger',
  expired: 'default',
  completed: 'success',
  discarded: 'default',
};
