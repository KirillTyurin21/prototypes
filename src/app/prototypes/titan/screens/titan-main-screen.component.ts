import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiBadgeComponent,
  UiButtonComponent,
  UiConfirmDialogComponent,
  UiModalComponent,
  UiStatusDotComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { AccessRequest, AccessRequestStatus, IntegrationStatus, AuditLogEntry } from '../types';
import { MOCK_REQUESTS } from '../data/mock-data';

type SidebarSection = 'requests' | 'plugin';
type FilterStatus = 'all' | 'pending' | 'active' | 'rejected' | 'revoked';

@Component({
  selector: 'app-titan-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiBadgeComponent,
    UiButtonComponent,
    UiConfirmDialogComponent,
    UiModalComponent,
    UiStatusDotComponent,
    IconsModule,
  ],
  template: `
    <!-- Header (iiko Web style) -->
    <header class="border-b border-gray-200 bg-white">
      <div class="flex h-14 items-center gap-4 px-4">
        <div class="flex items-center gap-2">
          <svg width="60" height="24" viewBox="0 0 60 24" fill="none" class="text-[#E94B35]">
            <path d="M0 0H8V24H0V0Z" fill="currentColor" />
            <path d="M12 0H20V24H12V0Z" fill="currentColor" />
            <path d="M28 7L32 0H40L36 7H44V17H36L40 24H32L28 17V7Z" fill="currentColor" />
            <path d="M52 0C56.4183 0 60 3.58172 60 8V16C60 20.4183 56.4183 24 52 24C47.5817 24 44 20.4183 44 16V8C44 3.58172 47.5817 0 52 0Z" fill="currentColor" />
          </svg>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <div class="relative w-64">
            <lucide-icon name="search" [size]="16"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
            </lucide-icon>
            <input type="text" placeholder="Поиск по партнёрам..."
                   [(ngModel)]="searchQuery"
                   class="w-full h-9 pl-9 pr-3 text-sm border border-gray-300 rounded-md bg-white
                          placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all" />
          </div>
          <button class="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm text-gray-700">
            <lucide-icon name="user" [size]="16"></lucide-icon>
            <span>admin</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex" style="height: calc(100vh - 3.5rem)">
      <!-- Sidebar Navigation -->
      <aside class="w-52 border-r border-gray-200 bg-gray-50/70 shrink-0 flex flex-col">
        <nav class="p-2 space-y-0.5 flex-1">
          <button
            (click)="activeSection = 'requests'"
            class="w-full text-left rounded px-3 py-2 text-sm font-medium transition-colors"
            [ngClass]="activeSection === 'requests' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'">
            Управление доступом
          </button>
          <button
            (click)="activeSection = 'plugin'"
            class="w-full flex items-center gap-2 text-left rounded px-3 py-2 text-sm font-medium transition-colors"
            [ngClass]="activeSection === 'plugin' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'">
            <lucide-icon name="monitor-smartphone" [size]="16"></lucide-icon>
            Реакция плагина
          </button>
        </nav>
      </aside>

      <!-- SECTION: Управление доступом -->
      <div *ngIf="activeSection === 'requests'" class="flex-1 flex flex-col min-w-0">
        <!-- Page Header -->
        <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
          <div class="flex items-center justify-between gap-4">
            <h1 class="text-2xl font-semibold text-gray-900">Управление доступом к API</h1>
          </div>
        </div>

        <!-- Split Panel: Request List + Detail -->
        <div class="flex flex-1 min-h-0">
          <!-- Left: Request List -->
          <div class="w-96 border-r border-gray-200 overflow-y-auto shrink-0">
            <div class="p-4">
              <!-- Filter tabs -->
              <div class="flex flex-wrap gap-1 mb-4">
                <button *ngFor="let f of filters"
                        (click)="filterStatus = f.id"
                        class="px-2.5 py-1 text-xs rounded-md transition-colors"
                        [ngClass]="filterStatus === f.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-500 hover:bg-gray-100'">
                  {{ f.label }}
                  <span *ngIf="f.count > 0 && f.id !== 'all'" class="ml-0.5 opacity-70">{{ f.count }}</span>
                </button>
              </div>

              <!-- Empty -->
              <div *ngIf="filteredRequests.length === 0" class="py-8 text-center text-sm text-gray-400">
                Нет запросов
              </div>

              <!-- Request items -->
              <div class="space-y-0.5">
                <button *ngFor="let req of filteredRequests; trackBy: trackById"
                        (click)="selectRequest(req)"
                        class="flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors"
                        [ngClass]="selectedRequest?.id === req.id ? 'bg-gray-200' : 'hover:bg-gray-100'">
                  <!-- Status dot -->
                  <div class="w-2.5 h-2.5 rounded-full shrink-0" [class]="getStatusDotClass(req.status)"></div>
                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">{{ req.partnerName }}</p>
                    <p class="text-xs text-gray-400 truncate">{{ req.partnerDescription }}</p>
                  </div>
                  <!-- Badge -->
                  <ui-badge [variant]="getStatusVariant(req.status)" class="shrink-0">
                    {{ getStatusLabel(req.status) }}
                  </ui-badge>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Detail Panel -->
          <div class="flex-1 overflow-y-auto bg-white">
            <!-- No selection -->
            <div *ngIf="!selectedRequest"
                 class="flex h-full items-center justify-center text-gray-400 text-sm">
              Выберите запрос в списке слева для просмотра деталей.
            </div>

            <!-- Selected request detail -->
            <div *ngIf="selectedRequest" class="p-6 animate-fade-in">
              <div class="max-w-2xl space-y-6">
                <!-- Title -->
                <div>
                  <div class="flex items-center gap-3">
                    <h2 class="text-xl font-semibold text-gray-900">{{ selectedRequest.partnerName }}</h2>
                    <ui-badge [variant]="getStatusVariant(selectedRequest.status)">
                      {{ getStatusLabel(selectedRequest.status) }}
                    </ui-badge>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">{{ selectedRequest.partnerDescription }}</p>
                </div>

                <!-- Scopes -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Запрашиваемые разрешения (scope)</label>
                  <div class="space-y-1.5">
                    <div *ngFor="let scope of selectedRequest.scopes"
                         class="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-md bg-gray-50/50">
                      <lucide-icon name="shield-check" [size]="16" class="text-blue-500 shrink-0"></lucide-icon>
                      <div>
                        <p class="text-sm font-medium text-gray-800">{{ scope.label }}</p>
                        <p class="text-xs text-gray-400">{{ scope.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Key info (if approved) -->
                <div *ngIf="selectedRequest.apiKeyPreview" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">API-ключ</label>
                  <input type="text" readonly [value]="selectedRequest.apiKeyPreview"
                         class="w-full h-9 px-3 text-sm font-mono border border-gray-300 rounded-md bg-gray-50
                                text-gray-600 cursor-default" />
                  <p *ngIf="selectedRequest.expiresAt" class="text-xs text-gray-400">
                    Истекает: {{ formatDate(selectedRequest.expiresAt) }}
                  </p>
                </div>

                <!-- Rejection reason -->
                <div *ngIf="selectedRequest.rejectionReason" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Причина отклонения</label>
                  <div class="px-3 py-2 bg-red-50 border border-red-100 rounded-md text-sm text-red-700">
                    {{ selectedRequest.rejectionReason }}
                  </div>
                </div>

                <!-- Meta info -->
                <div class="space-y-1 text-xs text-gray-400">
                  <p>Создан: {{ formatDate(selectedRequest.createdAt) }}</p>
                  <p>Обновлён: {{ formatDateTime(selectedRequest.updatedAt) }}</p>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 pt-2">
                  <button *ngIf="selectedRequest.status === 'pending'"
                          (click)="approveRequest()"
                          class="h-9 px-4 text-sm font-medium rounded-md transition-colors
                                 bg-gray-900 text-white hover:bg-gray-800">
                    Одобрить
                  </button>
                  <button *ngIf="selectedRequest.status === 'pending'"
                          (click)="openRejectDialog()"
                          class="h-9 px-4 text-sm font-medium rounded-md transition-colors
                                 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                    Отклонить
                  </button>
                  <button *ngIf="selectedRequest.status === 'active' || selectedRequest.status === 'approved'"
                          (click)="showRevokeConfirm = true"
                          class="h-9 px-4 text-sm font-medium rounded-md transition-colors
                                 border border-red-200 bg-white text-red-600 hover:bg-red-50">
                    Отозвать ключ
                  </button>
                  <button *ngIf="selectedRequest.status === 'rejected'"
                          (click)="revertRejection()"
                          class="h-9 px-4 text-sm font-medium rounded-md transition-colors
                                 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                    Вернуть на рассмотрение
                  </button>
                </div>

                <!-- Audit log -->
                <div class="border-t border-gray-200 pt-4 mt-6">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">Аудит-лог</h3>
                  <div class="space-y-3">
                    <div *ngFor="let log of selectedRequest.auditLog" class="flex items-start gap-3">
                      <div class="mt-1.5 w-2 h-2 rounded-full shrink-0" [class]="getAuditDotClass(log.action)"></div>
                      <div>
                        <p class="text-sm text-gray-700">
                          <span class="font-medium">{{ getAuditLabel(log.action) }}</span>
                          <span class="text-gray-400"> · {{ log.actor }}</span>
                        </p>
                        <p class="text-xs text-gray-400">{{ formatDateTime(log.timestamp) }}</p>
                        <p *ngIf="log.reason" class="text-xs text-gray-500 mt-0.5">{{ log.reason }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION: Реакция плагина -->
      <div *ngIf="activeSection === 'plugin'" class="flex-1 flex flex-col min-w-0">
        <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
          <h1 class="text-2xl font-semibold text-gray-900">Реакция плагина Front</h1>
        </div>
        <div class="flex-1 overflow-y-auto bg-white p-6">
          <div class="max-w-2xl space-y-6">
            <p class="text-sm text-gray-500">
              Имитация того, как плагин терминала реагирует на изменение
              <code class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">integration_status</code>
              через polling (каждые 60 сек).
            </p>

            <!-- Status indicator -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Текущий статус интеграции</label>
              <div class="px-4 py-3 rounded-md border" [class]="getPluginPanelClass()">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full" [class]="getPluginDotClass()"></div>
                  <span class="text-sm font-mono font-medium">{{ pluginStatus }}</span>
                </div>
                <p *ngIf="pluginReason" class="text-xs text-gray-500 mt-1 ml-[18px]">{{ pluginReason }}</p>
              </div>
            </div>

            <!-- Payment types visibility -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Видимость типов оплат (для кассира)</label>
              <div class="border border-gray-200 rounded-md divide-y divide-gray-100">
                <div class="flex items-center justify-between px-4 py-2.5"
                     [class]="pluginPaymentsVisible ? 'bg-white' : 'bg-gray-50'">
                  <span class="text-sm" [class]="pluginPaymentsVisible ? 'text-gray-800' : 'text-gray-400 line-through'">
                    QR-оплата (партнёр)
                  </span>
                  <span class="text-[11px] font-medium px-2 py-0.5 rounded"
                        [class]="pluginPaymentsVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                    {{ pluginPaymentsVisible ? 'Виден' : 'Скрыт' }}
                  </span>
                </div>
                <div class="flex items-center justify-between px-4 py-2.5"
                     [class]="pluginPaymentsVisible ? 'bg-white' : 'bg-gray-50'">
                  <span class="text-sm" [class]="pluginPaymentsVisible ? 'text-gray-800' : 'text-gray-400 line-through'">
                    Apple Pay (партнёр)
                  </span>
                  <span class="text-[11px] font-medium px-2 py-0.5 rounded"
                        [class]="pluginPaymentsVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                    {{ pluginPaymentsVisible ? 'Виден' : 'Скрыт' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Terminal log -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Лог плагина</label>
              <div class="p-3 bg-gray-900 rounded-md font-mono text-[11px] text-green-400 max-h-40 overflow-y-auto">
                <div *ngFor="let log of pluginLogs">{{ log }}</div>
              </div>
            </div>

            <!-- Simulation buttons -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Имитация команд сервера</label>
              <div class="flex flex-wrap gap-2">
                <button (click)="simulatePlugin('active', null)"
                        class="h-9 px-4 text-sm font-medium rounded-md transition-colors bg-gray-900 text-white hover:bg-gray-800">
                  → active
                </button>
                <button (click)="simulatePlugin('inactive', 'Key revoked')"
                        class="h-9 px-4 text-sm font-medium rounded-md transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  → inactive (revoked)
                </button>
                <button (click)="simulatePlugin('blocked', 'rate_limit')"
                        class="h-9 px-4 text-sm font-medium rounded-md transition-colors border border-red-200 bg-white text-red-600 hover:bg-red-50">
                  → blocked
                </button>
                <button (click)="simulatePlugin('inactive', 'Key expired')"
                        class="h-9 px-4 text-sm font-medium rounded-md transition-colors border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  → inactive (TTL)
                </button>
              </div>
            </div>

            <!-- State machine diagram -->
            <div class="border-t border-gray-200 pt-4">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">State Machine (маппинг)</h3>
              <div class="space-y-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">pending</span>
                  <span class="text-gray-400">→</span>
                  <span class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-medium">inactive</span>
                  <span class="text-gray-500 ml-1">— оплаты скрыты</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium">approved / active</span>
                  <span class="text-gray-400">→</span>
                  <span class="px-2 py-0.5 bg-green-200 text-green-800 rounded font-medium">active</span>
                  <span class="text-gray-500 ml-1">— оплаты видны</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium">rejected / revoked</span>
                  <span class="text-gray-400">→</span>
                  <span class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded font-medium">inactive</span>
                  <span class="text-gray-500 ml-1">— оплаты скрыты</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium">blocked</span>
                  <span class="text-gray-400">→</span>
                  <span class="px-2 py-0.5 bg-red-200 text-red-800 rounded font-medium">blocked</span>
                  <span class="text-gray-500 ml-1">— оплаты скрыты, причина залогирована</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <ui-modal [open]="showRejectModal" (modalClose)="showRejectModal = false" title="Отклонить запрос" size="sm">
      <div class="space-y-4" *ngIf="selectedRequest">
        <p class="text-sm text-gray-600">
          Отклонить запрос от <strong>{{ selectedRequest.partnerName }}</strong>?
        </p>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Причина отклонения</label>
          <textarea [(ngModel)]="rejectReason" rows="3" placeholder="Укажите причину..."
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400
                           transition-all resize-none"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button (click)="showRejectModal = false"
                  class="h-9 px-4 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
            Отмена
          </button>
          <button (click)="confirmReject()" [disabled]="!rejectReason.trim()"
                  class="h-9 px-4 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Отклонить
          </button>
        </div>
      </div>
    </ui-modal>

    <!-- Revoke Confirm -->
    <ui-confirm-dialog
      [open]="showRevokeConfirm"
      title="Отозвать API-ключ"
      [message]="'Отозвать ключ для ' + (selectedRequest?.partnerName || '') + '? Это действие заблокирует интеграцию немедленно.'"
      confirmText="Отозвать"
      confirmVariant="danger"
      (confirm)="confirmRevoke()"
      (cancel)="showRevokeConfirm = false">
    </ui-confirm-dialog>

    <!-- Toast -->
    <div *ngIf="toastMessage"
         class="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 max-w-sm animate-slide-up">
      <p class="text-sm font-medium text-gray-900">{{ toastMessage }}</p>
    </div>
  `,
})
export class TitanMainScreenComponent implements OnInit {
  private storage = inject(StorageService);

