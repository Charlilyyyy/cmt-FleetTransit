import { LruCache, pairKey } from './distance-cache';
import type { DistanceMatrix, LatLng } from './types';

const EARTH_RADIUS_M = 6_371_000;
/** Rough urban driving speed for haversine-based duration estimates. */
const FALLBACK_SPEED_MPS = 11; // ~40 km/h
/** Road distances exceed straight-line; inflate haversine to approximate driving. */
const ROAD_FACTOR = 1.3;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export interface DistanceProviderOptions {
  apiKey?: string;
  cache?: LruCache<{ distanceM: number; durationS: number }>;
  /** Override fetch for testing. */
  fetchImpl?: typeof fetch;
}

/**
 * Builds an N×N distance/duration matrix. Uses the Google Distance Matrix API
 * when an API key is present, otherwise falls back to a cached haversine estimate.
 * Index 0 is the depot; indices 1..N are the stops in input order.
 */
export class DistanceCalculator {
  private cache: LruCache<{ distanceM: number; durationS: number }>;

  constructor(private readonly options: DistanceProviderOptions = {}) {
    this.cache = options.cache ?? new LruCache(5000);
  }

  private estimate(a: LatLng, b: LatLng): { distanceM: number; durationS: number } {
    const straight = haversineMeters(a, b);
    const distanceM = Math.round(straight * ROAD_FACTOR);
    return { distanceM, durationS: Math.round(distanceM / FALLBACK_SPEED_MPS) };
  }

  private cached(a: LatLng, b: LatLng): { distanceM: number; durationS: number } {
    if (a.lat === b.lat && a.lng === b.lng) return { distanceM: 0, durationS: 0 };
    const key = pairKey(a, b);
    const hit = this.cache.get(key);
    if (hit) return hit;
    const value = this.estimate(a, b);
    this.cache.set(key, value);
    return value;
  }

  async buildMatrix(points: LatLng[]): Promise<DistanceMatrix> {
    const apiKey = this.options.apiKey ?? process.env.GOOGLE_MAPS_SERVER_KEY;
    if (apiKey) {
      try {
        return await this.buildLiveMatrix(points, apiKey);
      } catch (error) {
        console.error('Distance Matrix API failed, using fallback:', error);
      }
    }
    return this.buildFallbackMatrix(points);
  }

  private buildFallbackMatrix(points: LatLng[]): DistanceMatrix {
    const n = points.length;
    const distancesM = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    const durationsS = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        if (i === j) continue;
        const { distanceM, durationS } = this.cached(points[i], points[j]);
        distancesM[i][j] = distanceM;
        durationsS[i][j] = durationS;
      }
    }
    return { distancesM, durationsS, live: false };
  }

  private async buildLiveMatrix(points: LatLng[], apiKey: string): Promise<DistanceMatrix> {
    const doFetch = this.options.fetchImpl ?? fetch;
    const coords = points.map((p) => `${p.lat},${p.lng}`).join('|');
    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${coords}` +
      `&destinations=${coords}&mode=driving&key=${apiKey}`;

    const res = await doFetch(url);
    if (!res.ok) throw new Error(`Distance Matrix HTTP ${res.status}`);
    const json = (await res.json()) as {
      status: string;
      rows: { elements: { status: string; distance?: { value: number }; duration?: { value: number } }[] }[];
    };
    if (json.status !== 'OK') throw new Error(`Distance Matrix status ${json.status}`);

    const n = points.length;
    const distancesM = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    const durationsS = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    json.rows.forEach((row, i) => {
      row.elements.forEach((el, j) => {
        if (i === j) return;
        if (el.status === 'OK' && el.distance && el.duration) {
          distancesM[i][j] = el.distance.value;
          durationsS[i][j] = el.duration.value;
        } else {
          const fallback = this.estimate(points[i], points[j]);
          distancesM[i][j] = fallback.distanceM;
          durationsS[i][j] = fallback.durationS;
        }
      });
    });
    return { distancesM, durationsS, live: true };
  }
}
