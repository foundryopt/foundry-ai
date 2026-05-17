'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.replace('/taktboard.html');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-500">Loading Takt Board…</p>
    </div>
  );
}
