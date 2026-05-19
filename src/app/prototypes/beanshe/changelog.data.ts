import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0',
    date: '2026-05-19',
    status: 'unreleased',
    changes: [
      {
        items: [
          'Создан прототип: плагин интеграции Front с системой мобильных заказов Beanshe',
        ],
      },
      {
        page: 'Список заказов',
        pageRoute: '/prototype/beanshe/orders',
        items: [
          'Основное окно со списком заказов (карточки)',
          'Вкладки: Активные / Отменённые / Закрытые',
          'Свитч «На смене» для включения/выключения приёма заказов',
          'Кнопки «Принять» и «Отменить» для новых заказов',
          'Информация о составе, времени выдачи, сумме и комментарии',
        ],
      },
      {
        page: 'Демо нотификаций',
        pageRoute: '/prototype/beanshe/notification-demo',
        items: [
          'Демонстрация блокирующей нотификации о новом заказе',
          'Полноэкранный overlay с данными заказа и кнопками действий',
        ],
      },
    ],
  },
];
