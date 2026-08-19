import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { DvCollection, DvAudioFile, DvEventHandler, CheckListPickerItem } from '../../types';
import { MOCK_DV_EVENTS } from '../../data/mock-data';
import { CheckListPickerModalComponent } from './check-list-picker-modal.component';
import { AudioFilesModalComponent } from './audio-files-modal.component';

/** Данные нового обработчика, собираемые модалкой */
export interface HandlerCreateData {
  name: string;
  collectionIds: number[];
  events: string[];
  voiceType: 'file' | 'generation';
  fileName?: string;
  fileSizeKb?: number;
  voiceName?: string;
  phraseText?: string;
}

/**
 * Модалка «Создать обработчик» — реплика стенда:
 * название*, коллекции, события, тип озвучки, файл / генерация.
 */
@Component({
  selector: 'app-handler-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CheckListPickerModalComponent, AudioFilesModalComponent],
  template: `
    <div class="hc-backdrop" *ngIf="open" (click)="close.emit()" role="presentation"></div>

    <div class="hc-modal" *ngIf="open" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <div class="hc-head">
        <h3 class="hc-title">{{ title }}</h3>
        <button type="button" class="hc-close" (click)="close.emit()" aria-label="Закрыть">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="hc-body">
        <!-- Название -->
        <div class="hc-field">
          <label class="hc-label" for="hc-name">Название обработчика <span class="hc-req">*</span></label>
          <input id="hc-name" type="text" class="hc-input" [(ngModel)]="model.name" placeholder="Введите название" />
        </div>

        <!-- Коллекции -->
        <div class="hc-field">
          <span class="hc-label">Коллекции</span>
          <div class="hc-chips">
            <span class="hc-chip" *ngFor="let cid of model.collectionIds">
              {{ collectionName(cid) }}
              <button type="button" class="hc-chip-x" (click)="removeCollection(cid)" [attr.aria-label]="'Убрать ' + collectionName(cid)">
                <lucide-icon name="x" [size]="12"></lucide-icon>
              </button>
            </span>
            <button type="button" class="hc-pick" (click)="collectionPickerOpen = true">
              {{ model.collectionIds.length === 0 ? 'Выбрать' : 'Добавить' }}
              <lucide-icon name="chevron-down" [size]="13"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- События -->
        <div class="hc-field">
          <span class="hc-label">Выберите события</span>
          <div class="hc-chips">
            <span class="hc-chip hc-chip--event" *ngFor="let ev of model.events">
              {{ ev }}
              <button type="button" class="hc-chip-x" (click)="removeEvent(ev)" [attr.aria-label]="'Убрать ' + ev">
                <lucide-icon name="x" [size]="12"></lucide-icon>
              </button>
            </span>
            <button type="button" class="hc-pick" (click)="eventPickerOpen = true">
              {{ model.events.length === 0 ? 'Выбрать' : 'Добавить' }}
              <lucide-icon name="chevron-down" [size]="13"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Тип озвучки -->
        <div class="hc-field">
          <label class="hc-label" for="hc-voice-type">Тип озвучки</label>
          <div class="hc-combobox">
            <select id="hc-voice-type" class="hc-select" [(ngModel)]="model.voiceType">
              <option value="file">Файл</option>
              <option value="generation">Генерация</option>
            </select>
            <lucide-icon name="chevron-down" [size]="16" class="hc-combobox-chevron"></lucide-icon>
          </div>
        </div>

        <!-- Файл -->
        <div class="hc-field" *ngIf="model.voiceType === 'file'">
          <button type="button" class="hc-file-btn" (click)="audioOpen = true">
            <lucide-icon name="file-audio" [size]="15"></lucide-icon>
            {{ model.fileName ? 'Изменить файл' : 'Выбрать файл' }}
          </button>
          <span class="hc-file-name" *ngIf="model.fileName">{{ model.fileName }}</span>
        </div>

        <!-- Генерация -->
        <ng-container *ngIf="model.voiceType === 'generation'">
          <div class="hc-field">
            <label class="hc-label" for="hc-phrase">Шаблон фразы</label>
            <textarea
              id="hc-phrase"
              class="hc-textarea"
              rows="3"
              [(ngModel)]="model.phraseText"
              placeholder="Введите текст фразы"
            ></textarea>
            <div class="hc-vars">
              <button type="button" class="hc-var-btn" *ngFor="let v of variables" (click)="insertVariable(v.token)">
                {{ v.label }}
              </button>
            </div>
          </div>

          <div class="hc-field hc-field--row">
            <label class="hc-label" for="hc-voice">Голос</label>
            <select id="hc-voice" class="hc-select" [(ngModel)]="model.voiceName">
              <option *ngFor="let v of voices" [value]="v">{{ v }}</option>
            </select>
            <span class="hc-status">Статус: Ожидание</span>
            <button type="button" class="hc-play" disabled aria-label="Воспроизвести (недоступно)">
              <lucide-icon name="play" [size]="15"></lucide-icon>
              Воспроизвести
            </button>
          </div>

          <p class="hc-hint">Сгенерированный аудиофайл будет создан автоматически после сохранения обработчика.</p>
        </ng-container>
      </div>

      <div class="hc-foot">
        <button type="button" class="hc-btn" (click)="close.emit()">Отмена</button>
        <button
          type="button"
          class="hc-btn hc-btn--primary"
          [disabled]="!model.name.trim()"
          (click)="submit()"
        >
          Сохранить
        </button>
      </div>
    </div>

    <!-- Пикер коллекций -->
    <app-check-list-picker-modal
      [open]="collectionPickerOpen"
      title="Выберите коллекции"
      searchPlaceholder="Поиск коллекции..."
      confirmLabel="Готово"
      [items]="collectionItems"
      [selectedIds]="model.collectionIds"
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
      [selectedIds]="model.events"
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
    .hc-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(33, 33, 33, 0.32);
      z-index: 160;
    }
    .hc-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 560px;
      max-width: 94vw;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      background: var(--dt-surface-primary);
      border-radius: 4px;
      box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.6), 0 8px 10px rgba(214, 214, 214, 0.6);
      z-index: 161;
      font-family: Roboto, sans-serif;
      animation: hc-in 0.16s ease-out;
      overflow: hidden;
    }
    @keyframes hc-in {
      from { opacity: 0; transform: translate(-50%, -46%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }

    .hc-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #d6d6d6;
    }
    .hc-title { margin: 0; font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
    .hc-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-secondary);
      cursor: pointer;
    }
    .hc-close:hover { background: #ebebeb; }
    .hc-close:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }

    .hc-body { flex: 1; overflow-y: auto; padding: 16px; }
    .hc-field { margin-bottom: 14px; }
    .hc-field--row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
    .hc-field--row .hc-label { margin-bottom: 0; }
    .hc-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: var(--dt-text-primary); }
    .hc-req { color: #d32f2f; }

    .hc-input {
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
    .hc-input:focus { border-color: var(--dt-brand-accent); }

    .hc-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
    .hc-chip {
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
    .hc-chip--event { background: var(--dt-surface-primary); }
    .hc-chip-x {
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
    .hc-chip-x:hover { background: #d6d6d6; color: var(--dt-text-primary); }
    .hc-pick {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      height: 28px;
      padding: 0 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-brand-accent);
      font-family: Roboto, sans-serif;
      font-size: 12.5px;
      cursor: pointer;
    }
    .hc-pick:hover { background: #f0f5ff; }

    .hc-seg {
      display: inline-flex;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      overflow: hidden;
    }
    .hc-seg-btn {
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
    .hc-seg-btn + .hc-seg-btn { border-left: 1px solid #d6d6d6; }
    .hc-seg-btn:hover { background: #ebebeb; }
    .hc-seg-btn--active { background: var(--dt-surface-sidebar-selected); color: var(--dt-brand-accent); font-weight: 500; }
    .hc-pilot {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 8px;
      background: #fff3e0;
      color: #e65100;
      font-size: 10.5px;
      font-weight: 500;
    }

    .hc-combobox { position: relative; display: inline-block; }
    .hc-combobox .hc-select {
      appearance: none;
      -webkit-appearance: none;
      height: 36px;
      min-width: 160px;
      padding: 0 32px 0 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: var(--dt-text-primary);
      outline: none;
      cursor: pointer;
    }
    .hc-combobox .hc-select:focus { border-color: var(--dt-brand-accent); }
    .hc-combobox-chevron {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      color: var(--dt-text-secondary);
      pointer-events: none;
    }

    .hc-file-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
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
      text-transform: uppercase;
    }
    .hc-file-btn:hover { background: #f0f5ff; }
    .hc-file-name { margin-left: 10px; font-size: 13px; color: var(--dt-text-primary); }

    .hc-textarea {
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
    .hc-textarea:focus { border-color: var(--dt-brand-accent); }
    .hc-vars { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .hc-var-btn {
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
    .hc-var-btn:hover { background: #ebebeb; }

    .hc-select {
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
    .hc-select:focus { border-color: var(--dt-brand-accent); }
    .hc-status { font-size: 12.5px; color: var(--dt-text-secondary); }
    .hc-play {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 32px;
      padding: 0 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: #d6d6d6;
      font-family: Roboto, sans-serif;
      font-size: 12.5px;
      cursor: default;
    }

    .hc-hint { margin: 2px 0 0; font-size: 12px; color: var(--dt-text-disable); line-height: 1.5; }

    .hc-foot {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 16px;
      border-top: 1px solid #d6d6d6;
    }
    .hc-btn {
      height: 36px;
      padding: 0 18px;
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
    .hc-btn:hover { background: #ebebeb; }
    .hc-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
    .hc-btn--primary {
      border: none;
      background: var(--dt-brand-accent);
      color: var(--dt-text-inverse);
    }
    .hc-btn--primary:hover { background: #3969d5; }
    .hc-btn--primary:disabled {
      background: #d6d6d6;
      color: var(--dt-text-disable);
      cursor: default;
    }
  `],
})
export class HandlerCreateModalComponent implements OnChanges {
  @Input() open = false;
  @Input() collections: DvCollection[] = [];
  @Input() editingHandler: DvEventHandler | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<HandlerCreateData>();

