import { Injectable, inject } from '@angular/core';
import { CSControl, CSTheme, Hint, CSTerminal, Campaign, CSRestaurant, CSTerminalV2, TerminalScreenshot, TerminalTableRow, ThemeOption, CampaignOption, HintOption, TerminalGroupOption } from './cs-types';
import { CS_CONTROLS, CS_THEMES, CS_HINTS, CS_TERMINALS, CS_CAMPAIGNS, CS_RESTAURANTS, THEME_OPTIONS, CAMPAIGN_OPTIONS, HINT_OPTIONS, TERMINAL_GROUP_OPTIONS } from './data/cs-mock-data';
import { StorageService } from '@/shared/storage.service';

/**
 * Сервис общего состояния Customer Screen.
 * Все экраны читают/пишут данные через него — изменения видны между разделами.
 */
@Injectable({ providedIn: 'root' })
export class CsDataService {
  private storage = inject(StorageService);

  controls: CSControl[] = [];
  themes: CSTheme[] = [];
  hints: Hint[] = [];
  terminals: CSTerminal[] = [];
  campaigns: Campaign[] = [];

  // ─── Настройки дисплея V2 ───
  restaurants: CSRestaurant[] = [];
  themeOptions: ThemeOption[] = [];
  campaignOptions: CampaignOption[] = [];
  hintOptions: HintOption[] = [];
  terminalGroupOptions: TerminalGroupOption[] = [];

  private nextControlId = 7;
  private nextThemeId = 4;
  private nextHintId = 6;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const defaultControls = JSON.parse(JSON.stringify(CS_CONTROLS));
    const defaultThemes = JSON.parse(JSON.stringify(CS_THEMES));
    const defaultHints = JSON.parse(JSON.stringify(CS_HINTS));
    const defaultTerminals = JSON.parse(JSON.stringify(CS_TERMINALS));
    const defaultCampaigns = JSON.parse(JSON.stringify(CS_CAMPAIGNS));

    this.controls = this.storage.load('web-screens', 'controls', defaultControls);
    this.themes = this.storage.load('web-screens', 'themes', defaultThemes);
    this.hints = this.storage.load('web-screens', 'hints', defaultHints);
    this.terminals = this.storage.load('web-screens', 'terminals', defaultTerminals);
    this.campaigns = this.storage.load('web-screens', 'campaigns', defaultCampaigns);

    this.nextControlId = this.storage.load('web-screens', 'nextControlId', 7);
    this.nextThemeId = this.storage.load('web-screens', 'nextThemeId', 4);
    this.nextHintId = this.storage.load('web-screens', 'nextHintId', 6);

    // V2 данные
    const defaultRestaurants = JSON.parse(JSON.stringify(CS_RESTAURANTS));
    this.restaurants = this.storage.load('web-screens', 'restaurants', defaultRestaurants);

    // Миграция: добавить terminalGroupIds если отсутствует (DS-862)
    for (const r of this.restaurants) {
      for (const t of r.terminals) {
        if (!t.terminalGroupIds) t.terminalGroupIds = [];
      }
    }

    // Миграция: добавить screens если отсутствует (Multiple Advertise)
    for (const r of this.restaurants) {
      for (const t of r.terminals) {
        if (!t.screens || t.screens.length === 0) {
          t.screens = [{
            id: 1,
            name: 'Основной экран',
            themeId: t.themeId,
            themeName: this.themeOptions.find(o => o.id === t.themeId)?.name ?? '',
            advertisePanels: t.campaignIds.length > 0
              ? t.campaignIds.map((cid, idx) => ({
                  id: idx + 1,
                  name: 'Advertise панель ' + (idx + 1),
                  campaignIds: [cid],
                  campaignNames: [this.campaignOptions.find(o => o.id === cid)?.name ?? ''],
                }))
              : [],
          }];
        }
      }
    }

    // Миграция: campaignId → campaignIds (мультивыбор кампаний, 2026-07-15)
    for (const r of this.restaurants) {
      for (const t of r.terminals) {
        for (const s of (t.screens ?? [])) {
          for (const p of s.advertisePanels) {
            if ((p as any).campaignId !== undefined && !p.campaignIds) {
              const oldId = (p as any).campaignId;
              const oldName = (p as any).campaignName;
              p.campaignIds = oldId != null ? [oldId] : [];
              p.campaignNames = oldName ? [oldName] : [];
              delete (p as any).campaignId;
              delete (p as any).campaignName;
            }
          }
        }
      }
    }

