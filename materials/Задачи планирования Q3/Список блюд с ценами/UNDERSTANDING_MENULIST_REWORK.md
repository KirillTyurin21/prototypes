# Понимание: Как переделать элемент «Меню-лист» в MenuBoard

Дата: 2026-06-11
Источники:
- Спецификация `DS-MenuBoard-Меню-лист-спецификация.md` (Задача 7, Скоуп 2)
- Встреча Кирилл + Руслан `Kirill __ Ruslan_ Menu Board Discussion_transcript.txt`
- Слайд Руслана: «В конструктор добавляем модифицированный объект чека»
- Мок-данные `MOCK_EXTERNAL_MENU` в `data/mock-data.ts`

---

## 1. Что показывает элемент MenuList

### 1.1. Каждая строка = одно блюдо. Состав строки (8 полей):

| # | Поле | Источник в данных | Отображается |
|---|------|------------------|-------------|
| 1 | **Иконка** | `ExternalMenuItem.imageUrl` (40×40 px) | Слева. Если нет — заглушка |
| 2 | **Название** | `ExternalMenuItem.name` | Основная строка, крупный шрифт |
| 3 | **Модификаторы** | `ExternalMenuItem.modifiers[]` (массив строк) | Под названием: «Модификаторы: корица, сливки», серый мелкий шрифт |
| 4 | **Цена** | `ExternalMenuItem.price` | Справа, красный/акцентный шрифт |
| 5 | **Граммовка / размеры** | `ExternalMenuItem.weight` + `measure` + `sizes[]` | Справа под ценой: «200 мл». Также размеры под модификаторами: «S, M, L» |
| 6 | **Аллергены** | `ExternalMenuItem.allergens[]` | Под описанием, иконка ⚠ + список: «Молоко, Кофеин» |
| 7 | **КБЖУ** | `energy`, `proteins`, `fats`, `carbs` | Под описанием: «120 ккал Б:8 Ж:5 У:10» |
| 8 | **Описание** | `ExternalMenuItem.description` | Под модификаторами, самый мелкий шрифт |

### 1.2. Визуальная структура строки (из спецификации, раздел 7.2):

```
┌──────────────────────────────────────────────────────┐
│ [icon]  Cappuccino Scuro                    450 ₽   │
│         Модификаторы: корица, сливки        200 мл   │
│         Размеры: S, M, L                             │
│         Описание: Классический итальянский...         │
│         ⚠ Молоко, Кофеин  |  120 ккал  Б:8 Ж:5 У:10 │
└──────────────────────────────────────────────────────┘
```

### 1.3. Что сказал Руслан (слайд + встреча):

> «В конструктор добавляем модифицированный объект чека, изменяем его, чтобы была возможность отобразить:
> 1. Название блюда
> 2. Модификаторы
> 3. Иконка
> 4. Цена блюда
> 5. Граммовка (РАЗМЕРЫ)
> 6. Аллергены
> 7. КБЖУ
> 8. Описание»

На встрече Руслан подтвердил: MenuList — это **отдельный элемент темы** (НЕ контрол), и он показывает модификаторы **естественно** в строке. Именно из-за модификаторов MenuList и Control разделены — через контролы модификаторы показывать крайне неудобно.

---

## 2. Источник данных

### 2.1. В реальном продукте

Плагин получает данные из **кэша внешнего меню** (`external_menu_cache`) через `GetTerminalSettings`. Плагин НЕ ходит в SDK. Данные статические, обновляются ~5 мин.

### 2.2. В прототипе

Мок-данные: `MOCK_EXTERNAL_MENU` (`ExternalMenuCategory[]`). Каждое блюдо (`ExternalMenuItem`) уже содержит ВСЕ нужные поля:

```typescript
interface ExternalMenuItem {
  externalId: string;        // ID для productIds
  name: string;              // 1. Название
  price: number;             // 4. Цена
  imageUrl?: string;         // 3. Иконка
  modifiers?: string[];      // 2. Модификаторы
  sizes?: { name: string; price: number }[];  // 5. Размеры
  description?: string;      // 8. Описание
  weight?: number;           // 5. Граммовка
  measure?: string;          // 5. Единица измерения
  allergens?: string[];      // 6. Аллергены
  energy?: number;           // 7. КБЖУ
  proteins?: number;
  fats?: number;
  carbs?: number;
}
```

**Важно:** В прототипе мы храним `productIds: string[]` (массив `externalId`), и при отрисовке ищем данные по `externalId` в `MOCK_EXTERNAL_MENU`.

