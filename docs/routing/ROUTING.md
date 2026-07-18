# Route Optimization

How CMT Fleet Transit turns a depot plus a set of stops into capacity-feasible, distance-minimized routes. Implemented in [`packages/routing`](../../packages/routing).

---

## Pipeline

```
stops + depot + vehicle capacity
        │
        ▼
1. DistanceCalculator ──► N×N distance & duration matrix
        │   (Google Distance Matrix, else cached haversine × road factor)
        ▼
2. Clarke-Wright Savings ──► capacity-feasible route clusters
        │
        ▼
3. 2-opt improvement ──► locally optimal stop order per route
        │
        ▼
OptimizeResult { routes[], totalDistanceM, estimatedDurationS, computeMs }
```

---

## 1. Distance Matrix

`DistanceCalculator.buildMatrix(points)` returns symmetric meter/second matrices where index `0` is the depot.

| Mode | Trigger | Notes |
|------|---------|-------|
| Live | `GOOGLE_MAPS_SERVER_KEY` present | Google Distance Matrix API, driving mode |
| Fallback | No key / API error | Haversine × 1.3 road factor, ~40 km/h |

An **LRU cache** (`LruCache`, capacity 5000) memoizes pairwise estimates keyed by rounded coordinates, so repeated optimizations avoid recomputation.

---

## 2. Clarke-Wright Savings

For each stop pair `(i, j)` the savings of serving them on one route instead of two:

```
s(i, j) = d(depot, i) + d(depot, j) − d(i, j)
```

Pairs are sorted by descending savings and greedily merged while:

- the two stops sit at route endpoints, and
- the combined seat demand ≤ vehicle capacity.

This yields the minimal number of capacity-feasible routes without exceeding seat limits.

---

## 3. 2-opt Improvement

Each route is refined by `twoOptImprove`: repeatedly reverse a segment when it shortens the depot→…→depot tour, until no improving move remains (2-opt local optimum). Capped at 20 passes for bounded runtime.

---

## API

`POST /api/routes/optimize`

```json
{
  "routeId": "uuid",
  "depot": { "lat": 40.75, "lng": -73.99 },
  "persist": true
}
```

- Loads the route's stops and the assigned vehicle's `seatCapacity`.
- Runs the optimizer and, when `persist` is true, rewrites `route_stops.sequence` and the route's `total_distance_m` / `estimated_duration_s`.
- Records a `route.optimize` audit entry.

**Response**

```json
{
  "data": {
    "routes": [{ "order": ["stopId", "..."], "totalDistanceM": 12000, "estimatedDurationS": 1100, "totalDemand": 12 }],
    "totalDistanceM": 12000,
    "estimatedDurationS": 1100,
    "computeMs": 18,
    "usedLiveDistances": false
  }
}
```

---

## Guarantees & Targets

| Property | Guarantee |
|----------|-----------|
| Seat capacity | No route's `totalDemand` exceeds vehicle capacity |
| Coverage | Every stop appears exactly once |
| Performance | < 2s for 50 stops (see `optimizer.test.ts`) |
| Determinism | Same input → same output (stable sort, no randomness) |

Live distances match Google Maps within API tolerance; fallback estimates are approximate and flagged via `usedLiveDistances: false`.

---

## Map UI

| Component | Role |
|-----------|------|
| `GoogleMapsLoader` | Loads the Maps JS SDK once; exposes `useGoogleMaps()` |
| `LocationPicker` | Click/drag to pick coordinates; numeric fallback when Maps is unavailable |

---

## Related

- [Core APIs](../api/API.md)
- [Architecture tech stack](../architecture/tech-stack.md)
- [Package source](../../packages/routing/src)
