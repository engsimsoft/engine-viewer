import { useMemo, useState, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CalculationReference } from '@/types/v2';
import {
  getBaseChartConfig,
  createXAxis,
  createYAxis,
} from '@/lib/chartConfig';
import { cn } from '@/lib/utils';
import { useChartExport } from '@/hooks/useChartExport';
import { ChartExportButtons } from './ChartExportButtons';
import { LiveCursorPanel } from './LiveCursorPanel';
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

/**
 * Get dynamic unit label for a parameter
 */
const getParameterUnit = (paramId: string, units: 'si' | 'american' | 'hp'): string => {
  switch (paramId) {
    case 'P-Av': return getPowerUnit(units);
    case 'Torque': return getTorqueUnit(units);
    case 'PCylMax': return getPressureUnit(units);
    case 'TCylMax':
    case 'TUbMax': return getTemperatureUnit(units);
    case 'PurCyl':
    case 'Deto':
    case 'Convergence': return '';
    default: return '';
  }
};

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
  // Get units and decimals from store
  const units = useAppStore((state) => state.units);
  const decimals = useAppStore((state) => state.chartSettings.decimals);

  // Generate dynamic filename for export
  const exportFilename = useMemo(
    () => generateChartFilename(calculations, 4),
    [calculations]
  );

  // Hook для экспорта графика
  const { chartRef, handleExportPNG, handleExportSVG } = useChartExport(exportFilename);

  // Selected parameters state (default: P-Av and Torque)
  const [selectedParams, setSelectedParams] = useState<string[]>([
    'P-Av',
    'Torque',
  ]);

  // Live cursor state
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [cursorRpm, setCursorRpm] = useState<number | null>(null);
  const [isCursorVisible, setIsCursorVisible] = useState(false);

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

    // Determine Y axis name and units
    let yAxisName = 'Value';
    if (selectedParams.length === 1) {
      const param = PARAMETER_OPTIONS.find((p) => p.id === selectedParams[0]);
      if (param) {
        const unit = param.getUnit(units);
        yAxisName = unit ? `${param.label} (${unit})` : param.label;
      }
    } else if (selectedParams.length > 1) {
      yAxisName = 'Value (mixed units)';
    }

    return {
      ...baseConfig,
      title: {
        text: 'Custom Chart',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      legend: {
        show: false,
      },
      xAxis: createXAxis('RPM', rpmMin, rpmMax),
      yAxis: createYAxis(yAxisName, 'left', '#2ca02c'),
      series,
    };
  }, [readyCalculations, selectedParams, units, decimals]);

  // Parameter toggle handler
  const handleToggleParam = (paramId: string) => {
    setSelectedParams((prev) => {
      if (prev.includes(paramId)) {
        // Remove parameter (minimum 1 must remain)
        return prev.length > 1 ? prev.filter((id) => id !== paramId) : prev;
      } else {
        // Add parameter
        return [...prev, paramId];
      }
    });
  };

  // Mouse event handlers for live cursor
  const handleMouseMove = useCallback((params: any) => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (!chartInstance || !params.event) return;

    const event = params.event.event;
    setCursorPosition({ x: event.clientX, y: event.clientY });

    const pointInGrid = [params.event.offsetX, params.event.offsetY];
    const rpm = chartInstance.convertFromPixel({ seriesIndex: 0 }, pointInGrid)?.[0];

    if (rpm && typeof rpm === 'number') {
      setCursorRpm(Math.round(rpm));
      setIsCursorVisible(true);
    }
  }, [chartRef]);

  const handleMouseOut = useCallback(() => {
    setIsCursorVisible(false);
    setCursorPosition(null);
    setCursorRpm(null);
  }, []);

  const onEvents = useMemo(() => ({
    'mousemove': handleMouseMove,
    'globalout': handleMouseOut,
  }), [handleMouseMove, handleMouseOut]);

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

      {/* Chart with live cursor */}
      <div className="relative">
        <ReactECharts
          ref={chartRef}
          option={chartOption}
          style={{ height: '600px', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          theme="light"
          onEvents={onEvents}
        />

        {/* Live Cursor Panel */}
        <LiveCursorPanel
          calculations={readyCalculations}
          currentRpm={cursorRpm}
          isVisible={isCursorVisible}
          position={cursorPosition}
          preset={4}
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
