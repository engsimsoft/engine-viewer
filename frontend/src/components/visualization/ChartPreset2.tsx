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
  convertPressure,
  getPressureUnit,
} from '@/lib/unitsConversion';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface ChartPreset2Props {
  /** Array of CalculationReference from Zustand store (primary + comparisons) */
  calculations: CalculationReference[];
}

/**
 * Chart Preset 2: Cylinder Pressure (v2.0 - Multi-Project Support)
 *
 * Single-axis chart:
 * - Y axis: PCylMax (Cylinder Pressure)
 * - X axis: RPM
 * - Separate lines for each cylinder of each calculation
 *
 * Example: If 2 calculations are selected and engine has 4 cylinders,
 * the chart will show 8 lines:
 * - ProjectA → $1 - Cyl 1, ProjectA → $1 - Cyl 2, ProjectA → $1 - Cyl 3, ProjectA → $1 - Cyl 4
 * - ProjectB → $2 - Cyl 1, ProjectB → $2 - Cyl 2, ProjectB → $2 - Cyl 3, ProjectB → $2 - Cyl 4
 *
 * Features:
 * - Cross-project comparison support
 * - Units conversion (bar/psi)
 * - Color-coded calculations with different line styles per cylinder
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
  // Hook для экспорта графика
  const { chartRef, handleExportPNG, handleExportSVG } = useChartExport('cylinder-pressure-chart');

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

    readyCalculations.forEach((calc) => {
      const color = calc.color;
      const label = `${calc.projectName} → ${calc.calculationName}`;

      // Ensure data is loaded
      if (!calc.data || calc.data.length === 0) return;

      // Get number of cylinders from metadata
      const numCylinders = calc.metadata.cylinders;

      // Create series for each cylinder
      for (let cylIndex = 0; cylIndex < numCylinders; cylIndex++) {
        const cylinderNumber = cylIndex + 1;

        // Prepare pressure data with units conversion
        const pressureData = calc.data.map((point) => ({
          value: [point.RPM, convertPressure(point.PCylMax[cylIndex], units)],
        }));

        // Line style: solid for cylinder 1, different dashes for others
        const lineStyle =
          cylIndex === 0
            ? 'solid'
            : cylIndex === 1
            ? 'dashed'
            : cylIndex === 2
            ? 'dotted'
            : 'solid';

        // Cylinder pressure series
        series.push({
          name: `${label} - Cyl ${cylinderNumber}`,
          type: 'line',
          yAxisIndex: 0,
          data: pressureData,
          itemStyle: {
            color,
          },
          lineStyle: {
            color,
            width: 2,
            type: lineStyle,
          },
          symbol: 'circle',
          symbolSize: 4,
          smooth: false,
          emphasis: {
            focus: 'series',
          },
        });

        // Add to legend
        legendData.push(`${label} - Cyl ${cylinderNumber}`);
      }
    });

    // Get unit label
    const pressureUnit = getPressureUnit(units);

    return {
      ...baseConfig,
      title: {
        text: 'PCylMax (Cylinder Pressure)',
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
        type: 'scroll', // Scroll if many legends
      },
      xAxis: createXAxis('RPM', rpmMin, rpmMax),
      yAxis: createYAxis(`PCylMax (${pressureUnit})`, 'left', '#1f77b4'),
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
