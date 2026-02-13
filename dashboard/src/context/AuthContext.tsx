'use client';

import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Role, User } from '@/lib/types';
import { api, setToken, clearToken, useBackend } from '@/lib/api';

interface AuthState {
  user: User | null;
  login: (name: string, role: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  login: () => {},
  logout: () => {},
  switchRole: () => {},
});

const STORAGE_KEY = 'foundry-dashboard-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (u) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    (name: string, role: Role) => {
      persist({ name, role });

      // If backend is enabled, also fetch a JWT token
      if (useBackend()) {
        api
          .post<{ token: string }>('/auth/login', { name, role })
          .then((res) => setToken(res.token))
          .catch(() => {
            // Fall back to mock-only mode silently
          });
      }
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null);
    clearToken();
  }, [persist]);

  const switchRole = useCallback(
    (role: Role) => {
      if (user) persist({ ...user, role });
    },
    [user, persist],
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}
