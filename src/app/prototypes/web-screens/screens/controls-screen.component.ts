import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiTableComponent,
  TableCellDefDirective,
  UiModalComponent,
  UiConfirmDialogComponent,
  UiInputComponent,
} from '@/components/ui';
import type { TableColumn } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { CsDataService } from '../cs-data.service';
import {
  CSControl,
  ControlElement,
  ElementTypeOption,
  getAnimationElements,
  getHintElements,
  defaultLayout,
  defaultBorder,
} from '../cs-types';
import { ControlEditDrawerComponent } from '../components/control-editor/control-edit-drawer.component';

@Component({
  selector: 'app-controls-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiTableComponent,
    TableCellDefDirective,
    UiModalComponent,
    UiConfirmDialogComponent,
    UiInputComponent,
    IconsModule,
    ControlEditDrawerComponent,
  ],
  template: `
    <div class="controls-screen">
      <!-- ─── Toast ─── -->
      <div *ngIf="toastMessage" class="toast">
        <lucide-icon name="check-circle-2" [size]="16"></lucide-icon>
        {{ toastMessage }}
      </div>

      <!-- ─── Header ─── -->
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Контролы</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-icon" [disabled]="!selectedControl" title="Редактировать" (click)="openEditDrawer()">
              <lucide-icon name="pencil" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-icon app-btn-danger-icon" [disabled]="!selectedControl" title="Удалить" (click)="confirmDelete()">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-primary" (click)="openTypeDialog()">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              <span>Добавить</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Toolbar: Search + Filter ─── -->
      <div class="toolbar">
        <div class="search-box">
          <ui-input
            placeholder="Поиск по названию..."
            iconName="search"
            [(value)]="searchQuery"
            (valueChange)="applyFilters()"
          ></ui-input>
        </div>
        <div class="filter-group">
          <button class="filter-btn" [class.active]="activeFilter === 'all'" (click)="setFilter('all')">Все</button>
          <button class="filter-btn" [class.active]="activeFilter === 'animation'" (click)="setFilter('animation')">
            <span class="dot dot-blue"></span> Анимации
          </button>
          <button class="filter-btn" [class.active]="activeFilter === 'hint'" (click)="setFilter('hint')">
            <span class="dot dot-orange"></span> Подсказки
          </button>
        </div>
      </div>

      <!-- ─── Table ─── -->
      <div class="table-container">
        <ui-table
          [columns]="columns"
          [data]="filteredControls"
          [rowKeyFn]="rowKeyFn"
          [selectedKey]="selectedControl?.id"
          [sortColumn]="sortColumn"
          [sortDirection]="sortDirection"
          [compact]="true"
          emptyMessage="Контролы не найдены"
          (rowClick)="onRowClick($event)"
          (sort)="onSort($event)"
        >
          <ng-template tableCellDef="name" let-item>
            <span class="cell-name" (dblclick)="onDoubleClick(item)">{{ item.name }}</span>
          </ng-template>
          <ng-template tableCellDef="type" let-item>
            <span class="type-badge" [class.type-animation]="item.type === 'animation'" [class.type-hint]="item.type === 'hint'">
              <span class="dot" [class.dot-blue]="item.type === 'animation'" [class.dot-orange]="item.type === 'hint'"></span>
              {{ item.type === 'animation' ? 'Анимация' : 'Подсказка' }}
            </span>
          </ng-template>
          <ng-template tableCellDef="elementsCount" let-item>
            <span class="cell-count">{{ item.elementsCount }}</span>
          </ng-template>
        </ui-table>
      </div>

      <!-- ─── Type Selection Modal ─── -->
      <ui-modal
        [open]="typeDialogOpen"
        title="Выберите тип контрола"
        size="sm"
        (modalClose)="typeDialogOpen = false"
      >
        <div class="type-cards">
          <div class="type-card" (click)="createControl('animation')">
            <div class="type-card-icon type-card-icon-blue">
              <lucide-icon name="film" [size]="28"></lucide-icon>
            </div>
            <div class="type-card-body">
              <div class="type-card-title">Контрол анимации</div>
              <div class="type-card-desc">Визуальный контрол для анимаций при добавлении блюда в заказ</div>
            </div>
          </div>
          <div class="type-card" (click)="createControl('hint')">
            <div class="type-card-icon type-card-icon-orange">
              <lucide-icon name="lightbulb" [size]="28"></lucide-icon>
            </div>
            <div class="type-card-body">
              <div class="type-card-title">Контрол подсказки</div>
              <div class="type-card-desc">Контрол для карточек подсказок с рекомендациями и скидками</div>
            </div>
          </div>
        </div>
        <div modalFooter></div>
      </ui-modal>

      <!-- ─── Delete Confirm ─── -->
      <ui-confirm-dialog
        [open]="deleteDialogOpen"
        title="Удаление контрола"
        [message]="'Удалить контрол \\'' + (selectedControl?.name || '') + '\\'? Это действие нельзя отменить.'"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="deleteSelected()"
        (cancelled)="deleteDialogOpen = false"
      ></ui-confirm-dialog>

      <!-- ─── Edit Drawer ─── -->
      <app-control-edit-drawer
        [open]="drawerOpen"
        [control]="drawerControl"
        [availableElements]="availableElements"
        [nameError]="nameError"
        (saved)="onDrawerSaved($event)"
        (cancel)="closeDrawer()"
        (nameErrorChange)="nameError = $event"
      ></app-control-edit-drawer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Roboto, sans-serif; }
    .controls-screen { animation: fadeIn 0.2s ease-out; position: relative; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* Toast */
    .toast {
      position: fixed; top: 20px; right: 20px; z-index: 200;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 6px;
      background: #323232; color: #fff; font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: toastIn 0.3s ease-out;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

    /* Page header */
    .page-header { margin-bottom: 16px; }
    .page-title-row { display: flex; align-items: center; justify-content: space-between; }
    .page-title { font-size: 20px; font-weight: 500; color: #212121; margin: 0; }
    .header-actions { display: flex; gap: 6px; align-items: center; }

    /* Buttons */
    .app-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 14px; height: 34px; border: none; border-radius: 4px;
      font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .app-btn:disabled { opacity: 0.4; cursor: default; pointer-events: none; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }
    .app-btn-icon {
      width: 34px; height: 34px; padding: 0; justify-content: center;
      background: transparent; color: #616161; border: 1px solid #e0e0e0; border-radius: 4px;
    }
    .app-btn-icon:hover { background: #f5f5f5; color: #212121; }
    .app-btn-danger-icon {
      width: 34px; height: 34px; padding: 0; justify-content: center;
      background: transparent; color: #e53935; border: 1px solid #e0e0e0; border-radius: 4px;
    }
    .app-btn-danger-icon:hover { background: #ffebee; }

    /* Toolbar */
    .toolbar { display: flex; gap: 12px; margin-bottom: 12px; align-items: center; }
    .search-box { width: 280px; }
    .filter-group { display: flex; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
    .filter-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 0 14px; height: 34px; border: none;
      background: #fff; color: #616161; font-size: 13px; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.15s; border-right: 1px solid #e0e0e0;
    }
    .filter-btn:last-child { border-right: none; }
    .filter-btn:hover { background: #f5f5f5; }
    .filter-btn.active { background: #e3f2fd; color: #1976d2; font-weight: 500; }

    /* Dots & badges */
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dot-blue { background: #448aff; }
    .dot-orange { background: #ff6d00; }
    .type-badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .type-animation { background: #e3f2fd; color: #1976d2; }
    .type-hint { background: #fff3e0; color: #e65100; }

    /* Table */
    .table-container { border-radius: 4px; overflow: hidden; }
    .cell-name { cursor: pointer; font-weight: 500; color: #212121; }
    .cell-count { color: #757575; }

    /* Type cards (modal) */
    .type-cards { display: flex; flex-direction: column; gap: 10px; }
    .type-card {
      display: flex; gap: 14px; padding: 16px; border: 1px solid #e0e0e0; border-radius: 8px;
      cursor: pointer; transition: all 0.15s;
    }
    .type-card:hover { border-color: #448aff; background: #f8fbff; box-shadow: 0 0 0 1px #448aff; }
    .type-card-icon {
      width: 52px; height: 52px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .type-card-icon-blue { background: #e3f2fd; color: #1976d2; }
    .type-card-icon-orange { background: #fff3e0; color: #e65100; }
    .type-card-body { min-width: 0; }
    .type-card-title { font-size: 14px; font-weight: 500; color: #212121; margin-bottom: 4px; }
    .type-card-desc { font-size: 12px; color: #757575; line-height: 1.4; }
  `],
})
export class ControlsScreenComponent implements OnInit {
  private dataService = inject(CsDataService);

