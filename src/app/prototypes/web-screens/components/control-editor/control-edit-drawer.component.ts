import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInputComponent, UiConfirmDialogComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import {
  CSControl,
  ControlElement,
  ElementTypeOption,
  defaultLayout,
  defaultBorder,
  defaultFont,
} from '../../cs-types';

@Component({
  selector: 'app-control-edit-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInputComponent, UiConfirmDialogComponent, IconsModule],
  template: `
    <!-- Overlay -->
    <div *ngIf="open" class="drawer-overlay" (click)="cancel.emit()"></div>

    <!-- Drawer -->
    <div class="drawer" [class.drawer-open]="open">
      <div class="drawer-header">
        <h2 class="drawer-title">{{ control?.id ? control!.name : 'Новый контрол' }}</h2>
        <button class="app-btn-close" (click)="cancel.emit()">
          <lucide-icon name="x" [size]="20"></lucide-icon>
        </button>
      </div>

      <div class="drawer-body" *ngIf="control">
        <!-- Type badge -->
        <div class="field-row">
          <label class="field-label">Тип</label>
          <span class="type-badge" [class.type-animation]="control.type === 'animation'" [class.type-hint]="control.type === 'hint'">
            <span class="dot" [class.dot-blue]="control.type === 'animation'" [class.dot-orange]="control.type === 'hint'"></span>
            {{ control.type === 'animation' ? 'Анимация' : 'Подсказка' }}
          </span>
        </div>

        <!-- Name -->
        <div class="field-row">
          <label class="field-label">Название <span class="required">*</span></label>
          <ui-input
            placeholder="Введите название контрола"
            [(value)]="control.name"
            [error]="nameError"
          ></ui-input>
        </div>

        <!-- Preview Canvas -->
        <div class="field-row">
          <label class="field-label">Превью</label>
          <div class="preview-canvas">
            <div class="preview-canvas-inner">
              <div
                *ngFor="let elem of control.elements"
                class="preview-element"
                [style.left.px]="scaleX(elem.settings.layout.x)"
                [style.top.px]="scaleY(elem.settings.layout.y)"
                [style.width.px]="scaleX(elem.settings.layout.width)"
                [style.height.px]="scaleY(elem.settings.layout.height)"
                [style.background-color]="previewBgColor(elem)"
                [style.border]="previewBorder(elem)"
                [style.border-radius.px]="elem.settings.border.radius * previewScale"
                [style.z-index]="elem.settings.layout.zIndex"
                [style.transform]="'rotate(' + elem.settings.layout.rotation + 'deg)'"
                [style.opacity]="elem.settings.layout.bgOpacity / 100"
                [title]="elem.name"
              >
                <span class="preview-element-label" *ngIf="scaleX(elem.settings.layout.width) > 30 && scaleY(elem.settings.layout.height) > 14">
                  {{ elem.name | slice:0:12 }}
                </span>
              </div>
              <div *ngIf="control.elements.length === 0" class="preview-empty-hint">
                Нет элементов
              </div>
            </div>
          </div>
        </div>

        <!-- Elements section -->
        <div class="elements-section">
          <div class="elements-header">
            <span class="elements-title">Элементы ({{ control.elements.length }})</span>
            <div class="elements-actions">
              <div class="add-element-wrapper">
                <button class="app-btn app-btn-outline app-btn-sm" (click)="showDropdown = !showDropdown">
                  <lucide-icon name="plus" [size]="14"></lucide-icon>
                  Добавить элемент
                </button>
                <div class="element-dropdown" *ngIf="showDropdown">
                  <div class="element-dropdown-scroll">
                    <div
                      class="element-dropdown-item"
                      *ngFor="let el of availableElements"
                      (click)="addElement(el)"
                    >
                      <div class="element-dropdown-name">{{ el.name }}</div>
                      <div class="element-dropdown-desc">{{ el.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                class="app-btn app-btn-ghost app-btn-sm"
                [disabled]="control.elements.length === 0"
                (click)="clearElementsDialogOpen = true"
              >
                <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                Очистить
              </button>
            </div>
          </div>

          <!-- Element list -->
          <div class="element-list" *ngIf="control.elements.length > 0">
            <div class="element-row" *ngFor="let elem of control.elements; let i = index">
              <div class="element-row-header" (click)="toggleElement(elem.id)">
                <div class="element-row-left">
                  <lucide-icon [name]="expandedElementId === elem.id ? 'chevron-down' : 'chevron-right'" [size]="14" class="expand-icon"></lucide-icon>
                  <lucide-icon [name]="getElementIcon(elem.type)" [size]="16" class="element-icon"></lucide-icon>
                  <span class="element-name">{{ elem.name }}</span>
                  <span class="element-type-label">{{ elem.type }}</span>
                  <span class="element-required-badge" *ngIf="elem.isRequired">обяз.</span>
                </div>
                <button *ngIf="!elem.isRequired" class="element-delete-btn" (click)="removeElement(i); $event.stopPropagation()" title="Удалить элемент">
                  <lucide-icon name="x" [size]="14"></lucide-icon>
                </button>
              </div>

              <!-- Expanded settings -->
              <div class="element-settings" *ngIf="expandedElementId === elem.id">
                <!-- Layout -->
                <div class="settings-group">
                  <div class="settings-group-title">
                    <lucide-icon name="layout" [size]="13"></lucide-icon> Макет
                  </div>
                  <div class="settings-grid">
                    <div class="settings-field">
                      <label>Цвет фона</label>
                      <div class="color-input-row">
                        <input type="color" [(ngModel)]="elem.settings.layout.bgColor" class="color-swatch" />
                        <input type="text" [(ngModel)]="elem.settings.layout.bgColor" class="settings-input settings-input-text color-hex" />
                      </div>
                    </div>
                    <div class="settings-field">
                      <label>Прозрачность (%)</label>
                      <input type="number" [(ngModel)]="elem.settings.layout.bgOpacity" class="settings-input" min="0" max="100" />
                    </div>
                    <div class="settings-field"><label>X</label><input type="number" [(ngModel)]="elem.settings.layout.x" class="settings-input" /></div>
                    <div class="settings-field"><label>Y</label><input type="number" [(ngModel)]="elem.settings.layout.y" class="settings-input" /></div>
                    <div class="settings-field"><label>Ширина</label><input type="number" [(ngModel)]="elem.settings.layout.width" class="settings-input" /></div>
                    <div class="settings-field"><label>Высота</label><input type="number" [(ngModel)]="elem.settings.layout.height" class="settings-input" /></div>
                    <div class="settings-field"><label>Z-index</label><input type="number" [(ngModel)]="elem.settings.layout.zIndex" class="settings-input" /></div>
                    <div class="settings-field"><label>Поворот (°)</label><input type="number" [(ngModel)]="elem.settings.layout.rotation" class="settings-input" /></div>
                    <div class="settings-field settings-field-wide">
                      <label>Padding (T, R, B, L)</label>
                      <div class="padding-inputs">
                        <input type="number" [(ngModel)]="elem.settings.layout.padding[0]" class="settings-input" />
                        <input type="number" [(ngModel)]="elem.settings.layout.padding[1]" class="settings-input" />
                        <input type="number" [(ngModel)]="elem.settings.layout.padding[2]" class="settings-input" />
                        <input type="number" [(ngModel)]="elem.settings.layout.padding[3]" class="settings-input" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Border -->
                <div class="settings-group">
                  <div class="settings-group-title">
                    <lucide-icon name="square" [size]="13"></lucide-icon> Граница
                  </div>
                  <div class="settings-grid">
                    <div class="settings-field">
                      <label>Тип границы</label>
                      <select [(ngModel)]="elem.settings.border.type" class="settings-select">
                        <option *ngFor="let bt of borderTypes" [value]="bt.value">{{ bt.label }}</option>
                      </select>
                    </div>
                    <div class="settings-field"><label>Ширина (px)</label><input type="number" [(ngModel)]="elem.settings.border.width" class="settings-input" min="0" /></div>
                    <div class="settings-field">
                      <label>Цвет границы</label>
                      <div class="color-input-row">
                        <input type="color" [(ngModel)]="elem.settings.border.color" class="color-swatch" />
                        <input type="text" [(ngModel)]="elem.settings.border.color" class="settings-input settings-input-text color-hex" />
                      </div>
                    </div>
                    <div class="settings-field"><label>Скругление (px)</label><input type="number" [(ngModel)]="elem.settings.border.radius" class="settings-input" min="0" /></div>
                  </div>
                </div>

                <!-- Font -->
                <div class="settings-group" *ngIf="elem.settings.font">
                  <div class="settings-group-title">
                    <lucide-icon name="type" [size]="13"></lucide-icon> Шрифт
                  </div>
                  <div class="settings-grid">
                    <div class="settings-field">
                      <label>Цвет шрифта</label>
                      <div class="color-input-row">
                        <input type="color" [(ngModel)]="elem.settings.font!.color" class="color-swatch" />
                        <input type="text" [(ngModel)]="elem.settings.font!.color" class="settings-input settings-input-text color-hex" />
                      </div>
                    </div>
                    <div class="settings-field"><label>Размер (px)</label><input type="number" [(ngModel)]="elem.settings.font!.size" class="settings-input" min="1" /></div>
                    <div class="settings-field settings-field-wide">
                      <label>Семейство шрифта</label>
                      <select [(ngModel)]="elem.settings.font!.family" class="settings-select">
                        <option *ngFor="let ff of fontFamilies" [value]="ff">{{ ff }}</option>
                      </select>
                    </div>
                    <div class="settings-field settings-field-wide">
                      <label>Выравнивание</label>
                      <div class="toggle-group">
                        <button class="toggle-btn" [class.active]="elem.settings.font!.align === 'left'" (click)="elem.settings.font!.align = 'left'" title="По левому краю">
                          <lucide-icon name="align-left" [size]="14"></lucide-icon>
                        </button>
                        <button class="toggle-btn" [class.active]="elem.settings.font!.align === 'center'" (click)="elem.settings.font!.align = 'center'" title="По центру">
                          <lucide-icon name="align-center" [size]="14"></lucide-icon>
                        </button>
                        <button class="toggle-btn" [class.active]="elem.settings.font!.align === 'right'" (click)="elem.settings.font!.align = 'right'" title="По правому краю">
                          <lucide-icon name="align-right" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </div>
                    <div class="settings-field">
                      <label>Стиль</label>
                      <div class="toggle-group">
                        <button class="toggle-btn" [class.active]="elem.settings.font!.style === 'normal'" (click)="elem.settings.font!.style = 'normal'" title="Обычный">N</button>
                        <button class="toggle-btn" [class.active]="elem.settings.font!.style === 'italic'" (click)="elem.settings.font!.style = 'italic'" title="Курсив"><em>I</em></button>
                      </div>
                    </div>
                    <div class="settings-field">
                      <label>Начертание</label>
                      <div class="toggle-group">
                        <button class="toggle-btn" [class.active]="elem.settings.font!.weight === 'normal'" (click)="elem.settings.font!.weight = 'normal'" title="Обычный">N</button>
                        <button class="toggle-btn" [class.active]="elem.settings.font!.weight === 'bold'" (click)="elem.settings.font!.weight = 'bold'" title="Жирный"><strong>B</strong></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div class="elements-empty" *ngIf="control.elements.length === 0">
            <lucide-icon name="layers" [size]="32" class="text-gray-300"></lucide-icon>
            <span>Нет элементов</span>
            <span class="elements-empty-hint">Нажмите «Добавить элемент» чтобы начать</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="drawer-footer">
        <button class="app-btn app-btn-ghost" (click)="cancel.emit()">Отмена</button>
        <button class="app-btn app-btn-primary" (click)="onSave()">Сохранить</button>
      </div>
    </div>

    <!-- Clear elements confirm -->
    <ui-confirm-dialog
      [open]="clearElementsDialogOpen"
      title="Очистить элементы"
      message="Удалить все элементы из контрола? Обязательные элементы не будут удалены."
      confirmText="Очистить"
      cancelText="Отмена"
      variant="danger"
      (confirmed)="clearAllElements()"
      (cancelled)="clearElementsDialogOpen = false"
    ></ui-confirm-dialog>
  `,
  styles: [`
    :host { display: contents; }

    /* Drawer */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 100; animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 680px;
      background: #fff; z-index: 101; display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
      transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    }
    .drawer-open { transform: translateX(0); }
    .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #e0e0e0; }
    .drawer-title { font-size: 18px; font-weight: 500; color: #212121; margin: 0; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
    .drawer-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 24px; border-top: 1px solid #e0e0e0; background: #fafafa; }

    /* Buttons */
    .app-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0 14px; height: 34px; border: none; border-radius: 4px; font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .app-btn:disabled { opacity: 0.4; cursor: default; pointer-events: none; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }
    .app-btn-outline { background: transparent; color: #448aff; border: 1px solid #448aff; }
    .app-btn-outline:hover { background: #f0f6ff; }
    .app-btn-ghost { background: transparent; color: #616161; }
    .app-btn-ghost:hover { background: #f5f5f5; }
    .app-btn-sm { height: 30px; padding: 0 10px; font-size: 12px; }
    .app-btn-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 4px; background: transparent; color: #616161; cursor: pointer; transition: all 0.15s; }
    .app-btn-close:hover { background: #f5f5f5; color: #212121; }

    /* Fields */
    .field-row { margin-bottom: 16px; }
    .field-label { display: block; font-size: 12px; font-weight: 500; color: #757575; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
    .required { color: #e53935; }

    /* Type badge */
    .type-badge { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
    .type-animation { background: #e3f2fd; color: #1976d2; }
    .type-hint { background: #fff3e0; color: #e65100; }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .dot-blue { background: #448aff; }
    .dot-orange { background: #ff6d00; }

    /* Preview */
    .preview-canvas { width: 100%; height: 200px; background: #1a1a2e; border-radius: 6px; overflow: hidden; position: relative; border: 1px solid #e0e0e0; }
    .preview-canvas-inner { position: relative; width: 100%; height: 100%; }
    .preview-element { position: absolute; border-radius: 2px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-sizing: border-box; transition: all 0.15s ease; }
    .preview-element-label { font-size: 8px; color: rgba(255,255,255,0.85); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 2px; pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
    .preview-empty-hint { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.3); font-size: 13px; pointer-events: none; }

    /* Elements section */
    .elements-section { margin-top: 8px; }
    .elements-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .elements-title { font-size: 13px; font-weight: 500; color: #424242; text-transform: uppercase; letter-spacing: 0.3px; }
    .elements-actions { display: flex; gap: 6px; align-items: center; }
    .add-element-wrapper { position: relative; }
    .element-dropdown { position: absolute; top: 100%; left: 0; z-index: 50; margin-top: 4px; width: 320px; background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; box-shadow: 0 6px 16px rgba(0,0,0,0.12); animation: dropIn 0.15s ease-out; }
    @keyframes dropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .element-dropdown-scroll { max-height: 320px; overflow-y: auto; padding: 4px; }
    .element-dropdown-item { padding: 8px 12px; cursor: pointer; border-radius: 4px; transition: background 0.1s; }
    .element-dropdown-item:hover { background: #f5f5f5; }
    .element-dropdown-name { font-size: 13px; font-weight: 500; color: #212121; }
    .element-dropdown-desc { font-size: 11px; color: #9e9e9e; margin-top: 2px; }

    /* Element list */
    .element-list { display: flex; flex-direction: column; gap: 1px; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; }
    .element-row { background: #fafafa; }
    .element-row-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; cursor: pointer; transition: background 0.1s; user-select: none; }
    .element-row-header:hover { background: #f0f0f0; }
    .element-row-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .expand-icon { color: #9e9e9e; flex-shrink: 0; }
    .element-icon { color: #757575; flex-shrink: 0; }
    .element-name { font-size: 13px; font-weight: 500; color: #424242; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .element-type-label { font-size: 11px; color: #bdbdbd; flex-shrink: 0; }
    .element-required-badge { font-size: 9px; font-weight: 600; color: #e65100; background: #fff3e0; padding: 1px 5px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.3px; flex-shrink: 0; }
    .element-delete-btn { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border: none; border-radius: 4px; background: transparent; color: #bdbdbd; cursor: pointer; transition: all 0.15s; }
    .element-delete-btn:hover { background: #ffebee; color: #e53935; }

    /* Element settings */
    .element-settings { padding: 12px 12px 12px 36px; border-top: 1px solid #eeeeee; background: #fff; }
    .settings-group { margin-bottom: 14px; }
    .settings-group:last-child { margin-bottom: 0; }
    .settings-group-title { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .settings-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
    .settings-field label { display: block; font-size: 10px; color: #9e9e9e; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.3px; }
    .settings-field-wide { grid-column: span 2; }
    .settings-input { width: 100%; height: 28px; border: 1px solid #e0e0e0; border-radius: 3px; padding: 0 6px; font-size: 12px; font-family: Roboto, sans-serif; color: #424242; outline: none; transition: border-color 0.15s; background: #fff; box-sizing: border-box; }
    .settings-input:focus { border-color: #448aff; }
    .settings-input-text { min-width: 0; }
    .padding-inputs { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px; }
    .color-input-row { display: flex; gap: 4px; align-items: center; }
    .color-swatch { width: 28px; height: 28px; padding: 1px; border: 1px solid #e0e0e0; border-radius: 3px; cursor: pointer; background: none; flex-shrink: 0; }
    .color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
    .color-swatch::-webkit-color-swatch { border: none; border-radius: 2px; }
    .color-hex { flex: 1; font-family: 'Roboto Mono', monospace; font-size: 11px; }
    .settings-select { width: 100%; height: 28px; border: 1px solid #e0e0e0; border-radius: 3px; padding: 0 6px; font-size: 12px; font-family: Roboto, sans-serif; color: #424242; outline: none; transition: border-color 0.15s; background: #fff; cursor: pointer; box-sizing: border-box; -webkit-appearance: none; -moz-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239e9e9e'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; padding-right: 24px; }
    .settings-select:focus { border-color: #448aff; }
    .toggle-group { display: flex; gap: 2px; }
    .toggle-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 28px; border: 1px solid #e0e0e0; border-radius: 3px; background: #fff; color: #757575; cursor: pointer; font-size: 13px; font-family: Roboto, sans-serif; transition: all 0.15s; }
    .toggle-btn:hover { background: #f5f5f5; }
    .toggle-btn.active { background: #e3f2fd; border-color: #448aff; color: #1976d2; }
    .elements-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 32px 0; color: #bdbdbd; font-size: 13px; }
    .elements-empty-hint { font-size: 11px; color: #ccc; }
  `],
})
export class ControlEditDrawerComponent {
  @Input() open = false;
  @Input() control: CSControl | null = null;
  @Input() availableElements: ElementTypeOption[] = [];
  @Input() nameError = '';

