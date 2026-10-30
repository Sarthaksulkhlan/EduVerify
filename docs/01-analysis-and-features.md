# 01 — Analysis and Features

## Problem Context

AICTE-approved institutions require a controlled way to ingest student records, detect inconsistencies, and issue verifiable enrolment attestations while maintaining privacy and auditability.

## MVP Goals

1. Institution and regulator dashboards.
2. CSV upload and batch processing for student records.
3. Deterministic explainable validation rules.
4. Duplicate/cross-institution conflict detection with human review queue.
5. Approved intake vs enrolment monitoring.
6. Consent-aware platform-issued attestations with QR verification, expiry and revocation.
7. Tamper-evident audit history.

## Out of Scope (MVP)

- Live government integration without authorization.
- Real APAAR identity verification claims.
- Write-enabled AI copilots.

## Key Personas

- Institution Operator
- Institution Reviewer
- Regulator Analyst
- Security/Audit Reviewer

## Feature-to-Persona Mapping

| Feature | Institution | Regulator | Auditor |
|---|---|---|---|
| CSV ingestion | Primary | View aggregate | View events |
| Validation and conflicts | Primary | Monitor trends | Inspect rationale |
| Intake monitoring | View own | Cross-institution | Verify calculations |
| Attestation issuance | Primary | Policy checks | Signature/audit checks |
