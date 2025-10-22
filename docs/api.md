# 🔌 API Documentation

**Engine Results Viewer REST API**

**Версия:** 1.2.0 (22 октября 2025)
**Base URL (Backend):** `http://localhost:3000`
**Base URL (Frontend Proxy):** `http://localhost:5173/api` → проксируется на backend
**Статус:** ✅ Реализовано и протестировано

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [API Info](#api-info)
  - [List Projects](#list-projects)
  - [Get Project Data](#get-project-data)
- [Data Types](#data-types)
- [Examples](#examples)
- [TypeScript Types](#typescript-types)

---

## Overview

The Engine Results Viewer API provides access to engine calculation data stored in `.det` files. The API allows you to:

- List all available engine projects
- Retrieve detailed calculation data for specific projects
- Access metadata about engines and calculations

**Technology Stack:**
- Node.js + Express
- ES Modules
- CORS enabled for frontend (`http://localhost:5173`)

**Performance:**
- Project listing: ~9ms (for 2 files, 364 KB total)
- Project data parsing: ~5ms (30 calculations, 804 data points)
- Response caching: Config cached at server startup

---

## Authentication

**Currently:** No authentication required (local development)

**Future:** May add API keys or JWT tokens for production deployment

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_PROJECT_ID` | 400 | Project ID format is invalid |
| `PROJECT_NOT_FOUND` | 404 | Project with specified ID not found |
| `DIRECTORY_NOT_FOUND` | 404 | Data directory does not exist |
| `INTERNAL_ERROR` | 500 | Server error (parsing failed, etc.) |

---

## Endpoints

### Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T21:00:00.000Z",
  "uptime": 123.456
}
```

**Response Fields:**
- `status` (string): Always "ok" if server is running
- `timestamp` (string): Current server time (ISO 8601)
- `uptime` (number): Server uptime in seconds

**Status Codes:**
- `200 OK` - Server is running

---

### API Info

Get information about available API endpoints.

**Endpoint:** `GET /api`

**Request:**
```bash
curl http://localhost:3000/api
```

**Response:**
```json
{
  "name": "Engine Results Viewer API",
  "version": "1.0.0",
  "description": "REST API for engine calculation data visualization",
  "endpoints": {
    "health": {
      "method": "GET",
      "path": "/health",
      "description": "Health check endpoint"
    },
    "projects": {
      "method": "GET",
      "path": "/api/projects",
      "description": "Get list of all available projects"
    },
    "project": {
      "method": "GET",
      "path": "/api/project/:id",
      "description": "Get full data for a specific project"
    }
  },
  "documentation": "See docs/api.md for detailed API documentation"
}
```

**Status Codes:**
- `200 OK` - Success

---

### List Projects

Get a list of all available engine calculation projects.

**Endpoint:** `GET /projects`

**Query Parameters:** None

**Request (Direct to Backend):**
```bash
curl http://localhost:3000/projects
```

**Request (Through Frontend Proxy):**
```bash
curl http://localhost:5173/api/projects
```
Note: Frontend proxy automatically strips `/api` prefix before forwarding to backend.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bmw-m42",
      "name": "BMW M42",
      "fileName": "BMW M42.det",
      "numCylinders": 4,
      "engineType": "NATUR",
      "calculationsCount": 30,
      "fileSize": 234772,
      "fileSizeFormatted": "229.3 KB",
      "lastModified": "2025-10-21T17:29:52.004Z",
      "created": "2025-10-21T17:29:52.004Z"
    },
    {
      "id": "vesta-16-im",
      "name": "Vesta 1.6 IM",
      "fileName": "Vesta 1.6 IM.det",
      "numCylinders": 4,
      "engineType": "NATUR",
      "calculationsCount": 17,
      "fileSize": 129523,
      "fileSizeFormatted": "126.5 KB",
      "lastModified": "2025-10-21T13:50:35.978Z",
      "created": "2025-10-21T13:50:35.978Z"
    }
  ],
  "meta": {
    "total": 2,
    "scannedAt": 1729523400000,
    "scanDuration": 9,
    "directory": {
      "path": "/Users/mactm/Projects/engine-viewer/test-data",
      "totalFiles": 2,
      "totalSize": 364295,
      "totalSizeFormatted": "355.8 KB"
    }
  }
}
```

**Response Fields:**

**data[]** (array of projects):
- `id` (string): Normalized project identifier (slug format, e.g., "bmw-m42")
- `name` (string): Display name (filename without extension)
- `fileName` (string): Original filename with extension
- `numCylinders` (number): Number of engine cylinders (from metadata)
- `engineType` (string): Engine type ("NATUR", "TURBO", etc.)
- `calculationsCount` (number): Number of calculations in the file
- `fileSize` (number): File size in bytes
- `fileSizeFormatted` (string): Human-readable file size (e.g., "229.3 KB")
- `lastModified` (string): Last modification date (ISO 8601)
- `created` (string): File creation date (ISO 8601)

**meta** (response metadata):
- `total` (number): Total number of projects found
- `scannedAt` (number): Timestamp when scan was performed (Unix epoch ms)
- `scanDuration` (number): Time taken to scan directory (milliseconds)
- `directory.path` (string): Absolute path to data directory
- `directory.totalFiles` (number): Total number of .det files found
- `directory.totalSize` (number): Total size of all files (bytes)
- `directory.totalSizeFormatted` (string): Human-readable total size

**Notes:**
- Projects are sorted by `lastModified` date (newest first)
- Empty array `[]` returned if no projects found

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Data directory not found
- `500 Internal Server Error` - Server error

---

### Get Project Data

Get full calculation data for a specific project by ID.

**Endpoint:** `GET /project/:id`

**URL Parameters:**
- `id` (string, required): Project identifier (normalized slug)
  - Format: lowercase letters, numbers, hyphens only
  - Examples: "bmw-m42", "vesta-16-im"

**Request (Direct to Backend):**
```bash
curl http://localhost:3000/project/vesta-16-im
```

**Request (Through Frontend Proxy):**
```bash
curl http://localhost:5173/api/project/vesta-16-im
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vesta-16-im",
    "name": "Vesta 1.6 IM",
    "fileName": "Vesta 1.6 IM.det",
    "metadata": {
      "numCylinders": 4,
      "engineType": "NATUR"
    },
    "calculations": [
      {
        "id": "$1",
        "marker": "$1",
        "dataPoints": [
          {
            "RPM": 2600,
            "P-Av": 33.69,
            "Torque": 123.73,
            "PurCyl": [0.8898, 0.8898, 0.8898, 0.8897],
            "TUbMax": [719.6, 719.2, 719.4, 719.4],
            "TCylMax": [2302.2, 2301.9, 2302, 2301.9],
            "PCylMax": [64.6, 64.6, 64.6, 64.6],
            "Deto": [0, 0, 0, 0],
            "Convergence": 0
          },
          {
            "RPM": 2800,
            "P-Av": 41.92,
            "Torque": 142.97,
            "PurCyl": [0.9483, 0.9483, 0.9483, 0.9484],
            "TUbMax": [673, 673.4, 673.3, 672.9],
            "TCylMax": [2368.1, 2368.4, 2368.4, 2368.2],
            "PCylMax": [71, 70.9, 70.9, 71],
            "Deto": [0, 0, 0, 0],
            "Convergence": 0
          }
        ],
        "metadata": {
          "totalPoints": 26,
          "rpmRange": { "min": 2600, "max": 7800 },
          "powerRange": { "min": 33.69, "max": 159.05 },
          "torqueRange": { "min": 123.73, "max": 219.13 }
        }
      }
    ],
    "fileInfo": {
      "size": 129523,
      "sizeFormatted": "126.5 KB",
      "lastModified": "2025-10-21T13:50:35.978Z",
      "created": "2025-10-21T13:50:35.978Z"
    }
  },
  "meta": {
    "totalCalculations": 17,
    "totalDataPoints": 443,
    "parseDuration": 6
  }
}
```

**Response Fields:**

**data** (project data):
- `id` (string): Project identifier (slug)
- `name` (string): Display name
- `fileName` (string): Original filename
- `metadata` (object): Engine metadata
  - `numCylinders` (number): Number of cylinders
  - `engineType` (string): Engine type
- `calculations[]` (array): Array of calculation objects
- `fileInfo` (object): File metadata

**calculations[]** (calculation data):
- `id` (string): Calculation identifier (e.g., "$1", "$2", "$3.1")
- `marker` (string): Original marker from .det file
- `dataPoints[]` (array): Array of measurement points
- `metadata` (object): Calculation statistics

**dataPoints[]** (measurement point):
- `RPM` (number): Engine speed (revolutions per minute)
- `P-Av` (number): Average power (kW)
- `Torque` (number): Torque (N·m)
- `PurCyl` (array[number]): Pure cylinder values (one per cylinder)
- `TUbMax` (array[number]): Maximum exhaust temperature (°C)
- `TCylMax` (array[number]): Maximum cylinder temperature (°C)
- `PCylMax` (array[number]): Maximum cylinder pressure (bar)
- `Deto` (array[number]): Detonation values
- `Convergence` (number): Convergence value

**calculations[].metadata** (statistics):
- `totalPoints` (number): Number of data points in this calculation
- `rpmRange` (object): RPM range {min, max}
- `powerRange` (object): Power range {min, max} (kW)
- `torqueRange` (object): Torque range {min, max} (N·m)

**meta** (response metadata):
- `totalCalculations` (number): Total number of calculations
- `totalDataPoints` (number): Total data points across all calculations
- `parseDuration` (number): Time to parse the file (milliseconds)

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid project ID format
- `404 Not Found` - Project not found
- `500 Internal Server Error` - Parsing error

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PROJECT_ID",
    "message": "Invalid project ID format",
    "details": "Project ID must contain only lowercase letters, numbers, and hyphens"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found",
    "details": "No project found with ID: nonexistent"
  }
}
```

---

## Data Types

### ID Normalization

Project IDs are normalized from filenames using the following rules:
- Remove `.det` extension
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters (keep only `a-z`, `0-9`, `-`)

**Examples:**
- `"Vesta 1.6 IM.det"` → `"vesta-16-im"`
- `"BMW M42.det"` → `"bmw-m42"`
- `"Engine_Test v2.0.det"` → `"enginetest-v20"`

**Implementation:**
```javascript
// backend/src/services/fileScanner.js
export function normalizeFilenameToId(filename) {
  return filename
    .replace(/\.det$/i, '')  // Remove .det extension
    .toLowerCase()           // Convert to lowercase
    .replace(/\s+/g, '-')    // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
}
```

### Engine Types

Supported engine types (from .det file metadata):
- `NATUR` - Naturally aspirated
- `TURBO` - Turbocharged
- `KOMPRESSOR` - Supercharged
- (Other types as defined in .det files)

### File Size Formatting

File sizes are automatically formatted:
- < 1 KB: "X bytes"
- < 1 MB: "X.X KB"
- < 1 GB: "X.X MB"
- ≥ 1 GB: "X.X GB"

---

## Examples

### Example 1: JavaScript (Fetch API)

```javascript
// List all projects
async function getProjects() {
  const response = await fetch('http://localhost:3000/api/projects');
  const result = await response.json();

  if (result.success) {
    console.log(`Found ${result.meta.total} projects`);
    result.data.forEach(project => {
      console.log(`- ${project.name}: ${project.calculationsCount} calculations`);
    });
  } else {
    console.error(`Error: ${result.error.message}`);
  }
}

// Get specific project
async function getProject(id) {
  const response = await fetch(`http://localhost:3000/api/project/${id}`);
  const result = await response.json();

  if (result.success) {
    console.log(`Project: ${result.data.name}`);
    console.log(`Calculations: ${result.meta.totalCalculations}`);
    console.log(`Data points: ${result.meta.totalDataPoints}`);
  } else {
    console.error(`Error: ${result.error.message}`);
  }
}

