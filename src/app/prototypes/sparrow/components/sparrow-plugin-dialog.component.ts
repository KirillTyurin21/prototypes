import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { PosDialogComponent } from '@/components/pos-terminal';

import { SparrowStateService } from '../services/sparrow-state.service';
import { SparrowOrderCardComponent } from './sparrow-order-card.component';
import { SparrowStopListScreenComponent } from './sparrow-stop-list-screen.component';
import { SparrowStopPushDialogComponent } from './sparrow-stop-push-dialog.component';
import { SparrowTab } from '../types';

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
                padding="none"
                [closable]="false"
                [rounded]="false">

      <!-- ═══ Stop-list screen (replaces main content) ═══ -->
      <ng-container *ngIf="showStopListScreen; else ordersView">
        <app-sparrow-stop-list-screen
          (back)="showStopListScreen = false">
        </app-sparrow-stop-list-screen>
      </ng-container>

      <!-- ═══ Orders view (main) ═══ -->
      <ng-template #ordersView>
        <div class="flex flex-col" style="height: 480px;">

          <!-- ═══ Header (iiko style: dark bg, gold title) ═══ -->
          <div class="flex items-center justify-between px-4 py-3"
               style="background: #333;">
            <span class="text-base font-semibold italic" style="color: #c8b560;">
              Sparrow
            </span>

            <!-- Switch «На смене» -->
            <button (click)="onToggleShift()"
                    class="flex items-center gap-2 px-3 py-1.5 text-xs font-medium
                           transition-colors cursor-pointer select-none"
                    style="background: transparent;">
              <span class="w-2 h-2 rounded-full"
                    [style.background]="state.isOnShift ? '#4caf50' : '#777'"></span>
              <span [style.color]="state.isOnShift ? '#4caf50' : '#999'">
                {{ state.isOnShift ? 'На смене' : 'Не на смене' }}
              </span>
            </button>
          </div>

          <!-- ═══ Inline notification banner ═══ -->
          <div *ngIf="state.inlineMessage"
               class="px-4 py-2 text-xs font-medium flex items-center gap-2 animate-fade-in"
               [style.background]="state.inlineType === 'success' ? '#2e4a2e' : '#4a2e2e'"
               [style.color]="state.inlineType === 'success' ? '#8bc34a' : '#ef5350'">
            {{ state.inlineMessage }}
          </div>

          <!-- ═══ Tabs (iiko style: flat, minimal) ═══ -->
          <div class="flex" style="background: #383838; border-bottom: 1px solid #555;">
            <button *ngFor="let tab of tabs"
                    (click)="onTabChange(tab.key)"
                    class="px-5 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                    [style.background]="state.activeTab === tab.key ? '#4a4a4a' : 'transparent'"
                    [style.color]="state.activeTab === tab.key ? '#fff' : '#888'"
                    [style.border-bottom]="state.activeTab === tab.key ? '2px solid #c8b560' : '2px solid transparent'">
              {{ tab.label }}
              <span *ngIf="state.tabCounts[tab.key] > 0"
                    class="ml-1.5 text-[10px] font-bold"
                    [style.color]="state.activeTab === tab.key ? '#c8b560' : '#666'">
                ({{ state.tabCounts[tab.key] }})
              </span>
            </button>
          </div>

          <!-- ═══ Order list ═══ -->
          <div class="flex-1 overflow-y-auto" style="background: #404040;">

            <!-- Empty state -->
            <div *ngIf="state.filteredOrders.length === 0"
                 class="flex flex-col items-center justify-center py-12"
                 style="color: #777;">
              <span class="text-sm">{{ emptyMessage }}</span>
            </div>

            <!-- Order cards -->
            <app-sparrow-order-card
              *ngFor="let order of state.filteredOrders"
              [order]="order">
            </app-sparrow-order-card>
          </div>

          <!-- ═══ Footer (iiko style: dark bar with bold white buttons) ═══ -->
          <div class="flex items-center justify-between px-1"
               style="background: #2a2a2a; border-top: 1px solid #555;">
            <button (click)="showStopListScreen = true"
                    class="px-4 py-3 text-xs font-bold transition-colors cursor-pointer"
                    style="color: #fff; background: transparent;"
                    onmouseenter="this.style.background='#3a3a3a'"
                    onmouseleave="this.style.background='transparent'">
              Стоп-лист
              <span *ngIf="stoppedCount > 0"
                    class="ml-1 text-[10px] font-bold" style="color: #c8b560;">
                ({{ stoppedCount }})
              </span>
            </button>
            <button (click)="dialogClose.emit()"
                    class="px-4 py-3 text-xs font-bold transition-colors cursor-pointer"
                    style="color: #fff; background: transparent;"
                    onmouseenter="this.style.background='#3a3a3a'"
                    onmouseleave="this.style.background='transparent'">
              Закрыть
            </button>
          </div>

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
  ];

  get emptyMessage(): string {
    switch (this.state.activeTab) {
      case 'active':    return 'Нет активных заказов';
      case 'cancelled': return 'Нет отменённых заказов';
      default:          return '';
    }
  }

  onTabChange(tab: SparrowTab): void {
    this.state.activeTab = tab;
  }

  onToggleShift(): void {
    if (this.state.isOnShift && this.state.hasUnfulfilledOrders) {
      // Спецификация 4.1.1.2: есть незавершённые заказы → НЕ переключать, показать предупреждение
      this.state.showInlineMessage(
        'Невозможно выключить приём: есть незавершённые заказы',
        'error'
      );
      return;
    }
    this.state.isOnShift = !this.state.isOnShift;
    this.state.addLog(
      'POST',
      this.state.isOnShift ? '/api/v2/barista/shift/start' : '/api/v2/barista/shift/end',
      'success',
      this.state.isOnShift ? 'Приём заказов включён' : 'Приём заказов выключен'
    );
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
