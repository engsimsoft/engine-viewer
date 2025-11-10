import { useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { PVDData } from '@/types';
import { getBaseChartConfig } from '@/lib/chartConfig';
import { useAppStore } from '@/stores/appStore';
import { useChartExport as useChartExportHook } from '@/hooks/useChartExport';
import { useChartExport } from '@/contexts/ChartExportContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';
import {
  createPVChartOptions,
  createLogPVChartOptions,
  createPAlphaChartOptions,
} from './chartOptionsHelpers';

interface PVDiagramChartProps {
  /** Parsed PVD data (metadata + 721 data points) */
  data: PVDData | null;
  /** Project name for export filename */
  projectName: string;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Retry callback for error state */
  onRetry?: () => void;
  /** Selected cylinder index (0-based, null = show all) */
  selectedCylinder?: number | null;
}

/**
 * PV-Diagram Chart Component
 *
 * Displays 3 types of PV-Diagrams for engine cylinders:
 * 1. P-V Diagram (Normal): Linear axes, classic thermodynamic diagram
 * 2. Log P-V: Logarithmic axes for polytropic process analysis
 * 3. P-α: Pressure vs Crank Angle (0-720°) with TDC/BDC markers
 *
 * Features:
 * - Cylinder filtering (individual or all)
 * - Chart export (PNG, SVG)
 * - Zoom/pan support
 * - Professional loading/error/empty states
 *
 * @example
 * ```tsx
 * const { data, loading, error } = usePVDData(projectId, 'V8_2000.pvd');
 * <PVDiagramChart data={data} loading={loading} error={error} />
 * ```
 */
export function PVDiagramChart({
  data,
  projectName,
  loading = false,
  error = null,
  onRetry,
  selectedCylinder = null,
}: PVDiagramChartProps) {
  // Get chart settings and diagram type from store
  const chartSettings = useAppStore((state) => state.chartSettings);
  const selectedDiagramType = useAppStore((state) => state.selectedDiagramType);
  const { animation, showGrid } = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(() => {
    const rpm = data?.metadata.rpm || 'unknown';
    const cylinder = selectedCylinder !== null ? `_Cyl${selectedCylinder + 1}` : '_AllCyl';
    const typeLabel = selectedDiagramType === 'log-pv' ? '_LogPV' : selectedDiagramType === 'p-alpha' ? '_PAlpha' : '_PV';
    return `${projectName}_PVDiagram${typeLabel}_${rpm}RPM${cylinder}`;
  }, [projectName, data, selectedCylinder, selectedDiagramType]);

  // Hook for chart export (local)
  const { chartRef, handleExportPNG, handleExportSVG } = useChartExportHook(exportFilename);

  // Register export handlers in context (for Header buttons)
  const { registerExportHandlers, unregisterExportHandlers } = useChartExport();

  useEffect(() => {
    registerExportHandlers({
      exportPNG: handleExportPNG,
      exportSVG: handleExportSVG,
    });

    return () => {
      unregisterExportHandlers();
    };
  }, [handleExportPNG, handleExportSVG, registerExportHandlers, unregisterExportHandlers]);

  // Generate ECharts configuration based on selected diagram type
  const chartOption = useMemo((): EChartsOption => {
    if (!data) {
      return {};
    }

    const baseConfig = getBaseChartConfig(animation);
    const params = {
      data,
      selectedCylinder,
      animation,
      showGrid,
      baseConfig,
    };

    // Select chart type based on selectedDiagramType
    switch (selectedDiagramType) {
      case 'log-pv':
        return createLogPVChartOptions(params);
      case 'p-alpha':
        return createPAlphaChartOptions(params);
      case 'pv':
      default:
        return createPVChartOptions(params);
    }
  }, [data, animation, showGrid, selectedCylinder, selectedDiagramType]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg border">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg border">
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  // Empty state - no data
  if (!data) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Select RPM to display PV-Diagram
          </p>
          <p className="text-sm text-muted-foreground">
            Use the left panel to select an RPM point
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <ReactECharts
          ref={chartRef}
          option={chartOption}
          style={{ height: '600px', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          theme="light"
        />
      </div>
    </div>
  );
}
