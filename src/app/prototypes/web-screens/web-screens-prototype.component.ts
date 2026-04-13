import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { WebHeaderComponent } from './components/web-header.component';
import { WebSidebarComponent } from './components/web-sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-web-screens-prototype',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    WebHeaderComponent,
    WebSidebarComponent,
  ],
  template: `
    <div class="web-shell">
      <!-- Header -->
      <app-web-header
        [pageTitle]="'Advertise screens'"
        (menuToggle)="toggleSidebar()"
      ></app-web-header>

      <!-- Body: sidebar + content -->
      <div class="web-body">
        <!-- Sidebar -->
        <app-web-sidebar
          [collapsed]="sidebarCollapsed"
          [activeRoute]="activeRoute"
          (navigate)="onNavigate($event)"
        ></app-web-sidebar>

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
      min-height: calc(100vh - 64px); /* высота без top-bar основного layout */
      background-color: #ffffff;
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
      padding: 20px 24px;
      background-color: #fafafa;
      overflow-y: auto;
    }
  `],
})
export class WebScreensPrototypeComponent {
  private router = inject(Router);

  sidebarCollapsed = false;
  activeRoute = 'displays';

  constructor() {
    // Определяем активный маршрут при загрузке и при навигации
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.updateActiveRoute(e.urlAfterRedirects);
      });

    // Инициализация из текущего URL
    this.updateActiveRoute(this.router.url);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onNavigate(route: string): void {
    this.router.navigate(['/prototype/web-screens', route]);
  }

  private updateActiveRoute(url: string): void {
    const segments = url.split('/');
    const last = segments[segments.length - 1];
    if (last && last !== 'web-screens') {
      this.activeRoute = last;
    }
  }
}
