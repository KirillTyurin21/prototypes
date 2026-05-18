import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  UiBreadcrumbsComponent,
  UiTabsComponent,
  UiConfirmDialogComponent,
  UiModalComponent,
  UiAlertComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { RequestCardComponent } from '../components/request-card.component';
import { MOCK_ACCESS_REQUESTS } from '../data/mock-data';
import { AccessRequest, AccessRequestStatus, AuditLogEntry } from '../types';

@Component({
  selector: 'app-access-requests-screen',
  standalone: true,
  imports: [
    CommonModule,
    UiBreadcrumbsComponent,
    UiTabsComponent,
    UiConfirmDialogComponent,
    UiModalComponent,
    UiAlertComponent,
    IconsModule,
    RequestCardComponent,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">
      <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

      <div class="mt-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Запросы на доступ (API Key)</h1>
            <p class="text-gray-500 mt-1">
              Управление запросами банков на получение API-ключей к данным ресторана
            </p>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
            <lucide-icon name="shield-check" [size]="14"></lucide-icon>
            Менеджер ресторана
          </div>
        </div>
      </div>

      <!-- Success alert -->
      <ui-alert *ngIf="successMessage" variant="success" [title]="successMessage" [dismissible]="true"
                (dismissed)="successMessage = ''">
      </ui-alert>

      <!-- Tabs filter -->
      <div class="mb-4">
        <ui-tabs [tabs]="filterTabs" [activeTab]="activeFilter" (tabChange)="onFilterChange($event)">
        </ui-tabs>
      </div>

      <!-- Cards list -->
      <div class="space-y-3">
        <app-request-card
          *ngFor="let request of filteredRequests"
          [request]="request"
          (approve)="handleApprove($event)"
          (reject)="handleReject($event)"
          (revoke)="confirmRevoke($event)"
          (revertRejection)="handleRevertRejection($event)">
        </app-request-card>

        <div *ngIf="filteredRequests.length === 0"
             class="text-center py-12 text-gray-400">
          <lucide-icon name="inbox" [size]="48" class="mx-auto mb-3 opacity-50"></lucide-icon>
          <p class="text-lg">Нет запросов в данной категории</p>
        </div>
      </div>

      <!-- Confirm revoke dialog -->
      <ui-confirm-dialog
        [open]="showRevokeConfirm"
        title="Отозвать API Key"
        message="Ключ будет немедленно аннулирован. Банк потеряет доступ к данным ресторана. Для повторного подключения банку потребуется отправить новый запрос."
        confirmText="Отозвать ключ"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="handleRevoke()"
        (cancelled)="showRevokeConfirm = false">
      </ui-confirm-dialog>

      <!-- Success modal after approve -->
      <ui-modal [open]="showApproveSuccess" title="Ключ выдан" size="sm" (modalClose)="showApproveSuccess = false">
        <div class="text-center py-4">
          <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <lucide-icon name="check" [size]="32" class="text-green-600"></lucide-icon>
          </div>
          <p class="text-gray-700 mb-2">API Key успешно выдан банку.</p>
          <p class="text-sm text-gray-500">Ключ действителен 360 дней. Банк получит ключ при следующей проверке статуса.</p>
        </div>
      </ui-modal>
    </div>
  `,
})
export class AccessRequestsScreenComponent {
  private router = inject(Router);
  private storage = inject(StorageService);

  requests: AccessRequest[] = [];
  activeFilter = 'all';
  showRevokeConfirm = false;
  revokeTargetId = '';
  showApproveSuccess = false;
  successMessage = '';

  breadcrumbs = [
    { label: 'Главная', onClick: () => this.router.navigate(['/prototype/halyk-consent']) },
    { label: 'Интеграции', onClick: () => this.router.navigate(['/prototype/halyk-consent/integrations']) },
    { label: 'Запросы на доступ' },
  ];

  filterTabs = [
    { key: 'all', label: 'Все' },
    { key: 'pending', label: 'Ожидающие', badge: 0 },
    { key: 'approved', label: 'Активные' },
    { key: 'rejected', label: 'Отклонённые' },
    { key: 'revoked', label: 'Отозванные' },
  ];

  ngOnInit(): void {
    this.requests = this.storage.load('halyk-consent', 'requests', MOCK_ACCESS_REQUESTS);
    this.updateBadges();
  }

  get filteredRequests(): AccessRequest[] {
    if (this.activeFilter === 'all') {
      return this.sortRequests(this.requests);
    }
    if (this.activeFilter === 'approved') {
      return this.sortRequests(this.requests.filter(r => r.status === 'approved' || r.status === 'active'));
    }
    return this.sortRequests(this.requests.filter(r => r.status === this.activeFilter));
  }

  onFilterChange(tab: string): void {
    this.activeFilter = tab;
  }

  handleApprove(id: string): void {
    const request = this.requests.find(r => r.id === id);
    if (!request || request.status !== 'pending') return;

    const now = new Date().toISOString();
    request.status = 'approved';
    request.decided_by = 'usr-current-user';
    request.decided_by_name = 'Текущий менеджер';
    request.decided_at = now;
    request.api_key_preview = 'hk_live_' + this.generateRandomKey() + '...****';
    request.expires_at = new Date(Date.now() + 360 * 24 * 60 * 60 * 1000).toISOString();

    const logEntry: AuditLogEntry = {
      action: 'approved',
      user_name: 'Текущий менеджер',
      user_role: 'Manager',
      timestamp: now,
      reason: null,
    };
    request.audit_log.push(logEntry);

    this.saveAndUpdate();
    this.showApproveSuccess = true;
  }

  handleReject(event: { id: string; reason: string }): void {
    const request = this.requests.find(r => r.id === event.id);
    if (!request || request.status !== 'pending') return;

    const now = new Date().toISOString();
    request.status = 'rejected';
    request.decided_by = 'usr-current-user';
    request.decided_by_name = 'Текущий менеджер';
    request.decided_at = now;
    request.reason = event.reason || null;

    const logEntry: AuditLogEntry = {
      action: 'rejected',
      user_name: 'Текущий менеджер',
      user_role: 'Manager',
      timestamp: now,
      reason: event.reason || null,
    };
    request.audit_log.push(logEntry);

    this.saveAndUpdate();
    this.successMessage = 'Запрос от «' + request.bank_name + '» отклонён';
  }

  confirmRevoke(id: string): void {
    this.revokeTargetId = id;
    this.showRevokeConfirm = true;
  }

  handleRevoke(): void {
    const request = this.requests.find(r => r.id === this.revokeTargetId);
    if (!request || (request.status !== 'approved' && request.status !== 'active')) {
      this.showRevokeConfirm = false;
      return;
    }

    const now = new Date().toISOString();
    request.status = 'revoked';
    request.decided_at = now;

    const logEntry: AuditLogEntry = {
      action: 'revoked',
      user_name: 'Текущий менеджер',
      user_role: 'Manager',
      timestamp: now,
      reason: null,
    };
    request.audit_log.push(logEntry);

    this.saveAndUpdate();
    this.showRevokeConfirm = false;
    this.successMessage = 'Ключ для «' + request.bank_name + '» отозван';
  }

  handleRevertRejection(id: string): void {
    const request = this.requests.find(r => r.id === id);
    if (!request || request.status !== 'rejected') return;

    const now = new Date().toISOString();
    request.status = 'pending';
    request.decided_by = null;
    request.decided_by_name = null;
    request.decided_at = null;
    request.reason = null;

    const logEntry: AuditLogEntry = {
      action: 'reverted',
      user_name: 'Текущий менеджер',
      user_role: 'Manager',
      timestamp: now,
      reason: null,
    };
    request.audit_log.push(logEntry);

    this.saveAndUpdate();
    this.successMessage = 'Отказ для «' + request.bank_name + '» отменён. Запрос снова ожидает решения.';
  }

  private sortRequests(requests: AccessRequest[]): AccessRequest[] {
    const statusOrder: Record<string, number> = {
      pending: 0,
      approved: 1,
      active: 1,
      rejected: 2,
      revoked: 3,
      blocked: 3,
    };
    return [...requests].sort((a, b) => {
      const orderDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  private saveAndUpdate(): void {
    this.storage.save('halyk-consent', 'requests', this.requests);
    this.updateBadges();
  }

  private updateBadges(): void {
    const pendingCount = this.requests.filter(r => r.status === 'pending').length;
    const pendingTab = this.filterTabs.find(t => t.key === 'pending');
    if (pendingTab) {
      pendingTab.badge = pendingCount > 0 ? pendingCount : undefined as any;
    }
  }

  private generateRandomKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
