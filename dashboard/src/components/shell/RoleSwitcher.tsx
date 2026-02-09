'use client';

import { useState, useRef, useEffect } from 'react';
import type { Role } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

const ROLES: Role[] = ['PM', 'Super', 'Principal', "Owner's Rep", 'Procurement', 'Ops'];

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded font-medium text-gray-600"
        title="Switch role (dev mode)"
      >
        {user.role} ▾
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => {
                switchRole(role);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                role === user.role ? 'font-semibold text-blue-600' : 'text-gray-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
