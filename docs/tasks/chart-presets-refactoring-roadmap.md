# Chart Presets Refactoring Roadmap

**Project:** Engine Results Viewer
**Task:** Migrate Chart Presets to Unified PARAMETERS Config System
**Created:** 2025-11-02
**Status:** 🔵 Not Started (0/2 stages completed)
**Related Phase:** Phase 8.3 - Chart Presets Migration
**Prerequisite:** Phase 8.1 & 8.2 Complete ✅ (PARAMETERS config + unified conversion API)

---

## 📊 Progress Tracker

| Stage | Task | Status | Commit |
|-------|------|--------|--------|
| **Stage 1** | Refactor Preset 1 (Performance: P-Av, Torque) | ✅ Complete | 6c93f23 |
| **Stage 1** | Implement NEW Preset 2 (MEP: FMEP, IMEP, BMEP, PMEP) | ✅ Complete | 6c93f23 |
| **Stage 1** | Implement NEW Preset 3 (PCylMax/MaxDeg - Critical Values) | ✅ Complete | 9cba15e |
| **Stage 1** | Implement NEW Preset 5 (Combustion: TAF, Timing, Delay, Durat) | ✅ Complete | 7ee5c4c |
| **Stage 1** | Implement NEW Preset 6 (Efficiency: DRatio, Ceff) | ⬜ Not Started | - |
| **Stage 1** | Test All Presets + Git Commit + Documentation | ⬜ Not Started | - |
| **Stage 2** | Discuss & Approve Custom Preset UI Design | ⬜ Not Started | - |
| **Stage 2** | Implement Custom Preset Refactoring | ⬜ Not Started | - |
| **Stage 2** | Test Custom Preset + Git Commit + Documentation | ⬜ Not Started | - |

---

## 🚨 Problem Statement

### Current Issue

**Chart Preset components need complete overhaul for multi-format architecture:**

- ❌ **ChartPreset1 (Performance)**: Uses old conversion functions - needs to migrate to unified API
  - Currently: `convertPower()`, `convertTorque()`, `getPowerUnit()`, `getTorqueUnit()`
  - Should use: `convertValue()`, `getParameterUnit()`
  - **Keep P-Av + Torque parameters**, just update conversion logic

- ❌ **ChartPreset2 (Current: Cylinder Pressure)**: Will be **REPLACED** with NEW MEP preset
  - Old: PCylMax only
  - New: FMEP, IMEP, BMEP, PMEP (Mean Effective Pressures)

- ❌ **ChartPreset3 (Current: Temperature)**: Will be **REPLACED** with NEW Critical Values preset
  - Old: TC-Av, TUbMax
  - New: PCylMax/MaxDeg - "очень важный preset" - shows critical values that can destroy engine

- ❌ **ChartPreset4 (NEW)**: Combustion parameters
  - TAF, Timing, Delay, Durat

- ❌ **ChartPreset5 (NEW)**: Efficiency parameters
  - DRatio, Ceff

- ❌ **ChartPreset (Custom)**: Uses hardcoded `PARAMETER_OPTIONS` array (duplicates PARAMETERS config)

**Why This Is a Problem:**

1. **Inconsistent with Phase 8 Architecture**: Backend supports multi-format (.det, .pou, merged), but frontend still uses old single-format logic
2. **Code Duplication**: Multiple specific conversion functions instead of unified API
3. **Not Scalable**: Adding new parameters requires updating multiple places
4. **ChartPreset4 Specific**:
   - Hardcoded `PARAMETER_OPTIONS` array (lines 43-52) duplicates `PARAMETERS` config
   - Current UI design can only display ~8-10 parameters (button grid)
   - **Critical Issue**: We now have ~30 parameters → current UI is unusable

---

## 🎯 Goals

### Stage 1: Implement 5 Standard Presets

**Objective**: Create unified, consistent chart presets using PARAMETERS config

**Changes**:
- ✅ **Preset 1 (Performance)**: UPDATE existing - migrate to unified API, keep P-Av + Torque
- ✅ **Preset 2 (MEP)**: CREATE NEW - FMEP, IMEP, BMEP, PMEP (replaces old ChartPreset2)
- ✅ **Preset 3 (Critical)**: CREATE NEW - PCylMax/MaxDeg (replaces old ChartPreset3)
- ✅ **Preset 4 (Combustion)**: CREATE NEW - TAF, Timing, Delay, Durat
- ✅ **Preset 5 (Efficiency)**: CREATE NEW - DRatio, Ceff
- ✅ All use `convertValue()` and `getParameterUnit()` - ONE unified algorithm
- ✅ Consistent chart architecture across all presets

**Time Estimate**: 4-6 hours

**Result**: 5 standard presets using unified conversion API, work with multi-format backend

---

### Stage 2: Custom Preset Complete Overhaul (Complex)

**Objective**: Redesign UI for 30 parameters + refactor to use PARAMETERS config

**UI Changes** (requires discussion):
- ⚠️ Current design: Button grid → only fits 8-10 parameters
- ✅ New design: Must accommodate ~30 parameters elegantly
- ✅ Options: Dropdown, Tabs, Accordion, Search+Filter, or Combo (see Stage 2 details)

**Code Changes**:
- ✅ Remove `PARAMETER_OPTIONS` hardcoded array
- ✅ Generate parameter list dynamically from `PARAMETERS` config
- ✅ Simplify parameter handling (use `perCylinder` flag for array detection)
- ✅ Use unified conversion API consistently

**Time Estimate**: 3-4 hours (after UI design approval)

**Result**: Custom Preset scales to 30+ parameters, uses PARAMETERS config, modern UI

---

## 📁 Current Code Analysis & New Structure

### Overview of Changes

**Current Files:**
- ✅ `ChartPreset1.tsx` - Performance (P-Av, Torque) - **UPDATE only**
- ❌ `ChartPreset2.tsx` - Old Cylinder Pressure - **WILL BE REPLACED**
- ❌ `ChartPreset3.tsx` - Old Temperature - **WILL BE REPLACED**
- ❌ `ChartPreset4.tsx` - Current Custom preset - **WILL BE MOVED/RENAMED**

**New Structure (Stage 1):**
- ✅ `ChartPreset1.tsx` - **Preset 1: Performance** (P-Av, Torque) - update conversion logic
- 🆕 `ChartPreset2.tsx` - **Preset 2: MEP** (FMEP, IMEP, BMEP, PMEP) - create new
- 🆕 `ChartPreset3.tsx` - **Preset 3: Critical** (PCylMax, MaxDeg) - create new
- 🆕 `ChartPreset4.tsx` - **Preset 4: Combustion** (TAF, Timing, Delay, Durat) - create new
- 🆕 `ChartPreset5.tsx` - **Preset 5: Efficiency** (DRatio, Ceff) - create new
- ⏸️ `ChartPresetCustom.tsx` - **Custom Preset** (user selection) - Stage 2 only

---

### ChartPreset1 (Performance: P-Av, Torque)

**File**: `frontend/src/components/visualization/ChartPreset1.tsx` (381 lines)

**Status**: ✅ KEEP - Only update conversion logic

**Parameters Displayed**: P-Av (left Y-axis), Torque (right Y-axis)

**Current Conversion Functions**:
```typescript
// Lines 16-21: Imports
import {
  convertPower,       // ❌ Replace with convertValue()
  convertTorque,      // ❌ Replace with convertValue()
  getPowerUnit,       // ❌ Replace with getParameterUnit()
  getTorqueUnit,      // ❌ Replace with getParameterUnit()
} from '@/lib/unitsConversion';
```

**Usage Locations**:
- Line 135: `convertPower(point['P-Av'], units)` → `convertValue(point['P-Av'], 'P-Av', units)`
- Line 141: `convertTorque(point.Torque, units)` → `convertValue(point.Torque, 'Torque', units)`
- Line 177: `convertPower(powerPeak.value, units)` → `convertValue(powerPeak.value, 'P-Av', units)`
- Line 216: `convertTorque(torquePeak.value, units)` → `convertValue(torquePeak.value, 'Torque', units)`
- Line 228: `getPowerUnit(units)` → `getParameterUnit('P-Av', units)`
- Line 229: `getTorqueUnit(units)` → `getParameterUnit('Torque', units)`

**Special Features to Preserve**:
- Dual Y-axis configuration (lines 301-304)
- Custom graphic legend (lines 237-299)
- Different line styles: P-Av solid, Torque dashed
- Color coding: Single calc uses `PARAMETER_COLORS`, comparison uses `calc.color`

---

### ChartPreset2 (MEP - Mean Effective Pressures) 🆕

**File**: `frontend/src/components/visualization/ChartPreset2.tsx` - **CREATE NEW**

**Status**: 🆕 NEW IMPLEMENTATION - replaces old Cylinder Pressure preset

**Parameters to Display**:
- FMEP (Friction Mean Effective Pressure) - bar
- IMEP (Indicated Mean Effective Pressure) - bar
- BMEP (Brake Mean Effective Pressure) - bar
- PMEP (Pumping Mean Effective Pressure) - bar

**Chart Architecture**:
- X-axis: RPM
- Y-axis: Pressure (bar / psi depending on units)
- 4 series (one per MEP parameter)
- Different line styles to distinguish parameters
- Unified conversion using `convertValue()` and `getParameterUnit()`

