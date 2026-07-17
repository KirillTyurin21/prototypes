import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiDividerComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { PaymentTypeInfo, DiscountInfo } from '../types';

@Component({
  selector: 'app-payment-type-summary',
  standalone: true,
  imports: [CommonModule, UiDividerComponent, IconsModule],
  template: `
    <div class="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
      <h4 class="text-sm font-semibold text-gray-700">Будет создано автоматически</h4>

      <!-- Тип оплаты -->
      <div *ngIf="paymentType" class="flex items-start gap-3">
        <lucide-icon name="credit-card" [size]="18" class="text-blue-500 mt-0.5 shrink-0"></lucide-icon>
        <div>
          <p class="text-sm font-medium text-gray-900">Тип оплаты «{{ paymentType.name }}»</p>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ paymentType.fiscal ? 'Фискальный' : 'Нефискальный' }}
            &middot; Кнопка на кассе: «{{ paymentType.buttonLabel }}»
          </p>
        </div>
      </div>

      <ui-divider *ngIf="paymentType && discount"></ui-divider>

      <!-- Скидка -->
      <div *ngIf="discount" class="flex items-start gap-3">
        <lucide-icon name="percent" [size]="18" class="text-orange-500 mt-0.5 shrink-0"></lucide-icon>
        <div>
          <p class="text-sm font-medium text-gray-900">Скидка «{{ discount.name }}»</p>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ discount.percent }}% &middot; Привязана к «{{ discount.linkedToPaymentType }}»
          </p>
        </div>
      </div>

      <!-- Нет данных -->
      <p *ngIf="!paymentType && !discount" class="text-xs text-gray-400">
        Нет данных о создаваемых сущностях
      </p>
    </div>
  `,
})
export class PaymentTypeSummaryComponent {
  @Input() paymentType: PaymentTypeInfo | null = null;
  @Input() discount: DiscountInfo | null = null;
}
