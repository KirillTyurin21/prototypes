import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import {
  SoundTerminalGroup,
  SoundEventHandler,
  SoundTerminalGroupV2,
  SoundTerminalV2,
} from '../types';
import {
  MOCK_SOUND_EVENT_HANDLERS,
  MOCK_LEGACY_AUDIO_DEVICES,
  MOCK_PHYSICAL_AUDIO_DEVICES,
  MOCK_RMS_DISPLAYS,
  MOCK_SOUND_TERMINAL_GROUPS_LEGACY,
  MOCK_SOUND_TERMINAL_GROUPS_V2,
  getHandlerDisplayName,
} from '../data/mock-data';
import { EnterpriseTreeComponent } from '../components/sounds/enterprise-tree.component';
import { TerminalSettingsPanelComponent } from '../components/sounds/terminal-settings-panel.component';
import { HandlerPickerModalComponent } from '../components/sounds/handler-picker-modal.component';

/**
 * «Настройка терминалов (новая)» — переделка экрана звуков.
 * Вариант A «Было» — реплика стенда; Вариант B «Дерево + панель» — компоновка Яндекс.Пэй.
 */
@Component({
  selector: 'app-sounds-terminals-v2-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    EnterpriseTreeComponent,
    TerminalSettingsPanelComponent,
    HandlerPickerModalComponent,
  ],
  template: `
    <div class="dv2">
      <!-- Сохранение: обратная связь -->
      <div
        class="dv2-feedback"
        [class.dv2-feedback--success]="saveSuccess"
        [class.dv2-feedback--error]="saveError"
        *ngIf="saveSuccess || saveError"
      >
        <lucide-icon [name]="saveSuccess ? 'check-circle-2' : 'alert-circle'" [size]="16"></lucide-icon>
        <span>{{ feedbackText }}</span>
      </div>

      <!-- Заголовок -->
      <div class="dv2-header">
        <h1 class="dv2-title">Настройка терминалов</h1>
        <div class="dv2-header-actions">
          <button class="dv2-save" [class.dv2-save--active]="hasUnsavedChanges" (click)="save()">СОХРАНИТЬ</button>
          <button class="dv2-info" title="Информация" aria-label="Информация">
            <lucide-icon name="info" [size]="20"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Переключатель вариантов -->
      <div class="dv2-switcher">
        <span class="dv2-switcher-label">Вариант дизайна:</span>
        <div class="dv2-switcher-segments" role="tablist">
          <button
            type="button"
            class="dv2-switcher-btn"
            [class.dv2-switcher-btn--active]="activeVariant === 'A'"
            (click)="switchVariant('A')"
            role="tab"
            [attr.aria-selected]="activeVariant === 'A'"
          >
            <lucide-icon name="layout-list" [size]="14"></lucide-icon>
            A: Было
          </button>
          <button
            type="button"
            class="dv2-switcher-btn"
            [class.dv2-switcher-btn--active]="activeVariant === 'B'"
            (click)="switchVariant('B')"
            role="tab"
            [attr.aria-selected]="activeVariant === 'B'"
          >
            <lucide-icon name="panel-right" [size]="14"></lucide-icon>
            B: Дерево + панель
          </button>
        </div>
      </div>

      <!-- Загрузка -->
      <div class="dv2-loading" *ngIf="isLoading" aria-label="Загрузка">
        <div class="dv2-skeleton dv2-skeleton--title"></div>
        <div class="dv2-skeleton-row">
          <div class="dv2-skeleton dv2-skeleton--tree"></div>
          <div class="dv2-skeleton dv2-skeleton--panel"></div>
        </div>
      </div>

      <ng-container *ngIf="!isLoading">
        <!-- ═══ ВАРИАНТ A «Было» — реплика стенда ═══ -->
        <div class="dv2-a" *ngIf="activeVariant === 'A'">
          <div class="dv2-a-search">
            <div class="dv2-a-search-field">
              <lucide-icon name="search" [size]="15"></lucide-icon>
              <input type="text" [(ngModel)]="searchLegacyRestaurant" placeholder="Поиск по ресторану" />
            </div>
            <div class="dv2-a-search-field">
              <lucide-icon name="search" [size]="15"></lucide-icon>
              <input type="text" [(ngModel)]="searchLegacyTerminal" placeholder="Поиск по терминалу" />
            </div>
          </div>

          <div class="dv2-a-empty" *ngIf="filteredLegacyGroups.length === 0">
            <lucide-icon name="search" [size]="28"></lucide-icon>
            <span>Нет ресторанов, соответствующих фильтру</span>
          </div>

          <div class="dv2-a-groups">
            <div class="dv2-a-group" *ngFor="let g of filteredLegacyGroups">
              <button type="button" class="dv2-a-group-head" (click)="toggleGroupA(g.id)" [attr.aria-expanded]="isGroupExpandedA(g.id)">
                <lucide-icon [name]="isGroupExpandedA(g.id) ? 'chevron-down' : 'chevron-right'" [size]="18" class="dv2-a-chevron"></lucide-icon>
                <span class="dv2-a-group-name">{{ g.name }} ({{ g.terminalCount }})</span>
                <span class="dv2-a-group-count">{{ g.terminals.length }} {{ terminalWord(g.terminals.length) }}</span>
              </button>

              <div class="dv2-a-table-wrap" *ngIf="isGroupExpandedA(g.id)">
                <table class="dv2-a-table">
                  <thead>
                    <tr>
                      <th class="dv2-a-th-term">Терминал</th>
                      <th class="dv2-a-th-handlers">Обработчики</th>
                      <th class="dv2-a-th-audio">Аудиоустройство</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="dv2-a-row" *ngFor="let t of filteredLegacyTerminals(g)">
                      <td class="dv2-a-term">
                        <div class="dv2-a-term-main">
                          <span class="dv2-a-term-name">{{ t.name }}</span>
                          <span class="dv2-a-term-activity">Последняя активность: {{ t.lastActivity }}</span>
                        </div>
                      </td>
                      <td class="dv2-a-handlers">
                        <div class="dv2-a-dropdown" (click)="openHandlerDropdown(t.id, $event)">
                          <span class="dv2-a-dropdown-value" [class.dv2-a-dropdown-value--empty]="t.handlerIds.length === 0">
                            {{ handlerSummary(t) }}
                          </span>
                          <button
                            type="button"
                            class="dv2-a-dropdown-clear"
                            *ngIf="t.handlerIds.length > 0"
                            (click)="clearLegacyHandlers(t, $event)"
                            aria-label="Очистить обработчики"
                            title="Очистить"
                          >
                            <lucide-icon name="x" [size]="13"></lucide-icon>
                          </button>
                          <lucide-icon name="chevron-down" [size]="16" class="dv2-a-dropdown-chevron"></lucide-icon>
                        </div>
                        <div
                          class="dv2-a-dd-panel"
                          *ngIf="activeHandlerDropdown === t.id"
                          [style.top.px]="dropdownTop"
                          [style.left.px]="dropdownLeft"
                          [style.width.px]="dropdownWidth"
                        >
                          <div class="dv2-a-dd-search">
                            <lucide-icon name="search" [size]="13"></lucide-icon>
                            <input type="text" [(ngModel)]="handlerDropdownSearch" placeholder="Поиск..." (click)="$event.stopPropagation()" />
                          </div>
                          <button type="button" class="dv2-a-dd-all" (click)="$event.stopPropagation(); toggleAllHandlersA(t)">Все</button>
                          <label class="dv2-a-dd-item" *ngFor="let h of filteredHandlersA()" (click)="$event.stopPropagation()">
                            <input type="checkbox" [checked]="t.handlerIds.includes(h.id)" (change)="toggleLegacyHandler(t, h.id)" />
                            <span class="dv2-a-dd-name">{{ displayName(h.name) }}</span>
                          </label>
                        </div>
                      </td>
                      <td class="dv2-a-audio">
                        <select [(ngModel)]="t.audioDevice" (ngModelChange)="markUnsaved()">
                          <option *ngFor="let d of legacyAudioDevices" [value]="d">{{ d }}</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="dv2-a-group-empty" *ngIf="filteredLegacyTerminals(g).length === 0">
                  Нет терминалов, соответствующих фильтру
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ ВАРИАНТ B «Дерево + панель» — компоновка Яндекс.Пэй ═══ -->
        <div class="dv2-b" *ngIf="activeVariant === 'B'">
          <div class="dv2-b-search">
            <lucide-icon name="search" [size]="15"></lucide-icon>
            <input type="text" [(ngModel)]="searchV2" placeholder="Поиск по ресторанам / терминалам" />
          </div>

          <div class="dv2-b-split">
            <div class="dv2-b-tree">
              <app-enterprise-tree
                [groups]="v2Groups"
                [selectedId]="selectedTerminalId"
                [checkedIds]="checkedIds"
                [searchTerm]="searchV2"
                (select)="onSelectTerminal($event)"
                (toggleCheck)="onToggleCheck($event)"
                (toggleGroupCheck)="onToggleGroupCheck($event)"
                (apply)="massPickerOpen = true"
              ></app-enterprise-tree>
            </div>
            <div class="dv2-b-panel">
              <app-terminal-settings-panel
                [terminal]="selectedTerminal"
                [handlers]="allHandlers"
                [physicalOptions]="physicalAudioDevices"
                [displayOptions]="selectedDisplayOptions"
                [displaysLoading]="displaysLoading"
                [displaysError]="displaysError"
                (save)="onPanelSave($event)"
                (reset)="onPanelReset()"
                (refreshDisplays)="onRefreshDisplays()"
                (changed)="markUnsaved()"
              ></app-terminal-settings-panel>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Массовое применение обработчиков -->
      <app-handler-picker-modal
        [open]="massPickerOpen"
        title="Применить обработчики"
        [subtitle]="'К выбранным терминалам (' + checkedIds.size + ')'"
        [handlers]="allHandlers"
        [selectedIds]="[]"
        confirmLabel="Применить"
        (close)="massPickerOpen = false"
        (confirm)="onMassApply($event)"
      ></app-handler-picker-modal>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dv2 {
      animation: dv2-fade 0.2s ease-out;
      font-family: Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    @keyframes dv2-fade {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Feedback ── */
    .dv2-feedback {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 13.5px;
      animation: dv2-fade 0.2s ease-out;
    }
    .dv2-feedback--success { background: var(--dt-brand-positive-lighter); color: var(--dt-brand-positive-darker); }
    .dv2-feedback--error { background: var(--dt-brand-negative-lighter); color: var(--dt-brand-negative-darker); }

    /* ── Header ── */
    .dv2-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .dv2-title { margin: 0; font-size: 22px; font-weight: 500; color: var(--dt-text-primary); }
    .dv2-header-actions { display: flex; align-items: center; gap: 8px; }
    .dv2-save {
      padding: 0 16px;
      height: 36px;
      border: none;
      border-radius: 4px;
      background: var(--dt-brand-accent);
      color: #fff;
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      letter-spacing: 0.2px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .dv2-save:hover { background: #3969d5; }
    .dv2-save--active { background: var(--dt-brand-warning-dark); }
    .dv2-save--active:hover { background: var(--dt-brand-warning-darker); }
    .dv2-info {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-disable);
      cursor: pointer;
    }
    .dv2-info:hover { background: #ebebeb; color: var(--dt-text-primary); }

    /* ── Variant switcher ── */
    .dv2-switcher { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .dv2-switcher-label { font-size: 13px; color: var(--dt-text-secondary); }
    .dv2-switcher-segments {
      display: inline-flex;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      overflow: hidden;
      background: var(--dt-surface-primary);
    }
    .dv2-switcher-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border: none;
      border-right: 1px solid #d6d6d6;
      background: none;
      color: var(--dt-text-secondary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .dv2-switcher-btn:last-child { border-right: none; }
    .dv2-switcher-btn:hover { background: #ebebeb; color: var(--dt-text-primary); }
    .dv2-switcher-btn--active { background: var(--dt-brand-accent); color: #fff; }
    .dv2-switcher-btn--active:hover { background: #3969d5; color: #fff; }

    /* ── Loading ── */
    .dv2-loading { display: flex; flex-direction: column; gap: 14px; }
    .dv2-skeleton-row { display: flex; gap: 14px; flex: 1; min-height: 380px; }
    .dv2-skeleton {
      border-radius: 4px;
      background: linear-gradient(90deg, var(--dt-surface-variant) 25%, #eef1f6 50%, var(--dt-surface-variant) 75%);
      background-size: 200% 100%;
      animation: dv2-pulse 1.2s ease-in-out infinite;
    }
    @keyframes dv2-pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .dv2-skeleton--title { height: 38px; width: 240px; }
    .dv2-skeleton--tree { flex: 0 0 300px; }
    .dv2-skeleton--panel { flex: 1; }

    /* ═══ VARIANT A ═══ */
    .dv2-a-search { display: flex; gap: 14px; margin-bottom: 14px; }
    .dv2-a-search-field {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      max-width: 340px;
      height: 36px;
      padding: 0 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-disable);
    }
    .dv2-a-search-field:focus-within { border-color: var(--dt-brand-accent); }
    .dv2-a-search-field input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      color: var(--dt-text-primary);
      background: none;
    }

    .dv2-a-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 40px 0;
      color: var(--dt-text-disable);
      font-size: 14px;
    }

    .dv2-a-groups { display: flex; flex-direction: column; gap: 10px; }
    .dv2-a-group {
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      overflow: hidden;
    }
    .dv2-a-group-head {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 11px 14px;
      border: none;
      background: none;
      cursor: pointer;
      font-family: Roboto, sans-serif;
      text-align: left;
      transition: background 0.12s ease;
    }
    .dv2-a-group-head:hover { background: #ebebeb; }
    .dv2-a-chevron { color: var(--dt-text-secondary); flex-shrink: 0; }
    .dv2-a-group-name { flex: 1; min-width: 0; font-size: 14px; font-weight: 500; color: var(--dt-text-primary); }
    .dv2-a-group-count { font-size: 12.5px; color: var(--dt-text-disable); }

    .dv2-a-table-wrap { border-top: 1px solid #d6d6d6; }
    .dv2-a-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .dv2-a-table th {
      text-align: left;
      padding: 9px 14px;
      font-weight: 500;
      font-size: 12.5px;
      color: var(--dt-text-secondary);
      background: #f0f5ff;
      border-bottom: 1px solid #d6d6d6;
    }
    .dv2-a-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #d6d6d6;
      color: var(--dt-text-primary);
      vertical-align: middle;
    }
    .dv2-a-row:last-child td { border-bottom: none; }
    .dv2-a-th-term { width: 34%; }
    .dv2-a-th-handlers { width: 38%; }
    .dv2-a-th-audio { width: 28%; }

    .dv2-a-term-main { display: flex; flex-direction: column; gap: 2px; }
    .dv2-a-term-name { font-weight: 500; }
    .dv2-a-term-activity { font-size: 12px; color: var(--dt-text-disable); }

    .dv2-a-handlers { position: relative; }
    .dv2-a-dropdown {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-height: 32px;
      padding: 6px 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      cursor: pointer;
      transition: border-color 0.15s ease;
    }
    .dv2-a-dropdown:hover { border-color: var(--dt-text-disable); }
    .dv2-a-dropdown-value {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      color: var(--dt-text-primary);
    }
    .dv2-a-dropdown-value--empty { color: var(--dt-text-disable); }
    .dv2-a-dropdown-chevron { color: var(--dt-text-disable); flex-shrink: 0; }
    .dv2-a-dropdown-clear {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-disable);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .dv2-a-dropdown-clear:hover { background: #ebebeb; color: var(--dt-text-primary); }

    .dv2-a-dd-panel {
      position: fixed;
      z-index: 900;
      max-height: 260px;
      overflow-y: auto;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      box-shadow: 0 4px 16px 4px rgba(224, 224, 224, 0.7);
      animation: dv2-fade 0.14s ease-out;
    }
    .dv2-a-dd-search {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 10px;
      padding: 0 10px;
      height: 30px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      color: var(--dt-text-disable);
    }
    .dv2-a-dd-search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      font-family: Roboto, sans-serif;
      font-size: 12.5px;
      color: var(--dt-text-primary);
      background: none;
    }
    .dv2-a-dd-all {
      margin: 0 10px 6px;
      padding: 2px 6px;
      border: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: var(--dt-brand-accent);
      cursor: pointer;
    }
    .dv2-a-dd-all:hover { text-decoration: underline; }
    .dv2-a-dd-item {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 7px 12px;
      cursor: pointer;
      font-size: 13px;
      color: var(--dt-text-primary);
    }
    .dv2-a-dd-item:hover { background: #ebebeb; }
    .dv2-a-dd-item input { width: 15px; height: 15px; margin: 0; accent-color: var(--dt-brand-accent); cursor: pointer; }
    .dv2-a-dd-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .dv2-a-audio select {
      width: 100%;
      height: 32px;
      padding: 0 8px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      color: var(--dt-text-primary);
      outline: none;
      cursor: pointer;
    }
    .dv2-a-audio select:focus { border-color: var(--dt-brand-accent); }

    .dv2-a-group-empty { padding: 14px; font-size: 13px; color: var(--dt-text-disable); text-align: center; }

    /* ═══ VARIANT B ═══ */
    .dv2-b { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .dv2-b-search {
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 420px;
      height: 36px;
      margin-bottom: 12px;
      padding: 0 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-disable);
    }
    .dv2-b-search:focus-within { border-color: var(--dt-brand-accent); }
    .dv2-b-search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      color: var(--dt-text-primary);
      background: none;
    }

    .dv2-b-split {
      display: flex;
      flex: 1;
      min-height: 480px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      overflow: hidden;
    }
    .dv2-b-tree {
      flex: 0 0 320px;
      max-width: 320px;
      border-right: 1px solid #d6d6d6;
      background: #f8f9fc;
      overflow-y: auto;
    }
    .dv2-b-panel { flex: 1; min-width: 0; overflow: hidden; }
  `],
})
export class SoundsTerminalsV2ScreenComponent implements OnInit, OnDestroy {
  private storage = inject(StorageService);

