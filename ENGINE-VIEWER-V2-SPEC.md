# 🚀 Technical Specification: Engine Viewer v2.0 - Complete UI Overhaul

**Date:** October 31, 2025  
**Version:** 2.0  
**For:** Claude Code  
**Project:** Engine Results Viewer

---

## 📋 Executive Summary

Полный UI/UX редизайн Engine Viewer для трансформации в **профессиональное приложение iPhone-качества** с возможностью сравнения расчётов между проектами и мгновенной видимостью пиковых значений.

**КРИТИЧЕСКИ ВАЖНО:**
- **Весь UI текст ТОЛЬКО на английском языке** (international application)
- Никаких русских слов в интерфейсе (кнопки, labels, tooltips, messages)
- Комментарии в коде можно на русском/английском

---

## 🎯 Core Problems We're Solving

### Problem 1: Cannot Compare Across Projects ❌
**Current state:**  
Можно сравнивать только расчёты внутри одного проекта (Vesta $1 vs Vesta $3)

**Required:**  
Сравнивать расчёты из ЛЮБЫХ проектов (Vesta $1 vs BMW M42 $5 vs Porsche 924 $1)

**Use case:**  
Инженер хочет сравнить свой расчёт Vesta с референсным BMW двигателем из другого проекта.

---

### Problem 2: Peak Values Hidden ❌
**Current state:**  
Нужно наводить мышь на график чтобы увидеть max мощность и max момент

**Required:**  
Max Power и Max Torque всегда видны под графиком (как в dyno software)

**Use case:**  
Инженер сразу хочет видеть "92.5 kW at 6800 RPM" без необходимости искать на графике.

---

### Problem 3: Uninformative Metadata ❌
**Current state:**  
"26 points • 2000-7800 RPM" - количество точек бесполезно

**Required:**  
"2000-7800 RPM • ~200 RPM step" - шаг RPM полезен для понимания детализации

**Use case:**  
Инженеру важно знать шаг измерений, а не количество точек.

---

### Problem 4: Cluttered Interface ❌
**Current state:**  
Левая панель перегружена элементами, Units настройки занимают место

**Required:**  
Минималистичный iPhone-style, настройки спрятаны в ⚙️

**Use case:**  
Максимум пространства для графика, минимум отвлекающих элементов.

---

## 🍎 Design Philosophy: "iPhone Quality"

### Core Principles:

**1. Minimalism**
- Убрать всё что не критично
- Много whitespace
- Только суть на виду

**2. Intuitiveness**
- Без мануала понятно что делать
- Очевидные действия
- Понятные иконки

**3. Smoothness**
- Все переходы анимированы (300-500ms)
- Плавные появления/исчезновения
- No jumps, no flickers

**4. Clarity**
- Понятные Empty States
- Красивая обработка ошибок
- Информативные tooltips

**5. Details Matter**
- Micro-interactions
- Hover states
- Focus indicators
- Loading states

### ❌ What NOT to Do:

- Nested dropdowns в левой панели
- Кнопки "OK", "Apply", "Save" (всё применяется мгновенно)
- Технический жаргон без пояснений
- Мелкие кликабельные элементы (<44px)
- Резкие переходы без анимаций

### ✅ What TO Do:

- Модальные окна для сложных выборов
- Крупные тапабельные элементы (44x44px+)
- Instant apply для всех настроек
- Понятные пустые состояния
- Toast notifications для feedback
- Smooth animations everywhere

---

## 🏗️ New Architecture: Cross-Project Comparison

### Current Structure (Limited):

```typescript
// OLD: привязка к одному проекту
interface VisualizationState {
  projectId: string;  // FIXED to one project
  selectedCalculations: string[];  // только IDs из этого проекта
}

// Проблема: нельзя добавить расчёт из BMW если открыт Vesta
```

### New Structure (Flexible):

```typescript
// NEW: расчёты из любых проектов
interface VisualizationState {
  primaryCalculation: CalculationReference | null;
  comparisonCalculations: CalculationReference[];  // до 4 штук
}

interface CalculationReference {
  projectId: string;         // "vesta-16-im"
  projectName: string;       // "Vesta 1.6 IM"
  calculationId: string;     // "$1"
  calculationName: string;   // "$1" (может быть "$BMW M42 14 UpDate")
  color: string;             // "#ff6b6b" из палитры
  
  // Метаданные для отображения
  metadata: {
    rpmRange: [number, number];  // [2000, 7800]
    avgStep: number;             // 200 (средний шаг RPM)
    pointsCount: number;         // 26 (для внутренних расчётов)
    engineType: string;          // "NATUR"
    cylinders: number;           // 4
  }
}
```

