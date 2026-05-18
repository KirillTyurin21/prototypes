# Публикация DEV → MASTER + код доступа + деплой Cloud Function

> **Пошаговая инструкция** для публикации прототипа на продакшен (view21.ru).
> Включает: мерж кода, генерацию кода доступа, обновление Cloud Function.
>
> Используй `manage_todo_list` для отслеживания прогресса.

---

## Когда использовать

- Прототип готов к показу заказчику
- Изменения в `dev` проверены локально (`npm run dev`)
- Нужно сделать прототип доступным по ссылке на view21.ru

---

## Предусловия

- Текущая ветка: `dev`
- Все изменения закоммичены в `dev`
- `npm run build` проходит без ошибок
- Если это **новый прототип** — он уже зарегистрирован в 4 файлах:
  - `src/app/app.routes.ts`
  - `src/app/shared/prototypes.registry.ts`
  - `src/app/components/layout/changelog-button.component.ts`
  - `src/app/shared/icons.module.ts` (если прототип использует новые иконки из Lucide)

---

## Todo-шаблон

Создай этот todo-лист в начале работы через `manage_todo_list`:

```
1. Проверить сборку (npm run build)
2. Обновить changelog (released)
3. Сгенерировать код доступа и хеш   ← только для НОВОГО прототипа
4. Обновить ACCESS_CODES.md           ← только для НОВОГО прототипа
5. Обновить deploy-скрипты            ← только для НОВОГО прототипа
6. Коммит и push dev
7. Мерж dev → master
8. Деплой Cloud Function              ← только для НОВОГО прототипа
9. Вернуться в dev
```

---

## Этап 1. Проверить сборку

### Команда

```powershell
cd "d:\1Документы\Задачи iiko\Прототипы"
npm run build 2>&1 | Select-Object -Last 15
```

### Критерий успеха

- В выводе есть строка `Build at:` — сборка прошла
- Допустимы **Warning** про CSS budget (web-screens) — это не ошибка
- Если есть **Error** — ОСТАНОВИСЬ и исправь

---

## Этап 2. Обновить changelog

### Что сделать

Открой файл `src/app/prototypes/<slug>/changelog.data.ts`.

Найди секцию с `status: 'unreleased'` и замени на `status: 'released'`.
Обнови `date` на сегодняшнюю дату в формате `YYYY-MM-DD`.

### Пример замены

**Было:**
```typescript
status: 'unreleased',
```

**Стало:**
```typescript
status: 'released',
```

### Критерий успеха

- В файле нет `status: 'unreleased'`
- Дата актуальна

---

## Этап 3. Сгенерировать код доступа и SHA-256 хеш

> **Только для НОВОГО прототипа.** Если публикуются правки к существующему — пропусти этапы 3–5.

### Команда (PowerShell)

```powershell
$alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
$bytes = New-Object byte[] 16
$rng.GetBytes($bytes)
$code = -join ($bytes | ForEach-Object { $alphabet[$_ % $alphabet.Length] })
Write-Host "CODE: $code"

$sha256 = [System.Security.Cryptography.SHA256]::Create()
$hashBytes = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($code))
$hash = -join ($hashBytes | ForEach-Object { $_.ToString('x2') })
Write-Host "HASH: $hash"
```

### Критерий успеха

- Код: 16 символов, только `A-Z` (без I,O) и `2-9` (без 0,1)
- Хеш: 64 hex-символа (a-f, 0-9)
- **Запомни** оба значения — они нужны на следующих этапах

### Пример результата

```
CODE: QKMRGBR2KUKRTVZV
HASH: dcf1723a07670e81eca180825547414839a81478e3a905f8232cf57852f4b2d1
```

---

## Этап 4. Обновить ACCESS_CODES.md

### Файл

`files/ACCESS_CODES.md` (в `.gitignore`, не коммитится)

### Три места для обновления

#### 4.1. Таблица соответствия кодовых имён

Добавь строку в конец таблицы:

