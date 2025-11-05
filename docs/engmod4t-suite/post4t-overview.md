# 📊 POST4T: Post-Processor Overview

**Program Type:** Post-processor / Visualization Tool (LEGACY)
**Purpose:** Visualize EngMod4T simulation results
**Platform:** Windows Desktop (Delphi 7)
**Status:** Being replaced by **Engine Results Viewer**
**Last Updated:** November 5, 2025

---

## 🎯 PURPOSE

**Post4T** is the OLD visualization tool for EngMod4T Suite. It allows engineers to:
1. Plot thermo & gasdynamic traces (9 types)
2. Analyze performance curves (Power, Torque, BSFC, efficiencies)
3. View PV-diagrams (Pressure-Volume indicator diagrams)
4. Detect detonation (unburned zone temperature analysis)
5. Post-process turbocharger data (compressor/turbine maps with operating points)
6. Analyze noise spectrum (FFT, SPL, dB(A))
7. Import measured data (dyno curves, pressure traces)
8. Compare calculated vs measured results

**Input:** `.det`, `.pou`, `.spo` files (EngMod4T outputs)

**Output:** Desktop GUI with plots, graphs, and analysis tools

**⚠️ CRITICAL:** Post4T is READ-ONLY. It NEVER modifies input files.

---

## 📥 INPUTS

**From EngMod4T:**
- **`.det` file** - Detailed trace data (pressure, temperature, Mach, mass flow at every crank angle)
- **`.pou` file** - Performance curves (batch runs: multiple RPM points)
- **`.spo` file** - Single point output (one RPM calculation)

**From User:**
- **Measured dyno data** - Import experimental power/torque curves
- **Measured trace data** - Import pressure/temperature measurements from engine testing

---

## 📤 OUTPUT

**Desktop GUI** (Windows only):
- Interactive plots (zoom, cursor line, print, save as bitmap)
- 9 trace types visualization
- Performance curve analysis
- PV-diagram overlays
- Turbo map visualization
- Noise spectrum analysis

**File Exports:**
- Bitmap images (`.bmp`)
- Print to physical printer
- NO data export (display only)

---

## 🔧 KEY FEATURES

### 1. Thermo & Gasdynamic Traces (9 Types)

**Trace Types:**

| Trace | Description | File Source |
|-------|-------------|-------------|
| **Pressure Trace** | Cylinder pressure, intake/exhaust tract pressure vs crank angle | `.det` |
| **Temperature Trace** | Cylinder temperature, intake/exhaust gas temperature vs crank angle | `.det` |
| **Mach Trace** | Mach number in intake/exhaust tracts (flow velocity analysis) | `.det` |
| **Wave Trace** | Pressure wave propagation in intake/exhaust (gasdynamic analysis) | `.det` |
| **Efficiency Trace** | Combustion efficiency, scavenging efficiency vs crank angle | `.det` |
| **Combustion Trace** | Mass fraction burned, heat release rate vs crank angle | `.det` |
| **Mass Flow Trace** | Mass flow rate in intake/exhaust ports vs crank angle | `.det` |
| **Turbo Trace** | Boost pressure, turbine inlet temperature, turbo RPM vs crank angle | `.det` |
| **Purity Trace** | Fresh charge purity (air vs burned gas) vs crank angle | `.det` |

**Trace Features:**
- Select multiple calculations for comparison
- Zoom into specific crank angle ranges
- Display cursor line with values
- Grid on/off
- Line width 1-3 pixels
- Print or save as bitmap

---

### 2. Performance & Efficiency Plots

**From `.pou` file (batch runs):**

**Power & Torque:**
- P-Av (average power) vs RPM
- Torque vs RPM
- Units: kW/Nm or HP/ft-lb

**Efficiency Parameters:**
- BSFC (Brake Specific Fuel Consumption) vs RPM
- Delivery Ratio (volumetric efficiency) vs RPM
- Purity (Purc) vs RPM
- Scavenging Efficiency (Seff) vs RPM
- Trapping Efficiency (Teff) vs RPM
- Charging Efficiency (Ceff) vs RPM

