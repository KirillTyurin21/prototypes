/**
 * Конфигурация кодов доступа к прототипам.
 *
 * ВАЖНО: все коды хранятся как SHA-256 хеши (lowercase hex).
 * Открытый текст кодов НЕ присутствует в JS-бандле.
 *
 * Уровни доступа:
 * 1. Мастер-код — открывает ВСЁ (список + все прототипы). Для команды.
 * 2. Групповой код — открывает группу прототипов (для клиента с несколькими заказами).
 * 3. Код прототипа — открывает один конкретный прототип.
 *
 * Мастер-код также открывает список прототипов.
 */

export interface PrototypeAccessEntry {
  /** SHA-256 hex hash кода доступа (lowercase) */
  codeHash: string;
  /** Время жизни кода в днях */
  ttlDays: number;
}

export interface GroupAccessEntry {
  /** SHA-256 hex hash кода доступа (lowercase) */
  codeHash: string;
  /** Время жизни кода в днях */
  ttlDays: number;
  /** Slug-пути прототипов в группе (без /prototype/ префикса) */
  prototypeSlugs: string[];
  /** Название группы (для отображения) */
  label: string;
}

export interface AccessConfig {
  /** SHA-256 hex hash мастер-кода */
  masterCodeHash: string;
  /** TTL мастер-кода в днях */
  masterTtlDays: number;
  /** Групповые коды доступа */
  groups: GroupAccessEntry[];
  /** Индивидуальные коды прототипов (ключ = slug, напр. 'front-pudu-plugin') */
  prototypes: Record<string, PrototypeAccessEntry>;
}

export const ACCESS_CONFIG: AccessConfig = {
  // TEAM_2026
  masterCodeHash: '21535e72d28a2d23f28eaab61e428e33d3674ec65b5f12e2aa94ab90a45faf2d',
  masterTtlDays: 30,

  groups: [
    {
      // PUDU_GROUP_2026
      codeHash: 'd09906fcc8f7e3f5c346dcac14e74229f5e63caa18a102e06b36531f6726e08f',
      ttlDays: 7,
      label: 'Pudu — Все прототипы',
      prototypeSlugs: [
        'front-pudu-plugin',
        'pudu-admin',
      ],
    },
  ],

  prototypes: {
    'front-pudu-plugin': {
      // PUDU_FRONT_2026
      codeHash: '9a927e2761342938868375c024d97f52c4c24a000fbdc3087abe3466915f4380',
      ttlDays: 7,
    },
    'pudu-admin': {
      // PUDU_ADMIN_2026
      codeHash: 'afc11d9ededce10e5b5b1cd8180d7b650769fe1cac403dc0cb7e2a40dfc106bf',
      ttlDays: 7,
    },
    'front-plugins': {
      // FRONT_PLUGINS_2026
      codeHash: 'ed33412c1a5030817905748600cce58d4fccae24d319616094e19f03eab9250f',
      ttlDays: 7,
    },
    'web-screens': {
      // WEB_SCREENS_2026
      codeHash: '824ea8f6f8d1baa5383e8a8800d0c6d83400914d6db86794fdb815428a2cb8c7',
      ttlDays: 7,
    },
    'demo': {
      // DEMO_2026
      codeHash: '5f88efe1ee74c92acd7d5e00ecb89e50d533ca1f1a6b89655fa3f4159385a1ae',
      ttlDays: 7,
    },
  },
};
