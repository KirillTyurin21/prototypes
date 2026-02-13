# Промт-патч v1.2: Главная страница-каталог состояний плагина iikoFront PUDU

---
**Версия**: 1.2
**Дата**: 2026-02-13
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д4-патч (Промт-патч для рефакторинга навигации прототипа POS-плагина iikoFront)
**Базовый документ**: Промт_прототипа_PUDU_плагин_iikoFront.md (v1.0, 2026-02-11)
**Зависимость**: Промт_прототипа_PUDU_плагин_iikoFront_v1.1_патч.md (v1.1, 2026-02-13) — применить ПЕРЕД этим патчем
**Источники**: Инструкция_адаптации_главной_страницы_PUDU_v2.md; Паттерн Premium Bonus (`front-plugins/screens/plugin-dialogs-screen.component.ts`)
---

## Назначение

Этот документ — **дельта-патч v1.2** к промту v1.0 (с учётом ранее применённого v1.1). Он описывает **рефакторинг навигации прототипа**: переход от монолитного экрана к **странице-каталогу ячеек** (Storybook-подход).

**Инструкция по применению**: сначала примени патч v1.1, затем примени все изменения ниже последовательно. Каждый раздел указывает, что **удалить**, что **добавить** и что **изменить**.

**Порядок применения патчей**:
```
v1.0 (базовый промт) → v1.1 (контексты, М12, E-STOP) → v1.2 (этот файл: каталог ячеек)
```

---

## Суть изменения

### Было (v1.0 + v1.1)

Прототип — **один экран-монолит**: каркас POS-терминала с демо-панелью внизу. Все модальные окна переключаются через `activeModal`. Переключатель контекстов «Из заказа / Главный экран» (SegmentedControl из v1.1) находится в верхней части.

**Проблема**: чтобы показать конкретное состояние (например, М6 QR-тайм-аут), нужно прокликать всю цепочку. Нет обзорной карты всех UI-состояний.

### Стало (v1.2)

Прототип получает **главную страницу-каталог** — сетку карточек-ячеек, где каждая ячейка ведёт к конкретному состоянию или сценарию. Паттерн заимствован из прототипа **Premium Bonus** (`front-plugins`).

```
┌──────────────────┐       ┌──────────────────┐
│  Каталог ячеек   │──────►│  POS-экран +     │
│  (светлая тема)  │  клик │  модалка/toast   │
│  26 карточек     │       │  (тёмная тема)   │
│  5 секций        │       │  кнопка «Назад»  │
└──────────────────┘       └──────────────────┘
```

---

## E1. Архитектурное изменение: двухуровневая навигация

### ИЗМЕНИТЬ: Навигация (раздел 2.2 базового промта)

Вместо **одноуровневой state-машины** (всё через `activeModal`) — **двухуровневая навигация**:

| Уровень | Компонент | Тема | Описание |
|---------|-----------|------|----------|
| 1. Каталог | `PuduCatalogScreenComponent` | Светлая | Сетка ячеек, breadcrumb, заголовок |
| 2. POS-экран | `PuduPosScreenComponent` | Тёмная (POS) | Каркас терминала + модалки + toast (перенос из v1.0) |

**Принцип**: каталог — это Angular-роут `/` (по умолчанию). POS-экран — дочерний роут `/pos` с query-параметрами.

### ДОБАВИТЬ: Типы для каталога (в `types.ts`)

```typescript
// === КАТАЛОГ ЯЧЕЕК (v1.2) ===

export type CellCategory =
  | 'context-order'     // Контекст: из заказа
  | 'context-main'      // Контекст: главный экран
  | 'scenario'          // Сценарий (цепочка переходов)
  | 'modal'             // Одиночное модальное окно
  | 'notification';     // Уведомление / спецсостояние

export interface CatalogCell {
  id: string;                         // Уникальный ID ячейки (slug)
  label: string;                      // Название на русском (H3 карточки)
  description: string;                // Описание 1-2 строки
  icon: string;                       // Имя иконки Lucide
  iconColor: string;                  // HEX цвет иконки и её фонового круга
  category: CellCategory;            // Категория для группировки
  modalType?: PuduModalType;         // Какую модалку открыть (одиночные)
  scenario?: string;                  // Какой сценарий запустить (цепочки)
  context?: 'order' | 'main';        // Контекст POS-экрана
  badge?: string;                     // Текст бейджа (напр. "BLOCKED")
  badgeColor?: string;                // HEX цвет бейджа
}

export interface CatalogSection {
  title: string;                      // Заголовок секции (H2)
  icon: string;                       // Иконка Lucide рядом с заголовком
  description: string;                // Подзаголовок — пояснение
  category: CellCategory;            // Категория для фильтрации
  cells: CatalogCell[];              // Ячейки секции
}

// Шаг сценария (для автоматических цепочек)
export interface ScenarioStep {
  modal: PuduModalType;              // Модалка для открытия
  delay: number;                      // Задержка перед открытием (мс)
}
```

---

## E2. Обновление структуры файлов

### ИЗМЕНИТЬ: Структура файлов (раздел 10 базового промта)

