# Positioning and Feature Priorities

Research outputs that close market analysis: the positioning statement, messaging framework, and MVP feature priority list informed by [competitor gaps](competitor-matrix.md) and [discovery pains](../discovery/pain-points.md).

**Research date:** June 2026  
**Status:** Complete — ready for product requirements

---

## Positioning Statement

> **CMT Fleet Transit is the operations control plane for SMB passenger fleet vendors — the platform that unifies route optimization, live tracking, verified check-ins, and guardian notifications so operators stop running on spreadsheets and parents stop calling to ask where the bus is.**

### Fill-in-the-blank form

| Template | Answer |
|----------|--------|
| **CMT Fleet Transit is the** | multi-tenant operations control plane |
| **for** | small and mid-size passenger fleet vendors (school buses, corporate shuttles) |
| **that** | plan smarter routes, prove who boarded, and reach guardians on the channels they already use |
| **unlike** | district-only parent apps, hardware-heavy telematics, or optimization tools without a guardian layer |
| **we** | deliver Clarke-Wright routing, LINE/Telegram/FCM alerts, Postgres RLS, and a $0 pilot on a free-tier stack |

### One-line variants (by audience)

| Audience | Message |
|----------|---------|
| **Bus vendor Admin** | Run every school route from one dashboard — optimized stops, live map, attendance proof. |
| **School transport lead** | Give families a tracking app and notifications without a $10k district RFP. |
| **Guardian** | See the bus on a map and get a message when your child checks in — no more phone trees. |
| **Investor / portfolio** | B2B SaaS for the underserved SMB layer between WhatsApp chaos and enterprise Transfinder. |

---

## Category Definition

CMT Fleet Transit does **not** compete head-on in these categories:

| Category | Our relationship |
|----------|------------------|
| Enterprise school ERP (Transfinder) | Undercut on price and procurement friction |
| Hardware telematics (Samsara) | Software-only; passenger workflow, not asset dots |
| Delivery optimization (Route4Me) | Passenger + guardian, not package drops |
| District parent app (Here Comes the Bus) | Vendor-multi-tenant, not single-district |

**Category we own:** *SMB passenger fleet operations platform* — plan, run, prove, notify.

---

## Differentiation Pillars (Messaging)

From [differentiators.md](differentiators.md), ranked for sales conversations:

| Priority | Pillar | Proof point |
|----------|--------|-------------|
| 1 | **Unified ops + guardian** | One product replaces Sheets + WhatsApp + map links |
| 2 | **Capacity-aware routing** | Clarke-Wright + 2-opt; < 2s for 50 stops |
| 3 | **Regional messaging** | LINE + Telegram + FCM — not SMS-only |
| 4 | **Multi-tenant vendor SaaS** | One contractor account, many schools, RLS isolated |
| 5 | **$0 pilot** | Free-tier deploy; $25/vehicle after pilot |

---

## Feature Priority List

Priorities informed by market gaps (competitors weak on P1–P5 together) and [success criteria](../discovery/success-criteria.md).  
**P0** = MVP blocker | **P1** = v1 launch | **P2** = fast follow | **P3** = post-v1

### P0 — Must ship for school-bus proof

| # | Feature | Market gap | Pain |
|---|---------|------------|------|
| F01 | Multi-tenant org + RLS | Vendor SaaS | P7 |
| F02 | RBAC (5 roles) | Enterprise table-stakes | P5 |
| F03 | Schools, vehicles, drivers, passengers CRUD | DIY stack replacement | P6 |
| F04 | Route editor with stops | Every incumbent has; we need parity | P1 |
| F05 | Clarke-Wright optimization + distance cache | Route4Me has; parent apps don't | P1 |
| F06 | Trip schedule + driver/vehicle assign | Core ops workflow | P5 |
| F07 | Driver trip start/end + GPS stream | Telematics parity | P2 |
| F08 | Live dashboard map (realtime) | HCTB/BusWhere set bar | P2 |
| F09 | OTP check-in/out + GPS stamp | Samsara lacks; key differentiator | P4 |
| F10 | Guardian tracking view (scoped) | Parent app parity | P2, P3 |
| F11 | FCM notifications (pickup/dropoff) | Table-stakes | P3 |
| F12 | Audit log on mutations | Compliance / trust | P4 |

### P1 — v1 launch (differentiation + credibility)

