/**
 * Chart Preset 3: Critical Engine Values (PCylMax, TC-Av, MaxDeg)
 *
 * "Очень важный preset" - Shows critical values that can destroy the engine
 *
 * Triple Y-axis chart:
 * - Left axis: PCylMax (bar/psi) - Maximum cylinder pressure (per-cylinder, averaged)
 * - Right axis 1: TC-Av (°C/°F) - Average cylinder temperature (scalar)
 * - Right axis 2: MaxDeg (deg) - Degrees after TDC where max pressure occurs (per-cylinder, averaged) (offset 60px)
 * - X axis: RPM
 *
 * Parameter types:
 * - PCylMax: per-cylinder array → averaged across cylinders
 * - TC-Av: scalar (already averaged)
 * - MaxDeg: per-cylinder array → averaged across cylinders
 *
 * Features:
 * - Triple Y-axis for parameters with different units and scales
 * - Fixed Y-axis ranges: PCylMax (20-120 bar), TC-Av (1800-2800°C), MaxDeg (0-30 °ATDC)
 * - Cross-project comparison support
 * - Per-cylinder averaging for PCylMax and MaxDeg (TC-Av is scalar)
 * - Units conversion (bar ↔ psi, °C ↔ °F)
 * - Peak markers: MAX for PCylMax/TC-Av, MIN for MaxDeg (<14° = detonation risk)
 * - Different line styles: solid (PCylMax), dashed (TC-Av), dotted (MaxDeg)
 *
 * Scale differences:
 * - PCylMax: ~100 bar (range: 20-120)
 * - TC-Av: ~2500°C (range: 1800-2800)
 * - MaxDeg: ~8-12 °ATDC (range: 0-30, showing MIN value)
 *
 * @example
 * ```tsx
 * <ChartPreset3 calculations={calculations} />
 * ```
 */

import { useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption, YAXisComponentOption } from 'echarts';
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
  convertValue,
  getParameterUnit,
} from '@/lib/unitsConversion';
import { PARAMETERS } from '@/config/parameters';
import { findPeak, formatPeakValue, getMarkerSymbol } from '@/lib/peakValues';
import { generateChartFilename } from '@/lib/exportFilename';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface ChartPreset3Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}

