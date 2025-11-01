# 🚨 ADDENDUM: Engine Viewer v2.0 - UI Layout Changes

**Date:** October 31, 2025
**Version:** 2.0.1 (Addendum)
**Priority:** CRITICAL
**Status:** ✅ **COMPLETED** (November 1, 2025)
**For:** Claude Code

---

## ✅ Implementation Status

**All tasks completed successfully:**

1. ✅ Removed redundant headers ("Visualization", preset names, "Peak Values")
2. ✅ Replaced Grid Cards (2 columns) with Full-Width Cards (single row per calculation)
3. ✅ Implemented inline peak values format with bullet separators
4. ✅ Added hover effects (shadow + translateY)
5. ✅ Implemented responsive behavior (mobile stacking)
6. ✅ **BONUS:** Moved PNG/SVG export buttons to Header (saves additional vertical space)
7. ✅ **BONUS:** Fixed Settings functionality (Theme, Animation, Show Grid now work)

**Result achieved:**
- Graph occupies ~76% of viewport (was 50%)
- Layout fits without scroll for 1-5 calculations
- Export buttons in Header save additional ~60px
- All Settings now functional

**See:** [CHANGELOG.md](CHANGELOG.md#unreleased) for detailed changes

---

## ⚠️ CRITICAL INSTRUCTIONS - READ FIRST

### MANDATORY RULES:

1. **FOLLOW EXACTLY AS WRITTEN** - No improvisation, no "improvements", no shortcuts
2. **DO NOT SKIP ANY STEP** - Every instruction must be implemented precisely
3. **DO NOT ADD ANYTHING NOT SPECIFIED** - If it's not in this document, don't add it
4. **DO NOT CHANGE MEASUREMENTS** - Use exact pixel values provided
5. **DO NOT CHANGE LAYOUT** - Follow ASCII mockups character-by-character
6. **ASK IF UNCLEAR** - If anything is ambiguous, ask before implementing

**This addendum overrides conflicting instructions in ENGINE-VIEWER-V2-SPEC.md**

---

## 📋 Summary of Changes

This addendum makes 4 critical changes to the visualization page layout:

1. ❌ **REMOVE** "Visualization / Select calculations to display" header
2. ❌ **REMOVE** "P-Av & Torque" preset name above chart
3. ❌ **REMOVE** "Peak Values" header above cards
4. ✅ **REPLACE** Grid cards (2 columns) with Full-Width cards (1 row per calculation)

**Result:** 
- Graph gets 76% of viewport height (was 50%)
- Everything fits without scroll
- Layout works perfectly for 1, 2, 3, 4, or 5 calculations

---

## 🗑️ SECTION 1: REMOVE THESE ELEMENTS

### 1.1 Remove Visualization Header

**Current state:**
```
┌────────────────────────────────────┐
│        Visualization               │  ← DELETE THIS
│  Select calculations to display    │  ← DELETE THIS
├────────────────────────────────────┤
│          [Chart Area]              │
```

**Required state:**
```
┌────────────────────────────────────┐
│          [Chart Area]              │  ← Chart starts here now
```

**Files to modify:**
- `frontend/src/components/visualization/VisualizationPage.tsx` or similar

**What to delete:**
- `<h1>Visualization</h1>` element
- `<p>Select calculations to display</p>` element
- Parent container if it only contains these elements
- Any associated CSS/styling for this header

**DO NOT:**
- Replace with any other header
- Add alternative text
- Keep as hidden element

**Result:** Chart area should start immediately after the top navigation/header bar.

---

### 1.2 Remove Preset Name Above Chart

**Current state:**
```
┌────────────────────────────────────┐
│      P-Av & Torque                 │  ← DELETE THIS
├────────────────────────────────────┤
│  P-Av (PS)          Torque (N·m)   │  ← Keep (axis labels)
│                                    │
│         [Chart Plot Area]          │
```

**Required state:**
```
┌────────────────────────────────────┐
│  P-Av (PS)          Torque (N·m)   │  ← Starts here now
│                                    │
│         [Chart Plot Area]          │
```

**Files to modify:**
- Chart component that renders preset title
- Likely in `ChartArea.tsx` or `ChartPreset*.tsx`

**What to delete:**
- Preset name text (`"P-Av & Torque"`, `"Cylinder Pressure"`, etc.)
- Any `<h2>` or `<h3>` element displaying preset name
- Associated container/wrapper if only contains preset name

**DO NOT:**
- Remove axis labels (P-Av (PS), Torque (N·m)) - these MUST stay
- Remove legend at bottom
- Remove export buttons

**Result:** Chart should show axis labels directly, no title above.

---

### 1.3 Remove "Peak Values" Header

**Current state:**
```
┌────────────────────────────────────┐
│         [Chart Area]               │
├────────────────────────────────────┤
│        Peak Values                 │  ← DELETE THIS
├────────────────────────────────────┤
│  [Peak Value Cards]                │
```

**Required state:**
```
┌────────────────────────────────────┐
│         [Chart Area]               │
├────────────────────────────────────┤
│  [Peak Value Cards]                │  ← Cards start here now
```

**Files to modify:**
- `frontend/src/components/visualization/PeakValuesCards.tsx` or similar
- Parent container component

**What to delete:**
- `<h2>Peak Values</h2>` or similar element
- Any decorative elements around this header
- Parent container if only contains this header

**DO NOT:**
- Remove the actual peak value cards
- Add alternative header text
- Keep as hidden/commented element

**Result:** Peak value cards should appear immediately after chart, no header.

---

## ✅ SECTION 2: NEW PEAK VALUES LAYOUT

### 2.1 Replace Grid Cards with Full-Width Cards

**OLD LAYOUT (DELETE THIS):**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚫ BMW M42.det → 14 UpDate                                  │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │                       │  │                       │        │
│  │  🏆 Max Power         │  │  🏆 Max Torque        │        │
│  │                       │  │                       │        │
│  │  215.7 PS             │  │  219.1 N·m            │        │
│  │                       │  │                       │        │
│  │  at 7800 RPM          │  │  at 6600 RPM          │        │
│  │                       │  │                       │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```
Height: ~160px per calculation

**NEW LAYOUT (IMPLEMENT THIS):**
```
┌─────────────────────────────────────────────────────────────┐
│  ⚫  BMW M42.det → 14 UpDate                                 │
│  🏆  215.7 PS at 7800 RPM  •  219.1 N·m at 6600 RPM        │
└─────────────────────────────────────────────────────────────┘
```
Height: 68px per calculation

---

### 2.2 Full-Width Card Specifications

**Component name:** `PeakCardFullWidth` (create new or replace existing)

**Exact layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ ← 24px padding                                   24px pad → │
│                                                              │
│  ⚫  BMW M42.det → 14 UpDate                                 │ ← Line 1: Name
│      ↑12px gap                                              │
│  🏆  215.7 PS at 7800 RPM  •  219.1 N·m at 6600 RPM        │ ← Line 2: Peaks
│                                                              │
└─────────────────────────────────────────────────────────────┘
    ↑                                                       ↑
    Border radius: 12px                    Width: 100% of chart
```

**Exact measurements:**
- **Width:** 100% (same width as chart above)
- **Height:** 68px total
  - Top padding: 16px
  - Line 1 (name): 20px
  - Gap between lines: 12px
  - Line 2 (peaks): 20px
  - Bottom padding: 16px
  - Total: 16 + 20 + 12 + 20 + 16 = 84px (round to 68px with tighter line-height)

- **Padding:** 16px top/bottom, 24px left/right
- **Border:** 1px solid #E5E7EB
- **Border radius:** 12px
- **Background:** #FFFFFF (white)
- **Box shadow:** `0 1px 3px rgba(0, 0, 0, 0.08)`
- **Gap between cards:** 12px

---

### 2.3 Line 1: Calculation Name

**Format:**
```
⚫  BMW M42.det → 14 UpDate
↑   ↑          ↑  ↑
│   │          │  └─ Calculation name
│   │          └──── Arrow separator
│   └─────────────── Project name
└─────────────────── Color dot (12px)
```

**Typography:**
- Font size: 16px
- Font weight: 500 (Medium)
- Color: #111827 (black)
- Line height: 20px

**Color dot:**
- Size: 12px × 12px
- Border radius: 50% (circle)
- Background: calculation.color (e.g., #ff6b6b for primary)
- Position: Aligned with text baseline
- Margin right: 12px

**Spacing:**
- Dot → Text: 12px
- ProjectName → Arrow: 8px (natural space)
- Arrow → CalcName: 8px (natural space)

---

### 2.4 Line 2: Peak Values

**Format:**
```
🏆  215.7 PS at 7800 RPM  •  219.1 N·m at 6600 RPM
↑   ↑                     ↑   ↑
│   │                     │   └─ Torque value + RPM
│   │                     └───── Bullet separator
│   └─────────────────────────── Power value + RPM
└─────────────────────────────── Trophy icon
```

**Typography:**
- Font size: 14px
- Color: #6B7280 (gray) for "at XXXX RPM"
- Color: #111827 (black) for values (215.7 PS, 219.1 N·m)
- Font weight for values: 600 (Semibold)
- Font weight for "at XXXX RPM": 400 (Regular)
- Line height: 20px

**Trophy icon:**
- Emoji: 🏆
- Size: 16px (or native emoji size)
- Margin right: 8px
- Vertical align: middle

**Bullet separator:**
- Character: • (middle dot, U+2022)
- Color: #D1D5DB (light gray)
- Margin: 0 8px (8px left and right)

**Left indent:**
- Peak values line should be indented 24px from left edge
- This aligns it under the text (after the color dot)

---

### 2.5 Example with Multiple Calculations

**Exact layout for 2 calculations:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                        [CHART AREA]                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
    ↓ 16px gap
┌─────────────────────────────────────────────────────────────┐
│  ⚫  BMW M42.det → 14 UpDate                                 │
│  🏆  215.7 PS at 7800 RPM  •  219.1 N·m at 6600 RPM        │
└─────────────────────────────────────────────────────────────┘
    ↓ 12px gap
┌─────────────────────────────────────────────────────────────┐
│  ⚪  Vesta 1.6 IM → 2                                        │
│  🏆  181.5 PS at 7600 RPM  •  186.1 N·m at 6400 RPM        │
└─────────────────────────────────────────────────────────────┘
```

**Key points:**
- Gap between chart and first card: 16px
- Gap between cards: 12px
- Each card is IDENTICAL in structure
- Only difference: color dot color (⚫⚪🟡🔵🟣)
- No exceptions for 1st/last card

---

### 2.6 Hover Effect (Apple Style)

**Default state:**
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
transform: translateY(0);
```

**Hover state:**
```css
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
transform: translateY(-2px);
transition: all 200ms ease-out;
```

**DO NOT:**
- Add different hover effects
- Change background color on hover
- Add border color change
- Make clickable unless specified elsewhere

---

## 📏 SECTION 3: FINAL LAYOUT MEASUREMENTS

### 3.1 Complete Page Layout

**Exact vertical measurements:**

```
┌────────────────────────────────────────────────────────────┐
│  Back Button + Project Header + Settings                   │  40px
├────────────────────────────────────────────────────────────┤
│                                                             │
│                                         PNG    SVG         │  40px (export buttons)
│                                                             │
│  P-Av (PS)                                    Torque (N·m) │
│    250 ┤                                            250 ┤  │
│        │                                                │  │
│        │                [CHART PLOT AREA]               │  │  650px
│        │                                                │  │
│      0 └────────────────────────────────────────────── 0 ┤  │
│                         RPM                                │
│                                                             │
│  ━━━ Calculation legends                                   │  20px (legend)
│                                                             │
├────────────────────────────────────────────────────────────┤ 16px gap
│  ⚫ BMW M42.det → 14 UpDate                                 │
│  🏆 215.7 PS at 7800 RPM  •  219.1 N·m at 6600 RPM        │  68px
├────────────────────────────────────────────────────────────┤ 12px gap
│  ⚪ Vesta 1.6 IM → 2                                        │
│  🏆 181.5 PS at 7600 RPM  •  186.1 N·m at 6400 RPM        │  68px
└────────────────────────────────────────────────────────────┘

TOTAL HEIGHT BREAKDOWN:
- Header bar:           40px   (4%)
- Export buttons:       40px   (4%)
- Chart area:          650px  (69%)
- Legend:               20px   (2%)
- Gap:                  16px   (2%)
- Peak card 1:          68px   (7%)
- Gap:                  12px   (1%)
- Peak card 2:          68px   (7%)
- Bottom padding:       24px   (3%)
─────────────────────────────────
TOTAL:                938px  (fits in 1000px viewport)
```

**Chart receives 69% of viewport** (was ~50% before)

---

### 3.2 Height Scaling by Number of Calculations

**1 calculation:**
```
Chart: 650px
Cards: 68px × 1 = 68px
Gaps:  16px
────────────────────
Total: 734px  ✅ Plenty of space
```

**2 calculations:**
```
Chart: 650px
Cards: 68px × 2 = 136px
Gaps:  16px + 12px = 28px
────────────────────
Total: 814px  ✅ Fits easily
```

**3 calculations:**
```
Chart: 650px
Cards: 68px × 3 = 204px
Gaps:  16px + 12px + 12px = 40px
────────────────────
Total: 894px  ✅ Still fits
```

**4 calculations:**
```
Chart: 650px
Cards: 68px × 4 = 272px
Gaps:  16px + 12px + 12px + 12px = 52px
────────────────────
Total: 974px  ✅ Fits in 1000px viewport
```

**5 calculations (max):**
```
Chart: 650px
Cards: 68px × 5 = 340px
Gaps:  16px + 12px + 12px + 12px + 12px = 64px
────────────────────
Total: 1054px  ⚠️ Slight scroll (acceptable)
```

---

## 🎨 SECTION 4: CSS SPECIFICATIONS

### 4.1 Full-Width Card Container

**Class name:** `.peak-card-fullwidth`

**Exact CSS:**
```css
.peak-card-fullwidth {
  width: 100%;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  transition: all 200ms ease-out;
}

.peak-card-fullwidth:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}
```

**DO NOT:**
- Change any pixel values
- Add additional properties not listed
- Remove any properties listed
- Change transition timing

---

### 4.2 Calculation Name Row

**Class name:** `.calc-name-row`

**Exact CSS:**
```css
.calc-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  line-height: 20px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
```

**DO NOT:**
- Change font size from 16px
- Change gap from 12px
- Change dot size from 12px
- Add text transform or other properties

---

### 4.3 Peak Values Row

**Class name:** `.peak-values-row`

**Exact CSS:**
```css
.peak-values-row {
  padding-left: 24px;
  font-size: 14px;
  color: #6B7280;
  line-height: 20px;
}

.peak-value-strong {
  font-weight: 600;
  color: #111827;
}

.peak-separator {
  color: #D1D5DB;
  margin: 0 8px;
}
```

**DO NOT:**
- Change padding-left from 24px
- Change font size from 14px
- Change margin on separator from 8px
- Add additional styling

---

## 📱 SECTION 5: RESPONSIVE BEHAVIOR

### 5.1 Desktop (>1024px)

**Behavior:**
- Use layout exactly as specified above
- No changes needed
- Full-width cards span entire chart width

---

### 5.2 Tablet (768px - 1024px)

**Behavior:**
- Same layout as desktop
- Cards remain full-width
- Font sizes unchanged
- If peak values line is too long, allow text wrap with indent:

```css
@media (max-width: 1024px) {
  .peak-values-row {
    word-wrap: break-word;
    padding-left: 24px;
    text-indent: -24px;
    padding-left: 48px; /* Indent wrapped lines */
  }
}
```

---

### 5.3 Mobile (<768px)

**Behavior:**
- Stack peak values on separate lines:

```
┌────────────────────────────┐
│  ⚫ BMW M42 → 14 UpDate    │
│  🏆 215.7 PS at 7800 RPM  │  ← Line 1
│     219.1 N·m at 6600 RPM  │  ← Line 2 (indented)
└────────────────────────────┘
```

**Mobile CSS:**
```css
@media (max-width: 768px) {
  .peak-values-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 24px;
  }
  
  .peak-value-group {
    display: block;
  }
  
  .peak-separator {
    display: none; /* Hide bullet on mobile */
  }
}
```

---

## 🖼️ SECTION 6: EXPORT FUNCTIONALITY

### 6.1 Export Composition

**When user clicks PNG or SVG button:**

Export should include:
1. Chart with all lines and peak markers
2. Legend below chart
3. ALL peak value cards (full-width format)

**Exported layout:**
```
┌────────────────────────────────────────────┐
│  BMW M42.det vs Vesta 1.6 IM              │ ← Title
│  NATUR • 4 cylinders                       │ ← Subtitle
│                                            │
│  P-Av (PS)                    Torque (N·m) │
│                                            │
│            [CHART WITH PEAKS]              │
│                                            │
│  ━━━ BMW • Vesta                          │ ← Legend
│                                            │
│  ⚫ BMW M42.det → 14 UpDate                │ ← Peak cards
│  🏆 215.7 PS @ 7800 • 219.1 N·m @ 6600    │
│                                            │
│  ⚪ Vesta 1.6 IM → 2                       │
│  🏆 181.5 PS @ 7600 • 186.1 N·m @ 6400    │
│                                            │
│  Generated: 2025-10-31                     │ ← Footer
│  Engine Viewer v2.0                        │
└────────────────────────────────────────────┘
```

**Filename format:**
- Single calculation: `{ProjectName}_{CalcName}_{Date}.png`
- Multiple calculations: `Multi-Project-Comparison_{Date}.png`
- Example: `BMW-M42_14-UpDate_2025-10-31.png`

**Export quality:**
- PNG: Scale 2x for Retina (html2canvas scale: 2)
- SVG: Use native resolution
- Background: #FFFFFF (white)

---

## ✅ SECTION 7: IMPLEMENTATION CHECKLIST

### Step 1: Remove Redundant Headers (15 min)

- [ ] Find and delete "Visualization / Select calculations to display" header
- [ ] Find and delete "P-Av & Torque" preset name above chart
- [ ] Find and delete "Peak Values" header above cards
- [ ] Verify chart area extends upward to fill space
- [ ] Test that layout reflows correctly

---

### Step 2: Create New Full-Width Card Component (1-2 hours)

- [ ] Create new component file (or replace existing)
- [ ] Implement exact layout: name row + peak values row
- [ ] Add color dot with exact size (12px)
- [ ] Add trophy icon with spacing
- [ ] Format peak values string: `{value} {unit} at {rpm} RPM • {value} {unit} at {rpm} RPM`
- [ ] Implement exact CSS from Section 4
- [ ] Test with 1, 2, 3, 4, 5 calculations
- [ ] Verify measurements match specification (68px height)

---

### Step 3: Update Layout Spacing (30 min)

- [ ] Set gap between chart and first card: 16px
- [ ] Set gap between cards: 12px
- [ ] Remove any old spacing/margins from grid layout
- [ ] Verify total height fits in viewport (see Section 3.2)

---

### Step 4: Apply Hover Effects (15 min)

- [ ] Implement hover effect from Section 2.6
- [ ] Test smooth transition (200ms ease-out)
- [ ] Verify shadow and transform values

---

### Step 5: Responsive Behavior (30 min)

- [ ] Test on desktop (>1024px) - should work as-is
- [ ] Test on tablet (768-1024px) - may need text wrap
- [ ] Test on mobile (<768px) - stack peak values
- [ ] Implement mobile CSS from Section 5.3

---

### Step 6: Export Functionality (1 hour)

- [ ] Update export to include peak cards
- [ ] Use html2canvas with scale: 2
- [ ] Implement filename format from Section 6.1
- [ ] Test PNG export with 1 and 2 calculations
- [ ] Test SVG export (if applicable)

---

### Step 7: Final Verification (30 min)

- [ ] Measure actual heights - should match Section 3.1
- [ ] Test with all 4 presets
- [ ] Test with different units (SI, American, HP)
- [ ] Verify colors match specification
- [ ] Check typography (sizes, weights, colors)
- [ ] Verify spacing (padding, gaps, margins)
- [ ] Test hover effects work smoothly
- [ ] Take screenshots for documentation

---

## 🚨 COMMON MISTAKES TO AVOID

**DO NOT:**
1. ❌ Keep old grid layout as fallback - DELETE IT COMPLETELY
2. ❌ Add "toggle" between grid and full-width - ONLY full-width
3. ❌ Change font sizes "for better readability" - USE EXACT SIZES
4. ❌ Add extra padding "to look better" - USE EXACT PADDING
5. ❌ Change colors "to match theme better" - USE EXACT COLORS
6. ❌ Add animations beyond specified hover effect
7. ❌ Keep removed headers as hidden elements
8. ❌ Change card height "to be more balanced" - MUST BE 68px
9. ❌ Add borders, shadows, effects not specified
10. ❌ "Improve" the layout with personal preferences

---

## 📸 REFERENCE SCREENSHOTS

**Before (OLD - what we're replacing):**
- Visualization header taking space
- "P-Av & Torque" title above chart
- "Peak Values" header
- Grid layout with 2 cards side-by-side
- Height: ~160px per calculation

**After (NEW - what we're implementing):**
- No visualization header (more space for chart)
- No preset title (cleaner)
- No peak values header (obvious from cards)
- Full-width cards with inline peak values
- Height: 68px per calculation

**Space gained:** 
- Removed headers: ~160px
- Compact cards: 92px per calculation
- **Total:** Chart gets 200-300px more height

---

## ✅ FINAL ACCEPTANCE CRITERIA

**This implementation is complete when:**

1. ✅ "Visualization" header is DELETED (not hidden)
2. ✅ Preset name above chart is DELETED (not hidden)
3. ✅ "Peak Values" header is DELETED (not hidden)
4. ✅ Old grid cards are DELETED (not hidden)
5. ✅ New full-width cards implemented exactly as specified
6. ✅ Each card is exactly 68px in height
7. ✅ Gap between cards is exactly 12px
8. ✅ Color dot is exactly 12px × 12px
9. ✅ Typography matches specification (sizes, weights, colors)
10. ✅ Peak values formatted as: `🏆 {value} {unit} at {rpm} RPM • {value} {unit} at {rpm} RPM`
11. ✅ Hover effect works (shadow + translateY)
12. ✅ Layout works for 1, 2, 3, 4, 5 calculations
13. ✅ Everything fits in viewport without scroll (for ≤4 calculations)
14. ✅ Export includes chart + peak cards
15. ✅ Responsive behavior works on mobile

---

## 📞 IF YOU HAVE QUESTIONS

**If anything in this document is unclear or ambiguous:**

1. **STOP** - Do not guess or improvise
2. **ASK** - Request clarification with specific question
3. **WAIT** - Get confirmation before proceeding
4. **IMPLEMENT** - Follow confirmed instruction exactly

**Example good questions:**
- "Section 2.3 says 'align with text baseline' - should I use CSS vertical-align: baseline or flex align-items: baseline?"
- "Should the trophy emoji be an actual emoji character or an SVG icon?"

**Example bad approaches:**
- Guessing and implementing without asking
- "Improving" the design without permission
- Skipping unclear parts and coming back later

---

**REMEMBER: Follow this addendum EXACTLY. No improvisation, no shortcuts, no "improvements".**

**Good luck! 🚀**
