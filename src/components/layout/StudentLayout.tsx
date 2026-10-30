import React, { useState } from 'react';
import { NavLink, Outlet, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Fingerprint,
  QrCode,
  AlertTriangle,
  ShieldCheck,
  History,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Lock,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { WeaveLogo } from '../ui/WeaveLogo';
import {
  PortalAmbientCanvas,
  PortalBreadcrumbs,
  PortalBackButton,
  IdleSessionTimeoutManager,
} from '../ui/PortalEnhancements';
import { useAuth } from '../../lib/auth';

interface StudentNavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  end?: boolean;
}

const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { to: '/student/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/student/profile', label: 'My Profile', icon: UserCheck },
  { to: '/student/academic-records', label: 'Academic Records', icon: BookOpen },
  { to: '/student/apaar', label: 'APAAR ID', icon: Fingerprint },
  { to: '/student/verification', label: 'Verification', icon: QrCode },
  { to: '/student/discrepancies', label: 'Report a Discrepancy', icon: AlertTriangle },
  { to: '/student/consent', label: 'Consent & Privacy', icon: ShieldCheck },
  { to: '/student/history', label: 'Activity History', icon: History },
  { to: '/student/help', label: 'Help & Support', icon: HelpCircle },
];

export const StudentLayout: React.FC = () => {
  const { user, isAuthenticated, sessionExpiredReason, isStudent, switchRolePersona, logout } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleIdleTimeoutLogout = () => {
    logout('IDLE_TIMEOUT_15M');
    navigate('/login?reason=idle_timeout', { replace: true });
  };

  if (!isAuthenticated) {
    return (
      <Navigate
        to={sessionExpiredReason === 'IDLE_TIMEOUT_15M' ? '/login?reason=idle_timeout' : '/login'}
        replace
      />
    );
  }

  // Strict Role Protection: Administrators cannot browse Student Portal unless authenticated as a student
  if (!isStudent) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] text-[#23201B] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#FFFDF9] border border-[#E4DEC9] rounded-xl shadow-sm p-8 space-y-5">
          <div className="w-11 h-11 rounded-lg bg-[#B88938]/15 border border-[#B88938]/30 flex items-center justify-center text-[#8C6520]">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#8C6520]">
              ROLE BOUNDARY ENFORCED · STUDENT PORTAL
            </span>
            <h1 className="font-display text-xl font-bold text-[#23201B]">
              Active Session is Scoped to AICTE Administration
            </h1>
            <p className="text-sm text-[#5C564C] leading-relaxed">
              You are currently signed in as <strong>{user.name}</strong> ({user.roleLabel}). The{' '}
              <strong>My EduVerify Student Portal</strong> is strictly isolated to authenticated
              student identities.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] transition-colors cursor-pointer"
            >
              <span>Go to AICTE Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
            <button
              type="button"
              onClick={() => switchRolePersona('student')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#9C7228] text-white hover:bg-[#825E1F] transition-colors cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Switch to Student (STU-2026-101)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F3E9] text-[#23201B]">
      {/* Continuous Live Ambient Background Canvas */}
      <PortalAmbientCanvas variant="student" />

      {/* Skip Link */}
      <a
        href="#student-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#23201B] focus:text-[#FFFDF9] focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to student portal content
      </a>

      {/* Top Student Portal Banner */}
      <div
        role="region"
        aria-label="Student Portal Identity Banner"
        className="relative z-10 w-full bg-[#23201B] text-[#F5EFE2] px-4 py-2 text-xs border-b border-[#3D372E]"
      >
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#B88938]/25 text-[#E8C87A] border border-[#D4AF37]/40 font-mono text-[10px] font-semibold tracking-wider uppercase">
              <GraduationCap className="w-3 h-3 text-[#D4AF37]" />
              My EduVerify · Student Portal
            </span>
            <span className="text-[#C7BFA8] hidden sm:inline">
              Personal Academic Identity, APAAR Status &amp; Consent Management (Synthetic Demo Data)
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#D8CEB8]">
            <span>Student ID: {user.student_ref || 'STU-2026-101'}</span>
            <span className="text-[#5C5346]">|</span>
            <span className="text-[#E8C87A]">APAAR Masked Only</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Desktop Student Sidebar */}
        <aside
          aria-label="Student Portal Navigation"
          className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 bg-[#FFFDF9]/95 backdrop-blur-xs border-r border-[#E4DEC9] select-none"
        >
          <div className="p-5 border-b border-[#E4DEC9] flex items-center justify-between">
            <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-[#B88938] rounded">
              <WeaveLogo />
            </Link>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF3E3] text-[#8C6520] border border-[#DFC99B] font-semibold">
              Student
            </span>
          </div>

          {/* Student Identity Summary Chip */}
          <div className="mx-3 mt-4 p-3 rounded-lg bg-[#FAF6EC] border border-[#E4DEC9]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#23201B] to-[#4A3F2F] text-[#E8C87A] border border-[#B88938]/50 font-display font-semibold text-xs flex items-center justify-center shrink-0">
                {user.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#23201B] truncate">{user.name}</p>
                <p className="text-[11px] font-mono text-[#8C6520] truncate">
                  {user.student_ref || 'STU-2026-101'}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#6E675C] truncate">
              {user.institution_name || 'NIT Kurukshetra (Synthetic)'}
            </p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8C8476] font-semibold">
              My EduVerify Menu
            </div>
            {STUDENT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#23201B] text-[#FFFDF9] font-semibold shadow-xs border border-[#B88938]/40'
                        : 'text-[#5C564C] hover:text-[#23201B] hover:bg-[#F3EDE0]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#B88938]" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout Footer */}
          <div className="p-4 border-t border-[#E4DEC9] space-y-2 bg-[#FAF6EC]/70">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] border border-[#FECACA] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout of Student Portal</span>
            </button>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header: Left Back + Student Scope | Top-Center Session Timeline | Right Actions */}
          <header className="sticky top-0 z-20 bg-[#FFFDF9]/95 backdrop-blur border-b border-[#E4DEC9] px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left Zone: Back Button + Student Ref */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Open student navigation menu"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg border border-[#E4DEC9] text-[#23201B] hover:bg-[#F5EFE2]"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <PortalBackButton fallbackTo="/student/dashboard" label="Back" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#23201B]">My EduVerify</span>
                    <span className="text-[#C4B9A5]">/</span>
                    <span className="text-xs font-mono text-[#8C6520] font-semibold">
                      {user.student_ref || 'STU-2026-101'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E675C] hidden xl:block">
                    Individual Student Verification, Academic Records &amp; Consent Portal
                  </p>
                </div>
              </div>

              {/* Top-Center Zone: Always-Visible 10m Session Countdown Timeline */}
              <div className="flex items-center justify-center mx-auto">
                <IdleSessionTimeoutManager
                  portalName="My EduVerify Student Portal"
                  userRole={user.role}
                  onLogout={handleIdleTimeoutLogout}
                />
              </div>

              {/* Right Zone: Quick Student Actions & Logout */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/student/verification"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF3E3] text-[#7A5B20] border border-[#DFC99B] hover:bg-[#F3E6C8] transition-colors whitespace-nowrap shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#B88938]" />
                  <span>My Verification QR</span>
                </Link>
                <Link
                  to="/student/discrepancies"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] border border-[#B88938]/40 transition-colors whitespace-nowrap shrink-0"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Report Discrepancy</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5C564C] hover:text-[#B91C1C] hover:bg-[#FEF2F2] border border-[#DFD5C2] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Path-Aware Breadcrumb Bar */}
          <PortalBreadcrumbs portal="student" />

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Mobile student navigation"
              className="fixed inset-0 z-50 lg:hidden flex"
            >
              <div
                className="fixed inset-0 bg-[#1C1917]/60"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative w-72 max-w-full bg-[#FFFDF9] h-full flex flex-col z-10 shadow-xl">
                <div className="p-4 border-b border-[#E4DEC9] flex items-center justify-between">
                  <WeaveLogo />
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#6E675C] hover:text-[#23201B]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {STUDENT_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium ${
                            isActive
                              ? 'bg-[#23201B] text-[#FFFDF9] font-semibold'
                              : 'text-[#5C564C] hover:bg-[#F3EDE0]'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0 text-[#B88938]" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-[#E4DEC9]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-[#B91C1C] bg-[#FEF2F2]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Outlet with Blurry-to-Normal Entrance Transition */}
          <main id="student-main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
            <div key={location.pathname} className="animate-blur-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
