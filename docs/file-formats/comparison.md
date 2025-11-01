# Format Comparison: .det vs .pou

**Last Updated:** November 1, 2025

---

## Quick Reference

| Feature | .det Format | .pou Format | **.pou + .det Merge** |
|---------|-------------|-------------|----------------------|
| **Parameters per data point** | 24 | 71 | **75** (automatic) |
| **Metadata fields** | 2 | 5 | 5 (from .pou) |
| **File size (typical)** | Smaller (~100-500 KB) | Larger (~300-1500 KB) | Both files combined |
| **Use case** | Basic analysis, quick review | Detailed engineering analysis | Complete analysis |
| **Calculation markers** | `$` prefix | `$` prefix (identical) | `$` prefix |
| **Parsing complexity** | Simple | Moderate | Moderate (auto-merge) |
| **Load time** | Fast | Moderate | Moderate |
| **Data merge** | N/A | N/A | ✅ **Automatic** when both files exist |

---

## Detailed Comparison

### 1. Metadata Structure

#### .det Format (2 fields)

```
           4 NATUR     NumCyl
```

**Fields:**
- `NumCylinders` (integer): Number of cylinders
- `EngineType` (string): Aspiration type (NATUR, TURBO)

#### .pou Format (5 fields)

```
           4 NATUR       0       0     NumCyl,Breath,NumTurbo,NumWasteGate
```

**Fields:**
- `NumCylinders` (integer): Number of cylinders
- `EngineType` (string): Aspiration type (NATUR, TURBO)
- `Breath` (integer): Breathing configuration (0/1)
- `NumTurbo` (integer): Number of turbochargers
- `NumWasteGate` (integer): Number of wastegate valves

**Advantage:** `.pou` provides more engine configuration details, essential for turbocharged engine analysis.

---

### 2. Parameter Coverage

#### Global Parameters

| Parameter | .det | .pou | Unit | Description |
|-----------|------|------|------|-------------|
| RPM | ✅ | ✅ | об/мин | Engine speed |
| P-Av | ✅ | ✅ | кВт | Average power |
| Torque | ✅ | ✅ | Н·м | Engine torque |
| TexAv | ❌ | ✅ | K | Average exhaust temperature |
| FMEP | ❌ | ✅ | бар | Friction losses |
| Timing | ❌ | ✅ | градусы | Ignition/injection timing |
| TAF | ❌ | ✅ | - | Total air flow |
| Convergence | ✅ | ❌ | - | Calculation convergence |

#### Per-Cylinder Parameters

| Parameter | .det | .pou | Unit | Description |
|-----------|------|------|------|-------------|
| **Power** | ❌ | ✅ | кВт | Power per cylinder |
| **PurCyl** | ✅ | ✅ | - | Volumetric efficiency |
| **TUbMax** | ✅ | ✅ | K | Max exhaust temperature |
| **TCylMax** | ✅ | ❌ | K | Max cylinder temperature |
| **PCylMax** | ✅ | ⚠️* | бар | Max cylinder pressure (*via merge) |
| **Deto** | ✅ | ⚠️* | - | Detonation indicator (*via merge) |
| **IMEP** | ❌ | ✅ | бар | Indicated MEP |
| **BMEP** | ❌ | ✅ | бар | Brake MEP |
| **PMEP** | ❌ | ✅ | бар | Pumping MEP |
| **DRatio** | ❌ | ✅ | - | Delivery ratio |
| **Seff** | ❌ | ✅ | - | Scavenging efficiency |
| **Teff** | ❌ | ✅ | - | Trapping efficiency |
| **Ceff** | ❌ | ✅ | - | Charging efficiency |
| **BSFC** | ❌ | ✅ | г/кВт·ч | Fuel consumption |
| **TC-Av** | ❌ | ✅ | K | Average cylinder temp |
| **MaxDeg** | ❌ | ✅ | градусы | Angle at max pressure |
| **Delay** | ❌ | ✅ | градусы | Ignition delay |
| **Durat** | ❌ | ✅ | градусы | Combustion duration |

#### Combustion Model

| Parameter | .det | .pou | Description |
|-----------|------|------|-------------|
| VibeDelay | ❌ | ✅ | Vibe model delay |
| VibeDurat | ❌ | ✅ | Vibe model duration |
| VibeA | ❌ | ✅ | Vibe shape parameter A |
| VibeM | ❌ | ✅ | Vibe shape parameter M |

