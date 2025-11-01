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
  getPowerUnit,
  getTorqueUnit,
  getPressureUnit,
  getTemperatureUnit,
} from '@/lib/unitsConversion';
import { findPeak, formatPeakValue, getMarkerSymbol } from '@/lib/peakValues';
import { generateChartFilename } from '@/lib/exportFilename';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface ChartPreset4Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}

/**
 * Available parameters for visualization
 */
interface ParameterOption {
  id: string;
  label: string;
  getUnit: (units: 'si' | 'american' | 'hp') => string; // Dynamic unit based on settings
  isArray: boolean; // true if this is a per-cylinder array
}

const PARAMETER_OPTIONS: ParameterOption[] = [
  { id: 'P-Av', label: 'P-Av', getUnit: (u) => getPowerUnit(u), isArray: false },
  { id: 'Torque', label: 'Torque', getUnit: (u) => getTorqueUnit(u), isArray: false },
  { id: 'PCylMax', label: 'PCylMax', getUnit: (u) => getPressureUnit(u), isArray: true },
  { id: 'TCylMax', label: 'TCylMax', getUnit: (u) => getTemperatureUnit(u), isArray: true },
  { id: 'TUbMax', label: 'TUbMax', getUnit: (u) => getTemperatureUnit(u), isArray: true },
  { id: 'PurCyl', label: 'PurCyl', getUnit: () => '', isArray: true },
  { id: 'Deto', label: 'Deto', getUnit: () => '', isArray: true },
  { id: 'Convergence', label: 'Convergence', getUnit: () => '', isArray: false },
];

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
  const setSelectedParams = useAppStore((state) => state.setSelectedCustomParams);

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

    // Create series for each calculation and parameter
    const series: any[] = [];
    const legendData: string[] = [];

    readyCalculations.forEach((calc, calcIndex) => {
      const color = calc.color;
      const label = `${calc.projectName} → ${calc.calculationName}`;

      // Ensure data is loaded
      if (!calc.data || calc.data.length === 0) return;

      // Get marker symbol for this calculation
      const markerSymbol = getMarkerSymbol(calcIndex);

      selectedParams.forEach((paramId, paramIndex) => {
        const paramOption = PARAMETER_OPTIONS.find((p) => p.id === paramId);
        if (!paramOption) return;

        // Find peak value for this parameter
        const peak = findPeak(calc.data!, paramId);

        // Prepare data for parameter with units conversion
        const paramData = calc.data!.map((point) => {
          let rawValue: number;

          if (paramOption.isArray) {
            // For arrays, calculate average
            const arrayValue = (point as any)[paramId] as number[];
            rawValue = arrayValue.reduce((sum, val) => sum + val, 0) / arrayValue.length;
          } else {
            // For scalar values, use directly
            rawValue = (point as any)[paramId] as number;
          }

          // Temperature conversion: K → °C first, then apply units
          if (paramId === 'TCylMax' || paramId === 'TUbMax') {
            rawValue = rawValue - 273.15; // K → °C
          }

          // Apply units conversion
          const convertedValue = convertValue(rawValue, paramId, units);

          return {
            value: [point.RPM, convertedValue],
            decimals: decimals,
          };
        });

        // Line style: alternate solid and dashed
        const lineStyle = paramIndex % 2 === 0 ? 'solid' : 'dashed';

        // Prepare peak marker data with proper units conversion
        let peakMarkPoint = undefined;
        if (peak) {
          let peakValue = peak.value;

          // Temperature conversion: K → °C first for peak value
          if (paramId === 'TCylMax' || paramId === 'TUbMax') {
            peakValue = peakValue - 273.15; // K → °C
          }

          // Apply units conversion to peak value
          const convertedPeakValue = convertValue(peakValue, paramId, units);

          peakMarkPoint = {
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
              coord: [peak.rpm, convertedPeakValue],
              value: formatPeakValue(
                { ...peak, value: peakValue },
                paramId,
                units
              ),
            }],
          };
        }

        // Series for parameter
        series.push({
          name: `${label} - ${paramOption.label}`,
          type: 'line',
          yAxisIndex: 0,
          data: paramData,
          itemStyle: {
            color,
          },
          lineStyle: {
            color,
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
        legendData.push(`${label} - ${paramOption.label}`);
      });
    });

    // Determine Y axis name (only units)
    let yAxisName = 'Value';
    if (selectedParams.length === 1) {
      const param = PARAMETER_OPTIONS.find((p) => p.id === selectedParams[0]);
      if (param) {
        const unit = param.getUnit(units);
        yAxisName = unit || 'Value';  // Only unit, no parameter name
      }
    } else if (selectedParams.length > 1) {
      yAxisName = 'Value (mixed units)';
    }

    // Create dynamic line style legend based on selected parameters
    const legendChildren: any[] = [];
    let xOffset = 0;

    selectedParams.forEach((paramId, index) => {
      const param = PARAMETER_OPTIONS.find((p) => p.id === paramId);
      if (!param) return;

      const lineStyle = index % 2 === 0 ? 'solid' : 'dashed';
      const lineLength = 20;
      const labelOffset = 25;
      const spacing = param.label.length * 7 + 50; // Dynamic spacing based on label length

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
          stroke: '#666',
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
          text: param.label,
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#666',
        },
      });

      xOffset += spacing;
    });

    return {
      ...baseConfig,
      legend: {
        show: false,
      },
      // Dynamic line style legend at top center (same level as Y-axis labels)
      graphic: selectedParams.length > 1 ? [
        {
          type: 'group',
          left: 'center',
          top: 15, // Adjusted for reduced grid.top (50px instead of 80px)
          children: legendChildren,
        },
      ] : undefined,
      xAxis: createXAxis('RPM', rpmMin, rpmMax, showGrid),
      yAxis: createYAxis(yAxisName, 'left', '#2ca02c', showGrid),  // Only unit label
      series,
    };
  }, [readyCalculations, selectedParams, units, animation, showGrid, decimals]);

  // Parameter toggle handler
  const handleToggleParam = (paramId: string) => {
    if (selectedParams.includes(paramId)) {
      // Remove parameter (minimum 1 must remain)
      if (selectedParams.length > 1) {
        setSelectedParams(selectedParams.filter((id) => id !== paramId));
      }
    } else {
      // Add parameter
      setSelectedParams([...selectedParams, paramId]);
    }
  };

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
      {/* Parameter selector */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
          Select parameters to display
        </h4>
        <div className="flex flex-wrap gap-2">
          {PARAMETER_OPTIONS.map((param) => {
            const isSelected = selectedParams.includes(param.id);
            const unit = param.getUnit(units);
            return (
              <button
                key={param.id}
                onClick={() => handleToggleParam(param.id)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-all',
                  'border-2',
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/50'
                )}
              >
                {param.label}
                {unit && ` (${unit})`}
                {param.isArray && ' (avg)'}
              </button>
            );
          })}
        </div>
        {selectedParams.length > 1 && (
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Multiple parameters with different units selected.
            Ensure their scales are comparable for correct display.
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
