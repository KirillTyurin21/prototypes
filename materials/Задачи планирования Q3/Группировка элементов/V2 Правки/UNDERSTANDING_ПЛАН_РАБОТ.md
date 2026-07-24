# UNDERSTANDING: План работ по группировке элементов

**Дата:** 2026-07-24
**Источник:** `DS-Группировка-элементов-спецификация.md` (V2 Правки)
**Статус:** ✅ ПРОВАЛИДИРОВАН — план корректен, можно начинать

---

## 0. Эталонный стиль оформления (Reference Design)

> **Источник:** `arrivals-theme-editor-screen.component.ts` — единственный редактор, где панель "Добавить элемент" уже реализована в виде аккордеона с категориями. Этот дизайн одобрен руководством и должен быть **сохранён и воспроизведён** во всех остальных редакторах.

### 0.1. Структура панели "Добавить элемент"

```
┌─────────────────────────────────┐
│ Добавить элемент            [✕] │  ← add-element-header
├─────────────────────────────────┤
│ 🔍 Поиск элементов...      [✕] │  ← search-elements
├─────────────────────────────────┤
│ 🟦 Стандартные          (3)  ▼ │  ← category-header (первая раскрыта)
│   ├─ 🔤 Текст                  │  ← element-item (отступ 34px)
│   ├─ 🖼️ Изображение            │
│   └─ ⬜ Прямоугольник           │
├─────────────────────────────────┤
│ 🟦 Контейнеры           (1)  ▶ │  ← category-header (свёрнута)
├─────────────────────────────────┤
│ 🟦 Медиа                (1)  ▶ │
├─────────────────────────────────┤
│ 🟦 Информационные       (1)  ▶ │
└─────────────────────────────────┘
```

### 0.2. Ключевые CSS-классы и токены

| Элемент | Класс | Ключевые стили |
|---------|-------|---------------|
| Заголовок панели | `.add-element-header` | flex, space-between, margin-bottom: 16px |
| Текст заголовка | `.add-element-title` | 18px, weight 500, color #333 |
| Кнопка закрытия | `.icon-btn-sm` | 28×28px, radius 4px, hover bg #f0f0f0 |
| Поле поиска | `.search-elements` | position: relative, margin-bottom: 12px |
| Input поиска | `.search-elements-input` | height 34px, padding 0 36px, 13px, border #e0e0e0, focus #448aff |
| Иконка поиска | `.search-elements-icon` | absolute left 10px, top 9px, color #9e9e9e |
| Кнопка очистки | `.search-elements-clear` | absolute right 6px, 22×22px circle, hover bg #f0f0f0 |
| Пустой результат | `.search-empty` | padding 24px 0, text-align center, 13px, color #bdbdbd |
| Контейнер категорий | `.element-categories` | flex column |
| Группа категории | `.category-group` | border-bottom: 1px solid #f0f0f0 |
| Заголовок категории | `.category-header` | flex, gap 8px, padding 10px 8px, cursor pointer, hover bg #f5f5f5 |
| Иконка категории | `.category-icon` | 18px, color #757575, flex-shrink 0 |
| Название категории | `.category-label` | flex 1, 14px, weight 500, color #333 |
| Счётчик | `.category-count` | 12px, color #9e9e9e, bg #f0f0f0, radius 10px, min-width 20px, height 20px, pill |
| Шеврон | `.category-chevron` | 16px, color #9e9e9e, transition transform 0.2s |
| Список элементов | `.category-elements` | flex column, padding 0 0 4px 0, **animation accordionIn 0.15s ease-out** |
| Элемент | `.element-item` | flex, gap 8px, **padding 8px 8px 8px 34px** (отступ слева!), 13px, color #555 |
| Иконка элемента | `.element-icon` | 16px, color #9e9e9e, flex-shrink 0 |
| Hover элемента | `.element-item:hover` | bg #e3f2fd, color #1976d2; .element-icon → color #1976d2 |

### 0.3. Анимация раскрытия категории

