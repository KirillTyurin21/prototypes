import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import {
  CAMPAIGN_ASSIGNMENTS,
  WIZARD_PRODUCTS,
  WIZARD_TERMINALS,
  Q4_CAMPAIGNS,
  Q4_CAMPAIGN_FOLDERS,
  Q4_GALLERY_FILES,
  Q4_CAMPAIGN_MEDIA,
  Q4_STANDARD_MODES,
  Q4_CUSTOM_MODES,
} from '../data/mock-data';
import { Q4_COMMON_STYLES } from '../data/q4-common.styles';
import { CampaignAssignment, WizardProduct, Q4Campaign, Q4CampaignMedia } from '../types';

@Component({
  selector: 'app-task-1-1-content-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="c-container">
      <!-- ================= СПИСОК КАМПАНИЙ ================= -->
      <ng-container *ngIf="view === 'list'">
        <app-q4-crumbs [items]="listCrumbs"></app-q4-crumbs>

        <div class="q4-page-header">
          <h1 class="q4-page-title">Кампании</h1>
          <div class="q4-header-actions">
            <button class="q4-btn q4-btn-primary" (click)="createFolderOpen = true">
              <lucide-icon name="folder-plus" [size]="18"></lucide-icon>
              Создать папку
            </button>
            <button class="q4-btn q4-btn-primary" (click)="openNew()">
              <lucide-icon name="file-plus-2" [size]="18"></lucide-icon>
              Добавить
            </button>
            <button class="q4-btn q4-btn-primary c-btn-icon-only" (click)="showSnack('Справка «Рекламные кампании» (демо)')" aria-label="Справка">
              <lucide-icon name="info" [size]="18"></lucide-icon>
            </button>
          </div>
        </div>

        <div class="q4-note">
          <lucide-icon name="info" [size]="15"></lucide-icon>
          <span>Целевое решение 1.1: единый мастер «Где показывать» в карточке кампании. Откройте <b>«Промо «Завтраки»»</b> — там уже есть назначения и кнопка добавления.</span>
        </div>

        <div class="q4-table-wrap">
          <table class="q4-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Период действия</th>
                <th>Время действия</th>
                <th>Разрешение</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="currentFolder !== null" (click)="currentFolder = null" class="c-row-click">
                <td colspan="5" class="c-up-cell">
                  <span class="c-name-link">
                    <lucide-icon name="folder" [size]="16"></lucide-icon>
                    ..
                  </span>
                </td>
              </tr>
              <tr *ngFor="let f of visibleFolders" (click)="currentFolder = f.id" class="c-row-click">
                <td>
                  <span class="c-name-link">
                    <lucide-icon name="folder" [size]="16"></lucide-icon>
                    {{ f.name }}
                  </span>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td class="q4-actions" (click)="$event.stopPropagation()">
                  <button class="q4-icon-btn" (click)="showSnack('Переименование папки (демо)')" aria-label="Редактировать папку">
                    <lucide-icon name="pencil" [size]="18"></lucide-icon>
                  </button>
                  <button class="q4-icon-btn" (click)="showSnack('Удаление папки (демо)')" aria-label="Удалить папку">
                    <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                  </button>
                </td>
              </tr>
              <tr *ngFor="let c of visibleCampaigns" (click)="openEditor(c)" class="c-row-click">
                <td><span class="c-name-link">{{ c.name }}</span></td>
                <td>{{ c.from }} — {{ c.to }}</td>
                <td>{{ c.timeFrom }} — {{ c.timeTo }}</td>
                <td>{{ c.resolution }}</td>
                <td class="q4-actions" (click)="$event.stopPropagation()">
                  <button class="q4-icon-btn" (click)="openEditor(c)" aria-label="Редактировать кампанию">
                    <lucide-icon name="pencil" [size]="18"></lucide-icon>
                  </button>
                  <button class="q4-icon-btn" (click)="deleteCampaign(c)" aria-label="Удалить кампанию">
                    <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                  </button>
                  <button class="q4-icon-btn" (click)="moveCampaign(c)" aria-label="Переместить кампанию">
                    <lucide-icon name="signpost" [size]="18"></lucide-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <!-- ================= РЕДАКТОР КАМПАНИИ ================= -->
      <ng-container *ngIf="view === 'editor'">
        <app-q4-crumbs [items]="editorCrumbs"></app-q4-crumbs>

        <div class="q4-page-header">
          <div class="c-title-group">
            <button class="q4-icon-btn q4-icon-btn-border c-back-btn" (click)="view = 'list'" aria-label="Назад">
              <lucide-icon name="arrow-left" [size]="20"></lucide-icon>
            </button>
            <h1 class="q4-page-title">{{ isNew ? 'Новая кампания' : 'Редактирование кампании' }}</h1>
          </div>
          <div class="q4-header-actions">
            <button class="q4-btn q4-btn-primary" [disabled]="!formValid()" (click)="save()">
              <lucide-icon name="save" [size]="16"></lucide-icon>
              Сохранить
            </button>
          </div>
        </div>

        <!-- Поля -->
        <div class="c-card">
          <div class="c-fields-row">
            <div class="q4-mdc-field c-w-name" [class.has-value]="campaign.name">
              <input class="q4-mdc-input" [value]="campaign.name" (input)="campaign.name = $any($event.target).value" />
              <label class="q4-mdc-label">Название кампании *</label>
            </div>
            <div class="q4-mdc-field c-w-date" [class.has-value]="campaign.from">
              <input class="q4-mdc-input" [value]="campaign.from" readonly />
              <label class="q4-mdc-label">Дата начала *</label>
              <button class="c-field-suffix" (click)="openCalendar('from')" aria-label="Календарь">
                <lucide-icon name="calendar" [size]="18"></lucide-icon>
              </button>
            </div>
            <div class="q4-mdc-field c-w-date" [class.has-value]="campaign.to">
              <input class="q4-mdc-input" [value]="campaign.to" readonly />
              <label class="q4-mdc-label">Дата окончания *</label>
              <button class="c-field-suffix" (click)="openCalendar('to')" aria-label="Календарь">
                <lucide-icon name="calendar" [size]="18"></lucide-icon>
              </button>
            </div>
            <div class="q4-mdc-field c-w-time" [class.has-value]="true">
              <input class="q4-mdc-input" type="time" [value]="campaign.timeFrom" (input)="campaign.timeFrom = $any($event.target).value" />
              <label class="q4-mdc-label">Время начала *</label>
            </div>
            <div class="q4-mdc-field c-w-time" [class.has-value]="true">
              <input class="q4-mdc-input" type="time" [value]="campaign.timeTo" (input)="campaign.timeTo = $any($event.target).value" />
              <label class="q4-mdc-label">Время окончания *</label>
            </div>
          </div>

          <div class="c-days-row">
            <span class="c-days-caption">Дни недели</span>
            <div class="c-days-toggle">
              <button
                class="c-day"
                [class.checked]="campaign.days[i]"
                *ngFor="let d of days; let i = index"
                (click)="toggleDay(i)"
              >
                {{ d }}
              </button>
            </div>
          </div>
        </div>

        <!-- Вкладки верхнего уровня -->
        <div class="c-top-tabs">
          <button class="c-top-tab" [class.active]="mainTab === 'content'" (click)="mainTab = 'content'">Контент</button>
          <button class="c-top-tab" [class.active]="mainTab === 'where'" (click)="mainTab = 'where'">
            Где показывать
            <span class="c-tab-count" *ngIf="assignments.length > 0">{{ assignments.length }}</span>
          </button>
        </div>

        <!-- === Контент === -->
        <div class="c-card c-card-body" *ngIf="mainTab === 'content'">
          <div class="c-vtabs">
            <div class="c-vtab" [class.active]="activeResolution === 'main'" (click)="activeResolution = 'main'">
              <span class="c-vtab-label">1024x768</span>
            </div>
            <div
              class="c-vtab"
              *ngFor="let r of extraResolutions"
              [class.active]="activeResolution === r"
              (click)="activeResolution = r"
            >
              <span class="c-vtab-del" (click)="removeResolution(r, $event)">
                <lucide-icon name="x" [size]="14"></lucide-icon>
              </span>
              <span class="c-vtab-label">{{ r }}</span>
            </div>
            <div class="c-vtab c-vtab-add" [class.active]="activeResolution === 'add'" (click)="activeResolution = 'add'">
              Добавить разрешение
            </div>
          </div>

          <div class="c-editor-main">
            <div class="c-res-form" *ngIf="activeResolution === 'add'">
              <div class="q4-mdc-field c-w-res">
                <input class="q4-mdc-input" type="number" [value]="newResW" (input)="newResW = +$any($event.target).value" />
                <label class="q4-mdc-label">Ширина</label>
              </div>
              <div class="q4-mdc-field c-w-res">
                <input class="q4-mdc-input" type="number" [value]="newResH" (input)="newResH = +$any($event.target).value" />
                <label class="q4-mdc-label">Высота</label>
              </div>
              <button class="q4-btn q4-btn-primary" (click)="addResolution()">Создать</button>
            </div>

            <ng-container *ngIf="activeResolution !== 'add'">
              <div class="c-htabs">
                <button
                  class="c-htab"
                  *ngFor="let m of fixedModes"
                  [class.active]="activeMode === m"
                  (click)="activeMode = m"
                >
                  {{ m }}
                </button>
                <button
                  class="c-htab"
                  *ngFor="let m of addedModes"
                  [class.active]="activeMode === m"
                  (click)="activeMode = m"
                >
                  {{ m }}
                  <span class="c-htab-close" (click)="removeMode(m, $event)">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </span>
                </button>
                <button class="c-htab-plus" (click)="modeSelectorOpen = !modeSelectorOpen" aria-label="Добавить режим">
                  <lucide-icon name="plus" [size]="18"></lucide-icon>
                </button>
                <div class="c-mode-selector" *ngIf="modeSelectorOpen">
                  <div class="c-mode-group-label">Стандартные</div>
                  <div class="c-mode-option" *ngFor="let m of standardModes" (click)="addMode(m)">
                    {{ m }}
                    <span class="c-mode-option-code">({{ modeCode(m) }})</span>
                  </div>
                  <div class="c-mode-group-label">Кастомные</div>
                  <div class="c-mode-option" *ngFor="let m of customModes" (click)="addMode(m)">
                    {{ m }}
                  </div>
                </div>
              </div>

              <div class="c-advertise">
                <div class="c-elements">
                  <div class="c-element" *ngFor="let m of media">
                    <div class="c-media-thumb" [style.background]="m.color">
                      <lucide-icon [name]="m.type === 'video' ? 'film' : 'image'" [size]="20"></lucide-icon>
                    </div>
                    <div class="c-media-info">
                      <div class="c-media-name">{{ m.name }}</div>
                      <div class="c-media-meta">
                        {{ m.type === 'video' ? 'Видео' : 'Изображение' }} · Размер: {{ m.size }} · Разрешение: {{ m.resolution }}
                      </div>
                      <div class="c-duration">
                        <input type="number" [value]="m.durationMin" (input)="m.durationMin = +$any($event.target).value" />
                        мин
                        <input type="number" [value]="m.durationSec" (input)="m.durationSec = +$any($event.target).value" />
                        сек.
                      </div>
                    </div>
                    <button class="c-media-close" (click)="removeMedia(m)" aria-label="Удалить медиа">
                      <lucide-icon name="x" [size]="14"></lucide-icon>
                    </button>
                  </div>
                  <button class="c-add-media" (click)="galleryOpen = true">
                    <lucide-icon name="plus" [size]="18"></lucide-icon>
                    Добавить изображение или видео
                  </button>
                </div>

                <div class="c-canvas">
                  <div class="c-canvas-empty" *ngIf="media.length === 0">
                    Здесь может быть ваше изображение или видео
                  </div>
                  <div class="c-canvas-item" *ngFor="let m of media" [style.background]="m.color">
                    {{ m.name }} · {{ m.durationMin }}:{{ m.durationSec < 10 ? '0' + m.durationSec : m.durationSec }}
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- === Где показывать === -->
        <div class="c-card c-card-body" *ngIf="mainTab === 'where'">
          <div class="c-where-wrap">
            <div class="c-where-head">
            <span class="c-where-hint">Назначения кампании на устройства и слоты показа</span>
            <button class="q4-btn q4-btn-primary" (click)="openWizard()">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              Добавить назначение
            </button>
          </div>

          <div class="c-where-empty" *ngIf="assignments.length === 0">
            Назначений пока нет — нажмите «Добавить назначение».
          </div>

          <div class="c-assign-row" *ngFor="let a of assignments">
            <lucide-icon [name]="productIcon(a.product)" [size]="18" class="c-assign-icon"></lucide-icon>
            <div class="c-assign-main">
              <div class="c-assign-name">{{ a.terminal }}</div>
              <div class="c-assign-meta">{{ a.productLabel }} · слот показа: {{ a.slot }}</div>
            </div>
            <button class="q4-icon-btn" (click)="removeAssignment(a)" aria-label="Удалить назначение">
              <lucide-icon name="trash-2" [size]="16"></lucide-icon>
            </button>
          </div>

            <div class="q4-note">
              <lucide-icon name="info" [size]="15"></lucide-icon>
              Назначение пишется в существующие модели привязки продукта (terminal-mapping, маппинг киоска, свойства темы) — транспорт до устройств не меняется.
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ================= ДИАЛОГИ ================= -->

      <!-- Создать папку -->
      <div class="q4-overlay" *ngIf="createFolderOpen" (click)="createFolderOpen = false">
        <div class="q4-dialog" (click)="$event.stopPropagation()">
          <div class="q4-dialog-title">Новая папка</div>
          <div class="q4-dialog-text">
            <div class="q4-mdc-field c-full" [class.has-value]="newFolderName">
              <input class="q4-mdc-input" [value]="newFolderName" (input)="newFolderName = $any($event.target).value" placeholder="Введите название" />
              <label class="q4-mdc-label">Название папки</label>
            </div>
          </div>
          <div class="q4-dialog-actions">
            <button class="q4-btn q4-btn-outline" (click)="createFolderOpen = false">Отмена</button>
            <button class="q4-btn q4-btn-primary" [disabled]="!newFolderName.trim()" (click)="createFolder()">Создать</button>
          </div>
        </div>
      </div>

      <!-- Удалить -->
      <div class="q4-overlay" *ngIf="deleteTarget" (click)="deleteTarget = null">
        <div class="q4-dialog q4-dialog-sm" (click)="$event.stopPropagation()">
          <div class="q4-dialog-title">Удалить</div>
          <div class="q4-dialog-text">Вы уверены?</div>
          <div class="q4-dialog-actions">
            <button class="q4-btn q4-btn-outline" (click)="deleteTarget = null">Отмена</button>
            <button class="q4-btn q4-btn-primary" (click)="confirmDelete()">Да</button>
          </div>
        </div>
      </div>

      <!-- Переместить -->
      <div class="q4-overlay" *ngIf="moveTarget" (click)="moveTarget = null">
        <div class="q4-dialog c-move-dialog" (click)="$event.stopPropagation()">
          <div class="c-move-head">Переместить элемент: {{ moveTarget.name }}</div>
          <div class="c-move-body">
            <div class="c-move-row" [class.selected]="moveFolder === null" (click)="moveFolder = null">Корневая папка</div>
            <div
              class="c-move-row"
              *ngFor="let f of folders"
              [class.selected]="moveFolder === f.id"
              (click)="moveFolder = f.id"
            >
              {{ f.name }}
            </div>
          </div>
          <div class="q4-dialog-actions">
            <button class="q4-btn q4-btn-outline" (click)="moveTarget = null">Отмена</button>
            <button class="q4-btn q4-btn-primary" (click)="confirmMove()">Переместить сюда</button>
          </div>
        </div>
      </div>

      <!-- Галерея -->
      <div class="q4-overlay" *ngIf="galleryOpen" (click)="galleryOpen = false">
        <div class="q4-dialog c-gallery-dialog" (click)="$event.stopPropagation()">
          <div class="q4-dialog-head">
            <span class="q4-dialog-head-title">Галерея</span>
            <button class="q4-icon-btn" (click)="galleryOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="c-gallery-body">
            <div class="c-gallery-row" *ngFor="let f of galleryFiles" [class.selected]="selectedGallery.includes(f.id)" (click)="toggleGallery(f.id)">
              <div class="c-gallery-thumb" [style.background]="f.color">
                <lucide-icon name="image" [size]="16"></lucide-icon>
              </div>
              <span class="c-gallery-name">{{ f.name }}</span>
              <span class="c-gallery-meta">{{ f.date }} · {{ f.size }}</span>
            </div>
          </div>
          <div class="q4-dialog-foot">
            <button class="q4-btn q4-btn-outline" (click)="galleryOpen = false">Отмена</button>
            <button class="q4-btn q4-btn-primary" [disabled]="!selectedGallery.length" (click)="chooseGallery()">Выбрать</button>
          </div>
        </div>
      </div>

      <!-- Календарь -->
      <div class="q4-overlay" *ngIf="calendarOpen" (click)="calendarOpen = false">
        <div class="c-calendar" (click)="$event.stopPropagation()">
          <div class="c-cal-head">
            <button class="q4-icon-btn" (click)="shiftMonth(-1)" aria-label="Предыдущий месяц">
              <lucide-icon name="chevron-left" [size]="18"></lucide-icon>
            </button>
            <span class="c-cal-title">{{ monthName }} {{ calYear }}</span>
            <button class="q4-icon-btn" (click)="shiftMonth(1)" aria-label="Следующий месяц">
              <lucide-icon name="chevron-right" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="c-cal-weekdays">
            <span *ngFor="let w of weekdays">{{ w }}</span>
          </div>
          <div class="c-cal-grid">
            <span
              class="c-cal-day"
              *ngFor="let d of calDays"
              [class.empty]="d === null"
              [class.selected]="d === selectedDay"
              (click)="d !== null && pickDay(d)"
            >
              {{ d || '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Мастер «Где показывать» -->
      <div class="q4-overlay" *ngIf="wizardOpen" (click)="wizardOpen = false">
        <div class="q4-dialog c-wizard-dialog" (click)="$event.stopPropagation()">
          <div class="q4-dialog-head">
            <span class="q4-dialog-head-title">Где показывать — новое назначение</span>
            <button class="q4-icon-btn" (click)="wizardOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>

          <div class="c-stepper">
            <span class="c-step" [class.active]="step >= 1">1. Продукт</span>
            <span class="c-step-arrow">→</span>
            <span class="c-step" [class.active]="step >= 2">2. Точка / терминал</span>
            <span class="c-step-arrow">→</span>
            <span class="c-step" [class.active]="step >= 3">3. Слот показа</span>
          </div>

          <div class="q4-dialog-body">
            <div *ngIf="step === 1" class="c-step-grid">
              <button
                class="c-product-tile"
                [class.selected]="wProduct?.id === p.id"
                *ngFor="let p of products"
                (click)="wProduct = p"
              >
                <lucide-icon [name]="p.icon" [size]="22"></lucide-icon>
                <span>{{ p.label }}</span>
              </button>
            </div>

            <div *ngIf="step === 2">
              <div class="c-check" *ngFor="let t of filteredTerminals">
                <label class="c-check-label">
                  <input type="checkbox" [checked]="wTerminals.includes(t.id)" (change)="toggleTerminal(t.id)" />
                  {{ t.label }}
                </label>
              </div>
            </div>

            <div *ngIf="step === 3">
              <div class="c-check" *ngFor="let s of wProduct?.slots || []">
                <label class="c-check-label">
                  <input type="radio" name="slot" [value]="s" [checked]="wSlot === s" (change)="wSlot = s" />
                  {{ s }}
                </label>
              </div>
            </div>
          </div>

          <div class="q4-dialog-foot">
            <button class="q4-btn q4-btn-outline" *ngIf="step > 1" (click)="step = step - 1">Назад</button>
            <button class="q4-btn q4-btn-primary" *ngIf="step < 3" (click)="nextStep()" [disabled]="!canNext()">Далее</button>
            <button class="q4-btn q4-btn-primary" *ngIf="step === 3" (click)="finishWizard()" [disabled]="!wSlot">Готово</button>
          </div>
        </div>
      </div>

      <!-- Тост -->
      <div class="q4-toast" *ngIf="snack">
        <lucide-icon name="check-circle" [size]="16"></lucide-icon>
        {{ snack }}
      </div>
    </div>
  `,
  styles: [
    Q4_COMMON_STYLES,
    `
      :host { display: block; }
      .c-container { max-width: 1200px; margin: 0 auto; padding: 20px 24px; font-family: Roboto, sans-serif; }

      /* список */
      .c-row-click { cursor: pointer; }
      .c-up-cell { color: #757575; }
      .c-name-link { display: inline-flex; align-items: center; gap: 8px; color: #333333; cursor: pointer; }
      .c-name-link lucide-icon { color: #757575; }
      .c-name-link:hover { color: #448AFF; }
      .c-btn-icon-only { width: 36px; padding: 0; }

      /* редактор: заголовок */
      .c-title-group { display: flex; align-items: center; gap: 12px; }
      .c-back-btn { border-radius: 50%; }

      /* карточка формы */
      .c-card {
        background: #FFFFFF;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,.06);
        padding: 16px 20px;
      }
      .c-card-body { margin-top: 0; border-top-left-radius: 0; border-top-right-radius: 0; padding: 0; display: flex; }

      .c-fields-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
      .c-w-name { width: 250px; }
      .c-w-date { width: 250px; }
      .c-w-time { width: 160px; }
      .c-w-res { width: 160px; }
      .c-full { width: 100%; }
      .c-field-suffix {
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
        border: none; background: transparent;
        color: #616161; cursor: pointer;
      }
      .c-field-suffix:hover { background: #EBEBEB; border-radius: 4px; }

      .c-days-row { display: flex; align-items: center; gap: 16px; margin-top: 16px; flex-wrap: wrap; }
      .c-days-caption { font-size: 13px; color: #616161; }
      .c-days-toggle { display: flex; border: 1px solid rgba(0,0,0,.12); border-radius: 4px; overflow: hidden; }
      .c-day {
        height: 48px; padding: 0 10px;
        border: none; border-right: 1px solid rgba(0,0,0,.12);
        background: #FFFFFF;
        font-family: Roboto, sans-serif; font-size: 13px;
        color: #333333; cursor: pointer;
      }
      .c-day:last-child { border-right: none; }
      .c-day.checked { background: rgba(0,0,0,0.1); }
      .c-day:hover { background: #F5F5F5; }

      /* верхние вкладки */
      .c-top-tabs { display: flex; gap: 0; margin-top: 16px; }
      .c-top-tab {
        position: relative;
        border: 1px solid #E0E0E0;
        border-bottom: none;
        background: #FFFFFF;
        border-radius: 4px 4px 0 0;
        padding: 12px 20px;
        font-family: Roboto, sans-serif;
        font-size: 13px;
        color: rgba(0,0,0,.54);
        cursor: pointer;
      }
      .c-top-tab.active { color: #448AFF; font-weight: 500; }
      .c-top-tab.active::after {
        content: '';
        position: absolute; left: 0; right: 0; bottom: 0;
        height: 2px; background: #448AFF;
      }
      .c-tab-count {
        display: inline-block; min-width: 18px;
        font-size: 11px; color: #FFFFFF;
        background: #448AFF; border-radius: 999px;
        padding: 1px 5px; margin-left: 4px;
      }

      /* вертикальные вкладки разрешений */
      .c-vtabs {
        width: 216px; flex-shrink: 0;
        border-right: 1px solid #E0E0E0;
        padding: 8px 0;
        background: #FFFFFF;
      }
      .c-vtab {
        display: flex; align-items: center; gap: 6px;
        height: 48px; padding: 0 16px;
        font-size: 13px; color: rgba(0,0,0,.54);
        cursor: pointer;
      }
      .c-vtab:hover { background: #F5F5F5; }
      .c-vtab.active { color: #448AFF; font-weight: 500; }
      .c-vtab-add { color: #448AFF; }
      .c-vtab-del {
        display: flex; align-items: center; justify-content: center;
        width: 20px; height: 20px;
        border-radius: 3px;
        color: #E1E1E1; cursor: pointer;
      }
      .c-vtab-del:hover { color: #757575; background: #EBEBEB; }

      .c-editor-main { flex: 1; min-width: 0; padding: 16px 20px; }
      .c-res-form { display: flex; align-items: center; gap: 16px; }

      /* горизонтальные вкладки режимов */
      .c-htabs {
        position: relative;
        display: flex; align-items: center;
        border-bottom: 1px solid #E0E0E0;
        margin-bottom: 16px;
      }
      .c-htab {
        position: relative;
        height: 48px; min-width: 160px;
        padding: 0 16px;
        border: none; background: transparent;
        font-family: Roboto, sans-serif; font-size: 13px;
        color: rgba(0,0,0,.54);
        cursor: pointer;
        white-space: nowrap;
      }
      .c-htab.active { color: #448AFF; font-weight: 500; }
      .c-htab.active::after {
        content: '';
        position: absolute; left: 0; right: 0; bottom: -1px;
        height: 2px; background: #448AFF;
      }
      .c-htab-close {
        display: inline-flex; align-items: center; justify-content: center;
        width: 18px; height: 18px; margin-left: 6px;
        border-radius: 3px;
        color: #9E9E9E; cursor: pointer;
        vertical-align: middle;
      }
      .c-htab-close:hover { background: #EBEBEB; color: #616161; }
      .c-htab-plus {
        flex: 0 0 56px;
        height: 48px;
        border: none; background: transparent;
        color: #448AFF; cursor: pointer;
      }
      .c-htab-plus:hover { background: #F5F5F5; }
      .c-mode-selector {
        position: absolute; top: 52px; right: 0;
        min-width: 300px; max-height: 360px;
        background: #FFFFFF;
        border-radius: 4px;
        box-shadow: 0 6px 24px 4px rgba(33,33,33,.12), 0 8px 8px 0 rgba(33,33,33,.12);
        z-index: 100;
        padding: 8px 0;
        overflow-y: auto;
      }
      .c-mode-group-label { font-size: 12px; color: #616161; padding: 8px 16px 4px; }
      .c-mode-option {
        display: flex; align-items: center; gap: 6px;
        height: 48px; padding: 0 16px;
        font-size: 13px; color: #333333;
        cursor: pointer;
      }
      .c-mode-option:hover { background: #F5F5F5; }
      .c-mode-option-code { color: #9E9E9E; font-size: 12px; }

      /* медиа + канвас */
      .c-advertise { display: flex; gap: 40px; min-height: 600px; }
      .c-elements { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
      .c-element {
        position: relative;
        display: flex; gap: 12px;
        border: 1px solid #E1E1E1;
        border-radius: 15px;
        box-shadow: 0 3px 5px 0 rgba(0,0,0,.08);
        padding: 10px 12px;
        background: #FFFFFF;
        min-height: 97px;
      }
      .c-media-thumb {
        width: 75px; height: 75px; flex-shrink: 0;
        border-radius: 5px;
        display: flex; align-items: center; justify-content: center;
        color: #FFFFFF;
      }
      .c-media-info { flex: 1; min-width: 0; }
      .c-media-name { font-size: 13px; font-weight: 500; color: #333333; word-break: break-word; }
      .c-media-meta { font-size: 11px; color: #616161; margin-top: 3px; }
      .c-duration { display: flex; align-items: center; gap: 4px; margin-top: 8px; font-size: 11px; color: #616161; }
      .c-duration input {
        width: 38px; height: 24px;
        border: 1px solid #E0E0E0; border-radius: 3px;
        text-align: center; font-size: 12px; font-family: Roboto, sans-serif;
      }
      .c-media-close {
        position: absolute; top: 8px; right: 8px;
        display: flex; align-items: center; justify-content: center;
        width: 22px; height: 22px;
        border: none; background: transparent; border-radius: 3px;
        color: #9E9E9E; cursor: pointer;
      }
      .c-media-close:hover { background: #EBEBEB; color: #616161; }
      .c-add-media {
        height: 55px;
        border: 1px dashed #E1E1E1;
        border-radius: 15px;
        background: #FAFAFA;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        font-family: Roboto, sans-serif; font-size: 13px;
        color: #616161; cursor: pointer;
      }
      .c-add-media:hover { border-color: #448AFF; color: #448AFF; }

      .c-canvas {
        flex: 1;
        background: rgba(128,128,128,.69);
        border-radius: 4px;
        display: flex; flex-wrap: wrap; gap: 12px;
        padding: 24px;
        align-content: flex-start;
        justify-content: center;
      }
      .c-canvas-empty {
        align-self: center;
        background: rgba(255,255,255,.68);
        border-radius: 15px;
        padding: 30px 40px;
        font-size: 13px; color: #616161;
      }
      .c-canvas-item {
        height: 40px;
        border-radius: 6px;
        padding: 10px 16px;
        color: #FFFFFF; font-size: 12px; font-weight: 500;
      }

      /* Где показывать */
      .c-card-body .c-where-wrap { width: 100%; padding: 16px 20px 20px; }
      .c-where-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .c-where-hint { font-size: 12px; color: #616161; }
      .c-where-empty { font-size: 13px; color: #9E9E9E; padding: 24px 0; text-align: center; }
      .c-assign-row {
        display: flex; align-items: center; gap: 12px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        padding: 10px 14px;
        margin-bottom: 8px;
        background: #F8F9FC;
      }
      .c-assign-icon { color: #448AFF; flex-shrink: 0; }
      .c-assign-main { flex: 1; min-width: 0; }
      .c-assign-name { font-size: 13px; font-weight: 500; color: #333333; }
      .c-assign-meta { font-size: 12px; color: #616161; margin-top: 2px; }

      /* диалог перемещения */
      .c-move-dialog { width: 550px; }
      .c-move-head {
        background: #C5C6CB;
        color: #FFFFFF;
        font-size: 16px;
        padding: 18px 24px;
      }
      .c-move-body { padding: 8px 0; max-height: 280px; overflow-y: auto; }
      .c-move-row { padding: 10px 24px; font-size: 13px; color: #333333; cursor: pointer; }
      .c-move-row:hover { background: #F5F5F5; }
      .c-move-row.selected { background: #F0F5FF; color: #448AFF; }

      /* галерея */
      .c-gallery-dialog { width: 600px; max-width: calc(100vw - 32px); }
      .c-gallery-body { padding: 8px 12px; max-height: 360px; overflow-y: auto; }
      .c-gallery-row {
        display: flex; align-items: center; gap: 12px;
        height: 55px;
        padding: 0 12px;
        border-radius: 4px;
        cursor: pointer;
      }
      .c-gallery-row:hover { background: #F5F5F5; }
      .c-gallery-row.selected { background: #F0F5FF; }
      .c-gallery-thumb {
        width: 36px; height: 36px; flex-shrink: 0;
        border-radius: 4px;
        display: flex; align-items: center; justify-content: center;
        color: #FFFFFF;
      }
      .c-gallery-name { flex: 1; min-width: 0; font-size: 13px; color: #333333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .c-gallery-meta { font-size: 12px; color: #616161; flex-shrink: 0; }

      /* календарь */
      .c-calendar {
        width: 296px;
        background: #FFFFFF;
        border-radius: 4px;
        box-shadow: 0 6px 24px 4px rgba(33,33,33,.12), 0 8px 8px 0 rgba(33,33,33,.12);
        padding: 12px;
      }
      .c-cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .c-cal-title { font-size: 14px; font-weight: 500; color: #333333; }
      .c-cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 4px; }
      .c-cal-weekdays span { text-align: center; font-size: 11px; color: #9E9E9E; padding: 4px 0; }
      .c-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
      .c-cal-day {
        height: 40px;
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; color: #333333;
        cursor: pointer;
        border-radius: 50%;
      }
      .c-cal-day:hover { background: #F5F5F5; }
      .c-cal-day.empty { cursor: default; }
      .c-cal-day.selected { background: #448AFF; color: #FFFFFF; }

      /* мастер */
      .c-wizard-dialog { width: 560px; max-width: calc(100vw - 32px); }
      .c-stepper { display: flex; align-items: center; gap: 8px; padding: 12px 20px; font-size: 12px; border-bottom: 1px solid #E0E0E0; }
      .c-step { color: #9E9E9E; }
      .c-step.active { color: #448AFF; font-weight: 500; }
      .c-step-arrow { color: #9E9E9E; }
      .c-step-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .c-product-tile {
        display: flex; align-items: center; gap: 10px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        background: #FFFFFF;
        padding: 14px;
        font-size: 13px; font-weight: 500;
        color: #333333;
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .c-product-tile:hover { background: #F5F5F5; }
      .c-product-tile.selected { border-color: #448AFF; background: #F0F5FF; color: #2651B5; }
      .c-check { padding: 7px 0; }
      .c-check-label { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #333333; cursor: pointer; }
      input[type='checkbox'], input[type='radio'] { accent-color: #448AFF; width: 16px; height: 16px; }
    `,
  ],
})
export class Task11ContentScreenComponent {
  view: 'list' | 'editor' = 'list';
  mainTab: 'content' | 'where' = 'content';
  currentFolder: number | null = null;

  campaigns: Q4Campaign[] = Q4_CAMPAIGNS.map(c => ({ ...c }));
  folders = Q4_CAMPAIGN_FOLDERS.map(f => ({ ...f }));

  days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

  isNew = false;
  editingId: number | null = null;
  campaign = this.emptyForm();

  activeResolution = 'main';
  extraResolutions: string[] = [];
  newResW = 1024;
  newResH = 768;

  fixedModes = ['Экран заказа', 'Режим ожидания'];
  addedModes: string[] = [];
  standardModes = Q4_STANDARD_MODES;
  customModes = Q4_CUSTOM_MODES;
  activeMode = 'Экран заказа';
  modeSelectorOpen = false;

  media: Q4CampaignMedia[] = Q4_CAMPAIGN_MEDIA.map(m => ({ ...m }));
  galleryFiles = Q4_GALLERY_FILES;
  selectedGallery: number[] = [];

  assignments: CampaignAssignment[] = CAMPAIGN_ASSIGNMENTS.map(a => ({ ...a }));

  products: WizardProduct[] = WIZARD_PRODUCTS;
  wizardOpen = false;
  step = 1;
  wProduct: WizardProduct | null = null;
  wTerminals: string[] = [];
  wSlot = '';

  createFolderOpen = false;
  newFolderName = '';
  deleteTarget: Q4Campaign | null = null;
  moveTarget: Q4Campaign | null = null;
  moveFolder: number | null = null;
  galleryOpen = false;

  calendarOpen = false;
  calendarField: 'from' | 'to' = 'from';
  calYear = 2026;
  calMonth = 8;
  monthNames = ['ЯНВ.', 'ФЕВР.', 'МАР.', 'АПР.', 'МАЙ', 'ИЮН.', 'ИЮЛ.', 'АВГ.', 'СЕН.', 'ОКТ.', 'НОЯБ.', 'ДЕК.'];
  weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  snack = '';

  listCrumbs = [{ label: 'Экраны и звуки' }, { label: 'Кампании' }];
  editorCrumbs = [{ label: 'Экраны и звуки' }, { label: 'Кампании' }, { label: 'Редактирование кампании' }];

  private icons: Record<string, string> = {
    cs: 'monitor',
    arrivals: 'monitor-play',
    kiosk: 'monitor-smartphone',
    menuboard: 'layout-list',
  };

  get visibleCampaigns(): Q4Campaign[] {
    return this.campaigns.filter(c => c.folder === this.currentFolder);
  }

  get visibleFolders() {
    return this.folders;
  }

  get monthName(): string {
    return this.monthNames[this.calMonth];
  }

  get calDays(): (number | null)[] {
    const first = new Date(this.calYear, this.calMonth, 1);
    const lead = (first.getDay() + 6) % 7;
    const dim = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < lead; i++) arr.push(null);
    for (let d = 1; d <= dim; d++) arr.push(d);
    return arr;
  }

  get selectedDay(): number | null {
    const value = this.calendarField === 'from' ? this.campaign.from : this.campaign.to;
    const day = parseInt(value.split('.')[0], 10);
    return isNaN(day) ? null : day;
  }

  private emptyForm() {
    return {
      name: '',
      from: '',
      to: '',
      timeFrom: '00:00',
      timeTo: '23:59',
      days: [true, true, true, true, true, false, false],
    };
  }

  productIcon(product: string): string {
    return this.icons[product] || 'monitor';
  }

  get filteredTerminals() {
    if (!this.wProduct) return [];
    return WIZARD_TERMINALS.filter(t => t.product === this.wProduct!.id);
  }

  // === список ===
  openNew(): void {
    this.isNew = true;
    this.editingId = null;
    this.campaign = this.emptyForm();
    this.mainTab = 'content';
    this.view = 'editor';
  }

  openEditor(c: Q4Campaign): void {
    this.isNew = false;
    this.editingId = c.id;
    const parts = c.from.split('.');
    this.campaign = {
      name: c.name,
      from: c.from,
      to: c.to,
      timeFrom: c.timeFrom,
      timeTo: c.timeTo,
      days: [true, true, true, true, true, false, false],
    };
    this.calYear = +parts[2];
    this.calMonth = +parts[1] - 1;
    this.mainTab = 'content';
    this.activeResolution = 'main';
    this.addedModes = [];
    this.view = 'editor';
  }

  deleteCampaign(c: Q4Campaign): void {
    this.deleteTarget = c;
  }

  confirmDelete(): void {
    if (this.deleteTarget) {
      this.campaigns = this.campaigns.filter(x => x.id !== this.deleteTarget!.id);
    }
    this.deleteTarget = null;
    this.showSnack('Удалено');
  }

  moveCampaign(c: Q4Campaign): void {
    this.moveTarget = c;
    this.moveFolder = c.folder;
  }

  confirmMove(): void {
    if (this.moveTarget) {
      const idx = this.campaigns.findIndex(x => x.id === this.moveTarget!.id);
      if (idx >= 0) this.campaigns[idx].folder = this.moveFolder;
    }
    this.moveTarget = null;
    this.showSnack('Перемещено');
  }

  createFolder(): void {
    const name = this.newFolderName.trim();
    if (!name) return;
    const id = this.folders.length ? Math.max(...this.folders.map(f => f.id)) + 1 : 1;
    this.folders.push({ id, name });
    this.createFolderOpen = false;
    this.newFolderName = '';
    this.showSnack('Сохранено');
  }

  // === редактор ===
  formValid(): boolean {
    return !!(
      this.campaign.name.trim() &&
      this.campaign.from &&
      this.campaign.to &&
      this.campaign.timeFrom &&
      this.campaign.timeTo
    );
  }

  save(): void {
    if (!this.formValid()) return;
    if (this.isNew) {
      const id = this.campaigns.length ? Math.max(...this.campaigns.map(c => c.id)) + 1 : 101;
      this.campaigns.unshift({
        id,
        name: this.campaign.name.trim(),
        from: this.campaign.from,
        to: this.campaign.to,
        timeFrom: this.campaign.timeFrom,
        timeTo: this.campaign.timeTo,
        resolution: this.activeResolution === 'main' ? '1024x768' : this.activeResolution,
        folder: null,
      });
      this.isNew = false;
      this.editingId = id;
    } else if (this.editingId !== null) {
      const c = this.campaigns.find(x => x.id === this.editingId);
      if (c) {
        c.name = this.campaign.name.trim();
        c.from = this.campaign.from;
        c.to = this.campaign.to;
        c.timeFrom = this.campaign.timeFrom;
        c.timeTo = this.campaign.timeTo;
      }
    }
    this.showSnack('Сохранено');
  }

  toggleDay(i: number): void {
    this.campaign.days[i] = !this.campaign.days[i];
  }

  openCalendar(field: 'from' | 'to'): void {
    this.calendarField = field;
    const value = field === 'from' ? this.campaign.from : this.campaign.to;
    const parts = value.split('.');
    if (parts.length === 3) {
      this.calYear = +parts[2];
      this.calMonth = +parts[1] - 1;
    }
    this.calendarOpen = true;
  }

  shiftMonth(delta: number): void {
    this.calMonth += delta;
    if (this.calMonth < 0) {
      this.calMonth = 11;
      this.calYear--;
    }
    if (this.calMonth > 11) {
      this.calMonth = 0;
      this.calYear++;
    }
  }

  pickDay(d: number): void {
    const date = `${String(d).padStart(2, '0')}.${String(this.calMonth + 1).padStart(2, '0')}.${this.calYear}`;
    if (this.calendarField === 'from') this.campaign.from = date;
    else this.campaign.to = date;
    this.calendarOpen = false;
  }

  // === режимы ===
  modeCode(m: string): string {
    const idx = this.standardModes.indexOf(m);
    return String(idx + 2);
  }

  addMode(m: string): void {
    if (!this.fixedModes.includes(m) && !this.addedModes.includes(m)) {
      this.addedModes.push(m);
    }
    this.activeMode = m;
    this.modeSelectorOpen = false;
  }

  removeMode(m: string, event: Event): void {
    event.stopPropagation();
    this.addedModes = this.addedModes.filter(x => x !== m);
    if (this.activeMode === m) this.activeMode = this.fixedModes[0];
  }

  addResolution(): void {
    const label = `${this.newResW}x${this.newResH}`;
    if (label !== '1024x768' && !this.extraResolutions.includes(label)) {
      this.extraResolutions.push(label);
    }
    this.activeResolution = label;
    this.showSnack('Сохранено');
  }

  removeResolution(r: string, event: Event): void {
    event.stopPropagation();
    this.extraResolutions = this.extraResolutions.filter(x => x !== r);
    if (this.activeResolution === r) this.activeResolution = 'main';
  }

  // === медиа ===
  removeMedia(m: Q4CampaignMedia): void {
    this.media = this.media.filter(x => x.id !== m.id);
  }

  toggleGallery(id: number): void {
    const i = this.selectedGallery.indexOf(id);
    if (i >= 0) this.selectedGallery.splice(i, 1);
    else this.selectedGallery.push(id);
  }

  chooseGallery(): void {
    const picked = this.galleryFiles.filter(f => this.selectedGallery.includes(f.id));
    const nextId = this.media.length ? Math.max(...this.media.map(m => m.id)) + 1 : 1;
    for (const f of picked) {
      this.media.push({
        id: nextId + this.media.length,
        name: f.name,
        type: f.name.endsWith('.mp4') ? 'video' : 'image',
        size: f.size,
        resolution: '1024x768',
        durationMin: 0,
        durationSec: f.name.endsWith('.mp4') ? 30 : 10,
        color: f.color,
      });
    }
    this.selectedGallery = [];
    this.galleryOpen = false;
    this.showSnack(`Добавлено: ${picked.length}`);
  }

  // === мастер ===
  openWizard(): void {
    this.wizardOpen = true;
    this.step = 1;
    this.wProduct = null;
    this.wTerminals = [];
    this.wSlot = '';
  }

  canNext(): boolean {
    if (this.step === 1) return !!this.wProduct;
    if (this.step === 2) return this.wTerminals.length > 0;
    return false;
  }

  nextStep(): void {
    if (!this.canNext()) return;
    if (this.step === 2) this.wSlot = this.wProduct!.slots[0];
    this.step++;
  }

  toggleTerminal(id: string): void {
    const i = this.wTerminals.indexOf(id);
    if (i >= 0) this.wTerminals.splice(i, 1);
    else this.wTerminals.push(id);
  }

  finishWizard(): void {
    const labels = WIZARD_TERMINALS.filter(t => this.wTerminals.includes(t.id));
    const nextId = this.assignments.length ? Math.max(...this.assignments.map(a => a.id)) + 1 : 1;
    for (const t of labels) {
      this.assignments.push({
        id: nextId + this.assignments.length,
        product: this.wProduct!.id,
        productLabel: this.wProduct!.label,
        terminal: t.label,
        slot: this.wSlot,
      });
    }
    this.wizardOpen = false;
    this.showSnack('Сохранено — назначения добавлены');
  }

  removeAssignment(a: CampaignAssignment): void {
    this.assignments = this.assignments.filter(x => x.id !== a.id);
    this.showSnack('Назначение удалено');
  }

  showSnack(text: string): void {
    this.snack = text;
    setTimeout(() => (this.snack = ''), 2500);
  }
}
