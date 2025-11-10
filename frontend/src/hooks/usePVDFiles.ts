import { useState, useEffect } from 'react';
import { projectsApi } from '@/api/client';
import type { PVDFileInfo } from '@/types';

/**
 * Custom hook для загрузки списка .pvd файлов проекта с metadata
 *
 * Возвращает:
 * - files: массив .pvd файлов с peak pressure metadata
 * - rpmPoints: уникальные RPM точки (sorted)
 * - loading: состояние загрузки
 * - error: ошибка при загрузке
 * - refetch: функция для повторной загрузки
 *
 * @param projectId - ID проекта для загрузки
 * @returns объект с файлами, метаданными и состоянием
 *
 * @example
 * ```tsx
 * const { files, rpmPoints, loading, error } = usePVDFiles('4-cyl-itb');
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (files.length === 0) return <div>No PV-Diagram files found</div>;
 *
 * return (
 *   <div>
 *     <p>Found {files.length} files at RPM: {rpmPoints.join(', ')}</p>
 *     {files.map(file => (
 *       <div key={file.fileName}>
 *         {file.fileName} - Peak: {file.peakPressure} bar @ {file.peakPressureAngle}°
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function usePVDFiles(projectId: string | undefined) {
  const [files, setFiles] = useState<PVDFileInfo[]>([]);
  const [rpmPoints, setRpmPoints] = useState<number[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPVDFiles = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await projectsApi.getPVDFiles(projectId);
      setFiles(response.data.files);
      setRpmPoints(response.meta.rpmPoints);
      setTotalFiles(response.meta.totalFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PV-Diagram files');
      console.error('Error loading PV-Diagram files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Race condition handling: ignore flag prevents state updates after unmount
    let ignore = false;

    const fetchPVDFiles = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await projectsApi.getPVDFiles(projectId);
        if (!ignore) {
          setFiles(response.data.files);
          setRpmPoints(response.meta.rpmPoints);
          setTotalFiles(response.meta.totalFiles);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load PV-Diagram files');
          console.error('Error loading PV-Diagram files:', err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPVDFiles();

    // Cleanup function: set ignore flag to prevent state updates after unmount
    return () => {
      ignore = true;
    };
  }, [projectId]);

  return {
    files,
    rpmPoints,
    totalFiles,
    loading,
    error,
    refetch: loadPVDFiles
  };
}
