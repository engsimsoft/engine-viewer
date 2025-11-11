/**
 * Chart Options Helpers for PV-Diagrams
 *
 * Generates ECharts configuration for 3 diagram types:
 * 1. P-V Diagram (Normal) - Linear axes, classic thermodynamic diagram
 * 2. Log P-V - Logarithmic axes for polytropic process analysis
 * 3. P-α - Pressure vs Crank Angle (0-720°) with TDC/BDC markers
 *
 * Pattern: Pure functions, no side effects
 */

import type { EChartsOption } from 'echarts';
import type { PVDData } from '@/types';

/**
 * Cylinder color palette (8 colors for 8-cylinder engines)
 */
export const CYLINDER_COLORS = [
  '#e74c3c',  // Cylinder 1 - Red
  '#3498db',  // Cylinder 2 - Blue
  '#2ecc71',  // Cylinder 3 - Green
  '#f39c12',  // Cylinder 4 - Orange
  '#9b59b6',  // Cylinder 5 - Purple
  '#1abc9c',  // Cylinder 6 - Turquoise
  '#e67e22',  // Cylinder 7 - Carrot
  '#34495e',  // Cylinder 8 - Dark Gray
];

interface ChartOptionsParams {
  data: PVDData;
  selectedCylinder: number | null;
  animation: boolean;
  showGrid: boolean;
  baseConfig: any;
}

/**
 * Create P-V Diagram chart options (Normal - Linear axes)
 *
 * X-axis: Volume (cm³)
 * Y-axis: Pressure (bar)
 */
