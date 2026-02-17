import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiModalComponent, UiBadgeComponent, UiButtonComponent } from '@/components/ui';
import { ChangelogRelease, ChangeGroup } from '@/shared/changelog.types';

@Component({
  selector: 'app-changelog-modal',
  standalone: true,
  imports: [CommonModule, IconsModule, UiModalComponent, UiBadgeComponent, UiButtonComponent],
  template: `
    <ui-modal
      [open]="open"
      [title]="'История изменений — ' + prototypeName"
      size="lg"
      (modalClose)="onClose()"
    >
      <div class="space-y-1">
        <div *ngFor="let release of releases; let i = index" class="border border-border rounded-lg overflow-hidden">
          <!-- Release header -->
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
            [ngClass]="expandedIndex === i ? 'bg-surface-secondary' : 'hover:bg-surface-hover'"
            (click)="toggleRelease(i)"
          >
            <div class="flex items-center gap-3">
              <lucide-icon
                [name]="expandedIndex === i ? 'chevron-down' : 'chevron-right'"
                [size]="16"
                class="text-text-secondary shrink-0"
              ></lucide-icon>
              <span class="font-medium text-text-primary">v{{ release.version }}</span>
              <span class="text-sm text-text-secondary">— {{ formatDate(release.date) }}</span>
            </div>
            <ui-badge [variant]="release.status === 'released' ? 'success' : 'warning'">
              {{ release.status === 'released' ? '✅ Master' : '🔶 В разработке' }}
            </ui-badge>
          </button>

          <!-- Release content (accordion) -->
          <div *ngIf="expandedIndex === i" class="px-4 pb-4 pt-2 border-t border-border animate-fade-in">
            <div *ngFor="let group of release.changes; let gi = index" class="mb-3 last:mb-0">
              <!-- Page header -->
              <div *ngIf="group.page" class="flex items-center gap-2 mb-1.5">
                <lucide-icon name="file-edit" [size]="14" class="text-app-primary shrink-0"></lucide-icon>
                <button
                  *ngIf="group.pageRoute; else plainPageName"
                  type="button"
                  class="text-sm font-medium text-app-primary hover:underline"
                  (click)="navigateToPage(group.pageRoute!)"
                >
                  {{ group.page }}
                </button>
                <ng-template #plainPageName>
                  <span class="text-sm font-medium text-text-primary">{{ group.page }}</span>
                </ng-template>
              </div>
              <!-- "Общие изменения" header for groups without page -->
              <div *ngIf="!group.page" class="flex items-center gap-2 mb-1.5">
                <lucide-icon name="settings" [size]="14" class="text-text-secondary shrink-0"></lucide-icon>
                <span class="text-sm font-medium text-text-secondary">Общие изменения</span>
              </div>
              <!-- Items list -->
              <ul class="ml-6 space-y-1">
                <li *ngFor="let item of group.items" class="text-sm text-text-secondary flex items-start gap-2">
                  <span class="w-1 h-1 rounded-full bg-text-disabled shrink-0 mt-2"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="releases.length === 0" class="text-center py-8 text-text-secondary text-sm">
          Нет записей в истории изменений
        </div>
      </div>

      <div modalFooter class="flex justify-end">
        <ui-button variant="secondary" size="sm" (click)="onClose()">Закрыть</ui-button>
      </div>
    </ui-modal>
  `,
})
export class ChangelogModalComponent {
  @Input() open = false;
  @Input() releases: ChangelogRelease[] = [];
  @Input() prototypeName = '';
  @Output() modalClose = new EventEmitter<void>();

  private router = inject(Router);

  expandedIndex: number | null = 0; // первая (самая свежая) версия раскрыта по умолчанию

  toggleRelease(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  navigateToPage(route: string): void {
    this.router.navigateByUrl(route);
    this.onClose();
  }

  formatDate(dateStr: string): string {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ];
    const [year, month, day] = dateStr.split('-').map(Number);
    return `${day} ${months[month - 1]} ${year}`;
  }

  onClose(): void {
    this.modalClose.emit();
  }
}
