import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { POS_COLORS, PosHall } from '../types';
import { MOCK_HALLS } from '../data/mock-delivery-orders';

/**
 * Экран 1: Управление столами.
 * Точка входа модуля «Заказы» — отображает залы и столы ресторана.
 */
@Component({
  selector: 'pos-tables-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex flex-col h-full" [style.background-color]="colors.terminalBg">

      <!-- Верхняя панель (грузовичок, меню, замок) -->
      <div class="flex items-center justify-end px-4 shrink-0"
           [style.background-color]="colors.bottomBarBg"
           style="height: 56px;">
        <div class="flex items-center gap-5">
          <!-- Грузовичок с красной точкой -->
          <button class="pos-icon-btn relative" (click)="navigate.emit('delivery-list')">
            <lucide-icon name="truck" [size]="24" class="text-gray-300"></lucide-icon>
            <span class="absolute -top-1 -right-1 bg-red-600 rounded-full"
                  style="width: 8px; height: 8px;"></span>
          </button>
          <!-- Бургер-меню -->
          <button class="pos-icon-btn">
            <lucide-icon name="menu" [size]="26" class="text-gray-300"></lucide-icon>
          </button>
          <!-- Замок -->
          <button class="pos-icon-btn">
            <lucide-icon name="lock" [size]="22" class="text-gray-300"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Залы и столы -->
      <div class="flex-1 overflow-auto p-0">
        <div *ngFor="let hall of halls" class="flex items-stretch border-b"
             style="border-color: #555;">
          <!-- Счётчик -->
          <div class="flex items-center justify-center shrink-0 text-xs font-medium border-r"
               style="width: 48px; background: #fff; border-color: #c8c8c0; color: #333;">
            <span *ngIf="getOccupied(hall) > 0" style="color: #8b6914;">{{ getOccupied(hall) }}/{{ hall.tables.length }}</span>
            <span *ngIf="getOccupied(hall) === 0">{{ hall.tables.length }}</span>
          </div>
          <!-- Название зала -->
          <div class="flex items-center px-3 shrink-0 text-sm font-medium border-r"
               [style.background-color]="hall.id === 1 ? '#e8e07a' : '#e0e0d8'"
               style="width: 180px; border-color: #c8c8c0; color: #333;">
            {{ hall.name }}
          </div>
          <!-- Столы -->
          <div class="flex items-center gap-1 px-2 py-2 flex-wrap">
            <button *ngFor="let table of hall.tables"
                    class="pos-table-btn flex items-center justify-center text-sm font-medium"
                    [class.occupied]="table.occupied"
                    (click)="onTableClick(hall, table)">
              {{ table.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Нижняя панель -->
      <div class="flex items-stretch shrink-0 border-t border-gray-700 select-none"
           [style.background-color]="colors.bottomBarBg" style="height: 64px;">
        <button class="pos-bottom-btn" (click)="navigate.emit('back')">
          <lucide-icon name="chevron-left" [size]="22"></lucide-icon>
          <span>НАЗАД</span>
        </button>
        <button class="pos-bottom-btn">
          <span style="font-size: 18px;">💡</span>
          <span>ЦВЕТ СТОЛА</span>
        </button>
        <div class="flex-1"></div>
        <button class="pos-bottom-btn active-btn">
          <lucide-icon name="layout-grid" [size]="20"></lucide-icon>
          <span>СХЕМА ЗАЛА</span>
        </button>
        <button class="pos-bottom-btn">
          <span style="font-size: 16px;">🍴</span>
          <span>ВСЕ СТОЛЫ</span>
        </button>
        <button class="pos-bottom-btn">
          <lucide-icon name="users" [size]="20"></lucide-icon>
          <span>ПО ОФИЦИАНТАМ</span>
        </button>
        <button class="pos-bottom-btn">
          <lucide-icon name="receipt" [size]="20"></lucide-icon>
          <span>БЫСТРЫЙ ЧЕК</span>
        </button>
        <button class="pos-bottom-btn">
          <lucide-icon name="clock" [size]="20"></lucide-icon>
          <span>РЕЗЕРВОВ: 0</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .pos-icon-btn {
      cursor: pointer; padding: 4px; border-radius: 4px;
      transition: background-color 0.1s;
    }
    .pos-icon-btn:hover { background-color: rgba(255,255,255,0.1); }
    .pos-icon-btn:active { background-color: #b8c959 !important; }
    .pos-table-btn {
      width: 56px; height: 56px; border: 1px solid #888;
      background: #4a4a4a; color: #ddd; cursor: pointer;
      transition: background-color 0.1s;
    }
    .pos-table-btn:hover { background: #555; }
    .pos-table-btn:active { background: #b8c959 !important; color: #1a1a1a !important; }
    .pos-table-btn.occupied { background: #4a7ab5; color: #fff; border-color: #6a9ad5; }
    .pos-bottom-btn {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px; color: #fff; padding: 0 16px; min-width: 72px;
      cursor: pointer; transition: background-color 0.1s; font-size: 10px;
      font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .pos-bottom-btn:hover { background-color: #383838; }
    .pos-bottom-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
    .active-btn { background-color: #e8e07a !important; color: #1a1a1a !important; }
    .active-btn:active { background-color: #b8c959 !important; }
  `],
})
export class PosTablesScreenComponent {
  @Output() navigate = new EventEmitter<string>();

  colors = POS_COLORS;
  halls = MOCK_HALLS;

  getOccupied(hall: PosHall): number {
    return hall.tables.filter(t => t.occupied).length;
  }

  onTableClick(hall: PosHall, table: any): void {
    console.log('[Tables] Table click:', hall.name, table.name);
  }
}
