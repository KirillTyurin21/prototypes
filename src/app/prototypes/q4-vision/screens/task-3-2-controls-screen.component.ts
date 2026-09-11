import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4TaskHeaderComponent } from '../components/q4-task-header.component';
import { THEME_CONTROLS } from '../data/mock-data';
import { Q4Control } from '../types';

@Component({
  selector: 'app-task-3-2-controls-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4TaskHeaderComponent],
  template: `
    <div class="t-container">
      <app-q4-task-header
        goal="3"
        taskKey="3.2"
        title="Отказ от справочника контролов"
        [jira]="['DS-1340', 'PB-7203']"
        [changes]="[
          'Сейчас: три справочника «Контролы» в навигации (CS, Arrivals, Kiosk) пугают пользователей; превью — только по клику',
          'Будет: контролы управляются внутри темы — список с превью в области, создание копии из темы, редактирование. Справочник убран из навигации, скрыт за флагом для партнёров'
        ]"
      ></app-q4-task-header>

      <!-- Card 1: навигация без «Контролы» -->
      <div class="t-card">
        <div class="t-card-head">
          <span class="t-card-title">Навигация продукта</span>
        </div>
        <div class="t-nav-row">
          <div class="t-nav-col">
            <div class="t-nav-caption">Сейчас</div>
            <div class="t-nav-item">Экраны</div>
            <div class="t-nav-item">Темы</div>
            <div class="t-nav-item t-nav-removed">Контролы <span class="t-nav-removed-tag">убираем</span></div>
            <div class="t-nav-item">Терминалы</div>
          </div>
          <div class="t-nav-arrow">
            <lucide-icon name="arrow-right" [size]="20"></lucide-icon>
          </div>
          <div class="t-nav-col">
            <div class="t-nav-caption">Будет</div>
            <div class="t-nav-item">Экраны</div>
            <div class="t-nav-item">Темы</div>
            <div class="t-nav-item">Терминалы</div>
            <div class="t-nav-hidden">
              <lucide-icon name="eye-off" [size]="14"></lucide-icon>
              Контролы — скрытый раздел за флагом (для партнёров)
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: конструктор, область контроля -->
      <div class="t-card t-card-mt">
        <div class="t-card-head">
          <span class="t-crumb">Конструктор темы /</span>
          <span class="t-card-title">Область контроля</span>
        </div>

        <div class="t-body">
          <div class="t-list-head">
            <span class="t-list-hint">Контролы темы с превью</span>
            <button class="t-btn t-btn-primary" (click)="createOpen = true">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              Создать контрол
            </button>
          </div>

          <div class="t-ctrl-row" *ngFor="let c of controls">
            <div class="t-ctrl-preview" [style.background]="c.preview"></div>
            <div class="t-ctrl-main">
              <div class="t-ctrl-name">{{ c.name }}</div>
              <div class="t-ctrl-meta">Источник: {{ c.source }}</div>
            </div>
            <button class="t-icon-btn" (click)="editControl(c)" aria-label="Редактировать контрол">
              <lucide-icon name="pencil" [size]="16"></lucide-icon>
            </button>
          </div>

          <div class="t-note">
            <lucide-icon name="info" [size]="15"></lucide-icon>
            Редактирование контрола из темы уже почти готово. Первая версия создания — копия стандартного или существующего контрола; создание «с нуля» — открытый вопрос.
          </div>
        </div>
      </div>

      <!-- Modal: создать контрол -->
      <div class="t-overlay" *ngIf="createOpen">
        <div class="t-modal">
          <div class="t-modal-head">
            <span class="t-modal-title">Создать контрол</span>
            <button class="t-icon-btn" (click)="createOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="t-modal-body">
            <label class="t-field">
              <span class="t-field-caption">База для контрола</span>
              <select class="t-input" #baseSelect>
                <option value="std">Стандартный: Контрол «Чек»</option>
                <option value="copy">Копия существующего: Контрол «Акция дня»</option>
              </select>
            </label>
            <label class="t-field">
              <span class="t-field-caption">Имя нового контрола</span>
              <input class="t-input" type="text" placeholder="Например, «Чек (копия)»" #ctrlName />
            </label>
          </div>
          <div class="t-modal-foot">
            <button class="t-btn" (click)="createOpen = false">Отмена</button>
            <button class="t-btn t-btn-primary" (click)="createControl(baseSelect.value, ctrlName.value)">Создать</button>
          </div>
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
      .t-container { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: Roboto, sans-serif; }
      .t-card {
        background: var(--dt-surface-primary);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-sl);
      }
      .t-card-mt { margin-top: 16px; }
      .t-card-head { display: flex; align-items: baseline; gap: 6px; padding: 14px 20px 0; flex-wrap: wrap; }
      .t-crumb { font-size: 12px; color: var(--dt-text-disable); }
      .t-card-title { font-size: 16px; font-weight: 500; color: var(--dt-text-primary); }

      .t-nav-row { display: flex; align-items: stretch; gap: 20px; padding: 14px 20px 20px; }
      .t-nav-col { flex: 1; border: 1px solid var(--dt-stroke-default); border-radius: 4px; padding: 10px; }
      .t-nav-caption { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--dt-text-disable); margin-bottom: 8px; }
      .t-nav-item { font-size: 13px; color: var(--dt-text-primary); padding: 7px 10px; border-radius: 3px; }
      .t-nav-item:hover { background: var(--dt-surface-hover); }
      .t-nav-removed { color: var(--dt-text-disable); text-decoration: line-through; }
      .t-nav-removed-tag { text-decoration: none; font-size: 10px; color: #EA7806; background: #FFF9F0; border-radius: 3px; padding: 2px 6px; margin-left: 6px; }
      .t-nav-hidden { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--dt-text-secondary); padding: 7px 10px; border: 1px dashed var(--dt-stroke-default); border-radius: 3px; margin-top: 6px; }
      .t-nav-arrow { display: flex; align-items: center; color: var(--dt-icon-disable); }

      .t-body { padding: 14px 20px 20px; }
      .t-list-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .t-list-hint { font-size: 12px; color: var(--dt-text-secondary); }
      .t-btn {
        display: inline-flex; align-items: center; gap: 6px;
        height: 36px; padding: 0 16px;
        border-radius: 4px;
        font-size: 13px; font-weight: 500;
        border: 1px solid var(--dt-stroke-default);
        background: var(--dt-surface-primary);
        color: var(--dt-text-primary);
        cursor: pointer;
        font-family: Roboto, sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.2px;
      }
      .t-btn:hover { background: #FAFAFA; }
      .t-btn-primary { background: #448AFF; border-color: #448AFF; color: #FFFFFF; }
      .t-btn-primary:hover { background: #3969D5; }
      .t-icon-btn {
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
        border: none; background: transparent; border-radius: 4px;
        color: var(--dt-icon-primary); cursor: pointer;
      }
      .t-icon-btn:hover { background: #EBEBEB; }

      .t-ctrl-row {
        display: flex; align-items: center; gap: 12px;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 10px 14px;
        margin-bottom: 8px;
      }
      .t-ctrl-preview { width: 44px; height: 44px; border-radius: 4px; flex-shrink: 0; box-shadow: var(--dt-shadow-sl); }
      .t-ctrl-main { flex: 1; min-width: 0; }
      .t-ctrl-name { font-size: 13px; font-weight: 500; color: var(--dt-text-primary); }
      .t-ctrl-meta { font-size: 12px; color: var(--dt-text-secondary); margin-top: 2px; }

      .t-note {
        margin-top: 14px;
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px; padding: 10px 12px;
      }

      .t-overlay {
        position: fixed; inset: 0;
        background: rgba(33, 33, 33, 0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 200;
      }
      .t-modal {
        width: 460px; max-width: calc(100vw - 32px);
        background: var(--dt-surface-primary);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-xl);
      }
      .t-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--dt-stroke-default); }
      .t-modal-title { font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
      .t-modal-body { padding: 14px 20px; }
      .t-field { display: block; margin-bottom: 14px; }
      .t-field-caption { display: block; font-size: 12px; color: var(--dt-text-secondary); margin-bottom: 6px; }
      .t-input {
        width: 100%;
        height: 36px;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 0 12px;
        font-size: 13px;
        font-family: Roboto, sans-serif;
        color: var(--dt-text-primary);
        outline: none;
        background: var(--dt-surface-primary);
      }
      .t-input:focus { border-color: var(--dt-brand-accent); }
      .t-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--dt-stroke-default); }

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
export class Task32ControlsScreenComponent {
  controls: Q4Control[] = THEME_CONTROLS.map(c => ({ ...c }));
  createOpen = false;
  snack = '';

  editControl(c: Q4Control): void {
    this.snack = `Редактирование «${c.name}» из темы (готовое решение)`;
    setTimeout(() => (this.snack = ''), 2200);
  }

  createControl(base: string, name: string): void {
    const n = (name || '').trim() || 'Новый контрол (Copy)';
    const src = base === 'std' ? 'Стандартный' : 'Копия';
    const color = base === 'std' ? '#448AFF' : '#FFAB40';
    this.controls.push({
      id: this.controls.length + 1,
      name: n,
      source: src,
      preview: color,
    });
    this.createOpen = false;
    this.snack = `Контрол «${n}» создан в теме`;
    setTimeout(() => (this.snack = ''), 2200);
  }
}
