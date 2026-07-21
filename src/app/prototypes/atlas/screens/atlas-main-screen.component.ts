import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiButtonComponent, UiCardComponent, UiCardContentComponent, UiSkeletonComponent, UiStatusDotComponent, UiConfirmDialogComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { PaymentIntegration, AccountType } from '../types';
import { MOCK_INTEGRATIONS } from '../data/mock-data';

@Component({
  selector: 'app-atlas-main-screen',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiCardComponent, UiCardContentComponent, UiSkeletonComponent, UiStatusDotComponent, UiConfirmDialogComponent, IconsModule],
  template: `
    <header class="border-b border-gray-200 bg-white">
      <div class="flex h-14 items-center gap-4 px-4">
        <div class="flex items-center gap-2 ml-6">
          <span class="text-xs text-gray-400">Режим:</span>
          <div class="flex rounded-md border border-gray-300 overflow-hidden">
            <button (click)="setAccountType('chain')"
              class="px-3 py-1 text-xs transition-colors"
              [class.bg-gray-900]="accountType === 'chain'" [class.text-white]="accountType === 'chain'"
              [class.text-gray-600]="accountType !== 'chain'" [class.hover:bg-gray-100]="accountType !== 'chain'">Чейн (15)</button>
            <button (click)="setAccountType('rms')"
              class="px-3 py-1 text-xs transition-colors border-l border-gray-300"
              [class.bg-gray-900]="accountType === 'rms'" [class.text-white]="accountType === 'rms'"
              [class.text-gray-600]="accountType !== 'rms'" [class.hover:bg-gray-100]="accountType !== 'rms'">RMS (1)</button>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button class="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm text-gray-700">
            <lucide-icon name="user" [size]="16"></lucide-icon>
            <span>admin</span>
          </button>
        </div>
      </div>
    </header>

    <div class="px-6 py-5">
      <h1 class="text-2xl font-semibold text-gray-900">Подключение платёжных систем</h1>
      <p class="text-sm text-gray-500 mt-1">Выберите платёжную систему для подключения. Тип оплаты будет создан автоматически.</p>
    </div>

    <div class="px-6 pb-8 max-w-3xl">
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

      <div *ngIf="integrations.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        <ui-card *ngFor="let it of integrations; trackBy: trackById" [hoverable]="true" (cardClick)="openDetail(it.id)">
          <ui-card-content>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0" [class]="it.logoColor">{{ it.logoLetter }}</div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate text-gray-900">{{ it.name }}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <ui-status-dot [color]="it.status === 'connected' ? 'green' : 'gray'" [pulse]="false"></ui-status-dot>
                  <span class="text-xs" [class.text-green-600]="it.status === 'connected'" [class.text-gray-400]="it.status !== 'connected'">{{ it.status === 'connected' ? 'Подключен' : 'Не подключен' }}</span>
                </div>
              </div>
            </div>
            <div *ngIf="it.status === 'connected'" class="mt-3 pt-3 border-t border-gray-100">
              <p class="text-xs text-gray-500">Подключено ТП: {{ it.connectedRestaurantIds.length }}</p>
            </div>
            <div class="flex gap-2 mt-3" (click)="$event.stopPropagation()">
              <ui-button *ngIf="it.status !== 'connected'" size="sm" (click)="openDetail(it.id)">Подключить</ui-button>
              <ui-button *ngIf="it.status === 'connected'" size="sm" variant="outline" (click)="openDetail(it.id)">Настроить</ui-button>
              <ui-button *ngIf="it.status === 'connected'" size="sm" variant="ghost" class="text-red-500" (click)="quickDisconnect(it.id); $event.stopPropagation()">Отключить</ui-button>
            </div>
          </ui-card-content>
        </ui-card>
      </div>
    </div>

    <ui-confirm-dialog
      [open]="showDisconnectConfirm" title="Отключить {{ disconnectTarget?.name }}?"
      message="Тип оплаты будет отключен для всех ресторанов."
      confirmText="Отключить" variant="danger"
      (confirmed)="confirmDisconnect()" (cancelled)="showDisconnectConfirm = false">
    </ui-confirm-dialog>

    <div *ngIf="toastMessage" class="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 max-w-sm animate-slide-up">
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
  showDisconnectConfirm = false;
  disconnectTarget: PaymentIntegration | null = null;

  ngOnInit(): void {
    this.integrations = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    this.accountType = this.storage.load('atlas', 'accountType', 'chain' as AccountType);
  }

  setAccountType(type: AccountType): void {
    this.accountType = type;
    this.storage.save('atlas', 'accountType', type);
  }
  openDetail(id: string): void { this.router.navigate(['/prototype/atlas', id]); }

  quickDisconnect(id: string): void {
    this.disconnectTarget = this.integrations.find(i => i.id === id) || null;
    this.showDisconnectConfirm = true;
  }

  confirmDisconnect(): void {
    if (!this.disconnectTarget) return;
    this.disconnectTarget.status = 'disconnected';
    this.disconnectTarget.connectedRestaurantIds = [];
    for (const cat of this.disconnectTarget.operationCategories) cat.allowed = false;
    this.storage.save('atlas', 'integrations', this.integrations);
    this.storage.save('atlas', this.disconnectTarget.id + '_restaurants', null);
    this.showDisconnectConfirm = false;
    this.toastMessage = this.disconnectTarget.name + ' отключен';
    setTimeout(() => { this.toastMessage = ''; }, 2500);
    this.disconnectTarget = null;
  }

  trackById(_: number, item: PaymentIntegration): string { return item.id; }
}
