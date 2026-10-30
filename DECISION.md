# DECISION.md

Architectural source of truth for WEAVE (SIH26263).

## Decision Register

| ID | Decision | Status | Notes |
|---|---|---|---|
| D-001 | Use **modular monolith** architecture | **Accepted** | Avoids premature microservice complexity for MVP |
| D-002 | Frontend stack: React 18, TS, Vite, React Router, TanStack Query, Tailwind, accessible Radix-based UI, RHF, Zod, Recharts | **Accepted** | Applies to `apps/web` |
| D-003 | Backend stack: Python 3.12, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0, Alembic | **Accepted** | Applies to `apps/api` |
| D-004 | Primary DB is PostgreSQL 16 | **Accepted** | Local/dev and demo deployment |
| D-005 | API style is REST JSON, versioned at `/api/v1` | **Accepted** | Contract-first approach |
| D-006 | Shared contract at `packages/contracts/openapi.yaml` | **Accepted** | Both Sarthak and Satyam approve changes |
| D-007 | Frontend mocking via MSW in development only | **Accepted** | Must be clearly labelled synthetic/mock |
| D-008 | Background jobs use PostgreSQL-backed queue + separate worker process | **Accepted** | Needed for batch/verification workloads |
| D-009 | Security baseline: RBAC, institution isolation, protected identifiers, audit logging, Ed25519 attestations | **Accepted** | Detailed in `docs/05-security-and-privacy.md` |
| D-010 | Deployment baseline: Docker Compose locally, simple cloud demo deployment | **Accepted** | Keep MVP deployable and inspectable |
| D-011 | Optional read-only admin AI copilot disabled by default | **Proposed** | Enable only after MVP core is stable |
| D-012 | Real APAAR/government integration claims require legal + technical authorization proof | **Pending Verification** | Until approved, all integrations are synthetic placeholders |

## Ownership Boundaries

- **Sarthak owns:** `apps/web`
- **Satyam owns:** `apps/api`, `infra`, `synthetic`
- **Joint ownership:** `packages/contracts/openapi.yaml`, security model, and cross-cutting architecture docs

## Non-Negotiables

1. Deterministic validation and verification logic stays in backend code.
2. Authorization is backend-enforced only.
3. Never expose full APAAR IDs in APIs/QR URLs/logs.
4. Never commit secrets.
5. Use Alembic for database schema changes.
