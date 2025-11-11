# UI Architecture Proposal v3 - Project Overview Concept

**Date:** 2025-11-08  
**Type:** 🎨 Architecture Recommendation (Claude Chat → Claude Code)  
**Status:** 💡 Proposed Concept  
**Context:** Scaling UI for multiple analysis types + Configuration History  

---

## 📝 Note to Claude Code

Привет, коллега! Это **архитектурная рекомендация**, а не строгое ТЗ. 

**Что это:**
- 💡 Концепция UI архитектуры (WHY + WHAT)
- 🎯 Предложение от архитектора
- 🤔 Открыто для твоих технических решений

**Что это НЕ:**
- ❌ Не строгое ТЗ (ты можешь найти лучшие решения)
- ❌ Не детальная имплементация (HOW - на тебе)
- ❌ Не финальное решение (если видишь проблемы - скажи!)

**Твоя роль:**
- Оцени концепцию с точки зрения реализации
- Найди технические проблемы, которые я мог не учесть
- Предложи улучшения
- Реализуй лучшим способом

---

## 🎯 Problem Statement

**Current State (v2.0.0):**
- ✅ HomePage with project cards
- ✅ ProjectPage with Performance & Efficiency visualization
- ✅ Single analysis type (`.det/.pou` files only)

**Future Requirements:**
- 📊 Multiple analysis types (Performance, Traces, PV-Diagrams, Noise, Turbo)
- 📋 Configuration History (killer feature)
- 🎯 Apple-style UI ("iPhone quality" - clean, minimal, intuitive)
- 💻 Desktop-first (primary use case)

**Challenge:**
Current 2-level structure (HomePage → ProjectPage) doesn't scale well for multiple analysis types.

---

## 💡 Proposed Solution

**3-Level Hierarchy with Project Overview as Hub:**

```
Level 1: HomePage (Projects List)
   ↓
Level 2: Project Overview (NEW - Intermediate Screen) ← HUB
   ↓
Level 3: Analysis Type Pages (Performance, Traces, PV-Diagrams, Config History)
```

**Key Principle:** Project Overview = Central hub for all project-related activities

---

## Architecture Overview

### Level 1: HomePage (Existing - No Changes)

**URL:** `/`

**Purpose:** Browse and select projects

**Elements:**
- Project cards grid (2-4 columns)
- Filters (engine type, cylinders, tags, status)
- Search
- Metadata display (calculations count, client, dates)

**Action:** "Open Project" → Navigate to **Project Overview**

---

### Level 2: Project Overview (NEW - Hub)

**URL:** `/project/:id`

**Purpose:** Central dashboard for project with analysis type selection

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ [← Back to Projects]          Vesta 1.6 IM                      │
│ 4 Cyl • NA • ITB • 1.6L                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ QUICK STATS (Optional Mini Cards - Horizontal Row)             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │ 3 Batch  │ │ 5 Single │ │ Last run │ │ 2 Saved  │           │
│ │ Runs     │ │ Runs     │ │ Nov 7    │ │ Configs  │           │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ANALYSIS TYPES (Grid of Cards - 2-3 columns)                   │
│                                                                 │
│ ┌─────────────────────────┐  ┌─────────────────────────┐       │
│ │ 📊 Performance &        │  │ 🌡️ Thermo & Gasdynamic │       │
│ │    Efficiency           │  │    Traces               │       │
│ │                         │  │                         │       │
│ │ Power, Torque, MEP,     │  │ 9 trace types available │       │
│ │ BSFC, Efficiency        │  │ Pressure, Temp, Mach... │       │
│ │                         │  │                         │       │
│ │ 3 calculations ready    │  │ 11 RPM points           │       │
│ │                         │  │                         │       │
│ │ [View Analysis →]       │  │ [View Traces →]         │       │
│ └─────────────────────────┘  └─────────────────────────┘       │
│                                                                 │
│ ┌─────────────────────────┐  ┌─────────────────────────┐       │
│ │ 📈 PV-Diagrams          │  │ 🔊 Noise Spectrum       │       │
│ │                         │  │                         │       │
│ │ Pressure-Volume         │  │ FFT Analysis            │       │
│ │ analysis                │  │                         │       │
│ │                         │  │                         │       │
│ │ Not available           │  │ Not available           │       │
│ │ [Coming in Phase 2]     │  │ [Coming in Phase 2]     │       │
│ └─────────────────────────┘  └─────────────────────────┘       │
│                                                                 │
│ ┌─────────────────────────┐  ┌─────────────────────────┐       │
│ │ 🔄 Turbocharger Map     │  │ 📋 Configuration        │       │
│ │                         │  │    History              │       │
│ │ Compressor efficiency   │  │                         │       │
│ │                         │  │ Track config changes    │       │
│ │                         │  │ 2 saved configs         │       │
│ │ Not available           │  │                         │       │
│ │ [Coming in Phase 2]     │  │ [View Timeline →]       │       │
│ └─────────────────────────┘  └─────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Card Structure

