# Промт-патч v1.9: Плагин iikoFront — управление роботами PUDU

---
**Версия**: 1.9
**Дата**: 2026-02-26
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д4-патч (Промт-патч для обновления прототипа iikoFront POS-плагина)
**Базовый документ**: Промт_прототипа_PUDU_плагин_iikoFront_v1.8_патч.md (v1.8, 2026-02-26)
**Источники**: стенограмма встречи 18.02 (Руслан, Кирилл, Олег); SPEC-003 v1.19 (правки П-10, П-11, П-12, П-13); документ правок `2026-02-26-правки-SPEC-003-по-встрече-18-02.md`
**Scope**: Четыре правки: П-10 (send_dish — NE распределяет рейсы), П-11 (кнопка «Повторить» упрощена), П-12 (qr_payment zero-interaction с toast), П-13 (очередь задач NE — NO_AVAILABLE_ROBOTS не ошибка)
---

## Назначение

Этот документ — **дельта-патч** к промту v1.8 плагина iikoFront. Он описывает **только изменения**, связанные с четырьмя решениями встречи 18.02.2026:

1. **П-10**: send_dish — плагин отправляет **одну команду** с полным заказом. NE декомпозирует на рейсы и распределяет по роботам. Поля `trip_number` и `total_trips` убраны
2. **П-11**: Кнопка «Повторить» (М16) — **упрощена**: confirm-диалог «Повторить / Уехать», robot_id не передаётся, не привязана к подсчёту рейсов, расположение рядом с «Pudu: Команды»
3. **П-12**: qr_payment — подтверждён как **zero-interaction**. Добавлен зелёный toast «Команда отправлена» (auto-close 10 сек)
4. **П-13**: Все задачи ставятся в очередь NE. Ошибка `NO_AVAILABLE_ROBOTS` → задача **не отклоняется**, а принимается в очередь

> **Руслан** (18.02): *«Мы же можем эту команду разбить. Мы видим, что у нас в ресторане три робота. Один из них повёз меню. Два свободных. Всего 6 блюд, за рейс вводим 2. Следовательно, мы сразу двоих зовём к себе.»*
> **Руслан** (18.02): *«Оставим повторную отправку.»*
> **Кирилл** (18.02): *«Кнопку повторную отправку, чтобы минимизировать клики, вынести рядышком с "PUDU Команды". [...] Упрощаем: несмотря на то что робот отработал, официант нажимает "Повторить", приезжает любой свободный робот и просто везёт заказ снова.»*
> **Кирилл** (18.02): *«Когда мы нажимаем кнопку "Фискальный чек", плагин перехватывает события. Никаких уведомлений, никаких запретов, никаких других действий окон по плагину — сразу уйдёт вам команда, вы отправляете первого свободного робота, и всё.»*
> **Руслан** (18.02): *«Да, можно выбрать занятого, и ему просто попадёт в режиме ожидания робота.»*

**Инструкция по применению**: сначала примени базовый промт `Промт_прототипа_PUDU_плагин_iikoFront.md` (v1.0), затем патчи v1.1, v1.2, v1.3, v1.4, v1.5, v1.6, v1.7, v1.8 и затем этот патч v1.9 — последовательно.

**Ключевые изменения v1.9:**
- М16 (`send_dish_repeat`) — полная переработка: упрощённый confirm-диалог «Повторить / Уехать» (П-11)
- М16 больше не отображает: имя робота, ID робота, статус робота, информацию о рейсах (П-11)
- М16 `robot_id` не передаётся — NE назначает свободного (П-11)
- М14 (`send_dish_confirm`) — обновлён: отправка полного заказа одной командой (П-10)
- Toast send_dish текст — обновлён: NE возвращает информацию о рейсах в response (П-10)
- QR toast — добавлен акцентный toast «Команда отправлена» при успешной постановке qr_payment (П-12)
- Ошибка «Нет свободных роботов» — заменена на «Задача поставлена в очередь» (П-13)
- Mock-данные `mockOrderDishes` — обновлены для демонстрации полного заказа (П-10)

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
| v1.7 (K1–K11)  | Требуется     | П-1..П-6: М18 3 колонки, M1/M2/M14/M17 DEPRECATED, marketing убран |
| v1.8 (L1–L10)  | Требуется     | П-7..П-9: Completed toast удалён, Dispatched auto-close 10с, send_dish toast |

