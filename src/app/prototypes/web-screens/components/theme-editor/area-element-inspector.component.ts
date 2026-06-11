import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsThemeElement, ArrivalsControl } from '../../types';
import { CollapsibleSectionComponent } from '../inspector/collapsible-section.component';
import { LayoutFieldsComponent } from '../inspector/layout-fields.component';
import { BorderFieldsComponent } from '../inspector/border-fields.component';
import { ColorFieldComponent } from '../inspector/color-field.component';

@Component({
  selector: 'app-area-element-inspector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    CollapsibleSectionComponent,
    LayoutFieldsComponent,
    BorderFieldsComponent,
    ColorFieldComponent,
  ],
  template: `
    <div class="field-group">
      <label class="field-label">Контрол</label>
      <select class="field-select" [(ngModel)]="element.areaControlId" (ngModelChange)="areaControlChange.emit()">
        <option [ngValue]="undefined">\u2014 Выберите контрол \u2014</option>
        <option *ngFor="let c of availableControls" [ngValue]="c.id">{{ c.name }}</option>
      </select>
      <button
        *ngIf="element.areaControlId"
        class="btn-edit-control"
        (click)="editControl.emit(element.areaControlId!)"
      >
        <lucide-icon name="pencil" [size]="14"></lucide-icon>
        Редактировать контрол
      </button>
    </div>

    <div class="field-group">
      <label class="field-label">Название области</label>
      <input class="field-input" [(ngModel)]="element.name" />
    </div>

    <div class="section-divider">Настройки</div>

    <div class="field-group">
      <label class="field-label">Режим области</label>
      <select class="field-select" [(ngModel)]="element.areaMode">
        <option value="list">Лист</option>
        <option value="dynamic">Динамически заполняемая область</option>
        <option value="single">Одиночный объект</option>
      </select>
    </div>

    <ng-container *ngIf="element.areaMode === 'list'">
      <div class="field-group">
        <label class="field-label">Расположение контролов</label>
        <select class="field-select" [(ngModel)]="element.areaListDirection">
          <option value="top">Новые заказы выше</option>
          <option value="bottom">Готовые заказы выше</option>
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Макс. кол-во столбцов</label>
        <input type="number" class="field-input" [(ngModel)]="element.areaMaxColumns" min="1" max="4" />
      </div>
    </ng-container>

    <ng-container *ngIf="element.areaMode !== 'single'">
    <div class="field-group">
      <label class="field-label">Тип статуса заказа</label>
      <select class="field-select" [(ngModel)]="element.areaStatusType">
        <option value="kitchen">Статусы кухни</option>
        <option value="delivery">Доставка</option>
        <option value="balancer">Балансер</option>
      </select>
    </div>

    <div class="field-group">
      <label class="field-label">Статус заказа</label>
      <div class="checkbox-group">
        <label *ngFor="let s of availableStatuses" class="field-check">
          <input type="checkbox" [checked]="isStatusSelected(s)" (change)="toggleStatus(s)" />
          {{ s }}
        </label>
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">Типы заказов</label>
      <div class="checkbox-group">
        <label class="field-check">
          <input type="checkbox" [checked]="isOrderTypeSelected('ordinary')" (change)="toggleOrderType('ordinary')" /> Обычные
        </label>
        <label class="field-check">
          <input type="checkbox" [checked]="isOrderTypeSelected('courier')" (change)="toggleOrderType('courier')" /> Доставка курьером
        </label>
        <label class="field-check">
          <input type="checkbox" [checked]="isOrderTypeSelected('pickup')" (change)="toggleOrderType('pickup')" /> Самовывоз
        </label>
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">Сортировка</label>
      <select class="field-select" [(ngModel)]="element.areaSortOrder">
        <option value="oldest-first">От старых к новым</option>
        <option value="newest-first">От новых к старым</option>
      </select>
    </div>

    <div class="field-group">
      <label class="field-label">Межстрочный интервал (px)</label>
      <input type="number" class="field-input" [(ngModel)]="element.areaInterlineSpacing" min="0" />
    </div>
    </ng-container>

    <div class="section-divider">Макет</div>

    <app-color-field label="Цвет фона" [(value)]="element.areaBgColor!"></app-color-field>

    <app-collapsible-section title="Позиция и размер">
      <app-layout-fields
        [(x)]="element.x" [(y)]="element.y"
        [(width)]="element.width" [(height)]="element.height">
      </app-layout-fields>
    </app-collapsible-section>

    <app-collapsible-section title="Граница">
      <app-border-fields
        [(borderWidth)]="element.borderWidth"
        [(borderColor)]="element.borderColor"
        [(borderRadius)]="element.borderRadius">
      </app-border-fields>
    </app-collapsible-section>
  `,
  styles: [`
    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input {
      width: 100%; height: 36px; padding: 0 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; transition: border-color 0.15s;
    }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-select {
      width: 100%; height: 36px; padding: 0 8px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      background: #fff; cursor: pointer; box-sizing: border-box;
    }
    .field-check {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: #333; cursor: pointer; user-select: none;
    }
    .checkbox-group { display: flex; flex-direction: column; gap: 6px; }

    .section-divider {
      position: relative; text-align: center;
      margin: 20px 0 12px; font-size: 13px; font-weight: 500; color: #9e9e9e;
    }
    .section-divider::before, .section-divider::after {
      content: ''; position: absolute; top: 50%;
      width: calc(50% - 50px); height: 1px; background: #e0e0e0;
    }
    .section-divider::before { left: 0; }
    .section-divider::after { right: 0; }

    .btn-edit-control {
      display: inline-flex; align-items: center; gap: 6px;
      margin-top: 8px; padding: 6px 12px;
      border: 1px solid #1976d2; border-radius: 4px;
      background: transparent; color: #1976d2;
      font-size: 12px; font-family: Roboto, sans-serif; font-weight: 500;
      cursor: pointer; transition: background 0.15s, color 0.15s;
    }
    .btn-edit-control:hover { background: #e3f2fd; }
  `],
})
export class AreaElementInspectorComponent {
  @Input() element!: ArrivalsThemeElement;
  @Input() availableControls: ArrivalsControl[] = [];

  @Output() areaControlChange = new EventEmitter<void>();
  @Output() editControl = new EventEmitter<number>();

  get availableStatuses(): string[] {
    const t = this.element.areaStatusType;
    if (t === 'delivery') return ['Ожидает', 'Готовится', 'Готово', 'Выдача', 'В пути', 'Доставлен'];
    if (t === 'balancer') return ['Ожидает', 'Готовится', 'Готово'];
    return ['Ожидает', 'Готовится', 'Готово', 'Подан'];
  }

  isStatusSelected(status: string): boolean {
    return this.element.areaStatuses?.includes(status) ?? false;
  }

  toggleStatus(status: string): void {
    if (!this.element.areaStatuses) return;
    const idx = this.element.areaStatuses.indexOf(status);
    if (idx >= 0) { this.element.areaStatuses.splice(idx, 1); }
    else { this.element.areaStatuses.push(status); }
  }

  isOrderTypeSelected(type: 'ordinary' | 'courier' | 'pickup'): boolean {
    return this.element.areaOrderTypes?.includes(type) ?? false;
  }

  toggleOrderType(type: 'ordinary' | 'courier' | 'pickup'): void {
    if (!this.element.areaOrderTypes) return;
    const idx = this.element.areaOrderTypes.indexOf(type);
    if (idx >= 0) { this.element.areaOrderTypes.splice(idx, 1); }
    else { this.element.areaOrderTypes.push(type); }
  }
}
