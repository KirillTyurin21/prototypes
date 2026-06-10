import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WebHeaderComponent } from '../web-screens/components/web-header.component';
import { WebSettingsSidebarComponent } from './components/web-settings-sidebar.component';

@Component({
  selector: 'app-web-settings-prototype',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    WebHeaderComponent,
    WebSettingsSidebarComponent,
  ],
  template: `
    <div class="web-shell">
      <!-- Header -->
      <app-web-header
        [pageTitle]="'Общие настройки'"
        [pageSubtitle]="'Права доступа'"
        (menuToggle)="toggleSidebar()"
      ></app-web-header>

      <!-- Body: sidebar + content -->
      <div class="web-body">
        <!-- Sidebar -->
        <app-web-settings-sidebar
          [collapsed]="sidebarCollapsed"
        ></app-web-settings-sidebar>

        <!-- Content -->
        <main class="web-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: -24px; /* компенсируем p-6 от main-layout */
    }
    .web-shell {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 64px);
      background-color: var(--dt-surface-primary);
      font-family: Roboto, sans-serif;
    }
    .web-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .web-content {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      background-color: var(--dt-surface-primary, #fff);
    }
  `],
})
export class WebSettingsPrototypeComponent {
  sidebarCollapsed = false;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
