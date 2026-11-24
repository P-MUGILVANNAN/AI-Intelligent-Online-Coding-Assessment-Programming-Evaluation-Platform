import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('access_token')) {
        const res = await authAPI.me();
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authAPI.login({ email, password });
      const { access_token, refresh_token, user: userData } = res.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setToken(access_token);

      // Fetch full profile
      const profileRes = await authAPI.me();
      setUser(profileRes.data);
      localStorage.setItem('user', JSON.stringify(profileRes.data));

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid login credentials.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    const rf = localStorage.getItem('refresh_token');
    if (rf) {
      authAPI.logout(rf).catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const roleName = user?.role?.name || (user as any)?.role || 'Student';
  const isAdmin = roleName === 'Administrator';
  const isInstructor = roleName === 'Instructor';
  const isStudent = roleName === 'Student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: roleName,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAdmin,
        isInstructor,
        isStudent,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
