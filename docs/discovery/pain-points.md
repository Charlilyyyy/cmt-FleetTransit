# Pain Points

Operational gaps that CMT Fleet Transit must close, mapped to who feels them and what a better state looks like. These pains inform v1 scope and prioritization in [success-criteria.md](success-criteria.md).

---

## Pain Catalog

| ID | Pain | Who feels it most | Severity | v1 relevance |
|----|------|-------------------|----------|--------------|
| P1 | Manual routing | Admin | High | Core |
| P2 | No live tracking | Admin, Staff, Guardian | High | Core |
| P3 | Poor parent communication | Guardian, Admin, Staff | High | Core |
| P4 | Attendance gaps | Admin, Guardian, Driver | High | Core |
| P5 | Multi-vehicle coordination | Admin, Staff | High | Core |
| P6 | Disconnected tools | Admin | Medium | Addressed via unified platform |
| P7 | Weak tenant isolation | SuperAdmin, Admin | Medium | Core (multi-tenant) |
| P8 | Field connectivity loss | Driver | Medium | Partial (offline queue) |

---

## P1 — Manual Routing

### What happens today

Stop order is planned in spreadsheets or on paper maps. Admins guess drive times instead of using distance matrices. When a new passenger joins mid-semester, the whole route is redrawn by hand. Vehicle seat capacity is checked mentally — overcrowding is caught late or not at all.

### Why it hurts

- Extra miles and fuel burn on every run
- Unpredictable pickup windows erode guardian trust
- Same-day changes (absences, road work) do not flow back into the plan drivers follow
- Optimization expertise lives in one person's head; they become a single point of failure

### Desired outcome

Admins define stops, constraints, and vehicle capacity; the system proposes an optimized order with distance and duration estimates. Changes propagate to the assigned trip before the driver departs.

### Personas affected

Admin (primary), Driver (receives the plan), Staff (monitors adherence)

---

## P2 — No Live Tracking

### What happens today

Dispatch asks drivers for location over phone or messaging apps. Guardians call the school when the bus is late. There is no shared map showing vehicle position, heading, or ETA per stop. Historical "where were we at 7:42?" is unavailable for incident review.

### Why it hurts

- Reactive operations: problems are discovered after complaints, not before delays compound
- Staff time consumed on location checks that should be automatic
- Guardians experience anxiety and flood phone lines during minor delays
- No objective record for disputes (late arrival claims, missed stop allegations)

### Desired outcome

Active trips stream GPS to a dashboard and authorized guardian views. ETA updates reflect real position, not static schedules. Staff intervene with data, not phone tag.

### Personas affected

Admin, Staff, Driver (broadcasts position), Parent / Guardian (consumes view)

---

## P3 — Poor Parent Communication

### What happens today

Updates are ad hoc: individual texts from drivers, informal group chats, or front-office staff repeating the same message to dozens of callers. There is no org-approved template for pickup, dropoff, delay, or emergency. Messages are not tied to check-in events or audit logs.

### Why it hurts

- Inconsistent wording creates confusion and liability ambiguity
- Drivers distracted by personal messages while operating a vehicle
- No proof that guardians were notified within a reasonable window
- Premium channels (LINE, Telegram, push) are unused because nothing integrates them

### Desired outcome

Check-in and trip events trigger configurable notifications per organization. Guardians receive timely, consistent alerts without staff composing each message manually.

### Personas affected

Parent / Guardian (primary), Admin (configures templates), Staff (fewer inbound calls)

---

## P4 — Attendance Gaps

### What happens today

Boarding is tracked on paper lists or informal driver notes. Absent passengers are communicated verbally at the next stop. After a dispute ("my child was never picked up"), there is no timestamped, location-tagged proof. Schools requiring attendance exports get manual spreadsheets assembled days later.

### Why it hurts

- Child-safety and compliance exposure for schools and operators
- Time lost reconstructing events from memory
- Guardians lack confidence that the system knows who is on the vehicle
- Insurance and incident investigations lack primary-source data

### Desired outcome

Drivers confirm check-in and check-out with OTP verification and optional photo proof, each event stamped with GPS coordinates and time. Admins and authorized guardians see attendance aligned to trips and stops.

