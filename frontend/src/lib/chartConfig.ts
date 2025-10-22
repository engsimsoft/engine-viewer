import type { EChartsOption } from 'echarts';

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
      bottom: '100px',
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
          const value = param.value;
          const unit = param.data?.unit || '';

          result += `
            <div style="margin: 4px 0;">
              ${marker}
              <span style="display: inline-block; width: 150px;">${seriesName}:</span>
              <span style="font-weight: bold;">${value} ${unit}</span>
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

    // DataZoom - масштабирование и панорамирование
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        bottom: 20,
        height: 20,
        handleSize: '110%',
        handleStyle: {
          color: '#3b82f6',
        },
        textStyle: {
          color: '#666',
        },
        borderColor: '#ddd',
      },
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
 */
export function createXAxis(name: string = 'RPM'): EChartsOption['xAxis'] {
  return {
    type: 'value',
    name,
    nameLocation: 'middle',
    nameGap: 35,
    nameTextStyle: {
      fontSize: 14,
      fontWeight: 'bold',
    },
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
