import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCardComponent, UiCardContentComponent, UiButtonComponent, UiStatusDotComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { PaymentIntegration, AccountType } from '../types';

@Component({
  selector: 'app-integration-card',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiCardContentComponent, UiButtonComponent, UiStatusDotComponent, IconsModule],
  template: `
    <ui-card [hoverable]="true" (cardClick)="onCardClick()">
      <ui-card-content>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
            [class]="integration.logoColor">
            {{ integration.logoLetter }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate text-gray-900">{{ integration.name }}</p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <ui-status-dot
                [color]="isConnected ? 'green' : 'gray'"
                [pulse]="false">
              </ui-status-dot>
              <span class="text-xs" [class.text-green-600]="isConnected" [class.text-gray-400]="!isConnected">
                {{ statusLabel }}
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="isConnected" class="mt-3 pt-3 border-t border-gray-100">
          <p class="text-xs text-gray-500">
            Подключено ТП: {{ integration.connectedRestaurantIds.length }}
          </p>
        </div>

        <div class="flex gap-2 mt-3" (click)="$event.stopPropagation()">
          <ui-button
            *ngIf="!isConnected"
            size="sm"
            (click)="connect.emit(integration.id)">
            Подключить
          </ui-button>
          <ui-button
            *ngIf="isConnected"
            size="sm"
            variant="outline"
            (click)="openDetail.emit(integration.id)">
            Настроить
          </ui-button>
          <ui-button
            *ngIf="isConnected"
            size="sm"
            variant="ghost"
            class="text-red-500"
            (click)="disconnect.emit(integration.id)">
            Отключить
          </ui-button>
        </div>
      </ui-card-content>
    </ui-card>
  `,
})
export class IntegrationCardComponent {
  @Input() integration!: PaymentIntegration;
  @Input() accountType: AccountType = 'chain';

  @Output() connect = new EventEmitter<string>();
  @Output() openDetail = new EventEmitter<string>();
  @Output() disconnect = new EventEmitter<string>();

  get isConnected(): boolean {
    return this.integration.status === 'connected';
  }

  get statusLabel(): string {
    return this.isConnected ? 'Подключен' : 'Не подключен';
  }

  onCardClick(): void {
    if (this.isConnected) {
      this.openDetail.emit(this.integration.id);
    } else {
      this.connect.emit(this.integration.id);
    }
  }
}
