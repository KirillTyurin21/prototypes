import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { Q4_GOALS } from '../data/mock-data';

@Component({
  selector: 'app-overview-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="ov-container">
      <div class="ov-hero">
        <div>
          <h1 class="ov-h1">Целевое видение Q4</h1>
          <p class="ov-sub">
            Демо к встрече по планированию версии Q4: 6 целей, 11 задач. Кликните по задаче — откроется её целевое решение.
          </p>
        </div>
        <div class="ov-legend">
          <span class="ov-legend-item"><span class="ov-dot ov-dot-must"></span>Обязательно</span>
          <span class="ov-legend-item"><span class="ov-dot ov-dot-wish"></span>Желательно</span>
          <span class="ov-legend-item"><span class="ov-dot ov-dot-cross"></span>Сквозные</span>
          <span class="ov-legend-item"><span class="ov-dot ov-dot-research"></span>Проработка</span>
        </div>
      </div>

      <div class="ov-grid">
        <div class="ov-goal-card" *ngFor="let goal of goals" [class.ov-goal-must]="goal.priority === 'must'">
          <div class="ov-goal-head">
            <span class="ov-goal-num">Цель {{ goal.id }}</span>
            <span class="ov-priority" [class]="'ov-priority-' + goal.priority">{{ goal.priorityLabel }}</span>
          </div>
          <div class="ov-goal-title">{{ goal.title }}</div>
          <div class="ov-task-tiles">
            <button
              class="ov-task-tile"
              *ngFor="let task of goal.tasks"
              (click)="openTask(task.route)"
            >
              <div class="ov-task-top">
                <span class="ov-task-key">{{ task.key }}</span>
                <span class="ov-task-est">{{ task.estimate === 'проработка' ? 'проработка' : task.estimate + ' дн.' }}</span>
              </div>
              <div class="ov-task-name">{{ task.title }}</div>
              <div class="ov-task-dep" *ngIf="task.dependsOn && task.dependsOn.length > 0">
                <lucide-icon name="arrow-right" [size]="12"></lucide-icon>
                после {{ task.dependsOn.join(', ') }}
              </div>
              <div class="ov-task-go" *ngIf="!task.dependsOn?.length">
                <lucide-icon name="arrow-right" [size]="12"></lucide-icon>
                открыть демо
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="ov-q3">
        <lucide-icon name="info" [size]="16"></lucide-icon>
        <span>
          Перенос из Q3 (MenuBoard и хвосты) в демо не включён — обсуждается с Русланом отдельно.
        </span>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .ov-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
        font-family: Roboto, sans-serif;
      }
      .ov-hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }
      .ov-h1 { font-size: 24px; font-weight: 500; color: var(--dt-text-primary); margin: 0 0 6px; }
      .ov-sub { font-size: 13px; color: var(--dt-text-secondary); max-width: 640px; line-height: 1.5; }
      .ov-legend { display: flex; gap: 16px; padding-top: 6px; }
      .ov-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--dt-text-secondary); }
      .ov-dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; }
      .ov-dot-must { background: var(--dt-brand-accent); }
      .ov-dot-wish { background: var(--dt-brand-positive); }
      .ov-dot-cross { background: var(--dt-brand-warning); }
      .ov-dot-research { background: var(--dt-text-disable); }

      .ov-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 16px;
      }
      .ov-goal-card {
        background: var(--dt-surface-primary);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-sl);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .ov-goal-must { border-top: 3px solid var(--dt-brand-accent); }
      .ov-goal-head { display: flex; align-items: center; justify-content: space-between; }
      .ov-goal-num { font-size: 13px; font-weight: 700; color: var(--dt-brand-accent); }
      .ov-priority {
        font-size: 11px;
        font-weight: 500;
        border-radius: 999px;
        padding: 3px 10px;
      }
      .ov-priority-must { color: var(--dt-brand-accent-dark); background: var(--dt-brand-accent-lighter); }
      .ov-priority-wish { color: var(--dt-brand-positive-dark); background: var(--dt-brand-positive-lighter); }
      .ov-priority-cross { color: var(--dt-brand-warning-dark); background: var(--dt-brand-warning-lighter); }
      .ov-priority-research { color: var(--dt-text-secondary); background: var(--dt-surface-hover); }
      .ov-goal-title { font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }

      .ov-task-tiles { display: flex; flex-direction: column; gap: 8px; }
      .ov-task-tile {
        display: block;
        width: 100%;
        text-align: left;
        background: var(--dt-surface-variant);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 10px 12px;
        cursor: pointer;
        transition: box-shadow 0.15s ease-out, border-color 0.15s ease-out;
      }
      .ov-task-tile:hover {
        border-color: var(--dt-brand-accent);
        box-shadow: var(--dt-shadow-sl);
      }
      .ov-task-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
      .ov-task-key { font-size: 13px; font-weight: 700; color: var(--dt-brand-accent); }
      .ov-task-est { font-size: 11px; color: var(--dt-text-secondary); background: var(--dt-surface-primary); border: 1px solid var(--dt-stroke-default); border-radius: 4px; padding: 1px 6px; }
      .ov-task-name { font-size: 13px; color: var(--dt-text-primary); line-height: 1.4; }
      .ov-task-dep, .ov-task-go {
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
      }
      .ov-task-dep { color: var(--dt-text-secondary); }
      .ov-task-go { color: var(--dt-brand-accent); font-weight: 500; }

      .ov-q3 {
        margin-top: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        color: var(--dt-text-secondary);
        background: var(--dt-surface-primary);
        border: 1px dashed var(--dt-stroke-default);
        border-radius: 4px;
        padding: 12px 16px;
      }
    `,
  ],
})
export class OverviewScreenComponent {
  private router = inject(Router);
  goals = Q4_GOALS;

  openTask(route: string): void {
    this.router.navigate(['/prototype/q4-vision', route]);
  }
}
