# Плагины iikoFront — Гайд по стилистике и UI-паттернам

> **Назначение документа:** Справочник для Copilot / LLM при генерации экранов плагинов кассового терминала iikoFront.  
> Все новые прототипы POS-плагинов должны опираться на этот документ, чтобы сохранить единый визуальный стиль и UX-паттерны.

---

## 1. Общая концепция

### 1.1. Что такое плагин iikoFront

iikoFront — это **POS-система** (кассовый терминал ресторана). Плагины раcширяют функциональность кассы через **модальные диалоги**, вызываемые оператором. Интерфейс оптимизирован для:

- **Сенсорных экранов** (тач-терминалы) — крупные кнопки, большие области нажатия
- **Быстрой навигации** — минимум шагов, понятная иерархия
- **Тёмного окружения** — касса работает в ресторанной среде с приглушённым освещением

### 1.2. Архитектура UI: модалки, не страницы

Плагин iikoFront — это **набор модальных окон**, а не классическое SPA с навигацией. Пользователь:

1. Нажимает кнопку плагина на кассе → открывается **первый диалог**
2. Заполняет/выбирает данные → система показывает **следующий диалог**
3. Завершает операцию → диалог **успеха** → возврат к кассе

```
┌───────────────────────────────────────────────────────┐
│                   iikoFront (касса)                     │
│                                                         │
│   ┌─────────────────────────────────────────────┐      │
│   │           МОДАЛЬНЫЙ ДИАЛОГ ПЛАГИНА           │      │
│   │                                              │      │
│   │   ┌────────────────────────────────────┐    │      │
│   │   │        HEADER (заголовок)           │    │      │
│   │   ├────────────────────────────────────┤    │      │
│   │   │        BODY (контент)               │    │      │
│   │   │        - формы / данные / инфо      │    │      │
│   │   ├────────────────────────────────────┤    │      │
│   │   │        FOOTER (кнопки действий)     │    │      │
│   │   └────────────────────────────────────┘    │      │
│   │                                              │      │
│   └─────────────────────────────────────────────┘      │
│                                                         │
└───────────────────────────────────────────────────────┘
```

### 1.3. Навигация между диалогами

Модалки **не маршрутизируются** через URL. Переключение — через state-машину:

```typescript
type ModalType = 'search' | 'found' | 'not-found' | 'blocked' |
  'payment' | 'accumulate' | 'success' | 'loading' |
  'error' | 'registration' | null;

activeModal: ModalType = null;

openDialog(type: ModalType): void {
  this.activeModal = type;
}
```

Каждый диалог принимает `[open]="activeModal === 'тип'"` и `(onClose)="activeModal = null"`.

---

## 2. Цветовая палитра

### 2.1. POS-тема (тёмная) — основная

Интерфейс POS-терминала строится на **четырёх уровнях тёмно-серого** с жёлто-зелёным акцентом.

| Токен | HEX / Tailwind | Применение |
|-------|---------------|------------|
| **Фон модалки** | `bg-[#3a3a3a]` | Основной фон DialogContent |
| **Фон секций** | `bg-[#2d2d2d]` | Блоки итого, вторичные секции |
| **Фон кнопок** | `bg-[#1a1a1a]` | Все standard-кнопки |
| **Hover кнопок** | `hover:bg-[#252525]` | Состояние наведения |
| **Акцент (лайм)** | `#b8c959` | Заголовки, бонусы, суммы, акцентные блоки |
| **Hover акцента** | `hover:bg-[#c5d466]` | Hover на акцентных кнопках |
| **Основной текст** | `text-white` | Весь текст на тёмном фоне |
| **Вторичный текст** | `text-gray-300` | Подзаголовки, labels |
| **Третичный текст** | `text-gray-400` | Подписи, ghost-кнопки |
| **Текст на белом фоне** | `text-gray-600` | Labels внутри белых карточек |
| **Overlay** | `bg-black/50` | Затемнение под модалкой |
| **Разделители** | `bg-gray-600` | Горизонтальные линии (`h-px`) |

