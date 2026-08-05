# DS-Группировка-элементов — Маппинг иконок (Material Icons)

> **Источник иконок:** https://frontend-common.iiko.ru/components/resto-icon/dynamic/icon%20list
> **Компонент:** `<iiko-icon>` (часть `ng-iiko-common`)
> **Дата:** 2026-08-05
> **Набор:** Material Design Icons — 1131 иконка
> **Правило:** ТОЛЬКО иконки из Material Icons (портал `frontend-common.iiko.ru`). Lucide, Resto Icons и другие внешние источники — ЗАПРЕЩЕНЫ.

---

## 1. Каталог используемых иконок

Все иконки взяты из полного списка Material Icons (1131 шт.) на портале `frontend-common.iiko.ru`.
Категория в скобках — раздел на странице Icon List, где иконка подтверждена.

### Категории (17 иконок)

| Иконка | Категория Material | Семантика | Подтверждена |
|--------|:---:|-----------|:---:|
| `build` | places&things | Инструменты / сборка / конструктор | ✅ |
| `grid_view` | multimedia | Сетка / компоновка / контейнер | ✅ |
| `campaign` | places&things | Кампания / реклама / медиа | ✅ |
| `analytics` | business | Аналитика / данные / информация | ✅ |
| `receipt_long` | communication | Чек / заказ / данные заказа | ✅ |
| `schedule` | general | Часы / время / приготовление | ✅ |
| `person` | people | Человек / клиент / пользователь | ✅ |
| `local_shipping` | transport | Доставка / грузовик | ✅ |
| `cancel` | general | Отмена / закрытие | ✅ |
| `point_of_sale` | e-commerce | Терминал / касса / чек | ✅ |
| `qr_code` | e-commerce | QR-код / сканирование | ✅ |
| `restaurant` | food&rest | Ресторан / блюдо / еда | ✅ |
| `inventory` | e-commerce | Товары / продукты / инвентарь | ✅ |
| `visibility` | multimedia | Видимость / отображение / визуализация | ✅ |
| `design_services` | places&things | Дизайн / оформление / стиль | ✅ |
| `sell` | e-commerce | Продажа / цена / стоимость | ✅ |
| `menu_book` | food&rest | Меню / справочник / данные | ✅ |

### Элементы (25 иконок)

| Иконка | Категория Material | Семантика | Подтверждена |
|--------|:---:|-----------|:---:|
| `text_fields` | general | Текст / текстовое поле | ✅ |
| `photo` | multimedia | Изображение / картинка | ✅ |
| `check_box_outline_blank` | general | Прямоугольник / контур | ✅ |
| `open_in_new` | device&tech | Всплывающее окно / открыть | ✅ |
| `notifications` | general | Уведомление / рекламный блок | ✅ |
| `schedule` | general | Время / часы / события | ✅ |
| `receipt_long` | communication | Чек / номер заказа | ✅ |
| `table_bar` | food&rest | Стол / номер стола | ✅ |
| `check_circle` | general | Статус / подтверждение / ОК | ✅ |
| `list_alt` | communication | Список / состав / перечень | ✅ |
| `hourglass_full` | general | Ожидание / время ожидания | ✅ |
| `error` | general | Ошибка / истекшее время | ✅ |
| `person` | people | Человек / клиент / имя | ✅ |
| `call` | communication | Телефон / звонок / номер | ✅ |
| `comment` | communication | Комментарий / заметка | ✅ |
| `external-driver` | transport | Курьер / доставщик | ✅ |
| `sell` | e-commerce | Цена / стоимость | ✅ |
| `percent` | e-commerce | Процент / скидка / размер | ✅ |
| `payments` | e-commerce | Платёж / оплата / предоплата | ✅ |
| `loyalty` | e-commerce | Лояльность / баллы / бонусы | ✅ |
| `description` | communication | Описание / документ | ✅ |
| `settings` | general | Настройки / масштаб | ✅ |
| `square_foot` | places&things | Измерение / единица | ✅ |
| `cloud_download` | device&tech | Импорт / внешние данные | ✅ |
| `play_circle` | multimedia | Анимация / окно анимации | ✅ |

### Служебные (5 иконок)

| Иконка | Категория Material | Назначение | Подтверждена |
|--------|:---:|------------|:---:|
| `search` | general | Поиск (поле ввода) | ✅ |
| `arrow_right` | arrows | Шеврон свёрнутой категории | ✅ |
| `arrow_drop_down` | arrows | Шеврон раскрытой категории | ✅ |
| `close` | general | Кнопка очистки/закрытия (×) | ✅ |

---

## 2. Сводная таблица: Категория → Иконка

