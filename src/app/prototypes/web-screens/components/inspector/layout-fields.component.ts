import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout-fields',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fields-row">
      <div class="field-sm">
        <label>X</label>
        <input type="number" [ngModel]="x" (ngModelChange)="xChange.emit($event)" class="field-input-sm" />
      </div>
      <div class="field-sm">
        <label>Y</label>
        <input type="number" [ngModel]="y" (ngModelChange)="yChange.emit($event)" class="field-input-sm" />
      </div>
    </div>
    <div class="fields-row">
      <div class="field-sm">
        <label>Ширина</label>
        <input type="number" [ngModel]="width" (ngModelChange)="widthChange.emit($event)" class="field-input-sm" />
      </div>
      <div class="field-sm">
        <label>Высота</label>
        <input type="number" [ngModel]="height" (ngModelChange)="heightChange.emit($event)" class="field-input-sm"
          [disabled]="heightDisabled" [class.disabled]="heightDisabled" />
      </div>
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
    .field-input-sm.disabled {
      opacity: 0.45;
      cursor: not-allowed;
      background: #f5f5f5;
    }
  `],
})
export class LayoutFieldsComponent {
  @Input() x = 0;
  @Input() y = 0;
  @Input() width = 0;
  @Input() height = 0;
  @Input() heightDisabled = false;
  @Output() xChange = new EventEmitter<number>();
  @Output() yChange = new EventEmitter<number>();
  @Output() widthChange = new EventEmitter<number>();
  @Output() heightChange = new EventEmitter<number>();
}