```
Формула 4 уровней серого:
#1a1a1a (кнопки) → #252525 (hover) → #2d2d2d (секции) → #3a3a3a (фон модалки)
```

### 2.2. POS-тема (светлая) — для служебных диалогов

Используется для Loading и Error-диалогов, где тёмная тема не нужна.

| Токен | Tailwind | Применение |
|-------|----------|------------|
| Фон модалки | `bg-white` | DialogContent |
| Основной текст | `text-gray-900` | Заголовки |
| Вторичный текст | `text-gray-500` | Описания |
| Фон кнопки primary | `bg-gray-900 text-white` | Основное действие |
| Фон кнопки outline | `border border-gray-300` | Отмена |

### 2.3. Статусные цвета

| Статус | Цвет иконки | Фон круга | Пример |
|--------|------------|-----------|--------|
| Успех | `text-[#b8c959]` | `bg-[#b8c959]/20` | Оплата прошла |
| Предупреждение | `text-orange-400` | `bg-orange-500/20` | Клиент не найден, ошибка сети |
| Ошибка / блокировка | `text-red-400` | `bg-red-500/20` | Карта заблокирована |
| Загрузка | `text-gray-400` | — | Спиннер |

### 2.4. Акцентные блоки (highlight)

```html
<!-- Блок бонусов / акцентная карточка -->
<div class="bg-[#b8c959]/20 border border-[#b8c959] text-white p-5 rounded">
  ...
</div>

<!-- Предупреждение (оранжевое) -->
<div class="bg-orange-500/20 border border-orange-500/40 rounded p-4">
  <lucide-icon name="info" [size]="20" class="text-orange-400"></lucide-icon>
  ...
</div>
```

---

## 3. Типографика

### 3.1. Шрифт

Шрифт: **Roboto** (наследуется из Angular-проекта). На POS-терминалах текст крупнее обычного для удобства чтения с расстояния.

### 3.2. Иерархия текстов

| Уровень | Классы | Размер | Контекст |
|---------|--------|--------|----------|
| Заголовок модалки | `text-2xl font-normal text-[#b8c959] text-center` | 24px | «Премиум бонус», «Оплата заказа» |
| Подзаголовок | `text-base text-center text-gray-300` | 14px | Инструкция под заголовком |
| Заголовок секции | `text-lg font-semibold text-white` | 16px | «Баланс бонусов», «Итого» |
| Label формы | `text-sm text-gray-300` | 12px | Подписи к полям |
| Body-текст | `text-sm text-gray-300` | 12px | Описания, пояснения |
| Крупное число | `text-3xl font-bold text-[#b8c959]` | 30px | Баланс бонусов: «1 250 ₽» |
| Число итого | `text-xl font-bold` | 20px | Итого к оплате |
| Мета-текст | `text-xs text-gray-400` | 11px | Подсказки, примечания |
| Числа на numpad | `text-2xl` | 24px | Цифровая клавиатура |

### 3.3. Выравнивание

- **Заголовки модалок** — всегда `text-center`
- **Labels и значения** — `text-left`, если парами используй `flex justify-between`
- **Числа/суммы** — `text-right` или `font-bold` для акцента

---

## 4. Размеры и Spacing

### 4.1. Размеры модалок

| Размер | Tailwind | Пиксели | Контекст |
|--------|----------|---------|----------|
| SM | `max-w-[350px]` | 350px | Loading, простые ошибки |
| MD | `max-w-[500px]` | 500px | Стандарт: поиск, найден, оплата, успех |
| LG | `max-w-[600px]` | 600px | Расширенная оплата, формы |
| XL | `max-w-[700px]` | 700px | Регистрация (2 колонки) |

### 4.2. Высоты интерактивных элементов

