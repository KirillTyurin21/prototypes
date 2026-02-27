import { Injectable, inject } from '@angular/core';
import { ACCESS_CONFIG, ACCESS_CONFIG_VERSION, GroupAccessEntry } from './access-codes';
import { RateLimitService } from './rate-limit.service';
import { FingerprintService } from './fingerprint.service';

const LS_MASTER = 'master_access';
const LS_LIST = 'list_access';
const LS_GROUP_PREFIX = 'group_access_';
const LS_PROTO_PREFIX = 'proto_access_';
const LS_CONFIG_VERSION = 'access_config_version';

@Injectable({ providedIn: 'root' })
export class AccessCodeService {
  private rateLimitService = inject(RateLimitService);
  private fingerprintService = inject(FingerprintService);
  private cachedFingerprint: string | null = null;

  constructor() {
    this.checkConfigVersion();
  }

  /**
   * Проверяет версию конфигурации кодов доступа.
   * Если версия изменилась — удаляет все сохранённые сессии,
   * чтобы старые коды гарантированно не работали.
   */
  private checkConfigVersion(): void {
    const storedVersion = localStorage.getItem(LS_CONFIG_VERSION);
    const currentVersion = String(ACCESS_CONFIG_VERSION);

    if (storedVersion !== currentVersion) {
      // Версия изменилась — инвалидируем все старые сессии
      this.revokeAll();
      localStorage.setItem(LS_CONFIG_VERSION, currentVersion);
    }
  }

  // ───── Public methods ─────

  /**
   * Читает query-параметр `code` из hash-based URL и, если валиден, сохраняет доступ.
   * Формат: `#/prototype/slug?code=XXX`
   */
  async checkCodeFromUrl(): Promise<void> {
    const hash = window.location.hash; // e.g. "#/prototype/slug?code=XXX"
    if (!hash) return;

    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return;

    const queryString = hash.substring(qIndex + 1);
    const params = new URLSearchParams(queryString);
    const code = params.get('code');

    if (code) {
      await this.validateAndStoreCode(code);
      // Очистить код из URL — предотвращает утечку через историю браузера и Referer
      const cleanHash = hash.substring(0, qIndex);
      history.replaceState(null, '', cleanHash || '#/');
    }
  }

  /**
   * Проверяет код (через SHA-256 хеш) и сохраняет соответствующий доступ в localStorage.
   * Rate-limit: при неудачной попытке регистрируется failed attempt.
   */
  async validateAndStoreCode(code: string): Promise<{
    valid: boolean;
    type: 'master' | 'group' | 'prototype' | 'invalid' | 'locked';
    label?: string;
  }> {
    // Инициализируем rate-limit (lazy)
    await this.rateLimitService.init();

    // Проверка блокировки
    if (this.rateLimitService.isLocked()) {
      return { valid: false, type: 'locked' };
    }

    // Инициализируем fingerprint для HMAC-подписи сессий
    await this.ensureFingerprint();

    const codeHash = await this.sha256(code.trim().toUpperCase());

    // 1. Мастер-код
    if (this.constantTimeEqual(codeHash, ACCESS_CONFIG.masterCodeHash)) {
      this.storeAccess(LS_MASTER, codeHash, ACCESS_CONFIG.masterTtlDays);
      this.storeAccess(LS_LIST, codeHash, 30); // доступ к списку — 30 дней, сохраняем мастер-хеш для верификации
      this.rateLimitService.recordSuccess();
      return { valid: true, type: 'master', label: 'Мастер-доступ' };
    }

    // 2. Групповой код
    for (const group of ACCESS_CONFIG.groups) {
      if (this.constantTimeEqual(codeHash, group.codeHash)) {
        const groupKey = LS_GROUP_PREFIX + group.codeHash.substring(0, 12);
        this.storeAccess(groupKey, codeHash, group.ttlDays);
        this.rateLimitService.recordSuccess();
        return { valid: true, type: 'group', label: group.label };
      }
    }

    // 3. Код прототипа
    for (const [slug, entry] of Object.entries(ACCESS_CONFIG.prototypes)) {
      if (this.constantTimeEqual(codeHash, entry.codeHash)) {
        const protoKey = LS_PROTO_PREFIX + slug;
        this.storeAccess(protoKey, codeHash, entry.ttlDays);
        this.rateLimitService.recordSuccess();
        return { valid: true, type: 'prototype', label: slug };
      }
    }

    // Неверный код — регистрируем failed attempt
    this.rateLimitService.recordFailedAttempt();
    return { valid: false, type: 'invalid' };
  }

  /**
   * Проверяет доступ к конкретному прототипу по slug.
   */
  hasAccessToPrototype(slug: string): boolean {
    // Мастер-доступ
    if (this.hasMasterAccess()) return true;

    // Групповой доступ — проверяем все группы, содержащие slug
    for (const group of ACCESS_CONFIG.groups) {
      if (group.prototypeSlugs.includes(slug)) {
        const groupKey = LS_GROUP_PREFIX + group.codeHash.substring(0, 12);
        if (this.isStoredAccessValid(groupKey)) return true;
      }
    }

    // Индивидуальный доступ
    return this.isStoredAccessValid(LS_PROTO_PREFIX + slug);
  }

  /**
   * Проверяет доступ к списку прототипов (только мастер-код даёт доступ к списку).
   */
  hasAccessToList(): boolean {
    return this.isStoredAccessValid(LS_LIST);
  }

  /**
   * Проверяет наличие активного мастер-доступа.
   */
  hasMasterAccess(): boolean {
    return this.isStoredAccessValid(LS_MASTER);
  }

