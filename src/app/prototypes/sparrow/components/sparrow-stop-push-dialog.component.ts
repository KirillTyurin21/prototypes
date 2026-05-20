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
      <div class="bg-[#2a2a3e] border border-gray-600 rounded-xl p-5 shadow-xl max-w-xs w-full mx-4
                  animate-fade-in">
        <!-- Icon -->
        <div class="flex justify-center mb-3">
          <div class="w-10 h-10 rounded-full bg-orange-600 bg-opacity-20 flex items-center justify-center">
            <lucide-icon name="alert-triangle" [size]="20" class="text-orange-400"></lucide-icon>
          </div>
        </div>

        <!-- Title -->
        <h3 class="text-sm font-semibold text-white text-center mb-1">
          Запрос на стоп
        </h3>

        <!-- Description -->
        <p class="text-xs text-gray-400 text-center mb-4 leading-relaxed">
          Система запрашивает остановку позиции:
        </p>

        <!-- Product name -->
        <div class="bg-gray-700 bg-opacity-40 rounded-lg px-3 py-2 mb-4 text-center">
          <span class="text-sm font-medium text-orange-300">{{ productName }}</span>
        </div>

        <p class="text-[11px] text-gray-500 text-center mb-4">
          Подтвердите постановку на стоп или отклоните запрос.
        </p>

        <!-- Buttons -->
        <div class="flex gap-2">
          <button (click)="onDecline()"
                  [disabled]="loading"
                  class="flex-1 px-3 py-2 rounded-lg text-xs font-medium
                         bg-gray-600 text-gray-300 hover:bg-gray-500
                         disabled:opacity-50 transition-colors cursor-pointer">
            Нет
          </button>
          <button (click)="onConfirm()"
                  [disabled]="loading"
                  class="flex-1 px-3 py-2 rounded-lg text-xs font-medium
                         bg-orange-600 text-white hover:bg-orange-500
                         disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
            <span *ngIf="loading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {{ loading ? '' : 'Да, на стоп' }}
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
