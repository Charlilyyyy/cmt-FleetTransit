# MVP Feature Set

In-scope features for CMT Fleet Transit v1. IDs **F01–F20** align with [research priorities](../research/positioning-and-priorities.md). **P0** blocks the school-bus proof; **P1** required for credible launch.

---

## Feature Index

| ID | Feature | Priority | Domain |
|----|---------|----------|--------|
| F01 | Multi-tenant organization + RLS | P0 | Tenancy |
| F02 | RBAC (5 roles) | P0 | Auth |
| F03 | Fleet entity CRUD | P0 | Fleet |
| F04 | Route editor with stops | P0 | Routing |
| F05 | Clarke-Wright optimization + cache | P0 | Routing |
| F06 | Trip scheduling + assignment | P0 | Trips |
| F07 | Driver trip lifecycle + GPS | P0 | Field |
| F08 | Live dashboard map (realtime) | P0 | Operations |
| F09 | OTP check-in/out + GPS stamp | P0 | Attendance |
| F10 | Guardian tracking view | P0 | Guardian |
| F11 | FCM notifications | P0 | Notifications |
| F12 | Audit log | P0 | Compliance |
| F13 | LINE notifications | P1 | Notifications |
| F14 | Telegram notifications | P1 | Notifications |
| F15 | Staff read-only role | P1 | Auth |
| F16 | Basic reports | P1 | Reports |
| F17 | Delay + emergency templates | P1 | Notifications |
| F18 | Offline driver check-in queue | P1 | Field |
| F19 | Photo proof (org opt-in) | P1 | Attendance |
| F20 | Rate limiting + validation | P1 | Security |

---

## F01 — Multi-Tenant Organization + RLS

**Priority:** P0 | **Stories:** US-SA-01, US-SA-07

### Description

Each customer is an **organization** with isolated data in PostgreSQL. Row-Level Security policies enforce that queries return only rows matching the user's `organization_id`.

### Requirements

- Organization record: name, status (active/inactive), created_at
- All tenant tables include `organization_id` foreign key
- RLS enabled on every tenant-scoped table
- SuperAdmin platform views use metadata only (org list, counts) — not passenger PII by default
- Automated tests: user in org A cannot SELECT/UPDATE org B rows

### Acceptance

- Two test orgs with overlapping entity names coexist without cross-read

---

## F02 — RBAC (Five Roles)

**Priority:** P0 | **Stories:** US-AD-05, US-SA-06

### Description

Role-based access control for SuperAdmin, Admin, Staff, Driver, Parent / Guardian. Permissions enforced in API middleware and RLS.

### Requirements

