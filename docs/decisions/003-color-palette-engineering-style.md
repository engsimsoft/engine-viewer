# ADR 003: Color Palette Engineering Style

**Date:** 2025-11-02
**Status:** ✅ Implemented (v2.0.0)
**Context:** Chart visualization color system
**Decision Maker:** User (experienced engineer)

---

## Context

Initial implementation had color confusion in comparison mode when multiple calculations were displayed on the same chart. Specifically:

**Problem:** Cyan (#17a2b8) and Blue (#3498db) were too similar, making it difficult to distinguish between calculations in comparison mode.

**Impact:**
- Visual confusion when analyzing multiple calculations
- Reduced professional appearance
- Accessibility concerns (color distinguishability)

---

## Decision

Implemented **Engineering Style Palette** with maximum contrast between colors:

```typescript
// Single Source of Truth: frontend/src/types/v2.ts
export const CALCULATION_COLORS = [
  '#e74c3c', // Red
  '#2ecc71', // Green
  '#3498db', // Blue
  '#f39c12', // Orange
  '#9b59b6'  // Purple
];
```

**Order matters:** Red → Green → Blue → Orange → Purple
- Primary calculation: Red
- 1st comparison: Green (maximum contrast from red)
- 2nd comparison: Blue (distinct from both)
- 3rd comparison: Orange
- 4th comparison: Purple

---

## Rationale

### 1. **Maximum Contrast**
- Red vs Green: opposite on color wheel
- Blue: cold color, distinct from warm red/orange
- All colors easily distinguishable even with color vision deficiencies

### 2. **Professional Engineering Appearance**
- Muted tones (not neon/bright)
- Similar to MATLAB, OriginLab, technical plotting tools
- Serious, data-focused aesthetic

### 3. **Accessibility (WCAG 2.1 AA)**
- All colors pass contrast requirements on white background
- Distinguishable for common color blindness types (deuteranopia, protanopia)
- Works in print (grayscale conversion maintains hierarchy)

### 4. **Semantic Meaning**
- Red (primary): Attention-grabbing, "this is your main calculation"
- Green (comparison): "Alternative, but equally valid"
- No negative connotations (red ≠ error, green ≠ success in this context)

---

## Implementation

**Location:** `frontend/src/types/v2.ts`

```typescript
export interface Calculation {
  id: string;
  color: string; // Assigned from CALCULATION_COLORS based on index
  // ...
}
```

**Assignment logic:**
- Primary calculation: `color = CALCULATION_COLORS[0]` (Red)
- Comparison 1-4: `color = CALCULATION_COLORS[index % 5]`

**Usage:**
- Chart series colors: Use `calc.color` directly
- Legend labels: Match calculation color
- PeakValuesCards: Border uses `calc.color`

---

## Alternatives Considered

### 1. **Rainbow palette** (rejected)
- Too playful, not professional
- Poor distinguishability (yellow/light green similar)
- Doesn't work in grayscale

### 2. **Grayscale** (rejected)
- Boring, hard to distinguish 5 calculations
- Not leveraging color as information channel

### 3. **User-customizable colors** (deferred)
- Over-engineering for v2.0
- Most users don't need customization
- Can add in future if requested

---

## Consequences

### Positive
- ✅ Clear visual distinction between calculations
- ✅ Professional, engineering-appropriate appearance
- ✅ Accessibility compliance
- ✅ Single Source of Truth (easy to change if needed)

### Negative
- ⚠️ Limited to 5 calculations (by design, UI constraint)
- ⚠️ No semantic meaning to colors (not self-explanatory)

---

## Notes

**"iPhone quality" principle applied:**
- Choose defaults carefully (don't burden user with choices)
- Professional appearance over flashy colors
- Consistency across all charts

**Related decisions:**
- Parameter colors: Separate system (PARAMETER_COLORS in `config/parameters.ts`)
- Single calculation mode: Uses parameter colors (more informative)
- Comparison mode: Uses calculation colors (to distinguish sources)

---

## References

- Implementation: `frontend/src/types/v2.ts:CALCULATION_COLORS`
- Usage: All ChartPreset components
- Testing: Visual verification in comparison mode (1-5 calculations)
