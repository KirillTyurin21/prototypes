# Промт-патч v1.3: Синхронизация прототипа со SPEC-003 v1.3

---
**Версия**: 1.3
**Дата**: 2026-02-14
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д4-патч (Промт-патч для синхронизации данных прототипа с SPEC-003 v1.3)
**Базовый документ**: Промт_прототипа_PUDU_плагин_iikoFront.md (v1.0, 2026-02-11)
**Зависимость**: Промт v1.1 → v1.2 → **v1.3** (этот файл). Применять строго после v1.2.
**Источники**: SPEC-003-плагин-iikoFront-управление-роботами-PUDU.md (v1.4, 2026-02-14); Кросс-валидация данных промтов и спецификации; Разблокировка send_dish (решение: iikoFront на раздаче)
---

## Назначение

Этот документ — **дельта-патч v1.3** к промту v1.0 (с учётом ранее применённых v1.1 и v1.2). Он синхронизирует **данные и комментарии прототипа** с обновлениями SPEC-003 v1.3 (кросс-валидация по ТЗ заказчика).

**Порядок применения патчей**:
```
v1.0 (базовый промт) → v1.1 (контексты, М12, E-STOP) → v1.2 (каталог ячеек) → v1.3 (этот файл: синхронизация данных)
```

> **Характер изменений**: Этот патч корректирует **mock-данные, комментарии, именование полей и значения таймеров** (F1–F9), а также **добавляет сценарий `send_dish`** (G1–G6): три новых модальных окна (М14–М16), mock-настройки, сценарные цепочки и снятие [BLOCKED] с кнопки «Доставка блюд».

---

## Сводка расхождений (по результатам кросс-валидации)

| #   | Категория                 | Серьёзность    | Описание                                                                                                                 | Раздел патча |
| --- | ------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------ |
| 1   | Polling endpoint          | Средняя        | v1.1: `GET /v1/scenarios/scenario-status` (без path param); SPEC-003 v1.3: `GET /v1/scenarios/scenario-status/{task_id}` | F1           |
| 2   | Статус `finished`         | **Высокая**    | v1.1: отдельный внутренний статус `'finished'`; SPEC-003 v1.3: `FINISHED → completed` (тот же, что и `SUCCESS`)          | F2           |
| 3   | `cashier_timeout` (QR)    | **Высокая**    | Промт: 30 сек; SPEC-003 v1.3: 120 сек (расхождение в 4 раза)                                                             | F3           |
| 4   | `send_menu.wait_time`     | Средняя        | Промт: 30 сек; SPEC-003 v1.3: 60 сек                                                                                     | F4           |
| 5   | `pickup_wait_time`        | Средняя        | Промт v1.1: 30 сек; SPEC-003 v1.3: 60 сек                                                                                | F4           |
| 6   | cleanup_auto таймер       | Средняя        | Отсутствует в промтах; SPEC-003 v1.3: 12 мин                                                                             | F5           |
| 7   | Именование API-полей      | **Высокая**    | 12 полей (7 базовых + 5 URL-пар) с рассинхроном имён между промтом и SPEC-003                                            | F6           |
| 8   | `IN_PROCESS` маппинг      | Средняя        | Промт v1.1: 1 NE-статус → 5 внутренних; SPEC-003: 1 → 1 + warning о гипотетичности                                       | F7           |
| 9   | `media_url` гранулярность | Информационная | Промт v1.1: URL per-phrase (7 полей); SPEC-003: один `media_url` на сценарий                                             | F8           |
| 10  | `phrases[]` формат        | Информационная | Промт: single string; SPEC-003: array `[{text, delay_sec}]`                                                              | F8           |
| 11  | `send_dish` [BLOCKED]     | **Высокая**    | Кнопка «Доставка блюд» заблокирована в v1.1; SPEC-003 v1.4: разблокировано (решение: iikoFront на раздаче)               | G1–G6        |
| 12  | Mock-настройки send_dish  | **Высокая**    | Отсутствуют в промтах; SPEC-003 v1.4: `wait_time=60`, `pickup_wait_time=60`, `max_dishes_per_trip=4`                     | G1           |
| 13  | Модалки send_dish         | **Высокая**    | Нет UI для доставки блюд; SPEC-003 v1.4: М14 (подтверждение), М15 (уведомление раздачи), М16 (повторить)                 | G2           |

---

## F1. Polling endpoint: path param `/{task_id}`

> **Источник**: SPEC-003 v1.3, раздел 2.4 — таблица endpoints; раздел 9.7 — псевдокод polling.

### ИЗМЕНИТЬ: Комментарий в `RobotTask.status` (из v1.1 D8.5)

**Было** (v1.1):
```typescript
  // Маппинг к NE API (GET /v1/scenarios/scenario-status):
```

**Стало** (v1.3):
```typescript
  // Polling endpoint (подтверждён NE):
  // GET /v1/scenarios/scenario-status/{task_id}   ← path param
  // Открытый вопрос НВ-12: NE-документ описывает task_id и как query param (?task_id=),
  // и как path param (/{task_id}). SPEC-003 v1.3 стандартизировал на path param.
```

### ИЗМЕНИТЬ: Все упоминания endpoint в комментариях

Везде, где встречается `GET /v1/scenarios/scenario-status` (без `/{task_id}`), заменить на `GET /v1/scenarios/scenario-status/{task_id}`.

**Затронутые места** (в v1.1):
- D8.5 замечание (строка ~490)
- Комментарий маппинга в `RobotTask` (строка ~498)

---

## F2. Статус `finished` → схлопывание в `completed`

> **Источник**: SPEC-003 v1.3, раздел 11.3 — маппинг NE `FINISHED → completed`.

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

SPEC-003 v1.3 определяет, что NE-статусы `SUCCESS` **и** `FINISHED` **оба** маппятся на внутренний статус `completed`. Разница — только в **семантике** (для Trigger Manager), а не в отображении/статусе:

| NE-статус  | Внутренний статус | Семантика                                                                                    |
| ---------- | ----------------- | -------------------------------------------------------------------------------------------- |
| `SUCCESS`  | `completed`       | Задача выполнена успешно                                                                     |
| `FINISHED` | `completed`       | Задача остановлена пользователем (для маркетинга — остановка круиза, не успешное завершение) |

### ИЗМЕНИТЬ: `RobotTask.status` union type (заменяет v1.1 D8.5)

