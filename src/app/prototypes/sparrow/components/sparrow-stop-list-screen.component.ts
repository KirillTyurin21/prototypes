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
    <div class="flex flex-col" style="height: 480px;">

      <!-- Header (iiko style) -->
      <div class="flex items-center justify-center px-4 py-3"
           style="background: #333;">
        <span class="text-base font-semibold italic" style="color: #c8b560;">
          Стоп-лист
        </span>
      </div>

      <!-- Description -->
      <div class="px-4 py-2" style="background: #383838; border-bottom: 1px solid #555;">
        <p class="text-[11px] leading-relaxed" style="color: #999;">
          Управление доступностью позиций меню. Продукты на стопе не отображаются покупателям в приложении.
        </p>
      </div>

      <!-- Products list -->
      <div class="flex-1 overflow-y-auto" style="background: #404040;">
        <div *ngFor="let item of state.stopList; trackBy: trackByProduct"
             class="flex items-center justify-between py-2.5 px-4 transition-colors"
             style="border-bottom: 1px solid #4a4a4a;">

          <!-- Product info -->
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-medium"
                  [style.color]="item.isStoppedInFront ? '#666' : item.isStopped ? '#ef5350' : '#ddd'">
              {{ item.productName }}
            </span>

            <!-- Label: stopped in Front -->
            <span *ngIf="item.isStoppedInFront"
                  class="text-[10px] flex items-center gap-1" style="color: #c8b560;">
              <lucide-icon name="lock" [size]="10"></lucide-icon>
              Уже в стоп-листе Front
            </span>

            <!-- Label: stop source -->
            <span *ngIf="item.isStopped && !item.isStoppedInFront && item.stopSource"
                  class="text-[10px]" style="color: #777;">
              {{ stopSourceLabel(item.stopSource) }}
            </span>
          </div>

          <!-- Toggle button -->
          <button (click)="onToggle(item)"
                  [disabled]="item.isStoppedInFront"
                  class="relative w-10 h-5 rounded-full transition-colors cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed"
                  [style.background]="item.isStopped ? '#ef5350' : '#666'">
            <span class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  [ngClass]="item.isStopped ? 'left-5' : 'left-0.5'"></span>
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="px-4 py-2" style="background: #383838; border-top: 1px solid #555;">
        <div class="flex items-center gap-4 text-[10px]" style="color: #888;">
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full" style="background: #ef5350;"></span>
            На стопе
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full" style="background: #666;"></span>
            Доступен
          </span>
          <span class="flex items-center gap-1">
            <lucide-icon name="lock" [size]="10" style="color: #c8b560;"></lucide-icon>
            Заблокировано Front
          </span>
        </div>
      </div>

      <!-- Footer (iiko style: dark bar) -->
      <div class="flex items-center justify-end px-1"
           style="background: #2a2a2a; border-top: 1px solid #555;">
        <button (click)="back.emit()"
                class="px-4 py-3 text-xs font-bold transition-colors cursor-pointer"
                style="color: #fff; background: transparent;"
                onmouseenter="this.style.background='#3a3a3a'"
                onmouseleave="this.style.background='transparent'">
          Назад
        </button>
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
