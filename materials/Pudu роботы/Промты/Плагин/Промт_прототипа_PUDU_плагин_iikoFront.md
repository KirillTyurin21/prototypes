# Промт для прототипа плагина iikoFront: Управление роботами PUDU (POS-терминал)

---
**Версия**: 1.0
**Дата**: 2026-02-11
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д4 (Промт для прототипа плагина iikoFront)
**Источники**: SPEC-003 v1.1; 04-Технические-требования/STYLE_GUIDE.md; Промт_прототипа_PUDU_Admin_панели.md (эталон Д3); План работ (В10)
---

## Назначение прототипа

Функциональный веб-прототип, **имитирующий POS-терминал iikoFront** с модальными окнами плагина управления роботами PUDU. Прототип предназначен для **демонстрации** руководителю интеграционных решений (Руслан, iiko) и заказчику (Next Era). Это **не production-код**, но должен показывать реальные модалки, кнопки сценариев, переходы между состояниями, уведомления об ошибках и POS-стилистику.

**Целевая аудитория демо**: руководство iiko + заказчик NE.

> **Ключевое отличие от прототипа iikoWeb (Д3)**: Прототип Д4 — это **тёмная POS-тема** с модальными диалогами поверх имитированного экрана кассы, а НЕ светлая панель администрирования с sidebar-навигацией. Стилистика определяется `04-Технические-требования/STYLE_GUIDE.md`, а не `07-Справочные-материалы/STYLE_GUIDE.md`.

---

## Описание проекта

Создай прототип плагина управления роботами PUDU для кассового терминала iikoFront. Это **Angular standalone** приложение с **Tailwind CSS** и иконками **Lucide (lucide-angular)**. Приложение представляет собой имитацию экрана заказа POS-терминала ресторана iiko с наложенными модальными диалогами плагина PUDU.

Плагин позволяет официанту/кассиру:
- Отправить меню к столу (send_menu)
- Вызвать робота для уборки посуды (cleanup)
- Управлять оплатой по QR-коду — двухфазный процесс: кассир → гость (qr_payment)
- Видеть индикатор маркетингового круиза (marketing)
- Получать уведомления только при ошибках

Все данные хранятся в клиентском state (mock). Все тексты — на **русском языке**.

> **Примечание**: Сценарий «Доставка блюд» (send_dish) имеет статус [BLOCKED] из-за нерешённой проблемы раздачи (нет терминала на раздаче). В прототипе кнопка **отображается**, но при нажатии показывает диалог-заглушку с пометкой «В разработке».

---

## 1. Дизайн и стиль

> **КРИТИЧЕСКИ ВАЖНО**: Стиль строится на **тёмной POS-теме** с четырьмя уровнями серого и жёлто-зелёным акцентом. Крупные элементы для сенсорных экранов. Все модалки через кастомный `PosDialogComponent`.

### 1.1. Цветовая схема (POS-тема, тёмная)

| Токен | HEX / Tailwind | Применение |
|-------|---------------|------------|
| Фон экрана кассы | `bg-[#2d2d2d]` | Основной фон имитации POS |
| Фон модалки | `bg-[#3a3a3a]` | Основной фон DialogContent |
| Фон секций | `bg-[#2d2d2d]` | Блоки итого, вторичные секции |
| Фон кнопок | `bg-[#1a1a1a]` | Все стандартные кнопки |
| Hover кнопок | `hover:bg-[#252525]` | Состояние наведения |
| Акцент (лайм) | `#b8c959` | Заголовки модалок, акцентные действия |
| Hover акцента | `hover:bg-[#c5d466]` | Hover на акцентных кнопках |
| Основной текст | `text-white` | Весь текст на тёмном фоне |
| Вторичный текст | `text-gray-300` | Подзаголовки, labels |
| Третичный текст | `text-gray-400` | Подписи, ghost-кнопки |
| Текст на белом фоне | `text-gray-600` | Labels внутри белых карточек |
| Overlay | `bg-black/50` | Затемнение под модалкой |
| Разделители | `bg-gray-600` | Горизонтальные линии (`h-px`) |

```
Формула 4 уровней серого:
#1a1a1a (кнопки) → #252525 (hover) → #2d2d2d (секции/фон POS) → #3a3a3a (фон модалки)
```

### 1.2. Статусные цвета

| Статус | Иконка Lucide | Цвет иконки | Фон круга | Пример |
|--------|--------------|------------|-----------|--------|
| Успех | `check-circle-2` | `text-[#b8c959]` | `bg-[#b8c959]/20` | Задача выполнена |
| Предупреждение | `alert-circle` | `text-orange-400` | `bg-orange-500/20` | Стол не замаплен |
| Ошибка | `alert-circle` | `text-red-400` | `bg-red-500/20` | Робот не найден, NE недоступен. Осознанный выбор вместо `shield-alert` (STYLE_GUIDE) — в PUDU-контексте `alert-circle` семантически точнее для сетевых/аппаратных ошибок |
| Загрузка | `loader-2` | `text-gray-400` | — | Спиннер `animate-spin` |

### 1.3. Типографика

| Уровень | Классы | Размер | Контекст |
|---------|--------|--------|----------|
| Заголовок модалки | `text-2xl font-normal text-[#b8c959] text-center` | 24px | «Отправить меню», «Уборка посуды» |
| Подзаголовок | `text-base text-center text-gray-300` | 14px | Инструкция под заголовком |
| Заголовок секции | `text-lg font-semibold text-white` | 16px | «Информация о задаче» |
| Label формы | `text-sm text-gray-300` | 12px | Подписи к полям |
| Body-текст | `text-sm text-gray-300` | 12px | Описания, пояснения |
| Крупное число/таймер | `text-3xl font-bold text-[#b8c959]` | 30px | Обратный отсчёт «0:25» |
| Мета-текст | `text-xs text-gray-400` | 11px | Подсказки, примечания |
| Шрифт | **Roboto** | — | Наследуется из Angular-проекта |

### 1.4. Размеры модалок (PosDialogComponent)

| Размер | Tailwind | Пиксели | Контекст |
|--------|----------|---------|----------|
| SM | `max-w-[350px]` | 350px | Loading, простые успехи |
| MD | `max-w-[500px]` | 500px | Подтверждения, ошибки, фазы QR |
| LG | `max-w-[600px]` | 600px | Расширенные диалоги |
| XL | `max-w-[700px]` | 700px | Зарезервирован (2 колонки, если потребуется) |

### 1.5. Высоты интерактивных элементов

