import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { SoundCollection, SoundEventHandler, GenerationQueueItem } from '../types';
import { MOCK_SOUND_COLLECTIONS, MOCK_SOUND_EVENT_HANDLERS } from '../data/mock-data';
import { EventHandlerFormComponent, HandlerFormData } from '../components/sounds/event-handler-form.component';
import { GenerationQueuePanelComponent } from '../components/sounds/generation-queue-panel.component';

@Component({
  selector: 'app-sounds-event-handlers-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, EventHandlerFormComponent, GenerationQueuePanelComponent],
  template: `
    <!-- ═══ CREATE HANDLER FULL-PAGE FORM ═══ -->
    <app-event-handler-form
      *ngIf="showCreateHandler"
      [collections]="collections"
      [editingHandler]="editingHandler"
      [formData]="newHandler"
      (saved)="onHandlerSaved($event)"
      (cancel)="cancelHandlerForm()"
      (playHandler)="playHandler($event)"
    ></app-event-handler-form>

    <!-- ═══ MAIN VIEW ═══ -->
    <div class="handlers-screen" *ngIf="!showCreateHandler">
      <!-- Page header -->
      <div class="page-header">
        <div class="page-title-row">
          <h1 class="page-title">Обработчики событий</h1>
          <div class="header-actions">
            <app-generation-queue-panel
              [generationQueue]="generationQueue"
              [handlers]="handlers"
              (queueChanged)="onQueueChanged($event)"
              (handlerUpdated)="onHandlerUpdated($event)"
              (openHandler)="openHandlerFromQueue($event)"
            ></app-generation-queue-panel>
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
              <th class="col-events">Кол-во событий</th>
              <th class="col-status">Статус</th>
              <th class="col-play">Проиграть</th>
              <th class="col-size">Размер</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            <!-- ── Collections ── -->
            <ng-container *ngFor="let col of collections">
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
                <td></td><td></td><td></td><td></td><td></td>
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

              <ng-container *ngIf="isCollectionExpanded(col.id)">
                <tr class="handler-row" *ngFor="let h of getHandlersForCollection(col.id)">
                  <td class="col-name"><div class="cell-name-wrap handler-indent"><span>{{ h.name }}</span></div></td>
                  <td>{{ getVoiceTypeLabel(h) }}</td>
                  <td>{{ h.events.length }}</td>
                  <td>
                    <span class="queue-status-badge" *ngIf="h.voiceType === 'generation'"
                          [class.status-waiting]="h.generationStatus === 'pending'"
                          [class.status-generating]="h.generationStatus === 'generating'"
                          [class.status-done]="h.generationStatus === 'done'">
                      {{ getGenerationStatusText(h.generationStatus) }}
                    </span>
                    <span *ngIf="h.voiceType !== 'generation'" class="text-muted">—</span>
                  </td>
                  <td>
                    <button class="action-icon play-action" *ngIf="h.voiceType === 'generation' && h.generationStatus === 'done'"
                            title="Проиграть" (click)="playHandler(h)">
                      <lucide-icon name="play" [size]="16"></lucide-icon>
                    </button>
                    <span *ngIf="!(h.voiceType === 'generation' && h.generationStatus === 'done')" class="text-muted">—</span>
                  </td>
                  <td>{{ getFileSizeLabel(h) }}</td>
                  <td>
                    <div class="row-actions">
                      <button class="action-icon" title="Редактировать" (click)="editHandler(h)"><lucide-icon name="pencil" [size]="16"></lucide-icon></button>
                      <button class="action-icon" title="Копировать" (click)="copyHandler(h)"><lucide-icon name="copy" [size]="16"></lucide-icon></button>
                      <button class="action-icon action-icon-danger" title="Удалить" (click)="deleteHandler(h.id)"><lucide-icon name="trash-2" [size]="16"></lucide-icon></button>
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
                <td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr class="handler-row" *ngFor="let h of getOrphanHandlers()">
                <td class="col-name"><div class="cell-name-wrap handler-indent"><span>{{ h.name }}</span></div></td>
                <td>{{ getVoiceTypeLabel(h) }}</td>
                <td>{{ h.events.length }}</td>
                <td>
                  <span class="queue-status-badge" *ngIf="h.voiceType === 'generation'"
                        [class.status-waiting]="h.generationStatus === 'pending'"
                        [class.status-generating]="h.generationStatus === 'generating'"
                        [class.status-done]="h.generationStatus === 'done'">
                    {{ getGenerationStatusText(h.generationStatus) }}
                  </span>
                  <span *ngIf="h.voiceType !== 'generation'" class="text-muted">—</span>
                </td>
                <td>
                  <button class="action-icon play-action" *ngIf="h.voiceType === 'generation' && h.generationStatus === 'done'"
                          title="Проиграть" (click)="playHandler(h)">
                    <lucide-icon name="play" [size]="16"></lucide-icon>
                  </button>
                  <span *ngIf="!(h.voiceType === 'generation' && h.generationStatus === 'done')" class="text-muted">—</span>
                </td>
                <td>{{ getFileSizeLabel(h) }}</td>
                <td>
                  <div class="row-actions">
                    <button class="action-icon" title="Редактировать" (click)="editHandler(h)"><lucide-icon name="pencil" [size]="16"></lucide-icon></button>
                    <button class="action-icon" title="Копировать" (click)="copyHandler(h)"><lucide-icon name="copy" [size]="16"></lucide-icon></button>
                    <button class="action-icon action-icon-danger" title="Удалить" (click)="deleteHandler(h.id)"><lucide-icon name="trash-2" [size]="16"></lucide-icon></button>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="5" class="totals-label">Итого</td>
              <td class="totals-value">{{ getTotalSize() }}</td>
              <td></td>
            </tr>
          </tfoot>
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
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .handlers-screen { animation: fadeIn 0.2s ease-out; }

    .page-header { margin-bottom: 20px; }
    .page-title-row { display: flex; align-items: center; justify-content: space-between; }
    .page-title { font-size: 24px; font-weight: 500; color: #212121; margin: 0; font-family: Roboto, sans-serif; }
    .header-actions { display: flex; align-items: center; gap: 8px; }

    .app-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 0 16px;
      height: 36px; border: none; border-radius: 4px; font-size: 14px;
      font-weight: 500; cursor: pointer; font-family: Roboto, sans-serif; white-space: nowrap;
    }
    .app-btn:disabled { opacity: 0.5; cursor: default; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover:not(:disabled) { background: #2979ff; }
    .app-btn-danger { background: #f44336; color: #fff; }
    .app-btn-danger:hover { background: #e53935; }
    .app-btn-dark { background: #424242; color: #fff; }
    .app-btn-dark:hover { background: #333; }
    .app-btn-ghost { background: transparent; color: #757575; }
    .app-btn-ghost:hover { background: #f5f5f5; }

    .icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border: none; border-radius: 50%;
      background: transparent; color: #757575; cursor: pointer;
    }
    .icon-btn:hover { background: #f0f0f0; }
    .info-btn { color: #9e9e9e; }

    .table-container { background: #fff; border-radius: 4px; overflow: hidden; }
    .events-table {
      width: 100%; border-collapse: collapse; font-family: Roboto, sans-serif;
      font-size: 14px; table-layout: fixed;
    }
    .events-table thead th {
      text-align: left; padding: 12px 16px; font-weight: 500;
      color: #757575; font-size: 13px; border-bottom: 1px solid #e0e0e0; background: #fafafa;
    }
    .col-name { width: 30%; } .col-voice { width: 14%; } .col-events { width: 12%; }
    .col-status { width: 12%; } .col-play { width: 8%; text-align: center; }
    .col-size { width: 10%; } .col-actions { width: 14%; }

    .collection-row { cursor: pointer; background: #fff; }
    .collection-row:hover { background: #f5f5f5; }
    .collection-row td { padding: 10px 16px; border-bottom: 1px solid #e0e0e0; color: #212121; }
    .cell-name-wrap { display: flex; align-items: center; gap: 8px; }
    .chevron-icon { color: #757575; flex-shrink: 0; }
    .collection-label { font-weight: 500; }
    .handler-count { color: #9e9e9e; font-weight: 400; }
    .orphan-row { cursor: default; }

    .handler-row { background: #fff; }
    .handler-row:hover { background: #f5f5f5; }
    .handler-row td { padding: 10px 16px; border-bottom: 1px solid #f0f0f0; color: #424242; }
    .handler-indent { padding-left: 42px; }

    .row-actions {
      display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; justify-content: flex-end;
    }
    .collection-row:hover .row-actions, .handler-row:hover .row-actions { opacity: 1; }
    .action-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border: none; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer;
    }
    .action-icon:hover { background: #e0e0e0; }
    .action-icon-danger:hover { color: #f44336; }

    .queue-status-badge {
      display: inline-block; padding: 2px 8px; border-radius: 12px;
      font-size: 12px; font-weight: 500; white-space: nowrap;
    }
    .status-waiting { background: #fff3e0; color: #e65100; }
    .status-generating { background: #e3f2fd; color: #1565c0; }
    .status-done { background: #e8f5e9; color: #2e7d32; }
    .text-muted { color: #9e9e9e; }
    .play-action { color: #448aff; }
    .play-action:hover { color: #1565c0; }
    .totals-row { font-weight: 600; background: #fafafa; border-top: 2px solid #e0e0e0; }
    .totals-label { text-align: right; padding-right: 16px !important; }
    .totals-value { color: #424242; }

    /* Side Panel */
    .panel-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 999; }
    .side-panel {
      position: fixed; top: 0; right: 0; height: 100vh; width: 420px;
      background: #fff; box-shadow: -2px 0 8px rgba(0,0,0,0.15);
      z-index: 1000; display: flex; flex-direction: column; font-family: Roboto, sans-serif;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; border-bottom: 1px solid #e0e0e0;
    }
    .panel-title { font-size: 18px; font-weight: 500; color: #212121; margin: 0; }
    .panel-body { flex: 1; padding: 24px; overflow-y: auto; }
    .panel-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 16px 24px; border-top: 1px solid #e0e0e0;
    }
    .form-label {
      display: block; font-size: 13px; font-weight: 500;
      color: #757575; margin-bottom: 6px; font-family: Roboto, sans-serif;
    }
    .form-input {
      display: block; width: 100%; height: 40px; padding: 0 12px;
      border: 1px solid #bdbdbd; border-radius: 4px; font-size: 14px;
      font-family: Roboto, sans-serif; color: #212121; background: #fff; box-sizing: border-box;
    }
    .form-input:focus { outline: none; border-color: #448aff; }
  `],
})
export class SoundsEventHandlersScreenComponent implements OnInit {
  private storage = inject(StorageService);
  @ViewChild(GenerationQueuePanelComponent) queuePanel!: GenerationQueuePanelComponent;

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
  newHandler: HandlerFormData = this.emptyHandler();

