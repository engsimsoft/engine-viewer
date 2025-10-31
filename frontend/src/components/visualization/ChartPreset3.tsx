import { useMemo, useState, useCallback } from 'react';
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
import { LiveCursorPanel } from './LiveCursorPanel';
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
  // Get units and decimals from store
  const units = useAppStore((state) => state.units);
  const decimals = useAppStore((state) => state.chartSettings.decimals);

  // Generate dynamic filename for export
  const exportFilename = useMemo(
    () => generateChartFilename(calculations, 3),
    [calculations]
  );

  // Hook для экспорта графика
  const { chartRef, handleExportPNG, handleExportSVG } = useChartExport(exportFilename);

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

    // Create series for each calculation
    const series: any[] = [];
    const legendData: string[] = [];

    readyCalculations.forEach((calc, calcIndex) => {
      const color = calc.color;
      const label = `${calc.projectName} → ${calc.calculationName}`;

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
          color,
        },
        lineStyle: {
          color,
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
            color: color,
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
          color,
        },
        lineStyle: {
          color,
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
            color: color,
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
      title: {
        text: 'Temperature (TCylMax & TUbMax)',
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
      yAxis: createYAxis(`Temperature (${tempUnit})`, 'left', '#d62728'),
      series,
    };
  }, [readyCalculations, units, decimals]);

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
          preset={3}
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
