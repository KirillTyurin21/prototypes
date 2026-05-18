import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiInputComponent,
  UiSelectComponent,
  UiCheckboxComponent,
  UiToggleComponent,
  UiBadgeComponent,
} from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { ThemeElement, getHintElements } from '../../cs-types';

@Component({
  selector: 'app-cs-theme-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInputComponent, UiSelectComponent, UiCheckboxComponent, UiToggleComponent, UiBadgeComponent, IconsModule],
  template: `
    <div class="panel-header">
      <span class="panel-title">Свойства</span>
    </div>

    <!-- No selection -->
    <div *ngIf="!element" class="settings-empty">
      <lucide-icon name="mouse-pointer-click" [size]="32" class="text-gray-300"></lucide-icon>
      <p>Выберите элемент на canvas или в дереве</p>
    </div>

    <!-- Element settings -->
    <div *ngIf="element" class="settings-scroll">
      <!-- Element name -->
      <div class="settings-section">
        <ui-input label="Название элемента" [(value)]="element.name"></ui-input>
        <div class="element-type-badge">
          <ui-badge variant="default">{{ getTypeName(element.type) }}</ui-badge>
        </div>
      </div>

      <!-- ── IMAGE settings ── -->
      <ng-container *ngIf="element.type === 'image'">
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('layout')">
            <span>Макет</span>
            <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('layout')">
            <ng-container *ngTemplateOutlet="layoutFields; context: { $implicit: asImage(element).layout }"></ng-container>
          </div>
        </div>
      </ng-container>

      <!-- ── TEXT settings ── -->
      <ng-container *ngIf="element.type === 'text'">
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('content')">
            <span>Содержимое</span>
            <lucide-icon [name]="isSectionOpen('content') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('content')">
            <ui-input label="Текст" [(value)]="asText(element).content"></ui-input>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('layout')">
            <span>Макет</span>
            <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('layout')">
            <ng-container *ngTemplateOutlet="layoutFields; context: { $implicit: asText(element).layout }"></ng-container>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('font')">
            <span>Шрифт</span>
            <lucide-icon [name]="isSectionOpen('font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('font')">
            <ng-container *ngTemplateOutlet="fontFields; context: { $implicit: ensureTextFont(element) }"></ng-container>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('align')">
            <span>Выравнивание</span>
            <lucide-icon [name]="isSectionOpen('align') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('align')">
            <div class="align-group">
              <button class="align-btn" [class.active]="getTextAlign(element) === 'left'" (click)="setTextAlign(element, 'left')">
                <lucide-icon name="align-left" [size]="16"></lucide-icon>
              </button>
              <button class="align-btn" [class.active]="getTextAlign(element) === 'center'" (click)="setTextAlign(element, 'center')">
                <lucide-icon name="align-center" [size]="16"></lucide-icon>
              </button>
              <button class="align-btn" [class.active]="getTextAlign(element) === 'right'" (click)="setTextAlign(element, 'right')">
                <lucide-icon name="align-right" [size]="16"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ── ADVERTISE settings ── -->
      <ng-container *ngIf="element.type === 'advertise'">
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('layout')">
            <span>Макет</span>
            <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('layout')">
            <ng-container *ngTemplateOutlet="layoutFields; context: { $implicit: asAdvertise(element).layout }"></ng-container>
          </div>
        </div>
      </ng-container>

      <!-- ── ANIMATION settings ── -->
      <ng-container *ngIf="element.type === 'animation'">
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('anim-display')">
            <span>Параметры отображения</span>
            <lucide-icon [name]="isSectionOpen('anim-display') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('anim-display')">
            <ui-toggle
              label="Скрывать по таймеру"
              [checked]="asAnimation(element).hideByTimer"
              (checkedChange)="asAnimation(element).hideByTimer = $event"
            ></ui-toggle>
            <div class="field-row">
              <ui-input label="Время показа (сек)" type="number" [value]="'' + asAnimation(element).displayTime" (valueChange)="asAnimation(element).displayTime = +$event"></ui-input>
              <ui-input label="Длительность анимации (сек)" type="number" [value]="'' + asAnimation(element).animationDuration" (valueChange)="asAnimation(element).animationDuration = +$event"></ui-input>
            </div>
            <ui-select label="Тип анимации" [options]="animationTypeOptions" [value]="asAnimation(element).animationType" (valueChange)="asAnimation(element).animationType = $event"></ui-select>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('anim-control')">
            <span>Контрол</span>
            <lucide-icon [name]="isSectionOpen('anim-control') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('anim-control')">
            <ui-select
              label="Контрол анимации"
              [options]="animationControlOptions"
              [value]="'' + asAnimation(element).controlId"
              (valueChange)="onAnimationControlChange($event)"
              placeholder="Выберите контрол..."
            ></ui-select>
          </div>
        </div>
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('layout')">
            <span>Макет</span>
            <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('layout')">
            <ng-container *ngTemplateOutlet="layoutFields; context: { $implicit: asAnimation(element).layout }"></ng-container>
          </div>
        </div>
      </ng-container>

      <!-- ── HINTS settings ── -->
      <ng-container *ngIf="element.type === 'hints'">
        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('hints-display')">
            <span>Параметры отображения</span>
            <lucide-icon [name]="isSectionOpen('hints-display') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('hints-display')">
            <ui-toggle
              label="Скрывать по таймеру"
              [checked]="asHints(element).settings.hideByTimer"
              (checkedChange)="asHints(element).settings.hideByTimer = $event"
            ></ui-toggle>
            <div class="field-row">
              <ui-input label="Время показа (сек)" type="number" [value]="'' + asHints(element).settings.displayTime" (valueChange)="asHints(element).settings.displayTime = +$event"></ui-input>
              <ui-input label="Длительность анимации (сек)" type="number" [value]="'' + asHints(element).settings.animationDuration" (valueChange)="asHints(element).settings.animationDuration = +$event"></ui-input>
            </div>
            <ui-select label="Тип анимации" [options]="animationTypeOptions" [value]="asHints(element).settings.animationType" (valueChange)="setHintsAnimationType($event)"></ui-select>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('hints-area')">
            <span>Область подсказок</span>
            <lucide-icon [name]="isSectionOpen('hints-area') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('hints-area')">
            <ui-select label="Режим отображения" [options]="[{value:'list',label:'Лист'}]" value="list" [disabled]="true"></ui-select>
            <ui-select label="Направление заполнения" [options]="fillDirectionOptions" [value]="asHints(element).settings.fillDirection" (valueChange)="setHintsFillDirection($event)"></ui-select>
            <div class="field-row">
              <ui-input label="Макс. столбцов" type="number" [value]="'' + asHints(element).settings.maxColumns" (valueChange)="asHints(element).settings.maxColumns = +$event"></ui-input>
              <ui-input label="Макс. подсказок" type="number" [value]="'' + asHints(element).settings.maxHintsVisible" (valueChange)="asHints(element).settings.maxHintsVisible = +$event"></ui-input>
            </div>
            <div class="field-row">
              <ui-input label="Отступ строк (px)" type="number" [value]="'' + asHints(element).settings.rowGap" (valueChange)="asHints(element).settings.rowGap = +$event"></ui-input>
              <ui-input label="Отступ столбцов (px)" type="number" [value]="'' + asHints(element).settings.columnGap" (valueChange)="asHints(element).settings.columnGap = +$event"></ui-input>
            </div>
            <ui-input label="Время жизни подсказки (сек)" type="number" [value]="'' + asHints(element).settings.hintLifetime" (valueChange)="asHints(element).settings.hintLifetime = +$event"></ui-input>
            <ui-select label="При удалении триггера" [options]="triggerRemovalOptions" [value]="asHints(element).settings.triggerRemovalBehavior" (valueChange)="setHintsTriggerRemoval($event)"></ui-select>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('hints-elements')">
            <span>Элементы ({{ asHints(element).elements.length }})</span>
            <lucide-icon [name]="isSectionOpen('hints-elements') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('hints-elements')">
            <div class="hint-add-row">
              <ui-select
                placeholder="Добавить элемент..."
                [options]="hintElementOptions"
                [value]="hintElementToAdd"
                (valueChange)="hintElementToAdd = $event"
              ></ui-select>
              <button class="app-btn app-btn-primary app-btn-sm" [disabled]="!hintElementToAdd" (click)="addHintElement()">
                <lucide-icon name="plus" [size]="14"></lucide-icon>
              </button>
            </div>
            <div *ngFor="let hel of asHints(element).elements; let hi = index" class="hint-el-item">
              <div class="hint-el-header" (click)="toggleHintElement(hi)">
                <span class="hint-el-name">{{ hel.name }}</span>
                <div class="hint-el-actions">
                  <button class="tree-delete" (click)="removeHintElement(hi, $event)">
                    <lucide-icon name="x" [size]="12"></lucide-icon>
                  </button>
                  <lucide-icon [name]="expandedHintElements[hi] ? 'chevron-up' : 'chevron-down'" [size]="14"></lucide-icon>
                </div>
              </div>
              <div class="hint-el-body" *ngIf="expandedHintElements[hi]">
                <p class="hint-el-type-label">Тип: {{ hel.type }}</p>
                <p class="hint-el-type-label text-xs text-gray-400">Настройки наследуются из контрола</p>
              </div>
            </div>
            <div *ngIf="asHints(element).elements.length === 0" class="tree-empty">
              Нет дочерних элементов
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('hints-layout')">
            <span>Макет</span>
            <lucide-icon [name]="isSectionOpen('hints-layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('hints-layout')">
            <div class="field-row">
              <ui-input label="X" type="number" [value]="'' + asHints(element).settings.layout.x" (valueChange)="asHints(element).settings.layout.x = +$event"></ui-input>
              <ui-input label="Y" type="number" [value]="'' + asHints(element).settings.layout.y" (valueChange)="asHints(element).settings.layout.y = +$event"></ui-input>
            </div>
            <div class="field-row">
              <ui-input label="Ширина" type="number" [value]="'' + asHints(element).settings.layout.width" (valueChange)="asHints(element).settings.layout.width = +$event"></ui-input>
              <ui-input label="Высота" type="number" [value]="'' + asHints(element).settings.layout.height" (valueChange)="asHints(element).settings.layout.height = +$event"></ui-input>
            </div>
            <div class="field-row-4">
              <ui-input label="Сверху" type="number" [value]="'' + asHints(element).settings.layout.padding[0]" (valueChange)="asHints(element).settings.layout.padding[0] = +$event"></ui-input>
              <ui-input label="Справа" type="number" [value]="'' + asHints(element).settings.layout.padding[1]" (valueChange)="asHints(element).settings.layout.padding[1] = +$event"></ui-input>
              <ui-input label="Снизу" type="number" [value]="'' + asHints(element).settings.layout.padding[2]" (valueChange)="asHints(element).settings.layout.padding[2] = +$event"></ui-input>
              <ui-input label="Слева" type="number" [value]="'' + asHints(element).settings.layout.padding[3]" (valueChange)="asHints(element).settings.layout.padding[3] = +$event"></ui-input>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('hints-control')">
            <span>Контрол подсказки</span>
            <lucide-icon [name]="isSectionOpen('hints-control') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('hints-control')">
            <ui-select
              label="Контрол подсказки"
              [options]="hintControlOptions"
              [value]="'' + (asHints(element).controlId || '')"
              (valueChange)="onHintControlChange($event)"
              placeholder="Выберите контрол..."
            ></ui-select>
            <p class="hint-note">Контрол определяет внешний вид каждой подсказки внутри области</p>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header" (click)="toggleSection('hints-border')">
            <span>Граница</span>
            <lucide-icon [name]="isSectionOpen('hints-border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
          </div>
          <div class="section-body" *ngIf="isSectionOpen('hints-border')">
            <div class="field-row">
              <ui-input label="Толщина" type="number" [value]="'' + asHints(element).settings.border.width" (valueChange)="asHints(element).settings.border.width = +$event"></ui-input>
              <ui-input label="Радиус" type="number" [value]="'' + asHints(element).settings.border.radius" (valueChange)="asHints(element).settings.border.radius = +$event"></ui-input>
            </div>
            <ui-input label="Цвет рамки" type="color" [value]="asHints(element).settings.border.color" (valueChange)="asHints(element).settings.border.color = $event"></ui-input>
            <div class="settings-subsection">
              <div class="subsection-title">
                <span>Тень</span>
                <ui-toggle
                  [checked]="asHints(element).settings.border.shadow.enabled"
                  (checkedChange)="asHints(element).settings.border.shadow.enabled = $event"
                ></ui-toggle>
              </div>
              <div *ngIf="asHints(element).settings.border.shadow.enabled" class="shadow-params">
                <div class="field-row">
                  <ui-input label="X смещение" type="number" [value]="'' + asHints(element).settings.border.shadow.x" (valueChange)="asHints(element).settings.border.shadow.x = +$event"></ui-input>
                  <ui-input label="Y смещение" type="number" [value]="'' + asHints(element).settings.border.shadow.y" (valueChange)="asHints(element).settings.border.shadow.y = +$event"></ui-input>
                </div>
                <div class="field-row">
                  <ui-input label="Размытие" type="number" [value]="'' + asHints(element).settings.border.shadow.blur" (valueChange)="asHints(element).settings.border.shadow.blur = +$event"></ui-input>
                  <div class="field-color">
                    <label class="field-color-label">Цвет тени</label>
                    <ui-input type="color" [value]="asHints(element).settings.border.shadow.color" (valueChange)="asHints(element).settings.border.shadow.color = $event"></ui-input>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>

    <!-- ─── Reusable Templates ─── -->
    <ng-template #layoutFields let-layout>
      <div class="field-row">
        <ui-input label="X" type="number" [value]="'' + layout.x" (valueChange)="layout.x = +$event"></ui-input>
        <ui-input label="Y" type="number" [value]="'' + layout.y" (valueChange)="layout.y = +$event"></ui-input>
      </div>
      <div class="field-row">
        <ui-input label="Ширина" type="number" [value]="'' + layout.width" (valueChange)="layout.width = +$event"></ui-input>
        <ui-input label="Высота" type="number" [value]="'' + layout.height" (valueChange)="layout.height = +$event"></ui-input>
      </div>
    </ng-template>

    <ng-template #fontFields let-font>
      <ui-input label="Семейство шрифта" [value]="font.family" (valueChange)="font.family = $event"></ui-input>
      <ui-input label="Размер" type="number" [value]="'' + font.size" (valueChange)="font.size = +$event"></ui-input>
      <div class="field-row">
        <ui-checkbox label="Жирный" [checked]="font.bold" (checkedChange)="font.bold = $event"></ui-checkbox>
        <ui-checkbox label="Курсив" [checked]="font.italic" (checkedChange)="font.italic = $event"></ui-checkbox>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; overflow: hidden; height: 100%; }
    .panel-header { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; background: #fff; }
    .panel-title { font-size: 13px; font-weight: 600; color: #424242; text-transform: uppercase; letter-spacing: 0.5px; }

    .settings-empty {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 12px; color: #9e9e9e; font-size: 13px; padding: 24px;
    }
    .settings-scroll { flex: 1; overflow-y: auto; padding: 0; }
    .settings-section { border-bottom: 1px solid #f0f0f0; padding: 10px 12px; }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      cursor: pointer; font-size: 12px; font-weight: 600; color: #616161;
      text-transform: uppercase; letter-spacing: 0.4px; padding: 4px 0; user-select: none;
    }
    .section-header:hover { color: #1976D2; }
    .section-body { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }

    .field-row { display: flex; gap: 8px; }
    .field-row > * { flex: 1; }
    .field-row-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
    .element-type-badge { margin-top: 6px; }

    .align-group { display: flex; gap: 2px; }
    .align-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 30px; border: 1px solid #e0e0e0;
      background: #fff; cursor: pointer; border-radius: 4px;
      color: #757575; transition: all 0.15s;
    }
    .align-btn:hover { background: #f5f5f5; }
    .align-btn.active { background: #e3f2fd; color: #1976D2; border-color: #90caf9; }

    .hint-add-row { display: flex; gap: 6px; align-items: flex-end; }
    .hint-add-row ui-select { flex: 1; }
    .hint-el-item { border: 1px solid #f0f0f0; border-radius: 4px; margin-top: 6px; overflow: hidden; }
    .hint-el-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 8px; background: #fafafa; cursor: pointer;
      font-size: 12px; font-weight: 500; color: #424242;
    }
    .hint-el-header:hover { background: #f0f0f0; }
    .hint-el-actions { display: flex; align-items: center; gap: 4px; }
    .hint-el-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .hint-el-body { padding: 8px; font-size: 12px; }
    .hint-el-type-label { margin: 0 0 4px; color: #757575; font-size: 11px; }
    .hint-note { font-size: 11px; color: #9e9e9e; margin: 4px 0 0; line-height: 1.4; }

    .tree-delete {
      display: flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border: none; background: transparent;
      color: #bdbdbd; cursor: pointer; border-radius: 3px;
    }
    .tree-delete:hover { background: #ffebee; color: #e53935; }
    .tree-empty { padding: 16px 12px; text-align: center; font-size: 12px; color: #9e9e9e; }

    .settings-subsection { margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0; }
    .subsection-title {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 12px; font-weight: 500; color: #616161; margin-bottom: 8px;
    }
    .shadow-params { display: flex; flex-direction: column; gap: 8px; }
    .field-color { display: flex; flex-direction: column; flex: 1; }
    .field-color-label { font-size: 11px; color: #9e9e9e; margin-bottom: 4px; }

    .app-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 10px; height: 30px; border: none; border-radius: 4px;
      font-size: 12px; font-weight: 500; font-family: Roboto, sans-serif;
      cursor: pointer; white-space: nowrap;
    }
    .app-btn:disabled { opacity: 0.4; cursor: default; pointer-events: none; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }
    .app-btn-sm { height: 30px; padding: 0 10px; font-size: 12px; }
  `],
})
export class CsThemeInspectorComponent {
  @Input() element: ThemeElement | null = null;
  @Input() animationTypeOptions: SelectOption[] = [];
  @Input() animationControlOptions: SelectOption[] = [];
  @Input() hintControlOptions: SelectOption[] = [];
  @Input() hintElementOptions: SelectOption[] = [];
  @Input() fillDirectionOptions: SelectOption[] = [];
  @Input() triggerRemovalOptions: SelectOption[] = [];
  @Input() typeNames: { type: string; name: string }[] = [];

