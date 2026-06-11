import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent, UiModalComponent, UiButtonComponent } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { MOCK_ARRIVALS_CONTROLS } from '../data/mock-data';
import {
  ArrivalsControl,
  ArrivalsControlStatusType,
  ArrivalsThemeElement,
  ArrivalsElementType,
} from '../types';
import { EditorCanvasComponent } from '../components/canvas/editor-canvas.component';
import { CanvasElementComponent } from '../components/canvas/canvas-element.component';
import { ControlElementRendererComponent } from '../components/control-editor/control-element-renderer.component';
import { ControlElementInspectorComponent } from '../components/control-editor/control-element-inspector.component';
import { ControlEmulationPanelComponent } from '../components/control-editor/control-emulation-panel.component';
import {
  ELEMENT_TYPES,
  getElementTypeLabel,
  createDefaultElement,
  OrderMockItem,
  INITIAL_ORDER_MOCK_ITEMS,
  EMU_ITEM_STATUSES,
} from '../components/control-editor/element-defaults';

type PanelView = 'control' | 'add-element' | 'element';

const KITCHEN_STATUSES = [
  'Ожидает', 'Пора готовить', 'Готовится', 'Готовится 2', 'Готовится 3', 'Готовится 4', 'Выдача', 'Подан', 'Удалён',
];

const DELIVERY_STATUSES = [
  'Новый', 'Подтвержден', 'Готовится', 'Выдача', 'Собран', 'Ожидает', 'В пути', 'Вручен', 'Закрыт', 'Удалён',
];

const BALANCER_STATUSES = [
  'Ожидает', 'Пора готовить', 'Сборка', 'Самовывоз', 'Вручен',
];

