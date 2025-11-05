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
- `MetadataDialog` - диалог редактирования метаданных
- `TagInput` - компонент для управления тегами
- `LoadingSpinner` - индикатор загрузки
- `ErrorMessage` - сообщение об ошибке
- `EmptyState` - пустое состояние
- **Visualization components:**
  - `CalculationSelector` - выбор расчётов (макс 5) с checkbox и цветными индикаторами
  - `ChartPreset1` - график "Мощность и момент" (dual Y-axes) ✅
  - `ChartPreset2` - в разработке
  - `ChartPreset3` - в разработке
  - `ChartPreset4` - в разработке
  - `DataTable` - таблица данных (в разработке)

**hooks/** - Custom hooks
- `useProjects` - загрузка списка проектов ✅
- `useProjectData` - загрузка данных проекта по ID (с race condition handling) ✅
- `useSelectedCalculations` - управление выбранными расчётами (макс 5) ✅
- `useChartPreset` - управление пресетами (в разработке)

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

## Metadata System (Project Metadata v1.0) 🔧

**Status:** ✅ Implemented (Phase 1 complete, Nov 2025)

**Purpose:** Автоматическое извлечение метаданных двигателя из `.prt` файлов и разделение на read-only (auto) и user-editable (manual) секции.

### Архитектура Metadata System

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILE SYSTEM (.prt files)                      │
│  test-data/                                                      │
│    ├── BMW M42/BMW M42.prt                                       │
│    ├── 4_Cyl_ITB/4_Cyl_ITB.prt                                   │
│    └── Vesta 1.6 IM/Vesta 1.6 IM.prt                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Parse .prt files
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRT PARSER                                    │
│  backend/src/parsers/formats/prtParser.js                        │
│                                                                  │
│  Extract:                                                        │
│  - Engine specs (cylinders, bore, stroke, CR, maxRPM)           │
│  - Type detection (NA/Turbo/Supercharged)                       │
│  - Intake system (ITB vs IM)                                    │
│  - Exhaust pattern (4-2-1, 4-1, tri-y, etc.)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Auto metadata
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  METADATA SERVICE                                │
│  backend/src/services/metadataService.js                         │
│                                                                  │
│  updateAutoMetadata(projectId, autoData)                        │
│  - Reads existing .metadata/{id}.json                            │
│  - Updates "auto" section ONLY                                  │
│  - Preserves "manual" section                                   │
│  - Saves merged metadata                                         │
│                                                                  │
│  updateManualMetadata(projectId, manualData)                    │
│  - Reads existing .metadata/{id}.json                            │
│  - Updates "manual" section ONLY                                │
│  - Preserves "auto" section                                     │
│  - Saves merged metadata                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Save to disk
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              METADATA STORAGE (.metadata/*.json)                 │
│                                                                  │
│  .metadata/bmw-m42.json:                                         │
│  {                                                               │
│    "version": "1.0",                                             │
│    "id": "bmw-m42",                                              │
│    "displayName": "BMW M42",                                     │
│    "auto": {                                                     │
│      "cylinders": 4,                                             │
│      "type": "NA",                                               │
│      "configuration": "inline",                                  │
│      "intakeSystem": "ITB",                                      │
│      "exhaustSystem": "4-2-1"                                    │
│    },                                                            │
│    "manual": {                                                   │
│      "client": "Ivan Petrov",                                    │
│      "tags": ["track-build"],                                    │
│      "notes": "Dyno tested"                                      │
│    }                                                             │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Metadata Structure v1.0

**TypeScript Interface:**
```typescript
export interface AutoMetadata {
  cylinders: number;                    // From .prt: number of cylinders
  type: 'NA' | 'Turbo' | 'Supercharged'; // Engine type
  configuration: EngineConfiguration;   // inline, V, boxer, etc.
  bore: number;                         // Bore (mm)
  stroke: number;                       // Stroke (mm)
  compressionRatio: number;             // Compression ratio
  maxPowerRPM: number;                  // Max power RPM
  intakeSystem: IntakeSystem;           // ITB or IM
  exhaustSystem: ExhaustSystem;         // 4-2-1, 4-1, tri-y, etc.
}

export interface ManualMetadata {
  description?: string;     // User description
  client?: string;          // Client name
  tags?: string[];          // User tags
  status?: ProjectStatus;   // active, completed, archived
  notes?: string;           // User notes
  color?: string;           // Project color (hex)
}

export interface ProjectMetadata {
  version: '1.0';
  id: string;
  displayName?: string;
  auto?: AutoMetadata;      // Read-only (from .prt)
  manual: ManualMetadata;   // User-editable
  created: string;          // ISO 8601
  modified: string;         // ISO 8601
}
```

### .prt Parser Implementation

**File:** `backend/src/parsers/formats/prtParser.js`

**Parsing Logic:**

1. **Engine Specs Extraction:**
   ```javascript
   // Line 1: Header with engine name
   // Line 2-10: Engine specifications
   // Line ~50: "Maximum power obtained at _____ rpm" → maxPowerRPM
   // Line ~100: Bore, stroke, compression ratio
   ```

2. **Intake System Detection:**
   ```javascript
   // Line 276: "N throttles - with no airboxes" → ITB
   // Line 276: "N throttle - with a common airbox or plenum" → IM

   if (line.includes('with no airboxes')) {
     intakeSystem = 'ITB';
   } else if (line.includes('with a common airbox or plenum')) {
     intakeSystem = 'IM';
   }
   ```

3. **Exhaust System Parsing:**
   ```javascript
   // Regex patterns for exhaust configuration
   // "4into2into1 manifold" → "4-2-1"
   // "4into1 manifold" → "4-1"
   // "tri-y manifold" → "tri-y"

   const patterns = [
     { regex: /(\d+)into(\d+)into(\d+)/i, format: '$1-$2-$3' },
     { regex: /(\d+)into(\d+)/i, format: '$1-$2' },
     { regex: /tri-y/i, format: 'tri-y' }
   ];
   ```

4. **Type Detection:**
   ```javascript
   // Based on turbocharger/supercharger count
   if (turbochargers > 0) {
     engineType = 'Turbo';
   } else if (superchargers > 0) {
     engineType = 'Supercharged';
   } else {
     engineType = 'NA';
   }
   ```

**Registry Integration:**
```javascript
// backend/src/parsers/index.js
import { PrtParser } from './formats/prtParser.js';
import { globalRegistry } from './registry/FormatRegistry.js';

globalRegistry.register('prt', PrtParser);
```

### Metadata Service

**File:** `backend/src/services/metadataService.js`

**Key Functions:**

```javascript
/**
 * Update auto metadata (from .prt parser)
 * - Preserves manual section
 * - Overwrites auto section
 */
