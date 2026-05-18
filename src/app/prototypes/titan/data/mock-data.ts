import { AccessRequest, AccessScope } from '../types';

export const AVAILABLE_SCOPES: AccessScope[] = [
  { id: 'payments', label: 'Платежи', description: 'Создание и возврат платежей' },
  { id: 'menu', label: 'Меню', description: 'Чтение меню ресторана' },
  { id: 'orders', label: 'Заказы', description: 'Создание и управление заказами' },
  { id: 'loyalty', label: 'Лояльность', description: 'Начисление/списание бонусов' },
];

export const MOCK_REQUESTS: AccessRequest[] = [
  {
    id: 'req-001',
    partnerName: 'Партнёр Alpha',
    partnerDescription: 'Платёжная система — QR-оплата и Apple Pay',
    status: 'pending',
    scopes: [AVAILABLE_SCOPES[0], AVAILABLE_SCOPES[1]],
    createdAt: '2026-05-15T10:30:00Z',
    updatedAt: '2026-05-15T10:30:00Z',
    auditLog: [
      { action: 'created', actor: 'system', timestamp: '2026-05-15T10:30:00Z' },
    ],
  },
  {
    id: 'req-002',
    partnerName: 'Партнёр Beta',
    partnerDescription: 'Агрегатор доставки — интеграция заказов',
    status: 'active',
    scopes: [AVAILABLE_SCOPES[2]],
    createdAt: '2026-04-20T08:00:00Z',
    updatedAt: '2026-04-22T14:15:00Z',
    expiresAt: '2026-10-22T14:15:00Z',
    apiKeyPreview: 'sk_live_****7f3a',
    auditLog: [
      { action: 'created', actor: 'system', timestamp: '2026-04-20T08:00:00Z' },
      { action: 'approved', actor: 'Иванов А.С.', timestamp: '2026-04-22T14:15:00Z' },
    ],
  },
  {
    id: 'req-003',
    partnerName: 'Партнёр Gamma',
    partnerDescription: 'CRM-система — синхронизация гостевой базы',
    status: 'rejected',
    scopes: [AVAILABLE_SCOPES[3], AVAILABLE_SCOPES[0]],
    createdAt: '2026-05-10T12:00:00Z',
    updatedAt: '2026-05-11T09:00:00Z',
    rejectionReason: 'Недостаточно обоснований для доступа к платежам',
    auditLog: [
      { action: 'created', actor: 'system', timestamp: '2026-05-10T12:00:00Z' },
      { action: 'rejected', actor: 'Петров В.К.', timestamp: '2026-05-11T09:00:00Z', reason: 'Недостаточно обоснований для доступа к платежам' },
    ],
  },
  {
    id: 'req-004',
    partnerName: 'Партнёр Delta',
    partnerDescription: 'Система лояльности — начисление бонусов',
    status: 'revoked',
    scopes: [AVAILABLE_SCOPES[3]],
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-05-05T16:30:00Z',
    apiKeyPreview: 'sk_live_****2b1c',
    auditLog: [
      { action: 'created', actor: 'system', timestamp: '2026-03-01T09:00:00Z' },
      { action: 'approved', actor: 'Сидоров Д.И.', timestamp: '2026-03-02T10:00:00Z' },
      { action: 'revoked', actor: 'Иванов А.С.', timestamp: '2026-05-05T16:30:00Z', reason: 'Нарушение rate-limit' },
    ],
  },
];
