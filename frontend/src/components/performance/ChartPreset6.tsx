import { useMemo, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CalculationReference } from '@/types/v2';
import {
  getBaseChartConfig,
  createXAxis,
  createYAxis,
  PARAMETER_COLORS,
} from '@/lib/chartConfig';
import { cn } from '@/lib/utils';
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

interface ChartPreset6Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}

/**
 * Efficiency parameter metadata
 */
interface EfficiencyParameter {
  id: string;              // Parameter name in data (PurCyl, etc.)
  label: string;           // Display label ("PurCyl", "Ceff (VE)", etc.)
  color: string;           // Color from PARAMETER_COLORS
  lineStyle: 'solid' | 'dashed' | 'dotted' | 'dash-dot' | 'long-dash';
  lineDash?: number[];     // ECharts lineDash array
}

/**
 * Efficiency parameters configuration
 *
 * Based on .pou file column names with optional display labels for clarity.
 */
const EFFICIENCY_PARAMETERS: EfficiencyParameter[] = [
  {
    id: 'DRatio',
    label: 'DRatio',
    color: PARAMETER_COLORS.efficiency1,
    lineStyle: 'solid',
  },
  {
    id: 'PurCyl',
    label: 'PurCyl',
    color: PARAMETER_COLORS.efficiency2,
    lineStyle: 'dashed',
    lineDash: [5, 5],
  },
  {
    id: 'Seff',
    label: 'Seff',
    color: PARAMETER_COLORS.efficiency3,
    lineStyle: 'dotted',
    lineDash: [2, 2],
  },
  {
    id: 'Teff',
    label: 'Teff',
    color: PARAMETER_COLORS.efficiency4,
    lineStyle: 'dash-dot',
    lineDash: [10, 5, 2, 5],
  },
  {
    id: 'Ceff',
    label: 'Ceff (VE)',  // VE = Volumetric Efficiency (user-friendly label)
    color: PARAMETER_COLORS.efficiency5,
    lineStyle: 'long-dash',
    lineDash: [15, 5],
  },
];

/**
 * Chart Preset 6: Efficiency Parameters (Premium Interactive Version)
 *
 * Single-axis chart showing 5 efficiency parameters:
 * - DRatio (Delivery Ratio) - per-cylinder averaged
 * - PurCyl (Mixture Purity) - per-cylinder averaged
 * - Seff (Scavenging Efficiency) - per-cylinder averaged
 * - Teff (Trapping Efficiency) - per-cylinder averaged
 * - Ceff (VE) (Charging Efficiency / Volumetric Efficiency) - per-cylinder averaged
 *
 * Features:
 * - **Interactive legend**: Click to hide/show parameters
 * - Cross-project comparison support
 * - Per-cylinder averaging for all parameters
 * - 5 different line styles for distinction
 * - Color-coded calculations
 * - Apple-level UX (smooth transitions, accessibility)
 * - Loading/error states
 *
 * @example
 * ```tsx
 * const primary = useAppStore(state => state.primaryCalculation);
 * const comparisons = useAppStore(state => state.comparisonCalculations);
 * const allCalcs = [primary, ...comparisons].filter(Boolean);
 *
 * <ChartPreset6 calculations={allCalcs} />
 * ```
 */
