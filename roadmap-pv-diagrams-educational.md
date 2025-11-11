# Roadmap: PV-Diagrams Educational Enhancement

## 🎯 Project Goal
Transform PV-Diagrams page into an **educational tool** for teaching internal combustion engine principles to students. Remove unnecessary complexity (cylinder selection), add powerful learning features (multi-RPM comparison, cycle phases, valve timing markers).

**Target audience:** Teachers and students studying 4-stroke engine operation

## 📊 Current Status
- **Stage:** Stage 1 preparation
- **Progress:** 0/42 tasks completed (0%)
- **Next:** Create roadmap → Start Stage 1

---

## 🚀 Development Stages

### Stage 1: Simplify UI + Multi-RPM Comparison (4-6 hours) 🎯 KEY FEATURE
**Goal:** Remove cylinder selection clutter, add educational RPM comparison feature

**Why this matters for education:**
- Students can SEE how engine cycle changes with RPM
- Compare peak pressures across operating ranges
- Visualize breathing efficiency differences
- Understand valve timing importance at different speeds

**1.1 Remove Cylinder Selection (1-2 hours):**
- [ ] Remove `selectedCylinder` from Zustand (`pvDiagramsSlice.ts`) - always use index 0 (30 min)
- [ ] Delete `CylinderFilterSection.tsx` component (15 min)
- [ ] Update `PVLeftPanel.tsx` - remove cylinder filter section (15 min)
- [ ] Update `PVDiagramChart.tsx` - remove selectedCylinder prop, always use cylinder 0 (30 min)
- [ ] Update `chartOptionsHelpers.ts` - remove cylindersToShow logic, always single cylinder (30 min)
- [ ] Update `PeakValuesCards.tsx` - remove selectedCylinder prop (15 min)
- [ ] Clean up types: remove selectedCylinder references (15 min)

**1.2 Multi-RPM Comparison Feature (2-3 hours):**
- [ ] Zustand state: Change `selectedRPM: string | null` → `selectedRPMs: string[]` (30 min)
- [ ] Add actions: `addSelectedRPM`, `removeSelectedRPM`, `clearSelectedRPMs` (30 min)
- [ ] Update `RPMSection.tsx` - checkbox-based multi-select (1-2 hours):
  - Checkboxes instead of radio buttons
  - Max 4 RPMs selected at once (educational limit)
  - "Compare" mode indicator
  - Clear all button
- [ ] Update `usePVDData` hook - load multiple files (1 hour):
  - Accept `string[]` instead of `string | undefined`
  - Parallel data fetching (Promise.all)
  - Combined loading/error states
- [ ] Update chart helpers - overlay multiple RPM series (1-2 hours):
  - Different colors per RPM: #e74c3c (2000), #3498db (4000), #2ecc71 (6000), #f39c12 (8000)
  - Legend: "2000 RPM", "4000 RPM", etc.
  - Tooltip: show RPM value
  - All 3 chart types support (P-V, Log P-V, P-α)

**1.3 Peak Values Update (30 min):**
- [ ] `PeakValuesCards.tsx` - show comparison mode (30 min):
  - When multiple RPMs: show min/max across ALL selected
  - Label: "Max Pressure (across 2 RPMs): XX.X bar"

**Verify Stage 1 (COMPREHENSIVE):**
- [ ] **TypeScript:** `npm run typecheck` - no errors
- [ ] **Frontend Build:** `npm run build` - successful
- [ ] **Backend:** Running on http://localhost:3000
- [ ] **Frontend Dev:** Running on http://localhost:5174
- [ ] **Browser Test:**
  - Navigate to `/project/v8/pv-diagrams`
  - No cylinder filter visible ✓
  - Can select multiple RPMs (2-4 files) ✓
  - All RPMs render on same chart ✓
  - Different colors + legend visible ✓
  - P-V, Log P-V, P-α all work with multi-RPM ✓
  - Peak values show comparison mode ✓
- [ ] **Code Quality:** No unused imports, clean code
- [ ] **Git Commit:** "feat(pv-diagrams): Stage 1 - remove cylinder selection + multi-RPM comparison"

---

### Stage 2: Cycle Phases Visualization (3-4 hours) 🎨 VISUAL LEARNING
**Goal:** Add colored zones to P-α diagram showing 4-stroke cycle phases

