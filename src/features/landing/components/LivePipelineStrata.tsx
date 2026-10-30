import React, { useState, useEffect } from 'react';
import { Check, Play, Pause, RefreshCw, Sparkles } from 'lucide-react';

export type StrataPhase = 'colorless' | 'color_formula' | 'fracture';

export interface WeavePipelineLayer {
  id: string;
  code: string;
  title: string;
  roleScope: string;
  testsCount: string;
  boundaryScore: string;
  scoreStatus: string;
  scoreColor: string;
  bgColor: string;
  fractureBgColor?: string;
  waveStroke: string;
  patternType: 'diagonal' | 'dots' | 'dashes';
  isCracked: boolean;
  conflictDetails?: {
    id: string;
    label: string;
    summary: string;
  };
  details: string;
}

const EDUVERIFY_PIPELINE_LAYERS: WeavePipelineLayer[] = [
  {
    id: 'layer-attestation',
    code: 'ATT-CORE-ED25519',
    title: 'Ed25519 Attestation & Tamper-Evident Ledger',
    roleScope: 'PLATFORM TRUST ANCHOR',
    testsCount: '12/12 checks passed',
    boundaryScore: '1.00',
    scoreStatus: 'ATTESTATION ACTIVE',
    scoreColor: '#34D399',
    bgColor: '#144233',
    waveStroke: '#2DD4BF',
    patternType: 'diagonal',
    isCracked: false,
    details:
      'Platform root Ed25519 cryptographic key signs verified enrolment tokens (/verify/:token) and Merkle audit events.',
  },
  {
    id: 'layer-intake',
    code: 'AICTE-CAP-GOV',
    title: 'Approved Intake & Sanctioned Seat Thresholds',
    roleScope: 'REGULATOR OVERSIGHT',
    testsCount: '6/6 disciplines balanced',
    boundaryScore: '0.85',
    scoreStatus: 'CAPACITY HOLDING',
    scoreColor: '#FACC15',
    bgColor: '#4A3610',
    waveStroke: '#EAB308',
    patternType: 'diagonal',
    isCracked: false,
    details:
      'Continuous monitoring of AICTE sanctioned seat caps (1,020 total seats) versus committed student enrolment across institutions.',
  },
  {
    id: 'layer-conflict',
    code: 'CNF-2026-019',
    title: 'Cross-Institution APAAR Digest Collision (STU-005)',
    roleScope: 'DUPLICATE REVIEW QUEUE',
    testsCount: '11/11 preflight checks',
    boundaryScore: '0.50',
    scoreStatus: '2 INSTITUTIONS HOLDING',
    scoreColor: '#F87171',
    bgColor: '#521821',
    fractureBgColor: '#611924',
    waveStroke: '#F43F5E',
    patternType: 'dots',
    isCracked: true,
    conflictDetails: {
      id: 'CONFLICT-2026-019',
      label: 'STU-005 COLLISION',
      summary: 'Candidate ref ****-8472 found on NIT Kurukshetra and IIET Delhi admission rosters.',
    },
    details:
      'Irreversible APAAR SHA-256 hash collision detected between NIT Kurukshetra (BTECH-CSE) and IIET Delhi. Routed to human regulator queue.',
  },
  {
    id: 'layer-ruleset',
    code: 'RULESET-2026.10',
    title: 'Deterministic Academic Policy Engine (STU-001..004)',
    roleScope: 'DETERMINISTIC EVALUATION',
    testsCount: '11/11 rules evaluated',
    boundaryScore: '0.75',
    scoreStatus: 'BOUNDARY WEAKENED',
    scoreColor: '#FBBF24',
    bgColor: '#452C11',
    fractureBgColor: '#523214',
    waveStroke: '#F59E0B',
    patternType: 'dashes',
    isCracked: true,
    details:
      'Deterministic checks for 12-digit APAAR format (STU-001), sanctioned program codes (STU-002), age window [16-35] (STU-003), and consent (STU-004).',
  },
  {
    id: 'layer-ingestion',
    code: 'BAT-2026-003',
    title: 'CSV Roster Preflight & Salted Masking Vault',
    roleScope: 'INSTITUTION TENANT GATEWAY',
    testsCount: '11/11 rows masked',
    boundaryScore: '0.875',
    scoreStatus: 'PREFLIGHT PASSED',
    scoreColor: '#86EFAC',
    bgColor: '#223B1F',
    waveStroke: '#84CC16',
    patternType: 'diagonal',
    isCracked: true,
    details:
      'Mandatory CSV header verification, immediate raw APAAR masking to ****-****-XXXX, and strict rejection of Aadhaar columns.',
  },
  {
    id: 'layer-tenants',
    code: 'TENANT-ISOLATION',
    title: 'Participating Technical Institutions Isolation Baseline',
    roleScope: 'TENANT BOUNDARY',
    testsCount: '11/11 colleges isolated',
    boundaryScore: '1.00',
    scoreStatus: '4 RULES HOLDING',
    scoreColor: '#34D399',
    bgColor: '#123A2E',
    waveStroke: '#10B981',
    patternType: 'dashes',
    isCracked: false,
    details:
      'Row-level cryptographic multi-tenancy ensures colleges never view competing rosters or unauthorized student records.',
  },
];

