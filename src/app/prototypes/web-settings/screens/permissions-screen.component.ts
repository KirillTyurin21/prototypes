import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { UiButtonComponent, UiBadgeComponent } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { PermissionNode, Role } from '../types';
import { MOCK_ROLES, MOCK_PERMISSION_TREE, MOCK_INITIAL_CHECKED } from '../data/mock-permissions';

@Component({
  selector: 'app-permissions-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, UiButtonComponent, UiBadgeComponent],
  template: `
    <div class="permissions-page animate-fade-in">
      <!-- Header banner -->
      <div class="page-banner">
        <h1 class="page-title">Права доступа</h1>
        <button class="mass-edit-btn">
          <lucide-icon name="users" [size]="16"></lucide-icon>
          <span>Массовое редактирование прав</span>
        </button>
      </div>

      <!-- Main content: two columns -->
      <div class="content-area">
        <!-- === Left panel: Roles === -->
        <div class="roles-panel">
          <div class="panel-header">
            <span class="panel-header-text">Роли</span>
          </div>
          <div class="roles-search">
            <lucide-icon name="search" [size]="16" class="search-icon"></lucide-icon>
            <input
              type="text"
              class="search-input"
              placeholder="Поиск роли"
              [(ngModel)]="rolesFilter"
            />
          </div>
          <div class="roles-list">
            <label
              *ngFor="let role of filteredRoles"
              class="role-item"
              [class.active]="selectedRole?.code === role.code"
            >
              <input
                type="radio"
                name="role"
                [value]="role.code"
                [checked]="selectedRole?.code === role.code"
                (change)="selectRole(role)"
                class="role-radio"
              />
              <span class="role-name">{{ role.name }}</span>
            </label>
            <div *ngIf="filteredRoles.length === 0" class="empty-roles">
              Ничего не найдено
            </div>
          </div>
        </div>

        <!-- === Right panel: Permissions tree === -->
        <div class="permissions-panel">
          <div class="panel-header">
            <span class="panel-header-text">
              Права доступа для роли «{{ selectedRole?.name || '...' }}»
            </span>
          </div>

          <!-- Search + actions -->
          <div class="tree-toolbar">
            <div class="tree-search">
              <lucide-icon name="search" [size]="16" class="search-icon"></lucide-icon>
              <input
                type="text"
                class="search-input"
                placeholder="Поиск по названию или коду права"
                [(ngModel)]="treeFilter"
              />
            </div>
            <div class="tree-actions">
              <button class="action-link" (click)="expandAll()">
                <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
                <span>Развернуть все</span>
              </button>
              <label class="action-check">
                <input
                  type="checkbox"
                  [checked]="allChecked"
                  [indeterminate]="someChecked && !allChecked"
                  (change)="toggleAll($event)"
                />
                <span>Выбрать все</span>
              </label>
            </div>
          </div>

          <!-- Tree -->
          <div class="tree-container">
            <ng-container *ngFor="let node of filteredTree">
              <ng-container *ngTemplateOutlet="treeNode; context: { node: node, level: 0 }">
              </ng-container>
            </ng-container>
            <div *ngIf="filteredTree.length === 0" class="empty-tree">
              Ничего не найдено
            </div>
          </div>

          <!-- Save button -->
          <div class="save-bar">
            <ui-button variant="primary" (clicked)="savePermissions()">
              Сохранить
            </ui-button>
            <span *ngIf="saveSuccess" class="save-success">Изменения сохранены</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tree node template -->
    <ng-template #treeNode let-node="node" let-level="level">
      <div
        class="tree-node"
        [class.is-folder]="node.type === 'folder'"
        [class.is-code]="node.type === 'code'"
        [class.is-new]="node.isNew"
        [class.hidden-by-filter]="!isNodeVisible(node)"
      >
        <!-- Indent spacer -->
        <div class="tree-indent" [style.width.px]="level * 24"></div>

        <!-- Expand/collapse chevron (folders only) -->
        <button
          *ngIf="node.type === 'folder' && hasVisibleChildren(node)"
          class="tree-chevron"
          (click)="toggleNode(node)"
        >
          <lucide-icon
            [name]="expandedNodes.has(node.id) ? 'chevron-down' : 'chevron-right'"
            [size]="16"
          ></lucide-icon>
        </button>
        <div *ngIf="node.type === 'folder' && !hasVisibleChildren(node)" class="tree-chevron empty">
        </div>
        <div *ngIf="node.type === 'code'" class="tree-chevron empty"></div>

        <!-- Icon -->
        <div class="tree-icon">
          <lucide-icon
            *ngIf="node.type === 'folder'"
            name="folder"
            [size]="18"
            class="folder-icon"
          ></lucide-icon>
          <lucide-icon
            *ngIf="node.type === 'code' && !node.isNew"
            name="shield-check"
            [size]="18"
            class="code-icon"
          ></lucide-icon>
          <lucide-icon
            *ngIf="node.type === 'code' && node.isNew"
            name="shield-check"
            [size]="18"
            class="code-icon-new"
          ></lucide-icon>
        </div>

        <!-- Label area -->
        <div class="tree-label-area" (click)="node.type === 'folder' && toggleNode(node)">
          <span class="tree-label">{{ node.label }}</span>
          <span *ngIf="node.code" class="tree-code">{{ node.code }}</span>
          <ui-badge *ngIf="node.isNew" variant="warning" class="new-badge">Новый</ui-badge>
          <!-- Info icon with tooltip -->
          <span
            *ngIf="node.description"
            class="tree-info"
            [title]="node.description"
          >
            <lucide-icon name="info" [size]="14"></lucide-icon>
          </span>
        </div>

        <!-- Checkbox -->
        <label class="tree-check" (click)="$event.stopPropagation()">
          <input
            type="checkbox"
            [checked]="node.checked"
            (change)="toggleCheck(node)"
          />
          <span class="check-visual"></span>
        </label>
      </div>

      <!-- Children (recursive) -->
      <ng-container *ngIf="node.type === 'folder' && expandedNodes.has(node.id) && node.children">
        <ng-container *ngFor="let child of node.children">
          <ng-container *ngTemplateOutlet="treeNode; context: { node: child, level: level + 1 }">
          </ng-container>
        </ng-container>
      </ng-container>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .permissions-page {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--dt-surface-primary, #fff);
      font-family: Roboto, sans-serif;
    }

    /* ── Banner ── */
    .page-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background-color: var(--dt-surface-variant, #f5f5f5);
      border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0);
      flex-shrink: 0;
    }
    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: var(--dt-text-primary, #212121);
      margin: 0;
    }
    .mass-edit-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid var(--dt-stroke-default, #e0e0e0);
      border-radius: 8px;
      background: #fff;
      color: var(--dt-text-primary, #212121);
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .mass-edit-btn:hover {
      background-color: var(--dt-surface-variant, #f5f5f5);
    }

    /* ── Two-column content ── */
    .content-area {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* ── Roles panel (left) ── */
    .roles-panel {
      width: 260px;
      flex-shrink: 0;
      border-right: 1px solid var(--dt-stroke-default, #e0e0e0);
      display: flex;
      flex-direction: column;
      background-color: var(--dt-surface-primary, #fff);
    }
    .panel-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0);
    }
    .panel-header-text {
      font-size: 14px;
      font-weight: 500;
      color: var(--dt-text-secondary, #616161);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .roles-search {
      position: relative;
      padding: 12px 16px;
      border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0);
    }
    .search-icon {
      position: absolute;
      left: 28px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--dt-icon-secondary, #9e9e9e);
    }
    .search-input {
      width: 100%;
      padding: 8px 12px 8px 32px;
      border: 1px solid var(--dt-stroke-default, #e0e0e0);
      border-radius: 6px;
      font-size: 13px;
      color: var(--dt-text-primary, #212121);
      background: #fff;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--dt-accent, #1976D2);
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.12);
    }
    .roles-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }
    .role-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      cursor: pointer;
      transition: background-color 0.1s;
      font-size: 14px;
      color: var(--dt-text-primary, #212121);
    }
    .role-item:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
    .role-item.active {
      background-color: rgba(25, 118, 210, 0.08);
      color: var(--dt-accent, #1976D2);
      font-weight: 500;
    }
    .role-radio {
      accent-color: var(--dt-accent, #1976D2);
      width: 16px;
      height: 16px;
    }
    .empty-roles {
      padding: 24px 16px;
      text-align: center;
      color: var(--dt-text-disabled, #bdbdbd);
      font-size: 13px;
    }

    /* ── Permissions panel (right) ── */
    .permissions-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ── Tree toolbar ── */
    .tree-toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 24px;
      border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0);
      flex-shrink: 0;
    }
    .tree-search {
      position: relative;
      flex: 1;
      max-width: 400px;
    }
    .tree-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .action-link {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border: none;
      background: none;
      color: var(--dt-accent, #1976D2);
      font-size: 13px;
      cursor: pointer;
      border-radius: 4px;
    }
    .action-link:hover {
      background-color: rgba(25, 118, 210, 0.06);
    }
    .action-check {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--dt-text-primary, #212121);
      cursor: pointer;
    }
    .action-check input {
      accent-color: var(--dt-accent, #1976D2);
      width: 15px;
      height: 15px;
    }

    /* ── Tree container ── */
    .tree-container {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    .empty-tree {
      padding: 32px 24px;
      text-align: center;
      color: var(--dt-text-disabled, #bdbdbd);
      font-size: 13px;
    }

    /* ── Tree node ── */
    .tree-node {
      display: flex;
      align-items: center;
      padding: 6px 16px;
      min-height: 36px;
      transition: background-color 0.1s;
    }
    .tree-node:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    .tree-node.is-code {
      padding-left: 16px;
    }
    .tree-node.is-new {
      background-color: rgba(255, 109, 0, 0.04);
    }
    .tree-node.hidden-by-filter {
      display: none;
    }

    .tree-indent {
      flex-shrink: 0;
    }

    .tree-chevron {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--dt-icon-secondary, #757575);
      flex-shrink: 0;
      border-radius: 4px;
    }
    .tree-chevron:hover {
      background-color: rgba(0, 0, 0, 0.06);
      color: var(--dt-text-primary, #212121);
    }
    .tree-chevron.empty {
      width: 24px;
      flex-shrink: 0;
    }

    .tree-icon {
      display: flex;
      align-items: center;
      margin-right: 8px;
      flex-shrink: 0;
    }
    .folder-icon {
      color: var(--dt-icon-secondary, #757575);
    }
    .code-icon {
      color: var(--dt-icon-secondary, #757575);
    }
    .code-icon-new {
      color: var(--dt-accent-orange, #FF6D00);
    }

    .tree-label-area {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      cursor: default;
    }
    .is-folder .tree-label-area {
      cursor: pointer;
    }
    .tree-label {
      font-size: 14px;
      color: var(--dt-text-primary, #212121);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .is-code .tree-label {
      font-size: 13px;
    }
    .tree-code {
      font-size: 11px;
      color: var(--dt-text-disabled, #bdbdbd);
      font-family: 'Roboto Mono', monospace;
      white-space: nowrap;
    }
    .new-badge {
      flex-shrink: 0;
      font-size: 10px;
      padding: 1px 5px;
    }
    .tree-info {
      display: flex;
      align-items: center;
      color: var(--dt-icon-secondary, #9e9e9e);
      cursor: help;
      flex-shrink: 0;
    }
    .tree-info:hover {
      color: var(--dt-accent, #1976D2);
    }

    .tree-check {
      display: flex;
      align-items: center;
      margin-left: 8px;
      flex-shrink: 0;
      cursor: pointer;
    }
    .tree-check input {
      accent-color: var(--dt-accent, #1976D2);
      width: 16px;
      height: 16px;
    }

    /* ── Save bar ── */
    .save-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
      border-top: 1px solid var(--dt-stroke-default, #e0e0e0);
      flex-shrink: 0;
    }
    .save-success {
      font-size: 13px;
      color: #2e7d32;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `],
})
export class PermissionsScreenComponent implements OnInit {
  private storage = inject(StorageService);

