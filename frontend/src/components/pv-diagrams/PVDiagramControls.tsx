import type { PVDFileInfo } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PVDiagramControlsProps {
  /** List of available PVD files */
  files: PVDFileInfo[];
  /** Currently selected file name */
  selectedFileName: string | null;
  /** Callback when file selection changes */
  onFileChange: (fileName: string) => void;
  /** Number of cylinders in selected file */
  numCylinders: number;
  /** Currently selected cylinder (0-based index, null = all) */
  selectedCylinder: number | null;
  /** Callback when cylinder selection changes */
  onCylinderChange: (cylinder: number | null) => void;
}

/**
 * Controls for PV-Diagram chart
 *
 * Provides:
 * - RPM selector dropdown (select .pvd file)
 * - Cylinder selector dropdown (select specific cylinder or "All")
 *
 * @example
 * ```tsx
 * <PVDiagramControls
 *   files={pvdFiles}
 *   selectedFileName={selectedFile}
 *   onFileChange={setSelectedFile}
 *   numCylinders={4}
 *   selectedCylinder={0}
 *   onCylinderChange={setSelectedCylinder}
 * />
 * ```
 */
export function PVDiagramControls({
  files,
  selectedFileName,
  onFileChange,
  numCylinders,
  selectedCylinder,
  onCylinderChange,
}: PVDiagramControlsProps) {
  // Find selected file to display RPM and peak pressure info
  const selectedFile = files.find((f) => f.fileName === selectedFileName);

  return (
    <div className="flex flex-wrap gap-6 p-4 bg-muted/30 rounded-lg border">
      {/* RPM Selector */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        <Label htmlFor="rpm-select" className="text-sm font-medium">
          RPM Selection
        </Label>
        <Select
          value={selectedFileName || undefined}
          onValueChange={onFileChange}
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
        {selectedFile && (
          <div className="text-xs text-muted-foreground">
            Peak pressure: <span className="font-medium">{selectedFile.peakPressure.toFixed(2)} bar</span>
            {' '}@ {selectedFile.peakPressureAngle.toFixed(1)}° ATDC
          </div>
        )}
      </div>

      {/* Cylinder Selector */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        <Label htmlFor="cylinder-select" className="text-sm font-medium">
          Cylinder Selection
        </Label>
        <Select
          value={selectedCylinder === null ? 'all' : String(selectedCylinder)}
          onValueChange={(value) => {
            if (value === 'all') {
              onCylinderChange(null);
            } else {
              onCylinderChange(parseInt(value, 10));
            }
          }}
        >
          <SelectTrigger id="cylinder-select" className="w-full">
            <SelectValue placeholder="Select cylinder..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="font-medium">All Cylinders</span>
            </SelectItem>
            {Array.from({ length: numCylinders }, (_, i) => (
              <SelectItem key={i} value={String(i)}>
                Cylinder {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground">
          {selectedCylinder === null
            ? `Showing all ${numCylinders} cylinders`
            : `Showing cylinder ${selectedCylinder + 1} of ${numCylinders}`}
        </div>
      </div>

      {/* File info */}
      {selectedFile && (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <Label className="text-sm font-medium">File Info</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              <span className="font-medium">{selectedFile.fileName}</span>
            </div>
            <div>
              Engine: <span className="font-medium">{selectedFile.engineType}</span>,{' '}
              {selectedFile.cylinders} cylinders
            </div>
            <div>
              Data points: <span className="font-medium">{selectedFile.dataPoints}</span>{' '}
              (0-720° crank angle)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
