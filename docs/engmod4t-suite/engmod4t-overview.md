# ⚙️ ENGMOD4T: Simulation Engine Overview

**Program Type:** 1D Gasdynamic & Thermodynamic Simulation Engine
**Purpose:** Simulate 4-stroke ICE performance and dynamics
**Platform:** Windows Desktop (Delphi 7)
**Last Updated:** November 5, 2025

---

## 🎯 PURPOSE

**EngMod4T** is the CORE simulation engine for 4-stroke Internal Combustion Engines. It performs:
1. **1D gasdynamic simulation** (intake/exhaust wave dynamics using Method of Characteristics)
2. **Thermodynamic cycle analysis** (compression, combustion, expansion)
3. **Performance prediction** (power, torque, BSFC, efficiencies)
4. **Multi-cycle convergence** (iterative simulation until steady-state)
5. **Trace data generation** (pressure, temperature, mass flow at every crank angle)

**Input:** `.prt` file (engine configuration from DAT4T)

**Output:** `.det`, `.pou`, trace files (results for Post4T or Engine Results Viewer)

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

**From User (GUI or Batch Mode):**
- RPM range (e.g., 2000-7000 RPM, step 200)
- Number of cycles (convergence criteria)
- Trace positions (where to measure pressure/temperature)

---

## 📤 OUTPUT

**EngMod4T creates multiple output files:**

### 1. `.det` File (Detailed Results)

**Purpose:** Main performance results for each RPM point

**Contains:** 24 parameters per RPM:
```
RPM, P-Av, Torque, Tex-AvC, Power(1), Power(2), ..., Power(N),
Imep(1), Bmep(1), Pmep(1), Fmep(1), Dratio(1), PurCyl(1),
PCylMax(1), TCylMax(1), TUbMax(1), Deto(1), Convergence(1), ...
```

**Use Cases:**
- Quick performance overview
- Power/torque curves
- Detonation risk check (TUbMax)
- Convergence validation

---

### 2. `.pou` File (Performance Output - Batch Runs)

**Purpose:** Extended performance parameters for multiple RPM points

**Contains:** 24-73 parameters per RPM (depends on engine type: NA/Turbo/Supercharged):
```
RPM, P-Av, Torque, Tex-AvC, Power, Imep, Bmep, Pmep, Fmep,
Dratio, Purc, Seff, Teff, Ceff, BSFC, TC-av, TUBmax, MaxDeg,
Timing, Delay, Durat, TAF, VibeDelay, VibeDurat, VibeA, VibeM

+ Turbo params (if turbocharged):
Boost, BackPr, Pratio, TBoost, TTurbine, RPMturb, WastRat

+ Supercharger params (if supercharged):
Boost, BackPr, Pratio, TBoost, RPMsup, PowSup, BOVrat
```

**Use Cases:**
- Comprehensive performance analysis
- Efficiency optimization (BSFC, Ceff, Teff)
- Combustion analysis (Vibe parameters)
- Turbo/supercharger analysis

---

### 3. `.spo` File (Single Point Output)

**Purpose:** Same as `.pou`, but for single RPM calculation (not a curve)

**Use Cases:**
- Quick what-if analysis
- Parameter sensitivity study
- Debug specific RPM point

---

### 4. Trace Files (Cycle-Resolved Data)

**Purpose:** Detailed data at every crank angle (1° resolution, 720 points per cycle)

**Trace Types:**
- **Pressure traces** - Cylinder and tract pressure vs crank angle
- **Temperature traces** - Cylinder and gas temperature vs crank angle
- **Mach traces** - Mach number in intake/exhaust tracts
- **Mass flow traces** - Mass flow rate at trace positions
- **Wave traces** - Pressure wave propagation
- **Combustion traces** - Mass fraction burned, heat release rate
- **Efficiency traces** - Scavenging, trapping efficiency
- **Turbo traces** - Boost pressure, turbo RPM vs crank angle
- **Purity traces** - Fresh charge purity

**Use Cases:**
- Valve timing optimization
- Exhaust tuning (resonance analysis)
- Intake tuning (runner length optimization)
- Combustion diagnosis
- Turbo lag analysis

---

## 🔧 KEY FEATURES

### 1. 1D Gasdynamic Simulation (Method of Characteristics)

**Purpose:** Model pressure wave propagation in intake/exhaust tracts

**How it Works:**
1. Divide intake/exhaust system into small elements (1D mesh)
2. Solve unsteady gas flow equations (Method of Characteristics)
3. Track pressure waves traveling through pipes
4. Capture resonance effects (tuned runner lengths)
5. Model wave reflections (open/closed ends, junctions, collectors)

**Why 1D (not 3D CFD)?**
- **Speed:** 1D simulation takes minutes, 3D CFD takes hours/days
- **Accuracy:** 1D is sufficient for intake/exhaust tuning (95% accuracy vs 3D)
- **Practicality:** Engineers need fast iterations for manifold design

