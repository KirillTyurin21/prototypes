import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UiButtonComponent, UiCardComponent, UiCardHeaderComponent, UiCardTitleComponent, UiCardContentComponent,
  UiInputComponent, UiCheckboxComponent, UiStatusDotComponent, UiConfirmDialogComponent,
  UiAlertComponent, UiDividerComponent, UiBadgeComponent,
} from '@/components/ui';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import {
  PaymentIntegration, OperationCategory, RestaurantNode, FieldConfig, AccountType,
} from '../types';
import { MOCK_INTEGRATIONS, MOCK_CHAIN_RESTAURANTS, MOCK_RMS_RESTAURANT } from '../data/mock-data';

type DetailMode = 'view' | 'connect' | 'edit';

@Component({
  selector: 'app-atlas-detail-screen',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    UiButtonComponent, UiCardComponent, UiCardHeaderComponent, UiCardTitleComponent, UiCardContentComponent,
    UiInputComponent, UiCheckboxComponent, UiStatusDotComponent, UiConfirmDialogComponent,
    UiAlertComponent, UiDividerComponent, UiBadgeComponent,
    IconsModule,
  ],
  template: `
    <!-- Header (Comet-style) -->
    <header class="border-b border-gray-200 bg-white">
      <div class="flex h-14 items-center gap-4 px-4">
        <div class="flex items-center gap-2">
          <svg width="60" height="24" viewBox="0 0 60 24" fill="none" class="text-[#E94B35]">
            <path d="M0 0H8V24H0V0Z" fill="currentColor" />
            <path d="M12 0H20V24H12V0Z" fill="currentColor" />
            <path d="M28 7L32 0H40L36 7H44V17H36L40 24H32L28 17V7Z" fill="currentColor" />
            <path d="M52 0C56.4183 0 60 3.58172 60 8V16C60 20.4183 56.4183 24 52 24C47.5817 24 44 20.4183 44 16V8C44 3.58172 47.5817 0 52 0Z" fill="currentColor" />
          </svg>
        </div>
        <div class="flex items-center gap-2 ml-6">
          <span class="text-xs text-gray-400">Режим:</span>
          <div class="flex rounded-md border border-gray-300 overflow-hidden">
            <button (click)="accountType = 'chain'; onAccountTypeChange()"
              class="px-3 py-1 text-xs transition-colors"
              [class.bg-gray-900]="accountType === 'chain'" [class.text-white]="accountType === 'chain'"
              [class.text-gray-600]="accountType !== 'chain'">Чейн (15)</button>
            <button (click)="accountType = 'rms'; onAccountTypeChange()"
              class="px-3 py-1 text-xs transition-colors border-l border-gray-300"
              [class.bg-gray-900]="accountType === 'rms'" [class.text-white]="accountType === 'rms'"
              [class.text-gray-600]="accountType !== 'rms'">RMS (1)</button>
          </div>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button class="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm text-gray-700">
            <lucide-icon name="user" [size]="16"></lucide-icon>
            <span>admin</span>
          </button>
        </div>
      </div>
    </header>

    <div class="flex" style="height: calc(100vh - 3.5rem)">
      <!-- Sidebar -->
      <aside class="w-52 border-r border-gray-200 bg-gray-50/70 shrink-0">
        <nav class="p-2 space-y-0.5">
          <button (click)="goBack()"
            class="w-full flex items-center gap-2 text-left rounded px-3 py-2 text-sm transition-colors text-gray-500 hover:bg-gray-100">
            <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
            Платёжные системы
          </button>
          <div class="px-3 pt-3 pb-1">
            <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Интеграция</p>
          </div>
          <button
            class="w-full text-left rounded px-3 py-2 text-sm font-medium transition-colors bg-gray-200 text-gray-800">
            <lucide-icon name="settings" [size]="14" class="inline mr-1.5 -mt-0.5"></lucide-icon>
            {{ integration?.name || '...' }}
          </button>
        </nav>
      </aside>

      <!-- CONTENT -->
      <div class="flex-1 flex flex-col min-w-0">

        <!-- Page Header -->
        <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <button (click)="goBack()" class="p-1 rounded hover:bg-gray-100 transition-colors">
                <lucide-icon name="arrow-left" [size]="20" class="text-gray-500"></lucide-icon>
              </button>
              <div>
                <h1 class="text-2xl font-semibold text-gray-900">{{ integration?.name }}</h1>
                <div class="flex items-center gap-2 mt-0.5">
                  <ui-status-dot [color]="isConnected ? 'green' : 'gray'" [pulse]="isConnected"></ui-status-dot>
                  <span class="text-sm" [class.text-green-600]="isConnected" [class.text-gray-500]="!isConnected">
                    {{ isConnected ? 'Подключен' : 'Не подключен' }}
                  </span>
                  <span *ngIf="isConnected" class="text-sm text-gray-400 ml-2">
                    {{ connectedCount }} из {{ totalRestaurantCount }} ресторанов
                  </span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              <ui-button *ngIf="!isConnected && detailMode === 'view'" (click)="startConnect()">Подключить</ui-button>
              <ui-button *ngIf="isConnected && detailMode === 'view'" variant="outline" (click)="startEdit()">Изменить</ui-button>
              <ui-button *ngIf="isConnected && detailMode === 'view'" variant="danger" (click)="showDisconnectConfirm = true">Отключить</ui-button>
              <ui-button *ngIf="detailMode !== 'view'" variant="ghost" (click)="cancelFlow()">Отмена</ui-button>
            </div>
          </div>
        </div>

        <!-- ======================================== -->
        <!-- MODE: VIEW                               -->
        <!-- ======================================== -->
        <ng-container *ngIf="detailMode === 'view'">
          <!-- Не подключен — empty -->
          <div *ngIf="!isConnected" class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <lucide-icon name="plug" [size]="48" class="text-gray-300 mx-auto mb-4"></lucide-icon>
              <p class="text-gray-500 text-sm mb-2">Система не подключена</p>
              <p class="text-gray-400 text-xs mb-4">Нажмите «Подключить», чтобы начать интеграцию с {{ integration?.name }}.</p>
              <ui-button (click)="startConnect()">Начать подключение</ui-button>
            </div>
          </div>

          <!-- Подключен — split panel -->
          <div *ngIf="isConnected" class="flex flex-1 min-h-0">
            <!-- Left: Restaurant Tree -->
            <div class="w-96 border-r border-gray-200 overflow-y-auto shrink-0">
              <div class="p-4">
                <h2 class="mb-1 text-sm font-semibold text-gray-500">
                  {{ accountType === 'rms' ? 'Ваше торговое предприятие' : 'Структура торговых предприятий' }}
                </h2>
                <p *ngIf="accountType === 'rms'" class="text-xs text-gray-400 mb-3">
                  Режим RMS — показано только ваше ТП
                </p>
                <div *ngIf="flatRestaurantList.length === 0" class="py-8 text-center text-sm text-gray-400">Нет ресторанов</div>
                <div class="space-y-1">
                  <ng-container *ngFor="let item of flatRestaurantList">
                    <!-- Group -->
                    <button *ngIf="item.isGroup"
                      (click)="toggleGroup(item.id)"
                      class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      [style.padding-left.px]="8 + item.depth * 16">
                      <lucide-icon [name]="isGroupExpanded(item.id) ? 'chevron-down' : 'chevron-right'" [size]="16" class="shrink-0 text-gray-400"></lucide-icon>
                      <span class="flex-1 text-left font-medium text-gray-700">{{ item.name }}</span>
                    </button>
                    <!-- Restaurant -->
                    <button *ngIf="!item.isGroup"
                      (click)="selectRestaurant(item.id)"
                      class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors"
                      [style.padding-left.px]="8 + item.depth * 16"
                      [class.bg-gray-200]="selectedRestaurantId === item.id"
                      [class.hover:bg-gray-100]="selectedRestaurantId !== item.id">
                      <span class="flex-1 text-left text-gray-700">{{ item.name }}</span>
                      <span *ngIf="item.useCustomSettings" class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium shrink-0">индив.</span>
                      <lucide-icon *ngIf="item.checked && !item.useCustomSettings" name="check-circle-2" [size]="16" class="shrink-0 text-green-600"></lucide-icon>
                      <lucide-icon *ngIf="item.checked && item.useCustomSettings" name="alert-circle" [size]="16" class="shrink-0 text-orange-500"></lucide-icon>
                      <lucide-icon *ngIf="!item.checked" name="circle" [size]="16" class="shrink-0 text-gray-300"></lucide-icon>
                    </button>
                  </ng-container>
                </div>
              </div>
            </div>

            <!-- Right: Detail Panel -->
            <div class="flex-1 overflow-y-auto bg-white">
              <div *ngIf="!selectedRestaurantId" class="p-6 animate-fade-in">
                <div class="max-w-2xl space-y-6">
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900">Общие настройки</h2>
                    <p class="text-sm text-gray-500 mt-1">Выберите ресторан в дереве слева для просмотра индивидуальных настроек.</p>
                  </div>

                  <!-- Global Operations -->
                  <ui-card>
                    <ui-card-header><ui-card-title>Разрешённые операции</ui-card-title></ui-card-header>
                    <ui-card-content>
                      <div class="space-y-2">
                        <div *ngFor="let cat of integration?.operationCategories || []"
                          class="flex items-start gap-3 px-3 py-2 border border-gray-200 rounded-lg"
                          [class.border-green-200]="cat.allowed" [class.bg-green-50]="cat.allowed">
                          <lucide-icon [name]="cat.iconName" [size]="18" class="shrink-0 mt-0.5" [class.text-green-600]="cat.allowed" [class.text-gray-400]="!cat.allowed"></lucide-icon>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900">{{ cat.label }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ cat.description }}</p>
                          </div>
                          <lucide-icon *ngIf="cat.allowed" name="check" [size]="16" class="text-green-500 shrink-0"></lucide-icon>
                          <lucide-icon *ngIf="!cat.allowed" name="x" [size]="16" class="text-gray-300 shrink-0"></lucide-icon>
                        </div>
                      </div>
                    </ui-card-content>
                  </ui-card>

                  <!-- Created Entities -->
                  <ui-card *ngIf="integration?.paymentType">
                    <ui-card-header><ui-card-title>Созданные сущности</ui-card-title></ui-card-header>
                    <ui-card-content>
                      <div class="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                        <div class="flex items-start gap-3">
                          <lucide-icon name="credit-card" [size]="18" class="text-blue-500 mt-0.5 shrink-0"></lucide-icon>
                          <div>
                            <p class="text-sm font-medium">Тип оплаты «{{ integration?.paymentType?.name }}»</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ integration?.paymentType?.fiscal ? 'Фискальный' : 'Нефискальный' }} &middot; Кнопка: «{{ integration?.paymentType?.buttonLabel }}»</p>
                          </div>
                        </div>
                        <ui-divider *ngIf="integration?.discount"></ui-divider>
                        <div *ngIf="integration?.discount" class="flex items-start gap-3">
                          <lucide-icon name="percent" [size]="18" class="text-orange-500 mt-0.5 shrink-0"></lucide-icon>
                          <div>
                            <p class="text-sm font-medium">Скидка «{{ integration?.discount?.name }}»</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ integration?.discount?.percent }}% &middot; Привязана к «{{ integration?.discount?.linkedToPaymentType }}»</p>
                          </div>
                        </div>
                      </div>
                    </ui-card-content>
                  </ui-card>

                  <!-- Custom settings note -->
                  <ui-alert *ngIf="customSettingsCount > 0" variant="info">
                    {{ customSettingsCount }} ресторанов имеют индивидуальные настройки. Выберите ресторан в дереве слева для просмотра.
                  </ui-alert>
                </div>
              </div>

              <!-- Per-restaurant detail -->
              <div *ngIf="selectedRestaurantId && getRestaurant(selectedRestaurantId) as r" class="p-6 animate-fade-in">
                <div class="max-w-2xl space-y-6">
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-xl font-semibold text-gray-900">{{ r.name }}</h2>
                      <ui-badge *ngIf="r.useCustomSettings" variant="warning">Индивидуальные</ui-badge>
                      <ui-badge *ngIf="!r.useCustomSettings" variant="default">Наследует общие</ui-badge>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">{{ r.address }}</p>
                  </div>

                  <!-- Operations for this restaurant -->
                  <ui-card>
                    <ui-card-header>
                      <ui-card-title>Операции</ui-card-title>
                    </ui-card-header>
                    <ui-card-content>
                      <!-- EDIT MODE: checkboxes -->
                      <div *ngIf="r.useCustomSettings && perRestaurantEditMode" class="space-y-2">
                        <div *ngFor="let cat of getRestaurantCategories(r)"
                          class="flex items-start gap-3 px-3 py-2 border border-gray-200 rounded-lg"
                          [class.border-green-200]="cat.allowed" [class.bg-green-50]="cat.allowed">
                          <lucide-icon [name]="cat.iconName" [size]="18" class="shrink-0 mt-0.5" [class.text-green-600]="cat.allowed" [class.text-gray-400]="!cat.allowed"></lucide-icon>
                          <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">{{ cat.label }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ cat.description }}</p>
                          </div>
                          <ui-checkbox [checked]="cat.allowed" (checkedChange)="cat.allowed = $event"></ui-checkbox>
                        </div>
                      </div>
                      <!-- VIEW MODE: static icons -->
                      <div *ngIf="!r.useCustomSettings || !perRestaurantEditMode" class="space-y-2">
                        <div *ngFor="let cat of getRestaurantCategories(r)"
                          class="flex items-start gap-3 px-3 py-2 border border-gray-200 rounded-lg"
                          [class.border-green-200]="cat.allowed" [class.bg-green-50]="cat.allowed">
                          <lucide-icon [name]="cat.iconName" [size]="18" class="shrink-0 mt-0.5" [class.text-green-600]="cat.allowed" [class.text-gray-400]="!cat.allowed"></lucide-icon>
                          <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">{{ cat.label }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ cat.description }}</p>
                          </div>
                          <lucide-icon *ngIf="cat.allowed" name="check" [size]="16" class="text-green-500 shrink-0"></lucide-icon>
                          <lucide-icon *ngIf="!cat.allowed" name="x" [size]="16" class="text-gray-300 shrink-0"></lucide-icon>
                        </div>
                      </div>
                    </ui-card-content>
                  </ui-card>

                  <!-- Credentials for this restaurant -->
                  <ui-card *ngIf="r.useCustomSettings && integration?.requiredFields?.length">
                    <ui-card-header><ui-card-title>Реквизиты</ui-card-title></ui-card-header>
                    <ui-card-content>
                      <!-- EDIT MODE: input fields -->
                      <div *ngIf="perRestaurantEditMode" class="space-y-3">
                        <div *ngFor="let field of integration?.requiredFields || []">
                          <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}<span *ngIf="field.required" class="text-red-500 ml-0.5">*</span></label>
                          <input [type]="field.type === 'password' ? 'password' : 'text'"
                            [placeholder]="field.placeholder || ''"
                            [(ngModel)]="r.customCredentials![field.key]"
                            class="w-full h-9 px-3 text-sm border border-gray-300 rounded-md bg-white
                              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10
                              focus:border-gray-400 transition-all font-mono" />
                          <p *ngIf="field.helpText" class="text-xs text-gray-400 mt-1">{{ field.helpText }}</p>
                        </div>
                      </div>
                      <!-- VIEW MODE: static text -->
                      <div *ngIf="!perRestaurantEditMode" class="space-y-2 text-sm">
                        <div *ngFor="let field of integration?.requiredFields || []" class="flex justify-between py-1 border-b border-gray-100">
                          <span class="text-gray-500">{{ field.label }}</span>
                          <span class="font-mono text-gray-900">{{ field.type === 'password' ? '****' : (r.customCredentials?.[field.key] || '—') }}</span>
                        </div>
                      </div>
                    </ui-card-content>
                  </ui-card>

                  <!-- Actions -->
                  <div class="flex gap-2">
                    <!-- Not customized yet -->
                    <ui-button *ngIf="!r.useCustomSettings" variant="outline" size="sm" (click)="enableCustomSettings(r)">
                      Настроить индивидуально
                    </ui-button>
                    <!-- Customized, viewing -->
                    <ui-button *ngIf="r.useCustomSettings && !perRestaurantEditMode" variant="outline" size="sm" (click)="perRestaurantEditMode = true">
                      <lucide-icon name="pencil" [size]="14" class="mr-1"></lucide-icon>
                      Редактировать
                    </ui-button>
                    <!-- Customized, editing -->
                    <ng-container *ngIf="r.useCustomSettings && perRestaurantEditMode">
                      <ui-button size="sm" (click)="saveCustomSettings(r)">
                        <lucide-icon name="save" [size]="14" class="mr-1"></lucide-icon>
                        Сохранить
                      </ui-button>
                      <ui-button variant="ghost" size="sm" (click)="cancelCustomEdit()">Отмена</ui-button>
                    </ng-container>
                    <ui-button *ngIf="r.useCustomSettings" variant="ghost" size="sm" class="text-red-500 ml-auto" (click)="resetToGlobal(r)">
                      Сбросить к общим
                    </ui-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ======================================== -->
        <!-- MODE: CONNECT / EDIT                     -->
        <!-- ======================================== -->
        <ng-container *ngIf="detailMode === 'connect' || detailMode === 'edit'">
          <div class="flex flex-1 min-h-0">
            <!-- Left: Stepper -->
            <div class="w-64 border-r border-gray-200 overflow-y-auto shrink-0 bg-gray-50/30">
              <div class="p-4">
                <h2 class="mb-4 text-sm font-semibold text-gray-500">{{ detailMode === 'connect' ? 'Мастер подключения' : 'Редактирование' }}</h2>
                <div class="space-y-1">
                  <div *ngFor="let step of wizardStepLabels; let i = index"
                    class="flex items-center gap-2 px-2 py-1.5 rounded text-sm"
                    [class.bg-gray-200]="connectStep === i + 1"
                    [class.text-gray-900]="connectStep === i + 1"
                    [class.text-gray-500]="connectStep !== i + 1">
                    <div class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                      [class.bg-gray-900]="connectStep === i + 1"
                      [class.text-white]="connectStep === i + 1"
                      [class.bg-green-500]="connectStep > i + 1"
                      [class.text-white]="connectStep > i + 1"
                      [class.bg-gray-200]="connectStep < i + 1">
                      <lucide-icon *ngIf="connectStep > i + 1" name="check" [size]="12"></lucide-icon>
                      <span *ngIf="connectStep <= i + 1">{{ i + 1 }}</span>
                    </div>
                    <span>{{ step }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Wizard Steps -->
            <div class="flex-1 overflow-y-auto bg-white p-6">
              <div class="max-w-xl">

                <!-- Step 1: Consent -->
                <div *ngIf="connectStep === 1">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Согласие на подключение</h2>
                  <ui-alert variant="info" class="mb-4">
                    Вы даёте согласие на подключение к платёжному сервису <strong>{{ integration?.name }}</strong>.
                    После подтверждения будет автоматически создан тип оплаты
                    <ng-container *ngIf="integration?.discount">и связанная скидка</ng-container>.
                  </ui-alert>

                  <!-- Preview entities -->
                  <div class="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3 mb-4">
                    <h4 class="text-sm font-semibold text-gray-700">Будет создано автоматически</h4>
                    <div *ngIf="integration?.paymentType" class="flex items-start gap-3">
                      <lucide-icon name="credit-card" [size]="18" class="text-blue-500 mt-0.5 shrink-0"></lucide-icon>
                      <div>
                        <p class="text-sm font-medium">Тип оплаты «{{ integration?.paymentType?.name }}»</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ integration?.paymentType?.fiscal ? 'Фискальный' : 'Нефискальный' }} &middot; Кнопка: «{{ integration?.paymentType?.buttonLabel }}»</p>
                      </div>
                    </div>
                    <ui-divider *ngIf="integration?.paymentType && integration?.discount"></ui-divider>
                    <div *ngIf="integration?.discount" class="flex items-start gap-3">
                      <lucide-icon name="percent" [size]="18" class="text-orange-500 mt-0.5 shrink-0"></lucide-icon>
                      <div>
                        <p class="text-sm font-medium">Скидка «{{ integration?.discount?.name }}»</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ integration?.discount?.percent }}% &middot; Привязана к «{{ integration?.discount?.linkedToPaymentType }}»</p>
                      </div>
                    </div>
                  </div>

                  <ui-checkbox label="Я принимаю условия подключения и даю согласие на автоматическое создание типа оплаты"
                    [checked]="wizConsent" (checkedChange)="wizConsent = $event"></ui-checkbox>
                </div>

                <!-- Step 2: Restaurants (skip for RMS) -->
                <div *ngIf="connectStep === 2 && accountType === 'chain'">
                  <h2 class="text-lg font-semibold text-gray-900 mb-1">Выберите рестораны</h2>
                  <p class="text-sm text-gray-500 mb-4">Отметьте рестораны для подключения. Можно выбрать все или отдельные для пилота.</p>
                  <div class="flex gap-2 mb-3">
                    <button (click)="wizSelectAll()" class="text-xs text-blue-600 hover:text-blue-800">Выбрать все</button>
                    <span class="text-gray-300">|</span>
                    <button (click)="wizDeselectAll()" class="text-xs text-blue-600 hover:text-blue-800">Снять все</button>
                    <span class="ml-auto text-xs text-gray-400">Выбрано: {{ wizSelectedCount }} из {{ wizTotalCount }}</span>
                  </div>
                  <div class="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    <ng-container *ngFor="let item of wizFlatRestaurantList">
                      <div *ngIf="item.isGroup"
                        class="flex items-center gap-2 px-3 py-2 bg-gray-50"
                        [style.padding-left.px]="8 + item.depth * 16">
                        <lucide-icon name="folder" [size]="14" class="text-gray-400 shrink-0"></lucide-icon>
                        <span class="text-sm font-medium text-gray-700 flex-1">{{ item.name }}</span>
                      </div>
                      <div *ngIf="!item.isGroup"
                        class="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50"
                        [style.padding-left.px]="8 + item.depth * 16">
                        <ui-checkbox [checked]="item.checked" (checkedChange)="wizToggleRestaurant(item)"></ui-checkbox>
                        <span class="text-sm text-gray-700 flex-1">{{ item.name }}</span>
                        <span class="text-xs text-gray-400 hidden sm:inline">{{ item.address }}</span>
                      </div>
                    </ng-container>
                  </div>
                </div>
                <div *ngIf="connectStep === 2 && accountType === 'rms'" class="text-center py-12">
                  <p class="text-sm text-gray-500">У вас одно торговое предприятие — подключение будет выполнено для него автоматически.</p>
                </div>

                <!-- Step 3: Operations -->
                <div *ngIf="connectStep === 3">
                  <h2 class="text-lg font-semibold text-gray-900 mb-1">Какие операции разрешить?</h2>
                  <p class="text-sm text-gray-500 mb-4">Отметьте категории операций, которые {{ integration?.name }} может выполнять.</p>
                  <div class="space-y-2">
                    <div *ngFor="let cat of wizCategories"
                      class="flex items-start gap-3 px-4 py-3 border border-gray-200 rounded-lg"
                      [class.border-green-200]="cat.allowed" [class.bg-green-50]="cat.allowed">
                      <lucide-icon [name]="cat.iconName" [size]="20" class="shrink-0 mt-0.5" [class.text-green-600]="cat.allowed" [class.text-gray-400]="!cat.allowed"></lucide-icon>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">{{ cat.label }}</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ cat.description }}</p>
                      </div>
                      <ui-checkbox [checked]="cat.allowed" (checkedChange)="cat.allowed = $event"></ui-checkbox>
                    </div>
                  </div>
                </div>

                <!-- Step 4: Credentials (conditional) -->
                <div *ngIf="connectStep === 4 && hasWizRequiredFields">
                  <h2 class="text-lg font-semibold text-gray-900 mb-1">Реквизиты подключения</h2>
                  <p class="text-sm text-gray-500 mb-4">Введите данные для подключения к {{ integration?.name }}.</p>
                  <div class="space-y-4">
                    <div *ngFor="let field of integration?.requiredFields || []">
                      <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}<span *ngIf="field.required" class="text-red-500 ml-0.5">*</span></label>
                      <div class="relative">
                        <input [type]="field.type === 'password' && !wizShowPwd ? 'password' : 'text'"
                          [placeholder]="field.placeholder || ''" [(ngModel)]="wizCredentials[field.key]"
                          class="w-full h-9 px-3 pr-9 text-sm border border-gray-300 rounded-md bg-white placeholder:text-gray-400
                            focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all" />
                        <button *ngIf="field.type === 'password'" (click)="wizShowPwd = !wizShowPwd"
                          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                          <lucide-icon [name]="wizShowPwd ? 'eye-off' : 'eye'" [size]="16"></lucide-icon>
                        </button>
                      </div>
                      <p *ngIf="field.helpText" class="text-xs text-gray-400 mt-1">{{ field.helpText }}</p>
                    </div>
                  </div>
                </div>

                <!-- Step 5: Confirmation -->
                <div *ngIf="connectStep === totalWizSteps">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Подтверждение подключения</h2>
                  <div class="space-y-2 text-sm mb-4">
                    <div class="flex justify-between py-1.5 border-b border-gray-100"><span class="text-gray-500">Система</span><span class="font-medium">{{ integration?.name }}</span></div>
                    <div class="flex justify-between py-1.5 border-b border-gray-100"><span class="text-gray-500">Рестораны</span><span class="font-medium">{{ accountType === 'rms' ? '1 (RMS)' : 'выбрано ' + wizSelectedCount + ' из ' + wizTotalCount }}</span></div>
                    <div class="flex justify-between py-1.5 border-b border-gray-100"><span class="text-gray-500">Операции</span><span class="font-medium">{{ wizAllowedCatLabels }}</span></div>
                    <div *ngIf="hasWizRequiredFields" class="flex justify-between py-1.5 border-b border-gray-100"><span class="text-gray-500">Реквизиты</span><span class="font-medium text-green-600">заполнены</span></div>
                  </div>
                  <ui-alert variant="info">После подтверждения будет автоматически создан тип оплаты<ng-container *ngIf="integration?.discount"> и скидка</ng-container>. Плагин на терминале Front получит настройки при следующем опросе (до 60 сек).</ui-alert>
                </div>

                <!-- Wizard navigation -->
                <div class="flex justify-between mt-8 pt-4 border-t border-gray-200">
                  <ui-button variant="ghost" (click)="cancelFlow()">Отмена</ui-button>
                  <div class="flex gap-2">
                    <ui-button *ngIf="connectStep > 1" variant="outline" (click)="wizPrev()">Назад</ui-button>
                    <ui-button *ngIf="connectStep < totalWizSteps" [disabled]="!canWizNext" (click)="wizNext()">Далее</ui-button>
                    <ui-button *ngIf="connectStep === totalWizSteps" [loading]="wizSubmitting" (click)="wizSubmit()">Подтвердить и подключить</ui-button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </ng-container>

      </div>
    </div>

    <!-- Disconnect Confirm -->
    <ui-confirm-dialog
      [open]="showDisconnectConfirm" title="Отключить {{ integration?.name }}?"
      message="Тип оплаты и скидка будут отключены для всех ресторанов."
      confirmText="Отключить" variant="danger"
      (confirmed)="confirmDisconnect()" (cancelled)="showDisconnectConfirm = false">
    </ui-confirm-dialog>

    <!-- Toast -->
    <div *ngIf="toastMessage" class="fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 max-w-sm animate-slide-up">
      <p class="text-sm font-medium text-gray-900">{{ toastMessage }}</p>
    </div>
  `,
})
export class AtlasDetailScreenComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);

  // Integration
  integration: PaymentIntegration | null = null;
  integrationId = '';
  accountType: AccountType = 'chain';

  // View state
  detailMode: DetailMode = 'view';
  selectedRestaurantId: string | null = null;
  perRestaurantEditMode = false;
  restaurantTree: RestaurantNode[] = [];
  flatRestaurantList: FlatItem[] = [];
  expandedGroups = new Set<string>();

  // Connect/Edit wizard state
  connectStep = 1;
  wizConsent = false;
  wizCategories: OperationCategory[] = [];
  wizCredentials: Record<string, string> = {};
  wizShowPwd = false;
  wizSubmitting = false;
  wizFlatRestaurantList: WizFlatItem[] = [];

  // UI
  showDisconnectConfirm = false;
  toastMessage = '';

  // --- Computed ---

  get isConnected(): boolean { return this.integration?.status === 'connected'; }
  get connectedCount(): number { return this.integration?.connectedRestaurantIds?.length ?? 0; }
  get totalRestaurantCount(): number { let c = 0; const f = (n: RestaurantNode[]) => { for (const x of n) { if (!x.children) c++; if (x.children) f(x.children); } }; f(this.restaurantTree); return c; }
  get customSettingsCount(): number { let c = 0; const f = (n: RestaurantNode[]) => { for (const x of n) { if (!x.children && x.useCustomSettings) c++; if (x.children) f(x.children); } }; f(this.restaurantTree); return c; }

  get hasWizRequiredFields(): boolean { return (this.integration?.requiredFields?.length ?? 0) > 0; }
  get totalWizSteps(): number { return this.hasWizRequiredFields ? 5 : 4; }
  get wizardStepLabels(): string[] { const l = ['Согласие', 'Рестораны', 'Операции']; if (this.hasWizRequiredFields) l.push('Реквизиты'); l.push('Подтверждение'); return l; }
  get wizSelectedCount(): number { return this.wizFlatRestaurantList.filter(i => !i.isGroup && i.checked).length; }
  get wizTotalCount(): number { return this.wizFlatRestaurantList.filter(i => !i.isGroup).length; }
  get wizAllowedCatLabels(): string { const a = this.wizCategories.filter(c => c.allowed).map(c => c.label); return a.length > 0 ? a.join(', ') : 'не выбраны'; }

  get canWizNext(): boolean {
    if (this.connectStep === 1) return this.wizConsent;
    if (this.connectStep === 2) return this.accountType === 'rms' || this.wizSelectedCount > 0;
    if (this.connectStep === 3) return this.wizCategories.some(c => c.allowed);
    if (this.connectStep === 4 && this.hasWizRequiredFields) {
      for (const f of this.integration?.requiredFields || []) { if (f.required && !this.wizCredentials[f.key]?.trim()) return false; }
      return true;
    }
    return true;
  }

  // --- Init ---

  ngOnInit(): void {
    this.integrationId = this.route.snapshot.params['integrationId'];
    const all = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    this.integration = all.find(i => i.id === this.integrationId) || null;
    if (!this.integration) { this.router.navigate(['/prototype/atlas']); return; }
    this.buildTree();
  }

  // --- Tree ---

  buildTree(): void {
    const saved = this.storage.load<RestaurantNode[]>('atlas', this.integrationId + '_restaurants', null as any);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      this.restaurantTree = saved;
      // Filter tree for RMS: only keep the connected restaurant
      if (this.accountType === 'rms') {
        this.restaurantTree = this.filterRmsTree(saved);
      }
    } else {
      const connectedIds = new Set(this.integration?.connectedRestaurantIds ?? []);
      const source = this.accountType === 'rms' ? MOCK_RMS_RESTAURANT : MOCK_CHAIN_RESTAURANTS;
      this.restaurantTree = JSON.parse(JSON.stringify(source));
      const mark = (ns: any[]) => { for (const n of ns) { n.isConnected = connectedIds.has(n.id); if (n.children) mark(n.children); } };
      mark(this.restaurantTree);
    }
    this.rebuildFlatList();
  }

  /** For RMS: extract only the single restaurant (no groups, no hierarchy) */
  private filterRmsTree(saved: RestaurantNode[]): RestaurantNode[] {
    const findLeaf = (ns: RestaurantNode[]): RestaurantNode | null => {
      for (const n of ns) {
        if (!n.children) return n;
        if (n.children) { const r = findLeaf(n.children); if (r) return r; }
      }
      return null;
    };
    const leaf = findLeaf(saved);
    return leaf ? [{ ...leaf, children: undefined }] : saved;
  }

  rebuildFlatList(): void {
    this.flatRestaurantList = [];
    const walk = (nodes: RestaurantNode[], depth: number, parentExpanded: boolean) => {
      for (const n of nodes) {
        const hasChildren = !!n.children?.length;
        const isExpanded = this.expandedGroups.has(n.id);
        this.flatRestaurantList.push({
          id: n.id, name: n.name, address: n.address, isGroup: hasChildren, depth,
          checked: n.isConnected, useCustomSettings: n.useCustomSettings || false,
        });
        if (hasChildren && isExpanded) walk(n.children!, depth + 1, true);
      }
    };
    walk(this.restaurantTree, 0, true);
  }

  isGroupExpanded(id: string): boolean { return this.expandedGroups.has(id); }

  toggleGroup(id: string): void {
    if (this.expandedGroups.has(id)) this.expandedGroups.delete(id); else this.expandedGroups.add(id);
    this.rebuildFlatList();
  }

  selectRestaurant(id: string): void {
    this.selectedRestaurantId = this.selectedRestaurantId === id ? null : id;
    this.perRestaurantEditMode = false;
  }

  getRestaurant(id: string): RestaurantNode | null {
    const f = (ns: RestaurantNode[]): RestaurantNode | null => {
      for (const n of ns) { if (n.id === id) return n; if (n.children) { const r = f(n.children); if (r) return r; } }
      return null;
    };
    return f(this.restaurantTree);
  }

  getRestaurantCategories(r: RestaurantNode): OperationCategory[] {
    if (r.useCustomSettings && r.customOperationCategories) return r.customOperationCategories;
    return this.integration?.operationCategories || [];
  }

  enableCustomSettings(r: RestaurantNode): void {
    r.customOperationCategories = (this.integration?.operationCategories || []).map(c => ({ ...c }));
    r.customCredentials = { ...(this.integration?.requiredFields?.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}) || {}) };
    r.useCustomSettings = true;
    this.perRestaurantEditMode = true;
    this.persistTree();
    this.rebuildFlatList();
    this.toast('Индивидуальные настройки включены для «' + r.name + '»');
  }

  saveCustomSettings(r: RestaurantNode): void {
    this.perRestaurantEditMode = false;
    this.persistTree();
    this.rebuildFlatList();
    this.toast('Настройки «' + r.name + '» сохранены');
  }

  cancelCustomEdit(): void {
    this.perRestaurantEditMode = false;
  }

  resetToGlobal(r: RestaurantNode): void {
    r.customOperationCategories = undefined;
    r.customCredentials = undefined;
    r.useCustomSettings = false;
    this.perRestaurantEditMode = false;
    this.persistTree();
    this.rebuildFlatList();
    this.toast('Настройки «' + r.name + '» сброшены к общим');
  }

  // --- Navigation ---

  goBack(): void { this.router.navigate(['/prototype/atlas']); }

  // --- Connect / Edit Flow ---

  startConnect(): void {
    this.detailMode = 'connect';
    this.connectStep = 1;
    this.wizConsent = false;
    this.wizCategories = (this.integration?.operationCategories || []).map(c => ({ ...c, allowed: false }));
    this.wizCredentials = {};
    this.initWizTree();
  }

  startEdit(): void {
    this.detailMode = 'edit';
    this.connectStep = 1;
    this.wizConsent = true;
    this.wizCategories = (this.integration?.operationCategories || []).map(c => ({ ...c }));
    this.wizCredentials = {};
    this.initWizTree();
  }

  cancelFlow(): void {
    this.detailMode = 'view';
    this.selectedRestaurantId = null;
    this.buildTree();
  }

  // --- Wizard tree ---

  initWizTree(): void {
    const connectedIds = new Set(this.integration?.connectedRestaurantIds ?? []);
    const r = this.accountType === 'rms' ? JSON.parse(JSON.stringify(MOCK_RMS_RESTAURANT)) : JSON.parse(JSON.stringify(MOCK_CHAIN_RESTAURANTS));
    const mark = (ns: any[]) => { for (const n of ns) { n.isConnected = connectedIds.has(n.id); if (n.children) mark(n.children); } };
    mark(r);
    this.wizFlatRestaurantList = [];
    const walk = (ns: any[], depth: number) => {
      for (const n of ns) {
        const hc = !!n.children?.length;
        this.wizFlatRestaurantList.push({ id: n.id, name: n.name, address: n.address || '', isGroup: hc, depth, checked: !!n.isConnected });
        if (hc) walk(n.children, depth + 1);
      }
    };
    walk(r, 0);
  }

  wizToggleRestaurant(item: WizFlatItem): void { item.checked = !item.checked; }
  wizSelectAll(): void { for (const i of this.wizFlatRestaurantList) i.checked = true; }
  wizDeselectAll(): void { for (const i of this.wizFlatRestaurantList) i.checked = false; }

  wizNext(): void {
    if (this.connectStep === 3 && !this.hasWizRequiredFields) { this.connectStep = this.totalWizSteps; return; }
    if (this.connectStep < this.totalWizSteps) this.connectStep++;
  }

  wizPrev(): void {
    if (this.connectStep === this.totalWizSteps && !this.hasWizRequiredFields) { this.connectStep = 3; return; }
    if (this.connectStep > 1) this.connectStep--;
  }

  wizSubmit(): void {
    this.wizSubmitting = true;
    setTimeout(() => {
      if (!this.integration) return;
      const all = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
      const t = all.find(i => i.id === this.integrationId);
      if (!t) return;
      t.status = 'connected';
      t.operationCategories = this.wizCategories.map(c => ({ ...c }));
      const ids: string[] = [];
      for (const i of this.wizFlatRestaurantList) { if (!i.isGroup && i.checked) ids.push(i.id); }
      t.connectedRestaurantIds = ids;
      this.storage.save('atlas', 'integrations', all);

      // Build and save restaurant tree
      const r = this.accountType === 'rms' ? JSON.parse(JSON.stringify(MOCK_RMS_RESTAURANT)) : JSON.parse(JSON.stringify(MOCK_CHAIN_RESTAURANTS));
      const mark = (ns: any[]) => { for (const n of ns) { n.isConnected = ids.includes(n.id); if (n.children) mark(n.children); } };
      mark(r);
      this.storage.save('atlas', this.integrationId + '_restaurants', r);
      this.integration = t;
      this.wizSubmitting = false;
      this.detailMode = 'view';
      this.selectedRestaurantId = null;
      this.buildTree();
      this.toast(this.integration?.name + ' успешно подключен');
    }, 1500);
  }

  // --- Disconnect ---

  confirmDisconnect(): void {
    if (!this.integration) return;
    const all = this.storage.load('atlas', 'integrations', MOCK_INTEGRATIONS);
    const t = all.find(i => i.id === this.integrationId);
    if (!t) return;
    t.status = 'disconnected';
    t.connectedRestaurantIds = [];
    for (const c of t.operationCategories) c.allowed = false;
    this.storage.save('atlas', 'integrations', all);
    this.storage.save('atlas', this.integrationId + '_restaurants', null);
    this.integration = t;
    this.buildTree();
    this.selectedRestaurantId = null;
    this.showDisconnectConfirm = false;
    this.toast(t.name + ' отключен');
  }

  // --- Account change ---

  onAccountTypeChange(): void { if (this.detailMode === 'view') this.buildTree(); else this.initWizTree(); }

  // --- Helpers ---

  persistTree(): void { this.storage.save('atlas', this.integrationId + '_restaurants', this.restaurantTree); }

  toast(msg: string): void { this.toastMessage = msg; setTimeout(() => { this.toastMessage = ''; }, 2500); }

  trackById(_: number, item: any): string { return item.id; }
}

// Local flat item types (inline, not in types.ts)
interface FlatItem {
  id: string; name: string; address: string; isGroup: boolean; depth: number; checked: boolean; useCustomSettings: boolean;
}

interface WizFlatItem {
  id: string; name: string; address: string; isGroup: boolean; depth: number; checked: boolean;
}
