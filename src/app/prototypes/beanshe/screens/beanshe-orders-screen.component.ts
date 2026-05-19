import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiCardComponent,
  UiToggleComponent,
  UiTabsComponent,
  UiAlertComponent,
  UiEmptyStateComponent,
  UiConfirmDialogComponent,
  UiModalComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { MOCK_ORDERS } from '../data/mock-data';
import {
  BeansheOrder,
  OrderStatus,
  OrderTab,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_BADGE_VARIANT,
} from '../types';

@Component({
  selector: 'app-beanshe-orders-screen',
  standalone: true,
  imports: [
    CommonModule,
    UiBreadcrumbsComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiCardComponent,
    UiToggleComponent,
    UiTabsComponent,
    UiAlertComponent,
    UiEmptyStateComponent,
    UiConfirmDialogComponent,
    UiModalComponent,
    IconsModule,
  ],
  template: `
    <div class="max-w-4xl animate-fade-in">
      <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

      <!-- Заголовок + свитч -->
      <div class="mt-4 mb-4 flex items-center justify-between gap-4">
        <h2 class="text-xl font-medium text-text-primary">Список заказов</h2>
        <div class="flex items-center gap-4">
          <ui-button variant="ghost" size="sm" iconName="send" (click)="showReportModal = true">
            Отправить отчёт
          </ui-button>
          <div class="flex items-center gap-2 pl-4 border-l border-border">
            <ui-toggle
              label="На смене"
              [checked]="isOnShift"
              (checkedChange)="onShiftToggle($event)"
            ></ui-toggle>
          </div>
        </div>
      </div>

      <!-- Inline-уведомления -->
      <ui-alert *ngIf="inlineMessage" [variant]="inlineVariant" class="mb-4" [dismissible]="true" (dismissed)="inlineMessage = ''">
        {{ inlineMessage }}
      </ui-alert>

      <ui-alert *ngIf="!isOnShift" variant="warning" class="mb-4">
        Приём заказов выключен. Включите свитч «На смене», чтобы получать новые заказы.
      </ui-alert>

      <!-- Вкладки -->
      <ui-tabs
        [tabs]="tabs"
        [activeTab]="activeTab"
        (tabChange)="activeTab = $event"
      ></ui-tabs>

      <!-- Список заказов -->
      <div class="mt-4 space-y-3">
        <div *ngIf="filteredOrders.length === 0">
          <ui-empty-state
            [title]="emptyTitle"
            [description]="emptyDescription"
            icon="coffee"
          ></ui-empty-state>
        </div>

        <div
          *ngFor="let order of filteredOrders"
          class="bg-surface rounded-lg border border-border p-4 hover:shadow-card transition-shadow"
        >
          <!-- Шапка карточки -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-lg font-semibold text-text-primary">#{{ order.beanshe_order_id }}</span>
              <ui-badge [variant]="getStatusVariant(order.status)">
                {{ getStatusLabel(order.status) }}
              </ui-badge>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-text-primary">{{ order.total_price }} ₽</div>
              <div *ngIf="order.discount_amount > 0" class="text-xs text-text-secondary">
                скидка {{ order.discount_amount }} ₽
              </div>
            </div>
          </div>

          <!-- Покупатель и время -->
          <div class="flex items-center gap-4 mb-3 text-sm">
            <div class="flex items-center gap-1.5 text-text-secondary">
              <lucide-icon name="user" [size]="14"></lucide-icon>
              <span>{{ order.customer_name }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-text-secondary">
              <lucide-icon name="clock" [size]="14"></lucide-icon>
              <span>Выдача: {{ formatTime(order.pickup_time) }}</span>
            </div>
            <div *ngIf="order.status === 'created'" class="flex items-center gap-1.5">
              <span class="text-xs px-2 py-0.5 rounded-full"
                [ngClass]="getUrgencyClass(order)">
                {{ getTimeUntilPickup(order) }}
              </span>
            </div>
          </div>

          <!-- Состав заказа -->
          <div class="mb-3">
            <div class="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1.5">Состав</div>
            <div class="space-y-1">
              <div *ngFor="let item of order.items" class="flex items-start justify-between text-sm">
                <div class="flex-1">
                  <span class="text-text-primary">{{ item.product_name }}</span>
                  <span *ngIf="item.size" class="text-text-secondary ml-1">({{ item.size }})</span>
                  <span *ngIf="item.quantity > 1" class="text-text-secondary ml-1">× {{ item.quantity }}</span>
                  <div *ngIf="item.modifications && item.modifications.length > 0" class="text-xs text-text-secondary mt-0.5">
                    + {{ item.modifications.join(', ') }}
                  </div>
                </div>
                <span class="text-text-secondary ml-4">{{ item.price * item.quantity }} ₽</span>
              </div>
            </div>
          </div>

          <!-- Комментарий -->
          <div *ngIf="order.comment" class="mb-3 p-2 bg-surface-secondary rounded text-sm text-text-secondary border border-border/40">
            <lucide-icon name="info" [size]="12" class="inline mr-1 opacity-60"></lucide-icon>
            {{ order.comment }}
          </div>

          <!-- Кнопки действий -->
          <div *ngIf="order.status === 'created'" class="flex items-center gap-2 pt-3 border-t border-border/40">
            <ui-button
              variant="primary"
              size="sm"
              iconName="check"
              [loading]="loadingOrderId === order.beanshe_order_id && loadingAction === 'accept'"
              (click)="acceptOrder(order)"
            >
              Принять
            </ui-button>
            <ui-button
              variant="danger"
              size="sm"
              iconName="x"
              (click)="confirmCancelOrder(order)"
            >
              Отменить
            </ui-button>
          </div>

          <!-- Для принятых — пояснение -->
          <div *ngIf="order.status === 'accepted'" class="pt-3 border-t border-border/40">
            <div class="flex items-center gap-2 text-xs text-text-secondary">
              <lucide-icon name="terminal" [size]="12"></lucide-icon>
              <span>Заказ создан в Front. Управление статусами — через кассу.</span>
            </div>
          </div>

          <!-- Для завершённых — время -->
          <div *ngIf="order.completed_at" class="pt-3 border-t border-border/40">
            <div class="flex items-center gap-2 text-xs text-text-secondary">
              <lucide-icon name="check-circle-2" [size]="12"></lucide-icon>
              <span>Завершён: {{ formatTime(order.completed_at) }}</span>
            </div>
          </div>

          <!-- Для отменённых — причина -->
          <div *ngIf="order.cancellation_reason" class="pt-3 border-t border-border/40">
            <div class="flex items-center gap-2 text-xs text-text-secondary">
              <lucide-icon name="x-circle" [size]="12"></lucide-icon>
              <span>Причина: {{ getCancellationLabel(order.cancellation_reason) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <ui-button variant="ghost" size="sm" iconName="arrow-left" (click)="goBack()">Назад</ui-button>
      </div>

      <!-- Модалка подтверждения отмены -->
      <ui-confirm-dialog
        [open]="showCancelConfirm"
        title="Отменить заказ?"
        [message]="cancelConfirmMessage"
        confirmText="Отменить заказ"
        confirmVariant="danger"
        (confirmed)="cancelOrder()"
        (cancelled)="showCancelConfirm = false"
      ></ui-confirm-dialog>

      <!-- Модалка «Отправить отчёт» -->
      <ui-modal [open]="showReportModal" (modalClose)="showReportModal = false" title="Отправить отчёт" size="sm">
        <div class="flex flex-col items-center py-4">
          <lucide-icon name="send" [size]="48" class="text-app-primary mb-3"></lucide-icon>
          <p class="text-text-primary font-medium">Отчёт отправлен в поддержку Beanshe</p>
          <p class="text-sm text-text-secondary mt-1">Логи за последние 24 часа приложены к обращению.</p>
        </div>
        <div modalFooter>
          <ui-button variant="primary" (click)="showReportModal = false">Закрыть</ui-button>
        </div>
      </ui-modal>

      <!-- Модалка предупреждения при выключении свитча -->
      <ui-confirm-dialog
        [open]="showShiftWarning"
        title="Есть незавершённые заказы"
        [message]="shiftWarningMessage"
        confirmText="Выключить"
        confirmVariant="danger"
        (confirmed)="forceShiftOff()"
        (cancelled)="cancelShiftOff()"
      ></ui-confirm-dialog>
    </div>
  `,
})
export class BeansheOrdersScreenComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);

  orders: BeansheOrder[] = [];
  isOnShift = true;
  activeTab = 'active';
  loadingOrderId: number | null = null;
  loadingAction: string | null = null;
  inlineMessage = '';
  inlineVariant: 'success' | 'error' | 'info' | 'warning' = 'success';

  showCancelConfirm = false;
  cancelConfirmMessage = '';
  private orderToCancel: BeansheOrder | null = null;

  showReportModal = false;
  showShiftWarning = false;
  shiftWarningMessage = '';

  breadcrumbs = [
    { label: 'Beanshe', onClick: () => this.goBack() },
    { label: 'Список заказов' },
  ];

  tabs = [
    { key: 'active', label: 'Активные' },
    { key: 'cancelled', label: 'Отменённые' },
    { key: 'closed', label: 'Закрытые' },
  ];

  ngOnInit(): void {
    this.orders = this.storage.load<BeansheOrder[]>('beanshe', 'orders', [...MOCK_ORDERS]);
    this.isOnShift = this.storage.load<boolean>('beanshe', 'isOnShift', true);
  }

  get filteredOrders(): BeansheOrder[] {
    switch (this.activeTab) {
      case 'active':
        return this.orders.filter(o =>
          o.status === 'created' || o.status === 'accepted'
        ).sort((a, b) => new Date(a.pickup_time).getTime() - new Date(b.pickup_time).getTime());
      case 'cancelled':
        return this.orders.filter(o =>
          o.status === 'cancelled_barista' || o.status === 'cancelled_customer' || o.status === 'expired'
        );
      case 'closed':
        return this.orders.filter(o =>
          o.status === 'completed' || o.status === 'discarded'
        );
      default:
        return [];
    }
  }

  get emptyTitle(): string {
    switch (this.activeTab) {
      case 'active': return 'Нет активных заказов';
      case 'cancelled': return 'Нет отменённых заказов';
      case 'closed': return 'Нет закрытых заказов';
      default: return '';
    }
  }

  get emptyDescription(): string {
    switch (this.activeTab) {
      case 'active': return 'Новые заказы из приложения Beanshe появятся здесь автоматически';
      case 'cancelled': return 'Отменённые заказы за сегодня будут показаны здесь';
      case 'closed': return 'Выданные и списанные заказы за сегодня будут показаны здесь';
      default: return '';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  getStatusVariant(status: OrderStatus): 'primary' | 'danger' | 'success' | 'default' | 'warning' | 'info' {
    return (ORDER_STATUS_BADGE_VARIANT[status] ?? 'default') as 'primary' | 'danger' | 'success' | 'default' | 'warning' | 'info';
  }

  getCancellationLabel(reason: string): string {
    const labels: Record<string, string> = {
      customer_cancelled: 'Покупатель отменил через приложение',
      barista_cancelled: 'Отменено баристой',
      cannot_prepare: 'Не можем приготовить (нет ингредиентов)',
      expired: 'Автоотмена (не принят вовремя)',
      other: 'Другая причина',
    };
    return labels[reason] ?? reason;
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  getTimeUntilPickup(order: BeansheOrder): string {
    const diff = new Date(order.pickup_time).getTime() - Date.now();
    const minutes = Math.round(diff / 60000);
    if (minutes <= 0) return 'Просрочен';
    if (minutes < 60) return `через ${minutes} мин`;
    return `через ${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
  }

  getUrgencyClass(order: BeansheOrder): string {
    const diff = new Date(order.pickup_time).getTime() - Date.now();
    const minutes = Math.round(diff / 60000);
    if (minutes <= 4) return 'bg-red-100 text-red-700';
    if (minutes <= 10) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  }

  acceptOrder(order: BeansheOrder): void {
    this.loadingOrderId = order.beanshe_order_id;
    this.loadingAction = 'accept';

    setTimeout(() => {
      order.status = 'accepted';
      order.accepted_at = new Date().toISOString();
      this.saveOrders();
      this.loadingOrderId = null;
      this.loadingAction = null;
      this.showInline('success', `Заказ #${order.beanshe_order_id} принят`);
    }, 800);
  }

  confirmCancelOrder(order: BeansheOrder): void {
    this.orderToCancel = order;
    this.cancelConfirmMessage = `Заказ #${order.beanshe_order_id} от ${order.customer_name} будет отменён. Это действие нельзя отменить.`;
    this.showCancelConfirm = true;
  }

  cancelOrder(): void {
    if (!this.orderToCancel) return;
    this.showCancelConfirm = false;

    const order = this.orderToCancel;
    order.status = 'cancelled_barista';
    order.cancellation_reason = 'barista_cancelled';
    this.saveOrders();
    this.showInline('info', `Заказ #${order.beanshe_order_id} отменён`);
    this.orderToCancel = null;
  }

  onShiftToggle(value: boolean): void {
    if (!value) {
      const activeOrders = this.orders.filter(o => o.status === 'created' || o.status === 'accepted');
      if (activeOrders.length > 0) {
        this.shiftWarningMessage = `Есть незавершённые заказы: ${activeOrders.map(o => '#' + o.beanshe_order_id).join(', ')}. Выключить приём заказов?`;
        this.showShiftWarning = true;
        return;
      }
    }
    this.isOnShift = value;
    this.storage.save('beanshe', 'isOnShift', value);
    if (!value) {
      this.showInline('info', 'Приём заказов выключен');
    }
  }

  forceShiftOff(): void {
    this.showShiftWarning = false;
    this.isOnShift = false;
    this.storage.save('beanshe', 'isOnShift', false);
    this.showInline('info', 'Приём заказов выключен');
  }

  cancelShiftOff(): void {
    this.showShiftWarning = false;
    this.isOnShift = true;
  }

  goBack(): void {
    this.router.navigate(['/prototype/beanshe']);
  }

  private saveOrders(): void {
    this.storage.save('beanshe', 'orders', this.orders);
  }

  private showInline(variant: 'success' | 'error' | 'info' | 'warning', message: string): void {
    this.inlineMessage = message;
    this.inlineVariant = variant;
    setTimeout(() => {
      this.inlineMessage = '';
    }, variant === 'error' ? 5000 : 3000);
  }
}