  // Generation queue
  generationQueue: GenerationQueueItem[] = [];

  ngOnInit(): void {
    this.collections = this.storage.load('web-screens', 'sound-collections', [...MOCK_SOUND_COLLECTIONS]);
    this.handlers = this.storage.load('web-screens', 'sound-handlers', [...MOCK_SOUND_EVENT_HANDLERS]);
    this.generationQueue = this.storage.load('web-screens', 'sound-generation-queue', []);
  }

  // ── Table helpers ───────────────────────────────────

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

  getVoiceTypeLabel(h: SoundEventHandler): string {
    return h.voiceType === 'generation' ? 'Генерация' : 'Файл';
  }

  getGenerationStatusText(status: string | undefined): string {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'generating': return 'Генерируется';
      case 'done': return 'Готово';
      default: return '—';
    }
  }

  playHandler(h: SoundEventHandler): void {
    alert('▶ Воспроизведение: ' + h.name + ' — ' + h.phraseText);
  }

  getFileSizeLabel(h: SoundEventHandler): string {
    if (h.fileSize) return h.fileSize + ' КБ';
    return '—';
  }

  getTotalSize(): string {
    const total = this.handlers.reduce((sum, h) => sum + (h.fileSize || 0), 0);
    if (total === 0) return '—';
    if (total >= 1024) return (total / 1024).toFixed(1) + ' МБ';
    return total + ' КБ';
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
      if (idx !== -1) this.collections[idx] = { ...this.collections[idx], name };
    } else {
      const maxId = this.collections.reduce((m, c) => Math.max(m, c.id), 0);
      this.collections = [...this.collections, { id: maxId + 1, name }];
    }
    this.storage.save('web-screens', 'sound-collections', this.collections);
    this.closeCreateCollection();
  }

  deleteCollection(id: number, event: Event): void {
    event.stopPropagation();
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
    const sourceHandlers = this.getHandlersForCollection(col.id);
    let maxHId = this.handlers.reduce((m, h) => Math.max(m, h.id), 0);
    const newHandlers = sourceHandlers.map(h => ({ ...h, id: ++maxHId, collectionId: newCol.id }));
    this.handlers = [...this.handlers, ...newHandlers];
    this.persistAll();
  }

  // ── Handler CRUD ────────────────────────────────────

  openCreateHandler(): void {
    this.editingHandler = null;
    this.newHandler = this.emptyHandler();
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
      voiceName: h.voiceName || '',
      phraseText: h.phraseText || '',
    };
    this.showCreateHandler = true;
  }

  cancelHandlerForm(): void {
    this.showCreateHandler = false;
    this.editingHandler = null;
  }

  onHandlerSaved(formData: HandlerFormData): void {
    const name = formData.name.trim();
    if (!name) return;
    const collectionId = formData.collectionIds.length > 0 ? formData.collectionIds[0] : null;
    const isGeneration = formData.voiceType === 'generation';

    if (this.editingHandler) {
      const idx = this.handlers.findIndex(h => h.id === this.editingHandler!.id);
      if (idx !== -1) {
        this.handlers[idx] = {
          ...this.handlers[idx],
          name,
          collectionId,
          voiceType: formData.voiceType,
          events: [...formData.events],
          fileName: isGeneration ? undefined : (formData.fileName || undefined),
          voiceName: isGeneration ? formData.voiceName : undefined,
          phraseText: isGeneration ? formData.phraseText : undefined,
          generationStatus: isGeneration ? 'pending' : undefined,
        };
      }
    } else {
      const maxId = this.handlers.reduce((m, h) => Math.max(m, h.id), 0);
      const handler: SoundEventHandler = {
        id: maxId + 1,
        name,
        collectionId,
        voiceType: formData.voiceType,
        events: [...formData.events],
        fileName: isGeneration ? undefined : (formData.fileName || undefined),
        voiceName: isGeneration ? formData.voiceName : undefined,
        phraseText: isGeneration ? formData.phraseText : undefined,
        generationStatus: isGeneration ? 'pending' : undefined,
      };
      this.handlers = [...this.handlers, handler];
    }

    if (isGeneration && formData.voiceName && formData.phraseText) {
      const handlerId = this.editingHandler
        ? this.editingHandler.id
        : this.handlers[this.handlers.length - 1].id;
      this.queuePanel.addToQueue(handlerId, name, formData.phraseText, formData.voiceName);
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
    this.handlers = [...this.handlers, { ...h, id: maxId + 1, name: h.name + ' (копия)' }];
    this.persistAll();
  }

  // ── Queue events ────────────────────────────────────

  onQueueChanged(queue: GenerationQueueItem[]): void {
    this.generationQueue = queue;
  }

  onHandlerUpdated(h: SoundEventHandler): void {
    this.persistAll();
  }

  openHandlerFromQueue(qi: GenerationQueueItem): void {
    const handler = this.handlers.find(h => h.id === qi.handlerId);
    if (handler) this.editHandler(handler);
  }

  // ── Private ─────────────────────────────────────────

  private persistAll(): void {
    this.storage.save('web-screens', 'sound-collections', this.collections);
    this.storage.save('web-screens', 'sound-handlers', this.handlers);
  }

  private emptyHandler(): HandlerFormData {
    return {
      name: '',
      collectionIds: [],
      events: [],
      voiceType: 'file',
      fileName: '',
      voiceName: '',
      phraseText: '',
    };
  }
}
