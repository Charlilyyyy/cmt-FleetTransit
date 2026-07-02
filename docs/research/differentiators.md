# Differentiators

What sets CMT Fleet Transit apart from incumbents in the [competitor matrix](competitor-matrix.md). Four technical and product differentiators are defensible for v1 and align with [discovery pains](../discovery/pain-points.md) competitors leave open.

---

## Differentiator Overview

| # | Differentiator | Pain addressed | Competitor gap |
|---|----------------|----------------|----------------|
| D1 | Clarke-Wright VRP + 2-opt optimization | P1 Manual routing | Parent apps lack VRP; telematics has no routing |
| D2 | Multi-channel notifications (Telegram, LINE, FCM) | P3 Poor parent communication | US-centric SMS/email only |
| D3 | Multi-tenant RLS (Postgres) | P7 Weak tenant isolation | District-first, not vendor SaaS |
| D4 | Free-tier deployable stack | GTM / pilot friction | Enterprise pricing, hardware bundles |

---

## D1 — Clarke-Wright VRP with 2-opt Improvement

### What it is

A **Vehicle Routing Problem (VRP)** solver using the **Clarke-Wright Savings Algorithm** to build capacity-feasible routes, followed by **2-opt** local search to shorten total distance. Distances come from **Google Maps Distance Matrix** with an **LRU cache** to control API cost.

```
Stops + depot + vehicle capacity
        │
        ▼
  Distance Matrix (cached)
        │
        ▼
  Clarke-Wright Savings  ──►  Initial routes per vehicle
        │
        ▼
  2-opt improvement      ──►  Shorter stop order
        │
        ▼
  Admin-approved route   ──►  Driver manifest
```

### Why it matters

| Benefit | Operator impact |
|---------|-----------------|
| Fewer miles vs manual ordering | Fuel and time savings on daily runs |
| Capacity never exceeded | Legal and safety compliance on school buses |
| Transparent heuristic | Admins understand *why* order changed — not a black-box AI claim |
| < 2s for 50 stops | Usable interactively in dashboard (per success criteria) |

### vs competitors

| Product | Routing approach | CMT Fleet Transit edge |
|---------|------------------|------------------------|
| Route4Me / OptimoRoute | Strong optimization | Adds guardian layer + school attendance — not delivery stops |
| Here Comes the Bus / BusWhere | No optimization | Operators still plan manually |
| Samsara | GPS only | No stop sequencing for passengers |
| Transfinder | Enterprise routing | Heavy procurement; less accessible to 10-bus vendors |

### Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Heuristic worse than manual on odd geographies | Admin override; benchmark on 3 real routes (discovery test) |
| Google API cost | LRU cache, batch requests, monitor quotas |
| "Not AI" perceived as weak | Position as *reliable and explainable* — SMB buyers prefer predictable |

---

## D2 — Multi-Channel Notifications (Telegram, LINE, FCM)

### What it is

Event-driven notification service supporting **three channels** from one template system:

| Channel | Typical use | Trigger examples |
|---------|-------------|------------------|
| **FCM** | Mobile push (parent PWA / app) | Pickup, dropoff, delay |
| **LINE** | Southeast Asia guardian messaging | Same templates, LINE Messaging API |
| **Telegram** | Community-heavy schools / groups | Bot messages per org config |

Templates are org-configurable: pickup, dropoff, delay, emergency.

```
Check-in / trip event
        │
        ▼
  notification-service
        │
   ┌────┼────┐
   ▼    ▼    ▼
  FCM  LINE  Telegram
```

### Why it matters

| Benefit | Who wins |
|---------|----------|
| Guardians reached on apps they already use | Parents in LINE-dominant markets |
| Operators avoid SMS per-message cost | Admin / vendor margin |
| Consistent wording per org | Compliance and brand trust |
| < 30s delivery target | Discovery success criteria |

### vs competitors

| Product | Channels | Gap |
|---------|----------|-----|
| Here Comes the Bus | Push + email | No LINE / Telegram |
| Transfinder | Email, SMS, some push | Regional messenger gaps |
| Samsara | Email, push (fleet alerts) | Not guardian pickup/dropoff focused |
| DIY WhatsApp | Informal groups | No audit trail, privacy leaks |

### Risks and mitigations

| Risk | Mitigation |
|------|------------|
| LINE / Telegram setup friction per org | Document onboarding in setup guide; default FCM fallback |
| Notification fatigue | Per-event toggles; org-level template control |
| Delivery failure on one channel | Retry + fallback channel in notification-service |

---

## D3 — Multi-Tenant Row-Level Security (RLS)

### What it is

**Supabase PostgreSQL** with **Row-Level Security** policies enforcing:

- Every data row scoped to an `organization_id`
- Role-based access: SuperAdmin, Admin, Staff, Driver, Parent / Guardian
- Guardians see **only linked passengers** — not routes, other children, or other orgs
- All mutations logged to `audit_logs`

