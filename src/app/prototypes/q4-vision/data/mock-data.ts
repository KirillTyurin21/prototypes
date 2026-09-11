import {
  Q4Goal,
  Q4NavGroup,
  CampaignAssignment,
  WizardProduct,
  WizardTerminal,
  ReadinessRow,
  HintAssignment,
  Q4Page,
  Q4Control,
  Q4ColorPattern,
  Q4Campaign,
  Q4CampaignMedia,
  Q4GalleryFile,
  Q4Hint,
} from '../types';

/** Цели Q4 — карта для обзора */
export const Q4_GOALS: Q4Goal[] = [
  {
    id: '1',
    title: 'Сквозной механизм управления контентом',
    priority: 'cross',
    priorityLabel: 'Крупные сквозные',
    tasks: [
      { key: '1.1', title: 'Настройка контента в одном месте', route: 'task-1-1', estimate: '8–12' },
      { key: '1.2', title: 'Мониторинг готовности контента', route: 'task-1-2', estimate: '4–6', dependsOn: ['1.1'] },
    ],
  },
  {
    id: '2',
    title: 'Сквозной механизм подсказок и допродаж',
    priority: 'cross',
    priorityLabel: 'Крупные сквозные',
    tasks: [
      { key: '2.1', title: 'Настройка допродаж в одном месте', route: 'task-2-1', estimate: '6–10' },
      { key: '2.2', title: 'Мониторинг готовности допродаж', route: 'task-2-2', estimate: '3–5', dependsOn: ['2.1'] },
    ],
  },
  {
    id: '3',
    title: 'Улучшение конструктора',
    priority: 'must',
    priorityLabel: 'Обязательно',
    tasks: [
      { key: '3.1', title: 'Новый view навигации страниц темы', route: 'task-3-1', estimate: '5–8' },
      { key: '3.2', title: 'Отказ от справочника контролов', route: 'task-3-2', estimate: '2–3' },
      { key: '3.3', title: 'Копирование элементов между страницами', route: 'task-3-3', estimate: '2–3', dependsOn: ['3.1'] },
    ],
  },
  {
    id: '4',
    title: 'Управление паттернами цветов',
    priority: 'must',
    priorityLabel: 'Обязательно',
    tasks: [
      { key: '4.1', title: 'Поле tag во все решения', route: 'task-4-1', estimate: '2–3' },
      { key: '4.2', title: 'Единый инструмент цветовых схем', route: 'task-4-2', estimate: '3–5', dependsOn: ['4.1'] },
    ],
  },
  {
    id: '5',
    title: 'Аналитика Matomo',
    priority: 'wish',
    priorityLabel: 'Желательно',
    tasks: [{ key: '5', title: 'События конструктора в Matomo', route: 'task-5', estimate: '2–3' }],
  },
  {
    id: '6',
    title: 'Стартовая страница продукта',
    priority: 'research',
    priorityLabel: 'Проработка',
    tasks: [{ key: '6', title: 'Дашборд продукта с показателями', route: 'task-6', estimate: 'проработка' }],
  },
];

/** Навигация прототипа (sidebar) */
export const Q4_NAV: Q4NavGroup[] = [
  { label: 'Обзор Q4', icon: 'layout-dashboard', route: 'overview' },
  {
    label: 'Цель 1 — Сквозной контент',
    icon: 'layers',
    items: [
      { key: '1.1', label: '1.1 Мастер назначения', route: 'task-1-1' },
      { key: '1.2', label: '1.2 Готовность контента', route: 'task-1-2' },
    ],
  },
  {
    label: 'Цель 2 — Подсказки и допродажи',
    icon: 'message-square',
    items: [
      { key: '2.1', label: '2.1 Мастер подсказок', route: 'task-2-1' },
      { key: '2.2', label: '2.2 Готовность подсказок', route: 'task-2-2' },
    ],
  },
  {
    label: 'Цель 3 — Конструктор',
    icon: 'pencil',
    items: [
      { key: '3.1', label: '3.1 Лента страниц', route: 'task-3-1' },
      { key: '3.2', label: '3.2 Контролы в теме', route: 'task-3-2' },
      { key: '3.3', label: '3.3 Копирование', route: 'task-3-3' },
    ],
  },
  {
    label: 'Цель 4 — Цвета и теги',
    icon: 'palette',
    items: [
      { key: '4.1', label: '4.1 Поле tag', route: 'task-4-1' },
      { key: '4.2', label: '4.2 Цветовые схемы', route: 'task-4-2' },
    ],
  },
  { label: 'Цель 5 — Matomo', icon: 'bar-chart-3', route: 'task-5' },
  { label: 'Цель 6 — Стартовая страница', icon: 'home', route: 'task-6' },
];

