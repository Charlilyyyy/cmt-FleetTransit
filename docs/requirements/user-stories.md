# User Stories

User stories per role for CMT Fleet Transit v1. Format: **As a** [role], **I want** [action], **so that** [outcome].

Stories map to feature IDs in [mvp-features.md](mvp-features.md) and epics in [mvp-backlog.md](mvp-backlog.md).

---

## SuperAdmin

Platform-level operator managing organizations and platform health.

| ID | Story | Priority |
|----|-------|----------|
| US-SA-01 | As a **SuperAdmin**, I want to **create a new organization** with name and contact, so that **a bus vendor can onboard without engineering support**. | P0 |
| US-SA-02 | As a **SuperAdmin**, I want to **deactivate an organization**, so that **churned customers lose access while data retention policy applies**. | P0 |
| US-SA-03 | As a **SuperAdmin**, I want to **view a list of all organizations with status and vehicle count**, so that **I can monitor platform adoption without opening tenant PII**. | P0 |
| US-SA-04 | As a **SuperAdmin**, I want to **see how many trips are active across the platform**, so that **I can detect load spikes or outages**. | P1 |
| US-SA-05 | As a **SuperAdmin**, I want to **review audit logs for privileged platform actions**, so that **support escalations have a traceable record**. | P0 |
| US-SA-06 | As a **SuperAdmin**, I want to **assign the first Admin user to a new organization**, so that **the customer can self-serve fleet setup**. | P0 |
| US-SA-07 | As a **SuperAdmin**, I want **tenant data isolation enforced at the database layer**, so that **org A can never read org B passengers or routes**. | P0 |

---

## Admin

Organization fleet manager — primary buyer and daily power user.

### Fleet setup

| ID | Story | Priority |
|----|-------|----------|
| US-AD-01 | As an **Admin**, I want to **create and edit schools** my organization serves, so that **passengers and routes are grouped correctly**. | P0 |
| US-AD-02 | As an **Admin**, I want to **register vehicles with seat capacity**, so that **routes never exceed legal or operational limits**. | P0 |
| US-AD-03 | As an **Admin**, I want to **add drivers and link them to user accounts**, so that **only assigned drivers execute trips**. | P0 |
| US-AD-04 | As an **Admin**, I want to **add passengers with school, stop, and guardian contact**, so that **routes and notifications have complete data**. | P0 |
| US-AD-05 | As an **Admin**, I want to **invite Staff, Drivers, and Guardians with the correct role**, so that **everyone has least-privilege access**. | P0 |

### Route planning

| ID | Story | Priority |
|----|-------|----------|
| US-AD-06 | As an **Admin**, I want to **create a route with an ordered list of stops on a map**, so that **drivers have a clear path to follow**. | P0 |
| US-AD-07 | As an **Admin**, I want to **run route optimization** on stops with vehicle capacity, so that **I reduce miles and time vs manual ordering**. | P0 |
| US-AD-08 | As an **Admin**, I want to **see distance and duration estimates per leg**, so that **I can set realistic pickup windows**. | P0 |
| US-AD-09 | As an **Admin**, I want to **edit stop order after optimization**, so that **I can apply local knowledge the algorithm misses**. | P1 |

### Trip management

| ID | Story | Priority |
|----|-------|----------|
| US-AD-10 | As an **Admin**, I want to **schedule a trip with date, route, driver, and vehicle**, so that **morning runs are assigned before departure**. | P0 |
| US-AD-11 | As an **Admin**, I want to **change driver or vehicle on a scheduled trip**, so that **I can handle absences and breakdowns**. | P1 |
| US-AD-12 | As an **Admin**, I want to **see trip status** (scheduled, active, completed, cancelled), so that **I know the state of today's operations**. | P0 |
| US-AD-13 | As an **Admin**, I want to **view live vehicle position on a map for all active trips**, so that **I do not need to call drivers for location**. | P0 |

### Notifications and settings

| ID | Story | Priority |
|----|-------|----------|
| US-AD-14 | As an **Admin**, I want to **configure notification templates** (pickup, dropoff, delay, emergency), so that **guardians receive consistent messages**. | P1 |
| US-AD-15 | As an **Admin**, I want to **enable LINE or Telegram** for my organization, so that **guardians in my region get alerts on familiar apps**. | P1 |
| US-AD-16 | As an **Admin**, I want to **toggle photo proof on check-in** per org policy, so that **I comply with school consent requirements**. | P1 |

### Reports and audit

| ID | Story | Priority |
|----|-------|----------|
| US-AD-17 | As an **Admin**, I want to **view attendance per trip** (who checked in/out and when), so that **I can answer school inquiries with data**. | P1 |
| US-AD-18 | As an **Admin**, I want to **view trip completion and on-time summary**, so that **I can report performance to leadership**. | P1 |
| US-AD-19 | As an **Admin**, I want to **search the audit log** for who changed routes, trips, or users, so that **disputes have an accountable record**. | P0 |

