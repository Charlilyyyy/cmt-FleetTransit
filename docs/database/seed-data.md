# Seed Data

Development seed specification for CMT Fleet Transit. Supports the [school-bus anchor scenario](../discovery/success-criteria.md) and **two-tenant RLS testing**.

**File:** [`supabase/seed.sql`](../../supabase/seed.sql)  
**Apply:** `supabase db reset` (runs migrations + seed locally)

---

## Goals

| Goal | How seed supports it |
|------|----------------------|
| Demo school-bus flow | Org A with school, bus, driver, passengers, route, trip |
| RLS isolation test | Org B with separate data — tenant A must not see B |
| Local login mapping | Fixed `firebase_uid` placeholders for dev auth wiring |
| Repeatable UUIDs | Deterministic IDs for docs and integration tests |

---

## Organizations

| ID (prefix) | Name | Slug | Purpose |
|-------------|------|------|---------|
| `a0000000-…` | Lincoln Transport | `lincoln-transport` | Primary pilot org |
| `b0000000-…` | Metro Shuttle Co | `metro-shuttle` | RLS isolation org |

---

## Org A — Lincoln Transport (Pilot)

### Users

| firebase_uid | Role | Name | Notes |
|--------------|------|------|-------|
| `dev-admin-a` | admin | Alice Admin | Org admin |
| `dev-staff-a` | staff | Sam Staff | Read-only monitor |
| `dev-driver-a` | driver | Juan Driver | Assigned driver |
| `dev-parent-a1` | parent | Maria Guardian | Linked to passenger 1 |
| `dev-parent-a2` | parent | Leo Guardian | Linked to passenger 2 |

### Fleet

| Entity | Details |
|--------|---------|
| School | Lincoln Elementary |
| Vehicle | Bus 12, 40 seats, plate `LIN-012` |
| Passengers | 3 students (Maria S., Leo T., Ana K.) |
| Route | AM Lincoln Pickup, 5 stops, pickup direction |
| Trip | Today+1 scheduled, Juan + Bus 12 |

### OTP secrets (dev only)

Passengers use plaintext `otp_secret` in seed for local testing — **never in production** (hash in app).

| Passenger | otp_secret (dev) |
|-----------|------------------|
| Maria Santos | `1234` |
| Leo Torres | `2345` |
| Ana Kim | `3456` |

---

## Org B — Metro Shuttle Co (RLS Test)

Minimal data to verify cross-tenant denial:

| Entity | Details |
|--------|---------|
| User | `dev-admin-b` (admin) |
| School | Riverside Academy |
| Passenger | 1 student (different org) |

**Test:** User `dev-admin-a` must get 0 rows from Org B `passengers`.

---

## SuperAdmin

| firebase_uid | Role | organization_id |
|--------------|------|-----------------|
| `dev-superadmin` | superadmin | NULL |

Used for org provisioning tests only.

---

## Fixed UUID Reference

See `seed.sql` header comment block for full UUID list. Key IDs:

```
ORG_A     = a0000000-0000-4000-8000-000000000001
ORG_B     = b0000000-0000-4000-8000-000000000001
SCHOOL_A  = a0000000-0000-4000-8000-000000000010
ROUTE_A   = a0000000-0000-4000-8000-000000000050
TRIP_A    = a0000000-0000-4000-8000-000000000060
```

---

## Loading Seed

```bash
# Local (migrations + seed)
supabase db reset

# Remote — do NOT run seed on production
# Use seed only on local/staging
```

---

## Customizing

| Change | Edit |
|--------|------|
| More passengers | Add rows in `seed.sql` + `passenger_guardians` |
| Active trip for GPS test | Set trip `status = 'active'`, insert `locations` |
| Notification test | Add `guardian_devices` with test FCM token |

---

## Security Warning

- Seed contains **dev OTP secrets** and placeholder Firebase UIDs
- Never deploy `seed.sql` to production
- Rotate all secrets if seed ever applied to shared staging with real auth

---

## Related Documents

- [DATABASE.md](DATABASE.md)
- [RLS policies](rls-policies.md) — tests T1–T8
- [Migrations](migrations.md)
