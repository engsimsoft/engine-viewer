import { useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CalculationReference } from '@/types/v2';
import {
  getBaseChartConfig,
  createXAxis,
  createYAxis,
} from '@/lib/chartConfig';
import { cn } from '@/lib/utils';
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

interface ChartPreset4Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}


/**
 * Chart Preset 4: Custom Chart (v2.0 - Multi-Project Support)
 *
 * Allows user to select any parameters for visualization.
 * Multiple parameters can be selected simultaneously.
 *
 * For array parameters (per-cylinder data), shows average value.
 *
 * Features:
 * - Cross-project comparison support
 * - Units conversion for all parameters
 * - Dynamic parameter selection
 * - Loading/error states
 *
 * @example
 * ```tsx
 * const primary = useAppStore(state => state.primaryCalculation);
 * const comparisons = useAppStore(state => state.comparisonCalculations);
 * const allCalcs = [primary, ...comparisons].filter(Boolean);
 *
 * <ChartPreset4 calculations={allCalcs} />
 * ```
 */
export function ChartPreset4({ calculations }: ChartPreset4Props) {
  // Get units and chart settings from store
  const units = useAppStore((state) => state.units);
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { animation, showGrid, decimals } = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(
    () => generateChartFilename(calculations, 4),
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

  // Selected parameters state from Zustand store (shared with DataTable)
  const selectedParams = useAppStore((state) => state.selectedCustomParams);
  // toggleParameter and setCylinderSelection will be used in Phase 2 (Parameter Selector Modal)
  // const toggleParameter = useAppStore((state) => state.toggleParameter);
  // const setCylinderSelection = useAppStore((state) => state.setCylinderSelection);

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

    // Determine if we should use parameter colors (single calculation mode)
    const isSingleCalculation = readyCalculations.length === 1;

    // Parameter color palette (used for axes and lines in single calculation mode)
    const parameterColorPalette = ['#1f77b4', '#ff7f0e', '#d62728', '#2ca02c', '#9467bd'];

    // Collect unique units from selected parameters for multi-axis configuration
    // Also assign color to each parameter
    const uniqueUnits = new Map<string, number>(); // unit -> yAxisIndex
    const parameterColors = new Map<string, string>(); // paramId -> color

    selectedParams.forEach((selectedParam, index) => {
      const unit = getParameterUnit(selectedParam.id, units);
      if (unit && !uniqueUnits.has(unit)) {
        uniqueUnits.set(unit, uniqueUnits.size); // Assign next yAxisIndex
      }
      // Assign color to parameter (used for axes and single calc mode lines)
      parameterColors.set(selectedParam.id, parameterColorPalette[index % parameterColorPalette.length]);
    });

    // Create series for each calculation and parameter
    const series: any[] = [];
    const legendData: string[] = [];

    readyCalculations.forEach((calc, calcIndex) => {
      const label = `${calc.projectName} → ${calc.calculationName}`;

      // Ensure data is loaded
      if (!calc.data || calc.data.length === 0) return;

      // Get marker symbol for this calculation
      const markerSymbol = getMarkerSymbol(calcIndex);

      selectedParams.forEach((selectedParam, paramIndex) => {
        const { id: paramId, cylinder } = selectedParam;
        const param = PARAMETERS[paramId];
        if (!param) return;

        // Determine color: parameter color in single mode, calc color in comparison mode
        const lineColor = isSingleCalculation
          ? (parameterColors.get(paramId) || '#666')
          : calc.color;

        // Determine yAxisIndex for this parameter based on its unit
        const paramUnit = getParameterUnit(paramId, units);
        const yAxisIndex = paramUnit ? (uniqueUnits.get(paramUnit) ?? 0) : 0;

        // Find peak value for this parameter
        const peak = findPeak(calc.data!, paramId);

        // Prepare data for parameter with units conversion
        const paramData = calc.data!.map((point) => {
          let rawValue: number | undefined;
          const dataValue = (point as any)[paramId];

          // Skip if parameter is not available
          if (dataValue === undefined || dataValue === null) {
            return null;
          }

          if (param.perCylinder) {
            // Per-cylinder parameter
            if (!Array.isArray(dataValue) || dataValue.length === 0) {
              return null;
            }

            if (cylinder === 'avg' || cylinder === null) {
              // Average across all cylinders
              rawValue = dataValue.reduce((sum: number, val: number) => sum + val, 0) / dataValue.length;
            } else {
              // Specific cylinder (cylinder is 1-indexed, array is 0-indexed)
              const cylIndex = (cylinder as number) - 1;
              if (cylIndex >= 0 && cylIndex < dataValue.length) {
                rawValue = dataValue[cylIndex];
              } else {
                return null; // Cylinder index out of range
              }
            }
          } else {
            // Scalar parameter
            rawValue = dataValue as number;
          }

          // Skip if rawValue is still undefined
          if (rawValue === undefined || rawValue === null) {
            return null;
          }

          // Apply units conversion
          const convertedValue = convertValue(rawValue, paramId, units);

          return {
            value: [point.RPM, convertedValue],
            decimals: decimals,
          };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        // Line style: alternate solid and dashed
        const lineStyle = paramIndex % 2 === 0 ? 'solid' : 'dashed';

        // Prepare peak marker data with proper units conversion
        let peakMarkPoint = undefined;
        if (peak) {
          let peakValue = peak.value;

          // Apply units conversion to peak value (data already in °C for temperatures)
          const convertedPeakValue = convertValue(peakValue, paramId, units);

          peakMarkPoint = {
            symbol: markerSymbol,
            symbolSize: 20,
            itemStyle: {
              color: lineColor,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false, // Hide default label, use tooltip instead
            },
            data: [{
              coord: [peak.rpm, convertedPeakValue],
              value: formatPeakValue(
                { ...peak, value: peakValue },
                paramId,
                units
              ),
            }],
          };
        }

        // Build series name with cylinder selection
        let seriesName = `${label} - ${param.name}`;
        if (param.perCylinder) {
          if (cylinder === 'avg' || cylinder === null) {
            seriesName += ' (Avg)';
          } else {
            seriesName += ` (Cyl${cylinder})`;
          }
        }

        // Series for parameter
        series.push({
          name: seriesName,
          type: 'line',
          yAxisIndex: yAxisIndex, // Dynamic yAxisIndex based on parameter unit
          data: paramData,
          itemStyle: {
            color: lineColor,
          },
          lineStyle: {
            color: lineColor,
            width: 2,
            type: lineStyle,
          },
          symbol: 'circle',
          symbolSize: 6,
          smooth: false,
          emphasis: {
            focus: 'series',
          },
          // Peak marker
          markPoint: peakMarkPoint,
        });

        // Add to legend
        legendData.push(seriesName);
      });
    });

    // Create dynamic Y-axis array for each unique unit (following ChartPreset3 pattern)
    // Axes use parameter colors (first parameter with this unit)
    const yAxisArray: any[] = [];
    const unitEntries = Array.from(uniqueUnits.entries()); // [[unit, index], ...]

    // Map unit to parameter color (find first parameter with this unit)
    const unitToColor = new Map<string, string>();
    selectedParams.forEach((selectedParam) => {
      const unit = getParameterUnit(selectedParam.id, units);
      if (unit && !unitToColor.has(unit)) {
        unitToColor.set(unit, parameterColors.get(selectedParam.id) || '#666');
      }
    });

    unitEntries.forEach(([unit, index]) => {
      const position = index === 0 ? 'left' : 'right';
      const color = unitToColor.get(unit) || '#666';

      if (index === 0) {
        // First axis (left)
        yAxisArray.push(createYAxis(unit, position, color, showGrid));
      } else if (index === 1) {
        // Second axis (right, no offset)
        yAxisArray.push(createYAxis(unit, position, color, showGrid));
      } else {
        // Third+ axes (right, with offset like ChartPreset3)
        const offset = (index - 1) * 60; // 60px offset for each additional right axis
        yAxisArray.push({
          ...createYAxis(unit, position, color, showGrid),
          offset: offset,
        });
      }
    });

    // Create dynamic line style legend based on selected parameters
    // Single calc mode: colored (parameter colors), Comparison mode: gray
    const legendChildren: any[] = [];
    let xOffset = 0;

    selectedParams.forEach((selectedParam, index) => {
      const param = PARAMETERS[selectedParam.id];
      if (!param) return;

      // Line style: alternate solid and dashed
      const lineStyle = index % 2 === 0 ? 'solid' : 'dashed';
      const lineLength = 20;
      const labelOffset = 25;
      const spacing = param.name.length * 7 + 50; // Dynamic spacing based on label length

      // Legend color: parameter color in single mode, gray in comparison mode
      const legendColor = isSingleCalculation
        ? (parameterColors.get(selectedParam.id) || '#666')
        : '#666';

      // Line symbol
      legendChildren.push({
        type: 'line',
        left: xOffset,
        shape: {
          x1: 0,
          y1: 0,
          x2: lineLength,
          y2: 0,
        },
        style: {
          stroke: legendColor,
          lineWidth: 2,
          lineDash: lineStyle === 'dashed' ? [5, 5] : undefined,
        },
      });

      // Label
      legendChildren.push({
        type: 'text',
        left: xOffset + labelOffset,
        top: -8,
        style: {
          text: param.name,
          fontSize: 14,
          fontWeight: 'bold',
          fill: legendColor,
        },
      });

      xOffset += spacing;
    });

    return {
      ...baseConfig,
      legend: {
        show: false,
      },
      // Dynamic line style legend at top center (always shown, same level as Y-axis labels)
      graphic: [
        {
          type: 'group',
          left: 'center',
          top: 15, // Adjusted for reduced grid.top (50px instead of 80px)
          children: legendChildren,
        },
      ],
      xAxis: createXAxis('RPM', rpmMin, rpmMax, showGrid),
      yAxis: yAxisArray, // Dynamic multi-axis configuration (following ChartPreset3 pattern)
      series,
    };
  }, [readyCalculations, selectedParams, units, animation, showGrid, decimals]);

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
      {/* Parameter selector button - Opens modal (Phase 2) */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // TODO Phase 2: Open ParameterSelectorModal
              console.log('Open parameter selector modal');
            }}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-semibold transition-all',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'border-2 border-primary'
            )}
          >
            Select Parameters ({selectedParams.length} selected)
          </button>

          {/* Show selected parameter names */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {selectedParams.map((selectedParam, index) => {
              const param = PARAMETERS[selectedParam.id];
              if (!param) return null;
              return (
                <span key={selectedParam.id} className="font-medium">
                  {param.name}
                  {index < selectedParams.length - 1 && ','}
                </span>
              );
            })}
          </div>
        </div>

        {selectedParams.length > 1 && (
          <p className="text-xs text-muted-foreground">
            ⚠️ Multiple parameters with different units
          </p>
        )}
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
        preset={4}
        selectedParams={selectedParams}
      />
    </div>
  );
}