**Mean Effective Pressures:**
- IMEP (Indicated MEP) vs RPM
- BMEP (Brake MEP) vs RPM
- PMEP (Pumping MEP) vs RPM
- FMEP (Friction MEP) vs RPM

**Cylinder Parameters:**
- PCylMax (max cylinder pressure) vs RPM
- TCylMax (max cylinder temperature) vs RPM
- TUBmax (max unburned zone temperature - detonation indicator!) vs RPM
- MaxDeg (crank angle where max pressure occurs) vs RPM

**Turbo Parameters (if turbocharged):**
- Boost pressure vs RPM
- Back pressure vs RPM
- Pressure ratio (Pratio) vs RPM
- Turbo inlet temperature (TTurbine) vs RPM
- Turbo RPM (RPMturb) vs RPM
- Wastegate opening ratio (WastRat) vs RPM

**Supercharger Parameters (if supercharged):**
- Boost pressure vs RPM
- Supercharger RPM (RPMsup) vs RPM
- Power absorbed (PowSup) vs RPM
- Blow-off valve ratio (BOVrat) vs RPM

**Plot Features:**
- Load multiple `.pou` files for comparison
- Select specific traces from each file
- Overlay calculated vs measured curves
- Display cursor line with RPM and values
- Zoom into specific RPM ranges

---

### 3. PV-Diagrams (Pressure-Volume)

**Purpose:** Classic indicator diagram showing cylinder pressure vs volume

**Features:**
- Plot all cylinders simultaneously
- Compare multiple calculations
- Overlay measured PV-diagrams
- Identify pumping loop (intake/exhaust strokes)
- Analyze compression/expansion strokes

**Use Cases:**
- Validate combustion model
- Check valve timing effects
- Analyze pumping losses
- Compare NA vs turbo/supercharged

---

### 4. Detonation Analysis

**Purpose:** Predict engine knock (detonation)

**Key Indicator:** TUBmax (maximum unburned zone temperature)

**How it Works:**
1. EngMod4T calculates unburned zone temperature during combustion
2. Post4T plots TUBmax vs RPM
3. Engineer compares TUBmax to fuel knock threshold:
   - **RON 95:** TUBmax < ~700°C (safe)
   - **RON 95:** TUBmax > 750°C (detonation risk!)
   - **RON 98+:** Higher thresholds

**Detonation Indicators:**
```
✅ SAFE:
TUBmax = 680°C → No detonation risk
MaxDeg = 10° ATDC → Good combustion phasing

⚠️ BORDERLINE:
TUBmax = 720°C → Retard ignition timing or increase octane

❌ DETONATION RISK:
TUBmax = 780°C → WILL DETONATE! Fix immediately:
- Retard ignition timing
- Enrich mixture (lower λ)
- Increase octane rating
- Reduce boost pressure (turbo)
```

---

### 5. Turbocharger Post-Processing

**Purpose:** Visualize turbo operating points on compressor/turbine maps

**Features:**
- Load compressor map (from DAT4T library: Garrett, BorgWarner, Holset, etc.)
- Load turbine map
- Overlay calculated operating points from `.pou` file
- Show operating line (path across RPM range)
- Check if operating points are within map boundaries

**Use Cases:**
- Validate turbo sizing (is turbo too small/large?)
- Check compressor efficiency at operating points
- Identify surge/choke conditions
- Optimize wastegate strategy

**Example:**
```
Compressor Map: Garrett GT2860RS
RPM Range: 2000-7000 RPM
Operating Points: 7 points plotted
Result: All points within efficiency island 70-75% ✅
Conclusion: Good turbo match!
```

---

### 6. Noise Spectrum Processing

**Purpose:** Analyze exhaust noise (acoustic analysis)

**Features:**
- FFT (Fast Fourier Transform) analysis of exhaust outlet pressure trace
- Calculate SPL (Sound Pressure Level) vs frequency
- Overall SPL (dB-Linear or dB(A) A-weighted)
- Identify dominant frequencies (firing order, harmonics)

