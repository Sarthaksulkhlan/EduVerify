# 07 — Delivery Plan

## Milestone 0 — Repository Foundation (current)

- Finalize architecture docs, rules and folder structure.
- Define contract-first workflow and security baselines.

## Milestone 1 — Backend Skeleton

- FastAPI app bootstrap, module layout, auth skeleton.
- PostgreSQL connectivity and initial Alembic migration.
- CSV ingestion endpoint placeholder and job queue skeleton.

## Milestone 2 — Frontend Skeleton

- Vite React TS setup with routing, query client, Tailwind and base UI shell.
- Auth/session shell and protected route scaffolding.
- Contract-generated client integration.

## Milestone 3 — Core MVP Features

- Batch upload + deterministic validation + conflict review.
- Intake vs enrolment dashboard slices.
- Attestation issuance/verification/revocation with audit trail.

## Milestone 4 — Hardening and Demo

- Security and privacy checks.
- End-to-end demo script with clearly synthetic data.
- Deployment rehearsal via Docker Compose and cloud demo environment.

## Working Agreement

- 1 feature branch per task.
- Shared contract PRs require both owners.
- Keep branch up to date with `main` before merge.
