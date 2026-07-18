import type { DistanceMatrix } from './types';

const DEPOT = 0;

/** Total distance of depot -> route -> depot. */
export function routeDistance(matrix: DistanceMatrix, route: number[]): number {
  const { distancesM } = matrix;
  if (route.length === 0) return 0;
  let total = distancesM[DEPOT][route[0]];
  for (let i = 0; i < route.length - 1; i += 1) {
    total += distancesM[route[i]][route[i + 1]];
  }
  total += distancesM[route[route.length - 1]][DEPOT];
  return total;
}

/**
 * 2-opt local search: repeatedly reverse route segments while it shortens the
 * tour. Converges to a 2-opt local optimum. Runs in O(n^2) per pass.
 */
export function twoOptImprove(matrix: DistanceMatrix, route: number[], maxPasses = 20): number[] {
  if (route.length < 4) return route;
  let best = [...route];
  let bestDistance = routeDistance(matrix, best);
  let improved = true;
  let passes = 0;

  while (improved && passes < maxPasses) {
    improved = false;
    passes += 1;
    for (let i = 0; i < best.length - 1; i += 1) {
      for (let k = i + 1; k < best.length; k += 1) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, k + 1).reverse(),
          ...best.slice(k + 1),
        ];
        const candidateDistance = routeDistance(matrix, candidate);
        if (candidateDistance < bestDistance - 1e-6) {
          best = candidate;
          bestDistance = candidateDistance;
          improved = true;
        }
      }
    }
  }
  return best;
}
