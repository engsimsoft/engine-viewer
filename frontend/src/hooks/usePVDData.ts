import { useState, useEffect } from 'react';
import { projectsApi } from '@/api/client';
import type { PVDData } from '@/types';

/**
 * PVD Data Item for multi-RPM comparison
 */
export interface PVDDataItem {
  fileName: string;
  rpm: number;
  data: PVDData;
}

/**
 * Custom hook для загрузки нескольких .pvd файлов (v3.1 - Multi-RPM)
 *
 * Поддерживает multi-RPM comparison: загружает 2-4 файла параллельно
 * для отображения на одном графике.
 *
 * Возвращает:
 * - dataArray: массив данных для каждого выбранного RPM
 * - loading: состояние загрузки
 * - error: ошибка при загрузке
 * - refetch: функция для повторной загрузки
 *
 * @param projectId - ID проекта
 * @param fileNames - Массив имен .pvd файлов (например ["V8_2000.pvd", "V8_4000.pvd"])
 * @returns объект с массивом данных и состоянием
 *
 * @example
 * ```tsx
 * const { dataArray, loading, error } = usePVDData('v8', ['V8_2000.pvd', 'V8_4000.pvd']);
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * return (
 *   <PVDiagramChart dataArray={dataArray} />
 * );
 * ```
 */
export function usePVDData(
  projectId: string | undefined,
  fileNames: string[]
) {
  const [dataArray, setDataArray] = useState<PVDDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPVDData = async () => {
    if (!projectId || fileNames.length === 0) {
      setLoading(false);
      setDataArray([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load all files in parallel (Promise.all)
      const promises = fileNames.map(async (fileName) => {
        const pvdData = await projectsApi.getPVDData(projectId, fileName);
        return {
          fileName,
          rpm: pvdData.metadata.rpm,
          data: pvdData,
        };
      });

      const results = await Promise.all(promises);
      setDataArray(results);
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

    const fetchMultiplePVDData = async () => {
      if (!projectId || fileNames.length === 0) {
        if (!ignore) {
          setLoading(false);
          setDataArray([]);
        }
        return;
      }

      if (!ignore) {
        setLoading(true);
        setError(null);
      }

      try {
        // Load all files in parallel (Promise.all)
        const promises = fileNames.map(async (fileName) => {
          const pvdData = await projectsApi.getPVDData(projectId, fileName);
          return {
            fileName,
            rpm: pvdData.metadata.rpm,
            data: pvdData,
          };
        });

        const results = await Promise.all(promises);

        if (!ignore) {
          setDataArray(results);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load PV-Diagram data');
          console.error('Error loading multiple PV-Diagram data:', err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMultiplePVDData();

    // Cleanup function: set ignore flag to prevent state updates after unmount
    return () => {
      ignore = true;
    };
  }, [projectId, fileNames.join(',')]); // Join fileNames for dependency tracking

  return {
    dataArray,
    loading,
    error,
    refetch: loadPVDData
  };
}
