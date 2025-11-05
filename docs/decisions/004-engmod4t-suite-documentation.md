# ADR 004: EngMod4T Suite AI-Friendly Documentation

**Date:** 2025-11-05
**Status:** ✅ Implemented
**Context:** AI collaboration & knowledge transfer
**Decision Maker:** User + Claude Code

---

## Context

### Problem

Claude Chat (AI Architect) needed to understand the EngMod4T Suite ecosystem (DAT4T, EngMod4T, Post4T) to:
- Brainstorm new features for Engine Results Viewer
- Understand integration points with old programs
- Make informed architectural decisions
- Design features that complement the existing workflow

**Blockers:**
1. **Repository size limits:** Claude Chat couldn't attach GitHub repository due to file size constraints
   - Pictures folder (35 MB, 489 images) exceeded GitHub file size limits for Claude Chat attachment
   - Solution implemented: Split Pictures into chapter-specific folders (see commit a46190e)
2. **Documentation scattered:** EngMod4T Suite documentation existed only as:
   - CHM files (Windows Help format - not AI-readable)
   - Extracted HTML (converted to Markdown, but still in raw chapter form)
   - Technical specs (file formats, parameters) but no high-level overview
3. **Context gap:** No comprehensive overview explaining:
   - What each program does (DAT4T, EngMod4T, Post4T)
   - How they integrate (data flow, file ownership, constraints)
   - Why Engine Results Viewer is replacing Post4T
   - Critical patterns (fixed-width ASCII, first column service, parameter names English)

**User Quote:** "смотри я попытался репозиторий дать посмотреть твоему коллеге Claude chat... возникла проблема он не может по какой-то причине его изучить. Давай в такой случае сделаем это с тобой ты подготовишь документ с описанием как работает, работают все три моих Старых программы..."

---

## Decision

Created **comprehensive AI-friendly documentation suite** in `docs/engmod4t-suite/`:

### Documentation Structure

```
docs/engmod4t-suite/
├── README.md                   (576 lines) - Entry point, suite overview
├── suite-integration.md        (789 lines) - Complete workflow, file ownership, data flow
├── dat4t-overview.md           (407 lines) - Pre-processor (40+ intake, 60+ exhaust configs)
├── post4t-overview.md          (549 lines) - Old visualizer (being replaced)
└── engmod4t-overview.md        (515 lines) - Simulation engine (1D gasdynamics, Method of Characteristics)
```

**Total:** ~2,836 lines of AI-optimized documentation

### Documentation Style

**Template:** ARCHITECT-CONTEXT.md format (AI-to-AI communication)

**Characteristics:**
- 🎯 Emoji section headers (visual navigation)
- 📊 Tables (quick reference)
- ✅/❌ Code examples (correct vs incorrect patterns)
- 🎓 "Key Takeaways" sections (TL;DR)
- 📚 "Related Documentation" links (navigation)
- **WHY explanations** (not just WHAT/HOW)
- **Quick checklists** (actionable items)

