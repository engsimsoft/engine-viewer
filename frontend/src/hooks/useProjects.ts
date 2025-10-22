import { useState, useEffect } from 'react';
import { projectsApi } from '@/api/client';
import type { ProjectInfo } from '@/types';

export function useProjects() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить проекты');
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Race condition handling: ignore flag prevents state updates after unmount
    let ignore = false;

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await projectsApi.getProjects();
        if (!ignore) {
          setProjects(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить проекты');
          console.error('Error loading projects:', err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    // Cleanup function: set ignore flag to prevent state updates after unmount
    return () => {
      ignore = true;
    };
  }, []);

  return { projects, loading, error, refetch: loadProjects };
}
