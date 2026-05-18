import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiTableComponent,
  TableCellDefDirective,
  UiConfirmDialogComponent,
  UiInputComponent,
} from '@/components/ui';
import type { TableColumn, SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { CsDataService } from '../cs-data.service';
import { Hint } from '../cs-types';
import { DISCOUNTS, PRODUCT_TREE } from '../data/cs-mock-data';
import { HintEditDrawerComponent, HintDrawerSaveEvent } from '../components/hint-editor/hint-edit-drawer.component';

@Component({
  selector: 'app-hints-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiTableComponent,
    TableCellDefDirective,
    UiConfirmDialogComponent,
    UiInputComponent,
    IconsModule,
    HintEditDrawerComponent,
  ],
  template: `
    <div class="hints-screen">
      <!-- Toast -->
      <div *ngIf="toastMessage" class="toast">
        <lucide-icon name="check-circle-2" [size]="16"></lucide-icon>
        {{ toastMessage }}
      </div>

      <!-- Header -->
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Подсказки</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-icon" [disabled]="!selectedHint" title="Редактировать" (click)="openEditDrawer()">
              <lucide-icon name="pencil" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-danger-icon" [disabled]="!selectedHint" title="Удалить" (click)="confirmDelete()">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
            <button class="app-btn app-btn-primary" (click)="openAddDrawer()">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              <span>Добавить</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <ui-input
            placeholder="Поиск по названию..."
            iconName="search"
            [(value)]="searchQuery"
            (valueChange)="applyFilters()"
          ></ui-input>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <ui-table
          [columns]="columns"
          [data]="filteredHints"
          [rowKeyFn]="rowKeyFn"
          [selectedKey]="selectedHint?.id"
          [sortColumn]="sortColumn"
          [sortDirection]="sortDirection"
          [compact]="true"
          emptyMessage="Подсказки не найдены"
          (rowClick)="onRowClick($event)"
          (sort)="onSort($event)"
        >
          <ng-template tableCellDef="name" let-item>
            <span class="cell-name" (dblclick)="onDoubleClick(item)">{{ item.name }}</span>
          </ng-template>
          <ng-template tableCellDef="period" let-item>
            <span class="cell-period">{{ formatDate(item.period.startDate) }} – {{ formatDate(item.period.endDate) }}</span>
          </ng-template>
          <ng-template tableCellDef="time" let-item>
            <span class="cell-time">{{ item.time.startTime }} – {{ item.time.endTime }}</span>
          </ng-template>
          <ng-template tableCellDef="status" let-item>
            <span class="status-badge" [ngClass]="getStatusClass(item.status)">
              {{ getStatusLabel(item.status) }}
            </span>
          </ng-template>
        </ui-table>
      </div>

      <!-- Delete Confirm -->
      <ui-confirm-dialog
        [open]="deleteDialogOpen"
        title="Удаление подсказки"
        [message]="'Удалить подсказку «' + (selectedHint?.name || '') + '»? Подсказка будет снята со всех терминалов.'"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="deleteSelected()"
        (cancelled)="deleteDialogOpen = false"
      ></ui-confirm-dialog>

      <!-- Edit Drawer -->
      <app-hint-edit-drawer
        [open]="drawerOpen"
        [hint]="drawerHint"
        [editingHint]="editingHint"
        [hintControlOptions]="hintControlOptions"
        [productTree]="productTree"
        [discountsList]="discountsList"
        [selectedControlId]="selectedControlId"
        [nameError]="nameError"
        (saved)="onDrawerSaved($event)"
        (cancel)="closeDrawer()"
        (nameErrorChange)="nameError = $event"
      ></app-hint-edit-drawer>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Roboto, sans-serif; }
    .hints-screen { animation: fadeIn 0.2s ease-out; position: relative; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .toast {
      position: fixed; top: 20px; right: 20px; z-index: 200;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 6px;
      background: #323232; color: #fff; font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: toastIn 0.3s ease-out;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

    .page-header { margin-bottom: 16px; }
    .page-title-row { display: flex; align-items: center; justify-content: space-between; }
    .page-title { font-size: 20px; font-weight: 500; color: #212121; margin: 0; }
    .header-actions { display: flex; gap: 6px; align-items: center; }

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

    .toolbar { display: flex; gap: 12px; margin-bottom: 12px; align-items: center; }
    .search-box { width: 280px; }

    .table-container { border-radius: 4px; overflow: hidden; }
    .cell-name { cursor: pointer; font-weight: 500; color: #212121; }
    .cell-period { color: #616161; font-size: 13px; }
    .cell-time { color: #616161; font-size: 13px; }

    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; white-space: nowrap;
    }
    .status-active { background: #e8f5e9; color: #2e7d32; }
    .status-scheduled { background: #e3f2fd; color: #1565c0; }
    .status-expired { background: #f5f5f5; color: #757575; }
  `],
})
export class HintsScreenComponent implements OnInit {
  private dataService = inject(CsDataService);

