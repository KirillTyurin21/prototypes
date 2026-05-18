import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { AuditLogEntry } from '../types';

@Component({
  selector: 'app-audit-timeline',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="relative pl-6 space-y-4" *ngIf="entries.length > 0">
      <div class="absolute left-2 top-2 bottom-2 w-px bg-gray-200"></div>

      <div *ngFor="let entry of entries" class="relative flex items-start gap-3">
        <div class="absolute left-[-16px] w-4 h-4 rounded-full flex items-center justify-center"
             [class]="getActionDotClass(entry.action)">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-medium text-gray-900">{{ getActionLabel(entry.action) }}</span>
            <span class="text-xs text-gray-500">{{ entry.user_name }}</span>
            <span class="text-xs text-gray-400">({{ entry.user_role }})</span>
          </div>
          <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(entry.timestamp) }}</p>
          <p *ngIf="entry.reason" class="text-xs text-gray-600 mt-1 italic">
            «{{ entry.reason }}»
          </p>
        </div>
      </div>
    </div>

    <p *ngIf="entries.length === 0" class="text-sm text-gray-400 italic">
      Нет записей в журнале
    </p>
  `,
})
export class AuditTimelineComponent {
  @Input() entries: AuditLogEntry[] = [];

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      approved: 'Одобрено',
      rejected: 'Отклонено',
      revoked: 'Ключ отозван',
      reverted: 'Отказ отменён',
      blocked: 'Заблокировано',
      unblocked: 'Разблокировано',
    };
    return labels[action] || action;
  }

  getActionDotClass(action: string): string {
    const classes: Record<string, string> = {
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      revoked: 'bg-orange-500',
      reverted: 'bg-blue-500',
      blocked: 'bg-red-700',
      unblocked: 'bg-green-600',
    };
    return classes[action] || 'bg-gray-400';
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
}
