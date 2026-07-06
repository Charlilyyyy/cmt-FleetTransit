# Row-Level Security Policies

RLS design for CMT Fleet Transit PostgreSQL. Every tenant table enforces `organization_id` isolation; role-specific policies match the [persona permission matrix](../discovery/personas.md).

SQL implementation: [migrations](migrations.md) file `*_rls_policies.sql`.

---

## Principles

| Principle | Implementation |
|-----------|----------------|
| **Default deny** | RLS enabled on all tenant tables; no policy = no access |
| **Tenant first** | `organization_id` must match JWT claim for all rows |
| **Role second** | `admin` > `staff` > `driver` / `parent` within org |
| **SuperAdmin** | Platform metadata only; no default passenger PII SELECT |
| **Guardian scope** | `parent` sees only linked passengers via `passenger_guardians` |
| **Driver scope** | `driver` writes check-ins and locations for assigned active trips |
| **Immutable audit** | `audit_logs`: INSERT only for app; no UPDATE/DELETE |
| **Service role bypass** | Migrations and ops scripts use service role — never in client |

---

## JWT Helper Functions

Created in migration before policies:

```sql
-- Returns Firebase UID from Supabase JWT (sub claim)
CREATE OR REPLACE FUNCTION auth.firebase_uid()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- Returns organization_id from custom claim
CREATE OR REPLACE FUNCTION auth.organization_id()
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'organization_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Returns role from custom claim
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::user_role;
$$ LANGUAGE SQL STABLE;

-- Lookup internal user id
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
  SELECT id FROM users
  WHERE firebase_uid = auth.firebase_uid()
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Superadmin check
CREATE OR REPLACE FUNCTION auth.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT auth.user_role() = 'superadmin';
$$ LANGUAGE SQL STABLE;

-- Guardian: passenger ids linked to current user
CREATE OR REPLACE FUNCTION auth.linked_passenger_ids()
RETURNS SETOF UUID AS $$
  SELECT passenger_id FROM passenger_guardians
  WHERE guardian_user_id = auth.user_id()
    AND organization_id = auth.organization_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Driver: active trip ids for current driver
CREATE OR REPLACE FUNCTION auth.assigned_trip_ids()
RETURNS SETOF UUID AS $$
  SELECT t.id FROM trips t
  JOIN drivers d ON d.id = t.driver_id
  WHERE d.user_id = auth.user_id()
    AND t.organization_id = auth.organization_id()
    AND t.status IN ('scheduled', 'active');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

---

## Policy Matrix by Role

| Table | superadmin | admin | staff | driver | parent |
|-------|------------|-------|-------|--------|--------|
| organizations | SELECT all; UPDATE | SELECT own | — | — | — |
| users | SELECT metadata | CRUD org users | SELECT org | SELECT self | SELECT self |
| schools | — | CRUD | SELECT | SELECT | — |
| vehicles | — | CRUD | SELECT | SELECT assigned | — |
| drivers | — | CRUD | SELECT | SELECT self | — |
| passengers | — | CRUD | SELECT | SELECT trip passengers | SELECT linked |
| passenger_guardians | — | CRUD | SELECT | — | SELECT own links |
| guardian_devices | — | — | — | — | CRUD own |
| routes | — | CRUD | SELECT | SELECT assigned | — |
| route_stops | — | CRUD | SELECT | SELECT assigned route | — |
| trips | SELECT count* | CRUD | SELECT | SELECT/UPDATE own | SELECT linked passenger trips |
| check_ins | — | SELECT | SELECT | INSERT/SELECT own trips | SELECT linked passengers |
| locations | — | SELECT | SELECT | INSERT/SELECT own trips | SELECT linked trips |
| notifications | — | SELECT | — | — | SELECT own |
| audit_logs | SELECT all | SELECT org | SELECT org | — | — |

\* SuperAdmin `organizations` SELECT only — not child table PII by default.

---

## Table Policies (Detail)

### organizations

| Policy | Operation | Role | USING / WITH CHECK |
|--------|-----------|------|---------------------|
| `org_superadmin_select` | SELECT | superadmin | `true` |
| `org_superadmin_update` | UPDATE | superadmin | `true` |
| `org_member_select` | SELECT | admin, staff, driver, parent | `id = auth.organization_id()` |
| `org_admin_insert` | INSERT | superadmin | new org bootstrap |

---

### users

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `users_org_admin_all` | ALL | admin | `organization_id = auth.organization_id()` |
| `users_staff_select` | SELECT | staff | same org |
| `users_self_select` | SELECT | driver, parent | `id = auth.user_id()` |
| `users_self_update` | UPDATE | driver, parent | `id = auth.user_id()` — limited columns via API |
| `users_superadmin_select` | SELECT | superadmin | `true` — metadata fields only in API layer |

---

### schools, vehicles, drivers, routes, route_stops

**Admin:** full CRUD where `organization_id = auth.organization_id()`.

**Staff:** SELECT only, same org filter.

**Driver:** SELECT where resource is on assigned trip or route:

```sql
-- Example: routes visible to driver on scheduled trip
USING (
  organization_id = auth.organization_id()
  AND auth.user_role() = 'driver'
  AND id IN (SELECT route_id FROM trips WHERE id IN (SELECT auth.assigned_trip_ids()))
)
```

---

### passengers

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `passengers_admin_all` | ALL | admin | org match |
| `passengers_staff_select` | SELECT | staff | org match |
| `passengers_driver_select` | SELECT | driver | passenger on assigned trip route_stops |
| `passengers_parent_select` | SELECT | parent | `id IN (SELECT auth.linked_passenger_ids())` |

**No** parent INSERT/UPDATE on passengers.

---

### passenger_guardians

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `pg_admin_all` | ALL | admin | org match |
| `pg_parent_select` | SELECT | parent | `guardian_user_id = auth.user_id()` |

---

### guardian_devices

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `gd_parent_all` | ALL | parent | `user_id = auth.user_id()` AND org match |

---

### trips

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `trips_admin_all` | ALL | admin | org match |
| `trips_staff_select` | SELECT | staff | org match |
| `trips_driver_select` | SELECT | driver | `id IN (SELECT auth.assigned_trip_ids())` OR driver_id matches |
| `trips_driver_update` | UPDATE | driver | `status` transitions only on own active trip |
| `trips_parent_select` | SELECT | parent | trip has linked passenger on route |

```sql
-- Parent trip visibility
USING (
  organization_id = auth.organization_id()
  AND auth.user_role() = 'parent'
  AND EXISTS (
    SELECT 1 FROM route_stops rs
    JOIN passenger_guardians pg ON pg.passenger_id = rs.passenger_id
    WHERE rs.route_id = trips.route_id
      AND pg.guardian_user_id = auth.user_id()
  )
)
```

---

### check_ins

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `checkins_admin_select` | SELECT | admin, staff | org match |
| `checkins_driver_insert` | INSERT | driver | trip in `auth.assigned_trip_ids()` |
| `checkins_driver_select` | SELECT | driver | own trips |
| `checkins_parent_select` | SELECT | parent | `passenger_id IN (SELECT auth.linked_passenger_ids())` |

**WITH CHECK on INSERT:** `driver_user_id = auth.user_id()`, valid `organization_id`.

---

### locations

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `locations_admin_select` | SELECT | admin, staff | org match |
| `locations_driver_insert` | INSERT | driver | `trip_id IN (SELECT auth.assigned_trip_ids())` AND trip `status = active` |
| `locations_driver_select` | SELECT | driver | own trips |
| `locations_parent_select` | SELECT | parent | trip visible per parent trip policy |

Realtime: subscribers must pass same RLS on `SELECT`.

---

### notifications

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `notif_admin_select` | SELECT | admin | org match |
| `notif_parent_select` | SELECT | parent | `recipient_user_id = auth.user_id()` |
| `notif_system_insert` | INSERT | service role | API inserts via server client |

---

### audit_logs

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| `audit_admin_select` | SELECT | admin, staff | org match |
| `audit_superadmin_select` | SELECT | superadmin | `true` |
| `audit_insert` | INSERT | authenticated | org match; actor = `auth.user_id()` |
| — | UPDATE, DELETE | — | **No policies** (denied) |

---

## Storage Bucket RLS (`check-in-photos`)

| Policy | Role | Path rule |
|--------|------|-----------|
| `photos_driver_insert` | driver | `{org_id}/{trip_id}/*` on active trip |
| `photos_admin_select` | admin | `{org_id}/*` |
| `photos_parent_select` | parent | path contains linked `passenger_id` |

Signed URLs generated server-side for time-limited guardian access.

---

## Enable RLS (All Tables)

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

---

## Cross-Tenant Test Cases (CI Required)

| # | Test | Expected |
|---|------|----------|
| T1 | User org A SELECT passengers org B | 0 rows |
| T2 | User org A INSERT school with org B id | WITH CHECK fails |
| T3 | Parent A SELECT passenger linked to B | 0 rows |
| T4 | Driver A INSERT check_in on org B trip | denied |
| T5 | Staff SELECT trips own org | ≥ 0 rows |
| T6 | Staff DELETE school | denied |
| T7 | Parent SELECT audit_logs | denied |
| T8 | Superadmin SELECT passengers (default policy) | 0 rows or API blocks |

**Release blocker:** T1–T4 must pass before pilot ([E1-AC3](../requirements/mvp-backlog.md)).

---

## Policy Naming Convention

```
{table}_{role}_{operation}
```

Examples: `trips_admin_all`, `checkins_driver_insert`, `passengers_parent_select`

---

## Performance Notes

- Helper functions marked `STABLE` where possible
- `auth.linked_passenger_ids()` cached per statement
- Indexes on `organization_id`, `trip_id`, `passenger_guardians.guardian_user_id` — see [indexes](indexes.md)
- Avoid `SECURITY DEFINER` except controlled helpers

---

## Related Documents

- [Schema](schema.md)
- [Indexes](indexes.md)
- [Migrations](migrations.md)
- [ADR-001](../architecture/adr/001-supabase-postgres-rls.md)
