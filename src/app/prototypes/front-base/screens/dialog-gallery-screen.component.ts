import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import {
  PosTerminalShellComponent,
  PosMainScreenComponent,
  PosDialogComponent,
  PosDialogSize,
  PosNumpadComponent,
  PosKeyboardComponent,
  PosGuestCardComponent,
  PosInfoBannerComponent,
  PosStatusScreenComponent,
  PosConfirmComponent,
  PosActionListComponent,
  PosGuestListDialogComponent,
} from '@/components/pos-terminal';
import {
  GALLERY_TEMPLATES,
  GalleryTemplate,
  DEMO_GUEST_CARD_FIELDS,
  DEMO_INFO_BANNER_FIELDS,
  DEMO_ACTION_LIST_ITEMS,
} from '../data/gallery-demo-data';

/**
 * Галерея шаблонов диалогов — каталог всех доступных POS-шаблонов
 * с интерактивным превью поверх терминала.
 *
 * Layout: sidebar (каталог) + terminal (превью)
 */
@Component({
  selector: 'app-dialog-gallery-screen',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule,
    PosTerminalShellComponent,
    PosMainScreenComponent,
    PosDialogComponent,
    PosNumpadComponent,
    PosKeyboardComponent,
    PosGuestCardComponent,
    PosInfoBannerComponent,
    PosStatusScreenComponent,
    PosConfirmComponent,
    PosActionListComponent,
    PosGuestListDialogComponent,
  ],
  template: `
    <!-- Navigation bar -->
    <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
      <div class="flex items-center gap-3">
        <button (click)="goBack()"
                class="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800
                       transition-colors cursor-pointer font-medium">
          <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
          Назад к терминалу
        </button>
        <div class="w-px h-5 bg-gray-300"></div>
        <h2 class="text-sm font-semibold text-gray-800">Галерея шаблонов диалогов</h2>
        <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {{ templates.length }} шаблонов
        </span>
      </div>
    </div>

    <!-- Main content: sidebar + terminal -->
    <div class="flex" style="height: calc(100vh - 88px)">

      <!-- Left sidebar: template catalog -->
      <div class="w-72 flex-shrink-0 border-r border-gray-200 bg-gray-50/50 overflow-y-auto p-3 space-y-1.5">
        <div *ngFor="let t of templates"
             (click)="selectTemplate(t.id)"
             class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border"
             [class.bg-indigo-50]="selectedTemplate === t.id"
             [class.border-indigo-300]="selectedTemplate === t.id"
             [class.border-transparent]="selectedTemplate !== t.id"
             [class.hover:bg-gray-100]="selectedTemplate !== t.id">
          <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
               [class.bg-indigo-600]="selectedTemplate === t.id"
               [class.text-white]="selectedTemplate === t.id"
               [class.bg-gray-200]="selectedTemplate !== t.id"
               [class.text-gray-500]="selectedTemplate !== t.id">
            <lucide-icon [name]="t.icon" [size]="16"></lucide-icon>
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium truncate"
                 [class.text-indigo-800]="selectedTemplate === t.id"
                 [class.text-gray-700]="selectedTemplate !== t.id">
              {{ t.name }}
            </div>
            <div class="text-xs text-gray-500 mt-0.5 leading-snug">{{ t.description }}</div>
          </div>
        </div>
      </div>

      <!-- Right: terminal preview area -->
      <div class="flex-1 bg-gray-100 overflow-hidden">
        <pos-terminal-shell [showPlaceholder]="false"
                            [showBottomBar]="false"
                            [showNotificationArea]="false">
          <pos-main-screen posScreen></pos-main-screen>

          <!-- Hint overlay when no template selected -->
          <div *ngIf="!selectedTemplate"
               class="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <div class="bg-white/95 backdrop-blur rounded-xl shadow-lg px-8 py-6 text-center max-w-xs">
              <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                <lucide-icon name="mouse-pointer-click" [size]="24" class="text-indigo-500"></lucide-icon>
              </div>
              <p class="text-sm font-medium text-gray-700">Выберите шаблон</p>
              <p class="text-xs text-gray-400 mt-1">Диалог откроется поверх терминала</p>
            </div>
          </div>

          <!-- Dialog wrapper for templates 1-9 -->
          <pos-dialog *ngIf="isDialogTemplate"
                      [open]="true"
                      [maxWidth]="currentDialogSize"
                      (dialogClose)="closeDialog()">
            <ng-container [ngSwitch]="selectedTemplate">

              <!-- 1. Цифровая клавиатура -->
              <pos-numpad *ngSwitchCase="'numpad'"
                          [value]="demoNumpadValue"
                          label="Количество гостей"
                          placeholder="0"
                          (valueChange)="demoNumpadValue = $event"
                          (enter)="closeDialog()">
              </pos-numpad>

              <!-- 2. Экранная клавиатура -->
              <pos-keyboard *ngSwitchCase="'keyboard'"
                            [value]="demoKeyboardValue"
                            title="Поиск блюда в меню"
                            (valueChange)="demoKeyboardValue = $event"
                            (confirm)="closeDialog()"
                            (cancel)="closeDialog()">
              </pos-keyboard>

              <!-- 3. Карточка гостя -->
              <pos-guest-card *ngSwitchCase="'guest-card'"
                              title="Карточка гостя"
                              [fields]="demoGuestCardFields"
                              [actions]="['Начислить бонусы', 'Списать бонусы', 'История']"
                              (actionClick)="onDemoAction($event)">
              </pos-guest-card>

              <!-- 4. Информационный баннер -->
              <pos-info-banner *ngSwitchCase="'info-banner'"
                               title="Информация о лицензии"
                               icon="shield-check"
                               [fields]="demoInfoBannerFields"
                               (close)="closeDialog()">
              </pos-info-banner>

              <!-- 5. Статус: Успех -->
              <pos-status-screen *ngSwitchCase="'status-success'"
                                 status="success"
                                 title="Заказ создан"
                                 message="Заказ №1042 успешно отправлен на кухню"
                                 buttonLabel="Продолжить"
                                 (buttonClick)="closeDialog()">
              </pos-status-screen>

              <!-- 6. Статус: Ошибка -->
              <pos-status-screen *ngSwitchCase="'status-error'"
                                 status="error"
                                 title="Ошибка фискализации"
                                 message="Фискальный регистратор не отвечает. Проверьте подключение и повторите попытку."
                                 buttonLabel="Повторить"
                                 (buttonClick)="closeDialog()">
              </pos-status-screen>

              <!-- 7. Статус: Загрузка -->
              <pos-status-screen *ngSwitchCase="'status-loading'"
                                 status="loading"
                                 title="Отправка на кухню"
                                 message="Передаём заказ на станцию приготовления...">
              </pos-status-screen>

              <!-- 8. Подтверждение -->
              <pos-confirm *ngSwitchCase="'confirm'"
                           title="Удалить позицию?"
                           message="Вы уверены, что хотите удалить «Капучино 300 мл» из заказа?"
                           confirmLabel="Удалить"
                           cancelLabel="Отмена"
                           (confirm)="closeDialog()"
                           (cancel)="closeDialog()">
              </pos-confirm>

              <!-- 9. Список действий -->
              <pos-action-list *ngSwitchCase="'action-list'"
                               title="Способ идентификации гостя"
                               [items]="demoActionListItems"
                               (itemClick)="closeDialog()"
                               (cancel)="closeDialog()">
              </pos-action-list>

            </ng-container>
          </pos-dialog>

          <!-- 10. Список гостей (имеет собственный dialog) -->
          <pos-guest-list-dialog [open]="selectedTemplate === 'guest-list'"
                                 (dialogClose)="closeDialog()"
                                 (selectGuest)="closeDialog()"
                                 (skip)="closeDialog()">
          </pos-guest-list-dialog>

        </pos-terminal-shell>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class DialogGalleryScreenComponent {
  private router = inject(Router);

  templates = GALLERY_TEMPLATES;
  selectedTemplate: string | null = null;

  // Demo state
  demoNumpadValue = '';
  demoKeyboardValue = '';
  demoGuestCardFields = DEMO_GUEST_CARD_FIELDS;
  demoInfoBannerFields = DEMO_INFO_BANNER_FIELDS;
  demoActionListItems = DEMO_ACTION_LIST_ITEMS;

  /** Текущий шаблон — диалогового типа (не guest-list, который имеет свой wrapper) */
  get isDialogTemplate(): boolean {
    return !!this.selectedTemplate && this.selectedTemplate !== 'guest-list';
  }

  /** Размер pos-dialog для текущего шаблона */
  get currentDialogSize(): PosDialogSize {
    const tmpl = this.templates.find(t => t.id === this.selectedTemplate);
    return tmpl?.dialogSize || 'md';
  }

  selectTemplate(id: string): void {
    if (this.selectedTemplate === id) {
      this.selectedTemplate = null;
      return;
    }
    this.selectedTemplate = id;
    this.demoNumpadValue = '';
    this.demoKeyboardValue = '';
  }

  closeDialog(): void {
    this.selectedTemplate = null;
  }

  onDemoAction(_action: string): void {
    // В галерее просто закрываем диалог при нажатии на действие
  }

  goBack(): void {
    this.router.navigate(['/prototype/front-base']);
  }
}