| Элемент | Высота | Tailwind | Пояснение |
|---------|--------|----------|-----------|
| Кнопки footer / сценариев | **56px** | `h-14` | Большие, для тач-экранов |
| Input-поля POS | **48px** | `h-12` | Увеличенные для тач |
| Кнопки на экране кассы | **56px** | `h-14` | Кнопки сценариев PUDU |

### 1.6. Padding и Spacing

| Контекст | Значение | Tailwind |
|----------|----------|----------|
| Padding модалки | 32px | `p-8` |
| Gap между секциями | 24px | `space-y-6` |
| Gap внутри секции | 20px | `space-y-5` |
| Gap между кнопками | 12px | `gap-3` |
| Border-radius модалки | 8px | `rounded-lg` |
| Border-radius кнопок | 4px | `rounded` |

---

## 2. Архитектура приложения

### 2.1. Каркас: Имитация POS-терминала

Приложение имитирует экран заказа кассового терминала iikoFront. Основной экран — тёмный фон с mock-данными заказа. Поверх него — модальные диалоги плагина PUDU.

```
┌───────────────────────────────────────────────────────────────┐
│                  ИМИТАЦИЯ POS-ТЕРМИНАЛА iikoFront              │
│  bg-[#2d2d2d], min-h-screen                                   │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  HEADER ЗАКАЗА                                          │   │
│  │  «Стол №3 (VIP)  ·  Заказ #1042  ·  Официант: Мария»  │   │
│  │  bg-[#1a1a1a], h-14, text-white                         │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  СПИСОК БЛЮД (mock)                                     │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ 1× Том Ям                              450 ₽    │  │   │
│  │  │ 2× Филадельфия Классик                  980 ₽    │  │   │
│  │  │ 1× Стейк Рибай                        1 850 ₽    │  │   │
│  │  │ 2× Лимонад Манго-Маракуйя              480 ₽    │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ИТОГО: 3 760 ₽                   bg-[#2d2d2d] p-4    │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  ПАНЕЛЬ КНОПОК PUDU                                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ Отправить│ │ Уборка   │ │ Доставка │ │Маркетинг │  │   │
│  │  │ меню     │ │ посуды   │ │ блюд     │ │          │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  h-14, bg-[#1a1a1a], grid grid-cols-4 gap-3, p-4       │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │  УВЕДОМЛЕНИЯ (overlay, правый нижний угол)              │   │
│  │  Красная/розовая плашка ошибки (если есть)             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─ МОДАЛЬНЫЙ ДИАЛОГ ПЛАГИНА (PosDialogComponent) ─────────┐ │
│  │  overlay bg-black/50 → контент bg-[#3a3a3a] rounded-lg  │ │
│  │  animate-fade-in + animate-scale-in                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 2.2. Навигация: State-машина (не роутер)

Модалки **НЕ маршрутизируются** через URL. Переключение — через переменную `activeModal`:

```typescript
type PuduModalType =
  // Сценарий: Отправить меню
  | 'send_menu_confirm'        // Диалог подтверждения отправки меню
  // Сценарий: Уборка посуды
  | 'cleanup_confirm'          // Диалог подтверждения уборки
  // Сценарий: Оплата по QR
  | 'qr_cashier_phase'         // Фаза «кассир»: робот у кассы, ожидание чека
  | 'qr_guest_phase'           // Фаза «гость»: робот у стола, QR на экране
  | 'qr_success'               // Оплата прошла успешно
  | 'qr_timeout'               // Тайм-аут оплаты
  // Сценарий: Доставка блюд [BLOCKED]
  | 'send_dish_blocked'        // Заглушка «В разработке»
  // Общие
  | 'loading'                  // Универсальный Loading (SM, светлая тема)
  | 'error'                    // Универсальная ошибка (MD)
  | 'success'                  // Универсальный успех (SM)
  | 'unmapped_table'           // Предупреждение «Стол не замаплен»
  | null;                      // Нет открытых модалок (экран кассы)

activeModal: PuduModalType = null;
```

### 2.3. Карта переходов между состояниями

```
Экран заказа (activeModal = null)
│
├── Клик «Отправить меню» ─►
│   ├── Стол замаплен? ─ Да ──► 'send_menu_confirm'
│   │                            │
│   │                            ├── «Отмена» ──► null
│   │                            └── «Отправить» ──► 'loading' (3 сек)
│   │                                                 ├── Успех ──► 'success' (автозакрытие 2 сек) ──► null
│   │                                                 └── Ошибка ──► 'error'
│   │                                                                ├── «Повторить» ──► 'loading'
│   │                                                                └── «Закрыть» ──► null
│   └── Стол НЕ замаплен? ─► 'unmapped_table'
│                              └── «Закрыть» ──► null
│
├── Клик «Уборка» ─►
│   ├── Стол замаплен? ─ Да ──► 'cleanup_confirm'
│   │                            │
│   │                            ├── «Отмена» ──► null
│   │                            └── «Отправить» ──► 'loading' (3 сек)
│   │                                                 ├── Успех ──► 'success' ──► null
│   │                                                 └── Ошибка ──► 'error'
│   └── Стол НЕ замаплен? ─► 'unmapped_table'
│
├── Клик «Доставка блюд» ─► 'send_dish_blocked'
│                             └── «Закрыть» ──► null
│
├── [Автоматически при фискализации СБП] ─► 'qr_cashier_phase'
│   │
│   ├── «Отправить к гостю» (Next) ──► 'loading' (2 сек) ──► 'qr_guest_phase'
│   │                                                          │
│   │                                                          ├── Оплата прошла ──► 'qr_success' ──► null
│   │                                                          └── Тайм-аут ──► 'qr_timeout'
│   │                                                                            ├── «Закрыть» ──► null
│   │                                                                            └── (уведомление кассиру)
│   └── Тайм-аут у кассира ──► 'qr_timeout'
│                                └── (уведомление кассиру)
│
└── Клик «Маркетинг» ─►
    └── Переключение индикатора круиза (на основном экране, без модалки)
```

---

## 3. Компоненты

### 3.1. PosDialogComponent — базовая обёртка модалки

Все POS-модалки используют **кастомный** `PosDialogComponent`:

```html
<!-- Обёртка — overlay + контейнер -->
<div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
  <!-- Backdrop -->
  <div class="absolute inset-0 bg-black/50" (click)="onOverlayClick()"></div>
  <!-- Контент модалки -->
  <div class="relative rounded-lg p-8 animate-scale-in w-full mx-4"
       [ngClass]="[maxWidthClass, theme === 'dark' ? 'bg-[#3a3a3a] text-white' : 'bg-white text-gray-900']">
    <ng-content></ng-content>
  </div>
