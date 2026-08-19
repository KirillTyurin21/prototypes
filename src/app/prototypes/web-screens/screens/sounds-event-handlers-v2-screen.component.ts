import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { StorageService } from '@/shared/storage.service';
import { UiConfirmDialogComponent } from '@/components/ui';
import {
  DvCollection,
  DvEventHandler,
  SoundEventHandler,
  GenerationQueueItem,
} from '../types';
import {
  MOCK_DV_COLLECTIONS,
  MOCK_DV_HANDLERS,
  getSystemHandlerPrefix,
} from '../data/mock-data';
import { HandlersTreeComponent } from '../components/sounds/handlers-tree.component';
import { HandlerDetailPanelComponent } from '../components/sounds/handler-detail-panel.component';
import { HandlerCreateModalComponent, HandlerCreateData } from '../components/sounds/handler-create-modal.component';
import { CollectionCreatePanelComponent } from '../components/sounds/collection-create-panel.component';
import { GenerationQueuePanelComponent } from '../components/sounds/generation-queue-panel.component';

/**
 * «Обработчики событий (новая)» — переделка экрана «Звуки → Обработчики событий».
 * Вариант A «Было» — реплика таблицы стенда; Вариант B «Дерево + панель» — целевая концепция.
 */
@Component({
  selector: 'app-sounds-event-handlers-v2-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiConfirmDialogComponent,
    HandlersTreeComponent,
    HandlerDetailPanelComponent,
    HandlerCreateModalComponent,
    CollectionCreatePanelComponent,
    GenerationQueuePanelComponent,
  ],
  template: `
    <div class="eh2">
      <!-- Обратная связь -->
      <div
        class="eh2-feedback"
        [class.eh2-feedback--success]="feedback.type === 'success'"
        [class.eh2-feedback--error]="feedback.type === 'error'"
        *ngIf="feedback"
      >
        <lucide-icon [name]="feedback.type === 'success' ? 'check-circle-2' : 'alert-circle'" [size]="16"></lucide-icon>
        <span>{{ feedback.text }}</span>
      </div>

      <!-- Баннер ошибки -->
      <div class="eh2-error" *ngIf="showError" role="alert">
        <lucide-icon name="alert-circle" [size]="18"></lucide-icon>
        <span class="eh2-error-text">Не удалось загрузить справочник событий. Повторите попытку.</span>
        <button type="button" class="eh2-error-btn" (click)="refreshList()">Повторить</button>
        <button type="button" class="eh2-error-close" (click)="showError = false" aria-label="Скрыть ошибку">
          <lucide-icon name="x" [size]="15"></lucide-icon>
        </button>
      </div>

      <!-- Заголовок -->
      <div class="eh2-header">
        <h1 class="eh2-title">Обработчики событий</h1>
        <div class="eh2-header-actions">
          <app-generation-queue-panel
            [generationQueue]="generationQueue"
            [handlers]="queueHandlers"
            (queueChanged)="onQueueChanged($event)"
            (handlerUpdated)="onQueueHandlerUpdated($event)"
            (openHandler)="openHandlerFromQueue($event)"
          ></app-generation-queue-panel>

          <button type="button" class="eh2-btn eh2-btn--outline" (click)="openCreateCollection()">
            <lucide-icon name="folder-plus" [size]="15"></lucide-icon>
            Создать коллекцию
          </button>
          <button type="button" class="eh2-btn eh2-btn--primary" (click)="openCreateHandler()">
            <lucide-icon name="plus" [size]="15"></lucide-icon>
            Создать обработчик
          </button>
          <button type="button" class="eh2-btn eh2-btn--ghost" (click)="refreshList()" title="Обновить список" aria-label="Обновить список">
            <lucide-icon name="refresh-cw" [size]="16" [class.spin-icon]="refreshSpinner"></lucide-icon>
          </button>
          <button type="button" class="eh2-info" (click)="infoOpen = true" title="Информация" aria-label="Информация">
            <lucide-icon name="info" [size]="20"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Переключатель вариантов -->
      <div class="eh2-switcher">
        <span class="eh2-switcher-label">Вариант дизайна:</span>
        <div class="eh2-switcher-segments" role="tablist">
          <button
            type="button"
            class="eh2-switcher-btn"
            [class.eh2-switcher-btn--active]="activeVariant === 'A'"
            (click)="switchVariant('A')"
            role="tab"
            [attr.aria-selected]="activeVariant === 'A'"
          >
            <lucide-icon name="layout-list" [size]="14"></lucide-icon>
            A: Было
          </button>
          <button
            type="button"
            class="eh2-switcher-btn"
            [class.eh2-switcher-btn--active]="activeVariant === 'B'"
            (click)="switchVariant('B')"
            role="tab"
            [attr.aria-selected]="activeVariant === 'B'"
          >
            <lucide-icon name="panel-right" [size]="14"></lucide-icon>
            B: Дерево + панель
          </button>
        </div>
      </div>

      <!-- Загрузка -->
      <div class="eh2-loading" *ngIf="isLoading" aria-label="Загрузка">
        <div class="eh2-skeleton eh2-skeleton--title"></div>
        <div class="eh2-skeleton-row">
          <div class="eh2-skeleton eh2-skeleton--tree"></div>
          <div class="eh2-skeleton eh2-skeleton--panel"></div>
        </div>
      </div>

      <ng-container *ngIf="!isLoading">
        <!-- ═══ ВАРИАНТ A «Было» — реплика таблицы стенда ═══ -->
        <div class="eh2-a" *ngIf="activeVariant === 'A'">
          <!-- Пустое состояние стенда -->
          <div class="eh2-a-empty" *ngIf="handlers.length === 0">
            <lucide-icon name="folder-open" [size]="30"></lucide-icon>
            <span>Нет данных для отображения</span>
            <div class="eh2-a-progress"><div class="eh2-a-progress-bar"></div></div>
          </div>

          <div class="eh2-a-table-wrap" *ngIf="handlers.length > 0">
            <table class="eh2-a-table">
              <thead>
                <tr>
                  <th class="eh2-a-th-name">Название</th>
                  <th class="eh2-a-th-voice">Тип озвучки</th>
                  <th class="eh2-a-th-status">Статус</th>
                  <th class="eh2-a-th-actions"></th>
                </tr>
              </thead>
              <tbody>
                <!-- Коллекции -->
                <ng-container *ngFor="let col of collections">
                  <tr class="eh2-a-col" [class.eh2-a-col--system]="col.isSystem">
                    <td>
                      <button type="button" class="eh2-a-col-btn" (click)="toggleCollectionA(col.id)" [attr.aria-expanded]="isExpandedA(col.id)">
                        <lucide-icon [name]="isExpandedA(col.id) ? 'chevron-down' : 'chevron-right'" [size]="16"></lucide-icon>
                        <span class="eh2-a-col-name">{{ col.name }}</span>
                        <span class="eh2-a-col-count">({{ handlersInCollection(col.id).length }})</span>
                      </button>
                    </td>
                    <td></td><td></td>
                    <td>
                      <div class="eh2-a-actions" *ngIf="!col.isSystem">
                        <button type="button" class="eh2-a-action" (click)="openRenameCollection(col, $event)" title="Редактировать" aria-label="Редактировать коллекцию">
                          <lucide-icon name="pencil" [size]="15"></lucide-icon>
                        </button>
                        <button type="button" class="eh2-a-action" (click)="copyCollection(col, $event)" title="Копировать" aria-label="Копировать коллекцию">
                          <lucide-icon name="copy" [size]="15"></lucide-icon>
                        </button>
                        <button type="button" class="eh2-a-action eh2-a-action--danger" (click)="requestDeleteCollection(col, $event)" title="Удалить" aria-label="Удалить коллекцию">
                          <lucide-icon name="trash-2" [size]="15"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <ng-container *ngIf="isExpandedA(col.id)">
                    <tr class="eh2-a-row" *ngFor="let h of handlersInCollection(col.id)">
                      <td>
                        <span class="eh2-a-handler-name">{{ handlerPrefix(h) }}{{ h.name }}</span>
                      </td>
                      <td>{{ h.voiceType === 'generation' ? 'Генерация' : 'Файл' }}</td>
                      <td>
                        <span
                          class="eh2-a-status"
                          *ngIf="h.voiceType === 'generation'"
                          [class.eh2-a-status--done]="h.generationStatus === 'done'"
                        >
                          {{ h.generationStatus === 'done' ? 'Готово' : 'Ожидание' }}
                        </span>
                        <span class="eh2-a-none" *ngIf="h.voiceType !== 'generation'">—</span>
                      </td>
                      <td>
                        <div class="eh2-a-actions">
                          <button type="button" class="eh2-a-action" (click)="editHandler(h)" title="Редактировать" aria-label="Редактировать обработчик">
                            <lucide-icon name="pencil" [size]="15"></lucide-icon>
                          </button>
                          <button type="button" class="eh2-a-action" (click)="copyHandler(h)" title="Копировать" aria-label="Копировать обработчик">
                            <lucide-icon name="copy" [size]="15"></lucide-icon>
                          </button>
                          <button
                            type="button"
                            class="eh2-a-action eh2-a-action--danger"
                            [disabled]="isSystemHandler(h)"
                            [title]="isSystemHandler(h) ? 'Системные обработчики нельзя удалять' : 'Удалить'"
                            (click)="requestDeleteHandler(h)"
                            aria-label="Удалить обработчик"
                          >
                            <lucide-icon name="trash-2" [size]="15"></lucide-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </ng-container>
                </ng-container>

                <!-- Без коллекции -->
                <ng-container *ngIf="orphanHandlers.length > 0">
                  <tr class="eh2-a-col">
                    <td>
                      <button type="button" class="eh2-a-col-btn" (click)="toggleCollectionA(-1)" [attr.aria-expanded]="isExpandedA(-1)">
                        <lucide-icon [name]="isExpandedA(-1) ? 'chevron-down' : 'chevron-right'" [size]="16"></lucide-icon>
                        <span class="eh2-a-col-name">Без коллекции</span>
                        <span class="eh2-a-col-count">({{ orphanHandlers.length }})</span>
                      </button>
                    </td>
                    <td></td><td></td><td></td>
                  </tr>
                  <ng-container *ngIf="isExpandedA(-1)">
                    <tr class="eh2-a-row" *ngFor="let h of orphanHandlers">
                      <td><span class="eh2-a-handler-name">{{ h.name }}</span></td>
                      <td>{{ h.voiceType === 'generation' ? 'Генерация' : 'Файл' }}</td>
                      <td>
                        <span
                          class="eh2-a-status"
                          *ngIf="h.voiceType === 'generation'"
                          [class.eh2-a-status--done]="h.generationStatus === 'done'"
                        >
                          {{ h.generationStatus === 'done' ? 'Готово' : 'Ожидание' }}
                        </span>
                        <span class="eh2-a-none" *ngIf="h.voiceType !== 'generation'">—</span>
                      </td>
                      <td>
                        <div class="eh2-a-actions">
                          <button type="button" class="eh2-a-action" (click)="editHandler(h)" title="Редактировать" aria-label="Редактировать обработчик">
                            <lucide-icon name="pencil" [size]="15"></lucide-icon>
                          </button>
                          <button type="button" class="eh2-a-action" (click)="copyHandler(h)" title="Копировать" aria-label="Копировать обработчик">
                            <lucide-icon name="copy" [size]="15"></lucide-icon>
                          </button>
                          <button
                            type="button"
                            class="eh2-a-action eh2-a-action--danger"
                            [disabled]="isSystemHandler(h)"
                            [title]="isSystemHandler(h) ? 'Системные обработчики нельзя удалять' : 'Удалить'"
                            (click)="requestDeleteHandler(h)"
                            aria-label="Удалить обработчик"
                          >
                            <lucide-icon name="trash-2" [size]="15"></lucide-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </ng-container>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ═══ ВАРИАНТ B «Дерево + панель» — целевая концепция ═══ -->
        <div class="eh2-b" *ngIf="activeVariant === 'B'">
          <div class="eh2-b-search">
            <lucide-icon name="search" [size]="15"></lucide-icon>
            <input type="text" [(ngModel)]="searchV2" placeholder="Поиск по коллекциям / обработчикам" aria-label="Поиск по коллекциям и обработчикам" />
          </div>

          <div class="eh2-b-split">
            <div class="eh2-b-tree">
              <app-handlers-tree
                [collections]="collections"
                [handlers]="handlers"
                [selectedHandlerId]="selectedHandlerId"
                [checkedHandlerIds]="checkedIds"
                [searchQuery]="searchV2"
                (selectHandler)="onSelectHandler($event)"
                (toggleHandlerCheck)="onToggleHandlerCheck($event)"
                (toggleCollectionCheck)="onToggleCollectionCheck($event)"
                (massCopy)="onMassCopy()"
              ></app-handlers-tree>
            </div>
            <div class="eh2-b-panel">
              <app-handler-detail-panel
                [handler]="selectedHandler"
                [collections]="collections"
                (save)="onPanelSave($event)"
                (copy)="copyHandlerById($event)"
                (delete)="requestDeleteHandlerById($event)"
                (enqueue)="onEnqueue($event)"
              ></app-handler-detail-panel>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Модалка создания / редактирования обработчика -->
      <app-handler-create-modal
        [open]="createHandlerOpen"
        [collections]="collections"
        [editingHandler]="editingHandler"
        (close)="closeHandlerModal()"
        (create)="onHandlerModalSave($event)"
      ></app-handler-create-modal>

      <!-- Боковая панель создания / переименования коллекции -->
      <app-collection-create-panel
        [open]="createCollectionOpen || !!renameCollection"
        [title]="renameCollection ? 'Переименовать коллекцию' : 'Новая коллекция'"
        [saveLabel]="renameCollection ? 'Сохранить' : 'Сохранить'"
        [initialName]="renameCollection?.name ?? ''"
        (close)="closeCollectionPanel()"
        (save)="onCollectionSave($event)"
      ></app-collection-create-panel>

      <!-- Confirm удаления -->
      <ui-confirm-dialog
        *ngIf="confirmTarget"
        [open]="true"
        [title]="confirmTarget.kind === 'collection' ? 'Удалить коллекцию' : 'Удалить обработчик'"
        [message]="confirmMessage"
        confirmText="Удалить"
        variant="danger"
        (confirmed)="confirmDelete()"
        (cancelled)="confirmTarget = null"
      ></ui-confirm-dialog>

      <!-- Справка -->
      <div class="eh2-backdrop" *ngIf="infoOpen" (click)="infoOpen = false" role="presentation"></div>
      <div class="eh2-info-modal" *ngIf="infoOpen" role="dialog" aria-modal="true" aria-label="Управление обработчиками событий">
        <div class="eh2-info-head">
          <h3 class="eh2-info-title">Управление обработчиками событий</h3>
          <button type="button" class="eh2-info-close" (click)="infoOpen = false" aria-label="Закрыть">
            <lucide-icon name="x" [size]="18"></lucide-icon>
          </button>
        </div>
        <div class="eh2-info-body">
          <ul class="eh2-info-list">
            <li>Коллекция — папка с обработчиками. «Системные обработчики событий» есть у всех пользователей по умолчанию.</li>
            <li>Обработчик может входить в одну или несколько коллекций. Без выбора коллекции обработчик попадает в «Без коллекции».</li>
            <li>Дублирование коллекции копирует её вместе со всеми обработчиками.</li>
            <li>При удалении коллекции удаляются все данные о ней, включая обработчики.</li>
            <li>Дублирование обработчика создаёт копию внизу общего списка в папке «Без коллекции».</li>
            <li>Звуковые файлы берутся из Галереи; если подходящих нет — поле выбора пусто.</li>
            <li>Генерация — пилотная функция. Доступные голоса: Светлана и Дмитрий.</li>
            <li>Фраза после сохранения уходит в очередь генерации; среднее время обработки 5–10 минут. Знаки препинания влияют на паузы, результат можно прослушать и перегенерировать.</li>
          </ul>
          <div class="eh2-info-demo">
            <span class="eh2-info-demo-label">Демонстрация состояний:</span>
            <button type="button" class="eh2-demo-btn" (click)="simulateError()">Симулировать ошибку загрузки</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .eh2 {
      animation: eh2-fade 0.2s ease-out;
      font-family: Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    @keyframes eh2-fade {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Feedback ── */
    .eh2-feedback {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 13.5px;
      animation: eh2-fade 0.2s ease-out;
    }
    .eh2-feedback--success { background: var(--dt-brand-positive-lighter); color: var(--dt-brand-positive-darker); }
    .eh2-feedback--error { background: var(--dt-brand-negative-lighter); color: var(--dt-brand-negative-darker); }

    /* ── Error banner ── */
    .eh2-error {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      padding: 10px 14px;
      border: 1px solid #d32f2f;
      border-radius: 4px;
      background: var(--dt-brand-negative-lighter);
      color: var(--dt-brand-negative-darker);
      font-size: 13.5px;
    }
    .eh2-error-text { flex: 1; }
    .eh2-error-btn {
      height: 30px;
      padding: 0 14px;
      border: 1px solid #d32f2f;
      border-radius: 4px;
      background: #fff;
      color: #d32f2f;
      font-family: Roboto, sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
    }
    .eh2-error-btn:hover { background: #fdecea; }
    .eh2-error-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border: none;
      border-radius: 50%;
      background: none;
      color: inherit;
      cursor: pointer;
    }
    .eh2-error-close:hover { background: rgba(211, 47, 47, 0.12); }

    /* ── Header ── */
    .eh2-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .eh2-title { margin: 0; font-size: 22px; font-weight: 500; color: var(--dt-text-primary); }
    .eh2-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .eh2-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 14px;
      border-radius: 4px;
      border: 1px solid #d6d6d6;
      background: var(--dt-surface-primary);
      color: var(--dt-text-primary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.12s ease;
      white-space: nowrap;
    }
    .eh2-btn:hover { background: #ebebeb; }
    .eh2-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
    .eh2-btn--primary {
      border: none;
      background: var(--dt-brand-accent);
      color: var(--dt-text-inverse);
    }
    .eh2-btn--primary:hover { background: #3969d5; }
    .eh2-btn--ghost { border: none; background: none; color: var(--dt-text-secondary); }
    .eh2-btn--ghost:hover { background: #ebebeb; color: var(--dt-text-primary); }
    .eh2-info {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-disable);
      cursor: pointer;
    }
    .eh2-info:hover { background: #ebebeb; color: var(--dt-text-primary); }
    .spin-icon { animation: eh2-spin 1s linear infinite; }
    @keyframes eh2-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* ── Variant switcher ── */
    .eh2-switcher { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .eh2-switcher-label { font-size: 13px; color: var(--dt-text-secondary); }
    .eh2-switcher-segments {
      display: inline-flex;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      overflow: hidden;
      background: var(--dt-surface-primary);
    }
    .eh2-switcher-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border: none;
      border-right: 1px solid #d6d6d6;
      background: none;
      color: var(--dt-text-secondary);
      font-family: Roboto, sans-serif;
      font-size: 13px;
      cursor: pointer;
    }
    .eh2-switcher-btn:last-child { border-right: none; }
    .eh2-switcher-btn:hover { background: #ebebeb; }
    .eh2-switcher-btn--active { background: var(--dt-surface-sidebar-selected); color: var(--dt-brand-accent); font-weight: 500; }

    /* ── Loading skeleton ── */
    .eh2-loading { display: flex; flex-direction: column; gap: 12px; }
    .eh2-skeleton {
      border-radius: 4px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: eh2-shimmer 1.2s infinite;
    }
    @keyframes eh2-shimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }
    .eh2-skeleton--title { width: 260px; height: 26px; }
    .eh2-skeleton-row { display: flex; gap: 14px; }
    .eh2-skeleton--tree { width: 320px; height: 460px; }
    .eh2-skeleton--panel { flex: 1; height: 460px; }

    /* ── Variant A: таблица стенда ── */
    .eh2-a-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 60px 20px;
      color: var(--dt-text-disable);
      font-size: 14px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
    }
    .eh2-a-progress { width: 240px; height: 4px; border-radius: 2px; background: #e0e0e0; overflow: hidden; }
    .eh2-a-progress-bar {
      width: 40%;
      height: 100%;
      border-radius: 2px;
      background: var(--dt-brand-accent);
      animation: eh2-progress 1.6s ease-in-out infinite;
    }
    @keyframes eh2-progress {
      0% { margin-left: -40%; }
      100% { margin-left: 100%; }
    }

    .eh2-a-table-wrap {
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      overflow-x: auto;
    }
    .eh2-a-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .eh2-a-table th {
      padding: 10px 12px;
      text-align: left;
      font-weight: 500;
      font-size: 12.5px;
      color: var(--dt-text-primary);
      background: #f0f5ff;
      border-bottom: 1px solid #d6d6d6;
      white-space: nowrap;
    }
    .eh2-a-table td {
      padding: 9px 12px;
      border-bottom: 1px solid #f0f0f0;
      color: var(--dt-text-primary);
      vertical-align: middle;
    }
    .eh2-a-table tbody tr:last-child td { border-bottom: none; }
    .eh2-a-th-actions { width: 110px; }
    .eh2-a-th-voice { width: 120px; }
    .eh2-a-th-status { width: 110px; }

    .eh2-a-col td { background: var(--dt-surface-variant); border-bottom: 1px solid #d6d6d6; }
    .eh2-a-col--system td { background: #fafbfd; }
    .eh2-a-col-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: none;
      background: none;
      padding: 2px 4px;
      font-family: Roboto, sans-serif;
      cursor: pointer;
      color: var(--dt-text-primary);
    }
    .eh2-a-col-btn:focus-visible { outline: 2px solid var(--dt-brand-accent); outline-offset: 1px; }
    .eh2-a-col-name { font-size: 14px; font-weight: 500; }
    .eh2-a-col-count { font-size: 12px; color: var(--dt-text-disable); }

    .eh2-a-handler-name { display: inline-block; padding-left: 18px; }
    .eh2-a-status {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      background: #fff3e0;
      color: #e65100;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .eh2-a-status--done { background: #e8f5e9; color: #2e7d32; }
    .eh2-a-none { color: var(--dt-text-disable); }

    .eh2-a-actions { display: flex; gap: 2px; }
    .eh2-a-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-secondary);
      cursor: pointer;
    }
    .eh2-a-action:hover { background: #ebebeb; color: var(--dt-text-primary); }
    .eh2-a-action--danger { color: #d32f2f; }
    .eh2-a-action--danger:hover { background: #fdecea; }
    .eh2-a-action:disabled { color: #d6d6d6; cursor: default; }
    .eh2-a-action:disabled:hover { background: none; color: #d6d6d6; }

    /* ── Variant B: дерево + панель ── */
    .eh2-b { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .eh2-b-search {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 320px;
      height: 36px;
      padding: 0 10px;
      margin-bottom: 12px;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      background: var(--dt-surface-primary);
      color: var(--dt-text-secondary);
    }
    .eh2-b-search:focus-within { border-color: var(--dt-brand-accent); }
    .eh2-b-search input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 13.5px;
      color: var(--dt-text-primary);
    }
    .eh2-b-search input::placeholder { color: var(--dt-text-disable); }

    .eh2-b-split {
      display: flex;
      flex: 1;
      min-height: 0;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      overflow: hidden;
      background: var(--dt-surface-primary);
    }
    .eh2-b-tree {
      width: 320px;
      min-width: 260px;
      border-right: 1px solid #d6d6d6;
      background: var(--dt-surface-primary);
    }
    .eh2-b-panel { flex: 1; min-width: 0; }

    /* ── Info modal ── */
    .eh2-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(33, 33, 33, 0.32);
      z-index: 170;
    }
    .eh2-info-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 520px;
      max-width: 94vw;
      max-height: 82vh;
      display: flex;
      flex-direction: column;
      background: var(--dt-surface-primary);
      border-radius: 4px;
      box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 0.6), 0 8px 10px rgba(214, 214, 214, 0.6);
      z-index: 171;
      font-family: Roboto, sans-serif;
      animation: eh2-fade 0.16s ease-out;
      overflow: hidden;
    }
    .eh2-info-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #d6d6d6;
    }
    .eh2-info-title { margin: 0; font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
    .eh2-info-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: none;
      color: var(--dt-text-secondary);
      cursor: pointer;
    }
    .eh2-info-close:hover { background: #ebebeb; }
    .eh2-info-body { padding: 16px; overflow-y: auto; }
    .eh2-info-list { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
    .eh2-info-list li { font-size: 13.5px; color: var(--dt-text-primary); line-height: 1.5; }
    .eh2-info-demo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed #d6d6d6;
    }
    .eh2-info-demo-label { font-size: 12.5px; color: var(--dt-text-secondary); }
    .eh2-demo-btn {
      height: 30px;
      padding: 0 12px;
      border: 1px dashed #d6d6d6;
      border-radius: 4px;
      background: none;
      color: var(--dt-text-secondary);
      font-family: Roboto, sans-serif;
      font-size: 12.5px;
      cursor: pointer;
    }
    .eh2-demo-btn:hover { border-color: #d32f2f; color: #d32f2f; }
  `],
})
export class SoundsEventHandlersV2ScreenComponent implements OnInit, OnDestroy {
  private storage = inject(StorageService);
  @ViewChild(GenerationQueuePanelComponent) queuePanel!: GenerationQueuePanelComponent;

