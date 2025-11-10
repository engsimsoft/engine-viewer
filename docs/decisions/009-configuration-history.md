# ADR 009: Configuration History (Automatic .prt Versioning)

**Date:** 2025-11-08
**Status:** ✅ Accepted (Design phase)
**Context:** Killer feature - replacing manual Excel tracking
**Decision Maker:** User requirement (main pain point)
**Implementation:** Phase 2 (after .spo support)

---

## Context

**Current problem (without Engine Viewer):**

Engineers run 42+ calculations per project, each with different engine configurations. Changes are tracked manually in Excel:

```
Marker  | Description
$1      | Base configuration
$2      | Increased bore +0.5mm
$3      | Changed exhaust valve timing
$4      | Added turbo
...
$42     | Final configuration
```

**Pain points:**
- ❌ Forget what changed 2 weeks ago
- ❌ No automatic diff between configurations
- ❌ Can't view "what was the config for $15?"
- ❌ Manual tracking = errors & time waste

**This is the MAIN PAIN** Engine Viewer must solve (killer-feature).

---

## Decision

**Automatic .prt versioning:** Save configuration snapshot for each calculation marker

**Concept:**
1. EngMod4T creates marker → Engine Viewer auto-saves `.prt` snapshot
2. UI shows Configuration History timeline
3. User can view any past configuration
4. User can compare (diff) any two configurations

---

## User Workflow

```
1. User runs EngMod4T calculation → creates marker $1
2. Engine Viewer automatically:
   - Copies ProjectName.prt → .metadata/prt-versions/ProjectName-$1.prt
   - Updates marker-tracking.json: { "$1": { timestamp, prtHash } }

3. User modifies engine config → runs calculation $2
4. Engine Viewer automatically:
   - Copies ProjectName.prt → .metadata/prt-versions/ProjectName-$2.prt
   - Updates marker-tracking.json: { "$2": { timestamp, prtHash } }

5. User opens "Configuration History" tab
6. Sees timeline:
   - $1 (2025-11-01 10:00) - Base configuration
   - $2 (2025-11-01 14:30) - Modified
   - $3 (2025-11-02 09:15) - Modified

7. User clicks "View Config" → Configuration Viewer modal
8. User clicks "Compare with $1" → Configuration Diff viewer
9. Sees changes: bore: 82.0 → 82.5 mm, stroke: 90.0 → 92.0 mm
```

---

## UI Design

### 1. Configuration History Tab

New tab in project view (same level as Metadata tab):
```
├── Metadata (existing)
├── Configuration History (NEW) ← killer-feature
└── Charts (existing)
```

### 2. Configuration Viewer Modal

Displays parsed `.prt` file in human-readable format:

**Sections:**
- Engine Geometry (bore, stroke, compression ratio)
- Valve Timing (IVO, IVC, EVO, EVC)
- Intake System (type, runner length, plenum volume)
- Exhaust System (header type, primary length)
- Combustion Model (fuel type, efficiency)

**Format:** Table view
```
Parameter       | Value    | Unit
----------------|----------|------
Bore            | 82.0     | mm
Stroke          | 90.0     | mm
Displacement    | 1598     | cc
Compression     | 10.5     | :1
```

### 3. Configuration Diff Viewer

Side-by-side comparison with highlighted changes:

```
Parameter       | $baseline | $v2      | Change
----------------|-----------|----------|--------
Bore            | 82.0 mm   | 82.5 mm  | 🟡 +0.5
Stroke          | 90.0 mm   | 92.0 mm  | 🟡 +2.0
IVO             | 10 BTDC   | 10 BTDC  | -
Exhaust Length  | 650 mm    | 700 mm   | 🟡 +50
```

**Change priority:**
- 🔴 Critical: bore, stroke, compression ratio
- 🟡 Important: valve timing, intake/exhaust geometry
- 🟢 Minor: temperatures, atmospheric conditions

---

## Data Structure

```
.metadata/
├── prt-versions/                 # Configuration snapshots
│   ├── ProjectName-$1.prt       # Config for marker $1
│   ├── ProjectName-$2.prt       # Config for marker $2
│   └── ProjectName-$3.prt       # Config for marker $3
│
└── marker-tracking.json         # Tracking metadata
```

**marker-tracking.json:**
```json
{
  "$1": {
    "timestamp": "2025-11-01T10:00:00Z",
    "prtHash": "abc123",
    "hasPrtSnapshot": true
  },
  "$2": {
    "timestamp": "2025-11-01T14:30:00Z",
    "prtHash": "def456",
    "hasPrtSnapshot": true
  },
  "$3": {
    "timestamp": "2025-11-02T09:15:00Z",
    "prtHash": null,
    "hasPrtSnapshot": false,
    "warning": "Config not saved (Engine Viewer opened after multiple calculations)"
  }
}
```

---

## Replaces Excel Workflow

**Before (manual):**
```
Open Excel → find project row → read description
"What did I change in $15?"
→ No idea, forgot to write it down
```

**After (automatic):**
```
Open Engine Viewer → Configuration History tab
Click $15 → see exact config
Click "Compare with $14" → see diff automatically
```

**Benefits:**
- ✅ No manual tracking
- ✅ Never forget changes
- ✅ Visual diff (easy to spot changes)
- ✅ Timeline with timestamps
- ✅ Can restore previous config

---

## Edge Case: Multiple Calculations Before Opening Engine Viewer

**Problem:**
```
Day 1: $1, $2, $3, $4, $5 calculations (no Engine Viewer open)
Day 2: Open Engine Viewer
Current .prt = config #5
Configs #1-#4 are lost forever ❌
```

**Solution:** Save only LAST marker, warn about others

