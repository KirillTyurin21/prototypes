import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import {
  PosTerminalShellComponent,
  PosMainScreenComponent,
  PosTablesScreenComponent,
  PosDialogComponent,
} from '@/components/pos-terminal';

import { SparrowStateService } from '../services/sparrow-state.service';
import { SparrowBackendPanelComponent } from '../components/sparrow-backend-panel.component';
import { SparrowPluginDialogComponent } from '../components/sparrow-plugin-dialog.component';
import { SparrowPluginsMenuComponent } from '../components/sparrow-plugins-menu.component';
import { SparrowNotificationOverlayComponent } from '../components/sparrow-notification-overlay.component';
import { ACTIVE_STATUSES, SparrowOrderStatus, SparrowOrderItem } from '../types';

type PosScreen = 'main' | 'tables';

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

          <!-- Экран залов/столов (стандартный, по кнопке «Заказы») -->
          <pos-tables-screen *ngIf="currentScreen === 'tables'"
                             posScreen
                             (navigate)="onTablesNavigate($event)">
          </pos-tables-screen>

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

  /** Есть ли активные заказы (для кнопки отмены) */
  get hasActiveOrders(): boolean {
    return this.state.orders.some(o => ACTIVE_STATUSES.includes(o.status));
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
    }
  }

  /** Выбор плагина из меню «Дополнения» */
  onPluginSelected(plugin: string): void {
    this.showPluginsMenu = false;
    if (plugin === 'beanshe') {
      this.showPluginDialog = true;
    }
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

  // ─── Helpers ─────────────────────────────────

  private _orderNumber(orderId: number): string {
    return this.state.orders.find(o => o.id === orderId)?.number ?? `#${orderId}`;
  }
}