  activeVariant: 'A' | 'B' = 'B';
  isLoading = true;
  showError = false;
  refreshSpinner = false;
  feedback: { type: 'success' | 'error'; text: string } | null = null;

  collections: DvCollection[] = [];
  handlers: DvEventHandler[] = [];

  selectedHandlerId: number | null = null;
  checkedIds = new Set<number>();
  searchV2 = '';

  createCollectionOpen = false;
  renameCollection: DvCollection | null = null;
  createHandlerOpen = false;
  editingHandler: DvEventHandler | null = null;
  infoOpen = false;

  generationQueue: GenerationQueueItem[] = [];
  confirmTarget: { kind: 'collection' | 'handler'; id: number; name: string } | null = null;

  private expandedA = new Set<number>();
  private timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.collections = this.storage.load('web-screens', 'sounds-eh-v2-collections', MOCK_DV_COLLECTIONS);
    this.handlers = this.storage.load('web-screens', 'sounds-eh-v2-handlers', MOCK_DV_HANDLERS);
    this.generationQueue = this.storage.load('web-screens', 'sound-generation-queue', []);

    // раскрыть все группы в варианте A
    this.collections.forEach(c => this.expandedA.add(c.id));
    this.expandedA.add(-1);

    if (this.handlers.length > 0) {
      this.selectedHandlerId = this.handlers[0].id;
    }

