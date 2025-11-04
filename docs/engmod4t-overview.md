# EngMod4T Overview

**Document Purpose:** Single Source of Truth for understanding EngMod4T simulation software and its output file formats.

---

## About EngMod4T

**EngMod4T** is a thermodynamic simulation software for 4-stroke Internal Combustion Engines developed in CIS countries.

### Technical Characteristics

- **Programming Language:** Delphi (Object Pascal) 7 (80% confidence)
- **Platform:** Windows Desktop
- **Age:** 15+ years (early 2000s)
- **Purpose:** Thermodynamic simulation and performance calculation of 4-stroke ICE
- **Developer:** CIS engineering community (Russian-language software)

### Evidence for Delphi 7

1. **Fixed-width ASCII output format** - characteristic of Delphi `Format()` function
2. **Windows Desktop GUI** - Delphi's primary target
3. **Age (15+ years)** - Delphi 7 was popular in CIS in early 2000s
4. **Engineering domain** - Delphi was dominant for engineering desktop software in CIS
5. **File format structure** - matches Delphi `WriteLn(F, Format('%12.2f ...', [values]))`

---

## Universal Output File Format

**CRITICAL:** ALL ~15 EngMod4T output file types share the same format structure since they come from the same Delphi program.

### Format Specification

- **Type:** Fixed-width ASCII text (**NOT** space-separated CSV)
- **Encoding:**
  - ASCII for numerical data
  - Windows-1251 for Cyrillic metadata (project names, comments)
- **Line endings:** CRLF (Windows style `\r\n`)
- **Number format:** Right-aligned with space padding for visual column alignment
- **Created by:** Delphi code like:
  ```pascal
  WriteLn(F, Format('%12.2f %12.2f %12.2f', [rpm, power, torque]));
  ```

### Format Characteristics

#### 1. **Multiple spaces for padding** (NOT single space separators)
```
     RPM        P-Av       Torque    TexAv   Power( 1)
    3200       48.30      144.14     584.6      12.08
    3400       52.52      147.60     595.3      13.13
    ^^^^       ^^^^^      ^^^^^^
    Multiple   spaces     between columns
```

#### 2. **Right-aligned numbers**
```
    3200  ← Right-aligned in fixed-width field
   48.30  ← Padding with spaces on the left
  144.14
```

#### 3. **First column is service data** (row number/marker)
- Always skip the first column when parsing
- It's not part of the actual data structure

#### 4. **Fixed-width fields** (not CSV)
- Each column occupies a fixed width (typically 12 characters)
- Numbers are formatted to specific decimal places
- Visual alignment for human readability

---

## Parsing Strategy

### Universal Parsing Approach

**Works for ALL EngMod4T file types:**

```typescript
// 1. Split by multiple spaces (NOT comma)
const columns = line.trim().split(/\s+/);

// 2. ALWAYS skip first column (service column)
const dataColumns = columns.slice(1);

// 3. Parse as floats
const values = dataColumns.map(parseFloat);
```

### Why NOT CSV Parser?

❌ **DO NOT use CSV parser libraries** - the format is fixed-width ASCII, not CSV:
- Multiple spaces are field separators (not single comma)
- No quotes around fields
- Fixed-width alignment for visual readability
- Delphi `Format()` output, not CSV export

✅ **DO use regex split** on multiple spaces:
```typescript
line.trim().split(/\s+/)  // Correct for EngMod4T files
```

---

## File Types

EngMod4T produces ~15 different output file types, all sharing the same fixed-width ASCII format:

### Currently Parsed

| File Type | Parameters | Description |
|-----------|------------|-------------|
| `.det` | 24 | Main results: power, torque, temperatures, pressures |
| `.pou` | 71 | Merged extended parameters (all available data) |

### Remaining File Types

- `.prt` - Project metadata and calculation settings
- ~12 trace file types - Detailed cycle traces (pressure, temperature, mass flow)

### Important Notes

1. **All files use fixed-width ASCII format** (Delphi origin)
2. **First column is always service data** (skip when parsing)
3. **Parameter names are ALWAYS in English** (never translate)
4. **Multiple spaces separate columns** (not single space or comma)

---

## Parameter Names Convention

**CRITICAL RULE:** All parameter names from EngMod4T files MUST remain in original English.

### Examples of Original Names

```
RPM          - engine speed (revolutions per minute)
P-Av         - average power
Torque       - torque
PCylMax      - maximum cylinder pressure
TCylMax      - maximum cylinder temperature
TUbMax       - maximum exhaust temperature
PurCyl       - volumetric efficiency
Deto         - detonation indicator
Convergence  - calculation convergence
```

### Why Never Translate?

1. **Data integrity** - original names from source software
2. **Traceability** - easy to match with EngMod4T documentation
3. **International compatibility** - English is universal language for engineering
4. **Consistency** - same names in all components (charts, tables, legends)

---

## Integration with Engine Viewer

### Project Structure

```
test-data/
├── Project Name/
│   ├── *.det        ← EngMod4T output (main results)
│   ├── *.pou        ← EngMod4T output (extended parameters)
│   ├── *.prt        ← EngMod4T output (project metadata)
│   └── [trace files] ← EngMod4T output (cycle traces)
└── .metadata/
    └── Project Name.json ← User-created metadata (Engine Viewer)
```

### File Ownership

- **EngMod4T files** (`.det`, `.pou`, `.prt`, traces):
  - Created by EngMod4T software
  - Read-only for Engine Viewer
  - Source of truth for simulation data

- **`.metadata/` folder**:
  - Created by Engine Viewer
  - User-editable metadata (descriptions, tags, client info)
  - Not part of EngMod4T output

---

## References

### Documentation

- **File Format Specs:**
  - [det-format.md](file-formats/det-format.md) - Main results format
  - [pou-format.md](file-formats/pou-format.md) - Extended parameters format
  - [file-formats/README.md](file-formats/README.md) - All formats overview

- **Implementation:**
  - [parsers-guide.md](parsers-guide.md) - How to add new parsers
  - [PARAMETERS-REFERENCE.md](PARAMETERS-REFERENCE.md) - All 73 parameters reference

### Parser Implementation

- **Backend parsers:**
  - `backend/src/parsers/detParser.ts` - .det file parser
  - `backend/src/parsers/pouParser.ts` - .pou file parser

---

## Future Considerations

### Adding New File Type Parsers

When adding parsers for remaining EngMod4T file types:

1. **Assume fixed-width ASCII format** (same as .det/.pou)
2. **Skip first column** (service data)
3. **Use `split(/\s+/)` for parsing** (multiple spaces)
4. **Keep original parameter names** (English, never translate)
5. **Refer to this document** as Single Source of Truth

### Format Consistency

All EngMod4T files will follow the same format because:
- They come from the same Delphi 7 program
- They use the same `WriteLn(F, Format(...))` approach
- They target the same Windows platform
- They serve the same user base (CIS engineers)

---

**Last Updated:** 2025-11-04
**Status:** Active documentation (Single Source of Truth)
