# Non-Functional Requirements

NFRs for CMT Fleet Transit v1. These constrain how the system behaves — performance, reliability, security, and offline behavior — independent of feature list in [mvp-features.md](mvp-features.md).

---

## NFR Index

| ID | Category | Summary |
|----|----------|---------|
| NFR-P01 | Performance | API and optimization response times |
| NFR-P02 | Performance | Realtime GPS latency |
| NFR-P03 | Performance | Notification delivery time |
| NFR-P04 | Performance | Frontend Lighthouse scores |
| NFR-A01 | Availability | Uptime during service windows |
| NFR-A02 | Availability | Graceful degradation |
| NFR-S01 | Security | Authentication and session |
| NFR-S02 | Security | Tenant isolation (RLS) |
| NFR-S03 | Security | API hardening |
| NFR-S04 | Security | Data protection |
| NFR-S05 | Security | Audit and logging |
| NFR-O01 | Offline | Driver check-in queue |
| NFR-O02 | Offline | PWA caching |
| NFR-SC01 | Scalability | Pilot-scale concurrency |
| NFR-M01 | Maintainability | Dev environment |
| NFR-AC01 | Accessibility | Dashboard baseline |

---

## Performance

### NFR-P01 — API response times

| Endpoint class | Target (p95) | Measurement |
|----------------|--------------|-------------|
| CRUD reads (list passengers, trips) | < 500 ms | Server timing / APM |
| CRUD writes | < 800 ms | Server timing |
| Route optimization (≤ 50 stops) | < 2 s | `POST /api/routes/optimize` |
| Auth session verify | < 300 ms | `/api/auth/session` |

**Verification:** Load test optimization with 50-stop fixture in CI benchmark job.

---

### NFR-P02 — Realtime GPS latency

| Metric | Target |
|--------|--------|
| Driver position written → dashboard subscriber received | < 100 ms (p95) |
| Position update interval (active trip) | ≤ 5 s (configurable) |

**Implementation:** Supabase Realtime on `locations` insert; avoid polling-only dashboard in v1.

**Verification:** Staging test with two clients; measure timestamp delta.

---

### NFR-P03 — Notification delivery

| Metric | Target |
|--------|--------|
| Check-in event → FCM/LINE/Telegram sent | < 30 s (p95) |
| Notification pipeline internal processing | < 5 s |

**Verification:** Integration test with mock provider + staging blast to 10 devices.

---

### NFR-P04 — Frontend performance (Lighthouse)

| Page | Performance | Accessibility | Best practices |
|------|-------------|---------------|----------------|
| Dashboard overview | ≥ 95 | ≥ 95 | ≥ 95 |
| Guardian tracking | ≥ 90 | ≥ 95 | ≥ 95 |
| Driver trip view | ≥ 85 (mobile) | ≥ 90 | ≥ 90 |

**Notes:** Map-heavy pages may score lower on performance; optimize lazy map load.

**Verification:** Lighthouse CI on key routes before pilot launch.

---

## Availability

### NFR-A01 — Uptime during service windows

| Environment | Target | Window |
|-------------|--------|--------|
| Production (pilot) | 99.5% monthly | Weekday AM/PM school service hours (local TZ) |
| Staging | Best effort | — |

**Exclusions:** Planned maintenance announced 24h ahead; upstream outages (Vercel, Supabase, Firebase) documented in status comms.

**Verification:** Uptime monitor on `/api/health` and dashboard root.

---

### NFR-A02 — Graceful degradation

| Failure | Expected behavior |
|---------|-------------------|
| Maps API unavailable | Route optimization returns clear error; manual route still savable |
| Realtime disconnect | Dashboard shows "reconnecting"; falls back to last known position + timestamp |
| Notification provider down | Event queued or logged; retry with backoff; admin alert after N failures |
| Supabase brief outage | Driver offline queue retains check-ins (NFR-O01) |

**Verification:** Chaos test: disable Maps key in staging; confirm user-facing message.

---

## Security

### NFR-S01 — Authentication and session

| Requirement | Detail |
|-------------|--------|
| Driver / Guardian auth | Firebase phone OTP minimum |
| Admin auth | Phone or LINE; email optional |
| Session transport | HTTP-only cookies, `Secure`, `SameSite=Lax` or `Strict` |
| Session expiry | Configurable; default 7 days with refresh |
| Middleware | Protect `/dashboard`, `/parent`, `/api/*` except public auth routes |

**Verification:** Unauthenticated request to `/api/trips` returns 401.

---

### NFR-S02 — Tenant isolation (RLS)

| Requirement | Detail |
|-------------|--------|
| RLS enabled | All tenant tables |
| Cross-tenant test | Org A user cannot read/write org B rows — 0 leaks |
| Guardian scope | Only `passenger_guardians` link rows visible |
| SuperAdmin | No default SELECT on passenger PII |

**Verification:** Automated two-org test suite in CI — **release blocker**.

---

### NFR-S03 — API hardening

