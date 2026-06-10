# Понимание задачи: Прототип «MenuBoard — Несколько Advertise»

Дата: 2026-06-10

---

## 1. Что нужно сделать (кратко)

Создать новый раздел **«Доска меню»** (MenuBoard) в прототипе `web-screens` — форк раздела «Электронная очередь» с доработками по спецификации **DS-MenuBoard-Advertise**. В MenuBoard одна тема может содержать **несколько динамических областей (Advertise)**, а привязка Campaign переносится из настроек экрана в конструктор темы.

---

## 2. Анализ спецификации

### 2.1. Суть задачи

MenuBoard — новый продукт Digital Signage, создаваемый **форком iikoArrivals**. Текущий Arrivals позволяет только **1 Advertise на тему**. MenuBoard снимает это ограничение.

| # | Функция | Суть |
|---|---------|------|
| 1 | Форк Arrivals → MenuBoard | Копирование кодовой базы, свой раздел в боковом меню |
| 2 | Множественные Advertise | N динамических областей на одну тему (без ограничений) |
| 3 | Campaign в конструкторе | Выпадающий список Campaign в панели свойств элемента |
| 4 | Z-index ниже QR-кода | Автоматический контроль: Z-index Advertise < Z-index QR-кода |
| 5 | Раздел в iikoWeb | «Доска меню» с подпунктами «Темы» и «Настройка экранов» |

### 2.2. Целевая структура бокового меню (из спецификации, раздел 6.7)

```
Экран покупателя/
Электронная очередь/
  Контролы
  Темы
  Настройка терминалов
  Мультиэкранность
Доска меню/              ← НОВЫЙ раздел (форк Электронной очереди)
  Темы                   ← форк страницы тем Arrivals
  Настройка экранов      ← форк страницы настройки терминалов
Звуки/
Подсказки/
Галерея/
Кампании/
```

**Отличия MenuBoard от Arrivals:** в MenuBoard нет пункта «Контролы» и «Мультиэкранность» — только «Темы» и «Настройка экранов».

### 2.3. Что меняется в конструкторе тем (раздел 7)

| Аспект | Arrivals (сейчас) | MenuBoard (цель) |
|--------|-------------------|------------------|
| Название элемента | «Рекламный блок» | «Динамическая область» |
| Количество Advertise | 1 (кнопка блокируется) | N (кнопка всегда доступна) |
| Привязка Campaign | Через «Настройка экранов» | Выпадающий список в панели свойств |
| Поле Campaign | Отсутствует | Новое поле `campaignId` в properties элемента |
| Z-index | Настраивается вручную | Автоматически ниже QR-кода |

### 2.4. Новое поле в панели свойств элемента

**«Рекламная кампания»** — выпадающий список над вкладками «Макет»/«Граница». Источник: `GET /api/menu-board/campaign`. Обязательное поле.

### 2.5. Что НЕ входит в прототип

- Реальный форк backend/БД (это витрина UI)
- Интеграция с реальным API
- Плагин и menuBoardScreen.exe
- Поддержка видео в Campaign
- Все изменения backend (префикс `/api/menu-board/` и т.д.)

---

## 3. Анализ существующего прототипа (что форкаем)

### 3.1. Файлы раздела «Электронная очередь» в прототипе

| Файл | Назначение |
|------|-----------|
| `screens/themes-arrivals-screen.component.ts` | Список тем Arrivals (таблица) |
| `screens/arrivals-theme-editor-screen.component.ts` | Конструктор темы Arrivals |
| `screens/arrivals-controls-screen.component.ts` | Список контролов Arrivals |
| `screens/arrivals-control-editor-screen.component.ts` | Редактор контрола Arrivals |
| `screens/cs-terminals-screen.component.ts` | Настройка терминалов |
| `screens/arrivals-multiscreen-screen.component.ts` | Мультиэкранность |
| `components/theme-editor/` | Общие компоненты конструктора тем (canvas, inspector и др.) |
| `components/control-editor/` | Общие компоненты редактора контролов |

### 3.2. Что НУЖНО форкнуть (создать копии)

| Исходный файл | Новый файл | Назначение |
|--------------|-----------|-----------|
| `themes-arrivals-screen.component.ts` | `menuboard-themes-screen.component.ts` | Список тем MenuBoard |
| `arrivals-theme-editor-screen.component.ts` | `menuboard-theme-editor-screen.component.ts` | Конструктор темы MenuBoard |
| `cs-terminals-screen.component.ts` | `menuboard-terminals-screen.component.ts` | Настройка экранов MenuBoard |

