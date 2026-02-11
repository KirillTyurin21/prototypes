import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { IikowebHeaderComponent } from './components/iikoweb-header.component';
import { IikowebSidebarComponent } from './components/iikoweb-sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-iikoweb-screens-prototype',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    IikowebHeaderComponent,
    IikowebSidebarComponent,
  ],
  template: `
    <div class="iikoweb-shell">
      <!-- Header -->
      <app-iikoweb-header
        [pageTitle]="'Advertise screens'"
        (menuToggle)="toggleSidebar()"
      ></app-iikoweb-header>

      <!-- Sidebar -->
      <app-iikoweb-sidebar
        [collapsed]="sidebarCollapsed"
        [activeRoute]="activeRoute"
        (navigate)="onNavigate($event)"
      ></app-iikoweb-sidebar>

      <!-- Content -->
      <main
        class="iikoweb-content"
        [class.sidebar-collapsed]="sidebarCollapsed"
      >
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .iikoweb-shell {
      min-height: 100vh;
      background-color: #ffffff;
      font-family: Roboto, sans-serif;
    }
    .iikoweb-content {
      margin-top: 64px;
      margin-left: 256px;
      min-height: calc(100vh - 64px);
      padding: 20px 30px;
      background-color: #ffffff;
      transition: margin-left 0.4s cubic-bezier(.25,.8,.25,1);
    }
    .iikoweb-content.sidebar-collapsed {
      margin-left: 72px;
    }
    @media (max-width: 1023px) {
      .iikoweb-content {
        margin-left: 72px;
      }
    }
    @media (max-width: 767px) {
      .iikoweb-content {
        margin-left: 0;
        padding: 16px;
      }
    }
  `],
})
export class IikowebScreensPrototypeComponent {
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
    this.router.navigate(['/prototype/iikoweb-screens', route]);
  }

  private updateActiveRoute(url: string): void {
    const segments = url.split('/');
    const last = segments[segments.length - 1];
    if (last && last !== 'iikoweb-screens') {
      this.activeRoute = last;
    }
  }
}