// Usage
await getProjects();
await getProject('vesta-16-im');
```

---

### Example 2: React Component with Axios

```typescript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000
});

interface Project {
  id: string;
  name: string;
  numCylinders: number;
  engineType: string;
  calculationsCount: number;
  fileSizeFormatted: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/api/projects');
        if (data.success) {
          setProjects(data.data);
        } else {
          setError(data.error.message);
        }
      } catch (err) {
        setError('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {projects.map(project => (
        <li key={project.id}>
          {project.name} - {project.calculationsCount} calculations
        </li>
      ))}
    </ul>
  );
};
```

---

### Example 3: Python (requests)

```python
import requests

BASE_URL = 'http://localhost:3000'

# List all projects
response = requests.get(f'{BASE_URL}/api/projects')
data = response.json()

if data['success']:
    print(f"Found {data['meta']['total']} projects")
    for project in data['data']:
        print(f"- {project['name']}: {project['calculationsCount']} calculations")
else:
    print(f"Error: {data['error']['message']}")

# Get specific project
response = requests.get(f'{BASE_URL}/api/project/vesta-16-im')
data = response.json()

if data['success']:
    project = data['data']
    print(f"Project: {project['name']}")
    print(f"Calculations: {data['meta']['totalCalculations']}")
    print(f"Data points: {data['meta']['totalDataPoints']}")

    # Access first calculation's first data point
    first_calc = project['calculations'][0]
    first_point = first_calc['dataPoints'][0]
    print(f"RPM: {first_point['RPM']}, Power: {first_point['P-Av']} kW")
