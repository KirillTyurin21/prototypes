import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { SoundFolder, SoundFile } from '../types';
import { MOCK_SOUND_FOLDERS, AVAILABLE_VOICES } from '../data/mock-data';

@Component({
  selector: 'app-sounds-catalog-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="catalog-screen">
      <!-- ═══ LEFT SIDEBAR: voice tree ═══ -->
      <aside class="sidebar">
        <div class="sidebar-header">Голоса</div>

        <div class="voice-group" *ngFor="let voice of voiceNames">
          <div class="voice-name" (click)="toggleVoice(voice)">
            <lucide-icon
              [name]="expandedVoices[voice] ? 'chevron-down' : 'chevron-right'"
              [size]="16"
              class="chevron-icon"
            ></lucide-icon>
            <lucide-icon name="user" [size]="16" class="voice-icon"></lucide-icon>
            <span>{{ voice }}</span>
          </div>

          <div class="voice-children" *ngIf="expandedVoices[voice]">
            <div
              *ngFor="let folder of getFoldersForVoice(voice)"
              class="folder-item"
              [class.folder-item-active]="selectedFolderId === folder.id"
              (click)="selectFolder(folder)"
            >
              <lucide-icon
                [name]="folder.category === 'numbers' ? 'hash' : 'message-square'"
                [size]="14"
                class="folder-icon"
              ></lucide-icon>
              <span class="folder-label">{{ folder.label }}</span>
              <span class="folder-count">({{ folder.totalCount }})</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- ═══ RIGHT CONTENT ═══ -->
      <main class="content">
        <!-- Empty state -->
        <div class="empty-state" *ngIf="!selectedFolder">
          <lucide-icon name="folder-open" [size]="48" class="empty-icon"></lucide-icon>
          <p class="empty-text">Выберите папку для просмотра файлов</p>
        </div>

        <!-- Folder content -->
        <div class="folder-content" *ngIf="selectedFolder">
          <div class="folder-header">
            <div class="folder-title-row">
              <h2 class="folder-title">{{ selectedFolder.voiceName }} — {{ selectedFolder.label }}</h2>
              <span class="file-count-badge">{{ selectedFolder.files.length }} файлов</span>
            </div>

            <!-- Progress bar for numbers folders -->
            <div class="progress-section" *ngIf="selectedFolder.category === 'numbers'">
              <div class="progress-info">
                <span class="progress-label">Сгенерировано:</span>
                <span class="progress-value">
                  {{ selectedFolder.generatedCount | number }} / {{ selectedFolder.totalCount | number }}
                </span>
                <span class="progress-percent">({{ getProgressPercent(selectedFolder) }}%)</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  [style.width.%]="getProgressPercent(selectedFolder)"
                  [class.progress-complete]="selectedFolder.generatedCount >= selectedFolder.totalCount"
                ></div>
              </div>
            </div>
          </div>

          <!-- Files table -->
          <div class="table-wrap" *ngIf="selectedFolder.files.length > 0">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="th-file">Файл</th>
                  <th class="th-duration">Длительность</th>
                  <th class="th-date">Дата создания</th>
                  <th class="th-actions">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let file of selectedFolder.files" class="table-row">
                  <td class="td-file">
                    <lucide-icon name="file-audio" [size]="14" class="file-icon"></lucide-icon>
                    {{ file.name }}
                  </td>
                  <td class="td-duration">{{ file.duration }}</td>
                  <td class="td-date">{{ file.createdAt }}</td>
                  <td class="td-actions">
                    <button class="play-btn" (click)="playFile(file)" title="Воспроизвести">
                      <lucide-icon name="play" [size]="14"></lucide-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty folder -->
          <div class="empty-folder" *ngIf="selectedFolder.files.length === 0">
            <lucide-icon name="file-x" [size]="36" class="empty-icon"></lucide-icon>
            <p class="empty-text">Нет сгенерированных файлов</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Roboto, sans-serif; }

    .catalog-screen {
      display: flex;
      height: calc(100vh - 120px);
      animation: fadeIn .25s ease;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 260px;
      min-width: 260px;
      border-right: 1px solid var(--dt-stroke-default);
      background: var(--dt-surface-primary);
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 16px 16px 12px;
      font-size: 13px;
      font-weight: 500;
      color: var(--dt-text-secondary);
      text-transform: uppercase;
      letter-spacing: .5px;
    }

    .voice-group { margin-bottom: 2px; }

    .voice-name {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: var(--dt-text-primary);
      user-select: none;
      transition: background .15s;
    }
    .voice-name:hover { background: var(--dt-surface-hover); }

    .chevron-icon { color: var(--dt-text-disable); flex-shrink: 0; }
    .voice-icon { color: var(--dt-text-secondary); flex-shrink: 0; }

    .voice-children { padding-left: 16px; }

    .folder-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px 7px 28px;
      cursor: pointer;
      font-size: 13px;
      color: var(--dt-text-primary);
      border-radius: 0;
      transition: background .15s;
      user-select: none;
    }
    .folder-item:hover { background: var(--dt-surface-hover); }
    .folder-item-active {
      background: #e3f2fd !important;
      color: #1565c0;
      font-weight: 500;
    }
    .folder-icon { color: var(--dt-text-disable); flex-shrink: 0; }
    .folder-item-active .folder-icon { color: #1565c0; }

    .folder-label { flex: 1; }
    .folder-count { color: var(--dt-text-disable); font-size: 12px; }
    .folder-item-active .folder-count { color: #64b5f6; }

    /* ── Content ── */
    .content {
      flex: 1;
      overflow-y: auto;
      background: var(--dt-surface-variant);
      padding: 24px;
    }

    /* ── Empty state ── */
    .empty-state, .empty-folder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 12px;
    }
    .empty-icon { color: var(--dt-text-disable); }
    .empty-text { color: var(--dt-text-disable); font-size: 14px; }

    /* ── Folder header ── */
    .folder-content { animation: fadeIn .2s ease; }

    .folder-header {
      margin-bottom: 20px;
    }
    .folder-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .folder-title {
      font-size: 20px;
      font-weight: 500;
      color: var(--dt-text-primary);
      margin: 0;
    }
    .file-count-badge {
      font-size: 12px;
      color: var(--dt-text-secondary);
      background: var(--dt-surface-hover);
      padding: 2px 8px;
      border-radius: 10px;
    }

    /* ── Progress ── */
    .progress-section { margin-top: 4px; }
    .progress-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      margin-bottom: 6px;
    }
    .progress-label { color: var(--dt-text-secondary); }
    .progress-value { color: var(--dt-text-primary); font-weight: 500; }
    .progress-percent { color: var(--dt-text-disable); }

    .progress-bar {
      height: 8px;
      background: var(--dt-stroke-default);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--dt-brand-accent);
      border-radius: 4px;
      transition: width .4s ease;
    }
    .progress-complete { background: #4caf50; }

    /* ── Table ── */
    .showing-hint {
      font-size: 12px;
      color: var(--dt-text-disable);
      margin-bottom: 8px;
    }

    .table-wrap {
      background: var(--dt-surface-primary);
      border: 1px solid var(--dt-stroke-default);
      border-radius: 4px;
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .data-table th {
      text-align: left;
      padding: 10px 14px;
      background: var(--dt-surface-variant);
      color: var(--dt-text-secondary);
      font-weight: 500;
      font-size: 12px;
      border-bottom: 1px solid var(--dt-stroke-default);
      white-space: nowrap;
    }
    .th-file { width: 45%; }
    .th-duration { width: 18%; }
    .th-date { width: 22%; }
    .th-actions { width: 15%; text-align: center; }

    .data-table td {
      padding: 9px 14px;
      color: var(--dt-text-primary);
      border-bottom: 1px solid var(--dt-surface-hover);
    }

    .table-row:hover { background: var(--dt-surface-variant); }
    .table-row:last-child td { border-bottom: none; }

    .td-file {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
    }
    .file-icon { color: var(--dt-text-disable); flex-shrink: 0; }

    .td-duration { color: var(--dt-text-secondary); }
    .td-date { color: var(--dt-text-secondary); }
    .td-actions { text-align: center; }

    /* ── Play button ── */
    .play-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: 1px solid var(--dt-stroke-default);
      border-radius: 50%;
      background: var(--dt-surface-primary);
      color: var(--dt-brand-accent);
      cursor: pointer;
      transition: all .15s;
    }
    .play-btn:hover {
      background: #e3f2fd;
      border-color: #90caf9;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class SoundsCatalogScreenComponent implements OnInit {
  private storage = inject(StorageService);

  folders: SoundFolder[] = [];
  voiceNames: string[] = AVAILABLE_VOICES;
  selectedFolderId: number | null = null;
  expandedVoices: Record<string, boolean> = {};

  get selectedFolder(): SoundFolder | null {
    if (this.selectedFolderId === null) return null;
    return this.folders.find(f => f.id === this.selectedFolderId) ?? null;
  }

  ngOnInit(): void {
    this.folders = this.storage.load('web-screens', 'sound-folders', [...MOCK_SOUND_FOLDERS]);
    // Expand first voice by default
    if (this.voiceNames.length > 0) {
      this.expandedVoices[this.voiceNames[0]] = true;
    }
  }

  toggleVoice(voice: string): void {
    this.expandedVoices[voice] = !this.expandedVoices[voice];
  }

  getFoldersForVoice(voice: string): SoundFolder[] {
    return this.folders.filter(f => f.voiceName === voice);
  }

  selectFolder(folder: SoundFolder): void {
    this.selectedFolderId = folder.id;
  }

  getProgressPercent(folder: SoundFolder): number {
    if (folder.totalCount === 0) return 0;
    return Math.round((folder.generatedCount / folder.totalCount) * 100);
  }

  playFile(file: SoundFile): void {
    alert(`▶ Воспроизведение: ${file.name}`);
  }
}
