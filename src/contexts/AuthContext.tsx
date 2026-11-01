'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiRequestError, api } from '@/lib/api';

export type Role = 'customer' | 'editor' | 'manager' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

type Status = 'loading' | 'ready' | 'error';

interface AuthValue {
  user: User | null;
  status: Status;
  isStaff: boolean;
  reload: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const reload = useCallback(async () => {
    try {
      const data = await api<{ user: User }>('/auth/me');
      setUser(data.user);
      setStatus('ready');
    } catch (err) {
      setUser(null);
      const signedOut = err instanceof ApiRequestError && (err.status === 401 || err.status === 403);
      setStatus(signedOut ? 'ready' : 'error');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST', skipRefresh: true }).catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isStaff: !!user && user.role !== 'customer',
      reload,
      setUser,
      logout,
    }),
    [user, status, reload, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};
