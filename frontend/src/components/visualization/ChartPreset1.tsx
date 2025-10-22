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

interface ChartPreset1Props {
  calculations: Calculation[];
  selectedIds: string[];
}

/**
 * Пресет 1: Мощность и крутящий момент
 *
 * График с двумя осями Y:
 * - Левая ось: P-Av (Средняя мощность, кВт)
 * - Правая ось: Torque (Крутящий момент, Н·м)
 * - Ось X: RPM (обороты)
 *
 * @example
 * ```tsx
 * <ChartPreset1
 *   calculations={project.calculations}
 *   selectedIds={['$1', '$2']}
 * />
 * ```
 */
export function ChartPreset1({ calculations, selectedIds }: ChartPreset1Props) {
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

    selectedCalculations.forEach((calc, index) => {
      const color = getCalculationColor(index);
      const calculationName = calc.name;

      // Подготовка данных для P-Av (мощность)
      const powerData = calc.dataPoints.map((point) => ({
        value: [point.RPM, point['P-Av']],
        unit: 'кВт',
      }));

      // Подготовка данных для Torque (момент)
      const torqueData = calc.dataPoints.map((point) => ({
        value: [point.RPM, point.Torque],
        unit: 'Н·м',
      }));

      // Серия для мощности (левая ось Y)
      series.push({
        name: `${calculationName} - P-Av`,
        type: 'line',
        yAxisIndex: 0, // Левая ось
        data: powerData,
        itemStyle: {
          color,
        },
        lineStyle: {
          color,
          width: 2,
        },
        symbol: 'circle',
        symbolSize: 6,
        smooth: false,
        emphasis: {
          focus: 'series',
        },
      });

      // Серия для момента (правая ось Y)
      series.push({
        name: `${calculationName} - Torque`,
        type: 'line',
        yAxisIndex: 1, // Правая ось
        data: torqueData,
        itemStyle: {
          color,
        },
        lineStyle: {
          color,
          width: 2,
          type: 'dashed', // Пунктирная линия для момента
        },
        symbol: 'diamond',
        symbolSize: 6,
        smooth: false,
        emphasis: {
          focus: 'series',
        },
      });

      // Добавляем в легенду
      legendData.push(`${calculationName} - P-Av`);
      legendData.push(`${calculationName} - Torque`);
    });

    return {
      ...baseConfig,
      title: {
        text: 'P-Av & Torque',
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
      yAxis: [
        createYAxis('P-Av (кВт)', 'left', '#1f77b4'),
        createYAxis('Torque (Н·м)', 'right', '#ff7f0e'),
      ] as any,
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
