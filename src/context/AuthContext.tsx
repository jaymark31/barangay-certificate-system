import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '@/services/api';

export type UserRole = 'resident' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapApiUserToAppUser = (u: { id: string; email: string; full_name?: string; name?: string; role?: string }, fallbackName?: string): User => ({
  id: String(u.id),
  email: u.email,
  name: u.full_name ?? u.name ?? fallbackName ?? '',
  role: (u.role?.toLowerCase() ?? 'resident') as UserRole,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authService
      .getMe()
      .then((res) => {
        if (cancelled) return;
        const u = res.data?.data?.user;
        setUser(u ? mapApiUserToAppUser(u) : null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await authService.login(email, password);
    const u = res.data?.data?.user;
    if (!u) throw new Error('Invalid response');
    const userData = mapApiUserToAppUser(u);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string }): Promise<User> => {
    const res = await authService.register(data);
    const u = res.data?.data?.user;
    if (!u) throw new Error('Invalid response');
    const userData = mapApiUserToAppUser(u, data.name);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