---

## 3. Как должен работать Canvas (предпросмотр в конструкторе)

### 3.1. Текущая проблема

Сейчас canvas рендерит MenuList упрощённо:
```html
<div class="ml-row" *ngFor="...">
  <span class="ml-name">{{ getDishName(pid) }}</span>
  <span class="ml-price">{{ getDishPrice(pid) }}</span>
</div>
```

Только название + цена. Нет модификаторов, размеров, граммовки, описания, аллергенов, КБЖУ.

Настройки (чередование строк, высота строки, цвет подсветки, шрифты, чекбоксы отображения) **не применяются** — проблема в прокси-свойствах (`mlAlternateRows`, `mlRowHeight` и т.д.).

### 3.2. Как должно быть

Canvas должен отрисовывать **полноценную строку** с учётом всех данных из `ExternalMenuItem` и всех настроек из элемента:

```
Строка блюда (rowHeight px):
┌──────────────────────────────────────────────────────────┐
│ [40×40]  Cappuccino Scuro                 450 ₽         │  ← название (fontName)  +  цена (fontPrice)
│ icon     Модиф.: корица, сливки           200 мл         │  ← модификаторы (fontModifiers) + граммовка
│          Размеры: S (220₽) · M (280₽) · L (360₽)        │  ← размеры
│          Классический итальянский кофе...                 │  ← описание (fontDescription) — если showDescription
│          ⚠ Молоко, Кофеин  |  120 ккал Б:8 Ж:5 У:10     │  ← аллергены + КБЖУ — если showAllergens / showNutrition
└──────────────────────────────────────────────────────────┘
```

**Логика canvas-строки:**

```
Для каждого pid из productIds:
  1. Найти dish = найти по externalId в MOCK_EXTERNAL_MENU
  2. Если не найден — показать заглушку «Блюдо #pid»
  3. Показать иконку (если showIcons && dish.imageUrl) или заглушку
  4. Показать название блюда (fontName)
  5. Показать цену (fontPrice), справа
  6. Показать модификаторы (если dish.modifiers?.length), шрифт fontModifiers
  7. Показать размеры (если dish.sizes?.length), каждая со своей ценой
  8. Показать граммовку (dish.weight + ' ' + dish.measure), справа под ценой
  9. Показать описание (если showDescription && dish.description), шрифт fontDescription
  10. Показать аллергены (если showAllergens && dish.allergens?.length)
  11. Показать КБЖУ (если showNutrition && dish.energy != null)
  12. Применить чередование строк (alternateRows): нечётные — фон элемента, чётные — highlightColor
  13. Применить высоту строки (rowHeight)
```

### 3.3. Высота строки

- **Фиксированная высота:** `rowHeight` px (по умолчанию 48 px)
- Содержимое, не помещающееся в строку — **обрезается** (без прокрутки)
- Администратор должен сам рассчитать: `height >= productIds.length * rowHeight + rowPadding * (productIds.length - 1)`
- В прототипе: показываем предупреждение, если не помещается

---

## 4. Настройки элемента (инспектор)

### 4.1. Вкладки и поля (из спецификации, раздел 7.3)

#### Данные
- Кнопка «Выбрать блюда» → модальное окно `DishSelectorModalComponent`
- Список выбранных блюд с кнопкой удаления (уже реализовано)
- Текст-заглушка «Блюда не выбраны» (уже реализовано)

#### Макет (переиспользуется — стандартный инспектор)
- X, Y, Ширина, Высота
- Слой (Z-index)
- Цвет фона, Прозрачность
- Отступ, Поворот

#### Граница (переиспользуется)
- Цвет, толщина, стиль, скругление

#### Настройки таблицы
| Поле | Тип | По умолч. |
|------|-----|----------|
| Чередование строк | bool | `true` |
| Отступ строк | number (px) | `4` |
| Высота строки | number (px) | `48` |

#### Подсветка строк
| Поле | Тип | По умолч. |
|------|-----|----------|
| Цвет подсветки | HEX | `#f5f5f5` |

#### Шрифт названия
| Поле | Тип | По умолч. |
|------|-----|----------|
| Размер | number (px) | `16` |
| Семейство | select | `Segoe UI` |
| Цвет | HEX | `#333333` |
| Жирность | bool | `false` |
| Курсив | bool | `false` |

#### Шрифт цены
| Поле | Тип | По умолч. |
|------|-----|----------|
| Размер | number (px) | `16` |
| Семейство | select | `Segoe UI` |
| Цвет | HEX | `#CC0000` |
| Жирность | bool | `false` |
| Курсив | bool | `false` |

