import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import {
  PosTerminalShellComponent,
  PosMainScreenComponent,
  PosTablesScreenComponent,
  PosDeliveryListScreenComponent,
  PosDeliveryOrderScreenComponent,
  PosPaymentScreenComponent,
  PosDialogComponent,
  DeliveryOrder,
  DeliveryOrderStatus,
  PosMenuItem,
  PosPaymentMethod,
} from '@/components/pos-terminal';

import { SparrowStateService } from '../services/sparrow-state.service';
import { SparrowBackendPanelComponent } from '../components/sparrow-backend-panel.component';
import { SparrowPluginDialogComponent } from '../components/sparrow-plugin-dialog.component';
import { SparrowPluginsMenuComponent } from '../components/sparrow-plugins-menu.component';
import { SparrowNotificationOverlayComponent } from '../components/sparrow-notification-overlay.component';
import { ACTIVE_STATUSES, SparrowOrderStatus, SparrowOrderItem, SparrowOrder } from '../types';

type PosScreen = 'main' | 'tables' | 'delivery-list' | 'order' | 'payment';

/**
 * Главный экран прототипа Sparrow.
 *
 * Двухколоночная раскладка:
 * - Левая (70%): POS-терминал с кнопкой «Доп.» → окно плагина
 * - Правая (30%): Панель эмуляции Backend
 *
 * Блокирующие нотификации накладываются поверх терминала (FIFO, раздел 4.3).
 * Таймеры автоотмены и «не забрали» (разделы 4.5.1.1, 4.5.1.2).
 */
@Component({
  selector: 'app-sparrow-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    PosTerminalShellComponent,
    PosMainScreenComponent,
    PosTablesScreenComponent,
    PosDeliveryListScreenComponent,
    PosDeliveryOrderScreenComponent,
    PosPaymentScreenComponent,
    PosDialogComponent,
    SparrowBackendPanelComponent,
    SparrowPluginDialogComponent,
    SparrowPluginsMenuComponent,
    SparrowNotificationOverlayComponent,
  ],
  template: `
    <div class="flex h-[calc(100vh-48px)]">

      <!-- ═══ Левая колонка: POS Terminal (70%) ═══ -->
      <div class="w-[70%] h-full">
        <pos-terminal-shell [showPlaceholder]="false"
                            [showBottomBar]="currentScreen === 'main'"
                            [showNotificationArea]="false"
                            (bottomAction)="onBottomAction($event)">

          <!-- Главный экран терминала -->
          <pos-main-screen *ngIf="currentScreen === 'main'"
                           posScreen
                           (navigate)="onMainNavigate($event)">
          </pos-main-screen>

          <!-- Экран залов/столов -->
          <pos-tables-screen *ngIf="currentScreen === 'tables'"
                             posScreen
                             (navigate)="onTablesNavigate($event)">
          </pos-tables-screen>

          <!-- Экран списка доставочных заказов -->
          <pos-delivery-list-screen *ngIf="currentScreen === 'delivery-list'"
                                    posScreen
                                    [orders]="deliveryOrders"
                                    (navigate)="onDeliveryListNavigate($event)"
                                    (selectOrder)="onSelectOrder($event)"
                                    (closeOrder)="onCloseOrder($event)">
          </pos-delivery-list-screen>

          <!-- Экран редактирования заказа -->
          <pos-delivery-order-screen *ngIf="currentScreen === 'order'"
                                     posScreen
                                     [order]="currentDeliveryOrder"
                                     (navigate)="onOrderNavigate($event)"
                                     (statusChange)="onDeliveryStatusChange($event)"
                                     (addItem)="onAddItem($event)"
                                     (removeItem)="onRemoveItemByIndex($event)"
                                     (saveOrder)="onSaveOrder()">
          </pos-delivery-order-screen>

          <!-- Экран оплаты -->
          <pos-payment-screen *ngIf="currentScreen === 'payment'"
                              posScreen
                              [order]="currentDeliveryOrder"
                              [customPaymentMethods]="sparrowPaymentMethods"
                              [prefillExactAmount]="prefillPayment"
                              [initialPaymentType]="prefillPayment ? 'bank-card' : 'cash'"
                              [skipFiscalization]="true"
                              (navigate)="onPaymentNavigate($event)"
                              (paymentComplete)="onPaymentComplete()">
          </pos-payment-screen>

          <!-- ═══ Меню выбора плагинов (по кнопке «Дополнения») ═══ -->
          <app-sparrow-plugins-menu
            [open]="showPluginsMenu"
            (selectPlugin)="onPluginSelected($event)"
            (dialogClose)="showPluginsMenu = false">
          </app-sparrow-plugins-menu>

          <!-- ═══ Окно плагина Beanshe (после выбора из меню) ═══ -->
          <app-sparrow-plugin-dialog
            [open]="showPluginDialog"
            (dialogClose)="showPluginDialog = false">
          </app-sparrow-plugin-dialog>

          <!-- ═══ Overlay закрытия заказа (плагин добавляет оплату + отправляет в Beanshe) ═══ -->
          <pos-dialog *ngIf="showCloseOverlay"
                      [open]="true"
                      [closable]="false"
                      theme="light"
                      maxWidth="sm"
                      padding="lg">
            <!-- Загрузка -->
            <div *ngIf="closeOverlayState === 'loading'" class="flex flex-col items-center gap-4 py-4">
              <div class="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <div class="text-lg font-medium text-gray-800">Закрытие заказа...</div>
              <div class="text-sm text-gray-500">Добавление типа оплаты и отправка в Beanshe</div>
            </div>
            <!-- Ошибка -->
            <div *ngIf="closeOverlayState === 'error'" class="flex flex-col items-center gap-4 py-4">
              <lucide-icon name="alert-circle" [size]="48" color="#ef4444"></lucide-icon>
              <div class="text-lg font-medium text-red-600">Ошибка</div>
              <div class="text-sm text-gray-600 text-center">{{ closeErrorMessage }}</div>
              <div class="text-xs text-gray-400 text-center mt-1">Тип оплаты добавлен. Перейдите на экран оплаты для повторной попытки.</div>
              <button class="mt-3 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      (click)="onCloseOverlayDismiss()">
                Перейти к оплате
              </button>
            </div>
          </pos-dialog>

          <!-- ═══ Блокирующая нотификация (overlay поверх всего, FIFO) ═══ -->
          <app-sparrow-notification-overlay
            [notification]="state.currentNotification"
            [queueSize]="state.notificationQueueSize"
            (accept)="onNotifAccept($event)"
            (decline)="onNotifDecline($event)"
            (pickedUp)="onNotifPickedUp($event)"
            (notPickedUp)="onNotifNotPickedUp($event)">
          </app-sparrow-notification-overlay>

        </pos-terminal-shell>
      </div>

      <!-- ═══ Правая колонка: Backend панель (30%) ═══ -->
      <div class="w-[30%] h-full">
        <app-sparrow-backend-panel
          [isOnline]="state.isBackendOnline"
          [hasActiveOrders]="hasActiveOrders"
          [log]="state.log"
          (toggleOnline)="onToggleOnline()"
          (randomOrder)="onSimNewOrder()"
          (createOrder)="onCreateOrder($event)"
          (customerCancel)="onSimCustomerCancel()"
          (stopPush)="onSimStopPush()"
          (toggleFrontStop)="onToggleFrontStop()">
        </app-sparrow-backend-panel>
      </div>

    </div>
  `,
})
export class SparrowMainScreenComponent implements OnInit, OnDestroy {
  state = inject(SparrowStateService);

