import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { DvAudioFile } from '../../types';
import { MOCK_DV_AUDIO_FILES } from '../../data/mock-data';

/**
 * Модалка «Аудио файлы» (Галерея): поиск, сортировка «По названию»,
 * список файлов (имя / дата / размер), «Выбрать» disabled без выбора.
 */
@Component({
  selector: 'app-audio-files-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="af-backdrop" *ngIf="open" (click)="close.emit()" role="presentation"></div>

    <div class="af-modal" *ngIf="open" role="dialog" aria-modal="true" aria-label="Файлы">
      <div class="af-head">
        <button type="button" class="af-back-btn" disabled aria-label="Назад">
          <lucide-icon name="arrow-left" [size]="18"></lucide-icon>
        </button>
        <div class="af-head-text">
          <h3 class="af-title">Файлы</h3>
        </div>
        <button type="button" class="af-close" (click)="close.emit()" aria-label="Закрыть">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="af-toolbar">
        <div class="af-search">
          <lucide-icon name="search" [size]="14"></lucide-icon>
          <input type="text" [(ngModel)]="search" placeholder="Поиск" aria-label="Поиск аудиофайлов" />
        </div>

        <div class="af-sort">
          <lucide-icon name="arrow-up" [size]="14"></lucide-icon>
          <span>По названию</span>
          <lucide-icon name="chevron-down" [size]="14"></lucide-icon>
        </div>

        <button type="button" class="af-view-btn" aria-label="Список">
          <lucide-icon name="list" [size]="16"></lucide-icon>
        </button>
      </div>

      <div class="af-list">
        <div class="af-empty" *ngIf="filteredFiles.length === 0">
          <lucide-icon name="file-audio" [size]="20"></lucide-icon>
          <span>Ничего не найдено</span>
        </div>

        <button
          type="button"
          class="af-row"
          *ngFor="let f of filteredFiles"
          [class.af-row--selected]="selectedId === f.id"
          (click)="selectedId = f.id"
        >
          <lucide-icon class="af-row-icon" name="file-audio" [size]="18"></lucide-icon>
          <span class="af-row-main">
            <span class="af-row-name">{{ f.name }}</span>
            <span class="af-row-meta">{{ f.date }}</span>
          </span>
          <span class="af-row-size">{{ f.sizeKb }} КБ</span>
          <span class="af-row-actions" (click)="$event.stopPropagation()">
            <button type="button" class="af-row-action" aria-label="Редактировать" (click)="editFile.emit(f)">
              <lucide-icon name="pencil" [size]="14"></lucide-icon>
            </button>
            <button type="button" class="af-row-action" aria-label="Удалить" (click)="deleteFile.emit(f)">
              <lucide-icon name="trash-2" [size]="14"></lucide-icon>
            </button>
          </span>
        </button>
      </div>

      <div class="af-foot">
        <button type="button" class="af-btn" (click)="close.emit()">Отмена</button>
        <button type="button" class="af-btn af-btn--primary" [disabled]="selectedId === null" (click)="confirmSelection()">
          Выбрать
        </button>
      </div>
    </div>
  `,
  styles: [`
    .af-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(33, 33, 33, 0.32);
      z-index: 150;
    }
    .af-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 560px;
      max-width: 94vw;
      max-height: 84vh;
      display: flex;
      flex-direction: column;
      background: var(--dt-surface-primary);
      border-radius: 4px;
      box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.6), 0 8px 10px rgba(214, 214, 214, 0.6);
      z-index: 151;
      font-family: Roboto, sans-serif;
      animation: af-in 0.16s ease-out;
      overflow: hidden;
    }
    @keyframes af-in {
      from { opacity: 0; transform: translate(-50%, -46%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }

    .af-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid #d6d6d6;
    }
    .af-head-text { flex: 1; min-width: 0; }
    .af-title { margin: 0; font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
    .af-back-btn, .af-close {
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
    .af-back-btn:disabled { color: #d6d6d6; cursor: default; }
    .af-close:hover { background: #ebebeb; }
    .af-close:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }

    .af-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px 4px;
    }
    .af-search {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
      height: 36px;
      padding: 0 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      color: var(--dt-text-secondary);
    }
    .af-search:focus-within { border-color: var(--dt-brand-accent); }
    .af-search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      color: var(--dt-text-primary);
    }
    .af-search input::placeholder { color: var(--dt-text-disable); }

    .af-sort {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 10px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      font-size: 13px;
      color: var(--dt-text-primary);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
    .af-sort:hover { background: #ebebeb; }
    .af-view-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-secondary);
      cursor: pointer;
    }
    .af-view-btn:hover { background: #ebebeb; }

    .af-list {
      flex: 1;
      overflow-y: auto;
      min-height: 200px;
      max-height: 380px;
      margin: 10px 16px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
    }
    .af-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px;
      color: var(--dt-text-disable);
      font-size: 13px;
    }
    .af-row {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border: none;
      border-bottom: 1px solid #f0f0f0;
      background: none;
      text-align: left;
      cursor: pointer;
      font-family: Roboto, sans-serif;
      transition: background 0.1s ease;
    }
    .af-row:last-child { border-bottom: none; }
    .af-row:hover { background: #ebebeb; }
    .af-row--selected { background: var(--dt-surface-sidebar-selected); box-shadow: inset 2px 0 0 var(--dt-brand-accent); }
    .af-row:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: -2px; }
    .af-row-icon { color: var(--dt-text-secondary); flex-shrink: 0; }
    .af-row--selected .af-row-icon { color: var(--dt-brand-accent); }
    .af-row-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .af-row-name {
      font-size: 13.5px;
      color: var(--dt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .af-row-meta { font-size: 11.5px; color: var(--dt-text-disable); }
    .af-row-size { font-size: 12px; color: var(--dt-text-secondary); flex-shrink: 0; }
    .af-row-actions { display: flex; gap: 2px; flex-shrink: 0; }
    .af-row-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-secondary);
      cursor: pointer;
    }
    .af-row-action:hover { background: #d6d6d6; color: var(--dt-text-primary); }

    .af-foot {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 12px 16px;
      border-top: 1px solid #d6d6d6;
    }
    .af-btn {
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
    .af-btn:hover { background: #ebebeb; }
    .af-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
    .af-btn--primary {
      border: none;
      background: var(--dt-brand-accent);
      color: var(--dt-text-inverse);
    }
    .af-btn--primary:hover { background: #3969d5; }
    .af-btn--primary:disabled {
      background: #d6d6d6;
      color: var(--dt-text-disable);
      cursor: default;
    }
  `],
})
export class AudioFilesModalComponent implements OnChanges {
  @Input() open = false;

  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<DvAudioFile>();
  @Output() editFile = new EventEmitter<DvAudioFile>();
  @Output() deleteFile = new EventEmitter<DvAudioFile>();

  files: DvAudioFile[] = MOCK_DV_AUDIO_FILES;
  search = '';
  selectedId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.search = '';
      this.selectedId = null;
    }
  }

  get filteredFiles(): DvAudioFile[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.files;
    return this.files.filter(f => f.name.toLowerCase().includes(q));
  }

  confirmSelection(): void {
    const file = this.files.find(f => f.id === this.selectedId);
    if (file) {
      this.select.emit(file);
    }
    this.close.emit();
  }
}
