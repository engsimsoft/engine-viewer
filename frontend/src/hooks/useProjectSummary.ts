import { useState, useEffect } from 'react';
import axios from 'axios';

interface ProjectSpecs {
  cylinders: number;
  engineType: string;
}

interface PerformanceAvailability {
  available: boolean;
  calculationsCount?: number;
  lastRun?: string;
}

interface TracesAvailability {
  available: boolean;
  rpmPointsCount?: number;
  traceTypes?: string[];
}

interface BasicAvailability {
  available: boolean;
}

interface ProjectSummary {
  project: {
    id: string;
    displayName: string;
    specs: ProjectSpecs;
  };
  availability: {
    performance: PerformanceAvailability;
    traces: TracesAvailability;
    pvDiagrams: BasicAvailability;
    noise: BasicAvailability;
    turbo: BasicAvailability;
    configuration: BasicAvailability;
  };
}

interface UseProjectSummaryResult {
  summary: ProjectSummary | null;
  loading: boolean;
  error: string | null;
}

export function useProjectSummary(projectId: string): UseProjectSummaryResult {
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/project/${projectId}/summary`);

        if (isMounted) {
          setSummary(response.data.data);
        }
      } catch (err: any) {
        if (isMounted) {
          const message = err.response?.data?.error?.message || err.message || 'Failed to load project summary';
          setError(message);
          console.error('[useProjectSummary] Error:', message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  return { summary, loading, error };
}
