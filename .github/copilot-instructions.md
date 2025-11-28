# Engine Results Viewer - Copilot Instructions

## Project Overview
Production web app for engine simulation visualization (replacement for Post4T Delphi app).

- **Version:** 3.3.1
- **Stack:** React 19 + TypeScript + Vite (frontend), Express + Node.js 18+ (backend)
- **Platform:** Dev on macOS, Production on Windows
- **Data:** .det/.pou/.prt files from EngMod4T simulation suite

## Directory Structure
```
frontend/src/           # React app
  pages/               # HomePage, PerformancePage, PVDiagramsPage, ProjectOverviewPage
  components/          # UI components (ui/, shared/, performance/, pv-diagrams/)
  hooks/               # Custom hooks (useProjects, useCalculations, etc.)
  stores/              # Zustand state management
  api/                 # Axios API client
backend/src/           # Express server
  parsers/             # ParserRegistry + formats/ (.det, .pou, .prt parsers)
  services/            # fileScanner, metadataService, fileMerger, fileModifier
  routes/              # API routes (data.js, projects.js)
docs/                  # architecture.md (SSOT), ADRs, file-formats/
test-data/             # Sample .prt files for development
scripts/               # start.sh, stop.sh, status.sh
```

## Build & Run Commands
```bash
# Full project (recommended)
./scripts/start.sh      # Start backend + frontend
./scripts/status.sh     # Check running processes
./scripts/stop.sh       # Stop all

# Frontend only (localhost:5173)
cd frontend
npm install
npm run dev             # Development server
npm run build           # Production build
npm run typecheck       # TypeScript validation

# Backend only (localhost:3000)
cd backend
npm install
npm start               # Start server
npm run dev             # With file watching
```

## Critical Rules

### 1. ENGLISH UI (International App)
- ✅ All UI text, types, parameters, chart labels: **English only**
- ✅ Code comments, docs: Russian OK
- ⚠️ .det/.pou parameters: **NEVER translate** (P-Av, Torque, RPM, MEP - keep original names)

### 2. Small Changes + Read First
- ❌ Don't edit files without reading them first
- ❌ Don't change multiple unrelated things at once
- ✅ Change ONE thing → verify → next thing
- ✅ For complex tasks: "Recommend creating roadmap first. Proceed?"

### 3. Verification Before "Done"
- Always run `npm run build` or `npm run typecheck` after frontend changes
- Show actual test/build output
- Don't assume code works — verify it

### 4. NEVER Search in _personal/
- `_personal/` = archive/trash (outdated files, experiments, notes)
- ❌ Don't use as reference for decisions
- ✅ Use official docs: `README.md`, `docs/architecture.md`, `docs/decisions/`

### 5. Official Docs > Guessing
- For React, Vite, ECharts, Express: check official documentation first
- Don't guess APIs from memory — verify from docs

## Key Files
| File | Purpose |
|------|---------|
| `docs/architecture.md` | Complete architecture (SSOT, 2800+ lines) |
| `CHANGELOG.md` | Version history — UPDATE after features |
| `config.yaml` | Data paths, server port, UI settings |
| `shared-types.ts` | Shared TypeScript interfaces |
| `docs/decisions/` | Architecture Decision Records (ADRs) |

## Data Formats
- `.prt` — Project config (in root of data folder, read-only)
- `.det` — Calculation data (24 params), in project subfolders
- `.pou` — Calculation data (71-78 params), in project subfolders
- `.pvd` — PV diagrams (pressure-volume by crank angle)

## Architecture Patterns
- **Parser Registry Pattern** — centralized parser management (`backend/src/parsers/`)
- **Zustand stores** — state management (`frontend/src/stores/`)
- **Radix UI + TailwindCSS** — component library (`frontend/src/components/ui/`)
- **ECharts** — charting library

## What NOT to do
- ❌ Translate parameter names (P-Av, Torque, MEP, BSFC, etc.)
- ❌ Create files in `_personal/`
- ❌ Modify .prt files (read-only source data)
- ❌ Skip verification after code changes
- ❌ Make sweeping refactors without roadmap
