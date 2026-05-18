import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiInputComponent,
  UiSelectComponent,
  UiTextareaComponent,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { Hint, TriggerItem, RecommendationItem, ProductNode } from '../../cs-types';

export interface HintDrawerSaveEvent {
  hint: Hint;
  controlId: string;
}

@Component({
  selector: 'app-hint-edit-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    UiSelectComponent,
    UiTextareaComponent,
    IconsModule,
  ],
  template: `
    <!-- Drawer overlay -->
    <div *ngIf="open" class="drawer-overlay" (click)="cancel.emit()"></div>

    <!-- Drawer panel -->
    <div class="drawer" [class.drawer-open]="open">
      <div class="drawer-header">
        <h2 class="drawer-title">{{ editingHint ? 'Редактировать подсказку' : 'Добавить подсказку' }}</h2>
        <button class="app-btn-close" (click)="cancel.emit()">
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>

      <div class="drawer-body" *ngIf="hint">
        <!-- Section 1: Main params -->
        <div class="section">
          <div class="section-title">Основные параметры</div>
          <div class="field-row">
            <label class="field-label">Наименование <span class="required">*</span></label>
            <ui-input
              placeholder="Введите название подсказки"
              [(value)]="hint.name"
              [error]="nameError"
            ></ui-input>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">Дата начала</label>
              <ui-input type="date" [(value)]="hint.period.startDate"></ui-input>
            </div>
            <div class="field-row">
              <label class="field-label">Дата окончания</label>
              <ui-input type="date" [(value)]="hint.period.endDate"></ui-input>
            </div>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">Время начала</label>
              <ui-input type="time" [(value)]="hint.time.startTime"></ui-input>
            </div>
            <div class="field-row">
              <label class="field-label">Время окончания</label>
              <ui-input type="time" [(value)]="hint.time.endTime"></ui-input>
            </div>
          </div>
        </div>

        <!-- Section 2: Dish linking -->
        <div class="section">
          <div class="section-title">Связка блюд</div>
          <div class="link-row">
            <!-- Triggers card -->
            <div class="link-card">
              <div class="link-card-header">
                <span class="link-card-label">Триггеры</span>
                <span class="link-card-count" *ngIf="hint.triggers.length">{{ hint.triggers.length }}</span>
              </div>
              <div class="link-card-body">
                <div class="trigger-list" *ngIf="hint.triggers.length > 0">
                  <div class="trigger-item" *ngFor="let t of hint.triggers; let i = index">
                    <div class="trigger-info">
                      <lucide-icon [name]="t.type === 'category' ? 'folder' : 'coffee'" [size]="14" class="trigger-icon"></lucide-icon>
                      <span class="trigger-name">{{ t.name }}</span>
                    </div>
                    <button class="trigger-remove" (click)="removeTrigger(i)" title="Убрать">
                      <lucide-icon name="x" [size]="14"></lucide-icon>
                    </button>
                  </div>
                </div>
                <div class="trigger-empty" *ngIf="hint.triggers.length === 0">
                  <span>Нет триггеров</span>
                </div>
                <div class="add-trigger-wrapper">
                  <button class="app-btn app-btn-outline app-btn-sm app-btn-block" (click)="triggerDropdownOpen = !triggerDropdownOpen">
                    <lucide-icon name="plus" [size]="14"></lucide-icon>
                    Добавить триггер
                  </button>
                  <div class="item-dropdown" *ngIf="triggerDropdownOpen">
                    <div class="item-dropdown-scroll">
                      <div class="item-dropdown-group" *ngFor="let cat of productTree">
                        <div class="item-dropdown-cat" (click)="addTriggerCategory(cat)">
                          <lucide-icon name="folder" [size]="14" class="dd-icon"></lucide-icon>
                          <span>{{ cat.name }}</span>
                          <span class="dd-type-label">категория</span>
                        </div>
                        <div class="item-dropdown-item" *ngFor="let prod of cat.children" (click)="addTriggerProduct(prod)">
                          <lucide-icon name="coffee" [size]="13" class="dd-icon"></lucide-icon>
                          {{ prod.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Arrow -->
            <div class="link-arrow">
              <lucide-icon name="arrow-right" [size]="24"></lucide-icon>
            </div>

            <!-- Recommendation card -->
            <div class="link-card">
              <div class="link-card-header">
                <span class="link-card-label">Рекомендация</span>
              </div>
              <div class="link-card-body">
                <div class="rec-selected" *ngIf="hint.recommendation">
                  <div class="rec-info">
                    <lucide-icon name="coffee" [size]="14" class="trigger-icon"></lucide-icon>
                    <span>{{ hint.recommendation.name }}</span>
                  </div>
                  <button class="trigger-remove" (click)="hint.recommendation = null" title="Убрать">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </div>
                <div class="trigger-empty" *ngIf="!hint.recommendation">
                  <span>Не выбрано</span>
                </div>
                <div class="add-trigger-wrapper">
                  <button class="app-btn app-btn-outline app-btn-sm app-btn-block" (click)="recDropdownOpen = !recDropdownOpen">
                    <lucide-icon name="search" [size]="14"></lucide-icon>
                    Выбрать блюдо
                  </button>
                  <div class="item-dropdown" *ngIf="recDropdownOpen">
                    <div class="item-dropdown-scroll">
                      <div class="item-dropdown-group" *ngFor="let cat of productTree">
                        <div class="item-dropdown-cat-label">
                          <lucide-icon name="folder" [size]="13" class="dd-icon"></lucide-icon>
                          {{ cat.name }}
                        </div>
                        <div class="item-dropdown-item" *ngFor="let prod of cat.children" (click)="selectRecommendation(prod)">
                          <lucide-icon name="coffee" [size]="13" class="dd-icon"></lucide-icon>
                          {{ prod.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Slogan -->
        <div class="section">
          <div class="section-title">Слоган рекомендации</div>
          <div class="field-row">
            <ui-textarea
              placeholder="Введите промо-текст подсказки..."
              [(value)]="hint.slogan"
              [rows]="4"
            ></ui-textarea>
          </div>
        </div>

        <!-- Section 4: Discount -->
        <div class="section">
          <div class="section-title">Скидка</div>
          <div class="field-row">
            <label class="field-label">Тип скидки</label>
            <div class="radio-group">
              <label class="radio-item" [class.radio-active]="hint.discountType === 'percent'">
                <input type="radio" name="discountType" value="percent" [(ngModel)]="hint.discountType" />
                <span>Процент (%)</span>
              </label>
              <label class="radio-item" [class.radio-active]="hint.discountType === 'fixed'">
                <input type="radio" name="discountType" value="fixed" [(ngModel)]="hint.discountType" />
                <span>Фиксированная сумма</span>
              </label>
            </div>
          </div>
          <div class="field-grid">
            <div class="field-row">
              <label class="field-label">Размер скидки</label>
              <div class="discount-input-wrapper">
                <input
                  type="number"
                  class="discount-input"
                  [class.no-suffix]="hint.discountType !== 'percent'"
                  [(ngModel)]="hint.discountValue"
                  (input)="onDiscountValueChange($event)"
                  min="0"
                  step="0.01"
                />
                <span class="discount-suffix" *ngIf="hint.discountType === 'percent'">%</span>
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">Скидка</label>
              <select
                class="native-select"
                [ngModel]="hint.discount || ''"
                (ngModelChange)="hint.discount = $event || null"
              >
                <option value="" disabled>Выберите скидку...</option>
                <option *ngFor="let d of discountsList" [value]="d.name">
                  {{ d.name }} ({{ d.type === 'percent' ? d.value + '%' : d.value }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 5: Control -->
        <div class="section">
          <div class="section-title">Контрол подсказки</div>
          <div class="field-row">
            <label class="field-label">Контрол</label>
            <ui-select
              [(value)]="selectedControlId"
              [options]="hintControlOptions"
              placeholder="Выберите контрол..."
            ></ui-select>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="drawer-footer">
        <button class="app-btn app-btn-ghost" (click)="cancel.emit()">Отмена</button>
        <button class="app-btn app-btn-primary" (click)="onSave()">Сохранить</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .drawer-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 100;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 640px;
      background: #fff; z-index: 101; display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .drawer-open { transform: translateX(0); }

    .drawer-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; border-bottom: 1px solid #e0e0e0;
    }
    .drawer-title { font-size: 18px; font-weight: 500; color: #212121; margin: 0; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
    .drawer-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 14px 24px; border-top: 1px solid #e0e0e0; background: #fafafa;
    }

    .app-btn-close {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: none; border-radius: 4px;
      background: transparent; color: #616161; cursor: pointer; transition: all 0.15s;
    }
    .app-btn-close:hover { background: #f5f5f5; color: #212121; }

    .app-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 14px; height: 34px; border: none; border-radius: 4px;
      font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }
    .app-btn-outline { background: transparent; color: #448aff; border: 1px solid #448aff; }
    .app-btn-outline:hover { background: #f0f6ff; }
    .app-btn-ghost { background: transparent; color: #616161; }
    .app-btn-ghost:hover { background: #f5f5f5; }
    .app-btn-sm { height: 30px; padding: 0 10px; font-size: 12px; }
    .app-btn-block { width: 100%; justify-content: center; }

    /* Sections */
    .section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }
    .section:last-child { border-bottom: none; margin-bottom: 0; }
    .section-title {
      font-size: 13px; font-weight: 600; color: #424242; text-transform: uppercase;
      letter-spacing: 0.3px; margin-bottom: 14px;
    }

    /* Fields */
    .field-row { margin-bottom: 14px; }
    .field-row:last-child { margin-bottom: 0; }
    .field-label { display: block; font-size: 12px; font-weight: 500; color: #757575; margin-bottom: 6px; }
    .required { color: #e53935; }
    .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .field-grid:last-child { margin-bottom: 0; }
    .field-grid .field-row { margin-bottom: 0; }

    /* Link row */
    .link-row { display: flex; gap: 12px; align-items: stretch; }
    .link-card {
      flex: 1; border: 1px solid #e0e0e0; border-radius: 8px;
      display: flex; flex-direction: column; position: relative;
    }
    .link-card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; background: #fafafa; border-bottom: 1px solid #eeeeee;
    }
    .link-card-label { font-size: 12px; font-weight: 600; color: #424242; text-transform: uppercase; letter-spacing: 0.3px; }
    .link-card-count {
      display: inline-flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border-radius: 50%; background: #448aff; color: #fff;
      font-size: 11px; font-weight: 600;
    }
    .link-card-body { padding: 10px 12px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .link-arrow {
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; width: 40px; color: #bdbdbd;
    }

    /* Trigger list */
    .trigger-list { display: flex; flex-direction: column; gap: 4px; }
    .trigger-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 8px; background: #f5f5f5; border-radius: 4px;
    }
    .trigger-info { display: flex; align-items: center; gap: 6px; min-width: 0; }
    .trigger-icon { color: #757575; flex-shrink: 0; }
    .trigger-name { font-size: 13px; color: #424242; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .trigger-remove {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer; transition: all 0.15s; flex-shrink: 0;
    }
    .trigger-remove:hover { background: #ffebee; color: #e53935; }
    .trigger-empty { padding: 12px 0; text-align: center; color: #bdbdbd; font-size: 12px; }

    /* Recommendation selected */
    .rec-selected {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 8px; background: #e3f2fd; border-radius: 4px;
    }
    .rec-info { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #1565c0; font-weight: 500; }

    /* Add trigger wrapper */
    .add-trigger-wrapper { position: relative; margin-top: auto; }

    /* Item dropdown */
    .item-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 50; margin-top: 4px;
      background: #fff; border: 1px solid #e0e0e0; border-radius: 6px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.12); animation: dropIn 0.15s ease-out;
    }
    @keyframes dropIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .item-dropdown-scroll { max-height: 260px; overflow-y: auto; padding: 4px; }
    .item-dropdown-group { margin-bottom: 2px; }
    .item-dropdown-cat {
      display: flex; align-items: center; gap: 6px; padding: 7px 10px; font-size: 13px;
      font-weight: 500; color: #424242; cursor: pointer; border-radius: 4px; transition: background 0.1s;
    }
    .item-dropdown-cat:hover { background: #e3f2fd; }
    .item-dropdown-cat-label {
      display: flex; align-items: center; gap: 6px; padding: 7px 10px; font-size: 12px;
      font-weight: 600; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .item-dropdown-item {
      display: flex; align-items: center; gap: 6px; padding: 6px 10px 6px 28px; font-size: 13px;
      color: #616161; cursor: pointer; border-radius: 4px; transition: background 0.1s;
    }
    .item-dropdown-item:hover { background: #f5f5f5; color: #212121; }
    .dd-icon { color: #9e9e9e; flex-shrink: 0; }
    .dd-type-label { margin-left: auto; font-size: 11px; color: #bdbdbd; font-weight: 400; }

    /* Radio group */
    .radio-group { display: flex; gap: 4px; }
    .radio-item {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 14px; border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 13px; color: #616161; cursor: pointer; transition: all 0.15s; user-select: none;
    }
    .radio-item input[type="radio"] { display: none; }
    .radio-item:hover { background: #f5f5f5; }
    .radio-active { border-color: #448aff; background: #e3f2fd; color: #1565c0; font-weight: 500; }

    /* Discount input */
    .discount-input-wrapper { display: flex; align-items: center; position: relative; }
    .discount-input {
      width: 100%; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px;
      padding: 0 32px 0 10px; font-size: 13px; font-family: Roboto, sans-serif; color: #424242;
      outline: none; transition: border-color 0.15s; background: #fff;
    }
    .discount-input.no-suffix { padding-right: 10px; }
    .discount-input:focus { border-color: #448aff; }
    .discount-suffix {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      font-size: 13px; color: #9e9e9e; pointer-events: none;
    }
    .native-select {
      width: 100%; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px;
      padding: 0 10px; font-size: 13px; font-family: Roboto, sans-serif; color: #424242;
      outline: none; transition: border-color 0.15s; background: #fff; cursor: pointer;
    }
    .native-select:focus { border-color: #448aff; }
  `],
})
export class HintEditDrawerComponent {
  @Input() open = false;
  @Input() hint: Hint | null = null;
  @Input() editingHint: Hint | null = null;
  @Input() hintControlOptions: SelectOption[] = [];
  @Input() productTree: ProductNode[] = [];
  @Input() discountsList: { name: string; type: string; value: number }[] = [];
  @Input() selectedControlId = '';
  @Input() nameError = '';

