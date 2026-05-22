import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

/**
 * Неблокирующий диалог «Push стоп-запрос от Beanshe».
 *
 * Показывается поверх окна плагина (но не блокирует терминал).
 * Бариста может подтвердить (поставить на стоп) или отклонить.
 *
 * Источник: спецификация, раздел 4.6, кейс 3, требования 11–15
 */
@Component({
  selector: 'app-sparrow-stop-push-dialog',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div *ngIf="visible"
         class="absolute inset-0 z-40 flex items-center justify-center"
         style="background: rgba(0,0,0,0.5);">
      <div class="max-w-xs w-full mx-4 animate-fade-in" style="background: #404040;">

        <!-- Title (iiko style: gold italic) -->
        <div class="px-4 py-3 text-center" style="background: #333;">
          <span class="text-sm font-semibold italic" style="color: #c8b560;">
            Запрос на стоп
          </span>
        </div>

        <!-- Content -->
        <div class="px-4 py-4 text-center">
          <p class="text-xs mb-3" style="color: #ccc;">
            Система запрашивает остановку позиции:
          </p>

          <!-- Product name -->
          <div class="py-2 mb-3 text-center" style="border-top: 1px solid #555; border-bottom: 1px solid #555;">
            <span class="text-sm font-bold" style="color: #c8b560;">{{ productName }}</span>
          </div>

          <p class="text-[11px]" style="color: #888;">
            Подтвердите постановку на стоп или отклоните запрос.
          </p>
        </div>

        <!-- Footer (iiko style: dark bar with bold white buttons) -->
        <div class="flex" style="background: #2a2a2a; border-top: 1px solid #555;">
          <button (click)="onConfirm()"
                  [disabled]="loading"
                  class="flex-1 py-3 text-xs font-bold transition-colors cursor-pointer
                         disabled:opacity-50 flex items-center justify-center gap-1.5"
                  style="color: #fff; background: transparent; border-right: 1px solid #555;"
                  onmouseenter="this.style.background='#3a3a3a'"
                  onmouseleave="this.style.background='transparent'">
            <span *ngIf="loading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ loading ? '' : 'Да, на стоп' }}
          </button>
          <button (click)="onDecline()"
                  [disabled]="loading"
                  class="flex-1 py-3 text-xs font-bold transition-colors cursor-pointer
                         disabled:opacity-50"
                  style="color: #fff; background: transparent;"
                  onmouseenter="this.style.background='#3a3a3a'"
                  onmouseleave="this.style.background='transparent'">
            Отмена
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SparrowStopPushDialogComponent {
  @Input() visible = false;
  @Input() productName = '';

  @Output() confirm = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();

  loading = false;

  onConfirm(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.confirm.emit();
    }, 600);
  }

  onDecline(): void {
    this.decline.emit();
  }
}