---

## Перечень изменений v1.9

| #       | Изменение                                                                                   | Область       | Причина                                                       | SPEC-003 |
| ------- | ------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------- | -------- |
| **M1**  | ОБНОВИТЬ M16: упрощённый confirm-диалог «Повторить / Уехать»                                | Модалка       | Минимизация кликов, robot_id не передаётся                    | П-11     |
| **M2**  | ОБНОВИТЬ расположение кнопки «Повторить»: рядом с «Pudu: Команды»                           | Навигация     | Минимизация кликов для официанта                              | П-11     |
| **M3**  | ОБНОВИТЬ M14 / send_dish flow: отправка полного заказа одной командой                       | Логика        | NE декомпозирует на рейсы и распределяет по роботам           | П-10     |
| **M4**  | ДОБАВИТЬ toast для qr_payment: «Команда отправлена» (auto-close 10 сек)                     | Toast         | Zero-interaction подтверждено, но нужна обратная связь         | П-12     |
| **M5**  | ОБНОВИТЬ обработку NO_AVAILABLE_ROBOTS: задача в очередь, не ошибка                          | Toast/Ошибки  | NE всегда принимает задачу, ставит в очередь                  | П-13     |
| **M6**  | ОБНОВИТЬ mock-данные: полный заказ для send_dish                                             | Mock          | Демонстрация отправки полного заказа                          | П-10     |
| **M7**  | ОБНОВИТЬ каталог ячеек: новые ячейки для упрощённого М16                                     | Каталог       | Отражение нового дизайна                                      | П-11     |
| **M8**  | ОБНОВИТЬ цепочки: send_dish-full отправляет 1 команду                                       | Цепочки       | Упрощение flow — NE управляет рейсами                         | П-10     |

---

## M1. ОБНОВИТЬ M16: упрощённый confirm-диалог (П-11)

### Причина

Кнопка «Повторить» упрощается: убираются отображение имени робота, ID, статуса, информации о рейсах. Confirm-диалог содержит только номер стола и две кнопки: «Повторить» и «Уехать». `robot_id` не передаётся — NE назначает свободного.

> **Кирилл** (18.02, 53:00): *«Появляется вот такое окошко обязательно — повторить или уехать.»*

### ИЗМЕНИТЬ: Модалка M16 (`send_dish_repeat`)

**Было (v1.3–v1.7):**
```
M16 — «Повторить доставку блюд»
- Размер: MD (500px)
- Содержит: имя робота, ID робота, статус робота, стол, информация о рейсах
- Кнопки: «Отмена» / «Повторить отправку»
- Логика: если busy → warning «Робот занят», если offline → disabled
- robot_id = из предыдущей доставки
```

**Стало (v1.9 M1):**
```
M16 — «Повторить доставку?» (упрощённый confirm)
- Размер: SM (350px)
- Содержит: ТОЛЬКО номер стола
- Кнопки: «Уехать» (secondary) / «Повторить» (primary)
- Логика: robot_id НЕ передаётся. NE назначает свободного
- Доступна ВСЕГДА после хотя бы одного рейса send_dish
- НЕ привязана к подсчёту рейсов / max_dishes_per_trip
```

### БЫЛО / СТАЛО: HTML-разметка M16

**БЫЛО:**
```html
<!-- M16: Повторить доставку (v1.3) -->
<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
  <div class="bg-[#3a3a3a] rounded-lg w-[500px] text-white">
    <div class="p-6">
      <h2 class="text-lg font-semibold text-[#b8c959] mb-4">Повторить доставку</h2>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-400">Робот:</span>
          <span>BellaBot-01</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">ID:</span>
          <span class="font-mono text-sm text-gray-300">PD2024060001</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Статус:</span>
          <span class="text-green-400">● Online</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Стол:</span>
          <span>3</span>
        </div>
        <div class="text-sm text-gray-400 mt-2">
          Будет повторена доставка блюд к столу 3 с теми же параметрами.
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="flex-1 h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium">
          Отмена
        </button>
        <button class="flex-1 h-14 rounded bg-[#b8c959] hover:bg-[#a8b94a] text-black font-medium">
          Повторить отправку
        </button>
      </div>
    </div>
  </div>
</div>
```

