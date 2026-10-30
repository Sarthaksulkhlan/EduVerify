# 04 — API Specification Guidance

## API Conventions

- Base path: `/api/v1`
- Content type: `application/json`
- AuthN/AuthZ enforced in backend
- All endpoints tenant-aware by institution scope where applicable

## Contract Location

- Source of truth: `packages/contracts/openapi.yaml`

## Planned Endpoint Groups

- `GET /health`
- `POST /auth/login` (implementation pending)
- `GET /institutions/me`
- `POST /students/batches/upload`
- `GET /students/batches/{batch_id}`
- `GET /students/validation-results`
- `GET /conflicts`
- `POST /conflicts/{case_id}/resolve`
- `POST /attestations`
- `GET /attestations/{id}`
- `POST /attestations/{id}/revoke`
- `GET /audit-events`

## Standard Error Format (mandatory)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body validation failed.",
    "request_id": "req_01J123ABC456",
    "details": [
      { "field": "student_records[0].program_code", "reason": "required" }
    ]
  }
}
```

## Client Generation (frontend)

1. Update `packages/contracts/openapi.yaml`.
2. Generate TypeScript client into `apps/web/src/generated/api`.
3. Commit generated artifacts only if repository policy requires; otherwise generate in CI/build.
4. Frontend and backend PRs touching API must pin same contract version.
