# Спецификация: API Key + UI Consent

> Безопасная выдача API key банку с явным согласием менеджера ресторана: полный цикл от запроса банка до управления ключом через iikoWeb.

**Версия:** 1.0 | **Дата:** 2026-05-18 | **Автор:** Кирилл Тюрин

---

## 0. Как это работает (простым языком)

Банк хочет принимать оплату по QR-коду в ресторане. Для этого ему нужен "ключ доступа" (API key) к данным этого ресторана. Вот что происходит:

1. **Банк нажимает "Подключить ресторан"** у себя в системе. К нам прилетает запрос: "Halyk Bank хочет подключиться к ресторану 'Бургер Кинг на Абая'".

2. **Менеджер ресторана видит этот запрос в iikoWeb.** На странице "Интеграции" появляется строка: "Halyk Bank запрашивает доступ". Два варианта - "Одобрить" или "Отклонить".

3. **Менеджер нажимает "Одобрить".** Система создает ключ (случайный код вида `hk_live_a1b2c3...`) и отдает его банку. Ключ живет 360 дней, потом нужно запрашивать заново.

4. **Плагин на кассе узнает об одобрении** при очередном опросе сервера (раз в минуту). Тип оплаты "Halyk QR" становится доступен кассиру.

5. **Если менеджер отклонил** - банк получает отказ, на кассе ничего не меняется.

6. **В любой момент менеджер может отозвать ключ** - нажать "Отозвать" в iikoWeb. Ключ перестает работать, тип оплаты скрывается с кассы.

Одна страница в iikoWeb подходит для любого банка. Подключился Kaspi - появится строка Kaspi. Подключился Сбербанк - появится Сбербанк. Менеджер управляет всеми банками в одном месте.

---

## Оглавление

