# ⚙️ ENGMOD4T: Simulation Engine Overview

**Program Type:** 1D Gasdynamic & Thermodynamic Simulation Engine
**Purpose:** Simulate 4-stroke ICE performance and dynamics
**Platform:** Windows Desktop (Delphi 7)
**Developer:** Neels van Niekerk (Vannik Racing Developments)
**Based on:** Professor Gordon P Blair's work (Queens University Belfast)
**Last Updated:** November 5, 2025

---

## 🎯 PURPOSE

**EngMod4T** is the CORE simulation engine for 4-stroke Internal Combustion Engines. It performs:
1. **1D gasdynamic simulation** (intake/exhaust wave dynamics using Method of Characteristics)
2. **Thermodynamic cycle analysis** (compression, combustion, expansion)
3. **Performance prediction** (power, torque, BSFC, efficiencies)
4. **Multi-cycle convergence** (iterate until steady-state)
5. **Trace data generation** (pressure, temperature, mass flow at every crank angle)

**Input:** `.prt` file (engine configuration from DAT4T)

**Output:** `.det`, `.pou`, `.spo`, trace files (results for Post4T or Engine Results Viewer)

**⚠️ CRITICAL:** EngMod4T is READ-ONLY for `.prt` files. It NEVER modifies the input configuration.

---

## 📥 INPUTS

**From DAT4T:**
- **`.prt` file** - Complete engine configuration:
  - Engine geometry (bore, stroke, compression ratio, cylinders)
  - Intake manifold design (40+ configurations)
  - Exhaust manifold design (60+ configurations)
  - Turbocharger/supercharger setup (maps, wastegate, boost control)
  - Valves & lift profiles (VVT, VTEC)
  - Combustion model (Vibe, Wiebe, turbulent)
  - Atmospheric conditions (temperature, pressure, humidity)
  - Wall temperatures (cylinder head, piston, liner, ports)

**From User (GUI):**
- **Screen Mode** (single RPM point) or **Batch Mode** (power curve)
- RPM value(s): single point, range (start/stop/increment), or from `.txt` file
- Display options: graphics on/off, port summary, beep after run
- Output file: default project name or custom name

---

## 📤 OUTPUT

### File Organization

**Working Directory:**
- `.prt` file (input configuration, created by DAT4T)
- RPM list file (`.txt`, optional for batch mode)

**Project Folder** (`ProjectName/`):
- Created automatically on first simulation run
- Contains ALL output files

---

### 1. `.pou` File (Batch Mode - Power Curve)

**Purpose:** Performance data for multiple RPM points (power curve)

**Created when:** Batch Mode is selected (RPM sweep)

**Contains:** 24-73 parameters per RPM (depends on engine type: NA/Turbo/Supercharged)

**File type:** Appending file (each new batch run ADDS rows with calculation marker)

**Key Parameters:**
```
RPM          - Simulated engine speed
P-av         - Average engine power over the last THREE cycles (kW)
Torque       - Engine torque related to P-av (Nm)
Tex-AvC      - Average temperature in center of exhaust (°C)
Power        - Power per cylinder (kW)
Imep         - Indicated mean effective pressure per cylinder (bar)
Bmep         - Brake mean effective pressure per cylinder (bar)
Pmep         - Pumping mean effective pressure per cylinder (bar)
Fmep         - Friction mean effective pressure (bar)
Dratio       - Delivery ratio (volumetric efficiency)
Purc         - Purity at inlet valve closure (cylinder purity)
Seff         - Purity at exhaust valve closure (scavenging efficiency)
Teff         - Trapping efficiency
Ceff         - Charging efficiency (shape follows torque curve!)
BSFC         - Brake specific fuel consumption (kg/kWh)
TC-av        - Average maximum cylinder temperature (°C)
TUBmax       - Maximum unburned mixture temperature (°C) - DETONATION INDICATOR!
MaxDeg       - Degrees after TDC where max cylinder pressure occurs
Timing       - Ignition timing (BTDC)
Delay        - Combustion delay period (degrees)
Durat        - Combustion duration (burn period, degrees)
TAF          - Trapped air/fuel ratio
VibeDelay    - Calculated delay (turbulent model) or prescribed (Vibe model)
VibeDurat    - Calculated duration (turbulent model) or prescribed (Vibe model)
VibeA        - Vibe parameter A
VibeM        - Vibe parameter M

+ Turbo params (if turbocharged):
Boost        - Boost pressure (bar gauge)
BackPr       - Back pressure (bar gauge)
Pratio       - Pressure ratio (boost/back)
TBoost       - Inlet temperature at boost point (°C)
TTurbine     - Turbine inlet temperature (°C)

+ Supercharger params (if supercharged):
Boost        - Boost pressure (bar gauge)
BackPr       - Back pressure (bar gauge)
Pratio       - Pressure ratio (boost/back)
TBoost       - Inlet temperature at boost point (°C)
```

