# Route Optimization & Maps

Smart routing — CMT Fleet Transit's core differentiator.

| Document | Focus |
|----------|-------|
| [ROUTING.md](ROUTING.md) | Algorithm, distance matrix, optimize API, map UI |

## Implementation

| Area | Location |
|------|----------|
| Routing package | [`packages/routing`](../../packages/routing) |
| Optimize API | `apps/web/src/app/api/routes/optimize/route.ts` |
| Map components | `apps/web/src/components/maps` |

## Exit Criteria

- [x] Optimized route respects vehicle seat capacity
- [x] Distance/duration estimates match Google Maps within tolerance (live mode)
- [x] Algorithm and API documented in [ROUTING.md](ROUTING.md)

## Related

- [Core APIs](../api/API.md)
