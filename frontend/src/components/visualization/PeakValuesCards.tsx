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
 * Addendum v2.0.2 Changes (Preset 2 - MEP):
 * - Migrated to unified conversion API (convertValue, getParameterUnit)
 * - Preset 2 now shows MEP parameters (FMEP, IMEP, BMEP, PMEP) instead of PCylMax
 * - Per-cylinder MEP values (IMEP, BMEP, PMEP) are averaged across cylinders
 * - Added info icon with tooltip for Preset 2 to explain averaging
 * - Tooltip text: "Averaged values across all cylinders. To view per-cylinder data, use Custom Chart."
 *
 * Addendum v2.0.3 Changes (Preset 3 - Critical Values):
 * - Preset 3 now shows Critical Engine Values (PCylMax, TC-Av, MaxDeg)
 * - MaxDeg shows MINIMUM value (detonation risk if <14°)
 * - MaxDeg unit: °ATDC (degrees After Top Dead Center)
 * - ALL presets now show parameter labels before values for clarity
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
  convertValue,
  getParameterUnit,
} from '@/lib/unitsConversion';
import { PARAMETERS } from '@/config/parameters';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info } from 'lucide-react';

interface PeakValuesCardsProps {
  /** Array of calculations with loaded data */
  calculations: CalculationReference[];
  /** Current selected preset (1-6) to determine which peaks to show */
  preset: 1 | 2 | 3 | 4 | 5 | 6;
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
  preset: 1 | 2 | 3 | 4 | 5 | 6,
  units: 'si' | 'american' | 'hp',
  decimals: number,
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
          value: `${convertValue(powerPeak.value, 'P-Av', units).toFixed(decimals)} ${getParameterUnit('P-Av', units)}`,
          rpm: powerPeak.rpm,
        });
      }

      const torquePeak = findPeak(calc.data, 'Torque');
      if (torquePeak) {
        peaks.push({
          label: 'Torque',
          value: `${convertValue(torquePeak.value, 'Torque', units).toFixed(decimals)} ${getParameterUnit('Torque', units)}`,
          rpm: torquePeak.rpm,
        });
      }
      break;
    }

    case 2: {
      // Preset 2: MEP (Mean Effective Pressures)
      // Show averaged values for FMEP, IMEP, BMEP, PMEP
      const mepParameters = ['FMEP', 'IMEP', 'BMEP', 'PMEP'];

      mepParameters.forEach((paramName) => {
        const param = PARAMETERS[paramName];
        const isPerCylinder = param?.perCylinder || false;

        // Find peak with averaging for per-cylinder parameters
        let peak;
        if (isPerCylinder) {
          // For per-cylinder parameters (IMEP, BMEP, PMEP), find peak from averaged data
          let maxValue = -Infinity;
          let maxRpm = 0;

          calc.data!.forEach((point) => {
            const rawValue = (point as any)[paramName];
            if (Array.isArray(rawValue)) {
              const avg = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
              if (avg > maxValue) {
                maxValue = avg;
                maxRpm = point.RPM;
              }
            }
          });

          peak = maxValue > -Infinity ? { value: maxValue, rpm: maxRpm } : null;
        } else {
          // For scalar parameters (FMEP), use findPeak directly
          peak = findPeak(calc.data!, paramName);
        }

        if (peak) {
          // Educational visualization: invert sign for FMEP and PMEP to show energy losses
          // Formula: BMEP = IMEP - FMEP - PMEP
          const signMultiplier = (paramName === 'FMEP' || paramName === 'PMEP') ? -1 : 1;
          const displayValue = peak.value * signMultiplier;

          peaks.push({
            label: paramName,
            value: `${convertValue(displayValue, paramName, units).toFixed(decimals)} ${getParameterUnit(paramName, units)}`,
            rpm: peak.rpm,
          });
        }
      });
      break;
    }

    case 3: {
      // Preset 3: Critical Engine Values (PCylMax, TC-Av, MaxDeg)
      const criticalParameters = ['PCylMax', 'TC-Av', 'MaxDeg'];

      criticalParameters.forEach((paramName) => {
        const param = PARAMETERS[paramName];
        const isPerCylinder = param?.perCylinder || false;

        // MaxDeg: find MINIMUM (lower values = closer to detonation, dangerous if <14°)
        // PCylMax, TC-Av: find MAXIMUM
        const findMinimum = paramName === 'MaxDeg';

        // Find peak/min with averaging for per-cylinder parameters
        let peak;
        if (isPerCylinder) {
          // For per-cylinder parameters (PCylMax, MaxDeg), find peak/min from averaged data
          let extremeValue = findMinimum ? Infinity : -Infinity;
          let extremeRpm = 0;

          calc.data!.forEach((point) => {
            const rawValue = (point as any)[paramName];
            if (Array.isArray(rawValue)) {
              const avg = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
              const isExtreme = findMinimum ? (avg < extremeValue) : (avg > extremeValue);
              if (isExtreme) {
                extremeValue = avg;
                extremeRpm = point.RPM;
              }
            }
          });

          const isValid = findMinimum ? (extremeValue < Infinity) : (extremeValue > -Infinity);
          peak = isValid ? { value: extremeValue, rpm: extremeRpm } : null;
        } else {
          // For scalar parameters (TC-Av), use findPeak directly
          peak = findPeak(calc.data!, paramName);
        }

        if (peak) {
          // Determine precision based on parameter
          const precision = paramName === 'MaxDeg' ? 1 : (param?.category === 'temperature' ? 0 : 1);

          // MaxDeg has custom unit °ATDC
          const unit = paramName === 'MaxDeg' ? '°ATDC' : getParameterUnit(paramName, units);
          const value = paramName === 'MaxDeg' ? peak.value : convertValue(peak.value, paramName, units);

          peaks.push({
            label: paramName,
            value: `${value.toFixed(precision)} ${unit}`,
            rpm: peak.rpm,
          });
        }
      });
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
            value: `${convertValue(powerPeak.value, 'P-Av', units).toFixed(decimals)} ${getParameterUnit('P-Av', units)}`,
            rpm: powerPeak.rpm,
          });
        }

        const torquePeak = findPeak(calc.data, 'Torque');
        if (torquePeak) {
          peaks.push({
            label: 'Torque',
            value: `${convertValue(torquePeak.value, 'Torque', units).toFixed(decimals)} ${getParameterUnit('Torque', units)}`,
            rpm: torquePeak.rpm,
          });
        }
      } else {
        // Show peaks for selected parameters
        selectedParams.forEach((paramId) => {
          const peak = findPeak(calc.data!, paramId);
          if (peak) {
            // Determine precision based on parameter type
            const param = PARAMETERS[paramId];
            const precision = param?.category === 'temperature' ? 0 : 1;

            peaks.push({
              label: paramId,
              value: `${convertValue(peak.value, paramId, units).toFixed(precision)} ${getParameterUnit(paramId, units)}`,
              rpm: peak.rpm,
            });
          }
        });
      }
      break;
    }

    case 5: {
      // Preset 5: Combustion Parameters (TAF, Timing, Delay, Durat)
      // Delay and Durat are per-cylinder arrays → need averaging
      const combustionParameters = ['TAF', 'Timing', 'Delay', 'Durat'];

      combustionParameters.forEach((paramName) => {
        const param = PARAMETERS[paramName];
        const isPerCylinder = param?.perCylinder || false;

        // Find peak with averaging for per-cylinder parameters
        let peak;
        if (isPerCylinder) {
          // For per-cylinder parameters (Delay, Durat), find peak from averaged data
          let maxValue = -Infinity;
          let maxRpm = 0;

          calc.data!.forEach((point) => {
            const rawValue = (point as any)[paramName];
            if (Array.isArray(rawValue)) {
              const avg = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
              if (avg > maxValue) {
                maxValue = avg;
                maxRpm = point.RPM;
              }
            }
          });

          peak = maxValue > -Infinity ? { value: maxValue, rpm: maxRpm } : null;
        } else {
          // For scalar parameters (TAF, Timing), use findPeak directly
          peak = findPeak(calc.data!, paramName);
        }

        if (peak) {
          peaks.push({
            label: paramName,
            value: `${convertValue(peak.value, paramName, units).toFixed(decimals)} ${getParameterUnit(paramName, units)}`.trim(),
            rpm: peak.rpm,
          });
        }
      });
      break;
    }

    case 6: {
      // Preset 6: Efficiency Parameters (DRatio, PurCyl, Seff, Teff, Ceff)
      // All 5 efficiency parameters are per-cylinder arrays → need averaging
      const efficiencyParameters = ['DRatio', 'PurCyl', 'Seff', 'Teff', 'Ceff'];

      efficiencyParameters.forEach((paramName) => {
        const param = PARAMETERS[paramName];
        const isPerCylinder = param?.perCylinder || false;

        // Find peak with averaging for per-cylinder parameters
        let peak;
        if (isPerCylinder) {
          // For per-cylinder parameters, find peak from averaged data
          let maxValue = -Infinity;
          let maxRpm = 0;

          calc.data!.forEach((point) => {
            const rawValue = (point as any)[paramName];
            if (Array.isArray(rawValue)) {
              const avg = rawValue.reduce((sum: number, v: number) => sum + v, 0) / rawValue.length;
              if (avg > maxValue) {
                maxValue = avg;
                maxRpm = point.RPM;
              }
            }
          });

          peak = maxValue > -Infinity ? { value: maxValue, rpm: maxRpm } : null;
        } else {
          // For scalar parameters, use findPeak directly
          peak = findPeak(calc.data!, paramName);
        }

        if (peak) {
          // Special label for Ceff: show as "Ceff (VE)" for user clarity
          const displayLabel = paramName === 'Ceff' ? 'Ceff (VE)' : paramName;

          peaks.push({
            label: displayLabel,
            value: `${convertValue(peak.value, paramName, units).toFixed(decimals)} ${getParameterUnit(paramName, units)}`.trim(),
            rpm: peak.rpm,
          });
        }
      });
      break;
    }
  }

  return peaks;
}

