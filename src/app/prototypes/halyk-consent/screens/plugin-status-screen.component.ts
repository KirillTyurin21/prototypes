import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiCardComponent,
  UiCardContentComponent,
  UiBadgeComponent,
  UiStatusDotComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { IntegrationStatus, PluginState } from '../types';

@Component({
  selector: 'app-plugin-status-screen',
  standalone: true,
  imports: [
    CommonModule,
    UiBreadcrumbsComponent,
    UiButtonComponent,
    UiCardComponent,
    UiCardContentComponent,
    UiBadgeComponent,
    UiStatusDotComponent,
    IconsModule,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto animate-fade-in">
      <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

      <div class="mt-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Реакция плагина Front</h1>
        <p class="text-gray-500 mt-1">
          Визуализация того, как плагин реагирует на изменение integration_status
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Plugin state panel -->
        <div>
          <ui-card>
            <ui-card-content>
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                     [class]="getPluginBgClass()">
                  <lucide-icon name="monitor-smartphone" [size]="20" [class]="getPluginIconClass()"></lucide-icon>
                </div>
                <div>
                  <p class="font-medium text-gray-900">Плагин Front</p>
                  <p class="text-xs text-gray-500">POS-терминал ресторана</p>
                </div>
              </div>

              <!-- Status indicator -->
              <div class="p-4 rounded-lg mb-4" [class]="getStatusPanelClass()">
                <div class="flex items-center gap-2 mb-2">
                  <ui-status-dot [color]="getStatusDotColor()" [pulse]="pluginState.integration_status === 'active'"></ui-status-dot>
                  <span class="font-medium" [class]="getStatusTextClass()">
                    integration_status: {{ pluginState.integration_status }}
                  </span>
                </div>
                <p *ngIf="pluginState.reason" class="text-sm opacity-75 mt-1">
                  Причина: {{ pluginState.reason }}
                </p>
              </div>

              <!-- Payment types visibility -->
              <div class="border border-gray-200 rounded-lg p-4">
                <p class="text-xs font-medium text-gray-500 uppercase mb-3">Типы оплат (кассиру)</p>

                <div class="space-y-2">
                  <div class="flex items-center justify-between p-2 rounded"
                       [class]="pluginState.payment_types_visible ? 'bg-green-50' : 'bg-gray-100'">
                    <div class="flex items-center gap-2">
                      <lucide-icon name="qr-code" [size]="16"
                                   [class]="pluginState.payment_types_visible ? 'text-green-600' : 'text-gray-400'">
                      </lucide-icon>
                      <span class="text-sm"
                            [class]="pluginState.payment_types_visible ? 'text-green-800' : 'text-gray-400 line-through'">
                        Halyk QR
                      </span>
                    </div>
                    <ui-badge [variant]="pluginState.payment_types_visible ? 'success' : 'default'">
                      {{ pluginState.payment_types_visible ? 'Виден' : 'Скрыт' }}
                    </ui-badge>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded"
                       [class]="pluginState.payment_types_visible ? 'bg-green-50' : 'bg-gray-100'">
                    <div class="flex items-center gap-2">
                      <lucide-icon name="smartphone" [size]="16"
                                   [class]="pluginState.payment_types_visible ? 'text-green-600' : 'text-gray-400'">
                      </lucide-icon>
                      <span class="text-sm"
                            [class]="pluginState.payment_types_visible ? 'text-green-800' : 'text-gray-400 line-through'">
                        Halyk Apple Pay
                      </span>
                    </div>
                    <ui-badge [variant]="pluginState.payment_types_visible ? 'success' : 'default'">
                      {{ pluginState.payment_types_visible ? 'Виден' : 'Скрыт' }}
                    </ui-badge>
                  </div>
                </div>
              </div>

              <!-- Log -->
              <div class="mt-4 p-3 bg-gray-900 rounded-lg font-mono text-xs text-green-400 overflow-x-auto">
                <div *ngFor="let log of pluginLogs">{{ log }}</div>
              </div>
            </ui-card-content>
          </ui-card>
        </div>

        <!-- Controls panel -->
        <div>
          <ui-card>
            <ui-card-content>
              <p class="font-medium text-gray-900 mb-4">Имитация команд сервера</p>
              <p class="text-sm text-gray-500 mb-4">
                Нажмите кнопку для имитации получения команды IntegrationStatusChanged через polling
                (в реальности — каждые 60 секунд).
              </p>

              <div class="space-y-3">
                <ui-button variant="success" [fullWidth]="true" iconName="check-circle"
                           (click)="simulateStatusChange('active', null)">
                  IntegrationStatusChanged → active
                </ui-button>

                <ui-button variant="secondary" [fullWidth]="true" iconName="x-circle"
                           (click)="simulateStatusChange('inactive', 'API key revoked by restaurant manager')">
                  IntegrationStatusChanged → inactive (revoked)
                </ui-button>

                <ui-button variant="danger" [fullWidth]="true" iconName="shield-off"
                           (click)="simulateStatusChange('blocked', 'rate_limit')">
                  IntegrationStatusChanged → blocked (rate limit)
                </ui-button>

                <ui-button variant="outline" [fullWidth]="true" iconName="x-circle"
                           (click)="simulateStatusChange('inactive', 'API key expired')">
                  IntegrationStatusChanged → inactive (TTL expired)
                </ui-button>
              </div>

              <!-- State machine diagram -->
              <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-xs font-medium text-gray-500 uppercase mb-3">State Machine (маппинг)</p>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-amber-100 text-amber-800 rounded">pending</span>
                    <span class="text-gray-400">→</span>
                    <span class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded">inactive</span>
                    <span class="text-gray-500">— оплаты скрыты</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-green-100 text-green-800 rounded">approved / active</span>
                    <span class="text-gray-400">→</span>
                    <span class="px-2 py-0.5 bg-green-200 text-green-800 rounded">active</span>
                    <span class="text-gray-500">— оплаты видны</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-red-100 text-red-800 rounded">rejected / revoked</span>
                    <span class="text-gray-400">→</span>
                    <span class="px-2 py-0.5 bg-gray-200 text-gray-700 rounded">inactive</span>
                    <span class="text-gray-500">— оплаты скрыты</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-red-100 text-red-800 rounded">blocked</span>
                    <span class="text-gray-400">→</span>
                    <span class="px-2 py-0.5 bg-red-200 text-red-800 rounded">blocked</span>
                    <span class="text-gray-500">— оплаты скрыты, лог причины</span>
                  </div>
                </div>
              </div>
            </ui-card-content>
          </ui-card>
        </div>
      </div>
    </div>
  `,
})
export class PluginStatusScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Главная', onClick: () => this.router.navigate(['/prototype/halyk-consent']) },
    { label: 'Реакция плагина' },
  ];

  pluginState: PluginState = {
    integration_status: 'inactive',
    reason: null,
    payment_types_visible: false,
    last_updated: new Date().toISOString(),
  };

  pluginLogs: string[] = [
    '[' + this.formatLogDate() + '] [INFO] Plugin started. Waiting for integration_status...',
    '[' + this.formatLogDate() + '] [INFO] Integration status: inactive (no active key)',
  ];

  simulateStatusChange(status: IntegrationStatus, reason: string | null): void {
    const prev = this.pluginState.integration_status;
    this.pluginState.integration_status = status;
    this.pluginState.reason = reason;
    this.pluginState.payment_types_visible = status === 'active';
    this.pluginState.last_updated = new Date().toISOString();

    const level = status === 'blocked' ? 'WARN' : 'INFO';
    const logLine = '[' + this.formatLogDate() + '] [' + level + '] Integration status changed: ' +
      prev + ' -> ' + status + ' (reason: ' + (reason || 'null') + ')';
    this.pluginLogs.push(logLine);

    if (status === 'active') {
      this.pluginLogs.push('[' + this.formatLogDate() + '] [INFO] RegisterPaymentSystem: Halyk QR, Halyk Apple Pay');
    } else {
      this.pluginLogs.push('[' + this.formatLogDate() + '] [INFO] Payment types hidden from cashier');
    }

    if (this.pluginLogs.length > 12) {
      this.pluginLogs = this.pluginLogs.slice(-12);
    }
  }

  getPluginBgClass(): string {
    const map: Record<IntegrationStatus, string> = {
      active: 'bg-green-100',
      inactive: 'bg-gray-100',
      blocked: 'bg-red-100',
    };
    return map[this.pluginState.integration_status];
  }

  getPluginIconClass(): string {
    const map: Record<IntegrationStatus, string> = {
      active: 'text-green-600',
      inactive: 'text-gray-500',
      blocked: 'text-red-600',
    };
    return map[this.pluginState.integration_status];
  }

  getStatusPanelClass(): string {
    const map: Record<IntegrationStatus, string> = {
      active: 'bg-green-50 border border-green-200',
      inactive: 'bg-gray-50 border border-gray-200',
      blocked: 'bg-red-50 border border-red-200',
    };
    return map[this.pluginState.integration_status];
  }

  getStatusDotColor(): 'green' | 'red' | 'yellow' | 'gray' | 'blue' {
    const map: Record<IntegrationStatus, 'green' | 'red' | 'gray'> = {
      active: 'green',
      inactive: 'gray',
      blocked: 'red',
    };
    return map[this.pluginState.integration_status];
  }

  getStatusTextClass(): string {
    const map: Record<IntegrationStatus, string> = {
      active: 'text-green-800',
      inactive: 'text-gray-700',
      blocked: 'text-red-800',
    };
    return map[this.pluginState.integration_status];
  }

  private formatLogDate(): string {
    const d = new Date();
    return d.toISOString().replace('T', ' ').substring(0, 19);
  }
}