**Use Cases:**
- Power/torque curves vs RPM
- Efficiency optimization (BSFC, Ceff, Teff)
- Detonation risk analysis (TUBmax)
- Combustion tuning (Vibe parameters)

---

### 2. `.spo` File (Screen Mode - Single Point)

**Purpose:** Performance data for SINGLE RPM calculation

**Created when:** Screen Mode (individual run) is selected

**Contains:** Same parameters as `.pou`, but only ONE RPM point

**File type:** Appending file (each screen run ADDS one row)

**Use Cases:**
- Quick what-if analysis at specific RPM
- Parameter sensitivity study
- Debug specific operating point

---

### 3. `.det` File (Detailed Results - Legacy Format)

**Purpose:** Main performance results (24 parameters)

**Contains:** Subset of `.pou` parameters

**Note:** `.det` format is OLDER format. Modern workflow uses `.pou` instead.

---

### 4. Trace Files (Cycle-Resolved Data)

**Purpose:** Detailed data at every crank angle (1° resolution)

**File Naming:** `ProjectNameRPM.ext` (e.g., `Honda8000.tpt`)
- Example: Temperature traces for project "Honda" at 8000 RPM → `Honda8000.tpt`

**File Type:** OVERWRITE files (new run overwrites previous run!)
- ⚠️ If you want to keep old run, manually rename trace files before re-running

**Crank Angle Reference:**
- **CRITICAL:** Uses crank angle of **LAST cylinder** as reference!
- Only the LAST cylinder trace starts at TDC
- Other cylinders are phase-shifted relative to last cylinder

**Trace Types:**
- **`.ppt`** - Pressure traces (cylinder, intake, exhaust pressure vs crank angle)
- **`.tpt`** - Temperature traces (cylinder, gas temperature vs crank angle)
- **`.mat`** - Mach traces (Mach number in intake/exhaust tracts)
- **`.mst`** - Mass flow traces (mass flow rate at trace positions)
- **`.wat`** - Wave traces (pressure wave propagation)
- **`.cbt`** - Combustion traces (mass fraction burned, heat release rate)
- **`.eft`** - Efficiency traces (scavenging, trapping efficiency)
- **`.tut`** - Turbo traces (boost pressure, turbo RPM vs crank angle)
- **`.put`** - Purity traces (fresh charge purity vs crank angle)

**Import:**
- Post4T (native visualizer)
- Microsoft Excel: Import as "space delimited" text, start at line 16
- Engine Results Viewer: Native support planned

---

## 🔧 KEY FEATURES

### 1. Method of Characteristics (1D Gasdynamics)

**Purpose:** Model pressure wave propagation in intake/exhaust system

**Numerical Method:**
- **Method of Characteristics** (MOC) - proven numerical scheme for 1D gas flow
- Based on **Professor Gordon P Blair's work** (Queens University Belfast)

**How it Works:**
1. **Mesh control volumes:** Divide intake/exhaust ducts into small elements
2. **Wave speed calculation:** Use assumed pipe temperature to calculate wave speed
3. **Mesh length optimization:** Wave should travel ~1 mesh length per degree
4. **Minimum mesh requirement:** At least 3 meshes in shortest pipe (numerical stability)
5. **Iterate:** Solve unsteady gas flow equations at each time step (every degree)