  @Output() saved = new EventEmitter<CSControl>();
  @Output() cancel = new EventEmitter<void>();
  @Output() nameErrorChange = new EventEmitter<string>();

  expandedElementId: number | null = null;
  showDropdown = false;
  clearElementsDialogOpen = false;
  private nextElementId = 200;

  fontFamilies: string[] = ['Roboto', 'Arial', 'Open Sans', 'Montserrat', 'PT Sans', 'Inter'];
  borderTypes = [
    { value: 'none', label: 'Нет' },
    { value: 'solid', label: 'Сплошная' },
    { value: 'dashed', label: 'Пунктирная' },
    { value: 'dotted', label: 'Точечная' },
  ];

  private readonly PREVIEW_COLORS = [
    '#448aff', '#ff6d00', '#66bb6a', '#ab47bc', '#ef5350',
    '#26c6da', '#ffa726', '#78909c', '#ec407a', '#8d6e63',
  ];

  readonly canvasHeight = 480;
  get previewScale(): number { return 200 / this.canvasHeight; }

  scaleX(val: number): number { return val * this.previewScale; }
  scaleY(val: number): number { return val * this.previewScale; }

  previewBgColor(elem: ControlElement): string {
    const bg = elem.settings.layout.bgColor;
    if (bg && bg !== '#ffffff' && bg !== '#FFFFFF') return bg;
    return this.PREVIEW_COLORS[elem.id % this.PREVIEW_COLORS.length];
  }

