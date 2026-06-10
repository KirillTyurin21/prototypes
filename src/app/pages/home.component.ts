import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@/components/ui/index';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES, PrototypeEntry } from '@/shared/prototypes.registry';
import { SessionService } from '@/shared/session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent, UiBadgeComponent, IconsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-medium text-text-primary mb-2">Добро пожаловать в Прототипы</h2>
        <p class="text-text-secondary">
          Рабочая область для создания интерактивных прототипов плагинов Front и Web.
          <span *ngIf="session.isMaster()">Выберите прототип из списка ниже или создайте новый.</span>
          <span *ngIf="!session.isMaster() && visiblePrototypes.length > 0">Ниже показаны доступные вам прототипы.</span>
        </p>
      </div>

      <!-- === WEB === -->
      <div *ngIf="webPrototypes.length > 0" class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <lucide-icon name="monitor" [size]="18" class="text-app-primary"></lucide-icon>
          </div>
          <h3 class="text-lg font-semibold text-text-primary">WEB</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui-card *ngFor="let proto of webPrototypes" [hoverable]="true" [padding]="'lg'" (cardClick)="navigate(proto.path)">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-app-primary flex items-center justify-center shrink-0">
                <lucide-icon [name]="proto.icon" [size]="20"></lucide-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium text-text-primary truncate">{{ proto.label }}</h3>
                  <ui-badge variant="primary">Прототип</ui-badge>
                </div>
                <p *ngIf="proto.description" class="text-sm text-text-secondary">{{ proto.description }}</p>
              </div>
              <lucide-icon name="arrow-right" [size]="18" class="text-text-disabled shrink-0 mt-1"></lucide-icon>
            </div>
          </ui-card>
        </div>
      </div>

      <!-- === FRONT === -->
      <div *ngIf="frontPrototypes.length > 0">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <lucide-icon name="credit-card" [size]="18" class="text-app-accent"></lucide-icon>
          </div>
          <h3 class="text-lg font-semibold text-text-primary">FRONT</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ui-card *ngFor="let proto of frontPrototypes" [hoverable]="true" [padding]="'lg'" (cardClick)="navigate(proto.path)">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-app-accent flex items-center justify-center shrink-0">
                <lucide-icon [name]="proto.icon" [size]="20"></lucide-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium text-text-primary truncate">{{ proto.label }}</h3>
                  <ui-badge variant="primary">Прототип</ui-badge>
                </div>
                <p *ngIf="proto.description" class="text-sm text-text-secondary">{{ proto.description }}</p>
              </div>
              <lucide-icon name="arrow-right" [size]="18" class="text-text-disabled shrink-0 mt-1"></lucide-icon>
            </div>
          </ui-card>
        </div>
      </div>

      <!-- Fallback: если категорий нет — показываем всё как раньше -->
      <div *ngIf="webPrototypes.length === 0 && frontPrototypes.length === 0 && visiblePrototypes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ui-card *ngFor="let proto of visiblePrototypes" [hoverable]="true" [padding]="'lg'" (cardClick)="navigate(proto.path)">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-app-primary/10 text-app-primary flex items-center justify-center shrink-0">
              <lucide-icon [name]="proto.icon" [size]="20"></lucide-icon>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-medium text-text-primary truncate">{{ proto.label }}</h3>
                <ui-badge variant="primary">Прототип</ui-badge>
              </div>
              <p *ngIf="proto.description" class="text-sm text-text-secondary">{{ proto.description }}</p>
            </div>
            <lucide-icon name="arrow-right" [size]="18" class="text-text-disabled shrink-0 mt-1"></lucide-icon>
          </div>
        </ui-card>
      </div>
    </div>
  `,
})
export class HomeComponent {
  private readonly router = inject(Router);
  readonly session = inject(SessionService);

  get visiblePrototypes() {
    if (this.session.isMaster()) return PROTOTYPES;
    return PROTOTYPES.filter(p => {
      const slug = p.path.replace('/prototype/', '');
      return this.session.hasAccess(slug);
    });
  }

  get webPrototypes(): PrototypeEntry[] {
    return this.visiblePrototypes.filter(p => p.category === 'web');
  }

  get frontPrototypes(): PrototypeEntry[] {
    return this.visiblePrototypes.filter(p => p.category === 'front');
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
  }
}
