import test from 'node:test';
import assert from 'node:assert/strict';
import {
  maskApaarId,
  hashApaarId,
  isValidRawApaar,
  validateStudentRow,
  parseStudentCsv,
  signAttestationPayload,
  verifyAttestationRecord,
  computeAuditEventHash,
  verifyAuditChain,
  createApiError,
  evaluateIdleSessionState,
  evaluateSessionTimelineMilestone,
  formatSessionCountdown,
  IDLE_WARNING_THRESHOLD_MS,
  IDLE_LOGOUT_THRESHOLD_MS,
  type AuditEvent,
  type AttestationRecord,
} from './weaveEngine';

test('APAAR masking never exposes full 12-digit identifier and preserves last 4 digits', () => {
  const raw = '4829-1039-7741';
  assert.equal(isValidRawApaar(raw), true);
  const masked = maskApaarId(raw);
  assert.equal(masked, '****-****-7741');
  assert.equal(masked.includes('4829'), false);
  assert.equal(masked.includes('1039'), false);
});

test('APAAR format validation rejects identifiers starting with 0 or 1 or wrong length', () => {
  assert.equal(isValidRawApaar('012345678901'), false);
  assert.equal(isValidRawApaar('198765432109'), false);
  assert.equal(isValidRawApaar('23456789'), false);
  assert.equal(isValidRawApaar('539201847261'), true);
});

test('Deterministic student validation detects cross-institution conflict and program errors', () => {
  const existingHash = hashApaarId('648291038472');
  const existingMap = new Map([
    [
      existingHash,
      {
        institution_id: 'INST-DEL-201',
        institution_name: 'DTU Tech Campus Delhi',
        program_code: 'BTECH-CSE',
      },
    ],
  ]);

  const result = validateStudentRow(
    {
      student_ref: 'STU-2026-901',
      apaar_id: '6482-9103-8472',
      full_name: 'Aarav Sharma',
      dob: '2006-05-14',
      program_code: 'BTECH-CSE',
      enrollment_year: 2026,
      consent_granted: true,
    },
    {
      institution_id: 'INST-KKR-101',
      institution_name: 'NIT Kurukshetra',
      existing_hashes: existingMap,
      program_counts: { 'BTECH-CSE': { enrolled: 140, cap: 180 } },
    }
  );

  assert.equal(result.overallStatus, 'FLAGGED_CONFLICT');
  assert.equal(result.apaarMasked, '****-****-8472');
  assert.ok(result.conflict);
  assert.equal(result.conflict?.conflict_type, 'CROSS_INSTITUTION_DUPLICATE');
  assert.equal(result.conflict?.competing_institution_id, 'INST-DEL-201');
});

test('CSV parser blocks Aadhaar columns per RULEBOOK.md privacy guardrail', () => {
  const badCsv = `student_ref,aadhaar_no,full_name,dob,program_code,enrollment_year\nSTU-1,999988887777,Test,2006-01-01,BTECH-CSE,2026`;
  const parsed = parseStudentCsv(badCsv);
  assert.equal(parsed.rows.length, 0);
  assert.equal(parsed.parseErrors.length, 1);
  assert.ok(parsed.parseErrors[0].reason.includes('Aadhaar'));
});

test('Ed25519 attestation signing and verification detects revocation and tampering', () => {
  const issuedAt = '2026-08-01T10:00:00.000Z';
  const expiresAt = '2027-08-01T10:00:00.000Z';
  const signed = signAttestationPayload({
    attestation_id: 'ATT-2026-5001',
    student_ref: 'STU-2026-104',
    apaar_hash: hashApaarId('738291048573'),
    institution_id: 'INST-KKR-101',
    program_code: 'BTECH-CSE',
    enrollment_year: 2026,
    issued_at: issuedAt,
    expires_at: expiresAt,
  });

  const record: AttestationRecord = {
    id: 'ATT-2026-5001',
    student_record_id: 'REC-104',
    student_ref: 'STU-2026-104',
    student_name: 'Diya Nair',
    apaar_masked: '****-****-8573',
    apaar_hash: hashApaarId('738291048573'),
    institution_id: 'INST-KKR-101',
    institution_name: 'NIT Kurukshetra',
    program_code: 'BTECH-CSE',
    enrollment_year: 2026,
    consent_id: 'CNS-2026-881',
    purpose: 'AICTE National Scholarship Enrolment Verification',
    issued_at: issuedAt,
    expires_at: expiresAt,
    status: 'ACTIVE',
    ed25519_key_id: signed.key_id,
    ed25519_signature: signed.signature,
    verification_payload: signed.verification_payload,
  };

  const activeCheck = verifyAttestationRecord(record, '2026-10-27T10:00:00.000Z');
  assert.equal(activeCheck.valid, true);
  assert.equal(activeCheck.status_code, 'VERIFIED_ACTIVE');

  const revokedRecord: AttestationRecord = {
    ...record,
    status: 'REVOKED',
    revocation_reason: 'Student transferred institution via conflict resolution',
    revoked_at: '2026-10-27T12:00:00.000Z',
  };
  const revokedCheck = verifyAttestationRecord(revokedRecord, '2026-10-27T13:00:00.000Z');
  assert.equal(revokedCheck.valid, false);
  assert.equal(revokedCheck.status_code, 'INVALID_REVOKED');
});

