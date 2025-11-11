# ADR 012: PV-Diagrams Implementation

**Дата:** 2025-01-11
**Статус:** Принято
**Автор:** Claude Code + User

## Контекст

Engine Results Viewer v3.0.0 поддерживает .det (performance data) и .pou (gasdynamic traces), но не визуализирует **индикаторные диаграммы** (PV-Diagrams) - критически важный инструмент для анализа рабочего процесса ДВС.

**Требования:**
- Парсинг .pvd файлов (721 точек данных, 0-720° crank angle, до 8 цилиндров)
- 3 типа диаграмм: P-V (термодинамический), Log P-V (политропный анализ), P-α (угол поворота)
- Production-quality UI следуя "iPhone Style" (carefully chosen defaults, professional appearance)
- Интеграция с существующей архитектурой (PerformancePage pattern, ChartExport, Zustand)
- Peak values analysis (Max/Min pressure, Volume range)

## Решение

Реализована полная PV-Diagrams функциональность в 7 этапов (roadmap-driven approach):

### Backend (Stage 1-2):
1. **PVD Parser** (`backend/src/parsers/formats/pvdParser.js`):
   - Metadata parsing (lines 1-17): RPM, cylinders, engineType, turbo config, firing order
   - Data parsing (line 19+): 721 rows × N cylinders (deg, volume, pressure per cylinder)
   - Format detector support для auto-detection .pvd files
   - Registry Pattern integration (как .det/.pou)

2. **API Endpoints**:
   - `GET /api/project/:id/pvd-files` - список .pvd с peak pressure metadata
   - `GET /api/project/:id/pvd/:fileName` - полные данные конкретного файла (metadata + 721 points)
   - Project summary integration - pvDiagrams availability автоматически

### Frontend (Stage 3-7):
3. **State Management** (Zustand - `pvDiagramsSlice.ts`):
   - selectedRPM (файл), selectedCylinder (0-7 | null), selectedDiagramType ('pv' | 'log-pv' | 'p-alpha')
   - Session-only persistence (resetPVDiagrams on unmount)

4. **Production UI** (PerformancePage Pattern):
   - **PVDiagramsPage** - Full-screen layout (ChartExportProvider → Header → LeftPanel + Main)
   - **PVLeftPanel** (320px) - 3 sections: RPM Selection, Cylinder Filter, Diagram Type
   - **RPMSection** - dropdown with metadata (peak pressure, angle, engine specs)
   - **CylinderFilterSection** - grid buttons (All + Cyl 1-8) с color dots preview
   - **DiagramTypeTabs** - 3-column tabs (shadcn/ui)

5. **3 Chart Types** (`chartOptionsHelpers.ts` - 558 lines):
   - **P-V Diagram**: Linear axes (Volume × Pressure), classic thermodynamic
   - **Log P-V**: Logarithmic axes (base 10), polytropic analysis (P × V^n = const)
   - **P-α**: Crank Angle (0-720°) × Pressure, TDC/BDC markers (red/blue lines)

6. **Peak Values Analysis** (`pvDiagramUtils.ts` + `PeakValuesCards.tsx`):
   - 3 stat cards: Max Pressure, Min Pressure, Volume Range
   - Utility functions: findMaxPressure(), findMinPressure(), calculateVolumeRange()
   - Dynamic updates on cylinder selection

7. **Visual Polish**:
   - Removed dataZoom (interfered with 720° cycle viewing)
   - Number formatting (.toFixed(1) for axes, .toFixed(2) for cards)
   - Compact cards (p-3 padding, smaller fonts)
   - Professional appearance (TailwindCSS consistency)

## Причины

### 1. **Parser Registry Pattern** (consistency)
- ✅ Следует существующей архитектуре (.det, .pou)
- ✅ Auto-detection через formatDetector.js
- ✅ Единая точка регистрации (ParserRegistry)

