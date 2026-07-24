import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { MOCK_KIOSK_LIST } from '../data/mock-data';
import { KIOSK_THEME_CATEGORIES } from '../data/kiosk-theme-categories.data';
import { ArrivalsTheme, ArrivalsThemeElement, ArrivalsElementType, ElementCategory } from '../types';
import { ElementPaletteComponent } from '../components/element-palette/element-palette.component';

type PanelView = 'theme' | 'add-element' | 'element';

@Component({
  selector: 'app-kiosk-theme-editor-screen',
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
              [style.width.px]="resWidth"
              [style.height.px]="resHeight"
              [style.transform]="'scale(' + canvasScale + ')'"
              (click)="onCanvasClick()">
              <div
                *ngFor="let el of theme.elements; let i = index"
                class="canvas-element"
                [class.selected]="selectedElementId === el.id"
                [style.left.px]="el.x"
                [style.top.px]="el.y"
                [style.width.px]="el.width"
                [style.height.px]="el.height"
                [style.border-width.px]="el.borderWidth"
                [style.border-color]="el.borderColor"
                [style.border-radius.px]="el.borderRadius"
                [style.z-index]="theme.elements.length - i"
                (click)="selectElement(el.id, $event)"
                (mousedown)="onElementMouseDown($event, el)">
                <span *ngIf="el.type === 'text'" class="el-text"
                  [style.font-family]="el.fontFamily"
                  [style.font-size.px]="el.fontSize"
                  [style.font-weight]="el.fontBold ? 'bold' : 'normal'"
                  [style.font-style]="el.fontItalic ? 'italic' : 'normal'"
                  [style.text-align]="el.textAlign">{{ el.text }}</span>
                <span *ngIf="el.type === 'image'" class="el-placeholder">
                  <lucide-icon name="image" [size]="24"></lucide-icon>
                </span>
                <span *ngIf="el.type !== 'text' && el.type !== 'image'" class="el-placeholder-label">
                  {{ el.name }}
                </span>
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
          <!-- ── VIEW: Theme properties ── -->
          <ng-container *ngIf="panelView === 'theme'">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon>
              <span class="bc-link">Тема</span>
            </div>
            <div class="field-group">
              <label class="field-label">Имя темы</label>
              <input class="field-input" [(ngModel)]="theme.name" />
            </div>
            <div class="field-group">
              <label class="field-label">Разрешение</label>
              <select class="field-select" [(ngModel)]="theme.resolution" (ngModelChange)="onResolutionChange()">
                <option *ngFor="let r of resolutionOptions" [value]="r.value">{{ r.label }}</option>
              </select>
            </div>
            <div class="section-divider">Элементы</div>
            <div
              *ngFor="let el of theme.elements; let i = index"
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
            [categories]="themeCategories"
            (elementSelected)="addElement($event)"
            (closed)="panelView = 'theme'">
          </app-element-palette>

          <!-- ── VIEW: Element properties ── -->
          <ng-container *ngIf="panelView === 'element' && selectedElement">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon>
              <span class="bc-link" (click)="deselectElement()">Тема</span>
              <span class="bc-separator">/</span>
              <span class="bc-current">{{ selectedElement.name }}</span>
            </div>
            <div class="field-group">
              <label class="field-label">Название</label>
              <input class="field-input" [(ngModel)]="selectedElement.name" />
            </div>
            <div class="field-group">
              <label class="field-label">X</label>
              <input class="field-input" type="number" [(ngModel)]="selectedElement.x" />
            </div>
            <div class="field-group">
              <label class="field-label">Y</label>
              <input class="field-input" type="number" [(ngModel)]="selectedElement.y" />
            </div>
            <div class="field-group">
              <label class="field-label">Ширина</label>
              <input class="field-input" type="number" [(ngModel)]="selectedElement.width" />
            </div>
            <div class="field-group">
              <label class="field-label">Высота</label>
              <input class="field-input" type="number" [(ngModel)]="selectedElement.height" />
            </div>
            <div class="field-group" *ngIf="selectedElement.type === 'text'">
              <label class="field-label">Текст</label>
              <input class="field-input" [(ngModel)]="selectedElement.text" />
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
      background: rgba(255,255,255,0.5); transition: box-shadow 0.15s;
      font-size: 13px; color: #333; overflow: hidden; user-select: none;
    }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected { border-style: solid; border-color: #448aff !important; box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.dragging { opacity: 0.85; transition: none; }
    .el-text { display: block; width: 100%; padding: 4px; word-break: break-word; }
    .el-placeholder { color: #9e9e9e; }
    .el-placeholder-label { color: #9e9e9e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
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
    .field-select { width: 100%; height: 36px; padding: 0 8px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: Roboto, sans-serif; color: #333; background: #fff; cursor: pointer; box-sizing: border-box; }

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
export class KioskThemeEditorScreenComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);

  theme: ArrivalsTheme = { id: 0, name: 'Новая тема', resolution: '1024x768', screenMode: 'order-screen', elements: [] };
  panelCollapsed = false;
  panelView: PanelView = 'theme';
  selectedElementId: string | null = null;
  deleteElementTarget: ArrivalsThemeElement | null = null;
  toastMessage = '';
  canvasScale = 1;

  resWidth = 1024;
  resHeight = 768;

  resolutionOptions: SelectOption[] = [
    { value: '1024x768', label: '1024px / 768px' },
    { value: '1366x768', label: '1366px / 768px' },
    { value: '1920x1080', label: '1920px / 1080px' },
  ];

  themeCategories: ElementCategory[] = JSON.parse(JSON.stringify(KIOSK_THEME_CATEGORIES));

  dragState: { elementId: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number } | null = null;
  resizeState: { elementId: string; handle: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number; startElW: number; startElH: number } | null = null;

  private boundMouseMove = this.onDocMouseMove.bind(this);
  private boundMouseUp = this.onDocMouseUp.bind(this);
  private elementCounter = 1;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      const themes: ArrivalsTheme[] = this.storage.load('web-screens', 'kiosk-themes', [
        { id: 1, name: 'Стандартная (киоск)', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
        { id: 2, name: 'Расширенный QR', resolution: '1366x768', screenMode: 'order-screen', elements: [] },
        { id: 3, name: 'Киоск — тёмная', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
      ]);
      const found = themes.find(t => t.id === id);
      if (found) {
        this.theme = JSON.parse(JSON.stringify(found));
      } else {
        this.theme.id = id;
      }
      this.elementCounter = this.theme.elements.length + 1;
    }
    this.onResolutionChange();
  }

  get selectedElement(): ArrivalsThemeElement | null {
    return this.theme.elements.find(el => el.id === this.selectedElementId) ?? null;
  }

  /* ── Resolution ── */
  onResolutionChange(): void {
    const [w, h] = this.theme.resolution.split('x').map(Number);
    this.resWidth = w || 1024;
    this.resHeight = h || 768;
  }

  /* ── Element selection ── */
  selectElement(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  selectElementFromList(id: string): void {
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  onCanvasClick(): void {
    this.selectedElementId = null;
    this.panelView = 'theme';
  }

  deselectElement(): void {
    this.selectedElementId = null;
    this.panelView = 'theme';
  }

  /* ── Add element ── */
  addElement(type: string): void {
    const nameMap: Record<string, string> = {
      'text': 'Текст',
      'image': 'Изображение',
      'rectangle': 'Прямоугольник',
      'kiosk-controls-area': 'Область контрола',
      'kiosk-hints-area': 'Область подсказок',
      'kiosk-advertise': 'Рекламный модуль',
      'kiosk-sample-qr': 'Пример QR',
      'kiosk-tips-qr': 'QR для чаевых',
      'kiosk-payment-qr': 'QR для оплаты',
      'kiosk-yandex-pay-qr': 'Yandex.Pay QR',
      'kiosk-kaspi-qr': 'KASPI QR',
    };
    const name = nameMap[type] || type;
    const newEl: ArrivalsThemeElement = {
      id: `el-${Date.now()}-${this.elementCounter++}`,
      type: type as ArrivalsElementType,
      name,
      x: 40 + (this.theme.elements.length % 4) * 50,
      y: 40 + Math.floor(this.theme.elements.length / 4) * 50,
      width: 150,
      height: type === 'text' ? 30 : 60,
      borderWidth: 1,
      borderColor: '#9e9e9e',
      borderRadius: 0,
      text: type === 'text' ? name : undefined,
    };
    this.theme.elements = [...this.theme.elements, newEl];
    this.panelView = 'theme';
  }

  /* ── Delete element ── */
  requestDeleteElement(el: ArrivalsThemeElement, event: MouseEvent): void {
    event.stopPropagation();
    this.deleteElementTarget = el;
  }

  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.theme.elements = this.theme.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) {
        this.selectedElementId = null;
        this.panelView = 'theme';
      }
      this.deleteElementTarget = null;
    }
  }

  /* ── Drag on canvas ── */
  onElementMouseDown(event: MouseEvent, el: ArrivalsThemeElement): void {
    event.stopPropagation();
    if (event.button !== 0) return;
    this.selectElement(el.id, event);
    this.dragState = {
      elementId: el.id,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startElX: el.x,
      startElY: el.y,
    };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  onHandleMouseDown(event: MouseEvent, el: ArrivalsThemeElement, handle: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.resizeState = {
      elementId: el.id,
      handle,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startElX: el.x,
      startElY: el.y,
      startElW: el.width,
      startElH: el.height,
    };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private onDocMouseMove(event: MouseEvent): void {
    const scale = 1 / this.canvasScale;
    if (this.dragState) {
      const dx = (event.clientX - this.dragState.startMouseX) * scale;
      const dy = (event.clientY - this.dragState.startMouseY) * scale;
      const el = this.theme.elements.find(e => e.id === this.dragState!.elementId);
      if (el) {
        el.x = Math.round(this.dragState.startElX + dx);
        el.y = Math.round(this.dragState.startElY + dy);
      }
    }
    if (this.resizeState) {
      const dx = (event.clientX - this.resizeState.startMouseX) * scale;
      const dy = (event.clientY - this.resizeState.startMouseY) * scale;
      const el = this.theme.elements.find(e => e.id === this.resizeState!.elementId);
      if (!el) return;
      const h = this.resizeState.handle;
      if (h.includes('r')) { el.width = Math.max(20, Math.round(this.resizeState.startElW + dx)); }
      if (h.includes('l')) { el.x = Math.round(this.resizeState.startElX + dx); el.width = Math.max(20, Math.round(this.resizeState.startElW - dx)); }
      if (h.includes('b')) { el.height = Math.max(10, Math.round(this.resizeState.startElH + dy)); }
      if (h.includes('t')) { el.y = Math.round(this.resizeState.startElY + dy); el.height = Math.max(10, Math.round(this.resizeState.startElH - dy)); }
    }
  }

  private onDocMouseUp(): void {
    this.dragState = null;
    this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  /* ── Save / Back ── */
  save(): void {
    const themes: ArrivalsTheme[] = this.storage.load('web-screens', 'kiosk-themes', []);
    const idx = themes.findIndex(t => t.id === this.theme.id);
    if (idx >= 0) {
      themes[idx] = JSON.parse(JSON.stringify(this.theme));
    } else {
      themes.push(JSON.parse(JSON.stringify(this.theme)));
    }
    this.storage.save('web-screens', 'kiosk-themes', themes);
    this.showToast('Тема сохранена');
  }

  goBack(): void {
    this.router.navigate(['/prototype/web-screens/kiosk-themes']);
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => { this.toastMessage = ''; }, 2000);
  }
}
