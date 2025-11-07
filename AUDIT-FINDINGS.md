# ENGINE RESULTS VIEWER v2.0.0 - AUDIT FINDINGS

**Audit Date:** 2025-11-07
**Audited Version:** v2.0.0 (Production-ready milestone)
**Scope:** Complete codebase (Backend, Frontend, Configurations, Documentation, Test Data)
**Purpose:** Document current implementation state, identify weak points, list unanswered questions

---

## EXECUTIVE SUMMARY

Engine Results Viewer v2.0.0 is a **production-ready** full-stack web application for visualizing ICE (Internal Combustion Engine) calculation results from EngMod4T Suite (15 years of Pascal/Visual Basic development). Successfully replaces legacy Desktop UI (Post4T) with modern web interface.

**Project Scale:**
- 35 test projects (50+ expected in production at `C:/4Stroke/`)
- 15+ file types (`.det`, `.pou`, `.prt`, + auxiliary files)
- ~7,000 lines of visualization components
- Complete metadata management system (auto/manual separation)
- Cross-project calculation comparison (1 primary + 4 comparisons)

**Overall Status:** ⭐⭐⭐⭐⭐ No blocking issues. All core features implemented and working.

---

## 1. ✅ WHAT IS IMPLEMENTED

### 1.1 Backend (Node.js + Express)

#### Parsers (backend/src/parsers/formats/)

**detParser.js** (286 lines)
- Parses .det files (24 parameters)
- First column handling (service column with line numbers + → symbol)
- Metadata extraction: cylinders, engineType
- Calculation markers: `$1`, `$2`, `$3.1` etc.
- Validation: >= 2 data points per calculation (filters out single-point calculations)
- Parameter name mapping: `TCylMax` → `TC-Av` (unification with .pou format)

**pouParser.js** (418 lines)
- Parses .pou files (71 parameters)
- Advanced per-cylinder array parsing
- Vibe combustion model parameters (VibeDelay, VibeDurat, VibeA, VibeM)
- Metadata extraction: cylinders, engineType, breath, numTurbo, numWasteGate
- Parameter name mapping: `Purc` → `PurCyl` (unification with .det format)
- Same validation as detParser (>= 2 points)

**prtParser.js** (540 lines) - SOPHISTICATED
- Extracts engine specifications from .prt files (created by DAT4T)
- **Intake System Detection** (3 types):
  - `ITB` - Individual Throttle Bodies (separate + no airboxes + throttles)
  - `IM` - Intake Manifold (separate + common airbox/plenum)
  - `Carb` - Carburetor/Collector (collected intake pipes, 4into1, 1intoN)
- **Exhaust System Parsing**: regex-based pattern extraction
  - Examples: `4-2-1`, `4-1`, `tri-y`, `8-4-2-1`, `8-4-1`
  - Pattern: `"4into2into1 manifold"` → `"4-2-1"`
- **Displacement Calculation**: π/4 × bore² × stroke × cylinders (in liters)
- Valve configuration: valvesPerCylinder, inletValves, exhaustValves
- Other specs: bore, stroke, compressionRatio, maxPowerRPM
- DAT4T version extraction, creation timestamp parsing

#### Parser Infrastructure

**ParserRegistry.js** (123 lines)
- Registry pattern for parser management
- Runtime parser registration
- Supports adding new formats without code changes
- Global singleton instance (globalRegistry)

**formatDetector.js** - Format detection by file extension
**calculationMarker.js** - Calculation marker parsing (`$1 Best Config` → id: `$1`, name: `Best Config`)

#### Services (backend/src/services/)

**fileScanner.js** (645 lines)
- Recursive directory scanning (all subdirectories)
- File validation by extension (`.det`, `.pou`, `.prt`)
- **Automatic metadata extraction**: .prt files → auto metadata → `.metadata/<projectId>.json`
- Duplicate detection: if both .det and .pou exist, prioritize pou (71 params > 24 params)
- File dates from .prt (birthtime = project creation, mtime = last engine config change)
- Error detection: missing .prt, parsing failures, incomplete metadata
- Performance: ~200ms for 35 projects scan + metadata extraction

**metadataService.js** (346 lines)
- CRUD operations for project metadata
- Metadata location: `.metadata/` in **project root** (NOT in C:/4Stroke/)
- Metadata structure v1.0:
  - `auto` section: READ-ONLY (from .prt file parsing)
  - `manual` section: USER-EDITABLE (description, client, tags, status, notes, color)
- Functions:
  - `getMetadata()` - load with backward compatibility (migrates old formats)
  - `updateAutoMetadata()` - updates auto section only (preserves manual)
  - `updateManualMetadata()` - updates manual section only (preserves auto)
  - `saveMetadata()`, `deleteMetadata()`, `getAllMetadata()`

**fileParser.js** - Unified parsing interface (delegates to specific parsers)

#### API Routes (backend/src/routes/)

**projects.js** (232 lines)
- `GET /api/projects` - List all projects with metadata
- Query parameters: `cylinders`, `type`, `intake`, `exhaust`, `search`, `status`, `tags`
- Returns: `ProjectInfo[]` with metadata, file info, error detection
- Filters applied server-side (query params) or client-side (FiltersBar)

