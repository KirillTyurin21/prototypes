# Beanshe - API-справочник

| | |
|---|---|
| Спецификация | Beanshe - Спецификация интеграции |
| Внешняя система | Beanshe Backend |
| Тип интеграции | REST API |
| Base URL | `https://dev.app.beanshe.com` |
| Документация компании | OpenAPI schema + Postman-коллекция |

---

## Сводная таблица эндпоинтов

| # | Метод | URL | Назначение | Статус |
|:-:|-------|-----|------------|--------|
| 1.1 | POST | /api/barista/auth/ | Аутентификация баристы | БЕЗ ИЗМЕНЕНИЙ |
| 2.1 | GET | /api/barista/profile/ | Профиль баристы | БЕЗ ИЗМЕНЕНИЙ |
| 2.2 | POST | /api/barista/switch/ | Переключение статуса "На смене" | БЕЗ ИЗМЕНЕНИЙ |
| 2.3 | GET | /api/barista/state/app/ | Состояние приложения | БЕЗ ИЗМЕНЕНИЙ |
| 3.1 | GET | /api/barista/products/ | Список продуктов | БЕЗ ИЗМЕНЕНИЙ |
| 3.2 | POST | /api/barista/products/{id}/stop/ | Остановка продукта (стоп-лист) | БЕЗ ИЗМЕНЕНИЙ |
| 3.3 | DELETE | /api/barista/products/{id}/stop/ | Возврат продукта в продажу | БЕЗ ИЗМЕНЕНИЙ |
| 4.1 | GET | /api/v2/barista/orders/ | Список заказов баристы | БЕЗ ИЗМЕНЕНИЙ |
| 4.2 | GET | /api/v2/barista/orders/{id}/ | Детали заказа баристы | БЕЗ ИЗМЕНЕНИЙ |
| 4.3 | POST | /api/v2/barista/orders/{id}/accept/ | Принять заказ | БЕЗ ИЗМЕНЕНИЙ |
| 4.4 | POST | /api/v2/barista/orders/{id}/preparing/ | Начать приготовление | ИЗМЕНЁН |
| 4.5 | POST | /api/v2/barista/orders/{id}/ready/ | Заказ готов | ИЗМЕНЁН |
| 4.6 | POST | /api/v2/barista/orders/{id}/cancel/ | Отмена заказа баристой | БЕЗ ИЗМЕНЕНИЙ |
| 4.7 | POST | /api/v2/barista/orders/{id}/complete/ | Завершить заказ | БЕЗ ИЗМЕНЕНИЙ |
| 4.8 | POST | /api/v2/barista/orders/{id}/discard/ | Списать заказ | БЕЗ ИЗМЕНЕНИЙ |
| 5.1 | GET | /api/health/ | Проверка здоровья сервиса | БЕЗ ИЗМЕНЕНИЙ |
| 5.2 | GET | /api/health/ping/ | Пинг | БЕЗ ИЗМЕНЕНИЙ |
| 5.3 | GET | /api/health/iiko/ | Проверка связи с iiko | БЕЗ ИЗМЕНЕНИЙ |

---

## Расхождения Postman-коллекции и реального API

Ниже перечислены все расхождения, выявленные при тестировании реального API в сравнении с Postman-коллекцией, полученной от компании.

| # | Расхождение | Postman | Реальность | Критичность |
|:-:|-------------|---------|------------|:-----------:|
| 1 | Эндпоинт ready отсутствует в Postman | Нет | POST /api/v2/barista/orders/{id}/ready/ работает | Высокая |
| 2 | URL перехода к приготовлению | /prepare/ | /preparing/ | Высокая |
| 3 | Формат авторизации в заказах | `Token {token}` | `Bearer {token}` (Token возвращает 401) | Высокая |
| 4 | Переменная bearerToken | Используется в 4 запросах заказов | Не определена в environment | Средняя |

---

## 1. Аутентификация и авторизация

### 1.1. Способ авторизации

| Параметр | Значение |
|----------|----------|
| Тип | Token-based (без срока жизни, обновляется при каждом вызове auth) |
| Механизм | Логин/пароль (бариста) |
| Передача | Заголовок `Authorization: Bearer {token}` |
| Формат токена | 64-символьная hex-строка |

> [!WARNING]
> Токен меняется при каждом вызове аутентификации. Предыдущий токен становится невалидным.
> Формат заголовка - строго `Bearer {token}`. Формат `Token {token}` возвращает 401.

