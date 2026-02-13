'use client';

import { useEffect, useState, useMemo } from 'react';
import type { ProjectData } from '@/data';
import { getProjectData } from '@/data';
import { api, useBackend } from '@/lib/api';

interface UseProjectDataResult {
  data: ProjectData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Data fetching hook that returns ProjectData.
 *
 * When NEXT_PUBLIC_USE_BACKEND=true, fetches from the backend API.
 * Otherwise, uses the local mock data via getProjectData().
 */
export function useProjectData(projectId: string): UseProjectDataResult {
  const isBackend = useBackend();

  // Mock-data path (synchronous)
  const mockData = useMemo(() => {
    if (isBackend) return null;
    return getProjectData(projectId);
  }, [projectId, isBackend]);

  // Backend path (async)
  const [backendData, setBackendData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(isBackend);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!isBackend) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<ProjectData>(`/projects/${projectId}/data`)
      .then((result) => {
        if (!cancelled) {
          setBackendData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to fetch project data');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, isBackend, fetchKey]);

  const refetch = () => setFetchKey((k) => k + 1);

  // If backend is active and we have data, use it; otherwise fall back to mock
  const data = isBackend ? backendData ?? getProjectData(projectId) : mockData!;

  return { data, loading, error, refetch };
}
