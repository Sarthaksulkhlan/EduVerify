import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  ShieldAlert,
  Clock,
  RefreshCw,
  LogOut,
  ArrowLeft,
  FastForward,
  Activity,
  Play,
  Pause,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import {
  SESSION_TIMELINE_TOTAL_SECONDS,
  formatSessionCountdown,
} from '../../lib/weaveEngine';

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
// 3. PORTAL AMBIENT BACKGROUND ANIMATION CANVAS (Emerald-Gold-Crimson Grading)
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

    const palette = [
      { rgb: '21, 128, 61', label: 'emerald' }, // Emerald
      { rgb: '184, 137, 56', label: 'gold' }, // Sovereign Gold
      { rgb: '153, 27, 27', label: 'crimson' }, // Crimson-Garnet
    ];

    const nodes = Array.from({ length: 24 }, (_, i) => ({
      x: ((i * 193) % 100) * 0.01 * width,
      y: ((i * 317) % 100) * 0.01 * height,
      vx: (i % 2 === 0 ? 1 : -1) * (0.18 + (i % 4) * 0.06),
      vy: (i % 3 === 0 ? 1 : -1) * (0.14 + (i % 3) * 0.05),
      radius: 2.0 + (i % 3) * 0.9,
      phase: i * 0.65,
      colorRgb: palette[i % palette.length].rgb,
    }));

    let t = 0;
    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Emerald Aurora Field (Top-Left Drift)
      const glow1X = width * (0.18 + Math.sin(t * 0.5) * 0.09);
      const glow1Y = height * (0.22 + Math.cos(t * 0.4) * 0.08);
      const grad1 = ctx.createRadialGradient(glow1X, glow1Y, 10, glow1X, glow1Y, width * 0.42);
      grad1.addColorStop(0, variant === 'admin' ? 'rgba(20, 83, 45, 0.12)' : 'rgba(21, 128, 61, 0.13)');
      grad1.addColorStop(1, 'rgba(250, 247, 240, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // 2. Sovereign Gold Field (Center-Right Drift)
      const glow2X = width * (0.76 + Math.cos(t * 0.45) * 0.08);
      const glow2Y = height * (0.48 + Math.sin(t * 0.52) * 0.08);
      const grad2 = ctx.createRadialGradient(glow2X, glow2Y, 10, glow2X, glow2Y, width * 0.38);
      grad2.addColorStop(0, 'rgba(184, 137, 56, 0.14)');
      grad2.addColorStop(1, 'rgba(250, 247, 240, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 3. Crimson-Garnet Field (Bottom-Center Drift)
      const glow3X = width * (0.46 + Math.sin(t * 0.38) * 0.1);
      const glow3Y = height * (0.82 + Math.cos(t * 0.44) * 0.07);
      const grad3 = ctx.createRadialGradient(glow3X, glow3Y, 10, glow3X, glow3Y, width * 0.36);
      grad3.addColorStop(0, 'rgba(153, 27, 27, 0.10)');
      grad3.addColorStop(1, 'rgba(250, 247, 240, 0)');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 4. Three Multi-Color Harmonic Ledger Wave Threads (Emerald, Gold, Crimson)
      const waveConfigs = [
        { baseYRatio: 0.24, stroke: 'rgba(21, 128, 61, 0.15)', speed: 1.0 },
        { baseYRatio: 0.52, stroke: 'rgba(184, 137, 56, 0.17)', speed: -0.85 },
        { baseYRatio: 0.78, stroke: 'rgba(153, 27, 27, 0.13)', speed: 1.15 },
      ];
      waveConfigs.forEach((wc, w) => {
        ctx.beginPath();
        const baseY = height * wc.baseYRatio;
        for (let x = 0; x <= width; x += 24) {
          const y =
            baseY +
            Math.sin(x * 0.0032 + t * wc.speed + w * 1.3) * 20 +
            Math.cos(x * 0.0016 - t * 0.75) * 11;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wc.stroke;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      });

      // 5. Floating Verification Ledger Nodes & Multi-Color Links
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
          if (dist < 175) {
            const alpha = (1 - dist / 175) * 0.13;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(${n.colorRgb}, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + n.phase);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.colorRgb}, ${(0.22 + pulse * 0.22).toFixed(3)})`;
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
      className="pointer-events-none fixed inset-0 w-full h-full z-0 opacity-95"
    />
  );
};

// ============================================================================
// 4. UNIVERSAL BACK NAVIGATION + BREADCRUMB BAR
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
const STEP_BACK_REQUEST_EVENT = 'eduverify:step-back-request';

export function setPortalBreadcrumbDetail(detailLabel: string | null) {
  window.dispatchEvent(new CustomEvent(BREADCRUMB_DETAIL_EVENT, { detail: detailLabel }));
}

export function onPortalStepBackRequest(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(STEP_BACK_REQUEST_EVENT, handler);
  return () => window.removeEventListener(STEP_BACK_REQUEST_EVENT, handler);
}

export const PortalBackButton: React.FC<{
  fallbackTo?: string;
  fallbackPath?: string;
  label?: string;
  onStepBack?: () => void;
  className?: string;
}> = ({ fallbackTo, fallbackPath, label = 'Back', onStepBack, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolvedFallback = fallbackTo || fallbackPath || '/';

  const handleBack = () => {
    if (onStepBack) {
      onStepBack();
      return;
    }
    if (window.history.length > 1 && location.pathname !== '/') {
      navigate(-1);
    } else {
      navigate(resolvedFallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#23201B] bg-[#FFFDF9] hover:bg-[#EFE8D8] border border-[#D8CEB8] transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-2xs ${className}`}
      title="Go back to previous step or page"
    >
      <ArrowLeft className="w-3.5 h-3.5 text-[#8C6520]" />
      <span>{label}</span>
    </button>
  );
};

