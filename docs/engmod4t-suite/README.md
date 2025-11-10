# 🤖 EngMod4T Suite: AI-Friendly Overview

**Document Type:** AI Context Documentation
**For:** Claude Chat, Claude Code, AI Agents
**Purpose:** Quick understanding of EngMod4T Suite ecosystem
**Last Updated:** November 5, 2025

---

## 🎯 WHAT IS ENGMOD4T SUITE?

**EngMod4T Suite** is a complete ecosystem for Internal Combustion Engine (ICE) simulation and analysis, consisting of three desktop Windows programs developed over 15+ years.

**Core Purpose:** Enable engineers to design, simulate, and analyze 4-stroke gasoline engines through:
1. **Pre-processing** - Configure engine parameters (DAT4T)
2. **Simulation** - Run thermodynamic calculations (EngMod4T)
3. **Post-processing** - Visualize and analyze results (Post4T → Engine Results Viewer)

**Platform:**
- Windows Desktop applications (Delphi 7 / Pascal)
- Fixed-width ASCII file format (consistent across all file types)
- Production tool (15+ years, actively used)
- ~50 projects per year, 500+ total projects

**Current Evolution:**
- ✅ DAT4T - Still in use (pre-processor)
- ✅ EngMod4T - Still in use (simulation engine)
- ⚠️ Post4T - **BEING REPLACED** by Engine Results Viewer (modern web UI)

---

## 🏗️ THREE-PROGRAM ARCHITECTURE

### 1️⃣ DAT4T (Pre-processor)

**Purpose:** Configure engine parameters before simulation

**Inputs:**
- Empty project template
- Existing .prt file (project configuration)

**Outputs:**
- `.prt` file (complete engine configuration)

**Key Features:**
- Engine Data (cylinders, bore, stroke, compression ratio, type)
- Turbocharger/Supercharger setup
- Ports, Valves, Lift Profiles (VVT, VTEC support)
- Exhaust Subsystem design (60+ manifold configurations!)
- Intake Subsystem design (40+ manifold configurations!)
- Combustion & Ignition models (Vibe, Wiebe, etc.)
- Temperature & Atmospheric conditions

**Documentation:** [dat4t-overview.md](dat4t-overview.md)
**Detailed Reference:** [_personal/Dat4THelp-chapters/](../../_personal/Dat4THelp-chapters/) (11 chapters, 35 MB with images)

---

### 2️⃣ EngMod4T (Simulation Engine)

**Developer:** Neels van Niekerk (Vannik Racing Developments)
**Based on:** Professor Gordon P Blair's work (Queens University Belfast)

**Purpose:** Run 1D gasdynamic thermodynamic simulation

**Inputs:**
- `.prt` file from DAT4T

**Processing:**
- 1D gasdynamic modeling (Method of Characteristics)
- Thermodynamic calculations
- Combustion models (Vibe, Wiebe, etc.)
- Turbo/Supercharger integration
- Wave dynamics in intake/exhaust
- Heat transfer calculations

**Outputs:**
- `.det` file (24 parameters: RPM, P-Av, Torque, PCylMax, etc.)
- `.pou` file - Batch Mode (71-78 parameters: IMEP, BMEP, BSFC, combustion efficiency, turbo/super data, etc.)
- `.spo` file - Screen Mode (single RPM point, same parameters as .pou)
- ~9 trace file types (Pressure, Temperature, Mach, Mass Flow, Wave, Combustion, etc.)

**File Format:** Universal fixed-width ASCII (Delphi 7 `Format()` function)

**Documentation:** [engmod4t-overview.md](engmod4t-overview.md)
**Detailed Reference:** [_personal/EngMod4THelp-chapters/](../../_personal/EngMod4THelp-chapters/) (31 chapters, 2 MB with images)

---

### 3️⃣ Post4T (OLD Post-processor) → Engine Results Viewer (NEW)

**Purpose:** Visualize and analyze simulation results

