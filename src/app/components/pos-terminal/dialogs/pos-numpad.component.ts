import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { POS_COLORS } from '../types';

/**
 * POS Numpad — 12-клавишная цифровая панель ввода.
 *
 * Используется в диалогах идентификации (PIN, номер карты, номер телефона),
 * активации сертификатов, ввода количества.
 *
 * @example
 * <pos-numpad
 *   [value]="pin"
 *   placeholder="Введите PIN-код"
 *   (valueChange)="pin = $event"
 *   (enter)="onSubmit($event)">
 * </pos-numpad>
 */
@Component({
  selector: 'pos-numpad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-2">
      <!-- Display field -->
      <div class="text-center mb-1" *ngIf="label">
        <span class="text-sm" [style.color]="labelColor || colors.accent">{{ label }}</span>
      </div>

      <div class="h-10 flex items-center justify-center rounded px-3 text-lg font-mono tracking-widest"
           [style.background-color]="masked ? '#555' : '#4a4a4a'"
           [style.color]="'#fff'">
        {{ displayValue || '&nbsp;' }}
      </div>

      <!-- Numpad grid -->
      <div class="grid grid-cols-3 gap-px" style="background-color: #666;">
        <button *ngFor="let key of keys"
                (click)="onKey(key)"
                class="numpad-key flex items-center justify-center text-xl font-medium
                       bg-white text-gray-800 transition-colors select-none"
                [style.height.px]="keyHeight"
                [class.text-gray-400]="key === ''">
          <span *ngIf="key === 'backspace'" class="text-lg">←</span>
          <span *ngIf="key === 'clear'" class="text-lg">×</span>
          <span *ngIf="key !== 'backspace' && key !== 'clear'">{{ key }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .numpad-key { cursor: pointer; }
    .numpad-key:hover { background-color: #f0f0f0; }
    .numpad-key:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
  `],
})
export class PosNumpadComponent {
  /** Текущее значение */
  @Input() value = '';
  /** Подпись над полем */
  @Input() label = '';
  /** Цвет подписи */
  @Input() labelColor = '';
  /** Маскировать ввод (для PIN) */
  @Input() masked = false;
  /** Placeholder */
  @Input() placeholder = '';
  /** Максимальная длина */
  @Input() maxLength = 20;
  /** Высота клавиши (px) */
  @Input() keyHeight = 52;

  /** Изменение значения */
  @Output() valueChange = new EventEmitter<string>();
  /** Нажатие Enter (подтверждение) */
  @Output() enter = new EventEmitter<string>();

  colors = POS_COLORS;

  keys: string[] = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'backspace', '0', 'clear',
  ];

  get displayValue(): string {
    if (!this.value) return this.placeholder;
    if (this.masked) return '●'.repeat(this.value.length);
    return this.value;
  }

  onKey(key: string): void {
    if (key === 'backspace') {
      this.value = this.value.slice(0, -1);
      this.valueChange.emit(this.value);
    } else if (key === 'clear') {
      this.value = '';
      this.valueChange.emit(this.value);
    } else if (key !== '' && this.value.length < this.maxLength) {
      this.value = this.value + key;
      this.valueChange.emit(this.value);
    }
  }
}
