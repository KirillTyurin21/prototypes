import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { Hint } from '../../cs-types';

interface ReportData {
  shows: number;
  conversions: number;
  conversionPercent: number;
}

@Component({
  selector: 'app-hint-report-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div *ngIf="open" class="panel-overlay" (click)="closePanel()"></div>
    <div class="report-panel" [class.panel-open]="open" *ngIf="open">
      <div class="panel-header">
        <button class="panel-back-btn" (click)="closePanel()" title="Назад">
          <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
        </button>
        <h2 class="panel-title">{{ hint?.name || 'Отчет' }}</h2>
        <button class="panel-close-btn" (click)="closePanel()" title="Закрыть">
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>
      <div class="panel-filter">
        <label class="filter-label">Период</label>
        <div class="period-toggle">
          <button class="period-btn" [class.period-active]="selectedPeriod === 'week'" (click)="onPeriodChange('week')">Неделя</button>
          <button class="period-btn" [class.period-active]="selectedPeriod === 'month'" (click)="onPeriodChange('month')">Месяц</button>
        </div>
      </div>
      <div class="panel-body">
        <div *ngIf="state === 'loading'" class="panel-loading">
          <div class="kpi-grid">
            <div class="kpi-card kpi-skeleton" *ngFor="let _ of [1,2,3]">
              <div class="skeleton-value"></div>
              <div class="skeleton-label"></div>
            </div>
          </div>
        </div>
        <div *ngIf="state === 'error'" class="panel-error">
          <lucide-icon name="alert-circle" [size]="40" class="error-icon"></lucide-icon>
          <p class="error-text">Не удалось загрузить статистику. Попробуйте позже.</p>
          <button class="retry-btn" (click)="loadData()">
            <lucide-icon name="refresh-cw" [size]="14"></lucide-icon>
            Повторить
          </button>
        </div>
        <div *ngIf="state === 'empty'" class="panel-empty">
          <div class="kpi-grid">
            <div class="kpi-card kpi-zero"><span class="kpi-value">0</span><span class="kpi-label">Показов</span></div>
            <div class="kpi-card kpi-zero"><span class="kpi-value">0</span><span class="kpi-label">Срабатываний</span></div>
            <div class="kpi-card kpi-zero"><span class="kpi-value">0%</span><span class="kpi-label">Конверсия</span></div>
          </div>
          <p class="empty-text">Нет данных за выбранный период</p>
        </div>
        <div *ngIf="state === 'normal' && data" class="panel-data">
          <div class="kpi-grid">
            <div class="kpi-card"><span class="kpi-value">{{ data.shows }}</span><span class="kpi-label">Показов</span></div>
            <div class="kpi-card"><span class="kpi-value">{{ data.conversions }}</span><span class="kpi-label">Срабатываний</span></div>
            <div class="kpi-card"><span class="kpi-value">{{ data.conversionPercent }}%</span><span class="kpi-label">Конверсия</span></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .panel-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.25); z-index: 50; animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .report-panel { position: absolute; top: 0; right: 0; bottom: 0; width: 100%; max-width: 720px; background: #fff; z-index: 51; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.12); transform: translateX(100%); }
    .panel-open { transform: translateX(0); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
    .panel-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #e0e0e0; flex-shrink: 0; }
    .panel-back-btn, .panel-close-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; border-radius: 50%; background: transparent; color: #616161; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
    .panel-back-btn:hover, .panel-close-btn:hover { background: #f5f5f5; color: #212121; }
    .panel-title { flex: 1; font-size: 18px; font-weight: 500; color: #212121; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .panel-filter { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid #eeeeee; flex-shrink: 0; }
    .filter-label { font-size: 13px; font-weight: 500; color: #757575; }
    .period-toggle { display: flex; gap: 0; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
    .period-btn { padding: 6px 16px; border: none; background: #fff; color: #616161; font-size: 13px; font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s; }
    .period-btn + .period-btn { border-left: 1px solid #e0e0e0; }
    .period-btn:hover { background: #f5f5f5; }
    .period-active { background: #1976d2; color: #fff; }
    .period-active:hover { background: #1565c0; }
    .panel-body { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .kpi-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; display: flex; flex-direction: column; gap: 8px; transition: box-shadow 0.2s; }
    .kpi-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .kpi-value { font-size: 32px; font-weight: 700; color: #212121; line-height: 1; }
    .kpi-label { font-size: 13px; font-weight: 500; color: #757575; text-transform: uppercase; letter-spacing: 0.3px; }
    .kpi-zero .kpi-value { color: #bdbdbd; }
    .kpi-skeleton { pointer-events: none; }
    .skeleton-value { width: 80px; height: 36px; background: #eeeeee; border-radius: 4px; margin: 0 auto; animation: pulse 1.5s infinite; }
    .skeleton-label { width: 100px; height: 14px; background: #eeeeee; border-radius: 4px; margin: 4px auto 0; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .panel-error { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 40px 20px; }
    .error-icon { color: #e53935; }
    .error-text { font-size: 14px; color: #616161; margin: 0; max-width: 320px; }
    .retry-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #e0e0e0; border-radius: 4px; background: #fff; color: #1976d2; font-size: 13px; font-family: Roboto, sans-serif; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .retry-btn:hover { background: #e3f2fd; border-color: #1976d2; }
    .panel-empty { flex: 1; display: flex; flex-direction: column; gap: 16px; }
    .empty-text { text-align: center; font-size: 14px; color: #9e9e9e; margin: 8px 0 0; }
  `],
})
export class HintReportPanelComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Input() hint: Hint | null = null;
  @Output() close = new EventEmitter<void>();

  state: 'loading' | 'normal' | 'empty' | 'error' = 'loading';
  selectedPeriod: 'week' | 'month' = 'week';
  data: ReportData | null = null;
  private loadTimer: any;

  ngOnInit(): void { if (this.open) this.loadData(); }
  ngOnChanges(changes: SimpleChanges): void { if (changes['open'] && this.open) { this.selectedPeriod = 'week'; this.loadData(); } }
  @HostListener('document:keydown.escape', ['$event']) onEscape(): void { if (this.open) this.closePanel(); }
  onPeriodChange(period: 'week' | 'month'): void { if (this.selectedPeriod === period) return; this.selectedPeriod = period; this.loadData(); }
  loadData(): void {
    this.state = 'loading'; this.data = null;
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => {
      if (!this.hint) { this.state = 'error'; return; }
      if (Math.random() < 0.05) { this.state = 'error'; return; }
      const report = generateReportData(this.hint.id, this.selectedPeriod);
      if (report.shows === 0) { this.data = { shows: 0, conversions: 0, conversionPercent: 0 }; this.state = 'empty'; }
      else { this.data = report; this.state = 'normal'; }
    }, 600);
  }
  closePanel(): void { this.close.emit(); }
}

function generateReportData(hintId: number, period: 'week' | 'month'): ReportData {
  const seed = (hintId * 7 + 3) % 100;
  const baseShows = 120 + seed;
  const baseConversions = Math.round(baseShows * (0.25 + (seed % 30) / 100));
  const multiplier = period === 'week' ? 1 : 4.2;
  const shows = Math.round(baseShows * multiplier);
  const conversions = Math.round(baseConversions * multiplier);
  const conversionPercent = shows > 0 ? Math.round((conversions / shows) * 1000) / 10 : 0;
  return { shows, conversions, conversionPercent };
}