### Color Palette (5 colors max):

```typescript
const COLORS = [
  "#ff6b6b",  // red
  "#4ecdc4",  // cyan
  "#45b7d1",  // blue
  "#f9ca24",  // yellow
  "#a29bfe",  // purple
];

// Primary всегда первый цвет, остальные по порядку
```

---

## 📱 Complete UI Redesign

### Layout Overview:

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to Projects    Vesta 1.6 IM                  ⚙️  │
│  NATUR • 4 cylinders • 17 calculations                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────┐  ┌─────────────────────────────────────┐ │
│  │           │  │                                      │ │
│  │  LEFT     │  │           MAIN AREA                 │ │
│  │  PANEL    │  │           (Charts + Stats)          │ │
│  │           │  │                                      │ │
│  └───────────┘  └─────────────────────────────────────┘ │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Component 1: Header (Top Bar)

### Layout:

```
┌──────────────────────────────────────────────────────────┐
│  ← Back to Projects    Vesta 1.6 IM.det             ⚙️  │
│  NATUR • 4 cylinders • 17 calculations                   │
└──────────────────────────────────────────────────────────┘
```

### Elements:

**Left:**
- `← Back to Projects` button
  - Click → navigate to home page
  - Arrow icon + text
  - Text: "Back to Projects"

**Center:**
- Project name: "Vesta 1.6 IM.det"
  - Large, bold
- Metadata line: "NATUR • 4 cylinders • 17 calculations"
  - Smaller, gray
  - Bullets between items

**Right:**
- `⚙️` Settings icon
  - Click → opens settings popover
  - Size: 24x24px
  - Hover effect

### Settings Popover (click on ⚙️):

```
┌─────────────────────────────────┐
│  Settings                  [×]  │
├─────────────────────────────────┤
│                                  │
│  🌍 Units                        │
│                                  │
│  ⦿ SI Units                     │
│     kW • N·m • bar • °C         │
│                                  │
│  ○ American Units               │
│     bhp • lb-ft • psi • °F      │
│                                  │
│  ○ Power in HP (hybrid)         │
│     PS • N·m • bar • °C         │
│                                  │
├─────────────────────────────────┤
│                                  │
│  🎨 Theme                        │
│  ⦿ Light    ○ Dark              │
│                                  │
├─────────────────────────────────┤
│                                  │
│  📊 Chart                        │
│  Animation:  ☑ Enabled          │
│  Grid:       ☑ Show             │
│  Decimals:   [2 ▼]              │
│                                  │
└─────────────────────────────────┘
```

**Behavior:**
- Instant apply (no OK/Save button)
- Click outside → closes
- Save to localStorage
- Default: SI Units, Light theme

**Units Conversion:**

```javascript
// Power
kW → bhp: kW × 1.341       // British HP
kW → PS:  kW × 1.36        // Metric HP (Russian/German)

// Torque
N·m → lb-ft: N·m × 0.7376

// Pressure
bar → psi: bar × 14.504

// Temperature
°C → °F: (°C × 9/5) + 32
```

---

## 🎯 Component 2: Left Panel (Calculation Selection)

### Initial State (Empty):

```
┌─────────────────────────────────┐
│                                  │
│  📊 Primary Calculation         │
│                                  │
│  [Select calculation...]         │
│                                  │
└─────────────────────────────────┘
```

**Text:** "Select calculation..." (placeholder button)  
**Click** → opens Primary Selection Modal

---

### After Primary Selected:

```
┌─────────────────────────────────┐
│  📊 Primary Calculation    ⚫   │
│                                  │
│  Vesta 1.6 IM → $1        [↻]  │
│  2000-7800 RPM • ~200 RPM       │
│                                  │
├─────────────────────────────────┤
│                                  │
│  💪 Chart Presets               │
│                                  │
│  [Power & Torque] [Pressure]    │
│  [Temperature]    [Custom]      │
│                                  │
├─────────────────────────────────┤
│                                  │
│  ⚖️ Compare With          (0/4) │
│                                  │
│  [+ Add Calculation]             │
│                                  │
└─────────────────────────────────┘
```

**Elements:**

