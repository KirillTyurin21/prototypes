/**
 * Мок-данные для прототипа Sparrow
 *
 * Источник: materials/Бинши/Beanshe-спецификация.md
 * - Раздел 6.1: Entity Mapping — структура заказа
 * - Раздел 4.6: Стоп-лист — механизмы
 * - Раздел 9.2: UI — пример данных карточек
 */

import {
  SparrowProduct,
  SparrowModification,
  SparrowOrder,
  SparrowStopListItem,
} from '../types';

// ─── Продукты кофейни ───────────────────────────────

export const MOCK_PRODUCTS: SparrowProduct[] = [
  { id: 1, name: 'Капучино',       price: 320, sizes: ['S', 'M', 'L'] },
  { id: 2, name: 'Латте',          price: 350, sizes: ['S', 'M', 'L'] },
  { id: 3, name: 'Раф',            price: 380, sizes: ['M', 'L'] },
  { id: 4, name: 'Американо',      price: 250, sizes: ['S', 'M'] },
  { id: 5, name: 'Флэт Уайт',     price: 360, sizes: ['S', 'M'] },
  { id: 6, name: 'Эспрессо',       price: 200, sizes: ['S'] },
  { id: 7, name: 'Матча Латте',    price: 390, sizes: ['M', 'L'] },
  { id: 8, name: 'Какао',          price: 300, sizes: ['S', 'M', 'L'] },
];

// ─── Модификаторы ───────────────────────────────────

export const MOCK_MODIFICATIONS: SparrowModification[] = [
  { name: 'Овсяное молоко' },
  { name: 'Кокосовое молоко' },
  { name: 'Доп. шот эспрессо' },
  { name: 'Карамельный сироп' },
  { name: 'Ванильный сироп' },
];

// ─── Имена покупателей ──────────────────────────────

export const MOCK_CUSTOMER_NAMES: string[] = [
  'Алексей М.', 'Мария К.', 'Дмитрий С.', 'Анна П.',
  'Иван Л.', 'Елена В.', 'Сергей Н.', 'Ольга Т.',
];

// ─── Начальные заказы ───────────────────────────────

/** 3 предзаполненных заказа для демонстрации */
export const MOCK_INITIAL_ORDERS: SparrowOrder[] = [
  {
    id: 1001,
    number: 'B-042',
    status: 'created',
    customerName: 'Алексей М.',
    items: [
      {
        productId: 1,
        productName: 'Капучино',
        size: 'L',
        modifications: ['Овсяное молоко'],
        quantity: 1,
        price: 370,
      },
      {
        productId: 4,
        productName: 'Американо',
        size: 'M',
        modifications: [],
        quantity: 1,
        price: 250,
      },
    ],
    totalPrice: 620,
    pickupTime: _pickupTime(20),
    comment: 'Без сахара, пожалуйста',
    createdAt: _createdTime(2),
    acceptedAt: null,
    completedAt: null,
  },
  {
    id: 1002,
    number: 'B-043',
    status: 'accepted',
    customerName: 'Мария К.',
    items: [
      {
        productId: 3,
        productName: 'Раф',
        size: 'L',
        modifications: ['Ванильный сироп'],
        quantity: 2,
        price: 430,
      },
    ],
    totalPrice: 860,
    pickupTime: _pickupTime(10),
    comment: '',
    createdAt: _createdTime(8),
    acceptedAt: _createdTime(6),
    completedAt: null,
  },
  {
    id: 1003,
    number: 'B-044',
    status: 'preparing',
    customerName: 'Дмитрий С.',
    items: [
      {
        productId: 7,
        productName: 'Матча Латте',
        size: 'M',
        modifications: ['Кокосовое молоко'],
        quantity: 1,
        price: 440,
      },
    ],
    totalPrice: 440,
    pickupTime: _pickupTime(5),
    comment: 'Двойная порция матчи',
    createdAt: _createdTime(15),
    acceptedAt: _createdTime(13),
    completedAt: null,
  },
];

// ─── Стоп-лист (начальное состояние) ────────────────

export const MOCK_STOP_LIST: SparrowStopListItem[] = MOCK_PRODUCTS.map(p => ({
  productId: p.id,
  productName: p.name,
  isStopped: p.id === 7, // Матча Латте — на стопе
  stopSource: p.id === 7 ? 'manual' as const : null,
  isStoppedInFront: false,
}));

// ─── Helpers ────────────────────────────────────────

/** Время через N минут от «сейчас» (ISO строка) */
function _pickupTime(minutesFromNow: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutesFromNow);
  return d.toISOString();
}

/** Время N минут назад (ISO строка) */
function _createdTime(minutesAgo: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
}
