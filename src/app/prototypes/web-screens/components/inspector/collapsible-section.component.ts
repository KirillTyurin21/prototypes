import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="collapsible-section">
      <div class="section-header" (click)="toggle()">
        <span class="section-title">{{ title }}</span>
        <lucide-icon [name]="expanded ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
      </div>
      <div *ngIf="expanded" class="section-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .collapsible-section {
      border-bottom: 1px solid var(--dt-stroke-default);
      margin-bottom: 4px;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--dt-text-primary);
      cursor: pointer;
      user-select: none;
    }
    .section-header:hover {
      color: var(--dt-brand-accent);
    }
    .section-content {
      padding-bottom: 12px;
    }
  `],
})
export class CollapsibleSectionComponent {
  @Input() title = '';
  @Input() expanded = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  toggle(): void {
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }
}