  hints: Hint[] = [];
  filteredHints: Hint[] = [];
  selectedHint: Hint | null = null;
  searchQuery = '';
  sortColumn = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  drawerOpen = false;
  drawerHint: Hint | null = null;
  editingHint: Hint | null = null;
  nameError = '';
  selectedControlId = '';

  deleteDialogOpen = false;
  toastMessage = '';
  private toastTimer: any;

  productTree = PRODUCT_TREE;
  discountsList = DISCOUNTS;
  hintControlOptions: SelectOption[] = [];

  columns: TableColumn[] = [
    { key: 'name', header: 'Название', sortable: true },
    { key: 'period', header: 'Период действия', width: '200px' },
    { key: 'time', header: 'Время действия', width: '150px' },
    { key: 'status', header: 'Статус', width: '140px' },
  ];
  rowKeyFn = (item: Hint) => item.id;

  ngOnInit(): void {
    this.loadHints();
    this.buildControlOptions();
  }

  private loadHints(): void {
    this.hints = this.dataService.hints;
    this.applyFilters();
  }

  private buildControlOptions(): void {
    const hintControls = this.dataService.controls.filter(c => c.type === 'hint');
    this.hintControlOptions = [
      { value: '', label: '— Не выбран —' },
      ...hintControls.map(c => ({ value: String(c.id), label: c.name })),
    ];
  }

  applyFilters(): void {
    let result = [...this.hints];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(h => h.name.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const key = this.sortColumn;
      let aVal: any, bVal: any;
      if (key === 'name') { aVal = a.name; bVal = b.name; }
      else if (key === 'period') { aVal = a.period.startDate; bVal = b.period.startDate; }
      else if (key === 'status') { aVal = a.status; bVal = b.status; }
      else { aVal = (a as any)[key]; bVal = (b as any)[key]; }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return this.sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
    this.filteredHints = result;
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.applyFilters();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Активна';
      case 'scheduled': return 'Запланирована';
      case 'expired': return 'Истекла';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'scheduled': return 'status-scheduled';
      case 'expired': return 'status-expired';
      default: return '';
    }
  }

  onRowClick(item: Hint): void {
    this.selectedHint = this.selectedHint?.id === item.id ? null : item;
  }

  onDoubleClick(item: Hint): void {
    this.selectedHint = item;
    this.openEditDrawer();
  }

  openAddDrawer(): void {
    this.editingHint = null;
    this.drawerHint = {
      id: 0, name: '', status: 'scheduled',
      period: { startDate: '', endDate: '' },
      time: { startTime: '00:00', endTime: '23:59' },
      slogan: '', discountType: 'percent', discountValue: 0, discount: null,
      triggers: [], recommendation: null, image: null, imageSource: null, controlId: null,
    };
    this.selectedControlId = '';
    this.nameError = '';
    this.buildControlOptions();
    this.drawerOpen = true;
  }

  openEditDrawer(): void {
    if (!this.selectedHint) return;
    const source = this.hints.find(h => h.id === this.selectedHint!.id);
    if (!source) return;
    this.editingHint = source;
    this.drawerHint = JSON.parse(JSON.stringify(source));
    this.selectedControlId = source.controlId != null ? String(source.controlId) : '';
    this.nameError = '';
    this.buildControlOptions();
    this.drawerOpen = true;
  }

  confirmDelete(): void {
    if (!this.selectedHint) return;
    this.deleteDialogOpen = true;
  }

  deleteSelected(): void {
    if (!this.selectedHint) return;
    const name = this.selectedHint.name;
    this.dataService.deleteHint(this.selectedHint.id);
    this.selectedHint = null;
    this.deleteDialogOpen = false;
    this.loadHints();
    this.showToast(`Подсказка «${name}» удалена`);
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.drawerHint = null;
    this.editingHint = null;
  }

  onDrawerSaved(event: HintDrawerSaveEvent): void {
    const hint = event.hint;
    hint.controlId = event.controlId ? Number(event.controlId) : null;
    hint.status = this.computeStatus(hint);

    if (this.editingHint) {
      this.dataService.updateHint(hint);
      this.showToast(`Подсказка «${hint.name}» сохранена`);
    } else {
      const created = this.dataService.addHint(hint);
      this.showToast(`Подсказка «${created.name}» создана`);
    }
    this.selectedHint = null;
    this.closeDrawer();
    this.loadHints();
  }

  private computeStatus(hint: Hint): 'active' | 'scheduled' | 'expired' {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (hint.period.endDate && hint.period.endDate < todayStr) return 'expired';
    if (hint.period.startDate && hint.period.startDate > todayStr) return 'scheduled';
    return 'active';
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 3000);
  }
}
