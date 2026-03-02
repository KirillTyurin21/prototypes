import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';
import { RegistrationState } from '../../types';

/** М19: Код регистрации (П8) — v1.10 N1 (холодная регистрация) */
@Component({
  selector: 'pudu-registration-code',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" (dialogClose)="onClose.emit()">
      <div class="space-y-4">
        <!-- Заголовок -->
        <div>
          <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">Подключение к NE</h2>
          <p class="text-base text-center text-gray-300">Введите код на портале NE Cloud</p>
        </div>

        <!-- Состояние: Генерация кода -->
        <div *ngIf="state === 'generating'" class="flex flex-col items-center space-y-4 py-8">
          <lucide-icon name="loader-2" class="text-gray-400 animate-spin" [size]="32"></lucide-icon>
          <span class="text-sm text-gray-400">Генерация кода подключения...</span>
        </div>

        <!-- Состояние: Код отображается -->
        <ng-container *ngIf="state === 'code_displayed'">
          <div class="flex flex-col items-center space-y-6">
            <!-- Код крупным шрифтом -->
            <div class="bg-[#2d2d2d] rounded-lg px-8 py-6 text-center">
              <div class="text-4xl font-mono font-bold tracking-[0.3em] text-[#b8c959]">
                {{ code }}
              </div>
            </div>

            <!-- Таймер TTL -->
            <div class="flex items-center gap-2 text-sm"
                 [ngClass]="timerSeconds > 60 ? 'text-gray-300' : 'text-orange-400'">
              <lucide-icon name="clock" [size]="16"></lucide-icon>
              <span>Код действителен ещё {{ formatTimer(timerSeconds) }}</span>
            </div>

            <!-- Инструкция -->
            <div class="bg-[#2d2d2d] rounded px-4 py-3 text-sm text-gray-300 text-center w-full">
              <p>Откройте портал NE Cloud и введите этот код</p>
              <p *ngIf="codeUrl" class="text-xs text-gray-400 mt-2 font-mono break-all">{{ codeUrl }}</p>
            </div>
          </div>

          <!-- Footer: кнопки -->
          <div class="flex gap-3 mt-8">
            <button
              class="flex-1 h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white text-sm transition-colors"
              (click)="onClose.emit()">
              Закрыть
            </button>
            <button
              class="flex-1 h-14 rounded bg-[#b8c959] hover:bg-[#c5d466] text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
              (click)="onCopyCode.emit()">
              <lucide-icon name="copy" [size]="16"></lucide-icon>
              Копировать код
            </button>
          </div>
        </ng-container>

        <!-- Состояние: Код истёк -->
        <ng-container *ngIf="state === 'code_expired'">
          <div class="flex flex-col items-center space-y-4 py-6">
            <div class="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <lucide-icon name="clock" class="text-orange-400" [size]="24"></lucide-icon>
            </div>
            <p class="text-sm text-gray-300 text-center">Код истёк. Сгенерируйте новый.</p>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              class="flex-1 h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white text-sm transition-colors"
              (click)="onClose.emit()">
              Закрыть
            </button>
            <button
              class="flex-1 h-14 rounded bg-[#b8c959] hover:bg-[#c5d466] text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
              (click)="onRegenerate.emit()">
              <lucide-icon name="refresh-cw" [size]="16"></lucide-icon>
              Обновить код
            </button>
          </div>
        </ng-container>

        <!-- Состояние: Регистрация успешна -->
        <ng-container *ngIf="state === 'success'">
          <div class="flex flex-col items-center space-y-4 py-6">
            <div class="w-12 h-12 rounded-full bg-[#b8c959]/20 flex items-center justify-center">
              <lucide-icon name="check-circle-2" class="text-[#b8c959]" [size]="24"></lucide-icon>
            </div>
            <p class="text-base text-white font-medium text-center">Успешно подключено к NE Cloud</p>
            <p class="text-sm text-gray-400 text-center">Настройки будут загружены автоматически</p>
          </div>

          <div class="mt-6">
            <button
              class="w-full h-14 rounded bg-[#b8c959] hover:bg-[#c5d466] text-black font-bold text-sm transition-colors"
              (click)="onClose.emit()">
              Готово
            </button>
          </div>
        </ng-container>

        <!-- Состояние: Ошибка -->
        <ng-container *ngIf="state === 'error'">
          <div class="flex flex-col items-center space-y-4 py-6">
            <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <lucide-icon name="alert-circle" class="text-red-400" [size]="24"></lucide-icon>
            </div>
            <p class="text-sm text-gray-300 text-center">{{ errorMessage }}</p>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              class="flex-1 h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white text-sm transition-colors"
              (click)="onClose.emit()">
              Закрыть
            </button>
            <button
              class="flex-1 h-14 rounded bg-[#b8c959] hover:bg-[#c5d466] text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
              (click)="onRetry.emit()">
              <lucide-icon name="refresh-cw" [size]="16"></lucide-icon>
              Повторить
            </button>
          </div>
        </ng-container>

        <!-- Состояние: Уже зарегистрирован -->
        <ng-container *ngIf="state === 'already_registered'">
          <div class="flex flex-col items-center space-y-4 py-6">
            <div class="w-12 h-12 rounded-full bg-[#b8c959]/20 flex items-center justify-center">
              <lucide-icon name="info" class="text-[#b8c959]" [size]="24"></lucide-icon>
            </div>
            <p class="text-base text-white font-medium text-center">Ресторан уже подключён к NE</p>
            <p class="text-sm text-gray-400 text-center">Повторная регистрация не требуется</p>
          </div>

          <div class="mt-6">
            <button
              class="w-full h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white text-sm transition-colors"
              (click)="onClose.emit()">
              Закрыть
            </button>
          </div>
        </ng-container>
      </div>
    </pudu-pos-dialog>
  `,
})
export class RegistrationCodeComponent {
  @Input() open = false;
  @Input() state: RegistrationState = 'generating';
  @Input() code = '';
  @Input() codeUrl = '';
  @Input() timerSeconds = 0;
  @Input() errorMessage = '';
  @Output() onClose = new EventEmitter<void>();
  @Output() onCopyCode = new EventEmitter<void>();
  @Output() onRegenerate = new EventEmitter<void>();
  @Output() onRetry = new EventEmitter<void>();

  formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
