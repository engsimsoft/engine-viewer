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

interface ChartPreset2Props {
  calculations: Calculation[];
  selectedIds: string[];
}

/**
 * Пресет 2: Давление в цилиндрах
 *
 * График с одной осью Y:
 * - Ось Y: PCylMax (Максимальное давление в цилиндре, бар)
 * - Ось X: RPM (обороты)
 * - Отдельные линии для каждого цилиндра каждого расчёта
 *
 * Пример: Если выбрано 2 расчёта ($1, $2) и двигатель 4-цилиндровый,
 * то на графике будет 8 линий:
 * - $1 - Цилиндр 1, $1 - Цилиндр 2, $1 - Цилиндр 3, $1 - Цилиндр 4
 * - $2 - Цилиндр 1, $2 - Цилиндр 2, $2 - Цилиндр 3, $2 - Цилиндр 4
 *
 * @example
 * ```tsx
 * <ChartPreset2
 *   calculations={project.calculations}
 *   selectedIds={['$1', '$2']}
 * />
 * ```
 */
export function ChartPreset2({ calculations, selectedIds }: ChartPreset2Props) {
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

      // Определяем количество цилиндров из первой точки данных
      const numCylinders = calc.dataPoints[0]?.PCylMax?.length || 0;

      // Создаём серию для каждого цилиндра
      for (let cylIndex = 0; cylIndex < numCylinders; cylIndex++) {
        const cylinderNumber = cylIndex + 1;

        // Подготовка данных для PCylMax конкретного цилиндра
        const pressureData = calc.dataPoints.map((point) => ({
          value: [point.RPM, point.PCylMax[cylIndex]],
          unit: 'бар',
        }));

        // Стиль линии: сплошная для цилиндра 1, разные пунктиры для остальных
        const lineStyle =
          cylIndex === 0
            ? 'solid'
            : cylIndex === 1
            ? 'dashed'
            : cylIndex === 2
            ? 'dotted'
            : 'solid';

        // Серия для давления в цилиндре
        series.push({
          name: `${calculationName} - Цил. ${cylinderNumber}`,
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

        // Добавляем в легенду
        legendData.push(`${calculationName} - Цил. ${cylinderNumber}`);
      }
    });

    return {
      ...baseConfig,
      title: {
        text: 'Давление в цилиндрах',
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
        type: 'scroll', // Скролл если много легенд
      },
      xAxis: createXAxis('Обороты (RPM)'),
      yAxis: createYAxis('Давление (бар)', 'left', '#1f77b4'),
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
