import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

import { SparrowStateService } from '../services/sparrow-state.service';
import { SparrowStopListItem } from '../types';

/**
 * Экран стоп-листа Sparrow.
 *
 * Полноэкранная замена контента окна плагина.
 * Показывает список продуктов Beanshe с toggle-переключателями.
 *
 * Кейсы:
 * - Кейс 1 (ручной): бариста переключает toggle → API-лог
 * - Кейс 3 (push): бэкенд отправляет запрос, бариста видит диалог
 * - Метка «Уже в стоп-листе Front»: toggle заблокирован
 *
 * Источник: спецификация, раздел 4.6, раздел 9.4
 */
@Component({
  selector: 'app-sparrow-stop-list-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <!-- Header -->
    <div class="flex items-center gap-3 px-4 pt-3 pb-2">
      <button (click)="back.emit()"
              class="flex items-center gap-1 text-gray-400 hover:text-white transition-colors
                     text-xs cursor-pointer">
        <lucide-icon name="arrow-left" [size]="14"></lucide-icon>
        Назад
      </button>
      <div class="flex-1"></div>
      <span class="text-sm font-semibold text-white flex items-center gap-2">
        <lucide-icon name="ban" [size]="16" class="text-orange-400"></lucide-icon>
        Стоп-лист
      </span>
      <div class="flex-1"></div>
      <div class="w-10"></div> <!-- spacer -->
    </div>

    <!-- Description -->
    <div class="px-4 pb-3">
      <p class="text-[11px] text-gray-500 leading-relaxed">
        Управление доступностью позиций меню. Продукты на стопе не отображаются покупателям в приложении.
      </p>
    </div>

    <!-- Products list -->
    <div class="flex-1 overflow-y-auto px-4 space-y-1" style="max-height: 380px;">
      <div *ngFor="let item of state.stopList; trackBy: trackByProduct"
           class="flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors"
           [ngClass]="item.isStoppedInFront
             ? 'bg-gray-700 bg-opacity-30'
             : item.isStopped
               ? 'bg-red-900 bg-opacity-15 hover:bg-red-900 hover:bg-opacity-20'
               : 'hover:bg-gray-700 hover:bg-opacity-30'">

        <!-- Product info -->
        <div class="flex flex-col gap-0.5">
          <span class="text-sm font-medium"
                [class.text-white]="!item.isStopped && !item.isStoppedInFront"
                [class.text-red-400]="item.isStopped && !item.isStoppedInFront"
                [class.text-gray-500]="item.isStoppedInFront">
            {{ item.productName }}
          </span>

          <!-- Label: stopped in Front -->
          <span *ngIf="item.isStoppedInFront"
                class="text-[10px] text-yellow-500 flex items-center gap-1">
            <lucide-icon name="lock" [size]="10"></lucide-icon>
            Уже в стоп-листе Front
          </span>

          <!-- Label: stop source -->
          <span *ngIf="item.isStopped && !item.isStoppedInFront && item.stopSource"
                class="text-[10px] text-gray-500">
            {{ stopSourceLabel(item.stopSource) }}
          </span>
        </div>

        <!-- Toggle button -->
        <button (click)="onToggle(item)"
                [disabled]="item.isStoppedInFront"
                class="relative w-10 h-5 rounded-full transition-colors cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed"
                [ngClass]="item.isStopped
                  ? 'bg-red-600'
                  : 'bg-gray-600'">
          <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                [ngClass]="item.isStopped ? 'left-5' : 'left-0.5'"></span>
        </button>
      </div>
    </div>

    <!-- Legend -->
    <div class="px-4 pt-3 pb-2 border-t border-gray-700 mt-3">
      <div class="flex items-center gap-4 text-[10px] text-gray-500">
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-red-600"></span>
          На стопе
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-gray-600"></span>
          Доступен
        </span>
        <span class="flex items-center gap-1">
          <lucide-icon name="lock" [size]="10" class="text-yellow-500"></lucide-icon>
          Заблокировано Front
        </span>
      </div>
    </div>
  `,
})
export class SparrowStopListScreenComponent {
  @Output() back = new EventEmitter<void>();

  state = inject(SparrowStateService);

  trackByProduct(_index: number, item: SparrowStopListItem): number {
    return item.productId;
  }

  onToggle(item: SparrowStopListItem): void {
    if (item.isStoppedInFront) return;
    this.state.toggleStopItem(item.productId);
  }

  stopSourceLabel(source: string | null): string {
    switch (source) {
      case 'manual':       return 'Остановлено вручную';
      case 'backend_push': return 'Запрос от системы';
      case 'auto_sync':    return 'Автосинхронизация';
      default:             return '';
    }
  }
}
