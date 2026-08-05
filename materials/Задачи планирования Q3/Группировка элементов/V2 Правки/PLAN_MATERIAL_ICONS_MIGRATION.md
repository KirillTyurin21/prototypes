# План: Миграция на Material Icons (точное совпадение с порталом)

> **Дата:** 2026-08-05
> **Статус:** На согласование
> **Контекст:** прототип `web-screens` использует Lucide-иконки, а на портале `frontend-common.iiko.ru` используются Material Icons. Нужно добиться **визуального совпадения 1-в-1**.

---

## 1. Корень проблемы

### Как портал рендерит иконки

На `https://frontend-common.iiko.ru/components/resto-icon/dynamic/icon%20list` используется компонент `<resto-icon>` из пакета `@iiko/ng-iiko-common`. Под капотом он рендерит:

```html
<resto-icon>text_fields</resto-icon>
<!-- Внутри превращается в: -->
<span class="material-icons">text_fields</span>
```

Это **шрифтовые иконки** Material Icons. На портал загружен CSS-файл со шрифтом `MaterialIcons-Regular`, который содержит ~1131 глиф. Каждый глиф доступен по **имени-лигатуре** (например, `text_fields`, `build`, `schedule`).

### Как прототип рендерит иконки сейчас

```html
<lucide-icon [name]="materialToLucide('text_fields')"></lucide-icon>
<!-- Превращается в: -->
<lucide-icon name="type"></lucide-icon>
<!-- Рендерит SVG иконку Lucide "type" -->
```

Lucide `type` — это **SVG-иконка** (буква T с линиями), которая **визуально отличается** от Material `text_fields` (буква T + t).

### Почему мы не можем просто взять иконки с портала

| Барьер | Описание |
|--------|----------|
| **Нет пакета `@iiko/ng-iiko-common`** | Приватный iiko-пакет. Его нет в открытом доступе, не устанавливается через npm |
| **Нет шрифта Material Icons** | В проекте только Roboto, Material Icons не загружен |
| **Нет `<mat-icon>`** | `@angular/material` не установлен (и ставить его ради одних иконок — избыточно) |

### Почему Lucide-маппинг не даёт точного совпадения

**Material Icons и Lucide — это два разных набора иконок от разных дизайнеров.** Даже если иконки имеют похожую семантику, их визуальное исполнение различается:

| Material Icon | Lucide-аналог | Визуальное отличие |
|:---|:---|:---|
| `text_fields` | `type` | Разная форма букв, разная композиция |
| `build` | `wrench` | Разный угол наклона, разная рукоятка |
| `schedule` | `clock` | Разные пропорции циферблата |
| `photo` | `image` | Разные пропорции рамки и гор/солнца |

**Никакой маппинг Material→Lucide не даст 100% визуального совпадения.** Это принципиально разные наборы иконок.

---

## 2. Решение: подключить Material Icons шрифт

### Суть

Material Icons — это **бесплатный открытый шрифт** от Google, доступный через Google Fonts CDN. Нужно:

1. Загрузить CSS со шрифтом (1 строка в `<head>`)
2. Создать лёгкий Angular-компонент для рендеринга иконок
3. Заменить `<lucide-icon>` на новый компонент в палитре элементов
4. Удалить маппинг `MATERIAL_TO_LUCIDE`

После этого в прототипе будут **те же самые иконки, что на портале** — и визуально, и по названиям.

### Технически

Шрифт Material Icons использует **лигатуры** — технологию, при которой последовательность символов (например, `text_fields`) автоматически заменяется на иконку. Достаточно просто вывести текст:

```html
<span class="material-icons">text_fields</span>
```

Браузер сам заменит текст `text_fields` на иконку из шрифта.

---

## 3. План реализации (3 шага)

### Шаг 1. Подключить Material Icons шрифт

**Файл:** `src/index.html`

Добавить в `<head>` одну строку:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

**Проверка:** после этого в любом месте можно написать `<span class="material-icons">text_fields</span>` — иконка отобразится.

**Риски:** требует доступа к Google Fonts CDN. Для локальной разработки подходит. Для офлайн-режима можно скачать шрифт в `src/assets/fonts/`.

### Шаг 2. Создать компонент `MaterialIconComponent`