  expandedHintElements: Record<number, boolean> = {};
  hintElementToAdd = '';

  private openSections: Set<string> = new Set([
    'layout', 'content', 'font', 'align',
    'anim-display', 'anim-control',
    'hints-display', 'hints-area', 'hints-control', 'hints-elements', 'hints-layout', 'hints-border',
  ]);

  isSectionOpen(key: string): boolean { return this.openSections.has(key); }

  toggleSection(key: string): void {
    if (this.openSections.has(key)) this.openSections.delete(key);
    else this.openSections.add(key);
  }

  getTypeName(type: string): string {
    return this.typeNames.find(t => t.type === type)?.name ?? type;
  }

  // Type casters
  asImage(el: ThemeElement): any { return el; }
  asText(el: ThemeElement): any { return el; }
  asAnimation(el: ThemeElement): any { return el; }
  asHints(el: ThemeElement): any { return el; }
  asAdvertise(el: ThemeElement): any { return el; }

  ensureTextFont(el: ThemeElement): any {
    const t = el as any;
    if (!t.font) t.font = { family: 'Roboto', size: 14, bold: false, italic: false };
    return t.font;
  }

  getTextAlign(el: ThemeElement): string {
    return (el as any).align ?? 'left';
  }

  setTextAlign(el: ThemeElement, align: string): void {
    (el as any).align = align;
  }

