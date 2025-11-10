/**
 * RPM Section Component - RPM File Selector
 *
 * PV-Diagrams - Section 1
 *
 * Two states:
 * 1. Empty state (no RPM selected): Shows "Select RPM..." message
 * 2. Selected state (RPM selected): Shows selected file details
 *
 * Features:
 * - Displays selected .pvd file metadata (RPM, peak pressure, peak angle)
 * - Dropdown selector for .pvd files
 * - Auto-selects first file when available
 * - Integration with Zustand store (selectedRPM)
 */

import { Gauge } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/stores/appStore';
import type { PVDFileInfo } from '@/types';

interface RPMSectionProps {
  /** List of available PVD files */
  files: PVDFileInfo[];
  /** Loading state */
  loading?: boolean;
}

/**
 * RPM Section Component
 *
 * Manages RPM file selection and display for PV-Diagrams.
 * Shows empty state when no files available or no RPM selected,
 * or file details when selected.
 *
 * @example
 * ```tsx
 * <RPMSection files={pvdFiles} loading={false} />
 * ```
 */
export function RPMSection({ files, loading = false }: RPMSectionProps) {
  const selectedRPM = useAppStore((state) => state.selectedRPM);
  const setSelectedRPM = useAppStore((state) => state.setSelectedRPM);

  // Find selected file metadata
  const selectedFile = files.find((f) => f.fileName === selectedRPM);

  // ====================================================================
  // Empty State - No Files Available
  // ====================================================================

  if (files.length === 0 && !loading) {
    return (
      <div className="p-4 bg-muted/30 rounded-lg border">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            RPM Selection
          </h3>
        </div>

        {/* Empty State Content */}
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
  // Selector State - Show Dropdown
  // ====================================================================

  return (
    <div className="p-4 bg-muted/30 rounded-lg border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          RPM Selection
        </h3>
      </div>

      {/* Dropdown Selector */}
      <div className="space-y-2">
        <Label htmlFor="rpm-select" className="text-xs text-muted-foreground">
          Select RPM to display PV-Diagram
        </Label>
        <Select
          value={selectedRPM || undefined}
          onValueChange={setSelectedRPM}
          disabled={loading}
        >
          <SelectTrigger id="rpm-select" className="w-full">
            <SelectValue placeholder="Select RPM..." />
          </SelectTrigger>
          <SelectContent>
            {files.map((file) => (
              <SelectItem key={file.fileName} value={file.fileName}>
                <div className="flex items-center justify-between w-full gap-4">
                  <span className="font-medium">{file.rpm} RPM</span>
                  <span className="text-xs text-muted-foreground">
                    Peak: {file.peakPressure.toFixed(1)} bar
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected File Details */}
      {selectedFile && (
        <div className="mt-3 pt-3 border-t space-y-1">
          {/* File Name */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {selectedFile.fileName}
            </span>
          </div>

          {/* Peak Pressure Info */}
          <div className="text-xs text-muted-foreground">
            Peak pressure: <span className="font-medium">{selectedFile.peakPressure.toFixed(2)} bar</span>
            {' '}@ {selectedFile.peakPressureAngle.toFixed(1)}° ATDC
          </div>

          {/* Engine Info */}
          <div className="text-xs text-muted-foreground">
            {selectedFile.engineType} • {selectedFile.cylinders} cylinders • {selectedFile.dataPoints} data points
          </div>
        </div>
      )}
    </div>
  );
}

export default RPMSection;
