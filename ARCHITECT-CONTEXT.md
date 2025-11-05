# 🤖 AI Architect Context: Engine Results Viewer

**Document Type:** AI-to-AI Context Transfer
**For:** Claude Chat (AI Architect)
**From:** Claude Code (Implementation Agent)
**Purpose:** Enable informed architectural decisions for new features
**GitHub:** Full repository visible to you

---

## 🎯 PROJECT ESSENCE

**What:** Production visualization platform for Internal Combustion Engine (ICE) simulation results from EngMod4T
**Why:** Replace Desktop UI (15+ years: Pascal, Visual Basic) with Modern Web interface - keep proven mathematical core, modernize visualization only
**Philosophy:** "iPhone quality" - minimalism, intuitiveness, smoothness, attention to micro-details
**Context:** Solo developer + AI assistants (you for architecture, Claude Code for implementation)

**Production Tool:**
- Real engineering work: 50+ projects per year
- Real constraints: EngMod4T file formats (.det, .pou, .prt, ~12 more)
- Production quality required (not experimental/training)
- Platform: Windows (production), macOS (development/testing)
- Scale: ~15 file types, 500+ total projects, C:/4Stroke/ data source

---

## 🚨 CRITICAL CONSTRAINTS (NON-NEGOTIABLE)

### 1. .det/.pou File Format - FIRST COLUMN IS SERVICE COLUMN

**Structure:**
```
№	RPM	P-Av	Torque	...
→	об/мин	кВт	Н·м	...
1	1000	45.2	432.1	...
2	1500	67.8	644.3	...
```

**CRITICAL:** First column (№, →, row numbers) MUST be skipped in ALL parsing:
```javascript
// CORRECT - slice(1) mandatory! Use \s+ for multiple spaces
const values = line.trim().split(/\s+/).slice(1);

// WRONG - will break everything
const values = line.trim().split(/\s+/);  // Missing slice(1)!
```

**WHY:** External software adds service column for human readability. Parser must skip it.
**IMPACT:** Forgetting slice(1) shifts all data → wrong parameter values → silent errors
**WHERE:** [docs/file-formats/det-format.md](docs/file-formats/det-format.md)

### 2. Parameter Names NEVER Translated

**RULE:** All parameter names from .det/.pou files ALWAYS remain English

**Original names (do NOT change):**
- `RPM`, `P-Av`, `Torque`, `PCylMax`, `TCylMax`, `TUbMax`, `PurCyl`, `Deto`, `Convergence`

**Applies to:**
- UI (chart titles, legends, axis labels)
- TypeScript types and interfaces
- Component props
- Table headers

**Exception:** Comments and documentation (Russian allowed)

**WHY:** Precision, consistency, professionalism, international recognizability
**IMPACT:** User requirement - non-negotiable

### 3. Complex Calculation Markers

**Formats:**
- Simple: `$1`, `$2`, `$3`
- With dot: `$3.1`, `$9.3`
- Complex: `$3.1 R 0.86`, `$2.1 0.86 _R`, `$5 text text`

**Parser must:** Extract full text after `$` symbol, no assumptions about format

### 4. Array Parameters (Per-Cylinder Data)

**File format:**
```
PurCyl(1)  PurCyl(2)  PurCyl(3)  PurCyl(4)
0.85       0.86       0.87       0.88
```

**Storage format:**
```javascript
{
  PurCyl: [0.85, 0.86, 0.87, 0.88]  // Single array
}
```

**Applies to:** `PCylMax`, `TCylMax`, `TUbMax`, `PurCyl`, `Deto` (all per-cylinder parameters)

### 5. EngMod4T Source Program - Universal Fixed-Width Format

**CRITICAL DISCOVERY:** All ~15 file types (.det, .pou, .prt, traces) come from the SAME source program → SAME format structure.