**Key Constraint:** Shortest Pipe Length

To minimize run time and maintain accuracy:

| RPM   | Min Exhaust Length | Min Inlet Length |
|-------|-------------------|------------------|
| 6000  | 72 mm             | 36 mm            |
| 8000  | 54 mm             | 27 mm            |
| 10000 | 43 mm             | 22 mm            |
| 12000 | 36 mm             | 18 mm            |
| 14000 | 31 mm             | 15 mm            |
| 16000 | 27 mm             | 13 mm            |
| 18000 | 24 mm             | 12 mm            |

**Why?** Shorter pipes require more meshes → longer run time (~30% increase for short pipes)

**Trade-off:** Accuracy vs run time (lengthen shortest pipe to match table, shorten adjacent pipe to maintain total length)

**Performance Killers:**
- Very short pipes (< minimum length)
- Silencer modeling (creates very short internal ducts)
- Multiple collectors (pipe joint subroutine is slow)
- Turbocharger (requires 100+ iterations to stabilize)

---

### 2. Five Efficiency Parameters (Understanding Engine Breathing)

**EngMod4T reports 5 key efficiencies to understand open cycle process:**

#### 1. Delivery Ratio (Dratio)

**Definition:** Total mass of air inhaled compared to mass of air in swept volume at atmospheric conditions

**What it measures:** How well engine "breathes"

**Typical values:**
- Industrial engine: 0.6 - 0.8
- High-performance racing engine: up to 1.25