**Use Cases:**
- Predict exhaust noise level
- Design silencer/muffler (target frequencies)
- Optimize firing order
- Validate NVH targets

---

### 7. Import Measured Data

**Two Import Types:**

**A. Measured Power Curve:**
- Import dyno data (RPM, Power, Torque)
- Overlay on calculated curves
- Validate simulation accuracy

**B. Measured Trace Data:**
- Import pressure/temperature traces (experimental data)
- Compare calculated vs measured traces
- Calibrate combustion model

**File Format:**
- User creates `.txt` file with measured data
- Post4T converts to internal format
- Can overlay multiple measured datasets

---

## 🗂️ FILE FORMATS POST4T READS

### .det File (Detailed Trace Data)

**Purpose:** Cycle-resolved data (every crank angle)

**Contains:**
- Pressure, temperature, Mach, mass flow at trace positions
- 720 data points per cycle (1° resolution)
- Multiple cycles stored (convergence check)

**Structure:**
```
Line 1: Metadata (cylinders, trace positions, etc.)
Line 2: Column headers (Pressure, Temperature, Mach, etc.)
Line 3: Marker ($1, $2, ...) + data rows
```

**⚠️ CRITICAL:** First column is SERVICE column (line number). Post4T must skip it!

**Post4T Usage:**
- Plot Pressure/Temperature/Mach traces
- Select specific trace position
- Select specific cycle
- Zoom into crank angle range

---

### .pou File (Performance Output - Batch Runs)

**Purpose:** Performance curves (multiple RPM points)

**Contains:**
- 24-73 parameters per RPM point (depends on engine type: NA/Turbo/Supercharged)
- Appending file (each calculation adds rows)
- Multiple calculation markers ($1, $2, ...)

**Key Parameters (see [suite-integration.md](suite-integration.md) for full list):**
```
RPM, P-Av, Torque, Tex-AvC, Power, Imep, Bmep, Pmep, Fmep,
Dratio, Purc, Seff, Teff, Ceff, BSFC, TC-av, TUBmax, MaxDeg,
Timing, Delay, Durat, TAF, VibeDelay, VibeDurat, VibeA, VibeM

(+ Turbo params: Boost, BackPr, Pratio, TBoost, TTurbine, RPMturb, WastRat)
(+ Supercharger params: Boost, BackPr, Pratio, TBoost, RPMsup, PowSup, BOVrat)
```

**⚠️ CRITICAL:** First column is SERVICE column. Post4T must skip it!

**Post4T Usage:**
- Plot performance curves (P-Av, Torque, BSFC, etc. vs RPM)
- Overlay multiple calculations
- Compare calculated vs measured

---

### .spo File (Single Point Output)

**Purpose:** Single RPM calculation (not a curve)

**Contains:** Same parameters as `.pou`, but only ONE RPM point

**Post4T Usage:**
- View single point data (not plotted as curve)
- Compare multiple single points

---

## 🔄 WORKFLOW

### Typical Post4T Session

```
1. START POST4T
   └─ Click Post4T icon

2. LOAD PERFORMANCE DATA (.pou)
   └─ Plot Options → Performance and Efficiency Plots
   └─ Add Performance File → Select .pou file
   └─ Select traces (P-Av, Torque, BSFC, etc.)
   └─ Click OK → Plot displayed

3. LOAD MEASURED DATA (optional)
   └─ Add measured power curve
   └─ Overlay on calculated curve

4. ANALYZE PERFORMANCE
   └─ Check peak power RPM
   └─ Check torque curve shape
   └─ Check BSFC (fuel efficiency)
   └─ Check TUBmax (detonation risk!)

5. LOAD TRACE DATA (.det)
   └─ Plot Options → Thermo- and Gasdynamic Traces
   └─ Select trace type (Pressure, Temperature, etc.)
   └─ Select trace position (cylinder, intake, exhaust)
   └─ Select cycle (last cycle recommended)
   └─ Click OK → Plot displayed

6. ANALYZE TRACES
   └─ Check cylinder pressure peak
   └─ Check exhaust temperature
   └─ Check valve timing effects

7. PV-DIAGRAMS (optional)
   └─ Plot Options → PV-Diagrams
   └─ Load PV-diagram file
   └─ Analyze pumping loop

8. TURBO POST-PROCESSING (if turbocharged)
   └─ Plot Options → Turbocharger Map Plot
   └─ Load compressor/turbine map
   └─ Overlay operating points
   └─ Check efficiency and surge margin

9. NOISE ANALYSIS (optional)
   └─ Plot Options → Noise Spectrum Processing
   └─ Run FFT on exhaust outlet trace
   └─ Calculate SPL vs frequency

10. EXPORT (optional)
    └─ File → Save (bitmap)
    └─ File → Print

11. EXIT POST4T
```

