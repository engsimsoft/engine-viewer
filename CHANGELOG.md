# Changelog

Все значимые изменения в проекте документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
версионирование следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### В разработке
- Backend парсер .det файлов (fileParser.js)
- Backend сканер папки (fileScanner.js)
- Backend API endpoints (routes)
- Frontend React приложение
- Визуализация графиков (ECharts)

---

## [0.3.0] - 2025-10-21

### Added
- **Backend базовая структура** (Этап 2, часть 1):
  - Создана папка `backend/` с правильной структурой
  - `package.json`: ES Modules, dependencies (express, cors, js-yaml, chokidar)
  - `.gitignore`: правила игнорирования для backend
  - 88 npm пакетов установлено, 0 уязвимостей

- **backend/src/config.js** (120 строк):
  - Функция `loadConfig()` - загрузка и парсинг config.yaml
  - Функция `getDataFolderPath()` - абсолютный путь к данным
  - Функция `validateConfig()` - валидация конфигурации
  - Полная типизация JSDoc для всех функций
  - Обработка ошибок (файл не найден, невалидный YAML)

- **backend/src/server.js** (160 строк):
  - Express сервер с полной настройкой
  - CORS middleware (frontend: localhost:5173)
  - JSON parsing middleware
  - Request logging
  - Endpoints:
    - `GET /health` - проверка работоспособности
    - `GET /api` - информация об API
    - `GET /api/projects` - placeholder (501)
    - `GET /api/project/:id` - placeholder (501)
  - Error handling (404 handler, global error handler)
  - Graceful shutdown (SIGTERM, SIGINT)
  - Configuration validation при старте

### Testing
- ✅ Сервер успешно запускается на localhost:3000
- ✅ Health endpoint работает: `{"status": "ok", ...}`
- ✅ API info endpoint работает: показывает доступные endpoints
- ✅ Конфигурация загружается из config.yaml
- ✅ Валидация конфигурации проходит успешно

### Documentation
- Документация будет обновлена после завершения этапа

### Notes
- Backend базовая структура готова
- Следующее: создать fileParser.js и fileScanner.js
- Прогресс: ~20/40+ задач (50%)

---

## [0.2.0] - 2025-10-21

### Added
- **Изучена официальная документация** (следуя критическому правилу из Claude.md):
  - React 18: hooks patterns (useState, useEffect, useMemo, useCallback), composition, performance
  - ECharts: интеграция с React через echarts-for-react, конфигурация, рендеринг
  - TypeScript: strict mode, interfaces, generic types, best practices

- **Анализ тестового файла** `test-data/Vesta 1.6 IM.det`:
  - Выполнен детальный анализ структуры файла (462 строки)
  - Найдено 17 расчётов с маркерами ($1-$9.3)
  - Определены 24 параметра данных
  - **ВАЖНО:** Учтено что первая колонка служебная (номера строк)

- **Создан файл `shared-types.ts`** (300+ строк):
  - Core Types: `EngineMetadata`, `DataPoint`, `Calculation`, `ProjectData`, `ProjectInfo`
  - API Types: `GetProjectsResponse`, `GetProjectResponse`, `ErrorResponse`
  - Chart Types: `ChartParameter`, `ChartPreset`, `ChartPresetConfig`, `SelectedCalculations`
  - Export Types: `ChartExportFormat`, `DataExportFormat` с опциями экспорта
  - Полная типизация TypeScript на основе РЕАЛЬНОЙ структуры .det файла

### Documentation
- **Roadmap обновлён:**
  - Этап 1 "Изучение и анализ данных" отмечен как завершённый
  - Прогресс: 14/40+ задач (35%)
  - Добавлена детальная секция с результатами Этапа 1
  - Обновлён текущий статус проекта

### Notes
- Этап 0 (Подготовка) + Этап 1 (Изучение) завершены
- Следующий этап: Этап 2 - Backend базовая структура
- Следование принципу: "Официальная документация ПЕРВИЧНА!"

---

## [0.1.0] - 2025-10-21

### Added
- Создана структура проекта
- Создан файл Claude.md (главный входной файл для работы с ИИ)
- Создан roadmap.md (детальный план разработки)
- Создан README.md (точка входа, компактный)
- Создана папка docs/ с документацией:
  - docs/setup.md - детальная установка
  - docs/architecture.md - архитектура проекта
  - docs/api.md - API документация
- Создан config.yaml (конфигурация приложения)
- Создан .env.example (шаблон переменных окружения)
- Создан .gitignore (для Git)
- Создан CHANGELOG.md (этот файл)
- Добавлена документация по правилам:
  - 1.7 Документация: правильная организация.md
  - 1.8 Планирование и Roadmap.md
  - engine-viewer-tech-spec .md

### Documentation
- Принцип SSOT (Single Source of Truth) применён
- Вся документация следует best practices
- Roadmap разбит на конкретные задачи (1-3 часа)

---

## Типы изменений

- **Added** - новые функции
- **Changed** - изменения в существующих функциях
- **Deprecated** - функции которые скоро будут удалены
- **Removed** - удалённые функции
- **Fixed** - исправления багов
- **Security** - исправления безопасности

---

## Semantic Versioning

Формат версии: `MAJOR.MINOR.PATCH`

- **MAJOR** - несовместимые изменения API (breaking changes)
- **MINOR** - новые функции, обратно совместимые
- **PATCH** - исправления багов, обратно совместимые

Примеры:
- `1.0.0` → `1.1.0` - добавили новую фичу (совместимо)
- `1.1.0` → `1.1.1` - исправили баг (совместимо)
- `1.1.1` → `2.0.0` - изменили API (breaking change)

---

## Правила ведения CHANGELOG

### Когда обновлять

**После завершения задачи из roadmap:**
- Добавь запись в секцию `[Unreleased]`
- Укажи тип изменения (Added, Changed, Fixed, и т.д.)

**Перед release:**
- Создай новую секцию с номером версии и датой
- Перенеси всё из `[Unreleased]` в новую секцию
- Оставь `[Unreleased]` пустым для будущих изменений

### Формат записи

**Хорошо:**
```markdown
### Added
- Endpoint POST /api/cams/calculate для расчёта профиля кулачка
- Валидация параметров кулачка (base_radius > 0)
```

**Плохо:**
```markdown
### Added
- Добавил функцию (не понятно какую)
- Исправлено (не понятно что)
```

### Примеры

**Новая функция:**
```markdown
### Added
- Пресет графиков "Давление в цилиндрах" (PCylMax vs RPM)
- Экспорт данных в Excel формат
```

**Изменение:**
```markdown
### Changed
- Улучшена производительность парсинга .det файлов (в 2 раза быстрее)
- Изменён формат ответа GET /api/projects (добавлено поле calculations_count)
```

**Исправление:**
```markdown
### Fixed
- Исправлена ошибка парсинга файлов с пробелами в названии
- Исправлена CORS ошибка при запросах с frontend
- Исправлен баг с неправильным учётом первой служебной колонки
```

**Breaking change:**
```markdown
### Changed
- ⚠️ BREAKING: Изменён формат ProjectData API (удалено поле old_field)
```

---

## Ссылки

**Roadmap:** [roadmap.md](roadmap.md)
**Документация:** [docs/](docs/)
**Техническое задание:** [engine-viewer-tech-spec .md](engine-viewer-tech-spec%20.md)

---

**Версия проекта:** 0.1.0 (начальная версия, документация)
**Следующая версия:** 0.2.0 (backend базовая структура + парсер)
