import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

export interface CsMultiSelectOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-cs-multi-select-cell',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="cs-field-cell" (click)="$event.stopPropagation()">
      <span class="cs-field-label">Выбрать</span>
      <div class="cs-field-dropdown">
        <button class="cs-multiselect-trigger" (click)="onToggle()" type="button">
          <span class="cs-multiselect-text">{{ summary }}</span>
          <lucide-icon [name]="open ? 'chevron-up' : 'chevron-down'" [size]="14" class="cs-multiselect-chevron"></lucide-icon>
        </button>
        <button class="cs-clear-btn" *ngIf="selectedIds.length > 0" (click)="onClear(); $event.stopPropagation()">
          <lucide-icon name="x" [size]="14"></lucide-icon>
        </button>
        <div class="cs-multiselect-dropdown" *ngIf="open">
          <label class="cs-multiselect-option" *ngFor="let opt of options">
            <input type="checkbox" class="cs-checkbox cs-checkbox--small" [checked]="selectedIds.includes(opt.id)" (change)="onToggleOption(opt.id)" />
            <span>{{ opt.name }}</span>
          </label>
          <div *ngIf="options.length === 0" class="cs-multiselect-empty">{{ emptyText }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cs-field-cell { display: flex; flex-direction: column; gap: 2px; }
    .cs-field-label { font-size: 11px; color: #9e9e9e; line-height: 1; }
    .cs-field-dropdown { display: flex; align-items: center; gap: 4px; position: relative; }
    .cs-clear-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: none; background: none; cursor: pointer; color: #bdbdbd; border-radius: 50%; flex-shrink: 0; transition: all .15s; }
    .cs-clear-btn:hover { background: #f5f5f5; color: #757575; }
    .cs-multiselect-trigger { display: flex; align-items: center; justify-content: space-between; flex: 1; min-width: 0; padding: 6px 10px; font-size: 13px; font-family: 'Roboto', sans-serif; border: 1px solid rgba(0,0,0,.2); border-radius: 4px; background: #fff; cursor: pointer; color: rgba(0,0,0,.87); text-align: left; transition: border-color .15s; gap: 4px; }
    .cs-multiselect-trigger:hover { border-color: rgba(0,0,0,.4); }
    .cs-multiselect-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
    .cs-multiselect-chevron { color: #757575; flex-shrink: 0; }
    .cs-multiselect-dropdown { position: absolute; top: calc(100% + 2px); left: 0; right: 0; min-width: 200px; background: #fff; border: 1px solid rgba(0,0,0,.12); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,.15); z-index: 30; max-height: 220px; overflow-y: auto; padding: 4px 0; animation: cs-dropdown-in .12s ease-out; }
    @keyframes cs-dropdown-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .cs-multiselect-option { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 13px; cursor: pointer; transition: background .1s; color: rgba(0,0,0,.87); }
    .cs-multiselect-option:hover { background: #f5f5f5; }
    .cs-multiselect-empty { padding: 12px; font-size: 13px; color: #9e9e9e; text-align: center; }
    .cs-checkbox { appearance: none; -webkit-appearance: none; width: 16px; height: 16px; border: 2px solid rgba(0,0,0,.38); border-radius: 2px; cursor: pointer; position: relative; transition: all .15s; flex-shrink: 0; background: #fff; }
    .cs-checkbox:hover { border-color: #1976d2; }
    .cs-checkbox:checked { background: #1976d2; border-color: #1976d2; }
    .cs-checkbox:checked::after { content: ''; position: absolute; top: 0px; left: 4px; width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
  `],
})
export class CsMultiSelectCellComponent {
  @Input() options: CsMultiSelectOption[] = [];
  @Input() selectedIds: number[] = [];
  @Input() summary = '— Не выбрано —';
  @Input() emptyText = 'Нет доступных вариантов';
  @Input() open = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() toggleOption = new EventEmitter<number>();

  onToggle(): void { this.toggle.emit(); }
  onClear(): void { this.clear.emit(); }
  onToggleOption(id: number): void { this.toggleOption.emit(id); }
}
