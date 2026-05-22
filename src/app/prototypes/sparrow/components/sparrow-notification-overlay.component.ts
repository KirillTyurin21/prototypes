import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { PosDialogComponent } from '@/components/pos-terminal';
import { SparrowNotification, SparrowOrder, STATUS_META } from '../types';

/**
 * Блокирующая нотификация — overlay поверх всего терминала.
 *
 * Два варианта:
 * - «Новый заказ»: полная информация + Принять / Отменить
 * - «Не забрали»: краткая информация + Выдать / Не забрали
 *
 * Источник: спецификация, раздел 9.3 + 4.3
 * FIFO-очередь: при нескольких нотификациях — показываем одну,
 * остальные ждут. Контроль очереди — в main-screen.
 */
@Component({
  selector: 'app-sparrow-notification-overlay',
  standalone: true,
  imports: [CommonModule, IconsModule, PosDialogComponent],
  template: `
    <pos-dialog [open]="!!notification"
                maxWidth="md"
                theme="dark"
                padding="none"
                [closable]="false"
                [rounded]="false">

      <ng-container *ngIf="notification">

        <!-- ═══ Новый заказ ═══ -->
        <ng-container *ngIf="notification.type === 'new_order'">
          <div class="flex flex-col">
            <!-- Header (iiko style) -->
            <div class="px-4 py-3 text-center" style="background: #333;">
              <span class="text-base font-semibold italic" style="color: #c8b560;">
                Новый заказ
              </span>
              <div class="text-xs mt-0.5" style="color: #999;">{{ notification.order.number }}</div>
            </div>

            <!-- Информация о заказе -->
            <div class="px-4 py-3" style="background: #404040;">
              <!-- Покупатель + время -->
              <div class="flex items-center justify-between mb-3 pb-2" style="border-bottom: 1px solid #555;">
                <span class="text-sm" style="color: #ddd;">{{ notification.order.customerName }}</span>
                <span class="text-sm font-medium" style="color: #c8b560;">{{ formatTime(notification.order.pickupTime) }}</span>
              </div>

              <!-- Позиции -->
              <div class="space-y-1.5 mb-3">
                <div *ngFor="let item of notification.order.items"
                     class="flex items-start justify-between text-sm">
                  <div class="flex-1">
                    <span style="color: #ddd;">
                      {{ item.quantity > 1 ? item.quantity + '× ' : '' }}{{ item.productName }}
                    </span>
                    <span style="color: #777;" *ngIf="item.size">({{ item.size }})</span>
                    <div *ngIf="item.modifications.length" class="text-xs mt-0.5" style="color: #777;">
                      + {{ item.modifications.join(', ') }}
                    </div>
                  </div>
                  <span class="ml-2 shrink-0" style="color: #999;">{{ item.price }} ₽</span>
                </div>
              </div>

              <!-- Итого -->
              <div class="flex items-center justify-between pt-2" style="border-top: 1px solid #555;">
                <span class="text-xs uppercase" style="color: #888;">Итого</span>
                <span class="text-base font-bold" style="color: #fff;">{{ notification.order.totalPrice }} ₽</span>
              </div>

              <!-- Комментарий -->
              <div *ngIf="notification.order.comment"
                   class="mt-2 pt-2 text-xs italic" style="border-top: 1px solid #555; color: #888;">
                {{ notification.order.comment }}
              </div>
            </div>

            <!-- Счётчик очереди -->
            <div *ngIf="queueSize > 0"
                 class="text-xs text-center py-2" style="color: #888; background: #3a3a3a;">
              Ещё {{ queueSize }} {{ queueLabel }} в очереди
            </div>

            <!-- Footer (iiko style: dark bar with bold white buttons) -->
            <div class="flex" style="background: #2a2a2a; border-top: 1px solid #555;">
              <button (click)="onAccept()"
                      [disabled]="loading"
                      class="flex-1 py-3 text-sm font-bold transition-colors cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style="color: #fff; background: transparent; border-right: 1px solid #555;"
                      onmouseenter="this.style.background='#3a3a3a'"
                      onmouseleave="this.style.background='transparent'">
                <span *ngIf="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ loading ? 'Принятие...' : 'Принять' }}
              </button>
              <button (click)="onDecline()"
                      [disabled]="loading"
                      class="flex-1 py-3 text-sm font-bold transition-colors cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed"
                      style="color: #fff; background: transparent;"
                      onmouseenter="this.style.background='#3a3a3a'"
                      onmouseleave="this.style.background='transparent'">
                Отменить
              </button>
            </div>
          </div>
        </ng-container>

        <!-- ═══ Не забрали ═══ -->
        <ng-container *ngIf="notification.type === 'not_picked_up'">
          <div class="flex flex-col">
            <!-- Header (iiko style) -->
            <div class="px-4 py-3 text-center" style="background: #333;">
              <span class="text-base font-semibold italic" style="color: #c8b560;">
                Заказ не забрали
              </span>
              <div class="text-xs mt-0.5" style="color: #999;">
                {{ notification.order.number }} · {{ notification.order.customerName }}
              </div>
            </div>

            <!-- Информация -->
            <div class="px-4 py-3" style="background: #404040;">
              <div class="text-xs mb-3" style="color: #888;">
                Время выдачи: <span style="color: #c8b560;">{{ formatTime(notification.order.pickupTime) }}</span>
              </div>

              <!-- Позиции (краткий список) -->
              <div style="border-top: 1px solid #555; border-bottom: 1px solid #555;">
                <div *ngFor="let item of notification.order.items"
                     class="text-sm py-1.5 px-1" style="color: #ddd; border-bottom: 1px solid #4a4a4a;">
                  {{ item.quantity > 1 ? item.quantity + '× ' : '' }}{{ item.productName }}
                  <span style="color: #777;" *ngIf="item.size">({{ item.size }})</span>
                </div>
              </div>
            </div>

            <!-- Счётчик очереди -->
            <div *ngIf="queueSize > 0"
                 class="text-xs text-center py-2" style="color: #888; background: #3a3a3a;">
              Ещё {{ queueSize }} {{ queueLabel }} в очереди
            </div>

            <!-- Footer (iiko style) -->
            <div class="flex" style="background: #2a2a2a; border-top: 1px solid #555;">
              <button (click)="onPickedUp()"
                      [disabled]="loading"
                      class="flex-1 py-3 text-sm font-bold transition-colors cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style="color: #fff; background: transparent; border-right: 1px solid #555;"
                      onmouseenter="this.style.background='#3a3a3a'"
                      onmouseleave="this.style.background='transparent'">
                <span *ngIf="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ loading ? '' : 'Выдать' }}
              </button>
              <button (click)="onNotPickedUp()"
                      [disabled]="loading"
                      class="flex-1 py-3 text-sm font-bold transition-colors cursor-pointer
                             disabled:opacity-50 disabled:cursor-not-allowed"
                      style="color: #fff; background: transparent;"
                      onmouseenter="this.style.background='#3a3a3a'"
                      onmouseleave="this.style.background='transparent'">
                Не забрали
              </button>
            </div>
          </div>
        </ng-container>

      </ng-container>
    </pos-dialog>
  `,
})
export class SparrowNotificationOverlayComponent implements OnChanges {
  /** Текущая нотификация (null = скрыта) */
  @Input() notification: SparrowNotification | null = null;

