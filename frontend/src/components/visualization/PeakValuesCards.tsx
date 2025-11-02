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
          value: `${convertValue(powerPeak.value, 'P-Av', units).toFixed(1)} ${getParameterUnit('P-Av', units)}`,
          rpm: powerPeak.rpm,
        });
      }

      const torquePeak = findPeak(calc.data, 'Torque');
      if (torquePeak) {
        peaks.push({
          label: 'Torque',
          value: `${convertValue(torquePeak.value, 'Torque', units).toFixed(1)} ${getParameterUnit('Torque', units)}`,
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
          peaks.push({
            label: paramName,
            value: `${convertValue(peak.value, paramName, units).toFixed(1)} ${getParameterUnit(paramName, units)}`,
            rpm: peak.rpm,
          });
        }
      });
      break;
    }

    case 3: {
      // Preset 3: Temperature (TCylMax & TUbMax)
      const tCylMaxPeak = findPeak(calc.data, 'TCylMax');
      if (tCylMaxPeak) {
        // Data already in °C, just apply unit conversion (°C ↔ °F)
        peaks.push({
          label: 'TCylMax',
          value: `${convertValue(tCylMaxPeak.value, 'TCylMax', units).toFixed(0)} ${getParameterUnit('TCylMax', units)}`,
          rpm: tCylMaxPeak.rpm,
        });
      }

      const tUbMaxPeak = findPeak(calc.data, 'TUbMax');
      if (tUbMaxPeak) {
        // Data already in °C, just apply unit conversion (°C ↔ °F)
        peaks.push({
          label: 'TUbMax',
          value: `${convertValue(tUbMaxPeak.value, 'TUbMax', units).toFixed(0)} ${getParameterUnit('TUbMax', units)}`,
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
            value: `${convertValue(powerPeak.value, 'P-Av', units).toFixed(1)} ${getParameterUnit('P-Av', units)}`,
            rpm: powerPeak.rpm,
          });
        }

        const torquePeak = findPeak(calc.data, 'Torque');
        if (torquePeak) {
          peaks.push({
            label: 'Torque',
            value: `${convertValue(torquePeak.value, 'Torque', units).toFixed(1)} ${getParameterUnit('Torque', units)}`,
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
  }

  return peaks;
}

/**
 * Format peak values for inline display
 *
 * Format varies by preset:
 * - Preset 1: "215.7 PS at 7800 RPM • 219.1 N·m at 6600 RPM" (no labels - different units)
 * - Preset 2: "FMEP: 19.1 bar at 6800 RPM • IMEP: 15.5 bar at 5600 RPM" (with labels - same units)
 * - Preset 3+: Standard format without labels
 *
 * Responsive:
 * - Desktop: Inline with bullet separators
 * - Mobile (<768px): Stacked vertically
 */
function formatInlinePeaks(peaks: PeakValueItem[], preset: 1 | 2 | 3 | 4): React.ReactNode {
  if (peaks.length === 0) return null;

  // For Preset 2 (MEP), include parameter labels since all share same unit
  const showLabels = preset === 2;

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

  // Don't render if no calculations
  if (calculations.length === 0) {
    return null;
  }

  // Tooltip text for Preset 2 (MEP - averaged values)
  const mepTooltipText = "Averaged values across all cylinders. To view per-cylinder data, use Custom Chart.";

  return (
    <Tooltip.Provider delayDuration={300}>
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

                {/* Info Icon with Tooltip (only for Preset 2 - MEP) */}
                {preset === 2 && (
                  <Tooltip.Root delayDuration={300}>
                    <Tooltip.Trigger asChild>
                      <button
                        className="inline-flex items-center justify-center rounded-full hover:bg-accent p-1.5 transition-colors flex-shrink-0 ml-auto"
                        aria-label="Information about averaged MEP values"
                      >
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="top"
                        sideOffset={8}
                        className="max-w-xs rounded-md bg-popover px-4 py-3 text-sm text-popover-foreground shadow-md border border-border z-50"
                      >
                        <p>{mepTooltipText}</p>
                        <Tooltip.Arrow className="fill-popover" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                )}
              </div>

              {/* Line 2: Peak Values (Inline) */}
              <div>
                {formatInlinePeaks(peaks, preset)}
              </div>
            </div>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
}
