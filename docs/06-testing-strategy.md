# 06 — Testing Strategy

## Current Phase

Repository initialization only; implementation tests are pending until code scaffolding exists.

## Planned Test Pyramid

### Backend (`apps/api`)

- Unit tests: validation rules, masking utilities, RBAC policies
- Integration tests: API endpoints + DB transaction behavior
- Migration tests: Alembic upgrade/downgrade paths
- Security tests: tenant isolation, authz bypass attempts, identifier leakage

### Frontend (`apps/web`)

- Unit tests: form schemas, utility logic
- Component tests: accessibility and interaction states
- API interaction tests with MSW (development-only mocks)
- Smoke E2E for upload/review/attestation verification flows

## CI Expectations (when implemented)

- Fast lint + type checks
- Targeted test execution by changed package
- Security checks and secret scanning
- Contract drift checks between backend and frontend generated client
