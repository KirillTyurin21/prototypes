import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UiInputComponent, UiConfirmDialogComponent } from '@/components/ui';
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
import { ElementTreePanelComponent, ElementTypeOption } from '../components/theme-editor/element-tree-panel.component';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Component({
  selector: 'app-theme-editor-screen',
  standalone: true,
  imports: [
    CommonModule, FormsModule, UiInputComponent, UiConfirmDialogComponent,
    IconsModule, CsThemeInspectorComponent, ElementTreePanelComponent,
  ],
  template: `
    <div class="editor-root" *ngIf="theme">
      <!-- Toast -->
      <div *ngIf="toastMessage" class="toast">
        <lucide-icon name="check-circle-2" [size]="16"></lucide-icon>
        {{ toastMessage }}
      </div>

      <!-- Breadcrumbs -->
      <div class="breadcrumbs">
        <span class="crumb" (click)="navigateBack()">Настройки</span>
        <span class="crumb-sep">/</span>
        <span class="crumb" (click)="navigateBack()">Дисплей покупателя</span>
        <span class="crumb-sep">/</span>
        <span class="crumb" (click)="navigateBack()">Темы</span>
        <span class="crumb-sep">/</span>
        <span class="crumb-active">{{ theme.name }}</span>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-fields">
          <ui-input label="Название" placeholder="Название темы" [(value)]="theme.name" [fullWidth]="false"></ui-input>
          <ui-input label="Описание" placeholder="Описание темы" [(value)]="theme.description" [fullWidth]="false"></ui-input>
        </div>
        <button class="app-btn app-btn-primary" (click)="saveAndClose()">
          <lucide-icon name="save" [size]="16"></lucide-icon>
          <span>Сохранить</span>
        </button>
      </div>

      <!-- Main 3-column layout -->
      <div class="editor-body">
        <!-- LEFT: Element tree -->
        <div class="panel-left">
          <app-element-tree-panel
            [elements]="theme.elements"
            [selectedElementId]="selectedElementId"
            [elementTypeOptions]="elementTypeOptions"
            (selectElement)="selectElement($event)"
            (addElement)="addElement($event)"
            (deleteElement)="confirmDeleteElement($event)"
          ></app-element-tree-panel>
        </div>

        <!-- CENTER: Canvas -->
        <div class="panel-center">
          <div class="canvas-container">
            <div class="canvas" [style.transform]="'scale(' + canvasScale + ')'" [style.transform-origin]="'top left'">
              <div class="canvas-bg"></div>
              <div
                *ngFor="let el of theme.elements"
                class="canvas-element"
                [class.canvas-element-selected]="selectedElementId === el.id"
                [class.canvas-element-hints]="el.type === 'hints'"
                [style.left.px]="getElementLayout(el).x * canvasScale"
                [style.top.px]="getElementLayout(el).y * canvasScale"
                [style.width.px]="getElementLayout(el).width * canvasScale"
                [style.height.px]="getElementLayout(el).height * canvasScale"
                [style.background]="getElementColor(el.type)"
                [style.border-radius.px]="getElementBorderRadius(el) * canvasScale"
                [style.box-shadow]="getElementShadow(el)"
                (click)="selectElement(el.id)"
              >
                <span class="canvas-element-label" [style.font-size.px]="Math.max(9, 11 * canvasScale)">
                  {{ getElementEmoji(el.type) }} {{ el.name }}
                </span>
                <div *ngIf="el.type === 'hints'" class="canvas-hints-grid">
                  <div *ngFor="let slot of getHintSlots(el)" class="canvas-hint-slot"
                    [style.width.px]="slot.w * canvasScale"
                    [style.height.px]="slot.h * canvasScale"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Inspector -->
        <div class="panel-right">
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
        </div>
      </div>

      <!-- Footer -->
      <div class="editor-footer">
        <button class="app-btn app-btn-ghost" (click)="navigateBack()">Отмена</button>
        <button class="app-btn app-btn-primary" (click)="saveAndClose()">
          <lucide-icon name="save" [size]="16"></lucide-icon>
          <span>Сохранить</span>
        </button>
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
    .editor-root {
      display: flex; flex-direction: column; height: calc(100vh - 48px);
      animation: fadeIn 0.2s ease-out; position: relative;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .toast {
      position: fixed; top: 20px; right: 20px; z-index: 200;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 6px;
      background: #323232; color: #fff; font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: toastIn 0.3s ease-out;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

    .breadcrumbs {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 16px; font-size: 13px; color: #757575;
      border-bottom: 1px solid #e0e0e0; background: #fafafa; flex-shrink: 0;
    }
    .crumb { cursor: pointer; color: #1976D2; }
    .crumb:hover { text-decoration: underline; }
    .crumb-sep { color: #bdbdbd; }
    .crumb-active { color: #212121; font-weight: 500; }

    .toolbar {
      display: flex; align-items: flex-end; gap: 16px;
      padding: 12px 16px; border-bottom: 1px solid #e0e0e0;
      background: #fff; flex-shrink: 0;
    }
    .toolbar-fields { display: flex; gap: 12px; flex: 1; }
    .toolbar-fields ui-input { min-width: 200px; flex: 0 1 280px; }

    .app-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 0 14px; height: 34px; border: none; border-radius: 4px;
      font-size: 13px; font-weight: 500; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
    }
    .app-btn:disabled { opacity: 0.4; cursor: default; pointer-events: none; }
    .app-btn-primary { background: #448aff; color: #fff; }
    .app-btn-primary:hover { background: #2979ff; }
    .app-btn-ghost { background: transparent; color: #616161; border: 1px solid #e0e0e0; }
    .app-btn-ghost:hover { background: #f5f5f5; }

    .editor-body { display: flex; flex: 1; overflow: hidden; }

    .panel-left {
      width: 240px; min-width: 240px; border-right: 1px solid #e0e0e0;
      background: #fafafa; display: flex; flex-direction: column; overflow: hidden;
    }
    .panel-center {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: #eeeeee; overflow: hidden; position: relative;
    }
    .canvas-container {
      position: relative; width: 90%; max-width: 800px;
      aspect-ratio: 16 / 9; background: #1a1a2e;
      border-radius: 4px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .canvas { position: absolute; inset: 0; width: 1920px; height: 1080px; }
    .canvas-bg { position: absolute; inset: 0; background: #1a1a2e; }
    .canvas-element {
      position: absolute; border: 1px dashed rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
      overflow: hidden; border-radius: 3px;
    }
    .canvas-element:hover { border-color: rgba(255,255,255,0.6); }
    .canvas-element-hints {
      border: 2px dashed rgba(255,152,0,0.7) !important;
      background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,152,0,0.05) 10px, rgba(255,152,0,0.05) 20px) !important;
    }
    .canvas-element-selected {
      border: 2px solid #448aff !important;
      box-shadow: 0 0 0 2px rgba(68,138,255,0.3);
    }
    .canvas-element-selected.canvas-element-hints { border: 2px solid #448aff !important; }
    .canvas-hints-grid {
      position: absolute; inset: 4px; display: flex; flex-wrap: wrap;
      gap: 3px; align-content: flex-start; pointer-events: none;
    }
    .canvas-hint-slot {
      border: 1px dashed rgba(255,255,255,0.25);
      border-radius: 2px; background: rgba(255,152,0,0.1);
    }
    .canvas-element-label {
      color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 500;
      text-align: center; pointer-events: none; padding: 2px 4px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }

    .panel-right {
      width: 320px; min-width: 320px; border-left: 1px solid #e0e0e0;
      background: #fff; display: flex; flex-direction: column; overflow: hidden;
    }

    .editor-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px; border-top: 1px solid #e0e0e0;
      background: #fff; flex-shrink: 0;
    }
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
  canvasScale = 1;
  toastMessage = '';
  private toastTimer: any;
  private nextElementId = 100;

  // Options for inspector
  elementTypeOptions: ElementTypeOption[] = [];
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
    this.nextElementId = Math.max(100, ...this.theme.elements.map(e => e.id)) + 1;
    this.buildElementTypeOptions();
    this.animationControlOptions = this.dataService.controls.filter(c => c.type === 'animation').map(c => ({ value: '' + c.id, label: c.name }));
    this.hintControlOptions = this.dataService.controls.filter(c => c.type === 'hint').map(c => ({ value: '' + c.id, label: c.name }));
    this.hintElementOptions = getHintElements().map(e => ({ value: e.type, label: e.name }));
    this.typeNames = THEME_ELEMENT_TYPES.map(t => ({ type: t.type, name: t.name }));
    this.canvasScale = 800 / 1920;
  }

  navigateBack(): void {
    this.router.navigate(['/prototype/web-screens/themes-cs']);
  }

  selectElement(id: number): void {
    this.selectedElementId = this.selectedElementId === id ? null : id;
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