**data.js** (292 lines)
- `GET /api/project/:id` - Get full project data with all calculations
- Recursive file search (supports subdirectories)
- **BUG FIX (2025-11-06)**: Restricted scan to `.det`/`.pou` only (excludes `.prt`)
  - Reason: .prt files don't contain calculations, scanning them caused 404 errors
- Returns: `EngineProject` with calculations, dataPoints, metadata

**metadata.js** (146 lines)
- `GET /api/projects/:id/metadata` - Get metadata
- `POST /api/projects/:id/metadata` - Save/update manual metadata only
- `DELETE /api/projects/:id/metadata` - Delete metadata
- Validation: status enum, tags array

**server.js** (248 lines)
- Express server setup
- CORS configuration (frontend origin)
- Request logging middleware
- Global error handler (404, 500)
- Startup scan (processes all .prt files)
- Health check endpoint: `GET /health`
- API info endpoint: `GET /api`

#### Configuration

**config.js** - YAML config loader (`config.yaml`)
- Data folder path (dev: `./test-data`, prod: `C:/4Stroke`)
- File extensions: `.det`, `.pou`, `.prt`
- Max file size: 10 MB
- Server host/port

---

### 1.2 Frontend (React 18 + TypeScript + Vite)

#### Architecture (v2.0 - Multi-Project Cross-Comparison)

**Zustand Store** (appStore.ts, 357 lines)
- State management with persistence
- **Calculations:**
  - Primary calculation (1) - main reference
  - Comparison calculations (max 4) - from any project
  - Total limit: 5 calculations simultaneously
- **Settings (persisted to localStorage):**
  - Units system: SI / American / HP
  - Theme: light / dark (state exists, dark not implemented)
  - Chart settings: animation, grid, exportFormat, exportQuality
- **Session-only state:**
  - Selected preset (1-6)
  - Modal open/close flags
  - UI state (loading, errors)

**Cross-Project Data Loading** (useMultiProjectData.tsx hook)
- Loads calculations from ANY project (not just current projectId from URL)
- Project-level caching: `Map<projectId, EngineProject>`
- Progress tracking: loaded/total calculations
- Error handling: per-calculation errors
- Performance: only loads projects referenced by selected calculations

#### Chart System (6 Presets)

**ChartPreset1: Power & Torque** (379 lines)
- Dual Y-axis: P-Av (left), Torque (right)
- Units conversion: SI/American/HP
- Peak markers with unique symbols per calculation
- Color strategy:
  - Single calculation: parameter colors (P-Av red, Torque blue)
  - Multiple calculations: calculation colors (same color for both params)
- Synchronized zoom/pan

**ChartPreset2: MEP (Mean Effective Pressure)** (300 lines)
- 4 parameters: FMEP, IMEP, BMEP, PMEP
- Single Y-axis (bar)
- Color-coded lines per parameter
- Formula display (IMEP = BMEP + FMEP + PMEP)

**ChartPreset3: Critical Parameters** (350 lines)
- PCylMax, TC-Av (averaged across cylinders), MaxDeg
- Per-cylinder or averaged display toggle
- Temperature/pressure dual axis

**ChartPreset4: Custom** (400 lines)
- User-selectable parameters (up to 4)
- Per-cylinder selection support
- Synchronized with DataTable (selecting params updates table columns)
- ParameterSelectorModal integration

**ChartPreset5: Combustion** (280 lines)
- TAF, Timing, Delay, Durat
- Combustion timing analysis

**ChartPreset6: Efficiency** (320 lines)
- DRatio, PurCyl, Seff, Teff, Ceff
- Volumetric efficiency, combustion efficiency

**Common Chart Features:**
- ECharts library (v5.6.0)
- Export: PNG/SVG with configurable quality
- Responsive sizing
- Tooltip with units
- Legend with calculation names
- Zoom/pan tools

#### Components Structure