**Source Program:**
- **Name:** EngMod4T (Thermodynamic 4-stroke ICE simulation)
- **Language:** Delphi (Object Pascal) 7 (80% confidence)
- **Platform:** Windows Desktop
- **Age:** 15+ years (early 2000s)
- **Developer:** CIS engineering community

**Universal File Format (ALL file types):**
- **Type:** Fixed-width ASCII text (**NOT** space-separated CSV, **NOT** tab-separated)
- **Created by:** Delphi `WriteLn(F, Format('%12.2f %12.2f ...', [values]))`
- **Characteristics:**
  - Multiple spaces for column alignment (not single space, not tabs)
  - Right-aligned numbers with space padding
  - First column always service data (skip with `slice(1)`)
  - Line endings: CRLF (Windows style)
- **Encoding:** ASCII for numbers, Windows-1251 for Cyrillic metadata

**Parsing Strategy (Universal for ALL file types):**
```javascript
// ✅ CORRECT for ALL EngMod4T files
const columns = line.trim().split(/\s+/);      // Multiple spaces
const dataColumns = columns.slice(1);          // Skip first (service) column
const values = dataColumns.map(parseFloat);

// ❌ WRONG approaches
const values = line.split(',');      // NO! Not CSV
const values = line.split(/\t+/);    // NO! Not tabs (though may work accidentally)
const values = line.split(' ');      // NO! Multiple spaces, not single
```

**WHY This Matters:**
- Future parsers (.prt, trace files) will use SAME format
- Single Source of Truth: [docs/engmod4t-suite/engmod4t-overview.md](docs/engmod4t-suite/engmod4t-overview.md)
- All parsing logic should follow universal pattern
- No need to guess format for new file types - it's always fixed-width ASCII

**Evidence:**
1. All existing files (.det, .pou) use identical structure
2. Delphi `Format()` produces fixed-width output by design
3. Same program creates all file types → same format approach

**IMPACT:** When adding new parsers, ALWAYS refer to [EngMod4T Overview](docs/engmod4t-suite/engmod4t-overview.md) first - the format is already documented.

---

## 🏗️ ARCHITECTURE

### High-Level Flow

```
User Browser (React 18 + ECharts)
    ↕ HTTP/REST
Backend (Node.js + Express)
    ↕ File System
Test Data (.det, .pou files)
```

### Data Flow Example

```
User opens /project/:id
    ↓
ProjectPage.tsx → useProjectData(id)
    ↓
GET /api/project/:id
    ↓
Backend: routes/data.js → parseEngineFile(filePath)
    ↓
ParserRegistry.getParser(extension) → detParser/pouParser
    ↓
Parser: read file → skip column 1 → parse metadata/headers/calculations
    ↓
Returns: ProjectData { metadata, calculations[] }
    ↓
Frontend: Zustand store → ChartPreset components → ECharts render
```

### Parser Registry Pattern (ADR 002)

**Problem:** Need to support 5+ file formats, easy extensibility required
**Solution:** Registry pattern with auto-detection

**Structure:**
```
parsers/
├── index.js              # parseEngineFile() - unified API
├── ParserRegistry.js     # Registry pattern implementation
├── common/               # Shared utilities
└── formats/              # Format-specific parsers
    ├── detParser.js      # 24 parameters
    └── pouParser.js      # 71 parameters
```

**Adding new format:** 3 steps
1. Create parser in `formats/` (implement parseFile interface)
2. Register in `ParserRegistry.js`
3. Done - auto-detection works

**WHY Registry:** Scalability, separation of concerns, testability
**WHERE:** [docs/parsers-guide.md](docs/parsers-guide.md)

### File Format Support

| Format | Parameters | Status |
|--------|-----------|--------|
| `.det` | 24 | ✅ Production |
| `.pou` | 71 | ✅ Production |
| `.pou-merged` | 75 (71 from .pou + 4 critical from .det) | ✅ Production |

**Merge Strategy:**
- Priority: `pou-merged` > `pou` > `det`
- Adds critical parameters: `TCylMax`, `PCylMax`, `Deto`, `Convergence`
- Deduplication in fileScanner.js
- **WHERE:** `backend/src/services/fileMerger.js`

