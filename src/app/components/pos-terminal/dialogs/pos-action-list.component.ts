import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { POS_COLORS } from '../types';

/** Элемент списка действий */
export interface PosActionItem {
  id: string;
  label: string;
  /** Подпись (например, цена или описание) */
  subtitle?: string;
  /** Отключена ли опция */
  disabled?: boolean;
}

/**
 * POS Action List — вертикальный список действий / меню выбора.
 *
 * Жёлтый заголовок, белые кнопки-опции (полноширинные, с разделителями),
 * тёмная кнопка «Отмена» внизу. Используется для:
 * - Меню плагина (список действий)
 * - Выбор способа оплаты / типа заказа
 * - Выбор варианта из списка
 *
 * @example
 * <pos-action-list
 *   title="Выберите действие"
 *   [items]="[
 *     { id: 'scan', label: 'Сканировать QR' },
 *     { id: 'manual', label: 'Ввести вручную' },
 *     { id: 'history', label: 'История' }
 *   ]"
 *   (itemClick)="onAction($event)"
 *   (cancel)="closeMenu()">
 * </pos-action-list>
 */
@Component({
  selector: 'pos-action-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full"
         [style.background-color]="colors.dialogBg">

      <!-- Title -->
      <div class="px-4 py-3 text-sm font-bold shrink-0"
           [style.color]="colors.accent"
           [style.background-color]="colors.headerBg">
        {{ title }}
      </div>

      <!-- Items list -->
      <div class="flex-1 overflow-y-auto">
        <button *ngFor="let item of items; let last = last"
                (click)="onItemClick(item)"
                [disabled]="item.disabled"
                class="al-item w-full text-left px-4 py-3 text-sm transition-colors"
                [class.opacity-40]="item.disabled"
                [class.cursor-not-allowed]="item.disabled"
                [class.border-b]="!last"
                style="border-color: #555; background-color: #f5f5f5; color: #333;">
          <div class="font-medium">{{ item.label }}</div>
          <div *ngIf="item.subtitle" class="text-xs text-gray-500 mt-0.5">{{ item.subtitle }}</div>
        </button>
      </div>

      <!-- Cancel button -->
      <div *ngIf="showCancel" class="shrink-0 border-t border-gray-700"
           [style.background-color]="colors.bottomBarBg">
        <button (click)="cancel.emit()"
                class="al-cancel w-full py-3 text-sm font-bold text-white text-center">
          {{ cancelLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .al-item { cursor: pointer; }
    .al-item:hover:not(:disabled) { background-color: #e8e8e8 !important; }
    .al-item:active:not(:disabled) { background-color: #b8c959 !important; color: #1a1a1a !important; }
    .al-cancel { cursor: pointer; transition: background-color 0.1s; }
    .al-cancel:hover { background-color: #444; }
    .al-cancel:active { background-color: #b8c959 !important; color: #1a1a1a !important; }
  `],
})
export class PosActionListComponent {
  /** Заголовок */
  @Input() title = '';
  /** Элементы списка */
  @Input() items: PosActionItem[] = [];
  /** Показывать кнопку отмены */
  @Input() showCancel = true;
  /** Текст кнопки отмены */
  @Input() cancelLabel = 'Отмена';

  /** Нажатие на элемент */
  @Output() itemClick = new EventEmitter<PosActionItem>();
  /** Отмена */
  @Output() cancel = new EventEmitter<void>();

  colors = POS_COLORS;

  onItemClick(item: PosActionItem): void {
    if (!item.disabled) {
      this.itemClick.emit(item);
    }
  }
}
