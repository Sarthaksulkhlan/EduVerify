import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileCheck2,
  Lock,
  Building2,
  Scale,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { WeaveLogo } from '../../components/ui/WeaveLogo';
import { TypewriterHeadline } from '../../components/ui/PortalEnhancements';
import { HeroBackgroundCanvas } from './components/HeroBackgroundCanvas';
import { LivePipelineStrata } from './components/LivePipelineStrata';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeWorkspacePreview, setActiveWorkspacePreview] = useState<
    'institution' | 'regulator' | 'verification'
  >('institution');

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#302F29]">
      {/* Top Bar: Institutional Navigation */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-[#E4DED2] text-[#302F29]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <Link to="/" aria-label="EduVerify Home" className="shrink-0 flex items-center gap-3">
            <WeaveLogo />
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase text-[#8C6D2E] border-l border-[#DFD5C2] pl-3">
              SIH26263
            </span>
          </Link>

          <nav
            aria-label="Public Navigation"
            className="hidden md:flex items-center gap-7 text-xs font-medium text-[#77746B]"
          >
            <a
              href="#product"
              className="hover:text-[#302F29] transition-colors whitespace-nowrap shrink-0"
            >
              Platform Overview
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#302F29] transition-colors whitespace-nowrap shrink-0"
            >
              How it works
            </a>
            <a
              href="#trust-security"
              className="hover:text-[#302F29] transition-colors whitespace-nowrap shrink-0"
            >
              Security &amp; Trust
            </a>
            <Link
              to="/login"
              className="hover:text-[#302F29] transition-colors whitespace-nowrap shrink-0"
            >
              Sign in
            </Link>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-semibold text-[#23201B] bg-[#FFFDF9] border border-[#D8CEB8] hover:bg-[#F5EFE2] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Student / Admin Login
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 text-xs font-semibold text-[#FFFDF9] bg-[#23201B] hover:bg-[#38332B] border border-[#B88938]/40 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              AICTE Admin Console
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Golden & Champagne Sunlit Editorial Hero Section with Continuous Live Background Canvas */}
        <section
          className="relative text-[#23201B] border-b border-[#DFD5C2] overflow-hidden py-14 lg:py-20"
          style={{
            background:
              'radial-gradient(circle at 18% 22%, rgba(212, 175, 55, 0.16) 0%, rgba(197, 160, 89, 0.08) 38%, rgba(246, 241, 231, 0.98) 78%), linear-gradient(135deg, #FAF6EC 0%, #F4EDE0 52%, #EFE6D5 100%)',
          }}
        >
          <HeroBackgroundCanvas />

          {/* Ambient Golden & Champagne Light Halo Overlays */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(212,175,55,0.28) 0%, rgba(212,175,55,0) 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-45"
            style={{
              background: 'radial-gradient(circle, rgba(197,160,89,0.24) 0%, rgba(197,160,89,0) 72%)',
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Hero Editorial Headline & CTAs */}
              <div className="lg:col-span-5 space-y-6">
                {/* Golden Champagne Editorial Eyebrow Card */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-[#FFFDF9] via-[#FAF3E3] to-[#F5E9CE] border border-[#D4AF37]/45 text-[#7A5B20] text-[11px] font-mono uppercase tracking-[0.16em] shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#B88938] animate-ping" />
                  <Sparkles className="w-3.5 h-3.5 text-[#B88938]" />
                  <span className="font-semibold">ACADEMIC RECORDS · INSTITUTIONAL TRUST</span>
                </div>

                {/* Typewriter Hero Headline in Typewriter Font */}
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

                <p className="text-base sm:text-lg text-[#5C564C] leading-relaxed max-w-xl">
                  Bring student records, deterministic APAAR validation, sanctioned intake oversight,
                  and cryptographic verification into one coherent institutional platform.
                </p>

                {/* Primary CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FFFDF9] bg-[#23201B] hover:bg-[#38332B] border border-[#B88938]/50 rounded-md transition-all whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
                  >
                    <span>Sign In (Student / Admin)</span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-2.5 text-sm font-semibold text-[#23201B] bg-[#FFFDF9]/95 border border-[#D5C7AA] hover:bg-[#FAF3E3] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    AICTE Admin Console
                  </Link>
                  <Link
                    to="/admin/assistant"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#7A5B20] bg-[#FAF3E3]/90 border border-[#D4AF37]/40 hover:border-[#B88938] hover:bg-[#F5E9CE] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                  >
                    <MessageSquare className="w-4 h-4 text-[#B88938]" />
                    <span>Ask Assistant</span>
                  </Link>
                </div>

                {/* Institutional Trust Badges */}
                <div className="pt-4 border-t border-[#DFD5C2] text-xs text-[#696358] flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                  <span className="text-[#7A5B20] font-semibold">SIH26263 Reference Implementation</span>
                  <span aria-hidden="true" className="text-[#B88938]">·</span>
                  <span>Masked APAAR Storage</span>
                  <span aria-hidden="true" className="text-[#B88938]">·</span>
                  <span>Deterministic Rule Engine</span>
                </div>
              </div>

              {/* Right Column: Live Pipeline Semantic Visualization */}
              <div className="lg:col-span-7">
                <LivePipelineStrata />
              </div>
            </div>
          </div>
        </section>

        {/* Section A — The Problem */}
        <section id="product" className="max-w-6xl mx-auto px-6 py-16 lg:py-20 border-b border-[#E4DED2]">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-widest text-[#77746B]">
              01 · Structural Context
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#302F29]">
              Academic data should not be difficult to trust.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#E4DED2]">
            <div className="space-y-2.5">
              <div className="text-xs font-mono text-[#85866B] font-semibold">
                01.1 · Institutional Silos
              </div>
              <h3 className="font-display text-lg font-semibold text-[#302F29]">
                Fragmented student records.
              </h3>
              <p className="text-sm text-[#77746B] leading-relaxed">
                Admissions rosters arrive across disparate spreadsheet schemas, making it difficult
                to validate program codes, eligibility windows, and identifier integrity before
                records are committed.
              </p>
            </div>

            <div className="space-y-2.5 md:border-l md:border-[#E4DED2] md:pl-8">
              <div className="text-xs font-mono text-[#85866B] font-semibold">
                01.2 · Cross-Campus Collisions
              </div>
              <h3 className="font-display text-lg font-semibold text-[#302F29]">
                Inconsistent and duplicate submissions.
              </h3>
              <p className="text-sm text-[#77746B] leading-relaxed">
                During multi-round counselling, a student record may appear simultaneously on two
                institutional rosters. Resolving overlaps requires structured human review rather
                than opaque automated rejection.
              </p>
            </div>

            <div className="space-y-2.5 md:border-l md:border-[#E4DED2] md:pl-8">
              <div className="text-xs font-mono text-[#85866B] font-semibold">
                01.3 · Verification Opacity
              </div>
              <h3 className="font-display text-lg font-semibold text-[#302F29]">
                Limited visibility into enrolment and verification.
              </h3>
              <p className="text-sm text-[#77746B] leading-relaxed">
                Regulators need accurate approved-intake utilization across disciplines, while
                scholarship and credit bodies need verifiable, minimal-disclosure enrolment
                attestations without exposing raw identifiers.
              </p>
            </div>
          </div>
        </section>

        {/* Section B — How EduVerify Works */}
        <section id="how-it-works" className="bg-[#FBF9F4] border-b border-[#E4DED2] py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl">
              <div className="text-xs font-mono uppercase tracking-widest text-[#77746B]">
                02 · Deterministic Workflow
              </div>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#302F29]">
                From submission to verification.
              </h2>
            </div>

            {/* Connected 4-Stage Horizontal Timeline on Desktop / Vertical on Mobile */}
            <ol className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {[
                {
                  step: 'Stage 01',
                  title: 'Submit',
                  desc: 'Institutions import student records via structured CSV batches with required-column preflight checks.',
                },
                {
                  step: 'Stage 02',
                  title: 'Validate',
                  desc: 'Deterministic rules identify missing or inconsistent information, masking raw APAAR values immediately.',
                },
                {
                  step: 'Stage 03',
                  title: 'Review',
                  desc: 'Authorized officers investigate potential cross-institution conflicts with documented rationale.',
                },
                {
                  step: 'Stage 04',
                  title: 'Verify',
                  desc: 'Authorized claims can be checked through a signed platform-issued Ed25519 attestation.',
                },
              ].map((item, idx) => (
                <li
                  key={item.step}
                  className="bg-[#FFFDF8] border border-[#E4DED2] rounded-md p-5 flex flex-col justify-between relative shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#77746B] pb-3 border-b border-[#E4DED2]">
                      <span>{item.step}</span>
                      <span className="text-[#85866B] font-semibold">0{idx + 1}</span>
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-[#302F29]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#77746B] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Section C — The Workspace */}
        <section className="max-w-6xl mx-auto px-6 py-16 lg:py-20 border-b border-[#E4DED2]">
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
