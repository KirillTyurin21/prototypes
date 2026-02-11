/**
 * Реестр всех прототипов — добавляй сюда новые прототипы.
 * Они автоматически появятся в sidebar и на главной странице.
 */
export interface PrototypeEntry {
  path: string;
  label: string;
  icon: string;        // имя иконки lucide (kebab-case), напр. 'puzzle'
  description?: string;
}

export const PROTOTYPES: PrototypeEntry[] = [
  {
    path: '/prototype/iiko-front-plugins',
    label: 'Плагины iikoFront — Макеты окон',
    icon: 'credit-card',
    description: 'Макеты модальных окон (попапов) плагинов кассового терминала iikoFront',
  },
  {
    path: '/prototype/demo',
    label: 'Демо-прототип',
    icon: 'puzzle',
    description: 'Пример прототипа плагина',
  },
  {
    path: '/prototype/iikoweb-screens',
    label: 'iikoWeb — Advertise Screens',
    icon: 'monitor-play',
    description: 'Прототип модуля управления гостевыми экранами и табло прибытия',
  },
  {
    path: '/prototype/pudu-yandex-pay',
    label: 'Роботы PUDU',
    icon: 'bot',
    description: 'Панель администрирования роботов PUDU: регистрация, маппинг столов, настройки сценариев',
  },
  {
    path: '/prototype/iiko-front-pudu-plugin',
    label: 'PUDU — Плагин iikoFront',
    icon: 'bot',
    description: 'Плагин POS-терминала: управление роботами PUDU, отправка меню, уборка, QR-оплата',
  },
  // === Добавляй новые прототипы ВЫШЕ этой строки ===
];
