import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { SoundEventHandler } from '../../types';
import { getHandlerDisplayName } from '../../data/mock-data';

/**
 * Модалка выбора обработчиков: поиск + «Все» + плоский список с чекбоксами.
 * Как дропдаун на стенде, но в модальном окне.
 */
@Component({
  selector: 'app-handler-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="hpm-backdrop" *ngIf="open" (click)="close.emit()" role="presentation"></div>

    <div class="hpm-modal" *ngIf="open" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <div class="hpm-head">
        <div class="hpm-head-text">
          <h3 class="hpm-title">{{ title }}</h3>
          <p class="hpm-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <button type="button" class="hpm-close" (click)="close.emit()" aria-label="Закрыть">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="hpm-search">
        <lucide-icon name="search" [size]="14"></lucide-icon>
        <input
          type="text"
          [(ngModel)]="search"
          placeholder="Поиск обработчика..."
          aria-label="Поиск обработчика"
        />
      </div>

      <button type="button" class="hpm-all" (click)="toggleAll()">
        {{ allFilteredSelected ? 'Снять все' : 'Все' }}
      </button>

      <div class="hpm-list">
        <div class="hpm-empty" *ngIf="filteredHandlers.length === 0">
          <lucide-icon name="search" [size]="18"></lucide-icon>
          <span>Ничего не найдено</span>
        </div>

        <label class="hpm-item" *ngFor="let h of filteredHandlers" [class.hpm-item--checked]="draft.has(h.id)">
          <input
            type="checkbox"
            [checked]="draft.has(h.id)"
            (change)="toggleHandler(h.id)"
          />
          <span class="hpm-icon" *ngIf="h.voiceType === 'generation'">
            <lucide-icon name="mic" [size]="13"></lucide-icon>
          </span>
          <span class="hpm-name">{{ displayName(h) }}</span>
        </label>
      </div>

      <div class="hpm-foot">
        <span class="hpm-count">Выбрано: <b>{{ draft.size }}</b></span>
        <button type="button" class="hpm-btn hpm-btn--ghost" (click)="clearAll()">Очистить</button>
        <button type="button" class="hpm-btn hpm-btn--primary" (click)="confirmSelection()">{{ confirmLabel }}</button>
      </div>
    </div>
  `,
  styles: [`
    .hpm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(33, 33, 33, 0.32);
      z-index: 90;
    }
    .hpm-modal {
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
      border-radius: 8px;
      box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.6), 0 8px 10px rgba(214, 214, 214, 0.6);
      z-index: 91;
      font-family: Roboto, sans-serif;
      animation: hpm-in 0.16s ease-out;
      overflow: hidden;
    }
    @keyframes hpm-in {
      from { opacity: 0; transform: translate(-50%, -46%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }

    .hpm-head {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--dt-stroke-default, #d6d6d6);
    }
    .hpm-head-text { flex: 1; min-width: 0; }
    .hpm-title { margin: 0; font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
    .hpm-subtitle { margin: 2px 0 0; font-size: 12px; color: var(--dt-text-secondary); }
    .hpm-close {
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
    .hpm-close:hover { background: var(--dt-surface-hover); color: var(--dt-text-primary); }

    .hpm-search {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 16px 8px;
      padding: 0 10px;
      height: 34px;
      border: 1px solid var(--dt-stroke-default, #d6d6d6);
      border-radius: 4px;
      color: var(--dt-text-disable);
      background: var(--dt-surface-primary);
    }
    .hpm-search:focus-within { border-color: var(--dt-brand-accent); }
    .hpm-search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      font-family: Roboto, sans-serif;
      font-size: 13px;
      color: var(--dt-text-primary);
      background: none;
    }

    .hpm-all {
      align-self: flex-start;
      margin: 0 16px 8px;
      padding: 2px 8px;
      border: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: var(--dt-brand-accent);
      cursor: pointer;
    }
    .hpm-all:hover { text-decoration: underline; }

    .hpm-list {
      flex: 1;
      min-height: 120px;
      overflow-y: auto;
      padding: 4px 0;
    }
    .hpm-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 28px 0;
      color: var(--dt-text-disable);
      font-size: 13px;
    }
    .hpm-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 16px;
      cursor: pointer;
      font-size: 13px;
      color: var(--dt-text-primary);
    }
    .hpm-item:hover { background: var(--dt-surface-hover); }
    .hpm-item--checked { background: var(--dt-surface-sidebar-selected); }
    .hpm-item--checked .hpm-name { font-weight: 500; color: var(--dt-brand-accent-dark); }
    .hpm-item input { width: 15px; height: 15px; margin: 0; accent-color: var(--dt-brand-accent); cursor: pointer; }
    .hpm-icon { display: inline-flex; color: var(--dt-brand-accent); }
    .hpm-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .hpm-foot {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-top: 1px solid var(--dt-stroke-default, #d6d6d6);
    }
    .hpm-count { margin-right: auto; font-size: 12.5px; color: var(--dt-text-secondary); }
    .hpm-count b { color: var(--dt-brand-accent); font-weight: 500; }
    .hpm-btn {
      padding: 7px 16px;
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .hpm-btn--ghost {
      border: 1px solid var(--dt-stroke-default, #d6d6d6);
      background: var(--dt-surface-primary);
      color: var(--dt-text-primary);
    }
    .hpm-btn--ghost:hover { background: var(--dt-surface-hover); }
    .hpm-btn--primary {
      border: 1px solid transparent;
      background: var(--dt-brand-accent);
      color: #fff;
    }
    .hpm-btn--primary:hover { background: var(--dt-brand-accent-dark); }
  `],
})
export class HandlerPickerModalComponent implements OnChanges {
  @Input() open = false;
  @Input() title = 'Выбор обработчиков';
  @Input() subtitle = '';
  @Input() handlers: SoundEventHandler[] = [];
  @Input() selectedIds: number[] = [];
  @Input() confirmLabel = 'Готово';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<number[]>();

  search = '';
  draft = new Set<number>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.search = '';
      this.draft = new Set(this.selectedIds);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.close.emit();
    }
  }

  get filteredHandlers(): SoundEventHandler[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.handlers;
    return this.handlers.filter(h => h.name.toLowerCase().includes(q));
  }

  get allFilteredSelected(): boolean {
    return this.filteredHandlers.length > 0 && this.filteredHandlers.every(h => this.draft.has(h.id));
  }

  displayName(h: SoundEventHandler): string {
    return getHandlerDisplayName(h.name);
  }

  toggleHandler(id: number): void {
    if (this.draft.has(id)) {
      this.draft.delete(id);
    } else {
      this.draft.add(id);
    }
  }

  toggleAll(): void {
    if (this.allFilteredSelected) {
      this.filteredHandlers.forEach(h => this.draft.delete(h.id));
    } else {
      this.filteredHandlers.forEach(h => this.draft.add(h.id));
    }
  }

  clearAll(): void {
    this.draft.clear();
  }

  confirmSelection(): void {
    this.confirm.emit([...this.draft]);
    this.close.emit();
  }
}
