# Security Checklist

Production-readiness security gates for CMT Fleet Transit. Run before each release.

---

## Authentication & Sessions

- [x] Firebase ID tokens verified server-side (Admin SDK)
- [x] Session cookie is `httpOnly`, `SameSite=Lax`, `Secure` in production
- [x] Session revocation checked on verify (`verifySessionCookie(_, true)`)
- [x] Custom claims (`role`, `organization_id`) drive access, not client input

## Authorization & Tenancy

- [x] RBAC matrix enforced on every API route (`requirePermission`)
- [x] Tenant scope derived from session, never trusted from the body
- [x] Cross-tenant access denied (`resolveOrgScope`, `canAccessOrganization`)
- [x] Row-Level Security enabled on all tenant tables (see [rls-policies](../database/rls-policies.md))
- [x] Superadmin-only operations gated (org create, superadmin grant)

## Input & Output

- [x] All mutations validated with Zod schemas
- [x] Client errors sanitized via `getClientSafeError` (no stack/secrets)
- [x] IDs generated with `crypto.randomUUID()`
- [x] Parameterized queries only (Supabase client; no string SQL)

## Transport & Headers

- [x] HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options` set
- [x] `Permissions-Policy` restricts camera/geolocation to self
- [x] `poweredByHeader` disabled

## Abuse & Rate Limiting

- [x] Write endpoints rate-limited (10/min per IP), reads 60/min
- [x] OTP required for check-in identity confirmation
- [x] Idempotent check-ins via `clientEventId`

## Secrets

- [x] `.env` files git-ignored; `.env.example` carries no real values
- [x] `scripts/check-secrets.sh` run before push
- [x] Service role key server-only; never shipped to the client

## Data Protection

- [x] Check-in photos in private Supabase Storage (signed URLs)
- [x] Audit log records every mutation with actor + entity
- [x] Guardian endpoints verify the passenger↔guardian link

---

## Release sign-off

| Gate | Command |
|------|---------|
| Types | `pnpm type-check` |
| Lint | `pnpm lint` |
| Unit tests | `pnpm test` |
| Secrets | `pnpm check-secrets` |

All four must pass before deploy.
