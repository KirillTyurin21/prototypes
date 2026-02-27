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
export const ACCESS_CONFIG_VERSION = 3;

export const ACCESS_CONFIG: AccessConfig = {
  masterCodeHash: '8cbbfe30b3cb7e14a76bf1f08c8cfc512424d02027ad5452df9b7ca52bc9bc9a',
  masterTtlDays: 30,

  groups: [
    {
      codeHash: '2bd5ef03f44050113fb1809a86f96528609a2607c1099dcd42053b714e6dce55',
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
      codeHash: '8af8b038cdd0f86bab1d8c888935bf8bffb10ad4a767b6580f72ac2dac4fd2a8',
      ttlDays: 7,
    },
    'pudu-admin': {
      codeHash: 'e6dcc2ff880f95164d3bbbb09316b7be0943d98ce4d7d02c74624c4662af97d6',
      ttlDays: 7,
    },
    'front-plugins': {
      codeHash: 'dfd8ce1b4c6ef2e65046d9ec16b4fd6c2e4af45c48f401c3856c1e39b4a18dd2',
      ttlDays: 7,
    },
    'web-screens': {
      codeHash: '6f81de714afb3f03a3f1b562b8ffcfa565d9e21303e38bc414d10f006f72c109',
      ttlDays: 7,
    },
    'demo': {
      codeHash: '1eeea1373983a9dbd26d85862ae334faf2eba833c40218239c53044d8db7f59c',
      ttlDays: 7,
    },
  },
};