```
                    ┌─────────────────┐
  Request ─────────►│ Auth + session  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  RBAC check     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Postgres RLS   │──► Tenant A ≠ Tenant B
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  audit_logs     │
                    └─────────────────┘
```

### Why it matters

| Benefit | Scenario |
|---------|----------|
| One vendor serves 12 schools | Each school's data isolated; one login for contractor admin |
| Guardian cannot browse other passengers | Child safety and privacy |
| Staff read-only without config access | Least privilege for dispatchers |
| B2B SaaS credibility | Procurement and security questionnaires |

### vs competitors

| Product | Tenancy model | Gap |
|---------|---------------|-----|
| Here Comes the Bus | District silo | Bus vendor serving N districts needs N deals |
| BusWhere | School / vendor paired | Weak multi-org contractor platform |
| Samsara | Org-level fleet | Not passenger/guardian scoped |
| Transfinder | District enterprise | Not SMB multi-tenant SaaS |

### Risks and mitigations

| Risk | Mitigation |
|------|------------|
| RLS policy bug → data leak | Mandatory two-tenant CI test suite (discovery priority risk) |
| Policy complexity hurts query perf | Indexes on `organization_id`, `trip_id`, hot paths |
| SuperAdmin overreach | Separate platform metadata vs tenant PII access |

---

## D4 — Free-Tier Deployable Stack

### What it is

A production-credible architecture deployable at **$0/month** for pilot scale:

| Layer | Service | Free-tier role |
|-------|---------|----------------|
| Frontend | Vercel | Next.js 14 hosting |
| Database + Realtime + Storage | Supabase | Postgres, subscriptions, file uploads |
| Auth | Firebase | Phone auth, custom claims |
| Maps | Google Cloud | Distance Matrix + Directions ($200 credit) |
| Notifications | Telegram / LINE / FCM | API free tiers within pilot volume |

Monorepo: `pnpm` workspaces — `apps/web`, `apps/driver`, `packages/{auth,storage,routing,notifications,shared}`.

### Why it matters

| Benefit | Impact |
|---------|--------|
| $0 pilot for first school | Removes procurement blocker for 5–20 vehicle vendors |
| Founder / solo team viable | Bootstrap without infra invoice before revenue |
| Portfolio / demo deploy | Live URL for investors and pilot prospects |
| Margin at scale | Paid tiers only when quotas exceeded |

### vs competitors

| Competitor pattern | CMT Fleet Transit edge |
|--------------------|------------------------|
| $10k+ annual district contracts | Month-to-month or per-vehicle after pilot |
| Hardware + per-vehicle telematics | Software on phones drivers already own |
| No self-host path | Clone → `.env` → deploy documented in < 30 min |

### Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Quota exhaustion mid-pilot | Monitoring dashboard; upgrade path documented |
| Free-tier not "enterprise" enough | Security checklist + RLS audit for credibility |
| Vendor lock-in concern | Standard Postgres; export scripts in runbook |

---

## Combined Differentiator Story

No single feature wins alone. The **bundle** is the moat for SMB passenger transport:

```
┌─────────────────────────────────────────────────────────┐
│  Plan smarter (D1)                                      │
│  Run on phones, no hardware tax (D4)                    │
│  Prove who boarded (RLS + check-in, D3)                 │
│  Tell guardians on LINE/Telegram/FCM (D2)               │
│  Serve many schools from one vendor account (D3)        │
└─────────────────────────────────────────────────────────┘
```

**Sales narrative:** _"The operations platform for passenger fleet vendors — optimize routes, prove attendance, and reach parents on the apps they already use — without enterprise pricing or GPS hardware."_

---

## Differentiators NOT Claimed (Honesty Boundary)

Avoid overpromising in positioning:

| Not a v1 claim | Why |
|----------------|-----|
| "AI-powered" routing | Heuristic VRP is explainable, not ML |
| Cheapest at infinite scale | Free-tier has limits; enterprise scale needs paid tiers |
| Full SIS integration | Post-v1; school roster import is enough for pilot |
| Native app store presence | PWA-first; Capacitor optional |
| Global compliance certification | Document controls; formal SOC2 is post-revenue |

---

## Validation Checklist

| Differentiator | How to prove before GA |
|----------------|------------------------|
| D1 | Blind route review ≥ 2/3 preferred vs manual on 3 datasets |
| D2 | 10 guardian test messages per channel; < 30s p95 |
| D3 | Zero cross-tenant reads in automated test matrix |
| D4 | Staging deploy on free tier; 10 concurrent trips 1 hour |

---

## Related Documents

- [Competitor matrix](competitor-matrix.md)
- [Regulatory compliance](regulatory-compliance.md)
- [Pricing model](pricing-model.md)
- [Positioning & priorities](positioning-and-priorities.md)
