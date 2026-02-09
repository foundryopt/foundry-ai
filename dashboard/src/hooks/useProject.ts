'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { PROJECTS, ALL_PROJECTS_ID } from '@/data';

const PROJECT_CHANGE_EVENT = 'projectchange';

function getInitialProjectId(): string {
  if (typeof window === 'undefined') return ALL_PROJECTS_ID;
  const params = new URLSearchParams(window.location.search);
  const p = params.get('project');
  if (p && (p === ALL_PROJECTS_ID || PROJECTS.some((proj) => proj.id === p))) {
    return p;
  }
  return ALL_PROJECTS_ID;
}

export function useProject() {
  const [projectId, setProjectIdState] = useState<string>(getInitialProjectId);

  // Listen for cross-component sync
  useEffect(() => {
    const handler = () => {
      setProjectIdState(getInitialProjectId());
    };
    window.addEventListener(PROJECT_CHANGE_EVENT, handler);
    return () => window.removeEventListener(PROJECT_CHANGE_EVENT, handler);
  }, []);

  const setProjectId = useCallback((id: string) => {
    setProjectIdState(id);
    const url = new URL(window.location.href);
    url.searchParams.set('project', id);
    window.history.replaceState({}, '', url.toString());
    window.dispatchEvent(new Event(PROJECT_CHANGE_EVENT));
  }, []);

  const currentProject: Project | undefined = PROJECTS.find((p) => p.id === projectId);
  const isAll = projectId === ALL_PROJECTS_ID;

  return { projectId, setProjectId, currentProject, isAll };
}
