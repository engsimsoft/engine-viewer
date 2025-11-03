# Chart Presets Documentation

**Version:** v2.0.0
**Last Updated:** 2025-11-02
**Purpose:** Complete reference for all chart presets, their engineering significance, and implementation patterns

---

## Overview

Engine Results Viewer provides **6 specialized chart presets** for analyzing ICE simulation results. Each preset groups parameters that engineers analyze together, following real-world workflows.

**Design Philosophy:**
- **Minimalism over clutter** - Only essential information on axes and legends
- **Engineering conventions** - Parameter names always in English (never translated)
- **Professional appearance** - Clean, technical plotting style
- **iPhone quality** - Every detail matters (axis labels, line styles, colors)

---

## Preset 1: Power & Torque

**File:** `frontend/src/components/visualization/ChartPreset1.tsx`

### Purpose
Most important chart for engine analysis - shows **power curve** and **torque curve** across RPM range.

### Parameters
- **P-Av** (Average Power) - kW, convertible to bhp/PS
- **Torque** - N·m, convertible to lb-ft

### Chart Configuration

**Dual Y-Axis:**
```typescript
yAxis: [
  { name: 'P-Av (kW)', position: 'left' },   // Power
  { name: 'Torque (N·m)', position: 'right' } // Torque
]
```

**Line Styles:**
- P-Av: Solid line (`type: 'solid'`)
- Torque: Dashed line (`type: 'dashed'`)

**Color System:**
- **Single calculation mode:** Uses `PARAMETER_COLORS` (Red for P-Av, Green for Torque)
- **Comparison mode:** Uses `calc.color` from `CALCULATION_COLORS` palette

**Custom Legend:**
- Interactive graphic legend (not default ECharts legend)
- Format: `{calcName} - {paramName}`
- Example: `"Vesta 1.6 IM - P-Av"`

### Engineering Significance

**Why Power & Torque together?**
- Most fundamental engine characteristics
- Power curve shows performance at high RPM (acceleration, top speed)
- Torque curve shows low-end grunt (acceleration from standstill, towing)
- **Peak Power RPM ≠ Peak Torque RPM** - This relationship is critical for tuning

**User Workflow:**
1. Check peak power (kW) and RPM where it occurs
2. Check peak torque (N·m) and RPM where it occurs
3. Compare torque curve shape (flat = flexible, peaky = race engine)
4. In comparison mode: Compare multiple tuning variants

---

## Preset 2: Pressure & Temperature

**File:** `frontend/src/components/visualization/ChartPreset2.tsx`

### Purpose
Shows **thermal and pressure loads** on engine components - critical for durability analysis.

### Parameters
- **PCylMax** (Max Cylinder Pressure) - bar, convertible to psi
- **TCylMax** (Max Cylinder Temperature) - °C, convertible to °F
- **TUbMax** (Max Exhaust Temperature) - °C, convertible to °F

**Note:** PCylMax, TCylMax are per-cylinder arrays → Chart displays **averaged values**.

### Chart Configuration

**Dual Y-Axis:**
```typescript
yAxis: [
  { name: 'Pressure (bar)', position: 'left' },      // PCylMax
  { name: 'Temperature (°C)', position: 'right' }     // TCylMax, TUbMax
]
```

**Line Styles:**
- PCylMax: Solid (pressure)
- TCylMax: Dashed (cylinder temperature)
- TUbMax: Dotted (exhaust temperature)

### Engineering Significance

**Why these three together?**
- **PCylMax:** High pressure → mechanical stress on pistons, rings, head gasket
  - Limit: ~180-200 bar for gasoline, ~220-250 bar for diesel
  - Exceeding limit → blown head gasket, cracked pistons

- **TCylMax:** High temperature → thermal stress, knock risk
  - Limit: ~2500-2800°C peak combustion temperature
  - Exceeding limit → melted pistons, valve burning

- **TUbMax:** Exhaust temperature → turbo durability, catalytic converter
  - Limit: ~850-950°C for turbo inlet (depends on material)
  - Exceeding limit → turbo failure

**User Workflow:**
1. Check PCylMax never exceeds material limits
2. Check TCylMax for knock risk (correlate with Deto parameter)
3. Check TUbMax for turbo/exhaust system durability
4. In comparison mode: Compare conservative vs aggressive tuning

---

## Preset 3: Mean Effective Pressures (MEP)

**File:** `frontend/src/components/visualization/ChartPreset3.tsx`

