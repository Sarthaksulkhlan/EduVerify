# RULEBOOK.md

Mandatory engineering practices for WEAVE.

## 1) Data and Privacy Rules

1. Use **synthetic student data only** in development, demos, fixtures and tests.
2. Do not collect Aadhaar numbers or unnecessary personal information.
3. Do not expose full APAAR IDs in responses, logs, exports, or QR payloads.
4. Mask identifiers by default in UI and API (`****` + last 4 where required).

## 2) Security Rules

1. Never commit API keys, passwords, private keys, certificates, or tokens.
2. Authorization must be enforced in backend endpoints/services; frontend checks are UX only.
3. Enforce institution-level data isolation on every relevant query.
4. Keep tamper-evident audit entries for critical actions.
5. Sign platform-issued attestations with Ed25519 keys managed outside git.

## 3) AI Usage Rules

1. LLMs are prohibited for deterministic validation, authorization, or signature verification decisions.
2. Optional admin copilot, if implemented, must be read-only and permission-scoped.
3. AI output must be treated as advisory only.

## 4) API and Contract Rules

1. API root: `/api/v1`.
2. Use one consistent JSON error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body validation failed.",
    "request_id": "req_...",
    "details": []
  }
}
```

3. Contract-first workflow using `packages/contracts/openapi.yaml`.
4. Contract changes require both Sarthak and Satyam review/approval.

## 5) Engineering and Delivery Rules

1. Keep MVP scope small, demonstrable and deterministic.
2. Use Alembic migrations for database changes.
3. Label synthetic integrations clearly; never present them as official/government connected.
4. Keep PRs small; include tests when implementation code is added.
5. Update docs when architectural/security behavior changes.