| Элемент | Высота | Tailwind | Пояснение |
|---------|--------|----------|-----------|
| Кнопки footer | **56px** | `h-14` | Большие, для тач-экранов |
| Кнопки numpad | **64px** | `h-16` | Цифровая клавиатура |
| Input-поля POS | **48px** | `h-12` | Увеличенные для тач |
| Accent input (поиск) | **56px** | `h-14` | Основное поле ввода |

### 4.3. Padding и Spacing

| Контекст | Значение | Tailwind |
|----------|----------|----------|
| Padding модалки | 32px | `p-8` |
| Gap между секциями | 24px | `space-y-6` |
| Gap внутри секции | 20px | `space-y-5` / `mb-5` |
| Gap между кнопками | 12px | `gap-3` |
| Gap в grid карточек | 16px | `gap-4` |
| Gap в numpad | 8px | `gap-2` |
| Padding карточки данных | 16–20px | `p-4` / `p-5` |

### 4.4. Border-radius

| Элемент | Tailwind | Пиксели |
|---------|----------|---------|
| Модалка | `rounded-lg` | 8px |
| Кнопки | `rounded` | 4px |
| Карточки данных | `rounded` | 4px |
| Input-поля | `rounded` | 4px |
| Иконка в круге | `rounded-full` | 50% |

---

## 5. Компоненты и паттерны

### 5.1. POS-Dialog — базовая обёртка модалки

Все POS-модалки используют **кастомный** `PosDialogComponent` (не `UiModal`):

```html
<!-- Обёртка — overlay + контейнер -->
<div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black/50" (click)="onOverlayClick()"></div>
  <!-- Контент модалки -->
  <div class="relative bg-[#3a3a3a] rounded-lg text-white p-8 animate-scale-in w-full mx-4"
       [ngClass]="maxWidthClass">
    <ng-content></ng-content>
  </div>
</div>
```

**Функции:**
- Закрытие по Escape (HostListener)
- Закрытие по клику на overlay (отключается через `[closable]="false"`)
- 4 размера: `sm` / `md` (default) / `lg` / `xl`
- Анимации: `animate-fade-in` (overlay) + `animate-scale-in` (контент)

### 5.2. Заголовок модалки

```html
<!-- Стандартный заголовок POS-диалога -->
<h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">
  Название диалога
</h2>
<p class="text-base text-center text-gray-300 mb-6">
  Инструкция для оператора
</p>
```

### 5.3. Кнопки POS — стандартная пара (Footer)

```html
<div class="grid grid-cols-2 gap-3">
  <!-- Отмена -->
  <button (click)="onClose.emit()"
    class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
    Отмена
  </button>
  <!-- Действие -->
  <button (click)="onConfirm()"
    class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors">
    Подтвердить
  </button>
</div>
```

### 5.4. Кнопка акцентная (важное действие)

```html
<button (click)="onPay()"
  class="h-14 bg-[#b8c959] text-black rounded text-base font-bold hover:bg-[#c5d466] transition-colors w-full">
  К оплате {{ finalAmount | number:'1.0-0' }} ₽
</button>
```

### 5.5. Кнопки в несколько колонок (3–5 кнопок)

```html
<!-- 5 кнопок в ряд (регистрация) -->
<div class="grid grid-cols-5 gap-2">
  <button class="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525] rounded">Начислить</button>
  <button class="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525] rounded">Списать</button>
  <button class="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525] rounded">Отвязать карту</button>
  <button class="h-12 text-sm bg-[#1a1a1a] text-white hover:bg-[#252525] rounded">Отмена</button>
  <button class="h-12 text-sm bg-[#b8c959] text-black hover:bg-[#c5d466] rounded font-bold">Сохранить</button>
</div>
```

### 5.6. Кнопки вертикальные (одна колонка)

```html
<!-- 3 кнопки вертикально (не найден) -->
<div class="space-y-3">
  <button class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded">
    Закрыть без клиента
  </button>
  <button class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded">
    Найти другого клиента
  </button>
  <button class="w-full h-14 bg-transparent text-gray-400 hover:text-white rounded transition-colors">
    Отмена
  </button>
</div>
```

