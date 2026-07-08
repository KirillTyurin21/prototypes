import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsDataService } from '../cs-data.service';
import { CSRestaurant, CSTerminalV2, TerminalScreenshot } from '../cs-types';
import { IconsModule } from '@/shared/icons.module';
import { CsTreeNodeComponent } from '../components/cs-tree-node.component';

@Component({
  selector: 'app-cs-terminals-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CsTreeNodeComponent],
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
          <!-- Tree container -->
          <div class="cs-tree-container">
            <app-cs-tree-node
              *ngFor="let terminal of getFilteredTerminals(restaurant)"
              [node]="{ kind: 'terminal', data: terminal }"
              [level]="0"
              [selectedIds]="selectedTerminals"
              [expandedNodes]="expandedNodes"
              [themeOptions]="dataService.themeOptions"
              [campaignOptions]="dataService.campaignOptions"
              [hintOptions]="dataService.hintOptions"
              (toggleTerminal)="toggleTerminal($event)"
              (campaignChange)="onCampaignChange(restaurant.id, $event)"
              (themeChange)="onTreeThemeChange(restaurant.id, $event)"
              (toggleHint)="toggleHint(restaurant.id, $event)"
              (clearHints)="clearHints(restaurant.id, $event)"
            ></app-cs-tree-node>
          </div>
          <!-- Empty state for filtered terminals -->
          <div *ngIf="getFilteredTerminals(restaurant).length === 0" class="cs-empty-state" style="padding: 32px 16px;">
            <lucide-icon name="monitor" [size]="32" class="text-gray-300"></lucide-icon>
            <span>Нет терминалов, соответствующих фильтру</span>
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
    .cs-tree-container { padding: 0; }
    .cs-empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #9e9e9e; font-size: 14px; }
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
    .cs-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; cursor: pointer; transition: all .15s; color: #757575; }
    .cs-icon-btn:hover { background: #f5f5f5; }
  `],
})
export class CsTerminalsScreenComponent {
  dataService = inject(CsDataService);

  expandedRestaurants = new Set<number>();
  selectedTerminals = new Set<number>();
  expandedNodes = new Set<string>();
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
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

  toggleTerminal(id: number): void { this.selectedTerminals.has(id) ? this.selectedTerminals.delete(id) : this.selectedTerminals.add(id); }

  onPageClick(_event: Event): void { }

  // ─── Tree operations ───────────────────────

  onCampaignChange(restaurantId: number, event: { terminalId: number; screenId: number; panelId: number; campaignId: number | null }): void {
    const terminal = this.findTerminal(event.terminalId);
    if (!terminal?.screens) return;
    const screen = terminal.screens.find(s => s.id === event.screenId);
    if (!screen) return;
    const panel = screen.advertisePanels.find(p => p.id === event.panelId);
    if (!panel) return;
    panel.campaignId = event.campaignId;
    panel.campaignName = event.campaignId ? this.dataService.campaignOptions.find(c => c.id === event.campaignId)?.name : undefined;
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  onTreeThemeChange(restaurantId: number, event: { terminalId: number; screenId: number; themeId: number | null }): void {
    const terminal = this.findTerminal(event.terminalId);
    if (!terminal?.screens) return;
    const screen = terminal.screens.find(s => s.id === event.screenId);
    if (!screen) return;
    screen.themeId = event.themeId;
    screen.themeName = event.themeId ? this.dataService.themeOptions.find(o => o.id === event.themeId)?.name : undefined;
    // Update legacy field for backward compatibility
    terminal.themeId = event.themeId;
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  toggleHint(restaurantId: number, event: { terminalId: number; hintId: number }): void {
    const terminal = this.findTerminal(event.terminalId);
    if (!terminal) return;
    const idx = terminal.hintIds.indexOf(event.hintId);
    idx >= 0 ? terminal.hintIds.splice(idx, 1) : terminal.hintIds.push(event.hintId);
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
  }

  clearHints(restaurantId: number, event: { terminalId: number }): void {
    const terminal = this.findTerminal(event.terminalId);
    if (!terminal) return;
    terminal.hintIds = [];
    this.dataService.markTerminalChanged(restaurantId, terminal.id);
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
