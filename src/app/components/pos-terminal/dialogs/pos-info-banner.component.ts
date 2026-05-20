import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { POS_COLORS } from '../types';

/** Поле информационного баннера */
export interface PosInfoField {
  label: string;
  value: string;
  /** Цвет значения (по умолчанию белый) */
  valueColor?: string;
}

/**
 * POS Info Banner — информационная/статусная панель.
 *
 * Отображает набор label–value пар с цветным заголовком.
 * Примеры использования: проверка сертификата (статус, номинал, баланс),
 * информация о QR-коде, версия системы.
 *
 * @example
 * <pos-info-banner
 *   title="Сертификат"
 *   [fields]="[
 *     { label: 'Статус', value: 'Активен', valueColor: '#4caf50' },
 *     { label: 'Номинал', value: '5 000 ₽' },
 *     { label: 'Баланс', value: '3 200 ₽' }
 *   ]"
 *   (close)="closeBanner()">
 * </pos-info-banner>
 */
@Component({
  selector: 'pos-info-banner',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="flex flex-col h-full"
         [style.background-color]="colors.dialogBg">

      <!-- Title -->
      <div class="flex items-center justify-between px-3 py-2"
           [style.background-color]="colors.headerBg">
        <div class="flex items-center gap-2">
          <lucide-icon *ngIf="icon" [name]="icon" [size]="18"
                       [style.color]="titleColor || colors.accent"></lucide-icon>
          <span class="text-sm font-bold"
                [style.color]="titleColor || colors.accent">{{ title }}</span>
        </div>
      </div>

      <!-- Fields -->
      <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        <div *ngFor="let f of fields" class="flex items-baseline gap-3">
          <span class="w-[40%] text-right text-xs text-gray-400 shrink-0">{{ f.label }}</span>
          <span class="flex-1 text-sm font-medium"
                [style.color]="f.valueColor || '#fff'">{{ f.value }}</span>
        </div>

        <!-- Slot for extra content -->
        <ng-content></ng-content>
      </div>

      <!-- Bottom buttons -->
      <div class="flex border-t border-gray-700"
           [style.background-color]="colors.headerBg">
        <button (click)="close.emit()"
                class="ib-btn flex-1 py-2.5 text-sm font-bold text-white">
          {{ closeLabel }}
        </button>
        <button *ngIf="showAction && actionLabel"
                (click)="action.emit()"
                class="ib-btn flex-1 py-2.5 text-sm font-bold"
                [style.color]="colors.accent">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .ib-btn { cursor: pointer; transition: background-color 0.1s; }
    .ib-btn:hover { background-color: #383838; }
    .ib-btn:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
  `],
})
export class PosInfoBannerComponent {
  /** Заголовок баннера */
  @Input() title = '';
  /** Цвет заголовка */
  @Input() titleColor = '';
  /** Иконка (Lucide icon name) */
  @Input() icon = '';
  /** Массив полей */
  @Input() fields: PosInfoField[] = [];
  /** Текст кнопки закрытия */
  @Input() closeLabel = 'Закрыть';
  /** Показывать ли кнопку действия */
  @Input() showAction = false;
  /** Текст кнопки действия */
  @Input() actionLabel = '';

  /** Закрытие */
  @Output() close = new EventEmitter<void>();
  /** Действие (доп. кнопка) */
  @Output() action = new EventEmitter<void>();

  colors = POS_COLORS;
}