**Key Phenomena Modeled:**
- Pressure wave reflections (positive/negative)
- Helmholtz resonance (plenum volume effects)
- Tuned runner lengths (maximize volumetric efficiency at target RPM)
- Exhaust scavenging (overlap period dynamics)
- Turbo lag (inertia of turbocharger rotor)

---

### 2. Thermodynamic Cycle Analysis

**Purpose:** Model in-cylinder processes (compression, combustion, expansion)

**Cycle Steps:**

```
1. INTAKE (BDC → IVC)
   └─ Valve flow modeling (Cd maps, lift curves)
   └─ Intake pressure/temperature from gasdynamic model

2. COMPRESSION (IVC → TDC)
   └─ Polytropic compression
   └─ Heat transfer to cylinder walls (convection)

3. COMBUSTION (TDC → ~20° ATDC)
   └─ Vibe/Wiebe model (prescribed burn rate)
   └─ Turbulent combustion model (auto-ignition)
   └─ Heat release rate calculation
   └─ Pressure rise from combustion

4. EXPANSION (Combustion end → EVO)
   └─ Polytropic expansion
   └─ Heat transfer to piston/liner
   └─ Work extraction

5. EXHAUST BLOWDOWN (EVO → BDC)
   └─ Pressure wave release to exhaust
   └─ Valve flow modeling

6. EXHAUST (BDC → EVC)
   └─ Piston pushes burned gas out
   └─ Overlap period (intake open + exhaust open)
```

**Key Phenomena Modeled:**
- Heat transfer to walls (cylinder head, piston, liner)
- Combustion duration (Vibe model parameters)
- Detonation prediction (unburned zone temperature)
- Variable valve timing (VVT, VTEC)
- Blow-by losses (piston rings)

---

### 3. Multi-Cycle Convergence

**Purpose:** Iterate until simulation reaches steady-state

**How it Works:**
1. Start with initial conditions (atmospheric pressure in manifolds)
2. Simulate first cycle → outputs differ from inputs
3. Simulate second cycle with outputs from cycle 1
4. Repeat until convergence:
   - Cylinder pressure history repeats
   - Manifold pressures stabilize
   - Power output stabilizes (cyclic variability < 0.1%)

**Convergence Criteria:**
- **NA engines:** 3-6 cycles (fast convergence)
- **Turbocharged engines:** 40+ cycles (turbo inertia delays convergence)
- **Supercharged engines:** 3-6 cycles (mechanical drive → fast)

**Convergence Indicator:** `Convergence` parameter in `.det` file
```
✅ Convergence < 0.5% → Good convergence
⚠️ Convergence = 1-2% → Acceptable (borderline)
❌ Convergence > 5% → Poor convergence (results unreliable!)
```

---

### 4. Turbocharger Modeling

**Purpose:** Model boost pressure, turbo RPM, wastegate control

**Components Modeled:**
- **Compressor:** Map-based (pressure ratio vs mass flow, efficiency)
- **Turbine:** Map-based (expansion ratio vs mass flow, efficiency)
- **Wastegate:** Pressure-actuated or electronic (boost control)
- **Intercooler:** Effectiveness model (air-to-air or air-to-water)
- **Blow-off valve:** Prevents compressor surge (throttle close event)

**Turbo Dynamics:**
1. Exhaust gas spins turbine
2. Turbine drives compressor (same shaft)
3. Compressor pressurizes intake air
4. Boost pressure increases cylinder charge
5. Higher power → more exhaust energy → higher turbo RPM
6. Wastegate opens to limit boost (prevent overboosting)

**Turbo Lag Modeling:**
- Turbo rotor inertia (J = 0.0001-0.001 kg·m²)
- Acceleration equation: `dω/dt = (Turbine Power - Compressor Power) / (J·ω)`
- Simulation shows transient response (40+ cycles for convergence)

---

### 5. Supercharger Modeling

**Purpose:** Model mechanically-driven boost

**Types Supported:**
- **Roots:** Positive displacement (volumetric flow)
- **Twin-screw:** Positive displacement with compression
- **Centrifugal:** Compressor map-based (like turbo)

**Drive System:**
- Belt/pulley drive ratio (e.g., 2.5:1 → supercharger spins 2.5× engine RPM)
- Power absorbed from crankshaft (parasitic loss)
- P-Av is NET power (Gross Power - Supercharger Power)

**Bypass Valve:**
- Mechanical boost control (spring-loaded)
- Opens at target boost pressure
- Reduces supercharger load (improves efficiency)

---

## 🔄 WORKFLOW

### Typical EngMod4T Session