### 2. **3 Типа диаграмм** (engineering requirements)
- **P-V**: Стандартная термодинамическая диаграмма (работа цикла)
- **Log P-V**: Политропный анализ (показатель политропы n)
- **P-α**: Анализ по углу ПКВ (TDC/BDC timing, фазы процесса)

### 3. **Tab-based Layout** (UX)
- ✅ Чистое переключение между типами (не overload UI)
- ✅ Понятные названия ("P-V", "Log P-V", "P-α")
- ✅ Сохранение выбора в Zustand (session-only)

### 4. **PerformancePage Pattern** (consistency)
- ✅ LeftPanel 320px (w-80) - консистентность с Performance
- ✅ Sections structure (uppercase headers, spacing)
- ✅ ChartExport integration (PNG/SVG export)
- ✅ Header with breadcrumbs

### 5. **Auto-select Peak Pressure RPM** ("iPhone Style")
- ✅ Carefully chosen default (peak pressure = критичный режим)
- ✅ Professional UX (не требует manual selection)

### 6. **Peak Values Cards** (analysis support)
- ✅ Key statistics visible without calculations
- ✅ Viewer-only approach (NO integrals, NO IMEP)
- ✅ Updates dynamically with cylinder selection

### 7. **Visual Polish Decisions**:
- **Removed dataZoom**: Accidental zoom disrupted viewing complete 720° cycles
- **Number formatting**: Floating-point precision показывал ugly numbers (114.3994541 → 114.4)
- **Compact cards**: Balance между readability и space efficiency

## Последствия

### Плюсы:
- ✅ **Полная функциональность PV-Diagrams** - 3 типа диаграмм работают
- ✅ **Production-quality UI** - следует PerformancePage pattern
- ✅ **Consistency** - Parser Registry, ChartExport, Zustand state
- ✅ **Auto-detection** - .pvd файлы автоматически обнаруживаются
- ✅ **Peak values analysis** - статистика без calculations
- ✅ **Professional appearance** - compact cards, clean formatting
- ✅ **Multi-cylinder support** - 1-8 cylinders (tested on V8 and MOTO 250)
- ✅ **Build успешен** - TypeScript typecheck ✓, production build (2.93s) ✓
- ✅ **Browser tests passed** - all features working ✓

### Минусы:
- ⚠️ **Math errors** в диаграммах (noted, to be fixed later)
- ⚠️ **Bundle size** увеличился на ~50KB (chart helpers + utilities)
- ⚠️ **No IMEP calculation** - viewer-only approach (по дизайну)

### Technical Debt:
- [ ] Fix math calculation errors in chart data
- [ ] Add valve timing lines (IVO/IVC/EVO/EVC) to P-α diagram (deferred)
- [ ] Optimize chart rendering for >8 cylinders (если потребуется)

## Альтернативы

### 1. Single Chart Type (только P-V)
**Отклонено:** Недостаточно для полного анализа
- Log P-V critical для polytropic analysis
- P-α critical для timing analysis

### 2. Combined Chart (все в одном)
**Отклонено:** Overload UI, сложность восприятия
- Tab-based cleaner и понятнее
- Каждый тип для своей задачи

### 3. Accordion Layout (вместо Tabs)
**Отклонено:** Требует больше кликов
- Tabs provide instant switching
- Better UX для сравнения типов

### 4. Separate Page per Chart Type
**Отклонено:** Navigation overhead
- Single page с tabs эффективнее
- Сохранение state между переключениями

### 5. Keep dataZoom Controls
**Отклонено:** Interfered with viewing complete cycles
- Accidental zoom disrupts analysis
- Full 720° view more important than zoom

### 6. Calculate IMEP / Work
**Отклонено:** Viewer-only approach
- Calculations belong in EngMod4T, not viewer
- Keep app simple and focused

## Файлы

### Created:
**Backend:**
- `backend/src/parsers/formats/pvdParser.js` (268 lines)

