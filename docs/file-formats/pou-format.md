# .pou File Format Specification

**Version:** 1.0
**Date:** November 1, 2025
**Status:** Complete

**📖 См. также:** [EngMod4T Overview](../engmod4t-suite/engmod4t-overview.md) - Single Source of Truth о программе-источнике и универсальном формате файлов.

---

## Overview

`.pou` files are extended engine calculation result files produced by EngMod4T simulation software (Delphi 7). They contain more detailed information compared to `.det` files (24 parameters).

### Key Characteristics

- **Source:** EngMod4T simulation software (Delphi 7)
- **Format:** Fixed-width ASCII text (**NOT** space-separated CSV)
- **Encoding:** ASCII (Windows-1251 for Cyrillic metadata)
- **Parameters per data point:**
  - **NATUR engines:** 71 parameters
  - **TURBO engines:** 78 parameters (71 base + 7 turbo-specific)
  - **SUPER engines:** 78 parameters (71 base + 7 supercharger-specific)
  - **With .det merge:** +3 parameters (PCylMax, Deto, Convergence)
- **Structure:** Metadata + Headers + Calculation blocks
- **Markers:** Same `$` calculation markers as `.det` format
- **Per-Cylinder Data:** Arrays of values for each engine cylinder

### Automatic Data Merge

**Important:** When both `.pou` and `.det` files exist with the same base name, the application automatically merges data:

```
project-name.pou  (71 parameters)
project-name.det  (adds PCylMax + Deto + Convergence)
          ↓
  Automatic merge
          ↓
  Result: 74 parameters
```

**What gets added:**
- **PCylMax** - Maximum cylinder pressure (bar) - from .det file
- **Deto** - Detonation indicator - from .det file
- **Convergence** - Calculation convergence quality - from .det file

**NOT merged (duplicate):**
- **TCylMax** - .pou already has TC-Av (average cylinder temperature)