export function ChartPreset6({ calculations }: ChartPreset6Props) {
  // Get units and chart settings from store
  const units = useAppStore((state) => state.units);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { animation, showGrid, decimals } = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(
    () => generateChartFilename(calculations, 6),
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

  // ================================================================
  // INTERACTIVE LEGEND STATE
  // ================================================================

  /**
   * Visibility state for each efficiency parameter
   * Default: all parameters visible
   */
  const [visibleParams, setVisibleParams] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    EFFICIENCY_PARAMETERS.forEach((param) => {
      initial[param.id] = true; // All visible by default
    });
    return initial;
  });

  /**
   * Toggle parameter visibility
   * Ensures at least 1 parameter remains visible
   */
  const handleToggleParam = (paramId: string) => {
    const currentlyVisible = Object.values(visibleParams).filter(Boolean).length;

    // Don't allow hiding if this is the last visible parameter
    if (visibleParams[paramId] && currentlyVisible === 1) {
      return; // Keep at least 1 parameter visible
    }

    setVisibleParams((prev) => ({
      ...prev,
      [paramId]: !prev[paramId],
    }));
  };

  // Generate ECharts configuration
  const chartOption = useMemo((): EChartsOption => {
    const baseConfig = getBaseChartConfig(animation);

    // Calculate RPM range from metadata
    const allRpmRanges = readyCalculations.map((calc) => calc.metadata.rpmRange);
    const rpmMin = Math.min(...allRpmRanges.map(([min]) => min));
    const rpmMax = Math.max(...allRpmRanges.map(([, max]) => max));

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

      // Create series for each efficiency parameter (only visible ones)
      EFFICIENCY_PARAMETERS.forEach((paramConfig) => {
        // Skip if parameter is hidden
        if (!visibleParams[paramConfig.id]) return;

        // Use parameter colors for single calculation, calc color for comparison
        const color = isSingleCalculation ? paramConfig.color : calc.color;

        // Check if parameter is per-cylinder (needs averaging)
        const param = PARAMETERS[paramConfig.id];
        const isPerCylinder = param?.perCylinder || false;

        // Prepare data with units conversion and per-cylinder averaging
        const paramData = calc.data!.map((point) => {
          // Get raw value
          const rawValue = (point as any)[paramConfig.id];

          // Average per-cylinder arrays (all efficiency parameters are arrays)
          let valueToConvert: number;
          if (isPerCylinder && Array.isArray(rawValue)) {
            // Average across cylinders
            valueToConvert = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
          } else {
            // Scalar value (shouldn't happen for efficiency params)
            valueToConvert = rawValue as number;
          }

          return {
            value: [point.RPM, convertValue(valueToConvert, paramConfig.id, units)],
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
            const rawValue = (point as any)[paramConfig.id];
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
          peak = findPeak(calc.data!, paramConfig.id);
        }

        // Create series
        series.push({
          name: `${label} - ${paramConfig.label}`,
          type: 'line',
          yAxisIndex: 0, // Single Y-axis (all efficiency parameters dimensionless)
          data: paramData,
          itemStyle: {
            color: color,
          },
          lineStyle: {
            color: color,
            width: 2,
            type: paramConfig.lineStyle === 'solid' ? 'solid' : 'dashed',
            // For custom patterns, use lineDash array
            ...(paramConfig.lineDash ? { lineDash: paramConfig.lineDash } : {}),
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
              coord: [peak.rpm, convertValue(peak.value, paramConfig.id, units)],
              value: formatPeakValue(peak, paramConfig.id, units),
            }],
          } : undefined,
        });
      });
    });

    // Y-axis label: Ratio (all parameters are dimensionless)
    const yAxisName = 'Ratio';

    return {
      ...baseConfig,
      legend: {
        show: false, // We use custom interactive legend
      },
      xAxis: createXAxis('RPM', rpmMin, rpmMax, showGrid),
      yAxis: createYAxis(yAxisName, 'left', '#1f77b4', showGrid),
      series,
    };
  }, [readyCalculations, visibleParams, units, animation, showGrid, decimals]);

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

  // Determine if we're in single calculation mode for legend colors
  const isSingleCalculation = readyCalculations.length === 1;

  return (
    <div className="w-full space-y-4">
      {/* Interactive Legend */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
          Efficiency Parameters
        </h4>
        <div className="flex flex-wrap gap-2 justify-center">
          {EFFICIENCY_PARAMETERS.map((param) => {
            const isVisible = visibleParams[param.id];
            const visibleCount = Object.values(visibleParams).filter(Boolean).length;
            const isLastVisible = isVisible && visibleCount === 1;

            return (
              <button
                key={param.id}
                onClick={() => handleToggleParam(param.id)}
                disabled={isLastVisible}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                  'border-2 hover:shadow-sm active:scale-[0.98]',
                  isVisible
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-border opacity-50',
                  isLastVisible && 'cursor-not-allowed opacity-100',
                  !isLastVisible && 'hover:border-primary/50'
                )}
                aria-label={`${isVisible ? 'Hide' : 'Show'} ${param.label}`}
                aria-pressed={isVisible}
              >
                {/* Line preview */}
                <svg width="20" height="2" className="flex-shrink-0">
                  <line
                    x1="0"
                    y1="1"
                    x2="20"
                    y2="1"
                    stroke={isSingleCalculation ? param.color : '#666'}
                    strokeWidth="2"
                    strokeDasharray={
                      param.lineStyle === 'dashed' ? '4 2' :
                      param.lineStyle === 'dotted' ? '1 1' :
                      param.lineStyle === 'dash-dot' ? '8 2 1 2' :
                      param.lineStyle === 'long-dash' ? '10 2' :
                      undefined
                    }
                  />
                </svg>

                {/* Label */}
                <span
                  style={{
                    color: isVisible && isSingleCalculation ? param.color : undefined
                  }}
                  className={cn(
                    !isVisible && 'line-through'
                  )}
                >
                  {param.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          💡 Click on parameters to hide/show them on the chart. At least 1 parameter must remain visible.
        </p>
      </div>

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
        preset={6}
      />
    </div>
  );
}
