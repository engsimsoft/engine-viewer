import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectData } from '@/hooks/useProjectData';
import { useAppStore } from '@/stores/appStore';
import { useDeepLinking } from '@/hooks/useDeepLinking';
import { ChartExportProvider } from '@/contexts/ChartExportContext';
import { Header } from '@/components/performance/Header';
import { LeftPanel } from '@/components/performance/LeftPanel';
import { PrimarySelectionModal } from '@/components/performance/PrimarySelectionModal';
import { ComparisonModal } from '@/components/performance/ComparisonModal';
import { ChartPreset1 } from '@/components/performance/ChartPreset1';
import { ChartPreset2 } from '@/components/performance/ChartPreset2';
import { ChartPreset3 } from '@/components/performance/ChartPreset3';
import { ChartPreset4 } from '@/components/performance/ChartPreset4';
import { ChartPreset5 } from '@/components/performance/ChartPreset5';
import { ChartPreset6 } from '@/components/performance/ChartPreset6';
import { DataTable } from '@/components/performance/DataTable';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

/**
 * Performance & Efficiency Analysis Page (Phase 2 - v3.0)
 *
 * IMPORTANT (v3.0 Architecture):
 * - Route: /project/:id/performance (Level 3 in 3-level hierarchy)
 * - projectId from URL (:id) is used as INITIAL CONTEXT for visualization
 * - This is NOT a limitation - user can compare calculations from ANY projects
 * - Cross-project comparison fully supported through useMultiProjectData hook
 *
 * Phase 2 Updates:
 * - Uses new Header component (English UI, with settings)
 * - Uses new LeftPanel component (responsive, 3 sections)
 * - All UI text in English
 * - Connected to Zustand store
 *
 * v3.0 Changes:
 * - Renamed from ProjectPage to PerformancePage (clarity)
 * - Part of 3-level routing: HomePage → ProjectOverviewPage → PerformancePage
 * - Displays: Power, Torque, MEP, BSFC, Efficiency charts
 *
 * Displays:
 * - Project header with back button and settings
 * - Left panel: Primary selector + Presets + Comparisons
 * - Chart area: Selected preset visualization
 * - Data table with export (CSV, Excel)
 */
export default function PerformancePage() {
  // projectId from URL - initial context for Phase 2
  const { id } = useParams<{ id: string }>();

  // v3.0: Deep linking - sync URL params with store state
  useDeepLinking(id || '');

  // Load project data
  const { project, loading, error, refetch } = useProjectData(id);

  // Get selected preset from Zustand store
  const selectedPreset = useAppStore((state) => state.selectedPreset);

  // Get calculations from Zustand store (Phase 4)
  const primaryCalculation = useAppStore((state) => state.primaryCalculation);
  const comparisonCalculations = useAppStore((state) => state.comparisonCalculations);
  const clearPrimaryCalculation = useAppStore((state) => state.clearPrimaryCalculation);

  // Reset primary calculation when switching to a different project
  // NOTE: Comparisons are NOT cleared - cross-project comparison is a key feature!
  useEffect(() => {
    // If primary calculation exists and belongs to a different project, clear it
    if (primaryCalculation && primaryCalculation.projectId !== id) {
      clearPrimaryCalculation();
    }
    // DO NOT clear comparisons - cross-project comparison is intentional!
  }, [id, primaryCalculation, clearPrimaryCalculation]);

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
        {/* Header Component (v3.0 - with Breadcrumbs) */}
        <Header
          title="Performance & Efficiency"
          backHref={`/project/${id}`}
          breadcrumbs={[
            { label: 'Engine Viewer', href: '/' },
            { label: project.name, href: `/project/${id}` },
            { label: 'Performance & Efficiency' }
          ]}
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
                {selectedPreset === 5 && (
                  <ChartPreset5
                    calculations={allCalculations}
                  />
                )}
                {selectedPreset === 6 && (
                  <ChartPreset6
                    calculations={allCalculations}
                  />
                )}
              </div>

              {/* Data Table (v2.0 - Multi-Project Support) */}
              <DataTable
                calculations={allCalculations}
                selectedPreset={selectedPreset}
              />
            </div>
          </main>
        </div>

        {/* Modals */}
        <PrimarySelectionModal />
        <ComparisonModal currentProjectId={id} />
      </div>
    </ChartExportProvider>
  );
}
