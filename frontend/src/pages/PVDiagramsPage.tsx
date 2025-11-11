/**
 * PV-Diagrams Page - Pressure-Volume Diagram Visualization
 *
 * Route: /project/:id/pv-diagrams
 *
 * Page structure (iPhone Style):
 * 1. Header with breadcrumbs and export buttons
 * 2. LeftPanel (320px) with RPM selection and cylinder filter
 * 3. Main area with PV-Diagram chart
 *
 * Features:
 * - Load .pvd files for a project
 * - Select RPM point (auto-select peak pressure RPM)
 * - Filter by cylinder or show all
 * - Export chart as PNG/SVG
 * - Professional loading/error/empty states
 *
 * Pattern: EXACTLY matches PerformancePage.tsx
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
 * PV-Diagrams Page Component
 *
 * Main page for PV-Diagram visualization. Loads .pvd files for a project,
 * allows RPM and cylinder selection, and displays interactive P-V chart.
 *
 * @example
 * Route: /project/v8/pv-diagrams
 */
export default function PVDiagramsPage() {
  const { id: projectId } = useParams<{ id: string }>();

  // Load list of .pvd files
  const { files, loading: filesLoading, error: filesError, refetch: refetchFiles } = usePVDFiles(projectId);

  // Get selected RPM from store
  const selectedRPM = useAppStore((state) => state.selectedRPM);
  const selectedCylinder = useAppStore((state) => state.selectedCylinder);
  const setSelectedRPM = useAppStore((state) => state.setSelectedRPM);
  const resetPVDiagrams = useAppStore((state) => state.resetPVDiagrams);

  // Load specific .pvd file data
  const { data, loading: dataLoading, error: dataError, refetch: refetchData } = usePVDData(projectId, selectedRPM || undefined);

  // Auto-select first file when files load (carefully chosen default - iPhone Style)
  useEffect(() => {
    if (files.length > 0 && !selectedRPM) {
      // Find file with peak pressure (best default for PV-Diagrams)
      const peakFile = files.reduce((prev, current) =>
        current.peakPressure > prev.peakPressure ? current : prev
      );
      setSelectedRPM(peakFile.fileName);
    }
  }, [files, selectedRPM, setSelectedRPM]);

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
          {/* Left Panel: RPM Selection + Cylinder Filter */}
          <PVLeftPanel files={files} loading={filesLoading} />

          {/* Main Chart Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-card rounded-lg border p-6">
                <PVDiagramChart
                  data={data}
                  projectName={projectId || 'Project'}
                  loading={dataLoading}
                  error={dataError}
                  onRetry={refetchData}
                  selectedCylinder={selectedCylinder}
                />

                {/* Peak Values Cards - below chart */}
                <PeakValuesCards data={data} selectedCylinder={selectedCylinder} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </ChartExportProvider>
  );
}
