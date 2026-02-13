/** Данные каталога ячеек (v1.2) — 26 ячеек в 5 секциях */

import { CatalogCell, CatalogSection } from '../types';

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 1: Контекст — Из заказа (3 ячейки)
// ═══════════════════════════════════════════════════

const CONTEXT_ORDER_CELLS: CatalogCell[] = [
  {
    id: 'ctx-order-send-menu',
    label: 'Отправить меню',
    description: 'Робот везёт физическое меню от станции выдачи к столу гостя. Стол определён из заказа',
    icon: 'utensils',
    iconColor: '#b8c959',
    category: 'context-order',
    modalType: 'send_menu_confirm',
    context: 'order',
  },
  {
    id: 'ctx-order-cleanup',
    label: 'Уборка посуды',
    description: 'Робот едет к столу для сбора грязной посуды. Один стол из контекста заказа',
    icon: 'spray-can',
    iconColor: '#b8c959',
    category: 'context-order',
    modalType: 'cleanup_confirm',
    context: 'order',
  },
  {
    id: 'ctx-order-send-dish',
    label: 'Доставка блюд',
    description: 'Робот едет на раздачу, забирает блюда и доставляет к столу гостя',   // v1.3 (G5): РАЗБЛОКИРОВАНО
    icon: 'utensils',
    iconColor: '#3b82f6',
    category: 'context-order',
    scenario: 'send-dish-full',
    context: 'order',
  },
  {
    id: 'ctx-order-send-dish-repeat',
    label: 'Повторить доставку',
    description: 'Повторная отправка рейса к столу (доступно после завершения рейса)',   // v1.3 (G5): NEW
    icon: 'repeat',
    iconColor: '#f59e0b',
    category: 'context-order',
    scenario: 'send-dish-repeat',
    context: 'order',
    badge: 'v1.3',
    badgeColor: '#3b82f6',
  },
];

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 2: Контекст — Главный экран (2 ячейки)
// ═══════════════════════════════════════════════════

const CONTEXT_MAIN_CELLS: CatalogCell[] = [
  {
    id: 'ctx-main-cleanup-multi',
    label: 'Уборка посуды (мультивыбор)',
    description: 'Выбор нескольких столов одновременно для уборки с главного экрана',
    icon: 'spray-can',
    iconColor: '#b8c959',
    category: 'context-main',
    modalType: 'cleanup_multi_select',
    context: 'main',
  },
  {
    id: 'ctx-main-marketing',
    label: 'Маркетинговый круиз',
    description: 'Toggle-кнопка запуска маркетингового патрулирования зала роботом',
    icon: 'megaphone',
    iconColor: '#3b82f6',
    category: 'context-main',
    context: 'main',
  },
];

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 3: Сценарии — цепочки переходов (7 ячеек)
// ═══════════════════════════════════════════════════

