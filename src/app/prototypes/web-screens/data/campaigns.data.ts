/**
 * Кампании (Advertise screens) — типы и мок-данные.
 * Реплика раздела «Экраны и звуки → Кампании» (customer-screen).
 */

// ─── Типы ──────────────────────────────────────

/**
 * Режим экрана (screen mode), для которого настраивается реклама кампании.
 * - common — есть в темах ЭС и ЭО, всегда видимы («Экран заказа», «Режим ожидания»);
 * - standard — только в теме ЭС, редкие, добавляются через «+»;
 * - custom — создаются пользователем в теме ЭО (через «Добавить»).
 */
export type ScreenModeKind = 'common' | 'standard' | 'custom';

/** Условие показа кастомного режима (ControlArea из темы ЭО) */
export interface ControlAreaCondition {
  operator: string;      // '>', '<', '==', '>=', '<=', '!='
  value: number;
  combine?: 'OR' | 'AND';
}

export interface ScreenModeInfo {
  id: string;            // ключ режима: 'order', 'idle', 'payment', 'finish', 'not-working', 'a1'...
  code: string;          // ID, отображаемый пользователю: '0', '1', '2', '3', '4', 'A1'...
  name: string;          // 'Экран заказа', ...
  kind: ScreenModeKind;
  controlArea?: ControlAreaCondition[];
}

/** Общие режимы — всегда вкладки, без крестика удаления */
export const COMMON_MODE_IDS: string[] = ['order', 'idle'];

/** Реестр всех режимов экранов */
export const SCREEN_MODE_REGISTRY: ScreenModeInfo[] = [
  { id: 'order', code: '0', name: 'Экран заказа', kind: 'common' },
  { id: 'idle', code: '1', name: 'Режим ожидания', kind: 'common' },
  { id: 'payment', code: '2', name: 'Экран оплаты', kind: 'standard' },
  { id: 'finish', code: '3', name: 'Экран завершения', kind: 'standard' },
  { id: 'not-working', code: '4', name: 'Касса не работает', kind: 'standard' },
  // Кастомные режимы, созданные пользователем в теме Электронной очереди:
  { id: 'a1', code: 'A1', name: 'Режим доставки', kind: 'custom', controlArea: [{ operator: '>', value: 8 }] },
  { id: 'a2', code: 'A2', name: 'Экран посадки', kind: 'custom', controlArea: [{ operator: '==', value: 1 }] },
];

export function getScreenMode(id: string): ScreenModeInfo | undefined {
  return SCREEN_MODE_REGISTRY.find(m => m.id === id);
}

export interface CampaignMedia {
  id: number;
  name: string;
  type: string; // 'image/jpeg' | 'video/mp4'
  sizeKb: number;
  width: number;
  height: number;
  durationMin: number;
  durationSec: number;
  color: string; // цвет плашки-превью (мок)
}

export interface CampaignResolution {
  id: number;
  width: number;
  height: number;
  /** Ключ — ID режима экрана (см. SCREEN_MODE_REGISTRY) */
  modes: Record<string, CampaignMedia[]>;
}

export interface WebCampaign {
  id: number;
  name: string;
  dateFrom: string; // '2026-08-13'
  dateTo: string;   // '2026-08-13'
  timeFrom: string; // '00:00'
  timeTo: string;   // '23:59'
  days: boolean[];  // 7 дней недели, Пн–Вс
  folderId: number | null;
  resolutions: CampaignResolution[];
}

export interface CampaignFolder {
  id: number;
  name: string;
  parentId: number | null;
}

export interface GalleryFile {
  id: number;
  name: string;
  type: string;
  sizeKb: number;
  date: string; // '21.01.1970'
  width: number;
  height: number;
  color: string;
}

// ─── Утилиты ───────────────────────────────────

export function formatDate(d: string): string {
  // '2026-08-13' → '13.08.2026'
  const [y, m, dd] = d.split('-');
  return `${dd}.${m}.${y}`;
}

