import {
  CustomerScreenDisplay,
  ScreenTheme,
  ScreenControl,
  ArrivalTerminal,
  SidebarSection,
  ArrivalsThemeListItem,
  ArrivalsTheme,
  ArrivalsControlListItem,
  ArrivalsControl,
  ProductCatalogItem,
  SoundCollection,
  SoundEventHandler,
  SoundTerminalGroup,
  SoundFolder,
  SoundFile,
  GenerationQueueItem,
} from '../types';

/** Секции бокового меню Web */
export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: 'Экран покупателя',
    icon: 'monitor',
    items: [
      { icon: '', label: 'Дисплеи', route: 'displays' },
      { icon: '', label: 'Подсказки', route: 'hints' },
      { icon: '', label: 'Контролы', route: 'controls' },
      { icon: '', label: 'Темы', route: 'themes-cs' },
    ],
  },
  {
    title: 'Электронная очередь',
    icon: 'layout-list',
    items: [
      { icon: '', label: 'Контролы', route: 'arrivals-controls' },
      { icon: '', label: 'Темы', route: 'themes-arrivals' },
      { icon: '', label: 'Настройка терминалов', route: 'cs-terminals' },
    ],
  },
  {
    title: 'Звуки',
    icon: 'volume-2',
    items: [
      { icon: '', label: 'Обработчики событий', route: 'sounds-event-handlers' },
      { icon: '', label: 'Настройка терминалов', route: 'sounds-terminals' },
    ],
  },
  {
    title: 'Подсказки',
    icon: 'wand-2',
    route: 'global-hints',
    items: [],
  },
  {
    title: 'Галерея',
    icon: 'image',
    route: 'gallery',
    items: [],
  },
  {
    title: 'Кампании',
    icon: 'megaphone',
    route: 'campaigns',
    items: [],
  },
];

export const MOCK_DISPLAYS: CustomerScreenDisplay[] = [
  {
    id: 1,
    name: 'Экран бара',
    description: 'Дисплей покупателя на барной стойке',
    resolution: '1920x1080',
    orientation: 'landscape',
    status: 'active',
    theme: 'Стандартная тема',
    terminal: 'Касса бар 1',
  },
  {
    id: 2,
    name: 'Экран касса 1',
    description: 'Основная касса у входа',
    resolution: '1024x768',
    orientation: 'landscape',
    status: 'active',
    theme: 'Стандартная тема',
    terminal: 'Касса 1',
  },
  {
    id: 3,
    name: 'Экран касса 2',
    description: 'Вторая касса зала',
    resolution: '1024x768',
    orientation: 'landscape',
    status: 'active',
    theme: 'Летний дизайн',
    terminal: 'Касса 2',
  },
  {
    id: 4,
    name: 'Витрина',
    description: 'Экран на витрине у входа',
    resolution: '1080x1920',
    orientation: 'portrait',
    status: 'active',
    theme: 'Новогодняя тема',
    terminal: 'Терминал витрина',
  },
  {
    id: 5,
    name: 'Зал — столик у окна',
    description: 'Информационный дисплей в зале',
    resolution: '1920x1080',
    orientation: 'landscape',
    status: 'inactive',
    theme: 'Минимализм',
    terminal: 'Касса 1',
  },
  {
    id: 6,
    name: 'Экран самообслуживания',
    description: 'Киоск самообслуживания у входа',
    resolution: '1080x1920',
    orientation: 'portrait',
    status: 'active',
    theme: 'Стандартная тема',
    terminal: 'Киоск 1',
  },
  {
    id: 7,
    name: 'Экран кухни (выдача)',
    description: 'Дисплей покупателя на выдаче заказов',
    resolution: '1920x1080',
    orientation: 'landscape',
    status: 'active',
    theme: 'Летний дизайн',
    terminal: 'Терминал кухня',
  },
  {
    id: 8,
    name: 'Доставка — зона ожидания',
    description: 'Экран для курьеров и ожидающих заказ',
    resolution: '1920x1080',
    orientation: 'landscape',
    status: 'inactive',
    theme: 'Стандартная тема',
    terminal: 'Касса доставка',
  },
];