**Focus:**
- WHAT each program does (purpose, inputs, outputs)
- WHY decisions were made (constraints, trade-offs)
- WHERE to find details (links to 11 Dat4T chapters, 23 Post4T chapters)
- **NOT** detailed implementation (that's in Dat4THelp-chapters, Post4THelp-chapters)

---

## Rationale

### 1. **AI Collaboration Enablement**

**Problem:** Claude Chat needs context but can't access full repository
**Solution:** Self-contained documentation that Claude Chat can read directly

**Benefits:**
- Claude Chat can understand EngMod4T Suite ecosystem in ~10 minutes
- No need to extract CHM files or read scattered documentation
- Consistent terminology and concepts across all documentation
- Quick reference for architectural discussions

### 2. **ARCHITECT-CONTEXT.md Style Effectiveness**

**Why this format works for AI:**
- Emoji headers: Visual structure, easy to scan
- Tables: Dense information, quick lookup
- ✅/❌ examples: Concrete patterns, no ambiguity
- WHY explanations: Context for decisions (not just facts)
- Related links: Navigation without redundancy (SSOT principle)

**Proven pattern:** ARCHITECT-CONTEXT.md successfully used for:
- Onboarding Claude Chat as AI Architect
- Transferring project context without full codebase access
- Enabling informed architectural decisions

### 3. **Knowledge Transfer & Documentation as Code**

**Single Source of Truth (SSOT):**
- Suite overview: `docs/engmod4t-suite/README.md`
- Integration patterns: `docs/engmod4t-suite/suite-integration.md`
- Each program: Dedicated overview file

**Detailed docs remain in original location:**
- Dat4T: `_personal/Dat4THelp-chapters/` (11 chapters, 4,884 lines)
- Post4T: `_personal/Post4THelp-chapters/` (23 chapters, ~2 MB)

**No duplication:** Overview docs LINK to detailed chapters (don't copy content)

### 4. **Future-Proofing**

**As Engine Results Viewer evolves:**
- Adding .prt parsing → refer to `dat4t-overview.md` (explains .prt structure)
- Adding trace file support → refer to `suite-integration.md` (explains file ownership)
- Adding measured data import → refer to `post4t-overview.md` (explains measured data workflow)

**As EngMod4T Suite context is needed:**
- New team members can read suite docs for quick context
- AI assistants can understand integration points
- Architectural decisions have full context (WHY old programs worked this way)

---

## Implementation

### Files Created

1. **README.md** (576 lines)
   - Purpose: Entry point for suite documentation
   - Content: What is EngMod4T Suite, three-program architecture, data flow, file formats, history
   - Key sections: 🎯 Purpose, 🏗️ Architecture, 📁 Data Flow Diagram, 📄 File Formats, 🔗 Integration

2. **suite-integration.md** (789 lines)
   - Purpose: Complete workflow and integration patterns
   - Content: File ownership matrix, C:/4Stroke/ structure, Engine Results Viewer integration, 4 data flow patterns
   - Key sections: 🔄 Complete Workflow, 📂 File Ownership, ⚠️ Critical Constraints, 📊 Data Flow Patterns

3. **dat4t-overview.md** (407 lines)
   - Purpose: Pre-processor documentation
   - Content: Engine configuration, 40+ intake configs, 60+ exhaust configs, turbo/supercharger, VVT/VTEC
   - Key sections: 🎯 Purpose, 📥 Inputs, 📤 Output (.prt structure), 🔧 Key Features

4. **post4t-overview.md** (549 lines)
   - Purpose: Old visualizer documentation (being replaced)
   - Content: 9 trace types, performance curves, PV-diagrams, detonation, turbo post-processing, noise analysis
   - Key sections: 🎯 Purpose, 🔧 Key Features, ⚠️ Limitations (why replacement needed), 🚀 Engine Results Viewer (the replacement)

5. **engmod4t-overview.md** (515 lines)
   - Purpose: Simulation engine documentation
   - Content: 1D gasdynamics (Method of Characteristics), thermodynamic cycle, multi-cycle convergence, turbo modeling
   - Key sections: 🎯 Purpose, 📥 Inputs, 📤 Output (.det, .pou, traces), 🔧 Key Features, ⚠️ Critical Constraints

### Cross-References Updated

**Files modified to reference new suite docs:**
- `ARCHITECT-CONTEXT.md`: Updated links to `engmod4t-overview.md` (old path → new path)
- `README.md`: Added suite docs to "Основная документация" section
- `docs/file-formats/det-format.md`: Updated EngMod4T Overview link
- `docs/file-formats/pou-format.md`: Updated EngMod4T Overview link
- `docs/file-formats/README.md`: Updated EngMod4T Overview link (2 occurrences)
- `docs/parsers-guide.md`: Updated EngMod4T Overview link (2 occurrences)

**Old file removed:**
- `docs/engmod4t-overview.md` → moved to `docs/engmod4t-suite/engmod4t-overview.md` (expanded from 233 lines to 515 lines)

### Git Commits

**Preparation (earlier work):**
- Commit 8414568: Cleanup old CHM extraction (deleted `_personal/extracted/` and `_personal/Dat4THelp.chm`)
- Commit a46190e: Split Pictures folders by chapter (solved Claude Chat GitHub attachment issue)
- Commit 8385e00: Convert Post4THelp.chm to markdown chapters

**This ADR (to be committed):**
- Created 5 comprehensive suite overview documents (~2,836 lines)
- Updated 7 cross-references to point to new locations
- Removed old `docs/engmod4t-overview.md` (moved and expanded)

---

## Consequences

### Positive

1. **✅ Claude Chat Enablement**
   - Can now understand EngMod4T Suite without repository access
   - Informed architectural decisions based on full context
   - Effective brainstorming for new features

2. **✅ Knowledge Transfer**
   - New team members can quickly understand ecosystem
   - AI assistants have comprehensive context
   - Solo developer + AI workflow is more effective

3. **✅ Documentation as Code**
   - SSOT for each program (no duplication)
   - Links to detailed chapters (Dat4THelp, Post4THelp)
   - Version controlled (Git history)

4. **✅ Future-Proofing**
   - .prt parsing: Context already documented (dat4t-overview.md)
   - Trace files: Integration patterns documented (suite-integration.md)
   - Measured data: Workflow documented (post4t-overview.md)

5. **✅ Cross-Project Pattern**
   - ARCHITECT-CONTEXT.md style proven effective
   - Can be reused for other legacy system documentation
   - AI-friendly format (emoji headers, tables, ✅/❌ examples)

### Negative

1. **⚠️ Maintenance Burden**
   - Must keep suite docs synchronized with detailed chapters
   - If EngMod4T Suite changes, suite docs must be updated
   - However: EngMod4T Suite is stable (15+ years old, unlikely to change)

2. **⚠️ Duplication Risk**
   - Overview docs summarize content from detailed chapters
   - Risk of inconsistency if detailed chapters updated but overview not
   - Mitigation: Overview docs LINK to detailed chapters (readers go to source)

### Neutral

1. **📝 Documentation Size**
   - Added ~2,836 lines of documentation
   - Trade-off: Comprehensive context vs. maintenance effort
   - Decision: Context is more valuable than brevity for AI collaboration

---

## Alternatives Considered

### Alternative 1: Extract Key Sections from CHM Files

**Approach:** Copy relevant sections from Dat4THelp/Post4THelp into README.md

**Rejected because:**
- Would duplicate 4,884+ lines of detailed documentation
- Violates SSOT principle
- Hard to maintain (two sources of truth)
- Doesn't solve Claude Chat repository access issue

### Alternative 2: Reference Existing Documentation Only

**Approach:** Add links to `_personal/Dat4THelp-chapters/` without creating overviews

**Rejected because:**
- Claude Chat would need to read 11+23 = 34 chapters (too much context)
- No high-level overview (forest vs trees problem)
- No integration patterns documented
- No WHY explanations (only detailed HOW in chapters)

### Alternative 3: Single Monolithic Document

**Approach:** One giant `engmod4t-suite.md` file with all content

**Rejected because:**
- Hard to navigate (2,836 lines in one file)
- Hard to maintain (single point of failure)
- Hard to link to specific sections
- Violates separation of concerns (each program deserves its own doc)

---

## Lessons Learned

### 1. **AI Collaboration Requires Specialized Documentation**

**Insight:** Traditional user-facing documentation (CHM files, detailed chapters) is NOT optimal for AI

**AI-friendly characteristics:**
- Emoji headers (visual structure)
- Tables (dense information)
- ✅/❌ examples (concrete patterns)
- WHY explanations (context for decisions)
- Links not duplication (SSOT)

**Pattern established:** ARCHITECT-CONTEXT.md style is effective for AI-to-AI knowledge transfer

### 2. **SSOT Applied to Documentation**

**Principle:** Don't duplicate content, link to authoritative source

**Application:**
- Overview docs: WHAT, WHY, WHERE (high-level context)
- Detailed chapters: HOW (implementation details)
- Cross-references: Link overview → detailed chapters

**Benefit:** Single update point when information changes

### 3. **Documentation is Investment, Not Overhead**

**Time invested:** ~6 hours to create 5 comprehensive documents
**ROI:**
- Claude Chat can now contribute effectively (architectural decisions)
- New features designed with full context (no blind spots)
- Solo developer + AI workflow multiplier effect

**Conclusion:** Comprehensive documentation enables AI collaboration at scale

---

## Related Documentation

- [README.md](../engmod4t-suite/README.md) - Suite overview (entry point)
- [suite-integration.md](../engmod4t-suite/suite-integration.md) - Integration patterns
- [dat4t-overview.md](../engmod4t-suite/dat4t-overview.md) - Pre-processor
- [post4t-overview.md](../engmod4t-suite/post4t-overview.md) - Old visualizer
- [engmod4t-overview.md](../engmod4t-suite/engmod4t-overview.md) - Simulation engine
- [ARCHITECT-CONTEXT.md](../../ARCHITECT-CONTEXT.md) - Template for AI-friendly documentation
- [../../_personal/Dat4THelp-chapters/README.md](../../_personal/Dat4THelp-chapters/README.md) - Detailed DAT4T documentation
- [../../_personal/Post4THelp-chapters/README.md](../../_personal/Post4THelp-chapters/README.md) - Detailed Post4T documentation

---

**Last Updated:** 2025-11-05
**Status:** ✅ Active documentation
**Review Frequency:** When EngMod4T Suite integration changes (rare)