else:
    print(f"Error: {data['error']['message']}")
```

---

### Example 4: CURL Examples

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api

# List projects
curl http://localhost:3000/api/projects | jq

# Get project (pretty print)
curl http://localhost:3000/api/project/vesta-16-im | jq

# Get project summary (using jq)
curl -s http://localhost:3000/api/project/bmw-m42 | jq '{
  name: .data.name,
  calculations: .meta.totalCalculations,
  dataPoints: .meta.totalDataPoints,
  parseTime: .meta.parseDuration
}'

# Error handling - nonexistent project
curl http://localhost:3000/api/project/nonexistent | jq

# Error handling - invalid ID
curl "http://localhost:3000/api/project/Invalid%20ID%20123!" | jq
```

---

### Example 5: Performance Testing

```bash
# Test API response time
time curl -s http://localhost:3000/api/projects > /dev/null

# Run multiple requests to test average response time
for i in {1..10}; do
  time curl -s http://localhost:3000/api/projects > /dev/null
done

# Run automated tests (comprehensive test suite)
cd backend
./test-api.sh
```

**Expected Performance:**
- `/api/projects`: ~9-15ms
- `/api/project/vesta-16-im`: ~6-10ms (17 calculations, 443 points)
- `/api/project/bmw-m42`: ~5-8ms (30 calculations, 804 points)

