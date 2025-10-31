/**
 * Live Cursor Panel Component
 *
 * Floating panel that follows mouse cursor on charts and displays
 * real-time values for all calculations at the current RPM position.
 *
 * Features:
 * - Tracks mouse position on chart
 * - Snaps to nearest RPM data point
 * - Shows values for all calculations
 * - Smooth fade in/out animations
 * - Units conversion applied
 *
 * @example
 * ```tsx
 * <LiveCursorPanel
 *   calculations={calculations}
 *   currentRpm={3400}
 *   isVisible={true}
 *   position={{ x: 100, y: 50 }}
 * />
 * ```
 */

import { useMemo } from 'react';
import type { CalculationReference } from '@/types/v2';
import { useAppStore } from '@/stores/appStore';
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

interface LiveCursorPanelProps {
  /** Array of calculations with loaded data */
  calculations: CalculationReference[];
  /** Current RPM position (snapped to nearest data point) */
  currentRpm: number | null;
  /** Whether panel is visible */
  isVisible: boolean;
  /** Mouse position for panel positioning */
  position: { x: number; y: number } | null;
  /** Current selected preset (1-4) to determine which values to show */
  preset: 1 | 2 | 3 | 4;
}

interface CursorValue {
  calculationLabel: string;
  color: string;
  values: { label: string; value: string }[];
}

/**
 * Find data point at specific RPM for a calculation
 */
function findDataPointAtRpm(
  calc: CalculationReference,
  rpm: number
): any | null {
  if (!calc.data || calc.data.length === 0) return null;

  // Find exact match or nearest RPM
  const dataPoint = calc.data.find((point) => point.RPM === rpm);
  if (dataPoint) return dataPoint;

  // If no exact match, find nearest
  let nearest = calc.data[0];
  let minDiff = Math.abs(calc.data[0].RPM - rpm);

  for (const point of calc.data) {
    const diff = Math.abs(point.RPM - rpm);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = point;
    }
  }

  return nearest;
}

export function LiveCursorPanel({
  calculations,
  currentRpm,
  isVisible,
  position,
  preset,
}: LiveCursorPanelProps) {
  const units = useAppStore((state) => state.units);

  // Calculate cursor values for each calculation at current RPM
  const cursorValues = useMemo((): CursorValue[] => {
    if (!currentRpm) return [];

    const values: CursorValue[] = [];

    calculations.forEach((calc) => {
      const dataPoint = findDataPointAtRpm(calc, currentRpm);
      if (!dataPoint) return;

      const label = `${calc.projectName} → ${calc.calculationName}`;
      const calcValues: { label: string; value: string }[] = [];

      // Format values based on preset
      switch (preset) {
        case 1: // Power & Torque
          const power = convertPower(dataPoint['P-Av'], units);
          const torque = convertTorque(dataPoint.Torque, units);
          calcValues.push({
            label: 'P-Av',
            value: `${power.toFixed(1)} ${getPowerUnit(units)}`,
          });
          calcValues.push({
            label: 'Torque',
            value: `${torque.toFixed(1)} ${getTorqueUnit(units)}`,
          });
          break;

        case 2: // Cylinder Pressure
          // Show average PCylMax across all cylinders
          const avgPressure =
            dataPoint.PCylMax.reduce((sum: number, p: number) => sum + p, 0) /
            dataPoint.PCylMax.length;
          const pressure = convertPressure(avgPressure, units);
          calcValues.push({
            label: 'PCylMax (avg)',
            value: `${pressure.toFixed(1)} ${getPressureUnit(units)}`,
          });
          break;

        case 3: // Temperature
          // Show average TCylMax and TUbMax
          const avgTCylMax =
            dataPoint.TCylMax.reduce((sum: number, t: number) => sum + t, 0) /
            dataPoint.TCylMax.length;
          const avgTUbMax =
            dataPoint.TUbMax.reduce((sum: number, t: number) => sum + t, 0) /
            dataPoint.TUbMax.length;

          // Convert K → °C first
          const tCyl = convertTemperature(avgTCylMax - 273.15, units);
          const tUb = convertTemperature(avgTUbMax - 273.15, units);

          calcValues.push({
            label: 'TCylMax (avg)',
            value: `${tCyl.toFixed(0)} ${getTemperatureUnit(units)}`,
          });
          calcValues.push({
            label: 'TUbMax (avg)',
            value: `${tUb.toFixed(0)} ${getTemperatureUnit(units)}`,
          });
          break;

        case 4: // Custom - show P-Av and Torque as default
          const customPower = convertPower(dataPoint['P-Av'], units);
          const customTorque = convertTorque(dataPoint.Torque, units);
          calcValues.push({
            label: 'P-Av',
            value: `${customPower.toFixed(1)} ${getPowerUnit(units)}`,
          });
          calcValues.push({
            label: 'Torque',
            value: `${customTorque.toFixed(1)} ${getTorqueUnit(units)}`,
          });
          break;
      }

      values.push({
        calculationLabel: label,
        color: calc.color,
        values: calcValues,
      });
    });

    return values;
  }, [calculations, currentRpm, preset, units]);

  // Don't render if not visible or no RPM
  if (!isVisible || !currentRpm || !position || cursorValues.length === 0) {
    return null;
  }

  // Calculate panel position (offset from cursor to avoid overlap)
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x + 20}px`,
    top: `${position.y - 20}px`,
    zIndex: 1000,
    pointerEvents: 'none', // Don't block mouse events
  };

  return (
    <div
      style={panelStyle}
      className="bg-background/95 backdrop-blur-sm border-2 border-border rounded-lg shadow-lg p-3 animate-in fade-in duration-300"
    >
      {/* Header with current RPM */}
      <div className="text-sm font-semibold text-muted-foreground mb-2 border-b border-border pb-1">
        Live Cursor ({currentRpm} RPM)
      </div>

      {/* Values for each calculation */}
      <div className="space-y-2">
        {cursorValues.map((cursorVal, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
              style={{ backgroundColor: cursorVal.color }}
            />

            {/* Calculation label and values */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate mb-0.5">
                {cursorVal.calculationLabel}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {cursorVal.values.map((val, valIndex) => (
                  <span key={valIndex} className="whitespace-nowrap">
                    {val.label}: <span className="font-medium text-foreground">{val.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