```css
.category-elements {
  animation: accordionIn 0.15s ease-out;
}
@keyframes accordionIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 0.4. Логика поиска (из `.ts`)

```typescript
// Поиск без учёта регистра, фильтрует элементы внутри категорий.
// Категории без совпадений — скрываются.
get filteredCategories(): ElementCategory[] {
  const q = this.searchElementsQuery.trim().toLowerCase();
  if (!q) return this.themeCategories;
  return this.themeCategories
    .map(cat => ({
      ...cat,
      elements: cat.elements.filter(el => el.label.toLowerCase().includes(q)),
    }))
    .filter(cat => cat.elements.length > 0);
}
```

### 0.5. Правило: этот стиль — закон

> **Все новые редакторы и все доработки существующих должны использовать ТОЧНО ТАКОЙ ЖЕ набор CSS-классов и структуру DOM.** Никаких новых классов, никаких альтернативных подходов. Единственный источник истины — `arrivals-theme-editor-screen.component.ts`.

---

## 1. Моё понимание задачи

### Что нужно сделать (глобально)

В редакторах тем и контролов продуктов Digital Signage панель "Добавить элемент" реорганизуется из плоского списка в **аккордеон с семантическими категориями, иконками и поиском**.

### Архитектурное решение (DRY)

> **Вместо копирования кода в 6 редакторов — создаём ОДИН переиспользуемый компонент `ElementPaletteComponent` и вставляем его везде.**

```
До (плохо):                          После (хорошо):
┌──────────────────────┐             ┌──────────────────────┐
│ Arrivals Theme Editor│             │ ElementPaletteComponent│  ← ЕДИНЫЙ компонент
│  ┌────────────────┐  │             │  • поиск              │
│  │ Аккордеон #1   │  │             │  • категории          │
│  │ (200 строк)    │  │             │  • collapse/expand     │
│  └────────────────┘  │             │  • анимации           │
├──────────────────────┤             │  • empty state         │
│ Arrivals Ctrl Editor │             │  • resize handle       │
│  ┌────────────────┐  │             └──────────┬───────────┘
│  │ Плоский список │  │                        │
│  └────────────────┘  │        ┌───────────────┼───────────────┐
├──────────────────────┤        │               │               │
│ MenuBoard Theme Edit.│    Arrivals       Arrivals       MenuBoard
│  ┌────────────────┐  │    Theme Ed.      Ctrl Ed.      Theme Ed.
│  │ Аккордеон #2   │  │        │               │               │
│  │ (200 строк)    │  │        │               │               │
│  └────────────────┘  │      ... и ещё 3 редактора ...
├──────────────────────┤
│ ...ещё 3 редактора...│
└──────────────────────┘
```

**API компонента:**

```typescript
@Component({
  selector: 'app-element-palette',
  standalone: true,
  // ...
})
export class ElementPaletteComponent {
  /** Категории с элементами (конфигурация под каждый редактор) */
  @Input() categories: ElementCategory[] = [];
  /** Заголовок панели */
  @Input() title: string = 'Добавить элемент';
  /** Ширина панели (по умолчанию 320px) */
  @Input() panelWidth: number = 320;

  /** Событие: выбран элемент (type — строковый идентификатор) */
  @Output() elementSelected = new EventEmitter<string>();
  /** Событие: закрытие панели */
  @Output() closed = new EventEmitter<void>();
}
```

**Использование в любом редакторе — 3 строки:**

```html
<app-element-palette
  [categories]="themeCategories"
  (elementSelected)="addElement($event)"
  (closed)="panelView = 'theme'">
