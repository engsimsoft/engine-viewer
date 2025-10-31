/**
 * Peak Values Cards Component
 *
 * Displays peak values for each calculation in a card grid layout.
 * Different peak values are shown based on the selected preset.
 *
 * Features:
 * - Responsive grid layout (2 columns on desktop, 1 on mobile)
 * - Color indicators matching calculation colors
 * - Trophy icon for peak values
 * - Units conversion applied
 * - Different layouts per preset
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
            label: `PCylMax Cyl ${cylIndex + 1}`,
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
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        Peak Values
      </h3>

      {/* Grid layout: 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {calculations.map((calc, index) => {
          const peaks = getPeakValuesForCalculation(calc, preset, units, selectedParams);

          if (peaks.length === 0) return null;

          return (
            <div
              key={index}
              className="bg-muted/30 rounded-lg border-2 border-border p-4"
            >
              {/* Header with color indicator and calculation label */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: calc.color }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {calc.projectName} → {calc.calculationName}
                  </h4>
                </div>
              </div>

              {/* Peak values list */}
              <div className="space-y-2">
                {peaks.map((peak, peakIndex) => (
                  <div
                    key={peakIndex}
                    className="flex items-start justify-between gap-3 py-2 px-3 bg-background/50 rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">🏆</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-muted-foreground">
                          {peak.label}
                        </div>
                        <div className="text-xs text-muted-foreground/70">
                          at {peak.rpm} RPM
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-foreground whitespace-nowrap">
                      {peak.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
