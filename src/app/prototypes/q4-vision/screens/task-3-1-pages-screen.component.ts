import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4TaskHeaderComponent } from '../components/q4-task-header.component';
import { THEME_PAGES } from '../data/mock-data';
import { Q4Page } from '../types';

@Component({
  selector: 'app-task-3-1-pages-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4TaskHeaderComponent],
  template: `
    <div class="t-container">
      <app-q4-task-header
        goal="3"
        taskKey="3.1"
        title="Новый view навигации страниц темы"
        [jira]="['DS-1340']"
        [changes]="[
          'Сейчас: переключение страниц — combobox «Настройка режима» в правой панели; справочник тем — плоская таблица без превью',
          'Будет: лента страниц слева в конструкторе (миниатюры, создание, условия показа) + дерево тем с крупными превью в справочнике. Один механизм во всех продуктах'
        ]"
      ></app-q4-task-header>

      <!-- Card 1: конструктор с лентой страниц -->
      <div class="t-card">
        <div class="t-card-head">
          <span class="t-crumb">Конструктор темы «Кофейня» /</span>
          <span class="t-card-title">Лента страниц</span>
          <span class="t-combo-note">combobox «Настройка режима» убирается</span>
        </div>

        <div class="t-editor">
          <!-- Лента страниц -->
          <div class="t-ribbon">
            <div
              class="t-page-mini"
              *ngFor="let p of pages"
              [class.active]="activePage.id === p.id"
              (click)="activePage = p"
            >
              <div class="t-page-thumb">
                <div
                  class="t-thumb-block"
                  *ngFor="let el of p.elements"
                  [style.background]="el.color"
                ></div>
              </div>
              <div class="t-page-name">{{ p.name }}</div>
              <div class="t-page-tag" *ngIf="p.custom">условия показа</div>
            </div>

            <button class="t-add-page" (click)="addOpen = true">
              <lucide-icon name="plus" [size]="16"></lucide-icon>
              Добавить страницу
            </button>
          </div>

          <!-- Канвас -->
          <div class="t-canvas">
            <div class="t-canvas-head">
              <span>{{ activePage.name }}</span>
              <span class="t-canvas-cond" *ngIf="activePage.custom">{{ activePage.condition }}</span>
            </div>
            <div class="t-canvas-area">
              <div
                class="t-canvas-el"
                *ngFor="let el of activePage.elements"
                [style.background]="el.color"
              >
                {{ el.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: справочник тем -->
      <div class="t-card t-card-mt">
        <div class="t-card-head">
          <span class="t-crumb">Темы /</span>
          <span class="t-card-title">Дерево тем с превью страниц</span>
        </div>

        <div class="t-catalog">
          <div class="t-tree">
            <div class="t-tree-root" *ngFor="let p of pages">
              <div class="t-tree-node" [class.active]="previewPage.id === p.id" (click)="previewPage = p">
                <lucide-icon name="file" [size]="15"></lucide-icon>
                {{ p.name }}
              </div>
            </div>
          </div>
          <div class="t-preview">
            <div class="t-preview-caption">Превью без входа в конструктор</div>
            <div class="t-preview-screen">
              <div
                class="t-preview-el"
                *ngFor="let el of previewPage.elements"
                [style.background]="el.color"
              ></div>
            </div>
          </div>
        </div>

        <div class="t-note">
          <lucide-icon name="info" [size]="15"></lucide-icon>
          Прототип ленты страниц уже готов (задача 10, v1.46) — портируем его как общий компонент: Arrivals → Customer Screen → Kiosk. «Живые» превью (анимация) — отдельное решение.
        </div>
      </div>

      <!-- Modal: добавить страницу -->
      <div class="t-overlay" *ngIf="addOpen">
        <div class="t-modal">
          <div class="t-modal-head">
            <span class="t-modal-title">Новая страница</span>
            <button class="t-icon-btn" (click)="addOpen = false" aria-label="Закрыть">
              <lucide-icon name="x" [size]="18"></lucide-icon>
            </button>
          </div>
          <div class="t-modal-body">
            <label class="t-field">
              <span class="t-field-caption">Название</span>
              <input class="t-input" type="text" placeholder="Например, «Праздник»" #pageName />
            </label>
            <div class="t-field">
              <span class="t-field-caption">Условия показа (для кастомной страницы)</span>
              <div class="t-cond-row">
                <span class="t-cond-chip">Дата = 31.12</span>
                <span class="t-cond-op">OR</span>
                <span class="t-cond-chip">Дата = 01.01</span>
                <button class="t-cond-add" (click)="noop()">+ условие</button>
              </div>
            </div>
          </div>
          <div class="t-modal-foot">
            <button class="t-btn" (click)="addOpen = false">Отмена</button>
            <button class="t-btn t-btn-primary" (click)="addPage(pageName.value)">Создать</button>
          </div>
        </div>
      </div>

      <div class="t-snack" *ngIf="snack">
        <lucide-icon name="check-circle" [size]="16"></lucide-icon>
        {{ snack }}
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .t-container { max-width: 1200px; margin: 0 auto; padding: 24px; font-family: Roboto, sans-serif; }
      .t-card {
        background: var(--dt-surface-primary);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-sl);
      }
      .t-card-mt { margin-top: 16px; }
      .t-card-head { display: flex; align-items: baseline; gap: 6px; padding: 14px 20px 0; flex-wrap: wrap; }
      .t-crumb { font-size: 12px; color: var(--dt-text-disable); }
      .t-card-title { font-size: 16px; font-weight: 500; color: var(--dt-text-primary); }
      .t-combo-note {
        margin-left: auto;
        font-size: 11px;
        color: #EA7806;
        background: #FFF9F0;
        border-radius: 4px;
        padding: 3px 8px;
      }

      .t-editor { display: flex; gap: 0; padding: 14px 20px 20px; }
      .t-ribbon {
        width: 200px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-right: 1px solid var(--dt-stroke-default);
        padding-right: 14px;
      }
      .t-page-mini {
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        background: var(--dt-surface-primary);
      }
      .t-page-mini:hover { background: var(--dt-surface-hover); }
      .t-page-mini.active { border-color: var(--dt-brand-accent); background: var(--dt-brand-accent-lighter); }
      .t-page-thumb {
        height: 56px;
        background: #E8E8E8;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 6px;
        overflow: hidden;
      }
      .t-thumb-block { height: 8px; border-radius: 2px; flex-shrink: 0; }
      .t-page-name { font-size: 12px; font-weight: 500; color: var(--dt-text-primary); margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .t-page-tag { font-size: 10px; color: var(--dt-brand-accent); margin-top: 2px; }
      .t-add-page {
        display: flex; align-items: center; justify-content: center; gap: 6px;
        height: 34px;
        border: 1px dashed var(--dt-stroke-default);
        border-radius: 4px;
        background: transparent;
        font-size: 12px;
        color: var(--dt-text-secondary);
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .t-add-page:hover { border-color: var(--dt-brand-accent); color: var(--dt-brand-accent); }

      .t-canvas { flex: 1; min-width: 0; padding-left: 16px; }
      .t-canvas-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .t-canvas-head span:first-child { font-size: 13px; font-weight: 500; color: var(--dt-text-primary); }
      .t-canvas-cond { font-size: 11px; color: var(--dt-text-secondary); background: var(--dt-surface-variant); border: 1px solid var(--dt-stroke-default); border-radius: 4px; padding: 2px 8px; }
      .t-canvas-area {
        background: #E8E8E8;
        border-radius: 4px;
        min-height: 280px;
        padding: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-content: flex-start;
      }
      .t-canvas-el {
        border-radius: 4px;
        padding: 14px 18px;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 500;
        box-shadow: var(--dt-shadow-sl);
      }

      .t-catalog { display: flex; gap: 20px; padding: 14px 20px 0; }
      .t-tree { width: 240px; flex-shrink: 0; border: 1px solid var(--dt-stroke-default); border-radius: 4px; padding: 8px; }
      .t-tree-root { margin: 4px 0 8px; }
      .t-tree-node {
        display: flex; align-items: center; gap: 8px;
        font-size: 12px; color: var(--dt-text-primary);
        padding: 6px 8px;
        border-radius: 3px;
        cursor: pointer;
      }
      .t-tree-node:hover { background: var(--dt-surface-hover); }
      .t-tree-node.active { background: var(--dt-brand-accent-lighter); color: var(--dt-brand-accent-dark); font-weight: 500; }
      .t-preview { flex: 1; }
      .t-preview-caption { font-size: 11px; color: var(--dt-text-secondary); margin-bottom: 8px; }
      .t-preview-screen {
        background: #E8E8E8;
        border-radius: 4px;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 14px;
      }
      .t-preview-el { height: 26px; border-radius: 3px; }

      .t-note {
        margin: 14px 20px 20px;
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px; padding: 10px 12px;
      }

      .t-overlay {
        position: fixed; inset: 0;
        background: rgba(33, 33, 33, 0.4);
        display: flex; align-items: center; justify-content: center;
        z-index: 200;
      }
      .t-modal {
        width: 440px; max-width: calc(100vw - 32px);
        background: var(--dt-surface-primary);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-xl);
      }
      .t-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--dt-stroke-default); }
      .t-modal-title { font-size: 15px; font-weight: 500; color: var(--dt-text-primary); }
      .t-modal-body { padding: 14px 20px; }
      .t-field { display: block; margin-bottom: 14px; }
      .t-field-caption { display: block; font-size: 12px; color: var(--dt-text-secondary); margin-bottom: 6px; }
      .t-input {
        width: 100%;
        height: 36px;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 0 12px;
        font-size: 13px;
        font-family: Roboto, sans-serif;
        color: var(--dt-text-primary);
        outline: none;
      }
      .t-input:focus { border-color: var(--dt-brand-accent); }
      .t-cond-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .t-cond-chip { font-size: 12px; background: var(--dt-brand-accent-lighter); color: var(--dt-brand-accent-dark); border-radius: 4px; padding: 4px 10px; }
      .t-cond-op { font-size: 12px; font-weight: 700; color: var(--dt-text-secondary); }
      .t-cond-add { border: 1px dashed var(--dt-stroke-default); background: transparent; border-radius: 4px; font-size: 12px; color: var(--dt-brand-accent); padding: 4px 10px; cursor: pointer; font-family: Roboto, sans-serif; }
      .t-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--dt-stroke-default); }

      .t-btn {
        display: inline-flex; align-items: center; gap: 6px;
        height: 36px; padding: 0 16px;
        border-radius: 4px;
        font-size: 13px; font-weight: 500;
        border: 1px solid var(--dt-stroke-default);
        background: var(--dt-surface-primary);
        color: var(--dt-text-primary);
        cursor: pointer;
        font-family: Roboto, sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.2px;
      }
      .t-btn:hover { background: #FAFAFA; }
      .t-btn-primary { background: #448AFF; border-color: #448AFF; color: #FFFFFF; }
      .t-btn-primary:hover { background: #3969D5; }
      .t-icon-btn {
        display: flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
        border: none; background: transparent; border-radius: 4px;
        color: var(--dt-icon-primary); cursor: pointer;
      }
      .t-icon-btn:hover { background: #EBEBEB; }

      .t-snack {
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        display: flex; align-items: center; gap: 8px;
        background: var(--dt-surface-snack-tooltip);
        color: #FFFFFF; font-size: 13px;
        border-radius: 4px; padding: 10px 16px;
        box-shadow: var(--dt-shadow-m);
        z-index: 300;
        animation: fade-in-up 0.25s ease-out;
      }
      @keyframes fade-in-up {
        from { opacity: 0; transform: translate(-50%, 8px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    `,
  ],
})
export class Task31PagesScreenComponent {
  pages: Q4Page[] = THEME_PAGES.map(p => ({ ...p, elements: p.elements.map(e => ({ ...e })) }));
  activePage: Q4Page = this.pages[0];
  previewPage: Q4Page = this.pages[0];
  addOpen = false;
  snack = '';

  noop(): void {
    // демо-кнопка «+ условие» — интерактив не требуется
  }

  addPage(name: string): void {
    const n = (name || '').trim() || 'Новая страница';
    this.pages.push({
      id: 'p' + (this.pages.length + 1),
      name: n,
      custom: true,
      condition: 'Дата = 31.12 OR Дата = 01.01',
      elements: [],
    });
    this.activePage = this.pages[this.pages.length - 1];
    this.addOpen = false;
    this.snack = `Страница «${n}» создана`;
    setTimeout(() => (this.snack = ''), 2200);
  }
}
