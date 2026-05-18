import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { GenerationQueueItem, SoundEventHandler } from '../../types';
import { StorageService } from '@/shared/storage.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-generation-queue-panel',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <!-- Queue button in header -->
    <div class="queue-btn-wrap" *ngIf="generationQueue.length > 0">
      <button class="app-btn queue-btn" [class.queue-btn-done]="!hasActiveGeneration()" (click)="togglePanel($event)">
        <lucide-icon [name]="hasActiveGeneration() ? 'loader-2' : 'check-circle-2'" [size]="16" [class.spin-icon]="hasActiveGeneration()" [class.queue-done-icon]="!hasActiveGeneration()"></lucide-icon>
        <span>Очередь ({{ generationQueue.length }})</span>
      </button>
    </div>

    <!-- Queue panel overlay -->
    <div class="queue-backdrop" *ngIf="showPanel" (click)="showPanel = false"></div>
    <div class="queue-panel" *ngIf="showPanel">
      <div class="queue-panel-header">
        <h3 class="queue-panel-title">Очередь генерации</h3>
        <button class="icon-btn" (click)="showPanel = false">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>
      <div class="queue-panel-body">
        <div class="queue-empty" *ngIf="generationQueue.length === 0">
          <lucide-icon name="check-circle-2" [size]="32" class="queue-empty-icon"></lucide-icon>
          <span>Очередь пуста</span>
        </div>
        <div class="queue-item" *ngFor="let qi of generationQueue" (click)="openHandler.emit(qi)" style="cursor: pointer;">
          <div class="queue-item-top">
            <div class="queue-item-info">
              <span class="queue-item-handler">{{ qi.handlerName }}</span>
              <span class="queue-item-phrase">{{ qi.phraseText }}</span>
              <span class="queue-item-voice">Голос: {{ qi.voiceName }}</span>
            </div>
            <div class="queue-item-status">
              <span class="queue-status-badge"
                    [class.status-waiting]="qi.status === 'waiting'"
                    [class.status-generating]="qi.status === 'generating'"
                    [class.status-done]="qi.status === 'done'">
                {{ getQueueStatusText(qi.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .queue-btn-wrap { position: relative; }
    .app-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 0 16px;
      height: 36px; border: none; border-radius: 4px; font-size: 14px;
      font-weight: 500; cursor: pointer; font-family: Roboto, sans-serif; white-space: nowrap;
    }
    .queue-btn {
      background: #fff; border: 1px solid #e0e0e0; color: #424242;
      position: relative; overflow: hidden;
    }
    .queue-btn:hover { background: #f5f5f5; }
    .queue-btn-done { border-color: #4caf50; }
    .queue-done-icon { color: #4caf50; }
    .spin-icon { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .queue-backdrop { position: fixed; inset: 0; z-index: 998; }
    .queue-panel {
      position: fixed; top: 60px; right: 80px; width: 440px;
      max-height: 500px; background: #fff; border: 1px solid #e0e0e0;
      border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      z-index: 999; display: flex; flex-direction: column;
      font-family: Roboto, sans-serif;
    }
    .queue-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #e0e0e0;
    }
    .queue-panel-title { font-size: 16px; font-weight: 500; color: #212121; margin: 0; }
    .queue-panel-body { flex: 1; overflow-y: auto; max-height: 400px; }
    .queue-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 32px; color: #9e9e9e; font-size: 14px;
    }
    .queue-empty-icon { color: #4caf50; }
    .queue-item { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; }
    .queue-item:last-child { border-bottom: none; }
    .queue-item:hover { background: #e8eaf6; }
    .queue-item-top {
      display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
    }
    .queue-item-info { flex: 1; }
    .queue-item-handler { font-weight: 500; color: #1976d2; font-size: 13px; }
    .queue-item-phrase { display: block; font-size: 14px; color: #212121; margin-bottom: 2px; }
    .queue-item-voice { font-size: 12px; color: #9e9e9e; }
    .queue-status-badge {
      display: inline-block; padding: 2px 8px; border-radius: 12px;
      font-size: 12px; font-weight: 500; white-space: nowrap;
    }
    .status-waiting { background: #fff3e0; color: #e65100; }
    .status-generating { background: #e3f2fd; color: #1565c0; }
    .status-done { background: #e8f5e9; color: #2e7d32; }
    .icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border: none; border-radius: 50%;
      background: transparent; color: #757575; cursor: pointer;
    }
    .icon-btn:hover { background: #f0f0f0; }
  `],
})
export class GenerationQueuePanelComponent implements OnDestroy {
  private storage = inject(StorageService);

  @Input() generationQueue: GenerationQueueItem[] = [];
  @Input() handlers: SoundEventHandler[] = [];
  @Output() queueChanged = new EventEmitter<GenerationQueueItem[]>();
  @Output() handlerUpdated = new EventEmitter<SoundEventHandler>();
  @Output() openHandler = new EventEmitter<GenerationQueueItem>();

  showPanel = false;
  private queueTimers: ReturnType<typeof setTimeout>[] = [];

  ngOnDestroy(): void {
    this.queueTimers.forEach(t => clearTimeout(t));
  }

  hasActiveGeneration(): boolean {
    return this.generationQueue.some(q => q.status === 'waiting' || q.status === 'generating');
  }

  getQueueStatusText(status: string): string {
    switch (status) {
      case 'waiting': return '⏳ Ожидает';
      case 'generating': return '🔄 Генерируется';
      case 'done': return '✅ Готово';
      default: return status;
    }
  }

  togglePanel(event: Event): void {
    event.stopPropagation();
    this.showPanel = !this.showPanel;
  }

  addToQueue(handlerId: number, handlerName: string, phraseText: string, voiceName: string): void {
    const maxId = this.generationQueue.reduce((m, q) => Math.max(m, q.id), 0);
    const item: GenerationQueueItem = {
      id: maxId + 1,
      handlerId,
      handlerName,
      phraseText,
      voiceName,
      status: 'waiting',
      createdAt: Date.now(),
      progress: 0,
    };
    this.generationQueue = [item, ...this.generationQueue];
    this.persistQueue();
    this.simulateGeneration(item);
  }

  private simulateGeneration(item: GenerationQueueItem): void {
    const t1 = setTimeout(() => {
      item.status = 'generating';
      item.progress = 0;
      this.persistQueue();

      const steps = [20, 45, 70, 90, 100];
      steps.forEach((pct, i) => {
        const t = setTimeout(() => {
          item.progress = pct;
          if (pct === 100) {
            item.status = 'done';
            const h = this.handlers.find(hh => hh.id === item.handlerId);
            if (h) {
              h.generationStatus = 'done';
              h.fileSize = Math.floor(Math.random() * 60) + 20;
              this.handlerUpdated.emit(h);
            }
          }
          this.persistQueue();
        }, (i + 1) * 1000);
        this.queueTimers.push(t);
      });
    }, 3000);
    this.queueTimers.push(t1);
  }

  private persistQueue(): void {
    this.storage.save('web-screens', 'sound-generation-queue', this.generationQueue);
    this.queueChanged.emit(this.generationQueue);
  }
}
