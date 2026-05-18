import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsDataService } from '../cs-data.service';
import { CSRestaurant, CSTerminalV2, TerminalScreenshot } from '../cs-types';
import { IconsModule } from '@/shared/icons.module';
import { CsMultiSelectCellComponent } from '../components/cs-multi-select-cell.component';

@Component({
  selector: 'app-cs-terminals-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CsMultiSelectCellComponent],
  template: `
    <div *ngIf="showToast" class="fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg animate-fade-in" [ngClass]="toastType === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
      <lucide-icon [name]="toastType === 'success' ? 'check-circle-2' : 'alert-circle'" [size]="18"></lucide-icon>
      <span>{{ toastMessage }}</span>
    </div>
    <div class="cs-page" (click)="onPageClick($event)">
      <div class="cs-toolbar">
        <h2 class="cs-toolbar-title">Настройки экрана</h2>
        <div class="cs-toolbar-actions">
          <button class="cs-btn cs-btn-primary" (click)="save()">СОХРАНИТЬ</button>
          <button class="cs-btn cs-btn-outline" [disabled]="selectedTerminals.size === 0 || isSending" (click)="sendSettings()">
            <lucide-icon [name]="isSending ? 'loader-2' : 'settings'" [size]="16" [class.cs-spin]="isSending"></lucide-icon>
            {{ isSending ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ НАСТРОЙКИ' + (selectedTerminals.size > 0 ? ' (' + selectedTerminals.size + ')' : '') }}
          </button>
        </div>
      </div>
      <div class="cs-search-row">
        <input type="text" class="cs-search-input" placeholder="Поиск по ресторану" [(ngModel)]="searchRestaurant" />
        <input type="text" class="cs-search-input" placeholder="Поиск по терминалу" [(ngModel)]="searchTerminal" />
      </div>
      <div class="cs-system-row"><button class="cs-btn cs-btn-green" (click)="showSystemSettingsModal = true">СИСТЕМНЫЕ НАСТРОЙКИ</button></div>

      <div class="cs-accordion" *ngFor="let restaurant of getFilteredRestaurants()">
        <div class="cs-accordion-header" (click)="toggleRestaurant(restaurant.id)">
          <span class="cs-accordion-name">Торг. предприятие ({{ getFilteredTerminals(restaurant).length }})</span>
          <div class="cs-accordion-right">
            <span class="cs-accordion-count">{{ getFilteredTerminals(restaurant).length }} {{ getTerminalWord(getFilteredTerminals(restaurant).length) }}</span>
            <lucide-icon [name]="expandedRestaurants.has(restaurant.id) ? 'chevron-up' : 'chevron-down'" [size]="20" class="cs-accordion-chevron"></lucide-icon>
          </div>
        </div>
        <div class="cs-accordion-body" *ngIf="expandedRestaurants.has(restaurant.id)">
          <div class="cs-table-wrap">
            <table class="cs-table">
              <thead><tr>
                <th class="cs-th cs-th-checkbox"><label class="cs-checkbox-wrap" (click)="$event.stopPropagation()"><input type="checkbox" class="cs-checkbox" [checked]="isRestaurantSelected(restaurant)" (change)="toggleSelectRestaurant(restaurant)" /></label></th>
                <th class="cs-th cs-th-terminal">Кассовый аппарат</th>
                <th class="cs-th cs-th-theme">Тема</th>
                <th class="cs-th cs-th-multi">Терминальные группы</th>
                <th class="cs-th cs-th-multi">Кампании</th>
                <th class="cs-th cs-th-multi">Настройки</th>
                <th class="cs-th cs-th-actions"></th>
              </tr></thead>
              <tbody>
                <tr *ngFor="let terminal of getFilteredTerminals(restaurant)" class="cs-row">
                  <td class="cs-td cs-td-checkbox"><label class="cs-checkbox-wrap"><input type="checkbox" class="cs-checkbox" [checked]="selectedTerminals.has(terminal.id)" (change)="toggleTerminal(terminal.id)" /></label></td>
                  <td class="cs-td cs-td-terminal">
                    <div class="cs-terminal-row"><lucide-icon name="monitor" [size]="18" class="cs-terminal-icon"></lucide-icon><span class="cs-terminal-name">{{ terminal.name }}</span><button class="cs-edit-name-btn" title="Переименовать" (click)="$event.stopPropagation()"><lucide-icon name="pencil" [size]="14"></lucide-icon></button></div>
                  </td>
                  <td class="cs-td cs-td-theme">
                    <div class="cs-field-cell" (click)="$event.stopPropagation()"><span class="cs-field-label">Выбрать</span><div class="cs-field-dropdown"><select class="cs-select" [ngModel]="terminal.themeId" (ngModelChange)="onThemeChange(restaurant.id, terminal, $event)"><option [ngValue]="null">Выбрать</option><option *ngFor="let theme of dataService.themeOptions" [ngValue]="theme.id">{{ theme.name }}</option></select><button class="cs-clear-btn" *ngIf="terminal.themeId !== null" (click)="onThemeChange(restaurant.id, terminal, null); $event.stopPropagation()"><lucide-icon name="x" [size]="14"></lucide-icon></button></div></div>
                  </td>
                  <td class="cs-td cs-td-multi">
                    <app-cs-multi-select-cell [options]="dataService.terminalGroupOptions" [selectedIds]="terminal.terminalGroupIds" [summary]="getTerminalGroupsSummary(terminal)" [open]="isDropdownOpen(terminal.id, 'terminalGroups')" emptyText="Нет доступных групп" (toggle)="toggleDropdown(terminal.id, 'terminalGroups')" (clear)="clearTerminalGroups(restaurant.id, terminal)" (toggleOption)="toggleTerminalGroup(restaurant.id, terminal, $event)"></app-cs-multi-select-cell>
                  </td>
                  <td class="cs-td cs-td-multi">
                    <app-cs-multi-select-cell [options]="dataService.campaignOptions" [selectedIds]="terminal.campaignIds" [summary]="getCampaignsSummary(terminal)" [open]="isDropdownOpen(terminal.id, 'campaigns')" emptyText="Нет доступных кампаний" (toggle)="toggleDropdown(terminal.id, 'campaigns')" (clear)="clearCampaigns(restaurant.id, terminal)" (toggleOption)="toggleCampaign(restaurant.id, terminal, $event)"></app-cs-multi-select-cell>
                  </td>
                  <td class="cs-td cs-td-multi">
                    <app-cs-multi-select-cell [options]="dataService.hintOptions" [selectedIds]="terminal.hintIds" [summary]="getHintsSummary(terminal)" [open]="isDropdownOpen(terminal.id, 'hints')" emptyText="Нет доступных настроек" (toggle)="toggleDropdown(terminal.id, 'hints')" (clear)="clearHints(restaurant.id, terminal)" (toggleOption)="toggleHint(restaurant.id, terminal, $event)"></app-cs-multi-select-cell>
                  </td>
                  <td class="cs-td cs-td-actions">
                    <button class="cs-icon-btn" *ngIf="terminal.supportsScreenshot && terminal.isOnline" [disabled]="screenshotLoadingId === terminal.id" title="Получить скриншот" (click)="requestScreenshot(terminal, restaurant)"><lucide-icon [name]="screenshotLoadingId === terminal.id ? 'loader-2' : 'camera'" [size]="18" [class.cs-spin]="screenshotLoadingId === terminal.id"></lucide-icon></button>
                    <button class="cs-icon-btn cs-icon-btn--add" *ngIf="!terminal.supportsScreenshot || !terminal.isOnline" title="Добавить"><lucide-icon name="plus-circle" [size]="18"></lucide-icon></button>
                  </td>
                </tr>
                <tr *ngIf="getFilteredTerminals(restaurant).length === 0"><td colspan="7" class="cs-td-empty"><div class="cs-empty-state"><lucide-icon name="monitor" [size]="32" class="text-gray-300"></lucide-icon><span>Нет терминалов, соответствующих фильтру</span></div></td></tr>
              </tbody>
            </table>
          </div>
          <div class="cs-default-row">
            <span class="cs-default-label">Привязка по умолчанию:</span>
            <div class="cs-default-fields">
              <div class="cs-field-cell"><span class="cs-field-label">Выбрать</span><div class="cs-field-dropdown"><select class="cs-select cs-select-sm"><option>{{ getDefaultThemeName(restaurant) }}</option></select><button class="cs-clear-btn"><lucide-icon name="x" [size]="14"></lucide-icon></button></div></div>
              <div class="cs-field-cell"><span class="cs-field-label">Выбрать</span><div class="cs-field-dropdown"><select class="cs-select cs-select-sm"><option>{{ getDefaultTerminalGroupsSummary(restaurant) }}</option></select><button class="cs-clear-btn"><lucide-icon name="x" [size]="14"></lucide-icon></button></div></div>
              <div class="cs-field-cell"><span class="cs-field-label">Выбрать</span><div class="cs-field-dropdown"><select class="cs-select cs-select-sm"><option>{{ getDefaultCampaignsSummary(restaurant) }}</option></select><button class="cs-clear-btn"><lucide-icon name="x" [size]="14"></lucide-icon></button></div></div>
              <div class="cs-field-cell"><span class="cs-field-label">Выбрать</span><div class="cs-field-dropdown"><select class="cs-select cs-select-sm"><option>{{ getDefaultHintsSummary(restaurant) }}</option></select><button class="cs-clear-btn"><lucide-icon name="x" [size]="14"></lucide-icon></button></div></div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="getFilteredRestaurants().length === 0" class="cs-no-data">
        <lucide-icon name="monitor" [size]="48" class="text-gray-300"></lucide-icon>
        <p class="text-gray-500 mt-2">{{ searchRestaurant || searchTerminal ? 'Ничего не найдено' : 'Нет подключённых ресторанов' }}</p>
      </div>
    </div>

    <!-- Screenshot Modal -->
    <div class="cs-modal-overlay" *ngIf="screenshotModal" (click)="closeScreenshotModal()">
      <div class="cs-modal" (click)="$event.stopPropagation()">
        <div class="cs-modal-header"><h3 class="cs-modal-title">Скриншот экрана</h3><button class="cs-icon-btn" (click)="closeScreenshotModal()"><lucide-icon name="x" [size]="20"></lucide-icon></button></div>
        <div class="cs-modal-body">
          <div class="cs-screenshot-image-wrap"><img [src]="getScreenshotUrl(screenshotModal)" [alt]="'Скриншот: ' + screenshotModal.terminalName" class="cs-screenshot-img" /></div>
          <div class="cs-screenshot-meta">
            <div class="cs-meta-row"><span class="cs-meta-label">Ресторан</span><span class="cs-meta-value">{{ screenshotModal.restaurantName }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Терминал</span><span class="cs-meta-value">{{ screenshotModal.terminalName }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Время снимка</span><span class="cs-meta-value">{{ formatScreenshotTime(screenshotModal) }}</span></div>
            <div class="cs-meta-row"><span class="cs-meta-label">Разрешение</span><span class="cs-meta-value">{{ screenshotModal.resolution }}</span></div>
          </div>
        </div>
        <div class="cs-modal-footer"><button class="cs-btn cs-btn-outline" (click)="closeScreenshotModal()">Закрыть</button></div>
      </div>
    </div>

    <!-- System Settings Modal -->
    <div class="cs-modal-overlay" *ngIf="showSystemSettingsModal" (click)="showSystemSettingsModal = false">
      <div class="cs-modal" (click)="$event.stopPropagation()">
        <div class="cs-modal-header"><h3 class="cs-modal-title">Системные настройки</h3><button class="cs-icon-btn" (click)="showSystemSettingsModal = false"><lucide-icon name="x" [size]="20"></lucide-icon></button></div>
        <div class="cs-modal-body"><p style="color: #757575; font-size: 14px;">Настройки системного уровня будут доступны в следующей версии.</p></div>
        <div class="cs-modal-footer"><button class="cs-btn cs-btn-outline" (click)="showSystemSettingsModal = false">Закрыть</button></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    .cs-page { padding: 0; background: transparent; min-height: 100%; font-family: 'Roboto', sans-serif; }
    .cs-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .cs-toolbar-title { font-size: 20px; font-weight: 400; color: rgba(0,0,0,.87); margin: 0; }
    .cs-toolbar-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .cs-search-row { display: flex; gap: 12px; margin-bottom: 16px; }
    .cs-search-input { padding: 8px 14px; font-size: 14px; font-family: 'Roboto', sans-serif; border: 1px solid rgba(0,0,0,.23); border-radius: 4px; background: #fff; color: rgba(0,0,0,.87); width: 220px; transition: border-color .15s; }
    .cs-search-input::placeholder { color: #9e9e9e; }
    .cs-search-input:focus { border-color: #1976d2; outline: none; box-shadow: 0 0 0 1px #1976d2; }
    .cs-system-row { margin-bottom: 20px; }
    .cs-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; font-size: 13px; font-weight: 500; font-family: 'Roboto', sans-serif; border-radius: 4px; cursor: pointer; transition: all .15s ease; white-space: nowrap; border: 1px solid transparent; line-height: 1.4; text-transform: uppercase; letter-spacing: .3px; }
    .cs-btn-outline { background: #fff; color: rgba(0,0,0,.6); border-color: rgba(0,0,0,.23); }
    .cs-btn-outline:hover { background: #f5f5f5; border-color: rgba(0,0,0,.4); }
    .cs-btn-primary { background: #1976d2; color: #fff; border-color: #1976d2; box-shadow: 0 2px 4px rgba(25,118,210,.3); }
    .cs-btn-primary:hover { background: #1565c0; }
    .cs-btn-green { background: #4caf50; color: #fff; border-color: #4caf50; box-shadow: 0 2px 4px rgba(76,175,80,.3); }
    .cs-btn-green:hover { background: #43a047; }
    .cs-btn-primary:disabled { background: #90caf9; border-color: #90caf9; cursor: not-allowed; }
    .cs-btn-outline:disabled { opacity: .5; cursor: not-allowed; }
    .cs-accordion { background: #fff; border: 1px solid rgba(0,0,0,.12); border-radius: 4px; margin-bottom: 8px; overflow: visible; }
    .cs-accordion-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; user-select: none; transition: background .15s; }
    .cs-accordion-header:hover { background: #fafafa; }
    .cs-accordion-name { font-size: 14px; font-weight: 500; color: rgba(0,0,0,.87); }
    .cs-accordion-right { display: flex; align-items: center; gap: 16px; }
    .cs-accordion-count { font-size: 13px; color: #757575; }
    .cs-accordion-chevron { color: #9e9e9e; }
    .cs-accordion-body { border-top: 1px solid rgba(0,0,0,.12); }
    .cs-table-wrap { overflow: visible; }
    .cs-table { width: 100%; border-collapse: collapse; table-layout: fixed; min-width: 1060px; }
    .cs-th { padding: 10px 12px; font-size: 12px; font-weight: 500; color: #616161; text-align: left; background: #fafafa; border-bottom: 1px solid rgba(0,0,0,.12); white-space: nowrap; }
    .cs-th-checkbox { width: 44px; } .cs-th-terminal { width: 220px; } .cs-th-theme { width: 180px; } .cs-th-multi { width: 180px; } .cs-th-actions { width: 56px; text-align: center; }
    .cs-td { padding: 10px 12px; border-bottom: 1px solid rgba(0,0,0,.06); vertical-align: middle; font-size: 14px; color: rgba(0,0,0,.87); }
    .cs-td-checkbox, .cs-td-actions, .cs-td-theme { vertical-align: middle; }
    .cs-td-multi { vertical-align: middle; position: relative; }
    .cs-td-actions { text-align: center; }
    .cs-row { transition: background .1s; } .cs-row:hover { background: #f8fbff; }
    .cs-td-empty { padding: 40px 16px; text-align: center; }
    .cs-empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #9e9e9e; font-size: 14px; }
    .cs-terminal-row { display: flex; align-items: center; gap: 8px; }
    .cs-terminal-icon { color: #9e9e9e; flex-shrink: 0; }
    .cs-terminal-name { font-weight: 400; font-size: 14px; color: rgba(0,0,0,.87); }
    .cs-edit-name-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: none; background: none; cursor: pointer; color: #bdbdbd; border-radius: 50%; transition: all .15s; }
    .cs-edit-name-btn:hover { background: #f5f5f5; color: #757575; }
    .cs-field-cell { display: flex; flex-direction: column; gap: 2px; }
    .cs-field-label { font-size: 11px; color: #9e9e9e; line-height: 1; }
    .cs-field-dropdown { display: flex; align-items: center; gap: 4px; position: relative; }
    .cs-clear-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: none; background: none; cursor: pointer; color: #bdbdbd; border-radius: 50%; flex-shrink: 0; transition: all .15s; }
    .cs-clear-btn:hover { background: #f5f5f5; color: #757575; }
    .cs-checkbox-wrap { display: inline-flex; align-items: center; cursor: pointer; }
    .cs-checkbox { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; border: 2px solid rgba(0,0,0,.38); border-radius: 2px; cursor: pointer; position: relative; transition: all .15s; flex-shrink: 0; background: #fff; }
    .cs-checkbox:hover { border-color: #1976d2; }
    .cs-checkbox:checked { background: #1976d2; border-color: #1976d2; }
    .cs-checkbox:checked::after { content: ''; position: absolute; top: 1px; left: 5px; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    .cs-select { flex: 1; min-width: 0; padding: 6px 28px 6px 10px; font-size: 13px; font-family: 'Roboto', sans-serif; border: 1px solid rgba(0,0,0,.2); border-radius: 4px; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23757575'/%3E%3C/svg%3E") no-repeat right 10px center; appearance: none; -webkit-appearance: none; cursor: pointer; color: rgba(0,0,0,.87); transition: border-color .15s; }
    .cs-select:hover { border-color: rgba(0,0,0,.4); }
    .cs-select:focus { border-color: #1976d2; outline: none; box-shadow: 0 0 0 1px #1976d2; }
    .cs-select-sm { padding: 5px 28px 5px 8px; font-size: 12px; }
    .cs-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; cursor: pointer; transition: all .15s; color: #757575; }
    .cs-icon-btn:hover { background: #f5f5f5; }
    .cs-icon-btn--add { color: #9e9e9e; } .cs-icon-btn--add:hover { color: #616161; }
    .cs-default-row { display: flex; align-items: center; gap: 16px; padding: 12px 16px; background: #fafafa; border-top: 1px solid rgba(0,0,0,.06); font-size: 13px; color: #757575; flex-wrap: wrap; }
    .cs-default-label { font-weight: 500; color: rgba(0,0,0,.6); white-space: nowrap; }
    .cs-default-fields { display: flex; gap: 16px; flex: 1; }
    .cs-no-data { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; text-align: center; }
    @keyframes cs-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .cs-spin { animation: cs-spin 1s linear infinite; }
    .cs-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 100; display: flex; align-items: center; justify-content: center; animation: cs-overlay-in .2s ease-out; }
    @keyframes cs-overlay-in { from { opacity: 0; } to { opacity: 1; } }
    .cs-modal { background: #fff; border-radius: 8px; box-shadow: 0 24px 48px rgba(0,0,0,.2); max-width: 720px; width: 95%; max-height: 90vh; overflow-y: auto; animation: cs-modal-in .25s ease-out; }
    @keyframes cs-modal-in { from { opacity: 0; transform: scale(.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .cs-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.12); }
    .cs-modal-title { font-size: 18px; font-weight: 500; color: rgba(0,0,0,.87); margin: 0; }
    .cs-modal-body { padding: 20px; }
    .cs-modal-footer { display: flex; justify-content: flex-end; padding: 12px 20px; border-top: 1px solid rgba(0,0,0,.12); }
    .cs-screenshot-image-wrap { background: #263238; border-radius: 6px; overflow: hidden; margin-bottom: 16px; }
    .cs-screenshot-img { width: 100%; display: block; }
    .cs-screenshot-meta { background: #f5f5f5; border-radius: 6px; padding: 12px 16px; }
    .cs-meta-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid rgba(0,0,0,.06); }
    .cs-meta-row:last-child { border-bottom: none; }
    .cs-meta-label { color: #757575; font-weight: 500; }
    .cs-meta-value { color: rgba(0,0,0,.87); }
  `],
})
export class CsTerminalsScreenComponent {
  dataService = inject(CsDataService);