#### Шрифт модификаторов
| Поле | Тип | По умолч. |
|------|-----|----------|
| Размер | number (px) | `12` |
| Семейство | select | `Segoe UI` |
| Цвет | HEX | `#666666` |

#### Шрифт описания
| Поле | Тип | По умолч. |
|------|-----|----------|
| Размер | number (px) | `11` |
| Семейство | select | `Segoe UI` |
| Цвет | HEX | `#999999` |

#### Отображение (новая вкладка)
| Поле | Тип | По умолч. |
|------|-----|----------|
| Показывать иконки | bool | `true` |
| Показывать описание | bool | `false` |
| Показывать аллергены | bool | `false` |
| Показывать КБЖУ | bool | `false` |

### 4.2. Проблема прокси-свойств

Сейчас используется паттерн с прокси-геттерами/сеттерами:
```typescript
get mlAlternateRows(): boolean { this.ensureMenulistDefaults(); return this.selectedElement?.alternateRows ?? true; }
set mlAlternateRows(v: boolean) { this.ensureMenulistDefaults(); if (this.selectedElement) this.selectedElement.alternateRows = v; }
```

**Почему не работает:** `ensureMenulistDefaults()` вызывается при каждом доступе, что может сбрасывать значения. Плюс `[(ngModel)]` на прокси-свойствах может не триггерить `ngModelChange` правильно.

**Решение для новой реализации:**
- Отказаться от прокси-свойств
- Использовать прямое связывание с `selectedElement` через методы, которые ОДИН раз инициализируют дефолты при добавлении элемента
- Для `[(ngModel)]` использовать `(ngModelChange)` с прямым присвоением: `selectedElement.alternateRows = $event`

---

## 5. План переделки

### 5.1. Удалить старый код

Удалить ВСЕ прокси-свойства и методы, связанные с MenuList:
- `mlAlternateRows`, `mlRowHeight`, `mlHighlightColor`, `mlShowIcons`, `mlShowDescription`, `mlShowAllergens`, `mlShowNutrition`, `mlFontNameSize`, `mlFontNameColor`, `mlFontPriceSize`, `mlFontPriceColor`
- `ensureMenulistDefaults()`
- `getDishName()`, `getDishPrice()` — заменить на `getDishData(pid)` возвращающий весь объект

### 5.2. Создать заново (в `menuboard-theme-editor-screen.component.ts`)

#### A. Новый метод получения данных блюда
```typescript
getDishData(externalId: string): ExternalMenuItem | undefined {
  for (const cat of this.externalMenuCategories) {
    const dish = cat.items.find(d => d.externalId === externalId);
    if (dish) return dish;
  }
  return undefined;
}
```

#### B. Новый canvas-шаблон для MenuList
Вместо упрощённых `ml-name` + `ml-price` — полноценная строка:

