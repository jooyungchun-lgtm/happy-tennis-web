'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/lib/auth';
import { UserProfile, AuthState } from '@/types/models';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const profile = await authService.loadUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const signUp = async (email: string, password: string) => {
    await authService.signUp(email, password);
  };

  const logout = async () => {
    await authService.logout();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const saveUserProfile = async (profile: UserProfile) => {
    await authService.saveUserProfile(profile);
    setUserProfile(profile);
  };

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    userProfile,
    login,
    signUp,
    logout,
    resetPassword,
    saveUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