**Primary Calculation Card:**
- Color indicator: ⚫ (red #ff6b6b)
- Text: "Vesta 1.6 IM → $1"
- Metadata: "2000-7800 RPM • ~200 RPM"
- [↻] button → change primary (reopens modal)

**Chart Presets:**
- 4 buttons in 2x2 grid
- Text only, no icons needed
- Active preset = highlighted
- Click → instant chart update

**Comparison Section:**
- Counter: "(0/4)"
- Button: "+ Add Calculation"
- Click → opens Comparison Selection Modal

---

### With Comparisons Added:

```
┌─────────────────────────────────┐
│  📊 Primary Calculation    ⚫   │
│  Vesta 1.6 IM → $1        [↻]  │
│  2000-7800 RPM • ~200 RPM       │
│                                  │
├─────────────────────────────────┤
│  💪 Chart Presets               │
│  [Power & Torque] ...           │
│                                  │
├─────────────────────────────────┤
│  ⚖️ Compare With          (2/4) │
├─────────────────────────────────┤
│                                  │
│  ⚪ BMW M42 → $5          [×]   │
│     2000-8000 RPM • ~200 RPM    │
│                                  │
│  🟡 Vesta 1.6 IM → $3     [×]   │
│     2000-7800 RPM • ~200 RPM    │
│                                  │
│  [+ Add Calculation (2 more)]   │
│                                  │
└─────────────────────────────────┘
```

**Comparison Cards:**
- Color indicator: ⚪🟡🔵🟣 (colors 2-5)
- Format: "ProjectName → CalculationID"
- Metadata line
- [×] button to remove
- Click on card → highlight on chart

---

## 🎯 Component 3: Primary Selection Modal

### Step 1: Select Calculation from Current Project

```
┌──────────────────────────────────────────────────┐
│  Select Primary Calculation                 [×] │
├──────────────────────────────────────────────────┤
│                                                  │
│  Project: Vesta 1.6 IM                          │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 🔍 Search calculation...                   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ ⚫ $1                                  →    │ │
│  │    2000-7800 RPM • ~200 RPM step          │ │
│  ├────────────────────────────────────────────┤ │
│  │ ⚪ $2                                  →    │ │
│  │    2000-7800 RPM • ~200 RPM step          │ │
│  ├────────────────────────────────────────────┤ │
│  │ ⚪ $3                                  →    │ │
│  │    2000-7800 RPM • ~200 RPM step          │ │
│  ├────────────────────────────────────────────┤ │
│  │ ⚪ $3.1                                →    │ │
│  │    2000-7800 RPM • ~200 RPM step          │ │
│  ├────────────────────────────────────────────┤ │
│  │ ⚪ $3.1 R 0.86                         →    │ │
│  │    2000-7800 RPM • ~200 RPM step          │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Scroll for more...                             │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Behavior:**
- Modal opens from center with fade-in
- Backdrop dim (rgba(0,0,0,0.5))
- Click on row → select & close modal
- ESC key → close without selection
- Click [×] → close without selection
- Search filters list in real-time

**Each Row:**
- Height: 60-80px (tappable)
- Hover effect
- Selected: ⚫ filled circle
- Not selected: ⚪ empty circle
- Arrow → indicates clickable

**Metadata Format:**
```typescript
// Calculate step
const avgStep = calculateAverageStep(dataPoints);
// "2000-7800 RPM • ~200 RPM step"
```

---

## 🎯 Component 4: Comparison Selection Modal

### Step 1: Select Project

```
┌──────────────────────────────────────────────────┐
│  ← Cancel    Add for Comparison                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  Step 1 of 2: Select Project                    │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 🔍 Search projects...                      │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 📂 BMW M42                           →     │ │
│  │    30 calculations • TURBO • 4 cyl        │ │
│  │    Last modified: Oct 26, 2024            │ │
│  ├────────────────────────────────────────────┤ │
│  │ 📂 Vesta 1.6 IM                      →     │ │
│  │    17 calculations • NATUR • 4 cyl        │ │
│  │    Last modified: Nov 01, 2024            │ │
│  ├────────────────────────────────────────────┤ │
│  │ 📂 Porsche 924                       →     │ │
│  │    5 calculations • TURBO • 4 cyl         │ │
│  │    Last modified: Dec 03, 2024            │ │
│  ├────────────────────────────────────────────┤ │
│  │ 📂 4RACING 1600                      →     │ │
│  │    7 calculations • NATUR • 4 cyl         │ │
│  │    Last modified: Nov 27, 2024            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Click on project** → smooth transition to Step 2

---

### Step 2: Select Calculation

```
┌──────────────────────────────────────────────────┐
│  ← BMW M42       Add for Comparison             │
├──────────────────────────────────────────────────┤
│                                                  │
│  Step 2 of 2: Select Calculation                │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 🔍 Search calculation...                   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ ⚪ $1                                       │ │
│  │    2000-8000 RPM • ~200 RPM step          │ │
│  ├────────────────────────────────────────────┤ │
│  │ ⚪ $5                                       │ │
│  │    2000-8000 RPM • ~200 RPM step          │ │
│  ├────────────────────────────────────────────┤ │
│  │ ⚪ $10                                      │ │
│  │    2000-8200 RPM • ~220 RPM step          │ │
│  ├────────────────────────────────────────────┤ │
│  │ ⚪ $15 Update                               │ │
│  │    2000-8200 RPM • ~220 RPM step          │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│                                                  │
│              [Add Calculation]                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Behavior:**
- Click "← BMW M42" → back to Step 1
- Select calculation (click row) → button activates
- Click [Add Calculation] → adds to comparison list, closes modal
- Assign next color from palette

---

## 🎯 Component 5: Chart Area with Stats

### Layout:

```
┌──────────────────────────────────────────────────────────┐
│  💪 Power & Torque                      PNG▼  SVG▼      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ P-Av (kW)                             Torque (N·m) │  │
│  │   150 ┤                                      210 ┤  │  │
│  │       │         ⭐ MAX                           │  │  │
│  │   120 ┤       ╱─────╲ ⚪                    180 ┤  │  │
│  │       │     ╱         ╲                         │  │  │
│  │    90 ┤ ⚫─╱             ╲──               150 ┤  │  │
│  │       │╱ MAX                ╲                   │  │  │
│  │    60 ┤                       ╲             120 ┤  │  │
│  │       │     │← Cursor line                     │  │  │
│  │    30 ┤     │                               90 ┤  │  │
│  │       └─────┼────┬──────┬──────┬──────┬────────┘  │  │
│  │          2000  3000  4000  5000  6000  7000 RPM   │  │
│  │                                                    │  │
│  │  ━━━━ ⚫ Vesta 1.6 IM → $1   ━ ━ ⚪ BMW M42 → $5  │  │
│  │  (click to hide/show)                             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌──────── Live Cursor (3400 RPM) ──────────────────┐   │
│  │ ⚫ Vesta → $1:  78.5 kW  •  165.2 N·m            │   │
│  │ ⚪ BMW → $5:    95.3 kW  •  178.6 N·m            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────── Peak Values ─────────────────────────────┐   │
│  │                                                    │   │
│  │  ⚫ Vesta 1.6 IM → $1                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │ 🏆 Max Power    │  │ 🏆 Max Torque   │        │   │
│  │  │ 92.5 kW         │  │ 178.3 N·m       │        │   │
│  │  │ at 6800 RPM     │  │ at 4200 RPM     │        │   │
│  │  └─────────────────┘  └─────────────────┘        │   │
│  │                                                    │   │
│  │  ⚪ BMW M42 → $5                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐        │   │
│  │  │ 🏆 Max Power    │  │ 🏆 Max Torque   │        │   │
│  │  │ 137.2 kW        │  │ 195.6 N·m       │        │   │
│  │  │ at 7200 RPM     │  │ at 5400 RPM     │        │   │
│  │  └─────────────────┘  └─────────────────┘        │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

### Chart Features:

**Interactive:**
- ✅ Zoom (mouse wheel / pinch)
- ✅ Pan (drag)
- ✅ Tooltip on hover
- ✅ Legend click → hide/show line
- ✅ Slider at bottom (range selection)

**Peak Markers:**
- ⭐ on chart at peak points
- Hover on ⭐ → tooltip with exact value
- Different marker for each calculation

**Export:**
- PNG button → downloads PNG
- SVG button → downloads SVG
- Filename: "EngineName_PresetName_Date.png"

---

### Live Cursor Panel:

**Behavior:**
- Only visible when mouse over chart
- Follows cursor position
- Shows values for ALL calculations at that RPM
- Snap to nearest data point
- Format: "ProjectName → CalcID: Value1 • Value2"

**Styling:**
- White background
- Subtle shadow
- Positioned above chart
- 2-3 lines max

---

### Peak Values Cards:

**For Each Calculation:**
- Section with calculation name
- 2 cards side-by-side (Power + Torque)
- Card shows:
  - Trophy icon 🏆
  - Label: "Max Power" / "Max Torque"
  - Value with unit
  - "at XXXX RPM"

**Layout:**
- Responsive grid
- Desktop: 2 columns
- Mobile: 1 column

**Different for Presets:**

**Preset 1 (Power & Torque):**
- Max P-Av
- Max Torque

**Preset 2 (Cylinder Pressure):**
- Max PCylMax(1)
- Max PCylMax(2)
- Max PCylMax(3)
- Max PCylMax(4)

**Preset 3 (Temperature):**
- Max TCylMax (all cylinders combined)
- Max TUbMax (all cylinders combined)
- Delta (difference)

**Preset 4 (Custom):**
- Max for each selected parameter

---

## 🎯 Component 6: Chart Presets

### 4 Presets (keep existing logic):

**1. Power & Torque**
- P-Av (left Y-axis, kW)
- Torque (right Y-axis, N·m)
- X-axis: RPM

**2. Cylinder Pressure**
- PCylMax(1), PCylMax(2), PCylMax(3), PCylMax(4)
- Y-axis: bar
- X-axis: RPM
- 4 lines

**3. Temperature**
- TCylMax (averaged across cylinders)
- TUbMax (averaged across cylinders)
- Y-axis: °C
- X-axis: RPM
- 2 lines

**4. Custom**
- User selects parameters
- (Keep existing implementation)

### Button Styling:

```
┌──────────────────┐  ┌──────────────────┐
│ Power & Torque   │  │ Pressure         │
└──────────────────┘  └──────────────────┘

Active: Blue background, white text
Inactive: White background, gray text
Hover: Light blue background
```

---

## 🎯 Component 7: Data Table (под графиками)

**Оставляем как есть, НО:**

### Changes Needed:

1. **Update headers based on units setting**
   - SI: "P-Av (kW)", "Torque (N·m)"
   - American: "P-Av (bhp)", "Torque (lb-ft)"
   - HP: "P-Av (PS)", "Torque (N·m)"

2. **Add calculation source column**
   - "Project → Calculation"
   - Example: "Vesta 1.6 IM → $1"

3. **Filter by calculation**
   - Dropdown: "Show: [All calculations ▼]"
   - Can select specific calculation

4. **Color indicator in table**
   - Small colored dot next to project name
   - Matches chart line color

---

## 🎯 Animations & Transitions

### Modal Animations:

```css
/* Open */
- Backdrop: fade in 200ms
- Modal: slide up + fade in 300ms
- Starting position: translateY(20px), opacity 0
- Ending position: translateY(0), opacity 1

/* Close */
- Modal: fade out 200ms
- Backdrop: fade out 200ms
```

### Chart Transitions:

```css
/* Preset change */
- Cross-fade 400ms
- Old chart fades out while new fades in

/* Add/remove line */
- Fade in/out 300ms
- No sudden appearance
```

### Panel Animations:

```css
/* Left panel expand/collapse */
- Width change: 300ms ease-out
- Content fade: 200ms

/* Cards appear */
- Stagger: 50ms between each
- Slide down + fade in
```

---

## 🎯 Empty States

### No Primary Calculation Selected:

```
┌────────────────────────────────────┐
│                                     │
│             📊                      │
│                                     │
│    Select Primary Calculation      │
│    to start visualization          │
│                                     │
│                                     │
│     [Select Calculation]           │
│                                     │
│                                     │
└────────────────────────────────────┘
```

Center in main area, friendly message.

---

### No Comparisons Yet:

```
┌────────────────────────────────────┐
│             ⚖️                      │
│                                     │
│       No Comparisons Yet           │
│                                     │
│   Add calculations to compare      │
│   characteristics and analyze      │
│   differences                      │
│                                     │
│   [+ Add First Calculation]        │
└────────────────────────────────────┘
```

In left panel when comparison section empty.

---

## 🎯 Error Handling

### Failed to Load Project:

```
┌────────────────────────────────────┐
│             ⚠️                      │
│                                     │
│    Failed to Load Project          │
│                                     │
│    File "Vesta 1.6 IM.det"        │
│    not found or corrupted          │
│                                     │
│  [Try Again]  [Cancel]             │
└────────────────────────────────────┘
```

Modal in center, clear message.

---

### Toast Notifications:

```
Bottom-right corner:

┌────────────────────────────┐
│ ✅ Calculation added       │
└────────────────────────────┘
  ↑ Appears 2 sec, fades out

┌────────────────────────────┐
│ ❌ Failed to load data     │
└────────────────────────────┘

┌────────────────────────────┐
│ ℹ️ Maximum 5 calculations  │
└────────────────────────────┘
```

Auto-dismiss after 3 seconds.

---

## 🎨 Design Tokens

### Colors:

```css
/* Light Theme (default) */
--bg-primary: #F9FAFB;
--bg-surface: #FFFFFF;
--bg-hover: #F3F4F6;
--border: #E5E7EB;
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--primary: #3B82F6;
--primary-hover: #2563EB;
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;

/* Calculation Colors */
--calc-1: #ff6b6b;
--calc-2: #4ecdc4;
--calc-3: #45b7d1;
--calc-4: #f9ca24;
--calc-5: #a29bfe;
```

### Typography:

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing:

```css
/* 8px grid */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
```

### Borders:

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;

--shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
```

---

## 📐 Responsive Breakpoints

```css
/* Desktop first approach */
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile */ }
```

### Desktop (>1024px):
- Left panel: 320px fixed
- Main area: flex-grow
- Peak cards: 2 columns

### Tablet (768-1024px):
- Left panel: collapsible (hamburger menu)
- Main area: full width
- Peak cards: 2 columns

### Mobile (<768px):
- Left panel: full-screen overlay
- Charts: full width, scrollable
- Peak cards: 1 column

---

## 🔧 Technical Implementation Notes

### State Management:

```typescript
// Global state (Zustand or Context)
interface AppState {
  // Current visualization
  primaryCalculation: CalculationReference | null;
  comparisonCalculations: CalculationReference[];
  
