import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import { ANALYTICS_ACTIONS } from '../data/mock-data';
import { Q4AnalyticsEvent } from '../types';

@Component({
  selector: 'app-task-5-matomo-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="t-container">
      <app-q4-crumbs [items]="crumbs"></app-q4-crumbs>

      <div class="t-note t-note-top">
        <lucide-icon name="info" [size]="15"></lucide-icon>
        <span>
          Целевое решение 5 (WEB-16081 · PB-7065): подключение готовой библиотеки аналитики к общему компоненту конструктора + события действий.
          Сейчас Matomo видит только переходы по разделам — что происходит внутри конструктора, не видно.
        </span>
      </div>

      <div class="t-layout">
        <!-- Мини-конструктор -->
        <div class="t-card">
          <div class="t-card-head">
            <span class="t-card-title">Конструктор темы</span>
          </div>
          <div class="t-demo-actions">
            <button class="t-action" (click)="log('Открытие конструктора темы', 'тема «Кофейня»')">
              <lucide-icon name="folder-open" [size]="16"></lucide-icon>
              Открыть конструктор
            </button>
            <button class="t-action" (click)="log('Создание темы', 'тема «Новая»')">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              Создать тему
            </button>
            <button class="t-action" (click)="log('Добавление элемента', 'тип: Изображение')">
              <lucide-icon name="image" [size]="16"></lucide-icon>
              Добавить элемент «Изображение»
            </button>
            <button class="t-action" (click)="log('Добавление элемента', 'тип: Текст')">
              <lucide-icon name="type" [size]="16"></lucide-icon>
              Добавить элемент «Текст»
            </button>
            <button class="t-action" (click)="log('Смена страницы', 'Режим ожидания → Экран заказа')">
              <lucide-icon name="columns" [size]="16"></lucide-icon>
              Сменить страницу
            </button>
            <button class="t-action" (click)="log('Копирование элемента', 'Баннер «Акция»')">
              <lucide-icon name="copy" [size]="16"></lucide-icon>
              Скопировать элемент
            </button>
            <button class="t-action" (click)="log('Сохранение темы', 'тема «Кофейня»')">
              <lucide-icon name="save" [size]="16"></lucide-icon>
              Сохранить тему
            </button>
          </div>
          <div class="t-note">
            <lucide-icon name="info" [size]="15"></lucide-icon>
            Каждый клик в конструкторе отправляет событие в Matomo через библиотеку аналитики. Нажмите кнопки — события появятся в журнале справа.
          </div>
        </div>

        <!-- Панель событий -->
        <div class="t-card">
          <div class="t-card-head">
            <span class="t-card-title">События аналитики</span>
          </div>
          <div class="t-tabs">
            <button class="t-tab" [class.active]="tab === 'log'" (click)="tab = 'log'">
              Журнал <span class="t-tab-count">{{ events.length }}</span>
            </button>
            <button class="t-tab" [class.active]="tab === 'list'" (click)="tab = 'list'">Перечень событий</button>
          </div>

          <div class="t-body" *ngIf="tab === 'log'">
            <button class="t-clear" *ngIf="events.length" (click)="clearLog()">
              <lucide-icon name="trash-2" [size]="13"></lucide-icon>
              Очистить журнал
            </button>
            <div class="t-log-empty" *ngIf="events.length === 0">
              Журнал пуст — выполните действие в конструкторе
            </div>
            <div class="t-log-row" *ngFor="let e of events">
              <span class="t-log-time">{{ e.time }}</span>
              <span class="t-log-action">{{ e.action }}</span>
              <span class="t-log-detail">{{ e.detail }}</span>
            </div>
          </div>

          <div class="t-body" *ngIf="tab === 'list'">
            <div class="t-list-row" *ngFor="let a of actions">
              <lucide-icon name="check" [size]="14" class="t-list-check"></lucide-icon>
              {{ a }}
            </div>
            <div class="t-inspector-hint">Предлагаемый перечень — согласуется с командой аналитики.</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .t-container { max-width: 1200px; margin: 0 auto; padding: 24px; font-family: Roboto, sans-serif; }
      .t-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }

      .t-card {
        background: var(--dt-surface-primary);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-sl);
      }
      .t-card-head { display: flex; align-items: baseline; gap: 6px; padding: 14px 20px 0; }
      .t-card-title { font-size: 16px; font-weight: 500; color: var(--dt-text-primary); }

      .t-demo-actions { display: flex; flex-direction: column; gap: 8px; padding: 14px 20px 0; }
      .t-action {
        display: flex; align-items: center; gap: 10px;
        height: 38px; padding: 0 14px;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        background: var(--dt-surface-primary);
        font-size: 13px;
        color: var(--dt-text-primary);
        cursor: pointer;
        font-family: Roboto, sans-serif;
        text-align: left;
      }
      .t-action:hover { background: var(--dt-surface-hover); border-color: var(--dt-brand-accent); }
      .t-action lucide-icon { color: var(--dt-brand-accent); }

      .t-tabs { display: flex; border-bottom: 1px solid var(--dt-stroke-default); padding: 0 20px; margin-top: 10px; }
      .t-tab {
        position: relative;
        border: none; background: transparent;
        padding: 12px 16px;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.54);
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .t-tab.active { color: var(--dt-brand-accent); font-weight: 500; }
      .t-tab.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--dt-brand-accent); }
      .t-tab-count {
        display: inline-block; min-width: 18px;
        font-size: 11px; color: var(--dt-text-inversive);
        background: var(--dt-brand-accent); border-radius: 999px;
        padding: 1px 5px; margin-left: 4px;
      }
      .t-body { padding: 14px 20px 20px; max-height: 430px; overflow-y: auto; }
      .t-clear {
        display: inline-flex; align-items: center; gap: 6px;
        height: 28px;
        border: none; background: transparent; border-radius: 3px;
        font-size: 12px; color: var(--dt-text-secondary);
        cursor: pointer;
        font-family: Roboto, sans-serif;
        padding: 0 8px;
        margin-bottom: 6px;
      }
      .t-clear:hover { background: var(--dt-surface-hover); color: #FF5252; }
      .t-log-empty { font-size: 12px; color: var(--dt-text-disable); text-align: center; padding: 24px 0; }
      .t-log-row {
        display: flex; align-items: baseline; gap: 10px;
        font-size: 12px;
        padding: 7px 0;
        border-bottom: 1px solid var(--dt-stroke-disable);
      }
      .t-log-time { color: var(--dt-text-disable); flex-shrink: 0; }
      .t-log-action { color: var(--dt-text-primary); font-weight: 500; }
      .t-log-detail { color: var(--dt-text-secondary); margin-left: auto; text-align: right; }
      .t-list-row {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px;
        color: var(--dt-text-primary);
        padding: 6px 0;
      }
      .t-list-check { color: #14B456; }
      .t-inspector-hint { font-size: 11px; color: var(--dt-text-disable); margin-top: 10px; }

      .t-note {
        margin: 14px 20px 20px;
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px; padding: 10px 12px;
      }
      .t-note-top { margin: 0 0 16px; }

      @media (max-width: 900px) {
        .t-layout { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class Task5MatomoScreenComponent {
  actions: string[] = ANALYTICS_ACTIONS;
  events: Q4AnalyticsEvent[] = [];
  tab = 'log';

  crumbs = [
    { label: 'Экраны и звуки' },
    { label: 'Экран покупателя' },
    { label: 'Конструктор темы — Аналитика' },
  ];

  clearLog(): void {
    this.events = [];
  }

  log(action: string, detail: string): void {
    const now = new Date();
    const time =
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0');
    this.events.unshift({
      id: this.events.length + 1,
      time,
      action,
      detail,
    });
  }
}
