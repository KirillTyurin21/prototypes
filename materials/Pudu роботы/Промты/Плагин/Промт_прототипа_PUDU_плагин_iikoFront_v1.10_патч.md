# Промт-патч v1.10: Плагин iikoFront — управление роботами PUDU

---
**Версия**: 1.10
**Дата**: 2026-03-01
**Автор**: Кирилл Тюрин (системный аналитик)
**Статус**: [PENDING]
**Артефакт**: Д4-патч
**Базовый документ**: Промт_прототипа_PUDU_плагин_iikoFront_v1.9_патч.md (v1.9, 2026-02-26)
**Источники**: SPEC-003 v2.0 (раздел 2.4.9 — холодная регистрация); 04-Технические-требования/2026-02-27-авторизация-клиента-в-NE-через-плагин.md
**Scope**: Холодная регистрация клиента в NE — модальное окно П8 и flow подключения
---

## Назначение

Этот патч добавляет **UI холодной регистрации** — однократную процедуру первоначального подключения ресторана к NE Cloud. Плагин генерирует короткий код, показывает его на экране POS-терминала, а инженер вводит код на портале NE.

Аналогия: Device Code Flow (OAuth 2.0).

> **Источник**: SPEC-003 v2.0, раздел 2.4.9:
> «Холодная регистрация — однократная процедура первоначального подключения ресторана к NE Cloud.»

> **Warning**: API-контракт регистрации **ещё не финализирован** с NE. Все endpoint'ы помечены как [DRAFT]. Формат кода (OQ-1) и полный список полей (OQ-2) — открытые вопросы.

---

## Совместимость с предыдущими патчами

| Патч           | Совместимость | Примечание                                        |
| -------------- | ------------- | ------------------------------------------------- |
| v1.0 (базовый) | Требуется     | Каркас POS, state machine, PosDialogComponent     |
| v1.1           | Требуется     | Два контекста order/main                          |
| v1.2           | Требуется     | Каталог ячеек, двухуровневая навигация            |
| v1.3           | Требуется     | Модалки M14–M16                                   |
| v1.4           | Требуется     | Fire-and-forget, M17/M18                          |
| v1.5           | Требуется     | Двойное имя, displayRobotName()                   |
| v1.6           | Требуется     | Cleanup cleanup                                   |
| v1.7           | Требуется     | M17/M1/M2/M14 DEPRECATED, маркетинг удалён        |
| v1.8           | Требуется     | Toast Completed удалён, Dispatched auto-close 10s |
| v1.9           | Требуется     | M16 упрощён, send_dish одна команда, toast queued |

---

## Перечень изменений v1.10

| #      | Изменение                                                     | Область | Причина                                                             | SPEC-003 |
| ------ | ------------------------------------------------------------- | ------- | ------------------------------------------------------------------- | -------- |
| **N1** | ДОБАВИТЬ M19 (`registration_code`) — модалка отображения кода | Модалка | Холодная регистрация: плагин показывает код для ввода на портале NE | §2.4.9.3 |
| **N2** | ДОБАВИТЬ TypeScript-интерфейсы для регистрации                | Типы    | RegistrationState, RegistrationResponse                             | §2.4.9   |
| **N3** | ДОБАВИТЬ mock-данные для регистрации                          | Mock    | Демонстрация 6 состояний модалки                                    | §2.4.9.3 |
| **N4** | ДОБАВИТЬ ячейки каталога: registration-flow (6 состояний)     | Каталог | Демонстрация всех UI-состояний П8                                   | —        |
| **N5** | ДОБАВИТЬ сценарную цепочку: registration-cold-full            | Цепочки | Полный flow холодной регистрации                                    | §2.4.9.2 |

---

## N1. ДОБАВИТЬ M19 (`registration_code`) — модальное окно кода регистрации (П8)

### Реестр модалок: новая строка

| ID  | modalType           | Название             | Размер | Статус |
| --- | ------------------- | -------------------- | ------ | ------ |
| M19 | `registration_code` | Код регистрации (П8) | MD     | Active |

### State machine: новое значение

```typescript
type PuduModalType = 
  // ... существующие значения
  | 'registration_code';     // N1 v1.10 — Код регистрации (П8)
```

