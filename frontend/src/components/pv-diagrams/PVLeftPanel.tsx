/**
 * PV-Diagrams Left Panel Component
 *
 * Side panel for PV-Diagrams page with 2 sections:
 * 1. RPM Selection - Select .pvd file by RPM
 * 2. Cylinder Filter - Select specific cylinder or "All"
 *
 * Layout:
 * - Fixed width: 320px (w-80)
 * - Scrollable content (overflow-y-auto)
 * - Section headers in UPPERCASE with muted text
 * - Consistent spacing (space-y-6)
 *
 * Pattern matches: PerformancePage LeftPanel
 */

import { RPMSection } from './RPMSection';
import { CylinderFilterSection } from './CylinderFilterSection';
import { useAppStore } from '@/stores/appStore';
import type { PVDFileInfo } from '@/types';

interface PVLeftPanelProps {
  /** List of available PVD files */
  files: PVDFileInfo[];
  /** Loading state */
  loading?: boolean;
}

/**
 * PV-Diagrams Left Panel
 *
 * Combines RPM selection and cylinder filter sections into a cohesive side panel.
 * Automatically determines number of cylinders from selected file.
 *
 * @example
 * ```tsx
 * const { files, loading } = usePVDFiles(projectId);
 * <PVLeftPanel files={files} loading={loading} />
 * ```
 */
export function PVLeftPanel({ files, loading = false }: PVLeftPanelProps) {
  const selectedRPM = useAppStore((state) => state.selectedRPM);

  // Determine number of cylinders from selected file
  const selectedFile = files.find((f) => f.fileName === selectedRPM);
  const numCylinders = selectedFile?.cylinders || 1;

  return (
    <aside className="w-80 border-r bg-card overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* ============================================================
            Section 1: RPM Selection
            ============================================================ */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            RPM SELECTION
          </h2>
          <RPMSection files={files} loading={loading} />
        </section>

        {/* ============================================================
            Section 2: Cylinder Filter
            ============================================================ */}
        {selectedRPM && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              CYLINDER FILTER
            </h2>
            <CylinderFilterSection numCylinders={numCylinders} />
          </section>
        )}
      </div>
    </aside>
  );
}

export default PVLeftPanel;
