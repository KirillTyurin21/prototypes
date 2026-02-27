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

/**
 * Версия конфигурации кодов. При смене кодов увеличивайте версию —
 * это автоматически инвалидирует все ранее сохранённые сессии.
 */
export const ACCESS_CONFIG_VERSION = 4;

export const ACCESS_CONFIG: AccessConfig = {
  masterCodeHash: '11c96e17631a83155e5ccdeec38c5272de12b99f440a693a0c10c67b2d29f493',
  masterTtlDays: 30,

  groups: [
    {
      codeHash: '9c9adc004e8e239483beea66104ed383c07f866faad86c10d615451efb25989e',
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
      codeHash: '181da7bc377d648d041fafd9bed30ec9cd5a2ba68b7e85a6f6d0bf079b2fd50a',
      ttlDays: 7,
    },
    'pudu-admin': {
      codeHash: '715206f2f04fec37ea7e85d743c26bae7932e18aa6d3debdd14b8a9ed48f6022',
      ttlDays: 7,
    },
    'front-plugins': {
      codeHash: 'ba3964075591f15fd5d3843e6e197670ec7f9bb5f3a6a7c840483609e0150001',
      ttlDays: 7,
    },
    'web-screens': {
      codeHash: '275614a98b9f2588e3baf32928d5cc4a20c92c9833c02e7197a883210cccce56',
      ttlDays: 7,
    },
    'demo': {
      codeHash: 'd8c579ecc4b91795174215031b57fe7fe6db3383130a7cb588332888b3541bc9',
      ttlDays: 7,
    },
  },
};