```
components/
├── projects/
│   ├── ProjectCard.tsx (264 lines)
│   │   - Project info card with metadata
│   │   - Auto badges: Type, Cylinders, Displacement, Valves, Intake
│   │   - Status badge, tags display
│   │   - Click to navigate to ProjectPage
│   │   - Edit metadata button
│   ├── EngineBadge.tsx (118 lines)
│   │   - Intake system badges: ITB/IM/Carb
│   │   - Type badges: NA/Turbo/Supercharged
│   │   - Color-coded by type
│   ├── FiltersBar.tsx (345 lines)
│   │   - Multi-filter UI: Cylinders, Type, Intake, Valves, Status, Tags, Search
│   │   - Active filters display with badges
│   │   - Results count (filtered/total)
│   │   - Clear all button
│   │   - Sort dropdown: Date/Name/Type/Status
│   └── MetadataDialog.tsx (548 lines)
│       - Edit manual metadata ONLY (auto section read-only)
│       - Form fields: displayName, description, client, tags, status, notes
│       - Save → POST /api/projects/:id/metadata
│       - BUG FIX (2025-11-06): Status Select was uncontrolled → now controlled
├── visualization/ (6974 lines total)
│   ├── ChartPreset[1-6].tsx - All 6 presets
│   ├── DataTable.tsx (450 lines)
│   │   - Tanstack Table v8
│   │   - Multi-calculation support
│   │   - Column visibility toggle
│   │   - Export: CSV/XLSX (XLSX library)
│   │   - Sortable columns
│   │   - Fixed header
│   ├── PeakValuesCards.tsx (280 lines)
│   │   - Always-visible peak values (no hover needed)
│   │   - Power, Torque, RPM at peak
│   │   - RPM step display (instead of point count)
│   │   - Units conversion
│   │   - Hover effect: scale + glow
│   ├── ComparisonModal/ (2-step selection)
│   │   - Step 1: Select project
│   │   - Step 2: Select calculation from project
│   │   - Search/filter projects
│   │   - Max 4 comparisons
│   ├── PrimarySelectionModal/
│   │   - Select primary calculation
│   │   - Shows calculations from current project by default
│   │   - Can select from any project
│   ├── ParameterSelectorModal (350 lines)
│   │   - Select parameters for Custom chart (Preset 4)
│   │   - Per-cylinder checkbox for array parameters
│   │   - Category grouping
│   │   - Max 4 parameters
│   ├── LeftPanel.tsx (400 lines)
│   │   - 3 sections: Primary, Presets, Comparisons
│   │   - Responsive collapse/expand
│   │   - Color indicators for calculations
│   │   - Remove comparison buttons
│   └── Header.tsx (300 lines)
│       - Back button to HomePage
│       - Settings popover (units, theme, chart settings)
│       - Preset selector dropdown
│       - Export button
└── shared/
    ├── ErrorBoundary.tsx - React error boundary (catch-all)
    ├── ErrorMessage.tsx - User-friendly error display with retry
    ├── LoadingSpinner.tsx - Lucide React spinner
    ├── SkeletonCard.tsx - Loading placeholder for ProjectCard
    └── MultiSelect.tsx - Tags multi-select dropdown
```

#### Type System

**types/index.ts** (346 lines) - Backend sync
- `ProjectInfo` - Project list item with metadata
- `EngineProject` - Full project data
- `Calculation` - Calculation with dataPoints
- `DataPoint` - Single RPM measurement (73 parameters)
- `ProjectMetadata` - v1.0 structure (auto + manual)

**types/v2.ts** (253 lines) - v2.0 architecture
- `CalculationReference` - Cross-project calculation reference
  - `projectId`, `projectName`, `calculationId`, `calculationName`
  - Used by Zustand store for primary/comparisons
- `PeakValue` - Peak detection result
- `SelectedParameter` - Custom chart parameter selection
- `AppState` - Zustand store state interface

#### Configuration & Constants

**parameters.ts** (666 lines) - SSOT for all 73 parameters
- Parameter metadata: name, displayName, unit, conversionType, brief, description
- Category grouping: performance, mep, temperature, pressure, combustion, efficiency, vibe-model, quality
- Helper functions:
  - `getParameter(name)` - Get parameter metadata
  - `getChartableParameters()` - Get parameters with units (exclude RPM)
  - `getParametersByCategory(category)`
  - `getParametersByFormat(format)` - Get params available in .det or .pou

**chartConfig.ts** (296 lines)
- ECharts configuration factory
- `createXAxis()`, `createYAxis()`, `createTooltip()`, `createLegend()`
- Consistent styling across all presets

**colorManager.ts** (177 lines)
- Color palette management
- `CALCULATION_COLORS`: 5 colors (calculation 1-5)
- `PARAMETER_COLORS`: ~15 colors (for different parameters)
- `getCalculationColor(index)` - Get color for calculation
- `getParameterColor(paramName)` - Get color for parameter

#### Utility Functions

**unitsConversion.ts** (320 lines) - Units converter
- 3 unit systems: SI (default), American, HP
- Conversion functions: `convertPower()`, `convertTorque()`, `convertPressure()`, `convertTemperature()`
- Unit labels: `getPowerUnit()`, `getTorqueUnit()`, etc.
- Used by: charts, DataTable, PeakValuesCards

**peakFinder.ts** (306 lines) - Peak detection
- `findPeakValue(data, paramName)` - Find peak in scalar parameter
- `findPeakInArray(data, paramName)` - Find peak in per-cylinder array
- `findAveragedPeak(data, paramName)` - Find peak in averaged per-cylinder data
- Returns: `{ value, rpm, cylinderIndex? }`

**peakValues.ts** - Peak formatting with units
**exportFilename.ts** - Dynamic filename generation (timestamp + project + calculation)
**export.ts** (186 lines) - Export utilities
- CSV export: comma-separated values
- XLSX export: XLSX library, formatted spreadsheet
- PNG/SVG export: ECharts built-in export

**rpmCalculator.ts** - RPM metadata
- `calculateRPMStep(dataPoints)` - Calculate RPM step (e.g., 200 RPM)
- `getRPMRange(dataPoints)` - Get min/max RPM

#### Hooks

**useProjects.tsx** - Fetch projects list
- `GET /api/projects`
- Returns: `{ projects, loading, error, refetch }`

**useProjectData.tsx** - Fetch single project data
- `GET /api/project/:id`
- Returns: `{ project, loading, error, refetch }`

