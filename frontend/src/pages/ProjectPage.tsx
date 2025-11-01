import { useParams } from 'react-router-dom';
import { useProjectData } from '@/hooks/useProjectData';
import { useAppStore } from '@/stores/appStore';
import { ChartExportProvider } from '@/contexts/ChartExportContext';
import { Header } from '@/components/visualization/Header';
import { LeftPanel } from '@/components/visualization/LeftPanel';
import { PrimarySelectionModal } from '@/components/visualization/PrimarySelectionModal';
import { ComparisonModal } from '@/components/visualization/ComparisonModal';
import { ChartPreset1 } from '@/components/visualization/ChartPreset1';
import { ChartPreset2 } from '@/components/visualization/ChartPreset2';
import { ChartPreset3 } from '@/components/visualization/ChartPreset3';
import { ChartPreset4 } from '@/components/visualization/ChartPreset4';
import { DataTable } from '@/components/visualization/DataTable';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

/**
 * Project Visualization Page (Phase 2 - Integrated)
 *
 * IMPORTANT (v2.0 Architecture):
 * - projectId from URL (:id) is used as INITIAL CONTEXT for visualization
 * - This is NOT a limitation - user can compare calculations from ANY projects
 * - In Phase 2: projectId determines which project to show in Primary Selection Modal by default
 * - Cross-project comparison fully supported through useMultiProjectData hook
 *
 * Phase 2 Updates:
 * - Uses new Header component (English UI, with settings)
 * - Uses new LeftPanel component (responsive, 3 sections)
 * - All UI text in English
 * - Connected to Zustand store
 *
 * Displays:
 * - Project header with back button and settings
 * - Left panel: Primary selector + Presets + Comparisons
 * - Chart area: Selected preset visualization
 * - Data table with export (CSV, Excel)
 */
export default function ProjectPage() {
  // projectId from URL - initial context for Phase 2
  const { id } = useParams<{ id: string }>();

  // Load project data
  const { project, loading, error, refetch } = useProjectData(id);

  // Get selected preset from Zustand store
  const selectedPreset = useAppStore((state) => state.selectedPreset);

  // Get calculations from Zustand store (Phase 4)
  const primaryCalculation = useAppStore((state) => state.primaryCalculation);
  const comparisonCalculations = useAppStore((state) => state.comparisonCalculations);

  // Combine primary + comparisons for v2 charts
  const allCalculations = [
    primaryCalculation,
    ...comparisonCalculations,
  ].filter(Boolean) as import('@/types/v2').CalculationReference[];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message={error} onRetry={refetch} />
        </div>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Project not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChartExportProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header Component (Phase 2) */}
        <Header
          projectName={project.fileName}
          engineType={project.metadata.engineType}
          cylinders={project.metadata.numCylinders}
          calculationsCount={project.calculations.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel (Phase 2) - Responsive, 3 sections */}
          <LeftPanel />

          {/* Main Chart & Table Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Chart Area */}
              <div className="bg-card rounded-lg border p-6">
                {/* Render chart based on selected preset */}
                {selectedPreset === 1 && (
                  <ChartPreset1
                    calculations={allCalculations}
                  />
                )}
                {selectedPreset === 2 && (
                  <ChartPreset2
                    calculations={allCalculations}
                  />
                )}
                {selectedPreset === 3 && (
                  <ChartPreset3
                    calculations={allCalculations}
                  />
                )}
                {selectedPreset === 4 && (
                  <ChartPreset4
                    calculations={allCalculations}
                  />
                )}
              </div>

              {/* Data Table (v2.0 - Multi-Project Support) */}
              <DataTable
                calculations={allCalculations}
              />
            </div>
          </main>
        </div>

        {/* Modals */}
        <PrimarySelectionModal />
        <ComparisonModal />
      </div>
    </ChartExportProvider>
  );
}