export const PortalBreadcrumbs: React.FC<{ portal: 'admin' | 'student' }> = ({ portal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [detailLabel, setDetailLabel] = useState<string | null>(null);

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
  const isAtRootDashboard = location.pathname === rootPath && !detailLabel;

  const subSegments = segments.slice(1);

  const handleBackStep = () => {
    if (detailLabel) {
      window.dispatchEvent(new CustomEvent(STEP_BACK_REQUEST_EVENT));
      setDetailLabel(null);
      return;
    }
    if (!isAtRootDashboard) {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate(rootPath);
      }
    } else {
      navigate('/');
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E675C] bg-[#F7F3E9]/95 border-b border-[#E5DEC9] px-4 sm:px-6 py-2"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Universal Step-by-Step Back Button on the Left */}
        <button
          type="button"
          onClick={handleBackStep}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 mr-1.5 rounded-md text-xs font-semibold text-[#23201B] bg-[#FFFDF9] hover:bg-[#EFE8D8] border border-[#D5C7AA] transition-colors cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#8C6520]" />
          <span>
            {detailLabel
              ? 'Back to List'
              : isAtRootDashboard
                ? 'Back to Home'
                : 'Back Step'}
          </span>
        </button>

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
      </div>

      {/* Right side of breadcrumb bar: Minute-by-Minute Policy Alert Summary */}
      <LiveMinuteAlertInline />
    </nav>
  );
};

const LiveMinuteAlertInline: React.FC = () => {
  const { timelineMilestone } = useAuth();
  const isUrgent = timelineMilestone.remainingSeconds <= 120;
  const isMid = timelineMilestone.remainingSeconds <= 300 && !isUrgent;

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-0.5 rounded border ${
        isUrgent
          ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] font-semibold'
          : isMid
            ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
            : 'bg-[#ECFDF5] text-[#14532D] border-[#A7F3D0]'
      }`}
    >
      <Clock className="w-3 h-3 shrink-0" />
      <span>{timelineMilestone.minuteAlertText}</span>
    </div>
  );
};

// ============================================================================
// 5. TOP-CENTER LIVE SESSION COUNTDOWN TIMELINE & 10-MINUTE AUTO-LOGOUT
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
  onLogout,
}) => {
  const {
    idleStatus,
    timelineMilestone,
    extendActiveSession,
    advanceSessionByOneMinute,
    simulateIdleWarning10m,
    simulateIdleTimeout15m,
  } = useAuth();
  const [extending, setExtending] = useState(false);

  const warningOpen = idleStatus === 'WARNING';
  const remainingSeconds = timelineMilestone.remainingSeconds;
  const elapsedMinutes = timelineMilestone.elapsedMinutes;

  // Automatically redirect to /login when the 10-minute session countdown reaches 00:00
  useEffect(() => {
    if (idleStatus === 'EXPIRED' || timelineMilestone.shouldAutoLogout) {
      onLogout();
    }
  }, [idleStatus, timelineMilestone.shouldAutoLogout, onLogout]);

  const handleExtendSession = async () => {
    setExtending(true);
    try {
      await extendActiveSession();
    } finally {
      setExtending(false);
    }
  };

  const barToneClass =
    remainingSeconds <= 120
      ? 'from-[#B91C1C] to-[#991B1B]'
      : remainingSeconds <= 300
        ? 'from-[#D97706] to-[#B45309]'
        : 'from-[#15803D] via-[#B88938] to-[#9C7228]';

  return (
    <>
      {/* TOP-CENTER ALWAYS-VISIBLE LIVE SESSION COUNTDOWN TIMELINE BAR */}
      <div
        role="timer"
        aria-label="Live Session Timeout Timeline"
        className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFDF9] border border-[#D8CEB8] shadow-2xs"
      >
        <div className="flex items-center gap-1.5">
          <Clock
            className={`w-3.5 h-3.5 shrink-0 ${
              remainingSeconds <= 120
                ? 'text-[#B91C1C] animate-spin'
                : remainingSeconds <= 300
                  ? 'text-[#B45309]'
                  : 'text-[#15803D]'
            }`}
          />
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#5C564C]">
            Session Timeout (10m):
          </span>
          <span
            className={`font-mono text-xs font-bold tabular-nums px-1.5 py-0.5 rounded ${
              remainingSeconds <= 120
                ? 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]'
                : remainingSeconds <= 300
                  ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                  : 'bg-[#ECFDF5] text-[#14532D] border border-[#A7F3D0]'
            }`}
          >
            {formatSessionCountdown(remainingSeconds)}
          </span>
        </div>

        {/* 10-Minute Visual Segment Timeline with Minute Checkpoints */}
        <div className="hidden sm:flex flex-col gap-1 min-w-[165px]">
          <div className="grid grid-cols-10 gap-0.5 h-2 w-full bg-[#EBE4D5] p-0.5 rounded">
            {timelineMilestone.minuteCheckpoints.map((cp) => {
              const isRemainingSegment = cp.minute <= timelineMilestone.remainingMinutesCeiling;
              return (
                <div
                  key={cp.minute}
                  title={`Minute ${cp.minute} of 10`}
                  className={`h-full rounded-[1px] transition-all duration-300 ${
                    isRemainingSegment
                      ? remainingSeconds <= 120
                        ? 'bg-[#B91C1C]'
                        : remainingSeconds <= 300
                          ? 'bg-[#D97706]'
                          : 'bg-[#15803D]'
                      : 'bg-[#D6CEBE]/50'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-[#6E675C] leading-none">
            <span>Min {elapsedMinutes}/10</span>
            <span>Auto-Login @ 10m</span>
          </div>
        </div>

        {/* Interactive Controls to Step +1 Minute, Reset Timer, or Preview Warning */}
        <div className="flex items-center gap-1 border-l border-[#E4DEC9] pl-2">
          <button
            type="button"
            onClick={advanceSessionByOneMinute}
            title="Advance timer by 1 minute to inspect minute-by-minute 10m timeout alerts"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FAF3E3] hover:bg-[#EFE2C6] text-[#7A5B20] border border-[#DFC99B] transition-colors cursor-pointer whitespace-nowrap"
          >
            <FastForward className="w-3 h-3 text-[#B88938]" />
            <span>+1m</span>
          </button>
          <button
            type="button"
            onClick={handleExtendSession}
            title="Reset session timer back to full 10:00"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F5EFE2] hover:bg-[#E8DEC8] text-[#302F29] border border-[#D8CEB8] transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${extending ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={() => simulateIdleWarning10m()}
            title="Preview session timeout warning modal"
            className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] transition-colors cursor-pointer whitespace-nowrap"
          >
            Warn
          </button>
        </div>
      </div>

      {/* Session Timeout Warning Modal (Opens automatically when 2 minutes remain before 10m auto-logout) */}
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
                    SECURITY COMPLIANCE · 10-MINUTE AUTO-LOGOUT TIMELINE
                  </span>
                  <h2 id="idle-timeout-title" className="font-display text-lg font-bold text-[#23201B]">
                    Session Timeout Approaching (10m Policy)
                  </h2>
                </div>
              </div>
              <span
                aria-live="polite"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] shrink-0 tabular-nums"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatSessionCountdown(remainingSeconds)}</span>
              </span>
            </div>

            <div id="idle-timeout-desc" className="space-y-2 text-xs text-[#575249] leading-relaxed">
              <p>
                Your session in <strong>{portalName}</strong> has reached{' '}
                <strong>Minute {elapsedMinutes} of 10</strong> on the security compliance timeline.
              </p>
              <p>
                After <strong>10 minutes</strong>, your session automatically returns to the login
                page to protect student APAAR records. You have{' '}
                <strong className="font-mono text-[#B91C1C]">
                  {formatSessionCountdown(remainingSeconds)}
                </strong>{' '}
                remaining.
              </p>
            </div>

            {/* Live Timeline Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#6E675C]">
                <span>Elapsed: {elapsedMinutes}m / 10m</span>
                <span>Auto-Redirect at 10:00 ({remainingSeconds}s left)</span>
              </div>
              <div className="w-full h-2.5 bg-[#EFECE4] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${barToneClass} transition-all duration-500 ease-linear`}
                  style={{
                    width: `${Math.max(
                      0,
                      (remainingSeconds / SESSION_TIMELINE_TOTAL_SECONDS) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={extending}
                onClick={handleExtendSession}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] border border-[#B88938]/40 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${extending ? 'animate-spin' : ''}`} />
                <span>{extending ? 'Resetting Timer...' : 'Reset 10-Minute Session Timer'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  simulateIdleTimeout15m();
                  onLogout();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-[#B91C1C] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Return to Login Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// 6. LIVE ACTION TELEMETRY STRIP (For Every 2nd/3rd Section in Portals)
// ============================================================================
export interface LiveTelemetryEventItem {
  id: string;
  code: string;
  title: string;
  detail: string;
  status: 'VERIFIED' | 'EVALUATING' | 'ALERT' | 'ACTIVE' | 'REVIEW';
  metric: string;
}

export const PortalLiveActionSimulator: React.FC<{
  heading?: string;
  subheading?: string;
  roleBadge?: string;
  events?: LiveTelemetryEventItem[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  steps?: LiveTelemetryEventItem[];
  theme?: 'student' | 'admin';
}> = ({
  heading,
  subheading,
  roleBadge,
  events,
  title,
  subtitle,
  eyebrow,
  steps,
}) => {
  const resolvedHeading = heading || title || 'Live Telemetry Pipeline';
  const resolvedSubheading = subheading || subtitle || '';
  const resolvedRoleBadge = roleBadge || eyebrow || 'LIVE TELEMETRY';
  const resolvedEvents = events || steps || [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [pulseCount, setPulseCount] = useState(1);

  useEffect(() => {
    if (!isPlaying || resolvedEvents.length === 0) return;
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % resolvedEvents.length);
      setPulseCount((c) => c + 1);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isPlaying, resolvedEvents.length]);

  const current =
    resolvedEvents.length > 0
      ? resolvedEvents[activeIdx % resolvedEvents.length] || resolvedEvents[0]
      : null;

  return (
    <div
      className="rounded-xl border border-[#DFD2B8] p-5 shadow-2xs relative overflow-hidden"
      style={{
        background:
          'linear-gradient(125deg, rgba(20, 83, 45, 0.07) 0%, rgba(255, 253, 249, 0.96) 44%, rgba(184, 137, 56, 0.11) 76%, rgba(153, 27, 27, 0.07) 100%)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="text-[#14532D] font-bold uppercase tracking-wider">{resolvedRoleBadge}</span>
            <span aria-hidden="true" className="text-[#B88938]">·</span>
            <span className="text-[#7A5B20] font-semibold">
              LIVE STREAM CYCLE #{pulseCount}
            </span>
          </div>
          <h3 className="font-display text-base font-bold text-[#23201B]">{resolvedHeading}</h3>
          <p className="text-xs text-[#5C564C]">{resolvedSubheading}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (resolvedEvents.length === 0) return;
              setActiveIdx((prev) => (prev - 1 + resolvedEvents.length) % resolvedEvents.length);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#FFFDF9] text-[#23201B] hover:bg-[#F5EFE2] border border-[#D8CEB8] transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#8C6520]" />
            <span>Back Step</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (resolvedEvents.length === 0) return;
              setActiveIdx((prev) => (prev + 1) % resolvedEvents.length);
              setPulseCount((c) => c + 1);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] border border-[#B88938]/40 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Step Live Action</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#FFFDF9] text-[#23201B] hover:bg-[#F5EFE2] border border-[#D8CEB8] transition-colors cursor-pointer whitespace-nowrap"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#B88938]" />
                <span>Pause Live</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Resume Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive 3-Stage Live Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {resolvedEvents.map((ev, idx) => {
          const isActive = idx === activeIdx % resolvedEvents.length;
          const toneBorder =
            ev.status === 'VERIFIED'
              ? isActive
                ? 'border-[#15803D] bg-[#ECFDF5]/80'
                : 'border-[#E4DEC9] bg-[#FFFDF9]/90'
              : ev.status === 'ALERT' || ev.status === 'REVIEW'
                ? isActive
                  ? 'border-[#991B1B] bg-[#FEF2F2]/85'
                  : 'border-[#E4DEC9] bg-[#FFFDF9]/90'
                : isActive
                  ? 'border-[#B88938] bg-[#FAF3E3]/90'
                  : 'border-[#E4DEC9] bg-[#FFFDF9]/90';

          return (
            <button
              key={ev.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`text-left p-3.5 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between ${toneBorder} ${
                isActive ? 'shadow-sm -translate-y-0.5' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[#23201B]">{ev.code}</span>
                  <span
                    className={`font-semibold ${
                      ev.status === 'VERIFIED'
                        ? 'text-[#15803D]'
                        : ev.status === 'ALERT'
                          ? 'text-[#991B1B]'
                          : 'text-[#8C6520]'
                    }`}
                  >
                    {ev.metric}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-[#23201B]">{ev.title}</p>
                <p className="mt-1 text-[11px] text-[#5C564C] leading-relaxed">{ev.detail}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E4DEC9]/80 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#6E675C]">
                  {isActive ? 'ACTIVE TELEMETRY STREAM' : 'CLICK TO FOCUS'}
                </span>
                <span className="font-bold text-[#23201B]">{ev.status}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Output Bar */}
      {current && (
        <div className="mt-3 px-3.5 py-2 rounded-lg bg-[#1E1B17] text-[#F5EFE2] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#34D399]" />
            <span className="text-[#E8C87A] font-semibold">[{current.code}]</span>
            <span className="text-[#F5EFE2]">{current.title}</span>
          </div>
          <div className="flex items-center gap-2 text-[#86EFAC]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{current.metric}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 7. GLOBAL CURSOR SPOTLIGHT FOLLOWER (Champagne-Gold Luminous Halo with Lerp Damping)
// ============================================================================
export const GlobalCursorSpotlight: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Only mount on desktop/fine-pointer devices, bypass for touch devices
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    let targetX = -200;
    let targetY = -200;
    let currentX = -200;
    let currentY = -200;
    let animationFrameId = 0;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Detect if cursor is hovering over interactive elements (buttons, links, chips, inputs)
      const targetElement = e.target as HTMLElement | null;
      if (targetElement) {
        const interactive = targetElement.closest(
          'button, a, input, select, textarea, [role="button"], [role="tab"], [data-spotlight-accent="true"]'
        );
        setIsHovering(Boolean(interactive));
      }
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
    };

    const handlePointerEnter = () => {
      setIsVisible(true);
    };

    // Smooth Spring/Lerp Loop for fluid floating feel
    const loop = () => {
      // Lerp with 0.16 damping for smooth organic float
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = window.requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    document.addEventListener('mouseenter', handlePointerEnter);
    animationFrameId = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('mouseenter', handlePointerEnter);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 35,
        willChange: 'transform, width, height, opacity',
        opacity: isVisible ? (isHovering ? 0.85 : 0.65) : 0,
        width: isHovering ? '260px' : '180px',
        height: isHovering ? '260px' : '180px',
        transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), height 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease',
      }}
      className="rounded-full blur-2xl"
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: isHovering
            ? 'radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, rgba(184, 137, 56, 0.16) 45%, rgba(20, 83, 45, 0.08) 70%, transparent 80%)'
            : 'radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, rgba(184, 137, 56, 0.10) 50%, transparent 75%)',
        }}
      />
    </div>
  );
};



