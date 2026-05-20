import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { SparrowLogEntry, SparrowOrderItem } from '../types';
import { MOCK_PRODUCTS, MOCK_MODIFICATIONS, MOCK_CUSTOMER_NAMES } from '../data/mock-sparrow-data';

/**
 * Панель эмуляции Backend (правая колонка, 30%).
 *
 * Показывает:
 * - Статус соединения (online/offline)
 * - Форма создания заказа (Этап 7)
 * - Кнопки генерации событий (Push стоп, отмена покупателем)
 * - Лог API-вызовов
 */
@Component({
  selector: 'app-sparrow-backend-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="flex flex-col h-full bg-[#1e1e2e] text-gray-300 border-l border-gray-700">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-700 bg-[#252536]">
        <div class="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <lucide-icon name="activity" [size]="16" class="text-blue-400"></lucide-icon>
          Эмуляция Backend
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <!-- Status -->
        <div class="px-4 py-3 border-b border-gray-700">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Статус</span>
            <button (click)="toggleOnline.emit()"
                    class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                    [class.bg-green-900]="isOnline"
                    [class.text-green-300]="isOnline"
                    [class.bg-red-900]="!isOnline"
                    [class.text-red-300]="!isOnline">
              <span class="w-2 h-2 rounded-full"
                    [class.bg-green-400]="isOnline"
                    [class.bg-red-400]="!isOnline"></span>
              {{ isOnline ? 'Online' : 'Offline' }}
            </button>
          </div>
        </div>

        <!-- ═══ Order creation form (Этап 7) ═══ -->
        <div class="px-4 py-3 border-b border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Создать заказ</span>
            <button (click)="showOrderForm = !showOrderForm"
                    class="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer">
              {{ showOrderForm ? 'Свернуть' : 'Развернуть' }}
            </button>
          </div>

          <div *ngIf="showOrderForm" class="space-y-2 animate-fade-in">
            <!-- Customer -->
            <div>
              <label class="text-[10px] text-gray-500 block mb-0.5">Покупатель</label>
              <select [(ngModel)]="formCustomer"
                      class="w-full bg-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 border border-gray-600
                             focus:border-blue-500 focus:outline-none">
                <option *ngFor="let name of customerNames" [value]="name">{{ name }}</option>
              </select>
            </div>

            <!-- Products -->
            <div>
              <label class="text-[10px] text-gray-500 block mb-0.5">Позиции</label>
              <div class="space-y-1 max-h-28 overflow-y-auto">
                <div *ngFor="let product of products; let i = index"
                     class="flex items-center gap-2 py-1 px-1.5 rounded hover:bg-gray-700/30">
                  <input type="checkbox"
                         [checked]="selectedProducts[i]"
                         (change)="selectedProducts[i] = !selectedProducts[i]"
                         class="w-3 h-3 rounded border-gray-500 cursor-pointer accent-blue-500">
                  <span class="text-xs flex-1">{{ product.name }}</span>
                  <select [(ngModel)]="selectedSizes[i]"
                          *ngIf="selectedProducts[i]"
                          class="bg-gray-700 text-[10px] text-gray-300 rounded px-1 py-0.5 border border-gray-600 w-10">
                    <option *ngFor="let s of product.sizes" [value]="s">{{ s }}</option>
                  </select>
                  <span class="text-[10px] text-gray-500">{{ product.price }}₽</span>
                </div>
              </div>
            </div>

            <!-- Modification -->
            <div>
              <label class="text-[10px] text-gray-500 block mb-0.5">Модификатор (опционально)</label>
              <select [(ngModel)]="formModification"
                      class="w-full bg-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 border border-gray-600
                             focus:border-blue-500 focus:outline-none">
                <option value="">Без модификатора</option>
                <option *ngFor="let mod of modifications" [value]="mod.name">{{ mod.name }}</option>
              </select>
            </div>

            <!-- Pickup time -->
            <div>
              <label class="text-[10px] text-gray-500 block mb-0.5">Время выдачи</label>
              <div class="flex gap-1">
                <button *ngFor="let preset of timePresets"
                        (click)="formPickupMinutes = preset.minutes"
                        class="px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer"
                        [class.bg-blue-600]="formPickupMinutes === preset.minutes"
                        [class.text-white]="formPickupMinutes === preset.minutes"
                        [class.bg-gray-700]="formPickupMinutes !== preset.minutes"
                        [class.text-gray-400]="formPickupMinutes !== preset.minutes">
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <!-- Comment -->
            <div>
              <label class="text-[10px] text-gray-500 block mb-0.5">Комментарий</label>
              <input type="text"
                     [(ngModel)]="formComment"
                     placeholder="Необязательно"
                     class="w-full bg-gray-700 text-gray-200 text-xs rounded px-2 py-1.5 border border-gray-600
                            focus:border-blue-500 focus:outline-none placeholder-gray-500">
            </div>

            <!-- Buttons -->
            <div class="flex gap-1.5 pt-1">
              <button (click)="onCreateOrder()"
                      [disabled]="!isOnline || !hasSelectedProducts"
                      class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium
                             bg-blue-600 text-white hover:bg-blue-500
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors cursor-pointer">
                <lucide-icon name="plus" [size]="12"></lucide-icon>
                Создать
              </button>
              <button (click)="randomOrder.emit()"
                      [disabled]="!isOnline"
                      class="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium
                             bg-gray-600 text-gray-300 hover:bg-gray-500
                             disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors cursor-pointer">
                <lucide-icon name="shuffle" [size]="12"></lucide-icon>
                Случайный
              </button>
            </div>

            <!-- Validation hint -->
            <p *ngIf="!hasSelectedProducts && showOrderForm"
               class="text-[10px] text-gray-500">
              Выберите хотя бы одну позицию
            </p>
          </div>

          <!-- Collapsed: quick buttons -->
          <div *ngIf="!showOrderForm" class="flex gap-1.5">
            <button (click)="randomOrder.emit()"
                    [disabled]="!isOnline"
                    class="flex-1 flex items-center gap-2 px-3 py-2 rounded text-xs font-medium
                           bg-blue-600/20 text-blue-300 hover:bg-blue-600/30
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors cursor-pointer">
              <lucide-icon name="plus" [size]="14"></lucide-icon>
              Новый заказ
            </button>
          </div>
        </div>

        <!-- ═══ Actions (stop-push, cancel) ═══ -->
        <div class="px-4 py-3 border-b border-gray-700">
          <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">Действия</div>
          <div class="flex flex-col gap-1.5">
            <button (click)="stopPush.emit()"
                    [disabled]="!isOnline"
                    class="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium
                           bg-orange-600/20 text-orange-300 hover:bg-orange-600/30
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors cursor-pointer">
              <lucide-icon name="ban" [size]="14"></lucide-icon>
              Push стоп-запрос
            </button>
            <button (click)="customerCancel.emit()"
                    [disabled]="!isOnline || !hasActiveOrders"
                    class="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium
                           bg-red-600/20 text-red-300 hover:bg-red-600/30
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors cursor-pointer">
              <lucide-icon name="x-circle" [size]="14"></lucide-icon>
              Отмена покупателем
            </button>
          </div>
        </div>

        <!-- Event Log -->
        <div class="flex-1 flex flex-col min-h-0">
          <div class="px-4 py-2 flex items-center justify-between border-b border-gray-700">
            <span class="text-xs text-gray-400 uppercase tracking-wide">Лог событий</span>
            <span class="text-[10px] text-gray-500">{{ log.length }}</span>
          </div>
          <div class="flex-1 overflow-y-auto px-4 py-2 space-y-1.5" style="max-height: 200px;">
            <div *ngIf="log.length === 0"
                 class="flex flex-col items-center justify-center text-center py-8 text-gray-500">
              <lucide-icon name="inbox" [size]="24" class="mb-2 opacity-50"></lucide-icon>
              <span class="text-xs">Нет событий</span>
            </div>
            <div *ngFor="let entry of log"
                 class="flex items-start gap-2 py-1.5 border-b border-gray-700/50 last:border-0">
              <span class="text-[10px] text-gray-500 font-mono shrink-0 mt-0.5">{{ entry.time }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-mono px-1 rounded"
                        [class.bg-green-900]="entry.status === 'success'"
                        [class.text-green-400]="entry.status === 'success'"
                        [class.bg-red-900]="entry.status === 'error'"
                        [class.text-red-400]="entry.status === 'error'">
                    {{ entry.method }}
                  </span>
                  <span class="text-[10px] text-gray-500 font-mono truncate">{{ entry.endpoint }}</span>
                </div>
                <div class="text-[11px] text-gray-400 mt-0.5 truncate">{{ entry.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SparrowBackendPanelComponent {
  @Input() isOnline = true;
  @Input() hasActiveOrders = false;
  @Input() log: SparrowLogEntry[] = [];

  @Output() toggleOnline = new EventEmitter<void>();
  @Output() randomOrder = new EventEmitter<void>();
  @Output() createOrder = new EventEmitter<{ customerName: string; items: SparrowOrderItem[]; pickupMinutes: number; comment: string }>();
  @Output() customerCancel = new EventEmitter<void>();
  @Output() stopPush = new EventEmitter<void>();

  // Form state
  showOrderForm = false;

  products = MOCK_PRODUCTS;
  modifications = MOCK_MODIFICATIONS;
  customerNames = MOCK_CUSTOMER_NAMES;

  formCustomer = MOCK_CUSTOMER_NAMES[0];
  selectedProducts: boolean[] = MOCK_PRODUCTS.map(() => false);
  selectedSizes: string[] = MOCK_PRODUCTS.map(p => p.sizes[0]);
  formModification = '';
  formPickupMinutes = 10;
  formComment = '';

  timePresets = [
    { label: '5 мин', minutes: 5 },
    { label: '10 мин', minutes: 10 },
    { label: '15 мин', minutes: 15 },
    { label: '20 мин', minutes: 20 },
    { label: '30 мин', minutes: 30 },
  ];

  get hasSelectedProducts(): boolean {
    return this.selectedProducts.some(s => s);
  }

  onCreateOrder(): void {
    const items: SparrowOrderItem[] = [];

    this.products.forEach((product, i) => {
      if (!this.selectedProducts[i]) return;
      const size = this.selectedSizes[i];
      const mods = this.formModification ? [this.formModification] : [];
      const modPrice = mods.length > 0 ? 50 : 0;
      items.push({
        productId: product.id,
        productName: product.name,
        size,
        modifications: mods,
        quantity: 1,
        price: product.price + modPrice,
      });
    });

    if (items.length === 0) return;

    this.createOrder.emit({
      customerName: this.formCustomer,
      items,
      pickupMinutes: this.formPickupMinutes,
      comment: this.formComment,
    });

    // Reset form
    this.selectedProducts = MOCK_PRODUCTS.map(() => false);
    this.formModification = '';
    this.formComment = '';
  }
}