  roles: Role[] = MOCK_ROLES;
  tree: PermissionNode[] = [];

  selectedRole: Role | null = null;
  rolesFilter = '';
  treeFilter = '';

  expandedNodes = new Set<string>();
  saveSuccess = false;

  ngOnInit(): void {
    // Глубокое клонирование дерева, чтобы не мутировать исходные данные
    this.tree = JSON.parse(JSON.stringify(MOCK_PERMISSION_TREE));
    this.selectRole(this.roles[0]);
  }

  /** Отфильтрованные роли */
  get filteredRoles(): Role[] {
    const q = this.rolesFilter.trim().toLowerCase();
    if (!q) return this.roles;
    return this.roles.filter(r => r.name.toLowerCase().includes(q));
  }

  /** Все ID кодов в дереве */
  getAllCodeIds(nodes: PermissionNode[]): string[] {
    const ids: string[] = [];
    const walk = (list: PermissionNode[]) => {
      for (const n of list) {
        if (n.type === 'code') ids.push(n.id);
        if (n.children) walk(n.children);
      }
    };
    walk(nodes);
    return ids;
  }

  /** Все чекнуты? */
  get allChecked(): boolean {
    const codeIds = this.getAllCodeIds(this.tree);
    if (codeIds.length === 0) return false;
    return codeIds.every(id => this.isChecked(id));
  }

