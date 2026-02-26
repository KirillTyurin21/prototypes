# Плагин Kilbil для iikoFront — Гайд по стилистике и UI-паттернам

> **Назначение документа:** Полный справочник для Copilot / LLM при генерации прототипа POS-плагина **Kilbil** программы лояльности для кассового терминала iikoFront.  
> Документ содержит все визуальные спецификации, код-примеры компонентов и архитектуру, необходимые для точного воспроизведения стиля без доступа к исходному проекту.

---

## 1. Общая концепция

### 1.1. Что такое плагин Kilbil

**Kilbil** — это плагин программы лояльности для POS-системы **iikoFront** (кассовый терминал ресторана). Плагин позволяет кассиру:

- **Искать клиента** по номеру телефона или карте лояльности
- **Просматривать данные** клиента (баланс бонусов, статус, скидки)
- **Применять бонусы** при оплате заказа (списание / накопление)
- **Регистрировать** нового клиента в программе лояльности
- **Обрабатывать ошибки** (клиент не найден, карта заблокирована, ошибка сети)

Интерфейс оптимизирован для:

- **Сенсорных экранов** (тач-терминалы) — крупные кнопки, большие области нажатия
- **Быстрой навигации** — минимум шагов, понятная иерархия
- **Тёмного окружения** — касса работает в ресторанной среде с приглушённым освещением

### 1.2. Архитектура UI: модальные окна, не страницы

Плагин iikoFront — это **набор модальных окон** (диалогов), а не классическое SPA с роутингом. Пользователь:

1. Нажимает кнопку плагина на кассе → открывается **первый диалог** (Поиск клиента)
2. Заполняет / выбирает данные → система показывает **следующий диалог** (Клиент найден / Не найден)
3. Выполняет действие (оплата, регистрация) → диалог **Успех** → возврат к кассе

```
┌──────────────────────────────────────────────────────────┐
│                    iikoFront (касса)                       │
│                                                            │
│   ┌──────────────────────────────────────────────┐        │
│   │         МОДАЛЬНЫЙ ДИАЛОГ ПЛАГИНА KILBIL       │        │
│   │                                               │        │
│   │   ┌─────────────────────────────────────┐    │        │
│   │   │         HEADER (заголовок)            │    │        │
│   │   ├─────────────────────────────────────┤    │        │
│   │   │         BODY (контент)                │    │        │
│   │   │         - формы / данные / инфо       │    │        │
│   │   ├─────────────────────────────────────┤    │        │
│   │   │         FOOTER (кнопки действий)      │    │        │
│   │   └─────────────────────────────────────┘    │        │
│   │                                               │        │
│   └──────────────────────────────────────────────┘        │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### 1.3. Навигация между диалогами (State-машина)

Модалки **не маршрутизируются** через URL. Переключение — через state-переменную:

```typescript
// Все возможные типы модальных окон плагина Kilbil
type ModalType =
  | 'search'         // Поиск клиента (numpad + переключатель телефон/карта)
  | 'found'          // Клиент найден (данные + бонусы)
  | 'not-found'      // Клиент не найден (иконка-статус + действия)
  | 'blocked'        // Карта заблокирована (иконка ошибки + действия)
  | 'payment'        // Оплата заказа (промокод + бонусы + итого)
  | 'accumulate'     // Только накопление (info-баннер + итого)
  | 'registration'   // Регистрация клиента (форма 2 колонки)
  | 'success'        // Успешная оплата (иконка + итоги)
  | 'loading'        // Загрузка (спиннер, без кнопок)
  | 'error'          // Ошибка (светлая тема)
  | 'network-error'  // Ошибка сети (тёмная POS-тема)
  | null;            // Все закрыты

// В компоненте:
activeModal: ModalType = null;

openDialog(type: ModalType): void {
  this.activeModal = type;
  // Loading — автозакрытие через 3 секунды
  if (type === 'loading') {
    setTimeout(() => { this.activeModal = null; }, 3000);
  }
}

closeDialog(): void {
  this.activeModal = null;
}
```

Каждый диалог принимает `[open]="activeModal === 'тип'"` и `(onClose)="closeDialog()"`.

### 1.4. Флоу (типичные сценарии)

```
Сценарий 1: Успешная оплата с бонусами
  search → loading → found → payment → loading → success

Сценарий 2: Клиент не найден → регистрация
  search → loading → not-found → registration → loading → success

Сценарий 3: Карта заблокирована
  search → loading → blocked → (закрыть или искать другого)

Сценарий 4: Только накопление (незавершённая регистрация)
  search → loading → found → accumulate → loading → success

Сценарий 5: Ошибка сети
  search → loading → network-error → (повторить или закрыть)
```

---

## 2. Цветовая палитра

### 2.1. POS-тема (тёмная) — основная

Интерфейс POS-терминала строится на **четырёх уровнях тёмно-серого** с жёлто-зелёным акцентом.

| Токен | CSS / Tailwind | Применение |
|-------|----------------|------------|
| **Фон модалки** | `background: #3a3a3a` / `bg-[#3a3a3a]` | Основной фон содержимого диалога |
| **Фон секций** | `background: #2d2d2d` / `bg-[#2d2d2d]` | Блоки «итого», вторичные секции |
| **Фон кнопок** | `background: #1a1a1a` / `bg-[#1a1a1a]` | Все стандартные кнопки |
| **Hover кнопок** | `background: #252525` / `hover:bg-[#252525]` | Состояние наведения/нажатия |
| **Акцент (лайм)** | `color: #b8c959` | Заголовки, бонусы, суммы, акцентные блоки |
| **Hover акцента** | `background: #c5d466` / `hover:bg-[#c5d466]` | Hover на акцентных кнопках |
| **Основной текст** | `color: white` / `text-white` | Весь текст на тёмном фоне |
| **Вторичный текст** | `color: #d1d5db` / `text-gray-300` | Подзаголовки, labels |
| **Третичный текст** | `color: #9ca3af` / `text-gray-400` | Подписи, ghost-кнопки |
| **Текст на белом** | `color: #4b5563` / `text-gray-600` | Labels внутри белых карточек |
| **Overlay** | `background: rgba(0,0,0,0.5)` / `bg-black/50` | Затемнение под модалкой |
| **Разделители** | `background: #4b5563` / `bg-gray-600` | Горизонтальные линии (`height: 1px`) |

```
Формула 4 уровней серого:
#1a1a1a (кнопки) → #252525 (hover) → #2d2d2d (секции) → #3a3a3a (фон модалки)
```

### 2.2. POS-тема (светлая) — для служебных диалогов

Используется **только** для Loading и Error диалогов.

| Токен | CSS / Tailwind | Применение |
|-------|----------------|------------|
| Фон модалки | `background: white` / `bg-white` | Фон содержимого |
| Основной текст | `color: #111827` / `text-gray-900` | Заголовки |
| Вторичный текст | `color: #6b7280` / `text-gray-500` | Описания |
| Кнопка primary | `background: #111827; color: white` / `bg-gray-900 text-white` | Основное действие |
| Кнопка outline | `border: 1px solid #d1d5db` / `border border-gray-300` | Отмена |

### 2.3. Статусные цвета

| Статус | Цвет иконки | Фон круга | Пример использования |
|--------|-------------|-----------|----------------------|
| **Успех** | `color: #b8c959` / `text-[#b8c959]` | `bg-[#b8c959]/20` | Оплата прошла, клиент найден |
| **Предупреждение** | `color: #fb923c` / `text-orange-400` | `bg-orange-500/20` | Клиент не найден |
| **Ошибка / Блокировка** | `color: #f87171` / `text-red-400` | `bg-red-500/20` | Карта заблокирована |
| **Загрузка** | `color: #3b82f6` / `text-blue-500` | — | Спиннер |

### 2.4. Акцентные блоки

