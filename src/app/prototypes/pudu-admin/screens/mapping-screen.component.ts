import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import {
  UiButtonComponent,
  UiSelectComponent,
  UiBadgeComponent,
  UiConfirmDialogComponent,
  SelectOption,
} from '@/components/ui';
import { Robot, RobotPoint, DiningTable, TableMapping } from '../types';
import { MOCK_ROBOTS, MOCK_TABLES, MOCK_POINTS, getInitialMapping } from '../data/mock-data';
import { StorageService } from '@/shared/storage.service';

interface DropdownPointOption {
  point_id: string;
  point_name: string;
  isFree: boolean;
  occupiedByTable?: string;
}

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: 'default' | 'warning';
}

@Component({
  selector: 'app-mapping-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiButtonComponent,
    UiSelectComponent,
    UiBadgeComponent,
    UiConfirmDialogComponent,
  ],
  template: `
    <!-- LOADING STATE -->
    <ng-container *ngIf="isLoading">
      <div class="flex-1 flex items-center justify-center">
        <svg class="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    </ng-container>

    <!-- NO ROBOTS STATE -->
    <ng-container *ngIf="!isLoading && robots.length === 0">
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <lucide-icon name="bot" [size]="48" class="text-gray-300 mx-auto mb-4"></lucide-icon>
          <p class="text-gray-500 mb-3">Зарегистрируйте робота для настройки маппинга</p>
          <a
            class="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer hover:underline"
            (click)="goToRobots()"
          >Перейти к роботам</a>
        </div>
      </div>
    </ng-container>

    <!-- MAIN CONTENT -->
    <ng-container *ngIf="!isLoading && robots.length > 0">
      <!-- SUBHEADER -->
      <div class="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between shrink-0">
        <h1 class="text-lg font-semibold text-gray-900">Маппинг столов</h1>
        <div class="flex items-center gap-3">
          <!-- Segmented Control -->
          <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
              [ngClass]="mappingMode === 'tables-to-points'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'"
              (click)="setMappingMode('tables-to-points')"
            >Столы → Точки</button>
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150"
              [ngClass]="mappingMode === 'points-to-tables'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'"
              (click)="setMappingMode('points-to-tables')"
            >Точки → Столы</button>
          </div>
          <!-- Refresh button -->
          <ui-button
            variant="ghost"
            size="sm"
            [iconName]="isRefreshing ? '' : 'refresh-cw'"
            (click)="refreshPoints()"
          >
            <lucide-icon
              *ngIf="isRefreshing"
              name="refresh-cw"
              [size]="14"
              class="animate-spin"
            ></lucide-icon>
            Обновить точки
          </ui-button>
        </div>
      </div>

      <!-- LOADING POINTS -->
      <ng-container *ngIf="isLoadingPoints">
        <div class="flex-1 flex items-center justify-center">
          <svg class="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      </ng-container>

      <!-- TABLE CONTENT -->
      <div *ngIf="!isLoadingPoints" class="overflow-y-auto flex-1 p-6 animate-fade-in">
        <!-- INFO HINT -->
        <div class="border border-blue-200 bg-blue-50/50 rounded-lg p-4 flex items-start gap-3 mb-4">
          <lucide-icon name="info" [size]="18" class="text-blue-500 shrink-0 mt-0.5"></lucide-icon>
          <p class="text-sm text-gray-700">Маппинг столов к точкам един для всего заведения и действует для всех зарегистрированных роботов. Названия точек загружены из карты зала робота (NE). Настройка выполняется инженером NE.</p>
        </div>

        <!-- WARNINGS -->
        <div class="space-y-3 mb-6" *ngIf="unmappedTablesCount > 0">
          <div
            class="border border-orange-200 bg-orange-50/50 rounded-lg p-5 flex items-start gap-3"
          >
            <lucide-icon name="alert-triangle" [size]="20" class="text-orange-500 shrink-0 mt-0.5"></lucide-icon>
            <p class="text-sm text-gray-700">
              <strong>{{ unmappedTablesCount }}</strong> {{ unmappedTablesLabel }} не {{ unmappedTablesVerb }} привязки к точкам робота. Робот не сможет доставить заказ к этим столам.
            </p>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- MODE: TABLES → POINTS (v1.3)                -->
        <!-- ═══════════════════════════════════════════ -->
        <div *ngIf="mappingMode === 'tables-to-points'" class="animate-fade-in">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Стол iiko</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Привязанные точки</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Статус</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let mapping of mappings; let i = index" class="hover:bg-gray-50/50">
                    <!-- Стол iiko -->
                    <td class="px-4 py-3 align-top">
                      <div class="font-medium text-sm text-gray-900">{{ getTableName(mapping.table_id) }}</div>
                      <div class="text-xs text-gray-500">{{ getTableSection(mapping.table_id) }}</div>
                    </td>

                    <!-- Привязанные точки -->
                    <td class="px-4 py-3 align-top">
                      <div class="space-y-2">
                        <div *ngFor="let point of mapping.points; let j = index" class="flex items-center gap-2">
                          <div class="relative flex-1 max-w-xs">
                            <!-- Триггер дропдауна -->
                            <button
                              type="button"
                              class="w-full h-9 px-3 text-left rounded-md border bg-white transition-colors text-sm truncate"
                              [ngClass]="{
                                'border-blue-500 ring-1 ring-blue-500': isDropdownOpen(i, j),
                                'border-gray-300 hover:border-gray-400': !isDropdownOpen(i, j),
                                'font-mono text-gray-900': point.point_id,
                                'text-gray-400 italic': !point.point_id
                              }"
                              (click)="toggleDropdown(i, j, $event)"
                            >{{ point.point_id ? point.point_name : 'Выберите точку...' }}</button>
                            <!-- Дропдаун список -->
                            <div
                              *ngIf="isDropdownOpen(i, j)"
                              class="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                            >
                              <!-- Не назначена -->
                              <button
                                type="button"
                                class="w-full px-3 py-2 text-left text-sm italic text-gray-400 hover:bg-gray-50"
                                (click)="selectPointFromDropdown(i, j, '')"
                              >Не назначена</button>
                              <!-- Свободные точки -->
                              <ng-container *ngIf="getDropdownOptions(i, j).free.length > 0">
                                <div class="border-t border-gray-200"></div>
                                <button
                                  *ngFor="let opt of getDropdownOptions(i, j).free"
                                  type="button"
                                  class="w-full px-3 py-2 text-left font-mono text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                  (click)="selectPointFromDropdown(i, j, opt.point_id)"
                                >{{ opt.point_name }}</button>
                              </ng-container>
                              <!-- Занятые точки -->
                              <ng-container *ngIf="getDropdownOptions(i, j).occupied.length > 0">
                                <div class="border-t border-gray-200"></div>
                                <button
                                  *ngFor="let opt of getDropdownOptions(i, j).occupied"
                                  type="button"
                                  class="w-full px-3 py-2 text-left font-mono text-sm text-gray-400 hover:bg-orange-50 hover:text-orange-600"
                                  (click)="selectPointFromDropdown(i, j, opt.point_id)"
                                >{{ opt.point_name }} <span class="italic font-sans text-xs">({{ opt.occupiedByTable }})</span></button>
                              </ng-container>
                            </div>
                          </div>
                          <button
                            class="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            (click)="removePoint(i, j)"
                            title="Удалить привязку"
                          >
                            <lucide-icon name="x" [size]="16"></lucide-icon>
                          </button>
                        </div>
                        <button
                          type="button"
                          class="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          (click)="addPoint(i)"
                        >
                          <lucide-icon name="plus" [size]="14"></lucide-icon>
                          Точку
                        </button>
                      </div>
                    </td>

                    <!-- Статус -->
                    <td class="px-4 py-3 text-center align-top">
                      <div class="pt-1.5">
                        <lucide-icon
                          *ngIf="mapping.points.length > 0 && hasAnyMappedPoint(mapping)"
                          name="check-circle-2"
                          [size]="18"
                          class="text-green-600"
                        ></lucide-icon>
                        <lucide-icon
                          *ngIf="mapping.points.length === 0 || !hasAnyMappedPoint(mapping)"
                          name="circle"
                          [size]="18"
                          class="text-gray-300"
                        ></lucide-icon>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════ -->
        <!-- MODE: POINTS → TABLES (v1.3)                -->
        <!-- ═══════════════════════════════════════════ -->
        <div *ngIf="mappingMode === 'points-to-tables'" class="animate-fade-in">
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Точка робота</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Привязанный стол</th>
                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Статус</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let point of availablePoints; let pi = index" class="hover:bg-gray-50/50">
                    <!-- Точка робота -->
                    <td class="px-4 py-3">
                      <div class="font-medium font-mono text-sm text-gray-600">{{ point.point_name }}</div>
                    </td>

                    <!-- Привязанный стол -->
                    <td class="px-4 py-3">
                      <div class="max-w-xs">
                        <ui-select
                          [options]="tableOptionsForPoint(point.point_id)"
                          [value]="getTableIdForPoint(point.point_id)"
                          placeholder="Не назначена"
                          (valueChange)="onTableChangeForPoint(point.point_id, $event)"
                          [fullWidth]="true"
                        ></ui-select>
                      </div>
                    </td>

                    <!-- Статус -->
                    <td class="px-4 py-3 text-center">
                      <lucide-icon
                        *ngIf="getTableIdForPoint(point.point_id)"
                        name="check-circle-2"
                        [size]="18"
                        class="text-green-600"
                      ></lucide-icon>
                      <lucide-icon
                        *ngIf="!getTableIdForPoint(point.point_id)"
                        name="circle"
                        [size]="18"
                        class="text-gray-300"
                      ></lucide-icon>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- STICKY FOOTER -->
      <div *ngIf="!isLoadingPoints" class="border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-end gap-3 shrink-0">
        <ui-button
          variant="outline"
          size="sm"
          [disabled]="!hasChanges"
          (click)="resetMapping()"
        >Сбросить</ui-button>
        <ui-button
          variant="primary"
          size="sm"
          [disabled]="!hasChanges"
          (click)="saveMapping()"
        >Сохранить</ui-button>
      </div>
    </ng-container>

    <!-- DROPDOWN BACKDROP -->
    <div *ngIf="openDropdownKey" class="fixed inset-0 z-40" (click)="closeDropdown()"></div>

    <!-- TOAST CONTAINER -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let t of toasts; trackBy: trackToast"
        class="rounded-lg border px-4 py-3 shadow-lg min-w-[300px] animate-slide-up"
        [ngClass]="{
          'border-gray-200 bg-white': t.variant !== 'warning',
          'border-orange-300 bg-orange-50': t.variant === 'warning'
        }"
      >
        <p class="text-sm font-medium" [ngClass]="t.variant === 'warning' ? 'text-orange-800' : 'text-gray-900'">{{ t.title }}</p>
        <p *ngIf="t.description" class="text-xs mt-0.5" [ngClass]="t.variant === 'warning' ? 'text-orange-600' : 'text-gray-500'">{{ t.description }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
      }
    `,
  ],
})
export class MappingScreenComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);

  // Data
  robots: Robot[] = [];
  tables: DiningTable[] = [];
  availablePoints: RobotPoint[] = [];
  mappings: TableMapping[] = [];
  originalMappings: TableMapping[] = [];

  // State
  isLoading = true;
  isLoadingPoints = false;
  isRefreshing = false;
  hasChanges = false;
  mappingMode: 'tables-to-points' | 'points-to-tables' = 'tables-to-points';

  // Dropdown state (v1.3)
  openDropdownKey: string | null = null;

  // Toast
  toasts: Toast[] = [];
  private toastCounter = 0;

  ngOnInit(): void {
    setTimeout(() => {
      this.robots = [...MOCK_ROBOTS];
      this.tables = [...MOCK_TABLES];
      this.availablePoints = [...MOCK_POINTS];
      this.loadMappings();
      this.isLoading = false;
    }, 1000);
  }

  // ── Data loading ───────────────────────────────────────

  loadMappings(): void {
    this.isLoadingPoints = true;
    this.openDropdownKey = null;
    setTimeout(() => {
      const defaultMappings = getInitialMapping().map((m) => ({
        ...m,
        points: m.points.map((p) => ({ ...p })),
      }));
      this.mappings = this.storage.load('pudu-admin', 'mappings', defaultMappings);
      this.originalMappings = this.cloneMappings(this.mappings);
      this.hasChanges = false;
      this.isLoadingPoints = false;
    }, 1000);
  }

  // ── Mode switch ────────────────────────────────────────

  setMappingMode(mode: 'tables-to-points' | 'points-to-tables'): void {
    if (this.mappingMode === mode) return;
    this.mappingMode = mode;
    this.openDropdownKey = null;
  }

  // ── Refresh points ─────────────────────────────────────

  refreshPoints(): void {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.openDropdownKey = null;
    setTimeout(() => {
      this.isRefreshing = false;
      this.showToast('Список точек обновлён');
    }, 1500);
  }

  // ── Table helpers ──────────────────────────────────────

  getTableName(tableId: string): string {
    return this.tables.find((t) => t.table_id === tableId)?.table_name || tableId;
  }

  getTableSection(tableId: string): string {
    return this.tables.find((t) => t.table_id === tableId)?.section_name || '';
  }

  // ── Custom dropdown (v1.3) ─────────────────────────────

  toggleDropdown(rowIndex: number, pointIndex: number, event: Event): void {
    event.stopPropagation();
    const key = `${rowIndex}-${pointIndex}`;
    this.openDropdownKey = this.openDropdownKey === key ? null : key;
  }

  isDropdownOpen(rowIndex: number, pointIndex: number): boolean {
    return this.openDropdownKey === `${rowIndex}-${pointIndex}`;
  }

  closeDropdown(): void {
    this.openDropdownKey = null;
  }

  // ── Dropdown options — full pool (v1.3 E3) ────────────

  getDropdownOptions(rowIndex: number, pointIndex: number): { free: DropdownPointOption[]; occupied: DropdownPointOption[] } {
    // Points already assigned to THIS table in OTHER select slots
    const sameTablePointIds = new Set<string>();
    this.mappings[rowIndex].points.forEach((p, pi) => {
      if (pi !== pointIndex && p.point_id) {
        sameTablePointIds.add(p.point_id);
      }
    });

    const free: DropdownPointOption[] = [];
    const occupied: DropdownPointOption[] = [];

    for (const point of this.availablePoints) {
      // Skip points already in this same table at different slots
      if (sameTablePointIds.has(point.point_id)) continue;

      // Check if occupied by another table
      let occupiedByTableId = '';
      for (const m of this.mappings) {
        if (m.table_id === this.mappings[rowIndex].table_id) continue;
        if (m.points.some((p) => p.point_id === point.point_id)) {
          occupiedByTableId = m.table_id;
          break;
        }
      }

      if (occupiedByTableId) {
        occupied.push({
          point_id: point.point_id,
          point_name: point.point_name,
          isFree: false,
          occupiedByTable: this.getTableName(occupiedByTableId),
        });
      } else {
        free.push({
          point_id: point.point_id,
          point_name: point.point_name,
          isFree: true,
        });
      }
    }

    return { free, occupied };
  }

  // ── Exclusive point assignment (v1.3 E2) ──────────────

  selectPointFromDropdown(rowIndex: number, pointIndex: number, pointId: string): void {
    this.openDropdownKey = null;

    if (!pointId) {
      // "Не назначена" — clear this slot
      this.mappings[rowIndex].points[pointIndex] = { point_id: '', point_name: '' };
      this.recalcChanges();
      return;
    }

    const point = this.availablePoints.find((p) => p.point_id === pointId);
    if (!point) return;

    // Check if point is occupied by another table
    let oldTableId = '';
    for (const m of this.mappings) {
      if (m.table_id === this.mappings[rowIndex].table_id) continue;
      const idx = m.points.findIndex((p) => p.point_id === pointId);
      if (idx >= 0) {
        oldTableId = m.table_id;
        m.points.splice(idx, 1); // Remove from old table
        break;
      }
    }

    // Assign to current table
    this.mappings[rowIndex].points[pointIndex] = { ...point };

    // Show warning toast if transferred
    if (oldTableId) {
      const oldTableName = this.getTableName(oldTableId);
      const newTableName = this.getTableName(this.mappings[rowIndex].table_id);
      this.showToast(
        'Точка перенесена',
        `Точка ${point.point_name} перенесена со стола ${oldTableName} на стол ${newTableName}`,
        4000,
        'warning'
      );
    }

    this.recalcChanges();
  }

  // ── Add / Remove points ────────────────────────────────

  addPoint(rowIndex: number): void {
    const newIndex = this.mappings[rowIndex].points.length;
    this.mappings[rowIndex].points.push({
      point_id: '',
      point_name: '',
    });
    // Auto-open dropdown for new slot
    this.openDropdownKey = `${rowIndex}-${newIndex}`;
    this.recalcChanges();
  }

  removePoint(rowIndex: number, pointIndex: number): void {
    this.openDropdownKey = null;
    this.mappings[rowIndex].points.splice(pointIndex, 1);
    this.recalcChanges();
  }

  // ── Points→Tables mode helpers ─────────────────────────

  getTableIdForPoint(pointId: string): string {
    for (const m of this.mappings) {
      if (m.points.some((p) => p.point_id === pointId)) {
        return m.table_id;
      }
    }
    return '';
  }

  tableOptionsForPoint(pointId: string): SelectOption[] {
    const opts: SelectOption[] = [
      { value: '', label: 'Не назначена' },
    ];
    this.tables.forEach((t) => {
      opts.push({
        value: t.table_id,
        label: `${t.table_name} — ${t.section_name}`,
      });
    });
    return opts;
  }

  onTableChangeForPoint(pointId: string, newTableId: string): void {
    const point = this.availablePoints.find((p) => p.point_id === pointId);
    if (!point) return;

    // Remove point from old table
    for (const m of this.mappings) {
      m.points = m.points.filter((p) => p.point_id !== pointId);
    }

    // Add point to new table (if not empty)
    if (newTableId) {
      const targetMapping = this.mappings.find((m) => m.table_id === newTableId);
      if (targetMapping) {
        targetMapping.points.push({ ...point });
      }
    }

    this.recalcChanges();
  }

  // ── Status helpers ─────────────────────────────────────

  hasAnyMappedPoint(mapping: TableMapping): boolean {
    return mapping.points.some((p) => !!p.point_id);
  }

  // ── Warnings ───────────────────────────────────────────

  get unmappedTablesCount(): number {
    return this.mappings.filter(
      (m) => m.points.length === 0 || !m.points.some((p) => !!p.point_id)
    ).length;
  }

  get unmappedTablesLabel(): string {
    const n = this.unmappedTablesCount;
    if (n % 10 === 1 && n % 100 !== 11) return 'стол';
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'стола';
    return 'столов';
  }

  get unmappedTablesVerb(): string {
    const n = this.unmappedTablesCount;
    if (n % 10 === 1 && n % 100 !== 11) return 'имеет';
    return 'имеют';
  }

  // ── Save / Reset ───────────────────────────────────────

  saveMapping(): void {
    this.originalMappings = this.cloneMappings(this.mappings);
    this.storage.save('pudu-admin', 'mappings', this.mappings);
    this.hasChanges = false;
    this.showToast('Маппинг сохранён');
  }

  resetMapping(): void {
    this.mappings = this.cloneMappings(this.originalMappings);
    this.hasChanges = false;
    this.openDropdownKey = null;
  }

  // ── Change tracking ────────────────────────────────────

  private recalcChanges(): void {
    this.hasChanges = JSON.stringify(this.mappings) !== JSON.stringify(this.originalMappings);
  }

  private cloneMappings(src: TableMapping[]): TableMapping[] {
    return src.map((m) => ({
      ...m,
      points: m.points.map((p) => ({ ...p })),
    }));
  }

  // ── Navigation ─────────────────────────────────────────

  goToRobots(): void {
    this.router.navigate(['/prototype/pudu-admin']);
  }

  // ── Toast ──────────────────────────────────────────────

  showToast(title: string, description?: string, duration = 3000, variant: 'default' | 'warning' = 'default'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, title, description, variant });
    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, duration);
  }

  trackToast(_: number, item: Toast): number {
    return item.id;
  }
}