**Файл:** `src/app/components/ui/material-icon.component.ts` (или `src/app/shared/components/`)

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-material-icon',
  standalone: true,
  template: `<span class="material-icons" [style.font-size.px]="size">{{ name }}</span>`,
})
export class MaterialIconComponent {
  @Input() name = '';
  @Input() size = 24;
}
```

**Использование:**
```html
<app-material-icon name="text_fields" [size]="16"></app-material-icon>
```

### Шаг 3. Заменить иконки в `element-palette.component.ts`

**Файл:** `src/app/prototypes/web-screens/components/element-palette/element-palette.component.ts`

**Что изменить:**
- Убрать `const MATERIAL_TO_LUCIDE = { ... }` (весь маппинг, ~45 строк)
- Убрать метод `materialToLucide()`
- В шаблоне заменить `<lucide-icon [name]="materialToLucide(...)">` на `<app-material-icon [name]="cat.icon">`
- Везде использовать **Material-имена напрямую** (они уже в data-файлах)
- Шевроны: `chevron-right` → `arrow_right`, `chevron-down` → `arrow_drop_down`
- Крестик (×): `x` → `close`
- Поиск: `search` → `search`

**Было:**
```html
<lucide-icon [name]="materialToLucide(cat.icon)" [size]="18" class="category-icon"></lucide-icon>
```

**Стало:**
```html
<app-material-icon [name]="cat.icon" [size]="18" class="category-icon"></app-material-icon>
```

**Затрагивает:** только 1 файл (`element-palette.component.ts`). Data-файлы **не трогаем** — они уже содержат правильные Material-имена.

---

## 4. Сравнение подходов

| Критерий | Текущий (Lucide-маппинг) | Предлагаемый (Material Icons шрифт) |
|---|---|---|
| **Визуальное совпадение с порталом** | ❌ Разные иконки | ✅ 1-в-1 |
| **Соответствие спецификации** | ❌ Lucide ≠ Material | ✅ Полное |
| **Сложность реализации** | Уже сделано | 3 шага (~30 мин) |
| **Размер бандла** | ~70 kB (Lucide SVG) | ~0 kB (шрифт грузится 1 раз, кешируется) |
| **Зависимости** | `lucide-angular` | Google Fonts CDN (или локальный шрифт) |
| **Офлайн-работа** | ✅ (SVG в бандле) | ⚠️ Нужен локальный шрифт |
| **Кастомизация (цвет, размер)** | ✅ SVG stroke | ✅ CSS `font-size` + `color` |

---

## 5. Детальный план замены в element-palette.component.ts

### Текущий шаблон → Новый шаблон

| Элемент | Было (Lucide) | Стало (Material) |
|---|---|---|
| Иконка категории | `<lucide-icon [name]="materialToLucide(cat.icon)">` | `<app-material-icon [name]="cat.icon">` |
| Шеврон категории | `cat.collapsed ? 'chevron-right' : 'chevron-down'` | `cat.collapsed ? 'arrow_right' : 'arrow_drop_down'` |
| Иконка элемента | `<lucide-icon [name]="materialToLucide(el.icon)">` | `<app-material-icon [name]="el.icon">` |
| Крестик закрытия | `<lucide-icon name="x">` | `<app-material-icon name="close">` |
| Иконка поиска | `<lucide-icon name="search">` | `<app-material-icon name="search">` |
| Крестик очистки | `<lucide-icon name="x">` | `<app-material-icon name="close">` |
| Значок платного | `<lucide-icon name="alert-circle">` | `<app-material-icon name="error">` |

### Что удалить из компонента

- Строки 5-55: весь `const MATERIAL_TO_LUCIDE = { ... }`
- Строка ~377: метод `materialToLucide()`
- Импорт `IconsModule` (если больше нигде не используется в этом компоненте)

### Что добавить

- Импорт `MaterialIconComponent`
- `imports: [..., MaterialIconComponent]`

---

## 6. Вопросы, требующие решения

| # | Вопрос | Варианты |
|---|--------|----------|
| 1 | **Google Fonts CDN или локальный шрифт?** | CDN — быстро, но нужен интернет. Локальный — офлайн, но нужно скачать 1 файл (~200 kB) |
| 2 | **Удалять ли `lucide-angular` из проекта?** | Пока нет — он используется в других прототипах и в shared-компонентах (sidebar, top-bar, etc.) |
| 3 | **Нужен ли офлайн-режим для прототипа?** | Если да — кладём `MaterialIcons-Regular.woff2` в `src/assets/fonts/` и подключаем через `@font-face` в `styles.css` |

---

## 7. Рекомендация

**Использовать Google Fonts CDN** для простоты и скорости внедрения:

```html
<!-- src/index.html -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

Это **ровно тот же шрифт**, который используется на `frontend-common.iiko.ru` для `<resto-icon>`. Иконки будут **визуально идентичны** порталу — что и требуется менеджеру и разработчику.

Если в будущем потребуется офлайн-режим — шрифт легко скачать и переключить на локальный.

---

## 8. Согласование

- [ ] **Менеджер/Аналитик:** одобрить подход (Material Icons шрифт вместо Lucide)
- [ ] **Разработчик:** подтвердить, что `<app-material-icon>` — допустимый компонент для прототипа
- [ ] **Выполнить:** 3 шага из раздела 3
- [ ] **Проверить:** визуальное совпадение иконок с порталом `frontend-common.iiko.ru`