**useMultiProjectData.tsx** - Cross-project data loading
- Input: `CalculationReference[]`
- Loads multiple projects in parallel
- Caching: `Map<projectId, EngineProject>`
- Returns: `{ calculationDataMap, loading, loadingProgress, errors }`

**useSelectedCalculations.tsx** - Manage 1+4 calculations
- Enforces max 5 calculations rule
- Helper: `canAddMore()`, `removeCalculation()`

**useChartExport.tsx** - Chart export
- PNG/SVG export with quality settings
- Integrates with ChartExportContext

#### Contexts

**ChartExportContext** - Global export handlers
- Registers export functions from each chart
- Triggered by Header export button

#### Pages

**HomePage** - Projects grid
- Project list with filters
- Search by name/tags
- Sort by date/name/type/status
- Navigate to ProjectPage on card click

**ProjectPage** - Visualization workspace
- URL param: `/project/:id` (initial context, not limitation)
- Layout: Header + LeftPanel + ChartArea + DataTable
- Cross-project comparison support
- Export all (charts + table)

**HelpPage** - User guide (minimal content)

---

### 1.3 Configuration Files

#### Frontend

**vite.config.ts**
- React plugin
- TailwindCSS v4 plugin
- Path alias: `@` → `./src`
- Proxy: `/api` → `http://localhost:3000`
- Build target: ES2020

**tsconfig.json**
- Strict mode enabled
- Path mappings: `@/*` → `./src/*`
- References: app + node configs

**package.json** (dependencies verified)
- React 19.1.1 (latest)
- ECharts 5.6.0, echarts-for-react 3.0.2
- Tanstack Table 8.21.3
- Zustand 5.0.8
- Axios 1.12.2
- XLSX 0.18.5
- Radix UI components (shadcn/ui)
- Lucide React icons

#### Backend

**package.json** (dependencies verified)
- Express 4.18.0
- CORS 2.8.5
- js-yaml 4.1.0 (config.yaml parsing)
- chokidar 3.5.3 (installed but NOT used - file watching disabled)
- Node >= 18.0.0

**config.yaml** (default configuration)
```yaml
files:
  path: "./test-data"          # Dev: test-data/, Prod: C:/4Stroke/
  extensions: [".det", ".pou", ".prt"]
  scan_on_startup: true
  watch_interval: 5            # Not used (chokidar disabled)
  max_file_size: 10485760      # 10 MB

server:
  host: "localhost"
  port: 3000
  auto_open_browser: false

ui:
  max_calculations_compare: 5
  default_preset: "power_torque"
  language: "ru"              # Not used (UI is English only)

colors:
  calculation_1: "#ff6b6b"    # Red
  calculation_2: "#4ecdc4"    # Teal
  calculation_3: "#45b7d1"    # Blue
  calculation_4: "#f9ca24"    # Yellow
  calculation_5: "#a29bfe"    # Purple

charts:
  theme: "light"
  animation: true
  show_grid: true
  export_format: "png"
  export_quality: 90
  export_width: 1920
  export_height: 1080
```

#### Git

**.gitignore** (224 lines) - Comprehensive
- `test-data/` excluded (correct - several GB)
- `node_modules/`, `dist/`, `logs/`
- OS files (`.DS_Store`, `Thumbs.db`)
- Editor configs (`.vscode/`, `.idea/`)
- Secrets (`.env`, `*.pem`, `credentials.json`)
- **ISSUE:** `.metadata/*.json` NOT excluded → 38 uncommitted files

---

### 1.4 Test Data Structure

**Location:** `test-data/` (mirrors production `C:/4Stroke/`)

**Structure:**
```
test-data/
├── {ProjectName}.prt           (35 files) - Engine metadata (ROOT level)
├── {ProjectName}/              (35 folders) - Results per project
│   ├── {ProjectName}.det       - 24 parameters, multiple calculations
│   ├── {ProjectName}.pou       - 71 parameters
│   ├── {ProjectName}.dat       - Input data (not parsed)
│   ├── {ProjectName}.des       - Description (not parsed)
│   ├── {ProjectName}.spo       - Spreadsheet output (not parsed)
│   └── {ProjectName}_{RPM}.cbt/.cyl/.dme/... - Per-RPM files (not parsed)
```

**Sample Projects:**
- `3UZ_FE/` - V8 engine, 39 RPM points × 18 files/point = 702 files
- `Vesta 1.6 IM/` - 4-cyl IM, complete dataset
- `BMW M42/` - 4-cyl, 2 calculations (.det + .pou)
- `Lada 1300 Carb/` - 4-cyl Carb (carburetor test case)
- `granta-turbo/` - 4-cyl turbo, 67 calculations (8 single-point filtered)

**Total Size:** Several GB (mostly per-RPM auxiliary files)

---

### 1.5 Metadata System (.metadata/)

**Location:** `engine-viewer/.metadata/` (project root, NOT in C:/4Stroke/)