### 1.2. POST /api/barista/auth/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Аутентификация баристы. Возвращает токен и профиль пользователя.

#### Запрос

| Поле | Тип | Обяз. | Описание |
|------|-----|:-----:|----------|
| email | string | Да | Email баристы |
| password | string | Да | Пароль баристы |

**Request**

```json
{
  "email": "bnsh005+100@gmail.com",
  "password": "password123"
}
```

#### Ответ (200)

| Поле | Тип | Описание |
|------|-----|----------|
| token | string | 64-символьный hex-токен для авторизации |
| user | object | Профиль баристы (см. раздел 2.1) |

**Response**

```json
{
  "token": "2f256b0c...",
  "user": {
    "id": 495,
    "email": "bnsh005+100@gmail.com",
    "name": "Barista API Test",
    "at_work": true,
    "type": "barista",
    "roles": ["barista"],
    "photo": null,
    "max_discount": 25,
    "shop": {
      "name": "API Test - Кофейня",
      "timezone": "Europe/Moscow",
      "working_hours": {
        "weekdays": {"start": "08:00", "end": "22:00"},
        "weekends": {"start": "09:00", "end": "20:00"}
      }
    }
  }
}
```

#### Ошибки

| HTTP-код | Код ошибки | Описание | Действие плагина |
|:--------:|-----------|----------|------------------|
| 400 | invalid | Неверные учетные данные | Показать ошибку кассиру |
| 500 | - | Внутренняя ошибка сервиса | Retry (см. раздел 2.4) |

---

## 2. Общие форматы

### 2.1. Формат данных

| Параметр | Значение |
|----------|----------|
| Формат | JSON (`Content-Type: application/json`) |
| Кодировка | UTF-8 |
| Даты | ISO 8601 (`YYYY-MM-DDThh:mm:ss.sssZ`) |
| Суммы | Рубли с точкой, 2 знака (например: `200.00`) |
| Пагинация | `count`, `next`, `previous`, `results` |

### 2.2. Общий формат ошибки

Все эндпоинты возвращают ошибки в едином формате:

**Error**

```json
{
  "errors": [
    {
      "code": "error_code",
      "target": "common",
      "message": "Человекочитаемое описание ошибки"
    }
  ]
}
```

Известные коды ошибок:

| Код | Описание |
|-----|----------|
| invalid | Общая ошибка валидации / невозможность выполнить операцию |
| availability_coffeeshop_closed_error | Кофейня закрыта |
| not_found | Ресурс не найден |
| error | Общая ошибка сервера |

### 2.3. Структура пагинированного ответа

Эндпоинты списков (заказы) возвращают пагинированный ответ:

**Response**

```json
{
  "count": 65,
  "next": "https://dev.app.beanshe.com/api/v2/barista/orders/?page=2",
  "previous": null,
  "results": [...]
}
```

### 2.4. Стратегия retry

| Параметр | Значение |
|----------|----------|
| Максимум повторов | 3 |
| Стратегия ожидания | Экспоненциальный backoff: 1с, 2с, 4с |
| Коды для повтора | 408, 429, 500, 502, 503, 504 |
| Коды без повтора | 400, 401, 403, 404 |

### 2.5. Машина состояний заказа

Жизненный цикл заказа (из schema `StateAedEnum`):

```
awaiting_payment ->> created ->> accepted ->> preparing ->> ready ->> completed
                                    |             |           |
                                    v             v           v
                             cancelled_barista    |    cancelled_customer
                                    |             v           |
                                    v          expired        v
                                discarded                 discarded
```

Терминальные состояния: `completed`, `cancelled_customer`, `cancelled_barista`, `expired`, `discarded`.

---

## 3. REST API: Профиль и состояние баристы

### 3.1. GET /api/barista/profile/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Получение профиля текущего баристы. Вызывается после аутентификации для получения актуальных данных.

#### Ответ (200)

| Поле | Тип | Описание |
|------|-----|----------|
| id | integer | ID баристы |
| email | string | Email |
| name | string | Имя |
| at_work | boolean | Статус "На смене" |
| type | string | Тип пользователя (`"barista"`) |
| roles | array[string] | Список ролей |
| photo | string/null | URL фото |
| max_discount | integer | Максимальная скидка (%) |
| shop | object | Данные кофейни |
| shop.name | string | Название кофейни |
| shop.timezone | string | Часовой пояс |
| shop.working_hours | object | Рабочие часы (weekdays, weekends) |

