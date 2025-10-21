# Архитектура проекта

**Дата:** 21 октября 2025
**Версия:** 1.0

---

## Общая схема

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│                   http://localhost:5173                          │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │   HomePage   │   │ ProjectPage  │   │  Components  │       │
│  │              │   │              │   │              │       │
│  │ - List       │   │ - Charts     │   │ - Chart      │       │
│  │   projects   │   │ - Selector   │   │ - Table      │       │
│  │              │   │ - Table      │   │ - Cards      │       │
│  └──────┬───────┘   └──────┬───────┘   └──────────────┘       │
│         │                  │                                     │
│         └──────────────────┴─────────────────┐                 │
│                                               │                 │
│                        ┌──────────────────────▼───────┐         │
│                        │     API Client (axios)       │         │
│                        │  - getProjects()             │         │
│                        │  - getProject(id)            │         │
│                        │  - getConfig()               │         │
│                        └──────────────┬───────────────┘         │
└────────────────────────────────────────┼───────────────────────┘
                                         │
                                         │ /api/* requests
                                         │ (Vite proxy)
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                    │
│                   http://localhost:3000                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Express Server                      │      │
│  │  - CORS middleware                                    │      │
│  │  - JSON parsing                                       │      │
│  │  - Error handling                                     │      │
│  └──────────────────────────┬───────────────────────────┘      │
│                             │                                    │
│          ┌──────────────────┼──────────────────┐               │
│          │                  │                  │               │
│  ┌───────▼────────┐ ┌──────▼──────┐  ┌───────▼────────┐      │
│  │  GET /health   │ │ GET /api/   │  │ GET /api/      │      │
│  │                │ │  projects   │  │  project/:id   │      │
│  └────────────────┘ └──────┬──────┘  └───────┬────────┘      │
│                            │                  │               │
│                    ┌───────▼──────────────────▼────────┐      │
│                    │      Services Layer               │      │
│                    │  - fileScanner.js                 │      │
│                    │  - fileParser.js                  │      │
│                    │  - config.js                      │      │
│                    └───────┬───────────────────────────┘      │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ Read files
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FILE SYSTEM                                 │
│                                                                  │
│  ┌──────────────┐        ┌──────────────┐                      │
│  │ config.yaml  │        │  test-data/  │                      │
│  │              │        │              │                      │
│  │ - Settings   │        │ - *.det      │                      │
│  │ - Colors     │        │   files      │                      │
│  │ - Paths      │        │              │                      │
│  └──────────────┘        └──────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Архитектурные принципы

### 1. Separation of Concerns (Разделение ответственности)

**Backend:**
- **Routes** - только HTTP маршрутизация
- **Services** - вся бизнес-логика
- **Config** - загрузка конфигурации

**Frontend:**
- **Pages** - композиция компонентов для страниц
- **Components** - переиспользуемые UI элементы
- **Hooks** - бизнес-логика и state management
- **API** - HTTP клиент, изолирован от компонентов

### 2. Single Responsibility (Одна ответственность)

Каждый модуль делает ОДНУ вещь:
- `fileParser.js` - ТОЛЬКО парсинг .det файлов
- `fileScanner.js` - ТОЛЬКО сканирование папки
- `ChartComponent` - ТОЛЬКО отображение графика

### 3. DRY (Don't Repeat Yourself)

- Общие компоненты вынесены в `components/`
- Custom hooks для переиспользуемой логики
- Утилиты в `utils/`

### 4. Layered Architecture (Слоистая архитектура)

```
Presentation Layer (UI)
         ↓
Business Logic Layer (Services, Hooks)
         ↓
Data Access Layer (API, File System)
```

---

## Backend архитектура

### Слои

```
┌─────────────────────────────────────────┐
│      PRESENTATION LAYER                 │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      Express Routes              │  │
│  │  - routes/projects.js            │  │
│  │  - routes/data.js                │  │
│  │  - routes/config.js              │  │
│  └──────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                │ Call services
                ▼
┌─────────────────────────────────────────┐
│      BUSINESS LOGIC LAYER               │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │         Services                 │  │
│  │  - fileScanner.scanFolder()      │  │
│  │  - fileParser.parse()            │  │
│  │  - config.load()                 │  │
│  └──────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                │ Read/Write
                ▼
┌─────────────────────────────────────────┐
│      DATA ACCESS LAYER                  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      File System                 │  │
│  │  - test-data/*.det               │  │
│  │  - config.yaml                   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Модули

**server.js** - Express сервер
- Инициализация Express
- Middleware (CORS, JSON parsing)
- Подключение routes
- Error handling
- Запуск сервера

**config.js** - Загрузка конфигурации
- Чтение config.yaml
- Парсинг YAML → JavaScript объект
- Валидация конфигурации
- Экспорт настроек

**fileScanner.js** - Сканирование файлов
- Сканирование папки test-data/
- Фильтрация по расширению (.det)
- Получение метаданных (дата изменения, размер)
- Возврат списка файлов

**fileParser.js** - Парсинг .det файлов
- Чтение файла
- Парсинг строки метаданных (тип двигателя, цилиндры)
- Парсинг названий колонок
- **⚠️ Учёт служебной первой колонки!**
- Парсинг данных расчётов (маркеры $1, $2, ...)
- Валидация данных
- Возврат структурированного JSON

**routes/projects.js** - API для списка проектов
- GET /api/projects
- Вызов fileScanner
- Формирование ответа

**routes/data.js** - API для данных проекта
- GET /api/project/:id
- Вызов fileParser
- Формирование ответа

**routes/config.js** - API для конфигурации
- GET /api/config - получить конфигурацию
- POST /api/config - обновить конфигурацию

---

## Frontend архитектура

### Слои

```
┌─────────────────────────────────────────┐
│      PRESENTATION LAYER                 │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │          Pages                   │  │
│  │  - HomePage.tsx                  │  │
│  │  - ProjectPage.tsx               │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────▼───────────────────┐  │
│  │        Components                │  │
│  │  - ProjectCard.tsx               │  │
│  │  - ChartPreset1.tsx              │  │
│  │  - DataTable.tsx                 │  │
│  │  - CalculationSelector.tsx       │  │
│  └──────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                │ Use hooks
                ▼
┌─────────────────────────────────────────┐
│      BUSINESS LOGIC LAYER               │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │        Custom Hooks              │  │
│  │  - useProjects()                 │  │
│  │  - useProjectData(id)            │  │
│  │  - useSelectedCalculations()     │  │
│  │  - useChartPreset()              │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────▼───────────────────┐  │
│  │          Utils                   │  │
│  │  - formatDate()                  │  │
│  │  - exportToCSV()                 │  │
│  │  - exportToPNG()                 │  │
│  └──────────────────────────────────┘  │
└───────────────┬─────────────────────────┘
                │
                │ HTTP requests
                ▼
┌─────────────────────────────────────────┐
│      DATA ACCESS LAYER                  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │        API Client                │  │
│  │  - api/client.ts                 │  │
│  │  - getProjects()                 │  │
│  │  - getProject(id)                │  │
│  │  - getConfig()                   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Модули

**App.tsx** - Главный компонент
- React Router setup
- Routes (/, /:projectId)
- Layout

**pages/HomePage.tsx** - Главная страница
- Отображение списка проектов
- Использование useProjects() hook
- Обработка состояний (loading, error, empty)

**pages/ProjectPage.tsx** - Страница проекта
- Загрузка данных проекта
- Селектор расчётов
- Пресеты графиков
- Таблица данных

**components/** - Переиспользуемые компоненты
- `ProjectCard` - карточка проекта
- `ChartPreset1-4` - пресеты графиков
- `DataTable` - таблица данных
- `CalculationSelector` - выбор расчётов
- `LoadingSpinner` - индикатор загрузки
- `ErrorMessage` - сообщение об ошибке
- `EmptyState` - пустое состояние

**hooks/** - Custom hooks
- `useProjects` - загрузка списка проектов
- `useProjectData` - загрузка данных проекта
- `useSelectedCalculations` - управление выбранными расчётами
- `useChartPreset` - управление пресетами

**api/client.ts** - API клиент
- Axios instance
- HTTP методы (GET, POST)
- Обработка ошибок
- Типизация запросов/ответов

**types/** - TypeScript типы
- `EngineMetadata` - метаданные двигателя
- `DataPoint` - точка данных
- `Calculation` - расчёт
- `ProjectData` - данные проекта
- UI типы

**utils/** - Утилиты
- `formatDate` - форматирование дат
- `exportToCSV` - экспорт в CSV
- `exportToExcel` - экспорт в Excel
- `exportToPNG` - экспорт графика в PNG

---

## Поток данных

### GET /api/projects

```
User clicks on HomePage
         ↓
HomePage.tsx calls useProjects()
         ↓
useProjects() calls api.getProjects()
         ↓
api.getProjects() → GET /api/projects
         ↓
Backend routes/projects.js
         ↓
fileScanner.scanFolder()
         ↓
Read test-data/ folder
         ↓
Return list of .det files
         ↓
Response: [{id, name, date, calculations}, ...]
         ↓
useProjects() updates state
         ↓
HomePage.tsx re-renders with data
```

### GET /api/project/:id

```
User clicks "Открыть" on ProjectCard
         ↓
Navigate to /project/:id
         ↓
ProjectPage.tsx calls useProjectData(id)
         ↓
useProjectData() calls api.getProject(id)
         ↓
api.getProject(id) → GET /api/project/:id
         ↓
Backend routes/data.js
         ↓
fileParser.parse(filename)
         ↓
Read test-data/Vesta 1.6 IM.det
         ↓
Parse file:
  - Line 1: metadata (cylinders, type)
  - Line 2: column names
  - Line 3+: calculations ($1, $2) and data
         ↓
Return ProjectData JSON
         ↓
Response: {project_name, engine, parameters, calculations}
         ↓
useProjectData() updates state
         ↓
ProjectPage.tsx re-renders with data
         ↓
Charts display data
```

---

## Форматы данных

### ProjectData (JSON)

```typescript
interface ProjectData {
  project_name: string;           // "Vesta 1.6 IM"
  file_path: string;              // "test-data/Vesta 1.6 IM.det"
  modified_date: string;          // ISO 8601 date
  engine: {
    type: string;                 // "NATUR"
    cylinders: number;            // 4
  };
  parameters: string[];           // ["RPM", "P-Av", "Torque", ...]
  calculations: Calculation[];    // [...]
}

interface Calculation {
  id: string;                     // "$1", "$2", "$3"
  name: string;                   // "$1", "$2", "$3"
  data: DataPoint[];              // [...]
}

interface DataPoint {
  RPM: number;
  "P-Av": number;
  Torque: number;
  "PurCyl( 1)": number;
  // ... все остальные параметры
}
```

---

## Технологический выбор и обоснование

### Почему Node.js + Express (Backend)?

**Плюсы:**
- ✅ JavaScript на frontend и backend (один язык)
- ✅ Простая настройка Express
- ✅ Легко работать с JSON
- ✅ Быстрая разработка

**Альтернативы:**
- Python + FastAPI: больше подходит для data science, но не нужен здесь
- Python + Flask: старый стек

### Почему React 18 + TypeScript (Frontend)?

**Плюсы:**
- ✅ React - современный и популярный
- ✅ TypeScript - type safety, меньше багов
- ✅ Hooks - чистая функциональная логика
- ✅ Большая экосистема

**Альтернативы:**
- Vue: меньше библиотек для charts
- Angular: слишком тяжёлый для этого проекта

### Почему ECharts?

**Плюсы:**
- ✅ Мощная библиотека для графиков
- ✅ Интерактивность "из коробки" (zoom, pan, tooltip)
- ✅ Высокая производительность
- ✅ Гибкая конфигурация
- ✅ Хорошая React интеграция (echarts-for-react)

**Альтернативы:**
- Recharts: проще, но менее мощный
- Chart.js: меньше функций для инженерных графиков
- D3.js: слишком low-level, долгая разработка

### Почему Vite?

**Плюсы:**
- ✅ Очень быстрый (HMR в миллисекундах)
- ✅ Современный bundler (ESM)
- ✅ Отличная DX (developer experience)
- ✅ TypeScript "из коробки"

**Альтернативы:**
- Webpack: медленнее, сложнее настройка
- Create React App: устарел

### Почему TailwindCSS?

**Плюсы:**
- ✅ Utility-first подход - быстрая разработка
- ✅ Нет конфликтов CSS
- ✅ Отличная документация
- ✅ Адаптивный дизайн легко

**Альтернативы:**
- CSS Modules: больше файлов, медленнее
- Styled Components: runtime overhead

---

## Безопасность

### Backend
- ✅ CORS настроен (только localhost:5173 в dev)
- ✅ JSON parsing ограничен размером
- ✅ Валидация путей файлов (предотвращение path traversal)
- ✅ Error handling (не раскрывать stack traces в production)

### Frontend
- ✅ TypeScript strict mode (type safety)
- ✅ Sanitize пользовательского ввода (если будет)
- ✅ Проверка API ответов

---

## Масштабируемость

### Текущая архитектура:
- **Подходит для:** 10-100 проектов, файлы до 10 MB
- **Ограничения:** Все данные в памяти (fileParser держит результат)

### Если проект вырастет:
- **База данных:** SQLite или PostgreSQL для хранения результатов парсинга
- **Кэширование:** Redis для кэширования частых запросов
- **Background jobs:** Bull или другая очередь для парсинга больших файлов
- **API pagination:** Limit/offset для больших списков

---

## TypeScript типы (shared-types.ts)

**Статус:** ✅ Реализовано (версия 0.2.0)

### Расположение

Файл **[shared-types.ts](../shared-types.ts)** в корне проекта содержит все общие типы для backend и frontend.

### Структура типов

**Core Types (Основные типы данных):**
```typescript
EngineMetadata      // Метаданные двигателя (цилиндры, тип)
DataPoint           // Одна точка данных (RPM + 23 параметра)
Calculation         // Один расчёт (маркер + массив точек)
ProjectData         // Полный проект (метаданные + расчёты)
ProjectInfo         // Краткая информация для списка
```

**API Types (Типы для REST API):**
```typescript
GetProjectsResponse    // Ответ: список проектов
GetProjectResponse     // Ответ: данные проекта
ErrorResponse          // Стандартная ошибка
```

**Chart Types (Типы для графиков):**
```typescript
ChartParameter         // Параметры для отображения
ChartPreset            // Пресеты графиков (preset1-4, custom)
ChartPresetConfig      // Конфигурация пресета
SelectedCalculations   // Выбранные расчёты для сравнения
```

**Export Types (Типы для экспорта):**
```typescript
ChartExportFormat      // PNG, SVG, JPG
DataExportFormat       // CSV, Excel, JSON
ChartExportOptions     // Опции экспорта графиков
DataExportOptions      // Опции экспорта данных
```

### Использование

**Backend (JavaScript/Node.js):**
```javascript
// Backend будет использовать JSDoc для типизации
/**
 * @typedef {import('../shared-types').ProjectData} ProjectData
 */