---

## 📋 KEY ARCHITECTURAL DECISIONS (ADRs)

### ADR 001: .det File Parsing Strategy

**Context:** Complex file format with service columns, array parameters, variable markers
**Decision:** Custom parser with 3-phase approach
1. `parseMetadata()` - Extract engine specs from line 1
2. `parseColumnHeaders()` - Parse 24 parameters from line 2
3. `parseCalculations()` - Parse calculation blocks (marker + data rows)

**Key Insight:** slice(1) on every line to skip service column
**Tested:** 2 real files (17 and 30 calculations)
**WHERE:** [docs/decisions/001-det-file-parsing.md](docs/decisions/001-det-file-parsing.md)

### ADR 002: Multi-Format Support Architecture

**Context:** Need .pou (71 params) + future formats
**Decision:** Parser Registry pattern with auto-detection
**Rationale:**
- Scalability: Add format = 3 lines of code
- Separation of concerns: Each parser independent
- Type safety: Union types `format: 'det' | 'pou' | 'pou-merged'`

**Auto-detection:** By extension + metadata field count
**WHERE:** [docs/decisions/002-multi-format-support.md](docs/decisions/002-multi-format-support.md)

---

## 🛠️ TECH STACK

### Backend
- **Node.js + Express** - JavaScript everywhere, simple REST API
- **js-yaml** - Config parsing
- **chokidar** - File watching (future: live reload)

### Frontend
- **React 18** (NOTE: React 19 in package.json - modern features)
- **TypeScript ~5.9** - Strict mode, type safety
- **Vite ^7.1** - Ultra-fast HMR
- **ECharts ^5.6** - Interactive charts (zoom, pan, tooltips)
- **echarts-for-react ^3.0** - React integration
- **TailwindCSS ^4.1** (NOTE: Tailwind 4 - new features)
- **Radix UI** - Accessible components (WCAG 2.1 AA)
- **Zustand ^5.0** - Lightweight state management
- **Tanstack Table ^8.21** - Data tables with sorting/filtering
- **Axios** - HTTP client

### Shared
- **shared-types.ts** - SSOT for TypeScript types (backend + frontend)
- **config.yaml** - Application configuration

---

## 📊 STATE MANAGEMENT (Zustand)

### Core Structure

```typescript
interface AppState {
  // Visualization state
  primaryCalculation: CalculationReference | null;
  comparisonCalculations: CalculationReference[];  // Max 4

  // Settings
  units: 'si' | 'american' | 'hp';
  theme: 'light' | 'dark';
  selectedPreset: 1 | 2 | 3 | 4 | 5 | 6;

  // UI state
  isSettingsOpen: boolean;
  isPrimaryModalOpen: boolean;
  // ...
}
```

### CalculationReference Pattern

**WHY:** Cross-project comparison requires tracking project + calculation + metadata

```typescript
interface CalculationReference {
  projectId: string;          // Which project
  projectName: string;        // For display
  calculationId: string;      // Which calculation (marker)
  calculationName: string;    // For display
  color: string;              // From CALCULATION_COLORS palette
  metadata: {
    rpmRange: [number, number];  // [min, max]
    avgStep: number;             // RPM step (not point count!)
    // ...
  }
}
```

**Usage:** 1 primary + 4 comparisons = 5 simultaneous calculations max

---

## 🎨 DESIGN SYSTEM

### Color Palette (5 colors)

```javascript
const CALCULATION_COLORS = [
  '#ff6b6b',  // Red (always primary)
  '#4ecdc4',  // Cyan
  '#45b7d1',  // Blue
  '#f9ca24',  // Yellow
  '#a29bfe',  // Purple
];
```

**Assignment:** Primary gets first color, comparisons cycle through remaining

### "iPhone Quality" Principles