**Response**

```json
{
  "id": 495,
  "email": "bnsh005+100@gmail.com",
  "name": "Barista API Test",
  "at_work": true,
  "type": "barista",
  "roles": ["barista"],
  "photo": null,
  "max_discount": 25,
  "shop": {
    "name": "API Test - Кофейня",
    "timezone": "Europe/Moscow",
    "working_hours": {
      "weekdays": {"start": "08:00", "end": "22:00"},
      "weekends": {"start": "09:00", "end": "20:00"}
    }
  }
}
```

---

### 3.2. POST /api/barista/switch/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Переключение статуса "На смене" (свитч at_work). Управляет доступностью баристы для онлайн-заказов.

#### Запрос

| Поле | Тип | Обяз. | Описание |
|------|-----|:-----:|----------|
| at_work | boolean | Да | Новое значение статуса "На смене" |

**Request**

```json
{
  "at_work": false
}
```

#### Ответ (200)

| Поле | Тип | Описание |
|------|-----|----------|
| at_work | boolean | Установленное значение статуса |

**Response**

```json
{
  "at_work": false
}
```

---

### 3.3. GET /api/barista/state/app/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Получение состояния мобильного приложения. Содержит информацию о версиях (min_version, current_version).

#### Ответ (200)

Структура содержит данные о версиях приложения. Точная структура определяется при детальном тестировании.

---

## 4. REST API: Продукты и стоп-лист

### 4.1. GET /api/barista/products/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Получение полного списка продуктов кофейни. Используется для построения альтернативного стоп-листа плагина.

#### Ответ (200)

Массив объектов Product:

| Поле | Тип | Описание |
|------|-----|----------|
| id | integer | ID продукта |
| name | string | Название |
| price | number | Цена (рубли) |
| type | string | Тип (`"drink"`, `"food"` и др.) |
| photo | string/null | URL фото |
| description | string | Описание |
| on_sale | boolean | В продаже (true) или в стоп-листе (false) |
| modifications | array | Модификации (размеры, объемы) |
| modifications[].id | integer | ID модификации |
| modifications[].name | string | Название (например: "200 мл") |
| modifications[].price | number | Доплата |
| modifications[].is_default | boolean | Модификация по умолчанию |
| modifications[].can_takeout | boolean | Доступен навынос |
| modifications[].on_sale | boolean | В продаже |
| option_groups | array | Группы опций |
| option_groups[].id | integer | ID группы |
| option_groups[].name | string | Название группы |
| option_groups[].type | string | Тип группы |
| option_groups[].min_count | integer | Минимальное количество выборов |
| option_groups[].max_count | integer | Максимальное количество выборов |

**Response**

```json
[
  {
    "id": 4826,
    "name": "Капучино",
    "price": 200.00,
    "type": "drink",
    "photo": "https://...",
    "description": "Классический капучино",
    "on_sale": true,
    "modifications": [
      {
        "id": 324617,
        "name": "200 мл",
        "price": 0.0,
        "is_default": true,
        "can_takeout": true,
        "on_sale": true
      }
    ],
    "option_groups": [
      {
        "id": 101,
        "name": "Молоко",
        "type": "single",
        "min_count": 0,
        "max_count": 1
      }
    ]
  }
]
```

---

### 4.2. POST /api/barista/products/{id}/stop/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Поставить продукт в стоп-лист (альтернативный стоп-лист Beanshe). Продукт перестает отображаться для гостей в мобильном приложении.

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID продукта |

#### Ответ (200)

Полный объект Product с `on_sale: false`.

**Response**

```json
{
  "id": 4826,
  "name": "Капучино",
  "price": 200.00,
  "on_sale": false,
  "..."
}
```

---

### 4.3. DELETE /api/barista/products/{id}/stop/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Вернуть продукт в продажу (убрать из стоп-листа).

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID продукта |

#### Ответ (200)

Полный объект Product с `on_sale: true`.

**Response**

```json
{
  "id": 4826,
  "name": "Капучино",
  "price": 200.00,
  "on_sale": true,
  "..."
}
```

---

## 5. REST API: Заказы (бариста)

### 5.1. GET /api/v2/barista/orders/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Получение списка заказов баристы. Поддерживает фильтрацию по состоянию и пагинацию.

#### Query-параметры

| Параметр | Тип | Обяз. | Описание |
|----------|-----|:-----:|----------|
| state | string | Нет | Фильтр по состоянию заказа (например: `cancelled_customer`) |
| page | integer | Нет | Номер страницы |

