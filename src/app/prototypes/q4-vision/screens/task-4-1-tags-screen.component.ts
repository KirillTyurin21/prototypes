import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@/shared/icons.module';
import { Q4CrumbsComponent } from '../components/q4-crumbs.component';
import { Q4Element } from '../types';

@Component({
  selector: 'app-task-4-1-tags-screen',
  standalone: true,
  imports: [CommonModule, IconsModule, Q4CrumbsComponent],
  template: `
    <div class="t-container">
      <app-q4-crumbs [items]="crumbs"></app-q4-crumbs>

      <div class="t-note t-note-top">
        <lucide-icon name="info" [size]="15"></lucide-icon>
        <span>
          Целевое решение 4.1 (DS-1287): поле «Теги» в настройках каждого элемента во всех продуктах — несколько тегов, свободный ввод.
          Модель киоска — референс для унификации. Основа для группового управления свойствами — цветовых схем (раздел 4.2).
        </span>
      </div>

      <div class="t-card">
        <div class="t-card-head">
          <span class="t-crumb">Конструктор темы «Кофейня» /</span>
          <span class="t-card-title">Настройки элемента</span>
        </div>

        <div class="t-editor">
          <!-- Канвас -->
          <div class="t-canvas">
            <div class="t-canvas-caption">Канвас — выберите элемент</div>
            <div class="t-canvas-area">
              <div
                class="t-canvas-el"
                *ngFor="let el of elements"
                [class.selected]="el.id === selected.id"
                [style.background]="el.color"
                (click)="selected = el"
              >
                <div>{{ el.name }}</div>
                <div class="t-el-tags" *ngIf="el.tags?.length">
                  <span class="t-el-tag" *ngFor="let t of el.tags">#{{ t }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Панель настроек -->
          <div class="t-inspector">
            <div class="t-inspector-title">Элемент: {{ selected.name }}</div>
            <div class="t-inspector-row">
              <span class="t-inspector-label">Тип</span>
              <span class="t-inspector-value">{{ selected.type === 'image' ? 'Изображение' : 'Текст' }}</span>
            </div>
            <div class="t-inspector-row">
              <span class="t-inspector-label">Теги</span>
              <span class="t-inspector-value">{{ (selected.tags || []).length || '—' }}</span>
            </div>
            <div class="t-tags">
              <span class="t-tag" *ngFor="let t of selected.tags || []; let i = index">
                #{{ t }}
                <button class="t-tag-x" (click)="removeTag(i)" aria-label="Удалить тег">
                  <lucide-icon name="x" [size]="12"></lucide-icon>
                </button>
              </span>
              <input
                class="t-tag-input"
                type="text"
                placeholder="Добавить тег и Enter"
                #tagInput
                (keydown.enter)="addTag(tagInput.value); tagInput.value = ''"
              />
            </div>
            <div class="t-inspector-hint">Свободный ввод. Киоск-модель — референс для унификации.</div>
          </div>
        </div>

        <div class="t-note">
          <lucide-icon name="info" [size]="15"></lucide-icon>
          Теги нужны не сами по себе: в Q4 их потребитель — единый инструмент цветовых схем (следующий раздел 4.2). Открытый вопрос: справочник тегов или свободный ввод.
        </div>
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
      .t-el-tags { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
      .t-el-tag { font-size: 10px; background: rgba(255, 255, 255, 0.25); border-radius: 3px; padding: 1px 5px; }

      .t-inspector {
        width: 300px;
        flex-shrink: 0;
        border: 1px solid var(--dt-stroke-default);
        border-radius: 4px;
        padding: 14px;
        height: fit-content;
      }
      .t-inspector-title { font-size: 13px; font-weight: 500; color: var(--dt-text-primary); margin-bottom: 12px; }
      .t-inspector-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
      .t-inspector-label { color: var(--dt-text-secondary); }
      .t-inspector-value { color: var(--dt-text-primary); }
      .t-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
      .t-tag {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 12px;
        color: var(--dt-brand-accent-dark);
        background: var(--dt-brand-accent-lighter);
        border-radius: 999px;
        padding: 3px 6px 3px 10px;
      }
      .t-tag-x {
        display: flex; align-items: center; justify-content: center;
        width: 16px; height: 16px;
        border: none; background: transparent; border-radius: 999px;
        color: var(--dt-brand-accent-dark);
        cursor: pointer;
      }
      .t-tag-x:hover { background: rgba(68, 138, 255, 0.2); }
      .t-tag-input {
        flex: 1; min-width: 120px;
        border: none; outline: none;
        font-size: 12px;
        font-family: Roboto, sans-serif;
        color: var(--dt-text-primary);
        background: transparent;
        padding: 4px 2px;
      }
      .t-inspector-hint { font-size: 11px; color: var(--dt-text-disable); margin-top: 10px; }

      .t-note {
        margin: 14px 20px 20px;
        display: flex; align-items: flex-start; gap: 8px;
        font-size: 12px; color: var(--dt-text-secondary);
        background: var(--dt-brand-accent-lightest);
        border-radius: 4px; padding: 10px 12px;
      }
      .t-note-top { margin: 0 0 16px; }
    `,
  ],
})
export class Task41TagsScreenComponent {
  elements: Q4Element[] = [
    { id: 1, name: 'Баннер «Акция»', type: 'image', color: '#448AFF', tags: ['акция'] },
    { id: 2, name: 'Кнопка «Купить»', type: 'image', color: '#FFAB40', tags: ['акция', 'кнопка'] },
    { id: 3, name: 'Текст «Добро пожаловать!»', type: 'text', color: '#616161', tags: [] },
  ];
  selected: Q4Element = this.elements[0];

  crumbs = [
    { label: 'Экраны и звуки' },
    { label: 'Экран покупателя' },
    { label: 'Конструктор темы «Кофейня» — Настройки элемента' },
  ];

  addTag(value: string): void {
    const v = (value || '').trim().toLowerCase();
    if (!v || !this.selected) return;
    if (!this.selected.tags) this.selected.tags = [];
    if (!this.selected.tags.includes(v)) {
      this.selected.tags.push(v);
    }
  }

  removeTag(index: number): void {
    if (!this.selected.tags) return;
    this.selected.tags.splice(index, 1);
  }
}