**Было** (v1.1):
```typescript
interface RobotTask {
  task_id: string;
  task_type: 'send_menu' | 'cleanup' | 'qr_payment' | 'send_dish' | 'marketing';
  // Маппинг к NE API (GET /v1/scenarios/scenario-status):
  // NE IN_PROCESS → 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
  // NE FAILED     → 'error'
  // NE SUCCESS    → 'completed'
  // NE FINISHED   → 'finished' (маркетинг, остановлен пользователем)
  // NE CANCELED   → 'cancelled'
  status: 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
        | 'completed' | 'error' | 'cancelled' | 'finished'
        | 'cashier_timeout' | 'payment_timeout';
  table_id: string;
  robot_name: string;
  created_at: Date;
}
```

**Стало** (v1.3):
```typescript
interface RobotTask {
  task_id: string;
  task_type: 'send_menu' | 'cleanup' | 'qr_payment' | 'send_dish' | 'marketing';

  // === Polling endpoint (подтверждён NE): ===
  // GET /v1/scenarios/scenario-status/{task_id}
  //
  // === Маппинг NE-статусов → внутренние: ===
  // NE IN_PROCESS → 'in_progress'
  // NE FAILED     → 'error'
  // NE SUCCESS    → 'completed'
  // NE FINISHED   → 'completed'  (для маркетинга: остановка круиза, не успех;
  //                                Trigger Manager может перезапустить при наличии условий)
  // NE CANCELED   → 'cancelled'
  //
  // === [Critical] Неподтверждённые статусы (6 из 10): ===
  // 'queued', 'assigned', 'at_cashier', 'at_target',
  // 'cashier_timeout', 'payment_timeout'
  // НЕ подтверждены NE API. Используются как гипотетические для полноты UI.
  // Если NE не реализует — потребуется fallback-механизм (см. НВ-16 в SPEC-003).

  status: 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
        | 'completed' | 'error' | 'cancelled'
        | 'cashier_timeout' | 'payment_timeout';
  //       ↑ УДАЛЁН 'finished' — SPEC-003 v1.3: FINISHED маппится на 'completed'

  table_id: string;
  robot_name: string;
  created_at: Date;
}
```

### ИЗМЕНИТЬ: Статусные иконки (раздел 3.2 базового промта)

Убрать `finished` из списка, если он там присутствовал. Статус `completed` покрывает оба кейса (`SUCCESS` и `FINISHED`).

---

## F3. Таймер `cashier_timeout`: 30 → 120 сек

> **Источник**: SPEC-003 v1.3, раздел 6.6 — API-контракт qr_payment: `"cashier_timeout": 120`.

### ИЗМЕНИТЬ: `mockScenarioSettings.qr_payment.cashier_timeout`

**Было** (v1.0 → v1.1):
```typescript
  qr_payment: {
    cashier_phrase: "Положите чек для стола {N}",
    cashier_phrase_url: "",
    cashier_timeout: 30,
```

**Стало** (v1.3):
```typescript
  qr_payment: {
    cashier_phrase: "Положите чек для стола {N}",
    cashier_phrase_url: "",
    cashier_timeout: 120,    // v1.3: обновлено с 30 до 120 сек (SPEC-003 v1.3, раздел 6.6)
```

### ИЗМЕНИТЬ: Диалог М3 (`qr_cashier_phase`) — таймер обратного отсчёта

**Было** (v1.0, раздел 7.3):
```
Обратный таймер: 30 секунд
```

**Стало** (v1.3):
```
Обратный таймер: 120 секунд (2 минуты)
```

> **Примечание**: В v1.2 каталоге (E8) ячейка М3 имеет описание «обратный таймер 30 сек». Обновить описание:

### ИЗМЕНИТЬ: Описание ячейки М3 в каталоге (v1.2 E8)

**Было** (v1.2):
```typescript
    description: 'Иконка принтера, фраза робота, обратный таймер 30 сек',
```

**Стало** (v1.3):
```typescript
    description: 'Иконка принтера, фраза робота, обратный таймер 120 сек (2 мин)',
```

---

## F4. Таймеры send_menu: 30 → 60 сек

> **Источник**: SPEC-003 v1.3, раздел 3.5 — API-контракт send_menu: `"wait_time": 60`, `"pickup_wait_time": 60`.

### ИЗМЕНИТЬ: `mockScenarioSettings.send_menu`

**Было** (v1.1):
```typescript
  send_menu: {
    phrase: "Заберите, пожалуйста, меню",
    phrase_url: "",
    phrase_pickup: "Положите меню для стола №{N}",
    phrase_pickup_url: "",
    wait_time: 30,
    wait_time_pickup: 30
  },
```

**Стало** (v1.3):
```typescript
  send_menu: {
    phrase: "Заберите, пожалуйста, меню",
    phrase_url: "",
    phrase_pickup: "Положите меню для стола №{N}",
    phrase_pickup_url: "",
    wait_time: 60,           // v1.3: обновлено с 30 до 60 сек (SPEC-003 v1.3, раздел 3.5)
    wait_time_pickup: 60     // v1.3: обновлено с 30 до 60 сек (SPEC-003 v1.3, раздел 3.5)
  },
```

> **Примечание**: Поле `wait_time_pickup` здесь показано со **старым именем** (из v1.1). Финальное именование `pickup_wait_time` — см. раздел F6 (переименование полей).

### ИЗМЕНИТЬ: Диалог М1 (`send_menu_confirm`) — если отображается таймер

Если в М1 отображается текст «Время ожидания: 30 сек» — заменить на **60 сек**.

---

## F5. Авто-уборка: mock-настройки `cleanup_auto`

> **Источник**: SPEC-003 v1.3, раздел 5.4 — дефолт таймера авто-уборки = 12 мин.

### ДОБАВИТЬ: Секция `cleanup_auto` в `mockScenarioSettings`

После секции `cleanup` добавить:

```typescript
  cleanup_auto: {
    timer_after_delivery: 720,   // 12 мин (720 сек) — дефолт, рекомендация NE: 12–14 мин
    timer_after_checkout: 0,     // 0 = немедленно после закрытия чека (если включено)
    enabled: false               // В прототипе выключено (авто-уборка — фоновый процесс без UI)
    // Триггер 1: отметка «блюдо выдано» → таймер → POST /api/tasks/cleanup
    // Триггер 2: закрытие чека → немедленная отправка (если enabled)
    // Дедупликация: проверка has_active_task('cleanup', table_id)
  },
```

> **Примечание**: Авто-уборка не имеет собственного модального окна в POS-плагине (работает полностью в фоне). Mock-данные добавлены для полноты конфигурации и консистентности с SPEC-003.

---

