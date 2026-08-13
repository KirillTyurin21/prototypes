import { Component, inject, HostListener, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import { CampaignsDataService } from '../campaigns-data.service';
import {
  WebCampaign,
  CampaignMedia,
  CampaignResolution,
  GalleryFile,
  ScreenModeInfo,
  formatSize,
} from '../data/campaigns.data';
import { GALLERY_FILES, SCREEN_MODE_REGISTRY, COMMON_MODE_IDS, getScreenMode } from '../data/campaigns.data';

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = [
  'ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЯ', 'ИЮН',
  'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК',
];
const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

@Component({
  selector: 'app-campaign-editor-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="web-page">
      <!-- Toast -->
      <div *ngIf="toast" class="web-toast">{{ toast }}</div>

      <!-- Шапка -->
      <header class="page-header">
        <div class="title-group">
          <button class="back-btn" (click)="goBack()" aria-label="Назад">
            <lucide-icon name="arrow-left" [size]="24"></lucide-icon>
          </button>
          <div class="page-title">{{ isNew ? 'Новая кампания' : 'Редактирование кампании' }}</div>
        </div>
        <button
          class="web-btn web-btn-primary"
          [class.web-btn-disabled]="!formValid()"
          [disabled]="!formValid()"
          (click)="save()"
        >
          <lucide-icon name="save" [size]="18"></lucide-icon>
          <span>Сохранить</span>
        </button>
      </header>

      <!-- Форма -->
      <main class="form-main">
        <!-- Ряд 1: поля -->
        <div class="picker-row">
          <div class="mdc-field field-w-name" [class.mdc-field-error]="errors.name">
            <label class="mdc-label" [class.mdc-label-float]="campaign.name">Название кампании *</label>
            <input
              type="text"
              class="mdc-input"
              maxlength="80"
              [(ngModel)]="campaign.name"
              (ngModelChange)="errors.name = ''"
              (blur)="validateName()"
            />
            <div class="mdc-error" *ngIf="errors.name">{{ errors.name }}</div>
          </div>

          <div class="mdc-field field-w-date" [class.mdc-field-error]="errors.dateFrom">
            <label class="mdc-label mdc-label-float">Дата начала *</label>
            <input
              type="text"
              class="mdc-input"
              placeholder="Date from"
              [value]="campaign.dateFrom"
              (click)="openCalendar('from', $event)"
              readonly
            />
            <button class="field-suffix" (click)="openCalendar('from', $event)" aria-label="Open calendar">
              <lucide-icon name="calendar" [size]="18"></lucide-icon>
            </button>
            <div class="mdc-error" *ngIf="errors.dateFrom">{{ errors.dateFrom }}</div>
          </div>

          <div class="mdc-field field-w-date" [class.mdc-field-error]="errors.dateTo">
            <label class="mdc-label mdc-label-float">Дата окончания *</label>
            <input
              type="text"
              class="mdc-input"
              placeholder="Date to"
              [value]="campaign.dateTo"
              (click)="openCalendar('to', $event)"
              readonly
            />
            <button class="field-suffix" (click)="openCalendar('to', $event)" aria-label="Open calendar">
              <lucide-icon name="calendar" [size]="18"></lucide-icon>
            </button>
            <div class="mdc-error" *ngIf="errors.dateTo">{{ errors.dateTo }}</div>
          </div>

          <div class="mdc-field field-w-time">
            <label class="mdc-label mdc-label-float">Время начала *</label>
            <input type="time" class="mdc-input" [(ngModel)]="campaign.timeFrom" />
          </div>

          <div class="mdc-field field-w-time">
            <label class="mdc-label mdc-label-float">Время окончания *</label>
            <input type="time" class="mdc-input" [(ngModel)]="campaign.timeTo" />
          </div>
        </div>

        <!-- Ряд 2: дни недели -->
        <div class="picker-row days-row">
          <div class="days-toggle" role="group">
            <button
              *ngFor="let d of DAY_NAMES; let i = index"
              class="day-toggle"
              [class.day-toggle-checked]="campaign.days[i]"
              (click)="toggleDay(i)"
            >{{ d }}</button>
          </div>
        </div>

        <!-- Вкладки разрешений -->
        <div class="editor-body">
          <!-- Вертикальные вкладки -->
          <div class="vtabs">
            <button
              *ngFor="let res of campaign.resolutions"
              class="vtab"
              [class.vtab-active]="activeResolutionId === res.id"
              (click)="selectResolution(res.id)"
            >
              <span class="vtab-del" (click)="askDeleteResolution(res, $event)" aria-label="Удалить">
                <lucide-icon name="x" [size]="16"></lucide-icon>
              </span>
              <span class="vtab-label">{{ res.width }}x{{ res.height }}</span>
            </button>
            <button
              class="vtab"
              [class.vtab-active]="activeResolutionId === null"
              (click)="selectResolution(null)"
            >
              <span class="vtab-label">Добавить разрешение</span>
            </button>
          </div>

          <!-- Панель разрешения -->
          <div class="vpanel">
            <!-- Добавить разрешение -->
            <ng-container *ngIf="activeResolutionId === null">
              <div class="resolution-controls">
                <div class="mdc-field field-w-res" [class.mdc-field-error]="errors.width">
                  <label class="mdc-label mdc-label-float">Ширина *</label>
                  <input
                    type="number"
                    class="mdc-input"
                    min="1"
                    [(ngModel)]="newResW"
                    (ngModelChange)="errors.width = ''"
                  />
                  <div class="mdc-error" *ngIf="errors.width">{{ errors.width }}</div>
                </div>
                <div class="mdc-field field-w-res" [class.mdc-field-error]="errors.height">
                  <label class="mdc-label mdc-label-float">Высота *</label>
                  <input
                    type="number"
                    class="mdc-input"
                    min="1"
                    [(ngModel)]="newResH"
                    (ngModelChange)="errors.height = ''"
                  />
                  <div class="mdc-error" *ngIf="errors.height">{{ errors.height }}</div>
                </div>
                <button class="web-btn web-btn-primary" (click)="createResolution()">Создать</button>
              </div>
            </ng-container>

            <!-- Разрешение -->
            <ng-container *ngIf="activeResolution">
              <div class="htabs-wrap">
                <div class="htabs">
                  <!-- Стрелка прокрутки влево -->
                  <button
                    *ngIf="canScrollLeft"
                    class="htab-pagination"
                    (click)="scrollTabs(-1)"
                    aria-label="Прокрутить вкладки влево"
                  >
                    <lucide-icon name="chevron-left" [size]="20"></lucide-icon>
                  </button>

                  <!-- Зона прокрутки с вкладками -->
                  <div
                    class="htabs-scroll"
                    #tabScroll
                    (scroll)="onTabListScroll()"
                  >
                    <button
                      *ngFor="let tab of modeTabs; let i = index; trackBy: trackTab"
                      class="htab"
                      [class.htab-active]="activeMode === tab.id"
                      (click)="selectTab(tab.id, i)"
                    >
                      <span
                        *ngIf="tab.removable"
                        class="htab-close"
                        (click)="removeModeTab(tab.id, $event)"
                        aria-label="Удалить режим"
                      >
                        <lucide-icon name="x" [size]="16"></lucide-icon>
                      </span>
                      <span class="htab-label">{{ tab.name }}</span>
                    </button>
                  </div>

                  <!-- Стрелка прокрутки вправо -->
                  <button
                    *ngIf="canScrollRight"
                    class="htab-pagination"
                    (click)="scrollTabs(1)"
                    aria-label="Прокрутить вкладки вправо"
                  >
                    <lucide-icon name="chevron-right" [size]="20"></lucide-icon>
                  </button>

                  <!-- Вкладка «+» — фиксирована справа, не прокручивается -->
                  <button
                    *ngIf="availableModes.length > 0"
                    class="htab htab-plus"
                    [class.htab-active]="modeSelectorOpen"
                    (click)="modeSelectorOpen = !modeSelectorOpen"
                    aria-label="Добавить экран"
                  >
                    <lucide-icon name="plus" [size]="18"></lucide-icon>
                  </button>
                </div>

                <!-- Селектор выбора режима -->
                <ng-container *ngIf="modeSelectorOpen && availableModes.length > 0">
                  <div class="selector-backdrop" (click)="modeSelectorOpen = false"></div>
                  <div class="mode-selector">
                    <ng-container *ngIf="standardModes.length > 0">
                      <div class="mode-group-label">Стандартные</div>
                      <button
                        *ngFor="let m of standardModes"
                        class="mode-option"
                        (click)="addMode(m.id)"
                      >
                        {{ m.name }}
                        <span class="mode-option-code">({{ m.code }})</span>
                      </button>
                    </ng-container>
                    <ng-container *ngIf="customModes.length > 0">
                      <div class="mode-group-label">Кастомные</div>
                      <button
                        *ngFor="let m of customModes"
                        class="mode-option"
                        (click)="addMode(m.id)"
                      >
                        {{ m.name }}
                        <span class="mode-option-code">({{ m.code }})</span>
                      </button>
                    </ng-container>
                  </div>
                </ng-container>
              </div>

              <div class="advertise-settings">
                <!-- Список элементов -->
                <div class="advertise-elements">
                  <div
                    *ngFor="let media of activeMedias; let i = index"
                    class="advertise-element"
                    draggable="true"
                    (dragstart)="onDragStart(i, $event)"
                    (dragover)="onDragOver(i, $event)"
                    (drop)="onDrop(i, $event)"
                  >
                    <div class="media-thumb" [style.background-color]="media.color">
                      <lucide-icon
                        [name]="media.type.startsWith('video') ? 'film' : 'image'"
                        [size]="20"
                        class="media-thumb-icon"
                      ></lucide-icon>
                    </div>
                    <div class="media-info">
                      <div class="media-name">{{ media.name }}</div>
                      <div class="media-meta">{{ media.type }}</div>
                      <div class="media-meta"><b>Размер:</b> {{ formatSize(media.sizeKb) }}</div>
                      <div class="media-meta"><b>Разрешение:</b> {{ media.width }}x{{ media.height }}</div>
                    </div>
                    <div class="media-duration">
                      <input
                        type="number"
                        class="duration-input"
                        min="0"
                        [(ngModel)]="media.durationMin"
                      /><span class="duration-suffix">мин</span>
                    </div>
                    <div class="media-duration">
                      <input
                        type="number"
                        class="duration-input"
                        min="0"
                        max="59"
                        [(ngModel)]="media.durationSec"
                      /><span class="duration-suffix">сек.</span>
                    </div>
                    <button class="media-close" (click)="removeMedia(i)" aria-label="Удалить">
                      <lucide-icon name="x" [size]="24"></lucide-icon>
                    </button>
                    <lucide-icon name="grip-vertical" [size]="20" class="media-grip"></lucide-icon>
                  </div>

                  <!-- Добавить -->
                  <button class="advertise-add" (click)="openGallery()">
                    <lucide-icon name="plus" [size]="24"></lucide-icon>
                    <span>Добавить изображение или видео</span>
                  </button>
                </div>

                <!-- Канвас предпросмотра -->
                <div class="advertise-constructor">
                  <div class="constructor-empty" *ngIf="activeMedias.length === 0">
                    Здесь может быть ваше изображение или видео
                  </div>
                  <ng-container *ngIf="activeMedias.length > 0">
                    <div
                      *ngFor="let media of activeMedias"
                      class="constructor-item"
                      [style.background-color]="media.color"
                    >
                      <lucide-icon
                        [name]="media.type.startsWith('video') ? 'film' : 'image'"
                        [size]="18"
                      ></lucide-icon>
                      {{ media.name }} · {{ media.durationMin }}:{{ pad(media.durationSec) }}
                    </div>
                  </ng-container>
                </div>
              </div>
            </ng-container>
          </div>
        </div>
      </main>

      <!-- ─── Календарь ─── -->
      <div class="web-overlay" *ngIf="calendarOpen" (click)="calendarOpen = null">
        <div
          class="calendar-popup"
          [style.top.px]="calendarTop"
          [style.left.px]="calendarLeft"
          (click)="$event.stopPropagation()"
        >
          <div class="calendar-header">
            <span class="calendar-period">{{ MONTH_NAMES[calendarMonth.getMonth()] }}. {{ calendarMonth.getFullYear() }}</span>
            <button class="calendar-nav" (click)="shiftMonth(-1)" aria-label="Предыдущий месяц">
              <lucide-icon name="chevron-left" [size]="20"></lucide-icon>
            </button>
            <button class="calendar-nav" (click)="shiftMonth(1)" aria-label="Следующий месяц">
              <lucide-icon name="chevron-right" [size]="20"></lucide-icon>
            </button>
          </div>
          <table class="calendar-grid">
            <thead>
              <tr>
                <th *ngFor="let d of DAY_LABELS">{{ d }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let week of calendarWeeks">
                <td *ngFor="let day of week">
                  <button
                    *ngIf="day"
                    class="calendar-day"
                    [class.calendar-day-selected]="isSelectedDay(day)"
                    (click)="pickDay(day)"
                  >{{ day.getDate() }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── Диалог подтверждения ─── -->
      <div class="web-overlay" *ngIf="confirmOpen" (click)="confirmOpen = false">
        <div class="web-dialog web-dialog-sm" (click)="$event.stopPropagation()">
          <div class="web-dialog-title">{{ confirmTitle }}</div>
          <div class="web-dialog-text">{{ confirmText }}</div>
          <div class="web-dialog-actions">
            <button class="web-btn web-btn-outline" (click)="confirmOpen = false">Отмена</button>
            <button class="web-btn web-btn-primary" (click)="confirmYes()">Да</button>
          </div>
        </div>
      </div>

      <!-- ─── Галерея ─── -->
      <div class="web-overlay" *ngIf="galleryOpen" (click)="galleryOpen = false">
        <div class="web-end-panel gallery-panel" (click)="$event.stopPropagation()">
          <div class="end-panel-header">
            <div class="end-panel-title">Галерея</div>
            <button class="end-panel-close" (click)="galleryOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="24"></lucide-icon>
            </button>
          </div>

          <div class="gallery-body">
            <!-- Поиск -->
            <div class="gallery-search">
              <lucide-icon name="search" [size]="18" class="gallery-search-icon"></lucide-icon>
              <input
                type="text"
                class="gallery-search-input"
                placeholder="Поиск"
                [(ngModel)]="gallerySearch"
              />
            </div>

            <!-- Тулбар -->
            <div class="gallery-toolbar">
              <div class="gallery-toolbar-title">Изображения</div>
              <div class="gallery-toolbar-spacer"></div>
              <button class="gallery-toolbar-btn" (click)="gallerySortDesc = !gallerySortDesc">
                <lucide-icon [name]="gallerySortDesc ? 'arrow-down' : 'arrow-up'" [size]="16"></lucide-icon>
                <span>По названию</span>
                <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
              </button>
              <div class="gallery-delimiter"></div>
              <button class="gallery-toolbar-icon" aria-label="Вид списка">
                <lucide-icon name="list" [size]="16"></lucide-icon>
              </button>
              <div class="gallery-delimiter"></div>
              <button class="gallery-toolbar-icon" (click)="uploadFile()" aria-label="Загрузить">
                <lucide-icon name="upload" [size]="16"></lucide-icon>
              </button>
            </div>

            <!-- Список файлов -->
            <div class="gallery-list">
              <div
                *ngFor="let f of filteredGalleryFiles"
                class="gallery-row"
                [class.gallery-row-selected]="gallerySelectedId === f.id"
                (click)="gallerySelectedId = f.id"
              >
                <div class="gallery-row-left">
                  <div class="gallery-thumb" [style.background-color]="f.color">
                    <lucide-icon
                      [name]="f.type.startsWith('video') ? 'film' : 'image'"
                      [size]="14"
                    ></lucide-icon>
                  </div>
                  <span class="gallery-name">{{ f.name }}</span>
                </div>
                <div class="gallery-row-side">
                  <span>{{ f.date }}</span>
                  <span>{{ formatSize(f.sizeKb) }}</span>
                  <div class="gallery-row-actions">
                    <button class="gallery-action" (click)="editFile(f, $event)" aria-label="Редактировать">
                      <lucide-icon name="pencil" [size]="14"></lucide-icon>
                    </button>
                    <button class="gallery-action gallery-action-danger" (click)="deleteFile(f, $event)" aria-label="Удалить">
                      <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer class="gallery-footer">
            <button class="web-btn web-btn-outline" (click)="galleryOpen = false">Отмена</button>
            <button
              class="web-btn"
              [ngClass]="gallerySelectedId === null ? 'web-btn-disabled' : 'web-btn-primary'"
              [disabled]="gallerySelectedId === null"
              (click)="chooseFile()"
            >Выбрать</button>
          </footer>
        </div>
      </div>

      <!-- ─── Панель переименования файла ─── -->
      <div class="web-overlay" *ngIf="renamePanelOpen" (click)="renamePanelOpen = false">
        <div class="web-end-panel web-end-panel-sm" (click)="$event.stopPropagation()">
          <div class="end-panel-header">
            <div class="end-panel-title">Переименовать</div>
            <button class="end-panel-close" (click)="renamePanelOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="24"></lucide-icon>
            </button>
          </div>
          <div class="end-panel-body">
            <div class="mdc-field">
              <label class="mdc-label" [class.mdc-label-float]="renameValue">Название файла</label>
              <input type="text" class="mdc-input" [(ngModel)]="renameValue" />
            </div>
          </div>
          <footer class="end-panel-footer">
            <button class="web-btn web-btn-white" (click)="saveRename()">Сохранить</button>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ─── Кнопки ─── */
    .web-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: 36px;
      padding: 0 16px;
      border: none;
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      cursor: pointer;
      white-space: nowrap;
    }
    .web-btn-primary {
      background-color: #448aff;
      color: #ffffff;
      box-shadow: 0 2px 2px 0 rgba(224, 224, 224, 1), 0 1px 1px 0 rgba(214, 214, 214, 1);
    }
    .web-btn-primary:hover { background-color: #3969d5; }
    .web-btn-primary:active { background-color: #2651b5; }
    .web-btn-outline {
      background-color: #ffffff;
      color: #333333;
      border: 1px solid #e0e0e0;
      text-transform: none;
      padding: 0 12px;
    }
    .web-btn-outline:hover { background-color: #fafafa; }
    .web-btn-white {
      background-color: #ffffff;
      color: rgba(0, 0, 0, 0.87);
      box-shadow: 0 2px 2px 0 rgba(224, 224, 224, 1), 0 1px 1px 0 rgba(214, 214, 214, 1);
    }
    .web-btn-white:hover { background-color: #fafafa; }
    .web-btn-disabled {
      background-color: #ebebeb;
      color: #9e9e9e;
      box-shadow: none;
      cursor: default;
    }

    /* ─── Toast ─── */
    .web-toast {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      background-color: #424242;
      color: #ffffff;
      font-size: 14px;
      padding: 14px 16px;
      border-radius: 4px;
      z-index: 3000;
      box-shadow: 0 1px 10px 0 rgba(224, 224, 224, 1), 0 2px 4px 0 rgba(214, 214, 214, 1);
      animation: fadeIn 0.2s ease-out;
    }

    /* ─── Шапка ─── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 36px;
      margin-bottom: 20px;
    }
    .title-group { display: flex; align-items: center; gap: 8px; }
    .back-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 6px;
      border: none;
      background: none;
      border-radius: 50%;
      color: #757575;
      cursor: pointer;
    }
    .back-btn:hover { background-color: #ebebeb; }
    .page-title {
      font-size: 24px;
      font-weight: 500;
      color: #333333;
      line-height: 1.2;
    }

    /* ─── Форма ─── */
    .form-main { min-width: 0; }
    .picker-row { display: flex; align-items: flex-start; }
    .field-w-name { width: 250px; margin-right: 20px; margin-bottom: 20px; }
    .field-w-date { width: 250px; margin-right: 20px; margin-bottom: 20px; }
    .field-w-time { width: 160px; margin-right: 20px; margin-bottom: 20px; }
    .field-w-res { width: 160px; margin-right: 20px; margin-bottom: 20px; }
    .days-row { margin-bottom: 0; }

    /* Material outlined field */
    .mdc-field { position: relative; }
    .mdc-label {
      position: absolute;
      top: 17px;
      left: 12px;
      background: #ffffff;
      padding: 0 4px;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.6);
      pointer-events: none;
      transition: all 0.15s ease-out;
      z-index: 1;
      white-space: nowrap;
    }
    .mdc-label-float { top: -9px; font-size: 12px; }
    .mdc-input {
      width: 100%;
      height: 56px;
      padding: 0 16px;
      border: 1px solid rgba(0, 0, 0, 0.38);
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.87);
      background: #ffffff;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .mdc-input:hover { border-color: rgba(0, 0, 0, 0.87); }
    .mdc-input:focus { border: 2px solid #448aff; padding: 0 15px; }
    .mdc-field-error .mdc-input { border-color: #ff5252; }
    .mdc-field-error .mdc-label { color: #ff5252; }
    .mdc-error { font-size: 12px; color: #ff5252; padding: 4px 12px 0; }
    .field-suffix {
      position: absolute;
      top: 12px;
      right: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      color: #757575;
      cursor: pointer;
    }
    .field-suffix:hover { background-color: #ebebeb; border-radius: 50%; }

    /* Дни недели */
    .days-toggle {
      display: inline-flex;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      overflow: hidden;
      background: #ffffff;
    }
    .day-toggle {
      height: 48px;
      padding: 0 16px;
      border: none;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      background: #ffffff;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      cursor: pointer;
      white-space: nowrap;
    }
    .day-toggle:last-child { border-right: none; }
    .day-toggle:hover { background-color: #ebebeb; }
    .day-toggle-checked { background-color: rgba(0, 0, 0, 0.1); }
    .day-toggle-checked:hover { background-color: rgba(0, 0, 0, 0.12); }

    /* ─── Вертикальные вкладки ─── */
    .editor-body {
      display: flex;
      align-items: flex-start;
      border-top: 1px solid #e0e0e0;
      margin-top: 12px;
      padding-top: 8px;
    }
    .vtabs {
      width: 216px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }
    .vtab {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 48px;
      border: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.54);
      cursor: pointer;
      text-align: center;
      white-space: nowrap;
    }
    .vtab:hover { background-color: #ebebeb; }
    .vtab-active { color: #448aff; }
    .vtab-label { display: inline-block; }
    .vtab-del {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      color: #e1e1e1;
    }
    .vtab-del:hover { color: #757575; background-color: #ebebeb; }

    .vpanel {
      flex: 1;
      min-width: 0;
      padding-left: 16px;
    }
    .resolution-controls {
      width: 330px;
      margin: 30px 0;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    /* Горизонтальные вкладки режимов */
    .htabs {
      display: flex;
      border-bottom: 1px solid #e0e0e0;
    }
    .htab {
      position: relative;
      flex: 0 0 auto;
      min-width: 160px;
      height: 48px;
      border: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.54);
      cursor: pointer;
      white-space: nowrap;
      padding: 0 8px;
    }
    .htab:hover { background-color: #ebebeb; }
    .htab-active { color: #448aff; }
    .htab-active::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background-color: #448aff;
    }

    /* Вкладка «+» и крестик удаления режима */
    .htabs-wrap { position: relative; z-index: 60; }
    .htab-label { pointer-events: none; }
    .htab-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-right: 2px;
      border-radius: 50%;
      color: #e1e1e1;
      flex-shrink: 0;
    }
    .htab-close:hover { color: #757575; background-color: #ebebeb; }
    .htab-plus {
      flex: 0 0 56px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(0, 0, 0, 0.54);
    }
    .htab-plus:hover { color: #448aff; }

    /* Прокрутка ряда вкладок (Material-подобная пагинация) */
    .htabs-scroll {
      flex: 1;
      min-width: 0;
      display: flex;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .htabs-scroll::-webkit-scrollbar { display: none; }
    .htab-pagination {
      flex: 0 0 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 48px;
      border: none;
      background: none;
      color: rgba(0, 0, 0, 0.54);
      cursor: pointer;
      flex-shrink: 0;
    }
    .htab-pagination:hover {
      color: #448aff;
      background-color: #ebebeb;
    }
    .selector-backdrop { position: fixed; inset: 0; z-index: 60; }
    .mode-selector {
      position: absolute;
      top: 50px;
      right: 0;
      z-index: 61;
      min-width: 300px;
      max-height: 360px;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 4px;
      padding: 8px 0;
      box-shadow: 0 4px 16px 4px rgba(224, 224, 224, 1), 0 6px 6px 0 rgba(214, 214, 214, 1);
      animation: fadeIn 0.15s ease-out;
    }
    .mode-group-label {
      font-size: 12px;
      font-weight: 500;
      color: #616161;
      padding: 8px 16px;
    }
    .mode-option {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      height: 48px;
      padding: 0 16px;
      border: none;
      background: none;
      text-align: left;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: #333333;
      cursor: pointer;
      white-space: nowrap;
    }
    .mode-option:hover { background-color: #ebebeb; }
    .mode-option-code { color: #9e9e9e; }

    /* Настройки рекламы */
    .advertise-settings {
      display: flex;
      justify-content: center;
      gap: 40px;
      padding-top: 24px;
      min-height: 600px;
      overflow-x: auto;
    }
    .advertise-elements {
      width: 280px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    .advertise-add {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 55px;
      border: 1px dashed #e1e1e1;
      border-radius: 15px;
      background-color: #fafafa;
      box-shadow: rgba(0, 0, 0, 0.08) 0 3px 5px 0;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      cursor: pointer;
      margin-bottom: 10px;
    }
    .advertise-add:hover { background-color: #f0f0f0; }
    .advertise-element {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 97px;
      padding: 10px 12px;
      margin-bottom: 10px;
      border: 1px solid #e1e1e1;
      border-radius: 15px;
      background: #ffffff;
      box-shadow: rgba(0, 0, 0, 0.08) 0 3px 5px 0;
      cursor: grab;
    }
    .media-thumb {
      width: 75px;
      height: 75px;
      flex-shrink: 0;
      border: 1px dashed #e1e1e1;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .media-thumb-icon { color: rgba(255, 255, 255, 0.9); }
    .media-info { width: 150px; flex-shrink: 0; }
    .media-name {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }
    .media-meta { font-size: 12px; color: rgba(0, 0, 0, 0.6); line-height: 1.4; }
    .media-duration {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .duration-input {
      width: 38px;
      height: 24px;
      border: 1px solid rgba(0, 0, 0, 0.38);
      border-radius: 4px;
      font-size: 14px;
      text-align: center;
      outline: none;
      background: #ffffff;
    }
    .duration-input:focus { border-color: #448aff; }
    .duration-suffix { font-size: 12px; color: rgba(0, 0, 0, 0.6); }
    .media-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 6px;
      border: none;
      background: none;
      border-radius: 50%;
      color: #757575;
      cursor: pointer;
      flex-shrink: 0;
    }
    .media-close:hover { background-color: #ebebeb; }
    .media-grip { color: #bdbdbd; flex-shrink: 0; cursor: grab; }

    /* Канвас */
    .advertise-constructor {
      width: 600px;
      height: 600px;
      flex-shrink: 0;
      background-color: rgba(128, 128, 128, 0.69);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      overflow: hidden;
      border-radius: 4px;
    }
    .constructor-empty {
      background-color: rgba(255, 255, 255, 0.68);
      color: rgba(0, 0, 0, 0.98);
      font-size: 30px;
      padding: 10px;
      border-radius: 15px;
      text-align: center;
      max-width: 90%;
    }
    .constructor-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 12px;
      color: #ffffff;
      font-size: 16px;
      box-shadow: rgba(0, 0, 0, 0.25) 0 2px 6px 0;
      max-width: 90%;
    }

    /* ─── Overlay / диалоги / панели ─── */
    .web-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.32);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .web-dialog {
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 1), 0 8px 10px 0 rgba(214, 214, 214, 1);
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.15s ease-out;
    }
    .web-dialog-sm { width: 280px; }
    .web-dialog-title { font-size: 20px; font-weight: 500; color: #333333; padding: 24px 24px 8px; }
    .web-dialog-text { font-size: 16px; color: #616161; padding: 0 24px; }
    .web-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 24px; }

    .web-end-panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      background: #ffffff;
      box-shadow: 0 6px 28px 6px rgba(224, 224, 224, 1), 0 8px 10px 0 rgba(214, 214, 214, 1);
      display: flex;
      flex-direction: column;
      animation: slideIn 0.18s ease-out;
    }
    .web-end-panel-sm { width: 400px; }
    .gallery-panel { width: 600px; max-width: 90vw; }
    .end-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 24px 0;
      flex-shrink: 0;
    }
    .end-panel-title { font-size: 24px; font-weight: 500; color: #333333; line-height: 1.2; }
    .end-panel-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      color: #757575;
      cursor: pointer;
    }
    .end-panel-body { flex: 1; padding: 16px 24px; overflow-y: auto; }
    .end-panel-footer {
      height: 84px;
      padding: 24px;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }

    /* ─── Галерея ─── */
    .gallery-body {
      flex: 1;
      padding: 0 24px;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .gallery-search { position: relative; padding-top: 12px; flex-shrink: 0; }
    .gallery-search-icon {
      position: absolute;
      left: 12px;
      top: 32px;
      color: #757575;
      pointer-events: none;
    }
    .gallery-search-input {
      width: 100%;
      height: 56px;
      padding: 0 16px 0 40px;
      border: 1px solid rgba(0, 0, 0, 0.38);
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 16px;
      color: rgba(0, 0, 0, 0.87);
      outline: none;
      background: #ffffff;
      box-sizing: border-box;
    }
    .gallery-search-input:focus { border: 2px solid #448aff; }
    .gallery-toolbar {
      display: flex;
      align-items: center;
      height: 36px;
      margin-top: 12px;
      flex-shrink: 0;
    }
    .gallery-toolbar-title { font-size: 16px; font-weight: 500; color: rgba(0, 0, 0, 0.87); }
    .gallery-toolbar-spacer { flex: 1; }
    .gallery-toolbar-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      border: none;
      background: none;
      font-family: Roboto, sans-serif;
      font-size: 14px;
      color: #757575;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .gallery-toolbar-btn:hover { background-color: rgba(0, 0, 0, 0.04); }
    .gallery-toolbar-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border: none;
      background: none;
      color: #757575;
      cursor: pointer;
      border-radius: 4px;
    }
    .gallery-toolbar-icon:hover { background-color: rgba(0, 0, 0, 0.04); }
    .gallery-delimiter {
      width: 1px;
      height: 16px;
      background-color: #e0e0e0;
      margin: 0 4px;
    }
    .gallery-list {
      flex: 1;
      overflow-y: auto;
      margin-top: 4px;
      min-height: 0;
    }
    .gallery-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      padding: 12px 8px;
      cursor: pointer;
      border-radius: 4px;
    }
    .gallery-row:hover { background-color: rgba(0, 0, 0, 0.04); }
    .gallery-row-selected { background-color: rgba(68, 138, 255, 0.12); }
    .gallery-row-selected:hover { background-color: rgba(68, 138, 255, 0.12); }
    .gallery-row-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
    .gallery-thumb {
      width: 36px;
      height: 36px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      flex-shrink: 0;
    }
    .gallery-name {
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gallery-row-side {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.87);
      flex-shrink: 0;
    }
    .gallery-row-actions { display: flex; }
    .gallery-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 9px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #ffffff;
      color: rgba(0, 0, 0, 0.87);
      cursor: pointer;
      margin-left: 6px;
    }
    .gallery-action:hover { background-color: #fafafa; }
    .gallery-action-danger { border-color: #ff5252; color: #ff5252; }
    .gallery-action-danger:hover { background-color: #fff5f5; }
    .gallery-footer {
      height: 84px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      gap: 16px;
      flex-shrink: 0;
    }

    /* ─── Календарь ─── */
    .calendar-popup {
      position: absolute;
      width: 296px;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
      padding: 8px;
      animation: fadeIn 0.15s ease-out;
    }
    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 62px;
      padding: 8px 8px 0;
    }
    .calendar-period {
      font-size: 13px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
      margin-right: auto;
    }
    .calendar-nav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      color: rgba(0, 0, 0, 0.54);
      cursor: pointer;
      border-radius: 50%;
    }
    .calendar-nav:hover { background-color: rgba(0, 0, 0, 0.04); }
    .calendar-grid { width: 100%; border-collapse: collapse; }
    .calendar-grid th {
      font-size: 11px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.54);
      height: 21px;
      padding-bottom: 8px;
      text-align: center;
    }
    .calendar-grid td { text-align: center; padding: 0; }
    .calendar-day {
      width: 40px;
      height: 40px;
      border: none;
      background: none;
      border-radius: 50%;
      font-family: Roboto, sans-serif;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.87);
      cursor: pointer;
    }
    .calendar-day:hover { background-color: #ebebeb; }
    .calendar-day-selected {
      background-color: #448aff;
      color: #ffffff;
    }
    .calendar-day-selected:hover { background-color: #448aff; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateX(24px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class CampaignEditorScreenComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  data = inject(CampaignsDataService);

  DAY_NAMES = DAY_NAMES;
  MONTH_NAMES = MONTH_NAMES;
  DAY_LABELS = DAY_LABELS;

  isNew = false;
  campaign: WebCampaign = {
    id: -1,
    name: 'Новая кампания',
    dateFrom: '',
    dateTo: '',
    timeFrom: '00:00',
    timeTo: '23:59',
    days: [true, true, true, true, true, true, true],
    folderId: null,
    resolutions: [],
  };

  errors: { name: string; dateFrom: string; dateTo: string; width: string; height: string } = {
    name: '',
    dateFrom: '',
    dateTo: '',
    width: '',
    height: '',
  };

  activeResolutionId: number | null = null;
  activeMode = 'order';
  modeSelectorOpen = false;

  // Прокрутка вкладок режимов
  @ViewChild('tabScroll') tabScrollEl!: ElementRef<HTMLElement>;
  canScrollLeft = false;
  canScrollRight = false;

  newResW = 1024;
  newResH = 768;

  // Gallery
  galleryOpen = false;
  gallerySearch = '';
  gallerySelectedId: number | null = null;
  gallerySortDesc = false;
  galleryFiles: GalleryFile[] = [];

  // Rename
  renamePanelOpen = false;
  renameValue = '';
  private renameFileId: number | null = null;

  // Confirm
  confirmOpen = false;
  confirmTitle = 'Вы уверены?';
  confirmText = '';
  private confirmAction: (() => void) | null = null;

  // Calendar
  calendarOpen: 'from' | 'to' | null = null;
  calendarMonth = new Date();
  calendarTop = 0;
  calendarLeft = 0;

  // Drag
  private dragIndex: number | null = null;

  // Toast
  toast = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const folderParam = this.route.snapshot.queryParamMap.get('folder');

    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (id === 'new') {
      this.isNew = true;
      this.campaign.name = 'Новая кампания';
      this.campaign.dateFrom = iso;
      this.campaign.dateTo = iso;
      this.campaign.timeFrom = '00:00';
      this.campaign.timeTo = '23:59';
      this.campaign.days = [true, true, true, true, true, true, true];
      this.campaign.folderId = folderParam && folderParam !== 'root' ? Number(folderParam) : null;
      this.campaign.resolutions = [];
      this.activeResolutionId = null;
    } else {
      const existing = this.data.getCampaign(Number(id));
      if (existing) {
        this.campaign = JSON.parse(JSON.stringify(existing));
        this.activeResolutionId = this.campaign.resolutions.length > 0 ? this.campaign.resolutions[0].id : null;
      } else {
        this.goBack();
      }
    }
    this.calendarMonth = this.parseDate(this.campaign.dateFrom) || new Date();
    this.galleryFiles = JSON.parse(JSON.stringify(GALLERY_FILES));
  }

  formatSize = formatSize;

  get activeResolution(): CampaignResolution | null {
    return this.campaign.resolutions.find(r => r.id === this.activeResolutionId) ?? null;
  }

  get activeMedias(): CampaignMedia[] {
    return this.activeResolution ? this.activeResolution.modes[this.activeMode] ?? [] : [];
  }

  /** Вкладки режимов: общие (без крестика) + добавленные (с крестиком) */
  get modeTabs(): { id: string; name: string; removable: boolean }[] {
    const tabs: { id: string; name: string; removable: boolean }[] = [];
    for (const id of COMMON_MODE_IDS) {
      tabs.push({ id, name: this.modeName(id), removable: false });
    }
    const res = this.activeResolution;
    if (res) {
      for (const id of Object.keys(res.modes)) {
        if (!COMMON_MODE_IDS.includes(id)) {
          tabs.push({ id, name: this.modeName(id), removable: true });
        }
      }
    }
    return tabs;
  }

  /** Режимы, доступные для добавления (ещё не добавленные, не общие) */
  get availableModes(): ScreenModeInfo[] {
    const res = this.activeResolution;
    if (!res) return [];
    return SCREEN_MODE_REGISTRY.filter(
      m => m.kind !== 'common' && !(m.id in res.modes)
    );
  }

  get standardModes(): ScreenModeInfo[] {
    return this.availableModes.filter(m => m.kind === 'standard');
  }

  get customModes(): ScreenModeInfo[] {
    return this.availableModes.filter(m => m.kind === 'custom');
  }

  modeName(id: string): string {
    return getScreenMode(id)?.name ?? id;
  }

  /** Выбор вкладки режима + автоскролл к ней */
  selectTab(id: string, index?: number): void {
    this.activeMode = id;
    this.scrollToTab(index);
  }

  trackTab(index: number, tab: { id: string }): string {
    return tab.id;
  }

  /** Выбор разрешения (вертикальная вкладка) + пересчёт стрелок */
  selectResolution(id: number | null): void {
    this.activeResolutionId = id;
    setTimeout(() => this.updateScrollState(), 50);
  }

  /** Добавить режим: вкладка встаёт на место «+» */
  addMode(id: string): void {
    const res = this.activeResolution;
    if (!res || id in res.modes) return;
    res.modes[id] = [];
    this.activeMode = id;
    this.modeSelectorOpen = false;
    setTimeout(() => this.scrollToTab(this.modeTabs.length - 1), 50);
  }

  /** Удалить режим: режим возвращается в селектор, «+» появляется снова */
  removeModeTab(id: string, event: Event): void {
    event.stopPropagation();
    const res = this.activeResolution;
    if (!res) return;
    delete res.modes[id];
    this.modeSelectorOpen = false;
    if (this.activeMode === id) {
      this.activeMode = 'order';
      setTimeout(() => this.scrollToTab(0), 50);
    }
    setTimeout(() => this.updateScrollState(), 50);
  }

  // ─── Прокрутка ряда вкладок ───────────────────

  onTabListScroll(): void {
    this.updateScrollState();
  }

  scrollTabs(direction: 1 | -1): void {
    const container = this.tabScrollEl?.nativeElement;
    if (!container) return;
    container.scrollBy({ left: direction * 200, behavior: 'smooth' });
  }

  private scrollToTab(index?: number): void {
    const targetIndex = index;
    setTimeout(() => {
      const container = this.tabScrollEl?.nativeElement;
      if (!container) return;
      const idx = targetIndex !== undefined
        ? targetIndex
        : this.modeTabs.findIndex(t => t.id === this.activeMode);
      const tabs = container.querySelectorAll<HTMLElement>('.htab');
      const el = tabs[idx];
      if (el) {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      }
      // После завершения анимации — довести вкладку до полной видимости
      // (ширина зоны могла измениться из-за появления стрелок)
      setTimeout(() => {
        const tabs2 = container.querySelectorAll<HTMLElement>('.htab');
        const el2 = tabs2[idx];
        if (!el2) {
          this.updateScrollState();
          return;
        }
        const maxLeft = container.scrollWidth - container.clientWidth;
        const tr = el2.getBoundingClientRect();
        const cr = container.getBoundingClientRect();
        if (tr.width === 0) {
          this.updateScrollState();
          return;
        }
        if (tr.right > cr.right) {
          container.scrollTo({
            left: Math.min(container.scrollLeft + (tr.right - cr.right), maxLeft),
            behavior: 'smooth',
          });
        } else if (tr.left < cr.left) {
          container.scrollTo({
            left: Math.max(container.scrollLeft - (cr.left - tr.left), 0),
            behavior: 'smooth',
          });
        }
        this.updateScrollState();
      }, 400);
      this.updateScrollState();
    });
  }

  private updateScrollState(): void {
    const container = this.tabScrollEl?.nativeElement;
    if (!container) return;
    const maxLeft = container.scrollWidth - container.clientWidth;
    if (container.scrollLeft > maxLeft) {
      container.scrollLeft = maxLeft;
    }
    this.canScrollLeft = container.scrollLeft > 2;
    this.canScrollRight = container.scrollLeft < maxLeft - 2;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateScrollState();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateScrollState(), 100);
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  toggleDay(i: number): void {
    this.campaign.days[i] = !this.campaign.days[i];
  }

  goBack(): void {
    this.router.navigate(['/prototype/web-screens/campaigns']);
  }

  // ─── Валидация и сохранение ───

  formValid(): boolean {
    return (
      !!this.campaign.name.trim() &&
      !!this.campaign.dateFrom &&
      !!this.campaign.dateTo &&
      !!this.campaign.timeFrom &&
      !!this.campaign.timeTo
    );
  }

  validateName(): void {
    this.errors.name = this.campaign.name.trim()
      ? ''
      : 'Поле "Название кампании" обязательно для заполнения';
  }

  save(): void {
    this.validateName();
    if (!this.campaign.dateFrom) {
      this.errors.dateFrom = 'Поле "Дата начала" обязательно для заполнения';
    }
    if (!this.campaign.dateTo) {
      this.errors.dateTo = 'Поле "Дата окончания" обязательно для заполнения';
    }
    if (!this.formValid()) return;

    if (this.isNew) {
      const created = this.data.createCampaign(this.campaign.name.trim());
      created.name = this.campaign.name.trim();
      created.dateFrom = this.campaign.dateFrom;
      created.dateTo = this.campaign.dateTo;
      created.timeFrom = this.campaign.timeFrom;
      created.timeTo = this.campaign.timeTo;
      created.days = [...this.campaign.days];
      created.folderId = this.campaign.folderId;
      created.resolutions = this.campaign.resolutions;
      this.data.updateCampaign(created);
      this.isNew = false;
      this.campaign.id = created.id;
      this.router.navigate(['/prototype/web-screens/campaign-editor', created.id], { replaceUrl: true });
    } else {
      this.data.updateCampaign(this.campaign);
    }
    this.showToast('Сохранено');
  }

  // ─── Разрешения ───

  createResolution(): void {
    if (!this.newResW || this.newResW < 1) {
      this.errors.width = 'Поле "Ширина" обязательно для заполнения';
    }
    if (!this.newResH || this.newResH < 1) {
      this.errors.height = 'Поле "Высота" обязательно для заполнения';
    }
    if (!this.newResW || !this.newResH || this.newResW < 1 || this.newResH < 1) return;

    // Проверка дубликата
    const dup = this.campaign.resolutions.find(r => r.width === Number(this.newResW) && r.height === Number(this.newResH));
    if (dup) {
      this.activeResolutionId = dup.id;
      this.newResW = 1024;
      this.newResH = 768;
      return;
    }

    const res = this.data.createResolution(Number(this.newResW), Number(this.newResH));
    this.campaign.resolutions.push(res);
    this.activeResolutionId = res.id;
    this.newResW = 1024;
    this.newResH = 768;
    this.errors.width = '';
    this.errors.height = '';
    setTimeout(() => this.updateScrollState(), 50);
  }

  askDeleteResolution(res: CampaignResolution, event: Event): void {
    event.stopPropagation();
    this.confirmTitle = 'Вы уверены?';
    this.confirmText = '';
    this.confirmAction = () => {
      this.campaign.resolutions = this.campaign.resolutions.filter(r => r.id !== res.id);
      if (this.activeResolutionId === res.id) {
        this.activeResolutionId = this.campaign.resolutions.length > 0 ? this.campaign.resolutions[0].id : null;
      }
      setTimeout(() => this.updateScrollState(), 50);
    };
    this.confirmOpen = true;
  }

  // ─── Медиа ───

  removeMedia(i: number): void {
    this.activeMedias.splice(i, 1);
  }

  onDragStart(i: number, event: DragEvent): void {
    this.dragIndex = i;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(i: number, event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(i: number, event: DragEvent): void {
    event.preventDefault();
    if (this.dragIndex === null || this.dragIndex === i) return;
    const list = this.activeMedias;
    const [moved] = list.splice(this.dragIndex, 1);
    list.splice(i, 0, moved);
    this.dragIndex = null;
  }

  // ─── Галерея ───

  openGallery(): void {
    this.gallerySearch = '';
    this.gallerySelectedId = null;
    this.galleryOpen = true;
  }

  get filteredGalleryFiles(): GalleryFile[] {
    const q = this.gallerySearch.trim().toLowerCase();
    const files = q
      ? this.galleryFiles.filter(f => f.name.toLowerCase().includes(q))
      : this.galleryFiles;
    return this.gallerySortDesc ? [...files].reverse() : files;
  }

  chooseFile(): void {
    if (this.gallerySelectedId === null || !this.activeResolution) return;
    const file = this.galleryFiles.find(f => f.id === this.gallerySelectedId);
    if (!file) return;
    const media: CampaignMedia = {
      id: this.data.nextMediaIdValue(),
      name: file.name,
      type: file.type,
      sizeKb: file.sizeKb,
      width: file.width,
      height: file.height,
      durationMin: 0,
      durationSec: 30,
      color: file.color,
    };
    this.activeResolution.modes[this.activeMode].push(media);
    this.galleryOpen = false;
  }

  uploadFile(): void {
    const colors = ['#90CAF9', '#A5D6A7', '#FFCC80', '#F48FB1', '#CE93D8', '#80CBC4'];
    const n = this.galleryFiles.length + 1;
    this.galleryFiles.unshift({
      id: Math.max(...this.galleryFiles.map(f => f.id), 0) + 1,
      name: `image-${n}.jpg`,
      type: 'image/jpeg',
      sizeKb: 180 + n * 37,
      date: new Date().toLocaleDateString('ru-RU'),
      width: 1024,
      height: 768,
      color: colors[n % colors.length],
    });
    this.gallerySortDesc = false;
  }

  editFile(f: GalleryFile, event: Event): void {
    event.stopPropagation();
    this.renameFileId = f.id;
    this.renameValue = f.name;
    this.renamePanelOpen = true;
  }

  saveRename(): void {
    const f = this.galleryFiles.find(x => x.id === this.renameFileId);
    if (f && this.renameValue.trim()) {
      f.name = this.renameValue.trim();
    }
    this.renamePanelOpen = false;
  }

  deleteFile(f: GalleryFile, event: Event): void {
    event.stopPropagation();
    this.confirmTitle = 'Удалить';
    this.confirmText = 'Вы уверены?';
    this.confirmAction = () => {
      this.galleryFiles = this.galleryFiles.filter(x => x.id !== f.id);
      if (this.gallerySelectedId === f.id) this.gallerySelectedId = null;
    };
    this.confirmOpen = true;
  }

  confirmYes(): void {
    this.confirmOpen = false;
    if (this.confirmAction) {
      this.confirmAction();
      this.confirmAction = null;
    }
  }

  // ─── Календарь ───

  parseDate(s: string): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  openCalendar(field: 'from' | 'to', event?: MouseEvent): void {
    this.calendarOpen = field;
    const base = this.parseDate(field === 'from' ? this.campaign.dateFrom : this.campaign.dateTo);
    if (base) this.calendarMonth = base;
    if (event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const popupH = 354;
      this.calendarLeft = rect.left;
      this.calendarTop = rect.top + rect.height + 4 > window.innerHeight - popupH
        ? Math.max(8, rect.top - popupH - 4)
        : rect.top + rect.height + 4;
    }
  }

  shiftMonth(delta: number): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + delta, 1);
  }

  get calendarWeeks(): (Date | null)[][] {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Пн = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }

  isSelectedDay(day: Date): boolean {
    const cur = this.calendarOpen === 'from' ? this.campaign.dateFrom : this.campaign.dateTo;
    const parsed = this.parseDate(cur);
    return !!parsed && parsed.getTime() === day.getTime();
  }

  pickDay(day: Date): void {
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    if (this.calendarOpen === 'from') {
      this.campaign.dateFrom = iso;
      this.errors.dateFrom = '';
    } else {
      this.campaign.dateTo = iso;
      this.errors.dateTo = '';
    }
    this.calendarOpen = null;
  }

  // ─── Toast ───

  showToast(text: string): void {
    this.toast = text;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast = '';
    }, 2500);
  }
}
