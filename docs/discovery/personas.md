# Target Personas

Five roles span the CMT Fleet Transit platform: platform oversight, organization administration, day-of monitoring, field execution, and family-facing visibility. Each persona has distinct goals, frustrations, and permissions.

---

## Persona Overview

| Persona | Scope | Primary goal | Typical context |
|---------|-------|--------------|-----------------|
| SuperAdmin | All organizations | Keep the platform healthy and tenants isolated | SaaS operator, internal ops |
| Admin | Single organization | Set up and run fleet operations end to end | School transport lead, shuttle program manager |
| Staff | Single organization (read-heavy) | Monitor live trips without changing core config | Dispatcher, front-office coordinator |
| Driver | Assigned trips | Execute routes safely with clear passenger workflow | Bus driver, shuttle operator |
| Parent / Guardian | Linked passengers only | Know pickup, dropoff, and delay status | Parent, caregiver, employer contact |

---

## SuperAdmin

### Profile

Platform-level operator responsible for onboarding organizations, enforcing global policies, and investigating cross-tenant issues. May be an internal team at the vendor or a delegated partner managing multiple customer orgs.

### Goals

- Provision and suspend organizations without touching tenant business data unnecessarily
- Audit platform usage, security events, and support escalations
- Ensure tenant isolation — no organization reads another's passengers, routes, or locations
- Roll out configuration templates (notification channels, default roles) for faster onboarding

### Frustrations today

- Generic admin consoles mix fleet data with billing and offer weak tenant boundaries
- Support tickets require database access because audit trails are incomplete
- No single view of which orgs are active, which trips are in progress, and where errors cluster

### Success with CMT Fleet Transit

- Cross-org dashboard limited to metadata and health signals, not passenger PII by default
- Immutable audit log for privileged actions
- Clear RBAC: SuperAdmin capabilities are explicit and separate from org Admin

### Key interactions

- Organization lifecycle (create, configure, deactivate)
- Platform settings and integration credentials (where applicable)
- Incident review across tenants

---

## Admin

### Profile

Owns daily and strategic fleet operations for one organization — schools served, vehicles, drivers, passengers, routes, and trips. Often the person guardians and school leadership call when something goes wrong.

### Goals

- Plan routes that respect vehicle capacity and realistic drive times
- Assign drivers and vehicles to trips with minimal morning chaos
- Resolve exceptions (absent passenger, broken-down vehicle, road closure) quickly
- Produce attendance and on-time reports for leadership or contracted schools

### Frustrations today

- Route changes require reprinting manifests and phone trees to drivers
- No trustworthy live map — status is inferred from phone calls
- Passenger lists live in spreadsheets disconnected from GPS or notifications
- Proving who boarded and when depends on driver memory or paper sign-off

### Success with CMT Fleet Transit

- Create org → school → vehicle → driver → passenger → route → trip in one system
- Optimize stop order and see estimated times before the run starts
- Watch live trips, receive delay signals, and trigger guardian notifications from templates
- Export or view reports backed by check-in events and GPS timestamps

### Key interactions

- Full CRUD on fleet entities within the organization
- Route planning and optimization
- Trip scheduling and assignment
- User management (Staff, Drivers, linked Guardians)
- Settings, reports, and audit log review

---

## Staff

### Profile

Operations team member who monitors trips during service windows but should not reconfigure the fleet or manage billing-level settings. Trusted to see live data and assist drivers and guardians without full admin power.

### Goals

- See which trips are on time, delayed, or completed at a glance
- Help drivers with passenger lookups and stop clarifications
- Escalate incidents to Admin without becoming a bottleneck on phone calls
- Answer guardian inquiries with facts from the system, not guesswork

### Frustrations today

- Shared admin passwords or exported spreadsheets because "view only" does not exist
- Either too much access (can delete routes) or too little (cannot see the map)
- No distinction between monitoring and configuration in legacy tools

