import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ModeSwitcherComponent } from './components/mode-switcher.component';

@Component({
  selector: 'app-aurora-prototype',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ModeSwitcherComponent],
  template: `
    <div class="aurora-shell">
      <app-mode-switcher
        [activeMode]="activeMode"
        (modeChange)="onModeChange($event)"
      ></app-mode-switcher>
      <div class="aurora-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .aurora-shell {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 64px);
    }
    .aurora-content {
      flex: 1;
      padding: 24px;
    }
  `],
})
export class AuroraPrototypeComponent {
  private router = inject(Router);

  activeMode: 'main' | 'plugin' | 'admin' = 'main';

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.updateMode(e.urlAfterRedirects));
    this.updateMode(this.router.url);
  }

  onModeChange(mode: 'main' | 'plugin' | 'admin'): void {
    if (mode === 'main') {
      this.router.navigate(['/prototype/aurora']);
    } else if (mode === 'plugin') {
      this.router.navigate(['/prototype/aurora/plugin/payment']);
    } else {
      this.router.navigate(['/prototype/aurora/admin']);
    }
  }

  private updateMode(url: string): void {
    if (url.includes('/plugin')) {
      this.activeMode = 'plugin';
    } else if (url.includes('/admin')) {
      this.activeMode = 'admin';
    } else {
      this.activeMode = 'main';
    }
  }
}
