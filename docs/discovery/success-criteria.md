# Success Criteria

What "done" looks like for CMT Fleet Transit v1. Criteria are anchored on a **school bus use case** — one organization, one school, one route, one active trip — because it exercises every core pain (routing, tracking, attendance, notifications, multi-role access) in a single demonstrable flow.

---

## Anchor Scenario — School Morning Run

**Context:** A transport operator serves Lincoln Elementary with one 40-seat bus. An Admin plans the AM pickup route; a Driver executes the trip; Staff monitors from the office; twelve Guardians track their children.

| Step | Actor | Action | Success signal |
|------|-------|--------|----------------|
| 1 | Admin | Creates organization, school, vehicle, driver, passengers | All entities linked under one tenant |
| 2 | Admin | Defines route with stops and runs optimization | Stop order respects seat capacity; estimates displayed |
| 3 | Admin | Schedules trip, assigns driver and vehicle | Driver sees trip on mobile view before departure |
| 4 | Driver | Starts trip; GPS broadcasts | Dashboard map updates within 100ms (realtime target) |
| 5 | Driver | Check-in passenger at stop (OTP + photo) | Event stored with timestamp and coordinates |
| 6 | System | Sends guardian notification | Alert delivered within 30 seconds of check-in |
| 7 | Guardian | Opens tracking view | Sees vehicle position and linked passenger only |
| 8 | Staff | Monitors live board | All active trips visible; no edit permissions on fleet config |
| 9 | Admin | Reviews report and audit log | Trip completion, attendance, and mutations recorded |

If this scenario completes without spreadsheets, phone trees, or cross-tenant data leaks, v1 has proven its core value.

---

## v1 Definition of Done

### Platform and tenancy

- [ ] Multiple organizations can exist with strict data isolation (tenant A cannot read tenant B)
- [ ] Roles enforced: SuperAdmin, Admin, Staff, Driver, Parent / Guardian
- [ ] All privileged and data mutations write to an audit log

### Fleet setup (Admin)

- [ ] CRUD for schools, vehicles, drivers, passengers, and org users
- [ ] Manual route create/edit with stops and capacity constraints
- [ ] Route optimization returns ordered stops with distance/duration estimates
- [ ] Trip scheduling with driver and vehicle assignment

### Field operations (Driver)

- [ ] Start and end trip with status lifecycle
- [ ] GPS location stream during active trip
- [ ] Check-in and check-out with OTP verification
- [ ] Optional photo proof stored with GPS tag and timestamp
- [ ] Offline queue syncs check-ins when connectivity returns

### Operations center (Admin + Staff)

- [ ] Live trip monitoring on dashboard map (realtime subscriptions)
- [ ] Staff can monitor without destructive fleet configuration access
- [ ] Basic reports: trip completion, on-time performance, attendance summary

### Family visibility (Guardian)

- [ ] Live tracking page scoped to linked passengers only
- [ ] Trip history for linked passengers
- [ ] Notifications on pickup, dropoff, and configurable delay templates

### Notifications

- [ ] At least one channel operational per org (Telegram, LINE, or FCM)
- [ ] Templates for pickup, dropoff, delay, and emergency events

### Quality bar

- [ ] Route optimization completes in under 2 seconds for 50 stops
- [ ] Type-check, lint, and critical-path tests pass in CI
- [ ] New developer can clone, configure env, and run locally in under 30 minutes (documented)

---

## Persona Success Criteria

### Admin

| Criterion | Pass condition |
|-----------|----------------|
| Full setup chain | Org → school → vehicle → driver → passenger → route → trip without leaving the product |
| Route optimization | Optimized order differs from naive ordering when stops ≥ 8; capacity never exceeded |
| Exception handling | Can reassign driver or update trip before and during active run |
| Reporting | Export or view attendance for a completed trip by date |

### Staff

| Criterion | Pass condition |
|-----------|----------------|
| Live visibility | Sees all org active trips on one screen |
| Least privilege | Cannot delete schools, routes, or change user roles |
| Support workflow | Can look up passenger by name and see current trip status |

### Driver

| Criterion | Pass condition |
|-----------|----------------|
| Trip clarity | Assigned trip shows stop order and expected passengers per stop |
| Check-in integrity | OTP mismatch blocks check-in; success records GPS |
| Offline resilience | Check-in queued offline appears in admin view after sync |

### Parent / Guardian

| Criterion | Pass condition |
|-----------|----------------|
| Tracking scope | Sees only linked passengers; cannot access admin routes or other children |
| Timeliness | Map position updates during active trip without manual refresh |
| Notification trust | Receives pickup notification without calling the school |

### SuperAdmin

| Criterion | Pass condition |
|-----------|----------------|
| Tenant isolation | Verified: cross-tenant read attempt returns empty or forbidden |
| Org lifecycle | Can provision and deactivate an organization |

---

## Measurable Thresholds

| Metric | Target | Measurement |
|--------|--------|-------------|
| GPS to dashboard latency | < 100ms | Realtime subscription timestamp delta |
| Notification delivery | < 30s from check-in event | Event log vs notification receipt |
| Route optimization (50 stops) | < 2s | API response time p95 |
| Guardian data isolation | 0 cross-passenger leaks | RBAC + RLS test suite |
| Local setup time | < 30 min | Timed onboarding using docs only |
| Lighthouse (dashboard) | ≥ 95 performance, a11y, best practices | Automated audit on key pages |

---

## Pain-to-Success Mapping

| Pain ID | Success criterion |
|---------|-------------------|
| P1 Manual routing | Admin runs optimization; driver receives updated stop list |
| P2 No live tracking | Guardian and staff see live map during active trip |
| P3 Poor communication | Automated notification on check-in within 30s |
| P4 Attendance gaps | Check-in record includes OTP, time, coordinates, optional photo |
| P5 Multi-vehicle coordination | Dashboard lists all active org trips with status |
| P7 Weak tenant isolation | RLS tests pass for two orgs with overlapping test data |

---

## Explicitly Not Required for v1 Success

These are valuable but out of scope for the first release definition:

- Native iOS/Android store apps (PWA or Capacitor wrapper is sufficient)
- AI demand prediction or dynamic route learning
- White-label branding per organization
- Multi-language UI
- Advanced geofencing rules beyond basic proximity alerts
- Billing and subscription management
- Custom per-org workflow builder

Deferring these keeps the school-bus scenario achievable on a free-tier stack within the planned build window.

---

## Pilot Readiness Checklist

Before calling v1 production-ready for a pilot school:

1. **One pilot organization** onboarded with real (or realistic) passenger data
2. **One full week** of AM and PM trips executed in the system
3. **Guardian feedback** — at least 5 families confirm tracking and notifications are usable
4. **Admin sign-off** — route planning and reports replace their spreadsheet workflow
5. **Security checklist** complete (RLS audit, CSP, secrets scan, rate limiting on public APIs)
6. **Runbook** exists for incident response and backup/restore

---

## Discovery Exit Link

These criteria feed the [one-pager](one-pager.md) and go / no-go decision: if the school-bus scenario is credible on paper and assumptions in [assumptions-and-risks.md](assumptions-and-risks.md) hold, discovery concludes **go** and market research begins.

---

## Related Documents

- [Problem statement](problem-statement.md)
- [Personas](personas.md)
- [Pain points](pain-points.md)
- [Assumptions & risks](assumptions-and-risks.md)
