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

type DemoState = 'idle' | 'playing' | 'finished';

/** Позиция popover относительно элемента */
type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'app-approach-d-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, WizardDemoFormComponent],
  template: `
    <div class="relative">
      <!-- Форма -->
      <div class="p-6">
        <wizard-demo-form (demoComplete)="onDemoComplete()"></wizard-demo-form>
      </div>

      <!-- Тёмный overlay с вырезом (стиль driver.js) -->
      <div
        *ngIf="state === 'playing'"
        class="fixed inset-0 z-[9998] pointer-events-none transition-all duration-[400ms] ease-in-out"
        [style.box-shadow]="overlayShadow"
      ></div>

      <!-- Highlight border вокруг элемента (стиль driver.js — белая обводка) -->
      <div
        *ngIf="state === 'playing' && spotlightStyle"
        class="fixed z-[9999] rounded-md pointer-events-none transition-all duration-[400ms] ease-in-out
               border-2 border-white"
        [style.top.px]="spotlightStyle.top"
        [style.left.px]="spotlightStyle.left"
        [style.width.px]="spotlightStyle.width"
        [style.height.px]="spotlightStyle.height"
      ></div>

      <!-- Popover-карточка (стиль driver.js) -->
      <div
        *ngIf="state === 'playing' && popoverVisible"
        class="fixed z-[10001] pointer-events-none transition-all duration-[400ms] ease-in-out"
        [style.top.px]="popoverY"
        [style.left.px]="popoverX"
      >
        <!-- Стрелка (CSS triangle) -->
        <div
          class="absolute w-3 h-3 bg-white border-border rotate-45"
          [ngClass]="{
            '-top-1.5 left-6 border-l border-t': popoverPlacement === 'bottom',
            '-bottom-1.5 left-6 border-r border-b': popoverPlacement === 'top',
            '-left-1.5 top-4 border-l border-b': popoverPlacement === 'right',
            '-right-1.5 top-4 border-r border-t': popoverPlacement === 'left'
          }"
        ></div>

        <!-- Карточка -->
        <div class="bg-white rounded-lg shadow-modal border border-border w-[300px] overflow-hidden">
          <!-- Заголовок -->
          <div class="px-4 pt-3.5 pb-2">
            <h4 class="text-sm font-semibold text-text-primary leading-snug">{{ popoverTitle }}</h4>
          </div>
          <!-- Описание -->
          <div class="px-4 pb-3">
            <p class="text-[13px] text-text-secondary leading-relaxed">{{ popoverDescription }}</p>
          </div>
          <!-- Футер с прогресс-точками -->
          <div class="px-4 py-2.5 bg-gray-50 border-t border-border flex items-center justify-between">
            <!-- Прогресс-точки -->
            <div class="flex items-center gap-1">
              <span
                *ngFor="let step of DEMO_STEPS; let i = index"
                class="w-[7px] h-[7px] rounded-full transition-colors duration-300"
                [ngClass]="i <= currentStepIndex ? 'bg-app-primary' : 'bg-gray-300'"
              ></span>
            </div>
            <!-- Счётчик -->
            <span class="text-[11px] text-text-tertiary font-medium">
              {{ currentStepIndex + 1 }} из {{ totalSteps }}
            </span>
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
            Guided Tour: overlay с popover-карточками в стиле Driver.js,
            прогресс-точки и стрелка к элементу.
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
export class ApproachDScreenComponent implements AfterViewInit, OnDestroy {
  private router = inject(Router);

  readonly DEMO_STEPS = DEMO_STEPS;

  state: DemoState = 'idle';
  private aborted = false;

  // Spotlight (вырез в overlay)
  spotlightStyle: { top: number; left: number; width: number; height: number } | null = null;

  // Overlay shadow (динамически, чтобы «вырез» плавно двигался)
  overlayShadow = '0 0 0 0 rgba(0,0,0,0)';

  // Popover
  popoverVisible = false;
  popoverX = 0;
  popoverY = 0;
  popoverTitle = '';
  popoverDescription = '';
  popoverPlacement: PopoverPlacement = 'bottom';

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

  onDemoComplete(): void {
    this.spotlightStyle = null;
    this.popoverVisible = false;
    this.overlayShadow = '0 0 0 0 rgba(0,0,0,0)';
    this.state = 'finished';
  }

  goBack(): void {
    this.router.navigate(['/prototype/demo-wizard']);
  }

  private async startDemo(): Promise<void> {
    this.state = 'playing';
    this.aborted = false;

    await delay(300);

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      if (this.aborted) return;

      const step = DEMO_STEPS[i];
      this.currentStepIndex = i;

      // Popover content
      this.popoverTitle = this.getStepTitle(step);
      this.popoverDescription = step.description;

      // Ждём появления элемента (для модалки — шаг 8)
      const host = await this.waitForElement(step.target, 3000);
      if (!host || this.aborted) return;

      const rect = host.getBoundingClientRect();
      const padding = 6;

      // 1. Spotlight вырез — через box-shadow на overlay
      const sTop = rect.top - padding;
      const sLeft = rect.left - padding;
      const sWidth = rect.width + padding * 2;
      const sHeight = rect.height + padding * 2;

      this.spotlightStyle = { top: sTop, left: sLeft, width: sWidth, height: sHeight };
      this.overlayShadow = this.buildOverlayShadow(sTop, sLeft, sWidth, sHeight);

      // 2. Позиционируем popover
      this.positionPopover(rect);
      this.popoverVisible = true;

      // Ждём анимацию перехода spotlight + popover
      await delay(500);
      if (this.aborted) return;

      // 3. Выполняем действие
      await executeStep(step, 45);
      if (this.aborted) return;

      // 4. Пауза после шага
      await delay(step.delayAfter);
    }

    // Демо завершено — ждём onDemoComplete от формы
  }

  /** Генерирует box-shadow с вырезом для overlay */
  private buildOverlayShadow(
    top: number, left: number, width: number, height: number
  ): string {
    // Имитация Driver.js: фиксированный div за пределами viewport
    // не используем clip-path — вместо этого spotlight div с box-shadow
    // Overlay сам затемняет через общий box-shadow
    return `0 0 0 9999px rgba(0, 0, 0, 0.55)`;
  }

  /** Позиционирование popover рядом с элементом */
  private positionPopover(rect: DOMRect): void {
    const popoverWidth = 300;
    const popoverHeight = 130;
    const gap = 14;

    // Пробуем разместить снизу (приоритет)
    let placement: PopoverPlacement = 'bottom';
    let x = rect.left;
    let y = rect.bottom + gap;

    // Если не влезает снизу — сверху
    if (y + popoverHeight > window.innerHeight - 20) {
      placement = 'top';
      y = rect.top - popoverHeight - gap;
    }

    // Если не влезает сверху — справа
    if (y < 20) {
      placement = 'right';
      x = rect.right + gap;
      y = rect.top;
    }

    // Если не влезает справа — слева
    if (placement === 'right' && x + popoverWidth > window.innerWidth - 20) {
      placement = 'left';
      x = rect.left - popoverWidth - gap;
      y = rect.top;
    }

    // Ограничения по горизонтали для top/bottom placement
    if (placement === 'top' || placement === 'bottom') {
      if (x + popoverWidth > window.innerWidth - 16) {
        x = window.innerWidth - popoverWidth - 16;
      }
      if (x < 16) {
        x = 16;
      }
    }

    // Ограничения по вертикали для left/right placement
    if (placement === 'left' || placement === 'right') {
      if (y + popoverHeight > window.innerHeight - 20) {
        y = window.innerHeight - popoverHeight - 20;
      }
      if (y < 20) {
        y = 20;
      }
    }

    this.popoverX = x;
    this.popoverY = y;
    this.popoverPlacement = placement;
  }

  /** Заголовок шага для popover */
  private getStepTitle(step: DemoStep): string {
    const titles: Record<string, string> = {
      'input-name': 'Наименование блюда',
      'select-category': 'Категория',
      'textarea-desc': 'Описание блюда',
      'input-price': 'Цена',
      'toggle-active': 'Статус «Активен»',
      'checkbox-publish': 'Публикация',
      'btn-save': 'Сохранение',
      'btn-modal-home': 'Завершение',
    };
    return titles[step.target] || `Шаг ${step.id}`;
  }

  /** Ожидание появления элемента в DOM */
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