</div>
```

**Функции:**
- `@Input() open: boolean` — видимость
- `@Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl'` — размер (default: `md`)
- `@Input() theme: 'dark' | 'light'` — тема (default: `dark`). `dark` → `bg-[#3a3a3a] text-white`, `light` → `bg-white text-gray-900`
- `@Input() closable: boolean` — можно ли закрыть по overlay / Escape (default: `true`)
- `@Output() dialogClose` — событие закрытия
- Закрытие по Escape (HostListener)
- Закрытие по клику на overlay (отключается через `[closable]="false"`)
- Анимации: `animate-fade-in` (overlay) + `animate-scale-in` (контент)

**Правило**: Loading-диалог — `closable="false"` (нет крестика, нельзя закрыть по overlay).

### 3.2. Заголовок модалки (Header)

```html
<h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">
  Название диалога
</h2>
<p class="text-base text-center text-gray-300 mb-6">
  Инструкция для оператора
</p>
```

### 3.3. Кнопки Footer — стандартная пара

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

### 3.4. Кнопка акцентная (важное действие)

```html
<button (click)="onAction()"
  class="h-14 bg-[#b8c959] text-black rounded text-base font-bold hover:bg-[#c5d466] transition-colors w-full">
  Отправить к гостю
</button>
```

### 3.5. Иконка-индикатор в круге (статус)

```html
<!-- Успех -->
<div class="rounded-full bg-[#b8c959]/20 p-6 mx-auto w-fit">
  <lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959]"></lucide-icon>
</div>

<!-- Предупреждение -->
<div class="rounded-full bg-orange-500/20 p-6 mx-auto w-fit">
  <lucide-icon name="alert-circle" [size]="48" class="text-orange-400"></lucide-icon>
</div>

<!-- Ошибка -->
<div class="rounded-full bg-red-500/20 p-6 mx-auto w-fit">
  <lucide-icon name="alert-circle" [size]="48" class="text-red-400"></lucide-icon>
</div>

<!-- Загрузка -->
<lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
```

### 3.6. Info-баннер (предупреждение)

```html
<div class="flex gap-3 bg-orange-500/20 border border-orange-500/40 rounded p-4">
  <lucide-icon name="info" [size]="20" class="shrink-0 text-orange-400 mt-0.5"></lucide-icon>
  <div>
    <p class="text-sm text-white font-medium mb-1">Заголовок предупреждения</p>
    <p class="text-sm text-gray-300">Описание ситуации и что делать.</p>
  </div>
</div>
```

### 3.7. Toast-уведомление об ошибке (плашка)

```html
<!-- Фиксированное уведомление об ошибке — правый нижний угол -->
<div *ngIf="hasError" class="fixed bottom-6 right-6 z-[60] animate-slide-up">
  <div class="bg-red-500/90 text-white rounded-lg p-4 shadow-lg max-w-sm flex items-start gap-3">
    <lucide-icon name="alert-circle" [size]="20" class="shrink-0 mt-0.5"></lucide-icon>
    <div class="flex-1">
      <p class="text-sm font-medium">{{ errorTitle }}</p>
      <p class="text-xs text-red-100 mt-1">{{ errorMessage }}</p>
    </div>
    <button (click)="dismissError()" class="text-red-200 hover:text-white transition-colors">
      <lucide-icon name="x" [size]="16"></lucide-icon>
    </button>
  </div>
</div>
```

**Правило**: Уведомления показываются **только при ошибках**. Успешное завершение задачи — **без уведомления** (решение Руслана, чтобы не «задолбить» официантов уведомлениями).

### 3.8. Индикатор маркетингового круиза

```html
<!-- Индикатор на основном экране (не модалка) -->
<div *ngIf="isCruiseActive" class="flex items-center gap-2 bg-[#b8c959]/20 border border-[#b8c959] rounded px-4 py-2">
  <lucide-icon name="radio" [size]="18" class="text-[#b8c959] animate-pulse"></lucide-icon>
  <span class="text-sm text-[#b8c959] font-medium">Маркетинг-круиз активен</span>
  <button (click)="stopCruise()" class="ml-auto text-xs text-gray-400 hover:text-white transition-colors">
    Остановить
  </button>
</div>
```

---

## 4. Структуры данных (TypeScript интерфейсы)

```typescript
// Робот PUDU (mock)
interface PuduRobot {
  robot_id: string;              // "PD2024060001"
  robot_name: string;            // "BellaBot-01"
  status: 'idle' | 'busy' | 'offline';
}

// Стол iiko (mock, из контекста заказа)
interface OrderTable {
  table_id: string;              // "tbl-003"
  table_name: string;            // "Стол №3 (VIP)"
  is_mapped: boolean;            // true = есть маппинг на точку робота
}

// Блюдо в заказе (mock)
interface OrderItem {
  name: string;                  // "Том Ям"
  quantity: number;              // 1
  price: number;                 // 450
}

// Задача робота
interface RobotTask {
  task_id: string;               // "task-001"
  task_type: 'send_menu' | 'cleanup' | 'qr_payment' | 'send_dish' | 'marketing';
  status: 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
        | 'completed' | 'error' | 'cancelled' | 'cashier_timeout' | 'payment_timeout';
  table_id: string;
  robot_name: string;
  created_at: Date;
}

// Уведомление об ошибке
interface PuduNotification {
  id: string;
  type: 'error';
  title: string;                 // "Робот BellaBot-01: ошибка при уборке"
  message: string;               // "error_code: ROBOT_BUSY"
  timestamp: Date;
  dismissed: boolean;
}

// Тип модального окна
type PuduModalType =
  | 'send_menu_confirm'
  | 'cleanup_confirm'
  | 'qr_cashier_phase'
  | 'qr_guest_phase'
  | 'qr_success'
  | 'qr_timeout'
  | 'send_dish_blocked'
  | 'loading'
  | 'error'
  | 'success'
  | 'unmapped_table'
  | null;
```

---

## 5. Mock-данные (реалистичные для POS-демонстрации)

### 5.1. Текущий заказ (контекст экрана)

```typescript
const mockCurrentOrder = {
  order_id: "1042",
  table: {
    table_id: "tbl-003",
    table_name: "Стол №3 (VIP)",
    is_mapped: true
  },
  waiter_name: "Мария",
  items: [
    { name: "Том Ям",                    quantity: 1, price: 450 },
    { name: "Филадельфия Классик",        quantity: 2, price: 490 },
    { name: "Стейк Рибай",               quantity: 1, price: 1850 },
    { name: "Лимонад Манго-Маракуйя",    quantity: 2, price: 240 }
  ],
  total: 3760,
  payment_type: null   // null | "cash" | "card" | "sbp"
};
```