    this.themeOptions = THEME_OPTIONS;
    this.campaignOptions = CAMPAIGN_OPTIONS;
    this.hintOptions = HINT_OPTIONS;
    this.terminalGroupOptions = TERMINAL_GROUP_OPTIONS;
  }

  private persist(): void {
    this.storage.save('web-screens', 'controls', this.controls);
    this.storage.save('web-screens', 'themes', this.themes);
    this.storage.save('web-screens', 'hints', this.hints);
    this.storage.save('web-screens', 'terminals', this.terminals);
    this.storage.save('web-screens', 'campaigns', this.campaigns);
    this.storage.save('web-screens', 'nextControlId', this.nextControlId);
    this.storage.save('web-screens', 'nextThemeId', this.nextThemeId);
    this.storage.save('web-screens', 'nextHintId', this.nextHintId);
    this.storage.save('web-screens', 'restaurants', this.restaurants);
  }

  // ─── Контролы ──────────────────────────────

  addControl(control: Omit<CSControl, 'id'>): CSControl {
    const newControl: CSControl = { ...control, id: this.nextControlId++ } as CSControl;
    this.controls = [...this.controls, newControl];
    this.persist();
    return newControl;
  }

  updateControl(control: CSControl): void {
    this.controls = this.controls.map(c => c.id === control.id ? { ...control } : c);
    this.persist();
  }

  deleteControl(id: number): void {
    this.controls = this.controls.filter(c => c.id !== id);
    // Очистить ссылки в подсказках
    this.hints = this.hints.map(h => h.controlId === id ? { ...h, controlId: null } : h);
    this.persist();
  }

  // ─── Темы ──────────────────────────────────

  addTheme(theme: Omit<CSTheme, 'id'>): CSTheme {
    const newTheme: CSTheme = { ...theme, id: this.nextThemeId++ } as CSTheme;
    this.themes = [...this.themes, newTheme];
    this.persist();
    return newTheme;
  }

  updateTheme(theme: CSTheme): void {
    this.themes = this.themes.map(t => t.id === theme.id ? { ...theme } : t);
    this.persist();
  }

  deleteTheme(id: number): void {
    this.themes = this.themes.filter(t => t.id !== id);
    this.persist();
  }

  duplicateTheme(id: number): CSTheme | null {
    const source = this.themes.find(t => t.id === id);
    if (!source) return null;
    const copy: CSTheme = {
      ...JSON.parse(JSON.stringify(source)),
      id: this.nextThemeId++,
      name: source.name + ' (копия)',
      updatedAt: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    this.themes = [...this.themes, copy];
    this.persist();
    return copy;
  }

  // ─── Подсказки ─────────────────────────────

  addHint(hint: Omit<Hint, 'id'>): Hint {
    const newHint: Hint = { ...hint, id: this.nextHintId++ } as Hint;
    this.hints = [...this.hints, newHint];
    this.persist();
    return newHint;
  }

  updateHint(hint: Hint): void {
    this.hints = this.hints.map(h => h.id === hint.id ? { ...hint } : h);
    this.persist();
  }

  deleteHint(id: number): void {
    this.hints = this.hints.filter(h => h.id !== id);
    // Каскадное удаление назначений
    this.terminals = this.terminals.map(t => ({
      ...t,
      hints: t.hints.filter(hId => hId !== id),
    }));
    this.persist();
  }

  // ─── Терминалы ─────────────────────────────

  updateTerminals(terminals: CSTerminal[]): void {
    this.terminals = [...terminals];
    this.persist();
  }

  toggleHintAssignment(terminalId: number, hintId: number): void {
    this.terminals = this.terminals.map(t => {
      if (t.id !== terminalId) return t;
      const has = t.hints.includes(hintId);
      return { ...t, hints: has ? t.hints.filter(id => id !== hintId) : [...t.hints, hintId] };
    });
    this.persist();
  }

  toggleCampaignAssignment(terminalId: number, campaignId: number): void {
    this.terminals = this.terminals.map(t => {
      if (t.id !== terminalId) return t;
      const has = t.campaigns.includes(campaignId);
      return { ...t, campaigns: has ? t.campaigns.filter(id => id !== campaignId) : [...t.campaigns, campaignId] };
    });
    this.persist();
  }

  // ─── Настройки дисплея V2 ─────────────────────

  /**
   * Преобразует терминалы ресторана в плоский список строк таблицы.
   * Каждый CSTerminalV2 → computer-строка, каждый TerminalScreenNode → display-строка.
   * Display-строки идут сразу после своей computer-строки (группировка).
   */
  getTableRows(restaurantId: number): TerminalTableRow[] {
    const restaurant = this.restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return [];

    const rows: TerminalTableRow[] = [];

    for (const terminal of restaurant.terminals) {
      // Computer-строка (касса)
      const computerRow: TerminalTableRow = {
        kind: 'computer',
        id: terminal.id,
        name: terminal.name,
        themeId: terminal.themeId,
        themeName: this.getThemeName(terminal.themeId),
        terminalGroupIds: [...terminal.terminalGroupIds],
        advertisePanels: [],
        ip: terminal.ip,
        isOnline: terminal.isOnline,
        pluginVersion: terminal.pluginVersion,
        expanded: true,
      };
      rows.push(computerRow);

      // Display-строки (экраны) — дочерние для computer
      const screens = terminal.screens ?? [];
      for (const screen of screens) {
        const displayId = terminal.id * 1000 + screen.id;
        const panels = screen.advertisePanels ?? [];
        const displayRow: TerminalTableRow = {
          kind: 'display',
          id: displayId,
          name: screen.name,
          themeId: screen.themeId,
          themeName: screen.themeName ?? this.getThemeName(screen.themeId),
          terminalGroupIds: [],
          advertisePanels: [],
          advertisePanelCount: panels.length,
          parentComputerId: terminal.id,
          supportsScreenshot: terminal.supportsScreenshot,
          hasUnsavedChanges: terminal.hasUnsavedChanges,
        };
        rows.push(displayRow);

        // Advertise-строки (панели) — под экраном
        for (const panel of panels) {
          const advertiseRow: TerminalTableRow = {
            kind: 'advertise',
            id: terminal.id * 10000 + screen.id * 100 + panel.id,
            name: panel.name,
            themeId: null,
            terminalGroupIds: [],
            advertisePanels: [],
            parentComputerId: terminal.id,
            parentDisplayId: displayId,
            advertisePanelId: panel.id,
            campaignIds: [...(panel.campaignIds ?? [])],
            campaignNames: [...(panel.campaignNames ?? [])],
          };
          rows.push(advertiseRow);
        }
      }
    }

    return rows;
  }

  updateRestaurants(restaurants: CSRestaurant[]): void {
    this.restaurants = [...restaurants];
    this.persist();
  }

  updateTerminalV2(restaurantId: number, terminal: CSTerminalV2): void {
    this.restaurants = this.restaurants.map(r => {
      if (r.id !== restaurantId) return r;
      return {
        ...r,
        terminals: r.terminals.map(t => t.id === terminal.id ? { ...terminal } : t),
      };
    });
    this.persist();
  }

  markTerminalChanged(restaurantId: number, terminalId: number): void {
    this.restaurants = this.restaurants.map(r => {
      if (r.id !== restaurantId) return r;
      return {
        ...r,
        terminals: r.terminals.map(t =>
          t.id === terminalId ? { ...t, hasUnsavedChanges: true } : t
        ),
      };
    });
    this.persist();
  }

  sendSettings(terminalIds: number[]): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const now = new Date().toISOString();
        this.restaurants = this.restaurants.map(r => ({
          ...r,
          terminals: r.terminals.map(t => {
            if (!terminalIds.includes(t.id)) return t;
            return { ...t, hasUnsavedChanges: false, lastActivity: now };
          }),
        }));
        this.persist();
        resolve();
      }, 1500);
    });
  }

  requestScreenshot(terminalId: number): Promise<TerminalScreenshot | null> {
    let terminal: CSTerminalV2 | undefined;
    let restaurant: CSRestaurant | undefined;
    for (const r of this.restaurants) {
      const t = r.terminals.find(t => t.id === terminalId);
      if (t) { terminal = t; restaurant = r; break; }
    }
    if (!terminal || !restaurant) return Promise.resolve(null);
    if (!terminal.isOnline) return Promise.reject(new Error(`Терминал недоступен. Последняя активность: ${terminal.lastActivity}`));

    const delay = 2000 + Math.random() * 2000;
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          terminalId: terminal!.id,
          terminalName: terminal!.name,
          restaurantName: restaurant!.name,
          imageUrl: '',
          capturedAt: new Date().toISOString(),
          timezone: restaurant!.timezone,
          timezoneLabel: restaurant!.timezoneLabel,
          resolution: '1920x1080',
        });
      }, delay);
    });
  }

  getThemeName(themeId: number | null): string {
    if (!themeId) return '—';
    return this.themeOptions.find(t => t.id === themeId)?.name ?? '—';
  }
}