**Inputs:**
- `.det` file (performance data)
- `.pou` file (extended performance)
- Trace files (detailed cycle data)

**What Post4T Did (Desktop UI):**
- Thermo & Gasdynamic Traces (9 types)
- Performance & Efficiency Plots
- PV-Diagrams
- Detonation Analysis
- Turbocharger Post-processing
- Noise Level Analysis

**Why Replacement Needed:**
- ❌ Outdated Desktop UI (Windows-only, limited UX)
- ❌ No cross-project comparison
- ❌ Limited export capabilities
- ❌ Difficult to extend with new features

**What Engine Results Viewer Adds:**
- ✅ Modern React Web UI ("iPhone quality" design)
- ✅ Cross-project calculation comparison (1 primary + 4 comparisons)
- ✅ Units conversion (SI / American / HP)
- ✅ Multiple export formats (CSV, Excel, PNG, SVG)
- ✅ Multi-format support (.det, .pou, .pou-merged with 74-81 params)
- ✅ 6 chart presets (Power/Torque, Pressure, Temperature, MEP, Efficiency, Custom)
- ✅ Accessibility (WCAG 2.1 AA), responsive design
- ✅ Cross-platform (macOS development, Windows production)

**Documentation:**
- Post4T: [post4t-overview.md](post4t-overview.md)
- Post4T Detailed: [_personal/Post4THelp-chapters/](../../_personal/Post4THelp-chapters/) (23 chapters, 7 MB with images)
- Engine Results Viewer: [../../ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md)

---

## 🔄 DATA FLOW DIAGRAM

### Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  User: Design Engine                                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  DAT4T (Pre-processor)                                       │
│  ─────────────────────                                       │
│  • Configure cylinders, bore, stroke, compression           │
│  • Design intake manifold (40+ configurations)              │
│  • Design exhaust manifold (60+ configurations)             │
│  • Set up turbo/supercharger                                │
│  • Configure valves, lift profiles (VVT, VTEC)              │
│  • Select combustion model (Vibe, Wiebe)                    │
│  • Set atmospheric conditions                               │
│                                                              │
│  OUTPUT: ProjectName.prt (engine configuration)             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  EngMod4T (Simulation Engine)                                │
│  ────────────────────────────                                │
│  INPUT: ProjectName.prt                                      │
│                                                              │
│  • Run 1D gasdynamic simulation                             │
│  • Calculate thermodynamic cycles                           │
│  • Model combustion (cylinder-by-cylinder)                  │
│  • Simulate turbo/supercharger behavior                     │
│  • Calculate wave dynamics (intake/exhaust)                 │
│  • Compute heat transfer                                    │
│                                                              │
│  OUTPUTS:                                                    │
│  • ProjectName.det (24 performance parameters)              │
│  • ProjectName.pou (71-78 parameters, depends on engine type) │
│  • ProjectName_*.trace (12+ trace file types)               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Post4T (OLD) or Engine Results Viewer (NEW)                 │
│  ────────────────────────────────────────────               │
│  INPUTS: .det, .pou, trace files                            │
│                                                              │
│  • Visualize performance charts                             │
│  • Display thermo & gasdynamic traces                       │
│  • Analyze PV-diagrams                                      │
│  • Compare calculations (cross-project)                     │
│  • Export data (CSV, Excel, PNG, SVG)                       │
│  • Generate reports                                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  User: Analyze Results → Iterate Design                     │
└─────────────────────────────────────────────────────────────┘
```

### File Ownership (Read-Only Contracts)

```
DAT4T               EngMod4T            Post4T / Engine Viewer
  |                    |                         |
  |-- .prt ----------->|                         |
  |  (CREATES)         |  (READS ONLY)           |
  |                    |                         |
  |                    |-- .det --------------->  |
  |                    |  (CREATES)     (READS ONLY)
  |                    |                         |
  |                    |-- .pou --------------->  |
  |                    |  (CREATES)     (READS ONLY)
  |                    |                         |
  |                    |-- traces* ------------>  |
  |                       (CREATES)     (READS ONLY)