  @Output() saved = new EventEmitter<HintDrawerSaveEvent>();
  @Output() cancel = new EventEmitter<void>();
  @Output() nameErrorChange = new EventEmitter<string>();
  @Output() selectedControlIdChange = new EventEmitter<string>();

  triggerDropdownOpen = false;
  recDropdownOpen = false;

  addTriggerCategory(cat: { id: number; name: string }): void {
    if (!this.hint) return;
    const exists = this.hint.triggers.some(t => t.id === cat.id && t.type === 'category');
    if (!exists) {
      this.hint.triggers = [...this.hint.triggers, { id: cat.id, name: cat.name, type: 'category' }];
    }
    this.triggerDropdownOpen = false;
  }

  addTriggerProduct(prod: { id: number; name: string }): void {
    if (!this.hint) return;
    const exists = this.hint.triggers.some(t => t.id === prod.id && t.type === 'product');
    if (!exists) {
      this.hint.triggers = [...this.hint.triggers, { id: prod.id, name: prod.name, type: 'product' }];
    }
    this.triggerDropdownOpen = false;
  }

  removeTrigger(index: number): void {
    if (!this.hint) return;
    this.hint.triggers = this.hint.triggers.filter((_, i) => i !== index);
  }

  selectRecommendation(prod: { id: number; name: string }): void {
    if (!this.hint) return;
    this.hint.recommendation = { id: prod.id, name: prod.name, type: 'product' };
    this.recDropdownOpen = false;
  }

  onDiscountValueChange(event: Event): void {
    if (!this.hint) return;
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const match = raw.match(/^(\d*\.\d{2})\d+$/);
    if (match) {
      input.value = match[1];
      this.hint.discountValue = parseFloat(match[1]);
    }
  }

  onSave(): void {
    if (!this.hint) return;
    if (!this.hint.name.trim()) {
      this.nameError = 'Название обязательно';
      this.nameErrorChange.emit(this.nameError);
      return;
    }
    this.nameError = '';
    this.nameErrorChange.emit(this.nameError);
    this.saved.emit({ hint: this.hint, controlId: this.selectedControlId });
  }
}
