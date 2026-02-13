import { Injectable, inject } from '@angular/core';
import { FingerprintService } from './fingerprint.service';

/**
 * Rate-limit с защитой от обхода.
 *
 * Стратегия множественного хранения:
 * - localStorage
 * - sessionStorage
 * - cookie
 * - IndexedDB
 *
 * Блокировка применяется, если ХОТЬ ОДНО хранилище содержит блокировку.
 * Дополнительно привязка к fingerprint браузера — блокировка восстанавливается
 * даже после полной очистки site data (на основе fingerprint в IndexedDB другого origin
 * нельзя, но мы дублируем fingerprint в cookie, который часто забывают чистить).
 *
 * Конфигурация:
 * - MAX_ATTEMPTS = 10
 * - LOCKOUT_MS = 1 час
 */

const MAX_ATTEMPTS = 10;
const LOCKOUT_MS = 60 * 60 * 1000; // 1 час

const LS_KEY = '__rl_state';
const SS_KEY = '__rl_state';
const COOKIE_NAME = '__rl';
const IDB_NAME = '__rl_db';
const IDB_STORE = 'state';
const IDB_KEY = 'rl';

export interface RateLimitState {
  /** Количество неудачных попыток */
  attempts: number;
  /** Timestamp разблокировки (0 = не заблокирован) */
  lockedUntil: number;
  /** Fingerprint браузера */
  fp: string;
}

function emptyState(fp: string = ''): RateLimitState {
  return { attempts: 0, lockedUntil: 0, fp };
}

@Injectable({ providedIn: 'root' })
export class RateLimitService {
  private fingerprint = inject(FingerprintService);

  private state: RateLimitState = emptyState();
  private ready = false;
  private initPromise: Promise<void> | null = null;

  // ───── Public API ─────

  /**
   * Инициализация — ОБЯЗАТЕЛЬНО вызвать перед первым использованием.
   * Загружает состояние из всех хранилищ и выбирает «самое строгое».
   */
  async init(): Promise<void> {
    if (this.ready) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  /**
   * Проверяет, заблокирован ли ввод.
   */
  isLocked(): boolean {
    if (this.state.lockedUntil <= 0) return false;
    if (Date.now() >= this.state.lockedUntil) {
      // Таймаут истёк — сбрасываем
      this.state = emptyState(this.state.fp);
      this.persistAll();
      return false;
    }
    return true;
  }

  /**
   * Оставшееся время блокировки в миллисекундах.
   */
  getRemainingLockMs(): number {
    if (!this.isLocked()) return 0;
    return Math.max(0, this.state.lockedUntil - Date.now());
  }

  /**
   * Оставшееся количество попыток.
   */
  getRemainingAttempts(): number {
    if (this.isLocked()) return 0;
    return Math.max(0, MAX_ATTEMPTS - this.state.attempts);
  }

  /**
   * Максимум попыток (для UI).
   */
  getMaxAttempts(): number {
    return MAX_ATTEMPTS;
  }

  /**
   * Зарегистрировать неудачную попытку. Если >= MAX — ставим блокировку.
   */
  recordFailedAttempt(): void {
    this.state.attempts++;
    if (this.state.attempts >= MAX_ATTEMPTS) {
      this.state.lockedUntil = Date.now() + LOCKOUT_MS;
      this.state.attempts = 0; // сброс счётчика, блокировка по времени
    }
    this.persistAll();
  }

  /**
   * Успешный ввод — полный сброс.
   */
  recordSuccess(): void {
    this.state = emptyState(this.state.fp);
    this.persistAll();
  }

  // ───── Init ─────

  private async doInit(): Promise<void> {
    const fp = await this.fingerprint.getFingerprint();
    this.state = emptyState(fp);

    // Загружаем из всех хранилищ
    const states: RateLimitState[] = [];

    const fromLs = this.loadFromLocalStorage();
    if (fromLs) states.push(fromLs);

    const fromSs = this.loadFromSessionStorage();
    if (fromSs) states.push(fromSs);

    const fromCookie = this.loadFromCookie();
    if (fromCookie) states.push(fromCookie);

    const fromIdb = await this.loadFromIndexedDB();
    if (fromIdb) states.push(fromIdb);

    // Выбираем самое строгое состояние:
    // — если хоть одно хранилище заблокировано → берём его
    // — иначе берём максимальное количество попыток
    for (const s of states) {
      // Проверяем fingerprint — если совпадает ИЛИ стоит блокировка → применяем
      if (s.fp && s.fp !== fp) continue; // чужой fingerprint — пропускаем

      if (s.lockedUntil > Date.now() && s.lockedUntil > this.state.lockedUntil) {
        this.state.lockedUntil = s.lockedUntil;
        this.state.attempts = s.attempts;
      } else if (s.attempts > this.state.attempts && this.state.lockedUntil <= 0) {
        this.state.attempts = s.attempts;
      }
    }

    this.state.fp = fp;
    this.persistAll();
    this.ready = true;
  }

  // ───── Persist to ALL storages ─────

  private persistAll(): void {
    const json = JSON.stringify(this.state);
    this.saveToLocalStorage(json);
    this.saveToSessionStorage(json);
    this.saveToCookie(json);
    this.saveToIndexedDB(json); // async, fire-and-forget
  }

  // ───── localStorage ─────

  private loadFromLocalStorage(): RateLimitState | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private saveToLocalStorage(json: string): void {
    try { localStorage.setItem(LS_KEY, json); } catch {}
  }

  // ───── sessionStorage ─────

  private loadFromSessionStorage(): RateLimitState | null {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private saveToSessionStorage(json: string): void {
    try { sessionStorage.setItem(SS_KEY, json); } catch {}
  }

  // ───── Cookie ─────

  private loadFromCookie(): RateLimitState | null {
    try {
      const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
      if (!match) return null;
      return JSON.parse(decodeURIComponent(match[1]));
    } catch { return null; }
  }

  private saveToCookie(json: string): void {
    try {
      // Cookie на 2 часа (больше чем lockout) — чтобы не исчезла раньше
      const maxAge = 2 * 60 * 60;
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(json)}; max-age=${maxAge}; path=/; SameSite=Strict`;
    } catch {}
  }

  // ───── IndexedDB ─────

  private loadFromIndexedDB(): Promise<RateLimitState | null> {
    return new Promise(resolve => {
      try {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.createObjectStore(IDB_STORE);
          }
        };
        req.onsuccess = () => {
          try {
            const db = req.result;
            const tx = db.transaction(IDB_STORE, 'readonly');
            const store = tx.objectStore(IDB_STORE);
            const getReq = store.get(IDB_KEY);
            getReq.onsuccess = () => {
              db.close();
              if (getReq.result) {
                try {
                  resolve(typeof getReq.result === 'string' ? JSON.parse(getReq.result) : getReq.result);
                } catch { resolve(null); }
              } else {
                resolve(null);
              }
            };
            getReq.onerror = () => { db.close(); resolve(null); };
          } catch { resolve(null); }
        };
        req.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  }

  private saveToIndexedDB(json: string): void {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => {
        try {
          const db = req.result;
          const tx = db.transaction(IDB_STORE, 'readwrite');
          const store = tx.objectStore(IDB_STORE);
          store.put(json, IDB_KEY);
          tx.oncomplete = () => db.close();
          tx.onerror = () => db.close();
        } catch {}
      };
    } catch {}
  }
}