  expandedRestaurants = new Set<number>();
  selectedTerminals = new Set<number>();
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  openDropdown: { terminalId: number; column: 'campaigns' | 'hints' | 'terminalGroups' } | null = null;
  isSending = false;
  screenshotLoadingId: number | null = null;
  screenshotModal: TerminalScreenshot | null = null;
  showSystemSettingsModal = false;
  searchRestaurant = '';
  searchTerminal = '';

  constructor() {
    const restaurants = this.dataService.restaurants;
    if (restaurants.length > 0) this.expandedRestaurants.add(restaurants[0].id);
  }

  getFilteredRestaurants(): CSRestaurant[] {
    let list = this.dataService.restaurants;
    if (this.searchRestaurant) { const q = this.searchRestaurant.toLowerCase(); list = list.filter(r => r.name.toLowerCase().includes(q)); }
    if (this.searchTerminal) { const q = this.searchTerminal.toLowerCase(); list = list.filter(r => r.terminals.some(t => t.name.toLowerCase().includes(q))); }
    return list;
  }

  getFilteredTerminals(restaurant: CSRestaurant): CSTerminalV2[] {
    if (!this.searchTerminal) return restaurant.terminals;
    const q = this.searchTerminal.toLowerCase();
    return restaurant.terminals.filter(t => t.name.toLowerCase().includes(q));
  }

