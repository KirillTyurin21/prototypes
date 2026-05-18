import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiCardComponent,
  UiCardContentComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { MOCK_ACCESS_REQUESTS } from '../data/mock-data';

@Component({
  selector: 'app-integrations-screen',
  standalone: true,
  imports: [
    CommonModule,
    UiBreadcrumbsComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiCardComponent,
    UiCardContentComponent,
    IconsModule,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">
      <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

      <div class="mt-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Интеграции</h1>
        <p class="text-gray-500 mt-1">Управление подключениями внешних систем</p>
      </div>

      <!-- Simulated Web section -->
      <div class="border border-gray-200 rounded-lg bg-white">
        <!-- Section header -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <lucide-icon name="plug" [size]="18" class="text-gray-600"></lucide-icon>
              <span class="font-medium text-gray-900">Подключения банков</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <lucide-icon name="user" [size]="14"></lucide-icon>
              Роль: Менеджер
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <p class="text-sm text-gray-600 mb-4">
            Управление доступом внешних платёжных систем (банков) к данным вашего ресторана.
            Банки запрашивают доступ к меню, заказам и столам для реализации QR-оплаты.
          </p>

          <!-- API Key button with badge -->
          <div class="flex items-center gap-4">
            <div *ngIf="pendingCount > 0" class="relative">
              <ui-button variant="primary" iconName="key-round" (click)="goToRequests()">
                API Key
              </ui-button>
              <span class="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {{ pendingCount }}
              </span>
            </div>

            <div *ngIf="pendingCount === 0" class="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div class="flex items-center gap-2">
                <lucide-icon name="check-circle" [size]="16" class="text-green-500"></lucide-icon>
                <span class="text-sm text-gray-600">Нет ожидающих запросов</span>
              </div>
            </div>
          </div>

          <!-- Info about visibility rule -->
          <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="flex items-start gap-2">
              <lucide-icon name="alert-triangle" [size]="14" class="text-amber-600 mt-0.5"></lucide-icon>
              <p class="text-xs text-amber-700">
                По спецификации: кнопка «API Key» видна только при наличии ожидающих запросов
                и только для ролей Manager / Administrator.
              </p>
            </div>
          </div>
        </div>

        <!-- Existing integrations summary -->
        <div class="border-t border-gray-100 p-4">
          <p class="text-xs font-medium text-gray-500 uppercase mb-3">Активные подключения</p>
          <div class="space-y-2">
            <div *ngFor="let item of approvedRequests"
                 class="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-sm text-gray-700">{{ item.bank_name }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatScope(item.scope) }}</span>
            </div>
            <p *ngIf="approvedRequests.length === 0" class="text-sm text-gray-400 italic">
              Нет активных подключений
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class IntegrationsScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Главная', onClick: () => this.router.navigate(['/prototype/halyk-consent']) },
    { label: 'Интеграции' },
  ];

  get pendingCount(): number {
    return MOCK_ACCESS_REQUESTS.filter(r => r.status === 'pending').length;
  }

  get approvedRequests() {
    return MOCK_ACCESS_REQUESTS.filter(r => r.status === 'approved' || r.status === 'active');
  }

  goToRequests(): void {
    this.router.navigate(['/prototype/halyk-consent/access-requests']);
  }

  formatScope(scope: string[]): string {
    return scope.join(', ');
  }
}
