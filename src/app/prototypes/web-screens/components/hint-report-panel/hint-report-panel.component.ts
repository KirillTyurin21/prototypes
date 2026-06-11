import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { Hint } from '../../cs-types';

interface HintRowData {
  hintId: number;
  hintName: string;
  shows: number;
  sales: number;
  conversion: number;
}

type Period = 'day' | 'week' | 'month';

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
        <h2 class="panel-title">Отчет по подсказкам</h2>
        <button class="panel-close-btn" (click)="closePanel()" title="Закрыть">
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>
      <div class="panel-filter">
        <label class="filter-label">Период</label>
        <div class="period-toggle">
          <button class="period-btn" [class.period-active]="selectedPeriod === 'day'" (click)="onPeriodChange('day')">День</button>
          <button class="period-btn" [class.period-active]="selectedPeriod === 'week'" (click)="onPeriodChange('week')">Неделя</button>
          <button class="period-btn" [class.period-active]="selectedPeriod === 'month'" (click)="onPeriodChange('month')">Месяц</button>
        </div>
      </div>
      <div class="panel-body">
        <!-- Loading -->
        <div *ngIf="state === 'loading'" class="panel-loading">
          <div class="skeleton-chart"></div>
          <div class="skeleton-table">
            <div class="skeleton-row" *ngFor="let _ of [1,2,3,4,5]"><div class="skeleton-cell"></div></div>
          </div>
        </div>
        <!-- Error -->
        <div *ngIf="state === 'error'" class="panel-error">
          <lucide-icon name="alert-circle" [size]="40" class="error-icon"></lucide-icon>
          <p class="error-text">Не удалось загрузить статистику. Попробуйте позже.</p>
          <button class="retry-btn" (click)="loadData()">
            <lucide-icon name="refresh-cw" [size]="14"></lucide-icon>
            Повторить
          </button>
        </div>
        <!-- Empty -->
        <div *ngIf="state === 'empty'" class="panel-empty">
          <p class="empty-text">Нет данных за выбранный период</p>
        </div>
        <!-- Normal -->
        <div *ngIf="state === 'normal' && rows.length" class="panel-data">
          <!-- Totals -->
          <div class="kpi-grid">
            <div class="kpi-card"><span class="kpi-value">{{ totalShows }}</span><span class="kpi-label">Срабатывание</span></div>
            <div class="kpi-card"><span class="kpi-value">{{ totalSales }}</span><span class="kpi-label">Продаж</span></div>
            <div class="kpi-card"><span class="kpi-value">{{ totalConversion }}%</span><span class="kpi-label">Конверсия</span></div>
          </div>
          <!-- Pie chart -->
          <div class="chart-section">
            <div class="pie-chart-container">
              <svg viewBox="0 0 200 200" class="pie-chart">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#f0f0f0" stroke-width="30"/>
                <circle
                  *ngFor="let seg of pieSegments; trackBy: segTrackBy; let i = index"
                  cx="100" cy="100" r="85"
                  fill="none"
                  [attr.stroke]="seg.color"
                  stroke-width="30"
                  [attr.stroke-dasharray]="seg.dashArray"
                  [attr.stroke-dashoffset]="seg.dashOffset"
                  [attr.transform]="'rotate(-90 100 100)'"
                />
                <text x="100" y="105" text-anchor="middle" class="pie-center-text">{{ rows.length }} подсказок</text>
              </svg>
            </div>
            <div class="pie-legend">
              <div *ngFor="let seg of pieSegments; trackBy: segTrackBy" class="legend-item">
                <span class="legend-dot" [style.background]="seg.color"></span>
                <span class="legend-name">{{ seg.name }}</span>
                <span class="legend-pct">{{ seg.percent }}%</span>
              </div>
            </div>
          </div>
          <!-- Table -->
          <div class="dashboard-table">
            <div class="dash-table-header">
              <span class="dth-name">Название подсказки</span>
              <span class="dth-val">Срабатывание</span>
              <span class="dth-val">Продаж</span>
              <span class="dth-val">Конверсия</span>
            </div>
            <div class="dash-table-body">
              <div *ngFor="let row of rows; let odd = odd" class="dash-table-row" [class.dtr-odd]="odd">
                <span class="dtr-name">{{ row.hintName }}</span>
                <span class="dtr-val">{{ row.shows }}</span>
                <span class="dtr-val">{{ row.sales }}</span>
                <span class="dtr-val">{{ row.conversion }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .panel-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.25); z-index: 50; animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .report-panel { position: absolute; top: 0; right: 0; bottom: 0; width: 100%; max-width: 780px; background: #fff; z-index: 51; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.12); transform: translateX(100%); }
    .panel-open { transform: translateX(0); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
    .panel-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #e0e0e0; flex-shrink: 0; }
    .panel-back-btn, .panel-close-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; border-radius: 50%; background: transparent; color: #616161; cursor: pointer; flex-shrink: 0; transition: background 0.15s; }
    .panel-back-btn:hover, .panel-close-btn:hover { background: #f5f5f5; color: #212121; }
    .panel-title { flex: 1; font-size: 18px; font-weight: 500; color: #212121; margin: 0; }
    .panel-filter { display: flex; align-items: center; gap: 16px; padding: 12px 20px; border-bottom: 1px solid #eeeeee; flex-shrink: 0; }
    .filter-label { font-size: 13px; font-weight: 500; color: #757575; }
    .period-toggle { display: flex; gap: 0; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
    .period-btn { padding: 6px 16px; border: none; background: #fff; color: #616161; font-size: 13px; font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s; }
    .period-btn + .period-btn { border-left: 1px solid #e0e0e0; }
    .period-btn:hover { background: #f5f5f5; }
    .period-active { background: #1976d2; color: #fff; }
    .period-active:hover { background: #1565c0; }
    .panel-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
    .panel-data { display: flex; flex-direction: column; gap: 20px; }
    /* KPI */
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .kpi-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; text-align: center; display: flex; flex-direction: column; gap: 6px; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #212121; line-height: 1; }
    .kpi-label { font-size: 12px; font-weight: 500; color: #757575; text-transform: uppercase; letter-spacing: 0.3px; }
    /* Chart */
    .chart-section { display: flex; gap: 24px; align-items: center; }
    .pie-chart-container { flex-shrink: 0; width: 180px; height: 180px; }
    .pie-chart { width: 100%; height: 100%; }
    .pie-center-text { font-size: 11px; fill: #9e9e9e; font-family: Roboto, sans-serif; font-weight: 500; }
    .pie-legend { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-name { flex: 1; color: #424242; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .legend-pct { color: #757575; font-weight: 500; flex-shrink: 0; }
    /* Table */
    .dashboard-table { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
    .dash-table-header { display: grid; grid-template-columns: 1fr 110px 90px 90px; gap: 0; background: #fafafa; border-bottom: 1px solid #e0e0e0; }
    .dash-table-header span { padding: 10px 12px; font-size: 12px; font-weight: 500; color: #757575; }
    .dash-table-body { max-height: 360px; overflow-y: auto; }
    .dash-table-row { display: grid; grid-template-columns: 1fr 110px 90px 90px; gap: 0; border-bottom: 1px solid #f5f5f5; transition: background 0.1s; }
    .dash-table-row:last-child { border-bottom: none; }
    .dash-table-row:hover { background: #f5f5f5; }
    .dtr-odd { background: #fafafa; }
    .dtr-odd:hover { background: #f0f0f0; }
    .dtr-name, .dtr-val { padding: 9px 12px; font-size: 13px; color: #333; }
    .dtr-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dtr-val { text-align: right; }
    /* Loading */
    .panel-loading { display: flex; flex-direction: column; gap: 20px; }
    .skeleton-chart { width: 180px; height: 180px; border-radius: 50%; background: #eeeeee; margin: 0 auto; animation: pulse 1.5s infinite; }
    .skeleton-table { display: flex; flex-direction: column; gap: 6px; }
    .skeleton-row { display: flex; gap: 12px; }
    .skeleton-cell { flex: 1; height: 36px; background: #eeeeee; border-radius: 4px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    /* Error */
    .panel-error { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; padding: 40px 20px; }
    .error-icon { color: #e53935; }
    .error-text { font-size: 14px; color: #616161; margin: 0; max-width: 320px; }
    .retry-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid #e0e0e0; border-radius: 4px; background: #fff; color: #1976d2; font-size: 13px; font-family: Roboto, sans-serif; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .retry-btn:hover { background: #e3f2fd; border-color: #1976d2; }
    /* Empty */
    .panel-empty { flex: 1; display: flex; align-items: center; justify-content: center; }
    .empty-text { font-size: 14px; color: #9e9e9e; margin: 0; }
  `],
})
export class HintReportPanelComponent implements OnChanges {
  @Input() open = false;
  @Input() hints: Hint[] = [];
  @Output() close = new EventEmitter<void>();

  state: 'loading' | 'normal' | 'empty' | 'error' = 'loading';
  selectedPeriod: Period = 'week';
  rows: HintRowData[] = [];
  pieSegments: { name: string; percent: number; color: string; dashArray: string; dashOffset: string }[] = [];
  private loadTimer: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.selectedPeriod = 'week';
      this.loadData();
    }
  }

  @HostListener('document:keydown.escape', ['$event']) onEscape(): void {
    if (this.open) this.closePanel();
  }

  onPeriodChange(period: Period): void {
    if (this.selectedPeriod === period) return;
    this.selectedPeriod = period;
    this.loadData();
  }

  loadData(): void {
    this.state = 'loading';
    this.rows = [];
    this.pieSegments = [];
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => {
      if (!this.hints || this.hints.length === 0) {
        this.state = 'empty';
        return;
      }
      if (Math.random() < 0.05) {
        this.state = 'error';
        return;
      }
      const multiplier = this.selectedPeriod === 'day' ? 0.14 : this.selectedPeriod === 'week' ? 1 : 4.2;
      this.rows = generateAllRows(this.hints, multiplier);
      const totalShows = this.rows.reduce((s, r) => s + r.shows, 0);
      if (totalShows === 0) {
        this.state = 'empty';
        return;
      }
      this.buildPieSegments(totalShows);
      this.state = 'normal';
    }, 600);
  }

  private buildPieSegments(totalShows: number): void {
    const colors = ['#1976d2', '#ff8f00', '#388e3c', '#d32f2f', '#7b1fa2', '#00838f', '#c2185b', '#5d4037', '#558b2f', '#f57c00'];
    const circumference = 2 * Math.PI * 85; // r=85
    let offset = 0;
    this.pieSegments = this.rows.map((row, i) => {
      const percent = totalShows > 0 ? Math.round((row.shows / totalShows) * 1000) / 10 : 0;
      const length = (percent / 100) * circumference;
      const seg = {
        name: row.hintName,
        percent,
        color: colors[i % colors.length],
        dashArray: length + ' ' + (circumference - length),
        dashOffset: (-offset / 100) * circumference + '',
      };
      offset += percent;
      return seg;
    });
  }

  get totalShows(): number { return this.rows.reduce((s, r) => s + r.shows, 0); }
  get totalSales(): number { return this.rows.reduce((s, r) => s + r.sales, 0); }
  get totalConversion(): number {
    const s = this.totalShows;
    const p = this.totalSales;
    return s > 0 ? Math.round((p / s) * 1000) / 10 : 0;
  }

  segTrackBy(index: number, seg: { name: string; percent: number }): string { return seg.name; }
  closePanel(): void { this.close.emit(); }
}

function generateAllRows(hints: Hint[], multiplier: number): HintRowData[] {
  return hints.map(hint => {
    const seed = (hint.id * 7 + 3) % 100;
    const baseShows = 120 + seed;
    const baseSales = Math.round(baseShows * (0.25 + (seed % 30) / 100));
    const shows = Math.round(baseShows * multiplier);
    const sales = Math.round(baseSales * multiplier);
    const conversion = shows > 0 ? Math.round((sales / shows) * 1000) / 10 : 0;
    return { hintId: hint.id, hintName: hint.name, shows, sales, conversion };
  });
}
