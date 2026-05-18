import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';

interface ScreenTile {
  name: string;
  id: number;
}

@Component({
  selector: 'app-arrivals-multiscreen-screen',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="multiscreen-page">

      <!-- ─── Кнопка назад к Web (для навигации в прототипе) ─── -->
      <button class="back-btn" (click)="goBack()">
        <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
        Назад к Web
      </button>

      <!-- ─── Кнопка перезагрузки (повторный показ плашки) ─── -->
      <button class="reload-btn" (click)="reloadBanner()">
        <lucide-icon name="refresh-cw" [size]="16"></lucide-icon>
        Показать плашку
      </button>

      <!-- ─── Toast ─── -->
      <div *ngIf="toastMessage" class="toast">
        <lucide-icon name="check-circle-2" [size]="16"></lucide-icon>
        {{ toastMessage }}
      </div>

      <!-- ─── Green Info Banner (временная плашка) ─── -->
      <div
        class="info-banner"
        *ngIf="showBanner"
        [class.fade-out]="bannerFading"
      >
        <div class="info-banner-content">
          <lucide-icon name="info" [size]="18" class="info-icon"></lucide-icon>
          <span class="info-text">
            Разрешение экрана данного устройства: {{ screenWidth }} × {{ screenHeight }}
          </span>
        </div>
        <button class="info-close" (click)="closeBanner()">×</button>
      </div>

      <!-- ─── Legacy-индикатор разрешения (чёрный прямоугольник) ─── -->
      <div
        class="legacy-resolution"
        *ngIf="showBanner"
        [class.fade-out]="bannerFading"
      >
        {{ screenWidth }} × {{ screenHeight }}
      </div>

      <!-- ─── Центральный контент ─── -->
      <div class="center-content">
        <!-- Заголовок: Разрешение -->
        <h1 class="resolution-title">Разрешение экрана данного устройства</h1>
        <p class="resolution-value">{{ screenWidth }} × {{ screenHeight }}</p>

        <!-- Подпись: Выберите экран -->
        <p class="select-label">Выберите экран для подключения:</p>

        <!-- Плитки экранов -->
        <div class="tiles-row">
          <div
            *ngFor="let tile of tiles"
            class="screen-tile"
            (click)="selectScreen(tile)"
          >
            <span class="tile-name">{{ tile.name }}</span>
            <span class="tile-id">{{ tile.id }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: -20px -24px;
    }

    .multiscreen-page {
      position: relative;
      min-height: calc(100vh - 64px - 48px);
      background: var(--dt-surface-primary);
      font-family: Arial, Helvetica, sans-serif;
    }

    /* ─── Кнопка назад ─── */
    .back-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      color: var(--dt-text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .back-btn:hover {
      background: rgba(0, 0, 0, 0.12);
      color: var(--dt-text-primary);
    }

    /* ─── Кнопка перезагрузки ─── */
    .reload-btn {
      position: absolute;
      top: 12px;
      right: 140px;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      color: var(--dt-text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .reload-btn:hover {
      background: rgba(0, 0, 0, 0.12);
      color: var(--dt-text-primary);
    }

    /* ─── Toast ─── */
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 200;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 6px;
      background: var(--dt-surface-snack-tooltip);
      color: var(--dt-text-inversive);
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: toastIn 0.3s ease-out;
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ─── Green Info Banner ─── */
    .info-banner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 20px;
      background-color: #A8D5A2;
      color: #1b3a1a;
      font-size: 15px;
      z-index: 40;
      animation: slideDown 0.3s ease-out;
      transition: opacity 0.5s ease;
    }
    .info-banner.fade-out {
      opacity: 0;
    }
    .info-banner-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .info-icon {
      flex-shrink: 0;
    }
    .info-text {
      font-weight: 500;
    }
    .info-close {
      border: none;
      background: none;
      color: #1b3a1a;
      font-size: 22px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .info-close:hover {
      opacity: 1;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-100%); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ─── Legacy resolution indicator ─── */
    .legacy-resolution {
      position: absolute;
      top: 60px;
      left: 12px;
      z-index: 30;
      padding: 4px 10px;
      background: rgba(0, 0, 0, 0.8);
      color: var(--dt-text-inversive);
      font-size: 13px;
      font-family: monospace;
      border-radius: 4px;
      transition: opacity 0.5s ease;
    }
    .legacy-resolution.fade-out {
      opacity: 0;
    }

    /* ─── Центральный контент ─── */
    .center-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px 40px;
    }

    .resolution-title {
      font-size: 26px;
      font-weight: 700;
      color: var(--dt-text-primary);
      margin: 0 0 8px;
      text-align: center;
    }
    .resolution-value {
      font-size: 20px;
      color: var(--dt-text-secondary);
      margin: 0 0 40px;
      text-align: center;
    }
    .select-label {
      font-size: 17px;
      color: var(--dt-text-primary);
      margin: 0 0 24px;
      text-align: center;
    }

    /* ─── Плитки экранов ─── */
    .tiles-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 18px;
    }
    .screen-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 150px;
      height: 96px;
      background: var(--dt-surface-press);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .screen-tile:hover {
      background: var(--dt-stroke-hover);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .screen-tile:active {
      background: #B0B0B0;
    }
    .tile-name {
      font-size: 17px;
      font-weight: 600;
      color: var(--dt-text-primary);
      line-height: 1.3;
    }
    .tile-id {
      font-size: 15px;
      color: var(--dt-text-primary);
      line-height: 1.3;
    }
  `],
})
export class ArrivalsMultiscreenScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  screenWidth = 0;
  screenHeight = 0;

  showBanner = true;
  bannerFading = false;

  toastMessage = '';
  private toastTimer: any;
  private bannerTimer: any;
  private fadeTimer: any;

  tiles: ScreenTile[] = [
    { name: 'display', id: 7246 },
    { name: 'Новый экран', id: 1876 },
    { name: 'Новый экран', id: 6768 },
    { name: 'Новый экран', id: 5622 },
  ];

  ngOnInit(): void {
    this.updateResolution();
    this.startBannerTimer();
  }

  ngOnDestroy(): void {
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    if (this.fadeTimer) clearTimeout(this.fadeTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  goBack(): void {
    this.router.navigate(['/prototype/web-screens/cs-terminals']);
  }

  selectScreen(tile: ScreenTile): void {
    this.showToast(`Экран «${tile.name} ${tile.id}» выбран`);
  }

  closeBanner(): void {
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    this.bannerFading = true;
    this.fadeTimer = setTimeout(() => {
      this.showBanner = false;
      this.bannerFading = false;
    }, 300);
  }

  reloadBanner(): void {
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    if (this.fadeTimer) clearTimeout(this.fadeTimer);
    this.bannerFading = false;
    this.showBanner = false;

    this.updateResolution();

    setTimeout(() => {
      this.showBanner = true;
      this.startBannerTimer();
    }, 50);
  }

  private updateResolution(): void {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  private startBannerTimer(): void {
    this.bannerTimer = setTimeout(() => {
      this.bannerFading = true;
      this.fadeTimer = setTimeout(() => {
        this.showBanner = false;
        this.bannerFading = false;
      }, 500);
    }, 5000);
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