export const MOCK_THEMES_CS: ScreenTheme[] = [
  {
    id: 1,
    name: 'Стандартная тема',
    type: 'customer-screen',
    isDefault: true,
    createdAt: '2025-03-10T10:00:00',
    modifiedAt: '2025-12-01T14:30:00',
  },
  {
    id: 2,
    name: 'Летний дизайн',
    type: 'customer-screen',
    isDefault: false,
    createdAt: '2025-05-20T09:15:00',
    modifiedAt: '2025-06-15T11:00:00',
  },
  {
    id: 3,
    name: 'Новогодняя тема',
    type: 'customer-screen',
    isDefault: false,
    createdAt: '2025-11-01T08:00:00',
    modifiedAt: '2025-12-20T16:45:00',
  },
  {
    id: 4,
    name: 'Минимализм',
    type: 'customer-screen',
    isDefault: false,
    createdAt: '2025-04-05T12:30:00',
    modifiedAt: '2025-09-10T10:20:00',
  },
  {
    id: 5,
    name: 'Тёмная тема',
    type: 'customer-screen',
    isDefault: false,
    createdAt: '2025-07-18T14:00:00',
    modifiedAt: '2025-11-22T09:10:00',
  },
];

export const MOCK_THEMES_ARRIVALS: ScreenTheme[] = [
  {
    id: 101,
    name: 'Стандартная (поступления)',
    type: 'arrivals',
    isDefault: true,
    createdAt: '2025-02-15T10:00:00',
    modifiedAt: '2025-10-05T13:00:00',
  },
  {
    id: 102,
    name: 'Компактный список',
    type: 'arrivals',
    isDefault: false,
    createdAt: '2025-04-22T11:30:00',
    modifiedAt: '2025-08-18T15:40:00',
  },
  {
    id: 103,
    name: 'Крупный шрифт',
    type: 'arrivals',
    isDefault: false,
    createdAt: '2025-06-10T09:00:00',
    modifiedAt: '2025-09-30T12:15:00',
  },
  {
    id: 104,
    name: 'Тёмный режим (поступления)',
    type: 'arrivals',
    isDefault: false,
    createdAt: '2025-08-01T14:20:00',
    modifiedAt: '2025-12-12T17:00:00',
  },
];

export const MOCK_CONTROLS: ScreenControl[] = [
  {
    id: 1,
    name: 'Текстовый блок',
    type: 'text',
    description: 'Произвольный текст с настраиваемым шрифтом и цветом',
  },
  {
    id: 2,
    name: 'Логотип',
    type: 'image',
    description: 'Изображение логотипа заведения или бренда',
  },
  {
    id: 3,
    name: 'QR-код оплаты',
    type: 'qr-code',
    description: 'Динамический QR-код для оплаты по СБП или ссылке',
  },
  {
    id: 4,
    name: 'Слайд-шоу меню',
    type: 'menu',
    description: 'Автоматическая прокрутка позиций меню с ценами',
  },
  {
    id: 5,
    name: 'Видео',
    type: 'video',
    description: 'Воспроизведение рекламного или информационного видеоролика',
  },
  {
    id: 6,
    name: 'Часы',
    type: 'clock',
    description: 'Текущее время и дата в настраиваемом формате',
  },
];

/* ── Arrivals theme list (folders + themes) ── */

