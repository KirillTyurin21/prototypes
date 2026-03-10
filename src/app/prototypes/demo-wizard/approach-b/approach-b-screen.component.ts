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

@Component({
  selector: 'app-approach-b-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, WizardDemoFormComponent],
  template: `
    <div class="relative">
      <!-- Форма -->
      <div class="p-6">
        <wizard-demo-form (demoComplete)="onDemoComplete()"></wizard-demo-form>
      </div>

      <!-- Панель прогресса — правый верхний угол -->
      <div
        *ngIf="isRunning"
        class="fixed top-4 right-4 z-30 w-72 bg-surface rounded-xl shadow-modal border border-border
               animate-fade-in overflow-hidden"
      >
        <!-- Цветная полоска сверху -->
        <div class="h-1 bg-gray-100">
          <div
            class="h-full bg-app-primary transition-all duration-500 ease-out"
            [style.width.%]="progressPercent"
          ></div>
        </div>

        <div class="p-3.5">
          <!-- Заголовок -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-app-primary/10 flex items-center justify-center">
                <lucide-icon name="terminal" [size]="13" class="text-app-primary"></lucide-icon>
              </div>
              <span class="text-xs font-semibold text-text-primary tracking-wide uppercase">
                Подход B
              </span>
            </div>
            <span class="text-xs text-text-tertiary font-medium">
              {{ currentStepIndex + 1 }}/{{ totalSteps }}
            </span>
          </div>

          <!-- Описание текущего шага -->
          <p class="text-sm text-text-secondary leading-snug mb-3 min-h-[2.5rem]">
            {{ currentDescription }}
          </p>

          <!-- Шаговые точки -->
          <div class="flex items-center gap-1 mb-3">
            <div
              *ngFor="let step of steps; let idx = index"
              class="h-1.5 flex-1 rounded-full transition-all duration-300"
              [class.bg-app-primary]="idx <= currentStepIndex"
              [class.bg-gray-200]="idx > currentStepIndex"
            ></div>
          </div>

          <!-- Кнопка прервать -->
          <button
            class="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   text-app-danger bg-red-50 hover:bg-red-100 transition-colors"
            (click)="stopDemo()"
          >
            <lucide-icon name="x" [size]="13"></lucide-icon>
            Прервать демо
          </button>
        </div>
      </div>

      <!-- Финальный оверлей «Демо завершено» -->
      <div
        *ngIf="demoFinished"
        class="fixed inset-0 z-30 flex items-center justify-center bg-black/30 animate-fade-in"
      >
        <div class="bg-surface rounded-2xl shadow-modal border border-border p-8 text-center max-w-sm animate-slide-up">
          <div class="w-14 h-14 rounded-full bg-app-success/10 flex items-center justify-center mx-auto mb-4">
            <lucide-icon name="check-circle-2" [size]="28" class="text-app-success"></lucide-icon>
          </div>
          <h3 class="text-lg font-semibold text-text-primary mb-1">Демо завершено!</h3>
          <p class="text-sm text-text-secondary mb-5">
            Программный подход: форма заполнена автоматически без визуальных эффектов.
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
export class ApproachBScreenComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);

  isRunning = false;
  demoFinished = false;
  private aborted = false;

  // Progress
  steps = DEMO_STEPS;
  currentStepIndex = 0;
  totalSteps = DEMO_STEPS.length;
  currentDescription = '';

  // Текущий подсвеченный элемент
  private highlightedEl: HTMLElement | null = null;

  get progressPercent(): number {
    return ((this.currentStepIndex + 1) / this.totalSteps) * 100;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.startDemo(), 800);
  }

  ngOnDestroy(): void {
    this.aborted = true;
    this.removeHighlight();
  }

  stopDemo(): void {
    this.aborted = true;
    this.isRunning = false;
    this.removeHighlight();
    this.router.navigate(['/prototype/demo-wizard']);
  }

  onDemoComplete(): void {
    this.isRunning = false;
    this.removeHighlight();
    this.demoFinished = true;
  }

  goBack(): void {
    this.router.navigate(['/prototype/demo-wizard']);
  }

  private async startDemo(): Promise<void> {
    this.isRunning = true;
    this.aborted = false;

    await delay(400);

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      if (this.aborted) return;

      const step = DEMO_STEPS[i];
      this.currentStepIndex = i;
      this.currentDescription = step.description;

      // Ждём появления элемента (особенно для модалки — шаг 8)
      const host = await this.waitForElement(step.target, 3000);
      if (!host || this.aborted) return;

      // 1. Scroll к элементу
      host.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await delay(300);
      if (this.aborted) return;

      // 2. Подсветка ring-glow
      this.highlight(host);
      await delay(400);
      if (this.aborted) return;

      // 3. Выполнение действия
      await executeStep(step, 45);
      if (this.aborted) return;

      // 4. Небольшая пауза чтобы увидеть результат
      await delay(step.delayAfter);
      if (this.aborted) return;

      // 5. Убираем подсветку
      this.removeHighlight();
    }

    // Демо завершено — ждём onDemoComplete от формы (шаг 8 нажимает кнопку модалки)
  }

  private highlight(el: HTMLElement): void {
    this.removeHighlight();
    el.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
    el.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.35), 0 0 12px 2px rgba(25, 118, 210, 0.15)';
    el.style.borderRadius = '8px';
    el.style.transform = 'scale(1.01)';
    this.highlightedEl = el;
  }

  private removeHighlight(): void {
    if (this.highlightedEl) {
      this.highlightedEl.style.boxShadow = '';
      this.highlightedEl.style.transform = '';
      this.highlightedEl.style.transition = '';
      this.highlightedEl.style.borderRadius = '';
      this.highlightedEl = null;
    }
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
