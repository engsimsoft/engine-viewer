# Routing Architecture - Engine Viewer v2.0

**Last Updated:** October 31, 2025
**Status:** Phase 1 Complete

---

## 📋 Overview

Engine Viewer v2.0 uses React Router with a simple 2-route structure designed to support cross-project calculation comparison.

---

## 🛣️ Routes

### 1. Home Page - `/`

**Component:** `HomePage.tsx`

**Purpose:** Project list and management

**Features:**
- Display all available .det file projects
- Project cards with metadata (engine type, cylinders, calculations count)
- Search and filter projects
- Click project → navigate to `/project/:id`

---

### 2. Visualization Page - `/project/:id`

**Component:** `ProjectPage.tsx`

**Purpose:** Multi-project calculation visualization

**URL Parameters:**
- `:id` - Project ID (e.g., `vesta-16-im`, `bmw-m42`)

**Initial Context:**
- The `projectId` from URL serves as **initial context** for the page
- In Phase 2, this project will be used to populate the Primary Selection Modal
- User enters via a specific project, but can compare with calculations from ANY project

**Features (Phase 2+):**
- Primary calculation selection (initially from URL project)
- Comparison calculations (from any project - cross-project)
- Chart presets (1-4)
- Peak values cards
- Live cursor tracking
- Settings (units conversion, theme)
- Data table with export

---

## 🔄 Navigation Flow

```
HomePage (/)
  ↓
  User clicks on "Vesta 1.6 IM" project
  ↓
Navigate to /project/vesta-16-im
  ↓
ProjectPage loads
  ↓
  projectId = "vesta-16-im" (from URL)
  ↓
  [Phase 2] Show Primary Selection Modal
    - Default: calculations from "vesta-16-im" project
  ↓
  User selects primary calculation from Vesta
  ↓
  User clicks "+ Add Comparison"
    ↓
    [Phase 3] 2-Step Comparison Modal
      - Step 1: Select project (ANY project, including BMW, Vesta, etc.)
      - Step 2: Select calculation from that project
  ↓
  Cross-project comparison displayed on charts
```

---

## 🎯 Design Decisions

### Decision 1: Keep `/project/:id` Route

**Rationale:**
- Provides clear entry point from project list
- URL reflects which project user started from
- Shareable URLs (e.g., `/project/vesta-16-im`)
- Good UX - user knows context

**Alternative Considered:** `/visualization` (no projectId)
- Rejected: Less context, harder to share specific projects

---

### Decision 2: Use projectId as Initial Context (Not Restriction)

**Key Point:** projectId in URL ≠ "you can only view this project"

**What it means:**
- Initial project: Used to populate Primary Selection Modal
- User freedom: Can compare with ANY project
- Cross-project: Full support for calculations from different projects

**Example:**
```
URL: /project/vesta-16-im

Primary: Vesta 1.6 IM → $1 (red)
Comparison 1: BMW M42 → $5 (cyan)
Comparison 2: Vesta 1.6 IM → $2 (blue)
Comparison 3: Another Project → $3 (yellow)

✅ All working together on same charts
```

---

## 🔮 Future Considerations

### Optional: Add Visualization-Only Route

If needed in the future, could add:

**Route:** `/visualization`
**Purpose:** Direct visualization without initial project context
**Use Case:** Bookmarked visualizations, deep links with query params

**Example:**
```
/visualization?primary=vesta-16-im:$1&compare=bmw-m42:$5
```

**Status:** Not implemented in v2.0 (YAGNI - You Aren't Gonna Need It)

---

## 📝 Implementation Notes

### Phase 1 (Current)

**Status:** ✅ Complete

**Files:**
- `frontend/src/App.tsx` - Route definitions
- `frontend/src/pages/HomePage.tsx` - Project list
- `frontend/src/pages/ProjectPage.tsx` - Visualization page

**Current Behavior:**
- ProjectPage uses `useParams()` to get `id`
- Loads single project data via `useProjectData(id)`
- Old architecture: single-project only

---

### Phase 2 (Next)

**Changes Needed:**
- Update ProjectPage to use Zustand store
- Remove old `useSelectedCalculations` hook
- Use `useMultiProjectData` for cross-project loading
- projectId from URL → populate Primary Selection Modal with this project's calculations
- User can still select primary from ANY calculation (not restricted to URL project)

**New Hook Usage:**
```typescript
const { id: urlProjectId } = useParams();
const { primaryCalculation, comparisonCalculations } = useAppStore();

// Combine primary + comparisons
const allCalculations = [
  ...(primaryCalculation ? [primaryCalculation] : []),
  ...comparisonCalculations
];

// Load data from multiple projects
const { calculations, isLoading, error } = useMultiProjectData(allCalculations);
```

---

## ✅ Acceptance Criteria

**Phase 1:**
- [X] Routing structure defined and documented
- [X] `/project/:id` route exists and works
- [X] projectId from URL accessible via useParams
- [X] No changes needed to App.tsx for v2.0 architecture

**Phase 2:**
- [ ] ProjectPage updated to use Zustand store
- [ ] projectId used as initial context for Primary Selection
- [ ] Cross-project comparison working
- [ ] Can navigate to /project/any-id and compare with any other project

---

## 🔗 Related Documentation

- [Architecture Overview](./architecture.md)
- [Multi-Project Data Fetching](../frontend/src/hooks/useMultiProjectData.ts)
- [Global State Management](../frontend/src/stores/appStore.ts)
- [Phase 2 Roadmap](../roadmap-v2.md#phase-2-core-ui-components)

---

**Conclusion:** Current routing architecture is ready for v2.0. No changes needed in Phase 1. ✅