```
src/app/prototypes/front-pudu-plugin/
├── pudu-plugin.routes.ts                     ← ИЗМЕНИТЬ: children-маршруты
├── pudu-plugin-prototype.component.ts        ← ИЗМЕНИТЬ: упростить до router-outlet
├── types.ts                                  ← ИЗМЕНИТЬ: добавить CatalogCell, CatalogSection
├── screens/                                  ← СОЗДАТЬ папку
│   ├── pudu-catalog-screen.component.ts      ← СОЗДАТЬ: главная страница (каталог ячеек)
│   └── pudu-pos-screen.component.ts          ← СОЗДАТЬ: POS-экран (перенос логики)
├── data/
│   ├── mock-data.ts                          ← БЕЗ ИЗМЕНЕНИЙ
│   ├── ne-error-codes.ts                     ← БЕЗ ИЗМЕНЕНИЙ (из v1.1)
│   └── catalog-entries.ts                    ← СОЗДАТЬ: данные каталога (26 ячеек)
├── components/
│   ├── pos-dialog.component.ts               ← БЕЗ ИЗМЕНЕНИЙ
│   ├── pos-header.component.ts               ← БЕЗ ИЗМЕНЕНИЙ
│   ├── order-items-list.component.ts         ← БЕЗ ИЗМЕНЕНИЙ
│   ├── pudu-buttons-panel.component.ts       ← БЕЗ ИЗМЕНЕНИЙ (v1.1)
│   ├── cruise-indicator.component.ts         ← БЕЗ ИЗМЕНЕНИЙ
│   ├── error-toast.component.ts              ← БЕЗ ИЗМЕНЕНИЙ (v1.1)
│   ├── demo-panel.component.ts               ← БЕЗ ИЗМЕНЕНИЙ (сохраняется внутри POS)
│   ├── context-switcher.component.ts         ← БЕЗ ИЗМЕНЕНИЙ (из v1.1)
│   ├── main-screen-stub.component.ts         ← БЕЗ ИЗМЕНЕНИЙ (из v1.1)
│   └── dialogs/
│       ├── send-menu-confirm.component.ts    # М1
│       ├── cleanup-confirm.component.ts      # М2
│       ├── qr-cashier-phase.component.ts     # М3
│       ├── qr-guest-phase.component.ts       # М4
│       ├── qr-success.component.ts           # М5
│       ├── qr-timeout.component.ts           # М6
│       ├── unmapped-table.component.ts       # М7
│       ├── send-dish-blocked.component.ts    # М8
│       ├── loading-dialog.component.ts       # М9
│       ├── success-dialog.component.ts       # М10
│       ├── error-dialog.component.ts         # М11
│       └── cleanup-multi-select.component.ts # М12 (из v1.1)
```

**Новые файлы** (3 шт.):
- `screens/pudu-catalog-screen.component.ts`
- `screens/pudu-pos-screen.component.ts`
- `data/catalog-entries.ts`

**Изменённые файлы** (3 шт.):
- `pudu-plugin.routes.ts`
- `pudu-plugin-prototype.component.ts`
- `types.ts`

**Без изменений** (все компоненты и диалоги из v1.0 и v1.1).

---

## E3. Маршрутизация

### ИЗМЕНИТЬ: `pudu-plugin.routes.ts`

Добавить children-маршруты для каталога и POS-экрана:

```typescript
// pudu-plugin.routes.ts (v1.2)

import { Routes } from '@angular/router';

export const PUDU_PLUGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pudu-plugin-prototype.component').then(
        m => m.PuduPluginPrototypeComponent
      ),
    children: [
      {
        path: '',                    // Каталог — по умолчанию
        loadComponent: () =>
          import('./screens/pudu-catalog-screen.component').then(
            m => m.PuduCatalogScreenComponent
          ),
      },
      {
        path: 'pos',                 // POS-экран при клике на ячейку
        loadComponent: () =>
          import('./screens/pudu-pos-screen.component').then(
            m => m.PuduPosScreenComponent
          ),
      },
    ],
  },
];
```

### ИЗМЕНИТЬ: Корневой компонент (`pudu-plugin-prototype.component.ts`)

**Упростить** до обёртки с `router-outlet`:

```typescript
// pudu-plugin-prototype.component.ts (v1.2) — УПРОЩЁННЫЙ

@Component({
  selector: 'app-pudu-plugin-prototype',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class PuduPluginPrototypeComponent {}
```

> **Warning**: Вся логика `activeModal`, `currentContext`, mock-данные, toast-уведомления, демо-панель — **ПЕРЕНОСЯТСЯ** в `PuduPosScreenComponent`. Корневой компонент становится пустой обёрткой.

---

## E4. Каталог-экран (новый компонент)

### СОЗДАТЬ: `screens/pudu-catalog-screen.component.ts`

Главная страница прототипа — **светлая тема**, сетка ячеек по секциям.

**Стилизация**: страница каталога использует **светлую тему** (`bg-gray-50`), аналогично остальным прототипам. POS-диалоги видны **только** при переходе на `/pos`.

#### Layout