### Purpose
**Efficiency analysis** - shows how effectively engine converts fuel energy into mechanical work.

### Parameters
- **FMEP** (Friction Mean Effective Pressure) - bar
- **IMEP** (Indicated Mean Effective Pressure) - bar
- **BMEP** (Brake Mean Effective Pressure) - bar
- **PMEP** (Pumping Mean Effective Pressure) - bar

**All are scalar values** (not per-cylinder arrays).

### Chart Configuration

**Single Y-Axis:**
```typescript
yAxis: { name: 'Pressure (bar)' }
```

**Line Styles:**
- All solid lines (same importance)
- Distinguished by color only

### Engineering Significance

**What is MEP?**
Mean Effective Pressure = hypothetical constant pressure that would produce the same work per cycle.

**Why these four together?**

```
IMEP = BMEP + FMEP + PMEP
```

- **IMEP:** Theoretical work from combustion (if no losses)
- **BMEP:** Actual work delivered to crankshaft (measured on dyno)
- **FMEP:** Losses from friction (pistons, bearings, valvetrain)
- **PMEP:** Losses from pumping air through engine (intake/exhaust restriction)

**User Workflow:**
1. High BMEP = efficient engine (more usable work)
2. High FMEP = friction losses (need better lubrication, lighter pistons)
3. High PMEP = breathing restrictions (improve intake/exhaust flow)
4. Goal: Maximize BMEP, minimize FMEP and PMEP

**Typical values:**
- Naturally aspirated gasoline: BMEP ~10-12 bar
- Turbocharged gasoline: BMEP ~15-25 bar
- Diesel: BMEP ~18-30 bar

---

## Preset 4: Critical Values (⚠️ Engine Destruction Risk)

**File:** `frontend/src/components/visualization/ChartPreset4.tsx`

### Purpose
**SAFETY CRITICAL** - Shows parameters that can **destroy the engine** if limits are exceeded.

**Russian name:** "Критические значения" (очень важный preset!)

### Parameters
- **PCylMax** (Max Cylinder Pressure) - bar, convertible to psi
- **MaxDeg** (Maximum Detonation Degree) - dimensionless (0-1 scale)

**Both are per-cylinder arrays** → Chart displays **averaged values**.

### Chart Configuration

**Dual Y-Axis:**
```typescript
yAxis: [
  { name: 'Pressure (bar)', position: 'left' },    // PCylMax
  { name: 'Detonation Degree', position: 'right' } // MaxDeg
]
```

### Engineering Significance

**⚠️ Why "Critical"?**

**PCylMax (Cylinder Pressure):**
- Too high → **Blown head gasket, cracked piston, broken connecting rod**
- Catastrophic failure mode
- Limits:
  - Gasoline: ~180-200 bar (street), ~250 bar (race)
  - Diesel: ~220-250 bar (street), ~300+ bar (heavy duty)

**MaxDeg (Detonation):**
- Knock/detonation = uncontrolled combustion
- **Even brief detonation can destroy engine in seconds**
- Causes:
  - Too much ignition advance
  - Too lean mixture
  - Too low octane fuel
  - Excessive boost pressure
- Damage: Melted piston crown, broken ring lands, destroyed bearings

**User Workflow:**
1. **Check PCylMax < material limit** (or reduce boost/compression)
2. **Check MaxDeg < 0.1** (any higher = danger zone)
3. If MaxDeg high at certain RPM → retard ignition timing at that point
4. In comparison mode: Verify safety margins across tuning variants

**This preset answers:** *"Will this tune kill my engine?"*

---

## Preset 5: Volumetric Efficiency & Fill Quality

**File:** `frontend/src/components/visualization/ChartPreset5.tsx`

### Purpose
Shows how well engine **breathes** (intake/exhaust flow efficiency).

### Parameters
- **PurCyl** (Cylinder Charge Purity) - dimensionless ratio
- **LamAv** (Average Lambda) - dimensionless ratio (air/fuel ratio)

### Chart Configuration

**Single Y-Axis:**
```typescript
yAxis: { name: 'Ratio' }
```

### Engineering Significance

**PurCyl (Charge Purity):**
- Ratio of fresh charge to total cylinder contents
- Higher = better scavenging (less exhaust gas residuals)
- Typical: 0.85-0.95 for naturally aspirated, 0.95-1.0 for turbocharged

**LamAv (Lambda):**
- λ = 1.0: stoichiometric (perfect air/fuel ratio)
- λ < 1.0: rich (excess fuel, more power, cooler combustion)
- λ > 1.0: lean (excess air, better efficiency, hotter combustion)