**Each Analysis Type Card contains:**
- 🎨 **Icon** - visual identifier
- 📝 **Title** - analysis type name
- 📄 **Description** - brief 1-2 line explanation
- 📊 **Status/Stats** - availability + quick stats
- 🔘 **Action Button** - "View Analysis →"

**Card States:**
1. **Available** - data exists, ready to view
   - Status: "3 calculations ready" / "11 RPM points"
   - Button: "View Analysis →" (blue, enabled)
   
2. **Not Available** - no data yet
   - Status: "Not available"
   - Button: "Coming in Phase 2" (gray, disabled)

3. **Configuration History** - special case
   - Status: "2 saved configs" / "No configs saved"
   - Button: "View Timeline →" (always enabled)

---

### Level 3: Analysis Type Pages (Existing + New)

**URLs:**
- `/project/:id/performance` - Performance & Efficiency
- `/project/:id/traces` - Thermo & Gasdynamic Traces
- `/project/:id/pv-diagrams` - PV-Diagrams
- `/project/:id/noise` - Noise Spectrum
- `/project/:id/turbo` - Turbocharger Map
- `/project/:id/configuration` - Configuration History

#### 3A: Performance Page (Existing)

**Current Implementation:** ✅ Complete (v2.0.0)

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back to Vesta 1.6 IM]  Performance & Efficiency             │
│ [PNG] [SVG] [Help] [⚙️]                                          │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────┐
│ Left Panel   │ Chart Area                                       │
│              │                                                  │
│ Primary      │ [Power & Torque Chart]                           │
│ Calculation  │                                                  │
│              │                                                  │
│ Chart        │                                                  │
│ Presets      │                                                  │
│              │                                                  │
│ Compare      │                                                  │
│ With (0/4)   │                                                  │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

**Changes:**
- Header: "← Back" returns to **Project Overview** (not HomePage)
- LeftPanel: Remains specific to Performance type

---

#### 3B: Traces Page (Future - Phase 2)

**URL:** `/project/:id/traces`

**Purpose:** View thermo & gasdynamic traces (pressure, temperature, etc.)

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back to Vesta 1.6 IM]  Thermo & Gasdynamic Traces           │
│ [PNG] [SVG] [Help] [⚙️]                                          │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────┐
│ Left Panel   │ Chart Area                                       │
│              │                                                  │
│ Trace Type   │ [Pressure Trace vs Crank Angle]                  │
│ Selector     │                                                  │
│ • Pressure   │ X-axis: 0-720° Crank Angle                       │
│ • Temp       │ Y-axis: Cylinder Pressure (bar)                  │
│ • Mach       │                                                  │
│ • Wave       │                                                  │
│ • etc.       │                                                  │
│              │                                                  │
│ RPM          │                                                  │
│ Selector     │                                                  │
│ • 3000       │                                                  │
│ • 3500       │                                                  │
│ • 4000       │                                                  │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

**LeftPanel Specific Elements:**
- Trace Type selector (Pressure, Temperature, Mach, etc.)
- RPM point selector (single or multiple overlay)
- Cylinder selector (for multi-cylinder traces)

---

#### 3C: Configuration History Page (NEW - Killer Feature)