export const MOCK_ARRIVALS_LIST: ArrivalsThemeListItem[] = [
  { id: 201, name: 'Системные темы', itemType: 'folder' },
  { id: 202, name: 'Архив', itemType: 'folder' },
  { id: 101, name: 'Стандартная (поступления)', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
  { id: 102, name: 'Компактный список', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
  { id: 103, name: 'Крупный шрифт', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
  { id: 104, name: 'Тёмный режим', itemType: 'theme', resolution: '1366x768', createdBy: 'Моя' },
  { id: 105, name: 'Доставка (от 25-10-09)', itemType: 'theme', resolution: '1024x768', createdBy: 'Моя' },
];

export const MOCK_ARRIVALS_THEMES: ArrivalsTheme[] = [
  { id: 101, name: 'Стандартная (поступления)', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
  { id: 102, name: 'Компактный список', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
  { id: 103, name: 'Крупный шрифт', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
  { id: 104, name: 'Тёмный режим', resolution: '1366x768', screenMode: 'order-screen', elements: [] },
  { id: 105, name: 'Доставка (от 25-10-09)', resolution: '1024x768', screenMode: 'order-screen', elements: [] },
];

/* ── Product catalog for Price element navigator ── */

export const MOCK_PRODUCT_CATALOG: Record<string, ProductCatalogItem[]> = {
  root: [
    { id: 'g1', name: 'Горячие напитки', isGroup: true, hasChildren: true },
    { id: 'g2', name: 'Холодные напитки', isGroup: true, hasChildren: true },
    { id: 'g3', name: 'Салаты', isGroup: true, hasChildren: true },
    { id: 'g4', name: 'Супы', isGroup: true, hasChildren: true },
    { id: 'g5', name: 'Горячие блюда', isGroup: true, hasChildren: true },
    { id: 'g6', name: 'Десерты', isGroup: true, hasChildren: true },
    { id: 'g7', name: 'Пустая группа', isGroup: true, hasChildren: false },
  ],
  g1: [
    { id: 'p1', name: 'Капучино', isGroup: false, sizes: [
      { id: 's1', name: 'Маленький' }, { id: 's2', name: 'Средний' }, { id: 's3', name: 'Большой' },
    ] },
    { id: 'p2', name: 'Латте', isGroup: false, sizes: [
      { id: 's4', name: 'Маленький' }, { id: 's5', name: 'Средний' }, { id: 's6', name: 'Большой' },
    ] },
    { id: 'p3', name: 'Американо', isGroup: false, sizes: [] },
    { id: 'p4', name: 'Чай чёрный', isGroup: false, sizes: [] },
  ],
  g2: [
    { id: 'p5', name: 'Лимонад', isGroup: false, sizes: [
      { id: 's7', name: '0.3л' }, { id: 's8', name: '0.5л' },
    ] },
    { id: 'p6', name: 'Морс клюквенный', isGroup: false, sizes: [] },
    { id: 'p7', name: 'Вода', isGroup: false, sizes: [
      { id: 's9', name: '0.3л' }, { id: 's10', name: '0.5л' }, { id: 's11', name: '1л' },
    ] },
  ],
  g3: [
    { id: 'p8', name: 'Цезарь с курицей', isGroup: false, sizes: [] },
    { id: 'p9', name: 'Греческий', isGroup: false, sizes: [] },
    { id: 'p10', name: 'Оливье', isGroup: false, sizes: [] },
  ],
  g4: [
    { id: 'p11', name: 'Борщ', isGroup: false, sizes: [] },
    { id: 'p12', name: 'Том Ям', isGroup: false, sizes: [
      { id: 's12', name: 'Маленький' }, { id: 's13', name: 'Большой' },
    ] },
    { id: 'p13', name: 'Солянка', isGroup: false, sizes: [] },
  ],
  g5: [
    { id: 'p14', name: 'Стейк рибай', isGroup: false, sizes: [
      { id: 's14', name: '200г' }, { id: 's15', name: '300г' }, { id: 's16', name: '400г' },
    ] },
    { id: 'p15', name: 'Паста карбонара', isGroup: false, sizes: [] },
    { id: 'p16', name: 'Бургер классический', isGroup: false, sizes: [] },
    { id: 'p17', name: 'Пицца Маргарита', isGroup: false, sizes: [
      { id: 's17', name: '25 см' }, { id: 's18', name: '30 см' }, { id: 's19', name: '35 см' },
    ] },
  ],
  g6: [
    { id: 'p18', name: 'Тирамису', isGroup: false, sizes: [] },
    { id: 'p19', name: 'Чизкейк', isGroup: false, sizes: [] },
    { id: 'p20', name: 'Мороженое', isGroup: false, sizes: [
      { id: 's20', name: '1 шарик' }, { id: 's21', name: '2 шарика' }, { id: 's22', name: '3 шарика' },
    ] },
  ],
  g7: [],
};

export const MOCK_TERMINALS: ArrivalTerminal[] = [
  {
    id: 1,
    name: 'Терминал зал 1',
    location: 'Основной зал, у входа',
    status: 'online',
    ip: '192.168.1.101',
    lastSync: '2026-02-10T09:45:00',
  },
  {
    id: 2,
    name: 'Терминал зал 2',
    location: 'Основной зал, у бара',
    status: 'online',
    ip: '192.168.1.102',
    lastSync: '2026-02-10T09:44:30',
  },
  {
    id: 3,
    name: 'Терминал веранда',
    location: 'Летняя веранда',
    status: 'offline',
    ip: '192.168.1.103',
    lastSync: '2026-01-15T18:20:00',
  },
  {
    id: 4,
    name: 'Терминал кухня',
    location: 'Кухня, зона выдачи',
    status: 'online',
    ip: '192.168.1.104',
    lastSync: '2026-02-10T09:43:00',
  },
  {
    id: 5,
    name: 'Терминал доставка',
    location: 'Зона сборки доставки',
    status: 'online',
    ip: '192.168.1.105',
    lastSync: '2026-02-10T09:42:15',
  },
];

/* ── Arrivals Controls list (folders + controls) ── */

export const MOCK_ARRIVALS_CONTROLS_LIST: ArrivalsControlListItem[] = [
  { id: 301, name: 'Контролы', itemType: 'folder' },
  { id: 302, name: 'Доставка (для Курьеров) (от 25-10-09)', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 303, name: 'Аня тест1', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 304, name: 'ВИТ', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 305, name: 'Контрол с анимацией', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
  { id: 306, name: 'Стандартный контрол', itemType: 'control', resolution: '1024x768', createdBy: 'Мой' },
];

export const MOCK_ARRIVALS_CONTROLS: ArrivalsControl[] = [
  { id: 302, name: 'Доставка (для Курьеров) (от 25-10-09)', statusType: 'delivery', elements: [] },
  { id: 303, name: 'Аня тест1', statusType: 'kitchen', elements: [] },
  { id: 304, name: 'ВИТ', statusType: 'kitchen', elements: [] },
  { id: 305, name: 'Контрол с анимацией', statusType: 'kitchen', elements: [] },
  { id: 306, name: 'Стандартный контрол', statusType: 'balancer', elements: [] },
];

/* ── Sounds (Digital Voice) ── */

export const SYSTEM_EVENTS: string[] = [
  'Бронь: банкет завершен',
  'Бронь: банкет начат',
  'Бронь: банкет начат (универсально)',
  'Бронь: банкет отменен (no-show)',
  'Бронь: включено напоминание о подготовке',
  'Бронь: гость пришел (резерв закрыт)',
  'Бронь: создан банкет',
  'Бронь: создан резерв',
  'Доставка: доставлено',
  'Доставка: закрыто',
  'Доставка: назначен курьер',
  'Доставка: новый заказ',
  'Доставка: отменено',
  'Кухня: заказ приготовлен (Processed)',
];

export const MOCK_SOUND_COLLECTIONS: SoundCollection[] = [
  { id: 1, name: 'Системные обработчики событий' },
  { id: 2, name: 'Звуки' },
  { id: 3, name: '11' },
];

export const MOCK_SOUND_EVENT_HANDLERS: SoundEventHandler[] = [
  // Системные обработчики событий (collection 1)
  { id: 1, collectionId: 1, name: 'Бронь: банкет завершен', voiceType: 'file', events: ['Бронь: банкет завершен'], fileName: 'banket_end.mp3' },
  { id: 2, collectionId: 1, name: 'Бронь: банкет начат', voiceType: 'file', events: ['Бронь: банкет начат'], fileName: 'banket_start.mp3' },
  { id: 3, collectionId: 1, name: 'Бронь: банкет начат (универсально)', voiceType: 'file', events: ['Бронь: банкет начат (универсально)'], fileName: 'banket_start_uni.mp3' },
  { id: 4, collectionId: 1, name: 'Бронь: банкет отменен (no-show)', voiceType: 'file', events: ['Бронь: банкет отменен (no-show)'], fileName: 'banket_cancel.mp3' },
  { id: 5, collectionId: 1, name: 'Бронь: включено напоминание', voiceType: 'file', events: ['Бронь: включено напоминание о подготовке'], fileName: 'reminder.mp3' },
  { id: 6, collectionId: 1, name: 'Бронь: гость пришел', voiceType: 'file', events: ['Бронь: гость пришел (резерв закрыт)'], fileName: 'guest_arrived.mp3' },
  { id: 7, collectionId: 1, name: 'Бронь: создан банкет', voiceType: 'file', events: ['Бронь: создан банкет'], fileName: 'banket_created.mp3' },
  { id: 8, collectionId: 1, name: 'Бронь: создан резерв', voiceType: 'file', events: ['Бронь: создан резерв'], fileName: 'reserve_created.mp3' },
  { id: 9, collectionId: 1, name: 'Доставка: доставлено', voiceType: 'file', events: ['Доставка: доставлено'], fileName: 'delivered.mp3' },
  { id: 10, collectionId: 1, name: 'Доставка: закрыто', voiceType: 'file', events: ['Доставка: закрыто'], fileName: 'closed.mp3' },
  { id: 11, collectionId: 1, name: 'Доставка: назначен курьер', voiceType: 'file', events: ['Доставка: назначен курьер'], fileName: 'courier.mp3' },
  { id: 12, collectionId: 1, name: 'Доставка: новый заказ', voiceType: 'file', events: ['Доставка: новый заказ'], fileName: 'new_order.mp3' },
  // Звуки (collection 2)
  { id: 13, collectionId: 2, name: 'Звук уведомления', voiceType: 'file', events: ['Доставка: новый заказ'], fileName: 'notification.mp3' },
  // 11 (collection 3)
  { id: 14, collectionId: 3, name: 'Тестовый обработчик', voiceType: 'file', events: ['Кухня: заказ приготовлен (Processed)'], fileName: 'test.mp3' },
  // Без коллекции
  { id: 15, collectionId: null, name: 'Доставка: отменено', voiceType: 'file', events: ['Доставка: отменено'], fileName: 'cancelled.mp3' },
  { id: 16, collectionId: null, name: 'Кухня: заказ приготовлен', voiceType: 'file', events: ['Кухня: заказ приготовлен (Processed)'], fileName: 'cooked.mp3' },
  { id: 17, collectionId: null, name: 'Уведомление бронь', voiceType: 'file', events: ['Бронь: создан резерв'], fileName: 'reserve_notify.mp3' },
  { id: 18, collectionId: null, name: 'Общий звук', voiceType: 'file', events: ['Доставка: новый заказ', 'Доставка: доставлено'], fileName: 'general.mp3' },
  // Генерация голоса (примеры)
  { id: 19, collectionId: 1, name: 'Голос: новый заказ доставки', voiceType: 'generation', events: ['Доставка: новый заказ'], voiceName: 'Ксения', phraseText: 'Внимание, поступил новый заказ на доставку номер [order_number]', generationStatus: 'done', fileSize: 48 },
  { id: 20, collectionId: 2, name: 'Голос: заказ приготовлен', voiceType: 'generation', events: ['Кухня: заказ приготовлен (Processed)'], voiceName: 'Василий', phraseText: 'Заказ [order_number] готов к выдаче', generationStatus: 'done', fileSize: 36 },
];

export const AUDIO_DEVICES: string[] = [
  'Не выбрано',
  'Динамики (High Definition Audio Device)',
  'Device 1',
  'Device 2',
];

export const MOCK_SOUND_TERMINAL_GROUPS: SoundTerminalGroup[] = [
  {
    id: 1,
    name: 'Торг. предприятие',
    terminalCount: 2,
    terminals: [
      { id: 101, name: '127.0.0.1', lastActivity: '2026-05-06 07:12:06', handlerIds: [1, 2, 3], audioDevice: 'Динамики (High Definition Audio Device)' },
      { id: 102, name: '192.168.1.10', lastActivity: '2026-05-05 18:30:22', handlerIds: [1], audioDevice: 'Не выбрано' },
    ],
  },
  {
    id: 2,
    name: 'Ресторан «Центральный»',
    terminalCount: 3,
    terminals: [
      { id: 201, name: '10.0.0.5', lastActivity: '2026-05-06 09:45:11', handlerIds: [1, 9, 10, 11, 12], audioDevice: 'Device 1' },
      { id: 202, name: '10.0.0.6', lastActivity: '2026-05-04 14:20:00', handlerIds: [], audioDevice: 'Не выбрано' },
      { id: 203, name: '10.0.0.7', lastActivity: '2026-05-06 10:00:00', handlerIds: [13], audioDevice: 'Device 2' },
    ],
  },
  {
    id: 3,
    name: 'Кафе «Утренняя звезда»',
    terminalCount: 1,
    terminals: [
      { id: 301, name: '172.16.0.1', lastActivity: '2026-05-03 22:10:55', handlerIds: [15, 16], audioDevice: 'Динамики (High Definition Audio Device)' },
    ],
  },
];

/* ── Available Voices ── */

export const AVAILABLE_VOICES: string[] = ['Ксения', 'Ирина', 'Василий'];

/* ── Sound Catalog (Справочник звуков) ── */

/**
 * Числа генерируются как компоненты: цифры (1–9), десятки (10–90), сотни (100–900).
 * Итого 27 файлов на голос — достаточно для озвучки любого числа до 9999
 * (четырёхзначные озвучиваются как "1" + "999").
 */
export const MOCK_SOUND_FOLDERS: SoundFolder[] = [
  {
    id: 1, voiceName: 'Ксения', category: 'numbers', label: 'Числа',
    totalCount: 27, generatedCount: 27,
    files: [
      // Цифры 1–9
      { id: 101, name: '1.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 102, name: '2.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 103, name: '3.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 104, name: '4.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 105, name: '5.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 106, name: '6.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 107, name: '7.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 108, name: '8.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 109, name: '9.wav', duration: '0:01', createdAt: '2026-04-10' },
      // Десятки 10–90
      { id: 110, name: '10.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 111, name: '20.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 112, name: '30.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 113, name: '40.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 114, name: '50.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 115, name: '60.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 116, name: '70.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 117, name: '80.wav', duration: '0:01', createdAt: '2026-04-10' },
      { id: 118, name: '90.wav', duration: '0:01', createdAt: '2026-04-10' },
      // Сотни 100–900
      { id: 119, name: '100.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 120, name: '200.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 121, name: '300.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 122, name: '400.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 123, name: '500.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 124, name: '600.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 125, name: '700.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 126, name: '800.wav', duration: '0:02', createdAt: '2026-04-10' },
      { id: 127, name: '900.wav', duration: '0:02', createdAt: '2026-04-10' },
    ],
  },
  {
    id: 2, voiceName: 'Ксения', category: 'phrases', label: 'Фразы',
    totalCount: 2, generatedCount: 2,
    files: [
      { id: 201, name: 'novyj_zakaz_dostavki_{nomer}.wav', duration: '0:04', createdAt: '2026-05-01' },
      { id: 202, name: 'zakaz_{nomer}_gotov.wav', duration: '0:03', createdAt: '2026-05-02' },
    ],
  },
  {
    id: 3, voiceName: 'Ирина', category: 'numbers', label: 'Числа',
    totalCount: 27, generatedCount: 18,
    files: [
      // Цифры 1–9
      { id: 301, name: '1.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 302, name: '2.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 303, name: '3.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 304, name: '4.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 305, name: '5.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 306, name: '6.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 307, name: '7.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 308, name: '8.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 309, name: '9.wav', duration: '0:01', createdAt: '2026-04-12' },
      // Десятки 10–90
      { id: 310, name: '10.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 311, name: '20.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 312, name: '30.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 313, name: '40.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 314, name: '50.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 315, name: '60.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 316, name: '70.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 317, name: '80.wav', duration: '0:01', createdAt: '2026-04-12' },
      { id: 318, name: '90.wav', duration: '0:01', createdAt: '2026-04-12' },
      // Сотни — ещё не сгенерированы
    ],
  },
  {
    id: 4, voiceName: 'Ирина', category: 'phrases', label: 'Фразы',
    totalCount: 0, generatedCount: 0,
    files: [],
  },
  {
    id: 5, voiceName: 'Василий', category: 'numbers', label: 'Числа',
    totalCount: 27, generatedCount: 27,
    files: [
      // Цифры 1–9
      { id: 501, name: '1.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 502, name: '2.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 503, name: '3.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 504, name: '4.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 505, name: '5.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 506, name: '6.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 507, name: '7.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 508, name: '8.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 509, name: '9.wav', duration: '0:01', createdAt: '2026-04-15' },
      // Десятки 10–90
      { id: 510, name: '10.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 511, name: '20.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 512, name: '30.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 513, name: '40.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 514, name: '50.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 515, name: '60.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 516, name: '70.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 517, name: '80.wav', duration: '0:01', createdAt: '2026-04-15' },
      { id: 518, name: '90.wav', duration: '0:01', createdAt: '2026-04-15' },
      // Сотни 100–900
      { id: 519, name: '100.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 520, name: '200.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 521, name: '300.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 522, name: '400.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 523, name: '500.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 524, name: '600.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 525, name: '700.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 526, name: '800.wav', duration: '0:02', createdAt: '2026-04-15' },
      { id: 527, name: '900.wav', duration: '0:02', createdAt: '2026-04-15' },
    ],
  },
  {
    id: 6, voiceName: 'Василий', category: 'phrases', label: 'Фразы',
    totalCount: 1, generatedCount: 1,
    files: [
      { id: 601, name: 'zakaz_{nomer}_gotov_k_vydache.wav', duration: '0:04', createdAt: '2026-05-03' },
    ],
  },
];
