import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  ShieldAlert,
  Clock,
  RefreshCw,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

// ============================================================================
// 1. TYPEWRITER HERO HEADLINE (Comes, holds, deletes, and cycles)
// ============================================================================
interface TypewriterHeadlineProps {
  phrases?: string[];
  typingSpeedMs?: number;
  deletingSpeedMs?: number;
  pauseDurationMs?: number;
}

const DEFAULT_HERO_PHRASES = [
  'Every academic record. A clearer path to trust.',
  'Verified APAAR identities. Zero institutional silos.',
  'Deterministic intake governance. Tamper-evident trust.',
  'One national ledger. Instant cryptographic verification.',
];

export const TypewriterHeadline: React.FC<TypewriterHeadlineProps> = ({
  phrases = DEFAULT_HERO_PHRASES,
  typingSpeedMs = 46,
  deletingSpeedMs = 24,
  pauseDurationMs = 1900,
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex % phrases.length];

    let timeoutId: number;

    if (!isDeleting && displayText.length < currentPhrase.length) {
      timeoutId = window.setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
      }, typingSpeedMs);
    } else if (!isDeleting && displayText.length === currentPhrase.length) {
      timeoutId = window.setTimeout(() => {
        setIsDeleting(true);
      }, pauseDurationMs);
    } else if (isDeleting && displayText.length > 0) {
      timeoutId = window.setTimeout(() => {
        setDisplayText(currentPhrase.slice(0, displayText.length - 1));
      }, deletingSpeedMs);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => window.clearTimeout(timeoutId);
  }, [displayText, isDeleting, phraseIndex, phrases, typingSpeedMs, deletingSpeedMs, pauseDurationMs]);

  return (
    <span className="font-mono tracking-tight text-[#23201B] inline">
      <span>{displayText || '\u00A0'}</span>
      <span
        aria-hidden="true"
        className="inline-block w-[3px] h-[0.92em] align-middle ml-1.5 bg-[#B88938] animate-pulse"
      />
    </span>
  );
};

