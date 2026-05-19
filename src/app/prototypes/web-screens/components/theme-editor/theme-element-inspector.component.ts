import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsThemeElement, ArrivalsElementType, ProductCatalogItem } from '../../types';
import { MOCK_PRODUCT_CATALOG } from '../../data/mock-data';
import { CollapsibleSectionComponent } from '../inspector/collapsible-section.component';
import { LayoutFieldsComponent } from '../inspector/layout-fields.component';
import { BorderFieldsComponent } from '../inspector/border-fields.component';
import { FontFieldsComponent } from '../inspector/font-fields.component';
import { AlignFieldsComponent } from '../inspector/align-fields.component';

@Component({
  selector: 'app-theme-element-inspector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    CollapsibleSectionComponent,
    LayoutFieldsComponent,
    BorderFieldsComponent,
    FontFieldsComponent,
    AlignFieldsComponent,
  ],
  template: `
    <!-- ── Text element ── -->
    <ng-container *ngIf="element.type === 'text'">
      <div class="field-group">
        <label class="field-label">Текст</label>
        <textarea class="field-textarea" rows="3"
          [(ngModel)]="element.text"></textarea>
      </div>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <app-font-fields
          [(fontFamily)]="element.fontFamily!"
          [(fontSize)]="element.fontSize!"
          [(fontBold)]="element.fontBold!"
          [(fontItalic)]="element.fontItalic!">
        </app-font-fields>
        <app-align-fields
          [(hAlign)]="element.textAlign!">
        </app-align-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Image element ── -->
    <ng-container *ngIf="element.type === 'image'">
      <div class="field-group">
        <label class="field-label">URL изображения</label>
        <input class="field-input" [(ngModel)]="element.imageUrl" placeholder="https://..." />
      </div>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Generic element (order-number, client-name, etc.) ── -->
    <ng-container *ngIf="isGenericElement(element.type)">
      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>
    </ng-container>

    <!-- ── Price element (Сумма блюда) ── -->
    <ng-container *ngIf="element.type === 'price'">
      <app-collapsible-section title="Номенклатура" [expanded]="true">
        <div *ngIf="!showProductNavigator" class="product-binding">
          <div *ngIf="element.productName" class="product-selected">
            <lucide-icon name="package" [size]="16" class="product-icon"></lucide-icon>
            <span class="product-name" [title]="element.productName">{{ element.productName }}</span>
            <span *ngIf="element.sizeName" class="product-size">({{ element.sizeName }})</span>
            <button class="product-clear-btn" (click)="clearProductBinding()" title="Очистить"><lucide-icon name="x" [size]="14"></lucide-icon></button>
          </div>
          <div *ngIf="!element.productName" class="product-empty">
            <lucide-icon name="info" [size]="14"></lucide-icon>
            <span>Товар не выбран</span>
          </div>
          <button class="product-select-btn" (click)="openProductNavigator()">
            <lucide-icon name="search" [size]="16"></lucide-icon>
            {{ element.productName ? 'Изменить товар' : 'Выбрать товар' }}
          </button>
          <div *ngIf="element.productId && availableSizes.length > 1" class="size-selector">
            <label class="field-label">Размер</label>
            <select class="field-input" [ngModel]="element.sizeId" (ngModelChange)="onSizeChange($event)">
              <option *ngFor="let size of availableSizes" [ngValue]="size.id">{{ size.name }}</option>
            </select>
          </div>
        </div>
        <div *ngIf="showProductNavigator" class="product-navigator">
          <div class="nav-header">
            <button *ngIf="navigationStack.length > 0" class="nav-back-btn" (click)="navigateBack()">
              <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
            </button>
            <span class="nav-title">{{ currentGroupName || 'Номенклатура' }}</span>
            <button class="nav-close-btn" (click)="closeProductNavigator()"><lucide-icon name="x" [size]="16"></lucide-icon></button>
          </div>
          <div class="nav-items">
            <div *ngFor="let item of currentCatalogItems" class="nav-item" (click)="onCatalogItemClick(item)">
              <lucide-icon [name]="item.isGroup ? 'folder' : 'package'" [size]="16" [class.group-icon]="item.isGroup" [class.product-icon]="!item.isGroup"></lucide-icon>
              <span class="nav-item-name">{{ item.name }}</span>
              <lucide-icon *ngIf="item.isGroup && item.hasChildren" name="chevron-right" [size]="14" class="nav-chevron"></lucide-icon>
            </div>
            <div *ngIf="currentCatalogItems.length === 0" class="nav-empty">Нет элементов</div>
          </div>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Предпросмотр цены">
        <div class="field-group">
          <label class="field-label">Цена для предпросмотра</label>
          <input type="number" class="field-input"
            [ngModel]="element.previewPrice ?? 350"
            (ngModelChange)="element.previewPrice = $event"
            min="0" step="1" />
        </div>
        <div class="preview-price-hint">
          <lucide-icon name="info" [size]="14" class="hint-icon"></lucide-icon>
          <span>Цена отображается только в конструкторе для предпросмотра. На реальном экране используется цена из меню.</span>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Валюта">
        <div class="currency-toggle">
          <label class="toggle-row">
            <input type="checkbox" [ngModel]="element.showCurrency" (ngModelChange)="element.showCurrency = $event" />
            <span class="toggle-label">Показывать символ валюты</span>
          </label>
        </div>
        <div *ngIf="element.showCurrency" class="currency-settings">
          <div class="field-group">
            <label class="field-label">Символ</label>
            <select class="field-input" [ngModel]="element.currencySymbol" (ngModelChange)="element.currencySymbol = $event">
              <option *ngFor="let c of currencyOptions" [ngValue]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Позиция</label>
            <select class="field-input" [ngModel]="element.currencyPosition" (ngModelChange)="element.currencyPosition = $event">
              <option value="after">После суммы (350 ₽)</option>
              <option value="before">До суммы (₽ 350)</option>
            </select>
          </div>
        </div>
      </app-collapsible-section>

      <app-collapsible-section title="Макет">
        <app-layout-fields
          [(x)]="element.x" [(y)]="element.y"
          [(width)]="element.width" [(height)]="element.height">
        </app-layout-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Граница">
        <app-border-fields
          [(borderWidth)]="element.borderWidth"
          [(borderColor)]="element.borderColor"
          [(borderRadius)]="element.borderRadius">
        </app-border-fields>
      </app-collapsible-section>

      <app-collapsible-section title="Шрифт">
        <app-font-fields
          [(fontFamily)]="element.fontFamily!"
          [(fontSize)]="element.fontSize!"
          [(fontBold)]="element.fontBold!"
          [(fontItalic)]="element.fontItalic!">
        </app-font-fields>
        <app-align-fields
          [(hAlign)]="element.textAlign!">
        </app-align-fields>
      </app-collapsible-section>
    </ng-container>
  `,
  styles: [`
    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input {
      width: 100%; height: 36px; padding: 0 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; transition: border-color 0.15s;
    }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-textarea {
      width: 100%; padding: 8px 10px; border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      resize: vertical; min-height: 60px; box-sizing: border-box;
    }
    .field-textarea:focus { outline: none; border-color: #448aff; }

    /* Product navigator styles */
    .product-binding { display: flex; flex-direction: column; gap: 8px; }
    .product-selected {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 10px; background: #f5f5f5; border-radius: 4px;
      font-size: 13px; color: #333;
    }
    .product-icon { color: #757575; flex-shrink: 0; }
    .product-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
    .product-size { color: #757575; flex-shrink: 0; }
    .product-clear-btn {
      display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer; flex-shrink: 0;
    }
    .product-clear-btn:hover { background: #ffebee; color: #e53935; }
    .product-select-btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      width: 100%; height: 36px; border: 1px dashed #bdbdbd; border-radius: 4px;
      background: transparent; color: #616161; font-size: 13px;
      font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s;
    }
    .product-select-btn:hover { border-color: #448aff; color: #448aff; background: #f5f8ff; }

    .product-navigator {
      border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden;
    }
    .nav-header {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; background: #fafafa; border-bottom: 1px solid #e0e0e0;
    }
    .nav-back-btn {
      display: flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border: none; border-radius: 3px;
      background: transparent; color: #616161; cursor: pointer;
    }
    .nav-back-btn:hover { background: #e0e0e0; }
    .nav-title { flex: 1; font-size: 13px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .nav-close-btn {
      display: flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border: none; border-radius: 3px;
      background: transparent; color: #757575; cursor: pointer;
    }
    .nav-close-btn:hover { background: #e0e0e0; }
    .nav-items { max-height: 240px; overflow-y: auto; }
    .nav-item {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; cursor: pointer; transition: background 0.1s;
      border-bottom: 1px solid #f5f5f5;
    }
    .nav-item:hover { background: #f5f5f5; }
    .nav-item:last-child { border-bottom: none; }
    .group-icon { color: #ff9800; }
    .nav-item-name { flex: 1; font-size: 13px; color: #333; }
    .nav-chevron { color: #bdbdbd; }
    .nav-empty { padding: 20px; text-align: center; font-size: 13px; color: #9e9e9e; }

    /* Product empty state */
    .product-empty {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 10px; background: #fafafa; border: 1px dashed #e0e0e0;
      border-radius: 4px; font-size: 12px; color: #9e9e9e;
    }
    .size-selector { margin-top: 4px; }

    /* Currency styles */
    .currency-toggle { margin-bottom: 4px; }
    .toggle-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #333; cursor: pointer;
    }
    .toggle-row input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    .toggle-label { user-select: none; }
    .currency-settings { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }

    /* Preview price hint */
    .preview-price-hint {
      display: flex; align-items: flex-start; gap: 6px;
      padding: 8px 10px; background: #fff8e1; border: 1px solid #ffe082;
      border-radius: 4px; font-size: 12px; color: #795548; line-height: 1.4;
      margin-top: 8px;
    }
    .hint-icon { color: #ffa000; flex-shrink: 0; margin-top: 1px; }
  `],
})
export class ThemeElementInspectorComponent implements OnChanges {
  @Input() element!: ArrivalsThemeElement;

