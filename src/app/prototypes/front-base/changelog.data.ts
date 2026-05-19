import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.0',
    date: '2026-05-20',
    status: 'unreleased',
    changes: [
      {
        items: [
          'Создан прототип: унифицированная база терминала Front',
          'Реализован главный экран терминала (5-колоночная сетка с секциями)',
          'Создан POS-shell — контейнер-рамка терминала (header + bottom bar)',
          'Создана POS-кнопка с анимацией нажатия',
          'Создан единый POS-диалог для окон плагинов',
        ],
      },
    ],
  },
];