### 5.7. Input-поля POS

```html
<!-- Стандарт: белый на тёмном фоне -->
<input type="text"
  class="w-full h-12 bg-white text-black rounded px-3 outline-none placeholder:text-gray-500"
  placeholder="Введите значение" />

<!-- Акцентный (активное поле поиска) -->
<input type="text" readonly
  class="w-full h-14 text-lg bg-[#b8c959]/20 border border-[#b8c959] text-white rounded px-4 outline-none"
  placeholder="Введите номер" />

<!-- С label -->
<div class="space-y-1">
  <label class="text-sm text-gray-300">Название поля</label>
  <input class="w-full h-12 bg-white text-black rounded px-3 outline-none" />
</div>
```

### 5.8. Цифровая клавиатура (Numpad)

```html
<div class="grid grid-cols-3 gap-2">
  <button *ngFor="let key of numpadKeys"
    class="h-16 rounded text-2xl font-medium transition-colors"
    [ngClass]="{
      'bg-white text-black hover:bg-gray-100': key !== '←' && key !== '✕',
      'bg-gray-200 text-gray-600 hover:bg-gray-300': key === '←' || key === '✕'
    }"
    (click)="onNumpadPress(key)">
    {{ key }}
  </button>
</div>
```

Порядок клавиш: `['1','2','3','4','5','6','7','8','9','←','0','✕']`  
`←` — удалить последний символ, `✕` — очистить всё.

### 5.9. Карточка данных (белая на тёмном фоне)

```html
<!-- Информационная карточка -->
<div class="bg-white text-black p-4 rounded">
  <p class="text-sm text-gray-600 mb-1">Программа лояльности</p>
  <p class="text-base font-medium">Премиум бонус</p>
</div>

<!-- Сетка карточек 2×2 -->
<div class="grid grid-cols-2 gap-3">
  <div class="bg-white text-black p-4 rounded">...</div>
  <div class="bg-white text-black p-4 rounded">...</div>
  <div class="bg-white text-black p-4 rounded">...</div>
  <div class="bg-white text-black p-4 rounded">...</div>
</div>
```

### 5.10. Блок итого (тёмная секция)

```html
<div class="space-y-2 rounded bg-[#2d2d2d] p-4">
  <div class="flex justify-between text-base">
    <span class="text-gray-300">Сумма заказа:</span>
    <span class="font-semibold">2 500 ₽</span>
  </div>
  <div class="flex justify-between text-base text-red-400">
    <span>Списание бонусов:</span>
    <span class="font-semibold">-300 ₽</span>
  </div>
  <div class="h-px bg-gray-600 my-2"></div>
  <div class="flex justify-between text-xl font-bold">
    <span>Итого к оплате:</span>
    <span class="text-[#b8c959]">2 200 ₽</span>
  </div>
</div>
```

### 5.11. Иконка-индикатор в круге (статус)

```html
<!-- Успех: жёлто-зелёный -->
<div class="rounded-full bg-[#b8c959]/20 p-6 mx-auto w-fit">
  <lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959]"></lucide-icon>
</div>

<!-- Предупреждение: оранжевый -->
<div class="rounded-full bg-orange-500/20 p-6 mx-auto w-fit">
  <lucide-icon name="alert-circle" [size]="48" class="text-orange-400"></lucide-icon>
</div>

<!-- Ошибка: красный -->
<div class="rounded-full bg-red-500/20 p-6 mx-auto w-fit">
  <lucide-icon name="shield-alert" [size]="48" class="text-red-400"></lucide-icon>
</div>

<!-- Загрузка: серый + спиннер -->
<lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
```

### 5.12. Info-баннер (предупреждение)