// ============================================================================
// 2. ANIMATED COUNTER (Animates 0 -> Target Value on mount / update)
// ============================================================================
interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  durationMs = 1250,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    if (target === 0) {
      setCurrent(0);
      return;
    }

    let startTimestamp: number | null = null;
    let rafId = 0;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);
      // Cubic ease-out for smooth deceleration at destination
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    setCurrent(0);
    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {current.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

// ============================================================================
// 3. PORTAL AMBIENT BACKGROUND ANIMATION CANVAS (For Admin & Student Consoles)
// ============================================================================
export const PortalAmbientCanvas: React.FC<{ variant?: 'admin' | 'student' }> = ({
  variant = 'admin',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const nodes = Array.from({ length: 18 }, (_, i) => ({
      x: ((i * 193) % 100) * 0.01 * width,
      y: ((i * 317) % 100) * 0.01 * height,
      vx: ((i % 2 === 0 ? 1 : -1) * (0.14 + (i % 4) * 0.05)),
      vy: ((i % 3 === 0 ? 1 : -1) * (0.11 + (i % 3) * 0.04)),
      radius: 1.8 + (i % 3) * 0.8,
      phase: i * 0.7,
    }));

    let t = 0;
    const render = () => {
      t += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Soft warm champagne / antique gold ambient glow fields
      const glow1X = width * (0.22 + Math.sin(t * 0.45) * 0.08);
      const glow1Y = height * (0.2 + Math.cos(t * 0.35) * 0.08);
      const grad1 = ctx.createRadialGradient(glow1X, glow1Y, 10, glow1X, glow1Y, width * 0.38);
      grad1.addColorStop(
        0,
        variant === 'admin' ? 'rgba(197, 160, 89, 0.10)' : 'rgba(212, 175, 55, 0.11)'
      );
      grad1.addColorStop(1, 'rgba(250, 247, 240, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * (0.78 + Math.cos(t * 0.4) * 0.07);
      const glow2Y = height * (0.68 + Math.sin(t * 0.5) * 0.07);
      const grad2 = ctx.createRadialGradient(glow2X, glow2Y, 10, glow2X, glow2Y, width * 0.34);
      grad2.addColorStop(0, 'rgba(184, 137, 56, 0.08)');
      grad2.addColorStop(1, 'rgba(250, 247, 240, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Subtle harmonic wave threads across the console background
      for (let w = 0; w < 2; w++) {
        ctx.beginPath();
        const baseY = height * (0.3 + w * 0.38);
        for (let x = 0; x <= width; x += 28) {
          const y =
            baseY +
            Math.sin(x * 0.003 + t + w * 1.4) * 18 +
            Math.cos(x * 0.0015 - t * 0.7) * 10;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(184, 137, 56, 0.09)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      // Floating verification ledger nodes & subtle links
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 170) {
            const alpha = (1 - dist / 170) * 0.09;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(166, 124, 46, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + n.phase);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 137, 56, ${(0.18 + pulse * 0.16).toFixed(3)})`;
        ctx.fill();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 w-full h-full z-0 opacity-90"
    />
  );
};

// ============================================================================
// 4. BREADCRUMB NAVIGATION COMPONENT (Both Admin & Student Portals + Detail Context)
// ============================================================================
const ROUTE_LABELS: Record<string, string> = {
  admin: 'AICTE Admin Console',
  student: 'My EduVerify Portal',
  dashboard: 'Overview Dashboard',
  institutions: 'Institutional Management',
  students: 'Student Record Registry',
  'bulk-upload': 'Bulk Data Upload',
  'data-validation': 'Validation Centre',
  duplicates: 'Duplicate Detection Queue',
  'intake-monitoring': 'Approved Intake Monitoring',
  verification: 'Verification Requests',
  reports: 'Reports & Analytics',
  'audit-logs': 'Regulatory Audit Logs',
  settings: 'System Settings',
  assistant: 'Regulatory Assistant',
  profile: 'My Academic Profile',
  'academic-records': 'My Academic Records',
  apaar: 'APAAR ID & Cryptographic Binding',
  discrepancies: 'Report a Discrepancy',
  consent: 'Consent & Privacy Controls',
  history: 'Activity History',
  help: 'Help & Support',
};

const BREADCRUMB_DETAIL_EVENT = 'eduverify:breadcrumb-detail';

export function setPortalBreadcrumbDetail(detailLabel: string | null) {
  window.dispatchEvent(new CustomEvent(BREADCRUMB_DETAIL_EVENT, { detail: detailLabel }));
}

export const PortalBreadcrumbs: React.FC<{ portal: 'admin' | 'student' }> = ({ portal }) => {
  const location = useLocation();
  const [detailLabel, setDetailLabel] = useState<string | null>(null);

  // Clear nested detail breadcrumb when route path changes
  useEffect(() => {
    setDetailLabel(null);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const customEv = ev as CustomEvent<string | null>;
      setDetailLabel(customEv.detail || null);
    };
    window.addEventListener(BREADCRUMB_DETAIL_EVENT, handler);
    return () => window.removeEventListener(BREADCRUMB_DETAIL_EVENT, handler);
  }, []);

  const segments = location.pathname.split('/').filter(Boolean);
  const rootPath = portal === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  const rootTitle = portal === 'admin' ? 'AICTE Admin Console' : 'My EduVerify Portal';

  const subSegments = segments.slice(1); // Everything after /admin or /student

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E675C] bg-[#F7F3E9]/90 border-b border-[#E5DEC9] px-4 sm:px-6 py-2"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-[#787166] hover:text-[#23201B] transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-[#B88938]" />
        <span className="font-mono text-[11px]">EduVerify</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-[#C4B9A5] shrink-0" />

      <Link
        to={rootPath}
        className="font-medium text-[#575249] hover:text-[#23201B] transition-colors"
      >
        {rootTitle}
      </Link>

      {subSegments.map((seg, idx) => {
        const isLast = idx === subSegments.length - 1 && !detailLabel;
        const label = ROUTE_LABELS[seg] || seg;
        const to = `/${segments.slice(0, idx + 2).join('/')}`;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-[#C4B9A5] shrink-0" />
            {isLast ? (
              <span
                aria-current="page"
                className="font-semibold text-[#23201B] bg-[#EFE8D8] px-2 py-0.5 rounded border border-[#DFD5C0]"
              >
                {label}
              </span>
            ) : (
              <Link
                to={to}
                className="font-medium text-[#575249] hover:text-[#23201B] transition-colors"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}

      {detailLabel && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-[#C4B9A5] shrink-0" />
          <span
            aria-current="page"
            className="font-mono font-semibold text-[#8C6520] bg-[#FBF4E3] px-2 py-0.5 rounded border border-[#E2C992]"
          >
            {detailLabel}
          </span>
        </>
      )}
    </nav>
  );
};

// ============================================================================
// 5. IDLE SESSION TIMEOUT SECURITY COMPLIANCE WARNING (Both Portals)
// ============================================================================
interface IdleSessionTimeoutProps {
  portalName: string;
  userRole: string;
  onLogout: () => void;
  idleWarningAfterSeconds?: number;
  countdownSeconds?: number;
}

export const IdleSessionTimeoutManager: React.FC<IdleSessionTimeoutProps> = ({
  portalName,
  userRole,
  onLogout,
  idleWarningAfterSeconds = 120,
  countdownSeconds = 30,
}) => {
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const [extending, setExtending] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (warningOpen) {
      setWarningOpen(false);
      setSecondsLeft(countdownSeconds);
    }
  }, [warningOpen, countdownSeconds]);

  const handleExtendSession = async () => {
    setExtending(true);
    try {
      await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: userRole }),
      });
    } catch {
      // Fallback if offline
    } finally {
      setExtending(false);
      lastActivityRef.current = Date.now();
      setWarningOpen(false);
      setSecondsLeft(countdownSeconds);
    }
  };

  // Track user interactions when warning modal is not open
  useEffect(() => {
    const onUserActivity = () => {
      if (!warningOpen) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, onUserActivity, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onUserActivity));
    };
  }, [warningOpen]);

  // Poll idle threshold & manage countdown
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!warningOpen) {
        const idleSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
        if (idleSeconds >= idleWarningAfterSeconds) {
          setSecondsLeft(countdownSeconds);
          setWarningOpen(true);
        }
      } else {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            window.clearInterval(interval);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [warningOpen, idleWarningAfterSeconds, countdownSeconds, onLogout]);

  return (
    <>
      {/* Header Security Session Pill + 1-Click Evaluator Trigger */}
      <button
        type="button"
        onClick={() => {
          setSecondsLeft(countdownSeconds);
          setWarningOpen(true);
        }}
        title="Click to preview the Idle Session Timeout compliance warning"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#F5EFE2] hover:bg-[#EBE2CE] text-[#6E5626] border border-[#DFD2B8] transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#B88938]" />
        <span className="hidden xl:inline">Session Guard:</span>
        <span>Idle Check</span>
      </button>

      {/* Idle Timeout Modal */}
      {warningOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="idle-timeout-title"
          aria-describedby="idle-timeout-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-xs"
        >
          <div className="bg-[#FFFDF9] border border-[#DFD5C2] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 text-[#23201B]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/40 flex items-center justify-center text-[#B45309] shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B45309] font-semibold block">
                    SECURITY COMPLIANCE · SESSION GUARD
                  </span>
                  <h2 id="idle-timeout-title" className="font-display text-lg font-bold text-[#23201B]">
                    Idle Session Timeout Warning
                  </h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-xs font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                <Clock className="w-3.5 h-3.5" />
                {secondsLeft}s
              </span>
            </div>

            <p id="idle-timeout-desc" className="text-xs text-[#575249] leading-relaxed">
              Your authenticated session in the <strong>{portalName}</strong> has been inactive. To
              protect student APAAR records and institutional governance data, you will be
              automatically signed out in <strong>{secondsLeft} seconds</strong> unless you extend
              your session.
            </p>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#EFECE4] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B88938] to-[#DC2626] transition-all duration-1000 ease-linear"
                style={{ width: `${Math.max(0, (secondsLeft / countdownSeconds) * 100)}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={extending}
                onClick={handleExtendSession}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] border border-[#B88938]/40 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${extending ? 'animate-spin' : ''}`} />
                <span>{extending ? 'Extending Session...' : 'Extend Active Session'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  resetActivityTimer();
                  onLogout();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#B91C1C] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
