# Core Domain API

REST contracts for CMT Fleet Transit fleet operations. All routes live under `apps/web/src/app/api` and are guarded by session auth + RBAC.

---

## Conventions

| Aspect | Rule |
|--------|------|
| Auth | httpOnly `cmt_session` cookie (see [AUTH.md](../auth/AUTH.md)) |
| Tenant scope | Derived from session claims; `organizationId` query param only honored for superadmin |
| Success shape | `{ "data": ... }` |
| Error shape | `{ "error": string, "code": string }` |
| Validation | Zod schemas from `@cmt/shared` |
| Audit | Every mutation writes an `audit_logs` row |
| Rate limit | 10 writes/min per IP; 60 reads/min |

### Status codes

| Code | Meaning |
|------|---------|
| 200 / 201 | OK / created |
| 400 | Validation error (`VALIDATION_ERROR`, `BAD_JSON`) |
| 401 | No/invalid session (`UNAUTHENTICATED`) |
| 403 | RBAC or cross-tenant denial (`FORBIDDEN`, `CROSS_TENANT`) |
| 404 | Not found or not in your org |
| 409 | Invalid state transition (`INVALID_TRANSITION`) |
| 429 | Rate limited (`RATE_LIMIT`) |

---

## Endpoints

### Schools — `/api/schools`

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/api/schools` | staff+ | List org schools |
| POST | `/api/schools` | admin+ | Create school |
| GET | `/api/schools/{id}` | staff+ | Get school |
| PATCH | `/api/schools/{id}` | admin+ | Update school |
| DELETE | `/api/schools/{id}` | admin+ | Soft-delete (status → inactive) |

### Vehicles — `/api/vehicles`

CRUD identical to schools. Body: `label`, `licensePlate`, `seatCapacity`, `vehicleType` (`bus|van|car`).

### Drivers — `/api/drivers`

CRUD. Create body: `userId`, `licenseNumber?`, `licenseExpiry?` (YYYY-MM-DD), `emergencyContact?`.

### Passengers — `/api/passengers`

CRUD. Create body: `schoolId`, `firstName`, `lastName`, `grade?`, `defaultStop*?`, `otpSecret`.

### Users — `/api/users`

CRUD. Only superadmin may create/grant the `superadmin` role. Create body: `firebaseUid`, `role`, `firstName`, `lastName`, `email?`, `phone?`.

### Routes — `/api/routes`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/routes` | List routes |
| POST | `/api/routes` | Create route (`name`, `direction`, `schoolId?`, `vehicleId?`) |
| GET | `/api/routes/{id}` | Route with `stops[]` |
| PATCH | `/api/routes/{id}` | Update route |
| DELETE | `/api/routes/{id}` | Deactivate route |
| GET | `/api/routes/{id}/stops` | List stops |
| POST | `/api/routes/{id}/stops` | Add stop (`sequence`, `lat`, `lng`, `addressLabel`, `passengerId?`) |

### Trips — `/api/trips`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/trips?scheduledDate=&status=` | List trips |
| POST | `/api/trips` | Schedule trip (`routeId`, `driverId`, `vehicleId`, `scheduledDate`) |
| GET | `/api/trips/{id}` | Get trip |
| POST | `/api/trips/{id}/status` | Transition status |

**Trip lifecycle**

```
scheduled ──► active ──► completed
    │            │
    └──► cancelled ◄──┘
```

`active` sets `actualStartAt`; `completed` sets `actualEndAt`. Illegal transitions return 409.

### Audit — `/api/audit`

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/api/audit` | admin+ | Read org audit trail |

---

## End-to-end workflow

```
create org (superadmin)
  └► create user (admin)
       └► create school
            └► create vehicle + driver
                 └► create passenger
                      └► create route + stops
                           └► schedule trip
                                └► POST /trips/{id}/status {active} → {completed}
```

Every step above writes an `audit_logs` entry with `actorUserId`, `action`, and `entityId`.

---

## Related

- [Authentication](../auth/AUTH.md)
- [Database reference](../database/DATABASE.md)
- [Shared schemas](../../packages/shared/src/validation)
