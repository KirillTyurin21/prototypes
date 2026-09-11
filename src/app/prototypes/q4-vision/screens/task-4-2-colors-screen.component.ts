import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import { COLOR_PATTERNS } from '../data/mock-data';
import { Q4ColorPattern, Q4Element } from '../types';

@Component({
  selector: 'app-task-4-2-colors-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="t-container">
      <app-q4-crumbs [items]="crumbs"></app-q4-crumbs>

      <div class="t-note t-note-top">
        <lucide-icon name="info" [size]="15"></lucide-icon>
        <span>
          Целевое решение 4.2: кнопка «Цветовые схемы» в панели темы — переключение паттернов (пресеты + свои).
          Паттерн применяется к элементам по тегу (основа — 4.1), предпросмотр до сохранения. Киоск и Customer Screen первыми, Arrivals — по готовности.
        </span>
      </div>

      <div class="t-card">
        <div class="t-card-head">
          <span class="t-crumb">Конструктор темы /</span>
          <span class="t-card-title">Панель темы</span>
          <span class="t-save-badge" [class.dirty]="dirty">
            <lucide-icon [name]="dirty ? 'alert-circle' : 'check-circle'" [size]="14"></lucide-icon>
            {{ dirty ? 'не сохранено' : 'сохранено' }}
          </span>
        </div>

        <!-- Кнопка цветовых схем -->
        <div class="t-toolbar">
          <button class="t-btn t-btn-primary" (click)="panelOpen = !panelOpen" [class.t-btn-active]="panelOpen">
            <lucide-icon name="palette" [size]="16"></lucide-icon>
            Цветовые схемы
          </button>
          <button class="t-btn" [disabled]="!dirty" (click)="save()">
            <lucide-icon name="save" [size]="15"></lucide-icon>
            Сохранить тему
          </button>
        </div>

        <!-- Панель паттернов -->
        <div class="t-patterns" *ngIf="panelOpen">
          <button
            class="t-pattern"
            *ngFor="let pat of patterns"
            [class.selected]="activePattern.id === pat.id"
            (click)="applyPattern(pat)"
          >
            <div class="t-pattern-circles">
              <span class="t-pattern-dot" *ngFor="let c of pat.colors" [style.background]="c"></span>
            </div>
            <span class="t-pattern-name">{{ pat.name }}</span>
            <span class="t-pattern-badge" *ngIf="pat.preset">пресет</span>
            <span class="t-pattern-badge t-pattern-own" *ngIf="!pat.preset">своя</span>
          </button>
        </div>

        <div class="t-editor">
          <!-- Канвас -->
          <div class="t-canvas">
            <div class="t-canvas-caption">
              Канвас — элементы с тегами меняют цвет сразу (предпросмотр)
            </div>
            <div class="t-canvas-area">
              <div
                class="t-canvas-el"
                *ngFor="let el of elements"
                [class.light]="isLight(el.color)"
                [style.background]="el.color"
              >
                <div>{{ el.name }}</div>
                <div class="t-el-tags" *ngIf="el.tags?.length">
                  <span class="t-el-tag" *ngFor="let t of el.tags">#{{ t }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Легенда -->
          <div class="t-inspector">
            <div class="t-inspector-title">Как работает паттерн</div>
            <div class="t-rule">
              <span class="t-rule-dot" [style.background]="activePattern.colors[0]"></span>
              тег «акция»
            </div>
            <div class="t-rule">
              <span class="t-rule-dot" [style.background]="activePattern.colors[1]"></span>
              тег «баннер»
            </div>
            <div class="t-rule">
              <span class="t-rule-dot" [style.background]="activePattern.colors[2]"></span>
              тег «фон»
            </div>
            <div class="t-inspector-hint">
              Элементы без тегов не меняются. Паттерны хранятся на уровне темы.
            </div>
          </div>
        </div>

        <div class="t-note">
          <lucide-icon name="info" [size]="15"></lucide-icon>
          Стартовые пресеты + пользовательские схемы. Продукты: киоск и Customer Screen первыми, Arrivals — по готовности.
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
      .t-card-head { display: flex; align-items: center; gap: 6px; padding: 14px 20px 0; flex-wrap: wrap; }
      .t-crumb { font-size: 12px; color: var(--dt-text-disable); }
      .t-card-title { font-size: 16px; font-weight: 500; color: var(--dt-text-primary); }
      .t-save-badge {
        margin-left: auto;
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 11px;
        color: #14B456;
        background: #EBFBF2;
        border-radius: 999px;
        padding: 3px 10px;
      }
      .t-save-badge.dirty { color: #EA7806; background: #FFF9F0; }

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
      .t-btn-active { box-shadow: inset 0 0 0 2px #162A69; }
      .t-btn:disabled { background: #EBEBEB; color: #9E9E9E; border-color: #EBEBEB; cursor: default; }

      .t-patterns {
        display: flex;
        gap: 10px;
        padding: 12px 20px 0;
        flex-wrap: wrap;
      }
      .t-pattern {
        display: flex; align-items: center; gap: 8px;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        background: var(--dt-surface-primary);
        padding: 8px 12px;
        cursor: pointer;
        font-family: Roboto, sans-serif;
      }
      .t-pattern:hover { background: var(--dt-surface-hover); }
      .t-pattern.selected { border-color: var(--dt-brand-accent); background: var(--dt-brand-accent-lighter); }
      .t-pattern-circles { display: flex; gap: 3px; }
      .t-pattern-dot { width: 16px; height: 16px; border-radius: 999px; border: 1px solid rgba(0, 0, 0, 0.12); }
      .t-pattern-name { font-size: 13px; color: var(--dt-text-primary); }
      .t-pattern-badge { font-size: 10px; color: var(--dt-brand-accent-dark); background: var(--dt-brand-accent-lighter); border-radius: 3px; padding: 1px 6px; }
      .t-pattern-own { color: var(--dt-brand-positive-dark); background: var(--dt-brand-positive-lighter); }

      .t-editor { display: flex; gap: 16px; padding: 14px 20px 0; }
      .t-canvas { flex: 1; min-width: 0; }
      .t-canvas-caption { font-size: 11px; color: var(--dt-text-secondary); margin-bottom: 8px; }
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
      .t-canvas-el {
        border-radius: 4px;
        padding: 14px 18px;
        color: #FFFFFF;
        font-size: 12px;
        font-weight: 500;
        box-shadow: var(--dt-shadow-sl);
        transition: background 0.3s ease-in-out;
      }
      .t-canvas-el.light { color: #424242; }
      .t-canvas-el.light .t-el-tag { background: rgba(0, 0, 0, 0.08); }
      .t-el-tags { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
      .t-el-tag { font-size: 10px; background: rgba(255, 255, 255, 0.25); border-radius: 3px; padding: 1px 5px; }

      .t-inspector {
        width: 260px;
        flex-shrink: 0;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 14px;
        height: fit-content;
      }
      .t-inspector-title { font-size: 13px; font-weight: 500; color: var(--dt-text-primary); margin-bottom: 12px; }
      .t-rule { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--dt-text-primary); padding: 5px 0; }
      .t-rule-dot { width: 14px; height: 14px; border-radius: 999px; border: 1px solid rgba(0, 0, 0, 0.12); }
      .t-inspector-hint { font-size: 11px; color: var(--dt-text-disable); margin-top: 10px; line-height: 1.5; }

      .t-note {
        margin: 14px 20px 20px;
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px; padding: 10px 12px;
      }
      .t-note-top { margin: 0 0 16px; }
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
export class Task42ColorsScreenComponent {
  patterns: Q4ColorPattern[] = COLOR_PATTERNS;
  activePattern: Q4ColorPattern = COLOR_PATTERNS[0];
  panelOpen = true;
  dirty = false;
  snack = '';

  crumbs = [
    { label: 'Экраны и звуки' },
    { label: 'Экран покупателя' },
    { label: 'Конструктор темы — Цветовые схемы' },
  ];

  elements: Q4Element[] = [
    { id: 1, name: 'Баннер «Акция»', type: 'image', color: '#448AFF', tags: ['акция'] },
    { id: 2, name: 'Кнопка «Купить»', type: 'image', color: '#448AFF', tags: ['акция'] },
    { id: 3, name: 'Заголовок «Новинки»', type: 'text', color: '#FFAB40', tags: ['баннер'] },
    { id: 4, name: 'Фон страницы', type: 'image', color: '#FFFFFF', tags: ['фон'] },
    { id: 5, name: 'Текст «Добро пожаловать!»', type: 'text', color: '#616161', tags: [] },
  ];

  applyPattern(pat: Q4ColorPattern): void {
    this.activePattern = pat;
    for (const el of this.elements) {
      const tag = el.tags?.[0];
      if (tag === 'акция') el.color = pat.colors[0];
      else if (tag === 'баннер') el.color = pat.colors[1];
      else if (tag === 'фон') el.color = pat.colors[2];
    }
    this.dirty = true;
  }

  isLight(hex: string): boolean {
    const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return false;
    const r = parseInt(m[1].slice(0, 2), 16);
    const g = parseInt(m[1].slice(2, 4), 16);
    const b = parseInt(m[1].slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 180;
  }

  save(): void {
    this.dirty = false;
    this.snack = `Тема сохранена — выбран паттерн «${this.activePattern.name}»`;
    setTimeout(() => (this.snack = ''), 2200);
  }
}
