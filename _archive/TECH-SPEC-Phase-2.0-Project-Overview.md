# Technical Specification: Phase 2.0 - Project Overview Implementation

**Date:** 2025-11-08  
**Type:** 🛠️ Technical Specification (Approved by User)  
**Status:** ✅ Ready for Implementation  
**Target:** Claude Code (VS Code Implementation)  
**Estimated Time:** 5-7 working days  

---

## 📋 Executive Summary

**Objective:** Implement 3-level UI hierarchy with Project Overview as central hub for multiple analysis types.

**Key Decision:** All 6 architectural questions have been answered by the user (engineer with 15+ years experience in engine simulation).

**Philosophy (User's words):**
> "Математика 100 лет ей ничего не будет, а вот использование современных техник в приложении нам даст возможность по-новому посмотреть пользователю на расчёты. Мы даем старой программе новую жизнь, но при этом не переписываем математику."

**Core Principle:**
> "Главное миссия в что без проблем можно будет в будущем изменить. Наша главная задача сейчас запустить и сделать тестирование."

**Translation:** Flexibility over perfection. Launch → Test → Iterate.

---

## ✅ Approved Architectural Decisions

### Decision 1: Breaking Change (URL Structure) ✅ APPROVED

**User Choice:** Variant B - New structure with Project Overview

**Implementation:**
```
OLD (v2.0.0):
/project/:id → PerformancePage (direct to charts)

NEW (v3.0.0):
/project/:id → ProjectOverviewPage (hub with 6 cards)
/project/:id/performance → PerformancePage
/project/:id/traces → TracesPage (future)
/project/:id/configuration → ConfigurationHistoryPage (future)
```

**Breaking Change:** ✅ ACCEPTED
- This is major update v2.0.0 → v3.0.0
- Old bookmarks will break (acceptable - user has few personal bookmarks)
- Correct semantic hierarchy is more important

**Action:** No redirect needed. Clean breaking change.

---

### Decision 2: Workflow - Shortcut to Performance ✅ APPROVED

**User Choice:** Variant A - "Я почти всегда начинаю с Performance"

**Implementation:**

**HomePage ProjectCard UI:**
```
┌─────────────────────────────────┐
│  Vesta 1.6 IM                   │
│  4 Cyl • NA • ITB • 1.6L        │
│  3 calculations                 │
│                                 │
│  [Open Project]          [⋮]    │
│       ↓                   ↓     │
│   Performance          Overview │
└─────────────────────────────────┘
```

**Two ways to open project:**

1. **Primary Button:** "Open Project" → `/project/:id/performance` (direct to charts)
   - Most common workflow (90% cases)
   - Saves 1 click

2. **Secondary Button:** "⋮" (three dots) → `/project/:id` (Project Overview)
   - When user needs different analysis type
   - Or wants to see project summary

**Rationale:** User almost always starts with Performance charts. Shortcut optimizes for common case without removing access to Overview.

---

### Decision 3: Backend Changes ✅ APPROVED

**User Choice:** Variant A - "Backend изменения сразу (делаем правильно)"

**Implementation:**

**Create New Endpoint:**
```
GET /api/project/:id/summary

Response:
{
  "project": {
    "id": "vesta-16-im",
    "displayName": "Vesta 1.6 IM",
    "specs": {
      "cylinders": 4,
      "engineType": "NA",
      "intakeType": "ITB",
      "displacement": "1.6L"
    }
  },
  "availability": {
    "performance": {
      "available": true,
      "calculationsCount": 3,
      "lastRun": "2025-11-07T14:30:00Z"
    },
    "traces": {
      "available": true,
      "rpmPointsCount": 11,
      "traceTypes": ["pressure", "temperature", "mach", "wave", ...]
    },
    "pvDiagrams": {
      "available": false
    },
    "noise": {
      "available": false
    },
    "turbo": {
      "available": false
    },
    "configuration": {
      "available": true,
      "savedConfigsCount": 2,
      "lastSaved": "2025-11-07T14:30:00Z"
    }
  }
}
```

**Benefits:**
- Single API call instead of 6
- Faster page load
- Easy to cache (React Query)
- Proper separation of concerns

**Backend Work Required:**
1. Create `/api/project/:id/summary` endpoint
2. Check existence of .det/.pou files (performance)
3. Check existence of trace files (traces)
4. Check marker-tracking.json (configuration history)
5. Return availability status for all 6 types

**Estimated Time:** 1-2 hours

---

### Decision 4: Deep Linking ✅ APPROVED - HIGH PRIORITY

**User Choice:** Variant A - "Да, добавьте Deep Linking - однозначно добавить"

**User's Rationale:**
> "В этом и смысл создания нового визуализатора для старой программы. Мы даем старой программе новую жизнь, но при этом не переписываем математику, потому что математика 100 лет ей ничего не будет, а вот использование современных техник в приложении нам даст возможность по-новому посмотреть пользователю на расчёты."

**Implementation:**

**URL Structure with Query Params:**
```
/project/:id/performance?preset=1&primary=$baseline&compare=$v2,$v5&units=si&decimals=1
```

**URL Params:**
- `preset` - Chart preset number (1-6)
- `primary` - Primary calculation ID
- `compare` - Comma-separated comparison calculation IDs
- `units` - Unit system (si/imperial)
- `decimals` - Decimal places (0-3)

**Bidirectional Sync:**
```typescript
// URL → Zustand Store (on page load)
const searchParams = useSearchParams();
const presetFromUrl = searchParams.get('preset');
if (presetFromUrl) {
  setSelectedPreset(Number(presetFromUrl));
}

// Zustand Store → URL (on state change)
const updateUrl = () => {
  setSearchParams({
    preset: selectedPreset.toString(),
    primary: primaryCalculation.id,
    compare: comparisonCalculations.map(c => c.id).join(','),
  });
};
```

**Use Cases:**
1. **Bookmarks:** User saves specific analysis state
2. **Sharing:** User sends link to colleague/client with exact graph
3. **Browser History:** Back/Forward buttons work correctly (preserve state)
4. **Reports:** Include links in PDF reports pointing to interactive versions

**Implementation Details:**
- Use React Router v6 `useSearchParams()` hook
- Sync on every state change (debounced 300ms)
- Parse URL params on component mount
- Handle invalid params gracefully (fallback to defaults)

**Estimated Time:** 1-2 hours

---

### Decision 5: Breadcrumbs ✅ APPROVED

**User Choice:** Variant B - "Breadcrumbs на Level 3 (как программист рекомендует)"

**Implementation:**

**Where to show breadcrumbs:**

1. **HomePage** - NO breadcrumbs (top level)

2. **ProjectOverviewPage** - NO breadcrumbs
   - Use simple back button: `[← Back to Projects]`

3. **Analysis Pages (Level 3)** - YES breadcrumbs
   ```
   ┌──────────────────────────────────────────────────┐
   │ Engine Viewer > Vesta 1.6 IM > Performance       │
   │                                                  │
   │ [PNG] [SVG] [Help] [⚙️]                          │
   └──────────────────────────────────────────────────┘
   ```

**Clickable Links:**
- "Engine Viewer" → `/` (HomePage)
- "Vesta 1.6 IM" → `/project/:id` (Project Overview)
- "Performance" → Not clickable (current page)

**Component Structure:**
```typescript
interface BreadcrumbItem {
  label: string;
  href?: string; // undefined = current page (not clickable)
}

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Engine Viewer', href: '/' },
  { label: projectDisplayName, href: `/project/${projectId}` },
  { label: 'Performance & Efficiency' }, // current page
];
```

**Styling:**
- Use existing project colors
- Separator: ">" (simple, clear)
- Hover state for clickable items
- Current page: text-muted-foreground (not bold)

**Estimated Time:** 1 hour

---

### Decision 6: Icons for Analysis Type Cards ✅ APPROVED

**User Choice:** Variant A - "Оставляю выбор на программиста"

**User's Note:**
> "Я уверен что твой коллега программист на 90% сделает все очень красиво, ну главное миссия в что без проблем можно будет в будущем изменить."

**Implementation:**

**Icon Library:** Lucide React (already in project)

**Recommended Icons:**
1. 📊 **Performance & Efficiency** - `<TrendingUp />` or `<BarChart3 />`
2. 🌡️ **Thermo & Gasdynamic Traces** - `<Activity />` or `<Waveform />`
3. 📈 **PV-Diagrams** - `<LineChart />` or `<GitBranch />`
4. 🔊 **Noise Spectrum** - `<Volume2 />` or `<Radio />`
5. 🔄 **Turbocharger Map** - `<Fan />` or `<Wind />`
6. 📋 **Configuration History** - `<History />` or `<GitCommit />`

**Guidelines:**
- Choose icons that best represent the analysis type
- Maintain visual consistency (same size, stroke width)
- Test with both light and dark themes
- Easy to change later (just swap component)

**Estimated Time:** 30 minutes

---

## 🏗️ Implementation Plan

### Phase 2.0 Breakdown (5-7 working days)

#### Day 1-2: Backend + Routing Foundation

**Task 1.1: Create Project Summary API Endpoint**
- File: `backend/src/routes/projects.ts`
- Endpoint: `GET /api/project/:id/summary`
- Logic:
  1. Check .det/.pou files (performance availability)
  2. Check trace files if exist (traces availability)
  3. Check marker-tracking.json (configuration history)
  4. Return availability status for all 6 types
- Estimated: 2 hours

**Task 1.2: Create ProjectOverviewPage Component**
- File: `frontend/src/pages/ProjectOverviewPage.tsx`
- Route: `/project/:id`
- Layout: Header + Quick Stats (optional) + Analysis Type Cards Grid
- Fetch data: Use new `/api/project/:id/summary` endpoint
- Estimated: 3 hours

**Task 1.3: Create AnalysisTypeCard Component**
- File: `frontend/src/components/project-overview/AnalysisTypeCard.tsx`
- Props: `{ icon, title, description, status, available, href }`
- States:
  - Available: Full color, hover effects, clickable
  - Disabled: opacity-50, cursor-not-allowed, "Coming in Phase 2"
- Use shadcn/ui Card component
- Estimated: 2 hours

**Task 1.4: Update Routing**
- File: `frontend/src/App.tsx`
- Add route: `/project/:id` → ProjectOverviewPage
- Move route: `/project/:id/performance` → PerformancePage (was `/project/:id`)
- Update all navigation links
- Estimated: 2 hours

**Task 1.5: Update HomePage ProjectCard**
- File: `frontend/src/components/home/ProjectCard.tsx`
- Add two buttons:
  - "Open Project" → `/project/:id/performance` (direct)
  - "⋮" (options menu) → `/project/:id` (overview)
- Estimated: 1 hour

**Day 1-2 Deliverable:** ✅ Project Overview works, navigation correct, API returns data

---

#### Day 3: Refactoring & Reusable Components

**Task 3.1: Rename Components for Clarity**
- `pages/ProjectPage.tsx` → `pages/PerformancePage.tsx`
- `components/visualization/` → `components/performance/`
- Update all imports
- Estimated: 1 hour

**Task 3.2: Create Generic AnalysisPageLayout Component**
- File: `frontend/src/components/layout/AnalysisPageLayout.tsx`
- Props:
  ```typescript
  interface AnalysisPageLayoutProps {
    projectId: string;
    title: string;
    breadcrumbs: BreadcrumbItem[];
    leftPanelSections: ReactNode;
    chartArea: ReactNode;
    headerActions?: ReactNode;
  }
  ```
- Reusable layout for Performance, Traces, Configuration History
- Responsive: desktop (side-by-side), tablet (collapsible), mobile (overlay)
- Estimated: 3 hours

**Task 3.3: Refactor PerformancePage to Use AnalysisPageLayout**
- File: `frontend/src/pages/PerformancePage.tsx`
- Extract sections: PresetSelector, CompareWith, etc.
- Use new AnalysisPageLayout wrapper
- Test: Ensure everything works as before
- Estimated: 2 hours

**Task 3.4: Create Breadcrumbs Component**
- File: `frontend/src/components/navigation/Breadcrumbs.tsx`
- Show only on Level 3 (Analysis Pages)
- Clickable links with separators
- Estimated: 1 hour

**Day 3 Deliverable:** ✅ Code refactored, layout reusable, breadcrumbs work

---

#### Day 4: State Management & Deep Linking

**Task 4.1: Refactor Zustand Store (Slice Pattern)**
- File: `frontend/src/store/appStore.ts`
- Split into slices:
  ```typescript
  interface AppState {
    settings: SettingsSlice;      // global: units, decimals, theme
    performance: PerformanceSlice; // preset, calculations, compare
    // future: traces, configuration
  }
  ```
- Migrate existing state to new structure
- Estimated: 3 hours

**Task 4.2: Implement Deep Linking**
- Files: `frontend/src/hooks/useDeepLinking.ts`, `PerformancePage.tsx`
- Read query params on mount → update Zustand store
- Write to query params on state change (debounced 300ms)
- Handle invalid params gracefully
- Estimated: 3 hours

**Task 4.3: Test Browser History**
- Navigate: Performance → change preset → change calculations
- Press Back → verify state restored correctly
- Press Forward → verify state restored
- Estimated: 1 hour

**Day 4 Deliverable:** ✅ State management clean, deep linking works, browser history correct

---

#### Day 5: Polish & Accessibility

**Task 5.1: Add Animations**
- Page transitions: fade (200-300ms)
- Card hover effects: scale + shadow
- Smooth transitions on all interactive elements
- Estimated: 2 hours

**Task 5.2: Keyboard Navigation**
- Tab through Analysis Type Cards
- Enter/Space to open card
- Esc to go back
- aria-labels for accessibility
- Estimated: 1 hour

**Task 5.3: Choose and Add Icons**
- Select icons from Lucide React
- Add to each AnalysisTypeCard
- Test visual hierarchy
- Estimated: 1 hour

**Task 5.4: Responsive Testing**
- Desktop (>1024px): 3 columns, full layout
- Tablet (768-1024px): 2 columns, collapsible panel
- Mobile (<768px): 1 column, overlay panel
- Test all breakpoints
- Estimated: 2 hours

**Day 5 Deliverable:** ✅ UI polished, accessible, responsive, animations smooth

---

#### Day 6-7: Testing & Documentation

**Task 6.1: End-to-End Testing**
- Navigation flow: HomePage → Overview → Performance → Back → Overview → Traces (disabled)
- State persistence: Deep linking, browser history
- Comparison mode: Cross-project works
- Export: PNG/SVG with correct filenames
- Estimated: 4 hours

**Task 6.2: Update Documentation**
- `docs/architecture.md`: New routing structure, component hierarchy
- `CHANGELOG.md`: Version bump v2.0.0 → v3.0.0, breaking changes, new features
- Create ADR (if needed): Document rationale for decisions
- Estimated: 3 hours

**Task 6.3: User Acceptance Testing**
- User tests Project Overview
- User tests shortcut workflow
- User tests deep linking (bookmark, share link)
- Collect feedback
- Estimated: 2 hours

**Day 6-7 Deliverable:** ✅ Tested, documented, ready for production

---

## ✅ Final Checklist

### Functionality
- [ ] Project Overview page loads with 6 Analysis Type Cards
- [ ] Performance card clickable → Performance Page
- [ ] Traces, PV-Diagrams, Noise, Turbo cards disabled (visual feedback)
- [ ] Configuration History card clickable → Configuration History Page (empty for now)
- [ ] HomePage "Open Project" → Performance (shortcut)
- [ ] HomePage "⋮" button → Project Overview
- [ ] Breadcrumbs on Level 3 (Performance, Traces, Configuration)
- [ ] Deep linking works: URL contains state (preset, calculations)
- [ ] Browser Back/Forward preserves state
- [ ] Bookmark opens exact graph state

### Code Quality
- [ ] Zustand store refactored (slice pattern)
- [ ] AnalysisPageLayout component reusable
- [ ] No code duplication
- [ ] TypeScript types correct
- [ ] ESLint/Prettier passing

### UI/UX
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Keyboard navigation works
- [ ] Animations smooth (fade transitions)
- [ ] Icons consistent and clear
- [ ] Hover states on available cards
- [ ] Disabled cards visually distinct

### Backend
- [ ] `/api/project/:id/summary` endpoint works
- [ ] Returns correct availability for all 6 types
- [ ] Performance acceptable (<500ms response)

### Documentation
- [ ] CHANGELOG.md updated (v3.0.0)
- [ ] Architecture docs updated
- [ ] Breaking changes documented
- [ ] Migration guide (if needed)

---

## 🚨 Critical Reminders

### 1. Flexibility First
User's philosophy: "без проблем можно будет в будущем изменить"

**Implementation:**
- Icons: Easy to swap (just change component)
- Colors: Use existing palette (already in project)
- Layout: Generic components (reusable for Traces, Config History)
- No hardcoded values

### 2. Existing Design System
**DO NOT create new colors!** Use existing:
- `CALCULATION_COLORS` from `frontend/src/types/v2.ts`
- Tailwind theme from `frontend/src/index.css`
- shadcn/ui components

### 3. Launch → Test → Iterate
User's goal: "запустить и сделать тестирование"

**Priorities:**
1. Working functionality (not perfect UI)
2. Easy to change later
3. Get user feedback early

### 4. Breaking Change is OK
This is v3.0.0 major update. User accepted breaking change.

**Action:**
- Update version in `package.json`: `3.0.0`
- Document breaking changes in CHANGELOG
- No redirect needed (clean break)

---

## 📞 Questions During Implementation?

**If you encounter:**
- Technical blockers
- Unclear requirements
- Better alternative approaches

**Action:** Ask before implementing! Better to clarify than to redo.

**Remember:** This is a recommendation, not rigid spec. If you see problems or improvements → suggest!

---

## 🎯 Success Criteria

**Phase 2.0 is complete when:**

1. ✅ User can navigate: HomePage → Overview → Performance
2. ✅ User can shortcut: HomePage → Performance (direct)
3. ✅ User can bookmark specific graph (deep linking)
4. ✅ User can share link with colleague (exact state)
5. ✅ Browser Back/Forward works correctly
6. ✅ UI follows Apple principles (clean, minimal)
7. ✅ Code is flexible (easy to add Traces, Config History)

---

**Ready to start implementation!** 🚀

**Estimated Total Time:** 5-7 working days  
**Target Completion:** Mid-November 2025  
**Next Phase:** Phase 2.1 - Configuration History (killer feature)

---

**Created:** 2025-11-08  
**Approved by:** User (Engine Calculation Engineer)  
**Implementer:** Claude Code (VS Code)  
**Status:** ✅ Ready for Development