  currentScreen: PosScreen = 'main';
  showPluginsMenu = false;
  showPluginDialog = false;
  currentOrderId: number | null = null;

  // Close overlay state
  showCloseOverlay = false;
  closeOverlayState: 'loading' | 'error' = 'loading';
  closeErrorMessage = '';
  prefillPayment = false;

  /** Кастомные типы оплаты: Beanshe как внешний тип под «Банковские карты» */
  sparrowPaymentMethods: PosPaymentMethod[] = [
    { id: 'cash', name: 'Наличные', type: 'cash' },
    { id: 'beanshe', name: 'Банковские карты', displayName: 'Beanshe', type: 'bank-card' },
    { id: 'cashless', name: 'Безнал. расчет', type: 'cashless' },
    { id: 'no-revenue', name: 'Без выручки', type: 'no-revenue' },
  ];

  /** Есть ли активные заказы (для кнопки отмены) */
  get hasActiveOrders(): boolean {
    return this.state.orders.some(o => ACTIVE_STATUSES.includes(o.status));
  }

  /** Маппинг SparrowOrder[] → DeliveryOrder[] для POS-экранов */
  get deliveryOrders(): DeliveryOrder[] {
    return this.state.orders.map(o => this._toDeliveryOrder(o));
  }

  /** Текущий выбранный заказ для экрана редактирования/оплаты */
  get currentDeliveryOrder(): DeliveryOrder | null {
    if (this.currentOrderId == null) return null;
    const sparrow = this.state.orders.find(o => o.id === this.currentOrderId);
    return sparrow ? this._toDeliveryOrder(sparrow) : null;
  }

  ngOnInit(): void {
    this.state.startTimers();
  }

