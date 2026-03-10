import { ChangelogRelease } from '@/shared/changelog.types';

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '1.6',
    date: '2026-03-10',
    status: 'released',
    changes: [
      {
        page: 'Подход D',
        pageRoute: '/prototype/demo-wizard/approach-d',
        items: [
          'Реализован подход D: Guided Tour (стиль Driver.js)',
          'Тёмный overlay с вырезом и белой обводкой вокруг текущего элемента',
          'Popover-карточка с заголовком, описанием и CSS-стрелкой к элементу',
          'Прогресс-точки (● ● ○ ○ ○ ○ ○ ○) и счётчик шагов в футере popover',
          'Автоматическое позиционирование popover (top/bottom/left/right)',
          'Плавная анимация перехода spotlight и popover между шагами',
          'Финальный экран «Демо завершено» с кнопкой возврата',
        ],
      },
    ],
  },
  {
    version: '1.5',
    date: '2026-03-10',
    status: 'released',
    changes: [
      {
        page: 'Подход C',
        pageRoute: '/prototype/demo-wizard/approach-c',
        items: [
          'Реализован подход C: Replay Engine (Декларативный)',
          'Полупрозрачный overlay с spotlight (box-shadow вырез) на текущем элементе',
          'Tooltip с номером шага и описанием',
          'Панель управления внизу: Пауза/Продолжить, Стоп, переключатель скорости (0.5x / 1x / 2x)',
          'State machine: idle → playing → paused → finished',
          'Множитель скорости влияет на все задержки и typewriter-эффект',
          'Финальный экран «Демо завершено» с кнопкой возврата',
        ],
      },
    ],
  },
  {
    version: '1.4',
    date: '2026-03-10',
    status: 'released',
    changes: [
      {
        page: 'Подход B',
        pageRoute: '/prototype/demo-wizard/approach-b',
        items: [
          'Реализован подход B: Программный (Programmatic)',
          'Форма заполняется автоматически без overlay — минималистичный подход',
          'Ring-glow подсветка на активном элементе формы',
          'Компактная панель прогресса в правом верхнем углу с описанием шага',
          'ScrollIntoView для плавной прокрутки к каждому полю',
          'Финальный экран «Демо завершено» с кнопкой возврата',
        ],
      },
    ],
  },
  {
    version: '1.3',
    date: '2026-03-10',
    status: 'released',
    changes: [
      {
        page: 'Подход A',
        pageRoute: '/prototype/demo-wizard/approach-a',
        items: [
          'Реализован подход A: DOM Overlay + Курсор-призрак',
          'SVG-курсор анимированно перемещается к каждому полю формы',
          'Spotlight (box-shadow вырез) подсвечивает текущий элемент',
          'Ripple-анимация при «клике» курсора',
          'Tooltip с описанием шага и номером',
          'Progress bar внизу с кнопкой «Прервать»',
        ],
      },
    ],
  },
  {
    version: '1.2',
    date: '2026-03-10',
    status: 'released',
    changes: [
      {
        items: [
          'Создан общий форм-компонент WizardDemoForm с data-demo атрибутами на всех элементах',
          'Создан модуль утилит demo-steps: 8 шагов демонстрации, typewriter-эффект, программное взаимодействие с DOM',
        ],
      },
    ],
  },
  {
    version: '1.1',
    date: '2026-03-10',
    status: 'released',
    changes: [
      {
        page: 'Выбор подхода',
        pageRoute: '/prototype/demo-wizard',
        items: [
          'Создан экран выбора подхода с 4 карточками (A/B/C/D)',
          'Карточки отображают описание, сложность, WOW-эффект и теги',
          'Кнопка «Запустить демо» для перехода к каждому подходу',
        ],
      },
    ],
  },
  {
    version: '1.0',
    date: '2026-03-10',
    status: 'released',
    changes: [
      {
        items: [
          'Создан прототип: сравнение 4 подходов к автоматической демонстрации User Stories',
        ],
      },
    ],
  },
];
