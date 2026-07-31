import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';

/**
 * Локальные типы (совместимы с ElementCategory/ElementCategoryItem из types.ts,
 * но type — string вместо ArrivalsElementType для поддержки CS/Kiosk).
 */
interface PaletteItem {
  type: string;
  label: string;
  icon: string;
  /** Платный элемент — доступен только при платной лицензии */
  isPremium?: boolean;
}

interface PaletteCategory {
  id: string;
  label: string;
  icon: string;
  collapsed: boolean;
  elements: PaletteItem[];
}

@Component({
  selector: 'app-element-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <!-- ═══════ Resize handle (left edge) ═══════ -->
    <div
      *ngIf="resizable"
      class="palette-resize-handle"
      (mousedown)="onResizeStart($event)">
    </div>

    <!-- ═══════ Title + Close ═══════ -->
    <div class="add-element-header">
      <span class="add-element-title">{{ title }}</span>
      <button class="icon-btn-sm" (click)="closed.emit()">
        <lucide-icon name="x" [size]="18"></lucide-icon>
      </button>
    </div>

    <!-- ═══════ Search ═══════ -->
    <div class="search-elements">
      <input
        type="text"
        class="search-elements-input"
        placeholder="Поиск элементов..."
        [(ngModel)]="searchQuery"
      />
      <lucide-icon
        *ngIf="!searchQuery"
        name="search"
        [size]="16"
        class="search-elements-icon">
      </lucide-icon>
      <button
        *ngIf="searchQuery"
        class="search-elements-clear"
        (click)="searchQuery = ''">
        <lucide-icon name="x" [size]="14"></lucide-icon>
      </button>
    </div>

    <!-- ═══════ Empty state ═══════ -->
    <div
      *ngIf="searchQuery && filteredCategories.length === 0"
      class="search-empty">
      Ничего не найдено
    </div>

    <!-- ═══════ Category accordion ═══════ -->
    <div class="element-categories">
      <div
        *ngFor="let cat of filteredCategories"
        class="category-group">

        <!-- Category header -->
        <div
          class="category-header"
          (click)="toggleCategory(cat)">
          <lucide-icon
            [name]="cat.icon"
            [size]="18"
            class="category-icon">
          </lucide-icon>
          <span class="category-label">{{ cat.label }}</span>
          <span class="category-count">{{ cat.elements.length }}</span>
          <lucide-icon
            [name]="cat.collapsed ? 'chevron-down' : 'chevron-up'"
            [size]="16"
            class="category-chevron">
          </lucide-icon>
        </div>

        <!-- Category elements (collapsed animation) -->
        <div *ngIf="!cat.collapsed" class="category-elements">
          <div
            *ngFor="let el of cat.elements"
            class="element-item"
            (click)="elementSelected.emit(el.type)">
            <lucide-icon
              [name]="el.icon"
              [size]="16"
              class="element-icon">
            </lucide-icon>
            <span>{{ el.label }}</span>
            <!-- Значок платного элемента (вариант B) -->
            <span
              *ngIf="el.isPremium"
              class="premium-badge"
              title="Доступен при платной лицензии">
              <lucide-icon name="alert-circle" [size]="14"></lucide-icon>
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }

    /* ── Resize handle ── */
    .palette-resize-handle {
      position: absolute;
      left: -6px;
      top: 0;
      bottom: 0;
      width: 12px;
      cursor: col-resize;
      z-index: 10;
    }
    .palette-resize-handle:hover {
      background: rgba(25, 118, 210, 0.1);
    }

    /* ── Header ── */
    .add-element-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .add-element-title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
    .icon-btn-sm {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #757575;
      cursor: pointer;
    }
    .icon-btn-sm:hover {
      background: #f0f0f0;
    }

    /* ── Search ── */
    .search-elements {
      position: relative;
      margin-bottom: 12px;
    }
    .search-elements-input {
      width: 100%;
      height: 34px;
      padding: 0 36px 0 36px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 13px;
      font-family: Roboto, sans-serif;
      color: #333;
      box-sizing: border-box;
    }
    .search-elements-input:focus {
      outline: none;
      border-color: #448aff;
    }
    .search-elements-icon {
      position: absolute;
      left: 10px;
      top: 9px;
      color: #9e9e9e;
      pointer-events: none;
    }
    .search-elements-clear {
      position: absolute;
      right: 6px;
      top: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: #9e9e9e;
      cursor: pointer;
    }
    .search-elements-clear:hover {
      background: #f0f0f0;
      color: #333;
    }
    .search-empty {
      padding: 24px 0;
      text-align: center;
      font-size: 13px;
      color: #bdbdbd;
    }

    /* ── Categories ── */
    .element-categories {
      display: flex;
      flex-direction: column;
    }
    .category-group {
      border-bottom: 1px solid #f0f0f0;
    }
    .category-group:last-child {
      border-bottom: none;
    }
    .category-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 8px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;
    }
    .category-header:hover {
      background: #f5f5f5;
    }
    .category-icon {
      color: #757575;
      flex-shrink: 0;
    }
    .category-label {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
    .category-count {
      font-size: 12px;
      color: #9e9e9e;
      background: #f0f0f0;
      border-radius: 10px;
      min-width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
    }
    .category-chevron {
      color: #9e9e9e;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    /* ── Elements inside category ── */
    .category-elements {
      display: flex;
      flex-direction: column;
      padding: 0 0 4px 0;
      animation: accordionIn 0.15s ease-out;
    }
    @keyframes accordionIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .element-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 8px 8px 34px;
      font-size: 13px;
      color: #555;
      cursor: pointer;
      transition: background 0.12s;
    }
    .element-item:hover {
      background: #e3f2fd;
      color: #1976d2;
    }
    .element-item:hover .element-icon {
      color: #1976d2;
    }
    .element-icon {
      color: #9e9e9e;
      flex-shrink: 0;
    }

    /* ── Premium badge (платный элемент) ── */
    .premium-badge {
      display: inline-flex;
      align-items: center;
      margin-left: 6px;
      color: #ff6d00;
      cursor: help;
      flex-shrink: 0;
    }
  `],
})
export class ElementPaletteComponent implements OnDestroy {
  /** Категории с элементами */
  @Input() categories: PaletteCategory[] = [];

  /** Заголовок панели */
  @Input() title = 'Добавить элемент';

  /** Показывать resize handle */
  @Input() resizable = false;

  /** Текущая ширина панели (для two-way binding resize) */
  @Input() panelWidth = 320;

  /** Есть ли платная лицензия (скрывает платные элементы, если нет) */
  @Input() hasPremiumLicense = true;

  /** Выбран элемент — type (строка) */
  @Output() elementSelected = new EventEmitter<string>();

  /** Закрытие панели */
  @Output() closed = new EventEmitter<void>();

  /** Изменение ширины при resize */
  @Output() panelWidthChange = new EventEmitter<number>();

  searchQuery = '';

  /* ── Resize state ── */
  private resizing = false;
  private resizeStartX = 0;
  private resizeStartWidth = 0;
  private boundResizeMove = this.onResizeMove.bind(this);
  private boundResizeEnd = this.onResizeEnd.bind(this);

  ngOnDestroy(): void {
    this.stopResize();
  }

  /** Отфильтрованные категории (поиск без учёта регистра + скрытие платных без лицензии) */
  get filteredCategories(): PaletteCategory[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.categories
      .map(cat => ({
        ...cat,
        elements: cat.elements.filter(el => {
          // Платный элемент без лицензии — скрыть (вариант A)
          if (el.isPremium && !this.hasPremiumLicense) return false;
          // Поиск по названию
          if (q && !el.label.toLowerCase().includes(q)) return false;
          return true;
        }),
      }))
      .filter(cat => cat.elements.length > 0);
  }

  /** Раскрыть/свернуть категорию */
  toggleCategory(cat: PaletteCategory): void {
    // Переключаем исходную категорию в this.categories, а не копию из filteredCategories
    const original = this.categories.find(c => c.id === cat.id);
    if (original) {
      original.collapsed = !original.collapsed;
    }
  }

  /* ── Resize ── */

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.resizing = true;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.panelWidth;
    document.addEventListener('mousemove', this.boundResizeMove);
    document.addEventListener('mouseup', this.boundResizeEnd);
  }

  private onResizeMove(event: MouseEvent): void {
    if (!this.resizing) return;
    const dx = this.resizeStartX - event.clientX;
    this.panelWidth = Math.max(300, Math.min(1200, this.resizeStartWidth + dx));
    this.panelWidthChange.emit(this.panelWidth);
  }

  private onResizeEnd(): void {
    this.stopResize();
  }

  private stopResize(): void {
    this.resizing = false;
    document.removeEventListener('mousemove', this.boundResizeMove);
    document.removeEventListener('mouseup', this.boundResizeEnd);
  }
}