### 5.2. Столы iiko (для демо переключения)

```typescript
const mockTables: OrderTable[] = [
  { table_id: "tbl-001", table_name: "Стол №1",          is_mapped: true },
  { table_id: "tbl-002", table_name: "Стол №2",          is_mapped: true },
  { table_id: "tbl-003", table_name: "Стол №3 (VIP)",    is_mapped: true },
  { table_id: "tbl-004", table_name: "Стол №4 (бар)",    is_mapped: true },
  { table_id: "tbl-005", table_name: "Стол №5",          is_mapped: false },
  { table_id: "tbl-006", table_name: "Стол №6 (терраса)",is_mapped: true },
  { table_id: "tbl-007", table_name: "Стол №7",          is_mapped: false },
  { table_id: "tbl-008", table_name: "Стол №8",          is_mapped: true },
  { table_id: "tbl-009", table_name: "Стол №9",          is_mapped: true },
  { table_id: "tbl-010", table_name: "Стол №10",         is_mapped: false },
  { table_id: "tbl-011", table_name: "Стол №11 (веранда)",is_mapped: true },
  { table_id: "tbl-012", table_name: "Стол №12",         is_mapped: true },
  { table_id: "tbl-013", table_name: "Стол №13",         is_mapped: false },
  { table_id: "tbl-014", table_name: "Стол №14",         is_mapped: true },
  { table_id: "tbl-015", table_name: "Стол №15 (кабинет)",is_mapped: true }
];
```

### 5.3. Маппинг стол → точка PUDU (справочный)

```typescript
// Маппинг используется iikoWeb; POS-плагин работает только с is_mapped.
// Данные приведены для полноты контекста mock-окружения.
const mockTablePointMapping = [
  { table_id: "tbl-001", point_id: "pt-001", point_name: "Стол у окна" },
  { table_id: "tbl-002", point_id: "pt-002", point_name: "Стол 2" },
  { table_id: "tbl-003", point_id: "pt-003", point_name: "Стол 3 (VIP)" },
  { table_id: "tbl-004", point_id: "pt-004", point_name: "Стол 4 (бар)" },
  { table_id: "tbl-006", point_id: "pt-006", point_name: "Стол 6 (терраса)" },
  { table_id: "tbl-008", point_id: "pt-008", point_name: "Стол 8" },
  { table_id: "tbl-009", point_id: "pt-009", point_name: "Стол 9" },
  { table_id: "tbl-011", point_id: "pt-011", point_name: "Стол 11 (веранда)" },
  { table_id: "tbl-012", point_id: "pt-012", point_name: "Стол 12" },
  { table_id: "tbl-014", point_id: "pt-014", point_name: "Стол 14" },
  { table_id: "tbl-015", point_id: "pt-015", point_name: "Стол 15 (кабинет)" }
];
// Столы без маппинга: tbl-005, tbl-007, tbl-010, tbl-013
```

### 5.4. Роботы

```typescript
const mockRobots: PuduRobot[] = [
  { robot_id: "PD2024060001", robot_name: "BellaBot-01", status: "idle" },
  { robot_id: "PD2024080042", robot_name: "Ketty-02",    status: "busy" }
];
```

### 5.5. Активные задачи (для демо polling)

```typescript
const mockActiveTasks: RobotTask[] = [
  {
    task_id: "task-078",
    task_type: "cleanup",
    status: "in_progress",
    table_id: "tbl-005",
    robot_name: "BellaBot-01",
    created_at: new Date('2026-02-11T14:20:00')
  }
];
```

### 5.6. Настройки сценариев (из iiko Web)

```typescript
const mockScenarioSettings = {
  send_menu: {
    phrase: "Заберите, пожалуйста, меню",
    wait_time: 30,
    after_action: "idle"
  },
  cleanup: {
    phrase_arrival: "Пожалуйста, поставьте грязную посуду на поднос",
    wait_time: 90,
    phrase_later: "Я приеду позже за посудой"
  },
  qr_payment: {
    cashier_phrase: "Положите чек для стола {N}",
    cashier_timeout: 30,
    guest_wait_time: 120,
    phrase_success: "Спасибо за оплату!",
    phrase_failure: "К сожалению, оплата не прошла. Обратитесь к официанту",
    after_action: "idle"
  },
  marketing: {
    robot_id: "PD2024080042",
    auto_cruise_on_idle: true
  },
  general: {
    default_robot_id: "PD2024060001"
  }
};
```

### 5.7. Примеры уведомлений (для демо)

```typescript
const mockNotifications: PuduNotification[] = [
  {
    id: "notif-001",
    type: "error",
    title: "Робот BellaBot-01: ошибка при уборке",
    message: "Код ошибки: ROBOT_STUCK. Проверьте препятствия на маршруте",
    timestamp: new Date('2026-02-11T14:22:30'),
    dismissed: false
  },
  {
    id: "notif-002",
    type: "error",
    title: "Сервер роботов недоступен",
    message: "NE API не отвечает. Повтор через 5 сек...",
    timestamp: new Date('2026-02-11T14:23:00'),
    dismissed: false
  }
];
```

---

## 6. Модальные окна прототипа

### 6.1. Экран М0 — Имитация экрана заказа iikoFront (основной каркас)

**Приоритет**: **Must**

**Описание**: Тёмный фон, имитирующий экран заказа POS-терминала. Содержит header с информацией о заказе, список блюд (mock), блок итого и панель кнопок PUDU.

**Header заказа** (`bg-[#1a1a1a]`, `h-14`, `flex items-center px-4`):
- Слева: «Стол №3 (VIP)» (`text-lg font-semibold text-white`)
- Центр: «Заказ #1042» (`text-sm text-gray-400`)
- Справа: «Мария» (`text-sm text-gray-300`, иконка `user`, size 16)

**Список блюд** (`space-y-2`, `p-4`):

| Стилизация строки | Tailwind |
|---|---|
| Контейнер | `flex justify-between items-center py-2 border-b border-gray-600/30` |
| Название блюда | `text-sm text-white` |
| Количество | `text-sm text-gray-400` — перед названием: «1×» |
| Цена | `text-sm text-white font-medium text-right` |

