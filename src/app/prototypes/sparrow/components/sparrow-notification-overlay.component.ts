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
                padding="md"
                [closable]="false">

      <ng-container *ngIf="notification">

        <!-- ═══ Новый заказ ═══ -->
        <ng-container *ngIf="notification.type === 'new_order'">
          <div class="flex flex-col items-center">
            <!-- Пульсирующий индикатор -->
            <div class="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 animate-pulse">
              <lucide-icon name="bell-ring" [size]="28" class="text-amber-400"></lucide-icon>
            </div>

            <h2 class="text-lg font-bold text-white mb-1">Новый заказ</h2>
            <span class="text-sm text-gray-400 mb-5">{{ notification.order.number }}</span>

            <!-- Информация о заказе -->
            <div class="w-full bg-[#252536] rounded-lg p-4 mb-5">
              <!-- Покупатель -->
              <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-700/50">
                <div class="flex items-center gap-2">
                  <lucide-icon name="user" [size]="14" class="text-gray-500"></lucide-icon>
                  <span class="text-sm text-gray-300">{{ notification.order.customerName }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <lucide-icon name="clock" [size]="14" class="text-gray-500"></lucide-icon>
                  <span class="text-sm text-gray-300 font-medium">{{ formatTime(notification.order.pickupTime) }}</span>
                </div>
              </div>

              <!-- Позиции -->
              <div class="space-y-2 mb-3">
                <div *ngFor="let item of notification.order.items"
                     class="flex items-start justify-between text-sm">
                  <div class="flex-1">
                    <span class="text-gray-200">
                      {{ item.quantity > 1 ? item.quantity + '× ' : '' }}{{ item.productName }}
                    </span>
                    <span class="text-gray-500 ml-1" *ngIf="item.size">({{ item.size }})</span>
                    <div *ngIf="item.modifications.length" class="text-xs text-gray-500 mt-0.5">
                      + {{ item.modifications.join(', ') }}
                    </div>
                  </div>
                  <span class="text-gray-400 ml-2 shrink-0">{{ item.price }} ₽</span>
                </div>
              </div>

              <!-- Итого -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-700/50">
                <span class="text-xs text-gray-500 uppercase">Итого</span>
                <span class="text-base text-white font-bold">{{ notification.order.totalPrice }} ₽</span>
              </div>

              <!-- Комментарий -->
              <div *ngIf="notification.order.comment"
                   class="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-500 italic">
                💬 {{ notification.order.comment }}
              </div>
            </div>

            <!-- Счётчик очереди -->
            <div *ngIf="queueSize > 0"
                 class="text-xs text-gray-500 mb-4">
              Ещё {{ queueSize }} {{ queueLabel }} в очереди
            </div>

            <!-- Кнопки -->
            <div class="flex w-full gap-3">
              <button (click)="onAccept()"
                      [disabled]="loading"
                      class="flex-1 py-3.5 rounded-lg text-sm font-semibold text-center
                             bg-green-600 text-white hover:bg-green-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors cursor-pointer">
                <span *ngIf="!loading">Принять</span>
                <span *ngIf="loading" class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Принятие...
                </span>
              </button>
              <button (click)="onDecline()"
                      [disabled]="loading"
                      class="flex-1 py-3.5 rounded-lg text-sm font-semibold text-center
                             bg-red-600/20 text-red-400 hover:bg-red-600/30
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors cursor-pointer">
                Отменить
              </button>
            </div>
          </div>
        </ng-container>

        <!-- ═══ Не забрали ═══ -->
        <ng-container *ngIf="notification.type === 'not_picked_up'">
          <div class="flex flex-col items-center">
            <!-- Индикатор -->
            <div class="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-4 animate-pulse">
              <lucide-icon name="alert-triangle" [size]="28" class="text-orange-400"></lucide-icon>
            </div>

            <h2 class="text-lg font-bold text-white mb-1">Заказ не забрали</h2>
            <span class="text-sm text-gray-400 mb-2">{{ notification.order.number }}</span>
            <span class="text-xs text-gray-500 mb-5">{{ notification.order.customerName }} · Время выдачи: {{ formatTime(notification.order.pickupTime) }}</span>

            <!-- Позиции (краткий список) -->
            <div class="w-full bg-[#252536] rounded-lg p-3 mb-5">
              <div *ngFor="let item of notification.order.items"
                   class="text-sm text-gray-300 py-1">
                {{ item.quantity > 1 ? item.quantity + '× ' : '' }}{{ item.productName }}
                <span class="text-gray-500" *ngIf="item.size">({{ item.size }})</span>
              </div>
            </div>

            <!-- Счётчик очереди -->
            <div *ngIf="queueSize > 0"
                 class="text-xs text-gray-500 mb-4">
              Ещё {{ queueSize }} {{ queueLabel }} в очереди
            </div>

            <!-- Кнопки -->
            <div class="flex w-full gap-3">
              <button (click)="onPickedUp()"
                      [disabled]="loading"
                      class="flex-1 py-3.5 rounded-lg text-sm font-semibold text-center
                             bg-green-600 text-white hover:bg-green-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors cursor-pointer">
                <span *ngIf="!loading">Выдать</span>
                <span *ngIf="loading" class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                </span>
              </button>
              <button (click)="onNotPickedUp()"
                      [disabled]="loading"
                      class="flex-1 py-3.5 rounded-lg text-sm font-semibold text-center
                             bg-orange-600/20 text-orange-400 hover:bg-orange-600/30
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors cursor-pointer">
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