```html
<!-- Блок бонусов (акцентная карточка) -->
<div style="background: rgba(184,201,89,0.2); border: 1px solid #b8c959; color: white; padding: 20px; border-radius: 4px;">
  <!-- Tailwind: bg-[#b8c959]/20 border border-[#b8c959] text-white p-5 rounded -->
  ...
</div>

<!-- Предупреждение (оранжевое) -->
<div style="background: rgba(249,115,22,0.2); border: 1px solid rgba(249,115,22,0.4); border-radius: 4px; padding: 16px;">
  <!-- Tailwind: bg-orange-500/20 border border-orange-500/40 rounded p-4 -->
  <icon name="info" size="20" style="color: #fb923c;"></icon>
  <span>Текст предупреждения</span>
</div>
```

---

## 3. Типографика

### 3.1. Шрифт

Шрифт: **Roboto** (Google Fonts). На POS-терминалах текст крупнее обычного для удобства чтения с расстояния.

```css
font-family: 'Roboto', sans-serif;
```

### 3.2. Иерархия текстов

| Уровень | CSS | Размер | Tailwind | Контекст |
|---------|-----|--------|----------|----------|
| Заголовок модалки | `font-size: 24px; font-weight: 700; color: #b8c959; text-align: center` | 24px | `text-2xl font-bold text-[#b8c959] text-center` | «Kilbil», «Оплата заказа» |
| Подзаголовок | `font-size: 14px; text-align: center; color: #d1d5db` | 14px | `text-sm text-center text-gray-300` | Инструкция / контекст |
| Заголовок секции | `font-size: 16px; font-weight: 600; color: white` | 16px | `text-lg font-semibold text-white` | «Баланс бонусов», «Итого» |
| Label формы | `font-size: 12px; color: #d1d5db` | 12px | `text-sm text-gray-300` | Подписи к полям |
| Body-текст | `font-size: 12px; color: #d1d5db` | 12px | `text-sm text-gray-300` | Описания, пояснения |
| Крупное число | `font-size: 30px; font-weight: 700; color: #b8c959` | 30px | `text-3xl font-bold text-[#b8c959]` | Баланс бонусов: «2 450» |
| Число итого | `font-size: 20px; font-weight: 700` | 20px | `text-xl font-bold` | Итого к оплате |
| Мета-текст | `font-size: 11px; color: #9ca3af` | 11px | `text-xs text-gray-400` | Подсказки, примечания |
| Числа на numpad | `font-size: 24px` | 24px | `text-2xl` | Цифровая клавиатура |

### 3.3. Выравнивание

- **Заголовки модалок** — всегда `text-align: center`
- **Labels и значения** — `text-align: left`, парами через `display: flex; justify-content: space-between`
- **Числа / суммы** — `text-align: right` или `font-weight: bold` для акцента

---

## 4. Размеры и Spacing

### 4.1. Размеры модалок

| Размер | CSS | Пиксели | Tailwind | Контекст |
|--------|-----|---------|----------|----------|
| SM | `max-width: 350px` | 350 | `max-w-[350px]` | Loading, простые ошибки, успех |
| MD | `max-width: 500px` | 500 | `max-w-[500px]` | Стандарт: не найден, заблокировано, ошибка сети |
| LG | `max-width: 600px` | 600 | `max-w-[600px]` | Поиск, клиент найден, оплата |
| XL | `max-width: 700px` | 700 | `max-w-[700px]` | Регистрация (форма 2 колонки) |

### 4.2. Высоты интерактивных элементов

| Элемент | Высота | CSS | Tailwind | Пояснение |
|---------|--------|-----|----------|-----------|
| Кнопки footer | **56px** | `height: 56px` | `h-14` | Большие, для тач-экранов |
| Кнопки numpad | **64px** | `height: 64px` | `h-16` | Цифровая клавиатура |
| Input-поля POS | **48px** | `height: 48px` | `h-12` | Увеличенные для тач |
| Accent input (поиск) | **56px** | `height: 56px` | `h-14` | Основное поле ввода с акцентным бордером |
| Кнопки переключателя | **40px** | `height: 40px` | `h-10` | Tabs «Телефон / Карта» |
| Кнопки действий (5 в ряд) | **48px** | `height: 48px` | `h-12` | Регистрация: «Начислить», «Списать»... |

### 4.3. Padding и Spacing

| Контекст | Значение | CSS | Tailwind |
|----------|----------|-----|----------|
| Padding модалки | 32px | `padding: 32px` | `p-8` |
| Gap между секциями | 24px | `gap: 24px` | `space-y-6` |
| Gap внутри секции | 20px | `gap: 20px` | `space-y-5` / `mb-5` |
| Gap между кнопками | 12px | `gap: 12px` | `gap-3` |
| Gap в grid карточек | 12px | `gap: 12px` | `gap-3` |
| Gap в numpad | 8px | `gap: 8px` | `gap-2` |
| Padding карточки данных | 16px | `padding: 16px` | `p-4` |
| Padding блока бонусов | 20px | `padding: 20px` | `p-5` |
| Margin bottom заголовка | 24px | `margin-bottom: 24px` | `mb-6` |

### 4.4. Border-radius

| Элемент | CSS | Пиксели | Tailwind |
|---------|-----|---------|----------|
| Модалка | `border-radius: 8px` | 8 | `rounded-lg` |
| Кнопки | `border-radius: 4px` | 4 | `rounded` |
| Карточки данных | `border-radius: 4px` | 4 | `rounded` |
| Input-поля | `border-radius: 4px` | 4 | `rounded` |
| Иконка в круге | `border-radius: 50%` | 50% | `rounded-full` |

---

## 5. Компоненты и паттерны

### 5.1. Обёртка модального окна (POS-Dialog)

Все POS-модалки используют единую обёртку:

**Структура HTML:**
```html
<!-- Контейнер: фиксированный на весь экран -->
<div class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
     style="position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center;">

  <!-- Overlay (затемнение) -->
  <div class="absolute inset-0 bg-black/50"
       style="position: absolute; inset: 0; background: rgba(0,0,0,0.5);"
       (click)="onOverlayClick()">
  </div>

  <!-- Контент модалки -->
  <div class="relative bg-[#3a3a3a] rounded-lg text-white p-8 animate-scale-in w-full mx-4"
       style="position: relative; background: #3a3a3a; border-radius: 8px; color: white; padding: 32px; width: 100%; margin: 0 16px;"
       [style.max-width]="maxWidth">
    <!-- Содержимое диалога -->
    <ng-content></ng-content>
  </div>
</div>
```

**Функции:**
- Закрытие по **Escape** (HostListener)
- Закрытие по **клику на overlay** (отключается через `closable = false`)
- 4 размера: `sm` (350px) / `md` (500px) / `lg` (600px) / `xl` (700px)
- Анимации: `animate-fade-in` (overlay) + `animate-scale-in` (контент)
- Блокировка прокрутки `body` при открытии

**Реализация компонента (Angular):**
```typescript
import { Component, Input, Output, EventEmitter, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pos-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div class="absolute inset-0 bg-black/50" (click)="onOverlayClick()"></div>
      <div class="relative bg-[#3a3a3a] rounded-lg text-white p-8 animate-scale-in w-full mx-4"
           [ngClass]="maxWidthClass">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PosDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closable = true;
  @Output() dialogClose = new EventEmitter<void>();

  private readonly widthMap: Record<string, string> = {
    sm: 'max-w-[350px]',
    md: 'max-w-[500px]',
    lg: 'max-w-[600px]',
    xl: 'max-w-[700px]',
  };

  get maxWidthClass(): string {
    return this.widthMap[this.maxWidth] || this.widthMap['md'];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      document.body.style.overflow = this.open ? 'hidden' : '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open && this.closable) this.close();
  }

  onOverlayClick(): void {
    if (this.closable) this.close();
  }

  close(): void {
    this.dialogClose.emit();
  }
}
```