  model: HandlerCreateData = this.freshModel();
  voices: string[] = ['Светлана', 'Дмитрий'];
  variables = [
    { label: 'Имя гостя', token: '[guest_name]' },
    { label: 'Номер заказа', token: '[order_number]' },
    { label: 'Номер стола', token: '[table_number]' },
  ];

  collectionPickerOpen = false;
  eventPickerOpen = false;
  audioOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.model = this.editingHandler ? this.modelFromHandler(this.editingHandler) : this.freshModel();
    }
  }

  get title(): string {
    return this.editingHandler ? 'Редактировать обработчик' : 'Создать обработчик';
  }

  private freshModel(): HandlerCreateData {
    return {
      name: '',
      collectionIds: [],
      events: [],
      voiceType: 'file',
      voiceName: 'Светлана',
      phraseText: '',
    };
  }

  private modelFromHandler(h: DvEventHandler): HandlerCreateData {
    return {
      name: h.name,
      collectionIds: [...h.collectionIds],
      events: [...h.events],
      voiceType: h.voiceType,
      fileName: h.fileName,
      fileSizeKb: h.fileSizeKb,
      voiceName: h.voiceName ?? 'Светлана',
      phraseText: h.phraseText ?? '',
    };
  }

  /** В пикере коллекций — только кастомные (системных нет, как на стенде) */
  get collectionItems(): CheckListPickerItem[] {
    return this.collections
      .filter(c => !c.isSystem)
      .map(c => ({ id: c.id, label: c.name }));
  }

  get eventItems(): CheckListPickerItem[] {
    return MOCK_DV_EVENTS.map(e => ({ id: e, label: e }));
  }

  collectionName(cid: number): string {
    return this.collections.find(c => c.id === cid)?.name ?? 'Без коллекции';
  }

  removeCollection(cid: number): void {
    this.model.collectionIds = this.model.collectionIds.filter(id => id !== cid);
  }

  removeEvent(ev: string): void {
    this.model.events = this.model.events.filter(e => e !== ev);
  }

  onCollectionsConfirmed(ids: (string | number)[]): void {
    this.model.collectionIds = ids as number[];
  }

  onEventsConfirmed(ids: (string | number)[]): void {
    this.model.events = ids as string[];
  }

  onFileSelected(file: DvAudioFile): void {
    this.model.fileName = file.name;
    this.model.fileSizeKb = file.sizeKb;
  }

  insertVariable(token: string): void {
    this.model.phraseText = (this.model.phraseText ?? '') + token;
  }

  submit(): void {
    if (!this.model.name.trim()) return;
    this.create.emit({ ...this.model, name: this.model.name.trim() });
    this.close.emit();
  }
}
