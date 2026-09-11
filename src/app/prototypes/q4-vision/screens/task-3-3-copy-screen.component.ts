import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import { THEME_PAGES } from '../data/mock-data';
import { Q4Page, Q4Element } from '../types';

@Component({
  selector: 'app-task-3-3-copy-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="t-container">
      <app-q4-crumbs [items]="crumbs"></app-q4-crumbs>

      <div class="t-note t-note-top">
        <lucide-icon name="info" [size]="15"></lucide-icon>
        <span>
          Целевое решение 3.3 (PB-7202): копирование выделенных элементов между страницами (кнопки или Ctrl+C/V)
          и копирование страницы целиком с новым именем — прямо из ленты страниц. Суффикс «(копия)». Копирование между темами — вне постановки.
        </span>
      </div>

      <div class="t-card">
        <div class="t-card-head">
          <span class="t-crumb">Конструктор темы «Кофейня» /</span>
          <span class="t-card-title">Копирование</span>
        </div>

        <!-- Toolbar -->
        <div class="t-toolbar">
          <button
            class="t-btn"
            [disabled]="!selectedIds.length"
            (click)="copySelected()"
            title="Ctrl+C"
          >
            <lucide-icon name="copy" [size]="15"></lucide-icon>
            Копировать
          </button>
          <button
            class="t-btn t-btn-primary"
            [disabled]="!clipboard.length || !activePage || clipboardFrom === activePage.id"
            (click)="paste()"
            title="Ctrl+V"
          >
            <lucide-icon name="clipboard" [size]="15"></lucide-icon>
            Вставить
            <span class="t-kbd" *ngIf="clipboard.length && clipboardFrom !== activePage.id">на «{{ activePage.name }}»</span>
          </button>
          <span class="t-toolbar-hint">
            <ng-container *ngIf="!selectedIds.length">Выделите элементы на канвасе, чтобы скопировать</ng-container>
            <ng-container *ngIf="selectedIds.length">Выделено: {{ selectedIds.length }}</ng-container>
          </span>
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
              <div class="t-page-head">
                <span class="t-page-name">{{ p.name }}</span>
                <button
                  class="t-page-copy"
                  (click)="copyPage(p, $event)"
                  title="Копировать страницу"
                  aria-label="Копировать страницу"
                >
                  <lucide-icon name="copy" [size]="13"></lucide-icon>
                </button>
              </div>
              <div class="t-page-thumb">
                <div class="t-thumb-block" *ngFor="let el of p.elements" [style.background]="el.color"></div>
              </div>
              <div class="t-page-tag" *ngIf="p.custom">условия показа</div>
            </div>
          </div>

          <!-- Канвас -->
          <div class="t-canvas">
            <div class="t-canvas-head">
              <span>{{ activePage.name }}</span>
              <span class="t-canvas-hint">Клик по элементу — выделить</span>
            </div>
            <div class="t-canvas-area">
              <div
                class="t-canvas-el"
                *ngFor="let el of activePage.elements"
                [class.selected]="el.selected"
                [style.background]="el.color"
                (click)="toggleSelect(el)"
              >
                <div class="t-el-name">{{ el.name }}</div>
                <div class="t-el-check" *ngIf="el.selected">
                  <lucide-icon name="check" [size]="12"></lucide-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Панель: элементы -->
          <div class="t-panel">
            <div class="t-panel-title">Элементы ({{ activePage.elements.length }})</div>
            <label class="t-el-row" *ngFor="let el of activePage.elements">
              <input type="checkbox" [checked]="el.selected" (change)="setSelected(el, $any($event.target).checked)" />
              <span class="t-el-row-name">{{ el.name }}</span>
            </label>
            <button class="t-panel-clear" *ngIf="selectedIds.length" (click)="clearSelection()">
              <lucide-icon name="x" [size]="14"></lucide-icon>
              Снять выделение ({{ selectedIds.length }})
            </button>
          </div>
        </div>

        <div class="t-note">
          <lucide-icon name="info" [size]="15"></lucide-icon>
          Скопированный объект получает новое имя с суффиксом «(копия)». Копирование между темами и продуктами — вне постановки.
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
      .t-container { max-width: 1100px; margin: 0 auto; padding: 24px; font-family: Roboto, sans-serif; }
      .t-card {
        background: var(--dt-surface-primary);
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        box-shadow: var(--dt-shadow-sl);
      }
      .t-card-head { display: flex; align-items: baseline; gap: 6px; padding: 14px 20px 0; flex-wrap: wrap; }
      .t-crumb { font-size: 12px; color: var(--dt-text-disable); }
      .t-card-title { font-size: 16px; font-weight: 500; color: var(--dt-text-primary); }

      .t-toolbar { display: flex; align-items: center; gap: 10px; padding: 14px 20px 0; }
      .t-btn {
        display: inline-flex; align-items: center; gap: 6px;
        height: 36px; padding: 0 14px;
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
      .t-btn:hover:not(:disabled) { background: #FAFAFA; }
      .t-btn-primary { background: #448AFF; border-color: #448AFF; color: #FFFFFF; }
      .t-btn-primary:hover:not(:disabled) { background: #3969D5; }
      .t-btn:disabled { background: #EBEBEB; color: #9E9E9E; border-color: #EBEBEB; cursor: default; }
      .t-kbd { font-size: 11px; font-weight: 400; text-transform: none; opacity: 0.85; }
      .t-toolbar-hint { font-size: 12px; color: var(--dt-text-secondary); margin-left: auto; }

      .t-editor { display: flex; gap: 0; padding: 14px 20px 0; }
      .t-ribbon {
        width: 210px;
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
      .t-page-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px; }
      .t-page-name { font-size: 12px; font-weight: 500; color: var(--dt-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .t-page-copy {
        display: flex; align-items: center; justify-content: center;
        width: 22px; height: 22px;
        border: none; background: transparent; border-radius: 3px;
        color: var(--dt-icon-primary);
        cursor: pointer;
        flex-shrink: 0;
      }
      .t-page-copy:hover { background: #EBEBEB; color: var(--dt-brand-accent); }
      .t-page-thumb {
        height: 52px;
        background: #E8E8E8;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 6px;
        overflow: hidden;
      }
      .t-thumb-block { height: 8px; border-radius: 2px; flex-shrink: 0; }
      .t-page-tag { font-size: 10px; color: var(--dt-brand-accent); margin-top: 4px; }

      .t-canvas { flex: 1; min-width: 0; padding-left: 16px; }
      .t-canvas-head { margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
      .t-canvas-head span { font-size: 13px; font-weight: 500; color: var(--dt-text-primary); }
      .t-canvas-hint { font-size: 11px; font-weight: 400; color: var(--dt-text-disable); }
      .t-canvas-area {
        background-color: #E8E8E8;
        background-image: linear-gradient(45deg, #D6D6D6 1px, transparent 1px), linear-gradient(-45deg, #D6D6D6 1px, transparent 1px);
        background-size: 20px 20px;
        border-radius: 4px;
        min-height: 300px;
        padding: 16px;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-content: flex-start;
      }

      .t-panel { width: 220px; flex-shrink: 0; border-left: 1px solid var(--dt-stroke-default); padding-left: 16px; }
      .t-panel-title { font-size: 12px; font-weight: 500; color: var(--dt-text-primary); margin-bottom: 10px; }
      .t-el-row {
        display: flex; align-items: center; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        padding: 6px 8px;
        border-radius: 3px;
        cursor: pointer;
      }
      .t-el-row:hover { background: var(--dt-surface-hover); }
      .t-el-row input { accent-color: var(--dt-brand-accent); cursor: pointer; }
      .t-el-row-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .t-panel-clear {
        display: flex; align-items: center; gap: 6px;
        margin-top: 10px;
        width: 100%;
        height: 32px;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        background: var(--dt-surface-primary);
        color: var(--dt-text-secondary);
        font-size: 12px; font-family: Roboto, sans-serif;
        cursor: pointer;
        justify-content: center;
      }
      .t-panel-clear:hover { background: #FAFAFA; }

      .t-note-top { margin-bottom: 16px; }
      .t-canvas-el {
        position: relative;
        border-radius: 4px;
        padding: 14px 18px;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 500;
        box-shadow: var(--dt-shadow-sl);
        cursor: pointer;
        user-select: none;
      }
      .t-canvas-el.selected { outline: 2px solid #162A69; outline-offset: 2px; }
      .t-el-check {
        position: absolute; top: -8px; right: -8px;
        width: 20px; height: 20px;
        background: #162A69;
        border-radius: 999px;
        display: flex; align-items: center; justify-content: center;
        color: #FFFFFF;
      }

      .t-note {
        margin: 14px 20px 20px;
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px; padding: 10px 12px;
      }
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
export class Task33CopyScreenComponent {
  pages: Q4Page[] = THEME_PAGES.map(p => ({ ...p, elements: p.elements.map(e => ({ ...e })) }));
  activePage: Q4Page = this.pages[0];

  clipboard: Q4Element[] = [];
  clipboardFrom = '';
  snack = '';

  crumbs = [
    { label: 'Экраны и звуки' },
    { label: 'Экран покупателя' },
    { label: 'Конструктор темы «Кофейня» — Копирование' },
  ];

  get selectedIds(): number[] {
    return this.activePage.elements.filter(e => e.selected).map(e => e.id);
  }

  toggleSelect(el: Q4Element): void {
    el.selected = !el.selected;
  }

  setSelected(el: Q4Element, checked: boolean): void {
    el.selected = checked;
  }

  clearSelection(): void {
    for (const e of this.activePage.elements) {
      e.selected = false;
    }
  }

  copySelected(): void {
    if (!this.activePage || !this.selectedIds.length) return;
    this.clipboard = (this.activePage.elements.filter(e => e.selected)).map(e => ({ ...e, selected: false }));
    this.clipboardFrom = this.activePage.id;
    this.snack = `Скопировано элементов: ${this.clipboard.length}`;
    setTimeout(() => (this.snack = ''), 2200);
  }

  paste(): void {
    if (!this.activePage || !this.clipboard.length || this.clipboardFrom === this.activePage.id) return;
    const existingNames = new Set(this.activePage.elements.map(e => e.name));
    for (const src of this.clipboard) {
      let name = src.name + ' (копия)';
      if (existingNames.has(name)) {
        name = src.name + ' (копия 2)';
      }
      existingNames.add(name);
      this.activePage.elements.push({
        id: this.maxId() + 1,
        name,
        type: src.type,
        color: src.color,
        tags: src.tags ? [...src.tags] : undefined,
      });
    }
    this.clipboard = [];
    this.clipboardFrom = '';
    this.snack = `Элементы вставлены на «${this.activePage.name}» с новыми именами`;
    setTimeout(() => (this.snack = ''), 2200);
  }

  copyPage(p: Q4Page, event: Event): void {
    event.stopPropagation();
    const name = p.name + ' (копия)';
    this.pages.push({
      id: 'p' + (this.pages.length + 1),
      name,
      custom: true,
      condition: p.condition,
      elements: p.elements.map(e => ({
        id: this.maxId() + 1,
        name: e.name,
        type: e.type,
        color: e.color,
        tags: e.tags ? [...e.tags] : undefined,
      })),
    });
    this.activePage = this.pages[this.pages.length - 1];
    this.snack = `Страница «${name}» создана со всем содержимым`;
    setTimeout(() => (this.snack = ''), 2200);
  }

  private maxId(): number {
    let max = 0;
    for (const p of this.pages) {
      for (const e of p.elements) {
        if (e.id > max) max = e.id;
      }
    }
    return max;
  }
}