---

## Staff

Operations monitor with read-heavy access during service windows.

| ID | Story | Priority |
|----|-------|----------|
| US-ST-01 | As **Staff**, I want to **see a live board of all active trips** with status, so that **I can monitor the fleet at a glance**. | P0 |
| US-ST-02 | As **Staff**, I want to **view vehicle position on the map** for active trips, so that **I can answer delay questions with facts**. | P0 |
| US-ST-03 | As **Staff**, I want to **look up a passenger by name** and see their trip and check-in status, so that **I can help guardians on the phone quickly**. | P1 |
| US-ST-04 | As **Staff**, I want to **view routes and stop lists** without editing them, so that **I can clarify driver questions**. | P1 |
| US-ST-05 | As **Staff**, I want to **be prevented from deleting schools, routes, or changing user roles**, so that **accidental config changes do not happen**. | P0 |
| US-ST-06 | As **Staff**, I want to **view basic reports** (today's trips, attendance), so that **I can support admins without full permissions**. | P1 |

---

## Driver

Field operator executing assigned trips via mobile PWA.

| ID | Story | Priority |
|----|-------|----------|
| US-DR-01 | As a **Driver**, I want to **log in with my phone number**, so that **I access only my assigned trips securely**. | P0 |
| US-DR-02 | As a **Driver**, I want to **see today's assigned trip with stop order and passenger list**, so that **I know the plan before leaving the depot**. | P0 |
| US-DR-03 | As a **Driver**, I want to **start a trip**, so that **GPS broadcasting and guardian tracking begin**. | P0 |
| US-DR-04 | As a **Driver**, I want my **location streamed automatically during an active trip**, so that **dispatch and guardians see live position**. | P0 |
| US-DR-05 | As a **Driver**, I want to **check in a passenger with OTP**, so that **attendance is verified at the curb**. | P0 |
| US-DR-06 | As a **Driver**, I want to **check out a passenger at dropoff**, so that **the system records when they left the vehicle**. | P0 |
| US-DR-07 | As a **Driver**, I want to **capture an optional photo at check-in** when required by my org, so that **disputes have visual proof**. | P1 |
| US-DR-08 | As a **Driver**, I want to **complete check-in when offline** and sync later, so that **spotty signal does not block boarding**. | P1 |
| US-DR-09 | As a **Driver**, I want to **end a trip**, so that **GPS stops and the run is marked complete**. | P0 |
| US-DR-10 | As a **Driver**, I want a **simple large-touch UI**, so that **I can operate safely without complex navigation**. | P0 |

---

## Parent / Guardian

Authorized adult linked to one or more passengers.

| ID | Story | Priority |
|----|-------|----------|
| US-PA-01 | As a **Parent / Guardian**, I want to **log in and see only my linked children**, so that **other passengers' data stays private**. | P0 |
| US-PA-02 | As a **Parent / Guardian**, I want to **view the vehicle on a live map** during an active trip, so that **I know when to meet my child at the stop**. | P0 |
| US-PA-03 | As a **Parent / Guardian**, I want to **receive a push notification when my child checks in**, so that **I do not need to call the school**. | P0 |
| US-PA-04 | As a **Parent / Guardian**, I want to **receive dropoff and delay notifications**, so that **I stay informed without checking the app constantly**. | P1 |
| US-PA-05 | As a **Parent / Guardian**, I want to **view recent trip history** for my children, so that **I can confirm past pickups and dropoffs**. | P2 |
| US-PA-06 | As a **Parent / Guardian**, I want to **receive alerts on LINE or Telegram** if my org enables it, so that **I get messages on apps I already use**. | P1 |
| US-PA-07 | As a **Parent / Guardian**, I want to **not see admin routes, other schools, or fleet configuration**, so that **I only access what concerns my family**. | P0 |

---

## Story Summary by Priority

| Priority | Count | Roles covered |
|----------|-------|---------------|
| P0 | 32 | All five roles |
| P1 | 18 | Admin, Staff, Driver, Guardian |
| P2 | 1 | Guardian (history) |

---

## Anchor Scenario Traceability

School-bus morning run — story coverage:

| Step | Stories |
|------|---------|
| Admin creates fleet entities | US-AD-01 – US-AD-05 |
| Admin plans and optimizes route | US-AD-06 – US-AD-08 |
| Admin schedules trip | US-AD-10 |
| Driver starts trip + GPS | US-DR-03, US-DR-04 |
| Driver check-in | US-DR-05, US-DR-07 |
| Guardian notification + map | US-PA-03, US-PA-02 |
| Staff monitors | US-ST-01, US-ST-02 |
| Admin reports + audit | US-AD-17, US-AD-19 |

---

## Related Documents

- [PRD](prd.md)
- [MVP features](mvp-features.md)
- [MVP backlog](mvp-backlog.md)
- [Personas](../discovery/personas.md)
