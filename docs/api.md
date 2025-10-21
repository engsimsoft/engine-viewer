# API Документация

**Дата:** 21 октября 2025
**Версия:** 1.0 (обновлено после версии 0.2.0)
**Base URL:** `http://localhost:3000`

---

## ⚠️ ВАЖНО: TypeScript типы

Все типы данных определены в файле **[shared-types.ts](../shared-types.ts)**.

**Использование типов:**
- См. раздел "TypeScript Types" в конце этого документа
- Полные определения типов: [shared-types.ts](../shared-types.ts)
- Архитектура типов: [architecture.md](architecture.md#typescript-типы-shared-typests)

---

## Общие сведения

**Protocol:** HTTP/1.1
**Format:** JSON
**Encoding:** UTF-8

### Headers

**Request:**
```
Content-Type: application/json
Accept: application/json
```

**Response:**
```
Content-Type: application/json; charset=utf-8
```

---

## Endpoints

### 1. Health Check

Проверка работоспособности сервера.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

**Status Codes:**
- `200 OK` - сервер работает

**Example:**
```bash
curl http://localhost:3000/health
```

---

### 2. Get Projects List

Получить список всех проектов (файлов `.det`) из папки `test-data/`.

**Endpoint:** `GET /api/projects`

**Response:**
```json
[
  {
    "id": "vesta-1-6-im",
    "name": "Vesta 1.6 IM",
    "file_path": "test-data/Vesta 1.6 IM.det",
    "modified_date": "2025-10-21T10:30:00Z",
    "calculations_count": 2,
    "file_size": 15234
  }
]
```

**Response Fields:**
- `id` (string) - уникальный идентификатор проекта (slug от имени файла)
- `name` (string) - название проекта (имя файла без расширения)
- `file_path` (string) - относительный путь к файлу
- `modified_date` (string) - дата последнего изменения файла (ISO 8601)
- `calculations_count` (number) - количество расчётов в файле
- `file_size` (number) - размер файла в байтах

**Status Codes:**
- `200 OK` - успешно
- `500 Internal Server Error` - ошибка сервера

**Example:**
```bash
curl http://localhost:3000/api/projects
```

**Response Example:**
```json
[
  {
    "id": "vesta-1-6-im",
    "name": "Vesta 1.6 IM",
    "file_path": "test-data/Vesta 1.6 IM.det",
    "modified_date": "2025-10-21T10:30:00.000Z",
    "calculations_count": 2,
    "file_size": 15234
  }
]
```

**Empty State:**
Если файлов нет:
```json
[]
```

---

### 3. Get Project Data

Получить данные конкретного проекта (результат парсинга `.det` файла).

**Endpoint:** `GET /api/project/:id`

**URL Parameters:**
- `id` (string, required) - идентификатор проекта (из `GET /api/projects`)

**Response:**
```json
{
  "project_name": "Vesta 1.6 IM",
  "file_path": "test-data/Vesta 1.6 IM.det",
  "modified_date": "2025-10-21T10:30:00Z",
  "engine": {
    "type": "NATUR",
    "cylinders": 4
  },
  "parameters": [
    "RPM",
    "P-Av",
    "Torque",
    "PurCyl( 1)",
    "PurCyl( 2)",
    "PurCyl( 3)",
    "PurCyl( 4)",
    "TUbMax( 1)",
    "TUbMax( 2)",
    "TUbMax( 3)",
    "TUbMax( 4)",
    "TCylMax( 1)",
    "TCylMax( 2)",
    "TCylMax( 3)",
    "TCylMax( 4)",
    "PCylMax( 1)",
    "PCylMax( 2)",
    "PCylMax( 3)",
    "PCylMax( 4)",
    "Deto( 1)",
    "Deto( 2)",
    "Deto( 3)",
    "Deto( 4)",
    "Convergence"
  ],
  "calculations": [
    {
      "id": "$1",
      "name": "$1",
      "data": [
        {
          "RPM": 2600,
          "P-Av": 33.69,
          "Torque": 123.73,
          "PurCyl( 1)": 0.8898,
          "PurCyl( 2)": 0.8898,
          "PurCyl( 3)": 0.8898,
          "PurCyl( 4)": 0.8897,
          "TUbMax( 1)": 719.6,
          "TUbMax( 2)": 719.2,
          "TUbMax( 3)": 719.4,
          "TUbMax( 4)": 719.4,
          "TCylMax( 1)": 2302.2,
          "TCylMax( 2)": 2301.9,
          "TCylMax( 3)": 2302.0,
          "TCylMax( 4)": 2301.9,
          "PCylMax( 1)": 64.6,
          "PCylMax( 2)": 64.6,
          "PCylMax( 3)": 64.6,
          "PCylMax( 4)": 64.6,
          "Deto( 1)": 0.0,
          "Deto( 2)": 0.0,
          "Deto( 3)": 0.0,
          "Deto( 4)": 0.0,
          "Convergence": 0.0
        },
        {
          "RPM": 2800,
          "P-Av": 41.92,
          "Torque": 142.97,
          "...": "..."
        }
      ]
    },
    {
      "id": "$2",
      "name": "$2",
      "data": [
        {
          "RPM": 2600,
          "P-Av": 33.37,
          "Torque": 122.56,
          "...": "..."
        }
      ]
    }
  ]
}
```

**Response Fields:**
- `project_name` (string) - название проекта
- `file_path` (string) - путь к файлу
- `modified_date` (string) - дата изменения (ISO 8601)
- `engine` (object) - информация о двигателе
  - `type` (string) - тип двигателя ("NATUR", "TURBO", и т.д.)
  - `cylinders` (number) - количество цилиндров
- `parameters` (string[]) - список всех параметров (названия колонок)
- `calculations` (Calculation[]) - массив расчётов
  - `id` (string) - идентификатор расчёта ("$1", "$2", ...)
  - `name` (string) - название расчёта (то же что id)
  - `data` (DataPoint[]) - массив точек данных
    - Каждый DataPoint содержит значения для всех параметров

**Status Codes:**
- `200 OK` - успешно
- `404 Not Found` - проект не найден
- `500 Internal Server Error` - ошибка парсинга или чтения файла

**Example:**
```bash
curl http://localhost:3000/api/project/vesta-1-6-im
```

**Error Response (404):**
```json
{
  "error": "Project not found",
  "message": "Project with id 'invalid-id' does not exist"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to parse file",
  "message": "Invalid file format: missing header"
}
```

---

### 4. Get Configuration

Получить текущую конфигурацию приложения.

**Endpoint:** `GET /api/config`

**Response:**
```json
{
  "files": {
    "path": "./test-data",
    "extensions": [".det"],
    "scan_on_startup": true,
    "watch_interval": 5
  },
  "server": {
    "host": "localhost",
    "port": 3000,
    "auto_open_browser": false
  },
  "ui": {
    "max_calculations_compare": 5,
    "default_preset": "power_torque",
    "language": "ru"
  },
  "colors": {
    "calculation_1": "#ff6b6b",
    "calculation_2": "#4ecdc4",
    "calculation_3": "#45b7d1",
    "calculation_4": "#f9ca24",
    "calculation_5": "#a29bfe"
  },
  "charts": {
    "theme": "light",
    "animation": true,
    "show_grid": true,
    "export_format": "png"
  }
}
```

**Status Codes:**
- `200 OK` - успешно
- `500 Internal Server Error` - ошибка чтения конфигурации

**Example:**
```bash
curl http://localhost:3000/api/config
```

---

### 5. Update Configuration

Обновить конфигурацию приложения.

**Endpoint:** `POST /api/config`

**Request Body:**
```json
{
  "ui": {
    "max_calculations_compare": 10,
    "default_preset": "pressure"
  },
  "charts": {
    "theme": "dark"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "config": {
    "files": {
      "path": "./test-data",
      "extensions": [".det"],
      "scan_on_startup": true,
      "watch_interval": 5
    },
    "server": {
      "host": "localhost",
      "port": 3000,
      "auto_open_browser": false
    },
    "ui": {
      "max_calculations_compare": 10,
      "default_preset": "pressure",
      "language": "ru"
    },
    "colors": {
      "calculation_1": "#ff6b6b",
      "calculation_2": "#4ecdc4",
      "calculation_3": "#45b7d1",
      "calculation_4": "#f9ca24",
      "calculation_5": "#a29bfe"
    },
    "charts": {
      "theme": "dark",
      "animation": true,
      "show_grid": true,
      "export_format": "png"
    }
  }
}
```

**Status Codes:**
- `200 OK` - успешно обновлено
- `400 Bad Request` - невалидные данные
- `500 Internal Server Error` - ошибка записи конфигурации

**Example:**
```bash
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{"ui": {"max_calculations_compare": 10}}'
```

**Error Response (400):**
```json
{
  "error": "Invalid configuration",
  "message": "ui.max_calculations_compare must be a number between 1 and 10"
}
```

---

## TypeScript Types

### ProjectListItem
```typescript
interface ProjectListItem {
  id: string;
  name: string;
  file_path: string;
  modified_date: string;
  calculations_count: number;
  file_size: number;
}
```

### ProjectData
```typescript
interface ProjectData {
  project_name: string;
  file_path: string;
  modified_date: string;
  engine: {
    type: string;
    cylinders: number;
  };
  parameters: string[];
  calculations: Calculation[];
}

interface Calculation {
  id: string;
  name: string;
  data: DataPoint[];
}

interface DataPoint {
  RPM: number;
  "P-Av": number;
  Torque: number;
  "PurCyl( 1)": number;
  "PurCyl( 2)": number;
  "PurCyl( 3)": number;
  "PurCyl( 4)": number;
  "TUbMax( 1)": number;
  "TUbMax( 2)": number;
  "TUbMax( 3)": number;
  "TUbMax( 4)": number;
  "TCylMax( 1)": number;
  "TCylMax( 2)": number;
  "TCylMax( 3)": number;
  "TCylMax( 4)": number;
  "PCylMax( 1)": number;
  "PCylMax( 2)": number;
  "PCylMax( 3)": number;
  "PCylMax( 4)": number;
  "Deto( 1)": number;
  "Deto( 2)": number;
  "Deto( 3)": number;
  "Deto( 4)": number;
  Convergence: number;
}
```

### Config
```typescript
interface Config {
  files: {
    path: string;
    extensions: string[];
    scan_on_startup: boolean;
    watch_interval: number;
  };
  server: {
    host: string;
    port: number;
    auto_open_browser: boolean;
  };
  ui: {
    max_calculations_compare: number;
    default_preset: string;
    language: string;
  };
  colors: {
    calculation_1: string;
    calculation_2: string;
    calculation_3: string;
    calculation_4: string;
    calculation_5: string;
  };
  charts: {
    theme: string;
    animation: boolean;
    show_grid: boolean;
    export_format: string;
  };
}
```

---

## Error Handling

Все ошибки возвращаются в формате:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Error Types
- `Project not found` - проект с указанным ID не существует
- `Failed to parse file` - ошибка парсинга .det файла
- `Invalid configuration` - невалидные данные конфигурации
- `File not found` - файл не найден на диске
- `Internal server error` - внутренняя ошибка сервера

---

## Frontend API Client Example

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get projects
export const getProjects = async (): Promise<ProjectListItem[]> => {
  const response = await apiClient.get<ProjectListItem[]>('/api/projects');
  return response.data;
};

// Get project data
export const getProject = async (id: string): Promise<ProjectData> => {
  const response = await apiClient.get<ProjectData>(`/api/project/${id}`);
  return response.data;
};

// Get config
export const getConfig = async (): Promise<Config> => {
  const response = await apiClient.get<Config>('/api/config');
  return response.data;
};

// Update config
export const updateConfig = async (config: Partial<Config>): Promise<Config> => {
  const response = await apiClient.post<{config: Config}>('/api/config', config);
  return response.data.config;
};
```

---

## Versioning

**Текущая версия:** v1

В будущем при breaking changes версия API будет меняться:
- `GET /api/v1/projects`
- `GET /api/v2/projects`

---

## Rate Limiting

**Текущий статус:** Нет ограничений

В production можно добавить:
- Максимум 100 запросов в минуту на IP

---

## CORS

**Dev режим:** Разрешены запросы с `http://localhost:5173`

**Production:** Настроить allowed origins в `server.js`

---

## Дополнительные endpoints (будущие)

Возможные endpoints для расширения функционала:

### Export to CSV
```
POST /api/export/csv
Body: { projectId, calculationIds, parameters }
Response: CSV file download
```

### Export Chart to PNG
```
POST /api/export/chart
Body: { projectId, preset, calculationIds }
Response: PNG file download
```

### Compare Calculations
```
POST /api/compare
Body: { projectId, calculationIds }
Response: Comparison statistics
```

---

## TypeScript Types

**Статус:** ✅ Реализовано (версия 0.2.0)

Все типы данных определены в **[shared-types.ts](../shared-types.ts)** (300+ строк).

### Основные типы

**Core Types:**
```typescript
// Метаданные двигателя
interface EngineMetadata {
  numCylinders: number;
  engineType: 'NATUR' | 'TURBO' | 'SUPERCHARGED';
}

// Одна точка данных (одна строка в .det файле)
interface DataPoint {
  RPM: number;
  PAv: number;        // Средняя мощность (кВт)
  Torque: number;     // Момент (Н·м)
  PurCyl: [number, number, number, number];   // Коэф. наполнения
  TUbMax: [number, number, number, number];   // Темп. выхлопа (°C)
  TCylMax: [number, number, number, number];  // Темп. цилиндра (°C)
  PCylMax: [number, number, number, number];  // Давление (бар)
  Deto: [number, number, number, number];     // Детонация
  Convergence: number;
}

// Один расчёт
interface Calculation {
  id: string;                 // Например: "1", "3.1"
  marker: string;             // Например: "$1", "$3.1"
  dataPoints: DataPoint[];
  metadata?: CalculationMetadata;
}

// Полный проект
interface ProjectData {
  id: string;
  name: string;
  filePath: string;
  metadata: EngineMetadata;
  calculations: Calculation[];
  modifiedAt: Date;
  fileSize: number;
}

// Краткая информация
interface ProjectInfo {
  id: string;
  name: string;
  calculationsCount: number;
  numCylinders: number;
  engineType: 'NATUR' | 'TURBO' | 'SUPERCHARGED';
  modifiedAt: Date;
  fileSize: number;
}
```

**API Response Types:**
```typescript
interface GetProjectsResponse {
  projects: ProjectInfo[];
}

interface GetProjectResponse {
  project: ProjectData;
}

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
```

**Chart Types:**
```typescript
type ChartParameter =
  | 'RPM' | 'PAv' | 'Torque'
  | 'PurCyl1' | 'PurCyl2' | 'PurCyl3' | 'PurCyl4'
  | 'TUbMax1' | 'TUbMax2' | 'TUbMax3' | 'TUbMax4'
  | 'TCylMax1' | 'TCylMax2' | 'TCylMax3' | 'TCylMax4'
  | 'PCylMax1' | 'PCylMax2' | 'PCylMax3' | 'PCylMax4'
  | 'Deto1' | 'Deto2' | 'Deto3' | 'Deto4'
  | 'Convergence';

type ChartPreset = 'preset1' | 'preset2' | 'preset3' | 'custom';

interface ChartPresetConfig {
  id: ChartPreset;
  name: string;
  description: string;
  parameters: ChartParameter[];
  dualYAxis: boolean;
  yAxisLeft?: ChartParameter[];
  yAxisRight?: ChartParameter[];
}

interface SelectedCalculations {
  calculationIds: string[];
  colors: Record<string, string>;
}
```

**Export Types:**
```typescript
type ChartExportFormat = 'png' | 'svg' | 'jpg';
type DataExportFormat = 'csv' | 'excel' | 'json';

interface ChartExportOptions {
  format: ChartExportFormat;
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
}

interface DataExportOptions {
  format: DataExportFormat;
  includeMetadata?: boolean;
  selectedOnly?: boolean;
}
```

### Использование в коде

**Backend (Node.js с JSDoc):**
```javascript
/**
 * @typedef {import('../shared-types').ProjectData} ProjectData
 * @typedef {import('../shared-types').Calculation} Calculation
 */

/**
 * Parse .det file and return structured data
 * @param {string} filePath - Path to .det file
 * @returns {Promise<ProjectData>}
 */
async function parseDetFile(filePath) {
  // Implementation
}
```

**Frontend (React с TypeScript):**
```typescript
import type {
  ProjectData,
  Calculation,
  ChartPreset,
  SelectedCalculations
} from '../shared-types';

interface ProjectPageProps {
  projectId: string;
}

const ProjectPage: React.FC<ProjectPageProps> = ({ projectId }) => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [selected, setSelected] = useState<SelectedCalculations>({
    calculationIds: [],
    colors: {}
  });

  // Full type safety
};
```

### Преимущества

1. **Single Source of Truth** - все типы в одном файле
2. **Type Safety** - ошибки выявляются на этапе компиляции
3. **Sync** - backend и frontend используют одинаковые типы
4. **Autocomplete** - IDE подсказывает доступные поля
5. **Documentation** - типы служат документацией

### Основано на реальных данных

Типы созданы на основе анализа файла `test-data/Vesta 1.6 IM.det`:
- 462 строки
- 17 расчётов ($1-$9.3)
- 24 параметра данных
- **Учтено:** первая колонка служебная (номера строк)

### Ссылки

- **Полный файл:** [shared-types.ts](../shared-types.ts)
- **Архитектура:** [architecture.md](architecture.md#typescript-типы-shared-typests)
- **Roadmap:** [roadmap.md](../roadmap.md)

---

**API спроектирован и готов к реализации! 🚀**

**Следующие шаги:**
1. Реализовать backend endpoints согласно спецификации
2. Создать frontend API client с типизацией
3. Использовать типы из shared-types.ts везде
3. Тестировать все endpoints
