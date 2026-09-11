import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import { CAMPAIGN_NAME, READINESS_ROWS } from '../data/mock-data';
import { Q4_COMMON_STYLES } from '../data/q4-common.styles';
import { ReadinessRow } from '../types';

@Component({
  selector: 'app-task-1-2-readiness-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="c-container">
      <app-q4-crumbs [items]="crumbs"></app-q4-crumbs>

      <div class="q4-page-header">
        <div class="c-title-group">
          <button class="q4-icon-btn q4-icon-btn-border c-back-btn" (click)="goBack()" aria-label="Назад">
            <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
          </button>
          <h1 class="q4-page-title">Редактирование кампании</h1>
        </div>
        <div class="q4-header-actions">
          <button class="q4-btn q4-btn-primary" (click)="showSnack('Сохранено')">
            <lucide-icon name="save" [size]="16"></lucide-icon>
            Сохранить
          </button>
        </div>
      </div>

      <div class="q4-note">
        <lucide-icon name="info" [size]="15"></lucide-icon>
        <span>
          Целевое решение 1.2 (DS-716 · DS-1293): вкладка «Готовность» в карточке кампании — статусы по каждой точке.
          Сейчас сеть проверяют глазами, экран за экраном; будет машинный статус загрузки.
        </span>
      </div>

      <!-- Вкладки верхнего уровня -->
      <div class="c-top-tabs">
        <button class="c-top-tab" (click)="goTo('task-1-1')">Контент</button>
        <button class="c-top-tab" (click)="goTo('task-1-1')">Где показывать</button>
        <button class="c-top-tab active">Готовность</button>
      </div>

      <div class="c-card">
        <div class="c-progress-block">
          <div class="c-progress-top">
            <span class="c-progress-label">Сеть готова к запуску: «{{ campaignName }}»</span>
            <span class="c-progress-count">{{ readyCount }} из {{ rows.length }} точек</span>
          </div>
          <div class="q4-progress">
            <div class="q4-progress-fill" [style.width.%]="progressPercent"></div>
          </div>
        </div>

        <div class="c-chips">
          <span class="q4-badge q4-badge-ready">{{ readyCount }} загрузилось</span>
          <span class="q4-badge q4-badge-error">{{ notLoadedCount }} не загрузилось</span>
          <span class="q4-badge q4-badge-waiting">{{ notAssignedCount }} не назначено</span>
          <span class="q4-badge q4-badge-offline">{{ offlineCount }} офлайн</span>
        </div>

        <div class="q4-table-wrap">
          <table class="q4-table">
            <thead>
              <tr>
                <th>Точка / терминал</th>
                <th>Продукт</th>
                <th>Статус</th>
                <th>Последняя активность</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of rows">
                <td class="c-td-name">{{ r.terminal }}</td>
                <td>{{ r.product }}</td>
                <td>
                  <span class="q4-badge" [class]="statusBadge(r)">{{ statusLabel(r) }}</span>
                </td>
                <td class="q4-cell-secondary">{{ r.lastActivity }}</td>
                <td class="q4-actions">
                  <button class="q4-btn q4-btn-outline q4-btn-sm" *ngIf="canSend(r)" (click)="sendSettings(r)">
                    <lucide-icon name="send" [size]="14"></lucide-icon>
                    Отправить настройки
                  </button>
                  <button class="q4-icon-btn q4-icon-btn-border" (click)="openScreenshot(r)" aria-label="Скриншот экрана">
                    <lucide-icon name="camera" [size]="18"></lucide-icon>
                  </button>
                  <span class="c-hint-warn" *ngIf="!canSend(r) && !isOffline(r) && !isReady(r)">назначить в мастере</span>
                  <span class="c-hint-off" *ngIf="isOffline(r)">—</span>
                  <span class="c-ready-mark" *ngIf="isReady(r)">
                    <lucide-icon name="check-circle" [size]="16"></lucide-icon>
                    готово
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="q4-note c-note-inside">
          <lucide-icon name="info" [size]="15"></lucide-icon>
          Источник «загрузилось» — подтверждение от устройства о получении контента кампании. Офлайн определяется по последней активности
          (граница «выключен» против «не загрузил» — открытый вопрос). База мониторинга уже есть — добавляется машинный статус.
        </div>
      </div>

      <!-- Скриншот экрана -->
      <div class="q4-overlay" *ngIf="shotTarget" (click)="shotTarget = null">
        <div class="q4-dialog c-shot-dialog" (click)="$event.stopPropagation()">
          <div class="q4-dialog-head">
            <span class="q4-dialog-head-title">Скриншот экрана</span>
            <button class="q4-icon-btn" (click)="shotTarget = null" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="c-shot-body">
            <div class="c-shot-screen">
              <div class="c-shot-block" style="background: #448AFF"></div>
              <div class="c-shot-block" style="background: #FFAB40"></div>
              <div class="c-shot-placeholder">«Здесь может быть ваше изображение или видео»</div>
            </div>
            <div class="c-shot-meta">
              <div class="c-shot-meta-row"><span>Ресторан</span><span>{{ shotTarget?.terminal }}</span></div>
              <div class="c-shot-meta-row"><span>Терминал</span><span>{{ shotTarget?.product }}</span></div>
              <div class="c-shot-meta-row"><span>Время снимка</span><span>11.09.2026 14:32</span></div>
              <div class="c-shot-meta-row"><span>Разрешение</span><span>1024x768</span></div>
            </div>
          </div>
          <div class="q4-dialog-foot">
            <button class="q4-btn q4-btn-primary" (click)="shotTarget = null">Закрыть</button>
          </div>
        </div>
      </div>

      <!-- Тост -->
      <div class="q4-toast" *ngIf="snack">
        <lucide-icon name="check-circle" [size]="16"></lucide-icon>
        {{ snack }}
      </div>
    </div>
  `,
  styles: [
    Q4_COMMON_STYLES,
    `
      :host { display: block; }
      .c-container { max-width: 1200px; margin: 0 auto; padding: 20px 24px; font-family: Roboto, sans-serif; }

      .c-title-group { display: flex; align-items: center; gap: 12px; }
      .c-back-btn { border-radius: 50%; }

      .c-top-tabs { display: flex; gap: 0; }
      .c-top-tab {
        position: relative;
        border: 1px solid #E0E0E0;
        border-bottom: none;
        background: #FFFFFF;
        border-radius: 4px 4px 0 0;
        padding: 12px 20px;
        font-family: Roboto, sans-serif;
        font-size: 13px;
        color: rgba(0,0,0,.54);
        cursor: pointer;
      }
      .c-top-tab.active { color: #448AFF; font-weight: 500; }
      .c-top-tab.active::after {
        content: '';
        position: absolute; left: 0; right: 0; bottom: 0;
        height: 2px; background: #448AFF;
      }

      .c-card {
        background: #FFFFFF;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        box-shadow: 0 1px 3px rgba(0,0,0,.06);
        padding: 16px 20px;
      }

      .c-progress-block { margin-bottom: 14px; }
      .c-progress-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
      .c-progress-label { font-size: 13px; font-weight: 500; color: #333333; }
      .c-progress-count { font-size: 12px; color: #616161; }

      .c-chips { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }

      .c-td-name { font-weight: 500; }
      .c-hint-warn { font-size: 12px; color: #EA7806; white-space: nowrap; }
      .c-hint-off { font-size: 12px; color: #9E9E9E; }
      .c-ready-mark { display: inline-flex; align-items: center; gap: 6px; color: #14B456; font-size: 12px; }
      .c-note-inside { margin: 14px 0 0; }

      /* Скриншот */
      .c-shot-dialog { width: 480px; max-width: calc(100vw - 32px); }
      .c-shot-body { padding: 16px 20px; display: flex; gap: 16px; align-items: flex-start; }
      .c-shot-screen {
        width: 220px; height: 165px;
        background: rgba(128,128,128,.69);
        border-radius: 4px;
        display: flex; flex-direction: column; gap: 8px;
        padding: 16px;
        flex-shrink: 0;
      }
      .c-shot-block { height: 28px; border-radius: 4px; }
      .c-shot-placeholder {
        margin-top: auto;
        background: rgba(255,255,255,.68);
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 11px; color: #616161;
        text-align: center;
      }
      .c-shot-meta { flex: 1; min-width: 0; }
      .c-shot-meta-row {
        display: flex; justify-content: space-between; gap: 12px;
        padding: 6px 0;
        font-size: 12px;
        border-bottom: 1px solid #F5F5F5;
      }
      .c-shot-meta-row span:first-child { color: #9E9E9E; flex-shrink: 0; }
      .c-shot-meta-row span:last-child { color: #333333; text-align: right; }
    `,
  ],
})
export class Task12ReadinessScreenComponent {
  private router = inject(Router);

  campaignName = CAMPAIGN_NAME;
  rows: ReadinessRow[] = READINESS_ROWS.map(r => ({ ...r }));
  shotTarget: ReadinessRow | null = null;
  snack = '';

  crumbs = [
    { label: 'Экраны и звуки' },
    { label: 'Кампании' },
    { label: 'Промо «Завтраки»' },
    { label: 'Готовность' },
  ];

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

  statusBadge(r: ReadinessRow): string {
    if (this.isOffline(r)) return 'q4-badge-offline';
    if (!r.assigned) return 'q4-badge-waiting';
    if (!r.loaded) return 'q4-badge-error';
    return 'q4-badge-ready';
  }

  openScreenshot(r: ReadinessRow): void {
    this.shotTarget = r;
  }

  sendSettings(r: ReadinessRow): void {
    r.loaded = true;
    r.lastActivity = 'только что';
    this.snack = `Настройки отправлены — «${r.terminal}» подтвердил загрузку`;
    setTimeout(() => (this.snack = ''), 2500);
  }

  goBack(): void {
    this.router.navigate(['/prototype/q4-vision', 'task-1-1']);
  }

  goTo(route: string): void {
    this.router.navigate(['/prototype/q4-vision', route]);
  }

  showSnack(text: string): void {
    this.snack = text;
    setTimeout(() => (this.snack = ''), 2500);
  }
}
