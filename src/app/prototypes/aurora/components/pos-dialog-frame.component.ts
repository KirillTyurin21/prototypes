import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pos-dialog-frame',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/60" (click)="onCancel()"></div>
      <!-- Dialog -->
      <div class="relative bg-[#3a3a3a] text-white w-full mx-4 animate-scale-in"
           [ngClass]="{'max-w-[350px]': size === 'sm', 'max-w-[500px]': size === 'md', 'max-w-[600px]': size === 'lg'}"
           (click)="$event.stopPropagation()">
        <!-- Title -->
        <div class="px-6 pt-6 pb-2">
          <h2 class="text-[#b8c959] text-xl font-bold text-center">{{ title }}</h2>
        </div>
        <!-- Content -->
        <div class="px-6 py-4 text-gray-300 text-sm leading-relaxed">
          <ng-content></ng-content>
        </div>
        <!-- Buttons -->
        <div *ngIf="showButtons" class="border-t border-white/10">
          <div class="flex">
            <button
              class="flex-1 py-4 text-center text-white font-bold text-base bg-[#2d2d2d] hover:bg-[#333] transition-colors border-r border-white/10"
              (click)="onOk()"
              [disabled]="okDisabled"
              [class.opacity-40]="okDisabled"
              [class.cursor-not-allowed]="okDisabled"
            >{{ okText }}</button>
            <button
              class="flex-1 py-4 text-center text-white font-bold text-base bg-[#2d2d2d] hover:bg-[#333] transition-colors"
              (click)="onCancel()"
            >{{ cancelText }}</button>
          </div>
        </div>
        <!-- Single OK button -->
        <div *ngIf="showSingleOk" class="border-t border-white/10">
          <button
            class="w-full py-4 text-center text-white font-bold text-base bg-[#2d2d2d] hover:bg-[#333] transition-colors"
            (click)="onOk()"
          >{{ okText }}</button>
        </div>
      </div>
    </div>
  `,
})
export class PosDialogFrameComponent {
  @Input() title = '';
  @Input() showButtons = true;
  @Input() showSingleOk = false;
  @Input() okDisabled = false;
  @Input() okText = 'ОК';
  @Input() cancelText = 'Отмена';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() ok = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onOk(): void {
    this.ok.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
