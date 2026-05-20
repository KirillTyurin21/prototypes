import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { POS_COLORS, DeliveryOrder, DeliveryOrderStatus, DELIVERY_STATUS_META } from '../types';

type FilterTab = {
  status: DeliveryOrderStatus;
  label: string;
  isDark: boolean;
};

const FILTER_TABS: FilterTab[] = [
  { status: 'unconfirmed', label: 'Неподтв.', isDark: false },
  { status: 'new',         label: 'Новые',    isDark: false },
  { status: 'cooking',     label: 'Готовится', isDark: false },
  { status: 'ready',       label: 'Готовы',    isDark: false },
  { status: 'on-the-way',  label: 'В пути',   isDark: false },
  { status: 'closed',      label: 'Закр-е',   isDark: true },
  { status: 'cancelled',   label: 'Отмена',   isDark: true },
];

/**
 * Экран 2: Список доставочных заказов.
 * Фильтры по статусам, таблица заказов, дата-навигация.
 */
@Component({
  selector: 'pos-delivery-list-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex flex-col h-full" [style.background-color]="colors.terminalBg">

      <!-- Верхняя панель: ТИПЫ ЗАКАЗОВ, дата, иконки -->
      <div class="flex items-center shrink-0 px-2"
           [style.background-color]="colors.bottomBarBg" style="height: 56px;">
        <!-- ТИПЫ ЗАКАЗОВ -->
        <button class="pos-toolbar-btn">
          <lucide-icon name="filter" [size]="22" class="text-gray-300"></lucide-icon>
          <span class="text-[10px] text-gray-300 mt-0.5">ТИПЫ ЗАКАЗОВ</span>
        </button>

        <!-- Дата-навигация -->
        <div class="flex items-center gap-2 mx-auto">
          <button class="pos-icon-btn" (click)="changeDate(-1)">
            <lucide-icon name="chevron-left" [size]="22" class="text-gray-300"></lucide-icon>
          </button>
          <div class="text-center">
            <div class="text-white font-bold text-sm">{{ currentDateDisplay }}</div>
            <div class="text-gray-400 text-[10px]">(Сегодня)</div>
          </div>
          <button class="pos-icon-btn" (click)="changeDate(1)">
            <lucide-icon name="chevron-right" [size]="22" class="text-gray-300"></lucide-icon>
          </button>
        </div>

        <!-- Правые иконки -->
        <div class="flex items-center gap-4">
          <button class="pos-toolbar-btn">
            <lucide-icon name="calendar-check" [size]="20" class="text-gray-300"></lucide-icon>
            <span class="text-[10px] text-gray-300 mt-0.5">ДАТА</span>
          </button>
          <button class="pos-icon-btn">
            <lucide-icon name="layout-grid" [size]="20" class="text-gray-300"></lucide-icon>
          </button>
          <button class="pos-icon-btn">
            <lucide-icon name="menu" [size]="24" class="text-gray-300"></lucide-icon>
          </button>
          <button class="pos-icon-btn">
            <lucide-icon name="lock" [size]="20" class="text-gray-300"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Фильтры-вкладки -->
      <div class="flex items-stretch shrink-0" style="height: 36px;">
        <button *ngFor="let tab of filterTabs"
                class="pos-filter-tab flex-1 flex items-center justify-center text-xs font-bold"
                [class.active]="isActiveFilter(tab.status)"
                [class.dark-tab]="tab.isDark"
                (click)="toggleFilter(tab.status)">
          {{ tab.label }} {{ getStatusCount(tab.status) }}
        </button>
      </div>

      <!-- Заголовок таблицы -->
      <div class="flex items-center shrink-0 text-[11px] font-medium px-2"
           style="height: 28px; background: #8a9baa; color: #333;">
        <span style="width: 60px;">№ ▲</span>
        <span style="width: 80px;">Статус</span>
        <span style="width: 120px;">Время доставки</span>
        <span style="width: 100px;">Адрес</span>
        <span style="width: 80px;">Курьер</span>
        <span style="flex: 1;">Клиент</span>
        <span style="width: 90px;">Коммент.</span>
        <span style="width: 80px; text-align: right;">Сумма, р.</span>
      </div>

      <!-- Тело таблицы -->
      <div class="flex-1 overflow-auto">
        <div *ngIf="filteredOrders.length === 0"
             class="flex items-center justify-center h-full text-gray-500 text-sm">
          Нет заказов
        </div>

        <div *ngFor="let order of filteredOrders"
             class="pos-order-row"
             [class.selected]="selectedOrderId === order.id"
             (click)="onOrderClick(order)">
          <!-- Основная строка -->
          <div class="flex items-center px-2" style="min-height: 52px;">
            <span class="font-bold text-sm" style="width: 60px;">{{ order.id }}</span>
            <span style="width: 80px;" class="flex flex-col items-center">
              <span class="text-lg">{{ getStatusIcon(order.status) }}</span>
              <span class="text-[9px] uppercase font-medium" [style.color]="getStatusColor(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>
            </span>
            <span style="width: 120px;" class="flex flex-col">
              <span class="font-bold text-sm">{{ order.deliveryTime }}</span>
              <span class="text-[10px] text-gray-500">Сегодня</span>
            </span>
            <span style="width: 100px;" class="text-xs">{{ order.address }}</span>
            <span style="width: 80px;" class="text-xs text-gray-500">{{ order.courier || '********' }}</span>
            <span style="flex: 1;" class="text-xs">
              <span class="text-blue-600">т. {{ order.phone }}</span>
            </span>
            <span style="width: 90px;" class="text-xs text-gray-500">{{ order.comment }}</span>
            <span style="width: 80px; text-align: right;" class="font-bold text-sm">
              {{ order.total | number:'1.2-2' }}
            </span>
            <!-- Кнопка "Закрыть заказ" для статуса "Собран" -->
            <button *ngIf="order.status === 'ready'"
                    class="pos-close-order-btn ml-2"
                    (click)="closeOrder.emit(order.id); $event.stopPropagation()">
              Закрыть заказ<br>{{ order.total | number:'1.2-2' }}
            </button>
          </div>
          <!-- Строка позиций -->
          <div class="px-2 pb-1 text-[11px]"
               [style.background-color]="order.status === 'closed' ? '#f0f0e8' : '#f5f0e0'"
               [style.color]="order.status === 'closed' ? '#888' : '#555'">
            <span>{{ getItemsText(order) }}</span>
            <span *ngIf="order.status === 'closed'"
                  class="ml-3 inline-block px-2 py-0.5 text-[10px] font-bold text-white rounded"
                  style="background: #4caf50;">
              ОПЛАЧЕНО
            </span>
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
          <span style="font-size: 20px;">⌨</span>
        </button>
        <!-- Поле поиска -->
        <div class="flex items-center mx-1" style="min-width: 180px;">
          <div class="h-10 flex-1 rounded" style="background: #e8e07a;"></div>
        </div>
        <button class="pos-bottom-btn" style="min-width: 40px;">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
        <button class="pos-bottom-btn" style="min-width: 40px;">
          <lucide-icon name="chevrons-up" [size]="18"></lucide-icon>
        </button>
        <div class="flex-1"></div>
        <button class="pos-bottom-btn highlighted">
          <span class="flex items-center gap-1">
            <lucide-icon name="clock" [size]="16"></lucide-icon>
            <lucide-icon name="truck" [size]="16"></lucide-icon>
          </span>
          <span>ДЛИТЕЛЬНОСТЬ</span>
        </button>
        <button class="pos-bottom-btn" (click)="createPickup.emit()">
          <span style="font-size: 18px;">🚶</span>
          <span>САМОВЫВОЗ</span>
        </button>
        <button class="pos-bottom-btn" (click)="createDelivery.emit()">
          <lucide-icon name="truck" [size]="20"></lucide-icon>
          <span>ДОСТАВКА</span>
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
    .pos-toolbar-btn {
      display: flex; flex-direction: column; align-items: center;
      cursor: pointer; padding: 4px 8px; border-radius: 4px;
      transition: background-color 0.1s;
    }
    .pos-toolbar-btn:hover { background-color: rgba(255,255,255,0.1); }
    .pos-toolbar-btn:active { background-color: #b8c959 !important; }
    .pos-filter-tab {
      background: #e8e07a; color: #333; cursor: pointer;
      transition: background-color 0.1s; border-right: 1px solid #ccc;
    }
    .pos-filter-tab:last-child { border-right: none; }
    .pos-filter-tab.dark-tab { background: #444; color: #ccc; border-color: #555; }
    .pos-filter-tab.active { background: #c8c040; }
    .pos-filter-tab.dark-tab.active { background: #666; color: #fff; }
    .pos-filter-tab:active { background: #b8c959 !important; color: #1a1a1a !important; }
    .pos-order-row {
      background: #fff; border-bottom: 1px solid #e0e0d8;
      cursor: pointer; transition: background-color 0.1s; color: #333;
    }
    .pos-order-row:hover { background: #f8f8f0; }
    .pos-order-row.selected { background: #f0ead0; }
    .pos-order-row:active { background: #e8e07a !important; }
    .pos-close-order-btn {
      padding: 6px 12px; font-size: 11px; font-weight: 600;
      border: 2px solid #4caf50; background: #fff; color: #333;
      border-radius: 4px; cursor: pointer; line-height: 1.3;
      text-align: center; white-space: nowrap;
    }
    .pos-close-order-btn:hover { background: #e8f5e9; }
    .pos-close-order-btn:active { background: #b8c959 !important; border-color: #b8c959 !important; }
    .pos-bottom-btn {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px; color: #fff; padding: 0 14px; min-width: 64px;
      cursor: pointer; transition: background-color 0.1s; font-size: 10px;
      font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .pos-bottom-btn:hover { background-color: #383838; }
    .pos-bottom-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
    .pos-bottom-btn.highlighted { background: #3a5a3a; }
  `],
})
export class PosDeliveryListScreenComponent {
  @Input() orders: DeliveryOrder[] = [];
  @Output() navigate = new EventEmitter<string>();
  @Output() selectOrder = new EventEmitter<number>();
  @Output() createPickup = new EventEmitter<void>();
  @Output() createDelivery = new EventEmitter<void>();
  @Output() closeOrder = new EventEmitter<number>();

  colors = POS_COLORS;
  filterTabs = FILTER_TABS;
  activeFilters: Set<DeliveryOrderStatus> = new Set([
    'unconfirmed', 'new', 'cooking', 'ready', 'on-the-way',
  ]);
  selectedOrderId: number | null = null;
  currentDateDisplay = this.formatDate(new Date());

  get filteredOrders(): DeliveryOrder[] {
    return this.orders
      .filter(o => this.activeFilters.has(o.status))
      .sort((a, b) => a.id - b.id);
  }

  isActiveFilter(status: DeliveryOrderStatus): boolean {
    return this.activeFilters.has(status);
  }

  toggleFilter(status: DeliveryOrderStatus): void {
    // Группа: активные или закрытые
    const isDark = status === 'closed' || status === 'cancelled';
    const activeStatuses: DeliveryOrderStatus[] = ['unconfirmed', 'new', 'cooking', 'ready', 'on-the-way'];
    const darkStatuses: DeliveryOrderStatus[] = ['closed', 'cancelled'];

    if (isDark) {
      // Переключить на тёмные фильтры
      this.activeFilters = new Set(darkStatuses);
    } else {
      // Переключить на активные фильтры
      this.activeFilters = new Set(activeStatuses);
    }
  }

  getStatusCount(status: DeliveryOrderStatus): number {
    return this.orders.filter(o => o.status === status).length;
  }

  getStatusIcon(status: DeliveryOrderStatus): string {
    return DELIVERY_STATUS_META[status]?.icon || '';
  }

  getStatusLabel(status: DeliveryOrderStatus): string {
    return DELIVERY_STATUS_META[status]?.label || '';
  }

  getStatusColor(status: DeliveryOrderStatus): string {
    if (status === 'cooking') return '#e65100';
    if (status === 'ready') return '#2e7d32';
    if (status === 'closed') return '#888';
    return '#333';
  }

  getItemsText(order: DeliveryOrder): string {
    return order.items.map(i => i.name).join('; ');
  }

  onOrderClick(order: DeliveryOrder): void {
    if (this.selectedOrderId === order.id) {
      this.selectOrder.emit(order.id);
    } else {
      this.selectedOrderId = order.id;
    }
  }

  changeDate(delta: number): void {
    // Визуальная только — не меняем данные
  }

  private formatDate(date: Date): string {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}