### HTML-шаблон M19

```html
<!-- M19: Код регистрации (П8) — v1.10 N1 -->
<app-pos-dialog
  *ngIf="activeModal === 'registration_code'"
  size="md"
  (close)="handleRegistrationClose()">

  <!-- Заголовок -->
  <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">
    Подключение к NE
  </h2>
  <p class="text-base text-center text-gray-300 mb-6">
    Введите код на портале NE Cloud
  </p>

  <!-- Состояние: Генерация кода -->
  @if (registrationState === 'generating') {
    <div class="flex flex-col items-center space-y-4 py-8">
      <lucide-icon name="loader-2" class="text-gray-400 animate-spin" [size]="32"></lucide-icon>
      <span class="text-sm text-gray-400">Генерация кода подключения...</span>
    </div>
  }

  <!-- Состояние: Код отображается -->
  @if (registrationState === 'code_displayed') {
    <div class="flex flex-col items-center space-y-6">
      <!-- Код крупным шрифтом -->
      <div class="bg-[#2d2d2d] rounded-lg px-8 py-6 text-center">
        <div class="text-4xl font-mono font-bold tracking-[0.3em] text-[#b8c959]">
          {{ registrationCode }}
        </div>
      </div>

      <!-- Таймер TTL -->
      <div class="flex items-center gap-2 text-sm"
           [class]="registrationTimerSeconds > 60 ? 'text-gray-300' : 'text-orange-400'">
        <lucide-icon name="clock" [size]="16"></lucide-icon>
        <span>Код действителен ещё {{ formatTimer(registrationTimerSeconds) }}</span>
      </div>

      <!-- Инструкция -->
      <div class="bg-[#2d2d2d] rounded px-4 py-3 text-sm text-gray-300 text-center w-full">
        <p>Откройте портал NE Cloud и введите этот код</p>
        @if (registrationCodeUrl) {
          <p class="text-xs text-gray-400 mt-2 font-mono break-all">{{ registrationCodeUrl }}</p>
        }
      </div>
    </div>

    <!-- Footer: кнопки -->
    <div class="flex gap-3 mt-8">
      <button
        class="flex-1 h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white text-sm transition-colors"
        (click)="handleRegistrationClose()">
        Закрыть
      </button>
      <button
        class="flex-1 h-14 rounded bg-[#b8c959] hover:bg-[#c5d466] text-black font-bold text-sm transition-colors"
        (click)="handleCopyCode()">
        <lucide-icon name="copy" [size]="16" class="mr-2"></lucide-icon>
        Копировать код
      </button>
    </div>
  }

  <!-- Состояние: Код истёк -->
  @if (registrationState === 'code_expired') {
    <div class="flex flex-col items-center space-y-4 py-6">
      <div class="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
        <lucide-icon name="clock" class="text-orange-400" [size]="24"></lucide-icon>
      </div>
      <p class="text-sm text-gray-300 text-center">Код истёк. Сгенерируйте новый.</p>
    </div>

    <div class="flex gap-3 mt-6">
      <button
        class="flex-1 h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white text-sm transition-colors"
        (click)="handleRegistrationClose()">
        Закрыть
      </button>
      <button
        class="flex-1 h-14 rounded bg-[#b8c959] hover:bg-[#c5d466] text-black font-bold text-sm transition-colors"
        (click)="handleRegenerateCode()">
        <lucide-icon name="refresh-cw" [size]="16" class="mr-2"></lucide-icon>
        Обновить код
      </button>
    </div>
  }

  <!-- Состояние: Регистрация успешна -->
  @if (registrationState === 'success') {
    <div class="flex flex-col items-center space-y-4 py-6">
      <div class="w-12 h-12 rounded-full bg-[#b8c959]/20 flex items-center justify-center">
        <lucide-icon name="check-circle-2" class="text-[#b8c959]" [size]="24"></lucide-icon>
      </div>
      <p class="text-base text-white font-medium text-center">Успешно подключено к NE Cloud</p>
      <p class="text-sm text-gray-400 text-center">Настройки будут загружены автоматически</p>
    </div>

    <div class="mt-6">
      <button
        class="w-full h-14 rounded bg-[#b8c959] hover:bg-[#c5d466] text-black font-bold text-sm transition-colors"
        (click)="handleRegistrationClose()">
        Готово
      </button>
    </div>
  }

  <!-- Состояние: Ошибка -->
  @if (registrationState === 'error') {
    <div class="flex flex-col items-center space-y-4 py-6">
      <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
        <lucide-icon name="alert-circle" class="text-red-400" [size]="24"></lucide-icon>
      </div>
      <p class="text-sm text-gray-300 text-center">{{ registrationError }}</p>
    </div>

    <div class="flex gap-3 mt-6">
      <button
        class="flex-1 h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white text-sm transition-colors"
        (click)="handleRegistrationClose()">
        Закрыть
      </button>
      <button
        class="flex-1 h-14 rounded bg-[#b8c959] hover:bg-[#c5d466] text-black font-bold text-sm transition-colors"
        (click)="handleRetryRegistration()">
        <lucide-icon name="refresh-cw" [size]="16" class="mr-2"></lucide-icon>
        Повторить
      </button>
    </div>
  }

  <!-- Состояние: Уже зарегистрирован -->
  @if (registrationState === 'already_registered') {
    <div class="flex flex-col items-center space-y-4 py-6">
      <div class="w-12 h-12 rounded-full bg-[#b8c959]/20 flex items-center justify-center">
        <lucide-icon name="info" class="text-[#b8c959]" [size]="24"></lucide-icon>
      </div>
      <p class="text-base text-white font-medium text-center">Ресторан уже подключён к NE</p>
      <p class="text-sm text-gray-400 text-center">Повторная регистрация не требуется</p>
    </div>

    <div class="mt-6">
      <button
        class="w-full h-14 rounded bg-[#1a1a1a] hover:bg-[#252525] text-white text-sm transition-colors"
        (click)="handleRegistrationClose()">
        Закрыть
      </button>
    </div>
  }

</app-pos-dialog>
```