#### Ответ (200)

Пагинированный список объектов BaristaOrderV2.

| Поле | Тип | Описание |
|------|-----|----------|
| count | integer | Общее количество заказов |
| next | string/null | URL следующей страницы |
| previous | string/null | URL предыдущей страницы |
| results | array | Массив объектов заказа |

Структура объекта BaristaOrderV2:

| Поле | Тип | Описание |
|------|-----|----------|
| id | integer | ID заказа |
| number | string | Номер заказа (отображаемый) |
| state | string | Текущее состояние (см. раздел 2.5) |
| state_name | string | Человекочитаемое название состояния |
| price_before_discount | number | Сумма до скидки |
| price_after_discount | number | Сумма после скидки |
| discount | number | Размер скидки |
| cashback | number | Списанный кешбек |
| ready_at | string (datetime) | Время готовности (указанное гостем) |
| created_at | string (datetime) | Время создания |
| cancelled_at | string (datetime)/null | Время отмены |
| end_at | string (datetime)/null | Время завершения |
| takeout | boolean | Навынос |
| is_barista_viewed | boolean | Просмотрен баристой |
| cooking_time_in_minutes | integer | Время приготовления (минуты) |
| remaining_preparing_time_in_seconds | integer | Оставшееся время (секунды) |
| comment | string | Комментарий гостя |
| review | object/null | Отзыв |
| customer | object | Данные гостя |
| customer.id | integer | ID гостя |
| customer.name | string | Имя |
| customer.phone | string | Телефон |
| products | array | Продукты заказа |
| promotions | array | Примененные акции |

**Response**

```json
{
  "count": 65,
  "next": "https://dev.app.beanshe.com/api/v2/barista/orders/?page=2",
  "previous": null,
  "results": [
    {
      "id": 12345,
      "number": "B-065",
      "state": "cancelled_customer",
      "state_name": "Отменён гостем",
      "price_before_discount": 250.00,
      "price_after_discount": 200.00,
      "discount": 50.00,
      "cashback": 0,
      "ready_at": "2026-04-30T15:30:00.000Z",
      "created_at": "2026-04-30T15:00:00.000Z",
      "cancelled_at": "2026-04-30T15:05:00.000Z",
      "end_at": null,
      "takeout": true,
      "is_barista_viewed": false,
      "cooking_time_in_minutes": 5,
      "remaining_preparing_time_in_seconds": 0,
      "comment": "Без сахара",
      "review": null,
      "customer": {
        "id": 1234,
        "name": "Иван",
        "phone": "+79999999992"
      },
      "products": [],
      "promotions": []
    }
  ]
}
```

---

### 5.2. GET /api/v2/barista/orders/{id}/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Получение детальной информации о конкретном заказе. Структура ответа совпадает с объектом из списка (5.1).

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID заказа |

---

### 5.3. POST /api/v2/barista/orders/{id}/accept/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Принять заказ. Переводит заказ из состояния `created` в `accepted`.

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID заказа |

#### Ответ (200)

Объект заказа с `state: "accepted"`.

#### Ошибки

| HTTP-код | Код ошибки | Описание | Действие плагина |
|:--------:|-----------|----------|------------------|
| 400 | invalid | "Невозможно принять заказ" - заказ не в состоянии `created` | Обновить список заказов |

**Error**

```json
{
  "errors": [
    {
      "code": "invalid",
      "target": "common",
      "message": "Невозможно принять заказ"
    }
  ]
}
```

---

### 5.4. POST /api/v2/barista/orders/{id}/preparing/

> **Статус:** ИЗМЕНЁН - URL эндпоинта `/preparing/`, а НЕ `/prepare/` как указано в Postman-коллекции

Начать приготовление заказа. Переводит заказ из состояния `accepted` в `preparing`.

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID заказа |

#### Ответ (200)

Объект заказа с `state: "preparing"`.

#### Ошибки

| HTTP-код | Код ошибки | Описание | Действие плагина |
|:--------:|-----------|----------|------------------|
| 400 | invalid | "Заказ не принят" - заказ не в состоянии `accepted` | Обновить список заказов |

**Error**

```json
{
  "errors": [
    {
      "code": "invalid",
      "target": "common",
      "message": "Заказ не принят"
    }
  ]
}
```

---

### 5.5. POST /api/v2/barista/orders/{id}/ready/