```html
<div *ngIf="el.type === 'menulist'" class="el-menulist">
  <div class="ml-empty" *ngIf="!el.productIds?.length">Выберите блюда</div>
  <div class="ml-rows" *ngIf="el.productIds?.length"
    [style.font-family]="el.fontName?.family || 'Segoe UI'">
    <div class="ml-row" *ngFor="let pid of el.productIds || []; let odd = odd; let i = index"
      [style.height.px]="el.rowHeight || 48"
      [style.background-color]="getRowBg(el, odd)"
      [style.padding.px]="el.rowPadding || 4">
      <!-- Иконка -->
      <div class="ml-icon" *ngIf="el.showIcons !== false">
        <img *ngIf="getDishData(pid)?.imageUrl" [src]="getDishData(pid)?.imageUrl" class="ml-icon-img" />
        <lucide-icon *ngIf="!getDishData(pid)?.imageUrl" name="image-off" [size]="24"></lucide-icon>
      </div>
      <!-- Основная колонка -->
      <div class="ml-main">
        <!-- Название -->
        <div class="ml-name" [style.font-size.px]="el.fontName?.size || 16"
          [style.font-weight]="el.fontName?.bold ? 'bold' : 'normal'"
          [style.font-style]="el.fontName?.italic ? 'italic' : 'normal'"
          [style.color]="el.fontName?.color || '#333'">
          {{ getDishData(pid)?.name || '#' + pid }}
        </div>
        <!-- Модификаторы -->
        <div class="ml-modifiers" *ngIf="getDishData(pid)?.modifiers?.length"
          [style.font-size.px]="el.fontModifiers?.size || 12"
          [style.color]="el.fontModifiers?.color || '#666'">
          Модификаторы: {{ getDishData(pid)?.modifiers?.join(', ') }}
        </div>
        <!-- Размеры -->
        <div class="ml-sizes" *ngIf="getDishData(pid)?.sizes?.length"
          [style.font-size.px]="el.fontModifiers?.size || 12"
          [style.color]="el.fontModifiers?.color || '#666'">
          Размеры: {{ formatSizes(getDishData(pid)?.sizes) }}
        </div>
        <!-- Описание -->
        <div class="ml-desc" *ngIf="el.showDescription && getDishData(pid)?.description"
          [style.font-size.px]="el.fontDescription?.size || 11"
          [style.color]="el.fontDescription?.color || '#999'">
          {{ getDishData(pid)?.description }}
        </div>
        <!-- Аллергены + КБЖУ -->
        <div class="ml-extra" *ngIf="(el.showAllergens && getDishData(pid)?.allergens?.length) || (el.showNutrition && getDishData(pid)?.energy != null)">
          <span class="ml-allergens" *ngIf="el.showAllergens && getDishData(pid)?.allergens?.length">
            ⚠ {{ getDishData(pid)?.allergens?.join(', ') }}
          </span>
          <span class="ml-sep" *ngIf="el.showAllergens && getDishData(pid)?.allergens?.length && el.showNutrition && getDishData(pid)?.energy != null">|</span>
          <span class="ml-nutrition" *ngIf="el.showNutrition && getDishData(pid)?.energy != null">
            {{ getDishData(pid)?.energy }} ккал Б:{{ getDishData(pid)?.proteins || 0 }} Ж:{{ getDishData(pid)?.fats || 0 }} У:{{ getDishData(pid)?.carbs || 0 }}
          </span>
        </div>
      </div>
      <!-- Цена + граммовка -->
      <div class="ml-price-col">
        <div class="ml-price" [style.font-size.px]="el.fontPrice?.size || 16"
          [style.font-weight]="el.fontPrice?.bold ? 'bold' : 'normal'"
          [style.color]="el.fontPrice?.color || '#C00'">
          {{ getDishData(pid)?.price || 0 }} ₽
        </div>
        <div class="ml-weight" *ngIf="getDishData(pid)?.weight"
          [style.font-size.px]="(el.fontDescription?.size || 11)"
          [style.color]="el.fontDescription?.color || '#999'">
          {{ getDishData(pid)?.weight }} {{ getDishData(pid)?.measure || '' }}
        </div>
      </div>
    </div>
  </div>
</div>
```

#### C. Новый инспектор (в панели справа)

Использовать ПРЯМОЕ связывание с `selectedElement` через `[(ngModel)]`:

```html
<ng-container *ngIf="selectedElement.type === 'menulist'">
  <div class="section-divider">Данные</div>
  <div class="field-group">
    <button class="btn-select-dishes" (click)="openDishSelector()">...Выбрать блюда</button>
  </div>
  <!-- Список выбранных блюд с удалением -->

  <div class="section-divider">Настройки таблицы</div>
  <div class="field-group">
    <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.alternateRows" /> Чередование строк</label>
  </div>
  <div class="field-group">
    <label class="field-label">Высота строки (px)</label>
    <input type="number" class="field-input" [(ngModel)]="selectedElement.rowHeight" min="24" max="200" />
  </div>
  <div class="field-group">
    <label class="field-label">Отступ строк (px)</label>
    <input type="number" class="field-input" [(ngModel)]="selectedElement.rowPadding" min="0" max="20" />
  </div>

  <div class="section-divider">Подсветка строк</div>
  <div class="field-group">
    <label class="field-label">Цвет подсветки</label>
    <input type="color" class="field-color" [(ngModel)]="selectedElement.highlightColor" />
  </div>

  <div class="section-divider">Шрифт названия</div>
  <div class="field-group">
    <label class="field-label">Размер (px)</label>
    <input type="number" class="field-input" [(ngModel)]="selectedElement.fontName.size" min="8" max="72" />
  </div>
  <div class="field-group">
    <label class="field-label">Цвет</label>
    <input type="color" class="field-color" [(ngModel)]="selectedElement.fontName.color" />
  </div>
  <!-- ... bold, italic, family ... -->

  <!-- Аналогично: Шрифт цены, Шрифт модификаторов, Шрифт описания -->

  <div class="section-divider">Отображение</div>
  <div class="field-group">
    <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showIcons" /> Показывать иконки</label>
    <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showDescription" /> Показывать описание</label>
    <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showAllergens" /> Показывать аллергены</label>
    <label class="field-check"><input type="checkbox" [(ngModel)]="selectedElement.showNutrition" /> Показывать КБЖУ</label>
  </div>
</ng-container>
```

