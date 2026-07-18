# Authentication, RBAC & Sessions

How CMT Fleet Transit authenticates users, carries tenant scope, and enforces role-based access. Implemented in [`packages/auth`](../../packages/auth) and `apps/web`.

---

## Identity Providers

| Provider | Use | Package |
|----------|-----|---------|
| Firebase Phone Auth | Primary OTP login (all roles) | `@cmt/auth/firebase-client` |
| LINE Login | Guardian / admin OAuth | `@cmt/auth/line-auth` |
| Firebase Admin | Verify tokens, set claims, mint session cookie | `@cmt/auth/firebase-admin` |

---

## Roles

| Role | Rank | Default home |
|------|------|--------------|
| `superadmin` | 5 | `/dashboard` |
| `admin` | 4 | `/dashboard` |
| `staff` | 3 | `/dashboard` |
| `driver` | 2 | `/driver` |
| `parent` | 1 | `/parent/tracking` |

`homeRouteForRole(role)` maps role → landing route after login.

---

## Custom Claims

After verification, the user's Firebase token carries:

| Claim | Source |
|-------|--------|
| `role` | `users.role` |
| `organization_id` | `users.organization_id` (null for superadmin) |
| `user_id` | `users.id` |

These claims are read by:

- **Client** — `useAuth()` decodes them from the ID token result
- **Server** — `lib/session.ts` verifies the session cookie
- **Supabase RLS** — `app_organization_id()` / `app_user_role()` read matching JWT claims

---

## Login Flow (Phone)

```
Client: signInWithPhoneNumber → OTP confirm
        │  idToken
        ▼
POST /api/auth/verify
        ├── verifyIdToken (Admin SDK)
        ├── look up users row by firebase_uid
        └── setCustomUserClaims(role, organization_id, user_id)
        │
Client: getIdToken(true)   # refresh so claims are embedded
        ▼
POST /api/auth/session
        └── createSessionCookie → httpOnly cookie "cmt_session"
        │
        ▼
redirect → homeRouteForRole(role)
```

Logout: `DELETE /api/auth/session` clears the cookie; client calls `signOut()`.

---

## LINE Flow

```
LINE OAuth → code
        ▼
POST /api/auth/line
        ├── exchangeLineCode → access token
        ├── fetchLineProfile → lineUserId
        └── map firebase_uid "line:{lineUserId}" → set claims
```

LINE users are provisioned with `firebase_uid = "line:{lineUserId}"` during onboarding, then bridged to a Firebase custom token client-side.

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/verify` | POST | Verify ID token, sync user, set claims |
| `/api/auth/session` | POST | Issue session cookie |
| `/api/auth/session` | DELETE | Clear session (logout) |
| `/api/auth/line` | POST | LINE OAuth code exchange |

---

## Middleware

[`apps/web/src/middleware.ts`](../../apps/web/src/middleware.ts) performs a **cookie-presence** check at the edge:

| Path | Unauthenticated behavior |
|------|--------------------------|
| `/dashboard/*`, `/parent/*`, `/driver/*` | Redirect to `/auth/login?next=…` |
| `/api/{organizations,fleet,routes,trips}/*` | `401 Unauthorized` |

Full cryptographic verification runs in Node (route handlers + server components) via `getSession()`. Never trust the cookie's mere presence for data access.

---

## RBAC Helpers

`packages/auth/src/rbac.ts`:

| Function | Purpose |
|----------|---------|
| `hasAtLeastRole(role, required)` | Hierarchy check |
| `canAccessOrganization(role, userOrgId, targetOrgId)` | Tenant isolation |
| `can(role, resource, action)` | Per-resource CRUD matrix |
| `homeRouteForRole(role)` | Post-login redirect |

The `PERMISSIONS` matrix defines create/read/update/delete per resource and role.

---

## Session Security

| Control | Setting |
|---------|---------|
| Cookie | `cmt_session`, httpOnly, `SameSite=Lax` |
| Secure flag | Enabled in production |
| Max age | 5 days |
| Revocation | `revokeSessions(uid)` + `verifySessionCookie(_, true)` checks revocation |

---

## Failure Behavior

| Failure | Response |
|---------|----------|
| Invalid OTP / token | 401, no session |
| No user profile | 403 (account exists in Firebase, not provisioned) |
| Claims missing | Treated as unauthenticated |
| Admin SDK misconfig | 500; login blocked |

---

## Related

- [Integration map](../architecture/integration-map.md)
- [RLS policies](../database/rls-policies.md)
- [Foundation setup](../foundation/SETUP.md)
