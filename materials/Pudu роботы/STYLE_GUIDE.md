# Pudu Admin Panel — Гайд по стилистике и UI-паттернам

> **Назначение документа:** Справочник для Copilot / LLM при генерации экранов панели администрирования проекта Pudu.  
> Все новые экраны прототипа должны опираться на этот документ, чтобы сохранить единый визуальный стиль и UX-паттерны.

---

## 1. Общая архитектура Layout

### 1.1. Каркас страницы

```
┌─────────────────────────────────────────────────────────┐
│  HEADER  (h-14, border-b, bg-white)                     │
│  [Logo iiko]                       [Search] [User ▼]    │
├─────────┬───────────────────────────────────────────────┤
│ SIDEBAR │  MAIN AREA (flex-1, flex flex-col)            │
│ (w-52)  │  ┌───────────────────────────────────────────┐│
│         │  │ SUBHEADER (border-b, px-6 py-4)           ││
│ Навигац.│  │ [H1 заголовок]        [Поиск / Действия] ││
│ по      │  ├───────────────────────────────────────────┤│
│ разделам│  │ CONTENT AREA (flex-1, overflow-hidden)    ││
│         │  │                                           ││
│         │  │  Варианты layout контента:                ││
│         │  │  A) Master-Detail (дерево + панель)       ││
│         │  │  B) Таблица с фильтрами                  ││
│         │  │  C) Форма настроек                        ││
│         │  │  D) Dashboard с карточками                ││
│         │  │                                           ││
│         │  └───────────────────────────────────────────┘│
└─────────┴───────────────────────────────────────────────┘
```

### 1.2. Фиксированные размеры

| Элемент | Tailwind-класс | Пиксели | Назначение |
|---------|---------------|---------|------------|
| Header высота | `h-14` | 56px | Фиксированная верхняя панель |
| Sidebar ширина | `w-52` | 208px | Левая навигационная панель |
| Tree panel | `w-96` | 384px | Левая панель в master-detail |
| Search input | `w-80` | 320px | Поиск в subheader |
| Content max-width | `max-w-2xl` | 672px | Ограничение ширины контента форм |
| Content area height | `h-[calc(100vh-8.5rem)]` | viewport - header - subheader | Область с прокруткой |

---

## 2. Цветовая палитра

### 2.1. Основные цвета (серая ахроматическая база)

Интерфейс строится на **нейтральных серых тонах** с цветными акцентами только для статусов и действий.

| Токен | Tailwind | Применение |
|-------|----------|------------|
| Фон страницы | `bg-gray-50` | Основной фон контентной области |
| Фон карточек, header | `bg-white` | Карточки, модалки, header, subheader |
| Фон sidebar | `bg-slate-50` | Чуть отличается от контента |
| Основной текст | `text-gray-900` | Заголовки H1, H2 |
| Вторичный текст | `text-gray-800` / `text-gray-700` | Текст в дереве, labels |
| Мета-текст, подписи | `text-gray-500` | Описания, подсказки, даты |
| Самый бледный текст | `text-gray-400` | Плейсхолдеры, пустые состояния |
| Иконки навигации | `text-gray-500` | Chevron в дереве |
| Бордюры | `border-gray-200` | Все разделители |
| Hover-фон | `bg-gray-100` | Наведение на элемент дерева |
| Selected-фон | `bg-blue-50` | Выбранный элемент |
| Активный пункт sidebar | `bg-blue-50 text-blue-700` | Текущий раздел навигации |

### 2.2. Статусные цвета

| Статус | Иконка | Цвет иконки | Пример |
|--------|--------|-------------|--------|
| Полностью настроено | `check-circle-2` | `text-green-600` | Все терминалы привязаны |
| Частично настроено | `alert-circle` | `text-orange-500` | Есть ключ, но не все терминалы |
| Не настроено | `circle` | `text-gray-300` | Нет ключа |
| Предупреждение (блок) | `alert-triangle` | `text-orange-500` | Warning-карточка |
| Ошибка (текст) | — | `text-red-600` | Сообщение об ошибке |

### 2.3. Warning-карточка (стандартный паттерн)

```
border border-orange-200 bg-orange-50/50 rounded-lg p-5
  ├── lucide-icon: alert-triangle, text-orange-500, size=20
  └── Контент: заголовок + описание + опциональный список
```

### 2.4. Акцентный цвет бренда

| Элемент | Цвет |
|---------|------|
| Логотип iiko (SVG) | `text-[#E94B35]` (красный iiko) |
| Focus ring инпутов | `focus:border-blue-500 focus:ring-1 focus:ring-blue-500` |
| Primary buttons | Синий (через UI-компоненты проекта) |

---

## 3. Типографика

### 3.1. Иерархия заголовков

