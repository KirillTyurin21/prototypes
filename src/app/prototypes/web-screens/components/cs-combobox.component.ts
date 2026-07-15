import { Component, Input, Output, EventEmitter, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';

/**
 * Кастомный combobox в стиле Material Design (как в реальном Web).
 * Поддерживает одиночный и множественный выбор, поиск, кнопку очистки.
 *
 * Использование:
 * <app-cs-combobox
 *   placeholder="Выбрать"
 *   [options]="themeOptions"
 *   [(value)]="selectedThemeId"
 *   [multi]="false"
 *   displayKey="name"
 *   valueKey="id"
 * ></app-cs-combobox>
 */
@Component({
  selector: 'app-cs-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="combobox" [class.combobox--open]="isOpen" [class.combobox--has-value]="hasValue()" [class.combobox--multi]="multi">
      <!-- Trigger -->
      <button
        type="button"
        class="combobox-trigger"
        (click)="toggle($event)"
        (keydown)="onTriggerKeydown($event)"
        [attr.aria-expanded]="isOpen"
      >
        <span class="combobox-text" [class.combobox-text--placeholder]="!hasValue()">
          {{ displayText() }}
        </span>
        <lucide-icon
          [name]="isOpen ? 'chevron-up' : 'chevron-down'"
          [size]="16"
          class="combobox-chevron"
        ></lucide-icon>
      </button>

      <!-- Clear button -->
      <button
        *ngIf="hasValue()"
        type="button"
        class="combobox-clear"
        (click)="clear($event)"
        title="Очистить"
      >
        <lucide-icon name="x" [size]="14"></lucide-icon>
      </button>

      <!-- Dropdown -->
      <div class="combobox-dropdown" *ngIf="isOpen" (click)="$event.stopPropagation()">
        <!-- Search -->
        <div class="combobox-search" *ngIf="options.length > 5">
          <lucide-icon name="search" [size]="14" class="combobox-search-icon"></lucide-icon>
          <input
            #searchInput
            type="text"
            class="combobox-search-input"
            placeholder="Поиск..."
            [(ngModel)]="searchText"
            (click)="$event.stopPropagation()"
          />
        </div>
        <!-- Options -->
        <div class="combobox-options">
          <div
            *ngFor="let opt of filteredOptions()"
            class="combobox-option"
            [class.combobox-option--selected]="isSelected(opt)"
            (click)="selectOption(opt)"
          >
            <lucide-icon
              *ngIf="multi"
              [name]="isSelected(opt) ? 'check-square' : 'square'"
              [size]="16"
              class="combobox-option-check"
            ></lucide-icon>
            <span>{{ getDisplay(opt) }}</span>
          </div>
          <div *ngIf="filteredOptions().length === 0" class="combobox-option combobox-option--empty">
            Ничего не найдено
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
    }

    .combobox {
      position: relative;
      display: inline-flex;
      align-items: center;
      min-width: 120px;
    }

    /* ─── Trigger button ─── */
    .combobox-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 2px;
      width: 100%;
      min-width: 100px;
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
      white-space: nowrap;
      position: relative;
    }
    .combobox-trigger:hover {
      border-color: rgba(0, 0, 0, 0.4);
    }
    .combobox--open .combobox-trigger {
      border-color: #1976d2;
      box-shadow: 0 0 0 1px #1976d2;
    }

    .combobox-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.4;
    }
    .combobox-text--placeholder {
      color: #9e9e9e;
    }

    .combobox-chevron {
      color: #9e9e9e;
      flex-shrink: 0;
      transition: transform .15s;
    }

    /* ─── Clear button ─── */
    .combobox-clear {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border: none;
      background: none;
      cursor: pointer;
      color: #9e9e9e;
      border-radius: 50%;
      transition: all .15s;
      padding: 0;
      z-index: 2;
    }
    .combobox-clear:hover {
      background: #e0e0e0;
      color: #424242;
    }

    /* ─── Dropdown ─── */
    .combobox-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      min-width: 100%;
      margin-top: 4px;
      background: #fff;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 50;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    /* ─── Search ─── */
    .combobox-search {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .combobox-search-icon {
      color: #9e9e9e;
      flex-shrink: 0;
    }
    .combobox-search-input {
      flex: 1;
      border: none;
      outline: none;
      font-family: 'Roboto', sans-serif;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.87);
      background: transparent;
    }
    .combobox-search-input::placeholder {
      color: #bdbdbd;
    }

    /* ─── Options ─── */
    .combobox-options {
      max-height: 240px;
      overflow-y: auto;
    }
    .combobox-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      color: rgba(0, 0, 0, 0.87);
      cursor: pointer;
      transition: background .1s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .combobox-option:hover {
      background: #f5f5f5;
    }
    .combobox-option--selected {
      background: #e3f2fd;
      color: #1565c0;
    }
    .combobox-option--empty {
      color: #bdbdbd;
      cursor: default;
      font-style: italic;
    }
    .combobox-option--empty:hover {
      background: transparent;
    }
    .combobox-option-check {
      color: #757575;
      flex-shrink: 0;
    }
    .combobox-option--selected .combobox-option-check {
      color: #1976d2;
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

  private elementRef = inject(ElementRef);

  // ─── Public API ───

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
      setTimeout(() => {
        const inp = this.elementRef.nativeElement.querySelector('.combobox-search-input');
        if (inp) (inp as HTMLInputElement).focus();
      }, 50);
    }
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    this.value = this.multi ? [] : null;
    this.valueChange.emit(this.value);
  }

  selectOption(opt: any): void {
    const optValue = this.valueKey ? opt[this.valueKey] : opt;
    if (this.multi) {
      const arr: any[] = Array.isArray(this.value) ? [...this.value] : [];
      const idx = arr.indexOf(optValue);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(optValue);
      }
      this.value = arr;
    } else {
      this.value = optValue;
      this.isOpen = false;
    }
    this.valueChange.emit(this.value);
  }

  // ─── Display ───

  hasValue(): boolean {
    if (this.multi) {
      return Array.isArray(this.value) && this.value.length > 0;
    }
    return this.value !== null && this.value !== undefined && this.value !== '';
  }

  displayText(): string {
    if (!this.hasValue()) return this.placeholder;

    if (this.multi && Array.isArray(this.value)) {
      if (this.value.length === 1) {
        const found = this.findOption(this.value[0]);
        return found ? this.getDisplay(found) : String(this.value[0]);
      }
      const first = this.findOption(this.value[0]);
      const label = first ? this.getDisplay(first) : String(this.value[0]);
      return `${label} (+ ${this.value.length - 1} ${this.pluralize(this.value.length - 1)})`;
    }

    const found = this.findOption(this.value);
    return found ? this.getDisplay(found) : String(this.value ?? '');
  }

  getDisplay(opt: any): string {
    if (typeof opt === 'string' || typeof opt === 'number') return String(opt);
    return opt[this.displayKey] ?? String(opt);
  }

  // ─── Selection ───

  isSelected(opt: any): boolean {
    const optValue = this.valueKey ? opt[this.valueKey] : opt;
    if (this.multi) {
      return Array.isArray(this.value) && this.value.includes(optValue);
    }
    return this.value === optValue;
  }

  // ─── Filtering ───

  filteredOptions(): any[] {
    if (!this.searchText) return this.options;
    const q = this.searchText.toLowerCase();
    return this.options.filter(o => this.getDisplay(o).toLowerCase().includes(q));
  }

  // ─── Keyboard ───

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isOpen = !this.isOpen;
    }
  }

  // ─── Close on outside click ───

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // ─── Helpers ───

  private findOption(value: any): any | undefined {
    return this.options.find(o => {
      const optValue = this.valueKey ? o[this.valueKey] : o;
      return optValue === value;
    });
  }

  private pluralize(n: number): string {
    const m10 = n % 10, m100 = n % 100;
    if (m100 >= 11 && m100 <= 19) return 'других';
    if (m10 === 1) return 'другой';
    if (m10 >= 2 && m10 <= 4) return 'другие';
    return 'других';
  }
}
