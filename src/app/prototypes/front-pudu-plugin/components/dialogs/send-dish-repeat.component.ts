import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';

/** М16: Повторить доставку? (v1.9 M1, П-11 — упрощённый confirm) */
@Component({
  selector: 'pudu-send-dish-repeat',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="sm" (dialogClose)="onCancel.emit()">
      <div class="space-y-5 mb-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-amber-400 text-center mb-2">Повторить доставку?</h2>
        </div>

        <!-- Icon -->
        <div class="flex flex-col items-center text-center space-y-3">
          <div class="rounded-full bg-amber-500/20 p-6">
            <lucide-icon name="repeat" [size]="48" class="text-amber-400"></lucide-icon>
          </div>
        </div>

        <!-- Info: только стол -->
        <div class="bg-white text-black p-4 rounded space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Стол</span>
            <span class="text-sm font-medium">{{ tableName }}</span>
          </div>
          <div class="text-sm text-gray-500 mt-2">
            Любой свободный робот повторит доставку блюд к столу {{ tableName }}.
          </div>
        </div>
      </div>

      <!-- Footer: v1.9 M1 — «Уехать» / «Повторить» -->
      <div class="grid grid-cols-2 gap-3">
        <button (click)="onCancel.emit()"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
          Уехать
        </button>
        <button (click)="onConfirm.emit()"
          [disabled]="isSubmitting"
          class="h-14 rounded text-base font-bold transition-colors"
          [ngClass]="isSubmitting ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700'">
          <span *ngIf="!isSubmitting">Повторить</span>
          <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
            <lucide-icon name="loader-2" [size]="20" class="animate-spin"></lucide-icon>
            Отправка...
          </span>
        </button>
      </div>
    </pudu-pos-dialog>
  `,
})
export class SendDishRepeatComponent {
  @Input() open = false;
  @Input() tableName = '';
  @Input() isSubmitting = false;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();
}