- Role stored on user record (Firebase custom claims + Supabase user profile)
- Route protection: `/dashboard` (Admin, Staff), `/parent` (Guardian), driver routes (Driver)
- Permission matrix per [personas](../discovery/personas.md#permission-summary)
- Unauthorized requests return 401/403 without data leakage

### Acceptance

- Each role lands on correct home route after login; forbidden actions blocked

---

## F03 — Fleet Entity CRUD

**Priority:** P0 | **Stories:** US-AD-01 – US-AD-04

### Description

Admin manages core fleet entities within their organization.

### Entities

| Entity | Key fields |
|--------|------------|
| **School** | name, address, contact |
| **Vehicle** | label, plate, seat_capacity, status |
| **Driver** | name, phone, license_ref, linked user_id |
| **Passenger** | name, school_id, default_stop, guardian links, OTP secret |

### Requirements

- Full CRUD via dashboard UI and API
- Soft delete or status flag (no hard delete of passengers with check-in history)
- Validation: seat_capacity > 0; passenger must belong to org school
- List views with search and pagination

### Acceptance

- Admin completes org → school → vehicle → driver → passenger chain without leaving app

---

## F04 — Route Editor with Stops

**Priority:** P0 | **Stories:** US-AD-06

### Description

Manual creation and editing of routes with geocoded stops.

### Requirements

- Route: name, school_id (optional), vehicle capacity reference
- Stops: sequence order, lat/lng, address label, expected passengers
- Map picker for stop placement (Google Maps)
- Drag or manual reorder before/after optimization
- Save draft and published states

### Acceptance

- Admin creates route with ≥ 5 stops on map; order persists correctly

---

## F05 — Clarke-Wright Optimization + Distance Cache

**Priority:** P0 | **Stories:** US-AD-07, US-AD-08

### Description

Optimize stop order using Clarke-Wright Savings with 2-opt improvement. Google Maps Distance Matrix with LRU cache.

### Requirements

- API: `POST /api/routes/optimize` with stops + vehicle capacity
- Response: ordered stops, per-leg distance/duration, total estimates
- Performance: < 2 seconds for 50 stops (p95)
- Capacity constraint: passengers per route ≤ vehicle seat_capacity
- Cache repeated stop pairs to reduce API cost

### Acceptance

- Optimized order differs from input on 8+ stop route; total distance ≤ naive order

---

## F06 — Trip Scheduling + Assignment

**Priority:** P0 | **Stories:** US-AD-10, US-AD-11, US-AD-12

### Description

Schedule trips linking route, driver, vehicle, and service date/window.

### Requirements

- Trip fields: route_id, driver_id, vehicle_id, scheduled_start, direction (AM/PM), status
- Status lifecycle: `scheduled` → `active` → `completed` | `cancelled`
- Reassign driver/vehicle while `scheduled` or `active`
- Driver sees only assigned trips for current day

### Acceptance

- Admin schedules trip; driver sees it on mobile before start

---

## F07 — Driver Trip Lifecycle + GPS Stream

**Priority:** P0 | **Stories:** US-DR-03, US-DR-04, US-DR-09

### Description

Driver starts and ends trips; GPS positions broadcast during active trip.

### Requirements

- Actions: start trip, end trip
- GPS: browser geolocation every N seconds (configurable, default 5s) while active
- Positions written to `locations` table with trip_id, timestamp
- Supabase Realtime channel per trip for subscribers
- Target latency to dashboard: < 100ms

### Acceptance

- Start trip → dashboard map marker moves within realtime target

---

## F08 — Live Dashboard Map (Realtime)

**Priority:** P0 | **Stories:** US-AD-13, US-ST-01, US-ST-02

### Description

Operations dashboard showing all active trips with live vehicle positions.

### Requirements

- Map view with one marker per active trip
- Trip list panel: route name, driver, status, last update time
- Supabase Realtime subscription on `locations` and `trips`
- Staff and Admin access; Staff read-only
- Loading, empty, and error states

### Acceptance

- Staff sees all org active trips on one screen without edit buttons on fleet config

---

## F09 — OTP Check-In/Out + GPS Stamp

**Priority:** P0 | **Stories:** US-DR-05, US-DR-06

### Description

Driver verifies passenger boarding with OTP; system records event with coordinates and time.

### Requirements

- Per-passenger OTP (or daily rotating code) validated at check-in
- Check-in and check-out event types
- Record: passenger_id, trip_id, stop_id, timestamp, lat/lng, driver_id
- Invalid OTP blocks check-in with clear error
- Triggers notification pipeline on successful check-in

### Acceptance

- Successful check-in creates row with GPS; failed OTP does not

---

## F10 — Guardian Tracking View

**Priority:** P0 | **Stories:** US-PA-01, US-PA-02, US-PA-07

### Description

Parent / Guardian portal showing live vehicle position for linked passengers only.

### Requirements

- Routes: `/parent/tracking`, `/parent/history` (history P2 detail)
- Map shows vehicle for passenger's active trip only
- No access to other passengers, routes list, or admin data
- RLS enforces guardian ↔ passenger linkage table
- ETA display based on route progress (best effort)

### Acceptance

- Guardian A cannot see guardian B's passenger on map or API

---

## F11 — FCM Notifications

**Priority:** P0 | **Stories:** US-PA-03, US-AD-14

### Description

Firebase Cloud Messaging push for pickup and dropoff events.

### Requirements

- Templates: pickup, dropoff (minimum)
- Trigger on check-in / check-out events
- Delivery target: < 30 seconds from event (p95)
- Guardian device token registration on login
- Org-level enable/disable per template

### Acceptance

- Test check-in fires FCM to guardian device in staging

---

## F12 — Audit Log

**Priority:** P0 | **Stories:** US-AD-19, US-SA-05

### Description

Immutable log of mutations and privileged actions.

### Requirements

- Fields: actor_id, organization_id, action, entity_type, entity_id, timestamp, metadata JSON
- Logged: create/update/delete on fleet entities, trips, routes, user role changes
- Admin searchable filter by date, actor, entity
- SuperAdmin views platform-level privileged actions

### Acceptance

- Route edit appears in audit log with actor and timestamp

---

## F13 — LINE Notifications

**Priority:** P1 | **Stories:** US-AD-15, US-PA-06

### Description

LINE Messaging API channel for guardian alerts.

### Requirements

- Org configures LINE channel credentials in settings
- Same template types as FCM: pickup, dropoff, delay, emergency
- Guardian links LINE user id during onboarding
- Fallback to FCM if LINE delivery fails

### Acceptance

- Staging message delivered to LINE test account within 30s

---

## F14 — Telegram Notifications

**Priority:** P1 | **Stories:** US-AD-15, US-PA-06

### Description

Telegram Bot API for guardian alerts.

### Requirements

- Org-level bot token configuration
- Guardian starts bot or accepts deep link to subscribe
- Template parity with FCM/LINE
- `packages/notifications` unified interface

### Acceptance

- Test pickup event reaches Telegram chat in staging

---

## F15 — Staff Read-Only Role

**Priority:** P1 | **Stories:** US-ST-05, US-ST-03

### Description

Staff role with monitoring and lookup permissions only.

### Requirements

- Can view: trips, live map, passengers, routes, basic reports
- Cannot: delete/create schools, routes, users; change roles; org settings
- Enforced in API and UI (hidden actions)

### Acceptance

- Staff user receives 403 on POST to create school

---

## F16 — Basic Reports

**Priority:** P1 | **Stories:** US-AD-17, US-AD-18, US-ST-06

### Description

Operational reports for admins and staff.

### Requirements

| Report | Contents |
|--------|----------|
| Trip completion | Trips by date, status counts |
| Attendance | Check-in/out per passenger per trip |
| On-time summary | Scheduled vs actual start (best effort) |

- Date range filter
- Export CSV (optional P1 — table view minimum)

### Acceptance

- Admin views attendance for completed trip on same day

---

## F17 — Delay + Emergency Templates

**Priority:** P1 | **Stories:** US-PA-04, US-AD-14

### Description

Notification templates beyond pickup/dropoff.

### Requirements

- **Delay:** Admin or system triggers when trip behind threshold
- **Emergency:** Manual admin trigger; high-priority channel
- All channels (FCM, LINE, Telegram) support both templates
- Emergency bypasses quiet hours if configured

### Acceptance

- Admin triggers delay template; guardian receives within 30s

---

## F18 — Offline Driver Check-In Queue

**Priority:** P1 | **Stories:** US-DR-08

### Description

Queue check-in events locally when connectivity is lost; sync on reconnect.

### Requirements

- IndexedDB queue in driver PWA
- Idempotent event IDs (`crypto.randomUUID()`)
- Background sync or retry on `online` event
- UI indicator: pending sync count
- Conflict: server wins on duplicate with same id

### Acceptance

- Check-in offline → airplane mode off → event appears in admin attendance view

---

## F19 — Photo Proof (Org Opt-In)

**Priority:** P1 | **Stories:** US-DR-07, US-AD-16

### Description

Optional camera capture at check-in stored with GPS and timestamp.

### Requirements

- Org setting `photo_proof_required` default **false**
- Driver camera capture via `useCamera` hook
- Upload to Supabase Storage private bucket; signed URL for authorized viewers
- Metadata: trip_id, passenger_id, lat/lng, timestamp
- Retention per [regulatory compliance](../research/regulatory-compliance.md)

### Acceptance

- Photo enabled org: check-in stores image; disabled org: OTP only

---

## F20 — Rate Limiting + Input Validation

**Priority:** P1 | **Stories:** — (cross-cutting)

### Description

Security baselines on public and authenticated APIs.

### Requirements

- Rate limit public APIs: 10 requests/minute per IP
- Zod schemas in `packages/shared` for all API inputs
- Client errors omit sensitive internals
- CSP headers on web app
- `scripts/check-secrets.sh` in pre-commit path

### Acceptance

- 11th request in minute returns 429; invalid body returns 400 with safe message

---

## MVP Domain Summary

Aligned with PRD scope:

| Domain | Features |
|--------|----------|
| **Org & user management** | F01, F02 |
| **Schools, vehicles, drivers, passengers** | F03 |
| **Route planning + optimization** | F04, F05 |
| **Trip execution & live tracking** | F06, F07, F08 |
| **Check-in/out OTP + photo** | F09, F19 |
| **Parent tracking view** | F10 |
| **Notifications** | F11, F13, F14, F17 |
| **Reports & audit log** | F12, F16 |
| **Field resilience** | F18 |
| **Security** | F20, F15 |

---

## Related Documents

- [User stories](user-stories.md)
- [Out of scope](out-of-scope.md)
- [MVP backlog](mvp-backlog.md)
- [PRD](prd.md)