Компоненты `theme-editor/` и `control-editor/` — общие, их форкать НЕ нужно (будут переиспользованы).

### 3.3. Что НЕ форкаем

- `arrivals-controls-screen.component.ts` — в MenuBoard нет контролов
- `arrivals-control-editor-screen.component.ts` — нет контролов
- `arrivals-multiscreen-screen.component.ts` — нет мультиэкранности

---

## 4. План реализации (по шагам)

### Шаг 1: Fork — создание копий экранов Arrivals для MenuBoard

**1a.** `menuboard-themes-screen.component.ts` — копия `themes-arrivals-screen.component.ts`
- Переименовать селектор: `app-menuboard-themes-screen`
- Переименовать класс: `MenuboardThemesScreenComponent`
- Заголовок: «Темы — Доска меню»
- Маршрут: `/prototype/web-screens/menuboard-themes`
- Мок-темы: отдельный массив `MENUBOARD_THEMES` (копия arrivals-тем)

**1b.** `menuboard-theme-editor-screen.component.ts` — копия `arrivals-theme-editor-screen.component.ts`
- Переименовать селектор/класс
- Маршрут: `/prototype/web-screens/menuboard-theme-editor/:id`
- **Ключевые доработки применяются здесь** (Шаг 2)

**1c.** `menuboard-terminals-screen.component.ts` — копия `cs-terminals-screen.component.ts`
- Переименовать селектор/класс
- Маршрут: `/prototype/web-screens/menuboard-terminals`
- **Убрать колонку «Кампании»** из таблицы (в MenuBoard привязка в конструкторе)

### Шаг 2: Доработки MenuBoard по спецификации

**2a. Панель элементов (element-tree-panel):**
- Переименовать «Рекламный блок» → «Динамическая область»
- Кнопка добавления «Динамическая область» всегда доступна (не блокируется после первого)

**2b. Панель свойств (inspector):**
- Над вкладками «Макет»/«Граница» добавить выпадающий список «Рекламная кампания»
- Данные: мок-список Campaign (из `cs-mock-data.ts` — уже есть)
- Сохранять `campaignId` в `properties` элемента

**2c. Canvas (макет темы):**
- Для каждой динамической области отображать название Campaign внутри прямоугольника
- Z-index автоустановка (ниже QR-кода)

**2d. Валидация:**
- При сохранении: каждая динамическая область должна иметь выбранную Campaign
- Z-index < Z-index QR-кода

### Шаг 3: Регистрация в sidebar, routes, registry

**3a. `mock-data.ts` — SIDEBAR_SECTIONS:**
- Добавить секцию «Доска меню» (icon: `monitor`, между «Электронная очередь» и «Звуки»)
- Подпункты: «Темы» (`menuboard-themes`), «Настройка экранов» (`menuboard-terminals`)

**3b. `web-screens.routes.ts`:**
- Добавить 3 новых маршрута с lazy loading

**3c. `changelog.data.ts`:**
- Добавить версию `1.25` (unreleased)

### Шаг 4: Проверка и коммит в DEV

---

## 5. Вопросы / риски

| # | Вопрос | Статус |
|---|--------|--------|
| 1 | Кодовое имя? | Это внутренний прототип (`web-screens`), кодовое имя НЕ требуется |
| 2 | Насколько точно копировать arrivals-theme-editor? Это большой файл (~800+ строк) с canvas и inspector | Копируем как есть, затем вносим точечные правки по спеке |
| 3 | Нужен ли отдельный `menuboard-data.service.ts`? | Да, создадим форк `cs-data.service.ts` для мок-данных MenuBoard |
| 4 | Мок-данные тем MenuBoard? | Копируем структуру arrivals-тем, добавляем множественные Advertise |
| 5 | Русское название раздела? | «Доска меню» — по аналогии с «Электронная очередь» |

---

## 6. Ожидаемый результат

После реализации в боковом меню появится новый раздел:
```
Электронная очередь/
  Контролы
  Темы
  Настройка терминалов
Доска меню/          ← НОВЫЙ
  Темы               ← список тем MenuBoard
  Настройка экранов  ← без колонки «Кампании»
```

В конструкторе темы MenuBoard:
- «Динамическая область» вместо «Рекламный блок»
- Можно добавить несколько динамических областей
- У каждой — выбор Campaign в панели свойств
- Z-index авто-ниже QR-кода
