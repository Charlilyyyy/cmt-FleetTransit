# Schema Reference

Table and column definitions for CMT Fleet Transit PostgreSQL (Supabase). Aligns with [ERD](erd.md). SQL implementation follows in [migrations](migrations.md).

---

## Enum Types

| Type | Values | Used by |
|------|--------|---------|
| `user_role` | `superadmin`, `admin`, `staff`, `driver`, `parent` | `users.role` |
| `org_status` | `active`, `inactive`, `suspended` | `organizations.status` |
| `entity_status` | `active`, `inactive` | passengers, vehicles, drivers |
| `route_direction` | `pickup`, `dropoff` | `routes.direction` |
| `trip_status` | `scheduled`, `active`, `completed`, `cancelled` | `trips.status` |
| `check_in_type` | `pickup`, `dropoff` | `check_ins.type` |
| `notification_channel` | `fcm`, `line`, `telegram` | `notifications.channel` |
| `notification_status` | `pending`, `sent`, `failed` | `notifications.status` |

---

## organizations

Root tenant table. No `organization_id` — this **is** the tenant.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, default `gen_random_uuid()` | Tenant ID |
| `name` | `TEXT` | NOT NULL | Operator display name |
| `slug` | `TEXT` | UNIQUE | URL-safe identifier |
| `status` | `org_status` | NOT NULL, default `active` | |
| `contact_email` | `TEXT` | | Billing / admin contact |
| `contact_phone` | `TEXT` | | |
| `photo_proof_required` | `BOOLEAN` | NOT NULL, default `false` | Org opt-in for check-in photos |
| `line_channel_access_token` | `TEXT` | | Encrypted at app layer recommended |
| `line_channel_secret` | `TEXT` | | |
| `telegram_bot_token` | `TEXT` | | |
| `notification_config` | `JSONB` | NOT NULL, default `{}` | Template toggles per event type |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |

---

## users

Authenticated profiles synced from Firebase.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK → organizations, NULL for superadmin | Tenant scope |
| `firebase_uid` | `TEXT` | UNIQUE, NOT NULL | Firebase user ID |
| `role` | `user_role` | NOT NULL | RBAC role |
| `email` | `TEXT` | | Optional |
| `phone` | `TEXT` | | E.164 format |
| `line_user_id` | `TEXT` | | LINE user ID when linked |
| `first_name` | `TEXT` | NOT NULL | |
| `last_name` | `TEXT` | NOT NULL | |
| `status` | `entity_status` | NOT NULL, default `active` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

**Note:** `superadmin` rows may have `organization_id` NULL.

---

## schools

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK → organizations, NOT NULL | |
| `name` | `TEXT` | NOT NULL | |
| `address` | `TEXT` | | |
| `lat` | `DOUBLE PRECISION` | | Campus / office coordinates |
| `lng` | `DOUBLE PRECISION` | | |
| `contact_name` | `TEXT` | | |
| `contact_phone` | `TEXT` | | |
| `status` | `entity_status` | NOT NULL, default `active` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

---

## vehicles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `label` | `TEXT` | NOT NULL | e.g. "Bus 12" |
| `license_plate` | `TEXT` | NOT NULL | |
| `seat_capacity` | `INTEGER` | NOT NULL, CHECK `> 0` | Max passengers |
| `vehicle_type` | `TEXT` | | `bus`, `van`, `car` |
| `status` | `entity_status` | NOT NULL, default `active` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

**Unique:** `(organization_id, license_plate)`

---

## drivers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `user_id` | `UUID` | FK → users, UNIQUE, NOT NULL | Linked login |
| `license_number` | `TEXT` | | |
| `license_expiry` | `DATE` | | |
| `emergency_contact` | `TEXT` | | |
| `status` | `entity_status` | NOT NULL, default `active` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

---

## passengers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `school_id` | `UUID` | FK → schools, NOT NULL | |
| `first_name` | `TEXT` | NOT NULL | |
| `last_name` | `TEXT` | NOT NULL | |
| `grade` | `TEXT` | | Optional |
| `default_stop_lat` | `DOUBLE PRECISION` | | Home / pickup point |
| `default_stop_lng` | `DOUBLE PRECISION` | | |
| `default_stop_address` | `TEXT` | | |
| `otp_secret` | `TEXT` | NOT NULL | Hashed OTP seed |
| `status` | `entity_status` | NOT NULL, default `active` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

---

## passenger_guardians

Links guardian users to passengers (N:M).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | Denormalized for RLS |
| `passenger_id` | `UUID` | FK → passengers, NOT NULL | |
| `guardian_user_id` | `UUID` | FK → users, NOT NULL | Must be `role = parent` |
| `relationship` | `TEXT` | | e.g. mother, father |
| `is_primary` | `BOOLEAN` | NOT NULL, default `false` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |

**Unique:** `(passenger_id, guardian_user_id)`

---

## guardian_devices

Notification endpoints per guardian.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `user_id` | `UUID` | FK → users, NOT NULL | Guardian user |
| `channel` | `notification_channel` | NOT NULL | |
| `fcm_token` | `TEXT` | | When channel = fcm |
| `line_user_id` | `TEXT` | | When channel = line |
| `telegram_chat_id` | `TEXT` | | When channel = telegram |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

---

## routes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `school_id` | `UUID` | FK → schools | Optional |
| `vehicle_id` | `UUID` | FK → vehicles | Capacity reference |
| `name` | `TEXT` | NOT NULL | e.g. "AM Lincoln Pickup" |
| `direction` | `route_direction` | NOT NULL | |
| `total_distance_m` | `INTEGER` | default `0` | From optimizer |
| `estimated_duration_s` | `INTEGER` | default `0` | |
| `is_active` | `BOOLEAN` | NOT NULL, default `true` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

