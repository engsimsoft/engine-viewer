import { useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { PVDData } from '@/types';
import { getBaseChartConfig } from '@/lib/chartConfig';
import { useAppStore } from '@/stores/appStore';
import { useChartExport as useChartExportHook } from '@/hooks/useChartExport';
import { useChartExport } from '@/contexts/ChartExportContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

interface PVDiagramChartProps {
  /** Parsed PVD data (metadata + 721 data points) */
  data: PVDData | null;
  /** Project name for export filename */
  projectName: string;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Retry callback for error state */
  onRetry?: () => void;
  /** Selected cylinder index (0-based, null = show all) */
  selectedCylinder?: number | null;
}

/**
 * Cylinder color palette (8 colors for 8-cylinder engines)
 * High-contrast colors for visibility
 */
const CYLINDER_COLORS = [
  '#e74c3c',  // Cylinder 1 - Red
  '#3498db',  // Cylinder 2 - Blue
  '#2ecc71',  // Cylinder 3 - Green
  '#f39c12',  // Cylinder 4 - Orange
  '#9b59b6',  // Cylinder 5 - Purple
  '#1abc9c',  // Cylinder 6 - Turquoise
  '#e67e22',  // Cylinder 7 - Carrot
  '#34495e',  // Cylinder 8 - Dark Gray
];

/**
 * PV-Diagram Chart Component
 *
 * Displays P-V (Pressure-Volume) diagram for engine cylinders:
 * - X-axis: Volume (cm³)
 * - Y-axis: Pressure (bar)
 * - One series per cylinder
 * - Legend for cylinder selection
 * - Zoom/pan support
 *
 * @example
 * ```tsx
 * const { data, loading, error } = usePVDData(projectId, 'V8_2000.pvd');
 * <PVDiagramChart data={data} loading={loading} error={error} />
 * ```
 */
export function PVDiagramChart({
  data,
  projectName,
  loading = false,
  error = null,
  onRetry,
  selectedCylinder = null,
}: PVDiagramChartProps) {
  // Get chart settings from store
  const chartSettings = useAppStore((state) => state.chartSettings);
  const { animation, showGrid } = chartSettings;

  // Generate dynamic filename for export
  const exportFilename = useMemo(() => {
    const rpm = data?.metadata.rpm || 'unknown';
    const cylinder = selectedCylinder !== null ? `_Cyl${selectedCylinder + 1}` : '_AllCyl';
    return `${projectName}_PVDiagram_${rpm}RPM${cylinder}`;
  }, [projectName, data, selectedCylinder]);

  // Hook for chart export (local)
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

  // Generate ECharts configuration
  const chartOption = useMemo((): EChartsOption => {
    if (!data) {
      return {};
    }

    const baseConfig = getBaseChartConfig(animation);
    const numCylinders = data.metadata.cylinders;

    // Determine which cylinders to show
    const cylindersToShow = selectedCylinder !== null && selectedCylinder !== undefined
      ? [selectedCylinder]
      : Array.from({ length: numCylinders }, (_, i) => i);

    // Create series for each cylinder
    const series: any[] = [];
    const legendData: string[] = [];

    cylindersToShow.forEach((cylinderIndex) => {
      if (cylinderIndex >= numCylinders) return;

      // Extract Volume and Pressure data for this cylinder
      const seriesData = data.data.map((point) => {
        const cylinderData = point.cylinders[cylinderIndex];
        return [
          cylinderData.volume,   // X: Volume (cm³)
          cylinderData.pressure, // Y: Pressure (bar)
        ];
      });

      const cylinderNum = cylinderIndex + 1;
      const color = CYLINDER_COLORS[cylinderIndex % CYLINDER_COLORS.length];

      series.push({
        name: `Cylinder ${cylinderNum}`,
        type: 'line',
        data: seriesData,
        itemStyle: {
          color: color,
        },
        lineStyle: {
          color: color,
          width: 2,
        },
        symbol: 'circle',
        symbolSize: 4,
        smooth: false,
        emphasis: {
          focus: 'series',
        },
        // Show area under curve for better visualization
        areaStyle: {
          color: color,
          opacity: 0.1,
        },
      });

      legendData.push(`Cylinder ${cylinderNum}`);
    });

    // Calculate Volume and Pressure ranges
    let minVolume = Infinity;
    let maxVolume = -Infinity;
    let minPressure = Infinity;
    let maxPressure = -Infinity;

    data.data.forEach((point) => {
      cylindersToShow.forEach((cylinderIndex) => {
        const cylinderData = point.cylinders[cylinderIndex];
        minVolume = Math.min(minVolume, cylinderData.volume);
        maxVolume = Math.max(maxVolume, cylinderData.volume);
        minPressure = Math.min(minPressure, cylinderData.pressure);
        maxPressure = Math.max(maxPressure, cylinderData.pressure);
      });
    });

    // Add 5% padding to axes
    const volumePadding = (maxVolume - minVolume) * 0.05;
    const pressurePadding = (maxPressure - minPressure) * 0.05;

    return {
      ...baseConfig,
      title: {
        text: `P-V Diagram - ${data.metadata.rpm} RPM`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      legend: {
        data: legendData,
        top: 40,
        left: 'center',
        textStyle: {
          fontSize: 12,
        },
        itemWidth: 30,
        itemHeight: 14,
        icon: 'roundRect',
      },
      xAxis: {
        type: 'value',
        name: 'Volume (cm³)',
        nameLocation: 'middle',
        nameGap: 35,
        nameTextStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        min: minVolume - volumePadding,
        max: maxVolume + volumePadding,
        axisLine: {
          lineStyle: {
            color: '#666',
          },
        },
        axisLabel: {
          fontSize: 11,
          color: '#666',
        },
        splitLine: {
          show: showGrid,
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Pressure (bar)',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        min: minPressure - pressurePadding,
        max: maxPressure + pressurePadding,
        axisLine: {
          lineStyle: {
            color: '#666',
          },
        },
        axisLabel: {
          fontSize: 11,
          color: '#666',
        },
        splitLine: {
          show: showGrid,
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#505765',
          },
        },
        backgroundColor: 'rgba(50, 50, 50, 0.95)',
        borderColor: '#333',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';

          const point = params[0];
          const volume = point.value[0].toFixed(2);
          const pressure = point.value[1].toFixed(2);

          let result = `<div style="font-weight: bold; margin-bottom: 8px;">
            Volume: ${volume} cm³<br/>
            Pressure: ${pressure} bar
          </div>`;

          params.forEach((param: any) => {
            const marker = param.marker;
            const seriesName = param.seriesName;
            const pressureValue = param.value[1].toFixed(2);

            result += `
              <div style="margin: 4px 0;">
                ${marker}
                <span style="display: inline-block; min-width: 100px;">${seriesName}:</span>
                <span style="font-weight: bold;">${pressureValue} bar</span>
              </div>
            `;
          });

          return result;
        },
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0],
          yAxisIndex: [0],
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
        },
        {
          type: 'slider',
          xAxisIndex: [0],
          bottom: 10,
          height: 20,
          borderColor: '#ccc',
        },
      ],
      series,
    };
  }, [data, animation, showGrid, selectedCylinder]);

  // Loading state
  if (loading) {
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
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  // Empty state - no data
  if (!data) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Select RPM to display PV-Diagram
          </p>
          <p className="text-sm text-muted-foreground">
            Use the left panel to select an RPM point
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
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
    </div>
  );
}
