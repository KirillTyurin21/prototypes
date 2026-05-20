import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SparrowOrder, SparrowOrderStatus, STATUS_META } from '../types';

/**
 * Карточка заказа в окне плагина.
 *
 * Отображает: номер, имя покупателя, позиции, время выдачи,
 * итого, комментарий, статус-бейдж и кнопки действий.
 *
 * Кнопки зависят от статуса (раздел 9.2 спецификации):
 * - created  → Принять | Отменить
 * - accepted → (нет кнопок — ждёт CookingStarted из Front)
 * - preparing → (нет кнопок — ждёт CookingCompleted из Front)
 * - ready    → Завершить | Не забрали
 * - финальные → нет кнопок
 */
@Component({
  selector: 'app-sparrow-order-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border overflow-hidden transition-all"
         [style.border-color]="statusMeta.color + '40'"
         [style.background-color]="'#2d2d3d'">

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-2.5"
           [style.background-color]="statusMeta.color + '18'">
        <div class="flex items-center gap-2.5">
          <span class="text-sm font-bold text-white">{{ order.number }}</span>
          <span class="text-xs text-gray-400">{{ order.customerName }}</span>
        </div>
        <span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
              [style.background-color]="statusMeta.color + '30'"
              [style.color]="statusMeta.color">
          {{ statusMeta.label }}
        </span>
      </div>

      <!-- Body -->
      <div class="px-4 py-3">
        <!-- Items -->
        <div class="space-y-1 mb-3">
          <div *ngFor="let item of order.items"
               class="flex items-start justify-between text-xs">
            <div class="flex-1 min-w-0">
              <span class="text-gray-200">
                {{ item.quantity > 1 ? item.quantity + '× ' : '' }}{{ item.productName }}
              </span>
              <span class="text-gray-500 ml-1" *ngIf="item.size">({{ item.size }})</span>
              <div *ngIf="item.modifications.length" class="text-[10px] text-gray-500 mt-0.5">
                + {{ item.modifications.join(', ') }}
              </div>
            </div>
            <span class="text-gray-400 ml-2 shrink-0">{{ item.price }} ₽</span>
          </div>
        </div>

        <!-- Footer info row -->
        <div class="flex items-center justify-between text-xs border-t border-gray-700/50 pt-2">
          <div class="flex items-center gap-3">
            <span class="text-gray-500">
              Выдача:
              <span class="text-gray-300 font-medium">{{ pickupTimeFormatted }}</span>
            </span>
            <span *ngIf="isUrgent" class="text-[10px] text-orange-400 font-semibold">Срочный!</span>
          </div>
          <span class="text-gray-200 font-bold">{{ order.totalPrice }} ₽</span>
        </div>

        <!-- Comment -->
        <div *ngIf="order.comment"
             class="mt-2 text-[11px] text-gray-500 italic leading-tight">
          💬 {{ order.comment }}
        </div>
      </div>

      <!-- Actions -->
      <div *ngIf="showActions" class="flex border-t border-gray-700/50">
        <!-- created: Принять + Отменить -->
        <ng-container *ngIf="order.status === 'created'">
          <button (click)="onAction('accepted')"
                  [disabled]="loadingAction !== null"
                  class="flex-1 py-2.5 text-xs font-semibold text-center
                         text-green-400 hover:bg-green-400/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors cursor-pointer">
            <span *ngIf="loadingAction !== 'accepted'">Принять</span>
            <span *ngIf="loadingAction === 'accepted'" class="inline-flex items-center gap-1">
              <span class="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></span>
            </span>
          </button>
          <div class="w-px bg-gray-700/50"></div>
          <button (click)="onAction('cancelled_barista')"
                  [disabled]="loadingAction !== null"
                  class="flex-1 py-2.5 text-xs font-semibold text-center
                         text-red-400 hover:bg-red-400/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors cursor-pointer">
            <span *ngIf="loadingAction !== 'cancelled_barista'">Отменить</span>
            <span *ngIf="loadingAction === 'cancelled_barista'" class="inline-flex items-center gap-1">
              <span class="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></span>
            </span>
          </button>
        </ng-container>

        <!-- accepted: Готовить (эмуляция действия Front) -->
        <ng-container *ngIf="order.status === 'accepted'">
          <button (click)="onAction('preparing')"
                  [disabled]="loadingAction !== null"
                  class="flex-1 py-2.5 text-xs font-semibold text-center
                         text-blue-400 hover:bg-blue-400/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors cursor-pointer">
            <span *ngIf="loadingAction !== 'preparing'">🍳 Готовить</span>
            <span *ngIf="loadingAction === 'preparing'" class="inline-flex items-center gap-1">
              <span class="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></span>
            </span>
          </button>
        </ng-container>

        <!-- preparing: Приготовлен (эмуляция действия Front) -->
        <ng-container *ngIf="order.status === 'preparing'">
          <button (click)="onAction('ready')"
                  [disabled]="loadingAction !== null"
                  class="flex-1 py-2.5 text-xs font-semibold text-center
                         text-purple-400 hover:bg-purple-400/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors cursor-pointer">
            <span *ngIf="loadingAction !== 'ready'">✅ Приготовлен</span>
            <span *ngIf="loadingAction === 'ready'" class="inline-flex items-center gap-1">
              <span class="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></span>
            </span>
          </button>
        </ng-container>

        <!-- ready: Завершить + Не забрали -->
        <ng-container *ngIf="order.status === 'ready'">
          <button (click)="onAction('completed')"
                  [disabled]="loadingAction !== null"
                  class="flex-1 py-2.5 text-xs font-semibold text-center
                         text-green-400 hover:bg-green-400/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors cursor-pointer">
            <span *ngIf="loadingAction !== 'completed'">Завершить</span>
            <span *ngIf="loadingAction === 'completed'" class="inline-flex items-center gap-1">
              <span class="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></span>
            </span>
          </button>
          <div class="w-px bg-gray-700/50"></div>
          <button (click)="onAction('discarded')"
                  [disabled]="loadingAction !== null"
                  class="flex-1 py-2.5 text-xs font-semibold text-center
                         text-orange-400 hover:bg-orange-400/10
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors cursor-pointer">
            <span *ngIf="loadingAction !== 'discarded'">Не забрали</span>
            <span *ngIf="loadingAction === 'discarded'" class="inline-flex items-center gap-1">
              <span class="w-3 h-3 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></span>
            </span>
          </button>
        </ng-container>
      </div>
    </div>
  `,
})
export class SparrowOrderCardComponent {
  @Input() order!: SparrowOrder;
  @Output() action = new EventEmitter<{ orderId: number; status: SparrowOrderStatus }>();

  /** Статус, для которого сейчас идёт загрузка (spinner) */
  loadingAction: SparrowOrderStatus | null = null;

  get statusMeta() {
    return STATUS_META[this.order.status];
  }

  get showActions(): boolean {
    return ['created', 'accepted', 'preparing', 'ready'].includes(this.order.status);
  }

  /** Время выдачи в формате HH:MM */
  get pickupTimeFormatted(): string {
    const d = new Date(this.order.pickupTime);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  /** Заказ срочный (до выдачи < 5 мин) */
  get isUrgent(): boolean {
    const diff = new Date(this.order.pickupTime).getTime() - Date.now();
    return diff > 0 && diff < 5 * 60 * 1000 && !['completed', 'cancelled_barista', 'cancelled_customer', 'expired', 'discarded'].includes(this.order.status);
  }

  /** Обработчик кнопки с эмуляцией задержки API */
  onAction(status: SparrowOrderStatus): void {
    if (this.loadingAction) return;
    this.loadingAction = status;
    setTimeout(() => {
      this.action.emit({ orderId: this.order.id, status });
      this.loadingAction = null;
    }, 800);
  }
}