**Structure v1.0** (from ADR-005):
```json
{
  "version": "1.0",
  "id": "project-id",
  "displayName": "Custom Name",
  "auto": {
    "cylinders": 4,
    "type": "NA",
    "configuration": "inline",
    "bore": 84,
    "stroke": 81,
    "displacement": 1.9,
    "compressionRatio": 10.5,
    "maxPowerRPM": 7000,
    "intakeSystem": "ITB",
    "exhaustSystem": "4-2-1",
    "valvesPerCylinder": 4,
    "inletValves": 2,
    "exhaustValves": 2
  },
  "manual": {
    "description": "",
    "client": "Client Name",
    "tags": ["tag1", "tag2"],
    "status": "active",
    "notes": "",
    "color": "#hex"
  },
  "created": "2025-10-22T13:02:09.511Z",
  "modified": "2025-11-06T20:20:57.429Z"
}
```

**Current State:** 38 metadata files (all modified, not committed)

**Features:**
- Auto section: READ-ONLY for users (extracted from .prt)
- Manual section: USER-EDITABLE (via MetadataDialog)
- Backward compatibility: migrates old formats to v1.0
- Separation from C:/4Stroke/ (Engine Viewer data, not EngMod4T data)

---

### 1.6 Documentation

#### Root Level
- **README.md** - Entry point, quick start, feature list
- **CLAUDE.md** - AI instructions (critical rules for Claude Code)
- **ARCHITECT-CONTEXT.md** - Context for Claude Chat (architect mode)
- **DOCUMENTATION_GUIDE.md** - Documentation standards, SSOT rules, checklists
- **CHANGELOG.md** - Version history v1.0.0 → v2.0.0 (detailed)

#### docs/
- **architecture.md** (69057 bytes) - Comprehensive architecture document
  - Data flow diagrams
  - Component hierarchy
  - API documentation
  - Parser internals
  - State management
  - **ISSUE:** Contains errors about .metadata/ location (shows it inside C:/4Stroke/)

- **setup.md** - Installation guide (dependencies, scripts)
- **troubleshooting.md** - Common issues and solutions
- **routing.md** - React Router configuration

#### docs/file-formats/
- **README.md** - Overview of all formats
- **det-format.md** - .det specification (24 parameters)
- **pou-format.md** - .pou specification (71 parameters)
- **prt-format.md** - .prt specification (engine metadata file)
- **PARAMETERS-REFERENCE.md** - All 73 parameters documented

#### docs/decisions/ (Architecture Decision Records)
- **001-det-file-format.md** - First column = service column (line numbers + →)
- **002-pou-file-format.md** - 71 parameters support, parameter name mapping
- **003-color-palette-engineering-style.md** - v2.1 palette (5 colors, high contrast)
- **004-engmod4t-suite-documentation.md** - AI-friendly documentation strategy
- **005-prt-parser-metadata-separation.md** (464 lines) - Auto/Manual metadata split, intake system detection logic

#### docs/engmod4t-suite/
- **README.md** - Suite overview
- **DAT4T.md** - Input data preparation tool
- **EngMod4T.md** - Calculation engine (15 years Pascal/VB)
- **Post4T.md** - Legacy Desktop UI (being replaced)
- **suite-integration.md** - How components work together, file ownership contracts

---

## 2. ❌ WHAT IS MISSING / NOT IMPLEMENTED

### 2.1 Backend

1. **.pou + .det merging** - `pou-merged` format (73 parameters) mentioned but not implemented
   - .pou has 71 params
   - .det has TCylMax (not in .pou) + Convergence (not in .pou)
   - Merged would have 73 params total
   - fileScanner.js has deduplication logic (prioritizes .pou) but no merging

2. **File watching** - chokidar installed but not used
   - createFileWatcher() function exists but not called
   - Changes to test-data/ require server restart

3. **.dat/.des/.spo parsers** - Files exist but no parsers
   - .dat - Input data file
   - .des - Description file
   - .spo - Spreadsheet output
   - Backend ignores these files during scanning

4. **Per-RPM auxiliary file parsers** - ~20 file types per RPM point
   - .cbt, .cyl, .dme, .eff, .exh, .fnl, .frc, .gas, .htr, .ign, .inl, .mep, .prs, .res, .trq, .trn, .vbe, .wls
   - Not parsed, not used
   - Consume several GB of disk space

5. **Unit tests** - Zero tests for parsers, services, routes

6. **Error aggregation** - ProjectInfo has errors[] field but not fully utilized
   - detectProjectErrors() function exists
   - Returns structured errors (missing_prt, parsing_failed, incomplete_metadata, corrupted_files)
   - But errors not displayed in UI

7. **Caching layer** - Every API request re-parses files
   - Performance OK with current file sizes (~200ms for 35 projects)
   - Could be issue with 100+ projects

8. **Retry mechanisms** - No automatic retry for transient errors

### 2.2 Frontend

1. **Dark theme** - State exists in Zustand store but not implemented
   - Settings has theme: 'light' | 'dark'
   - No theme switching logic
   - No dark theme styles

2. **Animation toggle** - chartSettings.animation exists but may not fully disable animations
   - Setting persists to localStorage
   - But unclear if ECharts respects it in all presets

3. **RPM range selector** - Cannot zoom to specific RPM range in UI
   - Charts have zoom tools
   - But no input fields for min/max RPM

4. **Calculation notes** - Cannot add notes to specific calculations
   - Calculation type has no notes field
   - Would be useful for documenting test conditions

