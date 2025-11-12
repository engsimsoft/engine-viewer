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
import type { CombustionCurve } from '@/types'; // v3.2.0

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
  combustionData?: CombustionCurve[]; // v3.2.0: Combustion timing curves
  showCombustionTiming?: boolean;     // v3.2.0: Show combustion timing markers
  showWorkPhases?: boolean;           // v3.3.0: Show Negative/Positive Work phases
}

/**
 * Interpolate combustion data for a target RPM using linear interpolation
 *
 * @param combustionData - Array of combustion curves from metadata
 * @param targetRPM - Target RPM to interpolate for
 * @returns Interpolated combustion curve, or null if target RPM is out of range
 *
 * @example
 * // Exact match
 * interpolateCombustionData(curves, 5000) → returns exact curve at 5000 RPM
 *
 * // Interpolation between 3000 and 4000
 * interpolateCombustionData(curves, 3500) → returns interpolated curve
 *
 * // Out of range
 * interpolateCombustionData(curves, 1000) → returns null
 */
function interpolateCombustionData(
  combustionData: CombustionCurve[],
  targetRPM: number
): CombustionCurve | null {
  if (!combustionData || combustionData.length === 0) {
    return null;
  }

  // Sort curves by RPM (ascending)
  const sortedCurves = [...combustionData].sort((a, b) => a.rpm - b.rpm);

  // Check if target RPM is exact match
  const exactMatch = sortedCurves.find((c) => c.rpm === targetRPM);
  if (exactMatch) {
    return exactMatch;
  }

  // Find two nearest points for interpolation
  let lowerCurve: CombustionCurve | null = null;
  let upperCurve: CombustionCurve | null = null;

  for (let i = 0; i < sortedCurves.length - 1; i++) {
    if (sortedCurves[i].rpm < targetRPM && sortedCurves[i + 1].rpm > targetRPM) {
      lowerCurve = sortedCurves[i];
      upperCurve = sortedCurves[i + 1];
      break;
    }
  }

  // Target RPM is out of range
  if (!lowerCurve || !upperCurve) {
    return null;
  }

  // Calculate interpolation factor
  const factor = (targetRPM - lowerCurve.rpm) / (upperCurve.rpm - lowerCurve.rpm);

  // Linear interpolation for all combustion curve fields
  const interpolated: CombustionCurve = {
    rpm: targetRPM,
    timing: lowerCurve.timing + (upperCurve.timing - lowerCurve.timing) * factor,
    afr: lowerCurve.afr + (upperCurve.afr - lowerCurve.afr) * factor,
    delay: lowerCurve.delay + (upperCurve.delay - lowerCurve.delay) * factor,
    duration: lowerCurve.duration + (upperCurve.duration - lowerCurve.duration) * factor,
    vibeA: lowerCurve.vibeA + (upperCurve.vibeA - lowerCurve.vibeA) * factor,
    vibeB: lowerCurve.vibeB + (upperCurve.vibeB - lowerCurve.vibeB) * factor,
    beff: lowerCurve.beff + (upperCurve.beff - lowerCurve.beff) * factor,
  };

  return interpolated;
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
  const { dataArray, showGrid, showPumpingLosses = false, baseConfig, combustionData } = params;

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
  });

  // Add ignition point on P-V curve (always visible if combustion data exists, single RPM mode only)
  if (combustionData && combustionData.length > 0 && dataArray.length === 1 && series.length > 0) {
    const currentRPM = dataArray[0].rpm;
    const curve = interpolateCombustionData(combustionData, currentRPM);

    if (curve) {
      const ignitionAngle = 360 - curve.timing;  // BTDC → crank angle
      const lastCylinderIndex = dataArray[0].data.data[0].cylinders.length - 1;

      // Find volume and pressure at ignition angle from raw data
      let volumeAtIgnition = 0;
      let pressureAtIgnition = 0;

      // Search for point where normalized deg matches ignitionAngle
      for (const point of dataArray[0].data.data) {
        const normalizedDeg = (point.deg + 360) % 720;
        
        // Find exact or closest match (within 1 degree)
        if (Math.abs(normalizedDeg - ignitionAngle) < 1) {
          const cylinderData = point.cylinders[lastCylinderIndex];
          volumeAtIgnition = cylinderData.volume;
          pressureAtIgnition = cylinderData.pressure;
          break;
        }
      }

      // Add ignition marker to first series
      if (volumeAtIgnition > 0 && pressureAtIgnition > 0) {
        series[0].markPoint = {
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: {
            color: '#374151',
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: 'Ignition',
            position: 'left',
            fontSize: 11,
            color: '#374151',
            fontWeight: 'bold',
            distance: 10,
          },
          data: [
            {
              coord: [volumeAtIgnition, pressureAtIgnition],
              name: 'Ignition',
            },
          ],
        };
      }
    }
  }

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
  const { dataArray, showGrid, baseConfig, combustionData, showCombustionTiming, showWorkPhases = false } = params;

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

    // v3.2.0: Add ignition point (always visible if combustion data exists, single RPM mode only)
    if (combustionData && combustionData.length > 0 && dataArray.length === 1) {
      const currentRPM = dataArray[0].rpm;
      const curve = interpolateCombustionData(combustionData, currentRPM);

      if (curve) {
        // Calculate crank angles
        const ignitionAngle = 360 - curve.timing;  // BTDC → crank angle (e.g., 14° BTDC → 346°)
        const delayEnd = ignitionAngle + curve.delay;
        const durationEnd = delayEnd + curve.duration;

        // Find pressure at ignition angle (interpolate from seriesData)
        const seriesData = series[0].data as [number, number][];
        let pressureAtIgnition = 0;
        
        // Find two nearest points for linear interpolation
        for (let i = 0; i < seriesData.length - 1; i++) {
          const [angle1, pressure1] = seriesData[i];
          const [angle2, pressure2] = seriesData[i + 1];
          
          if (angle1 <= ignitionAngle && ignitionAngle <= angle2) {
            // Linear interpolation
            const factor = (ignitionAngle - angle1) / (angle2 - angle1);
            pressureAtIgnition = pressure1 + (pressure2 - pressure1) * factor;
            break;
          }
        }

        // Add ignition point on curve (iPhone-style: point + label, no vertical line)
        series[0].markPoint = {
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: {
            color: '#374151',
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: 'Ignition',
            position: 'left',
            fontSize: 11,
            color: '#374151',
            fontWeight: 'bold',
            distance: 10,
          },
          data: [
            {
              coord: [ignitionAngle, pressureAtIgnition],
              name: 'Ignition',
            },
          ],
        };

        // Add combustion zones (delay + duration) ONLY when Combustion Timing button is active
        if (showCombustionTiming) {
          series[0].markArea = {
          silent: true,
          data: [
            // Delay zone (ignition → combustion start)
            [
              {
                name: 'Ignition Delay',
                xAxis: ignitionAngle,
                label: {
                  show: true,
                  position: 'inside',
                  formatter: `Delay ${curve.delay.toFixed(1)}°`,
                  fontSize: 9,
                  color: '#92400e',
                },
                itemStyle: {
                  color: 'rgba(251, 146, 60, 0.15)', // Light orange
                  borderColor: 'rgba(251, 146, 60, 0.6)',
                  borderWidth: 1,
                  borderType: 'dashed',
                },
              },
              { xAxis: delayEnd },
            ],
            // Burn duration zone (combustion phase)
            [
              {
                name: 'Burn Duration',
                xAxis: delayEnd,
                label: {
                  show: true,
                  position: 'inside',
                  formatter: `Burn ${curve.duration.toFixed(1)}°`,
                  fontSize: 9,
                  color: '#7f1d1d',
                },
                itemStyle: {
                  color: 'rgba(239, 68, 68, 0.12)', // Light red
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  borderWidth: 1,
                  borderType: 'dashed',
                },
              },
              { xAxis: durationEnd },
            ],
          ],
        };
        }
      }
    }
  }

  // v3.3.0: Add Work Phases visualization (Negative/Positive Work arrows) - single RPM mode only
  if (showWorkPhases && dataArray.length === 1 && series.length > 0 && combustionData && combustionData.length > 0) {
    const currentRPM = dataArray[0].rpm;
    const curve = interpolateCombustionData(combustionData, currentRPM);

    if (curve) {
      const ignitionAngle = 360 - curve.timing;

      // Find mid-pressure for arrow placement
      const midPressure = (minPressure + maxPressure) / 2;

      // Create Work Phases arrows on crank angle axis
      const workPhasesMarkLine = {
        silent: true,
        symbol: ['none', 'arrow'],
        symbolSize: 10,
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 'bold',
          distance: 15,
        },
        lineStyle: {
          width: 2.5,
          type: 'solid',
        },
        data: [
          // Negative Work arrow (compression: before ignition)
          [
            {
              name: 'Negative Work',
              coord: [180, midPressure],  // Start from BDC (180°)
              label: {
                formatter: 'Negative Work',
                position: 'insideMiddleTop',
                color: '#dc2626',  // red-600
              },
              lineStyle: {
                color: '#dc2626',
              },
            },
            {
              coord: [ignitionAngle - 10, midPressure],  // End before ignition
            },
          ],
          // Positive Work arrow (expansion: after combustion)
          [
            {
              name: 'Positive Work',
              coord: [ignitionAngle + 20, midPressure],  // Start after ignition
              label: {
                formatter: 'Positive Work',
                position: 'insideMiddleTop',
                color: '#1e40af',  // blue-800 (engineering style)
              },
              lineStyle: {
                color: '#1e40af',
              },
            },
            {
              coord: [540, midPressure],  // End at BDC (540°)
            },
          ],
        ],
      };

      // Add markLine to first series (merge with existing TDC/BDC markers)
      if (series[0].markLine) {
        series[0].markLine.data = [...series[0].markLine.data, ...workPhasesMarkLine.data];
      }
    }
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
    xAxis: {
      type: 'value',
      name: 'Crank Angle (°)',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      // v3.2.0: Auto-zoom to combustion phase when timing markers enabled
      // 180-540° = BDC→BDC (compression end → power stroke → expansion)
      min: showCombustionTiming ? 180 : 0,
      max: showCombustionTiming ? 540 : 720,
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