export function createPVChartOptions(params: ChartOptionsParams): EChartsOption {
  const { data, selectedCylinder, showGrid, baseConfig } = params;
  const numCylinders = data.metadata.cylinders;

  // Determine which cylinders to show
  const cylindersToShow = selectedCylinder !== null && selectedCylinder !== undefined
    ? [selectedCylinder]
    : Array.from({ length: numCylinders }, (_, i) => i);

  // Create series for each cylinder
  const series: any[] = [];
  const legendData: string[] = [];

  cylindersToShow.forEach((cylinderIndex) => {
    if (cylinderIndex >= numCylinders) return;

    // Extract Volume and Pressure data for this cylinder
    const seriesData = data.data.map((point) => {
      const cylinderData = point.cylinders[cylinderIndex];
      return [
        cylinderData.volume,   // X: Volume (cm³)
        cylinderData.pressure, // Y: Pressure (bar)
      ];
    });

    const cylinderNum = cylinderIndex + 1;
    const color = CYLINDER_COLORS[cylinderIndex % CYLINDER_COLORS.length];

    series.push({
      name: `Cylinder ${cylinderNum}`,
      type: 'line',
      data: seriesData,
      itemStyle: {
        color: color,
      },
      lineStyle: {
        color: color,
        width: 2,
      },
      symbol: 'circle',
      symbolSize: 4,
      smooth: false,
      emphasis: {
        focus: 'series',
      },
      areaStyle: {
        color: color,
        opacity: 0.1,
      },
    });

    legendData.push(`Cylinder ${cylinderNum}`);
  });

  // Calculate Volume and Pressure ranges
  let minVolume = Infinity;
  let maxVolume = -Infinity;
  let minPressure = Infinity;
  let maxPressure = -Infinity;

  data.data.forEach((point) => {
    cylindersToShow.forEach((cylinderIndex) => {
      const cylinderData = point.cylinders[cylinderIndex];
      minVolume = Math.min(minVolume, cylinderData.volume);
      maxVolume = Math.max(maxVolume, cylinderData.volume);
      minPressure = Math.min(minPressure, cylinderData.pressure);
      maxPressure = Math.max(maxPressure, cylinderData.pressure);
    });
  });

  // Add 5% padding to axes
  const volumePadding = (maxVolume - minVolume) * 0.05;
  const pressurePadding = (maxPressure - minPressure) * 0.05;

  return {
    ...baseConfig,
    title: {
      text: `P-V Diagram - ${data.metadata.rpm} RPM`,
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
      min: minPressure - pressurePadding,
      max: maxPressure + pressurePadding,
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
        const pressure = point.value[1].toFixed(2);

        let result = `<div style="font-weight: bold; margin-bottom: 8px;">
          Volume: ${volume} cm³<br/>
          Pressure: ${pressure} bar
        </div>`;

        params.forEach((param: any) => {
          const marker = param.marker;
          const seriesName = param.seriesName;
          const pressureValue = param.value[1].toFixed(2);

          result += `
            <div style="margin: 4px 0;">
              ${marker}
              <span style="display: inline-block; min-width: 100px;">${seriesName}:</span>
              <span style="font-weight: bold;">${pressureValue} bar</span>
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
 */
export function createLogPVChartOptions(params: ChartOptionsParams): EChartsOption {
  const pvOptions = createPVChartOptions(params);

  // Modify axes to logarithmic
  return {
    ...pvOptions,
    title: {
      ...pvOptions.title,
      text: `Log P-V Diagram - ${params.data.metadata.rpm} RPM`,
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
        const pressure = point.value[1].toFixed(2);

        let result = `<div style="font-weight: bold; margin-bottom: 8px;">
          Volume: ${volume} cm³<br/>
          Pressure: ${pressure} bar<br/>
          <span style="font-size: 10px; color: #aaa;">(log scale)</span>
        </div>`;

        params.forEach((param: any) => {
          const marker = param.marker;
          const seriesName = param.seriesName;
          const pressureValue = param.value[1].toFixed(2);

          result += `
            <div style="margin: 4px 0;">
              ${marker}
              <span style="display: inline-block; min-width: 100px;">${seriesName}:</span>
              <span style="font-weight: bold;">${pressureValue} bar</span>
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
 */
export function createPAlphaChartOptions(params: ChartOptionsParams): EChartsOption {
  const { data, selectedCylinder, showGrid, baseConfig } = params;
  const numCylinders = data.metadata.cylinders;

  // Determine which cylinders to show
  const cylindersToShow = selectedCylinder !== null && selectedCylinder !== undefined
    ? [selectedCylinder]
    : Array.from({ length: numCylinders }, (_, i) => i);

  // Create series for each cylinder
  const series: any[] = [];
  const legendData: string[] = [];

  cylindersToShow.forEach((cylinderIndex) => {
    if (cylinderIndex >= numCylinders) return;

    // Extract Angle and Pressure data for this cylinder
    const seriesData = data.data.map((point) => {
      const cylinderData = point.cylinders[cylinderIndex];
      return [
        point.deg,                // X: Crank Angle (0-720°)
        cylinderData.pressure,    // Y: Pressure (bar)
      ];
    });

    const cylinderNum = cylinderIndex + 1;
    const color = CYLINDER_COLORS[cylinderIndex % CYLINDER_COLORS.length];

    series.push({
      name: `Cylinder ${cylinderNum}`,
      type: 'line',
      data: seriesData,
      itemStyle: {
        color: color,
      },
      lineStyle: {
        color: color,
        width: 2,
      },
      symbol: 'circle',
      symbolSize: 2,
      smooth: false,
      emphasis: {
        focus: 'series',
      },
    });

    legendData.push(`Cylinder ${cylinderNum}`);
  });

  // Calculate Pressure range
  let minPressure = Infinity;
  let maxPressure = -Infinity;

  data.data.forEach((point) => {
    cylindersToShow.forEach((cylinderIndex) => {
      const cylinderData = point.cylinders[cylinderIndex];
      minPressure = Math.min(minPressure, cylinderData.pressure);
      maxPressure = Math.max(maxPressure, cylinderData.pressure);
    });
  });

  const pressurePadding = (maxPressure - minPressure) * 0.05;

  // TDC and BDC markLine configuration
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
    lineStyle: {
      width: 2,
      type: 'solid',
    },
    data: [
      // TDC markers (Top Dead Center)
      { name: 'TDC', xAxis: 0, lineStyle: { color: '#e74c3c', type: 'dashed' } },
      { name: 'TDC', xAxis: 360, lineStyle: { color: '#e74c3c', type: 'dashed' } },
      { name: 'TDC', xAxis: 720, lineStyle: { color: '#e74c3c', type: 'dashed' } },
      // BDC markers (Bottom Dead Center)
      { name: 'BDC', xAxis: 180, lineStyle: { color: '#3498db', type: 'dotted' } },
      { name: 'BDC', xAxis: 540, lineStyle: { color: '#3498db', type: 'dotted' } },
    ],
  };

  // Add markLine to first series only
  if (series.length > 0) {
    series[0].markLine = markLine;
  }

  return {
    ...baseConfig,
    title: {
      text: `P-α Diagram - ${data.metadata.rpm} RPM`,
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
      min: minPressure - pressurePadding,
      max: maxPressure + pressurePadding,
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
        const pressure = point.value[1].toFixed(2);

        let result = `<div style="font-weight: bold; margin-bottom: 8px;">
          Angle: ${angle}°<br/>
          Pressure: ${pressure} bar
        </div>`;

        params.forEach((param: any) => {
          const marker = param.marker;
          const seriesName = param.seriesName;
          const pressureValue = param.value[1].toFixed(2);

          result += `
            <div style="margin: 4px 0;">
              ${marker}
              <span style="display: inline-block; min-width: 100px;">${seriesName}:</span>
              <span style="font-weight: bold;">${pressureValue} bar</span>
            </div>
          `;
        });

        return result;
      },
    },
    series,
  };
}
