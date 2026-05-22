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
    <div class="overflow-hidden transition-all"
         style="border-bottom: 1px solid #555; background: #404040;">

      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-2"
           style="background: #383838;">
        <div class="flex items-center gap-2.5">
          <span class="text-sm font-bold text-white">{{ order.number }}</span>
          <span class="text-xs" style="color: #999;">{{ order.customerName }}</span>
        </div>
        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
              [style.color]="statusMeta.color">
          {{ statusMeta.label }}
        </span>
      </div>

      <!-- Body -->
      <div class="px-4 py-2.5">
        <!-- Items -->
        <div class="space-y-1 mb-2">
          <div *ngFor="let item of order.items"
               class="flex items-start justify-between text-xs">
            <div class="flex-1 min-w-0">
              <span style="color: #ddd;">
                {{ item.quantity > 1 ? item.quantity + '× ' : '' }}{{ item.productName }}
              </span>
              <span style="color: #777;" *ngIf="item.size">({{ item.size }})</span>
              <div *ngIf="item.modifications.length" class="text-[10px] mt-0.5" style="color: #777;">
                + {{ item.modifications.join(', ') }}
              </div>
            </div>
            <span class="ml-2 shrink-0" style="color: #999;">{{ item.price }} ₽</span>
          </div>
        </div>

        <!-- Footer info row -->
        <div class="flex items-center justify-between text-xs pt-2"
             style="border-top: 1px solid #555;">
          <div class="flex items-center gap-3">
            <span style="color: #888;">
              Выдача:
              <span class="font-medium" style="color: #ccc;">{{ pickupTimeFormatted }}</span>
            </span>
            <span *ngIf="isUrgent" class="text-[10px] font-bold" style="color: #ff9800;">Срочный!</span>
          </div>
          <span class="font-bold" style="color: #fff;">{{ order.totalPrice }} ₽</span>
        </div>

        <!-- Comment -->
        <div *ngIf="order.comment"
             class="mt-2 text-[11px] italic leading-tight" style="color: #888;">
          {{ order.comment }}
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
