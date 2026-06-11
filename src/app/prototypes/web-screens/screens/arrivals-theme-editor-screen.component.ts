import { Component, inject, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { MOCK_ARRIVALS_THEMES, MOCK_ARRIVALS_CONTROLS, MOCK_ARRIVALS_ORDERS } from '../data/mock-data';
import { ARRIVALS_THEME_CATEGORIES } from '../data/element-categories.data';
import { ArrivalsTheme, ArrivalsThemeElement, ArrivalsElementType, ArrivalsControl, ArrivalsOrderMock, ElementCategory } from '../types';
import { AreaElementRendererComponent } from '../components/theme-editor/area-element-renderer.component';
import { ThemeElementInspectorComponent } from '../components/theme-editor/theme-element-inspector.component';
import { AreaElementInspectorComponent } from '../components/theme-editor/area-element-inspector.component';
import { OrderSimulatorComponent } from '../components/simulator/order-simulator.component';
import { AreaEmulationHelper } from '../components/theme-editor/area-emulation.service';
import { SimulatorHelper } from '../components/theme-editor/simulator.helper';

type PanelView = 'theme' | 'add-element' | 'element';

@Component({
  selector: 'app-arrivals-theme-editor-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, UiConfirmDialogComponent, AreaElementRendererComponent, ThemeElementInspectorComponent, AreaElementInspectorComponent, OrderSimulatorComponent],
  template: `
    <div class="editor-layout">
      <div class="canvas-column">
        <div class="canvas-area" #canvasAreaRef>
        <div class="canvas-scroll">
          <div class="canvas-viewport" [style.width.px]="resWidth" [style.height.px]="resHeight" [style.transform]="'scale(' + canvasScale + ')'" (click)="onCanvasClick()">
            <ng-container *ngFor="let el of theme.elements">
              <div *ngIf="el.type === 'area'" class="canvas-element area-element" [class.selected]="selectedElementId === el.id" [class.dragging]="dragState?.elementId === el.id" [style.left.px]="el.x" [style.top.px]="el.y" [style.width.px]="el.width" [style.height.px]="el.height" [style.border-width.px]="el.borderWidth" [style.border-color]="el.borderColor" [style.border-radius.px]="el.borderRadius" (click)="selectElement(el.id, $event)" (mousedown)="onElementMouseDown($event, el)">
                <app-area-element-renderer [element]="el" [orderPositions]="areaHelper.getOrderPositions(el, sim.orders, sim.active, mockOrders, availableControls)" [emulationRunning]="areaHelper.isRunning(el.id)" [hasControl]="!!el.areaControlId" (toggleEmu)="areaHelper.toggle($event, getFilterSource(), availableControls)" (resetEmu)="areaHelper.reset($event.id)" (fillEmu)="areaHelper.fill($event, getFilterSource(), availableControls)"></app-area-element-renderer>
                <ng-container *ngIf="selectedElementId === el.id"><div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div><div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div><div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div><div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div><div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div><div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div><div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div><div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div></ng-container>
              </div>
              <div *ngIf="el.type !== 'area'" class="canvas-element" [class.selected]="selectedElementId === el.id" [class.dragging]="dragState?.elementId === el.id" [style.left.px]="el.x" [style.top.px]="el.y" [style.width.px]="el.width" [style.height.px]="el.height" [style.border-width.px]="el.borderWidth" [style.border-color]="el.borderColor" [style.border-radius.px]="el.borderRadius" (click)="selectElement(el.id, $event)" (mousedown)="onElementMouseDown($event, el)">
                <span *ngIf="el.type === 'text'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign">{{ el.text }}</span>
                <span *ngIf="el.type === 'image'" class="el-placeholder"><lucide-icon name="image" [size]="24"></lucide-icon></span>
                <span *ngIf="el.type === 'price'" class="el-text" [style.font-family]="el.fontFamily" [style.font-size.px]="el.fontSize" [style.font-weight]="el.fontBold ? 'bold' : 'normal'" [style.font-style]="el.fontItalic ? 'italic' : 'normal'" [style.text-align]="el.textAlign" [title]="getPriceTooltip(el)">{{ getPricePreview(el) }}</span>
                <span *ngIf="el.type !== 'text' && el.type !== 'image' && el.type !== 'price'" class="el-placeholder-label">{{ el.name }}</span>
                <ng-container *ngIf="selectedElementId === el.id"><div class="handle tl" (mousedown)="onHandleMouseDown($event, el, 'tl')"></div><div class="handle tr" (mousedown)="onHandleMouseDown($event, el, 'tr')"></div><div class="handle bl" (mousedown)="onHandleMouseDown($event, el, 'bl')"></div><div class="handle br" (mousedown)="onHandleMouseDown($event, el, 'br')"></div><div class="handle tm" (mousedown)="onHandleMouseDown($event, el, 'tm')"></div><div class="handle bm" (mousedown)="onHandleMouseDown($event, el, 'bm')"></div><div class="handle ml" (mousedown)="onHandleMouseDown($event, el, 'ml')"></div><div class="handle mr" (mousedown)="onHandleMouseDown($event, el, 'mr')"></div></ng-container>
              </div>
            </ng-container>
          </div>
        </div>
        </div>
        <app-order-simulator [orders]="sim.orders" [autoRunning]="sim.autoRunning" (addOrder)="sim.addOrder(); areaHelper.clearAll()" (loadMocks)="sim.loadMocks(); areaHelper.clearAll()" (removeOrder)="sim.removeByIdx($event); areaHelper.clearAll()" (cycleStatus)="sim.cycleStatus($event); areaHelper.clearAll()" (changeOrderType)="sim.changeOrderType($event.order, $event.newType); areaHelper.clearAll()" (toggleAuto)="sim.toggleAuto()" (clearAll)="sim.clearAll(); areaHelper.clearAll()"></app-order-simulator>
      </div>
      <div class="control-panel">
        <div class="panel-header" (click)="panelCollapsed = !panelCollapsed"><span>Панель управления</span><lucide-icon [name]="panelCollapsed ? 'chevron-right' : 'chevron-down'" [size]="18"></lucide-icon></div>
        <div *ngIf="!panelCollapsed" class="panel-body">
          <ng-container *ngIf="panelView === 'theme'">
            <div class="panel-breadcrumb"><lucide-icon name="home" [size]="16" class="bc-home"></lucide-icon><span class="bc-link">Тема</span></div>
            <div class="field-group"><label class="field-label">Имя темы</label><input class="field-input" [(ngModel)]="theme.name" /></div>
            <div class="field-group"><label class="field-label">Разрешение</label><select class="field-select" [(ngModel)]="theme.resolution" (ngModelChange)="onResolutionChange()"><option *ngFor="let r of resolutionOptions" [value]="r.value">{{ r.label }}</option></select></div>
            <div class="section-divider">Настройка режима</div>
            <div class="field-group"><select class="field-select" [(ngModel)]="theme.screenMode"><option *ngFor="let m of screenModeOptions" [value]="m.value">{{ m.label }}</option></select></div>
            <div class="section-divider">Элементы</div>
            <div *ngFor="let el of theme.elements; let i = index" class="element-list-item" [class.active]="selectedElementId === el.id" (click)="selectElementFromList(el.id)"><span class="el-list-name">{{ el.name }}</span><button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить"><lucide-icon name="x" [size]="14"></lucide-icon></button></div>
            <button class="btn-add-element" (click)="panelView = 'add-element'">Добавить элемент</button>
          </ng-container>
          <ng-container *ngIf="panelView === 'add-element'">
            <div class="add-element-header"><span class="add-element-title">Добавить элемент</span><button class="icon-btn-sm" (click)="panelView = 'theme'"><lucide-icon name="x" [size]="18"></lucide-icon></button></div>
            <div class="element-categories">
              <div *ngFor="let cat of themeCategories" class="category-group">
                <div class="category-header" (click)="toggleCategory(cat.id)">
                  <lucide-icon [name]="cat.icon" [size]="18" class="category-icon"></lucide-icon>
                  <span class="category-label">{{ cat.label }}</span>
                  <span class="category-count">{{ cat.elements.length }}</span>
                  <lucide-icon [name]="cat.collapsed ? 'chevron-down' : 'chevron-up'" [size]="16" class="category-chevron"></lucide-icon>
                </div>
                <div *ngIf="!cat.collapsed" class="category-elements">
                  <div *ngFor="let el of cat.elements" class="element-item" (click)="addElement(el.type)">
                    <lucide-icon [name]="el.icon" [size]="16" class="element-icon"></lucide-icon>
                    <span>{{ el.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-container *ngIf="panelView === 'element' && selectedElement">
            <div class="panel-breadcrumb"><lucide-icon name="home" [size]="16" class="bc-home" (click)="deselectElement()"></lucide-icon><span class="bc-link" (click)="deselectElement()">Тема</span><span class="bc-separator">/</span><span class="bc-current">{{ selectedElement.name }}</span></div>
            <app-theme-element-inspector *ngIf="selectedElement.type !== 'area'" [element]="selectedElement"></app-theme-element-inspector>
            <app-area-element-inspector *ngIf="selectedElement.type === 'area'" [element]="selectedElement" [availableControls]="availableControls" (areaControlChange)="onAreaControlChange()"></app-area-element-inspector>
          </ng-container>
        </div>
        <div class="panel-footer"><button class="btn-save" (click)="save()">СОХРАНИТЬ</button><button class="btn-back" (click)="goBack()">НАЗАД</button></div>
      </div>
      <div *ngIf="toastMessage" class="toast">{{ toastMessage }}</div>
      <ui-confirm-dialog *ngIf="deleteElementTarget" [open]="true" title="Удалить элемент" [message]="'Удалить элемент «' + deleteElementTarget.name + '»?'" confirmText="Удалить" variant="danger" (confirmed)="confirmDeleteElement()" (cancelled)="deleteElementTarget = null"></ui-confirm-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .editor-layout { display: flex; height: calc(100vh - 110px); margin: -20px -24px; font-family: Roboto, sans-serif; }
    .canvas-column { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .canvas-area { flex: 1; min-width: 0; overflow: auto; background: #e0e0e0; }
    .canvas-scroll { display: flex; align-items: flex-start; justify-content: center; min-height: 100%; padding: 8px; }
    .canvas-viewport { position: relative; transform-origin: top left; background-color: #fff; background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .canvas-element { position: absolute; border-style: dashed; cursor: move; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.5); transition: box-shadow 0.15s; font-size: 13px; color: #333; overflow: hidden; user-select: none; }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected { border-style: solid; border-color: #448aff !important; box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.dragging { opacity: 0.85; transition: none; }
    .canvas-element.area-element { border-style: dashed !important; }
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
    .field-group { margin-bottom: 12px; } .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
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
    .add-element-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .add-element-title { font-size: 18px; font-weight: 500; color: #333; }
    .icon-btn-sm { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; border-radius: 4px; background: transparent; color: #757575; cursor: pointer; }
    .icon-btn-sm:hover { background: #f0f0f0; }
    .element-type-list { display: flex; flex-direction: column; }
    .element-type-item { padding: 12px 8px; font-size: 14px; color: #333; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
    .element-type-item:hover { background: #f5f5f5; } .element-type-item:last-child { border-bottom: none; }
    .element-type-separator { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #9e9e9e; padding: 12px 8px 6px; font-weight: 500; }

    /* ── Element category accordion ── */
    .element-categories { display: flex; flex-direction: column; }
    .category-group { border-bottom: 1px solid #f0f0f0; }
    .category-group:last-child { border-bottom: none; }
    .category-header { display: flex; align-items: center; gap: 8px; padding: 10px 8px; cursor: pointer; user-select: none; transition: background 0.15s; }
    .category-header:hover { background: #f5f5f5; }
    .category-icon { color: #757575; flex-shrink: 0; }
    .category-label { flex: 1; font-size: 14px; font-weight: 500; color: #333; }
    .category-count { font-size: 12px; color: #9e9e9e; background: #f0f0f0; border-radius: 10px; min-width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; padding: 0 6px; }
    .category-chevron { color: #9e9e9e; flex-shrink: 0; transition: transform 0.2s ease; }

    .category-elements { display: flex; flex-direction: column; padding: 0 0 4px 0; animation: accordionIn 0.15s ease-out; }
    @keyframes accordionIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    .element-item { display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 34px; font-size: 13px; color: #555; cursor: pointer; transition: background 0.12s; }
    .element-item:hover { background: #e3f2fd; color: #1976d2; }
    .element-icon { color: #9e9e9e; flex-shrink: 0; }
    .element-item:hover .element-icon { color: #1976d2; }
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 10px 24px; background: #333; color: #fff; border-radius: 6px; font-size: 14px; z-index: 9000; animation: toastIn 0.3s ease; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
  `],
})
export class ArrivalsThemeEditorScreenComponent implements OnInit, OnDestroy, AfterViewInit {
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
  availableControls: ArrivalsControl[] = [];
  mockOrders: ArrivalsOrderMock[] = [...MOCK_ARRIVALS_ORDERS];