```
1. PREPARE INPUT
   └─ DAT4T creates .prt file (complete engine configuration)

2. START ENGMOD4T
   └─ Load .prt file (reads configuration)
   └─ Configure simulation:
      - RPM range (e.g., 2000-7000 RPM, step 200)
      - Trace positions (cylinder, intake, exhaust)
      - Number of cycles (convergence)

3. RUN SIMULATION
   └─ Select run mode:
      - Screen run (single RPM) → .spo file
      - Batch run (multiple RPM) → .pou file
   └─ Wait for simulation to complete:
      - NA: ~1-5 minutes (fast)
      - Turbo: ~10-30 minutes (slow, 40+ cycles)

4. MONITOR CONVERGENCE
   └─ Check "Convergence" indicator during simulation
   └─ If poor convergence:
      - Increase number of cycles
      - Check for unrealistic inputs (.prt validation)

5. SIMULATION COMPLETES
   └─ EngMod4T creates output files:
      - ProjectName.det (main results)
      - ProjectName.pou (extended parameters)
      - Trace files (if requested)

6. VISUALIZE RESULTS
   └─ Post4T (OLD): Load .det/.pou files → plot curves
   └─ Engine Results Viewer (NEW): Load .det/.pou files → interactive charts

7. ITERATE DESIGN (if needed)
   └─ Go back to DAT4T → modify configuration → save .prt
   └─ Re-run EngMod4T with new .prt
   └─ Compare results (multiple calculations)
```

---

## 🔗 INTEGRATION WITH DAT4T & POST4T

**Complete Workflow:**
```
DAT4T: Configure engine
    ↓ creates
.prt file (complete configuration)
    ↓ read by
EngMod4T: Run simulation
    ↓ creates
.det, .pou, trace files (results)
    ↓ read by
Post4T / Engine Results Viewer: Visualize
    ↓ export
Plots, reports, analysis
```

**Key Points:**
- **DAT4T → EngMod4T:** One-way data flow (DAT4T creates .prt, EngMod4T reads it)
- **EngMod4T → Post4T:** One-way data flow (EngMod4T creates .det/.pou, Post4T reads it)
- **No feedback loop:** EngMod4T cannot modify .prt, Post4T cannot modify .det/.pou
- **Iterative design:** Engineer manually goes back to DAT4T to change configuration

---

## ⚠️ CRITICAL CONSTRAINTS

### 1. File Format: Fixed-Width ASCII (Delphi 7)

**Type:** Fixed-width ASCII text (**NOT** CSV, **NOT** tab-separated)

**Origin:** Delphi 7 `WriteLn(F, Format('%12.2f %12.2f ...', [values]))`

**Characteristics:**
```
     RPM        P-Av       Torque    TexAv   Power( 1)
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
P-Av         - average power (never "Мощность")
Torque       - torque (never "Момент")
PCylMax      - max cylinder pressure (never "Давление")
TCylMax      - max cylinder temperature (never "Температура")
TUbMax       - max unburned zone temperature (never "Температура несгоревшей зоны")
Deto         - detonation (never "Детонация")
Convergence  - convergence (never "Сходимость")
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
- Same user base (CIS engineers)

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

1. **EngMod4T is the simulation engine** (DAT4T configures, EngMod4T simulates, Post4T visualizes)
2. **1D gasdynamic simulation** (Method of Characteristics for wave dynamics)
3. **Multi-cycle convergence** (NA: 3-6 cycles, Turbo: 40+ cycles)
4. **Fixed-width ASCII format** (Delphi 7 origin, NOT CSV)
5. **First column is service column** (ALWAYS skip when parsing!)
6. **Parameter names ALWAYS English** (never translate)
7. **Read-only .prt input** (only DAT4T modifies .prt)
8. **Universal format for all outputs** (same parsing strategy for ~15 file types)

---

## 📊 SUMMARY TABLE

| Aspect | Details |
|--------|---------|
| **Purpose** | 1D gasdynamic & thermodynamic simulation engine |
| **Input** | `.prt` file (engine configuration from DAT4T) |
| **Output** | `.det`, `.pou`, `.spo`, trace files (results) |
| **Platform** | Windows Desktop (Delphi 7) |
| **Simulation Method** | 1D Method of Characteristics + thermodynamic cycle analysis |
| **Convergence** | Multi-cycle iteration (NA: 3-6, Turbo: 40+) |
| **File Format** | Fixed-width ASCII (Delphi `Format()` output) |
| **Parsing Rule** | ALWAYS skip first column (service column) |
| **Parameter Names** | ALWAYS English (never translate) |
| **Integration** | Reads .prt (DAT4T), creates .det/.pou (Post4T/Engine Results Viewer) |

---

## 🔗 RELATED DOCUMENTATION

- [README.md](README.md) - Suite overview
- [suite-integration.md](suite-integration.md) - Complete workflow
- [dat4t-overview.md](dat4t-overview.md) - Pre-processor
- [post4t-overview.md](post4t-overview.md) - Post-processor
- [../file-formats/README.md](../file-formats/README.md) - File formats overview
- [../PARAMETERS-REFERENCE.md](../PARAMETERS-REFERENCE.md) - 73 parameters reference

---

**Last Updated:** November 5, 2025
**Version:** 1.0.0
**Status:** Active documentation