| Уровень | Классы | Размер | Контекст |
|---------|--------|--------|----------|
| H1 — страница | `text-2xl font-semibold text-gray-900` | 24px, 600 | Заголовок в subheader |
| H2 — секция | `text-xl font-semibold text-gray-900` | 20px, 600 | Заголовок правой панели |
| H3 — подсекция | `text-lg font-semibold text-gray-900` | 18px, 600 | "QR-таблички и терминалы" |
| H4 — карточка/warning | `text-base font-semibold text-gray-900` | 16px, 600 | Заголовок предупреждения |
| Card title | `text-base font-medium text-gray-800` | 16px, 500 | Название терминала |
| Section label | `text-sm font-semibold text-gray-500` | 14px, 600 | "Структура торговых предприятий" |

### 3.2. Текстовые стили

| Тип | Классы | Контекст |
|-----|--------|----------|
| Body | `text-sm text-gray-700` | Элементы дерева, пункты меню |
| Подпись | `text-sm text-gray-500` | Описания под формами |
| Мета (дата, автор) | `text-xs text-gray-400` | "Обновлён: 18.11.2025, Иванов" |
| Ошибка | `text-sm text-red-600` | Валидация |
| Плейсхолдер | `text-gray-400` (через placeholder) | Инпуты, пустые состояния |
| Моноширинный | `font-mono` | Ключи API, технические значения |
| Курсив | `italic text-gray-400` | Опция "Не назначена" в select |

---

## 4. Spacing-система

### 4.1. Padding-паттерны

| Контекст | Padding |
|----------|---------|
| Header | `px-4` (16px) |
| Sidebar | `p-2` → пункт: `px-3 py-2` |
| Subheader | `px-6 py-4` |
| Tree panel | `p-4` |
| Content area | `p-6` |
| Warning-карточка | `p-5` |

### 4.2. Gap-паттерны

| Контекст | Gap |
|----------|-----|
| Header: лого + поиск + профиль | `gap-4` |
| Мелкие группы (иконка + текст) | `gap-2` |
| Кнопки действий | `gap-3` |
| Warning: иконка + текст | `gap-3` |

### 4.3. Space-y (вертикальные секции)

| Контекст | Значение |
|----------|----------|
| Основные секции контента | `space-y-6` (24px) |
| Подсекции | `space-y-4` (16px) |
| Элементы внутри секции | `space-y-3` (12px) |
| Поля формы | `space-y-2` (8px) |
| Элементы дерева/списка | `space-y-1` (4px) |

---

## 5. Компоненты и паттерны

### 5.1. Header

```html
<header class="border-b border-gray-200 bg-white h-14 flex items-center gap-4 px-4 shrink-0">
  <!-- Логотип iiko (SVG) слева -->
  <!-- ml-auto: поиск + профиль справа -->
  <!--   Кнопки: variant="ghost", size="sm" -->
  <!--   Профиль: иконка user + "user" текст -->
</header>
```

### 5.2. Sidebar

```html
<aside class="w-52 border-r border-gray-200 bg-slate-50 shrink-0">
  <nav class="space-y-1 p-2">
    <!-- Активный пункт: -->
    <div class="bg-blue-50 text-blue-700 rounded px-3 py-2 text-sm font-medium">
      Название раздела
    </div>
    <!-- Неактивный пункт: -->
    <button class="w-full text-left rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
      Другой раздел
    </button>
  </nav>
</aside>
```

### 5.3. Subheader (перед контентом)

```html
<div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-2xl font-semibold text-gray-900">Заголовок страницы</h1>
    <!-- Справа: поиск, кнопки фильтров и т.д. -->
  </div>
</div>
```

### 5.4. Master-Detail (дерево + панель)

**Левая панель (дерево):**
```html
<div class="w-96 border-r border-gray-200 overflow-y-auto shrink-0">
  <div class="p-4">
    <h2 class="mb-4 text-sm font-semibold text-gray-500">Заголовок дерева</h2>
    <!-- Группа (expand/collapse): -->
    <button class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100">
      <lucide-icon [name]="expanded ? 'chevron-down' : 'chevron-right'" [size]="16" class="text-gray-500"></lucide-icon>
      <span class="flex-1 text-left text-gray-800">Название группы</span>
    </button>
    <!-- Дочерние элементы: -->
    <div class="ml-4 space-y-0.5 border-l border-gray-200 pl-2">
      <button class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100"
              [class.bg-blue-50]="selected">
        <span class="flex-1 text-left text-gray-700">Элемент</span>
        <!-- Статус-иконка справа -->
      </button>
    </div>
  </div>
</div>
```

