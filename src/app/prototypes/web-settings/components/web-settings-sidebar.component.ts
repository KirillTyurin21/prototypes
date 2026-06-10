import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

interface SidebarNavItem {
  label: string;
  icon: string;
  expanded?: boolean;
  children?: { label: string; active?: boolean }[];
}

@Component({
  selector: 'app-web-settings-sidebar',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <aside class="settings-sidebar" [class.collapsed]="collapsed">
      <!-- Sidebar header -->
      <div class="sidebar-header" *ngIf="!collapsed">
        <span class="sidebar-header-text">Настройки и обслуживание системы</span>
        <button class="sidebar-close-btn" (click)="closeSidebar.emit()">
          <lucide-icon name="x" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="sidebar-scroll">
        <!-- Nav sections -->
        <div *ngFor="let section of navSections" class="nav-section">
          <!-- Section header -->
          <div
            class="nav-section-header"
            [class.expanded]="section.expanded"
            (click)="toggleSection(section)"
          >
            <lucide-icon
              [name]="section.expanded ? 'chevron-down' : 'chevron-right'"
              [size]="16"
              class="chevron"
            ></lucide-icon>
            <span *ngIf="!collapsed" class="section-label">{{ section.label }}</span>
          </div>

          <!-- Section children -->
          <div *ngIf="section.expanded && !collapsed" class="nav-section-children">
            <div
              *ngFor="let child of section.children"
              class="nav-child"
              [class.active]="child.active"
            >
              <span class="nav-child-label">{{ child.label }}</span>
            </div>
          </div>
        </div>

        <!-- Standalone items -->
        <div class="nav-standalone" *ngIf="!collapsed">
          <div *ngFor="let item of standaloneItems" class="nav-standalone-item">
            <lucide-icon [name]="item.icon" [size]="18"></lucide-icon>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="footer-version">ver: 9.6.4.315731</div>
      </div>
    </aside>
  `,
  styles: [`
    .settings-sidebar {
      width: 280px;
      flex-shrink: 0;
      background-color: var(--dt-surface-variant, #f5f5f5);
      box-shadow: 1px 0 0 var(--dt-stroke-default, #e0e0e0);
      z-index: 101;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.4s cubic-bezier(.25,.8,.25,1);
      font-family: Roboto, sans-serif;
    }
    .settings-sidebar.collapsed {
      width: 72px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0);
    }
    .sidebar-header-text {
      font-size: 14px;
      font-weight: 500;
      color: var(--dt-text-primary, #212121);
      line-height: 1.3;
    }
    .sidebar-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: none;
      border-radius: 4px;
      cursor: pointer;
      color: var(--dt-icon-secondary, #757575);
    }
    .sidebar-close-btn:hover {
      background-color: rgba(0,0,0,0.06);
      color: var(--dt-text-primary, #212121);
    }

    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    /* Nav sections */
    .nav-section {
      border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0);
    }
    .nav-section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      cursor: pointer;
      font-size: 14px;
      color: var(--dt-text-primary, #212121);
      transition: background-color 0.1s;
    }
    .nav-section-header:hover {
      background-color: rgba(0,0,0,0.03);
    }
    .nav-section-header .chevron {
      color: var(--dt-icon-secondary, #757575);
      flex-shrink: 0;
    }
    .section-label {
      font-weight: 500;
    }

    .nav-section-children {
      padding: 0 0 4px 0;
    }
    .nav-child {
      padding: 8px 16px 8px 44px;
      font-size: 13px;
      color: var(--dt-text-secondary, #616161);
      cursor: pointer;
      transition: background-color 0.1s;
    }
    .nav-child:hover {
      background-color: rgba(0,0,0,0.03);
    }
    .nav-child.active {
      background-color: rgba(25, 118, 210, 0.08);
      color: var(--dt-accent, #1976D2);
      font-weight: 500;
    }

    /* Standalone items */
    .nav-standalone {
      padding: 4px 0;
    }
    .nav-standalone-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      font-size: 14px;
      color: var(--dt-text-primary, #212121);
      cursor: pointer;
      transition: background-color 0.1s;
    }
    .nav-standalone-item:hover {
      background-color: rgba(0,0,0,0.03);
    }

    /* Footer */
    .sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--dt-stroke-default, #e0e0e0);
    }
    .footer-version {
      font-size: 12px;
      color: var(--dt-text-disabled, #bdbdbd);
    }
  `],
})
export class WebSettingsSidebarComponent {
  @Input() collapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();

  navSections: SidebarNavItem[] = [
    {
      label: 'Общие настройки',
      icon: 'settings',
      expanded: true,
      children: [
        { label: 'Основные параметры' },
        { label: 'Права доступа', active: true },
        { label: 'Настройки' },
      ],
    },
  ];

  standaloneItems = [
    { label: 'Профиль пользователя', icon: 'user' },
    { label: 'Настройка iikoTransport', icon: 'arrow-left-right' },
    { label: 'Редактор схемы зала', icon: 'layout-grid' },
    { label: 'Прогнозирование', icon: 'activity' },
    { label: 'Импорт данных', icon: 'upload' },
    { label: 'Рестораны', icon: 'store' },
    { label: 'Склад', icon: 'package' },
    { label: 'Конфигуратор плагинов iikoFront', icon: 'puzzle' },
    { label: 'Аналитика', icon: 'bar-chart-3' },
    { label: 'Переводы', icon: 'arrow-left-right' },
    { label: 'Оповещения', icon: 'bell' },
    { label: 'Чаевые', icon: 'banknote' },
    { label: 'События', icon: 'calendar-check' },
    { label: 'Доставка', icon: 'truck' },
    { label: 'Колл-центр', icon: 'smartphone' },
    { label: 'Сервисные Работы', icon: 'wrench' },
    { label: 'Персонал', icon: 'users' },
  ];

  toggleSection(section: SidebarNavItem): void {
    section.expanded = !section.expanded;
  }
}
