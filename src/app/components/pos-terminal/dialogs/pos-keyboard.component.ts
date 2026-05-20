import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { POS_COLORS } from '../types';

/**
 * POS Keyboard — экранная QWERTY-клавиатура (русская/английская).
 *
 * Полноразмерная клавиатура для ввода текста в диалогах плагинов.
 * Поддерживает переключение RU/EN, регистр (Shift), Backspace, Enter,
 * навигационные клавиши (Home, End, стрелки), Delete, «Стереть всё».
 *
 * @example
 * <pos-keyboard
 *   [value]="searchText"
 *   title="ВВЕДИТЕ ПРАВО"
 *   (valueChange)="searchText = $event"
 *   (confirm)="onSearch()"
 *   (cancel)="closeKeyboard()">
 * </pos-keyboard>
 */
@Component({
  selector: 'pos-keyboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full"
         [style.background-color]="colors.terminalBg">

      <!-- Title -->
      <div *ngIf="title"
           class="text-center py-2 text-sm font-medium text-white"
           [style.background-color]="colors.headerBg">
        {{ title }}
      </div>

      <!-- Input field + nav keys -->
      <div class="flex gap-1 p-2">
        <!-- Text area -->
        <div class="flex-1 min-h-[48px] p-2 text-sm text-white font-mono rounded"
             style="background-color: #555; word-break: break-all; white-space: pre-wrap;">
          {{ value }}<span class="animate-pulse">|</span>
        </div>

        <!-- Navigation keys (right side) -->
        <div class="flex flex-col gap-px shrink-0" style="width: 140px;">
          <div class="flex gap-px">
            <button (click)="onAction('clear-all')"
                    class="kb-key flex-1 text-[11px] py-1.5 bg-gray-300 text-gray-700">
              Стереть все
            </button>
            <button (click)="onAction('delete')"
                    class="kb-key w-10 text-xs py-1.5 bg-gray-300 text-gray-700">
              Del
            </button>
          </div>
          <div class="flex gap-px">
            <button (click)="onAction('home')"
                    class="kb-key flex-1 text-[11px] py-1.5 bg-gray-300 text-gray-700">Home</button>
            <button class="kb-key w-8 text-xs py-1.5 bg-gray-300 text-gray-700">∧</button>
            <button (click)="onAction('end')"
                    class="kb-key flex-1 text-[11px] py-1.5 bg-gray-300 text-gray-700">End</button>
          </div>
          <div class="flex gap-px">
            <button class="kb-key flex-1 text-xs py-1.5 bg-gray-300 text-gray-700">‹</button>
            <button class="kb-key w-8 text-xs py-1.5 bg-gray-300 text-gray-700">∨</button>
            <button class="kb-key flex-1 text-xs py-1.5 bg-gray-300 text-gray-700">›</button>
          </div>
        </div>
      </div>

      <!-- Keyboard rows -->
      <div class="flex flex-col gap-px px-1 pb-1 flex-1">
        <!-- Number row -->
        <div class="flex gap-px">
          <button *ngFor="let k of numberRow"
                  (click)="onChar(k)"
                  class="kb-key flex-1 text-base py-2 bg-white text-gray-800">
            {{ shifted ? k : k }}
          </button>
          <button (click)="onAction('backspace')"
                  class="kb-key w-16 text-base py-2 bg-white text-gray-800">←</button>
        </div>

        <!-- Row 1 (QWERTY / ЙЦУКЕН) -->
        <div class="flex gap-px">
          <div class="w-3"></div>
          <button *ngFor="let k of currentRow1"
                  (click)="onChar(k)"
                  class="kb-key flex-1 text-base py-2 bg-white text-gray-800">
            {{ shifted ? k.toUpperCase() : k }}
          </button>
          <button (click)="onChar('\\\\')"
                  class="kb-key w-8 text-base py-2 bg-white text-gray-800">\\</button>
        </div>

        <!-- Row 2 (ASDF / ФЫВА) -->
        <div class="flex gap-px">
          <button *ngFor="let k of currentRow2"
                  (click)="onChar(k)"
                  class="kb-key flex-1 text-base py-2 bg-white text-gray-800">
            {{ shifted ? k.toUpperCase() : k }}
          </button>
          <button (click)="onAction('enter')"
                  class="kb-key w-16 text-base py-2 bg-gray-200 text-gray-700">Enter</button>
        </div>

        <!-- Row 3 (ZXCV / ЯЧСМ) -->
        <div class="flex gap-px">
          <button (click)="shifted = !shifted"
                  class="kb-key w-20 text-[11px] py-2 text-gray-700"
                  [class.bg-gray-400]="shifted"
                  [class.bg-gray-200]="!shifted">
            Регистр
          </button>
          <button *ngFor="let k of currentRow3"
                  (click)="onChar(k)"
                  class="kb-key flex-1 text-base py-2 bg-white text-gray-800">
            {{ shifted ? k.toUpperCase() : k }}
          </button>
          <button (click)="shifted = !shifted"
                  class="kb-key w-20 text-[11px] py-2 text-gray-700"
                  [class.bg-gray-400]="shifted"
                  [class.bg-gray-200]="!shifted">
            Регистр
          </button>
        </div>

        <!-- Space row -->
        <div class="flex gap-px">
          <div class="w-3" [style.background-color]="colors.terminalBg"></div>
          <button (click)="toggleLang()"
                  class="kb-key w-14 text-xs py-2"
                  [class.bg-gray-100]="lang === 'en'"
                  [class.bg-gray-300]="lang === 'ru'"
                  [style.color]="lang === 'en' ? '#d32f2f' : '#666'">
            {{ lang === 'ru' ? 'EN' : 'RU' }}
          </button>
          <button (click)="onChar(' ')"
                  class="kb-key flex-1 py-2 bg-white"></button>
          <button class="kb-key w-14 text-[11px] py-2 bg-gray-200 text-gray-700">Alt Gr</button>
          <div class="w-3" [style.background-color]="colors.terminalBg"></div>
        </div>
      </div>

      <!-- Bottom: OK / Cancel -->
      <div class="flex border-t border-gray-700"
           [style.background-color]="colors.headerBg">
        <button (click)="confirm.emit(value)"
                class="kb-bottom-btn flex-1 py-2.5 text-sm font-bold text-white">
          ОК
        </button>
        <button (click)="cancel.emit()"
                class="kb-bottom-btn flex-1 py-2.5 text-sm font-bold text-white">
          Отмена
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .kb-key {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px;
      transition: background-color 0.05s;
      user-select: none;
    }
    .kb-key:hover { filter: brightness(0.95); }
    .kb-key:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
    .kb-bottom-btn {
      cursor: pointer;
      transition: background-color 0.1s;
    }
    .kb-bottom-btn:hover { background-color: #383838; }
    .kb-bottom-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
  `],
})
export class PosKeyboardComponent {
  /** Текущее значение поля ввода */
  @Input() value = '';
  /** Заголовок клавиатуры */
  @Input() title = '';

  /** Изменение значения */
  @Output() valueChange = new EventEmitter<string>();
  /** Подтверждение (OK / Enter) */
  @Output() confirm = new EventEmitter<string>();
  /** Отмена */
  @Output() cancel = new EventEmitter<void>();

  colors = POS_COLORS;
  lang: 'ru' | 'en' = 'ru';
  shifted = false;

  numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];

  // Russian layout
  ruRow1 = ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'];
  ruRow2 = ['ё', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'];
  ruRow3 = ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.'];

  // English layout
  enRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];
  enRow2 = ['`', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
  enRow3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

  get currentRow1(): string[] { return this.lang === 'ru' ? this.ruRow1 : this.enRow1; }
  get currentRow2(): string[] { return this.lang === 'ru' ? this.ruRow2 : this.enRow2; }
  get currentRow3(): string[] { return this.lang === 'ru' ? this.ruRow3 : this.enRow3; }

  toggleLang(): void {
    this.lang = this.lang === 'ru' ? 'en' : 'ru';
  }

  onChar(char: string): void {
    const c = this.shifted ? char.toUpperCase() : char;
    this.value = this.value + c;
    this.valueChange.emit(this.value);
    if (this.shifted) this.shifted = false;
  }

  onAction(action: string): void {
    switch (action) {
      case 'backspace':
        this.value = this.value.slice(0, -1);
        break;
      case 'delete':
        this.value = this.value.slice(1);
        break;
      case 'clear-all':
        this.value = '';
        break;
      case 'home':
      case 'end':
        // Visual-only cursor in prototype
        break;
      case 'enter':
        this.confirm.emit(this.value);
        return;
    }
    this.valueChange.emit(this.value);
  }
}
