# MVP Backlog

Signed-off epic backlog for CMT Fleet Transit v1. Each epic maps to features in [mvp-features.md](mvp-features.md) and stories in [user-stories.md](user-stories.md).

**Priority:** P0 = school-bus proof blocker | P1 = launch credibility

---

## Backlog Summary

| Epic | Name | Features | Priority | Status |
|------|------|----------|----------|--------|
| E1 | Tenancy & auth | F01, F02, F12 | P0 | Not started |
| E2 | Fleet entities | F03 | P0 | Not started |
| E3 | Routes & optimization | F04, F05 | P0 | Not started |
| E4 | Trips & execution | F06, F07 | P0 | Not started |
| E5 | Check-in & attendance | F09, F19 | P0 / P1 | Not started |
| E6 | Live ops dashboard | F08, F15 | P0 / P1 | Not started |
| E7 | Guardian portal | F10 | P0 | Not started |
| E8 | Notifications | F11, F13, F14, F17 | P0 / P1 | Not started |
| E9 | Reports | F16 | P1 | Not started |
| E10 | Field resilience | F18 | P1 | Not started |
| E11 | Security hardening | F20 | P1 | Not started |

---

## E1 — Tenancy & Auth

**Goal:** Secure multi-tenant foundation with five roles and audit trail.

**Features:** F01, F02, F12  
**Stories:** US-SA-01 – 07, US-AD-05, US-AD-19  
**NFRs:** NFR-S01, NFR-S02, NFR-S05

### Acceptance criteria

- [ ] **E1-AC1** SuperAdmin can create organization and assign first Admin
- [ ] **E1-AC2** SuperAdmin can deactivate organization; users lose login access
- [ ] **E1-AC3** RLS test suite: org A user receives zero rows on org B `passengers` SELECT
- [ ] **E1-AC4** Each role redirects to correct home after login (dashboard, parent, driver)
- [ ] **E1-AC5** Unauthorized API call returns 401/403 without body data leak
- [ ] **E1-AC6** Mutation on school/route/trip writes `audit_logs` row with actor_id and timestamp
- [ ] **E1-AC7** Firebase phone OTP login works for Driver and Guardian test accounts

### Dependencies

None — first epic to implement.

---

## E2 — Fleet Entities

**Goal:** Admin can configure schools, vehicles, drivers, and passengers.

**Features:** F03  
**Stories:** US-AD-01 – US-AD-04  
**NFRs:** NFR-P01, NFR-S03

### Acceptance criteria

- [ ] **E2-AC1** Admin CRUD school with name and address; appears in org-scoped list only
- [ ] **E2-AC2** Admin CRUD vehicle with `seat_capacity` ≥ 1; validation rejects zero
- [ ] **E2-AC3** Admin CRUD driver linked to user account with Driver role
- [ ] **E2-AC4** Admin CRUD passenger with school, default stop, guardian contact link
- [ ] **E2-AC5** List views support search by name with pagination (≥ 50 passengers)
- [ ] **E2-AC6** Delete or deactivate passenger with check-in history uses soft status, not hard delete

### Dependencies

E1

---

## E3 — Routes & Optimization

**Goal:** Admin plans routes with map stops and runs optimizer.

**Features:** F04, F05  
**Stories:** US-AD-06 – US-AD-09  
**NFRs:** NFR-P01

### Acceptance criteria

- [ ] **E3-AC1** Admin adds ≥ 5 stops on map picker; saves route with stop sequence
- [ ] **E3-AC2** Admin manually reorders stops before and after optimization
- [ ] **E3-AC3** `POST /api/routes/optimize` returns ordered stops with per-leg distance/duration
- [ ] **E3-AC4** Optimizer respects vehicle `seat_capacity` (passenger count ≤ capacity)
- [ ] **E3-AC5** 50-stop fixture optimizes in < 2s p95 in benchmark test
- [ ] **E3-AC6** Invalid coordinates return 400 with Zod validation message (no stack trace)

### Dependencies

E2 (vehicles, passengers for capacity)

---

