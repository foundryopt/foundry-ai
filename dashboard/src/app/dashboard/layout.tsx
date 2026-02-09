'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/hooks/useProject';
import { PROJECTS, ALL_PROJECTS_ID } from '@/data';
import { Banner } from '@/components/shell/Banner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const { projectId, setProjectId, currentProject, isAll } = useProject();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Banner
        projects={PROJECTS}
        currentProject={currentProject}
        isAll={isAll}
        onProjectChange={setProjectId}
        allProjectsId={ALL_PROJECTS_ID}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