```html
<!-- pudu-catalog-screen.component.html -->

<div class="min-h-screen bg-gray-50">

  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-6xl mx-auto px-6 py-4">
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-400 mb-2">
        <span>Главная</span>
        <span class="mx-1">/</span>
        <span>Плагины Front</span>
        <span class="mx-1">/</span>
        <span class="text-gray-600">PUDU — Управление роботами</span>
      </nav>

      <!-- Заголовок -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
          <lucide-icon name="bot" [size]="20" class="text-white"></lucide-icon>
        </div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            PUDU — Управление роботами
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Плагин кассового терминала: доставка меню, уборка, QR-оплата, маркетинговый круиз
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Сетка секций -->
  <div class="max-w-6xl mx-auto px-6 py-6 space-y-8">

    <div *ngFor="let section of sections">

      <!-- Заголовок секции -->
      <div class="flex items-center gap-2 mb-4">
        <lucide-icon [name]="section.icon" [size]="20"
                     class="text-gray-400"></lucide-icon>
        <h2 class="text-lg font-medium text-gray-700">{{ section.title }}</h2>
        <span class="text-sm text-gray-400 ml-1">— {{ section.description }}</span>
      </div>

      <!-- Сетка ячеек (3 колонки на desktop) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <div *ngFor="let cell of section.cells"
             (click)="onCellClick(cell)"
             class="relative bg-white rounded-xl border border-gray-200 p-5
                    hover:shadow-md cursor-pointer
                    transition-all duration-200 group"
             [ngClass]="{
               'hover:border-blue-300': section.category === 'context-order',
               'hover:border-purple-300': section.category === 'context-main',
               'hover:border-amber-300': section.category === 'scenario',
               'hover:border-gray-300': section.category === 'modal',
               'hover:border-red-300': section.category === 'notification'
             }">

          <!-- Бейдж (опциональный, правый верхний угол) -->
          <span *ngIf="cell.badge"
                class="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full"
                [style.background-color]="cell.badgeColor + '20'"
                [style.color]="cell.badgeColor">
            {{ cell.badge }}
          </span>

          <!-- Иконка в цветном круге -->
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
               [style.background-color]="cell.iconColor + '20'">
            <lucide-icon [name]="cell.icon" [size]="24"
                         [style.color]="cell.iconColor"></lucide-icon>
          </div>

          <!-- Заголовок -->
          <h3 class="font-medium text-gray-900 mb-1 group-hover:text-blue-600
                     transition-colors">
            {{ cell.label }}
          </h3>

          <!-- Описание -->
          <p class="text-sm text-gray-500 line-clamp-2">
            {{ cell.description }}
          </p>

          <!-- Метка типа -->
          <p class="text-xs text-gray-400 mt-3 uppercase tracking-wide">
            POS MODAL
          </p>
        </div>
      </div>

      <!-- Разделитель между секциями -->
      <hr class="border-gray-200 mt-6" />
    </div>
  </div>
</div>
```

#### Логика компонента

```typescript
// pudu-catalog-screen.component.ts (логика)

import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CATALOG_SECTIONS } from '../data/catalog-entries';
import { CatalogCell, CatalogSection } from '../types';

@Component({
  selector: 'app-pudu-catalog-screen',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NgClass, NgFor, NgIf],
  template: `...`, // см. layout выше
})
export class PuduCatalogScreenComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sections: CatalogSection[] = CATALOG_SECTIONS;

  onCellClick(cell: CatalogCell): void {
    const queryParams: Record<string, string> = {};

    // 1. Контекст POS-экрана (order / main)
    if (cell.context) {
      queryParams['context'] = cell.context;
    }

    // 2. Модалка для открытия
    if (cell.modalType) {
      queryParams['modal'] = cell.modalType;
    }

    // 3. Сценарий для запуска
    if (cell.scenario) {
      queryParams['scenario'] = cell.scenario;
    }

    // 4. Уведомление для показа
    if (cell.category === 'notification') {
      queryParams['notification'] = cell.id;
    }

    this.router.navigate(['pos'], {
      relativeTo: this.route,
      queryParams,
    });
  }
}
```

---

## E5. POS-экран (перенос логики из v1.0 + v1.1)

### СОЗДАТЬ: `screens/pudu-pos-screen.component.ts`

**Этот компонент — рефакторинг** текущего монолита `pudu-plugin-prototype.component.ts`. В него переносится **ВСЯ** существующая логика:

- Каркас POS-терминала (М0): header заказа, список блюд, итого
- Переключение контекстов `currentContext` (из v1.1)
- State-машина `activeModal`
- Логика всех модалок (open/close/timer)
- Toast-уведомления (E-STOP и ошибки NE из v1.1)
- Индикатор маркетингового круиза
- Демо-панель (сохраняется для интерактивности внутри POS)

#### Инициализация из queryParams

При открытии POS-экрана из каталога — считать query-параметры и установить начальное состояние:

```typescript
// pudu-pos-screen.component.ts

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pudu-pos-screen',
  standalone: true,
  imports: [/* все существующие imports из v1.0 + v1.1 */],
  template: `...`, // каркас POS-терминала (без изменений из v1.0/v1.1)
})
export class PuduPosScreenComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // --- State из v1.0 + v1.1 (перенос) ---
  activeModal: PuduModalType = null;
  currentContext: PuduContextType = 'order';
  isCruiseActive = false;
  isEstopActive = false;
  selectedTablesForCleanup: OrderTable[] = [];
  notifications: PuduNotification[] = [];

  // Массив таймеров для сценариев (для очистки при уходе)
  private scenarioTimeouts: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // 1. Контекст POS-экрана
      if (params['context'] === 'order' || params['context'] === 'main') {
        this.currentContext = params['context'];
      }

      // 2. Открыть конкретную модалку
      if (params['modal']) {
        this.activeModal = params['modal'] as PuduModalType;
      }

      // 3. Запустить сценарий (автоцепочку)
      if (params['scenario']) {
        this.runScenario(params['scenario']);
      }

      // 4. Показать уведомление
      if (params['notification']) {
        this.showNotification(params['notification']);
      }
    });
  }

  ngOnDestroy(): void {
    // Очистить все pending-таймеры сценариев
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];
  }

  // === Навигация ===

  backToCatalog(): void {
    // Прервать сценарий и вернуться в каталог
    this.scenarioTimeouts.forEach(t => clearTimeout(t));
    this.scenarioTimeouts = [];
    this.activeModal = null;
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // === Сценарии ===
  // (см. E6)

  // === Уведомления ===
  // (см. E7)

  // === Остальная логика из v1.0 + v1.1 ===
  // (переносится без изменений)
}
```

