import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES } from '@/shared/prototypes.registry';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <aside
      class="h-screen flex flex-col bg-sidebar-bg text-sidebar-text transition-all duration-200 shrink-0"
      [class.w-60]="!collapsed"
      [class.w-16]="collapsed"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 h-14 border-b border-white/10">
        <div
          class="w-8 h-8 rounded bg-iiko-primary flex items-center justify-center text-white text-sm font-bold shrink-0"
        >
          ii
        </div>
        <div *ngIf="!collapsed" class="overflow-hidden">
          <div class="text-sm font-semibold text-white leading-tight">iiko Прототипы</div>
          <div class="text-xs text-sidebar-text-muted leading-tight">Workspace</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        <!-- Главная -->
        <a
          routerLink="/"
          routerLinkActive="bg-sidebar-active text-white"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer text-sidebar-text hover:bg-sidebar-hover"
        >
          <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon>
          <span *ngIf="!collapsed">Главная</span>
        </a>

        <!-- Разделитель -->
        <div *ngIf="prototypes.length > 0" class="pt-3 pb-1 px-3">
          <span
            *ngIf="!collapsed"
            class="text-xs uppercase tracking-wider text-sidebar-text-muted"
          >
            Прототипы
          </span>
        </div>

        <!-- Список прототипов -->
        <a
          *ngFor="let proto of prototypes"
          [routerLink]="proto.path"
          class="flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer"
          [ngClass]="isActive(proto.path) ? 'bg-sidebar-active text-white' : 'text-sidebar-text hover:bg-sidebar-hover'"
        >
          <lucide-icon [name]="proto.icon" [size]="18"></lucide-icon>
          <span *ngIf="!collapsed">{{ proto.label }}</span>
        </a>
      </nav>

      <!-- Кнопка сворачивания -->
      <button
        (click)="collapsed = !collapsed"
        class="flex items-center justify-center h-10 border-t border-white/10 text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors"
      >
        <lucide-icon
          [name]="collapsed ? 'chevron-right' : 'chevron-left'"
          [size]="18"
        ></lucide-icon>
      </button>
    </aside>
  `,
})
export class SidebarComponent {
  private router = inject(Router);

  collapsed = false;
  prototypes = PROTOTYPES;

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }
}