const SCENARIO_CELLS: CatalogCell[] = [
  {
    id: 'scenario-qr-full',
    label: 'QR-оплата (полный цикл)',
    description: 'Кассир подтверждает → робот к гостю → QR на экране → оплата успешна',
    icon: 'qr-code',
    iconColor: '#b8c959',
    category: 'scenario',
    scenario: 'qr-full',
    context: 'order',
  },
  {
    id: 'scenario-qr-timeout',
    label: 'QR-оплата (тайм-аут)',
    description: 'Гость не успел оплатить — робот возвращается на базу',
    icon: 'clock',
    iconColor: '#f97316',
    category: 'scenario',
    scenario: 'qr-timeout',
    context: 'order',
  },
  {
    id: 'scenario-send-menu-ok',
    label: 'Отправка меню → Успех',
    description: 'Подтверждение → загрузка → задача создана успешно',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'scenario',
    scenario: 'send-menu-ok',
    context: 'order',
  },
  {
    id: 'scenario-send-menu-err',
    label: 'Отправка меню → Ошибка',
    description: 'Подтверждение → загрузка → ошибка (робот недоступен)',
    icon: 'alert-circle',
    iconColor: '#ef4444',
    category: 'scenario',
    scenario: 'send-menu-err',
    context: 'order',
  },
  {
    id: 'scenario-cleanup-ok',
    label: 'Уборка → Успех',
    description: 'Подтверждение уборки одного стола → загрузка → задача создана',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'scenario',
    scenario: 'cleanup-ok',
    context: 'order',
  },
  {
    id: 'scenario-cleanup-multi-ok',
    label: 'Уборка (мульти) → Успех',
    description: 'Мультивыбор столов → загрузка → задача создана',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'scenario',
    scenario: 'cleanup-multi-ok',
    context: 'main',
  },
  {
    id: 'scenario-unmapped',
    label: 'Стол не замаплен',
    description: 'Попытка действия со столом без привязки к точке робота',
    icon: 'map-pin-off',
    iconColor: '#f97316',
    category: 'scenario',
    scenario: 'unmapped',
    context: 'order',
  },
  // === Доставка блюд — NEW: v1.3 (G3/G4) ===
  {
    id: 'scenario-send-dish-full',
    label: 'Доставка блюд (полный цикл)',
    description: 'Подтверждение → загрузка на раздаче → доставка к столу',
    icon: 'utensils',
    iconColor: '#3b82f6',
    category: 'scenario',
    scenario: 'send-dish-full',
    context: 'order',
    badge: 'v1.3',
    badgeColor: '#3b82f6',
  },
  {
    id: 'scenario-send-dish-quick',
    label: 'Доставка блюд (быстрый путь)',
    description: 'Из заказа (стол из контекста, без модалки) → раздача → успех',
    icon: 'zap',
    iconColor: '#22c55e',
    category: 'scenario',
    scenario: 'send-dish-quick',
    context: 'order',
    badge: 'v1.3',
    badgeColor: '#3b82f6',
  },
  {
    id: 'scenario-send-dish-repeat',
    label: 'Повторная доставка',
    description: 'Кнопка «Повторить» → подтверждение → загрузка → успех',
    icon: 'repeat',
    iconColor: '#f59e0b',
    category: 'scenario',
    scenario: 'send-dish-repeat',
    context: 'order',
    badge: 'v1.3',
    badgeColor: '#3b82f6',
  },
  {
    id: 'scenario-send-dish-error',
    label: 'Доставка блюд → Ошибка',
    description: 'Нет свободных роботов / NE недоступен',
    icon: 'alert-circle',
    iconColor: '#ef4444',
    category: 'scenario',
    scenario: 'send-dish-error-busy',
    context: 'order',
    badge: 'v1.3',
    badgeColor: '#3b82f6',
  },
];

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 4: Состояния диалогов — одиночные модалки (12 ячеек)
// ═══════════════════════════════════════════════════

