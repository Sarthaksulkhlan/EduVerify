# 03 — Database Schema (PostgreSQL 16)

> Initial schema design for MVP planning. Implement via Alembic migrations.

## Core Tables (planned)

- `institutions`
- `users`
- `roles`
- `user_roles`
- `student_records`
- `student_batches`
- `validation_results`
- `conflict_cases`
- `conflict_case_events`
- `attestations`
- `attestation_revocations`
- `consents`
- `audit_events`
- `job_queue`

## Key Constraints

- Institution isolation key on tenant-aware tables: `institution_id`.
- Soft-delete and status tracking where review/legal traceability is needed.
- Protected identifier storage strategy for APAAR references:
  - Store masked display form.
  - Store irreversible hash for deterministic matching.
  - Never expose full raw identifier outside strictly controlled internal flow.

## Example Minimal Columns (illustrative)

- `student_records(id, institution_id, student_ref, apaar_hash, apaar_masked, full_name, dob, program_code, enrollment_year, status, created_at, updated_at)`
- `validation_results(id, student_record_id, rule_code, outcome, reason, created_at)`
- `audit_events(id, institution_id, actor_user_id, action, entity_type, entity_id, payload_json, previous_hash, event_hash, created_at)`
- `job_queue(id, queue_name, payload_json, status, attempts, available_at, locked_at, created_at)`