| # | Feature | Market gap | Pain |
|---|---------|------------|------|
| F13 | LINE notification channel | SEA incumbents weak | P3 |
| F14 | Telegram notification channel | Community schools | P3 |
| F15 | Staff read-only monitoring role | OptimoRoute lacks role model | P5 |
| F16 | Basic reports (attendance, completion) | School buyer expectation | P4 |
| F17 | Delay + emergency templates | Beyond pickup/dropoff | P3 |
| F18 | Offline driver check-in queue | Field reality | P8 |
| F19 | Photo proof (org opt-in) | Rare in SMB tools | P4 |
| F20 | Rate limiting + input validation | Security credibility | P7 |

### P2 — Fast follow (60–90 days post-launch)

| # | Feature | Rationale |
|---|---------|-----------|
| F21 | Multi-school per org billing hooks | Vendor growth |
| F22 | Trip history for guardians | Retention |
| F23 | On-time performance report | School board asks |
| F24 | Geofencing proximity alerts | HCTB feature parity |
| F25 | Capacitor driver wrapper | iOS GPS limits |
| F26 | Bulk passenger CSV import | Onboarding speed |

### P3 — Explicitly out of v1 (per market research)

| Feature | Why defer | Competitor trap |
|---------|-----------|-----------------|
| Native iOS/Android store apps | PWA sufficient for pilot | Long build; doesn't win SMB |
| AI demand prediction | No data yet | Buzzword; Route4Me overclaims |
| White-label branding | Complexity | Enterprise custom deals |
| i18n / multi-locale | Single geography pilot | Distraction |
| SSO / SAML | IT gatekeeper post-sale | Transfinder moat area |
| SIS deep integration | Per-district sales | Enterprise cycle |
| Hardware telematics | Samsara's game | Capital intensive |

---

## Priority by Persona

| Persona | P0 features they need | P1 differentiators |
|---------|----------------------|-------------------|
| **Admin** | F03–F06, F05, F16 | F13–F14 notifications |
| **Staff** | F08 live board | F15 read-only RBAC |
| **Driver** | F07, F09 | F18 offline, F19 photo |
| **Guardian** | F10, F11 | F13 LINE, F22 history |
| **SuperAdmin** | F01, F02, F12 | — |

---

## Epic Backlog Preview (for PRD)

Grouped epics for the next documentation stage:

| Epic | Features | Priority |
|------|----------|----------|
| **E1 — Tenancy & auth** | F01, F02, F12 | P0 |
| **E2 — Fleet entities** | F03 | P0 |
| **E3 — Routes & optimization** | F04, F05 | P0 |
| **E4 — Trips & execution** | F06, F07 | P0 |
| **E5 — Check-in & attendance** | F09, F19 | P0 / P1 |
| **E6 — Live ops dashboard** | F08, F15 | P0 / P1 |
| **E7 — Guardian portal** | F10, F11, F22 | P0 / P2 |
| **E8 — Notifications** | F11, F13, F14, F17 | P0 / P1 |
| **E9 — Reports** | F16, F23 | P1 / P2 |
| **E10 — Field resilience** | F18 | P1 |
| **E11 — Security hardening** | F20 | P1 |

---

## GTM Priority (from research)

| Priority | Action | Timeline |
|----------|--------|----------|
| 1 | Secure one pilot bus vendor (5–15 vehicles) | Before GA |
| 2 | Price at $25/vehicle or $99 Starter | Launch |
| 3 | Lead with school-bus scenario in demos | All sales |
| 4 | SEA pilots: lead with LINE | Regional |
| 5 | Publish case study after 90-day pilot | Post-pilot |

Pricing detail: [pricing-model.md](pricing-model.md)

---

## Research Exit Checklist

| Exit criterion | Status |
|----------------|--------|
| Competitor matrix (features, pricing, tech, weaknesses) | ✓ [competitor-matrix.md](competitor-matrix.md) |
| Differentiators documented | ✓ [differentiators.md](differentiators.md) |
| Regulatory / compliance notes | ✓ [regulatory-compliance.md](regulatory-compliance.md) |
| Pricing model sketch | ✓ [pricing-model.md](pricing-model.md) |
| Positioning statement | ✓ Above |
| Feature priority list informed by market gaps | ✓ Above |

**Research complete.** Next stage: product requirements and MVP scope (PRD, user stories, wireframe sketches).

---

## Related Documents

- [Market landscape](market-landscape.md)
- [Competitor matrix](competitor-matrix.md)
- [Differentiators](differentiators.md)
- [Discovery success criteria](../discovery/success-criteria.md)
- [Discovery one-pager](../discovery/one-pager.md)
