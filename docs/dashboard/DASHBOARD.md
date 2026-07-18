# Operations Dashboard

The web admin control center for CMT Fleet Transit. Built with Next.js App Router, Tailwind, and reusable UI primitives under `apps/web/src/components/ui`.

---

## Layout

`DashboardLayout` renders a role-aware sidebar and a top bar with sign-out. Navigation items are filtered by role via `visibleNav(role)`:

| Item | Roles |
|------|-------|
| Overview, Trips, Routes, Vehicles, Passengers, Schools, Reports | staff+ |
| Drivers, Users, Audit | admin+ |

---

## Pages

| Route | Purpose |
|-------|---------|
| `/dashboard` | KPI overview (trips today, active, vehicles, drivers) |
| `/dashboard/trips` | Live trip board with status transitions |
| `/dashboard/routes` | Routes with distance/duration |
| `/dashboard/vehicles` | Fleet + seat capacity |
| `/dashboard/drivers` | Drivers + license status |
| `/dashboard/passengers` | Riders + default stops |
| `/dashboard/schools` | Served sites |
| `/dashboard/users` | Team + roles |
| `/dashboard/reports` | Completion, on-time, cancellations |
| `/dashboard/audit` | Mutation trail |
| `/dashboard/settings` | Account + org config |

---

## Data flow

- `useResource<T>(url)` — client fetch of `{ data }` with loading/error states.
- `mutateResource(url, method, body)` — POST/PATCH/DELETE helper.
- `ResourceTable` — generic table with skeleton loading, error, and empty states.

---

## Real-time monitoring

`useRealtimeTrips()` subscribes to Supabase Realtime `postgres_changes` on `trips` and `location_samples`. The trips board refetches on each change, so staff watch live status without editing. Degrades gracefully (no-op) when Supabase env vars are absent.

---

## States

Every list handles three non-happy states:

| State | UI |
|-------|-----|
| Loading | `Skeleton` rows |
| Empty | `EmptyState` with hint |
| Error | Inline destructive banner |

Route-level `loading.tsx` and `error.tsx` provide App Router suspense and error boundaries.

---

## Access model

- **Staff** see monitoring pages but not Drivers/Users/Audit, and cannot transition trip status.
- **Admin/Superadmin** get full control including trip lifecycle actions.

---

## Related

- [Core APIs](../api/API.md)
- [Authentication](../auth/AUTH.md)
- [Routing](../routing/ROUTING.md)
