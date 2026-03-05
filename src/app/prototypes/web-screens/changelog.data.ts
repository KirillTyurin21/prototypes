import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.1',
    date: '2026-03-05',
    status: 'released',
    changes: [
      {
        page: 'Подсказки — редактирование',
        pageRoute: '/prototype/web-screens/hints',
        items: [
          'Поле «Размер скидки» теперь поддерживает дробные значения (до 2 знаков после запятой) для процента и фиксированной суммы',
          'Убран символ валюты для фиксированной суммы (международная совместимость)',
        ],
      },
    ],
  },
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
