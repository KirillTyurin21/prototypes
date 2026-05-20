import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { POS_COLORS, PosGuest } from '../types';
import { MOCK_GUESTS } from '../data/mock-delivery-orders';

/**
 * Модальное окно: Список гостей.
 * Overlay поверх экрана списка заказов при создании самовывоза.
 */
@Component({
  selector: 'pos-guest-list-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div *ngIf="open" class="absolute inset-0 z-50 flex items-center justify-center"
         [style.background-color]="colors.overlay">
      <div class="flex flex-col rounded overflow-hidden shadow-xl"
           style="width: 500px; max-height: 80%; background: #fff;">

        <!-- Заголовок -->
        <div class="text-center py-2 font-bold text-sm border-b"
             style="background: #f8f8f0; border-color: #ccc; color: #333;">
          Список гостей
        </div>

        <!-- Поле поиска -->
        <div class="px-3 py-2 border-b" style="border-color: #e0e0d8;">
          <input type="text"
                 class="w-full px-2 py-1.5 text-sm border rounded"
                 style="border-color: #ccc; color: #333;"
                 placeholder="Имя, т. +7 960 854-19-55"
                 [(ngModel)]="searchQuery">
        </div>

        <!-- Заголовок списка -->
        <div class="px-3 py-1 text-xs font-bold"
             style="background: #e8e07a; color: #333;">
          Имя
        </div>

        <!-- Список гостей -->
        <div class="flex-1 overflow-auto">
          <div *ngFor="let guest of filteredGuests"
               class="pos-guest-row px-3 py-2 text-sm cursor-pointer border-b"
               [class.selected]="selectedGuestId === guest.id"
               (click)="selectedGuestId = guest.id"
               style="border-color: #f0f0e8; color: #333;">
            {{ guest.name }}
          </div>
          <div *ngIf="filteredGuests.length === 0"
               class="px-3 py-4 text-sm text-gray-400 text-center">
            Нет гостей
          </div>
        </div>

        <!-- Нижняя панель -->
        <div class="flex items-stretch border-t" style="height: 48px; border-color: #ccc;">
          <button class="pos-dlg-btn" style="min-width: 36px;">
            <span style="font-size: 16px;">⌨</span>
          </button>
          <div class="flex-1" style="background: #e8e07a;"></div>
          <button class="pos-dlg-btn" style="min-width: 36px;">
            <lucide-icon name="x" [size]="16"></lucide-icon>
          </button>
          <button class="pos-dlg-btn" style="min-width: 36px;">
            <lucide-icon name="chevrons-up" [size]="16"></lucide-icon>
          </button>
          <button class="pos-dlg-btn text-xs font-medium" (click)="onNewGuest()">
            Новый гость
          </button>
          <button class="pos-dlg-btn text-xs font-bold" (click)="skip.emit()">
            Пропустить
          </button>
          <button class="pos-dlg-btn text-xs font-bold"
                  [class.disabled]="!selectedGuestId"
                  (click)="onOk()">
            ОК
          </button>
          <button class="pos-dlg-btn text-xs font-medium" (click)="dialogClose.emit()">
            Отмена
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .pos-guest-row { transition: background-color 0.1s; }
    .pos-guest-row:hover { background: #f8f8f0; }
    .pos-guest-row.selected { background: #e8e07a; }
    .pos-dlg-btn {
      display: flex; align-items: center; justify-content: center;
      padding: 0 12px; cursor: pointer; background: #f0f0e8;
      border-right: 1px solid #ccc; color: #333;
      transition: background-color 0.1s;
    }
    .pos-dlg-btn:last-child { border-right: none; }
    .pos-dlg-btn:hover { background: #e0e0d8; }
    .pos-dlg-btn:active { background: #b8c959 !important; }
    .pos-dlg-btn.disabled { opacity: 0.4; cursor: default; }
  `],
})
export class PosGuestListDialogComponent {
  @Input() open = false;
  @Output() dialogClose = new EventEmitter<void>();
  @Output() selectGuest = new EventEmitter<PosGuest>();
  @Output() skip = new EventEmitter<void>();

  colors = POS_COLORS;
  guests = MOCK_GUESTS;
  searchQuery = '';
  selectedGuestId: number | null = null;

  get filteredGuests(): PosGuest[] {
    if (!this.searchQuery) return this.guests;
    const q = this.searchQuery.toLowerCase();
    return this.guests.filter(g =>
      g.name.toLowerCase().includes(q) || g.phone.includes(q)
    );
  }

  onOk(): void {
    if (!this.selectedGuestId) return;
    const guest = this.guests.find(g => g.id === this.selectedGuestId);
    if (guest) this.selectGuest.emit(guest);
  }

  onNewGuest(): void {
    // Visual only for prototype
  }
}
