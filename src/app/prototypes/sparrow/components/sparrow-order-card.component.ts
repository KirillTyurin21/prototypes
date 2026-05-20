import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SparrowOrder, SparrowOrderStatus, STATUS_META } from '../types';

/**
 * Карточка заказа в окне плагина (READ-ONLY).
 *
 * Отображает: номер, имя покупателя, позиции, время выдачи,
 * итого, комментарий, статус-бейдж.
 *
 * Все действия (готовить, приготовлен, завершить) выполняются
 * через кассовый терминал Front, а не через UI плагина.
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
    </div>
  `,
})
export class SparrowOrderCardComponent {
  @Input() order!: SparrowOrder;

  get statusMeta() {
    return STATUS_META[this.order.status];
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
}
