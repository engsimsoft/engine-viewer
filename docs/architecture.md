# Engine Results Viewer - Полная архитектура

**Версия:** 3.0.0
**Дата:** 9 ноября 2025
**Статус:** Production-ready (v3.0.0, Phase 2.0 complete - 3-Level Routing, Deep Linking, Project Overview)

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
  - [ProjectOverviewPage](#projectoverviewpage)
  - [PerformancePage Visualization](#performancepage-visualization)
  - [Components](#components)
  - [Hooks](#hooks)
  - [State Management](#state-management)
  - [Routing Architecture](#routing-architecture)
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

**PerformancePage Visualization (100%):**
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
│  │   HomePage   │   │  Overview    │   │ Performance  │       │
│  │              │   │   Page       │   │    Page      │       │
│  │ - Filters    │   │ - Analysis   │   │ - Charts     │       │
│  │ - Cards      │   │   Type Cards │   │ - Selector   │       │
│  │ - Metadata   │   │ - Router     │   │ - Table      │       │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
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
│  │  - fileModifier.js               │  │
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
- Initialization of PRT parsing queue (background processing)

**config.js** - Загрузка конфигурации
- Чтение config.yaml
- Парсинг YAML → JavaScript объект
- Валидация настроек
- Экспорт для приложения

**prtQueue.js** - Background queue для парсинга .prt файлов (NEW in v2.1)
- `PrtParsingQueue` class (extends EventEmitter)
- Concurrency control: max 3 files simultaneously (p-queue)
- Priority system: high (file watcher) vs low (startup scan)
- Deduplication: prevents same projectId from queueing twice
- Event-driven progress tracking (emit 'progress' events)
- Global singleton pattern: `getGlobalQueue()` for shared instance
- Status API: `getStatus()` returns `{total, pending, completed}`

**metadataService.js** - Управление метаданными проектов
- `getMetadata(projectId)` - Read metadata from `.metadata/{id}.json`
- `saveMetadata(projectId, metadata)` - Write metadata to disk
- `updateAutoMetadata(id, autoData)` - Update "auto" section only (from .prt)
- `updateManualMetadata(id, manualData)` - Update "manual" section only (user edits)
- **Race condition protection** (NEW in v2.1): async-mutex per projectId
  - `getOrCreateMutex(projectId)` - One mutex per project
  - `mutex.runExclusive()` - Serialize writes to same file
  - Prevents JSON corruption during concurrent writes

**fileScanner.js** - Сканирование директории с проектами
- `scanProjects(dirPath)` - Recursive directory scan
- `shouldParsePrt(prtPath, projectId)` - Cache validation (NEW in v2.1)
  - Compares .prt `mtime` vs metadata `modified` timestamp
  - Returns `true` if .prt is newer (needs re-parsing)
  - Returns `false` if cache is valid (skip parsing)
- File watcher integration with cache checks (ignoreInitial: true)

**fileModifier.js** - Безопасная модификация .det/.pou файлов (NEW in v3.3.1)
- `renameCalculationInProject(projectDir, baseName, oldId, newId)` - Переименование расчёта в обоих файлах
- `deleteCalculationInProject(projectDir, baseName, calculationId)` - Удаление расчёта из обоих файлов
- `renameCalculation(filePath, oldId, newId)` - Atomic rename в одном файле
- `deleteCalculation(filePath, calculationId)` - Atomic delete в одном файле
- **Atomic Write Pattern:**
  1. Read original → lines[]
  2. Apply modification → modifiedLines[]
  3. Write to .tmp file
  4. Validate .tmp (parse через detParser/pouParser)
  5. Atomic replace: original → .backup, .tmp → original
  6. Rollback on error (restore from .backup)
- **Dual-file synchronization:**
  - .pou файл (PRIMARY) - всегда модифицируется
  - .det файл (SECONDARY) - модифицируется только если существует
  - Rollback обоих файлов если ошибка при .det
  - Backup создаётся для каждого модифицированного файла
- **См. также:** [ADR-015](decisions/015-calculation-management.md) для детальной архитектуры

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
│  - intakeSystem (ITB, IM, Carb) ← Text pattern detection        │
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
  intakeSystem: 'ITB' | 'IM' | 'Carb';  // ITB = Individual throttle bodies, IM = Intake Manifold, Carb = Carburetor/Collector
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

**Intake System Detection (3 types: ITB, IM, Carb):**

Engine Viewer поддерживает три типа intake систем:
- **Carb** (Carburetor/Collector) - collected intake pipes (4into1 collector)
- **ITB** (Individual Throttle Bodies) - separate pipes, no airboxes, throttles per cylinder
- **IM** (Intake Manifold) - separate pipes with common airbox/plenum

**Detection Logic (Priority Order):**

```javascript
// Priority 1: Check "collected intake pipes" → Carb
if (intakeText.includes('collected intake pipes')) {
  return 'Carb';
}

// Priority 2: Check "seperate intake pipes"
if (intakeText.includes('seperate intake pipes')) {
  // ITB: separate + no airboxes + throttles
  if (intakeText.includes('with no airboxes') && intakeText.includes('but with throttles')) {
    return 'ITB';
  }

  // IM: separate + common airbox/plenum
  if (intakeText.includes('with a common airbox') || intakeText.includes('with a common plenum')) {
    return 'IM';
  }
}

// Priority 3: Fallback heuristics (для старых .prt файлов)
if (throttles === numCylinders && airboxes === 0) {
  return 'ITB';
}

// Default: IM
return 'IM';
```

**См. также:** [ADR 007: Carburetor (Carb) Intake System Support](decisions/007-carb-intake-system-support.md) - полная документация detection logic

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

**См. также:** [ADR 008: Metadata Storage Location](decisions/008-metadata-storage-location.md)

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

**См. также:** [ADR 008: Metadata Storage Location](decisions/008-metadata-storage-location.md)

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

**См. также:** [ADR 009: Configuration History](decisions/009-configuration-history.md)

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

**routes/data.js** - GET /api/project/:id/summary (NEW in v3.0)

```javascript
router.get('/api/project/:id/summary', async (req, res) => {
  const { id } = req.params;

  // Find project
  const projects = await fileScanner.scanFolder('./test-data');
  const project = projects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Check availability for each analysis type
  const summary = {
    projectId: id,
    displayName: project.displayName,
    analysisTypes: {
      performance: {
        available: project.hasDetOrPou,
        description: 'Power & Torque curves, MEP analysis'
      },
      traces: { available: false, description: 'Pressure/Temperature traces' },
      pvDiagrams: { available: false, description: 'PV diagrams' },
      noise: { available: false, description: 'SPL predictions' },
      turbo: { available: false, description: 'Turbo maps' },
      configuration: { available: false, description: 'Config history' }
    }
  };

  res.json(summary);
});
```

**Purpose:** Powers ProjectOverviewPage - shows which analysis types are available.

**Response format:**
```json
{
  "projectId": "vesta-16-im",
  "displayName": "Vesta 1.6 IM",
  "analysisTypes": {
    "performance": {
      "available": true,
      "description": "Power & Torque curves, MEP analysis"
    }
  }
}
```

**routes/metadata.js** - POST /api/projects/:id/metadata

```javascript
router.post('/api/projects/:id/metadata', async (req, res) => {
  const { id} = req.params;
  const manualData = req.body;

  // Update ONLY manual section (preserves auto)
  await metadataService.updateManualMetadata(id, manualData);

  res.json({ success: true });
});
```

**routes/data.js** - PUT /api/project/:id/calculations/:calculationId (NEW in v3.3.1)

```javascript
router.put('/project/:id/calculations/:calculationId', async (req, res) => {
  const { id, calculationId } = req.params;
  const { newId } = req.body;

  // Find project and get both .pou/.det files
  const projectDir = path.dirname(matchedFileInfo.path);
  const baseName = matchedFileInfo.name.replace(/\.(det|pou)$/i, '');

  // Rename in BOTH .pou and .det files (atomic + rollback)
  const result = await fileModifier.renameCalculationInProject(
    projectDir,
    baseName,
    calculationId,
    newId
  );

  res.json({
    success: true,
    data: {
      projectId: id,
      oldId: calculationId,
      newId: newId,
      pouBackup: result.pouResult.backupPath,
      detBackup: result.detResult?.backupPath  // optional
    }
  });
});
```

**Response format:**
```json
{
  "success": true,
  "data": {
    "projectId": "4-cyl-itb",
    "oldId": "$1 ExSys 4-2-1",
    "newId": "$baseline",
    "pouBackup": "/path/4_Cyl_ITB.pou.backup",
    "detBackup": "/path/4_Cyl_ITB.det.backup"
  }
}
```

**Error responses:**
- `400 INVALID_MARKER_ID` - Invalid marker format (e.g., contains tabs/newlines)
- `404 CALCULATION_NOT_FOUND` - Calculation not found in file
- `409 MARKER_ID_EXISTS` - New marker ID already exists
- `500 FILE_WRITE_ERROR` - Error during atomic write/rollback

**routes/data.js** - DELETE /api/project/:id/calculations/:calculationId (NEW in v3.3.1)

```javascript
router.delete('/project/:id/calculations/:calculationId', async (req, res) => {
  const { id, calculationId } = req.params;

  // Validate: cannot delete last calculation
  if (calculations.length <= 1) {
    return res.status(400).json({
      error: {
        code: 'CANNOT_DELETE_LAST_CALCULATION',
        message: 'Cannot delete the last calculation in project'
      }
    });
  }

  // Delete from BOTH .pou and .det files (atomic + rollback)
  const result = await fileModifier.deleteCalculationInProject(
    projectDir,
    baseName,
    calculationId
  );

  res.json({
    success: true,
    data: {
      projectId: id,
      deletedId: calculationId,
      linesDeleted: result.pouResult.linesDeleted,
      pouBackup: result.pouResult.backupPath,
      detBackup: result.detResult?.backupPath
    }
  });
});
```

**Response format:**
```json
{
  "success": true,
  "data": {
    "projectId": "4-cyl-itb",
    "deletedId": "$2",
    "linesDeleted": 15,
    "pouBackup": "/path/4_Cyl_ITB.pou.backup",
    "detBackup": "/path/4_Cyl_ITB.det.backup"
  }
}
```

**Error responses:**
- `400 CANNOT_DELETE_LAST_CALCULATION` - Cannot delete the only remaining calculation
- `404 CALCULATION_NOT_FOUND` - Calculation not found in file
- `500 FILE_WRITE_ERROR` - Error during atomic write/rollback

**См. также:** [ADR-015](decisions/015-calculation-management.md) для детальной архитектуры rename/delete операций.

**routes/queue.js** - GET /queue/status (NEW in v2.1)

```javascript
router.get('/status', (req, res) => {
  try {
    const status = prtQueue.getStatus();
    res.json({
      success: true,
      data: {
        ...status,
        isProcessing: status.pending > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get queue status' }
    });
  }
});
```

**Response format:**
```json
{
  "success": true,
  "data": {
    "total": 135,
    "pending": 0,
    "completed": 135,
    "isProcessing": false
  }
}
```

**Purpose:** Frontend polls this endpoint to show parsing progress (progress bar, spinners).

**См. также:**
- [docs/api.md](api.md) - Complete API documentation
- [ADR-011: Lazy .prt Parsing](decisions/011-lazy-prt-parsing.md) - Performance optimization

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
│  │  - ProjectOverviewPage.tsx (NEW) │  │
│  │  - PerformancePage.tsx (v3.0)    │  │
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
  - ITB=orange, IM=gray, Carb=amber
- Client name (ALWAYS visible, critical field)
- Modified date
- Edit button (opens MetadataDialog)
- Open button (navigate to `/project/:id` - ProjectOverviewPage)

**Design principle:** Show ONLY essential info (user feedback: "Exhaust system irrelevant on card")

**FiltersBar.tsx** - Фильтры и поиск:
- Search input (filters by displayName, client, tags)
- Multi-select dropdowns:
  - Type (NA/Turbo/Supercharged)
  - Intake (ITB/IM/Carb)
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

### ProjectOverviewPage

**Назначение:** Центральная страница проекта - выбор типа анализа (Performance, Traces, PV-Diagrams, Noise, Turbo, Configuration).

**Route:** `/project/:id` (Level 2 в 3-level routing hierarchy)

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ProjectOverviewPage                           │
│  frontend/src/pages/ProjectOverviewPage.tsx                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Header (border-bottom, bg-card)                           │ │
│  │                                                             │ │
│  │  [← Back to Projects]                                      │ │
│  │                                                             │ │
│  │  BMW M42                                                    │ │
│  │  4 Cyl • NA                                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Analysis Types Grid (responsive: 1/2/3 columns)           │ │
│  │                                                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │  │ 📈 Performance│ │ 📊 Traces    │ │ 📉 PV-Diagrams│       │ │
│  │  │ & Efficiency │ │ Thermo &     │ │ Pressure-    │       │ │
│  │  │              │ │ Gasdynamic   │ │ Volume       │       │ │
│  │  │ 24 calcs     │ │ Not available│ │ Not available│       │ │
│  │  │ ready        │ │              │ │              │       │ │
│  │  │              │ │              │ │              │       │ │
│  │  │[View→] ✓     │ │[Coming...]  ⌛│ │[Coming...]  ⌛│       │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘       │ │
│  │                                                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │ │
│  │  │ 🔊 Noise     │ │ 🌀 Turbo Map │ │ 🕰️ Config    │       │ │
│  │  │ FFT Spectrum │ │ Compressor   │ │ History      │       │ │
│  │  │              │ │              │ │              │       │ │
│  │  │ Not available│ │ Not available│ │ Not available│       │ │
│  │  │              │ │              │ │              │       │ │
│  │  │[Coming...]  ⌛│ │[Coming...]  ⌛│ │[Coming...]  ⌛│       │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**

**AnalysisTypeCard.tsx** - Карточка типа анализа:
- **File:** `frontend/src/components/project-overview/AnalysisTypeCard.tsx`
- **Props:**
  - `id` - тип анализа (performance, traces, pvDiagrams, noise, turbo, configuration)
  - `title` - название анализа
  - `description` - описание
  - `href` - URL для перехода (e.g., `/project/:id/performance`)
  - `available` - доступность данных (boolean)
  - `calculationsCount` - количество расчётов (для performance)
  - `rpmPointsCount` - количество RPM точек (для traces)
  - `traceTypes` - типы traces (для traces)

- **Features:**
  - Icon mapping (TrendingUp, Activity, LineChart, Volume2, Fan, History)
  - Hover effects: `hover:shadow-xl hover:scale-[1.02]` (если available)
  - Disabled state: `opacity-50 cursor-not-allowed` (если not available)
  - Keyboard navigation: `tabIndex={available ? 0 : -1}`, Enter/Space для перехода
  - ARIA labels: `role="button"`, `aria-label`, `aria-disabled`
  - Status message: "24 calculations ready" / "Not available" / "Coming in Phase 2"

**Data flow:**
1. `useProjectSummary(id)` hook → fetch `/api/project/:id/summary`
2. API response: `{ project: {...}, availability: { performance: {...}, traces: {...}, ... }}`
3. AnalysisTypeCard отображает карточки с availability статусами
4. Клик на available карточку → navigate to `/project/:id/performance`

**Responsive grid:**
- Mobile: `grid-cols-1` (1 column)
- Tablet: `md:grid-cols-2` (2 columns)
- Desktop: `lg:grid-cols-3` (3 columns)

**State management:**
- Loading state: `<LoadingSpinner />` (центрирован на экране)
- Error state: `<ErrorMessage />` с retry функцией
- No Zustand state (stateless page - всё через API)

**Accessibility:**
- Keyboard navigation: Tab через available cards, Enter/Space для перехода
- ARIA labels на всех интерактивных элементах
- Screen reader friendly status messages

**См. также:**
- [GET /api/project/:id/summary](#backend-api-routes) - API endpoint
- [useProjectSummary hook](#custom-hooks) - Data fetching
- [3-Level Routing Hierarchy](#routing-architecture) - Навигация

---

### PerformancePage Visualization

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  PerformancePage (Route: /project/:id/performance)               │
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
- Shows all parameters (24 from .det or 71-78 from .pou)
- Export: CSV, Excel (XLSX)
- Sortable columns
- Horizontal scroll on mobile

---

### Components

**Shared components:**
- `components/shared/LoadingSpinner.tsx`
- `components/shared/ErrorMessage.tsx`
- `components/shared/SkeletonCard.tsx`
- `components/shared/ParsingProgress.tsx` - Fixed top progress bar (NEW in v2.1)
  - Shows "Processing X/Y projects (Z%)" during background parsing
  - Polls useQueueStatus() hook every 2 seconds
  - Auto-hides when `pending === 0`
  - Blue gradient background, white text, responsive layout
  - Positioned at top: `fixed top-0 left-0 right-0 z-50`
- `components/ui/*` - Radix UI primitives (Button, Dialog, Select, Checkbox, etc.)

**Project components:**
- `components/projects/ProjectCard.tsx`
  - **Updated in v2.1:** Added spinner for projects missing metadata
  - Shows `<Loader2 className="animate-spin" />` with "Processing metadata..." when `metadata?.auto` is null
  - Replaces EngineBadge during parsing
- `components/projects/FiltersBar.tsx`
- `components/projects/MetadataDialog.tsx`

**Project Overview components (NEW in v3.0):**
- `components/project-overview/AnalysisTypeCard.tsx`
  - Analysis type selection cards (Performance, Traces, PV-Diagrams, Noise, Turbo, Configuration)
  - Props: `id`, `title`, `description`, `href`, `available`, `calculationsCount`, `rpmPointsCount`, `traceTypes`
  - Icon mapping: TrendingUp, Activity, LineChart, Volume2, Fan, History
  - Features: hover effects (`hover:shadow-xl hover:scale-[1.02]`), disabled state, keyboard navigation
  - ARIA labels: `role="button"`, `aria-label`, `aria-disabled`
  - Status messages: "24 calculations ready" / "Not available" / "Coming in Phase 2"
  - See: [ProjectOverviewPage section](#projectoverviewpage) for detailed usage

**Navigation components (NEW in v3.0):**
- `components/navigation/Breadcrumbs.tsx`
  - Breadcrumb navigation for Level 3 pages (Analysis Pages only)
  - Format: "Engine Viewer > Project Name > Analysis Type"
  - Props: `items: BreadcrumbItem[]` where `BreadcrumbItem = { label: string, href?: string }`
  - Features:
    - First items are clickable links with hover effects
    - Last item (current page) displayed in muted color, not clickable
    - ChevronRight separators between items
    - Responsive: text truncation on small screens (`max-w-[200px]`)
    - ARIA label: `aria-label="Breadcrumb"`
  - Example:
    ```tsx
    <Breadcrumbs
      items={[
        { label: 'Engine Viewer', href: '/' },
        { label: 'Vesta 1.6 IM', href: '/project/vesta-16-im' },
        { label: 'Performance & Efficiency' } // current page
      ]}
    />
    ```

**Performance (Visualization) components:**
- `components/visualization/CalculationSelector.tsx` - Select up to 5 calculations
- `components/visualization/ChartPreset1.tsx` - Power & Torque
- `components/visualization/ChartPreset2.tsx` - Pressure & Temperature
- `components/visualization/ChartPreset3.tsx` - MEP
- `components/visualization/ChartPreset4.tsx` - Critical Values
- `components/visualization/ChartPreset5.tsx` - Volumetric Efficiency
- `components/visualization/ChartPreset6.tsx` - Custom
- `components/visualization/DataTable.tsx` - Tabular data

**App component:**
- `App.tsx` - **Updated in v2.1:** Integrated ParsingProgress globally
  - Rendered before page-container (above all routes)
  - Visible across all pages during background parsing

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

**useQueueStatus.ts** - Polling queue status (NEW in v2.1):
```typescript
const status = useQueueStatus();
// Returns: QueueStatus | null
// { total: number, pending: number, completed: number, isProcessing: boolean }
```

**Features:**
- Polls `/api/queue/status` every 2 seconds
- Stops polling when `pending === 0`
- Shows toast notification when processing completes
- Cleanup on unmount (prevents memory leaks)
- TypeScript fix: Uses `number` for intervalId (browser context, not `NodeJS.Timeout`)

**Used by:** ParsingProgress component (fixed top progress bar)

**useProjectSummary.ts** - Fetch project summary (NEW in v3.0):
```typescript
const { summary, loading, error } = useProjectSummary(projectId);
// Returns: UseProjectSummaryResult
// summary: ProjectSummary | null
// ProjectSummary = { project: {...}, availability: { performance, traces, pvDiagrams, noise, turbo, configuration } }
```

**Features:**
- Fetches `/api/project/:id/summary` endpoint
- Returns project info (id, displayName, specs) + analysis types availability
- Loading states: `loading: boolean`, `error: string | null`
- Race condition handling: `isMounted` flag in useEffect cleanup
- Auto-fetches on projectId change

**Used by:** ProjectOverviewPage (analysis type cards)

**useDeepLinking.ts** - URL params ↔ Zustand state sync (NEW in v3.0):
```typescript
useDeepLinking(projectId);
// No return value - syncs URL params with store automatically
```

**Purpose:** Keep URL params synchronized with Zustand store state for shareable URLs and browser Back/Forward support.

**URL Format Examples:**
- `/project/vesta-16-im/performance?preset=1&primary=$1`
- `/project/vesta-16-im/performance?preset=4&primary=$1&compare=$2,$5`
- `/project/bmw-m42/performance?preset=2&primary=$3&compare=vesta-16-im:$1`

**Synced State:**
- Chart preset selection (`preset=1-6`)
- Primary calculation (`primary=projectId:calculationId` or just `$calculationId`)
- Comparison calculations (`compare=projectId1:calcId1,projectId2:calcId2,...`)

**Features:**
- **Bidirectional sync:**
  - URL → Store: On mount & browser Back/Forward
  - Store → URL: When preset/calculations change
- **Auto-fetch calculation data** when restoring from URL
- **Infinite loop prevention:** `isSyncingFromURLRef` flag
- **Shareable URLs:** Copy URL → share → same visualization state
- **Browser Back/Forward support:** URL changes trigger store updates

**Implementation details:**
- Uses `useSearchParams()` from react-router-dom
- `setSearchParams(params, { replace: true })` updates URL without adding to browser history
- `parseCalculationParam()` - parse "projectId:calcId" or "$calcId" format
- `serializeCalculation()` - serialize CalculationReference to URL param
- `fetchCalculationMetadata()` - fetch full calculation data from `/api/project/:id`

**Used by:** PerformancePage (enables deep linking for all visualization state)

---

### State Management

**Zustand Store with Slices Architecture (v3.0)**

**File:** `frontend/src/stores/appStore.ts`

**Architecture:** Modular slices pattern - separate concerns, selective persistence.

```typescript
// appStore.ts - Combined store with two slices
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSettingsSlice } from './slices/settingsSlice';
import { createPerformanceSlice } from './slices/performanceSlice';

type AppStore = SettingsSlice & PerformanceSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createSettingsSlice(...args),
      ...createPerformanceSlice(...args),
    }),
    {
      name: 'engine-viewer-storage',
      // Persist ONLY settings slice (not performance state)
      partialize: (state) => ({
        units: state.units,
        theme: state.theme,
        chartSettings: state.chartSettings,
      }),
    }
  )
);
```

**Slice 1: SettingsSlice** (`frontend/src/stores/slices/settingsSlice.ts`)

**Purpose:** User preferences (persisted to localStorage)

**State:**
```typescript
interface SettingsSlice {
  // State
  units: 'si' | 'american' | 'hp';
  theme: 'light' | 'dark';
  chartSettings: {
    animation: boolean;
    showGrid: boolean;
    decimals: number;
  };

  // Actions
  setUnits: (units: 'si' | 'american' | 'hp') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
}
```

**Persistence:** YES (localStorage via `zustand/middleware persist`)

**Usage:**
```typescript
const units = useAppStore((state) => state.units);
const setUnits = useAppStore((state) => state.setUnits);
```

**Slice 2: PerformanceSlice** (`frontend/src/stores/slices/performanceSlice.ts`)

**Purpose:** Performance page state (session-only, synced with URL via useDeepLinking)

**State:**
```typescript
interface PerformanceSlice {
  // Calculation State
  primaryCalculation: CalculationReference | null;
  comparisonCalculations: CalculationReference[];  // Max 4

  // Chart Preset State
  selectedPreset: 1 | 2 | 3 | 4 | 5 | 6;
  selectedCustomParams: SelectedParameter[];

  // UI Modal State
  isSettingsOpen: boolean;
  isPrimaryModalOpen: boolean;
  isComparisonModalOpen: boolean;
  isParameterSelectorOpen: boolean;

  // Actions
  setPrimaryCalculation: (calc: CalculationReference) => void;
  clearPrimaryCalculation: () => void;
  addComparison: (calc: CalculationReference) => void;
  removeComparison: (index: number) => void;
  clearComparisons: () => void;
  setSelectedPreset: (preset: 1 | 2 | 3 | 4 | 5 | 6) => void;
  setSelectedCustomParams: (params: SelectedParameter[]) => void;
  toggleParameter: (paramId: string) => void;
  setCylinderSelection: (paramId: string, cylinder: 'avg' | number) => void;
  toggleSettings: () => void;
  togglePrimaryModal: () => void;
  toggleComparisonModal: () => void;
  toggleParameterSelector: () => void;
}

interface CalculationReference {
  projectId: string;
  projectName: string;
  calculationId: string;
  calculationName: string;
  color: string;  // Auto-assigned from CALCULATION_COLORS
  metadata: {
    rpmRange: [number, number];
    avgStep: number;
    pointsCount: number;
    engineType: string;
    cylinders: number;
  };
}
```

**Persistence:** NO (session-only, state managed via URL params through useDeepLinking hook)

**Color Assignment:**
- Primary calculation → `CALCULATION_COLORS[0]` (red)
- Comparisons → auto-assigned next available color from palette
- `getNextColor()` utility finds first unused color

**Usage:**
```typescript
const preset = useAppStore((state) => state.selectedPreset);
const setPreset = useAppStore((state) => state.setSelectedPreset);
const primaryCalculation = useAppStore((state) => state.primaryCalculation);
const setPrimaryCalculation = useAppStore((state) => state.setPrimaryCalculation);
```

**Integration with Deep Linking:**
- PerformanceSlice state synced with URL params via `useDeepLinking()` hook
- URL changes (browser Back/Forward) → store updates
- Store changes (user interactions) → URL updates
- Enables shareable URLs with full visualization state

**Why Zustand?**
- Lightweight (no Provider wrapper needed)
- Simple API (hooks-based, direct state access)
- Built-in middleware (persist, devtools)
- Perfect for cross-page state (settings persist, performance syncs with URL)
- TypeScript-friendly (full type inference)

**Why Slices Pattern?**
- Separation of concerns (settings vs performance state)
- Selective persistence (only settings saved to localStorage)
- Easier testing and maintenance
- Scalable for future features (can add new slices without refactoring)

---

### Routing Architecture

**3-Level Hierarchy (v3.0)**

**File:** `frontend/src/App.tsx`

**Structure:**

```
┌──────────────────────────────────────────────────────────────────┐
│                   ROUTING HIERARCHY                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Level 1: HomePage                                               │
│  Route: /                                                        │
│  Component: HomePage.tsx                                         │
│  Purpose: List all projects (cards grid with filters)           │
│                                                                   │
│       ↓ User clicks "Open" on ProjectCard                        │
│                                                                   │
│  Level 2: Project Overview                                       │
│  Route: /project/:id                                             │
│  Component: ProjectOverviewPage.tsx                              │
│  Purpose: Select analysis type (Performance, Traces, etc.)      │
│                                                                   │
│       ↓ User clicks "Performance & Efficiency" card              │
│                                                                   │
│  Level 3: Analysis Pages                                         │
│  Routes:                                                         │
│    /project/:id/performance     - PerformancePage.tsx           │
│    /project/:id/traces          - TracesPage.tsx (future)       │
│    /project/:id/pv-diagrams     - PVDiagramsPage.tsx (future)   │
│    /project/:id/noise           - NoisePage.tsx (future)         │
│    /project/:id/turbo           - TurboPage.tsx (future)         │
│    /project/:id/configuration   - ConfigurationPage.tsx (future) │
│  Purpose: Specific analysis visualization                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**React Router Configuration:**

```typescript
// App.tsx
<BrowserRouter>
  <ErrorBoundary>
    <ParsingProgress />
    <div className="page-container">
      <Routes>
        {/* Level 1: HomePage */}
        <Route path="/" element={<HomePage />} />

        {/* Level 2: Project Overview */}
        <Route path="/project/:id" element={<ProjectOverviewPage />} />

        {/* Level 3: Analysis Pages */}
        <Route path="/project/:id/performance" element={<PerformancePage />} />
        <Route path="/project/:id/traces" element={<TracesPage />} />
        <Route path="/project/:id/pv-diagrams" element={<PVDiagramsPage />} />
        <Route path="/project/:id/noise" element={<NoisePage />} />
        <Route path="/project/:id/turbo" element={<TurboPage />} />
        <Route path="/project/:id/configuration" element={<ConfigurationPage />} />
      </Routes>
    </div>
    <Toaster />
  </ErrorBoundary>
</BrowserRouter>
```

**Navigation Flow:**

1. **Level 1 → Level 2:**
   - User clicks "Open" button on ProjectCard
   - `navigate(\`/project/${projectId}\`)` in ProjectCard.tsx
   - Navigates to ProjectOverviewPage

2. **Level 2 → Level 3:**
   - User clicks AnalysisTypeCard (e.g., "Performance & Efficiency")
   - `navigate(href)` where `href="/project/:id/performance"`
   - Navigates to PerformancePage

3. **Level 3 → Level 2:**
   - User clicks "Back" button or breadcrumb link
   - `navigate(\`/project/${projectId}\`)`
   - Returns to ProjectOverviewPage

4. **Level 3 → Level 1:**
   - User clicks breadcrumb "Engine Viewer" link
   - `navigate('/')`
   - Returns to HomePage

**Breadcrumbs (Level 3 Only):**

```typescript
// Example: PerformancePage breadcrumbs
<Breadcrumbs
  items={[
    { label: 'Engine Viewer', href: '/' },
    { label: projectName, href: `/project/${projectId}` },
    { label: 'Performance & Efficiency' } // current page
  ]}
/>
```

**Deep Linking Support (Level 3):**

Performance page supports URL params for complete state restoration:

```
/project/vesta-16-im/performance?preset=1&primary=$1&compare=$2,$5
```

- `preset=1-6` - Selected chart preset
- `primary=projectId:calcId` - Primary calculation
- `compare=projId1:calcId1,projId2:calcId2` - Comparison calculations

Managed by `useDeepLinking()` hook - syncs URL ↔ Zustand store.

**Route Parameters:**

- `:id` - Project ID (normalized filename: `Vesta 1.6 IM.det` → `vesta-16-im`)

**URL Format Examples:**

- Level 1: `/` (HomePage)
- Level 2: `/project/bmw-m42` (ProjectOverviewPage for BMW M42 project)
- Level 3: `/project/bmw-m42/performance` (PerformancePage)
- Level 3 with state: `/project/bmw-m42/performance?preset=2&primary=$3&compare=vesta-16-im:$1`

**Why 3-Level Hierarchy?**

- **Scalability:** Easy to add new analysis types without restructuring
- **Clarity:** Each level has single responsibility
- **Navigation:** Intuitive breadcrumbs, clear user flow
- **Future-proof:** Prepared for 6 analysis types (Performance, Traces, PV-Diagrams, Noise, Turbo, Configuration)
- **SEO-friendly:** Semantic URLs (e.g., `/project/bmw-m42/performance`)
- **Deep linking:** Full state encoded in URL (shareable, bookmarkable)

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
Navigate to /project/:id (ProjectOverviewPage)
         ↓
User clicks "Performance & Efficiency" card
         ↓
Navigate to /project/:id/performance (PerformancePage)
         ↓
PerformancePage.tsx calls useProjectData(id)
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
PerformancePage renders charts + table
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
    intakeSystem: 'ITB' | 'IM' | 'Carb';
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
- `p-queue` v9.0.0 - Promise queue with concurrency control (NEW in v2.1)
- `async-mutex` v0.5.0 - Mutex for race condition protection (NEW in v2.1)
- `chokidar` - File system watcher

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

**Development configuration:**
- Vite proxy (NEW in v2.1): `/api` requests → `http://localhost:3000` with path rewrite
  - Frontend: `fetch('/api/queue/status')` → Backend: `GET http://localhost:3000/queue/status`
  - Configured in `frontend/vite.config.ts`

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
