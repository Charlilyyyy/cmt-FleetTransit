# Assumptions and Risks

Hypotheses that underpin CMT Fleet Transit and risks that could invalidate the product bet. Each item includes an early test so discovery does not proceed on faith alone.

---

## Assumption Summary

| ID | Assumption | Confidence | Test by |
|----|------------|------------|---------|
| A1 | School-bus operators feel routing + tracking pain acutely enough to switch tools | Medium | 3 operator interviews |
| A2 | Admins are the economic buyer; guardians are the renewal driver | Medium | Pilot signup interviews |
| A3 | A free-tier stack (Vercel, Supabase, Firebase) supports a credible pilot | High | Spike deploy + load smoke test |
| A4 | Drivers will use a smartphone PWA instead of demanding a native app | Medium | Driver usability session (5 users) |
| A5 | Guardians will install or bookmark a PWA for tracking | Medium | Guardian onboarding prototype test |
| A6 | Clarke-Wright + 2-opt meets real-world route quality expectations | Medium | Compare vs manual routes on 3 real datasets |
| A7 | Google Maps Distance Matrix accuracy is acceptable for stop ETAs | High | Benchmark 20 stop pairs vs ground truth |
| A8 | Row-level security can enforce tenant isolation without perf collapse | Medium | Two-tenant integration test suite |
| A9 | OTP + photo check-in is acceptable driver workflow (not too slow) | Medium | Timed field simulation |
| A10 | At least one notification channel (LINE, Telegram, or FCM) reaches guardians | High | Send test alerts to 10 numbers |
| A11 | Operators need multi-tenant SaaS, not single-school installs | Low–Medium | Sales conversations with 2 vendors |
| A12 | Regulatory pressure (attendance proof, data privacy) pushes digitization | Medium | Review contracts / local school requirements |

---

## Detailed Assumptions

### A1 — Operators will switch from spreadsheets and phone trees

**Belief:** Small and mid-size passenger transport operators are actively unhappy with manual coordination — not merely indifferent — and will invest time to onboard a new system if the school-bus scenario works on day one.

**If wrong:** Product is a nice-to-have; churn will be high after pilot curiosity fades. Sales cycle requires pain quantification (fuel waste, staff hours) we cannot demonstrate.

**Early test:** Interview three transport coordinators or school bus admins. Ask them to walk through last week's exception handling. Score pain 1–5 on routing, tracking, and guardian calls.

---

### A2 — Admin buys; guardian validates

**Belief:** Budget authority sits with the operator Admin or school transport lead. Guardian satisfaction drives renewals and word-of-mouth but rarely initiates procurement.

**If wrong:** We optimize guardian UX while missing procurement requirements (SIS integration, invoicing, contract SLAs).

**Early test:** Ask pilot prospects: "Who signs the contract?" and "What would make you cancel after 90 days?"

---

### A3 — Free-tier infrastructure is viable for pilot scale

**Belief:** Vercel, Supabase (free/pro), Firebase Auth, and Google Maps credits sustain one pilot org with ≤ 20 vehicles and ≤ 500 passengers without immediate paid upgrades.

**If wrong:** Unit economics fail before product-market fit; demo accounts hit rate limits mid-pilot.

**Early test:** Deploy staging stack; simulate 10 concurrent trips with GPS every 5s for 1 hour. Monitor DB size, realtime connections, and Maps API quota.

---

### A4 — Drivers accept a mobile web experience

**Belief:** Drivers already use smartphones daily; a well-designed PWA (large targets, offline queue) is sufficient for v1 without App Store distribution.

**If wrong:** Adoption stalls on "install the app" friction; IT policies block browsers; background GPS is unreliable on iOS Safari.

**Early test:** Five drivers complete a scripted trip on a test device. Measure: time to start trip, check-in errors, background tab GPS dropouts.

---

### A5 — Guardians will use a tracking link or PWA

**Belief:** Families prefer a map and push alerts over calling the school, provided onboarding is one SMS or LINE message with a deep link.

**If wrong:** Guardian portal sees < 30% activation; notification value is lost; support load unchanged.

**Early test:** Prototype onboarding with 10 parents. Track: link opened, tracking page session > 30s, notification opt-in rate.

---

### A6 — Heuristic route optimization is good enough

**Belief:** Clarke-Wright Savings with 2-opt improvement produces routes admins accept as "better than manual" for ≤ 50 stops, without exact VRP solvers or ML.

**If wrong:** Admins override every optimized route; differentiation claim (smart routing) fails.

**Early test:** Take three historical routes; run optimizer; compare total distance and admin blind review (prefer A or B).

---

### A7 — Maps API estimates are trustworthy

**Belief:** Distance Matrix results within ~10% of driven time are adequate for guardian ETAs and planning.

**If wrong:** ETAs systematically wrong → guardian distrust worse than no app.

**Early test:** Log 20 stop pairs during pilot week; compare predicted vs actual leg duration.

---

### A8 — Multi-tenant RLS is secure and performable

**Belief:** Supabase row-level security policies per org and role prevent cross-tenant reads/writes at scale relevant to v1.

**If wrong:** Security incident or subtle data leak ends pilot; perf degrades with policy complexity.

