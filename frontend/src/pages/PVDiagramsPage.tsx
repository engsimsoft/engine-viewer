/**
 * PV-Diagrams Page - Pressure-Volume Diagram Visualization (v3.1 - Educational)
 *
 * Route: /project/:id/pv-diagrams
 *
 * Page structure:
 * 1. Header with breadcrumbs and export buttons
 * 2. LeftPanel (320px) with multi-RPM selection
 * 3. Main area with PV-Diagram chart (overlay multiple RPMs)
 *
 * Features:
 * - Load .pvd files for a project
 * - Multi-select RPMs for comparison (2-4 RPMs)
 * - Always shows Cylinder 1 data (educational simplification)
 * - Export chart as PNG/SVG
 * - Professional loading/error/empty states
 *
 * Pattern: Matches PerformancePage.tsx (with educational enhancements)
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChartExportProvider } from '@/contexts/ChartExportContext';
import Header from '@/components/performance/Header';
import { PVLeftPanel } from '@/components/pv-diagrams/PVLeftPanel';
import { PVDiagramChart } from '@/components/pv-diagrams/PVDiagramChart';
import { PeakValuesCards } from '@/components/pv-diagrams/PeakValuesCards';
import { usePVDFiles } from '@/hooks/usePVDFiles';
import { usePVDData } from '@/hooks/usePVDData';
import { useAppStore } from '@/stores/appStore';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

/**
 * PV-Diagrams Page Component (v3.1 - Educational)
 *
 * Main page for PV-Diagram visualization. Loads .pvd files for a project,
 * allows multi-RPM selection for comparison, and displays overlaid P-V charts.
 *
 * Educational enhancements:
 * - Multi-RPM comparison (2-4 RPMs on same chart)
 * - Simplified UI (always Cylinder 1)
 * - Future: cycle phases, valve timing markers
 *
 * @example
 * Route: /project/v8/pv-diagrams
 */
export default function PVDiagramsPage() {
  const { id: projectId } = useParams<{ id: string }>();

  // Load list of .pvd files
  const { files, loading: filesLoading, error: filesError, refetch: refetchFiles } = usePVDFiles(projectId);

  // Get selected RPMs from store (multi-select)
  const selectedRPMs = useAppStore((state) => state.selectedRPMs);
  const resetPVDiagrams = useAppStore((state) => state.resetPVDiagrams);

  // Load multiple .pvd file data for comparison
  const { dataArray, loading: dataLoading, error: dataError, refetch: refetchData } = usePVDData(projectId, selectedRPMs);

  // Reset state when leaving page (cleanup)
  useEffect(() => {
    return () => {
      resetPVDiagrams();
    };
  }, [resetPVDiagrams]);

  // ====================================================================
  // Loading State - Files
  // ====================================================================

  if (filesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // ====================================================================
  // Error State - Files
  // ====================================================================

  if (filesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorMessage message={filesError} onRetry={refetchFiles} />
      </div>
    );
  }

  // ====================================================================
  // Main Page Layout
  // ====================================================================

  return (
    <ChartExportProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with breadcrumbs and export buttons */}
        <Header
          title="PV-Diagrams"
          backHref={`/project/${projectId}`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: projectId || 'Project', href: `/project/${projectId}` },
            { label: 'PV-Diagrams', href: `/project/${projectId}/pv-diagrams` },
          ]}
        />

        {/* Main Content: LeftPanel + Chart */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Multi-RPM Selection */}
          <PVLeftPanel files={files} loading={filesLoading} />

          {/* Main Chart Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <PVDiagramChart
                  dataArray={dataArray}
                  projectName={projectId || 'Project'}
                  loading={dataLoading}
                  error={dataError}
                  onRetry={refetchData}
                />

                {/* Peak Values Cards - below chart */}
                <PeakValuesCards dataArray={dataArray} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ChartExportProvider>
  );
}
