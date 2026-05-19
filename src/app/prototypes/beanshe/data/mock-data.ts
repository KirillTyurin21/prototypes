import { BeansheOrder } from '../types';

/** Генерирует время в формате HH:mm для текущего дня с заданным смещением минут */
function timeFromNow(minutesOffset: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesOffset);
  return d.toISOString();
}

function todayAt(hours: number, minutes: number): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const MOCK_ORDERS: BeansheOrder[] = [
  // === Активные: created (ждут действия баристы) ===
  {
    beanshe_order_id: 1047,
    status: 'created',
    customer_name: 'Анна К.',
    items: [
      { product_name: 'Капучино', size: '300 мл', quantity: 2, price: 350, modifications: ['Овсяное молоко'] },
      { product_name: 'Круассан с шоколадом', quantity: 1, price: 220 },
    ],
    total_price: 870,
    discount_amount: 50,
    pickup_time: timeFromNow(12),
    preparation_time_minutes: 7,
    comment: 'Без сахара, пожалуйста',
    created_at: timeFromNow(-2),
    accepted_at: null,
    completed_at: null,
    cancellation_reason: null,
  },
  {
    beanshe_order_id: 1048,
    status: 'created',
    customer_name: 'Дмитрий П.',
    items: [
      { product_name: 'Латте', size: '400 мл', quantity: 1, price: 390, modifications: ['Кокосовое молоко', 'Сироп карамель'] },
    ],
    total_price: 390,
    discount_amount: 0,
    pickup_time: timeFromNow(15),
    preparation_time_minutes: 5,
    comment: null,
    created_at: timeFromNow(-1),
    accepted_at: null,
    completed_at: null,
    cancellation_reason: null,
  },

  // === Активные: accepted (приняты, ожидают приготовления через iiko) ===
  {
    beanshe_order_id: 1045,
    status: 'accepted',
    customer_name: 'Мария С.',
    items: [
      { product_name: 'Американо', size: '200 мл', quantity: 1, price: 250 },
      { product_name: 'Чизкейк', quantity: 1, price: 320 },
    ],
    total_price: 570,
    discount_amount: 0,
    pickup_time: timeFromNow(5),
    preparation_time_minutes: 5,
    comment: 'Двойной эспрессо',
    created_at: timeFromNow(-10),
    accepted_at: timeFromNow(-8),
    completed_at: null,
    cancellation_reason: null,
  },
  {
    beanshe_order_id: 1044,
    status: 'accepted',
    customer_name: 'Алексей В.',
    items: [
      { product_name: 'Раф', size: '300 мл', quantity: 1, price: 420, modifications: ['Лавандовый сироп'] },
      { product_name: 'Маффин черничный', quantity: 2, price: 180 },
    ],
    total_price: 730,
    discount_amount: 50,
    pickup_time: timeFromNow(8),
    preparation_time_minutes: 8,
    comment: null,
    created_at: timeFromNow(-15),
    accepted_at: timeFromNow(-12),
    completed_at: null,
    cancellation_reason: null,
  },

  // === Отменённые ===
  {
    beanshe_order_id: 1040,
    status: 'cancelled_customer',
    customer_name: 'Елена Г.',
    items: [
      { product_name: 'Флэт Уайт', size: '200 мл', quantity: 1, price: 380 },
    ],
    total_price: 380,
    discount_amount: 0,
    pickup_time: todayAt(10, 30),
    preparation_time_minutes: 5,
    comment: null,
    created_at: todayAt(10, 15),
    accepted_at: null,
    completed_at: null,
    cancellation_reason: 'customer_cancelled',
  },
  {
    beanshe_order_id: 1038,
    status: 'cancelled_barista',
    customer_name: 'Игорь Т.',
    items: [
      { product_name: 'Матча Латте', size: '300 мл', quantity: 1, price: 450 },
    ],
    total_price: 450,
    discount_amount: 0,
    pickup_time: todayAt(9, 45),
    preparation_time_minutes: 7,
    comment: null,
    created_at: todayAt(9, 30),
    accepted_at: null,
    completed_at: null,
    cancellation_reason: 'cannot_prepare',
  },
  {
    beanshe_order_id: 1035,
    status: 'expired',
    customer_name: 'Ольга Ф.',
    items: [
      { product_name: 'Эспрессо', size: '60 мл', quantity: 2, price: 190 },
    ],
    total_price: 380,
    discount_amount: 0,
    pickup_time: todayAt(9, 0),
    preparation_time_minutes: 3,
    comment: null,
    created_at: todayAt(8, 40),
    accepted_at: null,
    completed_at: null,
    cancellation_reason: 'expired',
  },

  // === Закрытые ===
  {
    beanshe_order_id: 1032,
    status: 'completed',
    customer_name: 'Павел Н.',
    items: [
      { product_name: 'Капучино', size: '200 мл', quantity: 1, price: 300 },
      { product_name: 'Сэндвич с курицей', quantity: 1, price: 350 },
    ],
    total_price: 600,
    discount_amount: 50,
    pickup_time: todayAt(8, 30),
    preparation_time_minutes: 6,
    comment: null,
    created_at: todayAt(8, 10),
    accepted_at: todayAt(8, 12),
    completed_at: todayAt(8, 28),
    cancellation_reason: null,
  },
  {
    beanshe_order_id: 1030,
    status: 'discarded',
    customer_name: 'Светлана М.',
    items: [
      { product_name: 'Какао', size: '300 мл', quantity: 1, price: 320 },
    ],
    total_price: 320,
    discount_amount: 0,
    pickup_time: todayAt(8, 0),
    preparation_time_minutes: 5,
    comment: 'С маршмеллоу',
    created_at: todayAt(7, 45),
    accepted_at: todayAt(7, 47),
    completed_at: todayAt(8, 20),
    cancellation_reason: null,
  },
];
