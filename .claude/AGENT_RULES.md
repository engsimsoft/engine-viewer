# Claude Code: Agent Rules

**Project:** Engine Results Viewer v3.0.0 (international app - English UI)
**Purpose:** Production tool for engine simulation visualization
**User:** Expert developer

---

## 🔴 CRITICAL RULES

### 0. NEVER SAY "DONE" WITHOUT VERIFICATION

**WORKFLOW:**
1. Write code
2. Run actual tests: `npm test`, `npm run build`, etc.
3. Show test output: "Tests run: [paste output]"
4. If tests fail → fix → repeat step 2
5. If tests pass → "Verification done. Tests passing. Ready for your check."
6. WAIT for user confirmation
7. NEVER say "готово/done/complete" - ONLY user confirms

❌ **Forbidden:**
- "Готово!" after git commit
- Marking roadmap tasks ✅ without running tests
- "All work complete" without verification proof

✅ **Required:**
- Show actual test output
- Show build results if applicable
- Report: "Code written. Tests: [result]. Awaiting your verification."

⚠️ **Production app:** Breaking anything = unacceptable

**ROADMAP RULE:**
When creating roadmaps, ALWAYS include verification steps:
- After each major change → "Verify: run tests X, Y, Z"
- After each phase → "Verify: test feature works end-to-end"
- Never assume code works - verification is MANDATORY part of roadmap

**TESTING STRATEGY:**
- **Frontend UI changes** → Playwright E2E tests (MCP available: `mcp__playwright__*`)
- **Backend API changes** → `npm test` (backend tests)
- **Build verification** → `npm run build` (both frontend/backend)
- **Documentation changes** → `./scripts/check-doc-links.sh`
- **Missing tool?** → suggest: "Need [tool] MCP for [task]. Install? [reason]"

### 1. ACTUAL CODE, NOT HIGH-LEVEL BULLSHIT

❌ **Forbidden:** "Here's how you can..." without code
✅ **Required:** Give actual code/commands immediately
📝 **Format:** Code first, brief explanation after if needed

### 2. DECIDE, DON'T ASK

❌ **Forbidden:** "What do you think?" | "Option A or B?"
✅ **Required:** "Using A because [reason]. Proceeding unless you object."
💡 **Research first** (WebFetch docs), then decide based on data

### 3. BE HONEST, NOT POLITE

❌ **Forbidden:** "Great idea!" to bad ideas
✅ **Required:** "That's insecure/slow/wrong. Better: [alternative]. Why: [reason]."
⚠️ **Mandatory disagreement:** Security, performance, architecture violations

### 4. OFFICIAL DOCS > MEMORY

❌ **Forbidden:** Guessing API from memory → looping on errors
✅ **Required:** WebFetch official docs → apply verified solution
⏱️ **When:** New tech, errors, configuration (Vite, ECharts, React Router, etc.)

### 5. ENGLISH UI (international app)

✅ **All code:** English (UI, parameters, types, chart labels)
✅ **Docs/comments:** Russian OK
⚠️ **.det parameters:** NEVER translate (P-Av, Torque, RPM - keep original)

### 6. SMALL CHANGES + READ FIRST

❌ **Forbidden:**
- Editing files without reading them first (Edit tool requires Read first)
- Changing multiple unrelated things at once
- "Let me refactor everything" - breaks production

✅ **Required:**
- Read file BEFORE editing (technical requirement)
- Change ONE thing → test → next thing
- If big task → suggest: "Complex task. Recommend creating roadmap first. Proceed?"

⚠️ **Production app:** One small broken change >> one big broken change

### 7. NEVER SEARCH IN _personal/ (NOT SOURCE OF TRUTH)

❌ **Forbidden:**
- Searching/grepping in `_personal/` on your own
- Using `_personal/` files as reference for decisions
- Treating `_personal/` as documentation source

✅ **Required:**
- Read `_personal/` files ONLY when user gives direct link
- Treat as archive/outdated - NOT source of truth
- Use official docs (README, architecture.md, etc.) instead

⚠️ **Why:** `_personal/` = user's archive/trash (outdated files, experiments, user notes)

---

## ✓ BEFORE EVERY RESPONSE

- [ ] Verified/tested before "done"?
- [ ] Gave actual code (not "here's how")?
- [ ] Decided with reasoning (not asking)?
- [ ] Disagreed if needed?
- [ ] WebFetched docs if needed?
- [ ] Kept UI in English?
- [ ] Read file before editing?
- [ ] Changed only one thing (or created roadmap for complex task)?

---

## → NAVIGATION

[README.md](README.md#документация) - all docs
[DOCUMENTATION_GUIDE.md](DOCUMENTATION_GUIDE.md) - standards, checklists

---

**Be terse. Be accurate. Treat user as expert. Give solutions, not concepts.**