**Note:** Also called "Volumetric Efficiency" in 4-stroke world (misleading - it's a MASS ratio, not volume!)

#### 2. Scavenging Efficiency (Seff)

**Definition:** Purity of gas inside cylinder **at exhaust valve closure** (end of overlap period)

**What it measures:** How effective overlap period is at removing burned gas

**Range:** 0 to 1.0 (varies with RPM and intake/exhaust tuning)

**Note:** Differs from traditional definition (traditional uses inlet valve closure)

**Use case:** If Seff is low when intake/exhaust are in tune → examine overlap flow (check inlet/exhaust pressure and mass flow traces)

#### 3. Cylinder Purity (PurCyl)

**Definition:** Purity of mixture **at inlet valve closure**

**What it measures:** Combined effect of induction stroke flow and scavenging efficiency

**Key insight:** Burned gas trapped at EVC will remain until combustion completes and exhaust valve opens

#### 4. Trapping Efficiency (Teff)

**Definition:** Ratio of trapped air (at IVC) to delivered air (Dratio)

**What it measures:** How well intake system "plugs" (prevents backflow)

**Key insight:** Indicates intake tuning effectiveness at trapping delivered charge

#### 5. Charging Efficiency (Ceff)

**Definition:** Ratio of trapped charge mass (at IVC) to mass cylinder can hold at atmospheric conditions (piston at BDC)

**What it measures:** Actual cylinder filling

**Key insight:** **Ceff curve shape = Torque curve shape** (directly related to performance!)

---

### 3. Multi-Cycle Convergence

**Purpose:** Iterate until simulation reaches steady-state

**How it Works:**
1. Start with initial conditions (atmospheric pressure in manifolds)
2. Simulate cycle 1 → outputs differ from inputs
3. Simulate cycle 2 with outputs from cycle 1 as new inputs
4. Repeat until convergence (outputs ≈ inputs)

**Convergence Criteria (Typical):**
- **NA engines:** 3 cycles averaged for P-av ("last three cycles")
- **Supercharged engines:** 3 cycles (mechanical drive → fast convergence)
- **Turbocharged engines:** 100+ iterations required! (turbo model needs time to stabilize)

**Convergence Indicator:** `Convergence` parameter in `.det` file
```
✅ Convergence < 0.5% → Good convergence
⚠️ Convergence = 1-2% → Acceptable (borderline)
❌ Convergence > 5% → Poor convergence (results unreliable!)
```

---

### 4. Simulation Modes

#### Screen Mode (Single Point)

**Purpose:** Calculate single RPM point

**When to use:**
- What-if analysis
- Parameter sensitivity study
- Debug specific operating point
- Quick checks

**Output:** `.spo` file (single point output)

**Workflow:**
1. Start EngMod4T → Select project → Screen Mode
2. Enter RPM value
3. Configure display options (graphics on/off, port summary)
4. Run simulation
5. View graphics (if enabled) and output file

#### Batch Mode (Power Curve)

**Purpose:** Calculate multiple RPM points (unattended RPM sweep)

**When to use:**
- Generate power/torque curves
- Efficiency analysis vs RPM
- Performance optimization

**Output:** `.pou` file (power output - appending)

**Two sub-modes:**

**A. Generated RPM Sweep:**
- Specify: Start RPM, Stop RPM, Increment
- Example: 2000 RPM to 8000 RPM, step 200 RPM → 31 points
- EngMod4T generates RPM list automatically

**B. RPM from Text File:**
- Create `ProjectName.txt` with RPM list (one per line)
- Allows variable increments (e.g., 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 8000)
- Can edit file in Notepad or from EngMod4T GUI

**Batch Options:**
- Display graphics: Yes/No (default: No for speed)
- Beep after each RPM: Yes/No (default: No)
- Output file name: Default (project name) or Custom

---

## 🔄 WORKFLOW

### Typical EngMod4T Session

```
1. START ENGMOD4T
   └─ Double-click EngMod4T icon
   └─ Click "Continue"

2. SELECT PROJECT
   └─ Browse list of available projects
   └─ Select .prt file (created by DAT4T)
   └─ Or "Use Previous Project"

3. CONFIGURE SIMULATION
   └─ Run Type: Screen Mode or Batch Mode
   └─ Display options: Graphics, Port Summary, Beep
   └─ Output file: Default or Custom name

4A. SCREEN MODE (Single RPM)
    └─ Enter RPM value
    └─ Run simulation
    └─ View graphics (real-time display if enabled)
    └─ Output: ProjectName.spo

4B. BATCH MODE (Power Curve)
    └─ Generated sweep: Enter start/stop/increment
    └─ OR from file: Use ProjectName.txt with RPM list
    └─ Run unattended (no graphics by default)
    └─ Output: ProjectName.pou (appending file)

5. SIMULATION RUNS
   └─ EngMod4T calculates:
      - Gasdynamic wave propagation (Method of Characteristics)
      - Thermodynamic cycle (compression, combustion, expansion)
      - Iterate until convergence (3 cycles NA, 100+ iterations turbo)
   └─ Creates output files in ProjectName/ folder

6. OUTPUT FILES CREATED
   └─ ProjectName.pou or ProjectName.spo (performance data)
   └─ ProjectNameRPM.ppt (pressure traces - if trace enabled)
   └─ ProjectNameRPM.tpt (temperature traces - if trace enabled)
   └─ ProjectNameRPM.mat, .mst, .wat, etc. (other traces)

7. VISUALIZE RESULTS
   └─ Post4T (OLD): Load .pou file → plot curves
   └─ Engine Results Viewer (NEW): Load .pou file → interactive charts

8. ITERATE DESIGN (if needed)
   └─ Go back to DAT4T → modify configuration
   └─ Save updated .prt file
   └─ Re-run EngMod4T
   └─ Compare results (multiple calculations)
```

---

## 🔗 INTEGRATION WITH DAT4T & POST4T

**Complete Workflow:**
```
DAT4T: Configure engine
    ↓ creates
.prt file (complete configuration)
    ↓ stored in
Working Directory (C:/4Stroke/)
    ↓ read by
EngMod4T: Load .prt, run simulation
    ↓ creates
ProjectName/ folder (first run)
    ↓ writes output files
.pou, .spo, trace files (ProjectName/)
    ↓ read by
Post4T / Engine Results Viewer: Visualize
    ↓ export
Plots, reports, analysis
```

**Key Points:**
- **DAT4T → EngMod4T:** One-way data flow (DAT4T creates .prt, EngMod4T reads it)
- **EngMod4T → Post4T:** One-way data flow (EngMod4T creates .pou, Post4T reads it)
- **No feedback loop:** EngMod4T cannot modify .prt, Post4T cannot modify .pou
- **File organization:** .prt in working directory, outputs in ProjectName/ folder

---

## ⚠️ CRITICAL CONSTRAINTS

### 1. File Format: Fixed-Width ASCII (Delphi 7)

**Type:** Fixed-width ASCII text (**NOT** CSV, **NOT** tab-separated)

**Origin:** Delphi 7 `WriteLn(F, Format('%12.2f %12.2f ...', [values]))`

**Characteristics:**
```
     RPM        P-av       Torque    TexAv   Power( 1)
    3200       48.30      144.14     584.6      12.08
    3400       52.52      147.60     595.3      13.13
    ^^^^       ^^^^^      ^^^^^^
    Multiple   spaces     between columns (NOT single space!)
```

**Parsing Strategy:**
```typescript
// ✅ CORRECT - split on multiple spaces
const columns = line.trim().split(/\s+/);

// ❌ WRONG - CSV parser
const columns = line.split(','); // Will fail!
```

---

### 2. First Column is SERVICE Column

**CRITICAL:** The first column in ALL EngMod4T files is a SERVICE column (row number or marker).

**Rule:** ALWAYS skip the first column when parsing!

```typescript
// ✅ CORRECT - skip first column
const columns = line.trim().split(/\s+/);
const dataColumns = columns.slice(1); // Skip first!

// ❌ WRONG - include first column
const dataColumns = columns; // Will break everything!
```

**Why First Column Exists:**
- Delphi WriteLn adds row counter for debugging
- Markers ($1, $2, ...) identify different calculations
- Not part of actual data structure

---

### 3. Parameter Names ALWAYS English

**CRITICAL:** All parameter names from EngMod4T files MUST remain in original English.

**Original Names:**
```
RPM          - engine speed (never "Обороты")
P-av         - average power (never "Мощность")
Torque       - torque (never "Момент")
Dratio       - delivery ratio (never "Коэффициент наполнения")
PurCyl       - cylinder purity (never "Чистота смеси")
Seff         - scavenging efficiency (never "Эффективность продувки")
Teff         - trapping efficiency (never "Эффективность улавливания")
Ceff         - charging efficiency (never "Коэффициент заряда")
TUBmax       - max unburned temp (never "Температура несгоревшей зоны")
```

**Why Never Translate?**
1. **Data integrity** - original names from source software
2. **Traceability** - easy to match with EngMod4T documentation
3. **International compatibility** - English is universal for engineering
4. **Consistency** - same names in all components (charts, tables, legends)

---

### 4. Read-Only Input (.prt)

**Rule:** EngMod4T reads `.prt` file but NEVER modifies it.

**File Ownership:**
- DAT4T: ONLY program that creates/modifies .prt
- EngMod4T: READ-ONLY (parses .prt, never writes to it)
- Post4T: NEVER touches .prt
- Engine Results Viewer: READ-ONLY (future: parse .prt for metadata)

---

### 5. Universal Format for All Outputs

**CRITICAL:** ALL ~15 EngMod4T output file types share the same format structure.

**Why?**
- They come from the same Delphi 7 program
- Same `WriteLn(F, Format(...))` code pattern
- Same Windows platform
- Same developer (Neels van Niekerk, Vannik Racing Developments)

**Implication:**
When adding parsers for new file types, ALWAYS:
1. Assume fixed-width ASCII format
2. Skip first column (service column)
3. Use `split(/\s+/)` for parsing
4. Keep original parameter names (English)

---

## 📚 DETAILED DOCUMENTATION

**For EngMod4T Suite documentation:**
- [README.md](README.md) - Suite overview
- [suite-integration.md](suite-integration.md) - Complete workflow
- [dat4t-overview.md](dat4t-overview.md) - Pre-processor
- [post4t-overview.md](post4t-overview.md) - Post-processor

**For EngMod4T detailed documentation:**
- [../../_personal/EngMod4THelp-chapters/](../../_personal/EngMod4THelp-chapters/) - 31 chapters, detailed simulation engine documentation

**Key chapters:**
- **12-FrontPage** - About EngMod4T, developer, methodology
- **27-StartUp** - How to start and configure simulation
- **26-ScreenMode** - Single point simulation
- **05-BatchMode** - Batch run (power curve)
- **20-PerformanceFile** - .pou/.spo file format specification
- **13-GeneralOutput** - Output files overview
- **09-EfficiencyParameters** - Five efficiency definitions
- **25-RunTimeDuration** - Mesh optimization, shortest pipe length
- **Trace chapters (06,08,18-22,28,30-31)** - 9 trace types documentation

**For file format specifications:**
- [../file-formats/README.md](../file-formats/README.md) - All formats overview
- [../file-formats/det-format.md](../file-formats/det-format.md) - .det specification
- [../PARAMETERS-REFERENCE.md](../PARAMETERS-REFERENCE.md) - All 73 parameters

**For parser implementation:**
- [../parsers-guide.md](../parsers-guide.md) - How to add new parsers
- `backend/src/parsers/detParser.ts` - .det parser example
- `backend/src/parsers/pouParser.ts` - .pou parser example

---

## 🎓 KEY TAKEAWAYS

1. **Developer:** Neels van Niekerk (Vannik Racing Developments), based on Prof. Gordon P Blair's work
2. **Method of Characteristics** (1D gasdynamics for wave propagation)
3. **P-av definition:** "last THREE cycles" (not 6 or 40)
4. **Turbo convergence:** 100+ iterations required (not 40 cycles)
5. **Five efficiency parameters:** Dratio, Seff, PurCyl, Teff, Ceff (Ceff curve = Torque curve!)
6. **Mesh optimization:** Shortest pipe length critical for run time (see table)
7. **Two modes:** Screen Mode (.spo) and Batch Mode (.pou)
8. **Crank angle reference:** Uses LAST cylinder as reference (only last cylinder starts at TDC)
9. **Trace files:** OVERWRITE on new run (manually rename to keep old runs!)
10. **Fixed-width ASCII format** (Delphi 7 origin, NOT CSV)
11. **First column is service column** (ALWAYS skip when parsing!)
12. **Parameter names ALWAYS English** (never translate)

---

## 📊 SUMMARY TABLE

| Aspect | Details |
|--------|---------|
| **Purpose** | 1D gasdynamic & thermodynamic simulation engine |
| **Developer** | Neels van Niekerk (Vannik Racing Developments) |
| **Based on** | Professor Gordon P Blair's work (Queens University Belfast) |
| **Input** | `.prt` file (engine configuration from DAT4T) |
| **Output** | `.pou` (batch), `.spo` (screen), `.det` (legacy), trace files |
| **Platform** | Windows Desktop (Delphi 7) |
| **Simulation Method** | Method of Characteristics (MOC) + thermodynamic cycle analysis |
| **Convergence** | 3 cycles (NA/Supercharged), 100+ iterations (Turbocharged) |
| **File Format** | Fixed-width ASCII (Delphi `Format()` output) |
| **Parsing Rule** | ALWAYS skip first column (service column) |
| **Parameter Names** | ALWAYS English (never translate) |
| **Integration** | Reads .prt (DAT4T), creates .pou/.spo (Post4T/Engine Results Viewer) |

---

## 🔗 RELATED DOCUMENTATION

- [README.md](README.md) - Suite overview
- [suite-integration.md](suite-integration.md) - Complete workflow
- [dat4t-overview.md](dat4t-overview.md) - Pre-processor
- [post4t-overview.md](post4t-overview.md) - Post-processor
- [../file-formats/README.md](../file-formats/README.md) - File formats overview
- [../PARAMETERS-REFERENCE.md](../PARAMETERS-REFERENCE.md) - 73 parameters reference
- [../../_personal/EngMod4THelp-chapters/](../../_personal/EngMod4THelp-chapters/) - Detailed EngMod4T documentation (31 chapters)

---

**Last Updated:** November 5, 2025
**Version:** 2.0.0 (Rewritten based on real EngMod4THelp documentation)
**Status:** Active documentation