```

**Key Constraint:** Visualizer (Post4T / Engine Viewer) **CANNOT modify** .prt, .det, .pou files - they are **READ-ONLY** data sources.

---

## 📁 FILE FORMATS OVERVIEW

### Universal Format Pattern (ALL Files)

**CRITICAL:** All ~15 file types created by EngMod4T share the SAME format structure:

```
Type: Fixed-width ASCII text (NOT CSV, NOT tab-separated)
Created by: Delphi 7 Format() function
Characteristics:
  - Multiple spaces for column alignment (not single space!)
  - Right-aligned numbers with space padding
  - First column = service data (row numbers, markers) → MUST be skipped
  - Line endings: CRLF (Windows)
  - Encoding: ASCII (numbers), Windows-1251 (Cyrillic metadata)
```

**Parsing Pattern (Universal):**
```javascript
// ✅ CORRECT for ALL EngMod4T files
const columns = line.trim().split(/\s+/);      // Multiple spaces
const dataColumns = columns.slice(1);          // Skip first (service) column
const values = dataColumns.map(parseFloat);

// ❌ WRONG approaches
line.split(',');      // NO! Not CSV
line.split(/\t+/);    // NO! Not tabs
line.split(' ');      // NO! Multiple spaces, not single
```

**WHY This Matters:** When adding support for new file types (.prt, traces), the parsing strategy is ALREADY known - it's always fixed-width ASCII with service column.

### File Types by Category

#### Configuration Files
- **`.prt`** - Project configuration (created by DAT4T)
  - Engine specs (cylinders, bore, stroke, type)
  - Intake/exhaust manifold configurations
  - Turbo/supercharger setup
  - Combustion model settings
  - **Status:** Future parsing target for Engine Results Viewer

#### Performance Data Files
- **`.det`** - Performance data (24 parameters)
  - RPM, P-Av (power), Torque
  - PCylMax (cylinder pressure per cylinder)
  - TCylMax (cylinder temperature per cylinder)
  - TUbMax (exhaust temperature per cylinder)
  - PurCyl (volumetric efficiency per cylinder)
  - Deto (detonation per cylinder)
  - Convergence (simulation convergence per cylinder)
  - **Status:** ✅ Implemented in Engine Results Viewer

- **`.pou`** - Extended performance (71-78 parameters)
  - Base: 71 parameters (NATUR engines)
  - TURBO engines: +7 parameters (Boost, BackPr, Pratio, TBoost, TTurbine, RPMturb, WastRat)
  - SUPER engines: +7 parameters (Boost, BackPr, Pratio, TBoost, RPMsup, PowSup, BOVrat)
  - Includes: All .det params (24) + IMEP, BMEP, FMEP, PMEP
  - BSFC (brake specific fuel consumption)
  - Combustion efficiencies (Seff, Teff, Ceff)
  - Gas exchange parameters
  - Fuel consumption
  - **Status:** ✅ Implemented in Engine Results Viewer

- **`.pou-merged`** - Combined format (74-81 parameters)
  - All .pou parameters (71-78, depends on engine type)
  - Plus critical from .det: PCylMax, Deto, Convergence (3 params)
  - NOTE: TCylMax NOT merged - .pou already has TC-Av (average cylinder temperature)
  - NATUR: 74 params | TURBO/SUPER: 81 params
  - **Status:** ✅ Implemented (best format for visualization)

#### Trace Files (~12 types)
- Pressure Traces (.cbt, .pde, etc.)
- Temperature Traces
- Combustion Traces
- Efficiency Traces
- Mass Flow Traces
- Wave Traces
- Mach Index Traces
- Purity Traces
- **Status:** Future support in Engine Results Viewer

#### Special Files
- PV-Diagram data
- Turbocharger/Supercharger map plots
- Measured trace curve files
- Measured power curve files

**Detailed Specs:**
- [../../docs/file-formats/](../file-formats/) - File format specifications
- [../../docs/file-formats/det-format.md](../file-formats/det-format.md) - .det specification
- [../../docs/file-formats/pou-format.md](../file-formats/pou-format.md) - .pou specification

---

## 🔄 WHY ENGINE RESULTS VIEWER?

### The Problem with Post4T

**Post4T was developed 15+ years ago** (same timeline as DAT4T and EngMod4T). As a Desktop Windows application, it suffers from:

1. **Outdated Technology Stack**
   - Windows-only (no macOS, Linux, mobile)
   - Legacy UI frameworks (limited UX possibilities)
   - Difficult to extend with modern features

2. **Limited Functionality**
   - No cross-project comparison (can only view one calculation at a time)
   - No units conversion (SI/American/HP)
   - Limited export (no CSV, Excel, high-res images)
   - No responsive design (fixed window sizes)

3. **Maintenance Burden**
   - Delphi/VB codebase (aging technology)
   - Hard to find developers familiar with these tools
   - Difficult to add new features

### The Solution: Engine Results Viewer

**Core Philosophy:** Keep the proven mathematical core (EngMod4T calculations are excellent), replace ONLY the visualization layer with modern web technology.

**What Stays the Same:**
- ✅ DAT4T (pre-processor) - unchanged
- ✅ EngMod4T (simulation engine) - unchanged
- ✅ File formats (.prt, .det, .pou) - unchanged
- ✅ Calculation quality - unchanged (15 years of proven results)

**What Gets Better:**
- 🚀 Modern React Web UI ("iPhone quality" standard)
- 🚀 Cross-platform (macOS development, Windows production, potentially Linux/cloud)
- 🚀 Cross-project comparison (1 primary + 4 comparisons simultaneously)
- 🚀 Interactive charts (zoom, pan, hover tooltips)
- 🚀 Units conversion (SI ↔ American ↔ HP)
- 🚀 Multiple export formats (CSV, Excel, PNG, SVG)
- 🚀 Accessibility (WCAG 2.1 AA compliant)
- 🚀 Responsive design (works on any screen size)
- 🚀 Easy to extend (React component architecture)

**Result:** Same trusted calculations, better user experience.

---

## 📚 WHERE TO FIND DETAILS

### Official Documentation (docs/)

**Suite Overview (this directory):**
- [README.md](README.md) - This file (entry point)
- [dat4t-overview.md](dat4t-overview.md) - DAT4T pre-processor
- [post4t-overview.md](post4t-overview.md) - Post4T visualizer (being replaced)
- [engmod4t-overview.md](engmod4t-overview.md) - EngMod4T simulation engine
- [suite-integration.md](suite-integration.md) - Complete workflow, file ownership, constraints

**Engine Results Viewer (current project):**
- [../../ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md) - AI context for Engine Viewer
- [../../docs/architecture.md](../architecture.md) - System architecture, patterns
- [../../docs/chart-presets.md](../chart-presets.md) - 6 chart presets documentation
- [../../docs/file-formats/](../file-formats/) - File format specifications
- [../../docs/decisions/](../decisions/) - Architecture Decision Records (WHY)
- [../../docs/api.md](../api.md) - API documentation
- [../../docs/parsers-guide.md](../parsers-guide.md) - How to add new file format parsers

**Parameters Reference:**
- [../../docs/PARAMETERS-REFERENCE.md](../PARAMETERS-REFERENCE.md) - All 73 parameters documented

### Legacy Documentation (Extracted from CHM Help Files)

**DAT4T Detailed Documentation:**
- [../../_personal/Dat4THelp-chapters/](../../_personal/Dat4THelp-chapters/)
- 11 chapters, 4,884 lines, 35 MB with images
- Covers: Introduction, Starting, Engine Data, Turbo, Ports/Valves, Exhaust, Intake, Combustion, Temperatures

**Post4T Detailed Documentation:**
- [../../_personal/Post4THelp-chapters/](../../_personal/Post4THelp-chapters/)
- 23 chapters, 1,503 lines, 7 MB with images
- Covers: Trace types, Performance, PV-Diagrams, Detonation, Turbo post-processing

---

## 🕰️ HISTORY & CONTEXT

### Timeline

```
~2000s    EngMod4T Suite development by Neels van Niekerk
          (Vannik Racing Developments)
          Based on Prof. Gordon P Blair's work (Queens University Belfast)
          ├─ DAT4T (pre-processor)
          ├─ EngMod4T (simulation engine - Method of Characteristics)
          └─ Post4T (post-processor / visualizer)

