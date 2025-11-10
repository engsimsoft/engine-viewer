# 🔄 EngMod4T Suite Integration & Workflow

**Document Type:** Integration Guide
**For:** Developers working with EngMod4T ecosystem
**Purpose:** Understand complete workflow, file ownership, and constraints
**Last Updated:** November 5, 2025

---

## 🎯 DOCUMENT PURPOSE

This document explains:
- How DAT4T, EngMod4T, and Post4T/Engine Viewer work together
- Who creates which files (file ownership contracts)
- What constraints exist for each program
- How Engine Results Viewer integrates into the existing ecosystem
- Critical patterns for developers

**Related Documents:**
- [README.md](README.md) - Suite overview
- [dat4t-overview.md](dat4t-overview.md) - DAT4T details
- [engmod4t-overview.md](engmod4t-overview.md) - EngMod4T details
- [post4t-overview.md](post4t-overview.md) - Post4T details
- [../../ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md) - Engine Viewer context

---

## 🔄 COMPLETE WORKFLOW

### High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      USER: ENGINEER                          │
│              "I want to design a turbo 4-cylinder"           │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                  STEP 1: PRE-PROCESSING                      │
│                   DAT4T (Pre-processor)                      │
│  ──────────────────────────────────────────────────────      │
│                                                              │
│  ┌─ CREATE PROJECT ──────────────────────────────────────┐  │
│  │ • Open DAT4T                                          │  │
│  │ • New Project → "MyTurbo4Cyl"                         │  │
│  │ • Set data path: C:/4Stroke/MyTurbo4Cyl/             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ CONFIGURE ENGINE DATA ────────────────────────────────┐  │
│  │ 03-Engine-Data.md                                     │  │
│  │ • Cylinders: 4                                        │  │
│  │ • Bore: 82 mm                                         │  │
│  │ • Stroke: 90.3 mm                                     │  │
│  │ • Compression ratio: 9.5                              │  │
│  │ • Type: Inline 4, turbocharged                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ CONFIGURE TURBOCHARGER ───────────────────────────────┐  │
│  │ 04-Turbocharger-Supercharger.md                       │  │
│  │ • Select compressor map (Garrett GTX3076R)           │  │
│  │ • Select turbine map                                  │  │
│  │ • Set wastegate parameters                            │  │
│  │ • Configure boost control                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ DESIGN INTAKE SYSTEM ─────────────────────────────────┐  │
│  │ 07-Intake-Subsystem.md (40+ configurations!)          │  │
│  │ • Manifold type: 4-in-1 plenum                       │  │
│  │ • Runner length: 200 mm                               │  │
│  │ • Plenum volume: 5 liters                            │  │
│  │ • Throttle: Single 60mm                               │  │
│  │ • Intercooler: Air-to-air, 65% efficiency           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ DESIGN EXHAUST SYSTEM ────────────────────────────────┐  │
│  │ 06-Exhaust-Subsystem.md (60+ configurations!)         │  │
│  │ • Manifold type: 4-into-1 merge collector            │  │
│  │ • Primary length: 800 mm (tuned)                     │  │
│  │ • Primary diameter: 38 mm                             │  │
│  │ • Collector type: Tapered merge                       │  │
│  │ • Turbine entry: Divided housing                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ CONFIGURE VALVES & LIFT PROFILES ─────────────────────┐  │
│  │ 05-Ports-Valves-Lift-Profiles.md                      │  │
│  │ • Intake valve: 32 mm diameter                        │  │
│  │ • Exhaust valve: 28 mm diameter                       │  │
│  │ • Camshaft: Import lift profile                       │  │
│  │ • VVT: 30° advance/retard range                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ SET COMBUSTION & IGNITION ────────────────────────────┐  │
│  │ 08-Combustion-Ignition.md                             │  │
│  │ • Model: Vibe combustion                              │  │
│  │ • Fuel: RON 95 gasoline                               │  │
│  │ • Ignition timing: MBT map                            │  │
│  │ • Equivalence ratio: λ = 1.0                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ SET CONDITIONS ───────────────────────────────────────┐  │
│  │ 09-Temperatures-Atmospheric.md                        │  │
│  │ • Ambient temperature: 25°C                           │  │
│  │ • Ambient pressure: 101.3 kPa                         │  │
│  │ • Coolant temperature: 90°C                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ SAVE PROJECT ─────────────────────────────────────────┐  │
│  │ • Click "Save Project"                                │  │
│  │ • Creates: C:/4Stroke/MyTurbo4Cyl.prt (in ROOT!)     │  │
│  │ • Also creates: C:/4Stroke/MyTurbo4Cyl/ (folder)     │  │
│  │ • File format: Fixed-width ASCII                      │  │
│  │ • Encoding: Windows-1251 (Cyrillic metadata)         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  OUTPUT: MyTurbo4Cyl.prt (in C:/4Stroke/ root)              │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                  STEP 2: SIMULATION                          │
│               EngMod4T (Simulation Engine)                   │
│  ──────────────────────────────────────────────────────      │
│                                                              │
│  INPUT: MyTurbo4Cyl.prt (READ-ONLY!)                        │
│                                                              │
│  ┌─ PARSE CONFIGURATION ──────────────────────────────────┐  │
│  │ • Read .prt file (fixed-width ASCII)                  │  │
│  │ • Extract engine geometry                             │  │
│  │ • Extract manifold configurations                     │  │
│  │ • Extract turbo maps                                  │  │
│  │ • Extract combustion model parameters                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ RUN SIMULATION ───────────────────────────────────────┐  │
│  │ • Set RPM range: 1000-7000 rpm (500 rpm steps)       │  │
│  │ • For each RPM:                                       │  │
│  │   ├─ Run 1D gasdynamic model                         │  │
│  │   ├─ Calculate thermodynamic cycle                   │  │
│  │   ├─ Model combustion (Vibe)                         │  │
│  │   ├─ Simulate turbo behavior                         │  │
│  │   ├─ Calculate wave dynamics                         │  │
│  │   ├─ Compute heat transfer                           │  │
│  │   └─ Iterate until convergence                       │  │
│  │ • Progress: 1000...1500...2000...7000 rpm            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ GENERATE OUTPUT FILES ────────────────────────────────┐  │
│  │                                                        │  │
│  │ MyTurbo4Cyl.det (24 parameters)                       │  │
│  │ ├─ RPM, P-Av (power), Torque                         │  │
│  │ ├─ PCylMax[1..4] (cylinder pressure per cylinder)   │  │
│  │ ├─ TCylMax[1..4] (cylinder temp per cylinder)       │  │
│  │ ├─ TUbMax[1..4] (exhaust temp per cylinder)         │  │
│  │ ├─ PurCyl[1..4] (vol. efficiency per cylinder)      │  │
│  │ ├─ Deto[1..4] (detonation per cylinder)             │  │
│  │ └─ Convergence (calculation quality - single value) │  │
│  │                                                        │  │
│  │ MyTurbo4Cyl.pou (Batch Mode - 78 params, TURBO)       │  │
│  │ ├─ Base parameters (71, NATUR)                       │  │
│  │ ├─ Turbo parameters (+7: Boost, BackPr, etc.)       │  │
│  │ ├─ Plus: IMEP, BMEP, FMEP, PMEP                      │  │
│  │ ├─ BSFC (brake specific fuel consumption)           │  │
│  │ ├─ Combustion efficiencies (Seff, Teff, Ceff)       │  │
│  │ ├─ Gas exchange parameters                           │  │
│  │ └─ Fuel consumption                                  │  │
│  │                                                        │  │
│  │ MyTurbo4Cyl.spo (Screen Mode - single RPM point)     │  │
│  │ └─ Same parameters as .pou, but only ONE RPM         │  │
│  │                                                        │  │
│  │ MyTurbo4Cyl_*.trace (9 trace file types)             │  │
│  │ ├─ Pressure traces (.cbt, .pde)                      │  │
│  │ ├─ Temperature traces                                │  │
│  │ ├─ Combustion traces                                 │  │
│  │ ├─ Mass flow traces                                  │  │
│  │ └─ Wave dynamics traces                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  OUTPUTS:                                                    │
│  • MyTurbo4Cyl.det (performance data - 24 params)           │
│  • MyTurbo4Cyl.pou (Batch Mode - 78 params TURBO, power curve) │
│  • MyTurbo4Cyl.spo (Screen Mode - 78 params TURBO, single pt)  │
│  • MyTurbo4Cyl_*.trace (9 trace types, detailed traces)     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              STEP 3: POST-PROCESSING & ANALYSIS              │
│      Post4T (OLD) or Engine Results Viewer (NEW)             │
│  ──────────────────────────────────────────────────────      │
│                                                              │
│  INPUTS: .det, .pou, trace files (ALL READ-ONLY!)           │
│                                                              │
│  ┌─ LOAD DATA ────────────────────────────────────────────┐  │
│  │ • Parse MyTurbo4Cyl.det (24 params)                   │  │
│  │ • Parse MyTurbo4Cyl.pou (78 params TURBO)            │  │
│  │ • Merge → 81 params total (.pou-merged format)       │  │
│  │ • Extract calculations: $1, $2, $3, ...              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ VISUALIZE PERFORMANCE (Engine Viewer features) ─────┐  │
│  │ • Preset 1: Power & Torque vs RPM                     │  │
│  │ • Preset 2: PCylMax & TCylMax per cylinder           │  │
│  │ • Preset 3: Temperatures (TCylMax, TUbMax)           │  │
│  │ • Preset 4: Custom parameters (user selectable)      │  │
│  │ • Preset 5: MEP (IMEP, BMEP, FMEP, PMEP)             │  │
│  │ • Preset 6: Efficiency (Seff, Teff, Ceff)            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ COMPARE CALCULATIONS (NEW feature!) ─────────────────┐  │
│  │ • Primary: $3 (best torque)                           │  │
│  │ • Compare with:                                        │  │
│  │   ├─ $1 (baseline configuration)                     │  │
│  │   ├─ $5 (alternative cam timing)                     │  │
│  │   ├─ OtherProject.$2 (competitor engine)             │  │
│  │   └─ Up to 5 calculations simultaneously             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ ANALYZE & EXPORT ─────────────────────────────────────┐  │
│  │ • Peak values: Max power @ 6500 rpm = 285 kW         │  │
│  │ • Peak torque @ 4500 rpm = 420 Nm                    │  │
│  │ • BSFC @ peak efficiency = 245 g/kWh                 │  │
│  │ • Export: CSV, Excel, PNG, SVG                       │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                    USER DECISION                             │
│  ────────────────────────────────────────────────────        │
│  • Results good? → Done! ✅                                  │
│  • Need improvements? → Go back to DAT4T, modify config 🔄   │
│  • Try different setup? → Create new calculation ($4) 🔄     │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 FILE OWNERSHIP & CONTRACTS