**User Workflow:**
1. Low PurCyl → improve exhaust scavenging (better exhaust manifold, cams)
2. LamAv analysis:
   - Peak power: typically λ = 0.85-0.90 (rich for cooling)
   - Cruise: λ = 1.0-1.05 (lean for efficiency)
   - Check lambda doesn't go too lean (knock risk)

---

## Preset 6: Custom (User-Defined)

**File:** `frontend/src/components/visualization/ChartPreset6.tsx`

### Purpose
Allows user to select **any parameters** from available 73 parameters (.det + .pou).

### Implementation
**Modal-based parameter selector** with categories:
- Performance (Power, Torque, etc.)
- Pressure (PCylMax, BMEP, IMEP, etc.)
- Temperature (TCylMax, TUbMax, etc.)
- Efficiency (PurCyl, LamAv, etc.)
- Combustion (MaxDeg, Convergence, etc.)

**Axis Assignment:**
- Single Y-axis: All parameters must have same unit
- Dual Y-axis: User assigns parameters to left/right axes
- Unit conversion: Applied automatically based on Settings

### User Workflow
1. Click "Configure Parameters" button
2. Select up to 6 parameters from modal
3. Assign to left/right axis (if different units)
4. Chart updates automatically

**Use cases:**
- Advanced analysis (parameters not in standard presets)
- Research (exploring correlations between unusual parameters)
- Troubleshooting (examining specific simulation details)

---

## Implementation Patterns

### 1. **Axis Label Format**

**Pattern:** `{ParameterName} ({Unit})`

**Examples:**
```typescript
'P-Av (kW)'           // ✅ Correct
'Torque (N·m)'        // ✅ Correct
'PCylMax (bar)'       // ✅ Correct
'Temperature (°C)'    // ✅ Correct

// ❌ WRONG (never translate parameter names):
'Мощность (кВт)'      // ❌ Parameter name translated
'Power (kW)'          // ❌ Parameter name translated (should be "P-Av")
```

**Critical:** Always use **original English parameter names** from .det/.pou files.

**Unit conversion:**
- Units change based on Settings (SI/American/HP)
- Axis labels update automatically: `P-Av (kW)` → `P-Av (bhp)` → `P-Av (PS)`
- Parameter name NEVER changes

---

### 2. **Legend Format**

**Pattern:** `{CalculationName} - {ParameterName}`

**Single calculation:**
```typescript
'Vesta 1.6 IM - P-Av'
'Vesta 1.6 IM - Torque'
```

**Comparison mode:**
```typescript
'Vesta 1.6 IM - P-Av'     // Primary (Red)
'Vesta 1.8 Turbo - P-Av'  // Comparison 1 (Green)
'Camry 2.5 NA - P-Av'     // Comparison 2 (Blue)
```

**Why this format?**
- Clear source attribution (which calculation)
- Clear parameter identification (which data)
- Avoids clutter (no units in legend, only on axes)

---

### 3. **Per-Cylinder Array Handling**

Some parameters are **per-cylinder arrays** (e.g., PCylMax for 4-cylinder engine = 4 values per RPM point).

**Implementation:**
```typescript
// Average per-cylinder values
const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
```

**Chart displays:** Averaged value across all cylinders

**Rationale:**
- Simplifies visualization (1 line instead of 4-6 lines)
- Most users care about average behavior
- Individual cylinder analysis = advanced feature (future)

**Parameters with per-cylinder arrays:**
- PCylMax, TCylMax (pressure/temperature vary per cylinder)
- Most others are scalar (same value for whole engine)

---

### 4. **Dual Y-Axis Pattern**

**When to use:**
- Parameters have **different units** (e.g., kW and N·m)
- Parameters have **very different scales** (e.g., 100 kW vs 300 N·m)

**Configuration:**
```typescript
yAxis: [
  {
    type: 'value',
    name: 'P-Av (kW)',
    position: 'left',
    axisLabel: { formatter: '{value}' }
  },
  {
    type: 'value',
    name: 'Torque (N·m)',
    position: 'right',
    axisLabel: { formatter: '{value}' }
  }
]
```

**Series mapping:**
```typescript
series: [
  { name: 'P-Av', yAxisIndex: 0 },    // Left axis
  { name: 'Torque', yAxisIndex: 1 }   // Right axis
]
```

