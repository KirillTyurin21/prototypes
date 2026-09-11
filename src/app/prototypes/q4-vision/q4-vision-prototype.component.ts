import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { filter } from 'rxjs/operators';
import { Q4_NAV } from './data/mock-data';
import { Q4NavGroup, Q4NavItem } from './types';

const PAGE_TITLES: Record<string, string> = {
  overview: 'Обзор Q4',
  'task-1-1': 'Кампании — Где показывать',
  'task-1-2': 'Кампании — Готовность',
  'task-2-1': 'Подсказки — Где показывать',
  'task-2-2': 'Подсказки — Готовность',
  'task-3-1': 'Конструктор темы — Страницы',
  'task-3-2': 'Конструктор темы — Контролы',
  'task-3-3': 'Конструктор темы — Копирование',
  'task-4-1': 'Конструктор темы — Теги',
  'task-4-2': 'Конструктор темы — Цветовые схемы',
  'task-5': 'Конструктор — Аналитика',
  'task-6': 'Стартовая страница',
};

@Component({
  selector: 'app-q4-vision-prototype',
  standalone: true,
  imports: [CommonModule, RouterOutlet, IconsModule],
  template: `
    <div class="q4-shell">
      <!-- Header -->
      <header class="q4-header">
        <div class="q4-header-left">
          <button class="q4-icon-btn" (click)="sidebarCollapsed = !sidebarCollapsed" aria-label="Меню">
            <lucide-icon name="menu" [size]="22"></lucide-icon>
          </button>
          <span class="q4-logo">Web</span>
        </div>
        <div class="q4-header-center">
          <span class="q4-title">{{ pageTitle }}</span>
          <span class="q4-subtitle">Экраны и звуки</span>
        </div>
        <div class="q4-header-right">
          <span class="q4-meeting-badge">Встреча по плану Q4</span>
        </div>
      </header>

      <!-- Body -->
      <div class="q4-body">
        <aside class="q4-sidebar" [class.collapsed]="sidebarCollapsed">
          <div class="q4-sidebar-title" *ngIf="!sidebarCollapsed">
            <span class="q4-sidebar-title-text">Экраны и звуки</span>
            <button class="q4-sidebar-back" aria-label="Назад">
              <lucide-icon name="chevron-left" [size]="18"></lucide-icon>
            </button>
          </div>

          <div class="q4-sidebar-scroll">
            <ng-container *ngFor="let group of navGroups">
              <!-- standalone -->
              <div
                *ngIf="group.route && !group.items"
                class="q4-nav-item"
                [class.active]="activeRoute === group.route"
                (click)="navigate(group.route!)"
              >
                <div class="q4-nav-indicator" *ngIf="activeRoute === group.route"></div>
                <lucide-icon *ngIf="group.icon && !sidebarCollapsed" [name]="group.icon" [size]="18"></lucide-icon>
                <span class="q4-nav-label" *ngIf="!sidebarCollapsed">{{ group.label }}</span>
              </div>

              <!-- group -->
              <ng-container *ngIf="group.items">
                <div
                  class="q4-nav-item q4-nav-group"
                  [class.group-active]="isGroupActive(group)"
                  (click)="toggleGroup(group)"
                >
                  <lucide-icon *ngIf="group.icon && !sidebarCollapsed" [name]="group.icon" [size]="18"></lucide-icon>
                  <span class="q4-nav-label" *ngIf="!sidebarCollapsed">{{ group.label }}</span>
                  <lucide-icon
                    *ngIf="!sidebarCollapsed"
                    [name]="isGroupExpanded(group) ? 'chevron-up' : 'chevron-down'"
                    [size]="16"
                    class="q4-nav-chevron"
                  ></lucide-icon>
                </div>
                <div *ngIf="isGroupExpanded(group) && !sidebarCollapsed" class="q4-nav-children">
                  <div
                    *ngFor="let item of group.items"
                    class="q4-nav-item q4-nav-child"
                    [class.active]="activeRoute === item.route"
                    (click)="navigate(item.route)"
                  >
                    <div class="q4-nav-indicator" *ngIf="activeRoute === item.route"></div>
                    <span class="q4-nav-label">{{ item.label }}</span>
                  </div>
                </div>
              </ng-container>
            </ng-container>
          </div>

          <div class="q4-sidebar-footer" *ngIf="!sidebarCollapsed">
            <div class="q4-footer-links">
              <span class="q4-footer-link">Помощь</span>
              <span class="q4-footer-link">О программе</span>
            </div>
            <div class="q4-footer-copy">©<span class="q4-copy-sep"></span>v9.6</div>
          </div>
        </aside>

        <main class="q4-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; margin: -24px; }
      .q4-shell {
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - 64px);
        background-color: var(--dt-surface-hover);
        font-family: Roboto, sans-serif;
      }
      .q4-header {
        position: sticky;
        top: 0;
        z-index: 102;
        height: 64px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        background-color: var(--dt-surface-primary);
        box-shadow: var(--dt-shadow-s);
        padding: 0 16px;
      }
      .q4-header-left { display: flex; align-items: center; gap: 8px; min-width: 256px; }
      .q4-logo {
        font-size: 28px;
        font-weight: 700;
        color: #FF5252;
        letter-spacing: 0.5px;
      }
      .q4-header-center { flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
      .q4-title {
        font-size: 20px;
        font-weight: 500;
        color: #333333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .q4-subtitle { font-size: 12px; color: #616161; }
      .q4-meeting-badge {
        font-size: 12px;
        color: #448AFF;
        background: #F0F5FF;
        border-radius: 999px;
        padding: 4px 12px;
        font-weight: 500;
        white-space: nowrap;
      }
      .q4-icon-btn {
        display: flex; align-items: center; justify-content: center;
        width: 40px; height: 40px;
        border: none; background: transparent;
        border-radius: 4px;
        color: #616161;
        cursor: pointer;
        flex-shrink: 0;
      }
      .q4-icon-btn:hover { background: rgba(0,0,0,.04); }
      .q4-body { display: flex; flex: 1; overflow: hidden; }

      .q4-sidebar {
        width: 256px;
        flex-shrink: 0;
        background-color: var(--dt-surface-variant);
        box-shadow: 1px 0 0 var(--dt-stroke-default);
        z-index: 101;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: width 0.25s ease-out;
      }
      .q4-sidebar.collapsed { width: 72px; }
      .q4-sidebar-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px 8px;
      }
      .q4-sidebar-title-text {
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        color: #333333;
      }
      .q4-sidebar-back {
        display: flex; align-items: center; justify-content: center;
        width: 28px; height: 28px;
        border: none; background: transparent; border-radius: 4px;
        color: #616161;
        cursor: pointer;
      }
      .q4-sidebar-back:hover { background: #EBEBEB; }
      .q4-sidebar-scroll { flex: 1; overflow-y: auto; padding: 8px 0; }
      .q4-sidebar-footer { padding: 16px 24px 20px; border-top: 1px solid var(--dt-stroke-disable); }
      .q4-footer-links { display: flex; gap: 16px; margin-bottom: 10px; }
      .q4-footer-link { font-size: 12px; color: #448AFF; cursor: pointer; }
      .q4-footer-link:hover { text-decoration: underline; }
      .q4-footer-copy { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9E9E9E; }
      .q4-copy-sep { width: 1px; height: 12px; background: #9E9E9E; }

      .q4-nav-item {
        position: relative;
        display: flex; align-items: center; gap: 12px;
        padding: 0 16px;
        height: 48px;
        font-size: 14px;
        color: #333333;
        cursor: pointer;
        user-select: none;
      }
      .q4-nav-item:hover { background: var(--dt-surface-hover); }
      .q4-nav-item.active {
        background: var(--dt-surface-sidebar-selected);
        color: var(--dt-brand-accent);
        font-weight: 500;
      }
      .q4-nav-indicator {
        position: absolute; left: 0; top: 14px; bottom: 14px;
        width: 4px; border-radius: 0 4px 4px 0;
        background: var(--dt-brand-accent);
      }
      .q4-nav-group { font-weight: 500; }
      .q4-nav-group.group-active { color: var(--dt-brand-accent); }
      .q4-nav-chevron { margin-left: auto; color: #616161; flex-shrink: 0; }
      .q4-nav-children { border-bottom: 1px solid var(--dt-stroke-disable); padding-bottom: 4px; margin-bottom: 4px; }
      .q4-nav-child { height: 40px; padding-left: 44px; font-size: 13px; font-weight: 400; color: #333333; }
      .q4-nav-child .q4-nav-indicator { top: 10px; bottom: 10px; }
      .q4-nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .q4-nav-item lucide-icon { flex-shrink: 0; color: #616161; }
      .q4-nav-item.active lucide-icon { color: var(--dt-brand-accent); }
      .q4-nav-group.group-active lucide-icon { color: var(--dt-brand-accent); }

      .q4-content { flex: 1; min-width: 0; overflow-y: auto; }
    `,
  ],
})
export class Q4VisionPrototypeComponent {
  private router = inject(Router);

  navGroups: Q4NavGroup[] = Q4_NAV;
  activeRoute = 'overview';
  sidebarCollapsed = false;
  private expanded = new Set<string>(['Цель 3 — Конструктор']);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        const parts = url.split('/');
        this.activeRoute = parts[parts.length - 1] || 'overview';
      });
  }

  navigate(route: string): void {
    this.router.navigate(['/prototype/q4-vision', route]);
  }

  get pageTitle(): string {
    return PAGE_TITLES[this.activeRoute] || 'Демо Q4 — Целевое видение';
  }

  isGroupActive(group: Q4NavGroup): boolean {
    return !!group.items?.some((i: Q4NavItem) => i.route === this.activeRoute);
  }

  isGroupExpanded(group: Q4NavGroup): boolean {
    return this.expanded.has(group.label);
  }

  toggleGroup(group: Q4NavGroup): void {
    if (this.expanded.has(group.label)) {
      this.expanded.delete(group.label);
    } else {
      this.expanded.add(group.label);
    }
  }
}