    this.timers.push(
      setTimeout(() => {
        this.isLoading = false;
      }, 600)
    );
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearTimeout(t));
  }

  // ── Геттеры ─────────────────────────────────────────

  get selectedHandler(): DvEventHandler | null {
    return this.handlers.find(h => h.id === this.selectedHandlerId) ?? null;
  }

  get orphanHandlers(): DvEventHandler[] {
    return this.handlers.filter(h => h.collectionIds.length === 0);
  }

  /** Для GenerationQueuePanel (совместимость по структуре) */
  get queueHandlers(): SoundEventHandler[] {
    return this.handlers as unknown as SoundEventHandler[];
  }

  get confirmMessage(): string {
    if (!this.confirmTarget) return '';
    if (this.confirmTarget.kind === 'collection') {
      return `Удалить коллекцию «${this.confirmTarget.name}»? Все данные о ней, включая обработчики, будут удалены.`;
    }
    return `Удалить обработчик «${this.confirmTarget.name}»?`;
  }

  isSystemCollection(c: DvCollection): boolean {
    return !!c.isSystem;
  }

  isSystemHandler(h: DvEventHandler): boolean {
    return h.collectionIds.some(cid => this.collections.find(c => c.id === cid)?.isSystem);
  }

  handlerPrefix(h: DvEventHandler): string {
    return this.isSystemHandler(h) ? getSystemHandlerPrefix(h.name) : '';
  }

  handlersInCollection(cid: number): DvEventHandler[] {
    return this.handlers.filter(h => h.collectionIds.includes(cid));
  }

  isExpandedA(groupId: number): boolean {
    return this.expandedA.has(groupId);
  }

  toggleCollectionA(groupId: number): void {
    if (this.expandedA.has(groupId)) {
      this.expandedA.delete(groupId);
    } else {
      this.expandedA.add(groupId);
    }
    this.expandedA = new Set(this.expandedA);
  }

  // ── Варианты ────────────────────────────────────────

  switchVariant(v: 'A' | 'B'): void {
    this.activeVariant = v;
  }

  // ── Создание / переименование коллекции ─────────────

  openCreateCollection(): void {
    this.renameCollection = null;
    this.createCollectionOpen = true;
  }

  openRenameCollection(col: DvCollection, event: Event): void {
    event.stopPropagation();
    this.createCollectionOpen = false;
    this.renameCollection = col;
  }

  closeCollectionPanel(): void {
    this.createCollectionOpen = false;
    this.renameCollection = null;
  }

  onCollectionSave(name: string): void {
    if (this.renameCollection) {
      this.collections = this.collections.map(c =>
        c.id === this.renameCollection!.id ? { ...c, name } : c
      );
      this.showFeedback('success', `Коллекция переименована в «${name}»`);
    } else {
      const maxId = this.collections.reduce((m, c) => Math.max(m, c.id), 0);
      this.collections = [...this.collections, { id: maxId + 1, name }];
      this.showFeedback('success', `Коллекция «${name}» создана`);
    }
    this.persist();
    this.closeCollectionPanel();
  }

  copyCollection(col: DvCollection, event: Event): void {
    event.stopPropagation();
    const maxColId = this.collections.reduce((m, c) => Math.max(m, c.id), 0);
    const newCol: DvCollection = { id: maxColId + 1, name: col.name + ' (копия)' };
    this.collections = [...this.collections, newCol];

    let maxHId = this.handlers.reduce((m, h) => Math.max(m, h.id), 0);
    const copies: DvEventHandler[] = this.handlersInCollection(col.id).map(h => ({
      ...h,
      id: ++maxHId,
      name: h.name + ' (копия)',
      collectionIds: [newCol.id],
    }));
    this.handlers = [...this.handlers, ...copies];
    this.expandedA.add(newCol.id);
    this.persist();
    this.showFeedback('success', `Коллекция скопирована вместе с ${copies.length} обработчиками`);
  }

  requestDeleteCollection(col: DvCollection, event: Event): void {
    event.stopPropagation();
    this.confirmTarget = { kind: 'collection', id: col.id, name: col.name };
  }

  // ── Обработчики: создание / редактирование ──────────

  openCreateHandler(): void {
    this.editingHandler = null;
    this.createHandlerOpen = true;
  }

  editHandler(h: DvEventHandler): void {
    this.editingHandler = h;
    this.createHandlerOpen = true;
  }

  closeHandlerModal(): void {
    this.createHandlerOpen = false;
    this.editingHandler = null;
  }

  onHandlerModalSave(data: HandlerCreateData): void {
    if (this.editingHandler) {
      const idx = this.handlers.findIndex(h => h.id === this.editingHandler!.id);
      if (idx !== -1) {
        this.handlers[idx] = {
          ...this.handlers[idx],
          name: data.name,
          collectionIds: [...data.collectionIds],
          events: [...data.events],
          voiceType: data.voiceType,
          fileName: data.voiceType === 'file' ? data.fileName : undefined,
          fileSizeKb: data.voiceType === 'file' ? data.fileSizeKb : undefined,
          voiceName: data.voiceType === 'generation' ? data.voiceName : undefined,
          phraseText: data.voiceType === 'generation' ? data.phraseText : undefined,
          generationStatus: data.voiceType === 'generation' ? 'pending' : undefined,
        };
        this.handlers = [...this.handlers];
        this.showFeedback('success', `Обработчик «${data.name}» сохранён`);
      }
    } else {
      const maxId = this.handlers.reduce((m, h) => Math.max(m, h.id), 0);
      const handler: DvEventHandler = {
        id: maxId + 1,
        name: data.name,
        collectionIds: [...data.collectionIds],
        events: [...data.events],
        voiceType: data.voiceType,
        fileName: data.voiceType === 'file' ? data.fileName : undefined,
        fileSizeKb: data.voiceType === 'file' ? data.fileSizeKb : undefined,
        voiceName: data.voiceType === 'generation' ? data.voiceName : undefined,
        phraseText: data.voiceType === 'generation' ? data.phraseText : undefined,
        generationStatus: data.voiceType === 'generation' ? 'pending' : undefined,
      };
      this.handlers = [...this.handlers, handler];
      this.selectedHandlerId = handler.id;
      this.showFeedback('success', `Обработчик «${data.name}» создан`);

      if (data.voiceType === 'generation' && data.phraseText?.trim()) {
        this.queuePanel.addToQueue(handler.id, data.name, data.phraseText, data.voiceName ?? 'Светлана');
      }
    }
    this.persist();
    this.closeHandlerModal();
  }

  copyHandler(h: DvEventHandler): void {
    this.copyHandlerById(h.id);
  }

  copyHandlerById(id: number): void {
    const h = this.handlers.find(x => x.id === id);
    if (!h) return;
    const maxId = this.handlers.reduce((m, x) => Math.max(m, x.id), 0);
    const copy: DvEventHandler = {
      ...h,
      id: maxId + 1,
      name: h.name + ' (копия)',
      collectionIds: [],
    };
    this.handlers = [...this.handlers, copy];
    this.persist();
    this.showFeedback('success', `Копия создана в «Без коллекции»`);
  }

  requestDeleteHandler(h: DvEventHandler): void {
    this.requestDeleteHandlerById(h.id);
  }

  requestDeleteHandlerById(id: number): void {
    const h = this.handlers.find(x => x.id === id);
    if (!h || this.isSystemHandler(h)) return;
    this.confirmTarget = { kind: 'handler', id, name: h.name };
  }

  confirmDelete(): void {
    const target = this.confirmTarget;
    if (!target) return;

    if (target.kind === 'collection') {
      // каскадное удаление: коллекция + все её обработчики
      this.collections = this.collections.filter(c => c.id !== target.id);
      this.handlers = this.handlers.filter(h => !h.collectionIds.includes(target.id));
      this.expandedA.delete(target.id);
      this.showFeedback('success', `Коллекция «${target.name}» удалена вместе с обработчиками`);
    } else {
      this.handlers = this.handlers.filter(h => h.id !== target.id);
      if (this.selectedHandlerId === target.id) {
        this.selectedHandlerId = null;
      }
      this.showFeedback('success', `Обработчик «${target.name}» удалён`);
    }
    this.confirmTarget = null;
    this.persist();
  }

  // ── Дерево (вариант B) ─────────────────────────────

  onSelectHandler(id: number): void {
    this.selectedHandlerId = id;
  }

  onToggleHandlerCheck(id: number): void {
    const next = new Set(this.checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.checkedIds = next;
  }

  onToggleCollectionCheck(cid: number): void {
    const group = this.handlersInCollection(cid);
    const next = new Set(this.checkedIds);
    const allChecked = group.length > 0 && group.every(h => next.has(h.id));
    if (allChecked) {
      group.forEach(h => next.delete(h.id));
    } else {
      group.forEach(h => next.add(h.id));
    }
    this.checkedIds = next;
  }

  onMassCopy(): void {
    const ids = Array.from(this.checkedIds);
    const source = this.handlers.filter(h => ids.includes(h.id));
    if (source.length === 0) return;

    let maxId = this.handlers.reduce((m, x) => Math.max(m, x.id), 0);
    const copies: DvEventHandler[] = source.map(h => ({
      ...h,
      id: ++maxId,
      name: h.name + ' (копия)',
      collectionIds: [],
    }));
    this.handlers = [...this.handlers, ...copies];
    this.checkedIds = new Set();
    this.persist();
    this.showFeedback('success', `Скопировано обработчиков: ${copies.length} (в «Без коллекции»)`);
  }

  // ── Панель (вариант B) ─────────────────────────────

  onPanelSave(draft: DvEventHandler): void {
    const prev = this.handlers.find(h => h.id === draft.id);
    const idx = this.handlers.findIndex(h => h.id === draft.id);
    if (idx === -1) return;

    let updated = { ...draft, collectionIds: [...draft.collectionIds], events: [...draft.events] };

    if (updated.voiceType === 'generation') {
      updated = { ...updated, fileName: undefined, fileSizeKb: undefined };
      if (prev && (prev.phraseText ?? '') !== (draft.phraseText ?? '')) {
        updated = { ...updated, generationStatus: 'pending' };
      }
    } else {
      updated = { ...updated, voiceName: undefined, phraseText: undefined, generationStatus: undefined };
    }

    this.handlers[idx] = updated;
    this.handlers = [...this.handlers];
    this.persist();
    this.showFeedback('success', `Обработчик «${updated.name}» сохранён`);
  }

  onEnqueue(e: { handlerId: number; handlerName: string; phraseText: string; voiceName: string }): void {
    const idx = this.handlers.findIndex(x => x.id === e.handlerId);
    if (idx !== -1) {
      this.handlers[idx] = { ...this.handlers[idx], generationStatus: 'pending' };
      this.handlers = [...this.handlers];
      this.persist();
    }
    this.queuePanel.addToQueue(e.handlerId, e.handlerName, e.phraseText, e.voiceName);
    this.showFeedback('success', `Фраза отправлена в очередь генерации`);
  }

  // ── Очередь генерации ──────────────────────────────

  onQueueChanged(queue: GenerationQueueItem[]): void {
    this.generationQueue = queue;
  }

  onQueueHandlerUpdated(updated: SoundEventHandler): void {
    const idx = this.handlers.findIndex(x => x.id === updated.id);
    if (idx !== -1) {
      this.handlers[idx] = { ...this.handlers[idx], generationStatus: 'done', fileSize: updated.fileSize };
      this.handlers = [...this.handlers];
      this.persist();
    }
  }

  openHandlerFromQueue(qi: GenerationQueueItem): void {
    const h = this.handlers.find(x => x.id === qi.handlerId);
    if (h) {
      this.selectedHandlerId = h.id;
      this.activeVariant = 'B';
    }
  }

  // ── Обновить список / состояния ────────────────────

  refreshList(): void {
    this.refreshSpinner = true;
    this.timers.push(
      setTimeout(() => {
        this.refreshSpinner = false;
        if (this.showError) {
          // повторная попытка после ошибки — успех
          this.showError = false;
          this.collections = this.storage.load('web-screens', 'sounds-eh-v2-collections', MOCK_DV_COLLECTIONS);
          this.handlers = this.storage.load('web-screens', 'sounds-eh-v2-handlers', MOCK_DV_HANDLERS);
        }
        this.showFeedback('success', 'Список обновлён');
      }, 800)
    );
  }

  simulateError(): void {
    this.infoOpen = false;
    this.showError = true;
  }

  private showFeedback(type: 'success' | 'error', text: string): void {
    this.feedback = { type, text };
    this.timers.push(
      setTimeout(() => {
        this.feedback = null;
      }, 3000)
    );
  }

  // ── Хранение ───────────────────────────────────────

  private persist(): void {
    this.storage.save('web-screens', 'sounds-eh-v2-collections', this.collections);
    this.storage.save('web-screens', 'sounds-eh-v2-handlers', this.handlers);
  }
}