  ngOnDestroy(): void {
    this.state.stopTimers();
  }

  // ─── POS Terminal events ─────────────────────

  onBottomAction(action: string): void {
    if (action === 'orders') {
      this.currentScreen = 'tables';
    } else if (action === 'extensions') {
      this.showPluginsMenu = true;
    }
  }

  onMainNavigate(action: string): void {
    if (action === 'delivery') {
      this.currentScreen = 'tables';
    }
  }

  onTablesNavigate(action: string): void {
    if (action === 'back') {
      this.currentScreen = 'main';
    } else if (action === 'delivery-list') {
      this.currentScreen = 'delivery-list';
    }
  }

  /** Выбор плагина из меню «Дополнения» */
  onPluginSelected(plugin: string): void {
    this.showPluginsMenu = false;
    if (plugin === 'beanshe') {
      this.showPluginDialog = true;
    }
  }

  // ─── Delivery List events ───────────────────

  onDeliveryListNavigate(action: string): void {
    if (action === 'back') {
      this.currentScreen = 'tables';
    }
  }

  onSelectOrder(orderId: number): void {
    this.currentOrderId = orderId;
    this.currentScreen = 'order';
  }

  onCloseOrder(orderId: number): void {
    this.state.updateStatus(orderId, 'completed');
  }

  // ─── Delivery Order events ──────────────────

  onOrderNavigate(action: string): void {
    if (action === 'back') {
      this.currentScreen = 'delivery-list';
      this.currentOrderId = null;
    } else if (action === 'payment') {
      // Плагин перехватывает: автоматическое закрытие заказа
      this._startCloseFlow();
    }
  }

  onDeliveryStatusChange(status: DeliveryOrderStatus): void {
    if (this.currentOrderId == null) return;
    const sparrowStatus = this._fromDeliveryStatus(status);
    this.state.updateStatus(this.currentOrderId, sparrowStatus);
  }

  onAddItem(_item: PosMenuItem): void {
    // Прототип: добавление позиций не поддерживается (заказ приходит из внешней системы)
  }

  onRemoveItemByIndex(_index: number): void {
    // Прототип: удаление позиций не поддерживается
  }

  onSaveOrder(): void {
    // Прототип: сохранение — noop, данные в памяти
  }

  // ─── Payment events ─────────────────────────

  onPaymentNavigate(action: string): void {
    if (action === 'back') {
      this.currentScreen = 'order';
      this.prefillPayment = false;
    }
  }

  onPaymentComplete(): void {
    // Повторная попытка: плагин снова пытается отправить в Beanshe
    this._startCloseFlow();
  }

  // ─── Notification overlay events (Этап 4) ───

  /** Новый заказ: принять */
  onNotifAccept(orderId: number): void {
    this.state.updateStatus(orderId, 'accepted');
    this.state.showInlineMessage(`Заказ ${this._orderNumber(orderId)} принят`);
    this.state.dismissNotification();
  }

  /** Новый заказ: отменить */
  onNotifDecline(orderId: number): void {
    this.state.updateStatus(orderId, 'cancelled_barista');
    this.state.showInlineMessage(`Заказ ${this._orderNumber(orderId)} отменён`, 'error');
    this.state.dismissNotification();
  }

  /** Не забрали: выдать */
  onNotifPickedUp(orderId: number): void {
    this.state.updateStatus(orderId, 'completed');
    this.state.showInlineMessage(`Заказ ${this._orderNumber(orderId)} выдан`);
    this.state.dismissNotification();
  }

  /** Не забрали: списать */
  onNotifNotPickedUp(orderId: number): void {
    this.state.updateStatus(orderId, 'discarded');
    this.state.showInlineMessage(`Заказ ${this._orderNumber(orderId)} — не забрали`, 'error');
    this.state.dismissNotification();
  }

  // ─── Backend panel events ────────────────────

  onToggleOnline(): void {
    this.state.isBackendOnline = !this.state.isBackendOnline;
  }

  onSimNewOrder(): void {
    this.state.simulateNewOrder();
  }

  onSimCustomerCancel(): void {
    // Отменяем первый активный заказ
    const activeOrder = this.state.orders.find(o => ACTIVE_STATUSES.includes(o.status));
    if (activeOrder) {
      this.state.simulateCustomerCancel(activeOrder.id);
    }
  }

  /** Создать заказ из формы (Этап 7) */
  onCreateOrder(data: { customerName: string; items: SparrowOrderItem[]; pickupMinutes: number; comment: string }): void {
    this.state.createOrder(data);
  }

