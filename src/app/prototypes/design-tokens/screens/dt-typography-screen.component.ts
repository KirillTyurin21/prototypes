import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiBreadcrumbsComponent } from '@/components/ui';

@Component({
  selector: 'app-dt-typography-screen',
  standalone: true,
  imports: [CommonModule, UiBreadcrumbsComponent],
  template: `
    <div class="max-w-5xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <!-- Base Typography Tokens -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Базовые размеры шрифта</h2>
        <p class="text-sm text-text-secondary mb-4">Из <code>baseTypography.fontSize</code> и <code>baseTypography.lineHeight</code></p>
        <div class="space-y-4 bg-white rounded-lg border border-border p-6">
          <div *ngFor="let item of fontSizes" class="flex items-baseline gap-6 pb-3 border-b border-border last:border-0">
            <div class="w-16 text-xs text-text-tertiary font-mono shrink-0">{{ item.token }}</div>
            <div class="w-16 text-xs text-text-secondary shrink-0">{{ item.size }}</div>
            <div class="flex-1" [style.font-size]="item.size" [style.line-height]="item.lineHeight" style="font-family: Roboto, sans-serif;">
              Пример текста — Roboto {{ item.size }}
            </div>
            <div class="w-20 text-xs text-text-tertiary shrink-0">LH: {{ item.lineHeight }}</div>
          </div>
        </div>
      </section>

      <!-- Font Weights -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Начертания (Font Weight)</h2>
        <p class="text-sm text-text-secondary mb-4">Из <code>baseTypography.fontWeight</code></p>
        <div class="space-y-4 bg-white rounded-lg border border-border p-6">
          <div *ngFor="let w of fontWeights" class="flex items-baseline gap-6 pb-3 border-b border-border last:border-0">
            <div class="w-24 text-xs text-text-tertiary font-mono shrink-0">{{ w.token }}</div>
            <div class="w-12 text-xs text-text-secondary shrink-0">{{ w.value }}</div>
            <div class="flex-1 text-xl" [style.font-weight]="w.value" style="font-family: Roboto, sans-serif;">
              Пример текста — weight {{ w.value }}
            </div>
          </div>
        </div>
      </section>

      <!-- Typography Composite Tokens -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Типографические стили</h2>
        <p class="text-sm text-text-secondary mb-4">Составные токены из <code>typography</code>: размер + вес + высота строки</p>
        <div class="space-y-3 bg-white rounded-lg border border-border p-6">
          <div *ngFor="let t of typographyStyles" class="pb-4 border-b border-border last:border-0">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-xs font-mono bg-surface-secondary px-2 py-0.5 rounded text-text-secondary">{{ t.token }}</span>
              <span class="text-xs text-text-tertiary">{{ t.size }} / {{ t.weight }} / LH {{ t.lineHeight }}</span>
            </div>
            <div
              [style.font-size]="t.size"
              [style.font-weight]="t.weight"
              [style.line-height]="t.lineHeight"
              style="font-family: Roboto, sans-serif;"
              class="text-text-primary"
            >
              {{ t.sample }}
            </div>
          </div>
        </div>
      </section>

      <!-- Font Family -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Шрифт</h2>
        <p class="text-sm text-text-secondary mb-4">Из <code>baseTypography.fontFamily</code></p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex items-center gap-4">
            <span class="text-sm font-mono bg-surface-secondary px-3 py-1 rounded">fontFamily.primary</span>
            <span class="text-lg" style="font-family: Roboto, sans-serif;">Roboto</span>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class DtTypographyScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Дизайн-токены', onClick: () => this.router.navigate(['/prototype/design-tokens']) },
    { label: 'Типографика' },
  ];

  fontSizes = [
    { token: 'xxxs', size: '8px', lineHeight: '10px' },
    { token: 'xxs', size: '10px', lineHeight: '12px' },
    { token: 'xs', size: '12px', lineHeight: '16px' },
    { token: 's', size: '14px', lineHeight: '20px' },
    { token: 'm', size: '16px', lineHeight: '24px' },
    { token: 'l', size: '20px', lineHeight: '28px' },
    { token: 'xl', size: '24px', lineHeight: '32px' },
    { token: 'xxl', size: '28px', lineHeight: '36px' },
    { token: 'xxxl', size: '34px', lineHeight: '40px' },
  ];

  fontWeights = [
    { token: 'regular', value: '400' },
    { token: 'medium', value: '500' },
  ];

  typographyStyles = [
    { token: 'display.l', size: '34px', weight: '400', lineHeight: '40px', sample: 'Display Large — Заголовок главной страницы' },
    { token: 'display.m', size: '28px', weight: '400', lineHeight: '36px', sample: 'Display Medium — Подзаголовок' },
    { token: 'display.s', size: '24px', weight: '400', lineHeight: '32px', sample: 'Display Small — Раздел' },
    { token: 'header.l', size: '20px', weight: '500', lineHeight: '28px', sample: 'Header Large — Заголовок карточки' },
    { token: 'header.m', size: '16px', weight: '500', lineHeight: '24px', sample: 'Header Medium — Заголовок секции' },
    { token: 'header.s', size: '14px', weight: '500', lineHeight: '20px', sample: 'Header Small — Заголовок подсекции' },
    { token: 'body.l', size: '16px', weight: '400', lineHeight: '24px', sample: 'Body Large — Основной текст, описания, параграфы' },
    { token: 'body.m', size: '14px', weight: '400', lineHeight: '20px', sample: 'Body Medium — Вторичный текст, подписи к полям' },
    { token: 'body.s', size: '12px', weight: '400', lineHeight: '16px', sample: 'Body Small — Подсказки, мелкие надписи' },
    { token: 'label.l', size: '14px', weight: '500', lineHeight: '20px', sample: 'Label Large — Кнопки, навигация' },
    { token: 'label.m', size: '12px', weight: '500', lineHeight: '16px', sample: 'Label Medium — Теги, метки' },
    { token: 'label.s', size: '10px', weight: '500', lineHeight: '12px', sample: 'Label Small — Бейджи, мини-метки' },
  ];
}