/**
 * @param {string} filePath
 * @returns {Promise<ProjectData>}
 */
async function parseDetFile(filePath) {
  // ...
}
```

**Frontend (TypeScript/React):**
```typescript
import type {
  ProjectData,
  Calculation,
  ChartPreset
} from '../shared-types';

// Полная типизация компонентов
```

### Особенности типов

**Основано на РЕАЛЬНЫХ данных:**
- Анализ файла `test-data/Vesta 1.6 IM.det` (462 строки, 17 расчётов)
- 24 параметра данных (RPM, P-Av, Torque, массивы по цилиндрам)
- **ВАЖНО:** Учтено что первая колонка служебная

**Массивы для цилиндров:**
```typescript
interface DataPoint {
  // Параметры по цилиндрам (всегда 4 значения)
  PurCyl: [number, number, number, number];
  TUbMax: [number, number, number, number];
  TCylMax: [number, number, number, number];
  PCylMax: [number, number, number, number];
  Deto: [number, number, number, number];
}
```

**Строгая типизация:**
```typescript
// Только разрешённые типы двигателя
type EngineType = 'NATUR' | 'TURBO' | 'SUPERCHARGED';

// Только разрешённые параметры для графиков
type ChartParameter = 'RPM' | 'PAv' | 'Torque' | ...;
```

### Преимущества общих типов

1. **Single Source of Truth** - типы в одном месте
2. **Sync между backend/frontend** - одинаковые типы данных
3. **Type safety** - ошибки выявляются на этапе компиляции
4. **Autocomplete** - IDE подсказывает доступные поля
5. **Документация** - типы = документация структуры данных

### Обновление типов

При изменении структуры данных:
1. Обнови `shared-types.ts`
2. Проверь что backend и frontend компилируются
3. Обнови эту документацию
4. Обнови `docs/api.md` с новыми типами

---

## Следующие шаги

После изучения архитектуры:
1. Изучи [shared-types.ts](../shared-types.ts) - все типы данных
2. Изучи [docs/api.md](api.md) - API endpoints
3. Открой [roadmap.md](../roadmap.md) - начни реализацию
4. Следуй принципам архитектуры при написании кода

---

**Архитектура спроектирована для чистоты, масштабируемости и поддерживаемости 🏗️**
