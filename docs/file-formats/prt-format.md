# .prt File Format - Detailed Specification

**Version:** 1.0  
**Last Updated:** 2025-11-12  
**Source:** DAT4T v7.1.9 (EngMod4T Suite)  
**Related:** [ADR 014: .prt File Format](../decisions/014-prt-file-format.md)

---

## Overview

**.prt = "Printable summary"** всех subsystems проекта двигателя.

**Purpose:** Хранит complete engine configuration для EngMod4T simulation  
**Format:** Fixed-width ASCII text (human-readable)  
**Encoding:** Windows-1251 (Cyrillic support)  
**Created by:** DAT4T (pre-processor)  
**Read by:** EngMod4T (simulation), Engine Results Viewer (metadata extraction)

**Typical size:** ~400 lines, 10-15 KB

---

## File Structure

**8 main sections:**

| Section | Lines | Description | Extracted Data |
|---------|-------|-------------|----------------|
| 1. Header | 1-31 | Project name, date, version, subsystem files | `projectName`, `created`, `datVersion` |
| 2. Engine Data | 33-63 | Cylinders, bore, stroke, CR, type | `cylinders`, `type`, `bore`, `stroke`, `compressionRatio`, `maxPowerRPM` |
| 3. Exhaust Port | 67-131 | Valve count, dimensions, lift profile | `exhaustValves` |
| 4. Inlet Port | 134-194 | Valve count, dimensions, lift profile | `inletValves` |
| 5. Exhaust System | 199-267 | Manifold type, pipes, collectors | `exhaustSystem` (e.g., "4-2-1") |
| 6. Intake System | 271-353 | Manifold type, throttles, plenums | `intakeSystem` ("ITB", "IM", "Carb") |
| 7. Ignition Model | 356-375 | Fuel, combustion curves (8 RPM points) | `combustion.fuelType`, `combustion.curves` |
| 8. Temperatures | 380-395 | Wall temps, atmospheric conditions | Temperature data |

**Separator:** Asterisks (`*********`) between sections

---

## Section 1: Header (lines 1-31)

### Purpose
Identifies project, creation date, DAT4T version, subsystem files.

### Structure

```
********************************************************************

   This File lists the input data as set up for the:

             [PROJECT_NAME]                 engine 

   for use by the EngMod4T engine simulation program.

   This dataFile was constructed on:  [DD-MM-YYYY]
                                 at: [HH]h:[MM]min

   using Dat4T Version: [VERSION]       

********************************************************************

 The PROJECT File contains the following subsystem Files:  

 Engine:                   [PROJECT].eng            
 Exhaust port:             [PROJECT].exp            
 Intake port:              [PROJECT].ipo            
 Exhaust type and lengths: [PROJECT].exl            
 Exhaust diameters:        [PROJECT].exd            
 Intake type and lengths:  [PROJECT].inl            
 Intake diameters:         [PROJECT].ind            
 Combustion data:          [PROJECT].cbd            
 Temperature data:         [PROJECT].tmp            

********************************************************************
```

### Extracted Data

**Project Name (line 8):**
```
"              4_Cyl_ITB                 engine"
```
Extract: Remove "engine" suffix, trim → `"4_Cyl_ITB"`

**Creation Date (lines 12-13):**
```
"   This dataFile was constructed on:  8-11-2025"
"                                 at: 18h:34min"
```
Parse: `DD-MM-YYYY` + `HH:MM` → ISO 8601 timestamp `"2025-11-08T18:34:00Z"`

**DAT4T Version (line 15):**
```
"   using Dat4T Version: V7.1.9"
```
Extract: `"V7.1.9"`

---

## Section 2: Engine Data (lines 33-63)

### Purpose
Core engine specifications (geometry, type, configuration).

### Structure

```
General engine data:  
--------------------

 This is a [ENGINE_TYPE] Engine.

Number of cylinders                                 [N]
The engine is an                          : [CONFIG] TYPE

The Cylinder head is of [FLOW_TYPE] type with [N] valves

Bore                                        [XX.XXXXX]      mm
Stroke                                      [XX.XXXXX]      mm
Conrod length                               [XXX.XXXX]      mm
Geometric Compression Ratio                 [XX.XXXXX]    
RPM for Maximum Power                       [XXXX.XXX]    
```

### Extracted Data

**Engine Type (line 36):**
```
"This is a Naturally Aspirated Spark Ignition Engine."  → "NA"
"This is a Turbocharged Spark Ignition Engine."         → "Turbo"
"This is a Supercharged Spark Ignition Engine."         → "Supercharged"
```

**Cylinders (line 38):**
```
"Number of cylinders                                 4"
```
Extract: `4`

**Configuration (line 39):**
```
"The engine is an                          : INLINE TYPE"  → "inline"
"The engine is an                          : VEE TYPE"     → "vee"
```

**Valves Per Cylinder (line 44):**
```
"The Cylinder head is of Tumble Flow type with 4 valves"
```
Extract: `4`

**Bore (line 46):**
```
"Bore                                        82.50000      mm"
```
Extract: `82.5` (mm)

