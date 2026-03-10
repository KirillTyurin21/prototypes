import { Component, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { WizardDemoFormComponent } from '../shared/wizard-demo-form.component';
import {
  DEMO_STEPS,
  DemoStep,
  delay,
  findDemoElement,
  executeStep,
} from '../shared/demo-steps';

type DemoState = 'idle' | 'playing' | 'paused' | 'finished';

@Component({
  selector: 'app-approach-c-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, WizardDemoFormComponent],
  template: `
    <div class="relative">
      <!-- Форма -->
      <div class="p-6">
        <wizard-demo-form (demoComplete)="onDemoComplete()"></wizard-demo-form>
      </div>

      <!-- Overlay backdrop -->
      <div
        *ngIf="state === 'playing' || state === 'paused'"
        class="fixed inset-0 z-[9998] pointer-events-none"
      ></div>

      <!-- Spotlight вырез -->
      <div
        *ngIf="(state === 'playing' || state === 'paused') && spotlightStyle"
        class="fixed z-[9999] rounded-lg pointer-events-none transition-all duration-500 ease-in-out"
        [style.top.px]="spotlightStyle.top"
        [style.left.px]="spotlightStyle.left"
        [style.width.px]="spotlightStyle.width"
        [style.height.px]="spotlightStyle.height"
        [style.box-shadow]="'0 0 0 9999px rgba(0,0,0,0.45), 0 0 16px 3px rgba(25,118,210,0.25)'"
      ></div>

      <!-- Tooltip -->
      <div
        *ngIf="(state === 'playing' || state === 'paused') && tooltipText"
        class="fixed z-[10000] pointer-events-none transition-all duration-500 ease-in-out"
        [style.top.px]="tooltipY"
        [style.left.px]="tooltipX"
      >
        <div class="bg-surface rounded-lg shadow-modal border border-border px-4 py-2.5 max-w-xs">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-app-primary text-white text-[10px] font-bold">
              {{ currentStepIndex + 1 }}
            </span>
            <span class="text-xs text-text-tertiary">из {{ totalSteps }}</span>
          </div>
          <p class="text-sm text-text-primary">{{ tooltipText }}</p>
        </div>
      </div>

      <!-- Панель управления внизу -->
      <div
        *ngIf="state === 'playing' || state === 'paused'"
        class="fixed bottom-0 left-0 right-0 z-[10002] bg-surface border-t border-border
               shadow-[0_-4px_12px_rgba(0,0,0,0.1)] px-6 py-3"
      >
        <div class="flex items-center gap-4 max-w-2xl mx-auto">
          <!-- Progress bar -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-medium text-text-secondary">
                Подход C: Replay Engine
              </span>
              <span class="text-xs text-text-tertiary">
                {{ currentStepIndex + 1 }} / {{ totalSteps }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div
                class="bg-app-primary h-1.5 rounded-full transition-all duration-500"
                [style.width.%]="progressPercent"
              ></div>
            </div>
          </div>

          <!-- Кнопки управления -->
          <div class="flex items-center gap-2">
            <!-- Пауза / Продолжить -->
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors pointer-events-auto"
              [class]="state === 'paused'
                ? 'text-app-primary bg-blue-50 hover:bg-blue-100'
                : 'text-amber-600 bg-amber-50 hover:bg-amber-100'"
              (click)="togglePause()"
            >
              <lucide-icon [name]="state === 'paused' ? 'play' : 'pause'" [size]="14"></lucide-icon>
              {{ state === 'paused' ? 'Продолжить' : 'Пауза' }}
            </button>

            <!-- Стоп -->
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     text-app-danger bg-red-50 hover:bg-red-100 transition-colors pointer-events-auto"
              (click)="stopDemo()"
            >
              <lucide-icon name="square" [size]="14"></lucide-icon>
              Стоп
            </button>

            <!-- Разделитель -->
            <div class="w-px h-6 bg-border"></div>

            <!-- Скорость -->
            <div class="flex items-center gap-1 pointer-events-auto">
              <button
                *ngFor="let s of speedOptions"
                class="px-2 py-1 rounded text-xs font-medium transition-colors"
                [class]="speed === s
                  ? 'bg-app-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'"
                (click)="setSpeed(s)"
              >
                {{ s }}x
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Финальный экран «Демо завершено» -->
      <div
        *ngIf="state === 'finished'"
        class="fixed inset-0 z-[10002] flex items-center justify-center bg-black/30 animate-fade-in"
      >
        <div class="bg-surface rounded-2xl shadow-modal border border-border p-8 text-center max-w-sm animate-slide-up">
          <div class="w-14 h-14 rounded-full bg-app-success/10 flex items-center justify-center mx-auto mb-4">
            <lucide-icon name="check-circle-2" [size]="28" class="text-app-success"></lucide-icon>
          </div>
          <h3 class="text-lg font-semibold text-text-primary mb-1">Демо завершено!</h3>
          <p class="text-sm text-text-secondary mb-5">
            Replay Engine: декларативное воспроизведение с overlay, управлением скоростью и паузой.
          </p>
          <button
            class="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                   text-white bg-app-primary hover:bg-app-primary/90 transition-colors"
            (click)="goBack()"
          >
            <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
            Вернуться к выбору
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ApproachCScreenComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);

  // State machine
  state: DemoState = 'idle';
  private aborted = false;

  // Pause mechanism
  private pauseResolve: (() => void) | null = null;

  // Speed
  speed = 1;
  speedOptions = [0.5, 1, 2];

  // Spotlight
  spotlightStyle: { top: number; left: number; width: number; height: number } | null = null;

  // Tooltip
  tooltipText = '';
  tooltipX = 0;
  tooltipY = 0;

  // Progress
  currentStepIndex = 0;
  totalSteps = DEMO_STEPS.length;

  get progressPercent(): number {
    return ((this.currentStepIndex + 1) / this.totalSteps) * 100;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.startDemo(), 800);
  }

  ngOnDestroy(): void {
    this.aborted = true;
    this.resumeIfPaused();
  }

  togglePause(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.resumeIfPaused();
    }
  }

  stopDemo(): void {
    this.aborted = true;
    this.resumeIfPaused();
    this.state = 'idle';
    this.spotlightStyle = null;
    this.router.navigate(['/prototype/demo-wizard']);
  }

  onDemoComplete(): void {
    this.spotlightStyle = null;
    this.state = 'finished';
  }

  goBack(): void {
    this.router.navigate(['/prototype/demo-wizard']);
  }

  setSpeed(s: number): void {
    this.speed = s;
  }

  private async startDemo(): Promise<void> {
    this.state = 'playing';
    this.aborted = false;

    await this.speedDelay(400);

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      if (this.aborted) return;
      await this.waitIfPaused();
      if (this.aborted) return;

      const step = DEMO_STEPS[i];
      this.currentStepIndex = i;
      this.tooltipText = step.description;

      // Ждём появления элемента (для модалки — шаг 8)
      const host = await this.waitForElement(step.target, 3000);
      if (!host || this.aborted) return;

      const rect = host.getBoundingClientRect();
      const padding = 8;

      // 1. Spotlight к элементу
      this.spotlightStyle = {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      };

      // 2. Tooltip
      this.positionTooltip(rect);

      // Ждём анимацию spotlight
      await this.speedDelay(500);
      if (this.aborted) return;
      await this.waitIfPaused();
      if (this.aborted) return;

      // 3. Выполняем действие
      const charDelay = Math.round(45 / this.speed);
      await executeStep(step, charDelay);
      if (this.aborted) return;

      // 4. Пауза после шага
      await this.speedDelay(step.delayAfter);
    }

    // Демо завершено — ждём onDemoComplete от формы
  }

  /** Задержка с учётом множителя скорости */
  private speedDelay(ms: number): Promise<void> {
    return delay(Math.round(ms / this.speed));
  }

  /** Ждём снятия паузы */
  private waitIfPaused(): Promise<void> {
    if (this.state !== 'paused') return Promise.resolve();
    return new Promise<void>(resolve => {
      this.pauseResolve = resolve;
    });
  }

  /** Снимаем паузу */
  private resumeIfPaused(): void {
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
  }

  private positionTooltip(rect: DOMRect): void {
    const tooltipWidth = 260;
    const tooltipHeight = 60;
    const gap = 16;

    let y = rect.bottom + gap;
    let x = rect.left;

    if (y + tooltipHeight > window.innerHeight - 80) {
      y = rect.top - tooltipHeight - gap;
    }
    if (x + tooltipWidth > window.innerWidth - 16) {
      x = window.innerWidth - tooltipWidth - 16;
    }
    if (x < 16) {
      x = 16;
    }

    this.tooltipX = x;
    this.tooltipY = y;
  }

  private waitForElement(target: string, timeout = 3000): Promise<HTMLElement | null> {
    return new Promise(resolve => {
      const el = findDemoElement(target);
      if (el) {
        resolve(el);
        return;
      }

      const start = Date.now();
      const interval = setInterval(() => {
        const found = findDemoElement(target);
        if (found) {
          clearInterval(interval);
          resolve(found);
        } else if (Date.now() - start > timeout) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }
}