1. **Minimalism** - Remove everything non-critical, lots of whitespace
2. **Intuitiveness** - No manual needed, obvious actions, clear icons
3. **Smoothness** - All transitions animated (300-500ms), no jumps
4. **Clarity** - Clear empty states, beautiful errors, informative tooltips
5. **Details Matter** - Micro-interactions, hover states, focus indicators

**Non-negotiable:** Accessibility (WCAG 2.1 AA), responsive design, animations

---

## 📈 CURRENT STATE (v2.0.0)

### Implemented Features ✅

**Core:**
- Multi-format support (.det, .pou, pou-merged)
- Cross-project calculation comparison (1 primary + 4 comparisons)
- 6 chart presets:
  1. Power & Torque
  2. Cylinder Pressure (PCylMax + TCylMax per cylinder)
  3. Temperature (TCylMax + TUbMax)
  4. Custom (user-selectable parameters)
  5. MEP (Mean Effective Pressure)
  6. Efficiency (Seff, Teff, Ceff with interactive legend)
- Peak values cards (always visible, no hover)
- RPM step display (instead of point count)
- Units conversion (SI/American/HP) with live chart updates
- Settings popover (theme, animation, grid, decimals)
- Data table with export (CSV/Excel)

**Architecture:**
- Backend: Express routes → services (fileScanner, parsers, fileMerger, metadataService)
- Frontend: Pages → Components → Hooks → API client
- TypeScript: Strict mode, shared-types.ts sync
- State: Zustand with CalculationReference

**Recent Fixes (Nov 2025):**
- CRITICAL: Fixed .det + .pou merge losing parameters
- Fixed TypeError in chart presets with optional parameters
- Fixed DataTable supporting all 6 presets
- Fixed decimals hardcoded bug in PeakValuesCards

### Next Steps 🚧

**From CHANGELOG [Unreleased]:**
- Preset 5 (MEP) - needs testing
- Preset 6 (Efficiency) - polish interactive legend
- UI translations refinement
- Performance testing with large files
- More comprehensive error handling

**Future Roadmap:**
- Additional file formats (5+ planned)
- Enhanced export capabilities
- Performance optimizations
- More chart customization

---

## 📚 DOCUMENTATION MAP (SSOT Principle)

### Single Source of Truth

**Each piece of information lives in ONE place. Others link to it.**