**Блок итого** (`bg-[#2d2d2d]`, `rounded`, `p-4`, `mx-4`):
```html
<div class="flex justify-between text-xl font-bold">
  <span class="text-white">Итого:</span>
  <span class="text-[#b8c959]">3 760 ₽</span>
</div>
```

**Панель кнопок PUDU** (`grid grid-cols-4 gap-3`, `p-4`, `border-t border-gray-600`):

| # | Кнопка | Иконка Lucide | Действие | Статус |
|---|--------|--------------|----------|--------|
| 1 | Отправить меню | `utensils` | `activeModal = 'send_menu_confirm'` | Активна |
| 2 | Уборка посуды | `trash-2` | `activeModal = 'cleanup_confirm'` | Активна |
| 3 | Доставка блюд | `package` | `activeModal = 'send_dish_blocked'` | [BLOCKED] — серый оттенок (`opacity-60`) |
| 4 | Маркетинг | `radio` | Toggle `isCruiseActive` | Активна |

**Стилизация кнопки PUDU**:
```html
<button class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded flex flex-col items-center justify-center gap-1 transition-colors">
  <lucide-icon name="utensils" [size]="20"></lucide-icon>
  <span class="text-xs">Отправить меню</span>
</button>
```

**Индикатор маркетинга** (при `isCruiseActive = true`): accentная плашка между блоком итого и панелью кнопок (см. раздел 3.8).

**Зона уведомлений**: Правый нижний угол (`fixed bottom-6 right-6`). Toast-плашки ошибок, стек до 3 уведомлений (`space-y-2`).

**Интерактивность прототипа**:
- При загрузке: показать mock-заказ со всеми блюдами
- Кнопка «Отправить меню» → открывает диалог М1
- Кнопка «Уборка» → открывает диалог М2
- Кнопка «Доставка блюд» → открывает М8 (заглушка)
- Кнопка «Маркетинг» → toggle индикатора круиза
- Кнопка демо «Показать ошибку» (вспомогательная, `text-xs text-gray-400`, под панелью кнопок) → push mock-уведомления
- Кнопка демо «Оплата по QR (СБП)» (вспомогательная) → `activeModal = 'qr_cashier_phase'`

---

### 6.2. Диалог М1 — Подтверждение отправки меню (send_menu_confirm)

**Приоритет**: **Must** | **Размер**: MD (500px) | **Тема**: Тёмная

**Заголовок**: «Отправить меню»
**Подзаголовок**: «Робот доставит меню к столу»

**Body** (`space-y-5 mb-6`):

Карточка информации (белая на тёмном):
```html
<div class="bg-white text-black p-4 rounded space-y-2">
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Стол</span>
    <span class="text-sm font-medium">Стол №3 (VIP)</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Робот</span>
    <span class="text-sm font-medium">BellaBot-01</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Фраза</span>
    <span class="text-sm font-medium italic">«Заберите, пожалуйста, меню»</span>
  </div>
</div>
```

**Footer** — стандартная пара:
- «Отмена» → `activeModal = null`
- «Отправить» → `activeModal = 'loading'`

**При нажатии «Отправить»**: Loading 3 сек → `activeModal = 'success'` (автозакрытие 2 сек → null).

---

### 6.3. Диалог М2 — Подтверждение уборки (cleanup_confirm)

**Приоритет**: **Must** | **Размер**: MD (500px) | **Тема**: Тёмная

**Заголовок**: «Уборка посуды»
**Подзаголовок**: «Робот заберёт посуду со стола»

**Body** (`space-y-5 mb-6`):

Карточка информации (аналогично М1):
```html
<div class="bg-white text-black p-4 rounded space-y-2">
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Стол</span>
    <span class="text-sm font-medium">Стол №3 (VIP)</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Робот</span>
    <span class="text-sm font-medium">BellaBot-01</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Фраза</span>
    <span class="text-sm font-medium italic">«Пожалуйста, поставьте грязную посуду на поднос»</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Ожидание</span>
    <span class="text-sm font-medium">90 сек</span>
  </div>
</div>
```

**Footer**: «Отмена» / «Отправить» — аналогично М1.

---

### 6.4. Диалог М3 — QR-оплата: фаза «Кассир» (qr_cashier_phase)

**Приоритет**: **Must** | **Размер**: MD (500px) | **Тема**: Тёмная

**Заголовок**: «Оплата по QR»
**Подзаголовок**: «Робот у кассы — положите чек»

**Body** (`space-y-5 mb-6`):

1. **Иконка статуса** (центр):
```html
<div class="flex flex-col items-center text-center space-y-3">
  <div class="rounded-full bg-[#b8c959]/20 p-6">
    <lucide-icon name="printer" [size]="48" class="text-[#b8c959]"></lucide-icon>
  </div>
</div>
```

2. **Фраза робота** (акцентный блок):
```html
<div class="bg-[#b8c959]/20 border border-[#b8c959] rounded p-4 text-center">
  <p class="text-base text-white font-medium">«Положите чек для стола №3»</p>
</div>
```

3. **Информационная карточка** (белая):
```html
<div class="bg-white text-black p-4 rounded space-y-2">
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Стол</span>
    <span class="text-sm font-medium">Стол №3 (VIP)</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Сумма</span>
    <span class="text-sm font-medium">3 760 ₽</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Робот</span>
    <span class="text-sm font-medium">BellaBot-01</span>
  </div>
</div>
```

4. **Таймер обратного отсчёта** (центр):
```html
<div class="text-center">
  <p class="text-xs text-gray-400 mb-1">Тайм-аут ожидания</p>
  <p class="text-3xl font-bold text-[#b8c959]">{{ cashierCountdown }}</p>
</div>
```

Таймер: обратный отсчёт от `cashier_timeout` (30 сек, mock). При достижении 0 → `activeModal = 'qr_timeout'`.

**Footer**:
- «Отмена» → `activeModal = null` + уведомление «Задача QR отменена»
- **«Отправить к гостю»** (акцентная кнопка `bg-[#b8c959] text-black font-bold`) → `activeModal = 'loading'` (2 сек) → `activeModal = 'qr_guest_phase'`

> **Critical**: Кнопка «Отправить к гостю» — это аналог кнопки **Next** из спецификации. Она НЕ создаёт задачу, а **продолжает** уже существующую (`POST /tasks/{id}/next`).

---

### 6.5. Диалог М4 — QR-оплата: фаза «Гость» (qr_guest_phase)

**Приоритет**: **Should** | **Размер**: MD (500px) | **Тема**: Тёмная

**Заголовок**: «Ожидание оплаты»
**Подзаголовок**: «Робот у стола — гость сканирует QR»