**Implementation Notes**:
- All MEP parameters are scalar (not per-cylinder arrays)
- All use pressure conversion (bar ↔ psi)
- Peak markers for each parameter
- Can be based on ChartPreset1 architecture (multi-series on single Y-axis)

---

### ChartPreset3 (Critical Values - PCylMax/MaxDeg) 🆕

**File**: `frontend/src/components/visualization/ChartPreset3.tsx` - **CREATE NEW**

**Status**: 🆕 NEW IMPLEMENTATION - replaces old Temperature preset

**Purpose**: "Очень важный preset" - Shows critical values that can **destroy the engine**

**Parameters to Display**:
- PCylMax (Max Cylinder Pressure) - bar (per-cylinder, show averaged)
- MaxDeg (Maximum Detonation Degree) - no unit (per-cylinder, show averaged)

**Chart Architecture**:
- X-axis: RPM
- Dual Y-axis:
  - Left Y-axis: PCylMax (bar / psi)
  - Right Y-axis: MaxDeg (no unit)
- 2 series per calculation
- Different line styles (solid for PCylMax, dashed for MaxDeg)
- Unified conversion using `convertValue()` and `getParameterUnit()`

**Implementation Notes**:
- PCylMax is per-cylinder array → average across cylinders
- MaxDeg is per-cylinder array → average across cylinders
- PCylMax uses pressure conversion (bar ↔ psi)
- MaxDeg has no unit conversion (conversionType: 'none')
- Peak markers for both parameters
- Can be based on ChartPreset1 architecture (dual Y-axis)

---

### ChartPreset4 (Combustion Parameters) 🆕

**File**: `frontend/src/components/visualization/ChartPreset4.tsx` - **CREATE NEW**

**Status**: 🆕 NEW IMPLEMENTATION - replaces current Custom preset

**Parameters to Display**:
- TAF (Throttle Angle Factor) - no unit
- Timing (Ignition Timing) - degrees
- Delay (Combustion Delay) - ms
- Durat (Combustion Duration) - ms

**Chart Architecture**:
- X-axis: RPM
- Y-axis: Mixed units (will need to decide on dual/single axis)
- 4 series (one per combustion parameter)
- Different line styles to distinguish parameters
- Unified conversion using `convertValue()` and `getParameterUnit()`

**Implementation Notes**:
- All parameters are scalar (not per-cylinder arrays)
- Mixed units → may need warning or separate Y-axes
- No unit conversion needed (all conversionType: 'none')
- Peak markers for relevant parameters
- Can be based on ChartPreset1 architecture

---

### ChartPreset5 (Efficiency Parameters) 🆕

**File**: `frontend/src/components/visualization/ChartPreset5.tsx` - **CREATE NEW**

**Status**: 🆕 NEW IMPLEMENTATION

**Parameters to Display**:
- DRatio (Delivery Ratio) - percentage or ratio
- Ceff (Combustion Efficiency) - percentage or ratio

**Chart Architecture**:
- X-axis: RPM
- Y-axis: Ratio/Percentage (no unit conversion)
- 2 series (one per efficiency parameter)
- Different line styles (solid for DRatio, dashed for Ceff)
- Unified conversion using `convertValue()` and `getParameterUnit()`

**Implementation Notes**:
- Both parameters are scalar (not per-cylinder arrays)
- No unit conversion needed (conversionType: 'none')
- Same Y-axis for both (similar units)
- Peak markers for both parameters
- Can be based on ChartPreset1 architecture (single Y-axis, 2 series)

---

### ChartPresetCustom (Custom - User Selection) ⏸️

**Current File**: `frontend/src/components/visualization/ChartPreset4.tsx` (448 lines)

**New File**: `frontend/src/components/visualization/ChartPresetCustom.tsx` (to be renamed/moved in Stage 2)

**Status**: ⏸️ STAGE 2 ONLY - will be moved and refactored after Stage 1 complete

**Parameters Displayed**: User-selected (dynamic - up to 30 parameters)

**Current Problems**:

#### Problem 1: Hardcoded PARAMETER_OPTIONS (Lines 43-52)

```typescript
const PARAMETER_OPTIONS = [
  { id: 'P-Av', label: 'P-Av (Power)', getUnit: getPowerUnit, isArray: false },
  { id: 'Torque', label: 'Torque', getUnit: getTorqueUnit, isArray: false },
  { id: 'PCylMax', label: 'PCylMax (bar) (avg)', getUnit: getPressureUnit, isArray: true },
  { id: 'TCylMax', label: 'TCylMax (°C) (avg)', getUnit: getTemperatureUnit, isArray: true },
  { id: 'TUbMax', label: 'TUbMax (°C) (avg)', getUnit: getTemperatureUnit, isArray: true },
  { id: 'PurCyl', label: 'PurCyl (avg)', getUnit: () => '', isArray: true },
  { id: 'Deto', label: 'Deto (avg)', getUnit: () => '', isArray: true },
  { id: 'Convergence', label: 'Convergence', getUnit: () => '', isArray: false },
];
```

**Why This Is Wrong**:
- ❌ Duplicates information from `PARAMETERS` config
- ❌ Only 8 parameters → we have ~30 in PARAMETERS config
- ❌ Manual `isArray` flags → already in `PARAMETERS.perCylinder`
- ❌ Manual `getUnit` functions → already `getParameterUnit()` exists
- ❌ Violates DRY principle

**Solution**: Generate dynamically from `PARAMETERS`:
```typescript
const PARAMETER_OPTIONS = useMemo(() => {
  return Object.values(PARAMETERS)
    .filter(p => p.chartable)
    .filter(p => ['performance', 'mep', 'temperature', 'combustion', 'efficiency'].includes(p.category))
    .map(param => ({
      id: param.name,
      label: `${param.displayName} (${param.name})`,
      category: param.category,
      // No need for getUnit or isArray - use PARAMETERS directly
    }));
}, []);
```

#### Problem 2: UI Design Cannot Scale (Lines 392-425)

**Current UI**: Button grid for parameter selection

```typescript
{/* Parameter selection buttons */}
<div className="flex flex-wrap gap-2">
  {PARAMETER_OPTIONS.map((option) => (
    <Button
      key={option.id}
      variant={selectedParams.includes(option.id) ? 'default' : 'outline'}
      onClick={() => toggleParameter(option.id)}
    >
      {option.label}
    </Button>
  ))}
</div>
```

**Screenshot Analysis** (provided by user):
- Current design shows ~8 parameter buttons
- Already filling the width of the container
- With 30 parameters → multiple rows → vertical overflow → unusable

**UI Must Be Redesigned** → See Stage 2 for options

---

## 🚀 STAGE 1: Implement All 5 Standard Presets

**Goal**: Create unified chart preset system using PARAMETERS config

**Approach**:
- **Preset 1**: Update existing (migrate conversion logic only)
- **Presets 2-5**: Create new (based on ChartPreset1 architecture)
- **All presets**: Use unified `convertValue()` and `getParameterUnit()` - ONE algorithm

**Time**: 4-6 hours total

**Order of Implementation**:
1. Task 1.1: Update Preset 1 (Performance) - simplest, sets pattern
2. Task 1.2: Create Preset 2 (MEP) - 4 parameters, single Y-axis
3. Task 1.3: Create Preset 3 (Critical) - 2 parameters, dual Y-axis, per-cylinder averaging
4. Task 1.4: Create Preset 4 (Combustion) - 4 parameters, mixed units
5. Task 1.5: Create Preset 5 (Efficiency) - 2 parameters, simple
6. Task 1.6: Test all 5 presets
7. Task 1.7: Git commit + documentation

---

### Task 1.1: Update Preset 1 (Performance: P-Av, Torque)

**File**: `frontend/src/components/visualization/ChartPreset1.tsx`

#### Step 1: Update imports (Lines 16-21)

**Before**:
```typescript
import {
  convertPower,
  convertTorque,
  getPowerUnit,
  getTorqueUnit,
} from '@/lib/unitsConversion';
```

**After**:
```typescript
import {
  convertValue,
  getParameterUnit,
} from '@/lib/unitsConversion';
```

#### Step 2: Update data conversion (Lines 134-143)

**Before**:
```typescript
const powerData = calc.data.map((point) => ({
  value: [point.RPM, convertPower(point['P-Av'], units)],
  decimals: decimals,
}));

const torqueData = calc.data.map((point) => ({
  value: [point.RPM, convertTorque(point.Torque, units)],
  decimals: decimals,
}));
```

**After**:
```typescript
const powerData = calc.data.map((point) => ({
  value: [point.RPM, convertValue(point['P-Av'], 'P-Av', units)],
  decimals: decimals,
}));

const torqueData = calc.data.map((point) => ({
  value: [point.RPM, convertValue(point.Torque, 'Torque', units)],
  decimals: decimals,
}));
```

#### Step 3: Update peak markers (Lines 177, 216)

**Before** (Line 177):
```typescript
coord: [powerPeak.rpm, convertPower(powerPeak.value, units)],
```

**After**:
```typescript
coord: [powerPeak.rpm, convertValue(powerPeak.value, 'P-Av', units)],
```

**Before** (Line 216):
```typescript
coord: [torquePeak.rpm, convertTorque(torquePeak.value, units)],
```

**After**:
```typescript
coord: [torquePeak.rpm, convertValue(torquePeak.value, 'Torque', units)],
```

#### Step 4: Update unit labels (Lines 228-229)