```markdown
| `<slug>` | <Реальное название> | <Описание> (<тип>) |
```

**Пример:**
```markdown
| `design-tokens` | Дизайн-токены Web | Справочник дизайн-токенов Web (не клиентский) |
```

#### 4.2. Индивидуальные коды прототипов

Добавь строку в конец таблицы:

```markdown
| <slug> | `<CODE>` | 7 дней | `https://view21.ru/?code=<CODE>` |
```

**Пример:**
```markdown
| design-tokens | `QKMRGBR2KUKRTVZV` | 7 дней | `https://view21.ru/?code=QKMRGBR2KUKRTVZV` |
```

#### 4.3. SHA-256 хеши

Добавь строку в конец таблицы:

```markdown
| <slug> | `<HASH>` |
```

**Пример:**
```markdown
| design-tokens | `dcf1723a07670e81eca180825547414839a81478e3a905f8232cf57852f4b2d1` |
```

### Критерий успеха

- Новый slug появился во всех 3 таблицах
- Код и хеш совпадают со сгенерированными на этапе 3

---

## Этап 5. Обновить deploy-скрипты

### Три файла для обновления

Во всех трёх файлах нужно добавить запись о новом прототипе **в JSON-переменную `ACCESS_HASHES`**.

#### Что добавить

В объект `"prototypes"` добавь новый ключ:

```json
"<slug>":{"hash":"<HASH>","ttlDays":7}
```

#### 5.1. `cloud-function/deploy.ps1`

Найди строку `$ACCESS_HASHES = '...'`. В конце JSON-объекта `prototypes`, **перед закрывающими** `}}'`, добавь новую запись.

**Было (конец строки):**
```
"aurora":{"hash":"3019258abc...","ttlDays":7}}}'
```

**Стало:**
```
"aurora":{"hash":"3019258abc...","ttlDays":7},"design-tokens":{"hash":"dcf1723a07...","ttlDays":7}}}'
```

#### 5.2. `cloud-function/deploy.sh`

Та же операция с переменной `ACCESS_HASHES='...'`.

#### 5.3. `cloud-function/env-vars.md`

**Два места:**

1. **Однострочный JSON** (строка `ACCESS_HASHES=...`) — та же операция
2. **Человекочитаемый комментарий** (в конце файла) — добавь блок:

```
#     "<slug>": {
#       "hash": "<HASH>",
#       "ttlDays": 7
#     }
```

**Расположение:** перед закрывающими `#   }` и `# }`.

### Критерий успеха

- Хеш нового прототипа присутствует в 3 файлах: `deploy.ps1`, `deploy.sh`, `env-vars.md`
- JSON валиден (кавычки, запятые на месте)
- Хеш совпадает во всех файлах

---

## Этап 6. Коммит и push dev

### Команды

```powershell
cd "d:\1Документы\Задачи iiko\Прототипы"
git add .
git status
```

> **Важно:** файлы из `files/` и `cloud-function/` в `.gitignore` — они НЕ попадут в коммит. Это нормально.

```powershell
git commit -m "feat(<slug>): release v1.0"
git push origin dev
```

### Критерий успеха

- `git status` показывает только изменения в `src/` (changelog и пр.)
- Коммит создан, push в `origin/dev` успешен

---

## Этап 7. Мерж dev → master

### Основной способ (через push)

```powershell
git push origin dev:master
git branch -f master origin/master
```

### Альтернативный способ (через checkout)

```powershell
git checkout master
git pull origin master
git merge dev
git push origin master
git checkout dev
```

### Критерий успеха

- `origin/master` содержит все коммиты из `dev`
- Текущая ветка — `dev`

---

## Этап 8. Деплой Cloud Function

> **Только для НОВОГО прототипа** (или при изменении кодов доступа).

### Предусловие

Установлен `yc` CLI. Проверка:

```powershell
Get-Command yc -ErrorAction SilentlyContinue | Select-Object Source
```