**СТАЛО (v1.9 M1 — упрощённый confirm):**
```html
<!-- M16: Повторить доставку? (v1.9, П-11 — упрощённый confirm) -->
<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
  <div class="bg-[#3a3a3a] rounded-lg w-[350px] text-white">
    <div class="p-6">
      <h2 class="text-lg font-semibold text-[#b8c959] mb-4">Повторить доставку?</h2>
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-gray-400">Стол:</span>
          <span>3</span>
        </div>
        <div class="text-sm text-gray-400 mt-2">
          Любой свободный робот повторит доставку блюд к столу 3.
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button class="flex-1 h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white font-medium">
          Уехать
        </button>
        <button class="flex-1 h-14 rounded bg-[#b8c959] hover:bg-[#a8b94a] text-black font-medium">
          Повторить
        </button>
      </div>
    </div>
  </div>
</div>
```

### ИЗМЕНИТЬ: Реестр модалок (раздел 2.5 в prototypes.instructions.md)

**Было:**
```
| M16 | `send_dish_repeat`  | Повторная доставка блюд  | MD     | Active |
```

**Стало (v1.9 M1):**
```
| M16 | `send_dish_repeat`  | Повторить доставку? (confirm)  | SM     | Active |
```

### ИЗМЕНИТЬ: TypeScript — логика M16

**Было (v1.3):**
```typescript
// При «Повторить отправку» — повтор с robot_id из предыдущей
function handleRepeatDelivery() {
  const payload = {
    table_id: currentOrder.table_id,
    dishes: lastTripDishes,
    trip_number: lastTripNumber,
    total_trips: totalTrips,
    robot_id: lastDeliveryRobotId, // конкретный робот
    task_type: 'send_dish',
    // ... phrases, media_url
  };
  sendTask(payload);
}
```

**Стало (v1.9 M1):**
```typescript
// При «Повторить» — повтор всего заказа, robot_id не передаётся
function handleRepeatDelivery() {
  const payload = {
    table_id: currentOrder.table_id,
    dishes: currentOrder.dishes, // полный заказ
    // trip_number / total_trips — УБРАНЫ (П-10, NE управляет)
    // robot_id — НЕ передаётся (П-11, NE назначает свободного)
    task_type: 'send_dish',
    max_dishes_per_trip: scenarioSettings.send_dish.max_dishes_per_trip,
    // ... phrases, media_url, pickup_phrase, etc.
  };
  sendTask(payload);
}
```

---

## M2. ОБНОВИТЬ расположение кнопки «Повторить» (П-11)

### Причина

Кнопка «Повторить отправку» вынесена **рядом** с «Pudu: Команды» в меню «Дополнения» для минимизации кликов.

### ИЗМЕНИТЬ: Контекст «Заказ» — кнопки

**Было (v1.7, 3 кнопки):**
```
Контекст «Заказ»:
  «Pudu: Команды» → [Доставка меню, Уборка, Доставка блюд, QR-оплата]
  (кнопка «Повторить» — внутри «Pudu: Команды» после «Доставка блюд»)
```

**Стало (v1.9 M2):**
```
Контекст «Заказ» (Дополнения):
  «Pudu: Команды» → [Доставка меню, Уборка, Доставка блюд]
  «Pudu: Повторить отправку» → M16 confirm-диалог
  (кнопка рядом с «Pudu: Команды», на том же уровне — минимизация кликов)
```

> **Доступность**: Кнопка «Pudu: Повторить отправку» видна **только** если в текущем заказе уже был хотя бы один рейс send_dish. Если рейсов не было — кнопка скрыта.

---

## M3. ОБНОВИТЬ send_dish flow: одна команда (П-10)

### Причина

