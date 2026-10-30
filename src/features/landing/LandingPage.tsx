import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Lock,
  Building2,
  Scale,
  MessageSquare,
  ShieldCheck,
  Play,
  Pause,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { WeaveLogo } from '../../components/ui/WeaveLogo';
import { TypewriterHeadline } from '../../components/ui/PortalEnhancements';
import { HeroBackgroundCanvas } from './components/HeroBackgroundCanvas';
import { LivePipelineStrata } from './components/LivePipelineStrata';

const STRUCTURAL_CONTEXT_PILLARS = [
  {
    index: '01.1',
    tag: 'Institutional Silos',
    title: 'Fragmented student records.',
    desc: 'Admissions rosters arrive across disparate spreadsheet schemas, making it difficult to validate program codes, eligibility windows, and identifier integrity before records are committed.',
    liveBadge: 'LIVE SCHEMA NORMALIZER',
    liveTone: 'emerald' as const,
    liveFrames: [
      {
        label: 'Ingesting nit_kkr_round3.csv',
        code: 'ROW #101 → ****-****-4756',
        status: 'HEADERS NORMALIZED',
      },
      {
        label: 'Blocking raw Aadhaar column',
        code: 'PRIVACY_GUARD → REJECTED',
        status: 'MASKING VAULT ACTIVE',
      },
      {
        label: 'Binding sanctioned BTECH-CSE',
        code: 'AICTE_CAP → 142 / 180 SEATS',
        status: 'SCHEMA COMMITTED',
      },
    ],
  },
  {
    index: '01.2',
    tag: 'Cross-Campus Collisions',
    title: 'Inconsistent and duplicate submissions.',
    desc: 'During multi-round counselling, a student record may appear simultaneously on two institutional rosters. Resolving overlaps requires structured human review rather than opaque automated rejection.',
    liveBadge: 'LIVE HASH COLLISION RADAR',
    liveTone: 'crimson' as const,
    liveFrames: [
      {
        label: 'Scanning salted SHA-256 digests',
        code: 'DIGEST 9f8a..c41e MATCH',
        status: 'COLLISION DETECTED',
      },
      {
        label: 'Comparing INST-KKR-101 vs INST-DEL-202',
        code: 'CNF-2026-019 · SIMILARITY 0.99',
        status: 'ROUTED TO OFFICER',
      },
      {
        label: 'Preserving provisional seat hold',
        code: 'STU-005 WARN · NO AUTO-DROP',
        status: 'AWAITING ADJUDICATION',
      },
    ],
  },
  {
    index: '01.3',
    tag: 'Verification Opacity',
    title: 'Limited visibility into enrolment and verification.',
    desc: 'Regulators need accurate approved-intake utilization across disciplines, while scholarship and credit bodies need verifiable, minimal-disclosure enrolment attestations without exposing raw identifiers.',
    liveBadge: 'LIVE ED25519 ATTESTATION STREAM',
    liveTone: 'gold' as const,
    liveFrames: [
      {
        label: 'Signing minimal-disclosure token',
        code: 'TOKEN /verify/att-2026-901',
        status: 'ED25519 SIGNED',
      },
      {
        label: 'National Scholarship Portal check',
        code: 'ZERO RAW PII EXPOSED',
        status: 'VERIFIED_ACTIVE',
      },
      {
        label: 'Appending Merkle audit event',
        code: 'CHAIN HASH 7b2d..90a1',
        status: 'LEDGER SYNCHRONIZED',
      },
    ],
  },
];

