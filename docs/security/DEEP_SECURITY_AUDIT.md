# Deep Security Audit

Threat-model-driven review of CMT Fleet Transit. Complements the [checklist](SECURITY_CHECKLIST.md).

---

## Assets & Trust Boundaries

| Asset | Sensitivity | Boundary |
|-------|-------------|----------|
| Passenger PII (names, stops) | High (child data) | Org tenant via RLS |
| Check-in photos + GPS | High | Private Storage + signed URLs |
| Firebase service credentials | Critical | Server env only |
| Supabase service role key | Critical | Server env only |
| Session cookies | High | httpOnly, not JS-readable |

---

## STRIDE Review

### Spoofing
- Identity verified by Firebase; tokens validated with Admin SDK.
- LINE users mapped through `firebase_uid = "line:{id}"`; no implicit trust of profile data.

### Tampering
- Zod validation on all inputs; unknown fields rejected.
- Tenant id never accepted from the body for non-superadmin.
- Trip status changes constrained by a transition allow-list (409 on illegal).

### Repudiation
- `audit_logs` records actor, action, entity, and timestamp for every mutation.
- Check-ins carry driver id, GPS, and optional photo proof.

### Information Disclosure
- RLS isolates tenants at the database layer (defense in depth beyond app checks).
- `getClientSafeError` prevents leaking internals to clients.
- CSP limits exfiltration channels; `connect-src` allow-lists Supabase/Google/Firebase.

### Denial of Service
- Per-IP rate limiting on API routes.
- Optimization bounded (2-opt max passes; < 2s for 50 stops).

### Elevation of Privilege
- RBAC matrix enforced centrally; superadmin-only paths explicitly checked.
- Role/org claims come from the verified token, not request input.

---

## Known Limitations (v1)

| Item | Mitigation / plan |
|------|-------------------|
| In-memory rate limiter is per-instance | Move to Upstash/Redis for multi-instance |
| OTP is a shared static secret per passenger | Rotate secrets; consider time-based OTP |
| Live FCM delivery requires device registry | Guardian device tokens table in a follow-up |
| CSP allows `unsafe-inline`/`unsafe-eval` for Maps | Tighten with nonces once Maps supports it |

---

## Verification

```bash
pnpm type-check   # no unsafe any leaks in guards
pnpm lint         # rule violations
pnpm test         # authz/template unit tests
pnpm check-secrets
```

---

## Related

- [Security checklist](SECURITY_CHECKLIST.md)
- [RLS policies](../database/rls-policies.md)
- [Authentication](../auth/AUTH.md)
