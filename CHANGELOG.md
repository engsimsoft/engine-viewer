# Changelog

Все значимые изменения в проекте документируются в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
версионирование следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Performance
- **Lazy .prt parsing with background queue** (ADR-009):
  - **Backend startup: ~278-306ms** (down from 400-500ms) - **40% faster**
  - Projected 500-file startup: < 2 seconds (down from 30-60 sec) - **95% faster**
  - **Cache validation**: Compare .prt `mtime` vs metadata timestamp - skip unchanged files
  - **Background queue** (p-queue v9.0.0): Process files after server starts, concurrency limit: 3
  - **Race condition protection** (async-mutex v0.5.0): Mutex per projectId prevents JSON corruption
  - **File watcher**: `ignoreInitial: true` prevents re-parsing all files on startup
  - **Queue API**: `/queue/status` endpoint for monitoring (total, pending, completed, isProcessing)
  - **Frontend indicators**:
    - `ParsingProgress` component: fixed top bar showing "Processing X/Y projects (Z%)"
    - `ProjectCard` spinner: shows "Processing metadata..." when metadata missing
    - Toast notification: "All projects processed" on completion
  - **Testing results**:
    - Load test: 135 files processed successfully (306ms startup)
    - Race condition test: 10 parallel writes, 0 JSON errors
    - Regression test: stable restarts (278ms average)
  - **Files**:
    - `backend/src/services/prtQueue.js` (new) - Queue implementation
    - `backend/src/services/fileScanner.js` - Cache validation + ignoreInitial fix
    - `backend/src/services/metadataService.js` - Mutex protection
    - `backend/src/routes/queue.js` (new) - Queue status API
    - `frontend/src/hooks/useQueueStatus.ts` (new) - Polling hook
    - `frontend/src/components/shared/ParsingProgress.tsx` (new) - Progress UI

### Added
- **PV-Diagrams: Stage 3 - Production-Quality Implementation** (following "iPhone Style" & PerformancePage pattern):
  - **Zustand State Management** (`frontend/src/stores/slices/pvDiagramsSlice.ts`, 64 lines):
    - State: selectedRPM (fileName), selectedCylinder (index | null = "All")
    - Actions: setSelectedRPM, setSelectedCylinder, resetPVDiagrams
    - Integration: combined into appStore.ts (session-only persistence)
  - **LeftPanel Components** (PerformancePage pattern):
    - `RPMSection.tsx` (148 lines) - RPM file selector with metadata display
      - Dropdown with .pvd files list
      - Shows: RPM, peak pressure, peak angle, engine info
      - Empty state: "No PV-Diagram Files Found"
    - `CylinderFilterSection.tsx` (117 lines) - Cylinder filter buttons
      - Grid layout (4 columns)
      - "All" button + individual cylinder buttons (Cyl 1-8)
      - Color dots preview (matches chart colors)
      - Info text: "Showing X of Y cylinders"
    - `PVLeftPanel.tsx` (79 lines) - Combined panel
      - Fixed width: 320px (w-80)
      - Sections: RPM Selection + Cylinder Filter
      - Auto-shows cylinder filter after RPM selected
  - **Production Chart Component** (`frontend/src/components/pv-diagrams/PVDiagramChart.tsx`, ~380 lines):
    - **ChartExport integration**: useChartExportHook + registerExportHandlers
    - **Professional empty states**: bg-muted/20, border-dashed, helpful messages
    - **Dynamic export filename**: `{projectName}_PVDiagram_{rpm}RPM_{cylinder}`
    - **Loading/Error states**: proper LoadingSpinner and ErrorMessage components
    - Chart features: tooltip, legend, zoom/pan (inside + slider), area style, 8-color palette
  - **Production Page** (`frontend/src/pages/PVDiagramsPage.tsx`, 143 lines):
    - **Layout**: ChartExportProvider → Header → LeftPanel + Main
    - **Breadcrumbs**: Home → Project → PV-Diagrams
    - **Auto-select peak pressure RPM**: carefully chosen default (iPhone Style)
    - **Cleanup on unmount**: resetPVDiagrams() prevents state leak
    - **Full-screen layout**: min-h-screen, flex flex-col
  - **Routing & Cleanup**:
    - Production route: `/project/:id/pv-diagrams` (added to App.tsx)
    - Deleted test files: PVDiagramTestPage.tsx, PVDiagramControls.tsx
    - Updated App.tsx documentation (Route 4)
  - **Verification**:
    - TypeScript typecheck ✓
    - Frontend build (2.85s, 2.1 MB bundle) ✓
    - Backend server running (localhost:3000) ✓
    - Frontend dev server running (localhost:5174) ✓
    - Code quality: production-ready following PerformancePage pattern ✓
  - **Files Created**: 6 (pvDiagramsSlice, RPMSection, CylinderFilterSection, PVLeftPanel, PVDiagramsPage + chart rework)
  - **Files Deleted**: 2 test files
  - **Progress**: Stage 3 complete (49/73 tasks, 67%)
  - **Next**: User browser verification → Stage 4 (advanced UI)

- **PV-Diagrams: Stage 2 - TypeScript Types & Data Hooks**:
  - **TypeScript Types** (`frontend/src/types/index.ts`, lines 348-441):
    - `PVDSystemConfig` - system configuration from .pvd file (lines 3-15)
    - `PVDMetadata` - metadata from .pvd file (rpm, cylinders, engineType, turbo config, firing order)
    - `PVDCylinderDataPoint` - volume (cm³) + pressure (bar) for one cylinder at one angle
    - `PVDDataPoint` - {deg, cylinders[]} - one data point (0-720° crank angle)
    - `PVDData` - complete parsed .pvd file (metadata + 721 data points)
    - `PVDFileInfo` - file info with peak pressure metadata (from API)
    - `PVDFilesResponse` - API response structure
  - **Backend API Endpoint** (`backend/src/routes/data.js`, lines 726-853):
    - `GET /api/project/:id/pvd/:fileName` - fetch specific .pvd file data (full parsed: metadata + 721 points)
    - Validation: projectId format, .pvd extension
    - Error handling: 404 (file not found), 400 (invalid format), 500 (server error)
  - **API Client Functions** (`frontend/src/api/client.ts`, lines 194-220):
    - `getPVDFiles(projectId)` - fetch list of .pvd files with peak pressure metadata
    - `getPVDData(projectId, fileName)` - fetch specific .pvd file data (721 points)
  - **React Hooks**:
    - `frontend/src/hooks/usePVDFiles.ts` - loads list of .pvd files with metadata, returns {files, rpmPoints, totalFiles, loading, error, refetch}
    - `frontend/src/hooks/usePVDData.ts` - loads specific .pvd file data (721 points), returns {data, loading, error, refetch}
    - Both hooks include: loading states, error handling, refetch function, race condition protection (ignore flag)
  - **Verification**: TypeScript typecheck ✓, Frontend build (2.98s) ✓
  - **Commit**: a07135b

- **Project Summary API endpoint** (`/api/project/:id/summary`):
  - Returns availability status for all 6 analysis types (Performance, Traces, PV-Diagrams, Noise, Turbo, Configuration)
  - Performance availability: checks .det/.pou files, returns calculationsCount
  - Traces availability: scans project folder for trace files (.cyl, .pvd, .wve, .wmf, .tpt, .mch), extracts RPM points and trace types
  - Other analysis types: return `{ available: false }` (Phase 2+)
  - **File**: `backend/src/routes/data.js` (lines 336-494)

- **ProjectOverviewPage component** (Level 2 hub page):
  - Central hub for analysis type selection
  - Grid layout with 6 AnalysisTypeCard components
  - Shows project name, specs (cylinders, engine type)
  - Back button to project list
  - **File**: `frontend/src/pages/ProjectOverviewPage.tsx`

- **AnalysisTypeCard component**:
  - Card UI for each analysis type with icon, title, description
  - Availability states: Available (hover effects, clickable) / Disabled (grayed out, "Coming in Phase 2")
  - Icons from Lucide React: TrendingUp, Activity, LineChart, Volume2, Fan, History
  - Status messages: "X calculations ready", "X RPM points", "Not available"
  - **File**: `frontend/src/components/project-overview/AnalysisTypeCard.tsx`

- **useProjectSummary hook**:
  - Custom React hook for fetching project summary from API
  - Returns `{ summary, loading, error }` states
  - **File**: `frontend/src/hooks/useProjectSummary.ts`

- **Breadcrumbs navigation component**:
  - Shows on Level 3 pages (Analysis Pages: Performance, Traces, etc.)
  - Format: "Engine Viewer > Project Name > Analysis Type"
  - Clickable links with ChevronRight separators
  - Text truncation on small screens
  - **File**: `frontend/src/components/navigation/Breadcrumbs.tsx`

- **Zustand store slices**:
  - `settingsSlice`: User preferences (units, theme, chartSettings) - persisted to localStorage
  - `performanceSlice`: Calculations, presets, UI modals - session-only
  - **Files**: `frontend/src/stores/slices/settingsSlice.ts`, `frontend/src/stores/slices/performanceSlice.ts`

- **Deep linking hook (useDeepLinking)**:
  - Synchronizes URL params with Zustand store state
  - Supports preset, primary calculation, comparison calculations
  - URL format: `/project/:id/performance?preset=1&primary=$1&compare=$2,$5`
  - Cross-project references: `?primary=bmw-m42:$5`
  - Browser Back/Forward support via React Router's useSearchParams
  - Auto-fetches calculation metadata from API when restoring from URL
  - **File**: `frontend/src/hooks/useDeepLinking.ts`

### Changed
- **BREAKING CHANGE: 3-level routing hierarchy** (v2.0 → v3.0):
  - `/project/:id` now shows ProjectOverviewPage (was: ProjectPage/Performance directly)
  - `/project/:id/performance` now shows ProjectPage (was: `/project/:id`)
  - **Rationale**: Project Overview as central hub supports multiple analysis types (Performance, Traces, Config History, etc.)
  - **Migration**: Update any bookmarks from `/project/:id` to `/project/:id/performance` for direct Performance page access
  - **File**: `frontend/src/App.tsx`

- **HomePage navigation updated**:
  - "Open Project" button now navigates to `/project/:id/performance` (shortcut to Performance page)
  - Users can manually navigate to `/project/:id` for Project Overview page
  - **File**: `frontend/src/pages/HomePage.tsx`

- **ProjectPage renamed to PerformancePage** (clarity):
  - More descriptive name for Performance & Efficiency analysis page
  - Function renamed from `ProjectPage()` to `PerformancePage()`
  - Updated comments and documentation
  - **File**: `frontend/src/pages/PerformancePage.tsx` (was ProjectPage.tsx)