export const LivePipelineStrata: React.FC = () => {
  const [phase, setPhase] = useState<StrataPhase>('colorless');
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-conflict');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [flowProgress, setFlowProgress] = useState<number>(15);

  // Rapid, continuous 1 -> 2 -> 3 flow on load:
  // Baseline (0.95s) -> Semantic (0.95s) -> Conflict (1.4s) -> repeat smoothly
  useEffect(() => {
    if (!isPlaying) return;

    let timer: number;
    if (phase === 'colorless') {
      setFlowProgress(33);
      timer = window.setTimeout(() => setPhase('color_formula'), 950);
    } else if (phase === 'color_formula') {
      setFlowProgress(66);
      timer = window.setTimeout(() => setPhase('fracture'), 950);
    } else {
      setFlowProgress(100);
      timer = window.setTimeout(() => setPhase('colorless'), 1450);
    }

    return () => window.clearTimeout(timer);
  }, [phase, isPlaying]);

  const selectedLayer =
    EDUVERIFY_PIPELINE_LAYERS.find((l) => l.id === selectedLayerId) || EDUVERIFY_PIPELINE_LAYERS[2];

  const isFracturePhase = phase === 'fracture';
  const isColorPhase = phase === 'color_formula' || phase === 'fracture';

  return (
    <div className="w-full max-w-xl mx-auto bg-[#FAF7F0] text-[#23201B] rounded-xl overflow-hidden border border-[#DFD3BC] shadow-md flex flex-col">
      {/* Refined Editorial Header Bar for EduVerify Live Pipeline Semantic */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#F5EFE2] via-[#FAF6EC] to-[#F2E9D8] border-b border-[#E2D6C1] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-md bg-[#23201B] text-[#E6C675] flex items-center justify-center shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs sm:text-sm font-bold tracking-tight text-[#23201B]">
                EduVerify{' '}
                <span className="font-serif italic font-semibold text-[#9A6F21]">
                  Live Pipeline Semantic
                </span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#B88938]/15 text-[#8A6118] font-mono text-[9px] font-semibold uppercase tracking-widest">
                REAL-TIME FLOW
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#7A7265]">
              Continuous 3-Stage Stream: Baseline → Semantic → Conflict
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-0.5 bg-[#FFFDF9] border border-[#DCD0B8] rounded-md shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setPhase('colorless');
                setFlowProgress(33);
              }}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all duration-200 ${
                phase === 'colorless'
                  ? 'bg-[#23201B] text-[#FFFDF8] font-semibold'
                  : 'text-[#6E6B62] hover:text-[#23201B]'
              }`}
            >
              1. Baseline
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setPhase('color_formula');
                setFlowProgress(66);
              }}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all duration-200 ${
                phase === 'color_formula'
                  ? 'bg-[#144233] text-[#FFFDF8] font-semibold'
                  : 'text-[#6E6B62] hover:text-[#23201B]'
              }`}
            >
              2. Semantic
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setPhase('fracture');
                setFlowProgress(100);
              }}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all duration-200 ${
                phase === 'fracture'
                  ? 'bg-[#521821] text-[#FFFDF8] font-semibold'
                  : 'text-[#6E6B62] hover:text-[#23201B]'
              }`}
            >
              3. Conflict
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-[#5A5850] hover:text-[#23201B] bg-[#FFFDF8] border border-[#DCD0B8] rounded-md transition-colors"
            title={isPlaying ? 'Pause rapid flow' : 'Resume rapid flow'}
          >
            {isPlaying ? <Pause className="w-2.5 h-2.5 text-[#B88938]" /> : <Play className="w-2.5 h-2.5 text-[#B88938]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase('colorless');
              setIsPlaying(true);
            }}
            className="p-1 text-[#5A5850] hover:text-[#23201B] bg-[#FFFDF8] border border-[#DCD0B8] rounded-md"
            title="Restart 1-2-3 flow"
          >
            <RefreshCw className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Continuous Flow Progress Indicator Bar */}
      <div className="h-1 w-full bg-[#E8DFCE] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#23201B] via-[#144233] to-[#991B1B] transition-all duration-500 ease-out"
          style={{ width: `${flowProgress}%` }}
        />
      </div>

      {/* Compact Subtitle Bar */}
      <div className="px-4 py-1.5 bg-[#FAF8F3] border-b border-[#E5E0D4] text-[11px] text-[#5A5850] flex items-center justify-between">
        <p className="line-clamp-1 font-mono text-[10px] transition-all duration-200">
          {phase === 'colorless' &&
            'FLOW [1/3] BASELINE → Isolated institutional batches pass preflight check...'}
          {phase === 'color_formula' &&
            'FLOW [2/3] SEMANTIC → Darkened strata evaluate system-wide boundary scores...'}
          {phase === 'fracture' &&
            'FLOW [3/3] CONFLICT → Boundary drops to 0.50 as a cross-campus fracture opens.'}
        </p>
        <span className="font-mono text-[9px] text-[#B88938] font-semibold shrink-0 ml-2 uppercase">
          Interactive Strata
        </span>
      </div>

      {/* Lighter Background Diagram Body with Compact Spacing */}
      <div className="relative p-3 bg-[#EDE6D8] flex-1 overflow-hidden select-none">
        {/* SVG Pattern Definitions */}
        <svg className="w-0 h-0 absolute" aria-hidden="true">
          <defs>
            <pattern
              id="eduverify-diag-hatch"
              width="10"
              height="10"
              patternTransform="rotate(35 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="10"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1.5"
              />
            </pattern>
            <pattern
              id="eduverify-dot-matrix"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2.5" cy="2.5" r="1" fill="rgba(255,255,255,0.07)" />
            </pattern>
            <pattern
              id="eduverify-dash-grid"
              width="16"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="2"
                y1="5"
                x2="8"
                y2="5"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1.2"
              />
            </pattern>
          </defs>
        </svg>

        {/* Rapid Transitional Fracture Crack Overlay */}
        <div
          className={`
            absolute inset-y-2 left-[52%] -translate-x-1/2 w-20 pointer-events-none z-30
            transition-all duration-300 ease-out
            ${isFracturePhase ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-75'}
          `}
          style={{ transformOrigin: 'top center' }}
        >
          <div
            className={`
              absolute inset-y-6 left-1/2 -translate-x-1/2 w-8 rounded-full bg-[#F43F5E]/30 blur-lg
              transition-opacity duration-300 ease-out
              ${isFracturePhase ? 'opacity-100' : 'opacity-0'}
            `}
          />

          <svg
            viewBox="0 0 90 360"
            preserveAspectRatio="none"
            className="w-full h-full fill-none"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.5))',
            }}
          >
            <path
              d="M46 54 L36 86 L50 114 L32 144 L52 174 L34 206 L50 236 L35 266 L48 296 L40 322"
              stroke="#12090B"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 420,
                strokeDashoffset: isFracturePhase ? 0 : 420,
                transition: 'stroke-dashoffset 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
            <path
              d="M44 54 L34 86 L48 114 L30 144 L50 174 L32 206 L48 236 L33 266 L46 296 L38 322"
              stroke="#FB7185"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 420,
                strokeDashoffset: isFracturePhase ? 0 : 420,
                transition: 'stroke-dashoffset 0.38s cubic-bezier(0.22, 1, 0.36, 1) 0.02s',
              }}
            />
            <path
              d="M48 54 L38 86 L52 114 L34 144 L54 174 L36 206 L52 236 L37 266 L50 296 L42 322"
              stroke="#F43F5E"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 420,
                strokeDashoffset: isFracturePhase ? 0 : 420,
                transition: 'stroke-dashoffset 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.03s',
              }}
            />
          </svg>
        </div>

        {/* Compact Stacked Wavy Strata Layers */}
        <div className="space-y-1 relative z-10">
          {EDUVERIFY_PIPELINE_LAYERS.map((layer, idx) => {
            const isSelected = selectedLayerId === layer.id;
            const isLayerFractured = isFracturePhase && layer.isCracked;

            const currentBg =
              phase === 'colorless'
                ? idx % 2 === 0
                  ? '#2B303A'
                  : '#323844'
                : isLayerFractured && layer.fractureBgColor
                  ? layer.fractureBgColor
                  : layer.bgColor;

            const currentWaveColor =
              phase === 'colorless' ? '#525B6C' : layer.waveStroke;

            const patternUrl =
              layer.patternType === 'dots'
                ? 'url(#eduverify-dot-matrix)'
                : layer.patternType === 'dashes'
                  ? 'url(#eduverify-dash-grid)'
                  : 'url(#eduverify-diag-hatch)';

            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayerId(layer.id)}
                className={`
                  group relative rounded px-3 py-2 cursor-pointer overflow-hidden
                  transition-all duration-300 ease-out
                  ${
                    isSelected
                      ? 'ring-2 ring-[#E6C675] shadow-md z-20'
                      : 'hover:brightness-105'
                  }
                `}
                style={{
                  backgroundColor: currentBg,
                  borderTop: `1.5px solid ${currentWaveColor}`,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <svg
                  viewBox="0 0 1000 54"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                >
                  <rect width="1000" height="54" fill={patternUrl} />
                  <path
                    d={
                      idx % 2 === 0
                        ? 'M0 5 Q 170 1, 340 6 T 680 5 T 1000 4'
                        : 'M0 6 Q 170 10, 340 4 T 680 7 T 1000 5'
                    }
                    fill="none"
                    stroke={currentWaveColor}
                    strokeWidth="2"
                    style={{
                      transition: 'stroke 250ms ease-out',
                    }}
                  />
                </svg>

                <div className="relative z-20 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-white/65">
                        {layer.code}
                      </span>
                      <span className="text-[9px] font-mono text-white/45 uppercase hidden sm:inline">
                        · {layer.roleScope}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#F9FAFB] truncate">
                      {layer.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {layer.conflictDetails && (
                      <div
                        className={`
                          flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[10px] font-bold
                          transition-all duration-250 ease-out
                          ${
                            isFracturePhase
                              ? 'opacity-100 translate-x-0 scale-100 bg-[#691926] border-[#F43F5E]/60 text-[#FECDD3]'
                              : 'opacity-0 translate-x-3 scale-90 pointer-events-none w-0 px-0 py-0 overflow-hidden border-transparent'
                          }
                        `}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185] animate-ping shrink-0" />
                        <span className="whitespace-nowrap">{layer.conflictDetails.id}</span>
                      </div>
                    )}

                    <div className="relative flex items-center bg-[#0D1015]/85 border border-white/10 rounded px-2.5 py-1 font-mono text-[11px] min-w-[126px] justify-center transition-all duration-200">
                      {!isColorPhase ? (
                        <div className="flex items-center gap-1 text-[#E5E7EB]">
                          <Check className="w-3 h-3 text-[#34D399] shrink-0" />
                          <span className="text-[10px]">{layer.testsCount}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-bold tabular-nums text-[11px] transition-colors duration-200"
                            style={{
                              color: isLayerFractured ? '#FB7185' : layer.scoreColor,
                            }}
                          >
                            {layer.boundaryScore}
                          </span>
                          <span className="text-[9px] tracking-wider uppercase text-white/80 whitespace-nowrap">
                            {isLayerFractured && layer.id === 'layer-conflict'
                              ? '2 RULES BROKEN'
                              : layer.scoreStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Selected Layer Telemetry Footer */}
      <div className="px-4 py-2.5 bg-[#F4EFE4] border-t border-[#E2D6C1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-[#9A6F21]">
            {selectedLayer.code}
          </span>
          <span className="font-semibold text-[#23201B]">{selectedLayer.title}</span>
        </div>

        <div className="text-[10px] text-[#6E6B62] line-clamp-1 max-w-xs">
          {selectedLayer.details}
        </div>
      </div>
    </div>
  );
};
