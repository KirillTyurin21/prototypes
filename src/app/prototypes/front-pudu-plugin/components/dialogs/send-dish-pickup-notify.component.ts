import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';
import { MockDish } from '../../data/mock-data';

/** М15: Уведомление на терминале раздачи о прибытии робота */
@Component({
  selector: 'pudu-send-dish-pickup-notify',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="md" (dialogClose)="onDismiss.emit()">
      <div class="space-y-5 mb-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-amber-400 text-center mb-2">Робот прибыл на раздачу</h2>
          <p class="text-base text-center text-gray-300">Загрузите блюда на робота</p>
        </div>

        <!-- Icon + robot info -->
        <div class="flex flex-col items-center text-center space-y-3">
          <div class="rounded-full bg-amber-500/20 p-6">
            <lucide-icon name="chef-hat" [size]="48" class="text-amber-400"></lucide-icon>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-amber-100">{{ robotName }}</span>
            <span class="text-xs bg-amber-600/30 text-amber-300 rounded px-2 py-0.5">
              Рейс {{ tripNumber }}/{{ totalTrips }}
            </span>
          </div>
        </div>

        <!-- Table info -->
        <div class="bg-amber-900/30 border border-amber-600/40 rounded p-4">
          <div class="flex justify-between mb-2">
            <span class="text-sm text-amber-300">Стол</span>
            <span class="text-sm font-medium text-white">{{ tableName }}</span>
          </div>
          <div class="space-y-1">
            <div *ngFor="let dish of dishes" class="flex items-center gap-2 text-sm text-amber-200">
              <span class="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></span>
              <span class="flex-1">{{ dish.name }}</span>
              <span class="text-amber-400">× {{ dish.quantity }}</span>
            </div>
          </div>
        </div>

        <!-- Timer -->
        <div class="text-center">
          <p class="text-xs text-gray-400 mb-1">Робот уедет через</p>
          <p class="text-3xl font-bold text-amber-400">{{ formatTime(countdown) }}</p>
        </div>

        <!-- Progress bar -->
        <div class="h-1 bg-amber-800/50 rounded-full overflow-hidden">
          <div class="h-full bg-amber-400 rounded-full transition-all duration-1000"
               [style.width.%]="progressPercent"></div>
        </div>
      </div>

      <!-- Footer -->
      <button (click)="onDismiss.emit()"
        class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors">
        Закрыть
      </button>
    </pudu-pos-dialog>
  `,
})
export class SendDishPickupNotifyComponent implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() robotName = '';
  @Input() tableName = '';
  @Input() dishes: MockDish[] = [];
  @Input() tripNumber = 1;
  @Input() totalTrips = 1;
  @Input() pickupWaitTime = 60;
  @Output() onDismiss = new EventEmitter<void>();
  @Output() onTimeout = new EventEmitter<void>();

  countdown = 60;
  private intervalId: any = null;

  get progressPercent(): number {
    return (this.countdown / this.pickupWaitTime) * 100;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    this.countdown = this.pickupWaitTime;
    this.stopTimer();
    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.stopTimer();
        this.onTimeout.emit();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