**URL:** `/project/:id/configuration`

**Purpose:** View timeline of configuration changes, compare configs

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back to Vesta 1.6 IM]  Configuration History                 │
│ [Export Timeline] [Compare Configs]                             │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ Timeline (Vertical, Chronological - Newest First)              │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ ✅ $v5_final               Nov 7, 2025 14:30             │   │
│ │ Configuration saved                                       │   │
│ │                                                           │   │
│ │ Key Changes:                                              │   │
│ │ • Bore: 82.5mm  • Stroke: 92.0mm                         │   │
│ │ • Compression: 10.8:1  • IVO: 10° BTDC                   │   │
│ │                                                           │   │
│ │ [View Full Config] [Compare with $v2] [Restore]          │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ ✅ $v2                     Nov 7, 2025 11:00             │   │
│ │ Configuration saved                                       │   │
│ │                                                           │   │
│ │ Key Changes:                                              │   │
│ │ • Bore: 82.0mm  • Stroke: 90.0mm                         │   │
│ │ • Compression: 10.5:1  • IVO: 10° BTDC                   │   │
│ │                                                           │   │
│ │ [View Full Config] [Compare with $v5_final]              │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ ⚠️ $baseline               Nov 7, 2025 10:00             │   │
│ │ Configuration not saved                                   │   │
│ │                                                           │   │
│ │ Engine Viewer opened after calculation                    │   │
│ │                                                           │   │
│ │ [💾 Save Current .prt as $baseline]                      │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Timeline view** - vertical, chronological
- **Card per config** - each saved configuration
- **Key parameters preview** - bore, stroke, compression, valve timing
- **Status indicators** - ✅ saved / ⚠️ not saved
- **Actions** - View Full / Compare / Restore / Save

**Modals:**
1. **View Full Config Modal** - complete .prt parsed display
2. **Compare Configs Modal** - side-by-side diff with highlights

---

## Navigation Flow

### User Journey Example

```
1. HomePage
   ↓ Click "Open Project"
   
2. Project Overview (Vesta 1.6 IM)
   ↓ Click "View Analysis →" on Performance card
   
3. Performance Page
   - Work with charts
   - Analyze data
   ↓ Click "← Back to Vesta 1.6 IM"
   
4. Project Overview
   ↓ Click "View Timeline →" on Configuration History card
   
5. Configuration History Page
   - View timeline
   - Compare configs
   ↓ Click "← Back to Vesta 1.6 IM"
   
6. Project Overview
   ↓ Click "View Traces →" on Traces card
   
7. Traces Page
   - View pressure traces
   - Analyze gasdynamics
```

**Key Insight:** All navigation paths go through **Project Overview** - it's the hub.

---

## 🎨 Design Principles & Existing System

### Use Existing Color Palette ✅

**ВАЖНО:** Не создавай новую палитру! Используй существующую из проекта:

**Source:** `frontend/src/types/v2.ts` - `CALCULATION_COLORS`
- Red: `#e74c3c` (primary)
- Blue: `#3498db`
- Green: `#2ecc71`
- Orange: `#f39c12`
- Purple: `#9b59b6`

**Rationale (ADR 003):**
- ✅ Engineering-appropriate (not playful)
- ✅ Maximum contrast between colors
- ✅ WCAG 2.1 AA compliant
- ✅ Works in grayscale

**Tailwind Theme:** Already configured in `frontend/src/index.css`
- Primary, Secondary, Muted, Accent - уже есть!
- Не нужно переопределять

### Apple-Style Principles (Apply These)

**Key Concepts:**
1. **Hierarchy & Clear Path** - пользователь всегда знает где находится
2. **Минимализм** - только необходимое
3. **Breathing Space** - много whitespace
4. **Progressive Disclosure** - информация появляется когда нужна
5. **Desktop-First** - оптимизация для больших экранов

**Practical Application:**
- Card-based layout (shadcn/ui cards работают отлично)
- Generous spacing (Tailwind spacing scale: p-6, gap-4, etc.)
- Clear typography hierarchy (text-2xl, text-base, text-sm)
- Smooth transitions (transition-all duration-200)
- Subtle shadows (shadow-sm, shadow-md)

