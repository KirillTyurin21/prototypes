import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { POS_COLORS } from '../types';

/** Поле карточки гостя */
export interface PosGuestField {
  label: string;
  value: string;
  editable?: boolean;
}

/**
 * POS Guest Card — карточка гостя / программы лояльности.
 *
 * Двухколоночный макет: слева подписи полей (выровнены вправо),
 * справа значения. Жёлтый заголовок, тёмный фон, кнопки действий внизу.
 *
 * Используется при идентификации гостя, отображении бонусного баланса,
 * начислении / списании баллов, управлении данными гостя.
 *
 * @example
 * <pos-guest-card
 *   title="Гость: Иван Петров"
 *   [fields]="guestFields"
 *   [actions]="['Начислить', 'Списать', 'Отвязать карту', 'Изменить данные']"
 *   (actionClick)="onGuestAction($event)">
 * </pos-guest-card>
 */
@Component({
  selector: 'pos-guest-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full"
         [style.background-color]="colors.dialogBg">

      <!-- Title -->
      <div class="px-3 py-2 text-sm font-bold"
           [style.color]="colors.accent">
        {{ title }}
      </div>

      <!-- Fields grid -->
      <div class="flex-1 overflow-y-auto px-3 py-1 space-y-1.5">
        <div *ngFor="let f of fields"
             class="flex items-start gap-3">
          <span class="w-[45%] text-right text-xs text-gray-400 pt-1 shrink-0">{{ f.label }}</span>
          <span *ngIf="!f.editable"
                class="flex-1 text-sm text-white">{{ f.value || '—' }}</span>
          <input *ngIf="f.editable"
                 [value]="f.value"
                 class="flex-1 text-sm text-white bg-[#555] border border-gray-600
                        rounded px-2 py-0.5 outline-none focus:border-gray-400"
                 readonly />
        </div>
      </div>

      <!-- Action buttons -->
      <div *ngIf="actions.length > 0"
           class="flex flex-wrap gap-1 px-3 py-2 border-t border-gray-600">
        <button *ngFor="let a of actions"
                (click)="actionClick.emit(a)"
                class="gc-btn px-3 py-1.5 text-xs font-medium rounded text-white
                       transition-colors"
                [style.background-color]="colors.bottomBarBg">
          {{ a }}
        </button>
      </div>

      <!-- Bottom buttons: OK / Cancel -->
      <div class="flex border-t border-gray-700"
           [style.background-color]="colors.headerBg">
        <button (click)="confirm.emit()"
                class="gc-bottom flex-1 py-2.5 text-sm font-bold text-white">
          {{ confirmLabel }}
        </button>
        <button *ngIf="showCancel"
                (click)="cancel.emit()"
                class="gc-bottom flex-1 py-2.5 text-sm font-bold text-white">
          {{ cancelLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .gc-btn { cursor: pointer; }
    .gc-btn:hover { filter: brightness(1.2); }
    .gc-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
    .gc-bottom { cursor: pointer; transition: background-color 0.1s; }
    .gc-bottom:hover { background-color: #383838; }
    .gc-bottom:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
  `],
})
export class PosGuestCardComponent {
  /** Заголовок карточки (имя гостя / номер) */
  @Input() title = '';
  /** Массив полей */
  @Input() fields: PosGuestField[] = [];
  /** Кнопки действий */
  @Input() actions: string[] = [];
  /** Текст кнопки подтверждения */
  @Input() confirmLabel = 'ОК';
  /** Текст кнопки отмены */
  @Input() cancelLabel = 'Отмена';
  /** Показывать ли кнопку Отмена */
  @Input() showCancel = true;

  /** Нажатие на действие */
  @Output() actionClick = new EventEmitter<string>();
  /** Подтверждение */
  @Output() confirm = new EventEmitter<void>();
  /** Отмена */
  @Output() cancel = new EventEmitter<void>();

  colors = POS_COLORS;
}