~2010s    Suite matures, widely used in engine design
          • 15+ years of proven thermodynamic calculations
          • Fixed-width ASCII file format standardized (Delphi 7)
          • ~15 different file types supported
          • Used in CIS engineering community and internationally

2025      Engine Results Viewer development starts
          • Goal: Replace Post4T visualization layer
          • Keep: Proven calculation core (DAT4T + EngMod4T)
          • Replace: Desktop UI → Modern Web UI
          • Current status: v2.0.0 (cross-project comparison)
```

### Technology Stack Evolution

**EngMod4T Suite (Original - Still in Use):**
- Platform: Windows Desktop
- Language: Delphi 7 (Object Pascal) / Visual Basic
- UI: Desktop frameworks (VCL)
- File Format: Fixed-width ASCII (Delphi `Format()` function)
- Encoding: Windows-1251 (Cyrillic support)

**Engine Results Viewer (New - In Development):**
- Platform: Web (macOS dev, Windows prod, potentially cloud)
- Frontend: React 18 + TypeScript + ECharts + TailwindCSS
- Backend: Node.js + Express
- File Format: SAME (reads original .det/.pou files unchanged)
- Architecture: Modern component-based, Parser Registry pattern

### Why Delphi/Pascal?

**Context:** EngMod4T Suite was developed by **CIS (former USSR) engineering community** in early 2000s.

**Delphi 7 was ideal for this context:**
1. **Popular in CIS** (widely taught, many developers)
2. **Excellent for numerical computing** (Pascal roots)
3. **Fast native Windows apps** (no .NET overhead)
4. **Robust for mathematical software** (type-safe, performant)
5. **Great for engineering tools** (precise control over data formats)

**Result:** 15+ years of stable, proven engine simulation software.

**Current Strategy:** Keep what works (calculations), modernize what needs updating (visualization).

---

## ⚠️ CRITICAL CONSTRAINTS FOR DEVELOPERS

When working with Engine Results Viewer or any tool that reads EngMod4T files:

### 1. First Column is Service Column

```javascript
// ❌ WRONG - will break everything
const values = line.trim().split(/\s+/);