**Before**:
```typescript
const powerUnit = getPowerUnit(units);
const torqueUnit = getTorqueUnit(units);
```

**After**:
```typescript
const powerUnit = getParameterUnit('P-Av', units);
const torqueUnit = getParameterUnit('Torque', units);
```

#### Verification Checklist:

- [ ] File compiles without TypeScript errors
- [ ] No unused imports (convertPower, convertTorque, etc. removed)
- [ ] Chart renders correctly
- [ ] Units conversion works (test SI → American → HP)
- [ ] Peak markers display at correct positions
- [ ] Dual Y-axis still works
- [ ] Custom legend still displays
- [ ] Export PNG/SVG works

---

### Task 1.2: Create NEW Preset 2 (MEP - Mean Effective Pressures)

**File**: `frontend/src/components/visualization/ChartPreset2.tsx` - **CREATE NEW FILE**

**Status**: 🆕 Replace old ChartPreset2.tsx completely

**Parameters**: FMEP, IMEP, BMEP, PMEP (all scalar, all pressure units)

#### Implementation Approach:

**Base Template**: Copy ChartPreset1.tsx structure

**Key Changes**:
1. **Parameters**: 4 MEP parameters instead of 2 (P-Av, Torque)
2. **Y-Axis**: Single Y-axis (all parameters use pressure units: bar/psi)
3. **Series**: 4 series instead of 2
4. **Line Styles**: Differentiate with line styles (solid, dashed, dotted, dash-dot)
5. **Colors**: Use PARAMETER_COLORS or calculation colors

#### Step-by-Step:

**Step 1**: Copy ChartPreset1.tsx → ChartPreset2.tsx

**Step 2**: Update component name and documentation
```typescript
/**
 * Chart Preset 2: Mean Effective Pressures (MEP)
 *
 * Single-axis chart:
 * - Y axis: Pressure (bar/psi)
 * - X axis: RPM
 * - Series: FMEP, IMEP, BMEP, PMEP
 */
export function ChartPreset2({ calculations }: ChartPreset2Props) {
```

**Step 3**: Update series generation
```typescript
const parameters = ['FMEP', 'IMEP', 'BMEP', 'PMEP'];
const lineStyles = ['solid', 'dashed', 'dotted', 'dash-dot'];

parameters.forEach((paramName, paramIndex) => {
  // Find peak for this parameter
  const peak = findPeak(calc.data, paramName);

  // Prepare data with conversion
  const seriesData = calc.data.map((point) => ({
    value: [point.RPM, convertValue(point[paramName], paramName, units)],
    decimals: decimals,
  }));

  // Create series
  series.push({
    name: `${label} - ${paramName}`,
    type: 'line',
    data: seriesData,
    lineStyle: {
      type: lineStyles[paramIndex],
      width: 2,
    },
    // ... peak marker, colors, etc.
  });
});
```

**Step 4**: Update Y-axis (single axis only)
```typescript
yAxis: createYAxis(getParameterUnit('FMEP', units), 'left', '#1f77b4', showGrid),
```

**Step 5**: Update legend (show all 4 parameters)

**Step 6**: Test conversion with units switching (bar ↔ psi)

#### Verification Checklist:

- [ ] File created and compiles without TypeScript errors
- [ ] Chart renders with 4 series (FMEP, IMEP, BMEP, PMEP)
- [ ] Different line styles distinguish parameters
- [ ] Units conversion works (bar ↔ psi)
- [ ] Peak markers visible on all 4 series
- [ ] Export (PNG, SVG) works
- [ ] No console errors

---

### Task 1.3: Create NEW Preset 3 (Critical Values - PCylMax/MaxDeg)

**File**: `frontend/src/components/visualization/ChartPreset3.tsx` - **CREATE NEW FILE**

**Status**: 🆕 Replace old ChartPreset3.tsx completely

**Purpose**: "Очень важный preset" - Critical values that can **destroy the engine**

**Parameters**:
- PCylMax (Max Cylinder Pressure) - per-cylinder array, show averaged
- MaxDeg (Maximum Detonation Degree) - per-cylinder array, show averaged

#### Implementation Approach:

**Base Template**: Copy ChartPreset1.tsx structure (dual Y-axis)

**Key Changes**:
1. **Parameters**: PCylMax (left Y-axis), MaxDeg (right Y-axis)
2. **Y-Axis**: Dual Y-axis (pressure units vs no units)
3. **Array Handling**: Both parameters are per-cylinder → need averaging
4. **Line Styles**: Solid for PCylMax, dashed for MaxDeg

#### Step-by-Step:

**Step 1**: Copy ChartPreset1.tsx → ChartPreset3.tsx

**Step 2**: Update component name and documentation
```typescript
/**
 * Chart Preset 3: Critical Engine Values (PCylMax, MaxDeg)
 *
 * "Очень важный preset" - Shows critical values that can destroy the engine
 *
 * Dual-axis chart:
 * - Left axis: PCylMax (bar/psi)
 * - Right axis: MaxDeg (no unit)
 * - X axis: RPM
 */
export function ChartPreset3({ calculations }: ChartPreset3Props) {
```

**Step 3**: Add per-cylinder averaging for both parameters
```typescript
// PCylMax data with averaging
const pcylMaxData = calc.data.map((point) => {
  const cylValues = point.PCylMax; // per-cylinder array
  const avg = cylValues.reduce((sum, v) => sum + v, 0) / cylValues.length;
  return {
    value: [point.RPM, convertValue(avg, 'PCylMax', units)],
    decimals: decimals,
  };
});

// MaxDeg data with averaging
const maxDegData = calc.data.map((point) => {
  const cylValues = point.MaxDeg; // per-cylinder array
  const avg = cylValues.reduce((sum, v) => sum + v, 0) / cylValues.length;
  return {
    value: [point.RPM, convertValue(avg, 'MaxDeg', units)],
    decimals: decimals,
  };
});
```

**Step 4**: Create 2 series with different Y-axis indices
```typescript
// PCylMax series (left Y-axis)
series.push({
  name: `${label} - PCylMax`,
  type: 'line',
  yAxisIndex: 0, // Left axis
  data: pcylMaxData,
  lineStyle: { type: 'solid', width: 2 },
  // ... peak marker, etc.
});

// MaxDeg series (right Y-axis)
series.push({
  name: `${label} - MaxDeg`,
  type: 'line',
  yAxisIndex: 1, // Right axis
  data: maxDegData,
  lineStyle: { type: 'dashed', width: 2 },
  // ... peak marker, etc.
});
```

**Step 5**: Update Y-axes (dual)
```typescript
yAxis: [
  createYAxis(getParameterUnit('PCylMax', units), 'left', '#1f77b4', showGrid),
  createYAxis(getParameterUnit('MaxDeg', units), 'right', '#ff7f0e', showGrid),
]
```

**Step 6**: Test with per-cylinder arrays and units conversion

#### Verification Checklist:

- [ ] File created and compiles without TypeScript errors
- [ ] Chart renders with 2 series (PCylMax, MaxDeg)
- [ ] Dual Y-axis configured correctly
- [ ] Array averaging works correctly for both parameters
- [ ] PCylMax units conversion works (bar ↔ psi)
- [ ] MaxDeg shows correctly (no unit conversion)
- [ ] Different line styles (solid vs dashed)
- [ ] Peak markers visible on both series
- [ ] Export (PNG, SVG) works
- [ ] No console errors

---

### Task 1.4: Create NEW Preset 4 (Combustion Parameters)

**File**: `frontend/src/components/visualization/ChartPreset4.tsx` - **CREATE NEW FILE**

**Status**: 🆕 Replace current Custom preset (will be moved to ChartPresetCustom.tsx in Stage 2)

**Parameters**: TAF, Timing, Delay, Durat (all scalar, mixed units)

#### Implementation Approach:

**Base Template**: Copy ChartPreset1.tsx or ChartPreset2.tsx structure

**Key Changes**:
1. **Parameters**: 4 combustion parameters
2. **Y-Axis**: Single Y-axis (mixed units - may need normalization or warning)
3. **Series**: 4 series
4. **Line Styles**: Differentiate with line styles
5. **Units**: No conversion needed (all conversionType: 'none')

#### Step-by-Step:

**Step 1**: Copy ChartPreset2.tsx → ChartPreset4.tsx (4 parameters pattern)

**Step 2**: Update component name and documentation
```typescript
/**
 * Chart Preset 4: Combustion Parameters
 *
 * Single-axis chart:
 * - Y axis: Mixed units (degrees, ms, etc.)
 * - X axis: RPM
 * - Series: TAF, Timing, Delay, Durat
 */
export function ChartPreset4({ calculations }: ChartPreset4Props) {
```

**Step 3**: Update parameters list
```typescript
const parameters = ['TAF', 'Timing', 'Delay', 'Durat'];
const lineStyles = ['solid', 'dashed', 'dotted', 'dash-dot'];
```

**Step 4**: Add warning for mixed units (optional)
```typescript
// Note: Mixed units - TAF (none), Timing (deg), Delay (ms), Durat (ms)
// Consider adding warning or using dual Y-axes if values have very different scales
```

**Step 5**: Generate series with convertValue (even though conversionType: 'none')
```typescript
const seriesData = calc.data.map((point) => ({
  value: [point.RPM, convertValue(point[paramName], paramName, units)],
  decimals: decimals,
}));
```