**Body** (`space-y-5 mb-6`):

1. **Mock QR-код** (центрированный):
```html
<div class="flex flex-col items-center space-y-3">
  <div class="bg-white p-4 rounded-lg">
    <!-- Mock QR: используй SVG-заглушку 150×150 или img -->
    <div class="w-[150px] h-[150px] bg-gray-200 rounded flex items-center justify-center">
      <lucide-icon name="qr-code" [size]="80" class="text-gray-500"></lucide-icon>
    </div>
  </div>
  <p class="text-xs text-gray-400">Гость сканирует QR для оплаты</p>
</div>
```

2. **Информация**:
```html
<div class="bg-white text-black p-4 rounded space-y-2">
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Сумма к оплате</span>
    <span class="text-sm font-bold text-[#b8c959]">3 760 ₽</span>
  </div>
  <div class="flex justify-between">
    <span class="text-sm text-gray-600">Стол</span>
    <span class="text-sm font-medium">Стол №3 (VIP)</span>
  </div>
</div>
```

3. **Таймер ожидания оплаты**:
```html
<div class="text-center">
  <p class="text-xs text-gray-400 mb-1">Ожидание оплаты</p>
  <p class="text-3xl font-bold text-[#b8c959]">{{ paymentCountdown }}</p>
</div>
```

Таймер: обратный отсчёт от `guest_wait_time` (120 сек, mock). При 0 → `activeModal = 'qr_timeout'`.

**Footer** — одна кнопка:
- **«Оплата подтверждена»** (акцентная, для демонстрации) → `activeModal = 'qr_success'`

**Для демо**: Помимо таймера, кнопка «Оплата подтверждена» позволяет вручную имитировать успешную оплату. В реальности подтверждение приходит через callback платёжной системы.

---

### 6.6. Диалог М5 — QR-оплата: Успех (qr_success)

**Приоритет**: **Should** | **Размер**: SM (350px) | **Тема**: Тёмная

**Структура**: Паттерн «иконка-статус» (центрированный):
```html
<div class="flex flex-col items-center text-center space-y-4">
  <div class="rounded-full bg-[#b8c959]/20 p-6">
    <lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959]"></lucide-icon>
  </div>
  <h2 class="text-2xl font-normal text-[#b8c959]">Оплата прошла</h2>
  <p class="text-sm text-gray-300">«Спасибо за оплату!»</p>
  <p class="text-sm text-gray-400">Сумма: 3 760 ₽ · Стол №3 (VIP)</p>
</div>
```

**Footer**: Одна кнопка на всю ширину:
```html
<button (click)="activeModal = null"
  class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors">
  Готово
</button>
```

Автозакрытие через 3 сек → `activeModal = null`.

---

### 6.7. Диалог М6 — QR-оплата: Тайм-аут (qr_timeout)

**Приоритет**: **Should** | **Размер**: MD (500px) | **Тема**: Тёмная

**Структура**: Паттерн «иконка-статус»:
```html
<div class="flex flex-col items-center text-center space-y-4">
  <div class="rounded-full bg-orange-500/20 p-6">
    <lucide-icon name="alert-circle" [size]="48" class="text-orange-400"></lucide-icon>
  </div>
  <h2 class="text-2xl font-semibold text-orange-400">Тайм-аут ожидания</h2>
  <p class="text-sm text-gray-300">
    Время ожидания истекло. Робот возвращается на базу.
  </p>
</div>
```

**Footer**: Одна кнопка:
```html
<button (click)="activeModal = null"
  class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors">
  Закрыть
</button>
```

При закрытии → push уведомление: «Гость не оплатил заказ по QR. Стол №3 (VIP)».

---

### 6.8. Диалог М7 — Предупреждение «Стол не замаплен» (unmapped_table)

**Приоритет**: **Must** | **Размер**: MD (500px) | **Тема**: Тёмная

Появляется когда оператор нажимает кнопку сценария, но стол текущего заказа не привязан к точке робота.

**Структура**: Паттерн «иконка-статус»:
```html
<div class="flex flex-col items-center text-center space-y-4">
  <div class="rounded-full bg-orange-500/20 p-6">
    <lucide-icon name="alert-circle" [size]="48" class="text-orange-400"></lucide-icon>
  </div>
  <h2 class="text-2xl font-semibold text-orange-400">Стол не настроен</h2>
  <p class="text-sm text-gray-300">
    Стол «{{ currentTable.table_name }}» не привязан к точке робота.
  </p>
  <p class="text-sm text-gray-300">
    Настройте маппинг в <span class="text-[#b8c959] font-medium">iiko Web → Маппинг столов</span>.
  </p>
</div>
```

**Footer**: Одна кнопка:
```html
<button (click)="activeModal = null"
  class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors">
  Закрыть
</button>
```

**Для демо**: Добавь кнопку-переключатель `is_mapped` на основном экране (мелкая, `text-xs text-gray-400`), чтобы можно было имитировать оба случая.

---

### 6.9. Диалог М8 — Доставка блюд: Заглушка [BLOCKED] (send_dish_blocked)

**Приоритет**: **Could** | **Размер**: MD (500px) | **Тема**: Тёмная

```html
<div class="flex flex-col items-center text-center space-y-4">
  <div class="rounded-full bg-gray-600/30 p-6">
    <lucide-icon name="package" [size]="48" class="text-gray-400"></lucide-icon>
  </div>
  <h2 class="text-2xl font-normal text-gray-400">Доставка блюд</h2>
  <p class="text-sm text-gray-300">
    Сценарий находится в разработке.
  </p>
</div>
```

Info-баннер (оранжевый):
```html
<div class="flex gap-3 bg-orange-500/20 border border-orange-500/40 rounded p-4 mt-4">
  <lucide-icon name="info" [size]="20" class="shrink-0 text-orange-400 mt-0.5"></lucide-icon>
  <div>
    <p class="text-sm text-white font-medium mb-1">Статус: [BLOCKED]</p>
    <p class="text-sm text-gray-300">
      Требуется решение по терминалу на раздаче. Подробности — в ADR (02-Архитектура/).
    </p>
  </div>
</div>
```

**Footer**: Одна кнопка «Закрыть».

---

### 6.10. Диалог М9 — Loading (универсальный)

**Приоритет**: **Must** | **Размер**: SM (350px) | **Тема**: Светлая | **Closable**: false

```html
<pos-dialog [open]="activeModal === 'loading'" maxWidth="sm" theme="light" [closable]="false">
  <div class="flex flex-col items-center text-center space-y-4 py-4">
    <lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
    <h2 class="text-xl font-semibold text-gray-900">Выполняется...</h2>
    <p class="text-sm text-gray-500">Отправка команды роботу</p>
  </div>
</pos-dialog>
```

