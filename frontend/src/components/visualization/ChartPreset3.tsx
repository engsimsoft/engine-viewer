import { useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CalculationReference } from '@/types/v2';
import {
  getBaseChartConfig,
  createXAxis,
  createYAxis,
  PARAMETER_COLORS,
} from '@/lib/chartConfig';
import { useChartExport as useChartExportHook } from '@/hooks/useChartExport';
import { useChartExport } from '@/contexts/ChartExportContext';
import { PeakValuesCards } from './PeakValuesCards';
import { useMultiProjectData, getLoadedCalculations } from '@/hooks/useMultiProjectData';
import { useAppStore } from '@/stores/appStore';
import {
  convertTemperature,
  getTemperatureUnit,
} from '@/lib/unitsConversion';
import { findPeak, formatPeakValue, getMarkerSymbol } from '@/lib/peakValues';
import { generateChartFilename } from '@/lib/exportFilename';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface ChartPreset3Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}

/**
 * Chart Preset 3: Temperature (v2.0 - Multi-Project Support)
 *
 * Single-axis chart:
 * - Y axis: Temperature (TCylMax & TUbMax)
 * - X axis: RPM
 * - Two lines per calculation:
 *   1. TCylMax (average across cylinders) - solid line
 *   2. TUbMax (average across cylinders) - dashed line
 *
 * Example: If 2 calculations are selected, chart shows 4 lines:
 * - ProjectA → $1 - TCylMax
 * - ProjectA → $1 - TUbMax
 * - ProjectB → $2 - TCylMax
 * - ProjectB → $2 - TUbMax
 *
 * Features:
 * - Cross-project comparison support
 * - Units conversion (°C/°F)
 * - Kelvin → Celsius conversion from database
 * - Color-coded calculations
 * - Loading/error states
 *
 * @example
 * ```tsx
 * const primary = useAppStore(state => state.primaryCalculation);
 * const comparisons = useAppStore(state => state.comparisonCalculations);
 * const allCalcs = [primary, ...comparisons].filter(Boolean);
 *
 * <ChartPreset3 calculations={allCalcs} />
 * ```
 */