export function formatSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1).replace('.', ',')} МБ` : `${kb} КБ`;
}

export function emptyResolutionsModes(): Record<string, CampaignMedia[]> {
  // По умолчанию — только общие режимы: «Экран заказа» и «Режим ожидания»
  return { order: [], idle: [] };
}

// ─── Мок: галерея (медиатека) ──────────────────

export const GALLERY_FILES: GalleryFile[] = [
  { id: 1, name: '2402.jpg', type: 'image/jpeg', sizeKb: 606, date: '21.01.1970', width: 1024, height: 768, color: '#B39DDB' },
  { id: 2, name: '4.jpg', type: 'image/jpeg', sizeKb: 606, date: '21.01.1970', width: 1024, height: 768, color: '#90CAF9' },
  { id: 3, name: 'coffee-latte.jpg', type: 'image/jpeg', sizeKb: 414, date: '12.05.2026', width: 1920, height: 1080, color: '#FFCC80' },
  { id: 4, name: 'breakfast.jpg', type: 'image/jpeg', sizeKb: 508, date: '12.05.2026', width: 1024, height: 768, color: '#A5D6A7' },
  { id: 5, name: 'lunch-promo.mp4', type: 'video/mp4', sizeKb: 9216, date: '02.06.2026', width: 1024, height: 768, color: '#80CBC4' },
  { id: 6, name: 'new-menu.jpg', type: 'image/jpeg', sizeKb: 731, date: '02.06.2026', width: 1024, height: 768, color: '#F48FB1' },
  { id: 7, name: 'banner-autumn.jpg', type: 'image/jpeg', sizeKb: 650, date: '19.06.2026', width: 1920, height: 1080, color: '#CE93D8' },
  { id: 8, name: 'welcome-screen.jpg', type: 'image/jpeg', sizeKb: 420, date: '19.06.2026', width: 1024, height: 768, color: '#81D4FA' },
];

// ─── Мок: кампании и папки ─────────────────────

export const CAMPAIGN_FOLDERS: CampaignFolder[] = [
  { id: 1, name: 'Сезонные акции', parentId: null },
  { id: 2, name: 'Осень', parentId: 1 },
];

export const WEB_CAMPAIGNS: WebCampaign[] = [
  {
    id: 33,
    name: 'Новая кампания 1',
    dateFrom: '2026-08-13',
    dateTo: '2026-08-13',
    timeFrom: '00:00',
    timeTo: '23:59',
    days: [true, true, true, true, true, true, true],
    folderId: null,
    resolutions: [
      {
        id: 1,
        width: 1024,
        height: 768,
        modes: {
          order: [],
          idle: [],
        },
      },
    ],
  },
  {
    id: 34,
    name: 'Летняя акция',
    dateFrom: '2026-06-01',
    dateTo: '2026-08-31',
    timeFrom: '08:00',
    timeTo: '22:00',
    days: [true, true, true, true, true, true, true],
    folderId: 1,
    resolutions: [
      {
        id: 1,
        width: 1024,
        height: 768,
        modes: {
          order: [
            { id: 1, name: '4.jpg', type: 'image/jpeg', sizeKb: 606, width: 1024, height: 768, durationMin: 0, durationSec: 30, color: '#90CAF9' },
            { id: 2, name: 'coffee-latte.jpg', type: 'image/jpeg', sizeKb: 414, width: 1920, height: 1080, durationMin: 0, durationSec: 30, color: '#FFCC80' },
          ],
          idle: [
            { id: 3, name: 'welcome-screen.jpg', type: 'image/jpeg', sizeKb: 420, width: 1024, height: 768, durationMin: 0, durationSec: 30, color: '#81D4FA' },
          ],
          // Добавленные через «+» режимы:
          payment: [
            { id: 7, name: 'banner-autumn.jpg', type: 'image/jpeg', sizeKb: 650, width: 1920, height: 1080, durationMin: 0, durationSec: 30, color: '#CE93D8' },
          ],
          a1: [
            { id: 8, name: 'delivery-screen.jpg', type: 'image/jpeg', sizeKb: 305, width: 1024, height: 768, durationMin: 0, durationSec: 30, color: '#FFE082' },
          ],
        },
      },
      {
        id: 2,
        width: 1920,
        height: 1080,
        modes: {
          order: [
            { id: 4, name: 'coffee-latte.jpg', type: 'image/jpeg', sizeKb: 414, width: 1920, height: 1080, durationMin: 0, durationSec: 30, color: '#FFCC80' },
          ],
          idle: [],
        },
      },
    ],
  },
  {
    id: 35,
    name: 'Новинки меню',
    dateFrom: '2026-07-15',
    dateTo: '2026-09-15',
    timeFrom: '09:00',
    timeTo: '21:00',
    days: [true, true, true, true, true, false, false],
    folderId: 2,
    resolutions: [
      {
        id: 1,
        width: 1024,
        height: 768,
        modes: {
          order: [
            { id: 5, name: 'new-menu.jpg', type: 'image/jpeg', sizeKb: 731, width: 1024, height: 768, durationMin: 0, durationSec: 30, color: '#F48FB1' },
          ],
          idle: [],
          // Добавленный через «+» режим:
          'not-working': [
            { id: 9, name: 'terminal-off.jpg', type: 'image/jpeg', sizeKb: 288, width: 1024, height: 768, durationMin: 0, durationSec: 30, color: '#B0BEC5' },
          ],
        },
      },
    ],
  },
  {
    id: 36,
    name: 'Утренние завтраки',
    dateFrom: '2026-08-01',
    dateTo: '2026-10-01',
    timeFrom: '07:00',
    timeTo: '11:00',
    days: [true, true, true, true, true, true, true],
    folderId: null,
    resolutions: [
      {
        id: 1,
        width: 1024,
        height: 768,
        modes: {
          order: [
            { id: 6, name: 'breakfast.jpg', type: 'image/jpeg', sizeKb: 508, width: 1024, height: 768, durationMin: 0, durationSec: 30, color: '#A5D6A7' },
          ],
          idle: [],
        },
      },
    ],
  },
];
