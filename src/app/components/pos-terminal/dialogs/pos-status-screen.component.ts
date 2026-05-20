import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { POS_COLORS } from '../types';

/**
 * POS Status Screen — экран статуса (успех / ошибка / загрузка / инфо).
 *
 * Полноэкранный (внутри диалога) компонент отображения состояния операции:
 * - `success` — зелёная галочка
 * - `error` — красный крестик
 * - `loading` — вращающийся индикатор
 * - `info` — информационная иконка
 *
 * @example
 * <pos-status-screen
 *   status="success"
 *   title="Заказ оплачен"
 *   message="Сумма 2 450 ₽ списана с карты"
 *   buttonLabel="Готово"
 *   (buttonClick)="close()">
 * </pos-status-screen>
 */
@Component({
  selector: 'pos-status-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full px-6 py-8"
         [style.background-color]="colors.dialogBg">

      <!-- Icon -->
      <div class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
           [style.background-color]="iconBg">
        <lucide-icon *ngIf="status === 'success'" name="check" [size]="32"
                     style="color: #fff"></lucide-icon>
        <lucide-icon *ngIf="status === 'error'" name="x" [size]="32"
                     style="color: #fff"></lucide-icon>
        <lucide-icon *ngIf="status === 'loading'" name="loader-2" [size]="32"
                     class="animate-spin" style="color: #fff"></lucide-icon>
        <lucide-icon *ngIf="status === 'info'" name="info" [size]="32"
                     style="color: #fff"></lucide-icon>
      </div>

      <!-- Title -->
      <div class="text-lg font-bold text-white text-center mb-2"
           *ngIf="title">{{ title }}</div>

      <!-- Message -->
      <div class="text-sm text-gray-300 text-center max-w-xs leading-relaxed"
           *ngIf="message">{{ message }}</div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Action button -->
      <button *ngIf="buttonLabel && status !== 'loading'"
              (click)="buttonClick.emit()"
              class="ss-btn w-full py-3 text-sm font-bold text-white rounded"
              [style.background-color]="buttonBg">
        {{ buttonLabel }}
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .ss-btn { cursor: pointer; transition: filter 0.1s; }
    .ss-btn:hover { filter: brightness(1.15); }
    .ss-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
  `],
})
export class PosStatusScreenComponent {
  /** Тип статуса */
  @Input() status: 'success' | 'error' | 'loading' | 'info' = 'info';
  /** Заголовок */
  @Input() title = '';
  /** Сообщение */
  @Input() message = '';
  /** Текст кнопки (пусто = без кнопки) */
  @Input() buttonLabel = '';

  /** Нажатие кнопки */
  @Output() buttonClick = new EventEmitter<void>();

  colors = POS_COLORS;

  get iconBg(): string {
    switch (this.status) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'loading': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  }

  get buttonBg(): string {
    switch (this.status) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  }
}
