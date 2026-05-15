import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiInputComponent, UiSelectComponent, UiTextareaComponent, UiConfirmDialogComponent } from '@/components/ui';
import type { SelectOption } from '@/components/ui';
import { StorageService } from '@/shared/storage.service';
import { MOCK_ARRIVALS_THEMES, MOCK_ARRIVALS_CONTROLS, MOCK_ARRIVALS_ORDERS } from '../data/mock-data';
import {
  ArrivalsTheme,
  ArrivalsThemeElement,
  ArrivalsElementType,
  ArrivalsControl,
  ArrivalsOrderMock,
} from '../types';

type PanelView = 'theme' | 'add-element' | 'element';

interface ElementTypeOption {
  type: ArrivalsElementType;
  label: string;
}

interface AreaOrderPosition {
  order: ArrivalsOrderMock;
  x: number;
  y: number;
  width: number;
  height: number;
  isNew?: boolean;
  controlElements: ArrivalsThemeElement[];
  bboxX: number;
  bboxY: number;
  bboxW: number;
  bboxH: number;
  scale: number;
}

@Component({
  selector: 'app-arrivals-theme-editor-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiInputComponent,
    UiSelectComponent,
    UiTextareaComponent,
    UiConfirmDialogComponent,
  ],
  template: `
    <div class="editor-layout">
      <!-- ═══════ CANVAS AREA ═══════ -->
      <div class="canvas-area">
        <div class="canvas-scroll">
          <div
            class="canvas-viewport"
            [style.width.px]="resWidth"
            [style.height.px]="resHeight"
            [style.transform]="'scale(' + canvasScale + ')'"
            (click)="onCanvasClick()"
          >
            <!-- Elements on canvas -->
            <div
              *ngFor="let el of theme.elements"
              class="canvas-element"
              [class.selected]="selectedElementId === el.id"
              [class.dragging]="dragState?.elementId === el.id"
              [class.area-element]="el.type === 'area'"
              [style.left.px]="el.x"
              [style.top.px]="el.y"
              [style.width.px]="el.width"
              [style.height.px]="el.height"
              [style.border-width.px]="el.borderWidth"
              [style.border-color]="el.borderColor"
              [style.border-radius.px]="el.borderRadius"
              (click)="selectElement(el.id, $event)"
              (mousedown)="onElementMouseDown($event, el)"
            >
              <!-- Area element -->
              <div *ngIf="el.type === 'area'" class="el-area"
                [style.background-color]="el.areaBgColor || '#ffffff'">
                <div class="el-area-header" (mousedown)="$event.stopPropagation()">
                  <lucide-icon name="layout-grid" [size]="14" class="area-icon"></lucide-icon>
                  <span class="area-name">{{ el.name }}</span>
                  <div class="area-emu-controls" *ngIf="el.areaControlId">
                    <button class="area-emu-btn" (click)="toggleEmulation(el); $event.stopPropagation()"
                      [title]="isEmulationRunning(el) ? 'Пауза' : 'Старт'">
                      <lucide-icon [name]="isEmulationRunning(el) ? 'pause' : 'play'" [size]="10"></lucide-icon>
                    </button>
                    <button class="area-emu-btn" (click)="resetEmulation(el); $event.stopPropagation()" title="Сброс">
                      <lucide-icon name="rotate-ccw" [size]="10"></lucide-icon>
                    </button>
                    <button class="area-emu-btn" (click)="fillEmulation(el); $event.stopPropagation()" title="Заполнить">
                      <lucide-icon name="maximize-2" [size]="10"></lucide-icon>
                    </button>
                  </div>
                </div>
                <div class="el-area-body" *ngIf="!el.areaControlId">
                  <span class="area-placeholder">
                    <lucide-icon name="mouse-pointer-click" [size]="20"></lucide-icon>
                    Выберите контрол
                  </span>
                </div>
                <div class="el-area-content" *ngIf="el.areaControlId">
                  <!-- Control slots -->
                  <div *ngFor="let pos of getAreaOrderPositions(el)"
                    class="area-control-slot"
                    [style.left.px]="pos.x"
                    [style.top.px]="pos.y"
                    [style.width.px]="pos.width"
                    [style.height.px]="pos.height">
                    <!-- Scaled control canvas -->
                    <div class="area-control-canvas"
                      [style.width.px]="pos.bboxW"
                      [style.height.px]="pos.bboxH"
                      [style.transform]="'scale(' + pos.scale + ')'">
                      <div *ngFor="let ce of pos.controlElements"
                        class="area-ctrl-el"
                        [style.left.px]="ce.x - pos.bboxX"
                        [style.top.px]="ce.y - pos.bboxY"
                        [style.width.px]="ce.width"
                        [style.height.px]="ce.height"
                        [style.border-width.px]="ce.borderWidth"
                        [style.border-color]="ce.borderColor"
                        [style.border-radius.px]="ce.borderRadius">
                        <!-- Text element -->
                        <span *ngIf="ce.type === 'text'" class="area-ctrl-text"
                          [style.font-family]="ce.fontFamily"
                          [style.font-size.px]="ce.fontSize"
                          [style.font-weight]="ce.fontBold ? 'bold' : 'normal'"
                          [style.font-style]="ce.fontItalic ? 'italic' : 'normal'"
                          [style.text-align]="ce.textAlign">{{ ce.text || '' }}</span>
                        <!-- Image element -->
                        <span *ngIf="ce.type === 'image'" class="area-ctrl-img">
                          <lucide-icon name="image" [size]="16"></lucide-icon>
                        </span>
                        <!-- Generic data elements (order-number, client-name, etc.) -->
                        <span *ngIf="ce.type !== 'text' && ce.type !== 'image' && !isOrderVariant(ce.type)"
                          class="area-ctrl-data"
                          [style.font-family]="ce.fontFamily || 'Roboto'"
                          [style.font-size.px]="ce.fontSize || 14"
                          [style.font-weight]="ce.fontBold ? 'bold' : 'normal'"
                          [style.font-style]="ce.fontItalic ? 'italic' : 'normal'"
                          [style.text-align]="ce.textAlign || 'left'">{{ getAreaElementText(ce, pos.order) }}</span>
                        <!-- A: Order items table -->
                        <div *ngIf="ce.type === 'order-items'" class="area-ctrl-ot">
                          <div class="area-ot-header" *ngIf="ce.orderShowHeader !== false"
                            [style.background]="ce.orderHeaderBg || '#333'"
                            [style.height.px]="ce.orderHeaderHeight || 36">
                            <span *ngIf="ce.orderShowName !== false" class="area-ot-col-name"
                              [style.color]="ce.orderHeaderFontColor || '#fff'"
                              [style.font-size.px]="ce.orderHeaderFontSize || 14"
                              [style.font-family]="ce.orderHeaderFontFamily || 'Roboto'">
                              {{ ce.orderShowNameLabel !== false ? (ce.orderNameLabel || 'Наименование') : '' }}</span>
                            <span *ngIf="ce.orderShowQty !== false" class="area-ot-col-qty"
                              [style.color]="ce.orderHeaderFontColor || '#fff'"
                              [style.font-size.px]="ce.orderHeaderFontSize || 14"
                              [style.font-family]="ce.orderHeaderFontFamily || 'Roboto'">
                              {{ ce.orderShowQtyLabel !== false ? (ce.orderQtyLabel || 'Кол-во') : '' }}</span>
                            <span *ngIf="ce.orderShowStatus !== false" class="area-ot-col-status"
                              [style.color]="ce.orderHeaderFontColor || '#fff'"
                              [style.font-size.px]="ce.orderHeaderFontSize || 14"
                              [style.font-family]="ce.orderHeaderFontFamily || 'Roboto'">
                              {{ ce.orderShowStatusLabel !== false ? (ce.orderStatusLabel || 'Статус') : '' }}</span>
                          </div>
                          <div *ngFor="let item of pos.order.items" class="area-ot-row"
                            [style.background]="isItemReady(item) ? (ce.orderReadyColor || '#e8f5e9') : (ce.orderNotReadyColor || '#fff')"
                            [style.height.px]="ce.orderRowHeight || 32">
                            <span *ngIf="ce.orderShowName !== false" class="area-ot-col-name"
                              [style.color]="ce.orderNameFontColor || '#333'"
                              [style.font-size.px]="ce.orderNameFontSize || 14"
                              [style.font-family]="ce.orderNameFontFamily || 'Roboto'">{{ item.name }}</span>
                            <span *ngIf="ce.orderShowQty !== false" class="area-ot-col-qty"
                              [style.color]="ce.orderQtyFontColor || '#333'"
                              [style.font-size.px]="ce.orderQtyFontSize || 14"
                              [style.font-family]="ce.orderQtyFontFamily || 'Roboto'">{{ item.qty }}</span>
                            <span *ngIf="ce.orderShowStatus !== false" class="area-ot-col-status"
                              [style.color]="isItemReady(item) ? (ce.orderReadyStatusFontColor || '#2e7d32') : (ce.orderPendingStatusFontColor || '#e65100')"
                              [style.font-size.px]="ce.orderStatusFontSize || 14"
                              [style.font-family]="ce.orderStatusFontFamily || 'Roboto'"
                              [style.font-weight]="isItemReady(item) ? '600' : '400'">{{ item.status }}</span>
                          </div>
                        </div>
                        <!-- B: Two zones -->
                        <div *ngIf="ce.type === 'order-items-zones'" class="area-ctrl-zones">
                          <div class="area-z-section">
                            <div class="area-z-header" [style.background]="ce.zonesReadyBg || '#e8f5e9'"
                              [style.font-size.px]="ce.zonesHeaderFontSize || 11">✔ {{ ce.zonesReadyHeaderText || 'МОЖНО ЗАБРАТЬ' }}</div>
                            <div *ngFor="let item of getReadyOrderItems(pos.order)" class="area-z-row"
                              [style.background]="ce.zonesReadyBg || '#f1f8e9'"
                              [style.font-size.px]="ce.zonesItemFontSize || 12">
                              <span class="area-z-check">✔</span>
                              <span class="area-z-name">{{ item.name }}</span>
                              <span class="area-z-qty">×{{ item.qty }}</span>
                            </div>
                          </div>
                          <div class="area-z-section" *ngIf="getPendingOrderItems(pos.order).length > 0">
                            <div class="area-z-header" [style.background]="ce.zonesPendingBg || '#fff3e0'"
                              [style.font-size.px]="ce.zonesHeaderFontSize || 11">⏳ {{ ce.zonesPendingHeaderText || 'ГОТОВИТСЯ' }}</div>
                            <div *ngFor="let item of getPendingOrderItems(pos.order)" class="area-z-row"
                              [style.background]="ce.zonesPendingBg || '#fff8e1'"
                              [style.font-size.px]="ce.zonesItemFontSize || 12">
                              <span class="area-z-name">{{ item.name }}</span>
                              <span class="area-z-qty">×{{ item.qty }}</span>
                            </div>
                          </div>
                        </div>
                        <!-- C: Progress circle -->
                        <div *ngIf="ce.type === 'order-items-progress'" class="area-ctrl-progress">
                          <div class="area-p-hero">
                            <div class="area-p-circle"
                              [style.width.px]="ce.progressCircleSize || 64"
                              [style.height.px]="ce.progressCircleSize || 64">
                              <svg viewBox="0 0 80 80" class="area-p-svg">
                                <circle cx="40" cy="40" r="34" class="area-p-track"
                                  [style.stroke]="ce.progressTrackColor || '#e0e0e0'"></circle>
                                <circle cx="40" cy="40" r="34" class="area-p-fill"
                                  [style.stroke]="ce.progressCircleColor || '#4caf50'"
                                  [style.stroke-dasharray]="213.6"
                                  [style.stroke-dashoffset]="213.6 - 213.6 * getOrderReadyPercent(pos.order) / 100"></circle>
                              </svg>
                              <div class="area-p-text">
                                <span *ngIf="ce.progressShowPercent !== false" class="area-p-pct">{{ getOrderReadyPercent(pos.order) }}%</span>
                                <span *ngIf="ce.progressShowCount !== false" class="area-p-count">
                                  {{ getReadyOrderItems(pos.order).length }}/{{ pos.order.items.length }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="area-p-list">
                            <div *ngFor="let item of pos.order.items" class="area-p-item" [class.ready]="isItemReady(item)"
                              [style.font-size.px]="ce.progressItemFontSize || 12">
                              <span class="area-p-marker" [class.ready]="isItemReady(item)">{{ isItemReady(item) ? '✔' : '○' }}</span>
                              <span class="area-p-name">{{ item.name }}</span>
                              <span class="area-p-qty">×{{ item.qty }}</span>
                            </div>
                          </div>
                        </div>
                        <!-- D: Checklist -->
                        <div *ngIf="ce.type === 'order-items-checklist'" class="area-ctrl-checklist">
                          <div class="area-cl-header">
                            <span>Состав заказа</span>
                            <span *ngIf="ce.checklistShowCounter !== false" class="area-cl-counter">
                              {{ getReadyOrderItems(pos.order).length }}/{{ pos.order.items.length }} ✔
                            </span>
                          </div>
                          <div *ngFor="let item of pos.order.items" class="area-cl-row" [class.ready]="isItemReady(item)"
                            [style.background]="isItemReady(item) ? (ce.checklistReadyBg || '#f1f8e9') : 'transparent'"
                            [style.font-size.px]="ce.checklistItemFontSize || 12">
                            <span class="area-cl-marker" [class.ready]="isItemReady(item)">{{ isItemReady(item) ? '✔' : '○' }}</span>
                            <span class="area-cl-name" [class.ready]="isItemReady(item)">{{ item.name }}</span>
                            <span class="area-cl-qty">×{{ item.qty }}</span>
                          </div>
                        </div>
                        <!-- E: Cards -->
                        <div *ngIf="ce.type === 'order-items-cards'" class="area-ctrl-cards">
                          <div class="area-cards-grid" [style.gap.px]="ce.cardsGap || 4">
                            <div *ngFor="let item of pos.order.items" class="area-card-tile"
                              [class.ready]="isItemReady(item)"
                              [style.width]="'calc(' + (100 / (ce.cardsPerRow || 2)) + '% - ' + (ce.cardsGap || 4) + 'px)'"
                              [style.border-color]="isItemReady(item) ? (ce.cardsReadyBorderColor || '#4caf50') : '#e0e0e0'">
                              <div class="area-card-status" [class.ready]="isItemReady(item)"
                                [style.background]="isItemReady(item) ? (ce.cardsReadyBg || '#e8f5e9') : (ce.cardsPendingBg || '#fff3e0')"
                                [style.color]="isItemReady(item) ? '#2e7d32' : '#e65100'">
                                {{ isItemReady(item) ? '✔ ГОТОВО' : '⏳ ' + item.status }}
                              </div>
                              <div class="area-card-body" [style.font-size.px]="ce.cardsItemFontSize || 11">
                                <span>{{ item.name }}</span>
                                <span>×{{ item.qty }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Empty control fallback -->
                  <div *ngIf="getAreaOrderPositions(el).length === 0" class="area-empty-hint">
                    {{ getControlForArea(el) ? 'Нет заказов по фильтру' : 'Контрол не найден' }}
                  </div>
                </div>
              </div>
              <!-- Text element -->
              <span *ngIf="el.type === 'text'" class="el-text"
                [style.font-family]="el.fontFamily"
                [style.font-size.px]="el.fontSize"
                [style.font-weight]="el.fontBold ? 'bold' : 'normal'"
                [style.font-style]="el.fontItalic ? 'italic' : 'normal'"
                [style.text-align]="el.textAlign"
              >{{ el.text || 'Type something' }}</span>
              <span *ngIf="el.type === 'image'" class="el-placeholder">
                <lucide-icon name="image" [size]="24"></lucide-icon>
              </span>
              <span *ngIf="el.type !== 'text' && el.type !== 'image' && el.type !== 'area'"
                class="el-placeholder-label">{{ el.name }}</span>

              <!-- Selection handles -->
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

      <!-- ═══════ RIGHT PANEL ═══════ -->
      <div class="control-panel">
        <!-- Panel header -->
        <div class="panel-header" (click)="panelCollapsed = !panelCollapsed">
          <span>Панель управления</span>
          <lucide-icon [name]="panelCollapsed ? 'chevron-right' : 'chevron-down'" [size]="18"></lucide-icon>
        </div>

        <div *ngIf="!panelCollapsed" class="panel-body">

          <!-- ──── VIEW: Theme properties ──── -->
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

            <div class="section-divider">Настройка режима</div>

            <div class="field-group">
              <select class="field-select" [(ngModel)]="theme.screenMode">
                <option *ngFor="let m of screenModeOptions" [value]="m.value">{{ m.label }}</option>
              </select>
            </div>

            <div class="section-divider">Элементы</div>

            <!-- List of existing elements -->
            <div *ngFor="let el of theme.elements; let i = index" class="element-list-item"
              [class.active]="selectedElementId === el.id"
              (click)="selectElementFromList(el.id)">
              <span class="el-list-name">{{ el.name }}</span>
              <button class="el-list-delete" (click)="requestDeleteElement(el, $event)" title="Удалить">
                <lucide-icon name="x" [size]="14"></lucide-icon>
              </button>
            </div>

            <button class="btn-add-element" (click)="panelView = 'add-element'">
              Добавить элемент
            </button>
          </ng-container>

          <!-- ──── VIEW: Add element picker ──── -->
          <ng-container *ngIf="panelView === 'add-element'">
            <div class="add-element-header">
              <span class="add-element-title">Добавить элемент</span>
              <button class="icon-btn-sm" (click)="panelView = 'theme'">
                <lucide-icon name="x" [size]="18"></lucide-icon>
              </button>
            </div>

            <div class="element-type-list">
              <!-- Область (специальный элемент) -->
              <div class="element-type-item element-type-area" (click)="addElement('area')">
                <lucide-icon name="layout-grid" [size]="16"></lucide-icon>
                Область
              </div>
              <div class="element-type-separator">Элементы</div>
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
              <span class="bc-link" (click)="deselectElement()">Тема</span>
              <span class="bc-separator">/</span>
              <span class="bc-current">{{ selectedElement.name }}</span>
            </div>

            <!-- ── Text element ── -->
            <ng-container *ngIf="selectedElement.type === 'text'">
              <div class="field-group">
                <label class="field-label">Текст</label>
                <textarea class="field-textarea" rows="3"
                  [(ngModel)]="selectedElement.text"></textarea>
              </div>

              <!-- Макет -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <!-- Граница -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>

              <!-- Шрифт -->
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('font')">
                  <span>Шрифт</span>
                  <lucide-icon [name]="isSectionOpen('font') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('font')" class="section-content">
                  <div class="field-group">
                    <label class="field-label">Семейство</label>
                    <select class="field-select" [(ngModel)]="selectedElement.fontFamily">
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Размер</label><input type="number" [(ngModel)]="selectedElement.fontSize" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row" style="gap: 16px;">
                    <label class="field-check">
                      <input type="checkbox" [(ngModel)]="selectedElement.fontBold" /> <strong>B</strong>
                    </label>
                    <label class="field-check">
                      <input type="checkbox" [(ngModel)]="selectedElement.fontItalic" /> <em>I</em>
                    </label>
                  </div>
                  <div class="fields-row" style="gap: 4px; margin-top: 8px;">
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'left'" (click)="selectedElement.textAlign = 'left'">
                      <lucide-icon name="align-left" [size]="16"></lucide-icon>
                    </button>
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'center'" (click)="selectedElement.textAlign = 'center'">
                      <lucide-icon name="align-center" [size]="16"></lucide-icon>
                    </button>
                    <button class="align-btn" [class.active]="selectedElement.textAlign === 'right'" (click)="selectedElement.textAlign = 'right'">
                      <lucide-icon name="align-right" [size]="16"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── Image element ── -->
            <ng-container *ngIf="selectedElement.type === 'image'">
              <div class="field-group">
                <label class="field-label">URL изображения</label>
                <input class="field-input" [(ngModel)]="selectedElement.imageUrl" placeholder="https://..." />
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── Generic element ── -->
            <ng-container *ngIf="isGenericElement(selectedElement.type)">
              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Макет</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

            <!-- ── Area element ── -->
            <ng-container *ngIf="selectedElement.type === 'area'">
              <div class="field-group">
                <label class="field-label">Контрол</label>
                <select class="field-select" [(ngModel)]="selectedElement.areaControlId" (ngModelChange)="onAreaControlChange()">
                  <option [ngValue]="undefined">\u2014 Выберите контрол \u2014</option>
                  <option *ngFor="let c of availableControls" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </div>

              <div class="field-group">
                <label class="field-label">Название области</label>
                <input class="field-input" [(ngModel)]="selectedElement.name" />
              </div>

              <div class="section-divider">Настройки</div>

              <div class="field-group">
                <label class="field-label">Режим области</label>
                <select class="field-select" [(ngModel)]="selectedElement.areaMode">
                  <option value="list">Лист</option>
                  <option value="dynamic">Динамически заполняемая область</option>
                </select>
              </div>

              <ng-container *ngIf="selectedElement.areaMode === 'list'">
                <div class="field-group">
                  <label class="field-label">Расположение контролов</label>
                  <select class="field-select" [(ngModel)]="selectedElement.areaListDirection">
                    <option value="top">Новые заказы выше</option>
                    <option value="bottom">Готовые заказы выше</option>
                  </select>
                </div>
                <div class="field-group">
                  <label class="field-label">Макс. кол-во столбцов</label>
                  <input type="number" class="field-input" [(ngModel)]="selectedElement.areaMaxColumns" min="1" max="4" />
                </div>
              </ng-container>

              <div class="field-group">
                <label class="field-label">Тип статуса заказа</label>
                <select class="field-select" [(ngModel)]="selectedElement.areaStatusType">
                  <option value="kitchen">Статусы кухни</option>
                  <option value="delivery">Доставка</option>
                  <option value="balancer">Балансер</option>
                </select>
              </div>

              <div class="field-group">
                <label class="field-label">Статус заказа</label>
                <div class="checkbox-group">
                  <label *ngFor="let s of getAvailableStatuses()" class="field-check">
                    <input type="checkbox" [checked]="isStatusSelected(s)" (change)="toggleStatus(s)" />
                    {{ s }}
                  </label>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Типы заказов</label>
                <div class="checkbox-group">
                  <label class="field-check">
                    <input type="checkbox" [checked]="isOrderTypeSelected('ordinary')" (change)="toggleOrderType('ordinary')" /> Обычные
                  </label>
                  <label class="field-check">
                    <input type="checkbox" [checked]="isOrderTypeSelected('courier')" (change)="toggleOrderType('courier')" /> Доставка курьером
                  </label>
                  <label class="field-check">
                    <input type="checkbox" [checked]="isOrderTypeSelected('pickup')" (change)="toggleOrderType('pickup')" /> Самовывоз
                  </label>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Сортировка</label>
                <select class="field-select" [(ngModel)]="selectedElement.areaSortOrder">
                  <option value="oldest-first">От старых к новым</option>
                  <option value="newest-first">От новых к старым</option>
                </select>
              </div>

              <div class="field-group">
                <label class="field-label">Межстрочный интервал (px)</label>
                <input type="number" class="field-input" [(ngModel)]="selectedElement.areaInterlineSpacing" min="0" />
              </div>

              <div class="section-divider">Макет</div>

              <div class="field-group">
                <label class="field-label">Цвет фона</label>
                <input type="color" [(ngModel)]="selectedElement.areaBgColor" class="field-color" />
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('layout')">
                  <span>Позиция и размер</span>
                  <lucide-icon [name]="isSectionOpen('layout') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('layout')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>X</label><input type="number" [(ngModel)]="selectedElement.x" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Y</label><input type="number" [(ngModel)]="selectedElement.y" class="field-input-sm" /></div>
                  </div>
                  <div class="fields-row">
                    <div class="field-sm"><label>Ширина</label><input type="number" [(ngModel)]="selectedElement.width" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Высота</label><input type="number" [(ngModel)]="selectedElement.height" class="field-input-sm" /></div>
                  </div>
                </div>
              </div>

              <div class="collapsible-section">
                <div class="section-header" (click)="toggleSection('border')">
                  <span>Граница</span>
                  <lucide-icon [name]="isSectionOpen('border') ? 'chevron-up' : 'chevron-down'" [size]="16"></lucide-icon>
                </div>
                <div *ngIf="isSectionOpen('border')" class="section-content">
                  <div class="fields-row">
                    <div class="field-sm"><label>Толщина</label><input type="number" [(ngModel)]="selectedElement.borderWidth" class="field-input-sm" /></div>
                    <div class="field-sm"><label>Радиус</label><input type="number" [(ngModel)]="selectedElement.borderRadius" class="field-input-sm" /></div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Цвет</label>
                    <input type="color" [(ngModel)]="selectedElement.borderColor" class="field-color" />
                  </div>
                </div>
              </div>
            </ng-container>

          </ng-container>
        </div>

        <!-- Panel footer -->
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
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .editor-layout {
      display: flex; height: calc(100vh - 110px); margin: -20px -24px;
      font-family: Roboto, sans-serif;
    }

    /* ═══ Canvas ═══ */
    .canvas-area {
      flex: 1; min-width: 0; overflow: auto;
      background: #e0e0e0;
    }
    .canvas-scroll {
      display: flex; align-items: flex-start; justify-content: flex-start;
      min-height: 100%; padding: 0;
    }
    .canvas-viewport {
      position: relative; transform-origin: top left;
      background-color: #fff;
      background-image:
        linear-gradient(45deg, #ccc 25%, transparent 25%),
        linear-gradient(-45deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    /* Canvas elements */
    .canvas-element {
      position: absolute; border-style: dashed; cursor: move;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.5); transition: box-shadow 0.15s;
      font-size: 13px; color: #333; overflow: hidden;
      user-select: none;
    }
    .canvas-element:hover { box-shadow: 0 0 0 1px #448aff; }
    .canvas-element.selected {
      border-style: solid; border-color: #448aff !important;
      box-shadow: 0 0 0 1px #448aff;
    }
    .canvas-element.dragging { opacity: 0.85; transition: none; }

    .el-text { display: block; width: 100%; padding: 4px; word-break: break-word; }
    .el-counter { font-size: 20px; font-weight: 500; }
    .el-time { font-size: 16px; }
    .el-placeholder { color: #9e9e9e; }
    .el-placeholder-label { color: #9e9e9e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Area element */
    .canvas-element.area-element { border-style: dashed !important; }
    .el-area { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; }
    .el-area-header {
      display: flex; align-items: center; gap: 4px; padding: 4px 6px;
      background: rgba(25,118,210,0.08); border-bottom: 1px solid rgba(25,118,210,0.15);
      font-size: 11px; font-weight: 500; color: #1976D2;
    }
    .area-icon { flex-shrink: 0; color: #1976D2; }
    .area-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .el-area-body {
      flex: 1; display: flex; align-items: center; justify-content: center; padding: 8px;
    }
    .area-placeholder {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      color: #bdbdbd; font-size: 12px;
    }
    .area-control-info {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      color: #616161; font-size: 12px; text-align: center;
    }
    .area-mode-badge {
      display: inline-block; padding: 1px 6px; border-radius: 4px;
      background: #E3F2FD; color: #1976D2; font-size: 10px; font-weight: 500;
    }

    /* Element type separator */
    .element-type-separator {
      font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
      color: #9e9e9e; padding: 8px 12px 4px; font-weight: 500;
    }
    .element-type-area {
      display: flex; align-items: center; gap: 6px;
      border: 1px dashed #90CAF9 !important; color: #1976D2 !important;
      background: #E3F2FD !important; font-weight: 500 !important;
    }

    /* Area content — control element rendering */
    .el-area-content {
      position: relative; flex: 1; overflow: hidden;
    }
    .area-control-slot {
      position: absolute; overflow: hidden;
      background: rgba(255,255,255,0.95);
      border: 1px solid #e0e0e0; border-radius: 3px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      animation: areaOrderIn 0.4s ease;
    }
    @keyframes areaOrderIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .area-control-canvas {
      position: relative; transform-origin: top left;
    }
    .area-ctrl-el {
      position: absolute; overflow: hidden;
      border-style: solid; display: flex;
      align-items: center; justify-content: center;
      background: rgba(255,255,255,0.5);
    }
    .area-ctrl-text { display: block; width: 100%; padding: 2px; word-break: break-word; line-height: 1.2; }
    .area-ctrl-img { color: #9e9e9e; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .area-ctrl-data { display: block; width: 100%; padding: 2px; word-break: break-word; line-height: 1.2; }
    /* A: Order table */
    .area-ctrl-ot { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; font-family: Roboto, sans-serif; }
    .area-ot-header { display: flex; align-items: center; padding: 0 4px; flex-shrink: 0; font-weight: 600; }
    .area-ot-row { display: flex; align-items: center; padding: 0 4px; border-bottom: 1px solid #e0e0e0; }
    .area-ot-col-name { flex: 3; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 2px; }
    .area-ot-col-qty { flex: 1; text-align: center; padding: 0 2px; }
    .area-ot-col-status { flex: 2; text-align: center; padding: 0 2px; }
    /* B: Zones */
    .area-ctrl-zones { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; }
    .area-z-section { display: flex; flex-direction: column; }
    .area-z-header { padding: 4px 6px; font-weight: 700; text-transform: uppercase; }
    .area-z-row { display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-bottom: 1px solid #eee; }
    .area-z-check { color: #4caf50; font-size: 10px; }
    .area-z-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-z-qty { color: #757575; }
    /* C: Progress */
    .area-ctrl-progress { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; align-items: center; }
    .area-p-hero { display: flex; justify-content: center; padding: 4px; }
    .area-p-circle { position: relative; }
    .area-p-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .area-p-track { fill: none; stroke-width: 6; }
    .area-p-fill { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.5s; }
    .area-p-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 11px; line-height: 1.2; }
    .area-p-pct { font-weight: 600; display: block; }
    .area-p-count { font-size: 9px; color: #757575; display: block; }
    .area-p-list { width: 100%; flex: 1; overflow: hidden; }
    .area-p-item { display: flex; align-items: center; gap: 4px; padding: 2px 6px; }
    .area-p-item.ready { color: #4caf50; }
    .area-p-marker { width: 14px; text-align: center; font-size: 10px; color: #bdbdbd; }
    .area-p-marker.ready { color: #4caf50; }
    .area-p-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-p-qty { color: #757575; }
    /* D: Checklist */
    .area-ctrl-checklist { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; }
    .area-cl-header { display: flex; justify-content: space-between; padding: 4px 6px; font-weight: 600; font-size: 12px; border-bottom: 1px solid #eee; }
    .area-cl-counter { color: #4caf50; }
    .area-cl-row { display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-bottom: 1px solid #f5f5f5; }
    .area-cl-marker { width: 14px; text-align: center; font-size: 10px; color: #bdbdbd; }
    .area-cl-marker.ready { color: #4caf50; }
    .area-cl-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-cl-name.ready { text-decoration: line-through; color: #9e9e9e; }
    .area-cl-qty { color: #757575; }
    /* E: Cards */
    .area-ctrl-cards { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; }
    .area-cards-grid { flex: 1; display: flex; flex-wrap: wrap; padding: 4px; overflow: hidden; align-content: flex-start; }
    .area-card-tile { border: 1px solid #e0e0e0; border-radius: 3px; overflow: hidden; display: flex; flex-direction: column; }
    .area-card-tile.ready { border-color: #4caf50; }
    .area-card-status { padding: 2px 4px; font-size: 9px; font-weight: 700; text-align: center; }
    .area-card-status.ready { background: #e8f5e9; color: #2e7d32; }
    .area-card-body { padding: 2px 4px; display: flex; justify-content: space-between; }
    .area-empty-hint {
      display: flex; align-items: center; justify-content: center;
      height: 100%; color: #bdbdbd; font-size: 11px; font-style: italic;
    }

    /* Emulation controls in area header */
    .area-emu-controls {
      display: flex; gap: 2px; margin-left: auto;
    }
    .area-emu-btn {
      display: flex; align-items: center; justify-content: center;
      width: 18px; height: 18px; border: none; border-radius: 3px;
      background: rgba(25,118,210,0.12); color: #1976D2;
      cursor: pointer; transition: background 0.15s;
    }
    .area-emu-btn:hover { background: rgba(25,118,210,0.25); }

    /* Checkbox group in panel */
    .checkbox-group { display: flex; flex-direction: column; gap: 4px; }

    /* Resize handles */
    .handle {
      position: absolute; width: 8px; height: 8px; background: #fff;
      border: 2px solid #448aff; z-index: 2;
    }
    .handle.tl { top: -4px; left: -4px; cursor: nw-resize; }
    .handle.tr { top: -4px; right: -4px; cursor: ne-resize; }
    .handle.bl { bottom: -4px; left: -4px; cursor: sw-resize; }
    .handle.br { bottom: -4px; right: -4px; cursor: se-resize; }
    .handle.tm { top: -4px; left: calc(50% - 4px); cursor: n-resize; }
    .handle.bm { bottom: -4px; left: calc(50% - 4px); cursor: s-resize; }
    .handle.ml { top: calc(50% - 4px); left: -4px; cursor: w-resize; }
    .handle.mr { top: calc(50% - 4px); right: -4px; cursor: e-resize; }

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

    .panel-body {
      flex: 1; overflow-y: auto; padding: 16px;
    }

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

    /* ═══ Panel breadcrumb ═══ */
    .panel-breadcrumb {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 16px; font-size: 14px;
    }
    .bc-home { color: #ff6d00; cursor: pointer; }
    .bc-link { color: #ff6d00; cursor: pointer; font-weight: 500; }
    .bc-link:hover { text-decoration: underline; }
    .bc-separator { color: #9e9e9e; }
    .bc-current { color: #333; font-weight: 500; }

    /* ═══ Form fields ═══ */
    .field-group { margin-bottom: 12px; }
    .field-label { display: block; font-size: 12px; color: #757575; margin-bottom: 4px; }
    .field-input {
      width: 100%; height: 36px; padding: 0 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; transition: border-color 0.15s;
    }
    .field-input:focus { outline: none; border-color: #448aff; }
    .field-textarea {
      width: 100%; padding: 8px 10px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box; resize: vertical; transition: border-color 0.15s;
    }
    .field-textarea:focus { outline: none; border-color: #448aff; }
    .field-select {
      width: 100%; height: 36px; padding: 0 8px;
      border: 1px solid #e0e0e0; border-radius: 4px;
      font-size: 14px; font-family: Roboto, sans-serif; color: #333;
      background: #fff; cursor: pointer; box-sizing: border-box;
    }
    .field-color {
      width: 48px; height: 32px; padding: 0; border: 1px solid #e0e0e0;
      border-radius: 4px; cursor: pointer;
    }

    .fields-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .field-sm { flex: 1; }
    .field-sm label { display: block; font-size: 11px; color: #9e9e9e; margin-bottom: 2px; }
    .field-input-sm {
      width: 100%; height: 30px; padding: 0 6px;
      border: 1px solid #e0e0e0; border-radius: 3px;
      font-size: 13px; font-family: Roboto, sans-serif; color: #333;
      box-sizing: border-box;
    }
    .field-input-sm:focus { outline: none; border-color: #448aff; }

    .field-check { display: flex; align-items: center; gap: 4px; font-size: 14px; cursor: pointer; }

    .align-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border: 1px solid #e0e0e0; border-radius: 4px;
      background: transparent; color: #757575; cursor: pointer; transition: all 0.15s;
    }
    .align-btn:hover { background: #f0f0f0; }
    .align-btn.active { background: #e3f2fd; border-color: #448aff; color: #448aff; }

    /* ═══ Sections & dividers ═══ */
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

    .section-divider-bold {
      font-size: 14px; font-weight: 600; color: #333;
      margin: 16px 0 10px; padding-bottom: 4px;
    }

    .collapsible-section { border-bottom: 1px solid #f0f0f0; margin-bottom: 4px; }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; font-size: 14px; font-weight: 500; color: #333;
      cursor: pointer; user-select: none;
    }
    .section-header:hover { color: #448aff; }
    .section-content { padding-bottom: 12px; }

    /* ═══ Element list ═══ */
    .element-list-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; margin-bottom: 4px; border-radius: 4px;
      cursor: pointer; transition: background 0.15s; font-size: 13px;
    }
    .element-list-item:hover { background: #f5f5f5; }
    .element-list-item.active { background: #e3f2fd; }
    .el-list-name { flex: 1; }
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

    /* ═══ Add element type list ═══ */
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

    /* ═══ Toast ═══ */
    .toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      padding: 10px 24px; background: #333; color: #fff;
      border-radius: 6px; font-size: 14px; z-index: 9000;
      animation: toastIn 0.3s ease;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }

    /* ═══ Price element on canvas ═══ */
    .el-price {
      display: flex; align-items: center; gap: 4px;
      width: 100%; padding: 4px; word-break: break-word;
      color: #333; font-size: 13px;
    }
    .el-price .price-icon { color: #ff6d00; flex-shrink: 0; }

    /* ═══ Product binding ═══ */
    .product-binding { margin-bottom: 16px; }
    .binding-info {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 12px; background: #e8f5e9; border-radius: 6px;
      margin-bottom: 8px; font-size: 13px; color: #2e7d32;
    }
    .binding-icon { flex-shrink: 0; color: #43a047; }
    .binding-name { font-weight: 500; }
    .binding-size { font-weight: 400; color: #558b2f; }
    .binding-empty {
      padding: 10px 12px; background: #fff3e0; border-radius: 6px;
      margin-bottom: 8px; font-size: 13px; color: #e65100;
    }
    .btn-select-product {
      width: 100%; height: 36px; border: 1px solid #e0e0e0; border-radius: 4px;
      background: #fff; color: #448aff; font-size: 13px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s;
    }
    .btn-select-product:hover { background: #e3f2fd; border-color: #448aff; }

    /* ═══ Product navigator ═══ */
    .navigator-list { display: flex; flex-direction: column; margin-top: 8px; }
    .navigator-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 8px; font-size: 14px; color: #333;
      border-bottom: 1px solid #f5f5f5; cursor: pointer;
      transition: background 0.15s;
    }
    .navigator-item:hover { background: #f5f5f5; }
    .navigator-item:last-child { border-bottom: none; }
    .nav-icon-folder { color: #ff9800; }
    .nav-icon-product { color: #448aff; }
    .nav-item-name { flex: 1; }
    .nav-chevron { color: #bdbdbd; }
    .nav-breadcrumbs {
      display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
      margin-bottom: 8px; font-size: 12px;
    }
    .btn-nav-back {
      display: flex; align-items: center; gap: 6px;
      width: 100%; height: 34px; border: none; border-radius: 4px;
      background: #f5f5f5; color: #757575; font-size: 13px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer;
      transition: background 0.15s; margin-top: 8px; padding: 0 12px;
    }
    .btn-nav-back:hover { background: #eeeeee; color: #333; }
    .navigator-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 32px 0; color: #bdbdbd; font-size: 14px;
    }
    .empty-icon { color: #e0e0e0; }
    .nav-product-title {
      font-size: 14px; font-weight: 500; color: #333;
      padding: 4px 0 8px; border-bottom: 1px solid #e0e0e0;
    }
  `],
})
export class ArrivalsThemeEditorScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService);

  theme: ArrivalsTheme = {
    id: 0,
    name: 'Новая тема',
    resolution: '1024x768',
    screenMode: 'order-screen',
    elements: [],
  };

  panelCollapsed = false;
  panelView: PanelView = 'theme';
  selectedElementId: string | null = null;
  deleteElementTarget: ArrivalsThemeElement | null = null;
  toastMessage = '';
  canvasScale = 0.65;

  // Drag & resize state
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

  openSections = new Set<string>();

  // Area / emulation
  availableControls: ArrivalsControl[] = [];
  emulationStates = new Map<string, {
    running: boolean;
    visibleOrders: ArrivalsOrderMock[];
    intervalId?: any;
    orderIndex: number;
  }>();

  resolutionOptions: SelectOption[] = [
    { value: '1024x768', label: '1024px / 768px' },
    { value: '1366x768', label: '1366px / 768px' },
    { value: '1366x1000', label: '1366px / 1000px' },
    { value: '1920x1080', label: '1920px / 1080px' },
  ];

  screenModeOptions: SelectOption[] = [
    { value: 'order-screen', label: 'Экран заказа' },
    { value: 'welcome-screen', label: 'Экран приветствия' },
  ];

  elementTypes: ElementTypeOption[] = [
    { type: 'text', label: 'Текст' },
    { type: 'image', label: 'Изображение' },
    { type: 'order-number', label: 'Номер заказа' },
    { type: 'table-number', label: 'Номер стола' },
    { type: 'order-status', label: 'Статус заказа' },
    { type: 'cooking-start-time', label: 'Время начала приготовления заказа' },
    { type: 'cooking-end-time', label: 'Время завершения приготовления заказа' },
    { type: 'system-cooking-time', label: 'Системное время приготовления заказа' },
    { type: 'cooking-wait-time', label: 'Время ожидания приготовления заказа' },
    { type: 'expired-wait-flag', label: 'Признак истекшего времени ожидания' },
    { type: 'client-name', label: 'Имя клиента' },
    { type: 'client-phone', label: 'Номер телефона клиента' },
    { type: 'courier-name', label: 'Имя назначенного курьера' },
    { type: 'expected-delivery-time', label: 'Ожидаемое время доставки заказа' },
    { type: 'expected-delivery-duration', label: 'Ожидаемая продолжительность доставки' },
    { type: 'dispatch-time', label: 'Время отправки заказа' },
    { type: 'travel-time', label: 'Время в пути' },
    { type: 'delivery-time', label: 'Время доставки заказа' },
    { type: 'delivery-status', label: 'Статус доставки' },
    { type: 'client-comment', label: 'Комментарий от клиента' },
    { type: 'client-delivery-time', label: 'Время доставки, обозначенное клиентом' },
    { type: 'cancel-reason', label: 'Причина отмены заказа' },
    { type: 'cancel-comment', label: 'Комментарий к отмене заказа' },
    { type: 'cancel-time', label: 'Время отмены заказа' },
    { type: 'external-data', label: 'Внешние данные' },
  ];

  get resWidth(): number {
    return parseInt(this.theme.resolution.split('x')[0]) || 1024;
  }

  get resHeight(): number {
    return parseInt(this.theme.resolution.split('x')[1]) || 768;
  }

  get selectedElement(): ArrivalsThemeElement | null {
    if (!this.selectedElementId) return null;
    return this.theme.elements.find(e => e.id === this.selectedElementId) ?? null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      const numId = Number(id);
      const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'arrivals-themes', [...MOCK_ARRIVALS_THEMES]);
      const found = allThemes.find(t => t.id === numId);
      if (found) {
        this.theme = JSON.parse(JSON.stringify(found));
      }
    } else {
      this.theme.id = Date.now();
    }
    this.loadAvailableControls();
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    this.emulationStates.forEach(state => {
      if (state.intervalId) clearInterval(state.intervalId);
    });
  }

  onResolutionChange(): void {
    // Canvas updates reactively via resWidth / resHeight
  }

  onCanvasClick(): void {
    if (this.dragState || this.resizeState) return;
    this.deselectElement();
  }

  /* ── Drag ── */

  onElementMouseDown(event: MouseEvent, el: ArrivalsThemeElement): void {
    if (event.button !== 0) return;
    // Ignore if mousedown originated on a resize handle
    const target = event.target as HTMLElement;
    if (target.classList.contains('handle')) return;

    event.preventDefault();
    event.stopPropagation();
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

  /* ── Shared mouse handlers ── */

  private onDocMouseMove(event: MouseEvent): void {
    const scale = this.canvasScale;
    if (this.dragState) {
      const dx = (event.clientX - this.dragState.startMouseX) / scale;
      const dy = (event.clientY - this.dragState.startMouseY) / scale;
      const el = this.theme.elements.find(e => e.id === this.dragState!.elementId);
      if (el) {
        el.x = Math.max(0, Math.round(this.dragState.startElX + dx));
        el.y = Math.max(0, Math.round(this.dragState.startElY + dy));
      }
    }

    if (this.resizeState) {
      const dx = (event.clientX - this.resizeState.startMouseX) / scale;
      const dy = (event.clientY - this.resizeState.startMouseY) / scale;
      const el = this.theme.elements.find(e => e.id === this.resizeState!.elementId);
      if (el) {
        const h = this.resizeState.handle;
        const minSize = 20;

        // Horizontal
        if (h.includes('r')) {
          el.width = Math.max(minSize, Math.round(this.resizeState.startElW + dx));
        }
        if (h.includes('l')) {
          const newW = Math.max(minSize, Math.round(this.resizeState.startElW - dx));
          el.x = Math.max(0, Math.round(this.resizeState.startElX + this.resizeState.startElW - newW));
          el.width = newW;
        }
        // 'm' middle handles: tm/bm affect only height, ml/mr only width — handled above with 'l'/'r'

        // Vertical
        if (h.includes('b')) {
          el.height = Math.max(minSize, Math.round(this.resizeState.startElH + dy));
        }
        if (h.includes('t')) {
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

  selectElement(id: string, event: Event): void {
    event.stopPropagation();
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  selectElementFromList(id: string): void {
    this.selectedElementId = id;
    this.panelView = 'element';
  }

  deselectElement(): void {
    this.selectedElementId = null;
    this.panelView = 'theme';
  }

  addElement(type: ArrivalsElementType): void {
    const label = this.elementTypes.find(et => et.type === type)?.label ?? type;
    const el: ArrivalsThemeElement = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      type,
      name: label,
      x: 20 + this.theme.elements.length * 20,
      y: 20 + this.theme.elements.length * 20,
      width: 120,
      height: 60,
      borderWidth: 1,
      borderColor: '#000000',
      borderRadius: 0,
    };

    if (type === 'text') {
      el.text = 'Type something';
      el.fontFamily = 'Arial';
      el.fontSize = 14;
      el.fontBold = false;
      el.fontItalic = false;
      el.textAlign = 'left';
    }

    if (type === 'area') {
      el.name = 'Область контрола';
      el.width = 300;
      el.height = 500;
      el.borderWidth = 2;
      el.borderColor = '#90CAF9';
      el.borderRadius = 4;
      el.areaBgColor = '#ffffff';
      el.areaControlId = this.availableControls.length > 0 ? this.availableControls[0].id : undefined;
      el.areaMode = 'list';
      el.areaListDirection = 'top';
      el.areaMaxColumns = 1;
      el.areaStatusType = 'kitchen';
      el.areaStatuses = [];
      el.areaOrderTypes = ['ordinary', 'courier', 'pickup'];
      el.areaOrderSources = [];
      el.areaSortOrder = 'oldest-first';
      el.areaInterlineSpacing = 0;
    }

    this.theme.elements.push(el);
    this.selectedElementId = el.id;
    this.panelView = el.type === 'area' ? 'element' : 'element';
  }

  requestDeleteElement(el: ArrivalsThemeElement, event: Event): void {
    event.stopPropagation();
    this.deleteElementTarget = el;
  }

  confirmDeleteElement(): void {
    if (this.deleteElementTarget) {
      this.theme.elements = this.theme.elements.filter(e => e.id !== this.deleteElementTarget!.id);
      if (this.selectedElementId === this.deleteElementTarget.id) {
        this.deselectElement();
      }
      this.deleteElementTarget = null;
    }
  }

  toggleSection(key: string): void {
    if (this.openSections.has(key)) {
      this.openSections.delete(key);
    } else {
      this.openSections.add(key);
    }
  }

  isSectionOpen(key: string): boolean {
    return this.openSections.has(key);
  }

  isGenericElement(type: ArrivalsElementType): boolean {
    return !['text', 'image', 'area'].includes(type);
  }

  getControlName(controlId: number): string {
    const ctrl = this.availableControls.find(c => c.id === controlId);
    return ctrl ? ctrl.name : 'Контрол #' + controlId;
  }

  /* ── Area: load controls ── */

  private loadAvailableControls(): void {
    this.availableControls = this.storage.load('web-screens', 'arrivals-controls', [...MOCK_ARRIVALS_CONTROLS]);
  }

  /* ── Area: filter & sort orders ── */

  filterOrders(area: ArrivalsThemeElement): ArrivalsOrderMock[] {
    let orders: ArrivalsOrderMock[] = [...MOCK_ARRIVALS_ORDERS];

    if (area.areaStatuses && area.areaStatuses.length > 0) {
      orders = orders.filter(o => area.areaStatuses!.includes(o.status));
    }
    if (area.areaOrderTypes && area.areaOrderTypes.length > 0) {
      orders = orders.filter(o => area.areaOrderTypes!.includes(o.orderType));
    }
    if (area.areaOrderSources && area.areaOrderSources.length > 0) {
      orders = orders.filter(o => area.areaOrderSources!.includes(o.source));
    }
    if (area.areaSortOrder === 'newest-first') {
      orders.reverse();
    }
    return orders;
  }

  /* ── Area: compute control positions ── */

  getControlForArea(el: ArrivalsThemeElement): ArrivalsControl | null {
    if (!el.areaControlId) return null;
    return this.availableControls.find(c => c.id === el.areaControlId) || null;
  }

  getControlBBox(control: ArrivalsControl): { x: number; y: number; w: number; h: number } {
    if (!control.elements.length) return { x: 0, y: 0, w: 200, h: 100 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of control.elements) {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    }
    return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
  }

  computeControlPositions(area: ArrivalsThemeElement, orders: ArrivalsOrderMock[]): AreaOrderPosition[] {
    const control = this.getControlForArea(area);
    if (!control || !control.elements.length) return [];

    const bbox = this.getControlBBox(control);
    const spacing = area.areaInterlineSpacing || 0;
    const pad = 4;
    const headerH = 24;
    const cols = Math.max(1, Math.min(4, area.areaMaxColumns || 1));
    const areaW = area.width;
    const areaH = area.height;
    const slotW = Math.floor((areaW - pad * 2 - (cols - 1) * pad) / cols);
    const scale = bbox.w > 0 ? slotW / bbox.w : 1;
    const slotH = Math.round(bbox.h * scale);

    const positions: AreaOrderPosition[] = [];

    if (area.areaMode === 'list') {
      let col = 0;
      let row = 0;
      for (const order of orders) {
        const x = pad + col * (slotW + pad);
        let y: number;
        if (area.areaListDirection === 'bottom') {
          y = areaH - pad - (row + 1) * slotH - row * spacing;
        } else {
          y = headerH + pad + row * (slotH + spacing);
        }
        if (y + slotH > areaH || y < headerH) break;

        positions.push({
          order, x, y, width: slotW, height: slotH,
          controlElements: control.elements,
          bboxX: bbox.x, bboxY: bbox.y, bboxW: bbox.w, bboxH: bbox.h, scale,
        });
        col++;
        if (col >= cols) { col = 0; row++; }
      }
    } else {
      let posX = pad;
      let posY = headerH + pad;
      for (const order of orders) {
        if (posX + slotW > areaW - pad) {
          posX = pad;
          posY += slotH + spacing;
        }
        if (posY + slotH > areaH) break;

        positions.push({
          order, x: posX, y: posY, width: slotW, height: slotH,
          controlElements: control.elements,
          bboxX: bbox.x, bboxY: bbox.y, bboxW: bbox.w, bboxH: bbox.h, scale,
        });
        posX += slotW + pad;
      }
    }

    return positions;
  }

  getAreaOrderPositions(el: ArrivalsThemeElement): AreaOrderPosition[] {
    const state = this.emulationStates.get(el.id);
    const orders = state ? state.visibleOrders : this.filterOrders(el);
    return this.computeControlPositions(el, orders);
  }

  /* ── Area: emulation controls ── */

  isEmulationRunning(el: ArrivalsThemeElement): boolean {
    return this.emulationStates.get(el.id)?.running ?? false;
  }

  toggleEmulation(el: ArrivalsThemeElement): void {
    if (this.isEmulationRunning(el)) {
      this.pauseEmulation(el);
    } else {
      this.startEmulation(el);
    }
  }

  startEmulation(el: ArrivalsThemeElement): void {
    let state = this.emulationStates.get(el.id);
    if (!state) {
      state = { running: false, visibleOrders: [], orderIndex: 0 };
      this.emulationStates.set(el.id, state);
    }
    state.running = true;
    const allOrders = this.filterOrders(el);

    const tick = () => {
      const st = this.emulationStates.get(el.id);
      if (!st || !st.running) return;
      if (st.orderIndex < allOrders.length) {
        const testPositions = this.computeControlPositions(el, [...st.visibleOrders, allOrders[st.orderIndex]]);
        if (testPositions.length > st.visibleOrders.length) {
          st.visibleOrders = [...st.visibleOrders, allOrders[st.orderIndex]];
          st.orderIndex++;
        } else {
          this.pauseEmulation(el);
        }
      } else {
        this.pauseEmulation(el);
      }
    };

    state.intervalId = setInterval(tick, 2000);
  }

  pauseEmulation(el: ArrivalsThemeElement): void {
    const state = this.emulationStates.get(el.id);
    if (state) {
      state.running = false;
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = undefined;
      }
    }
  }

  resetEmulation(el: ArrivalsThemeElement): void {
    this.pauseEmulation(el);
    this.emulationStates.set(el.id, { running: false, visibleOrders: [], orderIndex: 0 });
  }

  fillEmulation(el: ArrivalsThemeElement): void {
    this.pauseEmulation(el);
    const allOrders = this.filterOrders(el);
    const visibleOrders: ArrivalsOrderMock[] = [];
    for (const order of allOrders) {
      const testPositions = this.computeControlPositions(el, [...visibleOrders, order]);
      if (testPositions.length > visibleOrders.length) {
        visibleOrders.push(order);
      } else {
        break;
      }
    }
    this.emulationStates.set(el.id, { running: false, visibleOrders, orderIndex: visibleOrders.length });
  }

  onAreaControlChange(): void {
    if (this.selectedElement) {
      this.resetEmulation(this.selectedElement);
      this.loadAvailableControls();
    }
  }

  /* ── Area: panel helpers ── */

  getAvailableStatuses(): string[] {
    const t = this.selectedElement?.areaStatusType;
    if (t === 'delivery') return ['Ожидает', 'Готовится', 'Готово', 'Выдача', 'В пути', 'Доставлен'];
    if (t === 'balancer') return ['Ожидает', 'Готовится', 'Готово'];
    return ['Ожидает', 'Готовится', 'Готово', 'Подан'];
  }

  isStatusSelected(status: string): boolean {
    return this.selectedElement?.areaStatuses?.includes(status) ?? false;
  }

  toggleStatus(status: string): void {
    if (!this.selectedElement?.areaStatuses) return;
    const idx = this.selectedElement.areaStatuses.indexOf(status);
    if (idx >= 0) { this.selectedElement.areaStatuses.splice(idx, 1); }
    else { this.selectedElement.areaStatuses.push(status); }
  }

  isOrderTypeSelected(type: 'ordinary' | 'courier' | 'pickup'): boolean {
    return this.selectedElement?.areaOrderTypes?.includes(type) ?? false;
  }

  toggleOrderType(type: 'ordinary' | 'courier' | 'pickup'): void {
    if (!this.selectedElement?.areaOrderTypes) return;
    const idx = this.selectedElement.areaOrderTypes.indexOf(type);
    if (idx >= 0) { this.selectedElement.areaOrderTypes.splice(idx, 1); }
    else { this.selectedElement.areaOrderTypes.push(type); }
  }

  /* ── Area: control element rendering helpers ── */

  isOrderVariant(type: ArrivalsElementType): boolean {
    return ['order-items', 'order-items-zones', 'order-items-progress', 'order-items-checklist', 'order-items-cards'].includes(type);
  }

  getAreaElementText(ctrlEl: ArrivalsThemeElement, order: ArrivalsOrderMock): string {
    switch (ctrlEl.type) {
      case 'order-number': return '#' + order.orderNumber;
      case 'client-name': return order.clientName;
      case 'table-number': return order.tableNumber ? 'Стол ' + order.tableNumber : '';
      case 'order-status': return order.status;
      case 'cooking-start-time': return order.cookingStartTime || '--:--';
      case 'expected-delivery-time': return order.expectedDeliveryTime || '--:--';
      case 'courier-name': return order.courierName || '';
      case 'client-phone': return order.clientPhone || '';
      default: return ctrlEl.name;
    }
  }

  isItemReady(item: { status: string }): boolean {
    return item.status === 'Готово' || item.status === 'Выдача' || item.status === 'Подан';
  }

  getReadyOrderItems(order: ArrivalsOrderMock): { name: string; qty: number; status: string }[] {
    return order.items.filter(i => this.isItemReady(i));
  }

  getPendingOrderItems(order: ArrivalsOrderMock): { name: string; qty: number; status: string }[] {
    return order.items.filter(i => !this.isItemReady(i));
  }

  getOrderReadyPercent(order: ArrivalsOrderMock): number {
    if (!order.items.length) return 0;
    return Math.round((this.getReadyOrderItems(order).length / order.items.length) * 100);
  }

  save(): void {
    const allThemes: ArrivalsTheme[] = this.storage.load('web-screens', 'arrivals-themes', [...MOCK_ARRIVALS_THEMES]);
    const idx = allThemes.findIndex(t => t.id === this.theme.id);
    if (idx >= 0) {
      allThemes[idx] = JSON.parse(JSON.stringify(this.theme));
    } else {
      allThemes.push(JSON.parse(JSON.stringify(this.theme)));
    }
    this.storage.save('web-screens', 'arrivals-themes', allThemes);

    // Also update list if it's a new theme
    const list: any[] = this.storage.load('web-screens', 'arrivals-list', []);
    if (!list.find((i: any) => i.id === this.theme.id)) {
      list.push({
        id: this.theme.id,
        name: this.theme.name,
        itemType: 'theme',
        resolution: this.theme.resolution,
        createdBy: 'Моя',
      });
      this.storage.save('web-screens', 'arrivals-list', list);
    }

    this.showToast('Тема сохранена');
  }

  goBack(): void {
    this.router.navigate(['/prototype/web-screens/themes-arrivals']);
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = ''), 3000);
  }
}
