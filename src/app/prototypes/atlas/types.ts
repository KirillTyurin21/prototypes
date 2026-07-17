// === Платёжная интеграция ===

export type IntegrationStatus = 'connected' | 'disconnected';

export interface PaymentIntegration {
  id: string;
  name: string;
  logoLetter: string;
  logoColor: string;
  status: IntegrationStatus;
  connectedRestaurantIds: string[];
  operationCategories: OperationCategory[];
  paymentType: PaymentTypeInfo | null;
  discount: DiscountInfo | null;
  requiredFields: FieldConfig[];
  licenseRequired: boolean;
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
}

// === Тип оплаты (превью) ===

export interface PaymentTypeInfo {
  name: string;
  fiscal: boolean;
  buttonLabel: string;
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
  type: 'text' | 'password';
  required: boolean;
  placeholder?: string;
  helpText?: string;
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
}