  // State
  activeSection: SidebarSection = 'requests';
  filterStatus: FilterStatus = 'all';
  searchQuery = '';
  requests: AccessRequest[] = [];
  selectedRequest: AccessRequest | null = null;

  // Plugin
  pluginStatus: IntegrationStatus = 'inactive';
  pluginReason: string | null = null;
  pluginPaymentsVisible = false;
  pluginLogs: string[] = ['[INFO] Plugin started. Status: inactive'];

  // Dialogs
  showRejectModal = false;
  showRevokeConfirm = false;
  rejectReason = '';
  toastMessage = '';

  // Filters
  filters: { id: FilterStatus; label: string; count: number }[] = [];

  ngOnInit(): void {
    this.requests = this.storage.load('titan', 'requests', MOCK_REQUESTS);
    this.updateFilters();
  }

  // --- Computed ---

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

  // --- Actions ---

  selectRequest(req: AccessRequest): void {
    this.selectedRequest = req;
  }

  approveRequest(): void {
    if (!this.selectedRequest) return;
    this.selectedRequest.status = 'active';
    this.selectedRequest.updatedAt = new Date().toISOString();
    this.selectedRequest.apiKeyPreview = 'sk_live_****' + Math.random().toString(36).substring(2, 6);
    this.selectedRequest.expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    this.selectedRequest.auditLog.push({
      action: 'approved',
      actor: 'Текущий пользователь',
      timestamp: new Date().toISOString(),
    });
    this.persist();
    this.showToast('Запрос одобрен');
  }