## F6. Именование API-полей: синхронизация со SPEC-003

> **Источник**: Кросс-валидация именования полей между промтом (v1.0/v1.1) и SPEC-003 v1.3.
> **Важно**: SPEC-003 — первичный источник. Прототип должен соответствовать.

### Таблица переименований

| #   | Промт (текущее имя)  | SPEC-003 v1.3 (целевое имя) | Контекст            | Файл промта               |
| --- | -------------------- | --------------------------- | ------------------- | ------------------------- |
| 1   | `cashier_phrase`     | `phrase_cashier`            | qr_payment settings | v1.0 base L541, v1.1 L540 |
| 2   | `cashier_phrase_url` | `phrase_cashier_url`        | qr_payment settings | v1.1 L541                 |
| 3   | `guest_wait_time`    | `payment_timeout`           | qr_payment settings | v1.0 base L544, v1.1 L542 |
| 4   | `phrase_failure`     | `phrase_fail`               | qr_payment settings | v1.0 base L546, v1.1 L547 |
| 5   | `phrase_failure_url` | `phrase_fail_url`           | qr_payment settings | v1.1 L548                 |
| 6   | `wait_time_pickup`   | `pickup_wait_time`          | send_menu settings  | v1.1 L527                 |
| 7   | `phrase_pickup`      | `pickup_phrase`             | send_menu settings  | v1.1 L524                 |
| 8   | `phrase_pickup_url`  | `pickup_phrase_url`         | send_menu settings  | v1.1 L525                 |
| 9   | `phrase_arrival`     | `phrase`                    | cleanup settings    | v1.0 base L535, v1.1 L532 |
| 10  | `phrase_arrival_url` | `phrase_url`                | cleanup settings    | v1.1 L533                 |
| 11  | `phrase_later`       | `phrase_fail`               | cleanup settings    | v1.0 base L537, v1.1 L537 |
| 12  | `phrase_later_url`   | `phrase_fail_url`           | cleanup settings    | v1.1 L538                 |

### ИЗМЕНИТЬ: `mockScenarioSettings` (полная обновлённая версия)

Ниже — **полная** секция `mockScenarioSettings` с учётом **ВСЕХ** патчей (v1.1 + v1.3), заменяющая все предыдущие версии:

```typescript
const mockScenarioSettings = {

  // --- Доставка меню (S1) ---
  send_menu: {
    phrase: "Заберите, пожалуйста, меню",        // Фраза при подъезде к столу (до 180 символов)
    phrase_url: "",                               // URL видео/аудио (З-12)
    pickup_phrase: "Положите меню для стола №{N}",  // Фраза при заборе меню на pickup (З-15)
    pickup_phrase_url: "",                        // URL видео/аудио (З-12)
    wait_time: 60,                               // Ожидание у стола, сек (SPEC-003: 60)
    pickup_wait_time: 60                         // Ожидание на pickup, сек (SPEC-003: 60)
  },

  // --- Уборка посуды — ручная (S2) ---
  cleanup: {
    mode: "manual",                              // Режим уборки: manual | auto | mixed (из Admin Panel)
    phrase: "Пожалуйста, поставьте грязную посуду на поднос",  // Фраза при подъезде
    phrase_url: "",                              // URL видео/аудио
    wait_time: 90,                               // Ожидание у стола, сек (SPEC-003: 90)
    phrase_fail: "Я приеду позже за посудой",    // Фраза при неудаче (посуду не положили)
    phrase_fail_url: ""                          // URL видео/аудио
  },

  // --- Уборка посуды — авто (S4) ---
  cleanup_auto: {
    timer_after_delivery: 720,                   // 12 мин = 720 сек, дефолт (рекомендация NE: 12–14 мин)
    timer_after_checkout: 0,                     // сек, 0 = немедленно после закрытия чека
    enabled: false                               // Авто-уборка: фоновый процесс, без модального окна
    // Триггер 1: «блюдо выдано» → таймер → POST /api/tasks/cleanup
    // Триггер 2: «заказ закрыт» → POST /api/tasks/cleanup (если enabled)
  },

  // --- Оплата QR (S3) ---
  qr_payment: {
    phrase_cashier: "Положите чек для стола {N}",  // Фраза при подъезде к кассиру
    phrase_cashier_url: "",                      // URL видео/аудио
    cashier_timeout: 120,                        // Тайм-аут у кассира, сек (SPEC-003: 120)
    payment_timeout: 120,                        // Тайм-аут оплаты гостем, сек (SPEC-003: 120)
    phrase_success: "Спасибо за оплату!",        // Фраза при успешной оплате
    phrase_success_url: "",                      // URL видео/аудио
    phrase_fail: "К сожалению, оплата не прошла. Обратитесь к официанту",  // Фраза при неудаче
    phrase_fail_url: ""                          // URL видео/аудио
  },

  // --- Маркетинг (S6) ---
  marketing: {
    robot_id: "PD2024080042",                    // Робот для маркетинга
    auto_cruise_on_idle: true                    // Авто-запуск круиза при idle
  }
  // general — УДАЛЁН из MVP (З-31, v1.1)
};
```

> **Warning**: Именование полей в реальных API-запросах (`POST /api/tasks/{task_type}`) может отличаться от mock-настроек полученных из Admin Panel. SPEC-003 описывает формат **API-запросов** к NE, а `mockScenarioSettings` — формат **настроек из iikoWeb**. В продакшен-реализации маппинг `настройки → API-запрос` выполняется плагином.

---

## F7. Маппинг `IN_PROCESS`: исправление комментария

> **Источник**: SPEC-003 v1.3, раздел 11.2 — Critical-предупреждение.

### ИЗМЕНИТЬ: Комментарий маппинга NE-статусов (уже обновлён в F2)

Основная правка включена в F2. Дополнительно — убрать из любых комментариев утверждение, что `IN_PROCESS` раскладывается на `queued | assigned | in_progress | at_cashier | at_target`.

**Было** (v1.1 D8.5):
```typescript
  // NE IN_PROCESS → 'queued' | 'assigned' | 'in_progress' | 'at_cashier' | 'at_target'
```

**Стало** (v1.3):
```typescript
  // NE IN_PROCESS → 'in_progress'
  // (Статусы queued, assigned, at_cashier, at_target — гипотетические, НЕ подтверждены NE)
```

---

## F8. Информационные примечания (без изменений UI)

Следующие расхождения **зафиксированы**, но **не корректируются** в прототипе — они касаются архитектурных решений, которые будут реализованы разработчиком:

