# Problem Statement

## Summary

Organizations that run passenger transport — schools, corporate shuttles, tour operators, and contracted fleet services — coordinate complex daily operations with spreadsheets, phone calls, and disconnected tools. Dispatchers lack live visibility, drivers work from paper manifests, and families have no reliable way to know where their passengers are. The result is wasted fuel, late arrivals, safety anxiety, and staff time lost to reactive firefighting.

CMT Fleet Transit exists to replace that patchwork with one multi-tenant platform: planned routes, live GPS, verified check-ins, and automated alerts to the people who need them.

---

## Who Hurts

### Transport operators and dispatch offices

Small and mid-size operators run 5–50 vehicles with lean back-office teams. Admins juggle route changes, driver assignments, vehicle maintenance windows, and parent inquiries in the same morning. Staff who should monitor trips spend hours on the phone confirming locations that a map could show in seconds.

### School administrators and transport coordinators

Schools outsource busing or run their own fleet. Coordinators must prove attendance, respond to late buses, and answer guardian calls during peak drop-off windows. A single missed stop creates liability exposure and reputational damage.

### Drivers in the field

Drivers follow static printouts that go stale the moment a passenger is absent or a road closes. They lack a simple workflow to confirm who boarded, capture proof when disputes arise, and broadcast position without juggling consumer messaging apps.

### Parents and guardians

Families plan mornings and pickups around estimated arrival times that are often wrong. When a bus is delayed, they call the school or driver directly — multiplying noise across the operation and offering no audit trail of who was told what and when.

### Platform operators (multi-org SaaS context)

Vendors serving many schools or shuttle programs need tenant isolation, role-based access, and auditability. Building that from scratch per customer is expensive; bolting generic fleet tools onto non-transport software leaves critical gaps (passenger check-in, guardian views, school-specific workflows).

---

## What Hurts

| Area | Current reality | Impact |
|------|-----------------|--------|
| Route planning | Manual ordering of stops; no capacity-aware optimization | Extra miles, fuel cost, inconsistent pickup times |
| Live visibility | No shared map; status lives in driver texts | Dispatch cannot intervene early; guardians assume the worst |
| Passenger accountability | Paper lists or honor-system boarding | Attendance disputes, child-safety gaps, compliance risk |
| Communication | Ad-hoc calls, SMS threads, informal group chats | Message overload, no templates, no org-level control |
| Multi-vehicle coordination | One dispatcher per cluster; no unified dashboard | Cascading delays when one vehicle falls behind |
| Data ownership | Siloed spreadsheets per route or school | No single source of truth for reports or incidents |

The pain is operational first, but the emotional weight falls on guardians waiting at a curb and on staff explaining delays they cannot see.

---

## Why Now

Several forces make a focused rebuild timely rather than optional:

1. **Post-pandemic expectations** — Families and employers expect digital visibility for anything involving safety or schedule reliability. "Call the driver" is no longer an acceptable default.

2. **Affordable building blocks** — Managed Postgres (with row-level security), realtime subscriptions, phone-based auth, maps APIs, and push notification channels can be composed into a credible v1 without enterprise licensing upfront.

3. **Mobile-first field staff** — Drivers already carry smartphones. A progressive web experience with offline tolerance meets them where they are without mandating a native app rollout on day one.

4. **Regulatory and reputational pressure** — Schools and child transport face heightened scrutiny on attendance proof, incident response, and data handling. Systems that cannot show *who was on the vehicle, when, and where* fall short of modern expectations.

5. **Fragmented incumbents** — Many existing tools optimize for long-haul logistics or generic fleet telematics, not recurring passenger routes with guardian-facing transparency. The gap between "GPS dots on a truck" and "my child was picked up" remains wide.

---

## Problem in One Sentence

**Passenger transport operators run blind, manual coordination stacks while families demand real-time certainty — and neither side has a single, trustworthy system built for multi-stop, multi-tenant, people-moving operations.**

---

## What Success Would Look Like (Problem Side)

If the problem is real, operators would pay for (or adopt) a system that:

- Cuts time spent on route planning and same-day reroutes
- Surfaces live vehicle position to staff and authorized guardians
- Records check-in/out with verifiable proof
- Sends consistent notifications without staff composing every message
- Scales across organizations without data leaking between tenants

The following discovery documents define *who* uses the product, *which pains* are in scope for v1, and *how* we will know the bet is worth pursuing.

---

## Related Documents

- [Personas](personas.md)
- [Pain points](pain-points.md)
- [Success criteria](success-criteria.md)
