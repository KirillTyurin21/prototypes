import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { PosButtonVariant, PosButtonSize } from '../types';

/**
 * POS Button — кнопка в стиле терминала Front.
 *
 * Варианты:
 * - `main`   — белый фон, тёмный текст (кнопки главного экрана)
 * - `dark`   — тёмный фон, белый текст (кнопки действий, нижняя панель)
 * - `header` — цветной фон, белый текст (заголовки секций)
 *
 * Анимация нажатия: фон кнопки кратковременно меняется на акцентный
 * оливково-зелёный цвет (#b8c959) через CSS :active.
 *
 * @example
 * <pos-button label="Отправить" icon="send" variant="dark" (clicked)="onSend()"></pos-button>
 * <pos-button label="Касса" variant="main" size="lg"></pos-button>
 * <pos-button label="ГОСТИ" variant="header" headerColor="#00796B"></pos-button>
 */
@Component({
  selector: 'pos-button',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <button (click)="clicked.emit()"
            [disabled]="disabled"
            class="pos-btn rounded transition-colors select-none"
            [ngClass]="buttonClasses"
            [style.background-color]="variant === 'header' ? headerColor : null">
      <div [ngClass]="layoutClasses">
        <lucide-icon *ngIf="icon" [name]="icon" [size]="iconSize"></lucide-icon>
        <span *ngIf="label" [ngClass]="labelClasses">{{ label }}</span>
      </div>
    </button>
  `,
  styles: [`
    .pos-btn-main:active:not(:disabled) {
      background-color: #b8c959 !important;
    }
    .pos-btn-dark:active:not(:disabled) {
      background-color: #b8c959 !important;
      color: #1a1a1a !important;
    }
    .pos-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `],
})
export class PosButtonComponent {
  /** Текст кнопки */
  @Input() label = '';
  /** Имя иконки Lucide */
  @Input() icon = '';
  /** Стилевой вариант */
  @Input() variant: PosButtonVariant = 'main';
  /** Цвет фона (только для variant="header") */
  @Input() headerColor = '#00796B';
  /** Заблокирована */
  @Input() disabled = false;
  /** Занять всю ширину родителя */
  @Input() fullWidth = true;
  /** Размер кнопки */
  @Input() size: PosButtonSize = 'md';
  /** Расположение иконки: слева от текста или сверху */
  @Input() iconPosition: 'left' | 'top' = 'left';

  /** Клик по кнопке */
  @Output() clicked = new EventEmitter<void>();

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 14;
      case 'lg': return 22;
      default: return 18;
    }
  }

  get layoutClasses(): string {
    return this.iconPosition === 'top'
      ? 'flex flex-col items-center gap-1'
      : 'flex items-center gap-2 justify-center';
  }

  get labelClasses(): string {
    if (this.variant === 'header') {
      return 'font-bold uppercase tracking-wide';
    }
    return '';
  }

  get buttonClasses(): string {
    const width = this.fullWidth ? 'w-full' : '';
    const height = this.size === 'sm' ? 'h-10' : this.size === 'lg' ? 'h-16' : 'h-14';

    switch (this.variant) {
      case 'main':
        return `${width} ${height} pos-btn-main bg-white text-[#333] hover:bg-gray-50 font-medium text-sm flex items-center justify-center`;
      case 'dark':
        return `${width} ${height} pos-btn-dark bg-[#1a1a1a] text-white hover:bg-[#252525] text-xs font-medium flex items-center justify-center`;
      case 'header':
        return `${width} ${height} text-white text-sm flex items-center justify-center cursor-default`;
      default:
        return `${width} ${height} flex items-center justify-center`;
    }
  }
}