**Early test:** Automated tests: user in org A attempts read/write on org B entities — expect 403 or empty. Load test hot queries (trips by date, locations by trip).

---

### A9 — Check-in workflow is fast enough at the curb

**Belief:** OTP entry + optional photo adds ≤ 15 seconds per passenger at a stop — acceptable vs paper list.

**If wrong:** Drivers skip verification; attendance data remains unreliable.

**Early test:** Timed simulation: 8 passengers boarding at one stop, connectivity on and off.

---

### A10 — Notification channels reach guardians reliably

**Belief:** At least one of Telegram, LINE, or FCM achieves > 95% delivery to pilot guardians within 30 seconds under normal conditions.

**If wrong:** Core value prop (families know immediately) fails; phone calls continue.

**Early test:** Blast test messages to 10 guardian devices across channels; measure delivery latency and failure reasons.

---

### A11 — B2B multi-tenant SaaS is the right delivery model

**Belief:** Operators want vendor-hosted software serving multiple schools, not on-prem or per-school installs.

**If wrong:** Build multi-tenancy complexity before market wants single-tenant deployments.

**Early test:** Two sales conversations: "Hosted multi-school platform vs install per school — which do you prefer and why?"

---

### A12 — Compliance tailwinds exist

**Belief:** Schools and child transport programs increasingly require digital attendance evidence and controlled guardian communication.

**If wrong:** Spreadsheet status quo persists; sales require custom compliance features not in v1.

**Early test:** Review one school transport contract and one local guideline for bus attendance / communication.

---

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R1 | No pilot school commits | Medium | High | Pre-sell before build complete; offer free pilot term | Product |
| R2 | Google Maps API cost overrun | Medium | Medium | LRU cache, batch matrix calls, monitor quotas | Engineering |
| R3 | iOS PWA GPS limitations | High | Medium | Document constraints; Capacitor path if pilot is iOS-heavy | Engineering |
| R4 | RLS policy bug leaks tenant data | Low | Critical | Mandatory two-tenant test suite in CI | Engineering |
| R5 | Driver resistance to photo check-in | Medium | Medium | Make photo optional per org policy; show legal value | Product |
| R6 | Guardian low activation | Medium | High | LINE/Telegram deep links; school mandates portal signup | Product |
| R7 | Incumbent competitor discount wins deal | Medium | Medium | Emphasize guardian UX + optimization + free-tier TCO | GTM |
| R8 | Offline sync conflicts or data loss | Medium | High | Idempotent check-in IDs; conflict resolution rules | Engineering |
| R9 | Child photo storage compliance | Medium | High | Org retention policy, encrypted storage, consent flow | Legal / Product |
| R10 | Realtime latency misses 100ms target | Low | Medium | Supabase channel tuning; fallback polling on dashboard | Engineering |
| R11 | Scope creep before school-bus scenario ships | High | High | Hold [success-criteria.md](success-criteria.md) as gate; defer non-MVP | Product |
| R12 | Firebase / LINE regional auth friction | Medium | Medium | Support email fallback; document regional setup | Engineering |

---

## Risks to Test First (Before Heavy Build)

Priority order — invalidating any of these should trigger a pause or pivot:

1. **R1 — Pilot commitment** — Without one real operator, discovery success is theoretical.
2. **R4 — Tenant isolation** — Security failure is non-recoverable for B2B SaaS.
3. **A4 / R3 — Driver mobile reality** — If field workflow fails, the product does not run.
4. **A5 / R6 — Guardian activation** — If families do not use tracking, renewal story collapses.
5. **A6 — Optimization quality** — If routing is not a differentiator, positioning weakens vs telematics-only tools.

### Suggested 2-week validation sprint

| Week | Activity | Pass / fail signal |
|------|----------|-------------------|
| 1 | 3 operator interviews + 1 school contract review | Average pain score ≥ 4/5 on core pains |
| 1 | RLS spike with two test orgs | Zero cross-tenant reads in test matrix |
| 2 | Driver + guardian prototype sessions | ≥ 4/5 drivers complete trip; ≥ 60% guardians open tracking |
| 2 | Optimizer benchmark on 3 routes | ≥ 2/3 routes preferred or tied with manual |

---

## Assumption Invalidation → Action

| Trigger | Action |
|---------|--------|
| Pain scores < 3/5 in interviews | Narrow niche (e.g. corporate shuttles only) or stop |
| No pilot LOI within 30 days | Extend discovery; do not scale engineering |
| Cross-tenant data in RLS tests | Block release until fixed; security review |
| Drivers cannot complete check-in flow | Redesign driver UI before dashboard investment |
| Guardian activation < 40% | Partner with school mandatory comms channel |
| Optimizer loses blind review on all 3 routes | Investigate constraints input or algorithm upgrade |

---

## Open Questions

Questions to resolve during market research (next discovery stage):

- Per-org vs per-vehicle vs per-seat pricing tolerance?
- Which notification channel dominates in target geography (LINE vs Telegram vs SMS)?
- Required SIS or HR integrations for school and corporate segments?
- Minimum report formats for school board or employer clients?
- Insurance or liability requirements for stored check-in photos?

---

## Related Documents

- [Success criteria](success-criteria.md)
- [Pain points](pain-points.md)
- [One-pager](one-pager.md)
