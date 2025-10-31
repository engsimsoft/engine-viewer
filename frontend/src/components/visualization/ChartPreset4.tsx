import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { Calculation } from '@/types';
import {
  getBaseChartConfig,
  createXAxis,
  createYAxis,
  getCalculationColor,
  calculateRpmRange,
} from '@/lib/chartConfig';
import { cn } from '@/lib/utils';
import { useChartExport } from '@/hooks/useChartExport';
import { ChartExportButtons } from './ChartExportButtons';

interface ChartPreset4Props {
  calculations: Calculation[];
  selectedIds: string[];
}

/**
 * Доступные параметры для визуализации
 */
interface ParameterOption {
  id: string;
  label: string;
  unit: string;
  isArray: boolean; // true если это массив (по цилиндрам)
}

const PARAMETER_OPTIONS: ParameterOption[] = [
  { id: 'P-Av', label: 'P-Av', unit: 'кВт', isArray: false },
  { id: 'Torque', label: 'Torque', unit: 'Н·м', isArray: false },
  { id: 'PCylMax', label: 'PCylMax', unit: 'бар', isArray: true },
  { id: 'TCylMax', label: 'TCylMax', unit: 'K', isArray: true },
  { id: 'TUbMax', label: 'TUbMax', unit: 'K', isArray: true },
  { id: 'PurCyl', label: 'PurCyl', unit: '', isArray: true },
  { id: 'Deto', label: 'Deto', unit: '', isArray: true },
  { id: 'Convergence', label: 'Convergence', unit: '', isArray: false },
];

/**
 * Пресет 4: Custom Chart
 *
 * Позволяет пользователю выбрать любые параметры для отображения.
 * Можно выбрать несколько параметров одновременно.
 *
 * Для массивов (параметры по цилиндрам) отображается среднее значение.
 *
 * @example
 * ```tsx
 * <ChartPreset4
 *   calculations={project.calculations}
 *   selectedIds={['$1', '$2']}
 * />
 * ```
 */
export function ChartPreset4({ calculations, selectedIds }: ChartPreset4Props) {
  // Hook для экспорта графика
  const { chartRef, handleExportPNG, handleExportSVG } = useChartExport('custom-params-chart');

  // Состояние выбранных параметров (по умолчанию P-Av и Torque)
  const [selectedParams, setSelectedParams] = useState<string[]>([
    'P-Av',
    'Torque',
  ]);

  // Фильтруем только выбранные расчёты
  const selectedCalculations = useMemo(() => {
    return calculations.filter((calc) => selectedIds.includes(calc.id));
  }, [calculations, selectedIds]);

  // Генерируем конфигурацию ECharts
  const chartOption = useMemo((): EChartsOption => {
    const baseConfig = getBaseChartConfig();

    // Автоматически определяем диапазон RPM
    const rpmRange = calculateRpmRange(selectedCalculations);

    // Создаём серии данных для каждого выбранного расчёта и параметра
    const series: any[] = [];
    const legendData: string[] = [];

    selectedCalculations.forEach((calc, calcIndex) => {
      const color = getCalculationColor(calcIndex);
      const calculationName = calc.name;

      selectedParams.forEach((paramId, paramIndex) => {
        const paramOption = PARAMETER_OPTIONS.find((p) => p.id === paramId);
        if (!paramOption) return;

        // Подготовка данных для параметра
        const paramData = calc.dataPoints.map((point) => {
          let value: number;

          if (paramOption.isArray) {
            // Для массивов вычисляем среднее
            const arrayValue = (point as any)[paramId] as number[];
            value = arrayValue.reduce((sum, val) => sum + val, 0) / arrayValue.length;
          } else {
            // Для скалярных значений берём напрямую
            value = (point as any)[paramId] as number;
          }

          return {
            value: [point.RPM, value],
            unit: paramOption.unit,
          };
        });

        // Стиль линии: чередуем solid и dashed
        const lineStyle = paramIndex % 2 === 0 ? 'solid' : 'dashed';

        // Серия для параметра
        series.push({
          name: `${calculationName} - ${paramOption.label}`,
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
        });

        // Добавляем в легенду
        legendData.push(`${calculationName} - ${paramOption.label}`);
      });
    });

    // Определяем название оси Y и единицы измерения
    let yAxisName = 'Значение';
    if (selectedParams.length === 1) {
      const param = PARAMETER_OPTIONS.find((p) => p.id === selectedParams[0]);
      if (param) {
        yAxisName = `${param.label} (${param.unit})`;
      }
    } else if (selectedParams.length > 1) {
      yAxisName = 'Значение (разные единицы)';
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
        ...baseConfig.legend,
        data: legendData,
        top: 40,
        type: 'scroll',
      },
      xAxis: createXAxis('RPM', rpmRange.min, rpmRange.max),
      yAxis: createYAxis(yAxisName, 'left', '#2ca02c'),
      series,
    };
  }, [selectedCalculations, selectedParams]);

  // Обработчик переключения параметра
  const handleToggleParam = (paramId: string) => {
    setSelectedParams((prev) => {
      if (prev.includes(paramId)) {
        // Убираем параметр (минимум 1 должен остаться)
        return prev.length > 1 ? prev.filter((id) => id !== paramId) : prev;
      } else {
        // Добавляем параметр
        return [...prev, paramId];
      }
    });
  };

  // If no calculations selected, show placeholder
  if (selectedCalculations.length === 0) {
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

  return (
    <div className="w-full space-y-4">
      {/* Кнопки экспорта */}
      <ChartExportButtons
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
        disabled={selectedCalculations.length === 0}
      />

      {/* Селектор параметров */}
      <div className="p-4 bg-muted/30 rounded-lg border">
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
          Выберите параметры для отображения
        </h4>
        <div className="flex flex-wrap gap-2">
          {PARAMETER_OPTIONS.map((param) => {
            const isSelected = selectedParams.includes(param.id);
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
                {param.unit && ` (${param.unit})`}
                {param.isArray && ' (средн.)'}
              </button>
            );
          })}
        </div>
        {selectedParams.length > 1 && (
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Выбрано несколько параметров с разными единицами измерения.
            Убедитесь, что их масштабы сопоставимы для корректного отображения.
          </p>
        )}
      </div>

      {/* График */}
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