---

### 3. Parameter Count Breakdown

#### .det Format (24 parameters)

```
4 global parameters:
  - RPM, P-Av, Torque, Convergence

20 per-cylinder parameters (4-cyl engine):
  - PurCyl(1-4)    [4 values]
  - TUbMax(1-4)    [4 values]
  - TCylMax(1-4)   [4 values]
  - PCylMax(1-4)   [4 values]
  - Deto(1-4)      [4 values]

Total: 4 + 20 = 24 parameters
```

#### .pou Format (71 parameters)

```
4 basic global parameters:
  - RPM, P-Av, Torque, TexAv

64 per-cylinder parameters (4-cyl engine):
  - Power(1-4)     [4 values]
  - IMEP(1-4)      [4 values]
  - BMEP(1-4)      [4 values]
  - PMEP(1-4)      [4 values]
  - DRatio(1-4)    [4 values]
  - PurCyl(1-4)    [4 values]
  - Seff(1-4)      [4 values]
  - Teff(1-4)      [4 values]
  - Ceff(1-4)      [4 values]
  - BSFC(1-4)      [4 values]
  - TC-Av(1-4)     [4 values]
  - TUbMax(1-4)    [4 values]
  - MaxDeg(1-4)    [4 values]
  - Delay(1-4)     [4 values]
  - Durat(1-4)     [4 values]

3 additional global parameters:
  - FMEP, Timing, TAF

4 Vibe combustion model parameters:
  - VibeDelay, VibeDurat, VibeA, VibeM

Total: 4 + 64 + 3 + 4 = 71 parameters
```

---

### 4. Data Point Example

#### .det Format Data Line

```
3200  48.30  144.14  0.807  0.807  0.807  0.807  1062.9  1062.9  1062.9  1062.9  2034.7  2034.7  2034.7  2034.7  74.69  74.69  74.69  74.69  0.00  0.00  0.00  0.00  1.000
```

**24 values:**
- RPM: 3200
- P-Av: 48.30
- Torque: 144.14
- PurCyl(1-4): 0.807, 0.807, 0.807, 0.807
- TUbMax(1-4): 1062.9, 1062.9, 1062.9, 1062.9
- TCylMax(1-4): 2034.7, 2034.7, 2034.7, 2034.7
- PCylMax(1-4): 74.69, 74.69, 74.69, 74.69
- Deto(1-4): 0.00, 0.00, 0.00, 0.00
- Convergence: 1.000

#### .pou Format Data Line

```
3200  48.30  144.14  584.6  12.08  12.07  12.07  12.08  7.58  7.58  7.58  7.58  ... [71 values total]
```

**71 values including:**
- RPM: 3200
- P-Av: 48.30
- Torque: 144.14
- TexAv: 584.6
- Power(1-4): 12.08, 12.07, 12.07, 12.08
- IMEP(1-4): 7.58, 7.58, 7.58, 7.58
- ... (59 more values)

---

### 5. File Structure Similarity

Both formats share the same structural organization:

```
Line 1: Metadata (different field count)
Line 2: Column headers (different parameter count)
Line 3+: Calculation markers ($) and data points
```

**Example structure (both formats):**

```
<metadata>
<headers>
$Cal_1
<data>
<data>
...
$Cal_2
<data>
<data>
...
```

---

### 6. Calculation Markers

**IDENTICAL in both formats:**

```
$baseline
$3.1 R 0.86
$Cal_1
```

- Both use `$` prefix to mark calculation blocks
- Both strip `$` for display name in UI
- Both maintain `$` in internal IDs

---

### 7. Use Case Comparison

#### When to Use .det Format

✅ **Best for:**
- Quick engine performance review
- Basic power and torque analysis
- Temperature monitoring (TUbMax, TCylMax)
- Pressure analysis (PCylMax)
- Detonation detection (Deto)
- Convergence validation
- Smaller file sizes for faster loading
- Initial design iterations

❌ **Limited for:**
- Detailed fuel consumption analysis
- Combustion phasing analysis
- Efficiency optimization
- Air flow analysis
- Breathing efficiency studies