Единый маппинг для всех продуктов DS.

| # | Категория | Material Icon | Обоснование |
|:-:|-----------|:---:|-------------|
| 1 | Стандартные / Базовые | `build` | Инструменты = строительные блоки, из которых собирается макет |
| 2 | Стандартные (CS Контролы) | `build` | Инструменты = строительные блоки, из которых собирается макет |
| 3 | Контейнеры | `grid_view` | Сетка = компоновка, размещение элементов |
| 4 | Медиа | `campaign` | Кампания = продвижение, трансляция контента |
| 5 | Информационные | `analytics` | Аналитика = данные, информация, показатели |
| 6 | Данные заказа | `receipt_long` | Чек = данные заказа, состав |
| 7 | Время приготовления | `schedule` | Часы = время, расписание, приготовление |
| 8 | Клиент | `person` | Человек = клиент, пользователь |
| 9 | Доставка | `local_shipping` | Доставка — прямое совпадение |
| 10 | Отмена | `cancel` | Отмена — прямое совпадение |
| 11 | Данные чека | `point_of_sale` | Терминал = касса, чек, финансы |
| 12 | QR-коды | `qr_code` | QR-код — прямое совпадение |
| 13 | Последнее добавленное блюдо | `restaurant` | Ресторан = блюдо, еда |
| 14 | Свойства продукта | `inventory` | Инвентарь = товары, продукты |
| 15 | Визуализация | `visibility` | Видимость = отображение, визуализация |
| 16 | Визуальные свойства | `design_services` | Дизайн = визуальное оформление, стиль |
| 17 | Цены | `sell` | Продажа = цена, стоимость, скидка |
| 18 | Данные (MenuBoard) | `menu_book` | Меню = данные меню, справочник |

---

## 3. Arrivals (Электронная очередь)

### 3.1. Темы — 4 категории, 8 элементов

| Категория | Иконка категории | Элементы | Иконка элемента |
|-----------|:---:|----------|:---:|
| **Стандартные** | `build` | Текст | `text_fields` |
| | | Изображение | `photo` |
| | | Прямоугольник | `check_box_outline_blank` |
| **Контейнеры** | `grid_view` | Область | `grid_view` |
| | | Всплывающее окно | `open_in_new` |
| **Медиа** | `campaign` | Рекламный блок | `notifications` |
| **Информационные** | `analytics` | Текущее время | `schedule` |
| | | Счетчик | `analytics` |

### 3.2. Контролы — 7 категорий, 28 элементов

| Категория | Иконка категории | Элементы | Иконка элемента |
|-----------|:---:|----------|:---:|
| **Стандартные** | `build` | Текст | `text_fields` |
| | | Изображение | `photo` |
| | | Прямоугольник | `check_box_outline_blank` |
| **Данные заказа** | `receipt_long` | Номер заказа | `receipt_long` |
| | | Номер стола | `table_bar` |
| | | Статус заказа | `check_circle` |
| | | Состав заказа | `list_alt` |
| | | Количество блюд в заказе | `analytics` |
| **Время приготовления** | `schedule` | Время начала приготовления | `schedule` |
| | | Время завершения приготовления | `schedule` |
| | | Системное время приготовления | `schedule` |
| | | Время ожидания приготовления | `hourglass_full` |
| | | Признак истекшего времени ожидания | `error` |
| **Клиент** | `person` | Имя клиента | `person` |
| | | Номер телефона клиента | `call` |
| | | Комментарий от клиента | `comment` |
| **Доставка** | `local_shipping` | Имя назначенного курьера | `external-driver` |
| | | Ожидаемое время доставки | `schedule` |
| | | Ожидаемая продолжительность доставки | `schedule` |
| | | Время отправки заказа | `schedule` |
| | | Время в пути | `local_shipping` |
| | | Время доставки заказа | `schedule` |
| | | Статус доставки | `check_circle` |
| | | Время доставки от клиента | `schedule` |
| **Отмена** | `cancel` | Причина отмены заказа | `cancel` |
| | | Комментарий к отмене заказа | `comment` |
| | | Время отмены заказа | `schedule` |
| **Информационные** | `analytics` | Внешние данные | `cloud_download` |

---

## 4. Customer Screen (Экран покупателя)

### 4.1. Темы — 7 категорий, 31 элемент

