import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { Calculation } from '@/types';
import {
  getBaseChartConfig,
  createXAxis,
  createYAxis,
  getCalculationColor,
} from '@/lib/chartConfig';

interface ChartPreset3Props {
  calculations: Calculation[];
  selectedIds: string[];
}

/**
 * Пресет 3: Temperature (TCylMax & TUbMax)
 *
 * График с одной осью Y:
 * - Ось Y: Temperature (K)
 * - Ось X: RPM
 * - Две линии для каждого расчёта:
 *   1. TCylMax (средняя по всем цилиндрам) - сплошная линия
 *   2. TUbMax (средняя по всем цилиндрам) - пунктирная линия
 *
 * Пример: Если выбрано 2 расчёта ($1, $2), то на графике будет 4 линии:
 * - $1 - TCylMax
 * - $1 - TUbMax
 * - $2 - TCylMax
 * - $2 - TUbMax
 *
 * @example
 * ```tsx
 * <ChartPreset3
 *   calculations={project.calculations}
 *   selectedIds={['$1', '$2']}
 * />
 * ```
 */
export function ChartPreset3({ calculations, selectedIds }: ChartPreset3Props) {
  // Фильтруем только выбранные расчёты
  const selectedCalculations = useMemo(() => {
    return calculations.filter((calc) => selectedIds.includes(calc.id));
  }, [calculations, selectedIds]);

  // Генерируем конфигурацию ECharts
  const chartOption = useMemo((): EChartsOption => {
    const baseConfig = getBaseChartConfig();

    // Создаём серии данных для каждого выбранного расчёта
    const series: any[] = [];
    const legendData: string[] = [];

    selectedCalculations.forEach((calc, calcIndex) => {
      const color = getCalculationColor(calcIndex);
      const calculationName = calc.name;

      // Подготовка данных для TCylMax (средняя температура в цилиндре)
      const tCylMaxData = calc.dataPoints.map((point) => {
        const avgTemp =
          point.TCylMax.reduce((sum, temp) => sum + temp, 0) /
          point.TCylMax.length;
        return {
          value: [point.RPM, avgTemp],
          unit: 'K',
        };
      });

      // Подготовка данных для TUbMax (средняя температура выпускных газов)
      const tUbMaxData = calc.dataPoints.map((point) => {
        const avgTemp =
          point.TUbMax.reduce((sum, temp) => sum + temp, 0) /
          point.TUbMax.length;
        return {
          value: [point.RPM, avgTemp],
          unit: 'K',
        };
      });

      // Серия для TCylMax (температура в цилиндре) - сплошная линия
      series.push({
        name: `${calculationName} - TCylMax`,
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
      });

      // Серия для TUbMax (температура выпускных газов) - пунктирная линия
      series.push({
        name: `${calculationName} - TUbMax`,
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
      });

      // Добавляем в легенду
      legendData.push(`${calculationName} - TCylMax`);
      legendData.push(`${calculationName} - TUbMax`);
    });

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
      xAxis: createXAxis('RPM'),
      yAxis: createYAxis('Temperature (K)', 'left', '#d62728'),
      series,
    };
  }, [selectedCalculations]);

  // Если нет выбранных расчётов, показываем placeholder
  if (selectedCalculations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted/20 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Выберите расчёты для отображения графика
          </p>
          <p className="text-sm text-muted-foreground">
            Используйте чекбоксы слева для выбора расчётов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ReactECharts
        option={chartOption}
        style={{ height: '600px', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
        theme="light"
      />
    </div>
  );
}
