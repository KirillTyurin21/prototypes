import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { POS_COLORS, DeliveryOrder, PaymentMethodType } from '../types';
import { MOCK_PAYMENT_METHODS } from '../data/mock-delivery-orders';

/**
 * Экран 5: Касса (оплата).
 * Нумпад, типы оплаты, фискализация, ТОЧНАЯ СУММА.
 */
@Component({
  selector: 'pos-payment-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex flex-col h-full" [style.background-color]="colors.terminalBg">

      <!-- Шапка -->
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

      <!-- Основная область -->
      <div class="flex flex-1 overflow-hidden">

        <!-- Левая часть: чек -->
        <div class="flex flex-col" style="width: 38%; border-right: 1px solid #999;">
          <!-- ГОСТЬ 1 заголовок -->
          <div class="text-center text-xs font-bold py-1.5 shrink-0"
               style="background: #8a9baa; color: #333;">
            ГОСТЬ 1
          </div>
          <!-- Позиции -->
          <div class="flex-1 overflow-auto" style="background: #fff;">
            <div *ngFor="let item of order?.items"
                 class="flex items-center justify-between px-3 py-1 text-sm border-b"
                 style="border-color: #f0f0e8; color: #333;">
              <span>
                <span class="text-blue-600 mr-2">{{ item.quantity }}</span>
                <span class="text-blue-600">{{ item.name }}</span>
              </span>
              <span>{{ item.price | number:'1.2-2' }} р.</span>
            </div>
          </div>
          <!-- Итоги -->
          <div class="shrink-0 text-xs border-t" style="background: #f8f8f0; border-color: #ccc; color: #333;">
            <div class="flex justify-between px-3 py-0.5">
              <span>ПОДЫТОГ:</span>
              <span class="font-bold">{{ order?.subtotal | number:'1.2-2' }} р.</span>
            </div>
            <div class="flex justify-between px-3 py-0.5" *ngIf="order && order.discount > 0">
              <span>СКИДКА {{ discountPercent }}%:</span>
              <span class="font-bold text-red-600">-{{ order.discount | number:'1.2-2' }} р.</span>
            </div>
            <div class="flex justify-between px-3 py-0.5">
              <span>НАДБАВКА:</span>
              <span class="font-bold">{{ order?.surcharge | number:'1.2-2' }} р.</span>
            </div>
            <div class="flex justify-between px-3 py-0.5">
              <span class="font-bold">ПРЕДОПЛАТА:</span>
              <span class="font-bold">{{ order?.prepayment | number:'1.2-2' }} р.</span>
            </div>
            <div class="flex justify-between px-3 py-1 font-bold text-base border-t"
                 style="border-color: #ccc;">
              <span>ИТОГО:</span>
              <span>{{ order?.total | number:'1.2-2' }} р.</span>
            </div>
          </div>
        </div>

        <!-- Правая часть: оплата -->
        <div class="flex flex-col flex-1" style="background: #fff;">
          <!-- К ОПЛАТЕ -->
          <div class="flex items-center px-4 py-2 shrink-0 border-b"
               style="border-color: #ccc;">
            <span class="text-xs text-gray-600 mr-2">К ОПЛАТЕ:</span>
            <span class="text-lg font-bold" style="color: #333;">{{ order?.total | number:'1.2-2' }} р.</span>
          </div>

          <!-- Вкладки типов оплаты -->
          <div class="flex items-stretch shrink-0" style="height: 48px; border-bottom: 1px solid #ccc;">
            <button *ngFor="let pm of paymentMethods"
                    class="pos-pay-tab flex-1 flex flex-col items-center justify-center text-[10px] font-bold"
                    [class.active]="selectedPaymentType === pm.type"
                    (click)="onSelectPaymentType(pm.type)">
              <span class="text-base mb-0.5">{{ getPaymentIcon(pm.type) }}</span>
              <span>{{ pm.name | uppercase }}</span>
            </button>
          </div>

          <!-- Выбранный тип оплаты (жёлтая полоса) -->
          <div class="flex items-center px-3 shrink-0" style="height: 32px; background: #e8e07a;">
            <span class="text-xs font-bold" style="color: #333;">
              <span *ngIf="isFiscalized">[Ф] </span>
              {{ getSelectedPaymentName() | uppercase }}
            </span>
            <span class="ml-auto text-xs font-bold" style="color: #333;">
              {{ enteredAmount | number:'1.2-2' }} р.
            </span>
            <button class="ml-2 text-gray-600" (click)="clearPaymentType()" style="font-size: 14px;">✕</button>
          </div>

          <!-- Фискализирован баннер -->
          <div *ngIf="isFiscalized"
               class="text-center text-xs font-bold py-1 shrink-0"
               style="background: #fff; color: #4caf50;">
            ФИСКАЛИЗИРОВАН
          </div>

          <!-- Название типа + сумма -->
          <div class="text-center py-2 shrink-0" style="color: #1976d2;">
            <div class="text-xs font-bold uppercase">{{ getSelectedPaymentName() }}</div>
            <div class="text-3xl font-bold">{{ enteredAmount | number:'1.2-2' }} р.</div>
          </div>

          <!-- Нумпад + быстрые кнопки -->
          <div class="flex flex-1 overflow-hidden">
            <!-- Нумпад 4×3 -->
            <div class="grid grid-cols-3 gap-px flex-1 p-1"
                 style="max-width: 260px;">
              <button *ngFor="let key of numpadKeys"
                      class="pos-numpad-btn text-xl font-medium"
                      (click)="onNumpadClick(key)">
                {{ key }}
              </button>
            </div>
            <!-- Быстрые кнопки +N -->
            <div class="grid grid-cols-2 gap-px p-1 shrink-0" style="width: 120px;">
              <button *ngFor="let q of quickAmounts"
                      class="pos-quick-amount-btn text-xs font-bold"
                      (click)="onQuickAmount(q)">
                +{{ q }}
              </button>
            </div>
          </div>

          <!-- Расчётная зона -->
          <div class="shrink-0 border-t text-xs px-4 py-1" style="border-color: #ccc; color: #333;">
            <div class="flex justify-between py-0.5">
              <span>ВНЕСЕНО:</span>
              <span class="font-bold">{{ enteredAmount | number:'1.2-2' }} р.</span>
            </div>
            <div class="flex justify-between py-0.5">
              <span class="font-bold">ВНЕСТИ:</span>
              <span class="font-bold">{{ remaining | number:'1.2-2' }} р.</span>
            </div>
            <div class="flex justify-between py-0.5">
              <span>СДАЧА:</span>
              <span class="font-bold">{{ change | number:'1.2-2' }} р.</span>
            </div>
          </div>

          <!-- ТОЧНАЯ СУММА -->
          <button class="shrink-0 text-center text-xs font-bold py-2 border-t cursor-pointer"
                  style="border-color: #ccc; color: #333; background: #f8f8f0;"
                  (click)="onExactAmount()">
            ТОЧНАЯ СУММА
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
        <button class="pos-bottom-btn">
          <lucide-icon name="wallet" [size]="18"></lucide-icon>
          <span>ПЛАТЕЖИ</span>
        </button>
        <button class="pos-bottom-btn">
          <lucide-icon name="receipt" [size]="18"></lucide-icon>
          <span>С ТОВАРНЫМ ЧЕКОМ</span>
        </button>
        <button *ngIf="!isFiscalized" class="pos-bottom-btn">
          <lucide-icon name="send" [size]="18"></lucide-icon>
          <span>ОТПРАВКА ЧЕКА</span>
        </button>
        <div class="flex-1"></div>
        <button class="pos-bottom-btn pay-btn"
                [class.disabled]="!canPay"
                (click)="onPayClick()">
          <span class="text-sm font-bold">{{ payButtonLabel }}</span>
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
    .pos-pay-tab {
      background: #f0f0e8; color: #555; cursor: pointer;
      border-right: 1px solid #ccc; transition: background-color 0.1s;
    }
    .pos-pay-tab:last-child { border-right: none; }
    .pos-pay-tab.active { background: #e8e07a; color: #333; }
    .pos-pay-tab:active { background: #b8c959 !important; color: #1a1a1a !important; }
    .pos-numpad-btn {
      display: flex; align-items: center; justify-content: center;
      background: #fff; border: 1px solid #ddd; cursor: pointer;
      color: #333; min-height: 42px; transition: background-color 0.1s;
    }
    .pos-numpad-btn:hover { background: #f0f0e8; }
    .pos-numpad-btn:active { background: #b8c959 !important; }
    .pos-quick-amount-btn {
      display: flex; align-items: center; justify-content: center;
      background: #f8f8f0; border: 1px solid #ddd; cursor: pointer;
      color: #333; transition: background-color 0.1s;
    }
    .pos-quick-amount-btn:hover { background: #e8e07a; }
    .pos-quick-amount-btn:active { background: #b8c959 !important; }
    .pos-bottom-btn {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px; color: #fff; padding: 0 14px; min-width: 64px;
      cursor: pointer; transition: background-color 0.1s; font-size: 9px;
      font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .pos-bottom-btn:hover { background-color: #383838; }
    .pos-bottom-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
    .pos-bottom-btn.pay-btn { background: #2a4a2a; min-width: 100px; }
    .pos-bottom-btn.pay-btn.disabled { opacity: 0.4; cursor: default; }
  `],
})
export class PosPaymentScreenComponent implements OnChanges {
  @Input() order: DeliveryOrder | null = null;
  @Output() navigate = new EventEmitter<string>();
  @Output() paymentComplete = new EventEmitter<void>();
  @Output() showPaymentMethodDialog = new EventEmitter<void>();

  colors = POS_COLORS;
  paymentMethods = MOCK_PAYMENT_METHODS;
  selectedPaymentType: PaymentMethodType = 'cash';
  enteredAmount = 0;
  isFiscalized = false;
  numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '/', '0', '✕'];
  quickAmounts = [1, 5, 10, 50, 100, 500, 1000, 5000];
  amountString = '';

  ngOnChanges(): void {
    this.enteredAmount = 0;
    this.isFiscalized = false;
    this.amountString = '';
  }

  get total(): number {
    return this.order?.total || 0;
  }

  get remaining(): number {
    return Math.max(0, this.total - this.enteredAmount);
  }

  get change(): number {
    return Math.max(0, this.enteredAmount - this.total);
  }

  get canPay(): boolean {
    if (!this.isFiscalized && this.remaining <= 0 && this.enteredAmount > 0) return true; // Can fiscalize
    if (this.isFiscalized) return true; // Can pay after fiscalization
    return false;
  }

  get payButtonLabel(): string {
    if (this.remaining <= 0 && this.enteredAmount > 0 && !this.isFiscalized) {
      return 'ФИСКАЛЬНЫЙ ЧЕК';
    }
    return 'ОПЛАТИТЬ';
  }

  get discountPercent(): string {
    if (!this.order || this.order.subtotal === 0) return '0,00';
    const pct = (this.order.discount / this.order.subtotal) * 100;
    return pct.toFixed(2).replace('.', ',');
  }

  getPaymentIcon(type: PaymentMethodType): string {
    switch (type) {
      case 'cash': return '💵';
      case 'bank-card': return '💳';
      case 'cashless': return '📄';
      case 'no-revenue': return '∅';
      default: return '';
    }
  }

  getSelectedPaymentName(): string {
    const pm = this.paymentMethods.find(p => p.type === this.selectedPaymentType);
    return pm?.name || '';
  }

  onSelectPaymentType(type: PaymentMethodType): void {
    if (type === 'bank-card') {
      this.showPaymentMethodDialog.emit();
    }
    this.selectedPaymentType = type;
  }

  clearPaymentType(): void {
    this.enteredAmount = 0;
    this.amountString = '';
  }

  onNumpadClick(key: string): void {
    if (key === '✕') {
      this.amountString = this.amountString.slice(0, -1);
    } else if (key === '/') {
      if (!this.amountString.includes('.')) {
        this.amountString += '.';
      }
    } else {
      this.amountString += key;
    }
    this.enteredAmount = parseFloat(this.amountString) || 0;
  }

  onQuickAmount(amount: number): void {
    this.enteredAmount += amount;
    this.amountString = String(this.enteredAmount);
  }

  onExactAmount(): void {
    this.enteredAmount = this.total;
    this.amountString = String(this.total);
  }

  onPayClick(): void {
    if (!this.canPay) return;

    if (!this.isFiscalized && this.remaining <= 0) {
      this.isFiscalized = true;
      return;
    }

    if (this.isFiscalized) {
      this.paymentComplete.emit();
    }
  }
}