### File Creation Matrix

| File Type | Created By | Read By | Modified By | Ownership |
|-----------|-----------|---------|-------------|-----------|
| `.prt` | **DAT4T** | EngMod4T | **DAT4T ONLY** | DAT4T |
| `.det` | **EngMod4T** | Post4T / Engine Viewer | **NOBODY** (read-only) | EngMod4T |
| `.pou` | **EngMod4T** | Post4T / Engine Viewer | **NOBODY** (read-only) | EngMod4T |
| `*_trace` | **EngMod4T** | Post4T / Engine Viewer | **NOBODY** (read-only) | EngMod4T |

### File Contracts (Critical!)

```
┌────────────┐                    ┌────────────┐
│   DAT4T    │──── CREATES ────→  │   .prt     │
│            │                    │  (config)  │
└────────────┘                    └────────────┘
                                       │
                                       │ READ-ONLY
                                       ↓
                                  ┌────────────┐
                                  │ EngMod4T   │
                                  └────────────┘
                                       │
                                       │ CREATES
                                       ↓
                         ┌─────────────┴─────────────┐
                         │                           │
                    ┌────────────┐            ┌────────────┐
                    │   .det     │            │   .pou     │
                    │ (24 params)│            │(71-78 par) │
                    └────────────┘            └────────────┘
                         │                           │
                         │ READ-ONLY                 │ READ-ONLY
                         │                           │
                         └──────────┬────────────────┘
                                    ↓
                         ┌──────────────────────┐
                         │  Post4T / Engine     │
                         │  Results Viewer      │
                         │  (VISUALIZATION)     │
                         └──────────────────────┘
```

