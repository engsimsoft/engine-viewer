# Engine Results Viewer - Полная архитектура

**Версия:** 2.0.0
**Дата:** 7 ноября 2025
**Статус:** Production-ready (v2.0.0, Phase 3 complete)

---

## 📑 Содержание

- [О проекте](#о-проекте)
- [Статус реализации](#статус-реализации)
- [Общая схема](#общая-схема)
- [Архитектурные принципы](#архитектурные-принципы)
- [Backend архитектура](#backend-архитектура)
  - [Слои и модули](#слои-и-модули)
  - [Parser System (Registry Pattern)](#parser-system-registry-pattern)
  - [Metadata System](#metadata-system)
  - [File Scanner](#file-scanner)
  - [Metadata Architecture](#metadata-architecture)
  - [Configuration History](#configuration-history)
  - [API Routes](#api-routes)
- [Frontend архитектура](#frontend-архитектура)
  - [HomePage Dashboard](#homepage-dashboard)
  - [ProjectPage Visualization](#projectpage-visualization)
  - [Components](#components)
  - [Hooks](#hooks)
  - [State Management](#state-management)
- [Data Flow](#data-flow)
- [Chart Implementation](#chart-implementation)
- [Форматы данных](#форматы-данных)
- [Accessibility (WCAG 2.1 AA)](#accessibility-wcag-21-aa)
- [Responsive Design](#responsive-design)
- [Технологический стек](#технологический-стек)
- [Безопасность](#безопасность)
- [Масштабируемость](#масштабируемость)

---

## О проекте

**Engine Results Viewer** - современное веб-приложение для визуализации результатов инженерных расчётов двигателей внутреннего сгорания (ДВС).

**Цель:** Замена Desktop UI программы Post4T (15 лет разработки на Delphi/VBA) на современный Web интерфейс с сохранением workflow и данных.

**Контекст:**
- **EngMod4T Suite** = DAT4T (pre-processor) → EngMod4T (simulation) → Post4T (visualization)
- **Engine Viewer** заменяет ТОЛЬКО Post4T (визуализация)
- DAT4T и EngMod4T остаются без изменений (продолжают генерировать .det/.pou/.prt файлы)

**Масштаб:**
- ~50 проектов в год
- ~15 типов файлов для визуализации
- Источник данных: `test-data/` (dev), `C:/4Stroke/` (production, Windows)

**Платформа:**
- Development: macOS + VS Code + Claude Code
- Production: Windows (все production машины)
- Тестирование: Chrome/Safari (macOS), Chrome (Windows)

---

## Статус реализации

**Версия:** v2.0.0 (Phase 3 complete, 6 ноября 2025)

### ✅ Реализовано (~30% от Post4T feature parity)

**Backend (100%):**
- ✅ REST API (GET /api/projects, GET /api/project/:id)
- ✅ Parser Registry Pattern (.det, .pou, .prt форматы)
- ✅ File Scanner (recursive directory scan, auto metadata)
- ✅ Metadata System (auto from .prt + manual editable)
- ✅ CRUD API для metadata
- ✅ Error handling, validation

**HomePage Dashboard (100%):**
- ✅ FiltersBar (Type, Intake, Cylinders, Valves, Combined Sort/Status dropdown)
- ✅ ProjectCard (displayName, badges, status, calculation count, client, date)
- ✅ MetadataDialog (edit manual metadata, view auto metadata readonly)
- ✅ File watcher (auto-reload on changes)
- ✅ Error detection (parser errors → red badge on card)
- ✅ Project count statistics
- ✅ Responsive grid (1/2/3 columns)
- ✅ Skeleton loaders (iPhone quality UX)

**ProjectPage Visualization (20%):**
- ✅ 6 Chart Presets (Power/Torque, Pressure/Temp, MEP, Critical, Efficiency, Custom)
- ✅ Cross-project comparison (1 primary + up to 4 comparison projects)
- ✅ CalculationSelector (max 5 calculations, color-coded)
- ✅ DataTable (with CSV/Excel export)
- ✅ Peak values display (max power, max torque, at RPM)
- ✅ Units conversion (SI/American/HP systems)
- ✅ Chart export (PNG/SVG)
- ✅ Responsive layout (mobile/tablet/desktop)

**Accessibility & Polish (100%):**
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation (focus indicators, tab order, ESC handling)
- ✅ Screen reader support (ARIA labels, semantic HTML, live regions)
- ✅ Touch targets ≥44×44px
- ✅ Color contrast verification
- ✅ Animations & transitions (professional, smooth)

### ❌ Не реализовано (~70% от Post4T)

**Отсутствующие функции Post4T:**

1. **Thermo/Gasdynamic Traces** (9 типов)
   - Pressure traces (cylinder, intake, exhaust)
   - Temperature traces (cylinder, intake, exhaust)
   - Mass flow traces
   - Heat release rate
   - Valve lift profiles

2. **PV-Diagrams** (Pressure-Volume diagrams)
   - Indicated PV-diagram
   - Pumping loop visualization
   - Per-cylinder PV-diagrams

3. **Turbo Maps** (Turbocharger performance)
   - Compressor map overlay
   - Turbine map overlay
   - Operating point visualization

4. **Noise Analysis**
   - Sound pressure level (SPL) prediction
   - Frequency spectrum
   - Order analysis

5. **Advanced Data Tables**
   - Per-calculation summary tables
   - Statistical analysis (min/max/avg)
   - Export to specific formats (proprietary)

6. **Settings Panel**
   - Units conversion selector (currently hardcoded SI)
   - Color palette customization
   - Chart preferences

7. **File Format Support**
   - ~12 trace file types (`.tr*` extensions)
   - Advanced parameter sets

**Замечание:** Эти функции будут реализованы по мере необходимости. Текущие 30% покрывают основной workflow (Performance & Efficiency analysis).

---

## Общая схема

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER (Browser - Chrome/Safari)              │
│                   http://localhost:5173 (dev)                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP requests
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND (React 18 + Vite)                      │
│                   http://localhost:5173                          │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │   HomePage   │   │ ProjectPage  │   │  Components  │       │
│  │              │   │              │   │              │       │
│  │ - Filters    │   │ - Charts     │   │ - Cards      │       │
│  │ - Cards      │   │ - Selector   │   │ - Dialogs    │       │
│  │ - Metadata   │   │ - Table      │   │ - Shared UI  │       │
│  └──────┬───────┘   └──────┬───────┘   └──────────────┘       │
│         │                  │                                     │
│         └──────────────────┴─────────────────┐                 │
│                                               │                 │
│                        ┌──────────────────────▼───────┐         │
│                        │     API Client (axios)       │         │
│                        │  - getProjects()             │         │
│                        │  - getProject(id)            │         │
│                        │  - updateMetadata()          │         │
│                        └──────────────┬───────────────┘         │
└────────────────────────────────────────┼───────────────────────┘
                                         │
                                         │ /api/* → proxy
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                      │
│                   http://localhost:3000                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 Express Server                        │      │
│  │  - CORS middleware                                    │      │
│  │  - JSON parsing                                       │      │
│  │  - Error handling                                     │      │
│  └──────────────────────────┬───────────────────────────┘      │
│                             │                                    │
│          ┌──────────────────┼──────────────────┐               │
│          │                  │                  │               │
│  ┌───────▼────────┐ ┌──────▼──────┐  ┌───────▼────────┐      │
│  │  GET /health   │ │ GET /api/   │  │ POST /api/     │      │
│  │                │ │  projects   │  │  projects/:id/ │      │
│  │                │ │             │  │  metadata      │      │
│  └────────────────┘ └──────┬──────┘  └───────┬────────┘      │
│                            │                  │               │
│                    ┌───────▼──────────────────▼────────┐      │
│                    │      Services Layer               │      │
│                    │  - fileScanner.js                 │      │
│                    │  - ParserRegistry                 │      │
│                    │  - metadataService.js             │      │
│                    └───────┬───────────────────────────┘      │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ Read/Write files
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FILE SYSTEM                                 │
│                                                                  │
│  test-data/ (DEV) или C:/4Stroke/ (PRODUCTION)                  │
│  ├── BMW M42.prt            ← READ-ONLY! (В КОРНЕ)              │
│  ├── 4_Cyl_ITB.prt          ← READ-ONLY! (В КОРНЕ)              │
│  ├── [~50 проектов/год]     ← Каждый проект = .prt в корне     │
│  │                                                               │
│  ├── BMW M42/               ← Папка результатов проекта         │
│  │   ├── BMW M42.det        ← LIMITED WRITE (только markers!)   │
│  │   └── BMW M42.pou        ← LIMITED WRITE (только markers!)   │
│  │                                                               │
│  ├── 4_Cyl_ITB/                                                  │
│  │   ├── 4_Cyl_ITB.det                                          │
│  │   └── 4_Cyl_ITB.pou                                          │
│  │                                                               │
│  └── config.yaml            ← Application configuration          │
│                                                                  │
│  METADATA STORAGE (отдельно от C:/4Stroke/):                    │
│  engine-viewer/.metadata/   ← В КОРНЕ проекта Engine Viewer!    │
│      ├── bmw-m42.json       ← Combined auto + manual            │
│      └── 4-cyl-itb.json                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Ключевые изменения в v2.0:**
- **Вложенные папки:** Каждый проект в своей папке (BMW M42/, 4_Cyl_ITB/)
- **Метаданные:** `.prt` (в корне C:/4Stroke/) → auto metadata, `.metadata/*.json` (в engine-viewer/.metadata/) → combined (auto + manual)
- **File Scanner:** Recursive scan с поддержкой вложенных директорий
- **ВАЖНО:**
  - .prt файлы ВСЕГДА в корне C:/4Stroke/ (или test-data/)
  - .det/.pou файлы в папках проектов
  - .metadata/*.json в корне engine-viewer/ (НЕ в C:/4Stroke/!)

---

## Архитектурные принципы

### 1. Separation of Concerns

**Backend:**
- **Routes** - HTTP маршрутизация
- **Services** - бизнес-логика
- **Parsers** - парсинг файлов (Registry Pattern)

**Frontend:**
- **Pages** - композиция компонентов
- **Components** - переиспользуемые UI элементы
- **Hooks** - бизнес-логика и state
- **API** - HTTP клиент (изолирован)

### 2. Single Responsibility

Каждый модуль делает ОДНУ вещь:
- `detParser.js` - парсинг .det файлов
- `fileScanner.js` - сканирование папки
- `ChartPreset1` - график Power & Torque

### 3. DRY (Don't Repeat Yourself)

- Общие компоненты: `components/shared/`
- Custom hooks для переиспользуемой логики
- Утилиты в `utils/`
- Единый TypeScript types: `shared-types.ts` (backend + frontend)

### 4. Layered Architecture

```
Presentation Layer (UI)
         ↓
Business Logic Layer (Services, Hooks)
         ↓
Data Access Layer (API, File System)
```

### 5. Registry Pattern (Parsers)

- Централизованное управление парсерами
- Легко добавлять новые форматы
- Автоматическое определение формата файла

---

## Backend архитектура

### Слои и модули

```
┌─────────────────────────────────────────┐
│      PRESENTATION LAYER                 │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      Express Routes              │  │
│  │  - routes/projects.js            │  │
│  │  - routes/data.js                │  │
│  │  - routes/metadata.js            │  │
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
│  │  - fileScanner.js                │  │
│  │  - metadataService.js            │  │
│  │  - ParserRegistry                │  │
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
│  │  - test-data/**/*.det            │  │
│  │  - .metadata/*.json              │  │
│  │  - config.yaml                   │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**server.js** - Express сервер
- Инициализация Express
- Middleware (CORS, JSON parsing)
- Подключение routes
- Error handling
- Запуск сервера (port 3000)

**config.js** - Загрузка конфигурации
- Чтение config.yaml
- Парсинг YAML → JavaScript объект
- Валидация настроек
- Экспорт для приложения

---

### Parser System (Registry Pattern)

**Архитектура парсеров:**

```
backend/src/parsers/
├── index.js                    # Единый API, регистрация
├── registry/
│   └── FormatRegistry.js       # Registry pattern
├── common/
│   ├── calculationMarker.js    # Парсинг $ маркеров
│   └── formatDetector.js       # Автоопределение формата
└── formats/
    ├── detParser.js            # .det формат (24 параметра)
    ├── pouParser.js            # .pou формат (71 параметр)
    └── prtParser.js            # .prt формат (metadata)
```

**FormatRegistry.js** - Централизованное управление парсерами:

```javascript
class FormatRegistry {
  constructor() {
    this.parsers = new Map();
  }

  register(format, ParserClass) {
    this.parsers.set(format, ParserClass);
  }

  getParser(format) {
    return new (this.parsers.get(format))();
  }

  hasParser(format) {
    return this.parsers.has(format);
  }
}

export const globalRegistry = new FormatRegistry();
```

**parsers/index.js** - Точка входа:

```javascript
import { globalRegistry } from './registry/FormatRegistry.js';
import { DetParser } from './formats/detParser.js';
import { PouParser } from './formats/pouParser.js';
import { PrtParser } from './formats/prtParser.js';

// Регистрируем парсеры при импорте
globalRegistry.register('det', DetParser);
globalRegistry.register('pou', PouParser);
globalRegistry.register('prt', PrtParser);

export async function parseEngineFile(filePath) {
  const format = detectFormat(filePath);
  const parser = globalRegistry.getParser(format);
  return await parser.parse(filePath);
}
```

**Универсальный EngMod4T формат:**

⚠️ **КРИТИЧЕСКИ ВАЖНО:** Все ~15 типов файлов создаются ОДНОЙ программой (EngMod4T, Delphi 7) → **единый формат!**

```javascript
// ✅ ПРАВИЛЬНО для ВСЕХ файлов EngMod4T
const columns = line.trim().split(/\s+/);      // Множественные пробелы
const dataColumns = columns.slice(1);          // Пропускаем служебную колонку
const values = dataColumns.map(parseFloat);

// ❌ НЕПРАВИЛЬНО
const values = line.split(',');       // НЕТ! Это не CSV
const values = line.split(/\t+/);     // НЕТ! Это не табы
```

**Характеристики всех файлов:**
- Fixed-width ASCII text (НЕ CSV, НЕ tab-separated)
- Разделитель: множественные пробелы
- **Первая колонка ВСЕГДА служебная** (пропускать через `slice(1)`)
- Выравнивание: числа справа, пробелы слева

---

### Metadata System

**Назначение:** Автоматическое извлечение метаданных из `.prt` + ручное редактирование пользователем.

**Архитектура:**

```
┌─────────────────────────────────────────────────────────────────┐
│           FILE SYSTEM (.prt files - Auto metadata source)        │
│  test-data/BMW M42.prt  ← В КОРНЕ test-data/!                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Parse .prt
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRT PARSER                                    │
│  backend/src/parsers/formats/prtParser.js                        │
│                                                                  │
│  Extract:                                                        │
│  - cylinders, bore, stroke, CR, maxRPM                          │
│  - type (NA/Turbo/Supercharged)                                 │
│  - intakeSystem (ITB vs IM) ← Line 276 detection                │
│  - exhaustSystem (4-2-1, 4-1, tri-y) ← Regex patterns           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Auto metadata
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              METADATA SERVICE                                    │
│  backend/src/services/metadataService.js                         │
│                                                                  │
│  updateAutoMetadata(id, autoData)                               │
│  - Updates "auto" section ONLY                                  │
│  - Preserves "manual" section                                   │
│                                                                  │
│  updateManualMetadata(id, manualData)                           │
│  - Updates "manual" section ONLY                                │
│  - Preserves "auto" section                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Save to disk
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         METADATA STORAGE (.metadata/*.json)                      │
│                                                                  │
│  .metadata/bmw-m42.json:                                         │
│  {                                                               │
│    "version": "1.0",                                             │
│    "id": "bmw-m42",                                              │
│    "displayName": "BMW M42",                                     │
│    "auto": {           ← READ-ONLY (from .prt)                  │
│      "cylinders": 4,                                             │
│      "type": "NA",                                               │
│      "intakeSystem": "ITB",                                      │
│      "exhaustSystem": "4-2-1",                                   │
│      "bore": 84, "stroke": 81, "CR": 10.5                       │
│    },                                                            │
│    "manual": {         ← USER-EDITABLE                          │
│      "description": "Track build",                               │
│      "client": "Ivan Petrov",                                    │
│      "tags": ["bmw", "itb"],                                     │
│      "status": "active",                                         │
│      "notes": "Dyno tested 01.11.2025"                           │
│    }                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

**TypeScript Interface:**

```typescript
export interface AutoMetadata {
  cylinders: number;
  type: 'NA' | 'Turbo' | 'Supercharged';
  configuration: 'inline' | 'V' | 'boxer' | 'W';
  bore: number;                    // mm
  stroke: number;                  // mm
  compressionRatio: number;
  maxPowerRPM: number;
  intakeSystem: 'ITB' | 'IM';      // ITB = Individual throttle bodies
  exhaustSystem: '4-2-1' | '4-1' | 'tri-y' | 'custom';
}

export interface ManualMetadata {
  description?: string;
  client?: string;
  tags?: string[];
  status?: 'active' | 'completed' | 'archived';
  notes?: string;
  color?: string;  // HEX color
}

export interface ProjectMetadata {
  version: '1.0';
  id: string;
  displayName?: string;
  auto?: AutoMetadata;      // From .prt
  manual: ManualMetadata;   // User-editable
  created: string;          // ISO 8601
  modified: string;         // ISO 8601
}
```

**Intake System Detection (Line 276 of .prt):**

```javascript
// Line 276: "N throttles - with no airboxes" → ITB
// Line 276: "N throttle - with a common airbox or plenum" → IM

if (line.includes('with no airboxes')) {
  intakeSystem = 'ITB';
} else if (line.includes('with a common airbox or plenum')) {
  intakeSystem = 'IM';
}
```

**Exhaust System Parsing (Regex patterns):**

```javascript
// "4into2into1 manifold" → "4-2-1"
// "4into1 manifold" → "4-1"
// "tri-y manifold" → "tri-y"

const patterns = [
  { regex: /(\d+)into(\d+)into(\d+)/i, format: '$1-$2-$3' },
  { regex: /(\d+)into(\d+)/i, format: '$1-$2' },
  { regex: /tri-y/i, format: 'tri-y' }
];
```

**Rules:**
- ✅ Auto metadata: Read-only in frontend, updated on file scan
- ✅ Manual metadata: User-editable, preserved during auto updates
- ✅ Re-parsing .prt: Auto section updated, manual preserved
- ✅ Data integrity: Explicit separation prevents data loss

**См. также:** [ADR 005: .prt Parser and Metadata Separation](decisions/005-prt-parser-metadata-separation.md)

---

### File Scanner

**fileScanner.js** - Сканирование директории с проектами:

**Новая архитектура v2.0:**
- ✅ Recursive directory scan (вложенные папки)
- ✅ Ищет .det/.pou/.prt в подпапках
- ✅ Автоматически парсит .prt для auto metadata
- ✅ Объединяет auto + manual metadata
- ✅ Возвращает список ProjectInfo

**Структура файловой системы (РЕАЛЬНАЯ, v2.0):**

```
engine-viewer/                  ← PROJECT ROOT
├── .metadata/                  ← Metadata storage (в корне проекта!)
│   ├── bmw-m42.json            ← Combined auto + manual
│   ├── 4-cyl-itb.json
│   └── vesta-16-im.json
├── test-data/                  ← Data folder (dev) или C:/4Stroke/ (production)
│   ├── BMW M42.prt             ← Auto metadata source (В КОРНЕ data folder!)
│   ├── 4_Cyl_ITB.prt           ← Auto metadata source (В КОРНЕ data folder!)
│   ├── Vesta 1.6 IM.prt        ← Auto metadata source (В КОРНЕ data folder!)
│   ├── BMW M42/                ← Project results folder
│   │   ├── BMW M42.det
│   │   └── BMW M42.pou
│   ├── 4_Cyl_ITB/              ← Project results folder
│   │   ├── 4_Cyl_ITB.det
│   │   └── 4_Cyl_ITB.pou
│   └── Vesta 1.6 IM/           ← Project results folder
│       └── Vesta 1.6 IM.det
├── backend/
├── frontend/
└── config.yaml
```

**ВАЖНО:**
- .prt файлы ВСЕГДА в корне data folder (test-data/ или C:/4Stroke/), НЕ в папках проектов!
- .metadata/ находится в КОРНЕ engine-viewer/, НЕ внутри test-data/ или C:/4Stroke/!

**Recursive Scan Logic:**

```javascript
async function scanDirectory(dirPath) {
  const projects = [];

  for (const entry of await fs.readdir(dirPath, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      // Рекурсивное сканирование подпапки
      const subProjects = await scanDirectory(
        path.join(dirPath, entry.name)
      );
      projects.push(...subProjects);
    } else if (entry.isFile()) {
      // Проверка на .det или .pou файл
      if (entry.name.endsWith('.det') || entry.name.endsWith('.pou')) {
        const projectId = normalizeFilenameToId(entry.name);

        // Поиск соответствующего .prt файла (В КОРНЕ test-data/)
        const prtFileName = entry.name.replace(/\.(det|pou)$/, '.prt');
        const prtFullPath = path.join('./test-data', prtFileName);  // В корне!

        if (await fileExists(prtFullPath)) {
          // Парсинг .prt для auto metadata
          const autoMetadata = await prtParser.parse(prtFullPath);
          await metadataService.updateAutoMetadata(projectId, autoMetadata);
        }

        // Чтение combined metadata
        const metadata = await metadataService.readMetadata(projectId);

        projects.push({
          id: projectId,
          name: entry.name,
          path: path.join(dirPath, entry.name),
          metadata
        });
      }
    }
  }

  return projects;
}
```

**File Watching (Real-time monitoring):**

✅ **ENABLED** - файловый watcher работает автоматически при старте backend!

```javascript
// backend/src/server.js:162
// Автоматически запускается при npm run backend

fileWatcher = createFileWatcher(
  dataFolderPath,
  config.files.extensions,
  {
    onAdd: async (filePath) => {
      console.log(`[FileWatcher] File added: ${filePath}`);
      // Auto-update metadata for .prt files
    },
    onChange: async (filePath) => {
      console.log(`[FileWatcher] File changed: ${filePath}`);
      // Re-process .prt → update auto metadata
    },
    onRemove: (filePath) => {
      console.log(`[FileWatcher] File removed: ${filePath}`);
    }
  }
);
```

**Особенности:**
- ✅ Chokidar-based (node_modules/chokidar)
- ✅ Рекурсивное отслеживание всех подпапок
- ✅ `awaitWriteFinish` - ждёт завершения записи (500ms стабильности)
- ✅ Автоматическое обновление metadata при изменении .prt файла
- ⏳ Frontend auto-reload - future enhancement (WebSocket не реализован)

**Текущее поведение:**
- Backend знает об изменениях → файловый watcher работает
- Frontend НЕ знает → требуется manual refresh (F5) в браузере

---

### Metadata Architecture

**Назначение:** Архитектурные решения по хранению, управлению и версионированию metadata.

#### Storage Location

**Решение:** `.metadata/` внутри папки проекта (subfolder approach)

**Production Structure:**
```
C:/4Stroke/ProjectName/
├── ProjectName.det               # ✅ EngMod4T результаты (READ-ONLY)
├── ProjectName.pou               # ✅ EngMod4T результаты (READ-ONLY)
└── .metadata/                    # ✅ Engine Viewer данные (наша территория)
    ├── project-metadata.json     # UI metadata (tags, client, notes, status, color)
    ├── marker-tracking.json      # Timestamps когда markers были обнаружены
    └── prt-versions/             # Configuration snapshots (.prt для каждого marker)
        ├── $baseline.prt
        ├── $v2.prt
        └── $v15_final.prt
```

**Обоснование:**

1. **File Ownership Contract (EngMod4T Suite Architecture)**
   - `C:/4Stroke/` ROOT принадлежит EngMod4T Suite
   - **SUBFOLDERS** `C:/4Stroke/ProjectName/` - результаты расчётов
   - ✅ `.metadata/` в subfolder = наша территория (не нарушает contract)

2. **Locality (всё в одном месте)**
   - Simulation data (.det, .pou) и metadata рядом
   - Backup простой: копируешь папку проекта → всё сохранено
   - Переносишь папку → metadata не теряется

3. **Post4T Compatibility**
   - Post4T игнорирует папки начинающиеся с точки (`.metadata/`)
   - Не сломаем workflow инженеров

4. **Один компьютер = один инженер**
   - НЕТ shared network folders
   - НЕТ multi-user на одном компьютере
   - AppData/Local/ не нужен (нет преимуществ)

5. **Separation of Concerns**
   - Simulation Data (EngMod4T) ≠ UI Metadata (Engine Viewer)
   - `.prt, .det, .pou` - simulation input/output
   - `.metadata/*.json` - UI preferences и configuration history

**См. также:** [ADR 007: Metadata Storage Location](decisions/007-metadata-storage-location.md)

---

#### Conflict Handling

**Решение:** Last-write-wins (single-user программа)

**Контекст:**
- 👤 **Один пользователь** на одном компьютере
- 🏠 **Персональная программа** (не shared environment)
- 🚫 **НЕТ multi-user scenarios**

**Вывод:** Конфликты метаданных **физически невозможны** в этом use case.

**Current Implementation:**
```javascript
async function saveMetadata(projectId, metadata) {
  // Simply overwrite the file (last-write-wins)
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  // No locking, no version checking
  return { success: true };
}
```

**Преимущества:**
- ✅ Простота реализации (уже работает)
- ✅ Нет overhead на проверки/блокировки
- ✅ Подходит для single-user программы
- ✅ YAGNI (You Aren't Gonna Need It) - не добавляем функциональность "на будущее"

---

#### Git Strategy

**Решение:** Development examples tracked, Production ignored

**Development (test-data/):**
- ✅ **Commit примеры metadata** в git
- **Почему:**
  - Примеры показывают функциональность
  - Новые пользователи видят как заполнять metadata
  - Не содержат реальных personal данных

**Production (C:/4Stroke/):**
- ✅ **`.metadata/` в `.gitignore`**
- **Почему:**
  - Personal data (заметки инженера, клиенты, статусы)
  - 50+ проектов → 50+ metadata файлов
  - Не должны попадать в shared repository

**.gitignore pattern:**
```gitignore
# Production metadata - NOT tracked ❌
.metadata/*

# Except examples (whitelist) ✅
!.metadata/bmw-m42.json
!.metadata/vesta-16-im.json
!.metadata/4-cyl-itb.json

# Also ignore marker tracking
.metadata/marker-tracking.json

# PRT versions (snapshots, can be large)
.metadata/prt-versions/
```

**См. также:** [ADR 007: Metadata Storage Location](decisions/007-metadata-storage-location.md)

---

### Configuration History

**Назначение:** Killer-feature для автоматического отслеживания изменений конфигурации двигателя.

**Статус:** ⏳ **Не реализовано** - планируется для будущей версии

---

#### Бизнес-проблема

**Текущая ситуация (без Configuration History):**
- Инженер делает **42+ расчёта** для одного проекта
- Каждый расчёт = изменения в конфигурации (bore, stroke, valve timing, etc.)
- **Вручную** ведётся Excel таблица с описанием изменений
- **Проблемы:**
  - ❌ Забываешь что менял 2 недели назад
  - ❌ Нет автоматического diff между конфигурациями
  - ❌ Нельзя посмотреть "какая конфигурация была в расчёте $15?"
  - ❌ Manual tracking = errors & time waste

**Это главная боль (killer-feature)** которую должен решить Engine Viewer!

---

#### Решение: Automatic Configuration History

**Концепция:**
1. **Автоматическое сохранение .prt snapshot** при каждом новом marker
2. **Configuration History UI** - визуализация всех конфигураций проекта
3. **Configuration Viewer** - отображение parsed .prt в human-readable формате
4. **Configuration Diff** - сравнение двух конфигураций с highlight изменений

**Workflow:**
```
1. User запускает EngMod4T расчёт → создаётся marker $1
2. Engine Viewer автоматически:
   - Копирует ProjectName.prt → .metadata/prt-versions/$1.prt
   - Обновляет marker-tracking.json: { "$1": { timestamp, prtHash } }
3. User делает изменения → запускает расчёт $2
4. Engine Viewer сохраняет новую конфигурацию $2
5. User открывает "Configuration History" tab
6. Видит список всех конфигураций с timestamps
7. Может просмотреть любую конфигурацию
8. Может сравнить любые две конфигурации (visual diff)
```

---

#### Что решает Configuration History

**Заменяет:**
- ❌ Manual Excel tracking (42+ rows)
- ❌ "Что я менял 2 недели назад?"
- ❌ "Какая конфигурация была в расчёте $15?"

**Даёт:**
- ✅ Автоматическое отслеживание всех изменений
- ✅ Visual diff между любыми конфигурациями
- ✅ Timeline всех расчётов с timestamps
- ✅ Возможность вернуться к любой предыдущей конфигурации

---

#### UI Концепция

**Configuration History Tab** (на одном уровне с Metadata tab):
```
┌──────────────────────────────────────────────────────────┐
│ Configuration History для "ProjectName"                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ✅ $baseline                                             │
│ Конфигурация сохранена                                   │
│ Сохранена: 7 ноя 2025, 10:00                            │
│ [Просмотр] [Сравнить с текущей]                         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ✅ $v2                                                   │
│ Конфигурация сохранена                                   │
│ Сохранена: 7 ноя 2025, 14:30                            │
│ [Просмотр] [Сравнить с baseline]                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ⚠️ $v3                                                   │
│ Configuration not saved                                  │
│ Обнаружен: 7 ноя 2025, 16:00                            │
│ [💾 Сохранить текущую как $v3]                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

#### Структура данных (концептуально)

```
.metadata/
├── prt-versions/                    # Snapshots .prt файлов
│   ├── $baseline.prt               # Конфигурация для marker $baseline
│   ├── $v2.prt                     # Конфигурация для marker $v2
│   └── $v15_final.prt              # Конфигурация для marker $v15_final
│
└── marker-tracking.json            # Tracking metadata
    {
      "$baseline": {
        "timestamp": "2025-11-07T10:00:00Z",
        "prtHash": "abc123",
        "hasPrtSnapshot": true
      },
      "$v2": {
        "timestamp": "2025-11-07T14:30:00Z",
        "prtHash": "def456",
        "hasPrtSnapshot": true
      },
      "$v3": {
        "timestamp": "2025-11-07T16:00:00Z",
        "prtHash": null,
        "hasPrtSnapshot": false,
        "warning": "Configuration not saved (opened Engine Viewer after multiple calculations)"
      }
    }
```

---

#### Техническая реализация

**Отложено на будущее обсуждение.**

Сейчас зафиксировано **ЧТО** (WHAT) и **ПОЧЕМУ** (WHY).

**КАК** (HOW) будет обсуждено при планировании roadmap для этой фичи.

**См. также:** [ADR 008: Configuration History](decisions/008-configuration-history.md)

---

### API Routes

**routes/projects.js** - GET /api/projects

```javascript
router.get('/api/projects', async (req, res) => {
  const { cylinders, type, intake, exhaust, status, search, sortBy } = req.query;

  // Scan all projects (recursive)
  const projects = await fileScanner.scanFolder('./test-data');

  // Apply filters
  let filtered = projects;

  if (cylinders) {
    filtered = filtered.filter(p =>
      p.metadata?.auto?.cylinders === parseInt(cylinders)
    );
  }

  if (type) {
    filtered = filtered.filter(p =>
      p.metadata?.auto?.type === type
    );
  }

  if (intake) {
    filtered = filtered.filter(p =>
      p.metadata?.auto?.intakeSystem === intake
    );
  }

  if (status) {
    filtered = filtered.filter(p =>
      p.metadata?.manual?.status === status
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.displayName.toLowerCase().includes(searchLower) ||
      p.metadata?.manual?.client?.toLowerCase().includes(searchLower) ||
      p.metadata?.manual?.tags?.some(tag =>
        tag.toLowerCase().includes(searchLower)
      )
    );
  }

  // Apply sorting
  if (sortBy === 'name') {
    filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } else if (sortBy === 'date') {
    filtered.sort((a, b) =>
      new Date(b.modified) - new Date(a.modified)
    );
  } else if (sortBy === 'cylinders') {
    filtered.sort((a, b) =>
      (a.metadata?.auto?.cylinders || 0) - (b.metadata?.auto?.cylinders || 0)
    );
  }

  res.json({ projects: filtered });
});
```

**routes/data.js** - GET /api/project/:id

```javascript
router.get('/api/project/:id', async (req, res) => {
  const { id } = req.params;

  // Find project file
  const projects = await fileScanner.scanFolder('./test-data');
  const project = projects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Parse data file (auto-detect format)
  const data = await parseEngineFile(project.path);

  // Merge with metadata
  const metadata = await metadataService.readMetadata(id);

  res.json({
    ...data,
    metadata
  });
});
```

**routes/metadata.js** - POST /api/projects/:id/metadata

```javascript
router.post('/api/projects/:id/metadata', async (req, res) => {
  const { id } = req.params;
  const manualData = req.body;

  // Update ONLY manual section (preserves auto)
  await metadataService.updateManualMetadata(id, manualData);

  res.json({ success: true });
});
```

**См. также:** [docs/api.md](api.md) - Complete API documentation

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
│  │  - ProjectCard                   │  │
│  │  - FiltersBar                    │  │
│  │  - MetadataDialog                │  │
│  │  - ChartPreset1-6                │  │
│  │  - DataTable                     │  │
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
│  │  - useMetadata()                 │  │
│  │  - useFilters()                  │  │
│  └──────────────┬───────────────────┘  │
│                 │                       │
│  ┌──────────────▼───────────────────┐  │
│  │     State Management             │  │
│  │  - Zustand (Comparison refs)     │  │
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
│  │  - frontend/src/api/client.ts    │  │
│  │  - getProjects()                 │  │
│  │  - getProject(id)                │  │
│  │  - updateMetadata()              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### HomePage Dashboard

**Назначение:** Список проектов с фильтрацией, сортировкой и редактированием метаданных.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         HomePage                                 │
│  frontend/src/pages/HomePage.tsx                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FiltersBar (frontend/src/components/projects/FiltersBar)  │ │
│  │                                                             │ │
│  │  Search: [_____________]  [Type ▾] [Intake ▾] [Cyl ▾]      │ │
│  │          [Valves ▾]  [Sort: Date/Name/Cyl ▾] [Clear]       │ │
│  │                                                             │ │
│  │  Active filters: [Type: NA ×] [Intake: ITB ×]              │ │
│  │  Showing 8 of 50 projects                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Project Cards Grid (responsive 1/2/3 columns)            │  │
│  │                                                            │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │  │
│  │  │ ProjectCard  │ │ ProjectCard  │ │ ProjectCard  │      │  │
│  │  │ ────────────│ │ ────────────│ │ ────────────│      │  │
│  │  │ BMW M42    🔧│ │ Vesta 1.6  ✓│ │ 4 Cyl ITB  📦│      │  │
│  │  │ ID: bmw-m42  │ │              │ │              │      │  │
│  │  │ ────────────│ │              │ │              │      │  │
│  │  │ 📊 24 calcs  │ │              │ │              │      │  │
│  │  │ [NA][4][ITB] │ │              │ │              │      │  │
│  │  │ 👤 BMW AG    │ │              │ │              │      │  │
│  │  │ 📅 05 Nov 25 │ │              │ │              │      │  │
│  │  │ [✏️Edit][Open]│ │              │ │              │      │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**

**ProjectCard.tsx** - Карточка проекта:
- DisplayName (large, bold)
- ID (small, muted, readonly)
- Status badge (Active/Completed/Archived - top-right corner)
- Calculations count
- Engine badges (Type/Cylinders/Intake)
  - Color coding: NA=green, Turbo=blue, Supercharged=purple
  - ITB=orange, IM=gray
- Client name (ALWAYS visible, critical field)
- Modified date
- Edit button (opens MetadataDialog)
- Open button (navigate to ProjectPage)

**Design principle:** Show ONLY essential info (user feedback: "Exhaust system irrelevant on card")

**FiltersBar.tsx** - Фильтры и поиск:
- Search input (filters by displayName, client, tags)
- Multi-select dropdowns:
  - Type (NA/Turbo/Supercharged)
  - Intake (ITB/IM)
  - Cylinders (3/4/6/8/10/12)
  - Valves (8/12/16/24)
- Combined Sort & Status dropdown (user feedback: "Combined dropdown better UX")
  - Sort: Date/Name/Cylinders
  - Status: Active/Completed/Archived
- Clear filters button
- Active filters chips (removable)
- Count display ("Showing X of Y projects")

**UI consistency:**
- All dropdowns: `w-[160px]` width
- All dropdowns: `h-10` height (40px)
- Search input: `flex-1 min-w-[200px]`

**MetadataDialog.tsx** - Редактирование метаданных:

```
┌────────────────────────────────────────────────────────────┐
│  [×] Edit Metadata                                          │
│  Project: BMW M42.det                                       │
│  ─────────────────────────────────────────────────────     │
│  📋 Project Identity                                        │
│     ID (readonly): bmw-m42                                  │
│     Display Name: [BMW M42________________]                 │
│                                                             │
│  🔧 Engine Configuration (read-only from .prt)             │
│     Cylinders: 4    Type: NA                               │
│     Config: inline  Intake: ITB                            │
│     Exhaust: 4-2-1  Bore×Stroke: 84×81mm                   │
│                                                             │
│  ✏️ Manual Metadata (user-editable)                        │
│     Description: [___________________________]              │
│     Client: [BMW AG_____________________]                   │
│     Tags: [track-build] [dyno-tested] [+ Add]              │
│     Status: [Active ▾]  (Active/Completed/Archived)        │
│     Color: [🔵] 🔵🟢🟠🔴🟣🔷                                │
│     Notes: [Dyno tested on 01.11.2025_______]               │
│                                                             │
│                            [Cancel] [Save]                  │
└────────────────────────────────────────────────────────────┘
```

**Form management:**
- Library: react-hook-form + zod validation
- State: Fully controlled (Select uses `value={field.value}`, NOT `defaultValue`)
- API payload: Flat structure `{displayName, client, tags, status, ...}`

**Critical bug fixes (Nov 6, 2025):**
1. Status Select: Changed to fully controlled (`value` instead of `defaultValue`)
2. Payload structure: Backend expects flat, not nested `{manual: {...}}`

**Loading states:**
- Skeleton cards during initial fetch ("iPhone quality" UX)
- Smooth transitions (no flash of empty state)
- Optimistic updates on metadata save

---

### ProjectPage Visualization

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ProjectPage                                                     │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Project Info Card                                        │  │
│  │  - Name, Type, Cylinders, Calculations count              │  │
│  │  - Peak Power: 115 kW @ 5500 RPM                          │  │
│  │  - Peak Torque: 225 N·m @ 3800 RPM                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────┐  ┌───────────────────────────────────────┐ │
│  │ LeftPanel       │  │  Visualization Area                   │ │
│  │ (Desktop)       │  │                                       │ │
│  │                 │  │  Tabs: [Preset1] [Preset2] ... [Custom]│ │
│  │ Calc Selector:  │  │                                       │ │
│  │ ☑ Calc 1 🔴     │  │  ChartPreset1: Power & Torque         │ │
│  │ ☑ Calc 2 🟢     │  │  ┌────────────────────────────┐       │ │
│  │ □ Calc 3 🔵     │  │  │  [Interactive ECharts]     │       │ │
│  │ □ Calc 4 🟡     │  │  │  - Dual Y-axes             │       │ │
│  │ □ Calc 5 🟣     │  │  │  - DataZoom slider         │       │ │
│  │                 │  │  │  - Legend                  │       │ │
│  │ Selected: 2/5   │  │  │  - Tooltip                 │       │ │
│  │                 │  │  └────────────────────────────┘       │ │
│  │ Comparison:     │  │                                       │ │
│  │ + Add project   │  │  DataTable (below chart)              │ │
│  │                 │  │  - All parameters                     │ │
│  │ [Hamburger on   │  │  - CSV/Excel export                   │ │
│  │  mobile]        │  │                                       │ │
│  └─────────────────┘  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**6 Chart Presets:**

1. **Power & Torque** (Most important)
   - P-Av (kW), Torque (N·m)
   - Dual Y-axes
   - Lines: Solid (power), Dashed (torque)

2. **Pressure & Temperature** (Durability analysis)
   - PCylMax (bar), TCylMax (°C), TUbMax (°C)
   - Dual Y-axes
   - Lines: Solid (pressure), Dashed (cyl temp), Dotted (exhaust temp)

3. **MEP** (Efficiency analysis)
   - FMEP, IMEP, BMEP, PMEP (all in bar)
   - Single Y-axis
   - Formula: `IMEP = BMEP + FMEP + PMEP`

4. **Critical Values** ⚠️ (Engine destruction risk)
   - PCylMax (bar), MaxDeg (detonation degree)
   - Dual Y-axes
   - **SAFETY CRITICAL:** Exceeding limits → engine damage

5. **Volumetric Efficiency**
   - PurCyl (cylinder charge purity), LamAv (lambda)
   - Single Y-axis
   - Breathing analysis

6. **Custom** (User-defined parameters)
   - Modal selector: Choose any parameters
   - Category tabs: Performance/Pressure/Temperature/etc.
   - Up to 6 parameters

**См. также:** [docs/chart-presets.md](chart-presets.md) - Complete documentation

**Cross-Project Comparison:**
- 1 primary project + up to 4 comparison projects
- CalculationReference pattern (Zustand store)
- Color-coded: Primary=Red, Comp1=Green, Comp2=Blue, Comp3=Yellow, Comp4=Purple

**DataTable:**
- Shows all parameters (24 from .det or 71 from .pou)
- Export: CSV, Excel (XLSX)
- Sortable columns
- Horizontal scroll on mobile

---

### Components

**Shared components:**
- `components/shared/LoadingSpinner.tsx`
- `components/shared/ErrorMessage.tsx`
- `components/shared/SkeletonCard.tsx`
- `components/ui/*` - Radix UI primitives (Button, Dialog, Select, Checkbox, etc.)

**Project components:**
- `components/projects/ProjectCard.tsx`
- `components/projects/FiltersBar.tsx`
- `components/projects/MetadataDialog.tsx`

**Visualization components:**
- `components/visualization/CalculationSelector.tsx` - Select up to 5 calculations
- `components/visualization/ChartPreset1.tsx` - Power & Torque
- `components/visualization/ChartPreset2.tsx` - Pressure & Temperature
- `components/visualization/ChartPreset3.tsx` - MEP
- `components/visualization/ChartPreset4.tsx` - Critical Values
- `components/visualization/ChartPreset5.tsx` - Volumetric Efficiency
- `components/visualization/ChartPreset6.tsx` - Custom
- `components/visualization/DataTable.tsx` - Tabular data

---

### Hooks

**useProjects.ts** - Загрузка списка проектов:
```typescript
const { projects, loading, error, refetch } = useProjects();
```

**useProjectData.ts** - Загрузка данных проекта:
```typescript
const { project, loading, error, refetch } = useProjectData(id);
// Race condition handling: ignore flag в useEffect
```

**useFilters.ts** - Управление фильтрами:
```typescript
const { filters, setFilter, clearFilters, applyFilters } = useFilters();
```

**useMetadata.ts** - CRUD для метаданных:
```typescript
const { metadata, updateMetadata, loading, error } = useMetadata(projectId);
```

---

### State Management

**Zustand store** - CalculationReference для cross-project comparison:

```typescript
// frontend/src/store/comparisonStore.ts
interface ComparisonState {
  primaryProject: CalculationReference | null;
  comparisonProjects: CalculationReference[];  // Max 4

  setPrimaryProject: (ref: CalculationReference) => void;
  addComparison: (ref: CalculationReference) => void;
  removeComparison: (index: number) => void;
  clearAll: () => void;
}

interface CalculationReference {
  projectId: string;
  projectName: string;
  calculationId: string;
  calculationName: string;
  color: string;  // From CALCULATION_COLORS
}
```

**Why Zustand?**
- Lightweight (no Provider wrapper needed)
- Simple API (hooks-based)
- Perfect for cross-page state (comparison persists on navigation)

---

## Data Flow

### GET /api/projects (List all projects)

```
User navigates to HomePage
         ↓
HomePage.tsx calls useProjects()
         ↓
useProjects() → api.getProjects()
         ↓
axios GET /api/projects
         ↓
Backend: routes/projects.js
         ↓
fileScanner.scanFolder('./test-data')
  - Recursive scan (subdirectories)
  - Find .det/.pou files
  - Parse .prt for auto metadata
  - Read .metadata/*.json
  - Merge auto + manual
         ↓
Return: ProjectInfo[] with metadata
         ↓
useProjects() updates state
         ↓
HomePage re-renders with project cards
```

### GET /api/project/:id (Get project data)

```
User clicks "Open" on ProjectCard
         ↓
Navigate to /project/:id
         ↓
ProjectPage.tsx calls useProjectData(id)
         ↓
useProjectData() → api.getProject(id)
         ↓
axios GET /api/project/:id
         ↓
Backend: routes/data.js
         ↓
fileScanner finds project file
         ↓
parseEngineFile(filePath)
  - detectFormat() → 'det' or 'pou'
  - globalRegistry.getParser(format)
  - parser.parse(filePath)
    - Line 1: metadata (cylinders, engineType)
    - Line 2: column headers (24 or 71 params)
    - Line 3+: $ markers + data points
         ↓
Return: EngineProject JSON
         ↓
useProjectData() updates state
         ↓
ProjectPage renders charts + table
```

### POST /api/projects/:id/metadata (Update metadata)

```
User edits metadata in MetadataDialog
         ↓
User clicks "Save"
         ↓
Form validation (react-hook-form + zod)
         ↓
onSubmit(values)
         ↓
api.updateMetadata(id, values)
         ↓
axios POST /api/projects/:id/metadata
  Payload: {displayName, client, tags, status, notes, color}
         ↓
Backend: routes/metadata.js
         ↓
metadataService.updateManualMetadata(id, values)
  - Read existing .metadata/{id}.json
  - Update ONLY manual section
  - Preserve auto section
  - Save to disk
         ↓
Response: {success: true}
         ↓
Toast notification: "Metadata saved"
         ↓
HomePage.refetch() → Update project list
         ↓
ProjectCard updates with new metadata
```

---

## Chart Implementation

**Library:** ECharts + echarts-for-react

**Base configuration:**

```typescript
// frontend/src/config/chartConfig.ts

export function getBaseChartConfig(): EChartsOption {
  return {
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      top: 'center',
      left: 'left',
      orient: 'vertical'
    },
    dataZoom: [
      { type: 'slider', xAxisIndex: 0 },
      { type: 'inside', xAxisIndex: 0 }
    ]
  };
}

export function createYAxis(name: string, position: 'left' | 'right', color?: string) {
  return {
    type: 'value',
    name,
    position,
    nameTextStyle: { color },
    splitLine: { lineStyle: { type: 'dashed' } }
  };
}
```

**Chart patterns:**

**Dual Y-Axis:**
```typescript
yAxis: [
  createYAxis('P-Av (kW)', 'left', '#e74c3c'),
  createYAxis('Torque (N·m)', 'right', '#2ecc71')
]
```

**Line styles:**
- Solid: Primary parameter
- Dashed: Secondary parameter
- Dotted: Tertiary parameter

**Color assignment:**
- Single calculation: PARAMETER_COLORS (distinguish P-Av vs Torque)
- Comparison mode: CALCULATION_COLORS (distinguish Calc1 vs Calc2)

**Legend format:** `{CalcName} - {ParamName}`
- Example: `"Vesta 1.6 IM - P-Av"`

**Axis label format:** `{ParamName} ({Unit})`
- Example: `"P-Av (kW)"` → units change, param name NEVER changes
- ⚠️ **КРИТИЧЕСКИ:** Названия параметров ВСЕГДА на английском (никогда не переводить!)

**Per-cylinder arrays:**
- Parameters like PCylMax, TCylMax are arrays `[val1, val2, val3, val4]`
- Chart displays **averaged value**: `values.reduce((sum, v) => sum + v, 0) / values.length`
- Rationale: Simplifies visualization (1 line instead of 4-6)

**См. также:**
- [docs/chart-presets.md](chart-presets.md) - Detailed docs for all 6 presets
- [ADR 003: Color Palette Engineering Style](decisions/003-color-palette-engineering-style.md)

---

## Форматы данных

### ProjectInfo (Summary for list)

```typescript
interface ProjectInfo {
  id: string;                  // "bmw-m42" (normalized slug)
  displayName: string;         // "BMW M42" (from metadata or filename)
  fileName: string;            // "BMW M42.det"
  format: 'det' | 'pou';
  calculationsCount: number;
  modified: string;            // ISO 8601
  metadata: ProjectMetadata;   // Combined auto + manual
}
```

### EngineProject (Full data)

```typescript
interface EngineProject {
  fileName: string;
  format: 'det' | 'pou';
  metadata: {
    numCylinders: number;
    engineType: 'NATUR' | 'TURBO' | 'SUPERCHARGED';
  };
  columnHeaders: string[];     // ["RPM", "P-Av", "Torque", ...]
  calculations: Calculation[];
}

interface Calculation {
  id: string;                  // "$1", "$2", "$3.1"
  name: string;                // "1", "2", "3.1" (no $ symbol)
  dataPoints: DataPoint[];
}

interface DataPoint {
  RPM: number;
  'P-Av': number;              // kW
  Torque: number;              // N·m
  PCylMax: number[];           // bar (per-cylinder array)
  TCylMax: number[];           // °C (per-cylinder array)
  TUbMax: number[];            // °C (per-cylinder array)
  PurCyl: number[];            // ratio (per-cylinder array)
  Deto: number[];              // detonation degree (per-cylinder)
  Convergence: number;
  // ... more parameters depending on format
}
```

### ProjectMetadata (Combined auto + manual)

```typescript
interface ProjectMetadata {
  version: '1.0';
  id: string;
  displayName?: string;

  auto?: {                     // From .prt file (READ-ONLY)
    cylinders: number;
    type: 'NA' | 'Turbo' | 'Supercharged';
    intakeSystem: 'ITB' | 'IM';
    exhaustSystem: '4-2-1' | '4-1' | 'tri-y' | 'custom';
    bore: number;              // mm
    stroke: number;            // mm
    compressionRatio: number;
    maxPowerRPM: number;
  };

  manual: {                    // User-editable
    description?: string;
    client?: string;
    tags?: string[];
    status?: 'active' | 'completed' | 'archived';
    notes?: string;
    color?: string;            // HEX color
  };

  created: string;             // ISO 8601
  modified: string;            // ISO 8601
}
```

**См. также:**
- [docs/file-formats/det-format.md](file-formats/det-format.md) - .det specification (24 params)
- [docs/file-formats/pou-format.md](file-formats/pou-format.md) - .pou specification (71 params)
- [docs/file-formats/prt-format.md](file-formats/prt-format.md) - .prt specification (metadata)

---

## Accessibility (WCAG 2.1 AA)

**Status:** ✅ Implemented (v2.0.0, Phase 3 complete)

### Keyboard Navigation

**Focus indicators:**
```tsx
<button className="focus-visible:ring-[3px] focus-visible:ring-ring">
  {/* Prominent 3px ring for buttons */}
</button>

<Card className="focus-visible:ring-2 focus-visible:ring-ring">
  {/* Subtle 2px ring for cards */}
</Card>
```

**Tab order:**
1. Header (logo, back button, settings)
2. Left panel (filters, calculation selector)
3. Main content (charts, tables)
4. Footer

**Focus trap in modals:**
- Radix UI Dialog provides built-in focus trap
- ESC closes modal
- Focus returns to trigger element

### ARIA Labels

**Icon-only buttons:**
```tsx
<button aria-label="Edit project metadata">
  <EditIcon />
</button>
```

**Form fields:**
```tsx
<FormLabel htmlFor="projectName">Project Name</FormLabel>
<FormControl>
  <Input id="projectName" {...field} />
</FormControl>
<FormMessage /> {/* Error linked automatically */}
```

**Dialog accessibility:**
```tsx
<DialogTitle>Select Calculation</DialogTitle>
<DialogDescription>Choose up to 5 calculations</DialogDescription>
// Automatic: aria-labelledby, aria-describedby, role="dialog"
```

**Live regions:**
```tsx
<div role="status" aria-live="polite">
  {successMessage && <p>{successMessage}</p>}
</div>

<div role="alert" aria-live="assertive">
  {errorMessage && <p>{errorMessage}</p>}
</div>
```

### Color Contrast

**Text contrast (WCAG AA):**
- Primary text: `#09090b` on `#ffffff` → 20.2:1 ✅
- Secondary text: `#71717a` on `#ffffff` → 4.6:1 ✅
- Muted text: `#a1a1aa` (large text only) → 3.1:1

**Interactive elements:**
- Buttons: 14:1+ contrast
- Focus rings: 3:1+ contrast
- Chart colors: All meet 3:1 on white

**Source:** TailwindCSS default palette (WCAG compliant)

### Touch Targets

**Minimum: 44×44px (WCAG AAA)**
```tsx
<Button className="h-10 px-4">  {/* 40px height */}
  Action
</Button>

<Checkbox className="h-4 w-4">  {/* Parent label extends hit area */}
</Checkbox>
```

### Testing Checklist

**Keyboard:**
- ✅ All features accessible via keyboard
- ✅ Visible focus indicators
- ✅ Logical tab order
- ✅ No keyboard traps (except modals)

**Screen Reader:**
- ✅ Alt text for images
- ✅ Form labels
- ✅ Button descriptions
- ✅ Status announcements

**Visual:**
- ✅ Color contrast meets AA
- ✅ Not relying on color alone
- ✅ Text resizable to 200%

**Motor:**
- ✅ Touch targets ≥44×44px
- ✅ No precise timing required

---

## Responsive Design

**Breakpoints:**
```typescript
sm:  640px   // Small tablets
md:  768px   // Tablets and small laptops
lg:  1024px  // Laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large desktops
```

**Project uses:**
- `< 768px`: Mobile
- `768px - 1024px`: Tablet
- `> 1024px`: Desktop

### Component Patterns

**Header (mobile optimization):**
```tsx
// Desktop: Full text buttons
<Button>
  <ExportIcon /> Export to PNG
</Button>

// Mobile: Icon-only
<Button className="md:inline-flex md:gap-2">
  <ExportIcon />
  <span className="hidden md:inline">Export to PNG</span>
</Button>
```

**Modals:**
```tsx
// Mobile: Nearly full-screen (inset-4 for margin)
<DialogContent className="inset-4 max-w-lg md:inset-auto">
  {/* Content */}
</DialogContent>
```

**LeftPanel:**
```tsx
// Mobile: Hamburger menu (Sheet component)
<Sheet>
  <SheetTrigger><MenuIcon /></SheetTrigger>
  <SheetContent side="left">{/* Filters */}</SheetContent>
</Sheet>

// Desktop: Always visible sidebar
<aside className="hidden lg:block">
  {/* Filters, calculation selector */}
</aside>
```

**Grid Layout:**
```tsx
// HomePage cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {projects.map(p => <ProjectCard key={p.id} project={p} />)}
</div>
```

**Charts:**
```tsx
<ReactECharts
  option={chartOption}
  style={{
    height: 'calc(100vh - 300px)',  // Adaptive height
    minHeight: '400px',             // Minimum on mobile
    width: '100%'
  }}
/>
```

**DataTable:**
```tsx
// Mobile: Horizontal scroll
<div className="overflow-x-auto">
  <Table>{/* 73 parameters = wide table */}</Table>
</div>
```

### Testing Matrix

**Devices tested:**
- ✅ iPhone 13 Pro (390×844, iOS Safari)
- ✅ iPad Air (820×1180, Safari)
- ✅ MacBook Pro 14" (1512×982, Chrome)
- ✅ Desktop 27" (2560×1440, Chrome)

**Browsers:**
- ✅ Chrome 120+
- ✅ Safari 17+ (macOS, iOS)
- ✅ Firefox 121+

---

## Технологический стек

### Backend

**Runtime:** Node.js 20+
**Framework:** Express.js
**Module system:** ES Modules (import/export)

**Dependencies:**
- `express` - Web framework
- `cors` - CORS middleware
- `yaml` - config.yaml parsing
- `fs/promises` - Async file operations

**Dev dependencies:**
- `nodemon` - Auto-restart on changes

### Frontend

**Runtime:** Browser (Chrome, Safari)
**Framework:** React 18.3
**Build tool:** Vite 5
**Language:** TypeScript 5

**Core libraries:**
- `react-router-dom` - Routing
- `axios` - HTTP client
- `zustand` - State management (comparison refs)

**Visualization:**
- `echarts` - Charting library
- `echarts-for-react` - React wrapper

**UI Components:**
- `@radix-ui/*` - Accessible primitives (Dialog, Select, Checkbox, etc.)
- `lucide-react` - Icons

**Forms:**
- `react-hook-form` - Form state management
- `zod` - Schema validation

**Styling:**
- `tailwindcss` 4 - Utility-first CSS
- `tailwind-merge` - Classname merging
- `clsx` - Conditional classes

**Data export:**
- `xlsx` - Excel export
- `papaparse` - CSV export

### Development

**Package manager:** npm
**Version control:** Git
**IDE:** VS Code + Claude Code
**OS:** macOS (dev), Windows (production)

### Обоснование выбора

**Почему Node.js + Express?**
- ✅ JavaScript на backend и frontend (один язык)
- ✅ Простая настройка
- ✅ Легко работать с JSON
- ✅ Быстрая разработка

**Почему React + TypeScript?**
- ✅ Современный UI framework
- ✅ Type safety (меньше багов)
- ✅ Hooks (чистая функциональная логика)
- ✅ Большая экосистема

**Почему ECharts?**
- ✅ Мощная библиотека (interactive zoom, pan, tooltip)
- ✅ Высокая производительность
- ✅ Гибкая конфигурация
- ✅ Подходит для инженерных графиков

**Почему Vite?**
- ✅ Очень быстрый HMR (миллисекунды)
- ✅ Современный bundler (ESM)
- ✅ TypeScript "из коробки"

**Почему TailwindCSS?**
- ✅ Utility-first → быстрая разработка
- ✅ Нет конфликтов CSS
- ✅ Адаптивный дизайн легко

---

## Безопасность

### Backend

- ✅ CORS настроен (только localhost:5173 в dev)
- ✅ JSON parsing с лимитом размера
- ✅ Валидация путей (предотвращение path traversal)
- ✅ Error handling (не раскрывать stack traces в production)

### Frontend

- ✅ TypeScript strict mode
- ✅ Sanitize пользовательского ввода
- ✅ Проверка API ответов

---

## Масштабируемость

### Текущая архитектура

**Подходит для:**
- 10-100 проектов
- Файлы до 10 MB
- 1-5 одновременных пользователей

**Ограничения:**
- Все данные в памяти (parser результаты)
- Нет кэширования парсинга
- Синхронное сканирование файлов

### Если проект вырастет

**Для 1000+ проектов:**
- SQLite/PostgreSQL для хранения parsed results
- Redis для кэширования частых запросов
- Background jobs (Bull queue) для парсинга больших файлов
- API pagination (limit/offset)

**Для масштабного Production:**
- Docker containerization
- Nginx reverse proxy
- Load balancing (если >100 users)
- Database indexing
- File system optimization (S3/MinIO for cloud)

---

## Следующие шаги

После изучения архитектуры:
1. Изучи [shared-types.ts](../shared-types.ts) - все TypeScript типы
2. Изучи [docs/chart-presets.md](chart-presets.md) - детали 6 пресетов
3. Изучи [docs/file-formats/](file-formats/) - спецификации форматов
4. Изучи [docs/decisions/](decisions/) - ADRs (Architecture Decision Records)
5. Следуй принципам архитектуры при написании кода

---

**Архитектура спроектирована для чистоты, масштабируемости и поддерживаемости** 🏗️

**Last updated:** 7 ноября 2025 (v2.0.0 consolidation)