  activeVariant: 'A' | 'B' = 'A';

  // ── Вариант A (легаси-модель стенда) ──
  legacyGroups: SoundTerminalGroup[] = [];
  legacyAudioDevices: string[] = MOCK_LEGACY_AUDIO_DEVICES;
  searchLegacyRestaurant = '';
  searchLegacyTerminal = '';
  expandedGroupsA = new Set<number>();
  activeHandlerDropdown: number | null = null;
  handlerDropdownSearch = '';
  dropdownTop = 0;
  dropdownLeft = 0;
  dropdownWidth = 300;

  // ── Вариант B (новая модель) ──
  v2Groups: SoundTerminalGroupV2[] = [];
  physicalAudioDevices: string[] = MOCK_PHYSICAL_AUDIO_DEVICES;
  allHandlers: SoundEventHandler[] = [];
  selectedTerminalId: number | null = null;
  checkedIds = new Set<number>();
  searchV2 = '';
  displaysLoading = false;
  displaysError = false;
  massPickerOpen = false;

  // ── Общее ──
  isLoading = true;
  hasUnsavedChanges = false;
  saveSuccess = false;
  saveError = false;
  feedbackText = '';
  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  private displayTimer: ReturnType<typeof setTimeout> | null = null;
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  private clickListener = () => {
    this.activeHandlerDropdown = null;
  };

