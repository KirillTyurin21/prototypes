import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosDialogSize, PosDialogTheme, PosDialogPadding, POS_SIZES } from '../types';

/**
 * POS Dialog — единая обёртка для модальных окон плагинов внутри терминала.
 *
 * Объединяет паттерны из Falcon (p-8, animate-scale-in) и Neptune (borderColor,
 * animate-fade-in). Позиционируется `absolute` внутри pos-terminal-shell,
 * перекрывая только область терминала (а не всю страницу).
 *
 * @example
 * <pos-dialog [open]="showDialog" maxWidth="md" (dialogClose)="showDialog = false">
 *   <h2 class="text-lg font-bold text-white mb-4">Заголовок</h2>
 *   <p class="text-gray-300">Содержимое диалога</p>
 * </pos-dialog>
 *
 * @example С цветной рамкой (стиль Neptune)
 * <pos-dialog [open]="show" borderColor="#26A69A" maxWidth="lg">
 *   ...
 * </pos-dialog>
 */
@Component({
  selector: 'pos-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open"
         class="absolute inset-0 z-50 flex items-center justify-center animate-fade-in">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50"
           (click)="onOverlayClick()"></div>

      <!-- Dialog content -->
      <div class="relative rounded-lg animate-scale-in w-full mx-4"
           [ngClass]="[themeClass, paddingClass]"
           [style.max-width.px]="maxWidthPx"
           [style.border]="borderStyle">
        <!-- Кнопка закрытия -->
        <button *ngIf="closable"
                (click)="dialogClose.emit()"
                class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full
                       transition-colors z-10"
                [ngClass]="theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'">
          <span class="text-xl leading-none">&times;</span>
        </button>

        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PosDialogComponent {
  /** Открыт ли диалог */
  @Input() open = false;
  /** Максимальная ширина */
  @Input() maxWidth: PosDialogSize = 'md';
  /** Цветовая тема */
  @Input() theme: PosDialogTheme = 'dark';
  /** Внутренний отступ */
  @Input() padding: PosDialogPadding = 'lg';
  /** Показывать кнопку закрытия */
  @Input() closable = true;
  /** Цвет рамки (опционально, стиль Neptune) */
  @Input() borderColor = '';

  /** Закрытие диалога */
  @Output() dialogClose = new EventEmitter<void>();

  /** Закрытие по Escape */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open && this.closable) {
      this.dialogClose.emit();
    }
  }

  get maxWidthPx(): number {
    return POS_SIZES.dialogWidth[this.maxWidth] ?? POS_SIZES.dialogWidth.md;
  }

  get themeClass(): string {
    return this.theme === 'dark'
      ? 'bg-[#3a3a3a] text-white'
      : 'bg-white text-gray-900';
  }

  get paddingClass(): string {
    switch (this.padding) {
      case 'sm': return 'p-4';
      case 'md': return 'p-6';
      case 'lg': return 'p-8';
      default:   return 'p-8';
    }
  }

  get borderStyle(): string {
    return this.borderColor
      ? `3px solid ${this.borderColor}`
      : 'none';
  }

  onOverlayClick(): void {
    if (this.closable) {
      this.dialogClose.emit();
    }
  }
}