### 5.2. Заголовок модалки

Каждый диалог начинается с акцентного заголовка и опционального подзаголовка:

```html
<!-- Стандартный заголовок -->
<h2 class="text-2xl font-bold text-[#b8c959] text-center mb-2"
    style="font-size: 24px; font-weight: 700; color: #b8c959; text-align: center; margin-bottom: 8px;">
  Kilbil
</h2>
<p class="text-sm text-[#b8c959] text-center mb-6"
   style="font-size: 14px; color: #b8c959; text-align: center; margin-bottom: 24px;">
  Введите номер телефона или проведите картой
</p>
```

> **Важно:** Заголовок ВСЕГДА `text-center`. Цвет ВСЕГДА `#b8c959` (акцентный лайм).

### 5.3. Кнопки — стандартная пара (Footer)

Паттерн для 2 кнопок внизу диалога (самый частый):

```html
<div class="grid grid-cols-2 gap-3"
     style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">

  <!-- Отмена (левая) -->
  <button class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          style="height: 56px; font-size: 16px; background: #1a1a1a; color: white; border: none; border-radius: 4px; font-weight: 500; cursor: pointer;">
    Отмена
  </button>

  <!-- Действие (правая) -->
  <button class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          style="height: 56px; font-size: 16px; background: #1a1a1a; color: white; border: none; border-radius: 4px; font-weight: 500; cursor: pointer;">
    ОК
  </button>
</div>
```

### 5.4. Кнопка акцентная (важное действие)

Используется для ключевого действия (оплата):

```html
<button class="h-14 bg-[#b8c959] text-black rounded text-base font-bold hover:bg-[#c5d466] transition-colors w-full"
        style="height: 56px; background: #b8c959; color: black; border-radius: 4px; font-size: 16px; font-weight: 700; width: 100%; cursor: pointer;">
  К оплате 2 200 ₽
</button>
```

### 5.5. Кнопки в несколько колонок (3–5 кнопок)

Для экрана регистрации (5 кнопок в ряд):

```html
<div class="grid grid-cols-5 gap-2"
     style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
  <button class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors"
          style="height: 48px; background: #1a1a1a; color: white; font-size: 14px; border-radius: 4px;">
    Начислить
  </button>
  <button class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors">
    Списать
  </button>
  <button class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors">
    Отвязать карту
  </button>
  <button class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors">
    Отмена
  </button>
  <button class="h-12 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none text-sm rounded transition-colors">
    Изменить данные
  </button>
</div>
```

### 5.6. Кнопки вертикальные (одна колонка)

Для диалогов-статусов (не найден, заблокировано):

```html
<div class="space-y-2" style="display: flex; flex-direction: column; gap: 8px;">
  <button class="w-full h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
          style="width: 100%; height: 56px; background: #1a1a1a; color: white; border-radius: 4px;">
    Закрыть без клиента
  </button>
  <button class="w-full h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
    Найти другого
  </button>
  <!-- Ghost-кнопка (третичная) -->
  <button class="w-full h-12 text-base text-gray-400 hover:text-white hover:bg-[#2d2d2d] bg-transparent border-none rounded font-medium transition-colors"
          style="width: 100%; height: 48px; background: transparent; color: #9ca3af; border: none;">
    Отмена
  </button>
</div>
```

### 5.7. Переключатель типа поиска (Tab-switcher)

Два таба «Телефон / Карта» над полем ввода:

```html
<div class="grid grid-cols-2 gap-2"
     style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">

  <!-- Активный таб -->
  <button class="h-10 rounded text-sm font-medium bg-[#b8c959] text-black transition-colors"
          style="height: 40px; border-radius: 4px; font-size: 14px; font-weight: 500; background: #b8c959; color: black;">
    Телефон
  </button>

  <!-- Неактивный таб -->
  <button class="h-10 rounded text-sm font-medium bg-[#1a1a1a] text-gray-300 hover:bg-[#252525] transition-colors"
          style="height: 40px; border-radius: 4px; font-size: 14px; font-weight: 500; background: #1a1a1a; color: #d1d5db;">
    Карта
  </button>
</div>
```

### 5.8. Input-поля POS

```html
<!-- Стандартный input (белый на тёмном фоне) -->
<input type="text"
  class="w-full h-12 bg-white text-black rounded px-3 outline-none placeholder:text-gray-500"
  style="width: 100%; height: 48px; background: white; color: black; border-radius: 4px; padding: 0 12px; outline: none;"
  placeholder="Введите значение" />

<!-- Акцентный input (активное поле поиска — для режима «Карта») -->
<input type="text" readonly
  class="w-full h-14 text-lg bg-[#b8c959]/20 border border-[#b8c959] text-white rounded px-4 outline-none placeholder-[#b8c959]/50"
  style="width: 100%; height: 56px; font-size: 18px; background: rgba(184,201,89,0.2); border: 1px solid #b8c959; color: white; border-radius: 4px; padding: 0 16px;"
  placeholder="Проведите картой..." />

<!-- Поле телефона (белый, readonly — ввод через numpad) -->
<input type="text" readonly
  class="w-full h-14 text-lg bg-white text-black rounded px-4 outline-none"
  style="width: 100%; height: 56px; font-size: 18px; background: white; color: black; border-radius: 4px; padding: 0 16px;"
  placeholder="+7 (___) ___-__-__" />

<!-- Input с label -->
<div class="space-y-1" style="display: flex; flex-direction: column; gap: 4px;">
  <label class="text-sm text-gray-300" style="font-size: 12px; color: #d1d5db;">Название поля</label>
  <input class="w-full h-12 bg-white text-black rounded px-3 outline-none"
         style="width: 100%; height: 48px; background: white; color: black; border-radius: 4px; padding: 0 12px;" />
</div>
```

> **Важно:** Input-поля на POS **не имеют видимого focus ring** (`outline: none`). Это POS-специфика.

### 5.9. Цифровая клавиатура (Numpad)

```html
<div class="grid grid-cols-3 gap-2"
     style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">

  <!-- Цифровые клавиши (белые) -->
  <button class="h-16 text-2xl bg-white text-black hover:bg-gray-100 border border-gray-300 rounded font-medium transition-colors flex items-center justify-center"
          style="height: 64px; font-size: 24px; background: white; color: black; border: 1px solid #d1d5db; border-radius: 4px;">
    1
  </button>
  <!-- ...аналогично 2–9... -->

  <!-- Служебные клавиши (серые) -->
  <button class="h-16 text-2xl bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300 rounded font-medium transition-colors"
          style="height: 64px; background: #e5e7eb; color: #4b5563;">
    ←  <!-- Backspace -->
  </button>
  <button class="h-16 text-2xl bg-white text-black hover:bg-gray-100 border border-gray-300 rounded font-medium transition-colors">
    0
  </button>
  <button class="h-16 text-2xl bg-gray-200 text-gray-600 hover:bg-gray-300 border border-gray-300 rounded font-medium transition-colors">
    ✕  <!-- Очистить всё -->
  </button>
</div>
```

**Порядок клавиш:** `['1','2','3','4','5','6','7','8','9','←','0','✕']`
- `←` — удалить последний символ (backspace)
- `✕` — очистить всё поле

**Логика ввода телефона:**
```typescript
numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✕'];

onNumpadPress(key: string): void {
  if (key === '←') {
    this.value = this.value.slice(0, -1);
  } else if (key === '✕') {
    this.value = '';
  } else {
    if (this.searchType === 'phone' && this.value.length >= 10) return; // макс. 10 цифр
    this.value += key;
  }
}

// Форматирование телефона
get formattedPhone(): string {
  const digits = this.value.replace(/\D/g, '');
  if (!digits) return '';
  let result = '+7';
  if (digits.length > 0) result += ' (' + digits.substring(0, 3);
  if (digits.length >= 3) result += ') ';
  if (digits.length > 3) result += digits.substring(3, 6);
  if (digits.length > 6) result += '-' + digits.substring(6, 8);
  if (digits.length > 8) result += '-' + digits.substring(8, 10);
  return result;
}
```

