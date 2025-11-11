/**
 * PV-Diagram Utility Functions
 *
 * Helper functions for PV-Diagram data analysis and calculations.
 */

import type { PVDData } from '@/types';

/**
 * Peak Pressure Result
 */
export interface PeakPressure {
  value: number;        // Pressure value (bar)
  angle: number;        // Crank angle (degrees)
  cylinder: number;     // Cylinder index (0-based)
  cylinderNum: number;  // Cylinder number (1-based)
}

/**
 * Volume Range Result
 */
export interface VolumeRange {
  min: number;  // Minimum volume (cm³)
  max: number;  // Maximum volume (cm³)
  range: number; // Range (max - min)
}

/**
 * Find maximum pressure across all cylinders
 *
 * @param data - PVD data
 * @param selectedCylinder - Selected cylinder index (null = all cylinders)
 * @returns Peak pressure information
 */
export function findMaxPressure(
  data: PVDData,
  selectedCylinder: number | null
): PeakPressure | null {
  if (!data || !data.data || data.data.length === 0) {
    return null;
  }

  const cylindersToCheck = selectedCylinder !== null
    ? [selectedCylinder]
    : Array.from({ length: data.metadata.cylinders }, (_, i) => i);

  let maxPressure = -Infinity;
  let maxAngle = 0;
  let maxCylinder = 0;

  data.data.forEach((point) => {
    cylindersToCheck.forEach((cylinderIndex) => {
      const cylinderData = point.cylinders[cylinderIndex];
      if (cylinderData.pressure > maxPressure) {
        maxPressure = cylinderData.pressure;
        maxAngle = point.deg;
        maxCylinder = cylinderIndex;
      }
    });
  });

  return {
    value: maxPressure,
    angle: maxAngle,
    cylinder: maxCylinder,
    cylinderNum: maxCylinder + 1,
  };
}

/**
 * Find minimum pressure across all cylinders
 *
 * @param data - PVD data
 * @param selectedCylinder - Selected cylinder index (null = all cylinders)
 * @returns Minimum pressure information
 */
export function findMinPressure(
  data: PVDData,
  selectedCylinder: number | null
): PeakPressure | null {
  if (!data || !data.data || data.data.length === 0) {
    return null;
  }

  const cylindersToCheck = selectedCylinder !== null
    ? [selectedCylinder]
    : Array.from({ length: data.metadata.cylinders }, (_, i) => i);

  let minPressure = Infinity;
  let minAngle = 0;
  let minCylinder = 0;

  data.data.forEach((point) => {
    cylindersToCheck.forEach((cylinderIndex) => {
      const cylinderData = point.cylinders[cylinderIndex];
      if (cylinderData.pressure < minPressure) {
        minPressure = cylinderData.pressure;
        minAngle = point.deg;
        minCylinder = cylinderIndex;
      }
    });
  });

  return {
    value: minPressure,
    angle: minAngle,
    cylinder: minCylinder,
    cylinderNum: minCylinder + 1,
  };
}

/**
 * Calculate volume range across all cylinders
 *
 * @param data - PVD data
 * @param selectedCylinder - Selected cylinder index (null = all cylinders)
 * @returns Volume range information
 */
export function calculateVolumeRange(
  data: PVDData,
  selectedCylinder: number | null
): VolumeRange | null {
  if (!data || !data.data || data.data.length === 0) {
    return null;
  }

  const cylindersToCheck = selectedCylinder !== null
    ? [selectedCylinder]
    : Array.from({ length: data.metadata.cylinders }, (_, i) => i);

  let minVolume = Infinity;
  let maxVolume = -Infinity;

  data.data.forEach((point) => {
    cylindersToCheck.forEach((cylinderIndex) => {
      const cylinderData = point.cylinders[cylinderIndex];
      minVolume = Math.min(minVolume, cylinderData.volume);
      maxVolume = Math.max(maxVolume, cylinderData.volume);
    });
  });

  return {
    min: minVolume,
    max: maxVolume,
    range: maxVolume - minVolume,
  };
}
