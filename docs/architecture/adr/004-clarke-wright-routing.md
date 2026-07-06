# ADR-004: Use Clarke-Wright + 2-opt for Route Optimization

**Status:** Accepted  
**Date:** 2026-06-29

## Context

Route optimization is a core differentiator ([differentiators](../../research/differentiators.md)). Admins need capacity-feasible stop order with distance estimates in < 2s for 50 stops ([NFR-P01](../../requirements/non-functional-requirements.md)). Alternatives include manual ordering only, commercial VRP solvers, ML-based routing, or Google Routes API optimization.

## Decision

Implement in `packages/routing`:

1. **Google Maps Distance Matrix API** for pairwise travel times/distances
2. **LRU cache** (`distance-cache.ts`) to reduce API cost and latency on repeat edits
3. **Clarke-Wright Savings Algorithm** to build initial routes respecting vehicle capacity
4. **2-opt local search** to shorten routes after Clarke-Wright
5. Expose via `route-optimizer.ts` and `POST /api/routes/optimize`

Admins may override optimized order before saving. No black-box ML in v1.

## Consequences

### Positive

- Explainable output — admins trust reorder they can understand
- No ML training data required at launch
- Runs entirely in Node on Vercel within serverless timeout for ≤ 50 stops
- Differentiates from parent-only apps without optimization

### Negative

- Heuristic may lose to human local knowledge on irregular roads
- Quality depends on Distance Matrix accuracy ([assumption A7](../../discovery/assumptions-and-risks.md))
- Google API cost scales with stop count; cache hygiene required

### Neutral

- Exact VRP or OR-Tools integration deferred unless blind review fails pilot routes
- Directions API used for map display, not core solver input