**Educational value:**
- Students instantly SEE which part of chart = which stroke
- Color-coded phases: Intake (blue) → Compression (green) → Power (red) → Exhaust (gray)
- Matches textbook diagrams students already know

**2.1 Cycle Phases Component (1 hour):**
- [ ] Create toggle control in `PVLeftPanel.tsx` - "Show Cycle Phases" (30 min)
- [ ] Zustand state: `showCyclePhases: boolean` (default: true) (15 min)
- [ ] Action: `setShowCyclePhases(value: boolean)` (15 min)

**2.2 ECharts Implementation (2-3 hours):**
- [ ] Update `createPAlphaChartOptions` in `chartOptionsHelpers.ts` (2-3 hours):
  - Add `markArea` for 4 zones:
    - **Intake:** 0-180° - rgba(59, 130, 246, 0.1) - blue/10
    - **Compression:** 180-360° - rgba(34, 197, 94, 0.1) - green/10
    - **Power:** 360-540° - rgba(239, 68, 68, 0.1) - red/10
    - **Exhaust:** 540-720° - rgba(107, 114, 128, 0.1) - gray/10
  - Labels at top: "INTAKE", "COMPRESSION", "POWER", "EXHAUST"
  - Label position: inside, top, font-size: 11px, font-weight: 600
  - Conditional rendering based on `showCyclePhases` state

**2.3 UI Polish (30 min):**
- [ ] Add info tooltip next to toggle: "Colored zones show 4-stroke cycle phases" (15 min)
- [ ] Legend integration: phases appear in legend (optional, if not cluttered) (15 min)

**Verify Stage 2 (COMPREHENSIVE):**
- [ ] **TypeScript:** `npm run typecheck` - no errors
- [ ] **Frontend Build:** `npm run build` - successful
- [ ] **Browser Visual Test:**
  - P-α diagram shows 4 colored zones ✓
  - Zones aligned correctly: Intake 0-180°, Compression 180-360°, etc. ✓
  - Labels visible at top of each zone ✓
  - Toggle "Show Cycle Phases" works (on/off) ✓
  - Colors not too bright (opacity 0.1) ✓
  - Multi-RPM comparison still works with zones ✓
- [ ] **Educational Value Test:** Show to non-engineer - can they identify phases? ✓
- [ ] **Playwright E2E Test (optional):**
  - Toggle cycle phases on/off
  - Verify zones render
- [ ] **Git Commit:** "feat(pv-diagrams): Stage 2 - cycle phases visualization"

---

### Stage 3: Key Point Markers (2-3 hours) 📍 CRITICAL POINTS
**Goal:** Highlight important points on P-α diagram (TDC/BDC already exist, add Max Pressure marker)

**Educational value:**
- Students learn WHERE combustion happens (Max Pressure point)
- Understand timing: pressure peak vs TDC position
- Compare timing across RPMs

**3.1 Max Pressure Marker (1-2 hours):**
- [ ] Create utility function `findMaxPressurePoint` in `pvDiagramUtils.ts` (30 min):
  - Returns: { angle: number, pressure: number, rpm: string }
  - For multi-RPM: find max across ALL selected RPMs
- [ ] Update `createPAlphaChartOptions` - add Max Pressure markPoint (1-2 hours):
  - Symbol: 'pin' or 'diamond'
  - Color: '#ef4444' (red)
  - Label: "Max: XX.X bar @ YYY°"
  - Label position: top
  - For multi-RPM: mark ALL peak points with different colors

**3.2 Toggle Control (30 min):**
- [ ] Add toggle in `PVLeftPanel.tsx` - "Show Markers" (15 min)
- [ ] Zustand state: `showMarkers: boolean` (default: true) (15 min)
- [ ] Conditional rendering in chart options (already exists for TDC/BDC)

**3.3 Enhanced TDC/BDC (existing, just verify) (30 min):**
- [ ] Verify TDC markers: 0°, 360°, 720° (red dashed) visible
- [ ] Verify BDC markers: 180°, 540° (blue dotted) visible
- [ ] Ensure labels clear and readable

**Verify Stage 3 (COMPREHENSIVE):**
- [ ] **TypeScript:** `npm run typecheck` - no errors
- [ ] **Frontend Build:** `npm run build` - successful
- [ ] **Browser Visual Test:**
  - Max Pressure marker visible on P-α chart ✓
  - Marker positioned correctly (at peak pressure angle) ✓
  - Label shows pressure + angle ✓
  - Multi-RPM: multiple markers visible (different colors) ✓
  - Toggle "Show Markers" works ✓
  - TDC/BDC lines still visible ✓
