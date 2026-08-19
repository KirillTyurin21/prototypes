import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { DvCollection, DvEventHandler } from '../../types';
import { getSystemHandlerPrefix } from '../../data/mock-data';

export type HandlerTreeStatus = 'ready' | 'pending' | 'empty';

/**
 * Дерево «Коллекции → Обработчики» (новая концепция).
 * Статусы «готов / ожидание / не настроен», системные префиксы-звёздочки, счётчики «(N)», чекбоксы массового копирования.
 */
@Component({
  selector: 'app-handlers-tree',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="ht-tree">
      <h3 class="ht-title">Коллекции</h3>

      <!-- Пустое состояние: нет обработчиков вообще -->
      <div class="ht-empty" *ngIf="handlers.length === 0">
        <lucide-icon name="folder-open" [size]="20"></lucide-icon>
        <span>Нет данных для отображения</span>
      </div>

      <!-- Ничего не найдено по поиску -->
      <div class="ht-empty" *ngIf="handlers.length > 0 && visibleGroups.length === 0">
        <lucide-icon name="search" [size]="18"></lucide-icon>
        <span>Ничего не найдено</span>
      </div>

      <div class="ht-group" *ngFor="let group of visibleGroups">
        <div class="ht-group-row">
          <button
            type="button"
            class="ht-group-btn"
            (click)="toggleGroup(group.id)"
            [attr.aria-expanded]="isExpanded(group.id)"
          >
            <span class="ht-chevron">
              <lucide-icon [name]="isExpanded(group.id) ? 'chevron-down' : 'chevron-right'" [size]="16"></lucide-icon>
            </span>
            <span class="ht-group-icon">
              <lucide-icon name="folder" [size]="16"></lucide-icon>
            </span>
            <span class="ht-group-name">{{ group.name }}</span>
          </button>
          <input
            type="checkbox"
            class="ht-check ht-check--group"
            [checked]="isGroupFullyChecked(group)"
            (change)="toggleCollectionCheck.emit(group.id)"
            [attr.aria-label]="'Выбрать все обработчики: ' + group.name"
          />
          <span class="ht-group-count">({{ groupHandlers(group.id).length }})</span>
        </div>

        <div class="ht-children" *ngIf="isExpanded(group.id)">
          <div
            class="ht-handler"
            *ngFor="let h of groupHandlers(group.id)"
            [class.ht-handler--active]="selectedHandlerId === h.id"
            (click)="selectHandler.emit(h.id)"
            role="button"
            [attr.aria-pressed]="selectedHandlerId === h.id"
            tabindex="0"
            (keydown.enter)="selectHandler.emit(h.id)"
          >
            <input
              type="checkbox"
              class="ht-check"
              [checked]="checkedHandlerIds.has(h.id)"
              (click)="$event.stopPropagation()"
              (change)="toggleHandlerCheck.emit(h.id)"
              [attr.aria-label]="'Выбрать обработчик ' + h.name"
            />
            <span class="ht-handler-icon">
              <lucide-icon name="mic" [size]="15"></lucide-icon>
            </span>
            <span class="ht-handler-main">
              <span class="ht-handler-name">{{ handlerLabel(h, group.id) }}</span>
              <span class="ht-handler-meta">Событий: {{ h.events.length }}</span>
            </span>
            <span class="ht-status" [ngClass]="'ht-status--' + statusKind(h)" [title]="statusTitle(h)">
              <lucide-icon [name]="statusIcon(h)" [size]="15"></lucide-icon>
            </span>
          </div>
        </div>
      </div>

      <button type="button" class="ht-apply" *ngIf="checkedHandlerIds.size >= 1" (click)="massCopy.emit()">
        Копировать выбранные ({{ checkedHandlerIds.size }})
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .ht-tree {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px 12px 16px;
      overflow-y: auto;
      font-family: Roboto, sans-serif;
    }
    .ht-title {
      margin: 0 0 10px 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--dt-text-secondary);
    }

    .ht-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px 8px;
      color: var(--dt-text-disable);
      font-size: 13px;
    }

    .ht-group { margin-bottom: 2px; }
    .ht-group-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 4px 2px 2px;
      border-radius: 4px;
    }
    .ht-group-row:hover { background: #ebebeb; }
    .ht-group-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
      padding: 6px 4px;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
      text-align: left;
      border-radius: 4px;
    }
    .ht-group-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
    .ht-chevron { display: inline-flex; color: var(--dt-text-secondary); }
    .ht-group-icon { display: inline-flex; color: var(--dt-text-secondary); }
    .ht-group-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      font-weight: 500;
      color: var(--dt-text-primary);
    }
    .ht-group-count { font-size: 12px; color: var(--dt-text-disable); padding: 0 4px; white-space: nowrap; }

    .ht-children { padding-left: 12px; }

    .ht-check {
      width: 15px;
      height: 15px;
      margin: 0;
      flex-shrink: 0;
      accent-color: var(--dt-brand-accent);
      cursor: pointer;
    }

    .ht-handler {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 8px;
      margin: 1px 0;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.12s ease;
    }
    .ht-handler:hover { background: #ebebeb; }
    .ht-handler--active {
      background: var(--dt-surface-sidebar-selected);
      box-shadow: inset 2px 0 0 var(--dt-brand-accent);
    }
    .ht-handler--active .ht-handler-name { font-weight: 500; }

    .ht-handler-icon { display: inline-flex; color: var(--dt-text-secondary); flex-shrink: 0; }
    .ht-handler--active .ht-handler-icon { color: var(--dt-brand-accent); }

    .ht-handler-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .ht-handler-name {
      font-size: 13.5px;
      color: var(--dt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ht-handler-meta { font-size: 11.5px; color: var(--dt-text-disable); }

    .ht-status { display: inline-flex; flex-shrink: 0; }
    .ht-status--ready { color: var(--dt-brand-positive); }
    .ht-status--pending { color: var(--dt-brand-warning-dark); }
    .ht-status--empty { color: #d6d6d6; }

    .ht-apply {
      margin-top: 14px;
      padding: 9px 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-variant);
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.12s ease;
    }
    .ht-apply:hover { background: #ebebeb; }
    .ht-apply:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
  `],
})
export class HandlersTreeComponent implements OnChanges {
  @Input() collections: DvCollection[] = [];
  @Input() handlers: DvEventHandler[] = [];
  @Input() selectedHandlerId: number | null = null;
  @Input() checkedHandlerIds = new Set<number>();
  @Input() searchQuery = '';

  @Output() selectHandler = new EventEmitter<number>();
  @Output() toggleHandlerCheck = new EventEmitter<number>();
  @Output() toggleCollectionCheck = new EventEmitter<number>();
  @Output() massCopy = new EventEmitter<void>();

  expanded = new Set<number>();

  ngOnChanges(changes: SimpleChanges): void {
    // при первом появлении данных — раскрыть все группы
    if (changes['collections'] && this.expanded.size === 0) {
      this.collections.forEach(c => this.expanded.add(c.id));
      this.expanded.add(-1); // «Без коллекции»
    }
  }

  isExpanded(groupId: number): boolean {
    return this.expanded.has(groupId);
  }

  toggleGroup(groupId: number): void {
    if (this.expanded.has(groupId)) {
      this.expanded.delete(groupId);
    } else {
      this.expanded.add(groupId);
    }
    this.expanded = new Set(this.expanded);
  }

  groupHandlers(groupId: number): DvEventHandler[] {
    if (groupId === -1) return this.orphanHandlers;
    return this.handlers.filter(h => h.collectionIds.includes(groupId));
  }

  get orphanHandlers(): DvEventHandler[] {
    return this.handlers.filter(h => h.collectionIds.length === 0);
  }

  /** Видимые группы с учётом поиска: обычные коллекции + псевдогруппа «Без коллекции» (-1) */
  get visibleGroups(): { id: number; name: string }[] {
    const q = this.searchQuery.trim().toLowerCase();
    const groups: { id: number; name: string }[] = [];

    this.collections.forEach(c => {
      const groupHandlers = this.groupHandlers(c.id);
      // пустые коллекции тоже видимы (пользователь видит созданную коллекцию)
      if (!q) {
        groups.push({ id: c.id, name: c.name });
        return;
      }
      const nameMatch = c.name.toLowerCase().includes(q);
      const handlerMatch = groupHandlers.some(h =>
        this.handlerLabel(h, c.id).toLowerCase().includes(q)
      );
      if (nameMatch || handlerMatch) {
        groups.push({ id: c.id, name: c.name });
      }
    });

    if (this.orphanHandlers.length > 0) {
      const orphanMatch = !q || this.orphanHandlers.some(h => h.name.toLowerCase().includes(q));
      if (orphanMatch) {
        groups.push({ id: -1, name: 'Без коллекции' });
      }
    }

    return groups;
  }

  /** Подпись обработчика: системный префикс (звёздочки) в контексте системной коллекции */
  handlerLabel(h: DvEventHandler, groupId: number): string {
    const collection = this.collections.find(c => c.id === groupId);
    if (collection?.isSystem) {
      return getSystemHandlerPrefix(h.name) + h.name;
    }
    return h.name;
  }

  statusKind(h: DvEventHandler): HandlerTreeStatus {
    if (h.voiceType === 'file') {
      return h.fileName ? 'ready' : 'empty';
    }
    if (h.generationStatus === 'done') return 'ready';
    if (h.generationStatus === 'pending' || h.generationStatus === 'generating') return 'pending';
    return 'empty';
  }

  statusIcon(h: DvEventHandler): string {
    switch (this.statusKind(h)) {
      case 'ready': return 'check-circle-2';
      case 'pending': return 'loader-2';
      default: return 'circle';
    }
  }

  statusTitle(h: DvEventHandler): string {
    switch (this.statusKind(h)) {
      case 'ready': return h.voiceType === 'file' ? 'Готово' : 'Готово';
      case 'pending': return 'Ожидание';
      default: return 'Не настроен';
    }
  }

  isGroupFullyChecked(group: { id: number }): boolean {
    const hs = this.groupHandlers(group.id);
    return hs.length > 0 && hs.every(h => this.checkedHandlerIds.has(h.id));
  }
}
