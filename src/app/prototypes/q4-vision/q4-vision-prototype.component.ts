import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { filter } from 'rxjs/operators';
import { Q4_NAV } from './data/mock-data';
import { Q4NavGroup, Q4NavItem } from './types';

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
          <span class="q4-title">Демо Q4 — Целевое видение</span>
        </div>
        <div class="q4-header-right">
          <span class="q4-meeting-badge">Встреча по плану Q4</span>
        </div>
      </header>

      <!-- Body -->
      <div class="q4-body">
        <aside class="q4-sidebar" [class.collapsed]="sidebarCollapsed">
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
        background-color: var(--dt-surface-variant);
        font-family: Roboto, sans-serif;
      }
      .q4-header {
        position: sticky;
        top: 0;
        z-index: 100;
        height: 56px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        background-color: var(--dt-surface-primary);
        box-shadow: var(--dt-shadow-sl);
        padding: 0 16px;
        gap: 16px;
      }
      .q4-header-left { display: flex; align-items: center; gap: 12px; min-width: 220px; }
      .q4-logo {
        font-size: 18px;
        font-weight: 700;
        color: var(--dt-brand-accent);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .q4-header-center { flex: 1; display: flex; justify-content: center; }
      .q4-title { font-size: 16px; font-weight: 500; color: var(--dt-text-primary); }
      .q4-meeting-badge {
        font-size: 12px;
        color: var(--dt-brand-accent);
        background: var(--dt-brand-accent-lighter);
        border-radius: 999px;
        padding: 4px 12px;
        font-weight: 500;
      }
      .q4-icon-btn {
        display: flex; align-items: center; justify-content: center;
        width: 36px; height: 36px;
        border: none; background: transparent;
        border-radius: 4px;
        color: var(--dt-icon-primary);
        cursor: pointer;
      }
      .q4-icon-btn:hover { background: #EBEBEB; }
      .q4-body { display: flex; flex: 1; overflow: hidden; }

      .q4-sidebar {
        width: 264px;
        flex-shrink: 0;
        background-color: var(--dt-surface-primary);
        box-shadow: 1px 0 0 var(--dt-stroke-default);
        overflow-y: auto;
        transition: width 0.2s ease-out;
      }
      .q4-sidebar.collapsed { width: 56px; }
      .q4-sidebar-scroll { padding: 8px 0 24px; }

      .q4-nav-item {
        position: relative;
        display: flex; align-items: center; gap: 10px;
        padding: 0 16px;
        height: 36px;
        font-size: 13px;
        color: var(--dt-text-primary);
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
        position: absolute; left: 0; top: 8px; bottom: 8px;
        width: 3px; border-radius: 0 3px 3px 0;
        background: var(--dt-brand-accent);
      }
      .q4-nav-group { font-weight: 500; }
      .q4-nav-group.group-active { color: var(--dt-brand-accent); }
      .q4-nav-chevron { margin-left: auto; color: var(--dt-icon-primary); }
      .q4-nav-children { border-bottom: 1px solid var(--dt-stroke-disable); padding-bottom: 4px; margin-bottom: 4px; }
      .q4-nav-child { padding-left: 44px; font-weight: 400; }
      .q4-nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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