- [ ] **Educational Value:** Can student identify combustion timing? ✓
- [ ] **Git Commit:** "feat(pv-diagrams): Stage 3 - key point markers (Max Pressure)"

---

### Stage 4a: Valve Timing Lines (MVP) (3-4 hours) 🔧 VALVE EVENTS
**Goal:** Add vertical lines showing valve open/close events on P-α diagram

**Educational value:**
- Students SEE when valves open/close relative to piston position
- Understand valve overlap (IVO before TDC, EVC after TDC)
- Learn why timing matters for breathing efficiency

**4a.1 Hard-coded Typical Values (30 min):**
- [ ] Create constants in `pvDiagramUtils.ts` (30 min):
  ```typescript
  export const TYPICAL_VALVE_TIMING = {
    IVO: 350,  // Intake Valve Open: 10° before TDC (0°)
    IVC: 230,  // Intake Valve Close: 50° after BDC (180°)
    EVO: 490,  // Exhaust Valve Open: 50° before BDC (540°)
    EVC: 10,   // Exhaust Valve Close: 10° after TDC (0°/720°)
  };
  ```
  - Note: These are TYPICAL values for educational purposes
  - Real values will come from .ipo/.exp parsing (Phase 4b - deferred)

**4a.2 ECharts Implementation (2-3 hours):**
- [ ] Update `createPAlphaChartOptions` - add valve timing markLines (2-3 hours):
  - **IVO line:** 350° - green dashed, label "IVO" (Intake Valve Open)
  - **IVC line:** 230° - green solid, label "IVC" (Intake Valve Close)
  - **EVO line:** 490° - orange dashed, label "EVO" (Exhaust Valve Open)
  - **EVC line:** 10° - orange solid, label "EVC" (Exhaust Valve Close)
  - Line style: lineWidth: 1.5, opacity: 0.7
  - Labels: fontSize: 10, position: 'end', color matching line color
  - Conditional rendering based on `showValveTiming` state

**4a.3 Toggle Control + Info (30 min):**
- [ ] Add toggle in `PVLeftPanel.tsx` - "Show Valve Timing" (15 min)
- [ ] Zustand state: `showValveTiming: boolean` (default: false) (15 min)
- [ ] Info tooltip: "Typical valve timing for 4-stroke engine (educational values)" (15 min)

**4a.4 Educational Note (15 min):**
- [ ] Add small note below toggle: "⚠️ Using typical values. Real timing from .ipo/.exp (future)" (15 min)

**Verify Stage 4a (COMPREHENSIVE):**
- [ ] **TypeScript:** `npm run typecheck` - no errors
- [ ] **Frontend Build:** `npm run build` - successful
- [ ] **Browser Visual Test:**
  - P-α diagram shows 4 valve timing lines ✓
  - Lines positioned correctly (IVO 350°, IVC 230°, EVO 490°, EVC 10°) ✓
  - Labels visible and clear (IVO, IVC, EVO, EVC) ✓
  - Toggle "Show Valve Timing" works ✓
  - Info tooltip explains typical values ✓
  - Lines don't clutter chart (opacity 0.7) ✓
  - Works with multi-RPM comparison ✓
  - Works with cycle phases (all features together) ✓
- [ ] **Educational Value Test:**
  - Show to student: Can they see valve overlap? ✓
  - Can they understand why IVO before TDC? ✓
- [ ] **Git Commit:** "feat(pv-diagrams): Stage 4a - valve timing lines (typical values)"

---

### Stage 5: Documentation & Cleanup (2-3 hours) 📝 ENGINEERING DISCIPLINE
**Goal:** Create ADR, update CHANGELOG, archive roadmap

**5.1 ADR-013 Creation (1-2 hours):**
- [ ] Create `docs/decisions/013-pv-diagrams-educational-enhancement.md` (1-2 hours):
  - **Context:** PV-Diagrams page was too technical (cylinder selection clutter)
  - **Decision:**
    - Remove cylinder selection (always Cyl 1)
    - Add multi-RPM comparison (key educational feature)
    - Add cycle phases visualization (P-α diagram)
    - Add valve timing lines (typical values MVP, real values deferred)
  - **Consequences:**
    - Pros: Educational tool, simple UI, powerful comparison
    - Cons: Lost per-cylinder analysis (acceptable - minimal value difference)
  - **Alternatives:** Keep cylinder selection (rejected - clutter), no comparison (rejected - missed opportunity)
  - **Files:** List all modified components
  - **Metrics:** Before/after component count, bundle size
  - **Deferred:** Phase 4b - parse .ipo/.exp for real valve timing