5. **Comparison saved presets** - Cannot save/load favorite comparison combinations
   - Have to manually re-select calculations each time

6. **.pou file visualization** - UI assumes .det format
   - Backend supports .pou parsing
   - Frontend may not handle .pou-only projects correctly

7. **Parameter help tooltips** - parameters.ts has brief/description fields
   - Not displayed in UI
   - Could help users understand parameters

8. **DataTable pagination** - All data points rendered at once
   - Works fine with typical 20-50 RPM points
   - Could be slow with 100+ RPM points × 5 calculations

9. **PDF export** - Only PNG/SVG/CSV/XLSX
   - No PDF export option
   - Would be useful for reports

10. **Batch export** - Cannot export multiple charts at once
    - Must export each chart individually

### 2.3 Configuration

1. **Environment variables** - No .env support
   - Data path hardcoded in config.yaml
   - No way to override config without editing file

2. **.env.example** - Not provided
   - No documentation of environment variables

### 2.4 Deployment

1. **Deployment guide** - No docs/deployment.md
   - How to deploy to Windows production?
   - Where to install on Windows?
   - How to configure C:/4Stroke/ path?

2. **Backup/restore procedures** - Not documented
   - How to backup .metadata/?
   - How to restore if corrupted?

3. **Production build scripts** - No production-specific scripts
   - scripts/start.sh is dev-only

---

## 3. ⚠️ WEAK POINTS / TECHNICAL DEBT

### 3.1 Architecture

1. **Color Palette - HARDCODED (5 colors)**
   - `CALCULATION_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#a29bfe']`
   - Cannot add 6th calculation even if user wants
   - No user customization
   - Limit: 5 calculations (1 primary + 4 comparisons)

2. **Intake System Detection - FRAGILE**
   - Depends on exact text patterns in .prt files
   - Logic in prtParser.js lines 160-208
   - If DAT4T changes text format → detection breaks
   - Examples:
     - "collected intake pipes" → Carb
     - "seperate intake pipes" + "with no airboxes" + "but with throttles" → ITB
     - "seperate intake pipes" + "with a common airbox or plenum" → IM
   - No fallback to manual override if detection fails

3. **Per-Cylinder Display - INCONSISTENT UI Pattern**
   - Preset 2 (Pressure): Shows all cylinders individually
   - Preset 3 (Temperature): Shows averaged TC-Av
   - Preset 4 (Custom): Has per-cylinder selection checkbox
   - No consistent UI pattern across presets

4. **File Structure - DUPLICATION**
   - Both `unitsConverter.ts` AND `unitsConversion.ts` exist
   - Which is SSOT?
   - Answer: `unitsConversion.ts` is SSOT (imports from parameters.ts)
   - `unitsConverter.ts` is legacy wrapper (should be removed?)

### 3.2 Performance

1. **No Request Caching**
   - Every GET /api/projects re-scans directory
   - Every GET /api/project/:id re-parses file
   - Performance OK now (~200ms) but could degrade with 100+ projects

2. **No Code Splitting**
   - All chart components loaded upfront
   - Could lazy-load presets (only load selected preset)

3. **DataTable - No Virtualization**
   - Renders all rows at once
   - Could use TanStack Table virtualization for 1000+ rows

### 3.3 Error Handling

1. **Error Handling - BASIC**
   - Errors logged to console
   - No structured error reporting to frontend (errors[] field not fully used)
   - No error tracking/analytics
   - No retry mechanisms

2. **Validation - INCOMPLETE**
   - No validation that RPM values are sequential/monotonic
   - No validation of parameter value ranges (e.g., power should be > 0)
   - No check for duplicate calculation IDs

### 3.4 Data Integrity

1. **38 uncommitted metadata files**
   - `.metadata/*.json` files modified but not in git
   - User-generated manual metadata (client, tags, notes)
   - Risk: lose data if .metadata/ deleted
   - .gitignore doesn't exclude .metadata/ → should be committed

2. **No metadata conflict resolution**
   - Multiple users editing same project?
   - No locking mechanism
   - No last-write-wins notification
   - No conflict detection

3. **No notification when .prt changes**
   - fileScanner.js updates auto section silently
   - User doesn't know auto metadata changed
   - Could cause confusion (why did displacement change?)

### 3.5 Code Quality

1. **Zero unit tests**
   - No tests for parsers (detParser, pouParser, prtParser)
   - No tests for services (fileScanner, metadataService)
   - No tests for utilities (unitsConversion, peakFinder)
   - Manual testing only

2. **No TypeScript strict mode in backend**
   - Backend is JavaScript (no type checking)
   - Types only in frontend
   - Could migrate backend to TypeScript

3. **Magic numbers**
   - 5 calculations limit (hardcoded)
   - 2 data points minimum (hardcoded in parsers)
   - 10 MB max file size (in config but no UI warning)

### 3.6 User Experience

1. **Peak Values Cards - FIXED HEIGHT**
   - Always same height regardless of content
   - Could be more compact for mobile

2. **No loading skeleton for charts**
   - Shows blank space while loading
   - Could show skeleton/placeholder

3. **No empty state for comparisons**
   - If no comparisons selected, shows empty area
   - Could show "Add comparison" prompt

