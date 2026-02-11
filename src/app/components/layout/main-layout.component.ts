import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopBarComponent } from './top-bar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopBarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-surface-secondary">
      <app-sidebar></app-sidebar>
      <div class="flex flex-col flex-1 overflow-hidden">
        <app-top-bar></app-top-bar>
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {}
