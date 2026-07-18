import { describe, expect, it } from 'vitest';

import { haversineMeters } from './distance-calculator';
import { RouteOptimizer } from './optimizer';
import type { OptimizeStop } from './types';

const depot = { lat: 40.75, lng: -73.99 };

function grid(n: number): OptimizeStop[] {
  const stops: OptimizeStop[] = [];
  for (let i = 0; i < n; i += 1) {
    stops.push({
      id: `s${i}`,
      lat: depot.lat + (i % 5) * 0.01,
      lng: depot.lng + Math.floor(i / 5) * 0.01,
      demand: 1,
    });
  }
  return stops;
}

describe('RouteOptimizer', () => {
  it('returns no routes for empty input', async () => {
    const result = await new RouteOptimizer().optimize({
      depot,
      stops: [],
      vehicleCapacity: 10,
    });
    expect(result.routes).toHaveLength(0);
  });

  it('respects vehicle seat capacity', async () => {
    const stops = grid(12);
    const capacity = 4;
    const result = await new RouteOptimizer().optimize({ depot, stops, vehicleCapacity: capacity });
    for (const route of result.routes) {
      expect(route.totalDemand).toBeLessThanOrEqual(capacity);
    }
    const visited = result.routes.flatMap((r) => r.order);
    expect(new Set(visited).size).toBe(stops.length);
  });

  it('optimizes 50 stops under 2 seconds', async () => {
    const stops = grid(50);
    const result = await new RouteOptimizer().optimize({ depot, stops, vehicleCapacity: 15 });
    expect(result.computeMs).toBeLessThan(2000);
    expect(result.routes.length).toBeGreaterThan(0);
  });

  it('haversine distance is symmetric and zero on identity', () => {
    expect(haversineMeters(depot, depot)).toBe(0);
    const a = { lat: 40.7, lng: -74 };
    const b = { lat: 40.8, lng: -73.9 };
    expect(Math.abs(haversineMeters(a, b) - haversineMeters(b, a))).toBeLessThan(1e-6);
  });
});
