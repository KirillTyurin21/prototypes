import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4TaskHeaderComponent } from '../components/q4-task-header.component';
import { CAMPAIGN_NAME, READINESS_ROWS } from '../data/mock-data';
import { ReadinessRow } from '../types';

@Component({
  selector: 'app-task-1-2-readiness-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4TaskHeaderComponent],
  template: `
    <div class="t-container">
      <app-q4-task-header
        goal="1"
        taskKey="1.2"
        title="Мониторинг готовности контента"
        [jira]="['DS-716', 'DS-1293']"
        [changes]="[
          'Сейчас: мониторинг отдельного экрана (скриншот, версия, активность), сводки по кампании нет — сеть проверяют глазами',
          'Будет: вкладка «Готовность» в карточке кампании — статусы назначено / загрузилось / не загрузилось / офлайн по каждой точке'
        ]"
      ></app-q4-task-header>

      <div class="t-card">
        <div class="t-card-head">
          <span class="t-crumb">Кампании /</span>
          <span class="t-card-title">{{ campaignName }}</span>
        </div>

        <div class="t-tabs">
          <button class="t-tab" (click)="tab = 'base'">Основное</button>
          <button class="t-tab" (click)="tab = 'screens'">Экраны</button>
          <button class="t-tab" [class.active]="tab === 'where'" (click)="tab = 'where'">Где показывать</button>
          <button class="t-tab" [class.active]="tab === 'ready'" (click)="tab = 'ready'">Готовность</button>
        </div>

        <div class="t-body" *ngIf="tab === 'ready'">
          <!-- Progress -->
          <div class="t-progress-block">
            <div class="t-progress-top">
              <span class="t-progress-label">Сеть готова к запуску</span>
              <span class="t-progress-count">{{ readyCount }} из {{ rows.length }} точек</span>
            </div>
            <div class="t-progress-bar">
              <div class="t-progress-fill" [style.width.%]="progressPercent"></div>
            </div>
          </div>

          <!-- Summary chips -->
          <div class="t-chips">
            <span class="t-chip t-chip-ok">{{ readyCount }} загрузилось</span>
            <span class="t-chip t-chip-bad">{{ notLoadedCount }} не загрузилось</span>
            <span class="t-chip t-chip-warn">{{ notAssignedCount }} не назначено</span>
            <span class="t-chip t-chip-off">{{ offlineCount }} офлайн</span>
          </div>

          <!-- Table -->
          <table class="t-table">
            <thead>
              <tr>
                <th>Точка / терминал</th>
                <th>Продукт</th>
                <th>Статус</th>
                <th>Последняя активность</th>
                <th style="width: 200px"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of rows">
                <td class="t-td-name">{{ r.terminal }}</td>
                <td>{{ r.product }}</td>
                <td>
                  <span class="t-status" [class]="'t-status-' + statusClass(r)">{{ statusLabel(r) }}</span>
                </td>
                <td class="t-td-activity">{{ r.lastActivity }}</td>
                <td>
                  <button
                    class="t-btn t-btn-send"
                    *ngIf="canSend(r)"
                    (click)="sendSettings(r)"
                  >
                    <lucide-icon name="send" [size]="14"></lucide-icon>
                    Отправить настройки
                  </button>
                  <span class="t-ready-mark" *ngIf="isReady(r)">
                    <lucide-icon name="check-circle" [size]="16"></lucide-icon>
                    готово
                  </span>
                  <span class="t-hint-warn" *ngIf="!isReady(r) && !canSend(r) && !isOffline(r)">
                    назначить через мастер 1.1
                  </span>
                  <span class="t-hint-off" *ngIf="isOffline(r)">устройство выключено</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="t-note">
            <lucide-icon name="info" [size]="15"></lucide-icon>
            Источник «загрузилось» — подтверждение от устройства о получении контента кампании. Офлайн определяется по последней активности (граница «выключен» против «не загрузил» — открытый вопрос).
          </div>
        </div>

        <div class="t-body" *ngIf="tab !== 'ready'">
          <div class="t-empty">Перейдите на вкладку «Готовность» — демо этого раздела там.</div>
        </div>
      </div>

      <div class="t-snack" *ngIf="snack">
        <lucide-icon name="check-circle" [size]="16"></lucide-icon>
        {{ snack }}
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .t-container { max-width: 1100px; margin: 0 auto; padding: 24px; font-family: Roboto, sans-serif; }
      .t-card {
        background: var(--dt-surface-primary);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-sl);
      }
      .t-card-head { display: flex; align-items: baseline; gap: 6px; padding: 16px 20px 0; }
      .t-crumb { font-size: 12px; color: var(--dt-text-disable); }
      .t-card-title { font-size: 18px; font-weight: 500; color: var(--dt-text-primary); }
      .t-tabs { display: flex; border-bottom: 1px solid var(--dt-stroke-default); padding: 0 20px; margin-top: 12px; }
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
      .t-body { padding: 16px 20px 20px; }
      .t-empty { font-size: 13px; color: var(--dt-text-disable); padding: 24px 0; text-align: center; }

      .t-progress-block { margin-bottom: 14px; }
      .t-progress-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
      .t-progress-label { font-size: 13px; font-weight: 500; color: var(--dt-text-primary); }
      .t-progress-count { font-size: 12px; color: var(--dt-text-secondary); }
      .t-progress-bar { height: 8px; border-radius: 4px; background: var(--dt-surface-press); overflow: hidden; }
      .t-progress-fill { height: 100%; background: #448AFF; border-radius: 4px; transition: width 0.4s ease-out; }

      .t-chips { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
      .t-chip { font-size: 12px; font-weight: 500; border-radius: 999px; padding: 4px 10px; }
      .t-chip-ok { color: #14B456; background: #EBFBF2; }
      .t-chip-bad { color: #FF5252; background: #FFF2F2; }
      .t-chip-warn { color: #EA7806; background: #FFF9F0; }
      .t-chip-off { color: #616161; background: #F5F5F5; }

      .t-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .t-table th {
        text-align: left;
        background: #F0F5FF;
        color: #616161;
        font-weight: 400;
        padding: 12px 16px;
        border-bottom: none;
      }
      .t-table td { padding: 11px 16px; border-bottom: 1px solid var(--dt-stroke-default); color: var(--dt-text-primary); }
      .t-table tr:hover td { background: var(--dt-surface-hover); }
      .t-td-name { font-weight: 500; }
      .t-td-activity { color: var(--dt-text-secondary); }

      .t-status { font-size: 12px; border-radius: 999px; padding: 3px 10px; font-weight: 500; }
      .t-status-ok { color: #14B456; background: #EBFBF2; }
      .t-status-bad { color: #FF5252; background: #FFF2F2; }
      .t-status-warn { color: #EA7806; background: #FFF9F0; }
      .t-status-off { color: #616161; background: #F5F5F5; }

      .t-btn {
        display: inline-flex; align-items: center; gap: 6px;
        height: 32px; padding: 0 12px;
        border-radius: 4px;
        font-size: 12px; font-weight: 500;
        border: 1px solid var(--dt-stroke-default);
        background: var(--dt-surface-primary);
        color: var(--dt-text-primary);
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .t-btn:hover { background: #FAFAFA; }
      .t-btn-send { border-color: #448AFF; color: #448AFF; }
      .t-btn-send:hover { background: var(--dt-brand-accent-lighter); }
      .t-ready-mark { display: inline-flex; align-items: center; gap: 6px; color: #14B456; font-size: 12px; }
      .t-hint-warn { font-size: 12px; color: #EA7806; }
      .t-hint-off { font-size: 12px; color: var(--dt-text-disable); }

      .t-note {
        margin-top: 14px;
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
export class Task12ReadinessScreenComponent {
  campaignName = CAMPAIGN_NAME;
  rows: ReadinessRow[] = READINESS_ROWS.map(r => ({ ...r }));
  tab = 'ready';
  snack = '';

  get readyCount(): number {
    return this.rows.filter(r => this.isReady(r)).length;
  }

  get notLoadedCount(): number {
    return this.rows.filter(r => !this.isOffline(r) && r.assigned && !r.loaded).length;
  }

  get notAssignedCount(): number {
    return this.rows.filter(r => !this.isOffline(r) && !r.assigned).length;
  }

  get offlineCount(): number {
    return this.rows.filter(r => this.isOffline(r)).length;
  }

  get progressPercent(): number {
    return Math.round((this.readyCount / this.rows.length) * 100);
  }

  isOffline(r: ReadinessRow): boolean {
    return r.lastActivity === 'вчера';
  }

  isReady(r: ReadinessRow): boolean {
    return r.assigned && r.loaded && !this.isOffline(r);
  }

  canSend(r: ReadinessRow): boolean {
    return r.assigned && !r.loaded && !this.isOffline(r);
  }

  statusLabel(r: ReadinessRow): string {
    if (this.isOffline(r)) return 'офлайн';
    if (!r.assigned) return 'не назначено';
    if (!r.loaded) return 'не загрузилось';
    return 'загрузилось';
  }

  statusClass(r: ReadinessRow): string {
    if (this.isOffline(r)) return 'off';
    if (!r.assigned) return 'warn';
    if (!r.loaded) return 'bad';
    return 'ok';
  }

  sendSettings(r: ReadinessRow): void {
    r.loaded = true;
    r.lastActivity = 'только что';
    this.snack = `Настройки отправлены — «${r.terminal}» подтвердил загрузку`;
    setTimeout(() => (this.snack = ''), 2200);
  }
}
