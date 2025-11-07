# ADR 007: Metadata Storage Location

**Date:** 2025-11-07
**Status:** ✅ Accepted
**Context:** User metadata storage architecture
**Decision Maker:** Engineering requirements analysis

---

## Context

Engine Viewer stores two types of data:
1. **Simulation data** (.det, .pou, .prt) - created by EngMod4T (read-only)
2. **UI metadata** (tags, notes, status, configuration history) - created by Engine Viewer

**Question:** Where to store UI metadata?

**Options:**
- A) Inside project folder: `C:/4Stroke/ProjectName/.metadata/`
- B) Centralized: `C:/Users/{User}/AppData/Local/EngineViewer/.metadata/`
- C) Alongside simulation data: `C:/4Stroke/.metadata/`

---

## Decision

**Option A: `.metadata/` subfolder inside each project folder**

```
C:/4Stroke/ProjectName/
├── ProjectName.det               # EngMod4T results (read-only)
├── ProjectName.pou               # EngMod4T results (read-only)
└── .metadata/                    # Engine Viewer territory
    ├── project-metadata.json     # UI metadata (tags, notes, status)
    ├── marker-tracking.json      # Marker timestamps
    └── prt-versions/             # Configuration snapshots
        ├── $baseline.prt
        └── $v2.prt
```

---

## Rationale

### 1. **File Ownership Contract**

EngMod4T Suite architecture:
- **ROOT** (`C:/4Stroke/`) - owned by EngMod4T Suite
  - Service files: `Dat4TErrorLog.dat`, `EngMod4TLicenseCheck.dat`
  - Configuration: `.prt`, `.pjt`, `.eng`, `.exp`, etc.

- **SUBFOLDERS** (`C:/4Stroke/ProjectName/`) - simulation results
  - Output files: `.det`, `.pou`, trace files
  - **We can add `.metadata/` here safely** - doesn't conflict with EngMod4T

### 2. **Locality Principle**

Simulation data + metadata in same location:
- ✅ Easy backup (copy project folder → everything saved)
- ✅ Easy transfer (move folder → metadata goes with it)
- ✅ No orphaned metadata (delete project → metadata deleted)

### 3. **Post4T Compatibility**

Post4T (legacy visualizer) must continue working:
- Post4T ignores folders starting with dot (`.metadata/`)
- No conflicts with existing workflow

### 4. **Single-User Architecture**

Use case reality:
- One engineer per computer
- No network shares
- No multi-user scenarios
- **AppData isolation not needed**

### 5. **Long-Lived Data**

Engineers keep projects for years:
- ~50 projects per year
- Projects rarely deleted
- Metadata persistence guaranteed

### 6. **Separation of Concerns**

Clear distinction:
- **Simulation data** (EngMod4T) - `.prt`, `.det`, `.pou`
- **UI metadata** (Engine Viewer) - `.metadata/*.json`

---

## Alternatives Considered

### Option B: AppData (Rejected)

**Against `C:/Users/{Username}/AppData/Local/EngineViewer/.metadata/`:**

❌ **Separates related data:**
- Simulation in `C:/4Stroke/ProjectName/`
- Metadata in `C:/Users/.../AppData/`
- Complex backup (two locations)

❌ **No benefits for this use case:**
- Single user → per-user isolation not needed
- Long-lived folders → persistence guaranteed
- No app reinstall protection needed

❌ **Complicates workflow:**
- Copy project folder → metadata not copied
- Two places for backup/restore

### Option C: Root-level .metadata/ (Rejected)

**Against `C:/4Stroke/.metadata/`:**

❌ **Violates file ownership contract:**
- Root owned by EngMod4T Suite
- Risk of conflicts with service files

❌ **Centralized = coupling:**
- All projects share one metadata folder
- Harder to backup individual projects
- Harder to transfer projects

---

## Implementation

**File Structure:**

```
.metadata/
├── project-metadata.json     # User-editable metadata
├── marker-tracking.json      # Automatic tracking
└── prt-versions/             # Configuration history
    ├── $baseline.prt         # Snapshot for $baseline
    └── $v2.prt              # Snapshot for $v2
```

**project-metadata.json:**
```json
{
  "version": "1.0",
  "id": "project-name",
  "displayName": "Custom Project Name",
  "manual": {
    "description": "Optimization run for client X",
    "client": "Client X",
    "tags": ["optimization", "turbo"],
    "status": "active",
    "notes": "Testing new exhaust configuration",
    "color": "#3b82f6"
  },
  "created": "2025-10-21T10:30:00Z",
  "modified": "2025-10-25T16:45:00Z"
}
```

**Backend path resolution:**
```javascript
// backend/src/services/metadataService.js
function getMetadataPath(projectName) {
  const projectDir = path.join(DATA_DIR, projectName);
  return path.join(projectDir, '.metadata');
}
```

---

## Consequences

**Positive:**
- ✅ Simple backup/transfer workflow
- ✅ No conflicts with EngMod4T
- ✅ Metadata co-located with data
- ✅ Post4T compatibility maintained

**Negative:**
- ⚠️ Metadata stored in multiple locations (one per project)
- ⚠️ Not centralized (but not needed for single-user)

**Neutral:**
- Development: `.metadata/` in `test-data/ProjectName/`
- Production: `.metadata/` in `C:/4Stroke/ProjectName/`
- Migration: Not required (dev ≠ production)

---

## Related

- [ADR 008: Configuration History](008-configuration-history.md) - Uses `.metadata/prt-versions/`
- [EngMod4T Suite Architecture](../engmod4t-suite/README.md) - File ownership contract
- [Folder Structure](../engmod4t-suite/folder-structure.md) - Directory layout