**Step 6**: Test rendering with all 4 combustion parameters

#### Verification Checklist:

- [ ] File created and compiles without TypeScript errors
- [ ] Chart renders with 4 series (TAF, Timing, Delay, Durat)
- [ ] Different line styles distinguish parameters
- [ ] All parameters display correctly (no conversion needed)
- [ ] Legend shows all 4 parameters
- [ ] Peak markers visible on all series
- [ ] Export (PNG, SVG) works
- [ ] No console errors

---

### Task 1.5: Create NEW Preset 5 (Efficiency Parameters)

**File**: `frontend/src/components/visualization/ChartPreset5.tsx` - **CREATE NEW FILE**

**Status**: 🆕 NEW FILE

**Parameters**: DRatio, Ceff (both scalar, same unit type)

#### Implementation Approach:

**Base Template**: Copy ChartPreset1.tsx structure (2 parameters, simple)

**Key Changes**:
1. **Parameters**: DRatio, Ceff (both efficiency/ratio parameters)
2. **Y-Axis**: Single Y-axis (same unit type)
3. **Series**: 2 series
4. **Line Styles**: Solid for DRatio, dashed for Ceff

#### Step-by-Step:

**Step 1**: Copy ChartPreset1.tsx → ChartPreset5.tsx

**Step 2**: Update component name and documentation
```typescript
/**
 * Chart Preset 5: Efficiency Parameters
 *
 * Single-axis chart:
 * - Y axis: Ratio/Percentage
 * - X axis: RPM
 * - Series: DRatio, Ceff
 */
export function ChartPreset5({ calculations }: ChartPreset5Props) {
```

**Step 3**: Update parameters (DRatio, Ceff instead of P-Av, Torque)
```typescript
// DRatio data
const dratioData = calc.data.map((point) => ({
  value: [point.RPM, convertValue(point.DRatio, 'DRatio', units)],
  decimals: decimals,
}));

// Ceff data
const ceffData = calc.data.map((point) => ({
  value: [point.RPM, convertValue(point.Ceff, 'Ceff', units)],
  decimals: decimals,
}));
```

**Step 4**: Create 2 series (single Y-axis, not dual)
```typescript
// DRatio series
series.push({
  name: `${label} - DRatio`,
  type: 'line',
  data: dratioData,
  lineStyle: { type: 'solid', width: 2 },
  // ... peak marker, etc.
});

// Ceff series
series.push({
  name: `${label} - Ceff`,
  type: 'line',
  data: ceffData,
  lineStyle: { type: 'dashed', width: 2 },
  // ... peak marker, etc.
});
```

**Step 5**: Update Y-axis (single axis)
```typescript
yAxis: createYAxis(getParameterUnit('DRatio', units), 'left', '#1f77b4', showGrid),
```

**Step 6**: Test rendering with both efficiency parameters

#### Verification Checklist:

- [ ] File created and compiles without TypeScript errors
- [ ] Chart renders with 2 series (DRatio, Ceff)
- [ ] Different line styles (solid vs dashed)
- [ ] Both parameters display correctly (no conversion needed)
- [ ] Single Y-axis configured correctly
- [ ] Peak markers visible on both series
- [ ] Export (PNG, SVG) works
- [ ] No console errors

---

### Task 1.6: Test All 5 Presets

**Manual Testing Protocol**:

#### Pre-testing Setup:
1. Start project: `./scripts/start.sh`
2. Open browser: http://localhost:5173
3. Open any project (e.g., "Vesta 1.6 IM")

#### Test ChartPreset1 (Power & Torque):

**Preset Selection**:
- [ ] Select Preset 1 from dropdown

**Visual Verification**:
- [ ] Chart displays with 2 series: P-Av (solid line), Torque (dashed line)
- [ ] Dual Y-axis visible (left = power, right = torque)
- [ ] Custom legend at top center shows "P-Av — Torque - - -"
- [ ] Colors match PARAMETER_COLORS (single calc) or calc.color (comparison)

**Units Conversion**:
- [ ] SI units: P-Av in kW, Torque in N·m
- [ ] Switch to American: P-Av → bhp, Torque → lb-ft (numbers change!)
- [ ] Switch to HP: P-Av → PS, Torque → N·m
- [ ] Switch back to SI: Values return to original

**Peak Markers**:
- [ ] Peak markers visible on both series (different symbols)
- [ ] Hover over marker → tooltip shows peak value
- [ ] Peak values match PeakValuesCards below chart

**Export**:
- [ ] Click PNG button → file downloads
- [ ] Click SVG button → file downloads
- [ ] Open exported files → chart looks correct

**Console**:
- [ ] No errors in browser console
- [ ] No warnings about missing parameters

---

#### Test ChartPreset2 (MEP):

**Preset Selection**:
- [ ] Select Preset 2 from dropdown

**Visual Verification**:
- [ ] Chart displays with 4 series (FMEP, IMEP, BMEP, PMEP)
- [ ] Different line styles distinguish parameters
- [ ] Legend shows all 4 MEP parameters
- [ ] Peak markers visible on all series

**Units Conversion**:
- [ ] SI units: All MEPs in bar
- [ ] Switch to American: All → psi (numbers change correctly)
- [ ] Switch to HP: All → bar
- [ ] Switch back to SI

**Export & Console**:
- [ ] PNG export works
- [ ] SVG export works
- [ ] No console errors

---

#### Test ChartPreset3 (Critical Values):

**Preset Selection**:
- [ ] Select Preset 3 from dropdown

**Visual Verification**:
- [ ] Chart displays with 2 series: PCylMax (solid), MaxDeg (dashed)
- [ ] Dual Y-axis visible (left = pressure, right = MaxDeg)
- [ ] Per-cylinder averaging works correctly
- [ ] Peak markers visible on both series

**Units Conversion**:
- [ ] SI units: PCylMax in bar, MaxDeg (no unit)
- [ ] Switch to American: PCylMax → psi, MaxDeg unchanged
- [ ] Switch to HP: PCylMax → bar, MaxDeg unchanged
- [ ] Switch back to SI

**Export & Console**:
- [ ] PNG export works
- [ ] SVG export works
- [ ] No console errors

---

#### Test ChartPreset4 (Combustion):

**Preset Selection**:
- [ ] Select Preset 4 from dropdown

**Visual Verification**:
- [ ] Chart displays with 4 series (TAF, Timing, Delay, Durat)
- [ ] Different line styles distinguish parameters
- [ ] Legend shows all 4 combustion parameters
- [ ] Peak markers visible on all series

**Mixed Units Handling**:
- [ ] All parameters display correctly despite mixed units
- [ ] No unit conversion (all parameters use original units)
- [ ] Chart is readable (scales appropriate)

**Export & Console**:
- [ ] PNG export works
- [ ] SVG export works
- [ ] No console errors

---

#### Test ChartPreset5 (Efficiency):

**Preset Selection**:
- [ ] Select Preset 5 from dropdown

**Visual Verification**:
- [ ] Chart displays with 2 series: DRatio (solid), Ceff (dashed)
- [ ] Single Y-axis (ratio/percentage)
- [ ] Legend shows both efficiency parameters
- [ ] Peak markers visible on both series

**Parameters Display**:
- [ ] DRatio displays correctly
- [ ] Ceff displays correctly
- [ ] No unit conversion (both use original units)

**Export & Console**:
- [ ] PNG export works
- [ ] SVG export works
- [ ] No console errors

---

#### Cross-Preset Tests (All 5):

**Preset Switching**:
- [ ] Switch: Preset 1 → 2 → 3 → 4 → 5 → 1
- [ ] Each preset renders correctly after switch
- [ ] No leftover data from previous preset

**Unit Persistence**:
- [ ] Change units to American in Preset 1
- [ ] Switch to Preset 2 (MEP) → still American units (bar → psi)
- [ ] Switch to Preset 3 (Critical) → still American units (PCylMax in psi)
- [ ] Switch to Preset 4 (Combustion) → no unit conversion
- [ ] Switch to Preset 5 (Efficiency) → no unit conversion
- [ ] Units persist across preset changes ✅

**Comparison Mode** (if applicable):
- [ ] Add comparison calculation
- [ ] Preset 1: Both calculations visible, different colors
- [ ] Preset 2: All 4 MEPs × 2 calculations = 8 series
- [ ] Preset 3: Both calculations visible, dual Y-axis
- [ ] Preset 4: All 4 combustion params × 2 calculations = 8 series
- [ ] Preset 5: Both calculations visible

---

### Task 1.7: Git Commit + Documentation

#### Git Commit

**After all 5 presets tested successfully:**

