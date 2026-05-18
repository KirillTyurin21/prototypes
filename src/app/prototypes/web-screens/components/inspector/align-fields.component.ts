import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-align-fields',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="align-row">
      <button class="align-btn" [class.active]="hAlign === 'left'" (click)="hAlignChange.emit('left')">
        <lucide-icon name="align-left" [size]="16"></lucide-icon>
      </button>
      <button class="align-btn" [class.active]="hAlign === 'center'" (click)="hAlignChange.emit('center')">
        <lucide-icon name="align-center" [size]="16"></lucide-icon>
      </button>
      <button class="align-btn" [class.active]="hAlign === 'right'" (click)="hAlignChange.emit('right')">
        <lucide-icon name="align-right" [size]="16"></lucide-icon>
      </button>
    </div>
    <div class="align-row" *ngIf="showVertical" style="margin-top: 4px;">
      <button class="align-btn" [class.active]="vAlign === 'top'" (click)="vAlignChange.emit('top')">
        <lucide-icon name="align-start-vertical" [size]="16"></lucide-icon>
      </button>
      <button class="align-btn" [class.active]="vAlign === 'middle'" (click)="vAlignChange.emit('middle')">
        <lucide-icon name="align-center-vertical" [size]="16"></lucide-icon>
      </button>
      <button class="align-btn" [class.active]="vAlign === 'bottom'" (click)="vAlignChange.emit('bottom')">
        <lucide-icon name="align-end-vertical" [size]="16"></lucide-icon>
      </button>
    </div>
  `,
  styles: [`
    .align-row {
      display: flex;
      gap: 4px;
      margin-top: 8px;
    }
    .align-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--dt-stroke-default);
      border-radius: 4px;
      background: transparent;
      color: var(--dt-text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }
    .align-btn:hover {
      background: var(--dt-surface-hover);
    }
    .align-btn.active {
      background: var(--dt-brand-accent-lighter);
      border-color: var(--dt-brand-accent);
      color: var(--dt-brand-accent);
    }
  `],
})
export class AlignFieldsComponent {
  @Input() hAlign: 'left' | 'center' | 'right' = 'left';
  @Input() vAlign: 'top' | 'middle' | 'bottom' = 'top';
  @Input() showVertical = false;
  @Output() hAlignChange = new EventEmitter<'left' | 'center' | 'right'>();
  @Output() vAlignChange = new EventEmitter<'top' | 'middle' | 'bottom'>();
}
