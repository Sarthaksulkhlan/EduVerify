import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Fingerprint,
  BookOpen,
  QrCode,
  ShieldCheck,
  Building2,
  GraduationCap,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Send,
  History,
  HelpCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { weaveApiClient, weaveQueryKeys } from '../../lib/api-client';
import { useAuth } from '../../lib/auth';
import { AnimatedCounter } from '../../components/ui/PortalEnhancements';
import type { StudentDiscrepancyTicket } from '../../lib/weaveEngine';

function useStudentPortalData() {
  const { user } = useAuth();
  const studentRef = user.student_ref || 'STU-2026-101';
  return useQuery({
    queryKey: weaveQueryKeys.studentMe(studentRef),
    queryFn: () => weaveApiClient.getStudentMe(studentRef),
  });
}

function getApaarStatusLabel(status: string): 'Verified' | 'Pending' | 'Not Verified' {
  if (status === 'VERIFIED') return 'Verified';
  if (status === 'VALIDATION_FAILED') return 'Not Verified';
  return 'Pending';
}

function getEnrolmentStatusLabel(status: string): 'Active' | 'Pending' | 'Requires Review' {
  if (status === 'VERIFIED') return 'Active';
  if (status === 'FLAGGED_CONFLICT' || status === 'VALIDATION_FAILED') return 'Requires Review';
  return 'Pending';
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'success' | 'warning' | 'error' | 'info';
}) {
  const styles = {
    success: 'bg-[#15803D]/12 text-[#166534] border-[#15803D]/30',
    warning: 'bg-[#B45309]/12 text-[#92400E] border-[#B45309]/30',
    error: 'bg-[#B91C1C]/12 text-[#991B1B] border-[#B91C1C]/30',
    info: 'bg-[#B88938]/15 text-[#7A5B20] border-[#B88938]/35',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[tone]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ============================================================================
// A. STUDENT DASHBOARD (/student/dashboard)
// ============================================================================
export const StudentDashboardPage: React.FC = () => {
  const { user, loginWithAccount } = useAuth();
  const { data, isLoading, refetch } = useStudentPortalData();
  const [animateChart, setAnimateChart] = useState(false);

  useEffect(() => {
    setAnimateChart(false);
    const timer = window.setTimeout(() => setAnimateChart(true), 80);
    return () => window.clearTimeout(timer);
  }, [user.student_ref]);

  const handleSwitchDemoStudent = async (studentRef: string) => {
    const res = await weaveApiClient.login(studentRef, 'synth-demo-session', 'student');
    loginWithAccount(res.user, res.access_token);
  };

  if (isLoading || !data) {
    return (
      <div className="p-8 bg-[#FFFDF9] rounded-xl border border-[#E4DEC9] text-sm text-[#6E675C]">
        Loading your academic identity and verification overview...
      </div>
    );
  }

  const { student, course_records, verification_requests, attestations, discrepancies } = data;
  const apaarStatus = getApaarStatusLabel(student.status);
  const enrolmentStatus = getEnrolmentStatusLabel(student.status);
  const completedVerifications = verification_requests.filter((v) => v.status === 'Verified').length;
  const pendingVerifications = verification_requests.filter((v) => v.status !== 'Verified').length;
  const activeAttestation = attestations.find((a) => a.status === 'ACTIVE') || attestations[0];
  const totalCreditsEarned = course_records.reduce((sum, c) => sum + c.credits, 0);

  const courseChartData = course_records.map((c) => ({
    code: c.course_code,
    AttendancePct: animateChart ? c.attendance_pct : 0,
    CreditWeight: animateChart ? Math.round(c.credits * 20) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C6520] font-semibold">
            MY EDUVERIFY · STUDENT PORTAL
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#23201B] mt-0.5">
            Welcome back, {student.full_name}
          </h1>
          <p className="text-sm text-[#5C564C] mt-1">
            Your academic identity, verified course progression, and APAAR consent overview.
          </p>
        </div>

        {/* Demo Student Persona Selector for Evaluators */}
        <div className="flex flex-wrap items-center gap-2 bg-[#FFFDF9] p-2 rounded-lg border border-[#E4DEC9] shadow-2xs">
          <span className="text-[11px] font-mono text-[#6E675C] px-1.5">Demo Student:</span>
          {[
            { ref: 'STU-2026-101', label: 'Meera (Verified)' },
            { ref: 'STU-2026-102', label: 'Diya (Verified)' },
            { ref: 'STU-2026-103', label: 'Aarav (Conflict Review)' },
          ].map((item) => (
            <button
              key={item.ref}
              type="button"
              onClick={() => handleSwitchDemoStudent(item.ref)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                (user.student_ref || 'STU-2026-101') === item.ref
                  ? 'bg-[#23201B] text-[#FFFDF9] font-semibold border border-[#B88938]/40'
                  : 'text-[#5C564C] hover:bg-[#F3EDE0]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh student overview"
            className="p-1.5 text-[#6E675C] hover:text-[#23201B] rounded cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Student Profile Card (Warm Obsidian-Bronze & Champagne Gold) */}
      <div className="bg-gradient-to-r from-[#1E1B17] via-[#2A241D] to-[#3B3124] rounded-xl p-6 text-[#FFFDF9] shadow-sm border border-[#B88938]/35">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#B88938] to-[#8C6520] border-2 border-[#E8C87A]/70 flex items-center justify-center font-display text-xl font-bold text-[#FFFDF9] shrink-0 shadow-md">
              {student.full_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-display text-xl font-bold text-[#FFFDF9]">{student.full_name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    enrolmentStatus === 'Active'
                      ? 'bg-[#15803D]/25 text-[#86EFAC] border border-[#86EFAC]/30'
                      : 'bg-[#B45309]/25 text-[#FCD34D] border border-[#FCD34D]/35'
                  }`}
                >
                  Enrolment: {enrolmentStatus}
                </span>
              </div>
              <p className="text-xs text-[#E4DEC9] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>{student.institution_name}</span>
              </p>
              <p className="text-xs text-[#D8CEB8] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>
                  {student.course_name} · {student.branch} ({student.current_academic_year})
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/8 backdrop-blur-xs rounded-lg p-3.5 border border-[#D4AF37]/25">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7BFA8] block">
                Student ID
              </span>
              <span className="font-mono text-sm font-semibold text-[#FFFDF9]">
                {student.student_ref}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7BFA8] block">
                Masked APAAR ID
              </span>
              <span className="font-mono text-sm font-semibold text-[#E8C87A]">
                {student.apaar_masked}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7BFA8] block">
                Registered Credits
              </span>
              <span className="font-mono text-sm font-semibold text-[#FFFDF9]">
                <AnimatedCounter value={totalCreditsEarned} durationMs={1100} /> Credits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards (Animated From 0 to Destination) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: APAAR ID Status */}
        <div className="bg-[#FFFDF9] rounded-xl border border-[#E4DEC9] p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E675C]">APAAR ID Status</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF3E3] text-[#8C6520] border border-[#DFC99B] flex items-center justify-center">
              <Fingerprint className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-[#23201B]">{apaarStatus}</span>
              <StatusPill
                label={apaarStatus}
                tone={
                  apaarStatus === 'Verified'
                    ? 'success'
                    : apaarStatus === 'Pending'
                      ? 'warning'
                      : 'error'
                }
              />
            </div>
            <p className="text-xs font-mono text-[#6E675C]">{student.apaar_masked}</p>
          </div>
          <Link
            to="/student/apaar"
            className="mt-4 text-xs font-semibold text-[#8C6520] hover:underline inline-flex items-center gap-1"
          >
            <span>Inspect APAAR Binding</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 2: Enrolment Status */}
        <div className="bg-[#FFFDF9] rounded-xl border border-[#E4DEC9] p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E675C]">Enrolment Status</span>
            <div className="w-8 h-8 rounded-lg bg-[#15803D]/12 text-[#15803D] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-[#23201B]">
                {enrolmentStatus}
              </span>
              <StatusPill
                label={enrolmentStatus}
                tone={
                  enrolmentStatus === 'Active'
                    ? 'success'
                    : enrolmentStatus === 'Pending'
                      ? 'warning'
                      : 'error'
                }
              />
            </div>
            <p className="text-xs text-[#6E675C]">
              {student.program_code} · Batch {student.batch_id}
            </p>
          </div>
          <Link
            to="/student/profile"
            className="mt-4 text-xs font-semibold text-[#8C6520] hover:underline inline-flex items-center gap-1"
          >
            <span>View Full Academic Profile</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Academic Records */}
        <div className="bg-[#FFFDF9] rounded-xl border border-[#E4DEC9] p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E675C]">Academic Records</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF3E3] text-[#8C6520] border border-[#DFC99B] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <span className="font-display text-2xl font-bold text-[#23201B] tabular-nums">
              <AnimatedCounter value={course_records.length} durationMs={1150} />
            </span>
            <p className="text-xs text-[#6E675C]">
              <AnimatedCounter
                value={course_records.filter((c) => c.source_status === 'PLATFORM_VERIFIED').length}
              />{' '}
              platform verified ·{' '}
              <AnimatedCounter
                value={
                  course_records.filter((c) => c.source_status === 'INSTITUTION_UPLOADED').length
                }
              />{' '}
              institution uploaded
            </p>
          </div>
          <Link
            to="/student/academic-records"
            className="mt-4 text-xs font-semibold text-[#8C6520] hover:underline inline-flex items-center gap-1"
          >
            <span>View Course Records</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Verification Requests */}
        <div className="bg-[#FFFDF9] rounded-xl border border-[#E4DEC9] p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6E675C]">Verification Requests</span>
            <div className="w-8 h-8 rounded-lg bg-[#23201B]/10 text-[#23201B] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <span className="font-display text-2xl font-bold text-[#23201B] tabular-nums">
              <AnimatedCounter value={verification_requests.length} durationMs={1200} />
            </span>
            <p className="text-xs text-[#6E675C]">
              <AnimatedCounter value={completedVerifications} /> completed ·{' '}
              <AnimatedCounter value={pendingVerifications} /> pending/review
            </p>
          </div>
          <Link
            to="/student/verification"
            className="mt-4 text-xs font-semibold text-[#8C6520] hover:underline inline-flex items-center gap-1"
          >
            <span>Manage Verifications &amp; QR</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Animated Course Attendance & Credit Verification Graph (0 -> Destination) */}
      <div className="bg-[#FFFDF9] rounded-xl border border-[#E4DEC9] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-[#23201B]">
              Course-Wise Verified Attendance &amp; Credit Index
            </h3>
            <p className="text-xs text-[#6E675C]">
              Animated zero-to-destination progression across your registered AICTE curriculum courses
            </p>
          </div>
          <Link
            to="/student/academic-records"
            className="text-xs font-semibold text-[#8C6520] hover:underline"
          >
            Open Full Transcript →
          </Link>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseChartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DEC8" />
              <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#5C564C' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5C564C' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFDF9',
                  borderColor: '#DFD2B8',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="AttendancePct"
                name="Verified Attendance (%)"
                fill="#23201B"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1350}
              />
              <Bar
                dataKey="CreditWeight"
                name="Credit Weight Index"
                fill="#B88938"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={1450}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Overview: Recent Verification Requests & Active Attestation / Discrepancy Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#102A43]">
                Recent Verification Requests
              </h3>
              <p className="text-xs text-slate-500">
                Organisations that have requested verification of your enrolment or APAAR status
              </p>
            </div>
            <Link
              to="/student/verification"
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {verification_requests.map((req) => (
              <div
                key={req.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#2563EB]">{req.id}</span>
                    <span className="text-sm font-semibold text-[#102A43]">
                      {req.requesting_organisation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{req.purpose}</p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Fields verified: {req.information_requested.join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill
                    label={req.status}
                    tone={
                      req.status === 'Verified'
                        ? 'success'
                        : req.status === 'Pending'
                          ? 'info'
                          : req.status === 'Requires Review'
                            ? 'warning'
                            : 'error'
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Attestation Credential & Discrepancy Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
                Platform-Issued Attestation
              </span>
              <QrCode className="w-4 h-4 text-[#102A43]" />
            </div>
            {activeAttestation ? (
              <>
                <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#102A43]">
                      {activeAttestation.id}
                    </span>
                    <StatusPill
                      label={activeAttestation.status}
                      tone={activeAttestation.status === 'ACTIVE' ? 'success' : 'warning'}
                    />
                  </div>
                  <p className="text-xs text-slate-600">{activeAttestation.purpose}</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    Valid until: {activeAttestation.expires_at.slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/verify/${activeAttestation.token || activeAttestation.id.toLowerCase()}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#102A43] text-white hover:bg-[#1E3A5F] transition-colors"
                  >
                    <span>Verify Certificate</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/student/verification"
                    className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-[#102A43] hover:bg-slate-50"
                  >
                    QR Code
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                No active platform attestation issued yet for {student.student_ref}.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#102A43]">
                My Discrepancy Reports ({discrepancies.length})
              </h3>
              <Link
                to="/student/discrepancies"
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Report issue
              </Link>
            </div>
            {discrepancies.slice(0, 2).map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#102A43]">{d.id}</span>
                  <StatusPill
                    label={d.status}
                    tone={
                      d.status === 'Resolved'
                        ? 'success'
                        : d.status === 'Rejected'
                          ? 'error'
                          : 'warning'
                    }
                  />
                </div>
                <p className="text-xs font-medium text-[#1E293B]">{d.discrepancy_type}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// B. MY ACADEMIC PROFILE (/student/profile)
// ============================================================================
export const StudentProfilePage: React.FC = () => {
  const { data, isLoading } = useStudentPortalData();

  if (isLoading || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Loading your academic profile...
      </div>
    );
  }

  const { student, institution } = data;
  const enrolmentStatus = getEnrolmentStatusLabel(student.status);

  const profileFields = [
    { label: 'Student Name', value: student.full_name, locked: true },
    { label: 'Date of Birth', value: student.dob, locked: true },
    { label: 'Student ID', value: student.student_ref, mono: true, locked: true },
    { label: 'Masked APAAR ID', value: student.apaar_masked, mono: true, locked: true },
    { label: 'Institution', value: student.institution_name, locked: true },
    {
      label: 'University / Affiliating Body',
      value: student.university || institution.university || 'NIT Kurukshetra (Autonomous)',
      locked: true,
    },
    { label: 'Course', value: student.course_name || 'Bachelor of Technology (B.Tech)', locked: true },
    {
      label: 'Branch / Discipline',
      value: `${student.branch || 'Computer Science & Engineering'} (${student.program_code})`,
      locked: true,
    },
    {
      label: 'Current Academic Year',
      value: student.current_academic_year || '2nd Year · Semester III (AY 2026–27)',
      locked: false,
    },
    { label: 'Admission Year', value: String(student.enrollment_year), mono: true, locked: true },
    { label: 'Enrolment Status', value: enrolmentStatus, locked: true },
    { label: 'Institutional Email', value: student.email || '', mono: true, locked: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
            STUDENT IDENTITY REGISTRY
          </span>
          <h1 className="font-display text-2xl font-bold text-[#102A43] mt-0.5">
            My Academic Profile
          </h1>
          <p className="text-sm text-slate-600">
            Verified identity and institutional enrolment parameters bound to your APAAR ID.
          </p>
        </div>
        <Link
          to="/student/discrepancies"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Request Profile Correction</span>
        </Link>
      </div>

      {/* Security Notice on Immutable Identity Fields */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-[#102A43]">
            Why are core identity fields locked from direct editing?
          </p>
          <p>
            To preserve regulatory integrity across AICTE-approved institutions, fields bound to
            your salted APAAR digest (Name, Date of Birth, Masked APAAR ID, Institution, and
            Program Code) cannot be overwritten directly. If you spot an error in your institutional
            upload, submit a formal request in{' '}
            <Link to="/student/discrepancies" className="text-[#2563EB] font-semibold underline">
              Report a Discrepancy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Profile Attributes Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
          <h2 className="font-display text-sm font-bold text-[#102A43]">
            Official Enrolment &amp; Identity Attributes
          </h2>
          <span className="text-xs font-mono text-slate-500">
            Source Batch: {student.batch_id}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="divide-y divide-slate-200">
            {profileFields.slice(0, 6).map((field) => (
              <div key={field.label} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">{field.label}</span>
                  <span
                    className={`text-sm font-semibold text-[#102A43] mt-0.5 block ${
                      field.mono ? 'font-mono' : ''
                    }`}
                  >
                    {field.value}
                  </span>
                </div>
                {field.locked && (
                  <span
                    title="Bound to institutional verification record"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500"
                  >
                    <Lock className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="divide-y divide-slate-200">
            {profileFields.slice(6).map((field) => (
              <div key={field.label} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">{field.label}</span>
                  <span
                    className={`text-sm font-semibold text-[#102A43] mt-0.5 block ${
                      field.mono ? 'font-mono' : ''
                    }`}
                  >
                    {field.value}
                  </span>
                </div>
                {field.locked && (
                  <span
                    title="Bound to institutional verification record"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500"
                  >
                    <Lock className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// C. MY ACADEMIC RECORDS (/student/academic-records)
// ============================================================================
export const StudentAcademicRecordsPage: React.FC = () => {
  const { data, isLoading } = useStudentPortalData();
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  if (isLoading || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Loading your academic records...
      </div>
    );
  }

  const { student, course_records } = data;
  const semesters = Array.from(new Set(course_records.map((r) => r.semester)));

  const filteredRecords = course_records.filter((r) => {
    if (semesterFilter !== 'ALL' && r.semester !== semesterFilter) return false;
    if (sourceFilter !== 'ALL' && r.source_status !== sourceFilter) return false;
    return true;
  });

  const handleExportTranscriptCsv = () => {
    const headers = [
      'Course ID',
      'Semester',
      'Academic Year',
      'Course Code',
      'Course Title',
      'Credits',
      'Grade',
      'Attendance %',
      'Verification Authority',
      'Verification Status',
    ];
    const rows = filteredRecords.map((r) =>
      [
        r.id,
        r.semester,
        r.academic_year,
        r.course_code,
        `"${r.course_title}"`,
        r.credits,
        r.grade,
        r.attendance_pct,
        r.source_status,
        r.verification_status,
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.student_ref.toLowerCase()}_academic_records.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
            ACADEMIC CREDIT &amp; ENROLMENT LEDGER
          </span>
          <h1 className="font-display text-2xl font-bold text-[#102A43] mt-0.5">
            My Academic Records
          </h1>
          <p className="text-sm text-slate-600">
            Semester-wise course registrations distinguishing institutional uploads from
            platform-verified records.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportTranscriptCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#102A43] text-white hover:bg-[#1E3A5F] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Records CSV</span>
        </button>
      </div>

      {/* Provenance Legend: Uploaded by Institution vs Verified by Platform */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-emerald-200 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#102A43]">
                Verified by Authorised Platform Rule Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] font-semibold">
                PLATFORM_VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Record has passed deterministic AICTE program, intake capacity, and APAAR hash
              consistency checks and is committed to the verified ledger.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#102A43]">
                Uploaded by Institution (Pending Final Verification)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/10 text-[#D97706] font-semibold">
                INSTITUTION_UPLOADED
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Submitted by {student.institution_name} for the current semester; awaiting end-of-term
              examination grade lock and regulator batch commit.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Semester:</span>
          <button
            type="button"
            onClick={() => setSemesterFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              semesterFilter === 'ALL'
                ? 'bg-[#102A43] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({course_records.length})
          </button>
          {semesters.map((sem) => (
            <button
              key={sem}
              type="button"
              onClick={() => setSemesterFilter(sem)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                semesterFilter === sem
                  ? 'bg-[#102A43] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="source-filter" className="text-xs font-semibold text-slate-500">
            Provenance:
          </label>
          <select
            id="source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-xs bg-[#F8FAFC] border border-slate-300 rounded-lg px-2.5 py-1.5 text-[#102A43]"
          >
            <option value="ALL">All Records</option>
            <option value="PLATFORM_VERIFIED">Verified by Platform</option>
            <option value="INSTITUTION_UPLOADED">Uploaded by Institution</option>
          </select>
        </div>
      </div>

      {/* Course Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Semester / AY</th>
                <th className="py-3.5 px-4">Course Code</th>
                <th className="py-3.5 px-4">Course Title</th>
                <th className="py-3.5 px-4 text-right">Credits</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Provenance</th>
                <th className="py-3.5 px-4">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#102A43]">{rec.semester}</div>
                    <div className="text-[11px] font-mono text-slate-400">{rec.academic_year}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#2563EB]">
                    {rec.course_code}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#1E293B]">{rec.course_title}</td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold">
                    {rec.credits.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#102A43]">
                    {rec.grade}
                  </td>
                  <td className="py-3.5 px-4">
                    {rec.source_status === 'PLATFORM_VERIFIED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Platform Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Building2 className="w-3.5 h-3.5" />
                        Uploaded by Institution
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusPill
                      label={rec.verification_status}
                      tone={rec.verification_status === 'Verified' ? 'success' : 'warning'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// D. APAAR ID STATUS & CRYPTOGRAPHIC BINDING (/student/apaar)
// ============================================================================
export const StudentApaarPage: React.FC = () => {
  const { data, isLoading } = useStudentPortalData();

  if (isLoading || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Loading your APAAR ID verification details...
      </div>
    );
  }

  const { student } = data;
  const apaarStatus = getApaarStatusLabel(student.status);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
          AUTOMATED PERMANENT ACADEMIC ACCOUNT REGISTRY
        </span>
        <h1 className="font-display text-2xl font-bold text-[#102A43] mt-0.5">
          My APAAR ID &amp; Privacy Binding
        </h1>
        <p className="text-sm text-slate-600">
          How EduVerify validates and masks your 12-digit APAAR identifier without storing raw
          unmasked numbers or Aadhaar data.
        </p>
      </div>

      {/* Digital APAAR Card */}
      <div className="bg-gradient-to-br from-[#102A43] to-[#1E3A8A] text-white rounded-xl p-6 shadow-md border border-slate-800 max-w-2xl">
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="flex items-center gap-2.5">
            <Fingerprint className="w-6 h-6 text-[#22D3EE]" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE] block">
                EDUVERIFY · SYNTHETIC APAAR BINDING
              </span>
              <h2 className="font-display text-base font-bold">
                Academic Identity Verification Token
              </h2>
            </div>
          </div>
          <StatusPill
            label={apaarStatus}
            tone={apaarStatus === 'Verified' ? 'success' : 'warning'}
          />
        </div>

        <div className="py-5 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 block">
              Masked APAAR Identifier (Rulebook §1.4 Compliant)
            </span>
            <p className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-[#22D3EE] mt-1">
              {student.apaar_masked}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 block">
                Candidate Name
              </span>
              <span className="text-sm font-semibold">{student.full_name}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 block">
                Bound Institution &amp; Programme
              </span>
              <span className="text-sm font-semibold">
                {student.institution_id} · {student.program_code}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/15">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 block">
              Salted Irreversible SHA-256 Digest (Used for Cross-Institution Deduplication)
            </span>
            <p className="font-mono text-xs text-slate-200 break-all mt-1">{student.apaar_hash}</p>
          </div>
        </div>
      </div>

      {/* Rule Evaluation Results on Student's Record */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-display text-base font-bold text-[#102A43]">
          Deterministic Rule Engine Evaluation (Ruleset 2026.10.v1)
        </h3>
        <div className="space-y-3">
          {student.validation_results.map((res) => (
            <div
              key={res.rule_code}
              className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#2563EB]">
                    {res.stu_code || res.rule_code}
                  </span>
                  <span className="text-sm font-semibold text-[#102A43]">{res.rule_name}</span>
                </div>
                <p className="text-xs text-slate-600">{res.reason}</p>
                {res.remediation && res.outcome !== 'PASS' && (
                  <p className="text-xs text-amber-700 font-medium">
                    Recommended Action: {res.remediation}
                  </p>
                )}
              </div>
              <StatusPill
                label={res.outcome}
                tone={
                  res.outcome === 'PASS'
                    ? 'success'
                    : res.outcome === 'WARN'
                      ? 'warning'
                      : 'error'
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// E. MY VERIFICATION (/student/verification)
// ============================================================================
export const StudentVerificationPage: React.FC = () => {
  const { data, isLoading } = useStudentPortalData();
  const [copiedToken, setCopiedToken] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Loading your verification credentials and requests...
      </div>
    );
  }

  const { student, attestations, verification_requests } = data;
  const primaryAttestation = attestations[0];
  const verifyPath = primaryAttestation
    ? `/verify/${primaryAttestation.token || primaryAttestation.id.toLowerCase()}`
    : '/verify/att-2026-901';
  const fullVerifyUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${verifyPath}` : verifyPath;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullVerifyUrl);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
          THIRD-PARTY &amp; SCHOLARSHIP VERIFICATION
        </span>
        <h1 className="font-display text-2xl font-bold text-[#102A43] mt-0.5">
          My Verification &amp; QR Certificate
        </h1>
        <p className="text-sm text-slate-600">
          Inspect your enrolment verification status, review third-party verification requests, and
          share your privacy-preserving verification QR token.
        </p>
      </div>

      {/* Platform-Issued Verification Certificate & QR Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#102A43] text-[#22D3EE] font-mono text-[10px] font-semibold uppercase tracking-wider">
                Ed25519 Signed Attestation
              </span>
              <span className="text-xs font-mono text-slate-500">
                Platform-issued simulation · Not an official government document
              </span>
            </div>

            <h2 className="font-display text-xl font-bold text-[#102A43]">
              {primaryAttestation
                ? primaryAttestation.purpose
                : 'Bonafide Enrolment Verification Certificate'}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block">Certificate ID</span>
                <span className="font-mono font-bold text-[#102A43]">
                  {primaryAttestation?.id || 'ATT-2026-901'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Student ID</span>
                <span className="font-mono font-bold text-[#102A43]">{student.student_ref}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Masked APAAR</span>
                <span className="font-mono font-bold text-[#2563EB]">{student.apaar_masked}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Programme</span>
                <span className="font-semibold text-[#102A43]">{student.program_code}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Consent Reference</span>
                <span className="font-mono text-[#102A43]">
                  {primaryAttestation?.consent_id || 'CNS-2026-4401'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <StatusPill label={primaryAttestation?.status || 'ACTIVE'} tone="success" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={verifyPath}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
              >
                <span>Open Public Verification Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#F8FAFC] border border-slate-300 text-[#102A43] hover:bg-slate-100 transition-colors"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Verification URL Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Opaque Verification URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Opaque URL QR Code Representation (Contains ONLY /verify/:token) */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center space-y-3">
            <div
              aria-label={`Verification QR Code for ${verifyPath}`}
              className="w-36 h-36 bg-white p-3 rounded-lg border border-slate-300 shadow-2xs flex flex-col items-center justify-center"
            >
              <QrCode className="w-24 h-24 text-[#102A43]" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold block">
                OPAQUE VERIFICATION URI ONLY
              </span>
              <code className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 block">
                {verifyPath}
              </code>
              <p className="text-[11px] text-slate-500">
                QR encodes only the verification token URL — never your raw APAAR or full record.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Previous & Pending Verification Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-[#F8FAFC]">
          <h3 className="font-display text-sm font-bold text-[#102A43]">
            Completed &amp; Pending Verification Requests ({verification_requests.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-slate-50/50">
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Requesting Organisation</th>
                <th className="py-3.5 px-4">What Information Was Verified</th>
                <th className="py-3.5 px-4">Request Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {verification_requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#2563EB]">{req.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#102A43]">
                      {req.requesting_organisation}
                    </div>
                    <div className="text-[11px] text-slate-500">{req.purpose}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {req.information_requested.map((info) => (
                        <span
                          key={info}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]"
                        >
                          {info}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {req.request_date.slice(0, 10)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusPill
                      label={req.status}
                      tone={
                        req.status === 'Verified'
                          ? 'success'
                          : req.status === 'Pending'
                            ? 'info'
                            : req.status === 'Requires Review'
                              ? 'warning'
                              : 'error'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// F. REPORT A DISCREPANCY (/student/discrepancies)
// ============================================================================
export const StudentDiscrepanciesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useStudentPortalData();

  const [discrepancyType, setDiscrepancyType] = useState<
    StudentDiscrepancyTicket['discrepancy_type']
  >('Semester Record Discrepancy');
  const [relevantRecord, setRelevantRecord] = useState('CS-301 · Operating Systems (Semester III)');
  const [supportingDocRef, setSupportingDocRef] = useState('NITKKR-REG-2026-DOC-4102');
  const [description, setDescription] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: () =>
      weaveApiClient.submitDiscrepancy({
        student_ref: user.student_ref || 'STU-2026-101',
        discrepancy_type: discrepancyType,
        relevant_record: relevantRecord,
        supporting_doc_ref: supportingDocRef,
        description,
      }),
    onSuccess: (res) => {
      setDescription('');
      setSubmitSuccess(
        `Discrepancy report ${res.ticket.id} submitted with status '${res.ticket.status}' and recorded in the audit trail.`
      );
      queryClient.invalidateQueries({
        queryKey: weaveQueryKeys.studentMe(user.student_ref || 'STU-2026-101'),
      });
      queryClient.invalidateQueries({
        queryKey: weaveQueryKeys.adminVerificationRequests(),
      });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Loading discrepancy reporting portal...
      </div>
    );
  }

  const { discrepancies } = data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);
    submitMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
          STUDENT RECORD CORRECTION WORKFLOW
        </span>
        <h1 className="font-display text-2xl font-bold text-[#102A43] mt-0.5">
          Report a Discrepancy
        </h1>
        <p className="text-sm text-slate-600">
          Submit a formal correction request for an institutional upload error, grade mismatch, or
          cross-institution seat withdrawal clarification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Discrepancy Submission Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="font-display text-base font-bold text-[#102A43]">
            Submit New Discrepancy Request
          </h2>

          {submitSuccess && (
            <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-emerald-800">
              {submitSuccess}
            </div>
          )}

          {submitMutation.isError && (
            <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
              {(submitMutation.error as Error)?.message || 'Please enter at least 10 characters.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="disc-type"
                className="block text-xs font-semibold text-[#102A43] mb-1.5"
              >
                Type of Discrepancy
              </label>
              <select
                id="disc-type"
                value={discrepancyType}
                onChange={(e) =>
                  setDiscrepancyType(
                    e.target.value as StudentDiscrepancyTicket['discrepancy_type']
                  )
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-300 rounded-lg text-[#102A43]"
              >
                <option value="Semester Record Discrepancy">Semester Record Discrepancy</option>
                <option value="Name / Date of Birth Correction">
                  Name / Date of Birth Correction
                </option>
                <option value="APAAR Mapping Mismatch">APAAR Mapping Mismatch</option>
                <option value="Programme / Branch Correction">Programme / Branch Correction</option>
                <option value="Duplicate Enrolment Flag Clarification">
                  Duplicate Enrolment Flag Clarification
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="disc-record"
                className="block text-xs font-semibold text-[#102A43] mb-1.5"
              >
                Relevant Academic Record
              </label>
              <input
                id="disc-record"
                type="text"
                required
                value={relevantRecord}
                onChange={(e) => setRelevantRecord(e.target.value)}
                placeholder="e.g. CSL-204 · Semester II Grade Sheet"
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-300 rounded-lg text-[#102A43]"
              />
            </div>

            <div>
              <label
                htmlFor="disc-doc"
                className="block text-xs font-semibold text-[#102A43] mb-1.5"
              >
                Supporting Document Reference
              </label>
              <input
                id="disc-doc"
                type="text"
                required
                value={supportingDocRef}
                onChange={(e) => setSupportingDocRef(e.target.value)}
                placeholder="e.g. JoSAA Withdrawal Slip / Exam Cell Ref #"
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAFC] border border-slate-300 rounded-lg text-[#102A43]"
              />
            </div>

            <div>
              <label
                htmlFor="disc-desc"
                className="block text-xs font-semibold text-[#102A43] mb-1.5"
              >
                Description of Discrepancy
              </label>
              <textarea
                id="disc-desc"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the discrepancy between your official institutional document and the uploaded record (min 10 characters)..."
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-300 rounded-lg text-[#102A43]"
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitMutation.isPending ? 'Submitting Request...' : 'Submit Discrepancy Report'}
              </span>
            </button>
          </form>
        </div>

        {/* Submitted Discrepancy Tickets List */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#102A43]">
              Submitted Discrepancy Requests ({discrepancies.length})
            </h2>
            <span className="text-xs text-slate-500">
              Statuses: Submitted · Under Review · Additional Info Required · Resolved · Rejected
            </span>
          </div>

          <div className="space-y-3">
            {discrepancies.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2563EB]">{ticket.id}</span>
                    <span className="text-sm font-semibold text-[#102A43]">
                      {ticket.discrepancy_type}
                    </span>
                  </div>
                  <StatusPill
                    label={ticket.status}
                    tone={
                      ticket.status === 'Resolved'
                        ? 'success'
                        : ticket.status === 'Rejected'
                          ? 'error'
                          : ticket.status === 'Submitted'
                            ? 'info'
                            : 'warning'
                    }
                  />
                </div>
                <p className="text-xs text-slate-700">{ticket.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 pt-1">
                  <span>Record: {ticket.relevant_record}</span>
                  <span>Doc Ref: {ticket.supporting_doc_ref}</span>
                  <span>Submitted: {ticket.created_at.slice(0, 10)}</span>
                </div>
                {ticket.reviewer_notes && (
                  <div className="mt-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                    <strong className="text-[#102A43]">Nodal Officer / Reviewer Note:</strong>{' '}
                    {ticket.reviewer_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// G. CONSENT AND PRIVACY (/student/consent)
// ============================================================================
export const StudentConsentPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useStudentPortalData();
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const consentMutation = useMutation({
    mutationFn: (prefs: {
      scholarship_portals_enabled: boolean;
      credit_transfer_abc_enabled: boolean;
      employer_verification_enabled: boolean;
    }) =>
      weaveApiClient.updateStudentConsent({
        student_ref: user.student_ref || 'STU-2026-101',
        ...prefs,
      }),
    onSuccess: () => {
      setSavedBanner('Your consent preferences have been updated and cryptographically logged.');
      queryClient.invalidateQueries({
        queryKey: weaveQueryKeys.studentMe(user.student_ref || 'STU-2026-101'),
      });
      setTimeout(() => setSavedBanner(null), 3500);
    },
  });

  if (isLoading || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Loading your consent and privacy preferences...
      </div>
    );
  }

  const { consent } = data;

  const togglePreference = (
    field:
      | 'scholarship_portals_enabled'
      | 'credit_transfer_abc_enabled'
      | 'employer_verification_enabled'
  ) => {
    consentMutation.mutate({
      scholarship_portals_enabled:
        field === 'scholarship_portals_enabled'
          ? !consent.scholarship_portals_enabled
          : consent.scholarship_portals_enabled,
      credit_transfer_abc_enabled:
        field === 'credit_transfer_abc_enabled'
          ? !consent.credit_transfer_abc_enabled
          : consent.credit_transfer_abc_enabled,
      employer_verification_enabled:
        field === 'employer_verification_enabled'
          ? !consent.employer_verification_enabled
          : consent.employer_verification_enabled,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
          GRANULAR DATA DISCLOSURE GOVERNANCE
        </span>
        <h1 className="font-display text-2xl font-bold text-[#102A43] mt-0.5">
          Consent &amp; Privacy Controls
        </h1>
        <p className="text-sm text-slate-600">
          Manage your information-sharing preferences, inspect consent history, and audit every
          organisation that has accessed your verification status.
        </p>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-medium text-emerald-800">
          {savedBanner}
        </div>
      )}

      {/* Information-Sharing Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="font-display text-base font-bold text-[#102A43]">
          Information-Sharing Preferences
        </h2>

        <div className="divide-y divide-slate-200">
          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#102A43]">
                National &amp; State Scholarship Portals (NSP)
              </p>
              <p className="text-xs text-slate-600">
                Allow automated bonafide enrolment &amp; APAAR status verification for scholarship
                disbursement.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.scholarship_portals_enabled}
              onClick={() => togglePreference('scholarship_portals_enabled')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                consent.scholarship_portals_enabled
                  ? 'bg-[#10B981] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {consent.scholarship_portals_enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#102A43]">
                Academic Bank of Credits (ABC) &amp; Inter-University Transfer
              </p>
              <p className="text-xs text-slate-600">
                Permit verified semester credit counts to synchronize with your masked APAAR digest.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.credit_transfer_abc_enabled}
              onClick={() => togglePreference('credit_transfer_abc_enabled')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                consent.credit_transfer_abc_enabled
                  ? 'bg-[#10B981] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {consent.credit_transfer_abc_enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#102A43]">
                Third-Party Employer &amp; Internship Background Verification
              </p>
              <p className="text-xs text-slate-600">
                Allow external employers to verify your degree &amp; enrolment status using your
                attestation token.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.employer_verification_enabled}
              onClick={() => togglePreference('employer_verification_enabled')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                consent.employer_verification_enabled
                  ? 'bg-[#10B981] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {consent.employer_verification_enabled ? 'Enabled' : 'Restricted'}
            </button>
          </div>

          <div className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#102A43]">
                AICTE Statutory Intake &amp; Duplicate Enrolment Compliance
              </p>
              <p className="text-xs text-slate-600">
                Mandatory statutory processing for approved intake verification and duplicate
                enrolment screening.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-600">
              <Lock className="w-3.5 h-3.5" />
              Statutory Mandatory
            </span>
          </div>
        </div>
      </div>

      {/* Consent History & Data-Access History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-display text-base font-bold text-[#102A43]">Consent History</h3>
          <div className="space-y-3">
            {consent.consent_history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#2563EB]">{item.action}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {item.timestamp.slice(0, 16).replace('T', ' ')}
                  </span>
                </div>
                <p className="text-xs text-[#1E293B]">{item.scope}</p>
                <p className="text-[11px] text-slate-500">Actor: {item.actor}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-display text-base font-bold text-[#102A43]">Data-Access History</h3>
          <div className="space-y-3">
            {consent.access_logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#102A43]">{log.organisation}</span>
                  <StatusPill
                    label={log.status}
                    tone={log.status === 'Authorized' ? 'success' : 'error'}
                  />
                </div>
                <p className="text-xs text-slate-600">{log.purpose}</p>
                <p className="text-[11px] font-mono text-slate-500">
                  Shared: {log.fields_shared} · {log.accessed_at.slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// H. ACTIVITY HISTORY (/student/history) & HELP (/student/help)
// ============================================================================
export const StudentHistoryPage: React.FC = () => {
  const { data, isLoading } = useStudentPortalData();

  if (isLoading || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200 text-sm text-slate-500">
        Loading your activity timeline...
      </div>
    );
  }

  const { activity_history } = data;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
          TAMPER-EVIDENT STUDENT RECORD LOG
        </span>
        <h1 className="font-display text-2xl font-bold text-[#102A43] mt-0.5">
          My Activity History
        </h1>
        <p className="text-sm text-slate-600">
          Chronological log of batch ingestion, rule validation, attestation issuance, and consent
          updates linked to your student record.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        {activity_history.map((ev) => (
          <div
            key={ev.id}
            className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="font-mono text-xs font-bold text-[#102A43]">{ev.action}</span>
                <span className="font-mono text-[11px] text-slate-400">({ev.id})</span>
              </div>
              <p className="text-xs text-slate-700">{ev.summary}</p>
              <p className="text-[11px] font-mono text-slate-400">
                SHA-256 Event Digest: {ev.event_hash.slice(0, 36)}...
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500 shrink-0">
              {ev.created_at.slice(0, 16).replace('T', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StudentHelpPage: React.FC = () => {
  const faqs = [
    {
      q: 'Why is my APAAR ID displayed as ****-****-4756?',
      a: 'EduVerify enforces data minimisation (Rulebook Section 1.4). Only the last 4 digits of your synthetic 12-digit APAAR identifier are displayed in user interfaces, while cross-institution checks operate on an irreversible salted SHA-256 hash.',
    },
    {
      q: 'What is the difference between Uploaded by Institution and Platform Verified?',
      a: 'Uploaded by Institution means your college nodal officer has submitted the record in a CSV batch. Platform Verified means the record has passed all 6 deterministic AICTE validation rules (STU-001 through STU-006) and has been committed.',
    },
    {
      q: 'How do I resolve a Cross-Institution Duplicate flag on my record?',
      a: 'If you withdrew from one college during JoSAA/state counselling and joined another, go to Report a Discrepancy and submit your official counselling seat withdrawal slip reference. A regulator officer will verify and clear the flag.',
    },
    {
      q: 'Does my Verification QR Code expose my personal data?',
      a: 'No. Your QR code contains only an opaque verification URL (/verify/att-2026-901). Scanning it verifies the Ed25519 cryptographic signature and shows only masked, consented enrolment status.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#2563EB] font-semibold">
          STUDENT SUPPORT &amp; PRIVACY GUIDE
        </span>
        <h1 className="font-display text-2xl font-bold text-[#102A43] mt-0.5">
          Help &amp; Support
        </h1>
        <p className="text-sm text-slate-600">
          Frequently asked questions regarding APAAR verification, consent controls, and discrepancy
          resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((item) => (
          <div
            key={item.q}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2"
          >
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <h2 className="font-display text-sm font-bold text-[#102A43]">{item.q}</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display text-sm font-bold text-[#102A43]">
            Need Institutional Nodal Officer Assistance?
          </h3>
          <p className="text-xs text-slate-600">
            For corrections to your admission register or APAAR seeding, submit a ticket with your
            supporting document reference.
          </p>
        </div>
        <Link
          to="/student/discrepancies"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#102A43] text-white hover:bg-[#1E3A5F] shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Open Discrepancy Form</span>
        </Link>
      </div>
    </div>
  );
};