**5.2 CHANGELOG Update (30 min):**
- [ ] Update `CHANGELOG.md` - add v3.1.0 section (30 min):
  ```markdown
  ## [3.1.0] - 2025-01-XX

  ### Added - PV-Diagrams Educational Enhancement
  - Multi-RPM comparison (2-4 files on same chart)
  - Cycle phases visualization (4-stroke colored zones)
  - Valve timing lines (IVO/IVC/EVO/EVC markers)
  - Key point markers (Max Pressure indicator)

  ### Changed
  - Simplified UI: removed cylinder selection (always Cylinder 1)
  - Enhanced P-α diagram with educational overlays

  ### Educational
  - Transform PV-Diagrams into teaching tool for engine principles
  - Target audience: teachers and students
  ```

**5.3 Roadmap Archive (15 min):**
- [ ] Move `roadmap-pv-diagrams-educational.md` → `_archive/` (5 min)
- [ ] Add completion notes at top: completion date, final status (10 min)

**5.4 Documentation Links (15 min):**
- [ ] Update `README.md` - mention educational features (if applicable) (15 min)

**Verify Stage 5 (FINAL):**
- [ ] **ADR-013:** Complete, follows template, accurate
- [ ] **CHANGELOG:** Updated with v3.1.0 section
- [ ] **Roadmap:** Archived in `_archive/` with completion notes
- [ ] **Documentation:** All links work (`./scripts/check-doc-links.sh`)
- [ ] **Git Commit:** "docs(pv-diagrams): ADR-013 + CHANGELOG v3.1.0"

---

## 🔮 Future Enhancements (Deferred - Phase 4b)

### Phase 4b: Real Valve Timing from .ipo/.exp Files
**Status:** Technical Debt - deferred until parser implementation

**Requirements:**
- [ ] Parse `.ipo` files → intake valve timing (IVO/IVC angles)
- [ ] Parse `.exp` files → exhaust valve timing (EVO/EVC angles)
- [ ] Match valve timing to .pvd files (by RPM)
- [ ] Update UI: toggle "Use Real Timing" vs "Typical Values"
- [ ] Error handling: fallback to typical if .ipo/.exp missing

**Effort Estimate:** 8-12 hours (new parsers, API endpoints, data linking)

**Educational Value:** Show students REAL engine-specific timing (not generic)

---

## 📝 Current Session Notes

**2025-01-XX - Session 1:**
- [ ] Created roadmap
- [ ] Reviewed existing implementation (ADR-012)
- [ ] Planned 5 stages: Simplify + Comparison + Phases + Markers + Valve Timing + Docs

**Next:**
- Start Stage 1.1: Remove cylinder selection from Zustand

---

## ✅ Completion Criteria

Project complete when:
- [ ] All 42 tasks completed (5 stages)
- [ ] TypeScript typecheck passes
- [ ] Production build successful
- [ ] All browser tests passed
- [ ] Educational value verified (show to non-engineer)
- [ ] ADR-013 created
- [ ] CHANGELOG updated
- [ ] Roadmap archived
- [ ] All git commits done (4 stage commits + 1 docs commit)

---

## 📚 References

**Existing Documentation:**
- [ADR-012: PV-Diagrams Implementation](docs/decisions/012-pv-diagrams-implementation.md)
- [docs/file-formats/pvd-format.md](docs/file-formats/pvd-format.md)
- [roadmap-pv-diagrams.md](_archive/roadmap-pv-diagrams.md) (original implementation)

**Code References:**
- Current implementation: `frontend/src/components/pv-diagrams/`
- Chart helpers: `chartOptionsHelpers.ts` (558 lines)
- State management: `pvDiagramsSlice.ts`

**Test Data:**
- `test-data/V8/*.pvd` (8-cylinder, 13 files, 2000-8500 RPM) - perfect for RPM comparison!
- `test-data/MOTO 250 V1/*.pvd` (1-cylinder)

---

**Total Estimation:** 14-20 hours (MVP stages 1-4a + docs)
**Educational Impact:** HIGH - transforms technical tool into teaching instrument
