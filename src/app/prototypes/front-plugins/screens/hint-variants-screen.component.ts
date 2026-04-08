import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { UiBreadcrumbsComponent, UiBadgeComponent } from '@/components/ui';
import { HintCardDialogComponent } from '../components/hint-card-dialog.component';
import { HintPosDialogComponent } from '../components/hint-pos-dialog.component';
import { HintData } from '../data/hint-types';
import { HINT_VARIANT_A, HINT_VARIANT_B, HINT_VARIANT_C } from '../data/hint-mock-data';

type DesignType = 'card-add-first' | 'card-vertical' | 'pos';
type DataVariant = 'A' | 'B' | 'C';

/**
 * Экран сравнения вариантов дизайна окна подсказки.
 * Два варианта расположения кнопок основного окна + компактный POS.
 */
@Component({
  selector: 'app-hint-variants-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    UiBreadcrumbsComponent,
    UiBadgeComponent,
    HintCardDialogComponent,
    HintPosDialogComponent,
  ],
  template: `
    <div class="p-6 max-w-5xl mx-auto animate-fade-in">
      <!-- Breadcrumbs -->
      <ui-breadcrumbs [items]="breadcrumbs" class="mb-6"></ui-breadcrumbs>

      <!-- Заголовок -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-text-primary mb-2">Сравнение вариантов дизайна</h1>
        <p class="text-text-secondary text-sm">
          Нажмите на карточку, чтобы открыть модальное окно подсказки в выбранном дизайне.
          Переключайте данные (A/B/C) для проверки разных сценариев.
        </p>
      </div>

      <!-- Переключатель данных -->
      <div class="bg-surface-secondary rounded-lg p-4 mb-6 border border-border/60">
        <div class="flex items-center gap-3 mb-3">
          <lucide-icon name="bar-chart-3" [size]="16" class="text-text-secondary"></lucide-icon>
          <span class="text-sm font-medium text-text-primary">Набор демо-данных:</span>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button *ngFor="let v of dataVariants"
                  (click)="selectData(v.key)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                  [ngClass]="{
                    'bg-app-primary text-white border-app-primary': selectedData === v.key,
                    'bg-surface text-text-secondary border-border hover:border-app-primary': selectedData !== v.key
                  }">
            <span class="font-bold">{{ v.key }}</span> — {{ v.label }}
          </button>
        </div>
        <p class="text-xs text-text-disabled mt-2">{{ currentDataDescription }}</p>
      </div>

      <!-- 3 варианта дизайна -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        <!-- Вариант 1: Кнопки горизонтально, Добавить слева -->
        <div (click)="openDesign('card-add-first')"
             class="group bg-surface rounded-xl border border-border hover:border-app-primary/40
                    hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden">
          <div class="h-1.5 bg-[#2d2d2d]"></div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <lucide-icon name="list" [size]="16" class="text-[#c9a84c]"></lucide-icon>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                  Вариант 1: Кнопки в ряд
                </h3>
              </div>
            </div>
            <!-- Мини-превью -->
            <div class="bg-[#2d2d2d] rounded-lg p-3 mb-3">
              <div class="flex gap-2">
                <div class="w-10 h-10 bg-[#3a3a3a] border border-white/10 flex items-center justify-center text-xs"
                     style="border-radius: 0;">🍎</div>
                <div class="flex-1">
                  <div class="h-2 w-20 bg-white/20 mb-1" style="border-radius: 0;"></div>
                  <div class="h-1.5 w-16 bg-white/10 mb-1" style="border-radius: 0;"></div>
                  <div class="h-2 w-12 bg-[#c9a84c]/40" style="border-radius: 0;"></div>
                </div>
              </div>
              <div class="flex gap-0 mt-2 border-t border-white/10 pt-1">
                <div class="flex-1 h-5 bg-[#c9a84c]/20 border-r border-white/10" style="border-radius: 0;"></div>
                <div class="flex-1 h-5 bg-white/10" style="border-radius: 0;"></div>
              </div>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">
              Добавить слева, Отказаться справа. Горизонтальное расположение кнопок.
            </p>
            <div class="flex flex-wrap gap-1 mt-2">
              <ui-badge variant="success">Основной</ui-badge>
              <ui-badge variant="default">Горизонтальный</ui-badge>
            </div>
          </div>
        </div>

        <!-- Вариант 2: Кнопки вертикально -->
        <div (click)="openDesign('card-vertical')"
             class="group bg-surface rounded-xl border border-border hover:border-app-primary/40
                    hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden">
          <div class="h-1.5 bg-[#2d2d2d]"></div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <lucide-icon name="list" [size]="16" class="text-[#c9a84c]"></lucide-icon>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                  Вариант 2: Кнопки столбцом
                </h3>
              </div>
            </div>
            <!-- Мини-превью -->
            <div class="bg-[#2d2d2d] rounded-lg p-3 mb-3">
              <div class="flex gap-2">
                <div class="w-10 h-10 bg-[#3a3a3a] border border-white/10 flex items-center justify-center text-xs"
                     style="border-radius: 0;">🍎</div>
                <div class="flex-1">
                  <div class="h-2 w-20 bg-white/20 mb-1" style="border-radius: 0;"></div>
                  <div class="h-1.5 w-16 bg-white/10 mb-1" style="border-radius: 0;"></div>
                  <div class="h-2 w-12 bg-[#c9a84c]/40" style="border-radius: 0;"></div>
                </div>
              </div>
              <div class="mt-2 border-t border-white/10 pt-1 space-y-0">
                <div class="h-5 bg-[#c9a84c]/20 border-b border-white/10" style="border-radius: 0;"></div>
                <div class="h-5 bg-white/10" style="border-radius: 0;"></div>
              </div>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">
              Добавить сверху, Отказаться снизу. Вертикальное расположение кнопок.
            </p>
            <div class="flex flex-wrap gap-1 mt-2">
              <ui-badge variant="warning">Альтернативный</ui-badge>
              <ui-badge variant="default">Вертикальный</ui-badge>
            </div>
          </div>
        </div>

        <!-- Дизайн 3: POS -->
        <div (click)="openDesign('pos')"
             class="group bg-surface rounded-xl border border-border hover:border-app-primary/40
                    hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden">
          <div class="h-1.5 bg-[#3a3a3a]"></div>
          <div class="p-5">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-[#2d2d2d] flex items-center justify-center">
                <lucide-icon name="monitor" [size]="16" class="text-[#c9a84c]"></lucide-icon>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-text-primary group-hover:text-app-primary transition-colors">
                  Вариант 3: «Компактный POS»
                </h3>
              </div>
            </div>
            <!-- Мини-превью -->
            <div class="bg-[#3a3a3a] rounded-lg p-3 mb-3">
              <div class="flex items-center gap-1 mb-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#c9a84c]"></div>
                <div class="h-1.5 w-14 bg-white/30 rounded"></div>
              </div>
              <div class="h-1.5 w-24 bg-[#c9a84c]/30 rounded mb-2"></div>
              <div class="bg-[#2d2d2d] rounded p-1.5 flex items-center gap-1 mb-2">
                <div class="w-6 h-6 rounded bg-[#1a1a1a] flex items-center justify-center text-[8px]">🍽️</div>
                <div class="flex-1">
                  <div class="h-1.5 w-12 bg-white/20 rounded"></div>
                </div>
                <div class="h-2 w-6 bg-[#c9a84c]/40 rounded"></div>
              </div>
              <div class="flex gap-1">
                <div class="flex-1 h-5 bg-[#4a4a4a] rounded"></div>
                <div class="flex-1 h-5 bg-[#c9a84c]/30 rounded"></div>
              </div>
            </div>
            <p class="text-xs text-text-secondary leading-relaxed">
              Стиль POS-терминала: минималистичный, консистентен с другими окнами Front.
            </p>
            <div class="flex flex-wrap gap-1 mt-2">
              <ui-badge variant="info">Консистентный</ui-badge>
              <ui-badge variant="default">POS-стиль</ui-badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Таблица сравнения -->
      <div class="bg-surface rounded-xl border border-border overflow-hidden">
        <div class="px-5 py-3 bg-surface-secondary border-b border-border">
          <h2 class="text-sm font-semibold text-text-primary">Сравнительная таблица</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left px-5 py-3 text-text-secondary font-medium">Критерий</th>
                <th class="text-center px-4 py-3 text-text-secondary font-medium">Кнопки в ряд</th>
                <th class="text-center px-4 py-3 text-text-secondary font-medium">Кнопки столбцом</th>
                <th class="text-center px-4 py-3 text-text-secondary font-medium">POS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of comparisonData" class="border-b border-border/60">
                <td class="px-5 py-2.5 text-text-primary">{{ row.label }}</td>
                <td class="text-center px-4 py-2.5">{{ row.addFirst }}</td>
                <td class="text-center px-4 py-2.5">{{ row.vertical }}</td>
                <td class="text-center px-4 py-2.5">{{ row.pos }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Модалки -->
      <hint-card-dialog
        [open]="activeDesign === 'card-add-first'"
        [hint]="activeHint"
        buttonLayout="add-first"
        (add)="onClose()"
        (decline)="onClose()">
      </hint-card-dialog>

      <hint-card-dialog
        [open]="activeDesign === 'card-vertical'"
        [hint]="activeHint"
        buttonLayout="vertical"
        (add)="onClose()"
        (decline)="onClose()">
      </hint-card-dialog>

      <hint-pos-dialog
        [open]="activeDesign === 'pos'"
        [hint]="activeHint"
        (add)="onClose()"
        (decline)="onClose()">
      </hint-pos-dialog>
    </div>
  `,
})
export class HintVariantsScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Главная', onClick: () => this.router.navigateByUrl('/') },
    { label: 'Плагины Front', onClick: () => this.router.navigateByUrl('/prototype/front-plugins') },
    { label: 'Подсказки', onClick: () => this.router.navigateByUrl('/prototype/front-plugins/hints') },
    { label: 'Сравнение вариантов' },
  ];

  activeDesign: DesignType | null = null;
  selectedData: DataVariant = 'A';

  dataVariants: { key: DataVariant; label: string }[] = [
    { key: 'A', label: 'Со скидкой (полный)' },
    { key: 'B', label: 'Без картинки, без скидки' },
    { key: 'C', label: 'Комбо со скидкой' },
  ];

  comparisonData = [
    { label: 'Скорость выбора', addFirst: '⭐⭐⭐', vertical: '⭐⭐', pos: '⭐⭐⭐' },
    { label: 'Удобство для тач', addFirst: '⭐⭐', vertical: '⭐⭐⭐', pos: '⭐⭐' },
    { label: 'Заметность «Добавить»', addFirst: '⭐⭐⭐', vertical: '⭐⭐⭐', pos: '⭐⭐' },
    { label: 'Заметность «Отказаться»', addFirst: '⭐⭐⭐', vertical: '⭐⭐', pos: '⭐⭐⭐' },
    { label: 'Консистентность с Front', addFirst: '⭐⭐⭐', vertical: '⭐⭐', pos: '⭐⭐⭐' },
    { label: 'Компактность', addFirst: '⭐⭐⭐', vertical: '⭐⭐', pos: '⭐⭐⭐' },
  ];

  private hintMap: Record<DataVariant, HintData> = {
    A: HINT_VARIANT_A,
    B: HINT_VARIANT_B,
    C: HINT_VARIANT_C,
  };

  get activeHint(): HintData {
    return this.hintMap[this.selectedData];
  }

  get currentDataDescription(): string {
    const descs: Record<DataVariant, string> = {
      A: 'Полный набор: картинка, скидка (–7 ₽), описание',
      B: 'Минимальный набор: без картинки, без скидки, без описания',
      C: 'Комбо: картинка, скидка –30%, развёрнутое описание',
    };
    return descs[this.selectedData];
  }

  selectData(key: DataVariant): void {
    this.selectedData = key;
  }

  openDesign(design: DesignType): void {
    this.activeDesign = design;
  }

  onClose(): void {
    this.activeDesign = null;
  }
}
