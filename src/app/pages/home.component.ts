import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiCardComponent, UiButtonComponent, UiBadgeComponent } from '@/components/ui/index';
import { IconsModule } from '@/shared/icons.module';
import { PROTOTYPES } from '@/shared/prototypes.registry';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiButtonComponent, UiBadgeComponent, IconsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-medium text-text-primary mb-2">Добро пожаловать в iiko Прототипы</h2>
        <p class="text-text-secondary">
          Рабочая область для создания интерактивных прототипов плагинов iikoFront и iikoWeb.
          Выберите прототип из списка ниже или создайте новый.
        </p>
      </div>

      <!-- Prototypes grid -->
      <div *ngIf="prototypes.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ui-card *ngFor="let proto of prototypes" [hoverable]="true" [padding]="'lg'" (cardClick)="navigate(proto.path)">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-iiko-primary/10 text-iiko-primary flex items-center justify-center shrink-0">
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

      <!-- Empty state -->
      <ui-card *ngIf="prototypes.length === 0" padding="lg" class="mb-8">
        <div class="flex flex-col items-center py-8 text-center">
          <lucide-icon name="puzzle" [size]="40" class="text-text-disabled mb-3"></lucide-icon>
          <h3 class="text-base font-medium text-text-primary mb-1">Прототипов пока нет</h3>
          <p class="text-sm text-text-secondary mb-4 max-w-md">
            Создайте первый прототип — опишите задачу, и он будет добавлен в эту рабочую область.
          </p>
        </div>
      </ui-card>

      <!-- Quick guide -->
      <ui-card padding="lg">
        <h3 class="font-medium text-text-primary mb-3 flex items-center gap-2">
          <lucide-icon name="plus" [size]="16"></lucide-icon>
          Как добавить новый прототип
        </h3>
        <ol class="text-sm text-text-secondary space-y-2 list-decimal list-inside">
          <li>Опишите мне задачу — что за плагин/экран нужно прототипировать</li>
          <li>Я создам папку в <code class="bg-surface-secondary px-1 rounded">src/app/prototypes/&lt;имя&gt;/</code></li>
          <li>Добавлю маршрут в <code class="bg-surface-secondary px-1 rounded">app.routes.ts</code> и ссылку в sidebar</li>
          <li>Запускаем <code class="bg-surface-secondary px-1 rounded">npm run dev</code> — и прототип готов</li>
        </ol>
      </ui-card>
    </div>
  `,
})
export class HomeComponent {
  private readonly router = inject(Router);

  readonly prototypes = PROTOTYPES;

  navigate(path: string): void {
    this.router.navigateByUrl(path);
  }
}