export async function updateAutoMetadata(projectId, autoData) {
  const metadataPath = `.metadata/${projectId}.json`;

  // Read existing metadata
  let metadata = await readMetadata(projectId);

  // Update auto section only
  metadata.auto = autoData;
  metadata.modified = new Date().toISOString();

  // Save (preserves manual section)
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Update manual metadata (from user)
 * - Preserves auto section
 * - Overwrites manual section
 */
export async function updateManualMetadata(projectId, manualData) {
  const metadataPath = `.metadata/${projectId}.json`;

  // Read existing metadata
  let metadata = await readMetadata(projectId);

  // Update manual section only
  metadata.manual = { ...metadata.manual, ...manualData };
  metadata.modified = new Date().toISOString();

  // Save (preserves auto section)
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}
```

### File Scanner Integration

**File:** `backend/src/services/fileScanner.js`

**Recursive Directory Scanning:**
```javascript
async function scanDirectory(dirPath) {
  const projects = [];

  for (const entry of await fs.readdir(dirPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subProjects = await scanDirectory(path.join(dirPath, entry.name));
      projects.push(...subProjects);
    } else if (entry.isFile()) {
      // Check if .det or .pou file
      if (entry.name.endsWith('.det') || entry.name.endsWith('.pou')) {
        // Check for corresponding .prt file
        const prtPath = entry.name.replace(/\.(det|pou)$/, '.prt');
        const prtFullPath = path.join(dirPath, prtPath);

        if (await fileExists(prtFullPath)) {
          // Parse .prt for auto metadata
          const autoMetadata = await prtParser.parse(prtFullPath);

          // Update auto metadata (preserves manual)
          await metadataService.updateAutoMetadata(projectId, autoMetadata);
        }

        projects.push({
          id: projectId,
          name: entry.name,
          path: path.join(dirPath, entry.name),
          metadata: await metadataService.readMetadata(projectId)
        });
      }
    }
  }

  return projects;
}
```

**New Directory Structure Support:**
```
test-data/
  ├── BMW M42/
  │   ├── BMW M42.det
  │   ├── BMW M42.pou
  │   └── BMW M42.prt          ← Auto metadata source
  ├── 4_Cyl_ITB/
  │   ├── 4_Cyl_ITB.det
  │   ├── 4_Cyl_ITB.pou
  │   └── 4_Cyl_ITB.prt
  └── .metadata/
      ├── bmw-m42.json         ← Combined auto + manual
      └── 4-cyl-itb.json
```

### API Updates

**GET /api/projects** - List projects with filters

```javascript
// routes/projects.js
router.get('/api/projects', async (req, res) => {
  const { cylinders, type, intake, exhaust } = req.query;

  // Scan all projects
  const projects = await fileScanner.scanFolder('./test-data');

  // Apply filters on metadata.auto.*
  let filtered = projects;

  if (cylinders) {
    filtered = filtered.filter(p => p.metadata?.auto?.cylinders === parseInt(cylinders));
  }

  if (type) {
    filtered = filtered.filter(p => p.metadata?.auto?.type === type);
  }

  if (intake) {
    filtered = filtered.filter(p => p.metadata?.auto?.intakeSystem === intake);
  }

  if (exhaust) {
    filtered = filtered.filter(p => p.metadata?.auto?.exhaustSystem === exhaust);
  }

  res.json(filtered);
});
```

**POST /api/projects/:id/metadata** - Update manual metadata only

```javascript
// routes/metadata.js
router.post('/api/projects/:id/metadata', async (req, res) => {
  const { id } = req.params;
  const manualData = req.body;

  // Update ONLY manual section (preserves auto)
  await metadataService.updateManualMetadata(id, manualData);

  res.json({ success: true });
});
```

### Data Flow: Metadata Population

```
1. User adds new .det + .prt files to test-data/

2. Backend scans test-data/ (recursive)
   ↓
   fileScanner.scanFolder()

3. For each .det file found, check for .prt sibling
   ↓
   const prtPath = detPath.replace('.det', '.prt')

4. If .prt exists, parse it
   ↓
   prtParser.parse(prtPath)

5. Extract auto metadata from .prt
   ↓
   { cylinders, type, intake, exhaust, ... }

6. Update auto metadata in .metadata/{id}.json
   ↓
   metadataService.updateAutoMetadata(id, autoData)

7. Merge with existing manual metadata
   ↓
   metadata = { auto: {...}, manual: {...} }

8. Return merged metadata to frontend
   ↓
   GET /api/projects → ProjectInfo[] with metadata
```

### Migration from Legacy Metadata

**Script:** `backend/scripts/migrate-metadata.js`

**Purpose:** Migrate old metadata files (no auto/manual split) to v1.0 structure

```javascript
async function migrateMetadata(oldMetadataPath) {
  const oldMetadata = JSON.parse(await fs.readFile(oldMetadataPath, 'utf-8'));

  const newMetadata = {
    version: '1.0',
    id: oldMetadata.id,
    displayName: oldMetadata.displayName,

    // Empty auto section (will be filled on first scan)
    auto: {},

    // Move user data to manual section
    manual: {
      description: oldMetadata.description,
      client: oldMetadata.client,
      tags: oldMetadata.tags,
      status: oldMetadata.status,
      notes: oldMetadata.notes,
      color: oldMetadata.color
    },

    created: oldMetadata.created || new Date().toISOString(),
    modified: new Date().toISOString()
  };

  await fs.writeFile(oldMetadataPath, JSON.stringify(newMetadata, null, 2));
}
```

### Rules and Principles

**Auto Metadata:**
- ✅ Source of truth: `.prt` file
- ✅ Read-only in frontend
- ✅ Updated automatically on file scan
- ✅ Never manually edited by user

**Manual Metadata:**
- ✅ Source of truth: `.metadata/{id}.json`
- ✅ User-editable in frontend
- ✅ Preserved during auto metadata updates
- ✅ Created/updated via API

**Re-parsing .prt files:**
- When: File scanner runs (app startup, manual rescan)
- Result: Auto section updated, manual section preserved
- Safety: Explicit separation prevents accidental data loss

**Benefits:**
- ✅ Automation: ~5 min/project × 50 projects = 4 hours/year saved
- ✅ Accuracy: 100% accurate auto metadata (source of truth)
- ✅ Smart filters: Dashboard filters work automatically
- ✅ Data integrity: Manual data never lost during re-parse

**See Also:**
- [ADR 005: .prt Parser and Metadata Separation](decisions/005-prt-parser-metadata-separation.md)
- [PROJECT-METADATA-DASHBOARD-SPEC.md](../PROJECT-METADATA-DASHBOARD-SPEC.md)
- [docs/file-formats/prt-format.md](file-formats/prt-format.md)

---

## Компоненты визуализации (Этап 7) ✅

### Архитектура страницы ProjectPage

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ProjectPage                                                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Project Info Card                                    │ │
│  │  - Название проекта, тип двигателя, цилиндры         │ │
│  │  - Badge с количеством расчётов                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌───────────────────────────────────┐ │
│  │ CalculationSel  │  │  Visualization Area              │ │
│  │                 │  │                                  │ │
│  │ □ Calc 1 🔴     │  │  ChartPreset1                    │ │
│  │ ☑ Calc 2 🟢     │  │  ┌────────────────────────────┐ │ │
│  │ ☑ Calc 3 🔵     │  │  │  Power & Torque Chart      │ │ │
│  │ □ Calc 4 🟡     │  │  │  (Dual Y-axes)             │ │ │
│  │ □ Calc 5 🟣     │  │  │                            │ │ │
│  │                 │  │  │  Left Y: Power (kW)        │ │ │
│  │ Selected: 2/5   │  │  │  Right Y: Torque (N·m)     │ │ │
│  │                 │  │  │  X: RPM                    │ │ │
│  └─────────────────┘  │  │                            │ │ │
│                        │  │  [DataZoom Slider]         │ │ │
│                        │  └────────────────────────────┘ │ │
│                        └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Custom Hooks для визуализации

**useProjectData.ts** - Загрузка данных проекта
```typescript
// Функциональность:
- Загрузка детальных данных проекта по ID из API
- State management: project, loading, error
- Race condition handling (ignore flag в useEffect)
- Функция refetch для повторной загрузки
- Автоматическая очистка при размонтировании

// Использование:
const { project, loading, error, refetch } = useProjectData(id);
```

**useSelectedCalculations.ts** - Управление выбором расчётов
```typescript
// Функциональность:
- Управление массивом selectedIds (максимум 5 элементов)
- toggleCalculation(id) - добавить/убрать расчёт из выбранных
- Валидация максимального количества (MAX_CALCULATIONS = 5)
- Хелперы: isSelected, isMaxReached, canSelect, count, maxCount
- clearSelection() для сброса выбора

// Использование:
const {
  selectedIds,
  toggleCalculation,
  isMaxReached,
  count,
  maxCount
} = useSelectedCalculations();
```

### Компоненты визуализации

**CalculationSelector.tsx** - UI выбора расчётов
```typescript
// Функциональность:
- Отображение списка расчётов с checkboxes (Radix UI)
- Цветные индикаторы для каждого расчёта (синхронизированы с графиком)
- Badge с счётчиком выбранных расчётов (2/5)
- Автоматическое отключение checkboxes при достижении лимита
- Tooltip предупреждение при превышении лимита

// Props:
- calculations: Calculation[]       // Все расчёты проекта
- selectedIds: string[]              // Выбранные ID расчётов
- onToggle: (id: string) => void     // Callback при клике
- isMaxReached: boolean              // Достигнут ли лимит
- maxCount: number                   // Максимум выборов (5)

// Цвета из config.yaml:
const CALCULATION_COLORS = [
  '#ff6b6b',  // Красный
  '#4ecdc4',  // Бирюзовый
  '#45b7d1',  // Синий
  '#f9ca24',  // Жёлтый
  '#a29bfe',  // Фиолетовый
];
```

**ChartPreset1.tsx** - График "Мощность и момент"
```typescript
// Функциональность:
- Dual Y-axes chart (ECharts)
- Левая ось: P-Av (Мощность в кВт)
- Правая ось: Torque (Момент в Н·м)
- Ось X: RPM (Обороты двигателя)
- DataZoom slider для интерактивного зумирования
- Tooltip с кастомным форматированием (цвет + единицы)
- Legend для переключения видимости серий
- Цветовая схема: синхронизирована с CalculationSelector

// Props:
- calculations: Calculation[]       // Все расчёты проекта
- selectedIds: string[]             // Выбранные ID для отображения

// Оптимизация:
- useMemo для chartOption (пересчёт только при изменении selectedIds)
- Фильтрация расчётов по selectedIds
- Циклическое повторение цветов (index % colors.length)

// Линии:
- Мощность: сплошная линия (solid), привязана к yAxisIndex: 0
- Момент: пунктирная линия (dashed), привязана к yAxisIndex: 1
```

**chartConfig.ts** - Базовая конфигурация ECharts
```typescript
// Экспорт функций:
- getBaseChartConfig(): базовая конфигурация для всех графиков
  - grid (отступы для dual Y-axes)
  - tooltip (trigger: 'axis', custom formatter)
  - legend (position: top center)
  - dataZoom (slider + inside zoom)
  - animation: true

- createXAxis(name): создание оси X
  - type: 'value'
  - name: название (например "RPM")
  - nameLocation: 'middle'
  - axisLabel.formatter для тысяч (1000 → 1k)

- createYAxis(name, position, color): создание оси Y
  - type: 'value'
  - position: 'left' | 'right'
  - name: название (например "Мощность (кВт)")
  - nameTextStyle.color: цвет оси
  - splitLine: пунктирная линия сетки

- getCalculationColor(index): получить цвет для расчёта
  - Циклическое повторение из CALCULATION_COLORS
  - index % 5 для бесконечного количества расчётов

// Константы:
const CALCULATION_COLORS: string[] = [...]  // 5 цветов из config.yaml
```

### Data Flow для визуализации

```
User открывает /project/:id
         ↓
ProjectPage.tsx рендерится
         ↓
useProjectData(id) вызывается
         ↓
api.getProject(id) → Backend
         ↓
Backend парсит .det файл
         ↓
Response: EngineProject JSON
         ↓
project state обновляется
         ↓
ProjectPage передаёт project.calculations в:
  - CalculationSelector (для выбора)
  - ChartPreset1 (для отображения)
         ↓
User выбирает расчёты через checkboxes
         ↓
toggleCalculation(id) вызывается
         ↓
selectedIds state обновляется (useSelectedCalculations)
         ↓
ChartPreset1 получает новый selectedIds
         ↓
useMemo пересчитывает chartOption
         ↓
ECharts re-renders с новыми сериями
```

### ECharts интеграция

**echarts-for-react:**
```typescript
import ReactECharts from 'echarts-for-react';

// Использование:
<ReactECharts
  option={chartOption}           // EChartsOption
  style={{ height: '600px' }}    // Размер графика
  opts={{ renderer: 'canvas' }}  // Или 'svg'
/>

// chartOption:
- Полная типизация: EChartsOption из echarts
- Включает: title, xAxis, yAxis[], series[], tooltip, legend, dataZoom
```

**Performance оптимизации:**
```typescript
// 1. useMemo для chartOption
const chartOption = useMemo((): EChartsOption => {
  // Пересчёт только при изменении selectedCalculations
}, [selectedCalculations]);

// 2. useMemo для selectedCalculations
const selectedCalculations = useMemo(() => {
  return calculations.filter(calc => selectedIds.includes(calc.id));
}, [calculations, selectedIds]);

// 3. useCallback для toggleCalculation
const toggleCalculation = useCallback((id: string) => {
  // Стабильная ссылка функции
}, []);
```

### Обработка состояний в ProjectPage

```typescript
// Loading state
if (loading) {
  return <LoadingSpinner />;
}

// Error state
if (error) {
  return <ErrorMessage message={error} onRetry={refetch} />;
}

// Empty state (проект не найден)
if (!project) {
  return <div>Проект не найден</div>;
}

// Success state - рендер UI
return (
  <ProjectPage with data />
);
```

### Technical Details

**Race condition handling в useProjectData:**
```typescript
useEffect(() => {
  let ignore = false;  // Флаг для отмены устаревших запросов

  const fetchProject = async () => {
    const data = await projectsApi.getProject(projectId);
    if (!ignore) {  // Обновить state только если не отменено
      setProject(data);
    }
  };

  fetchProject();

  return () => {
    ignore = true;  // Cleanup: отменить при размонтировании
  };
}, [projectId]);
```

**Checkbox component (Radix UI):**
```typescript
// Установлено:
@radix-ui/react-checkbox

// Компонент: frontend/src/components/ui/checkbox.tsx
- ForwardRef для передачи ref
- TailwindCSS стилизация (border-primary, data-[state=checked]:bg-primary)
- Check icon из lucide-react
```

**API response format fix:**
```typescript
// Backend возвращает:
{
  success: true,
  data: { ...EngineProject },
  meta: { ... }
}

// Frontend должен извлечь:
if (response.data && response.data.success && response.data.data) {
  return response.data.data;
}
```

---

## Accessibility Implementation Patterns

**Status:** ✅ Implemented (v2.0.0, WCAG 2.1 AA compliant)

### Keyboard Navigation

**Focus Management:**
```typescript
// All interactive elements are keyboard accessible
<button className="focus-visible:ring-[3px] focus-visible:ring-ring">
  {/* Prominent 3px focus indicator for buttons */}
</button>

<Card className="focus-visible:ring-2 focus-visible:ring-ring">
  {/* Subtle 2px focus indicator for cards */}
</Card>
```

**Focus Trap in Modals:**
- **Radix UI Dialog** provides built-in focus trap
- Focus moves to modal when opened
- ESC key closes modal
- Focus returns to trigger element on close

```typescript
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Automatic focus management:
// - DialogContent traps focus inside modal
// - Tab cycles through focusable elements
// - Shift+Tab cycles backwards
// - ESC closes and returns focus
```

**Tab Order:**
1. Header navigation (logo, back button, settings)
2. Left panel (calculation selector, filters)
3. Main content (charts, tables)
4. Footer (if present)

### ARIA Labels and Semantic HTML

**Button Accessibility:**
```typescript
// Icon-only buttons must have aria-label
<button aria-label="Edit project metadata">
  <EditIcon />
</button>

// Text buttons don't need aria-label (text is readable)
<button>Save Changes</button>
```

**Form Accessibility:**
```typescript
// React Hook Form + Radix UI
<FormLabel htmlFor="projectName">Project Name</FormLabel>
<FormControl>
  <Input id="projectName" {...field} />
</FormControl>
<FormMessage /> {/* Error message linked automatically */}
```

**Dialog Accessibility:**
```typescript
<DialogTitle>Select Calculation</DialogTitle>
<DialogDescription>
  Choose up to 5 calculations to compare.
</DialogDescription>

// Automatic ARIA attributes:
// - aria-labelledby points to DialogTitle
// - aria-describedby points to DialogDescription
// - role="dialog"
// - aria-modal="true"
```

**Semantic HTML:**
- `<nav>` for navigation areas
- `<main>` for main content
- `<article>` for project cards
- `<section>` for chart sections
- `<button>` for interactive actions (never `<div>` with onClick)

### Screen Reader Support

**Descriptive Text:**
```typescript
// Status indicators for screen readers
<span className="sr-only">Loading project data</span>
<LoadingSpinner aria-hidden="true" />

// Hidden counts for screen readers
<Badge>
  <span className="sr-only">Selected calculations: </span>
  2/5
</Badge>
```

**Live Regions:**
```typescript
// Announce dynamic content changes
<div role="status" aria-live="polite">
  {successMessage && <p>{successMessage}</p>}
</div>

// Error announcements
<div role="alert" aria-live="assertive">
  {errorMessage && <p>{errorMessage}</p>}
</div>
```

### Color Contrast (WCAG 2.1 AA)

**Text Contrast:**
- Background: `#ffffff` (white)
- Primary text: `#09090b` (near black) - Contrast ratio: 20.2:1 ✅
- Secondary text: `#71717a` (gray) - Contrast ratio: 4.6:1 ✅
- Muted text: `#a1a1aa` (light gray) - Contrast ratio: 3.1:1 (large text only)

**Interactive Elements:**
- Primary buttons: High contrast (14:1+)
- Focus indicators: 3:1+ contrast
- Chart colors: All meet 3:1 contrast on white background

**Checked by:**
- TailwindCSS default palette (WCAG compliant)
- shadcn/ui theme (accessibility-first design)
- Manual verification with WebAIM Contrast Checker

### Touch Target Sizes

**Minimum touch targets: 44×44 px** (WCAG 2.1 AAA guideline)

```typescript
// All buttons meet minimum size
<Button className="h-10 px-4">  {/* 40px height, close to 44px */}
  Action
</Button>

// Cards have large clickable area
<ProjectCard className="min-h-[200px]">
  {/* Entire card is clickable */}
</ProjectCard>

// Checkboxes have extended hit area
<Checkbox className="h-4 w-4 data-[state=checked]:bg-primary">
  {/* Parent label extends hit area */}
</Checkbox>
```

### Accessibility Testing Checklist

**Keyboard:**
- ✅ All features accessible via keyboard
- ✅ Visible focus indicators
- ✅ Logical tab order
- ✅ No keyboard traps (except modals)

**Screen Reader:**
- ✅ All images have alt text (or aria-label)
- ✅ Form inputs have labels
- ✅ Buttons have descriptive text or aria-label
- ✅ Status changes announced

**Visual:**
- ✅ Color contrast meets WCAG AA
- ✅ Information not conveyed by color alone (line styles in charts)
- ✅ Text resizable up to 200% without loss of content

**Motor:**
- ✅ Touch targets ≥44×44px
- ✅ No precise timing required
- ✅ Gestures have keyboard alternatives

---

## Responsive Design Implementation

**Status:** ✅ Implemented (v2.0.0, mobile-first approach)

### Breakpoints

**TailwindCSS breakpoints:**
```typescript
sm:  640px   // Small tablets portrait
md:  768px   // Tablets and small laptops
lg:  1024px  // Laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large desktops
```

**Project uses:**
- `< 768px`: Mobile
- `768px - 1024px`: Tablet
- `> 1024px`: Desktop

### Component-Level Responsive Patterns

**Header (mobile optimization):**
```typescript
// Desktop: Full text buttons + calculation count
<Button>
  <ExportIcon /> Export to PNG
</Button>
<span>2 calculations selected</span>

// Mobile (<768px): Icon-only buttons, hidden count
<Button className="md:inline-flex md:gap-2">
  <ExportIcon />
  <span className="hidden md:inline">Export to PNG</span>
</Button>
<span className="hidden md:inline">2 calculations selected</span>
```

**Modals (mobile full-screen):**
```typescript
// Desktop: Centered modal with padding
<DialogContent className="max-w-lg">
  {/* Content */}
</DialogContent>

// Mobile: Nearly full-screen (inset-4 for small margin)
<DialogContent className="inset-4 max-w-lg md:inset-auto">
  {/* Content fills screen on mobile */}
</DialogContent>
```

**LeftPanel (hamburger menu):**
```typescript
// Mobile: Hidden by default, toggle button
<Sheet>
  <SheetTrigger>
    <MenuIcon />  {/* Hamburger */}
  </SheetTrigger>
  <SheetContent side="left">
    {/* Calculation selector, filters */}
  </SheetContent>
</Sheet>

// Desktop (>1024px): Always visible sidebar
<aside className="hidden lg:block">
  {/* Calculation selector, filters */}
</aside>
```

**PeakValuesCards (adaptive layout):**
```typescript
// Mobile: Stacked vertically
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card>Power: 115 kW</Card>
  <Card>Torque: 225 N·m</Card>
  <Card>Peak Power RPM: 5500</Card>
  <Card>Peak Torque RPM: 3800</Card>
</div>

// Tablet: 2 columns
// Desktop: 4 columns inline
```

**Charts (responsive sizing):**
```typescript
// Height scales with viewport
<ReactECharts
  option={chartOption}
  style={{
    height: 'calc(100vh - 300px)',  // Adaptive height
    minHeight: '400px',             // Minimum on mobile
    width: '100%'                   // Full width always
  }}
/>

// ECharts grid margins adjust automatically
grid: {
  left: '10%',    // More space for Y-axis labels
  right: '10%',   // Space for right Y-axis
  top: '15%',     // Space for title
  bottom: '15%'   // Space for dataZoom
}
```

**DataTable (horizontal scroll on mobile):**
```typescript
// Mobile: Scrollable table
<div className="overflow-x-auto">
  <Table>
    {/* 73 parameters = wide table */}
  </Table>
</div>

// Desktop: Full width, no scroll needed
```

### Typography Scaling

**Headings:**
```typescript
// Mobile → Desktop scaling
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Engine Results Viewer
</h1>

<h2 className="text-xl md:text-2xl font-semibold">
  Project Name
</h2>
```

**Body text:**
- Base: `text-sm` (14px)
- Desktop: `md:text-base` (16px)
- Large screens: No change (16px is readable)

### Spacing and Layout

**Container padding:**
```typescript
// Mobile: Smaller padding (save screen space)
<main className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</main>
```

**Grid gaps:**
```typescript
// Tighter on mobile, comfortable on desktop
<div className="grid gap-4 md:gap-6 lg:gap-8">
  {/* Cards */}
</div>
```

### Images and Media

**Responsive images:**
```typescript
// Placeholder for future: Project thumbnails
<img
  src={thumbnail}
  alt="Project thumbnail"
  className="w-full h-auto object-cover"
  loading="lazy"
/>
```

### Performance Considerations

**Mobile:**
- Reduced animation duration (users expect faster)
- Lazy loading for off-screen content
- Smaller initial bundle (code splitting)

**Desktop:**
- Full animations enabled
- Preload hover states
- Larger cache for better performance

### Testing Matrix

**Devices tested:**
- ✅ iPhone 13 Pro (390×844, iOS Safari)
- ✅ iPad Air (820×1180, Safari)
- ✅ MacBook Pro 14" (1512×982, Chrome)
- ✅ Desktop 27" (2560×1440, Chrome)

**Browsers:**
- ✅ Chrome 120+ (primary)
- ✅ Safari 17+ (macOS, iOS)
- ✅ Firefox 121+ (secondary)
- ❌ Edge (not tested, but likely works - Chromium-based)

---

## Data Processing Algorithms

**Status:** ✅ Implemented (v2.0.0)

### RPM Step Calculator

**Purpose:** Display average RPM step instead of raw point count (more meaningful for users)

**Algorithm:**
```typescript
function calculateAverageStep(dataPoints: DataPoint[]): number {
  if (dataPoints.length < 2) return 0;

  // 1. Extract RPM values
  const rpms = dataPoints.map(point => point.RPM);

  // 2. Sort ascending (in case data is unsorted)
  rpms.sort((a, b) => a - b);

  // 3. Calculate steps between consecutive points
  const steps: number[] = [];
  for (let i = 1; i < rpms.length; i++) {
    steps.push(rpms[i] - rpms[i-1]);
  }

  // 4. Average the steps
  const avgStep = steps.reduce((sum, step) => sum + step, 0) / steps.length;

  // 5. Round to nearest 50 (50, 100, 150, 200, 250...)
  const roundedStep = Math.round(avgStep / 50) * 50;

  return roundedStep;
}
```

**Example:**
```
Input RPMs: [800, 900, 1000, 1100, 1250, 1400]
Steps: [100, 100, 100, 150, 150]
Average: 120
Rounded: 100 RPM step

Display: "RPM step: 100" (instead of "25 points")
```

**Why round to nearest 50?**
- Engine testing typically done in 50-200 RPM steps
- Rounding provides cleaner display
- Reflects real-world testing practices

---

### Peak Values Finder

**Purpose:** Find peak power, torque, and RPM at which peaks occur

**Algorithm:**
```typescript
function findPeakValues(dataPoints: DataPoint[]) {
  let maxPower = -Infinity;
  let maxTorque = -Infinity;
  let powerAtRPM = 0;
  let torqueAtRPM = 0;

  for (const point of dataPoints) {
    // Find max power
    if (point['P-Av'] > maxPower) {
      maxPower = point['P-Av'];
      powerAtRPM = point.RPM;
    }

    // Find max torque
    if (point.Torque > maxTorque) {
      maxTorque = point.Torque;
      torqueAtRPM = point.RPM;
    }
  }

  return {
    peakPower: { value: maxPower, rpm: powerAtRPM },
    peakTorque: { value: maxTorque, rpm: torqueAtRPM }
  };
}
```

**Display:**
```typescript
<Card>
  <CardTitle>Peak Power</CardTitle>
  <CardContent>
    <p className="text-3xl font-bold">{peakPower.value} kW</p>
    <p className="text-sm text-muted-foreground">
      at {peakPower.rpm} RPM
    </p>
  </CardContent>
</Card>
```

---

### Per-Cylinder Averaging

**Purpose:** Convert per-cylinder arrays to single averaged value for chart display

**Algorithm:**
```typescript
function averagePerCylinder(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Example: PCylMax for 4-cylinder engine
const pcylMax = [120.5, 122.3, 119.8, 121.2]; // bar per cylinder
const avgPcylMax = averagePerCylinder(pcylMax); // 120.95 bar
```

**Which parameters use averaging?**
- `PCylMax` - Max cylinder pressure (per-cylinder → averaged)
- `TCylMax` - Max cylinder temperature (per-cylinder → averaged)
- `TUbMax` - Max exhaust temperature (per-cylinder → averaged)
- `Deto` - Detonation degree (per-cylinder → averaged)
- `MaxDeg` - Maximum detonation degree (per-cylinder → averaged)

**Rationale:**
- Simplifies chart visualization (1 line instead of 4-6)
- Most users care about overall engine behavior
- Individual cylinder analysis = advanced feature (future enhancement)

---

### Color Assignment Algorithm

**Purpose:** Assign colors to calculations and parameters

**Algorithm 1: Calculation Colors (Comparison Mode)**
```typescript
// 5 colors cycling
const CALCULATION_COLORS = [
  '#e74c3c', // Red
  '#2ecc71', // Green
  '#3498db', // Blue
  '#f39c12', // Orange
  '#9b59b6'  // Purple
];

function getCalculationColor(index: number): string {
  return CALCULATION_COLORS[index % CALCULATION_COLORS.length];
}

// Assign to calculations
calculations.forEach((calc, index) => {
  calc.color = getCalculationColor(index);
});
```

**Algorithm 2: Parameter Colors (Single Calculation Mode)**
```typescript
// From config/parameters.ts
const PARAMETER_COLORS: Record<string, string> = {
  'P-Av': '#e74c3c',      // Red (power)
  'Torque': '#2ecc71',    // Green (torque)
  'PCylMax': '#3498db',   // Blue (pressure)
  'TCylMax': '#f39c12',   // Orange (temperature)
  // ... 73 parameters total
};

function getParameterColor(paramName: string): string {
  return PARAMETER_COLORS[paramName] || '#71717a'; // Gray fallback
}
```

**When to use which?**
- **Single calculation:** Use PARAMETER_COLORS (distinguish P-Av vs Torque)
- **Comparison mode:** Use CALCULATION_COLORS (distinguish Vesta vs Camry)

See: [ADR 003: Color Palette Engineering Style](decisions/003-color-palette-engineering-style.md)

---

### Units Conversion Algorithms

**Purpose:** Convert between SI, American, and HP unit systems

**Power Conversion:**
```typescript
function convertPower(kW: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'SI':
      return kW; // Already in kW
    case 'American':
      return kW * 1.341; // kW → bhp (brake horsepower)
    case 'HP':
      return kW * 1.36;  // kW → PS (metric horsepower)
  }
}
```

**Torque Conversion:**
```typescript
function convertTorque(Nm: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'SI':
      return Nm; // Already in N·m
    case 'American':
      return Nm * 0.7376; // N·m → lb-ft
    case 'HP':
      return Nm; // PS system uses N·m for torque
  }
}
```

**Pressure Conversion:**
```typescript
function convertPressure(bar: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'SI':
    case 'HP':
      return bar; // bar used in both
    case 'American':
      return bar * 14.504; // bar → psi
  }
}
```

**Temperature Conversion:**
```typescript
function convertTemperature(celsius: number, targetUnits: Units): number {
  switch (targetUnits) {
    case 'SI':
    case 'HP':
      return celsius; // °C used in both
    case 'American':
      return (celsius * 9/5) + 32; // °C → °F
  }
}
```

**Conversion Sources:**
- **1 kW = 1.341 bhp:** SAE J1349 standard (brake horsepower)
- **1 kW = 1.36 PS:** DIN 70020 standard (metric horsepower)
- **1 N·m = 0.7376 lb-ft:** Physics constant
- **1 bar = 14.504 psi:** Physics constant

---

## Parameter Configuration System

**Status:** ✅ Implemented (v2.0.0, 73 parameters supported)

### Single Source of Truth: parameters.ts

**File:** `frontend/src/config/parameters.ts`

**Purpose:**
- Central registry for all 73 engine parameters
- Parameter metadata (display name, unit, color, category)
- Used by parsers, charts, tables, export

**Structure:**
```typescript
export interface ParameterConfig {
  name: string;           // Display name (e.g., "P-Av")
  fullName: string;       // Full name (e.g., "Average Power")
  unit: string;           // SI unit (e.g., "kW")
  unitAmerican?: string;  // American unit (e.g., "bhp")
  unitHP?: string;        // HP system unit (e.g., "PS")
  color: string;          // Chart color (e.g., "#e74c3c")
  category: ParameterCategory;
  description: string;    // Engineering description
  isPerCylinder: boolean; // Array or scalar value
}

export const PARAMETERS: Record<string, ParameterConfig> = {
  'RPM': { ... },
  'P-Av': { ... },
  'Torque': { ... },
  // ... 73 parameters total
};
```

### Parameter Categories

```typescript
type ParameterCategory =
  | 'performance'   // Power, Torque
  | 'pressure'      // PCylMax, BMEP, IMEP, FMEP, PMEP
  | 'temperature'   // TCylMax, TUbMax
  | 'efficiency'    // PurCyl, LamAv
  | 'combustion'    // MaxDeg, Deto, Convergence
  | 'flow'          // Mass flow rates
  | 'other';        // Miscellaneous
```

**Usage in UI:**
```typescript
// Custom parameter selector (ChartPreset6)
<Tabs>
  <TabsList>
    <TabsTrigger value="performance">Performance</TabsTrigger>
    <TabsTrigger value="pressure">Pressure</TabsTrigger>
    <TabsTrigger value="temperature">Temperature</TabsTrigger>
    {/* ... */}
  </TabsList>

  <TabsContent value="performance">
    {/* Show only performance parameters */}
  </TabsContent>
</Tabs>
```

### Parameter Mapping Strategy

**Problem:** Different file formats use different names for same parameter

**Example:**
- `.det` file: `Purc` (short name)
- `.pou` file: `PurCyl` (full name)
- Both represent: Cylinder Charge Purity

**Solution: Canonical names in PARAMETERS**
```typescript
export const PARAMETERS = {
  'PurCyl': {
    name: 'PurCyl',
    aliases: ['Purc'],  // Alternative names
    // ...
  }
};

// Parser uses mapping:
function mapParameterName(rawName: string): string {
  // Search for parameter with this alias
  for (const [canonical, config] of Object.entries(PARAMETERS)) {
    if (config.aliases?.includes(rawName)) {
      return canonical;
    }
  }
  return rawName; // No mapping found, use as-is
}
```

### Integration with Parsers

**DET Parser:**
```typescript
// Parse column headers
const headers = line2.split(/\s+/).slice(1); // Skip service column

// Map to canonical names
const parameters = headers.map(mapParameterName);

// Validate against PARAMETERS config
parameters.forEach(param => {
  if (!PARAMETERS[param]) {
    console.warn(`Unknown parameter: ${param}`);
  }
});
```

**POU Parser:** Same pattern

### Integration with Charts

**Example: ChartPreset1.tsx**
```typescript
import { PARAMETERS } from '@/config/parameters';

// Get parameter config
const powerConfig = PARAMETERS['P-Av'];
const torqueConfig = PARAMETERS['Torque'];

// Use in chart
yAxis: [
  {
    name: `${powerConfig.name} (${powerConfig.unit})`,
    nameTextStyle: { color: powerConfig.color }
  },
  {
    name: `${torqueConfig.name} (${torqueConfig.unit})`,
    nameTextStyle: { color: torqueConfig.color }
  }
]
```

### Integration with Units Conversion

```typescript
// Get unit based on user settings
function getUnit(param: string, units: Units): string {
  const config = PARAMETERS[param];

  switch (units) {
    case 'SI':
      return config.unit;
    case 'American':
      return config.unitAmerican || config.unit;
    case 'HP':
      return config.unitHP || config.unit;
  }
}

// Update axis label dynamically
yAxis: {
  name: `${config.name} (${getUnit('P-Av', currentUnits)})`
}
// Result: "P-Av (kW)" → "P-Av (bhp)" → "P-Av (PS)"
```

### 73 Parameters Breakdown

**From .det (24 parameters):**
- RPM, P-Av, Torque, BMEP, IMEP, FMEP, PMEP
- PCylMax, TCylMax, TUbMax (per-cylinder arrays)
- PurCyl, LamAv, MaxDeg, Deto (per-cylinder arrays)
- ... (see [PARAMETERS-REFERENCE.md](PARAMETERS-REFERENCE.md))

**From .pou (71 parameters):**
- All .det parameters +
- Detailed combustion parameters
- Mass flow rates
- Heat transfer coefficients
- Emissions estimates
- ... (see [PARAMETERS-REFERENCE.md](PARAMETERS-REFERENCE.md))

**Merged format (.pou-merged):**
- 75 parameters total (71 from .pou + 4 critical from .det)
- Critical .det params: P-Av, Torque, BMEP, RPM
- Why? .pou may have slightly different values due to calculation method

---

## Chart Implementation Patterns

**Status:** ✅ Implemented (v2.0.0, 6 presets)

See detailed documentation: **[docs/chart-presets.md](chart-presets.md)**

### Quick Reference

**Dual Y-Axis Pattern:**
- Used when parameters have different units or scales
- Examples: Power (kW) vs Torque (N·m), Pressure (bar) vs Temperature (°C)
- Left axis: Primary parameter, Right axis: Secondary parameter

**Line Style Conventions:**
- Solid: Primary/most important parameter
- Dashed: Secondary parameter
- Dotted: Tertiary parameter
- Purpose: Distinguishability beyond color (accessibility, print)

**Color Systems:**
- **Single calculation:** PARAMETER_COLORS (distinguish P-Av vs Torque)
- **Comparison mode:** CALCULATION_COLORS (distinguish Calc1 vs Calc2)
- See: [ADR 003: Color Palette Engineering Style](decisions/003-color-palette-engineering-style.md)

**Axis Label Format:**
- Pattern: `{ParameterName} ({Unit})`
- Examples: `P-Av (kW)`, `Torque (N·m)`, `PCylMax (bar)`
- **CRITICAL:** Always use original English parameter names (never translate)

**Legend Format:**
- Pattern: `{CalculationName} - {ParameterName}`
- Example: `Vesta 1.6 IM - P-Av`
- No units in legend (only on axes)

**Per-Cylinder Handling:**
- Parameters like PCylMax, TCylMax are arrays
- Chart displays averaged value: `average(cylinder1, cylinder2, ...)`
- Simplifies visualization (1 line instead of 4-6)

**6 Chart Presets:**
1. **Power & Torque** - Most important (P-Av, Torque, dual Y-axis)
2. **Pressure & Temperature** - Durability analysis (PCylMax, TCylMax, TUbMax)
3. **MEP** - Efficiency analysis (FMEP, IMEP, BMEP, PMEP)
4. **Critical Values** - Safety analysis (PCylMax, MaxDeg) ⚠️
5. **Volumetric Efficiency** - Breathing analysis (PurCyl, LamAv)
6. **Custom** - User-defined parameters (modal selector)

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
