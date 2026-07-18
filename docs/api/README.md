# Core Domain APIs

CRUD and workflow contracts for CMT Fleet Transit fleet operations.

| Document | Focus |
|----------|-------|
| [API.md](API.md) | Endpoints, conventions, trip lifecycle |

## Implementation

| Area | Location |
|------|----------|
| Route handlers | `apps/web/src/app/api/*` |
| API helpers | `apps/web/src/lib/api.ts` |
| Audit helper | `apps/web/src/lib/audit.ts` |
| Validation | [`packages/shared/src/validation`](../../packages/shared/src/validation) |

## Exit Criteria

- [x] Admin can create org → school → vehicle → driver → passenger → route → trip
- [x] All mutations write to `audit_logs`
- [x] API contracts documented in [API.md](API.md)

## Related

- [Authentication](../auth/AUTH.md)
- [Database](../database/DATABASE.md)
