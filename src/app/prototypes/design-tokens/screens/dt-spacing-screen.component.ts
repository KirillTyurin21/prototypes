import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiBreadcrumbsComponent } from '@/components/ui';

@Component({
  selector: 'app-dt-spacing-screen',
  standalone: true,
  imports: [CommonModule, UiBreadcrumbsComponent],
  template: `
    <div class="max-w-5xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <!-- Base Size (4px grid) -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Base Size</h2>
        <p class="text-sm text-text-secondary mb-4">Базовая единица сетки: <code>baseSize = 4px</code></p>
        <div class="bg-white rounded-lg border border-border p-6 flex items-end gap-4">
          <div class="flex flex-col items-center">
            <div class="bg-blue-500 rounded" style="width: 4px; height: 4px;"></div>
            <span class="text-xs text-text-secondary mt-2">4px</span>
            <span class="text-[10px] text-text-tertiary">1 unit</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="bg-blue-500 rounded" style="width: 8px; height: 8px;"></div>
            <span class="text-xs text-text-secondary mt-2">8px</span>
            <span class="text-[10px] text-text-tertiary">2 units</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="bg-blue-500 rounded" style="width: 16px; height: 16px;"></div>
            <span class="text-xs text-text-secondary mt-2">16px</span>
            <span class="text-[10px] text-text-tertiary">4 units</span>
          </div>
          <div class="flex flex-col items-center">
            <div class="bg-blue-500 rounded" style="width: 32px; height: 32px;"></div>
            <span class="text-xs text-text-secondary mt-2">32px</span>
            <span class="text-[10px] text-text-tertiary">8 units</span>
          </div>
        </div>
      </section>

      <!-- Spacing -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Spacing</h2>
        <p class="text-sm text-text-secondary mb-4">Токены отступов (<code>space</code>): 0–32px, кратно 4px</p>
        <div class="bg-white rounded-lg border border-border p-6 space-y-3">
          <div *ngFor="let s of spacings" class="flex items-center gap-4">
            <div class="w-14 text-xs text-text-tertiary font-mono shrink-0">{{ s.token }}</div>
            <div class="w-12 text-xs text-text-secondary shrink-0">{{ s.value }}</div>
            <div class="flex-1 flex items-center">
              <div class="h-6 bg-blue-100 rounded relative" [style.width]="s.value">
                <div class="absolute inset-0 bg-blue-400 rounded opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Border Radius -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Border Radius</h2>
        <p class="text-sm text-text-secondary mb-4">Токены скругления углов (<code>radius</code>)</p>
        <div class="bg-white rounded-lg border border-border p-6">
          <div class="flex flex-wrap gap-6">
            <div *ngFor="let r of radiuses" class="flex flex-col items-center">
              <div
                class="w-16 h-16 bg-blue-100 border-2 border-blue-400"
                [style.border-radius]="r.value"
              ></div>
              <span class="text-xs text-text-secondary mt-2 font-mono">{{ r.token }}</span>
              <span class="text-[10px] text-text-tertiary">{{ r.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Border / Stroke -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Stroke (Обводки)</h2>
        <p class="text-sm text-text-secondary mb-4">Толщина обводок (<code>baseStroke</code>)</p>
        <div class="bg-white rounded-lg border border-border p-6 space-y-4">
          <div *ngFor="let s of strokes" class="flex items-center gap-4">
            <div class="w-14 text-xs text-text-tertiary font-mono shrink-0">{{ s.token }}</div>
            <div class="w-12 text-xs text-text-secondary shrink-0">{{ s.value }}</div>
            <div class="flex-1">
              <div
                class="w-full rounded"
                style="height: 0;"
                [style.border-top-width]="s.value"
                [style.border-top-style]="'solid'"
                [style.border-top-color]="'#448AFF'"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Shadows -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Shadows</h2>
        <p class="text-sm text-text-secondary mb-4">Тени (<code>shadows</code>): 5 уровней, каждый с двумя слоями</p>
        <div class="bg-gray-50 rounded-lg border border-border p-8">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            <div *ngFor="let s of shadows" class="flex flex-col items-center">
              <div
                class="w-20 h-20 bg-white rounded-lg"
                [style.box-shadow]="s.value"
              ></div>
              <span class="text-xs text-text-secondary mt-3 font-mono">{{ s.token }}</span>
              <span class="text-[10px] text-text-tertiary text-center mt-0.5">{{ s.desc }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Shadow Details -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Shadow Details</h2>
        <p class="text-sm text-text-secondary mb-4">Полные CSS-значения каждого уровня</p>
        <div class="bg-white rounded-lg border border-border overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-surface-secondary">
                <th class="text-left px-4 py-2 text-text-secondary font-medium">Токен</th>
                <th class="text-left px-4 py-2 text-text-secondary font-medium">CSS box-shadow</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of shadows" class="border-t border-border">
                <td class="px-4 py-3 font-mono text-xs text-text-primary">{{ s.token }}</td>
                <td class="px-4 py-3 font-mono text-xs text-text-tertiary break-all">{{ s.value || 'none' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class DtSpacingScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Дизайн-токены', onClick: () => this.router.navigate(['/prototype/design-tokens']) },
    { label: 'Отступы и тени' },
  ];

  spacings = [
    { token: 'none', value: '0px' },
    { token: 'xxxs', value: '2px' },
    { token: 'xxs', value: '4px' },
    { token: 'xs', value: '6px' },
    { token: 's', value: '8px' },
    { token: 'm', value: '12px' },
    { token: 'l', value: '16px' },
    { token: 'xl', value: '20px' },
    { token: 'xxl', value: '24px' },
    { token: 'xxxl', value: '32px' },
  ];

  radiuses = [
    { token: 'none', value: '0px' },
    { token: 'xxs', value: '2px' },
    { token: 'xs', value: '4px' },
    { token: 's', value: '6px' },
    { token: 'm', value: '8px' },
    { token: 'l', value: '12px' },
    { token: 'xl', value: '16px' },
    { token: 'xxl', value: '20px' },
    { token: 'xxxl', value: '24px' },
    { token: 'circular', value: '9999px' },
  ];

  strokes = [
    { token: 'none', value: '0px' },
    { token: 's', value: '1px' },
    { token: 'm', value: '1.5px' },
    { token: 'l', value: '2px' },
  ];

  shadows = [
    { token: 'none', value: 'none', desc: 'Без тени' },
    { token: 'Sl', value: '0px 0px 1px 0px rgba(0,0,0,0.24), 0px 0px 2px 0px rgba(0,0,0,0.08)', desc: 'Слабая' },
    { token: 'S', value: '0px 0px 2px 0px rgba(0,0,0,0.24), 0px 2px 8px 0px rgba(0,0,0,0.08)', desc: 'Малая' },
    { token: 'M', value: '0px 0px 4px 0px rgba(0,0,0,0.24), 0px 8px 24px 0px rgba(0,0,0,0.08)', desc: 'Средняя' },
    { token: 'XL', value: '0px 0px 4px 0px rgba(0,0,0,0.24), 0px 16px 40px 0px rgba(0,0,0,0.16)', desc: 'Большая' },
  ];
}
