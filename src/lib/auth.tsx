import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  SYNTHETIC_DEMO_ACCOUNTS,
  type DemoAccount,
} from './syntheticSeed';
import {
  evaluateIdleSessionState,
  evaluateSessionTimelineMilestone,
  SESSION_TIMELINE_TOTAL_SECONDS,
  IDLE_WARNING_THRESHOLD_MS,
  IDLE_LOGOUT_THRESHOLD_MS,
  type IdleSessionStatus,
  type SessionTimelineMilestone,
  type UserRole,
} from './weaveEngine';

// Access token kept strictly in memory per Section 19 (never localStorage/sessionStorage/URL)
let inMemoryAccessToken: string | null = 'synth_mem_tok_initial_session';
let lastActivityTimestampMs: number = Date.now();

export function getInMemoryAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setInMemoryAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getLastActivityTimestamp(): number {
  return lastActivityTimestampMs;
}

export function recordAuthActivity(timestampMs: number = Date.now()): void {
  lastActivityTimestampMs = timestampMs;
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
  idleStatus: IdleSessionStatus;
  idleSeconds: number;
  secondsUntilWarning: number;
  secondsUntilLogout: number;
  timelineMilestone: SessionTimelineMilestone;
  sessionExpiredReason: string | null;
  extendActiveSession: () => Promise<void>;
  advanceSessionByOneMinute: () => void;
  simulateIdleWarning10m: () => void;
  simulateIdleTimeout15m: () => void;
  switchRolePersona: (role: UserRole, institutionId?: string) => void;
  loginWithAccount: (account: DemoAccount, token: string) => void;
  logout: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Warning modal triggers at 8 minutes (480s), Auto-logout at 10 minutes (600s)
const ACTIVE_WARNING_MS = 8 * 60 * 1000;
const ACTIVE_LOGOUT_MS = SESSION_TIMELINE_TOTAL_SECONDS * 1000; // 10 minutes (600,000ms)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoAccount>(getInitialUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading] = useState<boolean>(false);
  const [apiMode, setApiMode] = useState<'mock' | 'live'>(
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_MODE === 'mock') ? 'mock' : 'live'
  );
  const [idleStatus, setIdleStatus] = useState<IdleSessionStatus>('ACTIVE');
  const [idleSeconds, setIdleSeconds] = useState<number>(0);
  const [secondsUntilWarning, setSecondsUntilWarning] = useState<number>(480);
  const [secondsUntilLogout, setSecondsUntilLogout] = useState<number>(
    SESSION_TIMELINE_TOTAL_SECONDS
  );
  const [sessionExpiredReason, setSessionExpiredReason] = useState<string | null>(null);
  const idleStatusRef = useRef<IdleSessionStatus>('ACTIVE');
  idleStatusRef.current = idleStatus;

  const logout = useCallback((reason?: string) => {
    setInMemoryAccessToken(null);
    persistUserMeta(null);
    setIsAuthenticated(false);
    setIdleStatus('EXPIRED');
    setSecondsUntilWarning(0);
    setSecondsUntilLogout(0);
    if (reason) {
      setSessionExpiredReason(reason);
    }
  }, []);

  useEffect(() => {
    const onExpired = (ev: Event) => {
      const customEv = ev as CustomEvent<{ reason?: string }>;
      logout(customEv.detail?.reason || 'IDLE_TIMEOUT_15M');
    };
    window.addEventListener('weave:session-expired', onExpired);
    return () => window.removeEventListener('weave:session-expired', onExpired);
  }, [logout]);

  // Continuous 1-second session countdown ticker: counts from 0s up to 600s (10 minutes)
  // Shows minute-by-minute milestone alerts and auto-redirects to /login at 10 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const evaluateTick = () => {
      const evalState = evaluateIdleSessionState(
        getLastActivityTimestamp(),
        Date.now(),
        ACTIVE_WARNING_MS,
        ACTIVE_LOGOUT_MS
      );

      setIdleSeconds(evalState.idleSeconds);
      setSecondsUntilWarning(evalState.secondsUntilWarning);
      setSecondsUntilLogout(evalState.secondsUntilLogout);

      if (evalState.shouldRedirectToLogin) {
        setIdleStatus('EXPIRED');
        logout('IDLE_TIMEOUT_15M');
        window.dispatchEvent(
          new CustomEvent('weave:session-expired', {
            detail: { reason: 'IDLE_TIMEOUT_15M' },
          })
        );
      } else if (evalState.shouldShowWarning) {
        setIdleStatus('WARNING');
      } else {
        setIdleStatus('ACTIVE');
      }
    };

    evaluateTick();
    const timer = window.setInterval(evaluateTick, 1000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, logout]);

  const extendActiveSession = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: user.role }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.access_token) {
          setInMemoryAccessToken(data.access_token);
        }
      }
    } catch {
      // Offline fallback: refresh local clock
    } finally {
      recordAuthActivity(Date.now());
      setIdleStatus('ACTIVE');
      setIdleSeconds(0);
      setSecondsUntilWarning(480);
      setSecondsUntilLogout(SESSION_TIMELINE_TOTAL_SECONDS);
      setSessionExpiredReason(null);
    }
  }, [user.role]);

  // Step forward by 1 minute so evaluators can watch each minute alert and the 10-minute auto-redirect
  const advanceSessionByOneMinute = useCallback(() => {
    const nextTimestamp = getLastActivityTimestamp() - 60 * 1000;
    recordAuthActivity(nextTimestamp);
    const evalState = evaluateIdleSessionState(
      nextTimestamp,
      Date.now(),
      ACTIVE_WARNING_MS,
      ACTIVE_LOGOUT_MS
    );
    setIdleSeconds(evalState.idleSeconds);
    setSecondsUntilWarning(evalState.secondsUntilWarning);
    setSecondsUntilLogout(evalState.secondsUntilLogout);
    if (evalState.shouldRedirectToLogin) {
      setIdleStatus('EXPIRED');
      logout('IDLE_TIMEOUT_15M');
      window.dispatchEvent(
        new CustomEvent('weave:session-expired', {
          detail: { reason: 'IDLE_TIMEOUT_15M' },
        })
      );
    } else if (evalState.shouldShowWarning) {
      setIdleStatus('WARNING');
    } else {
      setIdleStatus('ACTIVE');
    }
  }, [logout]);

  // Compliance verification helper: jump to warning threshold (2m remaining before 10m auto-logout)
  const simulateIdleWarning10m = useCallback(() => {
    recordAuthActivity(Date.now() - ACTIVE_WARNING_MS);
    setIdleStatus('WARNING');
    setIdleSeconds(480);
    setSecondsUntilWarning(0);
    setSecondsUntilLogout(120);
  }, []);

  // Compliance verification helper: jump to 10m timeout mark (triggers auto-logout & redirect to /login)
  const simulateIdleTimeout15m = useCallback(() => {
    recordAuthActivity(Date.now() - Math.max(ACTIVE_LOGOUT_MS, IDLE_WARNING_THRESHOLD_MS, IDLE_LOGOUT_THRESHOLD_MS));
    logout('IDLE_TIMEOUT_15M');
    window.dispatchEvent(
      new CustomEvent('weave:session-expired', {
        detail: { reason: 'IDLE_TIMEOUT_15M' },
      })
    );
  }, [logout]);

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
    recordAuthActivity(Date.now());
    setInMemoryAccessToken(`synth_mem_tok_${role}_${Date.now().toString(36)}`);
    setUser(updated);
    persistUserMeta(updated);
    setIdleStatus('ACTIVE');
    setIdleSeconds(0);
    setSecondsUntilWarning(480);
    setSecondsUntilLogout(SESSION_TIMELINE_TOTAL_SECONDS);
    setSessionExpiredReason(null);
    setIsAuthenticated(true);
  }, []);

  const loginWithAccount = useCallback((account: DemoAccount, token: string) => {
    recordAuthActivity(Date.now());
    setInMemoryAccessToken(token);
    setUser(account);
    persistUserMeta(account);
    setIdleStatus('ACTIVE');
    setIdleSeconds(0);
    setSecondsUntilWarning(480);
    setSecondsUntilLogout(SESSION_TIMELINE_TOTAL_SECONDS);
    setSessionExpiredReason(null);
    setIsAuthenticated(true);
  }, []);

  const isStudent = user.role === 'student' || user.portalType === 'student';
  const isAdmin = !isStudent;
  const timelineMilestone = evaluateSessionTimelineMilestone(
    idleSeconds,
    SESSION_TIMELINE_TOTAL_SECONDS
  );

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
        idleStatus,
        idleSeconds,
        secondsUntilWarning,
        secondsUntilLogout,
        timelineMilestone,
        sessionExpiredReason,
        extendActiveSession,
        advanceSessionByOneMinute,
        simulateIdleWarning10m,
        simulateIdleTimeout15m,
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