---

## 4. ❓ OPEN QUESTIONS (Unanswered)

### 4.1 Production Deployment

**Q1: Where does .metadata/ folder go in production Windows install?**
- Current: `.metadata/` in project root (engine-viewer/.metadata/)
- Options for production:
  - A) `D:/EngineViewer/.metadata/` (next to app)
  - B) `C:/Users/Username/AppData/Local/EngineViewer/.metadata/` (user data)
  - C) `%USERPROFILE%/.engine-viewer/metadata/` (user home)
  - D) Next to C:/4Stroke/ (e.g., `C:/4Stroke_metadata/`)
- **No decision documented**

**Q2: How to configure data path for production without code changes?**
- Dev: `test-data/` (hardcoded in config.yaml)
- Prod: `C:/4Stroke/` (hardcoded in config.yaml)
- Options:
  - A) Environment variable `DATA_PATH`
  - B) CLI argument `--data-path`
  - C) Installer prompts for path
  - D) Config file user must edit
- **No solution implemented**

**Q3: How to deploy to Windows production?**
- Executable? Installer? Portable app?
- Prerequisites: Node.js 18+?
- Auto-start with Windows?
- System tray icon?
- **No deployment guide exists**

### 4.2 File Formats

**Q4: What are .dat/.des/.spo files used for?**
- Present in test-data/
- Not parsed by Engine Viewer
- Are they needed for future features?
- Can they be deleted to save space?
- **No documentation found**

**Q5: What are per-RPM auxiliary files (.cbt, .cyl, .dme, etc.)?**
- ~20 file types per RPM point
- Examples: 3UZ_FE has 39 RPM × 18 files = 702 files
- Not parsed, not used
- Consume several GB
- Are they EngMod4T internal files?
- Can they be excluded from distribution?
- **No documentation found**

**Q6: Why are .prt files at root AND inside project folders?**
- Root: Used by fileScanner.js for metadata extraction
- Inside folders: Also present (e.g., `BMW M42/BMW M42.prt`)
- Are folder .prt files backups? Legacy? Different data?
- **No explanation found**

### 4.3 Metadata System

**Q7: How to handle metadata conflicts in production?**
- Multiple engineers editing same project simultaneously
- No locking mechanism
- No conflict detection
- Last-write-wins silently overwrites
- Should there be:
  - A) File locking?
  - B) Optimistic locking (version numbers)?
  - C) Merge conflict UI?
  - D) Accept last-write-wins?
- **No strategy documented**

**Q8: Should .prt changes notify user?**
- fileScanner.js updates auto section silently when .prt changes
- User doesn't see notification
- Could cause confusion ("why did displacement change?")
- Should there be:
  - A) Toast notification "Auto metadata updated"?
  - B) Badge on ProjectCard "Updated"?
  - C) Changelog in metadata?
  - D) No notification needed?
- **No decision made**

**Q9: Why are 38 metadata files uncommitted?**
- `.metadata/*.json` files all modified
- Not in .gitignore → should be tracked
- Contains user-generated manual metadata
- Risk: lose data if .metadata/ deleted
- Should they be:
  - A) Committed to git?
  - B) Added to .gitignore?
  - C) Backed up separately?
- **No decision made**

### 4.4 Features

**Q10: Is .pou merging (73 params) needed?**
- .pou has 71 params
- .det has TCylMax + Convergence (not in .pou)
- Merged would have 73 params
- fileScanner.js prioritizes .pou over .det (no merge)
- Is merged format needed for:
  - A) Charts showing TCylMax from .det + other params from .pou?
  - B) Complete parameter set in DataTable?
  - C) Not needed (71 params sufficient)?
- **No requirements documented**

**Q11: Should file watching be enabled?**
- chokidar installed but not used
- createFileWatcher() exists but not called
- Would allow auto-reload when files change
- Pros: Real-time updates
- Cons: Server complexity, resource usage
- Decision: Enable or leave disabled?
- **No decision made**

**Q12: Chart export quality - is pixelRatio=2 sufficient?**
- PNG export: pixelRatio = 2 (Retina/2x)
- For publication-quality figures?
- Should there be:
  - A) Higher resolution option (pixelRatio=3 or 4)?
  - B) PDF export (vector)?
  - C) Current quality sufficient?
- **No user feedback yet**

### 4.5 Architecture

**Q13: Why 5 calculations limit?**
- Hardcoded: 1 primary + 4 comparisons = 5 total
- CALCULATION_COLORS array has 5 colors
- Technical limit or UX decision?
- Could users want more?
- If yes, how to:
  - A) Add more colors?
  - B) Cycle through colors?
  - C) User-customizable colors?
- **No documented reason for limit**

**Q14: Per-cylinder display - which pattern to use?**
- Preset 2: Always shows all cylinders
- Preset 3: Always shows averaged
- Preset 4: User selects per-cylinder or averaged
- Should there be consistent pattern across all presets?
- Options:
  - A) All presets have per-cylinder toggle
  - B) Each preset decides based on parameter type
  - C) Global setting "Show per-cylinder everywhere"
- **No decision made**

---

## 5. 🔴 CONTRADICTIONS & INCONSISTENCIES

