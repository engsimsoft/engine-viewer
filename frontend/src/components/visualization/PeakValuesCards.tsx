/**
 * Peak Values Cards Component (v2.0 - Full-Width Layout)
 *
 * Displays peak values for each calculation in a full-width card layout.
 * Each card shows the calculation name and inline peak values.
 *
 * Addendum v2.0.1 Changes:
 * - Replaced 2-column grid with full-width cards
 * - Inline peak values format: "🏆 215.7 PS at 7800 RPM • 219.1 N·m at 6600 RPM"
 * - Height: 68px per card
 * - Gap: 12px between cards
 * - Hover effect: shadow + translateY(-2px)
 *
 * @example
 * ```tsx
 * <PeakValuesCards
 *   calculations={calculations}
 *   preset={1}
 * />
 * ```
 */

import type { CalculationReference } from '@/types/v2';
import { useAppStore } from '@/stores/appStore';
import { findPeak } from '@/lib/peakValues';
import {
  convertPower,
  convertTorque,
  convertPressure,
  convertTemperature,
  getPowerUnit,
  getTorqueUnit,
  getPressureUnit,
  getTemperatureUnit,
} from '@/lib/unitsConversion';

interface PeakValuesCardsProps {
  /** Array of calculations with loaded data */
  calculations: CalculationReference[];
  /** Current selected preset (1-4) to determine which peaks to show */
  preset: 1 | 2 | 3 | 4;
  /** Optional: selected parameters for Preset 4 */
  selectedParams?: string[];
}

interface PeakValueItem {
  label: string;
  value: string;
  rpm: number;
}

/**
 * Get peak values for a calculation based on preset
 */
function getPeakValuesForCalculation(
  calc: CalculationReference,
  preset: 1 | 2 | 3 | 4,
  units: 'si' | 'american' | 'hp',
  selectedParams?: string[]
): PeakValueItem[] {
  if (!calc.data || calc.data.length === 0) return [];

  const peaks: PeakValueItem[] = [];

  switch (preset) {
    case 1: {
      // Preset 1: Power & Torque
      const powerPeak = findPeak(calc.data, 'P-Av');
      if (powerPeak) {
        peaks.push({
          label: 'P-Av',
          value: `${convertPower(powerPeak.value, units).toFixed(1)} ${getPowerUnit(units)}`,
          rpm: powerPeak.rpm,
        });
      }

      const torquePeak = findPeak(calc.data, 'Torque');
      if (torquePeak) {
        peaks.push({
          label: 'Torque',
          value: `${convertTorque(torquePeak.value, units).toFixed(1)} ${getTorqueUnit(units)}`,
          rpm: torquePeak.rpm,
        });
      }
      break;
    }

    case 2: {
      // Preset 2: Cylinder Pressure (per cylinder)
      const pressurePeak = findPeak(calc.data, 'PCylMax');
      if (pressurePeak) {
        const numCylinders = calc.metadata.cylinders;

        // Find peak for each cylinder
        for (let cylIndex = 0; cylIndex < numCylinders; cylIndex++) {
          let maxPressure = -Infinity;
          let maxRpm = 0;

          calc.data.forEach((point) => {
            const pressure = point.PCylMax[cylIndex];
            if (pressure > maxPressure) {
              maxPressure = pressure;
              maxRpm = point.RPM;
            }
          });

          peaks.push({
            label: `Cyl ${cylIndex + 1}`,
            value: `${convertPressure(maxPressure, units).toFixed(1)} ${getPressureUnit(units)}`,
            rpm: maxRpm,
          });
        }
      }
      break;
    }

    case 3: {
      // Preset 3: Temperature (TCylMax & TUbMax)
      const tCylMaxPeak = findPeak(calc.data, 'TCylMax');
      if (tCylMaxPeak) {
        // Convert K → °C first
        const celsius = tCylMaxPeak.value - 273.15;
        peaks.push({
          label: 'TCylMax',
          value: `${convertTemperature(celsius, units).toFixed(0)} ${getTemperatureUnit(units)}`,
          rpm: tCylMaxPeak.rpm,
        });
      }

      const tUbMaxPeak = findPeak(calc.data, 'TUbMax');
      if (tUbMaxPeak) {
        // Convert K → °C first
        const celsius = tUbMaxPeak.value - 273.15;
        peaks.push({
          label: 'TUbMax',
          value: `${convertTemperature(celsius, units).toFixed(0)} ${getTemperatureUnit(units)}`,
          rpm: tUbMaxPeak.rpm,
        });
      }
      break;
    }

    case 4: {
      // Preset 4: Custom parameters (user-selected)
      if (!selectedParams || selectedParams.length === 0) {
        // Default to P-Av and Torque if no selection
        const powerPeak = findPeak(calc.data, 'P-Av');
        if (powerPeak) {
          peaks.push({
            label: 'P-Av',
            value: `${convertPower(powerPeak.value, units).toFixed(1)} ${getPowerUnit(units)}`,
            rpm: powerPeak.rpm,
          });
        }

        const torquePeak = findPeak(calc.data, 'Torque');
        if (torquePeak) {
          peaks.push({
            label: 'Torque',
            value: `${convertTorque(torquePeak.value, units).toFixed(1)} ${getTorqueUnit(units)}`,
            rpm: torquePeak.rpm,
          });
        }
      } else {
        // Show peaks for selected parameters
        selectedParams.forEach((paramId) => {
          const peak = findPeak(calc.data!, paramId);
          if (peak) {
            let peakValue = peak.value;

            // Temperature conversion: K → °C first
            if (paramId === 'TCylMax' || paramId === 'TUbMax') {
              peakValue = peakValue - 273.15;
            }

            // Convert and format value based on parameter type
            let convertedValue: number;
            let unit = '';
            let precision = 1;

            switch (paramId) {
              case 'P-Av':
                convertedValue = convertPower(peakValue, units);
                unit = getPowerUnit(units);
                break;
              case 'Torque':
                convertedValue = convertTorque(peakValue, units);
                unit = getTorqueUnit(units);
                break;
              case 'PCylMax':
                convertedValue = convertPressure(peakValue, units);
                unit = getPressureUnit(units);
                break;
              case 'TCylMax':
              case 'TUbMax':
                convertedValue = convertTemperature(peakValue, units);
                unit = getTemperatureUnit(units);
                precision = 0;
                break;
              default:
                convertedValue = peakValue; // No conversion for other params
                unit = '';
            }

            peaks.push({
              label: paramId,
              value: `${convertedValue.toFixed(precision)}${unit ? ` ${unit}` : ''}`,
              rpm: peak.rpm,
            });
          }
        });
      }
      break;
    }
  }

  return peaks;
}

