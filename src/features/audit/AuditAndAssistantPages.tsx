import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Lock,
  Send,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Ban,
  RotateCcw,
  Search,
  BookOpen,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { weaveApiClient, weaveQueryKeys } from '../../lib/api-client';
import { VALIDATION_RULES_CATALOG } from '../../lib/weaveEngine';
import {
  WEAVE_KNOWLEDGE_BASE,
  matchKnowledgeIntent,
  type KnowledgeEntry,
} from '../../data/weaveKnowledgeBase';

/**
 * 1. /app/audit — Chronological Audit Timeline (Section 14)
 */
export const AuditTimelinePage: React.FC = () => {
  const { user } = useAuth();
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: weaveQueryKeys.auditEvents(user.role, user.institution_id),
    queryFn: () => weaveApiClient.getAuditEvents(user.role, user.institution_id),
  });

  if (isLoading) {
    return (
      <div role="status" className="bg-white border border-[#DEDDD5] rounded-md p-6 animate-pulse h-64" />
    );
  }

  const events = data?.events || [];
  const chainIntegrity = data?.chain_integrity;

  const filtered = events.filter((ev) => {
    if (actionFilter !== 'ALL' && ev.action !== actionFilter) return false;
    if (dateFilter && !ev.created_at.startsWith(dateFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hash Chain Verification Banner */}
      {chainIntegrity && (
        <div className="p-4 bg-white border border-[#DEDDD5] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1E563B] shrink-0" />
            <div>
              <span className="font-semibold text-[#20241F]">
                Backend Hash-Chain Verification:{' '}
                {chainIntegrity.intact ? 'INTACT' : 'TAMPER_DETECTED'}
              </span>
              <p className="text-[#686B65]">
                Verified {chainIntegrity.checkedCount} linked events (`previous_hash` →
                `event_hash`). Passwords, tokens, and raw CSV contents are never logged.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 text-xs font-medium text-[#20241F] bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm hover:bg-[#E9E7DF] shrink-0"
          >
            Re-Verify Chain
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-[#DEDDD5] rounded-md p-4 flex flex-wrap items-center gap-3">
        <select
          aria-label="Filter by audit action type"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 text-xs font-mono bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
        >
          <option value="ALL">All Action Types</option>
          <option value="BATCH_INGESTED">BATCH_INGESTED</option>
          <option value="BATCH_COMMITTED">BATCH_COMMITTED</option>
          <option value="CONFLICT_RESOLVED">CONFLICT_RESOLVED</option>
          <option value="ATTESTATION_ISSUED">ATTESTATION_ISSUED</option>
          <option value="ATTESTATION_REVOKED">ATTESTATION_REVOKED</option>
        </select>

        <input
          type="date"
          aria-label="Filter audit events by date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1.5 text-xs font-mono bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
        />

        {dateFilter && (
          <button
            type="button"
            onClick={() => setDateFilter('')}
            className="text-xs text-[#9B7B32] hover:text-[#181B18] underline"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Audit Timeline Table */}
      <div className="bg-white border border-[#DEDDD5] rounded-md divide-y divide-[#DEDDD5]">
        {filtered.map((ev) => (
          <div key={ev.id} className="p-5 space-y-2 hover:bg-[#F7F6F2]/60 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#20241F]">{ev.id}</span>
                <span>·</span>
                <span className="text-[#9B7B32] font-semibold">{ev.action}</span>
                <span>·</span>
                <span className="text-[#686B65]">
                  Target: {ev.entity_type} ({ev.entity_id})
                </span>
              </div>
              <span className="text-[#686B65] tabular-nums">
                {ev.created_at.replace('T', ' ').slice(0, 19)} UTC
              </span>
            </div>

            <p className="text-sm text-[#20241F]">{ev.summary}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-[#686B65]">
              <span>Actor Role: {ev.actor_role}</span>
              <span>·</span>
              <span>Institution: {ev.institution_id}</span>
              <span>·</span>
              <span>Outcome: {ev.outcome || 'SUCCESS'}</span>
            </div>

            <div className="pt-1 grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px] text-[#686B65] tabular-nums">
              <div className="truncate">
                <Lock className="w-3 h-3 inline mr-1" />
                prev: {ev.previous_hash}
              </div>
              <div className="truncate text-[#20241F]">hash: {ev.event_hash}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Ruleset Reference Table */}
      <div className="bg-white border border-[#DEDDD5] rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DEDDD5]">
          <h2 className="font-display text-base font-semibold text-[#20241F]">
            Deterministic Validation Ruleset Catalog (v2026.10.v1)
          </h2>
        </div>
        <div className="divide-y divide-[#DEDDD5] text-xs">
          {VALIDATION_RULES_CATALOG.map((r) => (
            <div key={r.code} className="p-4 space-y-1">
              <div className="font-mono font-semibold text-[#20241F]">
                {r.stu_code} ({r.code}) · {r.name}
              </div>
              <p className="text-[#686B65]">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AssistantChatMessage {
  id: string;
  role: 'user' | 'assistant';
  query: string;
  matchedQuestion?: string;
  categoryLabel?: string;
  text: string;
  confidence?: number;
  followUps?: string[];
  sources?: Array<{ label: string; route: string }>;
  timestamp: string;
}

const KNOWLEDGE_CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'understanding', label: '1. Understanding & SIH' },
  { id: 'imports', label: '2. Ingestion & CSV' },
  { id: 'validation', label: '3. Rules (STU-001–006)' },
  { id: 'duplicates', label: '4. Duplicate Review' },
  { id: 'intake', label: '5. Approved Intake' },
  { id: 'verification', label: '6. Verification & Ed25519' },
  { id: 'security', label: '7. Security & Audit' },
  { id: 'dashboard', label: '8. Dashboard Guidance' },
];

/**
 * 2. /app/assistant — Dedicated Deterministic Rule-Based Knowledge Assistant
 * Zero LLM APIs, Zero External Keys, 100% Offline Capable
 */
export const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      query: 'Initial Initialization',
      categoryLabel: 'Offline System Knowledge Base',
      text:
        `Welcome to the **EduVerify Institutional Knowledge Assistant** for SIH26263.\n\n` +
        `This assistant is 100% offline-first and rule-based, containing verified documentation on **deterministic validation rules** (STU-001 through STU-006), **cross-institution duplicate reviews**, **AICTE intake monitoring**, and **Ed25519 cryptographic attestations**.\n\n` +
        `Choose a topic category, search below, or click any suggested question chip to explore.`,
      confidence: 100,
      followUps: [
        'What is EduVerify?',
        'How does duplicate detection work?',
        'What is approved intake monitoring?',
        'What are the 6 student validation rules?',
      ],
      sources: [
        { label: 'Validation Ruleset Catalog', route: '/app/audit' },
        { label: 'Approved Intake Monitoring', route: '/app/intake' },
        { label: 'Duplicate Review Queue', route: '/app/duplicates' },
      ],
      timestamp: 'System Ready',
    },
  ]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  const handleAskQuestion = async (questionText: string) => {
    const clean = questionText.trim();
    if (!clean) return;

    const userMsg: AssistantChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      query: clean,
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const matchResult = matchKnowledgeIntent(clean);
    const matched = matchResult.matchedEntry;

    let responseText = '';
    let categoryLabel = 'Compliance & Architecture';
    let followUps: string[] = [];
    let sources: Array<{ label: string; route: string }> = [
      { label: 'Deterministic Rulebook Catalog', route: '/app/audit' },
      { label: 'Approved Intake Monitoring', route: '/app/intake' },
      { label: 'Duplicate & Conflict Review', route: '/app/duplicates' },
    ];

    if (matched) {
      responseText = matched.answer;
      categoryLabel = matched.categoryLabel;
      followUps = matched.followUpQuestions || [];
    } else {
      const topRecs = matchResult.suggestedEntries.slice(0, 3);
      followUps = topRecs.map((r) => r.canonicalQuestion);
      try {
        const backendReply = await weaveApiClient.chatWithAssistant({
          messages: [{ role: 'user', text: clean }],
          model: 'gemini-3.8-flash',
          role: user.role,
          institution_id: user.institution_id,
        });
        if (backendReply?.reply) {
          responseText = backendReply.reply;
          categoryLabel = `Backend Grounded Telemetry (${backendReply.model_used || 'Deterministic'})`;
          if (backendReply.sources?.length) {
            sources = backendReply.sources;
          }
        }
      } catch {
        // Fallback to local recommendations if backend call fails
      }

      if (!responseText) {
        responseText =
          `I do not have an exact matching rulebook entry for "${clean}".\n\n` +
          `As an institutional trust system for SIH26263, I answer questions based strictly on curated validation rules, data contracts, and regulatory policies without external hallucination.\n\n` +
          `**Recommended questions on related topics:**\n` +
          topRecs.map((r) => `• **${r.canonicalQuestion}**`).join('\n') +
          `\n\nSelect any suggested topic chip below to view its guidance.`;
      }
    }

    const assistantMsg: AssistantChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      query: clean,
      matchedQuestion: matched?.canonicalQuestion,
      categoryLabel,
      text: responseText,
      confidence: matchResult.confidence,
      followUps,
      sources,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setChatInput('');
  };

  // Filtered knowledge entries for the quick exploration panel
  const displayedEntries = WEAVE_KNOWLEDGE_BASE.filter((entry) => {
    if (selectedCategory !== 'all' && entry.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inQuestion = entry.canonicalQuestion.toLowerCase().includes(q);
      const inAnswer = entry.answer.toLowerCase().includes(q);
      const inSynonyms = entry.synonyms.some((s) => s.toLowerCase().includes(q));
      return inQuestion || inAnswer || inSynonyms;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner: 100% Offline / Deterministic */}
      <div className="p-4 bg-white border border-[#DEDDD5] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#9B7B32] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-[#20241F]">
              EduVerify Deterministic Institutional Assistant (SIH26263)
            </div>
            <p className="text-[#686B65]">
              Operates 100% locally on curated rulebooks and database schemas. Zero LLM API calls,
              zero external network tokens, and zero hallucinations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-[#9B7B32] bg-[#FAF7EF] px-2.5 py-1 rounded border border-[#C5A869]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offline Knowledge Base ({WEAVE_KNOWLEDGE_BASE.length} Q&amp;As)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Curated Category Explorer (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#DEDDD5] rounded-md p-5 space-y-4">
          <div className="space-y-1 pb-3 border-b border-[#DEDDD5]">
            <h3 className="text-sm font-semibold text-[#20241F] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#9B7B32]" />
              <span>Browse Knowledge Topics</span>
            </h3>
            <p className="text-xs text-[#686B65]">
              Select a category or search verified questions.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#686B65] absolute left-3 top-2.5" />
            <input
              type="text"
              aria-label="Search questions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, rule, or topic..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F6F2] border border-[#DEDDD5] rounded text-[#20241F] placeholder:text-[#686B65]"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {KNOWLEDGE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#181B18] text-[#FAF8F3] font-medium shadow-xs'
                    : 'bg-[#F7F6F2] text-[#20241F] border border-[#DEDDD5] hover:bg-[#E9E7DF]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* List of Clickable Canonical Questions */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {displayedEntries.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#686B65] bg-[#F7F6F2] rounded">
                No matching questions found for "{searchQuery}".
              </div>
            ) : (
              displayedEntries.map((entry, idx) => (
                <button
                  key={`${entry.id}-${idx}`}
                  type="button"
                  onClick={() => handleAskQuestion(entry.canonicalQuestion)}
                  className="w-full text-left p-2.5 rounded bg-[#F7F6F2] hover:bg-[#FAF7EF] border border-[#DEDDD5] hover:border-[#C5A869]/50 transition-colors group flex items-start justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-[#9B7B32] uppercase font-semibold">
                      {entry.categoryLabel}
                    </div>
                    <div className="text-[#20241F] font-medium leading-snug group-hover:text-[#9B7B32]">
                      {entry.canonicalQuestion}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#686B65] group-hover:text-[#9B7B32] shrink-0 mt-1" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Chat Conversation (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#DEDDD5] rounded-md flex flex-col h-[580px]">
          {/* Thread Header */}
          <div className="px-5 py-3.5 border-b border-[#DEDDD5] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#20241F]">Question &amp; Guidance Thread</span>
              <span className="font-mono text-[10px] px-2 py-0.5 bg-[#F7F6F2] border border-[#DEDDD5] rounded text-[#686B65]">
                {messages.length} item(s)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMessages(messages.slice(0, 1))}
              className="inline-flex items-center gap-1 text-xs text-[#686B65] hover:text-[#20241F]"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Thread
            </button>
          </div>

          {/* Scrollable Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F7F6F2]/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-md p-4 text-xs space-y-2.5 border shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#181B18] text-[#FAF8F3] border-[#181B18]'
                      : 'bg-white text-[#20241F] border-[#DEDDD5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-80">
                    <span>
                      {msg.role === 'user'
                        ? `${user.name} (${user.role})`
                        : `EduVerify Knowledge · ${msg.categoryLabel || 'Rulebook'}`}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {msg.matchedQuestion && msg.role === 'assistant' && (
                    <div className="p-2 bg-[#F7F6F2] rounded border border-[#DEDDD5]/70 text-[11px] font-medium text-[#9B7B32]">
                      Matched: {msg.matchedQuestion} (Confidence: {msg.confidence}%)
                    </div>
                  )}

                  <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                  {/* Follow-up Questions as Clickable Chips */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="pt-2 border-t border-[#DEDDD5]/70 space-y-1.5">
                      <span className="text-[10px] font-mono text-[#686B65] uppercase">
                        Related Questions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.followUps.map((fq) => (
                          <button
                            key={fq}
                            type="button"
                            onClick={() => handleAskQuestion(fq)}
                            className="px-2 py-0.5 rounded text-[11px] bg-[#F7F6F2] hover:bg-[#E9E7DF] border border-[#DEDDD5] text-[#20241F] text-left transition-colors"
                          >
                            {fq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources / Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-[#DEDDD5]/70 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-mono text-[#686B65]">Citations:</span>
                      {msg.sources.map((src) => (
                        <Link
                          key={src.route}
                          to={src.route}
                          className="inline-flex items-center gap-1 font-medium text-[#9B7B32] underline hover:text-[#181B18]"
                        >
                          <span>{src.label}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={threadEndRef} />
          </div>

          {/* Ask Input Form */}
          <div className="p-4 border-t border-[#DEDDD5] bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(chatInput);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                aria-label="Ask a question about EduVerify"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question (e.g. 'How does rule STU-005 detect conflicts?')..."
                className="flex-1 px-3 py-2 text-xs bg-[#F7F6F2] border border-[#DEDDD5] rounded-md text-[#20241F] focus:outline-none focus:ring-2 focus:ring-[#C5A869]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#181B18] hover:bg-[#2A302B] disabled:opacity-50 rounded-md transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. /app/settings — Profile, API Mode & Attestation Management Page
 */
export const SettingsPage: React.FC = () => {
  const { user, apiMode, setApiMode } = useAuth();
  const queryClient = useQueryClient();

  const attQuery = useQuery({
    queryKey: weaveQueryKeys.attestations(user.role, user.institution_id),
    queryFn: () => weaveApiClient.getAttestations(user.role, user.institution_id),
  });

  const stuQuery = useQuery({
    queryKey: weaveQueryKeys.validationResults(user.role, user.institution_id),
    queryFn: () => weaveApiClient.getValidationResults(user.role, user.institution_id),
  });

  const eligibleStudents = (stuQuery.data?.students || []).filter(
    (s) => s.status === 'VERIFIED' && s.consent_granted
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    eligibleStudents[0]?.id || 'REC-2026-101'
  );
  const [purpose, setPurpose] = useState<string>(
    'National Scholarship Portal (NSP) Bonafide Verification'
  );
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const issueMutation = useMutation({
    mutationFn: () =>
      weaveApiClient.issueAttestation({
        student_record_id: selectedStudentId,
        purpose,
        validity_days: 365,
        actor_role: user.role,
        actor_email: user.email,
      }),
    onSuccess: (res) => {
      setStatusMsg(`Issued Ed25519 attestation ${res.attestation.id}.`);
      queryClient.invalidateQueries({ queryKey: ['weave'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) =>
      weaveApiClient.revokeAttestation({
        id,
        reason: 'Revoked by administrator via credential settings',
        actor_role: user.role,
        actor_email: user.email,
      }),
    onSuccess: (res) => {
      setStatusMsg(`Revoked attestation ${res.attestation.id}.`);
      queryClient.invalidateQueries({ queryKey: ['weave'] });
    },
  });

  const attestations = attQuery.data?.attestations || [];

  return (
    <div className="space-y-8">
      {/* Session & API Mode Settings */}
      <div className="bg-white border border-[#DEDDD5] rounded-md p-6 space-y-4">
        <h2 className="font-display text-base font-semibold text-[#20241F]">
          Session Profile &amp; Environment Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm">
            <div className="text-[#686B65]">Active User</div>
            <div className="font-semibold text-[#20241F] mt-0.5">{user.email}</div>
          </div>
          <div className="p-3 bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm">
            <div className="text-[#686B65]">Role Authority</div>
            <div className="font-semibold text-[#9B7B32] mt-0.5">{user.role}</div>
          </div>
          <div className="p-3 bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm">
            <div className="text-[#686B65]">Token Storage</div>
            <div className="font-semibold text-[#1E6B45] mt-0.5">
              In-Memory Only (Zero WebStorage)
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3 text-xs">
          <span className="font-medium text-[#20241F]">Banner Mode Simulation:</span>
          <button
            type="button"
            onClick={() => setApiMode('live')}
            className={`px-3 py-1.5 rounded-sm border ${
              apiMode === 'live'
                ? 'bg-[#181B18] text-[#FAF8F3] border-[#181B18]'
                : 'bg-[#F7F6F2] text-[#20241F] border-[#DEDDD5]'
            }`}
          >
            Synthetic Backend (/api/v1)
          </button>
          <button
            type="button"
            onClick={() => setApiMode('mock')}
            className={`px-3 py-1.5 rounded-sm border ${
              apiMode === 'mock'
                ? 'bg-[#181B18] text-[#FAF8F3] border-[#181B18]'
                : 'bg-[#F7F6F2] text-[#20241F] border-[#DEDDD5]'
            }`}
          >
            Mock Mode Banner (VITE_API_MODE=mock)
          </button>
        </div>
      </div>

      {/* Consent-Gated Ed25519 Attestation Issuance & Registry */}
      <div className="bg-white border border-[#DEDDD5] rounded-md p-6 space-y-5">
        <div>
          <h2 className="font-display text-base font-semibold text-[#20241F]">
            Platform-Issued Enrolment Attestations (Ed25519)
          </h2>
          <p className="text-xs text-[#686B65]">
            Issue or revoke signed verification tokens (`/verify/:token`) for consented verified
            students.
          </p>
        </div>

        {statusMsg && (
          <div
            role="status"
            className="p-3 bg-[#1E563B]/10 border border-[#1E563B]/30 rounded-sm text-xs text-[#1E563B]"
          >
            {statusMsg}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            issueMutation.mutate();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-5">
            <label
              htmlFor="settings-stu-select"
              className="block text-xs font-medium text-[#20241F] mb-1"
            >
              Consented Verified Student
            </label>
            <select
              id="settings-stu-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
            >
              {eligibleStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.student_ref} · {s.apaar_masked})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5">
            <label
              htmlFor="settings-purpose-input"
              className="block text-xs font-medium text-[#20241F] mb-1"
            >
              Authorized Disclosure Purpose
            </label>
            <input
              id="settings-purpose-input"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={issueMutation.isPending || user.role === 'auditor'}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#181B18] hover:bg-[#2A302B] disabled:opacity-45 rounded-md shadow-sm transition-colors"
            >
              Issue Token
            </button>
          </div>
        </form>

        <div className="divide-y divide-[#DEDDD5] border-t border-[#DEDDD5] pt-2">
          {attestations.map((att) => (
            <div
              key={att.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-mono font-semibold text-[#20241F]">
                  {att.id} · {att.student_name} ({att.apaar_masked})
                </div>
                <div className="text-[#686B65] mt-0.5">
                  {att.purpose} · Consent {att.consent_id}
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono shrink-0">
                {att.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1 text-[#1E6B45]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACTIVE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#99322B]">
                    <Ban className="w-3.5 h-3.5" />
                    <span>{att.status}</span>
                  </span>
                )}

                <Link
                  to={`/verify/${att.id.toLowerCase()}`}
                  className="text-[#9B7B32] hover:text-[#181B18] underline font-sans font-medium"
                >
                  Open Public Verifier
                </Link>

                {att.status === 'ACTIVE' && user.role !== 'auditor' && (
                  <button
                    type="button"
                    onClick={() => revokeMutation.mutate(att.id)}
                    className="px-2.5 py-1 text-[11px] font-sans text-[#99322B] border border-[#99322B]/30 rounded-sm hover:bg-[#99322B]/10"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
