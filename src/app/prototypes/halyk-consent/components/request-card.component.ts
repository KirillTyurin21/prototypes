import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiBadgeComponent, UiButtonComponent, UiCheckboxComponent, UiTextareaComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { AuditTimelineComponent } from './audit-timeline.component';
import { AccessRequest } from '../types';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiBadgeComponent,
    UiButtonComponent,
    UiCheckboxComponent,
    UiTextareaComponent,
    IconsModule,
    AuditTimelineComponent,
  ],
  template: `
    <div class="border border-gray-200 rounded-lg bg-white overflow-hidden transition-shadow hover:shadow-sm">
      <!-- Header (always visible) -->
      <div class="flex items-center justify-between p-4 cursor-pointer"
           (click)="toggleExpanded()">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <lucide-icon name="building-2" [size]="18" class="text-gray-600"></lucide-icon>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 truncate">{{ request.bank_name }}</span>
              <ui-badge [variant]="getStatusVariant()">{{ getStatusLabel() }}</ui-badge>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(request.created_at) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex gap-1">
            <span *ngFor="let s of request.scope"
                  class="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {{ s }}
            </span>
          </div>
          <lucide-icon [name]="expanded ? 'chevron-up' : 'chevron-down'" [size]="18" class="text-gray-400"></lucide-icon>
        </div>
      </div>

      <!-- Expanded content -->
      <div *ngIf="expanded" class="border-t border-gray-100 p-4 animate-fade-in">
        <!-- Request text -->
        <div class="mb-4">
          <p class="text-sm text-gray-700">{{ request.request_text }}</p>
        </div>

        <!-- Decision info (for resolved requests) -->
        <div *ngIf="request.decided_by_name" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-2 text-sm">
            <lucide-icon name="user" [size]="14" class="text-gray-500"></lucide-icon>
            <span class="text-gray-600">Решение:</span>
            <span class="font-medium text-gray-900">{{ request.decided_by_name }}</span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-500">{{ formatDate(request.decided_at!) }}</span>
          </div>
          <p *ngIf="request.reason" class="text-sm text-gray-600 mt-1 italic">
            Причина: «{{ request.reason }}»
          </p>
        </div>

        <!-- API Key info (for approved) -->
        <div *ngIf="request.status === 'approved' || request.status === 'active'" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center gap-2 mb-1">
            <lucide-icon name="key-round" [size]="14" class="text-green-600"></lucide-icon>
            <span class="text-sm font-medium text-green-800">API Key выдан</span>
          </div>
          <p class="text-xs text-green-700 font-mono">{{ request.api_key_preview }}</p>
          <p *ngIf="request.expires_at" class="text-xs text-green-600 mt-1">
            Действителен до: {{ formatDate(request.expires_at) }}
          </p>
        </div>

        <!-- Actions for PENDING -->
        <div *ngIf="request.status === 'pending'" class="space-y-3">
          <ui-checkbox
            [(checked)]="consentChecked"
            label="Разрешаю банку взаимодействовать со мной через API">
          </ui-checkbox>

          <div class="flex gap-2">
            <ui-button variant="success" [disabled]="!consentChecked" (click)="onApprove()">
              Подтвердить
            </ui-button>
            <ui-button variant="danger" (click)="showRejectInput = !showRejectInput">
              Отклонить
            </ui-button>
          </div>

          <div *ngIf="showRejectInput" class="mt-2">
            <ui-textarea
              [(value)]="rejectReason"
              placeholder="Укажите причину отклонения (необязательно)"
              [rows]="2">
            </ui-textarea>
            <div class="flex gap-2 mt-2">
              <ui-button variant="danger" size="sm" (click)="onReject()">
                Подтвердить отклонение
              </ui-button>
              <ui-button variant="ghost" size="sm" (click)="showRejectInput = false">
                Отмена
              </ui-button>
            </div>
          </div>
        </div>

        <!-- Actions for APPROVED -->
        <div *ngIf="request.status === 'approved' || request.status === 'active'">
          <ui-button variant="outline" iconName="x-circle" (click)="onRevoke()">
            Отозвать ключ
          </ui-button>
        </div>

        <!-- Actions for REJECTED -->
        <div *ngIf="request.status === 'rejected'">
          <ui-button variant="secondary" iconName="undo-2" (click)="onRevertRejection()">
            Отменить отказ
          </ui-button>
        </div>

        <!-- Audit log -->
        <div *ngIf="request.audit_log.length > 0" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs font-medium text-gray-500 uppercase mb-3">Журнал действий</p>
          <app-audit-timeline [entries]="request.audit_log"></app-audit-timeline>
        </div>
      </div>
    </div>
  `,
})
export class RequestCardComponent {
  @Input() request!: AccessRequest;
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<{ id: string; reason: string }>();
  @Output() revoke = new EventEmitter<string>();
  @Output() revertRejection = new EventEmitter<string>();

  expanded = false;
  consentChecked = false;
  showRejectInput = false;
  rejectReason = '';

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  getStatusVariant(): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
    const map: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'warning',
      approved: 'success',
      active: 'success',
      rejected: 'danger',
      revoked: 'default',
      blocked: 'danger',
    };
    return map[this.request.status] || 'default';
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      pending: 'Ожидает',
      approved: 'Активен',
      active: 'Активен',
      rejected: 'Отклонён',
      revoked: 'Отозван',
      blocked: 'Заблокирован',
    };
    return labels[this.request.status] || this.request.status;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onApprove(): void {
    this.approve.emit(this.request.id);
  }

  onReject(): void {
    this.reject.emit({ id: this.request.id, reason: this.rejectReason });
    this.showRejectInput = false;
    this.rejectReason = '';
  }

  onRevoke(): void {
    this.revoke.emit(this.request.id);
  }

  onRevertRejection(): void {
    this.revertRejection.emit(this.request.id);
  }
}