### TypeScript-логика M19

```typescript
// --- Регистрация: state + handlers (v1.10 N1) ---

registrationState: RegistrationState = 'generating';
registrationCode: string = '';
registrationCodeUrl: string = '';
registrationTimerSeconds: number = 0;
registrationError: string = '';
private registrationTimerInterval: any = null;

// Открытие модалки
handleOpenRegistration(): void {
  this.activeModal = 'registration_code';
  this.registrationState = 'generating';
  this.generateRegistrationCode();
}

// Генерация кода (имитация POST /v1/registration/init)
async generateRegistrationCode(): Promise<void> {
  this.registrationState = 'generating';
  
  // Имитация задержки API (1.5с)
  await new Promise(r => setTimeout(r, 1500));

  // Mock-ответ
  this.registrationCode = mockRegistrationResponse.code;
  this.registrationCodeUrl = mockRegistrationResponse.code_url;
  this.registrationTimerSeconds = mockRegistrationResponse.code_ttl;
  this.registrationState = 'code_displayed';

  // Запуск обратного отсчёта
  this.startRegistrationTimer();
}

// Таймер TTL
startRegistrationTimer(): void {
  this.clearRegistrationTimer();
  this.registrationTimerInterval = setInterval(() => {
    this.registrationTimerSeconds--;
    if (this.registrationTimerSeconds <= 0) {
      this.clearRegistrationTimer();
      this.registrationState = 'code_expired';
    }
  }, 1000);
}

clearRegistrationTimer(): void {
  if (this.registrationTimerInterval) {
    clearInterval(this.registrationTimerInterval);
    this.registrationTimerInterval = null;
  }
}

// Форматирование таймера (MM:SS)
formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Обработчики
handleCopyCode(): void {
  navigator.clipboard.writeText(this.registrationCode);
  // Toast: «Код скопирован»
  this.addToast({
    type: 'info',
    icon: 'copy',
    text: `Код ${this.registrationCode} скопирован`,
    autoClose: 3000
  });
}

handleRegenerateCode(): void {
  this.generateRegistrationCode();
}

handleRetryRegistration(): void {
  this.generateRegistrationCode();
}

handleRegistrationClose(): void {
  this.clearRegistrationTimer();
  this.activeModal = null;
}
```

---

## N2. ДОБАВИТЬ TypeScript-интерфейсы для регистрации