#### Кнопка «Назад в каталог»

Добавить в header POS-экрана (левая сторона, перед «Стол №3»):

```html
<!-- Кнопка «Назад» — добавить в header POS-экрана -->
<button (click)="backToCatalog()"
        class="flex items-center gap-1.5 text-gray-400 hover:text-white
               text-sm mr-4 transition-colors"
        aria-label="Вернуться в каталог состояний">
  <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
  <span>Каталог</span>
</button>
```

**Расположение в header** (v1.0 раздел 6.1):

```
┌─────────────────────────────────────────────────────────────┐
│ [← Каталог]   Стол №3 (VIP)      Заказ #1042      Мария 👤 │
└─────────────────────────────────────────────────────────────┘
         ↑ НОВОЕ                    всё остальное без изменений
```

#### Переключатель контекстов (из v1.1)

SegmentedControl из патча D2 (v1.1) **сохраняется**. Если POS-экран открыт из каталога с `?context=main`, SegmentedControl показывает «Главный экран» как выбранный. Пользователь может переключать контексты вручную, находясь на POS-экране.

---

## E6. Реализация сценариев (цепочки переходов)

### ДОБАВИТЬ: Логику автоматических сценариев в `PuduPosScreenComponent`

Сценарии — **автоматические последовательности** модалок с задержками. Используются для демонстрации полных user journey одним кликом из каталога.

```typescript
// Цепочки сценариев (внутри PuduPosScreenComponent)

private scenarioChains: Record<string, ScenarioStep[]> = {
  // QR-оплата: полный успешный цикл
  'qr-full': [
    { modal: 'qr_cashier_phase', delay: 0 },
    { modal: 'loading', delay: 5000 },
    { modal: 'qr_guest_phase', delay: 3000 },
    { modal: 'qr_success', delay: 5000 },
  ],

  // QR-оплата: тайм-аут гостя
  'qr-timeout': [
    { modal: 'qr_cashier_phase', delay: 0 },
    { modal: 'loading', delay: 5000 },
    { modal: 'qr_guest_phase', delay: 3000 },
    { modal: 'qr_timeout', delay: 5000 },
  ],

  // Отправка меню → успех
  'send-menu-ok': [
    { modal: 'send_menu_confirm', delay: 0 },
    { modal: 'loading', delay: 2000 },
    { modal: 'success', delay: 3000 },
  ],

  // Отправка меню → ошибка
  'send-menu-err': [
    { modal: 'send_menu_confirm', delay: 0 },
    { modal: 'loading', delay: 2000 },
    { modal: 'error', delay: 3000 },
  ],

  // Уборка (один стол) → успех
  'cleanup-ok': [
    { modal: 'cleanup_confirm', delay: 0 },
    { modal: 'loading', delay: 2000 },
    { modal: 'success', delay: 3000 },
  ],

  // Уборка (мультивыбор) → успех
  'cleanup-multi-ok': [
    { modal: 'cleanup_multi_select', delay: 0 },
    { modal: 'loading', delay: 2000 },
    { modal: 'success', delay: 3000 },
  ],

  // Стол не замаплен (одиночная модалка, без цепочки)
  'unmapped': [
    { modal: 'unmapped_table', delay: 0 },
  ],
};

runScenario(scenarioId: string): void {
  const chain = this.scenarioChains[scenarioId];
  if (!chain) return;

  // Прервать предыдущий сценарий
  this.scenarioTimeouts.forEach(t => clearTimeout(t));
  this.scenarioTimeouts = [];

  let totalDelay = 0;
  chain.forEach(step => {
    totalDelay += step.delay;
    const timeout = setTimeout(() => {
      this.activeModal = step.modal;
    }, totalDelay);
    this.scenarioTimeouts.push(timeout);
  });
}
```

> **Warning**: При ручном закрытии модалки пользователем (Escape, кнопка «Отмена» / «Закрыть») — **прервать сценарий**: очистить все `setTimeout` из `scenarioTimeouts`. Пользователь имеет приоритет над автоматикой.

**ИЗМЕНИТЬ обработчик закрытия** (метод `closeDialog()`):

```typescript
closeDialog(): void {
  // Прервать автосценарий при ручном закрытии
  this.scenarioTimeouts.forEach(t => clearTimeout(t));
  this.scenarioTimeouts = [];
  this.activeModal = null;
}
```

---

## E7. Обработка уведомлений из каталога

### ДОБАВИТЬ: Логику показа уведомлений по `queryParams.notification`

