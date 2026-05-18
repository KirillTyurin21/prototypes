import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-font-fields',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="field-group">
      <label class="field-label">Семейство</label>
      <select class="field-select" [ngModel]="fontFamily" (ngModelChange)="fontFamilyChange.emit($event)">
        <option value="Arial">Arial</option>
        <option value="Roboto">Roboto</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
      </select>
    </div>
    <div class="fields-row">
      <div class="field-sm">
        <label>Размер</label>
        <input type="number" [ngModel]="fontSize" (ngModelChange)="fontSizeChange.emit($event)" class="field-input-sm" />
      </div>
    </div>
    <div class="fields-row" style="gap: 16px;">
      <label class="field-check">
        <input type="checkbox" [ngModel]="fontBold" (ngModelChange)="fontBoldChange.emit($event)" /> <strong>B</strong>
      </label>
      <label class="field-check">
        <input type="checkbox" [ngModel]="fontItalic" (ngModelChange)="fontItalicChange.emit($event)" /> <em>I</em>
      </label>
    </div>
    <div class="field-group" *ngIf="showColor">
      <label class="field-label">Цвет текста</label>
      <input type="color" [ngModel]="fontColor" (ngModelChange)="fontColorChange.emit($event)" class="field-color" />
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
    .field-select {
      width: 100%;
      height: 36px;
      padding: 0 8px;
      border: 1px solid var(--dt-stroke-default);
      border-radius: 4px;
      font-size: 14px;
      font-family: Roboto, sans-serif;
      color: var(--dt-text-primary);
      background: var(--dt-surface-primary);
      cursor: pointer;
      box-sizing: border-box;
    }
    .field-select:focus {
      outline: none;
      border-color: var(--dt-brand-accent);
    }
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
    .field-check {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      cursor: pointer;
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
export class FontFieldsComponent {
  @Input() fontFamily = 'Roboto';
  @Input() fontSize = 14;
  @Input() fontBold = false;
  @Input() fontItalic = false;
  @Input() fontColor = '#333333';
  @Input() showColor = false;
  @Output() fontFamilyChange = new EventEmitter<string>();
  @Output() fontSizeChange = new EventEmitter<number>();
  @Output() fontBoldChange = new EventEmitter<boolean>();
  @Output() fontItalicChange = new EventEmitter<boolean>();
  @Output() fontColorChange = new EventEmitter<string>();
}
