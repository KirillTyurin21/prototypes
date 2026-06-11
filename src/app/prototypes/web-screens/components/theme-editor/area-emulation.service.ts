import { ArrivalsThemeElement, ArrivalsControl, ArrivalsOrderMock } from '../../types';
import { AreaOrderPosition } from './area-element-renderer.component';

export interface EmulationState {
  running: boolean;
  visibleOrders: ArrivalsOrderMock[];
  intervalId?: any;
  orderIndex: number;
}

export class AreaEmulationHelper {
  emulationStates = new Map<string, EmulationState>();

  getControlForArea(el: ArrivalsThemeElement, controls: ArrivalsControl[]): ArrivalsControl | null {
    if (!el.areaControlId) return null;
    return controls.find(c => c.id === el.areaControlId) || null;
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

  computeControlPositions(area: ArrivalsThemeElement, orders: ArrivalsOrderMock[], controls: ArrivalsControl[]): AreaOrderPosition[] {
    const control = this.getControlForArea(area, controls);
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
    const baseSlotH = Math.round(bbox.h * scale);

    // Check if any element uses dynamic height
    const dynamicEl = control.elements.find(el =>
      el.orderDynamicHeight && ['order-items', 'order-items-zones', 'order-items-progress', 'order-items-checklist', 'order-items-cards'].includes(el.type)
    );

    const positions: AreaOrderPosition[] = [];

    const getSlotH = (order: ArrivalsOrderMock): number => {
      if (!dynamicEl) return baseSlotH;
      const itemCount = order.items.length;
      const rowH = dynamicEl.orderRowHeight || 32;
      const hdrH = (dynamicEl.orderShowHeader !== false) ? (dynamicEl.orderHeaderHeight || 36) : 0;
      const contentH = hdrH + rowH * Math.max(1, itemCount);
      const elH = Math.round(contentH * scale);
      // Replace the dynamic element's contribution to bbox with computed height
      const otherH = baseSlotH - Math.round(dynamicEl.height * scale);
      return otherH + elH;
    };

    if (area.areaMode === 'list') {
      let col = 0;
      let rowY = area.areaListDirection === 'bottom' ? areaH - pad : headerH + pad;
      for (const order of orders) {
        const slotH = getSlotH(order);
        const x = pad + col * (slotW + pad);
        let y: number;
        if (area.areaListDirection === 'bottom') {
          y = rowY - slotH;
        } else {
          y = rowY;
        }
        if (area.areaListDirection === 'bottom') {
          if (y < headerH) break;
        } else {
          if (y + slotH > areaH) break;
        }

        positions.push({
          order, x, y, width: slotW, height: slotH,
          controlElements: control.elements,
          bboxX: bbox.x, bboxY: bbox.y, bboxW: bbox.w, bboxH: bbox.h, scale,
        });
        col++;
        if (col >= cols) {
          col = 0;
          if (area.areaListDirection === 'bottom') {
            rowY -= slotH + spacing;
          } else {
            rowY += slotH + spacing;
          }
        }
      }
    } else if (area.areaMode === 'single') {
      // Single object mode — show only the first order, centered
      if (orders.length > 0) {
        const order = orders[0];
        const slotH = getSlotH(order);
        const x = pad + Math.max(0, (areaW - pad * 2 - slotW) / 2);
        const y = headerH + pad;
        positions.push({
          order, x, y, width: slotW, height: slotH,
          controlElements: control.elements,
          bboxX: bbox.x, bboxY: bbox.y, bboxW: bbox.w, bboxH: bbox.h, scale,
        });
      }
    } else {
      let posX = pad;
      let posY = headerH + pad;
      let rowMaxH = 0;
      for (const order of orders) {
        const slotH = getSlotH(order);
        if (posX + slotW > areaW - pad) {
          posX = pad;
          posY += rowMaxH + spacing;
          rowMaxH = 0;
        }
        if (posY + slotH > areaH) break;

        positions.push({
          order, x: posX, y: posY, width: slotW, height: slotH,
          controlElements: control.elements,
          bboxX: bbox.x, bboxY: bbox.y, bboxW: bbox.w, bboxH: bbox.h, scale,
        });
        posX += slotW + pad;
        rowMaxH = Math.max(rowMaxH, slotH);
      }
    }

    return positions;
  }

  filterOrders(area: ArrivalsThemeElement, allOrders: ArrivalsOrderMock[]): ArrivalsOrderMock[] {
    let orders = [...allOrders];
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

  isRunning(elId: string): boolean {
    return this.emulationStates.get(elId)?.running ?? false;
  }

  toggle(el: ArrivalsThemeElement, allOrders: ArrivalsOrderMock[], controls: ArrivalsControl[]): void {
    if (this.isRunning(el.id)) {
      this.pause(el.id);
    } else {
      this.start(el, allOrders, controls);
    }
  }

  start(el: ArrivalsThemeElement, allOrders: ArrivalsOrderMock[], controls: ArrivalsControl[]): void {
    let state = this.emulationStates.get(el.id);
    if (!state) {
      state = { running: false, visibleOrders: [], orderIndex: 0 };
      this.emulationStates.set(el.id, state);
    }
    state.running = true;
    const filtered = this.filterOrders(el, allOrders);

    const tick = () => {
      const st = this.emulationStates.get(el.id);
      if (!st || !st.running) return;
      if (st.orderIndex < filtered.length) {
        const testPositions = this.computeControlPositions(el, [...st.visibleOrders, filtered[st.orderIndex]], controls);
        if (testPositions.length > st.visibleOrders.length) {
          st.visibleOrders = [...st.visibleOrders, filtered[st.orderIndex]];
          st.orderIndex++;
        } else {
          this.pause(el.id);
        }
      } else {
        this.pause(el.id);
      }
    };

    state.intervalId = setInterval(tick, 2000);
  }

  pause(elId: string): void {
    const state = this.emulationStates.get(elId);
    if (state) {
      state.running = false;
      if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = undefined;
      }
    }
  }

  reset(elId: string): void {
    this.pause(elId);
    this.emulationStates.set(elId, { running: false, visibleOrders: [], orderIndex: 0 });
  }

  fill(el: ArrivalsThemeElement, allOrders: ArrivalsOrderMock[], controls: ArrivalsControl[]): void {
    this.pause(el.id);
    const filtered = this.filterOrders(el, allOrders);
    const visibleOrders: ArrivalsOrderMock[] = [];
    for (const order of filtered) {
      const testPositions = this.computeControlPositions(el, [...visibleOrders, order], controls);
      if (testPositions.length > visibleOrders.length) {
        visibleOrders.push(order);
      } else {
        break;
      }
    }
    this.emulationStates.set(el.id, { running: false, visibleOrders, orderIndex: visibleOrders.length });
  }

  clearAll(): void {
    this.emulationStates.forEach(state => {
      if (state.intervalId) clearInterval(state.intervalId);
    });
    this.emulationStates.clear();
  }

  getOrderPositions(el: ArrivalsThemeElement, simOrders: ArrivalsOrderMock[], simActive: boolean, mockOrders: ArrivalsOrderMock[], controls: ArrivalsControl[]): AreaOrderPosition[] {
    const state = this.emulationStates.get(el.id);
    const orders = state ? state.visibleOrders : this.filterOrders(el, simActive ? simOrders : mockOrders);
    return this.computeControlPositions(el, orders, controls);
  }
}