### Personas affected

Driver (captures), Admin (reports), Parent / Guardian (visibility), Staff (monitors exceptions)

---

## P5 — Multi-Vehicle Coordination

### What happens today

Each vehicle operates as an island. One dispatcher may oversee several routes but lacks a unified live board. A delay on route A does not inform staffing on route B. Substitute vehicles and drivers are coordinated through phone trees; reassigned passengers are not reflected in digital manifests.

### Why it hurts

- Cascading delays when resources cannot be rebalanced quickly
- Duplicate work: multiple staff calling the same drivers for status
- No fleet-wide picture during peak morning and afternoon windows
- Hard to answer leadership questions: "How many trips are late right now?"

### Desired outcome

A single operations view lists all active trips, statuses, and vehicles. Admins reassign or update trips with changes visible to drivers and monitoring staff immediately.

### Personas affected

Admin (primary), Staff (monitoring), Driver (receives updates)

---

## P6 — Disconnected Tools

### What happens today

Passenger rosters live in one system, routes in another, GPS in a consumer app, and messaging in WhatsApp or SMS. Nothing shares a tenant boundary or role model. Reports require copy-paste across exports.

### Why it hurts

- Data drift between tools; no single source of truth
- Onboarding new schools means wiring integrations ad hoc
- Training burden: each tool has its own login and workflow

### Desired outcome

One multi-tenant platform links organizations, schools, fleet entities, trips, locations, check-ins, and notifications under consistent RBAC.

### Personas affected

Admin, SuperAdmin (tenant model)

---

## P7 — Weak Tenant Isolation

### What happens today

Shared spreadsheets, shared logins, or poorly scoped databases risk cross-org data exposure. Platform operators cannot confidently attest that school A never sees school B's passengers.

### Why it hurts

- Regulatory and contractual failure for B2B SaaS
- Blocks selling to multiple schools from one vendor account
- Incident blast radius is undefined

### Desired outcome

Row-level security and role boundaries enforce org isolation. SuperAdmin tools expose platform health without default access to tenant PII.

### Personas affected

SuperAdmin, Admin, all tenant-scoped roles

---

## P8 — Field Connectivity Loss

### What happens today

Drivers lose signal in tunnels, rural legs, or dense campus areas. Check-ins attempted offline are lost or recorded on paper for later entry — if they are entered at all.

### Why it hurts

- Attendance and location history have holes exactly when disputes arise
- Drivers revert to unsafe workarounds (typing while moving, delayed batch entry)

### Desired outcome

Driver client queues check-ins and location bursts locally, syncing when connectivity returns. Critical trip state is never silently dropped.

### Personas affected

Driver (primary), Admin (complete records)

---

## Pain Interdependencies

```
Manual routing (P1)
       │
       ▼
No live tracking (P2) ──► Poor communication (P3)
       │                           │
       ▼                           ▼
Multi-vehicle gaps (P5)     Attendance gaps (P4)
```

Fixing routing alone does not satisfy guardians; live tracking without notifications still drives phone calls. Attendance proof strengthens communication credibility. Multi-vehicle coordination requires both tracking and a unified trip model.

---

## Out of Scope for Pain Response in v1

These pains are real but deferred intentionally:

| Pain | Reason to defer |
|------|-----------------|
| AI demand forecasting | Requires historical data volume not available at launch |
| Native iOS/Android apps | PWA + optional Capacitor wrapper sufficient for pilot |
| White-label branding per org | Adds complexity before core ops are proven |
| Full internationalization | Pilot orgs assumed single-locale first |

---

## How We Will Know Pains Are Addressed

Each core pain maps to observable outcomes in [success-criteria.md](success-criteria.md):

| Pain | Validation signal |
|------|-------------------|
| P1 | Admin optimizes a route; driver receives updated stop order |
| P2 | Guardian sees vehicle move on map within seconds of trip start |
| P3 | Notification arrives within 30s of check-in event |
| P4 | Check-in record includes time, OTP, and coordinates |
| P5 | Staff dashboard shows all active trips for the org |

---

## Related Documents

- [Problem statement](problem-statement.md)
- [Personas](personas.md)
- [Success criteria](success-criteria.md)
