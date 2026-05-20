import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { POS_COLORS, DeliveryOrder, DeliveryOrderStatus, PosOrderItem, PosMenuCategory, PosMenuItem } from '../types';
import { MOCK_MENU_CATEGORIES, MOCK_MENU_ITEMS } from '../data/mock-delivery-orders';

interface StatusButton {
  num: number;
  label: string;
  action: DeliveryOrderStatus | 'cancel';
}

/**
 * Экран 3: Заказ (самовывоз/доставка) — создание и редактирование.
 * Категории, блюда, чек, кнопки статусов (0-5).
 */
@Component({
  selector: 'pos-delivery-order-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex flex-col h-full" [style.background-color]="colors.terminalBg">

      <!-- Шапка заказа (тёмная) -->
      <div class="flex items-center justify-end px-4 shrink-0"
           [style.background-color]="colors.headerBg" style="height: 40px;">
        <div class="flex items-center gap-5">
          <button class="pos-icon-btn">
            <lucide-icon name="menu" [size]="24" class="text-gray-300"></lucide-icon>
          </button>
          <button class="pos-icon-btn">
            <lucide-icon name="lock" [size]="20" class="text-gray-300"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Информационная панель + Навигация -->
      <div class="flex items-stretch shrink-0" style="height: 48px; background: #8a9baa;">
        <!-- Левая часть: инфо заказа -->
        <div class="flex items-center px-3 gap-3 text-sm"
             style="width: 40%; color: #333;">
          <span>📋</span>
          <span class="font-bold">{{ order?.createdAt || '—' }}</span>
          <span>👤 1</span>
          <span>📄 {{ order?.id || '—' }}</span>
          <span class="ml-2">🚗 {{ order?.courier || 'Не задан' }}</span>
          <button class="pos-icon-btn ml-auto">
            <lucide-icon name="users" [size]="16" class="text-gray-700"></lucide-icon>
          </button>
        </div>
        <!-- Правая часть: навигация + курсы -->
        <div class="flex items-center flex-1">
          <div class="flex items-center gap-1 px-2">
            <button class="pos-nav-btn"><lucide-icon name="chevron-left" [size]="18"></lucide-icon></button>
            <button class="pos-nav-btn"><lucide-icon name="star" [size]="18"></lucide-icon></button>
            <button class="pos-nav-btn"><lucide-icon name="home" [size]="18"></lucide-icon></button>
            <button class="pos-nav-btn"><lucide-icon name="printer" [size]="18"></lucide-icon></button>
            <button class="pos-nav-btn"><lucide-icon name="settings" [size]="18"></lucide-icon></button>
          </div>
          <div class="ml-auto flex items-center gap-0.5 pr-2">
            <button *ngFor="let c of [1, 2, 3]"
                    class="pos-course-btn"
                    [class.active]="activeCourse === c"
                    (click)="activeCourse = c">
              {{ toRoman(c) }}
            </button>
          </div>
        </div>
      </div>

      <!-- Основная область: чек + меню -->
      <div class="flex flex-1 overflow-hidden">

        <!-- Левая часть: чек (список позиций) -->
        <div class="flex flex-col" style="width: 40%; border-right: 1px solid #999;">
          <!-- Позиции заказа -->
          <div class="flex-1 overflow-auto" style="background: #fff;">
            <div *ngIf="!order?.items?.length"
                 class="p-4 text-sm text-gray-400 text-center">Нет позиций</div>
            <div *ngFor="let item of order?.items; let i = index"
                 class="pos-item-row flex items-center justify-between px-3 py-1.5"
                 [class.selected]="selectedItemIndex === i"
                 (click)="selectedItemIndex = i">
              <span class="text-sm" [style.color]="selectedItemIndex === i ? '#1a6db5' : '#333'">
                {{ item.name }}
              </span>
              <span class="text-sm font-medium" [style.color]="selectedItemIndex === i ? '#1a6db5' : '#333'">
                {{ item.price | number:'1.2-2' }} р.
              </span>
            </div>
          </div>

          <!-- Итоги -->
          <div class="shrink-0 border-t text-xs" style="background: #f8f8f0; border-color: #ccc;">
            <div class="flex justify-between px-3 py-0.5">
              <span class="flex gap-4">
                <span>СКИДКА: <b>{{ discountPercent }}%</b></span>
                <span>ПОДЫТОГ <b>{{ order?.subtotal | number:'1.2-2' }} р.</b></span>
                <span>ПРЕДОПЛАТА <b>{{ order?.prepayment | number:'1.2-2' }} р.</b></span>
              </span>
            </div>
            <div class="flex gap-4 px-3 py-0.5">
              <span>НАДБАВКА: <b>{{ order?.surcharge || 0 }}%</b></span>
            </div>
            <div class="text-center py-2 font-bold text-xl border-t" style="border-color: #ccc;">
              {{ order?.total | number:'1.2-2' }} р.
            </div>
          </div>
        </div>

        <!-- Правая часть: категории + блюда -->
        <div class="flex flex-1 overflow-hidden" style="background: #4a4a4a;">
          <!-- Категории (левый столбец) -->
          <div class="flex flex-col gap-1 p-1 overflow-auto" style="width: 140px;">
            <button *ngFor="let cat of categories"
                    class="pos-cat-btn text-sm font-medium py-4 px-2 text-center"
                    [class.group-btn]="cat.isGroup">
              {{ cat.name }}
            </button>
          </div>
          <!-- Блюда (правый столбец) -->
          <div class="flex flex-col flex-1 overflow-auto">
            <!-- Меню и быстрые кнопки -->
            <div class="flex flex-wrap gap-1 p-1 flex-1">
              <button *ngFor="let item of menuItems"
                      class="pos-dish-btn text-xs font-medium"
                      [class.unavailable]="!item.available"
                      (click)="item.available && addItem.emit(item)">
                <span *ngIf="!item.available" class="text-gray-400 mr-1">✕</span>
                {{ item.name }}
              </button>
            </div>
            <!-- Курсы вкладки вверху -->
            <div class="flex items-center gap-0.5 p-1 shrink-0 justify-end">
              <button *ngFor="let qItem of quickItems"
                      class="pos-quick-btn text-xs font-medium"
                      (click)="addItem.emit(qItem)">
                {{ qItem.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопки управления + статусы -->
      <div class="flex items-stretch shrink-0 border-t" style="height: 40px; border-color: #666;">
        <!-- Кнопки +, -, 123, ⋮, × -->
        <button class="pos-action-btn" (click)="onQuantityChange(1)">
          <lucide-icon name="plus" [size]="18"></lucide-icon>
        </button>
        <button class="pos-action-btn" (click)="onQuantityChange(-1)">
          <lucide-icon name="minus" [size]="18"></lucide-icon>
        </button>
        <button class="pos-action-btn text-xs font-bold">123</button>
        <button class="pos-action-btn">
          <lucide-icon name="more-vertical" [size]="18"></lucide-icon>
        </button>
        <button class="pos-action-btn" (click)="onRemoveItem()">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>

        <!-- Кнопки статусов (0)-(5) -->
        <div class="flex items-stretch flex-1">
          <button *ngFor="let btn of statusButtons"
                  class="pos-status-btn flex-1 text-[10px] font-bold"
                  [class.active-status]="isCurrentStatusButton(btn)"
                  (click)="onStatusClick(btn)">
            <span class="text-gray-400 mr-0.5">({{ btn.num }})</span>
            {{ btn.label }}
          </button>
        </div>
      </div>

      <!-- Нижняя панель -->
      <div class="flex items-stretch shrink-0 border-t border-gray-700 select-none"
           [style.background-color]="colors.bottomBarBg" style="height: 56px;">
        <button class="pos-bottom-btn" (click)="navigate.emit('back')">
          <lucide-icon name="chevron-left" [size]="20"></lucide-icon>
          <span>НАЗАД</span>
        </button>
        <button class="pos-bottom-btn active-tab">
          <span>🍽</span>
          <span>ЗАКАЗ</span>
        </button>
        <button class="pos-bottom-btn">
          <lucide-icon name="user" [size]="18"></lucide-icon>
          <span>КЛИЕНТ</span>
        </button>
        <button class="pos-bottom-btn">
          <lucide-icon name="star" [size]="18"></lucide-icon>
          <span>ВНЕ ОЧЕРЕДИ</span>
        </button>
        <button class="pos-bottom-btn">
          <lucide-icon name="alert-triangle" [size]="18"></lucide-icon>
          <span>ПРОБЛЕМА</span>
        </button>
        <button class="pos-bottom-btn" (click)="navigate.emit('payment')">
          <lucide-icon name="wallet" [size]="18"></lucide-icon>
          <span>ПЛАТЕЖИ</span>
        </button>
        <button class="pos-bottom-btn">
          <lucide-icon name="package" [size]="18"></lucide-icon>
          <span>НАКЛАДНАЯ</span>
        </button>
        <div class="flex-1"></div>
        <button class="pos-bottom-btn" (click)="saveOrder.emit()">
          <span class="text-sm font-bold">СОХРАНИТЬ</span>
        </button>
        <button class="pos-bottom-btn" (click)="navigate.emit('back')">
          <span class="text-sm font-bold">ВЫХОД</span>
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
    .pos-nav-btn {
      cursor: pointer; padding: 6px; border-radius: 4px;
      color: #555; transition: background-color 0.1s;
    }
    .pos-nav-btn:hover { background-color: rgba(0,0,0,0.1); }
    .pos-nav-btn:active { background-color: #b8c959 !important; }
    .pos-course-btn {
      padding: 4px 14px; font-size: 13px; font-weight: 700;
      background: transparent; color: #555; cursor: pointer;
      border: none; transition: background-color 0.1s;
    }
    .pos-course-btn.active { background: #e8e07a; color: #333; }
    .pos-course-btn:active { background: #b8c959 !important; color: #1a1a1a !important; }
    .pos-item-row {
      cursor: pointer; transition: background-color 0.05s;
      border-bottom: 1px solid #f0f0e8;
    }
    .pos-item-row:hover { background: #f8f8f0; }
    .pos-item-row.selected { background: #f0ead0; }
    .pos-cat-btn {
      background: #fff; border: 1px solid #ccc; cursor: pointer;
      transition: background-color 0.1s; border-radius: 2px;
    }
    .pos-cat-btn.group-btn { background: #7aaac4; color: #fff; border-color: #5a8aa4; }
    .pos-cat-btn:active { background: #b8c959 !important; color: #1a1a1a !important; }
    .pos-dish-btn {
      width: 120px; min-height: 50px; background: #fff; border: 1px solid #ccc;
      cursor: pointer; transition: background-color 0.1s; padding: 4px;
      display: flex; align-items: center; justify-content: center;
      text-align: center; border-radius: 2px; color: #333;
    }
    .pos-dish-btn:hover { background: #f0f0e8; }
    .pos-dish-btn:active { background: #b8c959 !important; }
    .pos-dish-btn.unavailable {
      background: #e0e0d8; color: #999; cursor: default;
      text-decoration: line-through;
    }
    .pos-quick-btn {
      padding: 6px 12px; background: #fff; border: 1px solid #ccc;
      cursor: pointer; color: #333; border-radius: 2px;
    }
    .pos-quick-btn:active { background: #b8c959 !important; }
    .pos-action-btn {
      display: flex; align-items: center; justify-content: center;
      width: 48px; color: #fff; cursor: pointer;
      background: #333; border-right: 1px solid #555;
      transition: background-color 0.1s;
    }
    .pos-action-btn:hover { background: #444; }
    .pos-action-btn:active { background: #b8c959 !important; color: #1a1a1a !important; }
    .pos-status-btn {
      display: flex; align-items: center; justify-content: center;
      color: #aaa; cursor: pointer; background: #333;
      border-right: 1px solid #555; transition: background-color 0.1s;
    }
    .pos-status-btn:hover { background: #444; color: #ccc; }
    .pos-status-btn:active { background: #b8c959 !important; color: #1a1a1a !important; }
    .pos-status-btn.active-status { color: #fff; font-weight: 700; }
    .pos-bottom-btn {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px; color: #fff; padding: 0 12px; min-width: 60px;
      cursor: pointer; transition: background-color 0.1s; font-size: 9px;
      font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .pos-bottom-btn:hover { background-color: #383838; }
    .pos-bottom-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
    .pos-bottom-btn.active-tab { background: #e8e07a !important; color: #1a1a1a !important; }
  `],
})
export class PosDeliveryOrderScreenComponent implements OnChanges {
  @Input() order: DeliveryOrder | null = null;
  @Output() navigate = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<DeliveryOrderStatus>();
  @Output() addItem = new EventEmitter<PosMenuItem>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() saveOrder = new EventEmitter<void>();

  colors = POS_COLORS;
  categories = MOCK_MENU_CATEGORIES;
  menuItems = MOCK_MENU_ITEMS;
  quickItems = MOCK_MENU_ITEMS.filter(i => i.available && i.price > 0).slice(0, 3);
  activeCourse = 1;
  selectedItemIndex = -1;

  statusButtons: StatusButton[] = [];

  ngOnChanges(): void {
    this.buildStatusButtons();
  }

  get discountPercent(): string {
    if (!this.order || this.order.subtotal === 0) return '0,00';
    const pct = (this.order.discount / this.order.subtotal) * 100;
    return pct.toFixed(2).replace('.', ',');
  }

  toRoman(n: number): string {
    return ['I', 'II', 'III'][n - 1] || String(n);
  }

  private buildStatusButtons(): void {
    const status = this.order?.status || 'new';
    this.statusButtons = [
      { num: 0, label: 'ОТМЕНИТЬ', action: 'cancelled' },
      { num: 1, label: 'НЕПОДТВ.', action: 'unconfirmed' },
      { num: 2, label: this.getButton2Label(status), action: this.getButton2Action(status) },
      { num: 3, label: 'ОТПРАВИТЬ', action: 'on-the-way' },
      { num: 4, label: 'ДОСТАВЛ.', action: 'ready' },
      { num: 5, label: 'ЗАКРЫТЬ', action: 'closed' },
    ];
  }

  private getButton2Label(status: DeliveryOrderStatus): string {
    if (status === 'cooking') return 'ПРИГОТОВЛЕН';
    return 'ГОТОВИТЬ';
  }

  private getButton2Action(status: DeliveryOrderStatus): DeliveryOrderStatus {
    if (status === 'cooking') return 'ready';
    return 'cooking';
  }

  isCurrentStatusButton(btn: StatusButton): boolean {
    if (!this.order) return btn.num === 2;
    // Highlight the "next logical" status button
    const status = this.order.status;
    if (status === 'new' || status === 'unconfirmed') return btn.num === 2;
    if (status === 'cooking') return btn.num === 2;
    if (status === 'ready') return btn.num === 5;
    return false;
  }

  onStatusClick(btn: StatusButton): void {
    if (btn.action === 'closed') {
      this.navigate.emit('payment');
    } else {
      this.statusChange.emit(btn.action as DeliveryOrderStatus);
    }
  }

  onQuantityChange(delta: number): void {
    // Visual only for prototype
  }

  onRemoveItem(): void {
    if (this.selectedItemIndex >= 0 && this.order?.items) {
      this.removeItem.emit(this.selectedItemIndex);
      this.selectedItemIndex = -1;
    }
  }
}