## E4 — Trips & Execution

**Goal:** Schedule trips and execute with GPS streaming.

**Features:** F06, F07  
**Stories:** US-AD-10 – 13, US-DR-01 – 04, US-DR-09  
**NFRs:** NFR-P02

### Acceptance criteria

- [ ] **E4-AC1** Admin schedules trip: route + driver + vehicle + date; status `scheduled`
- [ ] **E4-AC2** Admin reassigns driver on `scheduled` trip; new driver sees assignment
- [ ] **E4-AC3** Driver sees only own trips for current service date
- [ ] **E4-AC4** Driver starts trip → status `active`; GPS writes begin every ≤ 5s
- [ ] **E4-AC5** Driver ends trip → status `completed`; GPS writes stop
- [ ] **E4-AC6** Location rows include trip_id, lat, lng, recorded_at
- [ ] **E4-AC7** Realtime subscriber receives position < 100ms p95 in staging measurement

### Dependencies

E2, E3

---

## E5 — Check-In & Attendance

**Goal:** Verified passenger boarding with OTP and optional photo.

**Features:** F09, F19  
**Stories:** US-DR-05 – 07  
**NFRs:** NFR-P03

### Acceptance criteria

- [ ] **E5-AC1** Valid OTP at check-in creates event with GPS and timestamp
- [ ] **E5-AC2** Invalid OTP shows error; no check-in row created
- [ ] **E5-AC3** Check-out records separate event type at dropoff stop
- [ ] **E5-AC4** Successful check-in triggers notification pipeline (E8)
- [ ] **E5-AC5** Org `photo_proof_required=false` → OTP only path works
- [ ] **E5-AC6** Org `photo_proof_required=true` → photo uploaded to private storage with metadata
- [ ] **E5-AC7** Guardian and Admin can view photo via signed URL; unauthorized user 403

### Dependencies

E4 (active trip)

---

## E6 — Live Ops Dashboard

**Goal:** Admin and Staff monitor all active trips on one map.

**Features:** F08, F15  
**Stories:** US-AD-13, US-ST-01 – 05  
**NFRs:** NFR-P02, NFR-P04

### Acceptance criteria

- [ ] **E6-AC1** Dashboard map shows marker per active trip with last position
- [ ] **E6-AC2** Trip list panel shows route name, driver, status, last update time
- [ ] **E6-AC3** Realtime update moves marker without full page refresh
- [ ] **E6-AC4** Staff user sees dashboard but no Create/Delete on schools or routes
- [ ] **E6-AC5** Staff POST to create school returns 403
- [ ] **E6-AC6** Empty state when no active trips; loading skeleton on fetch
- [ ] **E6-AC7** Lighthouse performance ≥ 95 on dashboard overview (desktop)

### Dependencies

E4

---

## E7 — Guardian Portal

**Goal:** Guardians track linked passengers only.

**Features:** F10  
**Stories:** US-PA-01, US-PA-02, US-PA-07  
**NFRs:** NFR-S02, NFR-S04

### Acceptance criteria

- [ ] **E7-AC1** Guardian login shows only linked passengers on home
- [ ] **E7-AC2** Active trip: map displays vehicle position for child's route
- [ ] **E7-AC3** Guardian A cannot API-fetch Guardian B passenger data (RLS)
- [ ] **E7-AC4** No admin navigation links visible on parent layout
- [ ] **E7-AC5** ETA or last-updated timestamp shown when GPS available
- [ ] **E7-AC6** Lighthouse accessibility ≥ 95 on tracking page

### Dependencies

E4, E1

---

## E8 — Notifications

**Goal:** Event-driven alerts on FCM, LINE, and Telegram.

**Features:** F11, F13, F14, F17  
**Stories:** US-AD-14 – 15, US-PA-03 – 04, US-PA-06  
**NFRs:** NFR-P03

### Acceptance criteria

