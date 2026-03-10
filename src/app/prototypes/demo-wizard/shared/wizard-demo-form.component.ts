import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiButtonComponent,
  UiCardComponent,
  UiCardTitleComponent,
  UiInputComponent,
  UiTextareaComponent,
  UiSelectComponent,
  UiCheckboxComponent,
  UiToggleComponent,
  UiModalComponent,
  UiAlertComponent,
  UiDividerComponent,
} from '@/components/ui/index';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'wizard-demo-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiCardTitleComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiSelectComponent,
    UiCheckboxComponent,
    UiToggleComponent,
    UiModalComponent,
    UiAlertComponent,
    UiDividerComponent,
    IconsModule,
  ],
  template: `
    <div class="max-w-2xl">
      <div class="mb-6">
        <h2 class="text-xl font-medium text-text-primary">Создание элемента</h2>
        <p class="text-sm text-text-secondary mt-1">Заполните форму и нажмите «Сохранить».</p>
      </div>

      <form (ngSubmit)="handleSubmit()">
        <ui-card padding="lg">
          <ui-card-title>Основная информация</ui-card-title>
          <div class="mt-4 space-y-4">
            <ui-input
              data-demo="input-name"
              label="Наименование"
              placeholder="Введите наименование..."
              [(value)]="name"
              [error]="errors['name']"
            ></ui-input>

            <div class="grid grid-cols-2 gap-4">
              <ui-select
                data-demo="select-category"
                label="Категория"
                [(value)]="category"
                placeholder="Выберите..."
                [error]="errors['category']"
                [options]="categoryOptions"
              ></ui-select>
              <ui-input
                data-demo="input-price"
                label="Цена, ₽"
                placeholder="0"
                type="number"
                [(value)]="price"
                [error]="errors['price']"
              ></ui-input>
            </div>

            <ui-textarea
              data-demo="textarea-desc"
              label="Описание"
              placeholder="Краткое описание элемента..."
              [(value)]="description"
              hint="Необязательное поле"
            ></ui-textarea>

            <ui-divider></ui-divider>

            <div class="space-y-3">
              <ui-toggle
                data-demo="toggle-active"
                label="Активен"
                [checked]="isActive"
                (checkedChange)="isActive = $event"
              ></ui-toggle>
              <ui-checkbox
                data-demo="checkbox-publish"
                label="Опубликовать на сайте"
                [checked]="isPublished"
                (checkedChange)="isPublished = $event"
              ></ui-checkbox>
            </div>

            <ui-alert *ngIf="hasErrors" variant="error" title="Ошибка валидации">
              Заполните все обязательные поля корректно.
            </ui-alert>
          </div>
        </ui-card>

        <div class="mt-4 flex items-center justify-end">
          <ui-button
            data-demo="btn-save"
            type="submit"
            variant="primary"
            iconName="save"
          >Сохранить</ui-button>
        </div>
      </form>

      <ui-modal
        data-demo="modal-success"
        [open]="successModal"
        (modalClose)="successModal = false"
        title="Готово"
        size="sm"
      >
        <div class="flex flex-col items-center py-4">
          <lucide-icon name="check-circle-2" [size]="48" class="text-app-success mb-3"></lucide-icon>
          <p class="text-text-primary font-medium">Элемент успешно создан!</p>
          <p class="text-sm text-text-secondary mt-1">{{ name }} — {{ price }} ₽</p>
        </div>
        <div modalFooter>
          <ui-button
            data-demo="btn-modal-home"
            variant="primary"
            (click)="onSuccess()"
          >Вернуться на главный экран</ui-button>
        </div>
      </ui-modal>
    </div>
  `,
})
export class WizardDemoFormComponent {
  @Output() demoComplete = new EventEmitter<void>();

  name = '';
  category = '';
  price = '';
  description = '';
  isActive = false;
  isPublished = false;
  errors: Record<string, string> = {};
  successModal = false;

  categoryOptions = [
    { value: 'pizza', label: 'Пицца' },
    { value: 'salads', label: 'Салаты' },
    { value: 'soups', label: 'Супы' },
    { value: 'drinks', label: 'Напитки' },
    { value: 'desserts', label: 'Десерты' },
  ];

  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  validate(): boolean {
    this.errors = {};

    if (!this.name.trim()) {
      this.errors['name'] = 'Введите наименование';
    }
    if (!this.category) {
      this.errors['category'] = 'Выберите категорию';
    }
    const priceNum = Number(this.price);
    if (!this.price || isNaN(priceNum) || priceNum <= 0) {
      this.errors['price'] = 'Введите корректную цену';
    }

    return Object.keys(this.errors).length === 0;
  }

  handleSubmit(): void {
    if (this.validate()) {
      this.successModal = true;
    }
  }

  onSuccess(): void {
    this.successModal = false;
    this.demoComplete.emit();
  }

  resetForm(): void {
    this.name = '';
    this.category = '';
    this.price = '';
    this.description = '';
    this.isActive = false;
    this.isPublished = false;
    this.errors = {};
    this.successModal = false;
  }
}
