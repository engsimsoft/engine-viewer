# 🔧 DAT4T: Pre-Processor Overview

**Program Type:** Pre-processor / Configuration Tool
**Purpose:** Configure engine parameters before simulation
**Platform:** Windows Desktop (Delphi 7)
**Last Updated:** November 5, 2025

---

## 🎯 PURPOSE

**DAT4T** is the pre-processor for EngMod4T Suite. It allows engineers to:
1. Define engine geometry (bore, stroke, compression ratio, cylinders)
2. Design intake manifold (40+ configurations)
3. Design exhaust manifold (60+ configurations)
4. Configure turbocharger/supercharger
5. Set up valves and lift profiles (VVT, VTEC support)
6. Select combustion model (Vibe, Wiebe, etc.)
7. Set atmospheric conditions

**Output:** `.prt` file (complete engine configuration) ready for EngMod4T simulation.

---

## 📥 INPUTS

**New Project:**
- Empty template
- User manually configures all parameters

**Existing Project:**
- `.prt` file (previously saved configuration)
- User modifies parameters
- Saves updated `.prt`

---

## 📤 OUTPUT

**`.prt` File Format:**
- Type: Fixed-width ASCII text (Delphi 7 Format)
- Encoding: Windows-1251 (Cyrillic support)
- Contains: Complete engine configuration

**What's Inside .prt:**
- Engine Data (cylinders, bore, stroke, CR, type)
- Turbo/Supercharger settings (maps, wastegate, boost control)
- Intake manifold configuration (runners, plenum, throttle, intercooler)
- Exhaust manifold configuration (primaries, collector, silencer)
- Valve & lift profile data (diameter, lift curve, VVT/VTEC)
- Combustion model parameters (Vibe, Wiebe, ignition timing)
- Temperature & atmospheric conditions

---

## 🔧 KEY FEATURES

### 1. Engine Data (Chapter 03)

**Basic Parameters:**
- Cylinders: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16
- Engine Types: Inline, V-engine, Flat, Radial
- Bore: 40-150 mm
- Stroke: 40-200 mm
- Compression Ratio: 6-15
- Connecting Rod Length

**Cylinder Numbering:**
- Inline: 1-2-3-4
- V-engine: Front bank (1,3,5,7), Rear bank (2,4,6,8)
- Flat: Left bank, Right bank

**Trace Positions:** Where to measure pressure/temperature in intake/exhaust

---

### 2. Turbocharger/Supercharger (Chapter 04)

**Turbocharger:**
- Compressor map selection (Garrett, BorgWarner, Holset, etc.)
- Turbine map selection
- Wastegate configuration (pressure actuated or electronic)
- Boost control strategy
- Intercooler modeling (air-to-air, air-to-water, efficiency %)
- Blow-off valve (BoV) settings

**Supercharger:**
- Blower types: Roots, Twin-screw, Centrifugal
- Drive ratio calculation (pulley sizes)
- Boost control (bypass valve)
- Intercooler (optional)
- Efficiency maps

---

### 3. Ports, Valves, Lift Profiles (Chapter 05)

**Valve Configuration:**
- Intake valve diameter: 20-60 mm
- Exhaust valve diameter: 20-60 mm
- Seat angle: 30°, 45°, 60°
- Valve masking (none, partial, severe)

**Lift Profiles:**
- Generate synthetic cam (duration, lift, lobe center)
- Import measured cam data (lift vs crank angle)
- VVT (Variable Valve Timing): advance/retard range
- VTEC/VVL: Two-stage cam profiles
- IVO, IVC, EVO, EVC timing

**Cd-Maps (Flow Coefficients):**
- Measured flow bench data
- Cd vs lift curve
- Import from file or use built-in

---

### 4. Exhaust Subsystem (Chapter 06) - 60+ Configurations!

**Manifold Types:**

**4-Cylinder:**
- 4-into-1 (merge collector, taper collector, straight collector)
- 4-2-1 (tri-Y design, various primary/secondary lengths)
- Log manifold (turbo applications)
- Siamesed ports (2-into-1 per cylinder pair)

**V8:**
- 8-into-1 (single plane)
- 8-into-2 (dual plane, two banks)
- 8-4-2-1 (complex merge)
- Log manifolds (twin turbo)
- Siamesed configurations

**I6:**
- 6-into-1 (single collector)
- 6-into-3-into-1 (tri-Y design)
- Log manifolds (turbo, central or end-mounted)

