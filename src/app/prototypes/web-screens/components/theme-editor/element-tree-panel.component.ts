import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { ThemeElement } from '../../cs-types';

export interface ElementTypeOption {
  type: string;
  label: string;
  icon: string;
  disabled: boolean;
}

@Component({
  selector: 'app-element-tree-panel',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="panel-header">
      <span class="panel-title">Элементы</span>
    </div>

    <!-- Add element button + dropdown -->
    <div class="add-element-wrap">
      <button class="app-btn app-btn-primary app-btn-sm app-btn-full" (click)="toggleAddMenu()">
        <lucide-icon name="plus" [size]="14"></lucide-icon>
        Добавить элемент
      </button>
      <div class="add-dropdown" *ngIf="addMenuOpen">
        <div
          *ngFor="let opt of elementTypeOptions"
          class="add-dropdown-item"
          [class.disabled]="opt.disabled"
          (click)="onAddElement(opt)"
        >
          <lucide-icon [name]="opt.icon" [size]="16"></lucide-icon>
          <div class="add-dropdown-label">
            <span class="add-dropdown-name">{{ opt.label }}</span>
            <span class="add-dropdown-desc" *ngIf="opt.disabled">(уже добавлен)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Element list -->
    <div class="tree-list">
      <div
        *ngFor="let el of elements; let i = index"
        class="tree-item"
        [class.selected]="selectedElementId === el.id"
        (click)="selectElement.emit(el.id)"
      >
        <span class="tree-icon">{{ getElementEmoji(el.type) }}</span>
        <span class="tree-name">{{ el.name }}</span>
        <button class="tree-delete" (click)="onDeleteElement(el, $event)" title="Удалить">
          <lucide-icon name="x" [size]="14"></lucide-icon>
        </button>
      </div>
      <div *ngIf="elements.length === 0" class="tree-empty">
        Нет элементов
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; overflow: hidden; height: 100%; }
    .panel-header { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; background: #fff; }
    .panel-title { font-size: 13px; font-weight: 600; color: #424242; text-transform: uppercase; letter-spacing: 0.5px; }

    .add-element-wrap { position: relative; padding: 8px; }
    .add-dropdown {
      position: absolute; top: 100%; left: 8px; right: 8px;
      background: #fff; border: 1px solid #e0e0e0; border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12); z-index: 50;
      max-height: 300px; overflow-y: auto;
    }
    .add-dropdown-item {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; cursor: pointer; font-size: 13px; transition: background 0.1s;
    }
    .add-dropdown-item:hover { background: #f0f6ff; }
    .add-dropdown-item.disabled { opacity: 0.4; cursor: default; pointer-events: none; }
    .add-dropdown-label { display: flex; flex-direction: column; }
    .add-dropdown-name { font-weight: 500; color: #212121; }
    .add-dropdown-desc { font-size: 11px; color: #9e9e9e; }

    .tree-list { flex: 1; overflow-y: auto; padding: 4px 0; }
    .tree-item {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; cursor: pointer; font-size: 13px;
      transition: background 0.1s; border-left: 3px solid transparent;
    }
    .tree-item:hover { background: #e8eaf6; }
    .tree-item.selected { background: #e3f2fd; border-left-color: #1976D2; }
    .tree-icon { font-size: 14px; flex-shrink: 0; }
    .tree-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #424242; }
    .tree-delete {
      display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border: none; background: transparent;
      color: #bdbdbd; cursor: pointer; border-radius: 3px;
      opacity: 0; transition: all 0.15s;
    }
    .tree-item:hover .tree-delete { opacity: 1; }
    .tree-delete:hover { background: #ffebee; color: #e53935; }
    .tree-empty { padding: 16px 12px; text-align: center; font-size: 12px; color: #9e9e9e; }

    .app-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 10px; height: 30px; border: none; border-radius: 4px;
      font-size: 12px; font-weight: 500; font-family: Roboto, sans-serif;
      cursor: pointer; white-space: nowrap;
    }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }
    .app-btn-sm { height: 30px; }
    .app-btn-full { width: 100%; justify-content: center; }
  `],
})
export class ElementTreePanelComponent {
  @Input() elements: ThemeElement[] = [];
  @Input() selectedElementId: number | null = null;
  @Input() elementTypeOptions: ElementTypeOption[] = [];

  @Output() selectElement = new EventEmitter<number>();
  @Output() addElement = new EventEmitter<ElementTypeOption>();
  @Output() deleteElement = new EventEmitter<ThemeElement>();

  addMenuOpen = false;

  toggleAddMenu(): void {
    this.addMenuOpen = !this.addMenuOpen;
  }

  onAddElement(opt: ElementTypeOption): void {
    if (opt.disabled) return;
    this.addElement.emit(opt);
    this.addMenuOpen = false;
  }

  onDeleteElement(el: ThemeElement, event: Event): void {
    event.stopPropagation();
    this.deleteElement.emit(el);
  }

  getElementEmoji(type: string): string {
    const map: Record<string, string> = {
      image: '🖼️', text: '📝', animation: '🎬', hints: '💡', advertise: '📢',
    };
    return map[type] ?? '📦';
  }
}
