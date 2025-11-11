/**
 * Peak Values Cards Component (v3.1 - Educational Multi-RPM)
 *
 * Displays 3 stat cards below PV-Diagram chart:
 * 1. Max Pressure (bar) - across all selected RPMs
 * 2. Min Pressure (bar) - across all selected RPMs
 * 3. Volume Range (cm³) - displacement range
 *
 * Multi-RPM: Shows min/max across ALL selected RPMs for comparison
 * Pattern: Grid layout (3 columns), responsive cards
 */

import type { PVDDataItem } from '@/hooks/usePVDData';

interface PeakValuesCardsProps {
  /** Array of PVD data items (multi-RPM) */
  dataArray: PVDDataItem[];
}

/**
 * Peak Values Cards (v3.1 - Multi-RPM)
 *
 * Shows key statistics across all selected RPMs (Cylinder 1 only).
 * Updates dynamically when RPM selection changes.
 *
 * @example
 * ```tsx
 * <PeakValuesCards dataArray={[...]} />
 * ```
 */
export function PeakValuesCards({ dataArray }: PeakValuesCardsProps) {
  if (dataArray.length === 0) {
    return null;
  }

  // Calculate stats across ALL selected RPMs (Cylinder 1 only)
  let maxPressure = -Infinity;
  let minPressure = Infinity;
  let maxVolume = -Infinity;
  let minVolume = Infinity;

  dataArray.forEach(({ data }) => {
    data.data.forEach((point) => {
      const cyl = point.cylinders[0]; // Cylinder 1 only
      maxPressure = Math.max(maxPressure, cyl.pressure);
      minPressure = Math.min(minPressure, cyl.pressure);
      maxVolume = Math.max(maxVolume, cyl.volume);
      minVolume = Math.min(minVolume, cyl.volume);
    });
  });

  const volumeRange = maxVolume - minVolume;

  const label = dataArray.length > 1 ? `(across ${dataArray.length} RPMs)` : '';

  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {/* Card 1: Max Pressure */}
      <div className="bg-card border rounded-lg p-3">
        <div className="text-xs text-muted-foreground mb-1">
          Max Pressure {label}
        </div>
        <div className="text-xl font-bold">
          {maxPressure.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground ml-1">bar</span>
        </div>
      </div>

      {/* Card 2: Min Pressure */}
      <div className="bg-card border rounded-lg p-3">
        <div className="text-xs text-muted-foreground mb-1">
          Min Pressure {label}
        </div>
        <div className="text-xl font-bold">
          {minPressure.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground ml-1">bar</span>
        </div>
      </div>

      {/* Card 3: Volume Range */}
      <div className="bg-card border rounded-lg p-3">
        <div className="text-xs text-muted-foreground mb-1">
          Volume Range {label}
        </div>
        <div className="text-xl font-bold">
          {volumeRange.toFixed(0)}
          <span className="text-sm font-normal text-muted-foreground ml-1">cm³</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {minVolume.toFixed(0)} — {maxVolume.toFixed(0)} cm³
        </div>
      </div>
    </div>
  );
}