  /** Хотя бы один чекнут? */
  get someChecked(): boolean {
    return this.getAllCodeIds(this.tree).some(id => this.isChecked(id));
  }

  /** Фильтрованное дерево (по поиску) */
  get filteredTree(): PermissionNode[] {
    const q = this.treeFilter.trim().toLowerCase();
    if (!q) return this.tree;
    return this.filterNodes(this.tree, q);
  }

  private filterNodes(nodes: PermissionNode[], q: string): PermissionNode[] {
    const result: PermissionNode[] = [];
    for (const node of nodes) {
      const labelMatch = node.label.toLowerCase().includes(q);
      const codeMatch = node.code?.toLowerCase().includes(q);
      const childrenMatch = node.children ? this.filterNodes(node.children, q) : [];

      if (labelMatch || codeMatch || childrenMatch.length > 0) {
        result.push({
          ...node,
          children: childrenMatch.length > 0 ? childrenMatch : node.children,
        });
        // Auto-expand if has matching children
        if (childrenMatch.length > 0) {
          this.expandedNodes.add(node.id);
        }
      }
    }
    return result;
  }

  /** Видим ли узел при текущем фильтре */
  isNodeVisible(node: PermissionNode): boolean {
    return true; // visibility controlled via filteredTree
  }

  /** Есть ли видимые дети */
  hasVisibleChildren(node: PermissionNode): boolean {
    return (node.children?.length ?? 0) > 0;
  }

