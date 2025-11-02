import type { EChartsOption } from 'echarts';
import type { Calculation } from '@/types';
import { CALCULATION_COLORS } from '@/types/v2';

/**
 * Parameter colors - используются когда только 1 calculation (single calculation mode)
 * Цвета соответствуют цветам осей для интуитивного понимания
 */
export const PARAMETER_COLORS = {
  // Preset 1: Power & Torque
  power: '#1f77b4',    // Синий (соответствует left axis)
  torque: '#ff7f0e',   // Оранжевый (соответствует right axis)

  // Preset 2: MEP (4 parameters - 4 colors)
  mep1: '#1f77b4',     // FMEP - Синий
  mep2: '#ff7f0e',     // IMEP - Оранжевый
  mep3: '#2ca02c',     // BMEP - Зелёный
  mep4: '#d62728',     // PMEP - Красный

  // Preset 3: Temperature
  temperatureCyl: '#1f77b4',  // Синий TCylMax (соответствует left axis)
  temperatureExh: '#ff7f0e',  // Оранжевый TUbMax (соответствует right axis)

  // Preset 5: Combustion (4 parameters - 4 colors)
  combustion1: '#9467bd',  // TAF - Фиолетовый
  combustion2: '#ff7f0e',  // Timing - Оранжевый
  combustion3: '#2ca02c',  // Delay - Зелёный
  combustion4: '#d62728',  // Durat - Красный

  // Preset 6: Efficiency (5 parameters - 5 high-contrast colors)
  efficiency1: '#1f77b4',  // DRatio - Синий
  efficiency2: '#e74c3c',  // PurCyl - Красный
  efficiency3: '#2ca02c',  // Seff - Зелёный
  efficiency4: '#ff7f0e',  // Teff - Оранжевый
  efficiency5: '#9467bd',  // Ceff (VE) - Фиолетовый
} as const;

/**
 * Получить цвет для расчёта по индексу
 */
export function getCalculationColor(index: number): string {
  return CALCULATION_COLORS[index % CALCULATION_COLORS.length];
}

// Re-export CALCULATION_COLORS for backward compatibility
export { CALCULATION_COLORS };

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
 *
 * @param animation - Enable/disable chart animation (from store)
 */
export function getBaseChartConfig(animation = true): Partial<EChartsOption> {
  return {
    // Grid - отступы графика
    grid: {
      left: '30px',
      right: '30px',
      top: '50px', // Reduced from 80px to show more content below
      bottom: '40px', // Reduced from 60px for tighter spacing with cards
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

    // DataZoom - масштабирование (базовое)
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100,
        zoomOnMouseWheel: false,
        moveOnMouseMove: false,
        moveOnMouseWheel: false,
      },
    ],

    // Анимация (from settings)
    animation: animation,
    animationDuration: animation ? 300 : 0,
    animationEasing: 'cubicOut',
  };
}

/**
 * Создать конфигурацию оси X (RPM)
 *
 * @param name - Название оси (по умолчанию 'RPM')
 * @param min - Минимальное значение оси (опционально, для автоматического масштабирования)
 * @param max - Максимальное значение оси (опционально, для автоматического масштабирования)
 * @param showGrid - Show/hide grid lines (from settings)
 */
export function createXAxis(
  name: string = 'RPM',
  min?: number,
  max?: number,
  showGrid = true
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
      show: showGrid,
      lineStyle: {
        color: '#e5e7eb',
        type: 'dashed',
      },
    },
  };
}

/**
 * Создать конфигурацию оси Y
 *
 * @param name - Название оси
 * @param position - Позиция оси (left/right)
 * @param color - Цвет оси
 * @param showGrid - Show/hide grid lines (from settings, only for left axis)
 * @param min - Minimum value for Y axis (optional)
 * @param max - Maximum value for Y axis (optional)
 */
export function createYAxis(
  name: string,
  position: 'left' | 'right' = 'left',
  color?: string,
  showGrid = true,
  min?: number,
  max?: number
): EChartsOption['yAxis'] {
  return {
    type: 'value',
    name,
    position,
    min,
    max,
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
      show: position === 'left' && showGrid,
      lineStyle: {
        color: '#e5e7eb',
        type: 'dashed',
      },
    },
  };
}
