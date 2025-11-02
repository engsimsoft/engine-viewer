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
  getParameterUnit,
} from '@/lib/unitsConversion';
import { PARAMETERS } from '@/config/parameters';
import { findPeak, formatPeakValue, getMarkerSymbol } from '@/lib/peakValues';
import { generateChartFilename } from '@/lib/exportFilename';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface ChartPreset2Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}

/**
 * Chart Preset 2: Mean Effective Pressures (MEP)
 *
 * Single-axis chart showing 4 MEP parameters:
 * - FMEP (Friction Mean Effective Pressure)
 * - IMEP (Indicated Mean Effective Pressure)
 * - BMEP (Brake Mean Effective Pressure)
 * - PMEP (Pumping Mean Effective Pressure)
 *
 * Features:
 * - Cross-project comparison support
 * - Units conversion (bar ↔ psi)
 * - 4 different line styles for distinction
 * - Color-coded calculations
 * - Loading/error states
 *
 * @example
 * ```tsx
 * const primary = useAppStore(state => state.primaryCalculation);
 * const comparisons = useAppStore(state => state.comparisonCalculations);
 * const allCalcs = [primary, ...comparisons].filter(Boolean);
 *
 * <ChartPreset2 calculations={allCalcs} />
 * ```
 */
export function ChartPreset2({ calculations }: ChartPreset2Props) {
  // Get units and chart settings from store
  const units = useAppStore((state) => state.units);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { animation, showGrid, decimals } = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(
    () => generateChartFilename(calculations, 2),
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

    // MEP parameters and their line styles
    const parameters = ['FMEP', 'IMEP', 'BMEP', 'PMEP'];
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

      // Create series for each MEP parameter
      parameters.forEach((paramName, paramIndex) => {
        // Use parameter colors for single calculation, calc color for comparison
        // In single calculation mode: each MEP parameter gets its own color
        // In comparison mode: all parameters of one calculation use calc.color
        const mepColors = [
          PARAMETER_COLORS.mep1, // FMEP - Blue
          PARAMETER_COLORS.mep2, // IMEP - Orange
          PARAMETER_COLORS.mep3, // BMEP - Green
          PARAMETER_COLORS.mep4, // PMEP - Red
        ];
        const color = isSingleCalculation ? mepColors[paramIndex] : calc.color;

        // Check if parameter is per-cylinder (needs averaging)
        const param = PARAMETERS[paramName];
        const isPerCylinder = param?.perCylinder || false;

        // Prepare data with units conversion and per-cylinder averaging
        const paramData = calc.data!.map((point) => {
          // Get raw value
          const rawValue = (point as any)[paramName];

          // Average per-cylinder arrays (IMEP, BMEP, PMEP are arrays)
          let valueToConvert: number;
          if (isPerCylinder && Array.isArray(rawValue)) {
            // Average across cylinders
            valueToConvert = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
          } else {
            // Scalar value (FMEP is scalar)
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

        // Create series
        series.push({
          name: `${label} - ${paramName}`,
          type: 'line',
          yAxisIndex: 0, // Single Y-axis (all MEP use pressure units)
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

    // Get unit label (all MEP parameters use same pressure unit)
    const pressureUnit = getParameterUnit('FMEP', units);

    // Legend colors: colored in single calc mode, gray in comparison mode
    const legendColor1 = isSingleCalculation ? PARAMETER_COLORS.mep1 : '#666';
    const legendColor2 = isSingleCalculation ? PARAMETER_COLORS.mep2 : '#666';
    const legendColor3 = isSingleCalculation ? PARAMETER_COLORS.mep3 : '#666';
    const legendColor4 = isSingleCalculation ? PARAMETER_COLORS.mep4 : '#666';

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
            // FMEP - solid line
            {
              type: 'line',
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor1, lineWidth: 2 },
            },
            {
              type: 'text',
              left: 30,
              top: -8,
              style: { text: 'FMEP', fontSize: 14, fontWeight: 'bold', fill: legendColor1 },
            },
            // IMEP - dashed line
            {
              type: 'line',
              left: 85,
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor2, lineWidth: 2, lineDash: [5, 5] },
            },
            {
              type: 'text',
              left: 115,
              top: -8,
              style: { text: 'IMEP', fontSize: 14, fontWeight: 'bold', fill: legendColor2 },
            },
            // BMEP - dotted line
            {
              type: 'line',
              left: 165,
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor3, lineWidth: 2, lineDash: [2, 2] },
            },
            {
              type: 'text',
              left: 195,
              top: -8,
              style: { text: 'BMEP', fontSize: 14, fontWeight: 'bold', fill: legendColor3 },
            },
            // PMEP - dash-dot line
            {
              type: 'line',
              left: 250,
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor4, lineWidth: 2, lineDash: [10, 5, 2, 5] },
            },
            {
              type: 'text',
              left: 280,
              top: -8,
              style: { text: 'PMEP', fontSize: 14, fontWeight: 'bold', fill: legendColor4 },
            },
          ],
        },
      ],
      xAxis: createXAxis('RPM', rpmMin, rpmMax, showGrid),
      yAxis: createYAxis(pressureUnit, 'left', '#1f77b4', showGrid),
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
        preset={2}
      />
    </div>
  );
}
