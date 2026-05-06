import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { SoundCollection, SoundEventHandler } from '../types';
import { MOCK_SOUND_COLLECTIONS, MOCK_SOUND_EVENT_HANDLERS, SYSTEM_EVENTS } from '../data/mock-data';

@Component({
  selector: 'app-sounds-event-handlers-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <!-- ═══ CREATE HANDLER FULL-PAGE FORM ═══ -->
    <div class="handler-form-page" *ngIf="showCreateHandler">
      <div class="handler-form-container">
        <h1 class="page-title">{{ editingHandler ? 'Редактировать обработчик' : 'Создать обработчик' }}</h1>

        <div class="form-section">
          <label class="form-label">Название обработчика *</label>
          <input class="form-input" type="text" [(ngModel)]="newHandler.name" placeholder="Введите название" />
        </div>

        <div class="form-section">
          <label class="form-label">Коллекции</label>
          <div class="multi-select-box">
            <label class="checkbox-row">
              <input type="checkbox" [checked]="allCollectionsSelected" (change)="toggleAllCollections()" />
              <span>Все</span>
            </label>
            <label class="checkbox-row" *ngFor="let col of collections">
              <input type="checkbox" [checked]="isCollectionSelected(col.id)" (change)="toggleCollectionSelection(col.id)" />
              <span>{{ col.name }}</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">Выберите события</label>
          <div class="multi-select-box">
            <div class="search-box">
              <lucide-icon name="search" [size]="16"></lucide-icon>
              <input class="search-input" type="text" [(ngModel)]="eventSearch" placeholder="Поиск..." />
            </div>
            <label class="checkbox-row">
              <input type="checkbox" [checked]="allEventsSelected" (change)="toggleAllEvents()" />
              <span>Все</span>
            </label>
            <label class="checkbox-row" *ngFor="let ev of filteredEvents">
              <input type="checkbox" [checked]="isEventSelected(ev)" (change)="toggleEvent(ev)" />
              <span>{{ ev }}</span>
            </label>
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">Тип озвучки</label>
          <select class="form-input" [(ngModel)]="newHandler.voiceType">
            <option value="Файл">Файл</option>
          </select>
        </div>

        <div class="form-section">
          <label class="form-label">Файл</label>
          <div class="file-row">
            <button class="app-btn app-btn-primary" (click)="pickFile()">
              <lucide-icon name="upload" [size]="16"></lucide-icon>
              ВЫБРАТЬ ФАЙЛ
            </button>
            <span class="file-name" *ngIf="newHandler.fileName">{{ newHandler.fileName }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button class="app-btn app-btn-primary" (click)="saveHandler()">СОХРАНИТЬ</button>
          <button class="app-btn app-btn-ghost" (click)="cancelHandlerForm()">ОТМЕНА</button>
        </div>
      </div>
    </div>

    <!-- ═══ MAIN VIEW ═══ -->
    <div class="handlers-screen" *ngIf="!showCreateHandler">
      <!-- Page header -->
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Обработчики событий</h1>
          <div class="header-actions">
            <button class="app-btn app-btn-danger" (click)="openCreateCollection()">
              СОЗДАТЬ КОЛЛЕКЦИЮ
            </button>
            <button class="app-btn app-btn-dark" (click)="openCreateHandler()">
              СОЗДАТЬ ОБРАБОТЧИК
            </button>
            <button class="icon-btn info-btn" title="Информация">
              <lucide-icon name="info" [size]="20"></lucide-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Events table -->
      <div class="table-container">
        <table class="events-table">
          <thead>
            <tr>
              <th class="col-name">Название</th>
              <th class="col-voice">Тип озвучки</th>
              <th class="col-events">Количество событий</th>
            </tr>
          </thead>
          <tbody>
            <!-- ── Collections ── -->
            <ng-container *ngFor="let col of collections">
              <!-- Collection row -->
              <tr class="collection-row" (click)="toggleCollection(col.id)">
                <td class="col-name">
                  <div class="cell-name-wrap">
                    <lucide-icon
                      [name]="isCollectionExpanded(col.id) ? 'chevron-down' : 'chevron-right'"
                      [size]="18"
                      class="chevron-icon"
                    ></lucide-icon>
                    <span class="collection-label">{{ col.name }}</span>
                    <span class="handler-count">({{ getHandlersForCollection(col.id).length }})</span>
                  </div>
                </td>
                <td></td>
                <td>
                  <div class="row-actions">
                    <button class="action-icon" title="Редактировать" (click)="editCollectionInline(col, $event)">
                      <lucide-icon name="pencil" [size]="16"></lucide-icon>
                    </button>
                    <button class="action-icon" title="Копировать" (click)="copyCollection(col, $event)">
                      <lucide-icon name="copy" [size]="16"></lucide-icon>
                    </button>
                    <button class="action-icon action-icon-danger" title="Удалить" (click)="deleteCollection(col.id, $event)">
                      <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Handler rows (nested) -->
              <ng-container *ngIf="isCollectionExpanded(col.id)">
                <tr class="handler-row" *ngFor="let h of getHandlersForCollection(col.id)">
                  <td class="col-name">
                    <div class="cell-name-wrap handler-indent">
                      <span>{{ h.name }}</span>
                    </div>
                  </td>
                  <td>{{ h.voiceType }}</td>
                  <td>
                    <div class="cell-with-actions">
                      <span>{{ h.events.length }}</span>
                      <div class="row-actions">
                        <button class="action-icon" title="Редактировать" (click)="editHandler(h)">
                          <lucide-icon name="pencil" [size]="16"></lucide-icon>
                        </button>
                        <button class="action-icon" title="Копировать" (click)="copyHandler(h)">
                          <lucide-icon name="copy" [size]="16"></lucide-icon>
                        </button>
                        <button class="action-icon action-icon-danger" title="Удалить" (click)="deleteHandler(h.id)">
                          <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </ng-container>

            <!-- ── Без коллекции ── -->
            <ng-container *ngIf="getOrphanHandlers().length > 0">
              <tr class="collection-row orphan-row">
                <td class="col-name">
                  <div class="cell-name-wrap">
                    <span class="collection-label">Без коллекции</span>
                    <span class="handler-count">({{ getOrphanHandlers().length }})</span>
                  </div>
                </td>
                <td></td>
                <td></td>
              </tr>
              <tr class="handler-row" *ngFor="let h of getOrphanHandlers()">
                <td class="col-name">
                  <div class="cell-name-wrap handler-indent">
                    <span>{{ h.name }}</span>
                  </div>
                </td>
                <td>{{ h.voiceType }}</td>
                <td>
                  <div class="cell-with-actions">
                    <span>{{ h.events.length }}</span>
                    <div class="row-actions">
                      <button class="action-icon" title="Редактировать" (click)="editHandler(h)">
                        <lucide-icon name="pencil" [size]="16"></lucide-icon>
                      </button>
                      <button class="action-icon" title="Копировать" (click)="copyHandler(h)">
                        <lucide-icon name="copy" [size]="16"></lucide-icon>
                      </button>
                      <button class="action-icon action-icon-danger" title="Удалить" (click)="deleteHandler(h.id)">
                        <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══ CREATE COLLECTION SIDE PANEL ═══ -->
    <div class="panel-backdrop" *ngIf="showCreateCollection" (click)="closeCreateCollection()"></div>
    <div class="side-panel" *ngIf="showCreateCollection">
      <div class="panel-header">
        <h2 class="panel-title">{{ editingCollection ? 'Редактировать коллекцию' : 'Создать коллекцию' }}</h2>
        <button class="icon-btn" (click)="closeCreateCollection()">
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>
      <div class="panel-body">
        <label class="form-label">Название *</label>
        <input class="form-input" type="text" [(ngModel)]="newCollectionName" placeholder="Введите название" />
      </div>
      <div class="panel-footer">
        <button class="app-btn app-btn-ghost" (click)="closeCreateCollection()">ОТМЕНА</button>
        <button class="app-btn app-btn-primary" [disabled]="!newCollectionName.trim()" (click)="saveCollection()">СОХРАНИТЬ</button>
      </div>
    </div>
  `,
  styles: [`
    /* ── Animations ── */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Main screen ── */
    .handlers-screen {
      animation: fadeIn 0.2s ease-out;
    }

    /* ── Page header ── */
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

    /* ── Buttons ── */
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
    .app-btn:disabled { opacity: 0.5; cursor: default; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover:not(:disabled) { background: #2979ff; }
    .app-btn-danger  { background: #f44336; color: #fff; }
    .app-btn-danger:hover  { background: #e53935; }
    .app-btn-dark    { background: #424242; color: #fff; }
    .app-btn-dark:hover    { background: #333; }
    .app-btn-ghost   { background: transparent; color: #757575; }
    .app-btn-ghost:hover   { background: #f5f5f5; }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: #757575;
      cursor: pointer;
    }
    .icon-btn:hover { background: #f0f0f0; }
    .info-btn { color: #9e9e9e; }

    /* ── Table ── */
    .table-container {
      background: #fff;
      border-radius: 4px;
      overflow: hidden;
    }
    .events-table {
      width: 100%;
      border-collapse: collapse;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      table-layout: fixed;
    }
    .events-table thead th {
      text-align: left;
      padding: 12px 16px;
      font-weight: 500;
      color: #757575;
      font-size: 13px;
      border-bottom: 1px solid #e0e0e0;
      background: #fafafa;
    }
    .col-name   { width: 50%; }
    .col-voice  { width: 25%; }
    .col-events { width: 25%; }

    /* Collection row */
    .collection-row {
      cursor: pointer;
      background: #fff;
    }
    .collection-row:hover { background: #f5f5f5; }
    .collection-row td {
      padding: 10px 16px;
      border-bottom: 1px solid #e0e0e0;
      color: #212121;
    }
    .cell-name-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .chevron-icon { color: #757575; flex-shrink: 0; }
    .collection-label { font-weight: 500; }
    .handler-count { color: #9e9e9e; font-weight: 400; }

    .orphan-row { cursor: default; }

    /* Handler row */
    .handler-row { background: #fff; }
    .handler-row:hover { background: #f5f5f5; }
    .handler-row td {
      padding: 10px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #424242;
    }
    .handler-indent { padding-left: 42px; }

    /* Row actions (show on hover) */
    .row-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.15s;
      justify-content: flex-end;
    }
    .collection-row:hover .row-actions,
    .handler-row:hover .row-actions {
      opacity: 1;
    }
    .action-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #757575;
      cursor: pointer;
    }
    .action-icon:hover { background: #e0e0e0; }
    .action-icon-danger:hover { color: #f44336; }

    .cell-with-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ── Side Panel (Create Collection) ── */
    .panel-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 999;
    }
    .side-panel {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 420px;
      background: #fff;
      box-shadow: -2px 0 8px rgba(0,0,0,0.15);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      font-family: Roboto, sans-serif;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }
    .panel-title {
      font-size: 18px;
      font-weight: 500;
      color: #212121;
      margin: 0;
    }
    .panel-body {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
    .panel-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
    }

    /* ── Handler Form (full-page) ── */
    .handler-form-page {
      animation: fadeIn 0.2s ease-out;
    }
    .handler-form-container {
      max-width: 640px;
    }
    .form-section {
      margin-bottom: 24px;
    }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #757575;
      margin-bottom: 6px;
      font-family: Roboto, sans-serif;
    }
    .form-input {
      display: block;
      width: 100%;
      height: 40px;
      padding: 0 12px;
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      font-size: 14px;
      font-family: Roboto, sans-serif;
      color: #212121;
      background: #fff;
      box-sizing: border-box;
    }
    .form-input:focus {
      outline: none;
      border-color: #448aff;
    }

    /* Multi-select box */
    .multi-select-box {
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      max-height: 220px;
      overflow-y: auto;
      background: #fff;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      color: #424242;
      font-family: Roboto, sans-serif;
    }
    .checkbox-row:hover { background: #f5f5f5; }
    .checkbox-row input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #448aff;
      cursor: pointer;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid #e0e0e0;
      color: #9e9e9e;
    }
    .search-input {
      border: none;
      outline: none;
      font-size: 14px;
      font-family: Roboto, sans-serif;
      flex: 1;
      color: #212121;
    }

    /* File row */
    .file-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .file-name {
      font-size: 14px;
      color: #424242;
    }

    /* Form actions */
    .form-actions {
      display: flex;
      gap: 8px;
      margin-top: 32px;
    }
  `],
})
export class SoundsEventHandlersScreenComponent {
  private storage = inject(StorageService);

  collections: SoundCollection[] = [];
  handlers: SoundEventHandler[] = [];
  expandedCollections = new Set<number>();

  // Create / edit collection panel
  showCreateCollection = false;
  newCollectionName = '';
  editingCollection: SoundCollection | null = null;

  // Create / edit handler form
  showCreateHandler = false;
  editingHandler: SoundEventHandler | null = null;
  newHandler = this.emptyHandler();
  eventSearch = '';
  allCollectionsSelected = false;
  allEventsSelected = false;

  ngOnInit(): void {
    this.collections = this.storage.load('web-screens', 'sound-collections', [...MOCK_SOUND_COLLECTIONS]);
    this.handlers = this.storage.load('web-screens', 'sound-handlers', [...MOCK_SOUND_EVENT_HANDLERS]);
  }

  // ── Helpers ─────────────────────────────────────────

  getHandlersForCollection(collectionId: number): SoundEventHandler[] {
    return this.handlers.filter(h => h.collectionId === collectionId);
  }

  getOrphanHandlers(): SoundEventHandler[] {
    return this.handlers.filter(h => h.collectionId === null);
  }

  toggleCollection(id: number): void {
    if (this.expandedCollections.has(id)) {
      this.expandedCollections.delete(id);
    } else {
      this.expandedCollections.add(id);
    }
  }

  isCollectionExpanded(id: number): boolean {
    return this.expandedCollections.has(id);
  }

  // ── Collection CRUD ─────────────────────────────────

  openCreateCollection(): void {
    this.editingCollection = null;
    this.newCollectionName = '';
    this.showCreateCollection = true;
  }

  editCollectionInline(col: SoundCollection, event: Event): void {
    event.stopPropagation();
    this.editingCollection = col;
    this.newCollectionName = col.name;
    this.showCreateCollection = true;
  }

  closeCreateCollection(): void {
    this.showCreateCollection = false;
    this.editingCollection = null;
    this.newCollectionName = '';
  }

  saveCollection(): void {
    const name = this.newCollectionName.trim();
    if (!name) return;

    if (this.editingCollection) {
      const idx = this.collections.findIndex(c => c.id === this.editingCollection!.id);
      if (idx !== -1) {
        this.collections[idx] = { ...this.collections[idx], name };
      }
    } else {
      const maxId = this.collections.reduce((m, c) => Math.max(m, c.id), 0);
      this.collections = [...this.collections, { id: maxId + 1, name }];
    }

    this.storage.save('web-screens', 'sound-collections', this.collections);
    this.closeCreateCollection();
  }

  deleteCollection(id: number, event: Event): void {
    event.stopPropagation();
    // Move handlers to orphan
    this.handlers = this.handlers.map(h => h.collectionId === id ? { ...h, collectionId: null } : h);
    this.collections = this.collections.filter(c => c.id !== id);
    this.expandedCollections.delete(id);
    this.persistAll();
  }

  copyCollection(col: SoundCollection, event: Event): void {
    event.stopPropagation();
    const maxColId = this.collections.reduce((m, c) => Math.max(m, c.id), 0);
    const newCol: SoundCollection = { id: maxColId + 1, name: col.name + ' (копия)' };
    this.collections = [...this.collections, newCol];

    // Duplicate handlers in that collection
    const sourceHandlers = this.getHandlersForCollection(col.id);
    let maxHId = this.handlers.reduce((m, h) => Math.max(m, h.id), 0);
    const newHandlers = sourceHandlers.map(h => {
      maxHId++;
      return { ...h, id: maxHId, collectionId: newCol.id };
    });
    this.handlers = [...this.handlers, ...newHandlers];
    this.persistAll();
  }

  // ── Handler CRUD ────────────────────────────────────

  openCreateHandler(): void {
    this.editingHandler = null;
    this.newHandler = this.emptyHandler();
    this.eventSearch = '';
    this.syncAllToggles();
    this.showCreateHandler = true;
  }

  editHandler(h: SoundEventHandler): void {
    this.editingHandler = h;
    this.newHandler = {
      name: h.name,
      collectionIds: h.collectionId !== null ? [h.collectionId] : [],
      events: [...h.events],
      voiceType: h.voiceType,
      fileName: h.fileName || '',
    };
    this.eventSearch = '';
    this.syncAllToggles();
    this.showCreateHandler = true;
  }

  cancelHandlerForm(): void {
    this.showCreateHandler = false;
    this.editingHandler = null;
  }

  saveHandler(): void {
    const name = this.newHandler.name.trim();
    if (!name) return;

    const collectionId = this.newHandler.collectionIds.length > 0 ? this.newHandler.collectionIds[0] : null;

    if (this.editingHandler) {
      const idx = this.handlers.findIndex(h => h.id === this.editingHandler!.id);
      if (idx !== -1) {
        this.handlers[idx] = {
          ...this.handlers[idx],
          name,
          collectionId,
          voiceType: this.newHandler.voiceType,
          events: [...this.newHandler.events],
          fileName: this.newHandler.fileName || undefined,
        };
      }
    } else {
      const maxId = this.handlers.reduce((m, h) => Math.max(m, h.id), 0);
      const handler: SoundEventHandler = {
        id: maxId + 1,
        name,
        collectionId,
        voiceType: this.newHandler.voiceType,
        events: [...this.newHandler.events],
        fileName: this.newHandler.fileName || undefined,
      };
      this.handlers = [...this.handlers, handler];
    }

    this.persistAll();
    this.showCreateHandler = false;
    this.editingHandler = null;
  }

  deleteHandler(id: number): void {
    this.handlers = this.handlers.filter(h => h.id !== id);
    this.persistAll();
  }

  copyHandler(h: SoundEventHandler): void {
    const maxId = this.handlers.reduce((m, hh) => Math.max(m, hh.id), 0);
    const copy: SoundEventHandler = { ...h, id: maxId + 1, name: h.name + ' (копия)' };
    this.handlers = [...this.handlers, copy];
    this.persistAll();
  }

  // ── Events multi-select ─────────────────────────────

  get filteredEvents(): string[] {
    const q = this.eventSearch.toLowerCase().trim();
    if (!q) return SYSTEM_EVENTS;
    return SYSTEM_EVENTS.filter(e => e.toLowerCase().includes(q));
  }

  toggleEvent(event: string): void {
    const idx = this.newHandler.events.indexOf(event);
    if (idx >= 0) {
      this.newHandler.events.splice(idx, 1);
    } else {
      this.newHandler.events.push(event);
    }
    this.syncAllToggles();
  }

  toggleAllEvents(): void {
    if (this.allEventsSelected) {
      this.newHandler.events = [];
    } else {
      this.newHandler.events = [...SYSTEM_EVENTS];
    }
    this.syncAllToggles();
  }

  isEventSelected(event: string): boolean {
    return this.newHandler.events.includes(event);
  }

  // ── Collections multi-select ────────────────────────

  toggleCollectionSelection(id: number): void {
    const idx = this.newHandler.collectionIds.indexOf(id);
    if (idx >= 0) {
      this.newHandler.collectionIds.splice(idx, 1);
    } else {
      this.newHandler.collectionIds.push(id);
    }
    this.syncAllToggles();
  }

  toggleAllCollections(): void {
    if (this.allCollectionsSelected) {
      this.newHandler.collectionIds = [];
    } else {
      this.newHandler.collectionIds = this.collections.map(c => c.id);
    }
    this.syncAllToggles();
  }

  isCollectionSelected(id: number): boolean {
    return this.newHandler.collectionIds.includes(id);
  }

  // ── File pick mock ──────────────────────────────────

  pickFile(): void {
    this.newHandler.fileName = 'sound_' + Date.now() + '.mp3';
  }

  // ── Private ─────────────────────────────────────────

  private persistAll(): void {
    this.storage.save('web-screens', 'sound-collections', this.collections);
    this.storage.save('web-screens', 'sound-handlers', this.handlers);
  }

  private emptyHandler() {
    return { name: '', collectionIds: [] as number[], events: [] as string[], voiceType: 'Файл', fileName: '' };
  }

  private syncAllToggles(): void {
    this.allEventsSelected = SYSTEM_EVENTS.length > 0 && this.newHandler.events.length === SYSTEM_EVENTS.length;
    this.allCollectionsSelected = this.collections.length > 0 && this.newHandler.collectionIds.length === this.collections.length;
  }
}
