import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0',
    date: '2026-05-15',
    status: 'released',
    changes: [
      {
        items: [
          'Создан прототип: справочник дизайн-токенов Web',
          'Экран «Цвета» — палитра brand, semantic, base цветов',
          'Экран «Типографика» — шрифты, размеры, веса',
          'Экран «Отступы и тени» — spacing, radius, shadows, strokes',
          'Экран «Компоненты» — кнопки, инпуты, чипсы, статусы, таблицы и др.',
        ],
      },
    ],
  },
];