### Critical Constraint: File Access Levels

**RULE:** Engine Results Viewer has different access levels for different file types.

---

#### 🔒 READ-ONLY (cannot modify at all)

**Cannot do:**
- ❌ Modify .prt files (configuration belongs to DAT4T, breaks EngMod4T)
- ❌ Modify trace files (results belong to EngMod4T)
- ❌ Modify calculation data in .det/.pou files (RPM, power, torque, etc.)
- ❌ Create new simulation runs (only EngMod4T can simulate)

**WHY:** Data integrity. Only EngMod4T can create simulation results.

---

#### ⚠️ LIMITED WRITE (marker names only)

**Can modify:**
- ✅ **Marker names** in .det files (e.g., `$1` → `$1 Best Config`)
- ✅ **Marker names** in .pou files (e.g., `$2` → `$2 VVT +10°`)

**Cannot modify:**
- ❌ Calculation data (RPM, power, torque, temperatures, pressures - READ-ONLY!)
- ❌ Number of data rows or structure

**Example - What you CAN change:**
```
Before:  $1
After:   $1 Best Torque Setup

Before:  $3
After:   $3 VVT +10° @ 3000 RPM
```

**Example - What you CANNOT change:**
```javascript
// ❌ WRONG - Changing calculation data
const detData = parseDetFile('project.det');
detData.calculations[0].rows[0].RPM = 2000;  // NEVER DO THIS!
detData.calculations[0].rows[0]['P-Av'] = 150; // NEVER DO THIS!

// ✅ CORRECT - Only changing marker name
detData.calculations[0].marker = '$1 Best Config';  // OK!
```