| Document | Purpose | Update When |
|----------|---------|-------------|
| [README.md](README.md) | Entry point, quick start | Major changes |
| [ARCHITECT-CONTEXT.md](ARCHITECT-CONTEXT.md) | Context for Claude Chat (architect mode) | Major architectural decisions |
| [CHANGELOG.md](CHANGELOG.md) | Version history | After significant changes |
| [docs/architecture.md](docs/architecture.md) | System architecture, patterns, algorithms | Architecture/implementation changes |
| [docs/chart-presets.md](docs/chart-presets.md) | Chart presets documentation | Chart implementation changes |
| [docs/file-formats/*.md](docs/file-formats/) | File format specs | Format additions |
| [docs/decisions/*.md](docs/decisions/) | ADRs (WHY decisions) | Important decisions |
| [docs/api.md](docs/api.md) | API documentation | API changes |
| [docs/parsers-guide.md](docs/parsers-guide.md) | Add new parser guide | Parser pattern changes |

### When You Need...

- **Project overview** → [README.md](README.md)
- **Current status** → [CHANGELOG.md](CHANGELOG.md) (v2.0.0 complete)
- **What changed** → [CHANGELOG.md](CHANGELOG.md)
- **How it works** → [docs/architecture.md](docs/architecture.md)
- **Chart presets details** → [docs/chart-presets.md](docs/chart-presets.md)
- **File format details** → [docs/file-formats/](docs/file-formats/)
- **WHY we did it** → [docs/decisions/](docs/decisions/)
- **Add new format** → [docs/parsers-guide.md](docs/parsers-guide.md)
- **All 73 parameters** → [docs/PARAMETERS-REFERENCE.md](docs/PARAMETERS-REFERENCE.md)

### Key Code Files

**Backend:**
- `backend/src/server.js` - Express entry point
- `backend/src/parsers/index.js` - Unified parsing API
- `backend/src/parsers/ParserRegistry.js` - Registry implementation
- `backend/src/services/fileMerger.js` - .det + .pou merge
- `backend/src/services/fileScanner.js` - File discovery

**Frontend:**
- `frontend/src/App.tsx` - React Router
- `frontend/src/pages/ProjectPage.tsx` - Main visualization
- `frontend/src/store/useStore.ts` - Zustand state
- `frontend/src/components/visualization/ChartPreset*.tsx` - 6 presets
- `frontend/src/utils/chartConfig.ts` - ECharts base config

**Shared:**
- `shared-types.ts` - TypeScript types SSOT
- `config.yaml` - App configuration

---

## 🎯 WORKING RULES (Critical for Collaboration)

### Rule #1: Honest Technical Assessment

**Principle:** Technical accuracy > politeness

**FORBIDDEN:**
- Saying "great idea" if idea is bad
- Agreeing with suboptimal solutions
- Praising for politeness

**REQUIRED:**
- Honest technical evaluation of every proposal
- Alternative solutions if suggested one is bad
- Explanation of WHY (not just HOW)
- Reasoned disagreement when necessary

**When disagreement is MANDATORY:**
- Security issues (XSS, SQL injection, etc.)
- Performance problems (memory leaks, O(n²) vs O(n))
- Architecture violations (SOLID, DRY)
- Best practices violations (anti-patterns)
- Maintenance issues (unmaintainable code)

### Rule #2: Always Start with Official Documentation

**Problem:** AI can loop trying solutions from memory → errors + time waste

**Solution:** FIRST ACTION before implementing anything:
1. Study official documentation (use WebFetch)
2. Find examples from official sources
3. Apply proven solutions

**Examples when MANDATORY:**
- Tool configuration (Vite, TypeScript, ECharts)
- Library usage (React hooks, Zustand patterns)
- API integration (Express middleware, React Router)
- Error resolution (error message → docs → solution)

**WHY:** API and best practices change between versions. Memory may be outdated.

### Rule #3: Never Translate Parameter Names

Already covered in CRITICAL CONSTRAINTS section. **Non-negotiable.**

### Rule #4: Task Management and Roadmaps (v2.0 Workflow)

**v2.0.0 complete ✅ - New workflow for future features:**

**New feature development cycle:**
1. User discusses feature with Claude Chat (architect mode)
2. Claude Chat creates technical specification
3. Claude Chat creates feature-specific roadmap
4. Claude Code (implementation agent) receives roadmap
5. Claude Code executes tasks sequentially
6. Mark `[X]` for completed tasks in roadmap
7. Roadmap archived when feature complete

**Task execution principles:**
- Concrete tasks (1-3 hours scope)
- Work sequentially through roadmap
- Update documentation after significant changes
- Update [CHANGELOG.md](CHANGELOG.md) for user-facing changes

**Note:** Old roadmaps (v1.0, v2.0) have been archived/removed. New features will have dedicated roadmaps created through Claude Chat collaboration.

---

## 🧠 ADRs - WHY They're Critical

### Problem
- Developer = User + AI assistants
- AI is stateless → forgets context between sessions
- "Why did we make this decision?" → lost 3 months later

### Solution
**ADRs (Architecture Decision Records)** preserve the WHY

**Template:**
1. **Context** - What problem we faced
2. **Decision** - What we chose
3. **Rationale** - WHY this solution
4. **Consequences** - Trade-offs
5. **Alternatives** - What we rejected and WHY

**When to create ADR:**
- Security decisions
- Architecture changes
- File format additions
- Major refactorings
- Performance optimizations
- Technology choices

**WHERE:** [docs/decisions/](docs/decisions/)

**Examples:**
- [001-det-file-parsing.md](docs/decisions/001-det-file-parsing.md) - WHY slice(1) everywhere
- [002-multi-format-support.md](docs/decisions/002-multi-format-support.md) - WHY Registry pattern

---

## 🖥️ PLATFORM & DEPLOYMENT

### Development Environment
- **Platform:** macOS (for development and testing)
- **Test Data:** `test-data/` directory (3 sample projects)
- **Purpose:** Safe environment for implementing new features
- **Tools:** VS Code + Claude Code, Node.js 18+, Chrome/Safari

### Production Environment
- **Platform:** Windows (primary deployment target)
- **Data Source:** `C:/4Stroke/` (fixed path on all production machines)
- **Scale:** 50+ projects per year, 500+ total projects over time
- **Structure:** Each project = folder with ~15 different file types

### File Formats Roadmap

**Implemented (2/~15):**
- ✅ `.det` - Performance data (24 parameters)
- ✅ `.pou` - Extended performance (71 parameters)
- ✅ `.pou-merged` - Combined format (75 parameters: 71 from .pou + 4 critical from .det)

**Next Priority:**
- 🎯 `.prt` - Engine metadata (cylinders, bore, stroke, type, combustion model, etc.)
  - **Purpose:** Auto-populate project cards on main page
  - **Critical:** Enables smart UI for 50+ projects (filters, search, tags by engine type/specs)
  - **Impact:** Foundation for scalable project management

**Remaining (~12 types):**
- Thermo- and Gasdynamic Traces (from EngMod4T Post4t export)
  - Pressure Traces (.cbt, .pde, etc.)
  - Temperature Traces
  - Combustion Traces
  - Efficiency Traces
  - Mass Flow Traces
  - Wave Traces
  - Mach Indexes
  - Purity Traces
- PV-Diagrams
- Turbo/Supercharger Map Plot
- Create Measured Trace Curve File
- Create Measured Power Curve File

### Cross-Platform Strategy

**Path Handling:**
- Use Node.js `path` module for platform independence
- Support both: macOS `/path/to/data` and Windows `C:/4Stroke/`
- Config option: `dataPath` adaptable per environment

**Testing:**
- Develop on macOS → Deploy on Windows
- `test-data/` mirrors `C:/4Stroke/` structure
- Same code runs on both platforms (Node.js cross-platform)

**Data Sync:**
- Development: `test-data/` (version controlled, 3 sample projects)
- Production: `C:/4Stroke/` (real user data, not version controlled)
- Parser logic identical for both sources

---

## 🚀 PROJECT VISION & DIRECTION

### Ultimate Goal
Replace Desktop UI in **EngMod4T** (15+ years: Pascal, Visual Basic) with **Modern Web Interface**

**Core Principle:**
- **Keep:** Proven mathematical core (15 years of calculations - don't touch!)
- **Replace:** Desktop visualization → Modern Web UI (React + ECharts)
- **Outcome:** Same calculations, better user experience

**Why Web UI:**
- Cross-platform (Windows, macOS, potentially cloud)
- Modern UX patterns ("iPhone quality")
- Easier maintenance than Desktop frameworks
- Extensible for future features

### Short-Term (Next Phases)
1. **Parse .prt files** (engine metadata)
   - Auto-populate project cards (cylinders, bore, stroke, type)
   - Foundation for smart project management

2. **Redesign main page UI** for 50+ projects
   - Filters by engine type, cylinders, client
   - Search by project name
   - Pagination/virtual scroll
   - Sort by date, name, specs

3. **Thermo- and Gasdynamic Traces** visualization
   - Parse remaining ~12 file types
   - Pressure/Temperature/Combustion traces
   - PV-Diagrams, Turbo maps
   - Match EngMod4T Post4t functionality

### Mid-Term (Production Deployment)
- **Complete all ~15 file format parsers**
- **Optimize for scale:** 500+ projects, large datasets
- **Performance testing** with real production data
- **Windows deployment** (primary platform)
- **Enhanced export:** PDF reports, custom templates
- **User settings:** Preferences, favorites, recent projects

### Long-Term Vision
- **Feature parity** with EngMod4T Desktop UI
- **Beyond parity:** Features impossible in Desktop
  - Real-time collaborative analysis
  - Cloud storage and sync
  - Web-based sharing (links to specific calculations)
  - Mobile viewing (responsive design already done)
- **Potential:** Full EngMod4T → Web transition
  - Keep Pascal/VB calculation engine as backend service
  - Modern Web UI for input, visualization, analysis
  - Best of both worlds

---

## 🔧 PERFORMANCE CONSIDERATIONS

### Current Constraints
- Files up to 10MB
- 10-100 projects supported
- All data in memory (no database)
- Single-threaded parsing

### Future Scaling Plans
- **Database:** SQLite (dev) → PostgreSQL (prod)
- **Caching:** Redis for frequently accessed data
- **Queue:** Bull for large file processing
- **Streaming:** Stream large files instead of loading fully

---

## 💡 PATTERNS & CONVENTIONS

### Component Architecture

**Pattern:** Container/Presentation separation

- **Pages** (containers) - Data fetching, state management, composition
- **Components** (presentation) - Pure UI, props-driven, reusable
- **Hooks** (logic) - Custom hooks for state and side effects
- **Utils** (helpers) - Pure functions for data transformation

### Performance Optimizations

```typescript
// useMemo for expensive calculations
const chartOption = useMemo((): EChartsOption => {
  // Build option based on selectedCalculations
}, [selectedCalculations]);

// useCallback for event handlers
const handleCalculationSelect = useCallback((calc: CalculationReference) => {
  // Handle selection
}, []);

// Memoized filtered data
const filteredCalculations = useMemo(() => {
  return calculations.filter(/* ... */);
}, [calculations]);
```

### ECharts Integration

**Pattern:** Memoized chartOption + ReactECharts wrapper

```typescript
<ReactECharts
  option={chartOption}
  style={{ height: '600px' }}
  opts={{ renderer: 'canvas' }}