### ДОБАВИТЬ: Новые типы

```typescript
// --- Регистрация (v1.10 N2) ---

/** Состояние модалки регистрации П8 (6 состояний из SPEC-003 §2.4.9.3) */
type RegistrationState = 
  | 'generating'           // Spinner — генерация кода
  | 'code_displayed'       // Код крупным шрифтом + таймер
  | 'code_expired'         // Код истёк — кнопка «Обновить код»
  | 'success'              // Регистрация OK — toast + автозакрытие
  | 'error'                // Ошибка — «Повторить» / «Закрыть»
  | 'already_registered';  // Уже зарегистрирован — «Закрыть»

/** Ответ POST /v1/registration/init [DRAFT] */
interface RegistrationInitResponse {
  code: string;            // Буквенно-цифровой код (пр. "A7X92K") — OQ-1: формат TBD
  code_ttl: number;        // Срок жизни в секундах (пр. 3600)
  code_url: string;        // URL портала NE для ввода кода
  registration_id: string; // UUID регистрации
}

/** Ответ GET /v1/registration/status [DRAFT] */
interface RegistrationStatusResponse {
  registered: boolean;
  org_id?: string;
  registered_at?: string;         // ISO 8601
  restaurants_count?: number;
  synced_at?: string;             // ISO 8601
}
```

---

## N3. ДОБАВИТЬ mock-данные для регистрации

### ДОБАВИТЬ: Mock-ответ регистрации

```typescript
// --- Mock: регистрация (v1.10 N3) ---

const mockRegistrationResponse: RegistrationInitResponse = {
  code: 'A7X92K',
  code_ttl: 3600,   // 1 час
  code_url: 'https://admin.nextera.io/activate?code=A7X92K',
  registration_id: 'reg-uuid-001'
};

const mockRegistrationStatus: RegistrationStatusResponse = {
  registered: false,
  org_id: undefined,
  registered_at: undefined,
  restaurants_count: undefined,
  synced_at: undefined
};

// Для демо-панели: имитация перехода состояний
const REGISTRATION_DEMO_STATES: RegistrationState[] = [
  'generating',
  'code_displayed',
  'code_expired',
  'success',
  'error',
  'already_registered'
];
```

### ДОБАВИТЬ: элемент демо-панели (#8)

**Было** (демо-панель после v1.8, 7 элементов):

| #   | Элемент                   | Тип      | Действие                       |
| --- | ------------------------- | -------- | ------------------------------ |
| 1   | Контекст: Заказ / Главный | Toggle   | Переключение `PuduContextType` |
| 2   | Имитация ошибки NE        | Button   | Показ M11                      |
| 3   | Имитация E-STOP           | Button   | Error toast                    |
| 4   | Робот в пути (pickup)     | Button   | Показ M15                      |
| 5   | Блюда приняты гостем      | Button   | Закрытие M15                   |
| 6   | E-STOP (повторная)        | Button   | Toast с меткой «ПОВТОРНО»      |
| 7   | Режим уборки              | Selector | Ручной/Авто/Смешанный          |

**Стало** (8 элементов):

| #     | Элемент                     | Тип          | Действие                                           |
| ----- | --------------------------- | ------------ | -------------------------------------------------- |
| 1     | Контекст: Заказ / Главный   | Toggle       | Переключение `PuduContextType`                     |
| 2     | Имитация ошибки NE          | Button       | Показ M11                                          |
| 3     | Имитация E-STOP             | Button       | Error toast                                        |
| 4     | Робот в пути (pickup)       | Button       | Показ M15                                          |
| 5     | Блюда приняты гостем        | Button       | Закрытие M15                                       |
| 6     | E-STOP (повторная)          | Button       | Toast с меткой «ПОВТОРНО»                          |
| 7     | Режим уборки                | Selector     | Ручной/Авто/Смешанный                              |
| **8** | **Регистрация (состояние)** | **Selector** | **Переключение `RegistrationState` (6 состояний)** |

Реализация кнопки демо-панели:

```html
<!-- Демо-панель: #8 — Регистрация (v1.10 N3) -->
<div class="flex items-center gap-2">
  <span class="text-xs text-gray-500 w-28">Регистрация:</span>
  <select
    class="text-xs bg-white border rounded px-2 py-1"
    [(ngModel)]="demoRegistrationState"
    (change)="handleDemoRegistrationState()">
    <option value="none">— Не показывать —</option>
    <option value="generating">Генерация кода</option>
    <option value="code_displayed">Код отображается</option>
    <option value="code_expired">Код истёк</option>
    <option value="success">Успех</option>
    <option value="error">Ошибка</option>
    <option value="already_registered">Уже зарегистрирован</option>
  </select>
</div>
```

```typescript
// Демо: обработчик переключения состояния регистрации
demoRegistrationState: string = 'none';

handleDemoRegistrationState(): void {
  if (this.demoRegistrationState === 'none') {
    this.activeModal = null;
    return;
  }
  this.activeModal = 'registration_code';
  this.registrationState = this.demoRegistrationState as RegistrationState;
  
  // Для code_displayed — установить mock-данные
  if (this.registrationState === 'code_displayed') {
    this.registrationCode = mockRegistrationResponse.code;
    this.registrationCodeUrl = mockRegistrationResponse.code_url;
    this.registrationTimerSeconds = 2345; // ~39 минут для демо
  }
  
  // Для error — установить текст ошибки
  if (this.registrationState === 'error') {
    this.registrationError = 'Не удалось подключиться к NE Cloud. Проверьте сетевое подключение.';
  }
}
```

---

## N4. ДОБАВИТЬ ячейки каталога: registration-flow

### ДОБАВИТЬ: секция каталога «Регистрация»

```typescript
// --- Каталог: секция «Регистрация» (v1.10 N4) ---

// Новая секция в catalogCells[]
{
  section: 'Регистрация',
  cells: [
    { id: 'registration-generating',        title: 'П8: Генерация кода (spinner)',       badge: 'NEW' },
    { id: 'registration-code-displayed',    title: 'П8: Код отображается + таймер',      badge: 'NEW' },
    { id: 'registration-code-expired',      title: 'П8: Код истёк',                       badge: 'NEW' },
    { id: 'registration-success',           title: 'П8: Успешно подключено',              badge: 'NEW' },
    { id: 'registration-error',             title: 'П8: Ошибка подключения',              badge: 'NEW' },
    { id: 'registration-already-registered', title: 'П8: Уже зарегистрирован',            badge: 'NEW' },
  ]
}
```

### Логика навигации по ячейкам

```typescript
// В handleCellSelect() добавить обработку ячеек регистрации:
case 'registration-generating':
  this.activeModal = 'registration_code';
  this.registrationState = 'generating';
  break;
case 'registration-code-displayed':
  this.activeModal = 'registration_code';
  this.registrationState = 'code_displayed';
  this.registrationCode = mockRegistrationResponse.code;
  this.registrationCodeUrl = mockRegistrationResponse.code_url;
  this.registrationTimerSeconds = 2345;
  break;
case 'registration-code-expired':
  this.activeModal = 'registration_code';
  this.registrationState = 'code_expired';
  break;
case 'registration-success':
  this.activeModal = 'registration_code';
  this.registrationState = 'success';
  break;
case 'registration-error':
  this.activeModal = 'registration_code';
  this.registrationState = 'error';
  this.registrationError = 'Не удалось подключиться к NE Cloud. Проверьте сетевое подключение.';
  break;
case 'registration-already-registered':
  this.activeModal = 'registration_code';
  this.registrationState = 'already_registered';
  break;
```

---

## N5. ДОБАВИТЬ сценарную цепочку: registration-cold-full

### ДОБАВИТЬ: цепочка регистрации

```typescript
// --- Сценарные цепочки: регистрация (v1.10 N5) ---

// В scenarioChains[] добавить:
{
  id: 'registration-cold-full',
  title: 'Холодная регистрация (полный flow)',
  badge: 'NEW',
  steps: [
    '«Подключить к NE» → M19 (generating)',
    'Spinner 1.5с → код A7X92K',
    'Таймер обратного отсчёта (39:05)',
    'Инженер вводит на портале NE',
    'Toast «Успешно подключено к NE»',
    'Автозакрытие M19'
  ]
}
```

