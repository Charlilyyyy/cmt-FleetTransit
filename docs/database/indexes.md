# Database Indexes

Performance indexes for CMT Fleet Transit hot query paths. Supports [NFR-P01](../requirements/non-functional-requirements.md) (list reads < 500ms p95) and RLS policy evaluation in [rls-policies](rls-policies.md).

SQL implementation: migration `*_add_indexes.sql`.

---

## Hot Query Paths

| Query | Used by | Frequency |
|-------|---------|-----------|
| Trips by org + date + status | Dashboard live board | Every page load |
| Locations by trip (latest) | Realtime map, guardian tracking | Every 5s per active trip |
| Passengers by org (+ school) | Admin CRUD, search | Daily |
| Check-ins by trip | Attendance report | Per trip completion |
| Guardian linked passengers | Parent portal RLS | Every parent request |
| Driver assigned trips today | Driver PWA | Trip start |
| Audit logs by org + date | Admin compliance | Weekly |
| Notifications by recipient | Guardian inbox | On event |

---

## Index Strategy

| Rule | Rationale |
|------|-----------|
| Lead with `organization_id` | RLS filters every query by tenant |
| Composite indexes match `WHERE` + `ORDER BY` | Avoid sort steps |
| Partial indexes for active rows | Smaller index when `status` filtered |
| Avoid over-indexing `locations` | High write volume — only trip + time |
| `UNIQUE` constraints double as indexes | Already covered in [schema](schema.md) |

---

## organizations

| Index | Columns | Purpose |
|-------|---------|---------|
| PK | `id` | Default |
| `idx_organizations_slug` | `slug` | UNIQUE lookup |
| `idx_organizations_status` | `status` | SuperAdmin org list |

---

## users

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_users_firebase_uid` | `firebase_uid` | UNIQUE — auth lookup |
| `idx_users_org_id` | `organization_id` | Tenant filter |
| `idx_users_org_role` | `(organization_id, role)` | Admin user management |
| `idx_users_phone` | `(organization_id, phone)` | Search |

```sql
CREATE UNIQUE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_users_org_role ON users(organization_id, role);
```

---

## schools

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_schools_org_id` | `organization_id` | List schools per org |
| `idx_schools_org_status` | `(organization_id, status)` | Active schools only |

---

## vehicles

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_vehicles_org_id` | `organization_id` | Fleet list |
| `idx_vehicles_org_plate` | `(organization_id, license_plate)` | UNIQUE |

---

## drivers

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_drivers_user_id` | `user_id` | UNIQUE — user → driver |
| `idx_drivers_org_id` | `organization_id` | Org driver list |

---

## passengers

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_passengers_org_id` | `organization_id` | **Hot:** passengers by org |
| `idx_passengers_org_school` | `(organization_id, school_id)` | School roster |
| `idx_passengers_org_name` | `(organization_id, last_name, first_name)` | Search / sort |

```sql
CREATE INDEX idx_passengers_org_id ON passengers(organization_id);
CREATE INDEX idx_passengers_org_school ON passengers(organization_id, school_id);
CREATE INDEX idx_passengers_org_name ON passengers(organization_id, last_name, first_name);
```

---

## passenger_guardians

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_pg_guardian` | `guardian_user_id` | **Hot:** RLS linked passengers |
| `idx_pg_passenger` | `passenger_id` | Reverse lookup |
| `idx_pg_org_guardian` | `(organization_id, guardian_user_id)` | Parent portal |

```sql
CREATE INDEX idx_pg_guardian ON passenger_guardians(guardian_user_id);
CREATE INDEX idx_pg_org_guardian ON passenger_guardians(organization_id, guardian_user_id);
```

---

## guardian_devices

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_gd_user_channel` | `(user_id, channel)` | Notification dispatch |

---

## routes

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_routes_org_id` | `organization_id` | Route list |
| `idx_routes_org_active` | `(organization_id, is_active)` | Active routes dashboard |

---

## route_stops

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_route_stops_route_seq` | `(route_id, sequence)` | UNIQUE — ordered stops |
| `idx_route_stops_passenger` | `passenger_id` | Passenger → routes |
| `idx_route_stops_org` | `organization_id` | RLS helper |

---

## trips

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_trips_org_date` | `(organization_id, scheduled_date DESC)` | **Hot:** trips by date |
| `idx_trips_org_status` | `(organization_id, status)` | Live board filter |
| `idx_trips_org_date_status` | `(organization_id, scheduled_date, status)` | **Hot:** today's active trips |
| `idx_trips_driver_id` | `driver_id` | Driver assigned trips |
| `idx_trips_route_id` | `route_id` | Route history |

