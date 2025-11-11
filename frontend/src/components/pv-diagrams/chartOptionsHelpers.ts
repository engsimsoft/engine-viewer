/**
 * Chart Options Helpers for PV-Diagrams (v3.1 - Educational Multi-RPM)
 *
 * Generates ECharts configuration for 3 diagram types:
 * 1. P-V Diagram (Normal) - Linear axes, classic thermodynamic diagram
 * 2. Log P-V - Logarithmic axes for polytropic process analysis
 * 3. P-α - Pressure vs Crank Angle (0-720°) with TDC/BDC markers
 *
 * Multi-RPM Comparison:
 * - Overlays 2-4 RPMs on same chart (educational comparison)
 * - Each RPM = different color series
 * - Always shows Cylinder 1 data (simplified for education)
 *
 * Pattern: Pure functions, no side effects
 */

import type { EChartsOption } from 'echarts';
import type { PVDDataItem } from '@/hooks/usePVDData';

/**
 * RPM color palette (4 colors for multi-RPM comparison)
 * Matches RPMSection color dots for consistency
 */
export const RPM_COLORS = [
  '#e74c3c',  // RPM 1 - Red
  '#3498db',  // RPM 2 - Blue
  '#2ecc71',  // RPM 3 - Green
  '#f39c12',  // RPM 4 - Orange
];

interface ChartOptionsParams {
  dataArray: PVDDataItem[];  // Array of RPM data items
  animation: boolean;
  showGrid: boolean;
  showPumpingLosses?: boolean; // Zoom to pumping losses (0-2 bar) - only for P-V diagram
  baseConfig: any;
}

/**
 * Create P-V Diagram chart options (Normal - Linear axes)
 *
 * X-axis: Volume (cm³)
 * Y-axis: Pressure (bar)
 *
 * Multi-RPM: Each RPM plotted as separate series (Cylinder 1 only)
 */
