import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { PosDialogComponent } from '@/components/pos-terminal';

import { SparrowStateService } from '../services/sparrow-state.service';
import { SparrowOrderCardComponent } from './sparrow-order-card.component';
import { SparrowStopListScreenComponent } from './sparrow-stop-list-screen.component';
import { SparrowStopPushDialogComponent } from './sparrow-stop-push-dialog.component';
import { SparrowTab, SparrowOrderStatus } from '../types';

/**
 * Окно плагина Sparrow — основной интерфейс баристы.
 *
 * Полноэкранный pos-dialog внутри терминала.
 *
 * Содержит:
 * - Header: название + переключатель «На смене»
 * - 3 вкладки: Активные / Отменённые / Закрытые
 * - Список карточек заказов (отсортирован по pickupTime)
 * - Footer: Стоп-лист + Отправить отчёт
 *
 * Источник: спецификация, раздел 9.2
 */
@Component({
  selector: 'app-sparrow-plugin-dialog',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    PosDialogComponent,
    SparrowOrderCardComponent,
    SparrowStopListScreenComponent,
    SparrowStopPushDialogComponent,
  ],
  template: `
    <pos-dialog [open]="open"
                maxWidth="lg"
                theme="dark"
                padding="sm"
                [closable]="true"
                (dialogClose)="dialogClose.emit()">

      <!-- ═══ Stop-list screen (replaces main content) ═══ -->
      <ng-container *ngIf="showStopListScreen; else ordersView">
        <app-sparrow-stop-list-screen
          (back)="showStopListScreen = false">
        </app-sparrow-stop-list-screen>
      </ng-container>

      <!-- ═══ Orders view (main) ═══ -->
      <ng-template #ordersView>

        <!-- ═══ Header ═══ -->
        <div class="flex items-center justify-between mb-4 px-2 pt-2">
          <div class="flex items-center gap-3">
            <lucide-icon name="coffee" [size]="20" class="text-amber-400"></lucide-icon>
            <span class="text-lg font-bold text-white">Sparrow</span>
          </div>

          <!-- Switch «На смене» -->
          <button (click)="onToggleShift()"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                         transition-colors cursor-pointer select-none"
                  [class.bg-green-600]="state.isOnShift"
                  [class.text-white]="state.isOnShift"
                  [class.bg-gray-600]="!state.isOnShift"
                  [class.text-gray-300]="!state.isOnShift">
            <span class="w-2 h-2 rounded-full transition-colors"
                  [class.bg-green-300]="state.isOnShift"
                  [class.bg-gray-400]="!state.isOnShift"></span>
            {{ state.isOnShift ? 'На смене' : 'Не на смене' }}
          </button>
        </div>

        <!-- ═══ Inline notification banner ═══ -->
        <div *ngIf="state.inlineMessage"
             class="mx-2 mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 animate-fade-in"
             [ngClass]="state.inlineType === 'success'
               ? 'bg-green-600 bg-opacity-20 text-green-300'
               : 'bg-red-600 bg-opacity-20 text-red-300'">
          <lucide-icon [name]="state.inlineType === 'success' ? 'check-circle' : 'alert-circle'"
                       [size]="14"></lucide-icon>
          {{ state.inlineMessage }}
        </div>

        <!-- ═══ Tabs ═══ -->
        <div class="flex border-b border-gray-600 mb-3 px-2">
          <button *ngFor="let tab of tabs"
                  (click)="onTabChange(tab.key)"
                  class="px-4 py-2 text-xs font-medium transition-colors relative cursor-pointer"
                  [class.text-white]="state.activeTab === tab.key"
                  [class.text-gray-500]="state.activeTab !== tab.key"
                  [class.hover:text-gray-300]="state.activeTab !== tab.key">
            {{ tab.label }}
            <span *ngIf="state.tabCounts[tab.key] > 0"
                  class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  [class.bg-blue-600]="state.activeTab === tab.key"
                  [class.text-white]="state.activeTab === tab.key"
                  [class.bg-gray-600]="state.activeTab !== tab.key"
                  [class.text-gray-400]="state.activeTab !== tab.key">
              {{ state.tabCounts[tab.key] }}
            </span>
            <!-- Active indicator -->
            <div *ngIf="state.activeTab === tab.key"
                 class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t"></div>
          </button>
        </div>

        <!-- ═══ Order list ═══ -->
        <div class="flex-1 overflow-y-auto px-2 space-y-3"
             style="max-height: 320px;">

          <!-- Empty state -->
          <div *ngIf="state.filteredOrders.length === 0"
               class="flex flex-col items-center justify-center py-12 text-gray-500">
            <lucide-icon name="inbox" [size]="36" class="mb-3 opacity-40"></lucide-icon>
            <span class="text-sm">{{ emptyMessage }}</span>
          </div>

          <!-- Order cards -->
          <app-sparrow-order-card
            *ngFor="let order of state.filteredOrders"
            [order]="order"
            (action)="onOrderAction($event)">
          </app-sparrow-order-card>
        </div>

        <!-- ═══ Footer ═══ -->
        <div class="flex items-center justify-between px-2 pt-3 mt-3 border-t border-gray-600">
          <button (click)="showStopListScreen = true"
                  class="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium
                         text-orange-300 hover:bg-orange-400/10 transition-colors cursor-pointer">
            <lucide-icon name="ban" [size]="14"></lucide-icon>
            Стоп-лист
            <span *ngIf="stoppedCount > 0"
                  class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
              {{ stoppedCount }}
            </span>
          </button>
          <button class="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium
                         text-gray-400 hover:bg-gray-500/10 transition-colors cursor-pointer">
            <lucide-icon name="send" [size]="14"></lucide-icon>
            Отправить отчёт
          </button>
        </div>
      </ng-template>

      <!-- ═══ Push stop-request dialog (non-blocking, кейс 3) ═══ -->
      <app-sparrow-stop-push-dialog
        [visible]="!!state.pendingStopPush"
        [productName]="state.pendingStopPush?.productName ?? ''"
        (confirm)="onStopPushConfirm()"
        (decline)="onStopPushDecline()">
      </app-sparrow-stop-push-dialog>

    </pos-dialog>
  `,
})
export class SparrowPluginDialogComponent {
  @Input() open = false;
  @Output() dialogClose = new EventEmitter<void>();