```bash
# Add changed/new files
git add frontend/src/components/visualization/ChartPreset1.tsx  # Updated
git add frontend/src/components/visualization/ChartPreset2.tsx  # New (MEP)
git add frontend/src/components/visualization/ChartPreset3.tsx  # New (Critical)
git add frontend/src/components/visualization/ChartPreset4.tsx  # New (Combustion)
git add frontend/src/components/visualization/ChartPreset5.tsx  # New (Efficiency)

# Commit with detailed message
git commit -m "feat(presets): implement 5 standard presets with unified conversion API

Replaced old 3-preset system with new 5-preset structure using unified
PARAMETERS config and conversion API (Phase 8.3).

ChartPreset1 (Performance: P-Av, Torque):
  - Updated to use convertValue() and getParameterUnit()
  - Preserved existing parameters (P-Av, Torque)
  - Kept dual Y-axis architecture and custom legend

ChartPreset2 (MEP: FMEP, IMEP, BMEP, PMEP) - NEW:
  - 4 Mean Effective Pressure parameters
  - Single Y-axis, pressure units (bar/psi conversion)
  - Different line styles for each parameter
  - Based on ChartPreset1 architecture

ChartPreset3 (Critical: PCylMax, MaxDeg) - NEW:
  - Shows critical values that can destroy engine
  - PCylMax (pressure) + MaxDeg (detonation degree)
  - Dual Y-axis for different unit types
  - Per-cylinder averaging for both parameters

ChartPreset4 (Combustion: TAF, Timing, Delay, Durat) - NEW:
  - 4 combustion parameters with mixed units
  - Single Y-axis, no unit conversion needed
  - Different line styles for each parameter

ChartPreset5 (Efficiency: DRatio, Ceff) - NEW:
  - 2 efficiency ratio parameters
  - Single Y-axis, no unit conversion needed
  - Simple 2-series architecture

All Presets:
  - Use unified convertValue() and getParameterUnit() - ONE algorithm
  - Consistent with PARAMETERS config (Single Source of Truth)
  - Work with multi-format backend (.det, .pou, merged)
  - Support cross-project comparison mode
  - Peak markers and export functionality (PNG, SVG)

Benefits:
  - Unified conversion API across all 5 standard presets
  - Scalable architecture for future preset additions
  - Easier to maintain and extend
  - Consistent user experience across all presets

Phase: Chart Presets Refactoring (Stage 1/2 - COMPLETE)
Related: Phase 8.3 - Parameter System Integration
Tested: Manual testing completed for all 5 presets
Next: Stage 2 - Custom Preset overhaul (UI redesign)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

#### Update CHANGELOG.md

**File**: `/Users/mactm/Projects/engine-viewer/CHANGELOG.md`

**Location**: Under `## [Unreleased]` → `### Added` (for new presets) and `### Changed` (for updated Preset 1)

**Add to `### Added`**:
```markdown
- **Chart Presets 2-5: NEW Standard Presets** (2025-11-02):
  - ✅ **ChartPreset2 (MEP)**: Mean Effective Pressures (FMEP, IMEP, BMEP, PMEP)
    - 4-series chart with pressure unit conversion (bar ↔ psi)
    - Different line styles for each MEP parameter
    - Peak markers for all parameters
  - ✅ **ChartPreset3 (Critical Values)**: PCylMax + MaxDeg
    - "Очень важный preset" - shows critical engine destruction values
    - Dual Y-axis: pressure (left) + detonation degree (right)
    - Per-cylinder averaging for both parameters
  - ✅ **ChartPreset4 (Combustion)**: TAF, Timing, Delay, Durat
    - 4 combustion parameters with mixed units
    - Supports detailed combustion analysis
  - ✅ **ChartPreset5 (Efficiency)**: DRatio + Ceff
    - 2 efficiency ratio parameters
    - Simple single Y-axis architecture
  - All new presets use unified conversion API (convertValue, getParameterUnit)
  - Consistent with PARAMETERS config (Single Source of Truth)
  - Support cross-project comparison mode
  - Export functionality (PNG, SVG)
  - Files: [frontend/src/components/visualization/ChartPreset{2,3,4,5}.tsx](frontend/src/components/visualization/)
  - Commit: [commit-hash]
```

**Add to `### Changed`**:
```markdown
- **ChartPreset1 (Performance): Unified Conversion API Migration** (2025-11-02):
  - ✅ Migrated from specific conversion functions to unified API
  - ✅ Now uses convertValue() instead of convertPower()/convertTorque()
  - ✅ Now uses getParameterUnit() instead of getPowerUnit()/getTorqueUnit()
  - ✅ Preserved existing parameters (P-Av, Torque)
  - ✅ Preserved dual Y-axis architecture
  - ✅ Preserved custom graphic legend
  - ✅ Consistent with PARAMETERS config
  - File: [frontend/src/components/visualization/ChartPreset1.tsx](frontend/src/components/visualization/ChartPreset1.tsx)
  - Commit: [commit-hash]
```

**Result**: System now has 5 standard presets (was 3) + 1 Custom preset (Stage 2)

---

#### Update roadmap-v2.0-COMPLETE.md

**File**: `/Users/mactm/Projects/engine-viewer/roadmap-v2.0-COMPLETE.md`

**Location**: After Phase 8.2, add new section:

**Add**:
```markdown
### Phase 8.3: Chart Presets System - STAGE 1 COMPLETE ✅

**Goal**: Implement 5 standard chart presets using unified PARAMETERS config system

**Status**: Stage 1/2 Complete (All 5 standard presets implemented)

**Stage 1 Tasks** (5 Standard Presets):
- [X] 8.3.1 Analyze existing presets and plan new 5-preset structure
  - Analyzed old 3-preset system
  - Defined new structure: Performance, MEP, Critical, Combustion, Efficiency
- [X] 8.3.2 Update ChartPreset1 (Performance: P-Av, Torque)
  - Migrated to convertValue() and getParameterUnit()
  - Preserved existing parameters and dual Y-axis architecture
  - Kept custom graphic legend
- [X] 8.3.3 Implement NEW ChartPreset2 (MEP: FMEP, IMEP, BMEP, PMEP)
  - 4 Mean Effective Pressure parameters
  - Single Y-axis with pressure unit conversion (bar ↔ psi)
  - Different line styles for each parameter
  - Peak markers for all parameters
- [X] 8.3.4 Implement NEW ChartPreset3 (Critical: PCylMax, MaxDeg)
  - "Очень важный preset" - critical engine destruction values
  - Dual Y-axis: pressure (left) + detonation degree (right)
  - Per-cylinder averaging for both parameters
  - PCylMax pressure conversion, MaxDeg no conversion
- [X] 8.3.5 Implement NEW ChartPreset4 (Combustion: TAF, Timing, Delay, Durat)
  - 4 combustion parameters with mixed units
  - Single Y-axis, no unit conversion needed
  - Different line styles for distinction
- [X] 8.3.6 Implement NEW ChartPreset5 (Efficiency: DRatio, Ceff)
  - 2 efficiency ratio parameters
  - Simple single Y-axis architecture
  - No unit conversion needed
- [X] 8.3.7 Test all 5 presets with .det and .pou files
  - Verified units conversion where applicable (bar ↔ psi)
  - Verified per-cylinder averaging (Preset 3)
  - Verified peak markers on all presets
  - Verified export functionality (PNG, SVG)
  - Verified cross-project comparison mode
  - No console errors or warnings
- [X] 8.3.8 Git commit + documentation update (CHANGELOG.md, roadmap)

**Stage 2 Tasks** (Custom Preset - UI Redesign):
- [ ] 8.3.9 Discuss and approve UI design for 30+ parameters
- [ ] 8.3.10 Move ChartPreset4 → ChartPresetCustom (or ChartPreset6)
- [ ] 8.3.11 Remove PARAMETER_OPTIONS hardcoded array
- [ ] 8.3.12 Implement dynamic parameter options from PARAMETERS config
- [ ] 8.3.13 Redesign parameter selection UI (selected design from options)
- [ ] 8.3.14 Simplify parameter handling logic (use perCylinder flag)
- [ ] 8.3.15 Test Custom preset with various parameter combinations
- [ ] 8.3.16 Git commit + documentation update

**Result (Stage 1)**: 5 standard presets using unified conversion API ✅
  - Preset 1 (Performance): P-Av, Torque
  - Preset 2 (MEP): FMEP, IMEP, BMEP, PMEP
  - Preset 3 (Critical): PCylMax, MaxDeg
  - Preset 4 (Combustion): TAF, Timing, Delay, Durat
  - Preset 5 (Efficiency): DRatio, Ceff

**Next**: Stage 2 - Complete redesign of Custom Preset (UI + code)
```

---

#### Update This Roadmap File

**File**: `/Users/mactm/Projects/engine-viewer/docs/tasks/chart-presets-refactoring-roadmap.md`

**Update Progress Tracker table** (top of file):

```markdown
| Stage | Task | Status | Commit |
|-------|------|--------|--------|
| **Stage 1** | Refactor Preset 1 (Performance: P-Av, Torque) | ✅ Complete | [hash] |
| **Stage 1** | Implement NEW Preset 2 (MEP: FMEP, IMEP, BMEP, PMEP) | ✅ Complete | [hash] |
| **Stage 1** | Implement NEW Preset 3 (PCylMax/MaxDeg - Critical Values) | ✅ Complete | [hash] |
| **Stage 1** | Implement NEW Preset 4 (Combustion: TAF, Timing, Delay, Durat) | ✅ Complete | [hash] |
| **Stage 1** | Implement NEW Preset 5 (Efficiency: DRatio, Ceff) | ✅ Complete | [hash] |
| **Stage 1** | Test All 5 Presets + Git Commit + Documentation | ✅ Complete | [hash] |
| **Stage 2** | Discuss & Approve Custom Preset UI Design | ⬜ Not Started | - |
| **Stage 2** | Implement Custom Preset Refactoring | ⬜ Not Started | - |
| **Stage 2** | Test Custom Preset + Git Commit + Documentation | ⬜ Not Started | - |
```

---

