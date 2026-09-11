import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';

/**
 * Единая плашка экрана задачи: номер задачи + заголовок + «Что меняется» + Jira-номера.
 * Используется на каждом экране демо.
 */
@Component({
  selector: 'app-q4-task-header',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="q4-task-header">
      <div class="q4-th-top">
        <span class="q4-th-badge">Цель {{ goal }} · {{ taskKey }}</span>
        <h1 class="q4-th-title">{{ title }}</h1>
        <div class="q4-jira-chips" *ngIf="jira && jira.length > 0">
          <span class="q4-jira-chip" *ngFor="let j of jira">{{ j }}</span>
        </div>
      </div>
      <div class="q4-changes">
        <div class="q4-changes-label">
          <lucide-icon name="arrow-right" [size]="14"></lucide-icon>
          Что меняется
        </div>
        <ul class="q4-changes-list">
          <li *ngFor="let c of changes">{{ c }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .q4-task-header {
        background: var(--dt-surface-primary);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-sl);
        padding: 16px 20px;
        margin-bottom: 16px;
        font-family: Roboto, sans-serif;
      }
      .q4-th-top {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .q4-th-badge {
        font-size: 12px;
        font-weight: 700;
        color: var(--dt-text-inversive);
        background: var(--dt-brand-accent);
        border-radius: 4px;
        padding: 4px 10px;
        letter-spacing: 0.3px;
      }
      .q4-th-title {
        font-size: 18px;
        font-weight: 500;
        color: var(--dt-text-primary);
        margin: 0;
      }
      .q4-jira-chips { display: flex; gap: 6px; margin-left: auto; flex-wrap: wrap; }
      .q4-jira-chip {
        font-size: 12px;
        color: var(--dt-text-secondary);
        background: var(--dt-surface-variant);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 2px 8px;
      }
      .q4-changes {
        margin-top: 12px;
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px;
        padding: 10px 14px;
      }
      .q4-changes-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--dt-brand-accent-dark);
        margin-bottom: 6px;
      }
      .q4-changes-list { margin: 0; padding-left: 18px; }
      .q4-changes-list li {
        font-size: 13px;
        color: var(--dt-text-secondary);
        line-height: 1.55;
      }
    `,
  ],
})
export class Q4TaskHeaderComponent {
  @Input() goal = '';
  @Input() taskKey = '';
  @Input() title = '';
  @Input() changes: string[] = [];
  @Input() jira: string[] = [];
}