```sql
CREATE INDEX idx_trips_org_date_status
  ON trips(organization_id, scheduled_date, status);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
```

**Partial index (optional):**

```sql
CREATE INDEX idx_trips_active
  ON trips(organization_id, scheduled_date)
  WHERE status IN ('scheduled', 'active');
```

---

## check_ins

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_checkins_trip_id` | `trip_id` | Attendance per trip |
| `idx_checkins_passenger` | `passenger_id` | Guardian history |
| `idx_checkins_org_trip` | `(organization_id, trip_id)` | Report query |
| `idx_checkins_client_event` | `client_event_id` | UNIQUE — offline idempotency |

```sql
CREATE INDEX idx_checkins_trip_id ON check_ins(trip_id);
CREATE UNIQUE INDEX idx_checkins_client_event ON check_ins(client_event_id)
  WHERE client_event_id IS NOT NULL;
```

---

## locations

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_locations_trip_time` | `(trip_id, recorded_at DESC)` | **Hot:** latest position per trip |
| `idx_locations_org_trip` | `(organization_id, trip_id)` | RLS + dashboard |

```sql
CREATE INDEX idx_locations_trip_time ON locations(trip_id, recorded_at DESC);
```

**Note:** Do not index `lat`/`lng` for v1 unless geospatial queries added. High INSERT rate during active trips.

**Retention:** Consider dropping locations older than N days via scheduled job — index stays small.

---

## notifications

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_notifications_recipient` | `recipient_user_id` | Guardian inbox |
| `idx_notifications_org_status` | `(organization_id, status)` | Pending retry queue |
| `idx_notifications_created` | `created_at DESC` | Admin log |

---

## audit_logs

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_audit_org_created` | `(organization_id, created_at DESC)` | **Hot:** audit search |
| `idx_audit_entity` | `(organization_id, entity_type, entity_id)` | Entity history |

```sql
CREATE INDEX idx_audit_org_created ON audit_logs(organization_id, created_at DESC);
```

---

## Query → Index Map

| Application query | Index used |
|-------------------|------------|
| `SELECT * FROM trips WHERE organization_id = ? AND scheduled_date = ? AND status = 'active'` | `idx_trips_org_date_status` |
| `SELECT * FROM locations WHERE trip_id = ? ORDER BY recorded_at DESC LIMIT 1` | `idx_locations_trip_time` |
| `SELECT * FROM passengers WHERE organization_id = ? AND school_id = ?` | `idx_passengers_org_school` |
| `SELECT passenger_id FROM passenger_guardians WHERE guardian_user_id = ?` | `idx_pg_guardian` |
| `SELECT * FROM check_ins WHERE trip_id = ?` | `idx_checkins_trip_id` |
| `SELECT * FROM trips WHERE driver_id = ? AND scheduled_date = ?` | `idx_trips_driver_id` + date filter |
| `SELECT * FROM audit_logs WHERE organization_id = ? ORDER BY created_at DESC` | `idx_audit_org_created` |

---

## RLS Performance

RLS policies filter on `organization_id` on nearly every table. **Every tenant table must have an index starting with `organization_id`** (or PK on `id` with org in composite queries).

| Helper function | Supporting index |
|-----------------|------------------|
| `auth.linked_passenger_ids()` | `idx_pg_guardian` |
| `auth.assigned_trip_ids()` | `idx_trips_driver_id`, `idx_drivers_user_id` |
| `auth.user_id()` | `idx_users_firebase_uid` |

---

## Migration File Order

Indexes created **after** initial schema and RLS in separate migration:

```
20240101000000_initial_schema.sql
20240101000001_rls_policies.sql
20240101000002_add_indexes.sql   ← this content
```

Use `CREATE INDEX IF NOT EXISTS` for idempotent re-runs in dev.

---

## Monitoring

| Signal | Action |
|--------|--------|
| Seq scan on `trips` | Verify `organization_id` in WHERE |
| Slow `locations` latest | Confirm `idx_locations_trip_time` used |
| Index bloat on `locations` | Run retention purge |
| `EXPLAIN ANALYZE` p95 > 100ms | Add composite or partial index |

---

## Related Documents

- [Schema](schema.md)
- [RLS policies](rls-policies.md)
- [Migrations](migrations.md)
