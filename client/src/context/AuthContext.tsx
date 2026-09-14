import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
  level: string;
  points: number;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.me()
        .then((res: any) => setUser(res.user))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res: any = await authApi.login({ username, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const res: any = await authApi.register({ username, email, password });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res: any = await authApi.me();
      setUser(res.user);
    } catch (e) { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
