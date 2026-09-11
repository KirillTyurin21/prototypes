import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import { THEME_PAGES, Q4_THEMES } from '../data/mock-data';
import { Q4_COMMON_STYLES } from '../data/q4-common.styles';
import { Q4Page, Q4Element, Q4ThemeRow } from '../types';

interface PageCondition {
  op: 'AND' | 'OR';
}

@Component({
  selector: 'app-task-3-1-pages-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="c-container">
      <app-q4-crumbs [items]="crumbs"></app-q4-crumbs>

      <div class="q4-note">
        <lucide-icon name="info" [size]="15"></lucide-icon>
        <span>
          Целевое решение 3.1 (DS-1340): лента страниц слева в конструкторе вместо combobox «Настройка режима» + дерево тем с превью.
          Прототип ленты уже готов (задача 10, v1.46) — портируем как общий компонент: Arrivals → Customer Screen → Kiosk.
        </span>
      </div>

      <!-- ================= КОНСТРУКТОР ================= -->
      <div class="c-card c-card-editor">
        <div class="c-editor">
          <!-- Лента страниц -->
          <div class="c-ribbon" [class.collapsed]="ribbonCollapsed">
            <div class="c-ribbon-head" *ngIf="!ribbonCollapsed">
              <span class="c-ribbon-title">Страницы</span>
              <button class="c-ribbon-collapse" (click)="ribbonCollapsed = true" aria-label="Свернуть ленту">
                <lucide-icon name="chevrons-left" [size]="16"></lucide-icon>
              </button>
            </div>
            <div class="c-ribbon-collapsed-head" *ngIf="ribbonCollapsed">
              <button class="c-ribbon-collapse" (click)="ribbonCollapsed = false" aria-label="Развернуть ленту">
                <lucide-icon name="chevrons-right" [size]="16"></lucide-icon>
              </button>
              <button class="c-ribbon-letter" *ngFor="let p of pages" [class.active]="activePage.id === p.id" (click)="activePage = p">
                {{ p.name.charAt(0) }}
              </button>
            </div>

            <ng-container *ngIf="!ribbonCollapsed">
              <div
                class="c-page-card"
                *ngFor="let p of pages"
                [class.active]="activePage.id === p.id"
                (click)="activePage = p"
              >
                <button class="c-page-del" *ngIf="p.custom" (click)="removePage(p, $event)" aria-label="Удалить страницу">
                  <lucide-icon name="x" [size]="12"></lucide-icon>
                </button>
                <div class="c-page-thumb">
                  <div class="c-thumb-block" *ngFor="let el of p.elements" [style.background]="el.color"></div>
                  <div class="c-thumb-empty" *ngIf="p.elements.length === 0">Пусто</div>
                </div>
                <div class="c-page-name-row">
                  <span class="c-page-id" *ngIf="p.custom">A{{ customIndex(p) }}</span>
                  <input
                    class="c-page-name-input"
                    *ngIf="renamingId === p.id"
                    [value]="p.name"
                    (blur)="renamingId = ''"
                    (keydown.enter)="renamingId = ''"
                    (input)="p.name = $any($event.target).value"
                    (click)="$event.stopPropagation()"
                    maxlength="60"
                  />
                  <span class="c-page-name" *ngIf="renamingId !== p.id" [title]="p.name">{{ p.name }}</span>
                  <button class="c-page-rename" (click)="startRename(p, $event)" aria-label="Переименовать страницу">
                    <lucide-icon name="pencil" [size]="12"></lucide-icon>
                  </button>
                </div>
              </div>
              <button class="c-add-page" (click)="addOpen = true">
                <lucide-icon name="plus" [size]="16"></lucide-icon>
                Добавить страницу
              </button>
            </ng-container>
          </div>

          <!-- Канвас -->
          <div class="c-canvas">
            <div class="c-canvas-top">
              <span class="c-canvas-page">{{ activePage.name }}</span>
              <span class="c-canvas-cond" *ngIf="activePage.custom">{{ activePage.condition }}</span>
            </div>
            <div class="c-canvas-area">
              <div class="c-canvas-scale" [style.transform]="'scale(' + zoom / 100 + ')'">
                <div class="c-canvas-el" *ngFor="let el of activePage.elements" [style.background]="el.color">
                  {{ el.name }}
                </div>
              </div>
            </div>
            <div class="c-canvas-toolbar">
              <button class="c-tool-btn" [class.active]="showBorders" (click)="showBorders = !showBorders" title="Границы">
                <lucide-icon [name]="showBorders ? 'eye' : 'eye-off'" [size]="16"></lucide-icon>
              </button>
              <button class="c-tool-btn" [class.active]="showGrid" (click)="showGrid = !showGrid" title="Сетка">
                <lucide-icon name="layout-grid" [size]="16"></lucide-icon>
              </button>
              <button class="c-tool-btn" [class.active]="snap" (click)="snap = !snap" title="Прилипание">
                <lucide-icon name="magnet" [size]="16"></lucide-icon>
              </button>
              <div class="c-zoom">
                <button class="c-tool-btn" (click)="zoomOut()" aria-label="Уменьшить">
                  <lucide-icon name="minus" [size]="14"></lucide-icon>
                </button>
                <span class="c-zoom-value">{{ zoom }}%</span>
                <button class="c-tool-btn" (click)="zoomIn()" aria-label="Увеличить">
                  <lucide-icon name="plus" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Панель управления -->
          <div class="c-panel">
            <div class="c-panel-crumbs">
              <lucide-icon name="home" [size]="14"></lucide-icon>
              Тема / {{ themeName }}
            </div>
            <div class="c-panel-field">
              <span class="c-panel-label">Имя темы</span>
              <input class="c-panel-input" [value]="themeName" (input)="themeName = $any($event.target).value" />
            </div>
            <div class="c-panel-field">
              <span class="c-panel-label">Разрешение</span>
              <select class="c-panel-select">
                <option>1024x768</option>
                <option>1280x720</option>
                <option>1920x1080</option>
              </select>
            </div>

            <div class="c-panel-divider"></div>
            <div class="c-panel-section">
              <span class="c-panel-section-title">Страница: {{ activePage.name }}</span>
              <div class="c-toggle-row" *ngIf="canDeactivate(activePage)">
                <span class="c-toggle-label">Активировать</span>
                <button
                  class="c-switch"
                  [class.on]="isActivated(activePage)"
                  (click)="toggleActivated(activePage)"
                  aria-label="Активировать страницу"
                >
                  <span class="c-switch-knob"></span>
                </button>
              </div>
            </div>

            <div class="c-panel-section" *ngIf="activePage.custom">
              <span class="c-panel-section-title">Условия отображения страницы</span>
              <div class="c-panel-hint">Страница показывается, когда выполняются условия</div>
              <div class="c-cond-row" *ngFor="let c of conditionsOf(activePage); let i = index">
                <span class="c-cond-index">Условие {{ i + 1 }}</span>
                <select class="c-panel-select c-cond-select" [value]="c.op" (change)="c.op = $any($event.target).value">
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
              <button class="c-add-cond" (click)="addCondition(activePage)">
                <lucide-icon name="plus" [size]="14"></lucide-icon>
                Добавить условие
              </button>
            </div>

            <div class="c-panel-divider"></div>
            <div class="c-panel-section">
              <span class="c-panel-section-title">Элементы ({{ activePage.elements.length }})</span>
              <div class="c-el-row" *ngFor="let el of activePage.elements">
                <lucide-icon [name]="elementIcon(el)" [size]="14"></lucide-icon>
                <span class="c-el-name">{{ el.name }}</span>
                <button class="c-el-eye" aria-label="Видимость элемента">
                  <lucide-icon name="eye" [size]="14"></lucide-icon>
                </button>
              </div>
              <button class="c-add-element" (click)="showSnack('Палитра элементов (демо)')">
                <lucide-icon name="plus" [size]="14"></lucide-icon>
                Добавить элемент
              </button>
            </div>

            <div class="c-panel-divider"></div>
            <div class="c-combo-strike">
              <span class="c-combo-strike-label">Настройка режима</span>
              <span class="c-combo-strike-note">убирается — вместо него лента страниц слева</span>
            </div>

            <div class="c-panel-foot">
              <button class="c-foot-save" (click)="showSnack('Сохранено')">СОХРАНИТЬ</button>
              <button class="c-foot-back" (click)="goCatalog()">НАЗАД</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= СПРАВОЧНИК ТЕМ ================= -->
      <div class="c-card c-card-catalog" id="themes-card">
        <div class="c-catalog-head">
          <span class="c-catalog-title">Темы</span>
          <div class="c-catalog-actions">
            <button class="q4-btn c-btn-orange-outline" (click)="showSnack('Импорт/экспорт (демо)')">Импорт/экспорт</button>
            <button class="q4-btn q4-btn-outline" (click)="showSnack('Создать папку (демо)')">Создать папку</button>
            <button class="q4-btn q4-btn-primary" (click)="showSnack('Новая тема (демо)')">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              Добавить
            </button>
          </div>
        </div>

        <div class="c-catalog-body">
          <div class="q4-table-wrap c-themes-table">
            <table class="q4-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Разрешение</th>
                  <th>Создано</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let t of themes"
                  (click)="selectedTheme = t"
                  [class.c-row-selected]="selectedTheme?.id === t.id"
                  class="c-row-click"
                >
                  <td class="c-td-name">{{ t.name }}</td>
                  <td>{{ t.resolution }}</td>
                  <td>{{ t.created }}</td>
                  <td class="q4-actions" (click)="$event.stopPropagation()">
                    <button class="q4-icon-btn" (click)="showSnack('Редактирование темы (демо)')" aria-label="Редактировать тему">
                      <lucide-icon name="pencil" [size]="18"></lucide-icon>
                    </button>
                    <button class="q4-icon-btn q4-icon-btn-danger" (click)="showSnack('Удаление темы (демо)')" aria-label="Удалить тему">
                      <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                    </button>
                    <button class="q4-icon-btn" (click)="showSnack('Копирование темы (демо)')" aria-label="Копировать тему">
                      <lucide-icon name="copy" [size]="18"></lucide-icon>
                    </button>
                    <button class="q4-icon-btn" (click)="showSnack('Предпросмотр (демо)')" aria-label="Предпросмотр темы">
                      <lucide-icon name="eye" [size]="18"></lucide-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="c-preview-area">
            <div class="c-preview-caption">Кликните на тему для предпросмотра</div>
            <ng-container *ngIf="selectedTheme">
              <div class="c-preview-theme-name">{{ selectedTheme.name }} — {{ previewPage.name }}</div>
              <div class="c-preview-screen">
                <div class="c-preview-el" *ngFor="let el of previewPage.elements" [style.background]="el.color"></div>
              </div>
            </ng-container>
            <div class="c-preview-empty" *ngIf="!selectedTheme">Превью темы и страниц без входа в конструктор</div>
          </div>
        </div>
      </div>

      <!-- Модалка: новая страница -->
      <div class="q4-overlay" *ngIf="addOpen" (click)="addOpen = false">
        <div class="q4-dialog" (click)="$event.stopPropagation()">
          <div class="q4-dialog-head">
            <span class="q4-dialog-head-title">Новая страница</span>
            <button class="q4-icon-btn" (click)="addOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="q4-dialog-body">
            <div class="q4-mdc-field c-full" [class.has-value]="newPageName">
              <input class="q4-mdc-input" [value]="newPageName" (input)="newPageName = $any($event.target).value" placeholder="Например, «Праздник»" />
              <label class="q4-mdc-label">Название страницы</label>
            </div>
          </div>
          <div class="q4-dialog-foot">
            <button class="q4-btn q4-btn-outline" (click)="addOpen = false">Отмена</button>
            <button class="q4-btn q4-btn-primary" [disabled]="!newPageName.trim()" (click)="addPage()">Создать</button>
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
      .c-container { max-width: 1280px; margin: 0 auto; padding: 20px 24px; font-family: Roboto, sans-serif; }

      .c-card {
        background: #FFFFFF;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,.06);
      }
      .c-card-editor { overflow: hidden; }
      .c-card-catalog { margin-top: 16px; }

      /* === Конструктор === */
      .c-editor { display: flex; min-height: 520px; }

      /* Лента страниц */
      .c-ribbon {
        width: 172px;
        flex-shrink: 0;
        border-right: 1px solid #E0E0E0;
        padding: 12px 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: width 0.2s ease-out;
      }
      .c-ribbon.collapsed { width: 44px; padding: 12px 6px; }
      .c-ribbon-head { display: flex; align-items: center; justify-content: space-between; padding: 0 2px; }
      .c-ribbon-title { font-size: 12px; font-weight: 500; text-transform: uppercase; color: #424242; letter-spacing: 0.3px; }
      .c-ribbon-collapse {
        display: flex; align-items: center; justify-content: center;
        width: 24px; height: 24px;
        border: none; background: transparent; border-radius: 4px;
        color: #616161; cursor: pointer;
      }
      .c-ribbon-collapse:hover { background: #EBEBEB; }
      .c-ribbon-collapsed-head { display: flex; flex-direction: column; gap: 6px; align-items: center; }
      .c-ribbon-letter {
        width: 28px; height: 28px;
        border: 1px solid #E0E0E0; border-radius: 4px;
        background: #FFFFFF;
        font-size: 13px; font-weight: 500; color: #616161;
        cursor: pointer;
      }
      .c-ribbon-letter.active { border-color: #448AFF; background: #F0F5FF; color: #448AFF; }

      .c-page-card {
        position: relative;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        background: #FFFFFF;
      }
      .c-page-card:hover { background: #F5F5F5; }
      .c-page-card.active { border-color: #448AFF; background: #F0F5FF; }
      .c-page-del {
        position: absolute; top: 4px; right: 4px;
        display: none;
        align-items: center; justify-content: center;
        width: 18px; height: 18px;
        border: none; background: transparent; border-radius: 3px;
        color: #9E9E9E; cursor: pointer;
      }
      .c-page-card:hover .c-page-del { display: flex; }
      .c-page-del:hover { background: #EBEBEB; color: #616161; }
      .c-page-thumb {
        height: 72px;
        background: #E8E8E8;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 6px;
        overflow: hidden;
      }
      .c-thumb-block { height: 8px; border-radius: 2px; flex-shrink: 0; }
      .c-thumb-empty { font-size: 10px; color: #9E9E9E; text-align: center; margin-top: 8px; }
      .c-page-name-row { display: flex; align-items: center; gap: 4px; margin-top: 6px; }
      .c-page-id {
        font-size: 10px; font-weight: 500;
        color: #FFFFFF; background: #448AFF;
        border-radius: 999px;
        padding: 1px 6px;
        flex-shrink: 0;
      }
      .c-page-name { font-size: 12px; font-weight: 500; color: #333333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
      .c-page-name-input {
        flex: 1; min-width: 0;
        font-size: 12px; font-family: Roboto, sans-serif;
        border: 1px solid #448AFF; border-radius: 3px;
        padding: 2px 4px;
        outline: none;
      }
      .c-page-rename {
        display: none;
        align-items: center; justify-content: center;
        width: 18px; height: 18px;
        border: none; background: transparent; border-radius: 3px;
        color: #9E9E9E; cursor: pointer;
        flex-shrink: 0;
      }
      .c-page-card:hover .c-page-rename { display: flex; }
      .c-page-rename:hover { background: #EBEBEB; color: #448AFF; }
      .c-add-page {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        height: 34px;
        border: 1px solid #448AFF;
        border-radius: 4px;
        background: #FFFFFF;
        font-size: 12px;
        color: #448AFF;
        cursor: pointer;
        font-family: Roboto, sans-serif;
        text-transform: uppercase;
      }
      .c-add-page:hover { background: #F0F5FF; }

      /* Канвас */
      .c-canvas { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .c-canvas-top { display: flex; align-items: center; gap: 10px; padding: 12px 16px 0; }
      .c-canvas-page { font-size: 13px; font-weight: 500; color: #333333; }
      .c-canvas-cond {
        font-size: 11px; color: #616161;
        background: #F8F9FC; border: 1px solid #E0E0E0;
        border-radius: 4px; padding: 2px 8px;
      }
      .c-canvas-area {
        flex: 1;
        margin: 8px 16px;
        background-color: #E8E8E8;
        background-image: linear-gradient(45deg, #D6D6D6 1px, transparent 1px), linear-gradient(-45deg, #D6D6D6 1px, transparent 1px);
        background-size: 20px 20px;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }
      .c-canvas-scale {
        position: absolute; top: 16px; left: 16px;
        transform-origin: top left;
        display: flex; flex-wrap: wrap; gap: 12px;
        transition: transform 0.15s ease-out;
      }
      .c-canvas-el {
        border-radius: 4px;
        padding: 14px 18px;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 2px 2px 0 rgba(224,224,224,1), 0 1px 1px 0 rgba(214,214,214,1);
      }
      .c-canvas-toolbar {
        display: flex; align-items: center; gap: 4px;
        padding: 8px 16px 12px;
      }
      .c-tool-btn {
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
        border: none; background: transparent; border-radius: 4px;
        color: #616161; cursor: pointer;
      }
      .c-tool-btn:hover { background: #EBEBEB; }
      .c-tool-btn.active { background: #E3F2FD; color: #448AFF; }
      .c-zoom {
        margin-left: auto;
        display: flex; align-items: center; gap: 2px;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        background: #FFFFFF;
        padding: 2px;
      }
      .c-zoom-value { font-size: 12px; color: #616161; min-width: 44px; text-align: center; }

      /* Панель управления */
      .c-panel {
        width: 320px;
        flex-shrink: 0;
        border-left: 1px solid #E0E0E0;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
      }
      .c-panel-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #616161; }
      .c-panel-crumbs lucide-icon { color: #448AFF; }
      .c-panel-field { display: flex; flex-direction: column; gap: 4px; }
      .c-panel-label { font-size: 11px; color: #9E9E9E; }
      .c-panel-input {
        height: 34px;
        border: 1px solid rgba(0,0,0,.23);
        border-radius: 4px;
        padding: 0 10px;
        font-size: 13px; font-family: Roboto, sans-serif;
        color: #333333;
        outline: none;
      }
      .c-panel-input:focus { border: 2px solid #448AFF; }
      .c-panel-select {
        height: 34px;
        border: 1px solid rgba(0,0,0,.23);
        border-radius: 4px;
        padding: 0 8px;
        font-size: 13px; font-family: Roboto, sans-serif;
        color: #333333;
        background: #FFFFFF;
        outline: none;
      }
      .c-panel-divider { border-top: 1px solid #E0E0E0; margin: 2px 0; }
      .c-panel-section { display: flex; flex-direction: column; gap: 6px; }
      .c-panel-section-title { font-size: 12px; font-weight: 500; color: #424242; }
      .c-toggle-row { display: flex; align-items: center; justify-content: space-between; }
      .c-toggle-label { font-size: 13px; color: #333333; }
      .c-switch {
        width: 36px; height: 20px;
        border: none; border-radius: 999px;
        background: #BDBDBD;
        cursor: pointer;
        position: relative;
        transition: background 0.15s ease-out;
      }
      .c-switch.on { background: #448AFF; }
      .c-switch-knob {
        position: absolute; top: 2px; left: 2px;
        width: 16px; height: 16px;
        border-radius: 999px;
        background: #FFFFFF;
        transition: left 0.15s ease-out;
      }
      .c-switch.on .c-switch-knob { left: 18px; }
      .c-panel-hint { font-size: 11px; color: #9E9E9E; }
      .c-cond-row { display: flex; align-items: center; gap: 8px; }
      .c-cond-index { font-size: 12px; color: #616161; }
      .c-cond-select { width: 90px; }
      .c-add-cond {
        display: flex; align-items: center; gap: 6px;
        height: 30px;
        border: 1px dashed #E0E0E0;
        border-radius: 4px;
        background: transparent;
        font-size: 12px; color: #448AFF;
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .c-el-row {
        display: flex; align-items: center; gap: 8px;
        font-size: 12px; color: #333333;
        padding: 5px 4px;
        border-radius: 3px;
      }
      .c-el-row:hover { background: #F5F5F5; }
      .c-el-row lucide-icon:first-child { color: #616161; }
      .c-el-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .c-el-eye {
        display: flex; align-items: center; justify-content: center;
        width: 22px; height: 22px;
        border: none; background: transparent; border-radius: 3px;
        color: #9E9E9E; cursor: pointer;
      }
      .c-el-eye:hover { background: #EBEBEB; }
      .c-add-element {
        display: flex; align-items: center; gap: 6px;
        height: 34px; padding: 0 12px;
        border: none; border-radius: 4px;
        background: #448AFF;
        color: #FFFFFF;
        font-size: 12px;
        font-family: Roboto, sans-serif;
        cursor: pointer;
        text-transform: uppercase;
        justify-content: center;
      }
      .c-add-element:hover { background: #3969D5; }

      .c-combo-strike {
        border: 1px dashed #E0E0E0;
        border-radius: 4px;
        padding: 8px 10px;
        display: flex; flex-direction: column; gap: 2px;
      }
      .c-combo-strike-label { font-size: 12px; font-weight: 500; color: #9E9E9E; text-decoration: line-through; }
      .c-combo-strike-note { font-size: 11px; color: #EA7806; }

      .c-panel-foot { display: flex; gap: 8px; margin-top: auto; padding-top: 8px; }
      .c-foot-save {
        flex: 1;
        height: 36px;
        border: 2px solid #616161;
        border-radius: 4px;
        background: #FFFFFF;
        font-size: 13px; font-weight: 500;
        color: #616161;
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .c-foot-save:hover { background: #FAFAFA; }
      .c-foot-back {
        flex: 1;
        height: 36px;
        border: none;
        border-radius: 4px;
        background: #FF9800;
        font-size: 13px; font-weight: 500;
        color: #FFFFFF;
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .c-foot-back:hover { background: #F57C00; }

      /* === Справочник тем === */
      .c-catalog-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px 0; }
      .c-catalog-title { font-size: 16px; font-weight: 500; color: #333333; }
      .c-catalog-actions { display: flex; gap: 8px; }
      .c-btn-orange-outline { border-color: #FF6D00; color: #FF6D00; }
      .c-btn-orange-outline:hover:not(:disabled) { background: #FFF3E0; }

      .c-catalog-body { display: flex; gap: 16px; padding: 14px 20px 20px; }
      .c-themes-table { flex: 1; min-width: 0; }
      .c-row-click { cursor: pointer; }
      .c-row-selected td { background: #F5F5F5; }
      .c-td-name { font-weight: 500; }

      .c-preview-area {
        width: 260px; flex-shrink: 0;
        border: 1px solid #E0E0E0;
        border-radius: 4px;
        padding: 12px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .c-preview-caption { font-size: 11px; color: #9E9E9E; }
      .c-preview-theme-name { font-size: 12px; font-weight: 500; color: #333333; }
      .c-preview-screen {
        background: #E8E8E8;
        border-radius: 4px;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
      }
      .c-preview-el { height: 22px; border-radius: 3px; }
      .c-preview-empty { font-size: 12px; color: #9E9E9E; text-align: center; padding: 24px 8px; }

      .c-full { width: 100%; }
    `,
  ],
})
export class Task31PagesScreenComponent {
  pages: Q4Page[] = THEME_PAGES.map(p => ({ ...p, elements: p.elements.map(e => ({ ...e })) }));
  activePage: Q4Page = this.pages[0];
  previewPage: Q4Page = this.pages[0];

  themes: Q4ThemeRow[] = Q4_THEMES.map(t => ({ ...t }));
  selectedTheme: Q4ThemeRow | null = null;

  themeName = 'Кофейня';
  ribbonCollapsed = false;
  renamingId = '';
  addOpen = false;
  newPageName = '';

  showBorders = true;
  showGrid = true;
  snap = false;
  zoom = 100;

  private activated = new Set<string>(['p1']);
  private conditions = new Map<string, PageCondition[]>();

  snack = '';

  crumbs = [{ label: 'Экраны и звуки' }, { label: 'Темы' }, { label: 'Конструктор темы' }];

  customIndex(p: Q4Page): number {
    const customs = this.pages.filter(x => x.custom);
    return customs.indexOf(p) + 1;
  }

  elementIcon(el: Q4Element): string {
    return el.type === 'image' ? 'image' : 'type';
  }

  canDeactivate(p: Q4Page): boolean {
    return !(this.pages[0] === p && !p.custom);
  }

  isActivated(p: Q4Page): boolean {
    if (p.custom) return this.activated.has(p.id);
    return true;
  }

  toggleActivated(p: Q4Page): void {
    if (this.activated.has(p.id)) this.activated.delete(p.id);
    else this.activated.add(p.id);
  }

  conditionsOf(p: Q4Page): PageCondition[] {
    if (!this.conditions.has(p.id)) {
      this.conditions.set(p.id, [{ op: 'OR' }]);
    }
    return this.conditions.get(p.id)!;
  }

  addCondition(p: Q4Page): void {
    this.conditionsOf(p).push({ op: 'OR' });
  }

  startRename(p: Q4Page, event: Event): void {
    event.stopPropagation();
    this.renamingId = p.id;
  }

  removePage(p: Q4Page, event: Event): void {
    event.stopPropagation();
    this.pages = this.pages.filter(x => x.id !== p.id);
    if (this.activePage.id === p.id) {
      this.activePage = this.pages[0];
    }
    this.showSnack(`Страница «${p.name}» удалена`);
  }

  addPage(): void {
    const n = (this.newPageName || '').trim() || 'Новая страница';
    this.pages.push({
      id: 'p' + (this.pages.length + 1),
      name: n,
      custom: true,
      condition: 'Дата = 31.12 OR Дата = 01.01',
      elements: [],
    });
    const added = this.pages[this.pages.length - 1];
    this.activated.add(added.id);
    this.conditions.set(added.id, [{ op: 'OR' }]);
    this.activePage = added;
    this.addOpen = false;
    this.newPageName = '';
    this.showSnack(`Страница «${n}» создана (ID A${this.customIndex(added)})`);
  }

  goCatalog(): void {
    document.getElementById('themes-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  zoomIn(): void {
    this.zoom = Math.min(200, this.zoom + 10);
  }

  zoomOut(): void {
    this.zoom = Math.max(50, this.zoom - 10);
  }

  showSnack(text: string): void {
    this.snack = text;
    setTimeout(() => (this.snack = ''), 2500);
  }
}