## 🚀 STAGE 2: Custom Preset Complete Overhaul

**Goal**: Redesign UI for 30 parameters + refactor code to use PARAMETERS config

**Time**: 3-4 hours (after UI design approval)

**IMPORTANT**: 🚨 **Stage 2 requires USER APPROVAL before coding!** 🚨

---

### Problem Analysis

#### Current UI Design (Screenshot Reference)

**What User Showed**:
- Parameter selection with button grid
- ~8 buttons visible: "P-Av (PS)", "Torque (N·m)", "PCylMax (bar) (avg)", "TCylMax (°C) (avg)", "TUbMax (°C) (avg)", "PurCyl (avg)", "Deto (avg)", "Convergence"
- Buttons toggle on/off (black = selected, white = unselected)
- Warning message: "Multiple parameters with different units selected"

**Why This Won't Scale**:
- Current: 8 parameters → already fills container width
- New Reality: ~30 parameters → would need 3-4 rows → vertical overflow
- Mobile: Unusable (buttons too small or too many rows)
- Accessibility: Difficult to scan 30+ buttons

**Categories We Need to Display** (from PARAMETERS config):
1. **Performance** (3): P-Av, Torque, Power
2. **MEP** (4): FMEP, IMEP, BMEP, PMEP
3. **Temperature** (5): TC-Av, TUbMax, TexAv, Teff
4. **Combustion** (6): Deto, Timing, TAF, MaxDeg, Delay, Durat
5. **Efficiency** (5): PurCyl, DRatio, Seff, Ceff, BSFC
6. **Quality** (1): Convergence

**Total**: ~24 chartable parameters (excluding vibe-model category)

---

### UI Design Options (For Discussion)

#### Option A: Dropdown/Select with Search 🔽

**Design**:
```
[🔍 Search parameters...          ▼]
   ↓ Opens dropdown
   ├─ 🔍 Search: [          ]
   ├─ ☐ P-Av (Average Power)
   ├─ ☐ Torque (Engine Torque)
   ├─ ☐ PCylMax (Max Cylinder Pressure)
   ├─ ... (scrollable)
   └─ ☐ Convergence

Selected: [P-Av ×] [Torque ×] [PCylMax ×]
```

**Implementation**:
- Use Radix UI `Select` component or `Combobox`
- Multi-select with checkboxes
- Search functionality (filter by displayName or name)
- Show selected parameters as chips/badges below

**Pros**:
- ✅ Compact - takes minimal space
- ✅ Scales to 100+ parameters easily
- ✅ Search functionality built-in
- ✅ Familiar UX pattern (like VS Code settings)

**Cons**:
- ⚠️ Requires clicks to open dropdown
- ⚠️ Less visual - can't see all options at once
- ⚠️ More complex implementation

**Best For**: Power users, large parameter sets

---

#### Option B: Categorized Tabs 📑

**Design**:
```
[Performance] [MEP] [Temperature] [Combustion] [Efficiency] [Quality]
────────────────────────────────────────────────────────────────────
Currently viewing: Performance

☐ P-Av          ☐ Torque        ☐ Power
(Average Power) (Engine Torque)  (Power per Cylinder)

Selected: P-Av, Torque, PCylMax (from Temperature tab)
```

**Implementation**:
- Tabs component (Radix UI or custom)
- Each tab shows parameters from that category
- Grid of checkboxes (not buttons)
- Selected parameters summary below

**Pros**:
- ✅ Logical grouping by category
- ✅ Easy to discover parameters
- ✅ Visual organization
- ✅ Fits well with PARAMETERS.category structure

**Cons**:
- ⚠️ Need to switch tabs to see all parameters
- ⚠️ Slightly more clicks to select from multiple categories
- ⚠️ Tabs take vertical space

**Best For**: Users who think in categories (Performance, Temperature, etc.)

---

#### Option C: Accordion by Category 📂

**Design**:
```
▼ Performance (2 selected)
   ☐ P-Av (Average Power) - kW
   ☐ Torque (Engine Torque) - N·m
   ☐ Power (Power per Cylinder) - kW

▼ MEP (0 selected)
   ☐ FMEP (Friction MEP) - bar
   ☐ IMEP (Indicated MEP) - bar
   ☐ BMEP (Brake MEP) - bar
   ☐ PMEP (Pumping MEP) - bar

▶ Temperature (1 selected)
▶ Combustion (0 selected)
▶ Efficiency (0 selected)
▶ Quality (0 selected)
```

**Implementation**:
- Accordion component (Radix UI)
- Each category is collapsible
- Checkboxes for parameters
- Show count of selected in header

**Pros**:
- ✅ All categories visible at once
- ✅ Can expand multiple categories
- ✅ Clear visual hierarchy
- ✅ Shows selection count per category

**Cons**:
- ⚠️ Requires more vertical scrolling
- ⚠️ Can get long with many categories expanded
- ⚠️ Mobile: even longer scrolling

**Best For**: Desktop users, systematic parameter exploration

---

#### Option D: Search + Filter 🔍

**Design**:
```
🔍 Search: [pcyl          ] 🔽 Filter: [All Categories ▼]

Results (3):
☐ PCylMax (Max Cylinder Pressure) - bar - Temperature
☐ PurCyl (Volumetric Efficiency) - (none) - Efficiency
☐ PurCyl (per cyl) - (array) - Efficiency

────────────────────────────────────────────────────────
Filter by Category:
☐ All  ☐ Performance  ☐ MEP  ☐ Temperature
☐ Combustion  ☐ Efficiency  ☐ Quality

Selected (3): [P-Av ×] [Torque ×] [PCylMax ×]
```

**Implementation**:
- Search input with real-time filtering
- Category filter checkboxes
- List view of parameters (not grid)
- Checkbox per parameter

**Pros**:
- ✅ Powerful search and filtering
- ✅ Scales to any number of parameters
- ✅ Can combine search + category filter
- ✅ Best discoverability

**Cons**:
- ⚠️ Most complex to implement
- ⚠️ Takes more vertical space
- ⚠️ Might be overkill for 30 parameters

**Best For**: Power users, exploratory analysis

---

#### Option E: Combo - Tabs + Search (Recommended) ⭐

**Design**:
```
🔍 Search: [          ] (searches across all categories)

[Performance] [MEP] [Temperature] [Combustion] [Efficiency]
────────────────────────────────────────────────────────────
Currently viewing: Performance (3 parameters)

[P-Av]           [Torque]         [Power]
(Average Power)  (Engine Torque)  (per Cylinder)

Selected (3): [P-Av ×] [Torque ×] [PCylMax ×]
⚠️ Mixed units: bar, kW (ensure scales are comparable)
```

**Implementation**:
- Search input at top (filters all tabs)
- Tabs for categories
- Button grid within each tab (like current design)
- Selected parameters as chips below

**Pros**:
- ✅ Best of both worlds: search + categories
- ✅ Familiar button grid UI (current design)
- ✅ Search helps find parameters quickly
- ✅ Tabs organize logically

**Cons**:
- ⚠️ More complex than single approach
- ⚠️ Still need to switch tabs without search

**Best For**: All user types - balances power and simplicity

---

### UI Design Decision Checklist

**Before coding Stage 2, discuss and decide**:

- [ ] **UI Option**: Which design? (A/B/C/D/E or custom)
- [ ] **Search**: Include search functionality? (yes/no)
- [ ] **Categories**: Show categories? How? (tabs/accordion/filter)
- [ ] **Selection Visual**: Buttons (current) or Checkboxes?
- [ ] **Per-Cylinder Params**: Show separately or with (avg) label?
- [ ] **Quick Presets**: Add quick selection buttons? (e.g., "Power & Torque", "Temperatures", "All MEPs")
- [ ] **Maximum Selection**: Limit number of selected parameters? (5? 10? unlimited?)
- [ ] **Mobile UX**: Special considerations for mobile? (collapsible, drawer?)
- [ ] **Mockup**: Create visual mockup or proceed with description?

**Document Decision**:
```
DECISION: [Date]
- UI Option: [E - Combo: Tabs + Search]
- Rationale: [Why this option was chosen]
- Max Selection: [5 parameters]
- Quick Presets: [Yes - "Power & Torque", "All Temperatures"]
- Approved By: [User]
```

---

### Code Refactoring (After UI Approval)

#### Remove PARAMETER_OPTIONS Hardcoded Array

**File**: `frontend/src/components/visualization/ChartPreset4.tsx`

**Delete** (Lines 43-52):
```typescript
const PARAMETER_OPTIONS = [
  { id: 'P-Av', label: 'P-Av (Power)', getUnit: getPowerUnit, isArray: false },
  // ... 8 items
];
```

**Replace with dynamic generation**:
```typescript
import { PARAMETERS } from '@/config/parameters';
import type { ParameterMetadata } from '@/config/parameters';

/**
 * Generate parameter options from PARAMETERS config
 * Filters to chartable parameters only, excludes vibe-model and quality
 */
const PARAMETER_OPTIONS = useMemo(() => {
  return Object.values(PARAMETERS)
    .filter(p => p.chartable)
    .filter(p => ['performance', 'mep', 'temperature', 'combustion', 'efficiency'].includes(p.category))
    .map(param => ({
      id: param.name,
      displayName: param.displayName,
      category: param.category,
      // No need for getUnit or isArray - use PARAMETERS[id] directly
    }));
}, []);

/**
 * Group parameters by category for UI
 */
const PARAMETERS_BY_CATEGORY = useMemo(() => {
  const grouped: Record<string, typeof PARAMETER_OPTIONS> = {};
  PARAMETER_OPTIONS.forEach(param => {
    if (!grouped[param.category]) {
      grouped[param.category] = [];
    }
    grouped[param.category].push(param);
  });
  return grouped;
}, [PARAMETER_OPTIONS]);
```