/** Демо-кампания «Промо „Завтраки"» */
export const CAMPAIGN_NAME = 'Промо «Завтраки»';

export const CAMPAIGN_ASSIGNMENTS: CampaignAssignment[] = [
  {
    id: 1,
    product: 'cs',
    productLabel: 'Customer Screen',
    terminal: 'Кофейня на Арбате — касса 1',
    slot: 'Экран заказа',
  },
  {
    id: 2,
    product: 'arrivals',
    productLabel: 'Arrivals',
    terminal: 'Кофейня на Арбате — табло прилёта',
    slot: 'Рекламный блок',
  },
];

/** Мастер «Где показывать» */
export const WIZARD_PRODUCTS: WizardProduct[] = [
  {
    id: 'cs',
    label: 'Customer Screen',
    icon: 'monitor',
    slots: [
      'Экран заказа',
      'Режим ожидания',
      'Экран оплаты',
      'Экран завершения',
      'Касса не работает',
    ],
  },
  { id: 'arrivals', label: 'Arrivals', icon: 'monitor-play', slots: ['Рекламный блок'] },
  {
    id: 'kiosk',
    label: 'Kiosk',
    icon: 'monitor-smartphone',
    slots: ['Подложка', 'Реклама на экране'],
  },
  {
    id: 'menuboard',
    label: 'MenuBoard',
    icon: 'layout-list',
    slots: ['Динамическая область «Акции»', 'Динамическая область «Новинки»'],
  },
];

export const WIZARD_TERMINALS: WizardTerminal[] = [
  { id: 't1', label: 'Кофейня на Арбате — касса 1', product: 'cs' },
  { id: 't2', label: 'Кофейня на Арбате — касса 2', product: 'cs' },
  { id: 't3', label: 'Кофейня на Арбате — табло прилёта', product: 'arrivals' },
  { id: 't4', label: 'Ресторан «Москва-Сити» — киоск 1', product: 'kiosk' },
  { id: 't5', label: 'Ресторан «Москва-Сити» — киоск 2', product: 'kiosk' },
  { id: 't6', label: 'Фудкорт — меню-борд 1', product: 'menuboard' },
];

/** Готовность кампании (1.2) */
export const READINESS_ROWS: ReadinessRow[] = [
  {
    id: 1,
    terminal: 'Кофейня на Арбате — касса 1',
    product: 'Customer Screen',
    assigned: true,
    loaded: true,
    lastActivity: 'только что',
  },
  {
    id: 2,
    terminal: 'Кофейня на Арбате — касса 2',
    product: 'Customer Screen',
    assigned: true,
    loaded: false,
    lastActivity: '5 мин назад',
  },
  {
    id: 3,
    terminal: 'Кофейня на Арбате — табло прилёта',
    product: 'Arrivals',
    assigned: true,
    loaded: true,
    lastActivity: 'только что',
  },
  {
    id: 4,
    terminal: 'Ресторан «Москва-Сити» — киоск 1',
    product: 'Kiosk',
    assigned: false,
    loaded: false,
    lastActivity: '2 часа назад',
  },
  {
    id: 5,
    terminal: 'Ресторан «Москва-Сити» — киоск 2',
    product: 'Kiosk',
    assigned: true,
    loaded: false,
    lastActivity: 'вчера',
  },
  {
    id: 6,
    terminal: 'Фудкорт — меню-борд 1',
    product: 'MenuBoard',
    assigned: true,
    loaded: true,
    lastActivity: 'только что',
  },
];

