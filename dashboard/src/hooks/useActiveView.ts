'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ViewTab } from '@/lib/types';
import { ROLE_DEFAULT_VIEW } from '@/lib/constants';
import { useAuth } from './useAuth';

export function useActiveView() {
  const { user } = useAuth();
  const defaultView = user ? ROLE_DEFAULT_VIEW[user.role] : 0;

  const [view, setViewState] = useState<ViewTab>(defaultView);

  // Sync from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    if (v !== null) {
      const n = Number(v);
      if (n >= 0 && n <= 12) {
        setViewState(n as ViewTab);
        return;
      }
    }
    setViewState(defaultView);
  }, [defaultView]);

  const setView = useCallback((v: ViewTab) => {
    setViewState(v);
    const url = new URL(window.location.href);
    url.searchParams.set('view', String(v));
    window.history.replaceState({}, '', url.toString());
  }, []);

  return { view, setView };
}
