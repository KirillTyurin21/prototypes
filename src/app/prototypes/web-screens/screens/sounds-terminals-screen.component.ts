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
                        <span class="dropdown-text">{{ getHandlerNames(t.handlerIds) }}</span>
                        <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
                      </div>
                    </div>
                    <!-- Handler dropdown -->
                    <div class="dropdown-panel" *ngIf="activeHandlerDropdown === t.id">
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
      color: #212121;
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
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: #9e9e9e;
      cursor: pointer;
    }
    .icon-btn:hover { background: #f0f0f0; }

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
      color: #9e9e9e;
    }
    .search-input {
      width: 100%;
      height: 40px;
      padding: 0 12px 0 36px;
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      font-size: 14px;
      font-family: Roboto, sans-serif;
      color: #212121;
      box-sizing: border-box;
      outline: none;
    }
    .search-input:focus { border-color: #448aff; }

    /* Groups */
    .groups-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .group-card {
      background: #fff;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
    }
    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .group-header:hover { background: #f5f5f5; }
    .group-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chevron { color: #757575; }
    .group-name {
      font-size: 15px;
      font-weight: 500;
      color: #212121;
      font-family: Roboto, sans-serif;
    }
    .group-terminal-count {
      font-size: 13px;
      color: #9e9e9e;
    }

    /* Terminals table */
    .terminals-table-wrap {
      border-top: 1px solid #e0e0e0;
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
      color: #757575;
      font-size: 13px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
    }
    .terminals-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #424242;
      vertical-align: top;
    }
    .col-terminal { width: 35%; }
    .col-handlers { width: 35%; position: relative; }
    .col-audio { width: 30%; }

    .terminal-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .terminal-name {
      font-weight: 500;
      color: #212121;
    }
    .terminal-activity {
      font-size: 12px;
      color: #9e9e9e;
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
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      min-height: 36px;
      background: #fff;
    }
    .dropdown-text {
      font-size: 13px;
      color: #424242;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .dropdown-panel {
      position: absolute;
      top: 100%;
      left: 16px;
      right: 16px;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      z-index: 100;
      max-height: 240px;
      overflow-y: auto;
    }
    .dropdown-search {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid #e0e0e0;
      color: #9e9e9e;
    }
    .dropdown-search-input {
      border: none;
      outline: none;
      font-size: 13px;
      font-family: Roboto, sans-serif;
      flex: 1;
      color: #212121;
    }
    .dropdown-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
      color: #424242;
    }
    .dropdown-option:hover { background: #f5f5f5; }
    .dropdown-option input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #448aff;
      cursor: pointer;
    }

    /* Audio select */
    .audio-select {
      width: 100%;
      height: 36px;
      padding: 0 8px;
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      font-size: 13px;
      font-family: Roboto, sans-serif;
      color: #424242;
      background: #fff;
      outline: none;
      cursor: pointer;
    }
    .audio-select:focus { border-color: #448aff; }
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
    this.activeHandlerDropdown = this.activeHandlerDropdown === terminalId ? null : terminalId;
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

  // ── Save ──

  save(): void {
    this.storage.save('web-screens', 'sound-terminal-groups', this.groups);
  }
}
