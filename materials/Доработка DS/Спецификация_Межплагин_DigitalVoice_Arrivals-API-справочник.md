# Межплагинное взаимодействие DigitalVoice и Arrivals -- API-справочник

| | |
|---|---|
| Спецификация | [Спецификация_Межплагин_DigitalVoice_Arrivals.md](Спецификация_Межплагин_DigitalVoice_Arrivals.md) |
| Тип интеграции | ExternalOperations SDK V9 (межплагинное взаимодействие) |
| Способ взаимодействия | `RegisterExternalOperation` / `CallExternalOperation` (byte[] overload) |
| Формат данных | JSON |

---

## 1. Общие сведения

### 1.1. Роли плагинов

| Роль | Плагин | Метод SDK | Когда |
|------|--------|-----------|-------|
| **Producer** (сервер) | Arrivals (`Resto.Front.Api.DigitalSignage`) | `RegisterExternalOperation` | При запуске плагина |
| **Consumer** (клиент) | DigitalVoice (`Resto.Front.Api.DigitalVoice`) | `CallExternalOperation` | При наступлении события iikoFront |

### 1.2. Идентификация операции

| Параметр | Значение | Статус |
|----------|----------|:------:|
| `serviceName` | `"Resto.Front.Api.DigitalSignage.Arrivals"` | [ДОПУЩЕНИЕ] Требует согласования с разработчиками |
| `operationName` | `"PlaySound"` | [ДОПУЩЕНИЕ] Требует согласования с разработчиками |

**Правила именования:**
- Длина `serviceName`: 1-50 символов (текущее значение: 38)
- Длина `operationName`: 1-50 символов (текущее значение: 9)
- Пара `(serviceName, operationName)` должна быть уникальной среди всех зарегистрированных операций
- Имена чувствительны к регистру

### 1.3. Способ взаимодействия

Взаимодействие происходит через стандартный механизм ExternalOperations SDK V9. Используется **byte[] overload** с JSON-сериализацией.

**Преимущества выбранного подхода:**
- Не требует общей сборки с DTO-классами -- плагины независимы
- JSON -- человекочитаемый формат для отладки и логирования
- Совместимость с будущими версиями SDK (V10 заменяет BinaryFormatter)

### 1.4. Ограничения

| Ограничение | Описание |
|-------------|----------|
| Область действия | Только в пределах одного экземпляра iikoFront (один ПК). Нельзя вызвать операцию на другом ПК |
| Порядок запуска | Недетерминирован. Consumer должен быть готов к тому, что Producer запустится позже |
| Время жизни регистрации | Регистрация действует до вызова `Dispose()` на `IDisposable` или завершения плагина |

---

## 2. Формат данных

- **Формат:** JSON
- **Кодировка:** UTF-8
- **Сериализация:** ручная (`Newtonsoft.Json` / `System.Text.Json`)
- **Способ вызова:** `CallExternalOperation(int, string, string, byte[], ITerminal)` -- byte[] overload

---

## 3. Метод PlaySound

Метод `PlaySound` позволяет плагину DigitalVoice отправить команду воспроизведения звукового файла на конкретный дисплей плагина Arrivals.

**Producer:** Arrivals регистрирует операцию при запуске:

```csharp
var registration = PluginContext.Operations.RegisterExternalOperation(
    "Resto.Front.Api.DigitalSignage.Arrivals",
    "PlaySound",
    callback
);
```

**Consumer:** DigitalVoice вызывает операцию при наступлении события:

```csharp
var responseBytes = PluginContext.Operations.CallExternalOperation(
    arrivalsModuleId,                              // из GetExternalOperations()
    "Resto.Front.Api.DigitalSignage.Arrivals",     // serviceName
    "PlaySound",                                   // operationName
    requestBytes                                    // JSON PlaySoundRequest
);
```

### 3.1. Запрос (PlaySoundRequest)

**Request**

```json
{
  "soundFilePath": "C:\\ProgramData\\iiko\\CacheServer\\PluginConfig\\DigitalVoice\\sounds\\new_order.mp3",
  "displayId": "display-001",
  "volume": 0.8
}
```

| Поле | Тип | Обяз. | Описание | Источник данных |
|------|-----|:-----:|----------|-----------------|
| `soundFilePath` | string | Да | Абсолютный путь к звуковому файлу на терминале. Файл предварительно скачан плагином DigitalVoice при получении настроек | DigitalVoice: локальный путь после скачивания по `fileUrl` из поля `eventHandlers[].fileUrl` ответа `GetTerminalSettings` |
| `displayId` | string | Да | Идентификатор дисплея Arrivals, на котором нужно воспроизвести звук | DigitalVoice: поле `outputDevices[].displays[].displayId` из ответа `GetTerminalSettings` |
| `volume` | float (0.0-1.0) | Нет | Громкость воспроизведения. Если не указано -- Arrivals использует значение по умолчанию | [ДОПУЩЕНИЕ] Может настраиваться в Admin-панели в будущих версиях. В MVP не передаётся |

