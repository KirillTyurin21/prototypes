import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiCheckboxComponent } from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { OperationCategory } from '../types';

@Component({
  selector: 'app-operation-category-list',
  standalone: true,
  imports: [CommonModule, UiCheckboxComponent, IconsModule],
  template: `
    <div class="space-y-2">
      <div
        *ngFor="let cat of categories; trackBy: trackById"
        class="flex items-start gap-3 px-4 py-3 border border-gray-200 rounded-lg transition-colors"
        [class.bg-gray-50]="mode === 'view' && !cat.allowed"
        [class.border-green-200]="cat.allowed"
        [class.bg-green-50/30]="cat.allowed">

        <lucide-icon
          [name]="cat.iconName"
          [size]="20"
          class="shrink-0 mt-0.5"
          [class.text-gray-400]="!cat.allowed"
          [class.text-green-600]="cat.allowed">
        </lucide-icon>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">{{ cat.label }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ cat.description }}</p>
        </div>

        <ui-checkbox
          *ngIf="mode === 'edit'"
          [checked]="cat.allowed"
          (checkedChange)="categoryToggle.emit(cat.id)"
          class="shrink-0">
        </ui-checkbox>

        <lucide-icon
          *ngIf="mode === 'view' && cat.allowed"
          name="check"
          [size]="18"
          class="text-green-500 shrink-0">
        </lucide-icon>
        <lucide-icon
          *ngIf="mode === 'view' && !cat.allowed"
          name="x"
          [size]="18"
          class="text-gray-300 shrink-0">
        </lucide-icon>
      </div>
    </div>

    <p *ngIf="categories.length === 0" class="text-center text-sm text-gray-400 py-4">
      Нет доступных категорий операций
    </p>
  `,
})
export class OperationCategoryListComponent {
  @Input() categories: OperationCategory[] = [];
  @Input() mode: 'edit' | 'view' = 'edit';

  @Output() categoryToggle = new EventEmitter<string>();

  trackById(_: number, item: OperationCategory): string {
    return item.id;
  }
}
