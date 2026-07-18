# Operations Dashboard

Web admin UI for fleet operations.

| Document | Focus |
|----------|-------|
| [DASHBOARD.md](DASHBOARD.md) | Layout, pages, data flow, real-time, states |

## Implementation

| Area | Location |
|------|----------|
| Layout & nav | `apps/web/src/components/dashboard` |
| UI primitives | `apps/web/src/components/ui` |
| Pages | `apps/web/src/app/dashboard/*` |
| Data hooks | `apps/web/src/hooks/useResource.ts`, `useRealtimeTrips.ts` |

## Exit Criteria

- [x] Staff can monitor live trips without edit permissions
- [x] Admin can complete the daily ops workflow from the UI
- [x] Loading, empty, and error states on every list

## Related

- [Core APIs](../api/API.md)