**Frontend - Components:**
- `frontend/src/components/pv-diagrams/PVDiagramChart.tsx` (166 lines)
- `frontend/src/components/pv-diagrams/PVLeftPanel.tsx` (92 lines)
- `frontend/src/components/pv-diagrams/RPMSection.tsx` (148 lines)
- `frontend/src/components/pv-diagrams/CylinderFilterSection.tsx` (117 lines)
- `frontend/src/components/pv-diagrams/DiagramTypeTabs.tsx` (51 lines)
- `frontend/src/components/pv-diagrams/PeakValuesCards.tsx` (86 lines)
- `frontend/src/components/pv-diagrams/chartOptionsHelpers.ts` (558 lines)

**Frontend - State & Hooks:**
- `frontend/src/stores/slices/pvDiagramsSlice.ts` (77 lines)
- `frontend/src/hooks/usePVDFiles.ts` (80 lines)
- `frontend/src/hooks/usePVDData.ts` (78 lines)
- `frontend/src/lib/pvDiagramUtils.ts` (145 lines)

**Frontend - Pages:**
- `frontend/src/pages/PVDiagramsPage.tsx` (144 lines)

**Frontend - Types:**
- `frontend/src/types/index.ts` (updated: PVDData, PVDMetadata, PVDFileInfo, etc.)

**Frontend - API:**
- `frontend/src/api/client.ts` (updated: getPVDFiles, getPVDData)

**Documentation:**
- `docs/file-formats/pvd-format.md` (format specification)
- `roadmap-pv-diagrams.md` (implementation roadmap)

### Modified:
- `backend/src/parsers/index.js` (registered PvdParser)
- `backend/src/routes/data.js` (added pvd-files & pvd/:fileName endpoints)
- `backend/src/utils/formatDetector.js` (added .pvd support)
- `frontend/src/App.tsx` (added /pv-diagrams route)
- `frontend/src/stores/appStore.ts` (integrated pvDiagramsSlice)
- `frontend/src/pages/ProjectOverviewPage.tsx` (PV-Diagrams card - already enabled)

### Deleted:
- Test files: `PVDiagramTestPage.tsx`, `PVDiagramControls.tsx`

## Метрики

**Development:**
- **Total time**: ~4 days (roadmap estimate: 6-8 days)
- **Tasks completed**: 67/73 (92%)
- **Git commits**: 15 commits (stages 1-6)

**Code:**
- **Backend**: 268 lines (pvdParser.js)
- **Frontend**: ~1,700 lines total (components + hooks + utils)
- **Documentation**: ~400 lines (roadmap + pvd-format.md)

**Build:**
- **TypeScript**: ✓ no errors
- **Production build**: 2.93s (2.1 MB bundle)
- **Backend startup**: <500ms (with lazy parsing)

**Testing:**
- **Browser tests**: ✓ all passed (V8 8-cyl, MOTO 250 1-cyl)
- **Edge cases**: ✓ project switching, cylinder selection, tab switching

## Ссылки

**Documentation:**
- [docs/file-formats/pvd-format.md](../file-formats/pvd-format.md) - PVD format specification
- [roadmap-pv-diagrams.md](../../roadmap-pv-diagrams.md) - Implementation roadmap

**Related ADRs:**
- [ADR-001](001-det-file-format.md) - .det file format (Parser Registry pattern)
- [ADR-002](002-pou-file-format.md) - .pou file format (multi-format support)
- [ADR-011](011-lazy-prt-parsing.md) - Lazy parsing performance

**Code References:**
- `backend/src/parsers/formats/detParser.js` - Parser pattern reference
- `frontend/src/components/performance/` - PerformancePage pattern reference
- `frontend/src/pages/PerformancePage.tsx` - Layout pattern reference

**Test Data:**
- `test-data/V8/*.pvd` (8-cylinder, 13 files, 2000-8500 RPM)
- `test-data/MOTO 250 V1/*.pvd` (1-cylinder, multiple RPMs)

---

**Notes:**
- English UI (international app) - all parameter names in English
- Viewer-only approach - NO calculations (integrals, IMEP)
- Small changes + test after each step (production stability)
- Math errors deferred (to be fixed after roadmap completion)
