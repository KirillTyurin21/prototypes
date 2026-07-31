import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Кастомный combobox в стиле Material Design.
 * Поддерживает одиночный и множественный выбор (multi).
 *
 * Использование:
 * <app-cs-combobox
 *   placeholder="Выбрать"
 *   [options]="themeOptions"
 *   [value]="selectedIds"
 *   [multi]="true"
 *   displayKey="name"
 *   valueKey="id"
 *   (valueChange)="onChange($event)"
 * ></app-cs-combobox>
 *
 * При multi=true value ожидается как number[].
 * При multi=false value ожидается как number | null.
 */
@Component({
  selector: 'app-cs-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cs-select-wrap" [class.cs-select-wrap--open]="isOpen" [class.cs-select-wrap--has-value]="hasValue()">
      <!-- Триггер -->
      <button
        type="button"
        class="cs-select-trigger"
        (click)="toggle()"
        [title]="getDisplayText()"
      >
        <span class="cs-select-text" [class.cs-select-text--placeholder]="!hasValue()">
          {{ getDisplayText() }}
        </span>
        <span class="cs-select-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="#9e9e9e" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
      </button>

      <!-- Кнопка очистки -->
      <button
        *ngIf="hasValue()"
        type="button"
        class="cs-select-clear"
        (click)="clear(); $event.stopPropagation()"
        title="Очистить"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3L11 11M11 3L3 11" stroke="#9e9e9e" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Выпадающий список -->
      <div class="cs-select-dropdown" *ngIf="isOpen">
        <!-- Поиск (при >5 опций) -->
        <div class="cs-select-search" *ngIf="options.length > 5">
          <input
            type="text"
            class="cs-select-search-input"
            placeholder="Поиск..."
            [(ngModel)]="searchText"
            (click)="$event.stopPropagation()"
          />
        </div>

        <!-- Список опций -->
        <div class="cs-select-options">
          <div
            *ngFor="let opt of filteredOptions"
            class="cs-select-option"
            [class.cs-select-option--selected]="isSelected(opt)"
            [class.cs-select-option--multi]="multi"
            (click)="toggleOption(opt); $event.stopPropagation()"
          >
            <!-- Чекбокс для multi -->
            <label class="cs-checkbox-wrap" *ngIf="multi" (click)="$event.stopPropagation()">
              <input
                type="checkbox"
                class="cs-checkbox"
                [checked]="isSelected(opt)"
                (change)="toggleOption(opt)"
              />
            </label>
            <span class="cs-select-option-label">{{ displayKey ? opt[displayKey] : opt }}</span>
            <!-- Значок платной темы (вариант F) -->
            <span
              *ngIf="opt.hasPremiumElements"
              class="cs-select-option-premium"
              title="Содержит платный контент">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="16.5" r="1.2" fill="currentColor"/>
              </svg>
            </span>
          </div>
          <div *ngIf="filteredOptions.length === 0" class="cs-select-no-results">
            Ничего не найдено
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: inline-block; width: 100%; }

    .cs-select-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 100%;
    }

    /* ─── Trigger ─── */
    .cs-select-trigger {
      display: flex;
      align-items: center;
      width: 100%;
      height: 34px;
      padding: 0 28px 0 8px;
      font-family: 'Roboto', sans-serif;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.87);
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.23);
      border-radius: 4px;
      cursor: pointer;
      transition: border-color .15s, box-shadow .15s;
      text-align: left;
      outline: none;
      gap: 0;
    }
    .cs-select-trigger:hover { border-color: rgba(0, 0, 0, 0.4); }
    .cs-select-wrap--open .cs-select-trigger {
      border-color: #1976d2;
      box-shadow: 0 0 0 1px #1976d2;
    }
    .cs-select-wrap--has-value .cs-select-trigger {
      padding-right: 52px;
    }

    .cs-select-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.3;
    }
    .cs-select-text--placeholder {
      color: #9e9e9e;
    }

    .cs-select-arrow {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      display: flex;
      align-items: center;
    }
    .cs-select-wrap--open .cs-select-arrow svg {
      transform: rotate(180deg);
    }

    /* ─── Clear ─── */
    .cs-select-clear {
      position: absolute;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 50%;
      padding: 0;
      z-index: 1;
      transition: all .15s;
    }
    .cs-select-clear:hover { background: #e0e0e0; }
    .cs-select-clear:hover svg path { stroke: #424242; }

    /* ─── Dropdown ─── */
    .cs-select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 2px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
      z-index: 50;
      min-width: 100%;
      max-height: 280px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .cs-select-search {
      padding: 8px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      flex-shrink: 0;
    }
    .cs-select-search-input {
      width: 100%;
      padding: 6px 8px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid rgba(0, 0, 0, 0.23);
      border-radius: 4px;
      outline: none;
      box-sizing: border-box;
    }
    .cs-select-search-input:focus {
      border-color: #1976d2;
    }

    .cs-select-options {
      overflow-y: auto;
      flex: 1;
    }

    .cs-select-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      color: rgba(0, 0, 0, 0.87);
      transition: background .1s;
      min-height: 34px;
    }
    .cs-select-option:hover { background: #f5f5f5; }
    .cs-select-option--selected { background: #e3f2fd; }
    .cs-select-option--selected:hover { background: #bbdefb; }

    .cs-select-option-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cs-select-option-premium {
      display: inline-flex;
      align-items: center;
      color: #ff6d00;
      cursor: help;
      flex-shrink: 0;
    }

    .cs-select-no-results {
      padding: 16px;
      text-align: center;
      color: #9e9e9e;
      font-size: 13px;
    }

    /* ─── Checkbox (внутри дропдауна) ─── */
    .cs-checkbox-wrap {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .cs-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.38);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      background: #fff;
      transition: all .15s;
      margin: 0;
    }
    .cs-checkbox:checked {
      background: #1976d2;
      border-color: #1976d2;
    }
    .cs-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 5px;
      height: 9px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  `],
})
export class CsComboboxComponent {
  @Input() placeholder = 'Выбрать';
  @Input() options: any[] = [];
  @Input() value: any = null;
  @Input() multi = false;
  @Input() displayKey = 'name';
  @Input() valueKey = 'id';

  @Output() valueChange = new EventEmitter<any>();

  isOpen = false;
  searchText = '';

  constructor(private el: ElementRef) {}

  // ─── Внешний клик → закрыть ───

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchText = '';
    }
  }

  // ─── Фильтрация опций ───

  get filteredOptions(): any[] {
    if (!this.searchText) return this.options;
    const q = this.searchText.toLowerCase();
    return this.options.filter(o => {
      const label = (this.displayKey ? o[this.displayKey] : o) ?? '';
      return String(label).toLowerCase().includes(q);
    });
  }

  // ─── Значение ───

  hasValue(): boolean {
    if (this.multi) {
      return Array.isArray(this.value) && this.value.length > 0;
    }
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  getDisplayText(): string {
    if (!this.hasValue()) return this.placeholder;

    if (this.multi && Array.isArray(this.value)) {
      if (this.value.length === 1) {
        return this.getOptionName(this.value[0]);
      }
      // «Выбрано N» или перечисление
      return this.value.length + ' выбрано';
    }

    // Одиночный выбор
    return this.getOptionName(this.value);
  }

  private getOptionName(val: any): string {
    if (val === null || val === undefined) return this.placeholder;
    if (this.valueKey) {
      const opt = this.options.find(o => o[this.valueKey] === val);
      return opt ? (this.displayKey ? opt[this.displayKey] : String(opt)) : String(val);
    }
    return String(val);
  }

  isSelected(opt: any): boolean {
    const optVal = this.valueKey ? opt[this.valueKey] : opt;
    if (this.multi && Array.isArray(this.value)) {
      return this.value.includes(optVal);
    }
    return this.value === optVal;
  }

  // ─── Действия ───

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) this.searchText = '';
  }

  toggleOption(opt: any): void {
    const optVal = this.valueKey ? opt[this.valueKey] : opt;

    if (this.multi) {
      const arr: number[] = Array.isArray(this.value) ? [...this.value] : [];
      const idx = arr.indexOf(optVal);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(optVal);
      }
      this.value = arr;
      this.valueChange.emit(arr);
    } else {
      // Одиночный выбор
      this.value = optVal;
      this.valueChange.emit(optVal);
      this.isOpen = false;
      this.searchText = '';
    }
  }

  clear(): void {
    if (this.multi) {
      this.value = [];
      this.valueChange.emit([]);
    } else {
      this.value = null;
      this.valueChange.emit(null);
    }
    this.isOpen = false;
    this.searchText = '';
  }
}
