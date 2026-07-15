import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsDataService } from '../cs-data.service';
import { CSRestaurant, CSTerminalV2, TerminalTableRow, TerminalScreenshot } from '../cs-types';
import { IconsModule } from '@/shared/icons.module';
import { CsTableRowComponent } from '../components/cs-table-row.component';

@Component({
  selector: 'app-cs-terminals-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CsTableRowComponent],
  template: `
    <!-- Toast -->
    <div
      *ngIf="showToast"
      class="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg animate-fade-in"
      [ngClass]="toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
    >
      <lucide-icon [name]="toastType === 'success' ? 'check-circle-2' : 'alert-circle'" [size]="18"></lucide-icon>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Page -->
    <div class="cs-page">

      <!-- Toolbar -->
      <div class="cs-toolbar">
        <h2 class="cs-toolbar-title">Настройка терминалов</h2>
        <div class="cs-toolbar-actions">
          <button class="cs-btn cs-btn-primary" (click)="save()">Сохранить</button>
          <button
            class="cs-btn cs-btn-outline"
            [disabled]="selectedRowIds.size === 0 || isSending"
            (click)="sendSettings()"
          >
            <lucide-icon [name]="isSending ? 'loader-2' : 'send'" [size]="16" [class.cs-spin]="isSending"></lucide-icon>
            {{ isSending ? 'Отправка...' : 'Отправить настройки' + (selectedRowIds.size > 0 ? ' (' + selectedRowIds.size + ')' : '') }}
          </button>
          <button class="cs-icon-btn-round" title="Информация">
            <lucide-icon name="info" [size]="20"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Search + System button -->
      <div class="cs-controls-row">
        <div class="cs-search-group">
          <label class="cs-search-label">Поиск по ресторану</label>
          <input type="text" class="cs-search-input" placeholder="Поиск по ресторану" [(ngModel)]="searchRestaurant" />
        </div>
        <div class="cs-search-group">
          <label class="cs-search-label">Поиск по терминалу</label>
          <input type="text" class="cs-search-input" placeholder="Поиск по терминалу" [(ngModel)]="searchTerminal" />
        </div>
        <button class="cs-btn cs-btn-system" (click)="showSystemSettingsModal = true">Системные настройки</button>
      </div>

      <!-- Restaurants accordions -->
      <div class="cs-accordion" *ngFor="let restaurant of getFilteredRestaurants()">
        <div class="cs-accordion-header" (click)="toggleRestaurant(restaurant.id)">
          <span class="cs-accordion-name">{{ restaurant.name }}</span>
          <div class="cs-accordion-right">
            <span class="cs-accordion-count">{{ getRowCount(restaurant) }} {{ getTerminalWord(getRowCount(restaurant)) }}</span>
            <lucide-icon
              [name]="expandedRestaurants.has(restaurant.id) ? 'chevron-up' : 'chevron-down'"
              [size]="20"
              class="cs-accordion-chevron"
            ></lucide-icon>
          </div>
        </div>

        <div class="cs-accordion-body" *ngIf="expandedRestaurants.has(restaurant.id)">
          <!-- Table -->
          <div class="cs-table-wrap">
            <table class="cs-table">
              <thead>
                <tr class="cs-table-header-row">
                  <th class="cs-th cs-th--name">
                    <div class="cs-th-content">
                      <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
                        <input
                          type="checkbox"
                          class="cs-checkbox"
                          [checked]="areAllRowsSelected(restaurant)"
                          (change)="toggleAllRows(restaurant)"
                        />
                      </label>
                      <span>Кассовый аппарат</span>
                    </div>
                  </th>
                  <th class="cs-th cs-th--theme">Тема</th>
                  <th class="cs-th cs-th--groups">Терминальные группы</th>
                  <th class="cs-th cs-th--campaigns">Кампании</th>
                  <th class="cs-th cs-th--settings">Настройки</th>
                  <th class="cs-th cs-th--actions"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let row of getVisibleRows(restaurant)"
                  app-cs-table-row
                  [row]="row"
                  [selected]="selectedRowIds.has(row.id)"
                  [themeOptions]="dataService.themeOptions"
                  [terminalGroupOptions]="dataService.terminalGroupOptions"
                  [campaignOptions]="dataService.campaignOptions"
                  [settingsOptions]="settingsOptions"
                  (toggleExpand)="toggleComputerExpand($event)"
                  (toggleSelect)="toggleRowSelect($event)"
                  (themeChange)="onThemeChange(restaurant.id, $event)"
                  (terminalGroupsChange)="onGroupsChange(restaurant.id, $event)"
                  (campaignChange)="onCampaignChange(restaurant.id, $event)"
                  (requestScreenshot)="onRequestScreenshot(restaurant, $event)"
                  (deleteRow)="onDeleteRow(restaurant.id, $event)"
                  (addScreen)="onAddScreen($event)"
                ></tr>
              </tbody>
            </table>
          </div>

          <!-- Empty state -->
          <div *ngIf="getVisibleRows(restaurant).length === 0" class="cs-empty-state">
            <lucide-icon name="monitor" [size]="32" class="cs-empty-icon"></lucide-icon>
            <span>Нет терминалов, соответствующих фильтру</span>
          </div>
        </div>
      </div>

      <!-- No restaurants -->
      <div *ngIf="getFilteredRestaurants().length === 0" class="cs-no-data">
        <lucide-icon name="monitor" [size]="48" class="cs-no-data-icon"></lucide-icon>
        <p class="cs-no-data-text">{{ searchRestaurant || searchTerminal ? 'Ничего не найдено' : 'Нет подключённых ресторанов' }}</p>
      </div>
    </div>

    <!-- Screenshot Modal -->
    <div class="cs-modal-overlay" *ngIf="screenshotModal" (click)="closeScreenshotModal()">
      <div class="cs-modal" (click)="$event.stopPropagation()">
        <div class="cs-modal-header">
          <h3 class="cs-modal-title">Скриншот экрана</h3>
          <button class="cs-icon-btn" (click)="closeScreenshotModal()">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        <div class="cs-modal-body">
          <div class="cs-screenshot-image-wrap">
            <img
              [src]="getScreenshotUrl(screenshotModal)"
              [alt]="'Скриншот: ' + screenshotModal.terminalName"
              class="cs-screenshot-img"
            />
          </div>
          <div class="cs-screenshot-meta">
            <div class="cs-meta-row"><span class="cs-meta-label">Ресторан</span><span class="cs-meta-value">{{ screenshotModal.restaurantName }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Терминал</span><span class="cs-meta-value">{{ screenshotModal.terminalName }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Время снимка</span><span class="cs-meta-value">{{ formatScreenshotTime(screenshotModal) }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Разрешение</span><span class="cs-meta-value">{{ screenshotModal.resolution }}</span></div>
          </div>
        </div>
        <div class="cs-modal-footer">
          <button class="cs-btn cs-btn-outline" (click)="closeScreenshotModal()">Закрыть</button>
        </div>
      </div>
    </div>

    <!-- System Settings Modal -->
    <div class="cs-modal-overlay" *ngIf="showSystemSettingsModal" (click)="showSystemSettingsModal = false">
      <div class="cs-modal" (click)="$event.stopPropagation()">
        <div class="cs-modal-header">
          <h3 class="cs-modal-title">Системные настройки</h3>
          <button class="cs-icon-btn" (click)="showSystemSettingsModal = false">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>
        <div class="cs-modal-body">
          <p class="cs-modal-text">Настройки системного уровня будут доступны в следующей версии.</p>
        </div>
        <div class="cs-modal-footer">
          <button class="cs-btn cs-btn-outline" (click)="showSystemSettingsModal = false">Закрыть</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }

    .cs-page {
      padding: 0;
      background: transparent;
      min-height: 100%;
      font-family: 'Roboto', sans-serif;
    }

    /* ─── Toolbar ─── */
    .cs-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .cs-toolbar-title {
      font-size: 20px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
      margin: 0;
      line-height: 1.3;
    }
    .cs-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* ─── Buttons ─── */
    .cs-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
      border-radius: 4px;
      cursor: pointer;
      transition: all .15s ease;
      white-space: nowrap;
      border: 1px solid transparent;
      line-height: 1.4;
      text-transform: uppercase;
      letter-spacing: .3px;
    }
    .cs-btn-primary {
      background: #1976d2;
      color: #fff;
      border-color: #1976d2;
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
    }
    .cs-btn-primary:hover { background: #1565c0; }
    .cs-btn-primary:disabled { background: #90caf9; border-color: #90caf9; cursor: not-allowed; box-shadow: none; }

    .cs-btn-outline {
      background: #fff;
      color: rgba(0, 0, 0, 0.6);
      border-color: rgba(0, 0, 0, 0.23);
    }
    .cs-btn-outline:hover { background: #f5f5f5; border-color: rgba(0, 0, 0, 0.4); }
    .cs-btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

    .cs-btn-system {
      background: #fff;
      color: rgba(0, 0, 0, 0.6);
      border-color: rgba(0, 0, 0, 0.23);
      margin-left: auto;
    }
    .cs-btn-system:hover { background: #f5f5f5; border-color: rgba(0, 0, 0, 0.4); }

    .cs-icon-btn-round {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #757575;
      transition: all .15s;
    }
    .cs-icon-btn-round:hover { background: #f5f5f5; }

    /* ─── Controls row ─── */
    .cs-controls-row {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .cs-search-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cs-search-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54);
      font-family: 'Roboto', sans-serif;
    }
    .cs-search-input {
      padding: 8px 12px;
      font-size: 13px;
      font-family: 'Roboto', sans-serif;
      border: 1px solid rgba(0, 0, 0, 0.23);
      border-radius: 4px;
      background: #fff;
      color: rgba(0, 0, 0, 0.87);
      width: 200px;
      transition: border-color .15s;
    }
    .cs-search-input::placeholder { color: #9e9e9e; }
    .cs-search-input:focus {
      border-color: #1976d2;
      outline: none;
      box-shadow: 0 0 0 1px #1976d2;
    }

    /* ─── Accordion ─── */
    .cs-accordion {
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      margin-bottom: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .cs-accordion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      cursor: pointer;
      user-select: none;
      transition: background .15s;
    }
    .cs-accordion-header:hover { background: #fafafa; }
    .cs-accordion-name {
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }
    .cs-accordion-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cs-accordion-count {
      font-size: 13px;
      color: #757575;
    }
    .cs-accordion-chevron { color: #9e9e9e; }
    .cs-accordion-body {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
      overflow-x: auto;
      padding: 0;
    }

    /* ─── Table ─── */
    .cs-table-wrap {
      overflow-x: auto;
    }
    .cs-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Roboto', sans-serif;
    }
    .cs-table-header-row {
      background: #f5f5f5;
      height: 48px;
    }
    .cs-table-header-row th {
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .cs-th {
      padding: 0 12px;
      font-size: 13px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
      text-align: left;
      white-space: nowrap;
      font-family: 'Roboto', sans-serif;
      vertical-align: middle;
      height: 48px;
    }
    .cs-th--name { min-width: 240px; }
    .cs-th--theme { min-width: 160px; }
    .cs-th--groups { min-width: 140px; }
    .cs-th--campaigns { min-width: 180px; }
    .cs-th--settings { min-width: 140px; }
    .cs-th--actions { min-width: 80px; }

    .cs-th-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Checkbox in header */
    .cs-checkbox-wrap {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .cs-checkbox {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.38);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      background: #fff;
      transition: all .15s;
      margin: 0;
    }
    .cs-checkbox:checked {
      background: #1976d2;
      border-color: #1976d2;
    }
    .cs-checkbox:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 1px;
      width: 5px;
      height: 9px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    /* ─── Empty / No data ─── */
    .cs-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px 16px;
      color: #9e9e9e;
      font-size: 14px;
    }
    .cs-empty-icon { color: #bdbdbd; }

    .cs-no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 24px;
      text-align: center;
    }
    .cs-no-data-icon { color: #bdbdbd; }
    .cs-no-data-text { color: #9e9e9e; margin-top: 8px; font-size: 14px; }

    /* ─── Modal ─── */
    .cs-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: cs-overlay-in .2s ease-out;
    }
    @keyframes cs-overlay-in { from { opacity: 0; } to { opacity: 1; } }
    .cs-modal {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
      max-width: 720px;
      width: 95%;
      max-height: 90vh;
      overflow-y: auto;
      animation: cs-modal-in .25s ease-out;
    }
    @keyframes cs-modal-in { from { opacity: 0; transform: scale(.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .cs-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .cs-modal-title { font-size: 18px; font-weight: 500; color: rgba(0, 0, 0, 0.87); margin: 0; }
    .cs-modal-body { padding: 20px; }
    .cs-modal-text { color: #757575; font-size: 14px; }
    .cs-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 12px 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    .cs-screenshot-image-wrap { background: #263238; border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
    .cs-screenshot-img { width: 100%; display: block; }
    .cs-screenshot-meta { background: #f5f5f5; border-radius: 6px; padding: 12px 16px; }
    .cs-meta-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid rgba(0, 0, 0, 0.06); }
    .cs-meta-row:last-child { border-bottom: none; }
    .cs-meta-label { color: #757575; font-weight: 500; }
    .cs-meta-value { color: rgba(0, 0, 0, 0.87); }

    .cs-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all .15s;
      color: #757575;
    }
    .cs-icon-btn:hover { background: #f5f5f5; }

    /* ─── Spinner ─── */
    @keyframes cs-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .cs-spin { animation: cs-spin 1s linear infinite; }
  `],
})
export class CsTerminalsScreenComponent {
  dataService = inject(CsDataService);

