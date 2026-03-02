# Промт-патч v1.8: Плагин iikoFront — управление роботами PUDU

---
**Версия**: 1.8
**Дата**: 2026-02-26
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д4-патч (Промт-патч для обновления прототипа iikoFront POS-плагина)
**Базовый документ**: Промт_прототипа_PUDU_плагин_iikoFront_v1.7_патч.md (v1.7, 2026-02-26)
**Источники**: стенограмма встречи 18.02 (Руслан, Кирилл); SPEC-003 v1.18 (правки П-7, П-8, П-9); документ правок `2026-02-26-правки-SPEC-003-по-встрече-18-02.md`
**Scope**: Три правки по механизму уведомлений: П-7 (удалить Completed toast), П-8 (auto-close Dispatched через 10 сек), П-9 (send_dish toast с кол-вом блюд)
---

## Назначение

Этот документ — **дельта-патч** к промту v1.7 плагина iikoFront. Он описывает **только изменения**, связанные с тремя решениями встречи 18.02.2026 по механизму уведомлений:

1. **П-7**: Completion-уведомления **полностью убраны** — настройка `show_success_notifications` удалена, toast тип Completed удалён
2. **П-8**: Toast Dispatched — **auto-close через 10 секунд** вместо persistent до крестика
3. **П-9**: send_dish toast — показывать **количество блюд за рейс** и номер рейса

> **Руслан** (18.02): *«Официант же подошёл, тыкнул действие и пошёл дальше. Он же не будет стоять возле монитора и ждать, когда же он его выполнит. Нет, поэтому смысла нет.»*
> **Кирилл** (18.02): *«Я предлагаю вот это системное уведомление iikoFront, чтобы оно закрывалось автоматически через 10 секунд.»*
> **Руслан** (18.02): *«Да, конечно.»*
> **Кирилл** (18.02): *«Надо ли при сценарии доставки блюд показывать состав позиций? [...] В этом уведомлении я выписал, сколько блюд за рейс максимум.»*
> **Руслан** (18.02): *«Давайте вот так, да.»*

**Инструкция по применению**: сначала примени базовый промт `Промт_прототипа_PUDU_плагин_iikoFront.md` (v1.0), затем патчи v1.1, v1.2, v1.3, v1.4, v1.5, v1.6, v1.7 и затем этот патч v1.8 — последовательно.

**Ключевые изменения v1.8:**
- Toast тип **Completed** (`bg-green-600/90 text-white`) — полностью удалён (П-7)
- Настройка `show_success_notifications` — удалена из mock и UI (П-7)
- Демо-панель: 9 → 7 элементов (убраны «Уведомления завершения» и «Задача завершена») (П-7)
- Ячейка `toast-completed-generic` — удалена из каталога (П-7)
- Цепочка `fire-and-forget-full` — убран финальный шаг `→ completed` (П-7)
- Цепочка `task-completed-polling` — удалена (П-7)
- Polling при `completed` — без toast, только удаление task_id из пула (П-7)
- Toast Dispatched: поведение `Persistent до крестика` → **`Auto-close: 10 секунд`** (П-8)
- Крестик ручного закрытия Dispatched — **остаётся** (можно закрыть раньше) (П-8)
- Toast send_dish: расширенный формат с кол-вом блюд и рейсами (П-9)
- Добавлены ячейки каталога: `toast-dispatched-send_dish-multi-trip`, `toast-dispatched-send_dish-single-trip` (П-9)

---

## Совместимость с предыдущими патчами

| Патч           | Совместимость | Примечание                                                         |
| -------------- | ------------- | ------------------------------------------------------------------ |
| v1.0 (базовый) | Требуется     | Базовые модалки, state machine, toast-стек                         |
| v1.1 (D1–D8)   | Требуется     | Два контекста order/main                                           |
| v1.2 (E1–E11)  | Требуется     | Каталог ячеек                                                      |
| v1.3 (F1–F9)   | Требуется     | M14–M16 send_dish                                                  |
| v1.4 (H1–H14)  | Требуется     | Fire-and-forget, toast lifecycle, `TASK_HUMAN_NAMES`, демо-панель  |
| v1.5 (I1–I11)  | Требуется     | Двойное имя робота, `displayRobotNameDual()`                       |
| v1.6 (J1–J3)   | Требуется     | Удаление `phrase_fail` из cleanup                                  |
| v1.7 (K1–K11)  | Требуется     | П-1..П-6: М18 3 колонки, M17/M1/M2/M14 DEPRECATED, marketing убран |

