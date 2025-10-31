import type { EChartsOption } from 'echarts';
import type { Calculation } from '@/types';

// Цвета для расчётов (из config.yaml)
export const CALCULATION_COLORS = [
  '#ff6b6b', // Красный
  '#4ecdc4', // Бирюзовый
  '#45b7d1', // Синий
  '#f9ca24', // Жёлтый
  '#a29bfe', // Фиолетовый
];

/**
 * Получить цвет для расчёта по индексу
 */
export function getCalculationColor(index: number): string {
  return CALCULATION_COLORS[index % CALCULATION_COLORS.length];
}

/**
 * Автоматически определить диапазон RPM для оси X
 *
 * Алгоритм:
 * 1. Находит min/max RPM из всех выбранных расчётов
 * 2. Определяет шаг округления в зависимости от диапазона:
 *    - Диапазон > 5000 → округление до 1000 (2000, 3000, 4000...)
 *    - Диапазон 2000-5000 → округление до 500 (1500, 2000, 2500...)
 *    - Диапазон < 2000 → округление до 200 (1000, 1200, 1400...)
 * 3. Округляет границы до "красивых" чисел
 *
 * @param calculations - Массив расчётов для анализа
 * @returns Объект с min и max значениями RPM
 *
 * @example
 * // Данные: 2600 - 7800 RPM
 * calculateRpmRange(calculations) // { min: 2000, max: 8000 }
 */
export function calculateRpmRange(calculations: Calculation[]): { min: number; max: number } {
  if (calculations.length === 0) {
    return { min: 0, max: 8000 }; // Значения по умолчанию
  }

  let minRpm = Infinity;
  let maxRpm = -Infinity;

  // Найти min/max RPM из всех расчётов
  calculations.forEach((calc) => {
    calc.dataPoints.forEach((point) => {
      minRpm = Math.min(minRpm, point.RPM);
      maxRpm = Math.max(maxRpm, point.RPM);
    });
  });

  // Если не нашли данных
  if (minRpm === Infinity || maxRpm === -Infinity) {
    return { min: 0, max: 8000 };
  }

  // Определить шаг округления на основе диапазона
  const range = maxRpm - minRpm;
  const roundStep = range > 5000 ? 1000 : range > 2000 ? 500 : 200;

  // Округлить границы до "красивых" чисел
  const min = Math.floor(minRpm / roundStep) * roundStep;
  const max = Math.ceil(maxRpm / roundStep) * roundStep;

  return { min, max };
}

/**
 * Базовая конфигурация ECharts для всех графиков
 * Включает grid, tooltip, legend, dataZoom
 */
export function getBaseChartConfig(): Partial<EChartsOption> {
  return {
    // Grid - отступы графика
    grid: {
      left: '60px',
      right: '60px',
      top: '80px',
      bottom: '60px', // Reduced from 100px (removed slider)
      containLabel: true,
    },

    // Tooltip - всплывающая подсказка
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
      // Кастомный форматтер для более красивого отображения
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';

        const axisValue = params[0]?.axisValue;
        let result = `<div style="font-weight: bold; margin-bottom: 8px;">RPM: ${axisValue}</div>`;

        params.forEach((param: any) => {
          const marker = param.marker;
          const seriesName = param.seriesName;

          // Extract value from array [rpm, value] format
          // ECharts data format: { value: [x, y] } where x=RPM, y=actual value
          let displayValue = param.value;
          if (Array.isArray(param.value) && param.value.length >= 2) {
            displayValue = param.value[1]; // Get Y value (second element)
          }

          // Get decimals from data or use default
          const decimals = param.data?.decimals !== undefined ? param.data.decimals : 1;

          // Format number with decimals
          const formattedValue = typeof displayValue === 'number'
            ? displayValue.toFixed(decimals)
            : displayValue;

          result += `
            <div style="margin: 4px 0;">
              ${marker}
              <span style="display: inline-block; min-width: 200px;">${seriesName}:</span>
              <span style="font-weight: bold;">${formattedValue}</span>
            </div>
          `;
        });

        return result;
      },
    },

    // Legend - легенда
    legend: {
      data: [],
      top: 10,
      left: 'center',
      textStyle: {
        fontSize: 12,
      },
      itemWidth: 30,
      itemHeight: 14,
      icon: 'roundRect',
    },

    // Toolbox - drag-to-zoom and restore
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          yAxisIndex: 'none', // Zoom only on X axis (RPM)
          title: {
            zoom: 'Zoom',
            back: 'Reset Zoom'
          },
        },
        restore: {
          title: 'Restore'
        },
      },
      right: 20,
      top: 10,
      itemSize: 18,
      itemGap: 12,
      iconStyle: {
        borderColor: '#666',
      },
      emphasis: {
        iconStyle: {
          borderColor: '#3b82f6',
        },
      },
    },

    // DataZoom - масштабирование колёсиком мыши
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false,
      },
    ],

    // Анимация
    animation: true,
    animationDuration: 300,
    animationEasing: 'cubicOut',
  };
}

/**
 * Создать конфигурацию оси X (RPM)
 *
 * @param name - Название оси (по умолчанию 'RPM')
 * @param min - Минимальное значение оси (опционально, для автоматического масштабирования)
 * @param max - Максимальное значение оси (опционально, для автоматического масштабирования)
 */
export function createXAxis(
  name: string = 'RPM',
  min?: number,
  max?: number
): EChartsOption['xAxis'] {
  return {
    type: 'value',
    name,
    nameLocation: 'middle',
    nameGap: 35,
    nameTextStyle: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    min, // Автоматическое масштабирование если задано
    max, // Автоматическое масштабирование если задано
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
      show: true,
      lineStyle: {
        color: '#e5e7eb',
        type: 'dashed',
      },
    },
  };
}

/**
 * Создать конфигурацию оси Y
 */
export function createYAxis(
  name: string,
  position: 'left' | 'right' = 'left',
  color?: string
): EChartsOption['yAxis'] {
  return {
    type: 'value',
    name,
    position,
    nameTextStyle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: color || '#666',
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: color || '#666',
      },
    },
    axisLabel: {
      fontSize: 11,
      color: color || '#666',
    },
    splitLine: {
      show: position === 'left',
      lineStyle: {
        color: '#e5e7eb',
        type: 'dashed',
      },
    },
  };
}
