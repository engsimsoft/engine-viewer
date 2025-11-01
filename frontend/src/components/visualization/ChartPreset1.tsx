import { useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CalculationReference } from '@/types/v2';
import {
  getBaseChartConfig,
  createXAxis,
  createYAxis,
} from '@/lib/chartConfig';
import { useChartExport as useChartExportHook } from '@/hooks/useChartExport';
import { useChartExport } from '@/contexts/ChartExportContext';
import { PeakValuesCards } from './PeakValuesCards';
import { useMultiProjectData, getLoadedCalculations } from '@/hooks/useMultiProjectData';
import { useAppStore } from '@/stores/appStore';
import {
  convertPower,
  convertTorque,
  getPowerUnit,
  getTorqueUnit,
} from '@/lib/unitsConversion';
import { findPeak, formatPeakValue, getMarkerSymbol } from '@/lib/peakValues';
import { generateChartFilename } from '@/lib/exportFilename';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface ChartPreset1Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}

/**
 * Chart Preset 1: Power & Torque (v2.0 - Multi-Project Support)
 *
 * Dual-axis chart:
 * - Left axis: P-Av (Average Power)
 * - Right axis: Torque
 * - X axis: RPM
 *
 * Features:
 * - Cross-project comparison support
 * - Units conversion (SI/American/HP)
 * - Color-coded calculations
 * - Loading/error states
 *
 * @example
 * ```tsx
 * const primary = useAppStore(state => state.primaryCalculation);
 * const comparisons = useAppStore(state => state.comparisonCalculations);
 * const allCalcs = [primary, ...comparisons].filter(Boolean);
 *
 * <ChartPreset1 calculations={allCalcs} />
 * ```
 */
export function ChartPreset1({ calculations }: ChartPreset1Props) {
  // Get units and chart settings from store
  const units = useAppStore((state) => state.units);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { animation, showGrid, decimals } = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(
    () => generateChartFilename(calculations, 1),
    [calculations]
  );

  // Hook для экспорта графика (local)
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

  // Load cross-project data
  const {
    calculations: loadedCalculations,
    isLoading,
    error,
    refetch
  } = useMultiProjectData(calculations);

  // Filter calculations with loaded data
  const readyCalculations = useMemo(() => {
    return getLoadedCalculations(loadedCalculations);
  }, [loadedCalculations]);

  // Generate ECharts configuration
  const chartOption = useMemo((): EChartsOption => {
    const baseConfig = getBaseChartConfig(animation);

    // Calculate RPM range from metadata
    const allRpmRanges = readyCalculations.map((calc) => calc.metadata.rpmRange);
    const rpmMin = Math.min(...allRpmRanges.map(([min]) => min));
    const rpmMax = Math.max(...allRpmRanges.map(([, max]) => max));

    // Create series for each calculation
    const series: any[] = [];
    const legendData: string[] = [];

    readyCalculations.forEach((calc, calcIndex) => {
      const color = calc.color;
      const label = `${calc.projectName} → ${calc.calculationName}`;

      // Ensure data is loaded
      if (!calc.data || calc.data.length === 0) return;

      // Find peak values
      const powerPeak = findPeak(calc.data, 'P-Av');
      const torquePeak = findPeak(calc.data, 'Torque');

      // Get marker symbol for this calculation
      const markerSymbol = getMarkerSymbol(calcIndex);

      // Prepare power data with units conversion and decimals
      const powerData = calc.data.map((point) => ({
        value: [point.RPM, convertPower(point['P-Av'], units)],
        decimals: decimals,
      }));

      // Prepare torque data with units conversion and decimals
      const torqueData = calc.data.map((point) => ({
        value: [point.RPM, convertTorque(point.Torque, units)],
        decimals: decimals,
      }));

      // Power series (left Y axis)
      series.push({
        name: `${label} - P-Av`,
        type: 'line',
        yAxisIndex: 0, // Left axis
        data: powerData,
        itemStyle: {
          color,
        },
        lineStyle: {
          color,
          width: 2,
        },
        symbol: 'circle',
        symbolSize: 6,
        smooth: false,
        emphasis: {
          focus: 'series',
        },
        // Peak marker
        markPoint: powerPeak ? {
          symbol: markerSymbol,
          symbolSize: 20,
          itemStyle: {
            color: color,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false, // Hide default label, use tooltip instead
          },
          data: [{
            coord: [powerPeak.rpm, convertPower(powerPeak.value, units)],
            value: formatPeakValue(powerPeak, 'P-Av', units),
          }],
        } : undefined,
      });

      // Torque series (right Y axis)
      series.push({
        name: `${label} - Torque`,
        type: 'line',
        yAxisIndex: 1, // Right axis
        data: torqueData,
        itemStyle: {
          color,
        },
        lineStyle: {
          color,
          width: 2,
          type: 'dashed', // Dashed line for torque
        },
        symbol: 'diamond',
        symbolSize: 6,
        smooth: false,
        emphasis: {
          focus: 'series',
        },
        // Peak marker
        markPoint: torquePeak ? {
          symbol: markerSymbol,
          symbolSize: 20,
          itemStyle: {
            color: color,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false, // Hide default label, use tooltip instead
          },
          data: [{
            coord: [torquePeak.rpm, convertTorque(torquePeak.value, units)],
            value: formatPeakValue(torquePeak, 'Torque', units),
          }],
        } : undefined,
      });

      // Add to legend
      legendData.push(`${label} - P-Av`);
      legendData.push(`${label} - Torque`);
    });

    // Get unit labels
    const powerUnit = getPowerUnit(units);
    const torqueUnit = getTorqueUnit(units);

    return {
      ...baseConfig,
      legend: {
        show: false,
      },
      xAxis: createXAxis('RPM', rpmMin, rpmMax, showGrid),
      yAxis: [
        createYAxis(`P-Av (${powerUnit})`, 'left', '#1f77b4', showGrid),
        createYAxis(`Torque (${torqueUnit})`, 'right', '#ff7f0e', showGrid),
      ] as any,
      series,
    };
  }, [readyCalculations, units, animation, showGrid, decimals]);

  // Loading state
  if (isLoading) {
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
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  // Empty state - no calculations selected
  if (calculations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Select calculations to display chart
          </p>
          <p className="text-sm text-muted-foreground">
            Use the left panel to select calculations
          </p>
        </div>
      </div>
    );
  }

  // Empty state - calculations selected but no data loaded
  if (readyCalculations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            No data available
          </p>
          <p className="text-sm text-muted-foreground">
            Failed to load calculation data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Chart */}
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

      {/* Peak Values Cards */}
      <PeakValuesCards
        calculations={readyCalculations}
        preset={1}
      />
    </div>
  );
}