export function createPVChartOptions(params: ChartOptionsParams): EChartsOption {
  const { dataArray, showGrid, showPumpingLosses = false, baseConfig } = params;

  // Calculate Volume and Pressure ranges FIRST (needed for label decision)
  let minVolume = Infinity;
  let maxVolume = -Infinity;
  let minPressure = Infinity;
  let maxPressure = -Infinity;

  dataArray.forEach(({ data }) => {
    const lastCylinderIndex = data.data[0].cylinders.length - 1;
    data.data.forEach((point) => {
      const cylinderData = point.cylinders[lastCylinderIndex];
      minVolume = Math.min(minVolume, cylinderData.volume);
      maxVolume = Math.max(maxVolume, cylinderData.volume);
      minPressure = Math.min(minPressure, cylinderData.pressure);
      maxPressure = Math.max(maxPressure, cylinderData.pressure);
    });
  });

  const pressurePadding = (maxPressure - minPressure) * 0.05;
  const showOneBarLabel = (maxPressure + pressurePadding) > 10;

  // Create series for each RPM (Cylinder 1 only - educational simplification)
  const series: any[] = [];
  const legendData: string[] = [];

  dataArray.forEach((item, index) => {
    const { rpm, data } = item;
    const color = RPM_COLORS[index % RPM_COLORS.length];

    const lastCylinderIndex = data.data[0].cylinders.length - 1;
    const seriesData = data.data.map((point) => {
      const cylinderData = point.cylinders[lastCylinderIndex];
      return [
        cylinderData.volume,
        cylinderData.pressure,
      ];
    });

    series.push({
      name: `${rpm} RPM`,
      type: 'line',
      data: seriesData,
      itemStyle: {
        color: color,
      },
      lineStyle: {
        color: color,
        width: 2.5, // Slightly thicker for multi-RPM visibility
      },
      symbol: 'circle',
      symbolSize: 0, // Hide symbols for cleaner overlay
      smooth: false,
      emphasis: {
        focus: 'series',
        lineStyle: {
          width: 3.5,
        },
      },
      areaStyle: {
        color: color,
        opacity: 0.05, // Lower opacity for multi-RPM overlay
      },
      // Atmospheric pressure reference line (1 bar)
      ...(index === 0 && {
        markLine: {
          silent: true,
          symbol: 'none',
          data: [
            {
              yAxis: 1,
              label: {
                show: showOneBarLabel,
                formatter: '1.0',
                position: 'insideStartTop',
                fontSize: 10,
                color: '#666',
              },
              lineStyle: {
                color: '#666',
                type: 'dashed',
                width: 1.5,
              },
            },
          ],
        },
      }),
    });

    legendData.push(`${rpm} RPM`);
  });

  // Add 5% padding to volume axis
  const volumePadding = (maxVolume - minVolume) * 0.05;

  // Title: show RPMs list or "Comparison"
  let titleText = dataArray.length === 1
    ? `P-V Diagram - ${dataArray[0].rpm} RPM`
    : `P-V Diagram - Comparing ${dataArray.length} RPMs`;

  if (showPumpingLosses) {
    titleText += ' (Pumping Losses View)';
  }

  return {
    ...baseConfig,
    title: {
      text: titleText,
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
        formatter: (value: number) => value.toFixed(1),
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
      min: 0,
      max: showPumpingLosses ? 2 : (maxPressure + pressurePadding),
      // Show every 0.5 bar in pumping losses view, every 1 bar if max <= 10, otherwise auto
      interval: showPumpingLosses ? 0.5 : ((maxPressure + pressurePadding) <= 10 ? 1 : undefined),
      axisLine: {
        lineStyle: {
          color: '#666',
        },
      },
      axisLabel: {
        fontSize: 11,
        color: '#666',
        formatter: (value: number) => value.toFixed(1),
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

        let result = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #666; padding-bottom: 6px;">
          Volume: ${volume} cm³
        </div>`;

        // Show ALL RPMs with their pressure values
        params.forEach((param: any) => {
          const marker = param.marker;
          const seriesName = param.seriesName;
          const pressureValue = param.value[1].toFixed(2);
          const volumeValue = param.value[0].toFixed(2);

          result += `
            <div style="margin: 6px 0;">
              ${marker}
              <span style="font-weight: bold;">${seriesName}:</span>
              <span style="margin-left: 8px;">${pressureValue} bar</span>
              <span style="color: #999; font-size: 10px; margin-left: 4px;">(V: ${volumeValue} cm³)</span>
            </div>
          `;
        });

        return result;
      },
    },
    series,
  };
}

/**
 * Create Log P-V Diagram chart options (Logarithmic axes)
 *
 * X-axis: log(Volume)
 * Y-axis: log(Pressure)
 *
 * Use case: Polytropic process analysis (P × V^n = const)
 * Multi-RPM: Each RPM plotted as separate series (Cylinder 1 only)
 */
export function createLogPVChartOptions(params: ChartOptionsParams): EChartsOption {
  const pvOptions = createPVChartOptions(params);

  // Title for Log P-V diagram
  const titleText = params.dataArray.length === 1
    ? `Log P-V Diagram - ${params.dataArray[0].rpm} RPM`
    : `Log P-V Diagram - Comparing ${params.dataArray.length} RPMs`;

  // Modify axes to logarithmic
  return {
    ...pvOptions,
    title: {
      ...pvOptions.title,
      text: titleText,
    },
    xAxis: {
      ...(pvOptions.xAxis as any),
      type: 'log',
      name: 'Volume (cm³) [log scale]',
      logBase: 10,
      // Remove min/max for log scale (ECharts auto-calculates)
      min: undefined,
      max: undefined,
    },
    yAxis: {
      ...(pvOptions.yAxis as any),
      type: 'log',
      name: 'Pressure (bar) [log scale]',
      logBase: 10,
      min: undefined,
      max: undefined,
    },
    tooltip: {
      ...(pvOptions.tooltip as any),
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';

        const point = params[0];
        const volume = point.value[0].toFixed(2);

        let result = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #666; padding-bottom: 6px;">
          Volume: ${volume} cm³
          <span style="font-size: 10px; color: #aaa; display: block;">(log scale)</span>
        </div>`;

        // Show ALL RPMs with their pressure values
        params.forEach((param: any) => {
          const marker = param.marker;
          const seriesName = param.seriesName;
          const pressureValue = param.value[1].toFixed(2);
          const volumeValue = param.value[0].toFixed(2);

          result += `
            <div style="margin: 6px 0;">
              ${marker}
              <span style="font-weight: bold;">${seriesName}:</span>
              <span style="margin-left: 8px;">${pressureValue} bar</span>
              <span style="color: #999; font-size: 10px; margin-left: 4px;">(V: ${volumeValue} cm³)</span>
            </div>
          `;
        });

        return result;
      },
    },
  };
}

/**
 * Create P-α Diagram chart options (Pressure vs Crank Angle)
 *
 * X-axis: Crank Angle (0-720° for 4-stroke)
 * Y-axis: Pressure (bar)
 * Markers: TDC (0°, 360°, 720°), BDC (180°, 540°)
 *
 * Multi-RPM: Each RPM plotted as separate series (Cylinder 1 only)
 * Educational: Will add cycle phases, valve timing markers in future stages
 */