```html
<div class="flex gap-3 bg-orange-500/20 border border-orange-500/40 rounded p-4">
  <lucide-icon name="info" [size]="20" class="shrink-0 text-orange-400 mt-0.5"></lucide-icon>
  <div>
    <p class="text-sm text-white font-medium mb-1">Заголовок предупреждения</p>
    <p class="text-sm text-gray-300">Описание ситуации и что делать.</p>
  </div>
</div>
```

### 5.13. Форма в 2 колонки (регистрация)

```html
<div class="grid grid-cols-2 gap-x-6 gap-y-4">
  <!-- Поле -->
  <div class="space-y-1">
    <label class="text-sm text-gray-300">Телефон *</label>
    <input class="w-full h-12 bg-white text-black rounded px-3 outline-none" />
  </div>
  <!-- Поле на 2 колонки -->
  <div class="col-span-2 space-y-1">
    <label class="text-sm text-gray-300">Email</label>
    <input class="w-full h-12 bg-white text-black rounded px-3 outline-none" />
  </div>
  <!-- Select (нативный) -->
  <div class="space-y-1">
    <label class="text-sm text-gray-300">Пол</label>
    <select class="w-full h-12 bg-white text-black rounded px-3 outline-none">
      <option>Мужской</option>
      <option>Женский</option>
    </select>
  </div>
</div>
```

---

## 6. Типы модальных окон

### 6.1. Каталог стандартных диалогов

| Тип | Размер | Тема | Описание |
|-----|--------|------|----------|
| **Поиск** | MD (500px) | Тёмная | Ввод через numpad, выбор типа поиска |
| **Найдено** | MD (500px) | Тёмная | Данные клиента, карточки 2×2, баланс |
| **Не найдено** | MD (500px) | Тёмная | Иконка-статус, вертикальные кнопки |
| **Заблокировано** | MD (500px) | Тёмная | Иконка ошибки, 2 кнопки |
| **Оплата** | MD (500px) | Тёмная | Промокод, бонусы, блок итого |
| **Только накопление** | MD (500px) | Тёмная | Info-баннер, итого (без списания) |
| **Регистрация** | XL (700px) | Тёмная | Форма 2 колонки, 5+ кнопок |
| **Успех** | MD (500px) | Тёмная | Иконка + анимация, итоги, 1 кнопка |
| **Загрузка** | SM (350px) | Светлая | Спиннер, без кнопок, без крестика |
| **Ошибка** | MD (500px) | Светлая | Иконка, описание, «Повторить» |
| **Ошибка сети** | MD (500px) | Тёмная | Как ошибка, но в POS-теме |

### 6.2. Структура диалога — Header / Body / Footer

Каждый POS-диалог имеет чёткое деление на три зоны:

```
┌────────────────────────────────────────┐
│  HEADER                                │
│  Заголовок (text-2xl, #b8c959)         │
│  Подзаголовок (text-base, gray-300)    │
│                                  mb-6  │
├────────────────────────────────────────┤
│  BODY                                  │
│  - Инпуты / numpad / карточки          │
│  - Информационные блоки                │
│  - Баланс / итого                      │
│                             space-y-5  │
├────────────────────────────────────────┤
│  FOOTER                               │
│  grid grid-cols-2 gap-3               │
│  [Отмена]           [Действие]         │
│                           h-14 каждая  │
└────────────────────────────────────────┘
```

### 6.3. Паттерн «иконка-статус» (центрированный)

Для диалогов без формы (не найден, заблокирован, успех, ошибка):

```html
<div class="flex flex-col items-center text-center space-y-4">
  <!-- Иконка в круге -->
  <div class="rounded-full bg-COLOR/20 p-6">
    <lucide-icon name="ICON" [size]="48" class="text-COLOR"></lucide-icon>
  </div>
  <!-- Заголовок -->
  <h2 class="text-2xl font-semibold text-COLOR">Заголовок</h2>
  <!-- Описание -->
  <p class="text-sm text-gray-300">Описание ситуации...</p>
</div>
```