```javascript
const lastMarker = calculations[calculations.length - 1]; // $5

// Save config for last marker only
if (!exists(`.metadata/prt-versions/${lastMarker.id}.prt`)) {
  copy('ProjectName.prt', `.metadata/prt-versions/${lastMarker.id}.prt`);
  updateMarkerTracking(lastMarker.id, {
    prtSaved: true,
    timestamp: new Date()
  });
}

// Warn about lost configs
for (const marker of calculations.slice(0, -1)) {
  if (!exists(`.metadata/prt-versions/${marker.id}.prt`)) {
    updateMarkerTracking(marker.id, {
      prtSaved: false,
      warning: 'Config not saved (opened Engine Viewer after multiple calculations)'
    });
  }
}
```

**UI shows warning:**
```
⚠️ $1, $2, $3, $4 - Configuration not saved
💡 Open Engine Viewer after each calculation to auto-save configs
✅ $5 - Configuration saved
```

**Manual save option:** User can manually save current `.prt` as any marker if they remember the config.

---

## Technical Implementation

### Phase 1: Data Layer (Backend)

**1. File Watcher Integration:**
```javascript
// When new marker detected in .pou/.det
fileWatcher.on('change', async (pouFilePath) => {
  const newMarkers = detectNewMarkers(pouFilePath);

  if (newMarkers.length > 0) {
    const lastMarker = newMarkers[newMarkers.length - 1];
    await saveConfigSnapshot(projectName, lastMarker);
  }
});
```

**2. Configuration Snapshot Service:**
```javascript
// backend/src/services/configHistoryService.js

async function saveConfigSnapshot(projectName, markerId) {
  const prtPath = path.join(DATA_DIR, `${projectName}.prt`);
  const snapshotPath = path.join(
    DATA_DIR,
    projectName,
    '.metadata/prt-versions',
    `${projectName}-${markerId}.prt`
  );

  await fs.copyFile(prtPath, snapshotPath);
  await updateMarkerTracking(projectName, markerId, {
    timestamp: new Date().toISOString(),
    prtHash: await hashFile(prtPath),
    hasPrtSnapshot: true
  });
}
```

### Phase 2: Parser (.prt Parser)

**Prerequisite:** Implement `.prt` parser (ADR 005)

```javascript
// backend/src/parsers/formats/prtParser.js

export function parsePRT(filePath) {
  // Parse .prt file (Windows-1251 encoding)
  // Extract:
  // - Engine geometry
  // - Valve timing
  // - Intake/exhaust configuration
  // - Combustion model parameters

  return {
    engineGeometry: { bore, stroke, displacement, compression },
    valveTiming: { IVO, IVC, EVO, EVC },
    intakeSystem: { type, runnerLength, plenumVolume },
    exhaustSystem: { headerType, primaryLength },
    combustion: { fuelType, efficiency }
  };
}
```

### Phase 3: Frontend UI

**1. Configuration History Tab:**
```typescript
// frontend/src/components/configuration/ConfigurationHistoryTab.tsx

export function ConfigurationHistoryTab({ projectId }: Props) {
  const history = useConfigHistory(projectId);

  return (
    <div className="config-history">
      <Timeline>
        {history.map(entry => (
          <TimelineEntry
            key={entry.markerId}
            marker={entry.markerId}
            timestamp={entry.timestamp}
            hasSaved={entry.hasPrtSnapshot}
            onView={() => openConfigViewer(entry.markerId)}
            onCompare={() => openConfigDiff(entry.markerId)}
          />
        ))}
      </Timeline>
    </div>
  );
}
```

**2. Configuration Viewer Modal:**
```typescript
// frontend/src/components/configuration/ConfigurationViewer.tsx

export function ConfigurationViewer({ config }: Props) {
  return (
    <Modal title={`Configuration: ${config.markerId}`}>
      <Section title="Engine Geometry">
        <ParamTable params={config.engineGeometry} />
      </Section>
      <Section title="Valve Timing">
        <ParamTable params={config.valveTiming} />
      </Section>
      {/* ... more sections */}
    </Modal>
  );
}
```

**3. Configuration Diff Viewer:**
```typescript
// frontend/src/components/configuration/ConfigurationDiff.tsx

export function ConfigurationDiff({ configA, configB }: Props) {
  const diff = computeDiff(configA, configB);

  return (
    <Modal title={`Compare ${configA.markerId} vs ${configB.markerId}`}>
      <DiffTable
        diff={diff}
        priorityColors={{
          critical: 'red',
          important: 'yellow',
          minor: 'green'
        }}
      />
    </Modal>
  );
}
```

---

## Implementation Priority

**Phase 2 Roadmap Position:**

1. ✅ Phase 1: .det/.pou support (completed v2.0.0)
2. **Phase 1.5:** .pvd support (PV-Diagram) ← next
3. ⏳ **Phase 2.1:** .spo support (single run)
4. ⏳ **Phase 2.2:** .prt parser + Configuration History ← THIS ADR
5. ⏳ **Phase 2.3:** Trace files support

**Estimate:** 2-3 weeks development + 1 week testing

---

## Success Metrics

**Replaces Excel tracking:**
- ✅ No manual Excel file needed
- ✅ 100% automatic tracking (no forgotten changes)
- ✅ Visual diff (faster than reading text)
- ✅ Timeline view (clear chronology)

**User feedback:**
- Target: "This saves me 30+ minutes per project"
- Target: "Never lose track of changes again"

---

## Related

- [ADR 005: .prt Parser](005-prt-parser-metadata-separation.md) - Prerequisite
- [ADR 007: Metadata Storage](007-metadata-storage-location.md) - Uses `.metadata/prt-versions/`
- [Folder Structure](../engmod4t-suite/folder-structure.md) - .prt file location