**Stroke (line 47):**
```
"Stroke                                      75.60000      mm"
```
Extract: `75.6` (mm)

**Compression Ratio (line 50):**
```
"Geometric Compression Ratio                 11.30000"
```
Extract: `11.3`

**Max Power RPM (line 55):**
```
"RPM for Maximum Power                       8000.000"
```
Extract: `8000`

### Calculated Data

**Displacement (liters):**
```javascript
displacement = (π/4) × bore² × stroke × cylinders / 1000000
// Example: (π/4) × 82.5² × 75.6 × 4 / 1000000 = 1.62 L
```

---

## Section 3-4: Exhaust/Inlet Ports (lines 67-194)

### Extracted Data

**Exhaust Valves (line 73):**
```
"Number of exhaust valves                      2"
```

**Inlet Valves (line 140):**
```
"Number of inlet valves                        2"
```

---

## Section 5: Exhaust System (lines 199-267)

### Purpose
Exhaust manifold configuration (headers, collectors, pipes).

### Key Line (line 215)

```
"The exhaust system is a 4into2into1 manifold."
```

### Parsing Logic

**Regex pattern:**
```javascript
/(\d+into\d+(?:into\d+)?)\s+manifold/i
```

**Examples:**
- `"4into2into1 manifold"` → `"4-2-1"`
- `"4into1 manifold"` → `"4-1"`
- `"tri-y manifold"` → `"tri-y"`
- `"8into4into2into1 manifold"` → `"8-4-2-1"`

**Transform:**
```javascript
pattern.replace(/into/g, '-')  // "4into2into1" → "4-2-1"
```

---

## Section 6: Intake System (lines 271-353)

### Purpose
**КРИТИЧЕСКИ ВАЖНАЯ СЕКЦИЯ** - определяет тип intake (ITB/IM/Carb).

### Key Lines (280-283)

**ITB Example:**
```
"This is an intake system with seperate intake pipes,
   with no airboxes
   and no boost bottles but with throttles."
```

**IM Example:**
```
"This is an intake system with seperate intake pipes,
   with a common airbox or plenum."
```

**Carb Example:**
```
"This is an intake system with collected intake pipes."
```

### Detection Logic (ADR 007)

**Priority 1: Collected pipes**
```javascript
if (text.includes('collected intake pipes')) {
  return 'Carb';  // Carburetor/Collector
}
```

**Priority 2: Separate pipes**
```javascript
if (text.includes('seperate intake pipes')) {
  if (text.includes('with no airboxes') && 
      text.includes('but with throttles')) {
    return 'ITB';  // Individual Throttle Bodies
  }
  
  if (text.includes('with a common airbox') || 
      text.includes('with a common plenum')) {
    return 'IM';  // Intake Manifold
  }
}
```

**Default:**
```javascript
return 'IM';  // Most common
```

### Critical Keywords

| Keyword | Meaning | Result |
|---------|---------|--------|
| `"collected intake pipes"` | Pipes merge into collector/carb | Carb |
| `"seperate intake pipes"` | Each cylinder has own pipe | ITB or IM |
| `"with no airboxes"` | No plenum/airbox | + |
| `"but with throttles"` | Throttles present | ITB |
| `"with a common airbox"` | Shared plenum | IM |
| `"with a common plenum"` | Shared plenum | IM |

**⚠️ ВАЖНО:** Порядок проверки критичен! Сначала "collected", потом "seperate".

---

## Section 7: Ignition Model Data (lines 356-375)

### Purpose
**КРИТИЧЕСКИ ВАЖНАЯ СЕКЦИЯ** - combustion curves для timing visualization.

### Structure

```
 The Ignition model data: 
 ------------------------

 
The Combustion Model uses Wiebe Curves for prescribed burn rate
Type of Fuel          =    100 UNLEADED
Nitromethane Ratio   =   0.000

       Ignition, AFR and Combustion curves 

  RPM     Timing    AFR    Delay Duration  VibeA  VibeB  Beff
 2000.00   14.70   12.57    4.64   46.40   10.00  2.000  0.910
 3000.00   17.60   12.55    5.02   50.20   10.00  2.000  0.910
 4000.00   19.60   12.52    5.40   54.00   10.00  2.000  0.910
 5000.00   21.50   12.50    5.79   57.90   10.00  2.000  0.895
 6000.00   23.50   12.50    6.17   61.70   10.00  2.000  0.905
 7000.00   25.48   12.50    6.56   65.60   10.00  2.000  0.910
 8000.00   27.45   12.45    6.94   69.40   10.00  2.000  0.910
 9000.00   29.41   12.42    7.32   73.20   10.00  2.000  0.910
```

### Extracted Data

**Fuel Type (line 361):**
```
"Type of Fuel          =    100 UNLEADED"
```
Extract: `"100 UNLEADED"`

**Nitromethane Ratio (line 362):**
```
"Nitromethane Ratio   =   0.000"
```
Extract: `0.0`

**Combustion Curves Table (lines 367-374):**

**Header (line 366):**
```
"  RPM     Timing    AFR    Delay Duration  VibeA  VibeB  Beff"
```