**WHY marker names are editable:**
- User labels for organization (doesn't affect simulation data)
- Helps identify calculations (e.g., "$3 intake manifold test")
- Safe to modify (no impact on EngMod4T or calculation integrity)

---

#### ✅ FULL ACCESS

**Can do:**
- ✅ Read all files
- ✅ Parse and display data
- ✅ Export visualization (charts, tables, CSV)
- ✅ Compare calculations from different projects
- ✅ Convert units for display
- ✅ Cache parsed data (local only, not saved to source files)
- ✅ Create/modify `.metadata/` folder (Engine Viewer's own data)

---

## 🗂️ C:/4STROKE/ DIRECTORY STRUCTURE

### Production Environment

```
C:/4Stroke/                          # Production data root (Windows)
│
├── MyTurbo4Cyl.prt                  # ✅ DAT4T: Engine configuration (in ROOT!)
├── Vesta 1.6 IM.prt                 # ✅ DAT4T: Engine configuration (in ROOT!)
├── BMW_M3_S55.prt                   # ✅ DAT4T: Engine configuration (in ROOT!)
│   ... (50+ .prt files in root)
│
├── MyTurbo4Cyl/                     # Project 1 results folder
│   ├── MyTurbo4Cyl.det              # EngMod4T: Performance (24 params)
│   ├── MyTurbo4Cyl.pou              # EngMod4T: Extended (78 params TURBO)
│   ├── MyTurbo4Cyl_Pressure.cbt     # EngMod4T: Pressure trace
│   ├── MyTurbo4Cyl_Temp.trace       # EngMod4T: Temperature trace
│   ├── MyTurbo4Cyl_Combustion.trace # EngMod4T: Combustion trace
│   └── MyTurbo4Cyl_*.trace          # EngMod4T: Other traces
│
├── Vesta 1.6 IM/                    # Project 2 results folder
│   ├── Vesta 1.6 IM.det
│   ├── Vesta 1.6 IM.pou
│   └── Vesta 1.6 IM_*.trace
│
├── BMW_M3_S55/                      # Project 3 results folder
│   ├── BMW_M3_S55.det
│   ├── BMW_M3_S55.pou
│   └── BMW_M3_S55_*.trace
│
├── ... (50+ projects total)
│
└── Archive/                         # Old/backup projects
    └── ...
```

**Key Structure Rules:**
- `.prt` files are stored in **ROOT** of `C:/4Stroke/` (NOT inside project folders!)
- Project folders contain ONLY results: `.det`, `.pou`, and trace files
- Naming matches: `ProjectName.prt` (root) ↔ `ProjectName/` (folder)
- `.prt` files are READ-ONLY for Engine Viewer (only DAT4T can modify)

### Development/Test Environment

```
engine-viewer/                       # Git repository root (macOS)
│
├── test-data/                       # Mirrors C:/4Stroke/ structure EXACTLY
│   ├── Vesta 1.6 IM.prt             # ✅ DAT4T: Config file (in ROOT!)
│   ├── 4_Cyl_ITB.prt                # ✅ DAT4T: Config file (in ROOT!)
│   ├── TM Soft ShortCut.prt         # ✅ DAT4T: Config file (in ROOT!)
│   │   ... (70+ .prt files in root)
│   │
│   ├── Vesta 1.6 IM/                # Project 1 results folder
│   │   ├── Vesta 1.6 IM.det
│   │   └── Vesta 1.6 IM.pou
│   ├── 4_Cyl_ITB/                   # Project 2 results folder
│   │   ├── 4_Cyl_ITB.det
│   │   └── 4_Cyl_ITB.pou
│   └── TM Soft ShortCut/            # Project 3 results folder
│       ├── TM Soft ShortCut.det
│       └── TM Soft ShortCut.pou
│
├── frontend/                        # React app
├── backend/                         # Node.js server
└── docs/                            # Documentation
```

**Key Points:**
- `test-data/` EXACTLY mirrors `C:/4Stroke/` structure
- All `.prt` files in **ROOT** of `test-data/` (same as production)
- Project folders contain ONLY `.det`, `.pou` files (same as production)

**Path Configuration:**
```yaml
# config.yaml
dataPath:
  development: './test-data'       # macOS development
  production: 'C:/4Stroke'         # Windows production
```

### File Naming Convention

**Pattern:** `ProjectName.extension`

**Examples (with full paths):**
- `C:/4Stroke/Vesta 1.6 IM.prt` - Configuration (in ROOT)
- `C:/4Stroke/Vesta 1.6 IM/Vesta 1.6 IM.det` - Performance data (in folder)
- `C:/4Stroke/Vesta 1.6 IM/Vesta 1.6 IM.pou` - Extended performance (in folder)
- `C:/4Stroke/Vesta 1.6 IM/Vesta 1.6 IM_Pressure.cbt` - Trace file (in folder)

**Critical:** `.prt` file is in ROOT, while `.det/.pou/.trace` are INSIDE project folder!

**Rules:**
- Project name can contain spaces (wrapped in quotes when needed)
- Extensions: `.prt`, `.det`, `.pou`, `_*.trace`
- SAME project name across all files (consistency)
- Naming matches: `ProjectName.prt` (root) ↔ `ProjectName/` (folder)

---

## 🔄 ENGINE RESULTS VIEWER INTEGRATION

### How Engine Viewer Fits In

```
DAT4T (Pre-processor)           [UNCHANGED]
    ↓ creates .prt
EngMod4T (Simulation)           [UNCHANGED]
    ↓ creates .det, .pou, traces
Post4T (OLD Visualizer)    →    Engine Results Viewer (NEW)
    ↓ reads files                   ↓ reads SAME files
User analyzes results           User analyzes results (better UX)
```

**Key Points:**
1. **DAT4T unchanged** - Still creates .prt files
2. **EngMod4T unchanged** - Still creates .det/.pou/.spo/trace files
3. **Post4T replaced** - Desktop UI → Modern Web UI
4. **Same data sources** - Engine Viewer reads SAME .det/.pou/.spo files
5. **Same constraints** - Read-only, fixed-width format, parameter names

### What Engine Viewer Replaces

**Post4T Features → Engine Viewer Equivalent:**

| Post4T Feature | Engine Viewer Equivalent | Status |
|----------------|--------------------------|--------|
| Performance plots | ✅ 6 chart presets (Power/Torque, Pressure, Temp, MEP, Efficiency, Custom) | v2.0.0 |
| Single calculation view | ✅ **PLUS** cross-project comparison (1+4) | v2.0.0 |
| Fixed units | ✅ **PLUS** SI / American / HP conversion | v2.0.0 |
| Basic export | ✅ **PLUS** CSV, Excel, PNG, SVG | v2.0.0 |
| Desktop Windows only | ✅ **PLUS** Web (macOS dev, Windows prod, potentially cloud) | v2.0.0 |
| Thermo/Gasdynamic traces | 🚧 Future support (trace file parsers) | Planned |
| PV-Diagrams | 🚧 Future support | Planned |
| Turbo post-processing | 🚧 Future support | Planned |
| Noise analysis | 🚧 Future support | Planned |

### What Engine Viewer Adds (NEW Features)

**Not Available in Post4T:**
1. **Cross-Project Comparison** - Compare up to 5 calculations simultaneously (different projects, different setups)
2. **Modern Interactive Charts** - Zoom, pan, hover tooltips (ECharts)
3. **Units Conversion** - Live conversion between SI/American/HP
4. **Multiple Export Formats** - CSV, Excel, high-res PNG, vector SVG
5. **Responsive Design** - Works on any screen size (desktop, tablet, mobile)
6. **Accessibility** - WCAG 2.1 AA compliant (screen readers, keyboard navigation)
7. **"iPhone Quality"** - Professional, minimalist, smooth animations
8. **Multi-Format Support** - .det, .pou, .pou-merged (74-81 params: best of both)
9. **Peak Values Always Visible** - No hover needed, instant information
10. **Cross-Platform** - macOS development, Windows production, potentially Linux/cloud

---

## ⚠️ CRITICAL CONSTRAINTS FOR DEVELOPERS

### 1. Read-Only File Access

**Rule:** Engine Results Viewer can ONLY read files, never modify.

**Implementation:**
```javascript
// ✅ CORRECT - Read file
const data = await fs.readFile(filePath, 'utf-8');

// ❌ WRONG - Write/modify file
await fs.writeFile(filePath, modifiedData);  // NEVER DO THIS!

// ❌ WRONG - Delete file
await fs.unlink(filePath);  // NEVER DO THIS!
```

**WHY:** Data integrity. Only EngMod4T can create .det/.pou files. Modification could corrupt simulation results.

### 2. First Column is Service Column

**Rule:** ALL EngMod4T files have service column in position 0 → MUST skip with `slice(1)`.

**Correct Parsing:**
```javascript
// .det file line example:
// №	RPM	P-Av	Torque	PCylMax(1)	PCylMax(2)	...
// 1	1000	45.2	432.1	85.2	        85.4        ...

const line = "1	1000	45.2	432.1	85.2	85.4	...";

// ✅ CORRECT
const columns = line.trim().split(/\s+/);      // ["1", "1000", "45.2", ...]
const dataColumns = columns.slice(1);          // ["1000", "45.2", ...] ← Skip first!
const [rpm, power, torque] = dataColumns.map(parseFloat);

// ❌ WRONG - Missing slice(1)
const [rpm, power, torque] = line.trim().split(/\s+/).map(parseFloat);
// rpm = 1 (WRONG! Should be 1000)
// power = 1000 (WRONG! Should be 45.2)
// ALL VALUES SHIFTED!
```

**WHY:** First column contains row numbers (1, 2, 3) or calculation markers ($1, $2), NOT data values.

**IMPACT:** Forgetting `slice(1)` shifts ALL parameters by one position → silent data corruption → wrong charts!

### 3. Parameter Names NEVER Translated

**Rule:** All parameter names from .det/.pou files ALWAYS stay English.

**Applies To:**
- UI (chart titles, axis labels, legend items, table headers)
- TypeScript types/interfaces
- API responses
- Component props
- Documentation

**Examples:**
```typescript
// ✅ CORRECT - Original English names
interface ChartData {
  RPM: number;
  'P-Av': number;      // Power (NOT "Мощность"!)
  Torque: number;       // Torque (NOT "Момент"!)
  PCylMax: number[];    // Cylinder pressure (NOT "Давление"!)
}

// Chart title
<ChartPreset title="P-Av & Torque vs RPM" />  // ✅ English

// ❌ WRONG - Translated names
<ChartPreset title="Мощность и момент от оборотов" />  // ❌ Russian
```

**WHY:** Precision, consistency, international recognizability, user requirement (non-negotiable).

### 4. Fixed-Width Format (Not CSV)

**Rule:** ALL EngMod4T files use fixed-width ASCII (Delphi `Format()` output), NOT CSV.

**Parsing Strategy:**
```javascript
// ✅ CORRECT - Fixed-width with multiple spaces
const columns = line.trim().split(/\s+/);  // Regex for one-or-more spaces

// ❌ WRONG - CSV approach
const columns = line.split(',');           // Files are NOT comma-separated!

// ❌ WRONG - Single space
const columns = line.split(' ');           // Multiple spaces exist between values!

// ❌ WRONG - Tabs
const columns = line.split(/\t/);          // Not tab-separated (though may work accidentally)
```

**WHY:** Delphi 7 `Format('%12.2f %12.2f', [val1, val2])` creates fixed-width output with variable spacing.

### 5. Array Parameters (Per-Cylinder Data)

**Rule:** Parameters with `(1)`, `(2)`, etc. in header → Store as single array.

**File Format:**
```
PCylMax(1)  PCylMax(2)  PCylMax(3)  PCylMax(4)
85.2        85.4        85.3        85.6
```

**Storage Format:**
```javascript
// ✅ CORRECT - Single array
{
  PCylMax: [85.2, 85.4, 85.3, 85.6]
}

// ❌ WRONG - Separate keys
{
  'PCylMax(1)': 85.2,
  'PCylMax(2)': 85.4,
  'PCylMax(3)': 85.3,
  'PCylMax(4)': 85.6
}
```

**Applies To:** `PCylMax`, `TCylMax`, `TUbMax`, `PurCyl`, `Deto` (all per-cylinder parameters)

**Note:** `Convergence` is NOT per-cylinder - it's a single scalar value (calculation quality indicator).

### 6. Calculation Markers

**Rule:** Calculation markers can be simple or complex → Extract full text after `$`.

**Formats:**
```
Simple:     $1, $2, $3
With dot:   $3.1, $9.3
Complex:    $3.1 R 0.86
            $2.1 0.86 _R
            $5 text text
```

**Parser Must:**
- Detect line starting with `$`
- Extract FULL marker text (not just number)
- No assumptions about format

**Correct Parsing:**
```javascript
// ✅ CORRECT - Extract full marker
if (line.trim().startsWith('$')) {
  const marker = line.trim();  // "$3.1 R 0.86" (complete text)
  currentCalculation = { marker, dataRows: [] };
}

// ❌ WRONG - Only extract number
const marker = line.match(/\$(\d+)/)[1];  // "3" ← Lost ".1 R 0.86"!
```

### 7. Why .prt Files Are in Root (Critical Architecture)

**Rule:** `.prt` files MUST be stored in ROOT of `C:/4Stroke/`, NOT inside project folders.

**Actual Structure:**
```
C:/4Stroke/
├── ProjectName.prt         ✅ Configuration file (in ROOT!)
├── ProjectName/            ✅ Results folder
│   ├── ProjectName.det
│   └── ProjectName.pou
```

**WHY This Design:**

1. **Single Source of Truth** - One `.prt` file per project (not duplicated)
2. **EngMod4T Expects Root Location** - Simulator reads config files from `C:/4Stroke/` root
3. **Results Folder is Output-Only** - `ProjectName/` folder contains ONLY simulation outputs
4. **Prevents Accidental Modification** - `.prt` files isolated from frequent file operations
5. **Historical Design** - EngMod4T Suite has used this structure for 15 years (non-negotiable)
6. **File Locking Safety** - DAT4T locks `.prt` in root, EngMod4T writes to separate folder (no conflicts)

**IMPACT on Engine Viewer:**

**Must Do:**
- ✅ Scan `C:/4Stroke/*.prt` for project list (root level)
- ✅ Load metadata from `C:/4Stroke/ProjectName.prt`
- ✅ Load results from `C:/4Stroke/ProjectName/ProjectName.det`
- ✅ Maintain separate paths: `.prt` (root) ≠ `.det/.pou` (subfolder)

**Must NOT Do:**
- ❌ Look for `.prt` inside project folders (`C:/4Stroke/ProjectName/ProjectName.prt` does NOT exist!)
- ❌ Modify `.prt` files (READ-ONLY for Engine Viewer)
- ❌ Assume all files in same directory

**Correct File Discovery:**
```javascript
// ✅ CORRECT - Scan root for .prt files
const prtFiles = await fs.readdir('C:/4Stroke/')
  .then(files => files.filter(f => f.endsWith('.prt')));

// For each project:
const projectName = 'Vesta 1.6 IM';
const prtPath = `C:/4Stroke/${projectName}.prt`;           // Root!
const detPath = `C:/4Stroke/${projectName}/${projectName}.det`;  // Subfolder!

// ❌ WRONG - Looking for .prt inside folder
const wrongPath = `C:/4Stroke/${projectName}/${projectName}.prt`;  // Does NOT exist!
```

**WHY This Matters:**

Violating this constraint will cause:
- ❌ Project discovery fails (can't find `.prt` files)
- ❌ Metadata loading fails (wrong path)
- ❌ Auto-population of ProjectCard fails
- ❌ File path resolution errors throughout the app

**This is a FUNDAMENTAL architectural constraint** - not a design choice. The structure is dictated by EngMod4T Suite and cannot be changed.

---

## 🔀 DATA FLOW PATTERNS

### Pattern 1: One-Way Flow (No Feedback)

```
DAT4T  →  .prt  →  EngMod4T  →  .det/.pou  →  Visualizer
  ↓                    ↓                         ↓
Create              Read                     Read
Config            Simulate                Display
                   Output
```

**Key:** Data flows ONE WAY. Visualizer cannot send data back to EngMod4T or DAT4T.

### Pattern 2: Iterative Design Loop

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌────────┐     ┌──────────┐     ┌──────────┐   │
│  │ DAT4T  │ ──→ │ EngMod4T │ ──→ │ Visualiz │   │
│  │        │     │          │     │          │   │
│  └────────┘     └──────────┘     └──────────┘   │
│      ↑                                  │        │
│      │          USER DECISION           │        │
│      │        (Modify? Try again?)      │        │
│      └──────────────────────────────────┘        │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Usage:** User sees results → decides to modify intake manifold → goes back to DAT4T → creates new configuration → re-runs EngMod4T.

### Pattern 3: Multiple Calculations (Same Project)

```
DAT4T creates config  →  MyProject.prt

User runs EngMod4T multiple times:
  Run 1 (baseline)         →  $1  (RPM 1000-7000, 500 steps)
  Run 2 (VVT +10°)         →  $2  (RPM 1000-7000, 500 steps)
  Run 3 (VVT -10°)         →  $3  (RPM 1000-7000, 500 steps)
  Run 4 (different cam)    →  $4  (RPM 1000-7000, 500 steps)

Same .det/.pou file contains ALL calculations:
  MyProject.det:
    Metadata (line 1)
    Headers (line 2)
    $1 (marker)
    ... (13 data rows for $1)
    $2 (marker)
    ... (13 data rows for $2)
    $3 (marker)
    ... (13 data rows for $3)
    $4 (marker)
    ... (13 data rows for $4)

Visualizer can compare:
  - $1 vs $2 (effect of VVT advance)
  - $2 vs $3 (VVT advance vs retard)
  - All 4 together (different setups)
```

### Pattern 4: Cross-Project Comparison (Engine Viewer NEW Feature)

```
Project A: MyTurbo4Cyl
  └─ $3 (best torque setup)

Project B: Competitor_BMW_M3
  └─ $2 (stock configuration)

Project C: Alternative_Design
  └─ $1 (experimental intake)

Engine Viewer can compare:
  Primary: MyTurbo4Cyl.$3
  Compare with:
    - MyTurbo4Cyl.$1 (baseline)
    - Competitor_BMW_M3.$2 (competitor)
    - Alternative_Design.$1 (alternative)

  → 4 calculations from 3 different projects on ONE chart!
```

**NEW Capability:** Post4T could NOT do cross-project comparison.

---

## 🧩 CROSS-PROGRAM DEPENDENCIES

### Dependency Graph

```
┌──────────────────────────────────────────────────────────┐
│                    EngMod4T Suite                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐                                             │
│  │ DAT4T   │ (Independent - no dependencies)            │
│  └─────────┘                                             │
│       │                                                  │
│       │ creates .prt                                     │
│       ↓                                                  │
│  ┌─────────┐                                             │
│  │EngMod4T │ (Depends on: .prt from DAT4T)              │
│  └─────────┘                                             │
│       │                                                  │
│       │ creates .det, .pou, traces                       │
│       ↓                                                  │
│  ┌─────────┐                                             │
│  │ Post4T/ │ (Depends on: .det, .pou, traces from       │
│  │ Engine  │  EngMod4T)                                  │
│  │ Viewer  │                                             │
│  └─────────┘                                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Can Work Independently?

| Program | Can Run Standalone? | Requires | Notes |
|---------|---------------------|----------|-------|
| **DAT4T** | ✅ YES | Nothing | Can create/edit .prt files without other programs |
| **EngMod4T** | ⚠️ PARTIAL | .prt file | Can run simulation if .prt exists (from DAT4T or manual) |
| **Post4T / Engine Viewer** | ⚠️ PARTIAL | .det or .pou | Can visualize if data files exist (from EngMod4T) |

### Typical Usage Patterns

**Pattern A: Full Workflow (New Project)**
```
1. DAT4T       → Create configuration
2. EngMod4T    → Run simulation
3. Engine Viewer → Analyze results
```

**Pattern B: Re-run Simulation (Existing Project)**
```
1. DAT4T       → Modify configuration (.prt already exists)
2. EngMod4T    → Re-run simulation (overwrites .det/.pou)
3. Engine Viewer → Analyze new results
```

**Pattern C: Analyze Existing Data (No Simulation Needed)**
```
1. Engine Viewer → Load existing .det/.pou files
2. Analyze results
3. Compare with other projects
```

**Pattern D: Just View Results (No Modification)**
```
1. Engine Viewer → Browse C:/4Stroke/ projects
2. View any existing .det/.pou
3. Compare calculations
4. Export charts/data
```

---

## 📊 SUMMARY TABLE

| Aspect | DAT4T | EngMod4T | Post4T/Engine Viewer |
|--------|-------|----------|----------------------|
| **Purpose** | Pre-processor | Simulation engine | Post-processor |
| **Input** | User config | .prt file | .det, .pou, traces |
| **Output** | .prt file | .det, .pou, traces | Visualizations, exports |
| **Can Modify** | .prt files | Nothing (creates new files) | Nothing (read-only) |
| **File Format** | Fixed-width ASCII | Fixed-width ASCII | N/A (reads only) |
| **Platform** | Windows Desktop | Windows Desktop | Web (Engine Viewer) |
| **Technology** | Delphi 7 | Delphi 7 | React + Node.js (Engine Viewer) |
| **Status** | ✅ Active | ✅ Active | ⚠️ Post4T → Engine Viewer |

---

## 🎓 KEY TAKEAWAYS FOR DEVELOPERS

1. **One-Way Data Flow** - DAT4T → EngMod4T → Visualizer (no feedback loop)
2. **Read-Only Constraint** - Engine Viewer CANNOT modify any files
3. **Fixed-Width Format** - ALL files use same parsing pattern (`.prt`, `.det`, `.pou`, traces)
4. **First Column Skip** - ALWAYS `slice(1)` when parsing
5. **Parameter Names English** - NEVER translate (non-negotiable)
6. **File Ownership** - Only creator can modify (DAT4T for .prt, EngMod4T for .det/.pou)
7. **Cross-Project Comparison** - Engine Viewer's NEW capability (not in Post4T)
8. **Same Data Sources** - Engine Viewer reads SAME files as Post4T (drop-in replacement)

---

## 📚 RELATED DOCUMENTATION

- [README.md](README.md) - Suite overview
- [dat4t-overview.md](dat4t-overview.md) - DAT4T details
- [post4t-overview.md](post4t-overview.md) - Post4T details
- [engmod4t-overview.md](engmod4t-overview.md) - EngMod4T details
- [../../ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md) - Engine Results Viewer context
- [../file-formats/](../file-formats/) - File format specifications
- [../parsers-guide.md](../parsers-guide.md) - How to add new format parsers

---

**Last Updated:** November 5, 2025
**Version:** 1.0.0
**Maintained By:** Claude Code (implementation agent)
