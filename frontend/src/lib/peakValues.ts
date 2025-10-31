/**
 * Peak Values Utilities
 *
 * Phase 4 - Section 4.2
 *
 * Utilities for finding and formatting peak values in calculation data.
 */

import type { DataPoint } from '@/types';
import type { Units } from '@/types/v2';
import { formatValue } from './unitsConversion';

/**
 * Peak value result
 */
export interface PeakValue {
  value: number;      // Peak value (in original units from database)
  rpm: number;        // RPM at which peak occurs
  index: number;      // Index in data array
}

/**
 * Find peak (maximum) value for a parameter in calculation data
 *
 * @param data - Array of data points
 * @param parameter - Parameter name (P-Av, Torque, PCylMax, etc.)
 * @returns Peak value with RPM and index
 *
 * @example
 * ```ts
 * const powerPeak = findPeak(calc.data, 'P-Av');
 * // { value: 92.5, rpm: 6800, index: 18 }
 * ```
 */
export function findPeak(data: DataPoint[], parameter: string): PeakValue | null {
  if (!data || data.length === 0) return null;

  let maxValue = -Infinity;
  let maxIndex = -1;
  let maxRpm = 0;

  data.forEach((point, index) => {
    let value: number;

    // Get value based on parameter type
    if (parameter === 'P-Av' || parameter === 'PAv') {
      value = point['P-Av'];
    } else if (parameter === 'Torque') {
      value = point.Torque;
    } else if (parameter === 'PCylMax') {
      // For array parameters, use maximum across cylinders
      value = Math.max(...point.PCylMax);
    } else if (parameter === 'TCylMax') {
      // For array parameters, use maximum across cylinders
      value = Math.max(...point.TCylMax);
    } else if (parameter === 'TUbMax') {
      // For array parameters, use maximum across cylinders
      value = Math.max(...point.TUbMax);
    } else if (parameter === 'PurCyl') {
      value = Math.max(...point.PurCyl);
    } else if (parameter === 'Deto') {
      value = Math.max(...point.Deto);
    } else if (parameter === 'Convergence') {
      value = point.Convergence;
    } else {
      // Unknown parameter
      return;
    }

    if (value > maxValue) {
      maxValue = value;
      maxIndex = index;
      maxRpm = point.RPM;
    }
  });

  if (maxIndex === -1) return null;

  return {
    value: maxValue,
    rpm: maxRpm,
    index: maxIndex,
  };
}

/**
 * Format peak value for display
 *
 * @param peak - Peak value
 * @param parameter - Parameter name
 * @param units - Unit system
 * @returns Formatted string (e.g., "Max P-Av: 92.5 kW at 6800 RPM")
 */
export function formatPeakValue(
  peak: PeakValue,
  parameter: string,
  units: Units
): string {
  const formattedValue = formatValue(peak.value, parameter, units, 1);
  return `Max ${parameter}: ${formattedValue} at ${peak.rpm} RPM`;
}

/**
 * Get marker symbol for calculation index
 *
 * Different symbols for each calculation:
 * - Primary (index 0): star ⭐
 * - Comparison 1 (index 1): circle ⭕
 * - Comparison 2 (index 2): diamond 🔷
 * - Comparison 3 (index 3): triangle 🔺
 * - Comparison 4 (index 4): rect ⬜
 *
 * @param calcIndex - Calculation index (0-4)
 * @returns ECharts symbol name
 */
export function getMarkerSymbol(calcIndex: number): string {
  const symbols = ['pin', 'circle', 'diamond', 'triangle', 'rect'];
  return symbols[calcIndex] || 'circle';
}