  /** Размер оставшейся очереди (для индикатора) */
  @Input() queueSize = 0;

  /** Новый заказ: принять */
  @Output() accept = new EventEmitter<number>();
  /** Новый заказ: отменить */
  @Output() decline = new EventEmitter<number>();
  /** Не забрали: выдать */
  @Output() pickedUp = new EventEmitter<number>();
  /** Не забрали: списать */
  @Output() notPickedUp = new EventEmitter<number>();

  loading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notification']) {
      this.loading = false;
    }
  }

  get queueLabel(): string {
    const n = this.queueSize;
    if (n === 1) return 'уведомление';
    if (n >= 2 && n <= 4) return 'уведомления';
    return 'уведомлений';
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  onAccept(): void {
    if (!this.notification || this.loading) return;
    this.loading = true;
    // Эмуляция задержки API (1 сек)
    setTimeout(() => {
      this.accept.emit(this.notification!.orderId);
      this.loading = false;
    }, 800);
  }

  onDecline(): void {
    if (!this.notification || this.loading) return;
    this.loading = true;
    setTimeout(() => {
      this.decline.emit(this.notification!.orderId);
      this.loading = false;
    }, 800);
  }

  onPickedUp(): void {
    if (!this.notification || this.loading) return;
    this.loading = true;
    setTimeout(() => {
      this.pickedUp.emit(this.notification!.orderId);
      this.loading = false;
    }, 800);
  }

  onNotPickedUp(): void {
    if (!this.notification || this.loading) return;
    this.loading = true;
    setTimeout(() => {
      this.notPickedUp.emit(this.notification!.orderId);
      this.loading = false;
    }, 800);
  }
}
