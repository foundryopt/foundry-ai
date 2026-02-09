'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/lib/types';
import { ROLE_DESCRIPTIONS, ROLE_ENTITY } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

const ROLE_USERS: { name: string; role: Role }[] = [
  { name: 'Jordan M.', role: 'PM' },
  { name: 'Mike S.', role: 'Super' },
  { name: 'Sam W.', role: 'Principal' },
  { name: 'Rachel K.', role: "Owner's Rep" },
  { name: 'Alex P.', role: 'Procurement' },
  { name: 'Taylor R.', role: 'Ops' },
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Foundry AI</h1>
        <p className="text-sm text-gray-500 mt-1">Open Task Dashboard — SandBox</p>
        <p className="text-xs text-gray-400 mt-2">
          Select a role to enter the dashboard. Mock login for Phase 2 probation.
        </p>
      </div>

      <div className="w-full max-w-lg grid gap-3">
        {ROLE_USERS.map(({ name, role }) => (
          <button
            key={role}
            onClick={() => login(name, role)}
            className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {role} · {ROLE_ENTITY[role]}
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-blue-400 text-lg">→</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">{ROLE_DESCRIPTIONS[role]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
