import React, { useState } from 'react';
import { NavLink, Outlet, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  GitCompare,
  BarChart3,
  BadgeCheck,
  PieChart,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { WeaveLogo } from '../ui/WeaveLogo';
import {
  PortalAmbientCanvas,
  PortalBreadcrumbs,
  PortalBackButton,
  IdleSessionTimeoutManager,
} from '../ui/PortalEnhancements';
import { useAuth } from '../../lib/auth';
import type { UserRole } from '../../lib/weaveEngine';

interface AdminNavSection {
  heading: string;
  items: Array<{
    to: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    end?: boolean;
  }>;
}

const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    heading: 'OVERVIEW',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    heading: 'INSTITUTION MANAGEMENT',
    items: [
      { to: '/admin/institutions', label: 'Institutions', icon: Building2 },
      { to: '/admin/students', label: 'Student Records', icon: Users },
      { to: '/admin/bulk-upload', label: 'Bulk Data Upload', icon: FileSpreadsheet },
    ],
  },
  {
    heading: 'DATA QUALITY',
    items: [
      { to: '/admin/data-validation', label: 'Validation Centre', icon: ShieldCheck },
      { to: '/admin/duplicates', label: 'Duplicate Detection', icon: GitCompare },
      { to: '/admin/intake-monitoring', label: 'Intake Monitoring', icon: BarChart3 },
    ],
  },
  {
    heading: 'VERIFICATION',
    items: [{ to: '/admin/verification', label: 'Verification Requests', icon: BadgeCheck }],
  },
  {
    heading: 'ANALYTICS',
    items: [
      { to: '/admin/reports', label: 'Reports & Analytics', icon: PieChart },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
    ],
  },
  {
    heading: 'SYSTEM',
    items: [{ to: '/admin/settings', label: 'Settings', icon: Settings }],
  },
];

const ADMIN_ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'regulator_admin', label: 'AICTE Directorate Admin' },
  { value: 'regulator_officer', label: 'Regulator Review Officer' },
  { value: 'institution_admin', label: 'Institution Admin (INST-KKR-101)' },
  { value: 'institution_operator', label: 'Institution Operator (INST-KKR-101)' },
  { value: 'auditor', label: 'Security & Audit Reviewer' },
];

