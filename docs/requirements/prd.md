# Product Requirements Document (PRD)

**Product:** CMT Fleet Transit  
**Version:** 1.0 (MVP)  
**Status:** Draft  
**Last updated:** 2026-06-29  
**Owner:** Product

---

## 1. Executive Summary

CMT Fleet Transit is a multi-tenant B2B SaaS platform for passenger fleet operations. v1 targets **school-bus vendors** running 5–30 vehicles: admins plan and optimize routes, drivers execute trips with GPS and verified check-ins, staff monitor live operations, and guardians track linked passengers with automated notifications.

This PRD locks MVP scope before architecture and implementation. Detailed stories, features, NFRs, backlog, and wireframes live in sibling documents under [`docs/requirements/`](.).

---

## 2. Problem Statement

Transport operators coordinate daily passenger runs with spreadsheets, phone calls, and informal messaging. Dispatch lacks live visibility; drivers use stale manifests; guardians call during delays; attendance disputes lack proof.

**Reference:** [Problem statement](../discovery/problem-statement.md)

---

## 3. Product Vision

> Unify plan → run → prove → notify in one multi-tenant platform so SMB passenger fleet vendors operate with enterprise-grade visibility at accessible cost.

**Positioning:** [Positioning and priorities](../research/positioning-and-priorities.md)

---

## 4. Goals and Non-Goals

### 4.1 Goals (v1)

| # | Goal | Success signal |
|---|------|----------------|
| G1 | Replace manual route planning for pilot org | Admin uses optimizer; driver receives digital stop list |
| G2 | Live trip visibility for ops and guardians | Map updates during active trip; guardian sees linked passenger only |
| G3 | Verifiable passenger check-in | OTP event with timestamp + GPS; optional photo per org policy |
| G4 | Automated guardian communication | Notification within 30s of check-in (FCM + LINE or Telegram) |
| G5 | Secure multi-tenant SaaS | RLS isolation; RBAC for five roles; audit log on mutations |
| G6 | Credible pilot on free-tier infra | One org runs school-bus scenario end to end |

### 4.2 Non-Goals (v1)

See [out-of-scope.md](out-of-scope.md). Summary: native store apps, AI demand prediction, white-label, i18n, SSO, deep SIS integration, hardware telematics.

---

## 5. Target Users

