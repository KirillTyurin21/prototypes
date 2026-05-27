import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsThemeElement, ArrivalsElementType, ProductCatalogItem, ProductSize } from '../../types';
import { MOCK_PRODUCT_CATALOG_TREE } from '../../data/mock-data';
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

    <!-- ── Price element (Цена блюда) ── -->
    <ng-container *ngIf="element.type === 'price'">
      <app-collapsible-section title="Номенклатура" [expanded]="true">
        <div *ngIf="!showProductNavigator" class="product-binding">
          <div *ngIf="element.productName || element.modifierName" class="product-selected">
            <lucide-icon [name]="element.bindingType === 'modifier' ? 'puzzle' : 'package'" [size]="16" class="product-icon"></lucide-icon>
            <span class="product-name" [title]="element.productName || element.modifierName">{{ element.productName || element.modifierName }}</span>
            <span *ngIf="element.sizeName" class="product-size">({{ element.sizeName }})</span>
            <button class="product-clear-btn" (click)="clearProductBinding()" title="Очистить"><lucide-icon name="x" [size]="14"></lucide-icon></button>
          </div>
          <div *ngIf="!element.productName && !element.modifierName" class="product-empty">
            <lucide-icon name="info" [size]="14"></lucide-icon>
            <span>Товар не выбран</span>
          </div>
          <button class="product-select-btn" (click)="openProductNavigator()">
            <lucide-icon name="search" [size]="16"></lucide-icon>
            {{ (element.productName || element.modifierName) ? 'Изменить товар' : 'Выбрать товар' }}
          </button>
        </div>
        <div *ngIf="showProductNavigator" class="product-navigator">
          <div class="nav-header">
            <span class="nav-title">Номенклатура</span>
            <button class="nav-close-btn" (click)="closeProductNavigator()"><lucide-icon name="x" [size]="16"></lucide-icon></button>
          </div>
          <div class="tree-search">
            <lucide-icon name="search" [size]="14" class="tree-search-icon"></lucide-icon>
            <input class="tree-search-input" placeholder="Поиск..."
              [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)" />
            <button *ngIf="searchQuery" class="tree-search-clear" (click)="clearSearch()">
              <lucide-icon name="x" [size]="14"></lucide-icon>
            </button>
          </div>
          <div class="tree-items">
            <ng-container *ngTemplateOutlet="treeNode; context: { items: displayTree, level: 0 }"></ng-container>
            <div *ngIf="searchQuery && displayTree.length === 0" class="nav-empty">Ничего не найдено</div>
          </div>
        </div>
      </app-collapsible-section>

      <!-- Recursive tree template -->
      <ng-template #treeNode let-items="items" let-level="level">
        <ng-container *ngFor="let item of items">
          <div class="tree-row" [style.paddingLeft.px]="level * 20 + 8"
            (click)="onNodeClick(item)"
            [class.tree-row-selectable]="!item.isGroup"
            [class.tree-row-group]="item.isGroup">
            <lucide-icon *ngIf="hasChildren(item)" class="tree-chevron"
              [name]="isExpanded(item.id) ? 'chevron-down' : 'chevron-right'" [size]="14">
            </lucide-icon>
            <span *ngIf="!hasChildren(item)" class="tree-chevron-placeholder"></span>
            <lucide-icon [name]="getItemIcon(item)" [size]="16"
              [class.icon-folder]="item.isGroup"
              [class.icon-dish]="item.itemType === 'dish'"
              [class.icon-goods]="item.itemType === 'goods'"
              [class.icon-modifier]="item.itemType === 'modifier'">
            </lucide-icon>
            <span class="tree-item-name">{{ item.name }}</span>
            <span *ngIf="item.price && item.itemType === 'modifier'" class="tree-price">(+{{ item.price }}₽)</span>
          </div>
          <!-- Children (groups) -->
          <ng-container *ngIf="isExpanded(item.id) && item.children">
            <ng-container *ngTemplateOutlet="treeNode; context: { items: item.children, level: level + 1 }"></ng-container>
          </ng-container>
          <!-- Sizes (only for dishes/goods with sizes) -->
          <ng-container *ngIf="isExpanded(item.id) && item.sizes && item.sizes.length > 0">
            <div *ngFor="let size of item.sizes" class="tree-row tree-row-selectable"
              [style.paddingLeft.px]="(level + 1) * 20 + 8"
              (click)="selectSize(item, size)">
              <span class="tree-chevron-placeholder"></span>
              <lucide-icon name="ruler" [size]="14" class="icon-size"></lucide-icon>
              <span class="tree-item-name">{{ item.name }} {{ size.name }}</span>
            </div>
          </ng-container>
        </ng-container>
      </ng-template>

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
    .nav-title { flex: 1; font-size: 13px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .nav-close-btn {
      display: flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border: none; border-radius: 3px;
      background: transparent; color: #757575; cursor: pointer;
    }
    .nav-close-btn:hover { background: #e0e0e0; }
    .nav-empty { padding: 20px; text-align: center; font-size: 13px; color: #9e9e9e; }

    /* Tree search */
    .tree-search {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; border-bottom: 1px solid #e0e0e0; background: #fff;
    }
    .tree-search-icon { color: #9e9e9e; flex-shrink: 0; }
    .tree-search-input {
      flex: 1; border: none; outline: none; font-size: 13px;
      font-family: Roboto, sans-serif; color: #333; background: transparent;
    }
    .tree-search-input::placeholder { color: #bdbdbd; }
    .tree-search-clear {
      display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer;
    }
    .tree-search-clear:hover { color: #757575; }

    /* Tree items */
    .tree-items { max-height: 320px; overflow-y: auto; }
    .tree-row {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 8px; cursor: pointer; transition: background 0.1s;
      border-bottom: 1px solid #fafafa; font-size: 13px; color: #333;
    }
    .tree-row:hover { background: #f5f5f5; }
    .tree-row-selectable:hover { background: #e3f2fd; }
    .tree-row-group { cursor: pointer; }
    .tree-chevron { color: #9e9e9e; flex-shrink: 0; width: 14px; }
    .tree-chevron-placeholder { width: 14px; flex-shrink: 0; }
    .tree-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tree-price { color: #4caf50; font-size: 12px; flex-shrink: 0; }
    .icon-folder { color: #ff9800; }
    .icon-dish { color: #795548; }
    .icon-goods { color: #607d8b; }
    .icon-modifier { color: #9c27b0; }
    .icon-size { color: #2196f3; }

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

  /* ── Product Tree State ── */
  showProductNavigator = false;
  expandedNodes = new Set<string>();
  searchQuery = '';
  filteredTree: ProductCatalogItem[] = [];

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
      this.searchQuery = '';
      this.filteredTree = [];
    }
  }

  get displayTree(): ProductCatalogItem[] {
    return this.searchQuery ? this.filteredTree : MOCK_PRODUCT_CATALOG_TREE;
  }

  isGenericElement(type: ArrivalsElementType): boolean {
    return !['text', 'image', 'area', 'price'].includes(type);
  }

  /* ── Tree Methods ── */
  hasChildren(item: ProductCatalogItem): boolean {
    return item.isGroup || !!(item.sizes && item.sizes.length > 0);
  }

  isExpanded(nodeId: string): boolean {
    return this.expandedNodes.has(nodeId);
  }

  toggleNode(nodeId: string): void {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
  }

  getItemIcon(item: ProductCatalogItem): string {
    if (item.isGroup) return 'folder';
    switch (item.itemType) {
      case 'dish': return 'utensils';
      case 'goods': return 'package';
      case 'modifier': return 'puzzle';
      default: return 'package';
    }
  }

  onNodeClick(item: ProductCatalogItem): void {
    if (item.isGroup) {
      this.toggleNode(item.id);
    } else if (item.itemType === 'modifier') {
      this.selectModifier(item);
    } else if (item.sizes && item.sizes.length > 0) {
      this.toggleNode(item.id);
    } else {
      this.selectProduct(item);
    }
  }

  /* ── Product Navigator Methods ── */
  openProductNavigator(): void {
    this.showProductNavigator = true;
    this.expandedNodes.clear();
    this.searchQuery = '';
    this.filteredTree = [];
  }

  closeProductNavigator(): void {
    this.showProductNavigator = false;
  }

  selectProduct(item: ProductCatalogItem): void {
    this.element.productId = item.id;
    this.element.productName = item.name;
    this.element.sizeId = null;
    this.element.sizeName = undefined;
    this.element.modifierId = undefined;
    this.element.modifierName = undefined;
    this.element.bindingType = 'product';
    this.element.name = 'Цена: ' + this.truncateName(item.name, 20);
    this.showProductNavigator = false;
  }

  selectSize(product: ProductCatalogItem, size: ProductSize): void {
    this.element.productId = product.id;
    this.element.productName = product.name;
    this.element.sizeId = size.id;
    this.element.sizeName = size.name;
    this.element.modifierId = undefined;
    this.element.modifierName = undefined;
    this.element.bindingType = 'size';
    this.element.name = 'Цена: ' + this.truncateName(product.name + ' ' + size.name, 20);
    this.showProductNavigator = false;
  }

  selectModifier(item: ProductCatalogItem): void {
    this.element.productId = undefined;
    this.element.productName = undefined;
    this.element.sizeId = null;
    this.element.sizeName = undefined;
    this.element.modifierId = item.id;
    this.element.modifierName = item.name;
    this.element.bindingType = 'modifier';
    this.element.name = 'Цена: ' + this.truncateName(item.name, 20);
    this.showProductNavigator = false;
  }

  clearProductBinding(): void {
    this.element.productId = undefined;
    this.element.productName = undefined;
    this.element.sizeId = null;
    this.element.sizeName = undefined;
    this.element.modifierId = undefined;
    this.element.modifierName = undefined;
    this.element.bindingType = undefined;
    this.element.name = 'Цена блюда';
  }

  /* ── Search ── */
  onSearchChange(query: string): void {
    this.searchQuery = query;
    if (!query.trim()) {
      this.filteredTree = [];
      return;
    }
    this.filteredTree = this.filterTreeItems(MOCK_PRODUCT_CATALOG_TREE, query.toLowerCase());
    this.expandAllFiltered(this.filteredTree);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredTree = [];
  }

  private filterTreeItems(items: ProductCatalogItem[], query: string): ProductCatalogItem[] {
    const result: ProductCatalogItem[] = [];
    for (const item of items) {
      const nameMatch = item.name.toLowerCase().includes(query);
      const sizeMatch = item.sizes?.some(s => (item.name + ' ' + s.name).toLowerCase().includes(query));
      let filteredChildren: ProductCatalogItem[] | undefined;
      if (item.children) {
        filteredChildren = this.filterTreeItems(item.children, query);
      }
      if (nameMatch || sizeMatch || (filteredChildren && filteredChildren.length > 0)) {
        result.push({
          ...item,
          children: filteredChildren && filteredChildren.length > 0 ? filteredChildren : item.children && nameMatch ? item.children : undefined,
          sizes: (nameMatch || sizeMatch) ? item.sizes : undefined,
        });
      }
    }
    return result;
  }

  private expandAllFiltered(items: ProductCatalogItem[]): void {
    for (const item of items) {
      if (item.children || (item.sizes && item.sizes.length > 0)) {
        this.expandedNodes.add(item.id);
      }
      if (item.children) {
        this.expandAllFiltered(item.children);
      }
    }
  }

  private truncateName(name: string, maxLen: number): string {
    return name.length > maxLen ? name.slice(0, maxLen) + '…' : name;
  }
}
