import { useRef } from 'react';
import type ReactECharts from 'echarts-for-react';
import { exportChartToPNG, exportChartToSVG } from '@/utils/export';

/**
 * Hook для экспорта графиков ECharts
 *
 * Предоставляет:
 * - ref для ReactECharts компонента
 * - функции экспорта в PNG и SVG
 *
 * @param baseFilename - базовое имя файла (без расширения)
 *
 * @example
 * ```tsx
 * const { chartRef, handleExportPNG, handleExportSVG } = useChartExport('power-curve');
 *
 * return (
 *   <>
 *     <ChartExportButtons onExportPNG={handleExportPNG} onExportSVG={handleExportSVG} />
 *     <ReactECharts ref={chartRef} option={chartOption} />
 *   </>
 * );
 * ```
 */
export function useChartExport(baseFilename: string) {
  const chartRef = useRef<ReactECharts>(null);

  const handleExportPNG = () => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      exportChartToPNG(chartInstance, `${baseFilename}.png`);
    }
  };

  const handleExportSVG = () => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      exportChartToSVG(chartInstance, `${baseFilename}.svg`);
    }
  };

  return {
    chartRef,
    handleExportPNG,
    handleExportSVG,
  };
}
