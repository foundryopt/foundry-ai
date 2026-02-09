'use client';

import { useCallback, useEffect, useState } from 'react';

export function useDetailPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sync from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const item = params.get('item');
    if (item) setSelectedId(item);
  }, []);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('item', id);
    window.history.pushState({}, '', url.toString());
  }, []);

  const close = useCallback(() => {
    setSelectedId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('item');
    window.history.pushState({}, '', url.toString());
  }, []);

  // Handle browser back
  useEffect(() => {
    function onPop() {
      const params = new URLSearchParams(window.location.search);
      const item = params.get('item');
      setSelectedId(item);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return { selectedId, select, close };
}
