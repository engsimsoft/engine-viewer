import { useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { PVDDataItem } from '@/hooks/usePVDData';
import type { CombustionCurve } from '@/types'; // v3.2.0
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
  /** Array of parsed PVD data for multi-RPM comparison */
  dataArray: PVDDataItem[];
  /** Project name for export filename */
  projectName: string;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Retry callback for error state */
  onRetry?: () => void;
  /** v3.2.0: Combustion timing curves from project metadata */
  combustionData?: CombustionCurve[];
}

/**
 * PV-Diagram Chart Component (v3.1 - Educational Multi-RPM)
 *
 * Displays 3 types of PV-Diagrams with multi-RPM comparison:
 * 1. P-V Diagram (Normal): Linear axes, classic thermodynamic diagram
 * 2. Log P-V: Logarithmic axes for polytropic process analysis
 * 3. P-α: Pressure vs Crank Angle (0-720°) with TDC/BDC markers
 *
 * Educational features:
 * - Multi-RPM comparison (2-4 RPMs overlaid)
 * - Always shows Cylinder 1 (simplified for education)
 * - Chart export (PNG, SVG)
 * - Zoom/pan support
 * - Professional loading/error/empty states
 *
 * @example
 * ```tsx
 * const { dataArray, loading, error } = usePVDData(projectId, selectedRPMs);
 * <PVDiagramChart dataArray={dataArray} loading={loading} error={error} />
 * ```
 */
export function PVDiagramChart({
  dataArray,
  projectName,
  loading = false,
  error = null,
  onRetry,
  combustionData = [], // v3.2.0
}: PVDiagramChartProps) {
  // Get chart settings and diagram type from store
  const chartSettings = useAppStore((state) => state.chartSettings);
  const selectedDiagramType = useAppStore((state) => state.selectedDiagramType);
  const showCombustionTiming = useAppStore((state) => state.showCombustionTiming); // v3.2.0
  const showPumpingLosses = useAppStore((state) => state.showPumpingLosses);
  const { animation, showGrid } = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(() => {
    const rpms = dataArray.map((item) => item.rpm).join('-');
    const typeLabel = selectedDiagramType === 'log-pv' ? '_LogPV' : selectedDiagramType === 'p-alpha' ? '_PAlpha' : '_PV';
    return dataArray.length === 1
      ? `${projectName}_PVDiagram${typeLabel}_${rpms}RPM`
      : `${projectName}_PVDiagram${typeLabel}_Compare${dataArray.length}RPMs`;
  }, [projectName, dataArray, selectedDiagramType]);

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
    if (dataArray.length === 0) {
      return {};
    }

    const baseConfig = getBaseChartConfig(animation);
    const params = {
      dataArray,
      animation,
      showGrid,
      showPumpingLosses,
      baseConfig,
      combustionData, // v3.2.0
      showCombustionTiming, // v3.2.0
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
  }, [dataArray, animation, showGrid, showPumpingLosses, selectedDiagramType, combustionData, showCombustionTiming]);

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

  // Empty state - no RPMs selected
  if (dataArray.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Select 2-4 RPMs to compare engine cycles
          </p>
          <p className="text-sm text-muted-foreground">
            Use the left panel to select RPM points for comparison
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
