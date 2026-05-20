/**
 * POS Terminal — barrel export
 *
 * Все публичные компоненты, сервисы и типы терминала Front.
 * Импортируйте из '@/components/pos-terminal'.
 *
 * @example
 * import {
 *   PosTerminalShellComponent,
 *   PosDialogComponent,
 *   PosButtonComponent,
 *   PosTerminalStateService,
 *   POS_COLORS,
 * } from '@/components/pos-terminal';
 */

// ─── Типы ───────────────────────────────────────────
export {
  PosScreenVariant,
  PosTable,
  PosCategory,
  PosDish,
  PosOrderItem,
  PosOrder,
  PosShiftInfo,
  PosUserInfo,
  PosSection,
  PosMainButton,
  PosBottomButton,
  PosButtonVariant,
  PosButtonSize,
  PosDialogSize,
  PosDialogTheme,
  PosDialogPadding,
  POS_COLORS,
  POS_SIZES,
  DeliveryOrderStatus,
  DeliveryOrderType,
  PaymentMethodType,
  DeliveryOrder,
  PosGuest,
  PosPaymentMethod,
  PosHall,
  PosMenuCategory,
  PosMenuItem,
  DELIVERY_STATUS_META,
} from './types';

// ─── Данные ─────────────────────────────────────────
export {
  MOCK_HALLS,
  MOCK_MENU_CATEGORIES,
  MOCK_MENU_ITEMS,
  MOCK_GUESTS,
  MOCK_PAYMENT_METHODS,
  MOCK_BANK_CARD_SUBTYPES,
} from './data/mock-delivery-orders';

// ─── Сервисы ────────────────────────────────────────
export { PosTerminalStateService } from './pos-terminal-state.service';

// ─── Компоненты ─────────────────────────────────────
export { PosTerminalShellComponent } from './pos-terminal-shell.component';
export { PosButtonComponent } from './widgets/pos-button.component';
export { PosDialogComponent } from './dialogs/pos-dialog.component';

// ─── Диалоги ────────────────────────────────────────
export { PosGuestListDialogComponent } from './dialogs/pos-guest-list-dialog.component';
export { PosPaymentMethodDialogComponent } from './dialogs/pos-payment-method-dialog.component';

// ─── Шаблоны диалогов (Этап 4) ──────────────────────
export { PosNumpadComponent } from './dialogs/pos-numpad.component';
export { PosKeyboardComponent } from './dialogs/pos-keyboard.component';
export { PosGuestCardComponent, PosGuestField } from './dialogs/pos-guest-card.component';
export { PosInfoBannerComponent, PosInfoField } from './dialogs/pos-info-banner.component';
export { PosStatusScreenComponent } from './dialogs/pos-status-screen.component';
export { PosConfirmComponent } from './dialogs/pos-confirm.component';
export { PosActionListComponent, PosActionItem } from './dialogs/pos-action-list.component';

// ─── Симуляция (Этап 3) ─────────────────────────────
export { SimulationToolbarComponent } from './simulation/simulation-toolbar.component';
export { SimulationScenario, SIMULATION_SCENARIOS } from './simulation/simulation-scenarios';

// ─── Экраны ─────────────────────────────────────────
export { PosMainScreenComponent } from './screens/pos-main-screen.component';
export { PosTablesScreenComponent } from './screens/pos-tables-screen.component';
export { PosDeliveryListScreenComponent } from './screens/pos-delivery-list-screen.component';
export { PosDeliveryOrderScreenComponent } from './screens/pos-delivery-order-screen.component';
export { PosPaymentScreenComponent } from './screens/pos-payment-screen.component';