---

## 7. Иконки (Lucide)

### 7.1. Иконки по контексту

| Иконка | Контекст | Размер |
|--------|----------|--------|
| `credit-card` | Плагин лояльности, карта | 20–24 |
| `search` | Поиск клиента | 20 |
| `check-circle-2` | Клиент найден, успех | 48 (статус) / 20 (inline) |
| `alert-circle` | Клиент не найден | 48 |
| `shield-alert` | Карта заблокирована | 48 |
| `wallet` | Оплата | 20–24 |
| `info` | Информационный баннер | 20 |
| `wifi-off` | Ошибка сети | 48 |
| `loader-2` | Загрузка | 48, с `animate-spin` |
| `user` | Регистрация, профиль | 20 |

### 7.2. Использование в Angular

```typescript
// Импорт в компоненте
import { IconsModule } from '@/shared/icons.module';

// В template
<lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959]"></lucide-icon>
<lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
```

### 7.3. Регистрация новых иконок

Если для нового плагина нужны дополнительные иконки:

```typescript
// src/app/shared/icons.module.ts
import { NewIcon } from 'lucide-angular';
const icons = { ...existing, NewIcon };
```

---

## 8. Анимации

| Анимация | Класс | Контекст |
|----------|-------|----------|
| Появление overlay | `animate-fade-in` | Открытие модалки (0.2s ease-out) |
| Появление контента | `animate-scale-in` | Контент модалки (scale 0.95→1, 0.2s) |
| Спиннер | `animate-spin` | `loader-2` при загрузке |
| Пульсация | `animate-pulse` | Иконка успеха |
| Slide-up | `animate-slide-up` | Toast-уведомления (0.25s) |

---

## 9. Состояния и взаимодействия

### 9.1. Состояния кнопок

| Роль | Обычная | Hover | Disabled |
|------|---------|-------|----------|
| Standard (тёмная) | `bg-[#1a1a1a] text-white` | `bg-[#252525]` | `opacity-50 cursor-not-allowed` |
| Accent (подтверждение) | `bg-[#b8c959] text-black font-bold` | `bg-[#c5d466]` | `opacity-50` |
| Ghost (отмена) | `bg-transparent text-gray-400` | `text-white` | — |

### 9.2. Состояния input-полей

| Состояние | Стили |
|-----------|-------|
| Обычное | `bg-white text-black rounded px-3` |
| Focus | `outline-none` (нет видимого ring — POS!) |
| Accent (активный поиск) | `bg-[#b8c959]/20 border border-[#b8c959] text-white` |
| Disabled | `opacity-50 bg-gray-100` |

### 9.3. Авто-действия (автоматическое закрытие)

```typescript
// Loading → автозакрытие через 3 секунды
openDialog(type: ModalType): void {
  this.activeModal = type;
  if (type === 'loading') {
    setTimeout(() => { this.activeModal = null; }, 3000);
  }
}
```

### 9.4. Защита от случайного закрытия

- Loading-диалог: `closable="false"` — нет крестика, нельзя закрыть по overlay
- Формы: можно закрыть по overlay или Escape (пользователь осознанно отменяет)

---

## 10. Архитектура Angular-компонента

### 10.1. Шаблон файла диалога

```typescript
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { PosDialogComponent } from './pos-dialog.component';

@Component({
  selector: 'app-my-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, PosDialogComponent],
  template: `
    <pos-dialog [open]="open" maxWidth="md" (dialogClose)="onClose.emit()">
      <!-- HEADER -->
      <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">Заголовок</h2>
      <p class="text-base text-center text-gray-300 mb-6">Подзаголовок</p>

      <!-- BODY -->
      <div class="space-y-5 mb-6">
        <!-- Контент диалога -->
      </div>

      <!-- FOOTER -->
      <div class="grid grid-cols-2 gap-3">
        <button (click)="onClose.emit()"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors">
          Отмена
        </button>
        <button (click)="onConfirm()"
          class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors">
          Действие
        </button>
      </div>
    </pos-dialog>
  `,
})
export class MyDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();

  onConfirm(): void {
    // логика
    this.onClose.emit();
  }
}
```

