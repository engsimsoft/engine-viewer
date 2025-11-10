import { useState, useEffect } from 'react';
import { projectsApi } from '@/api/client';
import type { PVDData } from '@/types';

/**
 * Custom hook для загрузки полных данных конкретного .pvd файла
 *
 * Возвращает:
 * - data: полные распарсенные данные (metadata + 721 data points)
 * - loading: состояние загрузки
 * - error: ошибка при загрузке
 * - refetch: функция для повторной загрузки
 *
 * @param projectId - ID проекта
 * @param fileName - Имя .pvd файла (например "V8_2000.pvd")
 * @returns объект с данными и состоянием
 *
 * @example
 * ```tsx
 * const { data, loading, error } = usePVDData('v8', 'V8_2000.pvd');
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!data) return <div>No data</div>;
 *
 * return (
 *   <div>
 *     <p>RPM: {data.metadata.rpm}</p>
 *     <p>Cylinders: {data.metadata.cylinders}</p>
 *     <p>Data Points: {data.data.length}</p>
 *     <PVDiagramChart data={data} />
 *   </div>
 * );
 * ```
 */
export function usePVDData(
  projectId: string | undefined,
  fileName: string | undefined
) {
  const [data, setData] = useState<PVDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPVDData = async () => {
    if (!projectId || !fileName) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pvdData = await projectsApi.getPVDData(projectId, fileName);
      setData(pvdData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load PV-Diagram data');
      console.error('Error loading PV-Diagram data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Race condition handling: ignore flag prevents state updates after unmount
    let ignore = false;

    const fetchPVDData = async () => {
      if (!projectId || !fileName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const pvdData = await projectsApi.getPVDData(projectId, fileName);
        if (!ignore) {
          setData(pvdData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load PV-Diagram data');
          console.error('Error loading PV-Diagram data:', err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchPVDData();

    // Cleanup function: set ignore flag to prevent state updates after unmount
    return () => {
      ignore = true;
    };
  }, [projectId, fileName]);

  return {
    data,
    loading,
    error,
    refetch: loadPVDData
  };
}