| Role | Description | PRD detail |
|------|-------------|------------|
| SuperAdmin | Platform operator | [User stories — SuperAdmin](user-stories.md#superadmin) |
| Admin | Org fleet manager (primary buyer) | [User stories — Admin](user-stories.md#admin) |
| Staff | Live monitoring, read-heavy | [User stories — Staff](user-stories.md#staff) |
| Driver | Field execution | [User stories — Driver](user-stories.md#driver) |
| Parent / Guardian | Linked passenger visibility | [User stories — Parent / Guardian](user-stories.md#parent--guardian) |

**Reference:** [Personas](../discovery/personas.md)

---

## 6. MVP Scope Summary

### In scope

| Domain | Capabilities |
|--------|--------------|
| **Tenancy & auth** | Organizations, users, five roles, Firebase phone + LINE login |
| **Fleet entities** | Schools, vehicles, drivers, passengers |
| **Routing** | Manual route editor, stops, Clarke-Wright optimization, capacity constraints |
| **Trips** | Schedule, assign driver/vehicle, status lifecycle |
| **Field ops** | Driver PWA: start trip, GPS stream, OTP check-in/out, offline queue |
| **Operations UI** | Dashboard: live map, entity CRUD, trip monitoring |
| **Guardian portal** | Tracking view, trip history (linked passengers), notifications |
| **Notifications** | FCM + LINE + Telegram templates (pickup, dropoff, delay, emergency) |
| **Reports & audit** | Trip completion, attendance summary, audit log |

**Detail:** [mvp-features.md](mvp-features.md)

### Out of scope

**Detail:** [out-of-scope.md](out-of-scope.md)

---

## 7. Anchor Scenario

All acceptance testing traces to the **school-bus morning run**:

```
Admin sets up org → school → vehicle → driver → passengers → route
    → optimize stops → schedule trip → assign driver
Driver starts trip → GPS live → check-in passengers at stops
Guardian receives notification → views map
Staff monitors live board
Admin reviews attendance report + audit log
```

**Reference:** [Success criteria](../discovery/success-criteria.md)

---

## 8. Key User Journeys

| Journey | Primary role | Documents |
|---------|--------------|-----------|
| Onboard organization | SuperAdmin, Admin | [Wireframes — Admin setup](wireframes.md#admin-onboarding) |
| Plan and optimize route | Admin | [Wireframes — Route editor](wireframes.md#route-planning) |
| Execute morning trip | Driver | [Wireframes — Driver trip](wireframes.md#driver-trip) |
| Track child en route | Parent / Guardian | [Wireframes — Guardian tracking](wireframes.md#guardian-tracking) |
| Monitor fleet live | Staff | [Wireframes — Live dashboard](wireframes.md#live-dashboard) |

---

## 9. Functional Requirements Overview

Requirements are decomposed by role and feature area:

| Document | Contents |
|----------|----------|
| [user-stories.md](user-stories.md) | "As a [role], I want [action], so that [outcome]" per persona |
| [mvp-features.md](mvp-features.md) | Feature list with IDs (F01–F20) mapped to priorities |
| [mvp-backlog.md](mvp-backlog.md) | Epics E1–E11 with acceptance criteria |

Feature IDs align with [research priorities](../research/positioning-and-priorities.md#feature-priority-list).

---

## 10. Non-Functional Requirements

| Category | Summary |
|----------|---------|
| Performance | Route optimization < 2s (50 stops); GPS to dashboard < 100ms |
| Availability | Target 99.5% during school service windows (pilot) |
| Security | RLS, RBAC, CSP, rate limiting, secrets scan |
| Offline | Driver check-in queue with background sync |
| Privacy | Guardian scoped access; photo proof opt-in per org |

**Detail:** [non-functional-requirements.md](non-functional-requirements.md)

---

## 11. Compliance and Policy

| Topic | Requirement |
|-------|-------------|
| Child data | Passengers as records; guardians authenticate; no minor logins |
| Photo proof | Org-level toggle; default off at pilot |
| Data isolation | Tenant A cannot access tenant B data |
| Messaging | Guardian consent for notification channels |

**Reference:** [Regulatory compliance](../research/regulatory-compliance.md)

---

## 12. Dependencies and Integrations

| Service | Purpose |
|---------|---------|
| Supabase | Postgres, Realtime, Storage, RLS |
| Firebase | Phone auth, custom claims |
| Google Maps | Distance Matrix, Directions, map UI |
| Vercel | Web hosting |
| FCM / LINE / Telegram | Guardian notifications |

Architecture detail is defined in a subsequent documentation stage.

---

## 13. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| School-bus scenario completion | 100% of anchor steps pass in staging |
| Notification latency | < 30s p95 from check-in event |
| GPS realtime latency | < 100ms to dashboard |
| Guardian activation (pilot) | ≥ 60% of linked guardians open tracking |
| Cross-tenant data leak | 0 in automated RLS test suite |
| Local dev setup time | < 30 minutes from clone (documented) |

---

## 14. Release Criteria

MVP is releasable to pilot when:

- [ ] All P0 epics in [mvp-backlog.md](mvp-backlog.md) pass acceptance criteria
- [ ] Anchor scenario demo recorded end to end
- [ ] NFR checklist in [non-functional-requirements.md](non-functional-requirements.md) complete
- [ ] Compliance pilot checklist from [regulatory-compliance.md](../research/regulatory-compliance.md) satisfied
- [ ] One pilot organization identified with informal commitment

---

## 15. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep | [out-of-scope.md](out-of-scope.md) + change control on P0 only |
| iOS PWA GPS limits | Document constraints; Capacitor on P2 roadmap |
| Maps API cost | LRU cache; quota monitoring |
| RLS bug | Two-tenant CI tests mandatory |

**Reference:** [Assumptions and risks](../discovery/assumptions-and-risks.md)

---

## 16. Document Map

```
prd.md (this document)
    ├── user-stories.md
    ├── mvp-features.md
    ├── out-of-scope.md
    ├── non-functional-requirements.md
    ├── mvp-backlog.md
    └── wireframes.md
```

---

## 17. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-29 | Product | Initial MVP PRD |

---

## 18. Approvals

| Role | Name | Status | Date |
|------|------|--------|------|
| Product owner | _TBD_ | Draft | 2026-06-29 |
| Engineering lead | _TBD_ | Pending | — |