  // Settings
  units: 'si' | 'american' | 'hp';
  theme: 'light' | 'dark';
  chartSettings: {
    animation: boolean;
    showGrid: boolean;
    decimals: number;
  };
  
  // UI state
  isSettingsOpen: boolean;
  isPrimaryModalOpen: boolean;
  isComparisonModalOpen: boolean;
  selectedPreset: 1 | 2 | 3 | 4;
}
```

### Data Fetching:

```typescript
// Fetch calculation data on-demand
async function fetchCalculationData(
  projectId: string,
  calculationId: string
): Promise<CalculationData> {
  const response = await fetch(
    `/api/project/${projectId}?calculation=${calculationId}`
  );
  return response.json();
}

// Cache fetched data (React Query recommended)
// Don't re-fetch if already loaded
```

### RPM Step Calculation:

```typescript
function calculateAverageStep(dataPoints: DataPoint[]): number {
  if (dataPoints.length < 2) return 0;
  
  const rpms = dataPoints.map(p => p.RPM).sort((a, b) => a - b);
  const steps: number[] = [];
  
  for (let i = 1; i < rpms.length; i++) {
    steps.push(rpms[i] - rpms[i-1]);
  }
  
  const avgStep = steps.reduce((a, b) => a + b, 0) / steps.length;
  
  // Round to nearest 50
  return Math.round(avgStep / 50) * 50;
}