| Requirement | Detail |
|-------------|--------|
| Rate limiting | 10 req/min per IP on public routes (F20) |
| Input validation | Zod schemas on all API bodies (`packages/shared`) |
| Error responses | No stack traces or secrets in client JSON |
| CSRF | SameSite cookies + POST for mutations |
| SQL injection | Parameterized queries via Supabase client only |
| XSS | React escaping; CSP headers on web |
| ID generation | `crypto.randomUUID()` for resource IDs |

**Verification:** OWASP spot check; rate limit returns 429 on 11th request.

---

### NFR-S04 — Data protection

| Requirement | Detail |
|-------------|--------|
| Transit encryption | TLS 1.2+ everywhere |
| At rest | Provider defaults (Supabase, Storage) |
| Photo storage | Private bucket; signed URLs TTL ≤ 15 min |
| Secrets | `.env` gitignored; `scripts/check-secrets.sh` before commit |
| PII minimization | Guardian sees linked passengers only |

**Reference:** [Regulatory compliance](../research/regulatory-compliance.md)

---

### NFR-S05 — Audit and logging

| Requirement | Detail |
|-------------|--------|
| Audit log | All mutations on fleet entities, routes, trips, users (F12) |
| Log fields | actor, org, action, entity, timestamp |
| Retention | Minimum 90 days pilot; configurable later |
| No sensitive logs | Passwords, tokens, full OTP not logged |

---

## Offline Tolerance

### NFR-O01 — Driver check-in queue

| Requirement | Detail |
|-------------|--------|
| Local storage | IndexedDB queue in driver PWA |
| Queued events | Check-in, check-out, trip start/end |
| Sync trigger | `online` event + periodic retry |
| Idempotency | Client-generated UUID per event |
| UI feedback | Pending count badge; sync success/failure toast |
| Max queue size | 100 events (alert driver if exceeded) |

**Verification:** Airplane mode check-in → reconnect → admin sees event.

---

### NFR-O02 — PWA caching

| Requirement | Detail |
|-------------|--------|
| Service worker | Cache app shell for driver and guardian |
| Offline page | `offline.html` fallback |
| Stale map tiles | Show last position with stale indicator |

**Verification:** Load driver app offline → shell renders → queue works.

---

## Scalability (Pilot Scale)

### NFR-SC01 — Concurrency assumptions

v1 sized for **pilot**, not national scale:

| Dimension | Pilot target | Notes |
|-----------|--------------|-------|
| Organizations | 1–10 | Multi-tenant ready |
| Concurrent active trips | 20 | Realtime channels |
| GPS writes per trip | 1 per 5 s | ~12/min/vehicle |
| Passengers per org | 500 | Index hot paths |
| Guardians per org | 600 | Notification fanout |

**Bottleneck watch:** Supabase Realtime connections, Maps API quota, notification rate limits.

**Verification:** Staging soak: 10 trips × 1 hour GPS broadcast.

---

## Maintainability

### NFR-M01 — Developer experience

| Requirement | Target |
|-------------|--------|
| Clone to running localhost | < 30 minutes (documented) |
| Type-check | `pnpm type-check` passes on CI |
| Lint | `pnpm lint` passes on CI |
| Monorepo | pnpm workspaces; shared types in `packages/shared` |
| Migrations | Incremental SQL in `supabase/migrations/` |

**Verification:** New developer timed onboarding during pilot prep.

---

## Accessibility

### NFR-AC01 — Baseline a11y

| Requirement | Detail |
|-------------|--------|
| Keyboard navigation | Dashboard forms and tables operable |
| Focus indicators | Visible on interactive elements |
| Color contrast | WCAG AA on shadcn/ui defaults |
| Driver UI | Large touch targets ≥ 44px |
| Screen readers | Labels on form inputs; map has text fallback for ETA |

**Verification:** Lighthouse accessibility ≥ 95 on dashboard; manual VoiceOver spot check on driver check-in.

---

## NFR Verification Checklist (Release)

Before pilot launch:

- [ ] NFR-P01: Optimization benchmark ≤ 2s for 50 stops
- [ ] NFR-P02: Realtime latency measured < 100ms p95 in staging
- [ ] NFR-P03: Notification blast < 30s p95
- [ ] NFR-P04: Lighthouse thresholds on dashboard
- [ ] NFR-S02: Two-tenant RLS suite green in CI
- [ ] NFR-S03: Rate limit + Zod validation on public APIs
- [ ] NFR-O01: Offline check-in sync demonstrated
- [ ] NFR-M01: SETUP doc onboarding timed ≤ 30 min
- [ ] Secrets scan script passes on repo

---

## Traceability

| NFR | Related features |
|-----|------------------|
| NFR-P01 | F05 |
| NFR-P02 | F07, F08 |
| NFR-P03 | F11, F13, F14 |
| NFR-S02 | F01, F02 |
| NFR-S03 | F20 |
| NFR-O01 | F18 |
| NFR-S05 | F12 |

| NFR | Discovery reference |
|-----|---------------------|
| NFR-P02, P03 | [Success criteria](../discovery/success-criteria.md) measurable thresholds |
| NFR-S02 | [Assumptions A8, R4](../discovery/assumptions-and-risks.md) |

---

## Related Documents

- [MVP features](mvp-features.md)
- [PRD](prd.md)
- [Out of scope](out-of-scope.md)
- [Regulatory compliance](../research/regulatory-compliance.md)
