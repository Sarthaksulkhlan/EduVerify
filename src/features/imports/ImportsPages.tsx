import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { weaveApiClient, weaveQueryKeys, ApiClientError } from '../../lib/api-client';
import {
  CSV_TEMPLATE_CONTENT,
  SAMPLE_CSV_Presets,
} from '../../lib/syntheticSeed';
import { parseStudentCsv } from '../../lib/weaveEngine';

/**
 * 1. /app/imports — Import Batch List Page
 */
export const ImportsListPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: weaveQueryKeys.validationResults(user.role, user.institution_id),
    queryFn: () => weaveApiClient.getValidationResults(user.role, user.institution_id),
  });

  const batches = data?.batches || [];

  if (isLoading) {
    return (
      <div role="status" className="bg-white border border-[#DEDDD5] rounded-md p-6 animate-pulse h-48" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DEDDD5] rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DEDDD5] flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#20241F]">
              Submitted Import Batches ({batches.length})
            </h2>
            <p className="text-xs text-[#686B65]">
              Select any batch to inspect expandable validation issues and commit eligible rows.
            </p>
          </div>
          <Link
            to="/app/imports/new"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#181B18] hover:bg-[#2A302B] rounded-md shadow-sm transition-colors"
          >
            Launch CSV Import Wizard
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F0EFE9] border-b border-[#DEDDD5] text-[#686B65] font-medium">
                <th className="py-2.5 px-4">Batch ID</th>
                <th className="py-2.5 px-4">Filename</th>
                <th className="py-2.5 px-4">Institution</th>
                <th className="py-2.5 px-4 text-right">Rows</th>
                <th className="py-2.5 px-4 text-right">Verified</th>
                <th className="py-2.5 px-4 text-right">Flagged / Failed</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDDD5] font-mono tabular-nums">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 px-4 font-semibold text-[#20241F]">{b.id}</td>
                  <td className="py-3 px-4 font-sans text-[#20241F]">{b.filename}</td>
                  <td className="py-3 px-4 text-[#686B65]">{b.institution_id}</td>
                  <td className="py-3 px-4 text-right">{b.total_rows}</td>
                  <td className="py-3 px-4 text-right text-[#1E563B]">{b.passed_rows}</td>
                  <td className="py-3 px-4 text-right text-[#99322B]">
                    {b.flagged_rows} / {b.failed_rows}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <Link
                      to={`/app/imports/${b.id}`}
                      className="inline-flex items-center gap-1 text-[#9B7B32] font-semibold hover:text-[#181B18] hover:underline"
                    >
                      <span>Review Issues</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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

/**
 * 2. /app/imports/new — End-to-End CSV Import Wizard
 */