  openRejectDialog(): void {
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.selectedRequest) return;
    this.selectedRequest.status = 'rejected';
    this.selectedRequest.updatedAt = new Date().toISOString();
    this.selectedRequest.rejectionReason = this.rejectReason;
    this.selectedRequest.auditLog.push({
      action: 'rejected',
      actor: 'Текущий пользователь',
      timestamp: new Date().toISOString(),
      reason: this.rejectReason,
    });
    this.showRejectModal = false;
    this.persist();
    this.showToast('Запрос отклонён');
  }

  confirmRevoke(): void {
    if (!this.selectedRequest) return;
    this.selectedRequest.status = 'revoked';
    this.selectedRequest.updatedAt = new Date().toISOString();
    this.selectedRequest.auditLog.push({
      action: 'revoked',
      actor: 'Текущий пользователь',
      timestamp: new Date().toISOString(),
      reason: 'Отозвано администратором',
    });
    this.showRevokeConfirm = false;
    this.persist();
    this.showToast('Ключ отозван');
  }

  revertRejection(): void {
    if (!this.selectedRequest) return;
    this.selectedRequest.status = 'pending';
    this.selectedRequest.updatedAt = new Date().toISOString();
    this.selectedRequest.rejectionReason = undefined;
    this.selectedRequest.auditLog.push({
      action: 'revert_rejection',
      actor: 'Текущий пользователь',
      timestamp: new Date().toISOString(),
    });
    this.persist();
    this.showToast('Возвращён на рассмотрение');
  }

  // --- Plugin simulation ---

  simulatePlugin(status: IntegrationStatus, reason: string | null): void {
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
    if (this.pluginLogs.length > 12) {
      this.pluginLogs = this.pluginLogs.slice(-12);
    }
  }

  getPluginPanelClass(): string {
    return {
      active: 'bg-green-50 border-green-200',
      inactive: 'bg-gray-50 border-gray-200',
      blocked: 'bg-red-50 border-red-200',
    }[this.pluginStatus];
  }

  getPluginDotClass(): string {
    return {
      active: 'bg-green-500',
      inactive: 'bg-gray-400',
      blocked: 'bg-red-500',
    }[this.pluginStatus];
  }

  // --- Helpers ---

  trackById(_: number, item: AccessRequest): string {
    return item.id;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusDotClass(status: AccessRequestStatus): string {
    const map: Record<AccessRequestStatus, string> = {
      pending: 'bg-amber-400',
      approved: 'bg-green-500',
      active: 'bg-green-500',
      rejected: 'bg-red-400',
      revoked: 'bg-red-600',
      expired: 'bg-gray-400',
    };
    return map[status];
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
      approved: 'bg-green-500',
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
      revert_rejection: 'Возвращён на рассмотрение',
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

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => { this.toastMessage = ''; }, 2500);
  }
}