Если не установлен — см. https://yandex.cloud/ru/docs/cli/quickstart

### Команда деплоя

```powershell
cd "d:\1Документы\Задачи iiko\Прототипы\cloud-function"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy.ps1
```

### Критерий успеха

В выводе должны быть все эти строки:

```
[+] Function deployed!
================================================================
  Deploy complete!
================================================================
```

И в выведенных переменных окружения — JSON `ACCESS_HASHES` содержит хеш нового прототипа:

```
"<slug>":{"hash":"<HASH>","ttlDays":7}
```

### Что делать при ошибке

| Ошибка | Решение |
|--------|---------|
| `yc CLI not installed` | Установить yc CLI |
| `yc version create failed` | Проверить JSON в `$ACCESS_HASHES` (валидность кавычек) |
| `Cannot connect to YC tool initialization service` | Это WARNING, не ошибка — продолжай |
| `There is a new yc version available` | Это INFO, не ошибка — продолжай |

---

## Этап 9. Вернуться в dev

```powershell
cd "d:\1Документы\Задачи iiko\Прототипы"
git checkout dev
```

Или, если ты не менял ветку (использовал `git push origin dev:master`), ты уже в `dev`.

---

## СТОП-ПРАВИЛА (критические ограничения)

> **Нарушение любого пункта — критическая ошибка.**

1. **НИКОГДА** не упоминай коды доступа, хеши, токены в:
   - Сообщениях коммитов (`git commit -m "..."`)
   - Файлах changelog (`changelog.data.ts`)
   - UI-текстах (шаблоны компонентов)
   - Комментариях в коде

2. **НИКОГДА** не пиши слово «iiko» (в любом регистре) в:
   - Changelog
   - UI
   - Комментариях кода
   - Заменяй: «Front» вместо «iikoFront», «Web» вместо «iikoWeb»

3. **НИКОГДА** не коммить файлы из `files/` или `cloud-function/` — они в `.gitignore`

4. Коды генерируются из алфавита **без I, O, 0, 1** — чтобы избежать визуальной путаницы

---

## Полный пример: публикация прототипа `design-tokens`

### Исходное состояние

- Прототип создан в `src/app/prototypes/design-tokens/`
- Зарегистрирован в `app.routes.ts`, `prototypes.registry.ts`, `changelog-button.component.ts`
- Changelog `v1.0`, `status: 'unreleased'`
- Текущая ветка: `dev`
- Все коммиты в `dev`

### Выполненные шаги

1. **`npm run build`** → успех (только warning от web-screens CSS budget)

2. **Changelog** → `status: 'released'`

3. **Генерация кода:**
   ```
   CODE: QKMRGBR2KUKRTVZV
   HASH: dcf1723a07670e81eca180825547414839a81478e3a905f8232cf57852f4b2d1
   ```

4. **ACCESS_CODES.md** → добавлены 3 строки (таблица соответствия, индивидуальные коды, хеши)

5. **Deploy-скрипты** → добавлено `"design-tokens":{"hash":"dcf172...","ttlDays":7}` в:
   - `cloud-function/deploy.ps1`
   - `cloud-function/deploy.sh`
   - `cloud-function/env-vars.md` (и JSON, и человекочитаемый комментарий)

6. **Коммит:** `git commit -m "feat(design-tokens): release v1.0"` → только `changelog.data.ts` (остальное в .gitignore)

7. **Push dev:** `git push origin dev` → успех

8. **Мерж:** `git push origin dev:master` + `git branch -f master origin/master`

9. **Деплой Cloud Function:** `deploy.ps1` → `Deploy complete!`, `design-tokens` хеш в `ACCESS_HASHES`

10. **Ветка:** оставался в `dev` (использовал push-метод мержа)

### Результат

- Прототип доступен: `https://view21.ru/prototype/design-tokens`
- Код доступа записан в `files/ACCESS_CODES.md`
- Cloud Function распознаёт новый код
