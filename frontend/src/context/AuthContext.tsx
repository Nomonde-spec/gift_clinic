'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeClinicId: string | null;
  setActiveClinicId: (id: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    surname: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeClinicId, setActiveClinicIdState] = useState<string | null>(null);

  useEffect(() => {
    // Rehydrate token and user from localStorage on client mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('clinic_auth_token');
      const storedUser = localStorage.getItem('clinic_user');
      const storedActive = localStorage.getItem('clinic_active_clinic');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          if (storedActive) setActiveClinicIdState(storedActive);
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
      const nextUser = res.data.user;
      setUser(nextUser);
      setToken(res.data.token);

      const preferredClinicId = nextUser.role === 'STAFF'
        ? nextUser.staffClinics?.[0]?.clinicId || null
        : null;

      setActiveClinicIdState(preferredClinicId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('clinic_auth_token', res.data.token);
        localStorage.setItem('clinic_user', JSON.stringify(nextUser));
        if (preferredClinicId) localStorage.setItem('clinic_active_clinic', preferredClinicId);
        else localStorage.removeItem('clinic_active_clinic');
      }
    }
  };

  const setActiveClinicId = (id: string | null) => {
    setActiveClinicIdState(id);
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem('clinic_active_clinic', id);
      else localStorage.removeItem('clinic_active_clinic');
    }
  };

  const register = async (data: {
    name: string;
    surname: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    clinicId?: string;
  }) => {
    const res = await authApi.register(data);
    if (res.data) {
      const nextUser = res.data.user;
      setUser(nextUser);
      setToken(res.data.token);

      const preferredClinicId = nextUser.role === 'STAFF'
        ? nextUser.staffClinics?.[0]?.clinicId || null
        : null;

      setActiveClinicIdState(preferredClinicId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('clinic_auth_token', res.data.token);
        localStorage.setItem('clinic_user', JSON.stringify(nextUser));
        if (preferredClinicId) localStorage.setItem('clinic_active_clinic', preferredClinicId);
        else localStorage.removeItem('clinic_active_clinic');
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveClinicIdState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clinic_auth_token');
      localStorage.removeItem('clinic_user');
      localStorage.removeItem('clinic_active_clinic');
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authApi.getMe();
      if (updatedUser) {
        setUser(updatedUser);

        if (updatedUser.role === 'STAFF') {
          const preferredClinicId = updatedUser.staffClinics?.[0]?.clinicId || null;
          if (preferredClinicId && activeClinicId !== preferredClinicId) {
            setActiveClinicIdState(preferredClinicId);
            if (typeof window !== 'undefined') {
              localStorage.setItem('clinic_active_clinic', preferredClinicId);
            }
          }
        }

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
        activeClinicId,
        setActiveClinicId,
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
