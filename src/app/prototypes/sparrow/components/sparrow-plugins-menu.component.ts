import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosDialogComponent } from '@/components/pos-terminal';

/**
 * Меню выбора плагинов — появляется при нажатии «Дополнения» в нижней панели терминала.
 *
 * Воспроизводит стандартный вид меню «ПЛАГИНЫ» из Front:
 * сетка 3×N кнопок с названиями + кнопка «Отмена» внизу.
 *
 * Единственный активный плагин — Beanshe: Заказы. Остальные ячейки пустые (заглушки).
 */
@Component({
  selector: 'app-sparrow-plugins-menu',
  standalone: true,
  imports: [CommonModule, PosDialogComponent],
  template: `
    <pos-dialog [open]="open" maxWidth="lg" theme="light" padding="sm"
                [closable]="false">
      <!-- Заголовок -->
      <div class="text-center font-bold text-base tracking-wide py-3 border-b border-gray-200 mb-0"
           style="color: #333;">
        ПЛАГИНЫ
      </div>

      <!-- Сетка плагинов 3 колонки -->
      <div class="grid grid-cols-3 border-l border-t border-gray-200">
        <!-- Beanshe: Заказы — единственный активный -->
        <button (click)="selectPlugin.emit('beanshe')"
                class="py-5 px-3 text-center text-sm border-r border-b border-gray-200
                       hover:bg-blue-50 transition-colors cursor-pointer">
          Beanshe: Заказы
        </button>

        <!-- Пустые ячейки-заглушки (как на реальном терминале) -->
        <div *ngFor="let _ of emptySlots"
             class="py-5 px-3 border-r border-b border-gray-200">
        </div>
      </div>

      <!-- Кнопка Отмена -->
      <button (click)="dialogClose.emit()"
              class="w-full py-4 text-center font-bold text-base text-gray-800
                     bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer
                     border-t border-gray-300 mt-0">
        Отмена
      </button>
    </pos-dialog>
  `,
})
export class SparrowPluginsMenuComponent {
  @Input() open = false;

  @Output() selectPlugin = new EventEmitter<string>();
  @Output() dialogClose = new EventEmitter<void>();

  /** 17 пустых слотов (1 занят + 17 = 18 = 6 рядов × 3 колонки) */
  emptySlots = new Array(17);
}
