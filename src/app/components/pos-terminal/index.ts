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
} from './types';

// ─── Сервисы ────────────────────────────────────────
export { PosTerminalStateService } from './pos-terminal-state.service';

// ─── Компоненты ─────────────────────────────────────
export { PosTerminalShellComponent } from './pos-terminal-shell.component';
export { PosButtonComponent } from './widgets/pos-button.component';
export { PosDialogComponent } from './dialogs/pos-dialog.component';

// ─── Экраны ─────────────────────────────────────────
export { PosMainScreenComponent } from './screens/pos-main-screen.component';
