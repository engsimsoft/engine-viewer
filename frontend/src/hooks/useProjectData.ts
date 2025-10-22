import { useState, useEffect } from 'react';
import { projectsApi } from '@/api/client';
import type { EngineProject } from '@/types';

/**
 * Custom hook для загрузки детальных данных проекта
 *
 * @param projectId - ID проекта для загрузки
 * @returns объект с данными проекта, состоянием загрузки и ошибкой
 *
 * @example
 * ```tsx
 * const { project, loading, error, refetch } = useProjectData('bmw-m42');
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!project) return <div>Проект не найден</div>;
 *
 * return <div>{project.fileName}</div>;
 * ```
 */
export function useProjectData(projectId: string | undefined) {
  const [project, setProject] = useState<EngineProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await projectsApi.getProject(projectId);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить проект');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Race condition handling: ignore flag prevents state updates after unmount
    let ignore = false;

    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await projectsApi.getProject(projectId);
        if (!ignore) {
          setProject(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить проект');
          console.error('Error loading project:', err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProject();

    // Cleanup function: set ignore flag to prevent state updates after unmount
    return () => {
      ignore = true;
    };
  }, [projectId]);

  return { project, loading, error, refetch: loadProject };
}
