import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4TaskHeaderComponent } from '../components/q4-task-header.component';

@Component({
  selector: 'app-task-6-home-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4TaskHeaderComponent],
  template: `
    <div class="t-container">
      <app-q4-task-header
        goal="6"
        taskKey="6"
        title="Стартовая страница продукта"
        [jira]="['DS-716']"
        [changes]="[
          'Сейчас: вход в продукт открывает рабочий список, единой картины работы нет — показатели разбросаны по страницам',
          'Будет: стартовая страница с показателями: устройства, готовность сети, темы, версии, кампании и подсказки. В Q4 — только проработка и опрос клиентов'
        ]"
      ></app-q4-task-header>

      <div class="t-dash">
        <div class="t-dash-head">
          <span class="t-dash-title">Customer Screen</span>
          <span class="t-dash-sub">Стартовая страница продукта — видение</span>
        </div>

        <div class="t-kpi-grid">
          <button class="t-kpi" (click)="openSection('Экраны')">
            <div class="t-kpi-top">
              <lucide-icon name="monitor" [size]="18"></lucide-icon>
              <span class="t-kpi-title">Устройства</span>
            </div>
            <div class="t-kpi-value">
              12 <span class="t-kpi-ok">онлайн</span> · 1 <span class="t-kpi-bad">офлайн</span>
            </div>
            <div class="t-kpi-sub">из 13 экранов сети</div>
          </button>

          <button class="t-kpi" (click)="openSection('Кампании')">
            <div class="t-kpi-top">
              <lucide-icon name="film" [size]="18"></lucide-icon>
              <span class="t-kpi-title">Готовность кампаний</span>
            </div>
            <div class="t-kpi-value">3 из 4</div>
            <div class="t-kpi-sub">кампании готовы к запуску</div>
          </button>

          <button class="t-kpi" (click)="openSection('Темы')">
            <div class="t-kpi-top">
              <lucide-icon name="palette" [size]="18"></lucide-icon>
              <span class="t-kpi-title">Темы</span>
            </div>
            <div class="t-kpi-value">5</div>
            <div class="t-kpi-sub">тем · 14 страниц</div>
          </button>

          <button class="t-kpi" (click)="openSection('Подсказки')">
            <div class="t-kpi-top">
              <lucide-icon name="message-square" [size]="18"></lucide-icon>
              <span class="t-kpi-title">Активные подсказки</span>
            </div>
            <div class="t-kpi-value">7</div>
            <div class="t-kpi-sub">подсказок назначено на точки</div>
          </button>

          <button class="t-kpi" (click)="openSection('Экраны')">
            <div class="t-kpi-top">
              <lucide-icon name="check-circle" [size]="18"></lucide-icon>
              <span class="t-kpi-title">Версии плагинов</span>
            </div>
            <div class="t-kpi-value">12 из 13</div>
            <div class="t-kpi-sub">устройств на актуальной версии</div>
          </button>
        </div>

        <div class="t-note">
          <lucide-icon name="info" [size]="15"></lucide-icon>
          Клик по показателю ведёт в раздел. Показатели — кандидаты для опроса клиентов. Перспектива: одна кнопка Web на весь домен — «весь ресторан на ладони» (вне Q4).
        </div>
      </div>

      <div class="t-snack" *ngIf="snack">
        <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
        {{ snack }}
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .t-container { max-width: 1100px; margin: 0 auto; padding: 24px; font-family: Roboto, sans-serif; }

      .t-dash {
        background: var(--dt-surface-primary);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-sl);
        padding: 20px;
      }
      .t-dash-head { margin-bottom: 16px; }
      .t-dash-title { font-size: 20px; font-weight: 500; color: var(--dt-text-primary); }
      .t-dash-sub { font-size: 12px; color: var(--dt-text-secondary); margin-left: 12px; }

      .t-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }
      .t-kpi {
        display: block;
        text-align: left;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        background: var(--dt-surface-variant);
        padding: 14px 16px;
        cursor: pointer;
        transition: box-shadow 0.15s ease-out, border-color 0.15s ease-out;
        font-family: Roboto, sans-serif;
      }
      .t-kpi:hover { border-color: var(--dt-brand-accent); box-shadow: var(--dt-shadow-sl); }
      .t-kpi-top { display: flex; align-items: center; gap: 8px; color: var(--dt-brand-accent); margin-bottom: 10px; }
      .t-kpi-title { font-size: 13px; font-weight: 500; color: var(--dt-text-primary); }
      .t-kpi-value { font-size: 22px; font-weight: 500; color: var(--dt-text-primary); }
      .t-kpi-ok { font-size: 12px; color: #14B456; }
      .t-kpi-bad { font-size: 12px; color: #FF5252; }
      .t-kpi-sub { font-size: 11px; color: var(--dt-text-secondary); margin-top: 4px; }

      .t-note {
        margin-top: 16px;
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px; padding: 10px 12px;
      }
      .t-snack {
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        display: flex; align-items: center; gap: 8px;
        background: var(--dt-surface-snack-tooltip);
        color: #FFFFFF; font-size: 13px;
        border-radius: 4px; padding: 10px 16px;
        box-shadow: var(--dt-shadow-m);
        z-index: 300;
        animation: fade-in-up 0.25s ease-out;
      }
      @keyframes fade-in-up {
        from { opacity: 0; transform: translate(-50%, 8px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    `,
  ],
})
export class Task6HomeScreenComponent {
  snack = '';

  openSection(section: string): void {
    this.snack = `Переход в раздел «${section}»`;
    setTimeout(() => (this.snack = ''), 2200);
  }
}
