import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';

export type AuthModalTab = 'student-login' | 'admin-login' | 'register' | 'database' | 'signin';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, expectedRole?: UserRole, adminPasscode?: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: UserRole,
    adminPasscode?: string
  ) => Promise<void>;
  logout: () => void;
  quickDemoLogin: () => Promise<void>;
  quickStudentLogin: () => Promise<void>;
  quickAdminLogin: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthModalOpen: boolean;
  activeModalTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  setActiveModalTab: (tab: AuthModalTab) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('omni_token');
    // User requested logging out current Alex Rivera account and starting on login page
    if (saved === 'token-user-demo-1') {
      localStorage.removeItem('omni_token');
      if (typeof document !== 'undefined') {
        document.cookie = 'omni_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      return null;
    }
    return saved;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<AuthModalTab>('register');

  const saveToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('omni_token', newToken);
      if (typeof document !== 'undefined') {
        document.cookie = `omni_token=${encodeURIComponent(newToken)}; path=/; SameSite=Lax`;
      }
    } else {
      localStorage.removeItem('omni_token');
      if (typeof document !== 'undefined') {
        document.cookie = 'omni_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  };

  useEffect(() => {
    fetchMe();
  }, [token]);

  const fetchMe = async () => {
    try {
      const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('omni_token') : null);
      if (!currentToken || currentToken === 'token-user-demo-1') {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        saveToken(null);
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    expectedRole?: UserRole,
    adminPasscode?: string
  ) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, expectedRole, adminPasscode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    saveToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'student',
    adminPasscode?: string
  ) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, adminPasscode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    saveToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const switchUser = async (userId: string) => {
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'User switch failed');
    }
    const data = await res.json();
    saveToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('omni_token');
    }
    if (typeof document !== 'undefined') {
      document.cookie = 'omni_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const quickDemoLogin = async () => {
    await login('alex.rivera@edu.nlp', 'demo1234', 'student');
  };

  const quickStudentLogin = async () => {
    await login('alex.rivera@edu.nlp', 'demo1234', 'student');
  };

  const quickAdminLogin = async () => {
    await login('admin@edu.nlp', 'admin1234', 'admin');
  };

  const openAuthModal = (tab: AuthModalTab = 'student-login') => {
    const normalizedTab = tab === 'signin' ? 'student-login' : tab;
    setActiveModalTab(normalizedTab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        quickDemoLogin,
        quickStudentLogin,
        quickAdminLogin,
        switchUser,
        refreshUser: fetchMe,
        isAuthModalOpen,
        activeModalTab,
        openAuthModal,
        closeAuthModal,
        setActiveModalTab,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