```typescript
showNotification(notificationId: string): void {
  switch (notificationId) {
    case 'notify-estop':
      // Включить E-STOP (из v1.1)
      this.isEstopActive = true;
      this.pushEstopNotification();
      break;

    case 'notify-ne-error':
      // Push кастомную ошибку NE (из v1.1)
      this.pushNeErrorNotification();
      break;
  }
}

private pushEstopNotification(): void {
  // Логика из v1.1 (D4): повторяющееся E-STOP уведомление
  const estop: PuduNotification = {
    id: 'estop-' + Date.now(),
    type: 'error',
    title: 'E-STOP нажат',
    message: 'Аварийная остановка. Все задачи прекращены',
    timestamp: new Date(),
    dismissed: false,
    is_estop: true,
    repeat_interval_sec: 5,
  };
  this.notifications.push(estop);
}

private pushNeErrorNotification(): void {
  // Mock-уведомление из v1.1 (D5)
  const neError: PuduNotification = {
    id: 'ne-err-' + Date.now(),
    type: 'error',
    title: 'Сервер NE недоступен',
    message: 'NE API не отвечает. Повтор через 5 сек...',
    timestamp: new Date(),
    dismissed: false,
    is_estop: false,
  };
  this.notifications.push(neError);
}
```

---

## E8. Данные каталога (26 ячеек, 5 секций)

### СОЗДАТЬ: `data/catalog-entries.ts`

Полный массив ячеек, сгруппированных по секциям. Данные соответствуют паттерну из инструкции адаптации (Раздел 3).

