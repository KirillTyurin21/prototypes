import { Component, OnDestroy, AfterViewInit, inject, NgZone } from '@angular/core';
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

@Component({
  selector: 'app-approach-a-screen',
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
        *ngIf="isRunning"
        class="fixed inset-0 z-[9998] pointer-events-none"
      ></div>

      <!-- Spotlight вырез -->
      <div
        *ngIf="isRunning && spotlightStyle"
        class="fixed z-[9999] rounded-lg pointer-events-none transition-all duration-500 ease-in-out"
        [style.top.px]="spotlightStyle.top"
        [style.left.px]="spotlightStyle.left"
        [style.width.px]="spotlightStyle.width"
        [style.height.px]="spotlightStyle.height"
        [style.box-shadow]="'0 0 0 9999px rgba(0,0,0,0.5), 0 0 20px 4px rgba(25,118,210,0.3)'"
      ></div>

      <!-- SVG Курсор-призрак -->
      <div
        *ngIf="isRunning"
        class="fixed z-[10001] pointer-events-none transition-all ease-in-out"
        [style.top.px]="cursorY"
        [style.left.px]="cursorX"
        [style.transition-duration.ms]="cursorTransitionMs"
      >
        <!-- Ripple при клике -->
        <div
          *ngIf="showRipple"
          class="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-app-primary/30 animate-ping"
        ></div>
        <!-- SVG курсор -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5 3L19 12L12 13L9 20L5 3Z"
            fill="white"
            stroke="#1976D2"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Tooltip -->
      <div
        *ngIf="isRunning && tooltipText"
        class="fixed z-[10000] pointer-events-none transition-all duration-500 ease-in-out"
        [style.top.px]="tooltipY"
        [style.left.px]="tooltipX"
      >
        <div class="bg-surface rounded-lg shadow-modal border border-border px-4 py-2.5 max-w-xs">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-medium text-app-primary">Шаг {{ currentStepIndex + 1 }} из {{ totalSteps }}</span>
          </div>
          <p class="text-sm text-text-primary">{{ tooltipText }}</p>
        </div>
      </div>

      <!-- Progress bar внизу -->
      <div
        *ngIf="isRunning"
        class="fixed bottom-0 left-0 right-0 z-[10002] bg-surface border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.1)] px-6 py-3"
      >
        <div class="flex items-center gap-4 max-w-2xl mx-auto">
          <!-- Progress -->
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-medium text-text-secondary">
                Подход A: DOM Overlay + Курсор-призрак
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
          <!-- Кнопка прервать -->
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                   text-app-danger bg-red-50 hover:bg-red-100 transition-colors pointer-events-auto"
            (click)="stopDemo()"
          >
            <lucide-icon name="x" [size]="14"></lucide-icon>
            Прервать
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ApproachAScreenComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private ngZone = inject(NgZone);

  isRunning = false;
  private aborted = false;

  // Spotlight
  spotlightStyle: { top: number; left: number; width: number; height: number } | null = null;

  // Cursor
  cursorX = 0;
  cursorY = 0;
  cursorTransitionMs = 600;
  showRipple = false;

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
  }

  stopDemo(): void {
    this.aborted = true;
    this.isRunning = false;
    this.router.navigate(['/prototype/demo-wizard']);
  }

  onDemoComplete(): void {
    this.isRunning = false;
    this.router.navigate(['/prototype/demo-wizard']);
  }

  private async startDemo(): Promise<void> {
    this.isRunning = true;
    this.aborted = false;

    // Стартовая позиция курсора — центр экрана
    this.cursorX = window.innerWidth / 2;
    this.cursorY = window.innerHeight / 2;

    await delay(400);

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      if (this.aborted) return;

      const step = DEMO_STEPS[i];
      this.currentStepIndex = i;
      this.tooltipText = step.description;

      // Ждём появления элемента (особенно для модалки — шаг 8)
      const host = await this.waitForElement(step.target, 3000);
      if (!host || this.aborted) return;

      const rect = host.getBoundingClientRect();
      const padding = 8;

      // 1. Двигаем spotlight к элементу
      this.spotlightStyle = {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      };

      // 2. Двигаем курсор к центру элемента
      this.cursorTransitionMs = 600;
      this.cursorX = rect.left + rect.width / 2;
      this.cursorY = rect.top + rect.height / 2 + 8;

      // 3. Позиционируем tooltip
      this.positionTooltip(rect);

      // Ждём анимацию перемещения курсора
      await delay(700);
      if (this.aborted) return;

      // 4. Ripple-эффект при "клике"
      this.showRipple = true;
      await delay(300);
      this.showRipple = false;

      if (this.aborted) return;

      // 5. Выполняем действие
      await executeStep(step, 40);

      if (this.aborted) return;

      // 6. Ждём после шага
      await delay(step.delayAfter);
    }

    // Демо завершено — isRunning сбросится через onDemoComplete
  }

  private positionTooltip(rect: DOMRect): void {
    const tooltipWidth = 280;
    const tooltipHeight = 60;
    const gap = 16;

    // Пробуем снизу
    let y = rect.bottom + gap;
    let x = rect.left;

    // Если не влезает снизу — ставим сверху
    if (y + tooltipHeight > window.innerHeight - 80) {
      y = rect.top - tooltipHeight - gap;
    }

    // Не выходим за правый край
    if (x + tooltipWidth > window.innerWidth - 16) {
      x = window.innerWidth - tooltipWidth - 16;
    }

    // Не выходим за левый край
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