### 10.2. Шаблон файла экрана-каталога (для обзора плагина)

```typescript
@Component({
  selector: 'app-plugin-overview',
  standalone: true,
  imports: [CommonModule, UiCardComponent, UiBadgeComponent, UiBreadcrumbsComponent, IconsModule,
            MySearchDialog, MyFoundDialog, /* ...все диалоги... */],
  template: `
    <!-- Breadcrumbs -->
    <ui-breadcrumbs [items]="breadcrumbs" class="mb-4"></ui-breadcrumbs>

    <!-- Сетка диалогов -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ui-card *ngFor="let dialog of dialogs" hoverable (click)="openDialog(dialog.type)">
        <div class="p-4 flex items-center gap-3">
          <lucide-icon [name]="dialog.icon" [size]="24" class="text-iiko-primary"></lucide-icon>
          <div>
            <p class="font-medium">{{ dialog.label }}</p>
            <p class="text-sm text-text-secondary">{{ dialog.description }}</p>
          </div>
        </div>
      </ui-card>
    </div>

    <!-- Рендер всех модалок -->
    <app-my-search-dialog [open]="activeModal === 'search'" (onClose)="activeModal = null" />
    <app-my-found-dialog  [open]="activeModal === 'found'"  (onClose)="activeModal = null" />
    <!-- ...остальные... -->
  `,
})
export class PluginOverviewComponent {
  activeModal: string | null = null;

  openDialog(type: string): void {
    this.activeModal = type;
  }
}
```

### 10.3. PosDialogComponent (переиспользуемый)

Компонент `PosDialogComponent` уже создан в `src/app/prototypes/iiko-front-plugins/components/pos-dialog.component.ts` и может быть скопирован / импортирован в новые прототипы плагинов. Его функциональность:

- `@Input() open: boolean` — видимость
- `@Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl'` — размер
- `@Input() closable: boolean` — можно ли закрыть по overlay/Escape
- `@Output() dialogClose` — событие закрытия
- `<ng-content>` — проекция контента

---

## 11. Мок-данные

### 11.1. Структура CustomerData

```typescript
interface CustomerData {
  full_name: string;        // «Иванов Иван Иванович»
  phone: string;            // «+7 (999) 123-45-67»
  card_code: string;        // «1234 5678 9012»
  birth_date: string;       // «15.03.1990»
  program_name: string;     // «Премиум бонус»
  status_name: string;      // «Золотой»
  discount_percent: number; // 10
  bonus_percent: number;    // 5
  bonus_balance: number;    // 1250
  max_bonus_out: number;    // 800
}
```

### 11.2. Валюта и форматирование

- Валюта: **₽** (российский рубль)
- Формат чисел: `{{ value | number:'1.0-0' }}` → `1 250`
- Формат телефона: `+7 (999) 123-45-67`
- Формат карты: `1234 5678 9012`

### 11.3. Контекст бизнес-данных

Данные должны отражать **ресторанный бизнес** (iiko):
- Программы лояльности, бонусные карты, скидки
- Суммы заказов (500–10 000 ₽)
- Бонусные балансы (0–5 000 ₽)
- Промокоды (алфавитно-цифровые)

---

## 12. Шаблон промта для нового плагина

При создании нового прототипа POS-плагина используй следующий шаблон промта:

