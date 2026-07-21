import { PaymentIntegration, RestaurantNode } from '../types';

export const MOCK_INTEGRATIONS: PaymentIntegration[] = [
  {
    id: 'kaspi',
    name: 'Kaspi Bank',
    logoLetter: 'K',
    logoColor: 'bg-red-500',
    status: 'disconnected',
    connectedRestaurantIds: [],
    operationCategories: [
      { id: 'payments', label: 'Платёжные операции', description: 'Создание и возврат платежей через Kaspi QR', iconName: 'credit-card', allowed: false },
      { id: 'orders', label: 'Создание заказов доставки и самовывоза', description: 'Работа с меню, стоп-листами, создание заказов доставки и самовывоза', iconName: 'shopping-cart', allowed: false },
    ],
    paymentType: { name: 'Kaspi QR', fiscal: true, buttonLabel: 'Kaspi QR' },
    discount: null,
    requiredFields: [],
    licenseRequired: true,
  },
  {
    id: 'simplepay',
    name: 'Simple Pay',
    logoLetter: 'S',
    logoColor: 'bg-blue-600',
    status: 'disconnected',
    connectedRestaurantIds: [],
    operationCategories: [
      { id: 'payments', label: 'Платёжные операции', description: 'Приём платежей через Simple Pay', iconName: 'credit-card', allowed: false },
    ],
    paymentType: { name: 'Simple Pay', fiscal: false, buttonLabel: 'Simple Pay' },
    discount: null,
    requiredFields: [
      { key: 'xpkKey', label: 'XPK-ключ', type: 'password', required: true, placeholder: 'Введите XPK-ключ...', helpText: 'Выдаётся партнёром при подключении' },
    ],
    licenseRequired: true,
  },
];

export const MOCK_CHAIN_RESTAURANTS: RestaurantNode[] = [
  {
    id: 'group-center',
    name: 'Центр',
    address: 'Группа ресторанов',
    children: [
      { id: 'r-001', name: 'Тверская 12', address: 'ул. Тверская, 12', isConnected: false },
      { id: 'r-002', name: 'Арбат 25', address: 'ул. Арбат, 25', isConnected: false },
      { id: 'r-003', name: 'Красная Пресня 3', address: 'ул. Красная Пресня, 3', isConnected: false },
    ],
    isConnected: false,
  },
  {
    id: 'group-north',
    name: 'Север',
    address: 'Группа ресторанов',
    children: [
      { id: 'r-004', name: 'Дмитровское ш. 89', address: 'Дмитровское ш., 89', isConnected: false },
      { id: 'r-005', name: 'Ленинградка 45', address: 'Ленинградский пр-т, 45', isConnected: false },
      { id: 'r-006', name: 'Алтуфьево 12', address: 'Алтуфьевское ш., 12', isConnected: false },
    ],
    isConnected: false,
  },
  {
    id: 'group-south',
    name: 'Юг',
    address: 'Группа ресторанов',
    children: [
      { id: 'r-007', name: 'Варшавка 56', address: 'Варшавское ш., 56', isConnected: false },
      { id: 'r-008', name: 'Каширка 34', address: 'Каширское ш., 34', isConnected: false },
    ],
    isConnected: false,
  },
  {
    id: 'group-east',
    name: 'Восток',
    address: 'Группа ресторанов',
    children: [
      { id: 'r-009', name: 'Щёлковская 7', address: 'Щёлковское ш., 7', isConnected: false },
      { id: 'r-010', name: 'Энтузиастов 22', address: 'ш. Энтузиастов, 22', isConnected: false },
    ],
    isConnected: false,
  },
  { id: 'r-011', name: 'Пятницкая 15', address: 'ул. Пятницкая, 15', isConnected: false },
  { id: 'r-012', name: 'Покровка 8', address: 'ул. Покровка, 8', isConnected: false },
  { id: 'r-013', name: 'Профсоюзная 67', address: 'ул. Профсоюзная, 67', isConnected: false },
  { id: 'r-014', name: 'Кутузовский 33', address: 'Кутузовский пр-т, 33', isConnected: false },
  { id: 'r-015', name: 'Новый Арбат 21', address: 'ул. Новый Арбат, 21', isConnected: false },
];

export const MOCK_RMS_RESTAURANT: RestaurantNode[] = [
  { id: 'r-001', name: 'Тверская 12', address: 'ул. Тверская, 12', isConnected: false },
];