```typescript
// data/catalog-entries.ts (v1.2)

import { CatalogCell, CatalogSection } from '../types';

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 1: Контекст — Из заказа (3 ячейки)
// ═══════════════════════════════════════════════════

const CONTEXT_ORDER_CELLS: CatalogCell[] = [
  {
    id: 'ctx-order-send-menu',
    label: 'Отправить меню',
    description: 'Робот везёт физическое меню от станции выдачи к столу гостя. Стол определён из заказа',
    icon: 'utensils',
    iconColor: '#b8c959',
    category: 'context-order',
    modalType: 'send_menu_confirm',
    context: 'order',
  },
  {
    id: 'ctx-order-cleanup',
    label: 'Уборка посуды',
    description: 'Робот едет к столу для сбора грязной посуды. Один стол из контекста заказа',
    icon: 'spray-can',
    iconColor: '#b8c959',
    category: 'context-order',
    modalType: 'cleanup_confirm',
    context: 'order',
  },
  {
    id: 'ctx-order-send-dish',
    label: 'Доставка блюд',
    description: 'Функционал заблокирован — нет терминала на раздаче',
    icon: 'package',
    iconColor: '#ef4444',
    category: 'context-order',
    modalType: 'send_dish_blocked',
    context: 'order',
    badge: 'BLOCKED',
    badgeColor: '#ef4444',
  },
];

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 2: Контекст — Главный экран (2 ячейки)
// ═══════════════════════════════════════════════════

const CONTEXT_MAIN_CELLS: CatalogCell[] = [
  {
    id: 'ctx-main-cleanup-multi',
    label: 'Уборка посуды (мультивыбор)',
    description: 'Выбор нескольких столов одновременно для уборки с главного экрана',
    icon: 'spray-can',
    iconColor: '#b8c959',
    category: 'context-main',
    modalType: 'cleanup_multi_select',
    context: 'main',
  },
  {
    id: 'ctx-main-marketing',
    label: 'Маркетинговый круиз',
    description: 'Toggle-кнопка запуска маркетингового патрулирования зала роботом',
    icon: 'megaphone',
    iconColor: '#3b82f6',
    category: 'context-main',
    context: 'main',
  },
];

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 3: Сценарии — цепочки переходов (7 ячеек)
// ═══════════════════════════════════════════════════

const SCENARIO_CELLS: CatalogCell[] = [
  {
    id: 'scenario-qr-full',
    label: 'QR-оплата (полный цикл)',
    description: 'Кассир подтверждает → робот к гостю → QR на экране → оплата успешна',
    icon: 'qr-code',
    iconColor: '#b8c959',
    category: 'scenario',
    scenario: 'qr-full',
    context: 'order',
  },
  {
    id: 'scenario-qr-timeout',
    label: 'QR-оплата (тайм-аут)',
    description: 'Гость не успел оплатить — робот возвращается на базу',
    icon: 'clock',
    iconColor: '#f97316',
    category: 'scenario',
    scenario: 'qr-timeout',
    context: 'order',
  },
  {
    id: 'scenario-send-menu-ok',
    label: 'Отправка меню → Успех',
    description: 'Подтверждение → загрузка → задача создана успешно',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'scenario',
    scenario: 'send-menu-ok',
    context: 'order',
  },
  {
    id: 'scenario-send-menu-err',
    label: 'Отправка меню → Ошибка',
    description: 'Подтверждение → загрузка → ошибка (робот недоступен)',
    icon: 'alert-circle',
    iconColor: '#ef4444',
    category: 'scenario',
    scenario: 'send-menu-err',
    context: 'order',
  },
  {
    id: 'scenario-cleanup-ok',
    label: 'Уборка → Успех',
    description: 'Подтверждение уборки одного стола → загрузка → задача создана',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'scenario',
    scenario: 'cleanup-ok',
    context: 'order',
  },
  {
    id: 'scenario-cleanup-multi-ok',
    label: 'Уборка (мульти) → Успех',
    description: 'Мультивыбор столов → загрузка → задача создана',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'scenario',
    scenario: 'cleanup-multi-ok',
    context: 'main',
  },
  {
    id: 'scenario-unmapped',
    label: 'Стол не замаплен',
    description: 'Попытка действия со столом без привязки к точке робота',
    icon: 'map-pin-off',
    iconColor: '#f97316',
    category: 'scenario',
    scenario: 'unmapped',
    context: 'order',
  },
];

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 4: Состояния диалогов — одиночные модалки (12 ячеек)
// ═══════════════════════════════════════════════════

const MODAL_CELLS: CatalogCell[] = [
  {
    id: 'modal-send-menu',
    label: 'М1: Подтверждение отправки меню',
    description: 'Карточка задачи: стол, робот, фразы при заборе и у стола',
    icon: 'utensils',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'send_menu_confirm',
  },
  {
    id: 'modal-cleanup',
    label: 'М2: Подтверждение уборки',
    description: 'Карточка задачи: стол, робот, фраза, время ожидания 90 сек',
    icon: 'spray-can',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'cleanup_confirm',
  },
  {
    id: 'modal-qr-cashier',
    label: 'М3: QR — фаза «Кассир»',
    description: 'Иконка принтера, фраза робота, обратный таймер 30 сек',
    icon: 'printer',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'qr_cashier_phase',
  },
  {
    id: 'modal-qr-guest',
    label: 'М4: QR — фаза «Гость»',
    description: 'Mock QR-код, таймер 120 сек, кнопка «Оплата подтверждена»',
    icon: 'qr-code',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'qr_guest_phase',
  },
  {
    id: 'modal-qr-success',
    label: 'М5: QR — Оплата прошла',
    description: 'Иконка успеха, текст «Спасибо за оплату!», автозакрытие 3 сек',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'modal',
    modalType: 'qr_success',
  },
  {
    id: 'modal-qr-timeout',
    label: 'М6: QR — Тайм-аут',
    description: 'Гость не оплатил вовремя, робот возвращается на базу',
    icon: 'clock',
    iconColor: '#f97316',
    category: 'modal',
    modalType: 'qr_timeout',
  },
  {
    id: 'modal-unmapped',
    label: 'М7: Стол не замаплен',
    description: 'Предупреждение + ссылка на iikoWeb для настройки маппинга',
    icon: 'map-pin-off',
    iconColor: '#f97316',
    category: 'modal',
    modalType: 'unmapped_table',
  },
  {
    id: 'modal-dish-blocked',
    label: 'М8: Доставка блюд [BLOCKED]',
    description: 'Заглушка: баннер «Требуется решение», пометка «В разработке»',
    icon: 'package',
    iconColor: '#ef4444',
    category: 'modal',
    modalType: 'send_dish_blocked',
    badge: 'BLOCKED',
    badgeColor: '#ef4444',
  },
  {
    id: 'modal-loading',
    label: 'М9: Loading',
    description: 'Универсальный спиннер загрузки. Светлая тема, автозакрытие 3 сек',
    icon: 'loader-2',
    iconColor: '#6b7280',
    category: 'modal',
    modalType: 'loading',
  },
  {
    id: 'modal-success',
    label: 'М10: Задача создана',
    description: 'Универсальный диалог успеха. Автозакрытие 2 сек',
    icon: 'check-circle-2',
    iconColor: '#22c55e',
    category: 'modal',
    modalType: 'success',
  },
  {
    id: 'modal-error',
    label: 'М11: Ошибка',
    description: 'Универсальный диалог ошибки. Светлая тема, кнопки «Повторить» / «Закрыть»',
    icon: 'alert-circle',
    iconColor: '#ef4444',
    category: 'modal',
    modalType: 'error',
  },
  {
    id: 'modal-cleanup-multi',
    label: 'М12: Мультивыбор столов',
    description: 'Сетка столов 3 колонки, toggle-выбор, disabled для незамапленных',
    icon: 'layout-grid',
    iconColor: '#b8c959',
    category: 'modal',
    modalType: 'cleanup_multi_select',
    context: 'main',
    badge: 'v1.1',
    badgeColor: '#22c55e',
  },
];

// ═══════════════════════════════════════════════════
// СЕКЦИЯ 5: Уведомления и спецсостояния (2 ячейки)
// ═══════════════════════════════════════════════════

const NOTIFICATION_CELLS: CatalogCell[] = [
  {
    id: 'notify-estop',
    label: 'E-STOP (аварийная остановка)',
    description: 'Toast-уведомление: красная кнопка нажата. Повторяется каждые 5 сек',
    icon: 'octagon',
    iconColor: '#ef4444',
    category: 'notification',
  },
  {
    id: 'notify-ne-error',
    label: 'Ошибка связи NE',
    description: 'Toast-уведомление: NE API не отвечает, повтор через 5 сек',
    icon: 'wifi-off',
    iconColor: '#f97316',
    category: 'notification',
  },
];

// ═══════════════════════════════════════════════════
// ЭКСПОРТ: Секции каталога
// ═══════════════════════════════════════════════════

export const CATALOG_SECTIONS: CatalogSection[] = [
  {
    title: 'Контекст: Из заказа',
    icon: 'receipt',
    description: 'Действия, вызванные из экрана заказа iikoFront (стол известен)',
    category: 'context-order',
    cells: CONTEXT_ORDER_CELLS,
  },
  {
    title: 'Контекст: Главный экран',
    icon: 'monitor',
    description: 'Действия с главного экрана iikoFront (нет контекста стола)',
    category: 'context-main',
    cells: CONTEXT_MAIN_CELLS,
  },
  {
    title: 'Сценарии (цепочки переходов)',
    icon: 'workflow',
    description: 'Автоматические демонстрации полных user journey',
    category: 'scenario',
    cells: SCENARIO_CELLS,
  },
  {
    title: 'Состояния диалогов',
    icon: 'layout-grid',
    description: 'Каждая ячейка — одно конкретное модальное окно плагина',
    category: 'modal',
    cells: MODAL_CELLS,
  },
  {
    title: 'Уведомления и специальные состояния',
    icon: 'bell',
    description: 'Toast-уведомления и overlay-состояния',
    category: 'notification',
    cells: NOTIFICATION_CELLS,
  },
];
```