export function ChartPreset3({ calculations }: ChartPreset3Props) {
  // Get units and chart settings from store
  const units = useAppStore((state) => state.units);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { animation, showGrid, decimals } = chartSettings;

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

    // Critical parameters and their line styles
    const parameters = ['PCylMax', 'TC-Av', 'MaxDeg'];
    const lineStyles: Array<'solid' | 'dashed' | 'dotted'> = ['solid', 'dashed', 'dotted'];
    const lineDash = [undefined, [5, 5], [2, 2]]; // solid, dashed, dotted

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

      // Create series for each critical parameter
      parameters.forEach((paramName, paramIndex) => {
        // Use parameter colors for single calculation, calc color for comparison
        // In single calculation mode: each parameter gets its own color
        // In comparison mode: all parameters of one calculation use calc.color
        const criticalColors = [
          '#1f77b4', // PCylMax - Blue
          '#d62728', // TC-Av - Red
          '#ff7f0e', // MaxDeg - Orange
        ];
        const color = isSingleCalculation ? criticalColors[paramIndex] : calc.color;

        // Check if parameter is per-cylinder (needs averaging)
        // PCylMax: per-cylinder array → average
        // TC-Av: scalar (already averaged) → no averaging
        // MaxDeg: per-cylinder array → average
        const param = PARAMETERS[paramName];
        const isPerCylinder = param?.perCylinder || false;

        // Y-axis index for triple axis configuration
        // PCylMax: yAxisIndex 0 (left)
        // TC-Av: yAxisIndex 1 (right 1)
        // MaxDeg: yAxisIndex 2 (right 2, offset)
        const yAxisIndex = paramIndex;

        // Prepare data with units conversion and per-cylinder averaging
        const paramData = calc.data!.map((point) => {
          // Get raw value
          const rawValue = (point as any)[paramName];

          // Handle per-cylinder vs scalar parameters
          let valueToConvert: number;
          if (isPerCylinder && Array.isArray(rawValue)) {
            // Per-cylinder array (PCylMax, MaxDeg) → average across cylinders
            valueToConvert = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
          } else {
            // Scalar value (TC-Av) → use directly
            valueToConvert = rawValue as number;
          }

          return {
            value: [point.RPM, convertValue(valueToConvert, paramName, units)],
            decimals: decimals,
          };
        });

        // Find peak for this parameter
        // MaxDeg: find MINIMUM (lower values = closer to detonation, dangerous if <14°)
        // PCylMax, TC-Av: find MAXIMUM
        let peak;
        const findMinimum = paramName === 'MaxDeg';

        if (isPerCylinder) {
          // For per-cylinder parameters, manually find peak/min from averaged data
          let extremeValue = findMinimum ? Infinity : -Infinity;
          let extremeRpm = 0;
          let extremeIndex = 0;
          calc.data!.forEach((point, idx) => {
            const rawValue = (point as any)[paramName];
            if (Array.isArray(rawValue)) {
              const avg = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
              const isExtreme = findMinimum ? (avg < extremeValue) : (avg > extremeValue);
              if (isExtreme) {
                extremeValue = avg;
                extremeRpm = point.RPM;
                extremeIndex = idx;
              }
            }
          });
          const isValid = findMinimum ? (extremeValue < Infinity) : (extremeValue > -Infinity);
          peak = isValid ? { value: extremeValue, rpm: extremeRpm, index: extremeIndex } : null;
        } else {
          // For scalar parameters, use findPeak directly (always finds max)
          // Note: TC-Av doesn't need minimum search
          peak = findPeak(calc.data!, paramName);
        }

        // Create series
        series.push({
          name: `${label} - ${paramName}`,
          type: 'line',
          yAxisIndex: yAxisIndex, // 0 (left), 1 (right 1), 2 (right 2)
          data: paramData,
          itemStyle: {
            color: color,
          },
          lineStyle: {
            color: color,
            width: 2,
            type: lineStyles[paramIndex],
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
              value: findMinimum
                ? `Min ${paramName}: ${peak.value.toFixed(1)} °ATDC at ${peak.rpm} RPM`
                : formatPeakValue(peak, paramName, units),
            }],
          } : undefined,
        });
      });
    });

    // Get unit labels for each axis
    const pcylMaxUnit = getParameterUnit('PCylMax', units);
    const tcAvUnit = getParameterUnit('TC-Av', units);
    const maxDegUnit = '°ATDC'; // MaxDeg: degrees After Top Dead Center

    // Fixed Y-axis ranges (converted based on unit system)
    // PCylMax: 20-120 bar (or psi) - shows MAX value
    // TC-Av: 1800-2800°C (or °F) - shows MAX value
    // MaxDeg: 0-30 °ATDC (no conversion) - shows MIN value (detonation risk if <14°)
    const pcylMaxMin = convertValue(20, 'PCylMax', units);
    const pcylMaxMax = convertValue(120, 'PCylMax', units);
    const tcAvMin = convertValue(1800, 'TC-Av', units);
    const tcAvMax = convertValue(2800, 'TC-Av', units);
    const maxDegMin = 0;
    const maxDegMax = 30;

    // Legend colors: colored in single calc mode, gray in comparison mode
    const legendColor1 = isSingleCalculation ? '#1f77b4' : '#666'; // PCylMax
    const legendColor2 = isSingleCalculation ? '#d62728' : '#666'; // TC-Av
    const legendColor3 = isSingleCalculation ? '#ff7f0e' : '#666'; // MaxDeg

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
            // PCylMax - solid line
            {
              type: 'line',
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor1, lineWidth: 2 },
            },
            {
              type: 'text',
              left: 30,
              top: -8,
              style: { text: 'PCylMax', fontSize: 14, fontWeight: 'bold', fill: legendColor1 },
            },
            // TCylMax - dashed line
            {
              type: 'line',
              left: 100,
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor2, lineWidth: 2, lineDash: [5, 5] },
            },
            {
              type: 'text',
              left: 130,
              top: -8,
              style: { text: 'TC-Av', fontSize: 14, fontWeight: 'bold', fill: legendColor2 },
            },
            // MaxDeg - dotted line
            {
              type: 'line',
              left: 200,
              shape: { x1: 0, y1: 0, x2: 25, y2: 0 },
              style: { stroke: legendColor3, lineWidth: 2, lineDash: [2, 2] },
            },
            {
              type: 'text',
              left: 230,
              top: -8,
              style: { text: 'MaxDeg', fontSize: 14, fontWeight: 'bold', fill: legendColor3 },
            },
          ],
        },
      ],
      xAxis: createXAxis('RPM', rpmMin, rpmMax, showGrid),
      // Triple Y-axis configuration with fixed ranges
      yAxis: [
        // Left axis: PCylMax (bar/psi) - 20-120 bar
        createYAxis(pcylMaxUnit, 'left', '#1f77b4', showGrid, pcylMaxMin, pcylMaxMax),
        // Right axis 1: TC-Av (°C/°F) - 1800-2800°C
        createYAxis(tcAvUnit, 'right', '#d62728', showGrid, tcAvMin, tcAvMax),
        // Right axis 2: MaxDeg (degrees) - 0-30 deg - offset 60px to the right
        {
          ...createYAxis(maxDegUnit, 'right', '#ff7f0e', showGrid, maxDegMin, maxDegMax) as YAXisComponentOption,
          offset: 60, // Shift second right axis 60px to the right
        },
      ] as YAXisComponentOption[],
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
        preset={3}
      />
    </div>
  );
}
