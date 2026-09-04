'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    surname: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Rehydrate token and user from localStorage on client mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('clinic_auth_token');
      const storedUser = localStorage.getItem('clinic_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('clinic_auth_token');
          localStorage.removeItem('clinic_user');
        }
      }
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('clinic_auth_token', res.data.token);
      localStorage.setItem('clinic_user', JSON.stringify(res.data.user));
    }
  };

  const register = async (data: {
    name: string;
    surname: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const res = await authApi.register(data);
    if (res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('clinic_auth_token', res.data.token);
      localStorage.setItem('clinic_user', JSON.stringify(res.data.user));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clinic_auth_token');
      localStorage.removeItem('clinic_user');
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authApi.getMe();
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('clinic_user', JSON.stringify(updatedUser));
      }
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
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