  areaHelper = new AreaEmulationHelper();
  sim = new SimulatorHelper();

  @ViewChild('canvasAreaRef') canvasAreaRef!: ElementRef<HTMLDivElement>;

  dragState: { elementId: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number } | null = null;
  resizeState: { elementId: string; handle: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number; startElW: number; startElH: number } | null = null;
  private boundMouseMove = this.onDocMouseMove.bind(this);
  private boundMouseUp = this.onDocMouseUp.bind(this);

  resolutionOptions: SelectOption[] = [
    { value: '1024x768', label: '1024px / 768px' }, { value: '1366x768', label: '1366px / 768px' },
    { value: '1366x1000', label: '1366px / 1000px' }, { value: '1920x1080', label: '1920px / 1080px' },
  ];
  screenModeOptions: SelectOption[] = [
    { value: 'order-screen', label: 'Экран заказа' }, { value: 'welcome-screen', label: 'Экран приветствия' },
  ];
  elementTypes: { type: ArrivalsElementType; label: string }[] = [
    { type: 'text', label: 'Текст' }, { type: 'image', label: 'Изображение' },
    { type: 'order-number', label: 'Номер заказа' }, { type: 'table-number', label: 'Номер стола' },
    { type: 'order-status', label: 'Статус заказа' }, { type: 'cooking-start-time', label: 'Время начала приготовления заказа' },
    { type: 'cooking-end-time', label: 'Время завершения приготовления заказа' }, { type: 'system-cooking-time', label: 'Системное время приготовления заказа' },
    { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа' }, { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания' },
    { type: 'client-name', label: 'Имя клиента' }, { type: 'client-phone', label: 'Номер телефона клиента' },
    { type: 'courier-name', label: 'Имя назначенного курьера' }, { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа' },
    { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки' }, { type: 'dispatch-time', label: 'Время отправки заказа' },
    { type: 'travel-time', label: 'Время в пути' }, { type: 'delivery-time', label: 'Время доставки заказа' },
    { type: 'delivery-status', label: 'Статус доставки' }, { type: 'client-comment', label: 'Комментарий от клиента' },
    { type: 'client-delivery-time', label: 'Время доставки, обозначенное клиентом' }, { type: 'cancel-reason', label: 'Причина отмены заказа' },
    { type: 'cancel-comment', label: 'Комментарий к отмене заказа' }, { type: 'cancel-time', label: 'Время отмены заказа' },
    { type: 'external-data', label: 'Внешние данные' },
    { type: 'price', label: 'Цена блюда' },
  ];

  themeCategories: ElementCategory[] = JSON.parse(JSON.stringify(ARRIVALS_THEME_CATEGORIES));

  toggleCategory(id: string): void {
    const cat = this.themeCategories.find(c => c.id === id);
    if (cat) cat.collapsed = !cat.collapsed;
  }

  get resWidth(): number { return parseInt(this.theme.resolution.split('x')[0]) || 1024; }
  get resHeight(): number { return parseInt(this.theme.resolution.split('x')[1]) || 768; }
  get selectedElement(): ArrivalsThemeElement | null {
    return this.selectedElementId ? (this.theme.elements.find(e => e.id === this.selectedElementId) ?? null) : null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'arrivals-themes', [...MOCK_ARRIVALS_THEMES]);
      const found = allThemes.find(t => t.id === Number(id));
      if (found) this.theme = JSON.parse(JSON.stringify(found));
    } else {
      this.theme.id = Date.now();
    }
    this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
    setTimeout(() => this.updateCanvasScale(), 0);
  }