---

## TypeScript Types

Full TypeScript type definitions are available in [shared-types.ts](../shared-types.ts) (300+ строк).

### Core Data Types

```typescript
// Engine metadata
interface EngineMetadata {
  numCylinders: number;
  engineType: 'NATUR' | 'TURBO' | 'SUPERCHARGED' | string;
}

// Single data point (one measurement)
interface DataPoint {
  RPM: number;
  'P-Av': number;      // Average power (kW)
  Torque: number;      // Torque (N·m)
  PurCyl: number[];    // Pure cylinder values
  TUbMax: number[];    // Max exhaust temperature (°C)
  TCylMax: number[];   // Max cylinder temperature (°C)
  PCylMax: number[];   // Max cylinder pressure (bar)
  Deto: number[];      // Detonation values
  Convergence: number;
}

// Calculation metadata
interface CalculationMetadata {
  totalPoints: number;
  rpmRange: { min: number; max: number };
  powerRange: { min: number; max: number };
  torqueRange: { min: number; max: number };
}

// Single calculation
interface Calculation {
  id: string;
  marker: string;
  dataPoints: DataPoint[];
  metadata: CalculationMetadata;
}

// Project data (full)
interface ProjectData {
  id: string;
  name: string;
  fileName: string;
  metadata: EngineMetadata;
  calculations: Calculation[];
  fileInfo: {
    size: number;
    sizeFormatted: string;
    lastModified: string;
    created: string;
  };
}

// Project info (summary)
interface ProjectInfo {
  id: string;
  name: string;
  fileName: string;
  numCylinders: number;
  engineType: string;
  calculationsCount: number;
  fileSize: number;
  fileSizeFormatted: string;
  lastModified: string;
  created: string;
}
```

