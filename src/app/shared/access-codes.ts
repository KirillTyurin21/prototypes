/**
 * Конфигурация кодов доступа к прототипам.
 *
 * Уровни доступа:
 * 1. Мастер-код — открывает ВСЁ (список + все прототипы). Для команды iiko.
 * 2. Групповой код — открывает группу прототипов (для клиента с несколькими заказами).
 * 3. Код прототипа — открывает один конкретный прототип.
 *
 * Мастер-код также открывает список прототипов.
 */

export interface PrototypeAccessEntry {
  /** Индивидуальный код доступа к прототипу */
  code: string;
  /** Время жизни кода в днях */
  ttlDays: number;
}

export interface GroupAccessEntry {
  /** Код доступа к группе */
  code: string;
  /** Время жизни кода в днях */
  ttlDays: number;
  /** Slug-пути прототипов в группе (без /prototype/ префикса) */
  prototypeSlugs: string[];
  /** Название группы (для отображения) */
  label: string;
}

export interface AccessConfig {
  /** Мастер-код: открывает ВСЁ */
  masterCode: string;
  /** TTL мастер-кода в днях */
  masterTtlDays: number;
  /** Групповые коды доступа */
  groups: GroupAccessEntry[];
  /** Индивидуальные коды прототипов (ключ = slug, напр. 'iiko-front-pudu-plugin') */
  prototypes: Record<string, PrototypeAccessEntry>;
}

export const ACCESS_CONFIG: AccessConfig = {
  masterCode: 'IIKO_TEAM_2025',
  masterTtlDays: 30,

  groups: [
    {
      code: 'PUDU_GROUP_2025',
      ttlDays: 7,
      label: 'Pudu — Все прототипы',
      prototypeSlugs: [
        'iiko-front-pudu-plugin',
        'pudu-yandex-pay',
      ],
    },
  ],

  prototypes: {
    'iiko-front-pudu-plugin': {
      code: 'PUDU_FRONT_01',
      ttlDays: 7,
    },
    'pudu-yandex-pay': {
      code: 'PUDU_ADMIN_01',
      ttlDays: 7,
    },
    'iiko-front-plugins': {
      code: 'FRONT_PLUGINS_01',
      ttlDays: 7,
    },
    'iikoweb-screens': {
      code: 'WEB_SCREENS_01',
      ttlDays: 7,
    },
    'demo': {
      code: 'DEMO_2025',
      ttlDays: 7,
    },
  },
};
