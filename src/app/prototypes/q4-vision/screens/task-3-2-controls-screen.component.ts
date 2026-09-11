import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import { THEME_CONTROLS } from '../data/mock-data';
import { Q4_COMMON_STYLES } from '../data/q4-common.styles';
import { Q4Control } from '../types';

@Component({
  selector: 'app-task-3-2-controls-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="c-container">
      <app-q4-crumbs [items]="crumbs"></app-q4-crumbs>

      <div class="q4-note">
        <lucide-icon name="info" [size]="15"></lucide-icon>
        <span>
          Целевое решение 3.2 (DS-1340 · PB-7203): контролы управляются внутри темы — список с превью в области, создание копии из темы,
          редактирование. Справочники «Контролы» убраны из навигации трёх продуктов, скрытый доступ — за флагом для партнёров.
        </span>
      </div>

      <!-- Card 1: навигация -->
      <div class="c-card">
        <div class="c-card-head">
          <span class="c-card-title">Навигация продукта «Экран покупателя»</span>
        </div>
        <div class="c-nav-row">
          <div class="c-nav-col">
            <div class="c-nav-caption">Сейчас</div>
            <div class="c-nav-item">Дисплеи</div>
            <div class="c-nav-item c-nav-removed">
              Контролы
              <span class="c-nav-removed-tag">убираем</span>
            </div>
            <div class="c-nav-item">Темы</div>
          </div>
          <div class="c-nav-arrow">
            <lucide-icon name="arrow-right" [size]="20"></lucide-icon>
          </div>
          <div class="c-nav-col">
            <div class="c-nav-caption">Будет</div>
            <div class="c-nav-item">Дисплеи</div>
            <div class="c-nav-item">Темы</div>
            <div class="c-nav-hidden">
              <lucide-icon name="eye-off" [size]="14"></lucide-icon>
              Контролы — скрытый раздел за флагом (для партнёров)
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: область контроля -->
      <div class="c-card c-card-mt">
        <div class="c-card-head">
          <span class="c-card-title">Конструктор темы — область контроля</span>
        </div>

        <div class="c-editor">
          <!-- Превью области -->
          <div class="c-area-preview">
            <div class="c-area-preview-caption">Область контроля на канвасе</div>
            <div class="c-area-canvas">
              <div class="c-area-block" *ngFor="let b of areaBlocks" [style.background]="selectedControl?.preview">
                {{ b }}
              </div>
              <div class="c-area-empty" *ngIf="!selectedControl">Контрол не выбран</div>
            </div>
          </div>

          <!-- Панель области -->
          <div class="c-panel">
            <div class="c-panel-field">
              <span class="c-panel-label">Контрол</span>
              <div class="c-panel-select-row">
                <select class="c-panel-select" [value]="selectedControl?.id" (change)="selectControl(+$any($event.target).value)">
                  <option *ngFor="let c of controls" [value]="c.id">{{ c.name }}</option>
                </select>
                <button class="q4-btn q4-btn-outline q4-btn-sm" (click)="editControl()">
                  <lucide-icon name="pencil" [size]="14"></lucide-icon>
                  Редактировать контрол
                </button>
              </div>
            </div>

            <div class="c-panel-divider"></div>
            <div class="c-panel-section-title">Контролы темы</div>

            <div class="c-ctrl-row" *ngFor="let c of controls" [class.active]="selectedControl?.id === c.id" (click)="selectedControl = c">
              <div class="c-ctrl-preview">
                <div class="c-ctrl-preview-block" [style.background]="c.preview"></div>
                <div class="c-ctrl-preview-block" [style.background]="c.preview" [style.opacity]="0.6"></div>
              </div>
              <div class="c-ctrl-main">
                <div class="c-ctrl-name">{{ c.name }}</div>
                <div class="c-ctrl-meta">Источник: {{ c.source }}</div>
              </div>
              <button class="q4-icon-btn" (click)="editControl(c); $event.stopPropagation()" aria-label="Редактировать контрол">
                <lucide-icon name="pencil" [size]="16"></lucide-icon>
              </button>
            </div>

            <button class="c-create-ctrl" (click)="createOpen = true">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              Создать контрол
            </button>
          </div>
        </div>

        <div class="q4-note c-note-inside">
          <lucide-icon name="info" [size]="15"></lucide-icon>
          Редактирование контрола из темы уже почти готово. Первая версия создания — копия стандартного или существующего контрола; создание «с нуля» — открытый вопрос.
        </div>
      </div>

      <!-- Диалог: создать контрол -->
      <div class="q4-overlay" *ngIf="createOpen" (click)="createOpen = false">
        <div class="q4-dialog" (click)="$event.stopPropagation()">
          <div class="q4-dialog-head">
            <span class="q4-dialog-head-title">Создать контрол</span>
            <button class="q4-icon-btn" (click)="createOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="q4-dialog-body">
            <div class="c-dlg-field">
              <span class="c-dlg-caption">База для контрола</span>
              <select class="c-panel-select c-full" [value]="baseControl" (change)="onBaseChange($any($event.target).value)">
                <option value="std">Стандартный: Контрол «Чек»</option>
                <option value="copy">Копия существующего: Контрол «Акция дня»</option>
              </select>
            </div>
            <div class="c-dlg-field">
              <span class="c-dlg-caption">Имя нового контрола</span>
              <div class="q4-mdc-field c-full" [class.has-value]="newCtrlName">
                <input class="q4-mdc-input" [value]="newCtrlName" (input)="newCtrlName = $any($event.target).value" placeholder="Например, «Контрол «Чек» (копия)»" />
                <label class="q4-mdc-label">Имя нового контрола</label>
              </div>
            </div>
          </div>
          <div class="q4-dialog-foot">
            <button class="q4-btn q4-btn-outline" (click)="createOpen = false">Отмена</button>
            <button class="q4-btn q4-btn-primary" [disabled]="!newCtrlName.trim()" (click)="createControl()">Создать</button>
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

      .c-card {
        background: #FFFFFF;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,.06);
      }
      .c-card-mt { margin-top: 16px; }
      .c-card-head { display: flex; align-items: baseline; gap: 6px; padding: 14px 20px 0; }
      .c-card-title { font-size: 16px; font-weight: 500; color: #333333; }

      /* Навигация */
      .c-nav-row { display: flex; align-items: stretch; gap: 20px; padding: 14px 20px 20px; }
      .c-nav-col { flex: 1; border: 1px solid #E0E0E0; border-radius: 4px; padding: 10px; }
      .c-nav-caption { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: #9E9E9E; margin-bottom: 8px; }
      .c-nav-item { font-size: 13px; color: #333333; padding: 7px 10px; border-radius: 3px; }
      .c-nav-item:hover { background: #F5F5F5; }
      .c-nav-removed { color: #9E9E9E; text-decoration: line-through; }
      .c-nav-removed-tag { text-decoration: none; font-size: 10px; color: #EA7806; background: #FFF9F0; border-radius: 3px; padding: 2px 6px; margin-left: 6px; }
      .c-nav-hidden { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #616161; padding: 7px 10px; border: 1px dashed #E0E0E0; border-radius: 3px; margin-top: 6px; }
      .c-nav-arrow { display: flex; align-items: center; color: #BDBDBD; }

      /* Область контроля */
      .c-editor { display: flex; gap: 0; padding: 14px 20px 0; }
      .c-area-preview { flex: 1; min-width: 0; border-right: 1px solid #E0E0E0; padding-right: 16px; }
      .c-area-preview-caption { font-size: 11px; color: #616161; margin-bottom: 8px; }
      .c-area-canvas {
        background-color: #E8E8E8;
        background-image: linear-gradient(45deg, #D6D6D6 1px, transparent 1px), linear-gradient(-45deg, #D6D6D6 1px, transparent 1px);
        background-size: 20px 20px;
        border-radius: 4px;
        min-height: 260px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
      }
      .c-area-block { height: 36px; border-radius: 4px; opacity: 0.85; }
      .c-area-empty { font-size: 12px; color: #9E9E9E; text-align: center; padding: 40px 0; }

      .c-panel { width: 360px; flex-shrink: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 10px; }
      .c-panel-field { display: flex; flex-direction: column; gap: 6px; }
      .c-panel-label { font-size: 11px; color: #9E9E9E; }
      .c-panel-select-row { display: flex; gap: 8px; }
      .c-panel-select {
        flex: 1;
        height: 34px;
        border: 1px solid rgba(0,0,0,.23);
        border-radius: 4px;
        padding: 0 8px;
        font-size: 13px; font-family: Roboto, sans-serif;
        color: #333333;
        background: #FFFFFF;
        outline: none;
        min-width: 0;
      }
      .c-full { width: 100%; }
      .c-panel-divider { border-top: 1px solid #E0E0E0; margin: 2px 0; }
      .c-panel-section-title { font-size: 12px; font-weight: 500; color: #424242; }

      .c-ctrl-row {
        display: flex; align-items: center; gap: 12px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        padding: 10px 12px;
        cursor: pointer;
      }
      .c-ctrl-row:hover { background: #F5F5F5; }
      .c-ctrl-row.active { border-color: #448AFF; background: #F0F5FF; }
      .c-ctrl-preview {
        width: 44px; height: 44px;
        border-radius: 4px;
        background: #E8E8E8;
        display: flex; flex-direction: column; gap: 3px;
        padding: 6px;
        flex-shrink: 0;
      }
      .c-ctrl-preview-block { height: 10px; border-radius: 2px; }
      .c-ctrl-main { flex: 1; min-width: 0; }
      .c-ctrl-name { font-size: 13px; font-weight: 500; color: #333333; }
      .c-ctrl-meta { font-size: 12px; color: #616161; margin-top: 2px; }

      .c-create-ctrl {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        height: 36px;
        border: none; border-radius: 4px;
        background: #448AFF;
        color: #FFFFFF;
        font-size: 13px; font-weight: 500;
        font-family: Roboto, sans-serif;
        text-transform: uppercase;
        cursor: pointer;
      }
      .c-create-ctrl:hover { background: #3969D5; }

      .c-note-inside { margin: 14px 20px 20px; }

      .c-dlg-field { margin-bottom: 14px; }
      .c-dlg-caption { display: block; font-size: 12px; color: #616161; margin-bottom: 6px; }
    `,
  ],
})
export class Task32ControlsScreenComponent {
  controls: Q4Control[] = THEME_CONTROLS.map(c => ({ ...c }));
  selectedControl: Q4Control = this.controls[0];

  createOpen = false;
  baseControl = 'std';
  newCtrlName = 'Контрол «Чек» (копия)';
  snack = '';

  areaBlocks = ['Строка заказа 1', 'Строка заказа 2', 'Итого'];

  crumbs = [
    { label: 'Экраны и звуки' },
    { label: 'Экран покупателя' },
    { label: 'Конструктор темы — Контролы' },
  ];

  selectControl(id: number): void {
    const c = this.controls.find(x => x.id === id);
    if (c) this.selectedControl = c;
  }

  editControl(c?: Q4Control): void {
    const target = c || this.selectedControl;
    this.snack = `Редактирование «${target.name}» из темы (готовое решение)`;
    setTimeout(() => (this.snack = ''), 2500);
  }

  onBaseChange(value: string): void {
    this.baseControl = value;
    this.newCtrlName = value === 'std' ? 'Контрол «Чек» (копия)' : 'Контрол «Акция дня» (копия)';
  }

  createControl(): void {
    const n = (this.newCtrlName || '').trim() || 'Новый контрол (Copy)';
    const src = this.baseControl === 'std' ? 'Стандартный' : 'Копия';
    const color = this.baseControl === 'std' ? '#448AFF' : '#FFAB40';
    const created: Q4Control = {
      id: this.controls.length + 1,
      name: n,
      source: src,
      preview: color,
    };
    this.controls.push(created);
    this.selectedControl = created;
    this.createOpen = false;
    this.snack = `Контрол «${n}» создан в теме`;
    setTimeout(() => (this.snack = ''), 2500);
  }
}
