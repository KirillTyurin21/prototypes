import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-web-header',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <header class="web-header">
      <!-- Left section -->
      <div class="header-left">
        <button class="header-btn menu-btn" (click)="menuToggle.emit()">
          <lucide-icon name="menu" [size]="24"></lucide-icon>
        </button>
        <div class="logo">
          <span class="logo-text">Web</span>
        </div>
      </div>

      <!-- Center: page title -->
      <div class="header-center">
        <div class="title-container">
          <span class="page-title">{{ pageTitle }}</span>
          <span *ngIf="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</span>
        </div>
      </div>

      <!-- Right section -->
      <div class="header-right">
        <!-- Search -->
        <div class="search-area" [class.search-open]="searchOpen">
          <input
            *ngIf="searchOpen"
            type="text"
            class="search-input"
            placeholder="Поиск..."
            [(ngModel)]="searchQuery"
            (keydown.escape)="searchOpen = false"
          />
          <button class="header-btn search-toggle" (click)="searchOpen = !searchOpen">
            <lucide-icon [name]="searchOpen ? 'x' : 'search'" [size]="20"></lucide-icon>
          </button>
        </div>

        <!-- Notification bell -->
        <button class="header-btn notification-btn">
          <lucide-icon name="bell" [size]="20"></lucide-icon>
        </button>

        <!-- User -->
        <div class="user-area" (click)="userMenuOpen = !userMenuOpen">
          <div class="user-avatar">
            <lucide-icon name="user" [size]="20"></lucide-icon>
          </div>
          <span class="user-name">Администратор</span>
          <lucide-icon name="chevron-down" [size]="16" class="user-chevron"></lucide-icon>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .web-header {
      position: sticky;
      top: 0;
      z-index: 102;
      height: 64px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      background-color: var(--dt-surface-primary);
      box-shadow: var(--dt-shadow-s);
      font-family: Roboto, sans-serif;
    }
    .header-left {
      display: flex;
      align-items: center;
      min-width: 256px;
      height: 100%;
      padding-left: 16px;
    }
    .header-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: none;
      border-radius: 50%;
      cursor: pointer;
      color: var(--dt-icon-primary);
      transition: background-color 0.2s;
    }
    .header-btn:hover {
      background-color: rgba(0,0,0,0.04);
      color: var(--dt-text-primary);
    }
    .logo {
      display: flex;
      align-items: center;
      margin-left: 16px;
      margin-right: 22px;
      cursor: pointer;
    }
    .logo-text {
      font-size: 28px;
      font-weight: 700;
      color: var(--dt-brand-negative);
      letter-spacing: -0.5px;
    }
    .header-center {
      flex: 1;
      overflow: hidden;
      padding-left: 12px;
    }
    .title-container {
      display: flex;
      flex-direction: column;
    }
    .page-title {
      font-size: 20px;
      font-weight: 500;
      color: var(--dt-text-primary);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .page-subtitle {
      font-size: 12px;
      color: var(--dt-text-secondary);
      line-height: 16px;
    }
    .header-right {
      display: flex;
      align-items: center;
      height: 100%;
      padding-right: 16px;
      gap: 4px;
    }
    .search-area {
      display: flex;
      align-items: center;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: all 0.3s ease;
      padding: 0 4px;
    }
    .search-area.search-open {
      border-color: var(--dt-stroke-accent);
      background: var(--dt-surface-hover);
      flex-grow: 1;
    }
    .search-input {
      border: none;
      outline: none;
      font-size: 14px;
      line-height: 36px;
      background: transparent;
      width: 200px;
      padding: 0 8px;
      font-family: Roboto, sans-serif;
    }
    .search-toggle {
      background: var(--dt-brand-accent-lighter);
    }
    .notification-btn {
      display: flex;
    }
    .user-area {
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 100%;
      cursor: pointer;
      user-select: none;
      gap: 8px;
    }
    .user-area:hover .user-avatar {
      background-color: var(--dt-brand-accent-lighter);
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--dt-brand-accent-lighter);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--dt-icon-accent);
      transition: background-color 0.2s;
    }
    .user-name {
      font-size: 14px;
      color: var(--dt-text-primary);
      white-space: nowrap;
    }
    .user-chevron {
      color: var(--dt-icon-primary);
    }
    @media (max-width: 1023px) {
      .header-left {
        min-width: auto;
      }
      .user-name, .user-chevron {
        display: none;
      }
    }
  `],
})
export class WebHeaderComponent {
  @Input() pageTitle = 'Advertise screens';
  @Input() pageSubtitle = '';
  @Output() menuToggle = new EventEmitter<void>();

  searchOpen = false;
  searchQuery = '';
  userMenuOpen = false;
}