const MODAL_CELLS: CatalogCell[] = [
  {
    id: 'modal-send-menu',
    label: 'М1: Подтверждение отправки меню',
    description: 'Карточка задачи: стол, робот, фразы при заборе и у стола',
    icon: 'utensils',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'send_menu_confirm',
  },
  {
    id: 'modal-cleanup',
    label: 'М2: Подтверждение уборки',
    description: 'Карточка задачи: стол, робот, фраза, время ожидания 90 сек',
    icon: 'spray-can',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'cleanup_confirm',
  },
  {
    id: 'modal-qr-cashier',
    label: 'М3: QR — фаза «Кассир»',
    description: 'Иконка принтера, фраза робота, обратный таймер 120 сек (2 мин)',   // v1.3 (F3)
    icon: 'printer',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'qr_cashier_phase',
  },
  {
    id: 'modal-qr-guest',
    label: 'М4: QR — фаза «Гость»',
    description: 'Mock QR-код, таймер 120 сек, кнопка «Оплата подтверждена»',
    icon: 'qr-code',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'qr_guest_phase',
  },
  {
    id: 'modal-qr-success',
    label: 'М5: QR — Оплата прошла',
    description: 'Иконка успеха, текст «Спасибо за оплату!», автозакрытие 3 сек',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'modal',
    modalType: 'qr_success',
  },
  {
    id: 'modal-qr-timeout',
    label: 'М6: QR — Тайм-аут',
    description: 'Гость не оплатил вовремя, робот возвращается на базу',
    icon: 'clock',
    iconColor: '#f97316',
    category: 'modal',
    modalType: 'qr_timeout',
  },
  {
    id: 'modal-unmapped',
    label: 'М7: Стол не замаплен',
    description: 'Предупреждение + ссылка на iikoWeb для настройки маппинга',
    icon: 'map-pin-off',
    iconColor: '#f97316',
    category: 'modal',
    modalType: 'unmapped_table',
  },
  {
    id: 'modal-dish-blocked',
    label: 'М8: Доставка блюд [legacy]',
    description: 'Заглушка: баннер «Требуется решение» (сохранено для истории)',
    icon: 'package',
    iconColor: '#6b7280',
    category: 'modal',
    modalType: 'send_dish_blocked',
    badge: 'legacy',
    badgeColor: '#6b7280',
  },
  // === Доставка блюд (send_dish) — NEW: v1.3 (G3) ===
  {
    id: 'modal-send-dish-confirm',
    label: 'М14: Доставка блюд',
    description: 'Подтверждение отправки (фудкорт): стол, кол-во блюд, рейсов',
    icon: 'utensils',
    iconColor: '#3b82f6',
    category: 'modal',
    modalType: 'send_dish_confirm',
    badge: 'v1.3',
    badgeColor: '#3b82f6',
  },
  {
    id: 'modal-send-dish-pickup',
    label: 'М15: Уведомление раздачи',
    description: 'Push-нотификация: робот прибыл, список блюд, прогресс-бар pickup_wait_time',
    icon: 'chef-hat',
    iconColor: '#f59e0b',
    category: 'modal',
    modalType: 'send_dish_pickup_notification',
    badge: 'v1.3',
    badgeColor: '#3b82f6',
  },
  {
    id: 'modal-send-dish-repeat',
    label: 'М16: Повторить доставку',
    description: 'Подтверждение повторной отправки рейса, фраза повтора',
    icon: 'repeat',
    iconColor: '#f59e0b',
    category: 'modal',
    modalType: 'send_dish_repeat',
    badge: 'v1.3',
    badgeColor: '#3b82f6',
  },
  {
    id: 'modal-loading',
    label: 'М9: Loading',
    description: 'Универсальный спиннер загрузки. Светлая тема, автозакрытие 3 сек',
    icon: 'loader-2',
    iconColor: '#6b7280',
    category: 'modal',
    modalType: 'loading',
  },
  {
    id: 'modal-success',
    label: 'М10: Задача создана',
    description: 'Универсальный диалог успеха. Автозакрытие 2 сек',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'modal',
    modalType: 'success',
  },
  {
    id: 'modal-error',
    label: 'М11: Ошибка',
    description: 'Универсальный диалог ошибки. Светлая тема, кнопки «Повторить» / «Закрыть»',
    icon: 'alert-circle',
    iconColor: '#ef4444',
    category: 'modal',
    modalType: 'error',
  },
  {
    id: 'modal-cleanup-multi',
    label: 'М12: Мультивыбор столов',
    description: 'Сетка столов 3 колонки, toggle-выбор, disabled для незамапленных',
    icon: 'layout-grid',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'cleanup_multi_select',
    context: 'main',
    badge: 'v1.1',
    badgeColor: '#22c55e',
  },
];

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 5: Уведомления и спецсостояния (2 ячейки)
// ═══════════════════════════════════════════════════

const NOTIFICATION_CELLS: CatalogCell[] = [
  {
    id: 'notify-estop',
    label: 'E-STOP (аварийная остановка)',
    description: 'Toast-уведомление: красная кнопка нажата. Повторяется каждые 5 сек',
    icon: 'octagon',
    iconColor: '#ef4444',
    category: 'notification',
  },
  {
    id: 'notify-ne-error',
    label: 'Ошибка связи NE',
    description: 'Toast-уведомление: NE API не отвечает, повтор через 5 сек',
    icon: 'wifi-off',
    iconColor: '#f97316',
    category: 'notification',
  },
];

// ═══════════════════════════════════════════════════
// ЭКСПОРТ: Секции каталога
// ═══════════════════════════════════════════════════

export const CATALOG_SECTIONS: CatalogSection[] = [
  {
    title: 'Контекст: Из заказа',
    icon: 'receipt',
    description: 'Действия, вызванные из экрана заказа iikoFront (стол известен)',
    category: 'context-order',
    cells: CONTEXT_ORDER_CELLS,
  },
  {
    title: 'Контекст: Главный экран',
    icon: 'monitor',
    description: 'Действия с главного экрана iikoFront (нет контекста стола)',
    category: 'context-main',
    cells: CONTEXT_MAIN_CELLS,
  },
  {
    title: 'Сценарии (цепочки переходов)',
    icon: 'workflow',
    description: 'Автоматические демонстрации полных user journey',
    category: 'scenario',
    cells: SCENARIO_CELLS,
  },
  {
    title: 'Состояния диалогов',
    icon: 'layout-grid',
    description: 'Каждая ячейка — одно конкретное модальное окно плагина',
    category: 'modal',
    cells: MODAL_CELLS,
  },
  {
    title: 'Уведомления и специальные состояния',
    icon: 'bell',
    description: 'Toast-уведомления и overlay-состояния',
    category: 'notification',
    cells: NOTIFICATION_CELLS,
  },
];