### API Response Types

```typescript
// List projects response
interface ListProjectsResponse {
  success: true;
  data: ProjectInfo[];
  meta: {
    total: number;
    scannedAt: number;
    scanDuration: number;
    directory: {
      path: string;
      totalFiles: number;
      totalSize: number;
      totalSizeFormatted: string;
    };
  };
}

// Get project response
interface GetProjectResponse {
  success: true;
  data: ProjectData;
  meta: {
    totalCalculations: number;
    totalDataPoints: number;
    parseDuration: number;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}
```

### API Client Implementation

```typescript
import axios, { AxiosInstance } from 'axios';

class EngineApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getProjects(): Promise<ProjectInfo[]> {
    const { data } = await this.client.get<ListProjectsResponse>('/api/projects');
    if (!data.success) throw new Error('Failed to fetch projects');
    return data.data;
  }

  async getProject(id: string): Promise<ProjectData> {
    const { data } = await this.client.get<GetProjectResponse>(`/api/project/${id}`);
    if (!data.success) throw new Error('Failed to fetch project');
    return data.data;
  }

  async healthCheck(): Promise<{ status: string }> {
    const { data } = await this.client.get('/health');
    return data;
  }
}

// Usage
const api = new EngineApiClient();
const projects = await api.getProjects();
const project = await api.getProject('vesta-16-im');
```

---

## Testing

### Automated Test Suite

The project includes a comprehensive test script:

```bash
cd backend
./test-api.sh
```

**Tests included:**
1. Health check
2. API info
3. List projects
4. Get project details (Vesta 1.6 IM)
5. Get project details (BMW M42)
6. Error handling - nonexistent project (404)
7. Error handling - invalid ID (400)
8. Performance test (10 requests, average response time)

---

## CORS Configuration

CORS is enabled for the following origins:
- `http://localhost:5173` (Vite dev server)
- Can be configured via `FRONTEND_URL` environment variable

**Configuration:**
```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## Rate Limiting

**Current:** No rate limiting

**Future considerations:**
- Max 100 requests per minute per IP
- Project data parsing is cached (future improvement)
- Response compression (gzip)

---

## Project Metadata API

**Added in v1.1.0** - Manage project metadata (description, client, tags, notes, status, color).

### Metadata Structure

```typescript
interface ProjectMetadata {
  projectId: string;
  description: string;
  client: string;
  tags: string[];
  notes: string;
  status: 'active' | 'completed' | 'archived';
  color: string;          // HEX color
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
}
```

### GET /projects/:id/metadata

Get metadata for a specific project.

**Request (Direct to Backend):**
```bash
curl http://localhost:3000/projects/vesta-16-im/metadata
```

**Request (Through Frontend Proxy):**
```bash
curl http://localhost:5173/api/projects/vesta-16-im/metadata
```

**Response:**
```json
{
  "metadata": {
    "projectId": "Vesta 1.6 IM",
    "description": "Калибровка двигателя Vesta 1.6 IM",
    "client": "АвтоВАЗ",
    "tags": ["vesta", "production"],
    "notes": "Базовая калибровка",
    "status": "active",
    "color": "#3b82f6",
    "createdAt": "2025-10-22T10:00:00.000Z",
    "updatedAt": "2025-10-22T11:00:00.000Z"
  }
}
```

**Status codes:** 200 (OK), 404 (Not found), 500 (Error)

### POST /projects/:id/metadata

Create or update project metadata.

**Request (Direct to Backend):**
```bash
curl -X POST http://localhost:3000/projects/vesta-16-im/metadata \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description", "status": "active"}'
```

**Request (Through Frontend Proxy):**
```bash
curl -X POST http://localhost:5173/api/projects/vesta-16-im/metadata \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description", "status": "active"}'
```

**Request Body:**
```json
{
  "description": "Калибровка двигателя",
  "client": "АвтоВАЗ",
  "tags": ["vesta", "production"],
  "notes": "Базовая калибровка",
  "status": "active",
  "color": "#3b82f6"
}
```

**Response:**
```json
{
  "metadata": { /* ProjectMetadata */ },
  "created": true  // true if created, false if updated
}
```

**Status codes:** 200 (OK), 400 (Bad request), 500 (Error)

### DELETE /projects/:id/metadata

Delete project metadata.

**Request (Direct to Backend):**
```bash
curl -X DELETE http://localhost:3000/projects/vesta-16-im/metadata
```

**Request (Through Frontend Proxy):**
```bash
curl -X DELETE http://localhost:5173/api/projects/vesta-16-im/metadata
```

**Response:** 204 No Content (success), 404 (Not found), 500 (Error)

**curl examples (Backend):**
```bash
# Get metadata
curl http://localhost:3000/projects/vesta-16-im/metadata

