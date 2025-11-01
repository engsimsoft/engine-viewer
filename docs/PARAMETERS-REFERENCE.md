# Engine Parameters Reference

**Version:** 1.0
**Date:** November 2, 2025
**Total Parameters:** 29 unique types = 73 values (for 4-cylinder engine)

This reference lists all parameters available after merging .det and .pou files.

---

## Parameter Structure

Each parameter includes:
- **ID** - Unique identifier
- **Parameter** - Name as it appears in files
- **Unit** - Measurement unit (SI)
- **Format** - Availability (.det / .pou / both)
- **Conversion** - Unit conversion type (power/torque/pressure/temperature/none)
- **Brief** - Short description (1-2 sentences)
- **Description** - Detailed explanation for non-technical users

---

## GLOBAL PARAMETERS (8)

Single values, same for entire engine.

| ID | Parameter | Unit | Format | Conversion | Brief | Description |
|----|-----------|------|--------|------------|-------|-------------|
| 1 | RPM | об/мин | .det + .pou | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 2 | P-Av | kW | .det + .pou | power | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 3 | Torque | N·m | .det + .pou | torque | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 4 | Convergence | — | .det only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 5 | TexAv | K | .pou only | temperature | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 6 | FMEP | bar | .pou only | pressure | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 7 | Timing | ° | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 8 | TAF | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |

---

## PER-CYLINDER PARAMETERS (17 types × 4 = 68 values)

Array values, separate for each cylinder.

| ID | Parameter | Unit | Format | Conversion | Brief | Description |
|----|-----------|------|--------|------------|-------|-------------|
| 9 | PCylMax | bar | .det + .pou-merged | pressure | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 10 | Deto | — | .det + .pou-merged | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 11 | TCylMax | K | .det only | temperature | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 12 | TUbMax | K | .det + .pou | temperature | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 13 | PurCyl | — | .det + .pou | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 14 | Power | kW | .pou only | power | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 15 | IMEP | bar | .pou only | pressure | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 16 | BMEP | bar | .pou only | pressure | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 17 | PMEP | bar | .pou only | pressure | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 18 | DRatio | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 19 | Seff | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 20 | Teff | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 21 | Ceff | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 22 | BSFC | г/кВт·ч | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 23 | TC-Av | K | .pou only | temperature | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 24 | MaxDeg | ° | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 25 | Delay | ° | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 26 | Durat | ° | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |

---

## VIBE COMBUSTION MODEL PARAMETERS (4)

Mathematical model of combustion process.

| ID | Parameter | Unit | Format | Conversion | Brief | Description |
|----|-----------|------|--------|------------|-------|-------------|
| 27 | VibeDelay | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 28 | VibeDurat | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 29 | VibeA | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |
| 30 | VibeM | — | .pou only | none | _[TO BE FILLED]_ | _[TO BE FILLED]_ |

---

## Summary

**Total:** 8 global + 68 per-cylinder + 4 vibe = **80 rows** (29 unique parameter types)

**File Format Coverage:**
- `.det only` → 2 parameters (Convergence, TCylMax)
- `.pou only` → 19 parameters (TexAv, FMEP, Timing, TAF, Power, IMEP, BMEP, PMEP, DRatio, Seff, Teff, Ceff, BSFC, TC-Av, MaxDeg, Delay, Durat, Vibe*)
- `.det + .pou` → 5 parameters (RPM, P-Av, Torque, TUbMax, PurCyl)
- `.det + .pou-merged` → 2 parameters (PCylMax, Deto)

**Unit Conversion Types:**
- `power` → kW ↔ bhp ↔ PS (3 parameters)
- `torque` → N·m ↔ lb-ft (1 parameter)
- `pressure` → bar ↔ psi (7 parameters)
- `temperature` → °C ↔ °F (4 parameters)
- `none` → no conversion (14 parameters)

---

## Technical Implementation

This reference corresponds to:
- **Config:** `frontend/src/config/parameters.ts` - TypeScript PARAMETERS object
- **Conversion:** `frontend/src/lib/unitsConversion.ts` - Unit conversion functions
- **Types:** `frontend/src/types/index.ts` - DataPoint interface

For technical details about file formats, see:
- [.det format specification](file-formats/det-format.md)
- [.pou format specification](file-formats/pou-format.md)
- [Format comparison](file-formats/comparison.md)
