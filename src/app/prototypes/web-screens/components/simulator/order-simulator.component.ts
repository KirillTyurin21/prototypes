import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { ArrivalsOrderMock } from '../../types';

@Component({
  selector: 'app-order-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="sim-panel" [class.sim-collapsed]="!open">
      <div class="sim-header" (click)="open = !open">
        <div class="sim-header-left">
          <lucide-icon name="radio" [size]="16"></lucide-icon>
          <span class="sim-title">Эмулятор заказов</span>
          <span class="sim-badge" *ngIf="orders.length">{{ orders.length }}</span>
        </div>
        <div class="sim-header-right">
          <span *ngIf="autoRunning" class="sim-live-dot">● LIVE</span>
          <lucide-icon [name]="open ? 'chevron-down' : 'chevron-up'" [size]="16"></lucide-icon>
        </div>
      </div>
      <div class="sim-body" *ngIf="open">
        <!-- Toolbar -->
        <div class="sim-toolbar">
          <button class="sim-btn sim-btn-primary" (click)="addOrder.emit()" title="Добавить заказ">
            <lucide-icon name="plus" [size]="14"></lucide-icon> Новый заказ
          </button>
          <button class="sim-btn" (click)="loadMocks.emit()" title="Загрузить мок-заказы">
            <lucide-icon name="database" [size]="14"></lucide-icon> Моки
          </button>
          <div class="sim-divider-v"></div>
          <button class="sim-btn" [class.sim-btn-active]="autoRunning" (click)="toggleAuto.emit()" title="Авто-генерация">
            <lucide-icon [name]="autoRunning ? 'pause' : 'play'" [size]="14"></lucide-icon>
            {{ autoRunning ? 'Стоп' : 'Авто' }}
          </button>
          <div class="sim-divider-v"></div>
          <button class="sim-btn sim-btn-danger" (click)="clearAll.emit()" title="Очистить все" [disabled]="!orders.length">
            <lucide-icon name="trash-2" [size]="14"></lucide-icon> Очистить
          </button>
        </div>
        <!-- Orders table -->
        <div class="sim-table-wrap">
          <table class="sim-table" *ngIf="orders.length">
            <thead>
              <tr>
                <th style="width:50px">#</th>
                <th style="width:130px">Клиент</th>
                <th style="width:60px">Стол</th>
                <th style="width:90px">Тип</th>
                <th style="width:90px">Статус</th>
                <th style="width:90px">Источник</th>
                <th>Позиции</th>
                <th style="width:80px">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of orders; let idx = index" class="sim-row">
                <td class="sim-cell-num">{{ o.orderNumber }}</td>
                <td>{{ o.clientName }}</td>
                <td>{{ o.tableNumber || '—' }}</td>
                <td>
                  <select class="sim-inline-select" [ngModel]="o.orderType" (ngModelChange)="onOrderTypeChange(o, $event)">
                    <option value="ordinary">Зал</option>
                    <option value="courier">Доставка</option>
                    <option value="pickup">Самовывоз</option>
                  </select>
                </td>
                <td>
                  <button class="sim-status-btn" [class]="'sim-st-' + statusClass(o.status)"
                    (click)="cycleStatus.emit(o)" title="Клик — сменить статус">
                    {{ o.status }}
                  </button>
                </td>
                <td>{{ o.source }}</td>
                <td class="sim-cell-items">
                  <span *ngFor="let item of o.items; let last = last">
                    {{ item.name }}×{{ item.qty }}<span *ngIf="!last">, </span>
                  </span>
                </td>
                <td class="sim-cell-actions">
                  <button class="sim-act-btn" (click)="removeOrder.emit(idx)" title="Удалить">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="!orders.length" class="sim-empty">
            Нет заказов. Нажмите «Новый заказ» или «Моки» для добавления.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sim-panel {
      border-top: 2px solid #1976D2; background: #fafafa;
      display: flex; flex-direction: column; overflow: hidden;
      transition: max-height 0.3s ease;
      max-height: 320px;
    }
    .sim-panel.sim-collapsed { max-height: 36px; }
    .sim-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 12px; cursor: pointer;
      background: linear-gradient(180deg, #f5f5f5, #eeeeee);
      border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0); flex-shrink: 0;
      user-select: none;
    }
    .sim-header:hover { background: linear-gradient(180deg, #eeeeee, #e0e0e0); }
    .sim-header-left { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--dt-text-primary, #333); }
    .sim-header-right { display: flex; align-items: center; gap: 8px; color: var(--dt-text-secondary, #757575); }
    .sim-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 20px; height: 20px; border-radius: 10px; padding: 0 6px;
      background: #1976D2; color: #fff; font-size: 11px; font-weight: 700;
    }
    .sim-live-dot { color: #e53935; font-size: 11px; font-weight: 700; animation: simBlink 1s infinite; }
    @keyframes simBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    .sim-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .sim-toolbar {
      display: flex; align-items: center; gap: 6px; padding: 6px 12px;
      border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0); background: var(--dt-surface-primary, #fff); flex-shrink: 0;
    }
    .sim-btn {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border: 1px solid var(--dt-stroke-default, #e0e0e0); border-radius: 4px;
      background: var(--dt-surface-primary, #fff); font-size: 12px; font-family: Roboto, sans-serif;
      cursor: pointer; color: var(--dt-text-primary, #333); transition: all 0.15s; white-space: nowrap;
    }
    .sim-btn:hover { background: var(--dt-surface-hover, #f5f5f5); border-color: #bdbdbd; }
    .sim-btn:disabled { opacity: 0.4; cursor: default; }
    .sim-btn-primary { background: #1976D2; color: #fff; border-color: #1565C0; }
    .sim-btn-primary:hover { background: #1565C0; }
    .sim-btn-danger { color: #e53935; border-color: #ef9a9a; }
    .sim-btn-danger:hover { background: #ffebee; }
    .sim-btn-active { background: #e53935; color: #fff; border-color: #c62828; }
    .sim-btn-active:hover { background: #c62828; }
    .sim-divider-v { width: 1px; height: 20px; background: var(--dt-stroke-default, #e0e0e0); }
    .sim-table-wrap { flex: 1; overflow: auto; }
    .sim-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .sim-table thead { position: sticky; top: 0; z-index: 1; }
    .sim-table th {
      padding: 4px 8px; text-align: left; font-weight: 600;
      background: var(--dt-surface-secondary, #f5f5f5); border-bottom: 1px solid var(--dt-stroke-default, #e0e0e0);
      color: var(--dt-text-secondary, #616161); font-size: 11px; text-transform: uppercase;
      white-space: nowrap;
    }
    .sim-table td {
      padding: 4px 8px; border-bottom: 1px solid #f5f5f5;
      vertical-align: middle;
    }
    .sim-row:hover td { background: var(--dt-surface-hover, #f5f5f5); }
    .sim-cell-num { font-weight: 600; color: #1976D2; }
    .sim-cell-items { color: var(--dt-text-secondary, #757575); font-size: 11px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sim-cell-actions { text-align: center; }
    .sim-inline-select {
      padding: 2px 4px; border: 1px solid var(--dt-stroke-default, #e0e0e0); border-radius: 3px;
      font-size: 11px; font-family: Roboto, sans-serif; background: var(--dt-surface-primary, #fff);
      cursor: pointer; width: 100%;
    }
    .sim-status-btn {
      padding: 2px 8px; border: 1px solid var(--dt-stroke-default, #e0e0e0); border-radius: 10px;
      font-size: 11px; font-weight: 600; font-family: Roboto, sans-serif;
      cursor: pointer; transition: all 0.15s; width: 100%; text-align: center;
    }
    .sim-status-btn:hover { filter: brightness(0.95); }
    .sim-st-waiting { background: #fff3e0; color: #e65100; border-color: #ffcc80; }
    .sim-st-cooking { background: #e3f2fd; color: #1565C0; border-color: #90caf9; }
    .sim-st-ready { background: #e8f5e9; color: #2e7d32; border-color: #a5d6a7; }
    .sim-st-served { background: #f3e5f5; color: #7b1fa2; border-color: #ce93d8; }
    .sim-st-delivery { background: #e0f2f1; color: #00695c; border-color: #80cbc4; }
    .sim-act-btn {
      border: none; background: none; cursor: pointer;
      color: #bdbdbd; padding: 2px; border-radius: 3px;
      transition: all 0.15s;
    }
    .sim-act-btn:hover { color: #e53935; background: #ffebee; }
    .sim-empty {
      display: flex; align-items: center; justify-content: center;
      height: 80px; color: #bdbdbd; font-size: 13px; font-style: italic;
    }
  `],
})
export class OrderSimulatorComponent {
  @Input() orders: ArrivalsOrderMock[] = [];
  @Input() autoRunning = false;

  @Output() addOrder = new EventEmitter<void>();
  @Output() loadMocks = new EventEmitter<void>();
  @Output() removeOrder = new EventEmitter<number>();
  @Output() cycleStatus = new EventEmitter<ArrivalsOrderMock>();
  @Output() changeOrderType = new EventEmitter<{ order: ArrivalsOrderMock; newType: 'ordinary' | 'courier' | 'pickup' }>();
  @Output() toggleAuto = new EventEmitter<void>();
  @Output() clearAll = new EventEmitter<void>();

  open = false;

  onOrderTypeChange(order: ArrivalsOrderMock, newType: 'ordinary' | 'courier' | 'pickup'): void {
    this.changeOrderType.emit({ order, newType });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Ожидает': return 'waiting';
      case 'Готовится': return 'cooking';
      case 'Готово': return 'ready';
      case 'Подан': return 'served';
      case 'Выдача': return 'delivery';
      default: return 'waiting';
    }
  }
}