> **Warning**: Loading-диалог использует **светлую тему** (`bg-white`, `text-gray-900`) — это standard-паттерн из STYLE_GUIDE.md. Нет крестика, нельзя закрыть по overlay / Escape.

**Логика**: Автозакрытие через 3 сек → переход к `'success'` или `'error'` (рандомизация для демо: 80% успех, 20% ошибка).

---

### 6.11. Диалог М10 — Success (универсальный)

**Приоритет**: **Must** | **Размер**: SM (350px) | **Тема**: Тёмная

```html
<pos-dialog [open]="activeModal === 'success'" maxWidth="sm">
  <div class="flex flex-col items-center text-center space-y-4 py-4">
    <div class="rounded-full bg-[#b8c959]/20 p-6">
      <lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959] animate-pulse"></lucide-icon>
    </div>
    <h2 class="text-2xl font-normal text-[#b8c959]">Задача создана</h2>
    <p class="text-sm text-gray-300">Робот BellaBot-01 выполняет задачу</p>
  </div>
  <button (click)="activeModal = null"
    class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] rounded font-medium transition-colors mt-6">
    Готово
  </button>
</pos-dialog>
```

Автозакрытие через 2 сек → `activeModal = null`. **Без push-уведомления** (решение Руслана).

---

### 6.12. Диалог М11 — Error (универсальный)

**Приоритет**: **Must** | **Размер**: MD (500px) | **Тема**: Светлая

```html
<pos-dialog [open]="activeModal === 'error'" maxWidth="md" theme="light">
  <div class="flex flex-col items-center text-center space-y-4 py-4">
    <div class="rounded-full bg-red-500/20 p-6">
      <lucide-icon name="alert-circle" [size]="48" class="text-red-400"></lucide-icon>
    </div>
    <h2 class="text-xl font-semibold text-gray-900">Ошибка</h2>
    <p class="text-sm text-gray-500">
      Не удалось отправить команду роботу. Проверьте подключение к серверу NE.
    </p>
  </div>
  <div class="grid grid-cols-2 gap-3 mt-6">
    <button (click)="activeModal = null"
      class="h-14 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors">
      Закрыть
    </button>
    <button (click)="retry()"
      class="h-14 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 transition-colors">
      Повторить
    </button>
  </div>
</pos-dialog>
```

При нажатии «Повторить» → `activeModal = 'loading'` → повтор цикла.

---

## 7. Анимации

| Анимация | Класс | Контекст |
|----------|-------|----------|
| Появление overlay | `animate-fade-in` | Открытие модалки (0.2s ease-out) |
| Появление контента | `animate-scale-in` | Контент модалки (scale 0.95→1, 0.2s) |
| Спиннер | `animate-spin` | `loader-2` при загрузке |
| Пульсация | `animate-pulse` | Иконка успеха, индикатор маркетинга |
| Slide-up | `animate-slide-up` | Toast-уведомления ошибок (0.25s) |

**Определения CSS-анимаций** (добавить в глобальные стили):

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fade-in 0.2s ease-out; }
.animate-scale-in { animation: scale-in 0.2s ease-out; }
.animate-slide-up { animation: slide-up 0.25s ease-out; }
```

---

## 8. Иконки (Lucide)

### 8.1. Иконки по контексту прототипа

| Иконка | Контекст | Размер |
|--------|----------|--------|
| `utensils` | Кнопка «Отправить меню» | 20 |
| `trash-2` | Кнопка «Уборка посуды» | 20 |
| `package` | Кнопка «Доставка блюд» | 20–48 |
| `radio` | Кнопка/индикатор «Маркетинг» | 18–20 |
| `printer` | Фаза «кассир» (QR) — печать чека | 48 |
| `qr-code` | Фаза «гость» (QR) — заглушка QR | 80 |
| `check-circle-2` | Успех | 48 |
| `alert-circle` | Ошибка, предупреждение | 20–48 |
| `loader-2` | Загрузка (+ `animate-spin`) | 48 |
| `info` | Info-баннер | 20 |
| `x` | Закрытие toast-уведомления | 16 |
| `user` | Иконка официанта в header заказа | 16 |

### 8.2. Использование в Angular

```typescript
import { IconsModule } from '@/shared/icons.module';

