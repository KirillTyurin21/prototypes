import { Injectable } from '@angular/core';

import {
  SparrowOrder,
  SparrowOrderStatus,
  SparrowOrderItem,
  SparrowStopListItem,
  SparrowNotification,
  SparrowLogEntry,
  SparrowTab,
  ACTIVE_STATUSES,
  CANCELLED_STATUSES,
  CLOSED_STATUSES,
  FINAL_STATUSES,
} from '../types';

import {
  MOCK_INITIAL_ORDERS,
  MOCK_STOP_LIST,
  MOCK_PRODUCTS,
} from '../data/mock-sparrow-data';

/**
 * Сервис состояния плагина Sparrow.
 *
 * Управляет: заказами, стоп-листом, переключателем «На смене»,
 * очередью нотификаций, логом событий, таймерами.
 *
 * Источник: спецификация, разделы 4.1–4.8, 6.1–6.2, 9.2–9.3
 */
@Injectable({ providedIn: 'root' })
export class SparrowStateService {

  // ─── Переключатель «На смене» ──────────────────

  /** Плагин подключён к внешнему сервису */
  isOnShift = true;

  /** Backend онлайн */
  isBackendOnline = true;

  // ─── Заказы ────────────────────────────────────

  orders: SparrowOrder[] = this._cloneOrders(MOCK_INITIAL_ORDERS);

  /** Текущая вкладка окна плагина */
  activeTab: SparrowTab = 'active';

  // ─── Стоп-лист ────────────────────────────────

  stopList: SparrowStopListItem[] = JSON.parse(JSON.stringify(MOCK_STOP_LIST));

  /** Ожидающий push-стоп-запрос от бэкенда (кейс 3) */
  pendingStopPush: { productId: number; productName: string } | null = null;

  // ─── Нотификации (FIFO-очередь, раздел 9.3) ──

  notifications: SparrowNotification[] = [];

  /** Текущая нотификация на экране (null = нет) */
  currentNotification: SparrowNotification | null = null;

  // ─── Inline-уведомления ────────────────────────

  /** Текст inline-уведомления (верх окна плагина) */
  inlineMessage: string | null = null;
  inlineType: 'success' | 'error' = 'success';
  private _inlineTimer: any = null;

  // ─── Лог событий (панель эмуляции) ─────────────

  log: SparrowLogEntry[] = [];

  // ─── Таймеры (разделы 4.5.1.1, 4.5.1.2) ───────

  /** ID интервала проверки таймеров */
  private _timerInterval: any = null;

  /** Множество ID заказов, для которых уже создана нотификация «не забрали» */
  private _notPickedUpNotified = new Set<number>();

  // ─── Счётчик ID ────────────────────────────────

  private _nextId = 2000;

  // ═══════════════════════════════════════════════
  // Методы: Заказы
  // ═══════════════════════════════════════════════

  /** Заказы, отфильтрованные по текущей вкладке */
  get filteredOrders(): SparrowOrder[] {
    let statuses: SparrowOrderStatus[];
    switch (this.activeTab) {
      case 'active':    statuses = ACTIVE_STATUSES;    break;
      case 'cancelled': statuses = CANCELLED_STATUSES; break;
      case 'closed':    statuses = CLOSED_STATUSES;    break;
    }
    return this.orders
      .filter(o => statuses.includes(o.status))
      .sort((a, b) => new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime());
  }

  /** Счётчики по вкладкам (для бейджей) */
  get tabCounts(): Record<SparrowTab, number> {
    return {
      active: this.orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length,
      cancelled: this.orders.filter(o => CANCELLED_STATUSES.includes(o.status)).length,
      closed: this.orders.filter(o => CLOSED_STATUSES.includes(o.status)).length,
    };
  }

  /** Есть ли незавершённые заказы (для предупреждения при выключении) */
  get hasUnfulfilledOrders(): boolean {
    return this.orders.some(o => !FINAL_STATUSES.includes(o.status));
  }

