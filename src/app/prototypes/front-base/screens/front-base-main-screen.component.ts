import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PosTerminalShellComponent,
  PosMainScreenComponent,
  PosTablesScreenComponent,
  PosDeliveryListScreenComponent,
  PosDeliveryOrderScreenComponent,
  PosPaymentScreenComponent,
  PosGuestListDialogComponent,
  PosPaymentMethodDialogComponent,
  SimulationToolbarComponent,
  SimulationScenario,
  DeliveryOrder,
  PosGuest,
  PosMenuItem,
} from '@/components/pos-terminal';

type Screen = 'main' | 'tables' | 'delivery-list' | 'order' | 'payment';

let nextOrderId = 1001;

/**
 * Главный экран прототипа front-base.
 * Управляет навигацией между экранами POS-терминала.
 */
@Component({
  selector: 'app-front-base-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    PosTerminalShellComponent,
    PosMainScreenComponent,
    PosTablesScreenComponent,
    PosDeliveryListScreenComponent,
    PosDeliveryOrderScreenComponent,
    PosPaymentScreenComponent,
    PosGuestListDialogComponent,
    PosPaymentMethodDialogComponent,
    SimulationToolbarComponent,
  ],
  template: `
    <!-- Simulation toolbar (analyst tool) -->
    <simulation-toolbar
      [currentScreen]="currentScreen"
      [tableNumber]="simTable"
      [guests]="simGuests"
      (screenChange)="onSimScreenChange($event)"
      (tableNumberChange)="simTable = $event"
      (guestsChange)="simGuests = $event"
      (triggerPlugin)="onSimTriggerPlugin()"
      (simulateEvent)="onSimEvent($event)"
      (resetTerminal)="onSimReset()"
      (applyScenario)="onSimScenario($event)">
    </simulation-toolbar>

    <div class="h-[calc(100vh-48px)]">
      <pos-terminal-shell [showPlaceholder]="false"
                          [showBottomBar]="currentScreen === 'main'"
                          [showNotificationArea]="currentScreen === 'main'"
                          (bottomAction)="onBottomAction($event)">

        <!-- Main screen -->
        <pos-main-screen *ngIf="currentScreen === 'main'"
                         posScreen
                         (navigate)="onMainNavigate($event)">
        </pos-main-screen>

        <!-- Tables screen -->
        <pos-tables-screen *ngIf="currentScreen === 'tables'"
                           posScreen
                           (navigate)="onTablesNavigate($event)">
        </pos-tables-screen>

        <!-- Delivery list screen -->
        <pos-delivery-list-screen *ngIf="currentScreen === 'delivery-list'"
                                  posScreen
                                  [orders]="orders"
                                  (navigate)="onDeliveryListNavigate($event)"
                                  (selectOrder)="onSelectOrder($event)"
                                  (createPickup)="onCreatePickup()"
                                  (createDelivery)="onCreateDelivery()"
                                  (closeOrder)="onCloseOrder($event)">
        </pos-delivery-list-screen>

        <!-- Order screen -->
        <pos-delivery-order-screen *ngIf="currentScreen === 'order'"
                                   posScreen
                                   [order]="currentOrder"
                                   (navigate)="onOrderNavigate($event)"
                                   (statusChange)="onStatusChange($event)"
                                   (addItem)="onAddItem($event)"
                                   (removeItem)="onRemoveItemByIndex($event)"
                                   (saveOrder)="onSaveOrder()">
        </pos-delivery-order-screen>

        <!-- Payment screen -->
        <pos-payment-screen *ngIf="currentScreen === 'payment'"
                            posScreen
                            [order]="currentOrder"
                            (navigate)="onPaymentNavigate($event)"
                            (paymentComplete)="onPaymentComplete()"
                            (showPaymentMethodDialog)="showPaymentMethodDlg = true">
        </pos-payment-screen>

        <!-- Dialogs (overlay inside shell) -->
        <pos-guest-list-dialog [open]="showGuestDlg"
                               (dialogClose)="showGuestDlg = false"
                               (selectGuest)="onGuestSelected($event)"
                               (skip)="onGuestSkipped()">
        </pos-guest-list-dialog>

        <pos-payment-method-dialog [open]="showPaymentMethodDlg"
                                   (dialogClose)="showPaymentMethodDlg = false"
                                   (select)="onPaymentMethodSelected($event)">
        </pos-payment-method-dialog>

      </pos-terminal-shell>
    </div>
  `,
})
export class FrontBaseMainScreenComponent {
  currentScreen: Screen = 'main';
  orders: DeliveryOrder[] = [];
  currentOrderId: number | null = null;
  showGuestDlg = false;
  showPaymentMethodDlg = false;

  // Simulation toolbar state
  simTable = 0;
  simGuests = 0;

  get currentOrder(): DeliveryOrder | null {
    return this.orders.find(o => o.id === this.currentOrderId) || null;
  }

