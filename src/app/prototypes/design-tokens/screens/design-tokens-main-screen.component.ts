import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  UiCardComponent,
  UiCardHeaderComponent,
  UiCardTitleComponent,
  UiCardContentComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-design-tokens-main-screen',
  standalone: true,
  imports: [
    CommonModule,
    UiCardComponent,
    UiCardHeaderComponent,
    UiCardTitleComponent,
    UiCardContentComponent,
    IconsModule,
  ],
  template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <div class="mb-6">
        <h2 class="text-xl font-medium text-text-primary">Справочник дизайн-токенов</h2>
        <p class="text-sm text-text-secondary mt-1">
          Визуальный каталог всех токенов из файла Design Tokens (Tokens Studio).
          Используй как справочник при создании прототипов Web.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ui-card
          *ngFor="let card of cards"
          [hoverable]="true"
          (cardClick)="router.navigate([card.route])"
        >
          <ui-card-header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" [style.background-color]="card.iconBg">
                <lucide-icon [name]="card.icon" [size]="20" [style.color]="card.iconColor"></lucide-icon>
              </div>
              <div>
                <ui-card-title>{{ card.title }}</ui-card-title>
                <p class="text-xs text-text-secondary mt-0.5">{{ card.description }}</p>
              </div>
            </div>
          </ui-card-header>
          <ui-card-content>
            <div class="flex flex-wrap gap-1.5">
              <span *ngFor="let tag of card.tags"
                class="text-[10px] px-2 py-0.5 rounded-full bg-surface-secondary text-text-tertiary"
              >{{ tag }}</span>
            </div>
          </ui-card-content>
        </ui-card>
      </div>

      <!-- Summary -->
      <div class="mt-8 bg-surface-secondary rounded-lg p-4 text-sm text-text-secondary">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-medium text-text-primary">9</div>
            <div class="text-xs text-text-tertiary mt-0.5">категорий</div>
          </div>
          <div>
            <div class="text-2xl font-medium text-text-primary">30+</div>
            <div class="text-xs text-text-tertiary mt-0.5">компонентов</div>
          </div>
          <div>
            <div class="text-2xl font-medium text-text-primary">800+</div>
            <div class="text-xs text-text-tertiary mt-0.5">токенов</div>
          </div>
          <div>
            <div class="text-2xl font-medium text-text-primary">Roboto</div>
            <div class="text-xs text-text-tertiary mt-0.5">шрифт</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DesignTokensMainScreenComponent {
  router = inject(Router);

  cards = [
    {
      title: 'Цвета',
      description: 'Brand, Surface, Text, Icon, Border + базовые палитры',
      icon: 'palette',
      iconBg: '#E3F2FD',
      iconColor: '#448AFF',
      route: '/prototype/design-tokens/colors',
      tags: ['brand', 'surface', 'text', 'icon', 'border', 'neutral', 'accent', 'positive', 'warning', 'negative'],
    },
    {
      title: 'Типографика',
      description: 'Размеры шрифта, веса, стили заголовков и текста',
      icon: 'type',
      iconBg: '#FFF8E1',
      iconColor: '#F57C00',
      route: '/prototype/design-tokens/typography',
      tags: ['display', 'header', 'body', 'label', 'Roboto', 'fontSize', 'fontWeight'],
    },
    {
      title: 'Отступы и тени',
      description: 'Spacing, Border Radius, Stroke, Shadows',
      icon: 'layout-grid',
      iconBg: '#DCFCE7',
      iconColor: '#14B456',
      route: '/prototype/design-tokens/spacing',
      tags: ['space', 'radius', 'stroke', 'shadows', '4px grid', 'baseSize'],
    },
    {
      title: 'Компоненты',
      description: 'Button, Input, Chips, Checkbox, Table, Card, Dialog и др.',
      icon: 'puzzle',
      iconBg: '#FFEBEE',
      iconColor: '#FF5252',
      route: '/prototype/design-tokens/components',
      tags: ['Button', 'Input', 'Chips', 'Checkbox', 'Radio', 'Toggle', 'Table', 'Card', 'Dialog', 'Tabs', 'Badge', 'Status'],
    },
  ];
}
