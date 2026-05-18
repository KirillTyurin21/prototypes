import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { SoundCollection, SoundEventHandler } from '../../types';
import { SYSTEM_EVENTS, AVAILABLE_VOICES } from '../../data/mock-data';

export interface HandlerFormData {
  name: string;
  collectionIds: number[];
  events: string[];
  voiceType: 'file' | 'generation';
  fileName: string;
  voiceName: string;
  phraseText: string;
}

@Component({
  selector: 'app-event-handler-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="handler-form-page">
      <div class="handler-form-container">
        <h1 class="page-title">{{ editingHandler ? 'Редактировать обработчик' : 'Создать обработчик' }}</h1>

        <div class="form-section">
          <label class="form-label">Название обработчика *</label>
          <input class="form-input" type="text" [(ngModel)]="formData.name" placeholder="Введите название" />
        </div>

        <div class="form-section">
          <label class="form-label">Коллекции</label>
          <div class="form-dropdown-wrap">
            <div class="form-dropdown-trigger" (click)="showCollectionDropdown = !showCollectionDropdown">
              <span class="form-dropdown-text">{{ getSelectedCollectionsText() }}</span>
              <lucide-icon name="chevron-down" [size]="16" class="dropdown-chevron" [class.dropdown-chevron-open]="showCollectionDropdown"></lucide-icon>
            </div>
            <div class="form-dropdown-content" *ngIf="showCollectionDropdown">
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
        </div>

        <div class="form-section">
          <label class="form-label">Выберите события</label>
          <div class="form-dropdown-wrap">
            <div class="form-dropdown-trigger" (click)="showEventsDropdown = !showEventsDropdown">
              <span class="form-dropdown-text">{{ getSelectedEventsText() }}</span>
              <lucide-icon name="chevron-down" [size]="16" class="dropdown-chevron" [class.dropdown-chevron-open]="showEventsDropdown"></lucide-icon>
            </div>
            <div class="form-dropdown-content" *ngIf="showEventsDropdown">
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
        </div>

        <div class="form-section">
          <label class="form-label">Тип озвучки</label>
          <div class="voice-type-toggle">
            <button class="toggle-btn" [class.toggle-active]="formData.voiceType === 'file'" (click)="formData.voiceType = 'file'">
              <lucide-icon name="file-audio" [size]="16"></lucide-icon>
              Стандартный звук
            </button>
            <button class="toggle-btn" [class.toggle-active]="formData.voiceType === 'generation'" (click)="formData.voiceType = 'generation'">
              <lucide-icon name="mic" [size]="16"></lucide-icon>
              Генерация голоса
            </button>
          </div>
        </div>

        <!-- File upload (standard) -->
        <div class="form-section" *ngIf="formData.voiceType === 'file'">
          <label class="form-label">Файл</label>
          <div class="file-row">
            <button class="app-btn app-btn-primary" (click)="pickFile()">
              <lucide-icon name="upload" [size]="16"></lucide-icon>
              ВЫБРАТЬ ФАЙЛ
            </button>
            <span class="file-name" *ngIf="formData.fileName">{{ formData.fileName }}</span>
          </div>
        </div>

        <!-- Voice generation fields -->
        <ng-container *ngIf="formData.voiceType === 'generation'">
          <div class="form-section">
            <label class="form-label">Голос</label>
            <div class="voice-select-row">
              <select class="form-input voice-select" [(ngModel)]="formData.voiceName">
                <option value="">Выберите голос</option>
                <option *ngFor="let v of availableVoices" [value]="v">{{ v }}</option>
              </select>
              <button class="app-btn app-btn-ghost play-btn" (click)="previewVoice()" title="Прослушать образец голоса"
                      [disabled]="!formData.voiceName">
                <lucide-icon name="play" [size]="16"></lucide-icon>
                Прослушать
              </button>
            </div>
          </div>

          <div class="form-section">
            <label class="form-label">Текст фразы</label>
            <textarea class="form-textarea" rows="3" #phraseInput
                      [(ngModel)]="formData.phraseText"
                      placeholder="Например: Заказ [order_number] готов к выдаче"></textarea>
            <div class="variable-chips">
              <span class="variable-chip-label">Переменные:</span>
              <button class="variable-chip" (click)="insertVariable('[order_number]', phraseInput)" title="Номер заказа">[order_number]</button>
              <button class="variable-chip" (click)="insertVariable('[name]', phraseInput)" title="Имя гостя">[name]</button>
            </div>
            <span class="form-hint">Используйте переменные для подстановки данных заказа</span>
          </div>

          <!-- Generation status (when editing existing handler) -->
          <div class="form-section" *ngIf="editingHandler && editingHandler.generationStatus">
            <label class="form-label">Статус генерации</label>
            <div class="generation-status-row">
              <span class="queue-status-badge"
                    [class.status-waiting]="editingHandler.generationStatus === 'pending'"
                    [class.status-generating]="editingHandler.generationStatus === 'generating'"
                    [class.status-done]="editingHandler.generationStatus === 'done'">
                {{ getGenerationStatusText(editingHandler.generationStatus) }}
              </span>
              <button class="app-btn app-btn-ghost play-btn" *ngIf="editingHandler.generationStatus === 'done'"
                      (click)="onPlayHandler()">
                <lucide-icon name="play" [size]="16"></lucide-icon> Проиграть
              </button>
            </div>
          </div>
        </ng-container>

        <div class="form-actions">
          <button class="app-btn app-btn-primary" (click)="save()">СОХРАНИТЬ</button>
          <button class="app-btn app-btn-ghost" (click)="cancel.emit()">ОТМЕНА</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .handler-form-page { animation: fadeIn 0.2s ease-out; }
    .handler-form-container { max-width: 640px; }
    .page-title {
      font-size: 24px; font-weight: 500; color: #212121;
      margin: 0 0 24px; font-family: Roboto, sans-serif;
    }
    .form-section { margin-bottom: 24px; }
    .form-label {
      display: block; font-size: 13px; font-weight: 500;
      color: #757575; margin-bottom: 6px; font-family: Roboto, sans-serif;
    }
    .form-input {
      display: block; width: 100%; height: 40px; padding: 0 12px;
      border: 1px solid #bdbdbd; border-radius: 4px; font-size: 14px;
      font-family: Roboto, sans-serif; color: #212121; background: #fff;
      box-sizing: border-box;
    }
    .form-input:focus { outline: none; border-color: #448aff; }

    .form-dropdown-wrap { position: relative; }
    .form-dropdown-trigger {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; border: 1px solid #bdbdbd; border-radius: 4px;
      min-height: 40px; background: #fff; cursor: pointer; box-sizing: border-box;
    }
    .form-dropdown-trigger:hover { border-color: #9e9e9e; }
    .form-dropdown-text {
      font-size: 14px; color: #424242; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap; flex: 1;
      font-family: Roboto, sans-serif;
    }
    .form-dropdown-content {
      border: 1px solid #bdbdbd; border-top: none; border-radius: 0 0 4px 4px;
      max-height: 220px; overflow-y: auto; background: #fff;
    }
    .dropdown-chevron { color: #757575; transition: transform 0.2s; }
    .dropdown-chevron-open { transform: rotate(180deg); }
    .checkbox-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      cursor: pointer; font-size: 14px; color: #424242; font-family: Roboto, sans-serif;
    }
    .checkbox-row:hover { background: #f5f5f5; }
    .checkbox-row input[type="checkbox"] { width: 18px; height: 18px; accent-color: #448aff; cursor: pointer; }

    .search-box {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-bottom: 1px solid #e0e0e0; color: #9e9e9e;
    }
    .search-input {
      border: none; outline: none; font-size: 14px;
      font-family: Roboto, sans-serif; flex: 1; color: #212121;
    }

    .file-row { display: flex; align-items: center; gap: 12px; }
    .file-name { font-size: 14px; color: #424242; }

    .voice-type-toggle {
      display: flex; gap: 0; border: 1px solid #bdbdbd;
      border-radius: 4px; overflow: hidden;
    }
    .toggle-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
      border: none; background: #fff; color: #757575; font-size: 14px;
      font-family: Roboto, sans-serif; cursor: pointer; flex: 1;
      justify-content: center; transition: background 0.15s, color 0.15s;
    }
    .toggle-btn:first-child { border-right: 1px solid #bdbdbd; }
    .toggle-btn:hover { background: #f5f5f5; }
    .toggle-active { background: #448aff !important; color: #fff !important; }

    .voice-select-row { display: flex; gap: 8px; align-items: center; }
    .voice-select { flex: 1; }
    .play-btn { color: #448aff !important; white-space: nowrap; }
    .play-btn:disabled { color: #bdbdbd !important; }

    .form-textarea {
      display: block; width: 100%; padding: 10px 12px;
      border: 1px solid #bdbdbd; border-radius: 4px; font-size: 14px;
      font-family: Roboto, sans-serif; color: #212121; background: #fff;
      box-sizing: border-box; resize: vertical; min-height: 80px;
    }
    .form-textarea:focus { outline: none; border-color: #448aff; }
    .form-hint {
      display: block; margin-top: 6px; font-size: 12px;
      color: #9e9e9e; font-family: Roboto, sans-serif;
    }

    .variable-chips { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
    .variable-chip {
      display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px;
      border: 1px solid #e0e0e0; border-radius: 16px; background: #f5f5f5;
      cursor: pointer; font-size: 12px; color: #616161; transition: all 0.15s;
    }
    .variable-chip:hover { background: #e3f2fd; border-color: #90caf9; color: #1565c0; }
    .variable-chip-label { font-size: 11px; color: #9e9e9e; }

    .generation-status-row {
      display: flex; align-items: center; gap: 8px; margin-top: 12px;
      padding: 8px 12px; background: #f5f5f5; border-radius: 8px; font-size: 13px;
    }
    .queue-status-badge {
      display: inline-block; padding: 2px 8px; border-radius: 12px;
      font-size: 12px; font-weight: 500; white-space: nowrap;
    }
    .status-waiting { background: #fff3e0; color: #e65100; }
    .status-generating { background: #e3f2fd; color: #1565c0; }
    .status-done { background: #e8f5e9; color: #2e7d32; }

    .form-actions { display: flex; gap: 8px; margin-top: 32px; }

    .app-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 0 16px;
      height: 36px; border: none; border-radius: 4px; font-size: 14px;
      font-weight: 500; cursor: pointer; font-family: Roboto, sans-serif; white-space: nowrap;
    }
    .app-btn:disabled { opacity: 0.5; cursor: default; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover:not(:disabled) { background: #2979ff; }
    .app-btn-ghost { background: transparent; color: #757575; }
    .app-btn-ghost:hover { background: #f5f5f5; }
  `],
})
export class EventHandlerFormComponent {
  @Input() collections: SoundCollection[] = [];
  @Input() editingHandler: SoundEventHandler | null = null;
  @Input() formData: HandlerFormData = this.emptyForm();
  @Output() saved = new EventEmitter<HandlerFormData>();
  @Output() cancel = new EventEmitter<void>();
  @Output() playHandler = new EventEmitter<SoundEventHandler>();

  availableVoices = AVAILABLE_VOICES;
  eventSearch = '';
  allCollectionsSelected = false;
  allEventsSelected = false;
  showCollectionDropdown = false;
  showEventsDropdown = false;

  ngOnChanges(): void {
    this.syncAllToggles();
  }

  // ── Events multi-select ─────────────────────────────

  get filteredEvents(): string[] {
    const q = this.eventSearch.toLowerCase().trim();
    if (!q) return SYSTEM_EVENTS;
    return SYSTEM_EVENTS.filter(e => e.toLowerCase().includes(q));
  }

  toggleEvent(event: string): void {
    const idx = this.formData.events.indexOf(event);
    if (idx >= 0) {
      this.formData.events.splice(idx, 1);
    } else {
      this.formData.events.push(event);
    }
    this.syncAllToggles();
  }

  toggleAllEvents(): void {
    if (this.allEventsSelected) {
      this.formData.events = [];
    } else {
      this.formData.events = [...SYSTEM_EVENTS];
    }
    this.syncAllToggles();
  }

  isEventSelected(event: string): boolean {
    return this.formData.events.includes(event);
  }

  // ── Collections multi-select ────────────────────────

  toggleCollectionSelection(id: number): void {
    const idx = this.formData.collectionIds.indexOf(id);
    if (idx >= 0) {
      this.formData.collectionIds.splice(idx, 1);
    } else {
      this.formData.collectionIds.push(id);
    }
    this.syncAllToggles();
  }

  toggleAllCollections(): void {
    if (this.allCollectionsSelected) {
      this.formData.collectionIds = [];
    } else {
      this.formData.collectionIds = this.collections.map(c => c.id);
    }
    this.syncAllToggles();
  }

  isCollectionSelected(id: number): boolean {
    return this.formData.collectionIds.includes(id);
  }

  getSelectedCollectionsText(): string {
    if (this.formData.collectionIds.length === 0) return 'Выберите коллекции';
    if (this.allCollectionsSelected) return 'Все';
    const names = this.formData.collectionIds
      .map((id: number) => this.collections.find(c => c.id === id))
      .filter(Boolean)
      .map((c: any) => c!.name);
    return names.join(', ');
  }

  getSelectedEventsText(): string {
    if (this.formData.events.length === 0) return 'Выберите события';
    if (this.allEventsSelected) return 'Все';
    if (this.formData.events.length <= 2) return this.formData.events.join(', ');
    return `Выбрано: ${this.formData.events.length}`;
  }

  // ── Helpers ─────────────────────────────────────────

  pickFile(): void {
    this.formData.fileName = 'sound_' + Date.now() + '.mp3';
  }

  previewVoice(): void {
    alert('▶ Воспроизведение образца голоса: ' + this.formData.voiceName);
  }

  getGenerationStatusText(status: string | undefined): string {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'generating': return 'Генерируется';
      case 'done': return 'Готово';
      default: return '—';
    }
  }

  onPlayHandler(): void {
    if (this.editingHandler) {
      this.playHandler.emit(this.editingHandler);
    }
  }

  insertVariable(variable: string, textarea: HTMLTextAreaElement): void {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.formData.phraseText;
    this.formData.phraseText = text.substring(0, start) + variable + text.substring(end);
    setTimeout(() => {
      const pos = start + variable.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  }

  save(): void {
    if (!this.formData.name.trim()) return;
    this.saved.emit(this.formData);
  }

  private syncAllToggles(): void {
    this.allEventsSelected = SYSTEM_EVENTS.length > 0 && this.formData.events.length === SYSTEM_EVENTS.length;
    this.allCollectionsSelected = this.collections.length > 0 && this.formData.collectionIds.length === this.collections.length;
  }

  private emptyForm(): HandlerFormData {
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
