import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiCardComponent, UiBreadcrumbsComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-beanshe-main-screen',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiBreadcrumbsComponent, IconsModule],
  template: `
    <div class="max-w-3xl animate-fade-in">
      <ui-breadcrumbs [items]="[{label: 'Beanshe — Плагин Front'}]"></ui-breadcrumbs>

      <div class="mt-4 mb-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <lucide-icon name="coffee" [size]="24" class="text-amber-700"></lucide-icon>
          </div>
          <div>
            <h2 class="text-xl font-medium text-text-primary">Beanshe — Плагин Front</h2>
            <p class="text-sm text-text-secondary">Интеграция кассового терминала с системой мобильных заказов</p>
          </div>
        </div>
      </div>

      <!-- Описание -->
      <div class="bg-surface-secondary rounded-lg p-4 mb-6 border border-border/60">
        <div class="flex items-start gap-3">
          <lucide-icon name="info" [size]="18" class="text-app-primary mt-0.5 flex-shrink-0"></lucide-icon>
          <div class="text-sm text-text-secondary leading-relaxed space-y-1">
            <p>
              Плагин получает заказы из мобильного приложения Beanshe и позволяет баристе
              принимать или отменять их прямо на кассовом терминале Front.
            </p>
            <p>
              После принятия заказ создаётся в системе Front, а дальнейшее
              управление статусами (приготовление, выдача) выполняется через штатные механизмы кассы.
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ui-card *ngFor="let action of pluginActions" [hoverable]="true" [padding]="'lg'" (cardClick)="navigate(action.route)">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" [ngClass]="action.color">
              <lucide-icon [name]="action.icon" [size]="24"></lucide-icon>
            </div>
            <div>
              <h3 class="font-medium text-text-primary">{{ action.title }}</h3>
              <p class="text-sm text-text-secondary mt-0.5">{{ action.description }}</p>
            </div>
          </div>
        </ui-card>
      </div>
    </div>
  `,
})
export class BeansheMainScreenComponent {
  private router = inject(Router);

  pluginActions = [
    {
      icon: 'list',
      title: 'Список заказов',
      description: 'Основное окно плагина: заказы, принятие, отмена, свитч «На смене»',
      route: 'orders',
      color: 'bg-blue-50 text-app-primary',
    },
    {
      icon: 'bell',
      title: 'Демо нотификаций',
      description: 'Блокирующее уведомление о новом заказе (WPF overlay)',
      route: 'notification-demo',
      color: 'bg-orange-50 text-app-accent',
    },
  ];

  navigate(route: string): void {
    if (route) {
      this.router.navigate(['/prototype/beanshe/' + route]);
    }
  }
}
