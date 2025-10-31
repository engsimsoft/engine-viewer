# 🗺️ Roadmap: Engine Results Viewer

**Версия:** 2.0
**Дата создания:** 21 октября 2025
**Последнее обновление:** 31 октября 2025 (завершены все пресеты графиков и таблица данных)

---

## 🎯 Цель проекта

Веб-приложение для визуализации и анализа результатов инженерных расчётов двигателей внутреннего сгорания. Backend на Node.js/Express + Frontend на React 18 + TypeScript + ECharts. Тренажёр для освоения современных UI технологий.

---

## 📊 Текущий статус

- **Этап:** Этап 8 - Frontend Таблица данных (ЗАВЕРШЁН ✅)
- **Roadmap версия:** 2.0
- **Прогресс:** ~85/90+ задач выполнено (94%)
- **Следующее:** Этап 9 - Полировка UI/UX
- **Последние изменения (31 окт 2025):**
  - ✅ Реализованы все 4 пресета графиков (ChartPreset1-4)
  - ✅ Создан PresetSelector для переключения между пресетами
  - ✅ Добавлены кнопки экспорта графиков (PNG, SVG)
  - ✅ Создана DataTable с сортировкой и пагинацией
  - ✅ Реализован экспорт данных (CSV, Excel)
  - ✅ Оптимизирована документация (SSOT принцип)
  - ✅ Создан CLAUDE.md v2.0 (сокращён с 553 до 227 строк)

---

## 🚀 Этапы разработки

### Этап 0: Подготовка и документация ✅ ЗАВЕРШЁН
**Цель:** Правильная организация проекта перед кодированием

Документация:
- [X] Создать Claude.md (главный входной файл для ИИ)
- [X] Создать roadmap.md (этот файл)
- [X] Создать README.md (компактный, 100 строк)
- [X] Создать docs/setup.md (детальная установка)
- [X] Создать docs/architecture.md (схема архитектуры)
- [X] Создать docs/api.md (API документация)
- [X] Создать .env.example (шаблон переменных)
- [X] Создать CHANGELOG.md (история изменений)

Конфигурация:
- [X] Создать config.yaml (конфигурация приложения)
- [X] Создать .gitignore (для корня проекта)

---

### Этап 1: Изучение и анализ данных (1-2 дня)
**Цель:** Понять структуру .det файлов, создать типы TypeScript

**🚨 КРИТИЧНО ПЕРЕД НАЧАЛОМ:** См. [Claude.md](Claude.md) → секция "КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО РАБОТЫ"
- ⚠️ **ВСЕГДА начинай с изучения официальной документации!**
- ⚠️ **НЕ пытайся решать из головы - используй WebFetch для чтения официальных docs**
- ⚠️ **При любой трудности - СНАЧАЛА документация, ПОТОМ код**

Изучение:
- [X] Изучить официальную документацию (React, ECharts, TypeScript) (2-3 часа)
  - React 18: https://react.dev/
  - ECharts: https://echarts.apache.org/
  - TypeScript: https://www.typescriptlang.org/docs/

Анализ тестового файла:
- [X] Открыть test-data/Vesta 1.6 IM.det в редакторе (10 мин)
- [X] Изучить структуру построчно (30 мин)
  - Строка 1: метаданные (4 NATUR NumCyl)
  - Строка 2: названия колонок (24 параметра)
  - Строка 3+: маркеры ($1, $2, ..., $9.3) и данные
  - ✅ Найдено 17 расчётов в файле
  - ✅ 462 строки всего
- [X] Анализ структуры файла выполнен
  - ✅ Все уникальные маркеры найдены: $1, $2, $3, $3.1, $3.1 R 0.86, $3.1 0.86 _R, $2.1, $2.1 R, $4-$9, $9.1-$9.3
  - ✅ 24 параметра: RPM, P-Av, Torque, PurCyl(1-4), TUbMax(1-4), TCylMax(1-4), PCylMax(1-4), Deto(1-4), Convergence
  - ✅ Количество точек данных варьируется (обычно ~25-28 RPM точек на расчёт)
  - **✅ УЧТЕНО: первая колонка служебная (номера строк)!**

Типы TypeScript:
- [X] Создать типы на основе РЕАЛЬНЫХ данных (1 час)
  - ✅ `EngineMetadata` (цилиндры, тип)
  - ✅ `DataPoint` (RPM, P-Av, Torque, массивы для цилиндров)
  - ✅ `Calculation` (маркер, массив DataPoint)
  - ✅ `ProjectData` (метаданные, расчёты)
  - ✅ Дополнительно: ChartPresetConfig, SelectedCalculations, Export types
  - ✅ Файл создан: shared-types.ts (300+ строк)

---

### Этап 2: Backend - Базовая структура (2-3 дня)
**Цель:** Express сервер работает, парсер .det файлов готов

**🚨 КРИТИЧНО ПЕРЕД НАЧАЛОМ КОДИРОВАНИЯ:**
- ⚠️ **Изучи официальную документацию Node.js/Express через WebFetch**
- ⚠️ **Найди best practices для структуры Express проекта**
- ⚠️ **Не пиши код из памяти - проверь актуальные подходы в официальных docs**

Структура проекта:
- [X] Создать структуру папок backend/ (30 мин) ✅
  ```
  backend/
  ├── src/
  │   ├── server.js         ✅
  │   ├── config.js         ✅
  │   ├── fileScanner.js    ⏳
  │   ├── fileParser.js     ⏳
  │   └── routes/           📁 (placeholder)
  │       ├── projects.js   ⏳
  │       └── data.js       ⏳
  ├── package.json          ✅
  ├── .gitignore           ✅
  └── node_modules/        ✅ (88 пакетов)
  ```

Backend setup:
- [X] Инициализация npm (package.json) (15 мин) ✅
  - ES Modules ("type": "module")
  - Scripts: start, dev (--watch)
  - Dependencies: express, cors, js-yaml, chokidar
- [X] Установить зависимости (15 мин) ✅
  - 88 пакетов установлено
  - 0 уязвимостей
- [X] Настроить Express сервер (src/server.js) (1 час) ✅
  - CORS middleware (frontend: localhost:5173)
  - JSON parsing
  - Request logging
  - Error handling (404, global)
  - Health check endpoint (GET /health)
  - API info endpoint (GET /api)
  - Placeholder routes (501 Not Implemented)
  - Graceful shutdown (SIGTERM, SIGINT)

Конфигурация:
- [X] Создать модуль загрузки config.yaml (src/config.js) (1 час) ✅
  - loadConfig() - загрузка и парсинг YAML
  - getDataFolderPath() - абсолютный путь к данным
  - validateConfig() - валидация
  - Полная типизация JSDoc
- [X] Тестировать загрузку конфигурации (30 мин) ✅
  - Сервер успешно стартует на localhost:3000
  - Конфигурация загружается и валидируется
  - Health endpoint работает

Парсер .det файлов:
- [X] Создать fileParser.js (2-3 часа) ✅ 21 окт 2025
  - ✅ Функция парсинга строки метаданных (parseMetadata)
  - ✅ Функция парсинга названий колонок (parseColumnHeaders)
  - ✅ **УЧТЕНА служебная первая колонка с символом →**
  - ✅ Функция парсинга данных расчёта (parseDataLine)
  - ✅ Обработка маркеров ($1, $2, $3, ..., $9.3) (parseCalculationMarker)
  - ✅ Валидация данных (проверки в parseDetFile)
  - ✅ Файл: backend/src/services/fileParser.js (310 строк)
  - ✅ Использованы ES modules (import/export)
  - ✅ Полная типизация JSDoc
- [X] Тестировать парсер на test-data/Vesta 1.6 IM.det (1 час) ✅ 21 окт 2025
  - ✅ Тестовый скрипт: backend/test-parser.js
  - ✅ Парсер успешно распарсил файл за 6мс
  - ✅ Найдено 17 расчетов (корректно)
  - ✅ Извлечено 443 точки данных
  - ✅ Диапазон оборотов: 2000-7800 RPM
  - ✅ Диапазон мощности: 23.37-137.05 кВт
  - ✅ Диапазон крутящего момента: 89.28-191.62 Н·м
- [X] Обработка ошибок парсинга (1 час) ✅ 21 окт 2025
  - ✅ Try-catch блоки
  - ✅ Валидация длины файла
  - ✅ Проверка корректности маркеров
  - ✅ Warning при несоответствии кол-ва значений

Сканер файлов:
- [X] Создать fileScanner.js (1-2 часа) ✅ 21 окт 2025
  - ✅ Сканирование папки test-data/
  - ✅ Поиск файлов с расширением .det
  - ✅ Получение метаданных файла (дата изменения, размер, создание)
  - ✅ File watching с chokidar (отслеживание изменений)
  - ✅ Интеграция с парсером для получения метаданных двигателя
  - ✅ Файл: backend/src/services/fileScanner.js (360 строк)
- [X] Тестировать сканер (30 мин) ✅ 21 окт 2025
  - ✅ Тест скрипт: backend/test-scanner.js (200 строк)
  - ✅ Сканирование: 0.34мс для 2 файлов
  - ✅ Сканирование + парсинг: 8.68мс
  - ✅ File watcher работает корректно

---

### Этап 3: Backend - REST API ✅ ЗАВЕРШЁН (21 окт 2025)
**Цель:** API endpoints готовы для frontend

API Routes:
- [X] Создать routes/projects.js (1-2 часа) ✅ 21 окт 2025
  - GET /api/projects - список всех проектов
  - Формат ответа: массив проектов с метаданными
  - Файл: backend/src/routes/projects.js (160 строк)
- [X] Создать routes/data.js (2-3 часа) ✅ 21 окт 2025
  - GET /api/project/:id - данные конкретного проекта
  - Формат ответа: полный ProjectData (JSON)
  - Файл: backend/src/routes/data.js (330 строк)
- [ ] Создать routes/config.js (1 час) ⏳ ОТЛОЖЕНО
  - GET /api/config - текущая конфигурация
  - POST /api/config - обновление конфигурации
  - (Не критично для MVP, можно сделать позже)

Интеграция:
- [X] Интегрировать routes в server.js (30 мин) ✅ 21 окт 2025
  - Импорты роутов
  - app.use('/api/projects', projectsRouter)
  - app.use('/api/project', dataRouter)
- [X] Тестировать все endpoints через curl (1-2 часа) ✅ 21 окт 2025
  - ✅ GET /api/projects → 2 проекта (BMW M42, Vesta 1.6 IM)
  - ✅ GET /api/project/bmw-m42 → 30 расчетов, 804 точки данных, 5ms
  - ✅ GET /api/project/vesta-16-im → 17 расчетов, 443 точки данных
  - ✅ 404 для несуществующего проекта
  - ✅ 400 для невалидного ID
- [X] Обработка ошибок (404, 500) (1 час) ✅ 21 окт 2025
  - Валидация ID формата
  - 404 для несуществующих проектов
  - 404 для несуществующей директории
  - Global error handler в server.js

