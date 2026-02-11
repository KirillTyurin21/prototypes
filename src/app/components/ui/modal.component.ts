import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { UiButtonComponent } from './button.component';

/* ─────────────────────────────────────────────
   UiModalComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule, IconsModule, UiButtonComponent],
  template: `
    <div
      *ngIf="open"
      class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
    >
      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/40"
        (click)="onOverlayClick()"
      ></div>

      <!-- Dialog -->
      <div
        class="relative bg-surface rounded-lg elevation-modal animate-scale-in w-full mx-4"
        [ngClass]="sizeClass"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="text-lg font-medium text-text-primary">{{ title }}</h2>
          <button
            type="button"
            class="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
            (click)="onClose()"
          >
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-border">
          <ng-content select="[modalFooter]"></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class UiModalComponent implements OnChanges {
  @Input() open = false;
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Output() modalClose = new EventEmitter<void>();

  private readonly sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  get sizeClass(): string {
    return this.sizeClasses[this.size] || this.sizeClasses['md'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.onClose();
    }
  }

  onOverlayClick(): void {
    this.onClose();
  }

  onClose(): void {
    this.modalClose.emit();
  }
}

/* ─────────────────────────────────────────────
   UiConfirmDialogComponent
   ───────────────────────────────────────────── */
@Component({
  selector: 'ui-confirm-dialog',
  standalone: true,
  imports: [CommonModule, UiModalComponent, UiButtonComponent],
  template: `
    <ui-modal
      [open]="open"
      [title]="title"
      size="sm"
      (modalClose)="onCancel()"
    >
      <p class="text-sm text-text-secondary">{{ message }}</p>

      <div modalFooter class="flex items-center justify-end gap-2">
        <ui-button variant="secondary" size="sm" (click)="onCancel()">
          {{ cancelText }}
        </ui-button>
        <ui-button [variant]="variant === 'danger' ? 'danger' : 'primary'" size="sm" (click)="onConfirm()">
          {{ confirmText }}
        </ui-button>
      </div>
    </ui-modal>
  `,
})
export class UiConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Подтверждение';
  @Input() message = '';
  @Input() confirmText = 'Подтвердить';
  @Input() cancelText = 'Отмена';
  @Input() variant: 'primary' | 'danger' = 'primary';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