/** Демо-подсказка (2.1, 2.2) */
export const HINT_NAME = 'Пирожок дня';

export const HINT_ASSIGNMENTS: HintAssignment[] = [
  {
    id: 1,
    product: 'cs',
    productLabel: 'Customer Screen',
    terminal: 'Кофейня на Арбате — касса 1',
    mode: 'Экран покупателя',
  },
  {
    id: 2,
    product: 'kiosk',
    productLabel: 'Kiosk',
    terminal: 'Ресторан «Москва-Сити» — киоск 1',
    mode: 'Карточка подсказки',
  },
];

export const HINT_READINESS_ROWS: ReadinessRow[] = [
  {
    id: 1,
    terminal: 'Кофейня на Арбате — касса 1',
    product: 'Customer Screen',
    assigned: true,
    loaded: true,
    lastActivity: 'только что',
  },
  {
    id: 2,
    terminal: 'Кофейня на Арбате — касса 2',
    product: 'Customer Screen',
    assigned: true,
    loaded: false,
    lastActivity: '10 мин назад',
  },
  {
    id: 3,
    terminal: 'Ресторан «Москва-Сити» — киоск 1',
    product: 'Kiosk',
    assigned: true,
    loaded: true,
    lastActivity: 'только что',
  },
  {
    id: 4,
    terminal: 'Ресторан «Москва-Сити» — киоск 2',
    product: 'Kiosk',
    assigned: false,
    loaded: false,
    lastActivity: '2 часа назад',
  },
];

/** Страницы темы (3.1, 3.3) */
export const THEME_PAGES: Q4Page[] = [
  {
    id: 'p1',
    name: 'Режим ожидания',
    custom: false,
    elements: [
      { id: 1, name: 'Логотип', type: 'image', color: '#448AFF' },
      { id: 2, name: 'Текст «Добро пожаловать!»', type: 'text', color: '#616161' },
      { id: 3, name: 'Фоновое изображение', type: 'image', color: '#A8C9FF' },
    ],
  },
  {
    id: 'p2',
    name: 'Экран заказа',
    custom: false,
    elements: [
      { id: 4, name: 'Список заказа', type: 'text', color: '#616161' },
      { id: 5, name: 'Кнопка «Оплатить»', type: 'image', color: '#FFAB40' },
    ],
  },
  {
    id: 'p3',
    name: 'Праздник',
    custom: true,
    condition: 'Дата = 31.12 OR Дата = 01.01',
    elements: [
      { id: 6, name: 'Баннер «С Новым годом!»', type: 'image', color: '#FF5252' },
      { id: 7, name: 'Текст «Скидки до 30%»', type: 'text', color: '#EA7806' },
    ],
  },
];

/** Контролы темы (3.2) */
export const THEME_CONTROLS: Q4Control[] = [
  { id: 1, name: 'Контрол «Чек»', source: 'Стандартный', preview: '#448AFF' },
  { id: 2, name: 'Контрол «Акция дня»', source: 'Копия', preview: '#FFAB40' },
  { id: 3, name: 'Контрол «Совет кассира»', source: 'Копия', preview: '#14B456' },
];

/** Цветовые паттерны (4.2) */
export const COLOR_PATTERNS: Q4ColorPattern[] = [
  { id: 1, name: 'Стандарт', preset: true, colors: ['#448AFF', '#FFAB40', '#FFFFFF'] },
  { id: 2, name: 'Праздник', preset: true, colors: ['#FF5252', '#FFD9A8', '#FFF2F2'] },
  { id: 3, name: 'Осень', preset: true, colors: ['#EA7806', '#FFD9A8', '#FFF9F0'] },
  { id: 4, name: 'Моя схема', preset: false, colors: ['#14B456', '#97E8B9', '#EBFBF2'] },
];

