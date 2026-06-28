import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { SoundTerminalGroup, SoundTerminal, ArrivalsDevice, ArrivalsDisplay } from '../types';
import {
  MOCK_SOUND_TERMINAL_GROUPS,
  MOCK_SOUND_EVENT_HANDLERS,
  MOCK_ARRIVALS_DEVICES,
  getAudioDeviceOptions,
  AudioDeviceOption,
} from '../data/mock-data';
import { SoundEventHandler } from '../types';

@Component({
  selector: 'app-sounds-terminals-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="terminals-screen">
      <!-- Page header -->
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Настройка терминалов</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-primary" [class.app-btn-active]="hasUnsavedChanges" (click)="save()">СОХРАНИТЬ</button>
            <button class="icon-btn" title="Информация">
              <lucide-icon name="info" [size]="20"></lucide-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Search filters -->
      <div class="search-row">
        <div class="search-field">
          <lucide-icon name="search" [size]="16" class="search-icon"></lucide-icon>
          <input type="text" class="search-input" [(ngModel)]="searchRestaurant" placeholder="Поиск по ресторану" />
        </div>
        <div class="search-field">
          <lucide-icon name="search" [size]="16" class="search-icon"></lucide-icon>
          <input type="text" class="search-input" [(ngModel)]="searchTerminal" placeholder="Поиск по терминалу" />
        </div>
      </div>

      <!-- Save feedback -->
      <div class="save-feedback" [class.save-success]="saveSuccess" [class.save-error]="saveError" *ngIf="saveSuccess || saveError">
        {{ saveSuccess ? 'Настройки сохранены' : 'Не удалось сохранить настройки. Проверьте подключение и попробуйте снова.' }}
      </div>

      <!-- Restaurant groups -->
      <div class="groups-list">
        <div class="group-card" *ngFor="let group of filteredGroups">
          <!-- Group header -->
          <div class="group-header" (click)="toggleGroup(group.id)">
            <div class="group-header-left">
              <lucide-icon
                [name]="isGroupExpanded(group.id) ? 'chevron-down' : 'chevron-right'"
                [size]="18"
                class="chevron"
              ></lucide-icon>
              <span class="group-name">{{ group.name }} ({{ group.terminalCount }})</span>
            </div>
            <span class="group-terminal-count">{{ group.terminals.length }} {{ terminalWord(group.terminals.length) }}</span>
          </div>

          <!-- Terminals table -->
          <div class="terminals-table-wrap" *ngIf="isGroupExpanded(group.id)">
            <table class="terminals-table">
              <thead>
                <tr>
                  <th class="col-terminal">Терминал</th>
                  <th class="col-handlers">Обработчики</th>
                  <th class="col-audio">Аудиоустройство</th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let t of getFilteredTerminals(group)">
                  <!-- Terminal row -->
                  <tr class="terminal-row">
                    <td class="col-terminal">
                      <div class="terminal-info">
                        <span class="terminal-name">{{ t.name }}</span>
                        <span class="terminal-activity">Последняя активность: {{ t.lastActivity }}</span>
                      </div>
                    </td>
                    <td class="col-handlers">
                      <div class="dropdown-wrap" (click)="openHandlerDropdown(t.id, $event)">
                        <div class="dropdown-display">
                          <div class="dropdown-text-with-badges">
                            <ng-container *ngFor="let hId of t.handlerIds; let last = last">
                              <span class="handler-tag">
                                <span class="handler-tag-dot" [ngClass]="getHandlerDotClass(hId)"></span>
                                {{ getHandlerName(hId) }}
                              </span>
                              <span *ngIf="!last">, </span>
                            </ng-container>
                            <span *ngIf="t.handlerIds.length === 0" class="dropdown-text">Не выбрано</span>
                          </div>
                          <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
                        </div>
                      </div>
                      <!-- Handler dropdown -->
                      <div class="dropdown-panel" *ngIf="activeHandlerDropdown === t.id"
                           [style.top.px]="dropdownTop"
                           [style.left.px]="dropdownLeft"
                           [style.width.px]="dropdownWidth">
                        <div class="dropdown-search">
                          <lucide-icon name="search" [size]="14"></lucide-icon>
                          <input type="text" class="dropdown-search-input" [(ngModel)]="handlerDropdownSearch" placeholder="Поиск..." (click)="$event.stopPropagation()" />
                        </div>
                        <label class="dropdown-option" *ngFor="let h of getFilteredHandlers()" (click)="$event.stopPropagation()">
                          <input type="checkbox" [checked]="t.handlerIds.includes(h.id)" (change)="toggleTerminalHandler(t, h.id)" />
                          <span>{{ h.name }}</span>
                          <span class="handler-badge" [ngClass]="getHandlerBadgeClass(h)">{{ getHandlerBadgeText(h) }}</span>
                        </label>
                      </div>
                    </td>
                    <td class="col-audio">
                      <div class="audio-cell">
                        <select class="audio-select" [(ngModel)]="t.audioDevice" (ngModelChange)="onAudioDeviceChange(t)">
                          <option *ngFor="let dev of audioDeviceOptions" [value]="dev.value" [disabled]="dev.label === '---'" [class.audio-divider]="dev.label === '---'" [class.audio-arrivals]="dev.type === 'arrivals'" [class.audio-offline]="dev.isOnline === false">
                            <ng-container *ngIf="dev.label === '---'">──────────────</ng-container>
                            <ng-container *ngIf="dev.label !== '---'">{{ dev.type === 'arrivals' ? '🖥 ' : '🔊 ' }}{{ dev.label }}</ng-container>
                          </option>
                        </select>
                        <!-- Refresh button for selected Arrivals -->
                        <button
                          class="refresh-btn"
                          *ngIf="getArrivalsForTerminal(t)"
                          (click)="refreshDisplays(getArrivalsForTerminal(t)!.moduleId, $event)"
                          title="Обновить список дисплеев"
                        >
                          <lucide-icon name="refresh-cw" [size]="14"></lucide-icon>
                          Обновить
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Arrivals display rows (level 3) -->
                  <ng-container *ngIf="getArrivalsForTerminal(t) as arr">
                    <!-- Loading state -->
                    <tr class="display-loading-row" *ngIf="arr.displaysLoading">
                      <td colspan="3">
                        <div class="display-loading">
                          <span class="spinner"></span>
                          <span class="loading-text">Загрузка списка дисплеев...</span>
                        </div>
                      </td>
                    </tr>
                    <!-- Error state -->
                    <tr class="display-error-row" *ngIf="arr.displaysError && !arr.displaysLoading">
                      <td colspan="3">
                        <div class="display-error">
                          <lucide-icon name="alert-triangle" [size]="16" class="error-icon"></lucide-icon>
                          <span>Не удалось загрузить список дисплеев. Нажмите «Обновить» для повторной попытки.</span>
                        </div>
                      </td>
                    </tr>
                    <!-- Display rows -->
                    <ng-container *ngIf="!arr.displaysLoading && !arr.displaysError">
                      <tr class="display-row" *ngFor="let d of arr.displays">
                        <td colspan="3">
                          <div class="display-row-inner">
                            <div class="display-info">
                              <span class="display-indicator" [class.display-online]="d.isOnline" [class.display-offline]="!d.isOnline"></span>
                              <span class="display-name">{{ d.name }}</span>
                              <span class="display-status" [class.status-online]="d.isOnline" [class.status-offline]="!d.isOnline">
                                {{ d.isOnline ? 'Онлайн' : 'Офлайн' }}
                              </span>
                            </div>
                            <div class="display-handlers" [class.display-handlers-disabled]="!d.isOnline">
                              <div class="dropdown-wrap" (click)="d.isOnline && openDisplayHandlerDropdown(d.id, $event)">
                                <div class="dropdown-display">
                                  <div class="dropdown-text-with-badges">
                                    <ng-container *ngFor="let hId of d.handlerIds; let last = last">
                                      <span class="handler-tag">
                                        <span class="handler-tag-dot" [ngClass]="getHandlerDotClass(hId)"></span>
                                        {{ getHandlerName(hId) }}
                                      </span>
                                      <span *ngIf="!last">, </span>
                                    </ng-container>
                                    <span *ngIf="d.handlerIds.length === 0" class="dropdown-text">Выберите обработчики</span>
                                  </div>
                                  <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
                                </div>
                              </div>
                              <!-- Display handler dropdown -->
                              <div class="dropdown-panel" *ngIf="activeDisplayHandlerDropdown === d.id"
                                   [style.top.px]="dropdownTop"
                                   [style.left.px]="dropdownLeft"
                                   [style.width.px]="dropdownWidth">
                                <div class="dropdown-search">
                                  <lucide-icon name="search" [size]="14"></lucide-icon>
                                  <input type="text" class="dropdown-search-input" [(ngModel)]="handlerDropdownSearch" placeholder="Поиск..." (click)="$event.stopPropagation()" />
                                </div>
                                <label class="dropdown-option" *ngFor="let h of getFilteredHandlers()" (click)="$event.stopPropagation()">
                                  <input type="checkbox" [checked]="d.handlerIds.includes(h.id)" (change)="toggleDisplayHandler(d, h.id)" />
                                  <span>{{ h.name }}</span>
                                  <span class="handler-badge" [ngClass]="getHandlerBadgeClass(h)">{{ getHandlerBadgeText(h) }}</span>
                                  <span class="handler-duplicate-hint" *ngIf="isHandlerOnOtherDisplay(arr, d.id, h.id) as otherName">
                                    Уже назначен на {{ otherName }}
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </ng-container>
                  </ng-container>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .terminals-screen { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Page header */
    .page-header { margin-bottom: 20px; }
    .page-title-row { display: flex; align-items: center; justify-content: space-between; }
    .page-title { font-size: 24px; font-weight: 500; color: var(--dt-text-primary); margin: 0; font-family: Roboto, sans-serif; }
    .header-actions { display: flex; align-items: center; gap: 8px; }

    /* Buttons */
    .app-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0 16px; height: 36px; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: Roboto, sans-serif; white-space: nowrap; }
    .app-btn-primary { background: var(--dt-brand-accent); color: var(--dt-text-inversive); }
    .app-btn-primary:hover { background: var(--dt-brand-accent-dark); }
    .app-btn-active { background: #e65100; }
    .app-btn-active:hover { background: #bf360c; }
    .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; border-radius: 50%; background: transparent; color: var(--dt-text-disable); cursor: pointer; }
    .icon-btn:hover { background: var(--dt-surface-hover); }

    /* Save feedback */
    .save-feedback { padding: 10px 16px; border-radius: 4px; margin-bottom: 16px; font-size: 14px; font-family: Roboto, sans-serif; }
    .save-success { background: #e8f5e9; color: #2e7d32; }
    .save-error { background: #ffebee; color: #c62828; }

    /* Search row */
    .search-row { display: flex; gap: 16px; margin-bottom: 20px; }
    .search-field { position: relative; flex: 1; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--dt-text-disable); }
    .search-input { width: 100%; height: 40px; padding: 0 12px 0 36px; border: 1px solid var(--dt-text-disable); border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: var(--dt-text-primary); box-sizing: border-box; outline: none; }
    .search-input:focus { border-color: var(--dt-brand-accent); }

    /* Groups */
    .groups-list { display: flex; flex-direction: column; gap: 12px; }
    .group-card { background: var(--dt-surface-primary); border-radius: 4px; border: 1px solid var(--dt-stroke-default); }
    .group-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; transition: background 0.15s; }
    .group-header:hover { background: var(--dt-surface-hover); }
    .group-header-left { display: flex; align-items: center; gap: 8px; }
    .chevron { color: var(--dt-text-secondary); }
    .group-name { font-size: 15px; font-weight: 500; color: var(--dt-text-primary); font-family: Roboto, sans-serif; }
    .group-terminal-count { font-size: 13px; color: var(--dt-text-disable); }

    /* Terminals table */
    .terminals-table-wrap { border-top: 1px solid var(--dt-stroke-default); }
    .terminals-table { width: 100%; border-collapse: collapse; font-family: Roboto, sans-serif; font-size: 14px; }
    .terminals-table thead th { text-align: left; padding: 10px 16px; font-weight: 500; color: var(--dt-text-secondary); font-size: 13px; background: var(--dt-surface-variant); border-bottom: 1px solid var(--dt-stroke-default); }
    .terminals-table td { padding: 12px 16px; border-bottom: 1px solid var(--dt-stroke-disable); color: var(--dt-text-primary); vertical-align: top; }
    .col-terminal { width: 30%; }
    .col-handlers { width: 35%; position: relative; }
    .col-audio { width: 35%; }

    .terminal-row { }
    .terminal-info { display: flex; flex-direction: column; gap: 2px; }
    .terminal-name { font-weight: 500; color: var(--dt-text-primary); }
    .terminal-activity { font-size: 12px; color: var(--dt-text-disable); }

    /* Dropdown */
    .dropdown-wrap { cursor: pointer; }
    .dropdown-display { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px solid var(--dt-text-disable); border-radius: 4px; min-height: 36px; background: var(--dt-surface-primary); }
    .dropdown-text { font-size: 13px; color: var(--dt-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
    .dropdown-panel { position: fixed; background: var(--dt-surface-primary); border: 1px solid var(--dt-stroke-default); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); z-index: 1000; max-height: 240px; overflow-y: auto; }
    .dropdown-search { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--dt-stroke-default); color: var(--dt-text-disable); }
    .dropdown-search-input { border: none; outline: none; font-size: 13px; font-family: Roboto, sans-serif; flex: 1; color: var(--dt-text-primary); }
    .dropdown-option { display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; font-size: 13px; color: var(--dt-text-primary); flex-wrap: wrap; }
    .dropdown-option:hover { background: var(--dt-surface-hover); }
    .dropdown-option input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--dt-brand-accent); cursor: pointer; }

    /* Handler duplicate hint */
    .handler-duplicate-hint { width: 100%; font-size: 11px; color: #e65100; margin-left: 26px; margin-top: 2px; }

    /* Audio select */
    .audio-cell { display: flex; align-items: center; gap: 8px; }
    .audio-select { flex: 1; height: 36px; padding: 0 8px; border: 1px solid var(--dt-text-disable); border-radius: 4px; font-size: 13px; font-family: Roboto, sans-serif; color: var(--dt-text-primary); background: var(--dt-surface-primary); outline: none; cursor: pointer; }
    .audio-select:focus { border-color: var(--dt-brand-accent); }
    .audio-arrivals { color: #1565c0; }
    .audio-offline { color: #9e9e9e; }
    .audio-divider { color: #bdbdbd; }

    /* Refresh button */
    .refresh-btn { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; height: 30px; border: 1px solid var(--dt-stroke-default); border-radius: 4px; background: var(--dt-surface-primary); color: var(--dt-text-secondary); font-size: 12px; font-family: Roboto, sans-serif; cursor: pointer; white-space: nowrap; }
    .refresh-btn:hover { background: var(--dt-surface-hover); color: var(--dt-text-primary); }

    /* Display rows (level 3) */
    .display-row { }
    .display-row td { padding: 0 16px 0 40px; border-bottom: 1px solid var(--dt-stroke-disable); background: #fafafa; }
    .display-row-inner { display: flex; align-items: center; gap: 16px; padding: 10px 0; border-left: 2px solid #e0e0e0; padding-left: 16px; }
    .display-info { display: flex; align-items: center; gap: 8px; min-width: 200px; }
    .display-indicator { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .display-online { background: #4caf50; }
    .display-offline { background: #9e9e9e; }
    .display-name { font-weight: 500; color: var(--dt-text-primary); }
    .display-status { font-size: 12px; }
    .status-online { color: #2e7d32; }
    .status-offline { color: #9e9e9e; }
    .display-handlers { flex: 1; position: relative; }
    .display-handlers-disabled { opacity: 0.5; pointer-events: none; }

    /* Display loading / error */
    .display-loading-row td { padding: 12px 16px 12px 40px; background: #fafafa; }
    .display-loading { display: flex; align-items: center; gap: 10px; color: var(--dt-text-secondary); font-size: 13px; }
    .spinner { width: 16px; height: 16px; border: 2px solid #e0e0e0; border-top-color: var(--dt-brand-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-family: Roboto, sans-serif; }

    .display-error-row td { padding: 12px 16px 12px 40px; background: #fff3e0; }
    .display-error { display: flex; align-items: center; gap: 8px; color: #e65100; font-size: 13px; font-family: Roboto, sans-serif; }
    .error-icon { flex-shrink: 0; }

    /* Handler badges */
    .handler-badge { margin-left: auto; padding: 1px 6px; border-radius: 10px; font-size: 11px; font-weight: 500; white-space: nowrap; }
    .badge-voice { background: #e8f5e9; color: #2e7d32; }
    .badge-fallback { background: #fff3e0; color: #e65100; }
    .badge-standard { background: var(--dt-surface-hover); color: var(--dt-text-secondary); }
    .dropdown-text-with-badges { font-size: 13px; color: var(--dt-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
    .handler-tag { white-space: nowrap; }
    .handler-tag-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 3px; vertical-align: middle; }
    .dot-voice { background: #4caf50; }
    .dot-fallback { background: #ff9800; }
    .dot-standard { background: #bdbdbd; }
  `],
})
export class SoundsTerminalsScreenComponent implements OnInit, OnDestroy {
  private storage = inject(StorageService);

  groups: SoundTerminalGroup[] = [];
  allHandlers: SoundEventHandler[] = [];
  arrivalsDevices: ArrivalsDevice[] = [];

  expandedGroups = new Set<number>();
  searchRestaurant = '';
  searchTerminal = '';

  activeHandlerDropdown: number | null = null;
  activeDisplayHandlerDropdown: string | null = null;
  handlerDropdownSearch = '';
  dropdownTop = 0;
  dropdownLeft = 0;
  dropdownWidth = 300;

  saveSuccess = false;
  saveError = false;
  hasUnsavedChanges = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  // Pre-computed audio device options (with divider)
  audioDeviceOptions: AudioDeviceOption[] = [];

  private clickListener = (e: Event) => {
    this.activeHandlerDropdown = null;
    this.activeDisplayHandlerDropdown = null;
  };

  ngOnInit(): void {
    this.groups = this.storage.load('web-screens', 'sound-terminal-groups', JSON.parse(JSON.stringify(MOCK_SOUND_TERMINAL_GROUPS)));
    this.allHandlers = this.storage.load('web-screens', 'sound-handlers', [...MOCK_SOUND_EVENT_HANDLERS]);
    this.arrivalsDevices = this.storage.load('web-screens', 'arrivals-devices', JSON.parse(JSON.stringify(MOCK_ARRIVALS_DEVICES)));

    // Restore terminal-display bindings
    for (const g of this.groups) {
      for (const t of g.terminals) {
        if (t.arrivalsDeviceId) {
          const arr = this.arrivalsDevices.find(a => a.moduleId === t.arrivalsDeviceId);
          if (arr && !arr.displaysLoading && !arr.displaysError) {
            // Ensure terminal audio device matches
            t.audioDevice = 'arrivals:' + t.arrivalsDeviceId;
          }
        }
      }
    }

    this.rebuildAudioOptions();
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }

  // ── Audio devices ──

  rebuildAudioOptions(): void {
    const opts = getAudioDeviceOptions(this.arrivalsDevices);
    const physical = opts.filter(o => o.type === 'physical');
    const arrivals = opts.filter(o => o.type === 'arrivals');
    // Build flat array with divider between physical and arrivals
    this.audioDeviceOptions = arrivals.length > 0
      ? [...physical, { label: '---', value: '', type: 'physical' as const }, ...arrivals]
      : [...physical];
  }

  onAudioDeviceChange(terminal: SoundTerminal): void {
    this.hasUnsavedChanges = true;
    if (terminal.audioDevice.startsWith('arrivals:')) {
      const moduleId = parseInt(terminal.audioDevice.split(':')[1], 10);
      terminal.arrivalsDeviceId = moduleId;
      // Simulate loading displays
      const arr = this.arrivalsDevices.find(a => a.moduleId === moduleId);
      if (arr) {
        arr.displaysLoading = true;
        arr.displaysError = false;
        setTimeout(() => {
          arr.displaysLoading = false;
          arr.displaysError = false;
        }, 600);
      }
    } else {
      terminal.arrivalsDeviceId = undefined;
    }
  }

  getArrivalsForTerminal(terminal: SoundTerminal): ArrivalsDevice | undefined {
    if (!terminal.arrivalsDeviceId) return undefined;
    return this.arrivalsDevices.find(a => a.moduleId === terminal.arrivalsDeviceId);
  }

  refreshDisplays(moduleId: number, event: Event): void {
    event.stopPropagation();
    const arr = this.arrivalsDevices.find(a => a.moduleId === moduleId);
    if (!arr) return;
    arr.displaysLoading = true;
    arr.displaysError = false;
    // Simulate refresh delay
    setTimeout(() => {
      arr.displaysLoading = false;
      arr.displaysError = false;
    }, 800);
  }

  // ── Groups ──

  get filteredGroups(): SoundTerminalGroup[] {
    let result = this.groups;
    const qr = this.searchRestaurant.trim().toLowerCase();
    const qt = this.searchTerminal.trim().toLowerCase();

    if (qr) {
      result = result.filter(g => {
        if (g.name.toLowerCase().includes(qr)) return true;
        // Also search display names within the group
        return g.terminals.some(t => {
          const arr = this.getArrivalsForTerminal(t);
          return arr?.displays.some(d => d.name.toLowerCase().includes(qr));
        });
      });
    }
    if (qt) {
      result = result.filter(g =>
        g.terminals.some(t => {
          if (t.name.toLowerCase().includes(qt)) return true;
          const arr = this.getArrivalsForTerminal(t);
          return arr?.displays.some(d => d.name.toLowerCase().includes(qt));
        })
      );
    }
    return result;
  }

  getFilteredTerminals(group: SoundTerminalGroup): SoundTerminal[] {
    if (!this.searchTerminal.trim()) return group.terminals;
    const q = this.searchTerminal.toLowerCase();
    return group.terminals.filter(t => {
      if (t.name.toLowerCase().includes(q)) return true;
      const arr = this.getArrivalsForTerminal(t);
      return arr?.displays.some(d => d.name.toLowerCase().includes(q));
    });
  }

  toggleGroup(id: number): void {
    if (this.expandedGroups.has(id)) {
      this.expandedGroups.delete(id);
    } else {
      this.expandedGroups.add(id);
    }
  }

  isGroupExpanded(id: number): boolean {
    return this.expandedGroups.has(id);
  }

  terminalWord(count: number): string {
    if (count === 1) return 'терминал';
    if (count >= 2 && count <= 4) return 'терминала';
    return 'терминалов';
  }

  // ── Terminal handlers dropdown ──

  openHandlerDropdown(terminalId: number, event: Event): void {
    event.stopPropagation();
    if (this.activeHandlerDropdown === terminalId) {
      this.activeHandlerDropdown = null;
      return;
    }
    this.activeDisplayHandlerDropdown = null;
    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();
    this.dropdownTop = rect.bottom + 2;
    this.dropdownLeft = rect.left;
    this.dropdownWidth = rect.width;
    this.activeHandlerDropdown = terminalId;
    this.handlerDropdownSearch = '';
  }

  getFilteredHandlers(): SoundEventHandler[] {
    if (!this.handlerDropdownSearch.trim()) return this.allHandlers;
    const q = this.handlerDropdownSearch.toLowerCase();
    return this.allHandlers.filter(h => h.name.toLowerCase().includes(q));
  }

  toggleTerminalHandler(terminal: SoundTerminal, handlerId: number): void {
    const idx = terminal.handlerIds.indexOf(handlerId);
    if (idx >= 0) {
      terminal.handlerIds.splice(idx, 1);
    } else {
      terminal.handlerIds.push(handlerId);
    }
    this.hasUnsavedChanges = true;
  }

  // ── Display handlers dropdown ──

  openDisplayHandlerDropdown(displayId: string, event: Event): void {
    event.stopPropagation();
    if (this.activeDisplayHandlerDropdown === displayId) {
      this.activeDisplayHandlerDropdown = null;
      return;
    }
    this.activeHandlerDropdown = null;
    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();
    this.dropdownTop = rect.bottom + 2;
    this.dropdownLeft = rect.left;
    this.dropdownWidth = rect.width;
    this.activeDisplayHandlerDropdown = displayId;
    this.handlerDropdownSearch = '';
  }

  toggleDisplayHandler(display: ArrivalsDisplay, handlerId: number): void {
    const idx = display.handlerIds.indexOf(handlerId);
    if (idx >= 0) {
      display.handlerIds.splice(idx, 1);
    } else {
      display.handlerIds.push(handlerId);
    }
    this.hasUnsavedChanges = true;
  }

  isHandlerOnOtherDisplay(arrivals: ArrivalsDevice, currentDisplayId: string, handlerId: number): string | null {
    const other = arrivals.displays.find(d => d.id !== currentDisplayId && d.handlerIds.includes(handlerId));
    return other ? other.name : null;
  }

  // ── Handler helpers ──

  getHandlerName(id: number): string {
    return this.allHandlers.find(h => h.id === id)?.name || '—';
  }

  getHandlerBadgeClass(h: SoundEventHandler): string {
    if (h.voiceType !== 'generation') return 'badge-standard';
    if (h.generationStatus === 'done') return 'badge-voice';
    return 'badge-fallback';
  }

  getHandlerBadgeText(h: SoundEventHandler): string {
    if (h.voiceType !== 'generation') return 'Стандарт';
    if (h.generationStatus === 'done') return 'Голос';
    return 'Делень';
  }

  getHandlerDotClass(handlerId: number): string {
    const h = this.allHandlers.find(hh => hh.id === handlerId);
    if (!h || h.voiceType !== 'generation') return 'dot-standard';
    if (h.generationStatus === 'done') return 'dot-voice';
    return 'dot-fallback';
  }

  // ── Save ──

  save(): void {
    // Simulate save
    const success = Math.random() > 0.15; // 85% success
    if (success) {
      this.storage.save('web-screens', 'sound-terminal-groups', this.groups);
      this.storage.save('web-screens', 'arrivals-devices', this.arrivalsDevices);
      this.saveSuccess = true;
      this.saveError = false;
      this.hasUnsavedChanges = false;
    } else {
      this.saveSuccess = false;
      this.saveError = true;
    }
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = false;
    }, 3000);
  }
}