**Advanced Features:**
- Primary tube length, diameter (stepped pipes supported!)
- Collector type (merge, taper, straight, T-junction, X-collector)
- Silencers (7 types: absorption, diffusing, plenum, multi-plenum, resonant, speedway, butted)
- Catalytic converter modeling
- Anti-reversion devices

---

### 5. Intake Subsystem (Chapter 07) - 40+ Configurations!

**Manifold Types:**

**4-Cylinder:**
- Individual Throttle Bodies (ITB) - 4 separate throttles
- Plenum + Collector - single throttle, common plenum
- Log manifold (NA or turbo + intercooler)
- Variable length intake (resonant tuning)

**V8:**
- Single plane (8-into-1 plenum)
- Dual plane (4-into-1 per bank, cross-ram possible)
- Tunnel ram (dual plenums, adjacent or separate runners)
- Independent runners (8 ITBs or common plenum per bank)

**I6:**
- Central log plenum
- End-mounted log (turbo applications)
- Siamesed intake (pairs of cylinders)

**Advanced Features:**
- Runner length, diameter (variable length supported)
- Plenum volume calculation
- Throttle diameter (single or per-cylinder)
- Intercooler (turbo applications: air-to-air, air-to-water, tank-and-tube)
- Resonators (Helmholtz resonators for noise)

---

### 6. Combustion & Ignition (Chapter 08)

**Combustion Models:**
- Vibe (single or dual Vibe)
- Wiebe
- Turbulent combustion (eddy breakup model)
- Knock detection

**Ignition:**
- Spark ignition: timing map (MBT, borderline)
- Compression ignition: auto-ignition modeling
- Fuel type: RON 91, 95, 98, 100+, E85, methanol
- Air-fuel ratio (λ = 0.8-1.2, rich/stoic/lean)

---

### 7. Temperatures & Atmospheric (Chapter 09)

**Ambient Conditions:**
- Temperature: -40°C to +60°C
- Pressure: 50-110 kPa (altitude compensation)
- Humidity: 0-100%

**Wall Temperatures:**
- Cylinder head: 80-150°C
- Piston crown: 200-400°C
- Liner: 80-120°C
- Intake ports: 40-80°C
- Exhaust ports: 400-800°C

---

## 🗂️ .PRT FILE STRUCTURE

**Purpose:** "Printable summary of all subsystems" (as per DAT4T docs)

**Contains:**
- All parameters from DAT4T GUI
- Formatted as fixed-width ASCII
- Human-readable (can view in text editor)
- Machine-readable (parsed by EngMod4T)

**File Sections:**
```
[Engine Data]
Cylinders, Bore, Stroke, CR, etc.

[Intake Subsystem]
Manifold type, runner dimensions, plenum volume, etc.

[Exhaust Subsystem]
Manifold type, primary dimensions, collector, etc.

[Turbocharger]
Compressor map, turbine map, wastegate, etc.

[Valves & Lift Profiles]
Valve diameters, lift curves, VVT settings, etc.

[Combustion]
Model type, fuel, ignition timing, etc.

[Atmospheric]
Temperature, pressure, humidity, etc.
```

**Future Support:** Engine Results Viewer plans to parse `.prt` for project metadata (auto-populate cards on main page).

---

## 🔄 WORKFLOW

### Typical DAT4T Session

```
1. START DAT4T
   └─ Open existing project or create new

2. CONFIGURE ENGINE DATA
   └─ Set bore, stroke, cylinders, CR

3. DESIGN INTAKE SYSTEM
   └─ Choose manifold type (ITB, plenum, log)
   └─ Set runner lengths, diameters
   └─ Configure plenum/throttle
   └─ Add intercooler (if turbo)

4. DESIGN EXHAUST SYSTEM
   └─ Choose manifold type (4-1, 4-2-1, log)
   └─ Set primary lengths, diameters
   └─ Configure collector type
   └─ Add silencer/catalyst

5. CONFIGURE TURBO/SUPERCHARGER (if applicable)
   └─ Select compressor/turbine maps
   └─ Set wastegate/boost control

6. SET UP VALVES & CAMS
   └─ Valve diameters
   └─ Import/generate lift profiles
   └─ Configure VVT/VTEC (if applicable)

7. SELECT COMBUSTION MODEL
   └─ Vibe, Wiebe, or turbulent
   └─ Set fuel type, ignition timing

8. SET CONDITIONS
   └─ Ambient temperature, pressure
   └─ Wall temperatures

9. SAVE PROJECT
   └─ Generates/updates .prt file
   └─ File saved to C:/4Stroke/ProjectName/ProjectName.prt

10. EXIT DAT4T
    └─ Ready for EngMod4T simulation
```

