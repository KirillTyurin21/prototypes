import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { SidebarSection } from '../types';
import { SIDEBAR_SECTIONS } from '../data/mock-data';

@Component({
  selector: 'app-web-sidebar',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <aside
      class="web-sidebar"
      [class.collapsed]="collapsed"
    >
      <!-- Sidebar title -->
      <div class="sidebar-title" *ngIf="!collapsed">
        <span class="sidebar-title-text">Экраны и звуки</span>
        <button class="sidebar-back-btn">
          <lucide-icon name="chevron-left" [size]="18"></lucide-icon>
        </button>
      </div>

      <div class="sidebar-scroll">
        <div *ngFor="let section of sections" class="section">
          <!-- Collapsible parent section (has items) -->
          <ng-container *ngIf="section.items.length > 0">
            <div
              class="parent-item"
              [class.parent-active]="isSectionActive(section)"
              (click)="toggleSection(section.title)"
            >
              <div class="parent-icon" *ngIf="section.icon">
                <lucide-icon [name]="section.icon" [size]="20"></lucide-icon>
              </div>
              <span class="parent-label" *ngIf="!collapsed">{{ section.title }}</span>
            </div>
            <div class="child-items" *ngIf="expandedSections.has(section.title) && !collapsed">
              <div
                *ngFor="let item of section.items"
                class="child-item"
                [class.active]="activeRoute === item.route"
                (click)="onNavigate(item.route)"
              >
                <div class="active-indicator" *ngIf="activeRoute === item.route"></div>
                <span class="child-label">{{ item.label }}</span>
              </div>
            </div>
          </ng-container>

          <!-- Standalone item (no children, has route) -->
          <ng-container *ngIf="section.items.length === 0 && section.route">
            <div
              class="standalone-item"
              [class.active]="activeRoute === section.route"
              (click)="onNavigate(section.route!)"
            >
              <div class="active-indicator" *ngIf="activeRoute === section.route"></div>
              <div class="parent-icon" *ngIf="section.icon">
                <lucide-icon [name]="section.icon" [size]="20"></lucide-icon>
              </div>
              <span class="parent-label" *ngIf="!collapsed">{{ section.title }}</span>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="footer-links">
          <a href="javascript:void(0)">Помощь</a>
          <a href="javascript:void(0)">О программе</a>
        </div>
        <div class="footer-copy">
          <span>©</span>
          <span class="copy-sep"></span>
          <span>v8.10</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .web-sidebar {
      width: 256px;
      flex-shrink: 0;
      background-color: #f7f8fc;
      box-shadow: 1px 0 1px rgba(158,158,158,.14);
      z-index: 101;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.4s cubic-bezier(.25,.8,.25,1);
      font-family: Roboto, sans-serif;
    }
    .web-sidebar.collapsed {
      width: 72px;
    }

    /* Sidebar title */
    .sidebar-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px 8px;
      font-size: 13px;
      font-weight: 500;
      color: #424242;
    }
    .sidebar-title-text {
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .sidebar-back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: none;
      border-radius: 50%;
      cursor: pointer;
      color: #757575;
      transition: background-color 0.2s;
    }
    .sidebar-back-btn:hover {
      background-color: rgba(0,0,0,0.04);
    }

    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding-top: 4px;
    }
    .section {
      margin-bottom: 0;
    }

    /* Parent item (collapsible section header) */
    .parent-item {
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 24px;
      cursor: pointer;
      user-select: none;
      color: #424242;
      font-size: 14px;
      font-weight: 400;
      transition: background-color 0.15s;
      white-space: nowrap;
      overflow: hidden;
    }
    .parent-item:hover {
      background-color: rgba(0,0,0,0.04);
    }
    .parent-item.parent-active {
      color: #1976d2;
      font-weight: 500;
    }
    .parent-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      margin-right: 16px;
    }
    .parent-label {
      line-height: 20px;
    }

    /* Child items (under expanded section) */
    .child-items {
      padding-left: 0;
    }
    .child-item {
      position: relative;
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 24px 0 60px;
      cursor: pointer;
      user-select: none;
      color: #616161;
      font-size: 13px;
      font-weight: 400;
      transition: background-color 0.15s;
      white-space: nowrap;
      overflow: hidden;
    }
    .child-item:hover {
      background-color: rgba(0,0,0,0.04);
    }
    .child-item.active {
      background-color: #e8f1ff;
      color: #1976d2;
      font-weight: 500;
    }

    /* Standalone item */
    .standalone-item {
      position: relative;
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 24px;
      cursor: pointer;
      user-select: none;
      color: #424242;
      font-size: 14px;
      font-weight: 400;
      transition: background-color 0.15s;
      white-space: nowrap;
      overflow: hidden;
    }
    .standalone-item:hover {
      background-color: rgba(0,0,0,0.04);
    }
    .standalone-item.active {
      background-color: #e8f1ff;
      color: #1976d2;
      font-weight: 500;
    }

    /* Active indicator (blue left bar) */
    .active-indicator {
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      border-radius: 0 4px 4px 0;
      background-color: #448aff;
    }

    .sidebar-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #757575;
    }
    .footer-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }
    .footer-links a {
      color: #448aff;
      text-decoration: none;
      font-size: 12px;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    .footer-copy {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #9e9e9e;
    }
    .copy-sep {
      display: block;
      width: 1px;
      height: 8px;
      background: #e0e0e0;
      margin: 0 8px;
    }
  `],
})
export class WebSidebarComponent implements OnInit, OnChanges {
  @Input() collapsed = false;
  @Input() activeRoute = '';
  @Output() navigate = new EventEmitter<string>();

  sections: SidebarSection[] = SIDEBAR_SECTIONS;
  expandedSections = new Set<string>();

  ngOnInit(): void {
    this.expandSectionForRoute(this.activeRoute);
  }

  ngOnChanges(): void {
    this.expandSectionForRoute(this.activeRoute);
  }

  toggleSection(title: string): void {
    if (this.expandedSections.has(title)) {
      this.expandedSections.delete(title);
    } else {
      this.expandedSections.add(title);
    }
  }

  isSectionActive(section: SidebarSection): boolean {
    return section.items.some(item => item.route === this.activeRoute);
  }

  onNavigate(route: string): void {
    this.navigate.emit(route);
  }

  private expandSectionForRoute(route: string): void {
    for (const section of this.sections) {
      if (section.items.some(item => item.route === route)) {
        this.expandedSections.add(section.title);
      }
    }
  }
}
