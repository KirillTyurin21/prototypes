import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-border-fields',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fields-row">
      <div class="field-sm">
        <label>Толщина</label>
        <input type="number" [ngModel]="borderWidth" (ngModelChange)="borderWidthChange.emit($event)" class="field-input-sm" />
      </div>
      <div class="field-sm">
        <label>Радиус</label>
        <input type="number" [ngModel]="borderRadius" (ngModelChange)="borderRadiusChange.emit($event)" class="field-input-sm" />
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Цвет</label>
      <input type="color" [ngModel]="borderColor" (ngModelChange)="borderColorChange.emit($event)" class="field-color" />
    </div>
  `,
  styles: [`
    .fields-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    .field-sm {
      flex: 1;
    }
    .field-sm label {
      display: block;
      font-size: 11px;
      color: var(--dt-text-disable);
      margin-bottom: 2px;
    }
    .field-input-sm {
      width: 100%;
      height: 30px;
      padding: 0 6px;
      border: 1px solid var(--dt-stroke-default);
      border-radius: 3px;
      font-size: 13px;
      font-family: Roboto, sans-serif;
      color: var(--dt-text-primary);
      box-sizing: border-box;
    }
    .field-input-sm:focus {
      outline: none;
      border-color: var(--dt-brand-accent);
    }
    .field-group {
      margin-bottom: 8px;
    }
    .field-label {
      display: block;
      font-size: 12px;
      color: var(--dt-text-secondary);
      margin-bottom: 4px;
    }
    .field-color {
      width: 48px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--dt-stroke-default);
      border-radius: 4px;
      cursor: pointer;
    }
  `],
})
export class BorderFieldsComponent {
  @Input() borderWidth = 1;
  @Input() borderColor = '#000000';
  @Input() borderRadius = 0;
  @Output() borderWidthChange = new EventEmitter<number>();
  @Output() borderColorChange = new EventEmitter<string>();
  @Output() borderRadiusChange = new EventEmitter<number>();
}