// ✅ CORRECT - always skip first column
const values = line.trim().split(/\s+/).slice(1);
```

**WHY:** First column contains row numbers or calculation markers ($1, $2) - NOT data.

### 2. Parameter Names NEVER Translated

**RULE:** All parameter names from files ALWAYS stay English:
- `RPM`, `P-Av`, `Torque`, `PCylMax`, `TCylMax`, `PurCyl`, etc.

**Applies to:** UI (charts, legends, tables), TypeScript types, API responses

**WHY:** Precision, consistency, international recognizability

### 3. Files are READ-ONLY

**RULE:** Engine Results Viewer (and any visualizer) can ONLY read files.

**Cannot modify:**
- .prt files (created by DAT4T)
- .det files (created by EngMod4T)
- .pou files (created by EngMod4T)
- Trace files (created by EngMod4T)

**WHY:** Data integrity - only source programs can create/modify their outputs

### 4. Fixed-Width Format (Not CSV)

```javascript
// ✅ CORRECT parsing
const columns = line.trim().split(/\s+/);  // Multiple spaces

// ❌ WRONG parsing
const columns = line.split(',');           // Not CSV!
const columns = line.split(/\t/);          // Not tabs!
```

**WHY:** Delphi 7 `Format()` creates fixed-width output with variable spacing

---

## 🎯 QUICK REFERENCE

### When You Need to Understand...

| Need | Document | Type |
|------|----------|------|
| **Suite workflow** | [suite-integration.md](suite-integration.md) | Overview |
| **DAT4T features** | [dat4t-overview.md](dat4t-overview.md) | Overview |
| **Post4T capabilities** | [post4t-overview.md](post4t-overview.md) | Overview |
| **EngMod4T engine** | [engmod4t-overview.md](engmod4t-overview.md) | Overview |
| **Engine Viewer** | [../../ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md) | Detailed |
| **File formats** | [../file-formats/](../file-formats/) | Specs |
| **All parameters** | [../PARAMETERS-REFERENCE.md](../PARAMETERS-REFERENCE.md) | Reference |
| **DAT4T details** | [../../_personal/Dat4THelp-chapters/](../../_personal/Dat4THelp-chapters/) | Legacy docs |
| **Post4T details** | [../../_personal/Post4THelp-chapters/](../../_personal/Post4THelp-chapters/) | Legacy docs |

### Common Questions

**Q: Why replace Post4T if EngMod4T Suite works?**
A: Keep proven calculations (15 years), modernize UX (Desktop → Web). Same data, better experience.

**Q: Why not replace DAT4T and EngMod4T too?**
A: They work perfectly. Replacement would be risky and unnecessary. Only Post4T UI was limiting.

**Q: Can Engine Viewer modify .det/.pou files?**
A: NO. All files are READ-ONLY. Only EngMod4T can create them.

**Q: Will new file formats follow same pattern?**
A: YES. All ~15 file types use fixed-width ASCII (Delphi Format). Parsing strategy is universal.

**Q: Why are parameter names in English?**
A: International standard, precision, consistency. Non-negotiable user requirement.

---

## 🚀 NEXT STEPS

### For AI Agents

**If you're Claude Chat (architect mode):**
1. Read this overview to understand the ecosystem
2. Read [suite-integration.md](suite-integration.md) for complete workflow
3. Read [../../ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md) for Engine Viewer context
4. Now you can make informed architectural decisions

**If you're Claude Code (implementation):**
1. Read this overview to understand the big picture
2. Read relevant detailed docs (dat4t-overview.md, post4t-overview.md)
3. Read [../file-formats/](../file-formats/) for parsing specs
4. Read [../parsers-guide.md](../parsers-guide.md) before adding new formats
5. Read [../../ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md) for implementation patterns

### For Human Developers

**Getting Started:**
1. Clone repository
2. Read [../../README.md](../../README.md) for quick start
3. Read [../../docs/setup.md](../setup.md) for detailed installation
4. Read this directory (docs/engmod4t-suite/) for ecosystem understanding
5. Start with [../../docs/architecture.md](../architecture.md) for codebase structure

**Adding New Features:**
1. Check [../../CHANGELOG.md](../../CHANGELOG.md) for current version status
2. Read relevant ADRs in [../../docs/decisions/](../decisions/)
3. Follow established patterns (Parser Registry, CalculationReference)
4. Update documentation after significant changes

---

## 📝 DOCUMENT MAINTENANCE

**When to Update This Document:**
- Major changes to suite workflow
- New programs added to ecosystem
- Significant architectural decisions affecting suite integration
- Discovery of new file format patterns

**Related Documents to Update:**
- [suite-integration.md](suite-integration.md) - If workflow changes
- [../../ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md) - If Engine Viewer role changes
- Individual overviews (dat4t, post4t, engmod4t) - If specific programs change

**Maintenance By:** Claude Code (implementation agent)

---

**Last Updated:** November 5, 2025
**Version:** 1.0.0
**Status:** Active documentation
