# Authentication & Access Control

Identity, session, and role-based access documentation for CMT Fleet Transit.

| Document | Focus |
|----------|-------|
| [AUTH.md](AUTH.md) | Providers, claims, login flows, middleware, RBAC |

## Implementation

| Area | Location |
|------|----------|
| Auth package | [`packages/auth`](../../packages/auth) |
| API routes | `apps/web/src/app/api/auth/*` |
| Middleware | `apps/web/src/middleware.ts` |
| Client hook | `apps/web/src/hooks/useAuth.tsx` |
| Server session | `apps/web/src/lib/session.ts` |

## Exit Criteria

- [x] Each role lands on its correct home route after login
- [x] Unauthorized users receive 401/403, not data
- [x] Flow documented in [AUTH.md](AUTH.md)

## Related

- [Architecture integration map](../architecture/integration-map.md)
- [Database RLS](../database/rls-policies.md)
