import type { DistanceMatrix } from './types';

export interface VrpStop {
  /** Matrix index (1..N); 0 is the depot. */
  index: number;
  demand: number;
}

/**
 * Clarke-Wright Savings algorithm for the capacitated VRP.
 * Returns routes as ordered lists of matrix indices (excluding the depot).
 */
export function clarkeWrightSavings(
  matrix: DistanceMatrix,
  stops: VrpStop[],
  capacity: number
): number[][] {
  const { distancesM } = matrix;
  const depot = 0;

  // Start with one route per stop: depot -> i -> depot.
  const routeOf = new Map<number, number[]>();
  const load = new Map<number, number>();
  for (const s of stops) {
    routeOf.set(s.index, [s.index]);
    load.set(s.index, s.demand);
  }

  // Savings for every stop pair.
  const savings: { i: number; j: number; value: number }[] = [];
  for (let a = 0; a < stops.length; a += 1) {
    for (let b = a + 1; b < stops.length; b += 1) {
      const i = stops[a].index;
      const j = stops[b].index;
      const value = distancesM[depot][i] + distancesM[depot][j] - distancesM[i][j];
      savings.push({ i, j, value });
    }
  }
  savings.sort((x, y) => y.value - x.value);

  const routeKey = (node: number): number[] | undefined => routeOf.get(node);

  for (const { i, j } of savings) {
    const routeI = routeKey(i);
    const routeJ = routeKey(j);
    if (!routeI || !routeJ || routeI === routeJ) continue;

    // Merge only if i is at the end of its route and j at the start (or symmetric).
    const iAtEnd = routeI[routeI.length - 1] === i;
    const jAtStart = routeJ[0] === j;
    const iAtStart = routeI[0] === i;
    const jAtEnd = routeJ[routeJ.length - 1] === j;

    let merged: number[] | null = null;
    if (iAtEnd && jAtStart) merged = [...routeI, ...routeJ];
    else if (jAtEnd && iAtStart) merged = [...routeJ, ...routeI];
    else if (iAtEnd && jAtEnd) merged = [...routeI, ...[...routeJ].reverse()];
    else if (iAtStart && jAtStart) merged = [...[...routeI].reverse(), ...routeJ];

    if (!merged) continue;

    const mergedLoad = (load.get(routeI[0]) ?? 0) + (load.get(routeJ[0]) ?? 0);
    if (mergedLoad > capacity) continue;

    // Commit merge: every node in the merged route points to the same array.
    for (const node of merged) {
      routeOf.set(node, merged);
      load.set(node, mergedLoad);
    }
  }

  // Deduplicate route arrays by identity.
  const seen = new Set<number[]>();
  const result: number[][] = [];
  for (const route of routeOf.values()) {
    if (seen.has(route)) continue;
    seen.add(route);
    result.push(route);
  }
  return result;
}