  state = inject(SparrowStateService);

  showStopListScreen = false;

  tabs: { key: SparrowTab; label: string }[] = [
    { key: 'active', label: 'Активные' },
    { key: 'cancelled', label: 'Отменённые' },
    { key: 'closed', label: 'Закрытые' },
  ];

  get emptyMessage(): string {
    switch (this.state.activeTab) {
      case 'active':    return 'Нет активных заказов';
      case 'cancelled': return 'Нет отменённых заказов';
      case 'closed':    return 'Нет закрытых заказов';
    }
  }

  onTabChange(tab: SparrowTab): void {
    this.state.activeTab = tab;
  }

  onToggleShift(): void {
    if (this.state.isOnShift && this.state.hasUnfulfilledOrders) {
      // Предупреждение: есть незавершённые заказы
      const confirm = window.confirm(
        'Есть незавершённые заказы. Вы уверены, что хотите выключить приём?'
      );
      if (!confirm) return;
    }
    this.state.isOnShift = !this.state.isOnShift;
  }

  onOrderAction(event: { orderId: number; status: SparrowOrderStatus }): void {
    this.state.updateStatus(event.orderId, event.status);

    // Inline-уведомление о действии
    const order = this.state.orders.find(o => o.id === event.orderId);
    const num = order?.number ?? `#${event.orderId}`;
    switch (event.status) {
      case 'accepted':
        this.state.showInlineMessage(`Заказ ${num} принят`);
        break;
      case 'preparing':
        this.state.showInlineMessage(`Заказ ${num} — начата готовка`);
        break;
      case 'ready':
        this.state.showInlineMessage(`Заказ ${num} приготовлен`);
        break;
      case 'completed':
        this.state.showInlineMessage(`Заказ ${num} завершён`);
        break;
      case 'cancelled_barista':
        this.state.showInlineMessage(`Заказ ${num} отменён`, 'error');
        break;
      case 'discarded':
        this.state.showInlineMessage(`Заказ ${num} — не забрали`, 'error');
        break;
    }
  }

  /** Количество продуктов на стопе (для бейджа) */
  get stoppedCount(): number {
    return this.state.stopList.filter(s => s.isStopped).length;
  }

  onStopPushConfirm(): void {
    this.state.confirmStopPush();
    this.state.showInlineMessage('Продукт поставлен на стоп');
  }

  onStopPushDecline(): void {
    this.state.declineStopPush();
  }
}
