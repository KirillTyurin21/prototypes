import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'ui-code-input-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div
      *ngIf="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl shadow-elevation-modal p-8 w-full max-w-sm mx-4 animate-fade-in">
        <!-- Icon -->
        <div class="flex justify-center mb-5">
          <div class="w-[60px] h-[60px] rounded-full flex items-center justify-center"
               [ngClass]="locked ? 'bg-red-50' : 'bg-app-primary/10'">
            <lucide-icon [name]="locked ? 'shield-alert' : 'lock'" [size]="28"
                         [ngClass]="locked ? 'text-red-500' : 'text-app-primary'"></lucide-icon>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-xl font-semibold text-center text-text-primary mb-1">
          {{ locked ? 'Доступ временно заблокирован' : title }}
        </h2>

        <!-- Subtitle / Lockout message -->
        <p *ngIf="locked" class="text-sm text-red-500 text-center mb-6">
          Слишком много неудачных попыток.<br>
          Повторите через <strong>{{ lockoutDisplay }}</strong>
        </p>
        <p *ngIf="!locked && subtitle" class="text-sm text-text-secondary text-center mb-6">{{ subtitle }}</p>
        <div *ngIf="!locked && !subtitle" class="mb-6"></div>

        <!-- Input (hidden when locked) -->
        <div *ngIf="!locked" class="mb-4">
          <input
            #codeInput
            type="text"
            [(ngModel)]="code"
            placeholder="Код доступа"
            class="w-full px-4 py-3 text-center text-lg tracking-widest uppercase font-mono border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-app-primary focus:border-app-primary"
            (keydown.enter)="onSubmit()"
          />
        </div>

        <!-- Lockout timer bar -->
        <div *ngIf="locked" class="mb-6">
          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div class="bg-red-400 h-2 rounded-full transition-all duration-1000"
                 [style.width.%]="lockoutPercent"></div>
          </div>
        </div>

        <!-- Error -->
        <p *ngIf="error && !locked" class="text-red-500 text-sm text-center mb-3">{{ error }}</p>

        <!-- Remaining attempts hint -->
        <p *ngIf="!locked && remainingAttempts > 0 && remainingAttempts <= 5 && !error"
           class="text-amber-500 text-xs text-center mb-3">
          Осталось попыток: {{ remainingAttempts }} из {{ maxAttempts }}
        </p>
        <p *ngIf="!locked && error && remainingAttempts > 0"
           class="text-amber-500 text-xs text-center mb-3">
          Осталось попыток: {{ remainingAttempts }} из {{ maxAttempts }}
        </p>

        <!-- Submit button -->
        <button
          *ngIf="!locked"
          type="button"
          class="w-full py-3 bg-app-primary text-white font-medium rounded-lg hover:bg-app-primary/90 transition-colors"
          (click)="onSubmit()"
        >
          Войти
        </button>

        <!-- Back link -->
        <div class="text-center mt-4">
          <span
            class="text-sm text-text-secondary hover:text-app-primary cursor-pointer"
            (click)="onClose()"
          >
            Вернуться на главную
          </span>
        </div>
      </div>
    </div>
  `,
})
export class CodeInputModalComponent implements OnChanges, OnDestroy {
  @Input() title = 'Введите код доступа';
  @Input() subtitle = '';
  @Input() visible = false;
  @Input() error = '';

  /** Rate-limit inputs from parent */
  @Input() locked = false;
  @Input() lockoutRemainingMs = 0;
  @Input() remainingAttempts = 10;
  @Input() maxAttempts = 10;

  @Output() codeSubmitted = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('codeInput') codeInput!: ElementRef<HTMLInputElement>;

  code = '';
  lockoutDisplay = '';
  lockoutPercent = 100;

  private lockoutTimer: any = null;
  private lockoutTotalMs = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.code = '';
      setTimeout(() => this.codeInput?.nativeElement?.focus(), 50);
    }
    if (changes['visible'] && !this.visible) {
      this.code = '';
      this.stopLockoutTimer();
    }
    if (changes['locked'] || changes['lockoutRemainingMs']) {
      if (this.locked && this.lockoutRemainingMs > 0) {
        this.lockoutTotalMs = this.lockoutRemainingMs;
        this.startLockoutTimer();
      } else if (!this.locked) {
        this.stopLockoutTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopLockoutTimer();
  }

  onSubmit(): void {
    if (this.locked) return;
    const trimmed = this.code.trim().toUpperCase();
    if (trimmed) {
      this.codeSubmitted.emit(trimmed);
    }
  }

  onClose(): void {
    this.code = '';
    this.closed.emit();
  }

  private startLockoutTimer(): void {
    this.stopLockoutTimer();
    this.updateLockoutDisplay();
    this.lockoutTimer = setInterval(() => {
      this.lockoutRemainingMs = Math.max(0, this.lockoutRemainingMs - 1000);
      this.updateLockoutDisplay();
      if (this.lockoutRemainingMs <= 0) {
        this.locked = false;
        this.stopLockoutTimer();
      }
    }, 1000);
  }

  private stopLockoutTimer(): void {
    if (this.lockoutTimer) {
      clearInterval(this.lockoutTimer);
      this.lockoutTimer = null;
    }
  }

  private updateLockoutDisplay(): void {
    const totalSec = Math.ceil(this.lockoutRemainingMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    this.lockoutDisplay = min > 0
      ? `${min} мин ${sec.toString().padStart(2, '0')} сек`
      : `${sec} сек`;
    this.lockoutPercent = this.lockoutTotalMs > 0
      ? (this.lockoutRemainingMs / this.lockoutTotalMs) * 100
      : 0;
  }
}