### 5.10. Карточка данных (белая на тёмном фоне)

Для отображения информации о клиенте (4 карточки в сетке 2×2):

```html
<div class="grid grid-cols-2 gap-3"
     style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">

  <div class="bg-white text-black p-4 rounded"
       style="background: white; color: black; padding: 16px; border-radius: 4px;">
    <div class="text-xs text-gray-500 mb-1"
         style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">Программа лояльности</div>
    <div class="font-semibold" style="font-weight: 600;">Kilbil Бонус</div>
  </div>

  <div class="bg-white text-black p-4 rounded">
    <div class="text-xs text-gray-500 mb-1">Статус гостя</div>
    <div class="font-semibold">Золотой</div>
  </div>

  <div class="bg-white text-black p-4 rounded">
    <div class="text-xs text-gray-500 mb-1">Скидка</div>
    <div class="font-semibold">10%</div>
  </div>

  <div class="bg-white text-black p-4 rounded">
    <div class="text-xs text-gray-500 mb-1">% бонусов</div>
    <div class="font-semibold">5%</div>
  </div>
</div>
```

### 5.11. Данные клиента (ключ-значение)

Список пар «label — значение» для найденного клиента:

```html
<div class="space-y-2 text-sm" style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">

  <div class="flex justify-between" style="display: flex; justify-content: space-between;">
    <span class="text-gray-400" style="color: #9ca3af;">ФИО</span>
    <span class="text-white font-medium" style="color: white; font-weight: 500;">Иванов Иван Иванович</span>
  </div>

  <div class="flex justify-between">
    <span class="text-gray-400">Телефон</span>
    <span class="text-white font-medium">+7 (999) 123-45-67</span>
  </div>

  <div class="flex justify-between">
    <span class="text-gray-400">Номер карты</span>
    <span class="text-white font-medium">1234 5678 9012 3456</span>
  </div>

  <div class="flex justify-between">
    <span class="text-gray-400">Дата рождения</span>
    <span class="text-white font-medium">15.03.1990</span>
  </div>
</div>
```

### 5.12. Блок бонусов (акцентная карточка)

Крупный блок с балансом бонусов:

```html
<div class="bg-[#b8c959]/20 border border-[#b8c959] text-white p-5 rounded"
     style="background: rgba(184,201,89,0.2); border: 1px solid #b8c959; color: white; padding: 20px; border-radius: 4px;">
  <div class="text-center" style="text-align: center;">
    <div class="text-xs text-[#b8c959] mb-1" style="font-size: 11px; color: #b8c959; margin-bottom: 4px;">
      Баланс бонусов
    </div>
    <div class="text-3xl font-bold text-[#b8c959]" style="font-size: 30px; font-weight: 700; color: #b8c959;">
      2 450
    </div>
    <div class="text-sm text-gray-300 mt-2" style="font-size: 14px; color: #d1d5db; margin-top: 8px;">
      Доступно к списанию: <span class="text-white font-medium" style="color: white; font-weight: 500;">1 500</span>
    </div>
  </div>
</div>
```

### 5.13. Блок итого (тёмная секция)

```html
<div class="bg-[#2d2d2d] p-4 rounded"
     style="background: #2d2d2d; padding: 16px; border-radius: 4px;">

  <div class="flex justify-between text-sm text-gray-200 mb-1"
       style="display: flex; justify-content: space-between; font-size: 14px; color: #e5e7eb;">
    <span>Сумма заказа</span>
    <span>2 500 ₽</span>
  </div>

  <div class="flex justify-between text-sm text-red-400 mb-1"
       style="display: flex; justify-content: space-between; font-size: 14px; color: #f87171;">
    <span>Списание бонусов</span>
    <span class="font-semibold" style="font-weight: 600;">-300 ₽</span>
  </div>

  <!-- Разделитель -->
  <div class="h-px bg-gray-600 my-2"
       style="height: 1px; background: #4b5563; margin: 8px 0;"></div>

  <div class="flex justify-between text-xl font-bold"
       style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 700;">
    <span>Итого к оплате</span>
    <span class="text-[#b8c959]" style="color: #b8c959;">2 200 ₽</span>
  </div>
</div>
```

### 5.14. Иконка-индикатор в круге (статус)

Для диалогов-статусов (не найден, заблокировано, успех):

```html
<!-- Успех: жёлто-зелёный -->
<div class="flex justify-center" style="display: flex; justify-content: center;">
  <div class="rounded-full bg-[#b8c959]/20 p-6"
       style="border-radius: 50%; background: rgba(184,201,89,0.2); padding: 24px;">
    <lucide-icon name="check-circle-2" [size]="80" class="text-[#b8c959]"></lucide-icon>
    <!-- Или: <svg width="80" height="80" style="color: #b8c959;">...</svg> -->
  </div>
</div>

<!-- Предупреждение: оранжевый -->
<div class="flex justify-center">
  <div class="rounded-full bg-orange-500/20 p-6"
       style="border-radius: 50%; background: rgba(249,115,22,0.2); padding: 24px;">
    <lucide-icon name="alert-circle" [size]="64" class="text-orange-400"></lucide-icon>
  </div>
</div>

<!-- Ошибка: красный -->
<div class="flex justify-center">
  <div class="rounded-full bg-red-500/20 p-6"
       style="border-radius: 50%; background: rgba(239,68,68,0.2); padding: 24px;">
    <lucide-icon name="shield-alert" [size]="64" class="text-red-400"></lucide-icon>
  </div>
</div>

<!-- Загрузка: синий спиннер -->
<lucide-icon name="loader-2" [size]="64" class="text-blue-500 animate-spin"></lucide-icon>
```

### 5.15. Info-баннер (предупреждение)

Для информационных сообщений (например, «только накопление»):

```html
<div class="bg-orange-500/20 border border-orange-500/40 p-4 rounded flex gap-3"
     style="background: rgba(249,115,22,0.2); border: 1px solid rgba(249,115,22,0.4); padding: 16px; border-radius: 4px; display: flex; gap: 12px;">
  <lucide-icon name="info" [size]="20" class="text-orange-400 flex-shrink-0 mt-0.5"></lucide-icon>
  <span class="text-sm text-gray-200" style="font-size: 14px; color: #e5e7eb;">
    Клиент не завершил регистрацию. Бонусы можно только копить.
  </span>
</div>
```

### 5.16. Секция промокода

```html
<div class="mb-5" style="margin-bottom: 20px;">
  <label class="text-sm text-gray-300 block mb-1.5"
         style="font-size: 12px; color: #d1d5db; display: block; margin-bottom: 6px;">
    Промокод
  </label>
  <div class="flex gap-2" style="display: flex; gap: 8px;">
    <input type="text"
      placeholder="Введите промокод"
      class="flex-1 h-12 px-4 bg-white text-black rounded text-sm outline-none"
      style="flex: 1; height: 48px; padding: 0 16px; background: white; color: black; border-radius: 4px; font-size: 14px;" />
    <button class="h-12 px-6 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-[#252525] transition-colors"
            style="height: 48px; padding: 0 24px; background: #1a1a1a; color: white; border-radius: 4px; font-size: 14px;">
      Применить
    </button>
  </div>
</div>
```

### 5.17. Секция списания бонусов

