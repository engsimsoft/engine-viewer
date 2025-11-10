import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PVDiagramChart } from '@/components/pv-diagrams/PVDiagramChart';
import { PVDiagramControls } from '@/components/pv-diagrams/PVDiagramControls';
import { usePVDFiles } from '@/hooks/usePVDFiles';
import { usePVDData } from '@/hooks/usePVDData';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ErrorMessage from '@/components/shared/ErrorMessage';

/**
 * PV-Diagram Test Page - Integration test for Stage 3
 *
 * Tests the complete data flow:
 * 1. Load list of .pvd files (usePVDFiles)
 * 2. User selects RPM from dropdown (PVDiagramControls)
 * 3. Load specific .pvd file data (usePVDData)
 * 4. Display chart (PVDiagramChart)
 * 5. User selects cylinder → chart updates
 *
 * Usage: /project/:id/pv-diagram-test
 * Example: /project/4_Cyl_ITB/pv-diagram-test
 */
export default function PVDiagramTestPage() {
  const { id: projectId } = useParams<{ id: string }>();

  // Load list of .pvd files with metadata
  const { files, loading: filesLoading, error: filesError, refetch: refetchFiles } = usePVDFiles(projectId);

  // State for selected file and cylinder
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedCylinder, setSelectedCylinder] = useState<number | null>(null); // null = "All"

  // Load specific .pvd file data
  const { data, loading: dataLoading, error: dataError, refetch: refetchData } = usePVDData(projectId, selectedFileName || undefined);

  // Auto-select first file when files are loaded
  useEffect(() => {
    if (files.length > 0 && !selectedFileName) {
      setSelectedFileName(files[0].fileName);
    }
  }, [files, selectedFileName]);

  // Handle file selection change
  const handleFileChange = (fileName: string) => {
    setSelectedFileName(fileName);
    // Reset cylinder selection when file changes
    setSelectedCylinder(null);
  };

  // Handle cylinder selection change
  const handleCylinderChange = (cylinder: number | null) => {
    setSelectedCylinder(cylinder);
  };

  // Loading state for files list
  if (filesLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">PV-Diagram Test Page</h1>
        <div className="flex items-center justify-center h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Error state for files list
  if (filesError) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">PV-Diagram Test Page</h1>
        <ErrorMessage message={filesError} onRetry={refetchFiles} />
      </div>
    );
  }

  // Empty state - no .pvd files found
  if (files.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">PV-Diagram Test Page</h1>
        <div className="flex items-center justify-center h-[400px] bg-muted/20 rounded-lg border-2 border-dashed">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-muted-foreground">
              No PV-Diagram files found
            </p>
            <p className="text-sm text-muted-foreground">
              Project: {projectId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get number of cylinders from loaded data or selected file metadata
  const numCylinders = data?.metadata.cylinders || files.find((f) => f.fileName === selectedFileName)?.cylinders || 1;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">PV-Diagram Test Page</h1>
        <p className="text-sm text-muted-foreground">
          Project: <span className="font-medium">{projectId}</span> • Files: {files.length} • RPM Range: {Math.min(...files.map(f => f.rpm))}-{Math.max(...files.map(f => f.rpm))} RPM
        </p>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-muted/20 rounded-lg border text-xs font-mono space-y-1">
        <div><strong>Debug Info:</strong></div>
        <div>Selected File: {selectedFileName || 'none'}</div>
        <div>Selected Cylinder: {selectedCylinder === null ? 'All' : `Cylinder ${selectedCylinder + 1}`}</div>
        <div>Data Loading: {dataLoading ? 'true' : 'false'}</div>
        <div>Data Points: {data?.data.length || 0}</div>
        <div>Cylinders: {numCylinders}</div>
      </div>

      {/* Controls */}
      <PVDiagramControls
        files={files}
        selectedFileName={selectedFileName}
        onFileChange={handleFileChange}
        numCylinders={numCylinders}
        selectedCylinder={selectedCylinder}
        onCylinderChange={handleCylinderChange}
      />

      {/* Chart */}
      <PVDiagramChart
        data={data}
        loading={dataLoading}
        error={dataError}
        onRetry={refetchData}
        selectedCylinder={selectedCylinder}
      />
    </div>
  );
}