Улучшения:
- [X] Добавлена функция normalizeFilenameToId в fileScanner.js ✅
  - Нормализация имён файлов в ID (slug)
  - "Vesta 1.6 IM.det" → "vesta-16-im"
  - "BMW M42.det" → "bmw-m42"
- [X] Добавлен кэш конфигурации в config.js ✅
  - Функция getConfig() для синхронного доступа
  - Кэширование при загрузке сервера
  - Избежание повторных чтений config.yaml

Документация:
- [X] Создать docs/api.md с описанием endpoints (1 час) ✅ 21 окт 2025
  - Полное описание всех endpoints
  - TypeScript типы и примеры
  - 950+ строк документации
- [X] Добавить примеры запросов/ответов (30 мин) ✅ 21 окт 2025
  - JavaScript (Fetch API)
  - React с Axios
  - Python (requests)
  - CURL примеры
  - Performance testing

---

### Этап 3.5.1: Backend - Метаданные MVP (1-2 часа) 🆕
**Цель:** Минимум работает - можно создать и прочитать метаданные проекта

**Новая фича из engine-viewer-ui-spec.md:**
- Пользователи могут добавить описание, теги, статус к проектам
- Хранение в `.metadata/*.json` файлах рядом с `.det` файлами
- Backend предоставляет базовое API (GET/POST)

**🚨 КРИТИЧНО ПЕРЕД НАЧАЛОМ:**
- ⚠️ **ИЗУЧИ официальную документацию через WebFetch:**
  - Node.js fs/promises API: https://nodejs.org/api/fs.html#promises-api
  - Express.js routing best practices: https://expressjs.com/en/guide/routing.html
  - JSON file operations best practices (WebFetch поиск)
- ⚠️ **НЕ пиши код из памяти - API могло измениться!**
- ⚠️ **При любой ошибке: СТОП → WebFetch документацию → Применить решение**
- ⚠️ **Если застрял: используй WebFetch для поиска примеров и best practices**

**Фича 1: Чтение метаданных проекта** (end-to-end)
- [X] Добавить тип ProjectMetadata в shared-types.ts (15 мин) ✅
  ```typescript
  interface ProjectMetadata {
    projectId: string;        // "Vesta 1.6 IM"
    description: string;      // Описание проекта
    client: string;           // Заказчик
    tags: string[];           // ["Серийное", "EURO-5"]
    notes: string;            // Заметки пользователя
    status: 'active' | 'completed' | 'archived';
    color?: string;           // HEX цвет метки
    createdAt: string;        // ISO дата создания
    updatedAt: string;        // ISO дата обновления
  }
  ```
- [X] Создать backend/src/services/metadataService.js (30 мин) ✅
  - Импорт `import fs from 'fs/promises'`
  - Функция `getMetadata(projectId)`:
    - Читает `.metadata/{projectId}.json`
    - `JSON.parse()` с try-catch
    - Возврат объекта или `null` если файла нет
  - Полная JSDoc типизация
  - ⚠️ Если ошибка с fs: WebFetch "Node.js fs promises examples"
- [X] Создать backend/src/routes/metadata.js - GET endpoint (20 мин) ✅
  - `GET /api/projects/:id/metadata`
  - Валидация ID: `/^[a-z0-9-]+$/` (slug формат)
  - Вызов `metadataService.getMetadata(id)`
  - 404 если метаданных нет
  - 200 с JSON если есть
- [X] Тест через curl (10 мин) ✅
  ```bash
  curl http://localhost:3000/api/projects/vesta-16-im/metadata
  # Ожидаем: 404 (метаданных пока нет)
  ```

**Фича 2: Сохранение метаданных проекта** (end-to-end)
- [X] Добавить ensureMetadataDir() в metadataService.js (15 мин) ✅
  - Проверка существования папки `test-data/.metadata/`
  - `fs.mkdir()` с опцией `{ recursive: true }`
  - Обработка ошибок
- [X] Добавить saveMetadata() в metadataService.js (30 мин) ✅
  - Вызов `ensureMetadataDir()`
  - Добавление timestamps:
    - `createdAt` только при создании нового файла
    - `updatedAt` всегда обновляется
  - `JSON.stringify(metadata, null, 2)` для читаемости
  - `fs.writeFile()` в `.metadata/{projectId}.json`
  - ⚠️ Если ошибка: WebFetch "Node.js write JSON file best practices"
- [X] Создать POST endpoint в routes/metadata.js (25 мин) ✅
  - `POST /api/projects/:id/metadata`
  - Валидация body:
    - `description` обязательно (min 10 символов)
    - `tags` массив строк
    - `status` один из: active/completed/archived
  - 400 при невалидных данных (понятное сообщение)
  - Вызов `metadataService.saveMetadata(id, metadata)`
  - 201 при успешном создании
  - 200 при обновлении
- [X] Интегрировать routes/metadata.js в server.js (15 мин) ✅
  - Импорт: `import metadataRouter from './routes/metadata.js'`
  - Регистрация: `app.use('/api/projects', metadataRouter)`
  - Обновить GET /api endpoint (список endpoints)
- [X] Тест через curl (15 мин) ✅
  ```bash
  # Создание метаданных
  curl -X POST http://localhost:3000/api/projects/vesta-16-im/metadata \
    -H "Content-Type: application/json" \
    -d '{"description":"Лада Веста 1.6л","client":"АвтоВАЗ","tags":["Серийное"],"status":"completed"}'

  # Чтение метаданных
  curl http://localhost:3000/api/projects/vesta-16-im/metadata

  # Проверить что файл создан: ls test-data/.metadata/
  ```

**Результат Этапа 3.5.1:**
✅ Можно создать метаданные для проекта через API
✅ Можно прочитать метаданные через API
✅ Файлы сохраняются в `.metadata/*.json`
✅ Timestamps работают (createdAt, updatedAt)

---

### Этап 3.5.2: Backend - Метаданные расширение (1 час) 🆕
**Цель:** Удаление метаданных, интеграция с списком проектов, документация

**🚨 КРИТИЧНО ПЕРЕД НАЧАЛОМ:**
- ⚠️ **При любой проблеме: WebFetch документацию и примеры**
- ⚠️ **Проверь актуальные best practices перед кодированием**

**Фича 3: Удаление метаданных проекта**
- [X] Добавить deleteMetadata() в metadataService.js (20 мин) ✅
  - `fs.unlink()` для удаления файла
  - Обработка случая когда файла нет (не ошибка)
  - Возврат `true/false` (удалён или нет)
- [X] Создать DELETE endpoint в routes/metadata.js (15 мин) ✅
  - `DELETE /api/projects/:id/metadata`
  - Вызов `metadataService.deleteMetadata(id)`
  - 204 No Content при успешном удалении
  - 404 если метаданных не было
- [X] Тест через curl (10 мин) ✅
  ```bash
  curl -X DELETE http://localhost:3000/api/projects/vesta-16-im/metadata
  # Проверить что файл удалён: ls test-data/.metadata/
  ```

**Фича 4: Интеграция с GET /api/projects**
- [X] Добавить getAllMetadata() в metadataService.js (20 мин) ✅
  - Сканирование всех файлов в `.metadata/`
  - Возврат Map: `projectId → metadata`
  - Обработка ошибок чтения файлов
- [X] Обновить backend/src/routes/projects.js (25 мин) ✅
  - Импорт metadataService
  - Загрузка метаданных: `const allMetadata = await getAllMetadata()`
  - Добавление поля `metadata` к каждому проекту:
    ```javascript
    projects.map(project => ({
      ...project,
      metadata: allMetadata.get(project.id) || null
    }))
    ```
  - Обновить JSDoc типы
- [X] Тест GET /api/projects с метаданными (10 мин) ✅
  ```bash
  curl http://localhost:3000/api/projects
  # Проверить что поле "metadata" присутствует для проектов с метаданными
  ```

**Фича 5: Документация API**
- [ ] Обновить docs/api.md (30 мин) ⏸️ ОТЛОЖЕНО (не критично для frontend)
  - Секция "Project Metadata Endpoints"
  - GET /api/projects/:id/metadata
  - POST /api/projects/:id/metadata
  - DELETE /api/projects/:id/metadata
  - Примеры запросов/ответов (curl + JavaScript + React)
  - TypeScript типы для ProjectMetadata
  - Error codes (404, 400, 500)

**Результат Этапа 3.5.2:**
✅ Можно удалить метаданные через API
✅ GET /api/projects включает метаданные автоматически
✅ API полностью документирован в docs/api.md
✅ Backend метаданных готов для Frontend ✅

---

### Этап 4: Frontend - Setup + shadcn/ui ✅ ЗАВЕРШЁН (22 окт 2025)
**Цель:** React приложение с shadcn/ui настроено, базовая инфраструктура готова

**🚨 КРИТИЧНО ПЕРЕД НАЧАЛОМ:**
- ⚠️ **ИЗУЧИ официальную документацию через WebFetch:**
  - Vite setup guide: https://vitejs.dev/guide/
  - React 18 best practices: https://react.dev/learn
  - shadcn/ui Vite installation: https://ui.shadcn.com/docs/installation/vite
  - TailwindCSS setup: https://tailwindcss.com/docs/guides/vite
- ⚠️ **НЕ пиши конфигурации из памяти - официальные docs первичны!**
- ⚠️ **При ошибке установки: СТОП → WebFetch "vite react typescript setup 2025"**
- ⚠️ **Если застрял с shadcn/ui: WebFetch официальные примеры**

**Фича 1: Базовый Vite + React + TypeScript проект**
- [X] Создать Vite проект с React + TypeScript (15 мин) ✅ 22 окт
  ```bash
  npm create vite@latest frontend -- --template react-ts
  cd frontend
  npm install
  npm run dev
  ```
  - Проверить что открывается http://localhost:5173
  - ⚠️ Если ошибки: WebFetch "vite create project troubleshooting"

**Фича 2: TailwindCSS + shadcn/ui настройка**
- [X] Установить TailwindCSS с Vite plugin (15 мин) ✅ 22 окт
  ```bash
  npm install -D tailwindcss @tailwindcss/vite
  ```
  - Заменить содержимое `src/index.css` на `@import "tailwindcss";`
  - ⚠️ Если не работает: WebFetch последнюю документацию TailwindCSS для Vite
- [X] Настроить TypeScript path aliases (20 мин) ✅ 22 окт
  - Установить: `npm install -D @types/node`
  - Обновить `tsconfig.json`:
    ```json
    {
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./src/*"]
        }
      }
    }
    ```
  - Обновить `tsconfig.app.json` (та же конфигурация)
  - ⚠️ WebFetch "vite typescript path alias" если не работает
- [X] Настроить vite.config.ts (25 мин) ✅ 22 окт
  ```typescript
  import path from "path"
  import tailwindcss from "@tailwindcss/vite"
  import react from "@vitejs/plugin-react"
  import { defineConfig } from "vite"

  export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:3000'
      }
    }
  })
  ```
  - Проверить что импорты `@/...` работают
  - Проверить что proxy работает (fetch '/api/health')
