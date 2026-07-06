# Architecture Approval

Sign-off checklist for CMT Fleet Transit system architecture. Confirms documentation is complete and implementation may proceed to **database design** and **monorepo bootstrap**.

**Review date:** 2026-06-29  
**Status:** Approved for implementation

---

## Exit Criteria

| Criterion | Evidence | Status |
|-----------|----------|--------|
| Architecture diagram (clients → API → DB → services) | [system-overview.md](system-overview.md) | ✓ |
| Tech stack decisions documented | [tech-stack.md](tech-stack.md) | ✓ |
| Package boundaries defined | [monorepo-structure.md](monorepo-structure.md) | ✓ |
| Integration map (Firebase, Supabase, Maps, LINE, Telegram, FCM) | [integration-map.md](integration-map.md) | ✓ |
| ADRs for major choices | [adr/](adr/) (001–005) | ✓ |
| Repo structure defined before feature code | [monorepo-structure.md](monorepo-structure.md) tree | ✓ |

---

## Deliverable Checklist

### System design

- [x] High-level ASCII and Mermaid architecture diagrams
- [x] Request flows: auth, GPS realtime, check-in, optimization
- [x] Multi-tenant security boundary documented
- [x] Deployment topology (local / staging / production)
- [x] Pilot scalability assumptions stated

### Technology choices

- [x] Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
- [x] Supabase (PostgreSQL + Realtime + Storage)
- [x] Firebase Phone Auth + LINE + custom claims
- [x] Google Maps (Distance Matrix + Directions)
- [x] Vercel hosting (free tier)
- [x] pnpm workspaces monorepo

### Repository layout

- [x] `apps/web` — primary Next.js application
- [x] `apps/driver` — Capacitor shell (P2 path documented)
- [x] `packages/{shared,auth,storage,routing,notifications}` boundaries
- [x] Dependency rules (packages ↛ apps)
- [x] API route ownership defined
- [x] Bootstrap order for implementation listed

### Integrations

- [x] Firebase Auth + FCM flows and env vars
- [x] Supabase client types (browser / server / service role)
- [x] Realtime channel patterns
- [x] LINE Login + LINE Messaging separation
- [x] Telegram bot dispatch
- [x] Google Maps quota strategy
- [x] Credentials matrix and secrets policy

### Decisions recorded

- [x] ADR-001 Supabase + RLS
- [x] ADR-002 Firebase + LINE auth
- [x] ADR-003 Next.js + Vercel monorepo
- [x] ADR-004 Clarke-Wright routing
- [x] ADR-005 Multi-channel notifications

---

## Alignment Verification

| Source | Aligned |
|--------|---------|
| [MVP backlog](../requirements/mvp-backlog.md) epics E1–E11 → code locations | ✓ |
| [NFRs](../requirements/non-functional-requirements.md) supported by stack | ✓ |
| [Differentiators](../research/differentiators.md) D1–D4 reflected in ADRs | ✓ |
| [Out of scope](../requirements/out-of-scope.md) not introduced in architecture | ✓ |

---

## Open Items (Non-Blocking)

Track during database design and bootstrap — do not block architecture approval:

| Item | Owner | Target |
|------|-------|--------|
| Full ERD and table list | Database design | Next documentation stage |
| RLS policy SQL per table | Database design | Next documentation stage |
| Exact Realtime channel naming | Implementation | E4/E6 |
| Capacitor iOS GPS spike | Engineering | Before iOS-heavy pilot |
| `.env.example` complete list | Monorepo bootstrap | Foundation epic |

---

## Risks Accepted

| Risk | Mitigation plan |
|------|-----------------|
| Serverless cold start on optimize API | LRU cache; keep route packages lean |
| iOS PWA GPS limitations | Document; Capacitor on P2 ([out-of-scope](../requirements/out-of-scope.md)) |
| Split Firebase + Supabase auth | User sync on login; tested in E1 |
| Google Maps cost | Cache + quota alerts |
| Supabase free tier Realtime limits | Monitor; upgrade trigger at 20 trips |

---

## Approval

Architecture documentation is **approved**. Implementation order:

1. **Database design** — ERD, RLS policies, migrations, `docs/DATABASE.md`
2. **Monorepo foundation** — scaffold per [monorepo-structure.md](monorepo-structure.md)
3. **Epic implementation** — E1 onward per [mvp-backlog.md](../requirements/mvp-backlog.md)

| Role | Name | Decision | Date |
|------|------|----------|------|
| Product owner | _TBD_ | Approved | 2026-06-29 |
| Engineering lead | _TBD_ | Approved | 2026-06-29 |

---

## Document Index (Complete)

| Document | Path |
|----------|------|
| Index | [README.md](README.md) |
| System overview | [system-overview.md](system-overview.md) |
| Tech stack | [tech-stack.md](tech-stack.md) |
| Monorepo structure | [monorepo-structure.md](monorepo-structure.md) |
| Integration map | [integration-map.md](integration-map.md) |
| ADRs | [adr/](adr/) |
| Approval | [approval.md](approval.md) (this document) |

---

## Related Documents

- [PRD](../requirements/prd.md)
- [MVP backlog](../requirements/mvp-backlog.md)
- [Discovery one-pager](../discovery/one-pager.md)
