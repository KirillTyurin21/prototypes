import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { OrderMockItem, INITIAL_ORDER_MOCK_ITEMS, EXTRA_DISHES } from './element-defaults';

@Component({
  selector: 'app-control-emulation-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="emulation-panel" [class.collapsed]="!emulationOpen">
      <div class="emulation-header" (click)="emulationOpen = !emulationOpen">
        <span>🍳 Эмуляция кухни</span>
        <span class="emulation-badge">{{ getReadyNotDeliveredItems().length }}/{{ orderMockItems.length }}</span>
        <lucide-icon [name]="emulationOpen ? 'chevron-down' : 'chevron-up'" [size]="16" style="color:#fff; margin-left:auto"></lucide-icon>
      </div>
      <div *ngIf="emulationOpen" class="emulation-body">
        <div class="emulation-order-info">
          Заказ #1247 &nbsp;•&nbsp; Стол 5 &nbsp;•&nbsp; {{ orderMockItems.length }} позиций &nbsp;•&nbsp;
          Готовность: <strong>{{ getReadyNotDeliveredItems().length }}/{{ orderMockItems.length }}</strong>
        </div>
        <table class="emulation-table">
          <thead>
            <tr>
              <th class="emu-th-name">Блюдо</th>
              <th class="emu-th-qty">Кол.</th>
              <th class="emu-th-status">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of orderMockItems; let i = index" [class.emu-ready]="item.ready" [class.emu-delivered]="item.delivered">
              <td class="emu-td-name">{{ item.name }}</td>
              <td class="emu-td-qty">{{ item.qty }}</td>
              <td class="emu-td-status">
                <select class="emu-select" [ngModel]="item.status" (ngModelChange)="onStatusChange(i, $event)"
                  [class.emu-s-ready]="item.status === 'Готово'"
                  [class.emu-s-cooking]="item.status === 'Готовится'"
                  [class.emu-s-waiting]="item.status === 'Ожидает'"
                  [class.emu-s-delivered]="item.status === 'Выдача' || item.status === 'Подан'">
                  <option value="Ожидает">⚪ Ожидает</option>
                  <option value="Готовится">🟡 Готовится</option>
                  <option value="Готово">🟢 Готово</option>
                  <option value="Выдача">🟣 Выдача</option>
                  <option value="Подан">✅ Подан</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="emulation-actions">
          <button class="emu-btn" (click)="runScenario()" title="Пошаговый сценарий">
            {{ scenarioRunning ? '⏸ Стоп' : '▶ Сценарий' }}
          </button>
          <button class="emu-btn" (click)="setAllReady()" title="Все позиции — Готово">⏩ Всё готово</button>
          <button class="emu-btn" (click)="resetEmulation()" title="Сбросить в исходное">🔄 Сброс</button>
          <button class="emu-btn" (click)="addDish()" [disabled]="orderMockItems.length >= 12" title="Добавить блюдо">+ Блюдо</button>
          <button class="emu-btn" (click)="removeDish()" [disabled]="orderMockItems.length <= 1" title="Удалить последнее">− Блюдо</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .emulation-panel {
      border-top: 2px solid #ff6d00; background: #263238; flex-shrink: 0;
      transition: max-height 0.3s ease;
    }
    .emulation-header {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px; font-size: 14px; font-weight: 600; color: #fff;
      cursor: pointer; user-select: none;
    }
    .emulation-header:hover { background: rgba(255,255,255,0.05); }
    .emulation-badge {
      background: #ff6d00; color: #fff; font-size: 11px; padding: 1px 8px;
      border-radius: 10px; font-weight: 600;
    }
    .emulation-body { padding: 10px 14px 14px; }
    .emulation-order-info {
      font-size: 12px; color: #90a4ae; margin-bottom: 8px;
    }
    .emulation-order-info strong { color: #ff6d00; }
    .emulation-table {
      width: 100%; border-collapse: collapse; font-size: 13px; color: #eceff1; margin-bottom: 10px;
    }
    .emulation-table thead th {
      text-align: left; padding: 4px 8px; font-weight: 600; font-size: 11px;
      color: #90a4ae; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 1px solid #37474f;
    }
    .emu-th-name { width: 45%; }
    .emu-th-qty { width: 15%; text-align: center; }
    .emu-th-status { width: 40%; }
    .emulation-table tbody tr {
      border-bottom: 1px solid #37474f; transition: background 0.15s;
    }
    .emulation-table tbody tr:hover { background: rgba(255,255,255,0.03); }
    .emulation-table tbody tr.emu-ready { background: rgba(76,175,80,0.1); }
    .emulation-table tbody tr.emu-delivered { background: rgba(156,39,176,0.1); opacity: 0.55; text-decoration: line-through; }
    .emu-td-name { padding: 5px 8px; }
    .emu-td-qty { padding: 5px 8px; text-align: center; }
    .emu-td-status { padding: 5px 8px; }
    .emu-select {
      width: 100%; height: 28px; padding: 0 6px; border: 1px solid #455a64;
      border-radius: 4px; background: #37474f; color: #eceff1;
      font-size: 12px; font-family: Roboto, sans-serif; cursor: pointer;
    }
    .emu-select:focus { outline: none; border-color: #ff6d00; }
    .emu-s-ready { border-color: #4caf50; }
    .emu-s-cooking { border-color: #ff9800; }
    .emu-s-waiting { border-color: #455a64; }
    .emu-s-delivered { border-color: #9c27b0; }
    .emulation-actions {
      display: flex; gap: 6px; flex-wrap: wrap;
    }
    .emu-btn {
      height: 30px; padding: 0 12px; border: 1px solid #455a64; border-radius: 4px;
      background: #37474f; color: #eceff1; font-size: 12px; font-weight: 500;
      font-family: Roboto, sans-serif; cursor: pointer; transition: all 0.15s;
      white-space: nowrap;
    }
    .emu-btn:hover { background: #455a64; border-color: #ff6d00; }
    .emu-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
})
export class ControlEmulationPanelComponent implements OnDestroy {
  @Input() orderMockItems: OrderMockItem[] = [];
  @Output() orderMockItemsChange = new EventEmitter<OrderMockItem[]>();

  emulationOpen = false;
  scenarioRunning = false;
  private scenarioTimer: any = null;

  ngOnDestroy(): void {
    this.stopScenario();
  }

  getReadyNotDeliveredItems(): OrderMockItem[] {
    return this.orderMockItems.filter(i => i.ready && !i.delivered);
  }

  onStatusChange(index: number, newStatus: string): void {
    this.orderMockItems[index].status = newStatus;
    this.orderMockItems[index].ready = newStatus === 'Готово' || newStatus === 'Выдача' || newStatus === 'Подан';
    this.orderMockItems[index].delivered = newStatus === 'Выдача' || newStatus === 'Подан';
  }

  setAllReady(): void {
    this.orderMockItems.forEach(item => {
      item.status = 'Готово';
      item.ready = true;
      item.delivered = false;
    });
  }

  resetEmulation(): void {
    this.stopScenario();
    const newItems = INITIAL_ORDER_MOCK_ITEMS.map(i => ({ ...i }));
    this.orderMockItems.splice(0, this.orderMockItems.length, ...newItems);
    this.orderMockItemsChange.emit(this.orderMockItems);
  }

  addDish(): void {
    const available = EXTRA_DISHES.filter(d => !this.orderMockItems.find(i => i.name === d));
    const name = available.length > 0 ? available[0] : `Блюдо #${this.orderMockItems.length + 1}`;
    this.orderMockItems.push({ name, qty: 1, status: 'Ожидает', ready: false, delivered: false });
  }

  removeDish(): void {
    if (this.orderMockItems.length > 1) {
      this.orderMockItems.pop();
    }
  }

  runScenario(): void {
    if (this.scenarioRunning) {
      this.stopScenario();
      return;
    }
    this.orderMockItems.forEach(item => {
      item.status = 'Ожидает';
      item.ready = false;
      item.delivered = false;
    });
    this.scenarioRunning = true;
    let step = 0;
    const totalSteps = this.orderMockItems.length * 3;
    const tick = () => {
      if (step >= totalSteps || !this.scenarioRunning) {
        this.scenarioRunning = false;
        return;
      }
      const itemIdx = Math.floor(step / 3);
      const phase = step % 3;
      if (itemIdx < this.orderMockItems.length) {
        if (phase === 0) {
          this.orderMockItems[itemIdx].status = 'Готовится';
          this.orderMockItems[itemIdx].ready = false;
          this.orderMockItems[itemIdx].delivered = false;
        } else if (phase === 1) {
          this.orderMockItems[itemIdx].status = 'Готово';
          this.orderMockItems[itemIdx].ready = true;
          this.orderMockItems[itemIdx].delivered = false;
        } else {
          this.orderMockItems[itemIdx].status = 'Подан';
          this.orderMockItems[itemIdx].ready = true;
          this.orderMockItems[itemIdx].delivered = true;
        }
      }
      step++;
      this.scenarioTimer = setTimeout(tick, 1200);
    };
    this.scenarioTimer = setTimeout(tick, 800);
  }

  private stopScenario(): void {
    this.scenarioRunning = false;
    if (this.scenarioTimer) {
      clearTimeout(this.scenarioTimer);
      this.scenarioTimer = null;
    }
  }
}