Плагин больше не разбивает заказ на рейсы. Вместо отправки `trip_number=1, trip_number=2...` плагин отправляет **одну команду** с полным списком блюд. NE самостоятельно рассчитывает рейсы, определяет количество роботов и управляет последовательностью.

### ИЗМЕНИТЬ: Fire-and-forget flow для send_dish

**Было (v1.4–v1.8):**
```
send_dish-full:
  1. Кнопка «Доставка блюд» → disabled + spinner «Отправка...»
  2. POST /api/tasks/send_dish (trip 1 из N)
  3. HTTP 200 → activeModal = null + toast dispatched
  4. Polling → completed → автоматически POST trip 2 из N
  5. ... повторять до последнего рейса
```

**Стало (v1.9 M3 — одна команда):**
```
send_dish-full:
  1. Кнопка «Доставка блюд» → disabled + spinner «Отправка...»
  2. POST /api/tasks/send_dish (ВЕСЬ заказ — все блюда, max_dishes_per_trip)
  3. HTTP 200 → activeModal = null + toast dispatched
  4. NE декомпозирует на рейсы, распределяет по роботам, управляет последовательностью
  5. Плагин только следит за task_id через polling
```

### ИЗМЕНИТЬ: Цепочка `send_dish-full`

**Было:**
```
send_dish-full:  M14 (3s) → null + toast dispatched → [polling → trip 2 → ...] 
```

**Стало (v1.9 M3):**
```
send_dish-full:  кнопка (3s) → null + toast dispatched → polling (NE управляет рейсами)
```

> **Примечание**: M14 (`send_dish_confirm`) — **DEPRECATED** с v1.7. Подтверждение не показывается. Один клик → POST → toast.

### ИЗМЕНИТЬ: Payload send_dish в mock sendTask

**Было:**
```typescript
const sendDishPayload = {
  table_id: "tbl-003",
  dishes: [{ name: "Том Ям", quantity: 1 }, { name: "Пад Тай", quantity: 1 }], // рейс 1
  trip_number: 1,
  total_trips: 3,
  task_type: "send_dish",
  max_dishes_per_trip: 2,
  // ...
};
```

**Стало (v1.9 M3):**
```typescript
const sendDishPayload = {
  table_id: "tbl-003",
  dishes: [  // ПОЛНЫЙ заказ — все блюда
    { name: "Том Ям", quantity: 1 },
    { name: "Пад Тай", quantity: 1 },
    { name: "Стейк Рибай", quantity: 1 },
    { name: "Салат Цезарь", quantity: 2 },
    { name: "Паста Болоньезе", quantity: 1 }
  ],
  // trip_number — УБРАНО (П-10)
  // total_trips — УБРАНО (П-10)
  task_type: "send_dish",
  max_dishes_per_trip: 2,  // NE использует для расчёта рейсов
  // ... phrases, media_url, pickup_phrase, pickup_wait_time, wait_time
};
```

---

## M4. ДОБАВИТЬ toast для qr_payment (П-12)

### Причина

qr_payment подтверждён как полностью автоматический (zero-interaction). Однако для обратной связи при успешной постановке задачи добавляется зелёный toast «Команда отправлена» (auto-close 10 сек). Это единственное визуальное проявление от плагина при создании задачи qr_payment.

> **Кирилл** (18.02): *«Никаких уведомлений, никаких запретов, никаких других действий окон по плагину — сразу уйдёт вам команда.»*

### ДОБАВИТЬ: Toast для qr_payment

```html
<!-- Toast qr_payment dispatched (v1.9, П-12) -->
<div class="fixed top-6 left-6 z-[60] flex flex-col space-y-2">
  <div class="bg-[#b8c959]/90 text-black px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[320px] max-w-[420px]">
    <svg class="w-5 h-5 shrink-0"><use href="#send"/></svg>
    <div class="flex-1">
      <span class="font-medium text-sm">QR-оплата — команда отправлена. Стол 3</span>
    </div>
    <button class="text-black/60 hover:text-black ml-2">
      <svg class="w-4 h-4"><use href="#x"/></svg>
    </button>
    <!-- auto-close через 10 секунд (П-8) -->
  </div>
</div>
```

