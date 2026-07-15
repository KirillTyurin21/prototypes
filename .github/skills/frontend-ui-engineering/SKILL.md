---
name: frontend-ui-engineering
description: Создание production-quality, доступных, отзывчивых интерфейсов на Angular 16 + Tailwind. Используется при создании/модификации UI-компонентов и страниц, реализации лейаутов, обеспечении WCAG AA-доступности. Адаптировано из addyosmani/agent-skills.
---

# Frontend UI Engineering — Angular 16 Edition

> Адаптировано из `addyosmani/agent-skills/skills/frontend-ui-engineering/SKILL.md`. React/Next.js-специфика заменена на Angular 16 standalone-компоненты. Добавлены привязки к нашей UI-библиотеке и дизайн-токенам.

---

## Обзор

Цель — UI, который выглядит как работа дизайн-осведомлённого инженера из топ-компании, а не как AI-генерация. Это означает: соблюдение дизайн-системы, accessibility, продуманные паттерны взаимодействия, отсутствие «AI aesthetic».

## Когда использовать

- Создание нового UI-компонента или страницы прототипа
- Модификация существующих интерфейсов
- Реализация responsive-лейаутов
- Добавление интерактивности или управления состоянием
- Исправление визуальных или UX-проблем

---

## Архитектура компонентов

### Структура файлов (Angular standalone)

```
src/app/prototypes/<slug>/
├── screens/
│   └── some-screen.component.ts    ← Компонент (standalone, inline template)
├── components/                     ← Локальные компоненты прототипа
│   └── some-widget.component.ts
├── data/
│   └── mock-data.ts               ← Мок-данные
└── types.ts                        ← Типы прототипа
```

### Паттерны компонентов

**Композиция, не конфигурация:**

```html
<!-- Хорошо: композиция -->
<ui-card>
  <ui-card-header>
    <ui-card-title>Задачи</ui-card-title>
  </ui-card-header>
  <ui-card-content>
    <app-task-list [tasks]="tasks"></app-task-list>
  </ui-card-content>
</ui-card>

<!-- Плохо: всё через @Input -->
<ui-card title="Задачи" [body]="taskListTemplate"></ui-card>
```

**Один компонент — одна задача:**

```typescript
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, UiCheckboxComponent, UiButtonComponent],
  template: `
    <div class="flex items-center gap-3 p-3">
      <ui-checkbox [checked]="task.done" (checkedChange)="onToggle.emit(task.id)"></ui-checkbox>
      <span [class.line-through]="task.done" [class.text-text-secondary]="task.done">
        {{ task.title }}
      </span>
      <ui-button variant="ghost" size="sm" (click)="onDelete.emit(task.id)">
        <lucide-icon name="trash-2" [size]="16"></lucide-icon>
      </ui-button>
    </div>
  `,
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() onToggle = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();
}
```

**Разделяй данные и представление:**

```typescript
// Контейнер: управляет данными
@Component({
  selector: 'app-task-list-container',
  standalone: true,
  imports: [CommonModule, UiSkeletonComponent, UiEmptyStateComponent, TaskListComponent],
  template: `
    <ui-skeleton *ngIf="isLoading"></ui-skeleton>
    <ui-empty-state *ngIf="!isLoading && tasks.length === 0"
      message="Нет задач"
      description="Создайте первую задачу">
    </ui-empty-state>
    <app-task-list *ngIf="!isLoading && tasks.length > 0" [tasks]="tasks"></app-task-list>
  `,
})
export class TaskListContainerComponent {
  tasks: Task[] = [];
  isLoading = true;
  // ... загрузка данных
}

// Представление: только рендеринг
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  template: `
    <ul class="divide-y divide-border" role="list">
      <li *ngFor="let task of tasks">
        <app-task-item [task]="task"></app-task-item>
      </li>
    </ul>
  `,
})
export class TaskListComponent {
  @Input() tasks!: Task[];
}
```

---

## Управление состоянием (Angular)

**Выбирай простейший подход:**

| Уровень | Инструмент |
|---|---|
| Локальное состояние | Свойства компонента |
| Shared (2-3 соседних компонента) | `@Input` / `@Output` |
| Глобальное (сессии, тема) | `SessionService`, `StorageService` (`@/shared/...`) |
| Данные прототипа | `StorageService` → localStorage |
| Маршрутизация | `Router` + queryParams |

