import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UiBreadcrumbsComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-dt-colors-screen',
  standalone: true,
  imports: [CommonModule, UiBreadcrumbsComponent, IconsModule],
  template: `
    <div class="max-w-5xl mx-auto animate-fade-in">
      <ui-breadcrumbs
        [items]="breadcrumbs"
      ></ui-breadcrumbs>

      <!-- Brand Colors -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Brand Colors</h2>
        <p class="text-sm text-text-secondary mb-4">Основные фирменные цвета из token <code>color.brand</code></p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div *ngFor="let c of brandColors" class="rounded-lg border border-border overflow-hidden">
            <div class="h-20" [style.background-color]="c.value"></div>
            <div class="p-3 bg-white">
              <div class="text-sm font-medium text-text-primary">{{ c.name }}</div>
              <div class="text-xs text-text-secondary font-mono mt-0.5">{{ c.value }}</div>
              <div class="text-xs text-text-tertiary mt-0.5">{{ c.token }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Semantic Surface Colors -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Surface Colors</h2>
        <p class="text-sm text-text-secondary mb-4">Семантические цвета поверхностей (<code>color.surface</code>)</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div *ngFor="let c of surfaceColors" class="rounded-lg border border-border overflow-hidden">
            <div class="h-16 border-b border-border" [style.background-color]="c.value"></div>
            <div class="p-3 bg-white">
              <div class="text-sm font-medium text-text-primary">{{ c.name }}</div>
              <div class="text-xs text-text-secondary font-mono mt-0.5">{{ c.value }}</div>
              <div class="text-xs text-text-tertiary mt-0.5">{{ c.token }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Text Colors -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Text Colors</h2>
        <p class="text-sm text-text-secondary mb-4">Цвета текста из <code>color.text</code></p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div *ngFor="let c of textColors" class="rounded-lg border border-border overflow-hidden">
            <div class="h-16 flex items-center justify-center" [style.background-color]="c.bg">
              <span class="text-base font-medium" [style.color]="c.value">Пример текста</span>
            </div>
            <div class="p-3 bg-white">
              <div class="text-sm font-medium text-text-primary">{{ c.name }}</div>
              <div class="text-xs text-text-secondary font-mono mt-0.5">{{ c.value }}</div>
              <div class="text-xs text-text-tertiary mt-0.5">{{ c.token }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Icon Colors -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Icon Colors</h2>
        <p class="text-sm text-text-secondary mb-4">Цвета иконок (<code>color.icon</code>)</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div *ngFor="let c of iconColors" class="rounded-lg border border-border overflow-hidden">
            <div class="h-16 flex items-center justify-center bg-white">
              <lucide-icon name="star" [size]="28" [style.color]="c.value"></lucide-icon>
            </div>
            <div class="p-3 bg-white border-t border-border">
              <div class="text-sm font-medium text-text-primary">{{ c.name }}</div>
              <div class="text-xs text-text-secondary font-mono mt-0.5">{{ c.value }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Border Colors -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Border Colors</h2>
        <p class="text-sm text-text-secondary mb-4">Цвета обводок (<code>color.border</code>)</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div *ngFor="let c of borderColors" class="rounded-lg border border-border overflow-hidden">
            <div class="h-16 flex items-center justify-center bg-white">
              <div class="w-20 h-10 rounded" [style.border]="'3px solid ' + c.value"></div>
            </div>
            <div class="p-3 bg-white border-t border-border">
              <div class="text-sm font-medium text-text-primary">{{ c.name }}</div>
              <div class="text-xs text-text-secondary font-mono mt-0.5">{{ c.value }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Base Color Palette: Neutral -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Base Palette — Neutral</h2>
        <p class="text-sm text-text-secondary mb-4">Полная нейтральная палитра (<code>baseColor.neutral</code>)</p>
        <div class="flex flex-wrap gap-1">
          <div *ngFor="let c of neutralPalette" class="w-16 text-center">
            <div class="h-12 rounded-t" [style.background-color]="c.value"></div>
            <div class="text-[10px] text-text-secondary mt-0.5">{{ c.name }}</div>
            <div class="text-[9px] text-text-tertiary font-mono">{{ c.value }}</div>
          </div>
        </div>
      </section>

      <!-- Base Color Palette: Accent -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Base Palette — Accent</h2>
        <p class="text-sm text-text-secondary mb-4">Палитра акцентного цвета (<code>baseColor.accent</code>)</p>
        <div class="flex flex-wrap gap-1">
          <div *ngFor="let c of accentPalette" class="w-16 text-center">
            <div class="h-12 rounded-t" [style.background-color]="c.value"></div>
            <div class="text-[10px] text-text-secondary mt-0.5">{{ c.name }}</div>
            <div class="text-[9px] text-text-tertiary font-mono">{{ c.value }}</div>
          </div>
        </div>
      </section>

      <!-- Base Color Palette: Positive -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Base Palette — Positive</h2>
        <p class="text-sm text-text-secondary mb-4">Палитра позитивного цвета (<code>baseColor.positive</code>)</p>
        <div class="flex flex-wrap gap-1">
          <div *ngFor="let c of positivePalette" class="w-16 text-center">
            <div class="h-12 rounded-t" [style.background-color]="c.value"></div>
            <div class="text-[10px] text-text-secondary mt-0.5">{{ c.name }}</div>
            <div class="text-[9px] text-text-tertiary font-mono">{{ c.value }}</div>
          </div>
        </div>
      </section>

      <!-- Base Color Palette: Warning -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Base Palette — Warning</h2>
        <p class="text-sm text-text-secondary mb-4">Палитра предупреждающего цвета (<code>baseColor.warning</code>)</p>
        <div class="flex flex-wrap gap-1">
          <div *ngFor="let c of warningPalette" class="w-16 text-center">
            <div class="h-12 rounded-t" [style.background-color]="c.value"></div>
            <div class="text-[10px] text-text-secondary mt-0.5">{{ c.name }}</div>
            <div class="text-[9px] text-text-tertiary font-mono">{{ c.value }}</div>
          </div>
        </div>
      </section>

      <!-- Base Color Palette: Negative -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Base Palette — Negative</h2>
        <p class="text-sm text-text-secondary mb-4">Палитра негативного цвета (<code>baseColor.negative</code>)</p>
        <div class="flex flex-wrap gap-1">
          <div *ngFor="let c of negativePalette" class="w-16 text-center">
            <div class="h-12 rounded-t" [style.background-color]="c.value"></div>
            <div class="text-[10px] text-text-secondary mt-0.5">{{ c.name }}</div>
            <div class="text-[9px] text-text-tertiary font-mono">{{ c.value }}</div>
          </div>
        </div>
      </section>

      <!-- Contrast Colors -->
      <section class="mb-10">
        <h2 class="text-lg font-medium text-text-primary mb-1">Base Palette — Contrast</h2>
        <p class="text-sm text-text-secondary mb-4">Контрастные цвета (<code>baseColor.contrast</code>)</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div *ngFor="let c of contrastColors" class="rounded-lg border border-border overflow-hidden">
            <div class="h-16" [style.background-color]="c.value"></div>
            <div class="p-3 bg-white">
              <div class="text-sm font-medium text-text-primary">{{ c.name }}</div>
              <div class="text-xs text-text-secondary font-mono mt-0.5">{{ c.value }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class DtColorsScreenComponent {
  private router = inject(Router);

  breadcrumbs = [
    { label: 'Дизайн-токены', onClick: () => this.router.navigate(['/prototype/design-tokens']) },
    { label: 'Цвета' },
  ];

  brandColors = [
    { name: 'Brand Accent', value: '#448AFF', token: 'color.brand.accent' },
    { name: 'Brand Positive', value: '#14B456', token: 'color.brand.positive' },
    { name: 'Brand Warning', value: '#FFAB40', token: 'color.brand.warning' },
    { name: 'Brand Negative', value: '#FF5252', token: 'color.brand.negative' },
  ];

  surfaceColors = [
    { name: 'Primary', value: '#FFFFFF', token: 'color.surface.primary' },
    { name: 'Secondary', value: '#F5F5F5', token: 'color.surface.secondary' },
    { name: 'Tertiary', value: '#EEEEEE', token: 'color.surface.tertiary' },
    { name: 'Inverse', value: '#263136', token: 'color.surface.inverse' },
    { name: 'Accent', value: '#E3F2FD', token: 'color.surface.accent' },
    { name: 'Positive', value: '#DCFCE7', token: 'color.surface.positive' },
    { name: 'Warning', value: '#FFF8E1', token: 'color.surface.warning' },
    { name: 'Negative', value: '#FFEBEE', token: 'color.surface.negative' },
    { name: 'Scrim', value: 'rgba(0,0,0,0.5)', token: 'color.surface.scrim' },
  ];

  textColors = [
    { name: 'Primary', value: '#212121', token: 'color.text.primary', bg: '#FFFFFF' },
    { name: 'Secondary', value: '#757575', token: 'color.text.secondary', bg: '#FFFFFF' },
    { name: 'Tertiary', value: '#9E9E9E', token: 'color.text.tertiary', bg: '#FFFFFF' },
    { name: 'Disabled', value: '#BDBDBD', token: 'color.text.disabled', bg: '#FFFFFF' },
    { name: 'Inverse', value: '#FFFFFF', token: 'color.text.inverse', bg: '#263136' },
    { name: 'Accent', value: '#448AFF', token: 'color.text.accent', bg: '#FFFFFF' },
    { name: 'Positive', value: '#14B456', token: 'color.text.positive', bg: '#FFFFFF' },
    { name: 'Warning', value: '#F57C00', token: 'color.text.warning', bg: '#FFFFFF' },
    { name: 'Negative', value: '#FF5252', token: 'color.text.negative', bg: '#FFFFFF' },
  ];

  iconColors = [
    { name: 'Primary', value: '#616161' },
    { name: 'Secondary', value: '#9E9E9E' },
    { name: 'Tertiary', value: '#BDBDBD' },
    { name: 'Disabled', value: '#E0E0E0' },
    { name: 'Inverse', value: '#FFFFFF' },
    { name: 'Accent', value: '#448AFF' },
    { name: 'Positive', value: '#14B456' },
    { name: 'Warning', value: '#F57C00' },
    { name: 'Negative', value: '#FF5252' },
  ];

  borderColors = [
    { name: 'Primary', value: '#E0E0E0' },
    { name: 'Secondary', value: '#EEEEEE' },
    { name: 'Accent', value: '#448AFF' },
    { name: 'Positive', value: '#14B456' },
    { name: 'Warning', value: '#FFAB40' },
    { name: 'Negative', value: '#FF5252' },
  ];

  neutralPalette = [
    { name: '0', value: '#FFFFFF' },
    { name: '50', value: '#FAFAFA' },
    { name: '100', value: '#F5F5F5' },
    { name: '200', value: '#EEEEEE' },
    { name: '300', value: '#E0E0E0' },
    { name: '400', value: '#BDBDBD' },
    { name: '500', value: '#9E9E9E' },
    { name: '600', value: '#757575' },
    { name: '700', value: '#616161' },
    { name: '800', value: '#424242' },
    { name: '900', value: '#212121' },
    { name: '990', value: '#121212' },
  ];

  accentPalette = [
    { name: '50', value: '#E3F2FD' },
    { name: '100', value: '#BBDEFB' },
    { name: '200', value: '#90CAF9' },
    { name: '300', value: '#64B5F6' },
    { name: '400', value: '#42A5F5' },
    { name: '500', value: '#448AFF' },
    { name: '600', value: '#1E88E5' },
    { name: '700', value: '#1976D2' },
    { name: '800', value: '#1565C0' },
    { name: '900', value: '#0D47A1' },
  ];

  positivePalette = [
    { name: '50', value: '#DCFCE7' },
    { name: '100', value: '#BBF7D0' },
    { name: '200', value: '#86EFAC' },
    { name: '300', value: '#4ADE80' },
    { name: '400', value: '#22C55E' },
    { name: '500', value: '#14B456' },
    { name: '600', value: '#16A34A' },
    { name: '700', value: '#15803D' },
    { name: '800', value: '#166534' },
    { name: '900', value: '#14532D' },
  ];

  warningPalette = [
    { name: '50', value: '#FFF8E1' },
    { name: '100', value: '#FFECB3' },
    { name: '200', value: '#FFE082' },
    { name: '300', value: '#FFD54F' },
    { name: '400', value: '#FFCA28' },
    { name: '500', value: '#FFAB40' },
    { name: '600', value: '#FFB300' },
    { name: '700', value: '#FFA000' },
    { name: '800', value: '#FF8F00' },
    { name: '900', value: '#FF6F00' },
  ];

  negativePalette = [
    { name: '50', value: '#FFEBEE' },
    { name: '100', value: '#FFCDD2' },
    { name: '200', value: '#EF9A9A' },
    { name: '300', value: '#E57373' },
    { name: '400', value: '#EF5350' },
    { name: '500', value: '#FF5252' },
    { name: '600', value: '#E53935' },
    { name: '700', value: '#D32F2F' },
    { name: '800', value: '#C62828' },
    { name: '900', value: '#B71C1C' },
  ];

  contrastColors = [
    { name: 'Contrast 1', value: '#FFFFFF' },
    { name: 'Contrast 2', value: '#000000' },
    { name: 'Contrast 3', value: '#FFFFFF' },
    { name: 'Contrast 4', value: '#000000' },
  ];
}