### ИЗМЕНИТЬ: Правила Dispatched toast (раздел 2.7 в prototypes.instructions.md)

**Было (v1.8):**
```
**Авто-сценарии** (`cleanup_auto`, `qr_payment`) — при создании задачи **без уведомления**
```

**Стало (v1.9 M4):**
```
**Авто-сценарии**: 
  - `cleanup_auto` — при создании задачи **без уведомления** (без изменений)
  - `qr_payment` — при создании задачи: toast «QR-оплата — команда отправлена. Стол {N}» (auto-close 10 сек, v1.9 П-12)
```

### ДОБАВИТЬ: Текст Dispatched для qr_payment

```
**Тексты Dispatched** (v1.9): 
  - send_menu: «Доставка меню — отправлено. Стол {N}»
  - cleanup: «Уборка посуды — отправлено. Стол {N}»
  - send_dish: «Доставка блюд — отправлено. Стол {N}. Блюд: {X} из {Y} (рейс {K} из {M})» (v1.8 L8)
  - qr_payment: «QR-оплата — команда отправлена. Стол {N}» (v1.9 M4, П-12)
```

> **Примечание**: `display_name` робота **не показывается** в Dispatched-toast ни для одного сценария — плагин ещё не знает, какой робот будет назначен (NE выбирает, v1.7 П-4).

### ДОБАВИТЬ: Ячейка каталога

```
toast-dispatched-qr_payment:
  Описание: Toast «QR-оплата — команда отправлена. Стол 3»
  Тип: Dispatched (акцентный)
  Auto-close: 10 секунд
  Триггер: Успешное POST /api/tasks/qr_payment (HTTP 200)
```

---

## M5. ОБНОВИТЬ обработку NO_AVAILABLE_ROBOTS (П-13)

### Причина

Все задачи ставятся в очередь NE. Если свободных роботов нет — NE принимает задачу в очередь и не отклоняет. Ошибка `NO_AVAILABLE_ROBOTS` (HTTP 503) больше не показывается как ошибка — вместо неё: toast «Задача поставлена в очередь».

> **Руслан** (18.02): *«Да, можно выбрать занятого, и ему просто попадёт в режиме ожидания робота.»*

### ОБНОВИТЬ: Обработка ошибок в sendTask

**Было (v1.4–v1.8):**
```typescript
if (error.code === 'NO_AVAILABLE_ROBOTS') {
  // Показать M11 (error modal) с текстом «Нет свободных роботов»
  activeModal = 'error';
  errorMessage = 'Нет свободных роботов. Попробуйте позже';
}
```

**Стало (v1.9 M5):**
```typescript
if (error.code === 'NO_AVAILABLE_ROBOTS') {
  // НЕ показывать ошибку — задача принята в очередь NE (П-13)
  // Показать info-toast «Задача поставлена в очередь»
  showToast({
    type: 'info', // bg-[#b8c959]/90
    icon: 'clock',
    text: `${TASK_HUMAN_NAMES[taskType]} — задача поставлена в очередь. Стол ${tableNumber}`,
    autoClose: 10000 // 10 секунд (П-8)
  });
  activeModal = null; // закрыть модалку, экран освобождается
}
```

### ДОБАВИТЬ: Toast «Задача в очереди»

```html
<!-- Toast queued (v1.9, П-13) -->
<div class="fixed top-6 left-6 z-[60] flex flex-col space-y-2">
  <div class="bg-[#b8c959]/90 text-black px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[320px] max-w-[420px]">
    <svg class="w-5 h-5 shrink-0"><use href="#clock"/></svg>
    <div class="flex-1">
      <span class="font-medium text-sm">Доставка меню — задача поставлена в очередь. Стол 3</span>
    </div>
    <button class="text-black/60 hover:text-black ml-2">
      <svg class="w-4 h-4"><use href="#x"/></svg>
    </button>
    <!-- auto-close через 10 секунд -->
  </div>
</div>
```

### ИЗМЕНИТЬ: Таблица Toast-уведомлений (раздел 2.7 в prototypes.instructions.md)