  // State
  controls: CSControl[] = [];
  filteredControls: CSControl[] = [];
  selectedControl: CSControl | null = null;
  searchQuery = '';
  activeFilter: 'all' | 'animation' | 'hint' = 'all';
  sortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Drawer
  drawerOpen = false;
  drawerControl: CSControl | null = null;
  editingControl: CSControl | null = null;
  nameError = '';
  availableElements: ElementTypeOption[] = [];
  private nextElementId = 100;

  // Dialogs
  typeDialogOpen = false;
  deleteDialogOpen = false;

  // Toast
  toastMessage = '';
  private toastTimer: any;

  columns: TableColumn[] = [
    { key: 'name', header: 'Название', sortable: true },
    { key: 'type', header: 'Тип', width: '160px' },
    { key: 'elementsCount', header: 'Кол-во элементов', width: '160px', sortable: true, align: 'center' },
  ];

  rowKeyFn = (item: CSControl) => item.id;

  ngOnInit(): void {
    this.loadControls();
  }

  private loadControls(): void {
    this.controls = this.dataService.controls;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.controls];

    if (this.activeFilter !== 'all') {
      result = result.filter(c => c.type === this.activeFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const key = this.sortColumn as keyof CSControl;
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    this.filteredControls = result;
  }

  setFilter(filter: 'all' | 'animation' | 'hint'): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.applyFilters();
  }