  /** Обновить статус заказа */
  updateStatus(orderId: number, newStatus: SparrowOrderStatus): void {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;

    if (newStatus === 'accepted') {
      order.acceptedAt = new Date().toISOString();
    }
    if (FINAL_STATUSES.includes(newStatus)) {
      order.completedAt = new Date().toISOString();
    }

    this._addLog('PATCH', `/orders/${orderId}/status`, 'success',
      `Статус заказа ${order.number} → ${newStatus}`);
  }

  // ═══════════════════════════════════════════════
  // Методы: Стоп-лист
  // ═══════════════════════════════════════════════

  /** Переключить стоп-лист вручную (раздел 4.6, требование 16) */
  toggleStopItem(productId: number): void {
    const item = this.stopList.find(s => s.productId === productId);
    if (!item || item.isStoppedInFront) return; // нельзя менять если заблокировано Front

    item.isStopped = !item.isStopped;
    item.stopSource = item.isStopped ? 'manual' : null;

    const verb = item.isStopped ? 'добавлен в' : 'убран из';
    this._addLog('POST', '/stop-list', 'success',
      `${item.productName} ${verb} стоп-лист`);
  }

  /** Эмуляция: push-стоп-запрос от Beanshe (кейс 3, раздел 4.6) */
  simulateStopPush(): void {
    // Выбираем случайный продукт, который НЕ на стопе и НЕ заблокирован Front
    const available = this.stopList.filter(s => !s.isStopped && !s.isStoppedInFront);
    if (available.length === 0) return;

    const item = available[Math.floor(Math.random() * available.length)];
    this.pendingStopPush = { productId: item.productId, productName: item.productName };

    this._addLog('PUSH', '/stop-list/request', 'success',
      `Запрос на стоп: ${item.productName}`);
  }

  /** Бариста подтверждает push-стоп-запрос */
  confirmStopPush(): void {
    if (!this.pendingStopPush) return;

    const item = this.stopList.find(s => s.productId === this.pendingStopPush!.productId);
    if (item) {
      item.isStopped = true;
      item.stopSource = 'backend_push';
    }

    this._addLog('POST', '/stop-list/confirm', 'success',
      `${this.pendingStopPush.productName} поставлен на стоп (подтверждено)`);
    this.pendingStopPush = null;
  }

  /** Бариста отклоняет push-стоп-запрос */
  declineStopPush(): void {
    if (!this.pendingStopPush) return;

    this._addLog('POST', '/stop-list/decline', 'success',
      `Запрос на стоп «${this.pendingStopPush.productName}» отклонён`);
    this.pendingStopPush = null;
  }

  // ═══════════════════════════════════════════════
  // Методы: Нотификации
  // ═══════════════════════════════════════════════

  /** Добавить нотификацию в очередь и показать, если сейчас ничего не показано */
  addNotification(n: SparrowNotification): void {
    this.notifications.push(n);
    if (!this.currentNotification) {
      this.showNextNotification();
    }
  }

  /** Показать следующую нотификацию из очереди */
  showNextNotification(): void {
    this.currentNotification = this.notifications.shift() ?? null;
  }

  /** Закрыть текущую нотификацию и показать следующую */
  dismissNotification(): void {
    this.currentNotification = null;
    // Небольшая задержка перед показом следующей (визуальный переход)
    if (this.notifications.length > 0) {
      setTimeout(() => this.showNextNotification(), 200);
    }
  }

  /** Есть ли нотификации (в очереди или показанная) */
  get hasNotifications(): boolean {
    return this.currentNotification !== null || this.notifications.length > 0;
  }

  /** Размер очереди (без текущей показанной) */
  get notificationQueueSize(): number {
    return this.notifications.length;
  }

  // ═══════════════════════════════════════════════
  // Методы: Inline-уведомления (верх окна плагина)
  // ═══════════════════════════════════════════════

