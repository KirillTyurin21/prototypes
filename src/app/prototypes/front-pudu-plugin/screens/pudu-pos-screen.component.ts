import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { PuduModalType, PuduContextType, ScenarioStep } from '../types';
import {
  MOCK_CURRENT_ORDER,
  MOCK_TABLES,
  MOCK_SCENARIO_SETTINGS,
  MOCK_NOTIFICATIONS,
  MOCK_NE_ERROR_NOTIFICATIONS,
  MOCK_ORDER_DISHES,
  MockDish,
  getAssignedRobot,
  splitDishesIntoTrips,
} from '../data/mock-data';
import { CurrentOrder, PuduNotification, OrderTable } from '../types';

// Dialogs
import { SendMenuConfirmComponent } from '../components/dialogs/send-menu-confirm.component';
import { CleanupConfirmComponent } from '../components/dialogs/cleanup-confirm.component';
import { CleanupMultiSelectComponent } from '../components/dialogs/cleanup-multi-select.component';
import { QrCashierPhaseComponent } from '../components/dialogs/qr-cashier-phase.component';
import { QrGuestPhaseComponent } from '../components/dialogs/qr-guest-phase.component';
import { QrSuccessComponent } from '../components/dialogs/qr-success.component';
import { QrTimeoutComponent } from '../components/dialogs/qr-timeout.component';
import { UnmappedTableComponent } from '../components/dialogs/unmapped-table.component';
import { SendDishBlockedComponent } from '../components/dialogs/send-dish-blocked.component';
import { PuduLoadingDialogComponent } from '../components/dialogs/loading-dialog.component';
import { PuduSuccessDialogComponent } from '../components/dialogs/success-dialog.component';
import { PuduErrorDialogComponent } from '../components/dialogs/error-dialog.component';
import { SendDishConfirmComponent } from '../components/dialogs/send-dish-confirm.component';
import { SendDishPickupNotifyComponent } from '../components/dialogs/send-dish-pickup-notify.component';
import { SendDishRepeatComponent } from '../components/dialogs/send-dish-repeat.component';

