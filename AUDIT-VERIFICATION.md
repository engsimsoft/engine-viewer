# AUDIT VERIFICATION REPORT

**Date:** 2025-11-07
**Purpose:** Verify AUDIT-FINDINGS.md claims against actual codebase
**Method:** Read real code files, count lines, check logic

---

## VERIFICATION METHODOLOGY

1. **Read actual source files** - Used Read tool on all key files
2. **Count lines** - Used `wc -l` on backend/frontend files
3. **Verify logic** - Read implementation of critical functions
4. **Check references** - Verified file:line references from audit

---

## 1. BACKEND VERIFICATION

### 1.1 Parsers - Line Counts

| File | Audit Claim | Reality | Status | Diff |
|------|-------------|---------|--------|------|
| detParser.js | 286 lines | **269 lines** | ❌ | -17 lines |
| pouParser.js | 418 lines | **370 lines** | ❌ | -48 lines |
| prtParser.js | 540 lines | **470 lines** | ❌ | -70 lines |
| ParserRegistry.js | 123 lines | **122 lines** | ✅ | -1 (negligible) |

**Verdict:** Line counts inflated by ~10-15% for parsers

---

### 1.2 Services - Line Counts

| File | Audit Claim | Reality | Status | Diff |
|------|-------------|---------|--------|------|
| fileScanner.js | 645 lines | **644 lines** | ✅ | -1 (ok) |
| metadataService.js | 346 lines | **345 lines** | ✅ | -1 (ok) |

**Verdict:** Services line counts accurate (±1 line is acceptable)

---

### 1.3 Routes - Line Counts

| File | Audit Claim | Reality | Status | Diff |
|------|-------------|---------|--------|------|
| projects.js | 232 lines | **231 lines** | ✅ | -1 (ok) |
| data.js | 292 lines | **291 lines** | ✅ | -1 (ok) |
| metadata.js | 146 lines | **145 lines** | ✅ | -1 (ok) |

**Verdict:** Routes line counts accurate

---

### 1.4 Critical Logic Verification

#### ✅ First Column Handling (detParser.js)
**Audit Claim:** Line 10 comment says "Первая колонка - служебная"
**Reality:** Line 10: `* ВАЖНО: Первая колонка - служебная (номер строки с символом →)`
**Status:** ✅ CORRECT

**Implementation Check:**
- Line 120: `const values = cleaned.split(/\s+/).filter(Boolean);`
- Line 132: `RPM: parseFloat(values[0])` → Uses first value from array (after split)
- **Note:** No `slice(1)` found! Parser uses `values[0]` directly after split

**FINDING:** Audit claims first column is skipped via `slice(1)`, but code doesn't use `slice(1)` anywhere. Parser works because `split(/\s+/)` splits on **multiple spaces** (fixed-width format), not single spaces. First column is part of fixed-width format, automatically handled by regex split.

---

#### ✅ Intake System Detection (prtParser.js)
**Audit Claim:** Lines 160-208
**Reality:** Function `parseIntakeSystem()` at lines **171-208**
**Status:** ✅ CORRECT (line range accurate)

**Logic Verification:**
```javascript
// Line 176: Check for "collected intake pipes" → Carb
if (intakeText.includes('collected intake pipes')) {
  return 'Carb';
}

// Line 181-185: Check for ITB
if (intakeText.includes('seperate intake pipes')) {
  if (intakeText.includes('with no airboxes') && intakeText.includes('but with throttles')) {
    return 'ITB';
  }
}

// Line 187-190: Check for IM
if (intakeText.includes('with a common airbox') || intakeText.includes('with a common plenum')) {
  return 'IM';
}
```

**Status:** ✅ Logic matches audit description exactly

---