---

## Перечень изменений v1.8

| #       | Изменение                                                                   | Область     | Причина                                       | SPEC-003 |
| ------- | --------------------------------------------------------------------------- | ----------- | --------------------------------------------- | -------- |
| **L1**  | УДАЛИТЬ toast тип Completed                                                 | Toast       | Completion-уведомления не показываются        | П-7      |
| **L2**  | УДАЛИТЬ `show_success_notifications` из mock и демо-панели                  | Mock / Демо | Настройка больше не существует                | П-7      |
| **L3**  | УДАЛИТЬ ячейки каталога `toast-completed-generic`, `task-completed-polling` | Каталог     | Completed toast удалён                        | П-7      |
| **L4**  | ОБНОВИТЬ цепочку `fire-and-forget-full` — убрать шаг `completed`            | Цепочки     | Completed toast не показывается               | П-7      |
| **L5**  | ОБНОВИТЬ poll_cycle: при `completed` — без toast                            | Логика      | Только удаление task_id из пула               | П-7      |
| **L6**  | ОБНОВИТЬ toast Dispatched: auto-close через 10 секунд                       | Toast       | Официанту не нужно нажимать крестик           | П-8      |
| **L7**  | ОБНОВИТЬ ячейки каталога Dispatched: визуальная метка «auto-close 10s»      | Каталог     | Отражение нового поведения                    | П-8      |
| **L8**  | ОБНОВИТЬ toast send_dish: расширенный формат с блюдами и рейсами            | Toast       | Информация о количестве блюд за рейс          | П-9      |
| **L9**  | ДОБАВИТЬ ячейки каталога send_dish toast (multi-trip, single-trip)          | Каталог     | Демонстрация двух вариантов toast send_dish   | П-9      |
| **L10** | ОБНОВИТЬ mock-данные: корректный расчёт рейсов                              | Mock        | 6 блюд / 2 за рейс = 3 рейса для демонстрации | П-9      |

---

## L1. УДАЛИТЬ toast тип Completed (П-7)

### Причина

Тип toast **Completed** (`bg-green-600/90 text-white`, иконка `check-circle-2`) — **полностью удаляется** из прототипа. Уведомления о завершении задач роботом не показываются.

> **Руслан** (18.02): *«Официант же подошёл, тыкнул действие и пошёл дальше. Он же не будет стоять возле монитора и ждать, когда же он его выполнит. Нет, поэтому смысла нет.»*

### ИЗМЕНИТЬ: Таблица Toast-уведомлений (раздел 2.7 в prototypes.instructions.md)

