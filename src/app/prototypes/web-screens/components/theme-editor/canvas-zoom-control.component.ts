import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';

/**
 * Компактная плавающая пилюля масштаба холста: «− % ▾ +».
 * Пресеты, «Подогнать под экран» и точный ввод — в поповере по клику на проценты.
 * Позиционируется родителем (например, position: sticky в углу холста).
 */
@Component({
  selector: 'app-canvas-zoom-control',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="zoom-pill" (click)="$event.stopPropagation()">
      <button type="button" class="zoom-btn" (click)="step(-1)" [disabled]="zoom <= min + 0.001" aria-label="Отдалить" title="Отдалить">
        <lucide-icon name="minus" [size]="16"></lucide-icon>
      </button>
      <button
        type="button"
        class="zoom-pct"
        (click)="togglePopover()"
        [attr.aria-expanded]="popoverOpen"
        aria-label="Масштаб в процентах"
        title="Масштаб. Ctrl + колесо — зум, Ctrl + 0 — 100%, Ctrl + 1 — подогнать">
        <span class="pct-value">{{ pct }}%</span>
        <lucide-icon name="chevron-up" [size]="14" class="pct-caret" [class.flip]="popoverOpen"></lucide-icon>
      </button>
      <button type="button" class="zoom-btn" (click)="step(1)" [disabled]="zoom >= max - 0.001" aria-label="Приблизить" title="Приблизить">
        <lucide-icon name="plus" [size]="16"></lucide-icon>
      </button>

      <div class="zoom-pop" *ngIf="popoverOpen" role="menu" aria-label="Масштаб">
        <button type="button" class="pop-action" (click)="fit()">
          <lucide-icon name="maximize-2" [size]="16"></lucide-icon>
          <span>Подогнать под экран</span>
        </button>
        <button type="button" class="pop-action" (click)="setPreset(100)">
          <lucide-icon name="refresh-cw" [size]="16"></lucide-icon>
          <span>Реальный размер (100%)</span>
        </button>
        <div class="pop-divider"></div>
        <div class="pop-presets">
          <button
            type="button"
            class="pop-preset"
            *ngFor="let p of presets"
            [class.active]="pct === p"
            (click)="setPreset(p)">
            {{ p }}%
          </button>
        </div>
        <label class="pop-input-label" for="zoom-exact-input">Точное значение</label>
        <div class="pop-input">
          <input
            id="zoom-exact-input"
            type="number"
            [min]="min * 100"
            [max]="max * 100"
            step="1"
            [(ngModel)]="inputValue"
            placeholder="{{ pct }}"
            (keydown.enter)="applyInput()"
            (blur)="applyInput()"
            aria-label="Точное значение масштаба" />
          <span class="pop-input-suffix">%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .zoom-pill {
      position: relative;
      display: inline-flex;
      align-items: center;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      font-family: Roboto, sans-serif;
      user-select: none;
    }
    .zoom-btn, .zoom-pct {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      border: none;
      background: transparent;
      cursor: pointer;
    }
    .zoom-btn {
      width: 36px;
      color: #424242;
      border-radius: 7px;
    }
    .zoom-btn:hover:not(:disabled) { background: #f5f5f5; }
    .zoom-btn:disabled { color: #bdbdbd; cursor: default; }
    .zoom-pct {
      gap: 3px;
      min-width: 70px;
      padding: 0 4px;
      border-radius: 7px;
      color: #212121;
      font-size: 13px;
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    .zoom-pct:hover { background: #f5f5f5; }
    .pct-caret { color: #9e9e9e; transition: transform 0.15s ease; }
    .pct-caret.flip { transform: rotate(180deg); }
    .zoom-btn:focus-visible, .zoom-pct:focus-visible, .pop-action:focus-visible, .pop-preset:focus-visible, .pop-input input:focus-visible {
      outline: 2px solid #448aff;
      outline-offset: -2px;
    }
    .zoom-pop {
      position: absolute;
      right: 0;
      bottom: calc(100% + 8px);
      width: 224px;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
      padding: 8px;
      z-index: 50;
      animation: zoom-pop-in 0.12s ease-out;
    }
    @keyframes zoom-pop-in { from { opacity: 0; transform: translateY(4px); } }
    .pop-action {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      height: 36px;
      padding: 0 10px;
      border: none;
      background: transparent;
      border-radius: 6px;
      color: #212121;
      font-size: 13px;
      font-family: Roboto, sans-serif;
      cursor: pointer;
      text-align: left;
    }
    .pop-action:hover { background: #f5f5f5; }
    .pop-action lucide-icon { color: #616161; }
    .pop-divider { height: 1px; background: #e0e0e0; margin: 8px 0; }
    .pop-presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
    .pop-preset {
      height: 30px;
      border: 1px solid #e0e0e0;
      background: #fff;
      border-radius: 6px;
      color: #424242;
      font-size: 12.5px;
      font-family: Roboto, sans-serif;
      cursor: pointer;
    }
    .pop-preset:hover { background: #f5f5f5; }
    .pop-preset.active { background: #e3f2fd; border-color: #90caf9; color: #1976d2; font-weight: 600; }
    .pop-input-label { display: block; font-size: 12px; color: #757575; margin: 10px 2px 4px; }
    .pop-input { display: flex; align-items: center; gap: 6px; }
    .pop-input input {
      flex: 1;
      min-width: 0;
      height: 32px;
      padding: 0 8px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 13px;
      font-family: Roboto, sans-serif;
      color: #212121;
      box-sizing: border-box;
      font-variant-numeric: tabular-nums;
    }
    .pop-input input:focus { outline: none; border-color: #448aff; }
    .pop-input-suffix { font-size: 13px; color: #616161; }
  `],
})
export class CanvasZoomControlComponent {
  /** Текущий масштаб (доля, 1 = 100%) */
  @Input() zoom = 1;
  @Input() min = 0.25;
  @Input() max = 2;
  /** Пресеты в поповере, % */
  @Input() presets: number[] = [50, 100, 150, 200];

  @Output() zoomChange = new EventEmitter<number>();
  @Output() fitRequested = new EventEmitter<void>();

  popoverOpen = false;
  inputValue: number | null = null;

  get pct(): number { return Math.round(this.zoom * 100); }

  /** Шаг масштаба: ±10% */
  step(dir: 1 | -1): void {
    this.emitZoom(Math.round((this.zoom + dir * 0.1) * 100) / 100);
  }

  togglePopover(): void {
    this.popoverOpen = !this.popoverOpen;
    if (this.popoverOpen) this.inputValue = null;
  }

  closePopover(): void { this.popoverOpen = false; }

  setPreset(p: number): void {
    this.emitZoom(p / 100);
    this.closePopover();
  }

  fit(): void {
    this.fitRequested.emit();
    this.closePopover();
  }

  applyInput(): void {
    const v = this.inputValue;
    this.inputValue = null;
    if (v === null || isNaN(v)) return;
    this.emitZoom(v / 100);
  }

  private emitZoom(k: number): void {
    this.zoomChange.emit(Math.min(this.max, Math.max(this.min, k)));
  }

  @HostListener('document:click')
  onDocClick(): void {
    if (this.popoverOpen) this.popoverOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.popoverOpen) this.popoverOpen = false;
  }
}
