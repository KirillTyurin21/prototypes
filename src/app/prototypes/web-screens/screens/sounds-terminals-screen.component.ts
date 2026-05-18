import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { SoundTerminalGroup, SoundTerminal } from '../types';
import {
  MOCK_SOUND_TERMINAL_GROUPS,
  MOCK_SOUND_EVENT_HANDLERS,
  AUDIO_DEVICES,
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
            <button class="app-btn app-btn-primary" (click)="save()">СОХРАНИТЬ</button>
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
          <input
            type="text"
            class="search-input"
            [(ngModel)]="searchRestaurant"
            placeholder="Поиск по ресторану"
          />
        </div>
        <div class="search-field">
          <lucide-icon name="search" [size]="16" class="search-icon"></lucide-icon>
          <input
            type="text"
            class="search-input"
            [(ngModel)]="searchTerminal"
            placeholder="Поиск по терминалу"
          />
        </div>
      </div>

      <!-- Restaurant groups -->
      <div class="groups-list">
        <div
          class="group-card"
          *ngFor="let group of filteredGroups"
        >
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
                <tr *ngFor="let t of getFilteredTerminals(group)">
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
                        <input
                          type="text"
                          class="dropdown-search-input"
                          [(ngModel)]="handlerDropdownSearch"
                          placeholder="Поиск..."
                          (click)="$event.stopPropagation()"
                        />
                      </div>
                      <label
                        class="dropdown-option"
                        *ngFor="let h of getFilteredHandlers()"
                        (click)="$event.stopPropagation()"
                      >
                        <input
                          type="checkbox"
                          [checked]="t.handlerIds.includes(h.id)"
                          (change)="toggleTerminalHandler(t, h.id)"
                        />
                        <span>{{ h.name }}</span>
                        <span class="handler-badge" [ngClass]="getHandlerBadgeClass(h)">{{ getHandlerBadgeText(h) }}</span>
                      </label>
                    </div>
                  </td>
                  <td class="col-audio">
                    <select
                      class="audio-select"
                      [(ngModel)]="t.audioDevice"
                    >
                      <option *ngFor="let dev of audioDevices" [value]="dev">{{ dev }}</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .terminals-screen {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Page header */
    .page-header { margin-bottom: 20px; }
    .page-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-title {
      font-size: 24px;
      font-weight: 500;
      color: var(--dt-text-primary);
      margin: 0;
      font-family: Roboto, sans-serif;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Buttons */
    .app-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 16px;
      height: 36px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      font-family: Roboto, sans-serif;
      white-space: nowrap;
    }
    .app-btn-primary { background: var(--dt-brand-accent); color: var(--dt-text-inversive); }
    .app-btn-primary:hover { background: var(--dt-brand-accent-dark); }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--dt-text-disable);
      cursor: pointer;
    }
    .icon-btn:hover { background: var(--dt-surface-hover); }

    /* Search row */
    .search-row {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    .search-field {
      position: relative;
      flex: 1;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--dt-text-disable);
    }
    .search-input {
      width: 100%;
      height: 40px;
      padding: 0 12px 0 36px;
      border: 1px solid var(--dt-text-disable);
      border-radius: 4px;
      font-size: 14px;
      font-family: Roboto, sans-serif;
      color: var(--dt-text-primary);
      box-sizing: border-box;
      outline: none;
    }
    .search-input:focus { border-color: var(--dt-brand-accent); }

    /* Groups */
    .groups-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .group-card {
      background: var(--dt-surface-primary);
      border-radius: 4px;
      border: 1px solid var(--dt-stroke-default);
    }
    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .group-header:hover { background: var(--dt-surface-hover); }
    .group-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chevron { color: var(--dt-text-secondary); }
    .group-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
    }
    .group-terminal-count {
      font-size: 13px;
      color: var(--dt-text-disable);
    }

    /* Terminals table */
    .terminals-table-wrap {
      border-top: 1px solid var(--dt-stroke-default);
    }
    .terminals-table {
      width: 100%;
      border-collapse: collapse;
      font-family: Roboto, sans-serif;
      font-size: 14px;
    }
    .terminals-table thead th {
      text-align: left;
      padding: 10px 16px;
      font-weight: 500;
      color: var(--dt-text-secondary);
      font-size: 13px;
      background: var(--dt-surface-variant);
      border-bottom: 1px solid var(--dt-stroke-default);
    }
    .terminals-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--dt-stroke-disable);
      color: var(--dt-text-primary);
      vertical-align: top;
    }
    .col-terminal { width: 35%; }
    .col-handlers { width: 32.5%; position: relative; }
    .col-audio { width: 32.5%; }

    .terminal-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .terminal-name {
      font-weight: 500;
      color: var(--dt-text-primary);
    }
    .terminal-activity {
      font-size: 12px;
      color: var(--dt-text-disable);
    }

    /* Dropdown */
    .dropdown-wrap {
      cursor: pointer;
    }
    .dropdown-display {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border: 1px solid var(--dt-text-disable);
      border-radius: 4px;
      min-height: 36px;
      background: var(--dt-surface-primary);
    }
    .dropdown-text {
      font-size: 13px;
      color: var(--dt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .dropdown-panel {
      position: fixed;
      background: var(--dt-surface-primary);
      border: 1px solid var(--dt-stroke-default);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      z-index: 1000;
      max-height: 240px;
      overflow-y: auto;
    }
    .dropdown-search {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--dt-stroke-default);
      color: var(--dt-text-disable);
    }
    .dropdown-search-input {
      border: none;
      outline: none;
      font-size: 13px;
      font-family: Roboto, sans-serif;
      flex: 1;
      color: var(--dt-text-primary);
    }
    .dropdown-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
      color: var(--dt-text-primary);
    }
    .dropdown-option:hover { background: var(--dt-surface-hover); }
    .dropdown-option input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--dt-brand-accent);
      cursor: pointer;
    }

    /* Audio select */
    .audio-select {
      width: 100%;
      height: 36px;
      padding: 0 8px;
      border: 1px solid var(--dt-text-disable);
      border-radius: 4px;
      font-size: 13px;
      font-family: Roboto, sans-serif;
      color: var(--dt-text-primary);
      background: var(--dt-surface-primary);
      outline: none;
      cursor: pointer;
    }
    .audio-select:focus { border-color: var(--dt-brand-accent); }

    /* Handler badges */
    .handler-badge {
      margin-left: auto;
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
    }
    .badge-voice { background: #e8f5e9; color: #2e7d32; }
    .badge-fallback { background: #fff3e0; color: #e65100; }
    .badge-standard { background: var(--dt-surface-hover); color: var(--dt-text-secondary); }

    .dropdown-text-with-badges {
      font-size: 13px;
      color: var(--dt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    .handler-tag { white-space: nowrap; }
    .handler-tag-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 3px;
      vertical-align: middle;
    }
    .dot-voice { background: #4caf50; }
    .dot-fallback { background: #ff9800; }
    .dot-standard { background: #bdbdbd; }
  `],
})
export class SoundsTerminalsScreenComponent implements OnInit {
  private storage = inject(StorageService);

  groups: SoundTerminalGroup[] = [];
  allHandlers: SoundEventHandler[] = [];
  audioDevices = AUDIO_DEVICES;
  expandedGroups = new Set<number>();

  searchRestaurant = '';
  searchTerminal = '';

  activeHandlerDropdown: number | null = null;
  handlerDropdownSearch = '';
  dropdownTop = 0;
  dropdownLeft = 0;
  dropdownWidth = 300;

  private clickListener = (e: Event) => {
    this.activeHandlerDropdown = null;
  };

  ngOnInit(): void {
    this.groups = this.storage.load('web-screens', 'sound-terminal-groups', JSON.parse(JSON.stringify(MOCK_SOUND_TERMINAL_GROUPS)));
    this.allHandlers = this.storage.load('web-screens', 'sound-handlers', [...MOCK_SOUND_EVENT_HANDLERS]);
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
  }

  // ── Groups ──

  get filteredGroups(): SoundTerminalGroup[] {
    let result = this.groups;
    if (this.searchRestaurant.trim()) {
      const q = this.searchRestaurant.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(q));
    }
    if (this.searchTerminal.trim()) {
      const q = this.searchTerminal.toLowerCase();
      result = result.filter(g =>
        g.terminals.some(t => t.name.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getFilteredTerminals(group: SoundTerminalGroup): SoundTerminal[] {
    if (!this.searchTerminal.trim()) return group.terminals;
    const q = this.searchTerminal.toLowerCase();
    return group.terminals.filter(t => t.name.toLowerCase().includes(q));
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

  // ── Handlers dropdown ──

  openHandlerDropdown(terminalId: number, event: Event): void {
    event.stopPropagation();
    if (this.activeHandlerDropdown === terminalId) {
      this.activeHandlerDropdown = null;
      return;
    }
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
  }

  getHandlerNames(handlerIds: number[]): string {
    if (handlerIds.length === 0) return 'Не выбрано';
    const names = handlerIds
      .map(id => this.allHandlers.find(h => h.id === id))
      .filter(Boolean)
      .map(h => h!.name);
    return names.join(', ') || 'Не выбрано';
  }

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
    this.storage.save('web-screens', 'sound-terminal-groups', this.groups);
  }
}