### 5.1 Documentation vs Code

**CONTRADICTION #1: .metadata/ location**
- **docs/architecture.md** shows: `.metadata/` inside `C:/4Stroke/ProjectName/`
- **Reality (metadataService.js:38):** `.metadata/` in `engine-viewer/` project root
- Lines affected: architecture.md lines 222-234, 594-597
- Impact: HIGH - misleading documentation for deployment

**CONTRADICTION #2: Language setting**
- **config.yaml:55** has `language: "ru"` (Russian)
- **Reality (Frontend):** All UI text in English only
- Impact: LOW - config field unused

**CONTRADICTION #3: Missing docs referenced in CLAUDE.md**
- **CLAUDE.md navigation** mentions:
  - `docs/api.md` - Not found
  - `docs/chart-presets.md` - Not found
- **Reality:** These were consolidated into architecture.md
- Impact: LOW - navigation outdated

### 5.2 Code Inconsistencies

**INCONSISTENCY #1: File naming duplication**
- `unitsConverter.ts` exists (legacy)
- `unitsConversion.ts` exists (SSOT)
- Both import/export similar functions
- Impact: LOW - confusing but functional

**INCONSISTENCY #2: Parameter name variations**
- .det files use `TCylMax` (line 23 in detParser.js)
- .pou files use `TC-Av` (line 235 in pouParser.js)
- parameters.ts uses `TC-Av` as canonical name
- Mapping exists: `TCylMax` → `TC-Av` (line 23 in detParser.js)
- Impact: NONE - handled by mapping

**INCONSISTENCY #3: .prt file locations**
- fileScanner.js expects .prt at data folder root (line 179)
- test-data/ has .prt files at root AND inside project folders
- Impact: LOW - scanner only uses root, ignores folder copies

---

## 6. TECHNICAL DEBT INVENTORY

### Priority 1 - HIGH (Blocking or Data Loss Risk)

1. **38 uncommitted metadata files**
   - Location: `.metadata/*.json`
   - Risk: Data loss if .metadata/ deleted
   - Action needed: Commit to git or add to .gitignore + backup

2. **docs/architecture.md errors**
   - Shows .metadata/ in wrong location
   - Misleading for production deployment
   - Action needed: Correct lines 222-234, 594-597

3. **No deployment guide**
   - How to deploy to Windows production?
   - Where to install?
   - How to configure C:/4Stroke/ path?
   - Action needed: Create docs/deployment.md

### Priority 2 - MEDIUM (Feature Gaps, Should Have)

4. **.pou + .det merging**
   - Missing 73-parameter support (pou-merged format)
   - Would enable complete parameter set
   - Action needed: Implement or document why not needed

5. **No unit tests**
   - Zero tests for parsers, services, utilities
   - Risk: Regressions during changes
   - Action needed: Add Jest tests (start with parsers)

6. **File watching disabled**
   - chokidar installed but not used
   - Requires server restart for file changes
   - Action needed: Enable createFileWatcher() or remove dependency

7. **Dark theme not implemented**
   - State exists in Zustand store
   - Setting persists to localStorage
   - But no actual theme switching
   - Action needed: Implement or remove setting

8. **No .env configuration**
   - Data path hardcoded in config.yaml
   - No environment variable support
   - Action needed: Add .env support + .env.example

### Priority 3 - LOW (Nice to Have, Future)

9. **Parameter help tooltips**
   - parameters.ts has brief/description fields
   - Not displayed in UI
   - Action needed: Add tooltips to charts/table

10. **RPM range selector**
    - Cannot zoom to specific RPM range in UI
    - Action needed: Add min/max RPM input fields

11. **Calculation notes feature**
    - Cannot add notes to calculations
    - Would help document test conditions
    - Action needed: Add notes field to Calculation type

12. **Comparison saved presets**
    - Cannot save/load favorite combinations
    - Must re-select each time
    - Action needed: Add preset save/load

13. **DataTable pagination**
    - All rows rendered at once
    - Could be slow with 100+ RPM points
    - Action needed: Implement TanStack Table virtualization

14. **PDF export**
    - Only PNG/SVG/CSV/XLSX
    - PDF would be useful for reports
    - Action needed: Add PDF export option

15. **Legacy file cleanup**
    - `unitsConverter.ts` legacy wrapper
    - Should consolidate to `unitsConversion.ts` only
    - Action needed: Remove duplicate, update imports

---

## 7. NEXT STEPS

This audit document serves as a baseline for:

1. **Fixing documentation errors** (Priority 1)
   - Correct architecture.md .metadata/ location
   - Create deployment.md
   - Update CLAUDE.md navigation

2. **Answering open questions** (Priority 1-2)
   - Decide production .metadata/ location
   - Document .dat/.des/.spo files purpose
   - Define metadata conflict resolution strategy

3. **Addressing technical debt** (Priority 2-3)
   - Commit or gitignore .metadata/*.json files
   - Implement .pou merging or document why not needed
   - Add unit tests for critical parsers
   - Implement or remove dark theme setting

4. **Planning future features** (Priority 3)
   - Parameter tooltips
   - RPM range selector
   - Calculation notes
   - PDF export

---

**END OF AUDIT FINDINGS**
