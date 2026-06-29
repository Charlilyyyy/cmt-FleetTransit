# One-Pager

**CMT Fleet Transit** — discovery summary and decision record  
**Date:** 2026-06-29  
**Status:** Go — proceed to market research

---

## Problem

Passenger transport operators — schools, corporate shuttles, tour operators, and contracted fleet services — coordinate daily runs with spreadsheets, phone calls, and disconnected tools. Dispatchers cannot see vehicles live. Drivers follow stale paper manifests. Guardians call repeatedly during delays. Attendance disputes lack timestamped proof. The operation burns fuel, staff time, and trust.

---

## Solution

CMT Fleet Transit is a multi-tenant B2B SaaS platform that unifies route planning, live GPS tracking, verified passenger check-in/out, and automated guardian notifications in one system.

| Layer | What it delivers |
|-------|------------------|
| **Plan** | Capacity-aware routes with optimization and realistic ETAs |
| **Run** | Driver mobile workflow — start trip, GPS stream, OTP + photo check-in |
| **See** | Live dashboard for admins and staff; tracking view for guardians |
| **Tell** | Pickup, dropoff, and delay alerts via Telegram, LINE, or FCM |
| **Trust** | Tenant isolation, RBAC, and audit log for every mutation |

---

## Primary User

**Admin** — the transport coordinator or fleet program manager who plans routes, assigns trips, and answers the school when something goes wrong.

**Validation user:** **Parent / Guardian** — renewal and reputation depend on families trusting live visibility and timely notifications without calling the office.

---

## Core Value Proposition

> **CMT Fleet Transit is the operations control plane for passenger fleet runs — so operators stop coordinating blind and families stop calling to ask where the bus is.**

Differentiation vs generic fleet telematics: built for recurring multi-stop passenger routes, guardian-facing transparency, and school-grade attendance proof — not just GPS dots on a truck.

---

## v1 Proof Point

One school-bus morning run, end to end:

1. Admin creates fleet entities and optimizes a route  
2. Driver executes trip with live GPS and check-ins  
3. Guardian receives notification and sees the vehicle on a map  
4. Staff monitors all active trips without admin privileges  
5. Admin pulls attendance and audit report after completion  

Details: [success-criteria.md](success-criteria.md)

---

## Key Pains Addressed

| Pain | v1 response |
|------|-------------|
| Manual routing | Optimized stop order with capacity constraints |
| No live tracking | Realtime GPS on dashboard and guardian view |
| Poor guardian communication | Event-driven notifications (< 30s target) |
| Attendance gaps | OTP + photo check-in with GPS and timestamp |
| Multi-vehicle coordination | Unified live trip board per organization |

---

## Critical Assumptions (Must Validate in Research)

1. Operators score routing/tracking pain ≥ 4/5 — not mild inconvenience  
2. One pilot school or operator commits before full build  
3. Drivers complete PWA check-in flow in the field  
4. Guardians activate tracking (target ≥ 60% in prototype)  
5. RLS enforces zero cross-tenant data access  

Full list: [assumptions-and-risks.md](assumptions-and-risks.md)

---

## Go / No-Go Decision

### Decision: **GO**

Proceed to **market research and competitor analysis** after completing written discovery.

### Rationale

| Factor | Assessment |
|--------|------------|
| Problem severity | High — manual ops + guardian anxiety are daily, costly, and emotional |
| Market timing | Families expect digital visibility; affordable cloud stack makes v1 feasible |
| Differentiation path | Passenger-route optimization + guardian portal + multi-tenant RLS is underserved vs telematics-only tools |
| Scope clarity | School-bus anchor scenario is demonstrable and bounded |
| Risk awareness | Top risks (pilot commitment, RLS, field UX) have defined early tests |

### Conditions for continuing past research

- At least **3 operator interviews** confirm acute pain on core workflows  
- **Competitor matrix** shows a gap CMT Fleet Transit can own (not me-too GPS tracking)  
- **Letter of intent** or informal pilot commitment from one school or operator before production build  
- **No-go trigger:** If interviews score pain < 3/5 or no pilot interest in 30 days, pause and narrow segment or stop  

---

## What Happens Next

| Step | Output |
|------|--------|
| Competitor analysis | Feature, pricing, and weakness matrix |
| Positioning | "CMT Fleet Transit is the ___ for ___" statement |
| Regulatory notes | Child safety, photo proof, data privacy requirements |
| Pricing sketch | Per org / vehicle / seat model for B2B SaaS |
| Feature priority | MVP backlog informed by market gaps |

---

## Discovery Artifact Index

| Document | Link |
|----------|------|
| Problem statement | [problem-statement.md](problem-statement.md) |
| Personas | [personas.md](personas.md) |
| Pain points | [pain-points.md](pain-points.md) |
| Success criteria | [success-criteria.md](success-criteria.md) |
| Assumptions & risks | [assumptions-and-risks.md](assumptions-and-risks.md) |

---

## Sign-off

| Role | Name | Decision | Date |
|------|------|----------|------|
| Product owner | _TBD_ | Go | 2026-06-29 |
| Engineering lead | _TBD_ | Go — pending RLS spike | 2026-06-29 |

_Discovery complete. Next stage: market research._