// Format: "~200 RPM" or "~250 RPM"
```

### Peak Values Calculation:

```typescript
interface PeakValue {
  value: number;
  rpm: number;
  parameter: string;
}

function findPeak(
  dataPoints: DataPoint[],
  parameter: keyof DataPoint
): PeakValue {
  let maxValue = -Infinity;
  let maxRPM = 0;
  
  for (const point of dataPoints) {
    const value = point[parameter] as number;
    if (value > maxValue) {
      maxValue = value;
      maxRPM = point.RPM;
    }
  }
  
  return {
    value: maxValue,
    rpm: maxRPM,
    parameter: parameter as string
  };
}

// Usage:
const maxPower = findPeak(data, 'PAv');
const maxTorque = findPeak(data, 'Torque');
```

### Units Conversion:

```typescript
function convertValue(
  value: number,
  parameter: string,
  targetUnits: 'si' | 'american' | 'hp'
): number {
  if (targetUnits === 'si') return value;
  
  // Power conversions
  if (parameter === 'PAv') {
    if (targetUnits === 'american') return value * 1.341; // kW → bhp
    if (targetUnits === 'hp') return value * 1.36;        // kW → PS
  }
  
  // Torque conversions
  if (parameter === 'Torque') {
    if (targetUnits === 'american') return value * 0.7376; // N·m → lb-ft
  }
  
  // Pressure conversions
  if (parameter.includes('PCyl') || parameter.includes('bar')) {
    if (targetUnits === 'american') return value * 14.504; // bar → psi
  }
  
  // Temperature conversions
  if (parameter.includes('T') && parameter.includes('Cyl')) {
    if (targetUnits === 'american') return (value * 9/5) + 32; // °C → °F
  }
  
  return value;
}

