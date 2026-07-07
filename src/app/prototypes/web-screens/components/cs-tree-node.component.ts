import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { CSTerminalV2, TerminalScreenNode, AdvertisePanelNode } from '../cs-types';

/** Типы узлов дерева */
export type CsTreeNode =
  | { kind: 'terminal'; data: CSTerminalV2 }
  | { kind: 'screen'; data: TerminalScreenNode; terminalId: number }
  | { kind: 'theme'; screen: TerminalScreenNode; terminalId: number; themeOptions: { id: number; name: string }[] }
  | { kind: 'advertise-panel'; panel: AdvertisePanelNode; screenId: number; terminalId: number; campaignOptions: { id: number; name: string }[] }
  | { kind: 'hints'; terminal: CSTerminalV2; hintOptions: { id: number; name: string }[] };

@Component({
  selector: 'app-cs-tree-node',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="tree-node" [class.tree-node--root]="node.kind === 'terminal'">
      <!-- TERMINAL -->
      <ng-container *ngIf="node.kind === 'terminal'">
        <div class="tree-row tree-row--terminal" (click)="toggleExpand('terminal-' + node.data.id)">
          <div class="tree-row-left">
            <label class="cs-checkbox-wrap" (click)="$event.stopPropagation()">
              <input type="checkbox" class="cs-checkbox" [checked]="selectedIds.has(node.data.id)" (change)="toggleTerminal.emit(node.data.id)" />
            </label>
            <lucide-icon [name]="isExpanded('terminal-' + node.data.id) ? 'chevron-down' : 'chevron-right'" [size]="16" class="tree-chevron"></lucide-icon>
            <lucide-icon name="monitor" [size]="18" class="tree-icon"></lucide-icon>
            <span class="tree-label">{{ node.data.name }}</span>
            <span class="tree-badge" [class.online]="node.data.isOnline" [class.offline]="!node.data.isOnline">
              {{ node.data.isOnline ? 'online' : 'offline' }}
            </span>
            <span class="tree-version">{{ node.data.pluginVersion }}</span>
            <span class="tree-unsaved" *ngIf="node.data.hasUnsavedChanges">⚡</span>
          </div>
          <div class="tree-row-right">
            <button class="tree-action-btn" *ngIf="node.data.supportsScreenshot && node.data.isOnline" title="Скриншот">
              <lucide-icon name="camera" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>
        <!-- Children -->
        <div class="tree-children" *ngIf="isExpanded('terminal-' + node.data.id)">
          <!-- Screen -->
          <ng-container *ngFor="let screen of node.data.screens ?? []">
            <app-cs-tree-node
              [node]="screenToNode(screen, node.data.id)"
              [level]="level + 1"
              [selectedIds]="selectedIds"
              [expandedNodes]="expandedNodes"
              [themeOptions]="themeOptions"
              [campaignOptions]="campaignOptions"
              [hintOptions]="hintOptions"
              (toggleTerminal)="toggleTerminal.emit($event)"
              (addPanel)="addPanel.emit($event)"
              (removePanel)="removePanel.emit($event)"
              (campaignChange)="campaignChange.emit($event)"
              (themeChange)="themeChange.emit($event)"
            ></app-cs-tree-node>
          </ng-container>
          <!-- Hints -->
          <div class="tree-row tree-row--hints" (click)="toggleExpand('hints-' + node.data.id)">
            <div class="tree-row-left" [style.padding-left.px]="(level + 1) * 24">
              <lucide-icon [name]="isExpanded('hints-' + node.data.id) ? 'chevron-down' : 'chevron-right'" [size]="14" class="tree-chevron"></lucide-icon>
              <lucide-icon name="wand-2" [size]="16" class="tree-icon"></lucide-icon>
              <span class="tree-label">Подсказки</span>
              <span class="tree-count">({{ node.data.hintIds.length }})</span>
            </div>
          </div>
          <div class="tree-children" *ngIf="isExpanded('hints-' + node.data.id)">
            <div class="tree-row tree-row--hint-option" *ngFor="let hint of getHintNames(node.data)" [style.padding-left.px]="(level + 2) * 24">
              <span class="tree-label tree-label--small">{{ hint }}</span>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- SCREEN -->
      <ng-container *ngIf="node.kind === 'screen'">
        <div class="tree-row tree-row--screen" (click)="toggleExpand('screen-' + node.data.id)">
          <div class="tree-row-left" [style.padding-left.px]="level * 24">
            <lucide-icon [name]="isExpanded('screen-' + node.data.id) ? 'chevron-down' : 'chevron-right'" [size]="14" class="tree-chevron"></lucide-icon>
            <lucide-icon name="monitor" [size]="16" class="tree-icon tree-icon--dim"></lucide-icon>
            <span class="tree-label">Экран «{{ node.data.name }}»</span>
          </div>
        </div>
        <div class="tree-children" *ngIf="isExpanded('screen-' + node.data.id)">
          <!-- Theme -->
          <app-cs-tree-node
            [node]="themeToNode(node.data, node.terminalId)"
            [level]="level + 1"
            [selectedIds]="selectedIds"
            [expandedNodes]="expandedNodes"
            [themeOptions]="themeOptions"
            [campaignOptions]="campaignOptions"
            [hintOptions]="hintOptions"
            (toggleTerminal)="toggleTerminal.emit($event)"
            (addPanel)="addPanel.emit($event)"
            (removePanel)="removePanel.emit($event)"
            (campaignChange)="campaignChange.emit($event)"
            (themeChange)="themeChange.emit($event)"
          ></app-cs-tree-node>
        </div>
      </ng-container>

      <!-- THEME -->
      <ng-container *ngIf="node.kind === 'theme'">
        <div class="tree-row tree-row--theme" (click)="toggleExpand('theme-' + node.screen.id)">
          <div class="tree-row-left" [style.padding-left.px]="level * 24">
            <lucide-icon [name]="isExpanded('theme-' + node.screen.id) ? 'chevron-down' : 'chevron-right'" [size]="14" class="tree-chevron"></lucide-icon>
            <lucide-icon name="palette" [size]="16" class="tree-icon tree-icon--dim"></lucide-icon>
            <span class="tree-label">Тема:</span>
          </div>
          <div class="tree-row-right">
            <select
              class="tree-select"
              [ngModel]="node.screen.themeId"
              (ngModelChange)="themeChange.emit({ terminalId: node.terminalId, screenId: node.screen.id, themeId: $event })"
              (click)="$event.stopPropagation()"
            >
              <option [ngValue]="null">Выбрать</option>
              <option *ngFor="let opt of themeOptions" [ngValue]="opt.id">{{ opt.name }}</option>
            </select>
          </div>
        </div>
        <div class="tree-children" *ngIf="isExpanded('theme-' + node.screen.id)">
          <!-- Advertise panels -->
          <div class="tree-row tree-row--panel" *ngFor="let panel of node.screen.advertisePanels">
            <div class="tree-row-left" [style.padding-left.px]="(level + 1) * 24">
              <span class="tree-connector">├─</span>
              <lucide-icon name="megaphone" [size]="16" class="tree-icon tree-icon--accent"></lucide-icon>
              <span class="tree-label">{{ panel.name }}</span>
              <span class="tree-sep">—</span>
            </div>
            <div class="tree-row-right">
              <select
                class="tree-select"
                [ngModel]="panel.campaignId"
                (ngModelChange)="campaignChange.emit({ terminalId: node.terminalId, screenId: node.screen.id, panelId: panel.id, campaignId: $event })"
                (click)="$event.stopPropagation()"
              >
                <option [ngValue]="null">Выбрать кампанию</option>
                <option *ngFor="let opt of campaignOptions" [ngValue]="opt.id">{{ opt.name }}</option>
              </select>
              <button class="tree-remove-btn" (click)="removePanel.emit({ terminalId: node.terminalId, screenId: node.screen.id, panelId: panel.id }); $event.stopPropagation()" title="Удалить панель">
                <lucide-icon name="x" [size]="14"></lucide-icon>
              </button>
            </div>
          </div>
          <!-- Empty state -->
          <div class="tree-row tree-row--empty" *ngIf="node.screen.advertisePanels.length === 0" [style.padding-left.px]="(level + 1) * 24">
            <span class="tree-label tree-label--empty">Нет Advertise-панелей</span>
          </div>
          <!-- Add panel button -->
          <div class="tree-row tree-row--add" [style.padding-left.px]="(level + 1) * 24">
            <button class="tree-add-btn" (click)="addPanel.emit({ terminalId: node.terminalId, screenId: node.screen.id }); $event.stopPropagation()">
              <lucide-icon name="plus" [size]="14"></lucide-icon>
              <span>Добавить Advertise-панель</span>
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .tree-node { }
    .tree-node--root { margin-bottom: 0; }

    .tree-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; min-height: 40px;
      border-bottom: 1px solid rgba(0,0,0,.04); cursor: pointer;
      transition: background .1s;
    }
    .tree-row:hover { background: #f5f8fc; }
    .tree-row--terminal { padding: 10px 12px; background: #fafafa; border-bottom: 1px solid rgba(0,0,0,.08); }
    .tree-row--terminal:hover { background: #f0f4f8; }
    .tree-row--hints { padding: 7px 12px; border-bottom-style: dashed; }
    .tree-row--hint-option { padding: 4px 12px; cursor: default; border-bottom: none; }
    .tree-row--hint-option:hover { background: transparent; }
    .tree-row--panel { padding: 7px 12px; }
    .tree-row--add { padding: 8px 12px; border-bottom: none; cursor: default; }
    .tree-row--add:hover { background: transparent; }
    .tree-row--empty { padding: 12px; cursor: default; }
    .tree-row--empty:hover { background: transparent; }

    .tree-row-left, .tree-row-right { display: flex; align-items: center; gap: 6px; }
    .tree-row-right { flex-shrink: 0; }

    .tree-chevron { color: #9e9e9e; flex-shrink: 0; transition: transform .15s; }
    .tree-icon { color: #757575; flex-shrink: 0; }
    .tree-icon--dim { color: #bdbdbd; }
    .tree-icon--accent { color: #ff9800; }
    .tree-connector { color: #bdbdbd; font-family: monospace; font-size: 12px; margin-left: 4px; }
    .tree-sep { color: #bdbdbd; margin: 0 2px; }

    .tree-label { font-size: 14px; color: rgba(0,0,0,.87); }
    .tree-label--small { font-size: 13px; color: #616161; }
    .tree-label--empty { font-size: 13px; color: #bdbdbd; font-style: italic; }

    .tree-badge {
      font-size: 11px; font-weight: 500; padding: 1px 8px; border-radius: 10px;
      text-transform: uppercase; letter-spacing: .3px;
    }
    .tree-badge.online { background: #e8f5e9; color: #2e7d32; }
    .tree-badge.offline { background: #fbe9e7; color: #c62828; }

    .tree-version { font-size: 12px; color: #9e9e9e; }
    .tree-unsaved { font-size: 14px; color: #ff9800; }
    .tree-count { font-size: 13px; color: #9e9e9e; }

    .tree-children { }

    .tree-select {
      padding: 4px 24px 4px 8px; font-size: 12px; font-family: 'Roboto', sans-serif;
      border: 1px solid rgba(0,0,0,.2); border-radius: 4px; background: #fff;
      appearance: none; -webkit-appearance: none; cursor: pointer;
      color: rgba(0,0,0,.87); min-width: 160px;
    }
    .tree-select:focus { border-color: #1976d2; outline: none; }

    .tree-action-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%; border: none;
      background: transparent; cursor: pointer; color: #757575; transition: all .15s;
    }
    .tree-action-btn:hover { background: #f5f5f5; color: #424242; }

    .tree-add-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 14px; font-size: 13px; font-family: 'Roboto', sans-serif;
      color: #1976d2; background: transparent; border: 1px dashed rgba(25,118,210,.4);
      border-radius: 4px; cursor: pointer; transition: all .15s;
    }
    .tree-add-btn:hover { background: #e3f2fd; border-color: #1976d2; }

    .tree-remove-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 24px; height: 24px; border-radius: 50%; border: none;
      background: transparent; cursor: pointer; color: #bdbdbd; transition: all .15s;
    }
    .tree-remove-btn:hover { background: #ffebee; color: #c62828; }

    .cs-checkbox-wrap { display: inline-flex; align-items: center; cursor: pointer; }
    .cs-checkbox {
      appearance: none; -webkit-appearance: none; width: 18px; height: 18px;
      border: 2px solid rgba(0,0,0,.38); border-radius: 2px; cursor: pointer;
      position: relative; transition: all .15s; flex-shrink: 0; background: #fff;
    }
    .cs-checkbox:hover { border-color: #1976d2; }
    .cs-checkbox:checked { background: #1976d2; border-color: #1976d2; }
    .cs-checkbox:checked::after {
      content: ''; position: absolute; top: 1px; left: 5px; width: 5px; height: 9px;
      border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg);
    }
  `],
})
export class CsTreeNodeComponent {
  @Input() node!: CsTreeNode;
  @Input() level = 0;
  @Input() selectedIds = new Set<number>();
  @Input() expandedNodes = new Set<string>();
  @Input() themeOptions: { id: number; name: string }[] = [];
  @Input() campaignOptions: { id: number; name: string }[] = [];
  @Input() hintOptions: { id: number; name: string }[] = [];

  @Output() toggleTerminal = new EventEmitter<number>();
  @Output() addPanel = new EventEmitter<{ terminalId: number; screenId: number }>();
  @Output() removePanel = new EventEmitter<{ terminalId: number; screenId: number; panelId: number }>();
  @Output() campaignChange = new EventEmitter<{ terminalId: number; screenId: number; panelId: number; campaignId: number | null }>();
  @Output() themeChange = new EventEmitter<{ terminalId: number; screenId: number; themeId: number | null }>();

  screenToNode(screen: TerminalScreenNode, terminalId: number): CsTreeNode {
    return { kind: 'screen', data: screen, terminalId };
  }

  themeToNode(screen: TerminalScreenNode, terminalId: number): CsTreeNode {
    return { kind: 'theme', screen, terminalId, themeOptions: this.themeOptions };
  }

  isExpanded(key: string): boolean {
    return this.expandedNodes.has(key);
  }

  toggleExpand(key: string): void {
    this.expandedNodes.has(key) ? this.expandedNodes.delete(key) : this.expandedNodes.add(key);
  }

  getHintNames(terminal: CSTerminalV2): string[] {
    return terminal.hintIds
      .map(id => this.hintOptions.find(o => o.id === id)?.name)
      .filter(Boolean) as string[];
  }
}
