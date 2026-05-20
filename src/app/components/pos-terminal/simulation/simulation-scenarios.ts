/**
 * Преднастроенные сценарии для панели симуляций.
 * Каждый сценарий задаёт начальное состояние терминала и набор действий.
 */

export interface SimulationScenario {
  id: string;
  label: string;
  description: string;
  screen: string;
  tableNumber: number;
  guests: number;
  orderTotal: number;
  hasOpenOrder: boolean;
}

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'empty',
    label: 'Пустой терминал',
    description: 'Главный экран без заказов',
    screen: 'main',
    tableNumber: 0,
    guests: 0,
    orderTotal: 0,
    hasOpenOrder: false,
  },
  {
    id: 'active-order',
    label: 'Активный заказ',
    description: 'Открыт заказ с 3 позициями на столе №5',
    screen: 'order',
    tableNumber: 5,
    guests: 2,
    orderTotal: 1250,
    hasOpenOrder: true,
  },
  {
    id: 'payment',
    label: 'Экран оплаты',
    description: 'Заказ готов к оплате — 2 350 ₽',
    screen: 'payment',
    tableNumber: 3,
    guests: 4,
    orderTotal: 2350,
    hasOpenOrder: true,
  },
  {
    id: 'delivery-list',
    label: 'Доставочные заказы',
    description: 'Список заказов на доставку и самовывоз',
    screen: 'delivery-list',
    tableNumber: 0,
    guests: 0,
    orderTotal: 0,
    hasOpenOrder: false,
  },
  {
    id: 'tables',
    label: 'Управление столами',
    description: 'Экран залов и столов ресторана',
    screen: 'tables',
    tableNumber: 0,
    guests: 0,
    orderTotal: 0,
    hasOpenOrder: false,
  },
];
