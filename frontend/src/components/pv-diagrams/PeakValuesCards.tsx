/**
 * Peak Values Cards Component
 *
 * Displays 3 stat cards below PV-Diagram chart:
 * 1. Max Pressure (bar) - with cylinder and angle
 * 2. Min Pressure (bar) - with cylinder and angle
 * 3. Volume Range (cm³) - displacement range
 *
 * Pattern: Grid layout (3 columns), responsive cards
 */

import type { PVDData } from '@/types';
import { findMaxPressure, findMinPressure, calculateVolumeRange } from '@/lib/pvDiagramUtils';

interface PeakValuesCardsProps {
  /** PVD data */
  data: PVDData | null;
  /** Selected cylinder (null = all) */
  selectedCylinder: number | null;
}

/**
 * Peak Values Cards
 *
 * Shows key statistics from PV-Diagram data.
 * Updates dynamically when data or cylinder selection changes.
 *
 * @example
 * ```tsx
 * <PeakValuesCards data={pvdData} selectedCylinder={0} />
 * ```
 */
export function PeakValuesCards({ data, selectedCylinder }: PeakValuesCardsProps) {
  if (!data) {
    return null;
  }

  const maxPressure = findMaxPressure(data, selectedCylinder);
  const minPressure = findMinPressure(data, selectedCylinder);
  const volumeRange = calculateVolumeRange(data, selectedCylinder);

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {/* Card 1: Max Pressure */}
      <div className="bg-card border rounded-lg p-3">
        <div className="text-xs text-muted-foreground mb-1">Max Pressure</div>
        <div className="text-xl font-bold">
          {maxPressure ? maxPressure.value.toFixed(2) : '—'}
          <span className="text-sm font-normal text-muted-foreground ml-1">bar</span>
        </div>
        {maxPressure && (
          <div className="text-xs text-muted-foreground mt-1">
            Cyl {maxPressure.cylinderNum} @ {maxPressure.angle.toFixed(0)}°
          </div>
        )}
      </div>

      {/* Card 2: Min Pressure */}
      <div className="bg-card border rounded-lg p-3">
        <div className="text-xs text-muted-foreground mb-1">Min Pressure</div>
        <div className="text-xl font-bold">
          {minPressure ? minPressure.value.toFixed(2) : '—'}
          <span className="text-sm font-normal text-muted-foreground ml-1">bar</span>
        </div>
        {minPressure && (
          <div className="text-xs text-muted-foreground mt-1">
            Cyl {minPressure.cylinderNum} @ {minPressure.angle.toFixed(0)}°
          </div>
        )}
      </div>

      {/* Card 3: Volume Range */}
      <div className="bg-card border rounded-lg p-3">
        <div className="text-xs text-muted-foreground mb-1">Volume Range</div>
        <div className="text-xl font-bold">
          {volumeRange ? volumeRange.range.toFixed(0) : '—'}
          <span className="text-sm font-normal text-muted-foreground ml-1">cm³</span>
        </div>
        {volumeRange && (
          <div className="text-xs text-muted-foreground mt-1">
            {volumeRange.min.toFixed(0)} — {volumeRange.max.toFixed(0)} cm³
          </div>
        )}
      </div>
    </div>
  );
}
