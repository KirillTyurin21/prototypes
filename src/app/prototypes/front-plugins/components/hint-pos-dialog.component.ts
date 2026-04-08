import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HintData } from '../data/hint-types';

/**
 * Дизайн 3: «Компактный POS» — адаптирован под стилистику карточных вариантов.
 * Тёмный фон #3a3a3a, акцент #c9a84c, прямые углы, кнопки в ряд с разделителем.
 */
@Component({
  selector: 'hint-pos-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <!-- Overlay (НЕ кликабельный) -->
      <div class="absolute inset-0 bg-black/60"></div>

      <!-- Dialog -->
      <div class="relative bg-[#3a3a3a] text-white w-full max-w-[500px] mx-4 animate-scale-in border border-white/10 shadow-2xl"
           style="border-radius: 0;">

        <!-- Метка ПОДСКАЗКА -->
        <div class="px-5 pt-4 pb-1">
          <span class="text-[11px] font-medium uppercase tracking-widest text-white/40">Подсказка</span>
        </div>

        <!-- Заголовок — по центру -->
        <div class="px-5 pb-2">
          <h2 class="text-center text-base font-bold text-white">{{ hint.title }}</h2>
        </div>

        <!-- Слоган -->
        <div class="px-5 pb-3">
          <p class="text-[#c9a84c] text-sm leading-snug">{{ hint.slogan }}</p>
        </div>

        <!-- Триггер-текст -->
        <div *ngIf="triggerText" class="px-5 pb-3">
          <p class="text-xs text-white/40">{{ triggerText }}</p>
        </div>

        <!-- Разделитель -->
        <div class="border-t border-white/10 mx-5"></div>

        <!-- Карточка блюда — компактная строка -->
        <div class="px-5 py-3">
          <div class="flex items-center gap-3 bg-[#2d2d2d] border border-white/10 p-3"
               style="border-radius: 0;">
            <!-- Картинка (маленькая) -->
            <div *ngIf="hint.imageUrl" class="w-[48px] h-[48px] overflow-hidden bg-[#1a1a1a] flex-shrink-0"
                 style="border-radius: 0;">
              <img [src]="hint.imageUrl" [alt]="hint.recommendation.name"
                   class="w-full h-full object-cover"
                   (error)="onImageError($event)">
            </div>
            <div *ngIf="!hint.imageUrl" class="w-[48px] h-[48px] bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center"
                 style="border-radius: 0;">
              <span class="text-xl">🍽️</span>
            </div>

            <!-- Название и атрибуты -->
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-semibold text-sm truncate">{{ hint.recommendation.name }}</h3>
              <div *ngIf="hint.recommendation.attributes.length" class="text-xs text-white/40 mt-0.5">
                {{ hint.recommendation.attributes.join(' · ') }}
              </div>
            </div>

            <!-- Цена -->
            <div class="text-right flex-shrink-0">
              <div *ngIf="hint.recommendation.discountedPrice !== null" class="text-base font-bold text-[#c9a84c]">
                {{ hint.recommendation.discountedPrice }} ₽
              </div>
              <div *ngIf="hint.recommendation.discountedPrice === null" class="text-base font-bold text-white">
                {{ hint.recommendation.price }} ₽
              </div>
              <div *ngIf="hint.recommendation.oldPrice !== null && hint.recommendation.discountedPrice !== null"
                   class="text-xs text-white/30 line-through">
                {{ hint.recommendation.oldPrice }} ₽
              </div>
              <div *ngIf="hint.recommendation.discountAmount !== null"
                   class="text-xs text-[#c9a84c]/70">
                –{{ hint.recommendation.discountAmount }} ₽
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки — полная ширина с разделителем -->
        <div class="border-t border-white/10">
          <div class="flex">
            <button (click)="onDecline()"
                    class="flex-1 py-3.5 text-center text-white/70 font-bold text-sm
                           bg-[#2a2a2a] hover:bg-[#333] active:bg-[#222] transition-colors
                           border-r border-white/10"
                    style="border-radius: 0;">
              Отказаться
            </button>
            <button (click)="onAdd()"
                    class="flex-1 py-3.5 text-center text-[#c9a84c] font-bold text-sm
                           bg-[#2a2a2a] hover:bg-[#333] active:bg-[#222] transition-colors"
                    style="border-radius: 0;">
              Добавить {{ hint.recommendation.name }}
              <span *ngIf="displayPrice"> — {{ displayPrice }} ₽</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HintPosDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() hint!: HintData;
  @Output() add = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();

  get displayPrice(): number | null {
    return this.hint.recommendation.discountedPrice ?? this.hint.recommendation.price;
  }

  get triggerText(): string {
    if (!this.hint.description) return '';
    const dotIdx = this.hint.description.indexOf('.');
    return dotIdx > 0 ? this.hint.description.substring(0, dotIdx + 1) : this.hint.description;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      document.body.style.overflow = this.open ? 'hidden' : '';
    }
  }

  onAdd(): void {
    this.add.emit();
  }

  onDecline(): void {
    this.decline.emit();
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