### F8.1. `media_url` — один на сценарий vs. per-phrase

**Промт v1.1** моделирует URL **на каждую фразу** (7 полей: `phrase_url`, `pickup_phrase_url`, и т.д.).
**SPEC-003 v1.3** упрощает до **одного** `media_url` на сценарий.

**Решение**: Оставить per-phrase URL в прототипе как есть. Это позволяет разработчику увидеть **максимальный** набор полей. При реализации разработчик сам выберет гранулярность по согласованию с NE.

### F8.2. `phrases[]` — массив vs. строка

**SPEC-003 v1.3** описывает формат `phrases: [{text, delay_sec}]` (массив пар текст + задержка).
**Промт** использует `phrase: "строка"` (single string).

**Решение**: Оставить single string в прототипе. Массив фраз — серверная логика, не влияет на визуальное отображение модалок. Плагин отправляет фразы в API-запросе, но не рисует их по одной.

### F8.3. `robot_id` (optional) в API cleanup и qr_payment

> **Источник**: SPEC-003 v1.3, изменения #2 и #3 — добавлено поле `robot_id` (optional) в API-контракты cleanup и qr_payment для единообразия с send_menu и marketing.

**SPEC-003 v1.3** ([раздел 4.5](../01-Спецификации/SPEC-003-плагин-iikoFront-управление-роботами-PUDU.md)): В JSON-запросах cleanup и qr_payment добавлено поле:
```json
"robot_id": "PD2024060001"   // optional — если не указан, NE выбирает свободного
```

**Импакт на прототип**: **Нулевой**. Прототип использует `getAssignedRobot()` (из v1.1 D8.7) для показа имени робота в диалогах. Поле `robot_id` — параметр API-запроса, не отображаемый в UI. В продакшене:
- Если пользователь не выбирает конкретного робота → `robot_id` не передаётся → NE назначает свободного
- Если робот выбран явно → `robot_id` передаётся в запросе

**Решение**: Не вносить изменений в прототип. Зафиксировать для разработчика: при реализации API-вызовов `cleanup` и `qr_payment` — добавить optional `robot_id` в request body.

---

## F9. Обновление описания ячейки М2 в каталоге (cleanup)

> **Источник**: SPEC-003 v1.3, раздел 4.5 — cleanup wait_time = 90 сек (совпадает).

Описание ячейки М2 в каталоге (v1.2 E8) корректно: «время ожидания 90 сек». **Изменений не требуется.**

---

## G1. Сценарий «Доставка блюд» (`send_dish`): mock-настройки

> **Источник**: SPEC-003 v1.4, раздел 7 — сценарий разблокирован (решение: iikoFront на раздаче, 13.02.2026).
> **Замечания**: З-48, З-18, З-19, З-12

### КЛЮЧЕВОЕ ИЗМЕНЕНИЕ

Сценарий `send_dish` (S5 / В6) **разблокирован**. Принято архитектурное решение: на раздаче размещается **терминал iikoFront** с плагином PUDU. Человек на раздаче видит уведомление о прибытии робота и список блюд. Робот ожидает `pickup_wait_time`, затем едет к столу (аналогично `send_menu`).

### ДОБАВИТЬ: Секция `send_dish` в `mockScenarioSettings`

В полной версии `mockScenarioSettings` (из F6) **после** секции `cleanup_auto` и **перед** секцией `qr_payment` добавить:

```typescript
  // --- Доставка блюд (S5) --- // NEW: v1.3 (G1) — сценарий разблокирован
  send_dish: {
    phrase: "Ваш заказ для стола №{N} доставлен. Приятного аппетита!",  // Фраза при подъезде к столу (до 180 символов)
    phrase_url: "",                                       // URL видео/аудио
    pickup_phrase: "Загрузите блюда для стола №{N}: {dishes}",  // Фраза при заборе на раздаче
    pickup_phrase_url: "",                                // URL видео/аудио
    wait_time: 60,                                        // Ожидание у стола, сек (SPEC-003: 60)
    pickup_wait_time: 60,                                 // Ожидание на раздаче, сек (SPEC-003: 60)
    max_dishes_per_trip: 4,                               // Макс. блюд за один рейс (З-48)
    phrase_repeat: "Заберите, пожалуйста, ваш заказ!",    // Фраза при повторной отправке (кнопка «Повторить»)
    phrase_repeat_url: ""                                  // URL видео/аудио для повтора
    // Решение: iikoFront на раздаче (v1.4)
    // Робот показывает статичное изображение (стол, блюда, рейс)
    // Терминал раздачи показывает уведомление через стандартный механизм (раздел 9)
    // Явное подтверждение загрузки — НЕ в MVP (по таймеру, как send_menu)
  },
```

### ИЗМЕНИТЬ: Полная секция `mockScenarioSettings` (обновление F6)

В F6 была предоставлена полная версия `mockScenarioSettings` **без** `send_dish`. Обновлённая версия:

```typescript
const mockScenarioSettings = {

  // --- Доставка меню (S1) ---
  send_menu: {
    phrase: "Заберите, пожалуйста, меню",
    phrase_url: "",
    pickup_phrase: "Положите меню для стола №{N}",
    pickup_phrase_url: "",
    wait_time: 60,
    pickup_wait_time: 60
  },

  // --- Уборка посуды — ручная (S2) ---
  cleanup: {
    mode: "manual",
    phrase: "Пожалуйста, поставьте грязную посуду на поднос",
    phrase_url: "",
    wait_time: 90,
    phrase_fail: "Я приеду позже за посудой",
    phrase_fail_url: ""
  },

  // --- Уборка посуды — авто (S4) ---
  cleanup_auto: {
    timer_after_delivery: 720,
    timer_after_checkout: 0,
    enabled: false
  },

  // --- Доставка блюд (S5) --- // NEW: v1.3 (G1)
  send_dish: {
    phrase: "Ваш заказ для стола №{N} доставлен. Приятного аппетита!",
    phrase_url: "",
    pickup_phrase: "Загрузите блюда для стола №{N}: {dishes}",
    pickup_phrase_url: "",
    wait_time: 60,
    pickup_wait_time: 60,
    max_dishes_per_trip: 4,
    phrase_repeat: "Заберите, пожалуйста, ваш заказ!",
    phrase_repeat_url: ""
  },

  // --- Оплата QR (S3) ---
  qr_payment: {
    phrase_cashier: "Положите чек для стола {N}",
    phrase_cashier_url: "",
    cashier_timeout: 120,
    payment_timeout: 120,
    phrase_success: "Спасибо за оплату!",
    phrase_success_url: "",
    phrase_fail: "К сожалению, оплата не прошла. Обратитесь к официанту",
    phrase_fail_url: ""
  },

  // --- Маркетинг (S6) ---
  marketing: {
    robot_id: "PD2024080042",
    auto_cruise_on_idle: true
  }
};
```