  /** Показать inline-уведомление */
  showInlineMessage(text: string, type: 'success' | 'error' = 'success'): void {
    if (this._inlineTimer) clearTimeout(this._inlineTimer);
    this.inlineMessage = text;
    this.inlineType = type;
    const duration = type === 'error' ? 5000 : 3000;
    this._inlineTimer = setTimeout(() => {
      this.inlineMessage = null;
      this._inlineTimer = null;
    }, duration);
  }

  /** Скрыть inline-уведомление */
  hideInlineMessage(): void {
    if (this._inlineTimer) clearTimeout(this._inlineTimer);
    this.inlineMessage = null;
    this._inlineTimer = null;
  }

  // ═══════════════════════════════════════════════
  // Методы: Таймеры (разделы 4.5.1.1, 4.5.1.2)
  // ═══════════════════════════════════════════════

  /** Запустить проверку таймеров (вызывается из main screen) */
  startTimers(): void {
    this.stopTimers();
    // Проверяем каждые 10 секунд
    this._timerInterval = setInterval(() => this._checkTimers(), 10_000);
  }

  /** Остановить таймеры */
  stopTimers(): void {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  /** Проверить таймеры: автоотмена (4.5.1.1), не забрали (4.5.1.2) */
  private _checkTimers(): void {
    if (!this.isOnShift || !this.isBackendOnline) return;

    const now = Date.now();

    for (const order of this.orders) {
      if (FINAL_STATUSES.includes(order.status)) continue;

      const pickupTime = new Date(order.pickupTime).getTime();

      // Автоотмена: status == 'created' И current_time >= pickup_time - 4 мин
      if (order.status === 'created') {
        const autoCancel = pickupTime - 4 * 60_000;
        if (now >= autoCancel) {
          this.updateStatus(order.id, 'expired');
          this._addLog('TIMER', '/auto-cancel', 'success',
            `Заказ ${order.number} автоотменён (таймаут)`);
          // Убрать нотификацию нового заказа из очереди, если она там
          this._removeNotificationForOrder(order.id, 'new_order');
          continue;
        }
      }

      // Не забрали: status in (accepted, preparing, ready) И current_time >= pickup_time + 15 мин
      if (['accepted', 'preparing', 'ready'].includes(order.status)) {
        const notPickedUp = pickupTime + 15 * 60_000;
        if (now >= notPickedUp && !this._notPickedUpNotified.has(order.id)) {
          this._notPickedUpNotified.add(order.id);
          this.addNotification({
            type: 'not_picked_up',
            orderId: order.id,
            order,
          });
          this._addLog('TIMER', '/not-picked-up', 'success',
            `Заказ ${order.number}: время вышло, покупатель не забрал`);
        }
      }
    }
  }

  /** Удалить нотификацию из очереди (если заказ автоотменён) */
  private _removeNotificationForOrder(orderId: number, type: string): void {
    // Из очереди
    this.notifications = this.notifications.filter(
      n => !(n.orderId === orderId && n.type === type)
    );
    // Если текущая показанная — убрать и показать следующую
    if (this.currentNotification?.orderId === orderId && this.currentNotification?.type === type) {
      this.dismissNotification();
    }
  }

  // ═══════════════════════════════════════════════
  // Методы: Эмуляция Backend
  // ═══════════════════════════════════════════════

  /** Создать заказ из формы (Этап 7) */
  createOrder(data: {
    customerName: string;
    items: SparrowOrderItem[];
    pickupMinutes: number;
    comment: string;
  }): void {
    const id = this._nextId++;
    const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order: SparrowOrder = {
      id,
      number: `B-${String(id).slice(-3)}`,
      status: 'created',
      customerName: data.customerName,
      items: data.items,
      totalPrice: total,
      pickupTime: new Date(Date.now() + data.pickupMinutes * 60000).toISOString(),
      comment: data.comment,
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      completedAt: null,
    };

    this.orders.push(order);

    this.addNotification({
      type: 'new_order',
      orderId: order.id,
      order,
    });

    this._addLog('POST', '/orders', 'success',
      `Новый заказ ${order.number} от ${data.customerName} (${data.items.length} поз.)`);
  }

  /** Эмуляция: добавить новый заказ от «покупателя» */
  simulateNewOrder(): void {
    const id = this._nextId++;
    const names = ['Анна П.', 'Иван Л.', 'Елена В.', 'Сергей Н.', 'Ольга Т.'];
    const products = [
      { id: 1, name: 'Капучино', price: 320 },
      { id: 2, name: 'Латте', price: 350 },
      { id: 3, name: 'Раф', price: 380 },
      { id: 5, name: 'Флэт Уайт', price: 360 },
    ];
    const mods = ['', 'Овсяное молоко', 'Доп. шот эспрессо', 'Карамельный сироп'];

    const product = products[Math.floor(Math.random() * products.length)];
    const mod = mods[Math.floor(Math.random() * mods.length)];
    const customer = names[Math.floor(Math.random() * names.length)];

    const order: SparrowOrder = {
      id,
      number: `B-${String(id).slice(-3)}`,
      status: 'created',
      customerName: customer,
      items: [{
        productId: product.id,
        productName: product.name,
        size: ['S', 'M', 'L'][Math.floor(Math.random() * 3)],
        modifications: mod ? [mod] : [],
        quantity: 1,
        price: product.price + (mod ? 50 : 0),
      }],
      totalPrice: product.price + (mod ? 50 : 0),
      pickupTime: new Date(Date.now() + 15 * 60000).toISOString(),
      comment: '',
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      completedAt: null,
    };

    this.orders.push(order);

    // Нотификация (раздел 9.3)
    this.addNotification({
      type: 'new_order',
      orderId: order.id,
      order,
    });

    this._addLog('POST', '/orders', 'success',
      `Новый заказ ${order.number} от ${customer}`);
  }

  /** Эмуляция: отмена покупателем */
  simulateCustomerCancel(orderId: number): void {
    const order = this.orders.find(o => o.id === orderId);
    if (!order || FINAL_STATUSES.includes(order.status)) return;

    this.updateStatus(orderId, 'cancelled_customer');
    this._addLog('POST', `/orders/${orderId}/cancel`, 'success',
      `Покупатель отменил заказ ${order.number}`);
  }

  /** Сбросить все данные к начальным */
  reset(): void {
    this.stopTimers();
    this.orders = this._cloneOrders(MOCK_INITIAL_ORDERS);
    this.stopList = JSON.parse(JSON.stringify(MOCK_STOP_LIST));
    this.pendingStopPush = null;
    this.notifications = [];
    this.currentNotification = null;
    this.inlineMessage = null;
    this.inlineType = 'success';
    if (this._inlineTimer) clearTimeout(this._inlineTimer);
    this._inlineTimer = null;
    this._notPickedUpNotified.clear();
    this.log = [];
    this.isOnShift = true;
    this.isBackendOnline = true;
    this.activeTab = 'active';
    this._nextId = 2000;
  }

  /** Добавить запись в лог (public для использования из компонентов) */
  addLog(method: string, endpoint: string, status: 'success' | 'error', description: string): void {
    this._addLog(method, endpoint, status, description);
  }

  // ═══════════════════════════════════════════════
  // Внутренние
  // ═══════════════════════════════════════════════

  /** Добавить запись в лог */
  private _addLog(method: string, endpoint: string, status: 'success' | 'error', description: string): void {
    const now = new Date();
    const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.log.unshift({ time, method, endpoint, status, description });
    // Ограничиваем лог 50 записями
    if (this.log.length > 50) {
      this.log.length = 50;
    }
  }

  private _cloneOrders(orders: SparrowOrder[]): SparrowOrder[] {
    return JSON.parse(JSON.stringify(orders));
  }
}