```
Создай прототип плагина "[Название]" для кассового терминала iikoFront.

Стилистика:
- Опирайся на STYLE_GUIDE.md (materials/Плагины iikoFront/)
- Тёмная POS-тема: bg-[#3a3a3a], кнопки bg-[#1a1a1a], акцент #b8c959
- Все модалки через PosDialogComponent (тёмная обёртка)
- Крупные элементы для тач-экранов: кнопки h-14, инпуты h-12
- Типографика: заголовки text-2xl text-[#b8c959], body text-sm text-gray-300

Диалоги плагина:
- [Диалог 1]: Описание (размер SM/MD/LG/XL)
- [Диалог 2]: Описание
- ...

UI-паттерны:
- Цифровая клавиатура (если нужен ввод чисел)
- Карточки данных bg-white на тёмном фоне
- Блок итого bg-[#2d2d2d]
- Акцентные блоки bg-[#b8c959]/20 border border-[#b8c959]
- Info-баннеры bg-orange-500/20

Навигация:
- State-машина activeModal
- Loading-диалог с автозакрытием (3 сек)
- Success-диалог с кнопкой «Готово»
- Error-диалог с кнопкой «Повторить»

Компоненты:
- PosDialogComponent (обёртка модалки)
- Lucide-иконки через IconsModule
- Мок-данные в data/mock-data.ts
- Типы в types.ts
```

---

## 13. Чеклист нового POS-плагина

### Структура

- [ ] Папка `src/app/prototypes/<slug>/` создана
- [ ] Файл маршрутов `<slug>.routes.ts`
- [ ] Корневой компонент `<name>-prototype.component.ts`
- [ ] Типы `types.ts`
- [ ] Мок-данные `data/mock-data.ts`
- [ ] `PosDialogComponent` скопирован или импортирован
- [ ] Зарегистрирован в `app.routes.ts`
- [ ] Зарегистрирован в `prototypes.registry.ts`

### Каждый диалог

- [ ] Standalone-компонент с `@Input() open` и `@Output() onClose`
- [ ] Обёрнут в `<pos-dialog>`
- [ ] Правильный размер (`sm` / `md` / `lg` / `xl`)
- [ ] Заголовок: `text-2xl text-[#b8c959] text-center`
- [ ] Кнопки footer: `h-14 bg-[#1a1a1a]`, `grid grid-cols-2 gap-3`
- [ ] Анимации: `animate-fade-in` + `animate-scale-in`

### Интерактивность

- [ ] Все кнопки кликабельны — переключают `activeModal`
- [ ] Формы работают (двусторонняя привязка)
- [ ] Loading-диалог автозакрывается через 3 сек
- [ ] Escape закрывает модалку
- [ ] Overlay-клик закрывает модалку

### Стиль

- [ ] Тёмная POS-тема: `bg-[#3a3a3a]`, `text-white`
- [ ] Кнопки: `h-14 bg-[#1a1a1a]`
- [ ] Инпуты: `h-12 bg-white text-black`
- [ ] Акцент `#b8c959` для заголовков и ключевых чисел
- [ ] Карточки данных: `bg-white text-black p-4 rounded`
- [ ] Блок итого: `bg-[#2d2d2d]`
- [ ] Иконки-статусы в кругах (`rounded-full bg-COLOR/20`)

---

## 14. Отличия от iikoWeb

| Аспект | iikoFront (POS-плагин) | iikoWeb |
|--------|----------------------|---------|
| **Тема** | Тёмная (`#3a3a3a`) | Светлая (`bg-white`, `bg-gray-50`) |
| **Layout** | Модальные диалоги | Sidebar + Header + Content |
| **Навигация** | State-машина `activeModal` | Angular Router |
| **Кнопки** | Крупные `h-14`, тёмные | Стандартные `h-9`, цветные |
| **Инпуты** | `h-12`, белые на тёмном | `h-9`, с бордером |
| **Акцент** | `#b8c959` (жёлто-зелёный) | `#1976D2` (синий) |
| **Целевое устройство** | Сенсорный терминал | Десктоп с мышью |
| **UI-компоненты** | Кастомный `PosDialogComponent` | `UiModal`, `UiCard`, `UiTable`... |
| **Numpad** | Да (цифровая клавиатура) | Нет |