---

## G2. Новые модальные окна для `send_dish`

> **Источник**: SPEC-003 v1.4, раздел 7.8 — UI/UX доставки блюд.

### ДОБАВИТЬ: Модальное окно М14 (`send_dish_confirm`)

Окно подтверждения отправки (аналогично М1 для send_menu). Появляется при нажатии кнопки «Доставка блюд» **только в режиме фудкорта** (ручной ввод стола). В стандартном режиме (стол из контекста заказа) — задача отправляется **без модалки** (одно нажатие).

```html
<!-- М14: Подтверждение доставки блюд (только для фудкорта) -->
<div class="modal-overlay bg-black/70" *ngIf="activeModal === 'send_dish_confirm'">
  <div class="modal bg-zinc-900 border border-zinc-700 rounded-xl w-[480px] shadow-2xl">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
      <div class="flex items-center gap-3">
        <i-lucide name="utensils" class="text-blue-400" [size]="20"></i-lucide>
        <h2 class="text-lg font-semibold text-white">Доставка блюд</h2>
      </div>
      <button (click)="closeModal()" class="text-zinc-400 hover:text-white">
        <i-lucide name="x" [size]="20"></i-lucide>
      </button>
    </div>
    <!-- Body -->
    <div class="px-6 py-5 space-y-4">
      <div class="flex items-center gap-3 text-zinc-300">
        <i-lucide name="map-pin" [size]="18" class="text-zinc-500"></i-lucide>
        <span>Стол: <strong class="text-white">{{ selectedTable?.name || '—' }}</strong></span>
      </div>
      <div class="flex items-center gap-3 text-zinc-300">
        <i-lucide name="package" [size]="18" class="text-zinc-500"></i-lucide>
        <span>Блюд: <strong class="text-white">{{ dishCount }}</strong>,
              рейсов: <strong class="text-white">{{ totalTrips }}</strong></span>
      </div>
      <div class="text-xs text-zinc-500">
        Макс. {{ settings.send_dish.max_dishes_per_trip }} блюд за рейс
      </div>
    </div>
    <!-- Footer -->
    <div class="flex justify-end gap-3 px-6 py-4 border-t border-zinc-700">
      <button (click)="closeModal()"
              class="px-4 py-2 text-sm text-zinc-300 bg-zinc-800 border border-zinc-600 rounded-lg hover:bg-zinc-700">
        Отмена
      </button>
      <button (click)="executeSendDish()"
              class="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              [disabled]="!selectedTable">
        Отправить
      </button>
    </div>
  </div>
</div>
```

### ДОБАВИТЬ: Модальное окно М15 (`send_dish_pickup_notification`)

Уведомление на **терминале раздачи** о прибытии робота. Это стандартная плашка-уведомление iikoFront (не модальное окно).

```html
<!-- М15: Уведомление на терминале раздачи (push-нотификация) -->
<div class="fixed top-4 left-4 right-4 z-50 animate-slide-down"
     *ngIf="activeNotification === 'send_dish_pickup'">
  <div class="bg-amber-900/90 border border-amber-600 rounded-xl p-4 shadow-2xl max-w-lg mx-auto">
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0 w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center">
        <i-lucide name="chef-hat" class="text-amber-200" [size]="20"></i-lucide>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-semibold text-amber-100">Робот {{ robotName }} прибыл</span>
          <span class="text-xs text-amber-400">Рейс {{ tripNumber }}/{{ totalTrips }}</span>
        </div>
        <div class="text-sm text-amber-200 mb-2">
          Стол <strong>{{ tableName }}</strong>
        </div>
        <div class="text-xs text-amber-300 space-y-0.5">
          <div *ngFor="let dish of dishes" class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
            <span>{{ dish.name }} × {{ dish.quantity }}</span>
          </div>
        </div>
        <div class="mt-2 text-xs text-amber-500">
          Загрузите блюда. Робот уедет через {{ pickupWaitTime }} сек.
        </div>
      </div>
      <button (click)="dismissNotification()" class="text-amber-500 hover:text-amber-300">
        <i-lucide name="x" [size]="16"></i-lucide>
      </button>
    </div>
    <!-- Прогресс-бар обратного отсчёта -->
    <div class="mt-3 h-1 bg-amber-800 rounded-full overflow-hidden">
      <div class="h-full bg-amber-400 rounded-full transition-all duration-1000"
           [style.width.%]="pickupProgress"></div>
    </div>
  </div>
</div>
```

### ДОБАВИТЬ: Модальное окно М16 (`send_dish_repeat_confirm`)

Окно подтверждения кнопки «Повторить» (повторная отправка рейса).

```html
<!-- М16: Подтверждение повторной отправки -->
<div class="modal-overlay bg-black/70" *ngIf="activeModal === 'send_dish_repeat'">
  <div class="modal bg-zinc-900 border border-zinc-700 rounded-xl w-[420px] shadow-2xl">
    <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
      <div class="flex items-center gap-3">
        <i-lucide name="repeat" class="text-amber-400" [size]="20"></i-lucide>
        <h2 class="text-lg font-semibold text-white">Повторить доставку</h2>
      </div>
      <button (click)="closeModal()" class="text-zinc-400 hover:text-white">
        <i-lucide name="x" [size]="20"></i-lucide>
      </button>
    </div>
    <div class="px-6 py-5 space-y-3">
      <p class="text-sm text-zinc-300">
        Отправить робота повторно к столу <strong class="text-white">{{ tableName }}</strong>
        с теми же блюдами?
      </p>
      <div class="text-xs text-zinc-500">
        Робот произнесёт: «{{ settings.send_dish.phrase_repeat }}»
      </div>
    </div>
    <div class="flex justify-end gap-3 px-6 py-4 border-t border-zinc-700">
      <button (click)="closeModal()"
              class="px-4 py-2 text-sm text-zinc-300 bg-zinc-800 border border-zinc-600 rounded-lg hover:bg-zinc-700">
        Отмена
      </button>
      <button (click)="executeRepeatSendDish()"
              class="px-4 py-2 text-sm text-white bg-amber-600 rounded-lg hover:bg-amber-700">
        Повторить
      </button>
    </div>
  </div>
</div>
```

---

## G3. Новые ячейки каталога для `send_dish`