@Component({
  selector: 'app-arrivals-control-editor-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiConfirmDialogComponent,
    UiModalComponent,
    UiButtonComponent,
    EditorCanvasComponent,
    CanvasElementComponent,
    ControlElementRendererComponent,
    ControlElementInspectorComponent,
    ControlEmulationPanelComponent,
  ],
  template: `
    <div class="editor-layout">
      <!-- ═══════ CANVAS + EMULATION ═══════ -->
      <div class="canvas-with-emulation">
        <app-editor-canvas
          [zoom]="canvasScale"
          (canvasClick)="onCanvasClick()"
        >
          <app-canvas-element
            *ngFor="let el of control.elements"
            [x]="el.x" [y]="el.y"
            [width]="el.width" [height]="el.height"
            [selected]="selectedElementId === el.id"
            [dragging]="dragState?.elementId === el.id"
            [borderWidth]="el.borderWidth"
            [borderColor]="el.borderColor"
            [borderRadius]="el.borderRadius"
            (selectElement)="selectElement(el.id, $event)"
            (elementMouseDown)="onElementMouseDown($event, el)"
            (resizeHandleMouseDown)="onHandleMouseDown($event.event, el, $event.handle)"
          >
            <app-control-element-renderer
              [element]="el"
              [orderMockItems]="orderMockItems">
            </app-control-element-renderer>
          </app-canvas-element>
        </app-editor-canvas>

        <app-control-emulation-panel
          [orderMockItems]="orderMockItems"
          (orderMockItemsChange)="orderMockItems = $event">
        </app-control-emulation-panel>
      </div>

      <!-- ═══════ RIGHT PANEL ═══════ -->
      <div class="control-panel">
        <div class="panel-header" (click)="toolPanelOpen = !toolPanelOpen">
          <span>Панель управления</span>
          <lucide-icon [name]="toolPanelOpen ? 'chevron-up' : 'chevron-down'" [size]="18"></lucide-icon>
        </div>

        <div *ngIf="toolPanelOpen" class="tool-panel-body">
          <div class="tool-row">
            <span class="tool-label">Границы:</span>
            <button class="tool-btn" [class.active]="showBorders" (click)="showBorders = !showBorders" title="Показать границы">
              <lucide-icon name="scan" [size]="16"></lucide-icon>
            </button>
          </div>
          <div class="tool-row">
            <span class="tool-label">Привязка:</span>
            <button class="tool-btn" [class.active]="snapToGrid" (click)="snapToGrid = !snapToGrid" title="Привязка к сетке">
              <lucide-icon name="grid-3x3" [size]="16"></lucide-icon>
            </button>
            <button class="tool-btn" [class.active]="snapToObjects" (click)="snapToObjects = !snapToObjects" title="Привязка к объектам">
              <lucide-icon name="magnet" [size]="16"></lucide-icon>
            </button>
          </div>
        </div>

        <div class="panel-body">
          <!-- ──── VIEW: Control properties ──── -->
          <ng-container *ngIf="panelView === 'control'">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon>
              <span class="bc-link">Контрол</span>
            </div>

            <div class="field-group">
              <label class="field-label">Имя контрола</label>
              <input class="field-input" [(ngModel)]="control.name" />
            </div>

            <div class="field-group">
              <select class="field-select" [ngModel]="control.statusType" (ngModelChange)="onStatusTypeChange($event)">
                <option value="kitchen">Статусы кухни</option>
                <option value="delivery">Статусы доставки</option>
                <option value="balancer">Статусы балансира</option>
              </select>
            </div>

            <div class="status-list">
              <div *ngFor="let status of currentStatuses; let i = index; trackBy: trackByIndex"
                class="status-item"
                [class.highlighted]="highlightedStatuses.has(status)">
                <span class="status-name" [class.bold]="highlightedStatuses.has(status)">{{ status }}</span>
                <div class="status-actions">
                  <button class="status-btn" [class.active]="highlightedStatuses.has(status)"
                    (click)="toggleStatusHighlight(status)" title="Выделить">
                    <lucide-icon name="copy" [size]="14"></lucide-icon>
                  </button>
                  <button class="status-btn" title="Копировать">
                    <lucide-icon name="clipboard" [size]="14"></lucide-icon>
                  </button>
                  <button class="status-btn" title="Удалить">
                    <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>

            <div class="section-divider">Элементы</div>

            <div *ngFor="let el of control.elements; let i = index" class="element-list-item"
              [class.active]="selectedElementId === el.id"
              (click)="selectElementFromList(el.id)">
              <span class="el-list-name">{{ el.name || getElementTypeLabel(el.type) }}</span>
              <div class="el-list-actions">
                <button class="el-list-btn" title="Видимость">
                  <lucide-icon name="eye" [size]="14"></lucide-icon>
                </button>
                <button class="el-list-btn" title="Копировать">
                  <lucide-icon name="copy" [size]="14"></lucide-icon>
                </button>
                <button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить">
                  <lucide-icon name="x" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>

            <button class="btn-add-element" (click)="panelView = 'add-element'">
              Добавить элемент
            </button>
          </ng-container>

          <!-- ──── VIEW: Add element picker ──── -->
          <ng-container *ngIf="panelView === 'add-element'">
            <div class="add-element-header">
              <span class="add-element-title">Добавить элемент</span>
              <button class="icon-btn-sm" (click)="panelView = 'control'">
                <lucide-icon name="x" [size]="18"></lucide-icon>
              </button>
            </div>

            <div class="element-type-list">
              <div
                *ngFor="let et of elementTypes"
                class="element-type-item"
                (click)="addElement(et.type)"
              >
                {{ et.label }}
              </div>
            </div>
          </ng-container>

          <!-- ──── VIEW: Element properties ──── -->
          <ng-container *ngIf="panelView === 'element' && selectedElement">
            <div class="panel-breadcrumb">
              <lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon>
              <span class="bc-link" (click)="deselectElement()">Контрол</span>
              <span class="bc-separator">/</span>
              <span class="bc-current">{{ selectedElement.name }}</span>
            </div>

            <app-control-element-inspector
              [element]="selectedElement"
              [emuItemStatuses]="emuItemStatuses">
            </app-control-element-inspector>
          </ng-container>
        </div>

        <div class="panel-footer">
          <button class="btn-save" (click)="save()">СОХРАНИТЬ</button>
          <button class="btn-back" (click)="goBack()">НАЗАД</button>
        </div>
      </div>

      <!-- Toast notification -->
      <div *ngIf="toastMessage" class="toast">{{ toastMessage }}</div>

      <!-- Delete confirm dialog -->
      <ui-confirm-dialog
        *ngIf="deleteElementTarget"
        [open]="true"
        title="Удалить элемент"
        [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'"
        confirmText="Удалить"
        variant="danger"
        (confirmed)="confirmDeleteElement()"
        (cancelled)="deleteElementTarget = null"
      ></ui-confirm-dialog>
      <!-- ─── Save dialog (theme context): Сохранить / Сохранить как копию / Отмена ─── -->
      <ui-modal
        *ngIf="showSaveDialog"
        [open]="true"
        title="Сохранение контрола"
        size="sm"
        (modalClose)="onSaveDialogCancel()"
      >
        <p class="text-sm text-text-secondary">Этот контрол может использоваться в других темах. Как вы хотите сохранить изменения?</p>
        <div modalFooter class="flex items-center justify-end gap-2">
          <ui-button variant="secondary" size="sm" (click)="onSaveDialogCancel()">Отмена</ui-button>
          <ui-button variant="secondary" size="sm" (click)="onSaveDialogCopy()">Сохранить как копию</ui-button>
          <ui-button variant="primary" size="sm" (click)="onSaveDialogConfirm()">Сохранить</ui-button>
        </div>
      </ui-modal>    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .editor-layout {
      display: flex; height: calc(100vh - 110px); margin: -20px -24px;
      font-family: Roboto, sans-serif;
    }

    .canvas-with-emulation {
      flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden;
    }

    /* ═══ Right Panel ═══ */
    .control-panel {
      width: 320px; flex-shrink: 0;
      display: flex; flex-direction: column;
      background: #fff; border-left: 1px solid #e0e0e0;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; font-size: 15px; font-weight: 500; color: #333;
      border-bottom: 1px solid #e0e0e0; cursor: pointer; user-select: none;
    }
    .panel-header:hover { background: #fafafa; }

    .tool-panel-body {
      padding: 12px 16px; border-bottom: 1px solid #e0e0e0;
    }
    .tool-row {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }
    .tool-row:last-child { margin-bottom: 0; }
    .tool-label { font-size: 13px; color: #757575; min-width: 70px; }
    .tool-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: 1px solid #e0e0e0; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer; transition: all 0.15s;
    }
    .tool-btn:hover { background: #f0f0f0; }
    .tool-btn.active { background: #e3f2fd; border-color: #448aff; color: #448aff; }

    .panel-body { flex: 1; overflow-y: auto; padding: 16px; }

    .panel-footer {
      display: flex; gap: 12px; padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
    }
    .btn-save {
      flex: 1; height: 36px; border: 2px solid #616161; border-radius: 4px;
      background: transparent; color: #333; font-size: 13px; font-weight: 600;
      font-family: Roboto, sans-serif; cursor: pointer; letter-spacing: 0.5px;
      transition: all 0.15s;
    }
    .btn-save:hover { background: #f5f5f5; }
    .btn-back {
      flex: 1; height: 36px; border: none; border-radius: 4px;
      background: #ff9800; color: #fff; font-size: 13px; font-weight: 600;
      font-family: Roboto, sans-serif; cursor: pointer; letter-spacing: 0.5px;
      transition: all 0.15s;
    }
    .btn-back:hover { background: #f57c00; }

    .panel-breadcrumb {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 16px; font-size: 14px;
    }
    .bc-home { color: #ff6d00; cursor: pointer; }
    .bc-link { color: #ff6d00; cursor: pointer; font-weight: 500; }
    .bc-link:hover { text-decoration: underline; }
    .bc-separator { color: #9e9e9e; }
    .bc-current { color: #333; font-weight: 500; }

    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input {
      width: 100%; height: 36px; padding: 0 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; transition: border-color 0.15s;
    }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-select {
      width: 100%; height: 36px; padding: 0 8px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      background: #fff; cursor: pointer; box-sizing: border-box;
    }

    .section-divider {
      position: relative; text-align: center;
      margin: 20px 0 12px; font-size: 13px; font-weight: 500; color: #9e9e9e;
    }
    .section-divider::before, .section-divider::after {
      content: ''; position: absolute; top: 50%;
      width: calc(50% - 50px); height: 1px; background: #e0e0e0;
    }
    .section-divider::before { left: 0; }
    .section-divider::after { right: 0; }

    .status-list { margin-bottom: 16px; }
    .status-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; border-bottom: 1px solid #f0f0f0;
      transition: background 0.15s; font-size: 13px;
    }
    .status-item:hover { background: #fafafa; }
    .status-item.highlighted { background: #fff3e0; }
    .status-name { flex: 1; color: #333; }
    .status-name.bold { font-weight: 600; color: #e65100; }
    .status-actions { display: flex; gap: 2px; }
    .status-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 26px; height: 26px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer;
      transition: all 0.15s;
    }
    .status-btn:hover { background: #e0e0e0; color: #424242; }
    .status-btn.active { color: #448aff; }

    .element-list-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; margin-bottom: 4px; border-radius: 4px;
      cursor: pointer; transition: background 0.15s; font-size: 13px;
    }
    .element-list-item:hover { background: #f5f5f5; }
    .element-list-item.active { background: #e3f2fd; }
    .el-list-name { flex: 1; }
    .el-list-actions { display: flex; gap: 2px; }
    .el-list-btn {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer;
    }
    .el-list-btn:hover { background: #e0e0e0; color: #424242; }
    .el-list-delete {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border: none; border-radius: 3px;
      background: transparent; color: #bdbdbd; cursor: pointer;
    }
    .el-list-delete:hover { background: #ffebee; color: #e53935; }

    .btn-add-element {
      width: 100%; height: 40px; border: none; border-radius: 4px;
      background: #448aff; color: #fff; font-size: 14px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer;
      transition: background 0.15s; margin-top: 8px;
    }
    .btn-add-element:hover { background: #2979ff; }

    .add-element-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .add-element-title { font-size: 18px; font-weight: 500; color: #333; }
    .icon-btn-sm {
      display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border: none; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer;
    }
    .icon-btn-sm:hover { background: #f0f0f0; }

    .element-type-list { display: flex; flex-direction: column; }
    .element-type-item {
      padding: 12px 8px; font-size: 14px; color: #333;
      border-bottom: 1px solid #f5f5f5; cursor: pointer;
      transition: background 0.15s;
    }
    .element-type-item:hover { background: #f5f5f5; }
    .element-type-item:last-child { border-bottom: none; }

    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      padding: 10px 24px; background: #333; color: #fff;
      border-radius: 6px; font-size: 14px; z-index: 9000;
      animation: toastIn 0.3s ease;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
  `],
})
export class ArrivalsControlEditorScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);

  control: ArrivalsControl = {
    id: 0,
    name: 'Новый контрол',
    statusType: 'delivery',
    elements: [],
  };

  toolPanelOpen = false;
  showBorders = false;
  snapToGrid = false;
  snapToObjects = false;

  highlightedStatuses = new Set<string>();
  panelView: PanelView = 'control';
  selectedElementId: string | null = null;
  deleteElementTarget: ArrivalsThemeElement | null = null;
  toastMessage = '';
  canvasScale = 1.0;

  // ── Save dialog (theme context) ──
  showSaveDialog = false;
  private isThemeContext = false;
  private newControlId: number | null = null;

  elementTypes = ELEMENT_TYPES;
  readonly emuItemStatuses = EMU_ITEM_STATUSES;

  orderMockItems: OrderMockItem[] = INITIAL_ORDER_MOCK_ITEMS.map(i => ({ ...i }));

  dragState: {
    elementId: string;
    startMouseX: number;
    startMouseY: number;
    startElX: number;
    startElY: number;
  } | null = null;

  resizeState: {
    elementId: string;
    handle: string;
    startMouseX: number;
    startMouseY: number;
    startElX: number;
    startElY: number;
    startElW: number;
    startElH: number;
  } | null = null;

  private boundMouseMove = this.onDocMouseMove.bind(this);
  private boundMouseUp = this.onDocMouseUp.bind(this);

  get currentStatuses(): string[] {
    switch (this.control.statusType) {
      case 'kitchen': return KITCHEN_STATUSES;
      case 'delivery': return DELIVERY_STATUSES;
      case 'balancer': return BALANCER_STATUSES;
      default: return DELIVERY_STATUSES;
    }
  }

  get selectedElement(): ArrivalsThemeElement | null {
    if (!this.selectedElementId) return null;
    return this.control.elements.find(e => e.id === this.selectedElementId) ?? null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    // Check if we came from a theme editor
    const returnTo = this.route.snapshot.queryParamMap.get('return');
    this.isThemeContext = !!(returnTo && (returnTo === 'theme-editor' || returnTo === 'menuboard-theme-editor'));

    if (id && id !== 'new') {
      const numId = Number(id);
      const allControls: ArrivalsControl[] = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
      const found = allControls.find(c => c.id === numId);
      if (found) {
        this.control = JSON.parse(JSON.stringify(found));
        if (!this.control.elements) {
          this.control.elements = [];
        }
      }
    } else {
      this.control.id = Date.now();
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  onStatusTypeChange(value: ArrivalsControlStatusType): void {
    this.control.statusType = value;
    this.highlightedStatuses = new Set<string>();
  }

  trackByIndex(index: number): number {
    return index;
  }

  getElementTypeLabel(type: string): string {
    return getElementTypeLabel(type);
  }

  toggleStatusHighlight(status: string): void {
    if (this.highlightedStatuses.has(status)) {
      this.highlightedStatuses.delete(status);
    } else {
      this.highlightedStatuses.add(status);
    }
  }

  onCanvasClick(): void {
    if (this.dragState || this.resizeState) return;
    this.deselectElement();
  }

  /* ── Drag ── */

  onElementMouseDown(event: MouseEvent, el: ArrivalsThemeElement): void {
    this.selectedElementId = el.id;
    this.panelView = 'element';

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

  /* ── Resize ── */

  onHandleMouseDown(event: MouseEvent, el: ArrivalsThemeElement, handle: string): void {
    event.preventDefault();
    event.stopPropagation();

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
    const scale = this.canvasScale;
    if (this.dragState) {
      const dx = (event.clientX - this.dragState.startMouseX) / scale;
      const dy = (event.clientY - this.dragState.startMouseY) / scale;
      const el = this.control.elements.find(e => e.id === this.dragState!.elementId);
      if (el) {
        el.x = Math.max(0, Math.round(this.dragState.startElX + dx));
        el.y = Math.max(0, Math.round(this.dragState.startElY + dy));
      }
    }

    if (this.resizeState) {
      const dx = (event.clientX - this.resizeState.startMouseX) / scale;
      const dy = (event.clientY - this.resizeState.startMouseY) / scale;
      const el = this.control.elements.find(e => e.id === this.resizeState!.elementId);
      if (el) {
        const h = this.resizeState.handle;
        const minSize = 20;
        const lockHeight = !!el.orderDynamicHeight;

        if (h.includes('r')) {
          el.width = Math.max(minSize, Math.round(this.resizeState.startElW + dx));
        }
        if (h.includes('l')) {
          const newW = Math.max(minSize, Math.round(this.resizeState.startElW - dx));
          el.x = Math.max(0, Math.round(this.resizeState.startElX + this.resizeState.startElW - newW));
          el.width = newW;
        }
        if (h.includes('b') && !lockHeight) {
          el.height = Math.max(minSize, Math.round(this.resizeState.startElH + dy));
        }
        if (h.includes('t') && !lockHeight) {
          const newH = Math.max(minSize, Math.round(this.resizeState.startElH - dy));
          el.y = Math.max(0, Math.round(this.resizeState.startElY + this.resizeState.startElH - newH));
          el.height = newH;
        }
      }
    }
  }

  private onDocMouseUp(): void {
    this.dragState = null;
    this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  selectElement(id: string, event: MouseEvent): void {
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  selectElementFromList(id: string): void {
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  deselectElement(): void {
    this.selectedElementId = null;
    this.panelView = 'control';
  }

  addElement(type: ArrivalsElementType): void {
    const el = createDefaultElement(type, this.control.elements.length);
    this.control.elements.push(el);
    this.selectedElementId = el.id;
    this.panelView = 'element';
  }

  requestDeleteElement(el: ArrivalsThemeElement, event: Event): void {
    event.stopPropagation();
    this.deleteElementTarget = el;
  }

  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.control.elements = this.control.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) {
        this.deselectElement();
      }
      this.deleteElementTarget = null;
    }
  }

  save(): void {
    // In theme context → show dialog with 3 options
    if (this.isThemeContext) {
      this.showSaveDialog = true;
      return;
    }
    this.performSave();
  }

  /** Save control in-place (update existing) */
  private performSave(): void {
    const allControls: ArrivalsControl[] = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
    const idx = allControls.findIndex(c => c.id === this.control.id);
    if (idx >= 0) {
      allControls[idx] = JSON.parse(JSON.stringify(this.control));
    } else {
      allControls.push(JSON.parse(JSON.stringify(this.control)));
    }
    this.storage.save('web-screens', 'arrivals-controls', allControls);

    const list: any[] = this.storage.load('web-screens', 'arrivals-controls-list', []);
    const listIdx = list.findIndex((i: any) => i.id === this.control.id);
    if (listIdx >= 0) {
      list[listIdx].name = this.control.name;
    } else {
      list.push({
        id: this.control.id,
        name: this.control.name,
        itemType: 'control',
        resolution: '1024x768',
        createdBy: 'Мой',
      });
    }
    this.storage.save('web-screens', 'arrivals-controls-list', list);

    this.showToast('Контрол сохранён');
  }

  /** Save as copy — create new control, apply it to the calling theme */
  private performSaveAsCopy(): void {
    const newId = Date.now();
    const copiedControl: ArrivalsControl = JSON.parse(JSON.stringify(this.control));
    copiedControl.id = newId;
    copiedControl.name = this.control.name + ' (копия)';

    const allControls: ArrivalsControl[] = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
    allControls.push(copiedControl);
    this.storage.save('web-screens', 'arrivals-controls', allControls);

    const list: any[] = this.storage.load('web-screens', 'arrivals-controls-list', []);
    list.push({
      id: newId,
      name: copiedControl.name,
      itemType: 'control',
      resolution: '1024x768',
      createdBy: 'Мой',
    });
    this.storage.save('web-screens', 'arrivals-controls-list', list);

    this.newControlId = newId;
    this.showToast('Контрол сохранён как копия');
  }

  onSaveDialogConfirm(): void {
    this.showSaveDialog = false;
    this.performSave();
    this.goBack();
  }

  onSaveDialogCopy(): void {
    this.showSaveDialog = false;
    this.performSaveAsCopy();
    this.goBack();
  }

  onSaveDialogCancel(): void {
    this.showSaveDialog = false;
  }

  goBack(): void {
    const returnTo = this.route.snapshot.queryParamMap.get('return');
    const themeId = this.route.snapshot.queryParamMap.get('themeId');
    const elementId = this.route.snapshot.queryParamMap.get('elementId');
    const newId = this.newControlId;

    if (returnTo === 'theme-editor' && themeId) {
      const params: any = {};
      if (newId) { params.newControlId = newId; params.elementId = elementId; }
      this.router.navigate(['/prototype/web-screens/arrivals-theme-editor', themeId], { queryParams: params });
      return;
    }
    if (returnTo === 'menuboard-theme-editor' && themeId) {
      const params: any = {};
      if (newId) { params.newControlId = newId; params.elementId = elementId; }
      this.router.navigate(['/prototype/web-screens/menuboard-theme-editor', themeId], { queryParams: params });
      return;
    }
    const parentSegment = this.route.snapshot.url[0]?.path || '';
    const parentRoute = parentSegment === 'menuboard-control-editor' ? 'menuboard-controls' : 'arrivals-controls';
    this.router.navigate(['/prototype/web-screens', parentRoute]);
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = ''), 3000);
  }
}
