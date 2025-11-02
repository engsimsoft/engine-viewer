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
  convertValue,
} from '@/lib/unitsConversion';
import { PARAMETERS } from '@/config/parameters';
import { findPeak, formatPeakValue, getMarkerSymbol } from '@/lib/peakValues';
import { generateChartFilename } from '@/lib/exportFilename';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface ChartPreset5Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}

/**
 * Chart Preset 5: Combustion Parameters
 *
 * Single-axis chart showing 4 combustion parameters:
 * - TAF (Trapped Air/Fuel Ratio)
 * - Timing (Ignition Timing)
 * - Delay (Ignition Delay) - per-cylinder averaged
 * - Durat (Combustion Duration) - per-cylinder averaged
 *
 * Features:
 * - Cross-project comparison support
 * - Mixed units (no unit conversion needed)
 * - 4 different line styles for distinction
 * - Per-cylinder averaging for Delay and Durat
 * - Color-coded calculations
 * - Loading/error states
 *
 * @example
 * ```tsx
 * const primary = useAppStore(state => state.primaryCalculation);
 * const comparisons = useAppStore(state => state.comparisonCalculations);
 * const allCalcs = [primary, ...comparisons].filter(Boolean);
 *
 * <ChartPreset5 calculations={allCalcs} />
 * ```
 */