---

## 🔗 INTEGRATION WITH ENGMOD4T

**DAT4T → EngMod4T Flow:**
```
DAT4T: Save Project
    ↓ creates
.prt file (complete configuration)
    ↓ read by
EngMod4T: Load .prt
    ↓ parse configuration
    ↓ run simulation
    ↓ output results
.det, .pou, trace files
```

**Key Points:**
- EngMod4T **reads** .prt file (does NOT modify)
- DAT4T is the **ONLY** program that creates/modifies .prt
- .prt is READ-ONLY for EngMod4T and visualizers

---

## ⚠️ CRITICAL CONSTRAINTS

### 1. File Format

**Type:** Fixed-width ASCII (Delphi 7 `Format()` output)
- NOT CSV, NOT tab-separated
- Multiple spaces for column alignment
- Windows-1251 encoding (Cyrillic metadata)
- CRLF line endings

### 2. File Ownership

**Rule:** Only DAT4T can create/modify .prt files.

**Other programs:**
- EngMod4T: **READ-ONLY** (parses .prt)
- Engine Results Viewer (future): **READ-ONLY** (parse metadata only)

### 3. Configuration Completeness

**Rule:** .prt must be COMPLETE before EngMod4T can simulate.

**Missing parameters:** EngMod4T will fail or use defaults (not recommended).

---

## 📚 DETAILED DOCUMENTATION

**For comprehensive DAT4T documentation:**
- [../../_personal/Dat4THelp-chapters/](../../_personal/Dat4THelp-chapters/)
- 11 chapters, 4,884 lines, 35 MB with images

**Chapter Guide:**
- **01-Introduction** - Project structure, file types
- **02-Starting** - Create/open projects, workflow
- **03-Engine-Data** - Bore, stroke, cylinders, CR
- **04-Turbocharger-Supercharger** - Turbo/blower setup
- **05-Ports-Valves-Lift-Profiles** - Valves, cams, VVT/VTEC (1,018 lines!)
- **06-Exhaust-Subsystem** - 60+ manifold configurations (1,182 lines!)
- **07-Intake-Subsystem** - 40+ manifold configurations (1,056 lines!)
- **08-Combustion-Ignition** - Vibe, Wiebe, fuel, ignition
- **09-Temperatures-Atmospheric** - Ambient & wall temps
- **10-Design-Verification** - STA (static timing analysis)
- **11-References** - Gordon P Blair methodology

---

## 🎓 KEY TAKEAWAYS

1. **DAT4T is the ONLY source of .prt files** (file ownership)
2. **40+ intake + 60+ exhaust configurations** (comprehensive manifold library)
3. **VVT/VTEC support** (modern engine features)
4. **Turbo & supercharger modeling** (compressor/turbine maps, boost control)
5. **Fixed-width ASCII format** (.prt uses same format as .det/.pou)
6. **EngMod4T reads .prt** (one-way data flow: DAT4T → EngMod4T)
7. **No feedback loop** (EngMod4T cannot modify .prt)

---

## 📊 SUMMARY TABLE

| Aspect | Details |
|--------|---------|
| **Purpose** | Pre-processor (configure engine before simulation) |
| **Input** | User configuration (GUI) or existing .prt |
| **Output** | `.prt` file (complete engine configuration) |
| **Platform** | Windows Desktop (Delphi 7) |
| **File Format** | Fixed-width ASCII, Windows-1251 |
| **Key Features** | 40+ intake, 60+ exhaust configs, turbo, VVT/VTEC |
| **Integration** | Creates .prt → EngMod4T reads it (one-way) |
| **Constraints** | ONLY DAT4T can modify .prt files |

---

## 🔗 RELATED DOCUMENTATION

- [README.md](README.md) - Suite overview
- [suite-integration.md](suite-integration.md) - Complete workflow
- [engmod4t-overview.md](engmod4t-overview.md) - Simulation engine
- [post4t-overview.md](post4t-overview.md) - Post-processor
- [../../_personal/Dat4THelp-chapters/](../../_personal/Dat4THelp-chapters/) - Detailed DAT4T documentation

---

**Last Updated:** November 5, 2025
**Version:** 1.0.0
**Status:** Active documentation