  ngOnInit(): void {
    this.legacyGroups = this.storage.load(
      'web-screens',
      'sounds-terminals-v2-legacy',
      JSON.parse(JSON.stringify(MOCK_SOUND_TERMINAL_GROUPS_LEGACY))
    );
    this.v2Groups = this.storage.load(
      'web-screens',
      'sounds-terminals-v2-devices',
      JSON.parse(JSON.stringify(MOCK_SOUND_TERMINAL_GROUPS_V2))
    );
    this.allHandlers = this.storage.load('web-screens', 'sound-handlers', [...MOCK_SOUND_EVENT_HANDLERS]);

    if (this.legacyGroups.length > 0) {
      this.expandedGroupsA.add(this.legacyGroups[0].id);
    }

    document.addEventListener('click', this.clickListener);
    this.loadTimer = setTimeout(() => {
      this.isLoading = false;
    }, 550);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    if (this.displayTimer) clearTimeout(this.displayTimer);
    if (this.loadTimer) clearTimeout(this.loadTimer);
  }

  // ── Общее ──

  switchVariant(variant: 'A' | 'B'): void {
    this.activeVariant = variant;
    this.activeHandlerDropdown = null;
  }

  markUnsaved(): void {
    this.hasUnsavedChanges = true;
  }

  save(): void {
    const fail = this.activeVariant === 'B' && this.selectedGroupId === 3;
    if (fail) {
      this.showFeedback(false, 'Не удалось сохранить настройки. RMS ресторана офлайн — проверьте подключение и попробуйте снова.');
      return;
    }
    this.persist();
    this.hasUnsavedChanges = false;
    this.showFeedback(true, 'Настройки сохранены');
  }