function getUnitLabel(
  parameter: string,
  units: 'si' | 'american' | 'hp'
): string {
  const labels = {
    PAv: {
      si: 'kW',
      american: 'bhp',
      hp: 'PS'
    },
    Torque: {
      si: 'N·m',
      american: 'lb-ft',
      hp: 'N·m'
    },
    Pressure: {
      si: 'bar',
      american: 'psi',
      hp: 'bar'
    },
    Temperature: {
      si: '°C',
      american: '°F',
      hp: '°C'
    }
  };
  
  // Map parameter to category
  // Return appropriate label
}
```

---

## ✅ Implementation Checklist

### Phase 1: Architecture & State (Week 1)

**Backend (no changes needed):**
- [ ] Verify API returns all needed data
- [ ] Test cross-project data fetching

**Frontend - State:**
- [ ] Create new state structure (CalculationReference)
- [ ] Implement state management (Zustand/Context)
- [ ] Add units conversion utilities
- [ ] Add RPM step calculation
- [ ] Add peak values calculation

**Frontend - Routing:**
- [ ] Update visualization route (remove projectId dependency)
- [ ] Handle empty state (no primary selected)

---

### Phase 2: Core UI Components (Week 2)

**Header:**
- [ ] Back button
- [ ] Project name display
- [ ] Settings icon + popover
- [ ] Settings: Units (3 options)
- [ ] Settings: Theme toggle
- [ ] Settings: Chart options
- [ ] Instant apply for all settings
- [ ] Save to localStorage

**Left Panel:**
- [ ] Primary calculation section
  - [ ] Empty state with placeholder button
  - [ ] Selected state with info
  - [ ] Change button [↻]
- [ ] Chart presets (4 buttons)
- [ ] Comparison section
  - [ ] Counter (X/4)
  - [ ] Empty state
  - [ ] List of comparisons
  - [ ] Remove button [×] per item
  - [ ] Add button

---

### Phase 3: Modal Dialogs (Week 2)

**Primary Selection Modal:**
- [ ] Modal component (backdrop + content)
- [ ] Search input (real-time filter)
- [ ] Scrollable list
- [ ] Large tappable rows (60-80px)
- [ ] Metadata display (RPM range, step)
- [ ] Selection indicator (⚫⚪)
- [ ] Close on selection
- [ ] Close on ESC/click outside
- [ ] Smooth animations

**Comparison Selection Modal:**
- [ ] Two-step flow
- [ ] Step 1: Project list
  - [ ] Search input
  - [ ] Project cards with metadata
  - [ ] Back button
- [ ] Step 2: Calculation list
  - [ ] Search input
  - [ ] Calculation rows
  - [ ] Add button (disabled until selection)
  - [ ] Back to Step 1
- [ ] Smooth transitions between steps
- [ ] Color assignment (next from palette)

---

### Phase 4: Charts & Visualization (Week 3)

**Chart Component:**
- [ ] Update to support multiple CalculationReferences
- [ ] Different line colors
- [ ] Peak markers (⭐) on chart
- [ ] Marker tooltips
- [ ] Legend with click to hide/show
- [ ] Export buttons (PNG, SVG)
- [ ] Responsive sizing

**Live Cursor:**
- [ ] Floating panel component
- [ ] Follow mouse position
- [ ] Show values for all calculations
- [ ] Snap to nearest RPM point
- [ ] Smooth animations
- [ ] Only visible on hover

**Peak Values Cards:**
- [ ] Dynamic layout based on preset
- [ ] Calculation name headers
- [ ] Cards grid (responsive)
- [ ] Trophy icon
- [ ] Value + RPM display
- [ ] Units conversion applied
- [ ] Color indicators

**Presets:**
- [ ] Update all 4 presets
- [ ] Dynamic peak cards for each preset
- [ ] Correct parameters for each
- [ ] Button active states

---

### Phase 5: Data Table Updates (Week 3)

**Table:**
- [ ] Add calculation source column
- [ ] Color indicator dots
- [ ] Update headers based on units
- [ ] Filter by calculation dropdown
- [ ] Apply units conversion to values
- [ ] Export with correct units

---

### Phase 6: Polish & Details (Week 4)

**Animations:**
- [ ] Modal open/close (300ms)
- [ ] Chart transitions (400ms)
- [ ] Panel expand/collapse (300ms)
- [ ] Card appearances (stagger 50ms)
- [ ] Smooth hover effects
- [ ] Loading states

**Empty States:**
- [ ] No primary selected
- [ ] No comparisons
- [ ] No projects available

**Error Handling:**
- [ ] Failed to load project
- [ ] Failed to fetch calculation
- [ ] Toast notifications
  - [ ] Success messages
  - [ ] Error messages
  - [ ] Info messages
- [ ] Graceful degradation

**Responsive:**
- [ ] Desktop layout (>1024px)
- [ ] Tablet layout (768-1024px)
- [ ] Mobile layout (<768px)
- [ ] Collapsible left panel on mobile
- [ ] Touch-friendly interactions

**Accessibility:**
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Screen reader support
- [ ] Color contrast (4.5:1)

---

### Phase 7: Testing & Optimization (Week 4)

**Testing:**
- [ ] Test with Vesta 1.6 IM
- [ ] Test with BMW M42
- [ ] Test cross-project comparison (3+ calculations)
- [ ] Test all presets
- [ ] Test units conversion
- [ ] Test peak values calculation
- [ ] Test RPM step calculation
- [ ] Test on different screen sizes
- [ ] Test all animations
- [ ] Test error cases

**Performance:**
- [ ] Optimize chart rendering
- [ ] Cache fetched data
- [ ] Lazy load calculations
- [ ] Debounce search inputs
- [ ] Optimize re-renders

**Final Polish:**
- [ ] Remove console logs
- [ ] Clean up comments
- [ ] Consistent code style
- [ ] Update documentation
- [ ] Create demo video/screenshots

---

## 📝 UI Text Guidelines (ENGLISH ONLY)

### All user-facing text must be in English:

**✅ Correct:**
- "Select Primary Calculation"
- "Add for Comparison"
- "Max Power"
- "Settings"
- "Back to Projects"

**❌ Wrong:**
- "Выберите расчёт"
- "Добавить для сравнения"
- Any Cyrillic characters in UI

### Tooltips & Help Text:

- Keep concise
- Use title case for headers
- Use sentence case for descriptions
- No technical jargon
- Examples where helpful

---

## 🎯 Success Criteria

**The implementation is complete when:**

1. ✅ Can select primary calculation from any project
2. ✅ Can add up to 4 comparisons from ANY projects
3. ✅ Peak values visible for all calculations
4. ✅ RPM step shown instead of point count
5. ✅ Live cursor works on chart
6. ✅ All UI text in English
7. ✅ Units conversion works (3 systems)
8. ✅ Settings accessible via ⚙️
9. ✅ All animations smooth (no jank)
10. ✅ Empty states friendly
11. ✅ Errors handled gracefully
12. ✅ Responsive on all screen sizes
13. ✅ All 4 presets work correctly
14. ✅ Export functions work
15. ✅ Accessible (keyboard, screen readers)

---

## 💡 Important Notes for Claude Code

### Before You Start:

1. **Read the existing codebase** - understand current structure
2. **Test with real data** - use Vesta 1.6 IM.det and BMW M42.det
3. **Check documentation** - refer to React 18, ECharts, TypeScript docs when needed
4. **Small commits** - incremental changes, test frequently
5. **Ask questions** - if something is unclear, ask before implementing

### Code Quality:

- TypeScript strict mode
- No `any` types
- Descriptive variable names
- Comments for complex logic
- Reusable components
- Custom hooks for business logic
- Clean component structure

### Testing as You Go:

- After each component: test it in isolation
- After integration: test the flow
- Test edge cases (empty states, errors)
- Test on different browsers
- Test responsive design

### Performance Considerations:

- Memoize expensive calculations
- Use React.memo for heavy components
- Debounce search inputs
- Lazy load chart data
- Optimize ECharts config

---

## 🚀 Ready to Start!

This is a comprehensive redesign that will transform Engine Viewer into a professional-grade application.

**Take your time, follow best practices, and create something amazing!** 🎯

Good luck! 🚀