```html
<div class="bg-[#b8c959]/15 border border-[#b8c959]/40 p-5 rounded"
     style="background: rgba(184,201,89,0.15); border: 1px solid rgba(184,201,89,0.4); padding: 20px; border-radius: 4px;">

  <div class="text-sm text-gray-200 mb-3">
    Доступно бонусов: <span class="font-semibold">800 ₽</span>
  </div>

  <input type="number"
    placeholder="0"
    class="w-full h-14 text-xl font-semibold text-center bg-white text-black rounded outline-none mb-1.5"
    style="width: 100%; height: 56px; font-size: 20px; font-weight: 600; text-align: center; background: white; color: black; border-radius: 4px;" />

  <div class="text-xs text-gray-300 text-center mb-4"
       style="font-size: 11px; color: #d1d5db; text-align: center; margin-bottom: 16px;">
    Введите сумму бонусов для списания
  </div>

  <button class="w-full h-11 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-[#252525] transition-colors"
          style="width: 100%; height: 44px; background: #1a1a1a; color: white; border-radius: 4px; font-size: 14px;">
    Копить бонусы
  </button>
</div>
```

### 5.18. Форма в 2 колонки (регистрация)

```html
<div class="grid grid-cols-2 gap-x-6 gap-y-4"
     style="display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; row-gap: 16px;">

  <!-- Стандартное поле -->
  <div class="flex flex-col gap-1" style="display: flex; flex-direction: column; gap: 4px;">
    <label class="text-sm text-gray-300" style="font-size: 12px; color: #d1d5db;">Номер телефона</label>
    <input type="text"
      class="h-12 bg-white text-black rounded px-3 outline-none"
      style="height: 48px; background: white; color: black; border-radius: 4px; padding: 0 12px;"
      placeholder="79001234567" />
  </div>

  <!-- Поле на 2 колонки -->
  <div class="flex flex-col gap-1 col-span-2" style="grid-column: span 2;">
    <label class="text-sm text-gray-300">E-mail</label>
    <input type="email"
      class="h-12 bg-white text-black rounded px-3 outline-none"
      placeholder="email@example.com" />
  </div>

  <!-- Select (нативный) -->
  <div class="flex flex-col gap-1">
    <label class="text-sm text-gray-300">Пол</label>
    <select class="h-12 bg-white text-black rounded px-3 outline-none appearance-none"
            style="height: 48px; background: white; color: black; border-radius: 4px; padding: 0 12px; -webkit-appearance: none;">
      <option>Мужской</option>
      <option>Женский</option>
    </select>
  </div>
</div>
```

---

## 6. Каталог диалогов Kilbil

### 6.1. Полный список диалогов

| # | Тип | Размер | Тема | Описание |
|---|-----|--------|------|----------|
| 1 | **Поиск клиента** (`search`) | LG (600px) | Тёмная | Ввод телефона / карты через numpad, переключатель режима |
| 2 | **Клиент найден** (`found`) | LG (600px) | Тёмная | Данные клиента, 4 карточки, блок бонусов |
| 3 | **Клиент не найден** (`not-found`) | MD (500px) | Тёмная | Иконка-статус (оранжевая), вертикальные кнопки |
| 4 | **Карта заблокирована** (`blocked`) | MD (500px) | Тёмная | Иконка ошибки (красная), 2 кнопки |
| 5 | **Оплата заказа** (`payment`) | LG (600px) | Тёмная | Промокод, списание бонусов, блок итого |
| 6 | **Только накопление** (`accumulate`) | LG (600px) | Тёмная | Info-баннер (оранжевый), итого без списания |
| 7 | **Регистрация** (`registration`) | XL (700px) | Тёмная | Форма 2 колонки, 5+ кнопок действий |
| 8 | **Оплата успешна** (`success`) | SM (350px) | Тёмная | Большая иконка с пульсацией, итоги на белом фоне |
| 9 | **Загрузка** (`loading`) | SM (350px) | Светлая | Спиннер, без кнопок, без крестика, автозакрытие |
| 10 | **Ошибка соединения** (`error`) | MD (450px) | Светлая | Иконка WiFi-Off, «Повторить» / «Закрыть» |
| 11 | **Ошибка сети** (`network-error`) | MD (500px) | Тёмная | Как ошибка, но в POS-теме, `closable=false` |

### 6.2. Структура диалога — Header / Body / Footer

```
┌─────────────────────────────────────────┐
│  HEADER                                  │
│  Заголовок (24px, #b8c959, bold, center) │
│  Подзаголовок (14px, gray-300, center)   │
│                                   mb-6   │
├─────────────────────────────────────────┤
│  BODY                                    │
│  - Инпуты / numpad / карточки            │
│  - Информационные блоки                  │
│  - Баланс / итого                        │
│                              space-y-5   │
├─────────────────────────────────────────┤
│  FOOTER                                  │
│  grid grid-cols-2 gap-3                  │
│  [Отмена]              [Действие]        │
│                            h-14 каждая   │
└─────────────────────────────────────────┘
```

### 6.3. Детальная спецификация каждого диалога

---

#### Диалог 1: Поиск клиента (`search`)

**Размер:** LG (600px) | **Тема:** Тёмная

**Layout:**
```
┌─────────────────────────────────────────┐
│  Kilbil                          (24px) │
│  Введите номер телефона... (14px)       │
│                                         │
│  [Телефон]  [Карта]   ← переключатель  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  +7 (999) 123-__-__             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────┬─────┬─────┐                   │
│  │  1  │  2  │  3  │                   │
│  ├─────┼─────┼─────┤                   │
│  │  4  │  5  │  6  │   ← numpad       │
│  ├─────┼─────┼─────┤                   │
│  │  7  │  8  │  9  │                   │
│  ├─────┼─────┼─────┤                   │
│  │  ←  │  0  │  ✕  │                   │
│  └─────┴─────┴─────┘                   │
│                                         │
│  [Отмена]           [ОК]               │
└─────────────────────────────────────────┘
```

