import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { POS_COLORS } from '../types';

interface PaymentMethodOption {
  label: string;
  value: string;
}

const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { label: 'Банковские карты', value: 'bank-card' },
  { label: 'Безналичные с изъятием', value: 'cashless-withdraw' },
  { label: 'ПлатиAlfa', value: 'plati-alfa' },
  { label: 'ПлатиQR', value: 'plati-qr' },
];

/**
 * Модальное окно: Выбор способа оплаты.
 */
@Component({
  selector: 'pos-payment-method-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="absolute inset-0 z-50 flex items-center justify-center"
         [style.background-color]="colors.overlay">
      <div class="flex flex-col rounded overflow-hidden shadow-xl"
           style="width: 400px; background: #fff;">

        <!-- Заголовок -->
        <div class="text-center py-3 font-bold text-sm border-b"
             style="background: #333; color: #fff; border-color: #555;">
          ВЫБОР СПОСОБА ОПЛАТЫ
        </div>

        <!-- Варианты -->
        <div class="flex flex-col">
          <button *ngFor="let opt of options"
                  class="pos-method-btn text-sm text-left px-4 py-3 border-b"
                  style="border-color: #e0e0d8; color: #333;"
                  (click)="select.emit(opt.value)">
            {{ opt.label }}
          </button>
        </div>

        <!-- Отмена -->
        <button class="text-center text-sm font-bold py-3 cursor-pointer"
                style="background: #333; color: #fff;"
                (click)="dialogClose.emit()">
          Отмена
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .pos-method-btn {
      cursor: pointer; transition: background-color 0.1s; background: #fff;
    }
    .pos-method-btn:hover { background: #f0f0e8; }
    .pos-method-btn:active { background: #b8c959 !important; }
  `],
})
export class PosPaymentMethodDialogComponent {
  @Input() open = false;
  @Output() dialogClose = new EventEmitter<void>();
  @Output() select = new EventEmitter<string>();

  colors = POS_COLORS;
  options = PAYMENT_METHOD_OPTIONS;
}