**Don't:**
- ❌ Переизобретать дизайн-систему
- ❌ Создавать custom CSS когда есть Tailwind
- ❌ Менять существующие цвета
- ❌ Перегружать деталями

**Do:**
- ✅ Используй shadcn/ui components (Card, Button, etc.)
- ✅ Следуй Tailwind conventions
- ✅ Сохраняй consistency с v2.0.0
- ✅ Focus на UX (удобство > красивость)

---

## 🤔 Why This Architecture? (Open for Discussion)

### Problems with Current 2-Level

- Direct jump from project list to charts feels abrupt
- No scalability for multiple analysis types
- No clear place for Configuration History
- Navigation between types unclear

### Benefits of 3-Level with Hub (Proposed)

**Hypothesis:**
- ✅ Clear hierarchy (Projects → Project → Analysis Type)
- ✅ Scalable (just add cards)
- ✅ Not overwhelming (progressive disclosure)
- ✅ Central hub (always know where to go)
- ✅ Configuration History naturally fits

**But maybe:**
- ❓ Is intermediate screen necessary? (user feedback needed)
- ❓ Could tabs work better? (less navigation)
- ❓ Should Configuration History be in header? (always accessible)

**Your thoughts:** Если видишь проблемы или лучшие варианты - предлагай!

### Why Card-Based Design?

**Apple Pattern:** Familiar from iOS, macOS
- Cards = visual separation
- Each card = one concept
- Easy to scan
- Breathing space

**Alternatives to consider:**
- List view (more compact, less visual)
- Grid of icons (minimalist, but less info)
- Tabs (quicker access, but limited to ~5-6 types)

**Question:** Что лучше для desktop workflow инженеров?

---

## 🚀 Suggested Implementation Approach

### Phase 2.0 - Foundation (Proposed)

**Goal:** Project Overview page + basic routing

**Key Tasks:**
1. Create `/project/:id` route (Project Overview)
2. Update HomePage: "Open Project" → navigate to Overview
3. Create ProjectOverview component with card grid
4. Add analysis type cards (Performance active, others disabled)
5. Update Performance page: "Back" → Overview
6. Add Configuration History card

**Questions for You:**
- 🤔 Should we reuse existing components (ProjectCard) or create new ones?
- 🤔 Grid layout: Tailwind grid or shadcn/ui Grid component?
- 🤔 Card hover effects: subtle or pronounced?
- 🤔 Should "Coming in Phase 2" cards be clickable (for info) or disabled?

**Your call:** Если видишь лучший порядок задач - делай как считаешь нужным.

---

### Phase 2.1 - Configuration History (After Phase 2.0)

**Goal:** Killer feature - automatic .prt versioning

**Dependencies:**
- .prt parser (prerequisite)
- File watcher integration
- marker-tracking.json system

**See:** [ADR 008: Configuration History](008-configuration-history.md) for details

**Note:** Это большая фича, может потребовать separate planning.

---

### Phase 2.2+ - Traces & Other Types (Future)

**Deferred** until Phase 2.0 and 2.1 are complete and validated.

---

## Success Metrics

**User Experience:**
- ⏱️ Time to find specific analysis type: < 5 seconds
- 🎯 Users can navigate without help/docs
- 📱 Responsive: works on desktop, tablet, mobile

**Performance:**
- ⚡ Project Overview loads in < 500ms
- 🖼️ Card grid renders smoothly (60fps)
- 🔄 Navigation transitions smooth

**Business:**
- 📊 Configuration History saves 30+ min per project
- 🚀 Engineers use multiple analysis types regularly
- ⭐ "This is better than Post4T" feedback

---

## Related Documentation

- [ADR 008: Configuration History](008-configuration-history.md) - Killer feature details
- [DEVELOPMENT-PLAN.md](../../DEVELOPMENT-PLAN.md) - Q5 Trace Files, roadmap
- [Engine Viewer Architecture](../architecture.md) - Current v2.0.0 implementation
- [Post4T Overview](../engmod4t-suite/post4t-overview.md) - Old UI reference
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) - Design inspiration

