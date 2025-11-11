/**
 * RPM Section Component - Multi-RPM Selector (v3.1 - Educational)
 *
 * PV-Diagrams - Section 1
 *
 * Educational multi-select for RPM comparison:
 * - Checkbox-based selection (2-4 RPMs)
 * - Compare engine cycles across different speeds
 * - Clear visual indication of selected RPMs
 * - Color-coded for chart legend matching
 *
 * Features:
 * - Multi-select with checkboxes (max 4 RPMs)
 * - Shows peak pressure for each file
 * - "Clear All" button
 * - Integration with Zustand store (selectedRPMs)
 */

import { Gauge, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/stores/appStore';
import type { PVDFileInfo } from '@/types';

/**
 * RPM colors for chart visualization (matches chart series colors)
 */
const RPM_COLORS = [
  '#e74c3c', // RPM 1 - Red
  '#3498db', // RPM 2 - Blue
  '#2ecc71', // RPM 3 - Green
  '#f39c12', // RPM 4 - Orange
];

interface RPMSectionProps {
  /** List of available PVD files */
  files: PVDFileInfo[];
  /** Loading state */
  loading?: boolean;
}

/**
 * RPM Section Component (v3.1 - Educational Multi-Select)
 *
 * Manages multi-RPM selection for educational comparison.
 * Students can compare engine cycles at 2-4 different speeds.
 *
 * @example
 * ```tsx
 * <RPMSection files={pvdFiles} loading={false} />
 * ```
 */
export function RPMSection({ files, loading = false }: RPMSectionProps) {
  const selectedRPMs = useAppStore((state) => state.selectedRPMs);
  const addSelectedRPM = useAppStore((state) => state.addSelectedRPM);
  const removeSelectedRPM = useAppStore((state) => state.removeSelectedRPM);
  const clearSelectedRPMs = useAppStore((state) => state.clearSelectedRPMs);

  // Handle checkbox toggle
  const handleToggleRPM = (fileName: string, checked: boolean) => {
    if (checked) {
      addSelectedRPM(fileName);
    } else {
      removeSelectedRPM(fileName);
    }
  };

  // Calculate max/min peak pressure for badges
  const maxPressure = files.length > 0 ? Math.max(...files.map(f => f.peakPressure)) : 0;
  const minPressure = files.length > 0 ? Math.min(...files.map(f => f.peakPressure)) : 0;
  const hasMultipleFiles = files.length > 1;

  // ====================================================================
  // Empty State - No Files Available
  // ====================================================================

  if (files.length === 0 && !loading) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            RPM Comparison
          </h3>
        </div>

        <div className="text-center py-6 space-y-3">
          <div className="text-4xl">📈</div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              No PV-Diagram Files Found
            </p>
            <p className="text-xs text-muted-foreground">
              Upload .pvd files to this project
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // Multi-Select State - Show Checkboxes
  // ====================================================================

  return (
    <div className="p-4 bg-muted/30 rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            RPM Comparison
          </h3>
        </div>
        {selectedRPMs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelectedRPMs}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Info Label */}
      <Label className="text-xs text-muted-foreground mb-3 block">
        Select 2-4 RPMs to compare engine cycles
      </Label>

      {/* Checkbox List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {files.map((file) => {
          const isSelected = selectedRPMs.includes(file.fileName);
          const selectionIndex = selectedRPMs.indexOf(file.fileName);
          const color = selectionIndex >= 0 ? RPM_COLORS[selectionIndex] : undefined;

          return (
            <div
              key={file.fileName}
              className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                id={`rpm-${file.fileName}`}
                checked={isSelected}
                onCheckedChange={(checked) => handleToggleRPM(file.fileName, checked === true)}
                disabled={loading || (!isSelected && selectedRPMs.length >= 4)}
                className="mt-0.5"
              />
              <label
                htmlFor={`rpm-${file.fileName}`}
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {/* Color Dot (if selected) */}
                  {isSelected && color && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {file.rpm} RPM
                  </span>
                  {/* Max/Min Badges (iPhone-style) */}
                  {hasMultipleFiles && file.peakPressure === maxPressure && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-700 dark:text-orange-400">
                      Max
                    </span>
                  )}
                  {hasMultipleFiles && file.peakPressure === minPressure && maxPressure !== minPressure && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400">
                      Min
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Peak: {file.peakPressure.toFixed(1)} bar @ {file.peakPressureAngle.toFixed(0)}°
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Selection Count */}
      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground text-center">
        {selectedRPMs.length === 0 && 'No RPMs selected'}
        {selectedRPMs.length === 1 && '1 RPM selected'}
        {selectedRPMs.length > 1 && `${selectedRPMs.length} RPMs selected (comparing)`}
        {selectedRPMs.length >= 4 && ' • Max reached'}
      </div>
    </div>
  );
}

export default RPMSection;