**Правая панель (детали):**
```html
<div class="flex-1 overflow-y-auto">
  <!-- Пустое состояние: -->
  <div class="flex h-full items-center justify-center text-gray-400 text-sm">
    Выберите элемент слева...
  </div>
  <!-- Загрузка: -->
  <div class="flex h-full items-center justify-center">
    <lucide-icon name="loader-2" [size]="32" class="animate-spin text-gray-400"></lucide-icon>
  </div>
  <!-- Контент: -->
  <div class="p-6">
    <div class="max-w-2xl space-y-6">
      ...секции формы...
    </div>
  </div>
</div>
```

### 5.5. Секция с заголовком и кнопкой-действием

```html
<div class="flex items-center justify-between">
  <h3 class="text-lg font-semibold text-gray-900">Заголовок секции</h3>
  <ui-button variant="ghost" size="sm" iconName="refresh-cw" [loading]="isLoading">
    Обновить
  </ui-button>
</div>
```

### 5.6. Карточка терминала / устройства

```html
<ui-card padding="sm">
  <ui-card-header>
    <ui-card-title>Название устройства</ui-card-title>
  </ui-card-header>
  <ui-card-content>
    <ui-select [options]="options" [value]="currentValue" (valueChange)="onChange($event)"></ui-select>
  </ui-card-content>
</ui-card>
```

### 5.7. Warning-блок (информационное предупреждение)

```html
<div class="rounded-lg border border-orange-200 bg-orange-50/50 p-5">
  <div class="flex gap-3">
    <lucide-icon name="alert-triangle" [size]="20" class="shrink-0 text-orange-500 mt-0.5"></lucide-icon>
    <div class="space-y-3 flex-1">
      <div>
        <h4 class="font-semibold text-base mb-1 text-gray-900">Заголовок предупреждения</h4>
        <p class="text-sm text-gray-500">Описание ситуации и что делать.</p>
      </div>
      <!-- Опционально: список, доп. информация -->
    </div>
  </div>
</div>
```

### 5.8. Toast-уведомления

```html
<!-- Контейнер: фиксированный, bottom-right -->
<div class="fixed bottom-4 right-4 z-50 space-y-2">
  <div class="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg min-w-[300px] animate-slide-up">
    <p class="text-sm font-medium text-gray-900">{{ title }}</p>
    <p class="text-xs text-gray-500 mt-0.5">{{ description }}</p>
  </div>
</div>
```

**Стандартная длительность:** 3 секунды (обычные), 4 секунды (важные с описанием).

### 5.9. Confirm Dialog (подтверждение опасного действия)

```html
<ui-confirm-dialog
  [open]="isOpen"
  title="Заголовок вопроса?"
  message="Подробное описание последствий действия."
  confirmText="Подтвердить"
  cancelText="Отмена"
  variant="danger"
  (confirmed)="onConfirm()"
  (cancelled)="isOpen = false"
></ui-confirm-dialog>
```

---

## 6. Состояния и взаимодействия

### 6.1. Состояния панели (Master-Detail)

| Состояние | Триггер | Отображение |
|-----------|---------|-------------|
| **Пустое** | Ничего не выбрано | Серый текст по центру: "Выберите элемент..." |
| **Загрузка** | Клик по элементу дерева | Спиннер `loader-2` по центру, `animate-spin` |
| **Контент** | Данные загружены | Форма / информация с `animate-fade-in` |

### 6.2. Состояния кнопок

| Кнопка | Enabled | Disabled |
|--------|---------|----------|
| Сохранить (primary) | Есть изменения + поля валидны | Нет изменений ИЛИ обязательное поле пусто |
| Очистить (outline) | Данные существуют | Данных нет |
| Обновить (ghost) | Всегда | Во время загрузки (`loading=true`, иконка вращается) |

### 6.3. Debounced-поиск

- **Задержка:** 300ms
- **Поведение:** фильтрует дерево по имени, автоматически раскрывает группы с совпадениями
- **Пустой результат:** "Ничего не найдено" (по центру, `text-gray-400`)

### 6.4. Toast-сообщения (стандартные формулировки)

| Действие | Title | Description |
|----------|-------|-------------|
| Сохранение | "Изменения сохранены" | — |
| Сохранение со сбросом | "Ключ изменён" | "Все привязки сброшены..." |
| Удаление | "Данные очищены" | "Связанные настройки удалены" |
| Обновление списка | "Список обновлён" | — |
| Привязка | "{Что} назначено на {Куда}" | — |
| Снятие привязки | "Привязка снята с {Устройства}" | — |

---

## 7. Иконки (Lucide)

### 7.1. По категориям

**Навигация:**
| Иконка | Контекст | Размер |
|--------|----------|--------|
| `chevron-right` / `chevron-down` | Раскрытие группы в дереве | 16 |
| `menu` | Мобильное меню | 20 |
| `search` | Поиск | 16-20 |