- **components/visualization/ renamed to components/performance/**:
  - Better reflects purpose (Performance-specific components)
  - All 20+ components moved to new directory
  - All imports updated automatically
  - **Directory**: `frontend/src/components/performance/`

- **Header component made generic and reusable**:
  - Now accepts props: `title`, `backHref`, `breadcrumbs` (all optional)
  - Default title: "Performance & Efficiency" (backwards compatible)
  - Default backHref: "/" (backwards compatible)
  - Breadcrumbs optional - shown only when provided
  - Reusable for all analysis pages (Performance, Traces, Config History, etc.)
  - Back button destination now configurable
  - **File**: `frontend/src/components/performance/Header.tsx`

- **PerformancePage now shows breadcrumbs**:
  - Breadcrumbs: "Engine Viewer > Project Name > Performance & Efficiency"
  - Back button returns to Project Overview (not HomePage)
  - **File**: `frontend/src/pages/PerformancePage.tsx`

- **Zustand store refactored into modular slices**:
  - Split monolithic store into separate slices for better maintainability
  - `settingsSlice`: Persisted to localStorage (units, theme, chartSettings)
  - `performanceSlice`: Session-only (calculations, presets, UI modals)
  - Combined using Zustand's slice pattern with selective persistence
  - No breaking changes - API remains the same
  - **File**: `frontend/src/stores/appStore.ts`

- **PerformancePage now uses deep linking**:
  - URL params synced with Zustand store state (bidirectional)
  - Shareable URLs: Copy URL to share exact visualization state
  - Browser navigation: Back/Forward restores state correctly
  - Auto-restoration: Refresh page keeps current preset and calculations
  - **File**: `frontend/src/pages/PerformancePage.tsx` (line 52)

- **UI Polish & Accessibility improvements**:
  - Page fade transitions (300ms opacity animation on route changes)
  - Keyboard navigation: Tab through Analysis Type Cards, Enter/Space to activate
  - ARIA labels and accessibility attributes (role="button", aria-label, aria-disabled)
  - Hover effects with smooth transitions (scale + shadow on available cards)
  - Responsive design verified across mobile/tablet/desktop breakpoints
  - **Files**: `frontend/src/App.css`, `frontend/src/App.tsx`, `frontend/src/components/project-overview/AnalysisTypeCard.tsx`

- **.pou/.det format documentation unified to single source of truth** (2025-11-10):
  - **Fixed parameter counts**: NATUR: 74 (was 75), TURBO: 81 (was 82), SUPER: 81 (was 82)
  - **Corrected .det merge strategy**: Only 3 parameters merged (PCylMax, Deto, Convergence) - removed TCylMax (duplicate of .pou's TC-Av)
  - **Updated .det file description**: Changed from "detonation results" to "performance + detonation data (24 parameters)" - file contains full performance dataset
  - **Source of truth**: Post4T Help documentation + verified against real .pou/.det files (GRANTA TURBO, TM Soft ShortCut)
  - **Impact**: Eliminated 19 critical inconsistencies across 7 documentation files
  - **Files updated**:
    - `docs/file-formats/comparison.md` - Fixed parameter counts in Quick Reference table, merge descriptions, migration impact section (removed TCylMax from kept/lost lists)
    - `docs/file-formats/pou-format.md` - Corrected merge counts (71+3=74, 78+3=81), removed TCylMax from merge list
    - `docs/decisions/002-pou-file-format.md` - Added missing Convergence parameter to TypeScript types section (ADR), fixed merge result counts
    - `docs/engmod4t-suite/README.md` - Updated multi-format support description (74-81 params)
    - `docs/engmod4t-suite/folder-structure.md` - Expanded .det description with complete parameter list
    - `docs/engmod4t-suite/suite-integration.md` - Fixed TURBO merge count (82→81), Convergence description (not per-cylinder), multi-format support (75→74-81)
    - `docs/file-formats/det-format.md` - Already corrected (parameter order, TURBO-specific params)

### Fixed
- **Deep linking race condition causing state loss** (2025-11-08):
  - Fixed bug where selecting Primary Calculation → clicking Back → returning to page cleared all selections
  - Root cause: `isSyncingRef` blocking prevented Store → URL sync on first render, then "clear if URL empty" logic cleared store on navigation back
  - Solution: Removed blocking logic and clearing logic, simplified bidirectional sync (Store ↔ URL always in sync)
  - Effect: Store → URL now always syncs, URL → Store only restores from params (doesn't clear)
  - User confirmation: "Отлично все заработало" (Everything works perfectly)
  - **File**: `frontend/src/hooks/useDeepLinking.ts`
  - **Commit**: eeb5fd9

---

## [2.0.0] - 2025-11-02

### Fixed (2025-11-06)
- **500 Internal Server Error for some projects** (2025-11-06):
  - ✅ Fixed error "Cannot read properties of undefined (reading 'map')" in data.js:228
  - ✅ Root cause: Backend was loading .prt files instead of .det/.pou files via scanDirectory()
  - ✅ .prt files contain only metadata (cylinders, bore, stroke) without calculations array → undefined.map() error
  - ✅ Solution: Restricted file scanning to ONLY .det and .pou files, excluding .prt
  - ✅ .prt files now used exclusively for metadata extraction, not for calculations data
  - **File**: `backend/src/routes/data.js` (line 194)
  - **Affected projects**: tm-soft-shortcut and any project without .det/.pou files
  - **Commit**: e784850 (also referenced as 463ab92)
  - **Result**: All projects now load correctly without undefined errors

- **UI crash for projects with single-point calculations** (2025-11-06):
  - ✅ Fixed error "Cannot calculate average step: need at least 2 data points" in rpmCalculator.ts
  - ✅ Root cause: Parsers (detParser.js, pouParser.js) accepted calculations with only 1 data point
  - ✅ RPM step calculation requires minimum 2 points to calculate step between points
  - ✅ Incomplete calculations cause UI crash when trying to display in PrimarySelectionModal
  - ✅ **Solution: Defense in Depth validation (two layers)**:
    1. **Backend filtering** (Primary): detParser.js and pouParser.js now filter calculations with < 2 points
       - Changed validation from `> 0` to `>= 2` data points
       - Added console.warn for skipped calculations (developer visibility)
    2. **Frontend filtering** (Defensive): PrimarySelectionModal.tsx filters calculations before rendering
       - Added `.filter(calc => calc.dataPoints.length >= 2)` before map
       - Added try-catch around calculateAverageStep() for edge cases
  - **Files**:
    - Backend: `backend/src/parsers/formats/detParser.js` (lines 216-223, 243-250)
    - Backend: `backend/src/parsers/formats/pouParser.js` (lines 317-324, 344-351)
    - Frontend: `frontend/src/components/visualization/PrimarySelectionModal.tsx` (lines 209-225)
    - Library: `frontend/src/lib/rpmCalculator.ts` (validation logic - no changes needed)
  - **Testing results** (granta-turbo project):
    - ✅ 67 valid calculations loaded (all with >= 2 points)
    - ✅ 0 calculations with < 2 points (all filtered)
    - ✅ Min data points: 3, Max data points: 31
    - ✅ Backend logs show 8 calculations skipped (3 from .det, 5 from .pou)
  - **Affected projects**: granta-turbo (3 calculations with 1 point filtered), potentially other projects with incomplete simulations
  - **Result**: UI no longer crashes, invalid calculations silently filtered with developer warnings

- **ProjectCard design issues**:
  - ✅ Removed irrelevant badges from cards (Configuration: inline, Exhaust: 4-2-1)
  - ✅ Refactored `EngineBadge` component to show ONLY essential info: Type (NA/Turbo/Supercharged), Cylinders, Intake (ITB/IM)
  - ✅ Client field now ALWAYS visible - shows "(No client)" when empty (user feedback: critical information was hidden)
  - **Files**: `frontend/src/components/projects/EngineBadge.tsx`, `ProjectCard.tsx`
  - **Result**: Cards display only relevant information, Client always visible

- **Missing Status badge**:
  - ✅ Restored Status badge in ProjectCard (removed by mistake during refactoring)
  - ✅ Badge appears in top-right corner of CardHeader with icon and color coding:
    - Active (blue, Wrench icon)
    - Completed (green, CheckCircle icon)
    - Archived (gray, Archive icon)
  - **File**: `frontend/src/components/projects/ProjectCard.tsx` (lines 17-48, 61-65)
  - **User feedback**: "очень важный лейбл" (very important label)
  - **Result**: Project status clearly visible on all cards

- **MetadataDialog not saving changes**:
  - ❌ **Root Cause #1**: Status Select using `defaultValue` instead of `value` - not controlled by react-hook-form
  - ❌ **Root Cause #2**: Frontend sending nested `manual: {...}` object, backend expects flat structure
  - ✅ **Solution #1**: Changed Select to `value={field.value}` (fully controlled component)
  - ✅ **Solution #2**: Flattened payload to match backend API: `{displayName, description, client, tags, status, notes, color}`
  - **File**: `frontend/src/components/projects/MetadataDialog.tsx` (lines 112-124, 390)
  - **Result**: All form fields now save correctly, changes persist after dialog close

### Added (2025-11-06)
- **Engine displacement (volume) badge on ProjectCard** (2025-11-06):
  - ✅ Added automatic displacement calculation in prtParser.js: `π/4 × bore² × stroke × cylinders / 1000000`
  - ✅ Formula converts bore and stroke (mm) → mm³ → cm³ → liters (÷1000000)
  - ✅ Updated AutoMetadata interface: added optional `displacement?: number` field
  - ✅ Updated fileScanner.js: extracts displacement from parser and saves to `.metadata/<project>.json`
  - ✅ Added displacement badge to EngineBadge component (zinc color - engineering style)
  - ✅ Badge displays between Valves and Intake: "1.3L", "1.6L", "1.9L", etc. (one decimal place)
  - ✅ Testing results:
    - Lada 1300 Carb: bore=80mm, stroke=66mm, 4cyl → 1.33L ✓
    - BMW M42: bore=86mm, stroke=83.5mm, 4cyl → 1.94L ✓
    - Vesta 1.6 IM: bore=82mm, stroke=75.6mm, 4cyl → 1.60L ✓
  - **Files**:
    - Backend: `backend/src/parsers/formats/prtParser.js` (lines 263, 439-453, 456-460)
    - Backend: `backend/src/services/fileScanner.js` (line 229 - added displacement extraction)
    - Shared: `shared-types.ts` (lines 300-301 - AutoMetadata interface)
    - Frontend: `frontend/src/components/projects/EngineBadge.tsx` (displacement badge, zinc color)
    - Frontend: `frontend/src/components/projects/ProjectCard.tsx` (line 120 - pass displacement prop)
  - **User feedback**: "не хватает одной информации которое было бы актуально при первом взгляде на карточку это объем двигателя"
  - **Result**: All project cards now display engine displacement at first glance

- **Carb (Carburetor/Collector) intake system support** (2025-11-06):
  - ✅ Added third intake system type: "Carb" (for carburetor and collector systems like 4into1, 1intoN manifolds)
  - ✅ Research phase: Analyzed all 35 .prt files in test-data to understand exact intake descriptions from EngMod4T
  - ✅ Discovered new pattern: "collected intake pipes" indicates carburetor/collector intake systems
  - ✅ Existing patterns: "seperate intake pipes" with context → ITB or IM
  - ✅ Updated prtParser.js parseIntakeSystem() with proper detection priority:
    1. Check "collected intake pipes" FIRST → returns "Carb"
    2. Check "seperate intake pipes" + "with no airboxes" + "but with throttles" → returns "ITB"
    3. Check "seperate intake pipes" + "with a common airbox or plenum" → returns "IM"
    4. Fallback: throttle count check for older .prt files
  - ✅ Added "Carb" to TypeScript type definitions (FiltersBar.tsx line 26)
  - ✅ Added "Carb" option to Engine filter dropdown (FiltersBar.tsx TYPE_OPTIONS)
  - ✅ Updated filter logic to include 'Carb' in intakeSystems array (projectFilters.ts line 23)
  - ✅ Tested on 6 diverse projects - all intake systems correctly identified:
    - lada-1300-carb → Carb ✓
    - 4-cyl-itb → ITB ✓
    - vesta-16-im → IM ✓
    - tm-soft-shortcut → IM ✓
    - bmw-m42 → ITB ✓
    - lada-1300-weber → Carb ✓
  - **Files**:
    - Backend: `backend/src/parsers/formats/prtParser.js` (lines 159-208 - parseIntakeSystem function)
    - Frontend: `frontend/src/components/projects/FiltersBar.tsx` (lines 26, 52-58)
    - Frontend: `frontend/src/utils/projectFilters.ts` (line 23)
  - **Commits**: 463ab92 (parser), 875fea7 (UI filter), 2b2c782 (filter logic)
  - **Result**: Users can now filter and identify carburetor/collector intake systems correctly

- **Phase 3: UI Polish & Animations** (2025-11-06):
  - ✅ **Card hover animations**: Enhanced from shadow-lg to shadow-xl with scale(1.02) on hover
  - ✅ **Transition duration**: Increased from 200ms to 300ms for smoother "iPhone quality" feel
  - ✅ **Badge hover effects**: Added transition-all and hover:scale-105 for subtle interactive feedback
  - ✅ **Search debounce**: Implemented 300ms debounce to prevent excessive re-renders during typing
    - Local searchInput state for immediate visual feedback
    - Debounced filter update after 300ms of no typing
    - Syncs with external filter changes (e.g., clear all)
    - Improves performance for large project lists (50+ projects)
  - **Files**:
    - `frontend/src/components/projects/ProjectCard.tsx` - card hover animations
    - `frontend/src/components/ui/badge.tsx` - badge hover effects
    - `frontend/src/components/projects/FiltersBar.tsx` - search debounce logic
  - **Commit**: d443629
  - **Result**: Smooth, professional animations matching "iPhone quality" standard

- **Phase 3: Accessibility Improvements (WCAG 2.1 AA)** (2025-11-06):
  - ✅ **Empty states**: Added role="status" and aria-live="polite" for screen reader announcements
  - ✅ **Decorative emojis**: Added aria-hidden="true" to prevent screen reader confusion
  - ✅ **Projects grid**: Added role="list" and aria-label="Projects list" for semantic structure
  - ✅ **Keyboard navigation**: Verified all interactive elements accessible via keyboard
    - Tab through filters ✓
    - Tab through project cards ✓
    - Enter/Space to open projects ✓
  - ✅ **Color contrast**: Verified WCAG 2.1 AA compliance (contrast ratio > 4.5:1)
    - All badge colors meet accessibility standards
    - Text on colored backgrounds readable
  - **Files**:
    - `frontend/src/pages/HomePage.tsx` - empty states, projects grid
  - **Commit**: e143fdd
  - **Result**: Fully accessible interface for screen readers and keyboard-only users

- **Valves filter and badge** (Phase 2.8):
  - ✅ Replaced "Created Year" filter with "Valves per Cylinder" filter (2, 3, 4, 5 valves)
  - ✅ Added valves badge to ProjectCard showing total valves (16V, 24V, etc.) in cyan color
  - ✅ Badge calculation: cylinders × valvesPerCylinder (e.g., 4 Cyl × 4 valves = 16V)
  - ✅ Clarified terminology: "Valves per Cylinder" instead of ambiguous "Valves"
  - ✅ Updated filter placeholder to "Valves/Cyl" for brevity
  - **Files**: `EngineBadge.tsx`, `FiltersBar.tsx`, `MetadataDialog.tsx`, `projectFilters.ts`
  - **Commits**: 71b03f9 (filter), db34058 + 7939c00 (badge)
  - **Result**: Users can filter by valves per cylinder and see total valve count on cards

- **Auto-scan & File Watcher** (Phase 2.8):
  - ✅ Automatic .prt file processing on server startup (<1 second scan time)
  - ✅ Real-time file watcher using chokidar for instant .prt detection
  - ✅ Watches for add/change/delete events in test-data folder
  - ✅ Auto-generates metadata from .prt files without manual restart
  - ✅ Error detection system with 4 error types:
    - missing_prt (CRITICAL) - no .prt file found
    - parsing_failed (ERROR) - .prt file exists but parsing failed
    - incomplete_metadata (WARNING) - missing critical engine specs
    - corrupted_files (CRITICAL) - files cannot be read
  - ✅ Error UI: Red badge on ProjectCard + detailed error section in MetadataDialog
  - **Files**: `server.js`, `fileScanner.js`, `ProjectCard.tsx`, `MetadataDialog.tsx`, `alert.tsx`
  - **Commit**: 43b1d5c
  - **Result**: New projects auto-detected in <1 second, errors clearly visible

- **Project count statistics in filters** (Phase 2.8):
  - ✅ Faceted search with counts showing next to each filter option (e.g., "4 Cyl (15)")
  - ✅ Statistics for all filters: Cylinders, Valves/Cyl, Engine (Type + Intake), Tags
  - ✅ Efficient calculation: single O(n) pass through projects, memoized with useMemo
  - ✅ Calculation functions:
    - calculateCylinderCounts() - count by cylinder count
    - calculateValvesCounts() - count by valves per cylinder
    - calculateTypeCounts() - count by engine type and intake system
    - calculateTagCounts() - count by tags
  - ✅ Extended MultiSelectOption interface with optional count field
  - **Files**: `projectFilters.ts`, `HomePage.tsx`, `FiltersBar.tsx`, `MultiSelect.tsx`
  - **Commit**: 2083bfc
  - **Result**: Users can see data distribution before applying filters

- **Git Repository Cleanup** (Phase 2.8):
  - ✅ Excluded entire test-data/ folder from Git (will be several GB with multiple projects)
  - ✅ Updated .gitignore with test-data/ pattern
  - ✅ Removed test-data from Git index while preserving local files
  - ✅ Clean repository ready for production deployment
  - **Files**: `.gitignore`
  - **Result**: No calculation results or test data in Git, only source code

- **UI/UX Improvements - Card Layout & Status Filter** (Phase 2.9, 2025-11-06):
  - ✅ **Fixed uneven card heights**: Added `auto-rows-fr` to grid and `h-full` to Card component
    - All cards in same row now have equal height (no more jagged grid)
    - **Files**: `HomePage.tsx`, `card.tsx`
  - ✅ **Fixed Status badge overflow**: Moved Status and Error badges to calculations count row
    - Badges no longer overflow on long project names (e.g., "Dudarev Motorsport")
    - Calculations count row has predictable length, perfect for badges
    - **File**: `ProjectCard.tsx`
  - ✅ **Combined Sort & Status dropdown** (Variant 2):
    - Single dropdown with two sections: "Sort By" and "Status"
    - Sort options: Modified (newest), Created (oldest), Name (A-Z)
    - Status options: Active, Completed, Archived (checkboxes with counts)
    - Smart button: Shows "Status (2)" when filters active, otherwise current sort method
    - Benefits: Prevents Tags dropdown clutter with many user tags, logical grouping
    - **Files**: `FiltersBar.tsx`, `projectFilters.ts`, `HomePage.tsx`
  - ✅ **UI Polish**:
    - Reduced spacing: py-6→py-4, gap-6→gap-4, space-y-3→space-y-2, px-6→px-4
    - Visual hierarchy: Added font-bold to project title
    - Responsive grid: 1/2/3/4 columns for mobile/tablet/desktop/wide screens
    - Result: 9→12-16 projects visible on screen (better information density)
    - **Files**: `card.tsx`, `ProjectCard.tsx`
  - **Result**: Dashboard UI polished to "iPhone quality" - clean, professional, efficient

### Fixed (2025-11-02)
- **CRITICAL: Fixed .det + .pou file merge** (2025-11-02):
  - ✅ Fixed incorrect merge logic that was losing critical parameters
  - ✅ Created proper `fileMerger.js` service with `mergeDetPouData()` function
  - ✅ Merge now adds ALL missing parameters from .det to .pou:
    - **TCylMax** (max cylinder temperature) - critical for engine safety analysis
    - **PCylMax** (max cylinder pressure) - critical for engine safety analysis
    - **Deto** (detonation indicator) - critical for engine safety analysis
    - **Convergence** (calculation quality indicator) - calculation validation
  - ✅ New format type: 'pou-merged' (75-82 parameters = 71-78 from .pou + 4 from .det)
  - ✅ Improved deduplication logic in fileScanner.js with format priority:
    - pou-merged (75-82 params) > pou (71-78 params) > det (24 params)
  - ✅ Updated TypeScript types to support 'pou-merged' format
  - ✅ Proper merge logging for debugging
  - **Result**: When both files exist (.det + .pou), users get complete 75-parameter dataset automatically

- **TypeError in Chart Presets with optional parameters** (2025-11-02):
  - ✅ Fixed TypeError "Cannot read properties of undefined (reading 'reduce')" in Custom Chart
  - ✅ Updated frontend/src/types/index.ts - marked TCylMax, PCylMax, Deto, Convergence as optional (?)
  - ✅ Added null checks in ChartPreset4.tsx before array operations (.reduce(), .length)
  - ✅ Added null checks in ChartPreset2.tsx for PCylMax per-cylinder data
  - ✅ ChartPreset3.tsx already had proper null checks for TCylMax (no changes needed)
  - ✅ Filter out data points where optional parameters are missing (graceful degradation)
  - **Root cause**: Pure .pou files don't have PCylMax/TCylMax/Deto/Convergence parameters
  - **Result**: All chart presets now handle optional parameters correctly without errors

### Added
- **Multi-format file support** (2025-11-01):
  - ✅ Added support for .pou files (71 parameters) in addition to .det files (24 parameters)
  - ✅ Parser Registry architecture using Registry pattern for scalable format support
  - ✅ Auto-detection of file format by extension (.det/.pou) and content (metadata field count)
  - ✅ Unified parsing API (parseEngineFile) supporting both formats
  - ✅ Format-specific parsers: detParser.js (24 params), pouParser.js (71 params)
  - ✅ Common utilities: calculationMarker.js ($ marker parsing), formatDetector.js (format detection)
  - ✅ TypeScript types: PouMetadata (5 fields), PouDataPoint (71 parameters)
  - ✅ Updated fileScanner.js to scan both .det and .pou files
  - ✅ Updated config.yaml with .pou extension
  - ✅ Updated API routes to include format field in response
  - ✅ Comprehensive documentation:
    - [pou-format.md](docs/file-formats/pou-format.md) - complete .pou specification (71 parameters documented)
    - [comparison.md](docs/file-formats/comparison.md) - detailed .det vs .pou comparison
    - [parsers-guide.md](docs/parsers-guide.md) - complete rewrite with Registry pattern guide
    - [sample.pou](docs/file-formats/examples/sample.pou) - annotated example file
- **Cross-project calculation comparison**: Compare calculations from different projects (1 primary + up to 4 comparisons)
- **Peak values cards**: Always visible cards showing power, torque, and RPM at peak (no hover needed)
- **RPM step display**: Shows actual data density (e.g., "200 RPM step") instead of useless point count
- **Units conversion system**: Switch between SI/American/HP units with live conversion (Settings popover)
- **Settings popover**: Theme switching (Light/Dark), units conversion, animation toggle, grid toggle
- **English UI**: Complete translation for international users
- **Smooth animations**: 300-500ms transitions on modals, buttons, panels (Phase 6.2)
- **Empty states**: Friendly messages with clear instructions for PrimarySection, ComparisonSection, HomePage
- **Error handling**:
  - ErrorBoundary component for React errors
  - Toast notifications via Sonner
  - API error handling with try-catch
  - User-friendly error messages with retry functionality
- **Responsive design**:
  - Desktop (>1024px): LeftPanel 320px fixed, full header
  - Tablet (768-1024px): LeftPanel collapsible with hamburger menu
  - Mobile (<768px): LeftPanel full-screen overlay, compact header, touch-friendly buttons (44x44px)
- **Accessibility (WCAG 2.1 AA)**:
  - Keyboard navigation (Tab, Enter, Space, ESC)
  - Focus indicators with ring-2 offset
  - ARIA labels on all interactive elements
  - Screen reader support via Radix UI
  - Color contrast compliance

### Changed
- **Complete UI redesign**: iPhone-quality professional interface
- **ChartPreset4 (Custom Chart) refactoring - Phase 1** (2025-11-02):
  - ✅ Fixed critical naming convention: replaced long names (`param.displayName`) with short names (`param.name`)
    - Series names: "P-Av", "Torque" instead of "Average Power", "Torque"
    - Legend labels: "P-Av", "Torque" (concise)
    - Y-axis labels: "PS", "N·m", "bar" (only units, no parameter names)
  - ✅ Removed massive parameter selector UI from chart page (45 lines)
  - ✅ Added compact "Select Parameters" button showing selected count and parameter names
  - ✅ Implemented dynamic multi-axis system (following ChartPreset3 pattern):
    - 1 parameter → 1 Y-axis (left)
    - 2 parameters with different units → 2 Y-axes (left + right)
    - 3+ parameters → multiple Y-axes with 60px offset for readability
  - ✅ Implemented proper color system (following ChartPreset1 pattern):
    - Single calculation mode: parameter colors for axes and lines (blue P-Av, orange Torque)
    - Comparison mode: parameter colors for axes, calculation colors for lines (red primary, blue comparison)
  - ✅ Enhanced legend with line style indicators (solid/dashed) and dynamic colors:
    - Single mode: colored legend matching parameter colors
    - Comparison mode: gray legend (user relies on line styles)
  - ✅ Legend always shown (not only for multiple parameters)
  - **Result**: ChartPreset4 now follows established design patterns from ChartPreset1-3, clean professional UI
- **ChartPreset4 (Custom Chart) refactoring - Phase 2-3** (2025-11-02):
  - ✅ Created **ParameterSelectorModal.tsx** - Simple modal for parameter selection
  - ✅ Modal features:
    - Search bar with real-time filtering (search by short name or full name)
    - Parameter grid (2-3 columns responsive layout)
    - Parameter cards with: short name, unit badge, "AVG" badge for per-cylinder params
    - **Per-cylinder selection**: Popover dropdown (Avg/Cyl1-4) for selected per-cylinder parameters
    - Selected state styling (blue border + background)
    - Footer with count ("2 parameters selected") and Done button
  - ✅ NO category tabs - Custom Chart doesn't duplicate Preset 1-6 logic
  - ✅ NO selected chips section - Selected params already shown on chart page
  - ✅ RPM excluded from list - It's always X-axis, can't be Y-parameter
  - ✅ 23 chartable parameters available (all except RPM, vibe-model, quality)
  - ✅ Integration with ChartPreset4 via "Select Parameters (2 selected)" button
  - ✅ State management via Zustand store (isParameterSelectorOpen, toggleParameterSelector, setCylinderSelection)
  - ✅ Per-cylinder data support: Users can drill into specific cylinders for detailed analysis
  - **Result**: Clean, simple parameter selection with advanced per-cylinder analysis capabilities
- **ChartPreset4 (Custom Chart) refactoring - Phase 4** (2025-11-03):
  - ✅ Enhanced **ParameterSelectorModal.tsx** - Category grouping matching Help page layout
  - ✅ Modal improvements:
    - **Category-based grouping**: Parameters organized into 7 categories (Performance, MEP, Temperature, Combustion, Efficiency, Vibe Model, Calculation Quality)
    - **Color-coded section headers**: Each category has distinct color (blue Performance, purple MEP, red Temperature, orange Combustion, cyan Efficiency, green Vibe, gray Quality)
    - **Parameter count badges**: Shows count of parameters in each category
    - **Smart search mode**: When user searches, groups disappear and flat filtered list appears
    - **Empty state handling**: "No parameters found" message for empty search results
    - **Consistent with Help page**: Categories and colors match HelpPage.tsx for UX consistency
  - ✅ 7 category sections with proper grouping:
    - Performance (2): P-Av, Torque
    - MEP (4): FMEP, IMEP, BMEP, PMEP
    - Temperature (3): TCylMax, TUbMax, TexAv
    - Combustion (4): TAF, Timing, Delay, Durat
    - Efficiency (5): DRatio, PurCyl, Seff, Teff, Ceff
    - Vibe Combustion Model (4): VibeDelay, VibeDurat, VibeA, VibeM
    - Calculation Quality (1): Convergence
  - ✅ Responsive grid maintained: 3 columns desktop, 2 columns mobile
  - ✅ Per-cylinder selection (Avg/Cyl1-4) preserved for array parameters
  - ✅ Search functionality: Real-time filtering across all categories, instant clear
  - **Result**: Professional category-based organization matching Help page, improved UX and parameter discovery
- **Professional chart legend design** (2025-11-01):
  - ✅ Repositioned legend at top center (top: 15px) - perfect alignment with Y-axis labels
  - ✅ Updated typography to match axis labels (fontSize: 14, fontWeight: bold)
  - ✅ Changed color from #6b7280 (light gray) to #666 (darker, better contrast)
  - ✅ Increased line symbol length from 20px to 25px for better visibility
  - ✅ Applied unified professional style across all chart presets (Preset 1, 3, 4)
  - ✅ Reduced chart top spacing (grid.top: 50px) - more space for peak values cards
  - ✅ Reduced chart bottom spacing (grid.bottom: 40px) - tighter gap with cards (space-y-2: 8px)
  - ✅ macOS/iPhone quality design - clean, unified visual hierarchy
- **New modal dialogs**: PrimarySelectionModal and ComparisonModal for calculation selection
- **Restructured left panel**: Three sections (Primary + Presets + Comparison)
- **Updated all 4 chart presets**: Support for multi-project data display
- **Enhanced chart export**: PNG/SVG buttons in Header (Phase 5)
- **Optimized layout**: Full-width peak values cards, inline format (Addendum v2.0.1)
- **Data table updates**: Source column with color indicators, dynamic headers with units, calculation filter
- **Zustand store**: New state management with CalculationReference structure

### Fixed
- Point count replaced with useful RPM step calculation
- Peak values now always visible (not just on hover)
- Removed LiveCursorPanel from charts (replaced with inline peak values)
- Removed zoom UI elements (replaced with Shift+Drag zoom interaction)
- All error messages translated to English

### Technical
- **Architecture**: Implemented Phase 1-6 from roadmap.md
- **Components**: Created 20+ new components (modals, sections, cards, popovers)
- **Hooks**: useMultiProjectData for cross-project comparison, useChartPreset for preset management
- **Contexts**: ChartExportContext for export handler management
- **Build**: Vite + TypeScript + React 18 + TailwindCSS + Radix UI + ECharts

---

## [Unreleased]

### Added
- **Chart Preset 6: Efficiency Parameters (Premium Interactive Version)** (2025-11-02):
  - ✅ **NEW Chart Preset 6** - Interactive efficiency parameters visualization
  - ✅ **ChartPreset6.tsx** - Single-axis chart with interactive legend:
    - 5 efficiency parameters with different line styles: DRatio (solid), PurCyl (dashed), Seff (dotted), Teff (dash-dot), Ceff (VE) (long-dash)
    - Per-cylinder averaging for all 5 parameters (all are array parameters)
    - **Interactive legend**: Click to hide/show parameters, minimum 1 always visible
    - Centered legend buttons with visual line style previews
    - Parameter labels: "Ceff (VE)" for user clarity (VE = Volumetric Efficiency)
    - Dynamic color system: efficiency colors in single calc mode, calculation colors in comparison mode
    - Peak markers with averaged values for all 5 parameters
    - All parameters dimensionless (no unit conversion needed)
    - Apple-level UX: smooth transitions, accessibility (aria-labels, disabled states)
  - ✅ **PeakValuesCards.tsx** - Case 6 for efficiency parameters:
    - Per-cylinder averaging matching ChartPreset6 logic
    - Shows all 5 peaks with parameter labels
    - **CRITICAL FIX**: Fixed decimals hardcoded bug affecting ALL presets
    - Added `decimals` parameter to `getPeakValuesForCalculation()` function
    - Replaced all hardcoded `.toFixed(1)` with dynamic `.toFixed(decimals)` (7 occurrences)
    - Now respects decimals setting from Settings popover across all 6 presets
  - ✅ **chartConfig.ts** - Extended efficiency color palette:
    - Added 5 efficiency colors (was 2, expanded to 5): efficiency1-5
    - High-contrast palette: Blue, Red, Green, Orange, Purple
  - ✅ **DataTable.tsx** - **CRITICAL FIX**: Comprehensive refactoring to support ALL 6 presets:
    - **Issue**: DataTable was completely broken for Presets 2, 3, 5, 6 (only Preset 1 worked)
    - **Root cause**: Hardcoded for 4 presets, missing 15+ parameters
    - Extended `selectedPreset` type from `1 | 2 | 3 | 4` to `1 | 2 | 3 | 4 | 5 | 6`
    - Added 15 new fields to TableRow interface:
      - Preset 2 (MEP): fmep, imep, bmep, pmep
      - Preset 3 (Critical): pcylMax, tcAv, maxDeg
      - Preset 5 (Combustion): taf, timing, delay, durat
      - Preset 6 (Efficiency): dRatio, purCyl, seff, teff, ceff
    - Created `averageIfArray()` helper for per-cylinder averaging
    - Added data extraction logic for all 15 missing parameters
    - Added 15 new column definitions with proper headers and units
    - **FIXED column filter logic** for all 6 presets:
      - Preset 2 now shows MEP parameters (FMEP, IMEP, BMEP, PMEP) instead of PCylMax
      - Preset 3 now shows Critical parameters (PCylMax, TC-Av, MaxDeg) instead of TCylMax/TUbMax
      - Preset 5 now shows Combustion parameters (TAF, Timing, Delay, Durat)
      - Preset 6 now shows Efficiency parameters (DRatio, PurCyl, Seff, Teff, Ceff (VE))
    - Updated CSV/Excel export handlers for all 6 presets with correct parameters
    - Fixed preset names: "MEP Data", "Critical Engine Values", "Combustion Data", "Efficiency Data"
    - **Preset 4 (Custom) unchanged per user request** - will be worked on in Phase 2
  - ✅ **PresetSelector.tsx** - Added Preset 6 button "Efficiency"
  - ✅ **appStore.ts, types/v2.ts** - Extended selectedPreset type to `1 | 2 | 3 | 4 | 5 | 6`
  - ✅ **ProjectPage.tsx** - Added case 6 routing
  - **Result**: Complete 6-preset system with interactive Preset 6, DataTable working for all presets, decimals fix across all peak values
  - Files: [ChartPreset6.tsx](frontend/src/components/visualization/ChartPreset6.tsx), [PeakValuesCards.tsx](frontend/src/components/visualization/PeakValuesCards.tsx), [DataTable.tsx](frontend/src/components/visualization/DataTable.tsx), [chartConfig.ts](frontend/src/lib/chartConfig.ts), [PresetSelector.tsx](frontend/src/components/visualization/PresetSelector.tsx)

- **Chart Preset 5: Combustion Parameters (TAF, Timing, Delay, Durat)** (2025-11-02):
  - ✅ **NEW Chart Preset 5** - Combustion parameters visualization
  - ✅ **ChartPreset5.tsx** - Dual Y-axis chart:
    - **Dual Y-axis**: Left (Deg) for Timing/Delay/Durat, Right (AFR) for TAF
    - 4 combustion parameters with different line styles (solid, dashed, dotted, dash-dot)
    - Per-cylinder averaging for Delay and Durat (array parameters)
    - Scalar handling for TAF and Timing (global parameters)
    - TAF (Trapped Air/Fuel ratio) on right axis, degree-based parameters on left axis
    - Dynamic color system: combustion colors in single calc mode, calculation colors in comparison mode
    - Custom graphic legend at top center: TAF (purple), Timing (orange), Delay (green), Durat (red)
    - Peak markers with averaged values for all 4 parameters
    - No unit conversion needed (all parameters: conversionType 'none')
  - ✅ **PeakValuesCards.tsx** - Case 5 for combustion parameters:
    - Per-cylinder averaging for Delay and Durat
    - Scalar peak finding for TAF and Timing
    - Shows all 4 peaks with parameter labels
  - ✅ **chartConfig.ts** - Added combustion color palette:
    - combustion1-4: Purple, Orange, Green, Red
  - ✅ **PresetSelector.tsx** - Added Preset 5 button "Combustion"
  - ✅ **exportFilename.ts** - Updated for 5 presets, fixed preset names (MEP, Critical)
  - ✅ **appStore.ts, types/v2.ts** - Extended selectedPreset type to `1 | 2 | 3 | 4 | 5`
  - ✅ **ProjectPage.tsx** - Added case 5 routing
  - **Result**: Clean dual-axis combustion chart with intuitive Deg/AFR labels (iPhone-quality simplicity)
  - Files: [ChartPreset5.tsx](frontend/src/components/visualization/ChartPreset5.tsx), [PeakValuesCards.tsx](frontend/src/components/visualization/PeakValuesCards.tsx), [chartConfig.ts](frontend/src/lib/chartConfig.ts), [PresetSelector.tsx](frontend/src/components/visualization/PresetSelector.tsx), [exportFilename.ts](frontend/src/lib/exportFilename.ts)

- **Chart Preset 3: Critical Engine Values (PCylMax, TC-Av, MaxDeg)** (2025-11-02):
  - ✅ Complete rewrite of Preset 3 for Critical Engine Values
  - ✅ **ChartPreset3.tsx** - NEW triple Y-axis chart:
    - Triple Y-axis: PCylMax (left), TC-Av (right), MaxDeg (right offset 60px)
    - Fixed Y-axis ranges: PCylMax (20-120 bar), TC-Av (1800-2800°C), MaxDeg (0-30 °ATDC)
    - Per-cylinder averaging for PCylMax and MaxDeg
    - TC-Av: scalar parameter (already averaged, no averaging needed)
    - **CRITICAL**: MaxDeg shows MINIMUM value (detonation risk if <14°)
    - MaxDeg unit: °ATDC (degrees After Top Dead Center)
    - Dynamic color system: parameter colors in single calc mode, calculation colors in comparison mode
    - Custom graphic legend at top center with line styles (solid, dashed, dotted)
    - Peak markers: MAX for PCylMax/TC-Av, MIN for MaxDeg
    - Units conversion (bar ↔ psi, °C ↔ °F)
  - ✅ **PeakValuesCards.tsx** - Updated for Preset 3:
    - Case 3 logic rewritten for Critical Values
    - MaxDeg: finds MINIMUM value (detonation risk indicator)
    - Per-cylinder averaging for PCylMax and MaxDeg
    - TC-Av: scalar handling (no averaging)
    - **ALL presets now show parameter labels** for consistency and clarity
    - Format: "PCylMax: 95.3 bar at 6800 RPM • TC-Av: 2456°C at 7800 RPM • MaxDeg: 9.5 °ATDC at 5600 RPM"
  - ✅ **chartConfig.ts** - Extended Y-axis support:
    - Added min/max parameters to createYAxis() for fixed ranges
    - Enables consistent scale across different calculations
  - ✅ **PresetSelector.tsx** - Updated label:
    - Preset 3 label changed from "Temperature" to "Critical"
  - **Result**: Preset 3 now shows critical engine parameters that can destroy the engine if values are dangerous
  - Files: [ChartPreset3.tsx](frontend/src/components/visualization/ChartPreset3.tsx), [PeakValuesCards.tsx](frontend/src/components/visualization/PeakValuesCards.tsx), [chartConfig.ts](frontend/src/lib/chartConfig.ts), [PresetSelector.tsx](frontend/src/components/visualization/PresetSelector.tsx)

- **Chart Preset 2: MEP (Mean Effective Pressures)** (2025-11-02):
  - ✅ Complete rewrite of Preset 2 for MEP parameters (FMEP, IMEP, BMEP, PMEP)
  - ✅ **ChartPreset2.tsx** - NEW single-axis chart replacing old PCylMax preset:
    - Shows 4 MEP parameters with different line styles (solid, dashed, dotted, dash-dot)
    - Per-cylinder averaging for IMEP, BMEP, PMEP (array parameters)
    - Scalar handling for FMEP (global parameter)
    - Dynamic color system: parameter colors in single calc mode, calculation colors in comparison mode
    - Custom graphic legend at top center (colored in single mode, gray in comparison mode)
    - Units conversion via unified API (convertValue, getParameterUnit)
    - Peak markers with averaged values
  - ✅ **PeakValuesCards.tsx** - Updated for Preset 2:
    - Case 2 logic rewritten to show MEP peaks instead of PCylMax
    - Per-cylinder averaging matching ChartPreset2 logic
    - Added info icon with Tooltip explaining averaged values
    - Tooltip text: "Averaged values across all cylinders. To view per-cylinder data, use Custom Chart."
    - Parameter labels displayed for Preset 2 (FMEP:, IMEP:, BMEP:, PMEP:) since all share same unit "bar"
    - Format: "FMEP: 19.1 bar at 6800 RPM • IMEP: 15.5 bar at 5600 RPM • ..."
  - ✅ **peakValues.ts** - Generic parameter handling:
    - Added else block for unknown parameters (FMEP support)
    - Generic access via (point as any)[parameter]
    - Automatic array detection with Math.max(...value) for per-cylinder parameters
    - Scalar value handling for non-array parameters
  - ✅ **chartConfig.ts** - MEP color palette:
    - Added PARAMETER_COLORS.mep1-mep4 (Blue, Orange, Green, Red)
    - Color definitions for single calculation mode visualization
  - ✅ **PresetSelector.tsx** - Updated label:
    - Preset 2 label changed from "Pressure / PCylMax" to "MEP"
    - Simplified UI (removed description field) for professional users
    - Compact card sizing (px-2.5 py-2, text-xs)
  - **Result**: Preset 2 now shows critical MEP engineering parameters with proper averaging and clear visualization
  - Files: [ChartPreset2.tsx](frontend/src/components/visualization/ChartPreset2.tsx), [PeakValuesCards.tsx](frontend/src/components/visualization/PeakValuesCards.tsx), [peakValues.ts](frontend/src/lib/peakValues.ts), [chartConfig.ts](frontend/src/lib/chartConfig.ts), [PresetSelector.tsx](frontend/src/components/visualization/PresetSelector.tsx)

### Changed
- **Unified Conversion API Migration** (2025-11-02):
  - ✅ Migrated all chart presets and peak values to use unified conversion API
  - ✅ Replaced old conversion functions (convertPower, convertTorque, etc.) with convertValue(value, paramName, units)
  - ✅ Replaced old unit getters (getPowerUnit, getTorqueUnit, etc.) with getParameterUnit(paramName, units)
  - ✅ **Benefits**: Single source of truth (PARAMETERS config), extensible for new parameters, cleaner code
  - Files: ChartPreset1.tsx, ChartPreset2.tsx, PeakValuesCards.tsx

- **Help Page Header Unification** (2025-11-02):
  - ✅ Unified header layout between Help page and Visualization page for consistent UX
  - ✅ Three-column flexbox layout: [Back button] [Title + Subtitle centered] [Spacer for balance]
  - ✅ Moved title "Parameters Reference" and subtitle from main content to header
  - ✅ Responsive Back button text: "Back to Visualization" on desktop, "Back" on mobile
  - ✅ Matching styling: bg-card, px-6 py-4, text-xl font-bold
  - ✅ Result: Unified styling across all application pages
  - File: [frontend/src/pages/HelpPage.tsx](frontend/src/pages/HelpPage.tsx)

### Fixed
- **Help Page UX Improvements** (2025-11-02):
  - ✅ Improved Info icon clickable area from 24px × 24px to 32px × 32px (+33%)
  - ✅ Increased button padding p-1 → p-2 without changing icon visual size
  - ✅ Better accessibility meeting WCAG 32px touch target minimum
  - ✅ Preserved visual hierarchy (icon stays h-4 w-4 = 16px)
  - Commit: 5bc5b02
  - File: [frontend/src/pages/HelpPage.tsx](frontend/src/pages/HelpPage.tsx)

### Added
- **Phase 8: Parameter System Integration (Sections 8.1 & 8.2)** (2025-11-02):
  - ✅ **Section 8.1 - Parameters Configuration**:
    - Created `frontend/src/config/parameters.ts` - Single Source of Truth for all 73 engine parameters
    - TypeScript types: `ParameterMetadata`, `ParameterCategory`, `ParameterFormat`, `ConversionType`
    - Defined 29 unique parameter types (8 global, 17 per-cylinder, 4 Vibe model) = 73 values for 4-cylinder engine
    - Helper functions: `getParameter()`, `getChartableParameters()`, `getParametersByCategory()`, `getParametersByFormat()`, `isParameterAvailable()`
    - Full JSDoc documentation with usage examples
  - ✅ **Section 8.2 - Units Conversion Integration**:
    - Refactored `frontend/src/lib/unitsConversion.ts` to use PARAMETERS config
    - Removed all pattern matching (`if (parameter.startsWith('P-'))...`) → config-based lookup
    - Created `getParameterUnit()` function for dynamic unit label retrieval
    - Replaced hardcoded conversion logic with `param.conversionType` from config
    - Backward compatible: all existing functionality preserved
  - ✅ **User Documentation**:
    - Created `docs/PARAMETERS-REFERENCE.md` - comprehensive reference for all 73 parameters
    - Technical format with ID, parameter name, unit, format availability, conversion type
    - Organized by category: Global (8), Per-Cylinder (17 × 4 = 68), Vibe Model (4)
    - Placeholder for expert descriptions (brief & detailed) to be filled by domain expert
    - Updated `README.md` with link to new documentation

### Changed
- **UI Improvements** (2025-11-02):
  - Removed file extension display from UI (`.det` no longer shown after project name)
  - Updated `ProjectPage.tsx` and `PrimarySelectionModal.tsx` to use `project.name` instead of `project.fileName`
  - Cleaner interface after .det + .pou merge implementation

### Fixed
- **Format Compatibility Checks** (2025-11-02):
  - ⚠️ **TEMPORARY WORKAROUND**: Added null/undefined checks for TCylMax and Convergence parameters
  - `frontend/src/lib/peakValues.ts`: Added checks before spread operator usage for TCylMax, PCylMax, TUbMax
  - `frontend/src/components/visualization/DataTable.tsx`: Display '—' for undefined TCylMax/Convergence in .pou files
  - **NOTE**: This is a stopgap solution. Real fix requires implementing .det + .pou data merge in backend
  - **ISSUE**: TCylMax parameter (critical for analysis) currently lost when .pou file selected over .det
- **Backend Deduplication** (2025-11-02):
  - Updated `backend/src/services/fileScanner.js` with Map-based deduplication
  - When both .det and .pou files exist with same base name, .pou format takes priority (71 params vs 24)
  - Prevents duplicate project entries in project list
  - **KNOWN ISSUE**: Deduplication currently discards .det-only parameters (TCylMax, Convergence)
- **Test Data Fix** (2025-11-02):
  - Fixed calculation names in `test-data/TM Soft ShortCut.det` to match .pou file
  - Line 3: `$Ex 4-2-1` → `$Cal_1`
  - Line 57: `$Ex DK ShrotCut` → `$Cal_3`
  - Restored proper .det + .pou merge functionality for this project

### Fixed
- **DataTable Sync with Custom Chart Parameter Selection** (2025-11-01):
  - ✅ Fixed DataTable showing ALL parameters in Custom Chart (Preset 4) instead of only selected ones
  - ✅ Added selectedCustomParams to Zustand store for synchronization between ChartPreset4 and DataTable
  - ✅ DataTable now filters columns based on which parameters are selected on Custom Chart
  - ✅ CSV/Excel export also respects selected parameters for Preset 4
  - ✅ Presets 1, 2, 3 continue to work correctly with their fixed parameter sets
  - Commit: 68ac256

- **Duplicate File Extension in Header** (2025-11-01):
  - ✅ Fixed duplicate .det extension in project header (e.g., "TM Soft ShortCut.det.det" → "TM Soft ShortCut.det")
  - ✅ Backend fileName already includes extension, removed redundant .det suffix in Header component
  - Commit: 188472c

- **Cross-Project Comparison Functionality** (2025-11-01):
  - ✅ Restored cross-project comparison feature (was broken by commit 067c2dc)
  - ✅ Removed erroneous comparison clearing logic that prevented adding comparisons from other projects
  - ✅ Only primary calculation is now cleared when switching projects (correct behavior)
  - ✅ Cross-project comparison is a KEY FEATURE - comparisons persist across project URL switches
  - ✅ Users can now compare calculations from ANY projects without issues
  - Commit: cf0c9bd

- **Color Palette & Comparison Mode Indicators** (2025-11-01):
  - ✅ Updated CALCULATION_COLORS with high-contrast Engineering Style palette
  - ✅ Fixed similar color issue: replaced cyan (#4ecdc4) and blue (#45b7d1) with distinct green (#2ecc71) and blue (#3498db)
  - ✅ Restored color dots in PeakValuesCards for comparison mode (≥2 calculations)
  - ✅ Color dots shown only when needed (hidden in single calculation mode for cleaner UI)
  - ✅ Fixed architecture: types/v2.ts is Single Source of Truth for CALCULATION_COLORS
  - ✅ New colors easily distinguishable on charts: Red → Green → Blue → Orange → Purple
  - Commits: e3adb81, 6b3270f, 935b9b5

### Changed
- **Chart Axis Labels Simplification & Line Style Legend** (2025-11-01):
  - ✅ Simplified Y-axis labels - removed parameter names, kept only units (e.g., "kW" instead of "P-Av (kW)")
  - ✅ Added line style legend at top center of charts showing parameter-to-line style mapping
  - ✅ Preset 1 (Power & Torque): "—— P-Av    - - - Torque" legend with solid/dashed line symbols
  - ✅ Preset 2 (Pressure): Only unit label (bar/psi), no legend needed (all solid lines)
  - ✅ Preset 3 (Temperature): "—— TCylMax    - - - TUbMax" legend with solid/dashed line symbols
  - ✅ Preset 4 (Custom): Dynamic legend showing selected parameters with alternating solid/dashed styles
  - ✅ Cleaner visual hierarchy - no parameter name duplication between axes and legend
  - ✅ Better UX for multi-calculation comparison mode
  - Files: ChartPreset1.tsx, ChartPreset2.tsx, ChartPreset3.tsx, ChartPreset4.tsx

- **Color Palette Order Optimization** (2025-11-01):
  - ✅ Swapped comparison color order for better visual hierarchy
  - ✅ Comparison 1: Blue (#3498db) - clearer contrast as first comparison
  - ✅ Comparison 2: Green (#2ecc71) - distinct from blue
  - ✅ New order: Red (primary) → Blue → Green → Orange → Purple
  - ✅ Previous order: Red (primary) → Green → Blue → Orange → Purple
  - ✅ Improved color perception in multi-calculation comparison charts

- **Accessibility Implemented (Phase 6.6)** (2025-11-01):
  - ✅ Keyboard navigation: ProjectCard enhanced with Enter/Space support, role="button", aria-label
  - ✅ Focus indicators: button.tsx has focus-visible:ring-[3px], ProjectCard has ring-2 with offset
  - ✅ ARIA labels: added aria-label to Edit button in ProjectCard
  - ✅ Forms: React Hook Form with FormLabel automatically associates labels with inputs
  - ✅ Modals: Radix UI Dialog provides role="dialog", aria-modal, focus trap, ESC support
  - ✅ Screen reader: DialogTitle linked via aria-labelledby, semantic HTML structure
  - ✅ Color contrast: Tailwind + shadcn/ui theme meets WCAG 2.1 AA standards
  - ✅ All interactive elements keyboard accessible and properly labeled

- **Documentation Cleanup** (2025-11-01):
  - ✅ Removed 4 obsolete documentation files (completed specs, old versions)
  - ✅ Deleted: roadmap.md (old v2.0), engine-viewer-tech-spec .md, engine-viewer-ui-spec.md, ENGINE-VIEWER-V2-SPEC-ADDENDUM.md
  - ✅ Renamed: roadmap-v2.md → roadmap.md (standard naming)
  - ✅ Updated all references in DOCUMENTATION_GUIDE.md, CLAUDE.md, CHANGELOG.md
  - ✅ All documentation now points to ENGINE-VIEWER-V2-SPEC.md (current spec)
  - ✅ Cleaner project root following SSOT principles

- **Responsive Design Optimized (Phase 6.5)** (2025-11-01):
  - ✅ Button sizes increased for better touch targets: default h-11 (44px), icon buttons size-11 (44x44px)
  - ✅ Header optimized for mobile: PNG/SVG buttons show icon-only on small screens (<640px)
  - ✅ Header metadata condensed: calculations count hidden on mobile
  - ✅ Modals improved: nearly full-screen on mobile (inset-4 = 16px margins)
  - ✅ Desktop layout (>1024px): LeftPanel 320px fixed, always visible, full header
  - ✅ Tablet layout (768-1024px): LeftPanel collapsible with hamburger menu, overlay
  - ✅ Mobile layout (<768px): LeftPanel full-screen overlay, single column cards, compact header
  - ✅ All responsive features already implemented in Phase 2, enhanced for better UX
  - Commit: [current]

### Added
- **Error Handling Implemented (Phase 6.4)** (2025-11-01):
  - ✅ Created ErrorBoundary component to catch React rendering errors
  - ✅ Integrated ErrorBoundary into App.tsx wrapping all routes
  - ✅ Friendly error page with reload and try again buttons
  - ✅ Error details displayed in development mode for debugging
  - ✅ Toast notifications via Sonner for user feedback throughout app
  - ✅ API error handling with try-catch and ApiError class
  - ✅ Error states in hooks (useProjects, useProjectData) with retry functionality
  - ✅ All error messages translated to English (hooks: useProjects, useProjectData)
  - Commit: [current]

### Changed
- **Animations Verified and Enhanced (Phase 6.2)** (2025-11-01):
  - ✅ Button hover effects: Added `hover:scale-[1.02]` and `active:scale-[0.98]` with 150ms duration
  - ✅ Disabled state: Added `disabled:hover:scale-100` to prevent scale on disabled buttons
  - ✅ Modal animations: Verified Radix UI Dialog has fade-in/out and zoom transitions (200ms)
  - ✅ Chart animations: Verified ECharts animation controlled by store flag
  - ✅ Card hover effects: Verified existing `hover:shadow-lg` and `transition-all duration-200`
  - ✅ Panel animations: Verified existing transition-colors and shadow effects
  - All animations smooth, professional feel, matching specification timings
  - Commit: [current]

### Added
- **Empty States Improved (Phase 6.3)** (2025-11-01):
  - ✅ PrimarySection: Added friendly empty state when no primary calculation selected
    - 📊 icon, "Select Primary Calculation" heading, "to start visualization" subtitle
    - "Select Calculation" button opens Primary Selection Modal
  - ✅ ComparisonSection: Enhanced empty state when no comparisons added
    - ⚖️ icon, "No Comparisons Yet" heading, "Add calculations to compare" subtitle
    - "Add First Calculation" button opens Comparison Modal
  - ✅ HomePage: Improved empty state when no projects found
    - 📂 icon, "No Projects Found" heading
    - Instructions: "Place .det files in the test-data/ folder to get started"
  - All empty states follow consistent design: centered layout, large emoji icon, clear messaging, actionable CTAs
  - Commit: [current]

### Changed
- **UI Translated to English (Phase 6.1)** (2025-11-01):
  - ✅ All UI text translated from Russian to English
  - ✅ HomePage: "Projects found", "No projects found"
  - ✅ ProjectCard: Status labels, "Open Project", "Client:", "Modified:"
  - ✅ MetadataDialog: Form labels, placeholders, validation messages, toast messages
  - ✅ TagInput: "Add tag...", "Remove tag", hint text
  - ✅ ErrorMessage: "Try Again" button
  - ✅ CalculationSelector: All labels and messages
  - ✅ Changed date-fns locale from ru to enUS
  - ✅ Fixed TypeScript errors (unused imports, type issues)
  - Note: Comments remain in Russian (acceptable per CLAUDE.md)
  - Commit: [current]

### Added
- **Chart Export в Header** (2025-11-01):
  - Кнопки PNG/SVG перенесены из области графика в Header рядом с Settings
  - Создан ChartExportContext для управления export handlers между компонентами
  - Освобождено ~60px вертикального пространства для графика
  - Commit: [current]

### Changed
- **DataTable обновлён для multi-project support (Phase 5)** (2025-11-01):
  - Обновлён интерфейс: `calculations: CalculationReference[]` вместо старой структуры
  - ✅ Добавлена колонка "Source" с color indicators для идентификации проектов
  - ✅ Динамические headers с units labels (SI/American/HP)
  - ✅ Units conversion применена ко всем значениям (power, torque, pressure, temperature)
  - ✅ Фильтр расчётов: dropdown "Show: [All calculations ▼]"
  - ✅ CSV/Excel export с units conversion и Source column
  - ✅ Loading/error states (LoadingSpinner, ErrorMessage)
  - Интегрирован useMultiProjectData hook для cross-project data loading
  - Обновлён ProjectPage для передачи allCalculations вместо project.calculations
  - Commit: [current]


- **UI Layout Optimization - Addendum v2.0.1** (2025-11-01):
  - ❌ Удалены redundant headers: "Visualization", preset names, "Peak Values"
  - ✅ Заменены Grid Cards (2 колонки) на Full-Width Cards (одна карточка на строку)
  - Inline формат peak values: "🏆 215.7 PS at 7800 RPM • 219.1 N·m at 6600 RPM"
  - Hover эффекты: shadow + translateY(-2px)
  - Responsive: стакается вертикально на mobile (<768px)
  - **Результат:** График получает 76% viewport (было 50%), всё помещается без scroll
  - Commit: [current]

- **Settings теперь работают** (2025-11-01):
  - ✅ Theme (Light/Dark) - применяется к document root через useEffect в App.tsx
  - ✅ Animation Enabled - применяется к getBaseChartConfig()
  - ✅ Show Grid - применяется к createXAxis() и createYAxis()
  - Все ChartPreset компоненты (1, 2, 3, 4) используют settings из Zustand store
  - Commit: [current]

- **Оптимизация UI графиков** (2025-11-01):
  - Удалён компонент LiveCursorPanel из всех 4 chart presets
  - Причина: дублировал функциональность встроенного ECharts tooltip ("масло масляное")
  - Удалено 190 строк кода (cursor state, event handlers, JSX)
  - Теперь используется только компактный встроенный tooltip ECharts
  - Commit: 4823fc3

### Fixed
- **Infinite loop в useChartExport** (2025-11-01):
  - Обернул handleExportPNG и handleExportSVG в useCallback
  - Исправлена ошибка "Maximum update depth exceeded"
  - Commit: [current]

### Planned
- Режим "Список" для HomePage
- Поиск и фильтры проектов
- Unit тесты (Backend + Frontend)

---

## [1.0.0] - 2025-10-22

🎉 **Первая полнофункциональная версия!**

### Added - Все пресеты графиков (Этап 8) ✅
- **ChartPreset2** - Давление в цилиндрах (PCylMax)
  - График с 4 линиями (по одной на каждый цилиндр)
  - Легенда с цветовой кодировкой
  - Экспорт в PNG/SVG

- **ChartPreset3** - Температура в цилиндрах (TCylMax)
  - График с 4 линиями (TCyl1-TCyl4)
  - Средние значения по цилиндрам
  - Экспорт в PNG/SVG

- **ChartPreset4** - Кастомные параметры
  - Выбор любых параметров для отображения
  - Динамические кнопки выбора параметров
  - Поддержка массивов (средние значения)
  - Экспорт в PNG/SVG

- **PresetSelector** компонент
  - Переключение между 4 пресетами графиков
  - Кнопочный UI с иконками
  - Сохранение выбранного пресета

### Added - Таблица данных с экспортом ✅
- **DataTable** компонент ([frontend/src/components/visualization/DataTable.tsx](frontend/src/components/visualization/DataTable.tsx)):
  - Отображение всех параметров выбранных расчётов
  - Сортировка по любой колонке (ascending/descending)
  - Pagination (10/25/50/100 строк на странице)
  - Zebra striping и hover effects
  - Responsive дизайн

- **Экспорт данных**:
  - CSV формат (для Excel, Google Sheets)
  - XLSX формат (нативный Excel)
  - Автоматическое форматирование колонок
  - Правильные имена файлов (с ID расчётов)

### Added - Экспорт графиков ✅
- **exportChartToPNG()** - растровый формат:
  - Для презентаций PowerPoint
  - Для вставки в Word документы
  - Retina качество (pixelRatio: 2)

- **exportChartToSVG()** - векторный формат:
  - Для научных публикаций
  - Для печати высокого качества
  - Бесконечное масштабирование

- **ChartExportButtons** компонент:
  - Переиспользуемые кнопки экспорта
  - Tooltips с объяснением форматов
  - Отключение когда нет данных

- **useChartExport** hook:
  - Упрощение работы с экспортом
  - Автоматический ref management
  - Единый интерфейс для всех пресетов

### Changed
- Обновлён README.md (компактный, 136 строк, SSOT принцип)
- Все пресеты графиков теперь с кнопками экспорта PNG/SVG
- ProjectPage интегрирует DataTable под графиками

### Fixed
- Исправлены импорты типов (@tanstack/react-table)
- Исправлена работа с полем 'P-Av' (дефис в названии)
- Исправлено использование `calc.id` вместо `calc.marker`

### Technical
- Установлена @tanstack/react-table v8.11
- Установлена xlsx библиотека для экспорта
- Создан utils/export.ts модуль
- Все графики используют единый hook useChartExport

---

## [1.5.0] - 2025-10-22

### Added - Страница визуализации (Этап 7) ✅
- **ProjectPage компонент** ([frontend/src/pages/ProjectPage.tsx](frontend/src/pages/ProjectPage.tsx)):
  - Полноценная страница визуализации проекта
  - Двухколоночный layout: CalculationSelector (слева) + ChartPreset1 (справа)
  - Информационная карточка проекта с метаданными
  - Кнопка "Назад к проектам" для навигации
  - Обработка всех состояний: loading, error, empty, data
  - Счётчик выбранных расчётов с правильным склонением ("расчёт/расчёта/расчётов")

- **useProjectData hook** ([frontend/src/hooks/useProjectData.ts](frontend/src/hooks/useProjectData.ts)):
  - Custom hook для загрузки детальных данных проекта по ID
  - Race condition handling с ignore flag в useEffect
  - Управление состояниями: project, loading, error
  - Функция refetch для повторной загрузки
  - Автоматическая очистка при размонтировании компонента

- **useSelectedCalculations hook** ([frontend/src/hooks/useSelectedCalculations.ts](frontend/src/hooks/useSelectedCalculations.ts)):
  - Custom hook для управления выбором расчётов (максимум 5)
  - Функции: toggleCalculation, clearSelection, isSelected
  - Валидация максимального количества выборов
  - Хелперы: canSelect, isMaxReached, count, maxCount

- **CalculationSelector компонент** ([frontend/src/components/visualization/CalculationSelector.tsx](frontend/src/components/visualization/CalculationSelector.tsx)):
  - UI компонент для выбора расчётов через checkboxes
  - Цветные индикаторы для каждого расчёта (5 цветов из config.yaml)
  - Badge с количеством выбранных расчётов
  - Автоматическое отключение checkboxes при достижении лимита
  - Tooltip подсказка при превышении лимита

- **ChartPreset1 компонент** ([frontend/src/components/visualization/ChartPreset1.tsx](frontend/src/components/visualization/ChartPreset1.tsx)):
  - График "Мощность и крутящий момент" (dual Y-axes)
  - Левая ось Y: P-Av (Мощность в кВт)
  - Правая ось Y: Torque (Момент в Н·м)
  - Ось X: RPM (Обороты двигателя)
  - DataZoom slider для интерактивного зумирования
  - Tooltip с кастомным форматированием (цвет, единицы измерения)
  - Legend для переключения видимости серий
  - Пунктирная линия для момента, сплошная для мощности
  - Цветовая схема из config.yaml (5 цветов с циклическим повторением)

- **chartConfig.ts** ([frontend/src/lib/chartConfig.ts](frontend/src/lib/chartConfig.ts)):
  - Базовая конфигурация для всех ECharts графиков
  - Функции: getBaseChartConfig(), createXAxis(), createYAxis()
  - Константа CALCULATION_COLORS (5 цветов из config.yaml)
  - Grid settings с правильными отступами для dual Y-axes
  - Tooltip configuration с кастомным форматированием
  - DataZoom настройки (slider + inside zoom)
  - Legend настройки

- **checkbox.tsx UI компонент** ([frontend/src/components/ui/checkbox.tsx](frontend/src/components/ui/checkbox.tsx)):
  - Radix UI checkbox компонент (был пропущен в shadcn/ui setup)
  - Использует @radix-ui/react-checkbox
  - TailwindCSS стилизация
  - Check icon из lucide-react

- **ECharts интеграция**:
  - Установлены пакеты: echarts ^5.5.0, echarts-for-react ^3.0.2
  - React wrapper для ECharts с полной типизацией
  - Оптимизация через useMemo для перерасчёта опций только при изменении данных

### Fixed - Критический баг API
- **API response format mismatch** ([frontend/src/api/client.ts](frontend/src/api/client.ts)):
  - **Проблема**: Frontend показывал "Проект не найден" при открытии проекта
  - **Причина**: Backend возвращал `{success: true, data: {...}, meta: {...}}`, frontend ожидал `{project: {...}}`
  - **Решение**: Изменена функция getProject() для правильного извлечения данных:
    ```typescript
    // Было:
    return data.project;

    // Стало:
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    ```
  - **Результат**: Визуализация работает корректно ✅

- **Missing checkbox component**:
  - Добавлен пропущенный checkbox компонент из Radix UI
  - Установлен пакет @radix-ui/react-checkbox

### Changed
- **Router configuration**:
  - Обновлён App.tsx с маршрутом `/project/:id` для ProjectPage
  - Homepage теперь использует react-router navigate для перехода к проектам

### Testing - Страница визуализации
- ✅ **ProjectPage**:
  - Загрузка проекта по ID работает корректно ✅
  - Loading состояние отображается ✅
  - Error состояние с retry функцией работает ✅
  - Навигация "Назад к проектам" работает ✅

- ✅ **CalculationSelector**:
  - Выбор/снятие выбора расчётов работает ✅
  - Ограничение максимум 5 расчётов соблюдается ✅
  - Цветные индикаторы отображаются корректно ✅
  - Disabled state для checkboxes работает ✅

- ✅ **ChartPreset1**:
  - График рендерится корректно с двумя осями Y ✅
  - DataZoom slider работает плавно ✅
  - Tooltip показывает правильные данные с единицами ✅
  - Legend переключение серий работает ✅
  - Цвета применяются согласно config.yaml ✅

- ✅ **Тестирование с реальными данными**:
  - BMW M42: 30 расчётов, выбор 5 расчётов, график отображается ✅
  - Vesta 1.6 IM: 17 расчётов, выбор 5 расчётов, график отображается ✅
  - Подтверждено пользователем со скриншотом ✅

### Performance - Visualization Page
- **Initial render**: ~100-200ms для ProjectPage с графиком
- **Chart render**: ~50-100ms для ECharts с 5 сериями (2500+ точек)
- **DataZoom interaction**: плавная, без задержек
- **useProjectData hook**: эффективная загрузка с race condition protection
- **useMemo optimization**: перерасчёт chartOption только при изменении selectedCalculations

### Technical Details
- **Dual Y-Axes Implementation**:
  - yAxis[0] (левая): Мощность (кВт), color: #1f77b4
  - yAxis[1] (правая): Момент (Н·м), color: #ff7f0e
  - Каждая серия привязана к своей оси через yAxisIndex

- **Color Management**:
  - Цвета из config.yaml: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#a29bfe']
  - Функция getCalculationColor(index) с модулем для циклического повторения
  - Индикаторы в CalculationSelector синхронизированы с цветами графика

- **Data Flow**:
  - ProjectPage → useProjectData → API → Backend → .det файл
  - CalculationSelector → toggleCalculation → selectedIds state
  - ChartPreset1 → filter calculations by selectedIds → ECharts option → render

- **State Management**:
  - useProjectData: загрузка данных с race condition handling
  - useSelectedCalculations: локальный state для выбора расчётов (не сохраняется)
  - useMemo для оптимизации перерасчёта chartOption

### Documentation
- Roadmap обновлён:
  - Этап 7 отмечен как завершённый (все подзадачи ✅)
  - Прогресс: ~75/80 задач (94%)
  - Следующий этап: Этап 8 - Остальные пресеты графиков

- CHANGELOG.md обновлён (эта запись)

### Notes
- **Stage 7 полностью завершён** ✅
- Один пресет графиков работает (ChartPreset1)
- Осталось создать ещё 3 пресета (Stage 8)
- Frontend визуализация готова к расширению
- ECharts интеграция стабильна и производительна

---

## [1.4.0] - 2025-10-22

### Added - MetadataDialog (Этап 6) ✅
- **MetadataDialog компонент** (`frontend/src/components/projects/MetadataDialog.tsx`):
  - Форма редактирования метаданных проектов
  - Использует react-hook-form + zod для валидации
  - Все поля: description, client, tags, status, notes, color
  - Controlled inputs через shadcn/ui FormField
  - Максимальная длина описания: 500 символов
  - HEX color picker с предустановленными цветами

- **TagInput компонент** (`frontend/src/components/shared/TagInput.tsx`):
  - Controlled input для управления тегами
  - Добавление: Enter или запятая
  - Удаление: клик на X или Backspace на последнем теге
  - Отображение через Badge компонент
  - Защита от дублирования тегов

- **Toast notifications**:
  - Интеграция Sonner в App.tsx
  - Уведомления о успешном сохранении
  - Уведомления об ошибках

- **shadcn/ui компоненты**:
  - form, label, textarea (для формы)
  - select (для выбора статуса)
  - sonner (для toast уведомлений)

- **API методы для метаданных** (`frontend/src/api/client.ts`):
  - `saveMetadata(id, metadata)` - сохранение/обновление
  - `getMetadata(id)` - получение метаданных
  - `deleteMetadata(id)` - удаление метаданных

- **Интеграция в HomePage**:
  - Edit button на ProjectCard
  - State для editingProject
  - onSuccess callback для refetch после сохранения
  - Передача project.metadata в диалог

### Fixed - Критические проблемы
- **Infinite render loop**: `form.reset()` обернут в useEffect вместо прямого вызова во время рендера
- **Метаданные не загружаются**: Изменено чтение с `project.description` на `project.metadata?.description`
  - Backend возвращает метаданные в вложенном объекте `metadata`
  - Frontend читал из плоских полей
  - Данные СОХРАНЯЛИСЬ правильно, но не отображались после перезагрузки
- **TypeScript errors**: Исправлены type-only imports для verbatimModuleSyntax

### Changed
- `ProjectInfo` interface теперь использует вложенный объект `metadata` (необязательный)
- ProjectCard показывает данные из `project.metadata`
- MetadataDialog читает данные из `project.metadata` вместо плоских полей

### Technical Details
- **Валидация**: zod schema с ограничениями длины и regex для HEX цветов
- **Form state**: react-hook-form управляет состоянием формы
- **Reset logic**: useEffect с зависимостями [project, open, form]
- **Data flow**: HomePage → MetadataDialog → API → Backend → .metadata/*.json

---

## [1.3.0] - 2025-10-22

### Added - HomePage с карточками (Этап 5) ✅
- **HomePage компонент** (`frontend/src/pages/HomePage.tsx`):
  - Загрузка проектов через useProjects hook
  - Grid layout (1/2/3 колонки responsive)
  - Обработка состояний: loading, error, empty, data
  - Навигация в проект через react-router

- **ProjectCard компонент** (`frontend/src/components/projects/ProjectCard.tsx`):
  - Карточка проекта с метаданными
  - Цветная полоска слева (из metadata.color)
  - Иконки статусов: 🔧 В работе / ✅ Завершён / 📦 Архив
  - Теги (Badge компонент)
  - Кнопка "Открыть проект"
  - Edit button для открытия MetadataDialog

- **useProjects hook** (`frontend/src/hooks/useProjects.ts`):
  - Загрузка списка проектов
  - Управление состояниями loading, error, data
  - Race condition handling (ignore flag)
  - refetch функция для обновления

- **Shared компоненты**:
  - LoadingSpinner - индикатор загрузки
  - ErrorMessage - сообщение об ошибке с кнопкой retry

### Changed
- React Router setup с HomePage (/) и ProjectPage (/project/:id)
- API client обновлён с методом getProjects()

---

## [1.2.0] - 2025-10-22

### Added - Frontend Setup (Этап 4) ✅
- **Vite + React + TypeScript проект**:
  - Frontend проект создан с шаблоном `react-ts`
  - 237 зависимостей установлено, 0 уязвимостей
  - Dev server работает на `http://localhost:5173`

- **TailwindCSS v4 + Vite plugin**:
  - Установлен `@tailwindcss/vite` (новый подход 2025)
  - Настроена интеграция через Vite plugin (не PostCSS)
  - `index.css` обновлён на `@import "tailwindcss";`
  - CSS переменные для светлой/тёмной темы настроены автоматически

- **TypeScript Path Aliases**:
  - Настроен алиас `@/*` → `./src/*`
  - Обновлены `tsconfig.json` и `tsconfig.app.json`
  - Обновлен `vite.config.ts` для резолва путей
  - Импорты вида `@/components/ui/button` работают корректно

- **Vite Proxy для API**:
  - Настроен proxy `/api` → `http://localhost:3000`
  - Добавлен `rewrite` для удаления префикса `/api` перед проксированием
  - Backend routes обновлены (убран префикс `/api`)
  - Health check и projects API работают корректно через proxy

- **shadcn/ui интеграция**:
  - Инициализирован с цветовой схемой "Neutral"
  - Создан `components.json` конфигурация
  - Создан `src/lib/utils.ts` с `cn()` утилитой
  - Установлено 8 базовых компонентов:
    - Button, Card, Input, Dialog
    - Select, Badge, Separator, Sonner (вместо устаревшего Toast)

- **Структура папок**:
  ```
  frontend/src/
  ├── components/
  │   ├── ui/              ← shadcn/ui компоненты (8 файлов)
  │   ├── layout/          ← для Layout, Header
  │   ├── shared/          ← общие компоненты
  │   ├── projects/        ← ProjectCard, ProjectList
  │   └── metadata/        ← MetadataDialog
  ├── pages/               ← HomePage, ProjectPage
  ├── hooks/               ← custom hooks
  ├── types/               ← TypeScript типы
  ├── api/                 ← API client
  └── lib/                 ← shadcn utils
  ```

- **TypeScript типы** (`src/types/index.ts`):
  - Синхронизировано с `backend/src/types/engineData.ts`:
    - EngineMetadata, DataPoint, Calculation, EngineProject
    - ProjectMetadata, ProjectInfo
  - API Response типы:
    - ProjectsListResponse, ProjectDetailsResponse, DataQueryParams
  - UI-specific типы:
    - ViewMode, SortBy, FilterStatus
    - LoadingState, ChartPreset, SelectedCalculations
    - ExportFormat, ExportOptions

- **API клиент** (`src/api/client.ts`):
  - Axios instance с базовой конфигурацией (`baseURL: '/api'`)
  - Timeout: 10 секунд
  - Кастомный класс `ApiError` для обработки ошибок
  - Реализовано 6 методов:
    - `getProjects()` - список всех проектов
    - `getProject(id)` - детальные данные проекта
    - `getMetadata(id)` - метаданные проекта (null если нет)
    - `saveMetadata(id, metadata)` - создание/обновление метаданных
    - `deleteMetadata(id)` - удаление метаданных
    - `healthCheck()` - проверка соединения с backend

- **Тестовое приложение** (`src/App.tsx`):
  - Демонстрационный UI для проверки интеграции
  - API Health Check индикатор
  - Кнопка загрузки проектов с отображением результатов
  - Использует все установленные shadcn/ui компоненты
  - Полностью типизировано TypeScript

### Testing - Frontend Setup
- ✅ Backend запущен на `http://localhost:3000`:
  - Health check: `{"status":"ok","uptime":217s}` ✅
  - `/api/projects` возвращает 2 проекта (BMW M42, Vesta 1.6 IM) ✅
- ✅ Frontend запущен на `http://localhost:5173`:
  - Vite dev server стартовал за 597ms ✅
  - TailwindCSS компилируется корректно ✅
  - shadcn/ui компоненты импортируются без ошибок ✅
  - TypeScript path aliases работают ✅
- ✅ API интеграция:
  - Proxy работает (frontend → backend) ✅
  - API клиент успешно выполняет запросы ✅
  - Типы полностью совместимы с backend ✅

### Performance - Frontend Setup
- **Vite dev server start**: 597ms (очень быстро)
- **npm install**: 47s для 237 пакетов
- **shadcn/ui init**: ~10s
- **TypeScript compilation**: мгновенная (Vite HMR)

### Fixed
- **Vite Proxy Issue** (22 окт, 11:44 UTC):
  - Проблема: Прокси не работал, browser показывал 404 на `/api/health`
  - Причина: Прокси НЕ удалял префикс `/api`, backend получал `/api/health` вместо `/health`
  - Решение из официальной документации Vite:
    - Добавлен `rewrite: (path) => path.replace(/^\/api/, '')` в vite.config.ts
    - Обновлены роуты в backend/src/server.js (убран префикс `/api`)
  - Результат: Health check и projects API работают корректно ✅
  - Источник решения: https://vite.dev/config/server-options.html (WebFetch)

### Documentation
- Roadmap обновлён:
  - Этап 4 отмечен как завершённый (все фичи 1-5) ✅
  - Прогресс: ~58/60+ задач (96%)
  - Следующее: Этап 5 - HomePage с карточками проектов
- CHANGELOG.md обновлён (эта запись)

---

## [1.1.0] - 2025-10-22

### Added
- **Project Metadata API** (Этапы 3.5.1 и 3.5.2 завершены):
  - `backend/src/services/metadataService.js` (200+ строк) - полное управление метаданными
  - `backend/src/routes/metadata.js` (150+ строк) - REST endpoints для метаданных
  - Хранение метаданных в `.metadata/*.json` файлах
  - Интеграция метаданных в `GET /api/projects` endpoint

- **Metadata Service функции**:
  - `getMetadata(projectId)` - получить метаданные проекта
  - `saveMetadata(projectId, metadata)` - создать/обновить метаданные
  - `deleteMetadata(projectId)` - удалить метаданные
  - `getAllMetadata()` - получить все метаданные (Map)
  - `hasMetadata(projectId)` - проверить существование
  - `ensureMetadataDir()` - создать `.metadata/` директорию
  - Автоматическое управление timestamps (createdAt, updatedAt)

- **API endpoints (3 новых)**:
  - `GET /api/projects/:id/metadata` - получить метаданные проекта (404 если нет)
  - `POST /api/projects/:id/metadata` - создать/обновить метаданные с валидацией
  - `DELETE /api/projects/:id/metadata` - удалить метаданные (204 No Content)

- **TypeScript типы** (в backend/src/types/engineData.ts):
  - `ProjectMetadata` - метаданные проекта (description, client, tags, notes, status, color, timestamps)
  - `ProjectInfo` - расширенная информация о проекте (комбинация .det данных + метаданных)

- **Валидация метаданных**:
  - Обязательные поля: description, client, tags, notes, status, color
  - Валидация status (active/completed/archived)
  - Валидация типов (tags должен быть массив)
  - 400 Bad Request с понятными сообщениями об ошибках

### Changed
- **backend/src/routes/projects.js**:
  - Добавлен импорт `getAllMetadata` из metadataService
  - GET /api/projects теперь автоматически включает метаданные для каждого проекта
  - Поле `metadata` добавлено к каждому проекту (`null` если метаданные не созданы)
  - Обновлён JSDoc тип `ProjectListItem` (добавлено поле `metadata`)

- **Timestamp management**:
  - `createdAt` устанавливается при первом создании метаданных
  - `updatedAt` автоматически обновляется при каждом сохранении
  - `createdAt` сохраняется при обновлении существующих метаданных

### Fixed
- Исправлена ошибка сохранения `createdAt` при обновлении метаданных:
  - **Было**: пытались взять `createdAt` из входящего объекта (которого там нет)
  - **Стало**: читаем существующие метаданные через `getMetadata()` и сохраняем `createdAt`

### Performance
- **getAllMetadata()**: ~2-5ms для загрузки всех метаданных из `.metadata/`
- **GET /api/projects** с метаданными: ~10-12ms (включая загрузку метаданных)
- Эффективное кэширование (Map) для метаданных в памяти
- Graceful error handling (пропускает невалидные JSON файлы)

### Testing
- ✅ GET /api/projects/:id/metadata:
  - Получение существующих метаданных (200) ✅
  - Получение несуществующих метаданных (404) ✅
- ✅ POST /api/projects/:id/metadata:
  - Создание новых метаданных (created: true) ✅
  - Обновление существующих метаданных (created: false) ✅
  - Валидация missing fields (400) ✅
  - Валидация invalid status (400) ✅
  - Сохранение createdAt при обновлении ✅
- ✅ DELETE /api/projects/:id/metadata:
  - Удаление существующих метаданных (204 No Content) ✅
  - Удаление несуществующих метаданных (404) ✅
- ✅ GET /api/projects интеграция:
  - Метаданные автоматически загружаются ✅
  - Проекты без метаданных имеют `metadata: null` ✅

### Documentation
- Roadmap обновлён:
  - Этап 3.5.1 отмечен как завершённый (1 час 10 минут)
  - Этап 3.5.2 отмечен как завершённый (40 минут)
  - Прогресс: ~47/60+ задач (78%)
- CHANGELOG.md обновлён (эта запись)
- Roadmap версия: 2.0 (переписан по принципам документа "1.8 Планирование и Roadmap.md")

### Notes
- **Backend метаданных полностью готов для Frontend** ✅
- `.metadata/` директория создаётся автоматически при первом сохранении
- Метаданные опциональные - проекты без метаданных работают нормально
- JSON файлы метаданных имеют красивое форматирование (indent: 2)
- Следующий этап: Frontend Setup + shadcn/ui

---

## [1.0.0] - 2025-10-21 🚀

### Added
- **REST API полностью реализован** (Этап 3 завершён):
  - `backend/src/routes/projects.js` (160 строк) - GET /api/projects endpoint
  - `backend/src/routes/data.js` (330 строк) - GET /api/project/:id endpoint
  - Интеграция routes в `server.js`
  - Обработка ошибок (400, 404, 500)

- **API endpoints**:
  - `GET /health` - Health check с uptime
  - `GET /api` - API info с описанием всех endpoints
  - `GET /api/projects` - Список всех проектов с метаданными
  - `GET /api/project/:id` - Полные данные проекта (все расчёты)

- **ID normalization**:
  - Функция `normalizeFilenameToId()` в `fileScanner.js`
  - "Vesta 1.6 IM.det" → "vesta-16-im"
  - "BMW M42.det" → "bmw-m42"

- **Configuration caching**:
  - `getConfig()` для синхронного доступа к кэшу
  - `loadConfig()` кэширует результат при запуске сервера
  - Избежание повторных чтений `config.yaml`

- **Automated test suite**:
  - `backend/test-api.sh` (скрипт автоматизированного тестирования)
  - 8 тестов: health, API info, projects list, project details, error handling, performance

- **Полная API документация**:
  - `docs/api.md` (950+ строк)
  - Описание всех endpoints с примерами
  - Request/Response форматы
  - Error handling documentation
  - TypeScript типы
  - Примеры на JavaScript, React, Python, CURL
  - Performance benchmarks
  - Testing guide

### Changed
- `fileScanner.js`:
  - `scanProjects()` теперь возвращает поле `name` (display name)
  - Добавлен экспорт функции `getFileInfo()`
  - Добавлена функция `normalizeFilenameToId()` (export)

- `server.js`:
  - Обновлён endpoint `/api` с детальным описанием
  - Интегрированы `projectsRouter` и `dataRouter`
  - Версия API обновлена до 1.0.0

### Performance
- **GET /api/projects**: ~9ms (2 проекта, 364 KB)
- **GET /api/project/bmw-m42**: ~5ms (30 расчетов, 804 точки данных)
- **GET /api/project/vesta-16-im**: ~6ms (17 расчетов, 443 точки данных)
- Zero external API calls
- Efficient file I/O

### Testing
- ✅ GET /api/projects → Success (2 проекта)
  - BMW M42: 30 расчетов, 229.3 KB
  - Vesta 1.6 IM: 17 расчетов, 126.5 KB
- ✅ GET /api/project/:id → Success для обоих проектов
- ✅ Error handling:
  - 404 для несуществующего проекта
  - 400 для невалидного ID формата
- ✅ Все edge cases протестированы

### Documentation
- Создан `docs/api.md` (950+ строк)
- Roadmap обновлён (Этап 3 отмечен как завершённый)
- Прогресс: 31/40+ задач (77%)

### Notes
- **Backend API полностью готов к использованию** ✅
- Следующий этап: Frontend базовая структура
- Production-ready код
- Comprehensive error handling
- Full TypeScript type definitions

---

## [0.5.0] - 2025-10-21

### Added
- **Сканер .det файлов** (backend/src/services/fileScanner.js - 360 строк):
  - Функция `scanDirectory()` - сканирование директории для поиска .det файлов
  - Функция `scanProjects()` - полное сканирование с парсингом метаданных каждого файла
  - Функция `getFileInfo()` - получение информации о файле (размер, даты создания/изменения)
  - Функция `createFileWatcher()` - отслеживание изменений файлов (добавление, изменение, удаление)
  - Функция `getDirectoryStats()` - статистика по директории (количество файлов, общий размер)
  - Функция `formatFileSize()` - форматирование размера файла в человеко-читаемый вид
  - Интеграция с chokidar для file watching
  - Фильтрация по расширениям файлов
  - Фильтрация по максимальному размеру файла
  - ES Modules (import/export)
  - Полная JSDoc типизация

- **Тестовый скрипт для сканера** (backend/test-scanner.js - 200 строк):
  - Тест сканирования директории
  - Тест статистики директории
  - Тест сканирования проектов с парсингом
  - Тест file watcher
  - Демонстрация API response формата

### Performance
- **Сканирование директории**: 0.34мс для 2 файлов
- **Сканирование + парсинг**: 8.68мс для 2 файлов (включая полный парсинг метаданных)
- **File watcher**: Моментальное обнаружение изменений с debounce 500мс

### Testing
- ✅ Сканер протестирован на 2 реальных .det файлах
- ✅ Найдено и распарсено 2 проекта (BMW M42, Vesta 1.6 IM)
- ✅ File watcher успешно запущен и отслеживает файлы
- ✅ Статистика директории: 355.8 KB общий размер
- ✅ API response format готов для интеграции

### Documentation
- Добавлены JSDoc комментарии для всех функций
- Создан демонстрационный тест скрипт
- Примеры использования в коде

### Notes
- Сканер готов к интеграции с API routes
- Следующий шаг: создать routes/projects.js и routes/data.js
- File watching можно использовать для hot reload проектов

---

## [0.4.0] - 2025-10-21

### Added
- **Парсер .det файлов** (backend/src/services/fileParser.js - 310 строк):
  - Функция `parseMetadata()` - парсинг метаданных из строки 1 (цилиндры, тип двигателя)
  - Функция `parseColumnHeaders()` - парсинг заголовков колонок из строки 2
  - Функция `parseDataLine()` - парсинг одной строки данных с учётом количества цилиндров
  - Функция `parseCalculationMarker()` - извлечение ID и имени расчета из маркера $
  - Функция `parseDetFile()` - главная функция парсинга .det файла
  - Функция `getDetFiles()` - поиск всех .det файлов в директории
  - Функция `parseAllDetFiles()` - парсинг нескольких .det файлов
  - Функция `getProjectSummary()` - краткая информация о проекте для API
  - ES Modules (import/export)
  - Полная JSDoc типизация

- **TypeScript типы для данных двигателя** (backend/src/types/engineData.ts - 120 строк):
  - `EngineMetadata` - метаданные двигателя (numCylinders, engineType)
  - `DataPoint` - одна точка данных (RPM, P-Av, Torque, массивы по цилиндрам)
  - `Calculation` - один расчет (id, name, dataPoints)
  - `EngineProject` - полный проект из .det файла
  - `ProjectsListResponse` - API ответ со списком проектов
  - `ProjectDetailsResponse` - API ответ с детальными данными проекта
  - `DataQueryParams` - параметры фильтрации данных

- **Тестовые скрипты для парсера**:
  - `test-parser.js` (140 строк) - детальное тестирование парсера с статистикой
  - `test-calculation-names.js` (90 строк) - демонстрация названий расчетов для UI
  - `show-results.js` (80 строк) - красивое отображение результатов парсинга

- **Поддержка произвольных названий расчетов**:
  - Символ `$` - технический маркер (добавляется автоматически backend программой)
  - После `$` - произвольный текст, который ввёл пользователь
  - В API используется полный id с `$` (например `$3.1 R 0.86`)
  - В UI отображается name без `$` (например `3.1 R 0.86`)
  - Поддержка пробелов, цифр, спецсимволов в названиях

- **Документация**:
  - DOCUMENTATION_GUIDE.md - полное руководство по ведению документации по SSOT
  - Обновлён CLAUDE.md - добавлено критическое правило изучения официальной документации
  - Примеры правильной и неправильной документации

### Changed
- **Логика парсинга маркеров расчётов `$`**:
  - **Было**: разбивали на id (до первого пробела) и name (остальное)
  - **Стало**: id = весь маркер с `$`, name = без `$` для отображения в UI
  - **Пример**: файл `$3.1 R 0.86` → id: `$3.1 R 0.86`, name: `3.1 R 0.86`
  - **Причина**: пользователь ввёл это название и ожидает увидеть его в UI

- **Обновлён roadmap.md**:
  - Этап 2 (часть 2) отмечен как завершённый
  - Прогресс обновлён: 25/40+ задач (62%)
  - Добавлена детальная секция с результатами создания парсера
  - Обновлён текущий статус: следующее - fileScanner.js

### Fixed
- Корректная обработка названий расчетов с пробелами и спецсимволами
  - Пример: `$14 UpDate`, `$30.4_50 mm`, `$3.1  0.86 _R`
- Правильное извлечение данных из .det файлов:
  - **Учтена служебная первая колонка** (номер строки + символ →)
  - Данные начинаются со ВТОРОЙ колонки
- Обработка файлов с различным количеством цилиндров (автоматическое определение)

### Performance
- **Парсинг Vesta 1.6 IM.det** (462 строки, 4 цилиндра):
  - Время: **6мс**
  - Результат: 17 расчетов, 443 точки данных
  - Диапазон оборотов: 2000-7800 RPM
  - Диапазон мощности: 23.37-137.05 кВт
  - Диапазон крутящего момента: 89.28-191.62 Н·м

- **Парсинг BMW M42.det** (850+ строк, 4 цилиндра):
  - Время: **~10мс**
  - Результат: 30 расчетов, 804 точки данных
  - Примеры названий: `14 UpDate`, `30.4_50 mm`, `20.1`, `31.1`

### Testing
- ✅ Парсер протестирован на 2 реальных .det файлах
- ✅ Все расчеты корректно извлечены (100% success rate)
- ✅ Данные по цилиндрам корректно разбиты на массивы
- ✅ Метаданные правильно извлечены (количество цилиндров, тип двигателя)
- ✅ Произвольные названия расчетов корректно обрабатываются

### Documentation
- Добавлены примеры использования парсера
- Создана демонстрация как будут выглядеть названия в UI
- Документированы все функции с JSDoc комментариями
- Объяснена логика id vs name для расчетов

### Notes
- Парсер готов к использованию в production
- Следующий шаг: fileScanner.js для автоматического сканирования папки
- Прогресс Этапа 2: основная логика парсинга реализована

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
  - ENGINE-VIEWER-V2-SPEC.md

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
**Техническое задание:** [ENGINE-VIEWER-V2-SPEC.md](ENGINE-VIEWER-V2-SPEC.md)

---

**Версия проекта:** 0.1.0 (начальная версия, документация)
**Следующая версия:** 0.2.0 (backend базовая структура + парсер)