#### When to Use .pou Format

✅ **Best for:**
- Detailed engineering analysis
- Fuel consumption optimization (BSFC)
- Combustion modeling (Vibe parameters)
- Breathing efficiency analysis (Seff, Teff, Ceff)
- Pressure breakdown (IMEP, BMEP, PMEP, FMEP)
- Timing optimization (Timing, Delay, Durat)
- Per-cylinder power balance
- Air flow analysis (TAF)
- Academic research and publications

❌ **Overkill for:**
- Quick performance checks
- Simple comparisons
- When file size/load time is critical
- Basic power/torque curves

---

### 8. Parsing Complexity

#### .det Parser

**Complexity:** Simple

```javascript
parseDataLine(line, headers, numCylinders) {
  const values = cleanLine(line).split(/\s+/);

  return {
    RPM: parseFloat(values[0]),
    'P-Av': parseFloat(values[1]),
    Torque: parseFloat(values[2]),
    PurCyl: extractArray(values, 3, numCylinders),
    TUbMax: extractArray(values, 3 + numCylinders, numCylinders),
    // ... 3 more arrays
    Convergence: parseFloat(values[23])
  };
}
```

#### .pou Parser

**Complexity:** Moderate

```javascript
parseDataLine(line, headers, numCylinders) {
  const values = cleanLine(line).split(/\s+/);
  let idx = 4; // After RPM, P-Av, Torque, TexAv

  const dataPoint = {
    RPM: parseFloat(values[0]),
    'P-Av': parseFloat(values[1]),
    Torque: parseFloat(values[2]),
    TexAv: parseFloat(values[3]),
    Power: extractArray(values, idx, numCylinders)
  };

  idx += numCylinders;
  // ... repeat for 15 more per-cylinder arrays

  return dataPoint;
}
```

**Key difference:** `.pou` requires sequential index tracking through 16 per-cylinder arrays.

---

### 9. TypeScript Type Definitions

#### .det Format

```typescript
interface DetMetadata {
  numCylinders: number;
  engineType: string;
}

interface DetDataPoint {
  RPM: number;
  'P-Av': number;
  Torque: number;
  PurCyl: number[];      // Length = numCylinders
  TUbMax: number[];
  TCylMax: number[];
  PCylMax: number[];
  Deto: number[];
  Convergence: number;
}
```

#### .pou Format

```typescript
interface PouMetadata {
  numCylinders: number;
  engineType: string;
  breath: number;
  numTurbo: number;
  numWasteGate: number;
}

interface PouDataPoint {
  RPM: number;
  'P-Av': number;
  Torque: number;
  TexAv: number;
  Power: number[];       // Length = numCylinders
  IMEP: number[];
  BMEP: number[];
  // ... 13 more per-cylinder arrays
  FMEP: number;
  Timing: number;
  TAF: number;
  VibeDelay: number;
  VibeDurat: number;
  VibeA: number;
  VibeM: number;
}
```

---

### 10. Performance Considerations

#### File Size

**4-cylinder engine, 20 RPM points, 5 calculations:**

| Format | Approx. Size | Calculation |
|--------|-------------|-------------|
| .det | ~150 KB | 24 params × 20 points × 5 calcs × ~15 bytes/value |
| .pou | ~450 KB | 71 params × 20 points × 5 calcs × ~15 bytes/value |

**Ratio:** .pou files are ~3x larger than .det files

#### Parse Time

**Estimated (for reference file):**

| Format | Parse Time | Notes |
|--------|-----------|-------|
| .det | ~50-100ms | Simple structure, fewer parameters |
| .pou | ~100-200ms | More complex parsing, 3x data volume |

**Note:** Actual times depend on file size, hardware, and JavaScript engine.

#### Memory Usage

**In-memory size (parsed JSON):**

| Format | Memory | Calculation |
|--------|--------|-------------|
| .det | ~200 KB | Smaller data structures |
| .pou | ~600 KB | Larger data structures, more arrays |

---

### 11. Migration Guide

#### From .det to .pou

**What you gain:**
- 47 additional parameters per data point
- More detailed metadata (turbo configuration)
- Combustion model data (Vibe parameters)
- Efficiency metrics (Seff, Teff, Ceff)
- Fuel consumption data (BSFC)
- Timing and phasing data (MaxDeg, Delay, Durat)