  previewBorder(elem: ControlElement): string {
    const b = elem.settings.border;
    if (b.type === 'none' || b.width === 0) return 'none';
    const w = Math.max(1, b.width * this.previewScale);
    return `${w}px ${b.type} ${b.color}`;
  }

  toggleElement(id: number): void {
    this.expandedElementId = this.expandedElementId === id ? null : id;
  }

  addElement(opt: ElementTypeOption): void {
    if (!this.control) return;
    const elem: ControlElement = {
      id: this.nextElementId++,
      type: opt.type,
      name: opt.name,
      settings: {
        layout: defaultLayout(),
        border: defaultBorder(),
        ...(opt.isTextual ? { font: defaultFont() } : {}),
      },
    };
    this.control.elements = [...this.control.elements, elem];
    this.showDropdown = false;
    this.expandedElementId = elem.id;
  }

  removeElement(index: number): void {
    if (!this.control) return;
    const removed = this.control.elements[index];
    if (removed.isRequired) return;
    if (this.expandedElementId === removed.id) this.expandedElementId = null;
    this.control.elements = this.control.elements.filter((_, i) => i !== index);
  }

  clearAllElements(): void {
    if (!this.control) return;
    this.control.elements = this.control.elements.filter(e => e.isRequired);
    this.expandedElementId = null;
    this.clearElementsDialogOpen = false;
  }

  getElementIcon(type: string): string {
    const icons: Record<string, string> = {
      'area': 'square', 'text': 'type', 'image': 'image', 'product-image': 'image',
      'product-name': 'tag', 'full-product-name': 'tag', 'foreign-product-name': 'languages',
      'price': 'dollar-sign', 'product-description': 'align-left', 'foreign-product-description': 'align-left',
      'last-added-dish': 'utensils', 'quantity': 'hash', 'measurement-unit': 'ruler',
      'nutritional-value': 'heart', 'product-scale': 'maximize-2', 'hint-slogan': 'message-square',
      'hint-banner': 'image', 'discount-name': 'percent', 'discount-size': 'percent',
      'discounted-price': 'dollar-sign', 'old-price': 'dollar-sign',
    };
    return icons[type] || 'box';
  }

  onSave(): void {
    if (!this.control) return;
    if (!this.control.name.trim()) {
      this.nameError = 'Название обязательно';
      this.nameErrorChange.emit(this.nameError);
      return;
    }
    this.nameError = '';
    this.nameErrorChange.emit('');
    this.control.elementsCount = this.control.elements.length;
    this.saved.emit(this.control);
  }
}
