/**
 * PV-Diagrams Left Panel Component (v3.1 - Educational)
 *
 * Side panel for PV-Diagrams page with 2 sections:
 * 1. RPM Selection - Multi-select .pvd files for comparison (2-4 RPMs)
 * 2. Diagram Type - Select P-V, Log P-V, or P-α
 *
 * Layout:
 * - Fixed width: 320px (w-80)
 * - Scrollable content (overflow-y-auto)
 * - Section headers in UPPERCASE with muted text
 * - Consistent spacing (space-y-6)
 *
 * Pattern matches: PerformancePage LeftPanel
 * NOTE: Cylinder Filter removed - always shows Cylinder 1 (educational simplification)
 */

import { RPMSection } from './RPMSection';
import { DiagramTypeTabs } from './DiagramTypeTabs';
import { useAppStore } from '@/stores/appStore';
import type { PVDFileInfo } from '@/types';

interface PVLeftPanelProps {
  /** List of available PVD files */
  files: PVDFileInfo[];
  /** Loading state */
  loading?: boolean;
}

/**
 * PV-Diagrams Left Panel (v3.1 - Educational)
 *
 * Combines RPM multi-selection and diagram type into a cohesive side panel.
 * Simplified for educational use - always shows Cylinder 1 data.
 *
 * @example
 * ```tsx
 * const { files, loading } = usePVDFiles(projectId);
 * <PVLeftPanel files={files} loading={loading} />
 * ```
 */
export function PVLeftPanel({ files, loading = false }: PVLeftPanelProps) {
  const selectedRPMs = useAppStore((state) => state.selectedRPMs);

  return (
    <aside className="w-80 border-r bg-card overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* ============================================================
            Section 1: RPM Selection (Multi-select)
            ============================================================ */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            RPM SELECTION
          </h2>
          <RPMSection files={files} loading={loading} />
        </section>

        {/* ============================================================
            Section 2: Diagram Type
            ============================================================ */}
        {selectedRPMs.length > 0 && (
          <section>
            <DiagramTypeTabs />
          </section>
        )}
      </div>
    </aside>
  );
}

export default PVLeftPanel;