  // ─── Main screen ─────────────────────
  onBottomAction(action: string): void {
    if (action === 'orders') {
      this.currentScreen = 'tables';
    }
  }

  onMainNavigate(action: string): void {
    if (action === 'delivery') {
      this.currentScreen = 'delivery-list';
    }
  }

  // ─── Tables screen ───────────────────
  onTablesNavigate(action: string): void {
    if (action === 'back') this.currentScreen = 'main';
    if (action === 'delivery-list') this.currentScreen = 'delivery-list';
  }

  // ─── Delivery list screen ────────────
  onDeliveryListNavigate(action: string): void {
    if (action === 'back') this.currentScreen = 'tables';
  }

  onSelectOrder(orderId: number): void {
    this.currentOrderId = orderId;
    this.currentScreen = 'order';
  }

  onCreatePickup(): void {
    this.showGuestDlg = true;
  }

  onCreateDelivery(): void {
    this.createOrder('delivery');
    this.currentScreen = 'order';
  }

  onCloseOrder(orderId: number): void {
    this.currentOrderId = orderId;
    this.currentScreen = 'payment';
  }

  // ─── Guest dialog ────────────────────
  onGuestSelected(guest: PosGuest): void {
    this.showGuestDlg = false;
    this.createOrder('pickup', guest.name, guest.phone);
    this.currentScreen = 'order';
  }

  onGuestSkipped(): void {
    this.showGuestDlg = false;
    this.createOrder('pickup');
    this.currentScreen = 'order';
  }

  // ─── Order screen ────────────────────
  onOrderNavigate(action: string): void {
    if (action === 'back') this.currentScreen = 'delivery-list';
    if (action === 'payment') this.currentScreen = 'payment';
  }

  onStatusChange(newStatus: string): void {
    const order = this.currentOrder;
    if (order) {
      (order as any).status = newStatus;
    }
  }

  onAddItem(menuItem: PosMenuItem): void {
    const order = this.currentOrder;
    if (!order) return;
    const existing = order.items.find(i => i.name === menuItem.name);
    if (existing) {
      existing.quantity++;
    } else {
      order.items.push({
        id: Date.now(),
        dishId: menuItem.id || 0,
        name: menuItem.name,
        quantity: 1,
        price: menuItem.price,
      });
    }
    this.recalcOrder(order);
  }

  onRemoveItemByIndex(index: number): void {
    const order = this.currentOrder;
    if (!order || index < 0 || index >= order.items.length) return;
    order.items[index].quantity--;
    if (order.items[index].quantity <= 0) {
      order.items.splice(index, 1);
    }
    this.recalcOrder(order);
  }

  onSaveOrder(): void {
    this.currentScreen = 'delivery-list';
  }

  // ─── Payment screen ─────────────────
  onPaymentNavigate(action: string): void {
    if (action === 'back') this.currentScreen = 'order';
  }

  onPaymentComplete(): void {
    const order = this.currentOrder;
    if (order) {
      order.status = 'closed';
      order.isFiscalized = true;
    }
    this.currentScreen = 'delivery-list';
  }

  onPaymentMethodSelected(method: string): void {
    this.showPaymentMethodDlg = false;
  }

  // ─── Simulation toolbar ──────────────
  onSimScreenChange(screen: string): void {
    this.currentScreen = screen as Screen;
  }

  onSimTriggerPlugin(): void {
    // Placeholder — в будущем откроет диалог плагина
  }

  onSimEvent(event: string): void {
    if (event === 'new-order') {
      this.createOrder('pickup');
      this.currentScreen = 'order';
    }
  }

  onSimReset(): void {
    this.currentScreen = 'main';
    this.orders = [];
    this.currentOrderId = null;
    this.simTable = 0;
    this.simGuests = 0;
  }

  onSimScenario(scenario: SimulationScenario): void {
    this.currentScreen = scenario.screen as Screen;
    this.simTable = scenario.tableNumber;
    this.simGuests = scenario.guests;
    if (scenario.hasOpenOrder && this.orders.length === 0) {
      this.createOrder('pickup');
    }
  }

  // ─── Helpers ─────────────────────────
  private createOrder(type: 'pickup' | 'delivery', clientName = '', clientPhone = ''): void {
    const id = nextOrderId++;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const order: DeliveryOrder = {
      id,
      status: 'new',
      type,
      createdAt: time,
      deliveryTime: time,
      address: type === 'delivery' ? '' : '',
      courier: '',
      client: clientName,
      phone: clientPhone,
      comment: '',
      items: [],
      subtotal: 0,
      discount: 0,
      surcharge: 0,
      prepayment: 0,
      total: 0,
      isFiscalized: false,
      paymentMethod: 'cash',
    };
    this.orders.unshift(order);
    this.currentOrderId = id;
  }

  private recalcOrder(order: DeliveryOrder): void {
    order.subtotal = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
    order.total = order.subtotal - order.discount + order.surcharge - order.prepayment;
  }
}