**What you lose:**
- TCylMax (max cylinder temperature) - use TC-Av instead
- PCylMax (max cylinder pressure) - use IMEP/BMEP instead
- Deto (detonation indicator) - not available
- Convergence (calculation convergence) - not available

**Compatibility:**
- Both formats work in the same application
- Existing .det files continue to work
- Parser auto-detects format
- UI adapts to available parameters

#### Supporting Both Formats

The application uses TypeScript union types for compatibility:

```typescript
type EngineMetadata = DetMetadata | PouMetadata;
type DataPoint = DetDataPoint | PouDataPoint;

interface EngineProject {
  fileName: string;
  format: 'det' | 'pou';  // Format identifier
  metadata: EngineMetadata;
  calculations: Calculation[];
}
```

**UI behavior:**
- Charts show only available parameters
- Missing parameters are gracefully handled
- Format badge displays in UI
- Parameter selection adapts to format

---

### 12. Format Detection

The parser automatically detects format using:

#### 1. File Extension

```javascript
if (filePath.endsWith('.det')) return 'det';
if (filePath.endsWith('.pou')) return 'pou';
```

#### 2. Metadata Field Count

```javascript
const parts = firstLine.split(/\s+/).filter(Boolean);

if (parts.length === 2) {
  return 'det';  // 2 metadata fields
}

if (parts.length >= 5) {
  return 'pou';  // 5 metadata fields
}
```

**Robustness:** Dual detection (extension + content) ensures correct parsing even with non-standard file names.

---

### 13. Automatic Data Merge: Best of Both Formats

**Added:** November 1, 2025

The application now automatically merges data when both `.det` and `.pou` files exist with the same base name.

#### The Problem

- ✅ `.pou` files provide comprehensive data (71 parameters)
- ❌ BUT `.pou` files lack critical parameters:
  - **PCylMax** - Maximum cylinder pressure (critical for engine safety)
  - **Deto** - Detonation indicator (critical for knock detection)
- ✅ `.det` files contain PCylMax and Deto
- ❓ **How to get the best of both worlds?**

#### The Solution: Automatic Merge

**When both files exist:**

```
project-name.pou  (71 parameters)
project-name.det  (24 parameters)
          ↓
  Automatic merge
          ↓
  Result: 75 parameters
  (.pou + TCylMax + PCylMax + Deto + Convergence from .det)
```

**Implementation:**

```javascript
// backend/src/services/fileParser.js
async function parseDetFile(filePath) {
  const fileBaseName = basename(filePath).replace(/\.(det|pou)$/i, '');

  const pouPath = join(dir, `${fileBaseName}.pou`);
  const detPath = join(dir, `${fileBaseName}.det`);

  // If both files exist → automatic merge
  if (existsSync(pouPath) && existsSync(detPath)) {
    const pouData = await parseEngineFile(pouPath);
    const detData = await parseEngineFile(detPath);
    return mergeDetPouData(pouData, detData);  // Add PCylMax + Deto
  }

  // If only one file → regular parsing
  return await parseEngineFile(filePath);
}
```

#### Merge Behavior

| Files Available | Result | Parameters |
|----------------|--------|------------|
| Only `.det` | .det data | 24 parameters |
| Only `.pou` | .pou data | 71 parameters (PCylMax, Deto missing) |
| Both `.det` + `.pou` | **Merged data** | **75 parameters** (all .pou + TCylMax + PCylMax + Deto + Convergence) ✅ |

#### What Gets Merged

**From .pou (71 parameters):**
- All performance data (Power, Torque, RPM, TexAv)
- All efficiency metrics (Seff, Teff, Ceff)
- All pressure breakdown (IMEP, BMEP, PMEP, FMEP)
- Combustion model (Vibe parameters)
- Fuel consumption (BSFC)
- Timing data (MaxDeg, Delay, Durat)

**From .det (4 parameters added):**
- **TCylMax** - Maximum cylinder temperature [per cylinder array]
- **PCylMax** - Maximum cylinder pressure [per cylinder array]
- **Deto** - Detonation indicator [per cylinder array]
- **Convergence** - Calculation convergence quality [single value]

#### Type Safety

