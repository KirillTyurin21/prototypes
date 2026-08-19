import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';

/**
 * Боковая панель «Название коллекции» (создание / переименование).
 * Сохранить — disabled при пустом названии.
 */
@Component({
  selector: 'app-collection-create-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="cc-backdrop" *ngIf="open" (click)="cancel()" role="presentation"></div>

    <aside class="cc-panel" *ngIf="open" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <div class="cc-head">
        <h3 class="cc-title">{{ title }}</h3>
        <button type="button" class="cc-close" (click)="cancel()" aria-label="Закрыть">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="cc-body">
        <label class="cc-label" for="cc-name-input">
          Название <span class="cc-req">*</span>
        </label>
        <input
          id="cc-name-input"
          type="text"
          class="cc-input"
          [(ngModel)]="name"
          [placeholder]="placeholder"
          (keydown.enter)="submit()"
          autofocus
        />
        <p class="cc-hint">Название коллекции отображается в дереве слева.</p>
      </div>

      <div class="cc-foot">
        <button type="button" class="cc-btn" (click)="cancel()">Отмена</button>
        <button
          type="button"
          class="cc-btn cc-btn--primary"
          [disabled]="!name.trim()"
          (click)="submit()"
        >
          {{ saveLabel }}
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .cc-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(33, 33, 33, 0.32);
      z-index: 130;
    }
    .cc-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 380px;
      max-width: 92vw;
      display: flex;
      flex-direction: column;
      background: var(--dt-surface-primary);
      border-left: 1px solid #d6d6d6;
      box-shadow: -4px 0 16px rgba(0, 0, 0, 0.12);
      z-index: 131;
      font-family: Roboto, sans-serif;
      animation: cc-in 0.18s ease-out;
    }
    @keyframes cc-in {
      from { transform: translateX(24px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .cc-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #d6d6d6;
    }
    .cc-title { margin: 0; font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
    .cc-close {
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
    .cc-close:hover { background: #ebebeb; }
    .cc-close:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }

    .cc-body { flex: 1; padding: 18px 16px; }
    .cc-label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--dt-text-primary);
    }
    .cc-req { color: #d32f2f; }
    .cc-input {
      width: 100%;
      height: 36px;
      padding: 0 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: var(--dt-text-primary);
      outline: none;
      box-sizing: border-box;
    }
    .cc-input:focus { border-color: var(--dt-brand-accent); }
    .cc-input::placeholder { color: var(--dt-text-disable); }
    .cc-hint { margin-top: 8px; font-size: 12px; color: var(--dt-text-disable); }

    .cc-foot {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 16px;
      border-top: 1px solid #d6d6d6;
    }
    .cc-btn {
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
    .cc-btn:hover { background: #ebebeb; }
    .cc-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
    .cc-btn--primary {
      border: none;
      background: var(--dt-brand-accent);
      color: var(--dt-text-inverse);
    }
    .cc-btn--primary:hover { background: #3969d5; }
    .cc-btn--primary:disabled {
      background: #d6d6d6;
      color: var(--dt-text-disable);
      cursor: default;
    }
  `],
})
export class CollectionCreatePanelComponent implements OnChanges {
  @Input() open = false;
  @Input() title = 'Новая коллекция';
  @Input() saveLabel = 'Сохранить';
  @Input() placeholder = 'Введите название коллекции';
  @Input() initialName = '';

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  name = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.name = this.initialName;
    }
  }

  cancel(): void {
    this.close.emit();
  }

  submit(): void {
    const value = this.name.trim();
    if (!value) return;
    this.save.emit(value);
    this.close.emit();
  }
}