  /** Push стоп-запрос от бэкенда (Этап 6, кейс 3) */
  onSimStopPush(): void {
    this.state.simulateStopPush();
    // Если запрос создан — автоматически открыть окно плагина
    if (this.state.pendingStopPush) {
      this.showPluginDialog = true;
    }
  }

  /** Переключить стоп-лист Front для случайного продукта */
  onToggleFrontStop(): void {
    // Переключаем isStoppedInFront у случайного продукта для демонстрации
    const items = this.state.stopList;
    const idx = Math.floor(Math.random() * items.length);
    items[idx].isStoppedInFront = !items[idx].isStoppedInFront;
    // Если Front ставит на стоп, продукт тоже на стопе
    if (items[idx].isStoppedInFront) {
      items[idx].isStopped = true;
      items[idx].stopSource = 'auto_sync';
    }
  }

  // ─── Close flow (плагин автозакрытия) ───────

  /** Запуск флоу закрытия: overlay → добавить оплату → отправить в Beanshe → закрыть */
  private _startCloseFlow(): void {
    this.showCloseOverlay = true;
    this.closeOverlayState = 'loading';

    this.state.addLog('POST', '/orders/pay', 'success', 'Добавление типа оплаты (предоплата)');

    // Симуляция async-операции (1.5–2.5 сек)
    const delay = 1500 + Math.random() * 1000;
    setTimeout(() => {
      // 70% успех, 30% ошибка (для демонстрации)
      const success = Math.random() > 0.3;

      if (success) {
        if (this.currentOrderId != null) {
          this.state.updateStatus(this.currentOrderId, 'completed');
          this.state.addLog('POST', '/orders/complete', 'success',
            `Заказ ${this._orderNumber(this.currentOrderId)} → complete (Beanshe)`);
          this.state.showInlineMessage(`Заказ ${this._orderNumber(this.currentOrderId)} закрыт`);
        }
        this.showCloseOverlay = false;
        this.prefillPayment = false;
        this.currentScreen = 'delivery-list';
        this.currentOrderId = null;
      } else {
        this.closeOverlayState = 'error';
        this.closeErrorMessage = 'Не удалось отправить уведомление о закрытии в Beanshe. Сервер не отвечает.';
        this.state.addLog('POST', '/orders/complete', 'error',
          `Ошибка отправки complete в Beanshe`);
      }
    }, delay);
  }

  /** Dismiss ошибки → переход на экран оплаты (тип оплаты уже добавлен) */
  onCloseOverlayDismiss(): void {
    this.showCloseOverlay = false;
    this.prefillPayment = true;
    this.currentScreen = 'payment';
  }

  // ─── Helpers ─────────────────────────────────

  private _orderNumber(orderId: number): string {
    return this.state.orders.find(o => o.id === orderId)?.number ?? `#${orderId}`;
  }

  /** SparrowOrder → DeliveryOrder (для POS-экранов) */
  private _toDeliveryOrder(o: SparrowOrder): DeliveryOrder {
    return {
      id: o.id,
      status: this._toDeliveryStatus(o.status),
      type: 'pickup' as const,
      createdAt: o.createdAt,
      deliveryTime: o.pickupTime,
      address: '',
      courier: '',
      client: o.customerName,
      phone: '',
      comment: o.comment,
      items: o.items.map((i, idx) => ({
        id: idx + 1,
        dishId: i.productId,
        name: i.modifications.length
          ? `${i.productName} (${i.modifications.join(', ')})`
          : i.productName,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: o.totalPrice,
      discount: 0,
      surcharge: 0,
      prepayment: o.totalPrice,
      total: o.totalPrice,
      isFiscalized: false,
      paymentMethod: 'cashless',
    };
  }

  /** SparrowOrderStatus → DeliveryOrderStatus */
  private _toDeliveryStatus(s: SparrowOrderStatus): DeliveryOrderStatus {
    switch (s) {
      case 'created':            return 'unconfirmed';
      case 'accepted':           return 'new';
      case 'preparing':          return 'cooking';
      case 'ready':              return 'ready';
      case 'completed':          return 'closed';
      case 'discarded':          return 'closed';
      case 'cancelled_barista':  return 'cancelled';
      case 'cancelled_customer': return 'cancelled';
      case 'expired':            return 'cancelled';
    }
  }

  /** DeliveryOrderStatus → SparrowOrderStatus */
  private _fromDeliveryStatus(s: DeliveryOrderStatus): SparrowOrderStatus {
    switch (s) {
      case 'unconfirmed': return 'created';
      case 'new':         return 'accepted';
      case 'cooking':     return 'preparing';
      case 'ready':       return 'ready';
      case 'on-the-way':  return 'ready';
      case 'closed':      return 'completed';
      case 'cancelled':   return 'cancelled_barista';
    }
  }
}