---

#### Simplify Parameter Handling

**Current approach** (Lines 154-184): Manual isArray checking

**Before**:
```typescript
const paramOption = PARAMETER_OPTIONS.find(opt => opt.id === paramId);
if (!paramOption) continue;

let rawValue: number | number[];
if (paramOption.isArray) {
  // Manual array handling
  rawValue = point[paramId] as number[];
  if (Array.isArray(rawValue)) {
    const avg = rawValue.reduce((sum, v) => sum + v, 0) / rawValue.length;
    // ... manual conversion
  }
}
```

**After**:
```typescript
const param = PARAMETERS[paramId];
if (!param) continue;

const rawValue = point[paramId];

// Automatic array handling using PARAMETERS.perCylinder flag
let valueToConvert: number;
if (Array.isArray(rawValue)) {
  // Average for per-cylinder parameters
  valueToConvert = rawValue.reduce((sum, v) => sum + v, 0) / rawValue.length;
} else {
  valueToConvert = rawValue as number;
}

// Unified conversion
const convertedValue = convertValue(valueToConvert, paramId, units);
```

---

#### Update Legend Generation

**Current** (Lines 262-304): Uses paramOption.label and paramOption.getUnit

**After**:
```typescript
// Dynamic legend based on selected parameters
const legendData = selectedParams.map(paramId => {
  const param = PARAMETERS[paramId];
  const unit = getParameterUnit(paramId, units);
  return `${param.displayName} (${unit || 'no unit'})`;
});
```

---

#### Update Parameter Selection UI

**Implementation depends on chosen UI option**

**Example for Option E (Combo - Tabs + Search)**:

```typescript
{/* Search Input */}
<Input
  placeholder="Search parameters..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="mb-4"
/>

{/* Tabs for Categories */}
<Tabs value={selectedTab} onValueChange={setSelectedTab}>
  <TabsList>
    <TabsTrigger value="performance">Performance</TabsTrigger>
    <TabsTrigger value="mep">MEP</TabsTrigger>
    <TabsTrigger value="temperature">Temperature</TabsTrigger>
    <TabsTrigger value="combustion">Combustion</TabsTrigger>
    <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
  </TabsList>

  {Object.entries(PARAMETERS_BY_CATEGORY).map(([category, params]) => (
    <TabsContent key={category} value={category}>
      <div className="grid grid-cols-3 gap-2">
        {params
          .filter(p =>
            !searchQuery ||
            p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(param => (
            <Button
              key={param.id}
              variant={selectedParams.includes(param.id) ? 'default' : 'outline'}
              onClick={() => toggleParameter(param.id)}
              size="sm"
            >
              {param.displayName}
            </Button>
          ))
        }
      </div>
    </TabsContent>
  ))}
</Tabs>

{/* Selected Parameters */}
<div className="flex flex-wrap gap-2 mt-4">
  {selectedParams.map(paramId => {
    const param = PARAMETERS[paramId];
    const unit = getParameterUnit(paramId, units);
    return (
      <Badge key={paramId} variant="secondary">
        {param.displayName} ({unit})
        <button onClick={() => toggleParameter(paramId)}>×</button>
      </Badge>
    );
  })}
</div>
```

---

### Task 2.1: Test Custom Preset

**After implementation, test thoroughly**:

#### Parameter Selection Tests:

- [ ] **Search**: Type "temp" → only temperature parameters shown
- [ ] **Tabs**: Switch between all tabs → parameters display correctly
- [ ] **Selection**: Click parameter → adds to selected list
- [ ] **Deselection**: Click selected parameter again → removes from list
- [ ] **Maximum**: Try to select more than limit → warning shown (if limit exists)
- [ ] **Categories**: Parameters correctly grouped by category

#### Chart Rendering Tests:

**Test Case 1: Scalar + Scalar**
- [ ] Select P-Av + Torque
- [ ] Chart renders with 2 series
- [ ] Legend shows both parameters
- [ ] Units conversion works

**Test Case 2: Array + Array**
- [ ] Select PCylMax + TC-Av
- [ ] Chart renders with 2 series (averaged)
- [ ] Values make sense (averaged across cylinders)

**Test Case 3: Scalar + Array**
- [ ] Select P-Av + PCylMax
- [ ] Chart renders correctly
- [ ] No errors in console

**Test Case 4: Multiple Parameters**
- [ ] Select 5+ parameters
- [ ] Chart renders all series
- [ ] Legend readable
- [ ] Colors distinguishable

**Test Case 5: Mixed Units Warning**
- [ ] Select P-Av (kW) + PCylMax (bar)
- [ ] Warning message displays
- [ ] Chart still renders

#### Units Conversion Tests:

- [ ] Select parameters, change units: SI → American → HP
- [ ] All parameters update correctly
- [ ] No errors in console

#### Export Tests:

- [ ] Select 3 parameters
- [ ] Export PNG → works
- [ ] Export SVG → works
- [ ] Exported chart shows all 3 series

#### Mobile Tests (if applicable):

- [ ] Open on mobile viewport
- [ ] UI is usable
- [ ] Parameter selection works
- [ ] Chart renders correctly

---

### Task 2.2: Git Commit + Documentation

#### Git Commit

```bash
git add frontend/src/components/visualization/ChartPreset4.tsx

git commit -m "refactor(preset4): complete overhaul with new UI and PARAMETERS config

UI Changes:
  - Redesigned parameter selection UI: [describe chosen option]
  - Added search functionality for quick parameter discovery
  - Organized parameters by category (tabs/accordion/etc)
  - Improved mobile UX
  - Now supports all ~30 chartable parameters

Code Refactoring:
  - Removed PARAMETER_OPTIONS hardcoded array (duplicate config)
  - Generate parameter list dynamically from PARAMETERS config
  - Simplified parameter type handling (use perCylinder flag)
  - Use convertValue() and getParameterUnit() consistently
  - Automatic array averaging for per-cylinder parameters

Benefits:
  - Scales to any number of parameters (currently ~30)
  - Single Source of Truth (PARAMETERS config)
  - Easier to maintain and extend
  - Better UX for parameter selection
  - Consistent with Presets 1-3 conversion API

UI Design: [Option E - Combo: Tabs + Search]
Max Selection: [5 parameters]
Quick Presets: [Power & Torque, All Temperatures]

Phase: Chart Presets Refactoring (Stage 2/2) ✅
Related: Phase 8.3 - Parameter System Integration
All 4 presets now use unified PARAMETERS config system"
```

---

#### Update CHANGELOG.md

**Add under `## [Unreleased]` → `### Changed`**:

```markdown
- **ChartPreset4 (Custom): Complete Overhaul** (2025-11-02):
  - ✅ **UI Redesign**: Implemented [Option E: Combo - Tabs + Search] to support ~30 parameters
    - Search functionality for quick parameter discovery
    - Category tabs: Performance, MEP, Temperature, Combustion, Efficiency
    - Button grid within each tab (familiar UI from current design)
    - Selected parameters displayed as chips/badges
    - Warning for mixed units
  - ✅ **Code Refactoring**:
    - Removed hardcoded PARAMETER_OPTIONS array (duplicate configuration)
    - Generate parameter options dynamically from PARAMETERS config
    - Simplified parameter type handling using perCylinder flag from config
    - Unified conversion API: convertValue() and getParameterUnit()
    - Automatic array averaging for per-cylinder parameters
  - ✅ **Consistency**: All 4 chart presets now use unified PARAMETERS config system
  - ✅ **Scalability**: UI scales to any number of parameters (tested with 30)
  - ✅ **Maintainability**: Single Source of Truth, no code duplication
  - File: [frontend/src/components/visualization/ChartPreset4.tsx](frontend/src/components/visualization/ChartPreset4.tsx)
  - Commit: [commit-hash]

**Result**: Chart Presets Migration Complete ✅
All 4 presets use PARAMETERS config, unified conversion API, ready for future expansion
```

---

#### Update roadmap-v2.0-COMPLETE.md

**Update Phase 8.3 section**:

```markdown
### Phase 8.3: Chart Presets Migration - COMPLETE ✅

**Goal**: Migrate all chart presets to use unified PARAMETERS config system

**Status**: Complete (2/2 stages)

**Stage 1 Tasks** (Presets 1-3):
- [X] 8.3.1 - 8.3.6 (see Stage 1 section above)

**Stage 2 Tasks** (ChartPreset4 - Custom):
- [X] 8.3.7 Discuss and approve UI design for 30+ parameters
  - Evaluated 5 UI options (Dropdown, Tabs, Accordion, Search+Filter, Combo)
  - Selected: Option E (Combo - Tabs + Search)
  - Rationale: Best balance of power and simplicity, scales to any number of parameters
- [X] 8.3.8 Remove PARAMETER_OPTIONS hardcoded array
  - Deleted 8-item hardcoded array
  - Violates DRY principle - duplicated PARAMETERS config
- [X] 8.3.9 Implement dynamic parameter options from PARAMETERS config
  - Filter: chartable parameters only
  - Exclude: vibe-model and quality categories
  - Group by category for UI organization
- [X] 8.3.10 Redesign parameter selection UI
  - Search input at top
  - Category tabs: Performance, MEP, Temperature, Combustion, Efficiency
  - Button grid within each tab (3-column grid)
  - Selected parameters as chips with remove button
  - Mixed units warning
- [X] 8.3.11 Simplify parameter handling logic
  - Use PARAMETERS[id].perCylinder instead of manual isArray flags
  - Automatic array averaging
  - Unified convertValue() calls
- [X] 8.3.12 Test Custom preset with various parameter combinations
  - Tested: Scalar + Scalar, Array + Array, Scalar + Array
  - Tested: Multiple parameters (5+)
  - Tested: Units conversion (SI ↔ American ↔ HP)
  - Tested: Mobile UX
  - Tested: Export (PNG, SVG)
- [X] 8.3.13 Git commit + documentation update

**Final Result**:
- ✅ All 4 chart presets migrated to unified PARAMETERS config system
- ✅ Consistent conversion API across all presets
- ✅ Custom Preset scales to 30+ parameters
- ✅ No code duplication
- ✅ Single Source of Truth (PARAMETERS config)
- ✅ Ready for future expansion (new formats, new parameters)

**Total Work**: ~6 hours (Stage 1: 2-3h, Stage 2: 3-4h)

**Next Phase**: TBD
```

---

#### Update This Roadmap File

**Update Progress Tracker** (top of file):

```markdown
| Stage | Task | Status | Commit |
|-------|------|--------|--------|
| **Stage 1** | Refactor ChartPreset1 (Power & Torque) | ✅ Complete | [hash] |
| **Stage 1** | Refactor ChartPreset2 (Cylinder Pressure) | ✅ Complete | [hash] |
| **Stage 1** | Refactor ChartPreset3 (Temperature) | ✅ Complete | [hash] |
| **Stage 1** | Test Presets 1-3 + Git Commit + Documentation | ✅ Complete | [hash] |
| **Stage 2** | Discuss & Approve Custom Preset UI Design | ✅ Complete | - |
| **Stage 2** | Implement Custom Preset Refactoring | ✅ Complete | [hash] |
| **Stage 2** | Test Custom Preset + Git Commit + Documentation | ✅ Complete | [hash] |

**Status**: 🟢 Complete (2/2 stages, 7/7 tasks)
```

**Add completion section** (at the end):

```markdown
---

## ✅ Completion Summary

**Start Date**: 2025-11-02
**End Date**: 2025-11-0X
**Total Time**: ~6 hours
**Commits**: 2 (Stage 1 + Stage 2)

### What Was Accomplished:

1. **Unified Conversion API**:
   - All 4 presets use `convertValue()` and `getParameterUnit()`
   - Eliminated 8 specific conversion functions
   - Consistent pattern across codebase

2. **PARAMETERS Config Integration**:
   - All presets read from `PARAMETERS` config
   - No hardcoded parameter arrays
   - Single Source of Truth achieved

3. **Custom Preset UI Overhaul**:
   - Redesigned to support 30+ parameters
   - Implemented [chosen UI option]
   - Improved UX and discoverability

4. **Code Quality**:
   - Eliminated code duplication
   - Simplified parameter handling
   - Easier to maintain and extend

5. **Multi-Format Support**:
   - All presets work seamlessly with .det, .pou, merged formats
   - Optional parameter handling (TC-Av, PCylMax)
   - Array averaging for per-cylinder parameters

### Files Changed:

- `frontend/src/components/visualization/ChartPreset1.tsx` (Stage 1)
- `frontend/src/components/visualization/ChartPreset2.tsx` (Stage 1)
- `frontend/src/components/visualization/ChartPreset3.tsx` (Stage 1)
- `frontend/src/components/visualization/ChartPreset4.tsx` (Stage 2)

### Documentation Updated:

- `CHANGELOG.md` (2 entries)
- `roadmap-v2.0-COMPLETE.md` (Phase 8.3)
- `docs/tasks/chart-presets-refactoring-roadmap.md` (this file)

### Git Commits:

1. **Stage 1**: `refactor(presets): migrate Presets 1-3 to unified conversion API`
2. **Stage 2**: `refactor(preset4): complete overhaul with new UI and PARAMETERS config`

### Success Metrics:

- ✅ Zero breaking changes to existing functionality
- ✅ All manual tests passed
- ✅ No console errors or warnings
- ✅ Export functionality works (PNG, SVG)
- ✅ Units conversion accurate across all presets
- ✅ Custom Preset scales to 30+ parameters

### Lessons Learned:

- UI design approval before coding saves time
- Detailed roadmap helps maintain focus
- Stage-by-stage approach reduces risk
- Comprehensive testing catches issues early

---

## 📊 Next Steps (After Completion)

**Potential Future Enhancements**:

1. **Parameter Presets**: Add quick selection buttons
   - "Power & Torque" (P-Av + Torque)
   - "All Temperatures" (TC-Av + TUbMax)
   - "All MEPs" (FMEP + IMEP + BMEP + PMEP)

2. **Advanced Filtering**: Add more filter options
   - Filter by unit type (pressure, temperature, power)
   - Filter by per-cylinder vs scalar
   - Filter by format availability (.det only, .pou only, both)

3. **Chart Templates**: Save custom parameter selections
   - User can save combinations
   - Recall saved templates
   - Share templates between projects

4. **Export Enhancements**:
   - Export with custom filename
   - Export multiple presets at once
   - Export data as CSV/Excel

5. **Comparison Mode Improvements**:
   - Different line styles per project (not just color)
   - Side-by-side comparison view
   - Difference/delta calculation

**These are optional - discuss before implementing!**
```

---

## 📖 Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `ChartPreset1.tsx` | Power & Torque (dual Y-axis) |
| `ChartPreset2.tsx` | Cylinder Pressure (multi-series per cylinder) |
| `ChartPreset3.tsx` | Temperature (optional TC-Av handling) |
| `ChartPreset4.tsx` | Custom (user-selected parameters) |
| `parameters.ts` | PARAMETERS config (Single Source of Truth) |
| `unitsConversion.ts` | Unified conversion API |

### Key Functions

```typescript
// Unified conversion (use this)
convertValue(value: number, paramName: string, units: Units): number

// Unified unit getter (use this)
getParameterUnit(paramName: string, units: Units): string

// PARAMETERS config access
PARAMETERS[paramName].displayName
PARAMETERS[paramName].category
PARAMETERS[paramName].perCylinder
PARAMETERS[paramName].chartable
```

### Common Patterns

**Data Conversion**:
```typescript
// For scalar parameters
const converted = convertValue(point['P-Av'], 'P-Av', units);

// For array parameters (per-cylinder)
const avg = point.PCylMax.reduce((sum, v) => sum + v, 0) / point.PCylMax.length;
const converted = convertValue(avg, 'PCylMax', units);
```

**Unit Labels**:
```typescript
const unit = getParameterUnit('P-Av', units); // "kW" or "bhp" or "PS"
```

**Optional Parameters**:
```typescript
// Check if parameter exists (e.g., TC-Av in .det only)
const hasTCAv = calc.data[0]?.['TC-Av'] !== undefined;
```

---

## 🆘 Troubleshooting

### Issue: Conversion not working

**Symptom**: Numbers don't change when switching units

**Solution**:
- Check parameter name is correct (case-sensitive)
- Verify parameter exists in PARAMETERS config
- Ensure `conversionType` is set correctly in config

### Issue: "Unknown parameter" warning

**Symptom**: Console warning about unknown parameter

**Solution**:
- Parameter name might be misspelled
- Parameter might not be in PARAMETERS config
- Check if parameter name changed (e.g., TCylMax → TC-Av)

### Issue: Array parameter not displaying

**Symptom**: Per-cylinder parameter shows NaN or undefined

**Solution**:
- Check if parameter is optional (exists in file format?)
- Verify array averaging logic
- Check if `perCylinder` flag is set in PARAMETERS config

### Issue: Custom Preset UI broken

**Symptom**: Parameters not showing or clicking doesn't work

**Solution**:
- Check `PARAMETERS.chartable` flag is true
- Verify category filter logic
- Check if parameter is excluded (vibe-model, quality)

---

## 📝 Notes for Future Claude Sessions

**When Opening This Roadmap**:

1. Check Progress Tracker at top - which stage is active?
2. If Stage 1 incomplete → follow Stage 1 tasks sequentially
3. If Stage 1 complete but Stage 2 not started → **DISCUSS UI DESIGN FIRST**
4. If Stage 2 in progress → check which UI option was approved
5. Always update Progress Tracker after completing tasks

**Key Principles**:

- ✅ Stage 1 is straightforward - just replace functions
- ⚠️ Stage 2 requires user approval BEFORE coding
- 📝 Update Progress Tracker after each task
- 🧪 Test thoroughly after each stage
- 📚 Update documentation after each stage

**Common Questions**:

Q: Can I start Stage 2 immediately?
A: NO! Stage 2 requires UI design approval first.

Q: Can I combine stages?
A: NO! Each stage ends with commit + documentation.

Q: Can I skip testing?
A: NO! Manual testing is required before commit.

---

**End of Roadmap**

Last Updated: 2025-11-02