  onAnimationControlChange(val: string): void {
    if (this.element?.type === 'animation') {
      (this.element as any).controlId = +val || 0;
    }
  }

  setHintsAnimationType(val: string): void {
    if (this.element?.type === 'hints') {
      (this.element as any).settings.animationType = val;
    }
  }

  setHintsFillDirection(val: string): void {
    if (this.element?.type === 'hints') {
      (this.element as any).settings.fillDirection = val;
    }
  }

  setHintsTriggerRemoval(val: string): void {
    if (this.element?.type === 'hints') {
      (this.element as any).settings.triggerRemovalBehavior = val;
    }
  }

  onHintControlChange(val: string): void {
    if (this.element?.type === 'hints') {
      (this.element as any).controlId = +val || null;
    }
  }

  toggleHintElement(index: number): void {
    this.expandedHintElements[index] = !this.expandedHintElements[index];
  }

  addHintElement(): void {
    if (!this.hintElementToAdd || !this.element || this.element.type !== 'hints') return;
    const hintEl = this.asHints(this.element);
    const opt = getHintElements().find((e: any) => e.type === this.hintElementToAdd);
    if (!opt) return;
    const newId = hintEl.elements.length > 0 ? Math.max(...hintEl.elements.map((e: any) => e.id)) + 1 : 1;
    hintEl.elements.push({ id: newId, type: opt.type, name: opt.name });
    this.hintElementToAdd = '';
  }

  removeHintElement(index: number, event: Event): void {
    event.stopPropagation();
    if (!this.element || this.element.type !== 'hints') return;
    this.asHints(this.element).elements.splice(index, 1);
    delete this.expandedHintElements[index];
  }
}
