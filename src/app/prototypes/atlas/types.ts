// === Платёжная интеграция ===

export type IntegrationStatus = 'connected' | 'disconnected';

export interface PaymentIntegration {
  id: string;
  name: string;
  logoLetter: string;
  logoColor: string;
  /** Инлайн-SVG иконка сервиса (если задана — показывается вместо буквы) */
  logoIcon?: string;
  status: IntegrationStatus;
  connectedRestaurantIds: string[];
  operationCategories: OperationCategory[];
  paymentType: PaymentTypeInfo | null;
  discount: DiscountInfo | null;
  requiredFields: FieldConfig[];
  licenseRequired: boolean;
  /** Вводное слово в alert на шаге подтверждения (по умолчанию «Банк») */
  accessIntro?: string;
  /** Полный текст consent-чекбокса (если не задан — универсальный шаблон) */
  consentText?: string;
  /** Подпись кнопки подтверждения (по умолчанию «Подтвердить и подключить») */
  submitLabel?: string;
  /** Текст toast после успешного подключения */
  activatedToast?: string;
  /** Дополнительные сущности в блоке «Будет создано автоматически» */
  autoEntities?: AutoEntity[];
  /** Примечание при подключённом состоянии (view-режим) */
  connectedNote?: string;
}

/** Дополнительная сущность, создаваемая при подключении */
export interface AutoEntity {
  iconName: string;
  title: string;
  subtitle: string;
}

// === Категория операций ===

export interface OperationCategory {
  id: string;
  label: string;
  description: string;
  iconName: string;
  allowed: boolean;
}

// === Ресторан (дерево) ===

export interface RestaurantNode {
  id: string;
  name: string;
  address: string;
  children?: RestaurantNode[];
  isConnected: boolean;
  /** Индивидуальные настройки операций (если отличаются от глобальных) */
  customOperationCategories?: OperationCategory[];
  /** Индивидуальные реквизиты (если отличаются от глобальных) */
  customCredentials?: Record<string, string>;
  /** Использовать индивидуальные настройки вместо глобальных */
  useCustomSettings?: boolean;
}

// === Тип оплаты (превью) ===

export interface PaymentTypeInfo {
  name: string;
  fiscal: boolean;
  buttonLabel: string;
  /** Дополнительная строка-примечание (напр. «Заменит CoinBox») */
  note?: string;
}

// === Скидка (превью) ===

export interface DiscountInfo {
  name: string;
  percent: number;
  linkedToPaymentType: string;
}

// === Реквизиты ===

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  /** Для type === 'select' */
  options?: FieldOption[];
}

/** Вариант значения select-поля */
export interface FieldOption {
  value: string;
  label: string;
}

// === Контекст пользователя ===

export type AccountType = 'chain' | 'rms';

// === Плоский элемент дерева ===

export interface FlatTreeItem {
  id: string;
  name: string;
  address: string;
  isGroup: boolean;
  depth: number;
  checked: boolean;
  childrenIds?: string[];
  useCustomSettings?: boolean;
  allowedCategoryCount?: number;
  totalCategoryCount?: number;
}
