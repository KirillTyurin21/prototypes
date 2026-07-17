import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCheckboxComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { RestaurantNode, FlatTreeItem } from '../types';

@Component({
  selector: 'app-restaurant-tree',
  standalone: true,
  imports: [CommonModule, UiCheckboxComponent, IconsModule],
  template: `
    <!-- Toolbar -->
    <div *ngIf="mode === 'edit'" class="flex items-center gap-2 mb-3">
      <button (click)="selectAll()" class="text-xs text-blue-600 hover:text-blue-800 transition-colors">
        Выбрать все
      </button>
      <span class="text-gray-300">|</span>
      <button (click)="deselectAll()" class="text-xs text-blue-600 hover:text-blue-800 transition-colors">
        Снять все
      </button>
      <span class="ml-auto text-xs text-gray-400">
        Выбрано: {{ checkedCount }} из {{ totalCount }}
      </span>
    </div>

    <!-- Tree list -->
    <div class="border border-gray-200 rounded-lg divide-y divide-gray-100">
      <div
        *ngFor="let item of flatList; trackBy: trackById"
        class="flex items-center gap-2 px-3 py-2"
        [class.bg-gray-50]="item.isGroup"
        [style.padding-left.px]="12 + item.depth * 20">

        <!-- Group folder icon -->
        <lucide-icon
          *ngIf="item.isGroup"
          name="folder"
          [size]="16"
          class="text-gray-400 shrink-0">
        </lucide-icon>

        <!-- Restaurant store icon -->
        <lucide-icon
          *ngIf="!item.isGroup"
          name="store"
          [size]="16"
          class="text-gray-400 shrink-0">
        </lucide-icon>

        <!-- Name -->
        <span
          class="text-sm flex-1 truncate"
          [class.font-medium]="item.isGroup"
          [class.text-gray-900]="!item.isGroup">
          {{ item.name }}
        </span>

        <!-- Custom settings badge -->
        <span
          *ngIf="!item.isGroup && item.useCustomSettings && item.checked"
          class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium shrink-0 hidden sm:inline"
          title="Индивидуальные настройки">
          индив.
        </span>

        <!-- Address (only for restaurants) -->
        <span *ngIf="!item.isGroup" class="text-xs text-gray-400 hidden sm:inline shrink-0">
          {{ item.address }}
        </span>

        <!-- Edit: checkbox -->
        <ui-checkbox
          *ngIf="mode === 'edit'"
          [checked]="item.checked"
          (checkedChange)="toggleItem(item)">
        </ui-checkbox>

        <!-- View: check/x icon -->
        <lucide-icon
          *ngIf="mode === 'view' && item.checked"
          name="check"
          [size]="16"
          class="text-green-500 shrink-0">
        </lucide-icon>
        <lucide-icon
          *ngIf="mode === 'view' && !item.checked"
          name="x"
          [size]="16"
          class="text-gray-300 shrink-0">
        </lucide-icon>
      </div>
    </div>

    <!-- Empty -->
    <p *ngIf="flatList.length === 0" class="text-center text-sm text-gray-400 py-4">
      Нет ресторанов
    </p>
  `,
})
export class RestaurantTreeComponent implements OnInit, OnChanges {
  @Input() restaurants: RestaurantNode[] = [];
  @Input() mode: 'edit' | 'view' = 'edit';

  @Output() selectionChange = new EventEmitter<RestaurantNode[]>();

  flatList: FlatTreeItem[] = [];

  ngOnInit(): void {
    this.buildFlatList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['restaurants']) {
      this.buildFlatList();
    }
  }

  get checkedCount(): number {
    return this.flatList.filter(i => !i.isGroup && i.checked).length;
  }

  get totalCount(): number {
    return this.flatList.filter(i => !i.isGroup).length;
  }

  toggleItem(item: FlatTreeItem): void {
    item.checked = !item.checked;

    if (item.isGroup && item.childrenIds) {
      for (const child of this.flatList) {
        if (item.childrenIds.includes(child.id)) {
          child.checked = item.checked;
        }
      }
    }

    if (!item.isGroup) {
      this.updateGroupState();
    }

    this.emitChange();
  }

  selectAll(): void {
    for (const item of this.flatList) {
      item.checked = true;
    }
    this.emitChange();
  }

  deselectAll(): void {
    for (const item of this.flatList) {
      item.checked = false;
    }
    this.emitChange();
  }

  trackById(_: number, item: FlatTreeItem): string {
    return item.id;
  }

  private buildFlatList(): void {
    this.flatList = [];
    this.flattenNodes(this.restaurants, 0);
  }

  private flattenNodes(nodes: RestaurantNode[], depth: number): void {
    for (const node of nodes) {
      const hasChildren = !!node.children && node.children.length > 0;
      const childrenIds = hasChildren ? node.children!.map(c => c.id) : undefined;

      this.flatList.push({
        id: node.id,
        name: node.name,
        address: node.address,
        isGroup: hasChildren,
        depth,
        checked: node.isConnected,
        childrenIds,
        useCustomSettings: node.useCustomSettings || false,
        allowedCategoryCount: node.customOperationCategories
          ? node.customOperationCategories.filter(c => c.allowed).length
          : undefined,
        totalCategoryCount: node.customOperationCategories
          ? node.customOperationCategories.length
          : undefined,
      });

      if (hasChildren) {
        this.flattenNodes(node.children!, depth + 1);
      }
    }
  }

  private updateGroupState(): void {
    for (const item of this.flatList) {
      if (item.isGroup && item.childrenIds) {
        const children = this.flatList.filter(c => item.childrenIds!.includes(c.id));
        const allChecked = children.every(c => c.checked);
        const noneChecked = children.every(c => !c.checked);
        item.checked = allChecked;
      }
    }
  }

  private emitChange(): void {
    this.applyToNodes(this.restaurants);
    this.selectionChange.emit(this.restaurants);
  }

  private applyToNodes(nodes: RestaurantNode[]): void {
    for (const node of nodes) {
      const flat = this.flatList.find(i => i.id === node.id);
      if (flat) {
        node.isConnected = flat.checked;
      }
      if (node.children) {
        this.applyToNodes(node.children);
      }
    }
  }
}
