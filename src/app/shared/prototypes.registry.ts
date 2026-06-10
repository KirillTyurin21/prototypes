/**
 * Реестр всех прототипов — добавляй сюда новые прототипы.
 * Они автоматически появятся в sidebar и на главной странице.
 */
export interface PrototypeEntry {
  path: string;
  label: string;
  icon: string;        // имя иконки lucide (kebab-case), напр. 'puzzle'
  description?: string;
  /** Категория для группировки на главной странице: 'front' | 'web' */
  category?: 'front' | 'web';
}

export const PROTOTYPES: PrototypeEntry[] = [
  // === WEB ===
  {
    path: '/prototype/web-screens',
    label: 'Advertise Screens',
    icon: 'monitor-play',
    description: 'Управление гостевыми экранами, табло прибытия, звуками и подсказками',
    category: 'web',
  },
  {
    path: '/prototype/web-settings',
    label: 'Общие настройки',
    icon: 'settings',
    description: 'Права доступа, основные параметры и настройки системы',
    category: 'web',
  },
  // === FRONT ===
  {
    path: '/prototype/front-plugins',
    label: 'Плагины Front — Макеты окон',
    icon: 'credit-card',
    description: 'Макеты модальных окон (попапов) плагинов кассового терминала Front',
    category: 'front',
  },
  {
    path: '/prototype/demo',
    label: 'Демо-прототип',
    icon: 'puzzle',
    description: 'Пример прототипа плагина',
    category: 'front',
  },
  {
    path: '/prototype/eagle',
    label: 'Eagle — Панель управления',
    icon: 'bot',
    description: 'Панель администрирования: регистрация, маппинг столов, настройки сценариев',
    category: 'front',
  },
  {
    path: '/prototype/falcon',
    label: 'Falcon — Плагин Front',
    icon: 'bot',
    description: 'Плагин POS-терминала: управление роботами, отправка меню, уборка, QR-оплата',
    category: 'front',
  },
  {
    path: '/prototype/neptune',
    label: 'Neptune — Guest Management',
    icon: 'scan-line',
    description: 'Плагин интеграции Front с системой управления гостями',
    category: 'front',
  },
  {
    path: '/prototype/demo-wizard',
    label: 'Демонстрация Wizard',
    icon: 'wand-2',
    description: 'Сравнение 4 подходов к автоматической демонстрации User Stories',
    category: 'front',
  },
  {
    path: '/prototype/comet',
    label: 'Comet — Панель интеграций',
    icon: 'qr-code',
    description: 'Панель управления QR-табличками и ключами платёжной системы',
    category: 'front',
  },
  {
    path: '/prototype/aurora',
    label: 'Aurora — Оплата кошельком',
    icon: 'wallet',
    description: 'Плагин оплаты кошельком (Front) + панель управления credentials (Web)',
    category: 'front',
  },
  {
    path: '/prototype/design-tokens',
    label: 'Дизайн-токены Web',
    icon: 'palette',
    description: 'Визуальный справочник дизайн-токенов: цвета, типографика, отступы, компоненты',
    category: 'front',
  },
  {
    path: '/prototype/titan',
    label: 'Titan — API Key Consent',
    icon: 'key-round',
    description: 'Управление доступом внешних систем к API ресторана через consent-механизм',
    category: 'front',
  },
  {
    path: '/prototype/front-base',
    label: 'Front Base — Терминал',
    icon: 'monitor',
    description: 'Унифицированная база терминала Front: общие компоненты для всех Front-плагинов',
    category: 'front',
  },
  {
    path: '/prototype/sparrow',
    label: 'Sparrow — Плагин Front',
    icon: 'coffee',
    description: 'Плагин интеграции Front с внешним сервисом заказов кофейни',
    category: 'front',
  },
  // === Добавляй новые прототипы ВЫШЕ этой строки ===
];
