import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest, postJson } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const data = await apiRequest('/auth/me');
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (email, password) => {
    const data = await postJson('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await postJson('/auth/register', { name, email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await postJson('/auth/logout', {});
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return await postJson('/auth/forgot-password', { email });
  }, []);

  const resetPassword = useCallback(async (email, code, newPassword) => {
    return await postJson('/auth/reset-password', { email, code, newPassword });
  }, []);

  const value = React.useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkSession
  }), [user, loading, login, register, logout, forgotPassword, resetPassword, checkSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
