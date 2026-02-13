/** Типы для прототипа «PUDU — Управление роботами (Front)» v1.1 */

/** Контекст вызова плагина: из заказа или с главного экрана */
export type PuduContextType = 'order' | 'main';

export interface PuduRobot {
  robot_id: string;
  robot_name: string;
  status: 'idle' | 'busy' | 'offline';
  after_action: 'idle' | 'marketing';  // per-robot настройка (из Admin Panel)
}

export interface OrderTable {
  table_id: string;
  table_name: string;
  is_mapped: boolean;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CurrentOrder {
  order_id: string;
  table: OrderTable;
  waiter_name: string;
  items: OrderItem[];
  total: number;
  payment_type: string | null;
}

export interface RobotTask {
  task_id: string;
  task_type: 'send_menu' | 'cleanup' | 'qr_payment' | 'send_dish' | 'marketing';
  // Маппинг к NE API (GET /v1/scenarios/scenario-status):
  // NE IN_PROCESS → 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
  // NE FAILED     → 'error'
  // NE SUCCESS    → 'completed'
  // NE FINISHED   → 'finished' (маркетинг, остановлен пользователем)
  // NE CANCELED   → 'cancelled'
  status: 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
        | 'completed' | 'error' | 'cancelled' | 'finished'
        | 'cashier_timeout' | 'payment_timeout';
  table_id: string;
  robot_name: string;
  created_at: Date;
}

export interface PuduNotification {
  id: string;
  type: 'error';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  is_estop: boolean;              // true = повторяющееся уведомление E-STOP
  repeat_interval_sec?: number;   // интервал повторения (5 сек для E-STOP)
}

export interface ScenarioSettings {
  send_menu: {
    phrase: string;
    phrase_url: string;
    phrase_pickup: string;        // фраза при заборе меню (З-15)
    phrase_pickup_url: string;
    wait_time: number;
    wait_time_pickup: number;
  };
  cleanup: {
    mode: 'manual' | 'auto' | 'mixed';
    phrase_arrival: string;
    phrase_arrival_url: string;
    wait_time: number;
    phrase_later: string;
    phrase_later_url: string;
  };
  qr_payment: {
    cashier_phrase: string;
    cashier_phrase_url: string;
    cashier_timeout: number;
    guest_wait_time: number;
    phrase_success: string;
    phrase_success_url: string;
    phrase_failure: string;
    phrase_failure_url: string;
  };
  marketing: {
    robot_id: string;
    auto_cruise_on_idle: boolean;
  };
}

export type PuduModalType =
  // Сценарий: Отправить меню
  | 'send_menu_confirm'
  // Сценарий: Уборка посуды
  | 'cleanup_confirm'             // Из заказа — один стол
  | 'cleanup_multi_select'        // С главного экрана — мультивыбор
  // Сценарий: Оплата по QR
  | 'qr_cashier_phase'
  | 'qr_guest_phase'
  | 'qr_success'
  | 'qr_timeout'
  // Сценарий: Доставка блюд [BLOCKED]
  | 'send_dish_blocked'
  // Общие
  | 'loading'
  | 'error'
  | 'success'
  | 'unmapped_table'
  | null;

/** Для регистрации в plugin-main-screen (каталог плагинов) */
export interface PuduDialogEntry {
  id: string;
  modalType: PuduModalType;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

// === КАТАЛОГ ЯЧЕЕК (v1.2) ===

export type CellCategory =
  | 'context-order'     // Контекст: из заказа
  | 'context-main'      // Контекст: главный экран
  | 'scenario'          // Сценарий (цепочка переходов)
  | 'modal'             // Одиночное модальное окно
  | 'notification';     // Уведомление / спецсостояние

export interface CatalogCell {
  id: string;                         // Уникальный ID ячейки (slug)
  label: string;                      // Название на русском (H3 карточки)
  description: string;                // Описание 1-2 строки
  icon: string;                       // Имя иконки Lucide
  iconColor: string;                  // HEX цвет иконки и её фонового круга
  category: CellCategory;            // Категория для группировки
  modalType?: PuduModalType;         // Какую модалку открыть (одиночные)
  scenario?: string;                  // Какой сценарий запустить (цепочки)
  context?: 'order' | 'main';        // Контекст POS-экрана
  badge?: string;                     // Текст бейджа (напр. "BLOCKED")
  badgeColor?: string;                // HEX цвет бейджа
}

export interface CatalogSection {
  title: string;                      // Заголовок секции (H2)
  icon: string;                       // Иконка Lucide рядом с заголовком
  description: string;                // Подзаголовок — пояснение
  category: CellCategory;            // Категория для фильтрации
  cells: CatalogCell[];              // Ячейки секции
}

/** Шаг сценария (для автоматических цепочек) */
export interface ScenarioStep {
  modal: PuduModalType;              // Модалка для открытия
  delay: number;                      // Задержка перед открытием (мс)
}