  /* ── Product Navigator State ── */
  showProductNavigator = false;
  navigationStack: string[] = [];
  currentGroupId = 'root';
  currentGroupName = '';
  availableSizes: { id: string; name: string }[] = [];

  /* ── Currency Options ── */
  currencyOptions = [
    { value: '₽', label: '₽ — Российский рубль' },
    { value: '$', label: '$ — Доллар США' },
    { value: '€', label: '€ — Евро' },
    { value: '£', label: '£ — Фунт стерлингов' },
    { value: '¥', label: '¥ — Японская иена / Юань' },
    { value: '₸', label: '₸ — Казахстанский тенге' },
    { value: '₴', label: '₴ — Украинская гривна' },
    { value: '₺', label: '₺ — Турецкая лира' },
    { value: '₾', label: '₾ — Грузинский лари' },
    { value: '֏', label: '֏ — Армянский драм' },
    { value: 'сум', label: 'сум — Узбекский сум' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['element'] && this.element?.type === 'price') {
      this.showProductNavigator = false;
      this.loadAvailableSizes();
    }
  }

  private loadAvailableSizes(): void {
    if (this.element.productId) {
      for (const items of Object.values(MOCK_PRODUCT_CATALOG)) {
        const found = items.find(i => i.id === this.element.productId);
        if (found && found.sizes) { this.availableSizes = found.sizes; return; }
      }
    }
    this.availableSizes = [];
  }