# Create/update metadata
curl -X POST http://localhost:3000/projects/vesta-16-im/metadata \
  -H "Content-Type: application/json" \
  -d '{"description":"Test","client":"Client","tags":[],"notes":"","status":"active","color":"#000"}'

# Delete metadata
curl -X DELETE http://localhost:3000/projects/vesta-16-im/metadata
```

**Storage:** Metadata stored in `.metadata/<projectId>.json` files.

**Integration:** GET /projects automatically includes `metadata` field for each project.

---

## Future Enhancements

Possible endpoints for future versions:

### Configuration Management
```
GET /api/config - Get current configuration
POST /api/config - Update configuration
```

### Export Functionality
```
POST /api/export/csv - Export data to CSV
POST /api/export/chart - Export chart as image
```

### Analytics
```
POST /api/compare - Compare multiple calculations
GET /api/stats/:id - Get statistical analysis
```

---

## Implementation Details

### Backend Structure

```
backend/
├── src/
│   ├── server.js           # Express server
│   ├── config.js           # Configuration loader
│   ├── routes/
│   │   ├── projects.js     # GET /projects
│   │   ├── data.js         # GET /project/:id
│   │   └── metadata.js     # Metadata CRUD endpoints
│   └── services/
│       ├── fileParser.js   # .det file parser
│       └── fileScanner.js  # Directory scanner
├── package.json
└── test-api.sh            # Automated tests
```

### Key Files

**Routes:**
- [backend/src/routes/projects.js](../backend/src/routes/projects.js) (160 lines)
- [backend/src/routes/data.js](../backend/src/routes/data.js) (330 lines)

**Services:**
- [backend/src/services/fileParser.js](../backend/src/services/fileParser.js) (310 lines)
- [backend/src/services/fileScanner.js](../backend/src/services/fileScanner.js) (380 lines)

**Configuration:**
- [backend/src/config.js](../backend/src/config.js) (150 lines)
- [config.yaml](../config.yaml) (master configuration)

---

## Changelog

### Version 1.0.0 (21 октября 2025)
- ✅ Initial API release
- ✅ `/health` endpoint
- ✅ `/api` info endpoint
- ✅ `/api/projects` endpoint (list all projects)
- ✅ `/api/project/:id` endpoint (get project data)
- ✅ Error handling (400, 404, 500)
- ✅ ID normalization
- ✅ Configuration caching
- ✅ File scanning with metadata
- ✅ Complete .det file parser
- ✅ Automated test suite
- ✅ Production-ready code quality

**Performance:**
- Project listing: ~9ms
- Project parsing: ~5-6ms
- Zero external API calls
- Efficient file I/O

---

## Support & Documentation

**Links:**
- Main README: [README.md](../README.md)
- Architecture: [architecture.md](architecture.md)
- Development Roadmap: [roadmap.md](../roadmap.md)
- TypeScript Types: [shared-types.ts](../shared-types.ts)

**Testing:**
- Automated tests: `./backend/test-api.sh`
- Manual testing: See examples above

---

**API fully implemented and tested! 🚀**

**Last updated:** 22 октября 2025 (added Project Metadata API v1.1.0)