**Правило:** не пробрасывай `@Input` глубже 3 уровней. Если передаёшь через компоненты, которые не используют данные — внедри сервис.

---

## Дизайн-система: избегай AI Aesthetic

### Признаки AI-сгенерированного UI (избегать)

| AI-штамп | Почему плохо | Что делать |
|---|---|---|
| Фиолетовый/indigo везде | Модели default'ят на «безопасные» палитры → все приложения выглядят одинаково | Используй ТОЛЬКО цвета из tailwind.config.js: `app-primary`, `app-accent`, `surface`, `border`, `text` |
| Избыточные градиенты | Визуальный шум, конфликт с дизайн-системой | Flat или тонкие градиенты ТОЛЬКО если заданы дизайн-системой |
| `rounded-2xl` на всём | Игнорирует иерархию скруглений | Консистентный border-radius: `rounded`, `rounded-md`, `rounded-lg` |
| Герои-секции из шаблона | Нет связи с контентом | Content-first: герой отражает конкретный контент |
| Lorem ipsum | Скрывает проблемы с длиной/переносом реального текста | Реалистичные placeholder-данные |
| Огромные отступы везде | Уничтожает визуальную иерархию | Консистентная шкала: `p-2` (8px) → `p-4` (16px) → `p-6` (24px) → `p-8` (32px) |
| Одинаковые сетки карточек | Shortcut, игнорирует приоритет информации | Purpose-driven layout: размер карточки отражает важность |
| Много теней | Глубина конкурирует с контентом, замедляет рендеринг | Только `shadow-card`, `shadow-card-hover` из DS |

### Spacing и лейаут

```html
<!-- Используй консистентную шкалу (Tailwind: 0.25rem = 1 единица) -->
<!-- Хорошо -->
<div class="p-4">   <!-- 16px -->
<div class="gap-3">  <!-- 12px -->

<!-- Плохо -->
<div style="padding: 13px">    <!-- Не из шкалы -->
<div style="margin-top: 2.3rem">  <!-- Не из шкалы -->
```

### Типографика

Соблюдай иерархию заголовков, не пропускай уровни:

```
h1 → Заголовок страницы (один на страницу)
h2 → Заголовок секции
h3 → Заголовок подсекции
body → Основной текст (Tailwind: text-base, Roboto)
small → Вторичный/вспомогательный текст (Tailwind: text-sm, text-text-secondary)
```

### Цвет — семантические токены

```html
<!-- Хорошо: семантические токены -->
<p class="text-text-primary">Основной текст</p>
<p class="text-text-secondary">Вторичный текст</p>
<div class="bg-surface border border-border">...</div>

<!-- Плохо: сырые hex -->
<p style="color: #212121">...</p>
```

Минимальный контраст: **4.5:1** для обычного текста, **3:1** для крупного. Не передавай информацию только цветом (добавляй иконку, текст, паттерн).

---

## Accessibility (WCAG 2.1 AA)

### Клавиатурная навигация

```html
<!-- Каждый интерактивный элемент должен быть доступен с клавиатуры -->
<!-- Хорошо: нативный button -->
<ui-button (click)="handleClick()">Нажать</ui-button>

<!-- Плохо: div с (click) без tabindex/role -->
<div (click)="handleClick()">Нажать</div>
```

### ARIA-метки

```html
<!-- Подписывай интерактивные элементы без видимого текста -->
<ui-button iconName="x" ariaLabel="Закрыть диалог"></ui-button>

<!-- Всегда связывай label с input -->
<ui-input label="Email" [(value)]="email"></ui-input>

<!-- Или aria-label если нет видимой метки -->
<ui-input ariaLabel="Поиск задач" [(value)]="searchQuery"></ui-input>
```

### Управление фокусом

```typescript
// Перемещай фокус при изменении контента
// В Angular: используй ViewChild + ElementRef
@ViewChild('closeBtn') closeBtn!: ElementRef;

openDialog() {
  this.dialogOpen = true;
  // После рендеринга:
  setTimeout(() => this.closeBtn.nativeElement.focus(), 0);
}
```

### Осмысленные состояния (Empty, Error, Loading)

