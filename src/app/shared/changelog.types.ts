export interface ChangelogRelease {
  /** Версия, например "1.8", "2.0" */
  version: string;
  /** Дата релиза, формат YYYY-MM-DD */
  date: string;
  /** Статус: released = в master, unreleased = только в dev */
  status: 'released' | 'unreleased';
  /** Группы изменений (по страницам) */
  changes: ChangeGroup[];
}

export interface ChangeGroup {
  /** Название страницы для группировки (опционально — если нет, это «Общие изменения») */
  page?: string;
  /** Маршрут страницы — делает название кликабельным (опционально) */
  pageRoute?: string;
  /** Список изменений в свободной форме */
  items: string[];
}