export function createPAlphaChartOptions(params: ChartOptionsParams): EChartsOption {
  const { dataArray, showGrid, baseConfig } = params;

  // Calculate Pressure range
  let minPressure = Infinity;
  let maxPressure = -Infinity;

  dataArray.forEach(({ data }) => {
    const lastCylinderIndex = data.data[0].cylinders.length - 1;
    data.data.forEach((point) => {
      const cylinderData = point.cylinders[lastCylinderIndex];
      minPressure = Math.min(minPressure, cylinderData.pressure);
      maxPressure = Math.max(maxPressure, cylinderData.pressure);
    });
  });

  const pressurePadding = (maxPressure - minPressure) * 0.05;

  // Create series for each RPM (Cylinder 1 only - educational simplification)
  const series: any[] = [];
  const legendData: string[] = [];

  dataArray.forEach((item, index) => {
    const { rpm, data } = item;
    const color = RPM_COLORS[index % RPM_COLORS.length];

    const lastCylinderIndex = data.data[0].cylinders.length - 1;
    const seriesData = data.data
      .map((point) => {
        const cylinderData = point.cylinders[lastCylinderIndex];
        const normalizedDeg = (point.deg + 360) % 720;
        return [
          normalizedDeg,
          cylinderData.pressure,
        ];
      })
      .sort((a, b) => a[0] - b[0]);

    series.push({
      name: `${rpm} RPM`,
      type: 'line',
      data: seriesData,
      itemStyle: {
        color: color,
      },
      lineStyle: {
        color: color,
        width: 2.5, // Slightly thicker for multi-RPM visibility
      },
      symbol: 'circle',
      symbolSize: 0, // Hide symbols for cleaner overlay
      smooth: false,
      emphasis: {
        focus: 'series',
        lineStyle: {
          width: 3.5,
        },
      },
    });

    legendData.push(`${rpm} RPM`);
  });

  // TDC/BDC + Atmospheric Pressure markLine configuration
  const markLineData: any[] = [
    // TDC markers (Top Dead Center)
    { name: 'TDC', xAxis: 0, lineStyle: { color: '#e74c3c', type: 'dashed', width: 2 } },
    { name: 'TDC', xAxis: 360, lineStyle: { color: '#e74c3c', type: 'dashed', width: 2 } },
    { name: 'TDC', xAxis: 720, lineStyle: { color: '#e74c3c', type: 'dashed', width: 2 } },
    // BDC markers (Bottom Dead Center)
    { name: 'BDC', xAxis: 180, lineStyle: { color: '#3498db', type: 'dotted', width: 2 } },
    { name: 'BDC', xAxis: 540, lineStyle: { color: '#3498db', type: 'dotted', width: 2 } },
    // Atmospheric pressure line (1 bar)
    {
      yAxis: 1,
      label: { show: false },
      lineStyle: { color: '#666', type: 'dashed', width: 1.5 },
    },
  ];

  const markLine = {
    silent: true,
    symbol: 'none',
    label: {
      show: true,
      position: 'end',
      formatter: '{b}',
      fontSize: 11,
      fontWeight: 'bold',
    },
    data: markLineData,
  };

  // Add markLine to first series only (TDC/BDC markers)
  if (series.length > 0) {
    series[0].markLine = markLine;
  }

  // Title: show RPMs list or "Comparison"
  const titleText = dataArray.length === 1
    ? `P-α Diagram - ${dataArray[0].rpm} RPM`
    : `P-α Diagram - Comparing ${dataArray.length} RPMs`;

  return {
    ...baseConfig,
    title: {
      text: titleText,
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
      name: 'Crank Angle (°)',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      min: 0,
      max: 720,
      axisLine: {
        lineStyle: {
          color: '#666',
        },
      },
      axisLabel: {
        fontSize: 11,
        color: '#666',
        formatter: (value: number) => value.toFixed(1),
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
      min: 0, // Physical limit: pressure cannot be negative
      max: maxPressure + pressurePadding,
      // Show every 1 bar if max <= 10, otherwise use auto interval
      interval: (maxPressure + pressurePadding) <= 10 ? 1 : undefined,
      axisLine: {
        lineStyle: {
          color: '#666',
        },
      },
      axisLabel: {
        fontSize: 11,
        color: '#666',
        formatter: (value: number) => value.toFixed(1),
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
        const angle = point.value[0].toFixed(1);

        let result = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #666; padding-bottom: 6px;">
          Crank Angle: ${angle}°
        </div>`;

        // Show ALL RPMs with their pressure values
        params.forEach((param: any) => {
          const marker = param.marker;
          const seriesName = param.seriesName;
          const pressureValue = param.value[1].toFixed(2);

          result += `
            <div style="margin: 6px 0;">
              ${marker}
              <span style="font-weight: bold;">${seriesName}:</span>
              <span style="margin-left: 8px;">${pressureValue} bar</span>
            </div>
          `;
        });

        return result;
      },
    },
    series,
  };
}