  /** Выбор роли */
  selectRole(role: Role): void {
    this.selectedRole = role;
    this.saveSuccess = false;
    this.applyRolePermissions(role.code);
  }

  /** Применить сохранённые или начальные права роли */
  private applyRolePermissions(roleCode: string): void {
    const saved = this.storage.load<string[]>('web-settings', `perms_${roleCode}`, []);
    const checkedSet = new Set(saved.length > 0 ? saved : (MOCK_INITIAL_CHECKED[roleCode] || []));

    const walk = (nodes: PermissionNode[]) => {
      for (const n of nodes) {
        n.checked = checkedSet.has(n.id);
        if (n.children) walk(n.children);
      }
    };
    walk(this.tree);
  }

  /** Получить все checked ID */
  private collectCheckedIds(): string[] {
    const ids: string[] = [];
    const walk = (nodes: PermissionNode[]) => {
      for (const n of nodes) {
        if (n.checked) ids.push(n.id);
        if (n.children) walk(n.children);
      }
    };
    walk(this.tree);
    return ids;
  }

  /** Проверить отмечен ли ID */
  private isChecked(id: string): boolean {
    const find = (nodes: PermissionNode[]): boolean => {
      for (const n of nodes) {
        if (n.id === id) return n.checked ?? false;
        if (n.children && find(n.children)) return true;
      }
      return false;
    };
    return find(this.tree);
  }

  /** Развернуть/свернуть узел */
  toggleNode(node: PermissionNode): void {
    if (this.expandedNodes.has(node.id)) {
      this.expandedNodes.delete(node.id);
    } else {
      this.expandedNodes.add(node.id);
    }
  }

  /** Развернуть все */
  expandAll(): void {
    const walk = (nodes: PermissionNode[]) => {
      for (const n of nodes) {
        if (n.type === 'folder' && n.children?.length) {
          this.expandedNodes.add(n.id);
          walk(n.children);
        }
      }
    };
    walk(this.tree);
  }

  /** Переключить чекбокс узла (и всех детей для папок) */
  toggleCheck(node: PermissionNode): void {
    const newState = !node.checked;
    this.setChecked(node, newState);
  }

  private setChecked(node: PermissionNode, state: boolean): void {
    node.checked = state;
    if (node.children) {
      for (const child of node.children) {
        this.setChecked(child, state);
      }
    }
  }

  /** Выбрать все / снять все */
  toggleAll(event: Event): void {
    const state = (event.target as HTMLInputElement).checked;
    const walk = (nodes: PermissionNode[]) => {
      for (const n of nodes) {
        n.checked = state;
        if (n.children) walk(n.children);
      }
    };
    walk(this.tree);
  }

  /** Сохранить права */
  savePermissions(): void {
    if (!this.selectedRole) return;
    const ids = this.collectCheckedIds();
    this.storage.save('web-settings', `perms_${this.selectedRole.code}`, ids);
    this.saveSuccess = true;
    setTimeout(() => this.saveSuccess = false, 2500);
  }
}
