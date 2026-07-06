# CMT Fleet Transit — Database Reference

Consolidated schema documentation for PostgreSQL on Supabase. Detailed column definitions: [schema.md](schema.md). Visual model: [erd.md](erd.md).

---

## Overview

| Item | Value |
|------|-------|
| Engine | PostgreSQL 15 (Supabase) |
| Tenancy | `organization_id` on all tenant tables |
| Auth link | `users.firebase_uid` ↔ Firebase Phone / LINE |
| Isolation | Row-Level Security (RLS) per role |
| Migrations | `supabase/migrations/` |
| Local seed | `supabase/seed.sql` |

---

## Entity Model (14 Tables)

```
organizations (tenant root)
├── users
├── schools
├── vehicles
├── drivers ──► users
├── passengers ──► schools
├── passenger_guardians ──► passengers, users (guardians)
├── guardian_devices ──► users
├── routes ──► schools, vehicles
├── route_stops ──► routes, passengers (optional)
├── trips ──► routes, drivers, vehicles
├── check_ins ──► trips, passengers, route_stops
├── locations ──► trips, drivers
├── notifications ──► users, trips, passengers, check_ins
└── audit_logs ──► users (actor)
```

---

## Enum Types

| Type | Values |
|------|--------|
| `user_role` | `superadmin`, `admin`, `staff`, `driver`, `parent` |
| `org_status` | `active`, `inactive`, `suspended` |
| `entity_status` | `active`, `inactive` |
| `route_direction` | `pickup`, `dropoff` |
| `trip_status` | `scheduled`, `active`, `completed`, `cancelled` |
| `check_in_type` | `pickup`, `dropoff` |
| `notification_channel` | `fcm`, `line`, `telegram` |
| `notification_status` | `pending`, `sent`, `failed` |

---

## Tables Summary

| Table | Tenant-scoped | Primary purpose |
|-------|---------------|-----------------|
| `organizations` | — | Operator account, notification config |
| `users` | ✓ | Login profiles, RBAC role |
| `schools` | ✓ | Schools / campuses served |
| `vehicles` | ✓ | Fleet units, seat capacity |
| `drivers` | ✓ | Driver profile linked to user |
| `passengers` | ✓ | Students / riders, OTP secret |
| `passenger_guardians` | ✓ | Guardian ↔ passenger M:N |
| `guardian_devices` | ✓ | FCM / LINE / Telegram endpoints |
| `routes` | ✓ | Named route template |
| `route_stops` | ✓ | Ordered stops with coordinates |
| `trips` | ✓ | Scheduled route execution |
| `check_ins` | ✓ | Boarding / alighting events |
| `locations` | ✓ | GPS samples during active trips |
| `notifications` | ✓ | Outbound message delivery log |
| `audit_logs` | ✓ | Privileged action audit trail |

Full column lists: [schema.md](schema.md).

---

## Roles & Access

| Role | Scope | Typical access |
|------|-------|----------------|
| `superadmin` | Global | Create orgs; no tenant data by default |
| `admin` | Own org | Full CRUD on org entities |
| `staff` | Own org | Read fleet + trips; limited writes |
| `driver` | Own org | Own trips, check-ins, GPS upload |
| `parent` | Linked passengers | Read linked passenger trips/check-ins |

RLS policy matrix and CI tests T1–T8: [rls-policies.md](rls-policies.md).

JWT helpers (set by API after Firebase verify):

- `app_organization_id()` — current tenant UUID
- `app_user_role()` — current role enum
- `app_user_id()` — current `users.id`
- `app_is_guardian_of(passenger_id)` — parent scope check

---

## Key Relationships

| From | To | Cardinality | Notes |
|------|-----|-------------|-------|
| `users` | `organizations` | N:1 | NULL org for superadmin |
| `drivers` | `users` | 1:1 | One driver profile per user |
| `passengers` | `schools` | N:1 | School assignment |
| `passenger_guardians` | `passengers`, `users` | M:N | Parent portal scope |
| `route_stops` | `passengers` | N:0..1 | Optional per-stop passenger |
| `trips` | `routes` | N:1 | Daily / scheduled runs |
| `check_ins` | `trips`, `passengers` | N:1 each | Idempotent via `client_event_id` |
| `locations` | `trips` | N:1 | Realtime subscription target |

---

## Indexes (Hot Paths)

| Query pattern | Index |
|---------------|-------|
| Org-scoped list | `(organization_id)` on all tenant tables |
| Active trips by date | `trips (organization_id, scheduled_date, status)` |
| Trip GPS stream | `locations (trip_id, recorded_at DESC)` |
| Guardian passengers | `passenger_guardians (guardian_user_id)` |
| Route stop order | `route_stops (route_id, sequence)` UNIQUE |

Full index list: [indexes.md](indexes.md).

---

## Migrations

| File | Contents |
|------|----------|
| `20240101000000_initial_schema.sql` | Enums, tables, triggers, Realtime |
| `20240101000001_rls_policies.sql` | RLS enable + policies + JWT helpers |
| `20240101000002_add_indexes.sql` | Performance indexes |

Strategy: [migrations.md](migrations.md).

```bash
supabase db reset    # local: migrate + seed
supabase db push     # remote: apply pending only
```

---

## Seed Data (Local Dev)

Two organizations for RLS testing:

| Org | Slug | Purpose |
|-----|------|---------|
| Lincoln Transport | `lincoln-transport` | School-bus pilot (Lincoln Elementary) |
| Metro Shuttle Co | `metro-shuttle` | Cross-tenant isolation test |

Specification: [seed-data.md](seed-data.md). SQL: [`supabase/seed.sql`](../../supabase/seed.sql).

**Do not run seed on production.**

---

## Realtime

Tables in `supabase_realtime` publication:

- `locations` — live map updates
- `trips` — status changes

---

## Storage

| Bucket | Purpose |
|--------|---------|
| `check-in-photos` | Optional boarding photo proof |

Path pattern: `{organization_id}/{trip_id}/{check_in_id}.jpg`

---

## Design Invariants

1. Every tenant row carries `organization_id` (except `organizations` and superadmin `users`).
2. Foreign keys stay within the same org (enforced at app layer + RLS).
3. Soft lifecycle via `status` enums — prefer deactivate over delete.
4. `client_event_id` on `check_ins` enables offline-first idempotent sync.
5. Service role bypasses RLS — server-only, never in client bundles.

---

## Verification Checklist

- [x] Schema matches [erd.md](erd.md) (14 entities)
- [x] Migrations apply with `supabase db reset`
- [x] RLS tests T1–T8 documented in [rls-policies.md](rls-policies.md)
- [x] Seed provides two-org isolation scenario
- [x] Indexes cover MVP query paths

---

## Related Documents

| Document | Link |
|----------|------|
| ERD | [erd.md](erd.md) |
| Full schema | [schema.md](schema.md) |
| RLS | [rls-policies.md](rls-policies.md) |
| Indexes | [indexes.md](indexes.md) |
| Migrations | [migrations.md](migrations.md) |
| Seed spec | [seed-data.md](seed-data.md) |
| ADR (Supabase + RLS) | [ADR-001](../architecture/adr/001-supabase-postgres-rls.md) |