> **Статус:** ИЗМЕНЁН - эндпоинт существует и работает в API, но полностью отсутствует в Postman-коллекции

Отметить заказ как готовый. Переводит заказ из состояния `preparing` в `ready`.

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID заказа |

#### Ответ (200)

Объект заказа с `state: "ready"`.

#### Ошибки

| HTTP-код | Код ошибки | Описание | Действие плагина |
|:--------:|-----------|----------|------------------|
| 400 | invalid | "Нельзя перевести заказ в статус готов" - заказ не в состоянии `preparing` | Обновить список заказов |

**Error**

```json
{
  "errors": [
    {
      "code": "invalid",
      "target": "common",
      "message": "Нельзя перевести заказ в статус готов"
    }
  ]
}
```

---

### 5.6. POST /api/v2/barista/orders/{id}/cancel/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Отмена заказа баристой.

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID заказа |

#### Ответ (200)

Объект заказа с `state: "cancelled_barista"`.

#### Ошибки

| HTTP-код | Код ошибки | Описание | Действие плагина |
|:--------:|-----------|----------|------------------|
| 400 | invalid | "Невозможно отменить заказ" - заказ в терминальном состоянии | Обновить список заказов |

**Error**

```json
{
  "errors": [
    {
      "code": "invalid",
      "target": "common",
      "message": "Невозможно отменить заказ"
    }
  ]
}
```

---

### 5.7. POST /api/v2/barista/orders/{id}/complete/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Завершить заказ (выдать гостю). Переводит из состояния `ready` в `completed`. Требует наличия оплаты.

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID заказа |

#### Ответ (200)

Объект заказа с `state: "completed"`.

#### Ошибки

| HTTP-код | Код ошибки | Описание | Действие плагина |
|:--------:|-----------|----------|------------------|
| 400 | invalid | "Платеж не найден. Невозможно завершить заказ." - нет подтвержденного платежа | Логировать, проверить статус оплаты |

**Error**

```json
{
  "errors": [
    {
      "code": "invalid",
      "target": "common",
      "message": "Платёж не найден. Невозможно завершить заказ."
    }
  ]
}
```

---

### 5.8. POST /api/v2/barista/orders/{id}/discard/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Списать заказ (гость не забрал). Переводит в состояние `discarded`.

#### Параметры пути

| Параметр | Тип | Описание |
|----------|-----|----------|
| id | integer | ID заказа |

#### Ответ (200)

Объект заказа с `state: "discarded"`.

#### Ошибки

| HTTP-код | Код ошибки | Описание | Действие плагина |
|:--------:|-----------|----------|------------------|
| 400 | invalid | "Нельзя отменить заказ" - заказ не в допустимом состоянии | Обновить список заказов |

**Error**

```json
{
  "errors": [
    {
      "code": "invalid",
      "target": "common",
      "message": "Нельзя отменить заказ"
    }
  ]
}
```

---

## 6. REST API: Health-checks

### 6.1. GET /api/health/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Полная проверка здоровья сервиса, включая базу данных и Redis. Авторизация не требуется.

#### Ответ (200)

| Поле | Тип | Описание |
|------|-----|----------|
| status | string | Общий статус (`"healthy"`) |
| checks | object | Проверки подсистем |
| checks.database.status | string | Статус БД |
| checks.database.message | string | Описание |
| checks.redis.status | string | Статус Redis |
| checks.redis.message | string | Описание |
| response_time_ms | integer | Время ответа (мс) |

**Response**

```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    },
    "redis": {
      "status": "healthy",
      "message": "Redis connection successful"
    }
  },
  "response_time_ms": 19
}
```

---

### 6.2. GET /api/health/ping/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Простая проверка доступности. Авторизация не требуется.

#### Ответ (200)

**Response**

```json
{
  "status": "ok"
}
```

---

### 6.3. GET /api/health/iiko/

> **Статус:** БЕЗ ИЗМЕНЕНИЙ - метод соответствует Postman-коллекции

Проверка связи бэкенда Beanshe с iiko Cloud API. Авторизация не требуется.

#### Ответ (200)

| Поле | Тип | Описание |
|------|-----|----------|
| status | string | Статус (`"healthy"`) |
| service | string | Название сервиса (`"iiko API"`) |
| response_time_ms | integer | Время ответа (мс) |

**Response**

```json
{
  "status": "healthy",
  "service": "iiko API",
  "response_time_ms": 55
}
```