**Добавить новый тип (v1.9):**
```
| Тип                              | Стиль                              | Иконка         | Поведение              | Когда                                                  |
| -------------------------------- | ---------------------------------- | -------------- | ---------------------- | ------------------------------------------------------ |
| **Queued** (новый v1.9)          | `bg-[#b8c959]/90 text-black`       | `clock`        | Auto-close: 10 секунд  | При NO_AVAILABLE_ROBOTS — задача принята в очередь NE  |
```

> **Итого**: 5 типов toast (было 4 после v1.8): Error (single), Error (persistent_repeating), Info, Dispatched, **Queued** (новый).

### ДОБАВИТЬ: Ячейка каталога

```
toast-queued-no-robots:
  Описание: Toast «Доставка меню — задача поставлена в очередь. Стол 3»
  Тип: Queued (info-акцентный, иконка clock)
  Auto-close: 10 секунд
  Триггер: HTTP 503 NO_AVAILABLE_ROBOTS
```

### ОБНОВИТЬ: Ячейка «Имитация ошибки NE» в демо-панели

**Было:**
```
| 3   | Имитация ошибки NE        | Button   | Показ M11                      |
```

**Стало (v1.9 M5 — добавить кнопку):**
```
| 3   | Имитация ошибки NE        | Button   | Показ M11                      |
| 3a  | Имитация «Все заняты»     | Button   | Toast «Задача в очереди» (П-13) |
```

---

## M6. ОБНОВИТЬ mock-данные (П-10)

### ИЗМЕНИТЬ: mockOrderDishes

**Было (v1.3, 6 блюд для демонстрации рейсов):**
```typescript
const mockOrderDishes = [
  { name: "Том Ям", quantity: 1, price: 750 },
  { name: "Пад Тай", quantity: 1, price: 650 },
  { name: "Стейк Рибай", quantity: 1, price: 1200 },
  { name: "Салат Цезарь", quantity: 2, price: 480 },
  { name: "Паста Болоньезе", quantity: 1, price: 550 },
  { name: "Тирамису", quantity: 1, price: 450 }
];
```

**Стало (v1.9 M6 — без изменений в данных, изменение в комментарии):**
```typescript
const mockOrderDishes = [
  { name: "Том Ям", quantity: 1, price: 750 },
  { name: "Пад Тай", quantity: 1, price: 650 },
  { name: "Стейк Рибай", quantity: 1, price: 1200 },
  { name: "Салат Цезарь", quantity: 2, price: 480 },
  { name: "Паста Болоньезе", quantity: 1, price: 550 },
  { name: "Тирамису", quantity: 1, price: 450 }
];
// v1.9 (П-10): Все 6 блюд отправляются ОДНОЙ командой.
// NE рассчитывает: 6 блюд / max_dishes_per_trip=2 = 3 рейса.
// NE определяет: 2 свободных робота → 2 робота параллельно + 1 рейс последовательно.
// Плагин НЕ разбивает на рейсы — это ответственность NE.
```

---

## M7. ОБНОВИТЬ каталог ячеек (П-11)

### ОБНОВИТЬ: Ячейка M16

**Было:**
```
modal-send-dish-repeat:
  Описание: Полное окно повторной доставки с robotName, robotId, robotStatus, tableName
  Размер: MD (500px)
  Кнопки: «Отмена» / «Повторить отправку»
```

**Стало (v1.9 M7):**
```
modal-send-dish-repeat-simple:
  Описание: Упрощённый confirm «Повторить доставку?» — только стол
  Размер: SM (350px)
  Кнопки: «Уехать» / «Повторить»
```

---

## M8. ОБНОВИТЬ цепочки (П-10)

### ОБНОВИТЬ: Цепочка `send_dish-full`

**Было (v1.4–v1.8):**
```
send_dish-full:
  Шаг 1: Кнопка «Доставка блюд» → spinner 3s
  Шаг 2: POST trip 1/3 → toast dispatched (auto-close 10s)
  Шаг 3: Polling → completed → POST trip 2/3 → toast dispatched
  Шаг 4: Polling → completed → POST trip 3/3 → toast dispatched
  Шаг 5: Polling → completed → удаление из пула
```

**Стало (v1.9 M8):**
```
send_dish-full:
  Шаг 1: Кнопка «Доставка блюд» → spinner 1.5s
  Шаг 2: POST (ВЕСЬ заказ) → toast dispatched (auto-close 10s)
  Шаг 3: NE декомпозирует, распределяет по роботам, управляет рейсами
  Шаг 4: Polling → completed → удаление из пула (без toast)
```

### ДОБАВИТЬ: Цепочка `send_dish-repeat-simple`

```
send_dish-repeat-simple (v1.9):
  Шаг 1: Кнопка «Pudu: Повторить отправку» → M16 confirm
  Шаг 2: Нажатие «Повторить» → spinner 1.5s → POST send_dish (полный заказ, без robot_id)
  Шаг 3: activeModal = null → toast dispatched (auto-close 10s)
```

---

## Обновление prototypes.instructions.md

### Изменения в секции «2.5. Реестр модалок»

Заменить строку M16:
```
| M16 | `send_dish_repeat`  | Повторить доставку? (confirm)  | SM     | Active  |
```

### Изменения в секции «2.7. Toast-уведомления»

Добавить тип **Queued**:
```
| **Queued**                       | `bg-[#b8c959]/90 text-black`       | `clock`        | Auto-close: 10 секунд  | При NO_AVAILABLE_ROBOTS — задача в очередь (П-13) |
```

Обновить правило для qr_payment:
```
**Авто-сценарии**: 
  - `cleanup_auto` — при создании задачи **без уведомления**
  - `qr_payment` — toast «QR-оплата — команда отправлена. Стол {N}» (auto-close 10 сек, v1.9 П-12)
```

### Изменения в секции «2.8. Каталог ячеек»

Добавить ячейки:
```
| Toast/State     | 3 новых | toast-dispatched-qr_payment, toast-queued-no-robots, modal-send-dish-repeat-simple |
```

### Изменения в секции «2.9. Ключевые сценарные цепочки»

Обновить:
```
| `send_dish-full`            | кнопка (1.5s) → null + toast dispatched → polling (NE управляет рейсами) |
| `send_dish-repeat-simple`   | «Повторить отправку» → M16 confirm → «Повторить» → toast dispatched      |
```

### Изменения в секции «2.11. Демо-панель»

Добавить:
```
| 3a  | Имитация «Все заняты»     | Button   | Toast «Задача в очереди» (П-13) |
```

Обновить: 7 → 8 элементов (было 7 после v1.8 + 1 новый).

### Изменения в секции «2.12. Хронология патчей»

Добавить строку:
```
| **v1.9** (M1–M8)  | 2026-02-26 | M1–M8 | М16 упрощён (SM confirm «Повторить/Уехать»), send_dish одна команда (NE управляет рейсами), qr_payment toast, NO_AVAILABLE_ROBOTS → очередь |
```

### Изменения в метаданных

```
> **Плагин iikoFront**: v1.9 (базовый v1.0 + патчи v1.1, v1.2, v1.3, v1.4, v1.5, v1.6, v1.7, v1.8, v1.9)
```

### Изменения в секции «4.3. Нумерация»

```
- Плагин: текущая серия **M** (v1.9). Следующий патч: серия **N** → v1.10
```

---

## Чек-лист применения патча v1.9

- [ ] M16 обновлена: SM (350px), confirm «Повторить / Уехать», без robotName/robotId/robotStatus
- [ ] Кнопка «Повторить отправку» — на уровне «Pudu: Команды» (не внутри)
- [ ] send_dish отправляет полный заказ: поля `trip_number`, `total_trips` убраны из payload
- [ ] Toast qr_payment: «QR-оплата — команда отправлена. Стол {N}» (auto-close 10 сек)
- [ ] NO_AVAILABLE_ROBOTS → info-toast «Задача поставлена в очередь» (не M11 error)
- [ ] Демо-панель: добавлена кнопка «Имитация "Все заняты"»
- [ ] Каталог ячеек: добавлены 3 новых ячейки
- [ ] Цепочка `send_dish-full` обновлена (одна команда)
- [ ] Цепочка `send_dish-repeat-simple` добавлена
- [ ] prototypes.instructions.md обновлён