**Presets using dual Y-axis:**
- Preset 1: Power & Torque (kW vs N·m)
- Preset 2: Pressure & Temperature (bar vs °C)
- Preset 4: Critical Values (bar vs detonation degree)

---

### 5. **Line Style Conventions**

**Purpose:** Distinguish parameters when colors not sufficient (e.g., print, grayscale)

**Patterns:**
```typescript
// Primary parameter (most important)
lineStyle: { type: 'solid', width: 2 }

// Secondary parameter
lineStyle: { type: 'dashed', width: 2 }

// Tertiary parameter
lineStyle: { type: 'dotted', width: 2 }
```

**Example (Preset 2):**
- PCylMax: Solid (pressure - most critical)
- TCylMax: Dashed (cylinder temp - secondary)
- TUbMax: Dotted (exhaust temp - tertiary)

**Rationale:**
- Accessibility (not relying on color alone)
- Professional appearance (technical plotting convention)
- Print-friendly (works in black & white)

---

### 6. **Color Assignment Logic**

**Single calculation mode:**
```typescript
// Use PARAMETER_COLORS (each parameter gets its own color)
const color = PARAMETER_COLORS[paramIndex % PARAMETER_COLORS.length];
```

**Comparison mode:**
```typescript
// Use CALCULATION_COLORS (each calculation gets its own color)
const color = calculation.color; // From CALCULATION_COLORS[calcIndex]
```

**Why different systems?**
- Single mode: Focus on parameter differences (P-Av vs Torque)
- Comparison mode: Focus on calculation differences (Vesta vs Camry)

---

## UX Design Principles

### 1. **Minimalism Over Clutter**

**Problem (original implementation):**
- Too much information on axes
- Redundant labels
- Cluttered legends
- Visual noise

**Solution (current v2.0):**
- Axis labels: Only parameter name + unit
- Legends: Only calculation name + parameter
- No redundant information
- Clean, readable charts

**Example:**
```typescript
// ❌ OLD (cluttered):
yAxis: { name: 'Average Power P-Av measured in kilowatts (kW) across RPM range' }

// ✅ NEW (clean):
yAxis: { name: 'P-Av (kW)' }
```

---

### 2. **"iPhone Quality" Standard**

Every detail matters:
- Axis label positioning (not overlapping)
- Legend spacing (comfortable reading)
- Line thickness (2px, not 1px or 3px)
- Grid lines (subtle, not distracting)
- Colors (professional engineering palette)
- Font sizes (readable but not huge)
- Responsive behavior (adapts to screen size)

---

### 3. **Engineering Conventions**

**Parameter names:**
- Always English (P-Av, Torque, PCylMax)
- Never translated (not "Мощность", not "Power")
- From source files (.det/.pou headers)

**Units:**
- SI default (kW, N·m, bar, °C)
- User-selectable (American, HP systems)
- Always displayed in parentheses: `P-Av (kW)`

**Precision:**
- No unnecessary decimals
- Engineering notation where appropriate

---

## Chart Export

All presets support export to:
- **PNG** (raster image, good for presentations)
- **SVG** (vector image, good for publications, infinite zoom)

**Implementation:** ECharts built-in toolbox

```typescript
toolbox: {
  feature: {
    saveAsImage: {
      type: 'png',
      title: 'Save as PNG',
      pixelRatio: 2  // High-DPI support
    }
  }
}
```

---

## Future Enhancements

**Potential improvements** (not yet implemented):

1. **Per-cylinder view** (toggle between averaged/individual cylinders)
2. **Custom line styles** (user-defined in Preset 6)
3. **Annotation tools** (mark specific points, add notes)
4. **Comparison overlay** (ghost previous calculation on current chart)
5. **Auto-scaling** (smart Y-axis limits)
6. **Zoom persistence** (remember zoom level across navigation)

---

## References

**Implementation files:**
- `frontend/src/components/visualization/ChartPreset*.tsx` (6 preset components)
- `frontend/src/types/v2.ts` (CALCULATION_COLORS)
- `frontend/src/config/parameters.ts` (PARAMETER_COLORS)

**Related documentation:**
- [ADR 003: Color Palette Engineering Style](decisions/003-color-palette-engineering-style.md)
- [PARAMETERS-REFERENCE.md](PARAMETERS-REFERENCE.md) - All 73 parameters documented
- [architecture.md](architecture.md) - ECharts integration

**Testing:**
- Visual verification in comparison mode (1-5 calculations)
- Unit conversion verification (SI/American/HP)
- Responsive design verification (mobile/tablet/desktop)
