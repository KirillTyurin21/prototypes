import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiBadgeComponent,
  UiButtonComponent,
  UiCardComponent,
  UiCardContentComponent,
  UiInputComponent,
  UiModalComponent,
  UiConfirmDialogComponent,
  UiStatusDotComponent,
  UiTextareaComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { AccessRequest, AccessRequestStatus, AuditLogEntry } from '../types';
import { MOCK_REQUESTS } from '../data/mock-data';

type TabId = 'requests' | 'connections';
type FilterStatus = 'all' | 'pending' | 'active' | 'rejected' | 'revoked';

@Component({
  selector: 'app-titan-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiBadgeComponent,
    UiButtonComponent,
    UiCardComponent,
    UiCardContentComponent,
    UiInputComponent,
    UiModalComponent,
    UiConfirmDialogComponent,
    UiStatusDotComponent,
    UiTextareaComponent,
    IconsModule,
  ],
  template: `
    <div class="p-6 max-w-5xl mx-auto animate-fade-in">
      <!-- Page Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Управление доступом к API</h1>
          <p class="text-sm text-gray-500 mt-1">Consent-механизм для внешних интеграций</p>
        </div>
        <button
          (click)="showPluginPanel = true"
          class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600
                 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors">
          <lucide-icon name="monitor-smartphone" [size]="14"></lucide-icon>
          Реакция плагина
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 border-b border-gray-200">
        <button
          (click)="activeTab = 'requests'"
          [class]="activeTab === 'requests'
            ? 'px-4 py-2.5 text-sm font-medium border-b-2 border-app-primary text-app-primary'
            : 'px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border-b-2 border-transparent'">
          <span class="flex items-center gap-1.5">
            <lucide-icon name="inbox" [size]="14"></lucide-icon>
            Запросы доступа
            <span *ngIf="pendingCount > 0"
                  class="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
              {{ pendingCount }}
            </span>
          </span>
        </button>
        <button
          (click)="activeTab = 'connections'"
          [class]="activeTab === 'connections'
            ? 'px-4 py-2.5 text-sm font-medium border-b-2 border-app-primary text-app-primary'
            : 'px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 border-b-2 border-transparent'">
          <span class="flex items-center gap-1.5">
            <lucide-icon name="plug" [size]="14"></lucide-icon>
            Подключения
            <span *ngIf="activeCount > 0"
                  class="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full">
              {{ activeCount }}
            </span>
          </span>
        </button>
      </div>

      <!-- TAB: Requests -->
      <div *ngIf="activeTab === 'requests'">
        <!-- Filter bar -->
        <div class="flex items-center gap-3 mb-4">
          <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button *ngFor="let f of filters"
                    (click)="filterStatus = f.id"
                    [class]="filterStatus === f.id
                      ? 'px-3 py-1.5 text-xs font-medium bg-white text-gray-900 rounded-md shadow-sm'
                      : 'px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-md'">
              {{ f.label }}
              <span *ngIf="f.count > 0" class="ml-1 text-[10px] opacity-60">({{ f.count }})</span>
            </button>
          </div>
          <div class="flex-1"></div>
          <ui-input
            iconName="search"
            placeholder="Поиск по партнёру..."
            [value]="searchQuery"
            (valueChange)="searchQuery = $event"
            class="w-56">
          </ui-input>
        </div>

        <!-- Request cards -->
        <div class="space-y-3">
          <div *ngFor="let req of filteredRequests; trackBy: trackById"
               class="border border-gray-200 rounded-lg bg-white overflow-hidden transition-shadow hover:shadow-sm">
            <!-- Card header -->
            <div class="flex items-center gap-3 px-4 py-3 cursor-pointer"
                 (click)="toggleExpand(req.id)">
              <lucide-icon
                [name]="expandedIds.has(req.id) ? 'chevron-down' : 'chevron-right'"
                [size]="16" class="text-gray-400">
              </lucide-icon>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm text-gray-900">{{ req.partnerName }}</span>
                  <ui-badge [variant]="getStatusVariant(req.status)">{{ getStatusLabel(req.status) }}</ui-badge>
                </div>
                <p class="text-xs text-gray-500 mt-0.5 truncate">{{ req.partnerDescription }}</p>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(req.updatedAt) }}</span>
            </div>

            <!-- Card expanded content -->
            <div *ngIf="expandedIds.has(req.id)" class="border-t border-gray-100 px-4 py-4 bg-gray-50/50">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Left: details -->
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase mb-2">Запрашиваемые разрешения</p>
                  <div class="flex flex-wrap gap-1.5 mb-4">
                    <span *ngFor="let scope of req.scopes"
                          class="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded border border-blue-100">
                      {{ scope.label }}
                    </span>
                  </div>

                  <div class="space-y-2 text-xs text-gray-600">
                    <div class="flex gap-2">
                      <span class="text-gray-400 w-20">Создан:</span>
                      <span>{{ formatDate(req.createdAt) }}</span>
                    </div>
                    <div *ngIf="req.apiKeyPreview" class="flex gap-2">
                      <span class="text-gray-400 w-20">API Key:</span>
                      <code class="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">{{ req.apiKeyPreview }}</code>
                    </div>
                    <div *ngIf="req.expiresAt" class="flex gap-2">
                      <span class="text-gray-400 w-20">Истекает:</span>
                      <span>{{ formatDate(req.expiresAt) }}</span>
                    </div>
                    <div *ngIf="req.rejectionReason" class="flex gap-2">
                      <span class="text-gray-400 w-20">Причина:</span>
                      <span class="text-red-600">{{ req.rejectionReason }}</span>
                    </div>
                  </div>
                </div>

                <!-- Right: audit log -->
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase mb-2">Аудит-лог</p>
                  <div class="space-y-2">
                    <div *ngFor="let log of req.auditLog" class="flex items-start gap-2">
                      <div class="mt-1 w-2 h-2 rounded-full flex-shrink-0" [class]="getAuditDotClass(log.action)"></div>
                      <div class="text-xs">
                        <span class="text-gray-700">{{ getAuditLabel(log.action) }}</span>
                        <span class="text-gray-400"> · {{ log.actor }} · {{ formatDate(log.timestamp) }}</span>
                        <span *ngIf="log.reason" class="text-gray-500 block">{{ log.reason }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                <ui-button *ngIf="req.status === 'pending'" variant="primary" size="sm" iconName="check"
                           (click)="approveRequest(req)">
                  Одобрить
                </ui-button>
                <ui-button *ngIf="req.status === 'pending'" variant="outline" size="sm" iconName="x-circle"
                           (click)="openRejectDialog(req)">
                  Отклонить
                </ui-button>
                <ui-button *ngIf="req.status === 'active' || req.status === 'approved'" variant="danger" size="sm" iconName="shield-off"
                           (click)="openRevokeDialog(req)">
                  Отозвать ключ
                </ui-button>
                <ui-button *ngIf="req.status === 'rejected'" variant="outline" size="sm" iconName="undo-2"
                           (click)="revertRejection(req)">
                  Вернуть на рассмотрение
                </ui-button>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="filteredRequests.length === 0"
               class="text-center py-12 text-gray-400">
            <lucide-icon name="inbox" [size]="40" class="mx-auto mb-3 opacity-40"></lucide-icon>
            <p class="text-sm">Нет запросов по выбранному фильтру</p>
          </div>
        </div>
      </div>

      <!-- TAB: Connections -->
      <div *ngIf="activeTab === 'connections'">
        <div class="space-y-3">
          <div *ngFor="let req of activeRequests"
               class="border border-gray-200 rounded-lg bg-white p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <lucide-icon name="plug" [size]="18" class="text-green-600"></lucide-icon>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ req.partnerName }}</p>
                  <p class="text-xs text-gray-500">{{ req.partnerDescription }}</p>
                </div>
              </div>
              <div class="text-right">
                <ui-badge variant="success">Активен</ui-badge>
                <p *ngIf="req.apiKeyPreview" class="text-[10px] text-gray-400 mt-1 font-mono">{{ req.apiKeyPreview }}</p>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
              <div class="flex items-center gap-1">
                <lucide-icon name="key-round" [size]="12"></lucide-icon>
                <span>Разрешения: {{ req.scopes.map(scopeLabel).join(', ') }}</span>
              </div>
              <div *ngIf="req.expiresAt" class="flex items-center gap-1">
                <lucide-icon name="clock" [size]="12"></lucide-icon>
                <span>До {{ formatDate(req.expiresAt!) }}</span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="activeRequests.length === 0"
               class="text-center py-12 text-gray-400">
            <lucide-icon name="plug" [size]="40" class="mx-auto mb-3 opacity-40"></lucide-icon>
            <p class="text-sm">Нет активных подключений</p>
            <p class="text-xs mt-1">Одобрите запрос на вкладке «Запросы доступа»</p>
          </div>
        </div>
      </div>

      <!-- Plugin Panel (Modal) -->
      <ui-modal [open]="showPluginPanel" (modalClose)="showPluginPanel = false" title="Реакция плагина Front" size="lg">
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Имитация того, как плагин терминала реагирует на изменение <code class="px-1 py-0.5 bg-gray-100 rounded text-xs">integration_status</code>.
          </p>

          <!-- Status indicator -->
          <div class="p-4 rounded-lg" [class]="getPluginPanelClass()">
            <div class="flex items-center gap-2 mb-1">
              <ui-status-dot [color]="getPluginDotColor()" [pulse]="pluginStatus === 'active'"></ui-status-dot>
              <span class="text-sm font-medium">integration_status: <strong>{{ pluginStatus }}</strong></span>
            </div>
            <p *ngIf="pluginReason" class="text-xs opacity-70 ml-5">{{ pluginReason }}</p>
          </div>

          <!-- Payment types -->
          <div class="border border-gray-200 rounded-lg p-3">
            <p class="text-xs font-medium text-gray-500 uppercase mb-2">Видимость типов оплат</p>
            <div class="space-y-1.5">
              <div class="flex items-center justify-between p-2 rounded text-sm"
                   [class]="pluginPaymentsVisible ? 'bg-green-50' : 'bg-gray-50'">
                <span [class]="pluginPaymentsVisible ? 'text-green-800' : 'text-gray-400 line-through'">
                  QR-оплата (партнёр)
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded"
                      [class]="pluginPaymentsVisible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'">
                  {{ pluginPaymentsVisible ? 'Виден' : 'Скрыт' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-2 rounded text-sm"
                   [class]="pluginPaymentsVisible ? 'bg-green-50' : 'bg-gray-50'">
                <span [class]="pluginPaymentsVisible ? 'text-green-800' : 'text-gray-400 line-through'">
                  Apple Pay (партнёр)
                </span>
                <span class="text-[10px] px-1.5 py-0.5 rounded"
                      [class]="pluginPaymentsVisible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'">
                  {{ pluginPaymentsVisible ? 'Виден' : 'Скрыт' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Log terminal -->
          <div class="p-3 bg-gray-900 rounded-lg font-mono text-[11px] text-green-400 max-h-32 overflow-y-auto">
            <div *ngFor="let log of pluginLogs">{{ log }}</div>
          </div>

          <!-- Simulation buttons -->
          <div class="grid grid-cols-2 gap-2">
            <ui-button variant="primary" size="sm" iconName="check-circle"
                       (click)="simulatePlugin('active', null)">
              → active
            </ui-button>
            <ui-button variant="outline" size="sm" iconName="x-circle"
                       (click)="simulatePlugin('inactive', 'Key revoked')">
              → inactive (revoked)
            </ui-button>
            <ui-button variant="danger" size="sm" iconName="shield-off"
                       (click)="simulatePlugin('blocked', 'rate_limit')">
              → blocked
            </ui-button>
            <ui-button variant="outline" size="sm" iconName="x-circle"
                       (click)="simulatePlugin('inactive', 'Key expired')">
              → inactive (TTL)
            </ui-button>
          </div>
        </div>
      </ui-modal>

      <!-- Reject dialog -->
      <ui-modal [open]="showRejectModal" (modalClose)="showRejectModal = false" title="Отклонить запрос" size="sm">
        <div class="space-y-4" *ngIf="actionTarget">
          <p class="text-sm text-gray-600">
            Отклонить запрос от <strong>{{ actionTarget.partnerName }}</strong>?
          </p>
          <ui-textarea
            label="Причина отклонения"
            placeholder="Укажите причину..."
            [(value)]="rejectReason">
          </ui-textarea>
          <div class="flex justify-end gap-2">
            <ui-button variant="ghost" size="sm" (click)="showRejectModal = false">Отмена</ui-button>
            <ui-button variant="danger" size="sm" (click)="confirmReject()" [disabled]="!rejectReason.trim()">Отклонить</ui-button>
          </div>
        </div>
      </ui-modal>

      <!-- Revoke confirm -->
      <ui-confirm-dialog
        [open]="showRevokeConfirm"
        title="Отозвать API-ключ"
        [message]="'Отозвать ключ для ' + (actionTarget?.partnerName || '') + '? Это действие заблокирует интеграцию немедленно.'"
        confirmText="Отозвать"
        confirmVariant="danger"
        (confirm)="confirmRevoke()"
        (cancel)="showRevokeConfirm = false">
      </ui-confirm-dialog>
    </div>
  `,
})
export class TitanMainScreenComponent {
  private storage = inject(StorageService);

