import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiBadgeComponent,
  UiCardComponent,
  UiAlertComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { MOCK_ORDERS } from '../data/mock-data';

@Component({
  selector: 'app-beanshe-notification-demo-screen',
  standalone: true,
  imports: [
    CommonModule,
    UiBreadcrumbsComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiCardComponent,
    UiAlertComponent,
    IconsModule,
  ],
  template: `
    <div class="max-w-3xl animate-fade-in">
      <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

      <div class="mt-4 mb-6">
        <h2 class="text-xl font-medium text-text-primary">Демо блокирующих нотификаций</h2>
        <p class="text-sm text-text-secondary mt-1">
          При поступлении нового заказа плагин показывает полноэкранное уведомление (WPF overlay)
          поверх интерфейса Front. Бариста должен принять или отменить заказ для продолжения работы.
        </p>
      </div>

      <ui-alert variant="info" class="mb-6">
        Нажмите кнопку ниже, чтобы увидеть демонстрацию блокирующей нотификации.
        На реальном терминале Front это будет полноэкранное WPF-окно поверх всех элементов.
      </ui-alert>

      <div class="flex gap-3 mb-8">
        <ui-button variant="primary" iconName="bell" (click)="showNotification()">
          Показать нотификацию
        </ui-button>
      </div>

      <!-- Полноэкранная нотификация (overlay) -->
      <div *ngIf="isNotificationVisible"
        class="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
        style="background: rgba(0, 0, 0, 0.85);"
      >
        <div class="w-full max-w-md mx-4 animate-slide-up">
          <!-- Карточка нотификации -->
          <div class="bg-white rounded-2xl shadow-modal overflow-hidden">
            <!-- Заголовок -->
            <div class="bg-amber-500 px-6 py-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <lucide-icon name="bell" [size]="22" class="text-white"></lucide-icon>
              </div>
              <div>
                <div class="text-white font-semibold text-lg">Новый заказ</div>
                <div class="text-white/80 text-sm">#{{ demoOrder.beanshe_order_id }}</div>
              </div>
            </div>

            <!-- Содержимое -->
            <div class="px-6 py-5 space-y-4">
              <!-- Покупатель -->
              <div class="flex items-center gap-2">
                <lucide-icon name="user" [size]="16" class="text-text-secondary"></lucide-icon>
                <span class="text-text-primary font-medium">{{ demoOrder.customer_name }}</span>
              </div>

              <!-- Время выдачи -->
              <div class="flex items-center gap-2">
                <lucide-icon name="clock" [size]="16" class="text-text-secondary"></lucide-icon>
                <span class="text-text-primary">Выдача: {{ formatTime(demoOrder.pickup_time) }}</span>
                <ui-badge variant="warning">{{ demoOrder.preparation_time_minutes }} мин</ui-badge>
              </div>

              <!-- Состав заказа -->
              <div>
                <div class="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Состав заказа</div>
                <div class="bg-surface-secondary rounded-lg p-3 space-y-2">
                  <div *ngFor="let item of demoOrder.items" class="flex items-start justify-between text-sm">
                    <div>
                      <span class="text-text-primary font-medium">{{ item.product_name }}</span>
                      <span *ngIf="item.size" class="text-text-secondary ml-1">({{ item.size }})</span>
                      <span *ngIf="item.quantity > 1" class="text-text-secondary ml-1">× {{ item.quantity }}</span>
                      <div *ngIf="item.modifications && item.modifications.length > 0" class="text-xs text-text-secondary mt-0.5">
                        + {{ item.modifications.join(', ') }}
                      </div>
                    </div>
                    <span class="text-text-secondary ml-3 whitespace-nowrap">{{ item.price * item.quantity }} ₽</span>
                  </div>
                </div>
              </div>

              <!-- Комментарий -->
              <div *ngIf="demoOrder.comment" class="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-200">
                <lucide-icon name="info" [size]="12" class="inline mr-1"></lucide-icon>
                {{ demoOrder.comment }}
              </div>

              <!-- Итого -->
              <div class="flex items-center justify-between pt-2 border-t border-border">
                <span class="text-text-secondary font-medium">Итого</span>
                <span class="text-xl font-semibold text-text-primary">{{ demoOrder.total_price }} ₽</span>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="px-6 pb-6 flex gap-3">
              <button
                (click)="onAccept()"
                class="flex-1 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700
                       active:bg-green-800 transition-colors text-center"
              >
                <lucide-icon name="check" [size]="18" class="inline mr-1.5 -mt-0.5"></lucide-icon>
                Принять
              </button>
              <button
                (click)="onCancel()"
                class="flex-1 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700
                       active:bg-red-800 transition-colors text-center"
              >
                <lucide-icon name="x" [size]="18" class="inline mr-1.5 -mt-0.5"></lucide-icon>
                Отменить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Результат действия -->
      <ui-alert *ngIf="resultMessage" [variant]="resultVariant" class="mb-6" [dismissible]="true" (dismissed)="resultMessage = ''">
        {{ resultMessage }}
      </ui-alert>

      <!-- Описание механики -->
      <ui-card padding="lg">
        <h3 class="font-medium text-text-primary mb-3">Механика блокирующих нотификаций</h3>
        <div class="space-y-3 text-sm text-text-secondary">
          <div class="flex items-start gap-2">
            <lucide-icon name="info" [size]="14" class="mt-0.5 text-app-primary flex-shrink-0"></lucide-icon>
            <span>Нотификация — полноэкранное WPF-окно (Topmost=true) поверх всех элементов Front</span>
          </div>
          <div class="flex items-start gap-2">
            <lucide-icon name="info" [size]="14" class="mt-0.5 text-app-primary flex-shrink-0"></lucide-icon>
            <span>Показывается автоматически при поступлении нового заказа через polling</span>
          </div>
          <div class="flex items-start gap-2">
            <lucide-icon name="info" [size]="14" class="mt-0.5 text-app-primary flex-shrink-0"></lucide-icon>
            <span>Бариста обязан выбрать «Принять» или «Отменить» для продолжения работы</span>
          </div>
          <div class="flex items-start gap-2">
            <lucide-icon name="info" [size]="14" class="mt-0.5 text-app-primary flex-shrink-0"></lucide-icon>
            <span>Если несколько заказов пришли одновременно — очередь FIFO (по одному)</span>
          </div>
          <div class="flex items-start gap-2">
            <lucide-icon name="info" [size]="14" class="mt-0.5 text-app-primary flex-shrink-0"></lucide-icon>
            <span>Автоотмена: заказ автоматически отменяется за 4 минуты до времени выдачи, если не принят</span>
          </div>
        </div>
      </ui-card>

      <div class="mt-6">
        <ui-button variant="ghost" size="sm" iconName="arrow-left" (click)="goBack()">Назад</ui-button>
      </div>
    </div>
  `,
})
export class BeansheNotificationDemoScreenComponent {
  private router = inject(Router);

  isNotificationVisible = false;
  resultMessage = '';
  resultVariant: 'success' | 'error' | 'info' | 'warning' = 'success';

  demoOrder = MOCK_ORDERS[0];

  breadcrumbs = [
    { label: 'Beanshe', onClick: () => this.goBack() },
    { label: 'Демо нотификаций' },
  ];

  showNotification(): void {
    this.resultMessage = '';
    this.isNotificationVisible = true;
  }

  onAccept(): void {
    this.isNotificationVisible = false;
    this.resultMessage = `Заказ #${this.demoOrder.beanshe_order_id} принят. Заказ будет создан в системе Front.`;
    this.resultVariant = 'success';
  }

  onCancel(): void {
    this.isNotificationVisible = false;
    this.resultMessage = `Заказ #${this.demoOrder.beanshe_order_id} отменён. Статус будет отправлен в Beanshe.`;
    this.resultVariant = 'warning';
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  goBack(): void {
    this.router.navigate(['/prototype/beanshe']);
  }
}