**Элементы:**
- Заголовок: «Kilbil» (text-2xl font-bold text-[#b8c959])
- Подзаголовок: «Введите номер телефона или проведите картой» (text-sm text-[#b8c959])
- Tab-switcher: grid-cols-2, активный — `bg-[#b8c959] text-black`, неактивный — `bg-[#1a1a1a] text-gray-300`
- Input (режим «Телефон»): `h-14 bg-white text-black rounded px-4 text-lg` (readonly, ввод через numpad)
- Input (режим «Карта»): `h-14 bg-[#b8c959]/20 border border-[#b8c959] text-white` (readonly)
- Numpad: grid-cols-3 gap-2, кнопки `h-16 text-2xl bg-white text-black border border-gray-300`
- Footer: grid-cols-2 gap-3, обе кнопки `h-14 bg-[#1a1a1a] text-white`

---

#### Диалог 2: Клиент найден (`found`)

**Размер:** LG (600px) | **Тема:** Тёмная

**Layout:**
```
┌─────────────────────────────────────────┐
│  Клиент найден                  (24px)  │
│                                         │
│  ФИО ................... Иванов И.И.    │
│  Телефон ............ +7 (999) 123-4567 │
│  Номер карты ....... 1234 5678 9012     │
│  Дата рождения .......... 15.03.1990    │
│                                         │
│  ┌──────────────┬──────────────┐        │
│  │ Программа    │ Статус       │        │
│  │ Kilbil Бонус │ Золотой      │  карт. │
│  ├──────────────┼──────────────┤        │
│  │ Скидка       │ % бонусов    │        │
│  │ 10%          │ 5%           │        │
│  └──────────────┴──────────────┘        │
│                                         │
│  ╔═════════════════════════════════╗    │
│  ║        Баланс бонусов           ║    │
│  ║            2 450                ║    │
│  ║   Доступно к списанию: 1 500   ║    │
│  ╚═════════════════════════════════╝    │
│                                         │
│  [Отмена]         [Ввести клиента]      │
└─────────────────────────────────────────┘
```

**Элементы:**
- Заголовок: «Клиент найден» (text-2xl font-bold text-[#b8c959] text-center)
- Данные клиента: пары `flex justify-between`, label — text-gray-400, value — text-white font-medium
- 4 карточки: grid-cols-2 gap-3, каждая `bg-white text-black p-4 rounded`
- Блок бонусов: `bg-[#b8c959]/20 border border-[#b8c959] text-white p-5 rounded`, число `text-3xl font-bold text-[#b8c959]`
- Footer: grid-cols-2 gap-3, кнопки h-14 bg-[#1a1a1a]

---

#### Диалог 3: Клиент не найден (`not-found`)

**Размер:** MD (500px) | **Тема:** Тёмная

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│          ╭──────────╮                   │
│          │    ⚠     │  ← оранжевый круг│
│          ╰──────────╯                   │
│                                         │
│     Клиент не найден            (24px)  │
│     Клиент не найден или не     (14px)  │
│     прошёл регистрацию...               │
│                                         │
│  [  Закрыть без клиента  ]              │
│  [  Найти другого        ]              │
│  [  Отмена               ]  ← ghost    │
└─────────────────────────────────────────┘
```

**Элементы:**
- Иконка: `rounded-full bg-orange-500/20 p-6`, внутри `alert-circle` size=64 `text-orange-400`
- Заголовок: text-2xl font-bold text-[#b8c959]
- Описание: text-sm text-gray-300
- Кнопки вертикально: space-y-2, первые две `h-14 bg-[#1a1a1a]`, третья `h-12 bg-transparent text-gray-400`

---

#### Диалог 4: Карта заблокирована (`blocked`)

**Размер:** MD (500px) | **Тема:** Тёмная

**Layout:**
```
┌─────────────────────────────────────────┐
│          ╭──────────╮                   │
│          │    🛡     │  ← красный круг  │
│          ╰──────────╯                   │
│                                         │
│     Карта заблокирована         (24px)  │
│     Обратитесь в поддержку      (14px)  │
│                                         │
│  [Закрыть]     [Найти другого клиента]  │
└─────────────────────────────────────────┘
```

**Элементы:**
- Иконка: `rounded-full bg-red-500/20 p-6`, `shield-alert` size=64 `text-red-400`
- Заголовок: text-2xl font-bold **text-red-400** (исключение — красный, не акцентный)
- Footer: grid-cols-2 gap-3, кнопки h-14 bg-[#1a1a1a]

---

#### Диалог 5: Оплата заказа (`payment`)

**Размер:** LG (600px) | **Тема:** Тёмная

**Layout:**
```
┌─────────────────────────────────────────┐
│  Оплата заказа                  (24px)  │
│  Клиент: Иванов И.И. • +7 (999)..      │
│                                         │
│  Промокод                               │
│  ┌─────────────────────┐ [Применить]    │
│  │ Введите промокод    │                │
│  └─────────────────────┘                │
│                                         │
│  ╔═════════════════════════════════╗    │
│  ║ Доступно бонусов: 800 ₽        ║    │
│  ║ ┌─────────────────────────┐    ║    │
│  ║ │         300             │    ║    │
│  ║ └─────────────────────────┘    ║    │
│  ║ Введите сумму для списания     ║    │
│  ║ [Копить бонусы]                ║    │
│  ╚═════════════════════════════════╝    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Сумма заказа ........... 2 500 ₽│    │
│  │ Списание бонусов ....... -300 ₽ │    │
│  │ ──────────────────────────────  │    │
│  │ Итого к оплате ..... 2 200 ₽   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Отмена]      [К оплате 2 200 ₽]      │
│                 ↑ акцентная bg-[#b8c959] │
└─────────────────────────────────────────┘
```

**Элементы:**
- Заголовок + подзаголовок с данными клиента
- Секция промокода: input + кнопка «Применить» в flex row
- Секция бонусов: `bg-[#b8c959]/15 border border-[#b8c959]/40 p-5`, input `h-14 text-xl text-center`
- Блок итого: `bg-[#2d2d2d] p-4 rounded`, списание — text-red-400, итого — text-[#b8c959] text-xl font-bold
- Footer: grid-cols-2, левая — bg-[#1a1a1a], правая — **bg-[#b8c959] text-black font-bold**

---

#### Диалог 6: Только накопление (`accumulate`)

**Размер:** LG (600px) | **Тема:** Тёмная

Аналогичен диалогу «Оплата», но:
- **Info-баннер** вверху: `bg-orange-500/20 border border-orange-500/40`, иконка `info`, текст «Клиент не завершил регистрацию. Бонусы можно только копить.»
- Блок итого **без строки списания**, добавлена строка «Будет начислено бонусов: +90 ₽» (text-[#b8c959])

---

#### Диалог 7: Регистрация клиента (`registration`)

**Размер:** XL (700px) | **Тема:** Тёмная

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Регистрация                        (24px)  │
│                                             │
│  ┌─────────────────┬─────────────────┐      │
│  │ Номер телефона  │ Номер карты     │      │
│  │ [79001234567]   │ [111]           │      │
│  ├─────────────────┼─────────────────┤      │
│  │ Имя             │ Дата рождения   │      │
│  │ [Тест]          │ [____-__-__]    │      │
│  ├─────────────────┼─────────────────┤      │
│  │ Группа          │ Пол             │      │
│  │ [TEST]          │ [Мужской ▾]     │      │
│  ├─────────────────┴─────────────────┤      │
│  │ E-mail (на всю ширину)            │      │
│  │ [email@example.com]               │      │
│  └───────────────────────────────────┘      │
│                                             │
│  [Начисл.][Списать][Отвяз.][Отмена][Изм.]  │
│     ↑ 5 кнопок: grid-cols-5 gap-2          │
└─────────────────────────────────────────────┘
```

**Элементы:**
- Форма: grid-cols-2 gap-x-6 gap-y-4
- Каждое поле: label `text-sm text-gray-300` + input `h-12 bg-white text-black rounded px-3 outline-none`
- E-mail: `col-span-2`
- Select (Пол): нативный `<select>` с `appearance-none`
- Footer: grid-cols-5 gap-2, все кнопки `h-12 bg-[#1a1a1a] text-white text-sm`

---

#### Диалог 8: Оплата успешна (`success`)

**Размер:** SM (350px) | **Тема:** Тёмная

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│          ╭──────────╮                   │
│          │    ✓     │  ← пульсация!    │
│          ╰──────────╯                   │
│                                         │
│      Оплата успешна             (30px)  │
│      Чек закрыт                 (18px)  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Списано бонусов ........ 300 ₽  │    │
│  │ Начислено бонусов ..... +125 ₽  │    │
│  │ ────────────────────────────    │    │
│  │ Новый баланс ........ 1 075 ₽  │    │
│  └─────────────────────────────────┘    │
│         ↑ белая карточка                │
│                                         │
│  [              Готово              ]    │
└─────────────────────────────────────────┘
```

**Элементы:**
- Иконка: `rounded-full bg-[#b8c959]/20 p-6 **animate-pulse**`, `check-circle-2` size=80 `text-[#b8c959]`
- Заголовок: **text-3xl** font-bold text-[#b8c959] (крупнее обычного!)
- Подзаголовок: text-lg text-gray-300
- Карточка итогов: `bg-white text-black p-5 rounded`, начисление — text-green-600, баланс — text-green-600 font-bold
- Кнопка: одна на всю ширину, `h-14 bg-[#1a1a1a] text-white`

---

#### Диалог 9: Загрузка (`loading`)

**Размер:** SM (350px) | **Тема:** Светлая | **closable: false** | **Автозакрытие: 3 сек**

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│              ◌  ← спиннер (синий)       │
│                                         │
│        Поиск клиента...         (20px)  │
│        Подождите                (14px)  │
│                                         │
└─────────────────────────────────────────┘
```

**Элементы:**
- Фон модалки: **bg-white** (не тёмная POS!)
- Спиннер: `loader-2` size=64 `text-blue-500 animate-spin`
- Заголовок: `text-xl font-semibold text-gray-900`
- Подзаголовок: `text-sm text-gray-500`
- **Нет кнопок**, нет крестика, нельзя закрыть по overlay/Escape

> **Важно:** Этот диалог использует **собственную обёртку** (не PosDialogComponent), т.к. светлая тема.

---

#### Диалог 10: Ошибка соединения (`error`)

**Размер:** MD (450px) | **Тема:** Светлая

**Элементы:**
- Фон: **bg-white**
- Иконка: `rounded-full bg-red-100 p-4`, `wifi-off` size=64 `text-red-500`
- Заголовок: `text-2xl font-bold text-gray-900`
- Описание: `text-base text-gray-500`
- Footer: grid-cols-2 gap-3
  - Левая: `h-14 border border-gray-300 text-gray-700 bg-transparent` (outline)
  - Правая: `h-14 bg-gray-900 text-white` (primary)

---

#### Диалог 11: Ошибка сети (`network-error`)

**Размер:** MD (500px) | **Тема:** Тёмная | **closable: false**

**Элементы:**
- Иконка: `rounded-full bg-orange-500/20 p-6`, `wifi-off` size=64 `text-orange-400`
- Заголовок: text-2xl font-bold text-[#b8c959]
- Описание: text-base text-gray-300
- Footer: grid-cols-2 gap-3, кнопки `h-14 bg-[#1a1a1a] text-white border-none`

---

## 7. Иконки

### 7.1. Иконки по контексту

| Иконка | Контекст | Размер |
|--------|----------|--------|
| `search` | Поиск клиента | 20 |
| `check-circle-2` | Клиент найден, успех | 64–80 (статус) / 20 (inline) |
| `alert-circle` | Клиент не найден | 64 |
| `shield-alert` | Карта заблокирована | 64 |
| `wallet` | Оплата | 20–24 |
| `credit-card` | Карта лояльности | 20–24 |
| `info` | Информационный баннер | 20 |
| `wifi-off` | Ошибка сети | 64 |
| `loader-2` | Загрузка (с `animate-spin`) | 64 |
| `user` | Регистрация, профиль | 20 |

### 7.2. Подключение иконок

Проект использует [Lucide](https://lucide.dev) — набор SVG-иконок.

**Angular (через lucide-angular):**
```html
<lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959]"></lucide-icon>
<lucide-icon name="loader-2" [size]="64" class="text-blue-500 animate-spin"></lucide-icon>
```

**Без Angular (чистый SVG):**
Используй SVG из https://lucide.dev/icons/ с соответствующими размерами и цветами.

---

## 8. Анимации

| Анимация | CSS-класс (Tailwind) | CSS | Контекст |
|----------|---------------------|-----|----------|
| Появление overlay | `animate-fade-in` | `opacity: 0→1, 0.2s ease-out` | Открытие модалки |
| Появление контента | `animate-scale-in` | `transform: scale(0.95)→scale(1), opacity: 0→1, 0.2s` | Контент модалки |
| Спиннер | `animate-spin` | `transform: rotate(0→360deg), 1s linear infinite` | Загрузка |
| Пульсация | `animate-pulse` | `opacity: 1→0.5→1, 2s ease-in-out infinite` | Иконка успеха |

**CSS для кастомных анимаций:**
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
```

---

## 9. Состояния и взаимодействия

### 9.1. Состояния кнопок

| Роль | Обычная | Hover | Disabled |
|------|---------|-------|----------|
| **Standard** (тёмная) | `background: #1a1a1a; color: white` | `background: #252525` | `opacity: 0.5; cursor: not-allowed` |
| **Accent** (подтверждение) | `background: #b8c959; color: black; font-weight: bold` | `background: #c5d466` | `opacity: 0.5` |
| **Ghost** (отмена) | `background: transparent; color: #9ca3af` | `color: white; background: #2d2d2d` | — |
| **Outline** (светлая тема) | `border: 1px solid #d1d5db; color: #374151` | `background: #f3f4f6` | — |
| **Primary** (светлая тема) | `background: #111827; color: white` | `background: #1f2937` | — |

### 9.2. Состояния input-полей

| Состояние | Стили |
|-----------|-------|
| **Обычное** | `background: white; color: black; border-radius: 4px; padding: 0 12px; outline: none` |
| **Focus** | Без видимого ring (`outline: none`) — POS-специфика |
| **Accent** (активный поиск) | `background: rgba(184,201,89,0.2); border: 1px solid #b8c959; color: white` |
| **Disabled** | `opacity: 0.5; background: #f3f4f6` |

### 9.3. Авто-закрытие Loading

```typescript
openDialog(type: ModalType): void {
  this.activeModal = type;
  if (type === 'loading') {
    setTimeout(() => { this.activeModal = null; }, 3000);
  }
}
```

### 9.4. Защита от случайного закрытия

- **Loading**: `closable = false` — нет крестика, нельзя закрыть по overlay/Escape
- **Network-error**: `closable = false` — только через кнопки «Повторить» / «Закрыть без клиента»
- **Формы** (поиск, регистрация, оплата): можно закрыть по overlay или Escape

---

## 10. Типы данных

### 10.1. CustomerData

```typescript
interface CustomerData {
  full_name: string;        // «Иванов Иван Иванович»
  phone: string;            // «+7 (999) 123-45-67»
  card_code: string;        // «1234 5678 9012 3456»
  birth_date: string;       // «15.03.1990»
  program_name: string;     // «Kilbil Бонус»
  status_name: string;      // «Золотой»
  discount_percent: number; // 10
  bonus_percent: number;    // 5
  bonus_balance: number;    // 2450
  max_bonus_out: number;    // 1500
}
```

### 10.2. RegistrationFormData

```typescript
interface RegistrationFormData {
  phone: string;       // «79001234567»
  cardNumber: string;  // «111»
  name: string;        // «Тест»
  birthDate: string;   // «1990-03-15» (ISO)
  group: string;       // «TEST»
  gender: string;      // «Мужской» | «Женский»
  email: string;       // «email@example.com»
}
```

### 10.3. ModalType

```typescript
type ModalType =
  | 'search'
  | 'found'
  | 'not-found'
  | 'blocked'
  | 'payment'
  | 'accumulate'
  | 'registration'
  | 'success'
  | 'loading'
  | 'error'
  | 'network-error'
  | null;
```

### 10.4. Валюта и форматирование

- **Валюта:** ₽ (российский рубль)
- **Формат чисел:** `1 250` (пробел как разделитель тысяч)
- **Формат телефона:** `+7 (999) 123-45-67`
- **Формат карты:** `1234 5678 9012 3456`
- **Формат даты:** `15.03.1990` (DD.MM.YYYY)

---

## 11. Мок-данные

### 11.1. Пример данных клиента

```typescript
const MOCK_CUSTOMER: CustomerData = {
  full_name: 'Иванов Иван Иванович',
  phone: '+7 (999) 123-45-67',
  card_code: '1234 5678 9012 3456',
  birth_date: '15.03.1990',
  program_name: 'Kilbil Бонус',
  status_name: 'Золотой',
  discount_percent: 10,
  bonus_percent: 5,
  bonus_balance: 2450,
  max_bonus_out: 1500,
};
```

### 11.2. Контекст бизнес-данных

Данные должны отражать **ресторанный бизнес**:
- Программы лояльности Kilbil, бонусные карты, скидки
- Суммы заказов: 500–10 000 ₽
- Бонусные балансы: 0–5 000
- Промокоды: алфавитно-цифровые (например, «BONUS2026», «WELCOME50»)
- Имена клиентов: реалистичные русские имена

---

## 12. Архитектура Angular-компонента

### 12.1. Шаблон файла диалога

Каждый модальный диалог — это standalone-компонент Angular 16:

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import { PosDialogComponent } from './pos-dialog.component';

@Component({
  selector: 'app-kilbil-DIALOG_NAME-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, PosDialogComponent],
  template: `
    <pos-dialog [open]="open" maxWidth="md" (dialogClose)="onClose.emit()">
      <!-- HEADER -->
      <h2 class="text-2xl font-bold text-[#b8c959] text-center mb-2">Заголовок</h2>
      <p class="text-sm text-gray-300 text-center mb-6">Подзаголовок</p>

      <!-- BODY -->
      <div class="space-y-5 mb-6">
        <!-- Контент диалога -->
      </div>

      <!-- FOOTER -->
      <div class="grid grid-cols-2 gap-3">
        <button (click)="onClose.emit()"
          class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
          Отмена
        </button>
        <button (click)="onConfirm()"
          class="h-14 text-base bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors">
          Действие
        </button>
      </div>
    </pos-dialog>
  `,
})
export class KilbilDialogNameDialogComponent {
  @Input() open = false;
  @Output() onClose = new EventEmitter<void>();

  onConfirm(): void {
    // логика...
    this.onClose.emit();
  }
}
```

### 12.2. Шаблон экрана-каталога (обзор плагина)

```typescript
@Component({
  selector: 'app-kilbil-overview',
  standalone: true,
  imports: [
    CommonModule,
    // ...импорт всех диалогов...
    KilbilSearchDialogComponent,
    KilbilFoundDialogComponent,
    // ...
  ],
  template: `
    <!-- Сетка карточек диалогов для превью -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div *ngFor="let dialog of dialogs"
           (click)="openDialog(dialog.type)"
           class="cursor-pointer bg-surface rounded-lg border border-border hover:border-app-primary/40 p-5 transition-all">
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 rounded-lg flex items-center justify-center" [ngClass]="dialog.iconBg">
            <lucide-icon [name]="dialog.icon" [size]="22" [ngClass]="dialog.iconColor"></lucide-icon>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-text-primary">{{ dialog.name }}</h3>
            <p class="text-xs text-text-secondary">{{ dialog.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Рендер всех модальных окон -->
    <app-kilbil-search-dialog  [open]="activeModal === 'search'"   (onClose)="closeDialog()" />
    <app-kilbil-found-dialog   [open]="activeModal === 'found'"    (onClose)="closeDialog()" />
    <!-- ...остальные диалоги... -->
  `,
})
export class KilbilOverviewComponent {
  activeModal: ModalType = null;

  openDialog(type: ModalType): void {
    this.activeModal = type;
    if (type === 'loading') {
      setTimeout(() => { this.activeModal = null; }, 3000);
    }
  }

  closeDialog(): void {
    this.activeModal = null;
  }
}
```

---

## 13. Чеклист нового прототипа Kilbil

### Файловая структура

- [ ] `PosDialogComponent` — обёртка модалки
- [ ] `KilbilSearchDialogComponent` — поиск клиента
- [ ] `KilbilFoundDialogComponent` — клиент найден
- [ ] `KilbilNotFoundDialogComponent` — клиент не найден
- [ ] `KilbilBlockedDialogComponent` — карта заблокирована
- [ ] `KilbilPaymentDialogComponent` — оплата заказа
- [ ] `KilbilAccumulateDialogComponent` — только накопление
- [ ] `KilbilRegistrationDialogComponent` — регистрация клиента
- [ ] `KilbilSuccessDialogComponent` — оплата успешна
- [ ] `KilbilLoadingDialogComponent` — загрузка
- [ ] `KilbilErrorDialogComponent` — ошибка соединения (светлая)
- [ ] `KilbilNetworkErrorDialogComponent` — ошибка сети (тёмная)
- [ ] `types.ts` — типы данных
- [ ] `mock-data.ts` — мок-данные

### Каждый диалог

- [ ] Standalone-компонент с `@Input() open` и `@Output() onClose`
- [ ] Обёрнут в `<pos-dialog>` (кроме loading и error — свои обёртки)
- [ ] Правильный размер (`sm` / `md` / `lg` / `xl` — см. раздел 6.1)
- [ ] Заголовок: `text-2xl font-bold text-[#b8c959] text-center`
- [ ] Кнопки footer: `h-14 bg-[#1a1a1a]`, `grid grid-cols-2 gap-3`
- [ ] Анимации: `animate-fade-in` + `animate-scale-in`

### Интерактивность

- [ ] Все кнопки кликабельны — переключают `activeModal`
- [ ] Формы работают (двусторонняя привязка `[(ngModel)]`)
- [ ] Numpad работает (ввод цифр, backspace, clear)
- [ ] Форматирование телефона (+7 маска)
- [ ] Loading автозакрывается через 3 сек
- [ ] Escape закрывает модалку (кроме loading, network-error)
- [ ] Overlay-клик закрывает модалку (кроме loading, network-error)

### Визуальный стиль

- [ ] Тёмная POS-тема: `bg-[#3a3a3a]`, `text-white`
- [ ] Кнопки: `h-14 bg-[#1a1a1a] hover:bg-[#252525]`
- [ ] Инпуты: `h-12 bg-white text-black rounded outline-none`
- [ ] Акцент `#b8c959` для заголовков и ключевых чисел
- [ ] Карточки данных: `bg-white text-black p-4 rounded`
- [ ] Блок итого: `bg-[#2d2d2d] p-4 rounded`
- [ ] Иконки-статусы в кругах (`rounded-full bg-COLOR/20 p-6`)
- [ ] Numpad: `h-16 bg-white text-2xl border border-gray-300 rounded`

---

## 14. Шаблон промта для генерации прототипа

```
Создай прототип плагина «Kilbil» для кассового терминала iikoFront.

Стилистика:
- Опирайся на STYLE_GUIDE_KILBIL.md
- Тёмная POS-тема: фон модалки #3a3a3a, кнопки #1a1a1a, акцент #b8c959
- Все модалки через PosDialogComponent (тёмная обёртка: overlay bg-black/50 + контент bg-[#3a3a3a])
- Loading и Error — свои обёртки на белом фоне (bg-white)
- Крупные элементы для тач-экранов: кнопки h-14 (56px), инпуты h-12 (48px), numpad h-16 (64px)
- Типографика: заголовки text-2xl font-bold text-[#b8c959] text-center

Диалоги (11 шт):
1. Поиск клиента (LG) — numpad + переключатель телефон/карта
2. Клиент найден (LG) — данные + 4 карточки + блок бонусов
3. Клиент не найден (MD) — оранжевая иконка + вертикальные кнопки
4. Карта заблокирована (MD) — красная иконка + 2 кнопки
5. Оплата заказа (LG) — промокод + списание бонусов + итого
6. Только накопление (LG) — info-баннер + итого
7. Регистрация (XL) — форма 2 колонки + 5 кнопок
8. Оплата успешна (SM) — большая иконка с пульсацией + итоги на белом фоне
9. Загрузка (SM, светлая) — спиннер, без кнопок, автозакрытие 3 сек
10. Ошибка (MD, светлая) — wifi-off, «Повторить» / «Закрыть»
11. Ошибка сети (MD, тёмная) — wifi-off, closable=false

Навигация: State-машина activeModal, без роутинга между диалогами.
```

---

## 15. Отличия Kilbil от «Премиум бонус»

| Аспект | Kilbil | Премиум бонус |
|--------|--------|---------------|
| **Название в заголовке** | «Kilbil» | «Премиум бонус» |
| **Визуальный стиль** | **Идентичный** | Референс |
| **Набор диалогов** | **Идентичный** (11 шт) | 11 диалогов |
| **Бизнес-логика** | Kilbil программа лояльности | Абстрактная программа лояльности |
| **Мок-данные** | `program_name: 'Kilbil Бонус'` | `program_name: 'Премиум бонус'` |

> **Ключевой принцип:** Прототип Kilbil стилистически является **точной копией** «Премиум бонус». Все цвета, размеры, отступы, шрифты, поведение — идентичны. Меняются только тексты и бизнес-данные.