  onPanelSave(updated: SoundTerminalV2): void {
    const fail = this.selectedGroupId === 3;
    if (fail) {
      this.showFeedback(false, 'Не удалось сохранить настройки. RMS ресторана офлайн — проверьте подключение и попробуйте снова.');
      return;
    }
    for (const g of this.v2Groups) {
      const idx = g.terminals.findIndex(t => t.id === updated.id);
      if (idx >= 0) {
        g.terminals[idx] = updated;
        break;
      }
    }
    this.persist();
    this.hasUnsavedChanges = false;
    this.showFeedback(true, 'Настройки сохранены');
  }

  onPanelReset(): void {
    this.v2Groups = JSON.parse(JSON.stringify(MOCK_SOUND_TERMINAL_GROUPS_V2));
    this.persist();
    this.selectedTerminalId = null;
    this.checkedIds = new Set();
    this.displaysLoading = false;
    this.displaysError = false;
    this.hasUnsavedChanges = false;
    this.showFeedback(true, 'Настройки сброшены');
  }

  private persist(): void {
    this.storage.save('web-screens', 'sounds-terminals-v2-legacy', this.legacyGroups);
    this.storage.save('web-screens', 'sounds-terminals-v2-devices', this.v2Groups);
  }

  private showFeedback(success: boolean, text: string): void {
    this.saveSuccess = success;
    this.saveError = !success;
    this.feedbackText = text;
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.saveSuccess = false;
      this.saveError = false;
    }, 3200);
  }

  displayName(name: string): string {
    return getHandlerDisplayName(name);
  }

  terminalWord(count: number): string {
    if (count === 1) return 'терминал';
    if (count >= 2 && count <= 4) return 'терминала';
    return 'терминалов';
  }

  // ── Вариант A ──

  get filteredLegacyGroups(): SoundTerminalGroup[] {
    let result = this.legacyGroups;
    const qr = this.searchLegacyRestaurant.trim().toLowerCase();
    const qt = this.searchLegacyTerminal.trim().toLowerCase();
    if (qr) {
      result = result.filter(g => g.name.toLowerCase().includes(qr));
    }
    if (qt) {
      result = result.filter(g => g.terminals.some(t => t.name.toLowerCase().includes(qt)));
    }
    return result;
  }

  filteredLegacyTerminals(group: SoundTerminalGroup): SoundTerminalGroup['terminals'] {
    const q = this.searchLegacyTerminal.trim().toLowerCase();
    if (!q) return group.terminals;
    return group.terminals.filter(t => t.name.toLowerCase().includes(q));
  }

  toggleGroupA(id: number): void {
    if (this.expandedGroupsA.has(id)) {
      this.expandedGroupsA.delete(id);
    } else {
      this.expandedGroupsA.add(id);
    }
  }

  isGroupExpandedA(id: number): boolean {
    return this.expandedGroupsA.has(id);
  }

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

  filteredHandlersA(): SoundEventHandler[] {
    const q = this.handlerDropdownSearch.trim().toLowerCase();
    if (!q) return this.allHandlers;
    return this.allHandlers.filter(h => h.name.toLowerCase().includes(q));
  }

  toggleLegacyHandler(terminal: SoundTerminalGroup['terminals'][number], handlerId: number): void {
    const idx = terminal.handlerIds.indexOf(handlerId);
    if (idx >= 0) {
      terminal.handlerIds.splice(idx, 1);
    } else {
      terminal.handlerIds.push(handlerId);
    }
    this.markUnsaved();
  }

  clearLegacyHandlers(terminal: SoundTerminalGroup['terminals'][number], event: Event): void {
    event.stopPropagation();
    terminal.handlerIds = [];
    this.activeHandlerDropdown = null;
    this.markUnsaved();
  }

  toggleAllHandlersA(terminal: SoundTerminalGroup['terminals'][number]): void {
    const filtered = this.filteredHandlersA();
    const allSelected = filtered.length > 0 && filtered.every(h => terminal.handlerIds.includes(h.id));
    if (allSelected) {
      terminal.handlerIds = terminal.handlerIds.filter(id => !filtered.some(h => h.id === id));
    } else {
      for (const h of filtered) {
        if (!terminal.handlerIds.includes(h.id)) {
          terminal.handlerIds.push(h.id);
        }
      }
    }
    this.markUnsaved();
  }

  handlerSummary(terminal: SoundTerminalGroup['terminals'][number]): string {
    if (terminal.handlerIds.length === 0) return 'Выбрать';
    const first = terminal.handlerIds
      .map(id => this.allHandlers.find(h => h.id === id))
      .find(h => h !== undefined);
    const firstName = first ? this.displayName(first.name) : '';
    const rest = terminal.handlerIds.length - 1;
    if (rest === 0) return firstName;
    if (rest === 1) return `${firstName} (+ 1 другая)`;
    if (rest >= 2 && rest <= 4) return `${firstName} (+ ${rest} другие)`;
    return `${firstName} (+ ${rest} других)`;
  }

  // ── Вариант B ──

  get selectedTerminal(): SoundTerminalV2 | null {
    if (this.selectedTerminalId === null) return null;
    for (const g of this.v2Groups) {
      const t = g.terminals.find(x => x.id === this.selectedTerminalId);
      if (t) return t;
    }
    return null;
  }

  get selectedGroupId(): number | null {
    if (this.selectedTerminalId === null) return null;
    for (const g of this.v2Groups) {
      if (g.terminals.some(t => t.id === this.selectedTerminalId)) {
        return g.id;
      }
    }
    return null;
  }

  get selectedDisplayOptions() {
    const groupId = this.selectedGroupId;
    if (groupId === null) return [];
    return MOCK_RMS_DISPLAYS[groupId] || [];
  }

  onSelectTerminal(id: number): void {
    this.selectedTerminalId = id;
    this.displaysLoading = false;
    this.displaysError = false;
  }

  onToggleCheck(id: number): void {
    const next = new Set(this.checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.checkedIds = next;
  }

  onToggleGroupCheck(groupId: number): void {
    const group = this.v2Groups.find(g => g.id === groupId);
    if (!group) return;
    const allChecked = group.terminals.length > 0 && group.terminals.every(t => this.checkedIds.has(t.id));
    const next = new Set(this.checkedIds);
    for (const t of group.terminals) {
      if (allChecked) {
        next.delete(t.id);
      } else {
        next.add(t.id);
      }
    }
    this.checkedIds = next;
  }

  onRefreshDisplays(): void {
    this.displaysLoading = true;
    this.displaysError = false;
    if (this.displayTimer) clearTimeout(this.displayTimer);
    this.displayTimer = setTimeout(() => {
      this.displaysLoading = false;
      // Демо: у «Кафе "Утренняя звезда"» (группа 3) RMS офлайн — загрузка не удаётся
      this.displaysError = this.selectedGroupId === 3;
    }, 800);
  }

  onMassApply(handlerIds: number[]): void {
    let applied = 0;
    for (const g of this.v2Groups) {
      for (const t of g.terminals) {
        if (!this.checkedIds.has(t.id) || t.devices.length === 0) continue;
        for (const d of t.devices) {
          for (const hid of handlerIds) {
            if (!d.handlerIds.includes(hid)) {
              d.handlerIds.push(hid);
            }
          }
        }
        applied++;
      }
    }
    this.checkedIds = new Set();
    this.massPickerOpen = false;
    if (applied > 0) {
      this.markUnsaved();
      this.showFeedback(true, `Обработчики применены к ${applied} ${this.terminalWord(applied)}`);
    } else {
      this.showFeedback(false, 'Не удалось применить: у выбранных терминалов нет устройств вывода');
    }
  }
}
