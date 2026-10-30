# 02 — System Architecture

## Architecture Style

- Modular monolith (single deployable backend, internal modules)
- Separate web frontend application
- Separate worker process for background jobs

## High-Level Diagram

```text
[React Web App (apps/web)]
      |
      | HTTPS REST (/api/v1)
      v
[FastAPI App (apps/api)] ----> [PostgreSQL 16]
      |                             | \
      | enqueue jobs                |  \__ audit log tables
      v                             \_____ queue + domain tables
[Worker Process]
      |
      v
[Validation, conflict detection, attestation jobs]
```

## Backend Module Boundaries (planned)

- `auth`: authentication + RBAC policy checks
- `institutions`: institution metadata and tenancy
- `students`: student records and protected identifier handling
- `ingestion`: CSV parsing, normalization, batch lifecycle
- `validation`: deterministic rule engine
- `conflicts`: duplicate/cross-institution review workflow
- `attestations`: consent checks, issuance, expiry, revocation, signature validation
- `audit`: tamper-evident event trail

## Frontend Composition (planned)

- Route-level pages for institution/regulator views
- Shared query client and API layer generated from OpenAPI
- Form modules for upload/filter/review workflows
- Charts for intake/enrolment trends
- Accessibility-first component patterns via Radix-based primitives
