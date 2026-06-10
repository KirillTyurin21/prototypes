import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { CsDataService } from '../cs-data.service';
import {
  CSTheme,
  ThemeElement,
  DEFAULT_HINT_AREA,
  THEME_ELEMENT_TYPES,
  getHintElements,
} from '../cs-types';
import { CsThemeInspectorComponent } from '../components/theme-editor/cs-theme-inspector.component';
import { ElementTypeOption } from '../components/theme-editor/element-tree-panel.component';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Component({
  selector: 'app-theme-editor-screen',
  standalone: true,
  imports: [
    CommonModule, FormsModule, UiConfirmDialogComponent,
    IconsModule, CsThemeInspectorComponent,
  ],
  template: `
    <div class="editor-layout" *ngIf="theme">
      <!-- Toast -->
      <div *ngIf="toastMessage" class="toast">
        <lucide-icon name="check-circle-2" [size]="16"></lucide-icon>
        {{ toastMessage }}
      </div>

      <!-- Main: preview (left) + panel (right) -->
      <div class="editor-body">
        <!-- LEFT: Preview -->
        <div class="preview-column">
          <!-- Closed mode overlay -->
          <div *ngIf="theme.screenMode === 'closed'" class="closed-mode-overlay">
            <lucide-icon name="alert-circle" [size]="56" class="closed-icon"></lucide-icon>
            <div class="closed-title">Режим: Касса не работает</div>
            <div class="closed-sub" *ngIf="getSelectedCampaignName() as cn">Кампания: {{ cn }}</div>
            <div class="closed-sub muted" *ngIf="!getSelectedCampaignName()">Кампания не выбрана — пустой экран</div>
          </div>
          <!-- Receipt preview for order modes -->
          <div *ngIf="theme.screenMode !== 'closed'" class="receipt-preview">
            <div class="rpt-advertise" *ngIf="hasElementType('advertise')">Здесь может быть ваше изображение или видео</div>
            <div class="rpt-row" *ngIf="hasElementType('text')">
              <span class="rpt-label">Итого:</span>
              <span class="rpt-value">950,00 ₽</span>
            </div>
            <div class="rpt-row" *ngIf="hasElementType('text')">
              <span class="rpt-label">Скидка:</span>
              <span class="rpt-value">50,00 ₽</span>
            </div>
            <div class="rpt-table-header">
              <span>Сумма</span><span>Кол-во</span><span>Наименование</span>
            </div>
            <div class="rpt-table">
              <div class="rpt-item" *ngFor="let item of mockOrderItems">
                <span class="rpt-name">{{ item.name }}</span>
                <span class="rpt-qty">{{ item.qty }}</span>
                <span class="rpt-price">{{ item.price }}</span>
              </div>
            </div>
            <!-- Canvas elements shown as overlay blocks -->
            <div *ngFor="let el of visiblePreviewElements" class="rpt-element-badge"
              [class.selected]="selectedElementId === el.id"
              (click)="selectElement(el.id)">
              <lucide-icon [name]="getElIcon(el.type)" [size]="14"></lucide-icon>
              {{ el.name }}
            </div>
          </div>
        </div>

        <!-- RIGHT: Control panel -->
        <div class="control-panel">
          <!-- Panel header -->
          <div class="panel-header" (click)="panelCollapsed = !panelCollapsed">
            <span>Панель управления</span>
            <lucide-icon [name]="panelCollapsed ? 'chevron-right' : 'chevron-down'" [size]="18"></lucide-icon>
          </div>
          <div *ngIf="!panelCollapsed" class="panel-body">
            <!-- Breadcrumb -->
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon>
              <span class="bc-link" (click)="deselectElement()">Тема</span>
            </div>

            <!-- Theme name -->
            <div class="field-group">
              <label class="field-label">Имя темы</label>
              <input class="field-input" [(ngModel)]="theme.name" />
            </div>

            <!-- Resolution -->
            <div class="field-group">
              <label class="field-label">Разрешение</label>
              <select class="field-select" [(ngModel)]="theme.resolution">
                <option *ngFor="let r of resolutionOptions" [value]="r.value">{{ r.label }}</option>
              </select>
            </div>

            <!-- Mode divider + selector -->
            <div class="section-divider">Настройка режима</div>
            <div class="field-group">
              <select class="field-select" [(ngModel)]="theme.screenMode" (ngModelChange)="onScreenModeChange()">
                <option *ngFor="let m of screenModeOptions" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>

            <!-- Campaign selector (only for closed mode) -->
            <div class="field-group" *ngIf="theme.screenMode === 'closed'">
              <label class="field-label">Кампания</label>
              <select class="field-select" [(ngModel)]="theme.closedModeCampaignId">
                <option [ngValue]="null">Не выбрана</option>
                <option *ngFor="let c of campaignOptions" [ngValue]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Elements divider + list -->
            <div class="section-divider">Элементы</div>
            <button class="btn-add-el" (click)="toggleAddElement()">
              <lucide-icon name="plus" [size]="14"></lucide-icon>
              Добавить элемент
            </button>

            <!-- Element list -->
            <div class="element-list">
              <div *ngFor="let el of theme.elements" class="el-item"
                [class.active]="selectedElementId === el.id"
                (click)="selectElement(el.id)">
                <lucide-icon [name]="getElIcon(el.type)" [size]="18" class="el-icon"></lucide-icon>
                <span class="el-name">{{ el.name }}</span>
                <button class="el-btn el-vis" title="Видимость" (click)="$event.stopPropagation()">
                  <lucide-icon name="eye" [size]="16"></lucide-icon>
                </button>
                <button class="el-btn el-del" title="Удалить" (click)="confirmDeleteElement(el); $event.stopPropagation()">
                  <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                </button>
                <button class="el-btn el-drag" title="Переместить" (click)="$event.stopPropagation()">
                  <lucide-icon name="chevrons-up-down" [size]="14"></lucide-icon>
                </button>
              </div>
              <div *ngIf="theme.elements.length === 0" class="el-empty">Нет элементов</div>
            </div>

            <!-- Add element flyout -->
            <div *ngIf="showAddElement" class="add-el-flyout">
              <div class="add-el-header">
                <span>Добавить элемент</span>
                <button class="icon-btn-sm" (click)="showAddElement = false">
                  <lucide-icon name="x" [size]="18"></lucide-icon>
                </button>
              </div>
              <div *ngFor="let opt of elementTypeOptions" class="add-el-option"
                [class.disabled]="opt.disabled" (click)="addElement(opt); showAddElement = false">
                <lucide-icon [name]="getElIcon(opt.type)" [size]="16"></lucide-icon>
                <span>{{ opt.label }}</span>
              </div>
            </div>

            <!-- Element inspector (when element selected) -->
            <ng-container *ngIf="selectedElement">
              <div class="section-divider">Свойства</div>
              <app-cs-theme-inspector
                [element]="selectedElement"
                [animationTypeOptions]="animationTypeOptions"
                [animationControlOptions]="animationControlOptions"
                [hintControlOptions]="hintControlOptions"
                [hintElementOptions]="hintElementOptions"
                [fillDirectionOptions]="fillDirectionOptions"
                [triggerRemovalOptions]="triggerRemovalOptions"
                [typeNames]="typeNames"
              ></app-cs-theme-inspector>
            </ng-container>
          </div>

          <!-- Panel footer -->
          <div class="panel-footer">
            <button class="btn-save" (click)="saveAndClose()">СОХРАНИТЬ</button>
            <button class="btn-back" (click)="navigateBack()">НАЗАД</button>
          </div>
        </div>
      </div>

      <!-- Delete confirm -->
      <ui-confirm-dialog
        [open]="deleteElementDialogOpen"
        title="Удаление элемента"
        [message]="'Удалить элемент «' + (elementToDelete?.name || '') + '»?'"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
        (confirmed)="deleteElement()"
        (cancelled)="deleteElementDialogOpen = false"
      ></ui-confirm-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: Roboto, sans-serif; height: 100%; }
    .editor-layout { display: flex; flex-direction: column; height: calc(100vh - 110px); margin: -20px -24px; position: relative; animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .toast { position: fixed; top: 20px; right: 20px; z-index: 200; display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 6px; background: #323232; color: #fff; font-size: 13px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.2); animation: toastIn 0.3s ease-out; }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

    .editor-body { display: flex; flex: 1; overflow: hidden; }

    /* ── Preview column (left) ── */
    .preview-column { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; background: #e0e0e0; overflow: auto; padding: 32px; }

    .closed-mode-overlay { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; width: 100%; max-width: 600px; aspect-ratio: 16/9; background: #263238; border-radius: 8px; color: #fff; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .closed-icon { color: #ff9800; }
    .closed-title { font-size: 20px; font-weight: 500; }
    .closed-sub { font-size: 14px; color: #b0bec5; }
    .closed-sub.muted { color: #78909c; font-style: italic; }

    .receipt-preview { width: 100%; max-width: 600px; background: #fff; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 24px; position: relative; }
    .rpt-advertise { border: 2px dashed #e0e0e0; border-radius: 6px; padding: 24px; text-align: center; color: #9e9e9e; font-size: 14px; margin-bottom: 16px; }
    .rpt-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .rpt-label { color: #757575; }
    .rpt-value { font-weight: 600; color: #212121; }
    .rpt-table-header { display: grid; grid-template-columns: 1fr 80px 120px; gap: 8px; margin: 12px 0 6px; font-size: 12px; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.5px; }
    .rpt-table { display: flex; flex-direction: column; gap: 4px; }
    .rpt-item { display: grid; grid-template-columns: 1fr 80px 120px; gap: 8px; font-size: 13px; color: #424242; padding: 3px 0; border-bottom: 1px solid #f5f5f5; }
    .rpt-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rpt-qty { text-align: center; }
    .rpt-price { text-align: right; }
    .rpt-element-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; margin: 2px; background: #e3f2fd; border: 1px solid #90caf9; border-radius: 4px; font-size: 11px; color: #1565c0; cursor: pointer; }
    .rpt-element-badge:hover { background: #bbdefb; }
    .rpt-element-badge.selected { background: #1565c0; color: #fff; border-color: #1565c0; }

    /* ── Control panel (right) ── */
    .control-panel { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background: #fff; border-left: 1px solid #e0e0e0; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; font-size: 15px; font-weight: 500; color: #333; border-bottom: 1px solid #e0e0e0; cursor: pointer; user-select: none; flex-shrink: 0; }
    .panel-header:hover { background: #fafafa; }
    .panel-body { flex: 1; overflow-y: auto; padding: 16px; }
    .panel-footer { display: flex; gap: 12px; padding: 12px 16px; border-top: 1px solid #e0e0e0; flex-shrink: 0; }
    .btn-save { flex: 1; height: 36px; border: 2px solid #616161; border-radius: 4px; background: transparent; color: #333; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-save:hover { background: #f5f5f5; }
    .btn-back { flex: 1; height: 36px; border: none; border-radius: 4px; background: #ff9800; color: #fff; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-back:hover { background: #f57c00; }

    .panel-breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; font-size: 14px; }
    .bc-home { color: #ff6d00; cursor: pointer; }
    .bc-link { color: #ff6d00; cursor: pointer; font-weight: 500; }
    .bc-link:hover { text-decoration: underline; }

    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input { width: 100%; height: 36px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: #333; box-sizing: border-box; }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-select { width: 100%; height: 36px; padding: 0 8px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: #333; background: #fff; cursor: pointer; box-sizing: border-box; }
    .field-select:focus { outline: none; border-color: #448aff; }

    .section-divider { position: relative; text-align: center; margin: 20px 0 12px; font-size: 12px; font-weight: 500; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-divider::before, .section-divider::after { content: ''; position: absolute; top: 50%; width: calc(50% - 60px); height: 1px; background: #e0e0e0; }
    .section-divider::before { left: 0; } .section-divider::after { right: 0; }

    .btn-add-el { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px dashed #bdbdbd; border-radius: 4px; background: none; font-size: 13px; color: #616161; cursor: pointer; width: 100%; margin-bottom: 12px; font-family: Roboto, sans-serif; }
    .btn-add-el:hover { background: #f5f5f5; border-color: #9e9e9e; }

    .element-list { display: flex; flex-direction: column; gap: 2px; }
    .el-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 4px; cursor: pointer; transition: background 0.1s; font-size: 13px; }
    .el-item:hover { background: #f5f5f5; }
    .el-item.active { background: #e3f2fd; }
    .el-icon { color: #757575; flex-shrink: 0; }
    .el-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #424242; }
    .el-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; background: none; border-radius: 4px; cursor: pointer; color: #9e9e9e; flex-shrink: 0; }
    .el-btn:hover { color: #616161; background: rgba(0,0,0,0.05); }
    .el-del:hover { color: #f44336; }
    .el-empty { padding: 16px; text-align: center; color: #bdbdbd; font-size: 13px; }

    .add-el-flyout { margin-top: 8px; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; }
    .add-el-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #fafafa; font-size: 13px; font-weight: 500; border-bottom: 1px solid #e0e0e0; }
    .icon-btn-sm { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; background: none; border-radius: 4px; cursor: pointer; color: #757575; }
    .icon-btn-sm:hover { background: rgba(0,0,0,0.06); }
    .add-el-option { display: flex; align-items: center; gap: 8px; padding: 10px 12px; cursor: pointer; font-size: 13px; color: #424242; transition: background 0.1s; }
    .add-el-option:hover { background: #f5f5f5; }
    .add-el-option.disabled { opacity: 0.4; cursor: default; pointer-events: none; }
  `],
})
export class ThemeEditorScreenComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(CsDataService);

  Math = Math;

  theme: CSTheme | null = null;
  selectedElementId: number | null = null;
  deleteElementDialogOpen = false;
  elementToDelete: ThemeElement | null = null;
  toastMessage = '';
  panelCollapsed = false;
  showAddElement = false;
  private toastTimer: any;
  private nextElementId = 100;

  mockOrderItems = [
    { name: '#41 Long Black', qty: 1, price: '1.5' },
    { name: '#14 Cortado', qty: 1, price: '1.5' },
    { name: '#0 Affogato', qty: 1, price: '1.5' },
    { name: '#48 Caffe Mocha', qty: 1, price: '3.45' },
    { name: '#32 Mazagran', qty: 1, price: '1.5' },
    { name: '#7 Caffe Mocha', qty: 1, price: '1.5' },
    { name: '#54 Cinnamon Dolce Latte', qty: 2, price: '7.3' },
  ];

  // Options for inspector
  elementTypeOptions: ElementTypeOption[] = [];
  resolutionOptions = [
    { value: '1024x768', label: '1024px / 768px' },
    { value: '1280x720', label: '1280px / 720px' },
    { value: '1920x1080', label: '1920px / 1080px' },
  ];
  screenModeOptions = [
    { value: 'order', label: 'Экран заказа' },
    { value: 'idle', label: 'Режим ожидания' },
    { value: 'total', label: 'Экран оплаты' },
    { value: 'finish', label: 'Экран завершения' },
    { value: 'closed', label: 'Касса не работает' },
  ];
  campaignOptions: { id: number; name: string }[] = [];
  animationTypeOptions: SelectOption[] = [
    { value: 'fadeIn', label: 'Fade In' },
    { value: 'slideLeft', label: 'Slide Left' },
    { value: 'slideRight', label: 'Slide Right' },
    { value: 'slideUp', label: 'Slide Up' },
    { value: 'slideDown', label: 'Slide Down' },
    { value: 'none', label: 'Без анимации' },
  ];
  fillDirectionOptions: SelectOption[] = [
    { value: 'horizontal', label: 'Горизонтально' },
    { value: 'vertical', label: 'Вертикально' },
  ];
  triggerRemovalOptions: SelectOption[] = [
    { value: 'remove', label: 'Убрать подсказку' },
    { value: 'keepUntilOrderEnd', label: 'Оставить до конца заказа' },
  ];
  animationControlOptions: SelectOption[] = [];
  hintControlOptions: SelectOption[] = [];
  hintElementOptions: SelectOption[] = [];
  typeNames: { type: string; name: string }[] = [];

  get selectedElement(): ThemeElement | null {
    if (!this.theme || this.selectedElementId == null) return null;
    return this.theme.elements.find(e => e.id === this.selectedElementId) ?? null;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = this.dataService.themes.find(t => t.id === id);
    if (!found) { this.navigateBack(); return; }
    this.theme = deepClone(found);
    // Defaults for new fields (migration)
    if (!this.theme.resolution) this.theme.resolution = '1920x1080';
    if (!this.theme.screenMode) this.theme.screenMode = 'order';
    if (this.theme.closedModeCampaignId === undefined) this.theme.closedModeCampaignId = null;
    this.nextElementId = Math.max(100, ...this.theme.elements.map(e => e.id)) + 1;
    this.buildElementTypeOptions();
    this.animationControlOptions = this.dataService.controls.filter(c => c.type === 'animation').map(c => ({ value: '' + c.id, label: c.name }));
    this.hintControlOptions = this.dataService.controls.filter(c => c.type === 'hint').map(c => ({ value: '' + c.id, label: c.name }));
    this.hintElementOptions = getHintElements().map(e => ({ value: e.type, label: e.name }));
    this.typeNames = THEME_ELEMENT_TYPES.map(t => ({ type: t.type, name: t.name }));
    this.campaignOptions = this.dataService.campaigns.map(c => ({ id: c.id, name: c.name }));
  }

  navigateBack(): void {
    this.router.navigate(['/prototype/web-screens/themes-cs']);
  }

  onScreenModeChange(): void {
    // При переключении на «Касса не работает» сбрасываем кампанию если не выбрана
    if (this.theme && this.theme.screenMode === 'closed' && this.theme.closedModeCampaignId === undefined) {
      this.theme.closedModeCampaignId = null;
    }
  }

  deselectElement(): void {
    this.selectedElementId = null;
  }

  selectElement(id: number): void {
    this.selectedElementId = this.selectedElementId === id ? null : id;
  }

  toggleAddElement(): void {
    this.showAddElement = !this.showAddElement;
  }

  hasElementType(type: string): boolean {
    return !!this.theme?.elements.some(e => e.type === type);
  }

  get visiblePreviewElements(): ThemeElement[] {
    return this.theme?.elements.filter(e => e.type !== 'hints') ?? [];
  }

  getElIcon(type: string): string {
    const map: Record<string, string> = {
      image: 'image', text: 'type', animation: 'play',
      hints: 'lightbulb', advertise: 'monitor-play',
    };
    return map[type] ?? 'square';
  }

  // ── Element tree operations ─────────────────

  private buildElementTypeOptions(): void {
    this.elementTypeOptions = THEME_ELEMENT_TYPES.map(t => {
      const alreadyAdded = t.singular && this.theme!.elements.some(e => e.type === t.type);
      return { type: t.type, label: t.name, icon: t.icon, disabled: alreadyAdded };
    });
  }

  addElement(opt: ElementTypeOption): void {
    if (opt.disabled || !this.theme) return;
    const id = this.nextElementId++;
    let newEl: ThemeElement;
    switch (opt.type) {
      case 'image':
        newEl = { id, type: 'image', name: 'Изображение ' + id, layout: { x: 100, y: 100, width: 400, height: 300 } };
        break;
      case 'text':
        newEl = { id, type: 'text', name: 'Текст ' + id, content: 'Текст', layout: { x: 100, y: 100, width: 300, height: 50 } };
        break;
      case 'animation': {
        const ctrl = this.dataService.controls.find(c => c.type === 'animation');
        newEl = { id, type: 'animation', name: 'Анимации', controlId: ctrl?.id ?? 0, controlName: ctrl?.name ?? '', hideByTimer: true, displayTime: 5, animationDuration: 0.3, animationType: 'fadeIn', layout: { x: 600, y: 100, width: 400, height: 300 } };
        break;
      }
      case 'hints':
        newEl = { id, type: 'hints', name: 'Подсказки', settings: deepClone(DEFAULT_HINT_AREA), elements: [] };
        break;
      case 'advertise':
        newEl = { id, type: 'advertise', name: 'Рекламный блок ' + id, layout: { x: 50, y: 400, width: 600, height: 200 } };
        break;
      default: return;
    }
    this.theme.elements.push(newEl);
    this.theme.elementsCount = this.theme.elements.length;
    this.selectedElementId = id;
    this.buildElementTypeOptions();
  }

  confirmDeleteElement(el: ThemeElement): void {
    this.elementToDelete = el;
    this.deleteElementDialogOpen = true;
  }

  deleteElement(): void {
    if (!this.theme || !this.elementToDelete) return;
    this.theme.elements = this.theme.elements.filter(e => e.id !== this.elementToDelete!.id);
    this.theme.elementsCount = this.theme.elements.length;
    if (this.selectedElementId === this.elementToDelete.id) this.selectedElementId = null;
    this.deleteElementDialogOpen = false;
    this.elementToDelete = null;
    this.buildElementTypeOptions();
  }

  // ── Canvas helpers ──────────────────────────

  getSelectedCampaignName(): string | null {
    if (!this.theme?.closedModeCampaignId) return null;
    const c = this.campaignOptions.find(o => o.id === this.theme!.closedModeCampaignId);
    return c?.name ?? null;
  }

  getElementLayout(el: ThemeElement): { x: number; y: number; width: number; height: number } {
    if (el.type === 'hints') return el.settings.layout;
    return (el as any).layout ?? { x: 0, y: 0, width: 200, height: 100 };
  }

  getElementBorderRadius(el: ThemeElement): number {
    if (el.type === 'hints') return el.settings.border.radius;
    return 3;
  }

  getElementShadow(el: ThemeElement): string {
    if (el.type === 'hints' && el.settings.border.shadow.enabled) {
      const s = el.settings.border.shadow;
      return `${s.x}px ${s.y}px ${s.blur}px ${s.color}`;
    }
    return 'none';
  }

  getHintSlots(el: ThemeElement): { w: number; h: number }[] {
    if (el.type !== 'hints') return [];
    const s = el.settings;
    const maxCols = s.maxColumns || 1;
    const maxHints = s.maxHintsVisible || 3;
    const gap = s.columnGap || 8;
    const rowGap = s.rowGap || 8;
    const pad = s.layout.padding;
    const innerW = s.layout.width - pad[1] - pad[3];
    const innerH = s.layout.height - pad[0] - pad[2];
    const slotW = (innerW - (maxCols - 1) * gap) / maxCols;
    const rows = Math.ceil(maxHints / maxCols);
    const slotH = (innerH - (rows - 1) * rowGap) / rows;
    const slots: { w: number; h: number }[] = [];
    for (let i = 0; i < maxHints; i++) slots.push({ w: Math.max(20, slotW), h: Math.max(20, slotH) });
    return slots;
  }

  getElementColor(type: string): string {
    const colors: Record<string, string> = { image: 'rgba(76,175,80,0.35)', text: 'rgba(33,150,243,0.35)', animation: 'rgba(156,39,176,0.35)', hints: 'rgba(255,152,0,0.35)', advertise: 'rgba(244,67,54,0.30)' };
    return colors[type] ?? 'rgba(158,158,158,0.3)';
  }

  getElementEmoji(type: string): string {
    const map: Record<string, string> = { image: '🖼️', text: '📝', animation: '🎬', hints: '💡', advertise: '📢' };
    return map[type] ?? '📦';
  }

  // ── Save ────────────────────────────────────

  saveAndClose(): void {
    if (!this.theme) return;
    this.theme.updatedAt = new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    this.theme.elementsCount = this.theme.elements.length;
    this.dataService.updateTheme(this.theme);
    this.showToast(`Тема «${this.theme.name}» сохранена`);
    setTimeout(() => this.navigateBack(), 600);
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 3000);
  }
}