  toggleRestaurant(id: number): void { this.expandedRestaurants.has(id) ? this.expandedRestaurants.delete(id) : this.expandedRestaurants.add(id); }

  toggleSelectRestaurant(restaurant: CSRestaurant): void {
    const visible = restaurant.terminals;
    const allSelected = visible.every(t => this.selectedTerminals.has(t.id));
    for (const t of visible) { allSelected ? this.selectedTerminals.delete(t.id) : this.selectedTerminals.add(t.id); }
  }

  isRestaurantSelected(restaurant: CSRestaurant): boolean {
    return restaurant.terminals.length > 0 && restaurant.terminals.every(t => this.selectedTerminals.has(t.id));
  }

  toggleTerminal(id: number): void { this.selectedTerminals.has(id) ? this.selectedTerminals.delete(id) : this.selectedTerminals.add(id); }

  onThemeChange(restaurantId: number, terminal: CSTerminalV2, themeId: number | null): void { terminal.themeId = themeId; this.dataService.markTerminalChanged(restaurantId, terminal.id); }

  toggleDropdown(terminalId: number, column: 'campaigns' | 'hints' | 'terminalGroups'): void {
    this.openDropdown = (this.openDropdown?.terminalId === terminalId && this.openDropdown?.column === column) ? null : { terminalId, column };
  }

