import { ArrivalsOrderMock } from '../../types';
import { MOCK_ARRIVALS_ORDERS } from '../../data/mock-data';

export class SimulatorHelper {
  orders: ArrivalsOrderMock[] = [];
  active = false;
  autoRunning = false;
  private autoInterval: any = null;
  private nextId = 100;
  private nextNum = 100;

  private clientNames = [
    'Алексей Иванов', 'Ольга Кузнецова', 'Дмитрий Соколов', 'Екатерина Попова',
    'Максим Лебедев', 'Анна Фёдорова', 'Сергей Козлов', 'Мария Новикова',
    'Андрей Морозов', 'Юлия Волкова', 'Павел Зайцев', 'Татьяна Семёнова',
  ];
  private dishes = [
    'Стейк рибай', 'Салат Цезарь', 'Паста карбонара', 'Борщ', 'Том Ям',
    'Пицца Маргарита', 'Бургер', 'Картофель фри', 'Тирамису', 'Чизкейк',
    'Солянка', 'Оливье', 'Греческий салат', 'Капучино', 'Лимонад',
  ];
  private sources = ['Front', 'Яндекс.Еда', 'Delivery Club', 'Front'];
  private statuses = ['Ожидает', 'Готовится', 'Готово', 'Подан', 'Выдача'];

  addOrder(): void {
    const types: ('ordinary' | 'courier' | 'pickup')[] = ['ordinary', 'courier', 'pickup'];
    const orderType = types[Math.floor(Math.random() * types.length)];
    const itemCount = 1 + Math.floor(Math.random() * 4);
    const items: { name: string; qty: number; status: string }[] = [];
    const usedDishes = new Set<string>();
    for (let i = 0; i < itemCount; i++) {
      let dish: string;
      do { dish = this.dishes[Math.floor(Math.random() * this.dishes.length)]; } while (usedDishes.has(dish) && usedDishes.size < this.dishes.length);
      usedDishes.add(dish);
      items.push({ name: dish, qty: 1 + Math.floor(Math.random() * 3), status: 'Ожидает' });
    }
    const h = 12 + Math.floor(Math.random() * 8);
    const m = Math.floor(Math.random() * 60);
    const order: ArrivalsOrderMock = {
      id: this.nextId++,
      orderNumber: String(this.nextNum++).padStart(3, '0'),
      clientName: this.clientNames[Math.floor(Math.random() * this.clientNames.length)],
      tableNumber: orderType === 'ordinary' ? String(1 + Math.floor(Math.random() * 20)) : undefined,
      status: 'Ожидает',
      orderType,
      source: orderType === 'ordinary' ? 'Front' : this.sources[Math.floor(Math.random() * this.sources.length)],
      cookingStartTime: `${h}:${String(m).padStart(2, '0')}`,
      items,
    };
    if (orderType === 'courier') {
      order.courierName = this.clientNames[Math.floor(Math.random() * this.clientNames.length)].split(' ')[0] + ' К.';
      order.expectedDeliveryTime = `${h + 1}:${String(m).padStart(2, '0')}`;
    }
    if (orderType !== 'ordinary') {
      order.clientPhone = '+7 (9' + String(Math.floor(Math.random() * 100)).padStart(2, '0') + ') ' +
        String(Math.floor(Math.random() * 1000)).padStart(3, '0') + '-' +
        String(Math.floor(Math.random() * 100)).padStart(2, '0') + '-' +
        String(Math.floor(Math.random() * 100)).padStart(2, '0');
    }
    this.orders = [...this.orders, order];
    this.active = true;
  }

  loadMocks(): void {
    this.orders = JSON.parse(JSON.stringify(MOCK_ARRIVALS_ORDERS));
    this.active = true;
    this.nextId = 200;
    this.nextNum = 200;
  }

  clearAll(): void {
    this.orders = [];
    this.active = false;
  }

  removeByIdx(idx: number): void {
    this.orders = this.orders.filter((_, i) => i !== idx);
    if (!this.orders.length) this.active = false;
  }

  cycleStatus(order: ArrivalsOrderMock): void {
    const idx = this.statuses.indexOf(order.status);
    const next = this.statuses[(idx + 1) % this.statuses.length];
    order.status = next;
    if (next === 'Готово' || next === 'Подан' || next === 'Выдача') {
      order.items.forEach(item => item.status = next);
    } else if (next === 'Ожидает') {
      order.items.forEach(item => item.status = 'Ожидает');
    } else if (next === 'Готовится') {
      order.items.forEach((item, i) => { item.status = i === 0 ? 'Готово' : 'Готовится'; });
    }
    this.orders = [...this.orders];
  }

  changeOrderType(order: ArrivalsOrderMock, newType: 'ordinary' | 'courier' | 'pickup'): void {
    order.orderType = newType;
    if (newType === 'ordinary') {
      order.tableNumber = String(1 + Math.floor(Math.random() * 20));
      order.source = 'Front';
    } else {
      order.tableNumber = undefined;
      order.source = newType === 'courier' ? 'Delivery Club' : 'Яндекс.Еда';
    }
    this.orders = [...this.orders];
  }

  toggleAuto(): void {
    if (this.autoRunning) {
      this.stopAuto();
    } else {
      this.startAuto();
    }
  }

  private startAuto(): void {
    this.autoRunning = true;
    this.active = true;
    this.autoInterval = setInterval(() => this.addOrder(), 3000);
  }

  stopAuto(): void {
    this.autoRunning = false;
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  }
}
