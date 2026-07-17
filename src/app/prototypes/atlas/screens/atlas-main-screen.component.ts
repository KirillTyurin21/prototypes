import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiButtonComponent, UiSkeletonComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { PaymentIntegration, AccountType } from '../types';
import { MOCK_INTEGRATIONS } from '../data/mock-data';
import { IntegrationCardComponent } from '../components/integration-card.component';

@Component({
  selector: 'app-atlas-main-screen',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiSkeletonComponent, IntegrationCardComponent, IconsModule],
  template: `
    <!-- Account type toggle -->
    <div class="flex items-center gap-3 px-6 py-2.5 bg-gray-50 border-b border-gray-200">
      <span class="text-xs text-gray-500">Режим просмотра:</span>
      <div class="flex rounded-md border border-gray-300 overflow-hidden">
        <button
          (click)="accountType = 'chain'"
          class="px-3 py-1 text-xs transition-colors"
          [class.bg-gray-900]="accountType === 'chain'"
          [class.text-white]="accountType === 'chain'"
          [class.text-gray-600]="accountType !== 'chain'"
          [class.hover:bg-gray-100]="accountType !== 'chain'">
          Чейн (15 ресторанов)
        </button>
        <button
          (click)="accountType = 'rms'"
          class="px-3 py-1 text-xs transition-colors border-l border-gray-300"
          [class.bg-gray-900]="accountType === 'rms'"
          [class.text-white]="accountType === 'rms'"
          [class.text-gray-600]="accountType !== 'rms'"
          [class.hover:bg-gray-100]="accountType !== 'rms'">
          RMS (1 ресторан)
        </button>
      </div>
      <span class="ml-auto text-xs text-gray-400">
        <lucide-icon name="info" [size]="12" class="inline-block mr-1 -mt-0.5"></lucide-icon>
        Демонстрация контекста: {{ accountType === 'chain' ? 'управляющий сетью' : 'менеджер ресторана' }}
      </span>
    </div>

    <!-- Page header -->
    <div class="px-6 py-5">
      <h1 class="text-xl font-semibold text-gray-900">Подключение платёжных систем</h1>
      <p class="text-sm text-gray-500 mt-1">
        Выберите платёжную систему для подключения. При наличии лицензии вы можете быстро подключить сервис
        к вашим ресторанам — тип оплаты и скидка будут созданы автоматически.
      </p>
    </div>

    <!-- Content -->
    <div class="px-6 pb-8 max-w-3xl">
      <!-- Loading -->
      <div *ngIf="integrations.length === 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let _ of [0, 1]" class="border border-gray-200 rounded-lg p-5 space-y-3">
          <div class="flex items-center gap-3">
            <ui-skeleton className="w-10 h-10 rounded-lg"></ui-skeleton>
            <div class="space-y-1.5 flex-1">
              <ui-skeleton className="h-4 w-24"></ui-skeleton>
              <ui-skeleton className="h-3 w-16"></ui-skeleton>
            </div>
          </div>
          <ui-skeleton className="h-9 w-28"></ui-skeleton>
        </div>
      </div>

      <!-- Cards -->
      <div *ngIf="integrations.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        <app-integration-card
          *ngFor="let integration of integrations; trackBy: trackById"
          [integration]="integration"
          [accountType]="accountType"
          (connect)="navigateToConnect($event)"
          (openDetail)="navigateToDetail($event)"
          (disconnect)="quickDisconnect($event)">
        </app-integration-card>
      </div>
    </div>

    <!-- Toast -->
    <div
      *ngIf="toastMessage"
      class="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 max-w-sm animate-slide-up">
      <p class="text-sm font-medium text-gray-900">{{ toastMessage }}</p>
    </div>
  `,
})
export class AtlasMainScreenComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);

  integrations: PaymentIntegration[] = [];
  accountType: AccountType = 'chain';
  toastMessage = '';

  ngOnInit(): void {
    this.integrations = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
  }

  navigateToConnect(integrationId: string): void {
    this.router.navigate(['/prototype/atlas', integrationId, 'connect']);
  }

  navigateToDetail(integrationId: string): void {
    this.router.navigate(['/prototype/atlas', integrationId]);
  }

  quickDisconnect(integrationId: string): void {
    const integration = this.integrations.find(i => i.id === integrationId);
    if (!integration) return;
    integration.status = 'disconnected';
    integration.connectedRestaurantIds = [];
    for (const cat of integration.operationCategories) {
      cat.allowed = false;
    }
    this.persist();
    this.toastMessage = integration.name + ' отключен';
    setTimeout(() => { this.toastMessage = ''; }, 2500);
  }

  trackById(_: number, item: PaymentIntegration): string {
    return item.id;
  }

  private persist(): void {
    this.storage.save('atlas', 'integrations', this.integrations);
  }
}