export function ChartPreset3({ calculations }: ChartPreset3Props) {
  // Get units and chart settings from store
  const units = useAppStore((state) => state.units);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { animation, showGrid, decimals} = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(
    () => generateChartFilename(calculations, 3),
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

    // Determine if we should use parameter colors (single calculation mode)
    const isSingleCalculation = readyCalculations.length === 1;

    readyCalculations.forEach((calc, calcIndex) => {
      // Use parameter colors for single calculation, source colors for comparison
      const tCylMaxColor = isSingleCalculation ? PARAMETER_COLORS.temperatureCyl : calc.color;
      const tUbMaxColor = isSingleCalculation ? PARAMETER_COLORS.temperatureExh : calc.color;

      // Label: show project name only in comparison mode
      const label = isSingleCalculation
        ? calc.calculationName
        : `${calc.projectName} → ${calc.calculationName}`;

      // Ensure data is loaded
      if (!calc.data || calc.data.length === 0) return;

      // Find peak temperatures
      const tCylMaxPeak = findPeak(calc.data, 'TCylMax');
      const tUbMaxPeak = findPeak(calc.data, 'TUbMax');

      // Get marker symbol for this calculation
      const markerSymbol = getMarkerSymbol(calcIndex);

      // Prepare TCylMax data (average cylinder temperature)
      // IMPORTANT: Convert K → °C first, then apply units conversion
      const tCylMaxData = calc.data.map((point) => {
        const avgTempK =
          point.TCylMax.reduce((sum, temp) => sum + temp, 0) /
          point.TCylMax.length;
        const celsius = avgTempK - 273.15; // K → °C
        return {
          value: [point.RPM, convertTemperature(celsius, units)],
          decimals: decimals,
        };
      });

      // Prepare TUbMax data (average exhaust temperature)
      // IMPORTANT: Convert K → °C first, then apply units conversion
      const tUbMaxData = calc.data.map((point) => {
        const avgTempK =
          point.TUbMax.reduce((sum, temp) => sum + temp, 0) /
          point.TUbMax.length;
        const celsius = avgTempK - 273.15; // K → °C
        return {
          value: [point.RPM, convertTemperature(celsius, units)],
          decimals: decimals,
        };
      });

      // TCylMax series (cylinder temperature) - solid line
      series.push({
        name: `${label} - TCylMax`,
        type: 'line',
        yAxisIndex: 0,
        data: tCylMaxData,
        itemStyle: {
          color: tCylMaxColor,
        },
        lineStyle: {
          color: tCylMaxColor,
          width: 2,
          type: 'solid',
        },
        symbol: 'circle',
        symbolSize: 6,
        smooth: false,
        emphasis: {
          focus: 'series',
        },
        // Peak marker (K → °C conversion for peak value)
        markPoint: tCylMaxPeak ? {
          symbol: markerSymbol,
          symbolSize: 20,
          itemStyle: {
            color: tCylMaxColor,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false, // Hide default label, use tooltip instead
          },
          data: [{
            coord: [
              tCylMaxPeak.rpm,
              convertTemperature(tCylMaxPeak.value - 273.15, units)
            ],
            value: formatPeakValue(
              { ...tCylMaxPeak, value: tCylMaxPeak.value - 273.15 },
              'TCylMax',
              units
            ),
          }],
        } : undefined,
      });

      // TUbMax series (exhaust temperature) - dashed line
      series.push({
        name: `${label} - TUbMax`,
        type: 'line',
        yAxisIndex: 0,
        data: tUbMaxData,
        itemStyle: {
          color: tUbMaxColor,
        },
        lineStyle: {
          color: tUbMaxColor,
          width: 2,
          type: 'dashed',
        },
        symbol: 'diamond',
        symbolSize: 6,
        smooth: false,
        emphasis: {
          focus: 'series',
        },
        // Peak marker (K → °C conversion for peak value)
        markPoint: tUbMaxPeak ? {
          symbol: markerSymbol,
          symbolSize: 20,
          itemStyle: {
            color: tUbMaxColor,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false, // Hide default label, use tooltip instead
          },
          data: [{
            coord: [
              tUbMaxPeak.rpm,
              convertTemperature(tUbMaxPeak.value - 273.15, units)
            ],
            value: formatPeakValue(
              { ...tUbMaxPeak, value: tUbMaxPeak.value - 273.15 },
              'TUbMax',
              units
            ),
          }],
        } : undefined,
      });

      // Add to legend
      legendData.push(`${label} - TCylMax`);
      legendData.push(`${label} - TUbMax`);
    });

    // Get unit label
    const tempUnit = getTemperatureUnit(units);

    return {
      ...baseConfig,
      legend: {
        show: false,
      },
      // Line style legend at the top center
      graphic: [
        {
          type: 'group',
          left: 'center',
          top: 10,
          children: [
            // TCylMax solid line symbol
            {
              type: 'line',
              shape: {
                x1: 0,
                y1: 0,
                x2: 20,
                y2: 0,
              },
              style: {
                stroke: '#6b7280',
                lineWidth: 2,
              },
            },
            // TCylMax label
            {
              type: 'text',
              left: 25,
              top: -8,
              style: {
                text: 'TCylMax',
                fontSize: 12,
                fill: '#6b7280',
              },
            },
            // TUbMax dashed line symbol
            {
              type: 'line',
              left: 85,
              shape: {
                x1: 0,
                y1: 0,
                x2: 20,
                y2: 0,
              },
              style: {
                stroke: '#6b7280',
                lineWidth: 2,
                lineDash: [5, 5],
              },
            },
            // TUbMax label
            {
              type: 'text',
              left: 110,
              top: -8,
              style: {
                text: 'TUbMax',
                fontSize: 12,
                fill: '#6b7280',
              },
            },
          ],
        },
      ],
      xAxis: createXAxis('RPM', rpmMin, rpmMax, showGrid),
      yAxis: createYAxis(tempUnit, 'left', '#d62728', showGrid),  // Only unit label
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
        preset={3}
      />
    </div>
  );
}
