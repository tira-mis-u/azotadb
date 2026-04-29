'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import axios from 'axios';

const API_URL = '/api';

type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';

interface UserProfile {
  id: string;
  email: string;
  role: Role;
  activeRole: Role;
}

interface AuthContextType {
  user: UserProfile | null;
  session: any | null;
  activeRole: Role;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [activeRole, setActiveRole] = useState<Role>('STUDENT');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const syncWithBackend = useCallback(async (accessToken: string) => {
    try {
      const res = await axios.post(
        `${API_URL}/auth/sync`,
        { accessToken }
      );
      const profile: UserProfile = res.data.user || res.data;
      setUser(profile);
      setActiveRole(profile.activeRole || 'STUDENT');
    } catch (err) {
      console.error('Backend sync failed:', err);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        syncWithBackend(session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.access_token) {
          await syncWithBackend(newSession.access_token);
        } else {
          setUser(null);
          setActiveRole('STUDENT');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [syncWithBackend]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const register = async (email: string, password: string, _username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: _username },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setActiveRole('STUDENT');
  };

  const switchRole = async (role: Role) => {
    if (!session?.access_token) return;
    try {
      const res = await axios.patch(
        `${API_URL}/auth/toggle-role`,
        { role },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setActiveRole(res.data.activeRole);
      setUser((prev) => prev ? { ...prev, activeRole: res.data.activeRole } : prev);
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, activeRole, loading, login, loginWithGoogle, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
