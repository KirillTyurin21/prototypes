import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  UiCardComponent,
  UiCardHeaderComponent,
  UiCardTitleComponent,
  UiCardContentComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-halyk-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    UiCardComponent,
    UiCardHeaderComponent,
    UiCardTitleComponent,
    UiCardContentComponent,
    IconsModule,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">API Key Consent</h1>
        <p class="text-gray-500 mt-1">
          Управление доступом банков к данным ресторана через механизм согласия (consent).
          Универсальная страница для всех банков.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ui-card [hoverable]="true" *ngFor="let card of cards" (cardClick)="navigate(card.route)">
          <ui-card-header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                   [class]="card.bgClass">
                <lucide-icon [name]="card.icon" [size]="20" [class]="card.iconClass"></lucide-icon>
              </div>
              <ui-card-title>{{ card.title }}</ui-card-title>
            </div>
          </ui-card-header>
          <ui-card-content>
            <p class="text-sm text-gray-500">{{ card.description }}</p>
          </ui-card-content>
        </ui-card>
      </div>

      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start gap-3">
          <lucide-icon name="info" [size]="18" class="text-blue-600 mt-0.5"></lucide-icon>
          <div>
            <p class="text-sm font-medium text-blue-900">О прототипе</p>
            <p class="text-sm text-blue-700 mt-1">
              Прототип демонстрирует полный цикл consent flow: запрос банка → решение менеджера →
              выдача/отзыв ключа → реакция плагина. Основан на спецификации «API Key + UI Consent».
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HalykMainScreenComponent {
  private router = inject(Router);

  cards = [
    {
      title: 'Раздел «Интеграции»',
      description: 'Имитация раздела Web с кнопкой «API Key» и badge количества ожидающих запросов',
      icon: 'layout-dashboard',
      route: '/prototype/halyk-consent/integrations',
      bgClass: 'bg-blue-100',
      iconClass: 'text-blue-600',
    },
    {
      title: 'Запросы на доступ',
      description: 'Основной экран: карточки запросов, одобрение, отклонение, отзыв ключей, аудит-лог',
      icon: 'key-round',
      route: '/prototype/halyk-consent/access-requests',
      bgClass: 'bg-amber-100',
      iconClass: 'text-amber-600',
    },
    {
      title: 'Реакция плагина',
      description: 'Визуализация того, как плагин Front реагирует на изменение integration_status',
      icon: 'monitor-smartphone',
      route: '/prototype/halyk-consent/plugin-status',
      bgClass: 'bg-green-100',
      iconClass: 'text-green-600',
    },
  ];

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
