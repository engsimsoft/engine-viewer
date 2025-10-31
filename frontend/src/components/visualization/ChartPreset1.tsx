import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CalculationReference } from '@/types/v2';
import {
  getBaseChartConfig,
  createXAxis,
  createYAxis,
} from '@/lib/chartConfig';
import { useChartExport } from '@/hooks/useChartExport';
import { ChartExportButtons } from './ChartExportButtons';
import { useMultiProjectData, getLoadedCalculations } from '@/hooks/useMultiProjectData';
import { useAppStore } from '@/stores/appStore';
import {
  convertPower,
  convertTorque,
  getPowerUnit,
  getTorqueUnit,
} from '@/lib/unitsConversion';
import { findPeak, formatPeakValue, getMarkerSymbol } from '@/lib/peakValues';
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
  // Hook для экспорта графика
  const { chartRef, handleExportPNG, handleExportSVG } = useChartExport('power-torque-chart');

  // Get units from store
  const units = useAppStore((state) => state.units);

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
    const baseConfig = getBaseChartConfig();

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

      // Prepare power data with units conversion
      const powerData = calc.data.map((point) => ({
        value: [point.RPM, convertPower(point['P-Av'], units)],
      }));

      // Prepare torque data with units conversion
      const torqueData = calc.data.map((point) => ({
        value: [point.RPM, convertTorque(point.Torque, units)],
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
      title: {
        text: 'P-Av & Torque',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      legend: {
        ...baseConfig.legend,
        data: legendData,
        top: 40,
      },
      xAxis: createXAxis('RPM', rpmMin, rpmMax),
      yAxis: [
        createYAxis(`P-Av (${powerUnit})`, 'left', '#1f77b4'),
        createYAxis(`Torque (${torqueUnit})`, 'right', '#ff7f0e'),
      ] as any,
      series,
    };
  }, [readyCalculations, units]);

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
      {/* Export buttons */}
      <ChartExportButtons
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        disabled={readyCalculations.length === 0}
      />

      {/* Chart */}
      <ReactECharts
        ref={chartRef}
        option={chartOption}
        style={{ height: '600px', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
        theme="light"
      />
    </div>
  );
}
