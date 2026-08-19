import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { CheckListPickerItem } from '../../types';

/**
 * Generic-пикер с чекбоксами: поиск + «Все» + плоский список + счётчик.
 * Используется для выбора коллекций и событий (аналог combobox на стенде).
 */
@Component({
  selector: 'app-check-list-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="cp-backdrop" *ngIf="open" (click)="close.emit()" role="presentation"></div>

    <div class="cp-modal" *ngIf="open" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <div class="cp-head">
        <div class="cp-head-text">
          <h3 class="cp-title">{{ title }}</h3>
          <p class="cp-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <button type="button" class="cp-close" (click)="close.emit()" aria-label="Закрыть">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="cp-search">
        <lucide-icon name="search" [size]="14"></lucide-icon>
        <input
          type="text"
          [(ngModel)]="search"
          [placeholder]="searchPlaceholder"
          [attr.aria-label]="searchPlaceholder"
        />
      </div>

      <button type="button" class="cp-all" (click)="toggleAll()">
        {{ allFilteredSelected ? 'Снять все' : 'Все' }}
      </button>

      <div class="cp-list">
        <div class="cp-empty" *ngIf="filteredItems.length === 0">
          <lucide-icon name="search" [size]="18"></lucide-icon>
          <span>Ничего не найдено</span>
        </div>

        <label class="cp-item" *ngFor="let it of filteredItems" [class.cp-item--checked]="draft.has(it.id)">
          <input
            type="checkbox"
            [checked]="draft.has(it.id)"
            (change)="toggleItem(it.id)"
          />
          <span class="cp-name">{{ it.label }}</span>
        </label>
      </div>

      <div class="cp-foot">
        <span class="cp-count">Выбрано: <b>{{ draft.size }}</b></span>
        <button type="button" class="cp-btn cp-btn--ghost" (click)="clearAll()">Очистить</button>
        <button type="button" class="cp-btn cp-btn--primary" (click)="confirmSelection()">{{ confirmLabel }}</button>
      </div>
    </div>
  `,
  styles: [`
    .cp-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(33, 33, 33, 0.32);
      z-index: 140;
    }
    .cp-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 480px;
      max-width: 94vw;
      max-height: 82vh;
      display: flex;
      flex-direction: column;
      background: var(--dt-surface-primary);
      border-radius: 4px;
      box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.6), 0 8px 10px rgba(214, 214, 214, 0.6);
      z-index: 141;
      font-family: Roboto, sans-serif;
      animation: cp-in 0.16s ease-out;
      overflow: hidden;
    }
    @keyframes cp-in {
      from { opacity: 0; transform: translate(-50%, -46%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }

    .cp-head {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid #d6d6d6;
    }
    .cp-head-text { flex: 1; min-width: 0; }
    .cp-title { margin: 0; font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
    .cp-subtitle { margin: 2px 0 0; font-size: 12px; color: var(--dt-text-secondary); }
    .cp-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-secondary);
      cursor: pointer;
    }
    .cp-close:hover { background: #ebebeb; }
    .cp-close:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }

    .cp-search {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 16px 0;
      padding: 0 10px;
      height: 36px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-secondary);
    }
    .cp-search:focus-within { border-color: var(--dt-brand-accent); }
    .cp-search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      color: var(--dt-text-primary);
    }
    .cp-search input::placeholder { color: var(--dt-text-disable); }

    .cp-all {
      align-self: flex-start;
      margin: 10px 16px 0;
      padding: 4px 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
      font-size: 12.5px;
      cursor: pointer;
    }
    .cp-all:hover { background: #ebebeb; }
    .cp-all:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }

    .cp-list {
      flex: 1;
      overflow-y: auto;
      min-height: 120px;
      max-height: 320px;
      margin: 10px 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
    }
    .cp-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 28px;
      color: var(--dt-text-disable);
      font-size: 13px;
    }
    .cp-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 16px;
      cursor: pointer;
      font-size: 13.5px;
      color: var(--dt-text-primary);
      transition: background 0.1s ease;
    }
    .cp-item:hover { background: #ebebeb; }
    .cp-item--checked { background: var(--dt-surface-sidebar-selected); }
    .cp-item input {
      width: 15px;
      height: 15px;
      margin: 0;
      flex-shrink: 0;
      accent-color: var(--dt-brand-accent);
      cursor: pointer;
    }
    .cp-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cp-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
    }
    .cp-count { flex: 1; font-size: 13px; color: var(--dt-text-secondary); }
    .cp-count b { color: var(--dt-text-primary); }
    .cp-btn {
      height: 36px;
      padding: 0 18px;
      border-radius: 4px;
      border: 1px solid #d6d6d6;
      background: var(--dt-surface-primary);
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.12s ease;
    }
    .cp-btn:hover { background: #ebebeb; }
    .cp-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
    .cp-btn--primary {
      border: none;
      background: var(--dt-brand-accent);
      color: var(--dt-text-inverse);
    }
    .cp-btn--primary:hover { background: #3969d5; }
  `],
})
export class CheckListPickerModalComponent implements OnChanges {
  @Input() open = false;
  @Input() title = 'Выберите элементы';
  @Input() subtitle = '';
  @Input() searchPlaceholder = 'Поиск...';
  @Input() confirmLabel = 'Готово';
  @Input() items: CheckListPickerItem[] = [];
  @Input() selectedIds: (string | number)[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<(string | number)[]>();

  search = '';
  draft = new Set<string | number>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedIds'] || changes['open']) {
      this.draft = new Set(this.selectedIds);
    }
    if (changes['open'] && this.open) {
      this.search = '';
    }
  }

  get filteredItems(): CheckListPickerItem[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.items;
    return this.items.filter(it => it.label.toLowerCase().includes(q));
  }

  get allFilteredSelected(): boolean {
    return this.filteredItems.length > 0 && this.filteredItems.every(it => this.draft.has(it.id));
  }

  toggleItem(id: string | number): void {
    if (this.draft.has(id)) {
      this.draft.delete(id);
    } else {
      this.draft.add(id);
    }
  }

  toggleAll(): void {
    if (this.allFilteredSelected) {
      this.filteredItems.forEach(it => this.draft.delete(it.id));
    } else {
      this.filteredItems.forEach(it => this.draft.add(it.id));
    }
  }

  clearAll(): void {
    this.draft.clear();
  }

  confirmSelection(): void {
    this.confirm.emit(Array.from(this.draft));
    this.close.emit();
  }
}