export const CsvImportWizardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [presetKey, setPresetKey] = useState<string>('standard_mixed');
  const [filename, setFilename] = useState<string>(
    SAMPLE_CSV_Presets.standard_mixed.filename
  );
  const [csvContent, setCsvContent] = useState<string>(
    SAMPLE_CSV_Presets.standard_mixed.csv
  );
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const parsedPreview = parseStudentCsv(csvContent);
  const headerLine =
    csvContent
      .split(/\r?\n/)
      .find((l) => l.trim().length > 0)
      ?.toLowerCase() || '';

  const requiredColumns = [
    'student_ref',
    'apaar_id',
    'full_name',
    'dob',
    'program_code',
    'enrollment_year',
    'consent_granted',
  ];

  const uploadMutation = useMutation({
    mutationFn: () =>
      weaveApiClient.uploadBatch({
        institution_id: user.institution_id || 'INST-KKR-101',
        filename,
        csv_content: csvContent,
        actor_role: user.role,
        actor_email: user.email,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['weave'] });
      navigate(`/app/imports/${res.batch.id}`);
    },
    onError: (err) => {
      if (err instanceof ApiClientError) {
        setUploadError(`${err.message} (${err.code})`);
      } else {
        setUploadError('Failed to process CSV batch.');
      }
    },
  });

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weave_student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileLoad = (file: File) => {
    setUploadError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid file type: Only .csv files are accepted.');
      return;
    }
    if (file.size === 0) {
      setUploadError('Empty file: Selected CSV file contains 0 bytes.');
      return;
    }
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvContent(String(ev.target?.result || ''));
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Download Template & Required Column Checklist */}
      <div className="bg-white border border-[#DEDDD5] rounded-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDDD5]">
          <div>
            <div className="text-xs font-mono text-[#9B7B32] font-semibold">Step 01 · Schema &amp; Template</div>
            <h2 className="font-display text-base font-semibold text-[#20241F]">
              Required Column Checklist &amp; Synthetic Presets
            </h2>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#20241F] bg-[#F7F6F2] border border-[#DEDDD5] rounded-md hover:bg-[#E9E7DF]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {requiredColumns.map((col) => {
            const present = headerLine.includes(col);
            return (
              <span
                key={col}
                className={`px-2.5 py-1 text-xs font-mono border rounded-sm inline-flex items-center gap-1.5 ${
                  present
                    ? 'bg-[#1E563B]/8 border-[#1E563B]/30 text-[#1E563B]'
                    : 'bg-[#99322B]/8 border-[#99322B]/30 text-[#99322B]'
                }`}
              >
                {present ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                <span>{col}</span>
              </span>
            );
          })}
        </div>

        <div className="pt-2">
          <div className="text-xs font-medium text-[#686B65] mb-2">
            Or load a synthetic fixture preset:
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SAMPLE_CSV_Presets).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPresetKey(key);
                  setFilename(preset.filename);
                  setCsvContent(preset.csv);
                  setUploadError(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
                  presetKey === key
                    ? 'bg-[#181B18] text-[#FAF8F3] border-[#181B18]'
                    : 'bg-[#F7F6F2] text-[#20241F] border-[#DEDDD5] hover:bg-[#E9E7DF]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Upload / Edit CSV & Preview First Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 bg-white border border-[#DEDDD5] rounded-md p-6 space-y-4">
          <div className="text-xs font-mono text-[#9B7B32] font-semibold">Step 02 · Upload or Edit CSV</div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFileLoad(f);
            }}
            className={`p-5 border-2 border-dashed rounded-md text-center space-y-2 transition-colors ${
              dragActive
                ? 'border-[#C5A869] bg-[#C5A869]/10'
                : 'border-[#DEDDD5] bg-[#F7F6F2]'
            }`}
          >
            <Upload className="w-5 h-5 text-[#686B65] mx-auto" />
            <div className="text-xs text-[#20241F]">
              Drag and drop a `.csv` file here (max 2 MB), or{' '}
              <label className="text-[#9B7B32] font-semibold underline cursor-pointer">
                browse local files
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileLoad(f);
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="wizard-filename"
              className="block text-xs font-medium text-[#20241F] mb-1"
            >
              Batch Filename
            </label>
            <input
              id="wizard-filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="wizard-csv-textarea"
              className="block text-xs font-medium text-[#20241F] mb-1"
            >
              Raw CSV Content
            </label>
            <textarea
              id="wizard-csv-textarea"
              rows={7}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                setUploadError(null);
              }}
              className="w-full p-3 text-xs font-mono bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
            />
          </div>

          {(uploadError || parsedPreview.parseErrors.length > 0) && (
            <div
              role="alert"
              className="p-3 bg-[#99322B]/10 border border-[#99322B]/30 rounded-md text-xs text-[#99322B] space-y-1"
            >
              {uploadError && <div className="font-semibold">{uploadError}</div>}
              {parsedPreview.parseErrors.map((pe, idx) => (
                <div key={idx}>
                  Line {pe.line}: {pe.reason}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={uploadMutation.isPending || user.role === 'auditor'}
            onClick={() => uploadMutation.mutate()}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#181B18] hover:bg-[#2A302B] disabled:opacity-50 rounded-md transition-colors shadow-sm"
          >
            {uploadMutation.isPending
              ? 'Submitting Batch to Backend Validation Engine...'
              : user.role === 'auditor'
                ? 'Upload Disabled (Auditor Read-Only Role)'
                : 'Submit Batch & Inspect Validation Results'}
          </button>
        </div>

        {/* Step 3: Row Preview */}
        <div className="lg:col-span-6 bg-white border border-[#DEDDD5] rounded-md p-6 space-y-4">
          <div>
            <div className="text-xs font-mono text-[#9B7B32] font-semibold">
              Step 03 · Preflight Row Preview ({parsedPreview.rows.length} rows)
            </div>
            <h3 className="font-display text-base font-semibold text-[#20241F]">
              Parsed Candidate Rows (Masked Preview)
            </h3>
            <p className="text-xs text-[#686B65]">
              Records are not committed from the frontend; the backend owns validation and commit
              eligibility.
            </p>
          </div>

          <div className="overflow-x-auto border border-[#DEDDD5] rounded-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F0EFE9] border-b border-[#DEDDD5] text-[#686B65]">
                  <th className="py-2 px-3">Ref</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Program</th>
                  <th className="py-2 px-3">Consent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDDD5] font-mono tabular-nums">
                {parsedPreview.rows.slice(0, 6).map((r, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 text-[#20241F]">{r.student_ref}</td>
                    <td className="py-2 px-3 font-sans text-[#20241F]">{r.full_name}</td>
                    <td className="py-2 px-3 text-[#686B65]">{r.program_code}</td>
                    <td className="py-2 px-3 text-[#686B65]">
                      {r.consent_granted ? 'true' : 'false'}
                    </td>
                  </tr>
                ))}
                {parsedPreview.rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#686B65] font-sans">
                      No valid rows parsed for preview.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. /app/imports/:id — Validation Results & Issue Review Screen (Section 10)
 */
export const BatchValidationResultsPage: React.FC = () => {
  const { id = 'BAT-2026-003' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'FAIL' | 'WARN' | 'PASS'>('ALL');
  const [ruleFilter, setRuleFilter] = useState<string>('ALL');
  const [rowSearch, setRowSearch] = useState<string>('');
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});
  const [commitBanner, setCommitBanner] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: weaveQueryKeys.batchDetail(id),
    queryFn: () => weaveApiClient.getBatchDetail(id),
  });

  const commitMutation = useMutation({
    mutationFn: () =>
      weaveApiClient.commitBatch({
        batchId: id,
        actor_role: user.role,
        actor_email: user.email,
      }),
    onSuccess: (res) => {
      setCommitBanner(
        `Committed ${res.batch.committed_rows} eligible verified record(s) from ${res.batch.id} to institutional ledger.`
      );
      queryClient.invalidateQueries({ queryKey: ['weave'] });
    },
  });

  if (isLoading) {
    return (
      <div role="status" className="bg-white border border-[#DEDDD5] rounded-md p-6 animate-pulse h-64" />
    );
  }

  if (isError || !data) {
    return (
      <div role="alert" className="bg-white border border-[#99322B] rounded-md p-6 text-xs text-[#99322B]">
        Batch {id} could not be found.{' '}
        <Link to="/app/imports" className="underline font-semibold">
          Return to Import Batches
        </Link>
      </div>
    );
  }

  const { batch, records, ruleset_version } = data;

  const filteredRecords = records.filter((rec) => {
    const q = rowSearch.trim().toLowerCase();
    if (
      q &&
      !rec.student_ref.toLowerCase().includes(q) &&
      !rec.full_name.toLowerCase().includes(q) &&
      !rec.apaar_masked.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (severityFilter !== 'ALL') {
      const hasSeverity = rec.validation_results.some((r) => r.outcome === severityFilter);
      if (!hasSeverity) return false;
    }
    if (ruleFilter !== 'ALL') {
      const hasRule = rec.validation_results.some(
        (r) => r.stu_code === ruleFilter || r.rule_code === ruleFilter
      );
      if (!hasRule) return false;
    }
    return true;
  });

  const handleDownloadErrorReport = () => {
    const header =
      'student_ref,apaar_masked,rule_code,stu_code,outcome,affected_field,reason,remediation\n';
    const lines = records.flatMap((r) =>
      r.validation_results
        .filter((v) => v.outcome !== 'PASS')
        .map(
          (v) =>
            `${r.student_ref},${r.apaar_masked},${v.rule_code},${v.stu_code || ''},${
              v.outcome
            },${v.affected_field || ''},"${v.reason}","${v.remediation || ''}"`
        )
    );
    const blob = new Blob([header + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batch.id}_validation_issue_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Batch Summary Strip */}
      <div className="bg-white border border-[#DEDDD5] rounded-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DEDDD5]">
          <div>
            <div className="text-xs font-mono text-[#686B65]">
              Batch {batch.id} · Ruleset {ruleset_version} · Uploaded by {batch.uploaded_by}
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold text-[#20241F]">
              {batch.filename}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadErrorReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#20241F] bg-[#F7F6F2] border border-[#DEDDD5] rounded-md hover:bg-[#E9E7DF]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Error Report (.CSV)</span>
            </button>

            <button
              type="button"
              disabled={
                batch.committed ||
                batch.passed_rows === 0 ||
                user.role === 'auditor' ||
                commitMutation.isPending
              }
              onClick={() => commitMutation.mutate()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#181B18] hover:bg-[#2A302B] disabled:opacity-45 rounded-md transition-colors shadow-sm"
            >
              {batch.committed
                ? `Committed (${batch.committed_rows || batch.passed_rows} Rows)`
                : `Commit Eligible Rows (${batch.passed_rows})`}
            </button>
          </div>
        </div>

        {commitBanner && (
          <div
            role="status"
            className="p-3 bg-[#1E563B]/10 border border-[#1E563B]/30 rounded-sm text-xs text-[#1E563B] font-medium"
          >
            {commitBanner}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs tabular-nums">
          <div className="p-3 bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm">
            <div className="text-[#686B65]">Total Rows</div>
            <div className="text-lg font-semibold text-[#20241F] mt-0.5">{batch.total_rows}</div>
          </div>
          <div className="p-3 bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm">
            <div className="text-[#1E563B]">Commit-Eligible (PASS)</div>
            <div className="text-lg font-semibold text-[#1E563B] mt-0.5">{batch.passed_rows}</div>
          </div>
          <div className="p-3 bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm">
            <div className="text-[#8E6218]">Warnings / Conflicts</div>
            <div className="text-lg font-semibold text-[#8E6218] mt-0.5">{batch.flagged_rows}</div>
          </div>
          <div className="p-3 bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm">
            <div className="text-[#99322B]">Validation Errors</div>
            <div className="text-lg font-semibold text-[#99322B] mt-0.5">{batch.failed_rows}</div>
          </div>
        </div>
      </div>

      {/* Issue Review Filter Bar */}
      <div className="bg-white border border-[#DEDDD5] rounded-md p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#686B65] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            aria-label="Search by row reference or student name"
            placeholder="Search row reference (e.g. STU-2026-105)..."
            value={rowSearch}
            onChange={(e) => setRowSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
          />
        </div>

        <select
          aria-label="Filter by issue severity"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as 'ALL' | 'FAIL' | 'WARN' | 'PASS')}
          className="px-3 py-1.5 text-xs font-mono bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
        >
          <option value="ALL">All Severities</option>
          <option value="FAIL">Errors Only (FAIL)</option>
          <option value="WARN">Warnings Only (WARN)</option>
          <option value="PASS">Passed Checks (PASS)</option>
        </select>

        <select
          aria-label="Filter by rule code"
          value={ruleFilter}
          onChange={(e) => setRuleFilter(e.target.value)}
          className="px-3 py-1.5 text-xs font-mono bg-[#F7F6F2] border border-[#DEDDD5] rounded-md"
        >
          <option value="ALL">All Rule Codes</option>
          <option value="STU-001">STU-001 (RULE-APAAR-FMT)</option>
          <option value="STU-002">STU-002 (RULE-PROG-CODE)</option>
          <option value="STU-003">STU-003 (RULE-DOB-AGE)</option>
          <option value="STU-004">STU-004 (RULE-CONSENT-CHK)</option>
          <option value="STU-005">STU-005 (RULE-CROSS-INST)</option>
          <option value="STU-006">STU-006 (RULE-INTAKE-CAP)</option>
        </select>
      </div>

      {/* Expandable Issue Review Rows */}
      <div className="bg-white border border-[#DEDDD5] rounded-md divide-y divide-[#DEDDD5]">
        {filteredRecords.map((rec) => {
          const isOpen = expandedRowIds[rec.id] ?? rec.status !== 'VERIFIED';
          const eligible = rec.status === 'VERIFIED';
          return (
            <div key={rec.id} className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedRowIds((prev) => ({ ...prev, [rec.id]: !isOpen }))
                  }
                  className="flex items-center gap-2 text-left text-xs font-semibold text-[#20241F]"
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-[#686B65]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#686B65]" />
                  )}
                  <span className="font-mono">{rec.student_ref}</span>
                  <span>·</span>
                  <span>{rec.full_name}</span>
                  <span>·</span>
                  <span className="font-mono text-[#686B65]">APAAR {rec.apaar_masked}</span>
                </button>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[#686B65]">
                    Commit Eligibility: {eligible ? 'ELIGIBLE' : 'BLOCKED'}
                  </span>
                  {rec.status === 'VERIFIED' && (
                    <span className="text-[#1E563B] font-semibold">VERIFIED</span>
                  )}
                  {rec.status === 'FLAGGED_CONFLICT' && (
                    <span className="text-[#8E6218] font-semibold">CONFLICT CANDIDATE</span>
                  )}
                  {rec.status === 'VALIDATION_FAILED' && (
                    <span className="text-[#99322B] font-semibold">VALIDATION FAILED</span>
                  )}
                  {rec.status === 'PENDING_REVIEW' && (
                    <span className="text-[#8E6218] font-semibold">WARNING</span>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="pl-6 space-y-2.5 pt-2 border-t border-[#DEDDD5]">
                  {rec.validation_results.map((vr, i) => (
                    <div
                      key={`${vr.rule_code}-${i}`}
                      className="p-3 bg-[#F7F6F2] border border-[#DEDDD5] rounded-sm text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                        <span className="font-semibold text-[#20241F]">
                          {vr.stu_code || vr.rule_code} ({vr.rule_code}) · {vr.rule_name}
                        </span>
                        <span
                          className={
                            vr.outcome === 'PASS'
                              ? 'text-[#1E563B] font-semibold'
                              : vr.outcome === 'WARN'
                                ? 'text-[#8E6218] font-semibold'
                                : 'text-[#99322B] font-semibold'
                          }
                        >
                          {vr.outcome} · Ruleset {vr.ruleset_version || '2026.10.v1'}
                        </span>
                      </div>

                      <p className="text-[#20241F]">{vr.reason}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-[#686B65] pt-1">
                        <div>Affected Field: {vr.affected_field || 'record'}</div>
                        <div>Expected: {vr.expected_value || 'Valid schema'}</div>
                        <div>Actual (Masked): {vr.actual_masked || rec.apaar_masked}</div>
                      </div>

                      {vr.remediation && vr.outcome !== 'PASS' && (
                        <div className="pt-1 text-[11px] text-[#9B7B32] font-medium">
                          Suggested Remediation: {vr.remediation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