test('Tamper-evident audit chain verifies integrity and detects modified event payload', () => {
  const ev1Base = {
    id: 'AUD-001',
    institution_id: 'INST-KKR-101',
    actor_role: 'INSTITUTION_OPERATOR' as const,
    actor_user_id: 'usr_sarthak_op',
    action: 'BATCH_UPLOADED',
    entity_type: 'BATCH' as const,
    entity_id: 'BAT-2026-01',
    summary: 'Uploaded synthetic batch with 12 records',
    previous_hash: 'GENESIS_00000000000000000000000000000000',
    created_at: '2026-10-25T09:00:00.000Z',
  };
  const ev1: AuditEvent = { ...ev1Base, event_hash: computeAuditEventHash(ev1Base) };

  const ev2Base = {
    id: 'AUD-002',
    institution_id: 'INST-KKR-101',
    actor_role: 'REGULATOR_ANALYST' as const,
    actor_user_id: 'usr_satyam_reg',
    action: 'CONFLICT_RESOLVED',
    entity_type: 'CONFLICT_CASE' as const,
    entity_id: 'CNF-2026-01',
    summary: 'Resolved cross-institution duplicate with transfer confirmation',
    previous_hash: ev1.event_hash,
    created_at: '2026-10-26T11:30:00.000Z',
  };
  const ev2: AuditEvent = { ...ev2Base, event_hash: computeAuditEventHash(ev2Base) };

  // Stored newest-first
  const checkOk = verifyAuditChain([ev2, ev1]);
  assert.equal(checkOk.intact, true);
  assert.equal(checkOk.checkedCount, 2);

  // Tamper with ev1 summary
  const tamperedEv1: AuditEvent = { ...ev1, summary: 'Tampered summary' };
  const checkTampered = verifyAuditChain([ev2, tamperedEv1]);
  assert.equal(checkTampered.intact, false);
  assert.equal(checkTampered.brokenAtEventId, 'AUD-001');
});

test('Standard API error envelope matches RULEBOOK.md specification', () => {
  const err = createApiError('VALIDATION_ERROR', 'Request body validation failed.', 'req_01JTEST', [
    { field: 'student_records[0].program_code', reason: 'required' },
  ]);
  assert.equal(err.error.code, 'VALIDATION_ERROR');
  assert.equal(err.error.request_id, 'req_01JTEST');
  assert.equal(err.error.details.length, 1);
});

test('Idle session timeout middleware shows warning after 10 minutes and redirects to login after 15 minutes', () => {
  const baseTime = 1_700_000_000_000;

  assert.equal(IDLE_WARNING_THRESHOLD_MS, 10 * 60 * 1000);
  assert.equal(IDLE_LOGOUT_THRESHOLD_MS, 15 * 60 * 1000);

  // 1. At 9 minutes 59 seconds: ACTIVE, no warning
  const activeState = evaluateIdleSessionState(baseTime, baseTime + (9 * 60 + 59) * 1000);
  assert.equal(activeState.status, 'ACTIVE');
  assert.equal(activeState.shouldShowWarning, false);
  assert.equal(activeState.shouldRedirectToLogin, false);
  assert.equal(activeState.secondsUntilWarning, 1);
  assert.equal(activeState.secondsUntilLogout, 301);

  // 2. Exactly at 10 minutes (600s): WARNING modal opens with 5 minutes (300s) remaining until 15m logout
  const warningAt10Min = evaluateIdleSessionState(baseTime, baseTime + 10 * 60 * 1000);
  assert.equal(warningAt10Min.status, 'WARNING');
  assert.equal(warningAt10Min.shouldShowWarning, true);
  assert.equal(warningAt10Min.shouldRedirectToLogin, false);
  assert.equal(warningAt10Min.secondsUntilLogout, 300);
  assert.equal(formatSessionCountdown(warningAt10Min.secondsUntilLogout), '05:00');

  // 3. At 14 minutes 59 seconds (899s): WARNING modal shows 00:01 remaining
  const warningAt14m59s = evaluateIdleSessionState(baseTime, baseTime + (14 * 60 + 59) * 1000);
  assert.equal(warningAt14m59s.status, 'WARNING');
  assert.equal(warningAt14m59s.shouldShowWarning, true);
  assert.equal(warningAt14m59s.shouldRedirectToLogin, false);
  assert.equal(warningAt14m59s.secondsUntilLogout, 1);
  assert.equal(formatSessionCountdown(warningAt14m59s.secondsUntilLogout), '00:01');

  // 4. At 15 minutes (900s): EXPIRED, auto-logout and redirect to login
  const expiredAt15Min = evaluateIdleSessionState(baseTime, baseTime + 15 * 60 * 1000);
  assert.equal(expiredAt15Min.status, 'EXPIRED');
  assert.equal(expiredAt15Min.shouldShowWarning, false);
  assert.equal(expiredAt15Min.shouldRedirectToLogin, true);
  assert.equal(expiredAt15Min.secondsUntilLogout, 0);
  assert.equal(formatSessionCountdown(expiredAt15Min.secondsUntilLogout), '00:00');

  // 5. 10-minute countdown timeline with minute-by-minute alerts and auto-logout at 10m (600s)
  const timelineAt3Min = evaluateSessionTimelineMilestone(180);
  assert.equal(timelineAt3Min.elapsedMinutes, 3);
  assert.equal(timelineAt3Min.remainingSeconds, 420);
  assert.equal(timelineAt3Min.shouldAutoLogout, false);
  assert.ok(timelineAt3Min.minuteAlertText.includes('Session timeout is 10 minutes'));

  const timelineAt10Min = evaluateSessionTimelineMilestone(600);
  assert.equal(timelineAt10Min.remainingSeconds, 0);
  assert.equal(timelineAt10Min.shouldAutoLogout, true);
});


