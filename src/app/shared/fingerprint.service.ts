import { Injectable } from '@angular/core';

/**
 * Генерирует стабильный fingerprint браузера на основе доступных характеристик.
 * Fingerprint одинаковый даже в режиме инкогнито (Canvas, WebGL, экран, tz, языки, UA).
 */
@Injectable({ providedIn: 'root' })
export class FingerprintService {

  private cachedFingerprint: string | null = null;

  /**
   * Возвращает стабильный хеш fingerprint-а (hex SHA-256).
   */
  async getFingerprint(): Promise<string> {
    if (this.cachedFingerprint) return this.cachedFingerprint;

    const components: string[] = [];

    // 1. User-Agent
    components.push(navigator.userAgent || '');

    // 2. Языки
    components.push((navigator.languages || [navigator.language || '']).join(','));

    // 3. Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    components.push(String(new Date().getTimezoneOffset()));

    // 4. Экран
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    components.push(`${screen.availWidth}x${screen.availHeight}`);
    components.push(String(window.devicePixelRatio || 1));

    // 5. Platform
    components.push((navigator as any).platform || '');

    // 6. Hardware concurrency
    components.push(String(navigator.hardwareConcurrency || 0));

    // 7. Canvas fingerprint
    components.push(this.getCanvasFingerprint());

    // 8. WebGL fingerprint
    components.push(this.getWebGLFingerprint());

    // 9. Audio context
    components.push(String(typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'));

    // 10. Touch support
    components.push(String(navigator.maxTouchPoints || 0));

    // 11. Session storage & IndexedDB support
    components.push(String(typeof sessionStorage !== 'undefined'));
    components.push(String(typeof indexedDB !== 'undefined'));

    const raw = components.join('|');
    this.cachedFingerprint = await this.sha256(raw);
    return this.cachedFingerprint;
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';

      // Рисуем текст с разными параметрами — уникально для каждого браузера
      ctx.textBaseline = 'alphabetic';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Fingerprint!', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Fingerprint!', 4, 17);

      return canvas.toDataURL();
    } catch {
      return 'canvas-error';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';

      const g = gl as WebGLRenderingContext;
      const debugInfo = g.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = g.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = g.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return `${vendor}~${renderer}`;
      }
      return g.getParameter(g.VENDOR) + '~' + g.getParameter(g.RENDERER);
    } catch {
      return 'webgl-error';
    }
  }

  /**
   * SHA-256 через Web Crypto API (работает без зависимостей).
   */
  async sha256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