</app-element-palette>
```

### Две части работ (пересмотрено)

| Часть | Что делаем | Ключевой артефакт |
|-------|-----------|-------------------|
| **Часть 1** | Создать `ElementPaletteComponent` + недостающие редакторы (Kiosk, доработка CS) | 1 компонент + 2-3 редактора |
| **Часть 2** | Подключить `ElementPaletteComponent` во ВСЕ редакторы, передав правильные конфигурации категорий | 8 файлов конфигураций + замена inline-кода на `<app-element-palette>` |

---

## 2. Анализ текущего состояния

### 2.1. Что УЖЕ реализовано в каждом редакторе

| # | Продукт | Редактор | Экран | Панель "Добавить" | Статус |
|:-:|---------|----------|-------|-------------------|:------:|
| 1 | Arrivals | Темы | `arrivals-theme-editor-screen` | Аккордеон (inline, ~120 строк) | 🟡 Заменить на `<app-element-palette>` |
| 2 | Arrivals | Контролы | `arrivals-control-editor-screen` | Плоский список `.element-type-list` | 🔴 Заменить на `<app-element-palette>` |
| 3 | MenuBoard | Темы | `menuboard-theme-editor-screen` | Аккордеон (inline, копия #1) | 🟡 Заменить на `<app-element-palette>` |
| 4 | MenuBoard | Контролы | Тот же компонент, что #2 | = #2 | 🟡 Автоматически |
| 5 | Customer Screen | Темы | `theme-editor-screen` | **Dropdown** (`element-tree-panel`) | 🔴 Заменить на `<app-element-palette>` |
| 6 | Customer Screen | Контролы (Стандартный) | `control-edit-drawer` | **Dropdown** в drawer | 🔴 Заменить на `<app-element-palette>` |
| 7 | Customer Screen | Контролы (Подсказка) | `control-edit-drawer` | **Dropdown** в drawer | 🔴 Заменить на `<app-element-palette>` |
| 8 | Киоск | Темы | **НЕ СУЩЕСТВУЕТ** | — | 🔴 Создать редактор + `<app-element-palette>` |

### 2.2. Ключевой вывод

> **Панель "Добавить элемент" реализована 4 разными способами в разных редакторах.** Аккордеон из Arrivals Theme Editor — эталонный. Его нужно вынести в `ElementPaletteComponent` и заменить все остальные реализации.

---

## 3. План работ (архитектурный)

### Этап 1: Создать переиспользуемый `ElementPaletteComponent`

**Файл:** `src/app/prototypes/web-screens/components/element-palette/element-palette.component.ts`

**Что внутри:**
- Заголовок + кнопка закрытия
- Поле поиска с иконкой и очисткой
- Аккордеон категорий (collapse/expand с анимацией `accordionIn`)
- Каждая категория: иконка + название + счётчик (pill) + шеврон
- Элементы внутри: иконка + название, отступ 34px
- Hover-эффекты (bg #e3f2fd, color #1976d2)
- Empty state ("Ничего не найдено")
- **Resize handle** на левой границе (перетаскивание → меняет ширину панели, min 300px)
- Все стили — ТОЧНО как в `arrivals-theme-editor-screen.component.ts` (раздел 0)

**Это замена ~120 строк inline-HTML/CSS в каждом редакторе на 3 строки использования.**

### Этап 2: Создать конфигурации категорий (данные)

**Файлы в `data/`:**

| # | Файл | Экспорт | Для редактора | Кат. | Эл. |
|:-:|------|---------|--------------|:----:|:---:|
| 1 | `arrivals-theme-categories.data.ts` | `ARRIVALS_THEME_CATEGORIES` | Arrivals Themes | 4 | 8 |
| 2 | `arrivals-control-categories.data.ts` | `ARRIVALS_CONTROL_CATEGORIES` | Arrivals Controls + MB Controls | 7 | 28 |
| 3 | `cs-theme-categories.data.ts` | `CS_THEME_CATEGORIES` | CS Themes | 7 | 31 |
| 4 | `cs-control-standard-categories.data.ts` | `CS_CONTROL_STANDARD_CATEGORIES` | CS Controls (Standard) | 3 | 15 |
| 5 | `cs-control-hints-categories.data.ts` | `CS_CONTROL_HINTS_CATEGORIES` | CS Controls (Hints) | 3 | 10 |
| 6 | `menuboard-theme-categories.data.ts` | `MENUBOARD_THEME_CATEGORIES` (обновить) | MB Themes | 4 | 7 |
| 7 | `kiosk-theme-categories.data.ts` | `KIOSK_THEME_CATEGORIES` | Kiosk Themes | 4 | 11 |

> **Примечание:** `menuboard-control-categories.data.ts` НЕ нужен — MenuBoard Controls ссылается на `ARRIVALS_CONTROL_CATEGORIES`.

### Этап 3: Создать недостающие редакторы

| # | Что | Файл |
|:-:|------|------|
| 1 | **Kiosk Themes List** | `screens/kiosk-themes-screen.component.ts` — список тем (аналог `themes-arrivals-screen`) |
| 2 | **Kiosk Theme Editor** | `screens/kiosk-theme-editor-screen.component.ts` — canvas + `<app-element-palette>` |

### Этап 4: Подключить `ElementPaletteComponent` во ВСЕ редакторы

Для каждого редактора:
1. Удалить inline-код панели (аккордеон / плоский список / dropdown)
2. Добавить `<app-element-palette [categories]="..." (elementSelected)="addElement($event)" (closed)="...">`
3. Подключить правильную конфигурацию категорий

| # | Редактор | Конфигурация | Что удалить |
|:-:|----------|-------------|------------|
| 1 | Arrivals Theme Editor | `ARRIVALS_THEME_CATEGORIES` (V2) | inline-аккордеон (~120 строк HTML) |
| 2 | Arrivals Control Editor | `ARRIVALS_CONTROL_CATEGORIES` | `.element-type-list` (~20 строк HTML) |
| 3 | MenuBoard Theme Editor | `MENUBOARD_THEME_CATEGORIES` (V2) | inline-аккордеон (~100 строк HTML) |
| 4 | CS Theme Editor | `CS_THEME_CATEGORIES` | `element-tree-panel` dropdown |
| 5 | CS Control Editor (Standard) | `CS_CONTROL_STANDARD_CATEGORIES` | dropdown в drawer |
| 6 | CS Control Editor (Hints) | `CS_CONTROL_HINTS_CATEGORIES` | dropdown в drawer |
| 7 | Kiosk Theme Editor | `KIOSK_THEME_CATEGORIES` | — (новый, сразу с палитрой) |

### Этап 5: Добавить маршруты и регистрацию

1. `web-screens.routes.ts` — добавить `kiosk-themes`, `kiosk-theme-editor/:id`
2. `web-sidebar.component.ts` — добавить пункт "Киоск" в навигацию (если нужен)
3. `changelog-button.component.ts` — добавить case для kiosk
4. `icons.module.ts` — проверить/добавить иконки: `qr-code`, `receipt`, `package`, `eye`, `message-square`, `percent`, `utensils`, `truck`, `x-circle`, `list`

### Этап 6: Финальная проверка

- [ ] Все 8 конфигураций соответствуют спецификации (разделы 3.2-3.11)
- [ ] Поиск работает во всех редакторах (фильтрация, empty state)
- [ ] Resize панели работает (min 300px, перетаскивание левой границы)
- [ ] Состояние раскрытия категорий (первая открыта, остальные свёрнуты)
- [ ] Все иконки зарегистрированы в `IconsModule`
- [ ] `npm run build` — без ошибок
- [ ] Angular 16: `*ngIf`/`*ngFor`, `inject()`, `standalone: true`, inline templates

---

## 4. Детальный план по файлам

### 4.1. Новые файлы

```
src/app/prototypes/web-screens/
├── components/
│   └── element-palette/
│       └── element-palette.component.ts    ★ КЛЮЧЕВОЙ — переиспользуемая палитра
├── data/
│   ├── arrivals-theme-categories.data.ts   ★ НОВЫЙ (V2: 4 кат., 8 эл.)
│   ├── arrivals-control-categories.data.ts ★ НОВЫЙ (7 кат., 28 эл.)
│   ├── cs-theme-categories.data.ts         ★ НОВЫЙ (7 кат., 31 эл.)
│   ├── cs-control-standard-categories.data.ts ★ НОВЫЙ (3 кат., 15 эл.)
│   ├── cs-control-hints-categories.data.ts ★ НОВЫЙ (3 кат., 10 эл.)
│   └── kiosk-theme-categories.data.ts      ★ НОВЫЙ (4 кат., 11 эл.)
├── screens/
│   ├── kiosk-themes-screen.component.ts    ★ НОВЫЙ (список тем)
│   └── kiosk-theme-editor-screen.component.ts ★ НОВЫЙ (редактор)
```

### 4.2. Существующие файлы для изменения

```
src/app/prototypes/web-screens/
├── web-screens.routes.ts                   ← +kiosk-themes, +kiosk-theme-editor/:id
├── data/
│   ├── element-categories.data.ts          ← ЗАМЕНИТЬ содержимое на V2
│   └── menuboard-categories.data.ts        ← ЗАМЕНИТЬ содержимое на V2
├── screens/
│   ├── arrivals-theme-editor-screen.ts     ← заменить inline-аккордеон на <app-element-palette>
│   ├── arrivals-control-editor-screen.ts   ← заменить .element-type-list на <app-element-palette>
│   ├── theme-editor-screen.ts             ← заменить element-tree-panel на <app-element-palette>
│   └── menuboard-theme-editor-screen.ts    ← заменить inline-аккордеон на <app-element-palette>
├── components/
│   └── control-editor/
│       └── control-edit-drawer.ts          ← заменить dropdown на <app-element-palette>
```

### 4.3. Файлы, которые НЕ трогаем

| Файл | Причина |
|------|---------|
| `types.ts` | Типы `ElementCategory`, `ElementCategoryItem` уже определены — используются как есть |
| `cs-types.ts` | Типы CS не затрагиваются группировкой |
| `cs-data.service.ts` | Сервис данных не затрагивается |
| `mock-data.ts`, `cs-mock-data.ts` | Мок-данные не затрагиваются |
| Canvas-компоненты (`editor-canvas`, `canvas-element`) | Не затрагиваются |
| Inspector-компоненты | Не затрагиваются |

---

## 5. Риски и митигация

| Риск | Митигация |
|------|-----------|
| CS Theme Editor имеет нестандартный layout (preview-колонка) | `<app-element-palette>` вставляется как overlay/панель справа, не ломая preview |
| CS Control Editor — drawer, не боковая панель | `<app-element-palette>` используется внутри drawer как inline-блок, без resize |
| Киоск — нет мок-данных | Создать минимальные мок-данные тем Киоска в `mock-data.ts` |
| Иконки отсутствуют в `lucide-angular` | Проверить каждую иконку из спеки, добавить в `IconsModule` |
| `menu-board-control-editor` использует тот же компонент что и `arrivals-control-editor` | Учесть, что изменения в Arrivals Control Editor автоматически применятся к MB Controls |

---

## 6. Итоговый чек-лист валидации

### Полнота охвата спецификации V2

- [x] Arrivals Themes — 4 категории, 8 элементов (раздел 3.2)
- [x] Arrivals Controls — 7 категорий, 28 элементов (раздел 3.3)
- [x] CS Themes — 7 категорий, 31 элемент, учтено дерево "Последнее добавленное блюдо" (раздел 3.4)
- [x] CS Controls Standard — 3 категории, 15 элементов (раздел 3.5)
- [x] CS Controls Hints — 3 категории, 10 элементов (раздел 3.6)
- [x] MenuBoard Themes — 4 категории, 7 элементов (раздел 3.7)
- [x] MenuBoard Controls = Arrivals Controls (раздел 3.8)
- [x] Kiosk Themes — 4 категории, 11 элементов (раздел 3.11)
- [x] Поиск (раздел 3.9)
- [x] Иконки (раздел 3.10)
- [x] Resize (требование 12)
- [x] Первая категория раскрыта (требование 3)

### Архитектурная чистота

- [x] Один компонент `ElementPaletteComponent` вместо 6 копий
- [x] 7 файлов конфигураций категорий (данные отдельно от представления)
- [x] Эталонный дизайн из `arrivals-theme-editor-screen` сохранён
- [x] Angular 16: `standalone: true`, `inject()`, `*ngIf`/`*ngFor`, inline templates