**Статусы:**
| Иконка | Контекст | Цвет | Размер |
|--------|----------|------|--------|
| `check-circle-2` | Полностью настроено | `text-green-600` | 16 |
| `alert-circle` | Частично настроено | `text-orange-500` | 16 |
| `circle` | Не настроено | `text-gray-300` | 16 |
| `alert-triangle` | Предупреждение | `text-orange-500` | 20 |
| `loader-2` | Загрузка | `text-gray-400` + `animate-spin` | 32 |

**Действия:**
| Иконка | Контекст | Размер |
|--------|----------|--------|
| `refresh-cw` | Обновить список | 16 (+ `animate-spin` при загрузке) |
| `user` | Профиль | 16 |
| `plus` | Добавить | 18 |
| `trash-2` | Удалить | 16 |
| `save` | Сохранить | 16 |

---

## 8. Поведение инпутов и форм

### 8.1. Стандартный input

```html
<input
  type="text"
  class="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  [class.border-red-500]="hasError"
/>
```

- **Высота:** `h-9` (36px)
- **Border:** `border-gray-300`, при фокусе `border-blue-500`
- **Radius:** `rounded-md`
- **Ошибка:** `border-red-500` + текст `text-red-600` под полем

### 8.2. С иконкой поиска (слева)

```html
<div class="relative w-80">
  <lucide-icon name="search" [size]="16"
    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"></lucide-icon>
  <input class="... pl-9" />
</div>
```

### 8.3. Label + Input + Hint

```html
<div class="space-y-2">
  <label class="block text-sm font-medium text-gray-700">Название поля</label>
  <input ... />
  <p class="text-xs text-gray-400">Подсказка под полем</p>
</div>
```

### 8.4. Select (через ui-select)

- Первый пункт: **"Не назначена"** (placeholder, стилизован как `italic text-gray-400`)
- Остальные пункты: обычный текст
- При дублях: суффикс **"(на N терм.)"** или `Badge` с тултипом

---

## 9. Анимации

| Анимация | Класс | Контекст |
|----------|-------|----------|
| Появление контента | `animate-fade-in` | Загрузка панели деталей |
| Появление toast | `animate-slide-up` | Тосты снизу-справа |
| Спиннер загрузки | `animate-spin` | `loader-2`, `refresh-cw` при загрузке |
| Hover-transition | `transition-colors` | Элементы дерева |

---

## 10. Accessibility

| Паттерн | Реализация |
|---------|------------|
| Aria-labels | Все интерактивные элементы имеют `aria-label` |
| Aria-expanded | Кнопки раскрытия дерева: `true` / `false` |
| Aria-current | Выбранный элемент: `aria-current="page"` |
| Role | `role="navigation"` (дерево), `role="status"` (счётчики, пустые состояния) |
| Screen reader | `sr-only` для дублирования визуальной информации текстом |

---

## 11. Шаблон промта для Copilot

При создании нового экрана используй следующий шаблон промта:

```
Создай экран "[Название]" для панели администрирования Pudu.

Стилистика:
- Опирайся на STYLE_GUIDE.md (materials/Pudu роботы/)
- Layout: header (h-14) + sidebar (w-52) + main с subheader
- Цвета: нейтральные серые (gray-50..900), акценты blue-50/blue-700, статусы green-600/orange-500/gray-300
- Типографика: H1 text-2xl, H2 text-xl, body text-sm, meta text-xs
- Spacing: секции space-y-6, подсекции space-y-4, поля space-y-2

Навигация:
- Sidebar: пункт "[Раздел]" активен (bg-blue-50 text-blue-700)
- Subheader: H1 "Заголовок" + [инструменты справа]

Контент:
- [Описание что на экране]

Взаимодействия:
- [Какие действия доступны]
- Toast при успешных операциях (3 сек)
- Confirm dialog при деструктивных действиях
- Loading spinner при загрузке

Компоненты:
- Использовать UI-компоненты проекта: UiButton, UiCard, UiInput, UiSelect, UiModal, UiConfirmDialog, UiBadge, UiAlert
- Иконки: lucide-angular через IconsModule
```

---

## 12. Чеклист для нового экрана

- [ ] Layout: header + sidebar + main + subheader
- [ ] Sidebar: нужный пункт подсвечен `bg-blue-50 text-blue-700`
- [ ] H1 в subheader
- [ ] Контент ограничен `max-w-2xl` (формы) или без ограничения (таблицы)
- [ ] Все кнопки: variant + size + disabled-логика
- [ ] Toast-уведомления для всех действий
- [ ] Confirm dialog для деструктивных операций
- [ ] Пустое состояние (текст по центру, `text-gray-400`)
- [ ] Loading-состояние (спиннер `loader-2`)
- [ ] Ошибки: `text-red-600`, `border-red-500` на инпутах
- [ ] Анимации: `animate-fade-in` при загрузке контента
- [ ] Accessibility: aria-labels на интерактивных элементах