  // ─── State ───
  expandedRestaurants = new Set<number>();
  collapsedComputers = new Set<number>();   // computer row IDs that are collapsed
  selectedRowIds = new Set<number>();
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  isSending = false;
  screenshotLoadingId: number | null = null;
  screenshotModal: TerminalScreenshot | null = null;
  showSystemSettingsModal = false;
  searchRestaurant = '';
  searchTerminal = '';

  /** Заглушка для селекта «Настройки» (будет наполнено позже) */
  settingsOptions: { id: number; name: string }[] = [];

  constructor() {
    const restaurants = this.dataService.restaurants;
    if (restaurants.length > 0) this.expandedRestaurants.add(restaurants[0].id);
  }

  // ═══════════════════════════════════════════
  // Фильтрация и получение строк
  // ═══════════════════════════════════════════

  getFilteredRestaurants(): CSRestaurant[] {
    let list = this.dataService.restaurants;
    if (this.searchRestaurant) {
      const q = this.searchRestaurant.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q));
    }
    if (this.searchTerminal) {
      const q = this.searchTerminal.toLowerCase();
      list = list.filter(r =>
        r.terminals.some(t =>
          t.name.toLowerCase().includes(q) ||
          (t.screens ?? []).some(s => s.name.toLowerCase().includes(q))
        )
      );
    }
    return list;
  }

  /** Все строки таблицы для ресторана */
  getTableRows(restaurant: CSRestaurant): TerminalTableRow[] {
    return this.dataService.getTableRows(restaurant.id);
  }

  /** Только видимые строки (скрыты дочерние display свёрнутых computer) */
  getVisibleRows(restaurant: CSRestaurant): TerminalTableRow[] {
    const allRows = this.getTableRows(restaurant);
    if (this.collapsedComputers.size === 0) return allRows;

    return allRows.filter(row => {
      if (row.kind === 'computer') return true;
      if (row.parentComputerId == null) return true;
      return !this.collapsedComputers.has(row.parentComputerId);
    });
  }

  getRowCount(restaurant: CSRestaurant): number {
    return this.getVisibleRows(restaurant).length;
  }

  // ═══════════════════════════════════════════
  // Действия с ресторанами
  // ═══════════════════════════════════════════

  toggleRestaurant(id: number): void {
    this.expandedRestaurants.has(id)
      ? this.expandedRestaurants.delete(id)
      : this.expandedRestaurants.add(id);
  }

  // ═══════════════════════════════════════════
  // Выбор строк (checkbox)
  // ═══════════════════════════════════════════

  toggleRowSelect(rowId: number): void {
    this.selectedRowIds.has(rowId)
      ? this.selectedRowIds.delete(rowId)
      : this.selectedRowIds.add(rowId);
  }

  areAllRowsSelected(restaurant: CSRestaurant): boolean {
    const visible = this.getVisibleRows(restaurant);
    if (visible.length === 0) return false;
    return visible.every(r => this.selectedRowIds.has(r.id));
  }

  toggleAllRows(restaurant: CSRestaurant): void {
    const visible = this.getVisibleRows(restaurant);
    if (this.areAllRowsSelected(restaurant)) {
      visible.forEach(r => this.selectedRowIds.delete(r.id));
    } else {
      visible.forEach(r => this.selectedRowIds.add(r.id));
    }
  }

  // ═══════════════════════════════════════════
  // Раскрытие computer-строк
  // ═══════════════════════════════════════════

  toggleComputerExpand(computerId: number): void {
    this.collapsedComputers.has(computerId)
      ? this.collapsedComputers.delete(computerId)
      : this.collapsedComputers.add(computerId);
    // Обновляем expanded в данных для иконки стрелки
    for (const r of this.dataService.restaurants) {
      for (const t of r.terminals) {
        if (t.id === computerId) {
          // Найдём соответствующую строку и инвертируем expanded
          break;
        }
      }
    }
  }

  // ═══════════════════════════════════════════
  // Изменение данных через combobox
  // ═══════════════════════════════════════════

  onThemeChange(restaurantId: number, event: { rowId: number; themeId: number | null }): void {
    const parsed = this.parseRowId(event.rowId);
    if (!parsed) return;
    const terminal = this.findTerminal(parsed.terminalId);
    if (!terminal) return;

    if (parsed.kind === 'computer') {
      terminal.themeId = event.themeId;
    } else if (parsed.kind === 'display' && terminal.screens) {
      const screen = terminal.screens.find(s => s.id === parsed.screenId);
      if (screen) {
        screen.themeId = event.themeId;
        screen.themeName = event.themeId
          ? this.dataService.themeOptions.find(o => o.id === event.themeId)?.name
          : undefined;
      }
    }
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  onGroupsChange(restaurantId: number, _event: { rowId: number; groupIds: number[] }): void {
    // Терминальные группы — пока без сохранения (заглушка)
  }

  onCampaignChange(restaurantId: number, event: { rowId: number; panelId: number; campaignId: number | null }): void {
    const parsed = this.parseRowId(event.rowId);
    if (!parsed || parsed.kind !== 'display') return;
    const terminal = this.findTerminal(parsed.terminalId);
    if (!terminal?.screens) return;
    const screen = terminal.screens.find(s => s.id === parsed.screenId);
    if (!screen) return;
    const panel = screen.advertisePanels.find(p => p.id === event.panelId);
    if (!panel) return;
    panel.campaignId = event.campaignId;
    panel.campaignName = event.campaignId
      ? this.dataService.campaignOptions.find(c => c.id === event.campaignId)?.name
      : undefined;
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  // ═══════════════════════════════════════════
  // Действия со строками
  // ═══════════════════════════════════════════

  onRequestScreenshot(restaurant: CSRestaurant, rowId: number): void {
    const parsed = this.parseRowId(rowId);
    if (!parsed) return;
    const terminal = this.findTerminal(parsed.terminalId);
    if (!terminal || !terminal.supportsScreenshot || !terminal.isOnline) return;
    if (this.screenshotLoadingId) return;

    this.screenshotLoadingId = terminal.id;
    this.showToastMessage('Получение скриншота с «' + terminal.name + '»...', 'success');
    this.dataService.requestScreenshot(terminal.id)
      .then(s => { if (s) { s.restaurantName = restaurant.name; this.screenshotModal = s; } })
      .catch((e: any) => this.showToastMessage(e?.message || 'Ошибка получения скриншота', 'error'))
      .finally(() => { this.screenshotLoadingId = null; });
  }

  onDeleteRow(restaurantId: number, rowId: number): void {
    const parsed = this.parseRowId(rowId);
    if (!parsed || parsed.kind !== 'display') return;
    const terminal = this.findTerminal(parsed.terminalId);
    if (!terminal?.screens) return;
    terminal.screens = terminal.screens.filter(s => s.id !== parsed.screenId);
    this.selectedRowIds.delete(rowId);
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
    this.showToastMessage('Экран удалён', 'success');
  }

  onAddScreen(computerId: number): void {
    const terminal = this.findTerminal(computerId);
    if (!terminal) return;
    if (!terminal.screens) terminal.screens = [];
    const maxId = terminal.screens.reduce((max, s) => Math.max(max, s.id), 0);
    const newScreen = {
      id: maxId + 1,
      name: 'Новый экран ' + (maxId + 1),
      themeId: terminal.themeId,
      themeName: this.dataService.getThemeName(terminal.themeId),
      advertisePanels: [{ id: 1, name: 'Advertise панель 1', campaignId: null }],
    };
    terminal.screens.push(newScreen);
    this.showToastMessage('Экран добавлен к «' + terminal.name + '»', 'success');
  }

  // ═══════════════════════════════════════════
  // Сохранение и отправка
  // ═══════════════════════════════════════════

  save(): void {
    this.dataService.updateRestaurants(this.dataService.restaurants);
    this.showToastMessage('Настройки терминалов сохранены', 'success');
  }

  async sendSettings(): Promise<void> {
    if (this.selectedRowIds.size === 0 || this.isSending) return;
    // Собираем ID терминалов (computer + родительские для display)
    const terminalIds = new Set<number>();
    for (const rowId of this.selectedRowIds) {
      const parsed = this.parseRowId(rowId);
      if (parsed) terminalIds.add(parsed.terminalId);
    }
    const ids = Array.from(terminalIds);
    this.isSending = true;
    this.showToastMessage('Отправка настроек на ' + ids.length + ' ' + this.getTerminalWord(ids.length) + '...', 'success');
    try {
      await this.dataService.sendSettings(ids);
      this.showToastMessage('Настройки успешно отправлены на ' + ids.length + ' ' + this.getTerminalWord(ids.length), 'success');
      this.selectedRowIds.clear();
    } catch {
      this.showToastMessage('Ошибка при отправке настроек', 'error');
    } finally {
      this.isSending = false;
    }
  }

  // ═══════════════════════════════════════════
  // Скриншот — модальное окно
  // ═══════════════════════════════════════════

  closeScreenshotModal(): void { this.screenshotModal = null; }

  getScreenshotUrl(screenshot: TerminalScreenshot): string {
    if (screenshot.imageUrl) return screenshot.imageUrl;
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23263238' width='1920' height='1080'/%3E%3Crect x='40' y='40' width='1840' height='200' rx='12' fill='%2337474f'/%3E%3Ctext x='960' y='160' font-family='sans-serif' font-size='64' fill='%23fff' text-anchor='middle'%3ECustomer Screen%3C/text%3E%3C/svg%3E";
  }

  formatScreenshotTime(screenshot: TerminalScreenshot): string {
    if (!screenshot.capturedAt) return '—';
    const d = new Date(screenshot.capturedAt);
    if (isNaN(d.getTime())) return screenshot.capturedAt;
    const p = (n: number) => String(n).padStart(2, '0');
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ', ' +
      p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) +
      ' (' + screenshot.timezoneLabel + ')';
  }

  // ═══════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════

  /**
   * Разбирает составной ID строки обратно в terminalId и screenId.
   * computer-строки: rowId === terminalId
   * display-строки: rowId === terminalId * 1000 + screenId
   */
  private parseRowId(rowId: number): { kind: 'computer' | 'display'; terminalId: number; screenId?: number } | null {
    for (const r of this.dataService.restaurants) {
      for (const t of r.terminals) {
        if (rowId === t.id) return { kind: 'computer', terminalId: t.id };
        for (const s of (t.screens ?? [])) {
          if (rowId === t.id * 1000 + s.id) return { kind: 'display', terminalId: t.id, screenId: s.id };
        }
      }
    }
    return null;
  }

  private findTerminal(terminalId: number): CSTerminalV2 | undefined {
    for (const r of this.dataService.restaurants) {
      const t = r.terminals.find(t => t.id === terminalId);
      if (t) return t;
    }
    return undefined;
  }

  getTerminalWord(n: number): string {
    const m10 = n % 10, m100 = n % 100;
    if (m100 >= 11 && m100 <= 19) return 'терминалов';
    if (m10 === 1) return 'терминал';
    if (m10 >= 2 && m10 <= 4) return 'терминала';
    return 'терминалов';
  }

  private showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
