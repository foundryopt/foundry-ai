'use client';

import type { Project } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_ENTITY } from '@/lib/constants';
import { RoleSwitcher } from './RoleSwitcher';

interface BannerProps {
  projects: Project[];
  currentProject: Project | undefined;
  isAll: boolean;
  onProjectChange: (id: string) => void;
  allProjectsId: string;
}

export function Banner({ projects, currentProject, isAll, onProjectChange, allProjectsId }: BannerProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const displayName = isAll ? 'All Projects' : currentProject?.name ?? '';
  const displayPhase = isAll ? `${projects.length} projects` : currentProject?.phaseLabel ?? '';

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: project selector */}
        <div className="min-w-0">
          <select
            value={isAll ? allProjectsId : currentProject?.id ?? allProjectsId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="text-sm font-semibold text-gray-900 bg-transparent border-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none rounded -ml-1 pr-6"
            aria-label="Select project"
          >
            <option value={allProjectsId}>All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            {displayPhase} · Read-Only
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
