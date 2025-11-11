/**
 * Peak Values Cards Component (v3.1.3 - Per-RPM Cards)
 *
 * Displays one full-width card per selected RPM below PV-Diagram chart.
 * Each card shows:
 * - Colored dot (matching graph series color)
 * - RPM value
 * - Inline stats: Max Pressure @ angle, Min Pressure, Volume Range
 *
 * Pattern: Matches Performance page multi-calculation cards
 * Educational: Clear per-RPM comparison for students
 */

import type { PVDDataItem } from '@/hooks/usePVDData';
import { RPM_COLORS } from './chartOptionsHelpers';

interface PeakValuesCardsProps {
  /** Array of PVD data items (multi-RPM) */
  dataArray: PVDDataItem[];
}

interface RPMStats {
  rpm: number;
  color: string;
  maxPressure: number;
  maxPressureAngle: number; // Physical angle (e.g., 14° ATDC)
  maxPressureAngleModified: number; // TDC2-shifted (e.g., 374°)
  minPressure: number;
  maxVolume: number;
  minVolume: number;
  volumeRange: number;
}

/**
 * Calculate statistics for a single RPM
 */
function calculateRPMStats(item: PVDDataItem, colorIndex: number): RPMStats {
  const { rpm, data } = item;
  const lastCylinderIndex = data.data[0].cylinders.length - 1;

  let maxPressure = -Infinity;
  let maxPressureAngle = 0;
  let minPressure = Infinity;
  let maxVolume = -Infinity;
  let minVolume = Infinity;

  data.data.forEach((point) => {
    const cyl = point.cylinders[lastCylinderIndex];
    if (cyl.pressure > maxPressure) {
      maxPressure = cyl.pressure;
      maxPressureAngle = point.deg; // Physical angle
    }
    minPressure = Math.min(minPressure, cyl.pressure);
    maxVolume = Math.max(maxVolume, cyl.volume);
    minVolume = Math.min(minVolume, cyl.volume);
  });

  const volumeRange = maxVolume - minVolume;
  const maxPressureAngleModified = (maxPressureAngle + 360) % 720;

  return {
    rpm,
    color: RPM_COLORS[colorIndex % RPM_COLORS.length],
    maxPressure,
    maxPressureAngle,
    maxPressureAngleModified,
    minPressure,
    maxVolume,
    minVolume,
    volumeRange,
  };
}

/**
 * Peak Values Cards (v3.1.3 - Per-RPM)
 *
 * Shows one card per RPM with inline statistics.
 * Pattern matches Performance page for UX consistency.
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

  // Calculate stats for each RPM
  const rpmStats = dataArray.map((item, index) => calculateRPMStats(item, index));

  return (
    <div className="w-full flex flex-col gap-3 mt-4">
      {rpmStats.map((stats, index) => (
        <div
          key={stats.rpm}
          className="w-full bg-card border rounded-xl px-6 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out flex flex-col gap-3"
        >
          {/* Line 1: Color Dot + RPM (show dot only in comparison mode) */}
          <div className="flex items-center gap-3">
            {dataArray.length > 1 && (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: stats.color }}
              />
            )}
            <span className="text-base font-medium leading-5">
              {stats.rpm} RPM
            </span>
          </div>

          {/* Line 2: Inline Stats */}
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm leading-5">
            {/* Max Pressure */}
            <span className="flex items-center gap-2">
              <span className="text-foreground">
                <span className="font-semibold">Max:</span>
                {' '}
                <span className="font-semibold">{stats.maxPressure.toFixed(2)} bar</span>
                {' '}
                <span className="text-muted-foreground">
                  at <span className="font-semibold text-foreground">{stats.maxPressureAngle.toFixed(0)}°</span> ({stats.maxPressureAngleModified.toFixed(0)}°)
                </span>
              </span>
            </span>

            {/* Separator */}
            <span className="text-muted-foreground hidden md:inline">•</span>

            {/* Min Pressure */}
            <span className="text-foreground">
              <span className="font-semibold">Min:</span>
              {' '}
              <span className="font-semibold">{stats.minPressure.toFixed(2)} bar</span>
            </span>

            {/* Separator */}
            <span className="text-muted-foreground hidden md:inline">•</span>

            {/* Volume Range */}
            <span className="text-foreground">
              <span className="font-semibold">Volume:</span>
              {' '}
              <span className="font-semibold">{stats.volumeRange.toFixed(0)} cm³</span>
              {' '}
              <span className="text-muted-foreground text-xs">
                ({stats.minVolume.toFixed(0)} — {stats.maxVolume.toFixed(0)} cm³)
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
