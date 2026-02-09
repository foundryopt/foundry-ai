'use client';

import { useAuth } from '@/hooks/useAuth';
import { PROJECT_NAME, PHASE_LABEL, ROLE_ENTITY } from '@/lib/constants';
import { RoleSwitcher } from './RoleSwitcher';

export function Banner() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: project info */}
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            {PROJECT_NAME}
          </h1>
          <p className="text-xs text-gray-500">
            {PHASE_LABEL} · Read-Only
          </p>
        </div>

        {/* Right: user info + actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-700">{user.name}</p>
            <p className="text-xs text-gray-500">
              {user.role} · {ROLE_ENTITY[user.role]}
            </p>
          </div>
          <RoleSwitcher />
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