  get currentCatalogItems(): ProductCatalogItem[] {
    return MOCK_PRODUCT_CATALOG[this.currentGroupId] || [];
  }

  isGenericElement(type: ArrivalsElementType): boolean {
    return !['text', 'image', 'area', 'price'].includes(type);
  }

  /* ── Product Navigator Methods ── */
  openProductNavigator(): void {
    this.showProductNavigator = true;
    this.navigationStack = [];
    this.currentGroupId = 'root';
    this.currentGroupName = '';
  }

  closeProductNavigator(): void {
    this.showProductNavigator = false;
  }

  navigateBack(): void {
    this.navigationStack.pop();
    const parentId = this.navigationStack.length > 0 ? this.navigationStack[this.navigationStack.length - 1] : 'root';
    this.currentGroupId = parentId;
    this.currentGroupName = parentId === 'root' ? '' : this.findGroupName(parentId);
  }

  onCatalogItemClick(item: ProductCatalogItem): void {
    if (item.isGroup) {
      if (!item.hasChildren) return;
      this.navigationStack.push(item.id);
      this.currentGroupId = item.id;
      this.currentGroupName = item.name;
    } else {
      this.selectProduct(item);
    }
  }

  selectProduct(item: ProductCatalogItem): void {
    this.element.productId = item.id;
    this.element.productName = item.name;
    this.element.name = 'Сумма: ' + this.truncateName(item.name, 20);
    this.availableSizes = item.sizes || [];
    if (this.availableSizes.length > 1) {
      this.element.sizeId = this.availableSizes[0].id;
      this.element.sizeName = this.availableSizes[0].name;
    } else {
      this.element.sizeId = null;
      this.element.sizeName = undefined;
    }
    this.showProductNavigator = false;
  }

  onSizeChange(sizeId: string | null): void {
    this.element.sizeId = sizeId;
    if (sizeId) {
      const size = this.availableSizes.find(s => s.id === sizeId);
      this.element.sizeName = size?.name;
    } else {
      this.element.sizeName = undefined;
    }
  }

  clearProductBinding(): void {
    this.element.productId = undefined;
    this.element.productName = undefined;
    this.element.sizeId = null;
    this.element.sizeName = undefined;
    this.element.name = 'Сумма блюда';
    this.availableSizes = [];
  }

  private truncateName(name: string, maxLen: number): string {
    return name.length > maxLen ? name.slice(0, maxLen) + '…' : name;
  }

  private findGroupName(groupId: string): string {
    for (const key of Object.keys(MOCK_PRODUCT_CATALOG)) {
      const items = MOCK_PRODUCT_CATALOG[key];
      const found = items.find(i => i.id === groupId);
      if (found) return found.name;
    }
    return '';
  }
}
