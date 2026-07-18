# Field Operations

Driver app, real-time tracking, and the parent portal.

| Document | Focus |
|----------|-------|
| [FIELD.md](FIELD.md) | Driver flow, offline queue, tracking, parent portal, PWA |

## Implementation

| Area | Location |
|------|----------|
| Driver app | `apps/web/src/app/driver` |
| Parent portal | `apps/web/src/app/parent` |
| Field hooks | `apps/web/src/hooks/{useGeolocation,useCamera,useOfflineQueue}.ts` |
| PWA | `apps/web/public/sw.js`, `apps/web/src/components/ServiceWorkerRegister.tsx` |

## Exit Criteria

- [x] Driver location updates reach the dashboard via Realtime
- [x] Check-in photo stored with timestamp + coordinates
- [x] Parent sees pickup/dropoff events without admin access

## Related

- [Dashboard](../dashboard/DASHBOARD.md)