---

## E9. Стилизация каталога

### Цветовая кодировка border при hover (по секциям)

| Секция | Категория | Border hover | Иконка заголовка |
|--------|-----------|-------------|------------------|
| Контекст: Из заказа | `context-order` | `border-blue-300` | `receipt` |
| Контекст: Главный экран | `context-main` | `border-purple-300` | `monitor` |
| Сценарии | `scenario` | `border-amber-300` | `workflow` |
| Состояния диалогов | `modal` | `border-gray-300` | `layout-grid` |
| Уведомления | `notification` | `border-red-300` | `bell` |

### Бейджи

| Текст | Фон | Текст | Применение |
|-------|-----|-------|------------|
| `BLOCKED` | `#ef444420` | `#ef4444` | Доставка блюд (М8, ячейка ctx-order-send-dish) |
| `v1.1` | `#22c55e20` | `#22c55e` | Новые из патча v1.1 (М12 мультивыбор) |

### Метка «POS MODAL»

Каждая ячейка содержит метку внизу: `text-xs text-gray-400 uppercase tracking-wide` — текст «POS MODAL». Это соответствует паттерну Premium Bonus, где каждая карточка помечена типом окна.

---

## E10. Демо-панель: без удаления, сохранение внутри POS

### РЕШЕНИЕ: Демо-панель остаётся

Демо-панель из v1.0 (обновлённая в v1.1) **сохраняется** внутри `PuduPosScreenComponent`. Она полезна для интерактивной демонстрации:

- Toggle маппинга стола (Да/Нет)
- Смена стола (циклический переключатель)
- Имитация QR-оплаты (если зашли не через сценарий)
- Имитация E-STOP и ошибок NE

При открытии из каталога через сценарий или прямую модалку — демо-панель не мешает, но доступна для ручного управления.

---

## E11. Диаграмма навигации

```
/prototype/front-pudu-plugin
│
├── / (PuduCatalogScreenComponent — сетка ячеек, СВЕТЛАЯ тема)
│   │
│   ├── [Секция: Контекст из заказа]
│   │   ├── Отправить меню    ──► /pos?context=order&modal=send_menu_confirm
│   │   ├── Уборка посуды     ──► /pos?context=order&modal=cleanup_confirm
│   │   └── Доставка блюд     ──► /pos?context=order&modal=send_dish_blocked
│   │
│   ├── [Секция: Контекст главный экран]
│   │   ├── Уборка (мульти)   ──► /pos?context=main&modal=cleanup_multi_select
│   │   └── Маркетинг         ──► /pos?context=main
│   │
│   ├── [Секция: Сценарии]
│   │   ├── QR полный цикл    ──► /pos?context=order&scenario=qr-full
│   │   ├── QR тайм-аут       ──► /pos?context=order&scenario=qr-timeout
│   │   ├── Меню → Успех      ──► /pos?context=order&scenario=send-menu-ok
│   │   ├── Меню → Ошибка     ──► /pos?context=order&scenario=send-menu-err
│   │   ├── Уборка → Успех    ──► /pos?context=order&scenario=cleanup-ok
│   │   ├── Уборка мульти     ──► /pos?context=main&scenario=cleanup-multi-ok
│   │   └── Стол не замаплен  ──► /pos?context=order&scenario=unmapped
│   │
│   ├── [Секция: Состояния диалогов]
│   │   ├── М1–М12            ──► /pos?modal=<modalType>
│   │   └── (12 ячеек, по одной на каждый диалог)
│   │
│   └── [Секция: Уведомления]
│       ├── E-STOP            ──► /pos?notification=notify-estop
│       └── Ошибка NE         ──► /pos?notification=notify-ne-error
│
└── /pos (PuduPosScreenComponent — POS-терминал, ТЁМНАЯ тема)
    │
    ├── queryParams.context      → устанавливает order / main экран
    ├── queryParams.modal        → открывает конкретную модалку
    ├── queryParams.scenario     → запускает цепочку переходов
    ├── queryParams.notification → показывает toast-уведомление
    │
    ├── [Ручное управление]      → демо-панель, кнопки PUDU, SegmentedControl
    │
    └── [← Каталог]             → возврат на /prototype/front-pudu-plugin
```

---

## Сводная таблица изменений (v1.2)

| #   | Раздел / Компонент | Изменение | Тип |
|-----|--------------------|-----------|-----|
| E1 | Архитектура | Двухуровневая навигация: Каталог (светлый) → POS (тёмный) | Архитектурное |
| E2 | Структура файлов | +3 новых файла, 3 изменённых. Компоненты и диалоги без изменений | Рефакторинг |
| E3 | Маршруты | Children-роуты: `/` (каталог) и `/pos` (POS-экран) | Изменение |
| E4 | Каталог-экран | Новый компонент: сетка 26 ячеек, 5 секций, светлая тема | Добавление |
| E5 | POS-экран | Перенос всей логики из монолита + кнопка «Назад» + queryParams | Рефакторинг |
| E6 | Сценарии | 7 цепочек автопереходов с задержками, прерывание при ручном закрытии | Добавление |
| E7 | Уведомления из каталога | Логика `showNotification()` для E-STOP и ошибок NE | Добавление |
| E8 | Данные каталога | `catalog-entries.ts`: 26 ячеек в 5 секциях, типизированные | Добавление |
| E9 | Стилизация | Цветовая кодировка секций, бейджи, метки «POS MODAL» | Добавление |
| E10 | Демо-панель | Сохранена внутри POS-экрана (без удаления) | Без изменений |
| E11 | Диаграмма | Полная карта URL-переходов каталог → POS | Документация |