### Success with CMT Fleet Transit

- Dashboard focused on live trips, vehicle positions, and recent check-ins
- Read access to passengers and routes; write limited to trip notes or status flags where policy allows
- Cannot modify org structure, delete schools, or change RBAC without Admin role

### Key interactions

- Live trip monitoring (Supabase Realtime–backed map and status)
- Passenger lookup by name, school, or route
- View reports; no destructive mutations on core entities

---

## Driver

### Profile

Executes assigned trips in the field using a mobile device. Needs clarity, speed, and offline tolerance — not a complex back-office UI. Safety and traffic demand minimal taps and large touch targets.

### Goals

- Know today's trip, stop order, and expected passengers before leaving the depot
- Start trip, broadcast GPS, and mark arrivals without leaving a dedicated driver view
- Verify passenger boarding with OTP and optional photo proof when policy requires
- Work through brief connectivity loss and sync when back online

### Frustrations today

- Paper manifests outdated by first absent student
- Personal WhatsApp or SMS used for location updates — no org control
- Disputes over attendance with no timestamped proof
- Consumer map apps that do not know official stops or capacity rules

### Success with CMT Fleet Transit

- Driver app or PWA: start trip → GPS stream → stop list → check-in/out flow
- Offline queue for check-ins and location bursts when signal drops
- Clear passenger list per stop with OTP validation
- No access to other organizations, unrelated routes, or admin financial data

### Key interactions

- Trip start / end and status transitions
- GPS location broadcast during active trip
- Per-stop check-in and check-out (OTP + photo + coordinates)
- View assigned vehicle and route for the day only

---

## Parent / Guardian

### Profile

Authorized adult linked to one or more passengers. Needs peace of mind during morning pickup and afternoon dropoff — not access to the operator's full dashboard or other children's data.

### Goals

- See vehicle location and ETA for their child's route
- Receive pickup, dropoff, and delay notifications automatically
- Review history of recent trips and check-in events for their passengers only
- Contact the operator through established channels when the app shows an exception

### Frustrations today

- Calling the school or driver repeatedly during delays
- Group chats that leak other families' information
- No proof of when their child boarded or left the vehicle
- Estimates based on "the bus usually comes around 7:15"

### Success with CMT Fleet Transit

- `/parent/tracking` (or equivalent): live map for linked passengers only
- Push or messaging notifications within seconds of check-in events
- Trip history without exposing admin configuration or other tenants
- Geofencing-style alerts when vehicle nears pickup or dropoff (where enabled)

### Key interactions

- View live tracking for linked passengers
- Notification preferences per channel (where org allows)
- Trip and attendance history (read-only, scoped to their children)

---

## Permission Summary

| Capability | SuperAdmin | Admin | Staff | Driver | Parent / Guardian |
|------------|:----------:|:-----:|:-----:|:------:|:-----------------:|
| Manage organizations | ✓ | — | — | — | — |
| Manage org fleet & routes | — | ✓ | read | assigned only | — |
| Monitor live trips | ✓ (metadata) | ✓ | ✓ | own trip | linked only |
| Execute check-in/out | — | — | — | ✓ | — |
| Manage users & roles | ✓ | ✓ | — | — | — |
| View audit log | ✓ | ✓ | read | — | — |
| Receive guardian notifications | — | — | — | — | ✓ |

---

## Primary User for v1

**Admin** is the primary economic buyer and daily power user: they feel the planning and coordination pain most acutely and define whether the platform sticks. **Parent / Guardian** is the emotional validation — if families trust the visibility layer, schools and operators renew.

SuperAdmin, Staff, and Driver personas must work on day one, but discovery success criteria (see [success-criteria.md](success-criteria.md)) anchor the first release on a school-bus scenario where Admin and Guardian outcomes are demonstrable.

---

## Related Documents

- [Problem statement](problem-statement.md)
- [Pain points](pain-points.md)
- [Success criteria](success-criteria.md)
