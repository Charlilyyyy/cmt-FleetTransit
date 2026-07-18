import { clarkeWrightSavings, type VrpStop } from './clarke-wright';
import { DistanceCalculator, type DistanceProviderOptions } from './distance-calculator';
import { routeDistance, twoOptImprove } from './two-opt';
import type { LatLng, OptimizeRequest, OptimizeResult, OptimizedRoute } from './types';

/**
 * End-to-end route optimizer:
 *   1. Build a distance matrix (live Google or haversine fallback).
 *   2. Cluster stops into capacity-feasible routes via Clarke-Wright savings.
 *   3. Refine each route order with 2-opt.
 */
export class RouteOptimizer {
  private calculator: DistanceCalculator;

  constructor(options: DistanceProviderOptions = {}) {
    this.calculator = new DistanceCalculator(options);
  }

  async optimize(request: OptimizeRequest): Promise<OptimizeResult> {
    const start = Date.now();
    const { depot, stops, vehicleCapacity } = request;

    if (stops.length === 0) {
      return {
        routes: [],
        totalDistanceM: 0,
        estimatedDurationS: 0,
        computeMs: Date.now() - start,
        usedLiveDistances: false,
      };
    }

    const points: LatLng[] = [depot, ...stops];
    const matrix = await this.calculator.buildMatrix(points);

    const vrpStops: VrpStop[] = stops.map((s, idx) => ({
      index: idx + 1,
      demand: Math.max(1, s.demand ?? 1),
    }));

    const rawRoutes = clarkeWrightSavings(matrix, vrpStops, vehicleCapacity);

    const demandByIndex = new Map(vrpStops.map((s) => [s.index, s.demand]));
    const idByIndex = new Map(stops.map((s, idx) => [idx + 1, s.id]));

    let totalDistanceM = 0;
    let totalDurationS = 0;

    const routes: OptimizedRoute[] = rawRoutes.map((indices) => {
      const improved = twoOptImprove(matrix, indices);
      const distanceM = routeDistance(matrix, improved);
      const durationS = routeDurationSeconds(matrix.durationsS, improved);
      const totalDemand = improved.reduce((sum, i) => sum + (demandByIndex.get(i) ?? 0), 0);
      totalDistanceM += distanceM;
      totalDurationS += durationS;
      return {
        order: improved.map((i) => idByIndex.get(i) ?? String(i)),
        totalDistanceM: Math.round(distanceM),
        estimatedDurationS: Math.round(durationS),
        totalDemand,
      };
    });

    // Longest-first for predictable dispatch ordering.
    routes.sort((a, b) => b.totalDistanceM - a.totalDistanceM);

    return {
      routes,
      totalDistanceM: Math.round(totalDistanceM),
      estimatedDurationS: Math.round(totalDurationS),
      computeMs: Date.now() - start,
      usedLiveDistances: matrix.live,
    };
  }
}

function routeDurationSeconds(durations: number[][], route: number[]): number {
  if (route.length === 0) return 0;
  let total = durations[0][route[0]];
  for (let i = 0; i < route.length - 1; i += 1) {
    total += durations[route[i]][route[i + 1]];
  }
  total += durations[route[route.length - 1]][0];
  return total;
}