export function ChartPreset5({ calculations }: ChartPreset5Props) {
  // Get units and chart settings from store
  const units = useAppStore((state) => state.units);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { animation, showGrid, decimals } = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(
    () => generateChartFilename(calculations, 5),
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

    // Combustion parameters and their line styles
    const parameters = ['TAF', 'Timing', 'Delay', 'Durat'];
    const lineStyles: Array<'solid' | 'dashed' | 'dotted'> = ['solid', 'dashed', 'dotted', 'solid'];
    const lineDash = [undefined, [5, 5], [2, 2], [10, 5, 2, 5]]; // solid, dashed, dotted, dash-dot

    // Create series for each calculation
    const series: any[] = [];

    // Determine if we should use parameter colors (single calculation mode)
    const isSingleCalculation = readyCalculations.length === 1;

    readyCalculations.forEach((calc, calcIndex) => {
      // Label: show project name only in comparison mode
      const label = isSingleCalculation
        ? calc.calculationName
        : `${calc.projectName} → ${calc.calculationName}`;

      // Ensure data is loaded
      if (!calc.data || calc.data.length === 0) return;

      // Get marker symbol for this calculation
      const markerSymbol = getMarkerSymbol(calcIndex);

      // Create series for each combustion parameter
      parameters.forEach((paramName, paramIndex) => {
        // Use parameter colors for single calculation, calc color for comparison
        // In single calculation mode: each parameter gets its own color
        // In comparison mode: all parameters of one calculation use calc.color
        const combustionColors = [
          PARAMETER_COLORS.combustion1, // TAF - Purple
          PARAMETER_COLORS.combustion2, // Timing - Orange
          PARAMETER_COLORS.combustion3, // Delay - Green
          PARAMETER_COLORS.combustion4, // Durat - Red
        ];
        const color = isSingleCalculation ? combustionColors[paramIndex] : calc.color;

        // Check if parameter is per-cylinder (needs averaging)
        const param = PARAMETERS[paramName];
        const isPerCylinder = param?.perCylinder || false;

        // Prepare data with units conversion and per-cylinder averaging
        const paramData = calc.data!.map((point) => {
          // Get raw value
          const rawValue = (point as any)[paramName];

          // Average per-cylinder arrays (Delay, Durat are arrays)
          let valueToConvert: number;
          if (isPerCylinder && Array.isArray(rawValue)) {
            // Average across cylinders
            valueToConvert = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
          } else {
            // Scalar value (TAF, Timing are scalars)
            valueToConvert = rawValue as number;
          }

          return {
            value: [point.RPM, convertValue(valueToConvert, paramName, units)],
            decimals: decimals,
          };
        });

        // Find peak for this parameter (need to average for per-cylinder)
        let peak;
        if (isPerCylinder) {
          // For per-cylinder parameters, manually find peak from averaged data
          let maxValue = -Infinity;
          let maxRpm = 0;
          let maxIndex = 0;
          calc.data!.forEach((point, idx) => {
            const rawValue = (point as any)[paramName];
            if (Array.isArray(rawValue)) {
              const avg = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
              if (avg > maxValue) {
                maxValue = avg;
                maxRpm = point.RPM;
                maxIndex = idx;
              }
            }
          });
          peak = maxValue > -Infinity ? { value: maxValue, rpm: maxRpm, index: maxIndex } : null;
        } else {
          // For scalar parameters, use findPeak directly
          peak = findPeak(calc.data!, paramName);
        }

        // Determine Y-axis index based on parameter type
        // TAF uses right axis (AFR), others use left axis (degrees)
        const yAxisIndex = paramName === 'TAF' ? 1 : 0;

        // Create series
        series.push({
          name: `${label} - ${paramName}`,
          type: 'line',
          yAxisIndex: yAxisIndex, // TAF on right axis (AFR), others on left axis (degrees)
          data: paramData,
          itemStyle: {
            color: color,
          },
          lineStyle: {
            color: color,
            width: 2,
            type: lineStyles[paramIndex],
            // For dash-dot pattern, use lineDash array
            ...(lineDash[paramIndex] ? { lineDash: lineDash[paramIndex] } : {}),
          },
          symbol: 'circle',
          symbolSize: 6,
          smooth: false,
          emphasis: {
            focus: 'series',
          },
          // Peak marker
          markPoint: peak ? {
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
              coord: [peak.rpm, convertValue(peak.value, paramName, units)],
              value: formatPeakValue(peak, paramName, units),
            }],
          } : undefined,
        });
      });
    });

    // Dual Y-axis labels: simple and clean
    // Left axis: degrees (Timing, Delay, Durat)
    // Right axis: AFR (TAF)
    const leftYAxisLabel = 'Deg';
    const rightYAxisLabel = 'AFR';

    // Legend colors: colored in single calc mode, gray in comparison mode
    const legendColor1 = isSingleCalculation ? PARAMETER_COLORS.combustion1 : '#666';
    const legendColor2 = isSingleCalculation ? PARAMETER_COLORS.combustion2 : '#666';
    const legendColor3 = isSingleCalculation ? PARAMETER_COLORS.combustion3 : '#666';
    const legendColor4 = isSingleCalculation ? PARAMETER_COLORS.combustion4 : '#666';

    return {
      ...baseConfig,
      legend: {
        show: false,
      },
      // Custom legend at the top center
      // Single calc mode: colored (matches line colors)
      // Comparison mode: gray (user relies on line styles only)
      graphic: [
        {
          type: 'group',
          left: 'center',
          top: 15,
          children: [
            // TAF - solid line
            {
              type: 'line',
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor1, lineWidth: 2 },
            },
            {
              type: 'text',
              left: 30,
              top: -8,
              style: { text: 'TAF', fontSize: 14, fontWeight: 'bold', fill: legendColor1 },
            },
            // Timing - dashed line
            {
              type: 'line',
              left: 65,
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor2, lineWidth: 2, lineDash: [5, 5] },
            },
            {
              type: 'text',
              left: 95,
              top: -8,
              style: { text: 'Timing', fontSize: 14, fontWeight: 'bold', fill: legendColor2 },
            },
            // Delay - dotted line
            {
              type: 'line',
              left: 150,
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor3, lineWidth: 2, lineDash: [2, 2] },
            },
            {
              type: 'text',
              left: 180,
              top: -8,
              style: { text: 'Delay', fontSize: 14, fontWeight: 'bold', fill: legendColor3 },
            },
            // Durat - dash-dot line
            {
              type: 'line',
              left: 230,
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor4, lineWidth: 2, lineDash: [10, 5, 2, 5] },
            },
            {
              type: 'text',
              left: 260,
              top: -8,
              style: { text: 'Durat', fontSize: 14, fontWeight: 'bold', fill: legendColor4 },
            },
          ],
        },
      ],
      xAxis: createXAxis('RPM', rpmMin, rpmMax, showGrid),
      yAxis: [
        createYAxis(leftYAxisLabel, 'left', '#1f77b4', showGrid),   // Left: degrees (Timing, Delay, Durat)
        createYAxis(rightYAxisLabel, 'right', '#9467bd', showGrid), // Right: AFR (TAF)
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
    <div className="w-full space-y-2">
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
        preset={5}
      />
    </div>
  );
}
