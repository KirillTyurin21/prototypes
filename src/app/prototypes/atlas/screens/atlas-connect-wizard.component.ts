import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiBreadcrumbsComponent,
  UiButtonComponent,
  UiCardComponent,
  UiCardContentComponent,
  UiCheckboxComponent,
  UiInputComponent,
  UiModalComponent,
  UiConfirmDialogComponent,
  UiAlertComponent,
  UiDividerComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import {
  PaymentIntegration,
  OperationCategory,
  RestaurantNode,
  FieldConfig,
  AccountType,
} from '../types';
import { MOCK_INTEGRATIONS, MOCK_CHAIN_RESTAURANTS, MOCK_RMS_RESTAURANT } from '../data/mock-data';
import { RestaurantTreeComponent } from '../components/restaurant-tree.component';
import { OperationCategoryListComponent } from '../components/operation-category-list.component';
import { PaymentTypeSummaryComponent } from '../components/payment-type-summary.component';

@Component({
  selector: 'app-atlas-connect-wizard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    UiBreadcrumbsComponent, UiButtonComponent, UiCardComponent, UiCardContentComponent,
    UiCheckboxComponent, UiInputComponent, UiModalComponent, UiConfirmDialogComponent,
    UiAlertComponent, UiDividerComponent,
    RestaurantTreeComponent, OperationCategoryListComponent, PaymentTypeSummaryComponent,
    IconsModule,
  ],
  template: `
    <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

    <div class="max-w-2xl mx-auto px-6 pb-8 animate-fade-in">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-xl font-semibold text-gray-900">{{ integration?.name }}</h1>
        <p class="text-sm text-gray-500 mt-1">Мастер подключения платёжной системы</p>
      </div>

      <!-- Stepper -->
      <div class="flex items-center gap-1 mb-8 overflow-x-auto">
        <ng-container *ngFor="let step of stepLabels; let i = index">
          <div class="flex items-center gap-1 shrink-0">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors"
              [class.bg-gray-900]="i + 1 === currentStep"
              [class.text-white]="i + 1 === currentStep"
              [class.bg-green-500]="i + 1 < currentStep"
              [class.text-white]="i + 1 < currentStep"
              [class.bg-gray-200]="i + 1 > currentStep"
              [class.text-gray-500]="i + 1 > currentStep">
              <lucide-icon *ngIf="i + 1 < currentStep" name="check" [size]="12"></lucide-icon>
              <span *ngIf="i + 1 >= currentStep">{{ i + 1 }}</span>
            </div>
            <span
              class="text-xs hidden sm:inline"
              [class.text-gray-900]="i + 1 <= currentStep"
              [class.text-gray-400]="i + 1 > currentStep">
              {{ step }}
            </span>
          </div>
          <div
            *ngIf="i < stepLabels.length - 1"
            class="w-6 h-px shrink-0"
            [class.bg-gray-300]="i + 1 >= currentStep"
            [class.bg-gray-200]="i + 1 < currentStep">
          </div>
        </ng-container>
      </div>

      <!-- STEP 1: Consent -->
      <div *ngIf="currentStep === 1">
        <ui-card>
          <ui-card-content>
            <h2 class="text-base font-semibold text-gray-900 mb-3">Согласие на подключение</h2>

            <ui-alert variant="info" class="mb-4">
              Вы даёте согласие на подключение к платёжному сервису <strong>{{ integration?.name }}</strong>.
              После подтверждения будет автоматически создан тип оплаты
              <ng-container *ngIf="integration?.discount">и связанная скидка</ng-container>.
            </ui-alert>

            <!-- Preview of what will be created -->
            <div class="mb-4">
              <app-payment-type-summary
                [paymentType]="integration?.paymentType || null"
                [discount]="integration?.discount || null">
              </app-payment-type-summary>
            </div>

            <ui-checkbox
              label="Я принимаю условия подключения и даю согласие на автоматическое создание типа оплаты"
              [checked]="consentAccepted"
              (checkedChange)="consentAccepted = $event">
            </ui-checkbox>
          </ui-card-content>
        </ui-card>

        <div class="flex justify-between mt-6">
          <ui-button variant="ghost" (click)="cancelWizard()">Отказаться</ui-button>
          <ui-button [disabled]="!consentAccepted" (click)="nextStep()">Продолжить</ui-button>
        </div>
      </div>

      <!-- STEP 2: Restaurants -->
      <div *ngIf="currentStep === 2 && accountType === 'chain'">
        <ui-card>
          <ui-card-content>
            <h2 class="text-base font-semibold text-gray-900 mb-1">Выберите рестораны для подключения</h2>
            <p class="text-sm text-gray-500 mb-4">
              Отметьте рестораны, в которых будет активирован {{ integration?.name }}.
              Можно подключить все сразу или выбрать отдельные для пилота.
            </p>

            <app-restaurant-tree
              [restaurants]="wizardRestaurants"
              mode="edit"
              (selectionChange)="onRestaurantChange($event)">
            </app-restaurant-tree>
          </ui-card-content>
        </ui-card>

        <div class="flex justify-between mt-6">
          <ui-button variant="ghost" (click)="cancelWizard()">Отмена</ui-button>
          <div class="flex gap-2">
            <ui-button variant="outline" (click)="prevStep()">Назад</ui-button>
            <ui-button [disabled]="selectedRestaurantCount === 0" (click)="nextStep()">Далее</ui-button>
          </div>
        </div>
      </div>

      <!-- STEP 2 skipped for RMS -->
      <div *ngIf="currentStep === 2 && accountType === 'rms'" class="text-center py-8">
        <p class="text-sm text-gray-500">У вас одно торговое предприятие — подключение будет выполнено для него автоматически.</p>
        <div class="flex justify-between mt-6">
          <ui-button variant="ghost" (click)="cancelWizard()">Отмена</ui-button>
          <div class="flex gap-2">
            <ui-button variant="outline" (click)="prevStep()">Назад</ui-button>
            <ui-button (click)="nextStep()">Далее</ui-button>
          </div>
        </div>
      </div>

      <!-- STEP 3: Operations -->
      <div *ngIf="currentStep === 3">
        <!-- Restaurant selector (if multiple selected) -->
        <div *ngIf="selectedRestaurantList.length > 1" class="mb-4">
          <label class="block text-xs font-medium text-gray-500 mb-2">Настроить операции для:</label>
          <div class="flex flex-wrap gap-1">
            <button
              (click)="selectRestaurant('all')"
              class="px-3 py-1.5 text-xs rounded-md transition-colors border"
              [class.bg-gray-900]="selectedRestaurantId === 'all'"
              [class.text-white]="selectedRestaurantId === 'all'"
              [class.border-gray-300]="selectedRestaurantId !== 'all'"
              [class.text-gray-600]="selectedRestaurantId !== 'all'"
              [class.hover:bg-gray-50]="selectedRestaurantId !== 'all'">
              Все рестораны ({{ selectedRestaurantCount }})
            </button>
            <button
              *ngFor="let r of selectedRestaurantList"
              (click)="selectRestaurant(r.id)"
              class="px-3 py-1.5 text-xs rounded-md transition-colors border truncate max-w-[200px]"
              [class.bg-gray-900]="selectedRestaurantId === r.id"
              [class.text-white]="selectedRestaurantId === r.id"
              [class.border-gray-300]="selectedRestaurantId !== r.id"
              [class.text-gray-600]="selectedRestaurantId !== r.id"
              [class.hover:bg-gray-50]="selectedRestaurantId !== r.id"
              [title]="r.name">
              {{ r.name }}
              <span
                *ngIf="isRestaurantCustomized(r.id)"
                class="ml-1 text-[10px]"
                [class.text-amber-300]="selectedRestaurantId === r.id"
                [class.text-amber-500]="selectedRestaurantId !== r.id">⚙</span>
            </button>
          </div>
          <p *ngIf="selectedRestaurantId !== 'all'" class="text-xs text-amber-600 mt-1.5">
            Настройки применяются только к выбранному ресторану
          </p>
          <p *ngIf="selectedRestaurantId === 'all'" class="text-xs text-gray-400 mt-1.5">
            Одинаковые настройки для всех выбранных ресторанов
          </p>
        </div>

        <ui-card>
          <ui-card-content>
            <h2 class="text-base font-semibold text-gray-900 mb-1">
              {{ selectedRestaurantId === 'all' ? 'Какие операции разрешить?' : 'Операции для «' + getRestaurantName(selectedRestaurantId) + '»' }}
            </h2>
            <p class="text-sm text-gray-500 mb-4">
              Отметьте категории операций, которые {{ integration?.name }} может выполнять.
            </p>

            <app-operation-category-list
              [categories]="currentEditingCategories"
              mode="edit"
              (categoryToggle)="toggleCategory($event)">
            </app-operation-category-list>

            <p *ngIf="currentEditingHasNoAllowed" class="text-xs text-amber-600 mt-3">
              Выберите хотя бы одну категорию операций
            </p>
          </ui-card-content>
        </ui-card>

        <div class="flex justify-between mt-6">
          <ui-button variant="ghost" (click)="cancelWizard()">Отмена</ui-button>
          <div class="flex gap-2">
            <ui-button variant="outline" (click)="prevStep()">Назад</ui-button>
            <ui-button [disabled]="!hasAnyCategoryAllowed" (click)="nextStep()">Далее</ui-button>
          </div>
        </div>
      </div>

      <!-- STEP 4: Credentials (conditional) -->
      <div *ngIf="currentStep === 4 && hasRequiredFields">
        <!-- Restaurant selector (if multiple selected) -->
        <div *ngIf="selectedRestaurantList.length > 1" class="mb-4">
          <label class="block text-xs font-medium text-gray-500 mb-2">Настроить реквизиты для:</label>
          <div class="flex flex-wrap gap-1">
            <button
              (click)="selectRestaurant('all')"
              class="px-3 py-1.5 text-xs rounded-md transition-colors border"
              [class.bg-gray-900]="selectedRestaurantId === 'all'"
              [class.text-white]="selectedRestaurantId === 'all'"
              [class.border-gray-300]="selectedRestaurantId !== 'all'"
              [class.text-gray-600]="selectedRestaurantId !== 'all'"
              [class.hover:bg-gray-50]="selectedRestaurantId !== 'all'">
              Все рестораны
            </button>
            <button
              *ngFor="let r of selectedRestaurantList"
              (click)="selectRestaurant(r.id)"
              class="px-3 py-1.5 text-xs rounded-md transition-colors border truncate max-w-[200px]"
              [class.bg-gray-900]="selectedRestaurantId === r.id"
              [class.text-white]="selectedRestaurantId === r.id"
              [class.border-gray-300]="selectedRestaurantId !== r.id"
              [class.text-gray-600]="selectedRestaurantId !== r.id"
              [class.hover:bg-gray-50]="selectedRestaurantId !== r.id"
              [title]="r.name">
              {{ r.name }}
            </button>
          </div>
        </div>

        <ui-card>
          <ui-card-content>
            <h2 class="text-base font-semibold text-gray-900 mb-1">
              {{ selectedRestaurantId === 'all' ? 'Реквизиты подключения' : 'Реквизиты для «' + getRestaurantName(selectedRestaurantId) + '»' }}
            </h2>
            <p class="text-sm text-gray-500 mb-4">
              Введите данные, необходимые для подключения к {{ integration?.name }}.
            </p>

            <div class="space-y-4">
              <div *ngFor="let field of integration?.requiredFields">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ field.label }}
                  <span *ngIf="field.required" class="text-red-500 ml-0.5">*</span>
                </label>
                <div class="relative">
                  <input
                    [type]="field.type === 'password' && !showPassword ? 'password' : 'text'"
                    [placeholder]="field.placeholder || ''"
                    [(ngModel)]="currentEditingCredentials[field.key]"
                    class="w-full h-9 px-3 pr-9 text-sm border border-gray-300 rounded-md bg-white
                           placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10
                           focus:border-gray-400 transition-all" />
                  <button
                    *ngIf="field.type === 'password'"
                    (click)="showPassword = !showPassword"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    type="button">
                    <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></lucide-icon>
                  </button>
                </div>
                <p *ngIf="field.helpText" class="text-xs text-gray-400 mt-1">{{ field.helpText }}</p>
              </div>
            </div>
          </ui-card-content>
        </ui-card>

        <div class="flex justify-between mt-6">
          <ui-button variant="ghost" (click)="cancelWizard()">Отмена</ui-button>
          <div class="flex gap-2">
            <ui-button variant="outline" (click)="prevStep()">Назад</ui-button>
            <ui-button [disabled]="!isCredentialsValid()" (click)="nextStep()">Далее</ui-button>
          </div>
        </div>
      </div>

      <!-- STEP 4 skipped if no fields -->
      <div *ngIf="currentStep === 4 && !hasRequiredFields">
        <!-- Auto-skip: we just show nothing and let next/prev handle it -->
        <!-- This block is reached only briefly during transition -->
      </div>

      <!-- STEP 5: Confirmation -->
      <div *ngIf="currentStep === totalSteps">
        <ui-card>
          <ui-card-content class="space-y-4">
            <h2 class="text-base font-semibold text-gray-900">Подтверждение подключения</h2>

            <!-- Summary -->
            <div class="space-y-2 text-sm">
              <div class="flex justify-between py-1.5 border-b border-gray-100">
                <span class="text-gray-500">Система</span>
                <span class="font-medium text-gray-900">{{ integration?.name }}</span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-gray-100">
                <span class="text-gray-500">Рестораны</span>
                <span class="font-medium text-gray-900">
                  {{ accountType === 'rms' ? '1 (RMS)' : 'выбрано ' + selectedRestaurantCount + ' из ' + totalRestaurantCount }}
                </span>
              </div>
              <div class="flex justify-between py-1.5 border-b border-gray-100">
                <span class="text-gray-500">Разрешённые операции</span>
                <span class="font-medium text-gray-900">
                  <ng-container *ngFor="let cat of allowedCategories; let last = last">
                    {{ cat.label }}<ng-container *ngIf="!last">, </ng-container>
                  </ng-container>
                  <span *ngIf="allowedCategories.length === 0" class="text-red-500">не выбраны</span>
                </span>
              </div>
              <div *ngIf="hasRequiredFields" class="flex justify-between py-1.5 border-b border-gray-100">
                <span class="text-gray-500">Реквизиты</span>
                <span class="font-medium text-gray-900">заполнены</span>
              </div>
              <div *ngIf="customSettingsCount > 0" class="flex justify-between py-1.5 border-b border-gray-100">
                <span class="text-gray-500">Индивидуальные настройки</span>
                <span class="font-medium text-amber-700">{{ customSettingsCount }} ресторанов</span>
              </div>
            </div>

            <ui-divider></ui-divider>

            <!-- What will be created -->
            <app-payment-type-summary
              [paymentType]="integration?.paymentType || null"
              [discount]="integration?.discount || null">
            </app-payment-type-summary>

            <ui-alert variant="info">
              После подтверждения будет автоматически создан тип оплаты
              <ng-container *ngIf="integration?.discount">и скидка</ng-container>.
              Плагин на терминале Front получит новые настройки при следующем опросе (до 60 сек).
            </ui-alert>
          </ui-card-content>
        </ui-card>

        <div class="flex justify-between mt-6">
          <ui-button variant="ghost" (click)="cancelWizard()">Отмена</ui-button>
          <div class="flex gap-2">
            <ui-button variant="outline" (click)="prevStep()">Назад</ui-button>
            <ui-button [loading]="isSubmitting" (click)="submitConnection()">
              Подтвердить и подключить
            </ui-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <ui-modal [open]="showSuccessModal" (modalClose)="finishWizard()" title="Подключение выполнено" size="sm">
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <lucide-icon name="check" [size]="20" class="text-green-600"></lucide-icon>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ integration?.name }} успешно подключен</p>
            <p class="text-xs text-gray-500">
              {{ accountType === 'rms' ? '1 ресторан' : selectedRestaurantCount + ' ресторанов' }}
              &middot; {{ allowedCategoryCount }} категорий операций
            </p>
          </div>
        </div>
        <div class="flex justify-end">
          <ui-button (click)="finishWizard()">Перейти к настройкам</ui-button>
        </div>
      </div>
    </ui-modal>

    <!-- Cancel Confirm -->
    <ui-confirm-dialog
      [open]="showCancelConfirm"
      title="Отменить подключение?"
      message="Все введённые данные будут потеряны."
      confirmText="Отменить"
      variant="danger"
      (confirmed)="confirmCancel()"
      (cancelled)="showCancelConfirm = false">
    </ui-confirm-dialog>
  `,
})
export class AtlasConnectWizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);

  // Integration data
  integration: PaymentIntegration | null = null;
  integrationId = '';

  // Wizard state
  currentStep = 1;
  consentAccepted = false;
  accountType: AccountType = 'chain';
  wizardRestaurants: RestaurantNode[] = [];
  wizardCategories: OperationCategory[] = [];
  credentials: Record<string, string> = {};
  selectedRestaurantId: string | 'all' = 'all';
  showPassword = false;

  // UI state
  isSubmitting = false;
  showSuccessModal = false;
  showCancelConfirm = false;

  get hasRequiredFields(): boolean {
    return (this.integration?.requiredFields?.length ?? 0) > 0;
  }

  get totalSteps(): number {
    // Steps: 1=consent, 2=restaurants, 3=operations, 4=credentials(conditional), 5=confirm
    return this.hasRequiredFields ? 5 : 4;
  }

  get stepLabels(): string[] {
    const labels = ['Согласие', 'Рестораны', 'Операции'];
    if (this.hasRequiredFields) labels.push('Реквизиты');
    labels.push('Подтверждение');
    return labels;
  }

  get selectedRestaurantCount(): number {
    let count = 0;
    const countChecked = (nodes: RestaurantNode[]): void => {
      for (const n of nodes) {
        if (!n.children && n.isConnected) count++;
        if (n.children) countChecked(n.children);
      }
    };
    countChecked(this.wizardRestaurants);
    return count;
  }

  get totalRestaurantCount(): number {
    let count = 0;
    const countAll = (nodes: RestaurantNode[]): void => {
      for (const n of nodes) {
        if (!n.children) count++;
        if (n.children) countAll(n.children);
      }
    };
    countAll(this.wizardRestaurants);
    return count;
  }

  get allowedCategories(): OperationCategory[] {
    return this.wizardCategories.filter(c => c.allowed);
  }

  get allowedCategoryCount(): number {
    return this.allowedCategories.length;
  }

  /** List of selected (checked) restaurant leaf nodes */
  get selectedRestaurantList(): { id: string; name: string }[] {
    const result: { id: string; name: string }[] = [];
    const collect = (nodes: RestaurantNode[]): void => {
      for (const n of nodes) {
        if (!n.children && n.isConnected) result.push({ id: n.id, name: n.name });
        if (n.children) collect(n.children);
      }
    };
    collect(this.wizardRestaurants);
    return result;
  }

  /** Categories currently being edited (global or per-restaurant) */
  get currentEditingCategories(): OperationCategory[] {
    if (this.selectedRestaurantId === 'all') return this.wizardCategories;
    const restaurant = this.findRestaurant(this.selectedRestaurantId);
    if (!restaurant) return this.wizardCategories;
    // Lazy-init custom categories from global template
    if (!restaurant.customOperationCategories) {
      restaurant.customOperationCategories = this.wizardCategories.map(c => ({ ...c }));
    }
    return restaurant.customOperationCategories;
  }

  /** Credentials currently being edited (global or per-restaurant) */
  get currentEditingCredentials(): Record<string, string> {
    if (this.selectedRestaurantId === 'all') return this.credentials;
    const restaurant = this.findRestaurant(this.selectedRestaurantId);
    if (!restaurant) return this.credentials;
    if (!restaurant.customCredentials) {
      restaurant.customCredentials = { ...this.credentials };
    }
    return restaurant.customCredentials;
  }

  /** Count of restaurants with custom (non-global) settings */
  get customSettingsCount(): number {
    let count = 0;
    const collect = (nodes: RestaurantNode[]): void => {
      for (const n of nodes) {
        if (!n.children && n.isConnected && n.useCustomSettings) count++;
        if (n.children) collect(n.children);
      }
    };
    collect(this.wizardRestaurants);
    return count;
  }

  get breadcrumbs(): { label: string; onClick?: () => void }[] {
    return [
      { label: 'Платёжные системы', onClick: () => this.router.navigate(['/prototype/atlas']) },
      { label: this.integrationId === 'kaspi' ? 'Kaspi Bank' : 'Simple Pay' },
    ];
  }

  ngOnInit(): void {
    this.integrationId = this.route.snapshot.params['integrationId'];
    const allIntegrations = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    this.integration = allIntegrations.find(i => i.id === this.integrationId) || null;

    if (!this.integration) {
      this.router.navigate(['/prototype/atlas']);
      return;
    }

    // Deep copy categories for wizard
    this.wizardCategories = this.integration.operationCategories.map(c => ({ ...c, allowed: false }));

    // Deep copy restaurants for wizard (use chain as default)
    this.wizardRestaurants = JSON.parse(JSON.stringify(MOCK_CHAIN_RESTAURANTS));

    // Determine account type from storage
    const savedIntegrations = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    const saved = savedIntegrations.find(i => i.id === this.integrationId);
    if (saved && saved.status === 'connected') {
      this.restoreFromSaved(saved);
    }
  }

  toggleCategory(categoryId: string): void {
    const categories = this.currentEditingCategories;
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    cat.allowed = !cat.allowed;

    // If editing per-restaurant, mark it as custom
    if (this.selectedRestaurantId !== 'all') {
      const restaurant = this.findRestaurant(this.selectedRestaurantId);
      if (restaurant) {
        restaurant.useCustomSettings = true;
      }
    }
  }

  selectRestaurant(id: string | 'all'): void {
    this.selectedRestaurantId = id;
  }

  isRestaurantCustomized(restaurantId: string): boolean {
    const r = this.findRestaurant(restaurantId);
    return !!(r && r.useCustomSettings);
  }

  getRestaurantName(restaurantId: string): string {
    const r = this.findRestaurant(restaurantId);
    return r ? r.name : '';
  }

  /** Check if any restaurant (or global) has at least one category allowed */
  get hasAnyCategoryAllowed(): boolean {
    // Check global
    if (this.wizardCategories.some(c => c.allowed)) return true;
    // Check per-restaurant
    const checkNodes = (nodes: RestaurantNode[]): boolean => {
      for (const n of nodes) {
        if (n.customOperationCategories?.some(c => c.allowed)) return true;
        if (n.children && checkNodes(n.children)) return true;
      }
      return false;
    };
    return checkNodes(this.wizardRestaurants);
  }

  /** True if the currently edited categories list has items but none allowed */
  get currentEditingHasNoAllowed(): boolean {
    const cats = this.currentEditingCategories;
    return cats.length > 0 && !cats.some(c => c.allowed);
  }

  private findRestaurant(id: string): RestaurantNode | null {
    const find = (nodes: RestaurantNode[]): RestaurantNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = find(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(this.wizardRestaurants);
  }

  onRestaurantChange(restaurants: RestaurantNode[]): void {
    this.wizardRestaurants = restaurants;
  }

  isCredentialsValid(): boolean {
    if (!this.integration) return false;
    // Check all selected restaurants have credentials (global or custom)
    const checkNode = (nodes: RestaurantNode[]): boolean => {
      for (const n of nodes) {
        if (!n.children && n.isConnected) {
          const creds = n.useCustomSettings && n.customCredentials ? n.customCredentials : this.credentials;
          for (const field of this.integration!.requiredFields) {
            if (field.required && !creds[field.key]?.trim()) return false;
          }
        }
        if (n.children && !checkNode(n.children)) return false;
      }
      return true;
    };
    // If 'all' is selected, check global credentials first
    if (this.selectedRestaurantId === 'all') {
      for (const field of this.integration.requiredFields) {
        if (field.required && !this.credentials[field.key]?.trim()) return false;
      }
    }
    return checkNode(this.wizardRestaurants);
  }

  nextStep(): void {
    if (this.currentStep === 2 && this.accountType === 'rms') {
      // For RMS, select the only restaurant automatically
      this.wizardRestaurants = JSON.parse(JSON.stringify(MOCK_RMS_RESTAURANT));
      for (const r of this.wizardRestaurants) {
        r.isConnected = true;
        if (r.children) {
          for (const c of r.children) c.isConnected = true;
        }
      }
    }
    // Skip step 4 if no required fields
    if (this.currentStep === 3 && !this.hasRequiredFields) {
      this.currentStep = this.totalSteps;
      return;
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    // Skip step 4 backwards if no required fields
    if (this.currentStep === this.totalSteps && !this.hasRequiredFields) {
      this.currentStep = 3;
      return;
    }
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  cancelWizard(): void {
    this.showCancelConfirm = true;
  }

  confirmCancel(): void {
    this.showCancelConfirm = false;
    this.router.navigate(['/prototype/atlas', this.integrationId]);
  }

  submitConnection(): void {
    this.isSubmitting = true;
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.showSuccessModal = true;
    }, 1500);
  }

  finishWizard(): void {
    if (!this.integration) return;

    const allIntegrations = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    const target = allIntegrations.find(i => i.id === this.integrationId);
    if (!target) return;

    // Apply wizard state
    target.status = 'connected';
    target.operationCategories = this.wizardCategories.map(c => ({ ...c }));

    // Collect connected restaurant IDs + save per-restaurant settings
    const ids: string[] = [];
    const saveNodeSettings = (nodes: RestaurantNode[]): void => {
      for (const n of nodes) {
        if (!n.children && n.isConnected) {
          ids.push(n.id);
        }
        if (n.children) saveNodeSettings(n.children);
      }
    };
    saveNodeSettings(this.wizardRestaurants);
    target.connectedRestaurantIds = ids;

    // Save restaurant tree with per-restaurant settings to storage
    this.storage.save('atlas', this.integrationId + '_restaurants', this.wizardRestaurants);
    this.storage.save('atlas', 'integrations', allIntegrations);
    this.showSuccessModal = false;
    this.router.navigate(['/prototype/atlas', this.integrationId]);
  }

  private restoreFromSaved(saved: PaymentIntegration): void {
    this.consentAccepted = true;
    this.wizardCategories = saved.operationCategories.map(c => ({ ...c }));
    const savedIds = new Set(saved.connectedRestaurantIds);
    const restore = (nodes: RestaurantNode[]): void => {
      for (const n of nodes) {
        if (savedIds.has(n.id)) n.isConnected = true;
        if (n.children) restore(n.children);
      }
    };
    restore(this.wizardRestaurants);
  }
}