/>
```

**WHY canvas over SVG:** Better performance for many data points

---

## 🎓 KEY INSIGHTS FOR ARCHITECTURAL DECISIONS

### 1. Real Project, Not a Demo
- Real user (experienced engineer)
- Real use case (engine simulation analysis)
- Real constraints (external software formats)
- Production quality expected

### 2. Production Tool with High Standards
- Goal: Replace 15+ years Desktop UI with Modern Web
- Focus: Quality and reliability (real engineering work)
- Proven patterns welcomed: React 18 best practices, ECharts optimizations
- "iPhone quality" is the standard (professional tool, not prototype)

### 3. Solo Developer + AI Context
- No team, no code review
- ADRs replace "ask teammates why"
- Documentation is future-proofing
- Stateless AI sessions → excellent docs critical

### 4. Scalability Built-In
- Parser Registry for 5+ formats
- Cross-project comparison architecture
- Modular component structure
- Type-safe data flow (shared-types.ts)

### 5. User Experience Non-Negotiable
- "iPhone quality" is a requirement, not suggestion
- Animations, transitions, micro-interactions matter
- Accessibility (WCAG 2.1 AA) mandatory
- Responsive design for all screens

---

## 📝 WHAT THIS DOCUMENT DOES NOT INCLUDE

**Intentionally omitted** (available in GitHub repo):
- Code listings
- Complete file structure
- Detailed implementation
- API request/response examples
- Step-by-step tutorials

**Focus:** WHY decisions made, WHERE to find details, HOW to think architecturally, WHAT constraints are critical

---

## ✅ QUICK CHECKLIST: Before Proposing New Feature

1. **Constraints checked:**
   - [ ] Does it involve parameter names? → Must stay English
   - [ ] Does it involve .det/.pou parsing? → Remember slice(1)
   - [ ] Does it add new file format? → Follow parsers-guide.md

2. **Architecture alignment:**
   - [ ] Fits Parser Registry pattern (if file format)
   - [ ] Uses CalculationReference for cross-project features
   - [ ] Follows component architecture (container/presentation)
   - [ ] Type-safe (update shared-types.ts)

3. **Quality standards:**
   - [ ] "iPhone quality" design
   - [ ] Accessibility considered (WCAG 2.1 AA)
   - [ ] Responsive design
   - [ ] Animations/transitions planned (300-500ms)

4. **Documentation plan:**
   - [ ] Which docs to update? (CHANGELOG, architecture, chart-presets, ADR?)
   - [ ] Need new ADR? (if important decision)
   - [ ] SSOT principle followed?

5. **Tech stack compatibility:**
   - [ ] React 18 patterns
   - [ ] TypeScript strict mode compatible
   - [ ] ECharts 5.6 capabilities
   - [ ] Zustand state management

---

## 🤝 COLLABORATION MODEL

**Your Role (Claude Chat - AI Architect):**
- Global vision
- Feature brainstorming with user
- Architectural decisions
- Technical specifications for implementation
- Strategic direction

**Claude Code's Role (Implementation Agent):**
- Knows codebase in detail
- Implements specific tasks (1-3 hours iterations)
- Adapts architectural vision to existing code
- Updates documentation (CHANGELOG, architecture, ADRs)
- Works from feature-specific roadmaps (created by Claude Chat)

**Workflow:**
```
User + You (Claude Chat)
    ↓ Ideas, brainstorming, architectural design
