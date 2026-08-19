import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { DvCollection, DvEventHandler, DvAudioFile, CheckListPickerItem } from '../../types';
import { getSystemHandlerPrefix, MOCK_DV_EVENTS } from '../../data/mock-data';
import { CheckListPickerModalComponent } from './check-list-picker-modal.component';
import { AudioFilesModalComponent } from './audio-files-modal.component';

/**
 * Панель выбранного обработчика (правая часть split-экрана):
 * название, коллекции (чипы + пикер), события, тип озвучки,
 * файл (Галерея) / генерация (шаблон, переменные, голос), действия, футер.
 */
@Component({
  selector: 'app-handler-detail-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CheckListPickerModalComponent, AudioFilesModalComponent],
  template: `
    <div class="hd-panel">
      <!-- Пустое состояние -->
      <div class="hd-empty" *ngIf="!handler">
        <lucide-icon name="mic" [size]="28"></lucide-icon>
        <span class="hd-empty-title">Обработчик не выбран</span>
        <span class="hd-empty-sub">Выберите обработчик в дереве слева</span>
      </div>

      <ng-container *ngIf="handler && draft">
        <div class="hd-body">
          <!-- Шапка -->
          <div class="hd-head">
            <span class="hd-head-icon"><lucide-icon name="mic" [size]="18"></lucide-icon></span>
            <div class="hd-head-main">
              <div class="hd-head-row">
                <h2 class="hd-head-title">{{ prefix }}{{ draft.name }}</h2>
                <span class="hd-badge hd-badge--system" *ngIf="isSystem">Системный</span>
                <span class="hd-badge hd-badge--status" *ngIf="draft.voiceType === 'generation'" [ngClass]="draft.generationStatus === 'done' ? 'hd-badge--done' : 'hd-badge--pending'">
                  {{ draft.generationStatus === 'done' ? 'Готово' : 'Ожидание' }}
                </span>
              </div>
              <span class="hd-head-meta">{{ collectionsLine }}</span>
            </div>
          </div>

          <!-- Название -->
          <div class="hd-section">
            <label class="hd-label" for="hd-name">Название обработчика <span class="hd-req">*</span></label>
            <input id="hd-name" type="text" class="hd-input" [(ngModel)]="draft.name" placeholder="Введите название" />
          </div>

          <!-- Коллекции -->
          <div class="hd-section">
            <span class="hd-label">Коллекции</span>
            <div class="hd-chips">
              <span class="hd-chip" *ngFor="let cid of draft.collectionIds">
                {{ collectionName(cid) }}
                <button type="button" class="hd-chip-x" (click)="removeCollection(cid)" [attr.aria-label]="'Убрать из коллекции ' + collectionName(cid)">
                  <lucide-icon name="x" [size]="12"></lucide-icon>
                </button>
              </span>
              <button type="button" class="hd-add-btn" (click)="openCollectionPicker()">
                <lucide-icon name="plus" [size]="14"></lucide-icon>
                Добавить коллекцию
              </button>
            </div>
          </div>

          <!-- События -->
          <div class="hd-section">
            <span class="hd-label">События</span>
            <div class="hd-chips">
              <span class="hd-chip hd-chip--event" *ngFor="let ev of draft.events">
                {{ ev }}
                <button type="button" class="hd-chip-x" (click)="removeEvent(ev)" [attr.aria-label]="'Убрать событие ' + ev">
                  <lucide-icon name="x" [size]="12"></lucide-icon>
                </button>
              </span>
              <button type="button" class="hd-add-btn" (click)="openEventPicker()">
                <lucide-icon name="plus" [size]="14"></lucide-icon>
                Добавить
              </button>
            </div>
          </div>

          <!-- Тип озвучки -->
          <div class="hd-section">
            <span class="hd-label">Тип озвучки</span>
            <div class="hd-seg" role="radiogroup" aria-label="Тип озвучки">
              <button
                type="button"
                class="hd-seg-btn"
                role="radio"
                [attr.aria-checked]="draft.voiceType === 'file'"
                [class.hd-seg-btn--active]="draft.voiceType === 'file'"
                (click)="draft.voiceType = 'file'"
              >
                <lucide-icon name="volume-2" [size]="14"></lucide-icon>
                Стандартный звук
              </button>
              <button
                type="button"
                class="hd-seg-btn"
                role="radio"
                [attr.aria-checked]="draft.voiceType === 'generation'"
                [class.hd-seg-btn--active]="draft.voiceType === 'generation'"
                (click)="draft.voiceType = 'generation'"
              >
                <lucide-icon name="mic" [size]="14"></lucide-icon>
                Генерация голоса
              </button>
            </div>
          </div>

          <!-- Файл -->
          <div class="hd-section" *ngIf="draft.voiceType === 'file'">
            <span class="hd-label">Аудиофайл</span>
            <div class="hd-file">
              <button type="button" class="hd-file-btn" (click)="audioOpen = true">
                <lucide-icon name="file-audio" [size]="15"></lucide-icon>
                {{ draft.fileName ? 'Выбрать другой файл' : 'Выбрать файл' }}
              </button>
              <div class="hd-file-info" *ngIf="draft.fileName">
                <lucide-icon name="file-audio" [size]="15"></lucide-icon>
                <span class="hd-file-name">{{ draft.fileName }}</span>
                <span class="hd-file-size" *ngIf="draft.fileSizeKb">{{ draft.fileSizeKb }} КБ</span>
                <button
                  type="button"
                  class="hd-play"
                  [attr.aria-label]="playingFile ? 'Остановить' : 'Воспроизвести'"
                  (click)="togglePlayFile()"
                >
                  <lucide-icon [name]="playingFile ? 'pause' : 'play'" [size]="15"></lucide-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Генерация -->
          <div class="hd-section" *ngIf="draft.voiceType === 'generation'">
            <div class="hd-label-row">
              <span class="hd-label">Генерация голоса</span>
              <span class="hd-badge hd-badge--pilot">ПИЛОТ</span>
            </div>

            <label class="hd-label hd-label--sub" for="hd-phrase">Шаблон фразы <span class="hd-req">*</span></label>
            <textarea
              id="hd-phrase"
              class="hd-textarea"
              rows="3"
              [(ngModel)]="draft.phraseText"
              placeholder="Введите текст фразы"
            ></textarea>

            <div class="hd-vars">
              <button type="button" class="hd-var-btn" *ngFor="let v of variables" (click)="insertVariable(v.token)">
                {{ v.label }}
              </button>
            </div>

            <div class="hd-gen-row">
              <label class="hd-gen-label" for="hd-voice">Голос</label>
              <select id="hd-voice" class="hd-select" [(ngModel)]="draft.voiceName">
                <option *ngFor="let v of voices" [value]="v">{{ v }}</option>
              </select>

              <span class="hd-badge hd-badge--status" [ngClass]="draft.generationStatus === 'done' ? 'hd-badge--done' : 'hd-badge--pending'">
                {{ draft.generationStatus === 'done' ? 'Готово' : 'Ожидание' }}
              </span>

              <button
                type="button"
                class="hd-play hd-play--bordered"
                [disabled]="draft.generationStatus !== 'done'"
                [attr.aria-label]="playingGen ? 'Остановить' : 'Воспроизвести'"
                (click)="togglePlayGen()"
              >
                <lucide-icon [name]="playingGen ? 'pause' : 'play'" [size]="15"></lucide-icon>
              </button>

              <button
                type="button"
                class="hd-gen-btn"
                [disabled]="!draft.phraseText?.trim()"
                (click)="enqueueGeneration()"
              >
                <lucide-icon name="loader-2" [size]="14"></lucide-icon>
                Озвучить
              </button>
            </div>

            <p class="hd-hint">
              Сгенерированный аудиофайл будет создан автоматически после сохранения обработчика.
              Среднее время обработки — 5–10 минут.
            </p>
          </div>

          <!-- Действия -->
          <div class="hd-section">
            <span class="hd-label">Действия</span>
            <div class="hd-actions">
              <button type="button" class="hd-action-btn" (click)="copy.emit(handler.id)">
                <lucide-icon name="copy" [size]="15"></lucide-icon>
                Копировать
              </button>
              <button
                type="button"
                class="hd-action-btn hd-action-btn--danger"
                [disabled]="isSystem"
                [title]="isSystem ? 'Системные обработчики нельзя удалять' : 'Удалить обработчик'"
                (click)="delete.emit(handler.id)"
              >
                <lucide-icon name="trash-2" [size]="15"></lucide-icon>
                Удалить
              </button>
            </div>
            <p class="hd-hint" *ngIf="isSystem">Системные обработчики можно редактировать и копировать, но нельзя удалять.</p>
          </div>
        </div>

        <!-- Футер -->
        <div class="hd-foot">
          <button type="button" class="hd-foot-btn" (click)="resetDraft()">Сбросить</button>
          <button type="button" class="hd-foot-btn hd-foot-btn--primary" (click)="save.emit(draft)">Сохранить</button>
        </div>
      </ng-container>
    </div>

    <!-- Пикер коллекций -->
    <app-check-list-picker-modal
      [open]="collectionPickerOpen"
      title="Выберите коллекции"
      subtitle="Обработчик может входить в одну или несколько коллекций"
      searchPlaceholder="Поиск коллекции..."
      confirmLabel="Готово"
      [items]="collectionItems"
      [selectedIds]="draft?.collectionIds ?? []"
      (close)="collectionPickerOpen = false"
      (confirm)="onCollectionsConfirmed($event)"
    ></app-check-list-picker-modal>

    <!-- Пикер событий -->
    <app-check-list-picker-modal
      [open]="eventPickerOpen"
      title="Выберите события"
      searchPlaceholder="Поиск..."
      confirmLabel="Готово"
      [items]="eventItems"
      [selectedIds]="draft?.events ?? []"
      (close)="eventPickerOpen = false"
      (confirm)="onEventsConfirmed($event)"
    ></app-check-list-picker-modal>

    <!-- Галерея аудиофайлов -->
    <app-audio-files-modal
      [open]="audioOpen"
      (close)="audioOpen = false"
      (select)="onFileSelected($event)"
    ></app-audio-files-modal>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .hd-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--dt-surface-primary);
      font-family: Roboto, sans-serif;
    }

    .hd-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: var(--dt-text-disable);
    }
    .hd-empty-title { font-size: 15px; font-weight: 500; color: var(--dt-text-secondary); }
    .hd-empty-sub { font-size: 13px; }

    .hd-body { flex: 1; overflow-y: auto; padding: 18px 20px 24px; }

    .hd-head {
      display: flex;
      gap: 12px;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 1px solid #d6d6d6;
    }
    .hd-head-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 4px;
      background: var(--dt-surface-variant);
      color: var(--dt-brand-accent);
      flex-shrink: 0;
    }
    .hd-head-main { flex: 1; min-width: 0; }
    .hd-head-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
    .hd-head-title {
      margin: 0;
      font-size: 17px;
      font-weight: 500;
      color: var(--dt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .hd-head-meta { display: block; margin-top: 3px; font-size: 12.5px; color: var(--dt-text-secondary); }

    .hd-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11.5px;
      font-weight: 500;
      white-space: nowrap;
    }
    .hd-badge--system { background: #f0f5ff; color: #3969d5; }
    .hd-badge--pilot { background: #fff3e0; color: #e65100; }
    .hd-badge--status { background: #fff3e0; color: #e65100; }
    .hd-badge--done { background: #e8f5e9; color: #2e7d32; }
    .hd-badge--pending { background: #fff3e0; color: #e65100; }

    .hd-section { margin-bottom: 18px; }
    .hd-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--dt-text-primary); }
    .hd-label--sub { font-size: 12.5px; color: var(--dt-text-secondary); }
    .hd-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .hd-label-row .hd-label { margin-bottom: 0; }
    .hd-req { color: #d32f2f; }

    .hd-input {
      width: 100%;
      height: 36px;
      padding: 0 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: var(--dt-text-primary);
      outline: none;
      box-sizing: border-box;
    }
    .hd-input:focus { border-color: var(--dt-brand-accent); }

    .hd-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .hd-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      max-width: 100%;
      padding: 4px 6px 4px 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-variant);
      font-size: 12.5px;
      color: var(--dt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .hd-chip--event { background: var(--dt-surface-primary); }
    .hd-chip-x {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-secondary);
      cursor: pointer;
      flex-shrink: 0;
    }
    .hd-chip-x:hover { background: #d6d6d6; color: var(--dt-text-primary); }
    .hd-add-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      height: 28px;
      padding: 0 10px;
      border: 1px dashed #d6d6d6;
      border-radius: 4px;
      background: none;
      color: var(--dt-brand-accent);
      font-family: Roboto, sans-serif;
      font-size: 12.5px;
      cursor: pointer;
    }
    .hd-add-btn:hover { background: #f0f5ff; }
    .hd-add-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }

    .hd-seg {
      display: inline-flex;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      overflow: hidden;
    }
    .hd-seg-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 34px;
      padding: 0 16px;
      border: none;
      background: var(--dt-surface-primary);
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.12s ease;
    }
    .hd-seg-btn + .hd-seg-btn { border-left: 1px solid #d6d6d6; }
    .hd-seg-btn:hover { background: #ebebeb; }
    .hd-seg-btn--active { background: var(--dt-surface-sidebar-selected); color: var(--dt-brand-accent); font-weight: 500; }
    .hd-seg-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: -2px; }

    .hd-file { display: flex; flex-direction: column; gap: 8px; }
    .hd-file-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      align-self: flex-start;
      height: 36px;
      padding: 0 16px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-brand-accent);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .hd-file-btn:hover { background: #f0f5ff; }
    .hd-file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-variant);
      color: var(--dt-text-secondary);
    }
    .hd-file-name { flex: 1; min-width: 0; font-size: 13px; color: var(--dt-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .hd-file-size { font-size: 12px; color: var(--dt-text-disable); }

    .hd-play {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-brand-accent);
      cursor: pointer;
      flex-shrink: 0;
    }
    .hd-play:hover { background: #d6d6d6; }
    .hd-play:disabled { color: #d6d6d6; cursor: default; }
    .hd-play--bordered { border: 1px solid #d6d6d6; }

    .hd-textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      color: var(--dt-text-primary);
      outline: none;
      resize: vertical;
      box-sizing: border-box;
    }
    .hd-textarea:focus { border-color: var(--dt-brand-accent); }

    .hd-vars { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
    .hd-var-btn {
      height: 26px;
      padding: 0 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-variant);
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
      font-size: 12px;
      cursor: pointer;
    }
    .hd-var-btn:hover { background: #ebebeb; }

    .hd-gen-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .hd-gen-label { font-size: 13px; color: var(--dt-text-primary); }
    .hd-select {
      height: 34px;
      padding: 0 8px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      color: var(--dt-text-primary);
      outline: none;
    }
    .hd-select:focus { border-color: var(--dt-brand-accent); }
    .hd-gen-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 34px;
      padding: 0 14px;
      border: none;
      border-radius: 4px;
      background: var(--dt-brand-accent);
      color: var(--dt-text-inverse);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .hd-gen-btn:hover { background: #3969d5; }
    .hd-gen-btn:disabled { background: #d6d6d6; color: var(--dt-text-disable); cursor: default; }

    .hd-hint { margin: 10px 0 0; font-size: 12px; color: var(--dt-text-disable); line-height: 1.5; }

    .hd-actions { display: flex; gap: 10px; }
    .hd-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 36px;
      padding: 0 16px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .hd-action-btn:hover { background: #ebebeb; }
    .hd-action-btn--danger { color: #d32f2f; }
    .hd-action-btn--danger:hover { background: #fdecea; border-color: #d32f2f; }
    .hd-action-btn--danger:disabled { color: #d6d6d6; cursor: default; }
    .hd-action-btn--danger:disabled:hover { background: var(--dt-surface-primary); border-color: #d6d6d6; }
    .hd-action-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }

    .hd-foot {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 20px;
      border-top: 1px solid #d6d6d6;
      background: var(--dt-surface-variant);
    }
    .hd-foot-btn {
      height: 36px;
      padding: 0 20px;
      border-radius: 4px;
      border: 1px solid #d6d6d6;
      background: var(--dt-surface-primary);
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.12s ease;
    }
    .hd-foot-btn:hover { background: #ebebeb; }
    .hd-foot-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
    .hd-foot-btn--primary {
      border: none;
      background: var(--dt-brand-accent);
      color: var(--dt-text-inverse);
    }
    .hd-foot-btn--primary:hover { background: #3969d5; }
  `],
})
export class HandlerDetailPanelComponent implements OnChanges, OnDestroy {
  @Input() handler: DvEventHandler | null = null;
  @Input() collections: DvCollection[] = [];