| Категория | Иконка категории | Элементы | Иконка элемента |
|-----------|:---:|----------|:---:|
| **Стандартные** | `build` | Текст | `text_fields` |
| | | Изображение | `photo` |
| | | Прямоугольник | `check_box_outline_blank` |
| **Данные чека** | `point_of_sale` | Состав чека | `list_alt` |
| | | Подытог | `analytics` |
| | | Предоплата | `payments` |
| | | Скидка | `percent` |
| | | Сдача | `point_of_sale` |
| | | Сумма | `point_of_sale` |
| | | Баллы клиента | `loyalty` |
| **QR-коды** | `qr_code` | QR код | `qr_code` |
| | | QR код чаевых | `qr_code` |
| | | Оплата по QR | `qr_code` |
| | | Яндекс.Пэй QR | `qr_code` |
| | | КАСПИ QR | `qr_code` |
| **Контейнеры** | `grid_view` | Область контролов | `grid_view` |
| | | Окно анимации | `play_circle` |
| **Последнее добавленное блюдо** | `restaurant` | Аллергены | `error` |
| | | Единица измерения | `square_foot` |
| | | Изображение продукта | `photo` |
| | | Название продукта | `inventory` |
| | | Название продукта (иностр.) | `inventory` |
| | | Количество продукта | `analytics` |
| | | Описание продукта | `description` |
| | | Описание продукта (иностр.) | `description` |
| | | Пищевая ценность | `analytics` |
| | | Полное название продукта | `inventory` |
| | | Масштаб продукта | `settings` |
| | | Цена | `sell` |
| **Медиа** | `campaign` | Рекламный блок | `notifications` |
| **Информационные** | `analytics` | Текущее время | `schedule` |

### 4.2. Контролы — тип Стандартный — 3 категории, 15 элементов

| Категория | Иконка категории | Элементы | Иконка элемента |
|-----------|:---:|----------|:---:|
| **Стандартные** | `build` | Текст | `text_fields` |
| | | Изображение | `photo` |
| | | Прямоугольник | `check_box_outline_blank` |
| **Свойства продукта** | `inventory` | Название продукта | `inventory` |
| | | Название продукта (иностр.) | `inventory` |
| | | Полное название продукта | `inventory` |
| | | Описание продукта | `description` |
| | | Описание продукта (иностр.) | `description` |
| | | Цена | `sell` |
| | | Масштаб продукта | `settings` |
| | | Единица измерения | `square_foot` |
| | | Аллергены | `error` |
| | | Пищевая ценность | `analytics` |
| | | Количество продукта | `analytics` |
| **Визуализация** | `visibility` | Изображение продукта | `photo` |

### 4.3. Контролы — тип Подсказка — 3 категории, 10 элементов

| Категория | Иконка категории | Элементы | Иконка элемента |
|-----------|:---:|----------|:---:|
| **Стандартные** | `build` | Текст | `text_fields` |
| | | Изображение | `photo` |
| | | Прямоугольник | `check_box_outline_blank` |
| **Визуальные свойства** | `design_services` | Текст подсказки | `text_fields` |
| | | Изображение подсказки | `photo` |
| | | Название подсказки | `inventory` |
| | | Название блюда | `restaurant` |
| **Цены** | `sell` | Название скидки | `percent` |
| | | Размер скидки | `percent` |
| | | Цена без скидки | `point_of_sale` |
| | | Цена со скидкой | `percent` |

---

## 5. MenuBoard (Доска меню)

### 5.1. Темы — 4 категории, 7 элементов

| Категория | Иконка категории | Элементы | Иконка элемента |
|-----------|:---:|----------|:---:|
| **Стандартные** | `build` | Текст | `text_fields` |
| | | Изображение | `photo` |
| | | Прямоугольник | `check_box_outline_blank` |
| **Контейнеры** | `grid_view` | Область контролов | `grid_view` |
| **Данные** | `menu_book` | Меню-лист | `menu_book` |
| | | Динамическая область | `schedule` |
| **Информационные** | `analytics` | Текущее время | `schedule` |

### 5.2. Контролы — 7 категорий, 28 элементов

Полная копия **Arrivals Контролы** (раздел 3.2). Те же иконки.

---

## 6. Киоск (Kiosk) — Темы — 4 категории, 11 элементов

| Категория | Иконка категории | Элементы | Иконка элемента |
|-----------|:---:|----------|:---:|
| **Стандартные** | `build` | Текст | `text_fields` |
| | | Изображение | `photo` |
| | | Прямоугольник | `check_box_outline_blank` |
| **Контейнеры** | `grid_view` | Область контрола | `grid_view` |
| | | Область подсказок | `design_services` |
| **Медиа** | `campaign` | Рекламный модуль | `notifications` |
| **QR-коды** | `qr_code` | Пример QR | `qr_code` |
| | | QR для чаевых | `qr_code` |
| | | QR для оплаты | `qr_code` |
| | | Yandex.Pay QR | `qr_code` |
| | | KASPI QR | `qr_code` |