  ngAfterViewInit(): void { this.updateCanvasScale(); }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    this.areaHelper.clearAll();
    this.sim.stopAuto();
  }

  onResolutionChange(): void { setTimeout(() => this.updateCanvasScale(), 0); }
  @HostListener('window:resize') onWindowResize(): void { this.updateCanvasScale(); }

  updateCanvasScale(): void {
    if (!this.canvasAreaRef?.nativeElement) return;
    const c = this.canvasAreaRef.nativeElement;
    this.canvasScale = Math.min((c.clientWidth - 16) / this.resWidth, (c.clientHeight - 16) / this.resHeight, 1);
  }

  onCanvasClick(): void { if (!this.dragState && !this.resizeState) this.deselectElement(); }

  getFilterSource(): ArrivalsOrderMock[] {
    return this.sim.active ? this.sim.orders : this.mockOrders;
  }

  /* ── Drag & Resize ── */
  onElementMouseDown(event: MouseEvent, el: ArrivalsThemeElement): void {
    if (event.button !== 0 || (event.target as HTMLElement).classList.contains('handle')) return;
    event.preventDefault(); event.stopPropagation();
    this.selectedElementId = el.id; this.panelView = 'element';
    this.dragState = { elementId: el.id, startMouseX: event.clientX, startMouseY: event.clientY, startElX: el.x, startElY: el.y };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  onHandleMouseDown(event: MouseEvent, el: ArrivalsThemeElement, handle: string): void {
    event.preventDefault(); event.stopPropagation();
    this.resizeState = { elementId: el.id, handle, startMouseX: event.clientX, startMouseY: event.clientY, startElX: el.x, startElY: el.y, startElW: el.width, startElH: el.height };
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private onDocMouseMove(event: MouseEvent): void {
    const s = this.canvasScale;
    if (this.dragState) {
      const el = this.theme.elements.find(e => e.id === this.dragState!.elementId);
      if (el) { el.x = Math.max(0, Math.round(this.dragState.startElX + (event.clientX - this.dragState.startMouseX) / s)); el.y = Math.max(0, Math.round(this.dragState.startElY + (event.clientY - this.dragState.startMouseY) / s)); }
    }
    if (this.resizeState) {
      const el = this.theme.elements.find(e => e.id === this.resizeState!.elementId);
      if (el) {
        const dx = (event.clientX - this.resizeState.startMouseX) / s, dy = (event.clientY - this.resizeState.startMouseY) / s, h = this.resizeState.handle, min = 20;
        if (h.includes('r')) el.width = Math.max(min, Math.round(this.resizeState.startElW + dx));
        if (h.includes('l')) { const nw = Math.max(min, Math.round(this.resizeState.startElW - dx)); el.x = Math.max(0, Math.round(this.resizeState.startElX + this.resizeState.startElW - nw)); el.width = nw; }
        if (h.includes('b')) el.height = Math.max(min, Math.round(this.resizeState.startElH + dy));
        if (h.includes('t')) { const nh = Math.max(min, Math.round(this.resizeState.startElH - dy)); el.y = Math.max(0, Math.round(this.resizeState.startElY + this.resizeState.startElH - nh)); el.height = nh; }
      }
    }
  }

  private onDocMouseUp(): void {
    this.dragState = null; this.resizeState = null;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  /* ── Selection ── */
  selectElement(id: string, event: Event): void { event.stopPropagation(); this.selectedElementId = id; this.panelView = 'element'; }
  selectElementFromList(id: string): void { this.selectedElementId = id; this.panelView = 'element'; }
  deselectElement(): void { this.selectedElementId = null; this.panelView = 'theme'; }

  /* ── Add / Delete ── */
  getPricePreview(el: ArrivalsThemeElement): string {
    const value = String(el.previewPrice ?? 350);
    if (!el.showCurrency) return value;
    const sym = el.currencySymbol || '₽';
    return el.currencyPosition === 'before' ? sym + ' ' + value : value + ' ' + sym;
  }

  getPriceTooltip(el: ArrivalsThemeElement): string {
    if (el.bindingType === 'modifier' && el.modifierName) return 'Модификатор: ' + el.modifierName;
    if (el.bindingType === 'size' && el.productName && el.sizeName) return el.productName + ' ' + el.sizeName;
    if (el.bindingType === 'product' && el.productName) return el.productName;
    return 'Товар не привязан';
  }

  addElement(type: ArrivalsElementType): void {
    const label = this.elementTypes.find(et => et.type === type)?.label ?? type;
    const el: ArrivalsThemeElement = { id: Date.now().toString() + Math.random().toString(36).slice(2, 6), type, name: label, x: 20 + this.theme.elements.length * 20, y: 20 + this.theme.elements.length * 20, width: 120, height: 60, borderWidth: 1, borderColor: '#000000', borderRadius: 0 };
    if (type === 'text') { el.text = 'Type something'; el.fontFamily = 'Arial'; el.fontSize = 14; el.fontBold = false; el.fontItalic = false; el.textAlign = 'left'; }
    if (type === 'price') { el.name = 'Цена блюда'; el.fontFamily = 'Arial'; el.fontSize = 14; el.fontBold = false; el.fontItalic = false; el.textAlign = 'left'; el.productId = undefined; el.productName = undefined; el.sizeId = null; el.sizeName = undefined; el.showCurrency = true; el.currencySymbol = '₽'; el.currencyPosition = 'after'; }
    if (type === 'area') { el.name = 'Область контрола'; el.width = 300; el.height = 500; el.borderWidth = 2; el.borderColor = '#90CAF9'; el.borderRadius = 4; el.areaBgColor = '#ffffff'; el.areaControlId = this.availableControls.length > 0 ? this.availableControls[0].id : undefined; el.areaMode = 'list'; el.areaListDirection = 'top'; el.areaMaxColumns = 1; el.areaStatusType = 'kitchen'; el.areaStatuses = []; el.areaOrderTypes = ['ordinary', 'courier', 'pickup']; el.areaOrderSources = []; el.areaSortOrder = 'oldest-first'; el.areaInterlineSpacing = 0; }
    this.theme.elements.push(el);
    this.selectedElementId = el.id; this.panelView = 'element';
  }

  requestDeleteElement(el: ArrivalsThemeElement, event: Event): void { event.stopPropagation(); this.deleteElementTarget = el; }
  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.theme.elements = this.theme.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) this.deselectElement();
      this.deleteElementTarget = null;
    }
  }

  onAreaControlChange(): void { if (this.selectedElement) { this.areaHelper.reset(this.selectedElement.id); this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]); } }

  /* ── Save ── */
  save(): void {
    const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'arrivals-themes', [...MOCK_ARRIVALS_THEMES]);
    const idx = allThemes.findIndex(t => t.id === this.theme.id);
    if (idx >= 0) allThemes[idx] = JSON.parse(JSON.stringify(this.theme)); else allThemes.push(JSON.parse(JSON.stringify(this.theme)));
    this.storage.save('web-screens', 'arrivals-themes', allThemes);
    const list: any[] = this.storage.load('web-screens', 'arrivals-list', []);
    if (!list.find((i: any) => i.id === this.theme.id)) { list.push({ id: this.theme.id, name: this.theme.name, itemType: 'theme', resolution: this.theme.resolution, createdBy: 'Моя' }); this.storage.save('web-screens', 'arrivals-list', list); }
    this.showToast('Тема сохранена');
  }

  goBack(): void { this.router.navigate(['/prototype/web-screens/themes-arrivals']); }
  private showToast(msg: string): void { this.toastMessage = msg; setTimeout(() => (this.toastMessage = ''), 3000); }
}