---

## ❓ Questions for Claude Code (Your Expertise Needed)

### Q1: Card Grid - Layout Details

**Options:**
- A: Tailwind `grid grid-cols-2 gap-6`
- B: shadcn/ui Grid component
- C: Flexbox with wrapping

**What works best for:**
- Responsive behavior
- Adding/removing cards dynamically
- Maintaining consistency with existing UI

**Your recommendation?**

---

### Q2: Quick Stats Mini Cards

**Concept:** 4 mini cards showing project stats (see Level 2 layout)

**Questions:**
- Should we include them? (adds value or just clutter?)
- If yes, what stats are most useful?
  - Batch runs count
  - Single runs count
  - Last run date
  - Saved configs count

**Your call** - если кажется unnecessary, можно skip.

---

### Q3: Card Hover States

**Options:**
- A: Subtle (shadow increase only)
- B: Pronounced (shadow + translateY)
- C: None (cards are clickable via button only)

**Consideration:** Desktop users with mouse - hover feedback important?

**Your preference?**

---

### Q4: "Coming Soon" Cards Interaction

**Disabled cards (PV-Diagrams, Noise, etc.):**

**Options:**
- A: Completely disabled (grayed out, no interaction)
- B: Clickable → show toast "Coming in Phase 2"
- C: Clickable → show modal with roadmap/ETA

**Which provides better UX?**

---

### Q5: Configuration History Card Placement

**Currently proposed:** Same level as analysis type cards

**Alternatives:**
- A: Header button (always accessible)
- B: Sidebar item (if we add sidebar)
- C: Separate section (below analysis types)

**What feels more natural?**

---

### Q6: Navigation Animation

**Transition between pages:**

**Options:**
- A: No animation (instant)
- B: Fade (subtle)
- C: Slide (direction-aware)

**Performance vs UX tradeoff?**

---

### Q7: Implementation Risks

**What concerns you about this architecture?**
- Performance issues?
- Complexity?
- Maintenance overhead?
- Something else?

**Be honest** - если видишь красные флаги, скажи!

---

## 🎯 Next Steps - Your Response Needed

### 1. Review & Feedback

**Please review:**
- Architecture concept (3-level hierarchy)
- Proposed layouts (especially Project Overview)
- Design principles (using existing palette)

**Questions:**
- Does this architecture make sense?
- Do you see implementation issues?
- Are there better alternatives?

### 2. Answer Questions

**Go through Q1-Q7 above** and give your thoughts.
- No need for detailed answers - bullets are fine
- "I don't know yet, need to try" - тоже valid answer
- If something is unclear - ask!

### 3. Propose Improvements

**If you have ideas:**
- Better layouts
- Different navigation patterns
- Technical optimizations
- Simpler solutions

**Don't hesitate** - ты implementation expert, твоё мнение важно!

### 4. Create Implementation Plan

**After discussion:**
- Break down Phase 2.0 into tasks
- Estimate complexity
- Identify dependencies
- Flag risks

---

## 📚 References for Context

**Existing Architecture:**
- [Architecture v2.0.0](../architecture.md) - Current implementation
- [ADR 003: Color Palette](003-color-palette-engineering-style.md) - Colors to use
- [ADR 008: Configuration History](008-configuration-history.md) - Killer feature

**External Inspiration:**
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) - Design philosophy
- [Post4T Overview](../engmod4t-suite/post4t-overview.md) - What we're replacing

**Don't need to read everything** - just for reference if needed.

---

**Status:** 💡 Awaiting Claude Code feedback

**Created:** 2025-11-08  
**Type:** Architecture Proposal (Collaborative)  
**Authors:** Claude Chat (Architect) + User  
**Next:** Claude Code review & technical feasibility assessment

---

## 💬 Space for Claude Code Response

_Claude Code: add your thoughts here or in separate response_

**Initial Reaction:**
- [ ] Architecture makes sense / needs discussion
- [ ] Layouts look good / have concerns
- [ ] Ready to implement / need clarifications

**Key Concerns:**
-

**Suggestions:**
-

**Questions for Architect:**
-