---

## 7. Служебные иконки (общие для всех продуктов)

| Назначение | Иконка | Примечание |
|------------|:---:|------------|
| Поиск (поле ввода) | `search` | Прямое совпадение — стандартная иконка поиска |
| Шеврон свёрнутой категории | `arrow_right` | Стрелка вправо — свёрнутое состояние |
| Шеврон раскрытой категории | `arrow_drop_down` | Стрелка вниз — раскрытое состояние |
| Кнопка очистки поиска (×) | `close` | Прямое совпадение — крестик |
| Кнопка закрытия панели (×) | `close` | Прямое совпадение — крестик |

> **Важно:** все служебные иконки (search, arrow_right, arrow_drop_down, close) — прямые аналоги из Material Icons.
> Никаких текстовых символов-заменителей не требуется.

---

## 8. Статистика использования

| Метрика | Значение |
|---------|:---:|
| Всего категорий (уникальных) | 18 |
| Всего элементов (по всем продуктам) | ~100 |
| Уникальных иконок Material задействовано | 42 |
| Иконок для категорий | 17 |
| Иконок для элементов | 25 |
| Служебных иконок | 4 |
| Иконок совпадают в категориях и элементах | 15 (переиспользование) |
| Всего иконок в наборе Material | 1131 |
| Не задействовано иконок | 1089 |

### Используемые иконки (42 уникальных)

`analytics`, `arrow_drop_down`, `arrow_right`, `build`, `call`, `campaign`, `cancel`, `check_box_outline_blank`, `check_circle`, `close`, `cloud_download`, `comment`, `description`, `design_services`, `error`, `external-driver`, `grid_view`, `hourglass_full`, `inventory`, `list_alt`, `local_shipping`, `loyalty`, `menu_book`, `notifications`, `open_in_new`, `payments`, `percent`, `person`, `photo`, `play_circle`, `point_of_sale`, `qr_code`, `receipt_long`, `restaurant`, `schedule`, `search`, `sell`, `settings`, `square_foot`, `table_bar`, `text_fields`, `visibility`

---

## 9. Технические детали

### Подключение шрифта Material Icons

В `src/index.html` добавлена одна строка:

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

Это тот же шрифт, который используется на портале `frontend-common.iiko.ru` для `<resto-icon>`. Иконки визуально идентичны порталу.

### Компонент MaterialIconComponent

**Файл:** `src/app/components/ui/material-icon.component.ts`

```typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-material-icon',
  standalone: true,
  template: `<span
    class="material-icons"
    [style.font-size.px]="size"
    [style.width.px]="size"
    [style.height.px]="size"
    [style.line-height.px]="size"
    role="img"
    [attr.aria-label]="name">{{ name }}</span>`,
})
export class MaterialIconComponent {
  @Input() name = '';
  @Input() size = 24;
}
```

### Использование в коде прототипа

**Файл:** `src/app/prototypes/web-screens/components/element-palette/element-palette.component.ts`

```typescript
// Импорт компонента
import { MaterialIconComponent } from '@/components/ui/material-icon.component';

// В компоненте
imports: [..., MaterialIconComponent],

// В шаблоне — Material-имена из data-файлов используются напрямую, без маппинга:
// Категория:
<app-material-icon [name]="cat.icon" [size]="18" class="category-icon"></app-material-icon>

// Элемент:
<app-material-icon [name]="el.icon" [size]="16" class="element-icon"></app-material-icon>

// Шевроны:
<app-material-icon [name]="cat.collapsed ? 'arrow_right' : 'arrow_drop_down'" [size]="16"></app-material-icon>
```

### Формат данных (TypeScript)

```typescript
interface ElementItem {
  type: string;
  label: string;
  icon: string;  // Например: 'text_fields', 'photo', 'qr_code'
}

interface ElementCategory {
  id: string;
  label: string;
  icon: string;  // Например: 'build', 'grid_view', 'analytics'
  collapsed: boolean;
  elements: ElementItem[];
}
```

### Правила

1. **Все иконки** — лигатуры Material Icons (строка-название), без неймспейсов, без маппингов
2. **Одна и та же иконка** может использоваться в разных продуктах для одинаковых по смыслу элементов
3. **При отсутствии подходящей иконки** — использовать иконку категории как fallback
4. **Источник:** полный список — https://frontend-common.iiko.ru/components/resto-icon/dynamic/icon%20list (1131 иконка)
5. **Шрифт:** Material Icons через Google Fonts CDN — тот же шрифт, что на портале `frontend-common.iiko.ru`