```typescript
// backend/src/types/engineData.ts
export interface PouDataPoint {
  // ... 71 parameters from .pou file ...

  // Optional parameters (added via merge):
  TCylMax?: number[];     // [cyl1, cyl2, cyl3, cyl4, ...] (from .det)
  PCylMax?: number[];     // [cyl1, cyl2, cyl3, cyl4, ...] (from .det)
  Deto?: number[];        // [cyl1, cyl2, cyl3, cyl4, ...] (from .det)
  Convergence?: number;   // Single value (from .det)
}
```

**Using `?:` (optional)** ensures type safety - these fields exist only when merge occurred.

#### Testing Merged Data

```bash
# Example: TM Soft ShortCut project (has both files)
curl http://localhost:3000/project/tm-soft-shortcut | \
  jq '.data.calculations[0].dataPoints[0] | {RPM, "P-Av", Torque, TCylMax, PCylMax, Deto, Convergence}'

# Output:
{
  "RPM": 3200,
  "P-Av": 48.3,
  "Torque": 144.14,
  "TCylMax": [2447.1, 2447.1, 2447.1, 2447.1],  # ✅ From .det
  "PCylMax": [71.3, 71.3, 71.3, 71.3],          # ✅ From .det
  "Deto": [0, 0, 0, 0],                         # ✅ From .det
  "Convergence": 0                              # ✅ From .det
}
```

#### Benefits

- ✅ **Transparent**: Frontend receives already-merged data
- ✅ **Automatic**: No manual configuration needed
- ✅ **Safe**: If files missing → regular parsing works
- ✅ **Type-safe**: TypeScript optional fields (`?:`)
- ✅ **Complete**: Get all 75 parameters for comprehensive analysis

#### Migration Impact

**Before merge feature:**

```
Migration from .det to .pou:
✅ Gain: 47 additional parameters
❌ Lose: TCylMax, PCylMax, Deto, Convergence (critical data)
⚠️  Decision: Choose between detail OR safety data
```

**After merge feature:**

```
Using both .det + .pou:
✅ Gain: All 71 .pou parameters
✅ Keep: TCylMax, PCylMax, Deto, Convergence from .det
✅ Result: 75 total parameters
✅ Decision: Get both detail AND safety data!
```

#### Logs

When merge happens, backend logs:

```
[DEBUG] parseDetFile called with: /path/to/project.pou
[DEBUG] Base name: project
[DEBUG] Checking pouPath: /path/to/project.pou
[DEBUG] Checking detPath: /path/to/project.det
[DEBUG] hasPou: true, hasDet: true
[Merge] Найдены оба файла для "project", выполняю merge...
[Merge] Успешно объединены данные: 3 расчётов
```

---

### 14. Recommendations

#### For New Projects

**Use .pou format if:**
- You need detailed analysis
- Fuel consumption is important
- Combustion modeling is required
- You're doing research/optimization
- File size is not a concern

**Use .det format if:**
- You need quick reviews
- Basic power/torque is sufficient
- Detonation detection is critical
- File size/speed matters
- Legacy compatibility is required

#### For Existing Projects

**Keep .det files if:**
- Current analysis is sufficient
- No need for additional parameters
- Storage/bandwidth is limited

**Migrate to .pou if:**
- Need more detailed data
- Want combustion analysis
- Require efficiency metrics
- Planning advanced optimization

---

## Summary Table

| Aspect | .det Format | .pou Format | Winner |
|--------|-------------|-------------|--------|
| **Parameters** | 24 | 71 | .pou |
| **File size** | Smaller | Larger | .det |
| **Parse speed** | Faster | Slower | .det |
| **Detail level** | Basic | Comprehensive | .pou |
| **Combustion model** | No | Yes | .pou |
| **Efficiency metrics** | No | Yes | .pou |
| **Detonation data** | Yes | No | .det |
| **Convergence data** | Yes | No | .det |
| **Use case** | Quick analysis | Deep analysis | Tie |

---

## References

- [.det Format Specification](det-format.md)
- [.pou Format Specification](pou-format.md)
- [Parser Implementation Guide](../parsers-guide.md)
- [Example Files](examples/)

---

**Maintained by:** Engine Viewer Development Team
**Last Updated:** November 1, 2025
