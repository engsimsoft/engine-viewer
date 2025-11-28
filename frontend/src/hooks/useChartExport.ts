import { useRef, useCallback } from 'react';
import type ReactECharts from 'echarts-for-react';
import { exportChartToPNG, exportChartToSVG, exportDOMToPNG, exportDOMToSVG } from '@/utils/export';

/**
 * Hook для экспорта графиков ECharts
 *
 * Предоставляет:
 * - ref для ReactECharts компонента
 * - ref для DOM контейнера (опционально, для экспорта с карточками)
 * - функции экспорта в PNG и SVG
 *
 * @param baseFilename - базовое имя файла (без расширения)
 * @param options - опции экспорта
 * @param options.exportFullDOM - если true, экспортирует весь DOM контейнер (график + карточки)
 *
 * @example
 * ```tsx
 * // Экспорт только графика (по умолчанию)
 * const { chartRef, handleExportPNG, handleExportSVG } = useChartExport('power-curve');
 *
 * // Экспорт графика + карточек
 * const { chartRef, containerRef, handleExportPNG, handleExportSVG } = useChartExport('power-curve', { exportFullDOM: true });
 *
 * return (
 *   <div ref={containerRef}>
 *     <ChartExportButtons onExportPNG={handleExportPNG} onExportSVG={handleExportSVG} />
 *     <ReactECharts ref={chartRef} option={chartOption} />
 *     <PeakValuesCards />
 *   </div>
 * );
 * ```
 */
export function useChartExport(
  baseFilename: string,
  options: { exportFullDOM?: boolean } = {}
) {
  const { exportFullDOM = false } = options;
  const chartRef = useRef<ReactECharts>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = useCallback(async () => {
    if (exportFullDOM) {
      // Экспорт всего DOM контейнера (график + карточки)
      await exportDOMToPNG(containerRef.current, `${baseFilename}.png`);
    } else {
      // Экспорт только графика ECharts
      const chartInstance = chartRef.current?.getEchartsInstance();
      if (chartInstance) {
        exportChartToPNG(chartInstance, `${baseFilename}.png`);
      }
    }
  }, [baseFilename, exportFullDOM]);

  const handleExportSVG = useCallback(async () => {
    if (exportFullDOM) {
      // Экспорт всего DOM контейнера (график + карточки)
      await exportDOMToSVG(containerRef.current, `${baseFilename}.svg`);
    } else {
      // Экспорт только графика ECharts
      const chartInstance = chartRef.current?.getEchartsInstance();
      if (chartInstance) {
        exportChartToSVG(chartInstance, `${baseFilename}.svg`);
      }
    }
  }, [baseFilename, exportFullDOM]);

  return {
    chartRef,
    containerRef,
    handleExportPNG,
    handleExportSVG,
  };
}
