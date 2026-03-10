import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiCardComponent, UiBadgeComponent, UiBreadcrumbsComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';

interface ApproachCard {
  id: string;
  route: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  complexity: number;
  wowEffect: number;
  tags: string[];
  recommended?: boolean;
}

@Component({
  selector: 'app-wizard-select-screen',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiBadgeComponent, UiBreadcrumbsComponent, IconsModule],
  template: `
    <div class="max-w-4xl animate-fade-in">
      <ui-breadcrumbs [items]="[{label: 'Демонстрация Wizard'}]"></ui-breadcrumbs>

      <div class="mt-4 mb-6">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
            <lucide-icon name="wand-2" [size]="24" class="text-purple-600"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-text-primary">Демонстрация Wizard</h1>
            <p class="text-sm text-text-secondary">Сравнение 4 подходов к автоматической демонстрации User Stories</p>
          </div>
        </div>
      </div>

      <!-- Описание -->
      <div class="bg-surface-secondary rounded-lg p-4 mb-6 border border-border/60">
        <div class="flex items-start gap-3">
          <lucide-icon name="info" [size]="18" class="text-app-primary mt-0.5 flex-shrink-0"></lucide-icon>
          <p class="text-sm text-text-secondary leading-relaxed">
            Каждый подход выполняет <strong class="text-text-primary">одинаковые 8 шагов</strong>
            по заполнению формы «Создание элемента», но отличается визуальной реализацией.
            Выберите подход, чтобы запустить автоматическую демонстрацию.
          </p>
        </div>
      </div>

      <!-- Сетка 2×2 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <ui-card
          *ngFor="let card of approaches"
          [hoverable]="true"
          [padding]="'none'"
          (cardClick)="launch(card.route)"
        >
          <div class="relative overflow-hidden">
            <!-- Рекомендуемый бейдж -->
            <div
              *ngIf="card.recommended"
              class="absolute top-3 right-3 z-10"
            >
              <ui-badge variant="success">Рекомендуемый</ui-badge>
            </div>

            <!-- Цветная полоска сверху -->
            <div class="h-1.5 w-full" [ngClass]="card.iconBg"></div>

            <div class="p-5">
              <!-- Иконка + заголовок -->
              <div class="flex items-start gap-4 mb-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  [ngClass]="card.iconBg"
                >
                  <lucide-icon [name]="card.icon" [size]="24" [ngClass]="card.iconColor"></lucide-icon>
                </div>
                <div class="min-w-0">
                  <h3 class="font-semibold text-text-primary text-base">{{ card.title }}</h3>
                  <p class="text-xs text-text-tertiary mt-0.5">{{ card.subtitle }}</p>
                </div>
              </div>

              <!-- Описание -->
              <p class="text-sm text-text-secondary leading-relaxed mb-4">
                {{ card.description }}
              </p>

              <!-- Метрики: сложность и WOW -->
              <div class="flex items-center gap-5 mb-4">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-text-tertiary">Сложность:</span>
                  <span class="flex gap-0.5">
                    <lucide-icon
                      *ngFor="let s of [1,2,3,4,5]"
                      name="star"
                      [size]="14"
                      [class]="s <= card.complexity ? 'text-amber-400 fill-amber-400' : 'text-gray-200'"
                    ></lucide-icon>
                  </span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-text-tertiary">WOW:</span>
                  <span class="flex gap-0.5">
                    <lucide-icon
                      *ngFor="let w of [1,2,3,4,5]"
                      name="zap"
                      [size]="14"
                      [class]="w <= card.wowEffect ? 'text-orange-400 fill-orange-400' : 'text-gray-200'"
                    ></lucide-icon>
                  </span>
                </div>
              </div>

              <!-- Теги -->
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span
                  *ngFor="let tag of card.tags"
                  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium
                         bg-surface-secondary text-text-secondary border border-border/60"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- Кнопка запуска -->
              <button
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                       bg-app-primary text-white text-sm font-medium
                       hover:bg-app-primary/90 transition-colors"
                (click)="$event.stopPropagation(); launch(card.route)"
              >
                <lucide-icon name="monitor-play" [size]="16"></lucide-icon>
                Запустить демо
              </button>
            </div>
          </div>
        </ui-card>
      </div>
    </div>
  `,
})
export class WizardSelectScreenComponent {
  private router = inject(Router);

  approaches: ApproachCard[] = [
    {
      id: 'a',
      route: 'approach-a',
      title: 'Подход A',
      subtitle: 'DOM Overlay + Курсор-призрак',
      description:
        'Полноэкранный overlay блокирует ввод. SVG-курсор анимированно двигается к каждому полю, spotlight подсвечивает элемент, tooltip описывает шаг.',
      icon: 'mouse-pointer-click',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      complexity: 5,
      wowEffect: 5,
      tags: ['Overlay', 'SVG-курсор', 'Spotlight', 'Ripple', 'Progress bar'],
    },
    {
      id: 'b',
      route: 'approach-b',
      title: 'Подход B',
      subtitle: 'Программный (Programmatic)',
      description:
        'Без overlay — поля заполняются «сами». Typewriter-эффект при вводе текста, лёгкое свечение на активном элементе, панель прогресса в углу.',
      icon: 'terminal',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      complexity: 2,
      wowEffect: 2,
      tags: ['Без overlay', 'Typewriter', 'Ring-glow', 'Минимализм'],
    },
    {
      id: 'c',
      route: 'approach-c',
      title: 'Подход C',
      subtitle: 'Replay Engine (Декларативный)',
      description:
        'Overlay со spotlight, tooltip с описанием и номером шага. Панель управления: пауза, стоп, скорость воспроизведения. Без курсора.',
      icon: 'workflow',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      complexity: 3,
      wowEffect: 4,
      tags: ['Overlay', 'Spotlight', 'Пауза/Стоп', 'Скорость', 'Tooltip'],
      recommended: true,
    },
    {
      id: 'd',
      route: 'approach-d',
      title: 'Подход D',
      subtitle: 'Guided Tour (стиль Driver.js)',
      description:
        'Тёмный overlay в стиле driver.js с вырезом. Popover-карточка с заголовком, описанием и стрелкой. Автоматическое продвижение без кнопки Next.',
      icon: 'lightbulb',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      complexity: 3,
      wowEffect: 3,
      tags: ['Стиль Driver.js', 'Popover', 'Стрелки', 'Clip-path', 'Авто-шаги'],
    },
  ];

  launch(route: string): void {
    this.router.navigate(['/prototype/demo-wizard', route]);
  }
}
