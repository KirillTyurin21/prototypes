import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { POS_COLORS } from '../types';

/**
 * POS Confirm — простой диалог подтверждения.
 *
 * Заголовок (жёлтый), текст сообщения, кнопки ОК/Отмена.
 * Используется для подтверждения удаления, отмены заказа и т.п.
 *
 * @example
 * <pos-confirm
 *   title="Удаление заказа"
 *   message="Вы уверены, что хотите удалить заказ #42?"
 *   (confirm)="deleteOrder()"
 *   (cancel)="showConfirm = false">
 * </pos-confirm>
 */
@Component({
  selector: 'pos-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full"
         [style.background-color]="colors.dialogBg">

      <!-- Title -->
      <div class="px-4 py-3 text-sm font-bold"
           [style.color]="colors.accent"
           [style.background-color]="colors.headerBg">
        {{ title }}
      </div>

      <!-- Message -->
      <div class="flex-1 flex items-center justify-center px-6 py-6">
        <p class="text-sm text-gray-300 text-center leading-relaxed whitespace-pre-line">
          {{ message }}
        </p>
      </div>

      <!-- Buttons -->
      <div class="flex border-t border-gray-700"
           [style.background-color]="colors.bottomBarBg">
        <button (click)="confirm.emit()"
                class="cf-btn flex-1 py-3 text-sm font-bold text-white">
          {{ confirmLabel }}
        </button>
        <button *ngIf="showCancel"
                (click)="cancel.emit()"
                class="cf-btn flex-1 py-3 text-sm font-bold text-white border-l border-gray-700">
          {{ cancelLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .cf-btn { cursor: pointer; transition: background-color 0.1s; }
    .cf-btn:hover { background-color: #444; }
    .cf-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
  `],
})
export class PosConfirmComponent {
  /** Заголовок */
  @Input() title = '';
  /** Текст сообщения */
  @Input() message = '';
  /** Текст кнопки подтверждения */
  @Input() confirmLabel = 'ОК';
  /** Текст кнопки отмены */
  @Input() cancelLabel = 'Отмена';
  /** Показывать кнопку отмены */
  @Input() showCancel = true;

  /** Подтверждение */
  @Output() confirm = new EventEmitter<void>();
  /** Отмена */
  @Output() cancel = new EventEmitter<void>();

  colors = POS_COLORS;
}