This merge is **transparent** - frontend receives already-merged data with all parameters. See [comparison.md](comparison.md#automatic-data-merge-best-of-both-formats) for details.

**Total parameters after merge:**
- NATUR: 71 + 3 = 74 parameters
- TURBO: 78 + 3 = 81 parameters
- SUPER: 78 + 3 = 81 parameters

---

## File Structure

### Line-by-Line Format

```
Line 1: Metadata (5 fields)
Line 2: Column headers (71-78 parameters, depends on engine type)
Line 3+: Calculation markers ($) and data points
```

### Example Structure

```
           4 NATUR       0       0     NumCyl,Breath,NumTurbo,NumWasteGate
     RPM        P-Av       Torque    TexAv   Power( 1)  Power( 2) ... [71 parameters for NATUR]
$Cal_1
        3200       48.30      144.14     584.6      12.08      12.07 ... [71 values]
        3400       52.52      147.60     595.3      13.13      13.13 ... [71 values]
$Cal_2
        3200       46.85      139.90     571.2      11.71      11.71 ... [71 values]
```

**Example for TURBO engine:**
```
           4 TURBO       1       1     NumCyl,Breath,NumTurbo,NumWasteGate
     RPM        P-Av       Torque    TexAv   ... [71 base] ... Boost(1) BackPr Pratio TBoost TTurbine RPMturb(1) WastRat(1)
$Cal_1
        2000       58.05      277.17     553.8 ... [71 values] ... 1.030 0.555 0.539 62.6 688.5 52528 0.000
```

---

## Metadata (Line 1)

### Format

```
<NumCylinders> <EngineType> <Breath> <NumTurbo> <NumWasteGate>
```

### Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `NumCylinders` | integer | Number of engine cylinders | `4` |
| `EngineType` | string | Engine aspiration type | `NATUR`, `TURBO` |
| `Breath` | integer | Breathing configuration (0/1) | `0` |
| `NumTurbo` | integer | Number of turbochargers | `0` |
| `NumWasteGate` | integer | Number of wastegate valves | `0` |

### Example

```
           4 NATUR       0       0     NumCyl,Breath,NumTurbo,NumWasteGate
```

**Interpretation:**
- 4-cylinder engine
- Naturally aspirated (NATUR)
- Standard breathing (0)
- No turbochargers (0)
- No wastegate valves (0)

---

## Column Headers (Line 2)

71 parameters organized in the following groups:

### 1. Global Parameters (4 parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `RPM` | об/мин | Engine speed (revolutions per minute) |
| `P-Av` | кВт | Average power output |
| `Torque` | Н·м | Engine torque |
| `TexAv` | °C | Average exhaust temperature |

### 2. Per-Cylinder Power (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Power(1..N)` | кВт | Power output for each cylinder |

**Note:** N = number of cylinders (typically 4, 6, 8, etc.)

### 3. Per-Cylinder IMEP (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `IMEP(1..N)` | бар | Indicated Mean Effective Pressure for each cylinder |

**Definition:** IMEP represents the theoretical pressure that would produce the same work output as the actual pressure curve.

### 4. Per-Cylinder BMEP (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `BMEP(1..N)` | бар | Brake Mean Effective Pressure for each cylinder |

**Definition:** BMEP is the average pressure that would produce the measured engine power, accounting for friction and pumping losses.

### 5. Per-Cylinder PMEP (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `PMEP(1..N)` | бар | Pumping Mean Effective Pressure for each cylinder |

**Definition:** PMEP represents the work required to move gas in and out of the cylinder (negative work).

### 6. Global FMEP (1 parameter)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `FMEP` | бар | Friction Mean Effective Pressure |

**Definition:** FMEP represents the pressure equivalent of mechanical friction losses in the engine.

### 7. Per-Cylinder DRatio (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `DRatio(1..N)` | - | Delivery ratio for each cylinder |

**Definition:** Ratio of actual air mass to theoretical air mass that could fill the cylinder volume.

### 8. Per-Cylinder PurCyl (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `PurCyl(1..N)` | - | Mixture purity at inlet valve closure for each cylinder |

**Definition:** The ratio of fresh air trapped at inlet valve closure to the total mass of the cylinder charge.

### 9. Per-Cylinder Seff (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Seff(1..N)` | - | Scavenging efficiency for each cylinder |

**Definition:** Ratio of fresh charge retained in cylinder to total charge delivered.

### 10. Per-Cylinder Teff (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Teff(1..N)` | - | Trapping efficiency for each cylinder |

**Definition:** Ratio of fresh charge retained to fresh charge supplied.

### 11. Per-Cylinder Ceff (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Ceff(1..N)` | - | Charging efficiency for each cylinder |

**Definition:** Combined metric of cylinder charging effectiveness.

### 12. Per-Cylinder BSFC (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `BSFC(1..N)` | kg/kWh | Brake Specific Fuel Consumption for each cylinder |

**Definition:** Ratio of fuel consumption rate to power produced by that fuel. Standard SI units (kg/kWh).

### 13. Per-Cylinder TC-Av (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `TC-Av(1..N)` | °C | Average cylinder temperature for each cylinder |

**Definition:** Mean temperature inside the cylinder during the cycle.

### 14. Per-Cylinder TUbMax (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `TUbMax(1..N)` | °C | Maximum exhaust gas temperature for each cylinder |

**Definition:** Peak temperature in the exhaust port.

### 15. Per-Cylinder MaxDeg (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `MaxDeg(1..N)` | градусы | Crank angle at maximum pressure for each cylinder |

**Definition:** Crankshaft position (degrees after TDC) where peak cylinder pressure occurs.

### 16. Global Timing (1 parameter)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Timing` | градусы | Ignition/injection timing |

**Definition:** Crankshaft angle at which ignition or fuel injection begins.

### 17. Per-Cylinder Delay (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Delay(1..N)` | градусы | Ignition delay for each cylinder |

**Definition:** Time delay between ignition/injection and start of combustion.

### 18. Per-Cylinder Durat (N parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Durat(1..N)` | градусы | Combustion duration for each cylinder |

**Definition:** Crankshaft angle duration of the combustion event.

### 19. Global TAF (1 parameter)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `TAF` | - | Total Air Flow |

**Definition:** Total mass flow rate of air entering the engine.

### 20. Vibe Model Parameters (4 parameters)

| Parameter | Unit | Description |
|-----------|------|-------------|
| `VibeDelay` | градусы | Vibe combustion model delay parameter |
| `VibeDurat` | градусы | Vibe combustion model duration parameter |
| `VibeA` | - | Vibe model shape parameter A |
| `VibeM` | - | Vibe model shape parameter M |

**Definition:** Parameters for the Vibe combustion model, which describes the heat release rate during combustion.

### 21. Turbocharger Parameters (7 parameters, TURBO engines only)

**Note:** These parameters are included **only** if `EngineType = TURBO` in metadata.

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Boost(1)` | bar gauge | The simulated boost pressure at the specified boost point |
| `BackPr` | bar gauge | The simulated back pressure |
| `Pratio` | - | The ratio between the boost pressure and the back pressure |
| `TBoost` | °C | The simulated inlet temperature at the specified boost point |
| `TTurbine` | °C | The simulated turbine inlet temperature |
| `RPMturb(1)` | RPM | The turbocharger RPM |
| `WastRat(1)` | - | The open ratio of the waste gate if one is fitted |

**Example values from GRANTA TURBO.pou:**
```
Boost(1)   BackPr   Pratio   TBoost   TTurbine   RPMturb(1)   WastRat(1)
1.030      0.555    0.539    62.6     688.5      52528        0.000
```

### 22. Supercharger Parameters (7 parameters, SUPER engines only)

**Note:** These parameters are included **only** if `EngineType = SUPER` in metadata.

| Parameter | Unit | Description |
|-----------|------|-------------|
| `Boost` | bar gauge | The simulated boost pressure at the specified boost point |
| `BackPr` | bar gauge | The simulated back pressure |
| `Pratio` | - | The ratio between the boost pressure and the back pressure |
| `TBoost` | °C | The simulated inlet temperature at the specified boost point |
| `RPMsup` | RPM | The supercharger RPM |
| `PowSup` | kW | The total power absorbed by driving the supercharger compressor |
| `BOVrat` | - | The open ratio of the blow off valve if one is fitted |

**Definition:** Supercharged engines have mechanically-driven compressors. `PowSup` represents the power loss from driving the supercharger, which is subtracted from `P-Av`.

---

## Parameter Count Summary

### NATUR Engines (Naturally Aspirated)

| Category | Count | Description |
|----------|-------|-------------|
| Global parameters | 4 | RPM, P-Av, Torque, TexAv |
| Per-cylinder arrays | 16 × N | Power, IMEP, BMEP, PMEP, DRatio, PurCyl, Seff, Teff, Ceff, BSFC, TC-Av, TUbMax, MaxDeg, Delay, Durat |
| Global FMEP | 1 | Friction losses |
| Global Timing | 1 | Ignition/injection timing |
| Global TAF | 1 | Total air flow |
| Vibe parameters | 4 | Combustion model |
| **Total (4-cyl NATUR)** | **71** | 4 + (16 × 4) + 1 + 1 + 1 + 4 = 71 |

### TURBO Engines (Turbocharged)

| Category | Count | Description |
|----------|-------|-------------|
| Base parameters | 71 | All NATUR parameters (see above) |
| Turbo-specific | 7 | Boost(1), BackPr, Pratio, TBoost, TTurbine, RPMturb(1), WastRat(1) |
| **Total (4-cyl TURBO)** | **78** | 71 + 7 = 78 |

### SUPER Engines (Supercharged)

| Category | Count | Description |
|----------|-------|-------------|
| Base parameters | 71 | All NATUR parameters (see above) |
| Supercharger-specific | 7 | Boost, BackPr, Pratio, TBoost, RPMsup, PowSup, BOVrat |
| **Total (4-cyl SUPER)** | **78** | 71 + 7 = 78 |

---

## Calculation Markers

Same as `.det` format - calculation blocks are marked with `$` prefix.

### Format

```
$<calculation_name>
```

### Examples

```
$Cal_1          → Display name: "Cal_1"
$baseline       → Display name: "baseline"
$3.1 R 0.86     → Display name: "3.1 R 0.86"
```

### Usage

- Each `$` line starts a new calculation block
- All data lines following the marker belong to that calculation
- Data lines continue until the next `$` marker or end of file

---

## Data Point Format

### Structure

Each data line contains 71 space-separated numeric values corresponding to the column headers.

### Value Types

- **Integers:** RPM values (e.g., `3200`, `3400`)
- **Floats:** All other measurements (e.g., `48.30`, `144.14`, `584.6`)
- **Precision:** Typically 2 decimal places, some values use 0 or 1 decimal place

### Example Data Line

```
3200  48.30  144.14  584.6  12.08  12.07  12.07  12.08  7.58  7.58 ... [71 values total]
```

### Per-Cylinder Array Order

Per-cylinder parameters are always ordered sequentially:
- 4-cylinder engine: `(1) (2) (3) (4)`
- 6-cylinder engine: `(1) (2) (3) (4) (5) (6)`

**Example for Power parameter (4-cyl):**
```
Power(1)  Power(2)  Power(3)  Power(4)
12.08     12.07     12.07     12.08
```

---

## Parsing Rules

### Fixed-width ASCII Format

**Important:** `.pou` files use fixed-width ASCII format (Delphi origin), **NOT** CSV format.

- **Multiple spaces** separate columns (not single space or comma)
- **Right-aligned** numbers with space padding
- Created by: `WriteLn(F, Format('%12.2f ...', [values]))`

### Line Processing

1. **Skip first column** (line number marker `→`)
2. **Split by multiple spaces** using `split(/\s+/)` (NOT CSV parser)
3. **Parse metadata** from line 1 (5 fields)
4. **Parse headers** from line 2 (71 fields)
5. **Parse data** from line 3+ (71 values per line)

**Correct parsing approach:**
```javascript
// ✅ ПРАВИЛЬНО: Split по множественным пробелам
const values = line.trim().split(/\s+/).slice(1);  // slice(1) пропускает первую колонку

// ❌ НЕПРАВИЛЬНО: Использовать CSV парсер
const values = line.split(',');  // НЕТ! Это не CSV формат
```

### Calculation Grouping

```javascript
for each line in file:
  if line starts with '$':
    start new calculation
  else if line has data:
    add data point to current calculation
```

### Per-Cylinder Parameter Extraction

For a 4-cylinder engine, per-cylinder parameters are extracted in blocks of 4:

```javascript
let idx = 4; // After RPM, P-Av, Torque, TexAv

// Power(1-4)
for (let i = 0; i < numCylinders; i++) {
  dataPoint.Power.push(parseFloat(values[idx++]));
}

// IMEP(1-4)
for (let i = 0; i < numCylinders; i++) {
  dataPoint.IMEP.push(parseFloat(values[idx++]));
}

// ... continue for all per-cylinder parameters
```

---

## Comparison with .det Format

| Feature | .det Format | .pou Format |
|---------|-------------|-------------|
| **Parameters** | 24 | 71 |
| **Metadata fields** | 2 (NumCyl, EngineType) | 5 (NumCyl, EngineType, Breath, NumTurbo, NumWasteGate) |
| **Markers** | `$` prefix | `$` prefix (identical) |
| **Per-cylinder arrays** | 5 (PurCyl, TUbMax, TCylMax, PCylMax, Deto) | 16 (Power, IMEP, BMEP, PMEP, DRatio, PurCyl, Seff, Teff, Ceff, BSFC, TC-Av, TUbMax, MaxDeg, Delay, Durat) |
| **Combustion model** | No | Yes (Vibe parameters) |
| **Use case** | Basic analysis | Detailed engineering analysis |

### Additional Parameters in .pou

The `.pou` format adds:
- **Power breakdown** per cylinder
- **Pressure analysis** (IMEP, BMEP, PMEP, FMEP)
- **Efficiency metrics** (Seff, Teff, Ceff, DRatio)
- **Fuel consumption** (BSFC per cylinder)
- **Combustion timing** (MaxDeg, Timing, Delay, Durat)
- **Combustion modeling** (Vibe parameters)
- **Temperatures** (TC-Av, TexAv)
- **Air flow** (TAF)

---

## Example File

See [sample.pou](examples/sample.pou) for a complete example with:
- 4-cylinder naturally aspirated engine
- 2 calculations ($Cal_1, $Cal_2)
- 5 RPM points per calculation (3200-4000 RPM)

---

## TypeScript Type Definition

```typescript
/**
 * Метаданные из первой строки .pou файла
 */
export interface PouMetadata {
  numCylinders: number;      // Количество цилиндров
  engineType: string;         // Тип двигателя (NATUR, TURBO)
  breath: number;             // Дыхание (0/1)
  numTurbo: number;           // Количество турбин
  numWasteGate: number;       // Количество wastegate
}

/**
 * Одна точка данных из .pou файла
 * Base parameters: 71 (NATUR)
 * With turbo: +7 parameters (TURBO)
 * With supercharger: +7 parameters (SUPER)
 */
export interface PouDataPoint {
  RPM: number;                // Обороты двигателя (об/мин)
  'P-Av': number;             // Средняя мощность (кВт)
  Torque: number;             // Крутящий момент (Н·м)
  TexAv: number;              // Средняя температура выпуска (°C)

  // Per-cylinder arrays (N = numCylinders)
  Power: number[];            // Мощность для каждого цилиндра (кВт)
  IMEP: number[];             // Индикаторное среднее эффективное давление (бар)
  BMEP: number[];             // Brake Mean Effective Pressure (бар)
  PMEP: number[];             // Pumping Mean Effective Pressure (бар)
  FMEP: number;               // Friction Mean Effective Pressure (бар)
  DRatio: number[];           // Degree Ratio
  PurCyl: number[];           // Mixture purity at inlet valve closure
  Seff: number[];             // Scavenging efficiency
  Teff: number[];             // Trapping efficiency
  Ceff: number[];             // Charging efficiency
  BSFC: number[];             // Brake Specific Fuel Consumption (kg/kWh)
  'TC-Av': number[];          // Температура в цилиндре средняя (°C)
  TUbMax: number[];           // Максимальная температура выпускных газов (°C)
  MaxDeg: number[];           // Максимальный угол (градусы)

  // Global timing and combustion
  Timing: number;             // Timing (градусы)
  Delay: number[];            // Задержка для каждого цилиндра (градусы)
  Durat: number[];            // Продолжительность для каждого цилиндра (градусы)
  TAF: number;                // Total Air Flow

  // Vibe combustion model
  VibeDelay: number;          // Задержка Vibe (градусы)
  VibeDurat: number;          // Продолжительность Vibe (градусы)
  VibeA: number;              // Параметр A Vibe
  VibeM: number;              // Параметр M Vibe

  // Turbocharger parameters (only if engineType = TURBO)
  'Boost(1)'?: number;        // Boost pressure (bar gauge)
  BackPr?: number;            // Back pressure (bar gauge)
  Pratio?: number;            // Boost/back pressure ratio
  TBoost?: number;            // Inlet temperature (°C)
  TTurbine?: number;          // Turbine inlet temperature (°C)
  'RPMturb(1)'?: number;      // Turbocharger RPM
  'WastRat(1)'?: number;      // Waste gate open ratio

  // Supercharger parameters (only if engineType = SUPER)
  Boost?: number;             // Boost pressure (bar gauge)
  // BackPr?: number;         // Already declared above (shared with TURBO)
  // Pratio?: number;         // Already declared above (shared with TURBO)
  // TBoost?: number;         // Already declared above (shared with TURBO)
  RPMsup?: number;            // Supercharger RPM
  PowSup?: number;            // Power absorbed by supercharger (kW)
  BOVrat?: number;            // Blow off valve open ratio
}
```

---

## Implementation Notes

### Parser Location

`backend/src/parsers/formats/pouParser.js`

### Key Methods

- `parseMetadata(line)` - Extracts 5 metadata fields
- `parseColumnHeaders(line)` - Extracts 71 column names
- `parseDataLine(line, headers, numCylinders)` - Extracts 71 values per data point

### Auto-Detection

The format detector identifies `.pou` files by:
1. **Extension:** `.pou` file extension
2. **Content:** 5 metadata fields in line 1 (vs 2 in `.det`)

```javascript
// In formatDetector.js
if (parts.length >= 5) {
  return 'pou'; // Extended metadata → .pou format
}
```

---

## References

- [.det Format Specification](det-format.md)
- [Format Comparison](comparison.md)
- [Parser Implementation Guide](../parsers-guide.md)
- [Example .pou File](examples/sample.pou)

---

**Last Updated:** November 1, 2025
**Maintained by:** Engine Viewer Development Team
