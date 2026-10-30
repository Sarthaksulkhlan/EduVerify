import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AlertTriangle, CheckCircle2, Building2, BookOpen } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { weaveApiClient, weaveQueryKeys } from '../../lib/api-client';
import { APPROVED_PROGRAMS } from '../../lib/weaveEngine';

/**
 * 1. /app/intake — Approved Intake Monitoring Page (Section 12)
 */
export const IntakeMonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const [instFilter, setInstFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('2026-27');

  const { data, isLoading } = useQuery({
    queryKey: weaveQueryKeys.institutions(user.role, user.institution_id),
    queryFn: () => weaveApiClient.getInstitutionsOverview(user.role, user.institution_id),
  });

  if (isLoading) {
    return (
      <div role="status" className="bg-white border border-[#DEDDD5] rounded-md p-6 animate-pulse h-64" />
    );
  }

  const institutions = data?.institutions || [];
  const filteredInsts = institutions.filter((i) =>
    instFilter === 'ALL' ? true : i.id === instFilter
  );

  const rows = filteredInsts.flatMap((inst) =>
    inst.programs.map((p) => {
      const remaining = p.approved_intake - p.enrolled_verified;
      const pct = Math.round((p.enrolled_verified / p.approved_intake) * 100);
      return {
        institution_id: inst.id,
        institution_name: inst.name,
        ...p,
        remaining,
        pct,
        state:
          pct > 100
            ? ('EXCEEDING' as const)
            : pct >= 92
              ? ('APPROACHING' as const)
              : ('NOMINAL' as const),
      };
    })
  );

  const totalApproved = rows.reduce((s, r) => s + r.approved_intake, 0);
  const totalEnrolled = rows.reduce((s, r) => s + r.enrolled_verified, 0);
  const totalRemaining = totalApproved - totalEnrolled;
  const overallPct =
    totalApproved > 0 ? ((totalEnrolled / totalApproved) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Filters & Provenance */}
      <div className="bg-white border border-[#DEDDD5] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter by institution"
            value={instFilter}
            onChange={(e) => setInstFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
          >
            <option value="ALL">All Authorized Institutions ({institutions.length})</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id} — {i.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by academic year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
          >
            <option value="2026-27">Academic Year 2026–27</option>
            <option value="2025-26">Academic Year 2025–26</option>
          </select>
        </div>

        <span className="text-xs font-mono text-[#686B65]">
          Local Demonstration Calculations · Synthetic Fixtures
        </span>
      </div>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono tabular-nums">
        <div className="p-5 bg-white border border-[#DEDDD5] rounded-md">
          <div className="text-xs font-sans text-[#686B65]">Approved Intake</div>
          <div className="text-2xl font-semibold text-[#20241F] mt-1">{totalApproved}</div>
        </div>
        <div className="p-5 bg-white border border-[#DEDDD5] rounded-md">
          <div className="text-xs font-sans text-[#686B65]">Current Enrolment</div>
          <div className="text-2xl font-semibold text-[#20241F] mt-1">{totalEnrolled}</div>
        </div>
        <div className="p-5 bg-white border border-[#DEDDD5] rounded-md">
          <div className="text-xs font-sans text-[#686B65]">Remaining Capacity</div>
          <div className="text-2xl font-semibold text-[#1E563B] mt-1">{totalRemaining}</div>
        </div>
        <div className="p-5 bg-white border border-[#DEDDD5] rounded-md">
          <div className="text-xs font-sans text-[#686B65]">Utilization Percentage</div>
          <div className="text-2xl font-semibold text-[#9B7B32] mt-1">{overallPct}%</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-[#DEDDD5] rounded-md p-6 space-y-3">
        <h2 className="font-display text-base font-semibold text-[#20241F]">
          Sanctioned Cap vs. Verified Enrolment by Program
        </h2>
        <div className="h-60 w-full" role="img" aria-label="Program capacity utilization chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows.map((r) => ({
                name: `${r.institution_id.split('-')[1]}·${r.program_code}`,
                Approved: r.approved_intake,
                Enrolled: r.enrolled_verified,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E7DF" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#686B65', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis tick={{ fill: '#686B65', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
              <Tooltip />
              <Bar dataKey="Approved" fill="#E9E7DF" stroke="#686B65" />
              <Bar dataKey="Enrolled" fill="#C5A869" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table with Drill-Down */}
      <div className="bg-white border border-[#DEDDD5] rounded-md overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F0EFE9] border-b border-[#DEDDD5] text-[#686B65] font-medium">
              <th className="py-2.5 px-4">Institution</th>
              <th className="py-2.5 px-4">Program</th>
              <th className="py-2.5 px-4 text-right">Approved Intake</th>
              <th className="py-2.5 px-4 text-right">Enrolled</th>
              <th className="py-2.5 px-4 text-right">Remaining</th>
              <th className="py-2.5 px-4 text-right">Utilization</th>
              <th className="py-2.5 px-4 text-right">Status &amp; Drill-down</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEDDD5] font-mono tabular-nums">
            {rows.map((r) => (
              <tr key={`${r.institution_id}-${r.program_code}`} className="hover:bg-[#F7F6F2]">
                <td className="py-3 px-4 font-sans text-[#20241F]">{r.institution_name}</td>
                <td className="py-3 px-4 font-semibold text-[#20241F]">{r.program_code}</td>
                <td className="py-3 px-4 text-right">{r.approved_intake}</td>
                <td className="py-3 px-4 text-right font-semibold">{r.enrolled_verified}</td>
                <td className="py-3 px-4 text-right">{r.remaining}</td>
                <td className="py-3 px-4 text-right">{r.pct}%</td>
                <td className="py-3 px-4 text-right font-sans">
                  <div className="inline-flex items-center gap-3">
                    {r.state === 'EXCEEDING' && (
                      <span className="inline-flex items-center gap-1 text-[#99322B] font-mono font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Exceeding Cap</span>
                      </span>
                    )}
                    {r.state === 'APPROACHING' && (
                      <span className="inline-flex items-center gap-1 text-[#8E6218] font-mono font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Approaching Limit</span>
                      </span>
                    )}
                    {r.state === 'NOMINAL' && (
                      <span className="inline-flex items-center gap-1 text-[#1E563B] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Within Limit</span>
                      </span>
                    )}
                    <Link
                      to="/app/students"
                      className="text-[#9B7B32] hover:text-[#181B18] underline font-medium"
                    >
                      Records
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * 2. /app/institutions — Institution Management Page
 */
export const InstitutionsPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: weaveQueryKeys.institutions(user.role, user.institution_id),
    queryFn: () => weaveApiClient.getInstitutionsOverview(user.role, user.institution_id),
  });

  if (isLoading) {
    return (
      <div role="status" className="bg-white border border-[#DEDDD5] rounded-md p-6 animate-pulse h-48" />
    );
  }

  const list = data?.institutions || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {list.map((inst) => (
        <div
          key={inst.id}
          className="bg-white border border-[#DEDDD5] rounded-md p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#DEDDD5]">
            <div>
              <div className="font-mono text-xs text-[#9B7B32] font-semibold">
                {inst.id} · {inst.aicte_code}
              </div>
              <h2 className="mt-1 font-display text-base font-semibold text-[#20241F]">
                {inst.name}
              </h2>
              <div className="text-xs text-[#686B65] mt-0.5">
                {inst.state} · {inst.tier}
              </div>
            </div>
            <Building2 className="w-4 h-4 text-[#686B65]" />
          </div>

          <div className="space-y-2 text-xs font-mono tabular-nums">
            <div className="text-[#686B65] font-sans font-medium">
              Sanctioned Programs ({inst.programs.length})
            </div>
            {inst.programs.map((p) => (
              <div
                key={p.program_code}
                className="flex items-center justify-between py-1.5 border-b border-[#F0EFE9]"
              >
                <span className="text-[#20241F]">{p.program_code}</span>
                <span className="text-[#686B65]">
                  {p.enrolled_verified} / {p.approved_intake} seats
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 3. /app/programs — Program & Sanctioned Intake Registry Page
 */
export const ProgramsPage: React.FC = () => {
  return (
    <div className="bg-white border border-[#DEDDD5] rounded-md overflow-hidden">
      <div className="px-6 py-4 border-b border-[#DEDDD5] flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-[#20241F]">
            AICTE Approved Discipline Codes (Rule STU-002 Reference)
          </h2>
          <p className="text-xs text-[#686B65]">
            Deterministic program registry used by the CSV validation engine.
          </p>
        </div>
        <BookOpen className="w-4 h-4 text-[#686B65]" />
      </div>

      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F0EFE9] border-b border-[#DEDDD5] text-[#686B65]">
            <th className="py-2.5 px-4">Program Code</th>
            <th className="py-2.5 px-4">Official Discipline Title</th>
            <th className="py-2.5 px-4 text-right">Standard Sanctioned Cap</th>
            <th className="py-2.5 px-4 text-right">Validation Rule</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DEDDD5] font-mono tabular-nums">
          {Object.entries(APPROVED_PROGRAMS).map(([code, meta]) => (
            <tr key={code}>
              <td className="py-3 px-4 font-semibold text-[#20241F]">{code}</td>
              <td className="py-3 px-4 font-sans text-[#20241F]">{meta.title}</td>
              <td className="py-3 px-4 text-right">{meta.defaultCap} seats</td>
              <td className="py-3 px-4 text-right text-[#1E563B]">STU-002 (RULE-PROG-CODE)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
