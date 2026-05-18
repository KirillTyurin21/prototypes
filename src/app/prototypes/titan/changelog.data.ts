import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0',
    date: '2026-05-18',
    status: 'unreleased',
    changes: [
      {
        items: [
          'Создан прототип: управление доступом внешних систем к API ресторана через consent-механизм',
        ],
      },
      {
        page: 'Запросы доступа',
        pageRoute: '/prototype/titan',
        items: [
          'Табличный список запросов с фильтрацией по статусу',
          'Approve / Reject / Revoke с аудит-логом',
          'Раскрываемые карточки запросов с деталями scope',
        ],
      },
      {
        page: 'Подключения',
        pageRoute: '/prototype/titan',
        items: [
          'Список активных интеграций с preview API-ключа',
          'TTL и дата истечения',
        ],
      },
      {
        page: 'Реакция плагина',
        items: [
          'Визуализация state machine integration_status (панель)',
          'Имитация команд IntegrationStatusChanged',
        ],
      },
    ],
  },
];