  @Output() save = new EventEmitter<DvEventHandler>();
  @Output() reset = new EventEmitter<void>();
  @Output() copy = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() enqueue = new EventEmitter<{ handlerId: number; handlerName: string; phraseText: string; voiceName: string }>();

  voices: string[] = ['Светлана', 'Дмитрий'];
  variables = [
    { label: 'Имя гостя', token: '[guest_name]' },
    { label: 'Номер заказа', token: '[order_number]' },
    { label: 'Номер стола', token: '[table_number]' },
  ];

  draft: DvEventHandler | null = null;

  collectionPickerOpen = false;
  eventPickerOpen = false;
  audioOpen = false;
  playingFile = false;
  playingGen = false;
  private playTimers: ReturnType<typeof setTimeout>[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['handler']) {
      this.draft = this.handler ? { ...this.handler, collectionIds: [...this.handler.collectionIds], events: [...this.handler.events] } : null;
    }
  }

  ngOnDestroy(): void {
    this.playTimers.forEach(t => clearTimeout(t));
  }

  get isSystem(): boolean {
    if (!this.handler) return false;
    return this.handler.collectionIds.some(cid => this.collections.find(c => c.id === cid)?.isSystem);
  }

  get prefix(): string {
    return this.isSystem && this.handler ? getSystemHandlerPrefix(this.handler.name) : '';
  }

  get collectionsLine(): string {
    if (!this.handler || this.handler.collectionIds.length === 0) return 'Без коллекции';
    return this.handler.collectionIds.map(cid => this.collectionName(cid)).join(', ');
  }

  collectionName(cid: number): string {
    return this.collections.find(c => c.id === cid)?.name ?? 'Без коллекции';
  }

  /** Для пикера коллекций — только кастомные (системных нет, как на стенде) */
  get collectionItems(): CheckListPickerItem[] {
    return this.collections
      .filter(c => !c.isSystem)
      .map(c => ({ id: c.id, label: c.name }));
  }

  get eventItems(): CheckListPickerItem[] {
    return MOCK_DV_EVENTS.map(e => ({ id: e, label: e }));
  }

  removeCollection(cid: number): void {
    if (!this.draft) return;
    this.draft.collectionIds = this.draft.collectionIds.filter(id => id !== cid);
  }

  removeEvent(ev: string): void {
    if (!this.draft) return;
    this.draft.events = this.draft.events.filter(e => e !== ev);
  }

  openCollectionPicker(): void {
    this.collectionPickerOpen = true;
  }

  openEventPicker(): void {
    this.eventPickerOpen = true;
  }

  onCollectionsConfirmed(ids: (string | number)[]): void {
    if (!this.draft) return;
    this.draft.collectionIds = ids as number[];
  }

  onEventsConfirmed(ids: (string | number)[]): void {
    if (!this.draft) return;
    this.draft.events = ids as string[];
  }

  onFileSelected(file: DvAudioFile): void {
    if (!this.draft) return;
    this.draft.fileName = file.name;
    this.draft.fileSizeKb = file.sizeKb;
  }

  insertVariable(token: string): void {
    if (!this.draft) return;
    this.draft.phraseText = (this.draft.phraseText ?? '') + token;
  }

  togglePlayFile(): void {
    this.playingFile = !this.playingFile;
    if (this.playingFile) {
      this.playTimers.push(setTimeout(() => (this.playingFile = false), 2000));
    }
  }

  togglePlayGen(): void {
    if (this.draft?.generationStatus !== 'done') return;
    this.playingGen = !this.playingGen;
    if (this.playingGen) {
      this.playTimers.push(setTimeout(() => (this.playingGen = false), 2000));
    }
  }

  enqueueGeneration(): void {
    if (!this.draft || !this.handler || !this.draft.phraseText?.trim()) return;
    this.enqueue.emit({
      handlerId: this.handler.id,
      handlerName: this.draft.name,
      phraseText: this.draft.phraseText,
      voiceName: this.draft.voiceName ?? 'Светлана',
    });
  }

  resetDraft(): void {
    this.draft = this.handler ? { ...this.handler, collectionIds: [...this.handler.collectionIds], events: [...this.handler.events] } : null;
    this.reset.emit();
  }
}
