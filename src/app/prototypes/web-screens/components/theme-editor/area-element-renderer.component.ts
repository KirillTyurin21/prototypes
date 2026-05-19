import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsThemeElement, ArrivalsControl, ArrivalsOrderMock } from '../../types';

export interface AreaOrderPosition {
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
  selector: 'app-area-element-renderer',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="el-area" [style.background-color]="element.areaBgColor || '#ffffff'">
      <div class="el-area-header" (mousedown)="$event.stopPropagation()">
        <lucide-icon name="layout-grid" [size]="14" class="area-icon"></lucide-icon>
        <span class="area-name">{{ element.name }}</span>
        <div class="area-emu-controls" *ngIf="element.areaControlId">
          <button class="area-emu-btn" (click)="toggleEmu.emit(element); $event.stopPropagation()"
            [title]="emulationRunning ? 'Пауза' : 'Старт'">
            <lucide-icon [name]="emulationRunning ? 'pause' : 'play'" [size]="10"></lucide-icon>
          </button>
          <button class="area-emu-btn" (click)="resetEmu.emit(element); $event.stopPropagation()" title="Сброс">
            <lucide-icon name="rotate-ccw" [size]="10"></lucide-icon>
          </button>
          <button class="area-emu-btn" (click)="fillEmu.emit(element); $event.stopPropagation()" title="Заполнить">
            <lucide-icon name="maximize-2" [size]="10"></lucide-icon>
          </button>
        </div>
      </div>
      <div class="el-area-body" *ngIf="!element.areaControlId">
        <span class="area-placeholder">
          <lucide-icon name="mouse-pointer-click" [size]="20"></lucide-icon>
          Выберите контрол
        </span>
      </div>
      <div class="el-area-content" *ngIf="element.areaControlId">
        <!-- Control slots -->
        <div *ngFor="let pos of orderPositions"
          class="area-control-slot"
          [style.left.px]="pos.x"
          [style.top.px]="pos.y"
          [style.width.px]="pos.width"
          [style.height.px]="pos.height">
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
              <!-- Text -->
              <span *ngIf="ce.type === 'text'" class="area-ctrl-text"
                [style.font-family]="ce.fontFamily"
                [style.font-size.px]="ce.fontSize"
                [style.font-weight]="ce.fontBold ? 'bold' : 'normal'"
                [style.font-style]="ce.fontItalic ? 'italic' : 'normal'"
                [style.text-align]="ce.textAlign">{{ ce.text || '' }}</span>
              <!-- Image -->
              <span *ngIf="ce.type === 'image'" class="area-ctrl-img">
                <lucide-icon name="image" [size]="16"></lucide-icon>
              </span>
              <!-- Generic data fields -->
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
              <!-- Counter -->
              <div *ngIf="ce.type === 'counter'" class="area-ctrl-counter"
                [style.font-family]="ce.fontFamily || 'Roboto'"
                [style.font-size.px]="ce.fontSize || 14"
                [style.font-weight]="ce.fontBold ? 'bold' : 'normal'"
                [style.font-style]="ce.fontItalic ? 'italic' : 'normal'"
                [style.text-align]="ce.textAlign || 'center'">
                <ng-container *ngIf="ce.counterDisplayMode !== 'circle'">
                  {{ getCounterText(ce, pos.order) }}
                </ng-container>
                <div *ngIf="ce.counterDisplayMode === 'circle'" class="area-counter-circle-wrap">
                  <div class="area-p-circle"
                    [style.width.px]="ce.counterCircleSize || 48"
                    [style.height.px]="ce.counterCircleSize || 48">
                    <svg viewBox="0 0 80 80" class="area-p-svg">
                      <circle cx="40" cy="40" r="34" class="area-p-track"
                        [style.stroke]="ce.counterCircleTrackColor || '#e0e0e0'"></circle>
                      <circle cx="40" cy="40" r="34" class="area-p-fill"
                        [style.stroke]="ce.counterCircleColor || '#4caf50'"
                        [style.stroke-dasharray]="213.6"
                        [style.stroke-dashoffset]="213.6 - 213.6 * getCounterPercent(ce, pos.order) / 100"></circle>
                    </svg>
                    <div class="area-p-text">
                      <span *ngIf="ce.counterShowPercent" class="area-p-pct">{{ getCounterPercent(ce, pos.order) }}%</span>
                      <span class="area-p-count">{{ getCounterMatched(ce, pos.order) }}/{{ pos.order.items.length }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Empty control fallback -->
        <div *ngIf="orderPositions.length === 0" class="area-empty-hint">
          {{ hasControl ? 'Нет заказов по фильтру' : 'Контрол не найден' }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .el-area { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; }
    .el-area-header {
      display: flex; align-items: center; gap: 6px;
      padding: 2px 6px; background: #e3f2fd; border-bottom: 1px dashed #90CAF9;
      min-height: 24px; font-size: 11px; font-weight: 600; color: #1565C0;
      flex-shrink: 0;
    }
    .area-icon { color: #1976D2; }
    .area-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-emu-controls { display: flex; gap: 2px; margin-left: auto; }
    .area-emu-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 18px; height: 18px; border: 1px solid #bbdefb; border-radius: 3px;
      background: #fff; color: #1976D2; cursor: pointer; transition: all 0.15s;
    }
    .area-emu-btn:hover { background: #bbdefb; }
    .el-area-body {
      flex: 1; display: flex; align-items: center; justify-content: center; color: #9e9e9e;
    }
    .area-placeholder {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      font-size: 12px; color: #bdbdbd;
    }
    .el-area-content { flex: 1; position: relative; overflow: hidden; }
    .area-empty-hint {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-size: 11px; color: #bdbdbd; text-align: center;
    }
    .area-control-slot {
      position: absolute; overflow: hidden; border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .area-control-canvas {
      position: relative; transform-origin: top left; overflow: hidden;
    }
    .area-ctrl-el {
      position: absolute; border-style: solid; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
    }
    .area-ctrl-text { width: 100%; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-ctrl-img { color: #bdbdbd; }
    .area-ctrl-data { width: 100%; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 2px; }

    /* A: Order items table */
    .area-ctrl-ot { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .area-ot-header { display: flex; align-items: center; padding: 0 4px; flex-shrink: 0; }
    .area-ot-row { display: flex; align-items: center; padding: 0 4px; flex-shrink: 0; border-bottom: 1px solid rgba(0,0,0,0.06); }
    .area-ot-col-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-ot-col-qty { width: 50px; text-align: center; flex-shrink: 0; }
    .area-ot-col-status { width: 70px; text-align: center; flex-shrink: 0; }

    /* B: Zones */
    .area-ctrl-zones { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .area-z-section { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .area-z-header { padding: 2px 4px; font-weight: 700; text-transform: uppercase; flex-shrink: 0; }
    .area-z-row { display: flex; align-items: center; gap: 4px; padding: 2px 4px; flex-shrink: 0; }
    .area-z-check { color: #4caf50; font-size: 10px; }
    .area-z-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-z-qty { color: #757575; flex-shrink: 0; }

    /* C: Progress */
    .area-ctrl-progress { width: 100%; height: 100%; display: flex; gap: 4px; overflow: hidden; padding: 4px; }
    .area-p-hero { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .area-p-circle { position: relative; }
    .area-p-svg { width: 100%; height: 100%; }
    .area-p-track { fill: none; stroke-width: 6; }
    .area-p-fill { fill: none; stroke-width: 6; stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset 0.3s; }
    .area-p-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
    .area-p-pct { display: block; font-size: 14px; font-weight: 700; color: #333; }
    .area-p-count { display: block; font-size: 10px; color: #757575; }
    .area-p-list { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
    .area-p-item { display: flex; align-items: center; gap: 4px; padding: 1px 2px; }
    .area-p-item.ready { color: #4caf50; }
    .area-p-marker { font-size: 10px; width: 14px; text-align: center; color: #bdbdbd; }
    .area-p-marker.ready { color: #4caf50; }
    .area-p-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-p-qty { color: #757575; flex-shrink: 0; }

    /* D: Checklist */
    .area-ctrl-checklist { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .area-cl-header { display: flex; justify-content: space-between; padding: 4px 6px; font-size: 11px; font-weight: 600; color: #333; border-bottom: 1px solid #e0e0e0; flex-shrink: 0; }
    .area-cl-counter { color: #4caf50; }
    .area-cl-row { display: flex; align-items: center; gap: 4px; padding: 2px 6px; border-bottom: 1px solid #f5f5f5; }
    .area-cl-row.ready { }
    .area-cl-marker { font-size: 10px; width: 14px; text-align: center; color: #bdbdbd; }
    .area-cl-marker.ready { color: #4caf50; }
    .area-cl-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .area-cl-name.ready { text-decoration: line-through; color: #9e9e9e; }
    .area-cl-qty { color: #757575; flex-shrink: 0; }

    /* E: Cards */
    .area-ctrl-cards { width: 100%; height: 100%; overflow: hidden; padding: 4px; }
    .area-cards-grid { display: flex; flex-wrap: wrap; }
    .area-card-tile { border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
    .area-card-tile.ready { }
    .area-card-status { padding: 2px 4px; font-size: 10px; font-weight: 600; text-align: center; }
    .area-card-body { padding: 4px; display: flex; justify-content: space-between; }

    /* Counter */
    .area-ctrl-counter { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .area-counter-circle-wrap { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
  `],
})
export class AreaElementRendererComponent {
  @Input() element!: ArrivalsThemeElement;
  @Input() orderPositions: AreaOrderPosition[] = [];
  @Input() emulationRunning = false;
  @Input() hasControl = false;

  @Output() toggleEmu = new EventEmitter<ArrivalsThemeElement>();
  @Output() resetEmu = new EventEmitter<ArrivalsThemeElement>();
  @Output() fillEmu = new EventEmitter<ArrivalsThemeElement>();

  isOrderVariant(type: string): boolean {
    return ['order-items', 'order-items-zones', 'order-items-progress', 'order-items-checklist', 'order-items-cards', 'counter'].includes(type);
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

  getCounterMatched(ce: ArrivalsThemeElement, order: ArrivalsOrderMock): number {
    const statuses = ce.counterStatuses || ['Готово'];
    return order.items.filter(i => statuses.some(s => i.status === s || (s === 'Готово' && (i.status === 'Выдача' || i.status === 'Подан')))).length;
  }

  getCounterPercent(ce: ArrivalsThemeElement, order: ArrivalsOrderMock): number {
    if (!order.items.length) return 0;
    return Math.round((this.getCounterMatched(ce, order) / order.items.length) * 100);
  }

  getCounterText(ce: ArrivalsThemeElement, order: ArrivalsOrderMock): string {
    const matched = this.getCounterMatched(ce, order);
    if (ce.counterDisplayMode === 'fraction') {
      return matched + '/' + order.items.length;
    }
    return matched + ' из ' + order.items.length;
  }
}