  // Main state
  activeTab: TabId = 'requests';
  filterStatus: FilterStatus = 'all';
  searchQuery = '';
  expandedIds = new Set<string>();
  requests: AccessRequest[] = [];

  // Plugin panel
  showPluginPanel = false;
  pluginStatus: 'active' | 'inactive' | 'blocked' = 'inactive';
  pluginReason: string | null = null;
  pluginPaymentsVisible = false;
  pluginLogs: string[] = ['[INFO] Plugin started. Status: inactive'];

  // Dialogs
  showRejectModal = false;
  showRevokeConfirm = false;
  actionTarget: AccessRequest | null = null;
  rejectReason = '';

  // Filters definition
  filters: { id: FilterStatus; label: string; count: number }[] = [];

  ngOnInit(): void {
    this.requests = this.storage.load('titan', 'requests', MOCK_REQUESTS);
    this.updateFilters();
  }

  // --- Computed ---

  get pendingCount(): number {
    return this.requests.filter(r => r.status === 'pending').length;
  }

  get activeCount(): number {
    return this.requests.filter(r => r.status === 'active' || r.status === 'approved').length;
  }

  get filteredRequests(): AccessRequest[] {
    let list = this.requests;
    if (this.filterStatus !== 'all') {
      list = list.filter(r => {
        if (this.filterStatus === 'active') return r.status === 'active' || r.status === 'approved';
        return r.status === this.filterStatus;
      });
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r =>
        r.partnerName.toLowerCase().includes(q) ||
        r.partnerDescription.toLowerCase().includes(q)
      );
    }
    return list;
  }

  get activeRequests(): AccessRequest[] {
    return this.requests.filter(r => r.status === 'active' || r.status === 'approved');
  }

  // --- Actions ---

  toggleExpand(id: string): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  approveRequest(req: AccessRequest): void {
    req.status = 'active';
    req.updatedAt = new Date().toISOString();
    req.apiKeyPreview = 'sk_live_****' + Math.random().toString(36).substring(2, 6);
    req.expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    req.auditLog.push({
      action: 'approved',
      actor: 'Текущий пользователь',
      timestamp: new Date().toISOString(),
    });
    this.persist();
  }

  openRejectDialog(req: AccessRequest): void {
    this.actionTarget = req;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.actionTarget) return;
    this.actionTarget.status = 'rejected';
    this.actionTarget.updatedAt = new Date().toISOString();
    this.actionTarget.rejectionReason = this.rejectReason;
    this.actionTarget.auditLog.push({
      action: 'rejected',
      actor: 'Текущий пользователь',
      timestamp: new Date().toISOString(),
      reason: this.rejectReason,
    });
    this.showRejectModal = false;
    this.actionTarget = null;
    this.persist();
  }

  openRevokeDialog(req: AccessRequest): void {
    this.actionTarget = req;
    this.showRevokeConfirm = true;
  }

  confirmRevoke(): void {
    if (!this.actionTarget) return;
    this.actionTarget.status = 'revoked';
    this.actionTarget.updatedAt = new Date().toISOString();
    this.actionTarget.auditLog.push({
      action: 'revoked',
      actor: 'Текущий пользователь',
      timestamp: new Date().toISOString(),
      reason: 'Отозвано администратором',
    });
    this.showRevokeConfirm = false;
    this.actionTarget = null;
    this.persist();
  }

  revertRejection(req: AccessRequest): void {
    req.status = 'pending';
    req.updatedAt = new Date().toISOString();
    req.rejectionReason = undefined;
    req.auditLog.push({
      action: 'revert_rejection',
      actor: 'Текущий пользователь',
      timestamp: new Date().toISOString(),
    });
    this.persist();
  }

  // --- Plugin panel ---

  simulatePlugin(status: 'active' | 'inactive' | 'blocked', reason: string | null): void {
    const prev = this.pluginStatus;
    this.pluginStatus = status;
    this.pluginReason = reason;
    this.pluginPaymentsVisible = status === 'active';
    const ts = new Date().toISOString().replace('T', ' ').substring(11, 19);
    this.pluginLogs.push('[' + ts + '] Status: ' + prev + ' → ' + status + (reason ? ' (' + reason + ')' : ''));
    if (status === 'active') {
      this.pluginLogs.push('[' + ts + '] RegisterPaymentSystem: QR, Apple Pay');
    } else {
      this.pluginLogs.push('[' + ts + '] Payment types hidden');
    }
    if (this.pluginLogs.length > 10) {
      this.pluginLogs = this.pluginLogs.slice(-10);
    }
  }

  getPluginPanelClass(): string {
    return {
      active: 'bg-green-50 border border-green-200',
      inactive: 'bg-gray-50 border border-gray-200',
      blocked: 'bg-red-50 border border-red-200',
    }[this.pluginStatus];
  }

  getPluginDotColor(): 'green' | 'red' | 'gray' {
    return { active: 'green' as const, inactive: 'gray' as const, blocked: 'red' as const }[this.pluginStatus];
  }

  // --- Helpers ---

  scopeLabel(scope: { label: string }): string {
    return scope.label;
  }

  trackById(_: number, item: AccessRequest): string {
    return item.id;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getStatusVariant(status: AccessRequestStatus): 'success' | 'warning' | 'danger' | 'default' {
    const map: Record<AccessRequestStatus, 'success' | 'warning' | 'danger' | 'default'> = {
      pending: 'warning',
      approved: 'success',
      active: 'success',
      rejected: 'danger',
      revoked: 'danger',
      expired: 'default',
    };
    return map[status];
  }

  getStatusLabel(status: AccessRequestStatus): string {
    const map: Record<AccessRequestStatus, string> = {
      pending: 'Ожидает',
      approved: 'Активен',
      active: 'Активен',
      rejected: 'Отклонён',
      revoked: 'Отозван',
      expired: 'Истёк',
    };
    return map[status];
  }

  getAuditDotClass(action: AuditLogEntry['action']): string {
    const map: Record<string, string> = {
      created: 'bg-blue-400',
      approved: 'bg-green-400',
      rejected: 'bg-red-400',
      revoked: 'bg-red-600',
      revert_rejection: 'bg-amber-400',
    };
    return map[action] || 'bg-gray-300';
  }

  getAuditLabel(action: AuditLogEntry['action']): string {
    const map: Record<string, string> = {
      created: 'Создан',
      approved: 'Одобрен',
      rejected: 'Отклонён',
      revoked: 'Отозван',
      revert_rejection: 'Возвращён',
    };
    return map[action] || action;
  }

  private persist(): void {
    this.storage.save('titan', 'requests', this.requests);
    this.updateFilters();
  }

  private updateFilters(): void {
    this.filters = [
      { id: 'all', label: 'Все', count: this.requests.length },
      { id: 'pending', label: 'Ожидают', count: this.requests.filter(r => r.status === 'pending').length },
      { id: 'active', label: 'Активные', count: this.requests.filter(r => r.status === 'active' || r.status === 'approved').length },
      { id: 'rejected', label: 'Отклонённые', count: this.requests.filter(r => r.status === 'rejected').length },
      { id: 'revoked', label: 'Отозванные', count: this.requests.filter(r => r.status === 'revoked').length },
    ];
  }
}