- [ ] **E8-AC1** Pickup template sent on check-in via FCM in staging
- [ ] **E8-AC2** Dropoff template sent on check-out
- [ ] **E8-AC3** Delivery < 30s p95 from check-in event in integration test
- [ ] **E8-AC4** Admin edits template text per org; variables substituted correctly
- [ ] **E8-AC5** LINE channel delivers test message when org credentials configured
- [ ] **E8-AC6** Telegram bot delivers test message when org token configured
- [ ] **E8-AC7** Admin manual delay broadcast reaches linked guardians
- [ ] **E8-AC8** Emergency template flagged high priority in provider payload

### Dependencies

E5 (check-in events)

---

## E9 — Reports

**Goal:** Basic operational reports for admins and staff.

**Features:** F16  
**Stories:** US-AD-17 – 18, US-ST-06  
**NFRs:** NFR-P01

### Acceptance criteria

- [ ] **E9-AC1** Trip completion report filters by date range; shows status counts
- [ ] **E9-AC2** Attendance report lists passengers with check-in/out times per trip
- [ ] **E9-AC3** On-time summary compares scheduled vs actual trip start (best effort)
- [ ] **E9-AC4** Staff can view reports; cannot export audit log (Admin only) — optional split
- [ ] **E9-AC5** Report query p95 < 500ms for org with 500 passengers

### Dependencies

E4, E5

---

## E10 — Field Resilience

**Goal:** Driver operates through brief connectivity loss.

**Features:** F18  
**Stories:** US-DR-08  
**NFRs:** NFR-O01, NFR-O02

### Acceptance criteria

- [ ] **E10-AC1** Check-in offline queues in IndexedDB with client UUID
- [ ] **E10-AC2** On reconnect, queued events sync to server without duplicate rows
- [ ] **E10-AC3** UI shows pending sync count while queue non-empty
- [ ] **E10-AC4** Service worker serves driver app shell offline
- [ ] **E10-AC5** `offline.html` displays when network and cache both unavailable

### Dependencies

E5

---

## E11 — Security Hardening

**Goal:** Production-grade API and app security baselines.

**Features:** F20  
**NFRs:** NFR-S03, NFR-S04

### Acceptance criteria

- [ ] **E11-AC1** Public API returns 429 after 10 requests in 1 minute per IP
- [ ] **E11-AC2** All API routes validate body with Zod; invalid input returns 400
- [ ] **E11-AC3** CSP headers present on web responses
- [ ] **E11-AC4** `scripts/check-secrets.sh` passes on clean repo
- [ ] **E11-AC5** No `NEXT_PUBLIC_` secrets for sensitive keys in codebase
- [ ] **E11-AC6** Error JSON never includes stack trace in production

### Dependencies

E1 (can run in parallel with feature epics)

---

## Implementation Order

Recommended sequence for solo/small team:

```
E1 → E2 → E3 → E4 → E6 → E7
              ↘ E5 → E8
E4 → E9 (after E5)
E5 → E10
E11 (continuous, finalize before pilot)
```

**Milestone M1 — School-bus proof (P0):** E1–E7 + E8-AC1–AC3 complete  
**Milestone M2 — Launch ready (P1):** E8–E11 complete

---

## Anchor Scenario Sign-Off

| Step | Epics | Sign-off AC |
|------|-------|-------------|
| Admin setup chain | E1, E2 | E2-AC1 – AC4 |
| Route optimize | E3 | E3-AC3 – AC5 |
| Schedule trip | E4 | E4-AC1 |
| Driver GPS | E4 | E4-AC4 – AC7 |
| Check-in + notify | E5, E8 | E5-AC1, E8-AC3 |
| Guardian map | E7 | E7-AC2 |
| Staff monitor | E6 | E6-AC1 – AC3 |
| Admin report | E9 | E9-AC2 |

---

## Backlog Approval

| Role | Name | Status | Date |
|------|------|--------|------|
| Product owner | _TBD_ | Approved for build | 2026-06-29 |
| Engineering lead | _TBD_ | Approved for build | 2026-06-29 |

---

## Related Documents

- [Wireframes](wireframes.md)
- [PRD](prd.md)
- [Non-functional requirements](non-functional-requirements.md)