**Data rows (8 points, typically 2000-9000 RPM, step 1000):**

| Column | Units | Description |
|--------|-------|-------------|
| RPM | revolutions/min | Engine speed |
| Timing | °BTDC | Ignition advance before TDC |
| AFR | ratio | Air-Fuel Ratio |
| Delay | degrees | Ignition delay period |
| Duration | degrees | Combustion duration (burn period) |
| VibeA | - | Wiebe parameter A |
| VibeB | - | Wiebe parameter B (M) |
| Beff | 0-1 | Combustion efficiency |

**Parsing:**
```javascript
// Split by whitespace
const parts = line.trim().split(/\s+/);

// Extract values
const curve = {
  rpm: parseFloat(parts[0]),       // 2000.00
  timing: parseFloat(parts[1]),    // 14.70 °BTDC
  afr: parseFloat(parts[2]),       // 12.57
  delay: parseFloat(parts[3]),     // 4.64°
  duration: parseFloat(parts[4]),  // 46.40°
  vibeA: parseFloat(parts[5]),     // 10.00
  vibeB: parseFloat(parts[6]),     // 2.000
  beff: parseFloat(parts[7])       // 0.910
};
```

### Usage

**1. Combustion Timing Markers (P-α diagrams):**
- Display ignition timing, delay, duration zones
- Educational: shows combustion phases

**2. Linear Interpolation (ADR 013):**
- For intermediate RPM (e.g., 3500 between 3000 and 4000)
- Formula: `value = lower + (upper - lower) × factor`
- Example:
  ```
  Target RPM: 3500
  Lower: 3000 (timing: 17.60°)
  Upper: 4000 (timing: 19.60°)
  Factor: (3500 - 3000) / (4000 - 3000) = 0.5
  Result: 17.60 + (19.60 - 17.60) × 0.5 = 18.60°
  ```

---

## Section 8: Wall Temperatures (lines 380-395)

### Structure

```
 The wall temperature and atmospheric data: 
 -------------------------------------------
 
  Inlet System Wall Temperature              25.00000      C
  Inlet Plenum Wall Temperature              150.0000      C
  Inlet Port Wall Temperature                150.0000      C
  Exhaust Port Wall Temperature              250.0000      C
  Exhaust Wall temp at Max Power             400.0000      C
  Piston Crown Temperature                   230.9360      C
  Combustion Chamber Wall Temperature        230.9360      C
  Cylinder Liner temperature                 190.9360      C
  Atmospheric Temperature (Std=20)           20.00000      C
  Atmospheric Pressure (Std=101.325)         101.3250      kPA
```

**Used for:** Thermal simulation in EngMod4T

---

## Parser Implementation

**File:** `backend/src/parsers/formats/prtParser.js`

**Main method:** `async parse(filePath)`

**Key helper methods:**
- `extractValue(line)` - extracts numeric value from label
- `parseProjectName(line)` - cleans project name
- `parseCreationDate(dateLine, timeLine)` - converts to ISO 8601
- `parseEngineType(line)` - NA/Turbo/Supercharged
- `parseConfiguration(line)` - inline/vee
- `parseIntakeSystem(intakeLines, numCylinders)` - **ITB/IM/Carb detection**
- `parseExhaustSystem(exhaustLines)` - exhaust pattern
- `parseIgnitionModelData(lines, startIndex)` - **combustion curves**

**Output:** JSON object для `metadata.auto`

---

## Validation Rules

**Must have:**
- ✅ Project name (line 8)
- ✅ Cylinders count (line 38)
- ✅ Bore (line 46)
- ✅ Stroke (line 47)
- ✅ Engine type (line 36)

**Optional (may be missing):**
- Combustion data (some old .prt files)
- Exhaust system pattern (may be "unknown")
- Intake system (defaults to "IM")

---

## Examples

**Real files in test-data/:**
- `4_Cyl_ITB.prt` - 4-cylinder NA, ITB, 4-2-1 exhaust
- `BMW M42.prt` - 4-cylinder NA, ITB
- `Lada 1300 Carb.prt` - 4-cylinder NA, Carb
- `Vesta 1.6 IM.prt` - 4-cylinder NA, IM

---

## Edge Cases

**Old .prt files (pre-2015):**
- May have slightly different text format
- Fallback heuristics в parser (throttles count)

**Missing combustion data:**
- Some .prt files don't have Ignition Model Data section
- Parser returns `combustion: null`

**Custom intake systems:**
- Ram Air, Velocity Stacks → classified as "IM" (default)
- User can override via manual metadata if needed

---

## Related Documentation

- [ADR 003: .prt File Format](../decisions/003-prt-file-format.md) - Foundation document
- [ADR 005: .prt Parser](../decisions/005-prt-parser-metadata-separation.md) - Implementation
- [ADR 007: Carb Support](../decisions/007-carb-intake-system-support.md) - Intake detection
- [ADR 013: Interpolation](../decisions/013-prt-table-data-interpolation.md) - Combustion curves

---

**Last updated:** 2025-11-12  
**Format version:** DAT4T v7.1.9  
**Maintained by:** Engine Viewer Team