@Component({
  selector: 'app-pudu-pos-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    SendMenuConfirmComponent,
    CleanupConfirmComponent,
    CleanupMultiSelectComponent,
    QrCashierPhaseComponent,
    QrGuestPhaseComponent,
    QrSuccessComponent,
    QrTimeoutComponent,
    UnmappedTableComponent,
    SendDishBlockedComponent,
    PuduLoadingDialogComponent,
    PuduSuccessDialogComponent,
    PuduErrorDialogComponent,
    SendDishConfirmComponent,
    SendDishPickupNotifyComponent,
    SendDishRepeatComponent,
  ],
  template: `
    <div class="min-h-screen bg-[#2d2d2d] flex flex-col relative" style="font-family: Roboto, sans-serif;">

      <!-- Переключатель контекста (демо-навигация) — D2 -->
      <div class="flex items-center gap-2 p-3 bg-[#1a1a1a] border-b border-gray-600">
        <!-- Кнопка «Назад в каталог» -->
        <button (click)="backToCatalog()"
                class="flex items-center gap-1.5 text-gray-400 hover:text-white
                       text-sm mr-4 transition-colors"
                aria-label="Вернуться в каталог состояний">
          <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
          <span>Каталог</span>
        </button>

        <div class="flex-1 flex justify-center gap-2">
          <button (click)="currentContext = 'order'"
            [ngClass]="currentContext === 'order' ? 'bg-[#b8c959] text-black' : 'bg-[#2d2d2d] text-gray-300'"
            class="px-4 py-2 rounded text-sm font-medium transition-colors">
            Из заказа ({{ currentOrder.table.table_name }})
          </button>
          <button (click)="currentContext = 'main'"
            [ngClass]="currentContext === 'main' ? 'bg-[#b8c959] text-black' : 'bg-[#2d2d2d] text-gray-300'"
            class="px-4 py-2 rounded text-sm font-medium transition-colors">
            Главный экран
          </button>
        </div>
      </div>

      <!-- ===== КОНТЕКСТ: Из заказа ===== -->
      <ng-container *ngIf="currentContext === 'order'">
        <!-- Header заказа -->
        <div class="bg-[#1a1a1a] h-14 flex items-center px-4 shrink-0">
          <span class="text-lg font-semibold text-white">{{ currentOrder.table.table_name }}</span>
          <span class="text-sm text-gray-400 mx-auto">Заказ #{{ currentOrder.order_id }}</span>
          <div class="flex items-center gap-2">
            <lucide-icon name="user" [size]="16" class="text-gray-300"></lucide-icon>
            <span class="text-sm text-gray-300">{{ currentOrder.waiter_name }}</span>
          </div>
        </div>

        <!-- Список блюд -->
        <div class="flex-1 overflow-auto p-4 space-y-2 pb-0">
          <div *ngFor="let item of currentOrder.items"
               class="flex justify-between items-center py-2 border-b border-gray-600/30">
            <span class="text-sm text-white">
              <span class="text-sm text-gray-400">{{ item.quantity }}×</span>
              {{ item.name }}
            </span>
            <span class="text-sm text-white font-medium">{{ item.price * item.quantity | number }} ₽</span>
          </div>
        </div>

        <!-- Блок Итого -->
        <div class="bg-[#2d2d2d] rounded p-4 mx-4 mt-2">
          <div class="flex justify-between text-xl font-bold">
            <span class="text-white">Итого:</span>
            <span class="text-[#b8c959]">{{ currentOrder.total | number }} ₽</span>
          </div>
        </div>

        <!-- Индикатор маркетинга -->
        <div *ngIf="isCruiseActive" class="mx-4 mt-3">
          <div class="flex items-center gap-2 bg-[#b8c959]/20 border border-[#b8c959] rounded px-4 py-2">
            <lucide-icon name="radio" [size]="18" class="text-[#b8c959] animate-pulse"></lucide-icon>
            <span class="text-sm text-[#b8c959] font-medium">Маркетинг-круиз активен</span>
            <button (click)="stopCruise()" class="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
              Остановить
            </button>
          </div>
        </div>

        <!-- Панель кнопок PUDU — контекст «Из заказа»: 4 кнопки -->
        <div class="grid grid-cols-4 gap-3 p-4 border-t border-gray-600 mt-3">
          <button (click)="onSendMenu()" aria-label="Отправить меню"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="utensils" [size]="20"></lucide-icon>
            <span class="text-xs">Отправить меню</span>
          </button>
          <button (click)="onCleanup()" aria-label="Уборка посуды"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="trash-2" [size]="20"></lucide-icon>
            <span class="text-xs">Уборка посуды</span>
          </button>
          <button (click)="onSendDish()" aria-label="Доставка блюд"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="utensils" [size]="20"></lucide-icon>
            <span class="text-xs">Доставка блюд</span>
          </button>
          <button (click)="onSendDishRepeat()" aria-label="Повторить"
            class="h-14 rounded flex flex-col items-center justify-center gap-1 transition-colors"
            [ngClass]="sendDishCompleted ? 'bg-[#1a1a1a] text-white hover:bg-[#252525]' : 'bg-[#1a1a1a] text-gray-500 cursor-not-allowed'"
            [disabled]="!sendDishCompleted">
            <lucide-icon name="repeat" [size]="20"></lucide-icon>
            <span class="text-xs">Повторить</span>
          </button>
        </div>
      </ng-container>

      <!-- ===== КОНТЕКСТ: Главный экран ===== -->
      <ng-container *ngIf="currentContext === 'main'">
        <!-- Заглушка главного экрана -->
        <div class="flex-1 flex flex-col items-center justify-center bg-[#2d2d2d]">
          <p class="text-gray-400 text-lg mb-2">Главный экран iikoFront</p>
          <p class="text-gray-500 text-sm">(заглушка для демонстрации контекста)</p>
        </div>

        <!-- Индикатор маркетинга -->
        <div *ngIf="isCruiseActive" class="mx-4 mb-3">
          <div class="flex items-center gap-2 bg-[#b8c959]/20 border border-[#b8c959] rounded px-4 py-2">
            <lucide-icon name="radio" [size]="18" class="text-[#b8c959] animate-pulse"></lucide-icon>
            <span class="text-sm text-[#b8c959] font-medium">Маркетинг-круиз активен</span>
            <button (click)="stopCruise()" class="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
              Остановить
            </button>
          </div>
        </div>

        <!-- Панель кнопок PUDU — контекст «Главный экран»: 2 кнопки -->
        <div class="grid grid-cols-2 gap-3 p-4 border-t border-gray-600">
          <button (click)="onToggleMarketing()" aria-label="Маркетинг"
            class="h-14 rounded flex flex-col items-center justify-center gap-1 transition-colors"
            [ngClass]="isCruiseActive ? 'bg-[#b8c959] text-black hover:bg-[#c5d466]' : 'bg-[#1a1a1a] text-white hover:bg-[#252525]'">
            <lucide-icon name="radio" [size]="20"></lucide-icon>
            <span class="text-xs">Маркетинг</span>
          </button>
          <button (click)="onCleanupMulti()" aria-label="Уборка (выбор столов)"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
            <lucide-icon name="trash-2" [size]="20"></lucide-icon>
            <span class="text-xs">Уборка (выбор столов)</span>
          </button>
        </div>
      </ng-container>

      <!-- Демо-панель (v1.1) -->
      <div class="bg-[#1a1a1a] border-t border-gray-600 px-4 py-2 shrink-0">
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-xs text-gray-500 font-medium">Демо:</span>
          <button (click)="activeModal = 'qr_cashier_phase'" class="text-xs text-gray-400 hover:text-white transition-colors">
            QR-оплата (СБП)
          </button>
          <button (click)="showDemoError()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Ошибка
          </button>
          <button (click)="toggleMapped()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Стол: {{ currentOrder.table.is_mapped ? 'Замаплен' : 'Нет' }}
          </button>
          <button (click)="cycleTable()" class="text-xs text-gray-400 hover:text-white transition-colors">
            Стол ({{ currentOrder.table.table_name }})
          </button>
          <button (click)="toggleEstop()" class="text-xs transition-colors"
            [ngClass]="isEstopActive ? 'text-red-300 font-bold' : 'text-red-400 hover:text-red-300'">
            E-STOP {{ isEstopActive ? 'ON' : 'OFF' }}
          </button>
          <button (click)="showNeError()" class="text-xs text-orange-400 hover:text-orange-300 transition-colors">
            Ошибки NE
          </button>
        </div>
      </div>

      <!-- Toast-уведомления (обычные ошибки) -->
      <div class="fixed bottom-16 right-6 z-[60] space-y-2">
        <div *ngFor="let notif of activeNotifications; trackBy: trackNotif"
             class="animate-slide-up bg-red-500/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
          <lucide-icon name="alert-circle" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
          <div class="flex-1">
            <p class="text-sm font-medium">{{ notif.title }}</p>
            <p class="text-xs text-red-100 mt-1">{{ notif.message }}</p>
          </div>
          <button (click)="dismissNotification(notif.id)" class="text-red-200 hover:text-white transition-colors">
            <lucide-icon name="x" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- E-STOP уведомление (D4, З-40) — повторяющееся -->
      <div *ngIf="isEstopActive && !estopDismissed" class="fixed bottom-6 right-6 z-[70] animate-slide-up">
        <div class="bg-red-600 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3 border-2 border-red-400">
          <lucide-icon name="octagon" [size]="24" class="shrink-0 text-white mt-0.5"></lucide-icon>
          <div class="flex-1">
            <p class="text-sm font-bold">E-STOP: Робот {{ assignedRobotName }} остановлен</p>
            <p class="text-xs text-red-100 mt-1">Красная кнопка нажата. Робот прекратил выполнение всех задач. Обратитесь к инженеру.</p>
            <p class="text-xs text-red-200 mt-2 italic">Уведомление будет повторяться до устранения проблемы</p>
          </div>
          <button (click)="dismissEstop()" class="text-red-200 hover:text-white transition-colors">
            <lucide-icon name="x" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- ===== МОДАЛЬНЫЕ ОКНА ===== -->

      <!-- М1: Отправить меню -->
      <pudu-send-menu-confirm
        [open]="activeModal === 'send_menu_confirm'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="assignedRobotName"
        [phrase]="settings.send_menu.phrase"
        [phrasePickup]="pickupPhrase"
        (onCancel)="closeDialog()"
        (onConfirm)="onConfirmAction('send_menu')"
      ></pudu-send-menu-confirm>

      <!-- М2: Уборка посуды (из заказа, 1 стол) -->
      <pudu-cleanup-confirm
        [open]="activeModal === 'cleanup_confirm'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="assignedRobotName"
        [phrase]="settings.cleanup.phrase"
        [waitTime]="settings.cleanup.wait_time"
        (onCancel)="closeDialog()"
        (onConfirm)="onConfirmAction('cleanup')"
      ></pudu-cleanup-confirm>

      <!-- М12: Мультивыбор столов для уборки (с главного экрана) -->
      <pudu-cleanup-multi-select
        [open]="activeModal === 'cleanup_multi_select'"
        [tables]="allTables"
        (onCancel)="closeDialog()"
        (onConfirm)="onMultiCleanupConfirm($event)"
      ></pudu-cleanup-multi-select>

      <!-- М3: QR Кассир -->
      <pudu-qr-cashier-phase
        [open]="activeModal === 'qr_cashier_phase'"
        [tableName]="currentOrder.table.table_name"
        [robotName]="assignedRobotName"
        [total]="currentOrder.total"
        [cashierTimeout]="settings.qr_payment.cashier_timeout"
        (onCancel)="closeDialog()"
        (onSendToGuest)="onSendToGuest()"
        (onTimeout)="activeModal = 'qr_timeout'"
      ></pudu-qr-cashier-phase>

      <!-- М4: QR Гость -->
      <pudu-qr-guest-phase
        [open]="activeModal === 'qr_guest_phase'"
        [tableName]="currentOrder.table.table_name"
        [total]="currentOrder.total"
        [guestWaitTime]="settings.qr_payment.payment_timeout"
        (onCancel)="closeDialog()"
        (onPaymentConfirmed)="activeModal = 'qr_success'"
        (onTimeout)="activeModal = 'qr_timeout'"
      ></pudu-qr-guest-phase>

      <!-- М5: QR Успех -->
      <pudu-qr-success
        [open]="activeModal === 'qr_success'"
        [tableName]="currentOrder.table.table_name"
        [total]="currentOrder.total"
        [phraseSuccess]="settings.qr_payment.phrase_success"
        (onClose)="closeDialog()"
      ></pudu-qr-success>

      <!-- М6: QR Тайм-аут -->
      <pudu-qr-timeout
        [open]="activeModal === 'qr_timeout'"
        (onClose)="onQrTimeoutClose()"
      ></pudu-qr-timeout>

      <!-- М7: Стол не замаплен -->
      <pudu-unmapped-table
        [open]="activeModal === 'unmapped_table'"
        [tableName]="currentOrder.table.table_name"
        (onClose)="closeDialog()"
      ></pudu-unmapped-table>

      <!-- М8: Доставка блюд [BLOCKED] (legacy) -->
      <pudu-send-dish-blocked
        [open]="activeModal === 'send_dish_blocked'"
        (onClose)="closeDialog()"
      ></pudu-send-dish-blocked>

      <!-- М14: Подтверждение доставки блюд (фудкорт) -->
      <pudu-send-dish-confirm
        [open]="activeModal === 'send_dish_confirm'"
        [tableName]="currentOrder.table.table_name"
        [dishes]="orderDishes"
        [maxDishesPerTrip]="settings.send_dish.max_dishes_per_trip"
        (onCancel)="closeDialog()"
        (onConfirm)="executeSendDish()"
      ></pudu-send-dish-confirm>

      <!-- М15: Уведомление раздачи -->
      <pudu-send-dish-pickup-notify
        [open]="activeModal === 'send_dish_pickup_notification'"
        [robotName]="assignedRobotName"
        [tableName]="currentOrder.table.table_name"
        [dishes]="currentTripDishes"
        [tripNumber]="currentTripNumber"
        [totalTrips]="totalTrips"
        [pickupWaitTime]="settings.send_dish.pickup_wait_time"
        (onDismiss)="closeDialog()"
        (onTimeout)="onPickupTimeout()"
      ></pudu-send-dish-pickup-notify>

      <!-- М16: Повторить доставку -->
      <pudu-send-dish-repeat
        [open]="activeModal === 'send_dish_repeat'"
        [tableName]="currentOrder.table.table_name"
        [phraseRepeat]="settings.send_dish.phrase_repeat"
        (onCancel)="closeDialog()"
        (onConfirm)="executeRepeatSendDish()"
      ></pudu-send-dish-repeat>

      <!-- М9: Loading -->
      <pudu-loading-dialog
        [open]="activeModal === 'loading'"
        [message]="loadingMessage"
      ></pudu-loading-dialog>

      <!-- М10: Успех -->
      <pudu-success-dialog
        [open]="activeModal === 'success'"
        [robotName]="assignedRobotName"
        (onClose)="closeDialog()"
      ></pudu-success-dialog>

      <!-- М11: Ошибка -->
      <pudu-error-dialog
        [open]="activeModal === 'error'"
        (onClose)="closeDialog()"
        (onRetry)="onRetry()"
      ></pudu-error-dialog>
    </div>
  `,
})
export class PuduPosScreenComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- State из v1.0 + v1.1 (перенос) ---
  activeModal: PuduModalType = null;
  currentContext: PuduContextType = 'order';
  currentOrder: CurrentOrder = JSON.parse(JSON.stringify(MOCK_CURRENT_ORDER));
  settings = MOCK_SCENARIO_SETTINGS;
  allTables: OrderTable[] = [...MOCK_TABLES];
  isCruiseActive = false;
  loadingMessage = 'Отправка команды роботу';

  // E-STOP (D4, З-40)
  isEstopActive = false;
  estopDismissed = false;
  private estopRepeatId: any = null;

  // NE errors (D5, З-39)
  private neErrorIndex = 0;

  notifications: PuduNotification[] = [];
  private tableIndex = 2; // tbl-003 initially
  private pendingAction: 'send_menu' | 'cleanup' | 'qr_payment' | null = null;
  private loadingTimeoutId: any = null;

  // Сценарии (v1.2)
  private scenarioTimeouts: ReturnType<typeof setTimeout>[] = [];

  // send_dish state (v1.3)
  orderDishes: MockDish[] = [...MOCK_ORDER_DISHES];
  sendDishCompleted = false;
  currentTripNumber = 1;
  currentTripDishes: MockDish[] = [];

  get totalTrips(): number {
    return Math.ceil(this.orderDishes.length / this.settings.send_dish.max_dishes_per_trip) || 1;
  }

  private scenarioChains: Record<string, ScenarioStep[]> = {
    // QR-оплата: полный успешный цикл
    'qr-full': [
      { modal: 'qr_cashier_phase', delay: 0 },
      { modal: 'loading', delay: 5000 },
      { modal: 'qr_guest_phase', delay: 3000 },
      { modal: 'qr_success', delay: 5000 },
    ],
    // QR-оплата: тайм-аут гостя
    'qr-timeout': [
      { modal: 'qr_cashier_phase', delay: 0 },
      { modal: 'loading', delay: 5000 },
      { modal: 'qr_guest_phase', delay: 3000 },
      { modal: 'qr_timeout', delay: 5000 },
    ],
    // Отправка меню → успех
    'send-menu-ok': [
      { modal: 'send_menu_confirm', delay: 0 },
      { modal: 'loading', delay: 2000 },
      { modal: 'success', delay: 3000 },
    ],
    // Отправка меню → ошибка
    'send-menu-err': [
      { modal: 'send_menu_confirm', delay: 0 },
      { modal: 'loading', delay: 2000 },
      { modal: 'error', delay: 3000 },
    ],
    // Уборка (один стол) → успех
    'cleanup-ok': [
      { modal: 'cleanup_confirm', delay: 0 },
      { modal: 'loading', delay: 2000 },
      { modal: 'success', delay: 3000 },
    ],
    // Уборка (мультивыбор) → успех
    'cleanup-multi-ok': [
      { modal: 'cleanup_multi_select', delay: 0 },
      { modal: 'loading', delay: 2000 },
      { modal: 'success', delay: 3000 },
    ],
    // Стол не замаплен (одиночная модалка)
    'unmapped': [
      { modal: 'unmapped_table', delay: 0 },
    ],

    // === Доставка блюд — v1.3 (G4) ===

    // Полный цикл: подтверждение → загрузка на раздаче → доставка
    'send-dish-full': [
      { modal: 'send_dish_confirm', delay: 0 },
      { modal: 'loading', delay: 3000 },
      { modal: 'send_dish_pickup_notification', delay: 3000 },
      { modal: 'success', delay: 5000 },
    ],
    // Быстрый путь: из заказа (стол из контекста, без модалки)
    'send-dish-quick': [
      { modal: 'loading', delay: 0 },
      { modal: 'send_dish_pickup_notification', delay: 3000 },
      { modal: 'success', delay: 5000 },
    ],
    // Повторная отправка
    'send-dish-repeat': [
      { modal: 'send_dish_repeat', delay: 0 },
      { modal: 'loading', delay: 3000 },
      { modal: 'send_dish_pickup_notification', delay: 3000 },
      { modal: 'success', delay: 5000 },
    ],
    // Ошибка: стол не замаплен
    'send-dish-error-mapping': [
      { modal: 'error', delay: 0 },
    ],
    // Ошибка: нет свободных роботов
    'send-dish-error-busy': [
      { modal: 'loading', delay: 0 },
      { modal: 'error', delay: 2000 },
    ],
    // Ошибка: NE недоступен
    'send-dish-error-ne': [
      { modal: 'loading', delay: 0 },
      { modal: 'error', delay: 3000 },
    ],
  };

  /** Автоназначение робота */
  get assignedRobotName(): string {
    return getAssignedRobot().robot_name;
  }

  /** Подстановка номера стола в фразу при заборе */
  get pickupPhrase(): string {
    const tableNum = this.currentOrder.table.table_name.replace(/[^0-9]/g, '') || '?';
    return this.settings.send_menu.pickup_phrase.replace('{N}', tableNum);
  }

  get activeNotifications(): PuduNotification[] {
    return this.notifications.filter(n => !n.dismissed && !n.is_estop).slice(0, 3);
  }

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // 1. Контекст POS-экрана
      if (params['context'] === 'order' || params['context'] === 'main') {
        this.currentContext = params['context'];
      }

      // 2. Открыть конкретную модалку
      if (params['modal']) {
        this.activeModal = params['modal'] as PuduModalType;
      }

      // 3. Запустить сценарий (автоцепочку)
      if (params['scenario']) {
        this.runScenario(params['scenario']);
      }

      // 4. Показать уведомление
      if (params['notification']) {
        this.showNotification(params['notification']);
      }
    });
  }

  ngOnDestroy(): void {
    // Очистить все pending-таймеры сценариев
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];
    if (this.loadingTimeoutId) {
      clearTimeout(this.loadingTimeoutId);
    }
    if (this.estopRepeatId) {
      clearTimeout(this.estopRepeatId);
    }
  }

  // ===== Навигация =====

  backToCatalog(): void {
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];
    this.activeModal = null;
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // ===== Сценарии (v1.2) =====

  runScenario(scenarioId: string): void {
    const chain = this.scenarioChains[scenarioId];
    if (!chain) return;

    // Прервать предыдущий сценарий
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];

    let totalDelay = 0;
    chain.forEach(step => {
      totalDelay += step.delay;
      const timeout = setTimeout(() => {
        this.activeModal = step.modal;
      }, totalDelay);
      this.scenarioTimeouts.push(timeout);
    });
  }

  // ===== Уведомления из каталога (v1.2) =====

  showNotification(notificationId: string): void {
    switch (notificationId) {
      case 'notify-estop':
        this.isEstopActive = true;
        this.estopDismissed = false;
        break;
      case 'notify-ne-error':
        this.showNeError();
        break;
    }
  }

  // ===== Закрытие диалога (прерывает автосценарий) =====

  closeDialog(): void {
    // Прервать автосценарий при ручном закрытии
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];
    this.activeModal = null;
  }

  // ===== Button handlers (контекст «Из заказа») =====

  onSendMenu(): void {
    if (!this.currentOrder.table.is_mapped) {
      this.activeModal = 'unmapped_table';
      return;
    }
    this.activeModal = 'send_menu_confirm';
  }

  onCleanup(): void {
    if (!this.currentOrder.table.is_mapped) {
      this.activeModal = 'unmapped_table';
      return;
    }
    this.activeModal = 'cleanup_confirm';
  }

  onSendDish(): void {
    if (!this.currentOrder.table.is_mapped) {
      this.activeModal = 'unmapped_table';
      return;
    }
    // v1.3 (G5): РАЗБЛОКИРОВАНО
    this.currentTripDishes = this.orderDishes.slice(0, this.settings.send_dish.max_dishes_per_trip);
    this.currentTripNumber = 1;
    this.activeModal = 'send_dish_confirm';
  }

  onSendDishRepeat(): void {
    if (!this.sendDishCompleted) return;
    this.activeModal = 'send_dish_repeat';
  }

  executeSendDish(): void {
    this.loadingMessage = 'Отправка робота на раздачу...';
    this.activeModal = 'loading';
    this.loadingTimeoutId = setTimeout(() => {
      this.activeModal = 'send_dish_pickup_notification';
    }, 3000);
  }

  executeRepeatSendDish(): void {
    this.loadingMessage = 'Повторная отправка робота...';
    this.activeModal = 'loading';
    this.loadingTimeoutId = setTimeout(() => {
      this.activeModal = 'send_dish_pickup_notification';
    }, 3000);
  }

  onPickupTimeout(): void {
    this.sendDishCompleted = true;
    this.activeModal = 'success';
  }

  // ===== Button handlers (контекст «Главный экран») =====

  onToggleMarketing(): void {
    this.isCruiseActive = !this.isCruiseActive;
  }

  stopCruise(): void {
    this.isCruiseActive = false;
  }

  onCleanupMulti(): void {
    this.activeModal = 'cleanup_multi_select';
  }

  onMultiCleanupConfirm(tables: OrderTable[]): void {
    this.pendingAction = 'cleanup';
    this.loadingMessage = `Отправка робота для уборки ${tables.length} стол(ов)...`;
    this.activeModal = 'loading';

    this.loadingTimeoutId = setTimeout(() => {
      if (Math.random() > 0.2) {
        this.activeModal = 'success';
      } else {
        this.activeModal = 'error';
      }
    }, 3000);
  }

  // ===== Action handlers =====

  onConfirmAction(action: 'send_menu' | 'cleanup'): void {
    this.pendingAction = action;
    this.loadingMessage = action === 'send_menu'
      ? 'Отправка меню к столу...'
      : 'Отправка робота для уборки...';
    this.activeModal = 'loading';

    this.loadingTimeoutId = setTimeout(() => {
      if (Math.random() > 0.2) {
        this.activeModal = 'success';
      } else {
        this.activeModal = 'error';
      }
    }, 3000);
  }

  onSendToGuest(): void {
    this.pendingAction = 'qr_payment';
    this.loadingMessage = 'Отправка робота к столу...';
    this.activeModal = 'loading';

    this.loadingTimeoutId = setTimeout(() => {
      this.activeModal = 'qr_guest_phase';
    }, 2000);
  }

  onRetry(): void {
    this.activeModal = 'loading';
    this.loadingTimeoutId = setTimeout(() => {
      if (Math.random() > 0.2) {
        if (this.pendingAction === 'qr_payment') {
          this.activeModal = 'qr_guest_phase';
        } else {
          this.activeModal = 'success';
        }
      } else {
        this.activeModal = 'error';
      }
    }, 3000);
  }

  onQrTimeoutClose(): void {
    this.closeDialog();
    this.pushNotification(
      'Гость не оплатил заказ по QR',
      `${this.currentOrder.table.table_name}. Робот возвращается на базу.`
    );
  }

  // ===== E-STOP (D4, З-40) =====

  toggleEstop(): void {
    this.isEstopActive = !this.isEstopActive;
    if (this.isEstopActive) {
      this.estopDismissed = false;
    } else {
      this.estopDismissed = true;
      if (this.estopRepeatId) {
        clearTimeout(this.estopRepeatId);
        this.estopRepeatId = null;
      }
    }
  }

  dismissEstop(): void {
    this.estopDismissed = true;
    // Повторное появление через 5 сек, если E-STOP всё ещё активен
    this.estopRepeatId = setTimeout(() => {
      if (this.isEstopActive) {
        this.estopDismissed = false;
      }
    }, 5000);
  }

  // ===== NE Errors (D5, З-39) =====

  showNeError(): void {
    const neErrors = MOCK_NE_ERROR_NOTIFICATIONS;
    const error = neErrors[this.neErrorIndex % neErrors.length];
    this.pushNotification(error.title, error.message);
    this.neErrorIndex++;
  }

  // ===== Demo helpers =====

  showDemoError(): void {
    const mock = MOCK_NOTIFICATIONS[Math.floor(Math.random() * MOCK_NOTIFICATIONS.length)];
    this.pushNotification(mock.title, mock.message);
  }

  toggleMapped(): void {
    this.currentOrder.table.is_mapped = !this.currentOrder.table.is_mapped;
  }

  cycleTable(): void {
    this.tableIndex = (this.tableIndex + 1) % MOCK_TABLES.length;
    const newTable = MOCK_TABLES[this.tableIndex];
    this.currentOrder.table = { ...newTable };
  }

  // ===== Notifications =====

  pushNotification(title: string, message: string): void {
    const notif: PuduNotification = {
      id: 'notif-' + Date.now(),
      type: 'error',
      title,
      message,
      timestamp: new Date(),
      dismissed: false,
      is_estop: false,
    };
    this.notifications = [notif, ...this.notifications];
  }

  dismissNotification(id: string): void {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.dismissed = true;
  }

  trackNotif(_: number, notif: PuduNotification): string {
    return notif.id;
  }
}