---

## Чеклист проверки (v1.2)

### Каталог (главная страница)
- [ ] Светлая тема (`bg-gray-50`)
- [ ] Header: breadcrumb + заголовок + иконка `bot` + описание
- [ ] 5 секций с заголовками и иконками Lucide
- [ ] 26 ячеек (3 + 2 + 7 + 12 + 2) — подсчёт корректен
- [ ] Ячейки: иконка в цветном круге, заголовок, описание, метка «POS MODAL»
- [ ] Бейджи: «BLOCKED» (красный), «v1.1» (зелёный)
- [ ] Hover: border меняет цвет в зависимости от секции
- [ ] Клик по ячейке → переход на `/pos` с правильными queryParams
- [ ] Responsive сетка: 1 → 2 → 3 колонки (`sm:grid-cols-2 lg:grid-cols-3`)

### POS-экран
- [ ] Кнопка «← Каталог» в header (перед «Стол №3»)
- [ ] `backToCatalog()` → возврат на каталог, очистка таймеров
- [ ] `queryParams.context` → устанавливает `currentContext`
- [ ] `queryParams.modal` → открывает `activeModal`
- [ ] `queryParams.scenario` → запускает `runScenario()`
- [ ] `queryParams.notification` → вызывает `showNotification()`
- [ ] Все 12 диалогов (М1–М12) открываются из каталога
- [ ] Ручное закрытие модалки прерывает автосценарий
- [ ] SegmentedControl контекстов сохранён (из v1.1)
- [ ] Демо-панель сохранена и работает

### Сценарии (цепочки)
- [ ] 7 сценариев определены в `scenarioChains`
- [ ] Каждый шаг имеет `modal` и `delay`
- [ ] QR-сценарии: ускоренные задержки для демо (5 сек вместо 30/120)
- [ ] Ручное закрытие: `closeDialog()` очищает `scenarioTimeouts`
- [ ] `ngOnDestroy()` очищает все pending-таймеры

### Маршруты
- [ ] `/prototype/front-pudu-plugin` → каталог (PuduCatalogScreenComponent)
- [ ] `/prototype/front-pudu-plugin/pos` → POS (PuduPosScreenComponent)
- [ ] Children-маршруты не ломают существующую регистрацию в `app.routes.ts`
- [ ] Lazy-loading: `loadComponent()` для обоих экранов

### Совместимость
- [ ] Все компоненты из v1.0 работают без изменений
- [ ] Все изменения из v1.1 (М12, E-STOP, контексты) работают
- [ ] Mock-данные не затронуты
- [ ] Стили POS-темы не затронуты

---

## Что НЕ менять (перечень для Copilot-прототипировщика)

| Категория | Файлы | Обоснование |
|-----------|-------|-------------|
| Компоненты диалогов | `components/dialogs/*.ts` (12 файлов) | UI модалок не меняется, только точка вызова |
| POS-dialog обёртка | `components/pos-dialog.component.ts` | Переиспользуемый компонент без изменений |
| Shared-компоненты | `pos-header`, `order-items-list`, `cruise-indicator`, `error-toast` | Переносятся в POS-экран «как есть» |
| Mock-данные | `data/mock-data.ts`, `data/ne-error-codes.ts` | Данные не зависят от навигации |
| Стили POS | Тёмная тема, цвета, типографика | Стилистика POS-терминала не меняется |
| Регистрация маршрутов | `app.routes.ts` | Путь `/prototype/front-pudu-plugin` уже зарегистрирован |

---

## Открытые вопросы

| # | Вопрос | Критичность | Адресат |
|---|--------|-------------|---------|
| НВ-16 | Нужно ли добавить поиск/фильтрацию по ячейкам каталога (при росте числа состояний)? | Низкая | Кирилл |
| НВ-17 | Добавить ли ячейку для демонстрации **состояния маркетинг-круиза** (плашка активного круиза на POS)? Сейчас маркетинг toggle работает только через POS-кнопку | Низкая | Кирилл |

---

## История изменений

| Версия | Дата | Автор | Описание |
|--------|------|-------|----------|
| 1.0 | 2026-02-11 | Кирилл Тюрин | Первая версия: 12 модальных окон (М0–М11), state-машина, mock-данные, POS-стилистика |
| 1.1 | 2026-02-13 | Кирилл Тюрин | Промт-патч: два контекста вызова (З-33), М12 мультивыбор (З-35), E-STOP (З-40), ошибки NE (З-39), фраза при заборе (З-15), обновление mock-данных |
| 1.2 | 2026-02-13 | Кирилл Тюрин | **Промт-патч: рефакторинг навигации** — главная страница-каталог ячеек (Storybook-подход). 26 ячеек в 5 секциях: контексты вызова (из заказа / главный экран), сценарии с автоцепочками, одиночные модалки, уведомления. Двухуровневая навигация: Каталог (светлая) → POS (тёмная). Паттерн Premium Bonus. Перенос логики из монолита в PuduPosScreenComponent. Демо-панель сохранена |
