/**
 * Мок-данные модуля «Заказы» — залы, блюда, гости, способы оплаты.
 */
import {
  PosHall,
  PosGuest,
  PosPaymentMethod,
  PosMenuCategory,
  PosMenuItem,
} from '../types';

// ─── Залы и столы ──────────────────────────────────

export const MOCK_HALLS: PosHall[] = [
  {
    id: 1,
    name: 'Бар',
    tables: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: String(i + 1),
      hall: 'Бар',
      seats: 4,
      occupied: i === 0,
    })),
  },
  {
    id: 2,
    name: 'Зал',
    tables: Array.from({ length: 10 }, (_, i) => ({
      id: i + 11,
      name: String(i + 1),
      hall: 'Зал',
      seats: 6,
      occupied: false,
    })),
  },
];

// ─── Категории и позиции меню ──────────────────────

export const MOCK_MENU_CATEGORIES: PosMenuCategory[] = [
  { id: 1, name: 'Блюда', isGroup: true },
  { id: 2, name: 'Услуги', isGroup: true },
  { id: 3, name: 'Изъятие', isGroup: true },
];

export const MOCK_MENU_ITEMS: PosMenuItem[] = [
  { id: 101, name: 'Погашение кредита', categoryId: 1, price: 0, available: true },
  { id: 102, name: 'Чай Nesty', categoryId: 1, price: 79, available: true },
  { id: 103, name: 'Шоколадный батончик', categoryId: 1, price: 50, available: true },
  { id: 104, name: 'Кока Кола', categoryId: 1, price: 89, available: false },
  { id: 201, name: 'Чай Nesty', categoryId: 2, price: 79, available: true },
  { id: 301, name: 'Шоколадный батончик', categoryId: 3, price: 50, available: true },
];

// ─── Гости ─────────────────────────────────────────

export const MOCK_GUESTS: PosGuest[] = [
  { id: 1, name: 'Максим', phone: '+7 960 854-19-55' },
  { id: 2, name: 'Маринова Марина', phone: '+7 912 345-67-89' },
  { id: 3, name: 'Рррр Пппп', phone: '+7 000 000-00-00' },
];

// ─── Способы оплаты ────────────────────────────────

export const MOCK_PAYMENT_METHODS: PosPaymentMethod[] = [
  { id: 'cash', name: 'Наличные', type: 'cash' },
  { id: 'bank-card', name: 'Банковские карты', type: 'bank-card' },
  { id: 'cashless', name: 'Безнал. расчет', type: 'cashless' },
  { id: 'no-revenue', name: 'Без выручки', type: 'no-revenue' },
];

export const MOCK_BANK_CARD_SUBTYPES = [
  { id: 'bank-cards', name: 'Банковские карты' },
  { id: 'cashless-withdrawal', name: 'Безналичные с изъятием' },
  { id: 'plati-alfa', name: 'ПлатиAlfa' },
  { id: 'plati-qr', name: 'ПлатиQR' },
];
