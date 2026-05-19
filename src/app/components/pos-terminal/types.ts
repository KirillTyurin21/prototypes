/**
 * POS Terminal — единый источник типов
 * Используется всеми компонентами терминала Front
 */

// ─── Экраны ─────────────────────────────────────────

/** Вариант экрана терминала */
export type PosScreenVariant =
  | 'main'
  | 'order'
  | 'payment'
  | 'auth'
  | 'closed-shift';

// ─── Данные ─────────────────────────────────────────

/** Стол */
export interface PosTable {
  id: number;
  name: string;
  hall: string;
  seats: number;
  occupied: boolean;
}

/** Категория меню */
export interface PosCategory {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

/** Блюдо */
export interface PosDish {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  available: boolean;
}

/** Позиция в заказе */
export interface PosOrderItem {
  id: number;
  dishId: number;
  name: string;
  price: number;
  quantity: number;
}

/** Заказ */
export interface PosOrder {
  id: number;
  tableId: number;
  tableName: string;
  waiterName: string;
  items: PosOrderItem[];
  guests: number;
  total: number;
  createdAt: string;
}

/** Информация о смене */
export interface PosShiftInfo {
  number: number;
  openedAt: string;
  manager: string;
  cashier: string;
  terminalName: string;
  isOpen: boolean;
}

/** Информация о текущем пользователе */
export interface PosUserInfo {
  name: string;
  role: string;
}

// ─── Главный экран ──────────────────────────────────

/** Секция главного экрана (группа кнопок с цветным заголовком) */
export interface PosSection {
  title: string;
  color: string;
  buttons: PosMainButton[];
  /** Дополнительная информация под заголовком (напр. номер смены) */
  info?: string[];
}

/** Кнопка главного экрана (белая ячейка) */
export interface PosMainButton {
  label: string;
  disabled?: boolean;
  /** Идентификатор действия для EventEmitter */
  action?: string;
}

/** Кнопка нижней панели терминала */
export interface PosBottomButton {
  label: string;
  icon: string;
  action: string;
  disabled?: boolean;
}

// ─── Компоненты ─────────────────────────────────────

/** Вариант стиля POS-кнопки */
export type PosButtonVariant = 'main' | 'dark' | 'header';

/** Размер POS-кнопки */
export type PosButtonSize = 'sm' | 'md' | 'lg';

/** Размер модального окна POS-диалога */
export type PosDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Тема POS-диалога */
export type PosDialogTheme = 'dark' | 'light';

/** Отступ POS-диалога */
export type PosDialogPadding = 'sm' | 'md' | 'lg';

// ─── Константы ──────────────────────────────────────

/** Цвета POS-терминала (из скриншотов реального Front) */
export const POS_COLORS = {
  /** Фон терминала (область контента) */
  terminalBg: '#3d3d3d',
  /** Верхняя панель */
  headerBg: '#1e1e1e',
  /** Нижняя панель */
  bottomBarBg: '#2d2d2d',
  /** Фон диалога плагина */
  dialogBg: '#3a3a3a',
  /** Фон кнопки (действия, тёмная) */
  actionButtonBg: '#1a1a1a',
  /** Ховер кнопки (действия) */
  actionButtonHover: '#252525',
  /** Акцентный цвет (нажатие кнопки, выделение) */
  accent: '#b8c959',
  /** Фон кнопки главного экрана */
  mainButtonBg: '#FFFFFF',
  /** Текст кнопки главного экрана */
  mainButtonText: '#333333',
  /** Оверлей диалога */
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Цвета секций главного экрана
  /** user / ГОСТИ */
  sectionTeal: '#00796B',
  /** СЕРВИС */
  sectionTealLight: '#009688',
  /** КАССА */
  sectionGreen: '#26A69A',
  /** ПЕРСОНАЛ */
  sectionPurple: '#9575CD',
  /** ДОКУМЕНТЫ */
  sectionBlue: '#42A5F5',
} as const;

/** Размеры POS-элементов в пикселях */
export const POS_SIZES = {
  /** Высота верхней панели (px) */
  headerHeight: 32,
  /** Высота нижней панели (px) */
  bottomBarHeight: 64,
  /** Высота кнопки действия (px) */
  actionButtonHeight: 56,

  /** Ширина диалога по варианту (px) */
  dialogWidth: {
    sm: 350,
    md: 450,
    lg: 550,
    xl: 700,
    full: 900,
  },
} as const;