export const AdminLayout: React.FC = () => {
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

  // Strict Role Protection: Students cannot access /admin/* routes
  if (isStudent) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] text-[#23201B] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#FFFDF9] border border-[#FECACA] rounded-xl shadow-sm p-8 space-y-5">
          <div className="w-11 h-11 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#B91C1C]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#B91C1C]">
              403 FORBIDDEN · ROLE PROTECTION ACTIVE
            </span>
            <h1 className="font-display text-xl font-bold text-[#23201B]">
              AICTE Administration Console Restricted
            </h1>
            <p className="text-sm text-[#5C564C] leading-relaxed">
              You are currently signed in with a <strong>Student</strong> account (
              <span className="font-mono">{user.student_ref || 'STU-2026-101'}</span>). Student
              accounts cannot access institutional management, bulk CSV uploads, cross-institution
              duplicate queues, or regulatory audit logs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#9C7228] text-white hover:bg-[#825E1F] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to My EduVerify Portal</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Administration Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F3E9] text-[#23201B]">
      {/* Continuous Live Ambient Background Canvas */}
      <PortalAmbientCanvas variant="admin" />

      {/* Skip Link */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#23201B] focus:text-[#FFFDF9] focus:rounded-md focus:text-sm focus:font-medium"
      >
        Skip to AICTE admin console content
      </a>

      {/* Top Regulatory Governance Banner */}
      <div
        role="region"
        aria-label="AICTE Administration Console Banner"
        className="relative z-10 w-full bg-[#1E1B17] text-[#F5EFE2] px-4 py-2 text-xs border-b border-[#383229]"
      >
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#B88938]/25 text-[#E8C87A] border border-[#D4AF37]/40 font-mono text-[10px] font-semibold tracking-wider uppercase">
              AICTE ADMIN CONSOLE
            </span>
            <span className="text-[#C7BFA8] hidden sm:inline">
              Centralised Institutional Compliance, APAAR Validation, Duplicate Adjudication &amp; Intake Governance
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-[#D8CEB8]">
            <span>Ruleset: 2026.10.v1</span>
            <span className="text-[#5C5346]">|</span>
            <span className="text-[#78C693]">Synthetic Demonstration Dataset</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Desktop Admin Sidebar (Deep Obsidian-Bronze with Champagne Accents) */}
        <aside
          aria-label="AICTE Administration Sidebar"
          className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 bg-[#1E1B17] text-[#F5EFE2] border-r border-[#332E25] select-none"
        >
          <div className="p-5 border-b border-[#332E25] flex items-center justify-between">
            <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-[#D4AF37] rounded">
              <WeaveLogo tone="light" />
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {ADMIN_NAV_SECTIONS.map((section) => (
              <div key={section.heading} className="space-y-1">
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#9A907E] font-semibold">
                  {section.heading}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-[#B88938] to-[#9C7228] text-[#FFFDF9] font-semibold shadow-xs'
                            : 'text-[#C7BFA8] hover:text-[#FFFDF9] hover:bg-white/8'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Admin Role & Logout Footer */}
          <div className="p-4 border-t border-[#332E25] space-y-3 bg-[#171411]">
            <div>
              <p className="text-xs font-semibold text-[#FFFDF9] truncate">{user.name}</p>
              <p className="text-[11px] font-mono text-[#E8C87A] truncate">{user.roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#FCA5A5] hover:bg-red-500/20 border border-red-400/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Admin Header: Left Back + Title | Top-Center Session Timeline | Right Actions */}
          <header className="sticky top-0 z-20 bg-[#FFFDF9]/95 backdrop-blur border-b border-[#E4DEC9] px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left Zone: Back Button + Scope Title */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Open administration navigation menu"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg border border-[#E4DEC9] text-[#23201B] hover:bg-[#F5EFE2]"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <PortalBackButton fallbackTo="/admin/dashboard" label="Back" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#23201B]">
                      AICTE Administration Console
                    </span>
                    <span className="text-[#C4B9A5]">/</span>
                    <span className="text-xs font-mono text-[#8C6520] font-semibold">
                      {user.institution_id ? `Tenant: ${user.institution_id}` : 'National AICTE Scope'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E675C] hidden xl:block">
                    {user.scopeDescription}
                  </p>
                </div>
              </div>

              {/* Top-Center Zone: Always-Visible 10m Session Countdown Timeline */}
              <div className="flex items-center justify-center mx-auto">
                <IdleSessionTimeoutManager
                  portalName="AICTE Administration Console"
                  userRole={user.role}
                  onLogout={handleIdleTimeoutLogout}
                />
              </div>

              {/* Right Zone: Scope Switcher & Logout */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <label
                    htmlFor="admin-role-switcher"
                    className="text-[11px] font-mono uppercase tracking-wider text-[#6E675C] hidden xl:inline"
                  >
                    Scope:
                  </label>
                  <select
                    id="admin-role-switcher"
                    value={user.role}
                    onChange={(e) => switchRolePersona(e.target.value as UserRole)}
                    className="text-xs font-medium bg-[#FAF6EC] border border-[#D8CEB8] rounded-lg px-2.5 py-1.5 text-[#23201B] focus:outline-none focus:ring-2 focus:ring-[#B88938]"
                  >
                    {ADMIN_ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Link
                  to="/admin/bulk-upload"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] border border-[#B88938]/40 transition-colors whitespace-nowrap shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Bulk Upload</span>
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
          <PortalBreadcrumbs portal="admin" />

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Mobile administration navigation"
              className="fixed inset-0 z-50 lg:hidden flex"
            >
              <div
                className="fixed inset-0 bg-[#1C1917]/60"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative w-72 max-w-full bg-[#1E1B17] text-[#F5EFE2] h-full flex flex-col z-10 shadow-xl">
                <div className="p-4 border-b border-[#332E25] flex items-center justify-between">
                  <WeaveLogo tone="light" />
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-[#C7BFA8] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
                  {ADMIN_NAV_SECTIONS.map((section) => (
                    <div key={section.heading} className="space-y-1">
                      <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#9A907E]">
                        {section.heading}
                      </div>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                                isActive
                                  ? 'bg-[#B88938] text-[#FFFDF9] font-semibold'
                                  : 'text-[#C7BFA8] hover:bg-white/10'
                              }`
                            }
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Main Outlet with Blurry-to-Normal Entrance Transition */}
          <main id="admin-main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
            <div key={location.pathname} className="animate-blur-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
