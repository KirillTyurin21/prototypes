import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiCardComponent,
  UiCardHeaderComponent,
  UiCardTitleComponent,
  UiCardContentComponent,
  UiStatusDotComponent,
  UiConfirmDialogComponent,
  UiEmptyStateComponent,
  UiSkeletonComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { PaymentIntegration, AccountType, RestaurantNode } from '../types';
import { MOCK_INTEGRATIONS, MOCK_CHAIN_RESTAURANTS, MOCK_RMS_RESTAURANT } from '../data/mock-data';
import { RestaurantTreeComponent } from '../components/restaurant-tree.component';
import { OperationCategoryListComponent } from '../components/operation-category-list.component';
import { PaymentTypeSummaryComponent } from '../components/payment-type-summary.component';

@Component({
  selector: 'app-atlas-integration-detail',
  standalone: true,
  imports: [
    CommonModule,
    UiBreadcrumbsComponent, UiButtonComponent, UiCardComponent, UiCardHeaderComponent,
    UiCardTitleComponent, UiCardContentComponent, UiStatusDotComponent, UiConfirmDialogComponent,
    UiEmptyStateComponent, UiSkeletonComponent,
    RestaurantTreeComponent, OperationCategoryListComponent, PaymentTypeSummaryComponent,
    IconsModule,
  ],
  template: `
    <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

    <div class="max-w-3xl mx-auto px-6 pb-8 animate-fade-in">
      <!-- Loading -->
      <ng-container *ngIf="!integration">
        <div class="space-y-6">
          <div class="flex items-center gap-4">
            <ui-skeleton className="w-12 h-12 rounded-lg"></ui-skeleton>
            <div class="space-y-2">
              <ui-skeleton className="h-6 w-40"></ui-skeleton>
              <ui-skeleton className="h-4 w-24"></ui-skeleton>
            </div>
          </div>
          <ui-skeleton className="h-48 w-full rounded-lg"></ui-skeleton>
          <ui-skeleton className="h-32 w-full rounded-lg"></ui-skeleton>
        </div>
      </ng-container>

      <!-- Content -->
      <ng-container *ngIf="integration">
        <!-- Status Header -->
        <div class="flex items-start gap-4 mb-6">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold shrink-0"
            [class]="integration.logoColor">
            {{ integration.logoLetter }}
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-xl font-semibold text-gray-900">{{ integration.name }}</h1>
            <div class="flex items-center gap-2 mt-1">
              <ui-status-dot
                [color]="isConnected ? 'green' : 'gray'"
                [pulse]="isConnected">
              </ui-status-dot>
              <span
                class="text-sm"
                [class.text-green-600]="isConnected"
                [class.text-gray-500]="!isConnected">
                {{ statusLabel }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <ui-button
              *ngIf="!isConnected"
              (click)="navigateToConnect()">
              <lucide-icon name="plug" [size]="16" class="mr-1.5"></lucide-icon>
              Подключить
            </ui-button>
            <ui-button
              *ngIf="isConnected"
              variant="outline"
              (click)="navigateToConnect()">
              <lucide-icon name="settings" [size]="16" class="mr-1.5"></lucide-icon>
              Изменить
            </ui-button>
            <ui-button
              *ngIf="isConnected"
              variant="danger"
              (click)="showDisconnectConfirm = true">
              <lucide-icon name="unplug" [size]="16" class="mr-1.5"></lucide-icon>
              Отключить
            </ui-button>
          </div>
        </div>

        <!-- Disconnected state -->
        <ui-empty-state
          *ngIf="!isConnected"
          title="Система не подключена"
          description="Нажмите «Подключить», чтобы начать процесс интеграции с {{ integration.name }}."
          iconName="plug">
        </ui-empty-state>

        <!-- Connected state -->
        <div *ngIf="isConnected" class="space-y-5">
          <!-- Block 1: Restaurants -->
          <ui-card>
            <ui-card-header>
              <ui-card-title>
                <lucide-icon name="store" [size]="18" class="mr-2 inline-block text-gray-500"></lucide-icon>
                Подключённые рестораны ({{ connectedCount }})
              </ui-card-title>
            </ui-card-header>
            <ui-card-content>
              <app-restaurant-tree
                [restaurants]="restaurantTree"
                mode="view">
              </app-restaurant-tree>
              <p *ngIf="customSettingsCount > 0" class="text-xs text-amber-600 mt-3 flex items-center gap-1">
                <lucide-icon name="info" [size]="12"></lucide-icon>
                {{ customSettingsCount }} ресторанов имеют индивидуальные настройки операций и реквизитов
              </p>
            </ui-card-content>
          </ui-card>

          <!-- Block 2: Operations -->
          <ui-card>
            <ui-card-header>
              <ui-card-title>
                <lucide-icon name="shield-check" [size]="18" class="mr-2 inline-block text-gray-500"></lucide-icon>
                Разрешённые операции
              </ui-card-title>
            </ui-card-header>
            <ui-card-content>
              <app-operation-category-list
                [categories]="integration.operationCategories"
                mode="view">
              </app-operation-category-list>
            </ui-card-content>
          </ui-card>

          <!-- Block 3: Created entities -->
          <ui-card>
            <ui-card-header>
              <ui-card-title>
                <lucide-icon name="credit-card" [size]="18" class="mr-2 inline-block text-gray-500"></lucide-icon>
                Созданные сущности
              </ui-card-title>
            </ui-card-header>
            <ui-card-content>
              <app-payment-type-summary
                [paymentType]="integration.paymentType"
                [discount]="integration.discount">
              </app-payment-type-summary>
            </ui-card-content>
          </ui-card>
        </div>
      </ng-container>
    </div>

    <!-- Disconnect Confirm -->
    <ui-confirm-dialog
      [open]="showDisconnectConfirm"
      title="Отключить {{ integration?.name }}?"
      message="Тип оплаты и скидка будут отключены для всех подключённых ресторанов. Плагин на терминале перестанет отображать соответствующие типы оплат."
      confirmText="Отключить"
      variant="danger"
      (confirmed)="confirmDisconnect()"
      (cancelled)="showDisconnectConfirm = false">
    </ui-confirm-dialog>
  `,
})
export class AtlasIntegrationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);

  integration: PaymentIntegration | null = null;
  integrationId = '';
  restaurantTree = MOCK_CHAIN_RESTAURANTS;
  showDisconnectConfirm = false;

  get isConnected(): boolean {
    return this.integration?.status === 'connected';
  }

  get statusLabel(): string {
    return this.isConnected ? 'Подключен' : 'Не подключен';
  }

  get connectedCount(): number {
    return this.integration?.connectedRestaurantIds?.length ?? 0;
  }

  get customSettingsCount(): number {
    let count = 0;
    const collect = (nodes: RestaurantNode[]): void => {
      for (const n of nodes) {
        if (!n.children && n.isConnected && n.useCustomSettings) count++;
        if (n.children) collect(n.children);
      }
    };
    collect(this.restaurantTree);
    return count;
  }

  get breadcrumbs(): { label: string; onClick?: () => void }[] {
    return [
      { label: 'Платёжные системы', onClick: () => this.router.navigate(['/prototype/atlas']) },
      { label: this.integrationId === 'kaspi' ? 'Kaspi Bank' : 'Simple Pay' },
    ];
  }

  ngOnInit(): void {
    this.integrationId = this.route.snapshot.params['integrationId'];
    const allIntegrations = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    this.integration = allIntegrations.find(i => i.id === this.integrationId) || null;

    if (!this.integration) {
      this.router.navigate(['/prototype/atlas']);
      return;
    }

    this.buildRestaurantTree();
  }

  navigateToConnect(): void {
    this.router.navigate(['/prototype/atlas', this.integrationId, 'connect']);
  }

  confirmDisconnect(): void {
    if (!this.integration) return;
    const allIntegrations = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    const target = allIntegrations.find(i => i.id === this.integrationId);
    if (!target) return;

    target.status = 'disconnected';
    target.connectedRestaurantIds = [];
    for (const cat of target.operationCategories) {
      cat.allowed = false;
    }
    this.storage.save('atlas', 'integrations', allIntegrations);
    // Clear saved restaurant settings
    this.storage.save('atlas', this.integrationId + '_restaurants', null);
    this.integration = target;
    this.buildRestaurantTree();
    this.showDisconnectConfirm = false;
  }

  private buildRestaurantTree(): void {
    const connectedIds = new Set(this.integration?.connectedRestaurantIds ?? []);

    // Try loading saved restaurant tree with per-restaurant settings
    const savedTree = this.storage.load<RestaurantNode[]>('atlas', this.integrationId + '_restaurants', null as any);

    if (savedTree && Array.isArray(savedTree) && savedTree.length > 0) {
      // Use saved tree (already has per-restaurant settings)
      this.restaurantTree = savedTree;
    } else {
      // Fallback: fresh tree from mock
      this.restaurantTree = JSON.parse(JSON.stringify(MOCK_CHAIN_RESTAURANTS));
      const markConnected = (nodes: any[]): void => {
        for (const n of nodes) {
          n.isConnected = connectedIds.has(n.id);
          if (n.children) markConnected(n.children);
        }
      };
      markConnected(this.restaurantTree);
    }
  }
}