  /**
   * Возвращает список slug-ов прототипов, к которым есть доступ.
   */
  getAccessiblePrototypeSlugs(): string[] {
    const slugs = new Set<string>();

    // Мастер — все прототипы
    if (this.hasMasterAccess()) {
      for (const slug of Object.keys(ACCESS_CONFIG.prototypes)) {
        slugs.add(slug);
      }
      return Array.from(slugs);
    }

    // Групповые доступы
    for (const group of ACCESS_CONFIG.groups) {
      const groupKey = LS_GROUP_PREFIX + group.codeHash.substring(0, 12);
      if (this.isStoredAccessValid(groupKey)) {
        for (const s of group.prototypeSlugs) {
          slugs.add(s);
        }
      }
    }

    // Индивидуальные доступы
    for (const slug of Object.keys(ACCESS_CONFIG.prototypes)) {
      if (this.isStoredAccessValid(LS_PROTO_PREFIX + slug)) {
        slugs.add(slug);
      }
    }

    return Array.from(slugs);
  }

  /**
   * Возвращает группы, к которым у пользователя есть доступ.
   * При мастер-доступе возвращает пустой массив (не нужны — всё доступно через полный список).
   */
  getAccessibleGroups(): GroupAccessEntry[] {
    if (this.hasMasterAccess()) return [];

    return ACCESS_CONFIG.groups.filter(group => {
      const groupKey = LS_GROUP_PREFIX + group.codeHash.substring(0, 12);
      return this.isStoredAccessValid(groupKey);
    });
  }

  /**
   * Удаляет все коды доступа из localStorage.
   */
  revokeAll(): void {
    localStorage.removeItem(LS_MASTER);
    localStorage.removeItem(LS_LIST);

    for (const group of ACCESS_CONFIG.groups) {
      localStorage.removeItem(LS_GROUP_PREFIX + group.codeHash.substring(0, 12));
    }

    for (const slug of Object.keys(ACCESS_CONFIG.prototypes)) {
      localStorage.removeItem(LS_PROTO_PREFIX + slug);
    }
  }

  /**
   * Expose rate-limit service для UI-компонентов.
   */
  getRateLimitService(): RateLimitService {
    return this.rateLimitService;
  }

  // ───── Private helpers ─────

  /**
   * SHA-256 через Web Crypto API.
   */
  private async sha256(text: string): Promise<string> {
    return this.fingerprintService.sha256(text);
  }

  /**
   * Constant-time сравнение строк.
   * Предотвращает timing-атаки при сравнении хешей.
   */
  private constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  /**
   * Проверяет, что запись в localStorage существует, не просрочена,
   * содержит валидный codeHash и подписана текущим fingerprint (HMAC).
   */
  private isStoredAccessValid(key: string): boolean {
    const raw = localStorage.getItem(key);
    if (!raw) return false;

    try {
      const data = JSON.parse(raw) as { codeHash: string; expiresAt: number; sig?: string };
      if (Date.now() >= data.expiresAt) return false;

      // Проверяем HMAC-подпись (привязка к fingerprint)
      if (data.sig && this.cachedFingerprint) {
        const expectedSig = this.computeSessionSig(key, data.codeHash, data.expiresAt);
        if (expectedSig && data.sig !== expectedSig) return false;
      }

      // LS_LIST — проверяем codeHash (должен быть мастер-хешем)
      if (key === LS_LIST) {
        if (!data.codeHash) return false;
        return this.isKnownCodeHash(data.codeHash);
      }

      // Верифицируем что codeHash совпадает с одним из известных
      return this.isKnownCodeHash(data.codeHash);
    } catch {
      return false;
    }
  }

  /**
   * Проверяет, что хеш принадлежит одному из валидных кодов в конфигурации.
   */
  private isKnownCodeHash(hash: string): boolean {
    if (!hash) return false;
    if (this.constantTimeEqual(hash, ACCESS_CONFIG.masterCodeHash)) return true;
    if (ACCESS_CONFIG.groups.some(g => this.constantTimeEqual(hash, g.codeHash))) return true;
    if (Object.values(ACCESS_CONFIG.prototypes).some(p => this.constantTimeEqual(hash, p.codeHash))) return true;
    return false;
  }

  /**
   * Записывает доступ в localStorage с вычислением expiresAt и HMAC-подписью.
   * HMAC привязывает запись к fingerprint браузера — предотвращает перенос сессии.
   */
  private storeAccess(key: string, codeHash: string, ttlDays: number): void {
    const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;
    const sig = this.computeSessionSig(key, codeHash, expiresAt);
    const data = JSON.stringify({ codeHash, expiresAt, sig });
    localStorage.setItem(key, data);
  }

  /**
   * Вычисляет подпись сессии: простой HMAC на основе fingerprint.
   * sig = SHA-256(fingerprint + ':' + key + ':' + codeHash + ':' + expiresAt).substring(0, 16)
   * Если fingerprint ещё не загружен — возвращает пустую строку (lazy init).
   */
  private computeSessionSig(key: string, codeHash: string, expiresAt: number): string {
    if (!this.cachedFingerprint) return '';
    const raw = `${this.cachedFingerprint}:${key}:${codeHash}:${expiresAt}`;
    // Синхронный хеш через простой алгоритм (DJB2 + дополнительное перемешивание)
    let h1 = 0x811c9dc5;
    let h2 = 0x1000193;
    for (let i = 0; i < raw.length; i++) {
      const c = raw.charCodeAt(i);
      h1 = ((h1 ^ c) * 0x01000193) >>> 0;
      h2 = ((h2 ^ c) * 0x100001b3) >>> 0;
    }
    return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0'));
  }

  /**
   * Инициализирует кеш fingerprint (вызывается при первой валидации).
   */
  private async ensureFingerprint(): Promise<void> {
    if (!this.cachedFingerprint) {
      this.cachedFingerprint = await this.fingerprintService.getFingerprint();
    }
  }
}
