import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0',
    date: '2026-05-18',
    status: 'unreleased',
    changes: [
      {
        items: [
          'Создан прототип: API Key Consent — управление доступом банков к данным ресторана',
        ],
      },
      {
        page: 'Главная',
        pageRoute: '/prototype/halyk-consent',
        items: ['Dashboard с навигацией по разделам прототипа'],
      },
      {
        page: 'Интеграции',
        pageRoute: '/prototype/halyk-consent/integrations',
        items: ['Имитация раздела Web с кнопкой «API Key» и badge'],
      },
      {
        page: 'Запросы на доступ',
        pageRoute: '/prototype/halyk-consent/access-requests',
        items: [
          'Список карточек запросов от банков с фильтрацией по статусу',
          'Действия: одобрить, отклонить, отозвать ключ, отменить отказ',
          'Чекбокс обязательного согласия перед одобрением',
          'Аудит-лог (timeline) внутри карточки',
        ],
      },
      {
        page: 'Статус плагина',
        pageRoute: '/prototype/halyk-consent/plugin-status',
        items: ['Визуализация реакции плагина Front на изменение integration_status'],
      },
    ],
  },
];
