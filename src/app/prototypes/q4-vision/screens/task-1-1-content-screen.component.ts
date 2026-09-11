import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4TaskHeaderComponent } from '../components/q4-task-header.component';
import {
  CAMPAIGN_NAME,
  CAMPAIGN_ASSIGNMENTS,
  WIZARD_PRODUCTS,
  WIZARD_TERMINALS,
} from '../data/mock-data';
import { CampaignAssignment, WizardProduct } from '../types';

@Component({
  selector: 'app-task-1-1-content-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4TaskHeaderComponent],
  template: `
    <div class="t-container">
      <app-q4-task-header
        goal="1"
        taskKey="1.1"
        title="Настройка контента в одном месте"
        [jira]="['DS-1298', 'DS-1293']"
        [changes]="[
          'Сейчас: назначение кампании разбросано по продуктам (вкладки режимов CS, колонка терминалов Arrivals, бэкенд-маппинг киоска)',
          'Будет: в карточке кампании — мастер «Где показывать»: продукт → точка/терминал → слот показа'
        ]"
      ></app-q4-task-header>

      <div class="t-card">
        <div class="t-card-head">
          <span class="t-crumb">Кампании /</span>
          <span class="t-card-title">{{ campaignName }}</span>
        </div>

        <!-- Tabs -->
        <div class="t-tabs">
          <button class="t-tab" [class.active]="tab === 'base'" (click)="tab = 'base'">Основное</button>
          <button class="t-tab" [class.active]="tab === 'screens'" (click)="tab = 'screens'">Экраны</button>
          <button class="t-tab" [class.active]="tab === 'where'" (click)="tab = 'where'">
            Где показывать
            <span class="t-tab-count" *ngIf="assignments.length > 0">{{ assignments.length }}</span>
          </button>
        </div>

        <!-- Tab: Где показывать -->
        <div class="t-body" *ngIf="tab === 'where'">
          <div class="t-list-head">
            <span class="t-list-hint">Назначения кампании на устройства и слоты показа</span>
            <button class="t-btn t-btn-primary" (click)="openWizard()">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              Добавить назначение
            </button>
          </div>

          <div class="t-empty" *ngIf="assignments.length === 0">
            Назначений пока нет — нажмите «Добавить назначение».
          </div>

          <div class="t-assign-row" *ngFor="let a of assignments">
            <lucide-icon [name]="productIcon(a.product)" [size]="18" class="t-assign-icon"></lucide-icon>
            <div class="t-assign-main">
              <div class="t-assign-name">{{ a.terminal }}</div>
              <div class="t-assign-meta">{{ a.productLabel }} · слот показа: {{ a.slot }}</div>
            </div>
            <button class="t-icon-btn" (click)="removeAssignment(a)" aria-label="Удалить назначение">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
          </div>

          <div class="t-note">
            <lucide-icon name="info" [size]="15"></lucide-icon>
            Назначение пишется в существующие модели привязки продукта (terminal-mapping, маппинг киоска, свойства темы) — транспорт до устройств не меняется.
          </div>
        </div>

        <!-- Tab: Основное -->
        <div class="t-body" *ngIf="tab === 'base'">
          <div class="t-field-row"><span class="t-field-label">Название</span><span>{{ campaignName }}</span></div>
          <div class="t-field-row"><span class="t-field-label">Период действия</span><span>01.09.2026 — 31.12.2026</span></div>
          <div class="t-field-row"><span class="t-field-label">Время действия</span><span>07:00 — 12:00</span></div>
          <div class="t-field-row"><span class="t-field-label">Дни недели</span><span>Пн — Пт</span></div>
        </div>

        <!-- Tab: Экраны -->
        <div class="t-body" *ngIf="tab === 'screens'">
          <div class="t-field-row"><span class="t-field-label">Разрешение</span><span>1024×768</span></div>
          <div class="t-field-row"><span class="t-field-label">Режимы</span><span>Экран заказа, Режим ожидания</span></div>
          <div class="t-field-row"><span class="t-field-label">Медиа</span><span>ролик_завтраки.mp4, баннер_завтрак.jpg</span></div>
        </div>
      </div>

      <!-- Wizard overlay -->
      <div class="t-overlay" *ngIf="wizardOpen">
        <div class="t-modal">
          <div class="t-modal-head">
            <span class="t-modal-title">Где показывать — новое назначение</span>
            <button class="t-icon-btn" (click)="wizardOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>

          <!-- Stepper -->
          <div class="t-stepper">
            <span class="t-step" [class.active]="step >= 1">1. Продукт</span>
            <span class="t-step-arrow">→</span>
            <span class="t-step" [class.active]="step >= 2">2. Точка / терминал</span>
            <span class="t-step-arrow">→</span>
            <span class="t-step" [class.active]="step >= 3">3. Слот показа</span>
          </div>

          <div class="t-modal-body">
            <!-- Step 1 -->
            <div *ngIf="step === 1" class="t-step-grid">
              <button
                class="t-product-tile"
                [class.selected]="wProduct?.id === p.id"
                *ngFor="let p of products"
                (click)="wProduct = p"
              >
                <lucide-icon [name]="p.icon" [size]="22"></lucide-icon>
                <span>{{ p.label }}</span>
              </button>
            </div>

            <!-- Step 2 -->
            <div *ngIf="step === 2">
              <div class="t-checkbox" *ngFor="let t of filteredTerminals">
                <label class="t-checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="wTerminals.includes(t.id)"
                    (change)="toggleTerminal(t.id)"
                  />
                  {{ t.label }}
                </label>
              </div>
            </div>

            <!-- Step 3 -->
            <div *ngIf="step === 3">
              <div class="t-radio" *ngFor="let s of wProduct?.slots || []">
                <label class="t-checkbox-label">
                  <input
                    type="radio"
                    name="slot"
                    [value]="s"
                    [checked]="wSlot === s"
                    (change)="wSlot = s"
                  />
                  {{ s }}
                </label>
              </div>
            </div>
          </div>

          <div class="t-modal-foot">
            <button class="t-btn" *ngIf="step > 1" (click)="step = step - 1">Назад</button>
            <button class="t-btn t-btn-primary" *ngIf="step < 3" (click)="nextStep()" [disabled]="!canNext()">Далее</button>
            <button class="t-btn t-btn-primary" *ngIf="step === 3" (click)="finishWizard()" [disabled]="!wSlot">Готово</button>
          </div>
        </div>
      </div>

      <!-- Snackbar -->
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

      .t-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--dt-stroke-default); padding: 0 20px; margin-top: 12px; }
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
      .t-tab.active::after {
        content: '';
        position: absolute; left: 0; right: 0; bottom: -1px;
        height: 2px; background: var(--dt-brand-accent);
      }
      .t-tab-count {
        display: inline-block; min-width: 18px;
        font-size: 11px; color: var(--dt-text-inversive);
        background: var(--dt-brand-accent); border-radius: 999px;
        padding: 1px 5px; margin-left: 4px;
      }

      .t-body { padding: 16px 20px 20px; }
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
      .t-btn:hover:not(:disabled) { background: #FAFAFA; }
      .t-btn-primary {
        background: #448AFF;
        border-color: #448AFF;
        color: #FFFFFF;
      }
      .t-btn-primary:hover:not(:disabled) { background: #3969D5; }
      .t-btn:disabled { background: #EBEBEB; color: #9E9E9E; border-color: #EBEBEB; cursor: default; }
      .t-icon-btn {
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
        border: none; background: transparent; border-radius: 4px;
        color: var(--dt-icon-primary); cursor: pointer;
      }
      .t-icon-btn:hover { background: #EBEBEB; }

      .t-empty { font-size: 13px; color: var(--dt-text-disable); padding: 24px 0; text-align: center; }
      .t-assign-row {
        display: flex; align-items: center; gap: 12px;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 10px 14px;
        margin-bottom: 8px;
        background: var(--dt-surface-variant);
      }
      .t-assign-icon { color: var(--dt-brand-accent); flex-shrink: 0; }
      .t-assign-main { flex: 1; min-width: 0; }
      .t-assign-name { font-size: 13px; font-weight: 500; color: var(--dt-text-primary); }
      .t-assign-meta { font-size: 12px; color: var(--dt-text-secondary); margin-top: 2px; }

      .t-note {
        margin-top: 14px;
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px; padding: 10px 12px;
      }

      .t-field-row { display: flex; gap: 12px; padding: 8px 0; font-size: 13px; color: var(--dt-text-primary); border-bottom: 1px solid var(--dt-stroke-disable); }
      .t-field-label { width: 160px; color: var(--dt-text-secondary); flex-shrink: 0; }

      .t-overlay {
        position: fixed; inset: 0;
        background: rgba(33, 33, 33, 0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 200;
      }
      .t-modal {
        width: 560px; max-width: calc(100vw - 32px);
        background: var(--dt-surface-primary);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-xl);
      }
      .t-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--dt-stroke-default); }
      .t-modal-title { font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
      .t-stepper { display: flex; align-items: center; gap: 8px; padding: 12px 20px; font-size: 12px; }
      .t-step { color: var(--dt-text-disable); }
      .t-step.active { color: var(--dt-brand-accent); font-weight: 500; }
      .t-step-arrow { color: var(--dt-text-disable); }
      .t-modal-body { padding: 8px 20px 16px; min-height: 180px; }
      .t-step-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .t-product-tile {
        display: flex; align-items: center; gap: 10px;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        background: var(--dt-surface-primary);
        padding: 14px;
        font-size: 13px; font-weight: 500;
        color: var(--dt-text-primary);
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .t-product-tile:hover { background: var(--dt-surface-hover); }
      .t-product-tile.selected { border-color: var(--dt-brand-accent); background: var(--dt-brand-accent-lighter); color: var(--dt-brand-accent-dark); }
      .t-checkbox, .t-radio { padding: 7px 0; }
      .t-checkbox-label { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--dt-text-primary); cursor: pointer; }
      input[type='checkbox'], input[type='radio'] { accent-color: #448AFF; width: 16px; height: 16px; }
      .t-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--dt-stroke-default); }

      .t-snack {
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        display: flex; align-items: center; gap: 8px;
        background: var(--dt-surface-snack-tooltip);
        color: #FFFFFF;
        font-size: 13px;
        border-radius: 4px;
        padding: 10px 16px;
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
export class Task11ContentScreenComponent {
  campaignName = CAMPAIGN_NAME;
  assignments: CampaignAssignment[] = CAMPAIGN_ASSIGNMENTS.map(a => ({ ...a }));
  products: WizardProduct[] = WIZARD_PRODUCTS;

  tab = 'where';
  wizardOpen = false;
  step = 1;
  wProduct: WizardProduct | null = null;
  wTerminals: string[] = [];
  wSlot = '';
  snack = '';

  private icons: Record<string, string> = {
    cs: 'monitor',
    arrivals: 'monitor-play',
    kiosk: 'monitor-smartphone',
    menuboard: 'layout-list',
  };

  productIcon(product: string): string {
    return this.icons[product] || 'monitor';
  }

  get filteredTerminals() {
    if (!this.wProduct) return [];
    return WIZARD_TERMINALS.filter(t => t.product === this.wProduct!.id);
  }

  openWizard(): void {
    this.wizardOpen = true;
    this.step = 1;
    this.wProduct = null;
    this.wTerminals = [];
    this.wSlot = '';
  }

  canNext(): boolean {
    if (this.step === 1) return !!this.wProduct;
    if (this.step === 2) return this.wTerminals.length > 0;
    return false;
  }

  nextStep(): void {
    if (!this.canNext()) return;
    if (this.step === 2) {
      this.wSlot = this.wProduct!.slots[0];
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
    const labels = WIZARD_TERMINALS.filter(t => this.wTerminals.includes(t.id));
    const nextId = this.assignments.length ? Math.max(...this.assignments.map(a => a.id)) + 1 : 1;
    for (const t of labels) {
      this.assignments.push({
        id: nextId + this.assignments.length,
        product: this.wProduct!.id,
        productLabel: this.wProduct!.label,
        terminal: t.label,
        slot: this.wSlot,
      });
    }
    this.wizardOpen = false;
    this.showSnack('Сохранено — назначения добавлены');
  }

  removeAssignment(a: CampaignAssignment): void {
    this.assignments = this.assignments.filter(x => x.id !== a.id);
    this.showSnack('Назначение удалено');
  }

  private showSnack(text: string): void {
    this.snack = text;
    setTimeout(() => (this.snack = ''), 2200);
  }
}
