import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Стилизованный select в стиле Material Design.
 * Простой и надёжный — использует нативный <select>.
 *
 * Использование:
 * <app-cs-combobox
 *   placeholder="Выбрать"
 *   [options]="themeOptions"
 *   [(value)]="selectedThemeId"
 *   displayKey="name"
 *   valueKey="id"
 * ></app-cs-combobox>
 */
@Component({
  selector: 'app-cs-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cs-select-wrap" [class.cs-select-wrap--has-value]="hasValue()">
      <select
        class="cs-select"
        [ngModel]="value"
        (ngModelChange)="onChange($event)"
      >
        <option [ngValue]="null" disabled hidden>{{ placeholder }}</option>
        <option
          *ngFor="let opt of options"
          [ngValue]="valueKey ? opt[valueKey] : opt"
        >
          {{ displayKey ? opt[displayKey] : opt }}
        </option>
      </select>
      <span class="cs-select-arrow">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="#9e9e9e" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
      <button
        *ngIf="hasValue()"
        type="button"
        class="cs-select-clear"
        (click)="clear()"
        title="Очистить"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3L11 11M11 3L3 11" stroke="#9e9e9e" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
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

    .cs-select {
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
      appearance: none;
      -webkit-appearance: none;
      outline: none;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .cs-select:hover { border-color: rgba(0, 0, 0, 0.4); }
    .cs-select:focus { border-color: #1976d2; box-shadow: 0 0 0 1px #1976d2; }
    .cs-select option[disabled] { color: #9e9e9e; }

    .cs-select-arrow {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      display: flex;
      align-items: center;
    }

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
      transition: all .15s;
    }
    .cs-select-clear:hover { background: #e0e0e0; }
    .cs-select-clear:hover svg path { stroke: #424242; }
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

  hasValue(): boolean {
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  onChange(val: any): void {
    this.value = val;
    this.valueChange.emit(val === '__clear__' ? null : val);
  }

  clear(): void {
    this.value = null;
    this.valueChange.emit(null);
  }
}
