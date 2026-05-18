import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="field-group">
      <label class="field-label">{{ label }}</label>
      <input type="color" [ngModel]="value" (ngModelChange)="valueChange.emit($event)" class="field-color" />
    </div>
  `,
  styles: [`
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
export class ColorFieldComponent {
  @Input() label = '';
  @Input() value = '#000000';
  @Output() valueChange = new EventEmitter<string>();
}