---

## 🔗 INTEGRATION WITH ENGMOD4T

**EngMod4T → Post4T Flow:**
```
EngMod4T: Run simulation
    ↓ creates
.det, .pou files
    ↓ read by
Post4T: Load files
    ↓ visualize
Desktop GUI plots
    ↓ export
Bitmap images or print
```

**Key Points:**
- Post4T **reads** .det/.pou files (does NOT modify)
- EngMod4T is the **ONLY** program that creates .det/.pou
- Post4T is READ-ONLY visualizer

---

## ⚠️ LIMITATIONS (Why Replacement Needed)

### 1. Desktop-Only
- **Problem:** Windows desktop app (Delphi 7)
- **Impact:** Cannot run on macOS/Linux, no web access
- **Solution:** Engine Results Viewer is web-based (cross-platform)

### 2. Single Project at a Time
- **Problem:** Can only load ONE .pou file at a time
- **Impact:** Cannot compare multiple engine configurations easily
- **Solution:** Engine Results Viewer supports unlimited calculations per project

### 3. No Cross-Project Comparison
- **Problem:** Cannot compare Project A vs Project B
- **Impact:** Engineer must manually export bitmaps and compare side-by-side
- **Solution:** Engine Results Viewer has multi-project dashboard

### 4. Limited Interactivity
- **Problem:** Basic zoom, no hover tooltips, no dynamic legends
- **Impact:** Poor user experience
- **Solution:** Engine Results Viewer uses modern ECharts (interactive, responsive)

### 5. No Modern UI
- **Problem:** Windows 95-style UI (outdated)
- **Impact:** Difficult to navigate, not intuitive
- **Solution:** Engine Results Viewer has modern React + TailwindCSS UI

### 6. No Data Export
- **Problem:** Can only save as bitmap (no CSV, no JSON)
- **Impact:** Cannot process data further (Excel, MATLAB, Python)
- **Solution:** Engine Results Viewer will support data export (future feature)

### 7. No Batch Comparison
- **Problem:** Must manually load each calculation
- **Impact:** Time-consuming for 10+ calculations
- **Solution:** Engine Results Viewer auto-detects all calculations in .pou file

### 8. No Preset Comparison Charts
- **Problem:** Must manually select same parameters for each comparison
- **Impact:** Inconsistent comparisons, no standardized workflow
- **Solution:** Engine Results Viewer has 6 chart presets (Power & Torque, Efficiencies, Temperatures, Pressures, Detonation Risk, Turbo Analysis)

---

## 🚀 ENGINE RESULTS VIEWER: THE REPLACEMENT

**What Engine Results Viewer Adds:**

| Feature | Post4T | Engine Results Viewer |
|---------|--------|----------------------|
| **Platform** | Windows Desktop | Web (cross-platform) |
| **Multi-Calculation** | Manual load | Auto-detect all calculations |
| **Cross-Project** | ❌ No | ✅ Yes (dashboard) |
| **Chart Presets** | ❌ No | ✅ Yes (6 presets) |
| **Modern UI** | Windows 95 style | React + TailwindCSS |
| **Interactivity** | Basic zoom | ECharts (hover, legend toggle, dynamic axes) |
| **Data Export** | Bitmap only | CSV, JSON (future) |
| **File Formats** | .det, .pou | .det, .pou (+ .prt planned) |
| **Trace Types** | 9 types | 9 types (+ more planned) |
| **Measured Data** | Import only | Import + overlay (future) |