  onRowClick(item: CSControl): void {
    this.selectedControl = this.selectedControl?.id === item.id ? null : item;
  }

  onDoubleClick(item: CSControl): void {
    this.selectedControl = item;
    this.openEditDrawer();
  }

  openTypeDialog(): void {
    this.typeDialogOpen = true;
  }

  createControl(type: 'animation' | 'hint'): void {
    this.typeDialogOpen = false;
    this.editingControl = null;

    const elements: ControlElement[] = [];

    if (type === 'hint') {
      elements.push({
        id: this.nextElementId++,
        type: 'hint-banner',
        name: 'Баннер подсказки',
        isRequired: true,
        settings: {
          layout: defaultLayout({ x: 0, y: 0, width: 300, height: 200 }),
          border: defaultBorder(),
        },
      });
    }

    this.drawerControl = {
      id: 0,
      name: '',
      type,
      elementsCount: elements.length,
      elements,
    };
    this.nameError = '';
    this.availableElements = type === 'animation' ? getAnimationElements() : getHintElements();
    this.drawerOpen = true;
  }

  openEditDrawer(): void {
    if (!this.selectedControl) return;
    const source = this.controls.find(c => c.id === this.selectedControl!.id);
    if (!source) return;
    this.editingControl = source;
    this.drawerControl = JSON.parse(JSON.stringify(source));
    this.nameError = '';
    this.availableElements = source.type === 'animation' ? getAnimationElements() : getHintElements();
    this.drawerOpen = true;
  }

  confirmDelete(): void {
    if (!this.selectedControl) return;
    this.deleteDialogOpen = true;
  }

  deleteSelected(): void {
    if (!this.selectedControl) return;
    this.dataService.deleteControl(this.selectedControl.id);
    const name = this.selectedControl.name;
    this.selectedControl = null;
    this.deleteDialogOpen = false;
    this.loadControls();
    this.showToast(`Контрол «${name}» удалён`);
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.drawerControl = null;
    this.editingControl = null;
  }

  onDrawerSaved(control: CSControl): void {
    if (this.editingControl) {
      this.dataService.updateControl(control);
      this.showToast(`Контрол «${control.name}» сохранён`);
    } else {
      const created = this.dataService.addControl(control);
      this.showToast(`Контрол «${created.name}» создан`);
    }
    this.selectedControl = null;
    this.closeDrawer();
    this.loadControls();
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