/**
 * Format peak values for inline display
 * Example: "215.7 PS at 7800 RPM • 219.1 N·m at 6600 RPM"
 *
 * Responsive:
 * - Desktop: Inline with bullet separators
 * - Mobile (<768px): Stacked vertically
 */
function formatInlinePeaks(peaks: PeakValueItem[]): React.ReactNode {
  if (peaks.length === 0) return null;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm leading-5">
      {peaks.map((peak, index) => (
        <span key={index} className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-gray-100">
            <span className="font-semibold">{peak.value}</span>
            {' '}
            <span className="text-gray-600 dark:text-gray-400">at {peak.rpm} RPM</span>
          </span>
          {index < peaks.length - 1 && (
            <span className="text-gray-400 dark:text-gray-600 hidden md:inline">•</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function PeakValuesCards({
  calculations,
  preset,
  selectedParams,
}: PeakValuesCardsProps) {
  const units = useAppStore((state) => state.units);

  // Don't render if no calculations
  if (calculations.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {calculations.map((calc, index) => {
        const peaks = getPeakValuesForCalculation(calc, preset, units, selectedParams);

        if (peaks.length === 0) return null;

        return (
          <div
            key={index}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col gap-3"
          >
            {/* Line 1: Calculation Name with Color Dot (comparison mode only) */}
            <div className="flex items-center gap-3">
              {/* Show color dot only in comparison mode (≥2 calculations) */}
              {calculations.length > 1 && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: calc.color }}
                />
              )}
              <span className="text-base font-medium text-gray-900 dark:text-gray-100 leading-5">
                {calc.projectName} → {calc.calculationName}
              </span>
            </div>

            {/* Line 2: Peak Values (Inline) */}
            <div>
              {formatInlinePeaks(peaks)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
