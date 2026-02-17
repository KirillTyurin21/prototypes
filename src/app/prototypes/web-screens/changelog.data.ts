import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0',
    date: '2026-02-16',
    status: 'released',
    changes: [
      {
        items: [
          'Начальная версия прототипа',
          'Экраны дисплеев, тем, контролов, подсказок и терминалов',
          'Customer Screen Data Service для управления данными',
          'CRUD-операции по всем сущностям',
        ],
      },
    ],
  },
];
