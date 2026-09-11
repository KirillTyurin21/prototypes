import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Q4Crumb {
  label: string;
  route?: string;
  onClick?: () => void;
}

/**
 * Крошки страницы в стиле Admin-панели: «Экраны и звуки / Кампании / Промо «Завтраки»».
 */
@Component({
  selector: 'app-q4-crumbs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="q4-crumbs" aria-label="breadcrumb">
      <ng-container *ngFor="let item of items; let last = last">
        <span class="q4-crumb" [class.q4-crumb-link]="item.route || item.onClick" (click)="click(item)">
          {{ item.label }}
        </span>
        <span class="q4-crumb-sep" *ngIf="!last">/</span>
      </ng-container>
    </nav>
  `,
  styles: [
    `
      .q4-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9E9E9E; margin-bottom: 12px; flex-wrap: wrap; }
      .q4-crumb { cursor: default; }
      .q4-crumb-link { cursor: pointer; }
      .q4-crumb-link:hover { color: #448AFF; }
      .q4-crumb-sep { color: #BDBDBD; }
    `,
  ],
})
export class Q4CrumbsComponent {
  @Input() items: Q4Crumb[] = [];

  click(item: Q4Crumb): void {
    if (item.onClick) {
      item.onClick();
    }
  }
}
