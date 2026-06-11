import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.1',
    date: '2026-06-11',
    status: 'released',
    changes: [
      {
        page: 'Права доступа',
        pageRoute: '/prototype/web-settings',
        items: [
          'Убраны промежуточные подпапки внутри «Экраны и звуки» — коды APP_* теперь на первом уровне (обратная связь Миши)',
        ],
      },
    ],
  },
  {
    version: '1.0',
    date: '2026-06-10',
    status: 'released',
    changes: [
      {
        page: 'Права доступа',
        pageRoute: '/prototype/web-settings',
        items: [
          'Создан прототип страницы «Права доступа» Web',
          'Добавлена новая папка «Экраны и звуки» верхнего уровня с 5 подпапками',
          'Зарегистрированы коды APP_CUSTOMER_SCREEN, APP_HINTS, APP_MENU_BOARD (с пометкой «Новый»)',
          'Коды APP_ARRIVALS и APP_DIGITAL_VOICE перенесены в соответствующие подпапки',
          'Реализован выбор роли и интерактивное дерево прав с чекбоксами',
          'Добавлен поиск по ролям и по названию/коду права',
          'Сохранение состояния чекбоксов в localStorage',
        ],
      },
    ],
  },
];