```html
<!-- НЕ показывай пустой экран -->
<!-- ВСЕГДА обрабатывай: loading, empty, error -->

<!-- Loading -->
<ui-skeleton *ngIf="isLoading"></ui-skeleton>

<!-- Empty -->
<ui-empty-state *ngIf="!isLoading && items.length === 0"
  iconName="inbox"
  message="Нет данных"
  description="Создайте первую запись">
</ui-empty-state>

<!-- Error -->
<ui-alert *ngIf="error" variant="danger" [dismissible]="true">
  {{ error }}
</ui-alert>

<!-- Content -->
<ng-container *ngIf="!isLoading && !error && items.length > 0">
  <!-- ... -->
</ng-container>
```

---

## Responsive Design

**Mobile-first** — дизайн для мобильных, затем расширение:

```html
<!-- Tailwind: mobile-first responsive -->
<div class="
  grid grid-cols-1       <!-- Мобильные: одна колонка -->
  sm:grid-cols-2          <!-- ≥640px: 2 колонки -->
  lg:grid-cols-3          <!-- ≥1024px: 3 колонки -->
  gap-4
">
```

Контрольные точки для тестирования: **320px**, **768px**, **1024px**, **1440px**.

```html
<!-- Карточки: mobile — на всю ширину, desktop — max-w-3xl -->
<div class="max-w-3xl mx-auto">
  <ui-card>...</ui-card>
</div>

<!-- Таблицы: mobile — горизонтальный скролл -->
<div class="overflow-x-auto">
  <ui-table [columns]="columns" [items]="items"></ui-table>
</div>
```

---

## Загрузка и переходы

```html
<!-- Скелетоны (НЕ спиннеры) для загрузки контента -->
<div *ngIf="isLoading" class="space-y-3" role="status" aria-label="Загрузка">
  <div class="h-12 bg-surface-tertiary animate-pulse rounded" *ngFor="let _ of [].constructor(3)"></div>
</div>

<!-- Анимации появления — через наши классы -->
<div class="animate-fade-in">...</div>
<div class="animate-slide-up">...</div>
```

---

## Anti-Rationalization Table (ЧЕГО НЕ говорить)

| Отмазка | Реальность |
|---|---|
| «Accessibility — потом» | Это требование закона и стандарт качества. Сразу. |
| «Responsive адаптируем позже» | Переделывать в 3 раза дороже, чем сделать сразу. |
| «Дизайн не финальный, пропущу стилизацию» | Используй дефолты DS. Нестилизованный UI — сломанное первое впечатление. |
| «Это всего лишь прототип» | Прототипы становятся продакшен-кодом. Строй фундамент правильно. |
| «AI-стиль норм для начала» | Это сигнал низкого качества. Используй DS проекта с первого коммита. |

---

## Red Flags (Признаки проблемы)

- Компонент > 200 строк → разбей
- Инлайн-стили или произвольные px-значения
- Отсутствуют: loading state, empty state, error state
- Не проверена клавиатурная навигация
- Цвет как единственный индикатор состояния (красный/зелёный без текста/иконки)
- «AI look»: фиолетовые градиенты, огромные карточки, шаблонные лейауты

---

## Pre-Flight Check (перед сдачей)

- [ ] Компонент рендерится без ошибок в консоли
- [ ] Все интерактивные элементы доступны с клавиатуры (Tab)
- [ ] Контент читается скринридером
- [ ] Responsive: работает на 320px, 768px, 1024px, 1440px
- [ ] Loading, error, empty states — все обработаны
- [ ] Соблюдена дизайн-система (spacing, цвета, типографика)
- [ ] Нет инлайн-стилей, все стили через Tailwind-классы
- [ ] `standalone: true` — компонент standalone
- [ ] Импорты из `@/components/ui`, `@/shared/...` или `@angular/...`
- [ ] Используются `*ngIf`/`*ngFor` (НЕ `@if`/`@for`)

---

## Ссылки

- Источник: [addyosmani/agent-skills/frontend-ui-engineering](https://github.com/addyosmani/agent-skills)
- Наш стек: Angular 16 + Tailwind CSS + собственные UI-компоненты
- Справочник UI-компонентов: `files/UI_API_REFERENCE.md`
- Дизайн-токены: `tailwind.config.js`
- Чек-лист accessibility: WCAG 2.1 AA (см. Verification выше)