**Flow**: `Кнопка «Подключить к NE» → M19 (spinner 1.5с) → Код A7X92K + таймер → [Инженер вводит на портале] → toast «Успешно подключено» → M19 auto-close`

**Ветвления**:
- **Код истёк**: M19 (code_expired) → «Обновить код» → M19 (generating) → новый код
- **Ошибка**: M19 (error) → «Повторить» → M19 (generating)
- **Уже зарегистрирован**: M19 (already_registered) → «Закрыть»

---

## Обновление prototypes.instructions.md

После применения этого патча обновить state-файл `.github/instructions/prototypes.instructions.md`:

### Метаданные

**Было**: `**Плагин iikoFront**: v1.8 (базовый v1.0 + патчи v1.1, v1.2, v1.3, v1.4, v1.5, v1.6, v1.7, v1.8)`
**Стало**: `**Плагин iikoFront**: v1.10 (базовый v1.0 + патчи v1.1, v1.2, v1.3, v1.4, v1.5, v1.6, v1.7, v1.8, v1.9, v1.10)`

### Хронология: добавить 2 строки (v1.9 + v1.10)

| Версия    | Дата       | Серия | Ключевое                                                                                                                                         |
| --------- | ---------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **v1.9**  | 2026-02-26 | M1–M8 | П-10: send_dish одна команда. П-11: M16 упрощён «Повторить / Уехать». П-12: toast qr_payment. П-13: NO_AVAILABLE_ROBOTS → очередь (toast queued) |
| **v1.10** | 2026-03-01 | N1–N5 | Холодная регистрация: M19 (П8) — модалка с кодом, 6 состояний, таймер TTL, каталог +6 ячеек, цепочка `registration-cold-full`                    |

### Реестр модалок: добавить строку

| ID  | modalType           | Название             | Размер | Статус |
| --- | ------------------- | -------------------- | ------ | ------ |
| M19 | `registration_code` | Код регистрации (П8) | MD     | Active |

### Каталог ячеек: обновить таблицу §2.8

**Стало** (добавить секцию):

| Секция      | Ячеек | Примеры                                                                                                                                                    |
| ----------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Регистрация | 6     | registration-generating, registration-code-displayed, registration-code-expired, registration-success, registration-error, registration-already-registered |

### Демо-панель: обновить таблицу §2.11

7 → 8 элементов. Добавить #8: «Регистрация (состояние)» (Selector, 6 состояний).

### Нумерация: обновить §4.3

**Было**: `Плагин: текущая серия **L** (v1.8). Следующий патч: серия **M** → v1.9`
**Стало**: `Плагин: текущая серия **N** (v1.10). Следующий патч: серия **O** → v1.11`

### Открытые вопросы: добавить

| #     | Вопрос                                                             | Критичность |
| ----- | ------------------------------------------------------------------ | ----------- |
| НВ-27 | Формат кода регистрации (числовой/буквенно-цифровой, длина) — OQ-1 | Critical    |
| НВ-28 | TTL кода (3600с = 1ч — подтвердить с NE) — OQ-1                    | Critical    |

---

## Чек-лист применения патча v1.10

- [ ] M19 (`registration_code`) добавлена в `PuduModalType`
- [ ] HTML-шаблон M19 отрисовывается корректно (6 состояний)
- [ ] Таймер TTL (обратный отсчёт MM:SS) работает
- [ ] Состояние `code_expired` при достижении 0 — корректное
- [ ] Кнопка «Копировать код» копирует в буфер обмена
- [ ] Кнопка «Обновить код» (код истёк) регенерирует код
- [ ] Кнопка «Повторить» (ошибка) перезапускает генерацию
- [ ] TypeScript-интерфейсы `RegistrationState`, `RegistrationInitResponse` добавлены
- [ ] Mock-данные `mockRegistrationResponse` присутствуют
- [ ] Демо-панель: элемент #8 переключает 6 состояний
- [ ] Каталог: секция «Регистрация» (6 ячеек) отображается
- [ ] Сценарная цепочка `registration-cold-full` добавлена
- [ ] Серия патча = **N** (не M — M уже использована в v1.9)
- [ ] `prototypes.instructions.md` обновлён (Шаг 19)

---

*Конец патча v1.10*