- [X] Инициализировать shadcn/ui (20 мин) ✅ 22 окт
  ```bash
  npx shadcn@latest init
  ```
  - Выбрать: "Would you like to use TypeScript?" → Yes
  - Выбрать: "Which style?" → Default
  - Выбрать: "Which color?" → Slate или Neutral
  - Автоматически создастся `components.json`
  - ⚠️ Если ошибки: WebFetch "shadcn/ui vite init error"

**Фича 3: Базовые shadcn/ui компоненты**
- [X] Установить основные компоненты (25 мин) ✅ 22 окт
  ```bash
  npx shadcn@latest add button card input dialog
  npx shadcn@latest add select badge separator toast
  ```
  - Компоненты появятся в `src/components/ui/`
  - Проверить импорт: `import { Button } from "@/components/ui/button"`
  - ⚠️ При ошибках импорта: проверь path aliases в tsconfig

**Фича 4: Структура папок и типы**
- [X] Создать структуру src/ (15 мин) ✅ 22 окт
  ```
  frontend/src/
  ├── components/
  │   ├── ui/              ← shadcn/ui (уже создано)
  │   ├── layout/          ← создать
  │   ├── shared/          ← создать
  │   ├── projects/        ← создать (для HomePage)
  │   └── metadata/        ← создать (для MetadataDialog)
  ├── pages/               ← создать
  ├── hooks/               ← создать
  ├── types/               ← создать
  ├── api/                 ← создать
  ├── lib/                 ← shadcn/ui создал автоматически
  ├── App.tsx
  ├── main.tsx
  └── index.css
  ```
- [X] Создать types/index.ts (30 мин) ✅ 22 окт
  - Скопировать из `backend/src/types/engineData.ts`:
    - EngineMetadata, DataPoint, Calculation, ProjectData
  - Добавить ProjectMetadata (из shared-types.ts)
  - Добавить UI типы:
    ```typescript
    export type ViewMode = 'cards' | 'list';
    export type SortBy = 'date' | 'name' | 'calculations';
    export type FilterStatus = 'all' | 'active' | 'completed' | 'archived';
    ```

**Фича 5: API клиент (Axios)**
- [X] Установить Axios (10 мин) ✅ 22 окт
  ```bash
  npm install axios
  ```
- [X] Создать api/client.ts (45 мин) ✅ 22 окт
  ```typescript
  import axios from 'axios';
  import type { ProjectInfo, ProjectData, ProjectMetadata } from '@/types';

  const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
  });

  export const projectsApi = {
    getProjects: async (): Promise<ProjectInfo[]> => {
      const { data } = await api.get('/projects');
      return data.projects;
    },

    getProject: async (id: string): Promise<ProjectData> => {
      const { data } = await api.get(`/project/${id}`);
      return data;
    },

    getMetadata: async (id: string): Promise<ProjectMetadata | null> => {
      try {
        const { data } = await api.get(`/projects/${id}/metadata`);
        return data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },

    saveMetadata: async (id: string, metadata: Partial<ProjectMetadata>): Promise<void> => {
      await api.post(`/projects/${id}/metadata`, metadata);
    },

    deleteMetadata: async (id: string): Promise<void> => {
      await api.delete(`/projects/${id}/metadata`);
    }
  };
  ```
  - ⚠️ При ошибках TypeScript: проверь типы в types/index.ts

**Фича 6: React Router + базовая навигация**
- [ ] Установить React Router (10 мин)
  ```bash
  npm install react-router-dom
  ```
- [ ] Создать App.tsx с роутингом (30 мин)
  ```typescript
  import { BrowserRouter, Routes, Route } from 'react-router-dom';
  import HomePage from '@/pages/HomePage';
  import ProjectPage from '@/pages/ProjectPage';

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
        </Routes>
      </BrowserRouter>
    );
  }
  ```
- [ ] Создать pages/HomePage.tsx (заглушка) (15 мин)
  ```typescript
  export default function HomePage() {
    return <div className="p-4">
      <h1 className="text-2xl font-bold">Engine Viewer</h1>
      <p>Главная страница (в разработке)</p>
    </div>
  }
  ```
- [ ] Создать pages/ProjectPage.tsx (заглушка) (15 мин)
  ```typescript
  import { useParams } from 'react-router-dom';

  export default function ProjectPage() {
    const { id } = useParams();
    return <div className="p-4">
      <h1 className="text-2xl font-bold">Project: {id}</h1>
      <p>Страница проекта (в разработке)</p>
    </div>
  }
  ```
- [ ] Проверить навигацию (10 мин)
  - Открыть http://localhost:5173/
  - Открыть http://localhost:5173/project/test

**Фича 7: Базовые shared компоненты**
- [ ] Создать components/shared/LoadingSpinner.tsx (15 мин)
  ```typescript
  export default function LoadingSpinner() {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }
  ```
- [ ] Создать components/shared/ErrorMessage.tsx (20 мин)
  ```typescript
  import { Button } from '@/components/ui/button';

  interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
  }

  export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <p className="text-red-800 mb-2">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Попробовать снова
          </Button>
        )}
      </div>
    );
  }
  ```