- [1. Обзор и цели](#1-обзор-и-цели)
- [2. State Machine](#2-state-machine)
- [3. iikoWeb Frontend](#3-iikoweb-frontend)
- [4. iikoWeb Backend (CloudAPI)](#4-iikoweb-backend-cloudapi)
- [5. Transport Gateway](#5-transport-gateway)
- [6. Плагин iikoFront](#6-плагин-iikofront)
- [7. End-to-end сценарии](#7-end-to-end-сценарии)
- [8. Acceptance Criteria](#8-acceptance-criteria)
- [9. Edge Cases и ограничения](#9-edge-cases-и-ограничения)

---

## 1. Обзор и цели

### 1.1. Краткое описание

Механизм обеспечивает безопасную выдачу API key банку с явным согласием ресторана. Банк запрашивает доступ к данным ресторана (меню, заказы) через Transport Gateway. Менеджер принимает решение в iikoWeb. При одобрении создается ключ с TTL 360 дней. Плагин получает уведомление и показывает/скрывает типы оплат.

Страница согласия универсальна - один интерфейс для всех банков (Halyk, Kaspi, Сбербанк и т.д.). Новый банк = новая строка в таблице запросов.

Аналогия: авторизация доступа к персональным данным на Госуслугах для организаций (Руслан, встреча 07.05.2026).

### 1.2. Цели

1. Обеспечить контроль менеджера ресторана над доступом банков к данным
2. Реализовать прозрачный аудит-лог всех действий
3. Обеспечить автоматическую реакцию плагина на изменение статуса интеграции
4. Предоставить L3-поддержке инструмент блокировки/разблокировки

### 1.3. Scope

**Что входит:**

| Аспект | Детализация |
|--------|-------------|
| Consent flow (полный цикл) | Запрос банка ->> решение менеджера ->> выдача ключа ->> реакция плагина |
| iikoWeb frontend | Страница "Интеграции", кнопка "API Key", карточки запросов, состояния элементов |
| iikoWeb backend (CloudAPI) | Endpoints CRUD access requests, генерация ключей, аудит-лог |
| Transport Gateway | Проксирование запроса банка, проксирование проверки статуса |
| Плагин iikoFront | Получение integration_status, реакция (show/hide payment types) |
| Revoke / Block / Unblock | Полный жизненный цикл ключа после выдачи |
| Аудит-лог | Структура, хранение, доступ |
| State machine | Все переходы статусов access request |

**Что НЕ входит:**

- QR-оплата (основной flow Stage 1 - остается в основной спецификации)
- Configuration.Activate (автосоздание типов оплат - отдельная задача)
- Меню, стоп-листы, создание заказов (Stage 2 - отдельные задачи)
- Handshake/polling в общем смысле (описан в базовой спеке, здесь только расширение)

### 1.4. Архитектура

##### UML-диаграмма

```plantuml
skinparam backgroundColor white
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12
skinparam shadowing false
skinparam roundcorner 8

title Архитектура: API Key + UI Consent

cloud "Halyk Bank\n(внешняя система)" as bank
actor "Менеджер ресторана\n(iikoWeb user)" as manager

package "DMZ" {
  component "Transport Gateway\n(микросервис)" as tgw
}

package "iiko Cloud" {
  component "CloudAPI\n(iikoWeb Backend)" as cloud
  database "БД\n(access requests,\nAPI keys, audit)" as db
  component "iikoWeb Frontend\n(SPA)" as web
}

package "Ресторан" {
  component "Плагин iikoFront\n(POS-терминал)" as plugin
}

bank -down-> tgw : HTTPS + RSA-2048\n(Bearer bank_service_token)
tgw -down-> cloud : Internal HTTPS\n(service-to-service token)
cloud -down-> db : CRUD
manager -down-> web : HTTPS + JWT\n(user session)
web -down-> cloud : REST API
plugin -up-> tgw : HTTPS polling\n(Bearer access_token)
cloud .right.> tgw : integration_status\n(через polling команды)
```

### 1.5. Каналы коммуникации

| # | Откуда | Куда | Протокол | Аутентификация | Назначение |
|---|--------|------|----------|----------------|------------|
| 1 | Bank | TGW | HTTPS REST | Bearer bank_service_token + RSA-2048 SHA-256 подпись | Запрос доступа, проверка статуса |
| 2 | TGW | CloudAPI | Internal HTTPS | Service-to-service token | Передача запроса на обработку, получение ключа |
| 3 | iikoWeb UI | CloudAPI | HTTPS REST | Bearer JWT (user session) | CRUD access requests, approve/reject/revoke |
| 4 | Plugin | TGW | HTTPS REST | Bearer access_token (из handshake) | Polling /api/commands (узнать об изменениях) |
| 5 | Plugin | TGW | HTTPS REST | Bearer short_code ->> access_token | Handshake /api/connect (узнать integration_status) |

### 1.6. Участники и роли

| Компонент | Роль в механизме |
|-----------|------------------|
| Halyk Bank (HSA) | Инициирует запрос на получение API key |
| Transport Gateway | Маршрутизация: проксирует запросы банка в CloudAPI |
| CloudAPI (backend) | Хранение API key, CRUD ключей, бизнес-логика consent flow |
| iikoWeb (frontend) | UI страницы согласия (раздел "Интеграции") |
| Плагин (iikoFront) | Получает `integration_status`, управляет видимостью типов оплат |

---

## 2. State Machine

### 2.1. Жизненный цикл Access Request

##### UML-диаграмма

```plantuml
skinparam backgroundColor white
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12
skinparam shadowing false
skinparam roundcorner 8

title State Machine: Access Request

[*] --> pending : Банк вызывает\nPOST /request-access

pending --> approved : Менеджер\nPOST /approve
pending --> rejected : Менеджер\nPOST /reject

rejected --> pending : Менеджер\nPOST /revert-rejection

approved --> revoked : Менеджер\nPOST /revoke
approved --> blocked : Система\n(rate limit, и т.д.)

blocked --> active : L3-поддержка\nPOST /admin/unblock

revoked --> [*] : Банк запрашивает\nповторно (новый request)
```

### 2.2. Таблица переходов

| Из | В | Инициатор | Действие | Бизнес-правило |
|----|---|-----------|----------|----------------|
| - | pending | Банк | POST /request-access | Один pending-запрос на пару (банк + ресторан); повторный = 409 |
| pending | approved | Менеджер | POST /approve | Создается API key (TTL 360 дней); только роль Manager/Administrator |
| pending | rejected | Менеджер | POST /reject | Ключ не создается; причина сохраняется в аудит-лог |
| rejected | pending | Менеджер | POST /revert-rejection | Менеджер передумал; запрос снова ожидает решения |
| approved | revoked | Менеджер | POST /revoke | Ключ инвалидируется (soft delete); банк получает 401 |
| approved | blocked | Система | Автоматика (rate limit) | Банк теряет доступ; разблокировка только через L3 |
| blocked | active | L3-поддержка | POST /admin/unblock | Существующий ключ разблокируется (новый НЕ создается) |
| revoked | pending | Банк | Новый POST /request-access | Новый access request, новый цикл подтверждения |

### 2.3. Запрещенные переходы

- `blocked` ->> `revoked` (нет такого перехода)
- `revoked` ->> `active` (после отзыва банк запрашивает заново)
- `rejected` ->> `approved` (нельзя одобрить напрямую - только через revert ->> pending ->> approve)

### 2.4. Маппинг статусов на integration_status плагина

| Статус access request | integration_status (плагин) | Действие плагина |
|----------------------|----------------------------|-----------------|
| pending | inactive | Типы оплат скрыты |
| approved / active | active | RegisterPaymentSystem, типы оплат видны кассиру |
| rejected | inactive | Типы оплат скрыты |
| revoked | inactive | Типы оплат скрыты |
| blocked | blocked | Типы оплат скрыты, причина в логе |

---

## 3. iikoWeb Frontend

### 3.1. Навигация

Расположение: iikoWeb ->> левое меню ->> "Интеграции" ->> кнопка "API Key".

Кнопка "API Key" отображается в разделе "Интеграции" только при наличии хотя бы одного pending-запроса и при роли Manager/Administrator текущего пользователя.

### 3.2. Элементы UI

| Элемент | Тип | Видимость | Поведение |
|---------|-----|-----------|-----------|
| Кнопка "API Key" | Button (primary) | Только при count(pending) > 0 И роль Manager/Administrator | Открывает страницу запросов |
| Badge (счетчик) | Badge на кнопке | Показывает число pending-запросов | Обновляется при загрузке раздела |
| Страница запросов | Full page | После клика на кнопку | Список карточек |
| Фильтр по статусу | Dropdown/tabs | Всегда на странице | Все / Ожидающие / Одобренные / Отклоненные |
| Карточка запроса | Card (expandable) | Каждый запрос = карточка | Свернутое/развернутое состояние |
| Название банка | Text (heading) | Всегда в карточке | Статический текст из `bank_name` |
| Текст запроса | Text (body) | При раскрытии карточки | Из поля `request_text` |
| Scope | Tags/chips | При раскрытии карточки | ["menu", "orders"] как теги |
| Чекбокс согласия | Checkbox | При раскрытии карточки (pending) | Текст: "Разрешаю банку взаимодействовать со мной через API". Обязателен для approve |
| Кнопка "Подтвердить" | Button (success) | pending + чекбокс checked | Вызывает approve |
| Кнопка "Отклонить" | Button (danger) | pending | Вызывает reject (с полем reason) |
| Кнопка "Отозвать ключ" | Button (warning) | approved | Вызывает revoke |
| Кнопка "Отменить отказ" | Button (secondary) | rejected | Вызывает revert-rejection |
| Статус | Status badge | Всегда | pending/approved/rejected/revoked/blocked |
| Аудит-лог (компактный) | Timeline | При раскрытии approved/rejected/revoked | Кто, когда, какое действие |
| Дата запроса | Text (secondary) | Всегда | ISO 8601 ->> локальный формат |
| Кто решил | Text (secondary) | approved/rejected | ФИО + дата |

### 3.3. Состояния страницы

| Состояние | Что отображается |
|-----------|-----------------|
| Нет запросов | Кнопка "API Key" скрыта. Если пользователь попал на страницу прямым URL - сообщение "Нет активных запросов" |
| Есть pending | Кнопка видна с badge. Карточки pending сверху |
| Все resolved | Кнопка скрыта. Архив доступен по прямому URL (история) |
| Нет прав | Кнопка скрыта для ролей ниже Manager. При прямом URL - 403 |

### 3.4. Порядок сортировки карточек

1. pending (новые сверху, по `created_at` desc)
2. approved (по `decided_at` desc)
3. rejected (по `decided_at` desc)
4. revoked/blocked (по дате последнего действия desc)

### 3.5. Ограничение по ролям

Доступ только для ролей `Manager` и `Administrator`. Пользователи без этих ролей:
- Не видят кнопку "API Key" в разделе "Интеграции"
- Получают 403 при попытке прямого перехода по URL

### 3.6. Responsive

Карточки stack вертикально на мобильных устройствах. Кнопки действий переносятся под основной контент.

### 3.7. Обработка ошибок в UI

| Ситуация | Поведение UI |
|----------|-------------|
| Сетевая ошибка при загрузке списка | Toast-уведомление "Не удалось загрузить запросы", кнопка "Повторить" |
| 409 при approve (уже одобрен) | Toast: "Запрос уже обработан", обновить список |
| 403 при действии | Redirect на главную + toast "Недостаточно прав" |
| 404 (запрос удален) | Toast: "Запрос не найден", убрать карточку из списка |

---

## 4. iikoWeb Backend (CloudAPI)

### 4.1. Обзорная таблица endpoints

| # | Method | Path | Auth | Описание |
|---|--------|------|------|----------|
| 1 | POST | /api/integrations/request-access | Bank token + RSA signature | Банк запрашивает доступ |
| 2 | GET | /api/integrations/access-requests | JWT (Manager+) | Список запросов с фильтрами |
| 3 | POST | /api/integrations/access-requests/{id}/approve | JWT (Manager+) | Подтвердить запрос |
| 4 | POST | /api/integrations/access-requests/{id}/reject | JWT (Manager+) | Отклонить запрос |
| 5 | POST | /api/integrations/access-requests/{id}/revoke | JWT (Manager+) | Отозвать выданный ключ |
| 6 | POST | /api/integrations/access-requests/{id}/revert-rejection | JWT (Manager+) | Отменить отказ |
| 7 | POST | /api/admin/access-requests/{id}/unblock | Admin JWT (L3) | Разблокировать ключ |
| 8 | GET | /api/integrations/access-requests/{id}/status | Bank token + RSA signature | Банк проверяет статус запроса |

### 4.2. Endpoint 1: Банк запрашивает доступ

**Request:**

```
POST /api/integrations/request-access
Host: transport-gateway.halyk.kz
Authorization: Bearer <bank_service_token>
Signature: <RSA-2048 SHA-256 base64>
Content-Type: application/json
```

**Request body:**

```json
{
  "restaurant_id": "org-5f8a-4b2c-9d1e-3a7f6c8b0e12",
  "scope": ["menu", "orders"],
  "request_text": "Халык Банк запросил доступ к вашим данным внешнего меню и заказам iiko Web"
}
```

| Поле | Тип | Обязательность | Описание |
|------|-----|:-:|----------|
| `restaurant_id` | string (UUID) | Да | Идентификатор ресторана в формате `{orgId}` |
| `scope` | string[] | Да | Запрашиваемые права: `menu`, `orders`, `tables` |
| `request_text` | string | Да | Текст, который увидит менеджер в UI (max 500 символов) |

**Response 200 (запрос зарегистрирован):**

```json
{
  "id": "a1b2c3d4-5678-9abc-def0-123456789abc",
  "success": true,
  "pluginName": "HalykPlugin",
  "pluginMethod": "requestAccess",
  "restaurant_id": "org-5f8a-4b2c-9d1e-3a7f6c8b0e12",
  "terminalId": null,
  "pluginModuleId": null,
  "description": "Access request registered",
  "data": {
    "request_id": "req-e4f5a6b7-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
    "status": "pending",
    "created_at": "2026-05-20T10:00:00Z"
  }
}
```

**Response 409 (дублирующий запрос):**

```json
{
  "id": "a1b2c3d4-5678-9abc-def0-123456789abc",
  "success": false,
  "pluginName": "HalykPlugin",
  "pluginMethod": "requestAccess",
  "restaurant_id": "org-5f8a-4b2c-9d1e-3a7f6c8b0e12",
  "terminalId": null,
  "pluginModuleId": null,
  "description": "Pending request already exists for this bank and restaurant",
  "data": {
    "errorCode": "DUPLICATE_REQUEST",
    "existing_request_id": "req-e4f5a6b7-8c9d-0e1f-2a3b-4c5d6e7f8a9b"
  }
}
```

**Ошибки:**

| HTTP | errorCode | Когда | Действие банка |
|:----:|-----------|-------|---------------|
| 409 | `DUPLICATE_REQUEST` | Уже есть pending-запрос для этой пары (банк + ресторан) | Ждать решения менеджера |
| 401 | `INVALID_SIGNATURE` | Подпись RSA-2048 невалидна | Проверить ключи |
| 400 | `INVALID_PAYLOAD_FORMAT` | Отсутствуют обязательные поля | Исправить запрос |
| 404 | `RESTAURANT_NOT_FOUND` | restaurant_id не найден в системе | Проверить ID |

### 4.3. Endpoint 2: Список запросов (iikoWeb)

**Request:**

```
GET /api/integrations/access-requests?status=pending&pageNumber=1&pageSize=20
Host: cloud-api.iiko.ru
Authorization: Bearer <iikoWeb_user_JWT>
```

| Параметр | Тип | Default | Описание |
|----------|-----|---------|----------|
| `status` | string | null (все) | Фильтр: `pending` / `approved` / `rejected` / `revoked` / `blocked` |
| `bank_id` | string | null (все) | Фильтр по идентификатору банка |
| `pageNumber` | int | 1 | Номер страницы |
| `pageSize` | int | 20 | Размер страницы (max 100) |
| `order` | string | `createdUtcDateTime:desc` | Сортировка |

**Response 200:**

```json
{
  "items": [
    {
      "id": "req-e4f5a6b7-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
      "bank_id": "halyk-bank-kz",
      "bank_name": "Халык Банк",
      "request_text": "Халык Банк запросил доступ к вашим данным внешнего меню и заказам iiko Web",
      "scope": ["menu", "orders"],
      "status": "pending",
      "created_at": "2026-05-20T10:00:00Z",
      "decided_by": null,
      "decided_by_name": null,
      "decided_at": null
    }
  ],
  "pageNumber": 1,
  "totalPages": 1,
  "totalCount": 1
}
```

**Ошибки:**

| HTTP | errorCode | Когда |
|:----:|-----------|-------|
| 403 | `INSUFFICIENT_PERMISSIONS` | У пользователя нет роли Manager/Administrator |

### 4.4. Endpoint 3: Подтвердить запрос

**Request:**

```
POST /api/integrations/access-requests/{id}/approve
Host: cloud-api.iiko.ru
Authorization: Bearer <iikoWeb_user_JWT>
Content-Type: application/json
```

Request body - пустой (информация о пользователе извлекается из JWT).

**Response 200:**

```json
{
  "id": "req-e4f5a6b7-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
  "status": "approved",
  "api_key_preview": "hk_live_a1b2...****",
  "decided_by": "usr-7890abcd-ef12-3456-7890-abcdef123456",
  "decided_by_name": "Иванов И.И.",
  "decided_at": "2026-05-20T12:00:00Z"
}
```

**Действия backend при approve:**

1. Проверить, что запрос в статусе `pending`
2. Сгенерировать API key (формат: `hk_live_` + 32 alphanumeric)
3. Установить `expires_at` = now + 360 дней
4. Обновить статус ->> `approved`
5. Записать в аудит-лог
6. Поставить флаг для отправки `IntegrationStatusChanged` (active) плагину

**Ошибки:**

| HTTP | errorCode | Когда |
|:----:|-----------|-------|
| 403 | `INSUFFICIENT_PERMISSIONS` | У пользователя нет роли Manager/Administrator |
| 404 | `REQUEST_NOT_FOUND` | access request с таким ID не существует |
| 409 | `INVALID_STATUS_TRANSITION` | Запрос не в статусе `pending` |

### 4.5. Endpoint 4: Отклонить запрос

**Request:**

```
POST /api/integrations/access-requests/{id}/reject
Host: cloud-api.iiko.ru
Authorization: Bearer <iikoWeb_user_JWT>
Content-Type: application/json

{
  "reason": "Ресторан не работает с данным банком"
}
```

| Поле | Тип | Обязательность | Описание |
|------|-----|:-:|----------|
| `reason` | string | Нет | Причина отказа (max 500 символов) |

**Response 200:**

```json
{
  "id": "req-e4f5a6b7-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
  "status": "rejected",
  "decided_by": "usr-7890abcd-ef12-3456-7890-abcdef123456",
  "decided_by_name": "Иванов И.И.",
  "decided_at": "2026-05-20T12:05:00Z",
  "reason": "Ресторан не работает с данным банком"
}
```

**Ошибки:**

| HTTP | errorCode | Когда |
|:----:|-----------|-------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Нет роли Manager/Administrator |
| 404 | `REQUEST_NOT_FOUND` | Запрос не найден |
| 409 | `INVALID_STATUS_TRANSITION` | Запрос не в статусе `pending` |

### 4.6. Endpoint 5: Отозвать ключ

**Request:**

```
POST /api/integrations/access-requests/{id}/revoke
Host: cloud-api.iiko.ru
Authorization: Bearer <iikoWeb_user_JWT>
```

Request body - пустой.

**Response 200:**

```json
{
  "id": "req-e4f5a6b7-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
  "status": "revoked",
  "decided_by": "usr-7890abcd-ef12-3456-7890-abcdef123456",
  "decided_by_name": "Иванов И.И.",
  "decided_at": "2026-05-20T15:00:00Z"
}
```

**Последствия revoke:**

1. CloudAPI инвалидирует API key (soft delete, запись сохраняется в аудит-логе)
2. Банк при следующем запросе получает 401 с `errorCode: "UNAUTHORIZED_SUBSYSTEM"`
3. Плагин через polling получает `IntegrationStatusChanged` с `status: "inactive"`, `reason: "API key revoked by restaurant manager"`
4. Плагин скрывает типы оплат Halyk от кассира

Банк может запросить доступ повторно (создается новый access request, новый цикл подтверждения).

**Ошибки:**

| HTTP | errorCode | Когда |
|:----:|-----------|-------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Нет роли Manager/Administrator |
| 404 | `REQUEST_NOT_FOUND` | Запрос не найден |
| 409 | `INVALID_STATUS_TRANSITION` | Запрос не в статусе `approved` |

### 4.7. Endpoint 6: Отменить отказ

Менеджер может передумать и отменить ранее принятый отказ. Запрос возвращается в статус `pending`.

**Request:**

```
POST /api/integrations/access-requests/{id}/revert-rejection
Host: cloud-api.iiko.ru
Authorization: Bearer <iikoWeb_user_JWT>
```

Request body - пустой.

**Response 200:**

```json
{
  "id": "req-e4f5a6b7-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
  "status": "pending",
  "reverted_by": "usr-7890abcd-ef12-3456-7890-abcdef123456",
  "reverted_by_name": "Иванов И.И.",
  "reverted_at": "2026-05-20T13:00:00Z"
}
```

**Ошибки:**

| HTTP | errorCode | Когда |
|:----:|-----------|-------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Нет роли Manager/Administrator |
| 404 | `REQUEST_NOT_FOUND` | Запрос не найден |
| 409 | `INVALID_STATUS_TRANSITION` | Запрос не в статусе `rejected` |

### 4.8. Endpoint 7: Разблокировать ключ (L3-поддержка)

Внутренний endpoint для L3-поддержки iiko. Используется для разблокировки ключа после устранения причины блокировки.

> "Создавать новые API-key, когда они будут блочиться, и потом мы их будем блочить, и заново они будут создавать - это бред. Они должны приходить и разбираться с каждым клиентом, почему это произошло. Потому что мы блокируем его не просто так." - Руслан, встреча 12.05.2026

**Request:**

```
POST /api/admin/access-requests/{id}/unblock
Host: cloud-api.iiko.ru
Authorization: Bearer <support_admin_JWT>
Content-Type: application/json

{
  "reason": "Rate limit issue resolved, bank acknowledged"
}
```

| Поле | Тип | Обязательность | Описание |
|------|-----|:-:|----------|
| `reason` | string | Да | Причина разблокировки (для аудит-лога) |

**Response 200:**

```json
{
  "id": "req-e4f5a6b7-8c9d-0e1f-2a3b-4c5d6e7f8a9b",
  "status": "active",
  "unblocked_by": "support-user-id",
  "unblocked_at": "2026-05-21T09:00:00Z",
  "reason": "Rate limit issue resolved, bank acknowledged"
}
```

**Действия backend:**

1. Восстановить validity ключа (тот же key_id, без генерации нового)
2. Обновить статус ->> `active`
3. Записать в аудит-лог
4. Поставить флаг для отправки `IntegrationStatusChanged` (active) плагину

Создание нового ключа при блокировке запрещено - это создает бесконечный цикл "блокировка ->> новый ключ ->> блокировка".

**Ошибки:**

| HTTP | errorCode | Когда |
|:----:|-----------|-------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Нет роли Admin/Support |
| 404 | `REQUEST_NOT_FOUND` | Запрос не найден |
| 409 | `INVALID_STATUS_TRANSITION` | Запрос не в статусе `blocked` |

### 4.9. Endpoint 8: Банк проверяет статус

Банк периодически проверяет статус своего запроса через Transport Gateway. При статусе `approved` в ответе содержится сам ключ.

**Request:**

```
GET /api/integrations/access-requests/{request_id}/status
Host: transport-gateway.halyk.kz
Authorization: Bearer <bank_service_token>
Signature: <RSA-2048 SHA-256 base64>
```

**Response 200 (approved - ключ готов):**

```json
{
  "id": "a1b2c3d4-5678-9abc-def0-123456789abc",
  "success": true,
  "pluginName": "HalykPlugin",
  "pluginMethod": "getAccessRequestStatus",
  "restaurant_id": "org-5f8a-4b2c-9d1e-3a7f6c8b0e12",
  "terminalId": null,
  "pluginModuleId": null,
  "description": "Access request approved",
  "data": {
    "status": "approved",
    "api_key": "hk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "expires_at": "2027-05-20T10:00:00Z",
    "scope": ["menu", "orders"]
  }
}
```

**Response 200 (pending - ожидает решения):**

```json
{
  "id": "a1b2c3d4-5678-9abc-def0-123456789abc",
  "success": true,
  "pluginName": "HalykPlugin",
  "pluginMethod": "getAccessRequestStatus",
  "restaurant_id": "org-5f8a-4b2c-9d1e-3a7f6c8b0e12",
  "terminalId": null,
  "pluginModuleId": null,
  "description": "Awaiting restaurant manager decision",
  "data": {
    "status": "pending",
    "api_key": null,
    "created_at": "2026-05-20T10:00:00Z"
  }
}
```

**Response 200 (rejected - отклонен):**

```json
{
  "id": "a1b2c3d4-5678-9abc-def0-123456789abc",
  "success": true,
  "pluginName": "HalykPlugin",
  "pluginMethod": "getAccessRequestStatus",
  "restaurant_id": "org-5f8a-4b2c-9d1e-3a7f6c8b0e12",
  "terminalId": null,
  "pluginModuleId": null,
  "description": "Access request rejected by restaurant",
  "data": {
    "status": "rejected",
    "api_key": null,
    "reason": "Ресторан не работает с данным банком"
  }
}
```

### 4.10. Параметры API Key

| Параметр | Значение |
|----------|----------|
| Формат | Строка с префиксом `hk_live_` + 32 символа (alphanumeric) |
| TTL | 360 дней с момента создания |
| Количество | Один на пару (банк + ресторан) |
| При повторном approve | Старый инвалидируется, создается новый key_id |
| Хранение (серверная сторона) | CloudAPI, зашифрованное поле в БД |
| При истечении TTL | Банк получает 401 UNAUTHORIZED_SUBSYSTEM; должен запросить заново |

### 4.11. Модель данных

**access_request:**

| Поле | Тип | Nullable | Описание |
|------|-----|:--------:|----------|
| `id` | UUID | Нет | PK |
| `bank_id` | string | Нет | Идентификатор банка |
| `bank_name` | string | Нет | Отображаемое название банка |
| `restaurant_id` | UUID | Нет | FK на организацию |
| `scope` | string[] | Нет | Массив запрашиваемых прав |
| `request_text` | string | Нет | Текст для UI (max 500) |
| `status` | enum | Нет | pending / approved / rejected / revoked / blocked / active |
| `api_key_hash` | string | Да | Хеш ключа (заполняется при approve) |
| `api_key_preview` | string | Да | Первые 12 символов + маска (для UI) |
| `expires_at` | datetime | Да | Дата истечения ключа (заполняется при approve) |
| `created_at` | datetime | Нет | Дата создания запроса |
| `decided_by` | UUID | Да | Кто принял решение |
| `decided_by_name` | string | Да | ФИО (для отображения) |
| `decided_at` | datetime | Да | Дата принятия решения |
| `reason` | string | Да | Причина reject/block/unblock |

### 4.12. Аудит-лог

Каждое действие фиксируется:

| Поле | Тип | Описание |
|------|-----|----------|
| `action` | enum | `approved` / `rejected` / `revoked` / `reverted` / `blocked` / `unblocked` |
| `user_id` | UUID | ID пользователя, выполнившего действие |
| `user_name` | string | ФИО (для отображения в UI) |
| `user_role` | string | Роль (`Manager` / `Administrator` / `Support`) |
| `bank_id` | string | Идентификатор банка |
| `bank_name` | string | Название банка |
| `access_request_id` | UUID | ID записи запроса |
| `timestamp` | datetime (UTC) | Дата и время действия |
| `reason` | string (nullable) | Причина (для reject, block, unblock) |

Лог хранится бессрочно. Доступен менеджеру в карточке запроса (компактный timeline) и в административном интерфейсе iikoWeb.

---

## 5. Transport Gateway

### 5.1. Новые маршруты

| # | Маршрут | Действие TGW |
|---|---------|-------------|
| 1 | `POST /api/integrations/request-access` | Идентификация банка по bearer token, добавление `bank_id`, проксирование в CloudAPI |
| 2 | `GET /api/integrations/access-requests/{id}/status` | Проксирование в CloudAPI с валидацией подписи |

Оба маршрута используют стандартную валидацию RSA-2048 SHA-256 подписи (аналогично существующим маршрутам Stage 1).

### 5.2. Модификации существующих ответов

**Расширение ответа /api/connect (handshake):**

В существующий ответ добавлены два поля:

```json
{
  "success": true,
  "description": "Connection established, settings ready for retrieval",
  "data": {
    "access_token": "server-jwt-token-for-plugin",
    "hash": "8f14e45f",
    "settings": {
      "polling_interval": 60,
      "qr_enabled": true
    },
    "integration_status": "active",
    "integration_status_reason": null
  }
}
```

| Новое поле | Тип | Значения | Описание |
|-----------|-----|----------|----------|
| `integration_status` | string | `active` / `inactive` / `blocked` | Текущий статус интеграции с банком |
| `integration_status_reason` | string (nullable) | Текст причины | Заполняется при `inactive` или `blocked` |

**Расширение ответа /api/commands (polling):**

Новый тип команды `IntegrationStatusChanged`:

```json
{
  "commands": [
    {
      "id": "cmd-f1e2d3c4-b5a6-9780-1234-567890abcdef",
      "type": "IntegrationStatusChanged",
      "data": {
        "integration_status": "active",
        "reason": null,
        "changed_at": "2026-05-20T12:00:05Z"
      }
    }
  ]
}
```

### 5.3. Валидация подписи на новых маршрутах

Аналогична существующей (Stage 1):
1. Извлечь тело запроса
2. Извлечь заголовок `Signature`
3. Верифицировать подпись публичным ключом банка (RSA-2048 SHA-256)
4. При невалидной подписи ->> 401 `INVALID_SIGNATURE`

---

## 6. Плагин iikoFront

### 6.1. Что парсить из handshake

При получении ответа на `POST /api/connect` плагин считывает поле `integration_status` из `data`:
- `active` ->> показать типы оплат Halyk кассиру
- `inactive` ->> скрыть типы оплат
- `blocked` ->> скрыть типы оплат, записать в лог причину

### 6.2. Обработка IntegrationStatusChanged

При получении команды `IntegrationStatusChanged` из polling `/api/commands`:

| Новый статус | Действие плагина |
|-------------|-----------------|
| `active` | Вызвать `RegisterPaymentSystem` (показать типы оплат Halyk кассиру), разрешить операции |
| `inactive` | Скрыть типы оплат Halyk из списка доступных кассиру (не вызывать Register или вызвать Unregister) |
| `blocked` | Скрыть типы оплат, записать в лог причину блокировки из поля `reason` |

Переход `inactive`/`blocked` ->> `active` восстанавливает доступность типов оплат без перезапуска плагина (в рамках ближайшего polling-цикла, до 60 сек).

### 6.3. Что плагин НЕ делает

- Плагин НЕ хранит API key (он его вообще не видит)
- Плагин НЕ знает о банке/ресторане (только о факте "интеграция активна/нет")
- Плагин НЕ участвует в consent flow (это целиком iikoWeb + CloudAPI)
- Плагин НЕ блокирует работу кассира (принцип невмешательства iiko)

### 6.4. Логирование

При смене статуса интеграции плагин записывает в `plugin-*.log`:

```
[2026-05-20 12:00:05] [INFO] Integration status changed: inactive -> active (reason: null)
[2026-05-20 15:00:10] [WARN] Integration status changed: active -> blocked (reason: rate_limit)
```

---

## 7. End-to-end сценарии

### 7.1. Happy path: запрос ->> approve ->> ключ ->> плагин активен

##### UML-диаграмма

```plantuml
skinparam backgroundColor white
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12
skinparam shadowing false
skinparam roundcorner 8

title Happy Path: Запрос доступа - Подтверждение - Получение ключа

actor "Менеджер\nресторана" as manager
participant "iikoWeb\n(Интеграции)" as web
participant "CloudAPI\n(Backend)" as cloud
participant "Transport\nGateway" as tgw
participant "Halyk Bank\n(HSA)" as bank
participant "Плагин\n(iikoFront)" as plugin

== Шаг 1: Банк запрашивает доступ ==

bank -> tgw : Запросить доступ\n<POST /api/integrations/request-access>
tgw -> cloud : Создать access request\n<internal API>
cloud -> cloud : Запись в БД\nstatus = pending
cloud --> tgw : request_id, status: pending
tgw --> bank : 200 OK\n{request_id, status: "pending"}

== Шаг 2: Менеджер подтверждает ==

manager -> web : Открыть "Интеграции"\nНажать "API Key"
web -> cloud : Получить список запросов\n<GET /api/integrations/access-requests?status=pending>
cloud --> web : items: [{bank_name, status, ...}]
web --> manager : Таблица запросов

manager -> web : Раскрыть карточку\nЧекбокс + "Подтвердить"
web -> cloud : Подтвердить\n<POST .../access-requests/{id}/approve>
cloud -> cloud : Создать API key\nstatus = approved\nАудит-лог
cloud --> web : {status: "approved", api_key_preview}
web --> manager : "Ключ выдан"

== Шаг 3: Банк получает ключ ==

bank -> tgw : Проверить статус\n<GET .../access-requests/{id}/status>
tgw -> cloud : Запросить статус + ключ
cloud --> tgw : {status: "approved", api_key: "hk_live_..."}
tgw --> bank : API key + scope + expires_at

== Шаг 4: Плагин узнает об активации ==

plugin -> tgw : Polling (каждые 60 сек)\n<GET /api/commands>
tgw --> plugin : IntegrationStatusChanged\n{status: "active"}
plugin -> plugin : RegisterPaymentSystem\nПоказать типы оплат кассиру
```

### 7.2. Reject + revert

##### UML-диаграмма

```plantuml
skinparam backgroundColor white
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12
skinparam shadowing false
skinparam roundcorner 8

title Reject + Revert: Отклонение и отмена отказа

actor "Менеджер" as manager
participant "iikoWeb" as web
participant "CloudAPI" as cloud
participant "Transport\nGateway" as tgw
participant "Halyk Bank" as bank

== Менеджер отклоняет ==

manager -> web : Нажать "Отклонить"
web -> cloud : Отклонить\n<POST .../access-requests/{id}/reject>
cloud -> cloud : status = rejected\nАудит-лог
cloud --> web : {status: "rejected"}
web --> manager : "Запрос отклонен"

== Банк проверяет и видит отказ ==

bank -> tgw : Проверить статус\n<GET .../access-requests/{id}/status>
tgw -> cloud : Запрос статуса
cloud --> tgw : {status: "rejected", reason: "..."}
tgw --> bank : rejected + reason

== Менеджер передумал ==

manager -> web : Нажать "Отменить отказ"
web -> cloud : Отменить отказ\n<POST .../access-requests/{id}/revert-rejection>
cloud -> cloud : status = pending\nАудит-лог
cloud --> web : {status: "pending"}
web --> manager : "Запрос снова ожидает решения"

== Менеджер теперь одобряет ==

manager -> web : Чекбокс + "Подтвердить"
web -> cloud : Подтвердить\n<POST .../access-requests/{id}/approve>
cloud -> cloud : Создать API key\nstatus = approved
cloud --> web : {status: "approved"}
```

### 7.3. Revoke

##### UML-диаграмма

```plantuml
skinparam backgroundColor white
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12
skinparam shadowing false
skinparam roundcorner 8

title Revoke: Отзыв ключа менеджером

actor "Менеджер" as manager
participant "iikoWeb" as web
participant "CloudAPI" as cloud
participant "Transport\nGateway" as tgw
participant "Halyk Bank" as bank
participant "Плагин" as plugin

== Менеджер отзывает ключ ==

manager -> web : Найти запись (approved)\nНажать "Отозвать ключ"
web -> cloud : Отозвать\n<POST .../access-requests/{id}/revoke>
cloud -> cloud : Инвалидировать key\nstatus = revoked\nАудит-лог
cloud --> web : {status: "revoked"}
web --> manager : "Ключ отозван"

== Плагин узнает ==

plugin -> tgw : Ближайший polling\n<GET /api/commands>
tgw --> plugin : IntegrationStatusChanged\n{status: "inactive", reason: "revoked"}
plugin -> plugin : Скрыть типы оплат

== Банк теряет доступ ==

bank -> tgw : Любой запрос с отозванным ключом
tgw -> cloud : Валидация ключа
cloud --> tgw : UNAUTHORIZED_SUBSYSTEM
tgw --> bank : 401 Unauthorized
```

### 7.4. Block + unblock

##### UML-диаграмма

```plantuml
skinparam backgroundColor white
skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 12
skinparam shadowing false
skinparam roundcorner 8

title Block + Unblock: Блокировка и разблокировка L3-поддержкой

participant "CloudAPI" as cloud
participant "Transport\nGateway" as tgw
participant "Halyk Bank" as bank
participant "Плагин" as plugin
actor "L3-поддержка" as support

== Автоматическая блокировка ==

cloud -> cloud : Rate limit exceeded\nАвтоблокировка key\nstatus = blocked\nАудит-лог

plugin -> tgw : Polling\n<GET /api/commands>
tgw --> plugin : IntegrationStatusChanged\n{status: "blocked", reason: "rate_limit"}
plugin -> plugin : Скрыть типы оплат\nЛог: причина блокировки

bank -> tgw : Запрос с заблокированным ключом
tgw -> cloud : Валидация ключа
cloud --> tgw : UNAUTHORIZED_SUBSYSTEM
tgw --> bank : 401 Unauthorized

== Банк обращается в поддержку ==

bank -> support : "Ключ заблокирован, помогите"
support -> cloud : Разблокировать\n<POST /api/admin/access-requests/{id}/unblock>
cloud -> cloud : Восстановить key\nstatus = active\nАудит-лог
cloud --> support : {status: "active"}

== Плагин восстанавливается ==

plugin -> tgw : Следующий polling\n<GET /api/commands>
tgw --> plugin : IntegrationStatusChanged\n{status: "active"}
plugin -> plugin : RegisterPaymentSystem\nПоказать типы оплат
```

### 7.5. TTL expiry

При истечении TTL ключа (360 дней):

1. CloudAPI автоматически помечает ключ как expired
2. Банк при следующем запросе получает 401 `UNAUTHORIZED_SUBSYSTEM`
3. Плагин через polling получает `IntegrationStatusChanged` (inactive, reason: "API key expired")
4. Плагин скрывает типы оплат
5. Банк должен отправить новый `POST /request-access` (новый consent flow с нуля)

---

## 8. Acceptance Criteria

### 8.1. iikoWeb Frontend

| # | Критерий |
|---|----------|
| 1 | При наличии pending-запроса в iikoWeb (раздел "Интеграции") отображается кнопка "API Key" с badge |
| 2 | При отсутствии pending-запросов кнопка скрыта |
| 3 | Кнопка и страница доступны только ролям Manager/Administrator; для остальных - 403 |
| 4 | Страница универсальна для всех банков; новый банк = новая строка |
| 5 | Карточка запроса содержит: название банка, текст запроса, scope, статус, дату, кто решил |
| 6 | Чекбокс "Разрешаю..." обязателен перед нажатием "Подтвердить" |
| 7 | Кнопка "Отозвать ключ" видна только для записей со статусом approved |
| 8 | Кнопка "Отменить отказ" видна только для записей со статусом rejected |
| 9 | Аудит-лог (timeline) отображается внутри развернутой карточки |

### 8.2. iikoWeb Backend (CloudAPI)

| # | Критерий |
|---|----------|
| 10 | После подтверждения менеджером CloudAPI создает API key и банк может его получить |
| 11 | При отклонении банк получает status `rejected`, ключ не создается |
| 12 | Менеджер может отозвать ранее выданный ключ - ключ немедленно инвалидируется |
| 13 | Менеджер может отменить свой отказ - запрос возвращается в pending |
| 14 | Каждое действие (approve/reject/revoke/revert/block/unblock) записывается в аудит-лог с userId, userName, timestamp |
| 15 | Повторный request-access при наличии pending = 409 DUPLICATE_REQUEST |
| 16 | Один ключ на пару (банк + ресторан); при повторном approve старый инвалидируется |
| 17 | TTL ключа = 360 дней; по истечении банк запрашивает повторно |

### 8.3. Transport Gateway

| # | Критерий |
|---|----------|
| 18 | TGW проксирует POST /request-access в CloudAPI с добавлением bank_id |
| 19 | TGW проксирует GET /status в CloudAPI с валидацией подписи |
| 20 | Ответ /api/connect содержит `integration_status` и `integration_status_reason` |
| 21 | Ответ /api/commands содержит команду `IntegrationStatusChanged` при смене статуса |

### 8.4. Плагин iikoFront

| # | Критерий |
|---|----------|
| 22 | Плагин получает `integration_status` при handshake и через polling |
| 23 | При integration_status = active плагин вызывает RegisterPaymentSystem |
| 24 | При integration_status = inactive/blocked типы оплат Halyk скрыты от кассира |
| 25 | Переход inactive/blocked ->> active восстанавливает типы оплат без перезапуска плагина (до 60 сек) |
| 26 | Автоматическая ротация при блокировке не реализуется; разблокировка только через L3 |
| 27 | Повторный запрос банка после rejected/revoked создает новый access request |

---

## 9. Edge Cases и ограничения

### 9.1. Параллельные действия

| Ситуация | Поведение |
|----------|-----------|
| Два менеджера одновременно пытаются approve | Первый успешен, второй получает 409 INVALID_STATUS_TRANSITION |
| Менеджер approve + банк уже получил rejected | Невозможно: approve работает только из pending |
| Банк шлет request-access пока pending уже есть | 409 DUPLICATE_REQUEST |

### 9.2. Граничные условия

| Ситуация | Поведение |
|----------|-----------|
| request_text > 500 символов | 400 INVALID_PAYLOAD_FORMAT |
| scope = пустой массив | 400 INVALID_PAYLOAD_FORMAT |
| scope содержит неизвестное значение | 400 INVALID_PAYLOAD_FORMAT (допустимые: menu, orders, tables) |
| Менеджер потерял роль Manager между загрузкой страницы и нажатием кнопки | 403 при вызове API |
| Ресторан удален из системы | 404 RESTAURANT_NOT_FOUND при первичном запросе |
| Банк запрашивает статус чужого request_id | 404 (привязка bank_id к request проверяется) |

### 9.3. Отказоустойчивость

| Ситуация | Поведение |
|----------|-----------|
| CloudAPI недоступен при request-access | TGW возвращает 503 SERVICE_UNAVAILABLE, банк ретраит |
| Плагин не получил IntegrationStatusChanged (пропуск polling) | При следующем polling получит команду (команды хранятся до подтверждения) |
| CloudAPI недоступен при polling | Плагин сохраняет последнее известное состояние; повторит через 60 сек |

### 9.4. Безопасность

| Угроза | Защита |
|--------|--------|
| Подделка запроса от банка | RSA-2048 SHA-256 подпись обязательна; без неё - 401 |
| Перехват API key | HTTPS; key отдается только через TGW с подписью |
| Несанкционированный approve | JWT + проверка роли (Manager/Administrator) |
| Brute-force request-access | Rate limiting на TGW (существующий механизм) |
| Утечка key из БД | Хранение в зашифрованном виде; в UI показывается только preview |

### 9.5. Бизнес-правила (сводная таблица)

| # | Правило | Источник |
|---|---------|----------|
| 1 | Один ключ на пару (банк + ресторан). Множественные ключи не накапливаются | Руслан, встреча 12.05.2026 |
| 2 | Автоматическая ротация при блокировке запрещена. Разблокировка - только через L3-поддержку | Руслан, встреча 12.05.2026 |
| 3 | TTL ключа = 360 дней. По истечении банк запрашивает повторно (новый consent flow) | Базовая спецификация Halyk |
| 4 | Подтверждение - только роли Manager/Administrator. Кассиры не видят кнопку | Руслан, встреча 12.05.2026 |
| 5 | Кнопка видна только при наличии pending-запросов. Нет запросов = нет кнопки | Руслан, встреча 12.05.2026 |
| 6 | Универсальная страница для всех банков. Новый банк = новая строка | Руслан, встреча 12.05.2026 |
| 7 | Плагин не хранит и не видит API key банка. Получает только `integration_status` | Архитектура (ИНСТРУКЦИЯ) |
| 8 | Аудит-лог бессрочный: кто, когда, какое действие | Руслан, встреча 12.05.2026 |
| 9 | Менеджер может отменить свой отказ (вернуть запрос в pending) | Руслан, встреча 12.05.2026 |

---

## Связанные документы

| Документ | Связь |
|----------|-------|
| Halyk-iteration2-спецификация.md | Основная спецификация iteration 2 (этот модуль выделен из раздела 4.2) |
| Базовые спецификации Halyk (Stage 1) | Transport Gateway, подписи, polling, envelope |
| 2026-05-05_Спецификация_типы_оплат_Halyk.md | Configuration.Activate, шаблоны типов оплат |
| ИНСТРУКЦИЯ_Halyk_iteration2_реализация.md | Архитектурные решения и бизнес-правила |

---

## Открытые вопросы

| # | Вопрос | Влияние | Допущение (применяется если нет другого ответа) |
|---|--------|---------|------------------------------------------------|
| 1 | Пагинация: offset/limit или cursor-based? | Backend + frontend | offset/limit (pageNumber/pageSize) - по аналогии с /users/page |
| 2 | HTTP-статус при expired key (TTL истек): 401 или специальный? | Bank-side error handling | 401 UNAUTHORIZED_SUBSYSTEM - банк должен запросить заново |
| 3 | Фильтрация по bank_id в GET /access-requests? | UI при многих банках | Да, query parameter `?bank_id=...` |
| 4 | Audit log - отдельный endpoint или часть карточки? | UI + backend | Часть карточки (timeline внутри expanded card) |
| 5 | Soft delete при revoke - виден ли запрос менеджеру? | UI состояние | Виден в истории (статус revoked), не в active списке |
| 6 | При повторном approve - тот же key_id или новый? | Backend, миграции | Новый key_id (старый инвалидируется) |