**Было (v1.7, 5 типов):**
```
| Тип                              | Стиль                              | Иконка           | Поведение              | Когда                                                                                         |
| -------------------------------- | ---------------------------------- | ---------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| **Error** (single)               | `bg-red-600/90 text-white`         | `alert-circle`   | Persistent до крестика | Ошибка NE API / робота                                                                        |
| **Error** (persistent_repeating) | `bg-red-600/90` + метка «ПОВТОРНО» | `alert-circle`   | Повтор при polling     | E-STOP, OBSTACLE, LOW_BATTERY, MANUAL_MODE                                                    |
| **Info**                         | `bg-[#b8c959]/90 text-black`       | `info`           | Persistent до крестика | Дедупликация cleanup (смешанный режим)                                                        |
| **Dispatched**                   | `bg-[#b8c959]/90 text-black`       | `send`           | Persistent до крестика | После HTTP 200 (task_id). **Только ручные** сценарии                                          |
| **Completed**                    | `bg-green-600/90 text-white`       | `check-circle-2` | Persistent до крестика | При `completed` в polling. **Настраиваемый** (`show_success_notifications`, default: `false`) |
```

**Стало (v1.8 L1, 4 типа — Completed удалён):**
```
| Тип                              | Стиль                              | Иконка         | Поведение              | Когда                                      |
| -------------------------------- | ---------------------------------- | -------------- | ---------------------- | ------------------------------------------ |
| **Error** (single)               | `bg-red-600/90 text-white`         | `alert-circle` | Persistent до крестика | Ошибка NE API / робота                     |
| **Error** (persistent_repeating) | `bg-red-600/90` + метка «ПОВТОРНО» | `alert-circle` | Повтор при polling     | E-STOP, OBSTACLE, LOW_BATTERY, MANUAL_MODE |
| **Info**                         | `bg-[#b8c959]/90 text-black`       | `info`         | Persistent до крестика | Дедупликация cleanup (смешанный режим)     |
| **Dispatched**                   | `bg-[#b8c959]/90 text-black`       | `send`         | Persistent до крестика | После HTTP 200. **Только ручные** сценарии |
```

> **Итого**: 4 типа toast (было 5). Тип **Completed** полностью удалён.

### ИЗМЕНИТЬ: Тексты Completed (раздел 2.7 в prototypes.instructions.md)

**Было (v1.5, сохранялось до v1.7):**
```
**Тексты Completed** (v1.5): «{human_name} — {display_name} — выполнено. Стол {N}».
```

**Стало (v1.8 L1):**
```
~~**Тексты Completed**~~ — УДАЛЕНЫ v1.8 (П-7). Completion-уведомления не показываются.
```

---

## L2. УДАЛИТЬ `show_success_notifications` из mock и демо-панели (П-7)

### ИЗМЕНИТЬ: Mock generalSettings (определено в v1.4 H11, раздел 2.10)

**Было:**
```typescript
const generalSettings = {
  show_success_notifications: false  // Руслан 06.02: по умолчанию выключены
};
```

**Стало (v1.8 L2):**
```typescript
// v1.8 L2: generalSettings.show_success_notifications УДАЛЁН (П-7)
// Completion-уведомления полностью убраны — настройка больше не существует
const generalSettings = {
  // show_success_notifications — УДАЛЁН v1.8 П-7
};
```

> **Примечание**: Если `generalSettings` становится пустым объектом и нигде больше не используется — допускается его полное удаление. `dismissedErrors` Map **остаётся** — он нужен для `persistent_repeating` ошибок.

### ИЗМЕНИТЬ: Демо-панель (раздел 2.11 в prototypes.instructions.md)

**Было (v1.7 K11, 9 элементов):**
```
| 1   | Контекст: Заказ / Главный  | Toggle   | Переключение PuduContextType  |
| 2   | Имитация ошибки NE         | Button   | Показ M11                     |
| 3   | Имитация E-STOP            | Button   | Error toast                   |
| 4   | Робот в пути (pickup)      | Button   | Показ M15                     |
| 5   | Блюда приняты гостем       | Button   | Закрытие M15                  |
| 6   | E-STOP (повторная)         | Button   | Toast с меткой «ПОВТОРНО»     |
| 7   | Режим уборки               | Selector | Ручной/Авто/Смешанный         |
| 8   | Уведомления завершения     | Toggle   | show_success_notifications    |
| 9   | Задача завершена           | Button   | Toast completed (зелёный)     |
```

**Стало (v1.8 L2, 7 элементов — #8 и #9 удалены):**
```
| 1   | Контекст: Заказ / Главный  | Toggle   | Переключение PuduContextType  |
| 2   | Имитация ошибки NE         | Button   | Показ M11                     |
| 3   | Имитация E-STOP            | Button   | Error toast                   |
| 4   | Робот в пути (pickup)      | Button   | Показ M15                     |
| 5   | Блюда приняты гостем       | Button   | Закрытие M15                  |
| 6   | E-STOP (повторная)         | Button   | Toast с меткой «ПОВТОРНО»     |
| 7   | Режим уборки               | Selector | Ручной/Авто/Смешанный         |
```

**Удалены (П-7):**
- ~~#8 — Уведомления завершения (Toggle)~~ — настройка `show_success_notifications` удалена
- ~~#9 — Задача завершена (Button)~~ — toast Completed удалён

### ИЗМЕНИТЬ: Mock-данные (раздел 2.10 в prototypes.instructions.md)

**Было:**
```
| Общие настройки  | `generalSettings`      | —           | `show_success_notifications: false`     |
```

**Стало (v1.8 L2):**
```
| Общие настройки  | `generalSettings`      | —           | ~~`show_success_notifications`~~ [УДАЛЁН v1.8 П-7] |
```

---

## L3. УДАЛИТЬ ячейки каталога Completed (П-7)

### УДАЛИТЬ: Ячейки из каталога (определены в v1.4 H14)

Удалить из каталога ячеек:

```typescript
// v1.8 L3: УДАЛЕНЫ (П-7 — completed toast больше не существует)
// { id: 'toast-completed-generic', title: 'Toast: задача выполнена (зелёный)', category: 'toast', badge: 'OK' },
```

### УДАЛИТЬ: Цепочка `task-completed-polling` (определена в v1.4 H14)

**Было:**
```
| task-completed-polling | null + toast completed (зелёный) |
```

**Стало (v1.8 L3):**
Цепочка **удалена**. При `completed` в polling — без toast, только удаление task_id (см. L5).

---

## L4. ОБНОВИТЬ цепочку `fire-and-forget-full` (П-7)

### ИЗМЕНИТЬ: Сценарные цепочки (раздел 2.9 в prototypes.instructions.md)

**Было (v1.7 K10):**
```
| fire-and-forget-full | POS-кнопка → спиннер → dispatched (5s) → completed |
```

**Стало (v1.8 L4):**
```
| fire-and-forget-full | POS-кнопка → спиннер → dispatched (10s auto-close) |
```

> Финальный шаг `→ completed` убран, т.к. completed toast не показывается (П-7). Dispatched toast теперь auto-close через 10 секунд (П-8) вместо 5s persistent.

---

## L5. ОБНОВИТЬ poll_cycle: при `completed` — без toast (П-7)

### ИЗМЕНИТЬ: Логика polling

В логике polling при получении статуса `completed` от NE:

**Было:**
```typescript
// v1.4 H11: при completed — показать toast (если show_success_notifications = true)
if (taskStatus === 'completed') {
  if (generalSettings.show_success_notifications) {
    this.addToast({
      type: 'completed',
      text: `${humanName} — ${displayName} — выполнено. Стол ${tableName}`
    });
  }
  this.removeActiveTask(task_id);
}
```

**Стало (v1.8 L5):**
```typescript
// v1.8 L5: при completed — НЕ показывать toast (П-7). Только удалить task_id из пула.
if (taskStatus === 'completed') {
  // П-7: Completion-уведомления полностью убраны.
  // Без вызова addToast() — официант не ждёт завершения.
  this.removeActiveTask(task_id);
}
```

---

## L6. ОБНОВИТЬ toast Dispatched: auto-close через 10 секунд (П-8)

### Причина

Все toast типа **Dispatched** (при отправке задачи) меняют поведение с «Persistent до крестика» на **«Auto-close через 10 секунд»**. Официанту не нужно нажимать «Закрыть».

> **Кирилл** (18.02): *«Я предлагаю вот это системное уведомление iikoFront, чтобы оно закрывалось автоматически через 10 секунд.»*
> **Руслан** (18.02): *«Да, конечно.»*

### ИЗМЕНИТЬ: Таблица Toast-уведомлений — строка Dispatched (раздел 2.7)

**Было (v1.7 → L1):**
```
| **Dispatched** | `bg-[#b8c959]/90 text-black` | `send` | Persistent до крестика | После HTTP 200. **Только ручные** сценарии |
```

**Стало (v1.8 L6):**
```
| **Dispatched** | `bg-[#b8c959]/90 text-black` | `send` | **Auto-close: 10 секунд** | После HTTP 200. **Только ручные** сценарии |
```

### ДОБАВИТЬ: Реализация auto-close

Добавить `setTimeout` (или Angular-эквивалент) на 10000 мс для автоматического скрытия toast Dispatched:

```typescript
// v1.8 L6: Auto-close для dispatched toast (П-8, 18.02)
const DISPATCHED_AUTO_CLOSE_MS = 10_000; // 10 секунд

showDispatchedToast(toastData: DispatchedToast): void {
  const toastId = this.addToast(toastData);

  // Auto-close через 10 секунд (П-8)
  setTimeout(() => {
    this.removeToast(toastId);
  }, DISPATCHED_AUTO_CLOSE_MS);
}
```

**Важно**: Крестик для ручного закрытия **остаётся** — официант может закрыть раньше, если хочет. Но если не трогать — toast закроется сам через 10 секунд.

### ОБНОВИТЬ: Метод `handleSendTask()` (v1.7 K9)

**Было (v1.7 K9):**
```typescript
this.addToast({
  type: 'dispatched',
  text: `${humanName} — отправлено. Стол ${tableName}`
});
```

**Стало (v1.8 L6 — использует showDispatchedToast с auto-close):**
```typescript
// v1.8 L6: dispatched toast через showDispatchedToast() с auto-close 10s
this.showDispatchedToast({
  type: 'dispatched',
  text: `${humanName} — отправлено. Стол ${tableName}`
});
```

---

## L7. ОБНОВИТЬ ячейки каталога Dispatched (П-8)

### ИЗМЕНИТЬ: Ячейки dispatched в каталоге (определены в v1.4 H14)

Обновить все ячейки, содержащие dispatched toast — добавить визуальную метку «auto-close 10s»:

**Было:**
```typescript
{ id: 'toast-dispatched-send_menu', title: 'Toast: отправка Доставка меню', category: 'toast', badge: 'OK' },
```

**Стало (v1.8 L7):**
```typescript
// v1.8 L7: метка auto-close 10s (П-8)
{ id: 'toast-dispatched-send_menu', title: 'Toast: отправка Доставка меню (auto-close 10s)', category: 'toast', badge: 'UPDATED' },
```

> Аналогично обновить все ячейки `toast-dispatched-*`.

---

## L8. ОБНОВИТЬ toast send_dish: расширенный формат с кол-вом блюд и рейсами (П-9)

### Причина

В toast-уведомлении при отправке задачи `send_dish` отображается расширенная информация: количество блюд за рейс и номер рейса.

> **Кирилл** (18.02): *«Надо ли при сценарии доставки блюд показывать состав позиций? [...] В этом уведомлении я выписал, сколько блюд за рейс максимум.»*
> **Руслан** (18.02): *«Давайте вот так, да.»*

### ИЗМЕНИТЬ: Текст toast для send_dish

**Было (v1.7 K10):**
```
Доставка блюд — отправлено. Стол {N}
```

**Стало (v1.8 L8):**
```
Доставка блюд — отправлено. Стол {N}. Блюд: {X} из {Y} (рейс {K} из {M})
```

Где:
- `{N}` — номер стола
- `{X}` — количество блюд в текущем рейсе (= `max_dishes_per_trip` или остаток, если блюд меньше лимита)
- `{Y}` — общее количество блюд в заказе
- `{K}` — номер текущего рейса
- `{M}` — общее количество рейсов

**Пример** (mock): заказ 6 блюд, `max_dishes_per_trip = 2` → 3 рейса:
- Рейс 1: `«Доставка блюд — отправлено. Стол 3. Блюд: 2 из 6 (рейс 1 из 3)»`
- Рейс 2: `«Доставка блюд — отправлено. Стол 3. Блюд: 2 из 6 (рейс 2 из 3)»`
- Рейс 3: `«Доставка блюд — отправлено. Стол 3. Блюд: 2 из 6 (рейс 3 из 3)»`

**Пример** (1 рейс): заказ 2 блюда, `max_dishes_per_trip = 4`:
- `«Доставка блюд — отправлено. Стол 3. Блюд: 2 из 2 (рейс 1 из 1)»`

### ОБНОВИТЬ: Метод `handleSendTask()` — специальная логика для send_dish

**Было (v1.7 K9 + v1.8 L6, общий toast для всех сценариев):**
```typescript
this.showDispatchedToast({
  type: 'dispatched',
  text: `${humanName} — отправлено. Стол ${tableName}`
});
```

**Стало (v1.8 L8 — специальный формат для send_dish):**
```typescript
// v1.8 L8: send_dish — расширенный toast с кол-вом блюд и рейсами (П-9)
if (taskType === 'send_dish') {
  const totalDishes = this.mockOrderDishes.length; // Y — всего блюд
  const maxPerTrip = this.mockScenarioSettings.send_dish.max_dishes_per_trip; // лимит за рейс
  const totalTrips = Math.ceil(totalDishes / maxPerTrip); // M — всего рейсов
  const currentTrip = this.currentSendDishTrip || 1; // K — текущий рейс
  const dishesThisTrip = Math.min(maxPerTrip, totalDishes - (currentTrip - 1) * maxPerTrip); // X — блюд в рейсе

  this.showDispatchedToast({
    type: 'dispatched',
    text: `${humanName} — отправлено. Стол ${tableName}. Блюд: ${dishesThisTrip} из ${totalDishes} (рейс ${currentTrip} из ${totalTrips})`
  });
} else {
  // Остальные сценарии — стандартный формат
  this.showDispatchedToast({
    type: 'dispatched',
    text: `${humanName} — отправлено. Стол ${tableName}`
  });
}
```

### ИЗМЕНИТЬ: Тексты Dispatched (раздел 2.7 в prototypes.instructions.md)

**Было (v1.7 K10):**
```
**Тексты Dispatched** (v1.7): «{human_name} — отправлено. Стол {N}» (без имени робота — робот неизвестен на момент отправки, П-4). ~~marketing~~ [УДАЛЁН П-6].
```

**Стало (v1.8 L8):**
```
**Тексты Dispatched** (v1.8):
- send_menu: «Доставка меню — отправлено. Стол {N}»
- cleanup: «Уборка посуды — отправлено. Стол {N}»
- send_dish: «Доставка блюд — отправлено. Стол {N}. Блюд: {X} из {Y} (рейс {K} из {M})» (П-9)
Без имени робота (робот неизвестен на момент отправки, П-4).
```

---

## L9. ДОБАВИТЬ ячейки каталога send_dish toast (П-9)

### ДОБАВИТЬ: Новые ячейки в каталог

```typescript
// v1.8 L9: Toast send_dish с информацией о рейсах (П-9)
{ id: 'toast-dispatched-send_dish-multi-trip',  title: 'Toast: send_dish (блюд: 2 из 6, рейс 1 из 3)', category: 'toast', badge: 'NEW' },
{ id: 'toast-dispatched-send_dish-single-trip', title: 'Toast: send_dish (блюд: 2 из 2, рейс 1 из 1)',  category: 'toast', badge: 'NEW' },
```

### ОБНОВИТЬ: Секция каталога «Toast/State» (определена в v1.4 H14)

**Было:**
```
| Toast/State (H14) | 6 | toast-dispatched-send_menu, toast-completed-generic, button-submitting... |
```

**Стало (v1.8 L9):**
```
| Toast/State (H14, L3, L7, L9) | 7 | toast-dispatched-send_menu (auto-close 10s), button-submitting, toast-dispatched-send_dish-multi-trip, toast-dispatched-send_dish-single-trip... ~~toast-completed-generic~~ [УДАЛЁН L3] |
```

---

## L10. ОБНОВИТЬ mock-данные: корректный расчёт рейсов (П-9)

### ПОДТВЕРДИТЬ: Существующие mock-данные достаточны

Обеспечить, чтобы `mockOrderDishes` (6 блюд) и `mockScenarioSettings.send_dish.max_dishes_per_trip` (значение 2) давали корректный расчёт для демонстрации:

| Параметр              | Значение                                                         | Источник  |
| --------------------- | ---------------------------------------------------------------- | --------- |
| `mockOrderDishes`     | 6 блюд                                                           | v1.3 F5   |
| `max_dishes_per_trip` | 2                                                                | v1.3 F5   |
| Рейсов                | 3                                                                | 6 / 2 = 3 |
| Toast рейс 1          | «Доставка блюд — отправлено. Стол 3. Блюд: 2 из 6 (рейс 1 из 3)» | v1.8 L8   |

> **Примечание**: Если `max_dishes_per_trip` ещё не определён в mock-данных — добавить. Если уже определён (v1.3 F5) — подтвердить значение `2`.

---

## Сводка изменений по компонентам

### Toast-уведомления (после патча v1.8)

| Тип                              | Стиль                              | Иконка         | Поведение                       | Когда                                      |
| -------------------------------- | ---------------------------------- | -------------- | ------------------------------- | ------------------------------------------ |
| **Error** (single)               | `bg-red-600/90 text-white`         | `alert-circle` | Persistent до крестика          | Ошибка NE API / робота                     |
| **Error** (persistent_repeating) | `bg-red-600/90` + метка «ПОВТОРНО» | `alert-circle` | Повтор при polling              | E-STOP, OBSTACLE, LOW_BATTERY, MANUAL_MODE |
| **Info**                         | `bg-[#b8c959]/90 text-black`       | `info`         | Persistent до крестика          | Дедупликация cleanup (смешанный режим)     |
| **Dispatched**                   | `bg-[#b8c959]/90 text-black`       | `send`         | **Auto-close: 10 секунд** (П-8) | После HTTP 200. **Только ручные** сценарии |
| ~~**Completed**~~                | ~~Удалён~~ (П-7)                   | —              | —                               | —                                          |

**Итого**: 4 типа toast (было 5).

### Тексты Dispatched (после патча v1.8)

| Сценарий  | Формат toast                                                               |
| --------- | -------------------------------------------------------------------------- |
| send_menu | «Доставка меню — отправлено. Стол {N}»                                     |
| cleanup   | «Уборка посуды — отправлено. Стол {N}»                                     |
| send_dish | «Доставка блюд — отправлено. Стол {N}. Блюд: {X} из {Y} (рейс {K} из {M})» |

> **Примечание**: `display_name` (имя робота) **не включается** в toast dispatched, т.к. робот назначается NE автоматически и на момент отправки ещё не известен (П-4, v1.7).

### Демо-панель (после патча v1.8)

| #   | Элемент                   | Тип      | Действие                       |
| --- | ------------------------- | -------- | ------------------------------ |
| 1   | Контекст: Заказ / Главный | Toggle   | Переключение `PuduContextType` |
| 2   | Имитация ошибки NE        | Button   | Показ M11                      |
| 3   | Имитация E-STOP           | Button   | Error toast                    |
| 4   | Робот в пути (pickup)     | Button   | Показ M15                      |
| 5   | Блюда приняты гостем      | Button   | Закрытие M15                   |
| 6   | E-STOP (повторная)        | Button   | Toast с меткой «ПОВТОРНО»      |
| 7   | Режим уборки              | Selector | Ручной/Авто/Смешанный          |

**Удалены (П-7):**
- ~~#8 — Уведомления завершения (Toggle)~~
- ~~#9 — Задача завершена (Button)~~

---

## Обновление prototypes.instructions.md

При применении этого патча обновить state-файл:

### Метаданные

```
> **Плагин iikoFront**: v1.8 (базовый v1.0 + патчи v1.1, v1.2, v1.3, v1.4, v1.5, v1.6, v1.7, v1.8)
```

### Toast-уведомления (раздел 2.7)

Заменить таблицу 5 типов на 4 типа (удалён Completed). Обновить Dispatched: `Persistent до крестика` → `Auto-close: 10 секунд`.

Обновить тексты:
```
**Тексты Dispatched** (v1.8):
- send_menu: «Доставка меню — отправлено. Стол {N}»
- cleanup: «Уборка посуды — отправлено. Стол {N}»
- send_dish: «Доставка блюд — отправлено. Стол {N}. Блюд: {X} из {Y} (рейс {K} из {M})» (П-9)
Без имени робота (робот неизвестен на момент отправки, П-4).
~~**Тексты Completed**~~ — УДАЛЕНЫ v1.8 (П-7).
```

### Каталог ячеек (раздел 2.8)

```
| Toast/State (H14, L3, L7, L9) | 7 | toast-dispatched-send_menu (auto-close 10s), button-submitting, pos-button-submitting, pos-button-after-send, toast-dispatched-send_dish-multi-trip, toast-dispatched-send_dish-single-trip... ~~toast-completed-generic~~ [УДАЛЁН L3] |
```

### Сценарные цепочки (раздел 2.9)

```
| fire-and-forget-full   | POS-кнопка → спиннер → dispatched (10s auto-close)                                       |
| task-completed-polling | ~~[УДАЛЁН v1.8 L3]~~ — completed toast не показывается                                    |
```

### Mock-данные (раздел 2.10)

```
| Общие настройки  | `generalSettings`      | —           | ~~`show_success_notifications`~~ [УДАЛЁН v1.8 П-7] |
```

### Демо-панель (раздел 2.11)

Заменить 9 элементов на 7 (удалены #8 «Уведомления завершения» и #9 «Задача завершена»).

### Хронология патчей (раздел 2.12)

```
| **v1.8**  | 2026-02-26 | L1–L10 | П-7: Toast Completed полностью удалён; `show_success_notifications` удалён из mock и демо-панели (#8, #9); ячейка `toast-completed-generic` удалена; цепочка `task-completed-polling` удалена; `fire-and-forget-full` без шага completed. П-8: Dispatched toast auto-close 10 секунд (крестик остаётся). П-9: Toast send_dish — расширенный формат с количеством блюд и рейсами; ячейки `send_dish-multi-trip`, `send_dish-single-trip`. |
```

### Нумерация (раздел 4.3)

```
- Плагин: текущая серия **L** (v1.8). Следующий патч: серия **M** → v1.9
```

### Бизнес-правила (раздел 3.3)

**Было:**
```
- **show_success_notifications**: default `false` (решение Руслана 06.02), настройка в `general_settings` (Плагин v1.4 H11)
```

**Стало:**
```
- ~~**show_success_notifications**~~: **УДАЛЕНО** v1.8 (П-7). Completion-уведомления полностью убраны — не предусмотрена настройка для включения.
```

---

## Контрольный чеклист

- [ ] Удалён toast тип **Completed** (`bg-green-600/90`) из таблицы (L1)
- [ ] Удалена настройка `show_success_notifications` из mock и UI (L2)
- [ ] Удалены элементы #8, #9 из демо-панели (L2). Итого: 7 элементов
- [ ] Удалена ячейка `toast-completed-generic` из каталога (L3)
- [ ] Удалена цепочка `task-completed-polling` (L3)
- [ ] Обновлена цепочка `fire-and-forget-full`: без шага `completed`, dispatched 10s (L4)
- [ ] Polling при `completed` — без toast, только удаление task_id (L5)
- [ ] Dispatched toast: `Persistent до крестика` → `Auto-close: 10 секунд` (L6)
- [ ] Крестик ручного закрытия dispatched — **остаётся** (L6)
- [ ] Toast send_dish: новый формат `Блюд: {X} из {Y} (рейс {K} из {M})` (L8)
- [ ] Mock: `max_dishes_per_trip = 2`, 6 блюд → 3 рейса (корректный расчёт) (L10)
- [ ] Добавлены ячейки каталога: `toast-dispatched-send_dish-multi-trip`, `toast-dispatched-send_dish-single-trip` (L9)
- [ ] Ячейки dispatched обновлены: метка «auto-close 10s» (L7)

---

*Патч v1.8 (серия L) — конец файла. Следующий патч: серия M → v1.9*
