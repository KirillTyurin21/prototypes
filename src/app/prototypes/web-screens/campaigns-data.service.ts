import { Injectable, inject } from '@angular/core';
import { StorageService } from '@/shared/storage.service';
import {
  WebCampaign,
  CampaignFolder,
  CampaignResolution,
  ScreenModeInfo,
  emptyResolutionsModes,
} from './data/campaigns.data';
import { WEB_CAMPAIGNS, CAMPAIGN_FOLDERS, SCREEN_MODE_REGISTRY, COMMON_MODE_IDS, getScreenMode } from './data/campaigns.data';

/**
 * Состояние раздела «Кампании» (Customer Screen).
 * Данные сохраняются в localStorage через StorageService.
 */
@Injectable({ providedIn: 'root' })
export class CampaignsDataService {
  private storage = inject(StorageService);

  folders: CampaignFolder[] = [];
  campaigns: WebCampaign[] = [];

  private nextCampaignId = 100;
  private nextFolderId = 10;
  private nextResolutionId = 10;
  private nextMediaId = 1000;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const defaultCampaigns = JSON.parse(JSON.stringify(WEB_CAMPAIGNS));
    const defaultFolders = JSON.parse(JSON.stringify(CAMPAIGN_FOLDERS));

    // v3: структура режимов изменилась (2 общих режима + добавленные через «+»)
    this.campaigns = this.storage.load('web-screens', 'campaigns.v3', defaultCampaigns);
    this.folders = this.storage.load('web-screens', 'campaignFolders.v2', defaultFolders);
    this.nextCampaignId = this.storage.load('web-screens', 'nextCampaignId.v2', 100);
    this.nextFolderId = this.storage.load('web-screens', 'nextFolderId.v2', 10);
    this.nextResolutionId = this.storage.load('web-screens', 'nextResolutionId.v2', 10);
    this.nextMediaId = this.storage.load('web-screens', 'nextMediaId.v2', 1000);

    // Миграция: у кампаний нет resolutions → добавить пустые
    for (const c of this.campaigns) {
      if (!c.resolutions || c.resolutions.length === 0) {
        c.resolutions = [];
      }
      if (!Array.isArray(c.days) || c.days.length !== 7) {
        c.days = [true, true, true, true, true, true, true];
      }
      if (c.folderId === undefined) c.folderId = null;
      // Миграция режимов: общие режимы всегда должны быть в каждом разрешении
      for (const r of c.resolutions) {
        for (const modeId of COMMON_MODE_IDS) {
          if (!r.modes[modeId]) r.modes[modeId] = [];
        }
      }
    }
  }

  persist(): void {
    this.storage.save('web-screens', 'campaigns.v3', this.campaigns);
    this.storage.save('web-screens', 'campaignFolders.v2', this.folders);
    this.storage.save('web-screens', 'nextCampaignId.v2', this.nextCampaignId);
    this.storage.save('web-screens', 'nextFolderId.v2', this.nextFolderId);
    this.storage.save('web-screens', 'nextResolutionId.v2', this.nextResolutionId);
    this.storage.save('web-screens', 'nextMediaId.v2', this.nextMediaId);
  }

  // ─── Папки ────────────────────────────────────

  createFolder(name: string, parentId: number | null): CampaignFolder {
    const folder: CampaignFolder = { id: this.nextFolderId++, name, parentId };
    this.folders.push(folder);
    this.persist();
    return folder;
  }

  renameFolder(id: number, name: string): void {
    const f = this.folders.find(x => x.id === id);
    if (f) {
      f.name = name;
      this.persist();
    }
  }

  deleteFolder(id: number): void {
    // Кампании из папки — в корень
    for (const c of this.campaigns) {
      if (c.folderId === id) c.folderId = this.folders.find(f => f.id === id)?.parentId ?? null;
    }
    this.folders = this.folders.filter(f => f.id !== id);
    this.persist();
  }

  childrenOf(folderId: number | null): CampaignFolder[] {
    return this.folders.filter(f => f.parentId === folderId);
  }

  folderDepth(id: number): number {
    let depth = 0;
    let cur = this.folders.find(f => f.id === id);
    while (cur && cur.parentId !== null) {
      depth++;
      cur = this.folders.find(f => f.id === cur!.parentId);
    }
    return depth;
  }

  // ─── Кампании ─────────────────────────────────

  getCampaign(id: number): WebCampaign | undefined {
    return this.campaigns.find(c => c.id === id);
  }

  createCampaign(name: string): WebCampaign {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const campaign: WebCampaign = {
      id: this.nextCampaignId++,
      name,
      dateFrom: iso,
      dateTo: iso,
      timeFrom: '00:00',
      timeTo: '23:59',
      days: [true, true, true, true, true, true, true],
      folderId: null,
      resolutions: [],
    };
    this.campaigns.unshift(campaign);
    this.persist();
    return campaign;
  }

  updateCampaign(c: WebCampaign): void {
    const idx = this.campaigns.findIndex(x => x.id === c.id);
    if (idx >= 0) {
      this.campaigns[idx] = JSON.parse(JSON.stringify(c));
    }
    this.persist();
  }

  deleteCampaign(id: number): void {
    this.campaigns = this.campaigns.filter(c => c.id !== id);
    this.persist();
  }

  moveCampaign(id: number, folderId: number | null): void {
    const c = this.campaigns.find(x => x.id === id);
    if (c) {
      c.folderId = folderId;
      this.persist();
    }
  }

  // ─── Разрешения ───────────────────────────────

  createResolution(w: number, h: number): CampaignResolution {
    return {
      id: this.nextResolutionId++,
      width: w,
      height: h,
      modes: emptyResolutionsModes(),
    };
  }

  // ─── Режимы экранов ──────────────────────────

  /** Полный реестр режимов экранов */
  getScreenModes(): ScreenModeInfo[] {
    return SCREEN_MODE_REGISTRY;
  }

  /** Режим по ID */
  getScreenMode(id: string): ScreenModeInfo | undefined {
    return getScreenMode(id);
  }

  /** Режимы, доступные для добавления в разрешение (не общие и ещё не добавленные) */
  availableScreenModes(resolution: CampaignResolution): ScreenModeInfo[] {
    return SCREEN_MODE_REGISTRY.filter(
      m => m.kind !== 'common' && !(m.id in resolution.modes)
    );
  }

  /** Добавить режим в разрешение (вкладка появится на месте «+») */
  addScreenMode(resolution: CampaignResolution, modeId: string): void {
    if (!(modeId in resolution.modes)) {
      resolution.modes[modeId] = [];
    }
  }

  /** Удалить режим из разрешения (режим вернётся в селектор «+») */
  removeScreenMode(resolution: CampaignResolution, modeId: string): void {
    delete resolution.modes[modeId];
  }

  nextMediaIdValue(): number {
    return this.nextMediaId++;
  }
}
