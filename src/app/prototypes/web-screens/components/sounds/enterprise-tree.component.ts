import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { SoundTerminalGroupV2, SoundTerminalV2 } from '../../types';

export type TerminalStatusKind = 'ok' | 'partial' | 'none';

/**
 * Дерево «Структура торговых предприятий» (компоновка Яндекс.Пэй / comet).
 * Рестораны → терминалы: чекбоксы массового выбора, статус-иконки, счётчики.
 */
@Component({
  selector: 'app-enterprise-tree',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="et-tree">
      <h3 class="et-title">Структура торговых предприятий</h3>

      <div class="et-empty" *ngIf="visibleGroups.length === 0">
        <lucide-icon name="search" [size]="18"></lucide-icon>
        <span>Ничего не найдено</span>
      </div>

      <div class="et-org" *ngFor="let group of visibleGroups">
        <div class="et-org-row">
          <button type="button" class="et-org-btn" (click)="toggleGroup(group.id)" [attr.aria-expanded]="isExpanded(group.id)">
            <span class="et-org-chevron">
              <lucide-icon [name]="isExpanded(group.id) ? 'chevron-down' : 'chevron-right'" [size]="16"></lucide-icon>
            </span>
            <span class="et-org-icon"><lucide-icon name="folder" [size]="16"></lucide-icon></span>
            <span class="et-org-name">{{ group.name }}</span>
          </button>
          <input
            type="checkbox"
            class="et-check et-check--group"
            [checked]="isGroupFullyChecked(group)"
            (change)="toggleGroupCheck.emit(group.id)"
            [attr.aria-label]="'Выбрать все терминалы: ' + group.name"
          />
          <span class="et-org-count">{{ group.terminals.length }}</span>
        </div>

        <div class="et-children" *ngIf="isExpanded(group.id)">
          <div
            class="et-term"
            *ngFor="let t of group.terminals"
            [class.et-term--active]="selectedId === t.id"
            (click)="select.emit(t.id)"
            role="button"
            [attr.aria-pressed]="selectedId === t.id"
            tabindex="0"
            (keydown.enter)="select.emit(t.id)"
          >
            <input
              type="checkbox"
              class="et-check"
              [checked]="checkedIds.has(t.id)"
              (click)="$event.stopPropagation()"
              (change)="toggleCheck.emit(t.id)"
              [attr.aria-label]="'Выбрать терминал ' + t.name"
            />
            <span class="et-term-icon"><lucide-icon name="monitor" [size]="16"></lucide-icon></span>
            <span class="et-term-main">
              <span class="et-term-name">{{ t.name }}</span>
              <span class="et-term-meta">{{ t.devices.length }} {{ deviceWord(t.devices.length) }} · {{ totalHandlers(t) }} обработч.</span>
            </span>
            <span class="et-status" [ngClass]="'et-status--' + statusKind(t)" [title]="statusTitle(t)">
              <lucide-icon [name]="statusIcon(t)" [size]="16"></lucide-icon>
            </span>
          </div>
        </div>
      </div>

      <button type="button" class="et-apply" *ngIf="checkedIds.size >= 2" (click)="apply.emit()">
        Применить к выбранным ({{ checkedIds.size }})
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .et-tree {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px 12px 16px;
      overflow-y: auto;
      font-family: Roboto, sans-serif;
    }
    .et-title {
      margin: 0 0 10px 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: var(--dt-text-secondary);
    }

    .et-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px 8px;
      color: var(--dt-text-disable);
      font-size: 13px;
    }

    .et-org { margin-bottom: 2px; }
    .et-org-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 4px 2px 2px;
      border-radius: 4px;
    }
    .et-org-row:hover { background: #ebebeb; }
    .et-org-btn {
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
    .et-org-chevron { display: inline-flex; color: var(--dt-text-secondary); }
    .et-org-icon { display: inline-flex; color: var(--dt-text-secondary); }
    .et-org-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      font-weight: 500;
      color: var(--dt-text-primary);
    }
    .et-org-count { font-size: 12px; color: var(--dt-text-disable); padding: 0 6px; }

    .et-children { padding-left: 14px; }

    .et-term {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 8px;
      margin: 1px 0;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.12s ease;
    }
    .et-term:hover { background: #ebebeb; }
    .et-term--active {
      background: var(--dt-surface-sidebar-selected);
      box-shadow: inset 2px 0 0 var(--dt-brand-accent);
    }
    .et-term--active .et-term-name { font-weight: 500; color: var(--dt-text-primary); }

    .et-check {
      width: 15px;
      height: 15px;
      margin: 0;
      flex-shrink: 0;
      accent-color: var(--dt-brand-accent);
      cursor: pointer;
    }

    .et-term-icon { display: inline-flex; color: var(--dt-text-secondary); flex-shrink: 0; }
    .et-term--active .et-term-icon { color: var(--dt-brand-accent); }

    .et-term-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .et-term-name {
      font-size: 13.5px;
      color: var(--dt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .et-term-meta { font-size: 11.5px; color: var(--dt-text-disable); }

    .et-status { display: inline-flex; flex-shrink: 0; }
    .et-status--ok { color: var(--dt-brand-positive); }
    .et-status--partial { color: var(--dt-brand-warning-dark); }
    .et-status--none { color: #d6d6d6; }

    .et-apply {
      margin-top: 14px;
      padding: 9px 12px;
      border: 1px solid var(--dt-brand-accent);
      border-radius: 4px;
      background: #f0f5ff;
      color: var(--dt-brand-accent);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .et-apply:hover { background: var(--dt-brand-accent-lightest); }
  `],
})
export class EnterpriseTreeComponent {
  @Input() groups: SoundTerminalGroupV2[] = [];
  @Input() selectedId: number | null = null;
  @Input() checkedIds: Set<number> = new Set();
  @Input() searchTerm = '';

  @Output() select = new EventEmitter<number>();
  @Output() toggleCheck = new EventEmitter<number>();
  @Output() toggleGroupCheck = new EventEmitter<number>();
  @Output() apply = new EventEmitter<void>();

  private expandedGroups = new Set<number>();

  ngOnInit(): void {
    // По умолчанию раскрыт первый ресторан
    if (this.groups.length > 0) {
      this.expandedGroups.add(this.groups[0].id);
    }
  }

  get visibleGroups(): SoundTerminalGroupV2[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.groups;
    return this.groups
      .map(g => {
        if (g.name.toLowerCase().includes(q)) return g;
        const terminals = g.terminals.filter(t => t.name.toLowerCase().includes(q));
        return terminals.length > 0 ? { ...g, terminals } : null;
      })
      .filter((g): g is SoundTerminalGroupV2 => g !== null);
  }

  isExpanded(groupId: number): boolean {
    return this.expandedGroups.has(groupId);
  }

  toggleGroup(groupId: number): void {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
  }

  isGroupFullyChecked(group: SoundTerminalGroupV2): boolean {
    return group.terminals.length > 0 && group.terminals.every(t => this.checkedIds.has(t.id));
  }

  statusKind(t: SoundTerminalV2): TerminalStatusKind {
    if (t.devices.length === 0) return 'none';
    return t.devices.every(d => d.handlerIds.length > 0) ? 'ok' : 'partial';
  }

  statusIcon(t: SoundTerminalV2): string {
    switch (this.statusKind(t)) {
      case 'ok': return 'check-circle-2';
      case 'partial': return 'alert-circle';
      default: return 'circle';
    }
  }

  statusTitle(t: SoundTerminalV2): string {
    switch (this.statusKind(t)) {
      case 'ok': return 'Настроен';
      case 'partial': return 'Настроен частично';
      default: return 'Не настроен';
    }
  }

  totalHandlers(t: SoundTerminalV2): number {
    return t.devices.reduce((sum, d) => sum + d.handlerIds.length, 0);
  }

  deviceWord(count: number): string {
    if (count === 1) return 'устройство';
    if (count >= 2 && count <= 4) return 'устройства';
    return 'устройств';
  }
}