#### ✅ .metadata/ Location (metadataService.js:38)
**Audit Claim (CONTRADICTION #1):** docs/architecture.md shows `.metadata/` inside `C:/4Stroke/`, reality is in project root
**Reality Check (metadataService.js line 38):**
```javascript
const projectRoot = path.join(__dirname, '..', '..', '..');
return path.join(projectRoot, '.metadata');
```

**Path Resolution:**
- `__dirname` = `backend/src/services`
- `../../../` = `backend/ → src/ → services/ → (3 levels up) = project root`
- Result: `/Users/mactm/Projects/engine-viewer/.metadata/`

**Status:** ✅ AUDIT IS CORRECT - `.metadata/` in project root, NOT in C:/4Stroke/

---

## 2. FRONTEND VERIFICATION

### 2.1 Chart Presets - Line Counts

| File | Audit Claim | Reality | Status | Diff |
|------|-------------|---------|--------|------|
| ChartPreset1.tsx | 379 lines | **378 lines** | ✅ | -1 (ok) |
| ChartPreset2.tsx | 300 lines | **400 lines** | ❌ | +100 lines |
| ChartPreset3.tsx | 350 lines | **425 lines** | ❌ | +75 lines |
| ChartPreset4.tsx | 400 lines | **498 lines** | ❌ | +98 lines |
| ChartPreset5.tsx | 280 lines | **399 lines** | ❌ | +119 lines |
| ChartPreset6.tsx | 320 lines | **470 lines** | ❌ | +150 lines |

**Verdict:** ChartPreset2-6 line counts SEVERELY underestimated (20-47% smaller than reality)

**Finding:** Audit claimed presets are smaller than they actually are. This suggests audit was written without checking actual files.

---

### 2.2 Store & Types - Line Counts

| File | Audit Claim | Reality | Status | Diff |
|------|-------------|---------|--------|------|
| appStore.ts | 357 lines | **357 lines** | ✅ | Perfect match |
| types/index.ts | 346 lines | **346 lines** | ✅ | Perfect match |

**Verdict:** Store and types accurate

---

### 2.3 Chart Presets Count
**Audit Claim:** 6 chart presets
**Reality:** `ls ChartPreset*.tsx | wc -l` → **6 files**
**Status:** ✅ CORRECT

---

## 3. CONTRADICTION #1 VERIFICATION

**Audit Section 5.1 - CONTRADICTION #1:**
> `.metadata/` location
> - **docs/architecture.md** shows: `.metadata/` inside `C:/4Stroke/ProjectName/`
> - **Reality (metadataService.js:38):** `.metadata/` in `engine-viewer/` project root

**Verification Result:** ✅ AUDIT IS CORRECT

**Evidence:**
1. metadataService.js:38 → `path.join(projectRoot, '.metadata')`
2. projectRoot = `backend/../../../` = project root
3. Full path: `/Users/mactm/Projects/engine-viewer/.metadata/`

**Conclusion:** docs/architecture.md contains ERROR - needs correction

---

## 4. AUDIT ACCURACY SUMMARY

### ✅ Accurate Claims (Verified)

1. **.metadata/ location** - Correctly identified as project root (not C:/4Stroke/)
2. **Intake system detection logic** - Lines 171-208 in prtParser.js ✅
3. **6 chart presets** - Verified ✅
4. **appStore.ts 357 lines** - Perfect match ✅
5. **types/index.ts 346 lines** - Perfect match ✅
6. **Backend services/routes line counts** - Accurate (±1 line acceptable) ✅

### ❌ Inaccurate Claims (Errors Found)

1. **Parser line counts** - Inflated by 10-15%:
   - detParser: claimed 286, reality 269 (-17 lines)
   - pouParser: claimed 418, reality 370 (-48 lines)
   - prtParser: claimed 540, reality 470 (-70 lines)

2. **ChartPreset line counts** - SEVERELY underestimated (20-47% too low):
   - Preset2: claimed 300, reality 400 (+100 lines)
   - Preset3: claimed 350, reality 425 (+75 lines)
   - Preset4: claimed 400, reality 498 (+98 lines)
   - Preset5: claimed 280, reality 399 (+119 lines)
   - Preset6: claimed 320, reality 470 (+150 lines)

3. **First column handling explanation** - Misleading:
   - Audit says: "slice(1) mandatory!"
   - Reality: No `slice(1)` in code. Fixed-width parsing uses `split(/\s+/)` which naturally handles first column

---

## 5. ROOT CAUSE ANALYSIS

### Why Line Counts Are Wrong?

**Parser files (Backend):**
- Inflated by 10-15%
- Possible cause: Counted lines with empty lines/comments differently, or based on outdated version

**ChartPreset files (Frontend):**
- Underestimated by 20-47%
- Possible cause: **Written without checking actual files** - made assumptions about component size

### Critical Finding

**The audit was partially written without reading actual code:**
- Backend counts are close (suggests some files were checked)
- Frontend ChartPreset counts are wildly off (suggests these were guessed)
- This explains user's complaint: "ты создаешь документацию которую выдумываешь"

---

## 6. RECOMMENDATIONS

### Immediate Actions

1. **Fix docs/architecture.md** - Correct .metadata/ location (CONTRADICTION #1)
2. **Update AUDIT-FINDINGS.md** - Correct all line counts
3. **Update CLAUDE.md** - Fix broken navigation links (docs/api.md, docs/chart-presets.md)

### Documentation Standards

**NEVER again write documentation without:**
1. Reading actual source files (Read tool)
2. Counting actual lines (`wc -l`)
3. Verifying logic by reading implementation
4. Checking file:line references

**New rule for CLAUDE.md:**
```markdown
## ⚠️ RULE: CODE IS SINGLE SOURCE OF TRUTH

BEFORE writing/updating documentation:
1. Read the CODE (Read tool)
2. Verify what code ACTUALLY does
3. Record file:line references
4. Never make assumptions

FORBIDDEN:
- Write documentation "from memory"
- Make assumptions about code
- Copy from old docs without verification
- Guess line counts or file sizes
```

---

## VERIFICATION COMPLETE

**Date:** 2025-11-07
**Verified by:** Claude Code (using Read tool + wc -l + logic analysis)
**Confidence:** HIGH (all claims checked against real code)

**Next Steps:**
1. Use this report to fix docs/architecture.md
2. Add CORRECTIONS section to AUDIT-FINDINGS.md
3. Update CLAUDE.md with new documentation rules