const WORKFLOW_STAGES = [
  {
    step: 'Stage 01',
    title: 'Submit',
    desc: 'Institutions import student records via structured CSV batches with required-column preflight checks.',
    liveCode: 'BAT-2026-003 · CSV PREFLIGHT',
    liveMetric: '120 Rows Parsed · 0 Aadhaar Leaks',
    liveDetail: 'Streaming institutional batch upload with instant header & delimiter verification.',
    accent: '#15803D',
  },
  {
    step: 'Stage 02',
    title: 'Validate',
    desc: 'Deterministic rules identify missing or inconsistent information, masking raw APAAR values immediately.',
    liveCode: 'RULESET 2026.10.v1 · STU-001..006',
    liveMetric: '112 PASS · 5 WARN · 3 FAIL',
    liveDetail: 'Evaluating 12-digit APAAR format, sanctioned program caps, and consent flags.',
    accent: '#B88938',
  },
  {
    step: 'Stage 03',
    title: 'Review',
    desc: 'Authorized officers investigate potential cross-institution conflicts with documented rationale.',
    liveCode: 'QUEUE CNF-2026-019 · HUMAN AUDIT',
    liveMetric: '2 Competing Rosters Compared',
    liveDetail: 'Regulator officer inspects withdrawal proof before confirming transfer or duplicate.',
    accent: '#991B1B',
  },
  {
    step: 'Stage 04',
    title: 'Verify',
    desc: 'Authorized claims can be checked through a signed platform-issued Ed25519 attestation.',
    liveCode: 'ED25519 KEY k1 · /verify/att-2026-901',
    liveMetric: 'Signature VALID · 0ms PII Exposure',
    liveDetail: 'Public verifiers confirm active enrolment status using opaque cryptographic tokens.',
    accent: '#14532D',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeWorkspacePreview, setActiveWorkspacePreview] = useState<
    'institution' | 'regulator' | 'verification'
  >('institution');

  // Live animations state for Section 01 (Structural Context) & Section 02 (Deterministic Workflow)
  const [contextTick, setContextTick] = useState(0);
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const [contextPlaying, setContextPlaying] = useState(true);

  const [activeWorkflowStage, setActiveWorkflowStage] = useState(0);
  const [workflowPlaying, setWorkflowPlaying] = useState(true);

  useEffect(() => {
    if (!contextPlaying) return;
    const timer = window.setInterval(() => {
      setContextTick((t) => t + 1);
      setActivePillarIndex((p) => (p + 1) % STRUCTURAL_CONTEXT_PILLARS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [contextPlaying]);

  useEffect(() => {
    if (!workflowPlaying) return;
    const timer = window.setInterval(() => {
      setActiveWorkflowStage((s) => (s + 1) % WORKFLOW_STAGES.length);
    }, 2100);
    return () => window.clearInterval(timer);
  }, [workflowPlaying]);

  const currentStage = WORKFLOW_STAGES[activeWorkflowStage] || WORKFLOW_STAGES[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#302F29]">
      {/* Top Bar: Institutional Navigation (Clean 3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/92 backdrop-blur-md border-b border-[#E4DED2] text-[#302F29]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <Link to="/" aria-label="EduVerify Home" className="shrink-0 flex items-center">
            <WeaveLogo />
          </Link>

          <nav
            aria-label="Public Navigation"
            className="hidden md:flex items-center gap-7 text-xs font-medium text-[#5C564C]"
          >
            <a
              href="#product"
              className="hover:text-[#23201B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Structural Context
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#23201B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Deterministic Workflow
            </a>
            <a
              href="#workspace-roles"
              className="hover:text-[#23201B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Role Workspaces
            </a>
            <a
              href="#trust-security"
              className="hover:text-[#23201B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Security &amp; Trust
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#23201B] hover:bg-[#38332B] border border-[#B88938]/50 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              Sign In (Student / Admin)
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Emerald-Gold-Crimson Multi-Graded Hero Section with Continuous Live Background Canvas */}
        <section
          className="relative text-[#23201B] border-b border-[#DFD5C2] overflow-hidden py-14 lg:py-20"
          style={{
            background:
              'radial-gradient(circle at 14% 20%, rgba(20, 83, 45, 0.16) 0%, rgba(21, 128, 61, 0.06) 36%, transparent 65%), radial-gradient(circle at 52% 18%, rgba(212, 175, 55, 0.20) 0%, rgba(184, 137, 56, 0.08) 42%, transparent 70%), radial-gradient(circle at 86% 78%, rgba(153, 27, 27, 0.14) 0%, rgba(185, 28, 28, 0.05) 38%, transparent 68%), linear-gradient(135deg, #FAF6EC 0%, #F3ECE0 50%, #EDE3D2 100%)',
          }}
        >
          <HeroBackgroundCanvas tone="hero" />

          {/* Ambient Multi-Color Graded Light Halos (Emerald, Sovereign Gold, Crimson-Garnet) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-20 w-96 h-96 rounded-full blur-3xl opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(21,128,61,0.24) 0%, rgba(21,128,61,0) 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-12 left-1/3 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-55"
            style={{
              background: 'radial-gradient(circle, rgba(212,175,55,0.26) 0%, rgba(212,175,55,0) 72%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-12 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(153,27,27,0.20) 0%, rgba(153,27,27,0) 72%)',
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Hero Editorial Headline & CTAs */}
              <div className="lg:col-span-5 space-y-6">
                {/* Upgraded Hero Kicker: National Academic Ledger · Institutional Trust with Gentle Continuous Levitation */}
                <div
                  data-spotlight-accent="true"
                  className="animate-badge-float inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-[#14532D]/12 via-[#FAF3E3] to-[#991B1B]/10 border border-[#B88938]/55 text-[#23201B] text-[11px] font-mono uppercase tracking-[0.14em] shadow-2xs transition-transform duration-300 select-none cursor-default"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                  <span className="font-bold text-[#14532D]">NATIONAL ACADEMIC LEDGER</span>
                  <span aria-hidden="true" className="text-[#B88938] font-bold">·</span>
                  <span className="font-semibold text-[#7A5B20]">INSTITUTIONAL TRUST</span>
                </div>

                {/* Typewriter Hero Headline */}
                <div className="min-h-[132px] sm:min-h-[148px] flex items-center">
                  <h1
                    className="font-mono font-bold text-[#23201B] tracking-tight leading-[1.14]"
                    style={{ fontSize: 'clamp(1.85rem, 3.1vw, 2.75rem)' }}
                  >
                    <TypewriterHeadline
                      phrases={[
                        'Every academic record. A clearer path to trust.',
                        'Verified APAAR identities. Zero institutional silos.',
                        'Deterministic intake governance. Tamper-evident trust.',
                        'One national ledger. Instant cryptographic verification.',
                      ]}
                    />
                  </h1>
                </div>

                <p className="text-base sm:text-lg text-[#4A453C] leading-relaxed max-w-xl">
                  Bring student records, deterministic APAAR validation, sanctioned intake oversight,
                  and cryptographic verification into one coherent national platform.
                </p>

                {/* Primary CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    data-spotlight-accent="true"
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FFFDF9] bg-[#23201B] hover:bg-[#38332B] border border-[#B88938]/50 rounded-md transition-all whitespace-nowrap shrink-0 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span>Sign In (Student / Admin)</span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                  <Link
                    to="/admin/dashboard"
                    data-spotlight-accent="true"
                    className="px-4 py-2.5 text-sm font-semibold text-[#23201B] bg-[#FFFDF9]/95 border border-[#D5C7AA] hover:bg-[#FAF3E3] rounded-md transition-all whitespace-nowrap shrink-0 shadow-2xs hover:-translate-y-0.5"
                  >
                    AICTE Admin Console
                  </Link>
                  <Link
                    to="/student/dashboard"
                    data-spotlight-accent="true"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#14532D] bg-[#ECFDF5]/90 border border-[#15803D]/35 hover:bg-[#D1FAE5] rounded-md transition-all whitespace-nowrap shrink-0 shadow-2xs hover:-translate-y-0.5"
                  >
                    <span>Student Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/admin/assistant"
                    data-spotlight-accent="true"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#7A5B20] bg-[#FAF3E3]/90 border border-[#D4AF37]/40 hover:border-[#B88938] hover:bg-[#F5E9CE] rounded-md transition-all whitespace-nowrap shrink-0 hover:scale-[1.03] shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#B88938]" />
                    <span>Ask Assistant</span>
                  </Link>
                </div>

                {/* Unboxed Institutional Metadata */}
                <div className="pt-4 border-t border-[#DFD5C2] text-xs text-[#5C564C] flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                  <span className="text-[#14532D] font-semibold">SIH26263 National Ledger</span>
                  <span aria-hidden="true" className="text-[#B88938]">·</span>
                  <span>Masked APAAR Storage</span>
                  <span aria-hidden="true" className="text-[#B88938]">·</span>
                  <span className="text-[#991B1B] font-semibold">10m Session Compliance</span>
                </div>
              </div>

              {/* Right Column: Live Pipeline Semantic Visualization */}
              <div className="lg:col-span-7">
                <LivePipelineStrata />
              </div>
            </div>
          </div>
        </section>

        {/* Section 01 — Structural Context (Now with Live Interactive Actions & Multi-Color Grading) */}
        <section
          id="product"
          className="relative overflow-hidden border-b border-[#E4DED2] py-16 lg:py-20"
          style={{
            background:
              'radial-gradient(circle at 12% 30%, rgba(21, 128, 61, 0.09) 0%, transparent 45%), radial-gradient(circle at 88% 70%, rgba(153, 27, 27, 0.08) 0%, transparent 45%), linear-gradient(180deg, #F8F4EA 0%, #F4EFE2 100%)',
          }}
        >
          <HeroBackgroundCanvas tone="section" className="opacity-70" />

          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-xs font-mono uppercase tracking-widest text-[#14532D] font-semibold">
                  01 · Structural Context · Live Diagnostic Feed
                </div>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#23201B]">
                  Academic data should not be difficult to trust.
                </h2>
              </div>

              {/* Interactive Live Controls for Section 01 */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActivePillarIndex(
                      (p) =>
                        (p - 1 + STRUCTURAL_CONTEXT_PILLARS.length) %
                        STRUCTURAL_CONTEXT_PILLARS.length
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#FFFDF9] text-[#23201B] hover:bg-[#EFE8D8] border border-[#D8CEB8] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#8C6520]" />
                  <span>Prev Pillar</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePillarIndex((p) => (p + 1) % STRUCTURAL_CONTEXT_PILLARS.length)
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] border border-[#B88938]/40 transition-colors cursor-pointer"
                >
                  <span>Next Pillar</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
                <button
                  type="button"
                  onClick={() => setContextPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-[#FFFDF9] text-[#23201B] hover:bg-[#EFE8D8] border border-[#D8CEB8] transition-colors cursor-pointer"
                >
                  {contextPlaying ? (
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

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#DFD5C2]">
              {STRUCTURAL_CONTEXT_PILLARS.map((pillar, idx) => {
                const isFocused = activePillarIndex === idx;
                const frame = pillar.liveFrames[(contextTick + idx) % pillar.liveFrames.length];
                const toneAccent =
                  pillar.liveTone === 'emerald'
                    ? 'border-[#15803D]/50 bg-gradient-to-br from-[#FFFDF9] via-[#ECFDF5]/60 to-[#F5EFE2]'
                    : pillar.liveTone === 'crimson'
                      ? 'border-[#991B1B]/50 bg-gradient-to-br from-[#FFFDF9] via-[#FEF2F2]/65 to-[#F5EFE2]'
                      : 'border-[#B88938]/60 bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E3]/75 to-[#F5EFE2]';

                return (
                  <div
                    key={pillar.index}
                    onClick={() => setActivePillarIndex(idx)}
                    className={`rounded-xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      isFocused
                        ? `${toneAccent} shadow-md -translate-y-0.5`
                        : 'bg-[#FFFDF9]/90 border-[#E4DED2] hover:border-[#B88938]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#7A5B20] font-bold">
                          {pillar.index} · {pillar.tag}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            pillar.liveTone === 'emerald'
                              ? 'text-[#15803D]'
                              : pillar.liveTone === 'crimson'
                                ? 'text-[#991B1B]'
                                : 'text-[#8C6520]'
                          }`}
                        >
                          {pillar.liveBadge}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-[#23201B]">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-[#5C564C] leading-relaxed">{pillar.desc}</p>
                    </div>

                    {/* Live Action Telemetry Box inside each Structural Context Card */}
                    <div className="mt-5 p-3 rounded-lg bg-[#1E1B17] text-[#F5EFE2] font-mono text-[11px] space-y-1.5 border border-[#383229]">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#E8C87A] flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-[#34D399]" />
                          <span>{frame.label}</span>
                        </span>
                        <span className="text-[#86EFAC] font-bold">{frame.status}</span>
                      </div>
                      <div className="text-xs font-bold text-[#FFFDF9] tracking-tight">
                        {frame.code}
                      </div>
                      <div className="w-full h-1 bg-[#332E25] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#15803D] via-[#D4AF37] to-[#EF4444] transition-all duration-500"
                          style={{ width: isFocused ? '100%' : '45%' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 02 — Deterministic Workflow (Now with Live Interactive State Machine & Multi-Color Grading) */}
        <section
          id="how-it-works"
          className="relative overflow-hidden border-b border-[#E4DED2] py-16 lg:py-20"
          style={{
            background:
              'radial-gradient(circle at 80% 24%, rgba(212, 175, 55, 0.14) 0%, transparent 48%), radial-gradient(circle at 20% 78%, rgba(20, 83, 45, 0.10) 0%, transparent 48%), linear-gradient(135deg, #FBF9F4 0%, #F3ECE0 100%)',
          }}
        >
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-xs font-mono uppercase tracking-widest text-[#7A5B20] font-semibold">
                  02 · Deterministic Workflow · Live Pipeline Execution
                </div>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#23201B]">
                  From submission to cryptographic verification.
                </h2>
              </div>

              {/* Step Back / Next Stage / Play-Pause Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveWorkflowStage(
                      (s) => (s - 1 + WORKFLOW_STAGES.length) % WORKFLOW_STAGES.length
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#FFFDF9] text-[#23201B] hover:bg-[#EFE8D8] border border-[#D8CEB8] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#8C6520]" />
                  <span>Back Stage</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveWorkflowStage((s) => (s + 1) % WORKFLOW_STAGES.length)
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#23201B] text-[#FFFDF9] hover:bg-[#38332B] border border-[#B88938]/40 transition-colors cursor-pointer"
                >
                  <span>Next Stage</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
                <button
                  type="button"
                  onClick={() => setWorkflowPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold bg-[#FFFDF9] text-[#23201B] hover:bg-[#EFE8D8] border border-[#D8CEB8] transition-colors cursor-pointer"
                >
                  {workflowPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-[#B88938]" />
                      <span>Pause Flow</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#15803D]" />
                      <span>Resume Flow</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Stage Progression Ribbon */}
            <div className="mt-6 h-1.5 w-full bg-[#E5DEC9] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#15803D] via-[#B88938] to-[#991B1B] transition-all duration-500 ease-out"
                style={{ width: `${((activeWorkflowStage + 1) / WORKFLOW_STAGES.length) * 100}%` }}
              />
            </div>

            {/* Connected 4-Stage Interactive Live Timeline */}
            <ol className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-5 relative">
              {WORKFLOW_STAGES.map((item, idx) => {
                const isActive = activeWorkflowStage === idx;
                const isPassed = idx <= activeWorkflowStage;
                return (
                  <li
                    key={item.step}
                    onClick={() => setActiveWorkflowStage(idx)}
                    className={`rounded-xl p-5 flex flex-col justify-between relative transition-all duration-300 cursor-pointer border ${
                      isActive
                        ? 'bg-[#FFFDF9] border-[#23201B] shadow-md -translate-y-0.5'
                        : 'bg-[#FFFDF8]/85 border-[#E4DED2] hover:border-[#B88938]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-[#E4DED2]">
                        <span className={isActive ? 'font-bold text-[#23201B]' : 'text-[#77746B]'}>
                          {item.step}
                        </span>
                        <span
                          className="font-bold px-1.5 py-0.5 rounded text-[10px]"
                          style={{
                            backgroundColor: isPassed ? `${item.accent}18` : '#F3EDE0',
                            color: isPassed ? item.accent : '#77746B',
                          }}
                        >
                          {isActive ? 'EXECUTING LIVE' : `0${idx + 1}`}
                        </span>
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold text-[#23201B]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#5C564C] leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EBE4D5] font-mono text-[11px] space-y-1">
                      <div className="text-[10px] text-[#7A5B20] font-semibold">{item.liveCode}</div>
                      <div className="font-bold text-[#23201B] flex items-center justify-between">
                        <span>{item.liveMetric}</span>
                        {isActive && <Zap className="w-3.5 h-3.5 text-[#B88938]" />}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Live Stage Execution Telemetry Console */}
            <div className="mt-6 p-4 rounded-xl bg-[#1E1B17] text-[#F5EFE2] border border-[#383229] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  <span className="text-[#E8C87A] font-bold">
                    {currentStage.step} · {currentStage.title.toUpperCase()}
                  </span>
                  <span className="text-[#9A907E]">|</span>
                  <span className="text-[#86EFAC]">{currentStage.liveCode}</span>
                </div>
                <p className="text-xs text-[#D8CEB8]">{currentStage.liveDetail}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs font-bold text-[#FFFDF9] bg-white/10 px-3 py-1.5 rounded border border-[#D4AF37]/30">
                  {currentStage.liveMetric}
                </span>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-[#B88938] text-[#FFFDF9] hover:bg-[#9C7228] transition-colors whitespace-nowrap"
                >
                  <span>Run in Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section C — The Workspace */}
        <section id="workspace-roles" className="max-w-6xl mx-auto px-6 py-16 lg:py-20 border-b border-[#E4DED2]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#77746B]">
                03 · Role-Scoped Interfaces
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#302F29]">
                Clarity for every role.
              </h2>
            </div>

            {/* Interactive Workspace Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#ECE7DC] rounded-md self-start border border-[#E4DED2]">
              <button
                type="button"
                onClick={() => setActiveWorkspacePreview('institution')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                  activeWorkspacePreview === 'institution'
                    ? 'bg-[#FFFDF8] text-[#302F29] shadow-2xs'
                    : 'text-[#77746B] hover:text-[#302F29]'
                }`}
              >
                Institution workspace
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspacePreview('regulator')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                  activeWorkspacePreview === 'regulator'
                    ? 'bg-[#FFFDF8] text-[#302F29] shadow-2xs'
                    : 'text-[#77746B] hover:text-[#302F29]'
                }`}
              >
                Regulatory oversight
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkspacePreview('verification')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                  activeWorkspacePreview === 'verification'
                    ? 'bg-[#FFFDF8] text-[#302F29] shadow-2xs'
                    : 'text-[#77746B] hover:text-[#302F29]'
                }`}
              >
                Verification portal
              </button>
            </div>
          </div>

          {/* Live Component Previews Consistent with Implemented Pages */}
          <div className="mt-8 bg-[#FFFDF8] border border-[#E4DED2] rounded-md p-6">
            {activeWorkspacePreview === 'institution' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#85866B] font-semibold">
                    <Building2 className="w-4 h-4" />
                    <span>Institution workspace.</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302F29]">
                    Batch ingestion, explainable rule diagnostics, and sanctioned intake tracking.
                  </h3>
                  <p className="text-sm text-[#77746B] leading-relaxed">
                    Institution operators and administrators upload CSV batches, inspect row-level
                    validation outcomes (STU-001 through STU-006), and commit eligible records
                    within their isolated institutional tenant.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/app/imports/BAT-2026-003"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#85866B] hover:text-[#302F29] underline"
                    >
                      <span>Open Batch BAT-2026-003 Validation Inspector</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#FBF9F4] border border-[#E4DED2] rounded-md p-4">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E4DED2]">
                    <span className="font-mono font-semibold text-[#302F29]">
                      BAT-2026-003 · nit_kkr_ug_round3_counselling.csv
                    </span>
                    <span className="font-mono text-[#77746B]">Ruleset 2026.10.v1</span>
                  </div>
                  <table className="w-full text-left border-collapse mt-3 text-xs">
                    <thead>
                      <tr className="border-b border-[#E4DED2] text-[#77746B]">
                        <th className="py-2 pr-3">Row Ref</th>
                        <th className="py-2 px-3">Masked APAAR</th>
                        <th className="py-2 px-3">Rule Outcome</th>
                        <th className="py-2 pl-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4DED2] font-mono tabular-nums">
                      <tr>
                        <td className="py-2 pr-3 text-[#302F29]">STU-2026-101</td>
                        <td className="py-2 px-3 text-[#77746B]">****-****-4756</td>
                        <td className="py-2 px-3 text-[#414B38]">STU-001..004 PASS</td>
                        <td className="py-2 pl-3 text-right text-[#414B38]">Verified</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 text-[#302F29]">STU-2026-103</td>
                        <td className="py-2 px-3 text-[#77746B]">****-****-8472</td>
                        <td className="py-2 px-3 text-[#9B7127]">STU-005 WARN (Collision)</td>
                        <td className="py-2 pl-3 text-right text-[#9B7127]">Awaiting Review</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 text-[#302F29]">STU-2026-105</td>
                        <td className="py-2 px-3 text-[#77746B]">****-****-6512</td>
                        <td className="py-2 px-3 text-[#8E443D]">STU-001, STU-002 FAIL</td>
                        <td className="py-2 pl-3 text-right text-[#8E443D]">Invalid Record</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeWorkspacePreview === 'regulator' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#85866B] font-semibold">
                    <Scale className="w-4 h-4" />
                    <span>Regulatory oversight.</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302F29]">
                    Cross-institution duplicate adjudication and intake capacity governance.
                  </h3>
                  <p className="text-sm text-[#77746B] leading-relaxed">
                    Regulator officers review candidate APAAR hash matches across institutions,
                    compare sanctioned intake against committed enrolment, and record mandatory
                    audit reasons for every decision.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/app/duplicates"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#85866B] hover:text-[#302F29] underline"
                    >
                      <span>Open Regulator Duplicate Review Queue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#FBF9F4] border border-[#E4DED2] rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E4DED2]">
                    <span className="font-mono font-semibold text-[#302F29]">
                      Candidate CNF-2026-019 · CROSS_INSTITUTION_DUPLICATE
                    </span>
                    <span className="font-mono text-[#9B7127]">Similarity: 0.99</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#FFFDF8] border border-[#E4DED2] rounded-sm">
                      <div className="text-[#77746B]">Primary Submission</div>
                      <div className="font-semibold text-[#302F29] mt-0.5">
                        NIT Kurukshetra (INST-KKR-101)
                      </div>
                      <div className="font-mono text-[#77746B] mt-0.5">
                        BTECH-CSE · AY 2026–27
                      </div>
                    </div>
                    <div className="p-3 bg-[#FFFDF8] border border-[#E4DED2] rounded-sm">
                      <div className="text-[#77746B]">Counterpart Registration</div>
                      <div className="font-semibold text-[#302F29] mt-0.5">
                        IIET Delhi (INST-DEL-202)
                      </div>
                      <div className="font-mono text-[#77746B] mt-0.5">
                        BTECH-CSE · AY 2026–27
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#77746B]">
                    Note: A candidate hash match is not proof of fraud. Officers verify withdrawal
                    documentation before confirming or dismissing.
                  </p>
                </div>
              </div>
            )}

            {activeWorkspacePreview === 'verification' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-[#85866B] font-semibold">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Verification portal.</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#302F29]">
                    Public token verification with minimal disclosure and revocation checks.
                  </h3>
                  <p className="text-sm text-[#77746B] leading-relaxed">
                    External verifiers inspect opaque verification tokens (`/verify/:token`) to
                    confirm Ed25519 signature validity, expiry, and revocation status without
                    receiving raw student identifiers.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/verify/att-2026-901"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#85866B] hover:text-[#302F29] underline"
                    >
                      <span>Open Public Verification Portal (/verify/att-2026-901)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#FBF9F4] border border-[#E4DED2] rounded-md p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4DED2]">
                    <span className="font-mono font-semibold text-[#414B38]">
                      VERIFIED_ACTIVE · Token att-2026-901
                    </span>
                    <span className="font-mono text-[#77746B]">Key: ed25519-weave-synth-2026-k1</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono tabular-nums text-[#302F29]">
                    <div>Subject Ref: STU-2026-101</div>
                    <div>Masked APAAR: ****-****-4756</div>
                    <div>Program: BTECH-CSE (2026)</div>
                    <div>Consent: CNS-2026-4401</div>
                  </div>
                  <div className="pt-2 border-t border-[#E4DED2] text-[11px] text-[#77746B]">
                    Platform-issued enrolment attestation. Not an official government credential.
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section D — Trust and Privacy */}
        <section
          id="trust-security"
          className="max-w-6xl mx-auto px-6 py-16 lg:py-20 border-b border-[#E4DED2]"
        >
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-widest text-[#77746B]">
              04 · Governance &amp; Security Architecture
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#302F29]">
              Designed to handle records responsibly.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Role-based access.',
                desc: 'Five distinct operational roles (regulator_admin, regulator_officer, institution_admin, institution_operator, auditor) with backend-enforced permissions.',
              },
              {
                title: 'Institution-level data isolation.',
                desc: 'Institution users access only their own roster, batches, and intake slices; counterpart institution identities in conflict queues are redacted.',
              },
              {
                title: 'Minimal disclosure.',
                desc: 'Full 12-digit APAAR identifiers are never returned in API responses, UI tables, or QR URLs. Aadhaar columns are rejected at ingestion.',
              },
              {
                title: 'Auditable changes.',
                desc: 'Critical batch imports, conflict adjudications, and credential revocations append structured events to a verifiable hash-linked audit timeline.',
              },
              {
                title: 'Explainable validation.',
                desc: 'Every validation failure or warning cites a deterministic rule code (STU-001..STU-006), affected field, and remediation path—never an LLM guess.',
              },
              {
                title: 'Explicitly labelled platform-issued verification.',
                desc: 'Attestations are signed with platform Ed25519 keys and clearly disclosed as synthetic platform credentials, never claiming unauthorized government API integration.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 bg-[#FFFDF8] border border-[#E4DED2] rounded-md space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-[#302F29]">
                    {item.title}
                  </h3>
                  <Lock className="w-3.5 h-3.5 text-[#77746B] shrink-0" />
                </div>
                <p className="text-xs text-[#77746B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section E — Final Call to Action */}
        <section className="bg-[#FBF9F4] py-16 border-b border-[#E4DED2]">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-[#85866B] font-semibold">
                SIH26263 Demonstration Workspace
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#302F29]">
                Build confidence into every academic record.
              </h2>
              <p className="text-sm text-[#77746B] max-w-xl">
                Explore the institutional and regulatory workspaces using synthetic demonstration
                fixtures or test the public attestation verifier.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/app"
                className="px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] bg-[#302F29] hover:bg-[#414B38] rounded-md transition-colors whitespace-nowrap shadow-sm border border-[#C5AD82]/30"
              >
                Open workspace
              </Link>
              <Link
                to="/verify/att-2026-901"
                className="px-5 py-2.5 text-sm font-medium text-[#302F29] bg-[#FFFDF8] border border-[#E4DED2] hover:bg-[#FBF9F4] hover:border-[#C5AD82] rounded-md transition-colors whitespace-nowrap"
              >
                Verify sample credential
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Restrained Institutional Footer */}
      <footer className="bg-[#F5F1E8] py-10 px-6 text-xs text-[#77746B]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4DED2]">
            <div className="flex items-center gap-3">
              <WeaveLogo />
              <span aria-hidden="true">·</span>
              <span className="font-mono">Problem Statement SIH26263</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <a href="#product" className="hover:text-[#302F29] transition-colors">
                Product
              </a>
              <a href="#trust-security" className="hover:text-[#302F29] transition-colors">
                Trust &amp; Security
              </a>
              <Link to="/app/audit" className="hover:text-[#302F29] transition-colors">
                Documentation &amp; Rules
              </Link>
              <Link to="/login" className="hover:text-[#302F29] transition-colors">
                Sign in
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] leading-relaxed">
            <p>
              Synthetic Data &amp; Integration Disclaimer: All student records, APAAR identifiers,
              institutions, and Ed25519 attestations in this environment are strictly synthetic.
              This platform does not claim live integration with official government APAAR,
              DigiLocker, or AICTE production systems.
            </p>
            <span className="font-mono shrink-0 text-[#302F29]">Contract /api/v1</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