Technical Specification / Recommendation
    ↓ Adapted to codebase reality
User + Claude Code
    ↓ Implementation in small iterations
Working Feature
```

**Why this model:**
- You focus on WHAT and WHY (big picture)
- Claude Code focuses on HOW (implementation details)
- Avoids context window bloat
- Prevents breaking existing code
- Maintains global coherence

---

## 🎯 SUMMARY

**Engine Results Viewer** = Production visualization tool for EngMod4T simulation results

**Purpose:** Replace Desktop UI (15+ years: Pascal/Visual Basic) → Modern Web interface (React + ECharts)
**Principle:** Keep proven mathematical core, modernize visualization only

**Key Success Factors:**
1. ⚠️ **First column always skipped** in .det/.pou parsing
2. ⚠️ **Parameter names never translated** (always English)
3. 📝 **ADRs document WHY** (preserve context)
4. 📚 **Official docs consulted** before implementing
5. 💎 **"iPhone quality"** is non-negotiable standard
6. 📋 **Documentation updated** after significant changes

**For New Features:**
- Study relevant ADRs for context
- Review architecture.md for established patterns
- Follow parsers-guide.md if adding file format support
- Check chart-presets.md for chart implementation patterns
- Create ADR for significant architectural decisions
- Update all affected documentation (CHANGELOG, architecture, ADRs)

**Critical Files to Review:**
- [CLAUDE.md](CLAUDE.md) - Working rules for Claude Code (implementation agent)
- [CHANGELOG.md](CHANGELOG.md) - Current version status (v2.0.0 complete)
- [docs/architecture.md](docs/architecture.md) - System architecture, patterns, algorithms
- [docs/engmod4t-suite/README.md](docs/engmod4t-suite/README.md) - 📚 EngMod4T Suite documentation (DAT4T, EngMod4T, Post4T) - AI-friendly overview of the old programs
- [docs/chart-presets.md](docs/chart-presets.md) - Chart implementation details
- [docs/decisions/](docs/decisions/) - Past architectural decisions (WHY)
- [docs/PARAMETERS-REFERENCE.md](docs/PARAMETERS-REFERENCE.md) - All 73 parameters documented

---

**Document Purpose:** Enable AI architect (Claude Chat) to make informed decisions about global vision and new features by understanding project essence, constraints, architecture, and decision-making context - without duplicating information available in GitHub repository.

**Last Updated:** November 2025
**Version:** 2.0.0
**Maintained By:** Claude Code → Updated with significant architectural changes