// В template
<lucide-icon name="check-circle-2" [size]="48" class="text-[#b8c959]"></lucide-icon>
```

---

## 9. Вспомогательные элементы для демо

### 9.1. Демо-панель (внизу экрана)

Для презентации добавь тонкую панель (`fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-600 px-4 py-2`) с вспомогательными кнопками:

| # | Кнопка демо | Действие | Стиль |
|---|-------------|----------|-------|
| 1 | «Имитация: QR-оплата (СБП)» | `activeModal = 'qr_cashier_phase'` | `text-xs text-gray-400 hover:text-white` |
| 2 | «Имитация: Ошибка» | Push mock-уведомление об ошибке | `text-xs text-gray-400 hover:text-white` |
| 3 | «Стол замаплен: Да/Нет» | Toggle `currentOrder.table.is_mapped` | `text-xs text-gray-400 hover:text-white` |
| 4 | «Сменить стол» | Циклический переключатель mock-столов (замапленный / незамапленный) | `text-xs text-gray-400 hover:text-white` |

Панель помечена: «Демо-управление» (`text-xs text-gray-500 font-medium`).

### 9.2. Сценарий демонстрации (для презентации)

Рекомендуемый порядок демонстрации для руководства:

1. **Показать основной экран** — тёмная POS-тема, заказ со стола №3
2. **Отправить меню** → диалог подтверждения → Loading → Success
3. **Уборка** → аналогичный flow
4. **Переключить стол на незамапленный** → нажать «Уборка» → предупреждение «Стол не замаплен»
5. **QR-оплата** → фаза «кассир» (таймер) → «Отправить к гостю» → фаза «гость» (QR-код + таймер) → «Оплата подтверждена» → Успех
6. **QR тайм-аут** → повторить п.5, но дождаться истечения таймера → предупреждение
7. **Показать ошибку** → toast-уведомление в правом нижнем углу
8. **Маркетинг** → toggle индикатора круиза
9. **Доставка блюд** → заглушка [BLOCKED]

---

## 10. Структура файлов проекта

```
src/app/prototypes/iiko-front-pudu-plugin/
├── pudu-plugin.routes.ts                    # Маршруты
├── pudu-plugin-prototype.component.ts       # Корневой компонент (каркас POS + state-машина)
├── types.ts                                 # Все интерфейсы
├── data/
│   └── mock-data.ts                         # Все mock-данные
├── components/
│   ├── pos-dialog.component.ts              # PosDialogComponent (переиспользуемый)
│   ├── pos-header.component.ts              # Header заказа
│   ├── order-items-list.component.ts        # Список блюд
│   ├── pudu-buttons-panel.component.ts      # Панель кнопок PUDU (4 кнопки)
│   ├── cruise-indicator.component.ts        # Индикатор маркетинга
│   ├── error-toast.component.ts             # Toast-уведомление об ошибке
│   ├── demo-panel.component.ts              # Демо-панель управления
│   └── dialogs/
│       ├── send-menu-confirm.component.ts   # М1: Подтверждение отправки меню
│       ├── cleanup-confirm.component.ts     # М2: Подтверждение уборки
│       ├── qr-cashier-phase.component.ts    # М3: QR — фаза «кассир»
│       ├── qr-guest-phase.component.ts      # М4: QR — фаза «гость»
│       ├── qr-success.component.ts          # М5: QR — успех
│       ├── qr-timeout.component.ts          # М6: QR — тайм-аут
│       ├── unmapped-table.component.ts      # М7: Стол не замаплен
│       ├── send-dish-blocked.component.ts   # М8: Доставка блюд [BLOCKED]
│       ├── loading-dialog.component.ts      # М9: Loading (универсальный)
│       ├── success-dialog.component.ts      # М10: Success (универсальный)
│       └── error-dialog.component.ts        # М11: Error (универсальный)
```

---

## 11. Чеклист полноты прототипа

### Структура

- [ ] Каркас POS-терминала создан (тёмный фон, header заказа, список блюд, панель кнопок)
- [ ] `PosDialogComponent` реализован (sm / md / lg, overlay, Escape, `closable`)
- [ ] State-машина `activeModal` управляет всеми диалогами
- [ ] Mock-данные реалистичны (роботы, столы, блюда, настройки)
- [ ] Все файлы в структуре `src/app/prototypes/iiko-front-pudu-plugin/`

### Модальные окна

- [ ] М1: Подтверждение отправки меню (MD, тёмная)
- [ ] М2: Подтверждение уборки (MD, тёмная)
- [ ] М3: QR — фаза «кассир» (MD, тёмная, таймер, кнопка Next)
- [ ] М4: QR — фаза «гость» (MD, тёмная, mock QR, таймер)
- [ ] М5: QR — успех (SM, тёмная, автозакрытие)
- [ ] М6: QR — тайм-аут (MD, тёмная, предупреждение)
- [ ] М7: Стол не замаплен (MD, тёмная, предупреждение)
- [ ] М8: Доставка блюд [BLOCKED] (MD, тёмная, заглушка)
- [ ] М9: Loading (SM, **светлая**, спиннер, `closable=false`, автозакрытие 3 сек)
- [ ] М10: Success (SM, тёмная, иконка, автозакрытие 2 сек)
- [ ] М11: Error (MD, **светлая**, «Повторить» / «Закрыть»)

### Интерактивность

- [ ] Все кнопки PUDU кликабельны → открывают соответствующие модалки
- [ ] Таймеры обратного отсчёта работают (QR-кассир: 30 сек, QR-гость: 120 сек)
- [ ] Loading автозакрывается через 3 сек → Success (80%) или Error (20%)
- [ ] Success автозакрывается через 2 сек
- [ ] Escape закрывает модалку (кроме Loading)
- [ ] Overlay-клик закрывает модалку (кроме Loading)
- [ ] Toast-уведомления об ошибках появляются в правом нижнем углу с `animate-slide-up`
- [ ] Toast закрывается по крестику
- [ ] Индикатор маркетингового круиза toggle'ится кнопкой «Маркетинг»
- [ ] Демо-панель позволяет имитировать QR-оплату, ошибку, смену стола

### Стиль (по STYLE_GUIDE.md)

- [ ] Тёмная POS-тема: `bg-[#3a3a3a]` (модалки), `bg-[#2d2d2d]` (секции), `bg-[#1a1a1a]` (кнопки)
- [ ] Кнопки: `h-14 bg-[#1a1a1a] hover:bg-[#252525]`, `rounded`
- [ ] Заголовки модалок: `text-2xl text-[#b8c959] text-center`
- [ ] Акцент `#b8c959` для заголовков, таймеров, успехов
- [ ] Белые карточки данных: `bg-white text-black p-4 rounded`
- [ ] Иконки Lucide через `lucide-angular`
- [ ] Анимации: `animate-fade-in`, `animate-scale-in`, `animate-spin`, `animate-slide-up`, `animate-pulse`
- [ ] Loading — светлая тема (`bg-white`, `text-gray-900`)
- [ ] Error — светлая тема (кнопки `bg-gray-900 text-white` и `border border-gray-300`)

### Accessibility

- [ ] `aria-label` на всех кнопках действий
- [ ] Модалки фокусируют первый интерактивный элемент при открытии
- [ ] Escape закрывает модалку
- [ ] Контрастность текста > 4.5:1

---

## 12. Ограничения и предупреждения

| # | Ограничение | Описание |
|---|-------------|----------|
| 1 | **Не production-код** | Прототип для демонстрации, не для внедрения |
| 2 | **Mock-данные** | Все данные — клиентский state, нет API |
| 3 | **[BLOCKED] Доставка блюд** | Сценарий send_dish отображается как заглушка «В разработке» |
| 4 | **Экран робота** | Экран робота PUDU не интерактивный (только картинка/видео) — не имитируется в прототипе |
| 5 | **Фоновый polling** | Реальный polling (GET каждые 3 сек) не реализован; имитация через setTimeout |
| 6 | **Автоматические триггеры** | В прототипе триггеры (авто-уборка, маркетинг) заменены кнопками демо-панели |
| 7 | **Права доступа** | В прототипе все функции доступны (эквивалент `PUDU_OPERATE`). В production права разграничиваются |
| 8 | **QR-код** | Mock-заглушка вместо реального QR. Приоритетный формат — URL (Олег NE, 06.02) |

---

## История изменений

| Версия | Дата | Автор | Описание |
|--------|------|-------|----------|
| 1.0 | 2026-02-11 | Кирилл Тюрин | Первая версия промта: полное описание прототипа плагина iikoFront с 12 модальными окнами, state-машиной, mock-данными, POS-стилистикой |