---

## route_stops

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `route_id` | `UUID` | FK → routes, NOT NULL | |
| `sequence` | `INTEGER` | NOT NULL | 1-based order |
| `passenger_id` | `UUID` | FK → passengers | Optional if generic stop |
| `lat` | `DOUBLE PRECISION` | NOT NULL | |
| `lng` | `DOUBLE PRECISION` | NOT NULL | |
| `address_label` | `TEXT` | NOT NULL | |
| `estimated_arrival_offset_s` | `INTEGER` | | Seconds from trip start |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

**Unique:** `(route_id, sequence)`

---

## trips

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `route_id` | `UUID` | FK → routes, NOT NULL | |
| `driver_id` | `UUID` | FK → drivers, NOT NULL | |
| `vehicle_id` | `UUID` | FK → vehicles, NOT NULL | |
| `scheduled_date` | `DATE` | NOT NULL | Service date |
| `scheduled_start_at` | `TIMESTAMPTZ` | | |
| `actual_start_at` | `TIMESTAMPTZ` | | Set on trip start |
| `actual_end_at` | `TIMESTAMPTZ` | | Set on trip end |
| `status` | `trip_status` | NOT NULL, default `scheduled` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | |

---

## check_ins

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `trip_id` | `UUID` | FK → trips, NOT NULL | |
| `passenger_id` | `UUID` | FK → passengers, NOT NULL | |
| `route_stop_id` | `UUID` | FK → route_stops | |
| `driver_user_id` | `UUID` | FK → users, NOT NULL | |
| `type` | `check_in_type` | NOT NULL | pickup / dropoff |
| `lat` | `DOUBLE PRECISION` | NOT NULL | GPS at event |
| `lng` | `DOUBLE PRECISION` | NOT NULL | |
| `photo_storage_path` | `TEXT` | | Supabase Storage path |
| `client_event_id` | `UUID` | UNIQUE | Idempotency from offline queue |
| `recorded_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |

---

## locations

High-volume GPS samples during active trips.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `trip_id` | `UUID` | FK → trips, NOT NULL | |
| `driver_id` | `UUID` | FK → drivers | |
| `lat` | `DOUBLE PRECISION` | NOT NULL | |
| `lng` | `DOUBLE PRECISION` | NOT NULL | |
| `heading` | `REAL` | | Degrees |
| `speed` | `REAL` | | m/s or km/h — document in migration |
| `accuracy` | `REAL` | | Meters |
| `recorded_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |

**Retention:** Consider partition or purge job post-pilot.

---

## notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `recipient_user_id` | `UUID` | FK → users, NOT NULL | Guardian |
| `trip_id` | `UUID` | FK → trips | |
| `passenger_id` | `UUID` | FK → passengers | |
| `check_in_id` | `UUID` | FK → check_ins | |
| `channel` | `notification_channel` | NOT NULL | |
| `type` | `TEXT` | NOT NULL | pickup, dropoff, delay, emergency |
| `title` | `TEXT` | NOT NULL | |
| `body` | `TEXT` | NOT NULL | |
| `status` | `notification_status` | NOT NULL, default `pending` | |
| `provider_message_id` | `TEXT` | | External ref |
| `sent_at` | `TIMESTAMPTZ` | | |
| `error_message` | `TEXT` | | On failure |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | |

---

## audit_logs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK | |
| `organization_id` | `UUID` | FK, NOT NULL | |
| `actor_user_id` | `UUID` | FK → users | NULL for system |
| `action` | `TEXT` | NOT NULL | create, update, delete, login |
| `entity_type` | `TEXT` | NOT NULL | school, route, trip, … |
| `entity_id` | `UUID` | NOT NULL | |
| `metadata` | `JSONB` | default `{}` | Before/after diff |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` | |

**Immutable:** No UPDATE/DELETE policies for app roles.

---

## Cross-Table Constraints

| Rule | Enforcement |
|------|-------------|
| Same org on FK chain | `trips.organization_id` = `routes.organization_id` = `drivers.organization_id` — app + trigger optional |
| Guardian link | `passenger_guardians.guardian_user_id` must reference `users.role = parent` |
| Driver link | `drivers.user_id` must reference `users.role = driver` |
| Seat capacity | Validated in optimizer API, not DB CHECK on trips |
| Soft delete | Use `status = inactive`; retain FK history |

---

## Storage Buckets (Supabase)

| Bucket | Path pattern | RLS |
|--------|--------------|-----|
| `check-in-photos` | `{org_id}/{trip_id}/{passenger_id}/{uuid}.jpg` | Org + guardian read |

Metadata duplicated in `check_ins.photo_storage_path`.

---

## JWT Claims Used by RLS

| Claim | Source | Purpose |
|-------|--------|---------|
| `sub` / `firebase_uid` | Firebase | Map to `users.firebase_uid` |
| `role` | Custom claim | RBAC in policies |
| `organization_id` | Custom claim | Tenant filter |

Helper function (migration): `auth.organization_id()` returns UUID from JWT.

---

## Table Count Summary

| Category | Tables |
|----------|--------|
| Tenancy | organizations |
| Identity | users, drivers, passenger_guardians, guardian_devices |
| Fleet | schools, vehicles, passengers |
| Routing | routes, route_stops |
| Operations | trips, check_ins, locations |
| Comms | notifications |
| Compliance | audit_logs |

**Total:** 14 tables

---

## Related Documents

- [ERD](erd.md)
- [RLS policies](rls-policies.md)
- [Indexes](indexes.md)
- [Migrations](migrations.md)
