import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import { HINT_ASSIGNMENTS, Q4_HINTS, Q4_DISHES, Q4_DISCOUNTS } from '../data/mock-data';
import { Q4_COMMON_STYLES } from '../data/q4-common.styles';
import { HintAssignment, Q4Hint } from '../types';

interface WizardHintProduct {
  id: string;
  label: string;
  icon: string;
  modes: string[];
}

const HINT_PRODUCTS: WizardHintProduct[] = [
  { id: 'cs', label: 'Customer Screen', icon: 'monitor', modes: ['Экран покупателя', 'Кассиру'] },
  { id: 'kiosk', label: 'Kiosk', icon: 'monitor-smartphone', modes: ['Карточка подсказки'] },
];

const HINT_TERMINALS: { id: string; label: string; product: string }[] = [
  { id: 't1', label: 'Кофейня на Арбате — касса 1', product: 'cs' },
  { id: 't2', label: 'Кофейня на Арбате — касса 2', product: 'cs' },
  { id: 't4', label: 'Ресторан «Москва-Сити» — киоск 1', product: 'kiosk' },
  { id: 't5', label: 'Ресторан «Москва-Сити» — киоск 2', product: 'kiosk' },
];

@Component({
  selector: 'app-task-2-1-hints-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="c-container">
      <app-q4-crumbs [items]="crumbs"></app-q4-crumbs>

      <!-- ================= СПИСОК ПОДСКАЗОК ================= -->
      <div class="q4-page-header">
        <h1 class="q4-page-title">Подсказки</h1>
        <div class="q4-header-actions">
          <button class="q4-btn q4-btn-outline" (click)="duplicateHint()">
            <lucide-icon name="copy" [size]="16"></lucide-icon>
            Дублировать
          </button>
          <button class="q4-btn q4-btn-outline" (click)="deleteHint()">
            <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            Удалить
          </button>
          <button class="q4-btn q4-btn-primary" (click)="openNew()">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            Добавить
          </button>
          <button class="q4-btn q4-btn-outline" (click)="showSnack('Отчет по подсказкам — отдельная история (срабатывания, не готовность)')">
            <lucide-icon name="bar-chart-3" [size]="16"></lucide-icon>
            Отчет
          </button>
        </div>
      </div>

      <div class="q4-note">
        <lucide-icon name="info" [size]="15"></lucide-icon>
        <span>
          Целевое решение 2.1 (DS-1294 · OUT-1969): подсказка создаётся один раз, назначается на Customer Screen и Kiosk мастером «Где показывать».
          Откройте подсказку <b>«Пирожок дня»</b>.
        </span>
      </div>

      <div class="q4-table-wrap">
        <table class="q4-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Период действия</th>
              <th>Время действия</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let h of hints"
              (click)="selectRow(h)"
              (dblclick)="openEditor(h)"
              [class.c-row-selected]="selectedId === h.id"
              class="c-row-click"
            >
              <td class="c-td-name">{{ h.name }}</td>
              <td>{{ h.from }} — {{ h.to }}</td>
              <td>{{ h.timeFrom }} — {{ h.timeTo }}</td>
              <td>
                <span class="q4-badge" [class]="statusBadge(h.status)">{{ statusLabel(h.status) }}</span>
              </td>
              <td class="q4-actions" (click)="$event.stopPropagation()">
                <button class="q4-icon-btn" (click)="openEditor(h)" aria-label="Редактировать подсказку">
                  <lucide-icon name="pencil" [size]="18"></lucide-icon>
                </button>
                <button class="q4-icon-btn q4-icon-btn-danger" (click)="deleteTarget = h" aria-label="Удалить подсказку">
                  <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ================= DRAWER РЕДАКТОР ================= -->
      <div class="q4-overlay c-drawer-overlay" *ngIf="drawerOpen" (click)="drawerOpen = false">
        <div class="c-drawer" (click)="$event.stopPropagation()">
          <div class="c-drawer-head">
            <span class="c-drawer-title">{{ isNewHint ? 'Добавить подсказку' : 'Редактировать подсказку' }}</span>
            <button class="q4-icon-btn" (click)="drawerOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>

          <div class="c-drawer-tabs">
            <button class="c-drawer-tab" [class.active]="drawerTab === 'base'" (click)="drawerTab = 'base'">Основное</button>
            <button class="c-drawer-tab" [class.active]="drawerTab === 'where'" (click)="drawerTab = 'where'">
              Где показывать
              <span class="c-tab-count" *ngIf="assignments.length > 0">{{ assignments.length }}</span>
            </button>
          </div>

          <div class="c-drawer-body" *ngIf="drawerTab === 'base'">
            <div class="c-section">
              <div class="c-section-title">Основные параметры</div>
              <div class="q4-mdc-field c-full" [class.has-value]="hint.name">
                <input class="q4-mdc-input" [value]="hint.name" (input)="hint.name = $any($event.target).value" />
                <label class="q4-mdc-label">Наименование *</label>
              </div>
              <div class="c-field-grid">
                <div class="q4-mdc-field" [class.has-value]="hint.from">
                  <input class="q4-mdc-input" type="date" [value]="hint.from" (input)="hint.from = $any($event.target).value" />
                  <label class="q4-mdc-label">Дата начала</label>
                </div>
                <div class="q4-mdc-field" [class.has-value]="hint.to">
                  <input class="q4-mdc-input" type="date" [value]="hint.to" (input)="hint.to = $any($event.target).value" />
                  <label class="q4-mdc-label">Дата окончания</label>
                </div>
                <div class="q4-mdc-field" [class.has-value]="true">
                  <input class="q4-mdc-input" type="time" [value]="hint.timeFrom" (input)="hint.timeFrom = $any($event.target).value" />
                  <label class="q4-mdc-label">Время начала</label>
                </div>
                <div class="q4-mdc-field" [class.has-value]="true">
                  <input class="q4-mdc-input" type="time" [value]="hint.timeTo" (input)="hint.timeTo = $any($event.target).value" />
                  <label class="q4-mdc-label">Время окончания</label>
                </div>
              </div>
            </div>

            <div class="c-section">
              <div class="c-section-title">Связка блюд</div>
              <div class="c-link-row">
                <div class="c-link-card">
                  <div class="c-link-card-head">
                    При выборе (триггеры)
                    <span class="c-link-count">{{ triggers.length }}</span>
                  </div>
                  <div class="c-trigger-item" *ngFor="let t of triggers; let i = index">
                    <lucide-icon name="coffee" [size]="14"></lucide-icon>
                    {{ t }}
                    <button class="q4-chip-x" (click)="triggers.splice(i, 1)" aria-label="Удалить триггер">
                      <lucide-icon name="x" [size]="12"></lucide-icon>
                    </button>
                  </div>
                  <div class="c-empty-sm" *ngIf="triggers.length === 0">Нет триггеров</div>
                  <button class="q4-btn q4-btn-outline q4-btn-sm" (click)="pickerMode = 'trigger'; pickerOpen = !pickerOpen">Добавить триггер</button>
                </div>
                <lucide-icon name="arrow-right" [size]="18" class="c-link-arrow"></lucide-icon>
                <div class="c-link-card">
                  <div class="c-link-card-head">Рекомендовать</div>
                  <div class="c-rec-selected" *ngIf="recommendation">{{ recommendation }}</div>
                  <div class="c-empty-sm" *ngIf="!recommendation">Не выбрано</div>
                  <button class="q4-btn q4-btn-outline q4-btn-sm" (click)="pickerMode = 'recommend'; pickerOpen = !pickerOpen">Выбрать блюдо</button>
                </div>
              </div>

              <div class="c-picker" *ngIf="pickerOpen">
                <div class="c-picker-item" *ngFor="let d of dishes" (click)="pickDish(d)">
                  <lucide-icon name="coffee" [size]="14"></lucide-icon>
                  {{ d }}
                </div>
              </div>
            </div>

            <div class="c-section">
              <div class="c-section-title">Слоган рекомендации</div>
              <textarea
                class="c-textarea"
                rows="3"
                placeholder="Не забудьте купить пирожок! При покупке с кофе — скидка 15%"
                [value]="hint.slogan"
                (input)="hint.slogan = $any($event.target).value"
              ></textarea>
            </div>

            <div class="c-section">
              <div class="c-section-title">Скидка</div>
              <div class="c-radio-row">
                <label class="c-radio-item" [class.active]="hint.discountType === 'percent'">
                  <input type="radio" name="dtype" [checked]="hint.discountType === 'percent'" (change)="hint.discountType = 'percent'" />
                  Процент (%)
                </label>
                <label class="c-radio-item" [class.active]="hint.discountType === 'fixed'">
                  <input type="radio" name="dtype" [checked]="hint.discountType === 'fixed'" (change)="hint.discountType = 'fixed'" />
                  Фиксированная сумма
                </label>
              </div>
              <div class="c-discount-row">
                <div class="q4-mdc-field c-w-discount" [class.has-value]="true">
                  <input class="q4-mdc-input" type="number" [value]="hint.discountValue" (input)="hint.discountValue = +$any($event.target).value" />
                  <label class="q4-mdc-label">Размер скидки</label>
                </div>
                <span class="c-discount-suffix" *ngIf="hint.discountType === 'percent'">%</span>
                <select class="c-select" [value]="hint.discount" (change)="hint.discount = $any($event.target).value">
                  <option *ngFor="let d of discounts" [value]="d">{{ d }}</option>
                </select>
              </div>
            </div>

            <div class="c-section">
              <div class="c-section-title">Контрол подсказки</div>
              <select class="c-select c-full">
                <option>Стандартный контрол</option>
                <option>Контрол «Акция дня»</option>
              </select>
            </div>
          </div>

          <div class="c-drawer-body" *ngIf="drawerTab === 'where'">
            <div class="c-where-head">
              <span class="c-where-hint">Назначения подсказки на устройства и способы показа</span>
              <button class="q4-btn q4-btn-primary" (click)="openWizard()">
                <lucide-icon name="plus" [size]="16"></lucide-icon>
                Добавить назначение
              </button>
            </div>

            <div class="c-where-empty" *ngIf="assignments.length === 0">
              Назначений пока нет — нажмите «Добавить назначение».
            </div>

            <div class="c-assign-row" *ngFor="let a of assignments">
              <lucide-icon [name]="productIcon(a.product)" [size]="18" class="c-assign-icon"></lucide-icon>
              <div class="c-assign-main">
                <div class="c-assign-name">{{ a.terminal }}</div>
                <div class="c-assign-meta">{{ a.productLabel }} · способ показа: {{ a.mode }}</div>
              </div>
              <button class="q4-icon-btn" (click)="removeAssignment(a)" aria-label="Удалить назначение">
                <lucide-icon name="trash-2" [size]="16"></lucide-icon>
              </button>
            </div>

            <div class="q4-note">
              <lucide-icon name="info" [size]="15"></lucide-icon>
              Для Customer Screen мастер пишет в существующую колонку «Подсказки» настройки терминалов. Для Kiosk назначение поверх готового
              backend-маппинга — плюс достройка транспорта конфигурации до киоска (открытая задача).
            </div>
          </div>

          <div class="c-drawer-foot">
            <button class="q4-btn q4-btn-outline" (click)="drawerOpen = false">Отмена</button>
            <button class="q4-btn q4-btn-primary" [disabled]="!hint.name.trim()" (click)="saveHint()">
              <lucide-icon name="save" [size]="16"></lucide-icon>
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <!-- Мастер «Где показывать» -->
      <div class="q4-overlay c-wizard-overlay" *ngIf="wizardOpen" (click)="wizardOpen = false">
        <div class="q4-dialog c-wizard-dialog" (click)="$event.stopPropagation()">
          <div class="q4-dialog-head">
            <span class="q4-dialog-head-title">Где показывать — новое назначение</span>
            <button class="q4-icon-btn" (click)="wizardOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>

          <div class="c-stepper">
            <span class="c-step" [class.active]="step >= 1">1. Продукт</span>
            <span class="c-step-arrow">→</span>
            <span class="c-step" [class.active]="step >= 2">2. Точка / терминал</span>
            <span class="c-step-arrow">→</span>
            <span class="c-step" [class.active]="step >= 3">3. Способ показа</span>
          </div>

          <div class="q4-dialog-body">
            <div *ngIf="step === 1" class="c-step-grid">
              <button
                class="c-product-tile"
                [class.selected]="wProduct?.id === p.id"
                *ngFor="let p of products"
                (click)="wProduct = p"
              >
                <lucide-icon [name]="p.icon" [size]="22"></lucide-icon>
                <span>{{ p.label }}</span>
              </button>
            </div>

            <div *ngIf="step === 2">
              <div class="c-check" *ngFor="let t of filteredTerminals">
                <label class="c-check-label">
                  <input type="checkbox" [checked]="wTerminals.includes(t.id)" (change)="toggleTerminal(t.id)" />
                  {{ t.label }}
                </label>
              </div>
            </div>

            <div *ngIf="step === 3">
              <div class="c-check" *ngFor="let m of wProduct?.modes || []">
                <label class="c-check-label">
                  <input type="radio" name="mode" [value]="m" [checked]="wMode === m" (change)="wMode = m" />
                  {{ m }}
                </label>
              </div>
            </div>
          </div>

          <div class="q4-dialog-foot">
            <button class="q4-btn q4-btn-outline" *ngIf="step > 1" (click)="step = step - 1">Назад</button>
            <button class="q4-btn q4-btn-primary" *ngIf="step < 3" (click)="nextStep()" [disabled]="!canNext()">Далее</button>
            <button class="q4-btn q4-btn-primary" *ngIf="step === 3" (click)="finishWizard()" [disabled]="!wMode">Готово</button>
          </div>
        </div>
      </div>

      <!-- Удалить -->
      <div class="q4-overlay c-wizard-overlay" *ngIf="deleteTarget" (click)="deleteTarget = null">
        <div class="q4-dialog q4-dialog-sm" (click)="$event.stopPropagation()">
          <div class="q4-dialog-title">Удалить подсказку «{{ deleteTarget.name }}»?</div>
          <div class="q4-dialog-text">Подсказка будет снята со всех терминалов.</div>
          <div class="q4-dialog-actions">
            <button class="q4-btn q4-btn-outline" (click)="deleteTarget = null">Отмена</button>
            <button class="q4-btn q4-btn-primary" (click)="confirmDelete()">Да</button>
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

      .c-row-click { cursor: pointer; }
      .c-row-selected td { background: #F5F5F5; }
      .c-td-name { font-weight: 500; }

      /* Drawer */
      .c-drawer-overlay { background: rgba(0,0,0,.35); justify-content: flex-end; }
      .c-drawer {
        width: 640px;
        max-width: calc(100vw - 32px);
        height: 100%;
        background: #FFFFFF;
        box-shadow: 0 8px 32px 8px rgba(33,33,33,.16);
        display: flex;
        flex-direction: column;
        animation: c-slide-in 0.18s ease-out;
      }
      @keyframes c-slide-in {
        from { transform: translateX(40px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .c-drawer-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 20px;
        border-bottom: 1px solid #E0E0E0;
        flex-shrink: 0;
      }
      .c-drawer-title { font-size: 16px; font-weight: 500; color: #333333; }
      .c-drawer-tabs { display: flex; border-bottom: 1px solid #E0E0E0; padding: 0 20px; flex-shrink: 0; }
      .c-drawer-tab {
        position: relative;
        border: none; background: transparent;
        padding: 12px 16px;
        font-size: 13px;
        color: rgba(0,0,0,.54);
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .c-drawer-tab.active { color: #448AFF; font-weight: 500; }
      .c-drawer-tab.active::after {
        content: '';
        position: absolute; left: 0; right: 0; bottom: -1px;
        height: 2px; background: #448AFF;
      }
      .c-tab-count {
        display: inline-block; min-width: 18px;
        font-size: 11px; color: #FFFFFF;
        background: #448AFF; border-radius: 999px;
        padding: 1px 5px; margin-left: 4px;
      }
      .c-drawer-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
      .c-drawer-foot {
        display: flex; justify-content: flex-end; gap: 8px;
        padding: 12px 20px;
        border-top: 1px solid #E0E0E0;
        background: #FAFAFA;
        flex-shrink: 0;
      }

      .c-section { margin-bottom: 20px; }
      .c-section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; color: #424242; margin-bottom: 10px; letter-spacing: 0.3px; }
      .c-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
      .c-full { width: 100%; }
      .c-w-discount { width: 120px; }

      .c-link-row { display: flex; align-items: flex-start; gap: 12px; }
      .c-link-arrow { color: #9E9E9E; margin-top: 26px; flex-shrink: 0; }
      .c-link-card {
        flex: 1;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        padding: 10px 12px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .c-link-card-head { font-size: 12px; color: #616161; display: flex; align-items: center; gap: 8px; }
      .c-link-count {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 20px; height: 20px;
        font-size: 11px; font-weight: 500;
        color: #FFFFFF; background: #448AFF;
        border-radius: 999px; padding: 0 6px;
      }
      .c-trigger-item {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px; color: #333333;
        padding: 6px 8px;
        background: #F5F5F5;
        border-radius: 4px;
      }
      .c-trigger-item lucide-icon:first-child { color: #616161; }
      .c-trigger-item .q4-chip-x { margin-left: auto; }
      .c-empty-sm { font-size: 12px; color: #9E9E9E; }
      .c-rec-selected {
        font-size: 13px; font-weight: 500;
        color: #1565C0; background: #E3F2FD;
        border-radius: 4px; padding: 6px 8px;
      }

      .c-picker {
        margin-top: 8px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,.15);
        max-height: 220px;
        overflow-y: auto;
      }
      .c-picker-item {
        display: flex; align-items: center; gap: 8px;
        height: 40px; padding: 0 12px;
        font-size: 13px; color: #333333;
        cursor: pointer;
      }
      .c-picker-item:hover { background: #F5F5F5; }
      .c-picker-item lucide-icon { color: #616161; }

      .c-textarea {
        width: 100%;
        border: 1px solid rgba(0,0,0,.23);
        border-radius: 4px;
        padding: 10px 12px;
        font-family: Roboto, sans-serif;
        font-size: 13px;
        color: #212121;
        resize: vertical;
        outline: none;
      }
      .c-textarea:focus { border: 2px solid #448AFF; }

      .c-radio-row { display: flex; gap: 20px; margin-bottom: 12px; }
      .c-radio-item {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px; color: #333333;
        cursor: pointer;
        padding: 6px 10px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
      }
      .c-radio-item.active { border-color: #448AFF; background: #E3F2FD; color: #1565C0; }
      .c-radio-item input { accent-color: #448AFF; }
      .c-discount-row { display: flex; align-items: center; gap: 12px; }
      .c-discount-suffix { font-size: 14px; color: #616161; }
      .c-select {
        height: 36px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        padding: 0 10px;
        font-family: Roboto, sans-serif;
        font-size: 13px;
        color: #333333;
        background: #FFFFFF;
        outline: none;
        min-width: 200px;
      }
      .c-select.c-full { width: 100%; }

      /* Где показывать */
      .c-where-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .c-where-hint { font-size: 12px; color: #616161; }
      .c-where-empty { font-size: 13px; color: #9E9E9E; padding: 24px 0; text-align: center; }
      .c-assign-row {
        display: flex; align-items: center; gap: 12px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        padding: 10px 14px;
        margin-bottom: 8px;
        background: #F8F9FC;
      }
      .c-assign-icon { color: #448AFF; flex-shrink: 0; }
      .c-assign-main { flex: 1; min-width: 0; }
      .c-assign-name { font-size: 13px; font-weight: 500; color: #333333; }
      .c-assign-meta { font-size: 12px; color: #616161; margin-top: 2px; }

      /* Мастер */
      .c-wizard-overlay { z-index: 2100; }
      .c-wizard-dialog { width: 540px; max-width: calc(100vw - 32px); }
      .c-stepper { display: flex; align-items: center; gap: 8px; padding: 12px 20px; font-size: 12px; border-bottom: 1px solid #E0E0E0; }
      .c-step { color: #9E9E9E; }
      .c-step.active { color: #448AFF; font-weight: 500; }
      .c-step-arrow { color: #9E9E9E; }
      .c-step-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .c-product-tile {
        display: flex; align-items: center; gap: 10px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        background: #FFFFFF;
        padding: 14px;
        font-size: 13px; font-weight: 500;
        color: #333333;
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .c-product-tile:hover { background: #F5F5F5; }
      .c-product-tile.selected { border-color: #448AFF; background: #F0F5FF; color: #2651B5; }
      .c-check { padding: 7px 0; }
      .c-check-label { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #333333; cursor: pointer; }
      input[type='checkbox'], input[type='radio'] { accent-color: #448AFF; width: 16px; height: 16px; }
    `,
  ],
})
export class Task21HintsScreenComponent {
  hints: Q4Hint[] = Q4_HINTS.map(h => ({ ...h }));
  selectedId: number | null = null;

  dishes = Q4_DISHES;
  discounts = Q4_DISCOUNTS;

  drawerOpen = false;
  drawerTab: 'base' | 'where' = 'base';
  isNewHint = false;
  editingId: number | null = null;
  hint = this.emptyHint();

  triggers: string[] = ['Капучино'];
  recommendation = 'Пирожок с вишней';
  pickerOpen = false;
  pickerMode: 'trigger' | 'recommend' = 'trigger';

  assignments: HintAssignment[] = HINT_ASSIGNMENTS.map(a => ({ ...a }));

  products: WizardHintProduct[] = HINT_PRODUCTS;
  wizardOpen = false;
  step = 1;
  wProduct: WizardHintProduct | null = null;
  wTerminals: string[] = [];
  wMode = '';

  deleteTarget: Q4Hint | null = null;
  snack = '';

  crumbs = [{ label: 'Экраны и звуки' }, { label: 'Подсказки' }];

  private emptyHint() {
    return {
      name: '',
      from: '2026-09-11',
      to: '2026-10-11',
      timeFrom: '07:00',
      timeTo: '12:00',
      slogan: '',
      discountType: 'percent' as 'percent' | 'fixed',
      discountValue: 20,
      discount: Q4_DISCOUNTS[0],
    };
  }

  statusLabel(status: string): string {
    if (status === 'active') return 'Активна';
    if (status === 'scheduled') return 'Запланирована';
    return 'Истекла';
  }

  statusBadge(status: string): string {
    if (status === 'active') return 'q4-badge-active';
    if (status === 'scheduled') return 'q4-badge-scheduled';
    return 'q4-badge-expired';
  }

  selectRow(h: Q4Hint): void {
    this.selectedId = h.id;
  }

  openNew(): void {
    this.isNewHint = true;
    this.editingId = null;
    this.hint = this.emptyHint();
    this.triggers = [];
    this.recommendation = '';
    this.drawerTab = 'base';
    this.drawerOpen = true;
  }

  openEditor(h: Q4Hint): void {
    this.isNewHint = false;
    this.editingId = h.id;
    this.selectedId = h.id;
    this.hint = {
      name: h.name,
      from: h.from.split('.').reverse().join('-'),
      to: h.to.split('.').reverse().join('-'),
      timeFrom: h.timeFrom,
      timeTo: h.timeTo,
      slogan: '',
      discountType: 'percent',
      discountValue: 20,
      discount: Q4_DISCOUNTS[0],
    };
    this.triggers = ['Капучино'];
    this.recommendation = 'Пирожок с вишней';
    this.drawerTab = 'base';
    this.drawerOpen = true;
  }

  saveHint(): void {
    if (this.isNewHint) {
      const id = this.hints.length ? Math.max(...this.hints.map(h => h.id)) + 1 : 1;
      this.hints.unshift({
        id,
        name: this.hint.name.trim(),
        from: this.hint.from.split('-').reverse().join('.'),
        to: this.hint.to.split('-').reverse().join('.'),
        timeFrom: this.hint.timeFrom,
        timeTo: this.hint.timeTo,
        status: 'scheduled',
      });
      this.isNewHint = false;
    } else if (this.editingId !== null) {
      const h = this.hints.find(x => x.id === this.editingId);
      if (h) {
        h.name = this.hint.name.trim();
        h.from = this.hint.from.split('-').reverse().join('.');
        h.to = this.hint.to.split('-').reverse().join('.');
        h.timeFrom = this.hint.timeFrom;
        h.timeTo = this.hint.timeTo;
      }
    }
    this.drawerOpen = false;
    this.showSnack('Сохранено');
  }

  duplicateHint(): void {
    if (this.selectedId === null) {
      this.showSnack('Выберите подсказку для дублирования');
      return;
    }
    const src = this.hints.find(h => h.id === this.selectedId);
    if (!src) return;
    const id = this.hints.length ? Math.max(...this.hints.map(h => h.id)) + 1 : 1;
    this.hints.unshift({ ...src, id, name: src.name + ' (копия)', status: 'scheduled' });
    this.showSnack('Создана копия');
  }

  deleteHint(): void {
    if (this.selectedId !== null) {
      const h = this.hints.find(x => x.id === this.selectedId);
      if (h) this.deleteTarget = h;
    }
  }

  confirmDelete(): void {
    if (this.deleteTarget) {
      this.hints = this.hints.filter(x => x.id !== this.deleteTarget!.id);
    }
    this.deleteTarget = null;
    this.showSnack('Удалено');
  }

  pickDish(d: string): void {
    if (this.pickerMode === 'trigger') {
      if (!this.triggers.includes(d)) this.triggers.push(d);
    } else {
      this.recommendation = d;
    }
    this.pickerOpen = false;
  }

  productIcon(product: string): string {
    return product === 'kiosk' ? 'monitor-smartphone' : 'monitor';
  }

  get filteredTerminals() {
    if (!this.wProduct) return [];
    return HINT_TERMINALS.filter(t => t.product === this.wProduct!.id);
  }

  openWizard(): void {
    this.wizardOpen = true;
    this.step = 1;
    this.wProduct = null;
    this.wTerminals = [];
    this.wMode = '';
  }

  canNext(): boolean {
    if (this.step === 1) return !!this.wProduct;
    if (this.step === 2) return this.wTerminals.length > 0;
    return false;
  }

  nextStep(): void {
    if (!this.canNext()) return;
    if (this.step === 2) {
      this.wMode = this.wProduct!.modes[0];
    }
    this.step = this.step + 1;
  }

  toggleTerminal(id: string): void {
    const i = this.wTerminals.indexOf(id);
    if (i >= 0) {
      this.wTerminals.splice(i, 1);
    } else {
      this.wTerminals.push(id);
    }
  }

  finishWizard(): void {
    const labels = HINT_TERMINALS.filter(t => this.wTerminals.includes(t.id));
    const nextId = this.assignments.length ? Math.max(...this.assignments.map(a => a.id)) + 1 : 1;
    for (const t of labels) {
      this.assignments.push({
        id: nextId + this.assignments.length,
        product: this.wProduct!.id,
        productLabel: this.wProduct!.label,
        terminal: t.label,
        mode: this.wMode,
      });
    }
    this.wizardOpen = false;
    this.showSnack('Сохранено — назначения добавлены');
  }

  removeAssignment(a: HintAssignment): void {
    this.assignments = this.assignments.filter(x => x.id !== a.id);
    this.showSnack('Назначение удалено');
  }

  showSnack(text: string): void {
    this.snack = text;
    setTimeout(() => (this.snack = ''), 2500);
  }
}
