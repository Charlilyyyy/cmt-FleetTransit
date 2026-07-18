# Driver App, Tracking & Parent Portal

Field operations and family-facing visibility for CMT Fleet Transit. Delivered as PWA routes in `apps/web` (no separate native app for v1).

---

## Driver App (`/driver`)

Mobile-first routes for drivers:

| Route | Purpose |
|-------|---------|
| `/driver` | Today's assigned trips |
| `/driver/trip/{id}` | Start trip, broadcast GPS, check passengers in/out |

### Trip flow

```
open trip → Start (status → active)
     │ watchPosition() every 5s → queue → POST /trips/{id}/location
     ▼
per stop: OTP + optional photo → POST /trips/{id}/checkin (pickup|dropoff)
     ▼
Complete (status → completed) → GPS watch stops
```

### Field hooks

| Hook | Role |
|------|------|
| `useGeolocation` | High-accuracy `watchPosition` with start/stop |
| `useCamera` | Photo capture (`capture=environment`) → data URL |
| `useOfflineQueue` | IndexedDB durable queue; auto-flush on reconnect |

---

## Offline Tolerance

Check-in and location writes are enqueued in IndexedDB (`cmt-offline` DB) and flushed when connectivity returns. Each event carries a `clientEventId` (UUID) so retries are idempotent. The service worker (`public/sw.js`) serves an offline shell and signals clients to flush via the `sync` event.

---

## Real-time Tracking

Driver GPS lands in `location_samples`; Supabase Realtime pushes changes to:

- the **dashboard** trip board (`useRealtimeTrips`), and
- the **parent** tracking view.

Target: driver location visible on the dashboard in < 100 ms via Realtime.

---

## Parent Portal (`/parent`)

| Route | Purpose |
|-------|---------|
| `/parent/tracking` | Live map + latest pickup/dropoff per child |
| `/parent/history` | Chronological check-in events per child |

Guardian-scoped APIs never expose admin data:

| Endpoint | Guard |
|----------|-------|
| `GET /api/parent/children` | Passengers linked to the signed-in guardian |
| `GET /api/parent/checkins?passengerId=` | Verifies guardian↔passenger link before returning events |

Check-in photos are stored in Supabase Storage with GPS coordinates and timestamps.

---

## PWA

| Asset | Role |
|-------|------|
| `public/manifest.json` | Install metadata |
| `public/sw.js` | Offline shell + navigation fallback + queue flush |
| `public/offline.html` | Shown when offline and uncached |
| `ServiceWorkerRegister` | Registers the worker at runtime |

---

## Related

- [Core APIs](../api/API.md)
- [Dashboard](../dashboard/DASHBOARD.md)
- [Authentication](../auth/AUTH.md)