### 3.2. Ответ -- успех (PlaySoundResponse)

**Response**

```json
{
  "success": true
}
```

| Поле | Тип | Обяз. | Описание |
|------|-----|:-----:|----------|
| `success` | boolean | Да | Всегда `true` для успешного ответа |

### 3.3. Ответ -- ошибка (PlaySoundResponse)

**Error**

```json
{
  "success": false,
  "errorCode": "DisplayNotFound",
  "errorMessage": "Дисплей 'display-001' не найден среди дисплеев Arrivals"
}
```

| Поле | Тип | Обяз. | Описание |
|------|-----|:-----:|----------|
| `success` | boolean | Да | Всегда `false` для ошибочного ответа |
| `errorCode` | string | Да | Машинный код ошибки из фиксированного перечня |
| `errorMessage` | string | Да | Человекочитаемое описание ошибки для записи в лог |

### 3.4. Коды ошибок

| Код | Условие | Описание |
|-----|---------|----------|
| `DisplayNotFound` | Дисплей с указанным `displayId` не найден среди дисплеев данного экземпляра Arrivals | Возможно, дисплей был удалён или изменён после настройки. Рекомендуется обновить список дисплеев |
| `SoundFileNotFound` | Файл по пути `soundFilePath` не существует на терминале | Возможно, файл не был скачан DigitalVoice или был удалён |
| `PlaybackError` | Ошибка воспроизведения: аудиоустройство недоступно, неподдерживаемый формат файла, очередь дисплея заполнена | Конкретная причина указывается в `errorMessage` |
| `InternalError` | Любая другая нештатная ситуация в Arrivals | Детали исключения указываются в `errorMessage` |

---

## 4. Ошибки ExternalOperation (сторона DigitalVoice)

При вызове `CallExternalOperation` SDK может выбросить `ExternalOperationCallingException`. Свойство `Reason` (enum `ExternalOperationCallingExceptionReason`) указывает причину.

| Reason | Значение | Условие | Реакция DigitalVoice |
|:------:|:-------:|---------|---------------------|
| `NetworkProblem` | 0 | Проблема IPC-канала между плагинами | Повторить вызов до 3 раз с задержкой 1 сек. После исчерпания попыток -- записать ошибку в лог, пропустить воспроизведение для этого дисплея |
| `OperationNotRegistered` | 1 | Операция с указанным `serviceName`/`operationName` не зарегистрирована (Arrivals упал или не запущен) | Запустить процедуру переобнаружения Arrivals: вызвать `GetExternalOperations()`, обновить карту маршрутизации. До переобнаружения -- исключить этот Arrivals из маршрутизации |
| `OperationFailed` | 2 | Исключение в callback-методе Arrivals | Записать ошибку в лог (включая `errorCode`/`errorMessage` из ответа Arrivals, если доступны). Пропустить воспроизведение для этого дисплея |

> [!NOTE]
> Исключения `ExternalOperationCallingException` обрабатываются на уровне вызова `CallExternalOperation` и не зависят от бизнес-логики Arrivals. Бизнес-ошибки Arrivals (`DisplayNotFound`, `SoundFileNotFound` и др.) возвращаются в теле ответа (поле `success: false`), а не через исключения.

---

## 5. Сводный маппинг данных

### 5.1. Поля запроса -> источники

| Поле DTO | Источник данных | Путь в GetTerminalSettings | Примечание |
|----------|----------------|---------------------------|------------|
| `soundFilePath` | Локальный путь к скачанному файлу | `eventHandlers[].fileUrl` -> скачать -> сохранить локально | DigitalVoice скачивает файл при получении настроек (шаг 7 алгоритма) |
| `displayId` | Идентификатор дисплея | `outputDevices[].displays[].displayId` | Берётся из расширенного ответа `GetTerminalSettings` |
| `volume` | [ДОПУЩЕНИЕ] Настройка в Admin-панели | Пока не реализовано | Зарезервировано для будущих версий |

### 5.2. Поля ответа -> приёмники

| Поле DTO | Приёмник | Использование |
|----------|----------|---------------|
| `success` | DigitalVoice | Определяет, успешно ли воспроизведение. При `false` -- запись в лог |
| `errorCode` | DigitalVoice | Категоризация ошибки для логирования и возможной автоматической реакции |
| `errorMessage` | DigitalVoice | Детали ошибки для диагностики |

---

*API-справочник завершён. Связанные документы: [спецификация](Спецификация_Межплагин_DigitalVoice_Arrivals.md), разделы 7.4, 9.*