/**
 * Format peak values for inline display
 *
 * Format with parameter labels:
 * - Preset 1: "P-Av: 215.7 PS at 7800 RPM • Torque: 219.1 N·m at 6600 RPM"
 * - Preset 2: "FMEP: 19.1 bar at 6800 RPM • IMEP: 15.5 bar at 5600 RPM"
 * - Preset 3: "PCylMax: 95.3 bar at 6800 RPM • TC-Av: 2456°C at 7800 RPM • MaxDeg: 9.5 °ATDC at 5600 RPM"
 * - Preset 4: Custom parameters with labels
 *
 * Responsive:
 * - Desktop: Inline with bullet separators
 * - Mobile (<768px): Stacked vertically
 */
function formatInlinePeaks(peaks: PeakValueItem[]): React.ReactNode {
  if (peaks.length === 0) return null;

  // Always show parameter labels for clarity
  const showLabels = true;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm leading-5">
      {peaks.map((peak, index) => (
        <span key={index} className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-gray-100">
            {showLabels && (
              <>
                <span className="font-semibold">{peak.label}:</span>
                {' '}
              </>
            )}
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
  const decimals = useAppStore((state) => state.chartSettings.decimals);

  // Don't render if no calculations
  if (calculations.length === 0) {
    return null;
  }

  // Tooltip texts for Preset 2 (MEP)
  const mepAveragingTooltip = "Averaged values across all cylinders. To view per-cylinder data, use Custom Chart.";
  const mepEducationalTooltip = "💡 FMEP and PMEP shown as negative for educational clarity: BMEP = IMEP - FMEP - PMEP";

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="w-full flex flex-col gap-3">
        {calculations.map((calc, index) => {
          const peaks = getPeakValuesForCalculation(calc, preset, units, decimals, selectedParams);

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

                {/* Info Icon with Tooltip (only for Preset 2 - MEP) */}
                {preset === 2 && (
                  <Tooltip.Root delayDuration={300}>
                    <Tooltip.Trigger asChild>
                      <button
                        className="inline-flex items-center justify-center rounded-full hover:bg-accent p-1.5 transition-colors flex-shrink-0 ml-auto"
                        aria-label="Information about MEP visualization"
                      >
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="top"
                        sideOffset={8}
                        className="max-w-sm rounded-md bg-popover px-4 py-3 text-sm text-popover-foreground shadow-md border border-border z-50"
                      >
                        <div className="space-y-2">
                          <p>{mepAveragingTooltip}</p>
                          <p className="border-t border-border pt-2">{mepEducationalTooltip}</p>
                        </div>
                        <Tooltip.Arrow className="fill-popover" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                )}
              </div>

              {/* Line 2: Peak Values (Inline) */}
              <div>
                {formatInlinePeaks(peaks)}
              </div>
            </div>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
}