**Ключевое изменение:** Прямое `[(ngModel)]="selectedElement.showIcons"` вместо прокси `[(ngModel)]="mlShowIcons"`.

#### D. Вспомогательные методы

```typescript
// Цвет фона строки с учётом чередования
getRowBg(el: ArrivalsThemeElement, odd: boolean): string {
  if (!el.alternateRows) return 'transparent';
  return odd ? (el.highlightColor || '#f5f5f5') : 'transparent';
}

// Форматирование размеров
formatSizes(sizes?: { name: string; price: number }[]): string {
  if (!sizes?.length) return '';
  return sizes.map(s => s.name + ' (' + s.price + '₽)').join(' · ');
}
```

#### E. Дефолты при создании элемента

Дефолты задаются ОДИН раз в `addElement()`. Они уже заданы (почти все), но нужно УБЕДИТЬСЯ что ВСЕ поля инициализированы:

```typescript
if (type === 'menulist') {
  el.name = 'Меню-лист';
  el.width = 400;
  el.height = 300;
  el.productIds = [];
  el.rowHeight = 48;
  el.alternateRows = true;
  el.rowPadding = 4;
  el.highlightColor = '#f5f5f5';
  el.showIcons = true;
  el.showDescription = false;
  el.showAllergens = false;
  el.showNutrition = false;
  el.fontName = { size: 16, family: 'Segoe UI', color: '#333333', bold: false, italic: false };
  el.fontModifiers = { size: 12, family: 'Segoe UI', color: '#666666' };
  el.fontPrice = { size: 16, family: 'Segoe UI', color: '#CC0000', bold: false, italic: false };
  el.fontDescription = { size: 11, family: 'Segoe UI', color: '#999999' };
}
```

---

## 6. CSS-стили для canvas-строки

Нужны новые стили для полноценной строки:

```css
.el-menulist { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.ml-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #bdbdbd; font-size: 12px; }
.ml-rows { flex: 1; overflow: hidden; }
.ml-row { display: flex; align-items: flex-start; gap: 8px; overflow: hidden; border-bottom: 1px solid #f0f0f0; }
.ml-row:last-child { border-bottom: none; }
.ml-icon { width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 4px; overflow: hidden; }
.ml-icon-img { width: 100%; height: 100%; object-fit: cover; }
.ml-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.ml-name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
.ml-modifiers, .ml-sizes, .ml-desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
.ml-extra { display: flex; flex-wrap: wrap; gap: 4px; font-size: 10px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
.ml-sep { color: #ddd; }
.ml-price-col { flex-shrink: 0; text-align: right; display: flex; flex-direction: column; gap: 1px; min-width: 60px; }
.ml-price { font-weight: 600; white-space: nowrap; line-height: 1.2; }
.ml-weight { white-space: nowrap; line-height: 1.3; }
```

---

## 7. Пошаговый план реализации

| Шаг | Что сделать | Файл |
|-----|------------|------|
| 1 | Удалить ВСЕ прокси-свойства (`ml*`) и `ensureMenulistDefaults()` | `menuboard-theme-editor-screen.component.ts` |
| 2 | Добавить метод `getDishData(externalId)` возвращающий `ExternalMenuItem` | тот же файл |
| 3 | Переписать canvas-шаблон для `type === 'menulist'` — полноценная строка | тот же файл |
| 4 | Переписать инспектор — прямое `[(ngModel)]="selectedElement.xxx"` | тот же файл |
| 5 | Добавить методы `getRowBg()`, `formatSizes()` | тот же файл |
| 6 | Добавить новые CSS-стили для `.ml-*` классов | тот же файл |
| 7 | Проверить `addElement()` — все дефолты заданы | тот же файл |
| 8 | Проверить работу: создать MenuList, выбрать блюда, пощёлкать все настройки | браузер |
| 9 | Обновить `changelog.data.ts` | changelog |

---

## 8. Что НЕ трогаем

- `DishSelectorModalComponent` — работает корректно
- Типы `ExternalMenuCategory` / `ExternalMenuItem` — уже полные
- `MOCK_EXTERNAL_MENU` — данные полные
- Тип `ArrivalsThemeElement` — все нужные поля уже есть