  isDropdownOpen(terminalId: number, column: 'campaigns' | 'hints' | 'terminalGroups'): boolean {
    return this.openDropdown?.terminalId === terminalId && this.openDropdown?.column === column;
  }

  onPageClick(_event: Event): void { if (this.openDropdown) this.openDropdown = null; }

  toggleTerminalGroup(restaurantId: number, terminal: CSTerminalV2, groupId: number): void {
    const idx = terminal.terminalGroupIds.indexOf(groupId);
    idx >= 0 ? terminal.terminalGroupIds.splice(idx, 1) : terminal.terminalGroupIds.push(groupId);
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  clearTerminalGroups(restaurantId: number, terminal: CSTerminalV2): void { terminal.terminalGroupIds = []; this.dataService.markTerminalChanged(restaurantId, terminal.id); }

  toggleCampaign(restaurantId: number, terminal: CSTerminalV2, campaignId: number): void {
    const idx = terminal.campaignIds.indexOf(campaignId);
    idx >= 0 ? terminal.campaignIds.splice(idx, 1) : terminal.campaignIds.push(campaignId);
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  clearCampaigns(restaurantId: number, terminal: CSTerminalV2): void { terminal.campaignIds = []; this.dataService.markTerminalChanged(restaurantId, terminal.id); }

  toggleHint(restaurantId: number, terminal: CSTerminalV2, hintId: number): void {
    const idx = terminal.hintIds.indexOf(hintId);
    idx >= 0 ? terminal.hintIds.splice(idx, 1) : terminal.hintIds.push(hintId);
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  clearHints(restaurantId: number, terminal: CSTerminalV2): void { terminal.hintIds = []; this.dataService.markTerminalChanged(restaurantId, terminal.id); }

  getTerminalGroupsSummary(terminal: CSTerminalV2): string {
    if (terminal.terminalGroupIds.length === 0) return '— Все группы —';
    if (terminal.terminalGroupIds.length === 1) { const opt = this.dataService.terminalGroupOptions.find(g => g.id === terminal.terminalGroupIds[0]); return opt?.name ?? '1 выбрано'; }
    return terminal.terminalGroupIds.length + ' выбрано';
  }

  getCampaignsSummary(terminal: CSTerminalV2): string {
    if (terminal.campaignIds.length === 0) return '— Не выбрано —';
    if (terminal.campaignIds.length === 1) { const opt = this.dataService.campaignOptions.find(c => c.id === terminal.campaignIds[0]); return opt?.name ?? '1 выбрано'; }
    return terminal.campaignIds.length + ' выбрано';
  }

  getHintsSummary(terminal: CSTerminalV2): string {
    if (terminal.hintIds.length === 0) return '— Не выбрано —';
    if (terminal.hintIds.length === 1) { const opt = this.dataService.hintOptions.find(h => h.id === terminal.hintIds[0]); return opt?.name ?? '1 выбрано'; }
    return terminal.hintIds.length + ' выбрано';
  }

  getDefaultThemeName(restaurant: CSRestaurant): string {
    const counts = new Map<number | null, number>();
    for (const t of restaurant.terminals) counts.set(t.themeId, (counts.get(t.themeId) ?? 0) + 1);
    let maxId: number | null = null, maxCount = 0;
    counts.forEach((c, id) => { if (c > maxCount) { maxCount = c; maxId = id; } });
    return this.dataService.getThemeName(maxId);
  }

  getDefaultCampaignsSummary(restaurant: CSRestaurant): string {
    const ids = new Set<number>(); for (const t of restaurant.terminals) for (const id of t.campaignIds) ids.add(id);
    if (ids.size === 0) return '—';
    const names = Array.from(ids).map(id => this.dataService.campaignOptions.find(c => c.id === id)?.name).filter(Boolean);
    return names.length <= 2 ? names.join(', ') : names.length + ' кампаний';
  }

  getDefaultHintsSummary(restaurant: CSRestaurant): string {
    const ids = new Set<number>(); for (const t of restaurant.terminals) for (const id of t.hintIds) ids.add(id);
    if (ids.size === 0) return '—';
    const names = Array.from(ids).map(id => this.dataService.hintOptions.find(h => h.id === id)?.name).filter(Boolean);
    return names.length <= 2 ? names.join(', ') : names.length + ' подсказок';
  }

  getDefaultTerminalGroupsSummary(restaurant: CSRestaurant): string {
    const ids = new Set<number>(); for (const t of restaurant.terminals) for (const id of t.terminalGroupIds) ids.add(id);
    if (ids.size === 0) return 'Все группы';
    const names = Array.from(ids).map(id => this.dataService.terminalGroupOptions.find(g => g.id === id)?.name).filter(Boolean);
    return names.length <= 2 ? names.join(', ') : names.length + ' групп';
  }

  getTerminalWord(n: number): string {
    const m10 = n % 10, m100 = n % 100;
    if (m100 >= 11 && m100 <= 19) return 'терминалов';
    if (m10 === 1) return 'терминал';
    if (m10 >= 2 && m10 <= 4) return 'терминала';
    return 'терминалов';
  }

  save(): void { this.dataService.updateRestaurants(this.dataService.restaurants); this.showToastMessage('Настройки терминалов сохранены', 'success'); }

  async sendSettings(): Promise<void> {
    if (this.selectedTerminals.size === 0 || this.isSending) return;
    const ids = Array.from(this.selectedTerminals);
    this.isSending = true;
    this.showToastMessage('Отправка настроек на ' + ids.length + ' ' + this.getTerminalWord(ids.length) + '...', 'success');
    try { await this.dataService.sendSettings(ids); this.showToastMessage('Настройки успешно отправлены на ' + ids.length + ' ' + this.getTerminalWord(ids.length), 'success'); this.selectedTerminals.clear(); }
    catch { this.showToastMessage('Ошибка при отправке настроек', 'error'); }
    finally { this.isSending = false; }
  }

  async requestScreenshot(terminal: CSTerminalV2, restaurant: CSRestaurant): Promise<void> {
    if (this.screenshotLoadingId || !terminal.supportsScreenshot || !terminal.isOnline) return;
    this.screenshotLoadingId = terminal.id;
    this.showToastMessage('Получение скриншота с «' + terminal.name + '»...', 'success');
    try { const s = await this.dataService.requestScreenshot(terminal.id); if (s) this.screenshotModal = s; }
    catch (e: any) { this.showToastMessage(e?.message || 'Ошибка получения скриншота', 'error'); }
    finally { this.screenshotLoadingId = null; }
  }

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
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ', ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ' (' + screenshot.timezoneLabel + ')';
  }

  private showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message; this.toastType = type; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