> **Источник**: SPEC-003 v1.4, раздел 7.

### ДОБАВИТЬ: Ячейки в массив `catalogCells` (v1.2 E8)

Добавить в секцию «Сценарии» каталога (после ячеек QR-оплаты):

```typescript
    // === Доставка блюд (send_dish) — NEW: v1.3 (G3) ===
    {
      id: 'send_dish_confirm',
      title: 'М14: Доставка блюд',
      description: 'Подтверждение отправки (фудкорт): стол, кол-во блюд, рейсов',
      category: 'scenarios',
      modal: 'send_dish_confirm',
      icon: 'utensils',
      badge: 'NEW'
    },
    {
      id: 'send_dish_pickup',
      title: 'М15: Уведомление раздачи',
      description: 'Push-нотификация на терминале раздачи: робот прибыл, список блюд, прогресс-бар pickup_wait_time',
      category: 'scenarios',
      modal: 'send_dish_pickup_notification',
      icon: 'chef-hat',
      badge: 'NEW'
    },
    {
      id: 'send_dish_repeat',
      title: 'М16: Повторить доставку',
      description: 'Подтверждение повторной отправки рейса, фраза повтора',
      category: 'scenarios',
      modal: 'send_dish_repeat',
      icon: 'repeat',
      badge: 'NEW'
    },
```

---

## G4. Сценарные цепочки для `send_dish`

> **Источник**: SPEC-003 v1.4, разделы 7.2, 7.7, 7.11.

### ДОБАВИТЬ: Цепочки в `scenarioChains` (v1.2 E6)

```typescript
  // === Доставка блюд — NEW: v1.3 (G4) ===

  // Полный цикл: отправка → загрузка на раздаче → доставка к столу
  'send_dish-full': [
    { modal: 'send_dish_confirm', delay: 0 },              // М14 (только фудкорт)
    { modal: 'loading', delay: 3000 },                      // Отправка задачи
    { modal: 'send_dish_pickup_notification', delay: 5000 }, // М15: уведомление раздачи
    { modal: 'success', delay: 4000 },                       // Задача завершена
  ],

  // Быстрый путь: из заказа (стол из контекста, без модалки)
  'send_dish-quick': [
    { modal: 'loading', delay: 3000 },                      // Отправка задачи
    { modal: 'send_dish_pickup_notification', delay: 5000 }, // М15: уведомление раздачи
    { modal: 'success', delay: 4000 },                       // Задача завершена
  ],

  // Повторная отправка (кнопка «Повторить»)
  'send_dish-repeat': [
    { modal: 'send_dish_repeat', delay: 0 },                // М16: подтверждение
    { modal: 'loading', delay: 3000 },                      // Отправка задачи
    { modal: 'send_dish_pickup_notification', delay: 5000 }, // М15: робот едет на раздачу и при повторе
    { modal: 'success', delay: 4000 },                       // Задача завершена
  ],

  // Ошибка: стол не замаплен
  'send_dish-error-mapping': [
    { modal: 'error', delay: 0, params: { message: 'Стол не привязан к точке робота. Настройте маппинг в iiko Web' } },
  ],

  // Ошибка: нет свободных роботов
  'send_dish-error-busy': [
    { modal: 'loading', delay: 2000 },
    { modal: 'error', delay: 0, params: { message: 'Нет свободных роботов. Попробуйте позже' } },
  ],

  // Ошибка: NE API недоступен (SPEC-003 7.10)
  'send_dish-error-ne': [
    { modal: 'loading', delay: 3000 },
    { modal: 'error', delay: 0, params: { message: 'Сервер роботов недоступен. Попробуйте позже' } },
  ],

  // Ошибка: polling вернул FAILED (SPEC-003 7.10)
  'send_dish-error-polling': [
    { modal: 'loading', delay: 3000 },
    { modal: 'send_dish_pickup_notification', delay: 5000 },
    { modal: 'error', delay: 0, params: { message: 'Робот BellaBot-01: ошибка доставки блюд. Стол 5. E_OBSTACLE' } },
  ],

  // Ошибка: рейс K завершился с ошибкой, K+1 не отправляется (SPEC-003 7.10)
  'send_dish-error-trip': [
    { modal: 'loading', delay: 3000 },
    { modal: 'send_dish_pickup_notification', delay: 5000 },
    { modal: 'success', delay: 3000 },                       // Рейс 1 OK
    { modal: 'loading', delay: 3000 },                       // Рейс 2...
    { modal: 'error', delay: 0, params: { message: 'Ошибка рейса 2/3. Рейсы 3/3 отменены' } },
  ],
```

---

## G5. Снятие [BLOCKED] с кнопки «Доставка блюд»

> **Источник**: SPEC-003 v1.4, раздел 2.7 — контекст 1.

### ИЗМЕНИТЬ: Кнопки контекста «Из заказа» (v1.1 D1)

**Было** (v1.1):
```typescript
  // Контекст 1: Из заказа
  orderContextButtons: [
    { id: 'send_menu', label: 'Отправить меню', icon: 'book-open', action: 'send_menu' },
    { id: 'cleanup', label: 'Уборка', icon: 'spray-can', action: 'cleanup' },
    { id: 'send_dish', label: 'Доставка блюд', icon: 'utensils', action: 'send_dish', disabled: true, badge: 'BLOCKED' },
  ],
```

**Стало** (v1.3):
```typescript
  // Контекст 1: Из заказа
  orderContextButtons: [
    { id: 'send_menu', label: 'Отправить меню', icon: 'book-open', action: 'send_menu' },
    { id: 'cleanup', label: 'Уборка', icon: 'spray-can', action: 'cleanup' },
    { id: 'send_dish', label: 'Доставка блюд', icon: 'utensils', action: 'send_dish' },  // v1.3 (G5): РАЗБЛОКИРОВАНО
    { id: 'send_dish_repeat', label: 'Повторить', icon: 'repeat', action: 'send_dish_repeat',
      disabled: true, tooltip: 'Доступно после завершения рейса' },  // v1.3 (G5): NEW
  ],
```

> **Примечание**: Кнопка «Повторить» добавлена рядом с «Доставка блюд». Она `disabled` по умолчанию и активируется только после завершения хотя бы одного рейса `send_dish` для данного заказа.

### ИЗМЕНИТЬ: Карта переходов контекста «Из заказа» (v1.1 D1)

Добавить ветки для send_dish:

```
Клик «Доставка блюд» ─►
    ├── Стол из контекста заказа (стандарт) ──► activeModal = 'loading'
    │   └── Ответ NE: task_id ──► 'success' (3 сек) → null
    │       └── Ошибка ──► 'error' → null
    ├── Стол не привязан (фудкорт) ──► activeModal = 'send_dish_confirm'
    │   ├── «Отправить» ──► 'loading' → 'success' → null
    │   └── «Отмена» ──► null
    └── Стол не замаплен ──► toast «Стол не привязан к точке робота»

Клик «Повторить» (disabled → active после завершения рейса) ─►
    └── activeModal = 'send_dish_repeat'
        ├── «Повторить» ──► 'loading' → 'success' → null
        └── «Отмена» ──► null
```

---

## G6. Mock-данные: пример заказа с блюдами

> **Источник**: SPEC-003 v1.4, раздел 7.9 — API-контракт send_dish.

### ДОБАВИТЬ: Mock-данные заказа (для демо send_dish)

```typescript
// NEW: v1.3 (G6) — mock-данные для демонстрации send_dish
const mockOrderDishes = [
  { id: 'dish-001', name: 'Паста Болоньезе', quantity: 1 },
  { id: 'dish-002', name: 'Салат Цезарь', quantity: 2 },
  { id: 'dish-003', name: 'Стейк рибай', quantity: 1 },
  { id: 'dish-004', name: 'Крем-суп грибной', quantity: 1 },
  { id: 'dish-005', name: 'Тирамису', quantity: 2 },
  { id: 'dish-006', name: 'Латте', quantity: 3 },
];

// При max_dishes_per_trip = 4 → 3 рейса:
// Рейс 1: dish-001, dish-002, dish-003, dish-004
// Рейс 2: dish-005, dish-006
// (Рейс 3 не нужен — всего 6 позиций, 10 шт. с учётом quantity)
```

---

## Сводная таблица изменений (v1.3)

| #         | Раздел / Компонент   | Изменение                                                                                            | Тип            | Визуальный импакт                              |
| --------- | -------------------- | ---------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------- |
| F1        | Комментарии endpoint | Polling: `/{task_id}` path param                                                                     | Документация   | Нет                                            |
| F2        | `RobotTask.status`   | Удалён `'finished'`, схлопнут в `'completed'`; Critical-warning о 6 неподтв. статусах                | Данные         | Нет (UI не показывает `finished` отдельно)     |
| F3        | М3 + mock settings   | `cashier_timeout`: 30 → **120 сек**                                                                  | **Визуальное** | **Да**: таймер обратного отсчёта на М3 = 2 мин |
| F4        | М1 + mock settings   | `wait_time`: 30 → **60 сек**; `pickup_wait_time`: 30 → **60 сек**                                    | **Визуальное** | **Да**: если М1 отображает таймер              |
| F5        | Mock settings        | Добавлена секция `cleanup_auto` (таймер 12 мин)                                                      | Данные         | Нет (авто-уборка — фоновый процесс)            |
| F6        | Mock settings        | Переименованы 12 полей для соответствия SPEC-003                                                     | Данные         | Нет (имена полей не отображаются в UI)         |
| F7        | Комментарии маппинга | `IN_PROCESS → in_progress` (не 5 подстатусов)                                                        | Документация   | Нет                                            |
| F8.1–F8.2 | Информационно        | `media_url` и `phrases[]` — зафиксированы, не корректируются                                         | —              | Нет                                            |
| F8.3      | Информационно        | `robot_id` (optional) в API cleanup и qr_payment — зафиксировано                                     | —              | Нет                                            |
| G1        | Mock settings        | Добавлена секция `send_dish` (`wait_time=60`, `pickup_wait_time=60`, `max_dishes_per_trip=4`, фразы) | Данные         | Нет (данные для логики)                        |
| G2        | Модальные окна       | Добавлены М14 (confirm), М15 (pickup notification), М16 (repeat)                                     | **Визуальное** | **Да**: 3 новых модальных окна                 |
| G3        | Каталог ячеек        | Добавлены 3 ячейки `send_dish_*` в массив `catalogCells`                                             | **Визуальное** | **Да**: новые ячейки в каталоге                |
| G4        | Сценарные цепочки    | Добавлены 5 цепочек `send_dish-*` в `scenarioChains`                                                 | Навигация      | Да: демо-потоки send_dish                      |
| G5        | Контекст 1 (заказ)   | Кнопка «Доставка блюд» разблокирована + кнопка «Повторить»                                           | **Визуальное** | **Да**: кнопка активна, добавлена «Повторить»  |
| G6        | Mock-данные          | Добавлен `mockOrderDishes[]` (6 блюд) для демо send_dish                                             | Данные         | Нет (входные данные для демо)                  |

---

## Обновлённый чеклист прототипа (дельта к v1.2)

### Данные и таймеры (визуальные)
- [ ] М3: обратный таймер = **120 сек** (2 минуты), а не 30 сек
- [ ] М1: время ожидания send_menu = **60 сек**, а не 30 сек
- [ ] Mock `mockScenarioSettings.qr_payment.cashier_timeout` = **120**
- [ ] Mock `mockScenarioSettings.send_menu.wait_time` = **60**
- [ ] Mock `mockScenarioSettings.send_menu.pickup_wait_time` = **60** (было `wait_time_pickup`)

### Данные и таймеры (невизуальные)
- [ ] Добавлена секция `cleanup_auto` в `mockScenarioSettings`
- [ ] `cleanup_auto.timer_after_delivery` = **720** (12 мин)

### Именование полей
- [ ] `cashier_phrase` → `phrase_cashier`
- [ ] `guest_wait_time` → `payment_timeout`
- [ ] `phrase_failure` → `phrase_fail` (qr_payment)
- [ ] `phrase_arrival` → `phrase` (cleanup)
- [ ] `phrase_later` → `phrase_fail` (cleanup)
- [ ] `wait_time_pickup` → `pickup_wait_time` (send_menu)
- [ ] `phrase_pickup` → `pickup_phrase` (send_menu)
- [ ] Все `*_url` поля переименованы соответственно

### Типы и комментарии
- [ ] `RobotTask.status`: удалён `'finished'`
- [ ] Комментарий маппинга NE-статусов обновлён (FINISHED → completed)
- [ ] Добавлен Critical-warning о 6 неподтверждённых статусах
- [ ] Polling endpoint: `/{task_id}` path param

### Каталог (v1.2)
- [ ] Ячейка М3: описание обновлено «таймер 120 сек (2 мин)»
- [ ] Остальные ячейки — без изменений