/** Предлагаемый перечень событий конструктора (5) */
export const ANALYTICS_ACTIONS: string[] = [
  'Открытие конструктора темы',
  'Создание темы',
  'Создание контрола',
  'Добавление элемента (с типом)',
  'Смена страницы',
  'Сохранение темы',
  'Копирование элемента',
  'Удаление элемента',
];

/** Список кампаний (реплика стенда, 1.1) */
export const Q4_CAMPAIGNS: Q4Campaign[] = [
  { id: 101, name: '1218', from: '27.05.2026', to: '27.05.2027', timeFrom: '00:00', timeTo: '23:59', resolution: '1024x768', folder: null },
  { id: 102, name: '1218 кс1', from: '27.05.2026', to: '27.05.2027', timeFrom: '00:00', timeTo: '23:59', resolution: '1024x768', folder: null },
  { id: 103, name: '1218 arrivals', from: '27.05.2026', to: '27.05.2027', timeFrom: '00:00', timeTo: '23:59', resolution: '1024x768', folder: null },
  { id: 104, name: 'Промо «Завтраки»', from: '01.09.2026', to: '31.12.2026', timeFrom: '07:00', timeTo: '12:00', resolution: '1024x768', folder: 1 },
];

export const Q4_CAMPAIGN_FOLDERS: { id: number; name: string }[] = [
  { id: 1, name: 'Осень 2026' },
];

/** Медиа кампании в редакторе */
export const Q4_CAMPAIGN_MEDIA: Q4CampaignMedia[] = [
  { id: 1, name: 'ролик_завтраки.mp4', type: 'video', size: '606 КБ', resolution: '1024x768', durationMin: 0, durationSec: 30, color: '#448AFF' },
  { id: 2, name: 'баннер_завтрак.jpg', type: 'image', size: '142 КБ', resolution: '1024x768', durationMin: 0, durationSec: 10, color: '#FFAB40' },
];

/** Галерея (для кнопки «Добавить изображение или видео») */
export const Q4_GALLERY_FILES: Q4GalleryFile[] = [
  { id: 1, name: 'ролик_завтраки.mp4', size: '606 КБ', date: '11.08.2026', color: '#448AFF' },
  { id: 2, name: 'баннер_завтрак.jpg', size: '142 КБ', date: '11.08.2026', color: '#FFAB40' },
  { id: 3, name: 'осень_промо.png', size: '312 КБ', date: '05.09.2026', color: '#EA7806' },
];

/** Режимы экранов кампании (селектор «+») */
export const Q4_STANDARD_MODES: string[] = ['Экран оплаты', 'Экран завершения', 'Касса не работает'];
export const Q4_CUSTOM_MODES: string[] = ['A1 — Режим доставки', 'A2 — Экран посадки'];

/** Подсказки (реплика стенда, 2.1) */
export const Q4_HINTS: Q4Hint[] = [
  { id: 1, name: 'Пирожок дня', from: '01.09.2026', to: '30.09.2026', timeFrom: '07:00', timeTo: '12:00', status: 'active' },
  { id: 2, name: 'Test create', from: '11.01.2030', to: '11.01.2030', timeFrom: '00:00', timeTo: '23:59', status: 'scheduled' },
  { id: 3, name: 'подсказка новая', from: '01.06.2026', to: '30.06.2026', timeFrom: '12:00', timeTo: '00:00', status: 'expired' },
  { id: 4, name: 'Test KD', from: '01.08.2026', to: '15.08.2026', timeFrom: '09:00', timeTo: '21:00', status: 'expired' },
];

export const Q4_DISHES: string[] = ['Капучино', 'Латте', 'Круассан', 'Сэндвич с курицей', 'Салат Цезарь', 'Пирожок с вишней'];

export const Q4_DISCOUNTS: string[] = ['Скидка на кофе (10%)', 'Скидка на десерты (15%)', 'Скидка на выпечку (20%)'];