**What Post4T Does Better:**
- PV-Diagrams (Engine Results Viewer doesn't support yet)
- Noise Spectrum Processing (Engine Results Viewer doesn't support yet)
- Turbo Map Visualization (Engine Results Viewer planned)

---

## 📚 DETAILED DOCUMENTATION

**For comprehensive Post4T documentation:**
- [../../_personal/Post4THelp-chapters/](../../_personal/Post4THelp-chapters/)
- 23 chapters, ~2 MB with images

**Chapter Guide:**
- **01-CombustionTrace** - Combustion process visualization
- **02-Detonation** - Knock detection and analysis
- **04-EffTrace** - Efficiency parameters
- **07-MachTrace** - Mach number analysis
- **08-MassTrace** - Mass flow rate visualization
- **09-MeasuredPower** - Import dyno data
- **10-MeasuredTrace** - Import experimental traces
- **11-NoiseLevel** - Acoustic analysis (FFT, SPL)
- **12-PV-Diagrams** - Pressure-Volume indicator diagrams
- **13-PerformanceAndEfficiency** - Power/torque curves (⭐ most used!)
- **14-PerformanceFile** - .pou file format reference
- **15-PressureTrace** - Cylinder and tract pressure
- **17-Starting** - How to use Post4T
- **18-TemperatureTrace** - Cylinder and gas temperature
- **19-ThermoAndGasdynamic** - Overview of trace types
- **20-TurboTrace** - Turbo parameters vs crank angle
- **21-TurbochargerPost** - Turbo map post-processing
- **22-VibeCombustionFile** - Vibe model calibration
- **23-WaveTrace** - Pressure wave propagation

---

## 🎓 KEY TAKEAWAYS

1. **Post4T is READ-ONLY** (never modifies input files)
2. **9 trace types** (pressure, temperature, Mach, wave, efficiency, combustion, mass, turbo, purity)
3. **Performance curve analysis** (P-Av, Torque, BSFC, efficiencies vs RPM)
4. **Detonation detection** (TUBmax is key indicator!)
5. **Turbo post-processing** (operating points on compressor/turbine maps)
6. **Desktop-only** (Windows, Delphi 7 - outdated)
7. **Being replaced** (Engine Results Viewer is modern web-based alternative)
8. **First column is SERVICE column** (must skip when parsing!)

---

## 📊 SUMMARY TABLE

| Aspect | Details |
|--------|---------|
| **Purpose** | Post-processor (visualize EngMod4T results) |
| **Input** | `.det`, `.pou`, `.spo` files (EngMod4T outputs) |
| **Output** | Desktop GUI plots (bitmap export) |
| **Platform** | Windows Desktop (Delphi 7) |
| **Status** | LEGACY - being replaced by Engine Results Viewer |
| **Key Features** | 9 trace types, performance curves, PV-diagrams, detonation, turbo post, noise analysis |
| **Integration** | Reads .det/.pou files (one-way: EngMod4T → Post4T) |
| **Limitations** | Desktop-only, single project, no cross-project comparison, outdated UI |
| **Replacement** | Engine Results Viewer (web-based, modern UI, multi-project) |

---

## 🔗 RELATED DOCUMENTATION

- [README.md](README.md) - Suite overview
- [suite-integration.md](suite-integration.md) - Complete workflow
- [dat4t-overview.md](dat4t-overview.md) - Pre-processor
- [engmod4t-overview.md](engmod4t-overview.md) - Simulation engine
- [../../_personal/Post4THelp-chapters/](../../_personal/Post4THelp-chapters/) - Detailed Post4T documentation

---

**Last Updated:** November 5, 2025
**Version:** 1.0.0
**Status:** Active documentation