### Доставка блюд (send_dish) — NEW (v1.3 G-серия)
- [ ] Секция `send_dish` добавлена в `mockScenarioSettings` (G1)
- [ ] `send_dish.wait_time` = **60** сек
- [ ] `send_dish.pickup_wait_time` = **60** сек
- [ ] `send_dish.max_dishes_per_trip` = **4**
- [ ] `send_dish.phrase` = «Ваш заказ для стола №{N} доставлен. Приятного аппетита!»
- [ ] `send_dish.pickup_phrase` = «Загрузите блюда для стола №{N}: {dishes}»
- [ ] М14 (`send_dish_confirm`): подтверждение отправки — фудкорт (G2)
- [ ] М15 (`send_dish_pickup_notification`): уведомление раздачи с прогресс-баром (G2)
- [ ] М16 (`send_dish_repeat`): подтверждение повторной отправки (G2)
- [ ] Ячейки каталога: `send_dish_confirm`, `send_dish_pickup`, `send_dish_repeat` (G3)
- [ ] Сценарные цепочки: `send_dish-full`, `send_dish-quick`, `send_dish-repeat`, ошибки: `error-mapping`, `error-busy`, `error-ne`, `error-polling`, `error-trip` (G4)
- [ ] Кнопка «Доставка блюд» **разблокирована** (`disabled: true` → удалено, `badge: 'BLOCKED'` → удалено) (G5)
- [ ] Кнопка «Повторить» добавлена (disabled по умолчанию) (G5)
- [ ] Mock-данные `mockOrderDishes[]` добавлены (G6)

### QR-сценарии (v1.2 E6) — обновление задержек

> В v1.2 определены сценарии с ускоренными задержками для демо:

```typescript
'qr-full': [
    { modal: 'qr_cashier_phase', delay: 0 },
    { modal: 'loading', delay: 5000 },         // было 5000 — OK для демо
    { modal: 'qr_guest_phase', delay: 3000 },
    { modal: 'qr_success', delay: 5000 },
],
```

**Без изменений**: Задержки в `scenarioChains` — ускоренные для демо-показа. Они НЕ обязаны совпадать с реальными тайм-аутами (120 / 120 сек). Реальные тайм-ауты задаются в `mockScenarioSettings`.

---

## Открытые вопросы (новые)

| #     | Вопрос                                                                                                                                                                                                                                                 | Критичность | Адресат             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ------------------- |
| НВ-18 | **`cashier_timeout` = 120 сек** — долгий таймер для демо. Возможно, прототип должен показывать ускоренный таймер (например, 15 сек), а в настройках указывать реальные 120 сек. Аналогично тому, как QR-сценарии в v1.2 используют ускоренные задержки | Низкая      | Кирилл              |
| НВ-19 | **Именование полей**: в SPEC-003 mock-настройки из iikoWeb и API-запросы к NE используют **одинаковые** имена полей. Промт моделировал **свои** имена. Нужно ли полное переименование, или mock-настройки — абстракция, допускающая расхождение?       | Средняя     | Наиль (разработчик) |
| НВ-20 | **Явное подтверждение загрузки на раздаче**: в MVP робот ожидает `pickup_wait_time` (аналог send_menu). Нужна ли кнопка «Подтвердить загрузку» на терминале раздачи для отправки робота досрочно? (Требует нового endpoint NE)                         | Средняя     | NE / Руслан         |
| НВ-21 | **Разбиение на рейсы**: алгоритм разбиения блюд — по `max_dishes_per_trip` (позиций, не штук). Подтвердить с NE: рейсы отправляются последовательно (следующий после завершения предыдущего)?                                                          | Средняя     | NE                  |

---

## Обновлённая структура файлов (дельта)

**Новые файлы**:

```
src/app/prototypes/iiko-front-pudu-plugin/
├── components/
│   └── dialogs/
│       ├── send-dish-confirm.component.ts       # NEW (G2): М14 — подтверждение доставки (фудкорт)
│       ├── send-dish-pickup-notify.component.ts  # NEW (G2): М15 — уведомление раздачи
│       └── send-dish-repeat.component.ts         # NEW (G2): М16 — повторная отправка
```

**Изменённые файлы**:

```
src/app/prototypes/iiko-front-pudu-plugin/
├── types.ts                         # CHANGED: RobotTask.status — удалён 'finished', обновлены комментарии
├── data/
│   └── mock-data.ts                 # CHANGED: mockScenarioSettings — таймеры, имена полей, cleanup_auto, send_dish (G1), mockOrderDishes (G6)
├── components/
│   └── dialogs/
│       └── qr-cashier-phase.component.ts  # CHANGED: таймер 30 → 120 сек
├── screens/
│   ├── pudu-catalog-screen.component.ts   # CHANGED: описание ячейки М3 + 3 ячейки send_dish (G3)
│   └── pudu-order-context.component.ts    # CHANGED: кнопка «Доставка блюд» разблокирована + «Повторить» (G5)
├── services/
│   └── scenario-chains.ts                 # CHANGED: добавлены 5 цепочек send_dish-* (G4)
```

---

## История изменений

| Версия | Дата       | Автор        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------ | ---------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0    | 2026-02-11 | Кирилл Тюрин | Первая версия: 12 модальных окон, state-машина, mock-данные, POS-стилистика                                                                                                                                                                                                                                                                                                                                                                                                  |
| 1.1    | 2026-02-13 | Кирилл Тюрин | Промт-патч: два контекста (З-33), М12 мультивыбор (З-35), E-STOP (З-40), ошибки NE (З-39), маппинг NE-статусов (З-42)                                                                                                                                                                                                                                                                                                                                                        |
| 1.2    | 2026-02-13 | Кирилл Тюрин | Промт-патч: рефакторинг навигации — каталог ячеек (Storybook-подход), 26 ячеек, двухуровневая навигация                                                                                                                                                                                                                                                                                                                                                                      |
| 1.3    | 2026-02-14 | Кирилл Тюрин | **Промт-патч: синхронизация со SPEC-003 v1.4**. **F-серия**: Polling endpoint → path param `/{task_id}`. Статус `finished` удалён. Таймеры: `cashier_timeout` 30→120, `wait_time` 30→60. `cleanup_auto` (12 мин). 12 полей переименованы. **G-серия (send_dish)**: Разблокировка сценария (решение: iikoFront на раздаче). Mock-настройки (G1). Модалки М14–М16 (G2). Каталог (G3). Сценарные цепочки (G4). Кнопка разблокирована + «Повторить» (G5). Mock-данные блюд (G6). |
