import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { CsDataService } from '../cs-data.service';
import {
  CSControl,
  ControlElement,
  ElementTypeOption,
  getAnimationElements,
  getHintElements,
  defaultLayout,
  defaultBorder,
  defaultFont,
} from '../cs-types';
import { ElementPaletteComponent } from '../components/element-palette/element-palette.component';
import { CS_CONTROL_STANDARD_CATEGORIES } from '../data/cs-control-standard-categories.data';
import { CS_CONTROL_HINTS_CATEGORIES } from '../data/cs-control-hints-categories.data';

type PanelView = 'control' | 'add-element' | 'element';

@Component({
  selector: 'app-cs-control-editor-screen',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IconsModule,
    UiConfirmDialogComponent, ElementPaletteComponent,
  ],
  template: `
    <div class="editor-layout">
      <!-- ═══ CANVAS ═══ -->
      <div class="canvas-column">
        <div class="canvas-area" #canvasAreaRef>
          <div class="canvas-scroll">
            <div
              class="canvas-viewport"
              [style.width.px]="canvasW"
              [style.height.px]="canvasH"
              [style.transform]="'scale(' + canvasScale + ')'"
              (click)="onCanvasClick()">
              <div
                *ngFor="let el of control.elements; let i = index"
                class="canvas-element"
                [class.selected]="selectedElementId === el.id"
                [style.left.px]="el.settings.layout.x"
                [style.top.px]="el.settings.layout.y"
                [style.width.px]="el.settings.layout.width"
                [style.height.px]="el.settings.layout.height"
                [style.border-width.px]="el.settings.border.width"
                [style.border-color]="el.settings.border.color"
                [style.border-radius.px]="el.settings.border.radius"
                [style.z-index]="el.settings.layout.zIndex"
                [style.background-color]="getBg(el)"
                [style.opacity]="el.settings.layout.bgOpacity / 100"
                (click)="selectElement(el.id, $event)"
                (mousedown)="onElementMouseDown($event, el)">
                <span class="el-label">{{ el.name }}</span>
                <ng-container *ngIf="selectedElementId === el.id">
                  <div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div>
                  <div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div>
                  <div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div>
                  <div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div>
                  <div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div>
                  <div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div>
                  <div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div>
                  <div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT PANEL ═══ -->
      <div class="control-panel">
        <div class="panel-header" (click)="panelCollapsed = !panelCollapsed">
          <span>Панель управления</span>
          <lucide-icon [name]="panelCollapsed ? 'chevron-right' : 'chevron-down'" [size]="18"></lucide-icon>
        </div>

        <div *ngIf="!panelCollapsed" class="panel-body">
          <!-- ── VIEW: Control properties ── -->
          <ng-container *ngIf="panelView === 'control'">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon>
              <span class="bc-link">Контрол</span>
            </div>
            <div class="field-group">
              <label class="field-label">Имя контрола</label>
              <input class="field-input" [(ngModel)]="control.name" />
            </div>
            <div class="section-divider">Элементы</div>
            <div
              *ngFor="let el of control.elements; let i = index"
              class="element-list-item"
              [class.active]="selectedElementId === el.id"
              (click)="selectElementFromList(el.id)">
              <span class="el-list-name">{{ el.name }}</span>
              <button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить">
                <lucide-icon name="x" [size]="14"></lucide-icon>
              </button>
            </div>
            <button class="btn-add-element" (click)="panelView = 'add-element'">Добавить элемент</button>
          </ng-container>

          <!-- ── VIEW: Add element palette ── -->
          <app-element-palette
            *ngIf="panelView === 'add-element'"
            [categories]="controlCategories"
            (elementSelected)="addElementFromPalette($event)"
            (closed)="panelView = 'control'">
          </app-element-palette>

          <!-- ── VIEW: Element properties ── -->
          <ng-container *ngIf="panelView === 'element' && selectedElement">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon>
              <span class="bc-link" (click)="deselectElement()">Контрол</span>
              <span class="bc-separator">/</span>
              <span class="bc-current">{{ selectedElement.name }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">Название</label>
              <input class="field-input" [(ngModel)]="selectedElement.name" />
            </div>
            <div class="field-row">
              <div class="field-group field-half">
                <label class="field-label">X</label>
                <input class="field-input" type="number" [(ngModel)]="selectedElement.settings.layout.x" />
              </div>
              <div class="field-group field-half">
                <label class="field-label">Y</label>
                <input class="field-input" type="number" [(ngModel)]="selectedElement.settings.layout.y" />
              </div>
            </div>
            <div class="field-row">
              <div class="field-group field-half">
                <label class="field-label">Ширина</label>
                <input class="field-input" type="number" [(ngModel)]="selectedElement.settings.layout.width" />
              </div>
              <div class="field-group field-half">
                <label class="field-label">Высота</label>
                <input class="field-input" type="number" [(ngModel)]="selectedElement.settings.layout.height" />
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Цвет фона</label>
              <div class="color-input-row">
                <input type="color" [(ngModel)]="selectedElement.settings.layout.bgColor" class="color-swatch" />
                <input type="text" [(ngModel)]="selectedElement.settings.layout.bgColor" class="field-input color-hex" />
              </div>
            </div>
          </ng-container>
        </div>

        <div class="panel-footer">
          <button class="btn-save" (click)="save()">СОХРАНИТЬ</button>
          <button class="btn-back" (click)="goBack()">НАЗАД</button>
        </div>
      </div>

      <div *ngIf="toastMessage" class="toast">{{ toastMessage }}</div>

      <ui-confirm-dialog
        *ngIf="deleteElementTarget"
        [open]="true"
        title="Удалить элемент"
        [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'"
        confirmText="Удалить"
        variant="danger"
        (confirmed)="confirmDeleteElement()"
        (cancelled)="deleteElementTarget = null">
      </ui-confirm-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .editor-layout { display: flex; height: calc(100vh - 110px); margin: -20px -24px; font-family: Roboto, sans-serif; }
    .canvas-column { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .canvas-area { flex: 1; min-width: 0; overflow: auto; background: #e0e0e0; }
    .canvas-scroll { display: flex; align-items: flex-start; justify-content: center; min-height: 100%; padding: 8px; }
    .canvas-viewport {
      position: relative; transform-origin: top left; background-color: #fff;
      background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .canvas-element {
      position: absolute; border-style: dashed; cursor: move;
      display: flex; align-items: center; justify-content: center;
      transition: box-shadow 0.15s; font-size: 11px; color: #333;
      overflow: hidden; user-select: none; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected { border-style: solid; border-color: #448aff !important; box-shadow: 0 0 0 1px #448aff; }
    .el-label { padding: 2px 4px; text-align: center; word-break: break-word; }
    .handle { position: absolute; width: 8px; height: 8px; background: #fff; border: 2px solid #448aff; z-index: 2; }
    .handle.tl { top: -4px; left: -4px; cursor: nw-resize; } .handle.tr { top: -4px; right: -4px; cursor: ne-resize; }
    .handle.bl { bottom: -4px; left: -4px; cursor: sw-resize; } .handle.br { bottom: -4px; right: -4px; cursor: se-resize; }
    .handle.tm { top: -4px; left: calc(50% - 4px); cursor: n-resize; } .handle.bm { bottom: -4px; left: calc(50% - 4px); cursor: s-resize; }
    .handle.ml { top: calc(50% - 4px); left: -4px; cursor: w-resize; } .handle.mr { top: calc(50% - 4px); right: -4px; cursor: e-resize; }

    .control-panel { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; background: #fff; border-left: 1px solid #e0e0e0; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; font-size: 15px; font-weight: 500; color: #333; border-bottom: 1px solid #e0e0e0; cursor: pointer; user-select: none; }
    .panel-header:hover { background: #fafafa; }
    .panel-body { flex: 1; overflow-y: auto; padding: 16px; }
    .panel-footer { display: flex; gap: 12px; padding: 12px 16px; border-top: 1px solid #e0e0e0; }
    .btn-save { flex: 1; height: 36px; border: 2px solid #616161; border-radius: 4px; background: transparent; color: #333; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-save:hover { background: #f5f5f5; }
    .btn-back { flex: 1; height: 36px; border: none; border-radius: 4px; background: #ff9800; color: #fff; font-size: 13px; font-weight: 600; font-family: Roboto, sans-serif; cursor: pointer; }
    .btn-back:hover { background: #f57c00; }

    .panel-breadcrumb { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; font-size: 14px; }
    .bc-home { color: #ff6d00; cursor: pointer; } .bc-link { color: #ff6d00; cursor: pointer; font-weight: 500; } .bc-link:hover { text-decoration: underline; }
    .bc-separator { color: #9e9e9e; } .bc-current { color: #333; font-weight: 500; }

    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input { width: 100%; height: 36px; padding: 0 10px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: #333; box-sizing: border-box; }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-row { display: flex; gap: 8px; }
    .field-half { flex: 1; }
    .color-swatch { width: 36px; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px; cursor: pointer; padding: 0; }
    .color-hex { flex: 1; }
    .color-input-row { display: flex; gap: 8px; }

    .section-divider { position: relative; text-align: center; margin: 20px 0 12px; font-size: 13px; font-weight: 500; color: #9e9e9e; }
    .section-divider::before, .section-divider::after { content: ''; position: absolute; top: 50%; width: calc(50% - 50px); height: 1px; background: #e0e0e0; }
    .section-divider::before { left: 0; } .section-divider::after { right: 0; }

    .element-list-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; margin-bottom: 4px; border-radius: 4px; cursor: pointer; transition: background 0.15s; font-size: 13px; }
    .element-list-item:hover { background: #f5f5f5; } .element-list-item.active { background: #e3f2fd; }
    .el-list-name { flex: 1; }
    .el-list-delete { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: none; border-radius: 3px; background: transparent; color: #bdbdbd; cursor: pointer; }
    .el-list-delete:hover { background: #ffebee; color: #e53935; }

    .btn-add-element { width: 100%; height: 40px; border: none; border-radius: 4px; background: #448aff; color: #fff; font-size: 14px; font-weight: 500; font-family: Roboto, sans-serif; cursor: pointer; margin-top: 8px; }
    .btn-add-element:hover { background: #2979ff; }

    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 10px 24px; background: #333; color: #fff; border-radius: 6px; font-size: 14px; z-index: 9000; animation: toastIn 0.3s ease; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
  `],
})
export class CsControlEditorScreenComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);
  private dataService = inject(CsDataService);

  control!: CSControl;
  panelCollapsed = false;
  panelView: PanelView = 'control';
  selectedElementId: number | null = null;
  deleteElementTarget: ControlElement | null = null;
  toastMessage = '';
  canvasScale = 1;
  canvasW = 800;
  canvasH = 500;

  dragState: { elementId: number; startMouseX: number; startMouseY: number; startElX: number; startElY: number } | null = null;
  resizeState: { elementId: number; handle: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number; startElW: number; startElH: number } | null = null;
  private boundMouseMove = this.onDocMouseMove.bind(this);
  private boundMouseUp = this.onDocMouseUp.bind(this);
  private nextElementId = 200;

  PREVIEW_COLORS = ['#448aff', '#ff6d00', '#66bb6a', '#ab47bc', '#ef5350', '#26c6da', '#ffa726', '#78909c', '#ec407a', '#8d6e63'];

  controlCategories: any[] = [];

  get availableElements(): ElementTypeOption[] {
    return this.control?.type === 'hint' ? getHintElements() : getAnimationElements();
  }

  get selectedElement(): ControlElement | null {
    return this.control?.elements.find(el => el.id === this.selectedElementId) ?? null;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const controls = this.dataService.controls;
    const found = controls.find(c => c.id === id);
    if (found) {
      this.control = JSON.parse(JSON.stringify(found));
    } else {
      this.control = { id: id || Date.now(), name: 'Новый контрол', type: 'animation', elementsCount: 0, elements: [] };
    }
    this.nextElementId = Math.max(200, ...this.control.elements.map(e => e.id), 0) + 1;
    this.initCategories();
  }

  private initCategories(): void {
    const cats = this.control?.type === 'hint'
      ? CS_CONTROL_HINTS_CATEGORIES
      : CS_CONTROL_STANDARD_CATEGORIES;
    this.controlCategories = cats.map(cat => ({ ...cat, collapsed: cat.collapsed, elements: [...cat.elements] }));
  }

  getBg(el: ControlElement): string {
    const bg = el.settings.layout.bgColor;
    if (bg && bg !== '#ffffff' && bg !== '#FFFFFF') return bg;
    return this.PREVIEW_COLORS[el.id % this.PREVIEW_COLORS.length];
  }

  /* ── Selection ── */
  selectElement(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  selectElementFromList(id: number): void {
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  onCanvasClick(): void { this.selectedElementId = null; this.panelView = 'control'; }
  deselectElement(): void { this.selectedElementId = null; this.panelView = 'control'; }

  /* ── Add element ── */
  addElementFromPalette(type: string): void {
    const opt = this.availableElements.find(el => el.type === type);
    if (opt) {
      const el: ControlElement = {
        id: this.nextElementId++,
        type: opt.type,
        name: opt.name,
        settings: {
          layout: { x: 40 + (this.control.elements.length % 3) * 60, y: 40 + Math.floor(this.control.elements.length / 3) * 60, width: 120, height: 40, padding: [4, 4, 4, 4], bgColor: '#ffffff', bgOpacity: 100, zIndex: this.control.elements.length + 1, rotation: 0 },
          border: { width: 1, color: '#9e9e9e', type: 'solid', radius: 0 },
          ...(opt.isTextual ? { font: defaultFont() } : {}),
        },
      };
      this.control.elements = [...this.control.elements, el];
      this.panelView = 'control';
    }
  }

  /* ── Delete ── */
  requestDeleteElement(el: ControlElement, event: MouseEvent): void {
    event.stopPropagation();
    this.deleteElementTarget = el;
  }

  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.control.elements = this.control.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) { this.selectedElementId = null; this.panelView = 'control'; }
      this.deleteElementTarget = null;
    }
  }

  /* ── Drag/Resize ── */
  onElementMouseDown(event: MouseEvent, el: ControlElement): void {
    event.stopPropagation();
    if (event.button !== 0) return;
    this.dragState = { elementId: el.id, startMouseX: event.clientX, startMouseY: event.clientY, startElX: el.settings.layout.x, startElY: el.settings.layout.y };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  onHandleMouseDown(event: MouseEvent, el: ControlElement, handle: string): void {
    event.stopPropagation(); event.preventDefault();
    this.resizeState = { elementId: el.id, handle, startMouseX: event.clientX, startMouseY: event.clientY, startElX: el.settings.layout.x, startElY: el.settings.layout.y, startElW: el.settings.layout.width, startElH: el.settings.layout.height };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private onDocMouseMove(event: MouseEvent): void {
    const scale = 1 / this.canvasScale;
    if (this.dragState) {
      const dx = (event.clientX - this.dragState.startMouseX) * scale;
      const dy = (event.clientY - this.dragState.startMouseY) * scale;
      const el = this.control.elements.find(e => e.id === this.dragState!.elementId);
      if (el) { el.settings.layout.x = Math.round(this.dragState.startElX + dx); el.settings.layout.y = Math.round(this.dragState.startElY + dy); }
    }
    if (this.resizeState) {
      const dx = (event.clientX - this.resizeState.startMouseX) * scale;
      const dy = (event.clientY - this.resizeState.startMouseY) * scale;
      const el = this.control.elements.find(e => e.id === this.resizeState!.elementId);
      if (!el) return;
      const h = this.resizeState.handle;
      if (h.includes('r')) el.settings.layout.width = Math.max(20, Math.round(this.resizeState.startElW + dx));
      if (h.includes('l')) { el.settings.layout.x = Math.round(this.resizeState.startElX + dx); el.settings.layout.width = Math.max(20, Math.round(this.resizeState.startElW - dx)); }
      if (h.includes('b')) el.settings.layout.height = Math.max(10, Math.round(this.resizeState.startElH + dy));
      if (h.includes('t')) { el.settings.layout.y = Math.round(this.resizeState.startElY + dy); el.settings.layout.height = Math.max(10, Math.round(this.resizeState.startElH - dy)); }
    }
  }

  private onDocMouseUp(): void {
    this.dragState = null; this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  /* ── Save / Back ── */
  save(): void {
    this.control.elementsCount = this.control.elements.length;
    this.dataService.updateControl(this.control);
    this.showToast('Контрол сохранён');
  }

  goBack(): void {
    this.router.navigate(['/prototype/web-screens/controls']);
  }

  private showToast(msg: string): void { this.toastMessage = msg; setTimeout(() => this.toastMessage = '', 2000); }
}
