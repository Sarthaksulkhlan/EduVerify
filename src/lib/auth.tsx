import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  SYNTHETIC_DEMO_ACCOUNTS,
  type DemoAccount,
} from './syntheticSeed';
import type { UserRole } from './weaveEngine';

// Access token kept strictly in memory per Section 19 (never localStorage/sessionStorage/URL)
let inMemoryAccessToken: string | null = 'synth_mem_tok_initial_session';

export function getInMemoryAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setInMemoryAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

const SESSION_USER_KEY = 'eduverify_active_persona_meta';

function getInitialUser(): DemoAccount {
  try {
    if (typeof window !== 'undefined') {
      const saved = window.sessionStorage.getItem(SESSION_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DemoAccount;
        if (parsed && parsed.id && parsed.role) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore storage access errors in restricted frames
  }
  return SYNTHETIC_DEMO_ACCOUNTS[0];
}

function persistUserMeta(account: DemoAccount | null) {
  try {
    if (typeof window !== 'undefined') {
      if (account) {
        window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(account));
      } else {
        window.sessionStorage.removeItem(SESSION_USER_KEY);
      }
    }
  } catch {
    // Ignore storage access errors
  }
}

interface AuthContextValue {
  user: DemoAccount;
  isAuthenticated: boolean;
  isLoading: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  apiMode: 'mock' | 'live';
  setApiMode: (mode: 'mock' | 'live') => void;
  switchRolePersona: (role: UserRole, institutionId?: string) => void;
  loginWithAccount: (account: DemoAccount, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoAccount>(getInitialUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading] = useState<boolean>(false);
  const [apiMode, setApiMode] = useState<'mock' | 'live'>(
    import.meta.env.VITE_API_MODE === 'mock' ? 'mock' : 'live'
  );

  React.useEffect(() => {
    const onExpired = () => {
      setInMemoryAccessToken(null);
      persistUserMeta(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('weave:session-expired', onExpired);
    return () => window.removeEventListener('weave:session-expired', onExpired);
  }, []);

  const switchRolePersona = useCallback((role: UserRole, institutionId?: string) => {
    const matched =
      SYNTHETIC_DEMO_ACCOUNTS.find((a) => a.role === role) || SYNTHETIC_DEMO_ACCOUNTS[0];
    const updated: DemoAccount = {
      ...matched,
      portalType: role === 'student' ? 'student' : 'admin',
      student_ref: role === 'student' ? matched.student_ref || 'STU-2026-101' : undefined,
      institution_id:
        institutionId ||
        matched.institution_id ||
        (role === 'institution_operator' || role === 'institution_admin' || role === 'student'
          ? 'INST-KKR-101'
          : undefined),
    };
    setInMemoryAccessToken(`synth_mem_tok_${role}_${Date.now().toString(36)}`);
    setUser(updated);
    persistUserMeta(updated);
    setIsAuthenticated(true);
  }, []);

  const loginWithAccount = useCallback((account: DemoAccount, token: string) => {
    setInMemoryAccessToken(token);
    setUser(account);
    persistUserMeta(account);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setInMemoryAccessToken(null);
    persistUserMeta(null);
    setIsAuthenticated(false);
  }, []);

  const isStudent = user.role === 'student' || user.portalType === 'student';
  const isAdmin = !isStudent;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isStudent,
        isAdmin,
        apiMode,
        setApiMode,
        switchRolePersona,
        loginWithAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
