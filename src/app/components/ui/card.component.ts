import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="cardClasses"
      (click)="onCardClick()"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class UiCardComponent {
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() hoverable = false;
  @Output() cardClick = new EventEmitter<void>();

  private readonly paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  get cardClasses(): string {
    const base = 'bg-surface rounded border border-border elevation-1';
    const pad = this.paddingClasses[this.padding] || '';
    const hover = this.hoverable
      ? 'hover:elevation-2 hover:border-border-strong transition-shadow cursor-pointer'
      : '';
    return `${base} ${pad} ${hover}`.trim();
  }

  onCardClick(): void {
    this.cardClick.emit();
  }
}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  template: `
    <div class="pb-3 mb-3 border-b border-border">
      <ng-content></ng-content>
    </div>
  `,
})
export class UiCardHeaderComponent {}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  template: `
    <h3 class="text-lg font-medium text-text-primary">
      <ng-content></ng-content>
    </h3>
  `,
})
export class UiCardTitleComponent {}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  template: `
    <div>
      <ng-content></ng-content>
    </div>
  `,
})
export class UiCardContentComponent {}
