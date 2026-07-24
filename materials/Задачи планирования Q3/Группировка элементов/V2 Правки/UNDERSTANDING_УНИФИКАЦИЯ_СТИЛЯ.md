# UNDERSTANDING: Унификация стиля редакторов тем и контролов

**Дата:** 2026-07-24
**Задача:** Привести ВСЕ редакторы тем и контролов к единому стилю Arrivals Theme Editor

---

## 1. Проблема

Сейчас редакторы выглядят по-разному:

| Редактор | Layout | Стиль |
|----------|--------|-------|
| **Arrivals Theme Editor** | Canvas слева + панель 320px справа | ✅ Эталон |
| **Arrivals Control Editor** | Canvas слева + панель 320px справа | ✅ Такой же |
| **MenuBoard Theme Editor** | Canvas слева + панель 320px справа | ✅ Такой же |
| **Kiosk Theme Editor** | Canvas слева + панель 320px справа | ✅ Такой же |
| **CS Theme Editor** | ❌ Preview-колонка + панель справа | ❌ Другой |
| **CS Control Editor** | ❌ Drawer (выезжающая панель) | ❌ Другой |

**Проблема:** CS Theme Editor и CS Control Editor выбиваются из общего стиля — у них другой layout, другие компоненты, другая логика взаимодействия.

---

## 2. Цель

Привести **CS Theme Editor** и **CS Control Editor** к единому canvas-based layout:

```
┌──────────────────────┬─────────────┐
│                      │  Панель     │
│      CANVAS          │  управления │
│   (сетка, drag,      │  320px      │
│    resize, zoom)     │             │
│                      │  • Свойства │
│                      │  • Элементы │
│                      │  • Палитра  │
│                      │             │
│                      │ [Сохранить] │
│                      │ [Назад]     │
└──────────────────────┴─────────────┘
```

---

## 3. План работ

### 3.1. CS Theme Editor — переработка на canvas

**Текущее состояние:** preview-колонка с мок-чеком + панель справа с инспектором.
**Цель:** canvas с draggable элементами + панель справа (единый стиль).

**Что изменить:**
1. Заменить `.editor-body` → `.editor-layout` с flex-раскладкой
2. Заменить preview-колонку → canvas с сеткой
3. Элементы темы отображать как draggable/resizable блоки на canvas (как в Arrivals)
4. Удалить `element-tree-panel` dropdown (уже заменён на `<app-element-palette>` в Этапе 4)
5. Панель справа: свойства темы → список элементов → палитра → инспектор
6. Стили CSS — точная копия `arrivals-theme-editor-screen`

**Файл:** `screens/theme-editor-screen.component.ts`

### 3.2. CS Control Editor — переработка из drawer в полностраничный редактор

**Текущее состояние:** drawer открывается поверх списка контролов.
**Цель:** отдельная страница редактора с canvas + панель (как Arrivals Control Editor).

**Что изменить:**
1. Создать новый экран `screens/cs-control-editor-screen.component.ts`
2. Layout: canvas (как `editor-canvas`) + панель справа
3. Перенести логику из `control-edit-drawer` в новый экран
4. Список контролов → клик «Редактировать» → переход на `/cs-control-editor/:id`
5. Добавить маршрут в `web-screens.routes.ts`
6. Палитра элементов — уже `<app-element-palette>` с `CS_CONTROL_STANDARD_CATEGORIES` / `CS_CONTROL_HINTS_CATEGORIES`

### 3.3. Что НЕ трогаем

| Редактор | Причина |
|----------|---------|
| Arrivals Theme Editor | Эталон |
| Arrivals Control Editor | Уже в едином стиле |
| MenuBoard Theme Editor | Уже в едином стиле |
| Kiosk Theme Editor | Уже в едином стиле |

---

## 4. Единый стиль (Reference)

### 4.1. Layout

```css
.editor-layout {
  display: flex;
  height: calc(100vh - 110px);
  margin: -20px -24px;
  font-family: Roboto, sans-serif;
}
.canvas-column { flex: 1; min-width: 0; }
.control-panel {
  width: 320px; flex-shrink: 0;
  display: flex; flex-direction: column;
  background: #fff; border-left: 1px solid #e0e0e0;
}
```

### 4.2. Canvas

```css
.canvas-viewport {
  position: relative; transform-origin: top left;
  background-color: #fff;
  background-image: /* grid pattern */;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
```

### 4.3. Панель управления

```css
.panel-header { /* 15px/500, padding 14px 16px, border-bottom */ }
.panel-body { flex: 1; overflow-y: auto; padding: 16px; }
.panel-footer { /* кнопки Сохранить/Назад */ }
```

### 4.4. Элементы на canvas

```css
.canvas-element {
  position: absolute; border-style: dashed; cursor: move;
  /* hover: box-shadow #448aff, selected: solid border */
}
.handle { /* 8 ресайз-хендлов */ }
```

---

## 5. Риски

| Риск | Митигация |
|------|-----------|
| CS Theme Editor — сложная логика элементов (animation, hints, advertise) | Сохранить существующий `CsThemeInspectorComponent` для инспектора |
| CS Control Editor — drawer был удобен для быстрого редактирования | Добавить кнопку «Быстрое редактирование» или сохранить drawer как опцию |
| Большой объём изменений в `theme-editor-screen.ts` | Делать поэтапно: сначала layout, потом canvas |
| Мок-данные CS могут не поддерживать canvas-модель | Адаптировать или создать новые мок-данные |

---

## 6. Порядок выполнения

1. **CS Theme Editor** — переделать на canvas-based layout
2. **CS Control Editor** — создать полноценный экран редактора вместо drawer
3. **Маршруты** — добавить `/cs-control-editor/:id`
4. **Сборка и тестирование**
5. **Коммит**

---

## 7. Вопросы для валидации

1. CS Theme Editor — делать именно canvas с draggable элементами, или достаточно unified layout без canvas (preview как сейчас, но в едином стиле)?
2. CS Control Editor — убрать drawer полностью и сделать отдельную страницу редактора, или оставить drawer как быстрый режим?
3. Кнопка «Редактировать» в таблице контролов — должна вести на новый полноэкранный редактор?