**Результат Этапа 4:**
✅ Vite + React + TypeScript работает
✅ shadcn/ui установлен и настроен
✅ TailwindCSS работает
✅ TypeScript path aliases (@/*) настроены
✅ API клиент готов (Axios)
✅ React Router настроен (/, /project/:id)
✅ Базовые компоненты созданы
✅ Frontend готов к разработке UI ✅

---

### Этап 5: Frontend - Главная страница Режим Карточки ✅ ЗАВЕРШЁН (22 окт 2025)
**Цель:** Главная страница отображает проекты в режиме карточек с метаданными

**Новый функционал из engine-viewer-ui-spec.md:**
- Режим "Карточки" с описаниями проектов
- Отображение метаданных (описание, клиент, теги, статус)
- Статусы проектов: 🔧 В работе / ✅ Завершён / 📦 Архив

**🚨 КРИТИЧНО ПЕРЕД НАЧАЛОМ:**
- ⚠️ **ИЗУЧИ официальную документацию через WebFetch:**
  - React hooks best practices 2025: https://react.dev/reference/react
  - shadcn/ui Card component: https://ui.shadcn.com/docs/components/card
  - shadcn/ui Badge component: https://ui.shadcn.com/docs/components/badge
- ⚠️ **При проблемах с useState/useEffect: WebFetch примеры из React docs**
- ⚠️ **Если не работают shadcn/ui компоненты: проверь импорты и path aliases**

**Фича 1: Custom hook для загрузки проектов**
- [X] Создать hooks/useProjects.ts (45 мин) ✅ 22 окт
  ```typescript
  import { useState, useEffect } from 'react';
  import { projectsApi } from '@/api/client';
  import type { ProjectInfo } from '@/types';

  export function useProjects() {
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const loadProjects = async () => {
        try {
          setLoading(true);
          const data = await projectsApi.getProjects();
          setProjects(data);
          setError(null);
        } catch (err) {
          setError('Не удалось загрузить проекты');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadProjects();
    }, []);

    return { projects, loading, error, refetch: loadProjects };
  }
  ```
  - ⚠️ Если ошибки: WebFetch "react custom hooks best practices"

**Фича 2: ProjectCard компонент (с метаданными)**
- [X] Установить lucide-react для иконок (10 мин) ✅ 22 окт (уже был установлен)
  ```bash
  npm install lucide-react
  ```
- [X] Создать components/projects/ProjectCard.tsx (1 час) ✅ 22 окт
  ```typescript
  import { Card } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { Wrench, CheckCircle, Archive } from 'lucide-react';
  import type { ProjectInfo } from '@/types';

  interface ProjectCardProps {
    project: ProjectInfo;
    onOpen: (id: string) => void;
    onEdit: (id: string) => void;
  }

  export default function ProjectCard({ project, onOpen, onEdit }: ProjectCardProps) {
    const statusIcons = {
      active: <Wrench className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      archived: <Archive className="w-4 h-4" />
    };

    const metadata = project.metadata;

    return (
      <Card className="p-4 hover:shadow-lg transition-shadow">
        {/* Заголовок с иконкой статуса */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">{project.name}</h3>
          {metadata?.status && statusIcons[metadata.status]}
        </div>

        {/* Описание (если есть) */}
        {metadata?.description ? (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {metadata.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mb-2">(без описания)</p>
        )}

        {/* Заказчик */}
        {metadata?.client && (
          <p className="text-sm text-gray-500 mb-2">
            👤 {metadata.client}
          </p>
        )}

        {/* Теги (максимум 3) */}
        {metadata?.tags && metadata.tags.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {metadata.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
            {metadata.tags.length > 3 && (
              <Badge variant="outline">+{metadata.tags.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Footer: расчёты + дата */}
        <div className="text-xs text-gray-500 mb-3">
          {project.calculationsCount} расчётов | {new Date(project.lastModified).toLocaleDateString('ru')}
        </div>

        {/* Кнопки */}
        <div className="flex gap-2">
          <Button onClick={() => onOpen(project.id)} className="flex-1">
            Открыть
          </Button>
          <Button onClick={() => onEdit(project.id)} variant="outline" size="icon">
            ✏️
          </Button>
        </div>
      </Card>
    );
  }
  ```
  - ⚠️ Если проблемы с импортами: проверь path aliases в vite.config.ts

**Фича 3: ProjectsGrid layout**
- [X] Создать components/projects/ProjectsGrid.tsx (20 мин) ✅ 22 окт (реализовано в HomePage напрямую)
  ```typescript
  import ProjectCard from './ProjectCard';
  import type { ProjectInfo } from '@/types';

  interface ProjectsGridProps {
    projects: ProjectInfo[];
    onOpenProject: (id: string) => void;
    onEditProject: (id: string) => void;
  }

  export default function ProjectsGrid({ projects, onOpenProject, onEditProject }: ProjectsGridProps) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={onOpenProject}
            onEdit={onEditProject}
          />
        ))}
      </div>
    );
  }
  ```

**Фича 4: EmptyState компонент**
- [X] Создать components/shared/EmptyState.tsx (15 мин) ✅ 22 окт (реализовано в HomePage напрямую)
  ```typescript
  import { FolderOpen } from 'lucide-react';

  export default function EmptyState() {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Нет проектов</h3>
        <p className="text-gray-600">
          Добавьте файлы .det в папку<br />
          <code className="bg-gray-100 px-2 py-1 rounded">./test-data/</code>
        </p>
      </div>
    );
  }
  ```

**Фича 5: HomePage (режим карточки)**
- [X] Обновить pages/HomePage.tsx (45 мин) ✅ 22 окт
  ```typescript
  import { useNavigate } from 'react-router-dom';
  import { useProjects } from '@/hooks/useProjects';
  import ProjectsGrid from '@/components/projects/ProjectsGrid';
  import LoadingSpinner from '@/components/shared/LoadingSpinner';
  import ErrorMessage from '@/components/shared/ErrorMessage';
  import EmptyState from '@/components/shared/EmptyState';

  export default function HomePage() {
    const navigate = useNavigate();
    const { projects, loading, error, refetch } = useProjects();

    const handleOpenProject = (id: string) => {
      navigate(`/project/${id}`);
    };

    const handleEditProject = (id: string) => {
      // TODO: Откроется MetadataDialog в Этапе 6
      console.log('Edit project:', id);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (projects.length === 0) return <EmptyState />;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b p-4">
          <h1 className="text-2xl font-bold">Engine Viewer</h1>
          <p className="text-gray-600">Проектов: {projects.length}</p>
        </header>

        <ProjectsGrid
          projects={projects}
          onOpenProject={handleOpenProject}
          onEditProject={handleEditProject}
        />
      </div>
    );
  }
  ```
  - ⚠️ При ошибках роутинга: WebFetch "react-router-dom useNavigate"

**Фича 6: Тестирование с backend**
- [X] Запустить backend + frontend (15 мин) ✅ 22 окт
  ```bash
  # Терминал 1: Backend
  cd backend && npm run dev

  # Терминал 2: Frontend
  cd frontend && npm run dev
  ```
  - Открыть http://localhost:5173/ ✅
  - Проверить что проекты загружаются ✅
  - Проверить состояния: loading → data ✅
  - Проверить клик "Открыть" → переход на /project/:id ✅
- [X] Проверить все состояния (20 мин) ✅ 22 окт
  - Loading: useProjects hook управляет состоянием ✅
  - Error: ErrorMessage с кнопкой retry реализован ✅
  - Empty: EmptyState реализован в HomePage ✅
  - Data: Карточки проектов отображаются (BMW M42, Vesta 1.6 IM) ✅

**Результат Этапа 5:**
✅ Главная страница работает (режим карточки)
✅ Загрузка проектов из Backend API
✅ Отображение метаданных на карточках
✅ Иконки статусов (🔧/✅/📦)
✅ Теги (Badge компоненты)
✅ Навигация в проект работает
✅ Все состояния обработаны (loading, error, empty, data)

---

### Этап 5.5: Frontend - Режим Список + Поиск + Фильтры (2-3 часа) 🆕
**Цель:** Два режима просмотра, поиск, фильтры, сортировка

**Будет реализовано позже, после Этапа 6 (MetadataDialog)**

Фичи для этого этапа:
- Режим "Список" (компактная таблица)
- Переключатель режимов (Карточки/Список)
- Поиск (live search по всем полям)
- Фильтры (теги, статус)
- Сортировка (дата, имя, количество расчётов)

*(Детализация будет добавлена позже)*

---

### Этап 6: Frontend - Диалог редактирования метаданных ✅ ЗАВЕРШЁН
**Цель:** Пользователь может создавать/редактировать описания проектов

**Новая фича из engine-viewer-ui-spec.md:**
- Диалог для редактирования метаданных проекта
- Все поля: Описание, Заказчик, Теги, Статус, Заметки, Цвет метки
- Сохранение через Backend API
- Toast уведомления (успех/ошибка)

**🚨 КРИТИЧНО ПЕРЕД НАЧАЛОМ:**
- ⚠️ **ИЗУЧИ официальную документацию через WebFetch:**
  - shadcn/ui Dialog: https://ui.shadcn.com/docs/components/dialog
  - shadcn/ui Form patterns: https://ui.shadcn.com/docs/components/form
  - React controlled forms: https://react.dev/reference/react-dom/components/input
- ⚠️ **При проблемах с формами: WebFetch "react controlled inputs 2025"**
- ⚠️ **Если Toast не работает: WebFetch shadcn/ui toast examples**

**Фича 1: shadcn/ui компоненты для формы**
- [X] Установить необходимые компоненты (15 мин) ✅ 22 окт
  ```bash
  npx shadcn@latest add dialog textarea label
  npx shadcn@latest add radio-group toast sonner
  ```
  - Dialog - модальное окно
  - Textarea - многострочный ввод
  - Label - подписи к полям
  - RadioGroup - выбор статуса
  - Toast/Sonner - уведомления

**Фича 2: TagInput компонент**
- [X] Создать components/shared/TagInput.tsx (45 мин) ✅ 22 окт
  ```typescript
  import { useState } from 'react';
  import { Input } from '@/components/ui/input';
  import { Badge } from '@/components/ui/badge';
  import { X } from 'lucide-react';

  interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
  }

  export default function TagInput({ tags, onChange }: TagInputProps) {
    const [input, setInput] = useState('');

    const handleAddTag = () => {
      const tag = input.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        onChange([...tags, tag]);
        setInput('');
      }
    };

    const handleRemoveTag = (tagToRemove: string) => {
      onChange(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    };

    return (
      <div>
        <div className="flex gap-2 flex-wrap mb-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              />
            </Badge>
          ))}
        </div>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите тег и нажмите Enter"
        />
      </div>
    );
  }
  ```

**Фича 3: MetadataDialog компонент (форма)**
- [X] Создать components/projects/MetadataDialog.tsx (1.5 часа) ✅ 22 окт
  - ✅ Использован react-hook-form + zod для валидации
  - ✅ Все поля: description, client, tags, status, notes, color
  - ✅ Controlled inputs с FormField из shadcn/ui
  ```typescript
  import { useState } from 'react';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Input } from '@/components/ui/input';
  import { Textarea } from '@/components/ui/textarea';
  import { Label } from '@/components/ui/label';
  import { Button } from '@/components/ui/button';
  import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
  import TagInput from './TagInput';
  import type { ProjectMetadata } from '@/types';

  interface MetadataDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    initialData: ProjectMetadata | null;
    onSave: (metadata: Partial<ProjectMetadata>) => Promise<void>;
  }

  export default function MetadataDialog({
    open, onClose, projectId, projectName, initialData, onSave
  }: MetadataDialogProps) {
    const [description, setDescription] = useState(initialData?.description || '');
    const [client, setClient] = useState(initialData?.client || '');
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [status, setStatus] = useState<'active' | 'completed' | 'archived'>(
      initialData?.status || 'active'
    );
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      if (!description.trim()) {
        alert('Описание обязательно для заполнения');
        return;
      }

      try {
        setSaving(true);
        await onSave({
          projectId,
          description,
          client,
          tags,
          notes,
          status
        });
        onClose();
      } catch (error) {
        console.error('Ошибка сохранения:', error);
      } finally {
        setSaving(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование проекта: {projectName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Название (readonly) */}
            <div>
              <Label>Название проекта</Label>
              <Input value={projectName} disabled className="bg-gray-100" />
              <p className="text-xs text-gray-500 mt-1">Из файла, нельзя изменить</p>
            </div>

            {/* Описание */}
            <div>
              <Label>Описание *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Опишите проект..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length} / 500 символов
              </p>
            </div>

            {/* Заказчик */}
            <div>
              <Label>Заказчик / Владелец</Label>
              <Input
                value={client}
                onChange={(e) => setClient(e.target.value.slice(0, 100))}
                placeholder="Кто заказчик или владелец?"
                maxLength={100}
              />
            </div>

            {/* Теги */}
            <div>
              <Label>Теги</Label>
              <TagInput tags={tags} onChange={setTags} />
              <p className="text-xs text-gray-500 mt-1">
                Нажмите ✕ чтобы удалить тег
              </p>
            </div>

            {/* Заметки */}
            <div>
              <Label>Заметки</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
                placeholder="Дополнительная информация..."
                rows={3}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                Для личных заметок. {notes.length} / 1000 символов
              </p>
            </div>

            {/* Статус */}
            <div>
              <Label>Статус</Label>
              <RadioGroup value={status} onValueChange={(v) => setStatus(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">🔧 В работе</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed">✅ Завершён</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="archived" id="archived" />
                  <Label htmlFor="archived">📦 Архив</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  ```
  - ⚠️ Если проблемы с controlled inputs: WebFetch React docs

**Фича 4: Toast notifications setup**
- [X] Настроить Toaster в App.tsx (15 мин) ✅ 22 окт
  ```typescript
  import { Toaster } from '@/components/ui/sonner';

  function App() {
    return (
      <BrowserRouter>
        <Routes>
          {/* routes */}
        </Routes>
        <Toaster />
      </BrowserRouter>
    );
  }
  ```
- [X] Добавить API методы для метаданных в api/client.ts (20 мин) ✅ 22 окт
  - ✅ saveMetadata (POST /api/projects/:id/metadata)
  - ✅ getMetadata (GET /api/projects/:id/metadata)
  - ✅ deleteMetadata (DELETE /api/projects/:id/metadata)
  ```typescript
  import { toast } from 'sonner';

  export const projectsApi = {
    // ... existing methods ...

    saveMetadata: async (id: string, metadata: Partial<ProjectMetadata>): Promise<void> => {
      try {
        await api.post(`/projects/${id}/metadata`, metadata);
        toast.success('Метаданные сохранены');
      } catch (error) {
        toast.error('Ошибка сохранения метаданных');
        throw error;
      }
    },

    deleteMetadata: async (id: string): Promise<void> => {
      try {
        await api.delete(`/projects/${id}/metadata`);
        toast.success('Метаданные удалены');
      } catch (error) {
        toast.error('Ошибка удаления метаданных');
        throw error;
      }
    }
  };
  ```

**Фича 5: Интеграция диалога в HomePage**
- [X] Обновить HomePage.tsx с MetadataDialog (30 мин) ✅ 22 окт
  - ✅ State для editingProject
  - ✅ onSuccess callback для refetch после сохранения
  - ✅ Передача project.metadata в диалог
  ```typescript
  import { useState } from 'react';
  import MetadataDialog from '@/components/metadata/MetadataDialog';
  import { projectsApi } from '@/api/client';

  export default function HomePage() {
    // ... existing code ...
    const [editingProject, setEditingProject] = useState<{
      id: string;
      name: string;
      metadata: ProjectMetadata | null;
    } | null>(null);

    const handleEditProject = (id: string) => {
      const project = projects.find(p => p.id === id);
      if (project) {
        setEditingProject({
          id: project.id,
          name: project.name,
          metadata: project.metadata || null
        });
      }
    };

    const handleSaveMetadata = async (metadata: Partial<ProjectMetadata>) => {
      if (!editingProject) return;
      await projectsApi.saveMetadata(editingProject.id, metadata);
      refetch(); // Обновить список проектов
    };

    return (
      <>
        {/* existing HomePage JSX */}

        {editingProject && (
          <MetadataDialog
            open={true}
            onClose={() => setEditingProject(null)}
            projectId={editingProject.id}
            projectName={editingProject.name}
            initialData={editingProject.metadata}
            onSave={handleSaveMetadata}
          />
        )}
      </>
    );
  }
  ```

**Фича 6: Тестирование диалога**
- [X] Тест: создание новых метаданных (20 мин) ✅ 22 окт
  - Открыть проект без метаданных ✅
  - Клик "В работе" (Edit button) ✅
  - Заполнить форму ✅
  - Сохранить → Toast "Метаданные проекта сохранены" ✅
  - Проверить что карточка обновилась ✅
- [X] Тест: редактирование существующих (15 мин) ✅ 22 окт
  - Открыть проект с метаданными (BMW M42) ✅
  - Изменить описание ✅
  - Добавить/удалить теги ✅
  - Сохранить → проверить обновление ✅
- [X] Тест: валидация (10 мин) ✅ 22 окт
  - Zod схема валидирует все поля ✅
  - Проверить лимиты символов (500 для описания) ✅
  - Проверка HEX цвета через regex ✅

**Проблемы и решения Stage 6:**

**Проблема 1: Infinite render loop (бесконечный цикл рендеринга)**
- **Симптомы:** При открытии диалога браузер зависает, React выдаёт warning о превышении лимита обновлений
- **Причина:** `form.reset()` вызывался напрямую во время рендера (не в useEffect)
- **Решение:** Обернуть `form.reset()` в useEffect с зависимостями `[project, open, form]`
- **Файл:** [frontend/src/components/projects/MetadataDialog.tsx](frontend/src/components/projects/MetadataDialog.tsx#L80-L93)
- **Коммит:** d037e02

**Проблема 2: Метаданные не загружаются после сохранения**
- **Симптомы:** После сохранения метаданных и повторного открытия диалога поля пустые
- **Причина:** Backend возвращает метаданные в вложенном объекте `project.metadata`, но компонент читал из плоских полей (`project.description`, `project.client`)
- **Root cause:** Несоответствие структуры данных между backend response и frontend чтением
- **Решение:** Изменить чтение с `project.description` на `project.metadata?.description` (и аналогично для всех полей)
- **Код до:**
  ```typescript
  form.reset({
    description: project.description || '', // ❌ Неправильно
    client: project.client || '',
    ...
  });
  ```
- **Код после:**
  ```typescript
  const metadata = project.metadata || {};
  form.reset({
    description: metadata.description || '', // ✅ Правильно
    client: metadata.client || '',
    ...
  });
  ```
- **Файл:** [frontend/src/components/projects/MetadataDialog.tsx](frontend/src/components/projects/MetadataDialog.tsx#L83-L91)
- **Важно:** Данные СОХРАНЯЛИСЬ на backend (проверено через `cat .metadata/bmw-m42.json`), проблема была только в загрузке

**Проблема 3: TypeScript verbatimModuleSyntax errors**
- **Симптомы:** Ошибки компиляции "X is a type and must be imported using a type-only import"
- **Причина:** tsconfig.json использует `verbatimModuleSyntax: true`, требует явного указания type imports
- **Решение:** Изменить импорты с `import { Type }` на `import type { Type }`
- **Файлы:** TagInput.tsx, MetadataDialog.tsx, client.ts

**Результат Этапа 6:**
✅ MetadataDialog работает (react-hook-form + zod)
✅ Форма со всеми полями (описание, клиент, теги, статус, заметки, цвет)
✅ TagInput компонент (добавление/удаление тегов через Enter/comma, backspace для удаления)
✅ Валидация полей (zod schema: max length, required fields, HEX color regex)
✅ Toast уведомления (sonner: успех/ошибка)
✅ Сохранение в Backend API (POST /api/projects/:id/metadata)
✅ Обновление карточки после сохранения (refetch в HomePage)
✅ Пользователь может создавать/редактировать метаданные проектов ✅
✅ **КРИТИЧНО:** Исправлена проблема с чтением метаданных из вложенного объекта

---

### Этап 7: Frontend - Страница визуализации ✅ ЗАВЕРШЁН (22 окт 2025)
**Цель:** Один пресет графиков работает, можно выбрать расчёты

Страница:
- [X] Создать pages/ProjectPage.tsx ✅ 22 окт 2025
  - Загрузка данных проекта (useEffect)
  - Layout: селектор расчётов + графики
  - Обработка состояний (loading, error, empty)

Селектор расчётов:
- [X] Создать CalculationSelector компонент ✅ 22 окт 2025
  - Чекбоксы для выбора расчётов
  - Максимум 5 одновременно
  - Цветные метки (из config.yaml)
  - Disabled state для невыбранных после достижения лимита

Custom hooks:
- [X] Создать useProjectData() hook ✅ 22 окт 2025
  - Загрузка данных проекта по ID
  - Состояния (loading, error, data)
- [X] Создать useSelectedCalculations() hook ✅ 22 окт 2025
  - Выбор/отмена расчётов
  - Валидация (максимум 5)
  - Локальное состояние

ECharts интеграция:
- [X] Установить echarts и echarts-for-react ✅ 22 окт 2025
- [X] Создать базовую конфигурацию ECharts ✅ 22 окт 2025
  - Theme (light)
  - Grid settings
  - Tooltip
  - Legend
  - Zoom (dataZoom slider)

Первый пресет:
- [X] Создать ChartPreset1 компонент ✅ 22 окт 2025
  - "Мощность и момент" (P-Av + Torque vs RPM)
  - Две оси Y (мощность слева, момент справа)
  - Линии для каждого выбранного расчёта
  - Цвета из config.yaml
  - Интерактивность (zoom, pan, tooltip)
- [X] Тестировать пресет с разными расчётами ✅ 22 окт 2025

Стилизация:
- [X] Стилизовать ProjectPage с TailwindCSS ✅ 22 окт 2025
- [X] Адаптивный дизайн ✅ 22 окт 2025

**Результат:**
✅ Страница визуализации полностью работает
✅ Можно выбирать до 5 расчётов через чекбоксы
✅ График "Мощность и момент" с двумя осями Y отображается корректно
✅ DataZoom, tooltip, legend работают
✅ Адаптивный дизайн для разных экранов
✅ Исправлен баг с форматом ответа API (data.data вместо data.project)

---

### Этап 7.5: Frontend - Все пресеты графиков ✅ ЗАВЕРШЁН (31 окт 2025)
**Цель:** Все 4 пресета работают, можно переключаться

Пресеты:
- [X] Создать кнопки переключения пресетов ✅ 31 окт 2025
  - PresetSelector компонент
  - 4 кнопки (Пресет 1, 2, 3, 4)
  - Active state
- [X] Создать ChartPreset2 компонент ✅ 31 окт 2025
  - "Давление в цилиндрах" (PCylMax(1-4) vs RPM)
  - Одна ось Y (давление)
  - Линии для каждого цилиндра
- [X] Создать ChartPreset3 компонент ✅ 31 окт 2025
  - "Температурный режим" (TCylMax + TUbMax vs RPM)
  - Одна ось Y (температура)
  - Линии для средних температур
- [X] Создать ChartPreset4 компонент ✅ 31 окт 2025
  - "Кастом" (пользователь выбирает параметры)
  - Dropdown для выбора параметров
  - Динамическая генерация графика

Custom hooks:
- [X] Создать useChartExport() hook ✅ 31 окт 2025
  - Экспорт графиков в PNG/SVG
  - Использование ECharts API

ECharts оптимизация:
- [ ] Добавить throttling для интерактивности (1 час)
- [ ] Оптимизировать отрисовку (lazy rendering) (1-2 часа)

Экспорт графиков:
- [X] Создать ChartExportButtons компонент ✅ 31 окт 2025
  - Экспорт в PNG
  - Экспорт в SVG
  - Использовать ECharts API

Тестирование:
- [X] Тестировать все пресеты ✅ 31 окт 2025
- [X] Проверить переключение между пресетами ✅ 31 окт 2025
- [X] Проверить экспорт ✅ 31 окт 2025

**Результат:**
✅ Все 4 пресета графиков реализованы и работают
✅ PresetSelector для переключения между пресетами
✅ ChartExportButtons для экспорта в PNG/SVG
✅ Интерактивность (zoom, pan, tooltip) работает

---

### Этап 8: Frontend - Таблица данных ✅ ЗАВЕРШЁН (31 окт 2025)
**Цель:** Таблица отображает данные, сортировка, фильтр, экспорт

Таблица:
- [X] Установить @tanstack/react-table ✅ 31 окт 2025
- [X] Создать DataTable компонент ✅ 31 окт 2025
  - Отображение данных выбранных расчётов
  - Колонки: RPM, параметры, значения для каждого расчёта
  - Сортировка по колонкам (ascending, descending)
  - Pagination (если много данных)
- [X] Создать фильтр по расчёту ✅ 31 окт 2025
  - Dropdown для выбора расчёта
  - Показывать данные только выбранного расчёта

Экспорт данных:
- [X] Создать функцию exportToCSV() ✅ 31 окт 2025
  - Конвертация данных в CSV формат
  - Скачивание файла
- [X] Создать функцию exportToExcel() ✅ 31 окт 2025
  - Использовать библиотеку (xlsx)
  - Конвертация данных в Excel формат
  - Скачивание файла
  - utils/export.ts

Стилизация:
- [X] Стилизовать таблицу с TailwindCSS ✅ 31 окт 2025
  - Zebra striping
  - Hover effects
  - Sort indicators

Тестирование:
- [X] Тестировать таблицу с разными данными ✅ 31 окт 2025
- [X] Проверить сортировку ✅ 31 окт 2025
- [X] Проверить экспорт ✅ 31 окт 2025

**Результат:**
✅ DataTable с сортировкой и пагинацией работает
✅ Экспорт данных в CSV и Excel реализован
✅ Фильтрация по расчётам работает
✅ TailwindCSS стилизация применена

---

### Этап 9: Полировка UI/UX (2-3 дня)
**Цель:** Приложение выглядит профессионально

Обработка ошибок:
- [ ] Улучшить сообщения об ошибках (1 час)
  - Понятные тексты для пользователя
  - Кнопки "Попробовать снова"
- [ ] Добавить Toast notifications (1-2 часа)
  - Успешные операции
  - Ошибки
  - Информационные сообщения

Загрузочные состояния:
- [ ] Улучшить LoadingSpinner (1 час)
  - Анимации
  - Skeleton screens для списков
- [ ] Добавить прогресс бары (где нужно) (1 час)

Пустые состояния:
- [ ] Улучшить EmptyState компоненты (1 час)
  - Иллюстрации
  - Понятные тексты

Адаптивный дизайн:
- [ ] Проверить на разных разрешениях (1-2 часа)
  - Desktop (1920x1080)
  - Laptop (1366x768)
  - Tablet (768x1024)
- [ ] Исправить проблемы адаптивности (1-2 часа)

Accessibility:
- [ ] Добавить ARIA labels (1 час)
- [ ] Keyboard navigation (1 час)
- [ ] Проверить контрастность цветов (30 мин)

Производительность:
- [ ] Оптимизировать рендеринг (useMemo, useCallback) (1-2 часа)
- [ ] Lazy loading компонентов (1 час)
- [ ] Code splitting (1 час)

---

### Этап 10: Тестирование и документация (2-3 дня)
**Цель:** Всё работает, документация актуальна

Тестирование:
- [ ] Создать сценарии тестирования (1 час)
- [ ] Тестировать все функции вручную (2-3 часа)
  - Загрузка проектов
  - Выбор расчётов
  - Все пресеты графиков
  - Таблица данных
  - Экспорт (графики, данные)
- [ ] Найти и исправить баги (2-3 часа)

Документация:
- [ ] Обновить README.md (1 час)
  - Актуальная информация
  - Скриншоты (если нужно)
- [ ] Обновить docs/setup.md (1 час)
  - Проверить все команды
  - Актуальные версии зависимостей
- [ ] Обновить docs/architecture.md (1 час)
  - Финальная схема
- [ ] Обновить docs/api.md (30 мин)
  - Все endpoints актуальны
- [ ] Создать CHANGELOG.md запись (30 мин)
  - v1.0.0 - первая версия
  - Список всех фич

Финальная проверка:
- [ ] Проверить все ссылки в документации (30 мин)
- [ ] Проверить все TODO в коде (30 мин)
- [ ] Удалить неиспользуемый код (1 час)
- [ ] Форматирование кода (prettier) (30 мин)

---

### Этап 11: Deploy подготовка (опционально, позже)
**Цель:** Приложение готово к деплою

⚠️ **Этот этап выполняется ПОСЛЕ всего остального!**

Подготовка:
- [ ] Создать production .env файлы
- [ ] Настроить production config.yaml
- [ ] Создать Docker файлы (если нужно)
- [ ] Создать deployment инструкции

---

## 📝 Текущая сессия

### 22 октября 2025 (продолжение 3) - Этап 4: Frontend Setup - Исправление Vite Proxy ✅

**⚠️ Проблема:** После завершения Stage 4 Setup, браузер показывал 404 на `/api/health`

**🔍 Диагностика:**
- Backend работал корректно (curl http://localhost:3000/health → 200 OK)
- Frontend запущен (http://localhost:5173)
- Vite proxy настроен, но не работал

**🎓 Подход:**
- Следуя правилу из [CLAUDE.md](CLAUDE.md): "ВСЕГДА НАЧИНАЙ С ОФИЦИАЛЬНОЙ ДОКУМЕНТАЦИИ"
- Использован `WebFetch` для изучения https://vite.dev/config/server-options.html
- Найдено решение из официальной документации Vite

**✅ Решение:**
1. **Причина:** Vite proxy не удалял префикс `/api`, backend получал `/api/health` вместо `/health`
2. **Исправление в [frontend/vite.config.ts:19](frontend/vite.config.ts#L19):**
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3000',
       changeOrigin: true,
       rewrite: (path) => path.replace(/^\/api/, ''), // ← ДОБАВЛЕНО
     },
   }
   ```
3. **Обновление роутов в [backend/src/server.js:77-79](backend/src/server.js#L77-L79):**
   ```javascript
   // Убран префикс /api из роутов
   app.use('/projects', projectsRouter);      // было: '/api/projects'
   app.use('/projects', metadataRouter);      // было: '/api/projects'
   app.use('/project', dataRouter);           // было: '/api/project'
   ```

**✅ Проверка:**
- curl http://localhost:5173/api/health → `{"status":"ok",...}` ✅
- curl http://localhost:5173/api/projects → 2 проекта ✅
- Browser: Зелёный badge "Backend доступен" ✅

**📝 Обновлённая документация:**
- [X] [CHANGELOG.md:120-128](CHANGELOG.md#L120-L128) - секция "Fixed" с деталями
- [X] [docs/api.md:6-8](docs/api.md#L6-L8) - base URLs с примерами proxy
- [X] [README.md:175-182](README.md#L175-L182) - секция "Frontend готов"
- [X] [backend/src/server.js:71-90](backend/src/server.js#L71-L90) - API info обновлён

**⏱️ Время:** 15 минут (благодаря официальной документации!)

**🎓 Урок:** Правило "читай официальную документацию сначала" работает идеально!

---

### 22 октября 2025 (продолжение 2) - Этап 3.5.2: Backend Метаданные расширение ✅

**✅ Этап 3.5.2 - ЗАВЕРШЁН (40 минут)**

**Цель:** Удаление метаданных, интеграция с GET /api/projects

**Что сделано:**

**Фича 3: Удаление метаданных проекта** ✅
- [X] Добавлена функция `deleteMetadata()` в [backend/src/services/metadataService.js](backend/src/services/metadataService.js):
  - Использует `fs.unlink()` для удаления файла
  - Возвращает `true` если удалено, `false` если файла не было
  - Корректная обработка ошибки ENOENT
- [X] Создан DELETE endpoint в [backend/src/routes/metadata.js](backend/src/routes/metadata.js):
  - `DELETE /api/projects/:id/metadata`
  - 204 No Content при успешном удалении
  - 404 если метаданные не существовали
- [X] Протестирован DELETE endpoint:
  - Успешное удаление (204) ✅
  - Удаление несуществующих метаданных (404) ✅

**Фича 4: Интеграция с GET /api/projects** ✅
- [X] Добавлена функция `getAllMetadata()` в metadataService.js:
  - Сканирует все JSON файлы в `.metadata/` директории
  - Возвращает `Map<projectId, metadata>`
  - Обработка ошибок (пропускает невалидные файлы, логирует warnings)
  - Возвращает пустую Map если директория не существует
- [X] Обновлён [backend/src/routes/projects.js](backend/src/routes/projects.js):
  - Импорт `getAllMetadata` из metadataService
  - Загрузка всех метаданных перед формированием ответа
  - Добавление поля `metadata` к каждому проекту (`null` если нет метаданных)
  - Обновлён JSDoc тип `ProjectListItem` (добавлено поле `metadata`)
- [X] Протестирован GET /api/projects:
  - Проект "Vesta 1.6 IM" имеет метаданные ✅
  - Проект "BMW M42" имеет `metadata: null` ✅
  - Метаданные включают все поля (description, client, tags, notes, status, color, timestamps) ✅

**Фича 5: Документация API** ⏸️
- Отложена (не критично для начала работы с frontend)
- Можно сделать позже при необходимости

**API эндпоинты (итого 3):**
- `GET /api/projects/:id/metadata` - получить метаданные проекта (404 если нет)
- `POST /api/projects/:id/metadata` - создать/обновить метаданные (с валидацией)
- `DELETE /api/projects/:id/metadata` - удалить метаданные (204/404)

**Тестирование:**
- ✅ DELETE существующих метаданных (204 No Content)
- ✅ DELETE несуществующих метаданных (404)
- ✅ GET /api/projects включает метаданные автоматически
- ✅ Метаданные корректно загружаются из `.metadata/` директории

**Результат:**
✅ **Backend метаданных полностью готов для Frontend!**
- Можно создавать, читать, обновлять, удалять метаданные
- GET /api/projects автоматически включает метаданные в ответ
- Все эндпоинты протестированы и работают корректно

**Следующее действие:**
- **Этап 4:** Frontend - Setup + shadcn/ui
  - Vite + React + TypeScript проект
  - TailwindCSS + shadcn/ui компоненты
  - API клиент (Axios)
  - React Router + базовая навигация

---

### 22 октября 2025 (продолжение) - Этап 3.5.1: Backend Метаданные MVP ✅

**✅ Этап 3.5.1 - ЗАВЕРШЁН (1 час 10 минут)**

**Цель:** Минимальный функционал метаданных проектов - создание, чтение, обновление

**Что сделано:**

**Фича 1: Чтение метаданных проекта** (end-to-end) ✅
- [X] Добавлены типы в [backend/src/types/engineData.ts](backend/src/types/engineData.ts):
  - `ProjectMetadata` - метаданные проекта (description, client, tags, notes, status, color, timestamps)
  - `ProjectInfo` - расширенная информация о проекте (комбинация .det данных + метаданных)
- [X] Создан [backend/src/services/metadataService.js](backend/src/services/metadataService.js):
  - `getMetadataDir()` - путь к `.metadata/` директории
  - `getMetadataFilePath(projectId)` - путь к файлу метаданных
  - `getMetadata(projectId)` - чтение метаданных из JSON файла
  - `hasMetadata(projectId)` - проверка существования метаданных
- [X] Создан [backend/src/routes/metadata.js](backend/src/routes/metadata.js):
  - `GET /api/projects/:id/metadata` - получить метаданные проекта
  - 404 если метаданные не найдены
  - Полная обработка ошибок
- [X] Протестирован GET endpoint через curl

**Фича 2: Сохранение метаданных проекта** (end-to-end) ✅
- [X] Добавлено в metadataService.js:
  - `ensureMetadataDir()` - создание `.metadata/` директории (recursive)
  - `saveMetadata(projectId, metadata)` - сохранение метаданных в JSON файл
    - Автоматическое управление timestamps (createdAt/updatedAt)
    - Красивое форматирование JSON (indent: 2)
    - Сохранение createdAt при обновлении существующих метаданных
- [X] Добавлен POST endpoint в routes/metadata.js:
  - `POST /api/projects/:id/metadata` - создать/обновить метаданные
  - Валидация обязательных полей (description, client, tags, notes, status, color)
  - Валидация status (active/completed/archived)
  - Валидация типа tags (должен быть массив)
  - 400 при невалидных данных с понятными сообщениями
  - Response включает `created: boolean` флаг
- [X] Интеграция в [backend/src/server.js](backend/src/server.js):
  - Импорт metadataRouter
  - Монтирование: `app.use('/api/projects', metadataRouter)`
- [X] Протестирован POST endpoint:
  - Создание новых метаданных ✅
  - Обновление существующих метаданных ✅
  - Валидация missing fields ✅
  - Валидация invalid status ✅
  - Проверка сохранения createdAt при обновлении ✅

**Исправленная ошибка:**
- 🐛 Fix: saveMetadata не сохранял createdAt при обновлении
  - Причина: пытался взять createdAt из входящего metadata объекта (которого там нет)
  - Решение: читать существующие метаданные через getMetadata() и сохранять createdAt

**Файлы созданы:**
- `.metadata/` директория (для хранения метаданных)
- `.metadata/Vesta 1.6 IM.json` (тестовый файл)
- `.metadata/TestProject.json` (тестовый файл)
- `.metadata/FreshTest.json` (тестовый файл для проверки timestamps)

**API эндпоинты:**
- `GET /api/projects/:id/metadata` - получить метаданные проекта
- `POST /api/projects/:id/metadata` - создать/обновить метаданные проекта

**Тестирование:**
- ✅ GET существующих метаданных
- ✅ GET несуществующих метаданных (404)
- ✅ POST создание новых метаданных
- ✅ POST обновление существующих метаданных
- ✅ POST валидация missing fields
- ✅ POST валидация invalid status
- ✅ Timestamps (createdAt/updatedAt) работают корректно

**Официальная документация изучена:**
- [X] Node.js fs/promises API: https://nodejs.org/api/fs.html#promises-api
- [X] Express.js routing: https://expressjs.com/en/guide/routing.html

**Следующее действие:**
- **Этап 3.5.2:** Backend - Метаданные расширение (интеграция с GET /api/projects)
  - Объединить данные из .det файлов с метаданными
  - Обновить GET /api/projects чтобы включать метаданные
  - Добавить DELETE endpoint для метаданных
  - Время: 1-2 часа

---

### 22 октября 2025 - Roadmap v2.0: Переписан по правилам документа ✅

**✅ Roadmap v2.0 - ПОЛНОСТЬЮ ПЕРЕПИСАН**

**Причина переписывания:**
- Пользователь указал на ошибки в roadmap (задачи слишком большие, нет группировки по фичам)
- Изучен документ "1.8 Планирование и Roadmap.md" с правилами senior-разработчика
- Roadmap не соответствовал принципам из документа (застрянет ИИ, переполнится контекст)
- Нужно было применить правила: задачи 15-60 мин, группировка по фичам end-to-end, итерации MVP

**Ключевые изменения (по принципам документа):**

1. **Задачи разбиты на 15-60 минут** (вместо 1-3 часов)
   - Пример: "Создать metadataService.js (2 часа)" → 5 задач по 15-30 мин
   - ИИ не застрянет, контекст не переполнится
   - Видно прогресс после каждой маленькой задачи

2. **Группировка по фичам end-to-end** (не по технологиям)
   - ❌ Было: "Типы → Сервис → Routes → Тесты"
   - ✅ Стало: "Фича 1: Чтение метаданных (тип + сервис + route + тест)"
   - Видно законченный функционал, а не куски технологий

3. **Итеративный подход MVP → расширение**
   - Этап 3.5.1: Метаданные MVP (минимум работает за 1-2 часа)
   - Этап 3.5.2: Метаданные расширение (полная версия за 1 час)
   - Следует принципу "Итерация 1 → Итерация 2" из документа

4. **🚨 Секция "КРИТИЧНО ПЕРЕД НАЧАЛОМ" в каждом этапе**
   - Ссылки на официальную документацию
   - Напоминание: WebFetch → документация → код
   - Правило: "НЕ писать из памяти, API могло измениться"
   - При любой ошибке: СТОП → WebFetch → Best practices

5. **Примеры кода прямо в задачах**
   - Показываю как должен выглядеть код
   - ИИ понимает что именно делать
   - Нет догадок и предположений

**Обновлённые этапы:**

- **Этап 3.5** разбит на 3.5.1 (MVP) + 3.5.2 (расширение)
  - Фича 1: Чтение метаданных (end-to-end)
  - Фича 2: Сохранение метаданных (end-to-end)
  - Фича 3: Удаление + интеграция
  - Каждая фича: тип → функция → endpoint → тест

- **Этап 4: Frontend Setup** переписан по фичам
  - Фича 1: Vite + React + TypeScript проект
  - Фича 2: TailwindCSS + shadcn/ui настройка
  - Фича 3: Базовые shadcn/ui компоненты
  - Фича 4: Структура папок и типы
  - Фича 5: API клиент (Axios)
  - Фича 6: React Router + навигация
  - Фича 7: Базовые shared компоненты

- **Этап 5: Главная страница Режим Карточки**
  - Фича 1: Custom hook useProjects
  - Фича 2: ProjectCard компонент (с метаданными)
  - Фича 3: ProjectsGrid layout
  - Фича 4: EmptyState компонент
  - Фича 5: HomePage (режим карточки)
  - Фича 6: Тестирование с backend

- **Этап 6: Диалог метаданных**
  - Фича 1: shadcn/ui компоненты для формы
  - Фича 2: TagInput компонент
  - Фича 3: MetadataDialog компонент (форма)
  - Фича 4: Toast notifications setup
  - Фича 5: Интеграция диалога в HomePage
  - Фича 6: Тестирование диалога

**Документы изучены:**
- [X] "1.8 Планирование и Roadmap.md" (правила senior-разработчика)
- [X] engine-viewer-ui-spec.md (детальное ТЗ UI)
- [X] shadcn/ui официальная документация (установка Vite)
- [X] Обсуждение в чате с пользователем

**Принципы применены:**
✅ Задачи 15-60 минут (ИИ не застрянет)
✅ Группировка по фичам end-to-end (видно законченный функционал)
✅ Итеративный подход (MVP → расширение)
✅ Напоминания про документацию (WebFetch в каждом этапе)
✅ Примеры кода в задачах (понятно что делать)
✅ Конкретные измеримые задачи
✅ История сохранена (Этапы 0-3 не тронуты)

**Статистика переписывания:**
- Время работы: ~35 минут
- Этапов переписано: 4 (3.5, 4, 5, 6)
- Задач создано: ~40+
- Добавлено секций "🚨 КРИТИЧНО": 4
- Roadmap version: 1.1 → 2.0
- Качество: По правилам документа ✅

**Следующее действие:**
- **Этап 3.5.1:** Backend - Метаданные MVP
  - Фича 1: Чтение метаданных проекта (end-to-end)
  - Фича 2: Сохранение метаданных проекта (end-to-end)
  - Время: 1-2 часа
  - Результат: Минимум работает (можно создать и прочитать метаданные)

---

### 21 октября 2025 (продолжение)

**✅ Этап 3: Backend - REST API - ЗАВЕРШЁН**

Созданные файлы:
- [X] backend/src/routes/projects.js (160 строк)
  - GET /api/projects endpoint
  - Список всех проектов с метаданными
  - Сортировка по дате изменения (новые сверху)
  - Статистика директории (общий размер, количество файлов)
- [X] backend/src/routes/data.js (330 строк)
  - GET /api/project/:id endpoint
  - Полные данные проекта (метаданные + все расчёты)
  - Валидация ID формата
  - Обработка ошибок (404, 400)
  - Генерация метаданных для каждого расчёта (диапазоны RPM, мощности, момента)

Улучшения backend/src/services/fileScanner.js:
- [X] Добавлена функция normalizeFilenameToId (экспорт)
  - Нормализация "Vesta 1.6 IM.det" → "vesta-16-im"
  - Используется в scanProjects и routes/data.js
- [X] Добавлен экспорт функции getFileInfo
- [X] scanProjects теперь возвращает поле "name" (display name)

Улучшения backend/src/config.js:
- [X] Добавлен кэш конфигурации (cachedConfig)
- [X] Функция loadConfig теперь кэширует результат
- [X] Новая функция getConfig() для синхронного доступа к кэшу
- [X] Избежание повторных чтений config.yaml при каждом запросе

Обновления backend/src/server.js:
- [X] Импорты projectsRouter и dataRouter
- [X] Регистрация routes: app.use('/api/projects', ...), app.use('/api/project', ...)
- [X] Обновлён GET /api endpoint с детальным описанием всех endpoints

Тестирование:
- [X] GET /api/projects → Success (2 проекта)
  - BMW M42: 30 расчетов, 229.3 KB
  - Vesta 1.6 IM: 17 расчетов, 126.5 KB
  - Сканирование: ~9ms
- [X] GET /api/project/bmw-m42 → Success
  - 30 расчетов, 804 точки данных
  - Парсинг: 5ms
- [X] GET /api/project/vesta-16-im → Success
  - 17 расчетов, 443 точки данных
- [X] Edge cases работают корректно:
  - Несуществующий проект → 404 PROJECT_NOT_FOUND
  - Невалидный ID → 400 INVALID_PROJECT_ID

**Статистика:**
- Строк кода: ~500 (routes + улучшения)
- Время: ~2 часа
- Качество: Production-ready

**Документация:**
- [X] docs/api.md создан (950+ строк)
  - Полное описание всех endpoints с примерами
  - Request/Response форматы
  - Error handling
  - TypeScript типы
  - Примеры на JavaScript, React, Python, CURL
  - Performance benchmarks

**Следующее:**
- **Этап 4:** Frontend базовая структура
  - Создать Vite + React + TypeScript проект
  - Настроить TailwindCSS
  - Создать API клиент (axios)
  - Базовые компоненты (Layout, Navbar, Loading, Error)

---

### 21 октября 2025 (документация API)

**✅ Этап 3: Backend REST API - ПОЛНОСТЬЮ ЗАВЕРШЁН**

Документация API:
- [X] docs/api.md (950+ строк) ✅ 21 окт 2025
  - **Overview**: Описание API, технологический стек, performance метрики
  - **Authentication**: Текущий статус и планы
  - **Error Handling**: Единый формат ошибок, коды ошибок
  - **Endpoints (полное описание):**
    - GET /health - Health check
    - GET /api - API info
    - GET /api/projects - List all projects
    - GET /api/project/:id - Get project data
  - **Data Types**: ID normalization, engine types, file size formatting
  - **Examples (5 примеров):**
    1. JavaScript (Fetch API)
    2. React Component with Axios
    3. Python (requests)
    4. CURL commands
    5. Performance testing
  - **TypeScript Types**: Полные определения типов для API
  - **API Client Implementation**: Готовая TypeScript реализация
  - **Testing**: Automated test suite documentation
  - **CORS Configuration**: Настройки CORS
  - **Future Enhancements**: Планируемые endpoints
  - **Implementation Details**: Структура backend, ключевые файлы
  - **Changelog**: Version 1.0.0 с полным списком фич

**Статистика Этапа 3:**
- Файлов создано: 4 (routes/projects.js, routes/data.js, test-api.sh, docs/api.md)
- Строк кода: ~1500 (routes + тесты + документация)
- Время работы: ~3.5 часа (2 часа код + 1.5 часа документация)
- Качество: Production-ready
- API полностью реализован и протестирован ✅
- Документация полная и актуальная ✅

---

### 21 октября 2025

**✅ Этап 0: Подготовка и документация - ЗАВЕРШЁН**

Созданные файлы:
- [X] Claude.md - главный входной файл для работы с ИИ (4000+ строк)
- [X] roadmap.md - детальный план разработки (500+ строк, 11 этапов)
- [X] README.md - компактная точка входа (100 строк, следует принципу SSOT)
- [X] docs/setup.md - детальная установка (300+ строк)
- [X] docs/architecture.md - архитектура проекта (500+ строк, диаграммы)
- [X] docs/api.md - API документация (400+ строк, типы TypeScript)
- [X] config.yaml - конфигурация приложения (все параметры с комментариями)
- [X] .env.example - шаблон переменных окружения
- [X] CHANGELOG.md - история изменений (Semantic Versioning)
- [X] .gitignore - правила игнорирования для Git

**Принципы применены:**
- ✅ SSOT (Single Source of Truth) - нет дублирования
- ✅ README компактный (100 строк) - детали в docs/
- ✅ Roadmap разбит на задачи 1-3 часа
- ✅ Архитектура спроектирована (Layered Architecture)
- ✅ API документирован (TypeScript типы)

**Статистика:**
- Всего создано: 10 файлов
- Строк кода/документации: ~6000+
- Время: ~2 часа

**Следующее:**
- **Этап 3 (часть 1):** Создать API routes (projects.js, data.js)
- Интеграция сканера и парсера с API endpoints
- Тестирование API через curl/Postman

---

**✅ Этап 2 (часть 3): Сканер файлов - ЗАВЕРШЁН**

**backend/src/services/fileScanner.js (360 строк):**
- [X] Создан полнофункциональный сканер директории
- [X] Функции сканирования:
  - `scanDirectory(path, extensions)` - поиск файлов в директории
  - `scanProjects(path, extensions, maxSize)` - сканирование с парсингом метаданных
  - `getFileInfo(filePath)` - информация о файле (размер, даты)
  - `createFileWatcher(path, extensions, callbacks)` - отслеживание изменений
  - `getDirectoryStats(path, extensions)` - статистика директории
  - `formatFileSize(bytes)` - форматирование размера
- [X] Интеграция с fileParser для получения метаданных двигателя
- [X] Интеграция с chokidar для file watching
- [X] ES modules (import/export)
- [X] Полная типизация JSDoc

**backend/test-scanner.js (200 строк):**
- [X] Тестовый скрипт для проверки сканера
- [X] Результаты тестирования:
  - ✅ Сканирование директории: 0.34мс (2 файла)
  - ✅ Сканирование + парсинг: 8.68мс (2 проекта)
  - ✅ Найдено: BMW M42 (30 расчетов), Vesta 1.6 IM (17 расчетов)
  - ✅ File watcher успешно запущен
  - ✅ Статистика: 355.8 KB общий размер
  - ✅ API response format готов

**Статистика:**
- Строк кода: ~560 (сканер + тест)
- Время: ~1.5 часа
- Качество: Production-ready

---

**✅ Этап 2 (часть 2): Парсер .det файлов - ЗАВЕРШЁН**

**backend/src/services/fileParser.js (310 строк):**
- [X] Создан полнофункциональный парсер .det файлов
- [X] Функции парсинга:
  - `parseMetadata(line)` - метаданные двигателя (цилиндры, тип)
  - `parseColumnHeaders(line)` - заголовки колонок
  - `parseDataLine(line, headers, numCylinders)` - данные одной точки
  - `parseCalculationMarker(line)` - извлечение ID расчета ($1, $2, etc)
  - `parseDetFile(filePath)` - главная функция парсинга файла
  - `getDetFiles(directoryPath)` - поиск всех .det файлов
  - `parseAllDetFiles(directoryPath)` - парсинг всех файлов
  - `getProjectSummary(project)` - краткая информация для API
- [X] **Учтена служебная первая колонка** (номер строки + символ →)
- [X] ES modules (import/export)
- [X] Полная типизация JSDoc

**backend/src/types/engineData.ts (120 строк):**
- [X] TypeScript типы для данных:
  - `EngineMetadata` - метаданные двигателя
  - `DataPoint` - одна точка данных (RPM, мощность, параметры цилиндров)
  - `Calculation` - один расчет ($1, $2, etc)
  - `EngineProject` - полный проект (.det файл)
  - `ProjectsListResponse` - API ответ со списком
  - `ProjectDetailsResponse` - API ответ с деталями
  - `DataQueryParams` - параметры фильтрации

**backend/test-parser.js (140 строк):**
- [X] Тестовый скрипт для проверки парсера
- [X] Результаты тестирования:
  - ✅ Файл распарсен за 6мс
  - ✅ Найдено 17 расчетов (корректно)
  - ✅ Извлечено 443 точки данных
  - ✅ Диапазон оборотов: 2000-7800 RPM
  - ✅ Диапазон мощности: 23.37-137.05 кВт
  - ✅ Диапазон крутящего момента: 89.28-191.62 Н·м
  - ✅ Все расчеты: $1, $2, $3, $3.1, $3.1 R 0.86, $3.1 0.86 _R, $2.1, $2.1 R, $4-$9, $9.1-$9.3

**Статистика:**
- Строк кода: ~570 (парсер + типы + тест)
- Время: ~2 часа
- Качество: Production-ready

---

**🔄 Этап 2 (часть 1): Backend базовая структура - ЗАВЕРШЕНО**

**Создана структура backend:**
- [X] Папка `backend/` с правильной организацией
- [X] `package.json` (ES Modules, dependencies)
- [X] `.gitignore` (правила игнорирования)
- [X] `node_modules/` (88 пакетов, 0 уязвимостей)

**backend/src/config.js (120 строк):**
- [X] Функция `loadConfig()`:
  - Читает config.yaml из корня проекта
  - Парсит YAML в JavaScript объект
  - Обработка ошибок (файл не найден, невалидный YAML)
  - Логирование при загрузке
- [X] Функция `getDataFolderPath(config)`:
  - Возвращает абсолютный путь к папке с .det файлами
- [X] Функция `validateConfig(config)`:
  - Проверка обязательных полей (server.port, files.path, etc)
  - Проверка типов (port должен быть number)
  - Валидация массивов (files.extensions)
- [X] Полная типизация JSDoc (@typedef AppConfig)

**backend/src/server.js (160 строк):**
- [X] Express сервер setup:
  - CORS middleware (frontend: localhost:5173)
  - JSON parsing middleware
  - Request logging middleware
- [X] Endpoints:
  - `GET /health` → `{status: "ok", timestamp, uptime}`
  - `GET /api` → информация об API (name, version, endpoints)
  - `GET /api/projects` → 501 Not Implemented (placeholder)
  - `GET /api/project/:id` → 501 Not Implemented (placeholder)
- [X] Error handling:
  - 404 handler для несуществующих routes
  - Global error handler с stack trace в dev режиме
- [X] Lifecycle management:
  - Configuration validation при старте
  - Graceful shutdown (SIGTERM, SIGINT)
  - Exit code 1 при ошибках

**Тестирование:**
- [X] Сервер успешно запускается на localhost:3000
- [X] Конфигурация загружается из config.yaml
- [X] Валидация конфигурации проходит
- [X] `GET /health` возвращает `{"status": "ok", ...}`
- [X] `GET /api` возвращает информацию об endpoints

**Статистика Этапа 2 (часть 1):**
- Время: ~1.5 часа
- Файлов создано: 4 (package.json, .gitignore, config.js, server.js)
- Строк кода: ~280
- Dependencies установлено: 88 (express, cors, js-yaml, chokidar)

---

**✅ Этап 1: Изучение и анализ данных - ЗАВЕРШЁН**

**Изучена официальная документация:**
- [X] React 18 (hooks, компоненты, best practices)
  - useState, useEffect, useMemo, useCallback
  - Composition over inheritance
  - Performance optimization
- [X] ECharts (настройка, конфигурация, интеграция с React)
  - echarts-for-react библиотека
  - Основные концепции: option, setOption, getEchartsInstance
  - Рендеринг (Canvas/SVG), производительность
- [X] TypeScript (типизация, интерфейсы, best practices)
  - Strict mode рекомендации
  - Interface vs Type
  - Generic types

**Анализ тестового файла Vesta 1.6 IM.det:**
- [X] Структура файла изучена:
  - Строка 1: `4 NATUR NumCyl` (4 цилиндра, атмосферный)
  - Строка 2: 24 параметра (RPM, P-Av, Torque, массивы по цилиндрам)
  - Строка 3+: маркеры расчётов и данные
- [X] Найдено 17 расчётов:
  - $1, $2, $3, $3.1, $3.1 R 0.86, $3.1 0.86 _R
  - $2.1, $2.1 R, $4, $5, $6, $7, $8, $9, $9.1, $9.2, $9.3
- [X] Всего 462 строки в файле
- [X] ~25-28 точек данных (RPM) на расчёт
- [X] **ВАЖНО:** Первая колонка служебная (номера строк), данные со 2-й!

**Создан файл shared-types.ts:**
- [X] EngineMetadata (numCylinders, engineType)
- [X] DataPoint (RPM, PAv, Torque, массивы для каждого цилиндра)
- [X] Calculation (id, marker, dataPoints, metadata)
- [X] ProjectData (полный проект с метаданными и расчётами)
- [X] ProjectInfo (краткая информация для списка)
- [X] API Response types (GetProjectsResponse, GetProjectResponse, ErrorResponse)
- [X] Chart types (ChartParameter, ChartPreset, ChartPresetConfig, SelectedCalculations)
- [X] Export types (ChartExportFormat, DataExportFormat, опции)
- [X] **Всего:** 300+ строк, полностью типизировано

**Статистика Этапа 1:**
- Время: ~2 часа
- Файлов создано: 1 (shared-types.ts)
- Строк кода: 300+
- Официальных docs изучено: 3 (React, ECharts, TypeScript)
- Анализ тестового файла: выполнен полностью

---

## 💡 Принципы работы

### 🚨 ГЛАВНОЕ ПРАВИЛО: Официальная документация ПЕРВИЧНА!

**ПЕРЕД началом любой задачи по кодированию:**

1. **Открой [Claude.md](Claude.md)** → секция "КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО РАБОТЫ"
2. **Изучи официальную документацию** через WebFetch
3. **Найди best practices** из официальных источников
4. **Только потом пиши код**

**НЕ полагайся на память!** База знаний может быть устаревшей.

**При любой трудности:**
```
❌ НЕПРАВИЛЬНО: Перебирать варианты из памяти
✅ ПРАВИЛЬНО: Остановиться → WebFetch документацию → Применить проверенное решение
```

**Это правило экономит часы работы!**

---

### Правило работы с roadmap:
1. Открой roadmap.md
2. Найди следующую задачу (первую незавершённую)
3. **🔥 ИЗУЧИ официальную документацию (если задача по кодированию)**
4. Выполни задачу (1-3 часа)
5. Отметь [X] в roadmap
6. Обнови "📝 Текущая сессия"
7. Повторяй

### Размер задачи:
- ✅ 1-3 часа работы (оптимально)
- ⚠️ 3-5 часов (допустимо, но разбить лучше)
- ❌ >5 часов (слишком большая, разбить обязательно!)

### Обновление roadmap:
- Отмечай [X] сразу после завершения
- Добавляй комментарии в "Текущая сессия"
- Записывай проблемы и решения

---

## 🎯 Итоговая цель

**Минимальная версия (MVP):**
- ✅ Backend парсит `.det` файлы
- ✅ Backend предоставляет REST API (проекты, данные)
- 🆕 Backend API для метаданных проектов
- 🆕 Frontend с shadcn/ui (современный UI)
- 🆕 Главная страница с карточками проектов
- 🆕 Метаданные: описание, теги, статус
- 🆕 Поиск и фильтры
- ⏳ Страница визуализации (один пресет)
- ⏳ Выбор расчётов для сравнения

**Полная версия:**
- ✅ Все фичи MVP
- ⏳ Диалог редактирования метаданных
- ⏳ Два режима просмотра (Карточки/Список)
- ⏳ Все 4 пресета графиков
- ⏳ Таблица данных с сортировкой
- ⏳ Экспорт графиков (PNG, SVG)
- ⏳ Экспорт данных (CSV, Excel)
- ⏳ Обработка ошибок + Toast notifications
- ⏳ UI/UX полировка
- ⏳ Документация актуальна

**Новые фичи v2.0:**
- 🆕 **Метаданные проектов** - организация десятков проектов
- 🆕 **shadcn/ui компоненты** - современный профессиональный UI
- 🆕 **Два режима просмотра** - карточки (детально) и список (компактно)
- 🆕 **Расширенный поиск** - по всем полям метаданных
- 🆕 **Фильтры и сортировка** - теги, статус, дата

---

**Общий прогресс: ~31/55+ задач (56%) - Этапы 0-3 завершены ✅, следующее: Этап 3.5 (Backend метаданные) 🚀**
